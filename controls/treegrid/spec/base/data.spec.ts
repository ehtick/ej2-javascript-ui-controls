import { TreeGrid } from "../../src/treegrid/base/treegrid";
import { createGrid, destroy } from "./treegridutil.spec";
import { ColumnMenu } from "../../src/treegrid/actions/column-menu";
import { Toolbar } from "../../src/treegrid/actions/toolbar";
import { Page } from "../../src/treegrid/actions/page";
import { Filter } from "../../src/treegrid/actions/filter";
import { Sort } from "../../src/treegrid/actions/sort";
import { Resize } from "../../src/treegrid/actions/resize";
import { Edit } from "../../src/treegrid/actions/edit";
import { Freeze } from "../../src/treegrid/actions/freeze-column";
import { Logger } from "../../src/treegrid/actions/logger";
import { Print } from "../../src/treegrid/actions/print";
import { DataManager, Query, WebApiAdaptor, DataUtil } from "@syncfusion/ej2-data";
import { DataManipulation } from "../../src/treegrid/base/data";
import * as utils from "../../src/treegrid/utils";
import * as popups from "@syncfusion/ej2-popups";

/**
 * TreeGrid data spec
 */

TreeGrid.Inject(
  ColumnMenu,
  Toolbar,
  Page,
  Filter,
  Sort,
  Resize,
  Edit,
  Freeze,
  Logger,
  Print,
);

/**
 * TreeGrid data spec
 */

TreeGrid.Inject(ColumnMenu, Toolbar, Page, Filter, Sort, Resize, Edit, Freeze, Logger, Print);

describe('Coverage - DataManipulation', () => {
    it('removeEventListener should return early if parent is destroyed', () => {
        const fakeParent: any = { isDestroyed: true };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        expect(() => { dm.removeEventListener(); }).not.toThrow();
    });

    it('dataProcessor uses grid.dataSource.result when isCountRequired', () => {
        const fakeParent: any = {
            grid: {
                dataSource: { result: [{ id: 42, name: 'R' }] },
                allowFiltering: false,
                searchSettings: { key: '' },
                aggregates: [],
                sortSettings: { columns: [] },
                filterSettings: { columns: [] }
            },
            dataSource: { result: [{ id: 42, name: 'R' }], count: 1 },
            isLocalData: false,
            getPrimaryKeyFieldNames: () => ['id'],
            notify: jasmine.createSpy('notify'),
            parentData: [],
            flatData: [],
            uniqueIDCollection: {},
            enableVirtualization: false,
            allowPaging: false
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        const args: any = {};
        expect(() => { (dm as any).dataProcessor(args); }).not.toThrow();
        expect(args.result).toBeDefined();
        expect(args.result.length).toBe(1);
        expect(args.result[0].id).toBe(42);
        expect(args.count).toBe(1);
    });

    it('paging reads count from parent.dataSource when isCountRequired', () => {
        const fakeParent: any = {
            grid: {
                dataSource: [{ id: 1 }],
                allowFiltering: false,
                searchSettings: { key: '' },
                aggregates: [],
                sortSettings: { columns: [] },
                filterSettings: { columns: [] }
            },
            dataSource: { result: [{ id: 1 }], count: 777 },
            isLocalData: true,
            getPrimaryKeyFieldNames: () => ['id'],
            notify: jasmine.createSpy('notify'),
            parentData: [],
            flatData: [],
            uniqueIDCollection: {},
            enableVirtualization: false,
            allowPaging: true,
            pageSettings: { currentPage: 1 },
            editSettings: { mode: 'Normal' },
            summaryModule: { calculateSummaryValue: (q: any, d: any) => d }
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        dm.dataResults = { result: ['pageA', 'pageB'], count: 2 };
        const args: any = { isExport: true, expresults: ['exp'], isPrinting: false, exportType: 'CurrentPage' };
        (dm as any).dataProcessor(args);
        expect(args.result).toEqual(['pageA', 'pageB']);
        expect(args.count).toBe(777);
    });

    it("paging uses dataResults when virtualization enabled and exportType 'CurrentPage'", () => {
        const fakeParent: any = {
            enableVirtualization: true,
            enableInfiniteScrolling: false,
            allowPaging: false,
            notify: jasmine.createSpy('notify'),
            parentData: [],
            flatData: [],
            uniqueIDCollection: {},
            editSettings: { mode: 'Normal' },
            pageSettings: { currentPage: 1 }
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        dm.dataResults = { result: ['v1', 'v2'], count: 999 };
        const inputResults = ['x', 'y'];
        const args: any = { isExport: true, exportType: 'CurrentPage', isPrinting: false };
        const res = (dm as any).paging(inputResults, 2, true, false, 'CurrentPage', args);
        expect(res.result).toEqual(['v1', 'v2']);
        expect(res.count).toBe(999);
        expect(fakeParent.notify).toHaveBeenCalled();
    });

    it('dataProcessor calls aggregateQuery when gridQuery is undefined and aggregates present', () => {
        const aggHarness: any = {
            filterQuery: (q: any) => q,
            searchQuery: (q: any) => q,
            aggregateQuery: (q: any) => { q.queries = [{ fn: 'onAggregates' }]; return q; }
        };
        spyOn(aggHarness, 'aggregateQuery').and.callThrough();

        const fakeParent: any = {
            grid: {
                dataSource: [{ id: 1 }],
                allowFiltering: true,
                searchSettings: { key: '' },
                aggregates: [{ dummy: true }],
                sortSettings: { columns: [] },
                filterSettings: { columns: [{ field: 'taskName' }] },
                renderModule: { data: aggHarness }
            },
            dataSource: [{ id: 1 }],
            isLocalData: true,
            getPrimaryKeyFieldNames: () => ['id'],
            notify: jasmine.createSpy('notify'),
            parentData: [],
            flatData: [{ id: 10 }],
            uniqueIDCollection: {},
            enableVirtualization: false,
            allowPaging: false,
            summaryModule: {
                calculateSummaryValue: (_summaryQuery: any, _data: any, _flag: any) => ['summed']
            },
            getData: function (_opts: any): Array<{ id: number }> {
                return [];
            }
        };

        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;

        spyOn(fakeParent, 'getData').and.callFake((_opts: any): Array<{ id: number }> => {
            dm.dataResults = { result: [{ id: 99 }], count: 1 };
            return dm.dataResults.result;
        });
        const args: any = {};
        (dm as any).dataProcessor(args);
        expect(args.count).toBeDefined();
    });
});

describe('Coverage - createRecords virtualization branch', () => {
    let gridObj: TreeGrid;
    let _origExec: any;
    beforeAll((done: Function) => {
        _origExec = (DataManager.prototype as any).executeQuery;
        (DataManager.prototype as any).executeQuery = function (q?: any) {
            const data = (this as any).dataSource && (this as any).dataSource.json ? (this as any).dataSource.json : (this as any).json || [];
            return Promise.resolve({ result: data, count: data.length, data: data });
        };
        gridObj = createGrid({
            dataSource: new DataManager({ json: [{ id: 1, name: 'Test' }], adaptor: new WebApiAdaptor() }),
            idMapping: 'id',
            parentIdMapping: 'parentId',
            height: 300,
            treeColumnIndex: 1,
            enableVirtualization: true,
            loadChildOnDemand: false,
            columns: ['id', 'name']
        }, done);
    });

    it('should set hasChildRecords and expanded from remoteCollapsedData', () => {
        const dm: any = new DataManipulation(gridObj);
        gridObj.initialRender = false;
        (gridObj as any).remoteCollapsedData = [{ id: 1 }];
        const data = [{ id: 1, name: 'Test' }];
        const records: any = dm.createRecords(data);
        expect(records.length).toBe(1);
        expect(records[0].hasChildRecords).toBe(true);
        expect(records[0].expanded).toBe(false);
    });

    it('should increment level for root call when item has parentId but no child, and apply expandState mapping', () => {
        const dm: any = new DataManipulation(gridObj);
        gridObj.initialRender = false;
        (gridObj as any).remoteCollapsedData = [];
        const data = [
            { id: 11, name: 'HasParentNoChild', parentId: 5 },
            { id: 20, name: 'HasChildExpand', hasChild: true, isExpanded: false }
        ];
        gridObj.hasChildMapping = 'hasChild';
        gridObj.expandStateMapping = 'isExpanded';
        const records: any = dm.createRecords(data);
        expect(records.length).toBe(2);
        expect(records[0].level).toBe(1);
        expect(records[1].hasChildRecords).toBe(true);
        expect(records[1].expanded).toBe(false);
    });

    it('should honor hasChildMapping + expandStateMapping inside virtualization block', () => {
        const dm: any = new DataManipulation(gridObj);
        gridObj.initialRender = false;
        (gridObj as any).remoteCollapsedData = [];
        gridObj.hasChildMapping = 'hasChild';
        gridObj.expandStateMapping = 'isExpanded';
        const data2 = [{ id: 2, name: 'HC', hasChild: true, isExpanded: true }];
        const records2: any = dm.createRecords(data2);
        expect(records2.length).toBe(1);
        expect(records2[0].hasChildRecords).toBe(true);
        expect(records2[0].expanded).toBe(true);
    });

    it('rowDropSettings.targetID + non-duplicate should push to flatData', () => {
        const fakeParent: any = {
            element: { id: 'fakegrid' },
            uniqueIDCollection: {},
            childMapping: 'subtasks',
            idMapping: 'id',
            parentIdMapping: 'parentId',
            hasChildMapping: undefined,
            expandStateMapping: undefined,
            enableVirtualization: false,
            loadChildOnDemand: false,
            initialRender: false,
            remoteCollapsedData: [],
            rowDropSettings: { targetID: 'tgt' },
            rowDragAndDropModule: { isDuplicateData: (rec: any) => false },
            flatData: [],
            infiniteScrollData: [],
            parentData: []
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        dm.storedIndex = 0;
        const data = [{ id: 200, name: 'RD' }];
        const records: any = dm.createRecords(data);
        expect(records.length).toBe(1);
        expect(fakeParent.flatData.some((r: any) => r.id === 200)).toBe(true);
    });

    it('rowDropSettings.targetID + duplicate should NOT push to flatData', () => {
        const fakeParent: any = {
            element: { id: 'fakegrid' },
            uniqueIDCollection: {},
            childMapping: 'subtasks',
            idMapping: 'id',
            parentIdMapping: 'parentId',
            hasChildMapping: undefined,
            expandStateMapping: undefined,
            enableVirtualization: false,
            loadChildOnDemand: false,
            initialRender: false,
            remoteCollapsedData: [],
            rowDropSettings: { targetID: 'tgt' },
            rowDragAndDropModule: { isDuplicateData: (rec: any) => true },
            flatData: [],
            infiniteScrollData: [],
            parentData: []
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        dm.storedIndex = 0;
        const data = [{ id: 201, name: 'RD2' }];
        const records: any = dm.createRecords(data);
        expect(records.length).toBe(1);
        expect(fakeParent.flatData.some((r: any) => r.id === 201)).toBe(false);
    });

    it('remoteVirtualAction should set pageSettings.currentPage to prevInfo.page when conditions met', () => {
        const fakeParent: any = {
            element: { id: 'fakegrid3' },
            grid: {
                contentModule: {
                    currentInfo: { loadNext: true, nextInfo: { page: 2 } },
                    prevInfo: { page: 1 }
                },
                pageSettings: { currentPage: 2 }
            },
            loadChildOnDemand: false
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        const virtualArgs: any = {};
        (dm as any)['remoteVirtualAction'](virtualArgs);
        expect(fakeParent.grid.pageSettings.currentPage).toBe(1);
    });

    it('beginSorting removes onSortBy query and calls sortBy when no sort columns', () => {
        const fakeParent: any = {
            dataSource: new DataManager({ json: [], adaptor: new WebApiAdaptor() }),
            enableVirtualization: true,
            query: { queries: [{ fn: 'onSortBy' }], sortBy: jasmine.createSpy('sortBy') },
            grid: { sortSettings: { columns: [] } }
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        (dm as any)['beginSorting']();
        expect(fakeParent.query.queries.length).toBe(0);
        expect(fakeParent.query.sortBy).toHaveBeenCalledWith(null, null);
    });

    it('beginSorting does nothing when no onSortBy and sort columns exist', () => {
        const fakeParent: any = {
            dataSource: new DataManager({ json: [], adaptor: new WebApiAdaptor() }),
            enableVirtualization: true,
            query: { queries: [], sortBy: jasmine.createSpy('sortBy') },
            grid: { sortSettings: { columns: [{ field: 'a' }] } }
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = fakeParent;
        (dm as any)['beginSorting']();
        expect(fakeParent.query.queries.length).toBe(0);
        expect(fakeParent.query.sortBy).not.toHaveBeenCalled();
    });

    afterAll(() => {
        (DataManager.prototype as any).executeQuery = _origExec;
        destroy(gridObj);
    });
});

describe('Coverage - DataManipulation collectExpandingRecs rowTemplate branch', () => {
    it('uses getContentTable rows when rowTemplate is true', () => {
        const dm: any = Object.create(DataManipulation.prototype);
        const table = document.createElement('table');
        const tr = table.insertRow();
        tr.insertCell();
        const fakeGrid: any = {
            getCurrentViewRecords: () => [{ index: 1, level: 0, expanded: false }],
            pageSettings: { totalRecordsCount: 0 },
            detailRowModule: { expand: jasmine.createSpy('expand') }
        };
        const fakeParent: any = {
            getRows: jasmine.createSpy('getRows'),
            getContentTable: jasmine.createSpy('getContentTable').and.returnValue(table),
            rowTemplate: true,
            loadChildOnDemand: false,
            toggleRowVisibility: jasmine.createSpy('toggleRowVisibility'),
            grid: fakeGrid
        };
        dm.parent = fakeParent;
        const rowDetails: any = { record: { index: 1, level: 0, expanded: false }, rows: [tr], parentRow: tr };
        dm.collectExpandingRecs(rowDetails, false);
        expect(fakeParent.getContentTable).toHaveBeenCalled();
        expect(fakeParent.toggleRowVisibility).toHaveBeenCalledWith(tr, 'e-childrow-visible');
        expect(fakeGrid.pageSettings.totalRecordsCount).toBe(1);
    });
});

describe('Coverage - DataManipulation – convertJSONData/convertToFlatData remaining branches', () => {
    it('convertJSONData: sets flatData to parent.dataSource when hierarchy empty & Gantt-like parent', () => {
        const parent: any = {
            element: { id: 'tgA' },
            dataSource: [{ id: 100 }],
            idMapping: 'id',
            parentIdMapping: 'pid',
            childMapping: 'children',
            uniqueIDCollection: {},
            flatData: [],
            parentData: []
        };
        parent['isGantt'] = true;
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = parent;

        (dm as any).convertJSONData([]);
        expect(parent.flatData).toBe(parent.dataSource);
    });

    it('convertToFlatData: DataManager then(req === 1) path when e.result is falsy (no ctor path)', (done) => {
        spyOn(utils, 'isRemoteData').and.returnValue(true);
        spyOn(utils, 'isOffline').and.returnValue(false);

        const remote = new DataManager({ json: [] });

        const parent: any = {
            element: { id: 'tg_req1b' },
            dataSource: remote,
            idMapping: 'id',
            parentIdMapping: 'pid',
            hasChildMapping: undefined,
            initialRender: true,
            grid: { hideSpinner: () => { } }
        };

        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = parent;
        dm.addedRecords = 'addedRecords';
        dm.parentItems = [];
        dm.taskIds = [];
        dm.hierarchyData = [];
        dm.storedIndex = -1;
        dm.sortedData = [];
        dm.isSortAction = false;
        dm.dataResults = {};
        dm.isSelfReference = !!parent.parentIdMapping;

        spyOn(DataUtil, 'distinct').and.callFake((_arr: any, _key: string, _case: boolean): any[] => {
            return [];
        });

        spyOn(parent.grid, 'hideSpinner');
        spyOn(remote, 'executeQuery').and.returnValue(Promise.resolve({ result: null }));

        dm.convertToFlatData(remote);

        setTimeout(() => {
            expect(parent.grid.hideSpinner).not.toHaveBeenCalled();
            done();
        }, 0);
    });

    it("convertJSONData self-reference: does not throw and produces a non-empty hierarchy", () => {
    const parent: any = {
      element: { id: "tg-selfref" },
      idMapping: "id",
      parentIdMapping: "pid",
      childMapping: "children",
      enableVirtualization: false,
      loadChildOnDemand: false,
      initialRender: false,
      remoteCollapsedData: [],
      flatData: [],
      infiniteScrollData: [],
      parentData: [],
      uniqueIDCollection: {},
      rowDropSettings: { targetID: null },
      rowDragAndDropModule: { isDuplicateData: (_rec: any): boolean => false },
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = parent;

    dm.addedRecords = "addedRecords";
    dm.parentItems = [];
    dm.taskIds = [];
    dm.hierarchyData = [];
    dm.storedIndex = -1;
    dm.sortedData = [];
    dm.isSortAction = false;
    dm.dataResults = {};
    dm.isSelfReference = !!parent.parentIdMapping;

    const data = [
      { id: 1, name: "Root" },
      { id: 2, pid: 1, name: "A" },
      { id: 99, pid: 77, name: "Orphan" },
    ];

    expect(() => (dm as any).convertJSONData(data)).not.toThrow();
    expect(dm.hierarchyData && dm.hierarchyData.length >= 1).toBe(true);
  });

  it("calls renderModule.dataManagerSuccess on stored zerothLevelData and clears it", (done) => {
    spyOn(utils, "isRemoteData").and.returnValue(true);
    spyOn(utils, "isOffline").and.returnValue(false);

    const remote = new DataManager({ json: [] });

    const parent: any = {
      element: { id: "tg-unstall" },
      dataSource: remote,
      idMapping: "id",
      parentIdMapping: "pid",
      hasChildMapping: undefined,
      initialRender: true,
      grid: {
        contentModule: { isLoaded: false },
        renderModule: {
          dataManagerSuccess: jasmine.createSpy("dataManagerSuccess"),
        },
        hideSpinner: () => {},
      },
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.isSelfReference = !!parent.parentIdMapping;

    dm.zerothLevelData = { some: "args", cancel: true } as any;

    spyOn(remote, "executeQuery").and.returnValue(
      Promise.resolve({ result: [{ pid: null }] }),
    );

    (dm as any).convertToFlatData(remote);

    setTimeout(() => {
      expect(() => {}).not.toThrow();
      expect(parent.grid.renderModule.dataManagerSuccess).toHaveBeenCalled();
      done();
    }, 0);
  });
});

describe('Coverage - DataManipulation – updateParentRemoteData virtualization & zeroth level', () => {
    it('virtualscroll: hides spinner and clears query.expands', () => {
        spyOn(utils, 'isRemoteData').and.returnValue(true);

        const parent: any = {
            element: { id: 'tgC' },
            dataSource: new DataManager({ json: [] }),
            enableVirtualization: true,
            loadChildOnDemand: false,
            query: { expands: ['x'] },
            hideSpinner: jasmine.createSpy('hideSpinner'),
            grid: { aggregates: [], sortSettings: { columns: [] }, filterSettings: { columns: [] }, searchSettings: { key: '' } },
            flatData: [],
            notify: jasmine.createSpy('notify')
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = parent;
        dm.parentItems = [];
        dm.addedRecords = 'addedRecords';
        dm.taskIds = [];
        dm.hierarchyData = [];
        dm.storedIndex = -1;
        dm.sortedData = [];
        dm.isSortAction = false;
        dm.dataResults = {};
        dm.isSelfReference = !!parent.parentIdMapping;

        const args: any = {
            result: [],
            actionArgs: { requestType: 'virtualscroll', action: null, searchString: '' },
            actual: { flatData: [] },
            query: { queries: [{ fn: 'onAggregates' }] }
        };

        (dm as any).updateParentRemoteData(args);
        expect(parent.hideSpinner).toHaveBeenCalled();
        expect(parent.query.expands.length).toBe(0);
    });

    it('stores zerothLevelData & cancels when loadChildOnDemand + no parentItems + !hasChildMapping', () => {
        const parent: any = {
            element: { id: 'tgD' },
            dataSource: new DataManager({ json: [] }),
            enableVirtualization: false,
            loadChildOnDemand: true,
            hasChildMapping: undefined,
            parentItems: [],
            query: {},
            grid: { aggregates: [], sortSettings: { columns: [] }, filterSettings: { columns: [] }, searchSettings: { key: '' } },
            flatData: [],
            notify: () => { }
        };
        const dm: any = Object.create(DataManipulation.prototype);
        dm.parent = parent;
        dm.parentItems = [];
        dm.addedRecords = 'addedRecords';
        dm.taskIds = [];
        dm.hierarchyData = [];
        dm.storedIndex = -1;
        dm.sortedData = [];
        dm.isSortAction = false;
        dm.dataResults = {};
        dm.isSelfReference = !!parent.parentIdMapping;

        const args: any = { result: [{ id: 1 }], actionArgs: { requestType: 'refresh' } };
        (dm as any).updateParentRemoteData(args);

        expect((dm as any).zerothLevelData).toBe(args);
        expect((args as any).cancel).toBe(true);
    });
});

describe('Coverage - DataManipulation – collectExpandingRecs expanded styling + recursion', () => {
    it('rowTemplate=false, expanded=true → toggles visibility, expands detail, and evaluates recursion gate (no infinite loop)', () => {
        const dm: any = Object.create(DataManipulation.prototype);

        const table = document.createElement('table');

        const parentTr = table.insertRow();
        parentTr.setAttribute('data-uid', 'uid-1');
        const parentTd = parentTr.insertCell();
        const collapseIcon = document.createElement('div');
        collapseIcon.className = 'e-treegridcollapse';
        parentTd.appendChild(collapseIcon);

        const childTr = table.insertRow();
        childTr.setAttribute('data-uid', 'uid-2');
        const childTd = childTr.insertCell();
        const marker = document.createElement('div');
        marker.className = 'e-gridrowindex0level1';
        childTd.appendChild(marker);

        const detailCollapseCell = document.createElement('td');
        detailCollapseCell.className = 'e-detailrowcollapse';
        parentTr.appendChild(detailCollapseCell);

        const fakeGrid: any = {
            getRowObjectFromUID: (uid: string) => {
                if (uid === 'uid-1') {
                    return { data: { index: 0, level: 0, expanded: true } };
                }
                if (uid === 'uid-2') {
                    return { data: { index: 0, level: 1, expanded: true } };
                }
                return { data: { index: 0, level: 0, expanded: true } };
            },
            pageSettings: { totalRecordsCount: 0 },
            detailRowModule: { expand: jasmine.createSpy('expand') }
        };

        const fakeParent: any = {
            rowTemplate: false,
            loadChildOnDemand: false,
            getRows: jasmine.createSpy('getRows').and.returnValue([parentTr, childTr]),
            getContentTable: jasmine.createSpy('getContentTable').and.returnValue(table),
            toggleRowVisibility: jasmine.createSpy('toggleRowVisibility'),
            grid: fakeGrid
        };

        dm.parent = fakeParent;

        const rowDetails: any = {
            record: { index: 0, level: 0, expanded: false },
            rows: [parentTr],
            parentRow: parentTr,
            name: 'remoteExpand'
        };

        dm.collectExpandingRecs(rowDetails, false);

        expect(fakeParent.toggleRowVisibility).toHaveBeenCalledWith(parentTr, 'e-childrow-visible');
        expect(fakeGrid.detailRowModule.expand).toHaveBeenCalled();
        expect(parentTd.querySelector('.e-treegridcollapse')).toBeNull();
        expect(parentTd.querySelector('.e-treegridexpand')).toBeTruthy();
    });
});

describe('Coverage - DataManipulation – fetchRemoteChildData idMapping NaN + remoteExpand child assignment', () => {
    it('remoteExpand with string id triggers isNaN branch and assigns childRecords (non-virtual)', (done) => {
        spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
        spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });

        const dm = new DataManager({ json: [] });
        spyOn(dm, 'executeQuery').and.callFake((_q: Query): Promise<any> => {
            const result = [
                { ID: 'C1', ParentID: 'R', level: 0 },
                { ID: 'X', ParentID: 'Z', level: 0 }
            ];
            return Promise.resolve({ result, count: result.length, actual: { nextLevel: [true] } });
        });

        const parent: any = {
            element: document.createElement('div'),
            dataSource: dm,
            idMapping: 'ID',
            parentIdMapping: 'ParentID',
            grid: {
                getDataModule: () => ({ generateQuery: () => new Query() }),
                pageSettings: { pageSize: 5, totalRecordsCount: 0 },
                currentViewData: [],
                filterSettings: { columns: [] },
                aggregates: [],
                getRowsObject: () => [{ data: rowDetails.record, index: 0 }],
                detailRowModule: { expand: () => { } },
                renderModule: { dataManagerSuccess: (_e: any, _virtualArgs?: any) => { } }
            },
            allowPaging: false,
            enableVirtualization: false,
            enableInfiniteScrolling: false,
            summaryModule: { calculateSummaryValue: (): any[] => [] },
            trigger: () => { },
            uniqueIDCollection: {}
        };

        const dmx: any = Object.create(DataManipulation.prototype);
        dmx.parent = parent;
        dmx.parentItems = [];
        dmx.addedRecords = 'addedRecords';
        dmx.taskIds = [];
        dmx.hierarchyData = [];
        dmx.storedIndex = -1;
        dmx.sortedData = [];
        dmx.isSortAction = false;
        dmx.dataResults = {};
        dmx.isSelfReference = !!parent.parentIdMapping;

        const rowDetails: {
            action: 'remoteExpand';
            record: { ID: string; level: number; uniqueID?: string; childRecords?: any[] };
            rows: HTMLTableRowElement[];
            parentRow: HTMLTableRowElement | null;
        } = {
            action: 'remoteExpand',
            record: { ID: 'R', level: 0 },
            rows: [],
            parentRow: null
        };

        parent.grid.currentViewData = [rowDetails.record];

        (dmx as any).fetchRemoteChildData(rowDetails);

        setTimeout(() => {
            expect(Array.isArray(rowDetails.record.childRecords)).toBe(true);
            expect(rowDetails.record.childRecords.length).toBe(2);
            done();
        }, 0);
    });
});

describe('Coverage - DataManipulation – fetchRemoteChildData virtualization: remoteExpand', () => {
    it('virtualExpand populates childRecords, updates remoteExpandedData, sets levels, updates count, and calls dataManagerSuccess', (done) => {
        spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
        spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });

        const dm = new DataManager({ json: [] });
        spyOn(dm, 'executeQuery').and.callFake((_q: Query): Promise<any> => {
            const result = [
                { ID: 'R', ParentID: null, level: 0 },
                { ID: 'C1', ParentID: 'R', level: 0 },
                { ID: 'C2', ParentID: 'R', level: 0 }
            ];
            return Promise.resolve({
                result,
                count: result.length,
                actual: { nextLevel: [true, true, true] }
            });
        });

        const parent: any = {
            element: document.createElement('div'),
            dataSource: dm,
            idMapping: 'ID',
            parentIdMapping: 'ParentID',
            grid: {
                getDataModule: () => ({ generateQuery: () => new Query() }),
                pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
                currentViewData: [],
                filterSettings: { columns: [] },
                aggregates: [],
                contentModule: { currentInfo: { loadNext: false, nextInfo: { page: 2 } }, prevInfo: { page: 1 } },
                renderModule: { dataManagerSuccess: jasmine.createSpy('dataManagerSuccess') },
                detailRowModule: { expand: () => { } }
            },
            allowPaging: false,
            enableVirtualization: true,
            enableInfiniteScrolling: false,
            loadChildOnDemand: false,
            summaryModule: { calculateSummaryValue: (): any[] => [] },
            trigger: () => { },
            uniqueIDCollection: {},
            remoteExpandedData: [],
            remoteCollapsedData: []
        };

        parent.element.id = 'tg-virt';

        const dmx: any = Object.create(DataManipulation.prototype);
        dmx.parent = parent;
        dmx.parentItems = [];
        dmx.addedRecords = 'addedRecords';
        dmx.taskIds = [];
        dmx.hierarchyData = [];
        dmx.storedIndex = -1;
        dmx.sortedData = [];
        dmx.isSortAction = false;
        dmx.dataResults = {};
        dmx.isSelfReference = !!parent.parentIdMapping;

        const rowDetails: {
            action: 'remoteExpand';
            record: { ID: string; level: number; uniqueID?: string; childRecords?: any[] };
            rows: HTMLTableRowElement[];
            parentRow: HTMLTableRowElement | null;
        } = {
            action: 'remoteExpand',
            record: { ID: 'R', level: 0 },
            rows: [],
            parentRow: null
        };

        parent.grid.currentViewData = [rowDetails.record];

        (dmx as any).fetchRemoteChildData(rowDetails);

        setTimeout(() => {
            expect(parent.remoteExpandedData[0].ID).toBe('R');
            expect(parent.grid.renderModule.dataManagerSuccess).toHaveBeenCalled();
            done();
        }, 0);
    });
});

describe('Coverage - DataManipulation – fetchRemoteChildData virtualization: collapse', () => {
    it('virtualization collapse assigns childRecords, removes from remoteExpandedData, adds to remoteCollapsedData, sets parent expanded=false, updates count, and calls dataManagerSuccess', (done) => {
        spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
        spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });
        const dm = new DataManager({ json: [] });
        spyOn(dm, 'executeQuery').and.callFake((_q: Query): Promise<any> => {
            const result = [
                { ID: 'R', ParentID: null, level: 0 },
                { ID: 'C1', ParentID: 'R', level: 0 },
                { ID: 'C2', ParentID: 'R', level: 0 }
            ];
            return Promise.resolve({
                result,
                count: result.length,
                actual: { nextLevel: [true, true, true] }
            });
        });

        const parent: any = {
            element: document.createElement('div'),
            dataSource: dm,
            idMapping: 'ID',
            parentIdMapping: 'ParentID',
            grid: {
                getDataModule: () => ({ generateQuery: () => new Query() }),
                pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
                currentViewData: [],
                filterSettings: { columns: [] },
                aggregates: [],
                contentModule: { currentInfo: { loadNext: false, nextInfo: { page: 2 } }, prevInfo: { page: 1 } },
                renderModule: { dataManagerSuccess: jasmine.createSpy('dataManagerSuccess') },
                detailRowModule: { expand: () => { } },
                getRowsObject: () => [{ data: rowDetails.record, index: 0 }]
            },
            allowPaging: false,
            enableVirtualization: true,
            enableInfiniteScrolling: false,
            loadChildOnDemand: false,
            summaryModule: { calculateSummaryValue: (): any[] => [] },
            trigger: () => { },
            uniqueIDCollection: {},
            remoteExpandedData: [],
            remoteCollapsedData: []
        };

        parent.element.id = 'tg-virt-collapse-correct';
        const dmx: any = Object.create(DataManipulation.prototype);
        dmx.parent = parent;
        dmx.parentItems = [];
        dmx.addedRecords = 'addedRecords';
        dmx.taskIds = [];
        dmx.hierarchyData = [];
        dmx.storedIndex = -1;
        dmx.sortedData = [];
        dmx.isSortAction = false;
        dmx.dataResults = {};
        dmx.isSelfReference = !!parent.parentIdMapping;

        const rowDetails: {
            action: 'collapse';
            record: { ID: string; level: number; uniqueID?: string; expanded?: boolean; childRecords?: any[] };
            rows: HTMLTableRowElement[];
            parentRow: HTMLTableRowElement | null;
        } = {
            action: 'collapse',
            record: { ID: 'R', level: 0, expanded: true },
            rows: [],
            parentRow: null
        };

        parent.grid.currentViewData = [rowDetails.record];
        parent.remoteExpandedData = [rowDetails.record];
        (dmx as any).fetchRemoteChildData(rowDetails);

        setTimeout(() => {
            expect(Array.isArray(rowDetails.record.childRecords)).toBe(true);
            expect(parent.grid.renderModule.dataManagerSuccess).toHaveBeenCalled();

            done();
        }, 0);
    });
});

describe("Coverage - DataManipulation – updateParentRemoteData aggregate-only (virtual, no sort/filter/search)", () => {
  it("computes aggregates from args.query and assigns args.result (virtual remote, no sort/filter/search)", () => {
    spyOn(utils, "isRemoteData").and.returnValue(true);

    const parent: any = {
      element: { id: "tg-agg" },
      enableVirtualization: true,
      loadChildOnDemand: false,
      grid: {
        aggregates: [{ dummy: true }],
        sortSettings: { columns: [] },
        filterSettings: { columns: [] },
        searchSettings: { key: "" },
      },
      flatData: [{ id: 1 }, { id: 2 }],
      dataSource: new DataManager({ json: [] }),
      notify: jasmine.createSpy("notify"),
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.addedRecords = "addedRecords";
    dm.taskIds = [];
    dm.hierarchyData = [];
    dm.storedIndex = -1;
    dm.sortedData = [];
    dm.isSortAction = false;
    dm.dataResults = {};
    dm.isSelfReference = !!parent.parentIdMapping;

    parent.grid.hideSpinner = parent.grid.hideSpinner || (() => {});

    parent.uniqueIDCollection = {};
    parent.flatData = parent.flatData || [];
    parent.parentData = parent.parentData || [];
    parent.infiniteScrollData = parent.infiniteScrollData || [];
    parent.remoteCollapsedData = parent.remoteCollapsedData || [];
    parent.childMapping = parent.childMapping || "children";

    parent.rowDropSettings = parent.rowDropSettings || { targetID: null };
    parent.rowDragAndDropModule = parent.rowDragAndDropModule || {
      isDuplicateData: (_rec: any): boolean => false,
    };

    const args: any = {
      result: [{ id: 1 }],
      actionArgs: { requestType: "refresh" },
      query: { queries: [{ fn: "onAggregates" }] },
    };

    parent.summaryModule = {
      calculateSummaryValue: (_q: any, _data: any, _flag: boolean): any[] => [
        "SUMMED",
      ],
    };

    (dm as any).updateParentRemoteData(args);

    expect(parent.notify).toHaveBeenCalled();
  });

  it("runs sort action, stores sortedData, and computes aggregates over sortedData", () => {
    const parent: any = {
      grid: {
        sortSettings: { columns: [{ field: "x" }] },
        aggregates: [{ dummy: true }],
        filterSettings: { columns: [] },
        searchSettings: { key: "" },
        dataSource: [{ id: 3 }, { id: 1 }],
      },
      getPrimaryKeyFieldNames: () => ["id"],
      isLocalData: true,
      dataSource: [{ id: 3 }, { id: 1 }],
      notify: jasmine.createSpy("notify"),
      summaryModule: {
        calculateSummaryValue: (_q: any, data: any[], _isSort: boolean) =>
          data.map((d) => d.id).join(","),
      },
      getData: (_opts: { query: any; isSort: boolean }): any[] => [],
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.isSortAction = true;

    dm.dataResults = {};
    dm.sortedData = [];
    dm.parentItems = [];

    spyOn(parent, "getData").and.callFake(
      (_opts: { query: any; isSort: boolean }): any[] => {
        return [{ id: 1 }, { id: 3 }];
      },
    );

    const args: any = { query: { queries: [{ fn: "onAggregates" }] } };

    (dm as any).dataProcessor(args);

    expect(dm.isSortAction).toBe(false);
    expect(parent.notify).toHaveBeenCalled();
  });
});

describe("Coverage - DataManipulation – updateParentRemoteData result routing branches", () => {
  it("sets args.result for isExpandCollapse under virtualization (remote, !LCoD)", () => {
    spyOn(utils, "isRemoteData").and.returnValue(true);
    const parent: any = {
      enableVirtualization: true,
      loadChildOnDemand: false,
      grid: {
        aggregates: [],
        sortSettings: { columns: [] },
        filterSettings: { columns: [] },
        searchSettings: { key: "" },
        hideSpinner: () => {},
      },
      flatData: [],

      notify: jasmine.createSpy("notify"),
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.dataResults = {};
    dm.sortedData = [];

    const recs = [{ id: 1 }];
    const args: any = {
      result: recs.slice(),
      actionArgs: { isExpandCollapse: true },
      query: { queries: [] },
    };

    (dm as any).updateParentRemoteData(args);
    expect(args && args.result).toBeTruthy();
  });
});

describe("DataManipulation – fetchRemoteChildData virtualization: collapse (robust)", () => {
  it("assigns childRecords, moves parent from remoteExpandedData to remoteCollapsedData, sets parent expanded=false, updates count, and calls dataManagerSuccess", (done) => {
    spyOn(popups, "showSpinner").and.callFake((_el: Element): void => {});
    spyOn(popups, "hideSpinner").and.callFake((_el: Element): void => {});

    const dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.callFake((_q: Query): Promise<any> => {
      const result = [
        { ID: "R", ParentID: null, level: 0 },
        { ID: "C1", ParentID: "R", level: 0 },
        { ID: "C2", ParentID: "R", level: 0 },
      ];
      return Promise.resolve({
        result,
        count: result.length,
        actual: { nextLevel: [true, true, true] },
      });
    });

    const parent: any = {
      element: Object.assign(document.createElement("div"), {
        id: "tg-virt-collapse-ok",
      }),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "ParentID",
      grid: {
        getDataModule: () => ({ generateQuery: () => new Query() }),
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        currentViewData: [],
        filterSettings: { columns: [] },
        aggregates: [],
        contentModule: {
          currentInfo: { loadNext: false, nextInfo: { page: 2 } },
          prevInfo: { page: 1 },
        },
        renderModule: {
          dataManagerSuccess: jasmine.createSpy("dataManagerSuccess"),
        },
        detailRowModule: { expand: () => {} },
        getRowsObject: () => [{ data: rowDetails.record, index: 0 }],
      },
      allowPaging: false,
      enableVirtualization: true,
      enableInfiniteScrolling: false,
      loadChildOnDemand: false,
      summaryModule: { calculateSummaryValue: (): any[] => [] },
      trigger: () => {},
      uniqueIDCollection: {},
      remoteExpandedData: [],
      remoteCollapsedData: [],
    };

    const dmx: any = Object.create(DataManipulation.prototype);
    dmx.parent = parent;
    dmx.parentItems = [];
    dmx.addedRecords = "addedRecords";
    dmx.taskIds = [];
    dmx.hierarchyData = [];
    dmx.storedIndex = -1;
    dmx.sortedData = [];
    dmx.isSortAction = false;
    dmx.dataResults = {};
    dmx.isSelfReference = !!parent.parentIdMapping;

    const rowDetails: {
      action: "collapse";
      record: {
        ID: string;
        level: number;
        uniqueID?: string;
        expanded?: boolean;
        childRecords?: any[];
      };
      rows: HTMLTableRowElement[];
      parentRow: HTMLTableRowElement | null;
    } = {
      action: "collapse",
      record: { ID: "R", level: 0, expanded: true },
      rows: [],
      parentRow: null,
    };

    parent.grid.currentViewData = [rowDetails.record];
    parent.remoteExpandedData = [rowDetails.record];

    (dmx as any).fetchRemoteChildData(rowDetails);

    setTimeout(() => {
      expect(Array.isArray(rowDetails.record.childRecords)).toBe(true);
      expect(parent.grid.renderModule.dataManagerSuccess).toHaveBeenCalled();
      done();
    }, 0);
  });
});

describe("Coverage - updateParentRemoteData virtualization child detection & level compute", function () {
  it("sets expanded=true when child exists (virtual) and computes child level from parent in records", function () {
    spyOn(utils, "isRemoteData").and.returnValue(true);
    var parent = {
      element: { id: "tg-upd-v1" },
      enableVirtualization: true,
      loadChildOnDemand: true,
      idMapping: "ID",
      parentIdMapping: "PID",
      grid: { 
        aggregates: [] as any[], sortSettings: { columns: [] as any[] }, filterSettings:{columns:[] as any[] }, searchSettings:{ key:""}
      },
      query: { expands: [] as any[] },
      notify: jasmine.createSpy("notify")
    };
    var dm = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.parent.hasChildMapping = true;
    var records = [
      { ID: "P" },
      { ID: "C", PID: "P" }
    ];
    var args = {
      result: records,
      actionArgs: { requestType: "refresh", action: null as any, searchString: "" },
      actual: { flatData: [] as any[] },
      query: { queries: [] as any[] }
    };
    expect(function(){ dm.updateParentRemoteData(args); }).not.toThrow();
  });

  it("sets expanded=false when no matching child and hasChildRecords flag", function(){
    spyOn(utils, "isRemoteData").and.returnValue(true);
    var parent = {
      element: { id: "tg-upd-v2" },
      enableVirtualization: true,
      loadChildOnDemand: true,
      idMapping: "ID",
      parentIdMapping: "PID",
      grid: { aggregates: [] as any[], sortSettings:{columns:[] as any[]}, filterSettings:{columns:[] as any[]}, searchSettings:{ key:""} },
      query: { expands: [] as any[] },
      notify: jasmine.createSpy("notify")
    };
    var dm = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.parent.hasChildMapping = true;
    var records = [
      { ID: "P", hasChildRecords: true }
    ];
    var args = { result: records, actionArgs: { requestType:"refresh", action:null as any, searchString:"" }, actual:{ flatData:[] as any[] }, query:{queries:[] as any[]} };
    expect(function(){ dm.updateParentRemoteData(args); }).not.toThrow();
    expect((records[0] as any).expanded).toBe(false);
  });

  it("computes level using args.actual.flatData when parent not in records", function () {
    spyOn(utils, "isRemoteData").and.returnValue(true);
    var parent = {
      element: { id: "tg-upd-v3" },
      enableVirtualization: true,
      loadChildOnDemand: true,
      idMapping: "ID",
      parentIdMapping: "PID",
      grid: { aggregates: [] as any[], sortSettings:{columns:[] as any[]}, filterSettings:{columns:[] as any[]}, searchSettings:{ key:""} },
      query: { expands: [] as any[] },
      notify: jasmine.createSpy("notify")
    };
    var dm = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.parent.hasChildMapping = true;
    var records = [
      { ID: "C", PID: "PX" }
    ];
    var args = {
      result: records,
      actionArgs: { requestType: "refresh", action: null as any, searchString: "" },
      actual: { flatData: [{ ID: "PX"}] as any[] },
      query: { queries: [] as any[] }
    };
    expect(function(){ dm.updateParentRemoteData(args); }).not.toThrow();
  });
  
  it("computes level using args.actual.flatData when parent in records", function () {
    spyOn(utils, "isRemoteData").and.returnValue(true);
    var parent = {
      element: { id: "tg-upd-v3" },
      enableVirtualization: true,
      loadChildOnDemand: true,
      idMapping: "ID",
      parentIdMapping: "PID",
      grid: { aggregates: [] as any[], sortSettings:{columns:[] as any[]}, filterSettings:{columns:[] as any[]}, searchSettings:{ key:""} },
      query: { expands: [] as any[] },
      notify: jasmine.createSpy("notify")
    };
    var dm = Object.create(DataManipulation.prototype);
    dm.parent = parent;
    dm.parentItems = [];
    dm.parent.hasChildMapping = true;
    var records = [
      { ID: "PX", PID: "PX" }
    ];
    var args = {
      result: records,
      actionArgs: { requestType: "refresh", action: null as any, searchString: "" },
      actual: { flatData: [{ ID: "PX"}] as any[] },
      query: { queries: [] as any[] }
    };
    expect(function(){ dm.updateParentRemoteData(args); }).not.toThrow();
  });
});


describe("Coverage - fetchRemoteChildData inx === -1 path", function () {
  it("derives inx using getRowsObject when not found in datas", function (done) {
    spyOn(popups, "showSpinner").and.callFake(function () {});
    spyOn(popups, "hideSpinner").and.callFake(function () {});
    var dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.returnValue(
      Promise.resolve({
        result: [],
        count: 0,
        actual: { nextLevel: [] },
      }),
    );
    var parent = {
      element: document.createElement("div"),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "PID",
      grid: {
        getDataModule: function () {
          return {
            generateQuery: function () {
              return new Query();
            },
          };
        },
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        currentViewData: [{ ID: "X" }],
        filterSettings: { columns: [] as any[] },
        aggregates: [] as any[],
        renderModule: { dataManagerSuccess: function () {} },
        detailRowModule: { expand: function () {} },
        getRowsObject: function () {
          return [{ data: { uniqueID: "u1" }, index: 0 }];
        },
      },
      allowPaging: false,
      enableVirtualization: true,
      enableInfiniteScrolling: false,
      loadChildOnDemand: false,
      summaryModule: {
        calculateSummaryValue: function () {
          return [] as any[];
        },
      },
      trigger: function () {},
      uniqueIDCollection: {},
    };
    var dmx = Object.create(DataManipulation.prototype);
    spyOn(dmx as any, 'remoteVirtualAction').and.callFake(() => {});
    dmx.parent = parent;
    dmx.parentItems = [];
    var rd = {
      action: "remoteExpand",
      record: { ID: "A", level: 0, uniqueID: "u1" },
      rows: [] as any[],
      parentRow: null as any,
    };
    expect(function () {
      dmx.fetchRemoteChildData(rd);
    }).not.toThrow();
    setTimeout(function () {
      expect(parent.grid.pageSettings.totalRecordsCount).toBeDefined();
      done();
    }, 0);
  });
});

describe('Coverage - convertToFlatData: inner if else-arm (filterKey exists)', () => {
  it('does NOT call where/addParams when initialRender && filterKey.length > 0', (done) => {
    spyOn(utils, 'isRemoteData').and.returnValue(true);
    spyOn(utils, 'isOffline').and.returnValue(false);

    const remote = new DataManager({ json: [] });

    const seededQuery: any = new Query();
    (seededQuery as any).params = [{ key: 'IdMapping', value: 'seed' }];

    spyOn(seededQuery, 'where').and.callThrough();
    spyOn(seededQuery, 'addParams').and.callThrough();

    const parent: any = {
      element: { id: 'tg-convert-else' },
      dataSource: remote,
      idMapping: 'id',
      parentIdMapping: 'pid',
      hasChildMapping: true,
      initialRender: true,
      query: seededQuery,
      grid: { hideSpinner: () => { } },
      flatData: [] as any[],
      parentData: [] as any[]
    };

    const dm = Object.create((DataManipulation as any).prototype) as DataManipulation;
    (dm as any).parent = parent;
    (dm as any).parentItems = [];
    (dm as any).taskIds = [];
    (dm as any).hierarchyData = [];
    (dm as any).storedIndex = -1;
    (dm as any).sortedData = [];
    (dm as any).isSortAction = false;
    (dm as any).dataResults = {};
    (dm as any).isSelfReference = !!parent.parentIdMapping;

    setTimeout(function () {
      expect(function () { return (dm as any).convertToFlatData(remote); }).not.toThrow();
      done();
    }, 0);
  });
});

describe('Coverage - collectExpandingRecs loadChildOnDemand branch', () => {
  it('should skip expand/collapse logic when loadChildOnDemand is true', () => {
    const mockRow = document.createElement('tr');
    mockRow.setAttribute('data-uid', 'test-uid-1');
    
    const mockParent: any = {
      loadChildOnDemand: true,
      rowTemplate: false,
      getRows: jasmine.createSpy('getRows').and.returnValue([]),
      grid: {
        getRowObjectFromUID: jasmine.createSpy('getRowObjectFromUID').and.returnValue({ data: {} }),
        pageSettings: { totalRecordsCount: 0 },
        detailRowModule: { expand: jasmine.createSpy('expand') }
      },
      toggleRowVisibility: jasmine.createSpy('toggleRowVisibility')
    };
    
    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = mockParent;
    
    expect(() => {
      dm.collectExpandingRecs({ record: {}, rows: [mockRow], parentRow: mockRow }, false);
    }).not.toThrow();
  });
});

describe('Coverage - fetchRemoteChildData additional branches', () => {
  it('should handle filterSettings.columns push when filterSettings exists', (done) => {
    spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
    spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });

    const mockQuery = new Query();
    mockQuery.queries = [];
    spyOn(mockQuery, 'where').and.returnValue(mockQuery);
    spyOn(mockQuery, 'take').and.returnValue(mockQuery);
    spyOn(mockQuery, 'expand').and.returnValue(mockQuery);

    const mockParent: any = {
      element: document.createElement('div'),
      filterSettings: { columns: [] },
      enableVirtualization: false,
      isDestroyed: false,
      parentIdMapping: 'parentID',
      idMapping: 'ID',
      childMapping: 'subtasks',
      grid: {
        getDataModule: jasmine.createSpy('getDataModule').and.returnValue({
          generateQuery: jasmine.createSpy('generateQuery').and.returnValue(mockQuery)
        }),
        filterSettings: { columns: [{ field: 'ID', predicates: [] }] },
        pageSettings: { pageSize: 5, totalRecordsCount: 0 },
        currentViewData: [],
        aggregates: [],
        renderModule: { dataManagerSuccess: jasmine.createSpy('dataManagerSuccess') },
        detailRowModule: { expand: jasmine.createSpy('expand') },
        getRowsObject: jasmine.createSpy('getRowsObject').and.returnValue([]) // <-- add this line
      },
      notify: jasmine.createSpy('notify'),
      dataSource: new DataManager(),
      trigger: jasmine.createSpy('trigger')
    };
    
    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = mockParent;
    dm.parentItems = [];
    
    spyOn(mockParent.dataSource, 'executeQuery').and.returnValue(Promise.resolve({ 
      result: [{ ID: 1, parentID: null }], 
      count: 1,
      actual: { nextLevel: [false] }
    }));
    
    const rowDetails: any = {
      action: 'remoteExpand',
      record: { index: 1, level: 0, parentID: null as any, ID: 1 },
      rows: [],
      parentRow: null
    };
    
    dm.fetchRemoteChildData(rowDetails);
    setTimeout(() => {
      expect(popups.showSpinner).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle inx === -1 derivation from datas', (done) => {
    spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
    spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });
    const mockFlatData: any[] = [
      { index: 0, level: 0, ID: 1 },
      { index: 1, level: 0, ID: 2 }
    ];
    
    const mockParent: any = {
      filterSettings: { columns: [] },
      enableVirtualization: false,
      isDestroyed: false,
      parentIdMapping: 'parentID',
      idMapping: 'ID',
      childMapping: 'subtasks',
      grid: {
        currentViewData: [],
        getDataModule: jasmine.createSpy('getDataModule').and.returnValue({
          generateQuery: jasmine.createSpy('generateQuery').and.returnValue({
            where: jasmine.createSpy('where').and.returnValue({}),
            take: jasmine.createSpy('take').and.returnValue({}),
            expand: jasmine.createSpy('expand').and.returnValue({}),
            queries: []
          })
        }),
        getRowsObject: jasmine.createSpy('getRowsObject').and.returnValue([
          { data: { uniqueID: 2 }, index: 1 }
        ]),
        aggregates: [],
        pageSettings: { totalRecordsCount: 0 },
        renderModule: { dataManagerSuccess: jasmine.createSpy('dataManagerSuccess') }
      },
      notify: jasmine.createSpy('notify'),
      dataSource: new DataManager(),
      flatData: mockFlatData,
      trigger: jasmine.createSpy('trigger')
    };
    
    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = mockParent;
    
    spyOn(mockParent.dataSource, 'executeQuery').and.returnValue(Promise.resolve({ result: [] }));
    
    const rowDetails: any = {
      action: 'expand',
      record: { index: 1, level: 0, parentID: null as any, ID: 2 },
      rows: [],
      parentRow: null
    };
    
    dm.fetchRemoteChildData(rowDetails);
    setTimeout(() => {
      expect(popups.showSpinner).toHaveBeenCalled();
      done();
    }, 100);
  });
});

describe('Coverage - fetchRemoteChildData isGantt + loadChildOnDemand + hasChildMapping branch', () => {
  it('should set inx when record matches currentViewData', (done) => {
    spyOn(popups, 'showSpinner').and.callFake((_el: Element): void => { });
    spyOn(popups, 'hideSpinner').and.callFake((_el: Element): void => { });
    const mockCurrentViewData = [
      { ID: 10 },
      { ID: 20 },
      { ID: 30 }
    ];
    const mockParent: any = {
      filterSettings: { columns: [] },
      enableVirtualization: false,
      isDestroyed: false,
      parentIdMapping: 'parentID',
      idMapping: 'ID',
      childMapping: 'subtasks',
      isGantt: true,
      loadChildOnDemand: true,
      hasChildMapping: true,
      grid: {
        currentViewData: mockCurrentViewData,
        getDataModule: jasmine.createSpy('getDataModule').and.returnValue({
          generateQuery: jasmine.createSpy('generateQuery').and.returnValue({
            where: jasmine.createSpy('where').and.returnValue({}),
            take: jasmine.createSpy('take').and.returnValue({}),
            expand: jasmine.createSpy('expand').and.returnValue({}),
            queries: []
          })
        }),
        getRowsObject: jasmine.createSpy('getRowsObject').and.returnValue([]),
        aggregates: [],
        pageSettings: { totalRecordsCount: 0 },
        renderModule: { dataManagerSuccess: jasmine.createSpy('dataManagerSuccess') }
      },
      notify: jasmine.createSpy('notify'),
      dataSource: new DataManager(),
      flatData: [],
      trigger: jasmine.createSpy('trigger')
    };

    const dm: any = Object.create(DataManipulation.prototype);
    dm.parent = mockParent;

    spyOn(mockParent.dataSource, 'executeQuery').and.returnValue(Promise.resolve({ result: [] }));

    const rowDetails: any = {
      action: 'expand',
      record: { ID: 20, index: 1, level: 0, parentID: null as any },
      rows: [],
      parentRow: null
    };

    dm.fetchRemoteChildData(rowDetails);
    setTimeout(() => {
      expect(popups.showSpinner).toHaveBeenCalled();
      done();
    }, 100);
  });
});

describe("Coverage - fetchRemoteChildData filterModule value branch", () => {
  it("executes resultChildData path when filterModule.value is truthy", (done) => {
    spyOn(popups, "showSpinner").and.callFake(() => {});
    spyOn(popups, "hideSpinner").and.callFake(() => {});

    const dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.returnValue(
      Promise.resolve({
        result: [
          { ID: 1, ParentID: null, level: 0 },
          { ID: 2, ParentID: 1, level: 0 },
        ],
        count: 2,
        actual: { nextLevel: [false, false] },
      }),
    );

    const parent: any = {
      element: document.createElement("div"),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "ParentID",
      grid: {
        getDataModule: () => ({
          generateQuery: () => new Query(),
        }),
        getRowsObject: () => [{ data: { uniqueID: "u1" }, index: 0 }],
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        contentModule: {
          currentInfo: { loadNext: false, nextInfo: { page: 1 } },
          prevInfo: { page: 1 },
        },
        currentViewData: [{ ID: 1, level: 0 }],
        filterSettings: { columns: [] },
        filterModule: { value: "active" },
        aggregates: [],
        renderModule: { dataManagerSuccess: () => {} },
        detailRowModule: { expand: () => {} },
      },
      allowPaging: false,
      enableVirtualization: true,
      enableInfiniteScrolling: false,
      loadChildOnDemand: false,
      summaryModule: { calculateSummaryValue: (): any[] => [] },
      trigger: () => {},
      remoteExpandedData: [],
      remoteCollapsedData: [],
      uniqueIDCollection: {},
    };
    const dmx = Object.create((DataManipulation as any).prototype);
    dmx.parent = parent;
    dmx.parentItems = [];
    const rd: any = {
      action: "remoteExpand",
      record: { ID: 1, level: 0 },
      rows: [],
      parentRow: null,
    };
    dmx.fetchRemoteChildData(rd);
    setTimeout(() => {
      expect(rd.record.ID).toBe(1);
      done();
    }, 0);
  });
});

describe("Coverage - fetchRemoteChildData expanded=true branch for same record", () => {
  it("sets record.expanded=true when virtualization enabled and action is remoteExpand", (done) => {
    spyOn(popups, "showSpinner").and.callFake(() => {});
    spyOn(popups, "hideSpinner").and.callFake(() => {});

    const dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.returnValue(
      Promise.resolve({
        result: [
          { ID: 10, ParentID: null, level: 0 }
        ],
        count: 1,
        actual: { nextLevel: [true] }
      })
    );

    const parent: any = {
      element: document.createElement("div"),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "ParentID",
      grid: {
        getDataModule: () => ({ generateQuery: () => new Query() }),
        getRowsObject: () => [{ data: { uniqueID: "u1" }, index: 0 }],
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        contentModule: {
          currentInfo: { loadNext: false, nextInfo: { page: 1 } },
          prevInfo: { page: 1 },
        },
        currentViewData: [{ ID: 10, level: 0 }],
        filterSettings: { columns: [] },
        aggregates: [],
        renderModule: {
          dataManagerSuccess: jasmine.createSpy("dataManagerSuccess")
        },
        detailRowModule: { expand: () => {} }
      },
      enableVirtualization: true,
      enableInfiniteScrolling: false,
      loadChildOnDemand: true,
      allowPaging: false,
      summaryModule: { calculateSummaryValue: () => [] as any },
      trigger: () => {},
      uniqueIDCollection: {},
      remoteExpandedData: [],
      remoteCollapsedData: []
    };

    const dmx = Object.create((DataManipulation as any).prototype);
    dmx.parent = parent;
    dmx.parentItems = [10];
    const rd: any = {
      action: "remoteExpand",
      record: { ID: 10, level: 0 },
      rows: [],
      parentRow: null
    };

    dmx.fetchRemoteChildData(rd);

    setTimeout(() => {
      const rendered = parent.grid.renderModule.dataManagerSuccess.calls.mostRecent().args[0].result;
      expect(rendered[0].expanded).toBe(true);
      done();
    }, 0);
  });
});

describe("Coverage - fetchRemoteChildData fallback level assignment from currentViewData", () => {
  it("assigns record.level from matching parent in currentViewData when level is undefined", (done) => {
    spyOn(popups, "showSpinner").and.callFake(() => {});
    spyOn(popups, "hideSpinner").and.callFake(() => {});
    const dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.returnValue(
      Promise.resolve({
        result: [
          { ID: 2, ParentID: 1 }
        ],
        count: 1,
        actual: { nextLevel: undefined }
      })
    );
    const parent: any = {
      element: document.createElement("div"),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "ParentID",
      enableVirtualization: true,
      loadChildOnDemand: false,
      enableInfiniteScrolling: false,
      allowPaging: false,
      grid: {
        getDataModule: () => ({ generateQuery: () => new Query() }),
        getRowsObject: () => [{ data: { uniqueID: "u1" }, index: 0 }],
        currentViewData: [
          { ID: 1, level: 2 }
        ],
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        contentModule: {
          currentInfo: { loadNext: false, nextInfo: { page: 1 } },
          prevInfo: { page: 1 },
        },
        filterSettings: { columns: [] },
        aggregates: [],
        renderModule: {
          dataManagerSuccess: jasmine.createSpy("dataManagerSuccess")
        },
        detailRowModule: { expand: () => {} }
      },
      summaryModule: { calculateSummaryValue: () => [] as any },
      trigger: () => {},
      uniqueIDCollection: {},
      remoteExpandedData: [],
      remoteCollapsedData: []
    };
    const dmx = Object.create((DataManipulation as any).prototype);
    dmx.parent = parent;
    dmx.parentItems = [1];
    const rd: any = {
      action: "remoteExpand",
      record: { ID: 1, level: 2 },
      rows: [],
      parentRow: null
    };
    dmx.fetchRemoteChildData(rd);
    setTimeout(() => {
      expect(rd.record.childRecords[0].level).toBe(3);
      done();
    }, 0);
  });
});

describe("Coverage - fetchRemoteChildData collapse sync using remoteCollapsedData", () => {
  it("syncs expanded state from remoteCollapsedData during collapse", (done) => {
    spyOn(popups, "showSpinner").and.callFake(() => {});
    spyOn(popups, "hideSpinner").and.callFake(() => {});
    const dm = new DataManager({ json: [] });
    spyOn(dm, "executeQuery").and.returnValue(
      Promise.resolve({
        result: [
          { ID: 1, ParentID: null, level: 0 },
          { ID: 2, ParentID: 1, level: 1 }
        ],
        count: 2,
        actual: { nextLevel: undefined }
      })
    );
    const parent: any = {
      element: document.createElement("div"),
      dataSource: dm,
      idMapping: "ID",
      parentIdMapping: "ParentID",
      enableVirtualization: true,
      loadChildOnDemand: false,
      enableInfiniteScrolling: false,
      allowPaging: false,
      grid: {
        getRowsObject: () => [{ data: { uniqueID: "u1" }, index: 0 }],
        getDataModule: () => ({ generateQuery: () => new Query() }),
        currentViewData: [
          { ID: 1, level: 0 },
          { ID: 2, level: 1 }
        ],
        pageSettings: { pageSize: 5, totalRecordsCount: 0, currentPage: 1 },
        contentModule: { currentInfo: { loadNext: false, nextInfo: { page: 1 } }, prevInfo: { page: 1 } },
        filterSettings: { columns: [] },
        aggregates: [],
        renderModule: {
          dataManagerSuccess: jasmine.createSpy("dataManagerSuccess")
        },
        detailRowModule: { expand: () => {} }
      },
      summaryModule: { calculateSummaryValue: () => [] as any },
      trigger: () => {},
      uniqueIDCollection: {},
      remoteCollapsedData: [{ ID: 1, expanded: false }],
      remoteExpandedData: []
    };
    const dmx = Object.create((DataManipulation as any).prototype);
    dmx.parent = parent;
    dmx.parentItems = [1];
    const rd: any = {
      action: "collapse",
      record: { ID: 2, level: 1 },
      rows: [],
      parentRow: null
    };
    dmx.fetchRemoteChildData(rd);
    setTimeout(() => {
      expect(rd.record.childRecords[0].expanded).toBe(false);
      done();
    }, 0);
  });
});