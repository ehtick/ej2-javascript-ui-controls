import { SpreadsheetModel, Spreadsheet, DialogBeforeOpenEventArgs, CellSaveEventArgs } from '../../../src/spreadsheet/index';
import { SpreadsheetHelper } from '../../spreadsheet/util/spreadsheethelper.spec';
import { defaultData, reportedBugData, EJ2_53702_SUBTOTALS, EJ2_53702_INDEX, EJ2_53702_UNIQUE, EJ2_53702_SLOPE_SHEET1, EJ2_53702_SLOPE_SHEET2 } from '../../spreadsheet/util/datasource.spec';
import { CellModel, getCell, getRangeAddress, DefineNameModel, RowModel, SheetModel, getFormatFromType, setCell } from '../../../src/index';
import { getComponent } from '@syncfusion/ej2-base';

/**
 *  Formula spec.
 */

describe('Spreadsheet formula module ->', () => {
    let helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');
    let model: SpreadsheetModel;

    // Other Formulas
    describe('CR-Issues ->', () => {
        describe('I311951, I309076, FB24295, FB23944 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ rows: [{ cells: [{ value: '25' }] }] }] }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Formula with percentage not working and formula parsing issue', (done: Function) => {
                helper.edit('A2', '=A1*5%');
                const inst: Spreadsheet = helper.getInstance();
                expect(inst.sheets[0].rows[1].cells[0].formula).toEqual('=A1*5%');
                expect(inst.sheets[0].rows[1].cells[0].value).toEqual('1.25');
                expect(inst.getCell(1, 0).textContent).toEqual('1.25');
                helper.invoke('selectRange', ['A2']);
                setTimeout(() => {
                    expect(helper.getElement('#' + helper.id + '_formula_input').value).toEqual('=A1*5%');
                    helper.invoke('selectRange', ['A3']);
                    setTimeout(() => {
                        helper.edit('A3', '=425/25*-1');
                        expect(inst.sheets[0].rows[2].cells[0].formula).toEqual('=425/25*-1');
                        expect(inst.sheets[0].rows[2].cells[0].value).toEqual('-17');
                        expect(inst.getCell(2, 0).textContent).toEqual('-17');
                        setTimeout((): void => {
                            expect(helper.getElement('#' + helper.id + '_formula_input').value).toEqual('=425/25*-1');
                            done();
                        });
                    });
                });
            });

            it('Count value is not calculated properly in aggregate when selected range contains zero value', (done: Function) => {
                helper.edit('B1', '0');
                helper.invoke('selectRange', ['A1:B1']);
                helper.click('#' + helper.id + '_aggregate');
                expect(helper.getElement('#' + helper.id + '_aggregate-popup ul li').textContent).toBe('Count: 2');
                done();
            });

            it('Formula popup not displayed on cell in the bottom of the sheet', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.selectRange('C21');
                spreadsheet.startEdit();
                const editElem: HTMLElement = helper.getCellEditorElement();
                editElem.textContent = '=s';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    const popup: Element = helper.getElement('#' + helper.id + '_ac_popup');
                    // expect(Math.abs(popup.getBoundingClientRect().bottom - editElem.getBoundingClientRect().top)).toBeLessThan(3);
                    setTimeout(() => {
                        done();
                    }, 100);
                });
            });
            it('IFERROR formula does not return the expected result that contains comma in the value.', (done: Function) => {
                helper.edit('A1', 'Hello, World');
                helper.edit('D1', '=IFERROR(INDEX(Sheet1!A1:A100,MATCH(Sheet1!A1,Sheet1!A1:A100,0))," ")');
                expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toBe('Hello, World');
                helper.edit('A2', 'Hello World');
                helper.edit('D2', '=IFERROR(INDEX(Sheet1!A1:A100,MATCH(Sheet1!A2,Sheet1!A1:A100,0))," ")');
                expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toBe('Hello World');
                helper.edit('A3', 'Hello, World 1');
                helper.edit('D3', '=IFERROR(INDEX(Sheet1!A1:A100,MATCH(Sheet1!A3,Sheet1!A1:A100,0))," ")');
                expect(helper.getInstance().sheets[0].rows[2].cells[3].value).toBe('Hello, World 1');
                helper.edit('A4', 'Hello, World, Good, Bye');
                helper.edit('D4', '=IFERROR(INDEX(Sheet1!A1:A100,MATCH(Sheet1!A4,Sheet1!A1:A100,0))," ")');
                expect(helper.getInstance().sheets[0].rows[3].cells[3].value).toBe('Hello, World, Good, Bye');
                helper.edit('A5', '');
                helper.edit('D5', '=IFERROR(INDEX(Sheet1!A1:A100,MATCH(Sheet1!A5,Sheet1!A1:A100,0)),"cannot be found")');
                expect(helper.getInstance().sheets[0].rows[4].cells[3].value).toBe('cannot be found');
                helper.edit('A6', 'Casual,Shoes');
                helper.edit('D6', '=IF(2<5,INDEX(A1:A10,6),"sorry,bye")');
                expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toBe('Casual,Shoes');
                helper.edit('D7', '=IF(2>5,INDEX(A1:A10,6),"sorry,bye")');
                expect(helper.getInstance().sheets[0].rows[6].cells[3].value).toBe('sorry,bye');
                helper.edit('D8', '=CONCATENATE(INDEX(A1:A10,1),"Bye")');
                expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toBe('Hello, WorldBye');
                helper.edit('D9', '=LEN(INDEX(A1:A10,1))');
                expect(helper.getInstance().sheets[0].rows[8].cells[3].value).toBe(12);
                helper.edit('D10', '=EXACT(INDEX(A1:A10,1),"Hello, World")');
                expect(helper.getInstance().sheets[0].rows[9].cells[3].value).toBeTruthy();
                done();
            });
        });

        describe('I261427 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [{ rows: [{ cells: [{ value: '1' }] }] }, { rows: [{ cells: [{ value: '2' }] }] }, {
                            rows: [{
                                cells: [{
                                    formula:
                                        '=Sheet1!A1+Sheet2!A1'
                                }]
                            }]
                        }], activeSheetIndex: 2
                    }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Cross tab formula issue', (done: Function) => {
                const target: HTMLElement = helper.getElement().querySelectorAll('.e-sheet-tab .e-toolbar-item')[1];
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[2].rows[0].cells[0].formula).toEqual('=Sheet1!A1+Sheet2!A1');
                expect(spreadsheet.sheets[2].rows[0].cells[0].value).toEqual('3');
                helper.triggerMouseAction('contextmenu', {
                    x: target.getBoundingClientRect().left + 20, y:
                        target.getBoundingClientRect().top + 10
                }, null, target);
                setTimeout(() => {
                    helper.getElement('#' + helper.id + '_cmenu_delete_sheet').click();
                    setTimeout(() => {
                        helper.getElement('.e-footer-content .e-btn.e-primary').click();
                        setTimeout(() => {
                            expect(spreadsheet.sheets[1].rows[0].cells[0].formula).toEqual('=SHEET1!A1+#REF!A1');
                            expect(spreadsheet.sheets[1].rows[0].cells[0].value).toEqual('#REF!');
                            done();
                        }, 10);
                    });
                });
            });
        });

        describe('I288646, I296410, I305593, I314883, EJ2-63933 ->', () => {
            const model: SpreadsheetModel = {
                sheets: [{
                    rows: [{ cells: [{ value: '10' }, { value: '20' }, { index: 8, formula: '=H1' }] }, {
                        cells: [{ formula: '=ROUNDUP(10.6)' },
                        { index: 4, formula: '=INT(10.2)' }, { formula: '=SUMPRODUCT(A1:B1)' }, { index: 8, formula: '=H2' }]
                    }]
                }]
            };
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(model, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Include the unsupported formula (ROUNDUP, INT, SUMPRODUCT)', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[0].formula).toBe('=ROUNDUP(10.6)');
                expect(spreadsheet.sheets[0].rows[1].cells[0].value.toString()).toBe('11');
                expect(helper.invoke('getCell', [1, 0]).textContent).toBe('11');
                expect(spreadsheet.sheets[0].rows[1].cells[4].formula).toBe('=INT(10.2)');
                expect(spreadsheet.sheets[0].rows[1].cells[4].value.toString()).toBe('10');
                expect(helper.invoke('getCell', [1, 4]).textContent).toBe('10');
                expect(spreadsheet.sheets[0].rows[1].cells[5].formula).toBe('=SUMPRODUCT(A1:B1)');
                expect(spreadsheet.sheets[0].rows[1].cells[5].value.toString()).toBe('30');
                expect(helper.invoke('getCell', [1, 5]).textContent).toBe('30');
                done();
            });

            it('Circular reference dialog opens multiple times when deleting column', (done: Function) => {
                helper.setAnimationToNone(`#${helper.id}_contextmenu`);
                helper.openAndClickCMenuItem(0, 5, [7], null, true);
                setTimeout(() => {
                    expect(document.querySelectorAll('.e-dialog').length).toBe(0);
                    done();
                });
            });

            it('Calculation issue while applying the formula =(B2+B3)^2', (done: Function) => {
                helper.edit('B2', '1');
                helper.edit('B3', '5.00%');
                helper.edit('B4', '=(B2+B3)^2');
                helper.edit('B5', '=(B2+B3)^(1/3)');
                helper.edit('B6', '=POWER((B2+B3),2)');
                helper.edit('B7', '=POWER((B2+B3),1/3)');
                helper.edit('B8', '=(3^2)^(2)');
                expect(helper.invoke('getCell', [3, 1]).textContent).toBe('110.25%');
                expect(helper.invoke('getCell', [4, 1]).textContent).toBe('101.64%');
                expect(helper.invoke('getCell', [5, 1]).textContent).toBe('1.1025');
                expect(helper.invoke('getCell', [6, 1]).textContent).toBe('1.016396357');
                expect(helper.invoke('getCell', [7, 1]).textContent).toBe('81');
                done();
            });

            // it('Formula dependent cell not updated after destroy', (done: Function) => {
            //     helper.edit('C1', 'Test');
            //     setTimeout(() => {
            //         helper.invoke('destroy');
            //         new Spreadsheet(model, '#' + helper.id);
            //         setTimeout(() => {
            //             setTimeout(() => {
            //                 expect(helper.getInstance().sheets[0].rows[0].cells[2]).toBeUndefined();
            //                 expect(helper.invoke('getCell', [0, 2]).textContent).toBe('');
            //                 helper.edit('B1', '30');
            //                 expect(helper.invoke('getCell', [1, 5]).textContent).toBe('40');
            //                 expect(helper.getInstance().sheets[0].rows[1].cells[5].value).toBe(40);
            //                 done();
            //             });
            //         });
            //     });
            // });
        });

        describe('I312700 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [{
                            rows: [{
                                cells: [{ formula: '=COUNTIF(AR1:AT1,"=10")' }, { index: 4, formula: '=SUMIF(AR1:AT1,"=10")' },
                                { index: 43, value: '10' }, { value: '5' }, { value: '10' }]
                            }], columns: [{ index: 1, width: 120 }]
                        }]
                    }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Improve the formulas with the range greater than AA and countif, countifs, sumif, sumifs formula with this ranges', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[0].cells[0].formula).toBe('=COUNTIF(AR1:AT1,"=10")');
                expect(spreadsheet.sheets[0].rows[0].cells[0].value.toString()).toBe('2');
                expect(helper.invoke('getCell', [0, 0]).textContent).toBe('2');
                expect(spreadsheet.sheets[0].rows[0].cells[4].formula).toBe('=SUMIF(AR1:AT1,"=10")');
                expect(spreadsheet.sheets[0].rows[0].cells[4].value.toString()).toBe('20');
                expect(helper.invoke('getCell', [0, 4]).textContent).toBe('20');
                done();
            });
            it('SF-422696 -> SUMIFS formula not working if the criteria contains both operator and a cell range', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: 'Residential' }, 'B1']);
                helper.invoke('updateCell', [{ value: 'Residential' }, 'B2']);
                helper.invoke('updateCell', [{ value: 'Residential' }, 'B3']);
                helper.invoke('updateCell', [{ value: '1' }, 'C1']);
                helper.invoke('updateCell', [{ value: '2' }, 'C2']);
                helper.invoke('updateCell', [{ value: '3' }, 'C3']);
                helper.invoke('updateCell', [{ formula: '=SUMIFS(C1:C3,B1:B3,"="&B1)' }, 'D1']);
                const cell: any = spreadsheet.sheets[0].rows[0].cells[3];
                const cellEle: HTMLElement = helper.invoke('getCell', [0, 3]);
                expect(cell.formula).toBe('=SUMIFS(C1:C3,B1:B3,"="&B1)');
                expect(cell.value).toBe(6);
                expect(cellEle.textContent).toBe('6');
                helper.invoke('updateCell', [{ value: 'Residential 1' }, 'B2']);
                expect(cell.value).toBe(4);
                expect(cellEle.textContent).toBe('4');
                helper.invoke('updateCell', [{ formula: '=SUMIFS(C1:C3,B1:B3,"<>"&Sheet1!B1)' }, 'D1']);
                expect(cell.value).toBe(2);
                expect(cellEle.textContent).toBe('2');
                helper.invoke('updateCell', [{ value: 'Residential 2' }, 'B3']);
                expect(cell.value).toBe(5);
                expect(cellEle.textContent).toBe('5');
                helper.invoke('updateCell', [{ value: 'Residential 1' }, 'B4']);
                helper.invoke('updateCell', [{ value: '4' }, 'C4']);
                helper.invoke('updateCell', [{ formula: '=SUMIFS(C1:C4,B1:B4,"<>"Sheet1!B1,B1:B4,"<>"&B3)' }, 'D1']);
                expect(cell.value).toBe(6);
                expect(cellEle.textContent).toBe('6');
                helper.invoke('updateCell', [{ formula: '=SUMIFS(C1:C4, B1:B4 , "Residential")' }, 'D1']);
                expect(cell.value).toBe(1);
                expect(cellEle.textContent).toBe('1');
                helper.invoke('updateCell', [{ formula: '=COUNTIFS(B1:B4,"<>"&Sheet1!B1)' }, 'D1']);
                expect(cell.value).toBe(3);
                expect(cellEle.textContent).toBe('3');
                helper.invoke('updateCell', [{ formula: '=COUNTIFS(B1:B4,"="Sheet1!B2)' }, 'D1']);
                expect(cell.formula).toBe('=COUNTIFS(B1:B4,"="Sheet1!B2)');
                expect(cell.value).toBe(2);
                expect(cellEle.textContent).toBe('2');
                helper.invoke('updateCell', [{ formula: '=AVERAGEIFS(C1:C4,B1:B4,"<>"Sheet1!B2)' }, 'D1']);
                expect(cell.formula).toBe('=AVERAGEIFS(C1:C4,B1:B4,"<>"Sheet1!B2)');
                expect(cell.value).toBe(2);
                expect(cellEle.textContent).toBe('2');
                helper.invoke('updateCell', [{ formula: '=AVERAGEIFS(C1:C4,B1:B4,"="&Sheet1!B2)' }, 'D1']);
                expect(cell.formula).toBe('=AVERAGEIFS(C1:C4,B1:B4,"="&Sheet1!B2)');
                expect(cell.value).toBe(3);
                expect(cellEle.textContent).toBe('3');
                done();
            });
            it('SF-422232 -> OR operation in SUMIFS formula', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,B1:B4,{"Residential","Residential 1"}))' }, 'D2']);
                const cell: any = spreadsheet.sheets[0].rows[1].cells[3];
                const cellEle: HTMLElement = helper.invoke('getCell', [1, 3]);
                expect(cell.value).toBe(7);
                expect(cellEle.textContent).toBe('7');
                helper.invoke('updateCell', [{ formula: '=SUM(AVERAGEIFS(C1:C4,B1:B4,{"Residential 2","Residential 1"}))' }, 'D2']);
                expect(cell.value).toBe(6);
                expect(cellEle.textContent).toBe('6');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,B1:B4,{"Residential";"Residential 2"}))' }, 'D2']);
                expect(cell.value).toBe(4);
                expect(cellEle.textContent).toBe('4');
                helper.invoke('updateCell', [{ formula: '=AVERAGE(AVERAGEIFS(C1:C4, B1:B4, {"Residential", "Residential 2"}))' }, 'D2']);
                expect(cell.value).toBe('2');
                expect(cellEle.textContent).toBe('2');
                helper.invoke('updateCell', [{ value: 'Residential 3' }, 'B4']);
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,B1:B4,{"Residential 1","Residential 2","Residential 3"}))' }, 'D2']);
                expect(cell.value).toBe(9);
                expect(cellEle.textContent).toBe('9');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,B1:B4,{"<>Residential 1","=Residential 2"}))' }, 'D2']);
                expect(cell.value).toBe(11);
                expect(cellEle.textContent).toBe('11');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,B1:B4, {"Residential"}))' }, 'D2']);
                expect(cell.formula).toBe('=SUM(SUMIFS(C1:C4,B1:B4, {"Residential"}))');
                expect(cell.value).toBe(1);
                expect(cellEle.textContent).toBe('1');
                helper.invoke('updateCell', [{ value: '33' }, 'F1']);
                helper.invoke('updateCell', [{ value: '45' }, 'F2']);
                helper.invoke('updateCell', [{ value: '28' }, 'F3']);
                helper.invoke('updateCell', [{ value: '25' }, 'F4']);
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,F1:F4,{33,28}))' }, 'D2']);
                expect(cell.value).toBe(4);
                expect(cellEle.textContent).toBe('4');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,F1:F4,{"25","45"}))' }, 'D2']);
                expect(cell.value).toBe(6);
                expect(cellEle.textContent).toBe('6');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,F1:F4, {">20","<30"}))' }, 'D2']);
                expect(cell.value).toBe(17);
                expect(cellEle.textContent).toBe('17');
                helper.invoke('updateCell', [{ formula: '=AVERAGE(AVERAGEIFS(C1:C4,F1:F4, {">30","<50"}))' }, 'D2']);
                expect(cell.value).toBe('2');
                expect(cellEle.textContent).toBe('2');
                helper.invoke('updateCell', [{ value: 'TRUE' }, 'G1']);
                helper.invoke('updateCell', [{ value: 'FALSE' }, 'G3']);
                helper.invoke('updateCell', [{ value: 'TRUE' }, 'G4']);
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,G1:G4,{"=TRUE","<>FALSE"}))' }, 'D2']);
                expect(cell.value).toBe(12);
                expect(cellEle.textContent).toBe('12');
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(C1:C4,G1:G4,{TRUE,FALSE}))' }, 'D2']);
                expect(cell.value).toBe(8);
                expect(cellEle.textContent).toBe('8');
                helper.invoke('updateCell', [{ formula: '=AVERAGE(SUMIFS(C1:C4, G1:G4, {"=TRUE", "<>FALSE"}))' }, 'D2']);
                expect(cell.value).toBe('6');
                expect(cellEle.textContent).toBe('6');
                done();
            });
        });

        describe('EJ2-66373, EJ2-69543 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [{
                            rows: [
                                { cells: [{ value: '1' }, { value: '1' }, { value: '' }, { value: '1' }, { formula: '=MEDIAN(A1:D1)' }] },
                                { cells: [{ value: '2' }, { value: '2' }, { value: 'Text' }, { value: '' }, { formula: '=MEDIAN(A2:D2)' }] },
                                { cells: [{ value: '3' }, { value: '3' }, { value: '1' }, { value: '2' }, { formula: '=MEDIAN(A3:D3)' }] },
                                { cells: [{ value: 'Text' }, { value: '4' }, { value: '2' }, { value: 'Text' }, { formula: '=MEDIAN(A4:D4)' }] },
                                { cells: [{ value: '4' }, { value: '4' }, { value: '3' }, { value: '3' }, { formula: '=MEDIAN(A5:D5)' }] },
                                { cells: [{ value: '' }, { value: 'Text' }, { value: '4' }, { value: '4' }, { formula: '=MEDIAN(A6:D6)' }] },
                                { cells: [{ value: '5' }, { value: '' }, { value: '5' }, { value: '5' }, { formula: '=MEDIAN(A7:D7)' }] },
                                { cells: [{ formula: '=MEDIAN(A1:A7)' }, { formula: '=MEDIAN(B1:B7)' }, { formula: '=MEDIAN(C1:C7)' }, { formula: '=MEDIAN(D1:D7)' }] },
                            ]
                        }, {
                            rows: [
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A1:D1)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A2:D2)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A3:D3)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A4:D4)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A5:D5)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A6:D6)' }] },
                                { cells: [{ index: 4, formula: '=MEDIAN(Sheet1!A7:D7)' }] },
                                { cells: [{ formula: '=MEDIAN(Sheet1!A1:A7)' }, { formula: '=MEDIAN(Sheet1!B1:B7)' }, { formula: '=MEDIAN(Sheet1!C1:C7)' }, { formula: '=MEDIAN(Sheet1!D1:D7)' }] },
                            ]
                        }]
                    }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Page becomes unresponsive after provide Median formula with String and Numbers', (done: Function) => {
                expect(helper.getInstance().sheets[0].rows[0].cells[4].value).toBe(1);
                expect(helper.getInstance().sheets[0].rows[1].cells[4].value).toBe(2);
                expect(helper.getInstance().sheets[0].rows[2].cells[4].value).toBe(2.5);
                expect(helper.getInstance().sheets[0].rows[3].cells[4].value).toBe(3);
                expect(helper.getInstance().sheets[0].rows[4].cells[4].value).toBe(3.5);
                expect(helper.getInstance().sheets[0].rows[5].cells[4].value).toBe(4);
                expect(helper.getInstance().sheets[0].rows[6].cells[4].value).toBe(5);
                expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toBe(3);
                expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toBe(3);
                expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toBe(3);
                expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toBe(3);
                helper.getElement().querySelectorAll('.e-sheet-tab .e-toolbar-item')[1].click();
                setTimeout(() => {
                    expect(helper.getInstance().sheets[1].rows[0].cells[4].value).toBe(1);
                    expect(helper.getInstance().sheets[1].rows[1].cells[4].value).toBe(2);
                    expect(helper.getInstance().sheets[1].rows[2].cells[4].value).toBe(2.5);
                    expect(helper.getInstance().sheets[1].rows[3].cells[4].value).toBe(3);
                    expect(helper.getInstance().sheets[1].rows[4].cells[4].value).toBe(3.5);
                    expect(helper.getInstance().sheets[1].rows[5].cells[4].value).toBe(4);
                    expect(helper.getInstance().sheets[1].rows[6].cells[4].value).toBe(5);
                    expect(helper.getInstance().sheets[1].rows[7].cells[0].value).toBe(3);
                    expect(helper.getInstance().sheets[1].rows[7].cells[1].value).toBe(3);
                    expect(helper.getInstance().sheets[1].rows[7].cells[2].value).toBe(3);
                    expect(helper.getInstance().sheets[1].rows[7].cells[3].value).toBe(3);
                    done();
                });
            });
            it('Returns as #SPILL! when pass =UNIQUE formula as a parameter to computeExpression method', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(B1:B5)'))).toBe('["1","2","3","4"]');
                expect(spreadsheet.computeExpression('=UNIQUE(B1)')).toBe('1');
                expect(spreadsheet.computeExpression('=UNIQUE(11)')).toBe('11');
                expect(spreadsheet.computeExpression('=UNIQUE("11")')).toBe('11');
                expect(spreadsheet.computeExpression('=UNIQUE(true)')).toBe('TRUE');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(B1:C8)'))).toBe('["1","0","2","Text","3","1","4","2","4","3","Text","4","0","5","3","3"]');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(A1:B8,C1:D8)'))).toBe('["1","1","2","2","3","3","Text","4","4","4","0","Text","5","0"]');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(A1:A8,B1:C8)'))).toBe('["1","2","3","Text","4","0","5","3"]');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(A1:A3)'))).toBe('["1","2","3"]');
                expect(spreadsheet.computeExpression('=UNIQUE(A4)')).toBe('Text');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(Sheet2!E1:E6)'))).toBe('["1","2","2.5","3","3.5","4"]');
                expect(JSON.stringify(spreadsheet.computeExpression('=UNIQUE(Sheet1!D1:D8)'))).toBe('["1","0","2","Text","3","4","5"]');
                done();
            });
        });

        describe('FB23112, EJ2-60666, EJ2-939665, EJ2-994048, EJ2-1000965 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Match function is not working for cell reference', (done: Function) => {
                helper.edit('I2', 'Running Shoes');
                helper.edit('I3', '=Match(I2, A2:A11)');
                expect(helper.invoke('getCell', [2, 8]).textContent).toBe('7');
                expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toBe(7);
                done();
            });
            it('EJ2-994048: VLOOKUP comparison with empty string ("") returns FALSE when lookup value is blank cell', (done: Function) => {
                const spreadsheet: any = helper.getInstance().sheets[0];
                helper.edit('D8', '');
                expect(spreadsheet.rows[7].cells[3].value).toBe('');
                helper.edit('J2', '=IF(VLOOKUP(I2,A2:D11,4,FALSE)="","N/A")');
                expect(spreadsheet.rows[1].cells[9].value).toBe('N/A');
                helper.edit('J2', '=IF(""=VLOOKUP(I2,A2:D11,4,FALSE),"N/A")');
                expect(spreadsheet.rows[1].cells[9].value).toBe('N/A');
                helper.edit('J2', '=IF(0=VLOOKUP(I2,A2:D11,4,FALSE),"N/A")');
                expect(spreadsheet.rows[1].cells[9].value).toBe('N/A');
                helper.edit('J2', '=IF(VLOOKUP(I2,A2:D11,4,FALSE)=0,"N/A")');
                expect(spreadsheet.rows[1].cells[9].value).toBe('N/A');
                helper.edit('J3', '=SUM(IF(VLOOKUP(I2,A2:D11,4,FALSE)="",2,1), IF(VLOOKUP(A4,A2:D11,4,FALSE)=20,2,1))');
                expect(spreadsheet.rows[2].cells[9].value).toBe(4);
                helper.edit('J4', '=SUM(IF(VLOOKUP(I2,A2:D11,4,FALSE)="",2,1), D11)');
                expect(spreadsheet.rows[3].cells[9].value).toBe(52);
                helper.edit('J5', '=SUM(VLOOKUP(I2,A2:D11,4,FALSE), D11)');
                expect(spreadsheet.rows[4].cells[9].value).toBe(50);
                helper.edit('I6', 'Quantity');
                helper.edit('J6', '=IF(HLOOKUP(I6,A1:D8,8,FALSE)="","N/A")');
                expect(spreadsheet.rows[5].cells[9].value).toBe('N/A');
                helper.edit('J6', '=IF(HLOOKUP(I6,A1:D8,8,FALSE)=0,"N/A")');
                expect(spreadsheet.rows[5].cells[9].value).toBe('N/A');
                helper.edit('J6', '=IF(0=HLOOKUP(I6,A1:D8,8,FALSE),"N/A")');
                expect(spreadsheet.rows[5].cells[9].value).toBe('N/A');
                helper.edit('J6', '=IF(""=HLOOKUP(I6,A1:D8,8,FALSE),"N/A")');
                expect(spreadsheet.rows[5].cells[9].value).toBe('N/A');
                helper.edit('J7', '=AND(VLOOKUP(I2,A2:D11,4,FALSE)="", D10>D9)');
                expect(spreadsheet.rows[6].cells[9].value).toBe('TRUE');
                helper.edit('J8', '=OR(VLOOKUP(I2,A2:D11,4,FALSE)="", D10<D9)');
                expect(spreadsheet.rows[7].cells[9].value).toBe('TRUE');
                helper.edit('J9', '=NOT(VLOOKUP(I2,A2:D11,4,FALSE)= 0)');
                expect(spreadsheet.rows[8].cells[9].value).toBe('FALSE');
                helper.edit('I10', '15');
                expect(spreadsheet.rows[9].cells[8].value).toBe(15);
                helper.edit('J10', '=IF(VLOOKUP(I10*2,D2:E11,2,FALSE)= 10,"YES","NO")');
                expect(spreadsheet.rows[9].cells[9].value).toBe('YES');
                done();
            });
            it('EJ2-1000965: Incorrect Output for COUNTIF, DATEVALUE, and TEXT Formulas in Spreadsheet', (done: Function) => {
                const sheet: SheetModel = helper.getInstance().sheets[0];
                helper.edit('E12', '=IF(COUNTIF(A2,"Casual*"),"YES","NO")');
                expect(sheet.rows[11].cells[4].value).toBe('YES');
                helper.edit('E13', '=IF(COUNTIF(E2:E11,10),"YES","NO")');
                expect(sheet.rows[12].cells[4].value).toBe('YES');
                helper.edit('F12', '=DATEVALUE("5-JUL")');
                expect(sheet.rows[11].cells[5].value).toBe('46208');
                helper.edit('F13', '=DATEVALUE("12/24")');
                expect(sheet.rows[12].cells[5].value).toBe('46380');
                helper.edit('G12', '=TEXT(B9,"aaaa")');
                expect(sheet.rows[11].cells[6].value).toBe('Sunday');
                helper.edit('G13', '=TEXT(B9,"aaa")');
                expect(sheet.rows[12].cells[6].value).toBe('Sun');
                helper.edit('G14', '=TEXT(B9,"mmmm")');
                expect(sheet.rows[13].cells[6].value).toBe('November');
                helper.edit('G15', '=TEXT(B9,"mmm")');
                expect(sheet.rows[14].cells[6].value).toBe('Nov');
                done();
            });
            it('Editing formula is not working after sheets updated dynamically', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.sheets = [{}, {}];
                spreadsheet.dataBind();
                setTimeout(() => {
                    helper.edit('B1', '=A1');
                    expect(spreadsheet.sheets[0].rows[0].cells[1].value).toBe('0');
                    expect(spreadsheet.sheets[0].rows[0].cells[1].formula).toBe('=A1');
                    expect(helper.invoke('getCell', [0, 1]).textContent).toBe('0');
                    done();
                });
            });
            it('CONCAT formula is not working properly with the nested TEXT formula', (done: Function) => {
                helper.edit('J2', '=CONCAT(TEXT("100000","$#,##0")," Test")');
                helper.edit('J3', '=TEXT("100000","$#,##0")');
                expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('$100,000 Test');
                expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('$100,000');
                done();
            });
        });

        describe('I325908, SF-734277 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [{
                            rows: [{ cells: [{ value: '0' }, { index: 4, value: '10' }] }, {
                                cells: [{
                                    formula:
                                        '=IF($A1<>0,$A1*E$1,"0,00")'
                                }, { formula: '=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B9)"),"View customer profile")' },
                                { formula: '=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B16)"),"#VALUE!")' }, { formula: '=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B15)"),"Create target groups")' },
                                { formula: '=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B13)"),"Export of push tokens")' }]
                            }]
                        }]
                    }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('IF formula false value with "," inside scenario', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[0].value).toEqual('0,00');
                expect(helper.invoke('getCell', [1, 0]).textContent).toEqual('0,00');
                helper.edit('A1', '10');
                setTimeout((): void => {
                    expect(spreadsheet.sheets[0].rows[1].cells[0].value).toEqual('100');
                    expect(helper.invoke('getCell', [1, 0]).textContent).toEqual('100');
                    done();
                });
            });

            it('EJ2-965650 -> A #NAME? error occurs when using the IFERROR formula with an unrecognized or unknown function in it', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[1].formula).toBe('=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B9)"),"View customer profile")');
                expect(spreadsheet.sheets[0].rows[1].cells[2].formula).toBe('=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B16)"),"#VALUE!")');
                expect(spreadsheet.sheets[0].rows[1].cells[3].formula).toBe('=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B15)"),"Create target groups")');
                expect(spreadsheet.sheets[0].rows[1].cells[4].formula).toBe('=IFERROR(__xludf.DUMMYFUNCTION("GOOGLETRANSLATE(B13)"),"Export of push tokens")');
                expect(spreadsheet.sheets[0].rows[1].cells[1].value).not.toBe('#NAME?');
                expect(spreadsheet.sheets[0].rows[1].cells[2].value).not.toBe('#NAME?');
                expect(spreadsheet.sheets[0].rows[1].cells[3].value).not.toBe('#NAME?');
                expect(spreadsheet.sheets[0].rows[1].cells[4].value).not.toBe('#NAME?');
                expect(spreadsheet.sheets[0].rows[1].cells[1].value).toBe('View customer profile');
                expect(spreadsheet.sheets[0].rows[1].cells[2].value).toBe('#VALUE!');
                expect(spreadsheet.sheets[0].rows[1].cells[3].value).toBe('Create target groups');
                expect(spreadsheet.sheets[0].rows[1].cells[4].value).toBe('Export of push tokens');
                done();
            });
            it('EJ2-965650 -> A #NAME? error occurs when using the IFERROR formula with an unrecognized or unknown function in it', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.edit('C13', '10');
                helper.edit('C14', '=IFERROR(SUM(C13,5), TEST(D4))');
                const rows: RowModel[] = spreadsheet.sheets[0].rows;
                expect(rows[13].cells[2].formula).toBe('=IFERROR(SUM(C13,5), TEST(D4))');
                expect(rows[13].cells[2].value).toBe('15');
                helper.edit('C15', '=SUM(IFERROR(C13, DEMO(10)),IFERROR(SUM(DEMO(10), 10), C13))+10');
                expect(rows[14].cells[2].formula).toBe('=SUM(IFERROR(C13, DEMO(10)),IFERROR(SUM(DEMO(10), 10), C13))+10');
                expect(rows[14].cells[2].value).toBe('30');
                helper.edit('C16', '=AVERAGE(iferror(C13, DEMO(10)),iferror(ABS(SUM(DEMO(10), 10)), C13), 22)');
                expect(rows[15].cells[2].formula).toBe('=AVERAGE(iferror(C13, DEMO(10)),iferror(ABS(SUM(DEMO(10), 10)), C13), 22)');
                expect(rows[15].cells[2].value).toBe('14');
                helper.edit('C13', '22');
                expect(rows[13].cells[2].value).toBe('27');
                expect(rows[14].cells[2].value).toBe('54');
                expect(rows[15].cells[2].value).toBe('22');
                helper.edit('C13', '#DIV/0!');
                expect(rows[13].cells[2].value).toBe('#NAME?');
                expect(rows[14].cells[2].value).toBe('#NAME?');
                expect(rows[15].cells[2].value).toBe('#NAME?');
                done();
            });
        });

        describe('SF-362961 ->', () => {
            let spreadsheet: any;
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [{
                            name: 'Report Output', rows: [{
                                index: 1, cells:
                                    [{ formula: '=IFS(NonOtherUQE!A1=0,"",NonOtherUQE!A1="Others","",TRUE,NonOtherUQE!A1)' }, { index: 3, formula: '=IFS(ClientData!E1=0,"",ClientData!E1="Others","",TRUE,ClientData!E1)' },
                                    { formula: '=IF($D2="","",IFERROR(IF(SUMIF(ClientData!D1:D3,$A4,ClientData!C1:C3)=0,"0",SUMIF(ClientData!D1:D3,$A4,ClientData!C1:C3)),"0"))' }]
                            }]
                        },
                        {
                            name: 'ClientData', rows: [{ cells: [{ index: 2, value: '100' }, { value: 'EY Adj 1' }, { formula: '=UNIQUE(ClientData!D1:D3)' }] },
                            { cells: [{ value: 'EY Adj 2' }, { value: '1,000.00' }, { value: '150' }, { value: 'EY Adj 2' }] }, { cells: [{ index: 1, value: '-2,000.00' }, { value: '200' }, { value: 'Others' }] },
                            { index: 5, cells: [{ index: 6, formula: '=C6' }] }, { cells: [{ index: 6, formula: '=D5' }] }, { index: 100, cells: [{ formula: '=SUM(C1:C2)' }] }]
                        },
                        { name: 'NonOtherUQE' }]
                    }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Inserting row not properly updated the cell references in other sheets', (done: Function) => {
                spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0].rows[1].cells[3].value).toEqual('EY Adj 1');
                expect(spreadsheet.sheets[0].rows[1].cells[4].value).toEqual('0');
                spreadsheet.activeSheetIndex = 1;
                spreadsheet.dataBind();
                setTimeout((): void => {
                    expect(spreadsheet.sheets[0].rows[1].cells[3].value).toEqual('EY Adj 1');
                    expect(spreadsheet.sheets[0].rows[1].cells[4].value).toEqual('0');
                    helper.invoke('insertRow');
                    setTimeout((): void => {
                        expect(spreadsheet.sheets[0].rows[1].cells[3].formula).toEqual('=IFS(ClientData!E2=0,"",ClientData!E2="Others","",TRUE,ClientData!E2)');
                        expect(spreadsheet.sheets[0].rows[1].cells[3].value).toBeNull();
                        expect(spreadsheet.sheets[0].rows[1].cells[4].formula).toEqual('=IF($D2="","",IFERROR(IF(SUMIF(ClientData!D2:D4,$A4,ClientData!C2:C4)=0,"0",SUMIF(ClientData!D2:D4,$A4,ClientData!C2:C4)),"0"))');
                        expect(spreadsheet.sheets[0].rows[1].cells[4].value).toBeNull();
                        done();
                    });
                });
            });
            it('saveAsJson formula calculation for not calculated formula cell and #value error checking', (done: Function) => {
                expect(spreadsheet.sheets[0].rows[1].cells[0].value).toEqual('');
                expect(spreadsheet.sheets[1].rows[101].cells[0].value).toBeNull();
                // saveAsJson operation codes are used to replicate the case, since CI will not compatible with Worker task so invoking getStringifyObject method directly.
                const skipProps: string[] = ['dataSource', 'startCell', 'query', 'showFieldAsHeader'];
                for (let i: number = 0, sheetCount: number = spreadsheet.sheets.length; i < sheetCount; i++) {
                    spreadsheet.workbookSaveModule.getStringifyObject(spreadsheet.sheets[i], skipProps, i);
                }
                expect(spreadsheet.sheets[0].rows[1].cells[0].value).toEqual('');
                expect(spreadsheet.sheets[1].rows[101].cells[0].value).toEqual(250);
                done();
            });
            it('External copy/paste and SUMIF formula calculation value is not proper', (done: Function) => {
                expect(getCell(4, 2, spreadsheet.sheets[1])).toBeNull();
                helper.invoke('updateCell', [{ formula: '=SUMIF(ClientData!$D$2:$D$4,$A3,ClientData!$B$2:$B$4)' }, 'C5']);
                expect(spreadsheet.sheets[1].rows[4].cells[2].value).toEqual(1000);
                done();
            });
            it('Referenced cells are not updated while updating the UNIQUE formula value', (done: Function) => {
                expect(getCell(5, 2, spreadsheet.sheets[1])).toBeNull();
                expect(spreadsheet.sheets[1].rows[6].cells[6].formula).toEqual('=C7');
                expect(spreadsheet.sheets[1].rows[6].cells[6].value).toEqual('0');
                expect(spreadsheet.sheets[1].rows[7].cells[6].formula).toEqual('=D6');
                expect(spreadsheet.sheets[1].rows[7].cells[6].value).toEqual('0');
                helper.invoke('updateCell', [{ formula: '=UNIQUE(C2:D4)' }, 'C6']);
                expect(spreadsheet.sheets[1].rows[5].cells[2].value).toEqual('100');
                expect(spreadsheet.sheets[1].rows[6].cells[6].value).toEqual('150');
                expect(spreadsheet.sheets[1].rows[7].cells[6].value).toEqual('EY Adj 1');
                done();
            });
        });

        describe('EJ2-52160, EJ2-56672, EJ2-71484', () => {
            let rows: RowModel[];
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        rows: [
                            { cells: [{}] },
                            { cells: [{ value: 'Entity 1' }, { value: '100' }, { value: '200' }, { value: '300' }] },
                            { cells: [{ value: 'Entity 1' }] },
                            { cells: [{ value: 'Entity 2' }, { value: '100' }, { value: '200' }, { value: '300' }] },
                            { cells: [{ value: 'Entity 1' }] },
                            { cells: [{ value: 'Entity 3' }, { value: '300' }, { value: '400' }, { value: '500' }] },
                            { cells: [{ value: 'Entity 4' }, { value: '1' }, { value: '3' }, { value: '5' }] },
                            { cells: [{ value: 'Entity 5' }, { value: '2' }, { value: '4' }, { value: '6' }] },
                            { cells: [{ value: 'Entity 2' }] },
                            { cells: [{ value: 'Entity 3' }] },
                            { cells: [{}] },
                            { cells: [{ value: 'cat' }, { formula: '=UNIQUE(A12:A100)' }, { formula: '=IFS(B12=0,"null",TRUE,B12)' }] },
                            { cells: [{ value: 'dog' }] },
                            { cells: [{ value: 'lion' }] },
                            { cells: [{ value: 'tiger' }] }
                        ]
                    }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('EJ2-52160 - UNIQUE function on multiple columns doesnot work properly', (done: Function) => {
                helper.invoke('updateCell', [{ formula: '=UNIQUE(A1:D10)' }, 'G2']);
                expect(helper.getInstance().sheets[0].rows[1].cells[6].formula).toBe('=UNIQUE(A1:D10)');
                expect(helper.getInstance().sheets[0].rows[1].cells[6].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[6].value).toBe('Entity 1');
                expect(helper.getInstance().sheets[0].rows[9].cells[6].value).toBe('Entity 3');
                expect(helper.getInstance().sheets[0].rows[9].cells[7].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[9].cells[8].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[9].cells[9].value).toBe('0');
                done();
            });
            it('EJ2-56672 - To refresh the all dependent cells for a formula that refers another formula cell->', (done: Function) => {
                rows = helper.getInstance().sheets[0].rows;
                expect(rows[11].cells[1].formula).toBe('=UNIQUE(A12:A100)');
                expect(rows[11].cells[2].formula).toBe('=IFS(B12=0,"null",TRUE,B12)');
                expect(rows[11].cells[1].value).toBe('cat');
                expect(rows[12].cells[1].value).toBe('dog');
                expect(rows[13].cells[1].value).toBe('lion');
                expect(rows[14].cells[1].value).toBe('tiger');
                expect(rows[15].cells[1].value).toBeUndefined;
                expect(rows[11].cells[2].value).toBe('cat');
                helper.invoke('autoFill', ['C13:C20', 'C12', 'Down', 'FillWithoutFormatting']);
                expect(rows[12].cells[2].value).toBe('dog');
                expect(rows[13].cells[2].value).toBe('lion');
                expect(rows[14].cells[2].value).toBe('tiger');
                expect(rows[15].cells[2].value).toBeUndefined;
                expect(rows[16].cells[2].value).toBeUndefined;
                helper.invoke('updateCell', [{ value: 'hippo' }, 'A15']);
                expect(rows[14].cells[1].value).toBe('hippo');
                expect(rows[14].cells[2].value).toBe('hippo');
                done();
            });
            it('EJ2-56672 - Unique formula cell value throws #spill error on refresh ->', (done: Function) => {
                expect(rows[11].cells[1].formula).toBe('=UNIQUE(A12:A100)');
                expect(rows[11].cells[1].value).toBe('cat');
                helper.getInstance().refresh();
                setTimeout(() => {
                    expect(rows[11].cells[1].value).toBe('cat');
                    done();
                });
            });
            it('EJ2-71484 - The IFERROR formula returns a #Value result while performing operations on string values ->', (done: Function) => {
                helper.edit('L1', '=IFERROR(A12/A13,"ERROR")');
                helper.edit('L2', '=IFERROR(A2/B2,"ERROR")');
                helper.edit('L3', '=IFERROR(B2/A2,"ERROR")');
                helper.edit('L4', '=IFERROR(H3/H4,"ERROR")');
                helper.edit('L5', '=IFERROR(B1/B2,"ERROR")');
                helper.edit('L6', '=IFERROR(B2/B1,"ERROR")');
                helper.edit('L7', '=IFERROR(A1/B1,"ERROR")');
                helper.edit('L8', '=IFERROR(A2/B2,)');
                helper.edit('L9', '=IFERROR(A2/B2,TRUE)');
                helper.edit('L10', '=IFERROR(,"ERROR")');
                helper.edit('L11', '=IFERROR(,)');
                helper.edit('L12', '=IFERROR(10/5,)');
                helper.edit('L13', '=IFERROR(B2+C2,"ERROR")');
                helper.edit('L14', '=IFERROR(C2-B2,"ERROR")');
                helper.edit('L15', '=IFERROR(B8*C8,"ERROR")');
                helper.edit('L16', '=IFERROR(A2+B2,"ERROR")');
                helper.edit('L17', '=IFERROR(A4-B4,"ERROR")');
                helper.edit('L18', '=IFERROR(A8*B8,"ERROR")');
                helper.edit('L19', '=IFERROR(B13,"ERROR")');
                helper.edit('L20', '=IFERROR(B14,"ERROR")');
                helper.edit('L21', '=IFERROR(ADD,"ERROR")');
                helper.edit('L22', '=IFERROR("ADD","ERROR")');
                helper.edit('M1', 'B2');
                helper.edit('L23', '=IFERROR(M1,"ERROR")');
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[1].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[2].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[3].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[4].cells[11].value).toBe('0');
                    expect(helper.getInstance().sheets[0].rows[5].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[6].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[7].cells[11].value).toBe('0');
                    expect(helper.getInstance().sheets[0].rows[8].cells[11].value).toEqual('TRUE');
                    expect(helper.getInstance().sheets[0].rows[9].cells[11].value).toBe('0');
                    expect(helper.getInstance().sheets[0].rows[10].cells[11].value).toBe('0');
                    expect(helper.getInstance().sheets[0].rows[11].cells[11].value).toBe('2');
                    expect(helper.getInstance().sheets[0].rows[12].cells[11].value).toBe('300');
                    expect(helper.getInstance().sheets[0].rows[13].cells[11].value).toBe('100');
                    expect(helper.getInstance().sheets[0].rows[14].cells[11].value).toBe('8');
                    expect(helper.getInstance().sheets[0].rows[15].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[16].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[17].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[18].cells[11].value).toBe('dog');
                    expect(helper.getInstance().sheets[0].rows[19].cells[11].value).toBe('lion');
                    expect(helper.getInstance().sheets[0].rows[20].cells[11].value).toBe('ERROR');
                    expect(helper.getInstance().sheets[0].rows[21].cells[11].value).toBe('ADD');
                    expect(helper.getInstance().sheets[0].rows[22].cells[11].value).toBe('B2');
                    done();
                });
            });
        });

        describe('EJ2-67308 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        rows: [
                            { cells: [{ value: 'q1' }, { formula: '=IF(1<2, "QqqQ")' }] },
                            { cells: [{ value: 'q2' }, { formula: '=IF(SUM(1,1)<3, "Trueq", "Falseq")' }] },
                            { cells: [{ value: 'q1' }, { formula: '=IF(SUM(SUM(2,2),1)<3, "(Trueq)", "(Falseq)")' }] },
                            { cells: [{ value: 'q2' }, { formula: '=COUNTIF(A1:A4,"q1")' }] }
                        ]
                    }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Parsing error occurs when the custom function argument contains "q" alphabet', (done: Function) => {
                (window as any).CustomFuntion = (str: string) => {
                    return str;
                };
                helper.invoke('addCustomFunction', ["CustomFuntion", "myfunq"]);
                let formula: string = '=myfunq("SUCCESSq")';
                helper.edit('C1', '=IF(1<2, "QqqQ")');
                helper.edit('C2', '=IF(SUM(1,1)<3, "Trueq", "Falseq")');
                helper.edit('C3', '=IF(SUM(SUM(2,2),1)<3, "(Trueq)", "(Falseq)")');
                helper.edit('C4', '=COUNTIF(A1:A4,"q1")');
                helper.edit('C5', formula);
                expect(helper.invoke('getCell', [0, 1]).textContent).toBe('QqqQ');
                expect(helper.invoke('getCell', [0, 1]).innerText).toBe('QqqQ');
                expect(helper.invoke('getCell', [0, 2]).textContent).toBe('QqqQ');
                expect(helper.invoke('getCell', [0, 2]).innerText).toBe('QqqQ');
                expect(helper.invoke('getCell', [1, 1]).textContent).toBe('Trueq');
                expect(helper.invoke('getCell', [1, 1]).innerText).toBe('Trueq');
                expect(helper.invoke('getCell', [1, 2]).textContent).toBe('Trueq');
                expect(helper.invoke('getCell', [1, 2]).innerText).toBe('Trueq');
                expect(helper.invoke('getCell', [2, 1]).textContent).toBe('(Falseq)');
                expect(helper.invoke('getCell', [2, 1]).innerText).toBe('(Falseq)');
                expect(helper.invoke('getCell', [2, 2]).textContent).toBe('(Falseq)');
                expect(helper.invoke('getCell', [2, 2]).innerText).toBe('(Falseq)');
                expect(helper.invoke('getCell', [3, 1]).textContent).toBe('2');
                expect(helper.invoke('getCell', [3, 1]).innerText).toBe('2');
                expect(helper.invoke('getCell', [3, 2]).textContent).toBe('2');
                expect(helper.invoke('getCell', [3, 2]).innerText).toBe('2');
                expect(helper.invoke('getCell', [4, 2]).textContent).toBe('"SUCCESSq"');
                expect(helper.invoke('getCell', [4, 2]).innerText).toBe('"SUCCESSq"');
                done();
            });
        });

        describe('EJ2-863643, EJ2-867609, EJ2-870519, EJ2-936018 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        ranges: [{ dataSource: defaultData }],
                        rows: [
                            { cells: [{ index: 8, value: 'Loafers' }] }, { cells: [{ index: 8, value: '250' }] },
                            { cells: [{ index: 8, value: '255' }] }, { cells: [{ index: 8, value: '-1000' }] }]
                    }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Formula return wrong result for negative sign referred with negative cell address value without using brackets', (done: Function) => {
                helper.edit('J1', '=IF(A9=I1,-I4*(I3-I2),0)');
                expect(helper.invoke('getCell', [0, 9]).textContent).toBe('5000');
                helper.edit('J2', '=IF(A9=I1,-I4*(-I3-I2),0)');
                expect(helper.invoke('getCell', [1, 9]).textContent).toBe('-505000');
                helper.edit('J3', '=IF(A9=I1,-I4/(I3-I2),0)');
                expect(helper.invoke('getCell', [2, 9]).textContent).toBe('200');
                helper.edit('J4', '=IF(A9=I1,-I4/(I3+I2),0)');
                expect(helper.invoke('getCell', [3, 9]).textContent).toBe('1.98019802');
                helper.edit('J5', '=IF(A9=I1,-I4*G3/(I3-I2),0)');
                expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1000');
                helper.edit('J6', '=IF(A9=I1,-I4*-G3/(I3-I2),0)');
                expect(helper.invoke('getCell', [5, 9]).textContent).toBe('-1000');
                done();
            });
            it('Formula calculation is not working properly with the combinations of negative sign and brackets', (done: Function) => {
                helper.edit('J7', '=IF(D2<E2,-(I4+G2+F3+G5+E2)/(D5),0)');
                expect(helper.invoke('getCell', [6, 9]).textContent).toBe('24.53333333');
                helper.edit('J8', '=IF(D2<E2,-(I4+G2+F3+G5+E2)/(-D5),0)');
                expect(helper.invoke('getCell', [7, 9]).textContent).toBe('-24.53333333');
                helper.edit('J9', '=IF(D2>E2,0,-(I4+G2*F3/G5+E2)/(D2))');
                expect(helper.invoke('getCell', [8, 9]).textContent).toBe('92.54545455');
                helper.edit('J10', '=IF(D2>E2,0,-(-(I4+G2*F3/G5+E2)/(D2)))');
                expect(helper.invoke('getCell', [9, 9]).textContent).toBe('-92.54545455');
                helper.edit('J11', '=IF(D2=H2,---(I4)/(F4+F6-F8)-F5,0)');
                expect(helper.invoke('getCell', [10, 9]).textContent).toBe('-297.5');
                helper.edit('J12', '=IF(D2=H2,--(I4)/(F4+F6-F8)-F5,0)');
                expect(helper.invoke('getCell', [11, 9]).textContent).toBe('-302.5');
                helper.edit('J13', '=IF(A9=I1,--I4*--G3/(I3-I2),0)');
                expect(helper.invoke('getCell', [12, 9]).textContent).toBe('-1000');
                helper.edit('J13', '=IF(A9=I1,--I4*-G3/(I3-I2),0)');
                expect(helper.invoke('getCell', [12, 9]).textContent).toBe('1000');
                done();
            });
            it('Cell values are updated directly from the data source before converted to formatted value', (done: Function) => {
                expect(helper.invoke('getCell', [2, 1]).textContent).toBe('6/11/2014');
                expect(helper.getInstance().sheets[0].rows[2].cells[1].format).toBe('m/d/yyyy');
                expect(helper.invoke('getCell', [9, 1]).textContent).toBe('7/9/2014');
                expect(helper.getInstance().sheets[0].rows[9].cells[1].format).toBe('m/d/yyyy');
                helper.edit('K1', '=DATE(1999,1,3)');
                expect(helper.invoke('getCell', [0, 10]).textContent).toBe('1/3/1999');
                helper.edit('K2', '=DATE(2024,12,09)');
                expect(helper.invoke('getCell', [1, 10]).textContent).toBe('12/9/2024');
                helper.edit('K3', '=DATE(2024,06,09)');
                expect(helper.invoke('getCell', [2, 10]).textContent).toBe('6/9/2024');
                helper.edit('K4', '=DATE(F7,G4,G8)');
                expect(helper.invoke('getCell', [3, 10]).textContent).toBe('7/3/2700');
                helper.edit('K5', '=DATE(F6,G5,G3)');
                expect(helper.invoke('getCell', [4, 10]).textContent).toBe('11/5/2200');
                helper.edit('K6', '=DATE(F4,G9,G5)');
                expect(helper.invoke('getCell', [5, 10]).textContent).toBe('6/11/2200');
                done();
            });
            it('Wrong number of arguments issue occurs with the formula containing negative sign in nested formula.', (done: Function) => {
                helper.edit('M4', 'Hello');
                helper.edit('K7', '=IF(K3="YES",K3,IF(L5="YES",L5,IF(M4="HELLO", MAX(F13,-(SUM(F8,F9,F11,F12)-SUM(F18:F20))),7)))');
                expect(helper.invoke('getCell', [6, 10]).textContent).toBe('-1010');
                helper.edit('K8', '=IF(K3="YES",K3,IF(L5="YES",L5,IF(M3="HELLO", MAX(F13,-(SUM(F8,F9,F11,F12)-SUM(F18:F20))),7)))');
                expect(helper.invoke('getCell', [7, 10]).textContent).toBe('7');
                helper.edit('K9', '=MAX(F3,-(SUM(F6,F7,F8,F9)-SUM(F10:F11)))');
                expect(helper.invoke('getCell', [8, 10]).textContent).toBe('600');
                helper.edit('K10', '=SUM(H2,-(COUNT(G2:G11)))');
                expect(helper.invoke('getCell', [9, 10]).textContent).toBe('0');
                helper.edit('K11', '=SUM(G3,-(COUNT(G1:G11)))');
                expect(helper.invoke('getCell', [10, 10]).textContent).toBe('-5');
                helper.edit('K12', '=MAX(-(SUM(F6,F7,F8,F9)-SUM(F10:F11)),F2)');
                expect(helper.invoke('getCell', [11, 10]).textContent).toBe('200');
                helper.edit('K13', '=SUM((-MAX(G2:G5)+MIN(H2:H5)),E5,-(E2+E3))');
                expect(helper.invoke('getCell', [12, 10]).textContent).toBe('-31');
                done();
            });
        });

        describe('EJ2-946729 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Spreadsheet becomes unresponsive when using improper column and row referencs->', (done: Function) => {
                helper.edit('A1', '=SUMIF(HELLOWORLDS23231:HELLOWORLDS23234,H1,H2:H5)');
                expect(helper.invoke('getCell', [0, 0]).textContent).toBe('#NAME?');
                helper.edit('A2', '=AVERAGEIF(HELLOWORLDS23231:HELLOWORLDS23234,H1,H2:H5)');
                expect(helper.invoke('getCell', [1, 0]).textContent).toBe('#NAME?');
                helper.edit('A3', '=SUMPRODUCT(HELLOWORLDS23231:HELLOWORLDS23234)');
                expect(helper.invoke('getCell', [2, 0]).textContent).toBe('#NAME?');
                helper.edit('A4', '=LOOKUP(E11,HELLOWORLDS23231:HELLOWORLDS23234,F5:F11)');
                expect(helper.invoke('getCell', [3, 0]).textContent).toBe('#NAME?');
                helper.edit('A5', '=MATCH(E11,HELLOWORLDS23231:HELLOWORLDS23234,1)');
                expect(helper.invoke('getCell', [4, 0]).textContent).toBe('#NAME?');
                helper.edit('A6', '=IF(E11>12,HELLOWORLDS23231:HELLOWORLDS23234,HELLOWORLDS23231:HELLOWORLDS23237)');
                expect(helper.invoke('getCell', [5, 0]).textContent).toBe('#NAME?');
                helper.edit('A7', '=IFS(F11>10,HELLOWORLDS23231:HELLOWORLDS23234,G11=9,HELLOWORLDS23231:HELLOWORLDS23237)');
                expect(helper.invoke('getCell', [6, 0]).textContent).toBe('#NAME?');
                done();
            });
        });
    });

    // Others formula
    describe('UI interaction checking ->', () => {
        beforeAll((done: Function) => {
            model = {
                sheets: [
                    {
                        ranges: [{ dataSource: defaultData }]
                    }
                ]
            };
            helper.initializeSpreadsheet(model, done);
        });

        afterAll(() => {
            helper.invoke('destroy');
        });

        // it('Formula edit testing', (done: Function) => {
        //     let td: HTMLTableCellElement = helper.invoke('getCell', [5, 4]);
        //     let coords: DOMRect = <DOMRect>td.getBoundingClientRect();
        //     //Selection update.
        //     helper.triggerMouseAction('mousedown', { x: coords.x, y: coords.y }, null, td);
        //     helper.triggerMouseAction('mouseup', { x: coords.x, y: coords.y }, null, td);
        //     //Start edit.
        //     helper.triggerMouseAction('dblclick', { x: coords.x, y: coords.y }, null, td);
        //     let editorElem: HTMLElement = helper.getElementFromSpreadsheet('.e-spreadsheet-edit');
        //     editorElem.textContent = '=S';
        //     //key up & down - S key for update internal properties.
        //     helper.triggerKeyEvent('keydown', 83, null, false, false, editorElem);
        //     helper.triggerKeyEvent('keyup', 83, null, false, false, editorElem);
        //     setTimeout(() => {
        //         let formulaPopupLi: HTMLElement = helper.getElement('#spreadsheet_ac_popup li');
        //         expect(formulaPopupLi).not.toBeNull();
        //         expect(formulaPopupLi.textContent).toBe('SUM');
        //         setTimeout(() => {
        //             helper.triggerKeyEvent('keydown', 9, null, false, false, editorElem); //Tab key
        //             setTimeout(() => {
        //                 expect(editorElem.textContent).toBe('=SUM(');
        //                 editorElem.textContent = editorElem.textContent + '10,20';
        //                 //key down - S key for update internal properties.
        //                 helper.triggerKeyEvent('keydown', 48, null, false, false, editorElem);
        //                 //Enter key
        //                 helper.triggerKeyEvent('keydown', 13, null, false, false, editorElem);
        //                 helper.invoke('getData', ['Sheet1!E6']).then((values: Map<string, CellModel>) => {
        //                     expect(values.get('E6').formula).toEqual('=SUM(10,20)');
        //                     expect(values.get('E6').value).toEqual('30');
        //                     done();
        //                 });
        //             }, 10);
        //         }, 10);
        //     }, 110);
        // });


        it('Int formula', (done: Function) => {
            helper.edit('D2', '11.5');
            helper.edit('J1', '=int(D2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":11,"formula":"=int(D2)"}');
            done();
        });

        it('Today formula', (done: Function) => {
            helper.edit('J2', '=today()');
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[9];
            expect(cell.format).toBe('m/d/yyyy');
            expect(cell.formula).toBe('=today()');
            done();
        });

        it('Sum product formula', (done: Function) => {
            helper.edit('J3', '=sumproduct(D2:D5,E2:E5)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('1430');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":1430,"formula":"=sumproduct(D2:D5,E2:E5)"}');
            done();
        });

        it('Roundup formula', (done: Function) => {
            helper.edit('J4', '=roundup(D2, 0)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"12","formula":"=roundup(D2, 0)"}');
            done();
        });

        it('Sort formula', (done: Function) => {
            helper.edit('K1', '=sort(A1:A4)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('Formal Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"Casual Shoes","formula":"=sort(A1:A4)"}');
            expect(helper.getInstance().sheets[0].rows[2].cells[10].value).toBe('Item Name')
            expect(helper.getInstance().sheets[0].rows[3].cells[10].value).toBe('Sports Shoes')
            done();
        });

        it('Text formula', (done: Function) => {
            helper.edit('J5', '=Text(D2, "0%")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1150%');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toBe('=Text(D2, "0%")');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].value).toBe('11.5');
            done();
        });

        it('Lookup formula', (done: Function) => {
            helper.edit('J6', '=LOOKUP(20,D2:D5,E2:E5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toBe('=LOOKUP(20,D2:D5,E2:E5)');
            // expect(helper.invoke('getCell', [5, 9]).textContent).toBe('15'); // This case need to be fixed
            // expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":15,"formula":"=LOOKUP(20,D2:D5,E2:E5)"}');
            done();
        });

        it('Slope formula', (done: Function) => {
            helper.edit('J7', '=slope(D2:D5,E2:E5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.142105263');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0.14210526315789473","formula":"=slope(D2:D5,E2:E5)"}');
            done();
        });

        it('Intercept formula', (done: Function) => {
            helper.edit('J8', '=INTERCEPT(D2:D5,E2:E5)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('13.60526316');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{"value":"13.605263157894736","formula":"=INTERCEPT(D2:D5,E2:E5)"}');
            done();
        });

        it('Ln formula', (done: Function) => {
            helper.edit('J9', '=ln(D2)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('2.442347035');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[9])).toBe('{"value":2.4423470353692043,"formula":"=ln(D2)"}');
            done();
        });

        it('IsNumber formula', (done: Function) => {
            helper.edit('J10', '=isnumber(D2)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[9])).toBe('{"value":true,"formula":"=isnumber(D2)"}');
            helper.edit('J10', '=isnumber(A1)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[9])).toBe('{"value":false,"formula":"=isnumber(A1)"}');
            done();
        });

        it('Round formula', (done: Function) => {
            helper.edit('J11', '=round(D2, 0)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[9])).toBe('{"value":"12","formula":"=round(D2, 0)"}');
            done();
        });

        it('Power formula', (done: Function) => {
            helper.edit('J12', '=power(G3,G4)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('78125');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[9])).toBe('{"value":"78125","formula":"=power(G3,G4)"}');
            done();
        });

        it('Log formula', (done: Function) => {
            helper.edit('J13', '=log(D3,E3)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('0.88078754');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[9])).toBe('{"value":"0.8807875396193516","formula":"=log(D3,E3)"}');
            done();
        });

        it('Trunc formula', (done: Function) => {
            helper.edit('J14', '=trunc(D2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[9])).toBe('{"value":"11","formula":"=trunc(D2)"}');
            done();
        });

        it('Exp formula', (done: Function) => {
            helper.edit('J15', '=exp(D4)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('485165195.4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[9])).toBe('{"value":"485165195.4097903","formula":"=exp(D4)"}');
            done();
        });

        it('Geomean formula', (done: Function) => {
            helper.edit('J16', '=geomean(D2:D6)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('18.33133394');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[9])).toBe('{"value":"18.331333944571238","formula":"=geomean(D2:D6)"}');
            done();
        });

        it('Dependent cell update', (done: Function) => {
            helper.edit('D6', '40');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('19.41698595');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[9])).toBe('{"value":"19.41698595231722","formula":"=geomean(D2:D6)"}');
            done();
        });

        it('Compute expression', (done: Function) => {
            expect(helper.invoke('computeExpression', ['=SUM(E2,E5)'])).toBe(40);
            done();
        });
        it('Now formula', (done: Function) => {
            helper.edit('A13', '=NOW()');
            const cell: CellModel = helper.getInstance().sheets[0].rows[12].cells[0];
            expect(cell.value.indexOf('/') > -1).toBeFalsy();
            expect(cell.value.indexOf(':') > -1).toBeFalsy();
            expect(!!Number(cell.value)).toBeTruthy();
            expect(cell.format).toBe('m/d/yyyy h:mm');
            const cellContent: string = helper.invoke('getCell', [12, 0]).textContent;
            expect(cellContent.indexOf('/') > -1).toBeTruthy();
            expect(cellContent.indexOf(':') > -1).toBeTruthy();
            expect(cellContent.indexOf('AM') > -1).toBeFalsy();
            expect(cellContent.indexOf('PM') > -1).toBeFalsy();
            done();
        });
        it('Date formula', (done: Function) => {
            helper.edit('A14', '=DATE(2022, 8, 22)');
            const cell: CellModel = helper.getInstance().sheets[0].rows[13].cells[0];
            expect(cell.formula).toBe('=DATE(2022, 8, 22)');
            expect(cell.value).toBe('44795');
            const cellEle: HTMLElement = helper.invoke('getCell', [13, 0]);
            expect(cellEle.textContent).toBe('8/22/2022');
            expect(cellEle.classList.contains('e-right-align')).toBeTruthy();
            helper.invoke('updateCell', [{ formula: '=DATE(2022, 1, -1)' }, 'A14']);
            expect(cell.formula).toBe('=DATE(2022, 1, -1)');
            expect(cell.value).toBe('44560');
            expect(cellEle.textContent).toBe('12/30/2021');
            expect(cellEle.classList.contains('e-right-align')).toBeTruthy();
            helper.invoke('updateCell', [{ formula: '=DATE(2022, -1, 1)' }, 'A14']);
            expect(cell.formula).toBe('=DATE(2022, -1, 1)');
            expect(cell.value).toBe('44501');
            expect(cellEle.textContent).toBe('11/1/2021');
            expect(cellEle.classList.contains('e-right-align')).toBeTruthy();
            helper.invoke('updateCell', [{ formula: '=DATE(2022, -30, 1)' }, 'A14']);
            expect(cell.formula).toBe('=DATE(2022, -30, 1)');
            expect(cell.value).toBe('43617');
            expect(cellEle.textContent).toBe('6/1/2019');
            expect(cellEle.classList.contains('e-right-align')).toBeTruthy();
            done();
        });
    });

    describe('EJ2-974770,EJ2-1000521,EJ2-1000020: Aggegrate formula Not displayed the values correctly ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Aggregate valus should be displayed fully for formatted cells', (done: Function) => {
            helper.edit('I2', '0.967896589');
            helper.edit('I3', '0.967896598');
            helper.edit('I4', '0.967896889');
            helper.edit('I5', '0.967896599');
            helper.invoke('selectRange', ['I2:I5']);
            helper.getElement('#' + helper.id + '_number_format').click();
            helper.getElement('#' + helper.id + '_Text').click();
            setTimeout(() => {
                let aggregateBtn: HTMLElement = helper.getElement(`#${helper.id}_aggregate`);
                expect(aggregateBtn).not.toBeNull();
                expect(aggregateBtn.textContent).toBe('Sum: 3.871586675');
                helper.click('#' + helper.id + '_aggregate');
                let Element: NodeListOf<HTMLElement> = document.querySelectorAll("#spreadsheet_aggregate-popup li");
                expect(Element[0].textContent).toBe('Count: 4');
                expect(Element[1].textContent).toBe('Sum: 3.871586675');
                expect(Element[2].textContent).toBe('Avg: 0.96789666875');
                expect(Element[3].textContent).toBe('Min: 0.967896589');
                expect(Element[4].textContent).toBe('Max: 0.967896889');
                done();
            });
        });
        it('Defined Names do not work correctly when non-ASCII characters are included in Spreadsheet', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'testÆ', refersTo: 'D1:D10' });
            helper.getInstance().addDefinedName({ name: 'test', refersTo: 'E1:E10' });
            helper.edit('J1', '=Sum(testÆ)');
            helper.edit('J2', '=Sum(test)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('227');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":227,"formula":"=Sum(testÆ)"}');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('165');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":165,"formula":"=Sum(test)"}');
            helper.edit('D2', '100');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('317');
            helper.edit('E2', '100');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('245');
            done();
        });
        it('EJ2-1000020: Value Error occurs when nesting ISNUMBER formula inside IF formula in Spreadsheet', (done: Function) => {
            const sheet: SheetModel = helper.getInstance().sheets[0];
            helper.edit('I6', '=IF(ISNUMBER(H7)=TRUE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[5].cells[8].value).toBe('NUMBER');
            helper.edit('I6', '=IF(TRUE=ISNUMBER(H7),"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[5].cells[8].value).toBe('NUMBER');
            helper.edit('I7', '=IF(ISNUMBER(H7)=FALSE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[6].cells[8].value).toBe('NOT NUMBER');
            helper.edit('I7', '=IF(FALSE=ISNUMBER(H7),"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[6].cells[8].value).toBe('NOT NUMBER');
            helper.edit('I8', '=IF(ISNUMBER(H7)<>FALSE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[7].cells[8].value).toBe('NUMBER');
            helper.edit('I8', '=IF(FALSE<>ISNUMBER(H7),"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[7].cells[8].value).toBe('NUMBER');
            helper.edit('I9', '=IF(ISNUMBER(H7)<>TRUE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[8].cells[8].value).toBe('NOT NUMBER');
            helper.edit('I9', '=IF(TRUE<>ISNUMBER(H7),"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[8].cells[8].value).toBe('NOT NUMBER');
            helper.edit('I10', '=IF(ISNUMBER(B16)=TRUE,IF(B16>250,">250",IF(B16>50,"51 to 250",IF(B16>15,"16 to 50",IF(B16>5,"6 to 15",IF(B16>1,"2 to 5",IF(B16>0,1,IF(B16=0,0,))))))))');
            expect(sheet.rows[9].cells[8].value).toBe('FALSE');
            helper.edit('I11', '=IF(AND($B$28="Individual",D35="Deviation",ISNUMBER($B$20)=TRUE),"Yes",IF(AND($B$28="Composite",H35>0,ISNUMBER($B$20)=TRUE),"Yes",""))');
            expect(sheet.rows[10].cells[8].value).toBe('');
            helper.edit('I12', '=ISNUMBER(H7)<>TRUE');
            expect(sheet.rows[11].cells[8].value).toBe('FALSE');
            helper.edit('I12', '=TRUE<>ISNUMBER(H7)');
            expect(sheet.rows[11].cells[8].value).toBe('FALSE');
            helper.edit('I13', '=INT(G34)<>G34');
            expect(sheet.rows[12].cells[8].value).toBe('FALSE');
            helper.edit('I14', '=G34<>INT(G34)');
            expect(sheet.rows[13].cells[8].value).toBe('FALSE');
            helper.edit('I13', '=IF(ISNUMBER(A2)=TRUE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[12].cells[8].value).toBe('NOT NUMBER');
            helper.edit('I14', '=IF(ISNUMBER(A4)=FALSE,"NUMBER", "NOT NUMBER")');
            expect(sheet.rows[13].cells[8].value).toBe('NUMBER');
            done();
        });
    });

    describe('Improve the formula recalculation performance when deleting the values on the formula dependent cells ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{}] }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.updateCell({ value: '6-6-2024' }, 'A1');
                    spreadsheet.updateCell({ value: '7-7-2024' }, 'A2');
                    spreadsheet.updateCell({ value: '1000000' }, 'A3');
                    for (let index: number = 1; index < 42; index++) {
                        spreadsheet.updateCell({ formula: stringFormat('=62000', index.toString()) }, stringFormat('B{0}', index.toString()));
                        spreadsheet.updateCell({ formula: stringFormat('=F{0}*(DAYS(A2,A1)/((A3/100)/30))', (index - 1).toString()) }, stringFormat('D{0}', index.toString()));
                        spreadsheet.updateCell({ formula: stringFormat('=D{0} - B1', index.toString()) }, stringFormat('E{0}', index.toString()));
                        spreadsheet.updateCell({ formula: stringFormat('=F{1} - E{0}', index.toString(), (index - 1).toString()) }, stringFormat('F{0}', index.toString()));
                    }
                    spreadsheet.updateCell({ formula: '=5300000' }, 'F1');
                    spreadsheet.updateCell({ formula: '=0' }, 'D1');
                }
            }, done);
            function stringFormat(str: string, ...args: string[]): string {
                return str.replace(/{(\d+)}/g, (match, index) => args[index] || '');
            }
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        beforeEach((done: Function) => {
            setTimeout(() => { done(); }, 100);
        });
        it('Deleting single cell with the formula dependent cells', (done: Function) => {
            helper.invoke('selectRange', ['D2']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[3].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toBeUndefined;
                done();
            });
        });
        it('Deleting in between ranges with the formula dependent cells', (done: Function) => {
            helper.invoke('selectRange', ['E2:F5']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[4].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[4].value).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[4].cells[5].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[4].cells[5].value).toBeUndefined;
                done();
            });
        });
        it('Deleting whole ranges of cells with the formula dependent cells', (done: Function) => {
            helper.invoke('selectRange', ['D6:F40']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[5].cells[3].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[14].cells[4].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[14].cells[4].value).toBeUndefined;
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                done();
            });
        });
        it('Deleting in between ranges with the formula dependent cells and empty cells', (done: Function) => {
            helper.invoke('selectRange', ['E2:H2']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[4].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[4].value).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[5].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[5].value).toBeUndefined;
                done();
            });
        });
        it('Deleting in between ranges with in between empty cells and the formula dependent cells', (done: Function) => {
            helper.invoke('selectRange', ['E6']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                helper.invoke('selectRange', ['D4:F8']);
                helper.triggerKeyNativeEvent(46);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[3].cells[3].formula).toBeUndefined;
                    expect(helper.getInstance().sheets[0].rows[3].cells[3].value).toBeUndefined;
                    expect(helper.getInstance().sheets[0].rows[6].cells[4].formula).toBeUndefined;
                    expect(helper.getInstance().sheets[0].rows[6].cells[4].value).toBeUndefined;
                    done();
                });
            });
        });
        it('Checking formula recalculation for the formula dependent cells while deleting and undo', (done: Function) => {
            helper.invoke('selectRange', ['D2:E8']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toBe('=F2 - E3');
                helper.click('#spreadsheet_undo');
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toBe('62000');
                    expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toBe('=F2 - E3');
                    done();
                });
            });
        });
        it('Checking formula recalculation for the formula dependent cells while deleting and redo', (done: Function) => {
            helper.click('#spreadsheet_redo');
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toBe('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toBe('=F2 - E3');
                helper.click('#spreadsheet_undo');
                helper.click('#spreadsheet_undo');
                done();
            });
        });
        it('Deleting cells with reverse selection', (done: Function) => {
            helper.invoke('selectRange', ['H10:D1']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[9].cells[5].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[9].cells[5].value).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[0].cells[3].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toBeUndefined;
                done();
            });
        });
        it('Deleting non formula dependent cells', (done: Function) => {
            helper.invoke('selectRange', ['B3']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[1].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[2].cells[1].value).toBeUndefined;
                helper.click('#spreadsheet_undo');
                done();
            });
        });
        it('Deleting cells with cut and paste', (done: Function) => {
            helper.invoke('cut', ['E13:F13']).then(() => { helper.invoke('paste', ['H2:I2']); });
            helper.invoke('selectRange', ['H2:I2']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[7].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toBeUndefined;
                done();
            });
        });
        it('Deleting non formula dependent cells with 0 as cell value', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.updateCell({ value: '0' }, 'B3');
            helper.invoke('selectRange', ['B3']);
            helper.triggerKeyNativeEvent(46);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[1].formula).toBeUndefined;
                expect(helper.getInstance().sheets[0].rows[2].cells[1].value).toBeUndefined;
                done();
            });
        });
    });

    describe('Checking defined names cases ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Adding defined names without reference by changing sheet name ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.triggerMouseAction('dblclick', null, helper.getElementFromSpreadsheet('.e-sheet-tab .e-toolbar-items'), helper.getElementFromSpreadsheet('.e-sheet-tab .e-active .e-text-wrap'));
            let editorElem: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('.e-sheet-tab .e-sheet-rename');
            setTimeout(() => {
                editorElem.click();
                editorElem.value = 'Price Details';
                helper.triggerKeyNativeEvent(13, false, false, editorElem);
                expect(spreadsheet.sheets[0].name).toBe('Price Details');
                helper.invoke('selectRange', ['A1']);
                spreadsheet.addDefinedName({ name: 'Hello' });
                expect(spreadsheet.definedNames[0].name).toBe('Hello');
                expect(spreadsheet.definedNames[0].refersTo).toBe("='Price Details'!A1");
                done();
            });
        });
    });

    describe('EJ2-819414 - Testing defined names in data binding cases->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                definedNames: [{ name: 'Profit', refersTo: '=F2:F11' }],
                sheets: [{ ranges: [{ dataSource: defaultData }] }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Verify that the scope defaults to Workbook when not explicitly set->', (done: Function) => {
            expect(helper.getInstance().definedNames.length).toBe(1);
            expect(helper.getInstance().definedNames[0].name).toBe('Profit');
            expect(helper.getInstance().definedNames[0].refersTo).toBe('=Sheet1!F2:F11');
            expect(helper.getInstance().definedNames[0].scope).toBe('Workbook');
            done();
        });
    });

    describe('CR-Issue-EJ2-870831->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] },
                {
                    rows: [
                        { cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '3' }] },
                        { cells: [{ value: '4' }] }, { cells: [{ value: '5' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: '7' }] }, { cells: [{ value: '8' }] }, { cells: [{ value: '9' }] }]
                },
                {}]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('The formula calculation is not working as expected when using the defined names that were added through the method', (done: Function) => {
            helper.getInstance().addDefinedName({ refersTo: "='Sheet1'!H2", name: "test_1", scope: "Sheet1" });
            expect(helper.getInstance().definedNames.length).toBe(1);
            setTimeout(() => {
                expect(helper.getInstance().definedNames[0].name).toBe('test_1');
                helper.getInstance().selectRange('I2');
                helper.getInstance().editModule.startEdit();
                helper.getInstance().editModule.editCellData.value = '=test_1';
                helper.getInstance().editModule.endEdit();
                const value1: string = (helper.getInstance().sheets[0].rows[1].cells[7].value).toString();
                const value2: string = (helper.getInstance().sheets[0].rows[1].cells[8].value).toString();
                expect(value1).toEqual(value2);
                helper.getInstance().activeSheetIndex = 1;
                helper.getInstance().dataBind();
                setTimeout(() => {
                    helper.getInstance().selectRange('I2');
                    helper.getInstance().editModule.startEdit();
                    helper.getInstance().editModule.editCellData.value = '=test_1';
                    helper.getInstance().editModule.endEdit();
                    expect(helper.getInstance().sheets[1].rows[1].cells[8].value).toBe('#NAME?');
                    helper.getInstance().activeSheetIndex = 0;
                    helper.getInstance().dataBind();
                });
                done();
            });
        });
        it('To check whether the defined name reference is available after sheet rename', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.triggerMouseAction('dblclick', null, helper.getElementFromSpreadsheet('.e-sheet-tab .e-toolbar-items'), helper.getElementFromSpreadsheet('.e-sheet-tab .e-active .e-text-wrap'));
            let editorElem: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('.e-sheet-tab .e-sheet-rename');
            editorElem.click();
            editorElem.value = 'Hello';
            helper.triggerKeyNativeEvent(13, false, false, editorElem);
            setTimeout(() => {
                expect(spreadsheet.definedNames[0].refersTo).toBe("='Hello'!H2");
                expect(spreadsheet.definedNames[0].scope).toBe("Hello");
                helper.getInstance().selectRange('K2');
                helper.getInstance().editModule.startEdit();
                helper.getInstance().editModule.editCellData.value = '=test_1';
                helper.getInstance().editModule.endEdit();
                expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe("10");
                done();
            });
        });
        it('Deletion of defined Names through public method', (done: Function) => {
            helper.invoke('delete', [0]);
            expect(helper.getInstance().definedNames.length).toBe(0);
            setTimeout(() => {
                helper.getInstance().selectRange('J2');
                helper.getInstance().editModule.startEdit();
                helper.getInstance().editModule.editCellData.value = '=test_1';
                helper.getInstance().editModule.endEdit();
                expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('#NAME?');
                done();
            });
        });
    });

    describe('EJ2-1020926: User Defined Function Arguments Are Being Auto Detected as Dates ->', () => {
        beforeEach((done: Function) => {
            const customFunc = (value: string): string => { return value; };
            helper.initializeSpreadsheet(
                {
                    sheets: [{
                        name: 'TestSheet',
                        rows: [
                            { cells: [{ formula: '=MYFUNC("FY-2024")' }] },
                            { cells: [{ formula: '=MYFUNC("TRUE")' }] },
                            { cells: [{ formula: '=MYFUNC("5:30")' }] },
                            { cells: [{ formula: '=MYFUNC("10-3-2025")' }] },
                            { cells: [{ formula: '=MYFUNC(10-3-2025)' }] },
                        ]
                    }],
                    beforeDataBound: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        spreadsheet.addCustomFunction(customFunc, 'MYFUNC');
                    }
                }, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('Custom function should preserve quoted string arguments and not auto-convert to date', (done: Function) => {
            expect(helper.invoke('getCell', [0, 0]).textContent).toBe('"FY-2024"');
            expect(helper.invoke('getCell', [1, 0]).textContent).toBe('"TRUE"');
            expect(helper.invoke('getCell', [2, 0]).textContent).toBe('"5:30"');
            expect(helper.invoke('getCell', [3, 0]).textContent).toBe('45933');
            expect(helper.invoke('getCell', [4, 0]).textContent).toBe('-2018');
            done();
        });
    });

    describe('EJ2-1021478: Issue with Formula entry behavior->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Typed leading - in editor is stored as =- on complete edit ', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '-SUM(D2:F9)';
            helper.getElement('.e-spreadsheet-edit').textContent = '-SUM(D2:F9)';
            helper.getInstance().editModule.endEdit();
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[0].cells[9].formula).toBe('=-SUM(D2:F9)');
                expect(spreadsheet.sheets[0].rows[0].cells[9].value).toBe('-3331');
                done();
            });
        });
        it('Typed leading + in editor is stored as =+ on complete edit', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '+SUM(D2:D9)';
            helper.getElement('.e-spreadsheet-edit').textContent = '+SUM(D2:D9)';
            helper.getInstance().editModule.endEdit();
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toBe('=+SUM(D2:D9)');
                expect(spreadsheet.sheets[0].rows[0].cells[9].value).toBe(186);
                done();
            });
        });
        it('Checking the - and + formula with all data type', (done: Function) => {
            helper.edit('J1', '+A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toBe('=+A1');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('Item Name');
            helper.edit('K1', '-A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[10].formula).toBe('=-A1');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            helper.edit('J3', '+B3');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=+B3');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('6/11/2014');
            helper.edit('K3', '-B3');
            expect(helper.getInstance().sheets[0].rows[2].cells[10].formula).toBe('=-B3');
            expect(helper.invoke('getCell', [2, 10]).textContent).toContain('#');
            helper.edit('J4', '+C4');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toBe('=+C4');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('3:32:44 AM');
            helper.edit('K4', '-C4');
            expect(helper.getInstance().sheets[0].rows[3].cells[10].formula).toBe('=-C4');
            expect(helper.invoke('getCell', [3, 10]).textContent).toContain('#');
            helper.edit('J5', '+D5');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toBe('=+D5');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('15');
            helper.edit('K5', '-D5');
            expect(helper.getInstance().sheets[0].rows[4].cells[10].formula).toBe('=-D5');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('-15');
            helper.edit('J6', '+TRUE');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toBe('=+TRUE');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('TRUE');
            helper.edit('K6', '-TRUE');
            expect(helper.getInstance().sheets[0].rows[5].cells[10].formula).toBe('=-TRUE');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('-1');
            helper.edit('K16', '-$100');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('-$100');
            helper.edit('K17', '-12/3/2026');
            expect(helper.getInstance().sheets[0].rows[16].cells[10].formula).toBe('=-12/3/2026');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('-0.001974334');
            helper.edit('K6', '+5:30');
            expect(helper.getInstance().sheets[0].rows[5].cells[10].formula).toBe('=+5:30');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            helper.edit('K6', '--');
            expect(helper.getInstance().sheets[0].rows[5].cells[10].formula).toBe('=--');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('');
            done();
        });
    });

    describe('EJ2-66087,EJ2-66341,EJ2-66984, EJ2-976935 -> ', () => {
        beforeEach((done: Function) => {
            const addSum = (sourceValue: any, destinationValue: any) => {
                let data = sourceValue + destinationValue;
                return data;
            };
            const cusFunc = (sourceValue: any, destinationValue: any) => {
                let data = sourceValue + destinationValue;
                return data;
            };
            const customFunction = (firstCell: string, secondCell: string) => {
                let meanValue = (Number(firstCell) + Number(secondCell)) / 2;
                return meanValue;
            };
            const customFunction1 = (firstCell: string, secondCell: string) => {
                let meanValue = (Number(firstCell) + Number(secondCell)) / 2;
                return meanValue;
            };
            helper.initializeSpreadsheet({
                sheets: [
                    {
                        name: 'Monthly Budget',
                        rows: [{ cells: [{ value: '1' }, { value: '2' }, { value: '', formula: '=ADDSUM(A1,B1)' }, { value: '', formula: '=CUSFUNC(B1,A1)' }] },
                        { cells: [{ value: '2' }, { value: '3' }, { value: '', formula: '=ADDSUM(A2,B2)' }, { value: '', formula: '=CUSFUNC(B2,A2)' }] },
                        { cells: [{ value: '4' }, { value: '5' }, { value: '', formula: '=ADDSUM(A3,B3)' }, { value: '', formula: '=CUSFUNC(B3,A3)' }] },
                        { cells: [{ value: '5' }, { value: '5' }, { value: '', formula: '=ADDSUM(A4,B4)' }, { value: '', formula: '=CUSFUNC(B4,A4)' }] },
                        { cells: [{ value: '5' }, { value: '6' }, { value: '', formula: '=ADDSUM(A5,B5)' }, { value: '', formula: '=CUSFUNC(B5,A5)' }] },
                        { cells: [{ value: '10' }, { value: '20' }, { value: '', formula: '=STDEV.S(A6,B6)' }] },
                        { cells: [{ value: '10' }, { value: '20' }, { value: '', formula: '=STDEV.C(A7,B7)' }] },
                        { cells: [{ value: '10' }, { value: '20' }, { value: '', formula: '=STDEV.A(A8,B8)' }, { value: '', formula: '=SUM(STDEV.S(A6,B6),STDEV.S(A5,B5))' }] }
                        ],
                        columns: [
                            { width: 110 }, { width: 115 }, { width: 110 }, { width: 100 }
                        ]
                    }
                ],
                beforeDataBound: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.addCustomFunction(addSum, 'ADDSUM');
                    spreadsheet.addCustomFunction(cusFunc, 'CUSFUNC');
                    spreadsheet.addCustomFunction(customFunction, 'STDEV.S');
                    spreadsheet.addCustomFunction(customFunction1, 'STDEV.C');
                }
            },
                done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('Custom function calculated values are not updated properly in cell data binding', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[0].cells[2].formula).toEqual('=ADDSUM(A1,B1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toEqual("12");
            expect(helper.getInstance().sheets[0].rows[1].cells[2].formula).toEqual('=ADDSUM(A2,B2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[2].value).toEqual("23");
            expect(helper.getInstance().sheets[0].rows[2].cells[2].formula).toEqual('=ADDSUM(A3,B3)');
            expect(helper.getInstance().sheets[0].rows[2].cells[2].value).toEqual("45");
            expect(helper.getInstance().sheets[0].rows[3].cells[2].formula).toEqual('=ADDSUM(A4,B4)');
            expect(helper.getInstance().sheets[0].rows[3].cells[2].value).toEqual("55");
            expect(helper.getInstance().sheets[0].rows[4].cells[2].formula).toEqual('=ADDSUM(A5,B5)');
            expect(helper.getInstance().sheets[0].rows[4].cells[2].value).toEqual("56");
            done();
        });
        it('Nested IF formula which contains Index formula returns wrong value', (done: Function) => {
            helper.edit('A1', 'test');
            helper.edit('B1', '=IF(INDEX(A1:A2,1,1)="TEST",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[0].cells[1].formula).toEqual('=IF(INDEX(A1:A2,1,1)="TEST",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toEqual("TRUE");
            helper.edit('B1', '=IF(IF(A1="TEST","TEST","SET")=A1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[0].cells[1].formula).toEqual('=IF(IF(A1="TEST","TEST","SET")=A1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toEqual("TRUE");
            helper.edit('A2', '2');
            helper.edit('B2', '=IF(INDEX(A1:A2,2,1)=2,1,2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[1].formula).toEqual('=IF(INDEX(A1:A2,2,1)=2,1,2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[1].value).toEqual("1");
            helper.edit('B2', '=IF(INDEX(A1:A2,2,1)=A2,1,2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[1].formula).toEqual('=IF(INDEX(A1:A2,2,1)=A2,1,2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[1].value).toEqual("1");
            helper.edit('A3', '5');
            helper.edit('B3', '=IF(IF(A3=5,"test","set")="test",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[2].cells[1].formula).toEqual('=IF(IF(A3=5,"test","set")="test",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[2].cells[1].value).toEqual("TRUE");
            helper.edit('A4', 'tests');
            helper.edit('B4', '=IF(IF(A4="test","test","set")="test",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[3].cells[1].formula).toEqual('=IF(IF(A4="test","test","set")="test",TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[3].cells[1].value).toEqual("FALSE");
            done();
        });
        it('Calling refresh() removes custom functions reference from spreadsheet', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.refresh();
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[2].formula).toEqual('=ADDSUM(A1,B1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toEqual("12");
                expect(helper.getInstance().sheets[0].rows[0].cells[3].formula).toEqual('=CUSFUNC(B1,A1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toEqual("21");
                expect(helper.getInstance().sheets[0].rows[1].cells[2].formula).toEqual('=ADDSUM(A2,B2)');
                expect(helper.getInstance().sheets[0].rows[1].cells[2].value).toEqual("23");
                expect(helper.getInstance().sheets[0].rows[1].cells[3].formula).toEqual('=CUSFUNC(B2,A2)');
                expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toEqual("32");
                expect(helper.getInstance().sheets[0].rows[2].cells[2].formula).toEqual('=ADDSUM(A3,B3)');
                expect(helper.getInstance().sheets[0].rows[2].cells[2].value).toEqual("45");
                expect(helper.getInstance().sheets[0].rows[2].cells[3].formula).toEqual('=CUSFUNC(B3,A3)');
                expect(helper.getInstance().sheets[0].rows[2].cells[3].value).toEqual("54");
                expect(helper.getInstance().sheets[0].rows[3].cells[2].formula).toEqual('=ADDSUM(A4,B4)');
                expect(helper.getInstance().sheets[0].rows[3].cells[2].value).toEqual("55");
                expect(helper.getInstance().sheets[0].rows[3].cells[3].formula).toEqual('=CUSFUNC(B4,A4)');
                expect(helper.getInstance().sheets[0].rows[3].cells[3].value).toEqual("55");
                expect(helper.getInstance().sheets[0].rows[4].cells[2].formula).toEqual('=ADDSUM(A5,B5)');
                expect(helper.getInstance().sheets[0].rows[4].cells[2].value).toEqual("56");
                expect(helper.getInstance().sheets[0].rows[4].cells[3].formula).toEqual('=CUSFUNC(B5,A5)');
                expect(helper.getInstance().sheets[0].rows[4].cells[3].value).toEqual("65");
                done();
            });
        });
        it('should correctly calculate the custom STDEV.S formula', (done: Function) => {
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[5].cells[2].formula).toEqual('=STDEV.S(A6,B6)');
                expect(helper.getInstance().sheets[0].rows[5].cells[2].value).toEqual(15);
                expect(helper.getInstance().sheets[0].rows[6].cells[2].formula).toEqual('=STDEV.C(A7,B7)');
                expect(helper.getInstance().sheets[0].rows[6].cells[2].value).toEqual("#NAME?");
                expect(helper.getInstance().sheets[0].rows[7].cells[2].formula).toEqual('=STDEV.A(A8,B8)');
                expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toEqual("#NAME?");
                expect(helper.getInstance().sheets[0].rows[7].cells[3].formula).toEqual('=SUM(STDEV.S(A6,B6),STDEV.S(A5,B5))');
                expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual('20.5');
                done();
            });
        });
    });

    describe('I488682 - Checking boolean value with arithmetic operations ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Boolean value with multiplication ', (done: Function) => {
            helper.edit('I1', 'TRUE');
            helper.edit('I2', 'FALSE');
            helper.edit('I3', '2');
            helper.edit('I4', '4');
            helper.edit('I5', '=I1*I2');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('0');
            helper.edit('I6', '=I3*I2');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('0');
            helper.edit('I7', '=I1*I4');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('4');
            helper.edit('I8', '=3*TRUE');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('3');
            done();
        });

        it('Boolean value with subtraction', (done: Function) => {
            helper.edit('I9', '=I1-I2');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('1');
            helper.edit('I10', '=I3-I2');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('2');
            helper.edit('I11', '=I1-I4');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('-3');
            helper.edit('I12', '=3-TRUE');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('2');
            done();
        });

        it('Boolean value with addition', (done: Function) => {
            helper.edit('I13', '=I1+I2;');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('1');
            helper.edit('I14', '=I3+I2');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('2');
            helper.edit('J1', '=I1+I4');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('5');
            helper.edit('J2', '=3+TRUE');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('4');
            done();
        });

        it('Boolean value with division', (done: Function) => {
            helper.edit('J3', '=I1/I2;');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J4', '=I3/I2');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J5', '=I1/I4');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0.25');
            helper.edit('J6', '=3/TRUE');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('3');
            done();
        });
        it('Arithmetic operation with percentage value', (done: Function) => {
            helper.edit('D12', '=-(D3*(100%-D2))');
            const tdEle: Element = helper.invoke('getCell', [11, 3]);
            expect(tdEle.textContent).toBe('180');
            const cell: CellModel = helper.getInstance().sheets[0].rows[11].cells[3];
            expect(cell.value).toBe('180');
            helper.edit('D12', '=-((100-D2)*D3)');
            expect(cell.value).toBe('-1800');
            expect(tdEle.textContent).toBe('-1800');
            helper.edit('D12', '=-((100%-D2)*D3)');
            expect(cell.value).toBe('180');
            expect(tdEle.textContent).toBe('180');
            helper.edit('D12', '=-((100%*D3))');
            expect(cell.value).toBe('-20');
            expect(tdEle.textContent).toBe('-20');
            helper.edit('D12', '=-(2+(100%*D4))');
            expect(cell.value).toBe('-22');
            expect(tdEle.textContent).toBe('-22');
            done();
        });
        it('I864921 -> Throws error while performing arithmetic operation with percentage formatted value', (done: Function) => {
            helper.edit('J7', '=5.68899%+1.457288%');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.07146278');
            helper.edit('J8', '=(5.68899%)+1.457288%');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0.07146278');
            helper.edit('J9', '=(5.68899%)+(1.457288%)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0.07146278');
            done();
        });
    });

    describe('EJ2-921559 -> Incorrect expression results when comparing negative values precedes with operators->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Checking expression with negative sign and comparison operator with cell references as alphabets', (done: Function) => {
            helper.edit('I1', '=A1>-1');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toBe('TRUE');
            helper.edit('I2', '=A1<-1');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toBe('FALSE');
            helper.edit('I3', '=A1>=-1');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toBe('TRUE');
            helper.edit('I4', '=A1<=-1');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].value).toBe('FALSE');
            helper.edit('I5', '=A1<>-1');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].value).toBe('TRUE');
            helper.edit('I6', '=A1<>1');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].value).toBe('TRUE');
            done();
        });
        it('Checking expression with negative sign and comparison operator with cell references as number', (done: Function) => {
            helper.edit('H2', '-1');
            helper.edit('J1', '=H2>-1');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].value).toBe('FALSE');
            helper.edit('J2', '=H2<-1');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('FALSE');
            helper.edit('J3', '=H2>=-1');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('TRUE');
            helper.edit('J4', '=H2<=-1');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].value).toBe('TRUE');
            helper.edit('J5', '=H2<>-1');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].value).toBe('FALSE');
            helper.edit('J6', '=H2<>1');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].value).toBe('TRUE');
            done();
        });
        it('Checking expression with negative sign with cell references', (done: Function) => {
            helper.edit('J7', '=A2>-H2');
            expect(helper.getInstance().sheets[0].rows[6].cells[9].value).toBe('TRUE');
            helper.edit('J8', '=A2>H2');
            expect(helper.getInstance().sheets[0].rows[7].cells[9].value).toBe('TRUE');
            helper.edit('J9', '=A2<-H2');
            expect(helper.getInstance().sheets[0].rows[8].cells[9].value).toBe('FALSE');
            helper.edit('J10', '=A2<H2');
            expect(helper.getInstance().sheets[0].rows[9].cells[9].value).toBe('FALSE');
            done();
        });
    });

    describe('EJ2-865555 - Formula with logical operators and Arithmatic operator throws #DIV/0! error ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: '0' }] }, { cells: [{ index: 8, value: '1' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Nested IF formula with logical operators throws #DIV/0! error', (done: Function) => {
            helper.edit('J1', '=IF(H2=0,0,IF(OR(D2=10,D3=20),IF(F2>SUM(E2:E5)/E10,10,20),IF(1=1,H3*(I2/I1),SUM(G2:G5))))');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('10');
            helper.edit('J2', '=IF(1=1,H3*(I2/I1),SUM(G2:G5))');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J3', '=IF(F2>SUM(E2:E5)/E10,10,20)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('10');
            helper.edit('J4', '=IF(F2>SUM(E2:E5)/E10,SUM(D2/A2),20)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('Checking Logical operators with #DIV/0 error', (done: Function) => {
            helper.edit('J5', '=H3*(I2/I1)=D2');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J6', '=H3*(I2/I1)<>D2');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J7', '=H3*(I2/I1)<=D2');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J8', '=H3*(I2/I1)>=D2');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J9', '=H3*(I2/I1)<D2');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J10', '=H3*(I2/I1)>D2');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('#DIV/0!');
            done();
        });
        it('Checking Arithmatic operators with #DIV/0 error', (done: Function) => {
            helper.edit('J11', '=H3*(I2/I1)+G2');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J12', '=H3*(I2*I1)+G2');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('1');
            helper.edit('J13', '=H3*(I2+I1)+G2');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('51');
            helper.edit('J14', '=H3*(I2-I1)+G2');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('51');
            helper.edit('J15', '=H3/(I2/I1)+G2');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J16', '=H3+(I2/I1)+G2');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J17', '=H3-(I2/I1)+G2');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J18', '=H3*(I2/I1)*G2');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('#DIV/0!');
            done();
        });
        it('Checking Logical operators with #VALUE! error', (done: Function) => {
            helper.edit('K1', '=H3*(A3/I1)=D2');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            helper.edit('K2', '=H3*(A3/I1)<>D2');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            helper.edit('K3', '=H3*(A3/I1)<=D2');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#VALUE!');
            helper.edit('K4', '=H3*(A3/I1)>=D2');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#VALUE!');
            helper.edit('K5', '=H3*(A3/I1)<D2');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#VALUE!');
            helper.edit('K6', '=H3*(A3/I1)>D2');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('Checking Arithmatic operators with #VALUE! error', (done: Function) => {
            helper.edit('K7', '=H3*(A3/I1)+G2');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            helper.edit('K8', '=H3*(A3*I1)+G2');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#VALUE!');
            helper.edit('K9', '=H3*(A3+I1)+G2');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#VALUE!');
            helper.edit('K10', '=H3*(A3-I1)+G2');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#VALUE!');
            helper.edit('K11', '=H3/(A3/I1)+G2');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#VALUE!');
            helper.edit('K12', '=H3+(A3/I1)+G2');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('#VALUE!');
            helper.edit('K13', '=H3-(A3/I1)+G2');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#VALUE!');
            helper.edit('K14', '=H3*(A3/I1)*G2');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('Checking & and ^ operators with Error Values', (done: Function) => {
            helper.edit('K15', '=H3&(I2/I1)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K16', '=H3&(A3/I1)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K17', '=H3^(I2/I1)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K18', '=H3^(A3/I1)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#VALUE!');
            done();
        });
    });

    describe('EJ2-42389, EJ2-49476, EJ2-49549->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ rows: [{ cells: [{ value: '4' }] }, { cells: [{ value: '5' }] }, { cells: [{}] }, { cells: [{ value: '10' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '30' }] }] },
                {
                    rows: [{ cells: [{ index: 1, value: '4' }, { index: 3, value: '1' }, { value: '3' }] }, { cells: [{ index: 1, value: '5' }, { index: 3, value: '2' }, { value: '2' }] },
                    { cells: [{ index: 3, value: '3' }, { value: '1' }] }, { cells: [{ value: '20' }, { index: 3, value: '2' }, { value: '5' }] }, { cells: [{ value: '202' }, { index: 3, value: '1' }, { value: '1' }] },
                    { cells: [{ value: '202' }, { index: 3, value: '5' }, { value: '8' }] }]
                },
                { rows: [{ cells: [{ formula: '=(sheet1!a2*sheet2!b2)+(sheet1!a1/sheet2!b1)' }] }] }], activeSheetIndex: 2
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EJ2-42389 - Cross tab formula issue', (done: Function) => {
            expect(helper.getInstance().sheets[2].rows[0].cells[0].formula).toBe('=(sheet1!a2*sheet2!b2)+(sheet1!a1/sheet2!b1)');
            expect(helper.getInstance().sheets[2].rows[0].cells[0].value).toBe('26');
            helper.invoke('updateCell', [{ value: '25' }, 'Z25']);
            helper.invoke('updateCell', [{ formula: '=sum(a1:a4)+sheet3!z25' }, 'B1']);
            expect(helper.getInstance().sheets[2].rows[0].cells[1].formula).toBe('=sum(a1:a4)+sheet3!z25');
            expect(helper.getInstance().sheets[2].rows[0].cells[1].value).toBe('51');
            helper.invoke('updateCell', [{ value: '25' }, 'B2']);
            helper.invoke('updateCell', [{ formula: '=(b2*25%)+(sheet3!Z25*1.125)' }, 'C1']);
            expect(helper.getInstance().sheets[2].rows[0].cells[2].formula).toBe('=(b2*25%)+(sheet3!Z25*1.125)');
            expect(helper.getInstance().sheets[2].rows[0].cells[2].value).toBe('34.375');
            done();
        });
        it('EJ2-49476 - improve the UI level formula enhancements for cross tab formula support in spraedsheet', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=B5+Sheet1!A5+Sheet1!A6+Sheet2!A5' }, 'A5']);
            expect(helper.getInstance().sheets[2].rows[4].cells[0].formula).toBe('=B5+Sheet1!A5+Sheet1!A6+Sheet2!A5');
            expect(helper.getInstance().sheets[2].rows[4].cells[0].value).toBe('252');
            helper.invoke('updateCell', [{ value: '444' }, 'B6']);
            helper.invoke('updateCell', [{ formula: '=B6+Sheet1!A5+Sheet1!A6' }, 'A6']);
            expect(helper.getInstance().sheets[2].rows[5].cells[0].formula).toBe('=B6+Sheet1!A5+Sheet1!A6');
            expect(helper.getInstance().sheets[2].rows[5].cells[0].value).toBe('494');
            helper.invoke('updateCell', [{ formula: '=B6+Sheet1!A5+Sheet2!A5' }, 'A7']);
            expect(helper.getInstance().sheets[2].rows[6].cells[0].formula).toBe('=B6+Sheet1!A5+Sheet2!A5');
            expect(helper.getInstance().sheets[2].rows[6].cells[0].value).toBe('666');
            helper.invoke('updateCell', [{ formula: '=(B6+Sheet1!A5)' }, 'A8']);
            expect(helper.getInstance().sheets[2].rows[7].cells[0].formula).toBe('=(B6+Sheet1!A5)');
            expect(helper.getInstance().sheets[2].rows[7].cells[0].value).toBe('464');
            helper.invoke('updateCell', [{ formula: '=(Sheet1!A5+B6)' }, 'A9']);
            expect(helper.getInstance().sheets[2].rows[8].cells[0].formula).toBe('=(Sheet1!A5+B6)');
            expect(helper.getInstance().sheets[2].rows[8].cells[0].value).toBe('464');
            helper.invoke('updateCell', [{ formula: '=(Sheet1!A5+B6)' }, 'A10']);
            expect(helper.getInstance().sheets[2].rows[9].cells[0].formula).toBe('=(Sheet1!A5+B6)');
            expect(helper.getInstance().sheets[2].rows[9].cells[0].value).toBe('464');
            helper.invoke('updateCell', [{ formula: '=Sheet2!A5+A5' }, 'A11']);
            expect(helper.getInstance().sheets[2].rows[10].cells[0].formula).toBe('=Sheet2!A5+A5');
            expect(helper.getInstance().sheets[2].rows[10].cells[0].value).toBe('454');
            helper.invoke('updateCell', [{ formula: '=Sheet1!A5+B6' }, 'A12']);
            expect(helper.getInstance().sheets[2].rows[11].cells[0].formula).toBe('=Sheet1!A5+B6');
            expect(helper.getInstance().sheets[2].rows[11].cells[0].value).toBe('464');
            done();
        });
        it('EJ2-49549 - Deleting a whole row on sheet that references other sheets changes values to #REF!-Issue 1', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=IF(SUMIF(Sheet2!$D1:$D6,">3",Sheet2!$E1:$E6)>3,1)' }, 'A14']);
            helper.invoke('updateCell', [{ formula: '=SUM(Sheet2!D1:E1)' }, 'C14']);
            helper.invoke('updateCell', [{ formula: '=IF(Sheet2!D1>0,1,0)' }, 'D14']);
            helper.invoke('updateCell', [{ value: '5' }, 'D15']);
            expect(helper.getInstance().sheets[2].rows[14].cells[3].value).toBe(5);
            helper.invoke('delete', [14, 14, 'Row']);
            setTimeout(function () {
                expect(helper.getInstance().sheets[2].rows[13].cells[0].value).toBe('1');
                expect(helper.getInstance().sheets[2].rows[13].cells[2].value).toBe(4);
                expect(helper.getInstance().sheets[2].rows[13].cells[3].value).toBe('1');
                done();
            });
        });
        it('DAYS formula returns NAN value for string formatted date value', (done: Function) => {
            helper.edit('F1', '=DAYS("7/24/1969", "7/16/1969")');
            const cellEle: HTMLElement = helper.invoke('getCell', [0, 5]);
            const cell: any = helper.getInstance().getActiveSheet().rows[0].cells[5];
            expect(cell.value).toBe(8);
            expect(cellEle.textContent).toBe('8');
            helper.edit('E1', '7/24/1969');
            helper.edit('E2', '7/16/1969');
            helper.edit('F1', '=DAYS(E1,E2)');
            expect(cell.value).toBe(8);
            expect(cellEle.textContent).toBe('8');
            helper.edit('F1', '=DAYS(8, 4)');
            expect(cell.value).toBe(4);
            expect(cellEle.textContent).toBe('4');
            helper.edit('F1', '=DAYS("18", "4")');
            expect(cell.value).toBe(14);
            expect(cellEle.textContent).toBe('14');
            helper.edit('F1', '=DAYS("2-june-2016","2-may-2016")');
            expect(cell.value).toBe(31);
            expect(cellEle.textContent).toBe('31');
            helper.edit('F1', '=DAYS("October 22","October 12")');
            expect(cell.value).toBe(10);
            expect(cellEle.textContent).toBe('10');
            helper.edit('F1', '=DAYS("October 22, 2016","October 12, 2016")');
            expect(cell.value).toBe(10);
            expect(cellEle.textContent).toBe('10');
            helper.edit('F1', '=DAYS("November 2020", "October 2020")');
            expect(cell.value).toBe(31);
            expect(cellEle.textContent).toBe('31');
            done();
        });
        it('DAY formula returns NAN value for integer formatted date value', (done: Function) => {
            helper.edit('F1', '=DAY("7/24/1969")');
            const cellEle: HTMLElement = helper.invoke('getCell', [0, 5]);
            const cell: any = helper.getInstance().getActiveSheet().rows[0].cells[5];
            expect(cell.value).toBe(24);
            expect(cellEle.textContent).toBe('24');
            helper.edit('E1', '7/24/1969');
            helper.edit('F1', '=DAY(E1)');
            expect(cell.value).toBe(24);
            expect(cellEle.textContent).toBe('24');
            helper.edit('F1', '=DAY(4)');
            expect(cell.value).toBe(4);
            expect(cellEle.textContent).toBe('4');
            helper.edit('F1', '=DAY("18")');
            expect(cell.value).toBe(18);
            expect(cellEle.textContent).toBe('18');
            helper.edit('F1', '=DAY("2-june-2016")');
            expect(cell.value).toBe(2);
            expect(cellEle.textContent).toBe('2');
            helper.edit('F1', '=DAY("October 22")');
            expect(cell.value).toBe(22);
            expect(cellEle.textContent).toBe('22');
            helper.edit('F1', '=DAY("October 22, 2016")');
            expect(cell.value).toBe(22);
            expect(cellEle.textContent).toBe('22');
            helper.edit('F1', '=DAY("November 2020")');
            expect(cell.value).toBe(1);
            expect(cellEle.textContent).toBe('1');
            done();
        });
    });

    describe('I296802, F162534 ->', () => {
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [{ cells: [{ index: 3, value: '100' }, { value: '50' }, { formula: '=D1+E1' }] }],
                    selectedRange: 'D1:D1'
                }]
            }, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('formula dependency not updated issue', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[0].cells[5].value).toEqual('150');
            helper.invoke('insertColumn', [4]);
            setTimeout((): void => {
                expect(spreadsheet.sheets[0].rows[0].cells[6].formula).toEqual('=D1+F1');
                expect(spreadsheet.sheets[0].rows[0].cells[6].value).toEqual('150');
                helper.edit('F1', '100');
                expect(spreadsheet.sheets[0].rows[0].cells[6].value).toEqual('200');
                expect(helper.invoke('getCell', [0, 6]).textContent).toEqual('200');
                setTimeout((): void => {
                    done();
                }, 10);
            });
        });
    });

    describe('I305406, I280608, I296710, I257045, I274819, I282974, I288646 ->', () => {
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet({}, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        // it('Formula selection support while editing the formula range, Highlight reference selection in formula and formula reference selection issue', (done: Function) => {
        // const spreadsheet: Spreadsheet = helper.getInstance();
        // helper.invoke('startEdit');
        // setTimeout((): void => {
        // const editor: HTMLElement = helper.getElement('#' +helper.id + '_edit');
        // spreadsheet.notify('editOperation', { action: 'refreshEditor', value: '=SUM(', refreshCurPos: true, refreshEditorElem: true });
        // let cell: HTMLElement = helper.invoke('getCell', [0, 1]);
        // helper.triggerMouseAction(
        // 'mousedown', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 }, null,
        // cell);
        // helper.triggerMouseAction(
        // 'mouseup', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 }, document,
        // cell);
        // setTimeout((): void => {
        // expect(editor.textContent).toEqual('=SUM(B1');
        // spreadsheet.notify('editOperation', { action: 'refreshEditor', value: '=SUM(A3', refreshCurPos: true, refreshEditorElem: true });
        //  helper.triggerKeyEvent('keydown', 51, null, null, null, editor);
        // helper.triggerKeyEvent('keyup', 51, null, null, null, editor);
        // cell = helper.invoke('getCell', [2, 0]);
        // expect(cell.classList).toContain('e-formularef-selection');
        // expect(cell.classList).toContain('e-vborderright');
        // expect(cell.classList).toContain('e-vborderbottom');
        // done();
        // },30);
        // },30);
        // });
    });

    describe('I293654, I296802, I307653, I264424, I298789, I300031 ->', () => {
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    name: 'Cover', rows: [{
                        index: 5, height: 30, cells: [{
                            colSpan: 8, formula: '=Lookup!B1', style:
                                { fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }
                        }]
                    }, {
                        index: 7, cells: [{
                            colSpan: 6, value:
                                'Company No.12345678'
                        }]
                    }, {
                        cells: [{
                            colSpan: 4, formula: '=IF(Lookup!B3="ABRIDGED",IF(IF(Lookup!B4="",FALSE,TRUE),"Directors'
                                + "'" + '","Director' + "'" + 's")&" Report and "&IF(Lookup!B5="Audited","Audited","Unaudited")&" Abridged Accounts",IF(IF(Lookup!B4="",FALSE,TRUE),"Directors'
                                + "'" + '","Director' + "'" + 's")&" Report and "&IF(Lookup!B5="Audited","Audited","Unaudited")&" Accounts")'
                        }]
                    }, {
                        cells: [{
                            formula:
                                '=TEXT(Lookup!B6,"dd MMMM yyyy")'
                        }, { index: 3, value: '37087.58' }, { value: '38767.36' }, {
                            wrap: true, formula:
                                '=IF(OR(AND(ABS(D10)>ABS(E10),D10<0),AND(ABS(D10)<=ABS(E10),E10<0)),-1*(IF(D10=0,((ABS(E10)-ABS(D10))/1)*100,((ABS(E10)-ABS(D10))/ABS(D10))*100)),IF(D10=0,((ABS(E10)-ABS(D10))/1)*100,((ABS(E10)-ABS(D10))/ABS(D10))*100))'
                        }]
                    }, { cells: [{ formula: '=1-0/0' }] }, { cells: [{ formula: '=(10-3)/1' }] }]
                }, {
                    name: 'Lookup', rows: [{
                        cells: [{ value: 'CLIENTNAME' },
                        { value: 'Example Limited Company' }]
                    }, { cells: [{ value: 'REGISTRATIONNUMBER' }, { value: '12345678' }] }, { cells: [{ value: 'ACCOUNT' }] }, {
                        cells: [{ value: 'DIRECTOR2' },
                        { value: 'abc' }]
                    }, { cells: [{ value: 'AUDITED' }, { value: 'Audited' }] }, { cells: [{ value: 'PERIODEND' }, { value: '9/1/2019' }] }]
                }]
            }, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('Opening the attached pre formatted excel file it is giving errors in the last two rows though the formula is correct and date format is also correct', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[5].cells[0].value).toBe('Example Limited Company');
            expect(helper.invoke('getCell', [5, 0]).textContent).toBe('Example Limited Company');
            expect(spreadsheet.sheets[0].rows[8].cells[0].value).toBe("Directors' Report and Audited Accounts");
            expect(helper.invoke('getCell', [8, 0]).textContent).toBe("Directors' Report and Audited Accounts");
            expect(spreadsheet.sheets[0].rows[9].cells[0].value).toBe('September 1, 2019');
            expect(helper.invoke('getCell', [9, 0]).textContent).toBe('September 1, 2019');
            expect(spreadsheet.sheets[0].rows[9].cells[5].value).toBe('4.529225147610062');
            expect(helper.invoke('getCell', [9, 5]).textContent).toBe('4.529225148');
            expect(spreadsheet.sheets[0].rows[10].cells[0].value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [10, 0]).textContent).toBe('#DIV/0!');
            expect(spreadsheet.sheets[0].rows[11].cells[0].value).toBe('7');
            expect(helper.invoke('getCell', [11, 0]).textContent).toBe('7');
            done();
        });
    });

    describe('Base module cases - II->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Formula with #DIV/0! as formula->', (done: Function) => {
            helper.edit('I1', '=#DIV/0!');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toEqual('=#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toEqual('#DIV/0!');
            done();
        });
        it('Formula with #NAME? as formula->', (done: Function) => {
            helper.edit('I2', '=#NAME?');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#NAME?');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toEqual('=#NAME?');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toEqual('#NAME?');
            done();
        });
        it('Formula with - as formula->', (done: Function) => {
            helper.edit('I3', '=-');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].formula).toEqual('=-');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toEqual('');
            done();
        });
        it('Formula with value inside in []->', (done: Function) => {
            helper.edit('I4', '=[1+5+3]');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('9');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].formula).toEqual('=[1+5+3]');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].value).toEqual('9');
            done();
        });
        it('Formula with value inside in [] for defined name reference->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Test', refersTo: 'H2:H5' });
            helper.edit('I5', '=SUM([Test])');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('154');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].formula).toEqual('=SUM([Test])');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].value).toEqual(154);
            done();
        });
        it('Formula with #N/A as formula->', (done: Function) => {
            helper.edit('I6', '=#N/A');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].formula).toEqual('=#N/A');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].value).toEqual('invalid expression');
            done();
        });
        it('Formula with []  and {} ->', (done: Function) => {
            helper.edit('I7', '=SUM([{1+5}])');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('6');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].formula).toEqual('=SUM([{1+5}])');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].value).toEqual(6);
            done();
        });
    });

    describe('EJ2-844325 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [
                        { cells: [{ value: '5' }, { index: 2, formula: '=A2++A1' }, { formula: '=A2--A1' }, { formula: '=A2**A1' }, { formula: '=A2//A1' }, { formula: '=A2^^A1' }, { formula: '=A2&&A1' }] },
                        { cells: [{ value: '3' }, { index: 2, formula: '=A2+-A1' }, { formula: '=A2-+A1' }, { formula: '=A2*/A1' }, { formula: '=A2/*A1' }, { formula: '=A2^+A1' }, { formula: '=A2&+A1' }] },
                        { cells: [{ index: 2, formula: '=A2+*A1' }, { formula: '=A2-*A1' }, { formula: '=A2*+A1' }, { formula: '=A2/+A1' }, { formula: '=A2^-A1' }, { formula: '=A2&-A1' }] },
                        { cells: [{ index: 2, formula: '=A2+/A1' }, { formula: '=A2-/A1' }, { formula: '=A2*-A1' }, { formula: '=A2/-A1' }, { formula: '=A2^*A1' }, { formula: '=A2&*A1' }] },
                        { cells: [{ index: 2, formula: '=A2+^A1' }, { formula: '=A2-^A1' }, { formula: '=A2*^A1' }, { formula: '=A2/^A1' }, { formula: '=A2^/A1' }, { formula: '=A2&/A1' }] },
                        { cells: [{ index: 2, formula: '=A2+&A1' }, { formula: '=A2-&A1' }, { formula: '=A2*&A1' }, { formula: '=A2/&A1' }, { formula: '=A2^&A1' }, { formula: '=A2&^A1' }] }
                    ]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Formula that contains multiple plus operator throws invalid expression error', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[0].cells[2].formula).toEqual('=A2++A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toEqual('8');
            expect(helper.getInstance().sheets[0].rows[0].cells[3].formula).toEqual('=A2--A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toEqual('8');
            expect(helper.getInstance().sheets[0].rows[0].cells[4].formula).toEqual('=A2**A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[4].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=A2//A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=A2^^A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[0].cells[7].formula).toEqual('=A2&&A1');
            expect(helper.getInstance().sheets[0].rows[0].cells[7].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[1].cells[2].formula).toEqual('=A2+-A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[2].value).toEqual('-2');
            expect(helper.getInstance().sheets[0].rows[1].cells[3].formula).toEqual('=A2-+A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toEqual('-2');
            expect(helper.getInstance().sheets[0].rows[1].cells[4].formula).toEqual('=A2*/A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[4].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[1].cells[5].formula).toEqual('=A2/*A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[5].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[1].cells[6].formula).toEqual('=A2^A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[6].value).toEqual('243');
            expect(helper.getInstance().sheets[0].rows[1].cells[7].formula).toEqual('=A2&A1');
            expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toEqual('35');
            expect(helper.getInstance().sheets[0].rows[2].cells[2].formula).toEqual('=A2+*A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[2].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[2].cells[3].formula).toEqual('=A2-*A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[3].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[2].cells[4].formula).toEqual('=A2*+A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[4].value).toEqual('15');
            expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toEqual('=A2/+A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toEqual('0.6');
            expect(helper.getInstance().sheets[0].rows[2].cells[6].formula).toEqual('=A2^-A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[6].value).toEqual('0.00411522633744856');
            expect(helper.getInstance().sheets[0].rows[2].cells[7].formula).toEqual('=A2&-A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toEqual('3-5');
            expect(helper.getInstance().sheets[0].rows[3].cells[2].formula).toEqual('=A2+/A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[2].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[3].cells[3].formula).toEqual('=A2-/A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[3].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[3].cells[4].formula).toEqual('=A2*-A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[4].value).toEqual('-15');
            expect(helper.getInstance().sheets[0].rows[3].cells[5].formula).toEqual('=A2/-A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[5].value).toEqual('-0.6');
            expect(helper.getInstance().sheets[0].rows[3].cells[6].formula).toEqual('=A2^*A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[6].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[3].cells[7].formula).toEqual('=A2&*A1');
            expect(helper.getInstance().sheets[0].rows[3].cells[7].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[2].formula).toEqual('=A2+^A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[2].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[3].formula).toEqual('=A2-^A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[3].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[4].formula).toEqual('=A2*^A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[4].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[5].formula).toEqual('=A2/^A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[5].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[6].formula).toEqual('=A2^/A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[6].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[4].cells[7].formula).toEqual('=A2&/A1');
            expect(helper.getInstance().sheets[0].rows[4].cells[7].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[2].formula).toEqual('=A2+&A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[2].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[3].formula).toEqual('=A2-&A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[4].formula).toEqual('=A2*&A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[4].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[5].formula).toEqual('=A2/&A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[5].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[6].formula).toEqual('=A2^&A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[6].value).toEqual('invalid expression');
            expect(helper.getInstance().sheets[0].rows[5].cells[7].formula).toEqual('=A2&^A1');
            expect(helper.getInstance().sheets[0].rows[5].cells[7].value).toEqual('invalid expression');
            done();
        });
    });

    describe('EJ2-844967 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [
                        { cells: [{ formula: '=true+true' }, { formula: '=true-true' }, { formula: '=true*true' }, { formula: '=true/true' }, { value: 'TRUE' }] },
                        { cells: [{ formula: '=true+false' }, { formula: '=true-false' }, { formula: '=true*false' }, { formula: '=true/false' }, { value: 'FALSE' }] },
                        { cells: [{ formula: '=false+false' }, { formula: '=false-false' }, { formula: '=false*false' }, { formula: '=false/false' }] },
                        { cells: [{ formula: '=false+true' }, { formula: '=false-true' }, { formula: '=false*true' }, { formula: '=false/true' }] },
                        { cells: [{ formula: '=TRUE+FALSE+2+TRUE' }, { formula: '=TRUE-FALSE-TRUE-4' }, { formula: '=TRUE>FALSE+TRUE+TRUE+TRUE' }, { formula: '=FLASE>FALSE+TRUE+TRUE+TRUE' }] },
                        { cells: [{ formula: '=FLASE<FALSE+TRUE+TRUE+TRUE' }, { formula: '=4<FALSE+TRUE+TRUE+TRUE' }, { formula: '=TRUE+TRUE<FALSE+TRUE+TRUE+TRUE' }, { formula: '=TRUE+TRUE>FALSE+TRUE+TRUE+TRUE' }] },
                        { cells: [{ formula: '=E1+E2' }, { formula: '=E1-E2' }, { formula: '=E1*E1' }, { formula: '=E1/E1' }] },
                        { cells: [{ formula: '=E2+E1' }, { formula: '=E2-E1' }, { formula: '=E2*E1' }, { formula: '=E1/E2' }] }
                    ]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Arithmetic Operations with boolean values without cell reference throws #VALUE! error', (done: Function) => {
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[0].value).toEqual('2');
                expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[1].cells[1].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[1].cells[2].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toEqual('#DIV/0!');
                expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[1].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[2].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[2].cells[3].value).toEqual('#DIV/0!');
                expect(helper.getInstance().sheets[0].rows[3].cells[0].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[3].cells[1].value).toEqual('-1');
                expect(helper.getInstance().sheets[0].rows[3].cells[2].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[3].cells[3].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[4].cells[0].value).toEqual('4');
                expect(helper.getInstance().sheets[0].rows[4].cells[1].value).toEqual('-4');
                expect(helper.getInstance().sheets[0].rows[4].cells[2].value).toEqual('TRUE');
                expect(helper.getInstance().sheets[0].rows[4].cells[3].value).toEqual('#NAME?');
                expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#NAME?');
                expect(helper.getInstance().sheets[0].rows[5].cells[1].value).toEqual('FALSE');
                expect(helper.getInstance().sheets[0].rows[5].cells[2].value).toEqual('TRUE');
                expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toEqual('FALSE');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[6].cells[1].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[6].cells[2].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[6].cells[3].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toEqual('1');
                expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual('-1');
                expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toEqual('0');
                expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual('#DIV/0!');
                done();
            });
        });
    });

    describe('EJ2-62878, EJ2-62887 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ rows: [{ cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '3' }] }] }, {}], activeSheetIndex: 1 }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Console error on deleting or inserting rows and cannot able to delete a row', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=UNIQUE(Sheet1!A1:A3)' }, 'A1']);
            helper.getElement('.e-sheet-tab').querySelectorAll('.e-toolbar-item')[0].click();
            setTimeout(() => {
                expect(getCell(2, 0, helper.getInstance().sheets[0]).value).toBe('3');
                expect(getCell(0, 0, helper.getInstance().sheets[1]).formula).toBe('=UNIQUE(Sheet1!A1:A3)');
                helper.invoke('delete', [2, 2, 'Row']);
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[2]).toBeUndefined();
                    expect(getCell(0, 0, helper.getInstance().sheets[1]).formula).toBe('=UNIQUE(Sheet1!A1:A2)');
                    helper.invoke('insertRow', [1, 1]);
                    expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toBe('2');
                    expect(getCell(0, 0, helper.getInstance().sheets[1]).formula).toBe('=UNIQUE(Sheet1!A1:A3)');
                    done();
                }, 10);
            });
        });
        it('The formula reference not updated properly while pasting the formula with multiple cells', (done: Function) => {
            const sheet: SheetModel = helper.getInstance().sheets[0];
            helper.invoke('updateCell', [{ formula: '=A1+B1' }, 'B2']);
            helper.invoke('updateCell', [{ formula: '=A1+AA1' }, 'B3']);
            helper.invoke('updateCell', [{ formula: '=AA1+AAA1' }, 'B4']);
            helper.invoke('updateCell', [{ formula: '=A1+AA1+AAA1' }, 'B5']);
            helper.invoke('copy', ['B2:B5']).then(() => {
                helper.invoke('paste', ['C2']);
                expect(sheet.rows[1].cells[2].formula).toBe('=B1+C1');
                expect(sheet.rows[2].cells[2].formula).toBe('=B1+AB1');
                expect(sheet.rows[3].cells[2].formula).toBe('=AB1+AAB1');
                expect(sheet.rows[4].cells[2].formula).toBe('=B1+AB1+AAB1');
                done();
            });
        });
    });

    describe('EJ2-917774, EJ2-948832, EJ2-951146 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('#VALUE error occurs while updating the formula dependent cell with formatted value', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.numberFormat('0.00%', 'D2:D11');
            helper.edit('D12', '=SUM(D2:D11)');
            expect(spreadsheet.sheets[0].rows[11].cells[3].value).toBe(277);
            expect(spreadsheet.sheets[0].rows[11].cells[3].formula).toBe('=SUM(D2:D11)');
            expect(spreadsheet.sheets[0].rows[11].cells[3].formattedText).toBe('27700.00%');
            expect(spreadsheet.sheets[0].rows[11].cells[3].format).toBe('0.00%');
            helper.edit('D2', '10%');
            expect(spreadsheet.sheets[0].rows[11].cells[3].value).toBe('267.1');
            expect(spreadsheet.sheets[0].rows[11].cells[3].formattedText).toBe('26710.00%');
            helper.edit('D3', '0%');
            expect(spreadsheet.sheets[0].rows[11].cells[3].value).toBe('247.1');
            expect(spreadsheet.sheets[0].rows[11].cells[3].formattedText).toBe('24710.00%');
            helper.edit('D4', '20%');
            expect(spreadsheet.sheets[0].rows[11].cells[3].value).toBe('227.3');
            expect(spreadsheet.sheets[0].rows[11].cells[3].formattedText).toBe('22730.00%');
            helper.edit('D5', '100%');
            expect(spreadsheet.sheets[0].rows[11].cells[3].value).toBe('213.3');
            expect(spreadsheet.sheets[0].rows[11].cells[3].formattedText).toBe('21330.00%');
            spreadsheet.numberFormat('$#,##0.00', 'E2:E11');
            helper.edit('E12', '=SUM(E2:E11)');
            expect(spreadsheet.sheets[0].rows[11].cells[4].value).toBe(175);
            expect(spreadsheet.sheets[0].rows[11].cells[4].formula).toBe('=SUM(E2:E11)');
            expect(spreadsheet.sheets[0].rows[11].cells[4].formattedText).toBe('$175.00');
            expect(spreadsheet.sheets[0].rows[11].cells[4].format).toBe('$#,##0.00');
            helper.edit('E2', '$10');
            expect(spreadsheet.sheets[0].rows[11].cells[4].value).toBe(165);
            expect(spreadsheet.sheets[0].rows[11].cells[4].formattedText).toBe('$165.00');
            helper.edit('E3', '$10');
            expect(spreadsheet.sheets[0].rows[11].cells[4].value).toBe(145);
            expect(spreadsheet.sheets[0].rows[11].cells[4].formattedText).toBe('$145.00');
            helper.edit('E4', '$10');
            expect(spreadsheet.sheets[0].rows[11].cells[4].value).toBe(140);
            expect(spreadsheet.sheets[0].rows[11].cells[4].formattedText).toBe('$140.00');
            helper.edit('E5', '$10');
            expect(spreadsheet.sheets[0].rows[11].cells[4].value).toBe(130);
            expect(spreadsheet.sheets[0].rows[11].cells[4].formattedText).toBe('$130.00');
            spreadsheet.numberFormat('0%', 'G2:G11');
            helper.edit('G12', '=SUM(G2:G11)');
            expect(spreadsheet.sheets[0].rows[11].cells[6].value).toBe(77);
            expect(spreadsheet.sheets[0].rows[11].cells[6].formula).toBe('=SUM(G2:G11)');
            expect(spreadsheet.sheets[0].rows[11].cells[6].formattedText).toBe('7700%');
            expect(spreadsheet.sheets[0].rows[11].cells[6].format).toBe('0%');
            helper.edit('G2', '100.45%');
            expect(spreadsheet.sheets[0].rows[1].cells[6].value).toBe('1.0045');
            expect(spreadsheet.sheets[0].rows[1].cells[6].formattedText).toBe('100%');
            expect(spreadsheet.sheets[0].rows[1].cells[6].format).toBe('0%');
            expect(spreadsheet.sheets[0].rows[1].cells[6].format).not.toBe('0.00%');
            helper.edit('G3', '100.30%');
            expect(spreadsheet.sheets[0].rows[2].cells[6].value).toBe('1.003');
            expect(spreadsheet.sheets[0].rows[2].cells[6].formattedText).toBe('100%');
            expect(spreadsheet.sheets[0].rows[2].cells[6].format).toBe('0%');
            expect(spreadsheet.sheets[0].rows[2].cells[6].format).not.toBe('0.00%');
            expect(spreadsheet.sheets[0].rows[11].cells[6].value).toBe('73.0075');
            expect(spreadsheet.sheets[0].rows[11].cells[6].formattedText).toBe('7301%');
            expect(spreadsheet.sheets[0].rows[11].cells[6].format).toBe('0%');
            done();
        });

        it('Handled Match Formula cases', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('I1', '=MATCH("Feb",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            helper.edit('I2', '=MATCH("Jun",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            helper.edit('I3', '=MATCH("Sep",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            helper.edit('I4', '=MATCH("October",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            helper.edit('I5', '=MATCH("Dec",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe(2);
            expect(spreadsheet.sheets[0].rows[0].cells[8].formula).toBe('=MATCH("Feb",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            expect(spreadsheet.sheets[0].rows[1].cells[8].value).toBe(6);
            expect(spreadsheet.sheets[0].rows[1].cells[8].formula).toBe('=MATCH("Jun",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            expect(spreadsheet.sheets[0].rows[2].cells[8].value).toBe(9);
            expect(spreadsheet.sheets[0].rows[2].cells[8].formula).toBe('=MATCH("Sep",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            expect(spreadsheet.sheets[0].rows[3].cells[8].value).toBe('#N/A');
            expect(spreadsheet.sheets[0].rows[3].cells[8].formula).toBe('=MATCH("October",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            expect(spreadsheet.sheets[0].rows[4].cells[8].value).toBe(12);
            expect(spreadsheet.sheets[0].rows[4].cells[8].formula).toBe('=MATCH("Dec",{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)');
            done();
        });

        it('Handled #Value error caused by improper concatenation in nested formula', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('J1', '2017');
            helper.edit('J2', '2019');
            helper.edit('J3', '2020');
            helper.edit('J4', '2025');
            helper.invoke('numberFormat', ['mm-dd-yyyy', 'J5:J8']);
            helper.edit('J5', '=EOMONTH(DATEVALUE(IF(AM$2="Q1",3,IF(OR(AM$2="Q2",AM$2="H1"),6,IF(AM$2="Q3",9,12)))&"/1/"&J$1),+IF(AM$2<>"CY",-12+5,0))');
            helper.edit('J6', '=EOMONTH(DATEVALUE(IF(AM$2="Q1",3,IF(OR(AM$2="Q2",AM$2="H1"),6,IF(AM$2="Q3",9,12)))&"/1/"&J$2),+IF(AM$2<>"CY",-12+5,0))');
            helper.edit('J7', '=EOMONTH(DATEVALUE(IF(AM$2="Q1",3,IF(OR(AM$2="Q2",AM$2="H1"),6,IF(AM$2="Q3",9,12)))&"/1/"&J$3),+IF(AM$2<>"CY",-12+5,0))');
            helper.edit('J8', '=EOMONTH(DATEVALUE(IF(AM$2="Q1",3,IF(OR(AM$2="Q2",AM$2="H1"),6,IF(AM$2="Q3",9,12)))&"/1/"&J$4),+IF(AM$2<>"CY",-12+5,0))');
            expect(spreadsheet.sheets[0].rows[4].cells[9].value).toBe('42886');
            expect(spreadsheet.sheets[0].rows[5].cells[9].value).toBe('43616');
            expect(spreadsheet.sheets[0].rows[6].cells[9].value).toBe('43982');
            expect(spreadsheet.sheets[0].rows[7].cells[9].value).toBe('45808');
            expect(spreadsheet.sheets[0].rows[4].cells[9].formattedText).toBe('05-31-2017');
            expect(spreadsheet.sheets[0].rows[5].cells[9].formattedText).toBe('05-31-2019');
            expect(spreadsheet.sheets[0].rows[6].cells[9].formattedText).toBe('05-31-2020');
            expect(spreadsheet.sheets[0].rows[7].cells[9].formattedText).toBe('05-31-2025');
            done();
        });

        it('Double quotes not handled correctly when using & operator for string concatenation', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('I1', 'AAA');
            helper.edit('I2', 'BBB');
            helper.edit('I3', '=I1 & " " & I2');
            expect(spreadsheet.sheets[0].rows[2].cells[8].value).toBe('AAA BBB');
            expect(spreadsheet.sheets[0].rows[2].cells[8].value).not.toBe('AAA" "BBB');
            expect(spreadsheet.sheets[0].rows[2].cells[8].formula).toBe('=I1 & " " & I2');
            helper.edit('I4', '=I1 & " " & IF(I2="XXX","E",I2)');
            expect(spreadsheet.sheets[0].rows[3].cells[8].value).toBe('AAA BBB');
            expect(spreadsheet.sheets[0].rows[3].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[3].cells[8].formula).toBe('=I1 & " " & IF(I2="XXX","E",I2)');
            helper.edit('I5', '=I1 & " " & IF(I2="BBB","E",I2)');
            expect(spreadsheet.sheets[0].rows[4].cells[8].value).toBe('AAA E');
            expect(spreadsheet.sheets[0].rows[4].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[4].cells[8].formula).toBe('=I1 & " " & IF(I2="BBB","E",I2)');
            helper.edit('I6', '=IF(I2="", I1, I1 & " " & I2)');
            expect(spreadsheet.sheets[0].rows[5].cells[8].value).toBe('AAA BBB');
            expect(spreadsheet.sheets[0].rows[5].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[5].cells[8].formula).toBe('=IF(I2="", I1, I1 & " " & I2)');
            helper.edit('I7', '=I1 & " " & IF(I2="kg", "Kilograms", "Pounds")');
            expect(spreadsheet.sheets[0].rows[6].cells[8].value).toBe('AAA Pounds');
            expect(spreadsheet.sheets[0].rows[6].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[6].cells[8].formula).toBe('=I1 & " " & IF(I2="kg", "Kilograms", "Pounds")');
            helper.edit('I8', '="Name: " & I1 & IF(I2="", "", " (" & I2 & ")")');
            expect(spreadsheet.sheets[0].rows[7].cells[8].value).toBe('Name: AAA (BBB)');
            expect(spreadsheet.sheets[0].rows[7].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[7].cells[8].formula).toBe('="Name: " & I1 & IF(I2="", "", " (" & I2 & ")")');
            helper.edit('I9', '="Grade: " & IF(I1>=90, "A", IF(I1>=80, "B", IF(I1>=70, "C", "Fail"))) & " - Score: " & I1');
            expect(spreadsheet.sheets[0].rows[8].cells[8].value).toBe('Grade: A - Score: AAA');
            expect(spreadsheet.sheets[0].rows[8].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[8].cells[8].formula).toBe('="Grade: " & IF(I1>=90, "A", IF(I1>=80, "B", IF(I1>=70, "C", "Fail"))) & " - Score: " & I1');
            helper.edit('I10', '=IF(I1="", "", I1 & " | " & IF(I2="", "", I2))');
            expect(spreadsheet.sheets[0].rows[9].cells[8].value).toBe('AAA | BBB');
            expect(spreadsheet.sheets[0].rows[9].cells[8].value).not.toBe('#NAME');
            expect(spreadsheet.sheets[0].rows[9].cells[8].formula).toBe('=IF(I1="", "", I1 & " | " & IF(I2="", "", I2))');
            done();
        });
    });

    describe('EJ2-1013234 -> Formula parsing error with cell references ending in 0 before division with sheet reference ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ name: 'TEST' }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Checking different combinations of formula with sheet references and division opertor', (done: Function) => {
            helper.edit('A1', '5');
            helper.edit('B10', '100');
            helper.edit('A2', "=B10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[1].cells[0].value).toBe('20');
            helper.edit('A3', '=B10/A1');
            expect(helper.getInstance().sheets[0].rows[2].cells[0].value).toBe('20');
            helper.edit('A4', "=B$10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[3].cells[0].value).toBe('20');
            helper.edit('A5', "=$B$10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[4].cells[0].value).toBe('20');
            helper.edit('A1', 'abc');
            helper.edit('A6', "=B10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBe('#VALUE!');
            helper.edit('A1', '0');
            helper.edit('A7', "=B10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toBe('#DIV/0!');
            helper.edit('A1', '5');
            helper.edit('B10', '');
            helper.edit('A8', "=B10/'TEST'!$A$1");
            expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toBe('0');
            done();
        });
    });

    describe('Formula - Checking VIII ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('COUNTIF Formula ->', (done: Function) => {
            helper.edit('I1', '=COUNTIF(D2:D11,"20")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('3');
            done();
        });
        it('COUNTIF Formula with greater than equal to operator ->', (done: Function) => {
            helper.edit('I2', '=COUNTIF(D2:D11,">=30")');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toBe('=COUNTIF(D2:D11,">=30")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('5');
            done();
        });
        it('COUNTIF Formula with not equal to operator ->', (done: Function) => {
            helper.edit('I3', '=COUNTIF(D2:D11,"<>30")');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].formula).toBe('=COUNTIF(D2:D11,"<>30")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('9');
            done();
        });
        it('COUNTIF Formula with Greater than operator ->', (done: Function) => {
            helper.edit('I4', '=COUNTIF(D2:D11,">30")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('4');
            done();
        });
        it('COUNTIF Formula with Less than operator ->', (done: Function) => {
            helper.edit('I5', '=COUNTIF(D2:D11,"<30")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('5');
            done();
        });
        it('MATCH Formula for without input->', (done: Function) => {
            helper.edit('I6', '=MATCH("",A2:A11)');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].formula).toBe('=MATCH("",A2:A11)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#N/A');
            done();
        });
        it('SUBTOTAL Formula Case I->', (done: Function) => {
            helper.edit('J1', '=SUBTOTAL(1,d2:d11)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('27.7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"27.7","formula":"=SUBTOTAL(1,d2:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case II->', (done: Function) => {
            helper.edit('J2', '=SUBTOTAL(2,d1:d11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":10,"formula":"=SUBTOTAL(2,d1:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case III->', (done: Function) => {
            helper.edit('J3', '=SUBTOTAL(3,d1:d11)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":11,"formula":"=SUBTOTAL(3,d1:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case IV->', (done: Function) => {
            helper.edit('J4', '=SUBTOTAL(4,d2:d11)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"50","formula":"=SUBTOTAL(4,d2:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case V->', (done: Function) => {
            helper.edit('J5', '=SUBTOTAL(5,d2:d11)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"10","formula":"=SUBTOTAL(5,d2:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case VI->', (done: Function) => {
            helper.edit('J6', '=SUBTOTAL(6,d2:d5)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('60000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"60000","formula":"=SUBTOTAL(6,d2:d5)"}');
            done();
        });
        it('SUBTOTAL Formula Case VIII->', (done: Function) => {
            helper.edit('J7', '=SUBTOTAL(8,A2:A3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('Casual ShoesSports Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"Casual ShoesSports Shoes","formula":"=SUBTOTAL(8,A2:A3)"}');
            done();
        });
        it('SUBTOTAL Formula Case XI->', (done: Function) => {
            helper.edit('J8', '=SUBTOTAL(9,d2:d11)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('277');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{"value":277,"formula":"=SUBTOTAL(9,d2:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case X->', (done: Function) => {
            helper.edit('J9', '=SUBTOTAL(10,d1:d11)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('25.18181818');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[9])).toBe('{"value":25.181818181818183,"formula":"=SUBTOTAL(10,d1:d11)"}');
            done();
        });
        it('SUBTOTAL Formula Case XI->', (done: Function) => {
            helper.edit('E2', '-20');
            helper.edit('J10', '=SUBTOTAL(11,e2)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[9])).toBe('{"value":20,"formula":"=SUBTOTAL(11,e2)"}');
            done();
        });
        it('LN Formula->', (done: Function) => {
            helper.edit('K1', '=LN(1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":0,"formula":"=LN(1)"}');
            done();
        });
        it('LN Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LN()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LN()';
            helper.triggerKeyNativeEvent(13);
            setTimeout(() => {
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
                expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
                helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
                helper.edit('K3', '=LN(10);');
                done();
            });
        });
        it('LN Formula with String inputs->', (done: Function) => {
            helper.edit('K4', '=LN(sa)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NAME?","formula":"=LN(sa)"}');
            done();
        });
        it('LN Formula with more than 1 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LN(3,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LN(3,2)';
            helper.triggerKeyNativeEvent(13);
            setTimeout(() => {
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
                expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
                helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
                helper.edit('K5', '=LN(3)');
                done();
            });
        });
        it('SUMIF Formula with more than 3 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF(A2:A5,"Casual Shoes",D2:D4,E2:E4)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF(A2:A5,"Casual Shoes",D2:D4,E2:E4)';
            helper.triggerKeyNativeEvent(13);
            setTimeout(() => {
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
                expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
                helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
                helper.edit('K6', '=SUMIF(A2:A5,"Casual Shoes",D2:D4)');
                done();
            });
        });
    });

    describe('UI - Interaction', () => {
        let calcObj: any;
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Open circular reference dialog->', (done: Function) => {
            helper.invoke('updateCell', [{ value: '19' }, 'I1']);
            helper.invoke('updateCell', [{ value: '20' }, 'I2']);
            helper.editInUI('=I1+I2+I3', 'I3', true);
            setTimeout(() => {
                helper.setAnimationToNone('.e-control.e-dialog');
                expect(helper.getElement('.e-control.e-dialog')).not.toBeNull();
                calcObj = helper.getInstance().workbookFormulaModule.calculateInstance;
                expect(calcObj.getFormulaInfoTable().size).toBe(0);
                expect(calcObj.getDependentCells().size).toBe(0);
                expect(calcObj.getDependentFormulaCells().size).toBe(0);
                helper.click('.e-control.e-dialog .e-footer-content button:nth-child(1)');
                helper.invoke('closeEdit');
                done();
            });
        });
        it('Editing formula by using circular reference of the dependent formula cells->', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=SUM(I10+1)' }, 'I5']);
            const sheet: SheetModel = helper.getInstance().sheets[0];
            expect(JSON.stringify(sheet.rows[4].cells[8])).toBe('{"formula":"=SUM(I10+1)","value":1}');
            helper.invoke('updateCell', [{ value: '10' }, 'I10']);
            expect(JSON.stringify(sheet.rows[9].cells[8])).toBe('{"value":10}');
            helper.editInUI('=SUM(I5+2)', 'I10', true, sheet.rows[9].cells[8].value);
            setTimeout(() => {
                expect(JSON.stringify(sheet.rows[9].cells[8])).toBe('{"value":10}');
                const alertDlg: HTMLElement = helper.getElementFromSpreadsheet('.e-validation-error-dlg.e-dialog');
                expect(alertDlg.querySelector('.e-dlg-content').textContent).toBe('We found that you typed a formula with a circular reference.');
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                helper.click('.e-validation-error-dlg.e-dialog .e-footer-content button:nth-child(1)');
                expect(calcObj.getFormulaInfoTable().size).toBe(1);
                const dependentCells: any = calcObj.getDependentCells();
                expect(dependentCells.size).toBe(2);
                expect(dependentCells.get('!0!I10').length).toBe(1);
                expect(dependentCells.get('!0!I5').length).toBe(0);
                expect(calcObj.getDependentFormulaCells().size).toBe(1);
                helper.invoke('closeEdit');
                done();
            });
        });
        it('Calculating formulas which contains circular reference of the dependent cells using calculateNow() ->', (done: Function) => {
            const sheet: SheetModel = helper.getInstance().sheets[0];
            setCell(3, 8, sheet, { formula: '=SUM(I9)' });
            setCell(8, 8, sheet, { formula: '=SUM(I4)' });
            setCell(10, 8, sheet, { formula: '=I11' });
            helper.invoke('calculateNow');
            setTimeout(() => {
                expect(JSON.stringify(sheet.rows[3].cells[8])).toBe('{"formula":"=SUM(I9)","value":0}');
                expect(!!calcObj.getFormulaInfoTable().get('!0!I4')).toBeTruthy();
                const dependentCells: string[] = calcObj.getDependentCells().get('!0!I9');
                expect(dependentCells.length).toBe(1);
                expect(dependentCells[0]).toBe('!0!I4');
                expect(JSON.stringify(sheet.rows[8].cells[8])).toBe('{"formula":"=SUM(I4)","value":"0"}');
                expect(calcObj.getDependentCells().get('!0!I4').length).toBe(0);
                expect(!!calcObj.getFormulaInfoTable().get('!0!I9')).toBeTruthy();
                expect(JSON.stringify(sheet.rows[10].cells[8])).toBe('{"formula":"=I11","value":"0"}');
                expect(calcObj.getDependentCells().get('!0!I11')).toBeUndefined();
                expect(!!calcObj.getFormulaInfoTable().get('!0!I11')).toBeTruthy();
                const alertDlg: HTMLElement = helper.getElementFromSpreadsheet('.e-control.e-dialog');
                expect(alertDlg.querySelector('.e-dlg-content').textContent).toBe('When a formula refers to one or more circular references, this may result in an incorrect calculation.');
                helper.setAnimationToNone('.e-control.e-dialog');
                helper.click('.e-dialog .e-footer-content button:nth-child(1)');
                done();
            });
        });
        it('Changing common circular reference alert dialog content->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            setCell(3, 9, sheet, { formula: '=SUM(J9 + 1)' });
            setCell(8, 9, sheet, { formula: '=SUM(J4 + 2)' });
            setCell(10, 9, sheet, { formula: '=J11' });
            let errorMsg: string = 'Circular reference found in: ';
            spreadsheet.dialogBeforeOpen = (args: DialogBeforeOpenEventArgs): void => {
                expect(args.dialogName).toBe('CircularReferenceDialog');
                expect(args.content).toBe('When a formula refers to one or more circular references, this may result in an incorrect calculation.');
                const dlgInst: any = getComponent(<HTMLElement>args.element, 'dialog');
                if (dlgInst.content === 'When a formula refers to one or more circular references, this may result in an incorrect calculation.') {
                    errorMsg += args.cellAddress;
                } else {
                    errorMsg += `, ${args.cellAddress}`;
                }
                args.content = errorMsg;
            };
            spreadsheet.dataBind();
            helper.invoke('calculateNow');
            setTimeout(() => {
                expect(JSON.stringify(sheet.rows[3].cells[9])).toBe('{"formula":"=SUM(J9 + 1)","value":1}');
                expect(!!calcObj.getFormulaInfoTable().get('!0!J4')).toBeTruthy();
                const dependentCells: string[] = calcObj.getDependentCells().get('!0!J9');
                expect(dependentCells.length).toBe(1);
                expect(dependentCells[0]).toBe('!0!J4');
                expect(JSON.stringify(sheet.rows[8].cells[9])).toBe('{"formula":"=SUM(J4 + 2)","value":"0"}');
                expect(calcObj.getDependentCells().get('!0!J4').length).toBe(0);
                expect(!!calcObj.getFormulaInfoTable().get('!0!J9')).toBeTruthy();
                expect(JSON.stringify(sheet.rows[10].cells[9])).toBe('{"formula":"=J11","value":"0"}');
                expect(calcObj.getDependentCells().get('!0!J11')).toBeUndefined();
                expect(!!calcObj.getFormulaInfoTable().get('!0!J11')).toBeTruthy();
                const alertDlg: HTMLElement = helper.getElementFromSpreadsheet('.e-control.e-dialog');
                expect(alertDlg.querySelector('.e-dlg-content').textContent).toBe('Circular reference found in: Sheet1!J9, Sheet1!J11');
                helper.setAnimationToNone('.e-control.e-dialog');
                helper.click('.e-dialog .e-footer-content button:nth-child(1)');
                done();
            });
        });
        it('Canceling the editing circular reference dialog ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.dialogBeforeOpen = (args: DialogBeforeOpenEventArgs): void => {
                args.cancel = true;
                expect(args.dialogName).toBe('CircularReferenceDialog');
                expect(args.cellAddress).toBe('Sheet1!L1');
            };
            spreadsheet.dataBind();
            helper.editInUI('=L1', 'L1', true);
            setTimeout(() => {
                expect(helper.getElementFromSpreadsheet('.e-validation-error-dlg.e-dialog.e-popup-open')).toBeNull();
                expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[11])).toBe('{"value":"0","formula":"=L1"}');
                expect(!!calcObj.getFormulaInfoTable().get('!0!L1')).toBeTruthy();
                expect(calcObj.getDependentCells().get('!0!L1')).toBeUndefined();
                expect(calcObj.getDependentFormulaCells().get('!0!L1').size).toBe(0);
                done();
            });
        });
        it('Changing the editing circular reference dialog content ->', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const customAlertContent: string = 'You have typed the formula with circular reference';
            spreadsheet.dialogBeforeOpen = (args: DialogBeforeOpenEventArgs): void => {
                expect(args.dialogName).toBe('CircularReferenceDialog');
                expect(args.cellAddress).toBe('Sheet1!L1');
                args.content = customAlertContent;
            };
            spreadsheet.dataBind();
            helper.editInUI('=L1+10', 'L1', true, '=L1');
            setTimeout(() => {
                spreadsheet.dialogBeforeOpen = undefined;
                spreadsheet.dataBind();
                const alertDlg: HTMLElement = helper.getElementFromSpreadsheet('.e-validation-error-dlg.e-dialog');
                expect(alertDlg.classList.contains('e-popup-open')).toBeTruthy();
                expect(alertDlg.querySelector('.e-dlg-content').textContent).toBe(customAlertContent);
                expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[11])).toBe('{"formula":"=L1","value":"0"}');
                expect(!!calcObj.getFormulaInfoTable().get('!0!L1')).toBeTruthy();
                expect(calcObj.getDependentCells().get('!0!L1')).toBeUndefined();
                expect(calcObj.getDependentFormulaCells().get('!0!L1').size).toBe(0);
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                helper.click('.e-validation-error-dlg.e-dialog .e-footer-content button:nth-child(1)');
                helper.invoke('closeEdit');
                done();
            }, 20);
        });
        it('Selecting formula in dropdown->', (done: Function) => {
            helper.invoke('selectRange', ['J1']);
            helper.triggerKeyNativeEvent(113);
            const editElem: HTMLElement = helper.getCellEditorElement();
            const spreadsheet: any = helper.getInstance();
            spreadsheet.notify('editOperation', { action: 'refreshEditor', value: '=SU', refreshCurPos: true, refreshEditorElem: true });
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                expect(document.querySelector(`#${helper.id}_ac_popup .e-list-parent.e-ul`).childElementCount).toBe(5);
                helper.click('.e-ddl.e-popup li:nth-child(2)');
                spreadsheet.notify('editOperation', { action: 'refreshEditor', value: '=SUM(H2:H11)', refreshCurPos: true, refreshEditorElem: true });
                helper.triggerKeyNativeEvent(13);
                expect(JSON.stringify(spreadsheet.sheets[0].rows[0].cells[9])).toBe('{"value":554,"formula":"=SUM(H2:H11)"}');
                done();
            });
        });
        it('Selecting sub formula in dropdown->', (done: Function) => {
            helper.invoke('selectRange', ['J2']);
            helper.triggerKeyNativeEvent(113);
            const editElem: HTMLElement = helper.getCellEditorElement();
            editElem.textContent = '=SU';
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                helper.click('.e-ddl.e-popup li:nth-child(2)');
                editElem.textContent = '=SUM(SU';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    helper.click('.e-ddl.e-popup li:nth-child(1)');
                    helper.getElement('.e-spreadsheet-edit').textContent = '=SUM(SUM(H2:H11))';
                    helper.triggerKeyNativeEvent(13);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":554,"formula":"=SUM(SUM(H2:H11))"}');
                        done();
                    });
                });
            });
        });
        it('Selecting sub formula in dropdown with list separator->', (done: Function) => {
            helper.invoke('selectRange', ['J2']);
            helper.triggerKeyNativeEvent(113);
            const editElem: HTMLElement = helper.getCellEditorElement();
            editElem.textContent = '=SU';
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                helper.click('.e-ddl.e-popup li:nth-child(2)');
                editElem.textContent = '=SUM(10,SU';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    helper.click('.e-ddl.e-popup li:nth-child(1)');
                    helper.getElement('.e-spreadsheet-edit').textContent = '=SUM(SUM(H2:H11))';
                    helper.triggerKeyNativeEvent(13);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":554,"formula":"=SUM(SUM(H2:H11))"}');
                        done();
                    });
                });
            });
        });
        it('Clicking down arrow and up arrow and tab key in formula dropdown->', (done: Function) => {
            helper.invoke('selectRange', ['J3']);
            helper.triggerKeyNativeEvent(113);
            helper.getInstance().notify('editOperation', { action: 'refreshEditor', value: '=SU', refreshCurPos: true, refreshEditorElem: true });
            const editElem: HTMLElement = helper.getCellEditorElement();
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                helper.triggerKeyNativeEvent(40);
                setTimeout(() => {
                    helper.triggerKeyNativeEvent(38);
                    helper.triggerKeyNativeEvent(40);
                    helper.triggerKeyNativeEvent(9);
                    helper.getInstance().notify('editOperation', { action: 'refreshEditor', value: '=SUM(H2:H11)', refreshCurPos: true, refreshEditorElem: true });
                    helper.triggerKeyNativeEvent(13);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":554,"formula":"=SUM(H2:H11)"}');
                        done();
                    }, 20);
                }, 20);
            }, 20);
        });
        it('Close name box popup using esc button->', (done: Function) => {
            helper.invoke('selectRange', ['J3']);
            let nameBox: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('#' + helper.id + '_name_box');
            nameBox.click();
            setTimeout(() => {
                helper.triggerKeyEvent('keydown', 27, null, false, false, nameBox);
                done();
            });
        });
        it('Editing after opening suggestion already opened in dropdown->', (done: Function) => {
            helper.invoke('selectRange', ['J4']);
            helper.triggerKeyNativeEvent(113);
            const editElem: HTMLElement = helper.getCellEditorElement();
            editElem.textContent = '=S';
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                expect(document.querySelector(`#${helper.id}_ac_popup .e-list-parent.e-ul`).childElementCount).toBe(10);
                editElem.textContent = '=SU';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    expect(document.querySelector(`#${helper.id}_ac_popup .e-list-parent.e-ul`).childElementCount).toBe(5);
                    helper.click('.e-ddl.e-popup li:nth-child(2)');
                    helper.getInstance().notify('editOperation', { action: 'refreshEditor', value: '=SUM(H2:H11)', refreshCurPos: true, refreshEditorElem: true });
                    helper.triggerKeyNativeEvent(13);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"formula":"=SUM(H2:H11)","value":554}');
                        done();
                    });
                });
            });
        });
        it('Defined name editing alert->', (done: Function) => {
            helper.invoke('selectRange', ['J1:J4']);
            let nameBox: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('#' + helper.id + '_name_box');
            nameBox.click();
            nameBox.value = 'Test1';
            helper.triggerKeyEvent('keydown', 13, null, false, false, nameBox);
            helper.invoke('selectRange', ['I1:I3']);
            nameBox.click();
            nameBox.value = 'Test1';
            helper.triggerKeyEvent('keydown', 13, null, false, false, nameBox);
            setTimeout(() => {
                helper.setAnimationToNone('.e-control.e-dialog');
                expect(helper.getElement('.e-control.e-dialog')).not.toBeNull();
                helper.click('.e-control.e-dialog:not(.e-validation-error-dlg) .e-footer-content button:nth-child(1)');
                done();
            });
        });
        it('Deleting sub formula after adding->', (done: Function) => {
            helper.invoke('selectRange', ['K1']);
            helper.triggerKeyNativeEvent(113);
            const editElem: HTMLElement = helper.getCellEditorElement();
            editElem.textContent = '=SU';
            helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
            setTimeout(() => {
                helper.click('.e-ddl.e-popup li:nth-child(2)');
                editElem.textContent = '=SUM(S';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    editElem.textContent = '=SUM(';
                    helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                    setTimeout(() => {
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":554,"formula":"=SUM(SUM(H2:H11))"}');
                        helper.invoke('closeEdit');
                        done();
                    });
                });
            });
        });
        it('Cancelling the circular reference error dialog', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.dialogBeforeOpen = (args: DialogBeforeOpenEventArgs): void => {
                args.cancel = true;
            };
            spreadsheet.dataBind();
            setCell(2, 8, spreadsheet.getActiveSheet(), { formula: '=I1+I2+I3' });
            helper.invoke('calculateNow');
            setTimeout((): void => {
                expect(helper.getElementFromSpreadsheet('.e-dialog.e-popup-open:not(.e-validation-error-dlg)')).toBeNull();
                helper.invoke('selectRange', ['K2']);
                done();
            });
        });
        // it('Selecting formula in dropdown in formula bar->', (done: Function) => {
        // let editorElem: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('.e-formula-bar-panel .e-formula-bar');
        // let e = new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true });
        // editorElem.dispatchEvent(e);
        // e = new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true });
        // editorElem.dispatchEvent(e);
        // e = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        // editorElem.dispatchEvent(e);
        // const editElem: HTMLElement = helper.getCellEditorElement();
        // editElem.textContent = '=SU';
        // helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
        // setTimeout(() => {
        // helper.click('.e-ddl.e-popup li:nth-child(2)');
        // helper.getElement('.e-spreadsheet-edit').textContent = '=SUM(H2:H11)';
        // helper.triggerKeyNativeEvent(13);
        //expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":554,"formula":"=SUM(H2:H11)"}');
        // done();
        // },30);
        // });
        it('Add defined for whole column', (done: Function) => {
            helper.invoke('selectRange', [getRangeAddress([0, 7, helper.getInstance().sheets[0].rowCount, 7])]);
            setTimeout(() => {
                let nameBox: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('#' + helper.id + '_name_box');
                nameBox.click();
                nameBox.value = 'Name123';
                helper.triggerKeyEvent('keydown', 13, null, false, false, nameBox);
                nameBox.classList.remove('e-name-editing');
                expect(helper.getInstance().definedNames.length).toBe(2);
                expect(helper.getInstance().definedNames[1].name).toBe('Name123');
                done();
            }, 20);
        });
        it('Cancelling the definename exists dialog error', (done: Function) => {
            helper.invoke('selectRange', ['A5:A7']);
            setTimeout(() => {
                let nameBox: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('#' + helper.id + '_name_box');
                nameBox.click();
                nameBox.value = '123';
                helper.triggerKeyEvent('keydown', 13, null, false, false, nameBox);
                setTimeout(function () {
                    expect(helper.getElementFromSpreadsheet('.e-dialog.e-popup-open:not(.e-validation-error-dlg)')).toBeNull();
                    done();
                });
            }, 20);
        });
        it('Cancelling the definename invalid dialog error', (done: Function) => {
            helper.invoke('selectRange', ['A5:A7']);
            setTimeout(() => {
                let nameBox: HTMLInputElement = <HTMLInputElement>helper.getElementFromSpreadsheet('#' + helper.id + '_name_box');
                nameBox.click();
                nameBox.value = '/';
                helper.triggerKeyEvent('keydown', 13, null, false, false, nameBox);
                setTimeout(function () {
                    expect(helper.getElementFromSpreadsheet('.e-dialog.e-popup-open:not(.e-validation-error-dlg)')).toBeNull();
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.dialogBeforeOpen = undefined;
                    spreadsheet.dataBind();
                    done();
                });
            }, 20);
        });
    });

    describe('UI - Interaction', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Update defined names method with changed as true->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.updateDefinedNames({ name: 'test' }, 'Price Deatils', [1, 5], true, [5, 1], { index: 0 });
            setTimeout(() => {
                expect(helper.getInstance().definedNames.length).toBe(0);
                done();
            });
        });
        it('Update defined names method with changed as false->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.updateDefinedNames({ name: 'test' }, 'Price Deatils', [15], false, [5], { index: 0 });
            setTimeout(() => {
                expect(helper.getInstance().definedNames.length).toBe(0);
                done();
            });
        });
        it('Refresh named range method testing->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.refreshNamedRange({ sheet: { name: 'Sheet!' }, modelType: "Row", isInsert: true, definedNames: { name: 'Test' } });
            setTimeout(() => {
                expect(helper.getInstance().definedNames.length).toBe(0);
                done();
            });
        });
        it('Update data container method testing for active selected cell->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.updateDataContainer([0, 0], { value: 20, sheetId: 1, visible: true });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[0].value.innerText).toBeUndefined();
                done();
            });
        });
        it('Update data container method testing for cell with no data in a row->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.updateDataContainer([0, 10], { value: 20, sheetId: 1, visible: true });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[10].value).toBeUndefined();
                done();
            });
        });
        it('Update data container method testing for cell with no data in a column->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.updateDataContainer([12, 0], { value: 20, sheetId: 1, visible: true });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[10].value).toBeUndefined();
                done();
            });
        });
        it('Add defined name method testing->', (done: Function) => {
            helper.getInstance().workbookFormulaModule.addDefinedName({ name: 'Test', refersTo: 'E2:E5', scope: 'Workbook' }, true, 1, true)
            setTimeout(() => {
                let definedNames: DefineNameModel[] = helper.getInstance().definedNames;
                expect(definedNames.length).toBe(1);
                expect(definedNames[0].name).toBe('Test');
                done();
            });
        });
        it('Clearalluniqueformulavalue method testing->', (done: Function) => {
            helper.invoke('selectRange', ['I1']);
            helper.invoke('updateCell', [{ value: '10' }, 'I4']);
            helper.invoke('updateCell', [{ formula: '=UNIQUE(H2:H5)' }, 'I1']);
            helper.getInstance().workbookFormulaModule.clearAllUniqueFormulaValue();
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toBe('=UNIQUE(H2:H5)');
                expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toBe('#SPILL!');
                done();
            });
        });
    });

    describe('UI - Interaction for delete the formula value referenced row', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }], rows: [{ cells: [{ index: 9, formula: '=H10&H11' }, { format: '##0.0E+0', value: '10' }] },
                    { cells: [{ index: 9, formula: '=H9^H10' }] }, { cells: [{ index: 9, formula: '=H8<H9' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Apply delete with operator "&" and delete the formula value referenced row->', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toBe('=H10&H11');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].value).toBe('16655');
            helper.invoke('selectRange', ['A11']);
            helper.invoke('delete', [10, 10, 'Row']);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toBe('=H10&#REF!');
                expect(helper.getInstance().sheets[0].rows[0].cells[9].value).toBe('#REF!');
                done();
            });
        });
        it('Apply delete with operator "^" and delete the formula value referenced row->', (done: Function) => {
            helper.invoke('selectRange', ['A10']);
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toBe('=H9^H10');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('5.728852639234935e+242');
            helper.invoke('delete', [9, 9, 'Row']);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toBe('=H9^#REF!');
                expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toBe('#REF!');
                done();
            });
        });
        it('Apply delete with operator "<" and delete the formula value referenced row->', (done: Function) => {
            helper.invoke('selectRange', ['A9']);
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=H8<H9');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('TRUE');
            helper.invoke('delete', [8, 8, 'Row']);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=H8<#REF!');
                expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('#REF!');
                done();
            });
        });
        // it('Checking scientific custom number format value', (done: Function) => {  // scientific custom format issue. needs to fix.
        //     helper.invoke('selectRange', ['K1']);
        //     expect(helper.invoke('getCell', [0, 10]).textContent).toBe('10.0E+0');
        //     expect(helper.getInstance().sheets[0].rows[0].cells[10].format).toBe('##0.0E+0');
        //     done();
        // });
        // it('Apply scientific number format ', (done: Function) => {
        //     helper.getElement('#'+helper.id+'_number_format').click();
        //     helper.getElement('#'+helper.id+'_Scientific').click();
        //     expect(helper.invoke('getCell', [0, 10]).textContent).toBe('1.00E+01');
        //     expect(helper.getInstance().sheets[0].rows[0].cells[10].format).toBe('0.00E+00');
        //     done();
        // });
    });

    describe('EJ2-57075, EJ2-60798, EJ2-962607 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [{
                        rows: [
                            {
                                cells: [
                                    { value: '10' },
                                    { value: '10' },
                                    { formula: '=SUMIF(A1:A2,"10",B1)' },
                                    { value: 'Apple' },
                                    { value: 'Fruit' },
                                    { formula: '=IF(D1="NA",E1,Concat(D1:E1))' },
                                    { formula: '=IF(""=" ","","WO 8012-01-00004")' },
                                    { formula: '=IF(""="","WO 8012-01-00004","")' }
                                ],
                            },
                            { cells: [{ value: '10' }, { value: '10' }] },
                        ],
                    }]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUMIF calculation while criteriaRange is greater than Sum range', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value.toString()).toEqual('20');
            done();
        });
        it('Concat two string inside if formula is not working', (done: Function) => {
            const cell: CellModel = helper.getInstance().sheets[0].rows[0].cells[5];
            expect(cell.value).toBe('AppleFruit');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('AppleFruit');
            helper.edit('D1', 'NA');
            expect(cell.value).toBe('Fruit');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('Fruit');
            done();
        });
        it('IF formula returns incorrect result in Spreadsheet', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[0].cells[6].value).toBe('WO 8012-01-00004');
            expect(spreadsheet.sheets[0].rows[0].cells[6].formula).toBe('=IF(""=" ","","WO 8012-01-00004")');
            expect(spreadsheet.sheets[0].rows[0].cells[7].value).toBe('WO 8012-01-00004');
            expect(spreadsheet.sheets[0].rows[0].cells[7].formula).toBe('=IF(""="","WO 8012-01-00004","")');
            done();
        });
    });

    describe('EJ2-57684 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [{
                        rows: [
                            {
                                cells: [
                                    { value: '10', format: '#,##0.00' },
                                    { value: '10', format: '#,##0.00' },
                                    { formula: '=-(1-(1-ABS(Q21))^12)' },
                                    { formula: '=-(2-(1+3))^12' },
                                    { formula: '=-(1^12)' },
                                ],
                            },
                        ],
                    }],
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Aggregates not calculated properly for custom number formatted values', (done: Function) => {
            helper.invoke('selectRange', ['A1:B1']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Sum: 20.00')
            done();
        });

        it('EJ2-963802 -> Spreadsheet hangs when calculating formulas containing a negative sign combined with the power operators', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[0].cells[2].formula).toBe('=-(1-(1-ABS(Q21))^12)');
            expect(spreadsheet.sheets[0].rows[0].cells[3].formula).toBe('=-(2-(1+3))^12');
            expect(spreadsheet.sheets[0].rows[0].cells[4].formula).toBe('=-(1^12)');
            expect(spreadsheet.sheets[0].rows[0].cells[2].value).toBe('0');
            expect(spreadsheet.sheets[0].rows[0].cells[3].value).toBe('4096');
            expect(spreadsheet.sheets[0].rows[0].cells[4].value).toBe('-1');
            expect(helper.invoke('getCell', [0, 2]).textContent).toBe('0');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('4096');
            expect(helper.invoke('getCell', [0, 4]).textContent).toBe('-1');
            done();
        });
    });

    describe('EJ2-58254, EJ2-59388, EJ2-60324, EJ2-70132 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [
                        {
                            ranges: [{ dataSource: defaultData }]
                        },
                        {
                            rows: [
                                { cells: [{ value: '11' }] },
                                { cells: [{ value: '22' }] },
                                { cells: [{ value: '33' }] },
                                { cells: [{ value: '44' }] },
                                { cells: [{ value: '55' }] }
                            ]
                        }
                    ]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Aggregates not calculated properly for date formatted values', (done: Function) => {
            helper.invoke('selectRange', ['B2:B3']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Sum: 7/27/2128');
            helper.invoke('selectRange', ['C2:C3']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Sum: 5:31:04 PM');
            helper.invoke('selectRange', ['A2:A3']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Count: 2');
            helper.invoke('selectRange', ['D2:D3']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Sum: 30');
            helper.invoke('selectRange', ['A2:B5']);
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Sum: 167296');
            helper.invoke('selectRange', ['B2:B3']);
            helper.getElement('#' + helper.id + '_aggregate').click();
            let Element: NodeListOf<HTMLElement> = document.querySelectorAll("#spreadsheet_aggregate-popup li");
            expect(Element[0].textContent).toBe('Count: 2');
            expect(Element[2].textContent).toBe('Avg: 4/13/2014');
            expect(Element[3].textContent).toBe('Min: 2/14/2014');
            expect(Element[4].textContent).toBe('Max: 6/11/2014');
            Element[0].click();
            expect(helper.getElement('#' + helper.id + '_aggregate').textContent).toBe('Count: 2');
            done();
        });
        it('When using the dollar formula with a single argument, an error occurs', (done: Function) => {
            helper.edit('I2', '=DOLLAR(H2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('$10.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8].value)).toBe('"$10.00"');
            helper.edit('I2', '=DOLLAR(H2,3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('$10.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8].value)).toBe('"$10.000"');
            done();
        });
        it('Sum of decimal numbers with three decimal places is formatted to two decimal places', (done: Function) => {
            helper.edit('J1', '1.001');
            helper.edit('J2', '2.002');
            helper.edit('J3', '=SUM(J1:J2)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('3.003');
            expect(getCell(2, 9, helper.getInstance().sheets[0]).value).toBe('3.003');
            done();
        });
        it('Spreadsheet supported formulas are not working as expected', (done: Function) => {
            helper.edit('K1', '=AVERAGEIF(D2:D4, ">10", E2:E4)');
            helper.edit('K2', '=SUMIF(D2:D4, ">10", E2:E4)');
            helper.edit('M1', '=AVERAGEIF(L2:L11,">10")');
            helper.edit('M2', '=AVERAGEIF(A2:A11,"=100")');
            helper.edit('M3', '=AVERAGEIF(H2:H11, ">200")');
            helper.edit('M4', '=AVERAGEIF(G2:G11, "=test")');
            helper.edit('M5', '=AVERAGEIF(G2:G11, "")');
            helper.edit('M6', '=AVERAGEIF(A2:A11, "=Loafers")');
            helper.edit('M7', '=AVERAGEIF(Sheet1!A1:A5, "")');
            helper.edit('M8', '=AVERAGEIF(Sheet1!A1:A5, "=test")');
            helper.edit('M9', '=AVERAGEIFS(L2:L5,R2:R5,">70",S2:S5,"<90")');
            helper.edit('M10', '=AVERAGEIFS(A2:A5,P2:P5,">70",Q2:Q5,"<90")');
            helper.edit('M11', '=AVERAGEIFS(D2:D5,G2:G5,">5",H2:H5,"<25")');
            helper.edit('M12', '=AVERAGEIFS(D2:D5,G2:G5,"=test",H2:H5,"=test1")');
            helper.edit('M13', '=AVERAGEIFS(D2:D5,G2:G5,"",H2:H5,"")');
            helper.edit('M14', '=AVERAGEIFS(D2:D5,A2:A5,">70",B2:B5,"<90")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('22.5');
            expect(parseFloat(getCell(0, 10, helper.getInstance().sheets[0]).value)).toEqual(22.5);
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('45');
            expect(parseFloat(getCell(1, 10, helper.getInstance().sheets[0]).value)).toEqual(45);
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(0, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(1, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(2, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(3, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(4, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(5, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(6, 12, helper.getInstance().sheets[0]).value).toEqual('#DIV/0!');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(7, 12, helper.getInstance().sheets[0]).value).toEqual('#DIV/0!');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(8, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(9, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(10, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(11, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(12, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#DIV/0!');
            expect(getCell(13, 12, helper.getInstance().sheets[0]).value).toBe('#DIV/0!');
            done();
        });
    });

    describe('EJ2-49597, I327667, EJ2-53137, EJ2-51869, EJ2-51868, EJ2-47753, EJ2-49475, EJ2-56722, EJ2-48147, Ej2-54448, EJ2-68201->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [{ index: 13, cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '4' }] }, { cells: [{}] }, { cells: [{ formula: '=SUM(A14:A17)' }] },
                    { cells: [{}] }, { cells: [{ value: '1' }, { value: '1' }] }, { cells: [{ value: '2' }, { value: '1' }] },
                    { cells: [{ value: '3' }, { value: '1' }] }, { cells: [{ value: '-5' }, { value: '-1' }] },
                    { cells: [{ value: '-6' }, { value: '-1' }] }, { cells: [{ value: '-7' }, { value: '-1' }] },
                    { cells: [{}] }, { cells: [{ value: '1' }, { value: '1.25' }, { value: '1500' }, { formula: '=A28*C28' }, { formula: '=B28*C28' }, { formula: '=E28*A28' }] },
                    { cells: [{ value: '1' }, { value: '' }, { value: '2000' }, { formula: '=A29*C29' }, { formula: '=B28*C29' }, { formula: '=E29*A29' }] },
                    { cells: [{ value: '1' }, { value: '' }, { value: '1750' }, { formula: '=A30*C30' }, { formula: '=B28*C30' }, { formula: '=E30*A30' }] },
                    { cells: [{ index: 5, formula: '=SUM(F21:F30)' }] }
                    ], selectedRange: 'A15'
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EJ2-49597 - Formula dependent cells not updated while clear the value using DELETE key', (done: Function) => {
            helper.triggerKeyNativeEvent(46);
            expect(helper.invoke('getCell', [14, 0]).value).toBeUndefined;
            expect(helper.getInstance().sheets[0].rows[18].cells[0].value).toBe(8);
            done();
        });
        it('I327667 - MATCH function doesnot work properly', (done: Function) => {
            helper.invoke('updateCell', [{ value: 'Jeanette Pamplin' }, 'A12']);
            helper.invoke('updateCell', [{ value: 'Jeanette Pamplin' }, 'H3']);
            helper.invoke('updateCell', [{ formula: '=Match(H3,A2:A30)' }, 'H4']);
            expect(helper.getInstance().sheets[0].rows[3].cells[7].value).toBe(11);
            done();
        });
        it('I327667 - Match formula does not throw error when finding value is not present', (done: Function) => {
            helper.invoke('updateCell', [{ value: 'A' }, 'M1']);
            helper.invoke('updateCell', [{ formula: '=Match(M1,N1:N10)' }, 'M3']);
            expect(helper.getInstance().sheets[0].rows[2].cells[12].value).toBe('#N/A');
            done();
        });
        it('EJ2-53137 - MAX function throws error->', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=MAX(K1,K10)' }, 'I1']);
            expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toBe('=MAX(K1,K10)');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toBe('0');
            done();
        });
        it('EJ2-51869 - Need to avoid rounding decimal values while adding decimal values->', (done: Function) => {
            helper.invoke('selectRange', ['J1:J5']);
            helper.getElement('#' + helper.id + '_number_format').click();
            helper.getElement('#' + helper.id + '_number_format-popup .e-item:nth-child(2)').click();
            helper.invoke('updateCell', [{ value: '100000.50' }, 'J1']);
            helper.invoke('updateCell', [{ value: '1.00' }, 'J2']);
            helper.invoke('updateCell', [{ formula: '=SUM(J1:J2)' }, 'J3']);
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=SUM(J1:J2)');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('100001.5');
            done();
        });
        it('EJ2-51868 - Spreadsheet formula throws #value error->', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=(I3+I7)*-1' }, 'I2']);
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toBe('=(I3+I7)*-1');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toBe('0');
            done();
        });
        it('EJ2-47753 - Dependent cells not updated for loaded JSON using openFromJson method', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('100001.5');
            helper.invoke('refresh');
            setTimeout(() => {
                helper.invoke('selectRange', ['J2']);
                helper.invoke('updateCell', [{ value: '2.00' }, 'J2']);
                expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toBe('100002.5');
                done();
            });
        });
        it('EJ2-49475 - nested IF formula issue in spreadsheet', (done: Function) => {
            helper.invoke('selectRange', ['C21']);
            helper.invoke('updateCell', [{ formula: '=IF(SUMIF(A21:A26,"<0",B21:B26)<0,1,2)' }, 'C21']);
            expect(helper.getInstance().sheets[0].rows[20].cells[2].value).toBe('1');
            helper.invoke('updateCell', [{ value: '13' }, 'D21']);
            helper.invoke('updateCell', [{ formula: '=IF(D1="","None",IF(D1>10,"Pass","Fail"))' }, 'E21']);
            expect(helper.getInstance().sheets[0].rows[20].cells[4].value).toBe('Pass');
            done();
        });
        it('EJ2-68201 - IF formula issue with cell referred with lowerCase value', (done: Function) => {
            helper.edit('D6', 'true');
            helper.edit('F6', 'ONE');
            helper.edit('G6', 'TWO');
            helper.invoke('updateCell', [{ formula: '=IF(D6,F6,G6)' }, 'D10']);
            expect(helper.getInstance().sheets[0].rows[9].cells[3].value).toBe('ONE');
            done();
        });
        it('EJ2-56722 - Cascading cell values does not get updated properly for imported file->', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[30].cells[5].value).toBe('6562.5');
            helper.invoke('updateCell', [{ value: '2' }, 'A29']);
            expect(helper.getInstance().sheets[0].rows[28].cells[3].value).toBe('4000');
            expect(helper.getInstance().sheets[0].rows[28].cells[5].value).toBe('5000');
            expect(helper.getInstance().sheets[0].rows[30].cells[5].value).toBe('9062.5');
            done();
        });
        it('EJ2-48147 - Formula suggestion box not showed for last cells', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.sheets[0].topLeftCell = 'A40'
            spreadsheet.dataBind();
            setTimeout(() => {
                spreadsheet.selectRange('C42');
                spreadsheet.startEdit();
                const editElem: HTMLElement = helper.getCellEditorElement();
                editElem.textContent = '=s';
                helper.triggerKeyEvent('keyup', 83, null, null, null, editElem);
                setTimeout(() => {
                    let popUpElem: HTMLElement = helper.getElement('.e-popup-open .e-dropdownbase');
                    expect(popUpElem.firstElementChild.childElementCount).toBe(10);
                    helper.triggerKeyNativeEvent(13);
                    done();
                });
            });
        });
        it('Ej2-54448 - When data is save as json , values parameter are not available->', (done: Function) => {
            const json: object = {
                Workbook: {
                    sheets: [{
                        rows: [{ cells: [{ value: '1' }] }, { cells: [{ value: '2' }] },
                        { cells: [{ value: '3' }] }, { cells: [{ value: '4' }] }, { cells: [{ value: '5' }] },
                        { index: 84, cells: [{ formula: '=SUM(A1:A5)' }] }]
                    }], selectedRange: 'A85'
                }
            }
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.openFromJson({ file: json });
            setTimeout(() => {
                spreadsheet.sheets[0].topLeftCell = 'A80'
                spreadsheet.dataBind();
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[84].cells[0].value).toBe(15);
                    done();
                });
            });
        });
        it('EJ2-63297 - String concatenation formula not works properly when the formula contains space with string value->', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=A85 & "test"' }, 'A86']);
            const sheet: SheetModel = helper.getInstance().sheets[0];
            expect(sheet.rows[85].cells[0].value).toBe('15test');
            helper.invoke('updateCell', [{ formula: '=A85&"test"' }, 'A87']);
            expect(sheet.rows[86].cells[0].value).toBe('15test');
            helper.invoke('updateCell', [{ formula: '=A85 & " test"' }, 'A88']);
            expect(sheet.rows[87].cells[0].value).toBe('15 test');
            done();
        });
    });

    describe('Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [{ ranges: [{ dataSource: defaultData }], rows: [{ index: 1499, cells: [{ index: 2, formula: '=SUM(D2:D10)' }] }] },
                    { rows: [{ index: 14, cells: [{ index: 3, formula: '=Sheet1!C1500' }] }], }]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('INt formula no Inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=INT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=INT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I1', '=INT(100);');
            done();
        });
        it('INt formula for #Value! Error->', (done: Function) => {
            helper.edit('D2', 'N/A');
            helper.edit('I2', '=INT("D2");');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toBe('=INT("D2");');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('INt formula with Range in ""->', (done: Function) => {
            helper.edit('D2', '11.5');
            helper.edit('I3', '=INT("D2");');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('INt formula with Direct Input Value->', (done: Function) => {
            helper.edit('I4', '=INT(12.5);');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":12,"formula":"=INT(12.5);"}');
            done();
        });
        it('TODAY formula with No Inputs', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=TODAY(C3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=TODAY(C3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I5', '=TODAY();');
            done();
        });
        it('WEEKDAY formula with No Inputs', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=WEEKDAY()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=WEEKDAY()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I6', '=WEEKDAY(B2);');
            done();
        });
        it('WEEKDAY formula', (done: Function) => {
            helper.edit('I7', '=WEEKDAY(B2);');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":6,"formula":"=WEEKDAY(B2);"}');
            done();
        });
        it('PROPER formula with No Inputs', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=PROPER();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=PROPER();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I8', '=PROPER(A4);');
            done();
        });
        it('PROPER formula with #Name Error', (done: Function) => {
            helper.edit('I9', '=PROPER(sync fusion);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"#NAME?","formula":"=PROPER(sync fusion);"}');
            done();
        });
        it('PROPER formula', (done: Function) => {
            helper.edit('I10', '=PROPER(A4);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('Formal Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":"Formal Shoes","formula":"=PROPER(A4);"}');
            done();
        });
        it('PROPER formula with input contains "-"', (done: Function) => {
            helper.edit('I11', '=PROPER(A6);');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('Flip- Flops & Slippers');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"Flip- Flops & Slippers","formula":"=PROPER(A6);"}');
            done();
        });
        it('PROPER formula with input contains ","', (done: Function) => {
            helper.edit('A7', 'S,neakers');
            helper.edit('I12', '=PROPER(A7);');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('S,Neakers');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"S,Neakers","formula":"=PROPER(A7);"}');
            done();
        });
        it('ROUNDUP formula with more than 2 inputs', (done: Function) => {
            helper.edit('J5', '=ROUNDUP(C2,C3,C4);');
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I13');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ROUNDUP(C2,C3,C4);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ROUNDUP(C2,C3,C4);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J5', '=ROUNDUP(12.3445,2);');
            done();
        });
        it('ROUNDUP formula with negative input', (done: Function) => {
            helper.edit('J6', '=ROUNDUP("-0.5");');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toBe('=ROUNDUP("-0.5");');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('-1');
            done();
        });
        it('ROUNDUP formula with 2 Positive inputs', (done: Function) => {
            helper.edit('J7', '=ROUNDUP("0.5","0.5");');
            expect(helper.getInstance().sheets[0].rows[6].cells[9].formula).toBe('=ROUNDUP("0.5","0.5");');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.5');
            done();
        });
        it('ROUNDUP formula with First Negative input and second Positive inputs', (done: Function) => {
            helper.edit('J8', '=ROUNDUP(-0.5,0.5);');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('-0.5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{"value":"-0.5","formula":"=ROUNDUP(-0.5,0.5);"}');
            done();
        });
        it('ROUNDUP formula with having only second Positive input', (done: Function) => {
            helper.edit('J9', '=ROUNDUP(N/A,0.5);');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[9])).toBe('{"value":"#NAME?","formula":"=ROUNDUP(N/A,0.5);"}');
            done();
        });
        it('ROUNDUP formula with having only second Positive input in "" ->', (done: Function) => {
            helper.edit('J10', '=ROUNDUP(N/A,"0.5");');
            expect(helper.getInstance().sheets[0].rows[9].cells[9].formula).toBe('=ROUNDUP(N/A,"0.5");');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('#NAME?');
            done();
        });
        it('ROUNDUP formula with 2 Negative inputs', (done: Function) => {
            helper.edit('J11', '=ROUNDUP(-0.5,-0.5);');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[9])).toBe('{"value":"-1","formula":"=ROUNDUP(-0.5,-0.5);"}');
            done();
        });
        it('ROUNDUP formula with having only second NEgative input', (done: Function) => {
            helper.edit('J12', '=ROUNDUP(N/A,-0.5);');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[9])).toBe('{"value":"#NAME?","formula":"=ROUNDUP(N/A,-0.5);"}');
            done();
        });
        it('ROUNDUP formula with having no first input', (done: Function) => {
            helper.edit('J13', '=ROUNDUP(,0.5);');
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ROUNDUP(,0.5);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ROUNDUP(,0.5);';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getInstance().sheets[0].rows[4].cells[10].value).toBe('0');
            helper.edit('J13', '=ROUNDUP(23.457,1);');
            expect(helper.getInstance().sheets[0].rows[12].cells[9].value).toBe('23.5');
            done();
        });
        it('Calculate sheet', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[1499].cells[2].value).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!C1500')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!C1500')).toBeUndefined();
            helper.invoke('calculateNow');
            expect(spreadsheet.sheets[0].rows[1499].cells[2].value).toBe('228.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!C1500').size).toBe(9);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!C1500').formulaValue).toBe('228.5');
            done();
        });
        it('Calculate workbook', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            expect(spreadsheet.sheets[1].rows[14].cells[3].value).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!1!D15')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!1!D15')).toBeUndefined();
            helper.invoke('calculateNow', ['Workbook']);
            expect(spreadsheet.sheets[1].rows[14].cells[3].value).toBe('228.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!1!D15').size).toBe(1);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!1!D15').formulaValue).toBe('228.5');
            done();
        });
        it('Calculate the formulas in which the dependencies are not added and uncalculated', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            setCell(1, 10, spreadsheet.sheets[0], { formula: '=AVERAGE(E2:E11)', value: '#VALUE!' });
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('#VALUE!');
            helper.invoke('updateCell', [{ value: '40' }, 'E2']);
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('#VALUE!');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!K2')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K2')).toBeUndefined();
            helper.invoke('updateCell', [{ formula: '=K2' }, 'K3']);
            expect(spreadsheet.sheets[0].rows[2].cells[10].value).toBe('#VALUE!');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!K3').size).toBe(1);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K3').formulaValue).toBe('#VALUE!');
            helper.invoke('calculateNow', ['Sheet', 'Sheet1']);
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('19.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!0!K2').size).toBe(10);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K2').formulaValue).toBe('19.5');
            expect(spreadsheet.sheets[0].rows[2].cells[10].value).toBe('19.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K3').formulaValue).toBe('19.5');
            helper.invoke('updateCell', [{ value: '20' }, 'E2']);
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('17.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K2').formulaValue).toBe('17.5');
            expect(spreadsheet.sheets[0].rows[2].cells[10].value).toBe('17.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K3').formulaValue).toBe('17.5');
            setCell(1, 4, spreadsheet.sheets[0], { value: '500' }, true);
            setCell(3, 11, spreadsheet.sheets[0], { formula: '=K2' });
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!L4')).toBeUndefined();
            helper.invoke('calculateNow');
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('65.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K2').formulaValue).toBe('65.5');
            expect(spreadsheet.sheets[0].rows[2].cells[10].value).toBe('65.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!K3').formulaValue).toBe('65.5');
            expect(spreadsheet.sheets[0].rows[3].cells[11].value).toBe('65.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!0!L4').formulaValue).toBe('65.5');
            helper.invoke('updateCell', [{ value: '20' }, 'E2']);
            done();
        });
        it('Calculate non active sheet', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            setCell(3, 10, spreadsheet.sheets[1], { formula: '=AVERAGE(Sheet1!E2:E11)' });
            helper.invoke(
                'insertSheet', [[{
                    index: 2, rows: [{
                        index: 2, hidden: true, cells:
                            [{ index: 2, formula: '=Sheet2!D15+Sheet2!K4', value: null }, { formula: '=ROUND(C3, 0)', value: '200' }]
                    }]
                }]]);
            expect(spreadsheet.sheets[2].rows[2].cells[2].value).toBeNull();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!2!C3')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!2!C3')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!1!K4')).toBeUndefined();
            expect(spreadsheet.sheets[2].rows[2].cells[3].value).toBe('200');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!2!D3')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!2!D3')).toBeUndefined();
            helper.invoke('calculateNow', ['Sheet', 2]);
            expect(spreadsheet.sheets[2].rows[2].cells[2].value).toBe('246');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!2!C3').size).toBe(2);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!2!C3').formulaValue).toBe('246');
            expect(spreadsheet.sheets[1].rows[3].cells[10].value).toBe('17.5');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!1!K4').formulaValue).toBe('17.5');
            expect(spreadsheet.sheets[2].rows[2].cells[3].value).toBe('246');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!2!D3').size).toBe(1);
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!2!D3').formulaValue).toBe('246');
            done();
        });
        it('Calculate formulas from sheets where the data source is not loaded', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.invoke('insertSheet', [3]);
            spreadsheet.setSheetPropertyOnMute(spreadsheet.sheets[3], 'ranges', [{}, { dataSource: defaultData, startCell: 'A2', showFieldAsHeader: false }]);
            setCell(12, 3, spreadsheet.sheets[3], { formula: '=IF(F13, "Number", "Not a number")', value: 'Not a number' });
            setCell(12, 4, spreadsheet.sheets[3], { formula: '=SUM(Sheet5!E2:E11)' });
            setCell(12, 5, spreadsheet.sheets[3], { formula: '=ISNUMBER(D2)' });
            helper.invoke('insertSheet', [4]);
            setCell(12, 0, spreadsheet.sheets[4], { formula: '=CONCAT(A2:A3)' });
            helper.invoke('calculateNow', ['Sheet', 3]).then(() => {
                expect(spreadsheet.sheets[3].rows[12].cells[3].value).toBe('Number');
                expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!D13').formulaValue).toBe('Number');
                expect(spreadsheet.sheets[3].rows[12].cells[4].value).toBe(0);
                expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!3!E13').size).toBe(10);
                expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!E13').formulaValue).toBe(0);
                expect(spreadsheet.sheets[3].rows[12].cells[5].value).toBeTruthy();
                expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!F13').formulaValue).toBeTruthy();
                spreadsheet.setSheetPropertyOnMute(
                    spreadsheet.sheets[4], 'ranges', [{ dataSource: defaultData, startCell: 'A1', showFieldAsHeader: true, info: { loadedRange: [] } }]);
                helper.invoke('calculateNow', ['Workbook']).then(() => {
                    expect(spreadsheet.sheets[4].rows[12].cells[0].value).toBe('Casual ShoesSports Shoes');
                    expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!4!A13').formulaValue).toBe('Casual ShoesSports Shoes');
                    expect(spreadsheet.sheets[3].rows[12].cells[4].value).toBe(175);
                    expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!E13').formulaValue).toBe(175);
                    done();
                });
                expect(spreadsheet.sheets[4].rows[12].cells[0].value).toBeUndefined();
                expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!4!A13')).toBeUndefined();
            });
            expect(spreadsheet.sheets[3].rows[12].cells[3].value).toBe('Not a number');
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!D13')).toBeUndefined();
            expect(spreadsheet.sheets[3].rows[12].cells[4].value).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getDependentFormulaCells().get('!3!E13')).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!E13')).toBeUndefined();
            expect(spreadsheet.sheets[3].rows[12].cells[5].value).toBeUndefined();
            expect(spreadsheet.workbookFormulaModule.calculateInstance.getFormulaInfoTable().get('!3!F13')).toBeUndefined();
        });
    });

    // Others Mixed
    describe('Formula - Checking XI ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TRUNC Formula ->', (done: Function) => {
            helper.edit('I1', '=TRUNC(8.9)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"8","formula":"=TRUNC(8.9)"}');
            done();
        });
        it('TRUNC Formula for Negative Value and Number number of Digits as 0->', (done: Function) => {
            helper.edit('I2', '=TRUNC(-6.5,0)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('-6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"-6","formula":"=TRUNC(-6.5,0)"}');
            done();
        });
        it('TRUNC Formula with Number number of Digits as 3->', (done: Function) => {
            helper.edit('I3', '=TRUNC(3.147895,3)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('3.147');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"3.147","formula":"=TRUNC(3.147895,3)"}');
            done();
        });
        it('TRUNC Formula with cell Reference which contains string->', (done: Function) => {
            helper.edit('I4', '=TRUNC(A5)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(A5)"}');
            done();
        });
        it('TRUNC Formula with more than 2 arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=TRUNC(1.5,2.5,3.5)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=TRUNC(1.5,2.5,3.5)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I5', '=TRUNC(1.5,2)');
            done();
        });
        it('EXP Formula ->', (done: Function) => {
            helper.edit('J1', '=EXP(1)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('2.718281828');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"2.718281828459045","formula":"=EXP(1)"}');
            done();
        });
        it('EXP Formula with no arguments ->', (done: Function) => {
            helper.edit('J2', '=EXP()');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{}');
            done();
        });
        it('EXP Formula for value 709 ->', (done: Function) => {
            helper.edit('J3', '=EXP(709)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":"8.218407461554972e+307","formula":"=EXP(709)"}');
            done();
        });
        it('EXP Formula for value greater than 709 ->', (done: Function) => {
            helper.edit('J4', '=EXP(710)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"#NUM!","formula":"=EXP(710)"}');
            done();
        });
        it('EXP Formula for more than 1 argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EXP(1,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EXP(1,2)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J5', '=EXP(1)');
            done();
        });
        it('EXP Formula with cell Reference which contains alphabets->', (done: Function) => {
            helper.edit('J6', '=EXP(A5)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"#VALUE!","formula":"=EXP(A5)"}');
            done();
        });
        it('GEOMEAN Formula ->', (done: Function) => {
            helper.edit('K1', '=GEOMEAN(1,2)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('1.414213562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"1.4142135623730951","formula":"=GEOMEAN(1,2)"}');
            done();
        });
        it('GEOMEAN Formula with 3 arguments->', (done: Function) => {
            helper.edit('K2', '=GEOMEAN(1,2,3)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1.817120593');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"1.8171205928321397","formula":"=GEOMEAN(1,2,3)"}');
            done();
        });
        it('GEOMEAN Formula with subtract operator->', (done: Function) => {
            helper.edit('K3', '=GEOMEAN(1,2)-1');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0.414213562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"0.4142135623730952","formula":"=GEOMEAN(1,2)-1"}');
            done();
        });
        it('GEOMEAN Formula with negative value in argument 2->', (done: Function) => {
            helper.edit('K4', '=GEOMEAN(5,-1)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NUM!","formula":"=GEOMEAN(5,-1)"}');
            done();
        });
        it('GEOMEAN Formula with negative value in argument 1->', (done: Function) => {
            helper.edit('K5', '=GEOMEAN(-5,1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"#NUM!","formula":"=GEOMEAN(-5,1)"}');
            done();
        });
        it('GEOMEAN Formula with cell reference->', (done: Function) => {
            helper.edit('K6', '=GEOMEAN(D3)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"20","formula":"=GEOMEAN(D3)"}');
            done();
        });
        it('GEOMEAN Formula with cell reference which contains string->', (done: Function) => {
            helper.edit('K7', '=GEOMEAN(D1:D5)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('15.6508458');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"15.650845800732872","formula":"=GEOMEAN(D1:D5)"}');
            done();
        });
        it('GEOMEAN Formula with cell reference which contains negative values->', (done: Function) => {
            helper.edit('F2', '-200');
            helper.edit('K8', '=GEOMEAN(F2:F8)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":"#NUM!","formula":"=GEOMEAN(F2:F8)"}');
            done();
        });
        it('GEOMEAN Formula with no argguments->', (done: Function) => {
            helper.edit('K9', '=GEOMEAN()');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":"1","formula":"=GEOMEAN()"}');
            done();
        });
        it('GEOMEAN Formula with only contains ""->', (done: Function) => {
            helper.edit('K10', '=GEOMEAN("")');
            expect(helper.getInstance().sheets[0].rows[9].cells[10].formula).toBe('=GEOMEAN("")');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#NUM!');
            done();
        });
    });

    describe('EJ2-1002086 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Different error is throwing for the ODD, EVEN and ABS formulas compared to MS Excel', (done: Function) => {
            helper.edit('A15', '#NAME?');
            helper.edit('A16', '#DIV/0!');
            helper.edit('A17', '#REF!');
            helper.edit('C15', '=ODD(A15)');
            helper.edit('C16', '=ODD(A16)');
            helper.edit('C17', '=ODD(A17)');
            expect(helper.invoke('getCell', [14, 2]).textContent).toBe('#NAME?');
            expect(helper.invoke('getCell', [15, 2]).textContent).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [16, 2]).textContent).toBe('#REF!');
            helper.edit('D15', '=EVEN(A15)');
            helper.edit('D16', '=EVEN(A16)');
            helper.edit('D17', '=EVEN(A17)');
            expect(helper.invoke('getCell', [14, 3]).textContent).toBe('#NAME?');
            expect(helper.invoke('getCell', [15, 3]).textContent).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [16, 3]).textContent).toBe('#REF!');
            helper.edit('E15', '=ABS(A15)');
            helper.edit('E16', '=ABS(A16)');
            helper.edit('E17', '=ABS(A17)');
            expect(helper.invoke('getCell', [14, 4]).textContent).toBe('#NAME?');
            expect(helper.invoke('getCell', [15, 4]).textContent).toBe('#DIV/0!');
            expect(helper.invoke('getCell', [16, 4]).textContent).toBe('#REF!');
            done();
        });
    });

    describe('EJ2-915326, EJ2-894946 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different Formats' }] },
                        { cells: [{ index: 8, value: '10' }] }, { cells: [{ index: 8, value: '12', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '11', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: getFormatFromType('Accounting') }] },
                        { cells: [{ index: 8, value: '1', format: 'm/d/yyyy' }] }, { cells: [{ index: 8, value: '1', format: 'dddd, mmmm dd, yyyy' }] },
                        { cells: [{ index: 8, value: '1', format: 'h:mm:ss AM/PM' }] }, { cells: [{ index: 8, value: '15', format: '0%' }] },
                        { cells: [{ index: 8, value: '12', format: '# ?/?' }] }, { cells: [{ index: 8, value: '15', format: '0.0000E+00' }] },
                    ]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Formula results are not working properly when a cells is applied  with currency formats', (done: Function) => {
            helper.invoke('numberFormat', ['0.00E+00', 'D2:D11']);
            helper.invoke('numberFormat', ['0.00%', 'E2:E11']);
            helper.invoke('numberFormat', ['$#,##0.00', 'F2:F11']);
            helper.invoke('numberFormat', ['$#,##0.00', 'J1:J10']);
            helper.invoke('numberFormat', ['0.00', 'K1:K10']);
            helper.edit('J1', '=SUM(B3:B4)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('$83,648.00');
            helper.edit('J2', '=AVERAGE(C3:C4)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('$0.20');
            helper.edit('J3', '=ROUNDDOWN(D3:D4)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('$20.00');
            helper.edit('J4', '=ROUNDUP(E2:E4)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('$20.00');
            helper.edit('J5', '=MOD(F3,1200)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('$600.00');
            done();
        });
        it('Checking number formats applied cells with formula', (done: Function) => {
            helper.edit('K1', '=SUM(B3:B4)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('83648.00');
            helper.edit('K2', '=AVERAGE(C3:C4)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0.20');
            helper.edit('K3', '=ROUNDDOWN(D3:D4)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('20.00');
            helper.edit('K4', '=ROUNDUP(E2:E4)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('20.00');
            helper.edit('K5', '=MOD(F3,1200)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('600.00');
            done();
        });
        it('Format not maintained properly for formula applied cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0.00', 'H1:H7']);
            helper.invoke('numberFormat', ['mm-dd-yyyy', 'I12']);
            helper.edit('I12', '=SUM(H2:H7)');
            let cellEle = helper.invoke('getCell', [11, 8]);
            expect(cellEle.textContent).toBe('10-16-1900');
            helper.edit('I13', '=SUM(H2:H7)');
            cellEle = helper.invoke('getCell', [12, 8]);
            expect(cellEle.textContent).toBe('290.00');
            done();
        });
        it('Checking number format applied cells with different formatted values as arguments in a formula', (done: Function) => {
            helper.invoke('numberFormat', ['#,##0.00', 'J6:J15']);
            helper.edit('J6', '=SUM(I2)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('10.00');
            helper.edit('J7', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('12.00');
            helper.edit('J8', '=ROUNDDOWN(I4,1)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('11.00');
            helper.edit('J9', '=ROUNDUP(I5,1)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('32.00');
            helper.edit('J10', '=MOD(I6,1200)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1.00');
            helper.edit('J11', '=SUM(I7)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('1.00');
            helper.edit('J12', '=AVERAGE(I8)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('1.00');
            helper.edit('J13', '=ROUNDDOWN(I9,1)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('15.00');
            helper.edit('J14', '=ROUNDUP(I10,1)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('12.00');
            helper.edit('J15', '=MOD(I11,1200)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('15.00');
            done();
        });
        it('Checking Currency format applied cells with different formatted values as arguments in a formula', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'K6:K15']);
            helper.edit('K6', '=SUM(I2)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('$10.00');
            helper.edit('K7', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('$12.00');
            helper.edit('K8', '=ROUNDDOWN(I4,1)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('$11.00');
            helper.edit('K9', '=ROUNDUP(I5,1)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('$32.00');
            helper.edit('K10', '=MOD(I6,1200)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('$1.00');
            helper.edit('K11', '=SUM(I7)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('$1.00');
            helper.edit('K12', '=AVERAGE(I8)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('$1.00');
            helper.edit('K13', '=ROUNDDOWN(I9,1)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('$15.00');
            helper.edit('K14', '=ROUNDUP(I10,1)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('$12.00');
            helper.edit('K15', '=MOD(I11,1200)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('$15.00');
            done();
        });
        it('Checking Long Date format applied cells with different formatted values as arguments in a formula', (done: Function) => {
            helper.invoke('numberFormat', ['dddd, mmmm dd, yyyy', 'L1:L10']);
            helper.edit('L1', '=SUM(I2)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('Wednesday, January 10, 1900');
            helper.edit('L2', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('Friday, January 12, 1900');
            helper.edit('L3', '=ROUNDDOWN(I4,1)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('Thursday, January 11, 1900');
            helper.edit('L4', '=ROUNDUP(I5,1)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('Thursday, February 1, 1900');
            helper.edit('L5', '=MOD(I6,1200)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('Monday, January 1, 1900');
            helper.edit('L6', '=SUM(I7)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('Monday, January 1, 1900');
            helper.edit('L7', '=AVERAGE(I8)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('Monday, January 1, 1900');
            helper.edit('L8', '=ROUNDDOWN(I9,1)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('Monday, January 15, 1900');
            helper.edit('L9', '=ROUNDUP(I10,1)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('Friday, January 12, 1900');
            helper.edit('L10', '=MOD(I11,1200)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('Monday, January 15, 1900');
            done();
        });
        it('Checking Time format applied cells with different formatted values as arguments in a formula', (done: Function) => {
            helper.invoke('numberFormat', ['h:mm:ss AM/PM', 'L11:L20']);
            helper.edit('L11', '=SUM(I2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L12', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L13', '=ROUNDDOWN(I4,1)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L14', '=ROUNDUP(I5,1)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L15', '=MOD(I6,1200)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L16', '=SUM(I7)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L17', '=AVERAGE(I8)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L18', '=ROUNDDOWN(I9,1)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L19', '=ROUNDUP(I10,1)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L20', '=MOD(I11,1200)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('12:00:00 AM');
            done();
        });
        it('Checking different format applied cells with Number formatted values as arguments in a formula.', (done: Function) => {
            helper.edit('M1', '=SUM(I3)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('12.00');
            helper.invoke('numberFormat', ['#,##0.00', 'M2']);
            helper.edit('M2', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('12.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'M3']);
            helper.edit('M3', '=ROUNDDOWN(I3,1)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('$12.00');
            helper.invoke('numberFormat', [getFormatFromType('Accounting'), 'M4']);
            helper.edit('M4', '=ROUNDUP(I3,1)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe(' $   12.00 ');
            helper.invoke('numberFormat', ['m/d/yyyy', 'M5']);
            helper.edit('M5', '=MOD(I3,1200)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('1/12/1900');
            helper.invoke('numberFormat', ['dddd, mmmm dd, yyyy', 'M6']);
            helper.edit('M6', '=SUM(I3)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('Friday, January 12, 1900');
            helper.invoke('numberFormat', ['h:mm:ss AM/PM', 'M7']);
            helper.edit('M7', '=AVERAGE(I3)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('12:00:00 AM');
            helper.invoke('numberFormat', ['0%', 'M8']);
            helper.edit('M8', '=ROUNDDOWN(I3,1)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('1200%');
            helper.invoke('numberFormat', ['# ?/?', 'M9']);
            helper.edit('M9', '=ROUNDUP(I3,1)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('12       ');
            helper.invoke('numberFormat', ['0.0000E+00', 'M10']);
            helper.edit('M10', '=MOD(I3,1200)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('1.2000E+01');
            done();
        });
    });

    // Others Mixed
    describe('EJ2-65615-> Row wise', () => {
        const model: SpreadsheetModel = {
            sheets: [{
                rows: [{ cells: [{ value: '1' }, { value: '1' }] }, { cells: [{ value: '2' }, { value: '' }] }, { cells: [{ value: '3' }, { value: '1' }] }, { cells: [{ value: '4' }, { value: '1' }] }, { cells: [{ value: '5' }, { value: '1' }] }]
            }]
        };
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(model, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('COUNT formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=COUNT(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNT(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(5);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=COUNT(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(5);
                helper.edit('A6', '1');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(6);
                done();
            })
        });
        it('COUNTIF formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=COUNTIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=COUNTIF(A1:A5,"=0")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(0);
                helper.edit('A6', '0');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(0);
                done();
            })
        });
        it('COUNTIFS formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=COUNTIFs(A1:A5,"=1",B1:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIFs(A1:A5,"=1",B1:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=COUNTIFs(A1:A5,"=1",B1:B5,"=1")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(1);
                helper.edit('A6', '1');
                helper.edit('B6', '1');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(1);
                done();
            })
        });
        it('SUM function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=SUM(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(15);
                helper.edit('A6', '6');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(21);
                done();
            })
        });
        it('SUMIF function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=SUMIF(A1:A5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIF(A1:A5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=SUMIF(A1:A5,"=1")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(1);
                helper.edit('A6', '1');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(1);
                done();
            })
        });
        it('Nested SUM function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=SUM(A1:A5,SUM(A1:A5))');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5,SUM(A1:A5))');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(30);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=SUM(A1:A5,SUM(A1:A5))');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(30);
                helper.edit('A6', '1');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(30);
                done();
            })
        });
        it('SUMIFS function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=SUMIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=SUMIFS(A1:A5,B1:B5,"=0")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(0);
                helper.edit('A6', '6');
                helper.edit('B2', '0');
                helper.edit('B6', '0');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(2);
                helper.edit('B2', '');
                done();
            })
        });
        it('AVERAGE formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=AVERAGE(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGE(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('3');
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=AVERAGE(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('3');
                helper.edit('A6', '6');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('3.5');
                done();
            })
        });
        it('AVERAGEIF formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A2', '');
            helper.edit('A6', '=AVERAGEIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=AVERAGEIF(A1:A5,"=0")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('#DIV/0!');
                helper.edit('A6', '0');
                helper.edit('A2', '0');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(0);
                helper.edit('A2', '2');
                done();
            })
        });
        it('AVERAGEIFS formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=AVERAGEIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=AVERAGEIFS(A1:A5,B1:B5,"=0")');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('#DIV/0!');
                helper.edit('A6', '6');
                helper.edit('B2', '0');
                helper.edit('B6', '0');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(2);
                helper.edit('B2', '');
                done();
            })
        });
        it('MAX formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=MAX(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MAX(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('5');
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=MAX(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('5');
                helper.edit('A6', '6');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('6');
                done();
            })
        });
        it('MIN formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('A6', '=MIN(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MIN(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('1');
            helper.invoke('insertRow', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=MIN(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('1');
                helper.edit('A6', '0');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual('0');
                done();
            })
        });
        it('Using wrong address in formula argument does not throws any error', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'defName', refersTo: '=Sheet1!A4:A5' });
            helper.edit('A6', '=COUNT(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNT(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(5);
            helper.edit('A6', '=COUNT(1A:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNT(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(5);
            helper.edit('A6', '=COUNT($1$A:$A$5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNT($A$1:$A$5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(5);
            helper.edit('A6', '=COUNTIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=COUNTIF(A1:5A,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=COUNTIFs(A1:A5,"=1",B1:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIFs(A1:A5,"=1",B1:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=COUNTIFS(A1:A5,"=1",1B:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIFS(A1:A5,"=1",B1:B5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=COUNTIFS($A$1:$A$5,"=1",$1$B:$B$5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=COUNTIFS($A$1:$A$5,"=1",$B$1:$B$5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUM($A$1:$A$5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM($A$1:$A$5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM(1A:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUMIF(A1:A5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIF(A1:A5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUMIF(A1:5A,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIF(A1:A5,"=1")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUMIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=SUMIFS(A1:A5,B1:5B,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=AVERAGE(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGE(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('3');
            helper.edit('A6', '=AVERAGE(1A:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGE(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('3');
            helper.edit('A6', '=AVERAGEIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.edit('A6', '=AVERAGEIF(A1:5A,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIF(A1:A5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.edit('A6', '=AVERAGEIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.edit('A6', '=AVERAGEIFS(A1:5A,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=AVERAGEIFS(A1:A5,B1:B5,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('#DIV/0!');
            helper.edit('A6', '=MAX(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MAX(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('5');
            helper.edit('A6', '=MAX(1A:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MAX(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('5');
            helper.edit('A6', '=MIN(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MIN(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('1');
            helper.edit('A6', '=MIN(A1:5A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=MIN(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('1');
            helper.edit('A6', '=SUM(1A:A3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM(1A,A2,3A,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1,A2,A3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM($A$1:$A$3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM($A$1:$A$3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM($1$A:$3$A,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM($A$1:$A$3,defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUMIFS($4$B:$B$5,defName,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS($B$4:$B$5,defName,"=0")');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=IF(1A=1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=IF(A1=1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('TRUE');
            helper.edit('A6', '=IF(1A>1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=IF(A1>1,TRUE,FALSE)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('FALSE');
            helper.edit('A6', '=A1+2A');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=A1+A2');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('3');
            helper.edit('A6', '=(1A*A2)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=(A1*A2)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('2');
            helper.edit('A6', '=(A1>2A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=(A1>A2)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('FALSE');
            helper.edit('A6', '=(A1>=2A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=(A1>=A2)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('FALSE');
            helper.edit('A6', '=TIME(A1,2A,A3)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=TIME(A1,A2,A3)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('0.043090277777777776');
            helper.edit('A6', '=DATE(1A,A2,3A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=DATE(A1,A2,A3)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual('400');
            helper.edit('A6', '=UNIQUE()');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toBeUndefined();
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBeUndefined();
            helper.edit('A6', '=SUM()');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toBeUndefined();
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBeUndefined();
            helper.edit('A6', '=SUM(1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUM(1,2,3)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(1,2,3)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(6);
            helper.edit('A6', '=SUM(A1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUM(1A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(1);
            helper.edit('A6', '=SUM(A1,A2,A3,A4)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1,A2,A3,A4)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(10);
            helper.edit('A6', '=SUM(1A,A2,3A,A4)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1,A2,A3,A4)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(10);
            helper.edit('A6', '=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM(1A:5A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            helper.edit('A6', '=SUM(A1:A5,B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5,B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(19);
            helper.edit('A6', '=SUM(1A:A5,B1:5B)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5,B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(19);
            helper.edit('A6', '=SUM(defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(defName)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(9);
            helper.edit('A6', '=SUM(1A,A2:3A,defName,B1,3B:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1,A2:A3,defName,B1,B3:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(19);
            helper.edit('A6', '=SUMIFS(A1:A2,A3:A4,">"&1B)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A2,A3:A4,">"&B1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(3);
            helper.edit('A6', '=SUMIFS(A1:A2,A3:A4,"<"&1B)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A2,A3:A4,"<"&B1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=SUMIFS(A1:A2,A3:A4,">="&1B)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A2,A3:A4,">="&B1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(3);
            helper.edit('A6', '=SUMIFS(A1:A2,A3:A4,"<="&1B)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUMIFS(A1:A2,A3:A4,"<="&B1)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(0);
            helper.edit('A6', '=SUM(1A: 5A)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(15);
            done();
        });
        it('Invalid formula range alert dialog check->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('A7');
            spreadsheet.editModule.startEdit();
            spreadsheet.editModule.editCellData.value = '=SUMIFS(1A:2A,3A:A4,">"&1B)';
            spreadsheet.editModule.endEdit();
            const cellSave: Function = spreadsheet.cellSave;
            spreadsheet.cellSave = (args: CellSaveEventArgs): void => {
                expect(args.value).toBe('=SUMIFS(A1:A2,A3:A4,">"&B1)');
                expect(args.displayText).toBe('3');
                spreadsheet.cellSave = cellSave;
            };
            setTimeout((): void => {
                expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe(
                    'We found a typo in your cell reference. Do you want to correct this reference as follows?=SUMIFS(A1:A2,A3:A4,">"&B1)');
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                helper.click('.e-validation-error-dlg.e-dialog .e-footer-content .e-btn:not(.e-primary)');
                expect(spreadsheet.isEdit).toBeTruthy();
                spreadsheet.editModule.editCellData.value = '=SUMIFS(1A:2A,3A:A4,">"&1B)';
                spreadsheet.editModule.endEdit();
                setTimeout((): void => {
                    helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                    helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
                    expect(spreadsheet.sheets[0].rows[6].cells[0].formula).toEqual('=SUMIFS(A1:A2,A3:A4,">"&B1)');
                    expect(spreadsheet.sheets[0].rows[6].cells[0].value).toEqual(3);
                    done();
                });
            });
        });
        it('Simple invalid formula range alert dialog check->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('A7');
            spreadsheet.editModule.startEdit();
            spreadsheet.editModule.editCellData.value = '=SUM(A1,2A,3A,4A)';
            spreadsheet.editModule.endEdit();
            setTimeout((): void => {
                expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').innerHTML).toBe(
                    'We found a typo in your cell reference. Do you want to correct this reference as follows?<br>=SUM(A1,A2,A3,A4)');
                helper.setAnimationToNone('.e-validation-error-dlg.e-dialog');
                helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
                expect(spreadsheet.sheets[0].rows[6].cells[0].formula).toEqual('=SUM(A1,A2,A3,A4)');
                expect(spreadsheet.sheets[0].rows[6].cells[0].value).toEqual(10);
                done();
            });
        });
    });

    describe('EJ2-65615-> Column wise ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ rows: [{ cells: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }] }, { cells: [{ value: '1' }, { value: '' }, { value: '1' }, { value: '1' }, { value: '1' }] }] }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('COUNT formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=COUNT(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=COUNT(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(5);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=COUNT(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(5);
                helper.edit('F1', '1');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(6);
                done();
            })
        });
        it('COUNTIF formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=COUNTIF(A1:E1,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=COUNTIF(A1:E1,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(0);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=COUNTIF(A1:E1,"=0")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(0);
                helper.edit('F1', '0');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(0);
                done();
            })
        });
        it('COUNTIFS formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=COUNTIFS(A1:E1,"=1",A2:E2,"=1")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=COUNTIFS(A1:E1,"=1",A2:E2,"=1")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(1);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=COUNTIFS(A1:E1,"=1",A2:E2,"=1")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(1);
                helper.edit('F1', '1');
                helper.edit('F2', '1');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(1);
                done();
            })
        });
        it('SUM function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=SUM(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUM(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(15);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUM(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(15);
                helper.edit('F1', '6');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(21);
                done();
            })
        });
        it('SUMIF function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=SUMIF(A1:E1,"=1")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUMIF(A1:E1,"=1")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(1);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUMIF(A1:E1,"=1")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(1);
                helper.edit('F1', '1');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(1);
                done();
            })
        });
        it('Nested SUM function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=SUM(A1:E1,SUM(A1:E1))');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUM(A1:E1,SUM(A1:E1))');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(30);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUM(A1:E1,SUM(A1:E1))');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(30);
                helper.edit('F1', '1');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(30);
                done();
            })
        });
        it('SUMIFS function is not value updated properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=SUMIFS(A1:E1,A2:E2,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUMIFS(A1:E1,A2:E2,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(0);
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUMIFS(A1:E1,A2:E2,"=0")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(0);
                helper.edit('F1', '6');
                helper.edit('B2', '0');
                helper.edit('F2', '0');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(2);
                helper.edit('B2', '');
                done();
            })
        });
        it('AVERAGE formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=AVERAGE(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=AVERAGE(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('3');
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=AVERAGE(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('3');
                helper.edit('F1', '6');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('3.5');
                done();
            })
        });
        it('AVERAGEIF formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('B1', '');
            helper.edit('F1', '=AVERAGEIF(A1:E1,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=AVERAGEIF(A1:E1,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('#DIV/0!');
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=AVERAGEIF(A1:E1,"=0")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('#DIV/0!');
                helper.edit('F1', '0');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('#DIV/0!');
                helper.edit('B1', '2');
                done();
            })
        });
        it('AVERAGEIFS formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=AVERAGEIFS(A1:E1,A2:E2,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=AVERAGEIFS(A1:E1,A2:E2,"=0")');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('#DIV/0!');
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=AVERAGEIFS(A1:E1,A2:E2,"=0")');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('#DIV/0!');
                helper.edit('F1', '6');
                helper.edit('B2', '0');
                helper.edit('F2', '0');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(2);
                helper.edit('B2', '');
                done();
            })
        });
        it('MAX formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=MAX(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=MAX(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('5');
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=MAX(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('5');
                helper.edit('F1', '6');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('6');
                done();
            })
        });
        it('MIN formula is not updated value properly while the new insert and update the value', (done: Function) => {
            helper.edit('F1', '=MIN(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=MIN(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual('1');
            helper.invoke('insertColumn', [5]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=MIN(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('1');
                helper.edit('F1', '0');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual('0');
                done();
            })
        });
    });

    describe('EJ2-64655, EJ2-66218 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ id: 200, rows: [{ cells: [{ value: '179.75' }] }, { cells: [{ value: '179.725' }] }, { cells: [{ value: '179.7235' }] }, { cells: [{ value: '179.22345' }] }, { cells: [{ value: '179.323455' }] }, { cells: [{ value: '179.8234505' }] }, { cells: [{ value: '-179.725' }] }] }, {}] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Rounding formula not works properly when the last digit contains 5', (done: Function) => {
            helper.edit('B1', '=round(A1, 1)');
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('179.8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[1])).toBe('{"value":"179.8","formula":"=round(A1, 1)"}');
            helper.edit('B2', '=round(A2, 2)');
            expect(helper.invoke('getCell', [1, 1]).textContent).toBe('179.73');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[1])).toBe('{"value":"179.73","formula":"=round(A2, 2)"}');
            helper.edit('B3', '=round(A3, 3)');
            expect(helper.invoke('getCell', [2, 1]).textContent).toBe('179.724');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[1])).toBe('{"value":"179.724","formula":"=round(A3, 3)"}');
            helper.edit('B4', '=round(A4, 4)');
            expect(helper.invoke('getCell', [3, 1]).textContent).toBe('179.2235');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[1])).toBe('{"value":"179.2235","formula":"=round(A4, 4)"}');
            helper.edit('B5', '=round(A5, 5)');
            expect(helper.invoke('getCell', [4, 1]).textContent).toBe('179.32346');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[1])).toBe('{"value":"179.32346","formula":"=round(A5, 5)"}');
            helper.edit('B6', '=round(A6, 6)');
            expect(helper.invoke('getCell', [5, 1]).textContent).toBe('179.823451');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[1])).toBe('{"value":"179.823451","formula":"=round(A6, 6)"}');
            helper.edit('B7', '=round(A7, 2)');
            expect(helper.invoke('getCell', [6, 1]).textContent).toBe('-179.73');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[1])).toBe('{"value":"-179.73","formula":"=round(A7, 2)"}');
            done();
        });
        it('Cell delete on UNIQUE formula which has spill error', (done: Function) => {
            helper.invoke('updateCell', [{ formula: '=UNIQUE(B1:B7)' }, 'D1']);
            const sheet: SheetModel = helper.getInstance().sheets[0];
            expect(sheet.rows[0].cells[3].value).toBe('179.8');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('179.8');
            expect(sheet.rows[1].cells[3].value).toBe('179.73');
            expect(helper.invoke('getCell', [1, 3]).textContent).toBe('179.73');
            expect(sheet.rows[5].cells[3].value).toBe('179.823451');
            expect(helper.invoke('getCell', [5, 3]).textContent).toBe('179.823451');
            helper.edit('D3', 'Changed');
            expect(sheet.rows[0].cells[3].value).toBe('#SPILL!');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('#SPILL!');
            expect(sheet.rows[2].cells[3].value).toBe('Changed');
            expect(helper.invoke('getCell', [2, 3]).textContent).toBe('Changed');
            expect(sheet.rows[5].cells[3].value).toBe('');
            expect(helper.invoke('getCell', [5, 3]).textContent).toBe('');
            helper.invoke('selectRange', ['D1']);
            helper.triggerKeyNativeEvent(46);
            expect(sheet.rows[0].cells[3].value).toBe('');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('');
            done();
        });
    });

    describe('EJ2-63727 ->', () => {
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [
                    {
                        rows: [
                            { cells: [{ value: 'Residential' }, { value: '11' }] },
                            { cells: [{ value: '22', index: 1 }] },
                            { cells: [{ value: 'Residential' }, { value: '33' }] },
                            { cells: [{ value: 'New-Residential' }, { formula: '=SUM(B2:B3)' }] },
                            { index: 5, cells: [{ value: '10' }, { value: 'Residential' }] },
                            { cells: [{ value: '20' }, { value: 'Residential' }] },
                            { cells: [{ value: '30' }, { value: 'Residential' }] },
                            { cells: [{ value: '40' }, { value: 'New-Residential' }] },
                            { cells: [{ index: 5, value: '11' }, { value: '1' }] },
                            { cells: [{ index: 1, value: 'Residential' }, { value: 'New-Residential' }, { index: 5, value: '22' }, { value: '2' }] },
                            { cells: [{ index: 1, value: 'Residential' }, { value: 'New-Residential' }, { index: 5, value: '33' }, { value: '3' }] },
                            { cells: [{ index: 1, value: 'New-Residential' }, { value: 'Residential' }, { index: 5, value: '44' }, { value: '4' }] },
                            { cells: [{ index: 1, value: 'New-Residential' }, { value: 'Residential' }, { value: 'Residential' }, { value: 'New-Residential' }] },
                            { cells: [{ index: 3, value: 'New-Residential' }, { value: 'Residential' }] },
                            { cells: [{ index: 3, value: 'Residential' }, { value: 'New-Residential' }] },
                            { cells: [{ index: 3, value: 'New-Residential' }, { value: 'Residential' }] }
                        ]
                    },
                    {
                        rows: [
                            { cells: [{ value: 'Residential' }, { value: '1' }] },
                            { cells: [{ value: 'Residential' }, { value: '2' }] },
                            { cells: [{ value: 'Residential' }, { value: '3' }] },
                            { cells: [{ value: 'New-Residential' }, { value: '4' }] }
                        ]
                    },
                    {
                        rows: [
                            { cells: [{ value: 'Residential' }, { value: '111' }] },
                            { cells: [{ value: 'Residential' }, { value: '222' }] },
                            { cells: [{ value: 'Residential' }, { value: '333' }] },
                            { cells: [{ value: 'New-Residential' }, { value: '444' }] }
                        ]
                    }
                ]
            }, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('Formula ( =SUMIFS ) not working as expected when referring values in other sheets', (done: Function) => {
            helper.edit('D1', '=SUMIFS(B1:B3,A1:A3,"=Residential")');
            helper.edit('E1', '=SUMIFS(Sheet2!B1:B3,Sheet2!A1:A3,"=Residential")');
            helper.edit('F1', '=SUMIFS(Sheet3!B1:B3,Sheet2!A1:A3,"=Residential")');
            helper.edit('G1', '=SUMIFS(B1:B3,Sheet2!A1:A3,"=Residential")');
            helper.edit('H1', '=SUMIFS(Sheet3!B1:B3,A1:A3,"=Residential")');
            helper.edit('D2', '=SUMIFS(B1:B4,A1:A4,"New-Residential")');
            helper.edit('E2', '=SUMIFS(Sheet2!B1:B4,Sheet3!B1:B4,"<=333")');
            helper.edit('F2', '=SUMIFS(Sheet2!B1:B4,Sheet3!B1:B4,">=333")');
            helper.edit('G2', '=SUMIFS(B1:B4,A1:A4,"=")');
            helper.edit('H2', '=SUMIFS(B1:B4,A1:A4,"<>")');
            helper.edit('D3', '=SUMIFS(A6:A9,Sheet2!A1:A4,Sheet2!A4,Sheet3!A1:A4,Sheet3!A4)');
            helper.edit('E3', '=SUMIFS(A6:A9,Sheet2!A1:A4,Sheet2!A3,Sheet3!A1:A4,Sheet3!A3)');
            helper.edit('F3', '=SUMIFS(Sheet3!B1:B4,Sheet2!A1:A4,Sheet2!A4,A1:A4,A4)');
            helper.edit('G3', '=SUMIFS(Sheet2!B1:B4,A1:A4,A1,Sheet3!A1:A4,Sheet3!A1)');
            helper.edit('H3', '=SUMIFS(A6:A9,A1:A4,A1)');
            helper.edit('D4', '=SUMIFS(B1:B4,A6:A9,SUM(H3:I3))');
            helper.edit('E4', '=SUMIFS(F10:G13,Sheet2!A1:B4,"=R*")');
            helper.edit('F4', '=SUMIFS(F10:G13,B11:C14,B11,D14:E17,"=N*")');
            helper.edit('G4', '=SUMIFS(Sheet3!B1:C4,B11:C14,B11)');
            helper.edit('I10', '=SUMIFS(F10:G13,B11:C14,C11)');
            helper.edit('J10', '=SUMIFS(F10:G13,B11:C14,B11)');
            helper.edit('k10', '=SUMIFS(F10:G13,B11:C14,C11,D14:E17,E14)');
            helper.edit('L10', '=SUMIFS(F10:G13,B11:C14,B14,D14:E17,D14)');
            helper.edit('I11', '=AVERAGEIFS(B1:B4,A1:A4,"New-Residential")');
            helper.edit('J11', '=AVERAGEIFS(Sheet2!B1:B4,Sheet3!B1:B4,"<=333")');
            helper.edit('k11', '=AVERAGEIFS(Sheet2!B1:B4,Sheet3!B1:B4,">=333")');
            helper.edit('L11', '=AVERAGEIFS(B1:B4,A1:A4,"=")');
            helper.edit('M11', '=AVERAGEIFS(B1:B4,A1:A4,"<>")');
            helper.edit('I12', '=AVERAGEIFS(A6:A9,Sheet2!A1:A4,Sheet2!A4,Sheet3!A1:A4,Sheet3!A4)');
            helper.edit('J12', '=AVERAGEIFS(A6:A9,Sheet2!A1:A4,Sheet2!A3,Sheet3!A1:A4,Sheet3!A3)');
            helper.edit('k12', '=AVERAGEIFS(Sheet3!B1:B4,Sheet2!A1:A4,Sheet2!A4,A1:A4,A4)');
            helper.edit('L12', '=AVERAGEIFS(Sheet2!B1:B4,A1:A4,A1,Sheet3!A1:A4,Sheet3!A1)');
            helper.edit('M12', '=AVERAGEIFS(A6:A9,A1:A4,A1)');
            helper.edit('I13', '=COUNTIFS(A1:A4,"New-Residential")');
            helper.edit('J13', '=COUNTIFS(Sheet3!B1:B4,"<=333")');
            helper.edit('k13', '=COUNTIFS(Sheet3!B1:B4,">=333")');
            helper.edit('L13', '=COUNTIFS(A1:A4,"=")');
            helper.edit('M13', '=COUNTIFS(A1:A4,"<>")');
            helper.edit('I14', '=COUNTIFS(Sheet2!A1:A4,Sheet2!A4,Sheet3!A1:A4,Sheet3!A4)');
            helper.edit('J14', '=COUNTIFS(Sheet2!A1:A4,Sheet2!A3,Sheet3!A1:A4,Sheet3!A3)');
            helper.edit('k14', '=COUNTIFS(Sheet2!A1:A4,Sheet2!A4,A1:A4,A4)');
            helper.edit('L14', '=COUNTIFS(A1:A4,A1,Sheet3!A1:A4,Sheet3!A1)');
            helper.edit('M14', '=COUNTIFS(B11:C14,B11,D14:E17,D15)');
            helper.edit('I15', '=AVERAGEIFS(F10:G13,Sheet2!A1:B4,"=R*")');
            helper.edit('J15', '=AVERAGEIFS(F10:G13,B11:C14,B11,D14:E17,"=N*")');
            helper.edit('k15', '=AVERAGEIFS(Sheet3!B1:C4,B11:C14,B11)');
            helper.edit('I16', '=COUNTIFS(Sheet2!A1:B4,"=R*")');
            helper.edit('J16', '=COUNTIFS(B11:C14,B11,D14:E17,"=N*")');
            helper.edit('k16', '=COUNTIFS(Sheet3!A1:B4,"=R*")');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('44');
            expect(helper.invoke('getCell', [0, 4]).textContent).toBe('6');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('666');
            expect(helper.invoke('getCell', [0, 6]).textContent).toBe('66');
            expect(helper.invoke('getCell', [0, 7]).textContent).toBe('444');
            expect(helper.invoke('getCell', [1, 3]).textContent).toBe('55');
            expect(helper.invoke('getCell', [1, 4]).textContent).toBe('6');
            expect(helper.invoke('getCell', [1, 5]).textContent).toBe('7');
            expect(helper.invoke('getCell', [1, 6]).textContent).toBe('22');
            expect(helper.invoke('getCell', [1, 7]).textContent).toBe('99');
            expect(helper.invoke('getCell', [2, 3]).textContent).toBe('40');
            expect(helper.invoke('getCell', [2, 4]).textContent).toBe('60');
            expect(helper.invoke('getCell', [2, 5]).textContent).toBe('444');
            expect(helper.invoke('getCell', [2, 6]).textContent).toBe('4');
            expect(helper.invoke('getCell', [2, 7]).textContent).toBe('40');
            expect(helper.invoke('getCell', [3, 3]).textContent).toBe('55');
            expect(helper.invoke('getCell', [3, 4]).textContent).toBe('66');
            expect(helper.invoke('getCell', [3, 5]).textContent).toBe('25');
            expect(helper.invoke('getCell', [3, 6]).textContent).toBe('333');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('80');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('40');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('45');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('35');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('55');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('2');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('3.5');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('22');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('33');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('40');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('444');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('2');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('20');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('1');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('3');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('2');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('1');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('3');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('1');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('3');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('1');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('2');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('2');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('22');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('12.5');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('166.5');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('3');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('2');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('3');
            done();
        });
    });

    describe('EJ2-46382->', () => {
        const model: SpreadsheetModel = {
            sheets: [{
                rows: [{ cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '3' }] }, {
                    cells:
                        [{ value: '4' }]
                }, { cells: [{ value: '5' }] }, { cells: [{ formula: '=SUM(A1:A5)' }] }], selectedRange: 'A5'
            }]
        };
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet(model, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('Formula dependent cells not updated after destroy the spreadsheet', (done: Function) => {
            helper.invoke('updateCell', [{ value: 'Formula' }, 'B1']);
            helper.invoke('destroy');
            setTimeout(() => {
                new Spreadsheet(model, '#' + helper.id);
                setTimeout(() => {
                    helper.invoke('updateCell', [{ value: '10' }, 'A5']);
                    expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toBe(20);
                    expect(helper.invoke('getCell', [0, 2]).textContent).toBe('');
                    done();
                });
            });
        });
        it('Spreadsheet getting hanged while inserting SMALL formula that refers empty valued cells', (done: Function) => {
            helper.edit('D1', '=SMALL(A1:A10,5)');
            expect(helper.getInstance().sheets[0].rows[0].cells[3].formula).toBe('=SMALL(A1:A10,5)');
            expect(helper.getInstance().sheets[0].rows[0].cells[3].value).toBe(5);
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('5');
            helper.edit('A7', 'text1');
            helper.edit('A8', 'text2');
            helper.edit('A11', '0');
            helper.edit('A12', '');
            helper.edit('D2', '=SMALL(A6:A12,1)');
            expect(helper.getInstance().sheets[0].rows[1].cells[3].formula).toBe('=SMALL(A6:A12,1)');
            expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toBe(0);
            expect(helper.invoke('getCell', [1, 3]).textContent).toBe('0');
            done();
        });
    });
    describe('EJ2-1027313: Custom function executes twice when a formula cell is copy-pasted in Spreadsheet', () => {
        let count: number = 0;
        beforeAll((done: Function) => {
            const isBlank = (val: string) => {
                count++;
                if (val) {
                    return "TRUE"
                }
                else {
                    return "FALSE"
                }
            };
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                created: (): void => {
                    const spreadsheet: Spreadsheet = helper.getInstance();
                    spreadsheet.addCustomFunction(isBlank, 'ISBLANK');
                    spreadsheet.updateCell({ value: "=ISBLANK(12)" }, 'A5')
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Custom function should be executed only once for a formula', (done: Function) => {
            expect(count).toBe(1);
            const sheet: SheetModel = helper.getInstance().sheets[0];
            helper.invoke('copy', ['A5']).then(() => {
                helper.invoke('paste', ['A13']);
                expect(sheet.rows[12].cells[0].formula).toBe('=ISBLANK(12)');
                expect(sheet.rows[12].cells[0].value).toBe('TRUE');
                expect(count).toBe(2);
                done();
            });
        });
    });
});
