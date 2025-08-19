import { SpreadsheetHelper } from "../util/spreadsheethelper.spec";
import { defaultData, InventoryList } from '../util/datasource.spec';
import { SheetModel,CellModel, getCellAddress, Spreadsheet, ConditionalFormatModel, getRangeAddress, getCell, onContentScroll, ImageModel, Workbook } from '../../../src/index';
import { L10n, EventHandler } from '@syncfusion/ej2-base';

describe('Insert & Delete ->', () => {
    let helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');

    describe('public method ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert', (done: Function) => {
            helper.invoke('insertRow', [2, 3]);
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
            setTimeout(() => {
                expect(helper.invoke('getCell', [2, 0]).textContent).toBe('');
                expect(helper.invoke('getCell', [4, 0]).textContent).toBe('Sports Shoes');

                helper.invoke('insertColumn', [3, 4]);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[3]).toBeNull();
                    expect(helper.getInstance().sheets[0].rows[1].cells[3]).toEqual({ format: 'h:mm:ss AM/PM' });
                    expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('Quantity');
                    expect(helper.invoke('getCell', [0, 3]).textContent).toBe('');
                    expect(helper.invoke('getCell', [0, 5]).textContent).toBe('Quantity');

                    helper.invoke('insertSheet', [1, 2]);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[1].name).toBe('Sheet2');
                        expect(helper.getInstance().sheets[2].name).toBe('Sheet3');
                        expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).toBe(3);
                        done();
                    });
                });
            });
        });

        it('Delete', (done: Function) => {
            helper.invoke('delete', [6, 6, 'Row']);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toBe('Flip- Flops & Slippers');
                expect(helper.invoke('getCell', [6, 0]).textContent).toBe('Flip- Flops & Slippers');

                helper.invoke('delete', [6, 7, 'Column']);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toBe('Discount');
                    expect(helper.invoke('getCell', [0, 6]).textContent).toBe('Discount');

                    helper.invoke('delete', [1, 1, 'Sheet']);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[1].name).toBe('Sheet3');
                        expect(helper.getInstance().sheets[2]).toBeUndefined();
                        expect(helper.getElementFromSpreadsheet('.e-sheet-tab').getElementsByClassName('e-toolbar-item').length).toBe(2);
                        done();
                    });
                });
            });
        });
    });
    describe('UI interaction ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ name: 'Border Types', showGridLines: false }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.setBorder({ border: '1px solid #000000' }, 'B2:D5', 'Outer');
                    spreadsheet.setBorder({ border: '1px solid #000000' }, 'G2:I5', 'Inner');
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert row between borders', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.insertRow(2);
            expect(spreadsheet.sheets[0].rows[2].cells[1].style).toEqual(jasmine.objectContaining({ borderLeft: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[2].cells[3].style).toEqual(jasmine.objectContaining({ borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[2].cells[6].style).toEqual(jasmine.objectContaining({ borderBottom: '1px solid #000000', borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[2].cells[7].style).toEqual(jasmine.objectContaining({ borderLeft: '1px solid #000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[2].cells[8].style).toEqual(jasmine.objectContaining({ borderBottom: '1px solid #000000', borderLeft: '1px solid #000000' }));
            done();
        });
        it('Insert column between borders', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.insertColumn(7);
            expect(spreadsheet.sheets[0].rows[1].cells[7].style).toEqual(jasmine.objectContaining({ borderBottom: '1px solid #000000', borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[2].cells[7].style).toEqual(jasmine.objectContaining({ borderBottom: '1px solid #000000', borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[3].cells[7].style).toEqual(jasmine.objectContaining({ borderBottom: '1px solid #000000', borderTop: '1px solid #000000', borderRight: '1px solid #000000' }));
            expect(spreadsheet.sheets[0].rows[5].cells[7].style).toEqual(jasmine.objectContaining({ borderTop: '1px solid #000000', borderRight: '1px solid #000000' }));
            done();
        });
    });

    describe('Insert row and column before applying freeze pane  ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert row and column before applying freeze pane', (done: Function) => {
            helper.invoke('insertRow', [2, 3]);
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
            setTimeout(() => {
                expect(helper.invoke('getCell', [2, 0]).textContent).toBe('');
                expect(helper.invoke('getCell', [4, 0]).textContent).toBe('Sports Shoes');

                helper.invoke('insertColumn', [3, 4]);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[3]).toBeNull();
                    expect(helper.getInstance().sheets[0].rows[1].cells[3]).toEqual({ format: 'h:mm:ss AM/PM' });
                    expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('Quantity');
                    expect(helper.invoke('getCell', [0, 3]).textContent).toBe('');
                    expect(helper.invoke('getCell', [0, 5]).textContent).toBe('Quantity');
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.freezePanes(3,3,0);
                    let sheet: SheetModel; let childCount: number; let usedRange: string;
                    sheet = helper.getInstance().getActiveSheet();
                    expect(sheet.paneTopLeftCell).toBe('D4');
                    done();
                },0);
            },0);
        });
        it('EJ2-914962 - Sheet tab actions can be performed through methods when workbook is protected', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const workbook: Workbook = helper.getInstance();
            expect(spreadsheet.sheets.length).toBe(1);
            expect(workbook.isProtected).toBe(false);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_protectworkbook').click();
            (document.getElementsByClassName('e-primary')[1] as HTMLElement).click();
            expect(workbook.isProtected).toBe(true);
            helper.invoke('insertSheet', [1, 1]);
            expect(spreadsheet.sheets.length).toBe(1);
            helper.invoke('duplicateSheet', [1]);
            expect(spreadsheet.sheets.length).toBe(1);
            done();
        });
    });

    describe('UI-Interaction->', () => {
        beforeAll((done: Function) => {
            L10n.load({
                'de-DE': {
                    'spreadsheet': {
                        'InsertRow': 'Zeile einf�gen',
                        'DeleteRow': 'Zeile l�schen',
                        'InsertColumn': 'Spalte einf�gen',
                        'DeleteColumn': 'Spalte l�schen',
                    }
                }
            });
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] , locale:'de-DE' }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert Row-Before->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(1, 0, [6, 1], true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1]).toEqual({});
                expect(helper.invoke('getCell', [1, 0]).textContent).toBe('');
                expect(helper.invoke('getCell', [2, 0]).textContent).toBe('Casual Shoes');
                done();
            });
        });

        it('Insert Row-after->', (done: Function) => {
            helper.invoke('selectRange', ['A3']);
            helper.openAndClickCMenuItem(2, 0, [6, 2], true);
            setTimeout(() => {
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[3])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
                expect(helper.invoke('getCell', [3, 0]).textContent).toBe('');
                expect(helper.invoke('getCell', [4, 0]).textContent).toBe('Sports Shoes');
                done();
            });
        });

        it('Delete Row->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            helper.openAndClickCMenuItem(1, 0, [7], true);
            setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toBe('Casual Shoes');
                    expect(helper.invoke('getCell', [1, 0]).textContent).toBe('Casual Shoes');
                    done();
            });
        });

        it('Insert Column-Before->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            helper.openAndClickCMenuItem(0, 1, [6, 1], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[1]).toBeNull();
                expect(helper.invoke('getCell', [0, 1]).textContent).toBe('');
                expect(helper.invoke('getCell', [0, 2]).textContent).toBe('Date');
                done();
            }, 20);
        });

        it('Insert Column-After->', (done: Function) => {
            helper.invoke('selectRange', ['C1']);
            helper.openAndClickCMenuItem(0, 2, [6, 2], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[3]).toBeNull();
                expect(helper.invoke('getCell', [0, 3]).textContent).toBe('');
                expect(helper.invoke('getCell', [0, 4]).textContent).toBe('Time');
                done();
            }, 10);
        });

        it('Delete Column->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBe('Date');
                expect(helper.invoke('getCell', [0, 1]).textContent).toBe('Date');
                expect(helper.getInstance().sheets[0].rows[0].cells[2]).toBeNull();
                done();
            });
        });
    });
    
    describe('UI-Interaction with Localization and Protect Sheet->', () => {
        beforeAll((done: Function) => {
            L10n.load({
                'de-DE': {
                    'spreadsheet': {
                        'InsertRow': 'Zeile einf�gen',
                        'DeleteRow': 'Zeile l�schen',
                        'InsertColumn': 'Spalte einf�gen',
                        'DeleteColumn': 'Spalte l�schen',
                    }
                }
            });
            helper.initializeSpreadsheet({ sheets: [{ isProtected: true, protectSettings: { selectCells: true, formatCells: true, formatRows: true, insertLink:
                false, formatColumns: true }, ranges: [{ dataSource: defaultData }] }] , locale:'de-DE' }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert/Delete Row Checking ->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            let cell: HTMLElement = (helper.getElement('#' + helper.id + ' .e-rowhdr-table') as HTMLTableElement).rows[1].cells[0];
            let coords: DOMRect = <DOMRect>cell.getBoundingClientRect();
            helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, cell);
            setTimeout(() => {
                expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(6)').classList).toContain('e-disabled');
                expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(7)').classList).toContain('e-disabled');
                done();
            });
        });
        
        it('Insert/Delete Column Checking ->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            let cell: HTMLElement = (helper.getElement('#' + helper.id + ' .e-colhdr-table') as HTMLTableElement).rows[0].cells[1];
            let coords: DOMRect = <DOMRect>cell.getBoundingClientRect();
            helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, cell);
            setTimeout(() => {
                expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(6)').classList).toContain('e-disabled');
                expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(7)').classList).toContain('e-disabled');
                done();
            });
        });

        it('Hyperlink Checking ->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            const td: HTMLTableCellElement = helper.invoke('getCell', [0, 0]);
            const coords: DOMRect = <DOMRect>td.getBoundingClientRect();
            helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, td);
            setTimeout(() => {
                expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(11)').classList).toContain('e-disabled');
                done();
            });
        });
    });

    describe('UI_Interaction for Delete/Insert Row/Column with Freeze Pane', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }], frozenRows:5, frozenColumns: 4 }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Delete Row above Freeze pane applied row->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toBe('Sports Shoes');
            expect(helper.invoke('getCell', [2, 0]).textContent).toBe('Sports Shoes');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(1, 0, [7], true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toBe('Sports Shoes');
                expect(helper.invoke('getCell', [1, 0]).textContent).toBe('Sports Shoes');
                done();
            });
        });

        it('Delete Row below Freeze pane applied row->', (done: Function) => {
            helper.invoke('selectRange', ['A6']);
            expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toBe('Running Shoes');
            expect(helper.invoke('getCell', [6, 0]).textContent).toBe('Running Shoes');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(5, 0, [7], true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBe('Running Shoes');
                expect(helper.invoke('getCell', [5, 0]).textContent).toBe('Running Shoes');
                done();
            });
        });

        it('Delete Column before Freeze pane applied Column->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toBe('Time');
            expect(helper.invoke('getCell', [0, 2]).textContent).toBe('Time');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBe('Time');
                expect(helper.invoke('getCell', [0, 1]).textContent).toBe('Time');
                done();
            });
        });

        it('Delete Column after Freeze pane applied Column->', (done: Function) => {
            helper.invoke('selectRange', ['E1']);
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toBe('Discount');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('Discount');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 4, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[4].value).toBe('Discount');
                expect(helper.invoke('getCell', [0, 4]).textContent).toBe('Discount');
                done();
            });
        });

        it('Insert Row above Freeze pane applied row->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toBe('Sports Shoes');
            expect(helper.invoke('getCell', [1, 0]).textContent).toBe('Sports Shoes');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(1, 0, [6, 1], true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toBe('Sports Shoes');
                expect(helper.invoke('getCell', [2, 0]).textContent).toBe('Sports Shoes');
                done();
            });
        });

        it('Insert Column before Freeze pane applied Column->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBe('Time');
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('Time');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 1, [6, 1], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toBe('Time');
                expect(helper.invoke('getCell', [0, 2]).textContent).toBe('Time');
                done();
            });
        });

        it('Insert Row before Freeze Column applied Cell->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.unfreezePanes(0);
            setTimeout(() => {
                spreadsheet.freezePanes(0,3,0);
                setTimeout(() => {
                    helper.invoke('selectRange', ['A5']);
                    expect(helper.getInstance().sheets[0].rows[4].cells[0].value).toBe('Sandals & Floaters');
                    expect(helper.invoke('getCell', [4, 0]).textContent).toBe('Sandals & Floaters');
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(4, 0, [6, 1], true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBe('Sandals & Floaters');
                        expect(helper.invoke('getCell', [5, 0]).textContent).toBe('Sandals & Floaters');
                        done();
                    });
                });
            });
        });

        it('Insert Column before Freeze Row applied Cell->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.unfreezePanes(0);
            setTimeout(() => {
                spreadsheet.freezePanes(7,0,0);
                setTimeout(() => {
                    helper.invoke('selectRange', ['E1']);
                    expect(helper.getInstance().sheets[0].rows[0].cells[4].value).toBe('Price');
                    expect(helper.invoke('getCell', [0, 4]).textContent).toBe('Price');
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(0, 4, [6, 1], false, true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toBe('Price');
                    expect(helper.invoke('getCell', [0, 5]).textContent).toBe('Price');
                        done();
                    });
                });
            });
        });

        it('Insert Row before Freeze Row applied Cell->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.sheets[0].paneTopLeftCell = 'A38'
            spreadsheet.dataBind();
            setTimeout(() => {
                helper.invoke('selectRange', ['A7']);
                expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toBe('Running Shoes');
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(6, 0, [6, 2], true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[8].cells[0].value).toBe('Running Shoes');
                    expect(helper.invoke('getCell', [8, 0]).textContent).toBe('Running Shoes');
                    done();
                });
            });
        });
    });

    describe('UI_Interaction for Delete with Enable Virtualization - false', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ rowCount: 20, colCount: 100, ranges: [{ dataSource: defaultData }] }], scrollSettings: { enableVirtualization: false } }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('EJ2-895900 - Formatting not applied while inserting the row between the formatted rows', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.cellFormat({ backgroundColor: '#FFFF00', border:'1px solid #000000', fontWeight: 'bold' }, 'A4:C6');
            expect(spreadsheet.sheets[0].rows[4].cells[0].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.insertRow(5);
            expect(spreadsheet.sheets[0].rows[5].cells[0].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.cellFormat({ backgroundColor: '#FFFF00', border:'1px solid #000000', fontWeight: 'bold' }, 'A12:C12');
            expect(spreadsheet.sheets[0].rows[11].cells[0].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.insertRow(12);
            expect(spreadsheet.sheets[0].rows[12].cells[0].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold' });
            expect(spreadsheet.sheets[0].rows[12].cells[0].style.borderLeft).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[12].cells[0].style.borderRight).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[12].cells[0].style.borderTop).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[12].cells[0].style.borderBottom).toBeUndefined();
            done();
        });

        it('EJ2-895900 - Formatting not applied while inserting the column between the formatted columns', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.cellFormat({ backgroundColor: '#FFFF00', border:'1px solid #000000', fontWeight: 'bold' }, 'D3:F5');
            expect(spreadsheet.sheets[0].rows[2].cells[3].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.insertColumn(4);
            expect(spreadsheet.sheets[0].rows[2].cells[4].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.cellFormat({ backgroundColor: '#FFFF00', border:'1px solid #000000', fontWeight: 'bold' }, 'I3:I5');
            expect(spreadsheet.sheets[0].rows[2].cells[8].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold', borderLeft:'1px solid #000000', borderRight: '1px solid #000000', borderTop:'1px solid #000000',borderBottom:'1px solid #000000' });
            spreadsheet.insertColumn(9);
            expect(spreadsheet.sheets[0].rows[2].cells[9].style).toEqual({ backgroundColor: '#FFFF00', fontWeight: 'bold' });
            expect(spreadsheet.sheets[0].rows[2].cells[9].style.borderLeft).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[2].cells[9].style.borderRight).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[2].cells[9].style.borderTop).toBeUndefined();
            expect(spreadsheet.sheets[0].rows[2].cells[9].style.borderBottom).toBeUndefined();
            done();
        });
        
        it('Delete Row with enable virtualization False->', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toBe('Sports Shoes');
            expect(helper.invoke('getCell', [2, 0]).textContent).toBe('Sports Shoes');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(1, 0, [7], true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toBe('Sports Shoes');
                expect(helper.invoke('getCell', [1, 0]).textContent).toBe('Sports Shoes');
                done();
            });
        });

        it('Delete Column with enable virtualization False->', (done: Function) => {
            helper.invoke('selectRange', ['B1']);
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toBe('Time');
            expect(helper.invoke('getCell', [0, 2]).textContent).toBe('Time');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBe('Time');
                expect(helper.invoke('getCell', [0, 1]).textContent).toBe('Time');
                done();
            });
        });
    });
    
    describe('UI_Interaction for Delete with Image', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Delete Column with enable virtualization False->', (done: Function) => {
            helper.invoke('insertImage', [[{src:"https://www.w3schools.com/images/w3schools_green.jpg", height: 400, width: 400}], 'D3']);
            let image: ImageModel = helper.getInstance().sheets[0].rows[2].cells[3].image[0];
            expect(image.height).toBe(400);
            expect(image.width).toBe(400);
            expect(image.src).toBe('https://www.w3schools.com/images/w3schools_green.jpg');
            expect(image.top).toBe(40);
            expect(image.left).toBe(192);
            expect(helper.getElement('#' + image.id).style.left).toBe('192px');
            EventHandler.remove(document, 'mouseup', helper.getInstance().serviceLocator.services.shape.overlayMouseUpHandler);
            helper.invoke('selectRange', ['B1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout(() => {
                image = helper.getInstance().sheets[0].rows[2].cells[2].image[0];
                expect(image.height).toBe(400);
                expect(image.width).toBe(400);
                expect(image.src).toBe('https://www.w3schools.com/images/w3schools_green.jpg');
                expect(image.top).toBe(40);
                expect(image.left).toBe(128);
                expect(helper.getElement('#' + image.id).style.left).toBe('128px');
                done();
            });
        });
        it('EJ2-886475 - Wrap text option is not enabled for newly inserted column and row', (done: Function) => {
            helper.invoke('selectRange', ['A15']);
            helper.click('#spreadsheet_wrap');
            expect(helper.getInstance().sheets[0].rows[14].cells[0].wrap).toBe(true);
            helper.invoke('selectRange', ['J1']);
            helper.click('#spreadsheet_wrap');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].wrap).toBe(true);
            helper.invoke('insertRow', [15]);
            helper.invoke('insertColumn', [10]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[15].cells[0].wrap).toBe(true);
                expect(helper.getInstance().sheets[0].rows[0].cells[10].wrap).toBe(true);
                done();
            });
        });
        it('EJ2-941153 - Redo action does not retain formatting for inserted rows and columns', (done: Function) => {
            helper.invoke('selectRange', ['I1']);
            helper.invoke('cellFormat', [{ backgroundColor: '#ffff00' }]);
            expect(helper.getInstance().sheets[0].rows[0].cells[8].style.backgroundColor).toBe('#ffff00');
            helper.openAndClickCMenuItem(0, 8, [6,2], false, true);
            setTimeout(function () {
                expect(helper.getInstance().sheets[0].rows[0].cells[9].style.backgroundColor).toBe('#ffff00');
                helper.getElement('#' + helper.id + '_undo').click();
                helper.getElement('#' + helper.id + '_redo').click();
                expect(helper.getInstance().sheets[0].rows[0].cells[9].style.backgroundColor).toBe('#ffff00');
                done();
            });
        });
    });

    describe('UI_Interaction', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Delete Column with Reverse Selection->', (done: Function) => {
            helper.invoke('selectRange', ['H1:G1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 8, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6]).toBeUndefined();
                expect(helper.getInstance().sheets[0].rows[0].cells[7]).toBeUndefined();
                done();
            });
        });
        it('Delete Column after Used Range->', (done: Function) => {
            helper.invoke('selectRange', ['G1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 6, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6]).toBeUndefined();
                done();
            });
        });
        it('Delete Column with Used Range and Empty Column->', (done: Function) => {
            helper.invoke('selectRange', ['F1:G1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 5, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[5]).toBeUndefined();
                done();
            });
        });
        it('Delete 2nd Column in Merged Cell->', (done: Function) => {
            helper.invoke('merge', ['B1:C1']);
            helper.invoke('selectRange', ['C2']);
            setTimeout(() => {
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 2, [7], false, true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBe('Date');
                    expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toBe('Quantity');
                    done();
                });
            });
        });
        it('Delete 1st Column in Merged Cell->', (done: Function) => {
            helper.click('#spreadsheet_undo');
            helper.invoke('merge', ['B1:C1']);
            helper.invoke('selectRange', ['B2']);
            setTimeout(() => {
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 1, [7], false, true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toBeUndefined();
                    expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toBe('Quantity');
                    done();
                });
            });
        });
        it('Delete Row after Used Range->', (done: Function) => {
            helper.invoke('selectRange', ['A12']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(11, 0, [7], true, false);
            setTimeout(() => {
                expect(helper.invoke('getCell', [11, 0]).textContent).toBe('');
                done();
            });
        });
        it('Delete Row with Used Range and Empty Row->', (done: Function) => {
            helper.invoke('selectRange', ['A11:A12']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(11, 0, [7], true, false);
            setTimeout(() => {
                expect(helper.invoke('getCell', [10, 0]).textContent).toBe('');
                done();
            });
        });
        it('Delete 2nd Row in Merged Cell->', (done: Function) => {
            helper.invoke('merge', ['A6:A7']);
            helper.invoke('selectRange', ['B7']);
            setTimeout(() => {
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(6, 0, [7], true, false);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBe('Flip- Flops & Slippers');
                    expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toBe('Running Shoes');
                    done();
                });
            });
        });
        it('Delete 1st Row in Merged Cell->', (done: Function) => {
            helper.click('#spreadsheet_undo');
            helper.invoke('merge', ['A6:A7']);
            helper.invoke('selectRange', ['B6']);
            setTimeout(() => {
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(5, 0, [7], true, false);
                setTimeout(() => {
                    expect(helper.invoke('getCell', [5, 0]).textContent).toBe('');
                    expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toBe('Running Shoes');
                    done();
                });
            });
        });
        it('Delete all Used Range Rows->', (done: Function) => {
            helper.invoke('selectRange', ['A1:A9']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 0, [7], true, false);
            setTimeout(() => {
                expect(helper.invoke('getCell', [0, 0]).textContent).toBe('');
                done();
            });
        });
        it('Delete Column with Unique Formula applied Column->', (done: Function) => {
            helper.click('#spreadsheet_undo');
            helper.invoke('selectRange', ['I1']);
            helper.invoke('updateCell', [{ formula: '=UNIQUE(D2:D11)' }]);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 9, [7], false, true);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[8]).toBeUndefined();
                done();
            });
        });
        it('Delete Row with Unique Formula applied Row->', (done: Function) => {
            helper.invoke('selectRange', ['A12']);
            helper.invoke('updateCell', [{ formula: '=UNIQUE(A2:H2)' }]);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(11, 0, [7], true, false);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[11]).toBeUndefined();
                done();
            });
        });
    });

    describe('Delete conditional formatting applied rows and columns->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }],
                    conditionalFormats: [{ type: 'BlueDataBar', range: 'E2:H11' }]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A1:H1');
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Delete by selecting cf applied and non cf applied column ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange('D1:E1');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 3, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("D2:F11");
                done();
            });
        });
        it('Undo after deleting by selecting cf applied and non cf applied column ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.undo(); 
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H11");
                done();
            });
        });
        it('Delete by selecting cf applied and non cf applied column II->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange('D1:G1');
            helper.openAndClickCMenuItem(0, 3, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("D2:D11");
                done();
            });
        });
        it('Undo after deleting by selecting cf applied and non cf applied column II->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.undo(); 
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H11");
                done();
            });
        });
        it('Delete by selecting cf applied and non cf applied row ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange('A1:A2');
            helper.openAndClickCMenuItem(0, 0, [7], true, false);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E1:H9");
                done();
            });
        });
        it('Undo after deleting by selecting cf applied and non cf applied row ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.undo(); 
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H11");
                done();
            });
        });
        it('Delete by selecting cf applied and non cf applied row II->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange('A3:A13');
            helper.openAndClickCMenuItem(2, 0, [7], true, false);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H2");
                done();
            });
        });
        it('Undo after deleting by selecting cf applied and non cf applied row ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.undo(); 
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H11");
                done();
            });
        });
        it('Delete by selecting cf applied and non cf applied row III->', (done: Function) => {
            helper.edit('A12', '12');
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange('A11:A12');
            helper.openAndClickCMenuItem(10, 0, [7], true, false);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H10");
                done();
            });
        });
        it('Undo after deleting by selecting cf applied and non cf applied row ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.undo(); 
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E2:H11");
                done();
            });
        });
    });
    
    describe('CR-Issues ->', () => {
        describe('I289560 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({}, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Issue with data updation in the inserted column ', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.insertColumn(1);
                setTimeout((): void => {
                    const cellsModel: CellModel[] = [{ value: 'Unit Price', style: { fontWeight: 'bold', textAlign: 'center' } }, { value: '18.00' },
                        { value: '19.00' }, { value: '10.00' }, { value: '22.00' }, { value: '21.35' }, { value: '25.00' }, { value: '30.00' },
                        { value: '21.00' }, { value: '40.00' }, { value: '97.00' }];
                    let rowIndex: number = 1;
                    cellsModel.forEach((cell: CellModel): void => {
                        spreadsheet.updateCell(cell, getCellAddress(rowIndex, 1)); rowIndex++;
                    });
                    expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBe('Unit Price');
                    expect(helper.invoke('getCell', [1, 1]).textContent).toBe('Unit Price');
                    expect(spreadsheet.sheets[0].rows[2].cells[1].value.toString()).toBe('18');
                    expect(helper.invoke('getCell', [2, 1]).textContent).toBe('18');
                    expect(spreadsheet.sheets[0].rows[11].cells[1].value.toString()).toBe('97');
                    expect(helper.invoke('getCell', [11, 1]).textContent).toBe('97');
                    done();
                });
            });
        });
        describe('fb16095, I284821, I309406, F161227, I282799, I282799 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet(
                    { showSheetTabs: false, definedNames: [{ name: 'definedRange', refersTo: "='Sheet1'!A1:C3" }], sheets: [{ rows: [{ cells:
                    [{ value: '10' }] }, { cells: [{ value: '5' }] }, { cells: [{ formula: '=SUM(A1:A2)' }] }] }] }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('After insert new row cell edit is not working and update formula while insert/delete the rows/columns in calculate library', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.definedNames[0].refersTo).toBe("='Sheet1'!A1:C3");
                expect(spreadsheet.sheets[0].rows[2].cells[0].formula).toBe('=SUM(A1:A2)');
                spreadsheet.insertRow(1);
                setTimeout((): void => {
                    expect(spreadsheet.definedNames[0].refersTo).toBe("='Sheet1'!A1:C4");
                    expect(spreadsheet.sheets[0].rows[3].cells[0].formula).toBe('=SUM(A1:A3)');
                    helper.edit('A2', '20');
                    setTimeout((): void => {
                        expect(spreadsheet.sheets[0].rows[1].cells[0].value.toString()).toBe('20');
                        expect(helper.invoke('getCell', [1, 0]).textContent).toBe('20');
                        expect(spreadsheet.sheets[0].rows[3].cells[0].value.toString()).toBe('35');
                        expect(helper.invoke('getCell', [3, 0]).textContent).toBe('35');
                        done();
                    }, 20);
                });
            });
        });
        describe('I312024 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ name: 'Default' }, { name: 'Deleted' }] }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Sheets property issue in delete method', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets.length).toBe(2);
                spreadsheet.delete(1);
                setTimeout((): void => {
                    expect(spreadsheet.sheets.length).toBe(1);
                    expect(helper.getElements('#' + helper.id + ' .e-sheet-tab .e-toolbar-item').length).toBe(1);
                    done();
                });
            });
        });
        describe('F161685, I311828, I315412 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ name: 'Sheet1' }, { name: 'Sheet2' }] }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Issue with insertSheet method while passing the index argument and usedRange not updated properly with the inserted sheets', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets.length).toBe(2);
                spreadsheet.insertSheet([{ index: 2, name: 'Inserted Sheet' }]);
                setTimeout((): void => {
                    expect(spreadsheet.sheets.length).toBe(3);
                    expect(spreadsheet.sheets[2].usedRange.rowIndex).toBe(0);
                    expect(spreadsheet.sheets[2].usedRange.colIndex).toBe(0);
                    expect(helper.getElements('#' + helper.id + ' .e-sheet-tab .e-toolbar-item').length).toBe(3);
                    done();
                });
            });
        });
        describe('I309292 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({ allowInsert: false, allowDelete: false }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Insert delete disable issues in context menu', (done: Function) => {
                const cell: HTMLElement = (helper.getElement('#' + helper.id + ' .e-colhdr-table') as HTMLTableElement).rows[0].cells[2];
                helper.triggerMouseAction(
                    'contextmenu', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 }, null,
                    cell);
                setTimeout((): void => {
                    expect(helper.getElement('#' + helper.id + '_cmenu_insert_column').classList).toContain('e-disabled');
                    expect(helper.getElement('#' + helper.id + '_cmenu_delete_column').classList).toContain('e-disabled');
                    done();
                });
            });
        });
        describe('SF-359221 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({ sheets:[{rowCount:100, colCount:100}], scrollSettings: { enableVirtualization: false} }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Insert row not working properly while virtual scrolling is disabled', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.insertRow();
                spreadsheet.insertColumn();
                setTimeout((): void => {
                    expect((spreadsheet.getRow(0) as any).ariaRowIndex).toBe('1');
                    expect(spreadsheet.getColumnHeaderContent().getElementsByClassName("e-header-cell")[0].textContent).toBe("A");
                    done();
                });
            });
        });

        describe('Insert column with conditional formatting ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        name: 'Inventory List', ranges: [{ dataSource: InventoryList, startCell: 'A2' }],
                        conditionalFormats: [
                            { type: 'GYRColorScale', range: 'C3:C18' },
                        ]
                    }],
                    created: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A2:H2');
                        spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                        spreadsheet.numberFormat('$#,##0.00', 'F3:F18');
                        spreadsheet.conditionalFormat({ type: 'LessThan', value: '12', range: 'D3:F18' });
                    }
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Insert column before - 1 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 0, spreadsheet.sheets[0].rowCount, 1]));
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 1, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:E18");
                    expect(cfRule[1].range).toEqual("F3:H18");
                    done();
                });
            });
            it('Insert column before -  1 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("C3:C18");
                expect(cfRule[1].range).toEqual("D3:F18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:E18");
                expect(cfRule[1].range).toEqual("F3:H18");
                done();
            });
            it('Insert column before - 2 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 3, spreadsheet.sheets[0].rowCount, 4])); //D1:E200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 4, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:G18");
                    expect(cfRule[1].range).toEqual("H3:J18");
                    done();
                });
            });
            it('Insert column before -  2 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:E18");
                expect(cfRule[1].range).toEqual("F3:H18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:G18");
                expect(cfRule[1].range).toEqual("H3:J18");
                done();
            });

            it('Insert column before - 3 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 6, spreadsheet.sheets[0].rowCount, 6])); //G1:G200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 6, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:H18");
                    expect(cfRule[1].range).toEqual("I3:K18");
                    done();
                });
            });
            it('Insert column before -  3 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:G18");
                expect(cfRule[1].range).toEqual("H3:J18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                done();
            });

            it('Insert column before - 4 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 7, spreadsheet.sheets[0].rowCount, 8])); //H1:I200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 8, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:J18");
                    expect(cfRule[1].range).toEqual("K3:M18");
                    done();
                });
            });

            it('Insert column before -  4 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:M18");
                done();
            });

            it('Insert column before - 5 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 11, spreadsheet.sheets[0].rowCount, 12])); //L1:M200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 12, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:J18");
                    expect(cfRule[1].range).toEqual("K3:O18");
                    done();
                });
            });
            it('Insert column before -  5 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:M18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:O18");
                done();
            });
            it('Insert column before - 6 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 14, spreadsheet.sheets[0].rowCount, 15])); //O1:P200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 15, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:J18");
                    expect(cfRule[1].range).toEqual("K3:Q18");
                    done();
                });
            });

            it('Insert column before -  6 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:O18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:Q18");
                done();
            });

            it('Insert column before - 7 using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 17, spreadsheet.sheets[0].rowCount, 18])); //R1:S200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 18, [6, 1], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("G3:J18");
                    expect(cfRule[1].range).toEqual("K3:Q18");
                    done();
                });
            });
            it('Insert column before -  7 Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("G3:J18");
                expect(cfRule[1].range).toEqual("K3:Q18");
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("C3:C18");
                expect(cfRule[1].range).toEqual("D3:F18");
                done();
            });

            it('Insert column after - 1 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 0, spreadsheet.sheets[0].rowCount, 1])); //A1:B200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 1, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:E18");
                    expect(cfRule[1].range).toEqual("F3:H18");
                    done();
                });
            });

            it('Insert column after - 1 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("C3:C18");
                expect(cfRule[1].range).toEqual("D3:F18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:E18");
                expect(cfRule[1].range).toEqual("F3:H18");
                done();
            });

            it('Insert column after - 2 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 4, spreadsheet.sheets[0].rowCount, 4])); //E1:E200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 4, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:F18");
                    expect(cfRule[1].range).toEqual("G3:I18");
                    done();
                });
            });

            it('Insert column after - 2 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:E18");
                expect(cfRule[1].range).toEqual("F3:H18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:F18");
                expect(cfRule[1].range).toEqual("G3:I18");
                done();
            });

            it('Insert column after - 3 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 4, spreadsheet.sheets[0].rowCount, 5])); //E1:F200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 5, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:H18");
                    expect(cfRule[1].range).toEqual("I3:K18");
                    done();
                });
            });

            it('Insert column after - 3 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:F18");
                expect(cfRule[1].range).toEqual("G3:I18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                done();
            });

            it('Insert column after - 4 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 10, spreadsheet.sheets[0].rowCount, 11])); //K1:L200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 11, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:H18");
                    expect(cfRule[1].range).toEqual("I3:K18");
                    done();
                });
            });

            it('Insert column after - 4 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                done();
            });

            it('Insert column after - 5 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 9, spreadsheet.sheets[0].rowCount, 9])); //J1:J200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 9, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:H18");
                    expect(cfRule[1].range).toEqual("I3:L18");
                    done();
                });
            });

            it('Insert column after - 5 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:K18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:L18");
                done();
            });

            it('Insert column after - 6 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 12, spreadsheet.sheets[0].rowCount, 12])); //M1:M200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 12, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:H18");
                    expect(cfRule[1].range).toEqual("I3:L18");
                    done();
                });
            });

            it('Insert column after - 6 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:L18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:L18");
                done();
            });

            it('Insert column after - 7 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([0, 4, spreadsheet.sheets[0].rowCount, 6])); //D1:F200
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 6, [6, 2], false, true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("E3:K18");
                    expect(cfRule[1].range).toEqual("L3:O18");
                    done();
                });
            });

            it('Insert column after - 7 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:H18");
                expect(cfRule[1].range).toEqual("I3:L18");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("E3:K18");
                expect(cfRule[1].range).toEqual("L3:O18");
                done();
            });

        });

        describe('Insert row above with conditional formatting ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        name: 'Inventory List', ranges: [{ dataSource: InventoryList, startCell: 'A2' }],
                        conditionalFormats: [
                            { type: 'GYRColorScale', range: 'A3:AA3' },
                        ]
                    }],
                    created: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A2:H2');
                        spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                        spreadsheet.numberFormat('$#,##0.00', 'F3:F18');
                        spreadsheet.conditionalFormat({ type: 'LessThan', value: '12', range: 'A6:AA8' });
                    }
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });

            it('Insert row above - 1 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([1, 0, 1, spreadsheet.sheets[0].colCount])); //A2:Z2
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(1, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A4:AA4");
                    expect(cfRule[1].range).toEqual("A7:AA9");
                    done();
                });
            });

            it('Insert row above - 1 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:AA3");
                expect(cfRule[1].range).toEqual("A6:AA8");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA4");
                expect(cfRule[1].range).toEqual("A7:AA9");
                done();
            });

            it('Insert row above - 2 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([3, 0, 3, spreadsheet.sheets[0].colCount])); //A4:AA4
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(3, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A4:AA5");
                    expect(cfRule[1].range).toEqual("A8:AA10");
                    done();
                });
            });
            it('Insert row above - 2 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA4");
                expect(cfRule[1].range).toEqual("A7:AA9");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA5");
                expect(cfRule[1].range).toEqual("A8:AA10");
                done();
            });
            it('Insert row above - 3 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([2, 0, 4, spreadsheet.sheets[0].colCount])); //A3:AA5
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(4, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A7:AA8");
                    expect(cfRule[1].range).toEqual("A11:AA13");
                    done();
                });
            });
            it('Insert row above - 3 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA5");
                expect(cfRule[1].range).toEqual("A8:AA10");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A7:AA8");
                expect(cfRule[1].range).toEqual("A11:AA13");
                done();
            });
            it('Insert row above - 4 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([10, 0, 11, spreadsheet.sheets[0].colCount])); //A11:AA12
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(11, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A7:AA8");
                    expect(cfRule[1].range).toEqual("A11:AA15");
                    done();
                });
            });
            it('Insert row above - 4 - Undo and Redo', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.click('#spreadsheet_undo');
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A7:AA8");
                expect(cfRule[1].range).toEqual("A11:AA13");
                helper.click('#spreadsheet_redo');
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A7:AA8");
                expect(cfRule[1].range).toEqual("A11:AA15");
                done();
            });
            it('Insert row above - 5 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([14, 0, 15, spreadsheet.sheets[0].colCount])); //A15:AA16
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(15, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A7:AA8");
                    expect(cfRule[1].range).toEqual("A11:AA17");
                    done();
                });
            });

            it('Insert row above - 6 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([18, 0, 19, spreadsheet.sheets[0].colCount])); //A19:AA20
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(19, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A7:AA8");
                    expect(cfRule[1].range).toEqual("A11:AA17");
                    done();
                });
            });

            it('Insert row above - 7 - using contextmenu', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange(getRangeAddress([9, 0, 17, spreadsheet.sheets[0].colCount])); //A10:AA18
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(17, 0, [6, 1], true);
                setTimeout((): void => {
                    const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                    expect(cfRule[0].range).toEqual("A7:AA8");
                    expect(cfRule[1].range).toEqual("A20:AA26");
                    done();
                });
            });
        });
        describe('SF-371630', () => {
            let sheet: any;
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    { sheets: [{ ranges: [{ dataSource: defaultData }], rows: [{ index: 11, cells: [{ index: 4, formula: '=SUM(D2:E11)'
                }] }], selectedRange: 'D3' }] }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Formula reference not updated while deleting row', (done: Function) => {
                sheet = helper.getInstance().sheets[0];
                expect(sheet.rows[11].cells[4].formula).toEqual('=SUM(D2:E11)');
                expect(sheet.rows[11].cells[4].value).toEqual(452);
                expect(helper.invoke('getCell', [11, 4]).textContent).toEqual('452');
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(2, 0, [7], true);
                setTimeout((): void => {
                    expect(sheet.rows[10].cells[4].formula).toEqual('=SUM(D2:E10)');
                    expect(sheet.rows[10].cells[4].value).toEqual(402);
                    expect(helper.invoke('getCell', [10, 4]).textContent).toEqual('402');
                    done();
                });
            });
            it('Formula reference not updated while deleting column', (done: Function) => {
                helper.openAndClickCMenuItem(0, 3, [7], false, true);
                setTimeout((): void => {
                    expect(sheet.rows[10].cells[3].formula).toEqual('=SUM(D2:D10)');
                    expect(sheet.rows[10].cells[3].value).toEqual(145);
                    expect(helper.invoke('getCell', [10, 3]).textContent).toEqual('145');
                    done();
                });
            });
        });
        describe('EJ2-64171 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet(
                    { sheets: [{ rows: [{ cells: [{ value: '1' }, { value: '2' }, { value: '3' }, { formula: '=SUM(A1:C1)' }, { formula: '=SUM(C1:A1)' }] },  { cells: [{ value: '2'}] }, { cells: [{ value: '3' }] }, { cells: [{ formula: '=SUM(A1:A3)' }] }, { cells: [{ formula: '=SUM(A3:A1)' }] }] }] }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Reverse ranges used in formulas not works properly while inserting rows', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.insertRow(2, 2);
                spreadsheet.insertColumn(2, 2);
                setTimeout(function () {
                    expect(getCell(4, 0, helper.getInstance().sheets[0]).formula).toBe('=SUM(A1:A4)');
                    expect(helper.invoke('getCell', [4, 0]).textContent).toBe('6');
                    expect(getCell(5, 0, helper.getInstance().sheets[0]).formula).toBe('=SUM(A1:A4)');
                    expect(helper.invoke('getCell', [5, 0]).textContent).toBe('6');
                    expect(getCell(0, 4, helper.getInstance().sheets[0]).formula).toBe('=SUM(A1:D1)');
                    expect(helper.invoke('getCell', [0, 4]).textContent).toBe('6');
                    expect(getCell(0, 5, helper.getInstance().sheets[0]).formula).toBe('=SUM(A1:D1)');
                    expect(helper.invoke('getCell', [0, 5]).textContent).toBe('6');
                    done();
                });
            });
        });
        describe('EJ2-68796 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ rowCount: 50, colCount: 2, ranges: [{ dataSource: defaultData }] }], scrollSettings: {enableVirtualization: true, isFinite: true }
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Values are not updated properly to the cell after deleting the row in finite mode', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('getMainContent').parentElement.scrollTop = 700;
                spreadsheet.notify(onContentScroll, { scrollTop: 700, scrollLeft: 0 });
                setTimeout((): void => {
                    helper.invoke('selectRange', ['A45']);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(44, 0, [7], true);
                    setTimeout(() => {
                        helper.invoke('selectRange', ['A40']);
                        helper.edit('A40', 'Test-Delete');
                        expect(helper.invoke('getCell', [39, 0]).textContent).toBe('Test-Delete');
                        helper.invoke('selectRange', ['A47:A48']);
                        helper.openAndClickCMenuItem(46, 0, [8], true);
                        setTimeout(() => {
                            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                            helper.invoke('selectRange', ['A40']);
                            helper.edit('A45', 'Test-Hide');
                            expect(helper.invoke('getCell', [44, 0]).textContent).toBe('Test-Hide');
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('Insert row below with conditional formatting ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'Inventory List', ranges: [{ dataSource: InventoryList, startCell: 'A2' }],
                    conditionalFormats: [
                        { type: 'GYRColorScale', range: 'A3:AA3' },
                    ]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A2:H2');
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                    spreadsheet.numberFormat('$#,##0.00', 'F3:F18');
                    spreadsheet.conditionalFormat({ type: 'LessThan', value: '12', range: 'A6:AA8' });
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Insert row below - 1 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([1, 0, 1, spreadsheet.sheets[0].colCount])); //A2:Z2
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(1, 0, [6, 2], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA4");
                expect(cfRule[1].range).toEqual("A7:AA9");
                done();
            });
        });
        it('Insert row below - 1 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA3");
            expect(cfRule[1].range).toEqual("A6:AA8");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A4:AA4");
            expect(cfRule[1].range).toEqual("A7:AA9");
            done();
        });
        it('Insert row below - 2 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([3, 0, 3, spreadsheet.sheets[0].colCount])); //A2:Z2
            helper.openAndClickCMenuItem(3, 0, [6, 2], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA5");
                expect(cfRule[1].range).toEqual("A8:AA10");
                done();
            });
        });
        it('Insert row below - 2 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A4:AA4");
            expect(cfRule[1].range).toEqual("A7:AA9");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A4:AA5");
            expect(cfRule[1].range).toEqual("A8:AA10");
            done();
        });
        it('Insert row below - 3 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([4, 0, 5, spreadsheet.sheets[0].colCount])); //A2:Z2
            helper.openAndClickCMenuItem(5, 0, [6, 2], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A4:AA5");
                expect(cfRule[1].range).toEqual("A10:AA12");
                done();
            });
        });
        it('Insert row below - 3 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A4:AA5");
            expect(cfRule[1].range).toEqual("A8:AA10");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A4:AA5");
            expect(cfRule[1].range).toEqual("A10:AA12");
            done();
        });
    });
    describe('Public methods Insert column with conditional formatting ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'defaultData', ranges: [{ dataSource: defaultData, startCell: 'A2' }],
                    conditionalFormats: [
                        { type: "ContainsText", cFColor: "RedFT", value:'shoes', range: 'A2:A11' },
                        { type: "DateOccur", cFColor: "YellowFT", value:'7/22/2014', range: 'B2:B11' },
                        { type: "GreaterThan", cFColor: "GreenFT", value:'11:26:32 AM', range: 'C2:C11' },
                      ]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A1:H1');
                    spreadsheet.conditionalFormat({ type: "Duplicate", cFColor: "RedT", range: 'E2:H11' });
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Public method - Insert column conditional formaating cells 1', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertColumn(0,0);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:B11");
                expect(cfRule[1].range).toEqual("C2:C11");
                expect(cfRule[2].range).toEqual("D2:D11");
                expect(cfRule[3].range).toEqual("F2:I11");
                done();
            });
        });
        it('Public method - Insert column conditional formaating cells 2', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertColumn(4,4);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:B11");
                expect(cfRule[1].range).toEqual("C2:C11");
                expect(cfRule[2].range).toEqual("D2:D11");
                expect(cfRule[3].range).toEqual("G2:J11");
                done();
            });
        });
        it('Public method - Insert column conditional formaating cells 3', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertColumn(7,8);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:B11");
                expect(cfRule[1].range).toEqual("C2:C11");
                expect(cfRule[2].range).toEqual("D2:D11");
                expect(cfRule[3].range).toEqual("G2:L11");
                done();
            });
        });
        it('Public method - Insert column conditional formaating cells 4', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertColumn(11,12);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:B11");
                expect(cfRule[1].range).toEqual("C2:C11");
                expect(cfRule[2].range).toEqual("D2:D11");
                expect(cfRule[3].range).toEqual("G2:L11");
                done();
            });
        });
        it('Public method - Insert column conditional formaating cells 5', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertColumn(5,6);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:B11");
                expect(cfRule[1].range).toEqual("C2:C11");
                expect(cfRule[2].range).toEqual("D2:D11");
                expect(cfRule[3].range).toEqual("G2:N11");
                done();
            });
        });
    });
    describe('Public methods Insert row with conditional formatting ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'defaultData', ranges: [{ dataSource: defaultData, startCell: 'A2' }],
                    conditionalFormats: [
                        { type: "ContainsText", cFColor: "RedFT", value:'shoes', range: 'A2:A11' },
                        { type: "DateOccur", cFColor: "YellowFT", value:'7/22/2014', range: 'B2:B11' },
                        { type: "GreaterThan", cFColor: "GreenFT", value:'11:26:32 AM', range: 'C2:C11' },
                      ]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A1:H1');
                    spreadsheet.conditionalFormat({ type: "Duplicate", cFColor: "RedT", range: 'E2:H11' });
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Public method - Insert row conditional formaating cells 1', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertRow(0,0);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:A12");
                expect(cfRule[1].range).toEqual("B3:B12");
                expect(cfRule[2].range).toEqual("C3:C12");
                expect(cfRule[3].range).toEqual("E3:H12");
                done();
            });
        });
        it('Public method - Insert row conditional formaating cells 2', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertRow(2, 2);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:A13");
                expect(cfRule[1].range).toEqual("B3:B13");
                expect(cfRule[2].range).toEqual("C3:C13");
                expect(cfRule[3].range).toEqual("E3:H13");
                done();
            });
        });
        it('Public method - Insert row conditional formaating cells 3', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertRow(11, 12);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:A15");
                expect(cfRule[1].range).toEqual("B3:B15");
                expect(cfRule[2].range).toEqual("C3:C15");
                expect(cfRule[3].range).toEqual("E3:H15");
                done();
            });
        });
        it('Public method - Insert row conditional formaating cells 4', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            let cfRule: ConditionalFormatModel[];
            spreadsheet.insertRow(17, 18);
            setTimeout((): void => {
                cfRule = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:A15");
                expect(cfRule[1].range).toEqual("B3:B15");
                expect(cfRule[2].range).toEqual("C3:C15");
                expect(cfRule[3].range).toEqual("E3:H15");
                done();
            });
        });
    });
    describe('Delete column with conditional formatting ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'Inventory List', ranges: [{ dataSource: InventoryList, startCell: 'A2' }],
                    conditionalFormats: [
                        { type: 'GYRColorScale', range: 'C3:C18' },
                    ]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A2:H2');
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                    spreadsheet.numberFormat('$#,##0.00', 'F3:F18');
                    spreadsheet.conditionalFormat({ type: 'LessThan', value: '12', range: 'D3:F18' });
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Delete column - 1 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 1, spreadsheet.sheets[0].rowCount, 1])); //B1:B200
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("B3:B18");
                expect(cfRule[1].range).toEqual("C3:E18");
                done();
            });
        });
        it('Delete column  - 1 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("C3:C18");
            expect(cfRule[1].range).toEqual("D3:F18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            expect(cfRule[1].range).toEqual("C3:E18");
            done();
        });
        it('Delete column - 2 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 1, spreadsheet.sheets[0].rowCount, 1])); //B1:B200
            helper.openAndClickCMenuItem(0, 1, [7], false, true);
            setTimeout((): void => {
                let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("B3:D18");
                done();
            });
        });
        it('Delete column  - 2 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            expect(cfRule[1].range).toEqual("C3:E18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:D18");
            done();
        });
        it('Delete column - 3 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 2, spreadsheet.sheets[0].rowCount, 2])); //C1:C200
            helper.openAndClickCMenuItem(0, 2, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("B3:C18");
                done();
            });
        });
        it('Delete column  - 3 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:D18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:C18");
            done();
        });
        it('Delete column - 4 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 2, spreadsheet.sheets[0].rowCount, 3])); //C1:D200
            helper.openAndClickCMenuItem(0, 2, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("B3:B18");
                done();
            });
        });
        it('Delete column  - 4 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:C18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            done();
        });
        it('Delete column - 5 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 4, spreadsheet.sheets[0].rowCount, 4])); //E1:E200
            helper.openAndClickCMenuItem(0, 4, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("B3:B18");
                done();
            });
        });
        it('Delete column  - 5 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            done();
        });
        it('Delete column - 6 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([0, 0, spreadsheet.sheets[0].rowCount, 2])); //A1:C200
            helper.openAndClickCMenuItem(0, 2, [7], false, true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule.length).toEqual(0);
                done();
            });
        });
        it('Delete column  - 6 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("B3:B18");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule.length).toEqual(0);
            done();
        });
    });
    describe('Delete row with conditional formatting ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'Inventory List', ranges: [{ dataSource: InventoryList, startCell: 'A2' }],
                    conditionalFormats: [
                        { type: 'GYRColorScale', range: 'A3:AA3' },
                    ]
                }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A2:H2');
                    spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontSize: '13pt' }, 'A1:H1');
                    spreadsheet.numberFormat('$#,##0.00', 'F3:F18');
                    spreadsheet.conditionalFormat({ type: 'LessThan', value: '12', range: 'A6:AA8' });
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Delete row - 1 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([1,0,1,spreadsheet.sheets[0].colCount])); //A2:
            helper.openAndClickCMenuItem(1, 0, [7], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A2:AA2");
                expect(cfRule[1].range).toEqual("A5:AA7");
                done();
            });
        });
        it('Delete row  - 1 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA3");
            expect(cfRule[1].range).toEqual("A6:AA8");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A2:AA2");
            expect(cfRule[1].range).toEqual("A5:AA7");
            done();
        });
        it('Delete row - 2 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([1,0,2,spreadsheet.sheets[0].colCount])); //A2:
            helper.openAndClickCMenuItem(2, 0, [7], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:AA5");
                done();
            });
        });
        it('Delete row  - 2 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A2:AA2");
            expect(cfRule[1].range).toEqual("A5:AA7");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA5");
            done();
        });
        it('Delete row - 3 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([3,0,3,spreadsheet.sheets[0].colCount])); //A2:
            helper.openAndClickCMenuItem(3, 0, [7], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:AA4");
                done();
            });
        });
        it('Delete row  - 3 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA5");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA4");
            done();
        });
        it('Delete row - 4 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([5,0,5,spreadsheet.sheets[0].colCount])); //A2:
            helper.openAndClickCMenuItem(4, 0, [7], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule[0].range).toEqual("A3:AA4");
                done();
            });
        });
        it('Delete row  - 4 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA4");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA4");
            done();
        });
        it('Delete row - 5 - using contextmenu', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.selectRange(getRangeAddress([2,0,5,spreadsheet.sheets[0].colCount])); //A2:
            helper.openAndClickCMenuItem(5, 0, [7], true);
            setTimeout((): void => {
                const cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
                expect(cfRule.length).toEqual(0);
                done();
            });
            
        });
        it('Delete row  - 5 - Undo and Redo', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.click('#spreadsheet_undo');
            let cfRule: ConditionalFormatModel[] = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule[0].range).toEqual("A3:AA4");
            helper.click('#spreadsheet_redo');
            cfRule = spreadsheet.sheets[0].conditionalFormats;
            expect(cfRule.length).toEqual(0);
            done();
        });
    });

    describe('EJ2-943530->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }], frozenRows: 3, frozenColumns: 2 }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Cells do not render correctly when inserting a column or row with merged cells in a frozen pane->', (done: Function) => {
            helper.invoke('merge', ['B2:D6']);
            let td: HTMLTableCellElement = helper.invoke('getCell', [1, 1]);
            expect(td.rowSpan).toBe(5);
            expect(td.colSpan).toBe(3);
            helper.invoke('insertRow', [4, 6]);
            setTimeout(() => {
                td = helper.invoke('getCell', [1, 1]);
                expect(td.rowSpan).toBe(8);
                expect(td.rowSpan).not.toBe(5);
                expect(td.colSpan).toBe(3);
                helper.invoke('insertColumn', [3, 5]);
                setTimeout(() => {
                    td = helper.invoke('getCell', [1, 1]);
                    expect(td.rowSpan).toBe(8);
                    expect(td.colSpan).toBe(6);
                    expect(td.colSpan).not.toBe(3);
                    done();
                });
            });
        });
    });

    describe('CR - Issues->', () => {
        describe('EJ2-50688, EJ2-53476, EJ2-54600, EJ2-50688, EJ2-51865, EJ2-911330 ', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData }] }, {ranges: [{ dataSource: defaultData }]}]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('EJ2-51865 - Delete empty row is not working', (done: Function) => {
                helper.invoke('selectRange', ['A1:H1']);
                helper.invoke('copy', ['A1:H1']).then(function () {
                    helper.invoke('selectRange', ['A15:H15']);
                    helper.invoke('paste', ['A15:H15']);
                    expect(helper.getInstance().sheets[0].rows[14].cells[0].value).toBe('Item Name');
                    helper.invoke('selectRange', ['A14']);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(13, 0, [7], true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].rows[13].cells[0].value).toBe('Item Name');
                        done();
                    });
                });
            });

            it('EJ2-53476 - getRowData not working while inserting row using insertRow method->', (done: Function) => {
                helper.invoke('insertRow', [11, 11]);
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
                setTimeout(() => {
                    expect(helper.invoke('getRow', [11]).getRowData).toBeNull;
                    done();
                });
            });

            it('EJ2-54600 - Undo/redo keyboard action working improperly when insert row in multiple times->', (done: Function) => {
                helper.invoke('selectRange', ['A1']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 0, [6, 1], true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0]).toEqual({});
                    helper.invoke('selectRange', ['A3:A5']);
                    helper.openAndClickCMenuItem(3, 0, [6, 2], true);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[5])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[6])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[7])).toEqual('{"cells":[null,{"format":"m/d/yyyy"},{"format":"h:mm:ss AM/PM"}]}');
                        helper.invoke('selectRange', ['A9']);
                        helper.triggerKeyNativeEvent(90, true);
                        helper.triggerKeyNativeEvent(90, true);
                        setTimeout(() => {
                            expect(helper.getInstance().sheets[0].rows[0]).not.toEqual({});
                            expect(helper.getInstance().sheets[0].rows[5]).not.toEqual({});
                            expect(helper.getInstance().sheets[0].rows[6]).not.toEqual({});
                            expect(helper.getInstance().sheets[0].rows[7]).not.toEqual({});
                            done();
                        });
                    });
                });
            });

            it('EJ2-50565 - cut paste not working for inserted column in spreadsheet', (done: Function) => {
                helper.invoke('cut', ['H1:H20']).then(function () {
                    helper.invoke('selectRange', ['E1']);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(0, 4, [6, 1], false, true);
                    setTimeout(() => {
                        helper.invoke('paste', ['E1']);
                        expect(helper.getInstance().sheets[0].rows[0].cells[4].value.toString()).toBe('Profit');
                        expect(helper.getInstance().sheets[0].rows[1].cells[4].value.toString()).toBe('10');
                        done();
                    });
                });
            });

            it('EJ2-50688 - data loss in cut paste for newly inserted column', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.applyFilter([{ field: 'F', predicate: 'or', operator: 'contains', value: '10' }]);
                setTimeout(() => {
                    helper.invoke('selectRange', ['F1']);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(0, 5, [6, 2], false, true);
                    setTimeout(() => {
                        helper.invoke('cut', ['F1:F20']).then(function () {
                            helper.invoke('selectRange', ['G1']);
                            helper.invoke('paste', ['G1']);
                            expect(helper.invoke('getCell', [0, 6]).querySelector('.e-filtered')).toBeNull();
                            expect(helper.getInstance().sheets[0].rows[5].cells[6].value).toBe(10);
                            expect(helper.getInstance().sheets[0].rows[7].cells[6].value).toBe(10);
                            done();
                        });
                    });
                });
            });

            it('EJ2-911330 - Delete method throws script error while deleting a sheet', (done: Function) => {
                const spreadsheet: any = helper.getInstance();
                helper.invoke('goTo', ['Sheet2!A1']);
                setTimeout(() => {
                    spreadsheet.delete(0, 0, 'Sheet');
                    setTimeout(() => {
                        expect(spreadsheet.activeSheetIndex).toBe(0);
                        spreadsheet.insertSheet(1, 4);
                        setTimeout(() => {
                            expect(spreadsheet.activeSheetIndex).toBe(0);
                            helper.invoke('goTo', ['Sheet6!A1']);
                            setTimeout(() => {
                                expect(spreadsheet.activeSheetIndex).toBe(4);
                                spreadsheet.delete(1, 3, 'Sheet');
                                setTimeout(() => {
                                    expect(spreadsheet.activeSheetIndex).toBe(1);
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            it('EJ2-911330 - Delete method Changes active sheet when active sheet is not deleted.', (done: Function) => {
                const spreadsheet: any = helper.getInstance();
                spreadsheet.insertSheet(2, 6);
                setTimeout(() => {
                    expect(spreadsheet.activeSheetIndex).toBe(1);
                    helper.invoke('goTo', ['Sheet9!A1']);
                    setTimeout(() => {
                        let td: HTMLTableCellElement = helper.getElement('.e-sheet-tab .e-active .e-text-wrap');
                        let coords: DOMRect = <DOMRect>td.getBoundingClientRect();
                        helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, td);
                        setTimeout(() => {
                            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                            helper.click('#' + helper.id + '_contextmenu li:nth-child(5)');
                            setTimeout(() => {
                                expect(spreadsheet.activeSheetIndex).toBe(3);
                                expect(spreadsheet.sheets[4].state).toBe('Hidden');
                                spreadsheet.delete(1, 3, 'Sheet');
                                setTimeout(() => {
                                    expect(spreadsheet.activeSheetIndex).toBe(2);
                                    expect(spreadsheet.sheets[1].state).toBe('Hidden')
                                    done();
                                });
                            }, 50);
                        });
                    });
                });
            });
        });

        describe('EJ2-54284, EJ2-52375->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ name: 'Reserves & Resources', rowCount: 11, colCount: 8, rows: [{ cells: [{ value: '1' }] }, { cells: [{ value: '2' }] },
                    { cells: [{ value: '3' }] }, { cells: [{ value: '4' }] }, { cells: [{ value: '5' }] }, { cells: [{ value: '6' }] },
                    { cells: [{ value: '7' }] },  { cells: [{ value: '8' }] },  { cells: [{ value: '9' }] }, { cells: [{ value: '10' }] }, { cells: [{ value: '11' }] }] }],
                    scrollSettings: { isFinite: true }
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('EJ2-54284 - Insert / delete rows not working properly in finite mode->', (done: Function) => {
                helper.invoke('selectRange', ['A8:A11']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(7, 0, [6, 1], true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[7]).toEqual({});
                    expect(helper.getInstance().sheets[0].rows[10]).toEqual({});
                    expect(helper.getInstance().sheets[0].rowCount).toBe(15);
                    expect(helper.getInstance().sheets[0].usedRange.rowIndex).toBe(14);
                    helper.invoke('selectRange', ['A8:A11']);
                    helper.openAndClickCMenuItem(7, 0, [7], true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].rowCount).toBe(11);
                        expect(helper.getInstance().sheets[0].usedRange.rowIndex).toBe(10);
                        done();
                    });
                });
            });

            it('EJ2-54284 - Insert / delete columns not working properly in finite mode->', (done: Function) => {
                helper.invoke('selectRange', ['F1:H1']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].columns[5]).toEqual({});
                    expect(helper.getInstance().sheets[0].columns[7]).toEqual({});
                    expect(helper.getInstance().sheets[0].colCount).toBe(11);
                    expect(helper.getInstance().sheets[0].usedRange.colIndex).toBe(7);
                    helper.invoke('selectRange', ['F1:H1']);
                    helper.openAndClickCMenuItem(0, 7, [7], false, true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].colCount).toBe(8);
                        expect(helper.getInstance().sheets[0].usedRange.colIndex).toBe(4);
                        done();
                    });
                });
            });

            it('EJ2-52375 - Update row height based on cell template and update range and formula cell reference on insert row->', (done: Function) => {
                helper.invoke('updateCell', [{ formula: `=${'Reserves & Resources'}!A5+${'Reserves & Resources'}!A6` }, 'B2']);
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[1].formula).toBe(`=${'Reserves & Resources'}!A5+${'Reserves & Resources'}!A6`);
                expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBe('11');
                helper.invoke('selectRange', ['A2']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(1, 0, [6, 2], true);
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[10].cells[0].value.toString()).toBe('10');
                    expect(spreadsheet.sheets[0].rowCount).toBe(12);
                    expect(spreadsheet.sheets[0].rows[1].cells[1].formula).toBe(`=${'Reserves & Resources'}!A6+${'Reserves & Resources'}!A7`);
                    expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBe('11');
                    done();
                });
            });

            it('EJ2-57000 - Need to fix the row not visible issue while inserting a new row at the end->', (done: Function) => {
                helper.invoke('insertRow', [12, 12]);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rowCount).toBe(13);
                    done();
                });
            });
            it('Formula cell reference on insert column and delete row/column->', (done: Function) => {
                helper.invoke('insertColumn');
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[2].formula).toBe(`=${'Reserves & Resources'}!B6+${'Reserves & Resources'}!B7`);
                expect(spreadsheet.sheets[0].rows[1].cells[2].value).toBeNull();
                helper.invoke('delete', [0, 0, 'Column']);
                expect(spreadsheet.sheets[0].rows[1].cells[1].formula).toBe(`=${'Reserves & Resources'}!A6+${'Reserves & Resources'}!A7`);
                expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBeNull('11');
                helper.invoke('delete', [2, 2, 'Row']);
                expect(spreadsheet.sheets[0].rows[1].cells[1].formula).toBe(`=${'Reserves & Resources'}!A5+${'Reserves & Resources'}!A6`);
                expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBeNull();
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBe('11');
                    done();
                });
            });

            it('EJ2-957395 -> Undoing after deleting a column messes up merged cells.', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('merge', ['B2:E5']);
                expect(spreadsheet.sheets[0].rows[1].cells[1].colSpan).toBe(4);
                helper.invoke('selectRange', ['E1']);
                helper.openAndClickCMenuItem(0, 5, [7], null, true);
                expect(spreadsheet.sheets[0].rows[1].cells[1].colSpan).toBe(3);
                helper.invoke('selectRange', ['D1']);
                helper.openAndClickCMenuItem(0, 5, [7], null, true);
                expect(spreadsheet.sheets[0].rows[1].cells[1].colSpan).toBe(2);
                spreadsheet.undo();
                expect(spreadsheet.sheets[0].rows[1].cells[1].colSpan).toBe(3);
                spreadsheet.undo();
                expect(spreadsheet.sheets[0].rows[1].cells[1].colSpan).toBe(4);
                done();
            });
        });

        describe('EJ2-54240->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData, showFieldAsHeader: false }] }] 
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Range details not updated properly while insert rows using method in showFieldAsHeader as false->', (done: Function) => {
                helper.invoke('insertRow', [0, 0]);
                setTimeout(() => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    expect(spreadsheet.getRowData(0,0)).toBe[ Object({}) ];
                    done();
                });
            });
        });
        describe('EJ2-851942->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData }] }],
                    created: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        for (var i = 0; i < 3; i++) {
                            spreadsheet.insertSheet([{
                                index: i + 1,
                                ranges: [{ dataSource: defaultData }]
                            }]);
                        }
                    }
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Row model is not updated while inserting the new sheet using insertSheet Method->', (done: Function) => {
                setTimeout(() => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    expect(spreadsheet.sheets[1].rows).not.toBeUndefined();
                    expect(spreadsheet.sheets[1].rows.length).not.toEqual(0);
                    expect(spreadsheet.sheets[3].rows).not.toBeUndefined();
                    expect(spreadsheet.sheets[3].rows.length).not.toEqual(0);
                    done();
                });
            });
        });
        describe('EJ2-850911->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ rows: [
                        { cells: [{ formula: '=UNIQUE(Sheet2!D1:E2)' }, { index: 3, formula: '=UNIQUE(G1:H2)' }, { index: 6, value: 'column1'}, { value: 'column2'}, { index: 10, formula: '22' }] },
                        { cells: [{ index: 6, formula: '=SUM(K1:K2)'}, { index: 10, formula: '22' }] }
                    ] }, { rows: [
                        { cells: [{ index: 3, value: 'column1'}, { value: 'column2'}, { index: 6, formula: '11' }] },
                        { cells: [{ index: 3, formula: '=SUM(G1:G2)'}, { index: 6, formula: '22' }] }
                    ] }]
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Spreadsheet control restricts to insert new column before the unique formula applied column->', (done: Function) => {
                expect(helper.invoke('getCell', [0, 4]).textContent).toBe('column2');
                helper.invoke('selectRange', ['D1']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                setTimeout(() => {
                    expect(helper.invoke('getCell', [0, 3]).textContent).toBe('');
                    expect(helper.getInstance().sheets[0].rows[0].cells[4].formula).toBe('=UNIQUE(H1:I2)');
                    expect(helper.invoke('getCell', [0, 4]).textContent).toBe('column1');
                    expect(helper.invoke('getCell', [0, 5]).textContent).toBe('column2');
                    expect(helper.invoke('getCell', [0, 7]).textContent).toBe('column1');
                    expect(helper.invoke('getCell', [0, 8]).textContent).toBe('column2');
                    helper.invoke('selectRange', ['F1']);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                    setTimeout(() => {
                        expect(helper.getInstance().sheets[0].rows[0].cells[4].formula).toBe('=UNIQUE(I1:J2)');
                        expect(helper.invoke('getCell', [0, 4]).textContent).toBe('column1');
                        expect(helper.invoke('getCell', [0, 5]).textContent).toBe('column2');
                        expect(helper.invoke('getCell', [0, 8]).textContent).toBe('column1');
                        expect(helper.invoke('getCell', [0, 9]).textContent).toBe('column2');
                        helper.invoke('selectRange', ['J1']);
                        helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                        helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                        setTimeout(() => {
                            expect(helper.getInstance().sheets[0].rows[0].cells[4].formula).toBe('=UNIQUE(I1:K2)');
                            expect(helper.invoke('getCell', [0, 4]).textContent).toBe('column1');
                            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('0');
                            expect(helper.invoke('getCell', [0, 6]).textContent).toBe('column2');
                            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('column1');
                            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('');
                            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('column2');
                            helper.getInstance().activeSheetIndex = 1;
                            helper.getInstance().dataBind();
                            setTimeout((): void => {
                                helper.invoke('selectRange', ['E1']);
                                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                                helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                                setTimeout((): void => {
                                    helper.getInstance().activeSheetIndex = 0;
                                    helper.getInstance().dataBind();
                                    setTimeout((): void => {
                                        expect(helper.invoke('getCell', [0, 0]).textContent).toBe('column1');
                                        expect(helper.invoke('getCell', [0, 1]).textContent).toBe('0');
                                        expect(helper.invoke('getCell', [0, 2]).textContent).toBe('column2');
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('allowDelete: false ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                allowDelete: false,
                sheets: [{ranges: [{ dataSource: defaultData }]}]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Should disable delete option in context menu for row/column headers', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            let cell: HTMLElement = (helper.getElement('#' + helper.id + ' .e-rowhdr-table') as HTMLTableElement).rows[1].cells[0];
            let coords: DOMRect = <DOMRect>cell.getBoundingClientRect();
            helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, cell);
            expect(helper.getElement('#' + helper.id + '_contextmenu li:nth-child(7)').classList).toContain('e-disabled');
            done();
        });
    });
    describe('AllowInsert: false condition checks', () => {
        let helper: SpreadsheetHelper;
        beforeAll((done: Function) => {
            helper = new SpreadsheetHelper('spreadsheet');
            helper.initializeSpreadsheet({ allowInsert: false, sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Check through public method and UI interaction', (done: Function) => {
            const spreadsheet = helper.getInstance();
            spreadsheet.insertSheet();
            expect(spreadsheet.sheets.length).toBe(1);
            const sheettab = helper.getElement('#spreadsheet_sheet_tab_panel');
            expect(sheettab.children[0].classList).toContain('e-disabled');
            done();
        });
        it('Check through contextmenu UI interaction', (done: Function) => {
            helper.invoke('selectRange', ['A2']);
            const cell = helper.getElement('#' + helper.id + ' .e-rowhdr-table').rows[1].cells[0];
            const coords = cell.getBoundingClientRect();
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.triggerMouseAction('contextmenu', { x: coords.x, y: coords.y }, null, cell);
            const element = helper.getElement('#spreadsheet_cmenu_insert_row');
            expect(element.classList).toContain('e-disabled');
            done();
        });
    });
    describe('EJ2-957399-> New row doesnt auto-format as the applied format in the column', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('New row cell value should auto-format as the applied format in the column', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'G1:G12']);
            expect(helper.invoke('getCell', [3, 6]).textContent).toContain('$');
            helper.invoke('selectRange', ['A3']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(2, 0, [6, 1], true);
            setTimeout((): void => {
                expect(helper.invoke('getCell', [2, 6]).textContent).toBe('');
                helper.invoke('updateCell', [{ value: '100' }, 'G3']);
                expect(helper.invoke('getCell', [2, 6]).textContent).toContain('$');
                done();
            });
        });
        it('New Column cell value should auto-format as the applied format in the row', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'A9:J9']);
            expect(helper.invoke('getCell', [8, 5]).textContent).toContain('$');
            helper.invoke('selectRange', ['G1']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(0, 6, [6, 1], false, true);
            setTimeout((): void => {
                expect(helper.invoke('getCell', [8, 6]).textContent).toBe('');
                helper.invoke('updateCell', [{ value: '100' }, 'G9']);
                expect(helper.invoke('getCell', [8, 6]).textContent).toContain('$');
                done();
            });
        });
    });
});