import { Spreadsheet, SpreadsheetModel } from '../../../src/spreadsheet/index';
import { SpreadsheetHelper } from '../util/spreadsheethelper.spec';
import { setCell, SheetModel, SortEventArgs } from '../../../src/workbook/index';
import { CellModel } from '../../../src/workbook/index';
import { defaultData } from '../util/datasource.spec';

describe('suspendRefresh()/resumeRefresh() ->', () => {
    let helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');
    let model: SpreadsheetModel;
    let spreadsheet: Spreadsheet;

    describe('Suspend and resume refresh covered methods =>', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert row and Insert Column methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows.length).toEqual(11);
            // expect(spreadsheet.sheets[0].columns.length).toEqual(8);
            spreadsheet.suspendRefresh();
            spreadsheet.insertRow(1, 1);
            spreadsheet.insertColumn(1, 1);
            expect(spreadsheet.sheets[0].rows.length).toEqual(12);
            // expect(spreadsheet.sheets[0].columns.length).toEqual(9);
            expect(helper.invoke('getCell', [0, 1]).textContent).not.toBe('');
            expect(helper.invoke('getCell', [1, 0]).textContent).not.toBe('');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('');
            expect(helper.invoke('getCell', [1, 0]).textContent).toBe('');
            done();
        });
        it('Hide and unhide rows methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            spreadsheet.suspendRefresh();
            spreadsheet.hideRow(11);
            spreadsheet.hideColumn(8);
            expect(sheet.rows[11].hidden).toBeTruthy();
            expect(sheet.columns[8].hidden).toBeTruthy();
            let rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
            let columns = helper.getElementFromSpreadsheet('.e-column-header').getElementsByClassName('e-header-cell');
            expect(rows[10].classList).not.toContain('e-hide-start');
            expect(rows[11].classList).not.toContain('e-hide-end');
            expect(columns[7].classList).not.toContain('e-hide-start');
            expect(columns[8].classList).not.toContain('e-hide-end');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
                columns = helper.getElementFromSpreadsheet('.e-column-header').getElementsByClassName('e-header-cell');
                expect(rows[10].classList).toContain('e-hide-start');
                expect(rows[11].classList).toContain('e-hide-end');
                expect(columns[7].classList).toContain('e-hide-start');
                expect(columns[8].classList).toContain('e-hide-end');
                spreadsheet.suspendRefresh();
                spreadsheet.hideRow(11, 11, false);
                spreadsheet.hideColumn(8, 8, false);
                expect(sheet.rows[11].hidden).toBeFalsy();
                expect(sheet.columns[8].hidden).toBeFalsy();
                expect(rows[10].classList).toContain('e-hide-start');
                expect(rows[11].classList).toContain('e-hide-end');
                expect(columns[7].classList).toContain('e-hide-start');
                expect(columns[8].classList).toContain('e-hide-end');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
                    columns = helper.getElementFromSpreadsheet('.e-column-header').getElementsByClassName('e-header-cell');
                    expect(rows[10].classList).not.toContain('e-hide-start');
                    expect(rows[11].classList).not.toContain('e-hide-end');
                    expect(columns[7].classList).not.toContain('e-hide-start');
                    expect(columns[8].classList).not.toContain('e-hide-end');
                    done();
                }, 0);
            }, 0);
        });
        it('updateCell, cellFormat, numberFormat methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.updateCellDetails({ value: '100' }, 'H3');
            expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toBe(100);
            expect(helper.invoke('getCell', [2, 7]).textContent).not.toBe('100');
            spreadsheet.cellFormat({ textDecoration: 'underline line-through', fontStyle: 'italic' }, 'A12');
            expect(spreadsheet.sheets[0].rows[11].cells[0].style.textDecoration).toBe('underline line-through');
            expect(spreadsheet.sheets[0].rows[11].cells[0].style.fontStyle).toBe('italic');
            const td: HTMLElement = helper.invoke('getCell', [11, 0]);
            expect(td.style.textDecoration).not.toBe('underline line-through');
            expect(td.style.fontStyle).not.toBe('italic');
            spreadsheet.numberFormat('_($* #,##0.00_);_($* (#,##0.00);_($* \"-\"??_);_(@_)', 'I3');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toBe(10);
            expect(spreadsheet.sheets[0].rows[2].cells[8].format).toBe('_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)');
            expect(helper.invoke('getCell', [2, 8]).textContent).not.toBe(' $   10.00 ');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [2, 7]).textContent).toBe('100');
            expect(td.style.textDecoration).toBe('underline line-through');
            expect(td.style.fontStyle).toBe('italic');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe(' $   10.00 ');
            done();
        });
        it('merge and unmerge methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.selectRange('F1:G1');
            spreadsheet.merge('F1:G1', 'Horizontally');
            expect(spreadsheet.sheets[0].rows[0].cells[5].colSpan).toBe(2);
            expect(spreadsheet.sheets[0].rows[0].cells[6].colSpan).toBe(-1);
            expect(helper.invoke('getCell', [0, 5]).colSpan).not.toBe(2);
            spreadsheet.resumeRefresh();
            setTimeout(function () {
                expect(helper.invoke('getCell', [0, 5]).colSpan).toBe(2);
                spreadsheet.suspendRefresh();
                spreadsheet.unMerge('F1:G1');
                expect(spreadsheet.sheets[0].rows[0].cells[5].colSpan).toBeUndefined();
                expect(spreadsheet.sheets[0].rows[0].cells[6].colSpan).toBeUndefined();
                expect(helper.invoke('getCell', [0, 5]).colSpan).toBe(2);
                spreadsheet.resumeRefresh();
                setTimeout(function () {
                    expect(helper.invoke('getCell', [0, 5]).colSpan).not.toBe(2);
                    done();
                });
            });
        });
        it('add hyperlink and remove hyperlink methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.addHyperlink('www.google.com', 'I12:I12', 'Google');
            const cell: CellModel = spreadsheet.sheets[0].rows[11].cells[8];
            expect(cell.hyperlink).toBe('http://www.google.com');
            expect(cell.value).toBe('Google');
            expect(cell.style.textDecoration).toBe('underline');
            expect(cell.style.color).toBe('#00e');
            const cellEle: HTMLElement = helper.invoke('getCell', [11, 8]);
            expect(cellEle.querySelector('.e-hyperlink')).not.toBeUndefined();
            expect(cellEle.style.textDecoration).not.toBe('underline');
            expect(cellEle.style.color).not.toBe('#00e');
            spreadsheet.resumeRefresh();
            expect(cellEle.querySelector('.e-hyperlink')).not.toBeUndefined();
            expect(cellEle.querySelector('.e-hyperlink').textContent).toBe('Google');
            expect(cellEle.style.textDecoration).toBe('underline');
            expect(cellEle.style.color).toBe('rgb(0, 0, 238)');
            spreadsheet.suspendRefresh();
            spreadsheet.removeHyperlink('I11:I12');
            expect(cell.hyperlink).toBeUndefined();
            expect(cellEle.querySelector('.e-hyperlink')).not.toBeNull();
            spreadsheet.resumeRefresh();
            expect(cellEle.querySelector('.e-hyperlink')).toBeNull();
            done();
        });
        it('data validation methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.addDataValidation({ type: 'TextLength', operator: 'LessThanOrEqualTo', value1: '1', isHighlighted: true }, 'E3');
            expect(JSON.stringify(spreadsheet.sheets[0].rows[2].cells[4].validation)).toBe('{"type":"TextLength","operator":"LessThanOrEqualTo","value1":"1","isHighlighted":true}');
            const cellEle: HTMLElement = helper.invoke('getCell', [2, 4]);
            expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).not.toBe('rgb(255, 0, 0)');
            spreadsheet.resumeRefresh();
            expect(cellEle.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).toBe('rgb(255, 0, 0)');
            // remove invalid highlight
            spreadsheet.suspendRefresh();
            spreadsheet.removeInvalidHighlight();
            expect(JSON.stringify(spreadsheet.sheets[0].rows[2].cells[4].validation)).toBe('{"type":"TextLength","operator":"LessThanOrEqualTo","value1":"1"}');
            expect(cellEle.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).toBe('rgb(255, 0, 0)');
            spreadsheet.resumeRefresh();
            expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).not.toBe('rgb(255, 0, 0)');
            // add invalid highlight
            spreadsheet.suspendRefresh();
            spreadsheet.addInvalidHighlight();
            expect(JSON.stringify(spreadsheet.sheets[0].rows[2].cells[4].validation)).toBe('{"type":"TextLength","operator":"LessThanOrEqualTo","value1":"1","isHighlighted":true}');
            expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).not.toBe('rgb(255, 0, 0)');
            spreadsheet.resumeRefresh();
            expect(cellEle.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).toBe('rgb(255, 0, 0)');
            // remove validation
            spreadsheet.suspendRefresh();
            spreadsheet.removeDataValidation('E3');
            expect(JSON.stringify(spreadsheet.sheets[0].rows[2].cells[4].validation)).toBeUndefined();
            expect(cellEle.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).toBe('rgb(255, 0, 0)');
            spreadsheet.resumeRefresh();
            expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 255, 0)');
            expect(cellEle.style.color).not.toBe('rgb(255, 0, 0)');
            done();
        });
        it('ConditionalFormat and ClearConditionalFormat', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            spreadsheet.suspendRefresh();
            spreadsheet.conditionalFormat({ type: 'GYRColorScale', range: 'F3:F5' });
            expect(JSON.stringify(sheet.conditionalFormats[0])).toBe('{"type":"GYRColorScale","range":"F3:F5"}');
            let cellEle: HTMLElement = helper.invoke('getCell', [2, 5]);
            expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 235, 132)');
            spreadsheet.resumeRefresh();
            setTimeout(function () {
                cellEle = helper.invoke('getCell', [2, 5]);
                expect(cellEle.style.backgroundColor).toBe('rgb(255, 235, 132)');
                spreadsheet.suspendRefresh();
                spreadsheet.clearConditionalFormat('F3:G5');
                expect(sheet.conditionalFormats.length).toBe(0);
                expect(cellEle.style.backgroundColor).toBe('rgb(255, 235, 132)');
                spreadsheet.resumeRefresh();
                setTimeout(function () {
                    cellEle = helper.invoke('getCell', [2, 5]);
                    expect(cellEle.style.backgroundColor).not.toBe('rgb(255, 235, 132)');
                    done();
                }, 0);
            }, 0);
        });
        it('AutoFill and wrap methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            // Autofill
            spreadsheet.autoFill('F12:G12', 'E12', 'Right', 'CopyCells');
            expect(helper.getInstance().sheets[0].rows[11].cells[5].value).toBe(50);
            expect(helper.getInstance().sheets[0].rows[11].cells[6].value).toBe(50);
            expect(helper.invoke('getCell', [11, 5]).textContent).not.toBe('50');
            expect(helper.invoke('getCell', [11, 6]).textContent).not.toBe('50');
            // Wrap
            spreadsheet.wrap('A11', true);
            expect(spreadsheet.sheets[0].rows[10].cells[0].wrap).toBe(true);
            expect(helper.invoke('getCell', [10, 0]).classList).not.toContain('e-wraptext');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [11, 5]).textContent).toBe('50');
            expect(helper.invoke('getCell', [11, 6]).textContent).toBe('50');
            expect(helper.invoke('getCell', [10, 0]).classList).toContain('e-wraptext');
            spreadsheet.suspendRefresh();
            spreadsheet.wrap('A11', false);
            expect(spreadsheet.sheets[0].rows[10].cells[0].wrap).toBe(false);
            expect(helper.invoke('getCell', [10, 0]).classList).toContain('e-wraptext');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [10, 0]).classList).not.toContain('e-wraptext');
            done();
        });
        it('Freezepane and Unfreezepane methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            // Freeze panes
            spreadsheet.suspendRefresh();
            spreadsheet.freezePanes(5, 2);
            expect(spreadsheet.sheets[0].frozenRows).toBe(5);
            expect(spreadsheet.sheets[0].frozenColumns).toBe(2);
            expect(spreadsheet.element.querySelector('.e-frozen-rows')).toBeNull();
            expect(spreadsheet.element.querySelector('.e-frozen-columns')).toBeNull();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(spreadsheet.element.querySelector('.e-frozen-rows')).not.toBeNull();
                expect(spreadsheet.element.querySelector('.e-frozen-columns')).not.toBeNull();
                // Unfreeze panes
                spreadsheet.suspendRefresh();
                spreadsheet.unfreezePanes();
                expect(spreadsheet.sheets[0].frozenRows).toBe(0);
                expect(spreadsheet.sheets[0].frozenColumns).toBe(0);
                expect(spreadsheet.element.querySelector('.e-frozen-rows')).not.toBeNull();
                expect(spreadsheet.element.querySelector('.e-frozen-columns')).not.toBeNull();
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(spreadsheet.element.querySelector('.e-frozen-rows')).toBeNull();
                    expect(spreadsheet.element.querySelector('.e-frozen-columns')).toBeNull();
                    done();
                }, 0);
            }, 0);
        });
        it('setBorder', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.setBorder({ border: '1px solid red' }, 'A11', 'Outer');
            expect(JSON.stringify(spreadsheet.sheets[0].rows[10].cells[0].style)).toBe('{"borderTop":"1px solid red","borderBottom":"1px solid red","borderLeft":"1px solid red","borderRight":"1px solid red"}');
            expect(helper.invoke('getCell', [9, 0]).style.borderBottom).not.toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderBottom).not.toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderLeft).not.toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderRight).not.toBe('1px solid red');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [9, 0]).style.borderBottom).toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderBottom).toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderLeft).toBe('1px solid red');
            expect(helper.invoke('getCell', [10, 0]).style.borderRight).toBe('1px solid red');
            done();
        });
        it('Insert chart method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.insertChart([{ type: "Line", theme: "Material", isSeriesInRows: false, range: "H1:H11", id: "TestingChart" }]);
            expect(JSON.stringify(spreadsheet.chartColl[0])).toBe('{"type":"Line","theme":"Material","isSeriesInRows":false,"range":"Sheet1!H1:H11","id":"TestingChart","height":290,"width":480}');
            expect(helper.getElement().querySelector('#TestingChart')).toBeNull();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.getElement().querySelector('#TestingChart')).not.toBeNull();
                expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[7].chart[0])).toBe('{"type":"Line","theme":"Material","isSeriesInRows":false,"range":"Sheet1!H1:H11","id":"TestingChart","height":290,"width":480,"top":0,"left":448,"address":[0,7]}');
                spreadsheet.suspendRefresh();
                helper.invoke('updateCell', [{ value: '100' }, 'H10']);
                expect(helper.getInstance().sheets[0].rows[9].cells[7].value).toBe(100);
                expect(helper.invoke('getCell', [9, 7]).textContent).not.toBe('100');
                spreadsheet.resumeRefresh();
                expect(helper.invoke('getCell', [9, 7]).textContent).toBe('100');
                done();
            }, 10);
        });
        it('delete chart method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.deleteChart('TestingChart');
            expect(spreadsheet.chartColl.length).toBe(0);
            expect(spreadsheet.sheets[0].rows[0].cells[7].chart.length).toBe(0);
            expect(helper.getElement().querySelector('#TestingChart')).not.toBeNull();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.getElement().querySelector('#TestingChart')).toBeNull();
                done();
            }, 10);
        });
        it('Insert chart method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.insertChart([{ type: "Line", theme: "Material", isSeriesInRows: false, range: "H1:H11", id: "TestingChart" }]);
            expect(JSON.stringify(spreadsheet.chartColl[0])).toBe('{"type":"Line","theme":"Material","isSeriesInRows":false,"range":"Sheet1!H1:H11","id":"TestingChart","height":290,"width":480}');
            expect(helper.getElement().querySelector('#TestingChart')).toBeNull();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.getElement().querySelector('#TestingChart')).not.toBeNull();
                expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[7].chart[0])).toBe('{"type":"Line","theme":"Material","isSeriesInRows":false,"range":"Sheet1!H1:H11","id":"TestingChart","height":290,"width":480,"top":0,"left":448,"address":[0,7]}');
                spreadsheet.deleteChart('TestingChart');
                done();
            }, 10);
        });
        it('insert and delete image methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.insertImage([{ src: "https://www.w3schools.com/images/w3schools_green.jpg", width: 110, height: 70, id: 'TestingImage' }], 'I1');
            expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[8].image[0])).toBe('{"src":"https://www.w3schools.com/images/w3schools_green.jpg","id":"TestingImage","height":70,"width":110,"top":0,"left":512}');
            expect(helper.getElement().querySelector('#TestingImage')).toBeNull();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.getElement().querySelector('#TestingImage')).not.toBeNull();
                spreadsheet.suspendRefresh();
                spreadsheet.deleteImage('TestingImage');
                expect(spreadsheet.sheets[0].rows[0].cells[8].image.length).toBe(0);
                expect(helper.getElement().querySelector('#TestingImage')).not.toBeNull();
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.getElement().querySelector('#TestingImage')).toBeNull();
                    done();
                }, 30);
            }, 10);
        });
        it('setColWidth and setRowHeight methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.setColWidth(70, 1);
            expect(spreadsheet.sheets[0].columns[1].width).toBe(70);
            expect(spreadsheet.sheets[0].columns[1].customWidth).toBe(true);
            spreadsheet.setRowHeight(22, 1);
            expect(spreadsheet.sheets[0].rows[1].height).toBe(22);
            expect(spreadsheet.sheets[0].rows[1].customHeight).toBe(true);
            expect(helper.invoke('getRow', [1]).style.height).not.toBe('22px');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.invoke('getRow', [1]).style.height).toBe('22px');
                spreadsheet.suspendRefresh();
                spreadsheet.autoFit('1:2');
                expect(spreadsheet.sheets[0].rows[1].height).toBe(20);
                expect(spreadsheet.sheets[0].rows[1].customHeight).toBe(false);
                expect(helper.invoke('getRow', [1]).style.height).not.toBe('20px');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.invoke('getRow', [1]).style.height).toBe('20px');
                    done();
                });
            });
        });
        it('addDefinedName method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.addDefinedName({ name: 'PaintName', refersTo: 'Price Details!A1:A10', comment: 'for Paint', scope: 'Workbook' });
            expect(JSON.stringify(spreadsheet.definedNames[0])).toBe('{"name":"PaintName","refersTo":"=Price Details!A1:A10","comment":"for Paint","scope":"Workbook"}');
            spreadsheet.resumeRefresh();
            done();
        });
        it('delete (row and column) method ', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.delete(1, 1, 'Row');
            expect(spreadsheet.sheets[0].rows.length).toEqual(11);
            spreadsheet.delete(1, 1, 'Column');
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('');
            expect(helper.invoke('getCell', [1, 0]).textContent).toBe('');
            spreadsheet.resumeRefresh();
            expect(helper.invoke('getCell', [0, 1]).textContent).not.toBe('');
            expect(helper.invoke('getCell', [1, 0]).textContent).not.toBe('');
            done();
        });
        it('apply and clear filter methods ', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            // Apply Filter
            spreadsheet.suspendRefresh();
            spreadsheet.applyFilter([{ field: 'F', predicate: 'and', operator: 'lessthan', type: 'number', value: 1000 }]);
            expect(JSON.stringify(helper.getInstance().filterModule.filterRange.get(0).range)).toBe('[0,5,0,6]');
            expect(JSON.stringify(helper.getInstance().filterModule.filterCollection.get(0)[0])).toBeUndefined();
            expect(helper.invoke('getCell', [0, 0]).querySelector('.e-filter-icon')).toBeNull();
            expect(helper.invoke('getCell', [0, 5]).querySelector('.e-filter-icon.e-filtered')).toBeNull();
            let rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
            expect(rows[8].classList).not.toContain('e-hide-start');
            expect(rows[10].classList).not.toContain('e-hide-end');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.invoke('getCell', [0, 6]).querySelector('.e-filter-icon')).not.toBeNull();
                rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
                expect(helper.getInstance().sheets[0].rows[9].hidden).toBeTruthy();
                expect(helper.getInstance().sheets[0].rows[9].isFiltered).toBeTruthy();
                expect(rows[8].classList).toContain('e-hide-start');
                expect(rows[10].classList).toContain('e-hide-end');
                expect(helper.invoke('getCell', [0, 5]).querySelector('.e-filter-icon.e-filtered')).not.toBeNull();
                // Clear Filter
                spreadsheet.suspendRefresh();
                spreadsheet.clearFilter('F');
                expect(helper.getInstance().filterModule.filterCollection.get(0).length).toBe(0);
                expect(helper.invoke('getCell', [0, 5]).querySelector('.e-filter-icon.e-filtered')).not.toBeNull();
                expect(rows[8].classList).toContain('e-hide-start');
                expect(rows[10].classList).toContain('e-hide-end');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    rows = helper.getElementFromSpreadsheet('.e-row-header').getElementsByClassName('e-row');
                    expect(helper.getInstance().sheets[0].rows[9].hidden).toBeFalsy();
                    expect(helper.getInstance().sheets[0].rows[9].isFiltered).toBeFalsy();
                    expect(rows[8].classList).not.toContain('e-hide-start');
                    expect(rows[10].classList).not.toContain('e-hide-end');
                    expect(helper.invoke('getCell', [0, 5]).querySelector('.e-filter-icon.e-filtered')).toBeNull();
                    // Remove Filter
                    spreadsheet.suspendRefresh();
                    spreadsheet.applyFilter();
                    expect(helper.invoke('getCell', [0, 6]).querySelector('.e-filter-icon')).not.toBeNull();
                    expect(helper.getInstance().filterModule.filterRange.get(0)).toBe(undefined);
                    spreadsheet.resumeRefresh();
                    setTimeout(() => {
                        expect(helper.invoke('getCell', [0, 6]).querySelector('.e-filter-icon')).toBeNull();
                        done();
                    });
                });
            });
        });
        it('sort method ', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('selectRange', ['D1:D5']);
            helper.setModel('activeCell', 'D1');
            spreadsheet.suspendRefresh();
            helper.invoke('sort', [{ sortDescriptors: { order: 'Ascending', containsHeader: true } }]).then((args: SortEventArgs) => {
                helper.invoke('getData', [args.range]).then((values: Map<string, CellModel>) => {
                    expect(values.get('D2').value.toString()).toEqual('10');
                    expect(values.get('D3').value.toString()).toEqual('15');
                    expect(values.get('D4').value.toString()).toEqual('20');
                    expect(values.get('D4').value.toString()).toEqual('20');
                    expect(helper.invoke('getCell', [1, 3]).textContent).toBe('10');
                    expect(helper.invoke('getCell', [2, 3]).textContent).toBe('20');
                    expect(helper.invoke('getCell', [3, 3]).textContent).toBe('20');
                    expect(helper.invoke('getCell', [4, 3]).textContent).toBe('15');
                    spreadsheet.resumeRefresh();
                    setTimeout(() => {
                        expect(helper.invoke('getCell', [1, 3]).textContent).toBe('10');
                        expect(helper.invoke('getCell', [2, 3]).textContent).toBe('15');
                        expect(helper.invoke('getCell', [3, 3]).textContent).toBe('20');
                        expect(helper.invoke('getCell', [4, 3]).textContent).toBe('20');
                        done();
                    });
                });
            });
        });
        it('Clipboard copy and paste methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('copy', ['H11']).then(() => {
                spreadsheet.suspendRefresh();
                helper.invoke('paste', ['H12']);
                expect(helper.getInstance().sheets[0].rows[11].cells[7].value).toBe(helper.getInstance().sheets[0].rows[10].cells[7].value);
                expect(helper.invoke('getCell', [11, 7]).textContent).not.toBe(helper.getInstance().sheets[0].rows[10].cells[7].value);
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.invoke('getCell', [11, 7]).textContent).toBe(helper.getInstance().sheets[0].rows[10].cells[7].value);
                    done();
                });
            });
        });
        it('Clipboard coverage', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            helper.invoke('copy', ['H11']).then(() => {
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.invoke('getCell', [11, 7]).textContent).toBe(helper.getInstance().sheets[0].rows[10].cells[7].value);
                    done();
                });
            });
        });
        it('Clipboard cut and paste methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const cellValue = helper.getInstance().sheets[0].rows[11].cells[7].value
            helper.invoke('cut', ['H12']).then(() => {
                spreadsheet.suspendRefresh();
                helper.invoke('paste', ['H2']);
                expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toBe(cellValue);
                expect(helper.invoke('getCell', [1, 7]).textContent).not.toBe(cellValue);
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.invoke('getCell', [1, 7]).textContent).toBe(cellValue);
                    done();
                });
            });
        });
        it('find methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.find({ value: '15', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'next', sheetIndex: 0 });
            expect(spreadsheet.sheets[0].activeCell).not.toBe('D3');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(spreadsheet.sheets[0].activeCell).toBe('D3');
                // Dialog path coverage
                spreadsheet.suspendRefresh();
                spreadsheet.find({ value: '15', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'next', sheetIndex: 0, showDialog: true });
                expect(helper.getElement().querySelector('.e-findtool-dlg')).toBeNull();
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.getElement().querySelector('.e-findtool-dlg')).not.toBeNull();
                    // Find 'syncfusion' with next option
                    spreadsheet.suspendRefresh();
                    spreadsheet.find({ value: 'syncfusion', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'next', sheetIndex: 0 });
                    spreadsheet.resumeRefresh();
                    setTimeout(() => {
                        // Find '15' with previous option
                        spreadsheet.suspendRefresh();
                        spreadsheet.find({ value: '15', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'previous', sheetIndex: 0 });
                        spreadsheet.resumeRefresh();
                        setTimeout(() => {
                            // Find 'syncfusion' with previous option
                            spreadsheet.suspendRefresh();
                            spreadsheet.find({ value: 'syncfusion', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'previous', sheetIndex: 0 });
                            spreadsheet.resumeRefresh();
                            setTimeout(() => {
                                done();
                            });
                        });
                    });
                });
            }, 30);
        });
        it('Replace methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.replace({ value: '15', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'Next', sheetIndex: 0, replaceValue: 'Replaced', replaceBy: 'All' });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[3].cells[4].value).toBe('Replaced');
                expect(helper.getInstance().sheets[0].rows[2].cells[3].value).toBe('Replaced');
                expect(helper.invoke('getCell', [3, 4]).textContent).not.toBe('Replaced');
                expect(helper.invoke('getCell', [2, 3]).textContent).not.toBe('Replaced');
                spreadsheet.resumeRefresh();
                expect(helper.invoke('getCell', [3, 4]).textContent).toBe('Replaced');
                expect(helper.invoke('getCell', [2, 3]).textContent).toBe('Replaced');
                // Dialog path coverage
                spreadsheet.suspendRefresh();
                spreadsheet.replace({ value: 'Replaced', isCSen: false, isEMatch: false, mode: 'Sheet', searchBy: 'Row', findOpt: 'Next', sheetIndex: 0, replaceValue: 'Again', replaceBy: 'All', showDialog: true });
                expect(helper.getElement().querySelector('.e-find-dlg')).toBeNull();
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.getElement().querySelector('.e-find-dlg')).not.toBeNull();
                    done();
                }, 50);
            });
        });
        it('calculateNow method', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.conditionalFormat
            setCell(1, 8, spreadsheet.sheets[0], { formula: '=SUM(H2:H3)', value: '#VALUE!' }); 
            expect(spreadsheet.sheets[0].rows[1].cells[8].value).toBe('#VALUE!');
            helper.invoke('updateCell', [{ value: '40' }, 'H2']);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!I2')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!I2')).toBeUndefined();
            spreadsheet.suspendRefresh();
            helper.invoke('calculateNow');
            expect(spreadsheet.sheets[0].rows[1].cells[8].value).toBe(90);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!I2').formulaValue).toBe(90);
            expect(helper.invoke('getCell', [1, 8]).textContent).not.toBe('90');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.invoke('getCell', [1, 8]).textContent).toBe('90');
                done();
            });
        });
        it('updateRange method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.suspendRefresh();
            spreadsheet.updateRange({ dataSource: [{ Company: 'Syncfusion' }], startCell: 'I1', showFieldAsHeader: false });
            // row/col count coverage
            spreadsheet.cellFormat({ fontStyle: 'italic' }, 'A15:A220');
            spreadsheet.cellFormat({ fontStyle: 'italic' }, 'J12:DA2');
            expect(spreadsheet.sheets[0].rowCount).toBe(220);
            expect(spreadsheet.sheets[0].colCount).toBe(105);
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe('Syncfusion');
                expect(helper.invoke('getCell', [0, 8]).textContent).not.toBe('Syncfusion');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.invoke('getCell', [0, 8]).textContent).toBe('Syncfusion');
                    done();
                });
            });
        });
    });
    describe('Suspend and resume refresh covered methods =>', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }], showCommentsPane: true }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Sheet operations methods', (done: Function) => {
            expect(helper.getInstance().showCommentsPane).toBe(true);
            const spreadsheet: Spreadsheet = helper.getInstance();
            // Insert sheet
            expect(spreadsheet.sheets.length).toBe(1);
            spreadsheet.suspendRefresh();
            spreadsheet.insertSheet(1, 3);
            expect(spreadsheet.sheets.length).toBe(4);
            expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).not.toBe(4);
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).toBe(4);
                // Duplicate sheet
                spreadsheet.suspendRefresh();
                spreadsheet.duplicateSheet(0);
                expect(spreadsheet.sheets.length).toBe(5);
                expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).not.toBe(5);
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).toBe(5);
                    expect(spreadsheet.activeSheetIndex).toEqual(1);
                    // Move sheet
                    spreadsheet.suspendRefresh();
                    spreadsheet.moveSheet(0);
                    expect(spreadsheet.activeSheetIndex).toEqual(0);
                    expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item')[0].childNodes[0].textContent).not.toBe('Sheet1 (2)');
                    spreadsheet.resumeRefresh();
                    setTimeout(() => {
                        expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item')[0].childNodes[0].textContent).toBe('Sheet1 (2)');
                        // delete Sheet
                        spreadsheet.suspendRefresh();
                        spreadsheet.delete(1, 4, 'Sheet');
                        expect(spreadsheet.sheets.length).toBe(1);
                        expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).not.toBe(1);
                        spreadsheet.resumeRefresh();
                        setTimeout(() => {
                            expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).toBe(1);
                            done();
                        }, 200);
                    }, 200);
                }, 200);
            }, 150);
        });
        it('selectRange and goTo methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            // Select Range
            spreadsheet.suspendRefresh();
            spreadsheet.selectRange('A1:A11');
            expect(spreadsheet.sheets[0].selectedRange).toBe('A1:A11');
            let selectionEle = spreadsheet.element.querySelector('.e-selection');
            expect(selectionEle.classList.contains('e-hide')).toBeTruthy();
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                selectionEle = spreadsheet.element.querySelector('.e-selection');
                expect(selectionEle.classList.contains('e-hide')).not.toBeTruthy();
                // goTo
                spreadsheet.suspendRefresh();
                spreadsheet.goTo('A1:A5');
                spreadsheet.resumeRefresh();
                // goTo Scroll
                spreadsheet.suspendRefresh();
                spreadsheet.goTo('K70');
                expect(spreadsheet.sheets[0].selectedRange).toBe('K70');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].selectedRange).toBe('K70:K70');
                    spreadsheet.duplicateSheet(0);
                    setTimeout(() => {
                        expect(spreadsheet.activeSheetIndex).toEqual(1);
                        spreadsheet.suspendRefresh();
                        spreadsheet.goTo('Sheet1 (2)!A1');
                        expect(spreadsheet.sheets[0].selectedRange).toBe('A1');
                        spreadsheet.resumeRefresh();
                        setTimeout(() => {
                            expect(spreadsheet.activeSheetIndex).toEqual(0);
                            done();
                        }, 100);
                    }, 50);
                }, 50);
            }, 50);
        });
        it('protect and unprotect sheet methods', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            // Protect Sheet
            spreadsheet.suspendRefresh();
            spreadsheet.protectSheet(0);
            expect(spreadsheet.sheets[0].isProtected).toBe(true);
            expect(getComputedStyle(helper.getElementFromSpreadsheet('.e-active-cell')).display).not.toBe('none');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(getComputedStyle(helper.getElementFromSpreadsheet('.e-active-cell')).display).toBe('none');
                // UnProtect Sheet
                spreadsheet.suspendRefresh();
                spreadsheet.unprotectSheet(0);
                expect(spreadsheet.sheets[0].isProtected).toBe(false);
                expect(getComputedStyle(helper.getElementFromSpreadsheet('.e-active-cell')).display).toBe('none');
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    expect(getComputedStyle(helper.getElementFromSpreadsheet('.e-active-cell')).display).not.toBe('none');
                    done();
                }, 100);
            }, 100);
        });
        it('Calculate with data source and suspended refresh queues updateSheetFromDataSource action', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            sheet.ranges = [{ dataSource: defaultData }];
            spreadsheet.suspendRefresh();
            helper.invoke('calculateNow');
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                expect(sheet).toBeDefined();
                expect(helper.invoke('getCell', [0, 0])).toBeDefined();
                done();
            }, 0);
        });
        it('clear methods covered all extra scenarios', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            spreadsheet.addHyperlink('www.google.com', 'A11', 'Google');
            helper.invoke('wrap', ['A11']);
            helper.invoke('insertImage', [[{src:"https://www.w3schools.com/images/w3schools_green.jpg", width: 110, height: 70, id: 'TestingImage' }], 'A11']);
            expect(JSON.stringify(spreadsheet.sheets[0].rows[10].cells[0].image[0])).toBe('{"src":"https://www.w3schools.com/images/w3schools_green.jpg","id":"TestingImage","height":70,"width":110,"top":200,"left":0}');
            expect(helper.invoke('getCell', [10, 0]).className).toContain('e-cell e-wraptext');
            spreadsheet.suspendRefresh();
            spreadsheet.clear({ type: 'Clear All', range: 'A11' });
            spreadsheet.resumeRefresh();
            setTimeout(() => {
                spreadsheet.suspendRefresh();
                spreadsheet.clear({ type: 'Clear Hyperlinks', range: 'A11' });
                let cellEle: HTMLElement = helper.invoke('getCell', [10, 0]);
                expect(cellEle.querySelector('.e-hyperlink')).not.toBeNull();
                spreadsheet.resumeRefresh();
                setTimeout(() => {
                    cellEle = helper.invoke('getCell', [10, 0]);
                    expect(cellEle.querySelector('.e-hyperlink')).toBeNull();
                    spreadsheet.suspendRefresh();
                    spreadsheet.clear({ type: 'Clear All', range: 'A11' });
                    expect(cellEle.textContent).not.toBe('');
                    spreadsheet.resumeRefresh();
                    setTimeout(() => {
                        cellEle = helper.invoke('getCell', [10, 0]);
                        expect(cellEle.textContent).toBe('');
                        expect(helper.invoke('getCell', [10, 0]).className).not.toContain('e-cell e-wraptext');
                        done();
                    });
                });
            });
        });
    });
});
