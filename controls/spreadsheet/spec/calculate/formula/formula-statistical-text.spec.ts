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

    // Statistical Category Formulas
    describe('AVERAGE Formula Checking ->', () => {
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
        it('AVERAGE Formula with ranged cell references values as arguments->', (done: Function) => {
            helper.edit('J1', '=AVERAGE(A2:A10)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J2', '=AVERAGE(B3:B10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('7/22/2014');
            helper.edit('J3', '=AVERAGE(C3:C8)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('5:12:56 AM');
            helper.edit('J4', '=AVERAGE(D2:D11)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('27.7');
            helper.edit('J5', '=AVERAGE(I2:I6)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('467.30684');
            helper.edit('J6', '=AVERAGE(I6:I10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('514.336418');
            helper.edit('J7', '=AVERAGE(I19:I21)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-1491.333333');
            helper.edit('J8', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('$65.78');
            helper.edit('J9', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('1.4500E+01');
            helper.edit('J10', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('5850%');
            helper.edit('J11', '=AVERAGE(I13:I16)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J12', '=AVERAGE(I13:I29)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('-341.4945455');
            done();
        });
        it('AVERAGE Formula with single cell references values as arguments->', (done: Function) => {
            helper.edit('J13', '=AVERAGE(I21)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('0');
            helper.edit('J14', '=AVERAGE(F3)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('600');
            helper.edit('J15', '=AVERAGE(C13)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J16', '=AVERAGE(D3,E7,I4,I20,F9)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('-159.954');
            helper.edit('J17', '=AVERAGE(A6:A8,D7,F6,G10)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('117.3333333');
            helper.edit('J18', '=AVERAGE(I21,G2,A8:A11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('0.5');
            helper.edit('J19', '=AVERAGE(E7,I11,E10,C6,A10)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('AVERAGE Formula with different format arguments as input in General formatted cells ->', (done: Function) => {
            helper.edit('K1', '=AVERAGE(E2:E11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('17.5');
            helper.edit('K2', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1.4500E+01');
            helper.edit('K3', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('$65.78');
            helper.edit('K4', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('5850%');
            helper.edit('K5', '=AVERAGE(I2:I10)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('431.6549322');
            done();
        });
        it('AVERAGE Formula with different format arguments as input in Currency formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'K6']);
            helper.edit('K6', '=AVERAGE(E2:E11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('$17.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K7']);
            helper.edit('K7', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('$14.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K8']);
            helper.edit('K8', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('$65.78');
            helper.invoke('numberFormat', ['$#,##0.00', 'K9']);
            helper.edit('K9', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('$58.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K10']);
            helper.edit('K10', '=AVERAGE(I2:I10)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('$431.65');
            done();
        });
        it('AVERAGE Formula with different format arguments as input in Percentage formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0%', 'K11']);
            helper.edit('K11', '=AVERAGE(E2:E11)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('1750%');
            helper.invoke('numberFormat', ['0%', 'K12']);
            helper.edit('K12', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('1.4500E+01');
            helper.invoke('numberFormat', ['0%', 'K13']);
            helper.edit('K13', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('$65.78');
            helper.invoke('numberFormat', ['0%', 'K14']);
            helper.edit('K14', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('5850%');
            helper.invoke('numberFormat', ['0%', 'K15']);
            helper.edit('K15', '=AVERAGE(I2:I10)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('43165%');
            done();
        });
        it('AVERAGE Formula with different format arguments as input in Scientific formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0.0000E+00', 'K16']);
            helper.edit('K16', '=AVERAGE(E2:E11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('1.7500E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K17']);
            helper.edit('K17', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('1.4500E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K18']);
            helper.edit('K18', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('$65.78');
            helper.invoke('numberFormat', ['0.0000E+00', 'K19']);
            helper.edit('K19', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('5850%');
            helper.invoke('numberFormat', ['0.0000E+00', 'K20']);
            helper.edit('K20', '=AVERAGE(I2:I10)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('4.3165E+02');
            done();
        });
        it('AVERAGE Formula with different format arguments as input in Number formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['#,##0.00', 'K21']);
            helper.edit('K21', '=AVERAGE(E2:E11)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('17.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K22']);
            helper.edit('K22', '=AVERAGE(I26:I27)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('14.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K23']);
            helper.edit('K23', '=AVERAGE(I24:I25)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('65.78');
            helper.invoke('numberFormat', ['#,##0.00', 'K24']);
            helper.edit('K24', '=AVERAGE(I28:I29)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('58.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K25']);
            helper.edit('K25', '=AVERAGE(I2:I10)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('431.65');
            done();
        });
        it('AVERAGE Formula with list of different arguments as input->', (done: Function) => {
            helper.edit('L1', '=AVERAGE(D2:D11,E7,G7,42,"2")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('25.28571429');
            helper.edit('L2', '=AVERAGE(D2:D11,E11,G2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('24');
            helper.edit('L3', '=AVERAGE(1,3,4,"a")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#VALUE!');
            helper.edit('L4', '=AVERAGE("1","323",F9:F10,"Hi123","123Hi","H123i")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            helper.edit('L5', '=AVERAGE("HI123",123,"123HI")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            helper.edit('L6', '=AVERAGE("1")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('1');
            done();
        });
        it('AVERAGE Formula with logical value as argument->', (done: Function) => {
            helper.edit('L7', '=AVERAGE(1,3,"43",TRUE)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('12');
            helper.edit('L8', '=AVERAGE(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('11');
            helper.edit('L9', '=AVERAGE(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('11');
            helper.edit('L10', '=AVERAGE(TRUE,FALSE)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('0.5');
            helper.edit('L11', '=AVERAGE("1",TRUE,FALSE,4)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('1.5');
            helper.edit('L12', '=AVERAGE("TRUE","FALSE")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=AVERAGE(I15:I18)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L14', '=AVERAGE(I15,I17,I16,I18)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L15', '=AVERAGE(FALSE)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('0');
            done();
        });
        it('AVERAGE Formula with nested formula as input->', (done: Function) => {
            helper.edit('L16', '=AVERAGE(LEN(D10),LEN(D8),LEN(E10))');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('2');
            helper.edit('L17', '=AVERAGE(GEOMEAN(G2:G6),GEOMEAN(H3:H7))');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('29.10251425');
            helper.edit('L18', '=AVERAGE(COUNT(F16:F20),10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('5');
            done();
        });
        it('AVERAGE Formula with worst case value as argument->', (done: Function) => {
            helper.edit('M1', '=AVERAGE(A2:A11)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#DIV/0!');
            helper.edit('M2', '=AVERAGE(I12,G10)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NAME?');
            helper.edit('M3', '=AVERAGE(,)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('0');
            helper.edit('M4', '=AVERAGE(1,3, ,0)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('1');
            helper.edit('M5', '=AVERAGE(0)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('0');
            helper.edit('M6', '=AVERAGE(1,2,"")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            helper.edit('M7', '=AVERAGE(I11)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            helper.edit('M8', '=AVERAGE(I12)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#NAME?');
            helper.edit('M9', '=AVERAGE("Hello")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#VALUE!');
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('M10');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M10', '=AVERAGE(0)');
            done();
        });
        it('AVERAGE Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=AVERAGE($F$2:$F$20)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('472');
            helper.edit('N2', '=AVERAGE($I$4:$I$7,$F$4:$F$7)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('606.4051125');
            helper.edit('N3', '=AVERAGE($I$3:$I$9,$H$8)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('461.6563975');
            done();
        });
        it('AVERAGE Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N4', '=AVERAGE(Sheet2!A1:A10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('44.5');
            helper.edit('N5', '=AVERAGE(Sheet2!A1:A10,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('282');
            helper.edit('N6', '=AVERAGE(Sheet1!D1:D10,Sheet2!A2:A11)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('35.6875');
            helper.edit('N7', '=AVERAGE(Sheet1!E2:E11,Sheet1!H2:H11)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('36.45');
            helper.edit('N8', '=AVERAGE(Sheet2!A5,Sheet2!A2)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('56.5');
            helper.edit('N9', '=AVERAGE(Sheet1!D5,Sheet1!E2)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('17.5');
            helper.edit('N10', '=AVERAGE(Sheet1!D5,Sheet2!A3)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('45.5');
            helper.edit('N11', '=AVERAGE(Sheet2!A5,Sheet1!E3)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('61.5');
            done();
        });
        it('AVERAGE Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N12', '=AVERAGE(Sheet2!$A$1:$A$6,Sheet2!$C$3:$C$10,Sheet2!$B$12,$D$6)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('42.28571429');
            helper.edit('N13', '=AVERAGE(Sheet2!$A$1:$A$10,Sheet1!$F$2:$F$11)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('282');
            helper.edit('N14', '=AVERAGE(Sheet1!$E$2:$E$11,Sheet1!$H$2:$H$11)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('36.45');
            helper.edit('N15', '=AVERAGE(Sheet1!$E$2:$E$11)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('17.5');
            helper.edit('N16', '=AVERAGE(Sheet2!$A$7)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('40');
            helper.edit('N17', '=AVERAGE(Sheet2!$A$5,Sheet1!$E$2)');
            expect(helper.invoke('getCell', [16, 13]).textContent).toBe('56.5');
            done();
        });
    });

    describe('AVERAGEIF Formula Checking ->', () => {
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
        it('AVERAGEIF formula with argument having whole column range->', (done: Function) => {
            helper.edit('J1', '=AVERAGEIF(H1:H100,">10")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('60.44444444');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toEqual('=AVERAGEIF(H1:H100,">10")');
            done();
        });
        it('AVERAGEIF formula with argument having with criteria value length > 255->', (done: Function) => {
            helper.edit('J2', '=AVERAGEIF(H2:H5,">123456789090123456789012345678789012345678799999877654544121233456775345654323456543234565432345654345699012346587909098765432123456789876543234567876888889999998889999999987654345678987654323456789098765432345678909876543345678987654323456789876543456785")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toEqual('=AVERAGEIF(H2:H5,">123456789090123456789012345678789012345678799999877654544121233456775345654323456543234565432345654345699012346587909098765432123456789876543234567876888889999998889999999987654345678987654323456789098765432345678909876543345678987654323456789876543456785")');
            done();
        });
        it('AVERAGEIF Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J3', '=AVERAGEIF(D2:D11,"<25")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('17');
            helper.edit('J4', '=AVERAGEIF(D2:D11,">35")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('43.66666667');
            helper.edit('J5', '=AVERAGEIF(D2:D11,"<="&E2,G2:G11)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('5.4');
            helper.edit('J6', '=AVERAGEIF(D2:D11,">="&E2,G2:G11)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('8.125');
            helper.edit('J7', '=AVERAGEIF(F2:F9,"<>300")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('422');
            helper.edit('J8', '=AVERAGEIF(E2:E10,D4)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('20');
            done();
        });
        it('AVERAGEIF Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('J9', '=AVERAGEIF(D2:D11,"2*",G2:G11)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J10', '=AVERAGEIF(D2:D11,"0*",G2:G11)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J11', '=AVERAGEIF(A2:A11,"C*",E2:E11)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('25');
            helper.edit('J12', '=AVERAGEIF(A2:A11,"*es",E2:E11)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('21');
            helper.edit('J13', '=AVERAGEIF(A2:A11,"s*ers",E2:E11)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('20');
            done();
        });
        it('AVERAGEIF Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('J14', '=AVERAGEIF(D2:D11,"?0",G2:G11)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J15', '=AVERAGEIF(D2:D11,"1?",G2:G11)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J16', '=AVERAGEIF(A2:A11,"???????Shoes",E2:E11)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('21.66666667');
            helper.edit('J17', '=AVERAGEIF(A2:A11,"???????",E2:E11)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('10');
            helper.edit('J18', '=AVERAGEIF(A2:A11,"<>????????",E2:E11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('18.125');
            done();
        });
        it('AVERAGEIF Formula with different kind of value as criteria ->', (done: Function) => {
            helper.edit('K1', '=AVERAGEIF(G2:G10,11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('11');
            helper.edit('K2', '=AVERAGEIF(D2:D10,"20")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('20');
            helper.edit('K3', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('10');
            helper.edit('K4', '=AVERAGEIF(E2:E11,"<>"&G6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('22.5');
            helper.edit('K5', '=AVERAGEIF(A2:A11,"*"&A2,E2:E11)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('20');
            helper.edit('K6', '=AVERAGEIF(A2:A11,A11&"*",D2:D11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('50');
            helper.edit('K7', '=AVERAGEIF(A2:A11,"Casual Shoes",F2:F11)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('200');
            done();
        });
        it('AVERAGEIF Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('K8', '=AVERAGEIF(H2:H11,">"&G6+13)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('66.25');
            helper.edit('K9', '=AVERAGEIF(H2:H10,F5-134,E2:E11)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('30');
            done();
        });
        it('Add 2 AVERAGEIF Formulas->', (done: Function) => {
            helper.edit('K10', '=(AVERAGEIF(D2:D11,">30")+AVERAGEIF(D2:D11,"<30"))');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('57.5');
            done();
        });
        it('AVERAGEIF Formula with worst case value as argument->', (done: Function) => {
            helper.edit('K11', '=AVERAGEIF(E2:E9,)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K12', '=AVERAGEIF(O2:O6,)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('#DIV/0!');
            done();
        });
        it('AVERAGEIF Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('K13', '=AVERAGEIF(A2:A11,"*",G2:G11)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('7.7');
            helper.edit('K14', '=AVERAGEIF(E2:E11,"*",G2:G11)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K15', '=AVERAGEIF(P2:P11,"*",G2:G11)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K16', '=AVERAGEIF(A2:A11,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K17', '=AVERAGEIF(D2:D1,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('5');
            helper.edit('K18', '=AVERAGEIF(P2:P11,"<>*",G2:G11)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('7.7');
            done();
        });
        it('AVERAGEIF Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('L1', '=AVERAGEIF(I6:I8,"<0")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('-1672');
            helper.edit('L2', '=AVERAGEIF(I15:I16,I16)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('12.76');
            helper.edit('L3', '=AVERAGEIF(I17:I18,">=12")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('14.5');
            helper.edit('L4', '=AVERAGEIF(I19:I20,115)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('115');
            helper.edit('L5', '=AVERAGEIF(I2:I20,">"&E2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('96.25');
            done();
        });
        it('AVERAGEIF Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('L6', '=AVERAGEIF(I2:I5,"TRUE",G2:G5)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('3');
            helper.edit('L7', '=AVERAGEIF(I2:I5,"FALSE",G2:G5)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('9');
            helper.edit('L8', '=AVERAGEIF(I2:I5,TRUE,G2:G5)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('3');
            helper.edit('L9', '=AVERAGEIF(I2:I5,FALSE,G2:G5)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('9');
            helper.edit('L10', '=AVERAGEIF(I2:I3,I2,G2:G5)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('3');
            helper.edit('L11', '=AVERAGEIF(I2:I5,I4,G2:G5)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('9');
            done();
        });
        it('AVERAGEIF Formula with nested Formula as criteria->', (done: Function) => {
            helper.edit('L12', '=AVERAGEIF(E2:E11,SUM(D3),F2:F11)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('433.3333333');
            helper.edit('L13', '=AVERAGEIF(G2:G11,COUNT(E2:E11),H2:H11)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('70');
            helper.edit('L14', '=AVERAGEIF(F2:F11,">"LEN(E2:E11),H2:H11)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('55.4');
            done();
        });
        it('AVERAGEIF Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=AVERAGEIF($E$2:$E$11,"<15")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('10');
            helper.edit('M2', '=AVERAGEIF($A$2:$A$11,"T-Shirts",$D$2:$D$11)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('50');
            helper.edit('M3', '=AVERAGEIF($H$2:$H$11,">="&$G$3)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('55.4');
            helper.edit('M4', '=AVERAGEIF($D$3:$D$10,">"&$E$5,$H$3:$H$10)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('82.75');
            helper.edit('M5', '=AVERAGEIF(D2:D10,$E$6,H2:H10)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('10');
            helper.edit('M6', '=AVERAGEIF(D2:D10,E6,$H$2:$H$10)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('10');
            done();
        });
        it('AVERAGEIF Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M7', '=AVERAGEIF(Sheet2!A1:A8,Sheet2!A1)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('2');
            helper.edit('M8', '=AVERAGEIF(Sheet2!A1:A10,"<10")');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('2.75');
            helper.edit('M9', '=AVERAGEIF(G2:G11,">="&Sheet2!A5)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('8.444444444');
            helper.edit('M10', '=AVERAGEIF(Sheet2!A1:A8,">="&Sheet1!G6)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('31.25');
            helper.edit('M11', '=AVERAGEIF(Sheet1!G2:G11,Sheet2!A5)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('3');
            helper.edit('M12', '=AVERAGEIF(Sheet1!E2:E11,">"&Sheet1!E6)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('22.5');
            done();
        });
        it('AVERAGEIF Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M13', '=AVERAGEIF(Sheet2!$A$1:$A$9,Sheet2!$A$2)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('20');
            helper.edit('M14', '=AVERAGEIF(Sheet2!$A$1:$A$10,"<10")');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('2.75');
            helper.edit('M15', '=AVERAGEIF(G2:G11,">="&Sheet2!$A$3)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('9.714285714');
            helper.edit('M16', '=AVERAGEIF(Sheet1!F3:F10,">"&Sheet1!F5,Sheet1!D3:D10)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('33');
            helper.edit('M17', '=AVERAGEIF(Sheet1!D3:D8,">"&Sheet2!A2,Sheet1!H3:H8)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('68');
            helper.edit('M18', '=AVERAGEIF(Sheet2!$A$1:$A$8,">="&Sheet1!$G$6)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('31.25');
            helper.edit('M19', '=AVERAGEIF(Sheet1!$E$2:$E$11,">"&Sheet1!$E$5)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('30');
            done();
        });
        it('AVERAGEIF formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('M20', '=AVERAGEIF(Sheet2!A8:A9,"q1",Sheet1!G5:G6)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('11');
            helper.edit('M21', '=AVERAGEIF(Sheet2!A8:A9,"Q2",Sheet1!G5:G6)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('10');
            done();
        });
        it('AVERAGEIF formula with invalid arguments shows error dialog cases ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIF()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIF()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('10');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIF(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIF(,)';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('10');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIF(,"*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIF(,"*e")';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N3', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('');
            spreadsheet.selectRange('N4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIF(AWFE,20)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIF(AWFE,20)';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N4', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('');
            spreadsheet.selectRange('N5');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIF("A3","*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIF("A3","*e")';
            helper.triggerKeyNativeEvent(13);
            expect(dialog.textContent).toBe('We found that you typed a formula which is improper.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N5', '=AVERAGEIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('');
            done();
        });
    });

    describe('AVERAGEA Formula Checking ->', () => {
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
        it('AVERAGEA Formula with ranged cell references values as arguments->', (done: Function) => {
            helper.edit('J1', '=AVERAGEA(A2:A10)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            helper.edit('J2', '=AVERAGEA(B3:B10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('41842.875');
            helper.edit('J3', '=AVERAGEA(C3:C8)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0.217314815');
            helper.edit('J4', '=AVERAGEA(D2:D11)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('27.7');
            helper.edit('J5', '=AVERAGEA(I2:I6)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('467.30684');
            helper.edit('J6', '=AVERAGEA(I6:I10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('514.336418');
            helper.edit('J7', '=AVERAGEA(I19:I21)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-1491.333333');
            helper.edit('J8', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('65.78');
            helper.edit('J9', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('14.5');
            helper.edit('J10', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('58.5');
            helper.edit('J11', '=AVERAGEA(I13:I16)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0.5');
            helper.edit('J12', '=AVERAGEA(I13:I29)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('-220.8494118');
            done();
        });
        it('AVERAGEA Formula with single cell references values as arguments->', (done: Function) => {
            helper.edit('J13', '=AVERAGEA(I21)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('0');
            helper.edit('J14', '=AVERAGEA(F3)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('600');
            helper.edit('J15', '=AVERAGEA(C13)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#DIV/0!');
            helper.edit('J16', '=AVERAGEA(D3,E7,I4,I20,F9)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('-159.954');
            helper.edit('J17', '=AVERAGEA(A6:A8,D7,F6,G10)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('58.66666667');
            helper.edit('J18', '=AVERAGEA(I21,G2,A8:A11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('0.166666667');
            helper.edit('J19', '=AVERAGEA(E7,I11,E10,C6,A10)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('AVERAGEA Formula with different format arguments as input in General formatted cells ->', (done: Function) => {
            helper.edit('K1', '=AVERAGEA(E2:E11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('17.5');
            helper.edit('K2', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('14.5');
            helper.edit('K3', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('65.78');
            helper.edit('K4', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('58.5');
            helper.edit('K5', '=AVERAGEA(I2:I10)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('431.6549322');
            done();
        });
        it('AVERAGEA Formula with different format arguments as input in Currency formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['$#,##0.00', 'K6']);
            helper.edit('K6', '=AVERAGEA(E2:E11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('$17.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K7']);
            helper.edit('K7', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('$14.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K8']);
            helper.edit('K8', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('$65.78');
            helper.invoke('numberFormat', ['$#,##0.00', 'K9']);
            helper.edit('K9', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('$58.50');
            helper.invoke('numberFormat', ['$#,##0.00', 'K10']);
            helper.edit('K10', '=AVERAGEA(I2:I10)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('$431.65');
            done();
        });
        it('AVERAGEA Formula with different format arguments as input in Percentage formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0%', 'K11']);
            helper.edit('K11', '=AVERAGEA(E2:E11)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('1750%');
            helper.invoke('numberFormat', ['0%', 'K12']);
            helper.edit('K12', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('1450%');
            helper.invoke('numberFormat', ['0%', 'K13']);
            helper.edit('K13', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('6578%');
            helper.invoke('numberFormat', ['0%', 'K14']);
            helper.edit('K14', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('5850%');
            helper.invoke('numberFormat', ['0%', 'K15']);
            helper.edit('K15', '=AVERAGEA(I2:I10)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('43165%');
            done();
        });
        it('AVERAGEA Formula with different format arguments as input in Scientific formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['0.0000E+00', 'K16']);
            helper.edit('K16', '=AVERAGEA(E2:E11)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('1.7500E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K17']);
            helper.edit('K17', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('1.4500E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K18']);
            helper.edit('K18', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('6.5780E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K19']);
            helper.edit('K19', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('5.8500E+01');
            helper.invoke('numberFormat', ['0.0000E+00', 'K20']);
            helper.edit('K20', '=AVERAGEA(I2:I10)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('4.3165E+02');
            done();
        });
        it('AVERAGEA Formula with different format arguments as input in Number formatted cells ->', (done: Function) => {
            helper.invoke('numberFormat', ['#,##0.00', 'K21']);
            helper.edit('K21', '=AVERAGEA(E2:E11)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('17.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K22']);
            helper.edit('K22', '=AVERAGEA(I26:I27)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('14.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K23']);
            helper.edit('K23', '=AVERAGEA(I24:I25)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('65.78');
            helper.invoke('numberFormat', ['#,##0.00', 'K24']);
            helper.edit('K24', '=AVERAGEA(I28:I29)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('58.50');
            helper.invoke('numberFormat', ['#,##0.00', 'K25']);
            helper.edit('K25', '=AVERAGEA(I2:I10)');
            expect(helper.invoke('getCell', [24, 10]).textContent).toBe('431.65');
            done();
        });
        it('AVERAGEA Formula with list of different arguments as input->', (done: Function) => {
            helper.edit('L1', '=AVERAGEA(D2:D11,E7,G7,42,"2")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('25.28571429');
            helper.edit('L2', '=AVERAGEA(D2:D11,E11,G2)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('24');
            helper.edit('L3', '=AVERAGEA(1,3,4,"a")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#VALUE!');
            helper.edit('L4', '=AVERAGEA("1","323",F9:F10,"Hi123","123Hi","H123i")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            helper.edit('L5', '=AVERAGEA("HI123",123,"123HI")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            helper.edit('L6', '=AVERAGEA("1")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('1');
            done();
        });
        it('AVERAGEA Formula with logical value as argument->', (done: Function) => {
            helper.edit('L7', '=AVERAGEA(1,3,"43",TRUE)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('12');
            helper.edit('L8', '=AVERAGEA(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('11');
            helper.edit('L9', '=AVERAGEA(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('11');
            helper.edit('L10', '=AVERAGEA(TRUE,FALSE)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('0.5');
            helper.edit('L11', '=AVERAGEA("1",TRUE,FALSE,4)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('1.5');
            helper.edit('L12', '=AVERAGEA("TRUE","FALSE")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=AVERAGEA(I15:I18)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('0.5');
            helper.edit('L14', '=AVERAGEA(I15,I17,I16,I18)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0.5');
            helper.edit('L15', '=AVERAGEA(FALSE)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('0');
            done();
        });
        it('AVERAGEA Formula with nested formula as input->', (done: Function) => {
            helper.edit('L16', '=AVERAGEA(LEN(D10),LEN(D8),LEN(E10))');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('2');
            helper.edit('L17', '=AVERAGEA(GEOMEAN(G2:G6),GEOMEAN(H3:H7))');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('29.10251425');
            helper.edit('L18', '=AVERAGEA(COUNT(F16:F20),10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('5');
            done();
        });
        it('AVERAGEA Formula with worst case value as argument->', (done: Function) => {
            helper.edit('M1', '=AVERAGEA(A2:A11)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('0');
            helper.edit('M2', '=AVERAGEA(I12,G10)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NAME?');
            helper.edit('M3', '=AVERAGEA(,)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('0');
            helper.edit('M4', '=AVERAGEA(1,3, ,0)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('1');
            helper.edit('M5', '=AVERAGEA(0)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('0');
            helper.edit('M6', '=AVERAGEA(1,2,"")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            helper.edit('M7', '=AVERAGEA(I11)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            helper.edit('M8', '=AVERAGEA(I12)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#NAME?');
            helper.edit('M9', '=AVERAGEA("Hello")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#VALUE!');
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('M10');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEA()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEA()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M10', '=AVERAGEA(0)');
            done();
        });
        it('AVERAGEA Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=AVERAGEA($F$2:$F$20)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('472');
            helper.edit('N2', '=AVERAGEA($I$4:$I$7,$F$4:$F$7)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('606.4051125');
            helper.edit('N3', '=AVERAGEA($I$3:$I$9,$H$8)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('461.6563975');
            done();
        });
        it('AVERAGEA Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N4', '=AVERAGEA(Sheet2!A1:A11)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('39.55555556');
            helper.edit('N5', '=AVERAGEA(Sheet2!A1:A10,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('267.1578947');
            helper.edit('N6', '=AVERAGEA(Sheet1!D1:D10,Sheet2!A2:A11)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('31.72222222');
            helper.edit('N7', '=AVERAGEA(Sheet1!E2:E11,Sheet1!H2:H11)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('36.45');
            helper.edit('N8', '=AVERAGEA(Sheet2!A5,Sheet2!A2)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('56.5');
            helper.edit('N9', '=AVERAGEA(Sheet1!D5,Sheet1!E2)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('17.5');
            helper.edit('N10', '=AVERAGEA(Sheet1!D5,Sheet2!A3)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('45.5');
            helper.edit('N11', '=AVERAGEA(Sheet2!A5,Sheet1!E3)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('61.5');
            done();
        });
        it('AVERAGEA Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N12', '=AVERAGEA(Sheet2!$A$1:$A$6,Sheet2!$C$3:$C$10,Sheet2!$B$12,$D$6)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('42.28571429');
            helper.edit('N13', '=AVERAGEA(Sheet2!$A$1:$A$10,Sheet1!$F$2:$F$11)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('267.1578947');
            helper.edit('N14', '=AVERAGEA(Sheet1!$E$2:$E$11,Sheet1!$H$2:$H$11)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('36.45');
            helper.edit('N15', '=AVERAGEA(Sheet1!$E$2:$E$11)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('17.5');
            helper.edit('N16', '=AVERAGEA(Sheet2!$A$7)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('40');
            helper.edit('N17', '=AVERAGEA(Sheet2!$A$5,Sheet1!$E$2)');
            expect(helper.invoke('getCell', [16, 13]).textContent).toBe('56.5');
            done();
        });
    });

    describe('AVERAGEIFS Formula Checking ->', () => {
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
        it('AVERAGEIFS formula->', (done: Function) => {
            helper.edit('J1', '=AVERAGEIFS(H2:H5,E2:E5,">10")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('38.5');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toEqual('=AVERAGEIFS(H2:H5,E2:E5,">10")');
            done();
        });
        it('AVERAGEIFS formula with no argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS()';
            helper.triggerKeyNativeEvent(13);
            const dialog5: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog5.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J2', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            done();
        });
        it('AVERAGEIFS formula with criteria value as *->', (done: Function) => {
            helper.edit('J3', '=AVERAGEIFS(H2:H5,H2:H5,"*")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toEqual('=AVERAGEIFS(H2:H5,H2:H5,"*")');
            done();
        });
        it('AVERAGEIFS formula with criteria value as ?->', (done: Function) => {
            helper.edit('J4', '=AVERAGEIFS(H2:H5,H2:H5,"?")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toEqual('=AVERAGEIFS(H2:H5,H2:H5,"?")');
            done();
        });
        it('AVERAGEIFS formula with criteria value as ? And numbers->', (done: Function) => {
            helper.edit('J5', '=AVERAGEIFS(H2:H5,H2:H5,"1?1")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toEqual('=AVERAGEIFS(H2:H5,H2:H5,"1?1")');
            done();
        });
        it('AVERAGEIFS formula with criteria value as ? And numbers - II->', (done: Function) => {
            helper.edit('J6', '=AVERAGEIFS(H2:H5,H2:H5,"11?1")');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#DIV/0!');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toEqual('=AVERAGEIFS(H2:H5,H2:H5,"11?1")');
            done();
        });
        it('AVERAGEIFS Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J7', '=AVERAGEIFS(D2:D11,E2:E11,"<"30,F2:F11,"<"300)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('15');
            helper.edit('J8', '=AVERAGEIFS(D2:D11,E2:E11,">"20,F2:F11,">"300)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('30.5');
            helper.edit('J9', '=AVERAGEIFS(D2:D11,E2:E11,"<="30,F2:F11,"<="300)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('19');
            helper.edit('J10', '=AVERAGEIFS(D2:D11,E2:E11,">="20,F2:F11,">="300)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('29');
            helper.edit('J11', '=AVERAGEIFS(D2:D11,E2:E11,"<>20",F2:F11,"<>200")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('32');
            helper.edit('J12', '=AVERAGEIFS(D2:D11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('10');
            helper.edit('J13', '=AVERAGEIFS(D2:D11,E2:E11,"<"15,F2:F11,">"250)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('37');
            helper.edit('J14', '=AVERAGEIFS(D2:D11,E2:E11,">"&D8,F2:F11,">"&F2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('30.5');
            helper.edit('J15', '=AVERAGEIFS(D2:D11,E2:E11,"<>"&D8,F2:F11,"<>200")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('32');
            helper.edit('J16', '=AVERAGEIFS(F2:F11,D2:D11,"=20",E2:E11,"=30")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('600');
            done();
        });
        it('AVERAGEIFS Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('K1', '=AVERAGEIFS(D2:D11,F2:F11,"*2")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K2', '=AVERAGEIFS(D2:D11,F2:F11,"0*")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K3', '=AVERAGEIFS(D2:D11,A2:A11,"C*")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('25.5');
            helper.edit('K4', '=AVERAGEIFS(D2:D11,A2:A11,"*ES")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('22.2');
            helper.edit('K5', '=AVERAGEIFS(D2:D11,A2:A11,"s*es")');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('20');
            done();
        });
        it('AVERAGEIFS Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('K6', '=AVERAGEIFS(D2:D11,F2:F11,"2??")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K7', '=AVERAGEIFS(D2:D11,E2:E11,"1?")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K8', '=AVERAGEIFS(E2:E3,A2:A3,"???????Shoes")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('25');
            helper.edit('K9', '=AVERAGEIFS(E2:E10,A2:A10,"???????")');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('10');
            helper.edit('K10', '=AVERAGEIFS(E2:E10,A2:A10,"<>???????")');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('19.375');
            done();
        });
        it('AVERAGEIFS Formula with different kind of value as criteria ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('K11', '=AVERAGEIFS(D2:D11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('10');
            helper.edit('K12', '=AVERAGEIFS(D2:D11,E2:E11,">20",F2:F11,">200")');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('30.5');
            helper.edit('K13', '=AVERAGEIFS(D2:D11,E2:E11,E2,F2:F11,F2)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('10');
            helper.edit('K14', '=AVERAGEIFS(D2:D11,E2:E11,"<>"&D8,F2:F11,"<>"&F2)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('32');
            spreadsheet.selectRange('K15');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(E2:E11,"*"&E6,D2:D11,30)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(E2:E11,"*"&E6,D2:D11,30)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K15', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            spreadsheet.selectRange('K16');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(E2:E11,E6&"*",D2:D11,30)';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K16', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            helper.edit('K17', '=AVERAGEIFS(D2:D11,A2:A11,"Casual Shoes",E2:E11,20)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('10');
            done();
        });
        it('AVERAGEIFS Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('L1', '=AVERAGEIFS(E2:E11,H2:H11,">"&G6+13,F2:F11,">"&D7+100)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('18.125');
            helper.edit('L2', '=AVERAGEIFS(E2:E11,F2:F11,">"&H10-66)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('17.5');
            done();
        });
        it('AVERAGEIFS Formula with worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('L3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            spreadsheet.selectRange('L3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(G2:G9,H2:H9,">5")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(G2:G9,H2:H9,">5")';
            helper.triggerKeyNativeEvent(13);
            helper.edit('L4', '=AVERAGEIFS(,D2:D10,"*e")');
            spreadsheet.selectRange('L4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(,D2:D10,"*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(,D2:D10,"*e")';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L4', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            helper.edit('L5', '=AVERAGEIFS(E2:E9,F2:F9,)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#DIV/0!');
            spreadsheet.selectRange('L6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS(A2:A11,,H4:H9,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS(A2:A11,,H4:H9,)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L6', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            helper.edit('L7', '=AVERAGEIFS(E4:E11,A3:A11,"",D4:D11,"=20")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('#VALUE!');
            helper.edit('L8', '=AVERAGEIFS(E3:E11,F3:F11,"300",H3:H13,">50")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            spreadsheet.selectRange('L9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=AVERAGEIFS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=AVERAGEIFS()';
            helper.triggerKeyNativeEvent(13);
            const dialog3: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog3.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L9', '=AVERAGEIFS(G2:G9,H2:H9,">5")');
            done();
        });
        it('AVERAGEIFS Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('L10', '=AVERAGEIFS(D2:D11,A2:A11,"*")');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('27.7');
            helper.edit('L11', '=AVERAGEIFS(D2:D11,E2:E11,"*")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L12', '=AVERAGEIFS(D2:D11,P2:P11,"*")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L13', '=AVERAGEIFS(D2:D11,A2:A11,"<>*")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L14', '=AVERAGEIFS(D2:D11,E2:E11,"<>*")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('27.7');
            helper.edit('L15', '=AVERAGEIFS(D2:D11,P2:P11,"<>*")');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('27.7');
            helper.edit('L16', '=AVERAGEIFS(A2:A11,D2:D11,)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L17', '=AVERAGEIFS(A2:A11,D2:D11," ")');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#DIV/0!');
            done();
        });
        it('AVERAGEIFS Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('M1', '=AVERAGEIFS(I6:I8,F5:F7,"300")');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('-1672');
            helper.edit('M2', '=AVERAGEIFS(I15:I16,F5:F6,"300")');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('65.88');
            helper.edit('M3', '=AVERAGEIFS(F5:F6,I15:I16,"<150")');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('300');
            helper.edit('M4', '=AVERAGEIFS(I17:I18,F5:F6,300)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('14.5');
            helper.edit('M5', '=AVERAGEIFS(F5:F6,I17:I18,">10")');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('300');
            helper.edit('M6', '=AVERAGEIFS(I19:I20,F8:F9,"200")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('2');
            helper.edit('M7', '=AVERAGEIFS(F8:F9,I19:I20,">=2")');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('255');
            done();
        });
        it('AVERAGEIFS Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('M8', '=AVERAGEIFS(D2:D5,I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('15');
            helper.edit('M9', '=AVERAGEIFS(D2:D5,I2:I5,"FALSE")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('17.5');
            helper.edit('M10', '=AVERAGEIFS(D2:D5,I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('15');
            helper.edit('M11', '=AVERAGEIFS(D2:D5,I2:I5,"FALSE")');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('17.5');
            helper.edit('M12', '=AVERAGEIFS(F2:F5,I2:I5,I3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('400');
            helper.edit('M13', '=AVERAGEIFS(F2:F5,I2:I5,I4)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('300');
            done();
        });
        it('AVERAGEIFS Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=AVERAGEIFS($D$2:$D$11,E2:E11,20,F2:F11,200)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('10');
            helper.edit('N2', '=AVERAGEIFS(D2:D11,$E$2:$E$11,">20",$F$2:$F$11,">200")');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('30.5');
            helper.edit('N3', '=AVERAGEIFS(D2:D11,E2:E11,">"&$E$4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('25.2');
            helper.edit('N4', '=AVERAGEIFS($F$2:$F$11,$D$2:$D$11,">"&$D$5,$E$2:$E$11,"<"&$E$5)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('322');
            done();
        });
        it('AVERAGEIFS Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=AVERAGEIFS(Sheet2!A1:A10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('27.5');
            helper.edit('N6', '=AVERAGEIFS(Sheet1!E1:E10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('16');
            helper.edit('N7', '=AVERAGEIFS(D2:D9,Sheet2!A2:A9,">"&20)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('28.2');
            helper.edit('N8', '=AVERAGEIFS(Sheet1!D2:D11,Sheet1!E2:E11,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('27.7');
            helper.edit('N9', '=AVERAGEIFS(Sheet2!A2:A6,Sheet1!E2:E6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('18.8');
            helper.edit('N10', '=AVERAGEIFS(Sheet1!D2:D6,Sheet2!A2:A6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('20');
            helper.edit('N11', '=AVERAGEIFS(Sheet2!A2:A6,Sheet2!A2:A6,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('28.33333333');
            helper.edit('N12', '=AVERAGEIFS(Sheet2!A2:A6,Sheet2!A2:A6,">="&Sheet1!G9)');
            expect(helper.invoke('getCell', [11, 13]).textContent).toBe('22.75');
            done();
        });
        it('AVERAGEIFS Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N13', '=AVERAGEIFS(Sheet2!$A$1:$A$10,F2:F11,">"&F5,G2:G11,"<"&D5)');
            expect(helper.invoke('getCell', [12, 13]).textContent).toBe('27.5');
            helper.edit('N14', '=AVERAGEIFS(Sheet2!A1:A10,$F$2:$F$11,">"&F5,$G$2:$G$11,"<"&D2)');
            expect(helper.invoke('getCell', [13, 13]).textContent).toBe('20');
            helper.edit('N15', '=AVERAGEIFS(Sheet2!A1:A10,F2:F11,">"&$F$5,G2:G11,"<"&$D$2)');
            expect(helper.invoke('getCell', [14, 13]).textContent).toBe('20');
            helper.edit('N16', '=AVERAGEIFS(Sheet1!$D$2:$D$6,Sheet2!$A$2:$A$6,">"&Sheet1!$G$4)');
            expect(helper.invoke('getCell', [15, 13]).textContent).toBe('20');
            helper.edit('N17', '=AVERAGEIFS(Sheet1!D2:D11,Sheet1!E2:E11,">"&Sheet1!G4)');
            expect(helper.invoke('getCell', [16, 13]).textContent).toBe('27.7');
            helper.edit('N18', '=AVERAGEIFS(Sheet1!$D$2:$D$11,Sheet1!$E$2:$E$11,">"&Sheet1!$G$4)');
            expect(helper.invoke('getCell', [17, 13]).textContent).toBe('27.7');
            helper.edit('N19', '=AVERAGEIFS(D2:D8,Sheet2!$A$1:$A$7,">"20)');
            expect(helper.invoke('getCell', [18, 13]).textContent).toBe('25');
            helper.edit('N20', '=AVERAGEIFS(Sheet1!$D$2:$D$8,Sheet2!$A$1:$A$7,">"$G$5)');
            expect(helper.invoke('getCell', [19, 13]).textContent).toBe('23.75');
            done();
        });
        it('AVERAGEIFS Formula with nested formula as arguments ->', (done: Function) => {
            helper.edit('O1', '=AVERAGEIFS(D2:D11,E2:E11,SUM(10)+10)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('21.66666667');
            helper.edit('O2', '=AVERAGEIFS(D2:D11,E2:E11,COUNT(G2:H11))');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('21.66666667');
            helper.edit('O3', '=AVERAGEIFS(H2:H11,E2:E11,LEN(D4)+18)');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('47.66666667');
            helper.edit('O4', '=AVERAGEIFS(D2:D11,A2:A11,"<>"EXACT(A2))');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('27.7');
            helper.edit('O5', '=AVERAGEIFS(F2:F11,E2:E11,SUM(D2,H2),A2:A11,"<>"PROPER(A3))');
            expect(helper.invoke('getCell', [4, 14]).textContent).toBe('433.3333333');
            done();
        });
        it('AVERAGEIFS formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('O6', '=AVERAGEIFS(Sheet1!G5:G6,Sheet2!A8:A9,"q1")');
            expect(helper.invoke('getCell', [5, 14]).textContent).toBe('11');
            helper.edit('O7', '=AVERAGEIFS(Sheet1!G5:G6,Sheet2!A8:A9,"Q2")');
            expect(helper.invoke('getCell', [6, 14]).textContent).toBe('10');
            done();
        });
    });

    describe('COUNT Formula Checking ->', () => {
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
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('COUNT Formula with ranged cell references values as arguments->', (done: Function) => {
            helper.edit('J1', '=COUNT(A2:A10)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0');
            helper.edit('J2', '=COUNT(B2:B10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('9');
            helper.edit('J3', '=COUNT(C2:C9)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('8');
            helper.edit('J4', '=COUNT(D3:D10)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('8');
            helper.edit('J5', '=COUNT(I17:I18)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2');
            helper.edit('J6', '=COUNT(I15:I16)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('2');
            helper.edit('J7', '=COUNT(I19:I20)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2');
            helper.edit('J8', '=COUNT(I13:I14)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('2');
            helper.edit('J9', '=COUNT(I2:I5)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0');
            helper.edit('J10', '=COUNT(A13:E16)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('0');
            helper.edit('J11', '=COUNT(I2:I20)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('11');
            done();
        });
        it('COUNT Formula with single cell references values as arguments->', (done: Function) => {
            helper.edit('J12', '=COUNT(A4)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('0');
            helper.edit('J13', '=COUNT(F6)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('1');
            helper.edit('J14', '=COUNT(C19)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0');
            helper.edit('J15', '=COUNT(G5,F14,F10,E13,E9)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('3');
            done();
        });
        it('COUNT Formula with list of different arguments as input->', (done: Function) => {
            helper.edit('J16', '=COUNT(D2:D11,E7,G7,42,"2")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('14');
            helper.edit('J17', '=COUNT(D2:D11,E7,G7)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('12');
            helper.edit('J18', '=COUNT(1,3,4,"a")');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('3');
            helper.edit('J19', '=COUNT("1","323",F9:F10,"Hi123","123Hi","H123i")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('4');
            helper.edit('J20', '=COUNT("HI123",123,"123HI")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('1');
            done();
        });
        it('COUNT Formula with logical value as argument->', (done: Function) => {
            helper.edit('K1', '=COUNT(1,3,"43",TRUE)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('4');
            helper.edit('K2', '=COUNT(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('3');
            helper.edit('K3', '=COUNT("TRUE","FALSE","TRUE")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0');
            helper.edit('K4', '=COUNT(32,2/7/2023,"123","FALSE")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('3');
            helper.edit('K5', '=COUNT(I3,I5,E6)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('1');
            helper.edit('K6', '=COUNT(I2:I5,F7:F8,A6:A9)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('2');
            done();
        });
        it('COUNT Formula with worst case value as argument->', (done: Function) => {
            helper.edit('K7', '=COUNT(,)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('2');
            helper.edit('K8', '=COUNT( " ")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('0');
            helper.edit('K9', '=COUNT(1,,2)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('3');
            helper.edit('K10', '=COUNT(A12:H14)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('0');
            helper.edit('K11', '=COUNT(I9:I12)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('0');
            helper.edit('K12', '=COUNT(0)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('1');
            helper.edit('K12', '=COUNT(1,2,3,,,,,,,)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('10');
            done();
        });
        it('COUNT Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L1', '=COUNT($D$2:$H$11)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('50');
            helper.edit('L2', '=COUNT(32,$F$9,$A$10,$E$14)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('2');
            helper.edit('L3', '=COUNT($C$3:$C$10,$E$5)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('9');
            done();
        });
        it('COUNT Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L4', '=COUNT(Sheet2!A1:A10)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('9');
            helper.edit('L5', '=COUNT(Sheet2!A2:B5,Sheet1!G3:G10)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('12');
            helper.edit('L6', '=COUNT(Sheet1!B2:B9,Sheet2!A3:A9)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('15');
            helper.edit('L7', '=COUNT(Sheet1!A2:B10,Sheet1!H3:H9)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('16');
            helper.edit('L8', '=COUNT(Sheet2!A5)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('1');
            done();
        });
        it('COUNT Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L9', '=COUNT(Sheet2!$A$1:$A$6,Sheet2!$C$3:$C$10,Sheet2!$B$12,$D$6)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('7');
            helper.edit('L10', '=COUNT(Sheet1!$B$3:$B$10,Sheet2!$A$2:$A$8)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('15');
            helper.edit('L11', '=COUNT(Sheet2!$A$3:$B$5,Sheet1!$G$3:$G$10)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('11');
            helper.edit('L12', '=COUNT(Sheet1!$A$2:$B$10)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('9');
            helper.edit('L13', '=COUNT(Sheet2!$A$7)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('1');
            helper.edit('L14', '=COUNT(Sheet1!$A$6)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('0');
            done();
        });
    });

    describe('COUNTA Formula Checking ->', () => {
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
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('COUNTA Formula with ranged cell references values as arguments->', (done: Function) => {
            helper.edit('J1', '=COUNTA(A2:A10)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('9');
            helper.edit('J2', '=COUNTA(B2:B10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('9');
            helper.edit('J3', '=COUNTA(C2:C9)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('8');
            helper.edit('J4', '=COUNTA(D3:D10)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('8');
            helper.edit('J5', '=COUNTA(I17:I18)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2');
            helper.edit('J6', '=COUNTA(I15:I16)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('2');
            helper.edit('J7', '=COUNTA(I19:I20)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2');
            helper.edit('J8', '=COUNTA(I13:I14)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('2');
            helper.edit('J9', '=COUNTA(I2:I5)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('4');
            helper.edit('J10', '=COUNTA(A13:E16)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('0');
            helper.edit('J11', '=COUNTA(I2:I20)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('19');
            done();
        });
        it('COUNTA Formula with single cell references values as arguments->', (done: Function) => {
            helper.edit('J12', '=COUNTA(A4)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('1');
            helper.edit('J13', '=COUNTA(F6)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('1');
            helper.edit('J14', '=COUNTA(C19)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0');
            helper.edit('J15', '=COUNTA(G5,F14,F10,E13,E9)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('3');
            done();
        });
        it('COUNTA Formula with list of different arguments as input->', (done: Function) => {
            helper.edit('J16', '=COUNTA(D2:D11,E7,G7,42,"2")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('14');
            helper.edit('J17', '=COUNTA(D2:D11,E7,G7)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('12');
            helper.edit('J18', '=COUNTA("a","123")');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('2');
            helper.edit('J19', '=COUNTA("1","323",F9:F10,"Hi123","123Hi","H123i")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('7');
            helper.edit('J20', '=COUNTA("HI123",123,"123HI")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('3');
            helper.edit('J21', '=COUNTA(1,a,"1","a",TRUE,"true",FALSE,"false")');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('8');
            done();
        });
        it('COUNTA Formula with logical value as argument->', (done: Function) => {
            helper.edit('K1', '=COUNTA(1,3,"43",TRUE)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('4');
            helper.edit('K2', '=COUNTA(TRUE,FALSE,"32")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('3');
            helper.edit('K3', '=COUNTA("TRUE","FALSE","TRUE")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('3');
            helper.edit('K4', '=COUNTA(32,2/7/2023,"123","FALSE")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('4');
            helper.edit('K5', '=COUNTA(I3,I5,E6)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('3');
            helper.edit('K6', '=COUNTA(I2:I5,F7:F8,A6:A9)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('10');
            done();
        });
        it('COUNTA Formula with worst case value as argument->', (done: Function) => {
            helper.edit('K7', '=COUNTA(,)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('2');
            helper.edit('K8', '=COUNTA( " ")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('1');
            helper.edit('K9', '=COUNTA(1,,5)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('3');
            helper.edit('K10', '=COUNTA(A12:H14)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('0');
            helper.edit('K11', '=COUNTA(I9:I12)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('4');
            helper.edit('K12', '=COUNTA(0)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('1');
            helper.edit('K12', '=COUNTA(1,2,3,,,,,,,)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('10');
            done();
        });
        it('COUNTA Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L1', '=COUNTA($D$2:$H$10)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('45');
            helper.edit('L2', '=COUNTA(32,$F$9,$A$10,$E$14)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('3');
            helper.edit('L3', '=COUNTA($C$3:$C$10,$E$5)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('9');
            done();
        });
        it('COUNTA Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L4', '=COUNTA(Sheet2!A1:A10)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('9');
            helper.edit('L5', '=COUNTA(Sheet2!A2:B5,Sheet1!G3:G10)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('12');
            helper.edit('L6', '=COUNTA(Sheet1!B2:B9,Sheet2!A3:A9)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('15');
            helper.edit('L7', '=COUNTA(Sheet1!A2:B10,Sheet1!H3:H9)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('25');
            helper.edit('L8', '=COUNTA(Sheet2!A5)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('1');
            done();
        });
        it('COUNTA Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L9', '=COUNTA(Sheet2!$A$1:$A$6,Sheet2!$C$3:$C$10,Sheet2!$B$12,$D$6)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('7');
            helper.edit('L10', '=COUNTA(Sheet1!$B$3:$B$10,Sheet2!$A$2:$A$8)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('15');
            helper.edit('L11', '=COUNTA(Sheet2!$A$3:$B$5,Sheet1!$G$3:$G$10)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('11');
            helper.edit('L12', '=COUNTA(Sheet1!$A$2:$B$10)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('18');
            helper.edit('L13', '=COUNTA(Sheet2!$A$7)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('1');
            helper.edit('L14', '=COUNTA(Sheet1!$A$6)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('1');
            done();
        });
    });

    describe('COUNTIF Formula Checking ->', () => {
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
        it('COUNTIF Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J1', '=COUNTIF(D2:D11,"<25")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('5');
            helper.edit('J2', '=COUNTIF(D2:D11,">35")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('3');
            helper.edit('J3', '=COUNTIF(D2:D11,"<="&E4)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('2');
            helper.edit('J4', '=COUNTIF(D2:D11,">="&E3)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('5');
            helper.edit('J5', '=COUNTIF(F2:F11,"<>300")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('7');
            helper.edit('J6', '=COUNTIF(E2:E10,D4)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('3');
            done();
        });
        it('COUNTIF Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('J7', '=COUNTIF(D2:D11,"2*")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J8', '=COUNTIF(D2:D11,"0*")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0');
            helper.edit('J9', '=COUNTIF(A2:A11,"C*")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('2');
            helper.edit('J10', '=COUNTIF(A2:A11,"*es")');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('5');
            helper.edit('J11', '=COUNTIF(A2:A11,"s*ers")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('2');
            done();
        });
        it('COUNTIF Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('J12', '=COUNTIF(D2:D11,"?0")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('0');
            helper.edit('J13', '=COUNTIF(D2:D11,"1?")');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('0');
            helper.edit('J14', '=COUNTIF(A2:A11,"???????Shoes")');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('3');
            helper.edit('J15', '=COUNTIF(A2:A11,"???????")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('1');
            helper.edit('J16', '=COUNTIF(A2:A11,"<>????????")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('8');
            done();
        });
        it('COUNTIF Formula with different kind of value as criteria ->', (done: Function) => {
            helper.edit('K1', '=COUNTIF(G2:G10,11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('1');
            helper.edit('K2', '=COUNTIF(D2:D10,"20")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('3');
            helper.edit('K3', '=COUNTIF(E2:E11,G6)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('4');
            helper.edit('K4', '=COUNTIF(H2:H11,"<>"&G6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('9');
            helper.edit('K5', '=COUNTIF(A2:A7,"*"&A3)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('1');
            helper.edit('K6', '=COUNTIF(A2:A7,A4&"*")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('1');
            helper.edit('K7', '=COUNTIF(A2:A11,"Casual Shoes")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('1');
            done();
        });
        it('COUNTIF Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('K8', '=COUNTIF(H2:H11,">"&G6+13)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('8');
            helper.edit('K9', '=COUNTIF(H2:H10,F5-134)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('1');
            done();
        });
        it('Add 2 COUNTIF Formulas->', (done: Function) => {
            helper.edit('K10', '=(COUNTIF(D2:D11,">30")+COUNTIF(D2:D11,"<30"))');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('9');
            done();
        });
        it('COUNTIF Formula with worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTIF(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTIF(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K11', '=COUNTIF(G2:G10,11)');
            spreadsheet.selectRange('K12');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTIF(,"*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTIF(,"*e")';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K12', '=COUNTIF(G2:G10,11)');
            helper.edit('K13', '=COUNTIF(E2:E9,)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('0');
            helper.edit('K14', '=COUNTIF(AWFE,20)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#NAME?');
            helper.edit('K15', '=COUNTIF("A3","*e")');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#NAME?');
            helper.edit('K16', '=COUNTIF(O2:O6,)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('0');
            done();
        });
        it('COUNTIF Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('K17', '=COUNTIF(A2:A10,"*")');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('9');
            helper.edit('K18', '=COUNTIF(E2:E11,"*")');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('0');
            helper.edit('K19', '=COUNTIF(P2:P10,"*")');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('0');
            helper.edit('K20', '=COUNTIF(A2:A10,"<>*")');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('0');
            helper.edit('K21', '=COUNTIF(D2:D9,"<>*")');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('8');
            helper.edit('K22', '=COUNTIF(P2:P10,"<>*")');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('9');
            done();
        });
        it('COUNTIF Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('L1', '=COUNTIF(I6:I8,"<0")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('2');
            helper.edit('L2', '=COUNTIF(I15:I16,I16)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('1');
            helper.edit('L3', '=COUNTIF(I17:I18,">=12")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('2');
            helper.edit('L4', '=COUNTIF(I19:I20,115)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('1');
            helper.edit('L5', '=COUNTIF(I2:I20,">"&E2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('9');
            done();
        });
        it('COUNTIF Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('L6', '=COUNTIF(I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('2');
            helper.edit('L7', '=COUNTIF(I2:I5,"FALSE")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('2');
            helper.edit('L8', '=COUNTIF(I2:I5,TRUE)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('2');
            helper.edit('L9', '=COUNTIF(I2:I5,FALSE)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('2');
            helper.edit('L10', '=COUNTIF(I2:I3,I2)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('2');
            helper.edit('L11', '=COUNTIF(I2:I3,I3)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('2');
            done();
        });
        it('COUNTIF Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L12', '=COUNTIF($D$2:$D$11,"10")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('1');
            helper.edit('L13', '=COUNTIF($D$2:$D$11,$E2)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('3');
            helper.edit('L14', '=COUNTIF($H$2:$H$11,">"&$E$2)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('8');
            done();
        });
        it('COUNTIF Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L15', '=COUNTIF(Sheet2!A1:A8,Sheet2!A1)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('1');
            helper.edit('L16', '=COUNTIF(Sheet2!A1:A8,"<10")');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('3');
            helper.edit('L17', '=COUNTIF(G2:G11,">="&Sheet2!A5)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('9');
            helper.edit('L18', '=COUNTIF(Sheet2!A1:A8,">="&Sheet1!G6)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('5');
            helper.edit('L19', '=COUNTIF(Sheet1!G2:G11,Sheet2!A5)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('1');
            helper.edit('L20', '=COUNTIF(Sheet1!E2:E11,">"&Sheet1!E6)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('6');
            done();
        });
        it('COUNTIF Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L21', '=COUNTIF(Sheet2!$A$1:$A$9,Sheet2!$A$2)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('1');
            helper.edit('L22', '=COUNTIF(Sheet2!$A$1:$A$8,"<10")');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('3');
            helper.edit('L23', '=COUNTIF(G2:G11,">="&Sheet2!$A$1)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('9');
            helper.edit('L24', '=COUNTIF(Sheet1!$G$2:$G$11,Sheet2!A5)');
            expect(helper.invoke('getCell', [23, 11]).textContent).toBe('1');
            helper.edit('L25', '=COUNTIF(Sheet1!$G$2:$G$11,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [24, 11]).textContent).toBe('1');
            helper.edit('L26', '=COUNTIF(Sheet2!$A$1:$A$8,">="&Sheet1!$G$6)');
            expect(helper.invoke('getCell', [25, 11]).textContent).toBe('5');
            helper.edit('L27', '=COUNTIF(Sheet1!$E$2:$E$11,">"&Sheet1!$E$5)');
            expect(helper.invoke('getCell', [26, 11]).textContent).toBe('2');
            done();
        });
        it('COUNTIF Formula with nested Formula as criteria->', (done: Function) => {
            helper.edit('M1', '=COUNTIF(E2:E11,SUM(D3))');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('3');
            helper.edit('M2', '=COUNTIF(G2:G11,COUNT(E2:E11))');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('1');
            helper.edit('M3', '=COUNTIF(F2:F11,">"LEN(E2:E11))');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('10');
            done();
        });
        it('COUNTIF formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('M4', '=COUNTIF(Sheet2!A8:A9,"q1")');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('1');
            helper.edit('M5', '=COUNTIF(Sheet2!A8:A9,"Q2")');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('1');
            done();
        });
    });

    describe('EJ2-853889 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Spreasheet throws console error when inserting rows in sheet that contains formula with column reference', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.edit('J1', '=COUNTIF(H:H,">10")');
            helper.edit('A12', '=COUNTIF(10:10,">10")');
            expect(helper.invoke('getCell', [9, 0]).textContent).toBe('Cricket Shoes');
            helper.invoke('selectRange', ['A10']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(5, 0, [6, 1], true, false);
            setTimeout(() => {
                expect(helper.invoke('getCell', [9, 0]).textContent).toBe('');
                expect(spreadsheet.sheets[0].rows[12].cells[0].formula).toBe('=COUNTIF(11:11,">10")');
                expect(helper.invoke('getCell', [0, 7]).textContent).toBe('Profit');
                helper.invoke('selectRange', ['H1']);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                setTimeout(() => {
                    expect(helper.invoke('getCell', [0, 7]).textContent).toBe('');
                    expect(spreadsheet.sheets[0].rows[0].cells[10].formula).toBe('=COUNTIF(I:I,">10")');
                    helper.click('.e-add-sheet-tab');
                    setTimeout(() => {
                        helper.invoke('updateCell', [{ formula: '=SUMIF(Sheet2!I:I,">10")' }, 'Sheet1!K1']);
                        helper.invoke('updateCell', [{ formula: '=SUMIF(Sheet2!11:11,">10")' }, 'Sheet1!A13']);
                        helper.invoke('selectRange', ['H1']);
                        helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                        helper.openAndClickCMenuItem(0, 5, [6, 1], false, true);
                        setTimeout(() => {
                            expect(spreadsheet.sheets[0].rows[0].cells[10].formula).toBe('=SUMIF(Sheet2!J:J,">10")');
                            helper.invoke('selectRange', ['A11']);
                            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                            helper.openAndClickCMenuItem(5, 0, [6, 1], true, false);
                            setTimeout(() => {
                                expect(helper.invoke('getCell', [10, 0]).textContent).toBe('');
                                expect(spreadsheet.sheets[0].rows[12].cells[0].formula).toBe('=SUMIF(Sheet2!12:12,">10")');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('EJ2-861114 -> Alphanumberic value in cell references are not properly calculated ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [
                        { cells: [{ value: 'FY2022' }] }, { cells: [{ value: 'FY2022' }] },
                        { cells: [{ value: 'FY2023' }] }, { cells: [{ value: 'FY2023' }] },
                        { cells: [{ value: 'FY2022' }] }, { cells: [{ value: 'FY2022' }] },
                        { cells: [{ value: '1' }] }, { cells: [{ value: '2' }] },
                        { cells: [{ value: '3' }] }, { cells: [{ value: '4' }] },
                        { cells: [{ value: '5' }] }, { cells: [{ value: '6' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUMIF,AVERAGEIF and COUNTIF Formula with Alphanumberic value in cell references as arguments ->', (done: Function) => {
            helper.edit('B1', '=SUMIF(A1:A6,A1,A7:A12)');
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('14');
            helper.edit('B2', '=AVERAGEIF(A1:A6,A1,A7:A12)');
            expect(helper.invoke('getCell', [1, 1]).textContent).toBe('3.5');
            helper.edit('B3', '=COUNTIF(A1:A6,A3)');
            expect(helper.invoke('getCell', [2, 1]).textContent).toBe('2');
            done();
        });
        it('SUMIFS,AVERAGEIFS and COUNTIFS Formula with Alphanumberic value in cell references as arguments ->', (done: Function) => {
            helper.edit('B4', '=SUMIFS(A7:A12,A1:A6,A1)');
            expect(helper.invoke('getCell', [3, 1]).textContent).toBe('14');
            helper.edit('B5', '=AVERAGEIFS(A7:A12,A1:A6,A3)');
            expect(helper.invoke('getCell', [4, 1]).textContent).toBe('3.5');
            helper.edit('B6', '=COUNTIFS(A1:A6,A1)');
            expect(helper.invoke('getCell', [5, 1]).textContent).toBe('4');
            done();
        });
    });

    describe('COUNTIFS Formula Checking ->', () => {
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
        it('COUNTIFS Formula with operators as criteria ->', (done: Function) => {
            helper.edit('J1', '=COUNTIFS(D2:D11,"<25",E2:E11,"<30")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('4');
            helper.edit('J2', '=COUNTIFS(D2:D11,">35",E2:E11,">25")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            helper.edit('J3', '=COUNTIFS(D2:D11,"<="&G6,H2:H11,"<="&G6)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('1');
            helper.edit('J4', '=COUNTIFS(D2:D11,">="&E2,F2:F11,">="&H10)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('8');
            helper.edit('J5', '=COUNTIFS(F2:F11,"<>300")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('7');
            helper.edit('J6', '=COUNTIFS(E2:E10,D4,G2:G10,13)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('1');
            helper.edit('J7', '=COUNTIFS(E2:E11,"<20",F2:F11,">200")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('4');
            helper.edit('J8', '=COUNTIFS(E2:E11,">"&H9,F2:F11,">100")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('2');
            helper.edit('J9', '=COUNTIFS(D2:D11,">20",H2:H11,"<>"&G6)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('5');
            helper.edit('J10', '=COUNTIFS(H2:H11,"=10",D2:D11,"=10")');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1');
            helper.edit('J11', '50');
            helper.edit('J12', '=COUNTIFS(J11,">=40")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('1');
            done();
        });
        it('COUNTIFS Formula with wildcard * as criteria* ->', (done: Function) => {
            helper.edit('J11', '=COUNTIFS(D2:D11,"2*")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0');
            helper.edit('J12', '=COUNTIFS(D2:D11,"0*")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('0');
            helper.edit('J13', '=COUNTIFS(A2:A11,"C*")');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('2');
            helper.edit('J14', '=COUNTIFS(A2:A11,"*es")');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('5');
            helper.edit('J15', '=COUNTIFS(A2:A11,"s*ers")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('2');
            done();
        });
        it('COUNTIFS Formula with wildcard ? as criteria ->', (done: Function) => {
            helper.edit('J16', '=COUNTIFS(D2:D11,"?0")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('0');
            helper.edit('J17', '=COUNTIFS(D2:D11,"1?")');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('0');
            helper.edit('J18', '=COUNTIFS(A2:A11,"???????Shoes")');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('3');
            helper.edit('J19', '=COUNTIFS(A2:A11,"???????")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('1');
            helper.edit('J20', '=COUNTIFS(A2:A11,"<>????????")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('8');
            done();
        });
        it('COUNTIFS Formula with different kind of value as criteria ->', (done: Function) => {
            helper.edit('K1', '=COUNTIFS(D2:D10,10,E2:E10,20)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('1');
            helper.edit('K2', '=COUNTIFS(D2:D10,"20",G2:G10,">"2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('3');
            helper.edit('K3', '=COUNTIFS(E2:E11,G6,D2:D11,D6)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('1');
            helper.edit('K4', '=COUNTIFS(H2:H11,"<>"&G6,D2:D11,"<>"&E6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('9');
            helper.edit('K5', '=COUNTIFS(A2:A11,"*"&A6,D2:D11,30)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('1');
            helper.edit('K6', '=COUNTIFS(A2:A11,A6&"*",D2:D11,30)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('1');
            helper.edit('K7', '=COUNTIFS(A2:A11,"Casual Shoes",D2:D11,10)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('1');
            done();
        });
        it('COUNTIFS Formula with experssion as criteria ->', (done: Function) => {
            helper.edit('K8', '=COUNTIFS(H2:H11,">"&G6+13,F2:F11,">"&D7+100)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('8');
            helper.edit('K9', '=COUNTIFS(F2:F11,">"&H10-66)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('10');
            done();
        });
        it('COUNTIFS Formula with worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K10');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTIFS(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTIFS(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K10', '=COUNTIFS(D2:D11,"<25",E2:E11,"<30")');
            spreadsheet.selectRange('K11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTIFS(,"*e")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTIFS(,"*e")';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K11', '=COUNTIFS(D2:D11,"<25",E2:E11,"<30")');
            helper.edit('K12', '=COUNTIFS(E2:E9,)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('0');
            helper.edit('K13', '=COUNTIFS(A2:A11,,H4:H9,)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#VALUE!');
            helper.edit('K14', '=COUNTIFS(A3:A14,"",D4:D14,"=20")');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            helper.edit('K15', '=COUNTIFS(F3:F11,"300",H3:H13,">50")');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#VALUE!');
            helper.edit('K16', '=COUNTIFS(F3:F11,"300",H3:H13,">50")');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K19', '=COUNTIFS(Q4:Q12,)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('0');
            helper.edit('K20', '=COUNTIFS(Q4:Q12,"")');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('9');
            done();
        });
        it('COUNTIFS Formula with text,empty,number value as range and * or <>* as criteria->', (done: Function) => {
            helper.edit('L1', '=COUNTIFS(A2:A10,"*")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('9');
            helper.edit('L2', '=COUNTIFS(E2:E11,"*",F2:F11,"*")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('0');
            helper.edit('L3', '=COUNTIFS(P2:P10,"*")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('0');
            helper.edit('L4', '=COUNTIFS(A2:A10,"<>*")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('0');
            helper.edit('L5', '=COUNTIFS(D2:D9,"<>*",G2:G9,"<>*")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('8');
            helper.edit('L6', '=COUNTIFS(P2:P10,"<>*")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('9');
            helper.edit('L7', '=COUNTIFS(Q1:Q7,)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('0');
            helper.edit('L8', '=COUNTIFS(P1:P7,"",Q1:Q7,"")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('7');
            done();
        });
        it('COUNTIFS Formula with different formatted value as arguments->', (done: Function) => {
            helper.edit('L9', '=COUNTIFS(I6:I8,"<0",E5:E7,">15")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('1');
            helper.edit('L10', '=COUNTIFS(I15:I16,I16)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('1');
            helper.edit('L11', '=COUNTIFS(I17:I18,">=12",I19:I20,">0")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('2');
            helper.edit('L12', '=COUNTIFS(I19:I20,115,I13:I14,32)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('1');
            helper.edit('L13', '=COUNTIFS(I2:I20,">"&E2)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('9');
            helper.edit('L14', '=COUNTIFS(I9:I10,"#VALUE!")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('1');
            done();
        });
        it('COUNTIFS Formula with Logical value as arguments->', (done: Function) => {
            helper.edit('L15', '=COUNTIFS(I2:I5,"TRUE")');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('2');
            helper.edit('L16', '=COUNTIFS(I2:I5,"FALSE",F2:F5,300)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('2');
            helper.edit('L17', '=COUNTIFS(I2:I5,TRUE,D2:D5,">8")');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('2');
            helper.edit('L18', '=COUNTIFS(I2:I5,FALSE)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('2');
            helper.edit('L19', '=COUNTIFS(I2:I3,I2,G2:G3,">0",E2:E3,"<35")');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('2');
            helper.edit('L20', '=COUNTIFS(I2:I3,I3)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('2');
            done();
        });
        it('COUNTIFS Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=COUNTIFS($D$2:$D$10,10,$E$2:$E$10,20)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('1');
            helper.edit('M2', '=COUNTIFS($D$2:$D$11,">="&$E$2,$F$2:$F$11,">="&$H$10)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('8');
            helper.edit('M3', '=COUNTIFS($H$2:$H$11,">"&$E$2)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('8');
            done();
        });
        it('COUNTIFS Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M4', '=COUNTIFS(Sheet1!A2:A10,"S*",Sheet1!D2:D10,">10")');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('3');
            helper.edit('M5', '=COUNTIFS(Sheet2!A2:A5,">2",Sheet2!A6:A9,">10")');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('4');
            helper.edit('M6', '=COUNTIFS(Sheet2!A1:A8,"<10")');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('3');
            helper.edit('M7', '=COUNTIFS(G2:G11,">="&Sheet2!A5)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('9');
            helper.edit('M8', '=COUNTIFS(Sheet1!G2:G11,Sheet2!A5)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('1');
            helper.edit('M9', '=COUNTIFS(Sheet1!D2:D5,">10",Sheet2!A6:A9,">10")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('3');
            helper.edit('M10', '=COUNTIFS(Sheet1!D2:D11,">"&Sheet1!E2,Sheet1!F2:F11,">"&Sheet1!G10)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('5');
            done();
        });
        it('COUNTIFS Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M11', '=COUNTIFS(Sheet2!$A$1:$A$8,Sheet2!$A$1)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('1');
            helper.edit('M12', '=COUNTIFS(Sheet2!$A$1:$A$8,"<10")');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('3');
            helper.edit('M13', '=COUNTIFS(G2:G11,">="&Sheet2!$A$5)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('9');
            helper.edit('M14', '=COUNTIFS(Sheet1!$G$2:$G$11,Sheet2!A3)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('1');
            helper.edit('M15', '=COUNTIFS(Sheet2!$A$1:$A$8,">="&Sheet1!$G$6)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('5');
            helper.edit('M16', '=COUNTIFS(Sheet1!$E$2:$E$11,">"&Sheet1!$E$5)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('2');
            helper.edit('M17', '=COUNTIFS(Sheet1!$G$2:$G$11,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('1');
            helper.edit('M18', '=COUNTIFS(Sheet1!$D$2:$D$5,">10",Sheet2!$A$6:$A$9,">10")');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('3');
            helper.edit('M19', '=COUNTIFS(Sheet1!$D$2:$D$11,">"&Sheet1!E2,Sheet1!$F$2:$F$11,">"&Sheet1!G10)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('5');
            helper.edit('M20', '=COUNTIFS(Sheet1!$D$2:$D$11,">"&Sheet1!$E$3,Sheet1!$F$2:$F$11,">"&Sheet1!$G$9)');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('4');
            done();
        });
        it('COUNTIFS Formula with Nested formula as arguments ->', (done: Function) => {
            helper.edit('N1', '=COUNTIFS(A2:A11,"C*",D2:D11,SUM(7,3))');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('1');
            helper.edit('N2', '=COUNTIFS(E2:E11,COUNT(E2:E11),F2:F11,SUM(150,150))');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('1');
            helper.edit('N3', '=COUNTIFS(D2:D11,AVERAGE(E2:E9))');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('0');
            helper.edit('N4', '=COUNTIFS(D2:D11,LEN(H2)+8)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('1');
            helper.edit('N5', '=COUNTIFS(E2:E8,10,F2:F8,MEDIAN(F4:F7))');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('1');
            done();
        });
        it('COUNTIFS formula with cell references like string argument as input->', (done: Function) => {
            helper.edit('N6', '=COUNTIFS(Sheet1!G5:G6,G5,Sheet2!A8:A9,"q1")');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('1');
            helper.edit('N7', '=COUNTIFS(Sheet1!G5:G6,G6,Sheet2!A8:A9,"Q2")');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('1');
            done();
        });
        it('COUNTIFS formula with Nested DATE Formula as input->', (done: Function) => {
            helper.edit('N8', '=COUNTIFS(H2:H7,">5",B2:B7,">"&DATE(2014,4,3))');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('5');
            done();
        });
        it('COUNTIFS formula with improper range as input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTIFS(H2:H11,D2,D2:D11)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTIFS(H2:H11,D2,D2:D11)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N9', '=COUNTIFS(H2:H11,D2,D2:D11,E8)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('1');
            done();
        });
    });

    describe('EJ2-1015176 Cross-sheet COUNTIFS circular reference fix ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [ { name: 'SheetOne' } ] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Paste COUNTIFS cross-sheet formula in SheetOne!B2, add new sheet, paste in B2 and B3, dependent formula cell size must be 2', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.invoke('updateCell', [{ formula: '=COUNTIFS(SheetOne!B2:B79,"1000",SheetOne!F2:F79,A2)' }, 'SheetOne!B2']);
            setTimeout(() => {
                helper.invoke('insertSheet');
                setTimeout(() => {
                    helper.edit('Sheet1!B2', '=COUNTIFS(SheetOne!B2:B79,"1000",SheetOne!F2:F79,A2)');
                    helper.edit('Sheet1!B3', '=COUNTIFS(SheetOne!B2:B79,"1000",SheetOne!F2:F79,A2)');
                    setTimeout(() => {
                        expect(spreadsheet.sheets[1].rows[1].cells[1].value).toBe(0);
                        const calcInstance: any = spreadsheet.workbookFormulaModule.calculateInstance;
                        expect(calcInstance.dependentCells.size).toBe(80);
                        done();
                    });
                });
            });
        });
    });

    describe('Resolve the reported MIN and MAX formula related issues ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('checking corner cases and nested formula for MIN formula', (done: Function) => {
            helper.edit('I5', '=MIN(,)');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].value).toEqual('0');
            helper.edit('I6', '=MIN(23,12,)');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].value).toEqual('0');
            helper.edit('I7', '=MIN(23,12,"123hello")');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].value).toEqual('#VALUE!');
            helper.edit('I8', '=MIN(23,12,IF(2>1,"hello","world"))');
            expect(helper.getInstance().sheets[0].rows[7].cells[8].value).toEqual('#VALUE!');
            helper.edit('I9', '=MIN(23,A1,36)');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toEqual('23');
            helper.edit('I10', '=MIN("23","34","12","-1.34")');
            expect(helper.getInstance().sheets[0].rows[9].cells[8].value).toEqual('-1.34');
            helper.edit('I11', '=MIN(12,TRUE,45.3,FALSE)');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].value).toEqual('0');
            helper.edit('I12', '=MIN(12,G3,34)');
            expect(helper.getInstance().sheets[0].rows[11].cells[8].value).toEqual('5');
            helper.edit('I13', '=MIN(12,"FALSE",7)');
            expect(helper.getInstance().sheets[0].rows[12].cells[8].value).toEqual('#VALUE!');
            helper.edit('I14', '=MIN(23,-34,A22)');
            expect(helper.getInstance().sheets[0].rows[13].cells[8].value).toEqual('-34');
            helper.edit('I15', '=MIN(MIN(G2:G5),MAX(G6:G9))');
            expect(helper.getInstance().sheets[0].rows[14].cells[8].value).toEqual('1');
            helper.edit('I16', '=MIN(SUM(G2:G5),SUM(G6:G9))');
            expect(helper.getInstance().sheets[0].rows[15].cells[8].value).toEqual('24');
            helper.edit('I17', '=MIN(IF(G2<G3,G2:G10))');
            expect(helper.getInstance().sheets[0].rows[16].cells[8].value).toEqual('1');
            helper.edit('I18', '=MIN(GEOMEAN(G2:G6),GEOMEAN(G6:G10))');
            expect(helper.getInstance().sheets[0].rows[17].cells[8].value).toEqual('5.213053066891882');
            helper.edit('I19', '=MIN(LEN(A1),8)');
            expect(helper.getInstance().sheets[0].rows[18].cells[8].value).toEqual('8');
            helper.edit('I20', '=MIN(IF(2>1,34,56),45,67)');
            expect(helper.getInstance().sheets[0].rows[19].cells[8].value).toEqual('34');
            done();
        });
        it('checking corner cases and nested formula for MAX formula', (done: Function) => {
            helper.edit('I5', '=MAX(,)');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].value).toEqual('0');
            helper.edit('I6', '=MAX(23,12,)');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].value).toEqual('23');
            helper.edit('I7', '=MAX(23,12,"123hello")');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].value).toEqual('#VALUE!');
            helper.edit('I8', '=MAX(23,12,IF(2>1,"hello","world"))');
            expect(helper.getInstance().sheets[0].rows[7].cells[8].value).toEqual('#VALUE!');
            helper.edit('I9', '=MAX(23,A1,36)');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].value).toEqual('36');
            helper.edit('I10', '=MAX("23","34","12","-1.34")');
            expect(helper.getInstance().sheets[0].rows[9].cells[8].value).toEqual('34');
            helper.edit('I11', '=MAX(12,TRUE,45.3,FALSE)');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].value).toEqual('45.3');
            helper.edit('I12', '=MAX(12,G3,34)');
            expect(helper.getInstance().sheets[0].rows[11].cells[8].value).toEqual('34');
            helper.edit('I13', '=MAX(12,"FALSE",7)');
            expect(helper.getInstance().sheets[0].rows[12].cells[8].value).toEqual('#VALUE!');
            helper.edit('I14', '=MAX(23,-34,A22)');
            expect(helper.getInstance().sheets[0].rows[13].cells[8].value).toEqual('23');
            helper.edit('I15', '=MAX(MIN(G2:G5),MAX(G6:G9))');
            expect(helper.getInstance().sheets[0].rows[14].cells[8].value).toEqual('13');
            helper.edit('I16', '=MAX(SUM(G2:G5),SUM(G6:G9))');
            expect(helper.getInstance().sheets[0].rows[15].cells[8].value).toEqual('32');
            helper.edit('I17', '=MAX(IF(G2<G3,G2:G10))');
            expect(helper.getInstance().sheets[0].rows[16].cells[8].value).toEqual('13');
            helper.edit('I18', '=MAX(GEOMEAN(G2:G6),GEOMEAN(G6:G10))');
            expect(helper.getInstance().sheets[0].rows[17].cells[8].value).toEqual('7.7567433260414305');
            helper.edit('I19', '=MAX(LEN(A1),8)');
            expect(helper.getInstance().sheets[0].rows[18].cells[8].value).toEqual('9');
            helper.edit('I20', '=MAX(IF(2>1,34,56),45,67)');
            expect(helper.getInstance().sheets[0].rows[19].cells[8].value).toEqual('67');
            done();
        });
        it('MIN and MAX Formula with nested SORT formula contains empty value -> ', (done: Function) => {
            helper.edit('G2', '');
            helper.edit('G5', '');
            helper.edit('I21', '=MIN(SORT(G2:G10))');
            expect(helper.getInstance().sheets[0].rows[20].cells[8].value).toEqual('3');
            helper.edit('J22', '=MAX(SORT(G2:G10))');
            expect(helper.getInstance().sheets[0].rows[21].cells[9].value).toEqual('13');
            done();
        });
    });

    describe('Sheet References Checking for MIN and MAX -> ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '8529.22' }] },
                    { cells: [{ value: '17866.19' }] }, { cells: [{ value: '13853.09' }] }, { cells: [{ value: '2338.74' }] },
                    { cells: [{ value: '9578.45' }] }, { cells: [{ value: '19141.62' }] }, { cells: [{ value: '6543.3' }] }, { cells: [{ value: '13035.06' }] },
                    { cells: [{ value: '18488.8' }] }, { cells: [{ value: '12317.04' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MIN Formula with absolute cell references -> ', (done: Function) => {
            helper.edit('I2', '=MIN($G$2:$G$9)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            helper.edit('I3', '=MIN($G$4,$G$7,H2,G7)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('7');
            helper.edit('I4', '=MIN($G$3,$G$8,TRUE)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('1');
            helper.edit('I5', '=MIN($G$2,$G$5,-34,G5)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('-34');
            helper.edit('I6', '=MIN($G$7,$G$3,)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('0');
            done();
        });
        it('MAX Formula with absolute cell references -> ', (done: Function) => {
            helper.edit('I7', '=MAX($G$2:$G$9)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('13');
            helper.edit('I8', '=MAX($G$4,$G$7,H2,G7)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('13');
            helper.edit('I9', '=MAX($G$3,$G$8,TRUE)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('5');
            helper.edit('I10', '=MAX($G$2,$G$5,-34,G5)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('11');
            helper.edit('I11', '=MAX($G$7,$G$3,)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('13');
            done();
        });
        it('MIN Formula with Sheet refernces as arguments -> ', (done: Function) => {
            helper.edit('J2', '=MIN(Sheet1!G2:Sheet1!G10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            helper.edit('J3', '=MIN(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('1');
            helper.edit('J4', '=MIN(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10,H2)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('1');
            helper.edit('J5', '=MIN(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10,TRUE)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1');
            done();
        });
        it('MAX Formula with Sheet refernces as arguments -> ', (done: Function) => {
            helper.edit('J6', '=MAX(Sheet1!G2:Sheet1!G10)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('13');
            helper.edit('J7', '=MAX(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('166');
            helper.edit('J8', '=MAX(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10,H2)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('166');
            helper.edit('J9', '=MAX(Sheet1!$G$2,Sheet1!$G$10,Sheet1!H10,TRUE)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('166');
            done();
        });
        it('MIN Formula with external Sheet refernces as arguments -> ', (done: Function) => {
            helper.edit('K2', '=MIN(Sheet1!H2:Sheet1!H10,Sheet1!A2,Sheet1!A10)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('10');
            helper.edit('K3', '=MIN(Sheet1!$H$2:Sheet1!$H$10,Sheet2!$A$2,Sheet2!$A$10)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('10');
            helper.edit('K4', '=MIN(Sheet1!$H$2:Sheet1!$H$10,Sheet2!A9,Sheet2!A10)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('10');
            helper.edit('K5', '=MIN(Sheet1!H2:Sheet1!H10,Sheet2!A2,Sheet2!A10,3456.765)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('10');
            helper.edit('K6', '=MIN(Sheet1!$H$2:Sheet1!$H$10,Sheet2!A2,Sheet2!A10,3456.765,TRUE)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('1');
            done();
        });
        it('MAX Formula with external Sheet refernces as arguments -> ', (done: Function) => {
            helper.edit('K2', '=MAX(Sheet1!H2:Sheet1!H10,Sheet1!A2,Sheet1!A10)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('166');
            helper.edit('K3', '=MAX(Sheet1!$H$2:Sheet1!$H$10,Sheet2!$A$2,Sheet2!$A$10)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('17866.19');
            helper.edit('K4', '=MAX(Sheet1!$H$2:Sheet1!$H$10,Sheet2!A9,Sheet2!A10)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('18488.8');
            helper.edit('K5', '=MAX(Sheet1!H2:Sheet1!H10,Sheet2!A2,Sheet2!A10,3456.765)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('17866.19');
            helper.edit('K6', '=MAX(Sheet1!$H$2:Sheet1!$H$10,Sheet2!A2,Sheet2!A10,3456.765,TRUE)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('17866.19');
            done();
        });
    });

    describe('EJ2-853889 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MIN() and MAX() functions does not return proper value as expected when contains zero as arguments', (done: Function) => {
            helper.edit('I2', '0');
            helper.edit('I3', '1');
            helper.edit('I5', '=MIN(I2,I3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('0');
            helper.edit('I6', '=MAX(I2,I3)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('1');
            done();
        });
    });

    describe('Formula - Checking XI ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CHOOSE Formula for cell Reference with Num_index->', (done: Function) => {
            helper.edit('I1', '=CHOOSE(1,A2:A5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHOOSE(1,A2:A5)"}');
            done();
        });
        it('CHOOSE Formula for cell Reference with Num_index as alphabets->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(a,A2:A5)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#NAME?","formula":"=CHOOSE(a,A2:A5)"}');
            done();
        });
        it('INDEX Formula ->', (done: Function) => {
            helper.edit('I3', '=INDEX(D1:H11,5,5)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('67');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"67","formula":"=INDEX(D1:H11,5,5)"}');
            done();
        });
        it('INDEX Formula with column value as alphabets->', (done: Function) => {
            helper.edit('I4', '=INDEX(A1:A5,1,a)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#NAME?","formula":"=INDEX(A1:A5,1,a)"}');
            done();
        });
        it('INDEX Formula with Row value as alphabets->', (done: Function) => {
            helper.edit('I5', '=INDEX(D2:D5,a)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#NAME?","formula":"=INDEX(D2:D5,a)"}');
            done();
        });
        it('INDEX Formula with Column value as 0->', (done: Function) => {
            helper.edit('I6', '=INDEX(D2:H11,5,0)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"30","formula":"=INDEX(D2:H11,5,0)"}');
            done();
        });
        it('INDEX Formula with row and Column value as -1->', (done: Function) => {
            helper.edit('I7', '=INDEX(A1:A10,-1,-1)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#VALUE!","formula":"=INDEX(A1:A10,-1,-1)"}');
            done();
        });
        it('Match Formula with Match Type as 1->', (done: Function) => {
            helper.edit('J1', '=Match(9.5,D2:D11,1)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"#N/A","formula":"=Match(9.5,D2:D11,1)"}');
            done();
        });
        it('Match Formula with Match Type as -1->', (done: Function) => {
            helper.edit('J2', '=MATCH(10,D2:D11,"-1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('1');
            done();
        });
        it('Match Formula with Match Type as -1 II->', (done: Function) => {
            helper.edit('J3', '=MATCH(10,D3:D11,"-1")');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=MATCH(10,D3:D11,"-1")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('#N/A');
            done();
        });
        it('Match Formula with Match Type as 0->', (done: Function) => {
            helper.edit('J4', '=MATCH(10,D2:D11,0)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":1,"formula":"=MATCH(10,D2:D11,0)"}');
            done();
        });
        it('RANDBETWEEN Formula with maximum argument->', (done: Function) => {
            helper.edit('J5', '=RANDBETWEEN(,10)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"#N/A","formula":"=RANDBETWEEN(,10)"}');
            done();
        });
        it('RANDBETWEEN Formula with value as 0->', (done: Function) => {
            helper.edit('J6', '=RANDBETWEEN(0,0)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"0","formula":"=RANDBETWEEN(0,0)"}');
            done();
        });
        it('RANDBETWEEN Formula for cell references with string values ->', (done: Function) => {
            helper.edit('J8', '=RANDBETWEEN(A2,D2)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{"value":"#VALUE!","formula":"=RANDBETWEEN(A2,D2)"}');
            done();
        });
        it('RANDBETWEEN Formula for cell references with no values ->', (done: Function) => {
            helper.edit('J9', '=RANDBETWEEN(D12,D13)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[9])).toBe('{"value":"0","formula":"=RANDBETWEEN(D12,D13)"}');
            done();
        });
        it('SLOPE Formula ->', (done: Function) => {
            helper.edit('K1', '=SLOPE(D2:D11,E2:E11)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('-0.191111111');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"-0.19111111111111112","formula":"=SLOPE(D2:D11,E2:E11)"}');
            done();
        });
        it('SLOPE Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SLOPE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SLOPE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K2', '=SLOPE(D2:D11,E2:E11)');
            done();
        });
        it('SLOPE Formula with not equal range->', (done: Function) => {
            helper.edit('K3', '=SLOPE(D2:D11,C2:C5)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"#N/A","formula":"=SLOPE(D2:D11,C2:C5)"}');
            done();
        });
        it('SLOPE Formula with cell having string->', (done: Function) => {
            helper.edit('K4', '=SLOPE(D1,E1)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(D1,E1)"}');
            done();
        });
        it('SLOPE Formula with direct string inputs->', (done: Function) => {
            helper.edit('K5', '=SLOPE(a,b)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(a,b)"}');
            done();
        });
        it('INTERCEPT Formula ->', (done: Function) => {
            helper.edit('K6', '=INTERCEPT(D2:D11,E2:E11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('31.04444444');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"31.044444444444444","formula":"=INTERCEPT(D2:D11,E2:E11)"}');
            done();
        });
        it('INTERCEPT Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=INTERCEPT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=INTERCEPT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K7', '=INTERCEPT(D2:D11,E2:E11)');
            done();
        });
        it('SLOPE Formula with not equal range->', (done: Function) => {
            helper.edit('K8', '=SLOPE(D2:D11,C2:C5)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":"#N/A","formula":"=SLOPE(D2:D11,C2:C5)"}');
            done();
        });
        it('SLOPE Formula with cell having string->', (done: Function) => {
            helper.edit('K9', '=INTERCEPT(D1,E1)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(D1,E1)"}');
            done();
        });
        it('SLOPE Formula with direct string inputs->', (done: Function) => {
            helper.edit('K10', '=INTERCEPT(a,b)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[10])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(a,b)"}');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 11 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [
                    { ranges: [{ dataSource: EJ2_53702_SLOPE_SHEET1 }] },
                    { ranges: [{ dataSource: EJ2_53702_SLOPE_SHEET2 }] }
                ]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SLOPE - Specific Cases - I', (done: Function) => {
            helper.edit('Q1', '=SLOPE(,)');
            expect(helper.invoke('getCell', [0, 16]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[16])).toBe('{"value":"#VALUE!","formula":"=SLOPE(,)"}');
            done();
        });
        it('SLOPE - Direct Value - I', (done: Function) => {
            helper.edit('R1', '=SLOPE("{12,-4}", "{-5,19}")');
            expect(helper.invoke('getCell', [0, 17]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[17])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(\\"{12,-4}\\", \\"{-5,19}\\")"}');
            done();
        });
        it('SLOPE - Cell reference - I', (done: Function) => {
            helper.edit('S1', '=SLOPE(H23:H26, G16:G19)');
            expect(helper.invoke('getCell', [0, 18]).textContent).toBe('498.5005');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[18])).toBe('{"value":"498.50049999999464","formula":"=SLOPE(H23:H26, G16:G19)"}');
            done();
        });
        it('SLOPE - Cell reference - II', (done: Function) => {
            helper.edit('S2', '=SLOPE(C19:C22, G19:G22)');
            expect(helper.invoke('getCell', [1, 18]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[18])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(C19:C22, G19:G22)"}');
            done();
        });
        it('SLOPE - Cell reference - III', (done: Function) => {
            helper.edit('S3', '=SLOPE(D20:G20, J18:J21)');
            expect(helper.invoke('getCell', [2, 18]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[18])).toBe('{"value":"20","formula":"=SLOPE(D20:G20, J18:J21)"}');
            done();
        });
        it('SLOPE - Cell reference - IV', (done: Function) => {
            helper.edit('S4', '=SLOPE(G18:G21, H20:K20)');
            expect(helper.invoke('getCell', [3, 18]).textContent).toBe('0.05');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[18])).toBe('{"value":"0.05","formula":"=SLOPE(G18:G21, H20:K20)"}');
            done();
        });
        it('SLOPE - Different datatypes - I', (done: Function) => {
            helper.edit('N1', '=SLOPE(C32:K32, B34:J34)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('-0.422273676');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":"-0.4222736759740336","formula":"=SLOPE(C32:K32, B34:J34)"}');
            done();
        });
        it('SLOPE - Different datatypes - II', (done: Function) => {
            helper.edit('N2', '=SLOPE(L2:L17, M2:M17)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0.997597169');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"0.9975971694248421","formula":"=SLOPE(L2:L17, M2:M17)"}');
            done();
        });
        it('SLOPE - Different datatypes - III', (done: Function) => {
            helper.edit('N3', '=SLOPE(M24:M29, )');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":"#VALUE!","formula":"=SLOPE(M24:M29, )"}');
            done();
        });
        it('SLOPE - Different datatypes - IV', (done: Function) => {
            helper.edit('N4', '=SLOPE(, A2)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[13])).toBe('{"value":"#VALUE!","formula":"=SLOPE(, A2)"}');
            done();
        });
        it('SLOPE - Different datatypes - IV', (done: Function) => {
            helper.edit('N5', '=SLOPE(M23:M28, M23:M28)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[13])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(M23:M28, M23:M28)"}');
            done();
        });
        it('SLOPE - Sheets - I', (done: Function) => {
            helper.edit('P1', '=SLOPE(Sheet1!C5:Sheet1!H5, Sheet1!G12:Sheet1!L12)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('0.547945205');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":"0.547945205479452","formula":"=SLOPE(Sheet1!C5:Sheet1!H5, Sheet1!G12:Sheet1!L12)"}');
            done();
        });
        it('SLOPE - Sheets - II', (done: Function) => {
            helper.edit('P2', '=SLOPE(Sheet1!$C$5:Sheet1!$H5, Sheet1!G$12:Sheet1!$L$12)');
            expect(helper.invoke('getCell', [1, 15]).textContent).toBe('0.547945205');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[15])).toBe('{"value":"0.547945205479452","formula":"=SLOPE(Sheet1!$C$5:Sheet1!$H5, Sheet1!G$12:Sheet1!$L$12)"}');
            done();
        });
        it('SLOPE - Sheets - III', (done: Function) => {
            helper.edit('P3', '=SLOPE(Sheet1!C5:$H$5, Sheet1!$G$12:L12)');
            expect(helper.invoke('getCell', [2, 15]).textContent).toBe('0.547945205');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[15])).toBe('{"value":"0.547945205479452","formula":"=SLOPE(Sheet1!C5:$H$5, Sheet1!$G$12:L12)"}');
            done();
        });
        it('SLOPE - Sheets - IV', (done: Function) => {
            helper.edit('P4', '=SLOPE(C$5:Sheet1!$H5, $K$5:Sheet1!$K$10)');
            expect(1).toBe(1);
            done();
        });
        it('SLOPE - Sheets - V', (done: Function) => {
            helper.edit('P5', '=SLOPE(H$23:Sheet1!H26, Sheet1!G16:G$19)');
            expect(1).toBe(1);
            done();
        });
        it('SLOPE - Sheets - VI', (done: Function) => {
            helper.edit('P6', '=SLOPE(Sheet2!C12:Sheet2!H12, Sheet2!G19:Sheet2!L19)');
            expect(helper.invoke('getCell', [5, 15]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[15])).toBe('{"value":"#DIV/0!","formula":"=SLOPE(Sheet2!C12:Sheet2!H12, Sheet2!G19:Sheet2!L19)"}');
            done();
        });
        it('SLOPE - Sheets - VII', (done: Function) => {
            helper.edit('P7', '=SLOPE(Sheet2!$C$5:Sheet2!$H5, Sheet2!G$12:Sheet2!$L$12)');
            expect(helper.invoke('getCell', [6, 15]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[15])).toBe('{"value":"1","formula":"=SLOPE(Sheet2!$C$5:Sheet2!$H5, Sheet2!G$12:Sheet2!$L$12)"}');
            done();
        });
        it('SLOPE - Sheets - VIII', (done: Function) => {
            helper.edit('P8', '=SLOPE(Sheet2!C$5:$H12, Sheet2!$G$12:L19)');
            expect(helper.invoke('getCell', [7, 15]).textContent).toBe('-0.531844936');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[15])).toBe('{"value":"-0.531844935606087","formula":"=SLOPE(Sheet2!C$5:$H12, Sheet2!$G$12:L19)"}');
            done();
        });
        it('SLOPE - Sheets - IX', (done: Function) => {
            helper.edit('P9', '=SLOPE(D$5:Sheet2!$D10, $E$6:Sheet2!$E$11)');
            expect(1).toBe(1);
            done();
        });
        it('SLOPE - Sheets - X', (done: Function) => {
            helper.edit('P10', '=SLOPE(Sheet2!H$23:H26, Sheet2!G16:G$19)');
            expect(helper.invoke('getCell', [8, 15]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[15])).toBe('{"value":"#REF!","formula":"=SLOPE(D$5:Sheet2!$D10, $E$6:Sheet2!$E$11)"}');
            done();
        });
        it('SLOPE - Sheets - XI', (done: Function) => {
            helper.edit('P11', '=SLOPE(Sheet1!D$5:Sheet2!$D10, Sheet2!$E$6:Sheet1!$E$11)');
            expect(1).toBe(1);
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 10 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [
                    { ranges: [{ dataSource: EJ2_53702_SLOPE_SHEET1 }] },
                    { ranges: [{ dataSource: EJ2_53702_SLOPE_SHEET2 }] }
                ]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('INTERCEPT - Specific Cases - I', (done: Function) => {
            helper.edit('Q1', '=INTERCEPT(,)');
            expect(helper.invoke('getCell', [0, 16]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[16])).toBe('{"value":"#VALUE!","formula":"=INTERCEPT(,)"}');
            done();
        });
        it('INTERCEPT - Direct Value - I', (done: Function) => {
            helper.edit('R1', '=INTERCEPT("{12,-4}", "{-5,19}")');
            expect(helper.invoke('getCell', [0, 17]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[17])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(\\"{12,-4}\\", \\"{-5,19}\\")"}');
            done();
        });
        it('INTERCEPT - Cell reference - I', (done: Function) => {
            helper.edit('S1', '=INTERCEPT(H23:H26, G16:G19)');
            expect(helper.invoke('getCell', [0, 18]).textContent).toBe('-34466.81333');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[18])).toBe('{"value":"-34466.81333333333","formula":"=INTERCEPT(H23:H26, G16:G19)"}');
            done();
        });
        it('INTERCEPT - Cell reference - II', (done: Function) => {
            helper.edit('S2', '=INTERCEPT(C19:C22, G19:G22)');
            expect(helper.invoke('getCell', [1, 18]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[18])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(C19:C22, G19:G22)"}');
            done();
        });
        it('INTERCEPT - Cell reference - III', (done: Function) => {
            helper.edit('S3', '=INTERCEPT(D20:G20, J18:J21)');
            expect(helper.invoke('getCell', [2, 18]).textContent).toBe('-3731');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[18])).toBe('{"value":"-3731","formula":"=INTERCEPT(D20:G20, J18:J21)"}');
            done();
        });
        it('INTERCEPT - Cell reference - IV', (done: Function) => {
            helper.edit('S4', '=INTERCEPT(G18:G21, H20:K20)');
            expect(helper.invoke('getCell', [3, 18]).textContent).toBe('59.55');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[18])).toBe('{"value":"59.55","formula":"=INTERCEPT(G18:G21, H20:K20)"}');
            done();
        });
        it('INTERCEPT - Cell reference - V', (done: Function) => {
            helper.edit('S5', '=INTERCEPT(C5:H5, G12:L12)');
            expect(helper.invoke('getCell', [4, 18]).textContent).toBe('-67.64383562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[18])).toBe('{"value":"-67.64383561643835","formula":"=INTERCEPT(C5:H5, G12:L12)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - I', (done: Function) => {
            helper.edit('N1', '=INTERCEPT(C32:K32, B34:J34)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('28238.03977');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":"28238.03976708604","formula":"=INTERCEPT(C32:K32, B34:J34)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - II', (done: Function) => {
            helper.edit('N2', '=INTERCEPT(L2:L17, M2:M17)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('-0.307635024');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"-0.30763502449281077","formula":"=INTERCEPT(L2:L17, M2:M17)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - III', (done: Function) => {
            helper.edit('N3', '=INTERCEPT(M24:M29, )');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":"#VALUE!","formula":"=INTERCEPT(M24:M29, )"}');
            done();
        });
        it('INTERCEPT - Different datatypes - IV', (done: Function) => {
            helper.edit('N4', '=INTERCEPT(, A2)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[13])).toBe('{"value":"#VALUE!","formula":"=INTERCEPT(, A2)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - V', (done: Function) => {
            helper.edit('N5', '=INTERCEPT(M23:M28, M23:M28)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[13])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(M23:M28, M23:M28)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - VI', (done: Function) => {
            helper.edit('N6', '=INTERCEPT(H27:H30, B28:B31)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('-41.28354828');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[13])).toBe('{"value":"-41.28354828184125","formula":"=INTERCEPT(H27:H30, B28:B31)"}');
            done();
        });
        it('INTERCEPT - Different datatypes - VII', (done: Function) => {
            helper.edit('N7', '=INTERCEPT(A24:M24, A26:M26)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[13])).toBe('{"value":"#NAME?","formula":"=INTERCEPT(A24:M24, A26:M26)"}');
            done();
        });
        it('INTERCEPT - Sheets - I', (done: Function) => {
            helper.edit('P1', '=INTERCEPT(Sheet1!C5:Sheet1!H5, Sheet1!G12:Sheet1!L12)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('-67.64383562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":"-67.64383561643835","formula":"=INTERCEPT(Sheet1!C5:Sheet1!H5, Sheet1!G12:Sheet1!L12)"}');
            done();
        });
        it('INTERCEPT - Sheets - II', (done: Function) => {
            helper.edit('P2', '=INTERCEPT(Sheet1!$C$5:Sheet1!$H5, Sheet1!G$12:Sheet1!$L$12)');
            expect(helper.invoke('getCell', [1, 15]).textContent).toBe('-67.64383562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[15])).toBe('{"value":"-67.64383561643835","formula":"=INTERCEPT(Sheet1!$C$5:Sheet1!$H5, Sheet1!G$12:Sheet1!$L$12)"}');
            done();
        });
        it('INTERCEPT - Sheets - III', (done: Function) => {
            helper.edit('P3', '=INTERCEPT(Sheet1!C5:$H$5, Sheet1!$G$12:L12)');
            expect(helper.invoke('getCell', [2, 15]).textContent).toBe('-67.64383562');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[15])).toBe('{"value":"-67.64383561643835","formula":"=INTERCEPT(Sheet1!C5:$H$5, Sheet1!$G$12:L12)"}');
            done();
        });
        it('INTERCEPT - Sheets - IV', (done: Function) => {
            helper.edit('P4', '=INTERCEPT(Sheet2!C12:Sheet2!H12, Sheet2!G19:Sheet2!L19)');
            expect(helper.invoke('getCell', [3, 15]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[15])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(Sheet2!C12:Sheet2!H12, Sheet2!G19:Sheet2!L19)"}');
            done();
        });
        it('INTERCEPT - Sheets - V', (done: Function) => {
            helper.edit('P5', '=INTERCEPT(Sheet2!$C$5:Sheet2!$H5, Sheet2!G$12:Sheet2!$L$12)');
            expect(helper.invoke('getCell', [4, 15]).textContent).toBe('-147');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[15])).toBe('{"value":"-147","formula":"=INTERCEPT(Sheet2!$C$5:Sheet2!$H5, Sheet2!G$12:Sheet2!$L$12)"}');
            done();
        });
        it('INTERCEPT - Sheets - VI', (done: Function) => {
            helper.edit('P6', '=INTERCEPT(Sheet2!C$5:$H12, Sheet2!$G$12:L19)');
            expect(helper.invoke('getCell', [5, 15]).textContent).toBe('124.7799885');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[15])).toBe('{"value":"124.77998853001691","formula":"=INTERCEPT(Sheet2!C$5:$H12, Sheet2!$G$12:L19)"}');
            done();
        });
        it('INTERCEPT - Sheets - VII', (done: Function) => {
            helper.edit('P7', '=INTERCEPT(Sheet2!H$23:H26, Sheet2!G16:G$19)');
            expect(helper.invoke('getCell', [6, 15]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[15])).toBe('{"value":"#DIV/0!","formula":"=INTERCEPT(Sheet2!H$23:H26, Sheet2!G16:G$19)"}');
            done();
        });
    });

    describe('RSQ formula checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [{ cells: [{ value: '23' }, { value: '56' }, { value: '80000000%' }, { value: '7/11/2015' }, { value: '12:32:00 AM' }, { value: '12:32:00 AM' }] },
                    { cells: [{ value: '234.45556' }, { value: '234' }, { value: '430000%' }, { value: '5/12/2015' }, { value: '11:32:00 AM' }] },
                    { cells: [{ value: '-567.547' }, { value: '235' }, { value: '800%' }, { value: '5/7/2016' }, { value: '12:32:00 PM' }] },
                    { cells: [{ value: '-89' }, { value: '-456' }, { value: '4560%' }, { value: '6/11/2015' }, { value: '1:32:00 AM' }] },
                    { cells: [{ value: '345' }, { value: '56' }, { value: '4550%' }, { value: '6/1/2015' }, { value: '7:32:00 AM' }] },
                    { cells: [{ value: '-34.54' }, { value: '45' }, { value: '6500%' }, { value: '7/12/2015' }, { value: '12:32:00 PM' }] },
                    { cells: [{ value: '139' }, { value: '99' }] }, { cells: [{ value: '-34' }, { value: '7' }] },
                    { cells: [{ value: '-45' }, { value: '-3' }] },
                    { cells: [{ value: '12' }, { value: '2' }] }, { cells: [{ value: 'hello' }, { value: 'world' }] }, { cells: [{ value: 'world' }, { value: 'hello' }] }, { cells: [{ value: '139' }, { value: '23' }] }, { cells: [{ value: '123hello' }, { value: 'sync' }] }, { cells: [{ value: '98' }, { value: '23' }] }, { cells: [{ value: 'are' }, { value: 'fusion' }] }]
                },
                {
                    rows: [{ cells: [{ value: '23' }, { value: '56' }, { value: '80000000%' }, { value: '7/11/2015' }, { value: '12:32:00 AM' }, { value: '12:32:00 AM' }] },
                    { cells: [{ value: '234.45556' }, { value: '234' }, { value: '430000%' }, { value: '5/12/2015' }, { value: '11:32:00 AM' }] },
                    { cells: [{ value: '-567.547' }, { value: '235' }, { value: '800%' }, { value: '5/7/2016' }, { value: '12:32:00 PM' }] },
                    { cells: [{ value: '-89' }, { value: '-456' }, { value: '4560%' }, { value: '6/11/2015' }, { value: '1:32:00 AM' }] },
                    { cells: [{ value: '345' }, { value: '56' }, { value: '4550%' }, { value: '6/1/2015' }, { value: '7:32:00 AM' }] },
                    { cells: [{ value: '-34.54' }, { value: '45' }, { value: '6500%' }, { value: '7/12/2015' }, { value: '12:32:00 PM' }] },
                    { cells: [{ value: '139' }, { value: '99' }] }, { cells: [{ value: '-34' }, { value: '7' }] },
                    { cells: [{ value: '-45' }, { value: '-3' }] },
                    { cells: [{ value: '12' }, { value: '2' }] }, { cells: [{ value: 'hello' }, { value: 'world' }] }, { cells: [{ value: 'world' }, { value: 'hello' }] }, { cells: [{ value: '139' }, { value: '23' }] }, { cells: [{ value: '123hello' }, { value: 'sync' }] }, { cells: [{ value: '98' }, { value: '23' }] }, { cells: [{ value: 'are' }, { value: 'fusion' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('RSQ formula with basic case checking', (done: Function) => {
            helper.edit('I1', '=RSQ(A1:A5,B1:B5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.001575552');
            helper.edit('I2', '=RSQ(A1:A5,B6:B10)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('0.140267298');
            helper.edit('I3', '=RSQ(A7:A12,B7:B12)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('0.916444193');
            helper.edit('I4', '=RSQ(A10:A12,B10:B12)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#DIV/0!');
            helper.edit('I5', '=RSQ(A10,B2)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#DIV/0!');
            helper.edit('I6', '=RSQ(A1:A5,B1:B6)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#N/A');
            done();
        });
        it('RSQ formula with percentage format', (done: Function) => {
            helper.edit('I7', '=RSQ(C1:C3,C4:C6)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('0.25017859');
            done();
        });
        it('RSQ formula with date format', (done: Function) => {
            helper.edit('I8', '=RSQ(D1:D3,D4:D6)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('0.99355548');
            done();
        });
        it('RSQ formula with time format', (done: Function) => {
            helper.edit('I9', '=RSQ(E1:E3,E4:E6)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('0.851214575');
            done();
        });
        it('RSQ formula with percentage format', (done: Function) => {
            helper.edit('I7', '=RSQ(C1:C3,C4:C6)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('0.25017859');
            done();
        });
        it('sheet referrence check', (done: Function) => {
            helper.edit('J1', '=RSQ(Sheet1!A2:Sheet1!A5,Sheet1!B2:Sheet1!B5)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('0.001856987');
            helper.edit('J2', '=RSQ(Sheet1!A3:Sheet1!A6,Sheet1!B3:Sheet1!B6)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0.065558236');
            done();
        });
        it('absolute sheet referrence check', (done: Function) => {
            helper.edit('J3', '=RSQ(Sheet1!$A$2:Sheet1!$A$5,Sheet1!$B$2:Sheet1!$B$5)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0.001856987');
            done();
        });
        it('external sheet referrence check', (done: Function) => {
            helper.edit('J4', '=RSQ(Sheet1!A2:Sheet1!A5,Sheet2!B2:Sheet2!B5)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0.001856987');
            helper.edit('J5', '=RSQ(Sheet1!A3:Sheet1!A6,Sheet2!B3:Sheet2!B6)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0.065558236');
            done();
        });
        it('external sheet absolute referrence ', (done: Function) => {
            helper.edit('J6', '=RSQ(Sheet1!$A$2:Sheet1!$A$5,Sheet2!$B$2:Sheet2!$B$5)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0.001856987');
            helper.edit('J7', '=RSQ(Sheet1!$A$3:Sheet1!$A$6,Sheet2!$B$3:Sheet2!$B$6)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.065558236');
            done();
        });
        it('RSQ formula with multiple column as input', function (done) {
            helper.edit('J8', '=RSQ(A1:B5,A6:B10)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('0.28186104');
            helper.edit('J9', '=RSQ(A1:B5,A6:A15)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0.136777246');
            done();
        });
        it('RSQ formula with 1 and #DIV/0! as result', function (done) {
            helper.edit('J10', '=RSQ(A11:A16,B11:B16)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1');
            helper.edit('J11', '=RSQ(A10:A12,B10:B12)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#DIV/0!');
            done();
        });
    });

    describe('Resolve the issues reported on GEOMEAN formula -> ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('applying reported formula issue in GEOMEAN', (done: Function) => {
            helper.edit('I5', '=GEOMEAN(4,9)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('6');
            helper.edit('I2', '=GEOMEAN(H2:H5)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('30.83913178');
            helper.edit('I3', '=GEOMEAN(G2:G5)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('4.429606853');
            done();
        });
        it('applying extra found formula issues in GEOMEAN', (done: Function) => {
            helper.edit('I6', '=GEOMEAN(12,23,)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#NUM!');
            helper.edit('I7', '=GEOMEAN(12,,23)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#NUM!');
            helper.edit('I8', '=GEOMEAN(12,34,"hello")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            helper.edit('I9', '=GEOMEAN(G2:G10)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('6.046997085');
            helper.edit('G4', 'TRUE');
            helper.edit('I10', '=GEOMEAN(G2:G10)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('5.937381762');
            helper.edit('A2', 'FALSE');
            helper.edit('I11', '=GEOMEAN(23,34,A2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('27.96426291');
            helper.edit('I12', '=GEOMEAN(12,23,"45",22)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('22.86315018');
            helper.edit('I13', '=GEOMEAN(23,34,IF(2>1,"22",44))');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('25.81525849');
            helper.edit('I14', '=GEOMEAN(-34)');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('#NUM!');
            helper.edit('I15', '=GEOMEAN(0)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#NUM!');
            helper.edit('I16', '=GEOMEAN(,)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('#NUM!');
            done();
        });
    });

    describe('Sheet References Checking for GEOMEAN -> ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '8529.22' }] },
                    { cells: [{ value: '17866.19' }] }, { cells: [{ value: '13853.09' }] }, { cells: [{ value: '2338.74' }] },
                    { cells: [{ value: '9578.45' }] }, { cells: [{ value: '19141.62' }] }, { cells: [{ value: '6543.3' }] }, { cells: [{ value: '13035.06' }] },
                    { cells: [{ value: '18488.8' }] }, { cells: [{ value: '12317.04' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('GEOMEAN Formula with absolute cell references -> ', (done: Function) => {
            helper.edit('I2', '=GEOMEAN($G$2:$G$9)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('5.550531522');
            helper.edit('I3', '=GEOMEAN($G$2,$G$3,G4)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('3.27106631');
            helper.edit('I4', '=GEOMEAN($G$2,$G$3,TRUE,G4)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('2.432299279');
            helper.edit('I5', '=GEOMEAN($G$6,$G$3,K2,1276.54)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('39.96392581');
            done();
        });
        it('GEOMEAN Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('I6', '=GEOMEAN(Sheet2!A3,Sheet1!G2,Sheet2!$A$6)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('642.4536222');
            helper.edit('I7', '=GEOMEAN(Sheet2!A3:Sheet2!A9,Sheet2!$A$6,4566.45)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('9780.322336');
            helper.edit('I8', '=GEOMEAN(Sheet1!G3,Sheet1!G2,TRUE,Sheet2!$A$4)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('10.39891401');
            helper.edit('I9', '=GEOMEAN(Sheet2!A3:Sheet2!A9,)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#NUM!');
            done();
        });
        it('GEOMEAN Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('I10', '=GEOMEAN(Sheet2!$A$3,Sheet1!$G$2,Sheet1!G5)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('53.41293552');
            helper.edit('I11', '=GEOMEAN(Sheet2!$A$3:Sheet2!$A$9)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('9907.084654');
            helper.edit('I12', '=GEOMEAN(Sheet1!$G$3,Sheet1!$G$2,TRUE,Sheet1!G5)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('2.723269815');
            helper.edit('I13', '=GEOMEAN(Sheet2!$A$3:Sheet2!$A$9,)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#NUM!');
            done();
        });
    });

    describe('Reported LARGE-SMALL Formulae - Checking II ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: reportedBugData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('LARGE formula with cell Reference - 1->', (done: Function) => {
            helper.edit('L1', '=LARGE(B27:E27,B27)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('2.43');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":2.43,"formula":"=LARGE(B27:E27,B27)"}');
            done();
        });
        it('LARGE formula with cell Reference - 2->', (done: Function) => {
            helper.edit('L2', '=LARGE(F30:F36,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"#NUM!","formula":"=LARGE(F30:F36,3)"}');
            done();
        });
        it('LARGE formula with cell Reference - 3->', (done: Function) => {
            helper.edit('L3', '=LARGE(B29:B38,5)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":0,"formula":"=LARGE(B29:B38,5)"}');
            done();
        });
        it('LARGE formula with cell Reference - 4->', (done: Function) => {
            helper.edit('L4', '=LARGE(D12:D17,2)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"#NUM!","formula":"=LARGE(D12:D17,2)"}');
            done();
        });
        it('LARGE formula with cell Reference - 5->', (done: Function) => {
            helper.edit('L5', '=LARGE(C23:C27,D22)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(C23:C27,D22)"}');
            done();
        });
        it('LARGE formula with cell Reference - 6->', (done: Function) => {
            helper.edit('L6', '=LARGE(A28:F28,D22)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(A28:F28,D22)"}');
            done();
        });
        it('LARGE formula with cell Reference - 7->', (done: Function) => {
            helper.edit('L7', '=LARGE(D22:D23,2)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":"#NUM!","formula":"=LARGE(D22:D23,2)"}');
            done();
        });
        it('LARGE formula with cell Reference - 8->', (done: Function) => {
            helper.edit('L8', '=LARGE(D5:D11,"one")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(D5:D11,\\"one\\")"}');
            done();
        });
        it('LARGE formula with cell Reference - 9->', (done: Function) => {
            helper.edit('L9', '=LARGE(C23:C26,B16)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":4,"formula":"=LARGE(C23:C26,B16)"}');
            done();
        });
        it('LARGE formula with cell Reference - 10->', (done: Function) => {
            helper.edit('L10', '=LARGE(C25:C28,B24)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(C25:C28,B24)"}');
            done();
        });
        it('LARGE formula with cell Reference - 11->', (done: Function) => {
            helper.edit('L11', '=LARGE(D3:D11,TRUE)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[11])).toBe('{"value":50,"formula":"=LARGE(D3:D11,TRUE)"}');
            done();
        });
        it('LARGE formula with cell Reference - 12->', (done: Function) => {
            helper.edit('L12', '=LARGE(C24:C29,"TRUE")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(C24:C29,\\"TRUE\\")"}');
            done();
        });
        it('LARGE formula with cell Reference - 13->', (done: Function) => {
            helper.edit('L13', '=LARGE(H3:H11,"FALSE")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(H3:H11,\\"FALSE\\")"}');
            done();
        });
        it('LARGE formula with cell Reference - 14->', (done: Function) => {
            helper.edit('L14', '=LARGE(H5:H11," ")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(H5:H11,\\" \\")"}');
            done();
        });
        it('LARGE formula with cell Reference - 15->', (done: Function) => {
            helper.edit('L15', '=LARGE(E2:E6,B16)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[11])).toBe('{"value":30,"formula":"=LARGE(E2:E6,B16)"}');
            done();
        });
        it('LARGE formula with cell Reference - 16->', (done: Function) => {
            helper.edit('L16', '=LARGE(,)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[11])).toBe('{"value":"#NUM!","formula":"=LARGE(,)"}');
            done();
        });
        it('LARGE formula with cell Reference - 17->', (done: Function) => {
            helper.edit('L17', '=LARGE(E15:E18,2)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[11])).toBe('{"value":"#NAME?","formula":"=LARGE(E15:E18,2)"}');
            done();
        });
        it('LARGE formula with cell Reference - 18->', (done: Function) => {
            helper.edit('L18', '=LARGE(C14:C17,C18)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(C14:C17,C18)"}');
            done();
        });
        it('LARGE formula with cell Reference - 19->', (done: Function) => {
            helper.edit('L19', '=LARGE(C23:C28,C22)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(C23:C28,C22)"}');
            done();
        });
        it('LARGE formula with cell Reference - 20->', (done: Function) => {
            helper.edit('L20', '=LARGE(Hello,"hi")');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[11])).toBe('{"value":"#NAME?","formula":"=LARGE(Hello,\\"hi\\")"}');
            done();
        });
        it('LARGE formula with cell Reference - 21->', (done: Function) => {
            helper.edit('L21', '=LARGE("hello",hi)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[11])).toBe('{"value":"#VALUE!","formula":"=LARGE(\\"hello\\",hi)"}');
            done();
        });
        it('SMALL formula with cell Reference - 2->', (done: Function) => {
            helper.edit('M2', '=SMALL(F30:F36,3)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":"#NUM!","formula":"=SMALL(F30:F36,3)"}');
            done();
        });
        it('SMALL formula with cell Reference - 4->', (done: Function) => {
            helper.edit('M4', '=SMALL(D12:D17,2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":"#NUM!","formula":"=SMALL(D12:D17,2)"}');
            done();
        });
        it('SMALL formula with cell Reference - 5->', (done: Function) => {
            helper.edit('M5', '=SMALL(C23:C27,D22)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(C23:C27,D22)"}');
            done();
        });
        it('SMALL formula with cell Reference - 6->', (done: Function) => {
            helper.edit('M6', '=SMALL(A28:F28,D22)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(A28:F28,D22)"}');
            done();
        });
        it('SMALL formula with cell Reference - 7->', (done: Function) => {
            helper.edit('M7', '=SMALL(D22:D23,2)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"#NUM!","formula":"=SMALL(D22:D23,2)"}');
            done();
        });
        it('SMALL formula with cell Reference - 8->', (done: Function) => {
            helper.edit('M8', '=SMALL(D5:D11,"one")');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(D5:D11,\\"one\\")"}');
            done();
        });
        it('SMALL formula with cell Reference - 9->', (done: Function) => {
            helper.edit('M9', '=SMALL(C23:C26,B16)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":1,"formula":"=SMALL(C23:C26,B16)"}');
            done();
        });
        it('SMALL formula with cell Reference - 10->', (done: Function) => {
            helper.edit('M10', '=SMALL(C25:C28,B24)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(C25:C28,B24)"}');
            done();
        });
        it('SMALL formula with cell Reference - 11->', (done: Function) => {
            helper.edit('M11', '=SMALL(D3:D11,TRUE)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('15');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":15,"formula":"=SMALL(D3:D11,TRUE)"}');
            done();
        });
        it('SMALL formula with cell Reference - 12->', (done: Function) => {
            helper.edit('M12', '=SMALL(C24:C29,"TRUE")');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(C24:C29,\\"TRUE\\")"}');
            done();
        });
        it('SMALL formula with cell Reference - 13->', (done: Function) => {
            helper.edit('M13', '=SMALL(H3:H11,"FALSE")');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(H3:H11,\\"FALSE\\")"}');
            done();
        });
        it('SMALL formula with cell Reference - 14->', (done: Function) => {
            helper.edit('M14', '=SMALL(H5:H11," ")');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(H5:H11,\\" \\")"}');
            done();
        });
        it('SMALL formula with cell Reference - 15->', (done: Function) => {
            helper.edit('M15', '=SMALL(E2:E6,B16)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('6.5E-08');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[12])).toBe('{"value":"0.000000065","formula":"=SMALL(E2:E6,B16)"}');
            done();
        });
        it('SMALL formula with cell Reference - 16->', (done: Function) => {
            helper.edit('M16', '=SMALL(,)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[12])).toBe('{"value":"#NUM!","formula":"=SMALL(,)"}');
            done();
        });
        it('SMALL formula with cell Reference - 17->', (done: Function) => {
            helper.edit('M17', '=SMALL(E15:E18,2)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[12])).toBe('{"value":"#NAME?","formula":"=SMALL(E15:E18,2)"}');
            done();
        });
        it('SMALL formula with cell Reference - 18->', (done: Function) => {
            helper.edit('M18', '=SMALL(C14:C17,C18)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(C14:C17,C18)"}');
            done();
        });
        it('SMALL formula with cell Reference - 19->', (done: Function) => {
            helper.edit('M19', '=SMALL(C23:C28,C22)');
            expect(helper.invoke('getCell', [18, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(C23:C28,C22)"}');
            done();
        });
        it('SMALL formula with cell Reference - 20->', (done: Function) => {
            helper.edit('M20', '=SMALL(Hello,"hi")');
            expect(helper.invoke('getCell', [19, 12]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[12])).toBe('{"value":"#NAME?","formula":"=SMALL(Hello,\\"hi\\")"}');
            done();
        });
        it('SMALL formula with cell Reference - 21->', (done: Function) => {
            helper.edit('M21', '=SMALL("hello",hi)');
            expect(helper.invoke('getCell', [20, 12]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[12])).toBe('{"value":"#VALUE!","formula":"=SMALL(\\"hello\\",hi)"}');
            done();
        });
    });

    describe('Formula - Checking VI ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SMALL Formula ->', (done: Function) => {
            helper.edit('J1', '=SMALL(D2:D11,2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('15');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":15,"formula":"=SMALL(D2:D11,2)"}');
            done();
        });
        it('SMALL Formula II ->', (done: Function) => {
            helper.edit('J2', '=SMALL(D2:H11,25)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":20,"formula":"=SMALL(D2:H11,25)"}');
            done();
        });
        it('SMALL Formula with no inputs ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SMALL()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SMALL()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J3', '=SMALL(A2,1)');
            done();
        });
        it('SMALL Formula with cell having string ->', (done: Function) => {
            helper.edit('J4', '=SMALL(A2,1)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"#NUM!","formula":"=SMALL(A2,1)"}');
            done();
        });
        it('SMALL Formula with number as 0 ->', (done: Function) => {
            helper.edit('J5', '=SMALL(D2:H11,0)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"#NUM!","formula":"=SMALL(D2:H11,0)"}');
            done();
        });
        it('SMALL Formula with number as alphabet ->', (done: Function) => {
            helper.edit('J6', '=SMALL(D2:D11,a)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"#NAME?","formula":"=SMALL(D2:D11,a)"}');
            done();
        });
        it('SMALL Formula with number greater than array value ->', (done: Function) => {
            helper.edit('J7', '=SMALL(D2:H11,52)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NUM!","formula":"=SMALL(D2:H11,52)"}');
            done();
        });
        it('LARGE Formula ->', (done: Function) => {
            helper.edit('K1', '=LARGE(D2:D11,2)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('41');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":41,"formula":"=LARGE(D2:D11,2)"}');
            done();
        });
        it('LARGE Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LARGE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LARGE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K2', '=SMALL(A2,1)');
            done();
        });
        it('LARGE Formula with cell having string->', (done: Function) => {
            helper.edit('K3', '=LARGE(A2,1)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"#NUM!","formula":"=LARGE(A2,1)"}');
            done();
        });
        it('LARGE Formula with cell having number value as string->', (done: Function) => {
            helper.edit('K4', '=LARGE(D2:D11,a)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NAME?","formula":"=LARGE(D2:D11,a)"}');
            done();
        });
        it('CHOOSE Formula with as cell Referenced value->', (done: Function) => {
            helper.edit('K5', '=CHOOSE(D2:D2,"10","20")');
            expect(helper.getInstance().sheets[0].rows[4].cells[10].formula).toBe('=CHOOSE(D2:D2,"10","20")');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#VALUE!');
            done();
        });
    });

    describe('EJ2-62007 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Issue in applying large formula in sheet.', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('updateCell', [{ formula: '=LARGE(A1:B100,4)' }, 'J3']);
            expect(parseInt(spreadsheet.sheets[0].rows[2].cells[9].value)).toEqual(41847);
            done();
        });
    });

    describe('MEDIAN Formula Checking', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'True' }] },
                        { cells: [{ index: 8, value: 'True' }] }, { cells: [{ index: 8, value: 'False' }] },
                        { cells: [{ index: 8, value: 'False' }] }, { cells: [{ index: 8, value: '103.32' }] },
                        { cells: [{ index: 8, value: '105.36' }] }, { cells: [{ index: 8, value: '-3221' }] },
                        { cells: [{ index: 8, value: '-123' }] }, { cells: [{ index: 8, value: '0' }] },
                        { cells: [{ index: 8, value: '""' }] }, { cells: [{ index: 8, value: 'Hello123' }] },
                        { cells: [{ index: 8, value: '124Hello' }] }, { cells: [{ index: 8, value: '@' }] },
                        { cells: [{ index: 8, value: '"32"' }] }, { cells: [{ index: 8, value: '"3"' }] },
                        { cells: [{ index: 8, value: '#VALUE!' }] }, { cells: [{ index: 8, value: '#NAME?' }] },
                        { cells: [{ index: 8, value: '#DIV/0!' }] }, { cells: [{ index: 8, value: '#NUM!' }] },]
                }, {
                    rows: [
                        { cells: [{ value: '10' }] }, { cells: [{ value: '20' }] }, { cells: [{ value: '25' }] },
                        { cells: [{ value: '30' }] }, { cells: [{ value: '32' }] }, { cells: [{ value: '35' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Median Formula with cell refernces as arguments ->', (done: Function) => {
            helper.edit('J1', '=MEDIAN(E2:E11)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('17.5');
            helper.edit('J2', '=MEDIAN(E2:E10)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            helper.edit('J3', '=MEDIAN(F4)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('300');
            helper.edit('J4', '=MEDIAN(D2:D9,E6,H4,G9)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('20');
            helper.edit('J5', '=MEDIAN(A3:A10)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#NUM!');
            helper.edit('J6', '=MEDIAN(I2:I5)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('#NUM!');
            helper.edit('J7', '=MEDIAN(I6:I7)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('104.34');
            done();
        });
        it('Median Formula with basic inputs as arguments->', (done: Function) => {
            helper.edit('J8', '=MEDIAN(5,3,2,7,6)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('5');
            helper.edit('J9', '=MEDIAN(5,3,2,7,6,1)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('4');
            helper.edit('J10', '=MEDIAN(D4,E4,E6,F8,G7)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('15');
            helper.edit('J11', '=MEDIAN(D4,D5,D7,E6,E5,G6)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('17.5');
            helper.edit('J12', '=MEDIAN("1","100","200",10)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('55');
            helper.edit('J13', '=MEDIAN(I8:I10)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('-123');
            helper.edit('J14', '=MEDIAN(I10,1)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0.5');
            helper.edit('J15', '=MEDIAN(1)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('1');
            done();
        });
        it('MEdian Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J16');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MEDIAN()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MEDIAN()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J16', '=MEDIAN(1)');
            helper.edit('J17', '=MEDIAN("")');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('#VALUE!');
            helper.edit('J18', '=MEDIAN(" ")');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('Median Formula with empty arguments->', (done: Function) => {
            helper.edit('K1', '=MEDIAN(,)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            helper.edit('K2', '=MEDIAN(5,)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2.5');
            helper.edit('K3', '=MEDIAN(3,6,9,2,)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('3');
            helper.edit('K4', '=MEDIAN(1,,,0)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('0');
            helper.edit('K5', '=MEDIAN(3,6,9,2,)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('3');
            done();
        });
        it('Median Formula with Text and empty cell references as inputs->', (done: Function) => {
            helper.edit('K6', '=MEDIAN(A2:A7)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#NUM!');
            helper.edit('K7', '=MEDIAN(F2:F15)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('305');
            done();
        });
        it('Median Formula with Zero value as inputs->', (done: Function) => {
            helper.edit('K8', '=MEDIAN(0)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('0');
            helper.edit('K9', '=MEDIAN(,0)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('0');
            done();
        });
        it('Median Formula with Text value as inputs->', (done: Function) => {
            helper.edit('K10', '=MEDIAN("32","24",12)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('24');
            helper.edit('K11', '=MEDIAN("Hello","true")');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#VALUE!');
            helper.edit('K12', '=MEDIAN(I15:I16)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('#NUM!');
            done();
        });
        it('Median Formula with logical value as inputs->', (done: Function) => {
            helper.edit('L1', '=MEDIAN(TRUE,FALSE)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('0.5');
            helper.edit('L2', '=MEDIAN(FALSE)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('0');
            helper.edit('L3', '=MEDIAN(FALSE,true,TRUE,FALSE,false)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('0');
            helper.edit('L4', '=MEDIAN(TRUE,TRUE,TRUE,FALSE)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('1');
            helper.edit('L5', '=MEDIAN(TRUE,32)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('16.5');
            helper.edit('L6', '=MEDIAN("TRUE","FALSE","TRUE")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('#VALUE!');
            helper.edit('L7', '=MEDIAN("FALSE","HI",32)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('#VALUE!');
            helper.edit('L8', '=MEDIAN(I2)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#NUM!');
            helper.edit('L9', '=MEDIAN(I4)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#NUM!');
            helper.edit('L10', '=MEDIAN(I2,I4,I3,I5,G6)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('10');
            helper.edit('L11', '=MEDIAN(I2:I5)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#NUM!');
            done();
        });
        it('MEDIAN Formula with Error values as arguments->', (done: Function) => {
            helper.edit('L12', '=MEDIAN(I17:I20)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=MEDIAN(I18:I20)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#NAME?');
            helper.edit('L14', '=MEDIAN(I19:I20)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#DIV/0!');
            helper.edit('L15', '=MEDIAN(I20:I21)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#NUM!');
            done();
        });
        it('MEDIAN Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=MEDIAN($G$5,$G$8)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('7');
            helper.edit('M2', '=MEDIAN($F$2:$F$11)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('305');
            helper.edit('M3', '=MEDIAN($D$3,$E$6,$F$2:$F$8,$H$3,$H$8)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('200');
            helper.edit('M4', '=MEDIAN($G$3:$G$9,E6)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('8.5');
            helper.edit('M5', '=MEDIAN(D3:D9,$E$6)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('20');
            done();
        });
        it('MEDIAN Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M6', '=MEDIAN(Sheet2!A1:A8)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('31');
            helper.edit('M7', '=MEDIAN(Sheet2!A1,Sheet2!A8)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('26');
            helper.edit('M8', '=MEDIAN(Sheet2!B3:B8,Sheet2!A4,Sheet2!A6,Sheet2!A2)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('30');
            helper.edit('M9', '=MEDIAN(Sheet2!A1:A6,Sheet1!F2:F6)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('35');
            helper.edit('M10', '=MEDIAN(Sheet2!A1:A6,Sheet1!F6)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('30');
            helper.edit('M11', '=MEDIAN(Sheet1!F2:F10,Sheet1!G5)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('300');
            done();
        });
        it('MEDIAN Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M12', '=MEDIAN(Sheet2!$A$1:$A$6)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('27.5');
            helper.edit('M13', '=MEDIAN($G$2:$G$10,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('8.5');
            helper.edit('M14', '=MEDIAN(Sheet2!$A$1,Sheet2!$A$8)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('26');
            helper.edit('M15', '=MEDIAN(Sheet2!$B$6:$B$8,Sheet2!$A$4,Sheet2!$A$6,Sheet2!A2)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('30');
            helper.edit('M16', '=MEDIAN(Sheet2!$A$4:$A$6,Sheet1!$F$2:$F$6)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('250');
            helper.edit('M17', '=MEDIAN(Sheet1!$F$3:$F$10,Sheet1!$G$5)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('300');
            done();
        });
    });

    describe('COUNTBLANK Formula Checking ->', () => {
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
        it('COUNTBLANK Formula with range as argument ->', (done: Function) => {
            helper.edit('J1', '=COUNTBLANK(A2:A12)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('1');
            helper.edit('J2', '=COUNTBLANK(D2:D13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('2');
            helper.edit('J3', '=COUNTBLANK(M2:M10)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('9');
            done();
        });
        it('COUNTBLANK Formula with single range as argument ->', (done: Function) => {
            helper.edit('J4', '=COUNTBLANK(B8)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=COUNTBLANK(A8)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            helper.edit('J6', '=COUNTBLANK(P8)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('1');
            done();
        });
        it('COUNTBLANK Formula with worst case value as argument->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTBLANK()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTBLANK()';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J7', '=COUNTBLANK(B2:B10)');
            spreadsheet.selectRange('J8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTBLANK("")';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTBLANK("")';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog2.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J8', '=COUNTBLANK(B2:B10)');
            spreadsheet.selectRange('J9');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTBLANK(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTBLANK(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog3: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog3.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J9', '=COUNTBLANK(B2:B10)');
            spreadsheet.selectRange('J10');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTBLANK(H4,F7)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTBLANK(H4,F7)';
            helper.triggerKeyNativeEvent(13);
            const dialog4: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog4.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J10', '=COUNTBLANK(B2:B10))');
            spreadsheet.selectRange('J11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=COUNTBLANK(H3:H10,F3:F9)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=COUNTBLANK(H3:H10,F3:F9)';
            helper.triggerKeyNativeEvent(13);
            const dialog5: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog5.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J11', '=COUNTBLANK(B2:B10)');
            done();
        });
        it('COUNTBLANK Formula with different range value of argument->', (done: Function) => {
            helper.edit('J12', '=COUNTBLANK(A2:A12)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('1');
            helper.edit('J13', '=COUNTBLANK(B3:B13)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('2');
            helper.edit('J14', '=COUNTBLANK(C3:C11)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('0');
            helper.edit('J15', '=COUNTBLANK(I2:I5)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('0');
            helper.edit('J16', '=COUNTBLANK(I15:I16)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('0');
            helper.edit('J17', '=COUNTBLANK(I17:I18)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('0');
            helper.edit('J18', '=COUNTBLANK(I19:I20)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('0');
            helper.edit('J19', '=COUNTBLANK(I2:I20)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('0');
            helper.edit('J20', '=COUNTBLANK(A2:I15)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('32');
            done();
        });
        it('COUNTBLANK Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('K1', '=COUNTBLANK($A$5:$A$14)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('3');
            helper.edit('K2', '=COUNTBLANK($D$6:$G$14)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('12');
            helper.edit('K3', '=COUNTBLANK($M$7)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('1');
            done();
        });
        it('COUNTBLANK Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('K4', '=COUNTBLANK(Sheet2!A1:A11)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('2');
            helper.edit('K5', '=COUNTBLANK(Sheet2!A10)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('1');
            helper.edit('K6', '=COUNTBLANK(Sheet1!A2:A10)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('0');
            helper.edit('K7', '=COUNTBLANK(Sheet1!A2)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('0');
            done();
        });
        it('COUNTBLANK Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('K8', '=COUNTBLANK(Sheet1!$C$2:$C$12)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('1');
            helper.edit('K9', '=COUNTBLANK(Sheet1!$D$2)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('0');
            helper.edit('K10', '=COUNTBLANK(Sheet2!$A$2:$A$12)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('3');
            helper.edit('K11', '=COUNTBLANK(Sheet2!$A$6)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('0');
            done();
        });
    });

    // Text Category Formulas
    describe('Reported FIND Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('FIND formula with specific cases - 1->', (done: Function) => {
            helper.edit('I1', '=FIND( , )');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=FIND( , )"}');
            done();
        });
        it('FIND formula with specific cases - 2->', (done: Function) => {
            helper.edit('I2', '=FIND(,)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"1","formula":"=FIND(,)"}');
            done();
        });
        it('FIND formula with difference cases - 1->', (done: Function) => {
            helper.edit('J1', '12:00:00 AM');
            helper.edit('J2', '"12/3/2001"');
            helper.edit('I3', '=FIND(J1,J2)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"8","formula":"=FIND(J1,J2)"}');
            done();
        });
        it('FIND formula with difference cases - 2->', (done: Function) => {
            helper.edit('J1', '2*7');
            helper.edit('I3', '=FIND("2*7", J1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"1","formula":"=FIND(\\"2*7\\", J1)"}');
            done();
        });
        it('FIND formula with difference cases - 3->', (done: Function) => {
            helper.edit('J1', '"2*7"');
            helper.edit('I3', '=FIND("2*7", J1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"2","formula":"=FIND(\\"2*7\\", J1)"}');
            done();
        });
        it('FIND formula with difference cases - 4->', (done: Function) => {
            helper.edit('J1', '98');
            helper.edit('J2', '15-12');
            helper.edit('I3', '=FIND(J1,"32039820",J2)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#VALUE!","formula":"=FIND(J1,\\"32039820\\",J2)"}');
            done();
        });
        it('FIND formula with difference cases - 5->', (done: Function) => {
            helper.edit('J1', '"98"');
            helper.edit('J2', '15-12');
            helper.edit('I3', '=FIND(J1,"32039820",J2)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#VALUE!","formula":"=FIND(J1,\\"32039820\\",J2)"}');
            done();
        });
        it('FIND formula with normal value - 1->', (done: Function) => {
            helper.edit('I1', '=FIND("ele","#NUM!")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=FIND(\\"ele\\",\\"#NUM!\\")"}');
            done();
        });
        it('FIND formula with normal value - 2->', (done: Function) => {
            helper.edit('I2', '=FIND(,)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"1","formula":"=FIND(,)"}');
            done();
        });
        it('FIND formula with normal value - 3->', (done: Function) => {
            helper.edit('I2', '=FIND("2","10""1-2")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"6","formula":"=FIND(\\"2\\",\\"10\\"\\"1-2\\")"}');
            done();
        });
        it('FIND formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '"FALSE"');
            helper.edit('J2', 'FALSE');
            helper.edit('J3', '"TRUE"');
            helper.edit('J4', '" "');
            helper.edit('J5', '"     "');
            helper.edit('J6', '""');
            helper.edit('J8', '""      ""');
            helper.edit('J7', '=FIND(J1,J2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=FIND(J1,J2)"}');
            done();
        });
        it('FIND formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=FIND("""",J3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"1","formula":"=FIND(\\"\\"\\"\\",J3)"}');
            done();
        });
        it('FIND formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=FIND(J4,J5)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=FIND(J4,J5)"}');
            done();
        });
        it('FIND formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=FIND(J6,J8,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('9');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"9","formula":"=FIND(J6,J8,3)"}');
            done();
        });
    });

    describe('Reported CONCATENATE formula - Checking -> I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: 'School Office "YG"' }] }, { cells: [{ value: '/"Hi"/' }] }, { cells: [{ value: '@' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CONCATENATE formula with cell Reference - 0->', (done: Function) => {
            helper.edit('H14', '"07-JUN"');
            helper.edit('J20', '6728');
            helper.invoke('numberFormat', [getFormatFromType('Accounting'), 'J20']);
            helper.edit('L17', '.10,23, 100');
            helper.edit('C11', '6/23/2014');
            helper.edit('C12', '92');
            helper.edit('F14', '6/7/2024');
            helper.edit('G15', '');
            helper.edit('H15', '"     "');
            helper.edit('K14', '12:00:00 AM');
            helper.edit('F4', '#DIV/0!');
            helper.edit('H13', '"03/04/2023"');
            helper.edit('F13', '3/4/2023');
            helper.edit('I3', '"TRUE"');
            helper.edit('I2', 'TRUE');
            helper.edit('I5', 'FALSE');
            helper.edit('C2', 'p');
            helper.edit('D3', '"65"');
            helper.edit('C19', 'All');
            helper.edit('B11', 'Flip- Flops & Slippers');
            helper.edit('H21', 'San deigo, CA');
            helper.edit('B12', '70');
            helper.edit('E3', '"98"');
            helper.edit('E7', '$4');
            helper.edit('C6', '-6');
            helper.edit('C7', '-7');
            helper.edit('I6', '"FALSE"');
            helper.edit('I7', 'True');
            helper.edit('E22', '');
            helper.edit('C15', '$hello');
            helper.edit('H16', '""      ""');
            helper.edit('L19', '{"Hel", "Lo", 1, 2}');
            helper.edit('B15', 'School Office "YG"');
            helper.edit('M10', '/"Hi"/');
            helper.edit('J6', '@');
            helper.edit('J15', '1:45:00 PM');
            done();
        });
        it('CONCATENATE formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"TRUE","formula":"=CONCATENATE(TRUE)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"FALSE","formula":"=CONCATENATE(FALSE)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(5.567+9.45)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('15.017');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"15.017","formula":"=CONCATENATE(5.567+9.45)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H14, J20)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"6728');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"6728","formula":"=CONCATENATE(H14, J20)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(12.45, "{1,2,3}")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('12.45{1,2,3}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"12.45{1,2,3}","formula":"=CONCATENATE(12.45, \\"{1,2,3}\\")"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(AL123, "34")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"34","formula":"=CONCATENATE(AL123, \\"34\\")"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(TRUE + FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCATENATE(TRUE + FALSE)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(FALSE + FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCATENATE(FALSE + FALSE)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(TRUE + TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"2","formula":"=CONCATENATE(TRUE + TRUE)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(L17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('.10,23, 100');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":".10,23, 100","formula":"=CONCATENATE(L17)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(C11+H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(C11+H14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(C12+F14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('45542');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"45542","formula":"=CONCATENATE(C12+F14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(G15, H15, K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"     "0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"     \\"0","formula":"=CONCATENATE(G15, H15, K14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(F4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#DIV/0!","formula":"=CONCATENATE(F4)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 15->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H13, F14, F13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"03/04/2023"4545044989');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"03/04/2023\\"4545044989","formula":"=CONCATENATE(H13, F14, F13)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 16->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(I3, I2+I5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"TRUE"1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"TRUE\\"1","formula":"=CONCATENATE(I3, I2+I5)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 17->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(C2, D3, C19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('p"65"All');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"p\\"65\\"All","formula":"=CONCATENATE(C2, D3, C19)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H14, F14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"45450');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"45450","formula":"=CONCATENATE(H14, F14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(B11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('Flip- Flops & Slippers');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"Flip- Flops & Slippers","formula":"=CONCATENATE(B11)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H21, B12, E3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('San deigo, CA70"98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"San deigo, CA70\\"98\\"","formula":"=CONCATENATE(H21, B12, E3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H21, B12+E7, E3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('San deigo, CA74"98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"San deigo, CA74\\"98\\"","formula":"=CONCATENATE(H21, B12+E7, E3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(E3+D3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(E3+D3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(C6-C7)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCATENATE(C6-C7)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(I2+I2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"2","formula":"=CONCATENATE(I2+I2)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(I3+I6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(I3+I6)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 26->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(I2+I6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(I2+I6)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 27->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(I7, I2, I3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('TrueTRUE"TRUE"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"TrueTRUE\\"TRUE\\"","formula":"=CONCATENATE(I7, I2, I3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 28->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(E22)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"","formula":"=CONCATENATE(E22)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 29->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(E22+E22+I2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCATENATE(E22+E22+I2)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 30->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H13, H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"03/04/2023""07-JUN"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"03/04/2023\\"\\"07-JUN\\"","formula":"=CONCATENATE(H13, H14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 31->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H13+F13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(H13+F13)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 32->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H14, F14+F13, H13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"90439"03/04/2023"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"90439\\"03/04/2023\\"","formula":"=CONCATENATE(H14, F14+F13, H13)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 33->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(C15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('$hello');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"$hello","formula":"=CONCATENATE(C15)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 34->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(H16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('""      ""');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"\\"      \\"\\"","formula":"=CONCATENATE(H16)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 35->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(12, "Al", L19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('12Al{"Hel", "Lo", 1, 2}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"12Al{\\"Hel\\", \\"Lo\\", 1, 2}","formula":"=CONCATENATE(12, \\"Al\\", L19)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 36->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(DEGREES(360))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('20626.48062');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"20626.480624709635","formula":"=CONCATENATE(DEGREES(360))"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 37->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(Sheet1!$B$15, Sheet1!$M$10, Sheet1!$J$6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('School Office "YG"/"Hi"/@');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"School Office \\"YG\\"/\\"Hi\\"/@","formula":"=CONCATENATE(Sheet1!$B$15, Sheet1!$M$10, Sheet1!$J$6)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 38->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(Sheet2!$A$1, Sheet1!$M$10, Sheet2!$A$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('School Office "YG"/"Hi"/@');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"School Office \\"YG\\"/\\"Hi\\"/@","formula":"=CONCATENATE(Sheet2!$A$1, Sheet1!$M$10, Sheet2!$A$3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 39->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE($D$3, " ", $E$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"65" "98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"65\\" \\"98\\"","formula":"=CONCATENATE($D$3, \\" \\", $E$3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 40->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE($D$3, " ", $I$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"65" "TRUE"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"65\\" \\"TRUE\\"","formula":"=CONCATENATE($D$3, \\" \\", $I$3)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 41->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(J15+K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.572916667');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.5729166666666666","formula":"=CONCATENATE(J15+K14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 42->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCATENATE(K14)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 43->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(J15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.572916667');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.5729166666666666","formula":"=CONCATENATE(J15)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 44->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE("True", "!00")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('True!00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"True!00","formula":"=CONCATENATE(\\"True\\", \\"!00\\")"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 45->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(0, 0)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"00","formula":"=CONCATENATE(0, 0)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 46->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE("23"+"34")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(\\"23\\"+\\"34\\")"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 47->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE("3"+"4", "Lp")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(\\"3\\"+\\"4\\", \\"Lp\\")"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 48->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(T33+T34)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCATENATE(T33+T34)"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 49->', (done: Function) => {
            helper.edit('I1', '=CONCATENATE(EXP(MONTH(SMALL({1,2,3,4}, 2))), CODE(E3))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCATENATE(EXP(MONTH(SMALL({1,2,3,4}, 2))), CODE(E3))"}');
            done();
        });
        it('CONCATENATE formula with cell Reference - 50->', (done: Function) => {
            helper.edit('D9', '');
            helper.edit('F3', '#NAME?');
            helper.edit('I1', '=CONCATENATE(D9, LN(TRUE), F3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=CONCATENATE(D9, LN(TRUE), F3)"}');
            done();
        });
    });

    describe('Reported CONCAT formula - Checking -> I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: 'School Office "YG"' }] }, { cells: [{ value: '/"Hi"/' }] }, { cells: [{ value: '@' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CONCAT formula with cell Reference - 0->', (done: Function) => {
            helper.edit('H14', '"07-JUN"');
            helper.edit('J20', '6728');
            helper.invoke('numberFormat', [getFormatFromType('Accounting'), 'J20']);
            helper.edit('L17', '.10,23, 100');
            helper.edit('C11', '6/23/2014');
            helper.edit('C12', '92');
            helper.edit('F14', '6/7/2024');
            helper.edit('G15', '');
            helper.edit('H15', '"     "');
            helper.edit('K14', '12:00:00 AM');
            helper.edit('F4', '#DIV/0!');
            helper.edit('H13', '"03/04/2023"');
            helper.edit('F13', '3/4/2023');
            helper.edit('I3', '"TRUE"');
            helper.edit('I2', 'TRUE');
            helper.edit('I5', 'FALSE');
            helper.edit('C2', 'p');
            helper.edit('D3', '"65"');
            helper.edit('C19', 'All');
            helper.edit('B11', 'Flip- Flops & Slippers');
            helper.edit('H21', 'San deigo, CA');
            helper.edit('B12', '70');
            helper.edit('E3', '"98"');
            helper.edit('E7', '$4');
            helper.edit('C6', '-6');
            helper.edit('C7', '-7');
            helper.edit('I6', '"FALSE"');
            helper.edit('I7', 'True');
            helper.edit('E22', '');
            helper.edit('C15', '$hello');
            helper.edit('H16', '""      ""');
            helper.edit('L19', '{"Hel", "Lo", 1, 2}');
            helper.edit('B15', 'School Office "YG"');
            helper.edit('M10', '/"Hi"/');
            helper.edit('J6', '@');
            helper.edit('J15', '1:45:00 PM');
            done();
        });
        it('CONCAT formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=CONCAT(TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"TRUE","formula":"=CONCAT(TRUE)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=CONCAT(FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"FALSE","formula":"=CONCAT(FALSE)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=CONCAT(5.567+9.45)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('15.017');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"15.017","formula":"=CONCAT(5.567+9.45)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H14, J20)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"6728');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"6728","formula":"=CONCAT(H14, J20)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=CONCAT(12.45, "{1,2,3}")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('12.45{1,2,3}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"12.45{1,2,3}","formula":"=CONCAT(12.45, \\"{1,2,3}\\")"}');
            done();
        });
        it('CONCAT formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=CONCAT(AL123, "34")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"34","formula":"=CONCAT(AL123, \\"34\\")"}');
            done();
        });
        it('CONCAT formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=CONCAT(TRUE + FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCAT(TRUE + FALSE)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=CONCAT(FALSE + FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCAT(FALSE + FALSE)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=CONCAT(TRUE + TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"2","formula":"=CONCAT(TRUE + TRUE)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=CONCAT(L17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('.10,23, 100');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":".10,23, 100","formula":"=CONCAT(L17)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=CONCAT(C11+H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(C11+H14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=CONCAT(C12+F14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('45542');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"45542","formula":"=CONCAT(C12+F14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=CONCAT(G15, H15, K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"     "0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"     \\"0","formula":"=CONCAT(G15, H15, K14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=CONCAT(F4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#DIV/0!","formula":"=CONCAT(F4)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 15->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H13, F14, F13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"03/04/2023"4545044989');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"03/04/2023\\"4545044989","formula":"=CONCAT(H13, F14, F13)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 16->', (done: Function) => {
            helper.edit('I1', '=CONCAT(I3, I2+I5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"TRUE"1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"TRUE\\"1","formula":"=CONCAT(I3, I2+I5)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 17->', (done: Function) => {
            helper.edit('I1', '=CONCAT(C2, D3, C19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('p"65"All');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"p\\"65\\"All","formula":"=CONCAT(C2, D3, C19)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H14, F14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"45450');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"45450","formula":"=CONCAT(H14, F14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I1', '=CONCAT(B11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('Flip- Flops & Slippers');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"Flip- Flops & Slippers","formula":"=CONCAT(B11)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H21, B12, E3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('San deigo, CA70"98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"San deigo, CA70\\"98\\"","formula":"=CONCAT(H21, B12, E3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H21, B12+E7, E3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('San deigo, CA74"98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"San deigo, CA74\\"98\\"","formula":"=CONCAT(H21, B12+E7, E3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I1', '=CONCAT(E3+D3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(E3+D3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I1', '=CONCAT(C6-C7)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCAT(C6-C7)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I1', '=CONCAT(I2+I2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"2","formula":"=CONCAT(I2+I2)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I1', '=CONCAT(I3+I6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(I3+I6)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 26->', (done: Function) => {
            helper.edit('I1', '=CONCAT(I2+I6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(I2+I6)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 27->', (done: Function) => {
            helper.edit('I1', '=CONCAT(I7, I2, I3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('TrueTRUE"TRUE"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"TrueTRUE\\"TRUE\\"","formula":"=CONCAT(I7, I2, I3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 28->', (done: Function) => {
            helper.edit('I1', '=CONCAT(E22)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"","formula":"=CONCAT(E22)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 29->', (done: Function) => {
            helper.edit('I1', '=CONCAT(E22+E22+I2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"1","formula":"=CONCAT(E22+E22+I2)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 30->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H13, H14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"03/04/2023""07-JUN"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"03/04/2023\\"\\"07-JUN\\"","formula":"=CONCAT(H13, H14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 31->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H13+F13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(H13+F13)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 32->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H14, F14+F13, H13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"07-JUN"90439"03/04/2023"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"07-JUN\\"90439\\"03/04/2023\\"","formula":"=CONCAT(H14, F14+F13, H13)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 33->', (done: Function) => {
            helper.edit('I1', '=CONCAT(C15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('$hello');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"$hello","formula":"=CONCAT(C15)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 34->', (done: Function) => {
            helper.edit('I1', '=CONCAT(H16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('""      ""');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"\\"      \\"\\"","formula":"=CONCAT(H16)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 35->', (done: Function) => {
            helper.edit('I1', '=CONCAT(12, "Al", L19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('12Al{"Hel", "Lo", 1, 2}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"12Al{\\"Hel\\", \\"Lo\\", 1, 2}","formula":"=CONCAT(12, \\"Al\\", L19)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 36->', (done: Function) => {
            helper.edit('I1', '=CONCAT(DEGREES(360))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('20626.48062');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"20626.480624709635","formula":"=CONCAT(DEGREES(360))"}');
            done();
        });
        it('CONCAT formula with cell Reference - 37->', (done: Function) => {
            helper.edit('I1', '=CONCAT(Sheet1!$B$15, Sheet1!$M$10, Sheet1!$J$6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('School Office "YG"/"Hi"/@');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"School Office \\"YG\\"/\\"Hi\\"/@","formula":"=CONCAT(Sheet1!$B$15, Sheet1!$M$10, Sheet1!$J$6)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 38->', (done: Function) => {
            helper.edit('I1', '=CONCAT(Sheet2!$A$1, Sheet1!$M$10, Sheet2!$A$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('School Office "YG"/"Hi"/@');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"School Office \\"YG\\"/\\"Hi\\"/@","formula":"=CONCAT(Sheet2!$A$1, Sheet1!$M$10, Sheet2!$A$3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 39->', (done: Function) => {
            helper.edit('I1', '=CONCAT($D$3, " ", $E$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"65" "98"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"65\\" \\"98\\"","formula":"=CONCAT($D$3, \\" \\", $E$3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 40->', (done: Function) => {
            helper.edit('I1', '=CONCAT($D$3, " ", $I$3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('"65" "TRUE"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"\\"65\\" \\"TRUE\\"","formula":"=CONCAT($D$3, \\" \\", $I$3)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 41->', (done: Function) => {
            helper.edit('I1', '=CONCAT(J15+K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.572916667');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.5729166666666666","formula":"=CONCAT(J15+K14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 42->', (done: Function) => {
            helper.edit('I1', '=CONCAT(K14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCAT(K14)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 43->', (done: Function) => {
            helper.edit('I1', '=CONCAT(J15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0.572916667');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.5729166666666666","formula":"=CONCAT(J15)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 44->', (done: Function) => {
            helper.edit('I1', '=CONCAT("True", "!00")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('True!00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"True!00","formula":"=CONCAT(\\"True\\", \\"!00\\")"}');
            done();
        });
        it('CONCAT formula with cell Reference - 45->', (done: Function) => {
            helper.edit('I1', '=CONCAT(0, 0)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"00","formula":"=CONCAT(0, 0)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 46->', (done: Function) => {
            helper.edit('I1', '=CONCAT("23"+"34")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(\\"23\\"+\\"34\\")"}');
            done();
        });
        it('CONCAT formula with cell Reference - 47->', (done: Function) => {
            helper.edit('I1', '=CONCAT("3"+"4", "Lp")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(\\"3\\"+\\"4\\", \\"Lp\\")"}');
            done();
        });
        it('CONCAT formula with cell Reference - 48->', (done: Function) => {
            helper.edit('I1', '=CONCAT(T33+T34)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0","formula":"=CONCAT(T33+T34)"}');
            done();
        });
        it('CONCAT formula with cell Reference - 49->', (done: Function) => {
            helper.edit('I1', '=CONCAT(EXP(MONTH(SMALL({1,2,3,4}, 2))), CODE(E3))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CONCAT(EXP(MONTH(SMALL({1,2,3,4}, 2))), CODE(E3))"}');
            done();
        });
        it('CONCAT formula with cell Reference - 50->', (done: Function) => {
            helper.edit('D9', '');
            helper.edit('F3', '#NAME?');
            helper.edit('I1', '=CONCAT(D9, LN(TRUE), F3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=CONCAT(D9, LN(TRUE), F3)"}');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 8 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('T - Specific Type - I', (done: Function) => {
            helper.edit('K1', '=T("!")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"!","formula":"=T(\\"!\\")"}');
            done();
        });
        it('T - Specific Type - II', (done: Function) => {
            helper.edit('K2', '=T("0!")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"0!","formula":"=T(\\"0!\\")"}');
            done();
        });
        it('T - Specific Type - III', (done: Function) => {
            helper.edit('K3', '=T("""")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"\\"","formula":"=T(\\"\\"\\"\\")"}');
            done();
        });
        it('T - Specific Type - IV', (done: Function) => {
            helper.edit('K4', '=T("""   ")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('"   ');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"\\"   ","formula":"=T(\\"\\"\\"   \\")"}');
            done();
        });
        it('T - Specific Type - V', (done: Function) => {
            helper.edit('K5', '=T("  .67   """)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('  .67   "');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"  .67   \\"","formula":"=T(\\"  .67   \\"\\"\\")"}');
            done();
        });
        it('T - Specific Type - VI', (done: Function) => {
            helper.edit('K6', '=T(-345+1)")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{}');
            done();
        });
        it('T - Direct Value - I', (done: Function) => {
            helper.edit('L1', '=T("He""JI")');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('He"JI');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"He\\"JI","formula":"=T(\\"He\\"\\"JI\\")"}');
            done();
        });
        it('T - Direct Value - II', (done: Function) => {
            helper.edit('L2', '=T("6")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"6","formula":"=T(\\"6\\")"}');
            done();
        });
        it('T - Direct Value - III', (done: Function) => {
            helper.edit('L3', '=T("102.673902")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('102.673902');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":"102.673902","formula":"=T(\\"102.673902\\")"}');
            done();
        });
        it('T - Direct Value - IV', (done: Function) => {
            helper.edit('L4', '=T("Hi")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('Hi');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"Hi","formula":"=T(\\"Hi\\")"}');
            done();
        });
        it('T - Direct Value - V', (done: Function) => {
            helper.edit('L5', '=T("")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"","formula":"=T(\\"\\")"}');
            done();
        });
        it('T - Direct Value - VI', (done: Function) => {
            helper.edit('L6', '=T("TRUE")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"TRUE","formula":"=T(\\"TRUE\\")"}');
            done();
        });
        it('T - Direct Value - VII', (done: Function) => {
            helper.edit('L7', '=T("-5.4678")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('-5.4678');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":"-5.4678","formula":"=T(\\"-5.4678\\")"}');
            done();
        });
        it('T - Direct Value - VIII', (done: Function) => {
            helper.edit('L8', '=T(-6.0000001)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"","formula":"=T(-6.0000001)"}');
            done();
        });
        it('T - Direct Value - IX', (done: Function) => {
            helper.edit('L9', '=T(+"Tel")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('Tel');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"Tel","formula":"=T(+\\"Tel\\")"}');
            done();
        });
        it('T - Direct Value - X', (done: Function) => {
            helper.edit('L10', '=T("")');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":"","formula":"=T(\\"\\")"}');
            done();
        });
        it('T - Direct Value - XI', (done: Function) => {
            helper.edit('L11', '=T("0")');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[11])).toBe('{"value":"0","formula":"=T(\\"0\\")"}');
            done();
        });
        it('T - Direct Value - XII', (done: Function) => {
            helper.edit('L12', '=T("3/4/2023")');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('3/4/2023');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"44989","formula":"=T(\\"3/4/2023\\")","format":"m/d/yyyy","formattedText":"3/4/2023"}');
            done();
        });
        it('T - Direct Value - XIII', (done: Function) => {
            helper.edit('L13', '=T("07-JUN")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('7-Jun');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":"46180","formula":"=T(\\"07-JUN\\")","format":"d-mmm","formattedText":"7-Jun"}');
            done();
        });
        it('T - Direct Value - XIV', (done: Function) => {
            helper.edit('L13', '=T(" ")');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe(' ');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":" ","formula":"=T(\\" \\")","format":"d-mmm"}');
            done();
        });
        it('T - Direct Value - XV', (done: Function) => {
            helper.edit('L14', '=T("       ")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('       ');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"       ","formula":"=T(\\"       \\")"}');
            done();
        });
        it('T - Direct Value - XVI', (done: Function) => {
            helper.edit('L15', '=T("       ")');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('       ');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"       ","formula":"=T(\\"       \\")"}');
            done();
        });
        it('T - Cell reference - I', (done: Function) => {
            helper.edit('C7', '-7');
            helper.edit('M1', '=T(C7)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":"","formula":"=T(C7)"}');
            done();
        });
        it('T - Different datatypes - I', (done: Function) => {
            helper.edit('N1', '=T("Flip")');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('Flip');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":"Flip","formula":"=T(\\"Flip\\")"}');
            done();
        });
        it('T - Different datatypes - II', (done: Function) => {
            helper.edit('N2', '=T("105.""3")');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('105."3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"105.\\"3","formula":"=T(\\"105.\\"\\"3\\")"}');
            done();
        });
        it('T - Different datatypes - III', (done: Function) => {
            helper.edit('P9', '=T("He""JI")');
            helper.edit('N3', '=T(P9:P20)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('He"JI');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":"He\\"JI","formula":"=T(P9:P20)"}');
            done();
        });
        it('T - Different datatypes - I', (done: Function) => {
            helper.edit('O1', '=T(6.078%)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[14])).toBe('{"value":"","formula":"=T(6.078%)"}');
            done();
        });
        it('T - Different datatypes - II', (done: Function) => {
            helper.edit('O2', '=T(                "fell")');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('fell');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[14])).toBe('{"value":"fell","formula":"=T(                \\"fell\\")"}');
            done();
        });
        it('T - Different datatypes - III', (done: Function) => {
            helper.edit('O3', '=T(-3.45)');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[14])).toBe('{"value":"","formula":"=T(-3.45)"}');
            done();
        });
        it('T - Different datatypes - III', (done: Function) => {
            helper.edit('D15', '-3.45');
            helper.edit('O4', '=T(D15)');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[14])).toBe('{"value":"","formula":"=T(D15)"}');
            done();
        });
    });

    describe('Reported EXACT Formula - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EXACT formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=EXACT(Hi,"Hi")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(Hi,\\"Hi\\")"}');
            done();
        });
        it('EXACT formula with cell Reference - 5->', (done: Function) => {
            helper.edit('C23', '1');
            helper.edit('D14', '"1"');
            helper.edit('I2', '=EXACT(C23,D14)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":false,"formula":"=EXACT(C23,D14)"}');
            done();
        });
        it('EXACT formula with cell Reference - 6->', (done: Function) => {
            helper.edit('D22', '"2"');
            helper.edit('C24', '2');
            helper.edit('I3', '=EXACT(D22,C24)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":false,"formula":"=EXACT(D22,C24)"}');
            done();
        });
        it('EXACT formula with cell Reference - 7->', (done: Function) => {
            helper.edit('D22', '"2"');
            helper.edit('C24', '2');
            helper.edit('I4', '=EXACT(C24,D22)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":false,"formula":"=EXACT(C24,D22)"}');
            done();
        });
        it('EXACT formula with cell Reference - 8->', (done: Function) => {
            helper.edit('B24', '"TRUE"');
            helper.edit('B15', 'TRUE');
            helper.edit('I5', '=EXACT(B24,B15)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":false,"formula":"=EXACT(B24,B15)"}');
            done();
        });
        it('EXACT formula with cell Reference - 9->', (done: Function) => {
            helper.edit('B25', '"FALSE"');
            helper.edit('I6', '=EXACT(FALSE,B25)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":false,"formula":"=EXACT(FALSE,B25)"}');
            done();
        });
        it('EXACT formula with cell Reference - 10->', (done: Function) => {
            helper.edit('F20', '""');
            helper.edit('I7', '=EXACT(F20,)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":false,"formula":"=EXACT(F20,)"}');
            done();
        });
        it('EXACT formula with cell Reference - 11->', (done: Function) => {
            helper.edit('G9', '600.00%');
            helper.edit('I8', '=EXACT(G9,600%)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":true,"formula":"=EXACT(G9,600%)"}');
            done();
        });
        it('EXACT formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I9', '=EXACT(500%,5)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":true,"formula":"=EXACT(500%,5)"}');
            done();
        });
        it('EXACT formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I10', '=EXACT(jelly,jelly)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(jelly,jelly)"}');
            done();
        });
        it('EXACT formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I11', '=EXACT("exam",exam)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(\\"exam\\",exam)"}');
            done();
        });
        it('EXACT formula with cell Reference - 15->', (done: Function) => {
            helper.edit('C20', 'Hello123');
            helper.edit('I12', '=EXACT(C20,Hello123)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(C20,Hello123)"}');
            done();
        });
        it('EXACT formula with cell Reference - 16->', (done: Function) => {
            helper.edit('E17', '#NUM!');
            helper.edit('I13', '=EXACT(E17,3)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"#NUM!","formula":"=EXACT(E17,3)"}');
            done();
        });
        it('EXACT formula with cell Reference - 17->', (done: Function) => {
            helper.edit('E15', '#NAME?');
            helper.edit('I14', '=EXACT(E15,"exam")');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(E15,\\"exam\\")"}');
            done();
        });
        it('EXACT formula with cell Reference - 18->', (done: Function) => {
            helper.edit('E16', '#DIV/0!');
            helper.edit('I15', '=EXACT(E16,E15)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":"#DIV/0!","formula":"=EXACT(E16,E15)"}');
            done();
        });
        it('EXACT formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I16', '=EXACT(kert,"kel")');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(kert,\\"kel\\")"}');
            done();
        });
        it('EXACT formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I17', '=EXACT("kel",kert)');
            expect(helper.invoke('getCell', [16, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(\\"kel\\",kert)"}');
            done();
        });
        it('EXACT formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I18', '=EXACT(MAX(string),E15)');
            expect(helper.invoke('getCell', [17, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(MAX(string),E15)"}');
            done();
        });
        it('EXACT formula with cell Reference - 22->', (done: Function) => {
            helper.edit('D22', '"2"');
            helper.edit('H20', '2');
            helper.edit('I19', '=EXACT($D$22,$H$20)');
            expect(helper.invoke('getCell', [18, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[8])).toBe('{"value":false,"formula":"=EXACT($D$22,$H$20)"}');
            done();
        });
        it('EXACT formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I20', '=EXACT($E$16,$H$20)');
            expect(helper.invoke('getCell', [19, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[8])).toBe('{"value":"#DIV/0!","formula":"=EXACT($E$16,$H$20)"}');
            done();
        });
        it('EXACT formula with cell Reference - 24->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Time', refersTo: 'C3' });
            helper.edit('C3', '5:56:32 AM');
            helper.edit('I24', '=EXACT(C3,0.247592592592593)');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":false,"formula":"=EXACT(C3,0.247592592592593)"}');
            done();
        });
        it('EXACT formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I24', '=EXACT("07/27/2014",41847)');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":true,"formula":"=EXACT(\\"07/27/2014\\",41847)"}');
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
        it('EXACT formula with cell Reference - I->', (done: Function) => {
            helper.edit('I1', 'Word');
            helper.edit('J1', 'word');
            helper.edit('I2', '=EXACT(I1,J1)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":false,"formula":"=EXACT(I1,J1)"}');
            done();
        });
        it('EXACT formula cell Reference - II->', (done: Function) => {
            helper.edit('I1', 'word');
            helper.edit('I3', '=EXACT(I1,J1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":true,"formula":"=EXACT(I1,J1)"}');
            done();
        });
        it('EXACT formula cell Reference - III->', (done: Function) => {
            helper.edit('I1', 'Word');
            helper.edit('J1', 'Word');
            helper.edit('I4', '=EXACT(I1,J1)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":true,"formula":"=EXACT(I1,J1)"}');
            done();
        });
        it('EXACT formula with space contained Text->', (done: Function) => {
            helper.edit('I1', 'W ord');
            helper.edit('I5', '=EXACT(I1,J1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":false,"formula":"=EXACT(I1,J1)"}');
            done();
        });
        it('EXACT formula with direct inputs->', (done: Function) => {
            helper.edit('I6', '=EXACT(word, word)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(word, word)"}');
            done();
        });
        it('EXACT formula with more than 2 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I7');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EXACT(word,word,word)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EXACT(word,word,word)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I7', '=EXACT(word,word)');
            done();
        });
        it('EXACT formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I8');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EXACT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EXACT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I8', '=EXACT(word,word)');
            done();
        });
        it('EXACT formula with alphabets and numbers->', (done: Function) => {
            helper.edit('I9', '=EXACT(word, 123)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(word, 123)"}');
            done();
        });
        it('EXACT formula for numbers->', (done: Function) => {
            helper.edit('I10', '=EXACT(123, 123)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":true,"formula":"=EXACT(123, 123)"}');
            done();
        });
        it('EXACT formula with ""->', (done: Function) => {
            helper.edit('I11', '=EXACT("apple","apple")');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].formula).toBe('=EXACT("apple","apple")');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('TRUE');
            done();
        });
        it('EXACT formula with "" for one text->', (done: Function) => {
            helper.edit('I12', '=EXACT("apple",apple)');
            expect(helper.getInstance().sheets[0].rows[11].cells[8].formula).toBe('=EXACT("apple",apple)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NAME?');
            done();
        });
        it('EXACT formula with alphabets and number combined Text->', (done: Function) => {
            helper.edit('I13', '=EXACT(word123,word123)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"#NAME?","formula":"=EXACT(word123,word123)"}');
            done();
        });
        it('LEN Formula with cell Reference->', (done: Function) => {
            helper.edit('J2', '=LEN(A2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":12,"formula":"=LEN(A2)"}');
            done();
        });
        it('LEN Formula with Date Value->', (done: Function) => {
            helper.edit('J3', '=LEN(B6)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":5,"formula":"=LEN(B6)"}');
            done();
        });
        it('LEN Formula with cell having no Value->', (done: Function) => {
            helper.edit('J4', '=LEN(P10)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":0,"formula":"=LEN(P10)"}');
            done();
        });
        it('LEN Formula with text having spaces and comma->', (done: Function) => {
            helper.edit('A2', '   Casual Shoes ,   ');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":20,"formula":"=LEN(A2)"}');
            done();
        });
        it('LEN Formula with cell having Number Value->', (done: Function) => {
            helper.edit('J5', '=LEN(D5)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":2,"formula":"=LEN(D5)"}');
            done();
        });
        it('LEN Formula with cell having Formatted Number Value->', (done: Function) => {
            helper.invoke('selectRange', ['D5']);
            helper.getElement('#' + helper.id + '_number_format').click();
            helper.getElement('#' + helper.id + '_Accounting').click();
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":2,"formula":"=LEN(D5)"}');
            done();
        });
        it('LEN Formula with more than 1 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LEN(A5,A6)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LEN(A5,A6)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J6', '=LEN(A5)');
            done();
        });
        it('LEN Formula with more than 1 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LEN(A5,A6)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LEN(A5,A6)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J6', '=LEN(A5)');
            done();
        });
        it('LEN Formula without ""->', (done: Function) => {
            helper.edit('J7', '=LEN(ed)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#NAME?","formula":"=LEN(ed)"}');
            done();
        });
        it('LEN Formula with no inputs->', (done: Function) => {
            helper.edit('J8', '=LEN()');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{}');
            done();
        });
        it('MOD Formula->', (done: Function) => {
            helper.edit('K1', '=MOD(10,20)');
            // expect(helper.invoke('getCell', [0, 10]).textContent).toBe('10');
            // expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":10,"formula":"=MOD(10,20)"}');
            done();
        });
        it('MOD Formula with Number contains negative sign->', (done: Function) => {
            helper.edit('K2', '=MOD(-3,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MOD(-3,2)"}');
            done();
        });
        it('MOD Formula with divisor contains negative sign->', (done: Function) => {
            helper.edit('K3', '=MOD(3,-2)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":-1,"formula":"=MOD(3,-2)"}');
            done();
        });
        it('MOD Formula with both number and divisor contains negative sign->', (done: Function) => {
            helper.edit('K4', '=MOD(-3,-2)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":-1,"formula":"=MOD(-3,-2)"}');
            done();
        });
        it('MOD Formula with Deciaml values->', (done: Function) => {
            helper.edit('K5', '=MOD(0.75,0.1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('0.05');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":0.04999999999999996,"formula":"=MOD(0.75,0.1)"}');
            done();
        });
        it('MOD Formula with cell Reference->', (done: Function) => {
            helper.edit('K6', '=MOD(E2,F2)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":20,"formula":"=MOD(E2,F2)"}');
            done();
        });
        it('MOD Formula with cell Reference and Number->', (done: Function) => {
            helper.edit('K7', '=MOD(E2,6)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":2,"formula":"=MOD(E2,6)"}');
            done();
        });
        it('MOD Formula with Date values->', (done: Function) => {
            helper.edit('K8', '=MOD(B2,F2)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('3/24/1900');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":84,"format":"m/d/yyyy","formula":"=MOD(B2,F2)","formattedText":"3/24/1900"}');
            done();
        });
        it('MOD Formula with Time values->', (done: Function) => {
            helper.edit('K9', '=MOD(C2,F2)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('11:34:32 AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":0.48231481481482774,"format":"h:mm:ss AM/PM","formula":"=MOD(C2,F2)","formattedText":"11:34:32 AM"}');
            done();
        });
        it('MOD Formula with Divisor as 0->', (done: Function) => {
            helper.edit('K10', '=MOD(20,0)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[10])).toBe('{"value":"#DIV/0!","formula":"=MOD(20,0)"}');
            done();
        });
        it('MOD Formula with number as 0->', (done: Function) => {
            helper.edit('K11', '=MOD(0,20)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[10])).toBe('{"value":0,"formula":"=MOD(0,20)"}');
            done();
        });
        it('MOD Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K12');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MOD()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MOD()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K12', '=MOD(10,2)');
            done();
        });
        it('MOD Formula with more than 2 inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K13');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MOD(2,3,4)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MOD(2,3,4)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K13', '=MOD(2,3)');
            done();
        });
        it('MOD Formula with alphabets as inputs->', (done: Function) => {
            helper.edit('K14', '=MOD(A2,A3)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[10])).toBe('{"value":"#VALUE!","formula":"=MOD(A2,A3)"}');
            done();
        });
        it('MOD Formula with invalid inputs->', (done: Function) => {
            helper.edit('K15', '=MOD(ed,ed)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[10])).toBe('{"value":"#NAME?","formula":"=MOD(ed,ed)"}');
            done();
        });
        it('MOD Formula with empty cell references->', (done: Function) => {
            helper.edit('K16', '=MOD(M2,2)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('0');
            helper.edit('K17', '=MOD(M2,M3)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#DIV/0!');
            helper.edit('K18', '=MOD(2,M2)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#DIV/0!');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 6 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('LEN - Specific Type - I', (done: Function) => {
            helper.edit('K1', '=LEN("0!")');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":2,"formula":"=LEN(\\"0!\\")"}');
            done();
        });
        it('LEN - Specific Type - II', (done: Function) => {
            helper.edit('K2', '=LEN(2/3/2000)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('21');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":21,"formula":"=LEN(2/3/2000)"}');
            done();
        });
        it('LEN - Specific Type - III', (done: Function) => {
            helper.edit('K3', '=LEN("""")');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":1,"formula":"=LEN(\\"\\"\\"\\")"}');
            done();
        });
        it('LEN - Specific Type - IV', (done: Function) => {
            helper.edit('K4', '=LEN("""   ")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":4,"formula":"=LEN(\\"\\"\\"   \\")"}');
            done();
        });
        it('LEN - Specific Type - V', (done: Function) => {
            helper.edit('K5', '=LEN("  .67   """)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('9');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":9,"formula":"=LEN(\\"  .67   \\"\\"\\")"}');
            done();
        });
        it('LEN - Direct Value - I', (done: Function) => {
            helper.edit('L1', '=LEN("3/4/2023")');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":8,"formula":"=LEN(\\"3/4/2023\\")"}');
            done();
        });
        it('LEN - Direct Value - II', (done: Function) => {
            helper.edit('L2', '=LEN("07-JUN")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":6,"formula":"=LEN(\\"07-JUN\\")"}');
            done();
        });
        it('LEN - Cell reference - I', (done: Function) => {
            helper.edit('L2', '"65.678"');
            helper.edit('M1', '=LEN(L2)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":8,"formula":"=LEN(L2)"}');
            done();
        });
        it('LEN - Cell reference - II', (done: Function) => {
            helper.edit('L5', '"112"');
            helper.edit('M2', '=LEN(L5)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":5,"formula":"=LEN(L5)"}');
            done();
        });
        it('LEN - Cell reference - III', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('M3', '=LEN(H9)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":3,"formula":"=LEN(H9)"}');
            done();
        });
        it('LEN - Cell reference - IV', (done: Function) => {
            helper.edit('G3', '""');
            helper.edit('M4', '=LEN(G3)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":2,"formula":"=LEN(G3)"}');
            done();
        });
        it('LEN - Cell reference - V', (done: Function) => {
            helper.edit('I3', '"TRUE"');
            helper.edit('M5', '=LEN(I3)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":6,"formula":"=LEN(I3)"}');
            done();
        });
        it('LEN - Cell reference - VI', (done: Function) => {
            helper.edit('H5', '"-5"');
            helper.edit('M6', '=LEN(H5)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":4,"formula":"=LEN(H5)"}');
            done();
        });
        it('LEN - Cell reference - VII', (done: Function) => {
            helper.edit('L8', '"Hi"');
            helper.edit('M7', '=LEN(L8)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":4,"formula":"=LEN(L8)"}');
            done();
        });
        it('LEN - Cell reference - VIII', (done: Function) => {
            helper.edit('G3', '""');
            helper.edit('M8', '=LEN(G3)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":2,"formula":"=LEN(G3)"}');
            done();
        });
        it('LEN - Cell reference - IX', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('M9', '=LEN(H9)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":3,"formula":"=LEN(H9)"}');
            done();
        });
        it('LEN - Cell reference - X', (done: Function) => {
            helper.edit('H13', '"03/04/2023"');
            helper.edit('M10', '=LEN(H13)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('12');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":12,"formula":"=LEN(H13)"}');
            done();
        });
        it('LEN - Cell reference - XI', (done: Function) => {
            helper.edit('H14', '"07-JUN"');
            helper.edit('M11', '=LEN(H14)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":8,"formula":"=LEN(H14)"}');
            done();
        });
        it('LEN - Cell reference - XII', (done: Function) => {
            helper.edit('F15', '" "');
            helper.edit('M12', '=LEN(F15)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":3,"formula":"=LEN(F15)"}');
            done();
        });
        it('LEN - Cell reference - XIII', (done: Function) => {
            helper.edit('H15', '"     "');
            helper.edit('M13', '=LEN(H15)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[12])).toBe('{"value":7,"formula":"=LEN(H15)"}');
            done();
        });
        it('LEN - Different datatypes - I', (done: Function) => {
            helper.edit('N1', '=LEN(6/23/2014)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('21');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":21,"formula":"=LEN(6/23/2014)"}');
            done();
        });
        it('LEN - Different datatypes - II', (done: Function) => {
            helper.edit('J2', 'H123Ello');
            helper.edit('N2', '=LEN(J2:J10)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":8,"formula":"=LEN(J2:J10)"}');
            done();
        });
        it('LEN - Invalid Arguments - I', (done: Function) => {
            helper.edit('O1', '=LEN(6.078%)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[14])).toBe('{"value":7,"formula":"=LEN(6.078%)"}');
            done();
        });
        it('LEN - Invalid Arguments - II', (done: Function) => {
            helper.edit('D16', '"-3.45"');
            helper.edit('O2', '=LEN(D16)');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[14])).toBe('{"value":7,"formula":"=LEN(D16)"}');
            done();
        });
        it('LEN - Sheets - I', (done: Function) => {
            helper.edit('Sheet1!L2', '"65.678"');
            helper.edit('P1', '=LEN(Sheet1!L2)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":8,"formula":"=LEN(Sheet1!L2)"}');
            done();
        });
        it('LEN - Sheets - II', (done: Function) => {
            helper.edit('Sheet1!$L$2', '"65.678"');
            helper.edit('P2', '=LEN(Sheet1!$L$2)');
            expect(helper.invoke('getCell', [1, 15]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[15])).toBe('{"value":8,"formula":"=LEN(Sheet1!$L$2)"}');
            done();
        });
        it('LEN - Cell Ref - I', (done: Function) => {
            helper.edit('$L$3', '"33"');
            helper.edit('Q1', '=LEN($L$3)');
            expect(helper.invoke('getCell', [0, 16]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[16])).toBe('{"value":4,"formula":"=LEN($L$3)"}');
            done();
        });
        it('LEN - Issue fixing: 889130 - Nested formula - 1', (done: Function) => {
            helper.edit('G4', '13853.09');
            helper.edit('Z1', '=LEN(TEXT(G4,"0.0%"))');
            expect(helper.invoke('getCell', [0, 25]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[25])).toBe('{"value":10,"formula":"=LEN(TEXT(G4,\\"0.0%\\"))"}');
            done();
        });
        it('LEN - Issue fixing: 889130 - Nested formula - 2', (done: Function) => {
            helper.edit('D10', 'Debit Card');
            helper.edit('Z2', '=LEN(T(D10))');
            expect(helper.invoke('getCell', [1, 25]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[25])).toBe('{"value":10,"formula":"=LEN(T(D10))"}');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 7 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('PROPER - Specific Type - I', (done: Function) => {
            helper.edit('J7', 'A123@!hi');
            helper.edit('K1', '=PROPER(J7)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('A123@!Hi');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"A123@!Hi","formula":"=PROPER(J7)"}');
            done();
        });
        it('PROPER - Specific Type - II', (done: Function) => {
            helper.edit('K2', '=PROPER("0!")');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"0!","formula":"=PROPER(\\"0!\\")"}');
            done();
        });
        it('PROPER - Specific Type - III', (done: Function) => {
            helper.edit('K3', '=PROPER(2/3/2000)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0.000333333');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"0.0003333333333333333","formula":"=PROPER(2/3/2000)"}');
            done();
        });
        it('PROPER - Specific Type - IV', (done: Function) => {
            helper.edit('K4', '=PROPER("""")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"\\"","formula":"=PROPER(\\"\\"\\"\\")"}');
            done();
        });
        it('PROPER - Specific Type - V', (done: Function) => {
            helper.edit('K5', '=PROPER("""   ")');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('"   ');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"\\"   ","formula":"=PROPER(\\"\\"\\"   \\")"}');
            done();
        });
        it('PROPER - Specific Type - VI', (done: Function) => {
            helper.edit('K6', '=PROPER("  .67   """)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('  .67   "');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"  .67   \\"","formula":"=PROPER(\\"  .67   \\"\\"\\")"}');
            done();
        });
        it('PROPER - Specific Type - VII', (done: Function) => {
            helper.edit('H18', 'gentle.CS');
            helper.edit('K7', '=PROPER(H18)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('Gentle.Cs');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"Gentle.Cs","formula":"=PROPER(H18)"}');
            done();
        });
        it('PROPER - Specific Type - VIII', (done: Function) => {
            helper.edit('H19', 'hello world.agHt');
            helper.edit('K8', '=PROPER(H19)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('Hello World.Aght');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":"Hello World.Aght","formula":"=PROPER(H19)"}');
            done();
        });
        it('PROPER - Specific Type - IX', (done: Function) => {
            helper.edit('H20', 'fellHell, BS');
            helper.edit('K9', '=PROPER(H20)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('Fellhell, Bs');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":"Fellhell, Bs","formula":"=PROPER(H20)"}');
            done();
        });
        it('PROPER - Specific Type - X', (done: Function) => {
            helper.edit('H21', 'San deigo, CA');
            helper.edit('K10', '=PROPER(H21)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('San Deigo, Ca');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[10])).toBe('{"value":"San Deigo, Ca","formula":"=PROPER(H21)"}');
            done();
        });
        it('PROPER - Specific Type - XI', (done: Function) => {
            helper.edit('J17', 'excel');
            helper.edit('K11', '=PROPER(J17)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('Excel');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[10])).toBe('{"value":"Excel","formula":"=PROPER(J17)"}');
            done();
        });
        it('PROPER - Specific Type - XII', (done: Function) => {
            helper.edit('K12', '=PROPER("2/4/2000 12:00 am")');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('2/4/2000 12:00 Am');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[10])).toBe('{"value":"2/4/2000 12:00 Am","formula":"=PROPER(\\"2/4/2000 12:00 am\\")"}');
            done();
        });
        it('PROPER - Specific Type - XIII', (done: Function) => {
            helper.edit('O23', 'Fell In Hell');
            helper.edit('K13', '=PROPER(O23:O28)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('Fell In Hell');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[10])).toBe('{"value":"Fell In Hell","formula":"=PROPER(O23:O28)"}');
            done();
        });
        it('PROPER - Direct Value - I', (done: Function) => {
            helper.edit('L1', '=PROPER(400%)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":"4","formula":"=PROPER(400%)"}');
            done();
        });
        it('PROPER - Direct Value - II', (done: Function) => {
            helper.edit('L2', '=PROPER("he""jI")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('He"Ji');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"He\\"Ji","formula":"=PROPER(\\"he\\"\\"jI\\")"}');
            done();
        });
        it('PROPER - Direct Value - III', (done: Function) => {
            helper.edit('L3', '=PROPER("TRUE")');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":"True","formula":"=PROPER(\\"TRUE\\")"}');
            done();
        });
        it('PROPER - Direct Value - IV', (done: Function) => {
            helper.edit('L4', '=PROPER(TRUE)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"True","formula":"=PROPER(TRUE)"}');
            done();
        });
        it('PROPER - Direct Value - V', (done: Function) => {
            helper.edit('L5', '=PROPER(FALSE)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"False","formula":"=PROPER(FALSE)"}');
            done();
        });
        it('PROPER - Direct Value - VI', (done: Function) => {
            helper.edit('L6', '=PROPER("-3.0000000")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('-3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"-3.0000000","formula":"=PROPER(\\"-3.0000000\\")"}');
            done();
        });
        it('PROPER - Direct Value - VII', (done: Function) => {
            helper.edit('M10', '/"Hi"/');
            helper.edit('L7', '=PROPER(M10)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('/"Hi"/');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":"/\\"Hi\\"/","formula":"=PROPER(M10)"}');
            done();
        });
        it('PROPER - Direct Value - VIII', (done: Function) => {
            helper.edit('L8', '=PROPER(3/4/2023)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('0.000370737');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"0.0003707365299060801","formula":"=PROPER(3/4/2023)"}');
            done();
        });
        it('PROPER - Direct Value - IX', (done: Function) => {
            helper.edit('L9', '=PROPER("3/4/2023")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('3/4/2023');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"44989","formula":"=PROPER(\\"3/4/2023\\")","format":"m/d/yyyy","formattedText":"3/4/2023"}');
            done();
        });
        it('PROPER - Direct Value - X', (done: Function) => {
            helper.edit('L9', '=PROPER("07-JUN")');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('6/7/2026');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"46180","formula":"=PROPER(\\"07-JUN\\")","format":"m/d/yyyy","formattedText":"6/7/2026"}');
            done();
        });
        it('PROPER - Cell reference - I', (done: Function) => {
            helper.edit('B13', 'School Office+12"YG"');
            helper.edit('M1', '=PROPER(B13)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('School Office+12"Yg"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":"School Office+12\\"Yg\\"","formula":"=PROPER(B13)"}');
            done();
        });
        it('PROPER - Cell reference - II', (done: Function) => {
            helper.edit('B15', 'School Office "YG"');
            helper.edit('M2', '=PROPER(B15)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('School Office "Yg"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":"School Office \\"Yg\\"","formula":"=PROPER(B15)"}');
            done();
        });
        it('PROPER - Cell reference - III', (done: Function) => {
            helper.edit('B17', "RNd123+'0tRue");
            helper.edit('M3', '=PROPER(B17)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe("Rnd123+'0True");
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":"Rnd123+\'0True","formula":"=PROPER(B17)"}');
            done();
        });
        it('PROPER - Cell reference - IV', (done: Function) => {
            helper.edit('L2', '"65.678"');
            helper.edit('M4', '=PROPER(L2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('"65.678"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":"\\"65.678\\"","formula":"=PROPER(L2)"}');
            done();
        });
        it('PROPER - Cell reference - V', (done: Function) => {
            helper.edit('L5', '"112"');
            helper.edit('M5', '=PROPER(L5)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('"112"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":"\\"112\\"","formula":"=PROPER(L5)"}');
            done();
        });
        it('PROPER - Cell reference - VI', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('M6', '=PROPER(H9)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('"0"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":"\\"0\\"","formula":"=PROPER(H9)"}');
            done();
        });
        it('PROPER - Cell reference - VII', (done: Function) => {
            helper.edit('I3', '"TRUE"');
            helper.edit('M7', '=PROPER(I3)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('"True"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"\\"True\\"","formula":"=PROPER(I3)"}');
            done();
        });
        it('PROPER - Cell reference - VIII', (done: Function) => {
            helper.edit('H5', '"-5"');
            helper.edit('M8', '=PROPER(H5)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('"-5"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":"\\"-5\\"","formula":"=PROPER(H5)"}');
            done();
        });
        it('PROPER - Cell reference - IX', (done: Function) => {
            helper.edit('L8', '"Hi"');
            helper.edit('M9', '=PROPER(L8)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('"Hi"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":"\\"Hi\\"","formula":"=PROPER(L8)"}');
            done();
        });
        it('PROPER - Cell reference - X', (done: Function) => {
            helper.edit('G3', '""');
            helper.edit('M10', '=PROPER(G3)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('""');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":"\\"\\"","formula":"=PROPER(G3)"}');
            done();
        });
        it('PROPER - Cell reference - XI', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('M11', '=PROPER(H9)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('"0"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":"\\"0\\"","formula":"=PROPER(H9)"}');
            done();
        });
        it('PROPER - Cell reference - XII', (done: Function) => {
            helper.edit('H14', '"07-JUN"');
            helper.edit('M12', '=PROPER(H14)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('"07-Jun"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":"\\"07-Jun\\"","formula":"=PROPER(H14)"}');
            done();
        });
        it('PROPER - Cell reference - XIII', (done: Function) => {
            helper.edit('H16', '""      ""');
            helper.edit('M13', '=PROPER(H16)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('""      ""');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[12])).toBe('{"value":"\\"\\"      \\"\\"","formula":"=PROPER(H16)"}');
            done();
        });
        it('PROPER - Cell reference - XIV', (done: Function) => {
            helper.edit('H15', '"     "');
            helper.edit('M14', '=PROPER(H15)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('"     "');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[12])).toBe('{"value":"\\"     \\"","formula":"=PROPER(H15)"}');
            done();
        });
        it('PROPER - Different datatypes - I', (done: Function) => {
            helper.edit('B11', 'Flip- Flops & Slippers');
            helper.edit('N1', '=PROPER(B11)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('Flip- Flops & Slippers');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":"Flip- Flops & Slippers","formula":"=PROPER(B11)"}');
            done();
        });
        it('PROPER - Different datatypes - II', (done: Function) => {
            helper.edit('N2', '=PROPER(6/23/2014)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0.000129528');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"0.0001295280860066491","formula":"=PROPER(6/23/2014)"}');
            done();
        });
        it('PROPER - Different datatypes - III', (done: Function) => {
            helper.edit('N3', '=PROPER("105.""3")');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('105."3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":"105.\\"3","formula":"=PROPER(\\"105.\\"\\"3\\")"}');
            done();
        });
        it('PROPER - Different datatypes - IV', (done: Function) => {
            helper.edit('M11', '12:00:00 AM');
            helper.edit('N4', '=PROPER(M11)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[13])).toBe('{"value":"0","formula":"=PROPER(M11)"}');
            done();
        });
        it('PROPER - Invalid Arguments - I', (done: Function) => {
            helper.edit('O1', '=PROPER(6.078%)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('0.06078');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[14])).toBe('{"value":"0.06078","formula":"=PROPER(6.078%)"}');
            done();
        });
        it('PROPER - Invalid Arguments - II', (done: Function) => {
            helper.edit('G11', '$300.00');
            helper.edit('O2', '=PROPER(G11)');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('300');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[14])).toBe('{"value":"300","formula":"=PROPER(G11)"}');
            done();
        });
        it('PROPER - Invalid Arguments - III', (done: Function) => {
            helper.edit('H11', '1000.00%');
            helper.edit('O3', '=PROPER(H11)');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[14])).toBe('{"value":"10","formula":"=PROPER(H11)"}');
            done();
        });
        it('PROPER - Invalid Arguments - IV', (done: Function) => {
            helper.edit('O4', '=PROPER(EXP(4)/FACT(3))');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('9.099691672');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[14])).toBe('{"value":"9.099691672190707","formula":"=PROPER(EXP(4)/FACT(3))"}');
            done();
        });
        it('PROPER - Invalid Arguments - V', (done: Function) => {
            helper.edit('O5', '=PROPER(2 * PI())');
            expect(helper.invoke('getCell', [4, 14]).textContent).toBe('6.283185307');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[14])).toBe('{"value":"6.283185307179586","formula":"=PROPER(2 * PI())"}');
            done();
        });
        it('PROPER - Invalid Arguments - VI', (done: Function) => {
            helper.edit('D16', '"-3.45"');
            helper.edit('O6', '=PROPER(D16)');
            expect(helper.invoke('getCell', [5, 14]).textContent).toBe('"-3.45"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[14])).toBe('{"value":"\\"-3.45\\"","formula":"=PROPER(D16)"}');
            done();
        });
        it('PROPER - Sheets - I', (done: Function) => {
            helper.edit('Sheet1!K4', '"34"');
            helper.edit('P1', '=PROPER(Sheet1!K4)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('"34"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":"\\"34\\"","formula":"=PROPER(Sheet1!K4)"}');
            done();
        });
        it('PROPER - Sheets - II', (done: Function) => {
            helper.edit('Sheet1!L2', '"65.678"');
            helper.edit('P2', '=PROPER(Sheet1!L2)');
            expect(helper.invoke('getCell', [1, 15]).textContent).toBe('"65.678"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[15])).toBe('{"value":"\\"65.678\\"","formula":"=PROPER(Sheet1!L2)"}');
            done();
        });
        it('PROPER - Cell Ref - I', (done: Function) => {
            helper.edit('$J$2', 'h123eLLlo');
            helper.edit('Q1', '=PROPER($J$2)');
            expect(helper.invoke('getCell', [0, 16]).textContent).toBe('H123Elllo');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[16])).toBe('{"value":"H123Elllo","formula":"=PROPER($J$2)"}');
            done();
        });
        it('PROPER - Cell Ref - II', (done: Function) => {
            helper.edit('$L$3', '"33"');
            helper.edit('Q2', '=PROPER($L$3)');
            expect(helper.invoke('getCell', [1, 16]).textContent).toBe('"33"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[16])).toBe('{"value":"\\"33\\"","formula":"=PROPER($L$3)"}');
            done();
        });
        it('PROPER - Specific case - I', (done: Function) => {
            helper.edit('R1', '=PROPER("ab-cd,ef.gh ij123kl")');
            expect(helper.invoke('getCell', [0, 17]).textContent).toBe('Ab-Cd,Ef.Gh Ij123Kl');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[17])).toBe('{"value":"Ab-Cd,Ef.Gh Ij123Kl","formula":"=PROPER(\\"ab-cd,ef.gh ij123kl\\")"}');
            done();
        });
        it('CODE - Issue fixing: 889130 - Nested formula - 4', (done: Function) => {
            helper.edit('B19', 'TSX');
            helper.edit('Z1', '=PROPER(T(B19))');
            expect(helper.invoke('getCell', [0, 25]).textContent).toBe('Tsx');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[25])).toBe('{"value":"Tsx","formula":"=PROPER(T(B19))"}');
            done();
        });
    });

    describe('Reported CHAR formulae - Checking -> III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CHAR formula with cell Reference - 18->', (done: Function) => {
            helper.edit('H1', '#REF!');
            helper.edit('H2', '"65"');
            helper.edit('H3', '"112"');
            helper.edit('H4', 'TRUE');
            helper.edit('H5', '103.32');
            helper.edit('H6', '104.32');
            helper.edit('H7', '105.32');
            helper.edit('H8', '106.32');
            helper.edit('H9', '107.32');
            helper.edit('H10', '108.32');
            helper.edit('H11', '109.32');
            helper.edit('H12', '110.32');
            helper.edit('H13', '#DIV/0!');
            helper.edit('H14', '#NUM!');
            helper.edit('H15', '"33"');
            helper.edit('H16', '4');
            done();
        });
        it('CHAR formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=CHAR(TRUE)');
            expect(1).toBe(1);
            done();
        });
        it('CHAR formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=CHAR(H1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#REF!","formula":"=CHAR(H1)"}');
            done();
        });
        it('CHAR formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=CHAR(H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(H2)"}');
            done();
        });
        it('CHAR formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=CHAR(H3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(H3)"}');
            done();
        });
        it('CHAR formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=CHAR(H4)');
            expect(1).toBe(1);
            done();
        });
        it('CHAR formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=CHAR(1:10)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(1:10)"}');
            done();
        });
        it('CHAR formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=CHAR(98.8)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('b');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"b","formula":"=CHAR(98.8)"}');
            done();
        });
        it('CHAR formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=CHAR(105.3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('i');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"i","formula":"=CHAR(105.3)"}');
            done();
        });
        it('CHAR formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=CHAR(SMALL(H5:H12, H16))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('j');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"j","formula":"=CHAR(SMALL(H5:H12, H16))"}');
            done();
        });
        it('CHAR formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=CHAR(Sheet1!H13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#DIV/0!","formula":"=CHAR(Sheet1!H13)"}');
            done();
        });
        it('CHAR formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=CHAR(Sheet1!H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(Sheet1!H2)"}');
            done();
        });
        it('CHAR formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=CHAR($H$14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=CHAR($H$14)"}');
            done();
        });
        it('CHAR formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=CHAR($H$15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR($H$15)"}');
            done();
        });
    });

    describe('Formula - Checking VII ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CHAR Formula for Numbers->', (done: Function) => {
            helper.edit('I1', '=CHAR(56)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"8","formula":"=CHAR(56)"}');
            done();
        });
        it('CHAR Formula for alphabets->', (done: Function) => {
            helper.edit('I2', '=CHAR(78)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('N');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"N","formula":"=CHAR(78)"}');
            done();
        });
        it('CHAR Formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=CHAR()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=CHAR()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I3', '=CHAR(65)');
            done();
        });
        it('CHAR Formula with invalid inputs->', (done: Function) => {
            helper.edit('I4', '=CHAR(a)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#NAME?","formula":"=CHAR(a)"}');
            done();
        });
        it('CHAR Formula with value > 256->', (done: Function) => {
            helper.edit('I5', '=CHAR(256)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(256)"}');
            done();
        });
        it('CHAR Formula with value as 0->', (done: Function) => {
            helper.edit('I6', '=CHAR(0)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#VALUE!","formula":"=CHAR(0)"}');
            done();
        });
        it('CODE Formula for Numbers->', (done: Function) => {
            helper.edit('J1', '=CODE(1)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('49');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":49,"formula":"=CODE(1)"}');
            done();
        });
        it('CODE Formula for alphabets->', (done: Function) => {
            helper.edit('J2', '=CODE("A")');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toBe('=CODE("A")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('65');
            done();
        });
        it('CODE Formula for invalid inputs->', (done: Function) => {
            helper.edit('J3', '=CODE(a)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":"#NAME?","formula":"=CODE(a)"}');
            done();
        });
        it('CODE Formula for no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J4');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=CODE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=CODE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J4', '=CODE("a")');
            done();
        });
        it('CODE Formula for with only ""->', (done: Function) => {
            helper.edit('J5', '=CODE("")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('CODE Formula for 0->', (done: Function) => {
            helper.edit('J6', '=CODE(0)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('48');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":48,"formula":"=CODE(0)"}');
            done();
        });
        it('SUMIF Formula->', (done: Function) => {
            helper.edit('J7', '=SUMIF(A2:A5,"Casual Shoes",D2:D4)');
            expect(helper.getInstance().sheets[0].rows[6].cells[9].formula).toBe('=SUMIF(A2:A5,"Casual Shoes",D2:D4)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('10');
            done();
        });
        it('ABS Formula->', (done: Function) => {
            helper.edit('K1', '=ABS(D2)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":10,"formula":"=ABS(D2)"}');
            done();
        });
        it('ABS Formula with cell having no values->', (done: Function) => {
            helper.edit('K2', '=ABS(P10)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":0,"formula":"=ABS(P10)"}');
            done();
        });
        it('FIND Formula with Name Error->', (done: Function) => {
            helper.edit('K4', '=FIND(S,"A2")');
            expect(helper.getInstance().sheets[0].rows[3].cells[10].formula).toBe('=FIND(S,"A2")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NAME?');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 5 - ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CODE - I', (done: Function) => {
            helper.edit('I1', '=CODE("0!")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('48');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":48,"formula":"=CODE(\\"0!\\")"}');
            done();
        });
        it('CODE - II', (done: Function) => {
            helper.edit('I2', '=CODE("""")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":34,"formula":"=CODE(\\"\\"\\"\\")"}');
            done();
        });
        it('CODE - III', (done: Function) => {
            helper.edit('I3', '=CODE("""   ")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":34,"formula":"=CODE(\\"\\"\\"   \\")"}');
            done();
        });
        it('CODE - IV', (done: Function) => {
            helper.edit('J17', '"excel"');
            helper.edit('I4', '=CODE(J17)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":34,"formula":"=CODE(J17)"}');
            done();
        });
        it('CODE - V', (done: Function) => {
            helper.edit('I5', '=CODE("2/4/2000 12:00 am")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":50,"formula":"=CODE(\\"2/4/2000 12:00 am\\")"}');
            done();
        });
        it('CODE - VI', (done: Function) => {
            helper.edit('I6', '=CODE(O23:O28)');
            expect(1).toBe(1);
            done();
        });
        it('CODE - VII', (done: Function) => {
            helper.edit('I7', '=CODE("3/4/2023")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('51');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":51,"formula":"=CODE(\\"3/4/2023\\")"}');
            done();
        });
        it('CODE - VIII', (done: Function) => {
            helper.edit('I8', '=CODE("07-JUN")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('48');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":48,"formula":"=CODE(\\"07-JUN\\")"}');
            done();
        });
        it('CODE - IX', (done: Function) => {
            helper.edit('L2', '"65.678"');
            helper.edit('I9', '=CODE(L2)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":34,"formula":"=CODE(L2)"}');
            done();
        });
        it('CODE - X', (done: Function) => {
            helper.edit('L5', '"112"');
            helper.edit('I10', '=CODE(L5)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":34,"formula":"=CODE(L5)"}');
            done();
        });
        it('CODE - XI', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('I11', '=CODE(H9)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":34,"formula":"=CODE(H9)"}');
            done();
        });
        it('CODE - XII', (done: Function) => {
            helper.edit('G3', '""');
            helper.edit('I12', '=CODE(G3)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":34,"formula":"=CODE(G3)"}');
            done();
        });
        it('CODE - XIII', (done: Function) => {
            helper.edit('I3', '"TRUE"');
            helper.edit('I13', '=CODE(I3)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":34,"formula":"=CODE(I3)"}');
            done();
        });
        it('CODE - XIV', (done: Function) => {
            helper.edit('L8', '"Hi"');
            helper.edit('I14', '=CODE(L8)');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[8])).toBe('{"value":34,"formula":"=CODE(L8)"}');
            done();
        });
        it('CODE - XV', (done: Function) => {
            helper.edit('G3', '""');
            helper.edit('I15', '=CODE(G3)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":34,"formula":"=CODE(G3)"}');
            done();
        });
        it('CODE - XVI', (done: Function) => {
            helper.edit('H9', '"0"');
            helper.edit('I16', '=CODE(H9)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":34,"formula":"=CODE(H9)"}');
            done();
        });
        it('CODE - XVII', (done: Function) => {
            helper.edit('H12', '');
            helper.edit('I17', '=CODE(H12)');
            expect(helper.invoke('getCell', [16, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[8])).toBe('{"value":"#VALUE!","formula":"=CODE(H12)"}');
            done();
        });
        it('CODE - XVIII', (done: Function) => {
            helper.edit('H14', '"07-JUN"');
            helper.edit('I18', '=CODE(H14)');
            expect(helper.invoke('getCell', [17, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[8])).toBe('{"value":34,"formula":"=CODE(H14)"}');
            done();
        });
        it('CODE - XIX', (done: Function) => {
            helper.edit('H16', '""      ""');
            helper.edit('I19', '=CODE(H16)');
            expect(helper.invoke('getCell', [18, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[8])).toBe('{"value":34,"formula":"=CODE(H16)"}');
            done();
        });
        it('CODE - XX', (done: Function) => {
            helper.edit('H15', '"     "');
            helper.edit('I20', '=CODE(H15)');
            expect(helper.invoke('getCell', [19, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[8])).toBe('{"value":34,"formula":"=CODE(H15)"}');
            done();
        });
        it('CODE - XXI', (done: Function) => {
            helper.edit('I21', '=CODE(1:10)');
            expect(1).toBe(1);
            done();
        });
        it('CODE - XXII', (done: Function) => {
            helper.edit('I22', '=CODE(C19:C28)');
            expect(1).toBe(1);
            done();
        });
        it('CODE - XXIII', (done: Function) => {
            helper.edit('I23', '=CODE(6.078%)');
            expect(helper.invoke('getCell', [22, 8]).textContent).toBe('48');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[8])).toBe('{"value":48,"formula":"=CODE(6.078%)"}');
            done();
        });
        it('CODE - XXIV', (done: Function) => {
            helper.edit('D16', '"-3.45"');
            helper.edit('I24', '=CODE(D16)');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":34,"formula":"=CODE(D16)"}');
            done();
        });
        it('CODE - XXV', (done: Function) => {
            helper.edit('L8', '"Hi"');
            helper.edit('I25', '=CODE(L8)');
            expect(helper.invoke('getCell', [24, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[24].cells[8])).toBe('{"value":34,"formula":"=CODE(L8)"}');
            done();
        });
        it('CODE - XXVI', (done: Function) => {
            helper.edit('I26', '=CODE(B19:C24)');
            expect(1).toBe(1);
            done();
        });
        it('CODE - XXVII', (done: Function) => {
            helper.edit('Sheet1!K4', '"34"');
            helper.edit('I27', '=CODE(Sheet1!K4)');
            expect(helper.invoke('getCell', [26, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[26].cells[8])).toBe('{"value":34,"formula":"=CODE(Sheet1!K4)"}');
            done();
        });
        it('CODE - XXIX', (done: Function) => {
            helper.edit('Sheet1!L2', '"34"');
            helper.edit('I28', '=CODE(Sheet1!L2)');
            expect(helper.invoke('getCell', [27, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[27].cells[8])).toBe('{"value":34,"formula":"=CODE(Sheet1!L2)"}');
            done();
        });
        it('CODE - XXX', (done: Function) => {
            helper.edit('A4', 'Sandals & Floaters');
            helper.edit('Sheet1!$B$4', '=LOWER(A4)');
            helper.edit('I29', '=CODE(Sheet1!$B$4)');
            expect(helper.invoke('getCell', [28, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[28].cells[8])).toBe('{"value":"#NAME?","formula":"=CODE(Sheet1!$B$4)"}');
            done();
        });
        it('CODE - XXXI', (done: Function) => {
            helper.edit('A4', 'Sandals & Floaters');
            helper.edit('Sheet1!B4', '=LOWER(A4)');
            helper.edit('I30', '=CODE(Sheet1!B4)');
            expect(helper.invoke('getCell', [29, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[29].cells[8])).toBe('{"value":"#NAME?","formula":"=CODE(Sheet1!B4)"}');
            done();
        });
        it('CODE - XXXII', (done: Function) => {
            helper.edit('A4', 'Sandals & Floaters');
            helper.edit('Sheet1!B4', '=LOWER(A4)');
            helper.edit('I31', '=CODE(Sheet1!$B4)');
            expect(helper.invoke('getCell', [30, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[30].cells[8])).toBe('{"value":"#NAME?","formula":"=CODE(Sheet1!$B4)"}');
            done();
        });
        it('CODE - XXXIII ', (done: Function) => {
            helper.edit('L3', '"33"');
            helper.edit('I32', '=CODE($L$3)');
            expect(helper.invoke('getCell', [31, 8]).textContent).toBe('34');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[31].cells[8])).toBe('{"value":34,"formula":"=CODE($L$3)"}');
            done();
        });
        it('CODE - Issue fixing: 889130 - Nested formula - 3', (done: Function) => {
            helper.edit('B18', '4Runner');
            helper.edit('Z1', '=CODE(T(B18))');
            expect(helper.invoke('getCell', [0, 25]).textContent).toBe('52');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[25])).toBe('{"value":52,"formula":"=CODE(T(B18))"}');
            done();
        });
    });

    describe('DOLLAR Formula Checking ->', () => {
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
        it('DOLLAR Formula without decimal values->', (done: Function) => {
            helper.edit('J1', '=DOLLAR(2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('$2.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"$2.00","formula":"=DOLLAR(2)"}');
            helper.edit('J2', '=DOLLAR(a)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":"#NAME?","formula":"=DOLLAR(a)"}');
            helper.edit('J3', '=DOLLAR(236)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('$236.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":"$236.00","formula":"=DOLLAR(236)"}');
            helper.edit('J4', '=DOLLAR(0)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('$0.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"$0.00","formula":"=DOLLAR(0)"}');
            helper.edit('J5', '=DOLLAR(2.566)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('$2.57');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"$2.57","formula":"=DOLLAR(2.566)"}');
            done();
        });
        it('DOLLAR Formula for no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('J6');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=DOLLAR()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=DOLLAR()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('J6', '=DOLLAR(145.322)');
            done();
        });
        it('DOLLAR Formula for alphanumeric inputs->', (done: Function) => {
            helper.edit('J7', '=DOLLAR(10A)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"#VALUE!","formula":"=DOLLAR(A10)"}');
            done();
        });
        it('DOLLAR Formula having floating number and no decimal arguments->', (done: Function) => {
            helper.edit('J8', '=DOLLAR(145.322)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('$145.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[9])).toBe('{"value":"$145.32","formula":"=DOLLAR(145.322)"}');
            done();
        });
        it('DOLLAR Formula having whole number and decimal arguments->', (done: Function) => {
            helper.edit('J9', '=DOLLAR(236,1)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('$236.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[9])).toBe('{"value":"$236.0","formula":"=DOLLAR(236,1)"}');
            done();
        });
        it('DOLLAR Formula having floating number and decimal arguments->', (done: Function) => {
            helper.edit('J10', '=DOLLAR(145.322,1)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('$145.3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[9])).toBe('{"value":"$145.3","formula":"=DOLLAR(145.322,1)"}');
            done();
        });
        it('DOLLAR Formula having floating number to be rounded off and decimal arguments->', (done: Function) => {
            helper.edit('J11', '=DOLLAR(173.898,2)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('$173.90');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[9])).toBe('{"value":"$173.90","formula":"=DOLLAR(173.898,2)"}');
            done();
        });
        it('DOLLAR Formula having floating number to be rounded off ->', (done: Function) => {
            helper.edit('J12', '=DOLLAR(173.464,1)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('$173.5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[9])).toBe('{"value":"$173.5","formula":"=DOLLAR(173.464,1)"}');
            done();
        });
        it('DOLLAR Formula with second input having five as decimals value->', (done: Function) => {
            helper.edit('J13', '=DOLLAR(123.123432,5)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('$123.12343');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[9])).toBe('{"value":"$123.12343","formula":"=DOLLAR(123.123432,5)"}');
            done();
        });
        it('DOLLAR Formula with whole number and second input having five decimals value->', (done: Function) => {
            helper.edit('J14', '=DOLLAR(457,5)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('$457.00000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[9])).toBe('{"value":"$457.00000","formula":"=DOLLAR(457,5)"}');
            done();
        });
        it('DOLLAR Formula with negative value as input->', (done: Function) => {
            helper.edit('J15', '=DOLLAR(-123.122,0)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('($123)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[9])).toBe('{"value":"($123)","formula":"=DOLLAR(-123.122,0)"}');
            helper.edit('J16', '=DOLLAR(-236)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('($236.00)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[9])).toBe('{"value":"($236.00)","formula":"=DOLLAR(-236)"}');
            helper.edit('J17', '=DOLLAR(-145.322)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('($145.32)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[9])).toBe('{"value":"($145.32)","formula":"=DOLLAR(-145.322)"}');
            helper.edit('J18', '=DOLLAR(-236,1)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('($236.0)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[9])).toBe('{"value":"($236.0)","formula":"=DOLLAR(-236,1)"}');
            done();
        });
        it('DOLLAR Formula having negative floating number and decimal arguments->', (done: Function) => {
            helper.edit('J19', '=DOLLAR(-145.322,1)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('($145.3)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[9])).toBe('{"value":"($145.3)","formula":"=DOLLAR(-145.322,1)"}');
            done();
        });
        it('DOLLAR Formula having negative floating number to be rounded off and decimal arguments->', (done: Function) => {
            helper.edit('J20', '=DOLLAR(-173.898,2)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('($173.90)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[9])).toBe('{"value":"($173.90)","formula":"=DOLLAR(-173.898,2)"}');
            done();
        });
        it('DOLLAR Formula having negative floating number to be rounded off ->', (done: Function) => {
            helper.edit('J21', '=DOLLAR(-173.464,1)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('($173.5)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[9])).toBe('{"value":"($173.5)","formula":"=DOLLAR(-173.464,1)"}');
            done();
        });
        it('DOLLAR Formula having negative floating number and five as decimal value->', (done: Function) => {
            helper.edit('J22', '=DOLLAR(-123.123432,5)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('($123.12343)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[9])).toBe('{"value":"($123.12343)","formula":"=DOLLAR(-123.123432,5)"}');
            done();
        });
        it('DOLLAR Formula with negative number and second input having five decimals value->', (done: Function) => {
            helper.edit('J23', '=DOLLAR(-457,5)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('($457.00000)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[9])).toBe('{"value":"($457.00000)","formula":"=DOLLAR(-457,5)"}');
            done();
        });
        it('DOLLAR Formula with zero as number->', (done: Function) => {
            helper.edit('J24', '=DOLLAR(0)');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('$0.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[9])).toBe('{"value":"$0.00","formula":"=DOLLAR(0)"}');
            done();
        });
        it('DOLLAR Formula with zero as number and zero as decimals->', (done: Function) => {
            helper.edit('J25', '=DOLLAR(0,0)');
            expect(helper.invoke('getCell', [24, 9]).textContent).toBe('$0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[24].cells[9])).toBe('{"value":"$0","formula":"=DOLLAR(0,0)"}');
            done();
        });
        it('DOLLAR Formula with zero as number and decimal value as second arguments->', (done: Function) => {
            helper.edit('J26', '=DOLLAR(0,4)');
            expect(helper.invoke('getCell', [25, 9]).textContent).toBe('$0.0000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[25].cells[9])).toBe('{"value":"$0.0000","formula":"=DOLLAR(0,4)"}');
            done();
        });
        it('DOLLAR Formula with negative decimal value as second arguments->', (done: Function) => {
            helper.edit('K1', '=DOLLAR(574,-1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('$570');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"$570","formula":"=DOLLAR(574,-1)"}');
            helper.edit('K2', '=DOLLAR(123.32,-2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('$100');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"$100","formula":"=DOLLAR(123.32,-2)"}');
            helper.edit('K3', '=DOLLAR(,-5)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('$0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"$0","formula":"=DOLLAR(,-5)"}');
            helper.edit('K4', '=DOLLAR(1232,-6)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('$0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"$0","formula":"=DOLLAR(1232,-6)"}');
            helper.edit('K5', '=DOLLAR(-4539,-2)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('($4,500)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"($4,500)","formula":"=DOLLAR(-4539,-2)"}');
            helper.edit('K6', '=DOLLAR(-0.123,3)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('($0.123)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"($0.123)","formula":"=DOLLAR(-0.123,3)"}');
            done();
        });
        it('DOLLAR Formula with worst case values as arguments->', (done: Function) => {
            helper.edit('K7', '=DOLLAR(One,2)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"#NAME?","formula":"=DOLLAR(One,2)"}');
            helper.edit('K8', '=DOLLAR(1,Two)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[10])).toBe('{"value":"#NAME?","formula":"=DOLLAR(1,Two)"}');
            helper.edit('K9', '=DOLLAR(a)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[10])).toBe('{"value":"#NAME?","formula":"=DOLLAR(a)"}');
            helper.edit('K10', '=DOLLAR("One",2)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[9].cells[10].formula).toEqual('=DOLLAR("One",2)');
            helper.edit('K11', '=DOLLAR(1,"Two")');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[10].cells[10].formula).toEqual('=DOLLAR(1,"Two")');
            helper.edit('K12', '=DOLLAR("")');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[11].cells[10].formula).toEqual('=DOLLAR("")');
            done();
        });
        it('DOLLAR Formula with empty arguments->', (done: Function) => {
            helper.edit('K13', '=DOLLAR(,)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('$0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[10])).toBe('{"value":"$0","formula":"=DOLLAR(,)"}');
            helper.edit('K14', '=DOLLAR(,3)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('$0.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[10])).toBe('{"value":"$0.000","formula":"=DOLLAR(,3)"}');
            helper.edit('K15', '=DOLLAR(5,)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('$5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[10])).toBe('{"value":"$5","formula":"=DOLLAR(5,)"}');
            helper.edit('K16', '=DOLLAR(0.5,)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('$1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[10])).toBe('{"value":"$1","formula":"=DOLLAR(0.5,)"}');
            done();
        });
        it('DOLLAR Formula with logical values as arguments->', (done: Function) => {
            helper.edit('K17', '=DOLLAR(True,2)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('$1.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[10])).toBe('{"value":"$1.00","formula":"=DOLLAR(True,2)"}');
            helper.edit('K18', '=DOLLAR(False,2)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('$0.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[10])).toBe('{"value":"$0.00","formula":"=DOLLAR(False,2)"}');
            helper.edit('K19', '=DOLLAR(1,true)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('$1.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[10])).toBe('{"value":"$1.0","formula":"=DOLLAR(1,true)"}');
            helper.edit('K20', '=DOLLAR(1,false)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('$1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[10])).toBe('{"value":"$1","formula":"=DOLLAR(1,false)"}');
            helper.edit('K21', '=DOLLAR(TRUE,TRUE)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('$1.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[10])).toBe('{"value":"$1.0","formula":"=DOLLAR(TRUE,TRUE)"}');
            helper.edit('K22', '=DOLLAR(FALSE,FALSE)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('$0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[10])).toBe('{"value":"$0","formula":"=DOLLAR(FALSE,FALSE)"}');
            helper.edit('K23', '=DOLLAR("TRUE")');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[22].cells[10].formula).toEqual('=DOLLAR("TRUE")');
            done();
        });
        it('DOLLAR Formula with cell refernces logical values as arguments->', (done: Function) => {
            helper.edit('L1', '=DOLLAR(I2,4)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('$1.0000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":"$1.0000","formula":"=DOLLAR(I2,4)"}');
            helper.edit('L2', '=DOLLAR(I4,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('$0.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"$0.000","formula":"=DOLLAR(I4,3)"}');
            helper.edit('L3', '=DOLLAR(I3,I4)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('$1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":"$1","formula":"=DOLLAR(I3,I4)"}');
            helper.edit('L4', '=DOLLAR(I4,I2)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('$0.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"$0.0","formula":"=DOLLAR(I4,I2)"}');
            helper.edit('L5', '=DOLLAR(17,I3)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('$17.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"$17.0","formula":"=DOLLAR(17,I3)"}');
            helper.edit('L6', '=DOLLAR(23,I4)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('$23');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"value":"$23","formula":"=DOLLAR(23,I4)"}');
            helper.edit('L7', '=DOLLAR(-32,I3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('($32.0)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"value":"($32.0)","formula":"=DOLLAR(-32,I3)"}');
            done();
        });
        it('DOLLAR Formula with differnct kind of cell refernce values as arguments->', (done: Function) => {
            helper.edit('L8', '=DOLLAR(A2,2)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"value":"#VALUE!","formula":"=DOLLAR(A2,2)"}');
            helper.edit('L9', '=DOLLAR(B3,3)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('$41,801.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"value":"$41,801.000","formula":"=DOLLAR(B3,3)"}');
            helper.edit('L10', '=DOLLAR(C5,2)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('$0.27');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":"$0.27","formula":"=DOLLAR(C5,2)"}');
            helper.edit('L11', '=DOLLAR(D4,7)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('$20.0000000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[11])).toBe('{"value":"$20.0000000","formula":"=DOLLAR(D4,7)"}');
            helper.edit('L12', '=DOLLAR(F4)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('$300.00');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"$300.00","formula":"=DOLLAR(F4)"}');
            helper.edit('L13', '=DOLLAR(I6,1)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('$103.3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":"$103.3","formula":"=DOLLAR(I6,1)"}');
            helper.edit('L14', '=DOLLAR(I8,3)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('($3,221.000)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"($3,221.000)","formula":"=DOLLAR(I8,3)"}');
            helper.edit('L15', '=DOLLAR(I11,4)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[11])).toBe('{"value":"#VALUE!","formula":"=DOLLAR(I11,4)"}');
            helper.edit('L16', '=DOLLAR(I16,1)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('$12.8');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[11])).toBe('{"value":"$12.8","formula":"=DOLLAR(I16,1)"}');
            helper.edit('L17', '=DOLLAR(I17,1)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('$12.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[11])).toBe('{"value":"$12.0","formula":"=DOLLAR(I17,1)"}');
            helper.edit('L18', '=DOLLAR(I19,3)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('$2.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[11])).toBe('{"value":"$2.000","formula":"=DOLLAR(I19,3)"}');
            done();
        });
        it('DOLLAR Formula with cell refernce values as second arguments->', (done: Function) => {
            helper.edit('L19', '=DOLLAR(-32,G2)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('($32.0)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[11])).toBe('{"value":"($32.0)","formula":"=DOLLAR(-32,G2)"}');
            helper.edit('L20', '=DOLLAR(1000,G4)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('$1,000.0000000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[11])).toBe('{"value":"$1,000.0000000","formula":"=DOLLAR(1000,G4)"}');
            helper.edit('L21', '=DOLLAR(153.27,1)');
            expect(helper.invoke('getCell', [20, 11]).textContent).toBe('$153.3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[11])).toBe('{"value":"$153.3","formula":"=DOLLAR(153.27,1)"}');
            helper.edit('L22', '=DOLLAR(I13,G8)');
            expect(helper.invoke('getCell', [21, 11]).textContent).toBe('$119.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[11])).toBe('{"value":"$119.000","formula":"=DOLLAR(I13,G8)"}');
            helper.edit('L23', '=DOLLAR(F10,G2)');
            expect(helper.invoke('getCell', [22, 11]).textContent).toBe('$1,210.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[11])).toBe('{"value":"$1,210.0","formula":"=DOLLAR(F10,G2)"}');
            done();
        });
        it('DOLLAR Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M1', '=DOLLAR($G$5,$G$8)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('$11.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":"$11.000","formula":"=DOLLAR($G$5,$G$8)"}');
            helper.edit('M2', '=DOLLAR(6,$G$8)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('$6.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":"$6.000","formula":"=DOLLAR(6,$G$8)"}');
            helper.edit('M3', '=DOLLAR($F$7,-3)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('$1,000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":"$1,000","formula":"=DOLLAR($F$7,-3)"}');
            done();
        });
        it('DOLLAR Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M4', '=DOLLAR(Sheet2!A3,Sheet1!G2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('$6.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":"$6.0","formula":"=DOLLAR(Sheet2!A3,Sheet1!G2)"}');
            helper.edit('M5', '=DOLLAR(Sheet1!E3,Sheet2!A3)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('$30.000000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":"$30.000000","formula":"=DOLLAR(Sheet1!E3,Sheet2!A3)"}');
            helper.edit('M6', '=DOLLAR(Sheet2!A6,Sheet2!A4)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('$35.000000000000000000000000000000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[12])).toBe('{"value":"$35.000000000000000000000000000000","formula":"=DOLLAR(Sheet2!A6,Sheet2!A4)"}');
            helper.edit('M7', '=DOLLAR(Sheet1!D6,Sheet1!I10)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('$30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[12])).toBe('{"value":"$30","formula":"=DOLLAR(Sheet1!D6,Sheet1!I10)"}');
            done();
        });
        it('DOLLAR Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('M8', '=DOLLAR(Sheet2!$A$3,Sheet1!$G$2)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('$6.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[12])).toBe('{"value":"$6.0","formula":"=DOLLAR(Sheet2!$A$3,Sheet1!$G$2)"}');
            helper.edit('M9', '=DOLLAR(Sheet1!$E$3,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('$30.000000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[12])).toBe('{"value":"$30.000000","formula":"=DOLLAR(Sheet1!$E$3,Sheet2!$A$3)"}');
            helper.edit('M10', '=DOLLAR(Sheet2!$A$4,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('$30.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[12])).toBe('{"value":"$30.000","formula":"=DOLLAR(Sheet2!$A$4,Sheet2!$A$5)"}');
            helper.edit('M11', '=DOLLAR(Sheet1!$D$6,Sheet1!$I$10)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('$30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[12])).toBe('{"value":"$30","formula":"=DOLLAR(Sheet1!$D$6,Sheet1!$I$10)"}');
            helper.edit('M12', '=DOLLAR(Sheet2!$A$4,$G$2)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('$30.0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[12])).toBe('{"value":"$30.0","formula":"=DOLLAR(Sheet2!$A$4,$G$2)"}');
            helper.edit('M13', '=DOLLAR(E3,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('$30.000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[12])).toBe('{"value":"$30.000","formula":"=DOLLAR(E3,Sheet2!$A$5)"}');
            done();
        });
        it('DOLLAR Formula with text string enclosed in double quotes as arguments->', (done: Function) => {
            helper.edit('M14', '="This is Result = "&DOLLAR(132,0)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('This is Result = $132');
            helper.edit('M15', '="The Dollar "&DOLLAR(83,1)" Price is High"');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('The Dollar $83.0 Price is High');
            done();
        });
        it('DOLLAR Formula with second argument values as cell references that contains DATE value ->', (done: Function) => {
            helper.edit('M16', '=DOLLAR(B3,B2)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#VALUE!');
            helper.edit('M17', '=DOLLAR(12,B7)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#VALUE!');
            done();
        });
    });
});
