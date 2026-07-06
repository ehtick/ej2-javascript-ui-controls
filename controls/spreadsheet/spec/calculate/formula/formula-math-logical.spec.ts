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

    // Math & Trig Category Formulas
    describe('SUM Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Decimals' }] }, { cells: [{ index: 8, value: '102.32' }] },
                        { cells: [{ index: 8, value: '105.43' }] }, { cells: [{ index: 8, value: '103.23' }] },
                        { cells: [{ index: 8, value: '1002.2323' }] }, { cells: [{ index: 8, value: '1023.3219' }] },
                        { cells: [{ index: 8, value: '1022.4567' }] }, { cells: [{ index: 8, value: '320.12354' }] },
                        { cells: [{ index: 8, value: '102.45674' }] }, { cells: [{ index: 8, value: '103.32321' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: '-3221' }] }, { cells: [{ index: 8, value: '-1253' }] },
                        { cells: [{ index: 8, value: '0' }] }, { cells: [{ index: 8, value: '119', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '321', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12.56', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '2', format: '0%' }] },
                        { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '12' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '76' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '93' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'ABC' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUM Formula with ranged cell references values as arguments->', (done: Function) => {
            helper.edit('J1', '=SUM(A2:A10)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            helper.edit('J2', '=SUM(B3:B10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('6/28/2816');
            helper.edit('J3', '=SUM(C3:C8)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('7:17:36 AM');
            helper.edit('J4', '=SUM(D2:D11)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('277');
            helper.edit('J5', '=SUM(I2:I6)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2336.5342');
            helper.edit('J6', '=SUM(I6:I10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('2571.68209');
            helper.edit('J7', '=SUM(I19:I21)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-4474');
            helper.edit('J8', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('$131.56');
            helper.edit('J9', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('2.9000E+01');
            helper.edit('J10', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('11700%');
            helper.edit('J11', '=SUM(I13:I16)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0');
            helper.edit('J12', '=SUM(I13:I29)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('-3756.44');
            done();
        });
        it('SUM Formula with single cell references values as arguments->', (done: Function) => {
            helper.edit('J13', '=SUM(I21)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('0');
            helper.edit('J14', '=SUM(F3)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('600');
            helper.edit('J15', '=SUM(C13)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('0');
            helper.edit('J16', '=SUM(D3,E7,I4,I20,F9)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('-799.77');
            helper.edit('J17', '=SUM(A6:A8,D7,F6,G10)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('352');
            helper.edit('J18', '=SUM(I21,G2,A8:A11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('1');
            helper.edit('J19', '=SUM(E7,I11,E10,C6,A10)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('SUM Formula with different format arguments as input in General formatted cells ->', (done: Function) => {
            helper.edit('K1', '=SUM(E2:E11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('175');
            helper.edit('K2', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2.9000E+01');
            helper.edit('K3', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('$131.56');
            helper.edit('K4', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('11700%');
            helper.edit('K5', '=SUM(I2:I10)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('3884.89439');
            done();
        });
        it('SUM Formula with different format arguments as input in Currency formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'K6']);
            helper.edit('K6', '=SUM(E2:E11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('$175.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'K7']);
            helper.edit('K7', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('$29.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'K8']);
            helper.edit('K8', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('$131.56');
            helper.invoke('numberFormat', ['$#,##0.00', 'K9']);
            helper.edit('K9', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('$117.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'K10']);
            helper.edit('K10', '=SUM(I2:I10)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('$3,884.89');
            done();
        });
        it('SUM Formula with different format arguments as input in Percentage formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0%', 'K11']);
            helper.edit('K11', '=SUM(E2:E11)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('17500%');
            helper.invoke('numberFormat', ['0%', 'K12']);
            helper.edit('K12', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('2.9000E+01');
            helper.invoke('numberFormat', ['0%', 'K13']);
            helper.edit('K13', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('$131.56');
            helper.invoke('numberFormat', ['0%', 'K14']);
            helper.edit('K14', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('11700%');
            helper.invoke('numberFormat', ['0%', 'K15']);
            helper.edit('K15', '=SUM(I2:I10)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('388489%');
            done();
        });
        it('SUM Formula with different format arguments as input in Scientific formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0.0000E+00', 'K16']);
            helper.edit('K16', '=SUM(E2:E11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('1.7500E+02');
            helper.invoke('numberFormat', ['0.0000E+00', 'K17']);
            helper.edit('K17', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('2.9000E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K18']);
            helper.edit('K18', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('$131.56');
            helper.invoke('numberFormat', ['0.0000E+00', 'K19']);
            helper.edit('K19', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('11700%');
            helper.invoke('numberFormat', ['0.0000E+00', 'K20']);
            helper.edit('K20', '=SUM(I2:I10)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('3.8849E+03');
            done();
        });
        it('SUM Formula with different format arguments as input in Number formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['#,##0.00', 'K21']);
            helper.edit('K21', '=SUM(E2:E11)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('175.00');
            helper.invoke('numberFormat', ['#,##0.00', 'K22']);
            helper.edit('K22', '=SUM(I26:I27)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('29.00');
            helper.invoke('numberFormat', ['#,##0.00', 'K23']);
            helper.edit('K23', '=SUM(I24:I25)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('131.56');
            helper.invoke('numberFormat', ['#,##0.00', 'K24']);
            helper.edit('K24', '=SUM(I28:I29)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('117.00');
            helper.invoke('numberFormat', ['#,##0.00', 'K25']);
            helper.edit('K25', '=SUM(I2:I10)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('3,884.89');
            done();
        });
        it('SUM Formula with list of different arguments as input->', (done: Function) => {
            helper.edit('L1', '=SUM(D2:D11,E7,G7,42,"2")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('354');
            helper.edit('L2', '=SUM(D2:D11,E11,G2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('288');
            helper.edit('L3', '=SUM(1,3,4,"a")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#VALUE!');
            helper.edit('L4', '=SUM("1","323",F9:F10,"Hi123","123Hi","H123i")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            helper.edit('L5', '=SUM("HI123",123,"123HI")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            helper.edit('L6', '=SUM("1")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('1');
            done();
        });
        it('SUM Formula with logical value as argument->', (done: Function) => {
            helper.edit('L7', '=SUM(1,3,"43",TRUE)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('48');
            helper.edit('L8', '=SUM(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('33');
            helper.edit('L9', '=SUM(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('33');
            helper.edit('L10', '=SUM(TRUE,FALSE)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('1');
            helper.edit('L11', '=SUM("1",TRUE,FALSE,4)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('6');
            helper.edit('L12', '=SUM("TRUE","FALSE")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=SUM(I15:I18)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            helper.edit('L14', '=SUM(I15,I17,I16,I18)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0');
            helper.edit('L15', '=SUM(FALSE)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('0');
            done();
        });
        it('SUM Formula with nested formula as input->', (done: Function) => {
            helper.edit('L16', '=SUM(LEN(D10),LEN(D8),LEN(E10))');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('6');
            helper.edit('L17', '=SUM(GEOMEAN(G2:G6),GEOMEAN(H3:H7))');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('58.20502849');
            helper.edit('L18', '=SUM(COUNT(F16:F20),10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('10');
            done();
        });
        it('SUM Formula with Expression value as input->', (done: Function) => {
            helper.edit('L19', '=SUM(D2+17)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('27');
            helper.edit('L20', '=SUM(100-D2)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('90');
            helper.edit('L21', '=SUM(10+22*10)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('230');
            helper.edit('L22', '=SUM(H4+I2*10)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('1050.2');
            done();
        });
        it('SUM Formula with worst case value as argument->', (done: Function) => {
            helper.edit('M1', '=SUM(A2:A11)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('0');
            helper.edit('M2', '=SUM(I12,G10)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NAME?');
            helper.edit('M3', '=SUM(,)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('0');
            helper.edit('M4', '=SUM(1,3, ,0)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('4');
            helper.edit('M5', '=SUM(0)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('0');
            helper.edit('M6', '=SUM(1,2,"")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            helper.edit('M7', '=SUM(I11)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            helper.edit('M8', '=SUM(I12)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#NAME?');
            helper.edit('M9', '=SUM("Hello")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('SUM Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=SUM($F$2:$F$20)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('4720');
            helper.edit('N2', '=SUM($I$4:$I$7,$F$4:$F$7)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('4851.2409');
            helper.edit('N3', '=SUM($I$3:$I$9,$H$8)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('3693.25118');
            done();
        });
        it('SUM Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N4', '=SUM(Sheet2!A1:A10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('356');
            helper.edit('N5', '=SUM(Sheet2!A1:A10,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('5076');
            helper.edit('N6', '=SUM(Sheet1!D1:D10,Sheet2!A2:A11)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('571');
            helper.edit('N7', '=SUM(Sheet1!E2:E11,Sheet1!H2:H11)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('729');
            helper.edit('N8', '=SUM(Sheet2!A5,Sheet2!A2)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('113');
            helper.edit('N9', '=SUM(Sheet1!D5,Sheet1!E2)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('35');
            helper.edit('N10', '=SUM(Sheet1!D5,Sheet2!A3)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('91');
            helper.edit('N11', '=SUM(Sheet2!A5,Sheet1!E3)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('123');
            done();
        });
        it('SUM Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N12', '=SUM(Sheet2!$A$1:$A$6,Sheet2!$C$3:$C$10,Sheet2!$B$12,$D$6)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('296');
            helper.edit('N13', '=SUM(Sheet2!$A$1:$A$10,Sheet1!$F$2:$F$11)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('5076');
            helper.edit('N14', '=SUM(Sheet1!$E$2:$E$11,Sheet1!$H$2:$H$11)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('729');
            helper.edit('N15', '=SUM(Sheet1!$E$2:$E$11)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('175');
            helper.edit('N16', '=SUM(Sheet2!$A$7)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('40');
            helper.edit('N17', '=SUM(Sheet2!$A$5,Sheet1!$E$2)');
            expect(helper.invoke('getCell', [16, 13]).textContent).toBe('113');
            done();
        });
        it('SUM formula with invalid arguments error dialog cases ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N18');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUM()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUM()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N18', '=SUM(10,30,20)');
            expect(helper.invoke('getCell', [17, 13]).textContent).toBe('60');
            done();
        });
    });

    describe('EJ2-923901 -> ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ name: 'Price Details', ranges: [{ dataSource: defaultData }] }, { ranges: [{ dataSource: defaultData }] }],
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Formula cell reference value is not changed while inserting the column before or after', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('goTo', ['Sheet1!I2']);
            setTimeout(function () {
                helper.edit('I2', '=SUM(Price Details!H2:H11)');
                expect(helper.invoke('getCell', [1, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[1].cells[8].formula).toBe('=SUM(Price Details!H2:H11)');
                helper.edit('I3', '=SUM(\'Price Details\'!H2:\'Price Details\'!H11)');
                expect(helper.invoke('getCell', [2, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[2].cells[8].formula).toBe('=SUM(\'Price Details\'!H2:\'Price Details\'!H11)');
                spreadsheet.insertColumn(7, 7, 0);
                expect(helper.invoke('getCell', [1, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[1].cells[8].formula).toBe('=SUM(Price Details!I2:I11)');
                expect(helper.invoke('getCell', [2, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[2].cells[8].formula).toBe('=SUM(\'Price Details\'!I2:\'Price Details\'!I11)');
                spreadsheet.insertColumn(8, 10, 0);
                expect(helper.invoke('getCell', [1, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[1].cells[8].formula).toBe('=SUM(Price Details!L2:L11)');
                expect(helper.invoke('getCell', [2, 8]).textContent).toBe('554');
                expect(spreadsheet.sheets[1].rows[2].cells[8].formula).toBe('=SUM(\'Price Details\'!L2:\'Price Details\'!L11)');
                done();
            });
        });
    });

    describe('EJ2-907348-> Refresh formula on insert row/column ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [{ cells: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }] },
                    { cells: [{ value: '1' }, { value: '' }, { value: '2' }, { value: '9' }, { value: '10' }] },
                    { cells: [{ value: '12' }, { value: '0' }, { value: '11' }, { value: '5' }, { value: '6' }] },
                    { cells: [{ value: '1' }, { value: '7' }, { value: '15' }, { value: '0' }, { value: '8' }] },
                    { cells: [{ value: '1' }, { value: '' }, { value: '4' }, { value: '5' }, { value: '8' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Formula range refreshing for inserting row above using context menu', (done: Function) => {
            helper.edit('A6', '=SUM(A1:A5)');
            helper.edit('B6', '=SUM(B1:B5)');
            helper.edit('C6', '=SUM(A1:A5)');
            helper.edit('D6', '=SUM(B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[1].formula).toEqual('=SUM(B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[2].formula).toEqual('=SUM(A1:A5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[3].formula).toEqual('=SUM(B1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[0].value).toEqual(16);
            expect(helper.getInstance().sheets[0].rows[5].cells[1].value).toEqual(9);
            expect(helper.getInstance().sheets[0].rows[5].cells[2].value).toEqual(16);
            expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toEqual(9);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.invoke('selectRange', ['A6']);
            helper.openAndClickCMenuItem(4, 0, [6, 1], true); // Insert Row Above
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[0].formula).toEqual('=SUM(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[1].formula).toEqual('=SUM(B1:B6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[2].formula).toEqual('=SUM(A1:A6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[3].formula).toEqual('=SUM(B1:B6)');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(16);
                expect(helper.getInstance().sheets[0].rows[6].cells[1].value).toEqual(9);
                expect(helper.getInstance().sheets[0].rows[6].cells[2].value).toEqual(16);
                expect(helper.getInstance().sheets[0].rows[6].cells[3].value).toEqual(9);
                helper.edit('A6', '10');
                helper.edit('B6', '20');
                expect(helper.getInstance().sheets[0].rows[6].cells[0].value).toEqual(26);
                expect(helper.getInstance().sheets[0].rows[6].cells[1].value).toEqual(29);
                expect(helper.getInstance().sheets[0].rows[6].cells[2].value).toEqual(26);
                expect(helper.getInstance().sheets[0].rows[6].cells[3].value).toEqual(29);
                helper.openAndClickCMenuItem(4, 0, [6, 2], true); // Insert Row Below
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[7].cells[0].formula).toEqual('=SUM(A1:A7)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].formula).toEqual('=SUM(B1:B7)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[2].formula).toEqual('=SUM(A1:A7)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].formula).toEqual('=SUM(B1:B7)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toEqual(26);
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual(29);
                    expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toEqual(26);
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual(29);
                    helper.edit('A7', '10');
                    helper.edit('B7', '20');
                    expect(helper.getInstance().sheets[0].rows[7].cells[0].value).toEqual(36);
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual(49);
                    expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toEqual(36);
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual(49);
                    done();
                })
            })
        });
        it('Formula range not refreshing for inserting row below using context menu', (done: Function) => {
            helper.edit('B6', '=SUM(A1:B5)');
            helper.edit('D6', '=MAX(C1:D5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[1].formula).toEqual('=SUM(A1:B5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[1].value).toEqual(25);
            expect(helper.getInstance().sheets[0].rows[5].cells[3].formula).toEqual('=MAX(C1:D5)');
            expect(helper.getInstance().sheets[0].rows[5].cells[3].value).toEqual('15');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.invoke('selectRange', ['A6']);
            helper.openAndClickCMenuItem(4, 0, [6, 1], true); // Insert Row Above
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[6].cells[1].formula).toEqual('=SUM(A1:B5)');
                expect(helper.getInstance().sheets[0].rows[6].cells[1].value).toEqual(25);
                expect(helper.getInstance().sheets[0].rows[6].cells[3].formula).toEqual('=MAX(C1:D5)');
                expect(helper.getInstance().sheets[0].rows[6].cells[3].value).toEqual('15');
                helper.openAndClickCMenuItem(4, 0, [6, 2], true); // Insert Row Below
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].formula).toEqual('=SUM(A1:B5)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual(25);
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].formula).toEqual('=MAX(C1:D5)');
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual('15');
                    expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual(25);
                    expect(helper.getInstance().sheets[0].rows[7].cells[3].value).toEqual('15');
                    done();
                })
            })
        });
        it('Formula range refreshing for inserting column before using context menu', (done: Function) => {
            helper.edit('F1', '=SUM(A1:E1)');
            helper.edit('F2', '=SUM(A2:E2)');
            helper.edit('F3', '=SUM(A1:E1)');
            helper.edit('F4', '=SUM(A2:E2)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUM(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[1].cells[5].formula).toEqual('=SUM(A2:E2)');
            expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toEqual('=SUM(A1:E1)');
            expect(helper.getInstance().sheets[0].rows[3].cells[5].formula).toEqual('=SUM(A2:E2)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(15);
            expect(helper.getInstance().sheets[0].rows[1].cells[5].value).toEqual(22);
            expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toEqual(15);
            expect(helper.getInstance().sheets[0].rows[3].cells[5].value).toEqual(22);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.invoke('selectRange', ['F1']);
            helper.openAndClickCMenuItem(0, 7, [6, 1], null, true); // Insert Column Before
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUM(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[1].cells[6].formula).toEqual('=SUM(A2:F2)');
                expect(helper.getInstance().sheets[0].rows[2].cells[6].formula).toEqual('=SUM(A1:F1)');
                expect(helper.getInstance().sheets[0].rows[3].cells[6].formula).toEqual('=SUM(A2:F2)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(15);
                expect(helper.getInstance().sheets[0].rows[1].cells[6].value).toEqual(22);
                expect(helper.getInstance().sheets[0].rows[2].cells[6].value).toEqual(15);
                expect(helper.getInstance().sheets[0].rows[3].cells[6].value).toEqual(22);
                helper.edit('F1', '10');
                helper.edit('F2', '20');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(25);
                expect(helper.getInstance().sheets[0].rows[1].cells[6].value).toEqual(42);
                expect(helper.getInstance().sheets[0].rows[2].cells[6].value).toEqual(25);
                expect(helper.getInstance().sheets[0].rows[3].cells[6].value).toEqual(42);
                helper.openAndClickCMenuItem(0, 5, [6, 2], null, true); // Insert Column After
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[7].formula).toEqual('=SUM(A1:G1)');
                    expect(helper.getInstance().sheets[0].rows[1].cells[7].formula).toEqual('=SUM(A2:G2)');
                    expect(helper.getInstance().sheets[0].rows[2].cells[7].formula).toEqual('=SUM(A1:G1)');
                    expect(helper.getInstance().sheets[0].rows[3].cells[7].formula).toEqual('=SUM(A2:G2)');
                    expect(helper.getInstance().sheets[0].rows[0].cells[7].value).toEqual(25);
                    expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toEqual(42);
                    expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toEqual(25);
                    expect(helper.getInstance().sheets[0].rows[3].cells[7].value).toEqual(42);
                    helper.edit('G1', '10');
                    helper.edit('G2', '20');
                    expect(helper.getInstance().sheets[0].rows[0].cells[7].value).toEqual(35);
                    expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toEqual(62);
                    expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toEqual(35);
                    expect(helper.getInstance().sheets[0].rows[3].cells[7].value).toEqual(62);
                    done();
                })
            })
        });
        it('Formula range not refreshing for inserting column before using context menu', (done: Function) => {
            helper.edit('F1', '=SUM(A1:E2)');
            helper.edit('F2', '=SUM(A2:E3)');
            helper.edit('F3', '=SUM($A$1:$E$1)');
            helper.edit('F4', '=SUM(A2:E2,A2:E2)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].formula).toEqual('=SUM(A1:E2)');
            expect(helper.getInstance().sheets[0].rows[1].cells[5].formula).toEqual('=SUM(A2:E3)');
            expect(helper.getInstance().sheets[0].rows[2].cells[5].formula).toEqual('=SUM($A$1:$E$1)');
            expect(helper.getInstance().sheets[0].rows[3].cells[5].formula).toEqual('=SUM(A2:E2,A2:E2)');
            expect(helper.getInstance().sheets[0].rows[0].cells[5].value).toEqual(37);
            expect(helper.getInstance().sheets[0].rows[1].cells[5].value).toEqual(56);
            expect(helper.getInstance().sheets[0].rows[2].cells[5].value).toEqual(15);
            expect(helper.getInstance().sheets[0].rows[3].cells[5].value).toEqual(44);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.invoke('selectRange', ['F1']);
            helper.openAndClickCMenuItem(0, 7, [6, 1], null, true); // Insert Column Before
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[6].formula).toEqual('=SUM(A1:E2)');
                expect(helper.getInstance().sheets[0].rows[1].cells[6].formula).toEqual('=SUM(A2:E3)');
                expect(helper.getInstance().sheets[0].rows[2].cells[6].formula).toEqual('=SUM($A$1:$E$1)');
                expect(helper.getInstance().sheets[0].rows[3].cells[6].formula).toEqual('=SUM(A2:E2,A2:E2)');
                expect(helper.getInstance().sheets[0].rows[0].cells[6].value).toEqual(37);
                expect(helper.getInstance().sheets[0].rows[1].cells[6].value).toEqual(56);
                expect(helper.getInstance().sheets[0].rows[2].cells[6].value).toEqual(15);
                expect(helper.getInstance().sheets[0].rows[3].cells[6].value).toEqual(44);
                helper.openAndClickCMenuItem(0, 5, [6, 2], null, true); // Insert Column After
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[0].cells[7].formula).toEqual('=SUM(A1:E2)');
                    expect(helper.getInstance().sheets[0].rows[1].cells[7].formula).toEqual('=SUM(A2:E3)');
                    expect(helper.getInstance().sheets[0].rows[2].cells[7].formula).toEqual('=SUM($A$1:$E$1)');
                    expect(helper.getInstance().sheets[0].rows[3].cells[7].formula).toEqual('=SUM(A2:E2,A2:E2)');
                    expect(helper.getInstance().sheets[0].rows[0].cells[7].value).toEqual(37);
                    expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toEqual(56);
                    expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toEqual(15);
                    expect(helper.getInstance().sheets[0].rows[3].cells[7].value).toEqual(44);
                    done();
                })
            })
        });
    });

    describe('Stability ->', () => {
        describe('SUM Formula', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    {
                        sheets: [
                            {
                                ranges: [{ dataSource: defaultData }]
                            }, {}
                        ]
                    }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Sum basic', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: 5 }, 'I1']);
                helper.invoke('updateCell', [{ value: 5 }, 'I2']);
                helper.invoke('updateCell', [{ formula: '=SUM(I1:I2)' }, 'I3']);
                helper.invoke('updateCell', [{ formula: '=I3' }, 'J3']);
                helper.invoke('updateCell', [{ formula: '=I3+I2' }, 'K3']);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(10);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(10);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[10].value)).toEqual(15);
                done();
            });
            it('Sum refersh', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: 10 }, 'I1']);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(15);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(15);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[10].value)).toEqual(20);
                done();
            });
            it('Sum with text', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: "spreadsheet" }, 'I1']);
                helper.invoke('updateCell', [{ formula: '=SUM(I1:I2)' }, 'I3']);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(5);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(5);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[10].value)).toEqual(10);
                done();
            });
            it('Sum with all text', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: "spreadsheet" }, 'I2']);
                helper.invoke('updateCell', [{ formula: '=SUM(I1:I2)' }, 'I3']);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(0);
                expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(0);
                done();
            });
            it('Nested formula', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: "spreadsheet" }, 'I2']);
                helper.invoke('updateCell', [{ formula: '=SUM(D2:E7,SUM(D2:D7))' }, 'I7']);
                helper.invoke('updateCell', [{ formula: '=I7' }, 'I8']);
                expect(parseInt(spreadsheet.sheets[0].rows[6].cells[8].value)).toEqual(385);
                expect(parseInt(spreadsheet.sheets[0].rows[7].cells[8].value)).toEqual(385);
                done();
            });
            it('Cell reference with other sheet', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                helper.invoke('updateCell', [{ value: 5 }, 'L1']);
                helper.invoke('updateCell', [{ value: 5 }, 'L2']);
                helper.invoke('updateCell', [{ formula: '=SUM(L1:L2)' }, 'L3']);
                helper.invoke('updateCell', [{ formula: '=L3' }, 'L4']);
                helper.invoke('goTo', ['Sheet2!A2']);
                setTimeout(function () {
                    helper.invoke('updateCell', [{ formula: '=Sheet1!L3' }, 'A3']);
                    expect(parseInt(spreadsheet.sheets[1].rows[2].cells[0].value)).toEqual(10);
                    helper.invoke('updateCell', [{ value: 15 }, 'Sheet1!L1']);
                    expect(parseInt(spreadsheet.sheets[1].rows[2].cells[0].value)).toEqual(20);
                    done();
                });
            });
        })
        describe('Checking formula with culture-specific separator', () => {
            let spreadsheet: any; let sheet: any; let cell: any; let cellEle: Element;
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }], listSeparator: ';' }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Default formula with list separator', (done: Function) => {
                spreadsheet = helper.getInstance();
                sheet = spreadsheet.sheets[0];
                helper.invoke('updateCell', [{ formula: '=PRODUCT(D2;D3)' }, 'D12']);
                cell = sheet.rows[11].cells[3];
                expect(cell.value).toBe('200');
                cellEle = helper.invoke('getCell', [11, 3]);
                expect(cellEle.textContent).toBe('200');
                helper.invoke('updateCell', [{ formula: '=SUM(D2;D3;D4;D5)' }, 'D12']);
                expect(cell.value).toBe(65);
                expect(cellEle.textContent).toBe('65');
                helper.invoke('updateCell', [{ formula: '=SUMIF(D2:D7;">10")' }, 'D12']);
                expect(cell.value).toBe(125);
                expect(cellEle.textContent).toBe('125');
                helper.invoke('updateCell', [{ formula: '=IF(4>5;TRUE;FALSE)' }, 'D12']);
                expect(cell.value).toBe('FALSE');
                expect(cellEle.textContent).toBe('FALSE');
                helper.invoke('updateCell', [{ formula: '=IFS(A8<>"LoaferS";TRUE;A11="T-Shirts";FALSE)' }, 'D12']);
                expect(cell.value).toBe('TRUE');
                expect(cellEle.textContent).toBe('TRUE');
                helper.invoke('updateCell', [{ formula: '=COUNTIFS(D2:D11;"<>20")' }, 'D12']);
                expect(cell.value).toBe(7);
                expect(cellEle.textContent).toBe('7');
                helper.invoke('updateCell', [{ formula: '=SUMIFS(D2:D11;E2:E11;">15";F2:F11;">20")' }, 'D12']);
                expect(cell.value).toBe(126);
                expect(cellEle.textContent).toBe('126');
                helper.invoke('updateCell', [{ formula: '=TEXT(B4;"dd-mmm-yy")' }, 'D12']);
                expect(cell.value).toBe('27-Jul-14');
                expect(cellEle.textContent).toBe('27-Jul-14');
                helper.invoke('updateCell', [{ formula: '=CONCATENATE(A2;A3;A4;A8;A10)' }, 'D12']);
                expect(cell.value).toBe('Casual ShoesSports ShoesFormal ShoesRunning ShoesCricket Shoes');
                expect(cellEle.textContent).toBe('Casual ShoesSports ShoesFormal ShoesRunning ShoesCricket Shoes');
                helper.invoke('updateCell', [{ formula: '=OR(TRUE;TRUE;TRUE;FALSE)' }, 'D12']);
                expect(cell.value).toBe('TRUE');
                expect(cellEle.textContent).toBe('TRUE');
                helper.invoke('updateCell', [{ formula: '=HLOOKUP(Sheet1!$F$8;Sheet1!$F$2:$G$11;2;False)' }, 'D12']);
                expect(cell.value).toBe('600');
                expect(cellEle.textContent).toBe('600');
                helper.invoke('updateCell', [{ formula: '=SUMPRODUCT($D$2:$D$11;$H$2:$H$11)' }, 'D12']);
                expect(cell.value).toBe(18120);
                expect(cellEle.textContent).toBe('18120');
                done();
            });
            it('Nested formula with list separator', (done: Function) => {
                helper.invoke('updateCell', [{ formula: '=SUM(SUMIFS(D2:D11; E2:E11; {10; 20}))' }, 'D12']);
                expect(cell.value).toBe(196);
                expect(cellEle.textContent).toBe('196');
                helper.invoke('updateCell', [{ formula: '=ROUNDUP(AVERAGE(F2:F9);COUNT(F9;F11))' }, 'D12']);
                expect(cell.value).toBe('376.25');
                expect(cellEle.textContent).toBe('376.25');
                helper.invoke('updateCell', [{ formula: '=ROUNDDOWN(RSQ(D2:D11;F2:F11);4)' }, 'D12']);
                expect(cell.value).toBe('0.3789');
                expect(cellEle.textContent).toBe('0.3789');
                helper.invoke('updateCell', [{ formula: '=IFS(OR(A2<>"Casual Shoes";A11="T-Shirts");"Y";OR(A2<>"Casual Shoes";A11="T-Shirts"); "R")' }, 'D12']);
                expect(cell.value).toBe('Y');
                expect(cellEle.textContent).toBe('Y');
                helper.invoke('updateCell', [{ formula: '=MAX(MOD(22;3); MOD(12;5))' }, 'D12']);
                expect(cell.value).toBe('2');
                expect(cellEle.textContent).toBe('2');
                const formula: string = '=IF(OR(AND(ABS(D10)>ABS(E10);D10<0);AND(ABS(D10)<=ABS(E10);E10<0));-1*(IF(D10=0;((ABS(E10)-ABS(D10))/1)*100;' +
                    '((ABS(E10)-ABS(D10))/ABS(D10))*100));IF(D10=0;((ABS(E10)-ABS(D10))/1)*100;((ABS(E10)-ABS(D10))/ABS(D10))*100))';
                helper.invoke('updateCell', [{ formula: formula }, 'D12']);
                expect(cell.value).toBe('-26.829268292682933');
                expect(cellEle.textContent).toBe('-26.82926829');
                done();
            });
            it('Default formula with decimal separator', (done: Function) => {
                spreadsheet.workbookFormulaModule.calculateInstance.setParseDecimalSeparator(',');
                helper.invoke('updateCell', [{ formula: '=IF(D2=10,23;D3;10,45)' }, 'D12']);
                expect(cell.value).toBe('10.45');
                expect(cellEle.textContent).toBe('10.45');
                helper.invoke('updateCell', [{ formula: '=SUM("4,9";"5,2")' }, 'D12']);
                expect(cell.value).toBe('10.1');
                expect(cellEle.textContent).toBe('10.1');
                helper.invoke('updateCell', [{ formula: '=SUM(-5,7;-8,9)' }, 'D12']);
                expect(cell.value).toBe('-14.6');
                expect(cellEle.textContent).toBe('-14.6');
                helper.invoke('updateCell', [{ formula: '=COUNTIF(F2:F11;">100,84")' }, 'D12']);
                expect(cell.value).toBe(10);
                expect(cellEle.textContent).toBe('10');
                helper.invoke('updateCell', [{ formula: '=AVERAGEIF(F2:F11;">110,27")' }, 'D12']);
                expect(cell.value).toBe(472);
                expect(cellEle.textContent).toBe('472');
                helper.invoke('updateCell', [{ formula: '=SUMIF(D2:D11;"1,?")' }, 'D12']);
                expect(cell.value).toBe(0);
                expect(cellEle.textContent).toBe('0');
                helper.invoke('updateCell', [{ formula: '=GEOMEAN(10,87;20,33;30;56,45;40,34)' }, 'D12']);
                expect(cell.value).toBe('27.275806669844062');
                expect(cellEle.textContent).toBe('27.27580667');
                helper.invoke('updateCell', [{ formula: '=TRUNC("-8,9")' }, 'D12']);
                expect(cell.value).toBe('-8');
                expect(cellEle.textContent).toBe('-8');
                helper.invoke('updateCell', [{ formula: '=POWER((D2+D10);1,3/3,45)' }, 'D12']);
                expect(cell.value).toBe('4.3997929579013535');
                expect(cellEle.textContent).toBe('4.399792958');
                done();
            });
            it('Simple arithmetic expression with decimal separator', (done: Function) => {
                helper.invoke('updateCell', [{ formula: '=5,8+6,4+8,5' }, 'D12']);
                expect(cell.value).toBe('20.7');
                expect(cellEle.textContent).toBe('20.7');
                spreadsheet.workbookFormulaModule.calculateInstance.setParseDecimalSeparator('.');
                done();
            });
        });
    });

    describe('EJ2-68534 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                { sheets: [{ rows: [{ cells: [{ formula: '=SUM(1,1)' }] }] }, { rows: [{ cells: [{ formula: '=SUM(2,2)' }] }] }, { rows: [{ cells: [{ formula: '=SUM(3,3)' }] }] }], allowEditing: false }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('When the "allowEditing" property is set to false then formula cells are rendered with a blank value', (done: Function) => {
            expect(helper.invoke('getCell', [0, 0]).textContent).toBe('2');
            expect(helper.getInstance().sheets[0].rows[0].cells[0].formula).toBe('=SUM(1,1)');
            expect(helper.getInstance().sheets[0].rows[0].cells[0].value).toBe(2);
            helper.getInstance().activeSheetIndex = 1;
            helper.getInstance().dataBind();
            setTimeout(function () {
                expect(helper.getInstance().activeSheetIndex).toBe(1);
                expect(helper.invoke('getCell', [0, 0]).textContent).toBe('4');
                expect(helper.getInstance().sheets[1].rows[0].cells[0].formula).toBe('=SUM(2,2)');
                expect(helper.getInstance().sheets[1].rows[0].cells[0].value).toBe(4);
                helper.getInstance().activeSheetIndex = 2;
                helper.getInstance().dataBind();
                setTimeout(function () {
                    expect(helper.getInstance().activeSheetIndex).toBe(2);
                    expect(helper.invoke('getCell', [0, 0]).textContent).toBe('6');
                    expect(helper.getInstance().sheets[2].rows[0].cells[0].formula).toBe('=SUM(3,3)');
                    expect(helper.getInstance().sheets[2].rows[0].cells[0].value).toBe(6);
                    done();
                });
            });
        });
    });

    describe('fb23644, fb23650 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [{
                        rows: [{ cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '3' }] }, {
                            cells:
                                [{ value: '5' }]
                        }, { cells: [{ formula: '=SUM(A1:A4)' }] }], selectedRange: 'A4'
                    }]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Dependent cells not updated for loaded JSON using openFromJson method', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[4].cells[0].value.toString()).toEqual('11');
            helper.invoke('refresh');
            setTimeout((): void => {
                helper.edit('A4', '10');
                expect(spreadsheet.sheets[0].rows[4].cells[0].value.toString()).toEqual('16');
                setTimeout((): void => {
                    helper.invoke('selectRange', ['A5:A5']);
                    done();
                });
            });
        });
        it('Cell with inserted function is not properly copied and pasted (Formula range reference not proper on pasted cell)', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[4].cells[1]).toBeUndefined();
            helper.invoke('copy').then((): void => {
                helper.invoke('paste', ['B5']);
                setTimeout((): void => {
                    expect(spreadsheet.sheets[0].rows[4].cells[1].value.toString()).toEqual('0');
                    expect(spreadsheet.sheets[0].rows[4].cells[1].formula).toEqual('=SUM(B1:B4)');
                    expect(helper.invoke('getCell', [4, 1]).textContent).toEqual('0');
                    helper.invoke('paste', ['C4']);
                    setTimeout((): void => {
                        expect(spreadsheet.sheets[0].rows[3].cells[2].value).toEqual('#REF!');
                        expect(spreadsheet.sheets[0].rows[3].cells[2].formula).toEqual('=SUM(#REF!)');
                        expect(helper.invoke('getCell', [3, 2]).textContent).toEqual('#REF!');
                        done();
                    });
                });
            });
        });
    });

    describe('SUMIF Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Others' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'q1' }] }, { cells: [{ value: 'Q2' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUMIF formula with argument having whole column range->', (done: Function) => {
            helper.edit('J1', '=SUMIF(H1:H100,">10")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('544');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toEqual('=SUMIF(H1:H100,">10")');
            done();
        });
        it('SUMIF formula with argument having with criteria value length > 255->', (done: Function) => {
            helper.edit('J2', '=SUMIF(H2:H5,">123456789090123456789012345678789012345678799999877654544121233456775345654323456543234565432345654345699012346587909098765432123456789876543234567876888889999998889999999987654345678987654323456789098765432345678909876543345678987654323456789876543456785")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toEqual('=SUMIF(H2:H5,">123456789090123456789012345678789012345678799999877654544121233456775345654323456543234565432345654345699012346587909098765432123456789876543234567876888889999998889999999987654345678987654323456789098765432345678909876543345678987654323456789876543456785")');
            done();
        });
        it('SUMIF Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J3', '=SUMIF(D2:D11,"<25")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('85');
            helper.edit('J4', '=SUMIF(D2:D11,">35")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('131');
            helper.edit('J5', '=SUMIF(D2:D11,"<="&E2,G2:G11)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('27');
            helper.edit('J6', '=SUMIF(D2:D11,">="&E2,G2:G11)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('65');
            helper.edit('J7', '=SUMIF(F2:F9,"<>300")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2110');
            helper.edit('J8', '=SUMIF(E2:E10,D4)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('60');
            done();
        });
        it('SUMIF Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('J9', '=SUMIF(D2:D11,"2*",G2:G11)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0');
            helper.edit('J10', '=SUMIF(D2:D11,"0*",G2:G11)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('0');
            helper.edit('J11', '=SUMIF(A2:A11,"C*",E2:E11)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            helper.edit('J12', '=SUMIF(A2:A11,"*es",E2:E11)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('105');
            helper.edit('J13', '=SUMIF(A2:A11,"s*ers",E2:E11)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('40');
            done();
        });
        it('SUMIF Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('J14', '=SUMIF(D2:D11,"?0",G2:G11)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0');
            helper.edit('J15', '=SUMIF(D2:D11,"1?",G2:G11)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('0');
            helper.edit('J16', '=SUMIF(A2:A11,"???????Shoes",E2:E11)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('65');
            helper.edit('J17', '=SUMIF(A2:A11,"???????",E2:E11)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('10');
            helper.edit('J18', '=SUMIF(A2:A11,"<>????????",E2:E11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('145');
            done();
        });
        it('SUMIF Formula with different kind of value as criteria ->', (done: Function) => {
            helper.edit('K1', '=SUMIF(G2:G10,11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('11');
            helper.edit('K2', '=SUMIF(D2:D10,"20")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('60');
            helper.edit('K3', '=SUMIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('40');
            helper.edit('K4', '=SUMIF(E2:E11,"<>"&G6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('135');
            helper.edit('K5', '=SUMIF(A2:A11,"*"&A2,E2:E11)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('20');
            helper.edit('K6', '=SUMIF(A2:A11,A11&"*",D2:D11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('50');
            helper.edit('K7', '=SUMIF(A2:A11,"Casual Shoes",F2:F11)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('200');
            done();
        });
        it('SUMIF Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('K8', '=SUMIF(H2:H11,">"&G6+13)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('530');
            helper.edit('K9', '=SUMIF(H2:H10,F5-134,E2:E11)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('30');
            done();
        });
        it('Add 2 SUMIF Formulas->', (done: Function) => {
            helper.edit('K10', '=(SUMIF(D2:D11,">30")+AVERAGEIF(D2:D11,"<30"))');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('179');
            done();
        });
        it('SUMIF Formula with worst case value as argument->', (done: Function) => {
            helper.edit('K11', '=SUMIF(E2:E9,)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('0');
            helper.edit('K12', '=SUMIF(O2:O6,)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('0');
            done();
        });
        it('SUMIF Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('K13', '=SUMIF(A2:A11,"*",G2:G11)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('77');
            helper.edit('K14', '=SUMIF(E2:E11,"*",G2:G11)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('0');
            helper.edit('K15', '=SUMIF(P2:P11,"*",G2:G11)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('0');
            helper.edit('K16', '=SUMIF(A2:A11,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('0');
            helper.edit('K17', '=SUMIF(D2:D1,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('5');
            helper.edit('K18', '=SUMIF(P2:P11,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('77');
            done();
        });
        it('SUMIF Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('L1', '=SUMIF(I6:I8,"<0")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('-3344');
            helper.edit('L2', '=SUMIF(I15:I16,I16)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('12.76');
            helper.edit('L3', '=SUMIF(I17:I18,">=12")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('29');
            helper.edit('L4', '=SUMIF(I19:I20,115)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('115');
            helper.edit('L5', '=SUMIF(I2:I20,">"&E2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('385');
            done();
        });
        it('SUMIF Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('L6', '=SUMIF(I2:I5,"TRUE",G2:G5)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('6');
            helper.edit('L7', '=SUMIF(I2:I5,"FALSE",G2:G5)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('18');
            helper.edit('L8', '=SUMIF(I2:I5,TRUE,G2:G5)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('6');
            helper.edit('L9', '=SUMIF(I2:I5,FALSE,G2:G5)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('18');
            helper.edit('L10', '=SUMIF(I2:I3,I2,G2:G5)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('6');
            helper.edit('L11', '=SUMIF(I2:I5,I4,G2:G5)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('18');
            done();
        });
        it('SUMIF Formula with nested Formula as criteria->', (done: Function) => {
            helper.edit('L12', '=SUMIF(E2:E11,SUM(D3),F2:F11)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('1300');
            helper.edit('L13', '=SUMIF(G2:G11,COUNT(E2:E11),H2:H11)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('70');
            helper.edit('L14', '=SUMIF(F2:F11,">"LEN(E2:E11),H2:H11)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('554');
            done();
        });
        it('SUMIF Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=SUMIF($E$2:$E$11,"<15")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('40');
            helper.edit('M2', '=SUMIF($A$2:$A$11,"T-Shirts",$D$2:$D$11)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('50');
            helper.edit('M3', '=SUMIF($H$2:$H$11,">="&$G$3)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('554');
            helper.edit('M4', '=SUMIF($D$3:$D$10,">"&$E$5,$H$3:$H$10)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('331');
            helper.edit('M5', '=SUMIF(D2:D10,$E$6,H2:H10)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('10');
            helper.edit('M6', '=SUMIF(D2:D10,E6,$H$2:$H$10)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('10');
            done();
        });
        it('SUMIF Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M7', '=SUMIF(Sheet2!A1:A8,Sheet2!A1)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('2');
            helper.edit('M8', '=SUMIF(Sheet2!A1:A10,"<10")');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('11');
            helper.edit('M9', '=SUMIF(G2:G11,">="&Sheet2!A5)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('76');
            helper.edit('M10', '=SUMIF(Sheet2!A1:A8,">="&Sheet1!G6)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('125');
            helper.edit('M11', '=SUMIF(Sheet1!G2:G11,Sheet2!A5)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('3');
            helper.edit('M12', '=SUMIF(Sheet1!E2:E11,">"&Sheet1!E6)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('135');
            done();
        });
        it('SUMIF Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M13', '=SUMIF(Sheet2!$A$1:$A$9,Sheet2!$A$2)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('20');
            helper.edit('M14', '=SUMIF(Sheet2!$A$1:$A$10,"<10")');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('11');
            helper.edit('M15', '=SUMIF(G2:G11,">="&Sheet2!$A$3)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('68');
            helper.edit('M16', '=SUMIF(Sheet1!F3:F10,">"&Sheet1!F5,Sheet1!D3:D10)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('132');
            helper.edit('M17', '=SUMIF(Sheet1!D3:D8,">"&Sheet2!A2,Sheet1!H3:H8)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('136');
            helper.edit('M18', '=SUMIF(Sheet2!$A$1:$A$8,">="&Sheet1!$G$6)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('125');
            helper.edit('M19', '=SUMIF(Sheet1!$E$2:$E$11,">"&Sheet1!$E$5)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('60');
            done();
        });
        it('SUMIF formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('M20', '=SUMIF(Sheet2!A8:A9,"q1",Sheet1!G5:G6)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('11');
            helper.edit('M21', '=SUMIF(Sheet2!A8:A9,"Q2",Sheet1!G5:G6)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('10');
            done();
        });
        it('SUMIF formula with invalid arguments shows error dialog cases ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=SUMIF(E2:E9,)');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF(E2:E9,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF(E2:E9,)';
            helper.triggerKeyNativeEvent(13);
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('0');
            helper.edit('N2', '=SUMIF(,">10")');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF(,">10")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF(,">10")';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=SUMIF(E2:E9,)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0');
            helper.edit('N3', '=SUMIF(,)');
            spreadsheet.selectRange('N3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF(,)';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N3', '=SUMIF(E2:E9,)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('0');
            spreadsheet.selectRange('N4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF(AWFE,20)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF(AWFE,20)';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N4', '=SUMIF(E2:E9,)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('0');
            helper.edit('N5', '=SUMIF("A3","*e")');
            spreadsheet.selectRange('N5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF("A3","*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF("A3","*e")';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N5', '=SUMIF(E2:E9,)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('0');
            done();
        });
    });

    describe('SUMIF Formula', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [
                        {
                            ranges: [{ dataSource: defaultData }]
                        }, {}
                    ]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Sumif basic', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('updateCell', [{ formula: '=SUMIF(D2:D7,">10")' }, 'I3']);
            helper.invoke('updateCell', [{ formula: '=I3' }, 'J3']);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(125);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(125);
            done();
        });
        it('Sumif refersh', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('updateCell', [{ value: 30 }, 'D2']);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(155);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(155);
            done();
        });
        it('Sumif with text', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('updateCell', [{ value: "spreadsheet" }, 'D3']);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(135);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(135);
            done();
        });
        it('Sumif with all text', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('updateCell', [{ formula: '=SUM(D4:D6)' }, 'D7']);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[8].value)).toEqual(160);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(160);
            done();
        });
        it('Cell reference with other sheet', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('goTo', ['Sheet2!A2']);
            setTimeout(function () {
                helper.invoke('updateCell', [{ formula: '=Sheet1!I3' }, 'A3']);
                expect(parseInt(spreadsheet.sheets[1].rows[2].cells[0].value)).toEqual(160);
                helper.invoke('updateCell', [{ formula: '=Sheet2!A3' }, 'A4']);
                expect(parseInt(spreadsheet.sheets[1].rows[2].cells[0].value)).toEqual(160);
                done();
            });
        });
    });

    describe('Provide the support to handle the wrong formula in spreadsheet and display alert dialog -> ', () => {
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('checking alert box throwing after entering =SUM()', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUM()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUM()';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with an invalid arguments.');
            done();
        });
        it('checking alert box throwing after entering =MIN(IF(2>1,1,0)', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MIN(IF(2>1,1,0)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MIN(IF(2>1,1,0)';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with one or more missing opening or closing parenthesis.');
            done();
        });
        it('checking alert box throwing after entering =SUMIF()', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIF()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIF()';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula which is improper.');
            done();
        });
        it('checking alert box throwing after entering =IF(2>1,1,2,3,4)', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IF(2>1,1,2,3,4)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IF(2>1,1,2,3,4)';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            done();
        });
        it('checking alert box throwing after entering =SUM{}', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUM{}';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUM{}';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with an empty expression.');
            done();
        });
        it('checking alert box throwing after entering =IF(2>1,"Hello, "World")', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IF(2>1,"Hello, "World")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IF(2>1,"Hello, "World")';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with a mismatched quotes.');
            done();
        });
        it('checking alert box throwing after entering =SUM(2,I8)', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUM(2,I8)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUM(2,I8)';
            helper.triggerKeyNativeEvent(13);
            expect(helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content').textContent).toBe('We found that you typed a formula with a circular reference.');
            done();
        });
    });

    describe('SUMIFS Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Others' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'q1' }] }, { cells: [{ value: 'Q2' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUMIFS formula->', (done: Function) => {
            helper.edit('J1', '=SUMIFS(H2:H5,E2:E5,">10")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('154');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toEqual('=SUMIFS(H2:H5,E2:E5,">10")');
            done();
        });
        it('SUMIFS formula with no argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J2', '=SUMIFS(G2:G9,H2:H9,">5")');
            done();
        });
        it('SUMIFS formula with criteria value as *->', (done: Function) => {
            helper.edit('J3', '=SUMIFS(H2:H5,H2:H5,"*")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toEqual('=SUMIFS(H2:H5,H2:H5,"*")');
            done();
        });
        it('SUMIFS formula with criteria value as ?->', (done: Function) => {
            helper.edit('J4', '=SUMIFS(H2:H5,H2:H5,"?")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toEqual('=SUMIFS(H2:H5,H2:H5,"?")');
            done();
        });
        it('SUMIFS formula with criteria value as ? And numbers->', (done: Function) => {
            helper.edit('J5', '=SUMIFS(H2:H5,H2:H5,"1?1")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toEqual('=SUMIFS(H2:H5,H2:H5,"1?1")');
            done();
        });
        it('SUMIFS formula with criteria value as ? and numbers ->', (done: Function) => {
            helper.edit('J6', '=SUMIFS(H2:H5,H2:H5,"11?1")');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toEqual('=SUMIFS(H2:H5,H2:H5,"11?1")');
            done();
        });
        it('SUMIFS Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J7', '=SUMIFS(D2:D11,E2:E11,"<"30,F2:F11,"<"300)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('30');
            helper.edit('J8', '=SUMIFS(D2:D11,E2:E11,">"20,F2:F11,">"300)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('61');
            helper.edit('J9', '=SUMIFS(D2:D11,E2:E11,"<="30,F2:F11,"<="300)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('95');
            helper.edit('J10', '=SUMIFS(D2:D11,E2:E11,">="20,F2:F11,">="300)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('116');
            helper.edit('J11', '=SUMIFS(D2:D11,E2:E11,"<>20",F2:F11,"<>200")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('192');
            helper.edit('J12', '=SUMIFS(D2:D11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('10');
            helper.edit('J13', '=SUMIFS(D2:D11,E2:E11,"<"15,F2:F11,">"250)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('111');
            helper.edit('J14', '=SUMIFS(D2:D11,E2:E11,">"&D8,F2:F11,">"&F2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('61');
            helper.edit('J15', '=SUMIFS(D2:D11,E2:E11,"<>"&D8,F2:F11,"<>200")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('192');
            helper.edit('J16', '=SUMIFS(F2:F11,D2:D11,"=20",E2:E11,"=30")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('600');
            done();
        });
        it('SUMIFS Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('K1', '=SUMIFS(D2:D11,F2:F11,"*2")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            helper.edit('K2', '=SUMIFS(D2:D11,F2:F11,"0*")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0');
            helper.edit('K3', '=SUMIFS(D2:D11,A2:A11,"C*")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('51');
            helper.edit('K4', '=SUMIFS(D2:D11,A2:A11,"*ES")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('111');
            helper.edit('K5', '=SUMIFS(D2:D11,A2:A11,"s*es")');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('20');
            done();
        });
        it('SUMIFS Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('K6', '=SUMIFS(D2:D11,F2:F11,"2??")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('0');
            helper.edit('K7', '=SUMIFS(D2:D11,E2:E11,"1?")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0');
            helper.edit('K8', '=SUMIFS(E2:E3,A2:A3,"???????Shoes")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('50');
            helper.edit('K9', '=SUMIFS(E2:E10,A2:A10,"???????")');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('10');
            helper.edit('K10', '=SUMIFS(E2:E10,A2:A10,"<>???????")');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('155');
            done();
        });
        it('SUMIFS Formula with different kind of value as criteria ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('K11', '=SUMIFS(D2:D11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('10');
            helper.edit('K12', '=SUMIFS(D2:D11,E2:E11,">20",F2:F11,">200")');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('61');
            helper.edit('K13', '=SUMIFS(D2:D11,E2:E11,E2,F2:F11,F2)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('10');
            helper.edit('K14', '=SUMIFS(D2:D11,E2:E11,"<>"&D8,F2:F11,"<>"&F2)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('192');
            spreadsheet.selectRange('K15');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.triggerKeyNativeEvent(13);
            let dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K15', '=SUMIFS(G2:G9,H2:H9,">5")');
            spreadsheet.selectRange('K16');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.triggerKeyNativeEvent(13);
            let dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K16', '=SUMIFS(G2:G9,H2:H9,">5")');
            helper.edit('K17', '=SUMIFS(D2:D11,A2:A11,"Casual Shoes",E2:E11,20)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('10');
            helper.edit('K18', '=SUMIFS(E2:E10,A2:A10,"")');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('0');
            done();
        });
        it('SUMIFS Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('L1', '=SUMIFS(E2:E11,H2:H11,">"&G6+13,F2:F11,">"&D7+100)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('145');
            helper.edit('L2', '=SUMIFS(E2:E11,F2:F11,">"&H10-66)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('175');
            done();
        });
        it('SUMIFS Formula to check alert box throws for worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('L3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS(,)';
            helper.triggerKeyNativeEvent(13);
            let dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L3', '=SUMIFS(G2:G9,H2:H9,">5")');
            spreadsheet.selectRange('L4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS(,D2:D10,"*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS(,D2:D10,"*e")';
            helper.triggerKeyNativeEvent(13);
            let dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L4', '=SUMIFS(G2:G9,H2:H9,">5")');
            done();
        })
        it('SUMIFS Formula with worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L5', '=SUMIFS(E2:E9,F2:F9,)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('0');
            spreadsheet.selectRange('L6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS(A2:A11,,H4:H9,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS(A2:A11,,H4:H9,)';
            helper.triggerKeyNativeEvent(13);
            let dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L6', '=SUMIFS(G2:G9,H2:H9,">5")');
            helper.edit('L7', '=SUMIFS(E4:E11,A3:A11,"",D4:D11,"=20")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('#VALUE!');
            helper.edit('L8', '=SUMIFS(E3:E11,F3:F11,"300",H3:H13,">50")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            spreadsheet.selectRange('L9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMIFS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMIFS()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L9', '=SUMIFS(G2:G9,H2:H9,">5")');
            done();
        });
        it('SUMIFS Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('L10', '=SUMIFS(D2:D11,A2:A11,"*")');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('277');
            helper.edit('L11', '=SUMIFS(D2:D11,E2:E11,"*")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('0');
            helper.edit('L12', '=SUMIFS(D2:D11,P2:P11,"*")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('0');
            helper.edit('L13', '=SUMIFS(D2:D11,A2:A11,"<>*")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            helper.edit('L14', '=SUMIFS(D2:D11,E2:E11,"<>*")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('277');
            helper.edit('L15', '=SUMIFS(D2:D11,P2:P11,"<>*")');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('277');
            helper.edit('L16', '=SUMIFS(A2:A11,D2:D11,)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('0');
            helper.edit('L17', '=SUMIFS(A2:A11,D2:D11," ")');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            done();
        });
        it('SUMIFS Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('M1', '=SUMIFS(I6:I8,F5:F7,"300")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('-3344');
            helper.edit('M2', '=SUMIFS(I15:I16,F5:F6,"300")');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('131.76');
            helper.edit('M3', '=SUMIFS(F5:F6,I15:I16,"<150")');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('600');
            helper.edit('M4', '=SUMIFS(I17:I18,F5:F6,300)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('29');
            helper.edit('M5', '=SUMIFS(F5:F6,I17:I18,">10")');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('600');
            helper.edit('M6', '=SUMIFS(I19:I20,F8:F9,"200")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('2');
            helper.edit('M7', '=SUMIFS(F8:F9,I19:I20,">=2")');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('510');
            done();
        });
        it('SUMIFS Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('M8', '=SUMIFS(D2:D5,I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('30');
            helper.edit('M9', '=SUMIFS(D2:D5,I2:I5,"FALSE")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('35');
            helper.edit('M10', '=SUMIFS(D2:D5,I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('30');
            helper.edit('M11', '=SUMIFS(D2:D5,I2:I5,"FALSE")');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('35');
            helper.edit('M12', '=SUMIFS(F2:F5,I2:I5,I3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('800');
            helper.edit('M13', '=SUMIFS(F2:F5,I2:I5,I4)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('600');
            done();
        });
        it('SUMIFS Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=SUMIFS($D$2:$D$11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('10');
            helper.edit('N2', '=SUMIFS(D2:D11,$E$2:$E$11,">20",$F$2:$F$11,">200")');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('61');
            helper.edit('N3', '=SUMIFS(D2:D11,E2:E11,">"&$E$4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('126');
            helper.edit('N4', '=SUMIFS($F$2:$F$11,$D$2:$D$11,">"&$D$5,$E$2:$E$11,"<"&$E$5)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('1610');
            done();
        });
        it('SUMIFS Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=SUMIFS(Sheet2!A1:A10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('55');
            helper.edit('N6', '=SUMIFS(Sheet1!E1:E10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('80');
            helper.edit('N7', '=SUMIFS(D2:D9,Sheet2!A2:A9,">"&20)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('141');
            helper.edit('N8', '=SUMIFS(Sheet1!D2:D11,Sheet1!E2:E11,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('277');
            helper.edit('N9', '=SUMIFS(Sheet2!A2:A6,Sheet1!E2:E6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('94');
            helper.edit('N10', '=SUMIFS(Sheet1!D2:D6,Sheet2!A2:A6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('60');
            helper.edit('N11', '=SUMIFS(Sheet2!A2:A6,Sheet2!A2:A6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('85');
            helper.edit('N12', '=SUMIFS(Sheet2!A2:A6,Sheet2!A2:A6,">="&Sheet1!G9)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('91');
            done();
        });
        it('SUMIFS Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N13', '=SUMIFS(Sheet2!$A$1:$A$10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('55');
            helper.edit('N14', '=SUMIFS(Sheet2!A1:A10,$F$2:$F$11,">"&F5,$G$2:$G$11,"<"&D2)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('20');
            helper.edit('N15', '=SUMIFS(Sheet2!A1:A10,F2:F11,">"&$F$5,G2:G11,"<"&$D$2)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('20');
            helper.edit('N16', '=SUMIFS(Sheet1!$D$2:$D$6,Sheet2!$A$2:$A$6,">"&Sheet1!$G$4)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('60');
            helper.edit('N17', '=SUMIFS(Sheet1!D2:D11,Sheet1!E2:E11,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [16, 13]).textContent).toBe('277');
            helper.edit('N18', '=SUMIFS(Sheet1!$D$2:$D$11,Sheet1!$E$2:$E$11,">"&Sheet1!$G$4)');
            expect(helper.invoke('getCell', [17, 13]).textContent).toBe('277');
            helper.edit('N19', '=SUMIFS(D2:D8,Sheet2!$A$1:$A$7,">"20)');
            expect(helper.invoke('getCell', [18, 13]).textContent).toBe('75');
            helper.edit('N20', '=SUMIFS(Sheet1!$D$2:$D$8,Sheet2!$A$1:$A$7,">"$G$5)');
            expect(helper.invoke('getCell', [19, 13]).textContent).toBe('95');
            done();
        });
        it('SUMIFS Formula with nested formula as arguments ->', (done: Function) => {
            helper.edit('O1', '=SUMIFS(D2:D11,E2:E11,SUM(10)+10)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('65');
            helper.edit('O2', '=SUMIFS(D2:D11,E2:E11,COUNT(G2:H11))');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('65');
            helper.edit('O3', '=SUMIFS(H2:H11,E2:E11,LEN(D4)+18)');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('143');
            helper.edit('O4', '=SUMIFS(D2:D11,A2:A11,"<>"EXACT(A2))');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('277');
            helper.edit('O5', '=SUMIFS(F2:F11,E2:E11,SUM(D2,H2),A2:A11,"<>"PROPER(A3))');
            expect(helper.invoke('getCell', [4, 14]).textContent).toBe('1300');
            done();
        });
        it('SUMIFS formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('O6', '=SUMIFS(Sheet1!G5:G6,Sheet2!A8:A9,"q1")');
            expect(helper.invoke('getCell', [5, 14]).textContent).toBe('11');
            helper.edit('O7', '=SUMIFS(Sheet1!G5:G6,Sheet2!A8:A9,"Q2")');
            expect(helper.invoke('getCell', [6, 14]).textContent).toBe('10');
            helper.edit('O12', '=SUMIFS(G5,F2:F10,"300")');
            expect(helper.invoke('getCell', [11, 14]).textContent).toBe('#VALUE!');
            done();
        });
        it('SUMIFS formula with wildcard * in both starting and end of criteria->', (done: Function) => {
            helper.edit('O8', '=SUMIFS(D2:D8,A2:A8,"*shoes*")');
            expect(helper.invoke('getCell', [7, 14]).textContent).toBe('70');
            helper.edit('O9', '=SUMIFS(D2:D8,A2:A8,"*shoes")');
            expect(helper.invoke('getCell', [8, 14]).textContent).toBe('70');
            helper.edit('O10', 'Shoes');
            helper.edit('O11', '=SUMIFS(D2:D8,A2:A8,"*"&O10&"*")');
            expect(helper.invoke('getCell', [10, 14]).textContent).toBe('70');
            done();
        });
    });

    describe('SUMPRODUCT Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Decimals' }] }, { cells: [{ index: 8, value: '102.32' }] },
                        { cells: [{ index: 8, value: '105.43' }] }, { cells: [{ index: 8, value: '103.23' }] },
                        { cells: [{ index: 8, value: '1002.2323' }] }, { cells: [{ index: 8, value: '1023.3219' }] },
                        { cells: [{ index: 8, value: '1022.4567' }] }, { cells: [{ index: 8, value: '320.12354' }] },
                        { cells: [{ index: 8, value: '102.45674' }] }, { cells: [{ index: 8, value: '103.32321' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: '-3221' }] }, { cells: [{ index: 8, value: '-1253' }] },
                        { cells: [{ index: 8, value: '0' }] }, { cells: [{ index: 8, value: '119', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '321', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12.56', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '2', format: '0%' }] },
                        { cells: [{ index: 8, value: '115', format: '0%' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: '#NUM!' }] }, { cells: [{ index: 8, value: '#DIV/0!' }] },]
                }, {
                    rows: [
                        { cells: [{ value: '12' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '76' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '93' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'ABC' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUMPRODUCT formula with invalid Inputs', (done: Function) => {
            helper.edit('J2', '=SUMPRODUCT(D);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            done();
        });
        it('SUMPRODUCT formula which return value as "0" for invalid inputs', (done: Function) => {
            helper.edit('J3', '=SUMPRODUCT("D");');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            done();
        });
        it('SUMPRODUCT formula which contains First as null', (done: Function) => {
            helper.edit('D1', '');
            helper.edit('J4', '=SUMPRODUCT(D1:D5);');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('65');
            done();
        });
        it('SUMPRODUCT formula with row and column range is entered in reverse order', (done: Function) => {
            const cellEle: HTMLElement = helper.invoke('getCell', [4, 9]);
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(D2:D5,E5:E2)' }, 'J5']);
            expect(cellEle.textContent).toBe('1400');
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(D5:D2,E2:E5)' }, 'J5']);
            expect(cellEle.textContent).toBe('1400');
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(D5:D2,E5:E2)' }, 'J5']);
            expect(cellEle.textContent).toBe('1400');
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(D2:F2,F3:D3)' }, 'J5']);
            expect(cellEle.textContent).toBe('120800');
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(F2:D2,D3:F3)' }, 'J5']);
            expect(cellEle.textContent).toBe('120800');
            helper.invoke('updateCell', [{ value: '=SUMPRODUCT(F2:D2,F3:D3)' }, 'J5']);
            expect(cellEle.textContent).toBe('120800');
            done();
        });
        it('SUMPRODUCT Formula with ranged cell references values as single arguments->', (done: Function) => {
            helper.edit('J6', '=SUMPRODUCT(A2:A10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=SUMPRODUCT(B3:B10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('334743');
            helper.edit('J8', '=SUMPRODUCT(C3:C8)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('1.303888889');
            helper.edit('J9', '=SUMPRODUCT(D2:D11)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('277');
            helper.edit('J10', '=SUMPRODUCT(I2:I6)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('2336.5342');
            helper.edit('J11', '=SUMPRODUCT(I6:I10)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('2571.68209');
            helper.edit('J12', '=SUMPRODUCT(I19:I21)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('-4474');
            helper.edit('J13', '=SUMPRODUCT(I24:I25)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('131.56');
            helper.edit('J14', '=SUMPRODUCT(I26:I27)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('29');
            helper.edit('J15', '=SUMPRODUCT(I28:I29)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('117');
            helper.edit('J16', '=SUMPRODUCT(I13:I16)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('0');
            helper.edit('J17', '=SUMPRODUCT(I13:I29)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('-3756.44');
            done();
        });
        it('SUMPRODUCT Formula with aplha numeric values as cell referenced arguments->', (done: Function) => {
            helper.edit('K1', '=SUMPRODUCT(I13:I14)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            helper.edit('K2', '=SUMPRODUCT(I13:I14,F2:F3)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0');
            done();
        });
        it('SUMPRODUCT Formula with multiple range arguments with different formatted values->', (done: Function) => {
            helper.edit('K3', '=SUMPRODUCT(A2:A11,B2:B11)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0');
            helper.edit('K4', '=SUMPRODUCT(B2:B11,A2:A11)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('0');
            helper.edit('K5', '=SUMPRODUCT(B2:B11,C2:C11)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('100438.2413');
            helper.edit('K6', '=SUMPRODUCT(C2:C11,B2:B11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('100438.2413');
            helper.edit('K7', '=SUMPRODUCT(C2:C11,D2:D11)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('62.90446759');
            helper.edit('K8', '=SUMPRODUCT(D2:D11,C2:C11)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('62.90446759');
            helper.edit('K9', '=SUMPRODUCT(D2:D11,E2:E11)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('4740');
            helper.edit('K10', '=SUMPRODUCT(E2:E11,D2:D11)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('4740');
            helper.edit('K11', '=SUMPRODUCT(H2:H4,I2:I4)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('9081.91');
            helper.edit('K12', '=SUMPRODUCT(I2:I4,H2:H4)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('9081.91');
            helper.edit('K13', '=SUMPRODUCT(I2:I4,I5:I7)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('315985.442');
            helper.edit('K14', '=SUMPRODUCT(I5:I7,I2:I4)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('315985.442');
            helper.edit('K15', '=SUMPRODUCT(G8:G10,I19:I21)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('-17181');
            helper.edit('K16', '=SUMPRODUCT(I19:I21,G8:G10)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('-17181');
            helper.edit('K17', '=SUMPRODUCT(I22:I23,I24:I25)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('18192.76');
            helper.edit('K18', '=SUMPRODUCT(I24:I25,I22:I23)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('18192.76');
            helper.edit('K19', '=SUMPRODUCT(I24:I25,I26:I27)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('1641.52');
            helper.edit('K20', '=SUMPRODUCT(I26:I27,I24:I25)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('1641.52');
            helper.edit('K21', '=SUMPRODUCT(I26:I27,I28:I29)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('1979');
            helper.edit('K22', '=SUMPRODUCT(I28:I29,I26:I27)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('1979');
            helper.edit('K23', '=SUMPRODUCT(I15:I18,G8:G11)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('0');
            done();
        });
        it('SUMPRODUCT Formula with column and row wise arguments as input->', (done: Function) => {
            helper.edit('L1', '=SUMPRODUCT(D2:H2,D11:H11)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('101259');
            helper.edit('L2', '=SUMPRODUCT(D2:G3,E7:H8)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('26936');
            helper.edit('L3', '=SUMPRODUCT(D2:D11,G2:G11)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('2423');
            helper.edit('L4', '=SUMPRODUCT(D2:E10,G3:H11)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('10686');
            done();
        });
        it('SUMPRODUCT Formula with multiple range arguments as input->', (done: Function) => {
            helper.edit('L5', '=SUMPRODUCT(B4:B9,C4:C9,D4:D9,E4:E9,F4:F9,G4:G9,H4:H9)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('1.14977E+13');
            helper.edit('L6', '=SUMPRODUCT(D2:H11)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('5803');
            helper.edit('L7', '=SUMPRODUCT(D2:E10,F2:G10,H2:I10)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('13065759.55');
            done();
        });
        it('SUMPRODUCT Formula with improper range arguments as input->', (done: Function) => {
            helper.edit('L8', '=SUMPRODUCT(D2:D10,E2:E11)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            helper.edit('L9', '=SUMPRODUCT(D2:D11,E3:E11)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#VALUE!');
            helper.edit('L10', '=SUMPRODUCT(D3:D6,F3:G8)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#VALUE!');
            helper.edit('L11', '=SUMPRODUCT(D3:G3,D5:H5)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            helper.edit('L12', '=SUMPRODUCT(D2:H2,D6:F6)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=SUMPRODUCT(D3:G4,D7:G9)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('SUMPRODUCT Formula with worst case value as  arguments->', (done: Function) => {
            helper.edit('L14', '=SUMPRODUCT(,)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#VALUE!');
            helper.edit('L15', '=SUMPRODUCT(,,,,)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#VALUE!');
            helper.edit('L16', '=SUMPRODUCT(D2:D11,)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            helper.edit('L17', '=SUMPRODUCT(,D2:D11)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#VALUE!');
            helper.edit('L18', '=SUMPRODUCT(I3:I11,"")');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#VALUE!');
            helper.edit('L19', '=SUMPRODUCT(D)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('#NAME?');
            done();
        });
        it('SUMPRODUCT Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=SUMPRODUCT($D$2:$H$11)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('5803');
            helper.edit('M2', '=SUMPRODUCT($D$2:$D$11,$H$2:$H$11)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('18120');
            helper.edit('M3', '=SUMPRODUCT($H$2:$H$6,I6:I10)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('84096.61586');
            done();
        });
        it('SUMPRODUCT Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M4', '=SUMPRODUCT(Sheet2!A1:A10)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('356');
            helper.edit('M5', '=SUMPRODUCT(Sheet2!A2:B5,Sheet1!G3:G10)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('1884');
            helper.edit('M6', '=SUMPRODUCT(Sheet1!B2:B9,Sheet2!A2:A9)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('14404403');
            helper.edit('M7', '=SUMPRODUCT(Sheet1!D2:D10,Sheet1!H2:H10)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('15370');
            helper.edit('M8', '=SUMPRODUCT(Sheet2!A5:A10)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('218');
            done();
        });
        it('SUMPRODUCT Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M9', '=SUMPRODUCT(Sheet2!$A$2:$A$7,Sheet1!$C$2:$C$7,Sheet1!$F$2:$F$7)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('36883.02431');
            helper.edit('M10', '=SUMPRODUCT(Sheet1!$B$2:$B$8,Sheet2!$A$2:$A$8)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('12305753');
            helper.edit('M11', '=SUMPRODUCT(Sheet2!$A$3:$A$5,Sheet1!$G$3:$G$5)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('1613');
            helper.edit('M12', '=SUMPRODUCT(Sheet1!$D$2:$E$10,Sheet2!$A$2:$B$10)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('7915');
            helper.edit('M13', '=SUMPRODUCT(Sheet2!$A$2:$A$10)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('344');
            helper.edit('M14', '=SUMPRODUCT(Sheet1!$D$2:$E$10)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('392');
            helper.edit('M15', '=SUMPRODUCT(Sheet1!$D$2:$D$10,Sheet1!$E$2:$E$10,Sheet1!$F$2:$F$10,Sheet1!$H$2:$H$10)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('325804700');
            done();
        });
        it('SUMPRODUCT formula with No Inputs', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SUMPRODUCT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SUMPRODUCT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J1', '=SUMPRODUCT(A2:A6)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            done();
        });
    });

    describe('PRODUCT formula checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '-23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '-567.547' }] }, { cells: [{ value: '-89,789' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }, { cells: [{ value: 'TRUE' }] },
                    { cells: [{ value: '' }] }, { cells: [{ value: '123hello' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('PRODUCT formula with string values', (done: Function) => {
            helper.edit('I2', '=PRODUCT("3.7","2")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('7.4');
            helper.edit('I3', '=PRODUCT("-2.5","-2")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('5');
            helper.edit('I4', '=PRODUCT(A1,2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('2');
            helper.edit('I5', '=PRODUCT(" "," ")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            helper.edit('I6', '=PRODUCT("","")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            helper.edit('I7', '=PRODUCT(123,"TRUE")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            helper.edit('I8', '=PRODUCT(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I9', '=PRODUCT(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I10', '=PRODUCT(123,"FALSE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('PRODUCT formula with boolean values', (done: Function) => {
            helper.edit('J2', '=PRODUCT(TRUE,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            helper.edit('J3', '=PRODUCT(FALSE,FALSE)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=PRODUCT(123,FALSE)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=PRODUCT(TRUE,1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1');
            helper.edit('J6', '=PRODUCT(FALSE,1)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=PRODUCT(IF(2>1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            helper.edit('J8', '=PRODUCT(IF(2<1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0');
            helper.edit('N1', 'TRUE');
            helper.edit('N2', 'TRUE');
            helper.edit('N3', 'TRUE');
            helper.edit('N4', 'TRUE');
            helper.edit('J9', '=PRODUCT(N1,N2,N3,N4)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0');
            done();
        });
        it('PRODUCT formula with basic values', (done: Function) => {
            helper.edit('K2', '=PRODUCT(3.7,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('7.4');
            helper.edit('K3', '=PRODUCT(-2.5,-2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('5');
            helper.edit('K4', '=PRODUCT(2.5,-2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('-5');
            helper.edit('K5', '=PRODUCT(2.5,-2)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('-5');
            helper.edit('K6', '=PRODUCT(1.58,0.1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('0.158');
            helper.edit('K7', '=PRODUCT(0.234,0.01)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0.00234');
            helper.edit('K8', '=PRODUCT(,)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('0');
            done();
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('L2', '=PRODUCT($G$3,2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('10');
            helper.edit('L3', '=PRODUCT($G$4,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('21');
            helper.edit('L4', '=PRODUCT($G$5,5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('55');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('L5', '=PRODUCT(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('-23.456');
            helper.edit('L6', '=PRODUCT(Sheet2!A2,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('468.91112');
            helper.edit('L7', '=PRODUCT(Sheet2!A3,3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('-1702.641');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('L8', '=PRODUCT(Sheet2!$A$1,1)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('-23.456');
            helper.edit('L9', '=PRODUCT(Sheet2!$A$2,2)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('468.91112');
            helper.edit('L10', '=PRODUCT(Sheet2!$A$3,3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('-1702.641');
            done();
        });
        it('nested formula with PRODUCT', function (done) {
            helper.edit('L11', '=PRODUCT(SUM(1,2),2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('6');
            helper.edit('L12', '=PRODUCT(SUM(1,G10),2)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('26');
            helper.edit('L13', '=PRODUCT(PRODUCT(1,G10),12)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('144');
            helper.edit('L14', '=PRODUCT(PRODUCT(1,2),2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('4');
            helper.edit('L15', '=PRODUCT(AVERAGE(G3:G7),10)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('92');
            helper.edit('L16', '=PRODUCT(MIN(G3:G9),12)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('36');
            helper.edit('L17', '=PRODUCT(MAX(G3:G9),9)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('117');
            helper.edit('L18', '=PRODUCT(IF(A2>A5,2,3),2)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('6');
            helper.edit('L19', '=MIN(PRODUCT(22,3), PRODUCT(12,5))');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('60');
            helper.edit('L20', '=MAX(PRODUCT(22,3), PRODUCT(12,5))');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('66');
            helper.edit('L21', '=SUM(PRODUCT(22,3), PRODUCT(12,5))');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('126');
            done();
        });
        it('PRODUCT formula with range as value', (done: Function) => {
            helper.edit('F6', 'TRUE');
            helper.edit('F7', '123hello');
            helper.edit('F9', '&*');
            helper.edit('M1', '=PRODUCT(F2:F11,1)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('1.3068E+18');
            helper.edit('M2', '=PRODUCT(F2:F11,1,TRUE)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('1.3068E+18');
            helper.edit('M3', '=PRODUCT(F2:F11,1,"hello")');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('applying extra cases like exponential, date, time with PRODUCT formula', function (done) {
            helper.edit('L1', '4000.00%');
            helper.edit('L2', '4.05E+09');
            helper.edit('L3', '11/7/2015');
            helper.edit('L4', '3:10:00 AM');
            helper.edit('L5', '=PRODUCT(L1, 2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('80');
            helper.edit('L6', '=PRODUCT(L2, 3');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('12150000000');
            helper.edit('L7', '=PRODUCT(L3,4)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('169260');
            helper.edit('L8', '=PRODUCT(L3,5)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('211575');
            done();
        });
    });

    describe('ABS Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ABS formula with negative value ', (done: Function) => {
            helper.edit('I1', '=ABS(-10);');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('10');
            helper.edit('I2', '=ABS(-4.5);');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('4.5');
            helper.edit('I3', '=ABS(6-12);');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('6');
            done();
        });

        it('ABS formula with negative value as cell reference', (done: Function) => {
            helper.edit('I4', '-6');
            helper.edit('I5', '=ABS(I4);');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('6');
            helper.edit('I6', '12');
            helper.edit('I7', '30');
            helper.edit('I8', '=ABS(I6-I7);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('18');
            done();
        });

        it('ABS formula with boolean value', (done: Function) => {
            helper.edit('I9', '=ABS(TRUE);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('1');
            helper.edit('I10', '=ABS(FALSE);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('0');
            helper.edit('I11', '=ABS("TRUE");');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('#VALUE!');
            helper.edit('I12', '=ABS("FALSE");');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#VALUE!');
            done();
        });

        it('ABS formula with string argument', (done: Function) => {
            helper.edit('I13', '=ABS("");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#VALUE!');
            helper.edit('I14', '=ABS("32");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('32');
            helper.edit('I15', '"32");');
            helper.edit('J1', '=ABS(I15);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=ABS(J3);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            done();
        });
    });

    describe('ABS Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '-23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '-567.547' }] }, { cells: [{ value: '-89,789' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ABS formula with negative value ', (done: Function) => {
            helper.edit('I1', '=ABS(-10);');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('10');
            helper.edit('I2', '=ABS(-4.5);');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('4.5');
            helper.edit('I3', '=ABS(6-12);');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('6');
            done();
        });

        it('ABS formula with negative value as cell reference', (done: Function) => {
            helper.edit('I4', '-6');
            helper.edit('I5', '=ABS(I4);');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('6');
            helper.edit('I6', '12');
            helper.edit('I7', '30');
            helper.edit('I8', '=ABS(I6-I7);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('18');
            done();
        });

        it('ABS formula with boolean value', (done: Function) => {
            helper.edit('I9', '=ABS(TRUE);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('1');
            helper.edit('I10', '=ABS(FALSE);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('0');
            helper.edit('I11', '=ABS("TRUE");');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('#VALUE!');
            helper.edit('I12', '=ABS("FALSE");');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#VALUE!');
            done();
        });

        it('ABS formula with string argument', (done: Function) => {
            helper.edit('I13', '=ABS("");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#VALUE!');
            helper.edit('I14', '=ABS("32");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('32');
            helper.edit('I15', '"32");');
            helper.edit('J1', '=ABS(I15);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=ABS(J3);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            done();
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('I2', '=ABS($G$3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('5');
            helper.edit('I3', '=ABS($G$4)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('7');
            helper.edit('I4', '=ABS($G$5)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('11');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('I5', '=ABS(Sheet2!A1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('23.456');
            helper.edit('I6', '=ABS(Sheet2!A2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('234.45556');
            helper.edit('I7', '=ABS(Sheet2!A3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('567.547');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('I5', '=ABS(Sheet2!$A$1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('23.456');
            helper.edit('I6', '=ABS(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('234.45556');
            helper.edit('I7', '=ABS(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('567.547');
            done();
        });
        it('ABS formula with nested formula and extra cases', (done: Function) => {
            helper.edit('N1', '=ABS(SUM(1,2))');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('3');
            helper.edit('N2', '=ABS(PRODUCT(1,2))');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('2');
            helper.edit('N3', '=ABS(MIN(G2:G8))');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('1');
            helper.edit('N4', '=ABS(MAX(G2:G8))');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('13');
            helper.edit('N5', '=ABS(IF(G1>G4,2,3))');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('2');
            helper.edit('N6', '=SUM(ABS(G5),3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('14');
            helper.edit('N7', '=PRODUCT(ABS(G7),ABS(3))');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('39');
            helper.edit('N8', '=MIN(ABS(24),ABS(28))');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('24');
            helper.edit('N9', '=MAX(ABS(24),ABS(28))');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('28');
            helper.edit('N10', '=ABS("")');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('#VALUE!');
            helper.edit('N11', '=ABS(" ")');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('#VALUE!');
            helper.edit('N12', '"hello"');
            helper.edit('N13', '=ABS(N12)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('#VALUE!');
            helper.edit('N14', '"TRUE"');
            helper.edit('N15', '=ODD(N14)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('#VALUE!');
            helper.edit('N16', '=ABS(O14)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('0');
            helper.edit('N17', '"123"');
            helper.edit('N18', '=ABS(N17)');
            expect(helper.invoke('getCell', [17, 13]).textContent).toBe('#VALUE!');
            done();
        });
        it('ABS Formula with more than 1 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N19');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ABS(-1,-2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ABS(-1,-2)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N19', '=ABS(-1)');
            done();
        });
    });

    describe('Reported RandBetween Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('RandBetween formula with normal value - 1->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN( , )');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#N/A","formula":"=RANDBETWEEN( , )"}');
            done();
        });
        it('RandBetween formula with normal value - 2->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN("1+2", 10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=RANDBETWEEN(\\"1+2\\", 10)"}');
            done();
        });
        it('RandBetween formula with normal value - 3->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN("100%", 1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=RANDBETWEEN(\\"100%\\", 1)"}');
            done();
        });
        it('RandBetween formula with normal value - 4->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN(0, 0)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=RANDBETWEEN(0, 0)"}');
            done();
        });
        it('RandBetween formula with normal value - 5->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN(10, 0)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=RANDBETWEEN(10, 0)"}');
            done();
        });
        it('RandBetween formula with normal value - 5->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN(0, FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=RANDBETWEEN(0, FALSE)"}');
            done();
        });
        it('RandBetween formula with normal value - 6->', (done: Function) => {
            helper.edit('I1', '=RANDBETWEEN(0, "#VALUE!")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=RANDBETWEEN(0, \\"#VALUE!\\")"}');
            done();
        });
        it('RandBetween formula with cell reference - 1->', (done: Function) => {
            helper.edit('J7', '=RANDBETWEEN(N1,N2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0","formula":"=RANDBETWEEN(N1,N2)"}');
            done();
        });
        it('RandBetween formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=RANDBETWEEN(A1:A9,10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=RANDBETWEEN(A1:A9,10)"}');
            done();
        });
    });

    describe('FLOOR formula checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '-23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '-567.547' }] }, { cells: [{ value: '-89,789' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('FLOOR formula with string values', (done: Function) => {
            helper.edit('I2', '=FLOOR("3.7","2")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('2');
            helper.edit('I3', '=FLOOR("-2.5","-2")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('-2');
            helper.edit('I4', '=FLOOR(A1,2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            helper.edit('I5', '=FLOOR(" "," ")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            helper.edit('I6', '=FLOOR("","")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            helper.edit('I7', '=FLOOR(123,"TRUE")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            helper.edit('I8', '=FLOOR(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I9', '=FLOOR(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I10', '=FLOOR(123,"FALSE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('FLOOR formula with boolean values', (done: Function) => {
            helper.edit('J2', '=FLOOR(TRUE,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            helper.edit('J3', '=FLOOR(FALSE,FALSE)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=FLOOR(123,FALSE)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J5', '=FLOOR(TRUE,1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1');
            helper.edit('J6', '=FLOOR(FALSE,1)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=FLOOR(IF(2>1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            helper.edit('J8', '=FLOOR(IF(2<1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0');
            done();
        });
        it('FLOOR formula with basic values', (done: Function) => {
            helper.edit('K2', '=FLOOR(3.7,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2');
            helper.edit('K3', '=FLOOR(-2.5,-2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('-2');
            helper.edit('K4', '=FLOOR(2.5,-2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            helper.edit('K5', '=FLOOR(2.5,-2)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            helper.edit('K6', '=FLOOR(1.58,0.1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('1.5');
            helper.edit('K7', '=FLOOR(0.234,0.01)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0.23');
            helper.edit('K8', '=FLOOR(,)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('0');
            done();
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('L2', '=FLOOR($G$3,2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('4');
            helper.edit('L3', '=FLOOR($G$4,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('6');
            helper.edit('L4', '=FLOOR($G$5,5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('10');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('L5', '=FLOOR(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('-24');
            helper.edit('L6', '=FLOOR(Sheet2!A2,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('234');
            helper.edit('L7', '=FLOOR(Sheet2!A3,3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('-570');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('L8', '=FLOOR(Sheet2!$A$1,1)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('-24');
            helper.edit('L9', '=FLOOR(Sheet2!$A$2,2)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('234');
            helper.edit('L10', '=FLOOR(Sheet2!$A$3,3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('-570');
            done();
        });
        it('nested formula with FLOOR', function (done) {
            helper.edit('L11', '=FLOOR(SUM(1,2),2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('2');
            helper.edit('L12', '=FLOOR(SUM(1,G10),2)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('12');
            helper.edit('L13', '=FLOOR(PRODUCT(1,G10),12)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('12');
            helper.edit('L14', '=FLOOR(PRODUCT(1,2),2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('2');
            helper.edit('L15', '=FLOOR(AVERAGE(G3:G7),10)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('0');
            helper.edit('L16', '=FLOOR(MIN(G3:G9),12)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('0');
            helper.edit('L17', '=FLOOR(MAX(G3:G9),9)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('9');
            helper.edit('L18', '=FLOOR(IF(A2>A5,2,3),2)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('2');
            helper.edit('L19', '=MIN(FLOOR(22,3), FLOOR(12,5))');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('10');
            helper.edit('L20', '=MAX(FLOOR(22,3), FLOOR(12,5))');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('21');
            helper.edit('L21', '=SUM(FLOOR(22,3), FLOOR(12,5))');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('31');
            done();
        });
        it('FLOOR formula with empty cell referrence', (done: Function) => {
            helper.edit('M2', '=FLOOR(N2,2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0');
            helper.edit('M3', '=FLOOR(2,N2)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#DIV/0!');
            helper.edit('M4', '=FLOOR(N4,N2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('0');
            done();
        });
    });

    describe('CEILING formula checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '-23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '-567.547' }] }, { cells: [{ value: '-89,789' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CEILING formula with string values', (done: Function) => {
            helper.edit('I2', '=CEILING("3.7","2")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('4');
            helper.edit('I3', '=CEILING("-2.5","-2")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('-4');
            helper.edit('I4', '=CEILING(A1,2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            helper.edit('I5', '=CEILING(" "," ")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            helper.edit('I6', '=CEILING("","")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            helper.edit('I7', '=CEILING(123,"TRUE")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            helper.edit('I8', '=CEILING(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I9', '=CEILING(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I10', '=CEILING(123,"FALSE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('CEILING formula with boolean values', (done: Function) => {
            helper.edit('J2', '=CEILING(TRUE,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            helper.edit('J3', '=CEILING(FALSE,FALSE)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=CEILING(123,FALSE)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=CEILING(TRUE,1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1');
            helper.edit('J6', '=CEILING(FALSE,1)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=CEILING(IF(2>1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            helper.edit('J8', '=CEILING(IF(2<1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0');
            done();
        });
        it('CEILING formula with basic values', (done: Function) => {
            helper.edit('K2', '=CEILING(3.7,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('4');
            helper.edit('K3', '=CEILING(-2.5,-2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('-4');
            helper.edit('K4', '=CEILING(2.5,-2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            helper.edit('K5', '=CEILING(2.5,-2)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            helper.edit('K6', '=CEILING(1.58,0.1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('1.6');
            helper.edit('K7', '=CEILING(0.234,0.01)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0.24');
            helper.edit('K8', '=CEILING(,)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('0');
            done();
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('L2', '=CEILING($G$3,2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('6');
            helper.edit('L3', '=CEILING($G$4,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('9');
            helper.edit('L4', '=CEILING($G$5,5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('15');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('L5', '=CEILING(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('-23');
            helper.edit('L6', '=CEILING(Sheet2!A2,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('236');
            helper.edit('L7', '=CEILING(Sheet2!A3,3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('-567');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('L8', '=CEILING(Sheet2!$A$1,1)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('-23');
            helper.edit('L9', '=CEILING(Sheet2!$A$2,2)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('236');
            helper.edit('L10', '=CEILING(Sheet2!$A$3,3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('-567');
            done();
        });
        it('nested formula with CEILING', function (done) {
            helper.edit('L11', '=CEILING(SUM(1,2),2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('4');
            helper.edit('L12', '=CEILING(SUM(1,G10),2)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('14');
            helper.edit('L13', '=CEILING(PRODUCT(1,G10),12)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('12');
            helper.edit('L14', '=CEILING(PRODUCT(1,2),2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('2');
            helper.edit('L15', '=CEILING(AVERAGE(G3:G7),10)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('10');
            helper.edit('L16', '=CEILING(MIN(G3:G9),12)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('12');
            helper.edit('L17', '=CEILING(MAX(G3:G9),9)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('18');
            helper.edit('L18', '=CEILING(IF(A2>A5,2,3),2)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('4');
            helper.edit('L19', '=MIN(CEILING(22,3), CEILING(12,5))');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('15');
            helper.edit('L20', '=MAX(CEILING(22,3), CEILING(12,5))');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('24');
            helper.edit('L21', '=SUM(CEILING(22,3), CEILING(12,5))');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('39');
            done();
        });
        it('CEILING formula with empty cell referrence', (done: Function) => {
            helper.edit('M2', '=CEILING(N2,2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0');
            helper.edit('M3', '=CEILING(2,N2)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('0');
            helper.edit('M4', '=CEILING(N4,N2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('0');
            done();
        });
    });

    describe('resolve issue reported in ROUND-ROUNDUP', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: 'INPUT1' }] }, { cells: [{ value: '8529.22567' }] },
                    { cells: [{ value: '17866.196789' }] }, { cells: [{ value: '13853.09239876' }] }, { cells: [{ value: '2,338.7456787' }] },
                    { cells: [{ value: '9578.454567' }] }, { cells: [{ value: '19141.626789' }] }, { cells: [{ value: '6543.30789' }] },
                    { cells: [{ value: '13035.065678' }] }, { cells: [{ value: '18488.808976' }] }, { cells: [{ value: '12317.04789' }] },
                    { cells: [{ value: '1' }] }, { cells: [{ value: '2' }] }, { cells: [{ value: '-1' }] }, { cells: [{ value: '-2' }] }]
                }], activeSheetIndex: 1
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('applying corner cases for ROUND', (done: Function) => {
            helper.edit('B2', '=ROUND(,)');
            expect(helper.invoke('getCell', [1, 1]).textContent).toBe('0');
            helper.edit('B3', '=ROUND(A2,)');
            expect(helper.invoke('getCell', [2, 1]).textContent).toBe('8529');
            helper.edit('B4', '=ROUND("123hello", 2)');
            expect(helper.invoke('getCell', [3, 1]).textContent).toBe('#VALUE!');
            helper.edit('B5', '=ROUND(A4,"123hello")');
            expect(helper.invoke('getCell', [4, 1]).textContent).toBe('#VALUE!');
            helper.edit('B6', '=ROUND(A5,A1)');
            expect(helper.invoke('getCell', [5, 1]).textContent).toBe('#VALUE!');
            helper.edit('B7', '=ROUND(A5,IF(2>1,"hello","world"))');
            expect(helper.invoke('getCell', [6, 1]).textContent).toBe('#VALUE!');
            helper.edit('B8', '=ROUND(A5,TRUE)');
            expect(helper.invoke('getCell', [7, 1]).textContent).toBe('2338.7');
            helper.edit('G2', '1');
            helper.edit('B9', '=ROUND(A5,G2)');
            expect(helper.invoke('getCell', [8, 1]).textContent).toBe('2338.7');
            helper.edit('B10', '=ROUND(A5,IF(2>1,TRUE,FALSE))');
            expect(helper.invoke('getCell', [9, 1]).textContent).toBe('2338.7');
            helper.edit('B11', '=ROUND(A5,"TRUE")');
            expect(helper.invoke('getCell', [10, 1]).textContent).toBe('#VALUE!');
            helper.edit('F2', '1');
            helper.edit('B12', '=ROUND(A5,F2)');
            expect(helper.invoke('getCell', [11, 1]).textContent).toBe('2338.7');
            helper.edit('C1', '=ROUND(A10,1)');
            expect(helper.invoke('getCell', [0, 2]).textContent).toBe('18488.8');
            helper.edit('C2', '=ROUND(A10,2)');
            expect(helper.invoke('getCell', [1, 2]).textContent).toBe('18488.81');
            helper.edit('C3', '=ROUND(A10,3)');
            expect(helper.invoke('getCell', [2, 2]).textContent).toBe('18488.809');
            helper.edit('C4', '=ROUND(A10,4)');
            expect(helper.invoke('getCell', [3, 2]).textContent).toBe('18488.809');
            helper.edit('C5', '=ROUND(A10,5)');
            expect(helper.invoke('getCell', [4, 2]).textContent).toBe('18488.80898');
            helper.edit('C6', '=ROUND(A10,6)');
            expect(helper.invoke('getCell', [5, 2]).textContent).toBe('18488.80898');
            helper.edit('C7', '=ROUND(A10,7)');
            expect(helper.invoke('getCell', [6, 2]).textContent).toBe('18488.80898');
            helper.edit('C8', '=ROUND(A10,8)');
            expect(helper.invoke('getCell', [7, 2]).textContent).toBe('18488.80898');
            helper.edit('C9', '=ROUND(A10,9)');
            expect(helper.invoke('getCell', [8, 2]).textContent).toBe('18488.80898');
            done();
        });
        it('applying corner cases for ROUNDUP', (done: Function) => {
            helper.edit('D2', '=ROUNDUP(,)');
            expect(helper.invoke('getCell', [1, 3]).textContent).toBe('0');
            helper.edit('D3', '=ROUNDUP(A2,)');
            expect(helper.invoke('getCell', [2, 3]).textContent).toBe('8530');
            helper.edit('D4', '=ROUNDUP("123hello", 2)');
            expect(helper.invoke('getCell', [3, 3]).textContent).toBe('#VALUE!');
            helper.edit('D5', '=ROUNDUP(A4,"123hello")');
            expect(helper.invoke('getCell', [4, 3]).textContent).toBe('#VALUE!');
            helper.edit('D6', '=ROUNDUP(A5,A1)');
            expect(helper.invoke('getCell', [5, 3]).textContent).toBe('#VALUE!');
            helper.edit('D7', '=ROUNDUP(A5,IF(2>1,"hello","world"))');
            expect(helper.invoke('getCell', [6, 3]).textContent).toBe('#VALUE!');
            helper.edit('D8', '=ROUNDUP(A5,TRUE)');
            expect(helper.invoke('getCell', [7, 3]).textContent).toBe('2,338.80');
            helper.edit('G2', '1');
            helper.edit('D9', '=ROUNDUP(A5,G2)');
            expect(helper.invoke('getCell', [8, 3]).textContent).toBe('2,338.80');
            helper.edit('D10', '=ROUNDUP(A5,IF(2>1,TRUE,FALSE))');
            expect(helper.invoke('getCell', [9, 3]).textContent).toBe('2,338.80');
            helper.edit('D11', '=ROUNDUP(A5,"TRUE")');
            expect(helper.invoke('getCell', [10, 3]).textContent).toBe('#VALUE!');
            helper.edit('F2', '1');
            helper.edit('D12', '=ROUNDUP(A5,F2)');
            expect(helper.invoke('getCell', [11, 3]).textContent).toBe('2,338.80');
            helper.edit('E1', '=ROUNDUP(A10,1)');
            expect(helper.invoke('getCell', [0, 4]).textContent).toBe('18488.9');
            helper.edit('E2', '=ROUNDUP(A10,2)');
            expect(helper.invoke('getCell', [1, 4]).textContent).toBe('18488.81');
            helper.edit('E3', '=ROUNDUP(A10,3)');
            expect(helper.invoke('getCell', [2, 4]).textContent).toBe('18488.809');
            helper.edit('E4', '=ROUNDUP(A10,4)');
            expect(helper.invoke('getCell', [3, 4]).textContent).toBe('18488.809');
            helper.edit('E5', '=ROUNDUP(A10,5)');
            expect(helper.invoke('getCell', [4, 4]).textContent).toBe('18488.80898');
            helper.edit('E6', '=ROUNDUP(A10,6)');
            expect(helper.invoke('getCell', [5, 4]).textContent).toBe('18488.80898');
            helper.edit('E7', '=ROUNDUP(A10,7)');
            expect(helper.invoke('getCell', [6, 4]).textContent).toBe('18488.80898');
            helper.edit('E8', '=ROUNDUP(A10,8)');
            expect(helper.invoke('getCell', [7, 4]).textContent).toBe('18488.80898');
            helper.edit('E9', '=ROUNDUP(A10,9)');
            expect(helper.invoke('getCell', [8, 4]).textContent).toBe('18488.80898');
            done();
        });
        it('applying negative integers as second parameter', (done: Function) => {
            helper.edit('F1', '=ROUND(A10,-1)');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('18490');
            helper.edit('F2', '=ROUND(A10,-2)');
            expect(helper.invoke('getCell', [1, 5]).textContent).toBe('18500');
            helper.edit('F3', '=ROUND(A10,-3)');
            expect(helper.invoke('getCell', [2, 5]).textContent).toBe('18000');
            helper.edit('F4', '=ROUND(A10,-4)');
            expect(helper.invoke('getCell', [3, 5]).textContent).toBe('20000');
            helper.edit('F5', '=ROUND(A10,-5)');
            expect(helper.invoke('getCell', [4, 5]).textContent).toBe('0');
            helper.edit('F6', '=ROUND(A10,-6)');
            expect(helper.invoke('getCell', [5, 5]).textContent).toBe('0');
            helper.edit('F7', '=ROUND(A10,-7)');
            expect(helper.invoke('getCell', [6, 5]).textContent).toBe('0');
            helper.edit('F8', '=ROUND(A10,-8)');
            expect(helper.invoke('getCell', [7, 5]).textContent).toBe('0');
            helper.edit('F9', '=ROUND(A10,-9)');
            expect(helper.invoke('getCell', [8, 5]).textContent).toBe('0');
            helper.edit('G1', '=ROUNDUP(A10,-1)');
            expect(helper.invoke('getCell', [0, 6]).textContent).toBe('18490');
            helper.edit('G2', '=ROUNDUP(A10,-2)');
            expect(helper.invoke('getCell', [1, 6]).textContent).toBe('18500');
            helper.edit('G3', '=ROUNDUP(A10,-3)');
            expect(helper.invoke('getCell', [2, 6]).textContent).toBe('19000');
            helper.edit('G4', '=ROUNDUP(A10,-4)');
            expect(helper.invoke('getCell', [3, 6]).textContent).toBe('20000');
            helper.edit('G5', '=ROUNDUP(A10,-5)');
            expect(helper.invoke('getCell', [4, 6]).textContent).toBe('100000');
            helper.edit('G6', '=ROUNDUP(A10,-6)');
            expect(helper.invoke('getCell', [5, 6]).textContent).toBe('1000000');
            helper.edit('G7', '=ROUNDUP(A10,-7)');
            expect(helper.invoke('getCell', [6, 6]).textContent).toBe('10000000');
            helper.edit('G8', '=ROUNDUP(A10,-8)');
            expect(helper.invoke('getCell', [7, 6]).textContent).toBe('100000000');
            helper.edit('G9', '=ROUNDUP(A10,-9)');
            expect(helper.invoke('getCell', [8, 6]).textContent).toBe('1000000000');
            helper.edit('G10', '=ROUNDUP(A10,-10)');
            expect(helper.invoke('getCell', [9, 6]).textContent).toBe('10000000000');
            done();
        });
        it('applying internal sheet reference for ROUND', (done: Function) => {
            helper.edit('H1', '=ROUND(Sheet2!A10,2)');
            expect(helper.invoke('getCell', [0, 7]).textContent).toBe('18488.81');
            helper.edit('H2', '=ROUND(Sheet2!A2,1');
            expect(helper.invoke('getCell', [1, 7]).textContent).toBe('8529.2');
            helper.edit('H3', '=ROUND(Sheet2!A3,1)');
            expect(helper.invoke('getCell', [2, 7]).textContent).toBe('17866.2');
            helper.edit('H4', '=ROUND(Sheet2!A4,3)');
            expect(helper.invoke('getCell', [3, 7]).textContent).toBe('13853.092');
            helper.edit('H5', '=ROUND(Sheet2!A4,-1)');
            expect(helper.invoke('getCell', [4, 7]).textContent).toBe('13850');
            helper.edit('H6', '=ROUND(Sheet2!$A$2,A12)');
            expect(helper.invoke('getCell', [5, 7]).textContent).toBe('8529.2');
            helper.edit('H7', '=ROUND(Sheet2!$A$2,Sheet2!$A$12)');
            expect(helper.invoke('getCell', [6, 7]).textContent).toBe('8529.2');
            helper.edit('H8', '=ROUND(Sheet2!$A$6,Sheet2!$A$13)');
            expect(helper.invoke('getCell', [7, 7]).textContent).toBe('9578.45');
            helper.edit('H9', '=ROUND(Sheet1!$A$7,Sheet2!$A$14)');
            expect(helper.invoke('getCell', [8, 7]).textContent).toBe('#VALUE!');
            helper.edit('H10', '=ROUND(Sheet1!$A$8,Sheet2!$A$15)');
            expect(helper.invoke('getCell', [9, 7]).textContent).toBe('#VALUE!');
            done();
        });
        it('applying internal sheet reference for ROUNDUP', (done: Function) => {
            helper.edit('I1', '=ROUNDUP(Sheet2!A10,2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('18488.81');
            helper.edit('I2', '=ROUNDUP(Sheet2!A2,1');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('8529.3');
            helper.edit('I3', '=ROUNDUP(Sheet2!A3,1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('17866.2');
            helper.edit('I4', '=ROUNDUP(Sheet2!A4,3)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('13853.093');
            helper.edit('I5', '=ROUNDUP(Sheet2!A4,-1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('13860');
            helper.edit('I6', '=ROUNDUP(Sheet2!$A$2,A12)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('8529.3');
            helper.edit('I7', '=ROUNDUP(Sheet2!$A$2,Sheet2!$A$12)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('8529.3');
            helper.edit('I8', '=ROUNDUP(Sheet2!$A$6,Sheet2!$A$13)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('9578.46');
            done();
        });
        it('applying external sheet reference for ROUND', (done: Function) => {
            helper.edit('J1', '=ROUND(Sheet2!A10,2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('18488.81');
            helper.edit('J2', '=ROUND(Sheet2!$A$2,Sheet1!$G$2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('8529.2');
            helper.edit('J3', '=ROUND(Sheet2!$A$3,Sheet1!$G$8)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('17866.197');
            helper.edit('J4', '=ROUND(Sheet2!A4,3)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('13853.092');
            helper.edit('J5', '=ROUND(Sheet2!A4,-1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('13850');
            done();
        });
        it('applying external sheet reference for ROUNDUP', (done: Function) => {
            helper.edit('K1', '=ROUNDUP(Sheet2!A10,2)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('18488.81');
            helper.edit('K2', '=ROUNDUP(Sheet2!$A$2,Sheet1!$G$2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('8529.3');
            helper.edit('K3', '=ROUNDUP(Sheet2!$A$3,Sheet1!$G$8)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('17866.197');
            helper.edit('K4', '=ROUNDUP(Sheet2!A4,3)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('13853.093');
            helper.edit('K5', '=ROUNDUP(Sheet2!A4,-1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('13860');
            done();
        });
        it('applying reported issues and nested formulas for ROUND and ROUNDUP', (done: Function) => {
            helper.edit('K6', '=ROUNDUP(EVEN(A2),2)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('8530');
            helper.edit('K7', '=ROUND(INTERCEPT(A2:A4,A6:A8),2)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('7810.9');
            helper.edit('K8', '=ROUND(A9,-1)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('13040');
            helper.edit('K9', '=ROUNDUP(A10,-3)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('19000');
            helper.edit('K10', '=ROUND(ROUND(A2,4),2)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('8529.23');
            helper.edit('K11', '=ROUND(SUM(A2:A6),3)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('52165.715');
            helper.edit('K12', '=ROUND(PRODUCT(A2,2),4)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('17058.4513');
            helper.edit('K13', '=ROUND(AVERAGE(A2:A6),5)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('10433.14302');
            helper.edit('K14', '=ROUND(AVERAGE(A2:A6),COUNT(A7:A9))');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('10433.143');
            helper.edit('K15', '=ROUNDUP(ROUND(A2,4),2)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('8529.23');
            helper.edit('K16', '=ROUNDUP(SUM(A2:A6),3)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('52165.716');
            helper.edit('K17', '=ROUNDUP(PRODUCT(A2,2),4)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('17058.4514');
            helper.edit('K18', '=ROUNDUP(AVERAGE(A2:A6),5)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('10433.14303');
            helper.edit('K19', '=ROUNDUP(AVERAGE(A2:A6),COUNT(A7:A9))');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('10433.144');
            done();
        });
    });

    describe('EJ2-850739 -> ROUNDDOWN Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }, { cells: [{ index: 8, value: '#NUM!' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] },
                        { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '0' }] }, { cells: [{ value: '1' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ROUNDDOWN Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=ROUNDDOWN(18,0)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('18');
            helper.edit('J2', '=ROUNDDOWN(18.9,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('18');
            helper.edit('J3', '=ROUNDDOWN(3.14159,2)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('3.14');
            helper.edit('J4', '=ROUNDDOWN(3.14159,4)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('3.1415');
            helper.edit('J5', '=ROUNDDOWN(31489.323,-1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('31480');
            helper.edit('J6', '=ROUNDDOWN(31489.323,-3)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('31000');
            helper.edit('J7', '=ROUNDDOWN(31489.323,-5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J8', '=ROUNDDOWN(129.99,)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('129');
            done();
        });
        it('ROUNDDOWN Formula with direct values and cell references as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=ROUNDDOWN(TRUE,0)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('1');
            helper.edit('J10', '=ROUNDDOWN(FALSE,3)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('0');
            helper.edit('J11', '=ROUNDDOWN(TRUE,FALSE)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('1');
            helper.edit('J12', '=ROUNDDOWN(FALSE,TRUE)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('0');
            helper.edit('J13', '=ROUNDDOWN("TRUE",0)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('#VALUE!');
            helper.edit('J14', '=ROUNDDOWN("FALSE",0)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#VALUE!');
            helper.edit('J15', '=ROUNDDOWN(I2,I5)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('1');
            helper.edit('J16', '=ROUNDDOWN(I4,I10)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('0');
            done();
        });
        it('ROUNDDOWN Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J17', '=ROUNDDOWN("hello",2)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('#VALUE!');
            helper.edit('J18', '=ROUNDDOWN(123.32,"hi")');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('#VALUE!');
            helper.edit('J19', '=ROUNDDOWN("123Hulk",2)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            helper.edit('J20', '=ROUNDDOWN(123.32,"Hulk12")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('#VALUE!');
            helper.edit('J21', '=ROUNDDOWN("123.32",-2)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('100');
            helper.edit('J22', '=ROUNDDOWN("123.45","-3")');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('0');
            done();
        });
        it('ROUNDDOWN Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J23', '=ROUNDDOWN(1+77.26,0)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('78');
            helper.edit('J24', '=ROUNDDOWN(2-34.32,-2)');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('0');
            helper.edit('J25', '=ROUNDDOWN(2>5,-1)');
            expect(helper.invoke('getCell', [24, 9]).textContent).toBe('0');
            helper.edit('J26', '=ROUNDDOWN(2<5,1)');
            expect(helper.invoke('getCell', [25, 9]).textContent).toBe('1');
            done();
        });
        it('ROUNDDOWN Formula with different format arguments as input in General formatted cells ->', (done: Function) => {
            helper.edit('K1', '=ROUNDDOWN(I6,1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('103.3');
            helper.edit('K2', '=ROUNDDOWN(I13,-1)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('110.00');
            helper.edit('K3', '=ROUNDDOWN(I16,1)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('$12.70');
            helper.edit('K4', '=ROUNDDOWN(I17,1)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('1.2000E+01');
            helper.edit('K5', '=ROUNDDOWN(I20,0)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('11500%');
            done();
        });
        it('ROUNDDOWN Formula with different format arguments as input in Currency formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'K6']);
            helper.edit('K6', '=ROUNDDOWN(I6,1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('$103.30');
            helper.invoke('numberFormat', ['$#,##0.00', 'K7']);
            helper.edit('K7', '=ROUNDDOWN(I13,-1)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('$110.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'K8']);
            helper.edit('K8', '=ROUNDDOWN(I16,1)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('$12.70');
            helper.invoke('numberFormat', ['$#,##0.00', 'K9']);
            helper.edit('K9', '=ROUNDDOWN(I17,1)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('$12.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'K10']);
            helper.edit('K10', '=ROUNDDOWN(I20,0)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('$115.00');
            done();
        });
        it('ROUNDDOWN Formula with different format arguments as input in Percentage formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0%', 'K11']);
            helper.edit('K11', '=ROUNDDOWN(I6,1)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('10330%');
            helper.invoke('numberFormat', ['0%', 'K12']);
            helper.edit('K12', '=ROUNDDOWN(I13,-1)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('11000%');
            helper.invoke('numberFormat', ['0%', 'K13']);
            helper.edit('K13', '=ROUNDDOWN(I16,1)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('$12.70');
            helper.invoke('numberFormat', ['0%', 'K14']);
            helper.edit('K14', '=ROUNDDOWN(I17,1)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('1.2000E+01');
            helper.invoke('numberFormat', ['0%', 'K15']);
            helper.edit('K15', '=ROUNDDOWN(I20,0)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('11500%');
            done();
        });
        it('ROUNDDOWN Formula with different format arguments as input in Scientific formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0.0000E+00', 'K16']);
            helper.edit('K16', '=ROUNDDOWN(I6,1)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('1.0330E+02');
            helper.invoke('numberFormat', ['0.0000E+00', 'K17']);
            helper.edit('K17', '=ROUNDDOWN(I13,-1)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('1.1000E+02');
            helper.invoke('numberFormat', ['0.0000E+00', 'K18']);
            helper.edit('K18', '=ROUNDDOWN(I16,1)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('$12.70');
            helper.invoke('numberFormat', ['0.0000E+00', 'K19']);
            helper.edit('K19', '=ROUNDDOWN(I17,1)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('1.2000E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K20']);
            helper.edit('K20', '=ROUNDDOWN(I20,0)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('11500%');
            done();
        });
        it('ROUNDDOWN Formula with different format arguments as input in Number formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['#,##0.00', 'K21']);
            helper.edit('K21', '=ROUNDDOWN(I6,1)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('103.30');
            helper.invoke('numberFormat', ['#,##0.00', 'K22']);
            helper.edit('K22', '=ROUNDDOWN(I13,-1)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('110.00');
            helper.invoke('numberFormat', ['#,##0.00', 'K23']);
            helper.edit('K23', '=ROUNDDOWN(I16,1)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('12.70');
            helper.invoke('numberFormat', ['#,##0.00', 'K24']);
            helper.edit('K24', '=ROUNDDOWN(I17,1)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('12.00');
            helper.invoke('numberFormat', ['#,##0.00', 'K25']);
            helper.edit('K25', '=ROUNDDOWN(I20,0)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('115.00');
            done();
        });
        it('ROUNDDOWN Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('L1', '=ROUNDDOWN(A3,I10)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('#VALUE!');
            helper.edit('L2', '=ROUNDDOWN(B4,I10)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('7/27/2014');
            helper.edit('L3', '=ROUNDDOWN(C6,I10)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('12:00:00 AM');
            helper.edit('L4', '=ROUNDDOWN(F9,-2)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('300');
            helper.edit('L5', '=ROUNDDOWN(I2,I10)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('1');
            helper.edit('L6', '=ROUNDDOWN(I4,I10)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('0');
            helper.edit('L7', '=ROUNDDOWN(I7,-1)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('100');
            helper.edit('L8', '=ROUNDDOWN(I11,0)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            helper.edit('L9', '=ROUNDDOWN(I13,1)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('119.00');
            helper.edit('L10', '=ROUNDDOWN(I15,3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('$119.00');
            helper.edit('L11', '=ROUNDDOWN(I18,1)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('1.7000E+01');
            helper.edit('L12', '=ROUNDDOWN(I20,3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('11500%');
            done();
        });
        it('ROUNDDOWN Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('L13', '=ROUNDDOWN(D2<E2,2)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('1');
            helper.edit('L14', '=ROUNDDOWN(D2>E2,2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0');
            helper.edit('L15', '=ROUNDDOWN(D2<=E2,2)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('1');
            helper.edit('L16', '=ROUNDDOWN(D2>=E2,2)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('0');
            helper.edit('L17', '=ROUNDDOWN(D2=E2,2)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            helper.edit('L18', '=ROUNDDOWN(D2<>E2,2)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('1');
            done();
        });
        it('ROUNDDOWN Formula with expression and cell references as arguments ->', (done: Function) => {
            helper.edit('L19', '=ROUNDDOWN(H4+I6+H10=E8,1)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('0');
            helper.edit('L20', '=ROUNDDOWN(A9+A10=A11,1)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('#VALUE!');
            helper.edit('L21', '=ROUNDDOWN(E8-E9-F10=D6,1)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('0');
            helper.edit('L22', '=ROUNDDOWN(H8-F6<>F4,0)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('1');
            helper.edit('L23', '=ROUNDDOWN(H7+34+D10-F9*A20=0,-1)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('0');
            done();
        });
        it('ROUNDDOWN Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('M1', '=ROUNDDOWN(D5,IF(2>1,TRUE,FALSE))');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('15');
            helper.edit('M2', '=ROUNDDOWN(ROUND(H4,4),2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('27');
            helper.edit('M3', '=ROUNDDOWN(PRODUCT(D2,2),4)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('20');
            helper.edit('M4', '=AVERAGE(10,20,ROUNDDOWN(H2,-3))');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('10');
            helper.edit('M5', '=ROUNDDOWN(H4,IF(I17>I14,2,3))');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('27');
            helper.edit('M6', '=SUM(ROUNDDOWN(129.99,0),1)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('130');
            helper.edit('M7', '=SUM(ROUNDDOWN(129.99,1),2)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('131.9');
            helper.edit('M8', '=SUM(ROUNDDOWN(129.99,-1),2)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('122');
            helper.edit('M9', '=ROUNDDOWN(D5,IF(2>1,"hello","world"))');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('ROUNDDOWN Formula with Empty arguments as input ->', (done: Function) => {
            helper.edit('M10', '=ROUNDDOWN("","")');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('#VALUE!');
            helper.edit('M11', '=ROUNDDOWN(102.22,"")');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('#VALUE!');
            helper.edit('M12', '=ROUNDDOWN(," ")');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#VALUE!');
            helper.edit('M13', '=ROUNDDOWN("",)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#VALUE!');
            helper.edit('M14', '=ROUNDDOWN(A20,0)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('0');
            helper.edit('M15', '=ROUNDDOWN(F22,C22)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('0');
            done();
        });
        it('ROUNDDOWN Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('M16', '=ROUNDDOWN(1213.32,$I$10)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('1213');
            helper.edit('M17', '=ROUNDDOWN($A$2,3)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#VALUE!');
            helper.edit('M18', '=ROUNDDOWN($H$5,$I$10)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('67');
            helper.edit('M19', '=ROUNDDOWN($I$6,-2)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('100');
            helper.edit('M20', '=ROUNDDOWN($F$9,$I$10)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('310');
            done();
        });
        it('ROUNDDOWN Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('N1', '=ROUNDDOWN(Sheet1!F2,Sheet2!A3)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('200');
            helper.edit('N2', '=ROUNDDOWN(Sheet2!A2,Sheet1!I10)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('20');
            helper.edit('N3', '=ROUNDDOWN(Sheet1!F2,Sheet1!A3)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('#VALUE!');
            helper.edit('N4', '=ROUNDDOWN(Sheet2!A22,Sheet2!A3)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('0');
            helper.edit('N5', '=ROUNDDOWN(F10,-Sheet2!A1)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('1200');
            done();
        });
        it('ROUNDDOWN Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('N6', '=ROUNDDOWN(Sheet1!$F$2,Sheet1!$I$10)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('200');
            helper.edit('N7', '=ROUNDDOWN(Sheet1!$F$2,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('200');
            helper.edit('N8', '=ROUNDDOWN(Sheet2!$A$2,Sheet1!$I$10)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('20');
            helper.edit('N9', '=ROUNDDOWN(Sheet2!$A$22,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('0');
            helper.edit('N10', '=ROUNDDOWN(F10,-Sheet2!$A$1)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('1200');
            helper.edit('N11', '=ROUNDDOWN($F$10,-Sheet2!A1)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('1200');
            done();
        });
        it('ROUNDDOWN Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('N12', '=ROUNDDOWN(,)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('0');
            helper.edit('N13', '=ROUNDDOWN(2343.456,)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('2343');
            helper.edit('N14', '=ROUNDDOWN(hello,12)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('#NAME?');
            helper.edit('N15', '=ROUNDDOWN(A4,A6)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('#VALUE!');
            helper.edit('N16', '=ROUNDDOWN(I21,2)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('#NUM!');
            done();
        });
        it('ROUNDDOWN Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ROUNDDOWN()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ROUNDDOWN()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O1', '=ROUNDDOWN(121,0)');
            spreadsheet.selectRange('O2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ROUNDDOWN(12,2,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ROUNDDOWN(12,2,2)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O2', '=ROUNDDOWN(12.32,1)');
            done();
        });
    });

    describe('EJ2-885263, EJ2-888011, EJ2-888038, EJ2-890143, EJ2-935939 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('The ROUNDDOWN function returns the wrong result when performing actions with decimal values->', (done: Function) => {
            helper.edit('A1', '=ROUNDDOWN(62427.81-41400.08,2)');
            expect(helper.invoke('getCell', [0, 0]).textContent).toBe('21027.73');
            helper.edit('A2', '=ROUNDDOWN(62427.91+41400.10,2)');
            expect(helper.invoke('getCell', [1, 0]).textContent).toBe('103828.01');
            helper.edit('A3', '=ROUNDDOWN(62427.881-41400.028,3)');
            expect(helper.invoke('getCell', [2, 0]).textContent).toBe('21027.853');
            helper.edit('A4', '=ROUNDDOWN(62427.001+41400.038,3)');
            expect(helper.invoke('getCell', [3, 0]).textContent).toBe('103827.039');
            helper.edit('A5', '=ROUNDDOWN(62427.0091-41400.1010,4)');
            expect(helper.invoke('getCell', [4, 0]).textContent).toBe('21026.9081');
            helper.edit('A6', '=ROUNDDOWN(62427.0001/21400.9999,3)');
            expect(helper.invoke('getCell', [5, 0]).textContent).toBe('2.917');
            helper.edit('A7', '=ROUNDDOWN(62427.10101-21400.91919,5)');
            expect(helper.invoke('getCell', [6, 0]).textContent).toBe('41026.18182');
            done();
        });
        it('The ROUND, ROUNDUP function returns the wrong result when performing actions with decimal values .499->', (done: Function) => {
            helper.edit('A11', '=ROUND(10.30499126239,2)');
            expect(helper.invoke('getCell', [10, 0]).textContent).toBe('10.3');
            helper.edit('A12', '=ROUND(10.30134499126239,5)');
            expect(helper.invoke('getCell', [11, 0]).textContent).toBe('10.30134');
            helper.edit('A13', '=ROUND(10.301349499126239,6)');
            expect(helper.invoke('getCell', [12, 0]).textContent).toBe('10.301349');
            helper.edit('A14', '=ROUNDDOWN(0.9999998,2)');
            expect(helper.invoke('getCell', [13, 0]).textContent).toBe('0.99');
            helper.edit('A15', '=ROUNDUP(0.720000000001,2)');
            expect(helper.invoke('getCell', [14, 0]).textContent).toBe('0.73');
            done();
        });
        it('When copy-pasting the formula with & operator is not getting updated properly ->', (done: Function) => {
            helper.edit('I8', '=A8&"-"&D8');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('Running Shoes-20');
            helper.invoke('copy', ['I8']).then(() => {
                helper.invoke('paste', ['I9']);
                expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=A9&"-"&D9');
                expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toBe('Loafers-31');
                done();
            });
        });
        it('Cell reference is not updated properly while copy-pasting the formula with extra space before the cell reference->', (done: Function) => {
            helper.edit('I8', '=CONCATENATE(A8, D8)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('Running Shoes20');
            helper.invoke('copy', ['I8']).then(() => {
                helper.invoke('paste', ['I9']);
                expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=CONCATENATE(A9, D9)');
                expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toBe('Loafers31');
                done();
            });
        });
        it('Cell reference is not updated properly while copy-pasting the formula with extra space after the cell reference ->', (done: Function) => {
            helper.edit('I8', '=CONCATENATE(A8,D8  )');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('Running Shoes20');
            helper.invoke('copy', ['I8']).then(() => {
                helper.invoke('paste', ['I9']);
                expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=CONCATENATE(A9,D9  )');
                expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toBe('Loafers31');
                done();
            });
        });
        it('Cell reference is not updated properly while copy-pasting the formula with extra space around the cell reference ->', (done: Function) => {
            helper.edit('I8', '=CONCATENATE( A8 , D8 )');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('Running Shoes20');
            helper.invoke('copy', ['I8']).then(() => {
                helper.invoke('paste', ['I9']);
                expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=CONCATENATE( A9 , D9 )');
                expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toBe('Loafers31');
                done();
            });
        });
        it('Checking #NAME error issue if the formula contains the defined name with underscore(_) cases', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'net_Income', refersTo: 'H2' });
            helper.edit('J2', '=net_Income+SUM(H3:H5)');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toEqual('=net_Income+SUM(H3:H5)');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toEqual('154');
            done();
        });
    });

    describe('Reported TRUNC Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TRUNC formula with direct value - 1->', (done: Function) => {
            helper.edit('I1', '=TRUNC("Hi")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"Hi\\")"}');
            done();
        });
        it('TRUNC formula with direct value - 2->', (done: Function) => {
            helper.edit('I2', '=TRUNC("",2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"\\",2)"}');
            done();
        });
        it('TRUNC formula with direct value - 3->', (done: Function) => {
            helper.edit('I3', '=TRUNC("TRUE",2)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"TRUE\\",2)"}');
            done();
        });
        it('TRUNC formula with direct value - 4->', (done: Function) => {
            helper.edit('I4', '=TRUNC("")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"\\")"}');
            done();
        });
        it('TRUNC formula with direct value - 5->', (done: Function) => {
            helper.edit('I5', '=TRUNC(" ")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\" \\")"}');
            done();
        });
        it('TRUNC formula with direct value - 6->', (done: Function) => {
            helper.edit('I6', '=TRUNC("        ",2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"        \\",2)"}');
            done();
        });
        it('TRUNC formula with direct value - 7->', (done: Function) => {
            helper.edit('I6', '=TRUNC("07-JUN", 2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('46180');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"46180","formula":"=TRUNC(\\"07-JUN\\", 2)"}');
            done();
        });
        it('TRUNC formula with direct value - 8->', (done: Function) => {
            helper.edit('I6', '=TRUNC("1+2", 2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"1+2\\", 2)"}');
            done();
        });
        it('TRUNC formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '"65.678"');
            helper.edit('J2', '"112"');
            helper.edit('J3', '"0"');
            helper.edit('J4', '""');
            helper.edit('J5', '"TRUE"');
            helper.edit('J6', '"-5"');
            helper.edit('J7', '=TRUNC(J1,2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J1,2)"}');
            done();
        });
        it('TRUNC formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J2,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J2,3)"}');
            done();
        });
        it('TRUNC formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J3)"}');
            done();
        });
        it('TRUNC formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J4)"}');
            done();
        });
        it('TRUNC formula with cell reference - 5->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J5)"}');
            done();
        });
        it('TRUNC formula with cell reference - 6->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J6,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J6,1)"}');
            done();
        });
        it('TRUNC formula with cell reference - 7->', (done: Function) => {
            helper.edit('J1', '""');
            helper.edit('J2', '"0"');
            helper.edit('J3', '" "');
            helper.edit('J4', '"     "');
            helper.edit('J7', '=TRUNC(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J1)"}');
            done();
        });
        it('TRUNC formula with cell reference - 8->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J2,2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J2,2)"}');
            done();
        });
        it('TRUNC formula with cell reference - 9->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J3)"}');
            done();
        });
        it('TRUNC formula with cell reference - 10->', (done: Function) => {
            helper.edit('J7', '=TRUNC(J4,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J4,3)"}');
            done();
        });
        it('TRUNC formula with sheet reference - 1->', (done: Function) => {
            helper.edit('J1', '"65.678"');
            helper.edit('J2', '70.356829');
            helper.edit('J3', '"TRUE"');
            helper.edit('J4', '"33"');
            helper.edit('J7', '=TRUNC(Sheet1!J1,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(Sheet1!J1,1)"}');
            done();
        });
        it('TRUNC formula with sheet reference - 2->', (done: Function) => {
            helper.edit('J7', '=TRUNC(Sheet1!J2,J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(Sheet1!J2,J3)"}');
            done();
        });
        it('TRUNC formula with sheet reference - 3->', (done: Function) => {
            helper.edit('J7', '=TRUNC(Sheet1!J2,"-3")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0","formula":"=TRUNC(Sheet1!J2,\\"-3\\")"}');
            done();
        });
        it('TRUNC formula with sheet reference - 4->', (done: Function) => {
            helper.edit('J7', '=TRUNC($J$4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC($J$4)"}');
            done();
        });
        it('TRUNC formula with sheet reference - 5->', (done: Function) => {
            helper.edit('J1', '3/4/2023');
            helper.edit('J7', '=TRUNC(Sheet1!J1,"-3")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('44000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"44000","formula":"=TRUNC(Sheet1!J1,\\"-3\\")"}');
            done();
        });
        it('TRUNC formula with different datatype - 1->', (done: Function) => {
            helper.edit('J7', '=TRUNC(6.078%,4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.0607');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0.0607","formula":"=TRUNC(6.078%,4)"}');
            done();
        });
        it('TRUNC formula with different datatype - 2->', (done: Function) => {
            helper.edit('J7', '=TRUNC("13:34",2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.56');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0.56","formula":"=TRUNC(\\"13:34\\",2)"}');
            done();
        });
        it('TRUNC formula with different datatype - 3->', (done: Function) => {
            helper.edit('J1', '"-3.45"');
            helper.edit('J7', '=TRUNC(J1,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(J1,3)"}');
            done();
        });
        it('TRUNC formula with different datatype - 4->', (done: Function) => {
            helper.edit('J7', '=TRUNC("Flip",3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"Flip\\",3)"}');
            done();
        });
        it('TRUNC formula with different datatype - 5->', (done: Function) => {
            helper.edit('J7', '=TRUNC(44.2347891, {2.79})');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('44.23');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"44.23","formula":"=TRUNC(44.2347891, {2.79})"}');
            done();
        });
        it('TRUNC formula with different datatype - 6->', (done: Function) => {
            helper.edit('J7', '=TRUNC(44.2347891, {"3"})');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('44.234');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"44.234","formula":"=TRUNC(44.2347891, {\\"3\\"})"}');
            done();
        });
        it('TRUNC formula with different datatype - 7->', (done: Function) => {
            helper.edit('J1', '1.00E+01');
            helper.edit('J7', '=TRUNC(J1,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"10","formula":"=TRUNC(J1,3)"}');
            done();
        });
        it('TRUNC formula with different datatype - 8->', (done: Function) => {
            helper.edit('J1', '300');
            helper.edit('J7', '=TRUNC(J1,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('300');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"300","formula":"=TRUNC(J1,1)"}');
            done();
        });
        it('TRUNC formula with different datatype - 9->', (done: Function) => {
            helper.edit('J1', '1000.00%');
            helper.edit('J7', '=TRUNC(J1,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"10","formula":"=TRUNC(J1,1)"}');
            done();
        });
        it('TRUNC formula with different datatype - 10->', (done: Function) => {
            helper.edit('J4', '6/23/2014');
            helper.edit('J7', '=TRUNC(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('41813');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"41813","formula":"=TRUNC(J4)"}');
            done();
        });
        it('TRUNC formula with different datatype - 11->', (done: Function) => {
            helper.edit('J4', '12/5/2013 4:45:00 PM');
            helper.edit('J7', '=TRUNC(J4,10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('41613.69792');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"41613.6979166666","formula":"=TRUNC(J4,10)"}');
            done();
        });
        it('TRUNC formula with specific cases - 1->', (done: Function) => {
            helper.edit('J7', '=TRUNC(2+"3.45890", 2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(2+\\"3.45890\\", 2)"}');
            done();
        });
        it('TRUNC formula with specific cases - 2->', (done: Function) => {
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, 3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, 3)"}');
            done();
        });
        it('TRUNC formula with specific cases - 3->', (done: Function) => {
            helper.edit('J7', '=TRUNC("23.45 "* "1.0009", 4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.45 \\"* \\"1.0009\\", 4)"}');
            done();
        });
        it('TRUNC formula with specific cases - 4->', (done: Function) => {
            helper.edit('J7', '=TRUNC("34.7980"/2, 2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"34.7980\\"/2, 2)"}');
            done();
        });
        it('TRUNC formula with specific cases - 5->', (done: Function) => {
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, TRUE)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, TRUE)"}');
            done();
        });
        it('TRUNC formula with specific cases - 6->', (done: Function) => {
            helper.edit('J1', 'TRUE');
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, J1)"}');
            done();
        });
        it('TRUNC formula with specific cases - 7->', (done: Function) => {
            helper.edit('J1', 'FALSE');
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, J1)"}');
            done();
        });
        it('TRUNC formula with specific cases - 8->', (done: Function) => {
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, 2.65)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, 2.65)"}');
            done();
        });
        it('TRUNC formula with specific cases - 9->', (done: Function) => {
            helper.edit('J1', '6.67');
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, J1)"}');
            done();
        });
        it('TRUNC formula with specific cases - 10->', (done: Function) => {
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, 300%)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, 300%)"}');
            done();
        });
        it('TRUNC formula with specific cases - 11->', (done: Function) => {
            helper.edit('J1', '6/7/2024');
            helper.edit('J7', '=TRUNC("23.1034" + 4.67, J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=TRUNC(\\"23.1034\\" + 4.67, J1)"}');
            done();
        });
    });

    describe('Reported INT Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('INT formula with direct value - 1->', (done: Function) => {
            helper.edit('I1', '=INT("Hi")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\"Hi\\")"}');
            done();
        });
        it('INT formula with direct value - 2->', (done: Function) => {
            helper.edit('I2', '=INT("")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\"\\")"}');
            done();
        });
        it('INT formula with direct value - 3->', (done: Function) => {
            helper.edit('I3', '=INT("TRUE")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\"TRUE\\")"}');
            done();
        });
        it('INT formula with direct value - 4->', (done: Function) => {
            helper.edit('I4', '=INT(3/4/2023)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":0,"formula":"=INT(3/4/2023)"}');
            done();
        });
        it('INT formula with direct value - 5->', (done: Function) => {
            helper.edit('I5', '=INT("3/4/2023")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('44989');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":44989,"formula":"=INT(\\"3/4/2023\\")"}');
            done();
        });
        it('INT formula with direct value - 6->', (done: Function) => {
            helper.edit('I6', '=INT("07-JUN")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('46180');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":46180,"formula":"=INT(\\"07-JUN\\")"}');
            done();
        });
        it('INT formula with direct value - 7->', (done: Function) => {
            helper.edit('I7', '=INT(" ")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\" \\")"}');
            done();
        });
        it('INT formula with direct value - 8->', (done: Function) => {
            helper.edit('I8', '=INT("    ")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\"    \\")"}');
            done();
        });
        it('INT formula with direct value - 9->', (done: Function) => {
            helper.edit('I2', '=INT("")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=INT(\\"\\")"}');
            done();
        });
        it('INT formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '"65.678"');
            helper.edit('J2', '"112"');
            helper.edit('J3', 'hi');
            helper.edit('J4', '"0"');
            helper.edit('J5', '""');
            helper.edit('J6', '"TRUE"');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=INT(J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J2)"}');
            done();
        });
        it('INT formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=INT(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J3)"}');
            done();
        });
        it('INT formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=INT(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J4)"}');
            done();
        });
        it('INT formula with cell reference - 5->', (done: Function) => {
            helper.edit('J7', '=INT(J5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J5)"}');
            done();
        });
        it('INT formula with cell reference - 6->', (done: Function) => {
            helper.edit('J7', '=INT(J6)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J6)"}');
            done();
        });
        it('INT formula with cell reference - 7->', (done: Function) => {
            helper.edit('J1', '"-5"');
            helper.edit('J2', '"Hi"');
            helper.edit('J3', '6+2.83');
            helper.edit('J4', '2*7');
            helper.edit('J5', '22/2');
            helper.edit('J6', '15-3');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with cell reference - 8->', (done: Function) => {
            helper.edit('J7', '=INT(J8)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(J8)"}');
            done();
        });
        it('INT formula with cell reference - 9->', (done: Function) => {
            helper.edit('J7', '=INT(J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J2)"}');
            done();
        });
        it('INT formula with cell reference - 10->', (done: Function) => {
            helper.edit('J7', '=INT(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J3)"}');
            done();
        });
        it('INT formula with cell reference - 11->', (done: Function) => {
            helper.edit('J7', '=INT(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J4)"}');
            done();
        });
        it('INT formula with cell reference - 12->', (done: Function) => {
            helper.edit('J7', '=INT(J5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J5)"}');
            done();
        });
        it('INT formula with cell reference - 13->', (done: Function) => {
            helper.edit('J7', '=INT(J6)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J6)"}');
            done();
        });
        it('INT formula with cell reference - 14->', (done: Function) => {
            helper.edit('J1', '""');
            helper.edit('J2', '"0"');
            helper.edit('J3', '"03/04/2023"');
            helper.edit('J4', '"07-JUN"');
            helper.edit('J5', '" "');
            helper.edit('J6', '"     "');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with cell reference - 15->', (done: Function) => {
            helper.edit('J7', '=INT(J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J2)"}');
            done();
        });
        it('INT formula with cell reference - 16->', (done: Function) => {
            helper.edit('J7', '=INT(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J3)"}');
            done();
        });
        it('INT formula with cell reference - 17->', (done: Function) => {
            helper.edit('J7', '=INT(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J4)"}');
            done();
        });
        it('INT formula with cell reference - 18->', (done: Function) => {
            helper.edit('J7', '=INT(J5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J5)"}');
            done();
        });
        it('INT formula with cell reference - 19->', (done: Function) => {
            helper.edit('J7', '=INT(J6)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J6)"}');
            done();
        });
        it('INT formula with cell reference - 20->', (done: Function) => {
            helper.edit('J1', '123Hello');
            helper.edit('J7', '=INT($J$1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT($J$1)"}');
            done();
        });
        it('INT formula with cell reference - 21->', (done: Function) => {
            helper.edit('J1', '"33"');
            helper.edit('J7', '=INT($J$1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT($J$1)"}');
            done();
        });
        it('INT formula with cell reference - 22->', (done: Function) => {
            helper.edit('J1', '3/4/2023');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('44989');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":44989,"formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with sheet reference - 1->', (done: Function) => {
            helper.edit('J1', '6+2.83');
            helper.edit('J2', '"65.678"');
            helper.edit('J3', 'o');
            helper.edit('J7', '=INT(Sheet1!J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(Sheet1!J1)"}');
            done();
        });
        it('INT formula with sheet reference - 2->', (done: Function) => {
            helper.edit('J7', '=INT(Sheet1!J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(Sheet1!J2)"}');
            done();
        });
        it('INT formula with sheet reference - 3->', (done: Function) => {
            helper.edit('J7', '=INT(Sheet1!$J$2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(Sheet1!$J$2)"}');
            done();
        });
        it('INT formula with sheet reference - 4->', (done: Function) => {
            helper.edit('J7', '=INT(Sheet1!$J$10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(Sheet1!$J$10)"}');
            done();
        });
        it('INT formula with sheet reference - 5->', (done: Function) => {
            helper.edit('J7', '=INT(Sheet1!$J10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(Sheet1!$J10)"}');
            done();
        });
        it('INT formula with different datatype - 1->', (done: Function) => {
            helper.edit('J7', '=INT(6.078%)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(6.078%)"}');
            done();
        });
        it('INT formula with different datatype - 2->', (done: Function) => {
            helper.edit('J1', '"-3.45"');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with different datatype - 3->', (done: Function) => {
            helper.edit('J7', '=INT(J10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(J10)"}');
            done();
        });
        it('INT formula with different datatype - 4->', (done: Function) => {
            helper.edit('J7', '=INT("Flip")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(\\"Flip\\")"}');
            done();
        });
        it('INT formula with different datatype - 5->', (done: Function) => {
            helper.edit('J1', 'Flip- Flops & Slippers');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with different datatype - 6->', (done: Function) => {
            helper.edit('J7', '=INT(6/23/2014)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(6/23/2014)"}');
            done();
        });
        it('INT formula with different datatype - 7->', (done: Function) => {
            helper.edit('J7', '=INT(0.122)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(0.122)"}');
            done();
        });
        it('INT formula with different datatype - 8->', (done: Function) => {
            helper.edit('J7', '=INT(2/3/2000)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(2/3/2000)"}');
            done();
        });
        it('INT formula with different datatype - 9->', (done: Function) => {
            helper.edit('J1', '1:45:00 PM');
            helper.edit('J7', '=INT(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=INT(J1)"}');
            done();
        });
        it('INT formula with different datatype - 10->', (done: Function) => {
            helper.edit('J7', '=INT(MONTH(21))');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":1,"formula":"=INT(MONTH(21))"}');
            done();
        });
        it('INT formula with different datatype - 11->', (done: Function) => {
            helper.edit('J7', '=INT(EXP(MONTH(SMALL(A2:A9, 4))))');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=INT(EXP(MONTH(SMALL(A2:A9, 4))))"}');
            done();
        });
    });

    describe('Reported LN Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('LN formula with specific cases - 1->', (done: Function) => {
            helper.edit('I1', '=LN("!")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"!\\")"}');
            done();
        });
        it('LN formula with specific cases - 2->', (done: Function) => {
            helper.edit('I2', '=LN("""")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"\\"\\"\\")"}');
            done();
        });
        it('LN formula with specific cases - 3->', (done: Function) => {
            helper.edit('I3', '=LN("""   ")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"\\"\\"   \\")"}');
            done();
        });
        it('LN formula with specific cases - 4->', (done: Function) => {
            helper.edit('I4', '=LN("  .67   """)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"  .67   \\"\\"\\")"}');
            done();
        });
        it('LN formula with direct value - 1->', (done: Function) => {
            helper.edit('I1', '=LN(Hi)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=LN(Hi)"}');
            done();
        });
        it('LN formula with direct value - 2->', (done: Function) => {
            helper.edit('I2', '=LN("")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"\\")"}');
            done();
        });
        it('LN formula with direct value - 3->', (done: Function) => {
            helper.edit('I3', '=LN(TRUE)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":0,"formula":"=LN(TRUE)"}');
            done();
        });
        it('LN formula with direct value - 4->', (done: Function) => {
            helper.edit('I4', '=LN(FALSE)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#NUM!","formula":"=LN(FALSE)"}');
            done();
        });
        it('LN formula with direct value - 5->', (done: Function) => {
            helper.edit('I5', '=LN("")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"\\")"}');
            done();
        });
        it('LN formula with direct value - 6->', (done: Function) => {
            helper.edit('I6', '=LN("3/4/2023")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('10.71417329');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":10.7141732944266,"formula":"=LN(\\"3/4/2023\\")"}');
            done();
        });
        it('LN formula with direct value - 7->', (done: Function) => {
            helper.edit('I7', '=LN(7-JUN)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#NAME?","formula":"=LN(7-JUN)"}');
            done();
        });
        it('LN formula with direct value - 8->', (done: Function) => {
            helper.edit('I8', '=LN("07-JUN")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('10.74030208');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":10.740302082908487,"formula":"=LN(\\"07-JUN\\")"}');
            done();
        });
        it('LN formula with direct value - 9->', (done: Function) => {
            helper.edit('I9', '=LN(" ")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\" \\")"}');
            done();
        });
        it('LN formula with direct value - 10->', (done: Function) => {
            helper.edit('I10', '=LN("       ")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":"#VALUE!","formula":"=LN(\\"       \\")"}');
            done();
        });
        it('LN formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '#REF!');
            helper.edit('J2', 'TRUE');
            helper.edit('J3', 'FALSE');
            helper.edit('J7', '=LN(J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#REF!","formula":"=LN(J1)"}');
            done();
        });
        it('LN formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=LN(J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=LN(J2)"}');
            done();
        });
        it('LN formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=LN(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=LN(J3)"}');
            done();
        });
        it('LN formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=LN(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=LN(J4)"}');
            done();
        });
        it('LN formula with sheet reference - 1->', (done: Function) => {
            helper.edit('J1', '#DIV/0!');
            helper.edit('J2', '#NUM!');
            helper.edit('J7', '=LN(Sheet1!J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#DIV/0!","formula":"=LN(Sheet1!J1)"}');
            done();
        });
        it('LN formula with sheet reference - 2->', (done: Function) => {
            helper.edit('J7', '=LN($J$2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=LN($J$2)"}');
            done();
        });
        it('LN formula with invalid arguements - 1->', (done: Function) => {
            helper.edit('J7', '=LN(6.078%)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-2.800494491');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":-2.80049449149349,"formula":"=LN(6.078%)"}');
            done();
        });
        it('LN formula with invalid arguements - 2->', (done: Function) => {
            helper.edit('J7', '=LN(MONTH(21))');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":0,"formula":"=LN(MONTH(21))"}');
            done();
        });
        it('LN formula with invalid arguements - 3->', (done: Function) => {
            helper.edit('A2', '103.32');
            helper.edit('A3', '104.32');
            helper.edit('A4', '105.32');
            helper.edit('A5', '106.32');
            helper.edit('A6', '107.32');
            helper.edit('A7', '108.32');
            helper.edit('A8', '109.32');
            helper.edit('A9', '110.32');
            helper.edit('J7', '=LN(EXP(MONTH(SMALL(A2:A9, 4))))');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":4,"formula":"=LN(EXP(MONTH(SMALL(A2:A9, 4))))"}');
            done();
        });
    });

    describe('Reported LOG Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('LOG formula with specific cases - 1->', (done: Function) => {
            helper.edit('I1', '=LOG(Hi/2,1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=LOG(Hi/2,1)"}');
            done();
        });
        it('LOG formula with specific cases - 2->', (done: Function) => {
            helper.edit('I2', '=LOG(123.686,"3.189")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('4.154277317');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"4.154277316577911","formula":"=LOG(123.686,\\"3.189\\")"}');
            done();
        });
        it('LOG formula with specific cases - 3->', (done: Function) => {
            helper.edit('I2', '=LOG(2+"3.45890", 2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(2+\\"3.45890\\", 2)"}');
            done();
        });
        it('LOG formula with specific cases - 4->', (done: Function) => {
            helper.edit('I2', '=LOG("23.1034" + 4.67, 3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(\\"23.1034\\" + 4.67, 3)"}');
            done();
        });
        it('LOG formula with specific cases - 5->', (done: Function) => {
            helper.edit('I2', '=LOG("23.45 "* "1.0009", 4)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(\\"23.45 \\"* \\"1.0009\\", 4)"}');
            done();
        });
        it('LOG formula with specific cases - 6->', (done: Function) => {
            helper.edit('I2', '=LOG("34.7980"/2, 2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(\\"34.7980\\"/2, 2)"}');
            done();
        });
        it('LOG formula with direct value - 1->', (done: Function) => {
            helper.edit('I1', '=LOG("6",2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2.584962501');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"2.584962500721156","formula":"=LOG(\\"6\\",2)"}');
            done();
        });
        it('LOG formula with direct value - 2->', (done: Function) => {
            helper.edit('I2', '=LOG("102.673902", 3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('4.215825741');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"4.2158257409110895","formula":"=LOG(\\"102.673902\\", 3)"}');
            done();
        });
        it('LOG formula with direct value - 3->', (done: Function) => {
            helper.edit('I3', '=LOG(Hi, 1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#NAME?","formula":"=LOG(Hi, 1)"}');
            done();
        });
        it('LOG formula with direct value - 4->', (done: Function) => {
            helper.edit('I4', '=LOG("", 2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(\\"\\", 2)"}');
            done();
        });
        it('LOG formula with direct value - 5->', (done: Function) => {
            helper.edit('I5', '=LOG("TRUE", 2)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#VALUE!","formula":"=LOG(\\"TRUE\\", 2)"}');
            done();
        });
        it('LOG formula with direct value - 6->', (done: Function) => {
            helper.edit('I6', '=LOG("-5.4678", 2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#NUM!","formula":"=LOG(\\"-5.4678\\", 2)"}');
            done();
        });
        it('LOG formula with direct value - 7->', (done: Function) => {
            helper.edit('I7', '=LOG(-6.0000001,7)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#NUM!","formula":"=LOG(-6.0000001,7)"}');
            done();
        });
        it('LOG formula with direct value - 8->', (done: Function) => {
            helper.edit('I8', '=LOG("0")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"#NUM!","formula":"=LOG(\\"0\\")"}');
            done();
        });
        it('LOG formula with direct value - 9->', (done: Function) => {
            helper.edit('I9', '=LOG(7-JUN)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"#NAME?","formula":"=LOG(7-JUN)"}');
            done();
        });
        it('LOG formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '24.0001');
            helper.edit('J2', '33.45');
            helper.edit('J3', '#REF!');
            helper.edit('J4', '"TRUE"');
            helper.edit('J5', '"-5"');
            helper.edit('J7', '=LOG(J1,"4")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2.292484256');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"2.2924842559689855","formula":"=LOG(J1,\\"4\\")"}');
            done();
        });
        it('LOG formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=LOG(J2,"2")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('5.063934306');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"5.063934305754099","formula":"=LOG(J2,\\"2\\")"}');
            done();
        });
        it('LOG formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=LOG(J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#REF!","formula":"=LOG(J3)"}');
            done();
        });
        it('LOG formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=LOG(J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=LOG(J4)"}');
            done();
        });
        it('LOG formula with cell reference - 5->', (done: Function) => {
            helper.edit('J7', '=LOG(J5,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=LOG(J5,1)"}');
            done();
        });
        it('LOG formula with sheet reference - 1->', (done: Function) => {
            helper.edit('J1', '#DIV/0!');
            helper.edit('J2', '"65.678"');
            helper.edit('J3', '#NUM!');
            helper.edit('J4', '"1"');
            helper.edit('J5', '#DIV/0!');
            helper.edit('J7', '=LOG(Sheet1!J1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#DIV/0!","formula":"=LOG(Sheet1!J1)"}');
            done();
        });
        it('LOG formula with sheet reference - 2->', (done: Function) => {
            helper.edit('J7', '=LOG(Sheet1!J2,1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=LOG(Sheet1!J2,1)"}');
            done();
        });
        it('LOG formula with sheet reference - 3->', (done: Function) => {
            helper.edit('J7', '=LOG($J$3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=LOG($J$3)"}');
            done();
        });
        it('LOG formula with sheet reference - 4->', (done: Function) => {
            helper.edit('J7', '=LOG(Sheet1!$J12,J$4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=LOG(Sheet1!$J12,J$4)"}');
            done();
        });
        it('LOG formula with sheet reference - 5->', (done: Function) => {
            helper.edit('J7', '=LOG(Sheet1!J5,J4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#DIV/0!","formula":"=LOG(Sheet1!J5,J4)"}');
            done();
        });
        it('LOG formula with different datatype - 1->', (done: Function) => {
            helper.edit('J7', '=LOG(44.2347891,{"3"})');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('3.449362075');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"3.4493620745861904","formula":"=LOG(44.2347891,{\\"3\\"})"}');
            done();
        });
        it('LOG formula with different datatype - 2->', (done: Function) => {
            helper.edit('J7', '=LOG(6.078%,4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-2.020129757');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"-2.0201297574572585","formula":"=LOG(6.078%,4)"}');
            done();
        });
        it('LOG formula with different datatype - 3->', (done: Function) => {
            helper.edit('J7', '=LOG("13:34",2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-0.822968112');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"-0.8229681120634277","formula":"=LOG(\\"13:34\\",2)"}');
            done();
        });
        it('LOG formula with different datatype - 4->', (done: Function) => {
            helper.edit('J7', '=LOG(MONTH(21), 2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"0","formula":"=LOG(MONTH(21), 2)"}');
            done();
        });
        it('LOG formula with different datatype - 5->', (done: Function) => {
            helper.edit('A2', '103.32');
            helper.edit('A3', '104.32');
            helper.edit('A4', '105.32');
            helper.edit('A5', '106.32');
            helper.edit('A6', '107.32');
            helper.edit('A7', '108.32');
            helper.edit('A8', '109.32');
            helper.edit('A9', '110.32');
            helper.edit('J7', '=LOG(EXP(MONTH(SMALL(A2:A9, 4))), 5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2.485339738');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"2.485339738238447","formula":"=LOG(EXP(MONTH(SMALL(A2:A9, 4))), 5)"}');
            done();
        });
    });

    describe('Formula - Checking X ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ISNUMBER Formula ->', (done: Function) => {
            helper.edit('I1', '=ISNUMBER(100)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":true,"formula":"=ISNUMBER(100)"}');
            done();
        });
        it('ISNUMBER Formula with no arguments->', (done: Function) => {
            helper.edit('I2', '=ISNUMBER()');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{}');
            done();
        });
        it('ISNUMBER Formula with more than 2 arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ISNUMBER(1,2,3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ISNUMBER(1,2,3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I3', '=ISNUMBER(1)');
            done();
        });
        it('POWER Formula ->', (done: Function) => {
            helper.edit('J1', '=POWER(2,3)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"8","formula":"=POWER(2,3)"}');
            done();
        });
        it('POWER Formula with more than 2 arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=POWER(1,2,3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=POWER(1,2,3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J2', '=POWER(1,2)');
            done();
        });
        it('POWER Formula with negative arguments->', (done: Function) => {
            helper.edit('J3', '=POWER(-2,3)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('-8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":"-8","formula":"=POWER(-2,3)"}');
            done();
        });
        it('POWER Formula with value as 0->', (done: Function) => {
            helper.edit('J4', '=POWER(0,-3)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"#DIV/0!","formula":"=POWER(0,-3)"}');
            done();
        });
        it('POWER Formula with both value and exponent as 0->', (done: Function) => {
            helper.edit('J5', '=POWER(0,0)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"#NUM!","formula":"=POWER(0,0)"}');
            done();
        });
        it('POWER Formula with string as arguments->', (done: Function) => {
            helper.edit('J6', '=POWER(a,b)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"#NAME?","formula":"=POWER(a,b)"}');
            done();
        });
        it('LOG Formula ->', (done: Function) => {
            helper.edit('K1', '=LOG(100,10)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"2","formula":"=LOG(100,10)"}');
            done();
        });
        it('LOG Formula with more than 2 arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LOG(1,2,3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LOG(1,2,3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K2', '=LOG(1,2)');
            done();
        });
        it('LOG Formula with both value and base as negative values->', (done: Function) => {
            helper.edit('K4', '=LOG(-100,-10)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NUM!","formula":"=LOG(-100,-10)"}');
            done();
        });
        it('LOG Formula with base value as 1->', (done: Function) => {
            helper.edit('K5', '=LOG(10,1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"#DIV/0!","formula":"=LOG(10,1)"}');
            done();
        });
        it('LOG Formula with string as arguments->', (done: Function) => {
            helper.edit('K6', '=LOG(a,b)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"#NAME?","formula":"=LOG(a,b)"}');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 2 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('POWER - INPUTS - I', (done: Function) => {
            helper.edit('L1', '=POWER(-3.4,-2.1)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":"#NUM!","formula":"=POWER(-3.4,-2.1)"}');
            done();
        });
        it('POWER - INPUTS - II', (done: Function) => {
            helper.edit('L2', '=POWER(-43,-3.34)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"#NUM!","formula":"=POWER(-43,-3.34)"}');
            done();
        });
        it('POWER - INPUTS - III', (done: Function) => {
            helper.edit('L3', '=POWER(-3.231,-2.345)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":"#NUM!","formula":"=POWER(-3.231,-2.345)"}');
            done();
        });
        it('POWER - INPUTS - IV', (done: Function) => {
            helper.edit('L4', '=POWER("3",3)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('27');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"27","formula":"=POWER(\\"3\\",3)"}');
            done();
        });
        it('POWER - INPUTS - V', (done: Function) => {
            helper.edit('L5', '=POWER(4,"2")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('16');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"16","formula":"=POWER(4,\\"2\\")"}');
            done();
        });
        it('POWER - INPUTS - VI', (done: Function) => {
            helper.edit('L6', '=POWER("3","2")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('9');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"9","formula":"=POWER(\\"3\\",\\"2\\")"}');
            done();
        });
        it('POWER - INPUTS - VII', (done: Function) => {
            helper.edit('L7', '=POWER("-3","-2")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('0.111111111');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":"0.1111111111111111","formula":"=POWER(\\"-3\\",\\"-2\\")"}');
            done();
        });
        it('POWER - INPUTS - VIII', (done: Function) => {
            helper.edit('L8', '=POWER("3.23","-2.1")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('0.085246136');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"0.08524613609942705","formula":"=POWER(\\"3.23\\",\\"-2.1\\")"}');
            done();
        });
        it('POWER - INPUTS - IX', (done: Function) => {
            helper.edit('L9', '=POWER("-3.23","-1.23")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"#NUM!","formula":"=POWER(\\"-3.23\\",\\"-1.23\\")"}');
            done();
        });
        it('POWER - INPUTS - X', (done: Function) => {
            helper.edit('L10', '=POWER("3",2.6)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('17.3986384');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":"17.398638404385867","formula":"=POWER(\\"3\\",2.6)"}');
            done();
        });
        it('POWER - INPUTS - XI', (done: Function) => {
            helper.edit('L11', '=POWER("TRUE",2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[11])).toBe('{"value":"#VALUE!","formula":"=POWER(\\"TRUE\\",2)"}');
            done();
        });
        it('POWER - INPUTS - XII', (done: Function) => {
            helper.edit('L12', '=POWER("FALSE",2)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"#VALUE!","formula":"=POWER(\\"FALSE\\",2)"}');
            done();
        });
        it('POWER - INPUTS - XIII', (done: Function) => {
            helper.edit('L13', '=POWER(4,"TRUE")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":"#VALUE!","formula":"=POWER(4,\\"TRUE\\")"}');
            done();
        });
        it('POWER - INPUTS - XIV', (done: Function) => {
            helper.edit('L14', '=POWER(pow,2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"#NAME?","formula":"=POWER(pow,2)"}');
            done();
        });
        it('POWER - INPUTS - XV', (done: Function) => {
            helper.edit('L15', '=POWER(kert,"kel")');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[11])).toBe('{"value":"#NAME?","formula":"=POWER(kert,\\"kel\\")"}');
            done();
        });
        it('POWER - INPUTS - XVI', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Power1', refersTo: 'D6' });
            helper.edit('L16', '=POWER(32,Power1)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('1.42724769270596e+45');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[11])).toBe('{"value":"1.42724769270596e+45","formula":"=POWER(32,Power1)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - I', (done: Function) => {
            helper.edit('I26', '1/4');
            helper.edit('M1', '=POWER(11,I26)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(11,I26)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - II', (done: Function) => {
            helper.edit('I27', '1/6');
            helper.edit('M2', '=POWER(5,I27)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(5,I27)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - III', (done: Function) => {
            helper.edit('I25', '1/3');
            helper.edit('M3', '=POWER(6,I25)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(6,I25)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - IV', (done: Function) => {
            helper.edit('E27', '-3.23');
            helper.edit('F28', '-3.2');
            helper.edit('M4', '=POWER(E27,F28)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(E27,F28)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - V', (done: Function) => {
            helper.edit('F28', '-3.2');
            helper.edit('G24', '-3.2');
            helper.edit('M5', '=POWER(F28,G24)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(F28,G24)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - VI', (done: Function) => {
            helper.edit('B24', '"TRUE"');
            helper.edit('M6', '=POWER(B24,2)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":"#VALUE!","formula":"=POWER(B24,2)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - VII', (done: Function) => {
            helper.edit('B25', '"FALSE"');
            helper.edit('M7', '=POWER(B25,3)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"#VALUE!","formula":"=POWER(B25,3)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - VIII', (done: Function) => {
            helper.edit('B24', '"TRUE"');
            helper.edit('M8', '=POWER(4,B24)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":"#VALUE!","formula":"=POWER(4,B24)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - IX', (done: Function) => {
            helper.edit('B25', '"FALSE"');
            helper.edit('M9', '=POWER(32,B25)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":"#VALUE!","formula":"=POWER(32,B25)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - X', (done: Function) => {
            helper.edit('B3', '6/11/2014');
            helper.edit('J15', '4');
            helper.edit('M10', '=POWER(J15,B3)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(J15,B3)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XI', (done: Function) => {
            helper.edit('F10', '$110.00');
            helper.edit('C25', '3');
            helper.edit('M11', '=POWER(C25,F10)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('3.043252722170454e+52');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":"3.043252722170454e+52","formula":"=POWER(C25,F10)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XII', (done: Function) => {
            helper.edit('C26', '4');
            helper.edit('I7', '108.32');
            helper.edit('M12', '=POWER(C26,I7)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('1.6411121494202909e+65');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":"1.6411121494202909e+65","formula":"=POWER(C26,I7)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XIII', (done: Function) => {
            helper.edit('I24', '1/2');
            helper.edit('M13', '=POWER(3,I24)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(3,I24)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XIV', (done: Function) => {
            helper.edit('I27', '1/6');
            helper.edit('M14', '=POWER(34,I27)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(34,I27)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XV', (done: Function) => {
            helper.edit('E17', '#NUM!');
            helper.edit('M15', '=POWER(E17,3)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[12])).toBe('{"value":"#NUM!","formula":"=POWER(E17,3)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XVI', (done: Function) => {
            helper.edit('E15', '#NAME?');
            helper.edit('M16', '=POWER(E15,"pow")');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[12])).toBe('{"value":"#NAME?","formula":"=POWER(E15,\\"pow\\")"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XVII', (done: Function) => {
            helper.edit('E15', '#NAME?');
            helper.edit('E16', '#DIV/0!');
            helper.edit('M17', '=POWER(E16,E15)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[12])).toBe('{"value":"#DIV/0!","formula":"=POWER(E16,E15)"}');
            done();
        });
        it('POWER - CELL REFEREMCE - XVIII', (done: Function) => {
            helper.edit('$E$16', '#DIV/0!');
            helper.edit('$H$20', '2');
            helper.edit('M18', '=POWER($E$16,$H$20)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[12])).toBe('{"value":"#DIV/0!","formula":"=POWER($E$16,$H$20)"}');
            done();
        });
    });

    describe('EJ2-850735 -> SQRT Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] },
                        { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '0' }] }, { cells: [{ value: '1' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SQRT Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=SQRT(121)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('11');
            helper.edit('J2', '=SQRT(0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            helper.edit('J3', '=SQRT(21232323)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('4607.85449');
            helper.edit('J4', '=SQRT(-3221)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#NUM!');
            helper.edit('J5', '=SQRT(2121.232)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('46.05683445');
            done();
        });
        it('SQRT Formula with direct values and cell references as boolean arguments ->', (done: Function) => {
            helper.edit('J6', '=SQRT(TRUE)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('1');
            helper.edit('J7', '=SQRT(FALSE)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J8', '=SQRT("TRUE")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#VALUE!');
            helper.edit('J9', '=SQRT("FALSE")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#VALUE!');
            helper.edit('J10', '=SQRT(I3)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1');
            helper.edit('J11', '=SQRT(I4)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0');
            done();
        });
        it('SQRT Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J12', '=SQRT("HELLO")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#VALUE!');
            helper.edit('J13', '=SQRT("Hello123")');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('#VALUE!');
            helper.edit('J14', '=SQRT("123Hell123")');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#VALUE!');
            helper.edit('J15', '=SQRT("123HEllo")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('SQRT Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J16', '=SQRT(1+3)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('2');
            helper.edit('J17', '=SQRT(32323+33)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('179.8777363');
            helper.edit('J18', '=SQRT(90-3232)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('#NUM!');
            helper.edit('J19', '=SQRT(32322*3232-3223)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('10220.63995');
            helper.edit('J20', '=SQRT(1+32-22)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('3.31662479');
            helper.edit('J21', '=SQRT(1+"HELLO")');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#VALUE!');
            helper.edit('J22', '=SQRT(121.323-32.3232)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('9.433970532');
            helper.edit('J23', '=SQRT(1>5)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('0');
            helper.edit('J24', '=SQRT("34/3")');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('SQRT Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('K1', '=SQRT(A3)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            helper.edit('K2', '=SQRT(B4)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('204.565393');
            helper.edit('K3', '=SQRT(C5)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0.516330536');
            helper.edit('K4', '=SQRT(D6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('5.477225575');
            helper.edit('K5', '=SQRT(I7)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('10.26450194');
            helper.edit('K6', '=SQRT(I9)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#NUM!');
            helper.edit('K7', '=SQRT(I10)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0');
            helper.edit('K8', '=SQRT(I11)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#VALUE!');
            helper.edit('K9', '=SQRT(I13)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('10.90871211');
            helper.edit('K10', '=SQRT(I15)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('10.90871211');
            helper.edit('K11', '=SQRT(I17)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('3.464101615');
            helper.edit('K12', '=SQRT(I20)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('10.72380529');
            done();
        });
        it('SQRT Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('K13', '=SQRT(E3>32)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('0');
            helper.edit('K14', '=SQRT(E3<32)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('1');
            helper.edit('K15', '=SQRT(F5<=F6)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('1');
            helper.edit('K16', '=SQRT(F5>=F6)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('1');
            helper.edit('K17', '=SQRT(F5=F6)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('1');
            helper.edit('K18', '=SQRT(F5<>F6)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('0');
            done();
        });
        it('SQRT Formula with expression and cell references as arguments ->', (done: Function) => {
            helper.edit('K19', '=SQRT(H4+I6+H10=E8)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('0');
            helper.edit('K20', '=SQRT(A9+A10 =A11)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('#VALUE!');
            helper.edit('K21', '=SQRT(E8-E9-F10=D6)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('0');
            helper.edit('K22', '=SQRT(H8-F6<>F4)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('1');
            helper.edit('K23', '=SQRT(H7+34+D10-F9*A20=0)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('0');
            done();
        });
        it('SQRT Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L1', '=SQRT(ABS(-9))');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('3');
            helper.edit('L2', '=SQRT(SUM(12,21))');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('5.744562647');
            helper.edit('L3', '=SUM(SQRT(121),0)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('11');
            helper.edit('L4', '=IF(SQRT(121)> 100, 10,20)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('20');
            helper.edit('L5', '=IF(SQRT(121)< 100, 10,20)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('10');
            helper.edit('L6', '=SQRT(OR(10,20))');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('1');
            helper.edit('L7', '=MEDIAN(SQRT(G10),2,10,20)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('6.732050808');
            helper.edit('L8', '=AND(SQRT(132))');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('TRUE');
            helper.edit('L9', '=NOT(SQRT(0))');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('TRUE');
            done();
        });
        it('SQRT Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('L10', '=SQRT($I$19)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('1.414213562');
            helper.edit('L11', '=SQRT($A$11)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            helper.edit('L12', '=SQRT($E$1>$E$3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('1');
            helper.edit('L13', '=SQRT($F$2+$E$2=$F$3)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            done();
        });
        it('SQRT Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('L14', '=SQRT(Sheet1!F2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('14.14213562');
            helper.edit('L15', '=SQRT(Sheet2!A2)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('4.472135955');
            helper.edit('L16', '=SQRT(Sheet1!A10 * Sheet2!A5 = Sheet1!H10)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            helper.edit('L17', '=SQRT(Sheet1!D31+Sheet2!A3 = 30)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            helper.edit('L18', '=SQRT(E9-E11=Sheet1!I10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('1');
            done();
        });
        it('SQRT Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('L19', '=SQRT(Sheet1!$I$19)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('1.414213562');
            helper.edit('L20', '=SQRT(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('4.472135955');
            helper.edit('L21', '=SQRT(Sheet1!$I$9)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('#NUM!');
            helper.edit('L22', '=SQRT(Sheet2!$A$10)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('0');
            helper.edit('L23', '=SQRT(Sheet1!$D$31+Sheet2!$A$3 = 30)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('0');
            helper.edit('L24', '=SQRT(Sheet1!$A$10 * Sheet2!$A$5 = Sheet1!H10)');
            expect(helper.invoke('getCell', [23, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('SQRT Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M1', '=SQRT("")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#VALUE!');
            helper.edit('M2', '=SQRT(-1212)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NUM!');
            helper.edit('M3', '=SQRT(HELLO)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#NAME?');
            helper.edit('M4', '=SQRT("@")');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            helper.edit('M5', '=SQRT("NEET")');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('SQRT Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('M6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SQRT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SQRT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M6', '=SQRT(121)');
            spreadsheet.selectRange('M7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SQRT(12,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SQRT(12,2)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M7', '=SQRT(10)');
            spreadsheet.selectRange('M8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SQRT(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SQRT(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M8', '=SQRT(0)');
            done();
        });
    });

    describe('Reported EXP formula - Checking -> I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '"Hi"' }] }, { cells: [{ value: '98.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '-54' }] }, { cells: [{ value: '32' }] }, { cells: [{ value: 'one' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EXP formula with cell Reference - 0->', (done: Function) => {
            helper.edit('H1', '"TRUE"');
            done();
        });
        it('EXP formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=EXP("6")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('403.4287935');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"403.4287934927351","formula":"=EXP(\\"6\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=EXP("102")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1.9862648361376543e+44');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1.9862648361376543e+44","formula":"=EXP(\\"102\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=EXP("Hi")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\"Hi\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=EXP("")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\"\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=EXP("TRUE")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\"TRUE\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=EXP("-5")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.006737947');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.006737946999085467","formula":"=EXP(\\"-5\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=EXP("-3.45")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.031745636');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.03174563637806794","formula":"=EXP(\\"-3.45\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=EXP("0")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=EXP(\\"0\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=EXP(" ")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\" \\")"}');
            done();
        });
        it('EXP formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=EXP("       ")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\"       \\")"}');
            done();
        });
        it('EXP formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=EXP(H1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(H1)"}');
            done();
        });
        it('EXP formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=EXP("Flip")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=EXP(\\"Flip\\")"}');
            done();
        });
        it('EXP formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=EXP(1:10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=EXP(1:10)"}');
            done();
        });
        it('EXP formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=EXP(6%)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1.061836547');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1.0618365465453596","formula":"=EXP(6%)"}');
            done();
        });
    });

    describe('MOD formula checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '-23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '-567.547' }] }, { cells: [{ value: '-89,789' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MOD formula with string values', (done: Function) => {
            helper.edit('I2', '=MOD("3.7","2")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1.7');
            helper.edit('I3', '=MOD("-2.5","-2")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('-0.5');
            helper.edit('I4', '=MOD(A1,2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            helper.edit('I5', '=MOD(" "," ")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            helper.edit('I6', '=MOD("","")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            helper.edit('I7', '=MOD(123,"TRUE")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            helper.edit('I8', '=MOD(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I9', '=MOD(123,"TRUE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I10', '=MOD(123,"FALSE")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('MOD formula with boolean values', (done: Function) => {
            helper.edit('J2', '=MOD(TRUE,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            helper.edit('J3', '=MOD(FALSE,FALSE)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J4', '=MOD(123,FALSE)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J5', '=MOD(TRUE,1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            helper.edit('J6', '=MOD(FALSE,1)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=MOD(IF(2>1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J8', '=MOD(IF(2<1,TRUE,FALSE),1)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0');
            done();
        });
        it('MOD formula with basic values', (done: Function) => {
            helper.edit('K2', '=MOD(3.7,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1.7');
            helper.edit('K3', '=MOD(-2.5,-2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('-0.5');
            helper.edit('K4', '=MOD(2.5,-2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('-1.5');
            helper.edit('K5', '=MOD(2.5,-2)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('-1.5');
            helper.edit('K6', '=MOD(1.58,0.1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('0.08');
            helper.edit('K7', '=MOD(0.234,0.01)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0.004');
            helper.edit('K8', '=MOD(,)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#DIV/0!');
            done();
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('L2', '=MOD($G$3,2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('1');
            helper.edit('L3', '=MOD($G$4,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('1');
            helper.edit('L4', '=MOD($G$5,5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('1');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('L5', '=MOD(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('0.544');
            helper.edit('L6', '=MOD(Sheet2!A2,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('0.45556');
            helper.edit('L7', '=MOD(Sheet2!A3,3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('2.453');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('L8', '=MOD(Sheet2!$A$1,1)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('0.544');
            helper.edit('L9', '=MOD(Sheet2!$A$2,2)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('0.45556');
            helper.edit('L10', '=MOD(Sheet2!$A$3,3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('2.453');
            done();
        });
        it('nested formula with MOD', function (done) {
            helper.edit('L11', '=MOD(SUM(1,2),2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('1');
            helper.edit('L12', '=MOD(SUM(1,G10),2)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('1');
            helper.edit('L13', '=MOD(PRODUCT(1,G10),12)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            helper.edit('L14', '=MOD(PRODUCT(1,2),2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0');
            helper.edit('L15', '=MOD(AVERAGE(G3:G7),10)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('9.2');
            helper.edit('L16', '=MOD(MIN(G3:G9),12)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('3');
            helper.edit('L17', '=MOD(MAX(G3:G9),9)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('4');
            helper.edit('L18', '=MOD(IF(A2>A5,2,3),2)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('1');
            helper.edit('L19', '=MIN(MOD(22,3), MOD(12,5))');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('1');
            helper.edit('L20', '=MAX(MOD(22,3), MOD(12,5))');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('2');
            helper.edit('L21', '=SUM(MOD(22,3), MOD(12,5))');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('3');
            done();
        });
    });

    describe('sheet reference check for ODD formula', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '23.345' }] },
                    { cells: [{ value: '-7651.34' }] }, { cells: [{ value: '-456' }] }, { cells: [{ value: '45' }] },
                    { cells: [{ value: '34' }] }, { cells: [{ value: '22' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('I2', '=ODD($G$3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('5');
            helper.edit('I3', '=ODD($G$4)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('7');
            helper.edit('I4', '=ODD($G$5)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('11');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('I5', '=ODD(Sheet2!A1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('25');
            helper.edit('I6', '=ODD(Sheet2!A2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('-7653');
            helper.edit('I7', '=ODD(Sheet2!A3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('-457');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('I5', '=ODD(Sheet2!$A$1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('25');
            helper.edit('I6', '=ODD(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('-7653');
            helper.edit('I7', '=ODD(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('-457');
            done();
        });
    });

    describe('Sheet reference check for EVEN formula', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '23.456' }] },
                    { cells: [{ value: '234.45556' }] }, { cells: [{ value: '567' }] }, { cells: [{ value: '89' }] },
                    { cells: [{ value: '-345' }] }, { cells: [{ value: '-34.54' }] }, { cells: [{ value: '13972' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('absolute cell reference check', (done: Function) => {
            helper.edit('I2', '=EVEN($G$3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('6');
            helper.edit('I3', '=EVEN($G$4)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('8');
            helper.edit('I4', '=EVEN($G$5)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('12');
            done();
        });
        it('external sheet reference check', (done: Function) => {
            helper.edit('I5', '=EVEN(Sheet2!A1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('24');
            helper.edit('I6', '=EVEN(Sheet2!A2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('236');
            helper.edit('I7', '=EVEN(Sheet2!A3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('568');
            done();
        });
        it('external sheet with absolute reference check', (done: Function) => {
            helper.edit('I5', '=EVEN(Sheet2!$A$1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('24');
            helper.edit('I6', '=EVEN(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('236');
            helper.edit('I7', '=EVEN(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('568');
            done();
        });
    });

    describe('Reported FACT formula - Checking -> I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '"Hi"' }] }, { cells: [{ value: '98.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '-54' }] }, { cells: [{ value: '32' }] }, { cells: [{ value: 'one' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('FACT formula with cell Reference - 0->', (done: Function) => {
            helper.edit('H1', '#REF!');
            helper.edit('H2', '"65"');
            helper.edit('H3', '"112"');
            helper.edit('H4', '"0"');
            helper.edit('H5', '""');
            helper.edit('H6', 'TRUE');
            helper.edit('H7', 'FALSE');
            helper.edit('H8', '"-5"');
            helper.edit('H9', '6+2');
            helper.edit('H10', '2*7');
            helper.edit('H11', '22/2');
            helper.edit('H12', '15-3');
            helper.edit('H13', '3/4/2023');
            helper.edit('H14', '"03/04/2023"');
            helper.edit('H15', '7-Jun');
            helper.edit('H16', '" "');
            helper.edit('H17', '"   "');
            helper.edit('H18', '6/23/2014');
            helper.edit('H19', '$300.00');
            helper.edit('H20', '#DIV/0!');
            helper.edit('H21', '"Hi"');
            helper.edit('H22', '#NUM!');
            helper.edit('H23', '"33"');
            helper.edit('H24', '');
            done();
        });
        it('FACT formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=FACT(Hi)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=FACT(Hi)"}');
            done();
        });
        it('FACT formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=FACT("")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(\\"\\")"}');
            done();
        });
        it('FACT formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=FACT(TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(TRUE)"}');
            done();
        });
        it('FACT formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=FACT(FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(FALSE)"}');
            done();
        });
        it('FACT formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=FACT("3/4/2023")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(\\"3/4/2023\\")"}');
            done();
        });
        it('FACT formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=FACT(7-JUN)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=FACT(7-JUN)"}');
            done();
        });
        it('FACT formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=FACT("07-JUN")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(\\"07-JUN\\")"}');
            done();
        });
        it('FACT formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=FACT(" ")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(\\" \\")"}');
            done();
        });
        it('FACT formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=FACT("       ")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(\\"       \\")"}');
            done();
        });
        it('FACT formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=FACT(H1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#REF!","formula":"=FACT(H1)"}');
            done();
        });
        it('FACT formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=FACT(H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H2)"}');
            done();
        });
        it('FACT formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=FACT(H3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H3)"}');
            done();
        });
        it('FACT formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=FACT(H4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H4)"}');
            done();
        });
        it('FACT formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=FACT(H5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H5)"}');
            done();
        });
        it('FACT formula with cell Reference - 15->', (done: Function) => {
            helper.edit('I1', '=FACT(H6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(H6)"}');
            done();
        });
        it('FACT formula with cell Reference - 16->', (done: Function) => {
            helper.edit('I1', '=FACT(H7)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(H7)"}');
            done();
        });
        it('FACT formula with cell Reference - 17->', (done: Function) => {
            helper.edit('I1', '=FACT(H8)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H8)"}');
            done();
        });
        it('FACT formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I1', '=FACT(H9)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H9)"}');
            done();
        });
        it('FACT formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I1', '=FACT(H10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H10)"}');
            done();
        });
        it('FACT formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I1', '=FACT(H11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H11)"}');
            done();
        });
        it('FACT formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I1', '=FACT(H12)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H12)"}');
            done();
        });
        it('FACT formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I1', '=FACT(H5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H5)"}');
            done();
        });
        it('FACT formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I1', '=FACT(H4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H4)"}');
            done();
        });
        it('FACT formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I1', '=FACT(H13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(H13)"}');
            done();
        });
        it('FACT formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I1', '=FACT(H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H14)"}');
            done();
        });
        it('FACT formula with cell Reference - 26->', (done: Function) => {
            helper.edit('I1', '=FACT(H15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(H15)"}');
            done();
        });
        it('FACT formula with cell Reference - 27->', (done: Function) => {
            helper.edit('I1', '=FACT(H16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H16)"}');
            done();
        });
        it('FACT formula with cell Reference - 28->', (done: Function) => {
            helper.edit('I1', '=FACT(H17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(H17)"}');
            done();
        });
        it('FACT formula with cell Reference - 29->', (done: Function) => {
            helper.edit('I1', '=FACT(H18)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(H18)"}');
            done();
        });
        it('FACT formula with cell Reference - 30->', (done: Function) => {
            helper.edit('I1', '=FACT(1:10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=FACT(1:10)"}');
            done();
        });
        it('FACT formula with cell Reference - 31->', (done: Function) => {
            helper.edit('I1', '=FACT(6%)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(6%)"}');
            done();
        });
        it('FACT formula with cell Reference - 32->', (done: Function) => {
            helper.edit('I1', '=FACT(H19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT(H19)"}');
            done();
        });
        it('FACT formula with cell Reference - 33->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet1!H9)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(Sheet1!H9)"}');
            done();
        });
        it('FACT formula with cell Reference - 34->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet1!H20)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#DIV/0!","formula":"=FACT(Sheet1!H20)"}');
            done();
        });
        it('FACT formula with cell Reference - 35->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet1!H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(Sheet1!H2)"}');
            done();
        });
        it('FACT formula with cell Reference - 36->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet1!$H9)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(Sheet1!$H9)"}');
            done();
        });
        it('FACT formula with cell Reference - 37->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet1!H$24)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(Sheet1!H$24)"}');
            done();
        });
        it('FACT formula with cell Reference - 38->', (done: Function) => {
            helper.edit('I1', '=FACT($H$22)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=FACT($H$22)"}');
            done();
        });
        it('FACT formula with cell Reference - 39->', (done: Function) => {
            helper.edit('I1', '=FACT($H$23)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT($H$23)"}');
            done();
        });
        it('FACT formula with cell Reference - 40->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet2!$M8)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(Sheet2!$M8)"}');
            done();
        });
        it('FACT formula with cell Reference - 41->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet2!F$10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(Sheet2!F$10)"}');
            done();
        });
        it('FACT formula with cell Reference - 42->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet2!A1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FACT(Sheet2!A1)"}');
            done();
        });
        it('FACT formula with cell Reference - 43->', (done: Function) => {
            helper.edit('I1', '=FACT(Sheet2!M13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=FACT(Sheet2!M13)"}');
            done();
        });
    });

    describe('Formula - Checking V ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DATEVALUE Formula with dd-mm-yyyy format ->', (done: Function) => {
            helper.edit('J2', '=DATEVALUE("21/12/1998")');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toBe('=DATEVALUE("21/12/1998")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('DATEVALUE Formula with cell refernce having Date Value ->', (done: Function) => {
            helper.edit('J4', '=DATEVALUE(B5)');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toBe('=DATEVALUE(B5)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('DATEVALUE Formula without "" ->', (done: Function) => {
            helper.edit('J5', '=DATEVALUE(11/20/1998)');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toBe('=DATEVALUE(11/20/1998)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('DATEVALUE Formula with cell having no value ->', (done: Function) => {
            helper.edit('J6', '=DATEVALUE(P10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('DATEVALUE Formula with invalid arguments ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=DATEVALUE("12/26/1998","10/20/1998")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=DATEVALUE("12/26/1998","10/20/1998")';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J7', '=DATEVALUE("12/26/1998")');
            done();
        });
        it('FACT Formula ->', (done: Function) => {
            helper.edit('L1', '=FACT(5)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('120');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":120,"formula":"=FACT(5)"}');
            done();
        });
        it('FACT Formula with Decimal Numbers->', (done: Function) => {
            helper.edit('L2', '=FACT(1.9)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":1,"formula":"=FACT(1.9)"}');
            done();
        });
        it('FACT Formula for 0->', (done: Function) => {
            helper.edit('L3', '=FACT(0)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":1,"formula":"=FACT(0)"}');
            done();
        });
        it('FACT Formula for negative numbers->', (done: Function) => {
            helper.edit('L4', '=FACT(-1)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"#NUM!","formula":"=FACT(-1)"}');
            done();
        });
        it('FACT Formula for cell referencing numbers->', (done: Function) => {
            helper.edit('L5', '=FACT(H2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('3628800');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":3628800,"formula":"=FACT(H2)"}');
            done();
        });
        it('FACT Formula for cell referencing string->', (done: Function) => {
            helper.edit('L6', '=FACT(A3)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"#VALUE!","formula":"=FACT(A3)"}');
            done();
        });
        it('FACT Formula with no inputs ->', (done: Function) => {
            helper.edit('L7', '=FACT()');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{}');
            done();
        });
        it('FACT Formula with more than 1 inputs ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('L8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=FACT(1,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=FACT(1,2)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L8', '=FACT(1)');
            done();
        });
        it('DEGREES Formula ->', (done: Function) => {
            helper.edit('N1', '=DEGREES(6.3)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('360.9634109');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":360.96341093241864,"formula":"=DEGREES(6.3)"}');
            done();
        });
        it('DEGREES Formula with no input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=DEGREES()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=DEGREES()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=DEGREES(PI())');
            done();
        });
        it('DEGREES Formula with cell having no value->', (done: Function) => {
            helper.edit('N3', '=DEGREES(P10)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":0,"formula":"=DEGREES(P10)"}');
            done();
        });
        it('DEGREES Formula with cell having string value->', (done: Function) => {
            helper.edit('N4', '=DEGREES(A3)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[13])).toBe('{"value":"#VALUE!","formula":"=DEGREES(A3)"}');
            done();
        });
    });

    describe('DECIMAL Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DECIMAL Formula ->', (done: Function) => {
            helper.edit('J1', '=DECIMAL(100,2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":4,"formula":"=DECIMAL(100,2)"}');
            done();
        });
        it('DECIMAL Formula for Binary Values->', (done: Function) => {
            helper.edit('J2', '=DECIMAL(1101,2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('13');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":13,"formula":"=DECIMAL(1101,2)"}');
            helper.edit('J3', '=DECIMAL(10011,2)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('19');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":19,"formula":"=DECIMAL(10011,2)"}');
            done();
        });
        it('DECIMAL Formula for Octal Values->', (done: Function) => {
            helper.edit('J4', '=DECIMAL(12,8)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":10,"formula":"=DECIMAL(12,8)"}');
            helper.edit('J5', '=DECIMAL(4323,8)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2259');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":2259,"formula":"=DECIMAL(4323,8)"}');
            done();
        });
        it('DECIMAL Formula for Decimal(base10) Values->', (done: Function) => {
            helper.edit('J6', '=DECIMAL(3214,10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('3214');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":3214,"formula":"=DECIMAL(3214,10)"}');
            helper.edit('J7', '=DECIMAL(10132,10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('10132');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":10132,"formula":"=DECIMAL(10132,10)"}');
            done();
        });
        it('DECIMAL Formula for Hexadecimal Values->', (done: Function) => {
            helper.edit('J8', '=DECIMAL("FF",16)');
            expect(helper.getInstance().sheets[0].rows[7].cells[9].formula).toBe('=DECIMAL("FF",16)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('255');
            helper.edit('J9', '=DECIMAL("HELLO",16)');
            expect(helper.getInstance().sheets[0].rows[8].cells[9].formula).toBe('=DECIMAL("HELLO",16)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#NUM!');
            done();
        });
        it('DECIMAL Formula for duotrigesimal Values->', (done: Function) => {
            helper.edit('J10', '=DECIMAL("HELLO",32)');
            expect(helper.getInstance().sheets[0].rows[9].cells[9].formula).toBe('=DECIMAL("HELLO",32)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('18306744');
            helper.edit('J11', '=DECIMAL(1521,32)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[9])).toBe('{"value":37953,"formula":"=DECIMAL(1521,32)"}');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('37953');
            done();
        });
        it('DECIMAL Formula for hexatridecimal  Values->', (done: Function) => {
            helper.edit('J12', '=DECIMAL("HELLO",36)');
            expect(helper.getInstance().sheets[0].rows[11].cells[9].formula).toBe('=DECIMAL("HELLO",36)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('29234652');
            helper.edit('J13', '=DECIMAL(302,36)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[9])).toBe('{"value":3890,"formula":"=DECIMAL(302,36)"}');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('3890');
            done();
        });
        it('DECIMAL Formula for Hexadecimal Values with different radix ->', (done: Function) => {
            helper.edit('J14', '=DECIMAL("FF",2)');
            expect(helper.getInstance().sheets[0].rows[13].cells[9].formula).toBe('=DECIMAL("FF",2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#NUM!');
            helper.edit('J15', '=DECIMAL("FE",4)');
            expect(helper.getInstance().sheets[0].rows[14].cells[9].formula).toBe('=DECIMAL("FE",4)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#NUM!');
            helper.edit('J16', '=DECIMAL("EF",8)');
            expect(helper.getInstance().sheets[0].rows[15].cells[9].formula).toBe('=DECIMAL("EF",8)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('#NUM!');
            helper.edit('J17', '=DECIMAL("FF",10)');
            expect(helper.getInstance().sheets[0].rows[16].cells[9].formula).toBe('=DECIMAL("FF",10)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('#NUM!');
            helper.edit('J18', '=DECIMAL("FF",16)');
            expect(helper.getInstance().sheets[0].rows[17].cells[9].formula).toBe('=DECIMAL("FF",16)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('255');
            done();
        });
        it('DECIMAL Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J19');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=DECIMAL()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=DECIMAL()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J19', '=DECIMAL("1101",2)');
            done();
        });
        it('DECIMAL Formula with no values->', (done: Function) => {
            helper.edit('J20', '=DECIMAL(,)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[9])).toBe('{"value":"#NUM!","formula":"=DECIMAL(,)"}');
            done();
        });
        it('DECIMAL Formula with input having no radix number->', (done: Function) => {
            helper.edit('J21', '=DECIMAL(100,)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[9])).toBe('{"value":"#NUM!","formula":"=DECIMAL(100,)"}');
            done();
        });
        it('DECIMAL Formula with input having only radix number->', (done: Function) => {
            helper.edit('K1', '=DECIMAL(,2)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":0,"formula":"=DECIMAL(,2)"}');
            done();
        });
        it('DECIMAL Formula with input having negative arguments->', (done: Function) => {
            helper.edit('K2', '=DECIMAL(-1011,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NUM!","formula":"=DECIMAL(-1011,2)"}');
            done();
        });
        it('DECIMAL Formula with input having decimal arguments->', (done: Function) => {
            helper.edit('K3', '=DECIMAL(1011.5,2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"#NUM!","formula":"=DECIMAL(1011.5,2)"}');
            done();
        });
        it('DECIMAL Formula with invalid radix value->', (done: Function) => {
            helper.edit('K4', '=DECIMAL(1011,0)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NUM!","formula":"=DECIMAL(1011,0)"}');
            helper.edit('K5', '=DECIMAL(1011,1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"#NUM!","formula":"=DECIMAL(1011,1)"}');
            helper.edit('K6', '=DECIMAL(1011,37)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"#NUM!","formula":"=DECIMAL(1011,37)"}');
            done();
        });
        it('DECIMAL Formula with invalid arguments->', (done: Function) => {
            helper.edit('K7', '=DECIMAL(ACD,2)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"#NAME?","formula":"=DECIMAL(ACD,2)"}');
            helper.edit('K8', '=DECIMAL(101,FF)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":"#NAME?","formula":"=DECIMAL(101,FF)"}');
            helper.edit('K9', '=DECIMAL(HELLO,AC)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":"#NAME?","formula":"=DECIMAL(HELLO,AC)"}');
            done();
        });
        it('DECIMAL Formula with expression as arguments->', (done: Function) => {
            helper.edit('K10', '=DECIMAL(110,2+H2)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('156');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[10])).toBe('{"value":156,"formula":"=DECIMAL(110,2+H2)"}');
            helper.edit('K11', '=DECIMAL("HELLO+2",36)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#NUM!');
            expect(helper.getInstance().sheets[0].rows[10].cells[10].formula).toBe('=DECIMAL("HELLO+2",36)');
            helper.edit('K12', '=DECIMAL(E3+2,32)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('98');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[10])).toBe('{"value":98,"formula":"=DECIMAL(E3+2,32)"}');
            done();
        });
        it('DECIMAL Formula with special characters as arguments->', (done: Function) => {
            helper.edit('K13', '=DECIMAL("HELLO+2",36)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#NUM!');
            expect(helper.getInstance().sheets[0].rows[12].cells[10].formula).toBe('=DECIMAL("HELLO+2",36)');
            helper.edit('K14', '=DECIMAL("Hello@",36)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#NUM!');
            expect(helper.getInstance().sheets[0].rows[13].cells[10].formula).toBe('=DECIMAL("Hello@",36)');
            helper.edit('K15', '=DECIMAL("?WHAT",36)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#NUM!');
            expect(helper.getInstance().sheets[0].rows[14].cells[10].formula).toBe('=DECIMAL("?WHAT",36)');
            done();
        });
        it('DECIMAL Formula with Worst case value as arguments->', (done: Function) => {
            helper.edit('K16', '=DECIMAL(FF,16)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[10])).toBe('{"value":"#NAME?","formula":"=DECIMAL(FF,16)"}');
            helper.edit('K17', '=DECIMAL("One",2)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#NUM!');
            expect(helper.getInstance().sheets[0].rows[16].cells[10].formula).toBe('=DECIMAL("One",2)');
            helper.edit('K18', '=DECIMAL(100,"2a")');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[17].cells[10].formula).toBe('=DECIMAL(100,"2a")');
            helper.edit('K19', '=DECIMAL(11,FF)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[10])).toBe('{"value":"#NAME?","formula":"=DECIMAL(11,FF)"}');
            done();
        });
        it('DECIMAL Formula with cell Reference as arguments->', (done: Function) => {
            helper.edit('L1', '=DECIMAL(D4,G3)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":10,"formula":"=DECIMAL(D4,G3)"}');
            helper.edit('L2', '=DECIMAL(F4,G6)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('300');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":300,"formula":"=DECIMAL(F4,G6)"}');
            helper.edit('L3', '=DECIMAL(4231,G10)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('7237');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":7237,"formula":"=DECIMAL(4231,G10)"}');
            helper.edit('L4', '=DECIMAL(F10,8)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('648');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":648,"formula":"=DECIMAL(F10,8)"}');
            done();
        });
        it('DECIMAL Formula with different type of cell Reference values as arguments->', (done: Function) => {
            helper.edit('L5', '=DECIMAL(I12,36)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('82988828124');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":82988828124,"formula":"=DECIMAL(I12,36)"}');
            helper.edit('L6', '=DECIMAL(I10,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":0,"formula":"=DECIMAL(I10,2)"}');
            helper.edit('L7', '=DECIMAL(B4,16)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('268359');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":268359,"formula":"=DECIMAL(B4,16)"}');
            helper.edit('L8', '=DECIMAL(I7,32)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(I7,32)"}');
            helper.edit('L9', '=DECIMAL(I8,36)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(I8,36)"}');
            helper.edit('L10', '=DECIMAL(C6,2)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(C6,2)"}');
            helper.edit('L11', '=DECIMAL(I17,16)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('18');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[11])).toBe('{"value":18,"formula":"=DECIMAL(I17,16)"}');
            helper.edit('L12', '=DECIMAL(I16,36)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(I16,36)"}');
            helper.edit('L13', '=DECIMAL(I20,16)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('277');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":277,"formula":"=DECIMAL(I20,16)"}');
            done();
        });
        it('DECIMAL Formula with logical values as arguments->', (done: Function) => {
            helper.edit('L14', '=DECIMAL(TRUE,31)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('890830');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":890830,"formula":"=DECIMAL(TRUE,31)"}');
            helper.edit('L15', '=DECIMAL(FALSE,32)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('16078734');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[11])).toBe('{"value":16078734,"formula":"=DECIMAL(FALSE,32)"}');
            helper.edit('L16', '=DECIMAL(101,TRUE)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(101,TRUE)"}');
            helper.edit('L17', '=DECIMAL(101,FALSE)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(101,FALSE)"}');
            done();
        });
        it('DECIMAL Formula with cell reference logical values as arguments->', (done: Function) => {
            helper.edit('L18', '=DECIMAL(I2,36)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('1389110');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[11])).toBe('{"value":1389110,"formula":"=DECIMAL(I2,36)"}');
            helper.edit('L19', '=DECIMAL(I4,32)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('16078734');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[11])).toBe('{"value":16078734,"formula":"=DECIMAL(I4,32)"}');
            helper.edit('L20', '=DECIMAL(101,I3)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(101,I3)"}');
            helper.edit('L21', '=DECIMAL(101,I5)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[11])).toBe('{"value":"#NUM!","formula":"=DECIMAL(101,I5)"}');
            done();
        });
        it('DECIMAL Formula with string of logical values as arguments->', (done: Function) => {
            helper.edit('L22', '=DECIMAL("TRUE",36)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('1389110');
            expect(helper.getInstance().sheets[0].rows[21].cells[11].formula).toBe('=DECIMAL("TRUE",36)');
            helper.edit('L23', '=DECIMAL("FALSE",36)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('25689038');
            expect(helper.getInstance().sheets[0].rows[22].cells[11].formula).toBe('=DECIMAL("FALSE",36)');
            helper.edit('L24', '=DECIMAL(1011,"TRUE")');
            expect(helper.invoke('getCell', [23, 11]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[23].cells[11].formula).toBe('=DECIMAL(1011,"TRUE")');
            helper.edit('L25', '=DECIMAL("FALSE","FALSE")');
            expect(helper.invoke('getCell', [24, 11]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[24].cells[11].formula).toBe('=DECIMAL("FALSE","FALSE")');
            done();
        });
        it('DECIMAL Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=DECIMAL($G$5,$G$8)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":4,"formula":"=DECIMAL($G$5,$G$8)"}');
            helper.edit('M2', '=DECIMAL(1101,$G$8)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('37');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":37,"formula":"=DECIMAL(1101,$G$8)"}');
            helper.edit('M3', '=DECIMAL($F$7,32)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('8192');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":8192,"formula":"=DECIMAL($F$7,32)"}');
            done();
        });
        it('DECIMAL Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M4', '=DECIMAL(Sheet2!A4,Sheet2!A6)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('105');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":105,"formula":"=DECIMAL(Sheet2!A4,Sheet2!A6)"}');
            helper.edit('M5', '=DECIMAL(Sheet1!D2,Sheet2!A2)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":20,"formula":"=DECIMAL(Sheet1!D2,Sheet2!A2)"}');
            helper.edit('M6', '=DECIMAL(Sheet2!A6,Sheet1!G4)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('26');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":26,"formula":"=DECIMAL(Sheet2!A6,Sheet1!G4)"}');
            helper.edit('M7', '=DECIMAL(Sheet1!F4,Sheet1!G9)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('108');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":108,"formula":"=DECIMAL(Sheet1!F4,Sheet1!G9)"}');
            done();
        });
        it('DECIMAL Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M8', '=DECIMAL(Sheet2!$A$3,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":6,"formula":"=DECIMAL(Sheet2!$A$3,Sheet2!$A$6)"}');
            helper.edit('M9', '=DECIMAL(F10,Sheet2!$A$4)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('28830');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":28830,"formula":"=DECIMAL(F10,Sheet2!$A$4)"}');
            helper.edit('M10', '=DECIMAL(Sheet1!$D$2,$H$8)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('14');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":14,"formula":"=DECIMAL(Sheet1!$D$2,$H$8)"}');
            helper.edit('M11', '=DECIMAL($F$10,$G$9)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('294');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":294,"formula":"=DECIMAL($F$10,$G$9)"}');
            helper.edit('M12', '=DECIMAL(Sheet1!$F$4,Sheet1!$G$9)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('108');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":108,"formula":"=DECIMAL(Sheet1!$F$4,Sheet1!$G$9)"}');
            done();
        });
    });

    describe('Reported DEGREES formulae - Checking -> III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DEGREES formula with cell Reference - 18->', (done: Function) => {
            helper.edit('H1', '#REF!');
            helper.edit('H2', '"65"');
            helper.edit('H3', '"212"');
            helper.edit('H4', '"0"');
            helper.edit('H5', '');
            helper.edit('H6', 'TRUE');
            helper.edit('H7', 'FALSE');
            helper.edit('H8', '"-76"');
            helper.edit('H9', '65+12');
            helper.edit('H10', '16*7');
            helper.edit('H11', '222/2');
            helper.edit('H12', '156-33');
            helper.edit('H12', '"0"');
            helper.edit('H14', '"03/04/2023"');
            helper.edit('H15', '#DIV/0!');
            helper.edit('H16', '#NUM!');
            helper.edit('H17', '"33"');
            done();
        });
        it('DEGREES formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=DEGREES(Hi)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=DEGREES(Hi)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=DEGREES(TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('57.29577951');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":57.29577951308232,"formula":"=DEGREES(TRUE)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=DEGREES(FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=DEGREES(FALSE)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=DEGREES(7-JUN)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=DEGREES(7-JUN)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#REF!","formula":"=DEGREES(H1)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H2)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H3)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H4)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=DEGREES(H5)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('57.29577951');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":57.29577951308232,"formula":"=DEGREES(H6)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H7)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=DEGREES(H7)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H8)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H8)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H9)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H9)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H10)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 15->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H11)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 16->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H12)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H12)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 17->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H4)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I1', '=DEGREES(H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(H14)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I1', '=DEGREES(6/23/2014)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.007421413');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0.007421412656588531,"formula":"=DEGREES(6/23/2014)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I1', '=DEGREES(1:10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=DEGREES(1:10)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I1', '=DEGREES(2%)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1.14591559');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1.1459155902616465,"formula":"=DEGREES(2%)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I1', '=DEGREES(Sheet1!H15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#DIV/0!","formula":"=DEGREES(Sheet1!H15)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I1', '=DEGREES(Sheet1!H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES(Sheet1!H2)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I1', '=DEGREES($H$16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DEGREES($H$16)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I1', '=DEGREES($H$17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DEGREES($H$17)"}');
            done();
        });
        it('DEGREES formula with cell Reference - 26->', (done: Function) => {
            helper.edit('I1', '=DEGREES("07-JUN")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2645919.098');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":2645919.0979141416,"formula":"=DEGREES(\\"07-JUN\\")"}');
            done();
        });
    });

    describe('EJ2-53702 -> RADIANS FORMULA VALIDATING 9 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('RADIANS - Specific Type - I', (done: Function) => {
            helper.edit('J10', '#Yes!');
            helper.edit('K1', '=RADIANS(J10)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(J10)"}');
            done();
        });
        it('RADIANS - Specific Type - II', (done: Function) => {
            helper.edit('J7', 'A123@!hi');
            helper.edit('K2', '=RADIANS(J7)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(J7)"}');
            done();
        });
        it('RADIANS - Specific Type - III', (done: Function) => {
            helper.edit('J8', 'Hello123');
            helper.edit('K3', '=RADIANS(J8)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(J8)"}');
            done();
        });
        it('RADIANS - Specific Type - IV', (done: Function) => {
            helper.edit('K4', '=RADIANS("0!")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(\\"0!\\")"}');
            done();
        });
        it('RADIANS - Specific Type - V', (done: Function) => {
            helper.edit('K5', '=RADIANS(2/3/2000)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('0.000005818');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":0.000005817764173314431,"formula":"=RADIANS(2/3/2000)"}');
            done();
        });
        it('RADIANS - Specific Type - VI', (done: Function) => {
            helper.edit('K6', '=RADIANS("""   ")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(\\"\\"\\"   \\")"}');
            done();
        });
        it('RADIANS - Specific Type - VII', (done: Function) => {
            helper.edit('K7', '=RADIANS("  .67   """)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"#VALUE!","formula":"=RADIANS(\\"  .67   \\"\\"\\")"}');
            done();
        });
        it('RADIANS - Direct Value - I', (done: Function) => {
            helper.edit('L1', '=RADIANS(TRUE)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('0.017453293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":0.017453292519943295,"formula":"=RADIANS(TRUE)"}');
            done();
        });
        it('RADIANS - Direct Value - II', (done: Function) => {
            helper.edit('L2', '=RADIANS(FALSE)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":0,"formula":"=RADIANS(FALSE)"}');
            done();
        });
        it('RADIANS - Direct Value - III', (done: Function) => {
            helper.edit('L3', '=RADIANS(3/4/2023)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('0.000006471');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":0.000006470573104279522,"formula":"=RADIANS(3/4/2023)"}');
            done();
        });
        it('RADIANS - Direct Value - IV', (done: Function) => {
            helper.edit('L4', '=RADIANS(" ")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"#VALUE!","formula":"=RADIANS(\\" \\")"}');
            done();
        });
        it('RADIANS - Direct Value - V', (done: Function) => {
            helper.edit('L5', '=RADIANS("       ")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"#VALUE!","formula":"=RADIANS(\\"       \\")"}');
            done();
        });
        it('RADIANS - Cell reference - I', (done: Function) => {
            helper.edit('J5', 'hi');
            helper.edit('M1', '=RADIANS(J5)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(J5)"}');
            done();
        });
        it('RADIANS - Cell reference - II', (done: Function) => {
            helper.edit('I2', 'TRUE');
            helper.edit('M2', '=RADIANS(I2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0.017453293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":0.017453292519943295,"formula":"=RADIANS(I2)"}');
            done();
        });
        it('RADIANS - Cell reference - III', (done: Function) => {
            helper.edit('I5', 'FALSE');
            helper.edit('M3', '=RADIANS(I5)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":0,"formula":"=RADIANS(I5)"}');
            done();
        });
        it('RADIANS - Cell reference - IV', (done: Function) => {
            helper.edit('M2', '6+2.83');
            helper.edit('M4', '=RADIANS(M2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(M2)"}');
            done();
        });
        it('RADIANS - Cell reference - V', (done: Function) => {
            helper.edit('M3', '2*7');
            helper.edit('M5', '=RADIANS(M3)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(M3)"}');
            done();
        });
        it('RADIANS - Cell reference - VI', (done: Function) => {
            helper.edit('M4', '22/2');
            helper.edit('M6', '=RADIANS(M4)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(M4)"}');
            done();
        });
        it('RADIANS - Cell reference - VII', (done: Function) => {
            helper.edit('M5', '15-3');
            helper.edit('M7', '=RADIANS(M5)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(M5)"}');
            done();
        });
        it('RADIANS - Different datatypes - I', (done: Function) => {
            helper.edit('B11', 'Flip- Flops & Slippers');
            helper.edit('M7', '=RADIANS(B11)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"#VALUE!","formula":"=RADIANS(B11)"}');
            done();
        });
        it('RADIANS - Different datatypes - II', (done: Function) => {
            helper.edit('M7', '=RADIANS(6/23/2014)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('0.000002261');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":0.0000022606915746224205,"formula":"=RADIANS(6/23/2014)"}');
            done();
        });
        it('RADIANS - Invalid Arguments - I', (done: Function) => {
            helper.edit('N1', '=RADIANS(6.078%)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('0.001060811');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":0.0010608111193621535,"formula":"=RADIANS(6.078%)"}');
            done();
        });
        it('RADIANS - Sheets - I', (done: Function) => {
            helper.edit('=RADIANS(Sheet1!M2)', '6+2.83');
            helper.edit('O1', '=RADIANS(Sheet1!M2)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[14])).toBe('{"value":"#VALUE!","formula":"=RADIANS(Sheet1!M2)"}');
            done();
        });
        it('RADIANS - Sheets - II', (done: Function) => {
            helper.edit('=RADIANS(Sheet1!$M2)', '6+2.83');
            helper.edit('O2', '=RADIANS(Sheet1!$M2)');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[14])).toBe('{"value":"#VALUE!","formula":"=RADIANS(Sheet1!$M2)"}');
            done();
        });
        it('RADIANS - Cell Ref - I', (done: Function) => {
            helper.edit('$J$2', 'H123Ello');
            helper.edit('P1', '=RADIANS($J$2)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":"#VALUE!","formula":"=RADIANS($J$2)"}');
            done();
        });
    });

    // Logical Category Formulas
    describe('IF Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Decimals' }] }, { cells: [{ index: 8, value: '102.32' }] },
                        { cells: [{ index: 8, value: '105.43' }] }, { cells: [{ index: 8, value: '103.23' }] },
                        { cells: [{ index: 8, value: '1002.2323' }] }, { cells: [{ index: 8, value: '1023.3219' }] },
                        { cells: [{ index: 8, value: '1022.4567' }] }, { cells: [{ index: 8, value: '320.12354' }] },
                        { cells: [{ index: 8, value: '102.45674' }] }, { cells: [{ index: 8, value: '103.32321' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: '-3221' }] }, { cells: [{ index: 8, value: '-1253' }] },
                        { cells: [{ index: 8, value: '0' }] }, { cells: [{ index: 8, value: '119', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '321', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12.56', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '2', format: '0%' }] },
                        { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '12' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '76' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '93' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'ABC' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('IF formula with second and third arguments as empty->', (done: Function) => {
            helper.edit('J1', '=IF(E1>10,,"F")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            helper.edit('J2', '=IF(E1<10,"T",)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            helper.edit('J3', '=IF(E1>10, ,)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=IF(,,)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=IF(H2>5,,)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            done();
        });
        it('IF formula with nested T formula has input having numerical values->', (done: Function) => {
            helper.edit('J6', '=IF(T(F2)=F2,F2,"FALSE")');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('FALSE');
            helper.edit('J7', '=IF(T(F2)<>F2,F2,"FALSE")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('200');
            done();
        });
        it('IF formula with nested T formula has input having alphabet values->', (done: Function) => {
            helper.edit('J8', '=IF(T(A2)=A2,A2,"F")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('Casual Shoes');
            helper.edit('J9', '=IF(T(A2)<>A2,A2,"F")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('F');
            done();
        });
        it('IF formula with nested EXACT formula has input having boolean conditions->', (done: Function) => {
            helper.edit('J10', '=IF(EXACT(E2,D3)=TRUE,1,0)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1');
            helper.edit('J11', '=IF(EXACT(E2,D5)=FALSE,1,0)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('1');
            helper.edit('J12', '=IF(EXACT()=FALSE,1,0)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#VALUE!');
            helper.edit('J13', '=IF(EXACT(E2,D5)<>FALSE,0,1)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('1');
            done();
        });
        it('IF formula with nested PROPER formula has input having alphabet values->', (done: Function) => {
            helper.edit('J14', '=IF(A11=PROPER(A11),"T","F")');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('T');
            helper.edit('J15', '=IF(A11<>PROPER(A11),"T","F")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('F');
            helper.edit('J16', '=IF(PROPER(A9)<>PROPER(A8),"YES","NO")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('YES');
            done();
        });
        it('IF formula with logical test values as string ->', (done: Function) => {
            helper.edit('K1', '=IF(A9="Loafers",10,20)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('10');
            helper.edit('K2', '=IF(A9="LoaFerS",10,20)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('10');
            helper.edit('K3', '=IF(A9="LoaFerS","HELLO","BYE")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('HELLO');
            helper.edit('K4', '=IF(A9<>"Loafers","HELLO","BYE")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('BYE');
            helper.edit('K5', '=IF(A9<>"Loafers",TRUE,FALSE)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('FALSE');
            helper.edit('K6', '=IF(A9<>"Loafers",10,20)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('20');
            done();
        });
        it('IF formula with logical test values as numbers with operator ->', (done: Function) => {
            helper.edit('K7', '=IF(H8=14,10,20)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('10');
            helper.edit('K8', '=IF(H7=66,"YeS","NaH")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('YeS');
            helper.edit('K9', '=IF(H6=10,TRUE,FALSE)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('FALSE');
            helper.edit('K10', '=IF(H8<>14,10,20)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('20');
            helper.edit('K11', '=IF(H7<>66,"YeS","NaH")');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('NaH');
            helper.edit('K12', '=IF(H6<>10,TRUE,FALSE)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('TRUE');
            done();
        });
        it('IF formula with logical test values as numbers with operators ->', (done: Function) => {
            helper.edit('K13', '=IF(H7>46,"YeS","NaH")');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('YeS');
            helper.edit('K14', '=IF(H6>10,TRUE,FALSE)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('TRUE');
            helper.edit('K15', '=IF(H8<18,10,20)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('10');
            helper.edit('K16', '=IF(H7<76,"YeS","NaH")');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('YeS');
            helper.edit('K17', '=IF(H8>=14,10,20)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('10');
            helper.edit('K18', '=IF(H6>=80,TRUE,FALSE)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('FALSE');
            helper.edit('K19', '=IF(H7<=66,"YeS","NaH")');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('YeS');
            helper.edit('K20', '=IF(H6<=10,TRUE,FALSE)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('FALSE');
            done();
        });
        it('IF formula with logical test values with Logical arguments as input ->', (done: Function) => {
            helper.edit('L1', '=IF(I16=TRUE,TRUE,FALSE)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('TRUE');
            helper.edit('L2', '=IF(I16<>TRUE,TRUE,FALSE)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('FALSE');
            helper.edit('L3', '=IF(I16=I15,G11,E11)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('9');
            helper.edit('L4', '=IF(I16<>I15,G11,E11)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('10');
            done();
        });
        it('IF formula with logical test values as expression ->', (done: Function) => {
            helper.edit('L5', '=IF(D2*G2+D3=D6,"PASS","FAIL")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('PASS');
            helper.edit('L6', '=IF(D2*G2+D3<D6,"PASS","FAIL")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('FAIL');
            helper.edit('L7', '=IF(E6+E8/G2*G8=60,H2,E2+E4)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('35');
            helper.edit('L8', '=IF(E6+E8/G2*G8<>60,H2+20,E2+E4)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('30');
            done();
        });
        it('IF formula with logical test values as AND and OR as nested formula ->', (done: Function) => {
            helper.edit('L9', '=IF(AND(H4>20,H4<55),"Y","N")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('Y');
            helper.edit('L10', '=IF(AND(H4<20,H4>55),"Y","N")');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('N');
            helper.edit('L11', '=IF(OR(E4=15,E3=30),"Y","N")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('Y');
            helper.edit('L12', '=IF(OR(E4<>15,E3<>30),"Y","N")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('N');
            done();
        });
        it('IF formula with result conditions as empty arguments ->', (done: Function) => {
            helper.edit('L13', '=IF(H2>5,,)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            helper.edit('L14', '=IF(H2>20,10)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('FALSE');
            helper.edit('L15', '=IF(,,TRUE)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('TRUE');
            helper.edit('L16', '=IF(H2=12,"e",)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('0');
            helper.edit('L17', '=IF(1=1,R20,Q20)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            done();
        });
        it('IF formula with Worst cases as arguments ->', (done: Function) => {
            helper.edit('L18', '=IF(A2="Casual Shoes",Hi,Bye)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#NAME?');
            helper.edit('L19', '=IF(,1,)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('0');
            helper.edit('L20', '=IF(B4="","Y")');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('FALSE');
            helper.edit('L21', '=IF(J4="",,)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('0');
            helper.edit('A2', 'Casual, Shoes');
            helper.edit('L22', '=IF(3=3,VLOOKUP(A2,A1:D11,1,FALSE),G10)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('Casual, Shoes');
            done();
        });
        it('IF Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=IF($H$2>5,H3,H4)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('50');
            helper.edit('M2', '=IF($H$2<$H$6,H3,H4)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('50');
            helper.edit('M3', '=IF(D2>D3,$G$4,G7)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('13');
            helper.edit('M4', '=IF($D$2>$D$3,G4,$G$7)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('13');
            helper.edit('M5', '=IF($D$4=$E$2,$I$4,$H$6)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('103.23');
            done();
        });
        it('IF Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M6', '=IF(Sheet1!D3>Sheet1!D6,Sheet2!A4,Sheet2!A6)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('35');
            helper.edit('M7', '=IF(Sheet1!D3<Sheet1!D6,Sheet2!A4,Sheet2!A6)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('30');
            helper.edit('M8', '=IF(Sheet2!A7<>Sheet2!A6,Sheet2!A2,Sheet2!A10)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('20');
            helper.edit('M9', '=IF(Sheet2!A7<=Sheet2!A6,Sheet2!A2,Sheet2!A1)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('12');
            helper.edit('M10', '=IF(Sheet1!D6>Sheet1!D8,Sheet1!G5,Sheet1!G10)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('11');
            done();
        });
        it('IF Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M11', '=IF(Sheet1!$D$2>Sheet1!$D$5,Sheet2!A4,Sheet2!A6)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('35');
            helper.edit('M12', '=IF(Sheet1!D2>Sheet1!D5,Sheet2!$A$4,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('76');
            helper.edit('M13', '=IF(Sheet2!$A$2>Sheet2!$A$5,Sheet1!$E$4,Sheet1!$E$3)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('30');
            helper.edit('M14', '=IF(Sheet2!$A$2>Sheet2!$A$5,Sheet2!$A$4,Sheet2!$A$7)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('40');
            helper.edit('M15', '=IF(Sheet1!$D$2=Sheet1!$G$6,Sheet1!$F$4,Sheet1!$F$7)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('300');
            helper.edit('M16', '=IF(Sheet1!$D$2<>Sheet1!$G$6,Sheet1!$F$4,Sheet1!$F$7)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('800');
            done();
        });
        it('IF formula with Condition enclosed with double quotes->', (done: Function) => {
            helper.edit('M17', '=IF(I15="TRUE",10,20)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('20');
            helper.edit('M18', '=IF(I17="FALSE",10,20)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('20');
            helper.edit('M19', '=IF(G10="12",10,20)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('20');
            helper.edit('M20', '=IF(20="20",10,11)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('11');
            helper.edit('M21', '=IF(A9="Loafers",0,2)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('0');
            helper.edit('M22', '=IF(A9="LoAfers",0,2)');
            expect(helper.invoke('getCell', [21, 12]).textContent).toBe('0');
            helper.edit('M23', '=IF(C20="",10,20)');
            expect(helper.invoke('getCell', [22, 12]).textContent).toBe('10');
            helper.edit('M24', '=IF(A9="",0,2)');
            expect(helper.invoke('getCell', [23, 12]).textContent).toBe('2');
            done();
        });
        it('IF formula with invalid arguments error dialog cases ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IF()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IF()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=IF(D2=H2,1,2)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('1');
            done();
        });
        it('COUNTA formula are not working when nested with SORT', (done: Function) => {
            helper.edit('N2', '=COUNTA(SORT(A3:A11,1,1))');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('9');
            done();
        });
    });

    describe('IFS Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Decimals' }] }, { cells: [{ index: 8, value: '102.32' }] },
                        { cells: [{ index: 8, value: '105.43' }] }, { cells: [{ index: 8, value: '103.23' }] },
                        { cells: [{ index: 8, value: '1002.2323' }] }, { cells: [{ index: 8, value: '1023.3219' }] },
                        { cells: [{ index: 8, value: '1022.4567' }] }, { cells: [{ index: 8, value: '320.12354' }] },
                        { cells: [{ index: 8, value: '102.45674' }] }, { cells: [{ index: 8, value: '103.32321' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: '#NUM!' }] }, { cells: [{ index: 8, value: '#N/A' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: '-3221' }] }, { cells: [{ index: 8, value: '-1253' }] },
                        { cells: [{ index: 8, value: '0' }] }, { cells: [{ index: 8, value: '119', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '321', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12.56', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '2', format: '0%' }] },
                        { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '12' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '76' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '93' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: 'ABC' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('IFS formula with value true arguments as empty->', (done: Function) => {
            helper.edit('J1', '=IFS(D2=10,,F6=200,)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            helper.edit('J2', '=IFS(D2=10,,,)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0');
            helper.edit('J3', '=IFS(E1>10, ,  ,)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=IFS(,)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#N/A');
            helper.edit('J5', '=IFS(H2>5, ,H6=70, , H3<20, )');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            done();
        });
        it('IFS formula with logical test values as string ->', (done: Function) => {
            helper.edit('J6', '=IFS(A9="Loafers",10,A11="T-Shirts",20)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('10');
            helper.edit('J7', '=IFS(A9="LoaFerS",10,A11="T-Shirts",20)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('10');
            helper.edit('J8', '=IFS(A8="LoaferS","HELLO",A11="T-Shirts","BYE")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('BYE');
            helper.edit('J9', '=IFS(A8<>"LoaferS","HELLO",A11="T-Shirts","BYE")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('HELLO');
            helper.edit('J10', '=IFS(A8<>"LoaferS",TRUE,A11="T-Shirts",FALSE)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('TRUE');
            helper.edit('J11', '=IFS(A9<>"LoaferS",TRUE,A11="T-Shirts",FALSE)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('FALSE');
            done();
        });
        it('IFS formula with logical test values as numbers with operator ->', (done: Function) => {
            helper.edit('J12', '=IFS(H8=14,10,H6=70,20)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('10');
            helper.edit('J13', '=IFS(H7=66,"YeS",H6=70,"NaH")');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('YeS');
            helper.edit('J14', '=IFS(H6=10,TRUE,H7=66,FALSE)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('FALSE');
            helper.edit('J15', '=IFS(H8<>14,10,H6=70,20)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('20');
            helper.edit('J16', '=IFS(H7<>66,"YeS",H6=70,"NaH")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('NaH');
            helper.edit('J17', '=IFS(H6<>10,TRUE,H7=66,FALSE)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('TRUE');
            done();
        });
        it('IFS formula with logical test values as numbers with operators ->', (done: Function) => {
            helper.edit('K1', '=IFS(H7>46,"YeS",H5>45,"NaH",H2>1,"Never")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('YeS');
            helper.edit('K2', '=IFS(H7>46,TRUE,H5>45,FALSE,H2>1,TRUE)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('TRUE');
            helper.edit('K3', '=IFS(H8<18,10,H5<45,20,H2>1,30)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('10');
            helper.edit('K4', '=IFS(H7<76,"YeS",H5<45,"NaH",H2<10,"Never")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('YeS');
            helper.edit('K5', '=IFS(H8>=14,10,H5>=45,20,H2>=14,30)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('10');
            helper.edit('K6', '=IFS(H6>=80,TRUE,H5>=45,FALSE,H2>=10,TRUE)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('FALSE');
            helper.edit('K7', '=IFS(H7<=66,"YeS",H5<=45,"NaH",H2<=14,"Never")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('YeS');
            helper.edit('K8', '=IFS(H6<=9,TRUE,H5<=45,FALSE,H2<=10,TRUE)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('TRUE');
            done();
        });
        it('IFS formula with logical test values with Logical arguments as input ->', (done: Function) => {
            helper.edit('K9', '=IFS(I16=TRUE,TRUE,I16=FALSE,FALSE,I17<>FALSE,TRUE)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('TRUE');
            helper.edit('K10', '=IFS(I16<>TRUE,TRUE,I18=FALSE,FALSE,I17<>FALSE,TRUE)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('FALSE');
            helper.edit('K11', '=IFS(I16=I15,G11,I16=FALSE,E11,I17<>FALSE,F11)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('9');
            helper.edit('K12', '=IFS(I16<>I15,G11,I16<>I18,E11,I17<>FALSE,F11)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('10');
            done();
        });
        it('IFS formula with logical test values as expression ->', (done: Function) => {
            helper.edit('K13', '=IFS(D2*G2+D3=D6,"PASS",D2*G2+E11=D4,"FAIL")');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('PASS');
            helper.edit('K14', '=IFS(D2*G2+D3=D5,"PASS",D2*G2+E11=D4,"FAIL")');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('FAIL');
            helper.edit('K15', '=IFS(E6+E8*G8=40,H2+H10,E2+E4=35,F11-F2)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('176');
            helper.edit('K16', '=IFS(E6+E8/G2*G8=60,H2+H10,E2+E4=35,F11-F2)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('300');
            done();
        });
        it('IFS formula with logical test values as Cell references ->', (done: Function) => {
            helper.edit('L1', '=IFS(D2=E11,D5,D8=E7,K11)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('15');
            helper.edit('L2', '=IFS(D2<>E11,E4,G2<>G3,H4)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('27');
            helper.edit('L3', '=IFS(F7>F4,I15,G3>G10,I17)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('TRUE');
            helper.edit('L4', '=IFS(F4>F7,I15,G10>G3,I17)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('FALSE');
            helper.edit('L5', '=IFS(F7>F4,A11,G3>G10,A3)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('T-Shirts');
            helper.edit('L6', '=IFS(F4>F7,A11,G10>G3,A3)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('Sports Shoes');
            helper.edit('L7', '=IFS(F5>=F6,D8,G6>=G7,H10)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('20');
            helper.edit('L8', '=IFS(F5>=F7,D8,G6>=G4,H10)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('166');
            done();
        });
        it('IFS formula with logical test values as AND and OR as nested formula ->', (done: Function) => {
            helper.edit('L9', '=IFS(AND(H4>20,H4<55),"Y",AND(H4>20,H4>55),"N")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('Y');
            helper.edit('L10', '=IFS(AND(H4>20,H4>55),"Y",AND(H4>20,H4<55),"N")');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('N');
            helper.edit('L11', '=IFS(OR(A2<>"Casual Shoes",A11="T-Shirts"),"Y",OR(A2<>"Casual Shoes",A11="T-Shirts"), "R")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('Y');
            helper.edit('L12', '=IFS(OR(A2<>"Casual Shoes",A11<>"T-Shirts"),"Y",OR(A2<>"Casual Shoes",A11="T-Shirts"), "R")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('R');
            done();
        });
        it('IFS formula with result conditions as empty arguments ->', (done: Function) => {
            helper.edit('L13', '=IFS(H2>5,,,)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0');
            helper.edit('L14', '=IFS(H2>20,10)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#N/A');
            helper.edit('L15', '=IFS(,TRUE, , FALSE)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#N/A');
            helper.edit('L16', '=IFS(H2=12,"e", ,)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#N/A');
            helper.edit('L17', '=IFS(1=1,R20,2=2,Q20)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            done();
        });
        it('IFS formula with Worst cases as arguments ->', (done: Function) => {
            helper.edit('L18', '=IFS(1+1=2,Hi,2+2=5,Bye)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#NAME?');
            helper.edit('L19', '=IFS(1+1=3,"HI",2+3=3,"FALSE")');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('#N/A');
            helper.edit('L20', '=IFS(1+1=3,)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('#N/A');
            helper.edit('L21', '=IFS(1+1=2,)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('0');
            helper.edit('L22', '=IFS(,3122,,232)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('#N/A');
            helper.edit('L23', '=IFS(I11=10,F8)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('#VALUE!');
            helper.edit('L24', '=IFS(I12=10,F8)');
            expect(helper.invoke('getCell', [23, 11]).textContent).toBe('#NAME?');
            helper.edit('L25', '=IFS(I13=10,F8)');
            expect(helper.invoke('getCell', [24, 11]).textContent).toBe('#NUM!');
            helper.edit('L26', '=IFS(I14=10,F8)');
            expect(helper.invoke('getCell', [25, 11]).textContent).toBe('#N/A');
            done();
        });
        it('IFS Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=IFS($H$2>5,H3,$H$4>40,H5)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('50');
            helper.edit('M2', '=IFS($H$2<5,H3,$H$4>20,H5)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('67');
            helper.edit('M3', '=IFS($D$2=$H$2,D5,$D$8=$D$9,E11)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('15');
            helper.edit('M4', '=IFS($D$2<>$H$2,D5,$D$8=$D$4,F11)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('500');
            helper.edit('M5', '=IFS($D$2<>$H$2,$D$5,$D$8=$D$4,$F$10)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('1210');
            done();
        });
        it('IFS Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M6', '=IFS(Sheet1!D3<Sheet1!D6,Sheet2!A4,Sheet1!D3>Sheet1!D6,Sheet2!A6)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('30');
            helper.edit('M7', '=IFS(Sheet1!D3>Sheet1!D6,Sheet2!A4,Sheet1!D3<Sheet1!D6,Sheet2!A6)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('35');
            helper.edit('M8', '=IFS(Sheet2!A7<>Sheet2!A6,Sheet2!A2,Sheet2!A7<>Sheet2!A6,Sheet2!A10)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('20');
            helper.edit('M9', '=IFS(Sheet2!A7<=Sheet2!A6,Sheet1!D2,Sheet2!A7<>Sheet2!A6,Sheet1!D10)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('41');
            helper.edit('M10', '=IFS(Sheet2!A7<=Sheet2!A6,Sheet2!A2,Sheet2!A7<>Sheet2!A6,Sheet2!A9)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('50');
            helper.edit('M11', '=IFS(Sheet1!D7<=Sheet1!D6,Sheet1!F2,Sheet1!D7<>Sheet1!D6,Sheet1!D9)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('31');
            done();
        });
        it('IFS Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M11', '=IFS(Sheet1!$D$3>Sheet1!$D$6,Sheet2!$A$4,Sheet1!$D$3<Sheet1!$D$6,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('35');
            helper.edit('M12', '=IFS(Sheet1!$D$3<Sheet1!$D$6,Sheet2!$A$4,Sheet1!$D$3>Sheet1!$D$6,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('30');
            helper.edit('M13', '=IFS(Sheet2!$A$7<=Sheet2!$A$6,Sheet1!D2,Sheet2!$A$7<>Sheet2!$A$6,Sheet1!D10)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('41');
            helper.edit('M14', '=IFS(Sheet2!A7<>Sheet2!A6,Sheet2!$A$2,Sheet2!A7<>Sheet2!A6,Sheet2!$A$10)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('20');
            helper.edit('M15', '=IFS(Sheet2!$A$7<=Sheet2!$A$6,Sheet2!$A$2,Sheet2!$A$7<>Sheet2!$A$6,Sheet2!$A$9)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('50');
            helper.edit('M16', '=IFS(Sheet1!$D$7<=Sheet1!$D$6,Sheet1!$F$2,Sheet1!$D$7<>Sheet1!$D$6,Sheet1!$D$9)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('31');
            done();
        });
        it('IFS formula with wrong number of arguments error dialog cases ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IFS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IFS()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=IFS(D2=H2,1,D3=J3,3)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('1');
            spreadsheet.selectRange('K5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IFS(,,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IFS(,,)';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=IFS(D2=H2,1,D3=J3,3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('');
            done();
        });
    });

    describe('IFERROR Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '43925.21' }] }, { cells: [{ value: '#VALUE!' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '#NAME?' }] }, { cells: [{ value: '#NUM!' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '2' }] }, { cells: [{ value: '4' }] }, { cells: [{ value: '15' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('IFERROR formula with number type ', (done: Function) => {
            helper.edit('I1', '=IFERROR(34,1);');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('34');
            helper.edit('I2', '=IFERROR(-456,2);');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('-456');
            helper.edit('I3', '=IFERROR(-34.54,3);');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('-34.54');
            helper.edit('I4', '=IFERROR("45",11);');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('45');
            helper.edit('I5', '=IFERROR(5.43,12);');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('5.43');
            helper.edit('I6', '=IFERROR(-0.45,13);');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('-0.45');
            helper.edit('I7', '=IFERROR(67.54,14);');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('67.54');
            helper.edit('I8', '=IFERROR(-3,15);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('-3');
            helper.edit('I9', '=IFERROR(12.67,16);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('12.67');
            helper.edit('I10', '=IFERROR(342,17);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('342');
            done();
        });
        it('IFERROR formula with invalid type', (done: Function) => {
            helper.edit('I11', '=IFERROR(hello,4);');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('4');
            helper.edit('I12', '=IFERROR(hello,one);');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NAME?');
            done();
        });
        it('IFERROR formula with string type', (done: Function) => {
            helper.edit('I13', '=IFERROR(hello,"3");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('3');
            helper.edit('I14', '=IFERROR(one,"");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('');
            helper.edit('I15', '=IFERROR("hello",45);');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('hello');
            done();
        });
        it('IFERROR formula with invalid first argument', (done: Function) => {
            helper.edit('J1', '=IFERROR("er",4);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('er');
            helper.edit('J2', '=IFERROR("",1);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('');
            done();
        });
        it('IFERROR formula with cell reference', (done: Function) => {
            helper.edit('J3', '=IFERROR(B2,2);');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('41684');
            helper.edit('J4', '=IFERROR(A5,1);');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('Sandals & Floaters');
            helper.edit('J5', '=IFERROR(45,G8);');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('45');
            helper.edit('J6', '=IFERROR(F3,G5);');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('600');
            done();
        });
        it('IFERROR formula without first argument', (done: Function) => {
            helper.edit('J7', '=IFERROR(,2);');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J9', '=IFERROR("",G8);');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('');
            helper.edit('J10', '=IFERROR(45,"");');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('45');
            done();
        });
        it('IFERROR formula with empty as argument', (done: Function) => {
            helper.edit('J11', '=IFERROR(,);');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0');
            done();
        });
        it('IFERROR formula without second argument', (done: Function) => {
            helper.edit('J12', '=IFERROR(4,);');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('4');
            helper.edit('J13', '=IFERROR(G8,K10);');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('3');
            done();
        });
        it('IFERROR formula with second argument as expression and range', (done: Function) => {
            helper.edit('J14', '=IFERROR(4,2+1);');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('4');
            helper.edit('J15', '=IFERROR(G8,5-3);');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('3');
            helper.edit('J16', '=IFERROR(3/0,22/2);');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('11');
            helper.edit('J17', '=IFERROR(67,7*2);');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('67');
            helper.edit('J18', '=IFERROR(hello,A2:A5);');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('Casual Shoes');
            helper.edit('J19', '=IFERROR(A6:A9,"hello");');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('Flip- Flops & Slippers');
            done();
        });
        it('IFERROR formula with logical values as arguments', (done: Function) => {
            helper.edit('K1', '=IFERROR(TRUE,2);');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('TRUE');
            helper.edit('K2', '=IFERROR(FALSE,3);');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('FALSE');
            helper.edit('K3', '=IFERROR(3/0,TRUE);');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('TRUE');
            helper.edit('K4', '=IFERROR(43/0,FALSE);');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('FALSE');
            helper.edit('K5', 'TRUE');
            helper.edit('K6', 'FALSE');
            helper.edit('K7', '=IFERROR(43254,K5);');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('43254');
            helper.edit('K8', '=IFERROR(K5,11);');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('TRUE');
            helper.edit('K9', '=IFERROR(43254,K6);');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('43254');
            helper.edit('K10', '=IFERROR(K6,11);');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('FALSE');
            helper.edit('K11', '"TRUE"');
            helper.edit('K12', '"FALSE"');
            helper.edit('K13', '=IFERROR(K11,12);');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('"TRUE"');
            helper.edit('K14', '=IFERROR(K12,1);');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('"FALSE"');
            done();
        });
        it('IFERROR formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L1', '=IFERROR($B$8,1)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('41674');
            helper.edit('L2', '=IFERROR($C$7,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('0.455474537');
            helper.edit('L3', '=IFERROR($D$5,4)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('15');
            helper.edit('L4', '=IFERROR($E$3,2)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('30');
            helper.edit('L5', '=IFERROR($F$6,5)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('300');
            helper.edit('L6', '=IFERROR(56/0,$A$5)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('Sandals & Floaters');
            done();
        });
        it('IFERROR formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('L7', '=IFERROR(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('43925.21');
            helper.edit('L8', '=IFERROR(Sheet1!E3,3)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('30');
            helper.edit('L9', '=IFERROR(Sheet2!A4,4)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('4');
            helper.edit('L10', '=IFERROR(Sheet1!C10,11)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('0.480717593');
            done();
        });
        it('IFERROR formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L11', '=IFERROR(Sheet2!$A$3,12)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('"31-Jan-2018"');
            helper.edit('L12', '=IFERROR(Sheet1!$E$3,15)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('30');
            helper.edit('L13', '=IFERROR(Sheet2!$A$2,1)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('1');
            helper.edit('L14', '=IFERROR(Sheet1!$C$4,3)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0.147731481');
            helper.edit('L15', '=IFERROR(Sheet2!$A$5,2)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('2');
            helper.edit('L16', '=IFERROR(Sheet2!$A$6,3)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('3567.45');
            done();
        });
        it('IFERROR formula with nested formulas->', (done: Function) => {
            helper.edit('M1', '=IFERROR(DATE(2003,3,12),3)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('37692');
            helper.edit('M2', '=IFERROR(DAY(fdgfd),2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('2');
            helper.edit('M3', '=IFERROR(HOUR(343455546),2)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('2');
            helper.edit('M4', '=IFERROR(MINUTE("rdg"),2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('2');
            helper.edit('M5', '=IFERROR(45323,1)-WEEKDAY(43211,1)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('45316');
            done();
        });
        it('IFERROR formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=IFERROR();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=IFERROR();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=IFERROR(45321,2);');
            done();
        });
    });

    describe('AND Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] },
                        { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '0' }] }, { cells: [{ value: '1' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('AND Formula with direct values as number arguments ->', (done: Function) => {
            helper.edit('J1', '=AND(0)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('FALSE');
            helper.edit('J2', '=AND(1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('TRUE');
            helper.edit('J3', '=AND(-321)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('TRUE');
            helper.edit('J4', '=AND(55930332)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('TRUE');
            helper.edit('J5', '=AND(-323.12)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('TRUE');
            helper.edit('J6', '=AND(10,0)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('FALSE');
            helper.edit('J7', '=AND(12,-12)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('TRUE');
            helper.edit('J8', '=AND(1.323)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('TRUE');
            done();
        });
        it('AND Formula with direct values as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=AND(TRUE)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('TRUE');
            helper.edit('J10', '=AND(FALSE)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            helper.edit('J11', '=AND("TRUE")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('TRUE');
            helper.edit('J12', '=AND("FALSE")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('FALSE');
            helper.edit('J13', '=AND(TRUE,TRUE)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('TRUE');
            helper.edit('J14', '=AND(TRUE,FALSE)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('FALSE');
            helper.edit('J15', '=AND(FALSE,TRUE)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('FALSE');
            helper.edit('J16', '=AND(FALSE,FALSE)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('FALSE');
            helper.edit('J17', '=AND(TRUE,"true")');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('TRUE');
            helper.edit('J18', '=AND(TRUE,TRUE,TRUE,FALSE)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J19', '=AND("HELLO")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            helper.edit('J20', '=AND(World)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('#NAME?');
            helper.edit('J21', '=AND("hello"=hello)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#NAME?');
            helper.edit('J22', '=AND(12,32,"re")');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('TRUE');
            helper.edit('J23', '=AND(32,"Hello","32")');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('TRUE');
            done();
        });
        it('AND Formula with direct values as expression ->', (done: Function) => {
            helper.edit('K1', '=AND(1=1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('TRUE');
            helper.edit('K2', '=AND(12="12")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('FALSE');
            helper.edit('K3', '=AND(1=3,3=1)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('FALSE');
            helper.edit('K4', '=AND(1=1,11<>12)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('TRUE');
            helper.edit('K5', '=AND(1+2 =5)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('FALSE');
            helper.edit('K6', '=AND(1-32=-31)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('TRUE');
            helper.edit('K7', '=AND(1+13,2+43)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('TRUE');
            helper.edit('K8', '=AND(12-13,0)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with single cell references as arguments ->', (done: Function) => {
            helper.edit('K9', '=AND(A3)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#VALUE!');
            helper.edit('K10', '=AND(B4)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('TRUE');
            helper.edit('K11', '=AND(C5)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('TRUE');
            helper.edit('K12', '=AND(D6)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('TRUE');
            helper.edit('K13', '=AND(I7)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('TRUE');
            helper.edit('K14', '=AND(I9)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('TRUE');
            helper.edit('K15', '=AND(I10)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('FALSE');
            helper.edit('K16', '=AND(I11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K17', '=AND(I13)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('TRUE');
            helper.edit('K18', '=AND(I15)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('TRUE');
            helper.edit('K19', '=AND(I17)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('TRUE');
            helper.edit('K20', '=AND(I20)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('TRUE');
            helper.edit('K21', '=AND(F15)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('AND Formula with multiple kind of arguments  ->', (done: Function) => {
            helper.edit('K22', '=AND(A5,I11,12)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('TRUE');
            helper.edit('K23', '=AND(B5,B7,B8,B11,B3)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('TRUE');
            helper.edit('K24', '=AND(C3,C7,B7,C9)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('TRUE');
            helper.edit('K25', '=AND(B3:B9)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('TRUE');
            helper.edit('K26', '=AND(A6,A11,A15,B23,D17)');
            expect(helper.invoke('getCell', [25, 10]).textContent).toBe('#VALUE!');
            helper.edit('K27', '=AND(I10,G6,12,"12",D4:D7)');
            expect(helper.invoke('getCell', [26, 10]).textContent).toBe('FALSE');
            helper.edit('K28', '=AND(A2:A5,"*A")');
            expect(helper.invoke('getCell', [27, 10]).textContent).toBe('#VALUE!');
            helper.edit('K29', '=AND(A2:A5,"c*")');
            expect(helper.invoke('getCell', [28, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('AND Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('L1', '=AND(A4<A7)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('TRUE');
            helper.edit('L2', '=AND(A4>A7)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('FALSE');
            helper.edit('L3', '=AND(D6>=E5)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('TRUE');
            helper.edit('L4', '=AND(D6<=E5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('FALSE');
            helper.edit('L5', '=AND(D4=D3,D2=H2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('TRUE');
            helper.edit('L6', '=AND(H6<>H7)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('TRUE');
            done();
        });
        it('AND Formula with expression and cell references as arguments ->', (done: Function) => {
            helper.edit('L7', '=AND(H4+I6+H10=E8)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('FALSE');
            helper.edit('L8', '=AND(A9+A10 =A11)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            helper.edit('L9', '=AND(E8-E9-F10=D6)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('FALSE');
            helper.edit('L10', '=AND(H8-F6<>F4)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('TRUE');
            helper.edit('L11', '=AND(H7+34+D10-F9*A20=0,0)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L12', '=IF(AND(0),1,3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('3');
            helper.edit('L13', '=IF(AND(10=H2,E2=20),"Hello","fake")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('Hello');
            helper.edit('L14', '=IF(AND(I2,I4,),100,200)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('200');
            helper.edit('L15', '=IF(1=1,AND(E2>=20,E8>=20),32)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('FALSE');
            helper.edit('L16', '=IFS(AND(TRUE,1),10, AND(10,0),20)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('10');
            helper.edit('L17', '=IFS(AND(TRUE,0),10, AND(10,21),20)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('20');
            done();
        });
        it('AND Formula with basic cases as arguments ->', (done: Function) => {
            helper.edit('L18', '=AND(1=1,2=2,3=3)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('TRUE');
            helper.edit('L19', '=AND(1=2,2=3,3=4)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('FALSE');
            helper.edit('L20', '=AND(D2>1,D4>3)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('TRUE');
            helper.edit('L21', '=IF(AND(E3>100,E3>20),"Yes","No")');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('No');
            helper.edit('L22', '=AND(H4=27,B6<DATE(2023,10,22))');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('TRUE');
            helper.edit('L23', '=AND(21,"12")');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('TRUE');
            done();
        });
        it('AND Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('M1', '=AND($B$2)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('TRUE');
            helper.edit('M2', '=AND($I$4)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('FALSE');
            helper.edit('M3', '=AND($H$4=27,$B$6<DATE(2023,10,22))');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('TRUE');
            helper.edit('M4', '=AND($D$4=$D$3,$D$2=$H$2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('TRUE');
            helper.edit('M5', '=AND($D$4>$D$7,$H$6+20=90)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M6', '=AND(Sheet2!A5,Sheet1!G6)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('TRUE');
            helper.edit('M7', '=AND(Sheet1!G4<Sheet1!G5,Sheet2!A3<Sheet2!A2)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('TRUE');
            helper.edit('M8', '=AND(Sheet1!H10,Sheet2!A8)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('FALSE');
            helper.edit('M9', '=AND(Sheet1!G4,Sheet1!G7,Sheet1!I6,Sheet1!J7)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('TRUE');
            helper.edit('M10', '=AND(F4=300,Sheet1!F7,Sheet2!A6)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M11', '=AND(Sheet2!$A$5,Sheet1!G6>Sheet1!E3)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('FALSE');
            helper.edit('M12', '=AND(Sheet2!$A$5,Sheet1!$G$6<Sheet1!$E$3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('TRUE');
            helper.edit('M13', '=AND(Sheet1!$G$4<Sheet1!$G$5,Sheet2!$A$3<Sheet2!$A$2)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('TRUE');
            helper.edit('M14', '=AND($F$4=300,Sheet1!$F$7,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('FALSE');
            helper.edit('M15', '=AND(Sheet2!$A$5,Sheet1!$G$6)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('TRUE');
            helper.edit('M16', '=AND(Sheet1!$H$10,Sheet2!$A$8)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M17', '=AND("")');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#VALUE!');
            helper.edit('M18', '=AND(NAME)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#NAME?');
            helper.edit('M19', '=AND(,,)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('FALSE');
            helper.edit('M20', '=AND(1="1")');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('FALSE');
            helper.edit('M21', '=AND(,12)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('FALSE');
            helper.edit('M22', '=AND(E14,E15,E17,E18)');
            expect(helper.invoke('getCell', [21, 12]).textContent).toBe('#VALUE!');
            helper.edit('M23', '=AND(E15,)');
            expect(helper.invoke('getCell', [22, 12]).textContent).toBe('FALSE');
            done();
        });
        it('AND Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AND()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AND()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N15', '=AND(0)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('FALSE');
            done();
        });
    });

    describe('OR Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] },
                        { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '0' }] }, { cells: [{ value: '1' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('OR Formula with direct values as number arguments ->', (done: Function) => {
            helper.edit('J1', '=OR(0)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('FALSE');
            helper.edit('J2', '=OR(1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('TRUE');
            helper.edit('J3', '=OR(-321)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('TRUE');
            helper.edit('J4', '=OR(55930332)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('TRUE');
            helper.edit('J5', '=OR(-323.12)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('TRUE');
            helper.edit('J6', '=OR(10,0)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('TRUE');
            helper.edit('J7', '=OR(12,-12)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('TRUE');
            helper.edit('J8', '=OR(1.323)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with direct values as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=OR(TRUE)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('TRUE');
            helper.edit('J10', '=OR(FALSE)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            helper.edit('J11', '=OR("TRUE")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('TRUE');
            helper.edit('J12', '=OR("FALSE")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('FALSE');
            helper.edit('J13', '=OR(TRUE,TRUE)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('TRUE');
            helper.edit('J14', '=OR(TRUE,FALSE)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('TRUE');
            helper.edit('J15', '=OR(FALSE,TRUE)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('TRUE');
            helper.edit('J16', '=OR(FALSE,FALSE)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('FALSE');
            helper.edit('J17', '=OR(TRUE,"true")');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('TRUE');
            helper.edit('J18', '=OR(TRUE,TRUE,TRUE,FALSE)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J19', '=OR("HELLO")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            helper.edit('J20', '=OR(World)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('#NAME?');
            helper.edit('J21', '=OR("hello"=hello)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#NAME?');
            helper.edit('J22', '=OR(12,32,"re")');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('TRUE');
            helper.edit('J23', '=OR(32,"Hello","32")');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with direct values as expression ->', (done: Function) => {
            helper.edit('K1', '=OR(1=1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('TRUE');
            helper.edit('K2', '=OR(12="12")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('FALSE');
            helper.edit('K3', '=OR(1=3,3=1)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('FALSE');
            helper.edit('K4', '=OR(1=1,11<>12)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('TRUE');
            helper.edit('K5', '=OR(1+2 =5)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('FALSE');
            helper.edit('K6', '=OR(1-32=-31)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('TRUE');
            helper.edit('K7', '=OR(1+13,2+43)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('TRUE');
            helper.edit('K8', '=OR(12-13,0)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with single cell references as arguments ->', (done: Function) => {
            helper.edit('K9', '=OR(A3)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#VALUE!');
            helper.edit('K10', '=OR(B4)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('TRUE');
            helper.edit('K11', '=OR(C5)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('TRUE');
            helper.edit('K12', '=OR(D6)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('TRUE');
            helper.edit('K13', '=OR(I7)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('TRUE');
            helper.edit('K14', '=OR(I9)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('TRUE');
            helper.edit('K15', '=OR(I10)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('FALSE');
            helper.edit('K16', '=OR(I11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K17', '=OR(I13)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('TRUE');
            helper.edit('K18', '=OR(I15)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('TRUE');
            helper.edit('K19', '=OR(I17)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('TRUE');
            helper.edit('K20', '=OR(I20)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('TRUE');
            helper.edit('K21', '=OR(F15)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('OR Formula with multiple kind of arguments  ->', (done: Function) => {
            helper.edit('K22', '=OR(A5,I11,12)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('TRUE');
            helper.edit('K23', '=OR(B5,B7,B8,B11,B3)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('TRUE');
            helper.edit('K24', '=OR(C3,C7,B7,C9)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('TRUE');
            helper.edit('K25', '=OR(B3:B9)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('TRUE');
            helper.edit('K26', '=OR(A6,A11,A15,B23,D17)');
            expect(helper.invoke('getCell', [25, 10]).textContent).toBe('#VALUE!');
            helper.edit('K27', '=OR(I10,G6,12,"12",D4:D7)');
            expect(helper.invoke('getCell', [26, 10]).textContent).toBe('TRUE');
            helper.edit('K28', '=OR(A2:A5,"*A")');
            expect(helper.invoke('getCell', [27, 10]).textContent).toBe('#VALUE!');
            helper.edit('K29', '=OR(A2:A5,"c*")');
            expect(helper.invoke('getCell', [28, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('OR Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('L1', '=OR(A4<A7)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('TRUE');
            helper.edit('L2', '=OR(A4>A7)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('FALSE');
            helper.edit('L3', '=OR(D6>=E5)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('TRUE');
            helper.edit('L4', '=OR(D6<=E5)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('FALSE');
            helper.edit('L5', '=OR(D4=D3,D2=H2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('TRUE');
            helper.edit('L6', '=OR(H6<>H7)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with expression and cell references as arguments ->', (done: Function) => {
            helper.edit('L7', '=OR(H4+I6+H10=E8)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('FALSE');
            helper.edit('L8', '=OR(A9+A10 =A11)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            helper.edit('L9', '=OR(E8-E9-F10=D6)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('FALSE');
            helper.edit('L10', '=OR(H8-F6<>F4)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('TRUE');
            helper.edit('L11', '=OR(H7+34+D10-F9*A20=0,0)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('FALSE');
            done();
        });
        it('OR Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L12', '=IF(OR(0),1,3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('3');
            helper.edit('L13', '=IF(OR(10=H2,E2=20),"Hello","fake")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('Hello');
            helper.edit('L14', '=IF(OR(I2,I4,),100,200)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('100');
            helper.edit('L15', '=IF(1=1,OR(E2>=20,E8>=20),32)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('TRUE');
            helper.edit('L16', '=IFS(OR(TRUE,1),10, OR(10,0),20)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('10');
            helper.edit('L17', '=IFS(OR(0,0),10, OR(10,-12),20)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('20');
            done();
        });
        it('OR Formula with basic cases as arguments ->', (done: Function) => {
            helper.edit('L18', '=OR(1=1,2=2,3=3)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('TRUE');
            helper.edit('L19', '=OR(1=2,2=3,3=4)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('FALSE');
            helper.edit('L20', '=OR(D2>1,D4>3)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('TRUE');
            helper.edit('L21', '=IF(OR(E3>100,E3>20),"Yes","No")');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('Yes');
            helper.edit('L22', '=OR(H4=27,B6<DATE(2023,10,22))');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('TRUE');
            helper.edit('L23', '=OR(21,"12")');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('M1', '=OR($B$2)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('TRUE');
            helper.edit('M2', '=OR($I$4)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('FALSE');
            helper.edit('M3', '=OR($H$4=27,$B$6<DATE(2023,10,22))');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('TRUE');
            helper.edit('M4', '=OR($D$4=$D$3,$D$2=$H$2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('TRUE');
            helper.edit('M5', '=OR($D$4>$D$7,$H$6+20=90)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M6', '=OR(Sheet2!A5,Sheet1!G6)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('TRUE');
            helper.edit('M7', '=OR(Sheet1!G4<Sheet1!G5,Sheet2!A3<Sheet2!A2)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('TRUE');
            helper.edit('M8', '=OR(Sheet1!H10,Sheet2!A8)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('TRUE');
            helper.edit('M9', '=OR(Sheet1!G4,Sheet1!G7,Sheet1!I6,Sheet1!J7)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('TRUE');
            helper.edit('M10', '=OR(F4=300,Sheet1!F7,Sheet2!A6)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M11', '=OR(Sheet2!$A$5,Sheet1!G6>Sheet1!E3)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('TRUE');
            helper.edit('M12', '=OR(Sheet2!$A$5,Sheet1!$G$6<Sheet1!$E$3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('TRUE');
            helper.edit('M13', '=OR(Sheet1!$G$4<Sheet1!$G$5,Sheet2!$A$3<Sheet2!$A$2)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('TRUE');
            helper.edit('M14', '=OR($F$4=300,Sheet1!$F$7,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('TRUE');
            helper.edit('M15', '=OR(Sheet2!$A$5 = 10,Sheet1!$G$6 = 20)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('FALSE');
            helper.edit('M16', '=OR(Sheet1!$H$10,Sheet2!$A$8)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('TRUE');
            done();
        });
        it('OR Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M17', '=OR("")');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#VALUE!');
            helper.edit('M18', '=OR(NAME)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#NAME?');
            helper.edit('M19', '=OR(,,)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('FALSE');
            helper.edit('M20', '=OR(1="1",0)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('FALSE');
            helper.edit('M21', '=OR(,12)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('TRUE');
            helper.edit('M22', '=OR(E14,E15,E17,E18)');
            expect(helper.invoke('getCell', [21, 12]).textContent).toBe('#VALUE!');
            helper.edit('M23', '=OR(E15,)');
            expect(helper.invoke('getCell', [22, 12]).textContent).toBe('FALSE');
            done();
        });
        it('OR Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=OR()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=OR()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N15', '=OR(0,1)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('TRUE');
            done();
        });
    });

    describe('EJ2-850741 -> NOT Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: 'Hello123' }] }, { cells: [{ index: 8, value: '124Hello' }] },
                        { cells: [{ index: 8, value: '119', format: '#,##0.00' }] }, { cells: [{ index: 8, value: '32', format: '#,##0.00' }] },
                        { cells: [{ index: 8, value: '119', format: '$#,##0.00' }] }, { cells: [{ index: 8, value: '12.76', format: '$#,##0.00' }] },
                        { cells: [{ index: 8, value: '12', format: '0.0000E+00' }] }, { cells: [{ index: 8, value: '17', format: '0.0000E+00' }] },
                        { cells: [{ index: 8, value: '2', format: '0%' }] }, { cells: [{ index: 8, value: '115', format: '0%' }] }]
                }, {
                    rows: [
                        { cells: [{ value: '2' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '6' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] },
                        { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '0' }] }, { cells: [{ value: '1' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('NOT Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=NOT(0)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('TRUE');
            helper.edit('J2', '=NOT(1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('FALSE');
            helper.edit('J3', '=NOT(-1)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('FALSE');
            helper.edit('J4', '=NOT(55930332)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('FALSE');
            helper.edit('J5', '=NOT(-323.12)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('FALSE');
            done();
        });
        it('NOT Formula with direct values as boolean arguments ->', (done: Function) => {
            helper.edit('J6', '=NOT(TRUE)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('FALSE');
            helper.edit('J7', '=NOT(FALSE)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('TRUE');
            helper.edit('J8', '=NOT("TRUE")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('FALSE');
            helper.edit('J9', '=NOT("FALSE")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('TRUE');
            helper.edit('J10', '=NOT(I3)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            helper.edit('J11', '=NOT(I4)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('TRUE');
            done();
        });
        it('NOT Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J12', '=NOT("HELLO")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#VALUE!');
            helper.edit('J13', '=NOT("Hello123")');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('#VALUE!');
            helper.edit('J14', '=NOT("123Hell123")');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#VALUE!');
            helper.edit('J15', '=NOT("123HEllo")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('NOT Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J16', '=NOT(1=1)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('FALSE');
            helper.edit('J17', '=NOT(1=3)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('TRUE');
            helper.edit('J18', '=NOT("1"=2)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('TRUE');
            helper.edit('J19', '=NOT("1"="1")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('FALSE');
            helper.edit('J20', '=NOT("Hello"="ello")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('TRUE');
            helper.edit('J21', '=NOT(1+1=2)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('FALSE');
            helper.edit('J22', '=NOT(2+2=5)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('TRUE');
            helper.edit('J23', '=NOT(12+32-40 =4)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('FALSE');
            done();
        });
        it('NOT Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('K1', '=NOT(A3)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            helper.edit('K2', '=NOT(B4)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('FALSE');
            helper.edit('K3', '=NOT(C5)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('FALSE');
            helper.edit('K4', '=NOT(D6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('FALSE');
            helper.edit('K5', '=NOT(I7)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('FALSE');
            helper.edit('K6', '=NOT(I9)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('FALSE');
            helper.edit('K7', '=NOT(I10)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('TRUE');
            helper.edit('K8', '=NOT(I11)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#VALUE!');
            helper.edit('K9', '=NOT(I13)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('FALSE');
            helper.edit('K10', '=NOT(I15)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('FALSE');
            helper.edit('K11', '=NOT(I17)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('FALSE');
            helper.edit('K12', '=NOT(I20)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('FALSE');
            done();
        });
        it('NOT Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('K13', '=NOT(E3>32)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('TRUE');
            helper.edit('K14', '=NOT(E3<32)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('FALSE');
            helper.edit('K15', '=NOT(F5<=F6)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('FALSE');
            helper.edit('K16', '=NOT(F5>=F6)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('FALSE');
            helper.edit('K17', '=NOT(F5=F6)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('FALSE');
            helper.edit('K18', '=NOT(F5<>F6)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('TRUE');
            done();
        });
        it('NOT Formula with expression and cell references as arguments ->', (done: Function) => {
            helper.edit('K19', '=NOT(H4+I6+H10=E8)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('TRUE');
            helper.edit('K20', '=NOT(A9+A10 =A11)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('#VALUE!');
            helper.edit('K21', '=NOT(E8-E9-F10=D6)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('TRUE');
            helper.edit('K22', '=NOT(H8-F6<>F4)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('FALSE');
            helper.edit('K23', '=NOT(H7+34+D10-F9*A20=0)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('TRUE');
            helper.edit('K24', '=NOT(A15)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('TRUE');
            done();
        });
        it('NOT Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L1', '=IF(NOT(TRUE),"HI","DK")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('DK');
            helper.edit('L2', '=IF(NOT(0),"HI","DK")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('HI');
            helper.edit('L3', '=NOT(OR(1=1,2=3))');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('FALSE');
            helper.edit('L4', '=NOT(AND(0=1,1=1))');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('TRUE');
            helper.edit('L5', '=OR(1=1,0=1)*NOT(AND(0=1,1=1))');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('1');
            helper.edit('L6', '=NOT(AND(0))');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('TRUE');
            helper.edit('L7', '=NOT("10/01/2023" = DATE(2023,10,1))');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('TRUE');
            helper.edit('L8', '=IFS(NOT(FALSE),10, NOT(0),20)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('10');
            helper.edit('L9', '=IFS(NOT(TRUE),10, NOT(0),20)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('20');
            done();
        });
        it('NOT Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('L10', '=NOT($B$2)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('FALSE');
            helper.edit('L11', '=NOT($I$4)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('TRUE');
            helper.edit('L12', '=NOT($E$1>$E$3)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('FALSE');
            helper.edit('L13', '=NOT($F$2+$E$2 =$F$3)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('TRUE');
            done();
        });
        it('NOT Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('L14', '=NOT(Sheet1!F2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('FALSE');
            helper.edit('L15', '=NOT(Sheet2!A2)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('FALSE');
            helper.edit('L16', '=NOT(Sheet1!A10 * Sheet2!A5 = Sheet1!H10)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            helper.edit('L17', '=NOT(Sheet1!D31+Sheet2!A3 = 30)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('TRUE');
            helper.edit('L18', '=NOT(E9-E11=Sheet1!I10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('FALSE');
            done();
        });
        it('NOT Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('L19', '=NOT($E$9-$E$11=Sheet1!I10)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('FALSE');
            helper.edit('L20', '=NOT(E9-E11=Sheet1!$I$10)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('FALSE');
            helper.edit('L21', '=NOT(Sheet1!$A$10 * Sheet2!$A$5 = Sheet1!$H$10)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('#VALUE!');
            helper.edit('L22', '=NOT(Sheet1!$D$31+Sheet2!$A$3 = 30)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('TRUE');
            helper.edit('L23', '=NOT(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('FALSE');
            helper.edit('L24', '=NOT(Sheet1!$A$2)');
            expect(helper.invoke('getCell', [23, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('NOT Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M1', '=NOT("")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#VALUE!');
            helper.edit('M2', '=NOT(IF(1=1,T,F))');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#VALUE!');
            helper.edit('M3', '=NOT(HELLO)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#NAME?');
            helper.edit('M4', '=NOT("@")');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('NOT Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('M5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=NOT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=NOT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M5', '=NOT(0)');
            spreadsheet.selectRange('M6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=NOT(12,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=NOT(12,2)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M6', '=NOT(1)');
            spreadsheet.selectRange('M7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=NOT(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=NOT(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M7', '=NOT(0)');
            done();
        });
    });

    describe('EJ2-971975 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ activeSheetIndex: 0, sheets: [{ ranges: [{ dataSource: defaultData }] }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, { name: 'IF', rows: [{ index: 4, cells: [{ value: 'Sandals & Floaters' }, { value: '50' }] }] }, {}, {}] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Check sheet reference with more than 20 sheets->', (done: Function) => {
            helper.edit('I1', '=Sheet20!A5');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=Sheet20!A5"}');
            helper.edit('I2', '=Sheet21!C16');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"0","formula":"=Sheet21!C16"}');
            done();
        });
        it('Check sheet reference with the sheet name as IF->', (done: Function) => {
            helper.edit('I3', '=IF!A5');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('Sandals & Floaters');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"Sandals & Floaters","formula":"=IF!A5"}');
            helper.edit('I4', '=IF!B5');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"50","formula":"=IF!B5"}');
            done();
        });
        it('PI Formula ->', (done: Function) => {
            helper.edit('K1', '=PI()');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('3.141592654');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":3.141592653589793,"formula":"=PI()"}');
            done();
        });
        it('PI Formula with other operator->', (done: Function) => {
            helper.edit('K2', '=PI()*2');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('6.283185307');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"6.283185307179586","formula":"=PI()*2"}');
            done();
        });
        it('PI Formula for area of circle formula->', (done: Function) => {
            helper.edit('K4', '=PI()*(D3^2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('1256.637061');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"1256.6370614359173","formula":"=PI()*(D3^2)"}');
            done();
        });
        it('PI Formula with Degrees formula->', (done: Function) => {
            helper.edit('K5', '=DEGREES(pi())');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('180');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":180,"formula":"=DEGREES(pi())"}');
            done();
        });
        it('PI Formula with string value to the power of 2 as argument ->', (done: Function) => {
            helper.edit('K6', '=PI()*C1^2');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"#VALUE!","formula":"=PI()*C1^2"}');
            helper.edit('K7', '=PI()*2^C1');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"#VALUE!","formula":"=PI()*2^C1"}');
            done();
        });
        it('PI Formula with invalid input ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=PI(2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=PI(2)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K3', '=PI()');
            done();
        });
    });

    describe('Formula - Checking IV ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ODD Formula with cell Reference - I->', (done: Function) => {
            helper.edit('I1', '=ODD(E4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('15');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":15,"formula":"=ODD(E4)"}');
            done();
        });
        it('ODD Formula with cell Reference - II->', (done: Function) => {
            helper.edit('I2', '=ODD(E2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('21');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":21,"formula":"=ODD(E2)"}');
            done();
        });
        it('ODD Formula with direct value->', (done: Function) => {
            helper.edit('I3', '=ODD(22)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('23');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":23,"formula":"=ODD(22)"}');
            done();
        });
        it('ODD Formula with negative odd value->', (done: Function) => {
            helper.edit('I4', '=ODD(-1)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":-1,"formula":"=ODD(-1)"}');
            done();
        });
        it('ODD Formula with negative even value->', (done: Function) => {
            helper.edit('I5', '=ODD(-2)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('-3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":-3,"formula":"=ODD(-2)"}');
            done();
        });
        it('ODD Formula with decimal value->', (done: Function) => {
            helper.edit('I6', '=ODD(1.5)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":3,"formula":"=ODD(1.5)"}');
            done();
        });
        it('ODD Formula with negative decimal value->', (done: Function) => {
            helper.edit('I7', '=ODD(-1.5)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('-3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":-3,"formula":"=ODD(-1.5)"}');
            done();
        });
        it('ODD Formula with no input->', (done: Function) => {
            helper.edit('I8', '=ODD()');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{}');
            done();
        });
        it('ODD Formula with more than 1 input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ODD(D2,D3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ODD(D2,D3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I9', '=ODD(D2)');
            done();
        });
        it('ODD Formula with invalid input->', (done: Function) => {
            helper.edit('I10', '=ODD(odd)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":"#NAME?","formula":"=ODD(odd)"}');
            done();
        });
        it('ODD Formula with with cell having no value->', (done: Function) => {
            helper.edit('I11', '=ODD(L3)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":1,"formula":"=ODD(L3)"}');
            done();
        });
        it('ODD Formula with with cell having alphabets->', (done: Function) => {
            helper.edit('I12', '=ODD(A3)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"#VALUE!","formula":"=ODD(A3)"}');
            done();
        });
        it('ODD Formula with with cell boolean value->', (done: Function) => {
            helper.edit('I13', '=ODD(TRUE)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":1,"formula":"=ODD(TRUE)"}');
            done();
        });
        it('ODD Formula with with boolean value->', (done: Function) => {
            helper.edit('I14', '=ODD(FALSE)');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[8])).toBe('{"value":1,"formula":"=ODD(FALSE)"}');
            done();
        });
        it('ODD Formula with with boolean value as cell reference->', (done: Function) => {
            helper.edit('I15', 'TRUE');
            helper.edit('I16', '=ODD(I15)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":1,"formula":"=ODD(I15)"}');
            done();
        });
        it('ODD Formula with with boolean value as cell reference->', (done: Function) => {
            helper.edit('I17', '=ODD("TRUE")');
            expect(helper.invoke('getCell', [16, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[8])).toBe('{"value":"#VALUE!","formula":"=ODD(\\"TRUE\\")"}');
            done();
        });
        it('ODD Formula percentage,decimal,date,time,currency formats ->', (done: Function) => {
            helper.edit('M1', '4000.00%');
            helper.edit('M2', '4045671234');
            helper.edit('M3', '11/7/2015');
            helper.edit('M4', '1/10/1900 3:10:00 AM');
            helper.edit('M5', '$123');
            helper.edit('M6', '=ODD(M1)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('41');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":41,"formula":"=ODD(M1)"}');
            helper.edit('M7', '=ODD(M2)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('4045671235');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":4045671235,"formula":"=ODD(M2)"}');
            helper.edit('M8', '=ODD(M3)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('42315');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":42315,"formula":"=ODD(M3)"}');
            helper.edit('M9', '=ODD(M4)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":11,"formula":"=ODD(M4)"}');
            helper.edit('M10', '=ODD(M5)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('123');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":123,"formula":"=ODD(M5)"}');
            done();
        });
        it('ODD formula with nested formula and extra string cases', (done: Function) => {
            helper.edit('N1', '=ODD(SUM(1,2))');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('3');
            helper.edit('N2', '=ODD(PRODUCT(1,2))');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('3');
            helper.edit('N3', '=ODD(MIN(G2:G8))');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('1');
            helper.edit('N4', '=ODD(MAX(G2:G8))');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('13');
            helper.edit('N5', '=ODD(IF(G1>G4,2,3))');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('3');
            helper.edit('N6', '=SUM(ODD(G5),3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('14');
            helper.edit('N7', '=PRODUCT(ODD(G7),ODD(3))');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('39');
            helper.edit('N8', '=MIN(ODD(24),ODD(28))');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('25');
            helper.edit('N9', '=MAX(ODD(24),ODD(28))');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('29');
            helper.edit('N10', '=ODD("")');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('#VALUE!');
            helper.edit('N11', '=ODD(" ")');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('#VALUE!');
            helper.edit('N12', '"hello"');
            helper.edit('N13', '=ODD(N12)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('#VALUE!');
            helper.edit('N14', '"TRUE"');
            helper.edit('N15', '=ODD(N14)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('#VALUE!');
            helper.edit('N16', '=ODD(O14)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('1');
            helper.edit('N17', '"123"');
            helper.edit('N18', '=ODD(N17)');
            expect(helper.invoke('getCell', [17, 13]).textContent).toBe('#VALUE!');
            done();
        });
        it('EVEN Formula with cell Reference - I->', (done: Function) => {
            helper.edit('J1', '=EVEN(E4)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('16');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":16,"formula":"=EVEN(E4)"}');
            done();
        });
        it('EVEN Formula with cell Reference - II->', (done: Function) => {
            helper.edit('J2', '=EVEN(E2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":20,"formula":"=EVEN(E2)"}');
            done();
        });
        it('EVEN Formula with direct value->', (done: Function) => {
            helper.edit('J3', '=EVEN(13)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('14');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":14,"formula":"=EVEN(13)"}');
            done();
        });
        it('EVEN Formula with negative odd value->', (done: Function) => {
            helper.edit('J4', '=EVEN(-13)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('-14');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":-14,"formula":"=EVEN(-13)"}');
            done();
        });
        it('EVEN Formula with negative even value->', (done: Function) => {
            helper.edit('J5', '=EVEN(-14)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('-14');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":-14,"formula":"=EVEN(-14)"}');
            done();
        });
        it('EVEN Formula with decimal value->', (done: Function) => {
            helper.edit('J6', '=EVEN(2.5)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":4,"formula":"=EVEN(2.5)"}');
            done();
        });
        it('EVEN Formula with negative decimal value->', (done: Function) => {
            helper.edit('J7', '=EVEN(-1.5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":-2,"formula":"=EVEN(-1.5)"}');
            done();
        });
        it('EVEN Formula with no input->', (done: Function) => {
            helper.edit('J8', '=EVEN()');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{}');
            done();
        });
        it('EVEN Formula with more than 1 input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EVEN(D2,D3)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EVEN(D2,D3)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J9', '=EVEN(D2)');
            done();
        });
        it('EVEN Formula with invalid input->', (done: Function) => {
            helper.edit('J10', '=EVEN(even)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[9])).toBe('{"value":"#NAME?","formula":"=EVEN(even)"}');
            done();
        });
        it('EVEN Formula with with cell having no value->', (done: Function) => {
            helper.edit('J11', '=EVEN(L3)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[9])).toBe('{"value":0,"formula":"=EVEN(L3)"}');
            done();
        });
        it('EVEN Formula with with cell having alphabets->', (done: Function) => {
            helper.edit('J12', '=EVEN(A3)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[9])).toBe('{"value":"#VALUE!","formula":"=EVEN(A3)"}');
            done();
        });
        it('EVEN Formula with boolean value TRUE->', (done: Function) => {
            helper.edit('J13', '=EVEN(TRUE)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[9])).toBe('{"value":2,"formula":"=EVEN(TRUE)"}');
            done();
        });
        it('EVEN Formula with boolean value FALSE->', (done: Function) => {
            helper.edit('J14', '=EVEN(FALSE)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[9])).toBe('{"value":0,"formula":"=EVEN(FALSE)"}');
            done();
        });
        it('EVEN Formula with boolean value as cell reference->', (done: Function) => {
            helper.edit('J15', 'TRUE');
            helper.edit('J16', '=EVEN(J15)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[9])).toBe('{"value":2,"formula":"=EVEN(J15)"}');
            done();
        });
        it('EVEN Formula with boolean value as cell reference->', (done: Function) => {
            helper.edit('J17', 'FALSE');
            helper.edit('J18', '=EVEN(J17)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[9])).toBe('{"value":0,"formula":"=EVEN(J17)"}');
            done();
        });
        it('EVEN Formula percentage,decimal,date,time,currency formats ->', (done: Function) => {
            helper.edit('L1', '4000.00%');
            helper.edit('L2', '4045671234');
            helper.edit('L3', '11/7/2015');
            helper.edit('L4', '1/10/1900 3:10:00 AM');
            helper.edit('L5', '$123');
            helper.edit('L6', '=EVEN(L1)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('40');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":40,"formula":"=EVEN(L1)"}');
            helper.edit('L7', '=EVEN(L2)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('4045671234');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":4045671234,"formula":"=EVEN(L2)"}');
            helper.edit('L8', '=EVEN(L3)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('42316');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":42316,"formula":"=EVEN(L3)"}');
            helper.edit('L9', '=EVEN(L4)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":12,"formula":"=EVEN(L4)"}');
            helper.edit('L10', '=EVEN(L5)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('124');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":124,"formula":"=EVEN(L5)"}');
            done();
        });
        it('EVEN formula with nested formula and extra string cases', (done: Function) => {
            helper.edit('O1', '=EVEN(SUM(1,2))');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('4');
            helper.edit('O2', '=EVEN(PRODUCT(1,2))');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('2');
            helper.edit('O3', '=EVEN(MIN(G2:G8))');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('2');
            helper.edit('O4', '=EVEN(MAX(G2:G8))');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('14');
            helper.edit('O5', '=EVEN(IF(G1>G4,2,3))');
            expect(helper.invoke('getCell', [4, 14]).textContent).toBe('2');
            helper.edit('O6', '=SUM(EVEN(G5),3)');
            expect(helper.invoke('getCell', [5, 14]).textContent).toBe('15');
            helper.edit('O7', '=PRODUCT(EVEN(G7),EVEN(3))');
            expect(helper.invoke('getCell', [6, 14]).textContent).toBe('56');
            helper.edit('O8', '=MIN(EVEN(24),EVEN(28))');
            expect(helper.invoke('getCell', [7, 14]).textContent).toBe('24');
            helper.edit('O9', '=MAX(EVEN(24),EVEN(28))');
            expect(helper.invoke('getCell', [8, 14]).textContent).toBe('28');
            helper.edit('O10', '=EVEN("")');
            expect(helper.invoke('getCell', [9, 14]).textContent).toBe('#VALUE!');
            helper.edit('O11', '=EVEN(" ")');
            expect(helper.invoke('getCell', [10, 14]).textContent).toBe('#VALUE!');
            helper.edit('O12', '"hello"');
            helper.edit('O13', '=EVEN(O12)');
            expect(helper.invoke('getCell', [12, 14]).textContent).toBe('#VALUE!');
            helper.edit('O14', '"TRUE"');
            helper.edit('O15', '=EVEN(O14)');
            expect(helper.invoke('getCell', [14, 14]).textContent).toBe('#VALUE!');
            helper.edit('O16', '=EVEN(P14)');
            expect(helper.invoke('getCell', [15, 14]).textContent).toBe('0');
            helper.edit('O17', '"123"');
            helper.edit('O18', '=EVEN(O17)');
            expect(helper.invoke('getCell', [17, 14]).textContent).toBe('#VALUE!');
            done();
        });
    });
});
