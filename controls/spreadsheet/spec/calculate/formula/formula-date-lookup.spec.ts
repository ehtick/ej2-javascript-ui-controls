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

    // Date - Date & Time Category Formulas
    describe('EJ2-834243', () => {
        const model: SpreadsheetModel = {
            sheets: [{
                rows: [
                    { cells: [{ value: 'TRUE' }, { formula: '=DAY(A1)' }, { formula: '=DAY(TRUE)' }, { index: 4, formula: '=DATE(A1,A6,A7)' }, { formula: '=DATE(TRUE,A6,A7)' }] },
                    { cells: [{ value: 'FALSE' }, { formula: '=DAY(A2)' }, { formula: '=DAY(FALSE)' }, { index: 4, formula: '=DATE(A6,A7,A2)' }, { formula: '=DATE(A6,A7,FALSE)' }] },
                    { cells: [{ value: '100', format: '$#,##0.00' }, { formula: '=DAY(A3)' }, { index: 4, formula: '=DATE(10000,1,2)' }, { formula: '=DATE(10000,-1,1)' }] },
                    { cells: [{ value: '1', format: '0.00%' }, { formula: '=DAY(A4)' }, { index: 4, formula: '=DATE(0,-1,30)' }, { formula: '=DATE(0,1,1)' }] },
                    { cells: [{ value: '10', format: '0.00E+00' }, { formula: '=DAY(A5)' }, { index: 4, formula: '=DATE(9999,12,32)' }, { formula: '=DATE(10000,1,-1000)' }] },
                    { cells: [{ value: '10' }, { formula: '=DAY(A6)' }, { formula: '=DAY(6A)' }, { index: 4, formula: '=DATE(A3,Sheet1!A4,Sheet1!$A$5)' }, { formula: '=DATE(A3,Sheet1!A4,Sheet2!$A$2)' }] },
                    { cells: [{ value: '50' }, { formula: '=DAY($A$7)' }, { formula: '=DAY("7A")' }, { formula: '=DAY(Sheet2!$A$2)' }, { index: 4, formula: '=DATE(A6,Sheet2!$A$2,Sheet2!A1)' }, { formula: '=DATE(Sheet2!$A$1,Sheet2!$A$2,Sheet2!$A$1)' }] },
                    { cells: [{ formula: '=SUM(A6,A7)' }, { formula: '=DAY(Sheet1!$A$8)' }, { formula: '=DAY(Sheet2!A3)' }, { index: 4, formula: '=DATE(SUM(A6,A7),A5,A6)' }] },
                    { cells: [{ value: '"33"' }, { formula: '=DAY(A9)' }, { formula: '=DAY("33")' }, { index: 4, formula: '=DATE(A9,A9,A9)' }, { formula: '=DATE(2000,10,"30")' }] },
                    { cells: [{ value: 'text' }, { formula: '=DAY(A10)' }, { formula: '=DAY(text)' }, { index: 4, formula: '=DATE(A10,A10,A10)' }, { formula: '=DATE(2000,10,"text")' }] },
                    { cells: [{ value: 'text01' }, { formula: '=DAY(A11)' }, { formula: '=DAY(text01)' }, { index: 4, formula: '=DATE(A11,A11,A11)' }, { formula: '=DATE(2000,10,text01)' }] },
                    { cells: [{ value: '"text01"' }, { formula: '=DAY(A12)' }, { formula: '=DAY("text01")' }, { index: 4, formula: '=DATE(A12,A12,A12)' }, { formula: '=DATE(2000,10,"text01")' }] },
                    { cells: [{ value: '10/31/1900' }, { formula: '=DAY(A13)' }, { formula: '=DAY(10/31/1900)' }, { index: 4, formula: '=DATE(A13,A13,A13)' }, { formula: '=DATE(2000,10,A13)' }] },
                    { cells: [{ value: '"10/22/2000"' }, { formula: '=DAY(A14)' }, { formula: '=DAY("10/22/2000")' }, { index: 4, formula: '=DATE(A14,A14,A14)' }, { formula: '=DATE(2000,10,A14)' }] },
                    { cells: [{ value: '0' }, { formula: '=DAY(A15)' }, { formula: '=DAY(0)' }, { index: 4, formula: '=DATE(A15,A15,A15)' }, { formula: '=DATE(0,0,0)' }, { formula: '=DATE(2000,0,10)' }] },
                    { cells: [{ value: '"0"' }, { formula: '=DAY(A16)' }, { formula: '=DAY("0")' }, { index: 4, formula: '=DATE(A16,A16,A16)' }, { formula: '=DATE("0","0","0")' }, { formula: '=DATE(2000,"0",10)' }] },
                    { cells: [{ value: '' }, { formula: '=DAY(A17)' }, { formula: '=DAY(Sheet1!$A$6)' }, { index: 4, formula: '=DATE(A17,A17,A17)' }, { formula: '=DATE(,,)' }, { formula: '=DATE(2000,,10)' }] },
                    { cells: [{ value: '""' }, { formula: '=DAY(A18)' }, { formula: '=DAY("")' }, { index: 4, formula: '=DATE(A18,A18,A18)' }, { formula: '=DATE("","","")' }, { formula: '=DATE(2000,10,A18)' }] },
                    { cells: [{ value: '15/30/2014' }, { formula: '=DAY(A19)' }, { formula: '=DAY($A$13)' }, { index: 4, formula: '=DATE(2000,A19,10)' }, { formula: '=DATE("","","")' }, { formula: '=DATE(2000,10,"")' }] },
                    { cells: [{ value: '#REF!' }, { formula: '=DAY(A20)' }, { index: 4, formula: '=DATE(A20,A20,A20)' }, { formula: '=DATE(2000,A20,10)' }] },
                    { cells: [{ value: '8/21/1900  11:45:00 AM' }, { formula: '=DAY(A21)' }, { index: 4, formula: '=DATE(2000,10,A21)' }] },
                    { cells: [{ index: 1, formula: '=DAY(2/14)' }, { index: 4, formula: '=DATE(2000,10,"TRUE")' }, { formula: '=DATE(2000,FALSE,TRUE)' }] },
                    { cells: [{ index: 1, formula: '=DAY(2/14/2014)' }, { index: 4, formula: '=DATE(2000,MONTH(15),DAY(30))' }] },
                    { cells: [{ index: 1, formula: '=DAY(234.45623)' }, { index: 4, formula: '=DATE(2000,10,DAYS(25,12))' }] },
                    { cells: [{ index: 1, formula: '=DAY(SUM(A7,A8))' }, { index: 4, formula: '=DATE(2000,SUM(A7,A8),10)' }] }
                ]
            }, {
                rows: [{ cells: [{ value: '10' }] }, { cells: [{ value: '50' }] }, { cells: [{ formula: '=SUM(A1,A2)' }] }, { cells: [{ value: '10/31/1800' }] }]
            }]
        };
        beforeEach((done: Function) => {
            helper.initializeSpreadsheet(model, done);
        });
        afterEach(() => {
            helper.invoke('destroy');
        });
        it('DAY formula checking', (done: Function) => {
            expect(helper.getInstance().sheets[0].rows[0].cells[1].value).toEqual(1);
            expect(helper.getInstance().sheets[0].rows[1].cells[1].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[0].cells[2].value).toEqual(1);
            expect(helper.getInstance().sheets[0].rows[1].cells[2].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[2].cells[1].value).toEqual(9);
            expect(helper.getInstance().sheets[0].rows[3].cells[1].value).toEqual(1);
            expect(helper.getInstance().sheets[0].rows[4].cells[1].value).toEqual(10);
            expect(helper.getInstance().sheets[0].rows[5].cells[1].value).toEqual(10);
            expect(helper.getInstance().sheets[0].rows[5].cells[2].value).toEqual(10);
            expect(helper.getInstance().sheets[0].rows[6].cells[1].value).toEqual(19);
            expect(helper.getInstance().sheets[0].rows[6].cells[2].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[7].cells[1].value).toEqual(1);
            expect(helper.getInstance().sheets[0].rows[7].cells[2].value).toEqual(1);
            expect(helper.getInstance().sheets[0].rows[8].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[8].cells[2].value).toEqual(2);
            expect(helper.getInstance().sheets[0].rows[9].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[9].cells[2].value).toEqual('#NAME?');
            expect(helper.getInstance().sheets[0].rows[10].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[10].cells[2].value).toEqual('#NAME?');
            expect(helper.getInstance().sheets[0].rows[11].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[11].cells[2].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[12].cells[1].value).toEqual(31);
            expect(helper.getInstance().sheets[0].rows[12].cells[2].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[13].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[13].cells[2].value).toEqual(22);
            expect(helper.getInstance().sheets[0].rows[14].cells[1].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[14].cells[2].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[15].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[15].cells[2].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[16].cells[1].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[16].cells[2].value).toEqual(10);
            expect(helper.getInstance().sheets[0].rows[17].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[17].cells[2].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[18].cells[1].value).toEqual('#VALUE!');
            expect(helper.getInstance().sheets[0].rows[18].cells[2].value).toEqual(31);
            expect(helper.getInstance().sheets[0].rows[19].cells[1].value).toEqual('#REF!');
            expect(helper.getInstance().sheets[0].rows[20].cells[1].value).toEqual(21);
            expect(helper.getInstance().sheets[0].rows[21].cells[1].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[22].cells[1].value).toEqual(0);
            expect(helper.getInstance().sheets[0].rows[23].cells[1].value).toEqual(21);
            expect(helper.getInstance().sheets[0].rows[24].cells[1].value).toEqual(19);
            done();
        });
        it('DATE formula checking', (done: Function) => {
            expect(helper.invoke('getCell', [0, 4]).textContent).toBe('11/19/1901');
            expect(helper.invoke('getCell', [0, 5]).textContent).toBe('11/19/1901');
            expect(helper.invoke('getCell', [1, 4]).textContent).toBe('1/31/1914');
            expect(helper.invoke('getCell', [1, 5]).textContent).toBe('1/31/1914');
            expect(helper.invoke('getCell', [2, 4]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [2, 5]).textContent).toBe('11/1/9999');
            expect(helper.invoke('getCell', [3, 4]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [3, 5]).textContent).toBe('1/1/1900');
            expect(helper.invoke('getCell', [4, 4]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [4, 5]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [5, 4]).textContent).toBe('1/10/2000');
            expect(helper.invoke('getCell', [5, 5]).textContent).toBe('2/19/2000');
            expect(helper.invoke('getCell', [6, 4]).textContent).toBe('2/10/1914');
            expect(helper.invoke('getCell', [6, 5]).textContent).toBe('2/10/1914');
            expect(helper.invoke('getCell', [7, 4]).textContent).toBe('10/10/1960');
            expect(helper.invoke('getCell', [8, 4]).textContent).toBe('10/3/1935');
            expect(helper.invoke('getCell', [8, 5]).textContent).toBe('10/30/2000');
            expect(helper.invoke('getCell', [9, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [9, 5]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [10, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [10, 5]).textContent).toBe('#NAME?');
            expect(helper.invoke('getCell', [11, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [11, 5]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [12, 4]).textContent).toBe('3/1/2231');
            expect(helper.invoke('getCell', [12, 5]).textContent).toBe('8/1/2001');
            expect(helper.invoke('getCell', [13, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [13, 5]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [14, 4]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [14, 5]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [14, 6]).textContent).toBe('12/10/1999');
            expect(helper.invoke('getCell', [15, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [15, 5]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [15, 6]).textContent).toBe('12/10/1999');
            expect(helper.invoke('getCell', [16, 4]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [16, 5]).textContent).toBe('#NUM!');
            expect(helper.invoke('getCell', [16, 6]).textContent).toBe('12/10/1999');
            expect(helper.invoke('getCell', [17, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [17, 5]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [17, 6]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [18, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [18, 5]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [18, 6]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [19, 4]).textContent).toBe('#REF!');
            expect(helper.invoke('getCell', [19, 5]).textContent).toBe('#REF!');
            expect(helper.invoke('getCell', [20, 4]).textContent).toBe('5/22/2001');
            expect(helper.invoke('getCell', [21, 4]).textContent).toBe('#VALUE!');
            expect(helper.invoke('getCell', [21, 5]).textContent).toBe('12/1/1999');
            expect(helper.invoke('getCell', [22, 4]).textContent).toBe('1/30/2000');
            expect(helper.invoke('getCell', [23, 4]).textContent).toBe('10/13/2000');
            expect(helper.invoke('getCell', [24, 4]).textContent).toBe('2/10/2009');
            done();
        });
    });

    describe('Formula - Checking II ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('Date formula->', (done: Function) => {
            helper.edit('O1', '1998');
            helper.edit('P1', '12');
            helper.edit('Q1', '26');
            helper.edit('I1', '=DATE(O1,P1,Q1);');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('12/26/1998');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"36155","formula":"=DATE(O1,P1,Q1);","format":"m/d/yyyy","formattedText":"12/26/1998"}');
            done();
        });
        it('Date formula with month having value more than 12->', (done: Function) => {
            helper.edit('P1', '22');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('10/26/1999');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"36459","formula":"=DATE(O1,P1,Q1);","format":"m/d/yyyy","formattedText":"10/26/1999"}');
            done();
        });
        it('Date formula with year having negative values->', (done: Function) => {
            helper.edit('P1', '12');
            helper.edit('O1', '-1998');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DATE(O1,P1,Q1);","format":"m/d/yyyy"}');
            done();
        });
        it('Date formula with having inputs as 0->', (done: Function) => {
            helper.edit('O1', '0');
            helper.edit('P1', '0');
            helper.edit('Q1', '0');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DATE(O1,P1,Q1);","format":"m/d/yyyy"}');
            done();
        });
        it('FLOOR formula with wrong inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=FLOOR(12.9,1,3);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=FLOOR(12.9,1,3);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I2', '=FLOOR(12.9,1);');
            done();
        });
        it('CEILING formula with wrong inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=CEILING(12.5, 3, 2);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=CEILING(12.5, 3, 2);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I3', '=CEILING(12.5,1);');
            done();
        });
        it('DAY formula with wrong inputs>', (done: Function) => {
            helper.edit('I4', '=DAY("B5");');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].formula).toBe('=DAY("B5");');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('DAYS formula with giving value True as input for error Checking->', (done: Function) => {
            helper.edit('I5', '=DAYS(True, October);');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#NAME?","formula":"=DAYS(True, October);"}');
            done();
        });
        it('DAYS formula with giving value False as input for error Checking>', (done: Function) => {
            helper.edit('I6', '=DAYS(False, October);');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#NAME?","formula":"=DAYS(False, October);"}');
            done();
        });
        it('DAYS formula with giving value True & False as input ->', (done: Function) => {
            helper.edit('I7', '=DAYS(True, False);');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":1,"formula":"=DAYS(True, False);"}');
            done();
        });
        it('DAYS formula with giving single value input->', (done: Function) => {
            helper.edit('I8', '=DAYS(2022,);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('2022');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":2022,"formula":"=DAYS(2022,);"}');
            done();
        });
        it('DAYS formula with giving # as input for End Date->', (done: Function) => {
            helper.edit('I9', '=DAYS("#-October-2022", "26-December-2022");');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=DAYS("#-October-2022", "26-December-2022");');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('DAYS formula with giving # as input for Start Date->', (done: Function) => {
            helper.edit('I10', '=DAYS("20-October-2022", "#-December-2022");');
            expect(helper.getInstance().sheets[0].rows[9].cells[8].formula).toBe('=DAYS("20-October-2022", "#-December-2022");');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('T formula->', (done: Function) => {
            helper.edit('I11', '=T(A3);');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('Sports Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"Sports Shoes","formula":"=T(A3);"}');
            done();
        });
        it('T formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I12');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=T();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=T();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I12', '=T("hello");');
            done();
        });
        it('T formula with Number value input->', (done: Function) => {
            helper.edit('I13', '=T(D5);');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"","formula":"=T(D5);"}');
            done();
        });
        it('T formula with Date value input->', (done: Function) => {
            helper.edit('I14', '=T(B5);');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[8])).toBe('{"value":"","formula":"=T(B5);"}');
            done();
        });
        it('T formula with Time value input->', (done: Function) => {
            helper.edit('I15', '=T(C5);');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":"","formula":"=T(C5);"}');
            done();
        });
        it('T formula with : ->', (done: Function) => {
            helper.edit('I16', '=T(A3:A4);');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('Sports Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":"Sports Shoes","formula":"=T(A3:A4);"}');
            done();
        });
    });

    describe('Base module cases I->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Date formula with month > 12 and day > 31->', (done: Function) => {
            helper.edit('K7', '=DATE(2022,25,33)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('2/2/2024');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[10])).toBe('{"value":"45324","formula":"=DATE(2022,25,33)","format":"m/d/yyyy","formattedText":"2/2/2024"}');
            done();
        });
    });

    describe('Reported day formula - Checking -> III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DAY formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=DAY(10000000)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAY(10000000)"}');
            done();
        });
        it('DAY formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I2', '=DAY(DATEVALUE("08/23/2023"))');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('23');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":23,"formula":"=DAY(DATEVALUE(\\"08/23/2023\\"))"}');
            done();
        });
        it('DAY formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I3', '=DAY("APR-07-2020")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":7,"formula":"=DAY(\\"APR-07-2020\\")"}');
            done();
        });
        it('DAY formula with cell Reference - 4->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'General', refersTo: 'I4' });
            helper.edit('I4', '4/7/2020');
            helper.edit('I5', '=DAY(I4)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":7,"formula":"=DAY(I4)"}');
            done();
        });
    });

    describe('Reported DAYS formula - Checking -> IV ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DAYS formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=DAYS(48567,-4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(48567,-4)"}');
            done();
        });
        it('DAYS formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I1', '=DAYS(45321,0)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('45321');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":45321,"formula":"=DAYS(45321,0)"}');
            done();
        });
        it('DAYS formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I1', '=DAYS(-45355,-432)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(-45355,-432)"}');
            done();
        });
        it('DAYS formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I1', '=DAYS(5432,-3432)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(5432,-3432)"}');
            done();
        });
        it('DAYS formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I1', '=DAYS("45943.43","-43")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(\\"45943.43\\",\\"-43\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 6->', (done: Function) => {
            helper.edit('I1', '=DAYS(3-Mar-23,1-Jan-23)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=DAYS(3-Mar-23,1-Jan-23)"}');
            done();
        });
        it('DAYS formula with cell Reference - 7->', (done: Function) => {
            helper.edit('I1', '=DAYS(TRUE,FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=DAYS(TRUE,FALSE)"}');
            done();
        });
        it('DAYS formula with cell Reference - 8->', (done: Function) => {
            helper.edit('I1', '=DAYS(FALSE,TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-1,"formula":"=DAYS(FALSE,TRUE)"}');
            done();
        });
        it('DAYS formula with cell Reference - 9->', (done: Function) => {
            helper.edit('I1', '=DAYS("TRUE",FALSE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(\\"TRUE\\",FALSE)"}');
            done();
        });
        it('DAYS formula with cell Reference - 10->', (done: Function) => {
            helper.edit('I1', '=DAYS("TRUE","FALSE")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(\\"TRUE\\",\\"FALSE\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 11->', (done: Function) => {
            helper.edit('I1', '=DAYS(49854-32,4532+45)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('45245');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":45245,"formula":"=DAYS(49854-32,4532+45)"}');
            done();
        });
        it('DAYS formula with cell Reference - 12->', (done: Function) => {
            helper.edit('I1', '=DAYS(45+43,32-34)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(45+43,32-34)"}');
            done();
        });
        it('DAYS formula with cell Reference - 13->', (done: Function) => {
            helper.edit('I1', '=DAYS(,"03/21/2020")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-43911');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-43911,"formula":"=DAYS(,\\"03/21/2020\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I1', '=DAYS("3/12/2020",)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('43902');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":43902,"formula":"=DAYS(\\"3/12/2020\\",)"}');
            done();
        });
        it('DAYS formula with cell Reference - 15->', (done: Function) => {
            helper.edit('I1', '=DAYS("","4/13/2021")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(\\"\\",\\"4/13/2021\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 16->', (done: Function) => {
            helper.edit('I1', '=DAYS(" ",45365)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(\\" \\",45365)"}');
            done();
        });
        it('DAYS formula with cell Reference - 17->', (done: Function) => {
            helper.edit('I1', '=DAYS("","")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(\\"\\",\\"\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I1', '=DAYS(34,"")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(34,\\"\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 18->', (done: Function) => {
            helper.edit('H6', '9578.45324235');
            helper.edit('H2', '8529.22456');
            helper.edit('A13', '-435.54');
            helper.edit('A14', '-1231');
            helper.edit('D17', '"2133"');
            helper.edit('D14', '"1"');
            helper.edit('D12', '"-45.43"');
            helper.edit('D15', '"212"');
            helper.edit('D13', '"-3453"');
            helper.edit('I19', '6/25/2023');
            helper.edit('B14', 'TRUE');
            helper.edit('B18', 'FALSE');
            helper.edit('B17', 'TRUE');
            helper.edit('B24', '"TRUE"');
            helper.edit('B25', '"FALSE"');
            helper.edit('B11', '10/31/2014');
            helper.edit('B16', 'TRUE');
            helper.edit('F20', '""');
            helper.edit('A20', '0');
            helper.edit('B7', '7/22/2014');
            helper.edit('C6', '12:43:59 AM');
            helper.edit('E7', '20');
            helper.edit('E4', '0.000000065');
            helper.edit('G6', '1000%');
            helper.edit('C17', 'hi');
            helper.edit('C18', '@');
            helper.edit('C19', 'A123@');
            helper.edit('C21', 'Jim324');
            helper.edit('B15', 'TRUE');
            helper.edit('B8', '2/4/2014');
            helper.edit('B9', '11/30/2014');
            helper.edit('C11', '12:01:44 AM');
            helper.edit('C8', '3:44:34 AM');
            helper.edit('C26', '');
            helper.edit('I16', '8/22/2011');
            done();
        });
        it('DAYS formula with cell Reference - 19->', (done: Function) => {
            helper.edit('I1', '=DAYS(H6,A13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(H6,A13)"}');
            done();
        });
        it('DAYS formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I1', '=DAYS(A14,H2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(A14,H2)"}');
            done();
        });
        it('DAYS formula with cell Reference - 21->', (done: Function) => {
            helper.edit('I1', '=DAYS(A13,A14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NUM!","formula":"=DAYS(A13,A14)"}');
            done();
        });
        it('DAYS formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I1', '=DAYS(D17,D14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(D17,D14)"}');
            done();
        });
        it('DAYS formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I1', '=DAYS(D12,D15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(D12,D15)"}');
            done();
        });
        it('DAYS formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I1', '=DAYS(D17,D14)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(D17,D14)"}');
            done();
        });
        it('DAYS formula with cell Reference - 25->', (done: Function) => {
            helper.edit('I1', '=DAYS(D14,D13)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(D14,D13)"}');
            done();
        });
        it('DAYS formula with cell Reference - 26->', (done: Function) => {
            helper.edit('I1', '=DAYS(I19,I160)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('45102');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":45102,"formula":"=DAYS(I19,I160)"}');
            done();
        });
        it('DAYS formula with cell Reference - 27->', (done: Function) => {
            helper.edit('I1', '=DAYS(B14,B18)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1,"formula":"=DAYS(B14,B18)"}');
            done();
        });
        it('DAYS formula with cell Reference - 28->', (done: Function) => {
            helper.edit('I1', '=DAYS(B18,B17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-1,"formula":"=DAYS(B18,B17)"}');
            done();
        });
        it('DAYS formula with cell Reference - 29->', (done: Function) => {
            helper.edit('I1', '=DAYS(B24,B17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(B24,B17)"}');
            done();
        });
        it('DAYS formula with cell Reference - 30->', (done: Function) => {
            helper.edit('I1', '=DAYS(B25,B240)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(B25,B240)"}');
            done();
        });
        it('DAYS formula with cell Reference - 31->', (done: Function) => {
            helper.edit('I1', '=DAYS(B11,B16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41942');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41942,"formula":"=DAYS(B11,B16)"}');
            done();
        });
        it('DAYS formula with cell Reference - 32->', (done: Function) => {
            helper.edit('I1', '=DAYS(E24,B11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-41943');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-41943,"formula":"=DAYS(E24,B11)"}');
            done();
        });
        it('DAYS formula with cell Reference - 33->', (done: Function) => {
            helper.edit('I1', '=DAYS(B11,C26)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41943');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41943,"formula":"=DAYS(B11,C26)"}');
            done();
        });
        it('DAYS formula with cell Reference - 34->', (done: Function) => {
            helper.edit('I1', '=DAYS(F20,B11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(F20,B11)"}');
            done();
        });
        it('DAYS formula with cell Reference - 35->', (done: Function) => {
            helper.edit('I1', '=DAYS(F21,A20)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":0,"formula":"=DAYS(F21,A20)"}');
            done();
        });
        it('DAYS formula with cell Reference - 36->', (done: Function) => {
            helper.edit('I1', '=DAYS(F20,F20)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(F20,F20)"}');
            done();
        });
        it('DAYS formula with cell Reference - 37->', (done: Function) => {
            helper.edit('I1', '=DAYS(B7,C6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41842');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41842,"formula":"=DAYS(B7,C6)"}');
            done();
        });
        it('DAYS formula with cell Reference - 38->', (done: Function) => {
            helper.edit('I1', '=DAYS(E7,E4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":20,"formula":"=DAYS(E7,E4)"}');
            done();
        });
        it('DAYS formula with cell Reference - 39->', (done: Function) => {
            helper.edit('I1', '=DAYS(B9,E4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41973');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41973,"formula":"=DAYS(B9,E4)"}');
            done();
        });
        it('DAYS formula with cell Reference - 40->', (done: Function) => {
            helper.edit('I1', '=DAYS(G6,H6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-9568');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-9568,"formula":"=DAYS(G6,H6)"}');
            done();
        });
        it('DAYS formula with cell Reference - 41->', (done: Function) => {
            helper.edit('I1', '=DAYS(E4,B16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-1,"formula":"=DAYS(E4,B16)"}');
            done();
        });
        it('DAYS formula with cell Reference - 42->', (done: Function) => {
            helper.edit('I1', '=DAYS(C17,C18)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(C17,C18)"}');
            done();
        });
        it('DAYS formula with cell Reference - 43->', (done: Function) => {
            helper.edit('I1', '=DAYS(C21,C19)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(C21,C19)"}');
            done();
        });
        it('DAYS formula with cell Reference - 44->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Hello', refersTo: 'B4' });
            helper.edit('I1', '=DAYS(Hello,"hi")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(Hello,\\"hi\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 45->', (done: Function) => {
            helper.edit('I1', '=DAYS("hello",hi)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#NAME?","formula":"=DAYS(\\"hello\\",hi)"}');
            done();
        });
        it('DAYS formula with cell Reference - 46->', (done: Function) => {
            helper.edit('I1', '=DAYS(DAY(49854),4534)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-4506');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-4506,"formula":"=DAYS(DAY(49854),4534)"}');
            done();
        });
        it('DAYS formula with cell Reference - 47->', (done: Function) => {
            helper.edit('I1', '=DAYS(WEEKDAY(46574,2),I16)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-40775');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-40775,"formula":"=DAYS(WEEKDAY(46574,2),I16)"}');
            done();
        });
        it('DAYS formula with cell Reference - 48->', (done: Function) => {
            helper.edit('I1', '=DAYS(DATE(2023,3,23),43)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('44965');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":44965,"formula":"=DAYS(DATE(2023,3,23),43)"}');
            done();
        });
        it('DAYS formula with cell Reference - 49->', (done: Function) => {
            helper.edit('I1', '=DAYS(DATEVALUE("04/21/2023"),DATEVALUE("09/30/2022"))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('203');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":203,"formula":"=DAYS(DATEVALUE(\\"04/21/2023\\"),DATEVALUE(\\"09/30/2022\\"))"}');
            done();
        });
        it('DAYS formula with cell Reference - 50->', (done: Function) => {
            helper.edit('I1', '=DAYS($B$8,$B$15)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41673');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41673,"formula":"=DAYS($B$8,$B$15)"}');
            done();
        });
        it('DAYS formula with cell Reference - 50->', (done: Function) => {
            helper.edit('I1', '=DAYS($B$9,$C$11)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41973');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41973,"formula":"=DAYS($B$9,$C$11)"}');
            done();
        });
        it('DAYS formula with cell Reference - 51->', (done: Function) => {
            helper.edit('I1', '=DAYS(Sheet1!B11,Sheet1!C8)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41943');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41943,"formula":"=DAYS(Sheet1!B11,Sheet1!C8)"}');
            done();
        });
        it('DAYS formula with cell Reference - 52->', (done: Function) => {
            helper.edit('I1', '=DAYS(Sheet1!B11,Sheet1!C17)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=DAYS(Sheet1!B11,Sheet1!C17)"}');
            done();
        });
        it('DAYS formula with cell Reference - 53->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'One', refersTo: 'C8' });
            helper.edit('I1', '=DAYS(One,Hello)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-41847');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-41847,"formula":"=DAYS(One,Hello)"}');
            done();
        });
        it('DAYS formula with cell Reference - 54->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Two', refersTo: 'B11' });
            helper.edit('I1', '=DAYS(Two,One)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('41943');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":41943,"formula":"=DAYS(Two,One)"}');
            done();
        });
        it('DAYS formula with cell Reference - 55->', (done: Function) => {
            helper.edit('I1', '=DAYS("07-JUN","04/23/2021")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1871');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":1871,"formula":"=DAYS(\\"07-JUN\\",\\"04/23/2021\\")"}');
            done();
        });
        it('DAYS formula with cell Reference - 56->', (done: Function) => {
            helper.edit('I1', '=DAYS("03/21/2022",TRUE)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('44640');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":44640,"formula":"=DAYS(\\"03/21/2022\\",TRUE)"}');
            done();
        });
        it('DAYS formula with cell Reference - 57->', (done: Function) => {
            helper.edit('I1', '=DAYS(453*3,23132/3)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-6351');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-6351,"formula":"=DAYS(453*3,23132/3)"}');
            done();
        });
        it('DAYS formula with cell Reference - 58->', (done: Function) => {
            helper.edit('I1', '=DAYS(54/34,53)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-52');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-52,"formula":"=DAYS(54/34,53)"}');
            done();
        });
        it('DAYS formula with cell Reference - 59->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'I26']);
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'I29']);
            helper.edit('I26', '04/23/2021');
            helper.edit('I29', '25-JUN');
            helper.edit('I1', '=DAYS(I26,I29)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('-1889');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":-1889,"formula":"=DAYS(I26,I29)"}');
            done();
        });
        it('DAYS formula with cell Reference - 60->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'I31']);
            helper.edit('I31', '03-14-2021');
            helper.edit('D5', '15');
            helper.edit('I1', '=DAYS(I31,D5)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('18685');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":18685,"formula":"=DAYS(I31,D5)"}');
            done();
        });
        it('DAYS formula with cell Reference - 61->', (done: Function) => {
            helper.edit('I1', '=MONTH(DAYS("04/30/2023","02/15/2022"))');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"3","formula":"=MONTH(DAYS(\\"04/30/2023\\",\\"02/15/2022\\"))"}');
            done();
        });
    });

    describe('WeekDay Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '43925.21' }] }, { cells: [{ value: '45321.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '44016' }] }, { cells: [{ value: '-5.4' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '2' }] }, { cells: [{ value: '4' }] }, { cells: [{ value: '15' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('WEEKDAY formula with return type ', (done: Function) => {
            helper.edit('I1', '=WEEKDAY(EDATE(F3,F4),1);');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('1');
            helper.edit('I2', '=WEEKDAY(EDATE(F3,F4),2);');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('7');
            helper.edit('I3', '=WEEKDAY(EDATE(F3,F4),3);');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('6');
            helper.edit('I4', '=WEEKDAY(EDATE(F3,F4),11);');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('7');
            helper.edit('I5', '=WEEKDAY(EDATE(F3,F4),12);');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('6');
            helper.edit('I6', '=WEEKDAY(EDATE(F3,F4),13);');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('5');
            helper.edit('I7', '=WEEKDAY(EDATE(F3,F4),14);');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('4');
            helper.edit('I8', '=WEEKDAY(EDATE(F3,F4),15);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('3');
            helper.edit('I9', '=WEEKDAY(EDATE(F3,F4),16);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('2');
            helper.edit('I10', '=WEEKDAY(EDATE(F3,F4),17);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('1');
            done();
        });
        it('WEEKDAY formula with invalid return type', (done: Function) => {
            helper.edit('I11', '=WEEKDAY(EDATE(F3,F4),4);');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('#NUM!');
            helper.edit('I12', '=WEEKDAY(EDATE(F3,F4),18);');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NUM!');
            done();
        });
        it('WEEKDAY formula with string return type', (done: Function) => {
            helper.edit('I13', '=WEEKDAY(EDATE(F3,F4),"3");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('6');
            helper.edit('I14', '=WEEKDAY(EDATE(F3,F4),"");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('#VALUE!');
            helper.edit('I15', '=WEEKDAY(EDATE(F3,F4),"hfh");');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#VALUE!');
            done();
        });
        it('WEEKDAY formula with invalid first argument', (done: Function) => {
            helper.edit('J1', '=WEEKDAY("er",4);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=WEEKDAY("",1);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('WEEKDAY formula with cell reference', (done: Function) => {
            helper.edit('J3', '=WEEKDAY(B2,2);');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('5');
            helper.edit('J4', '=WEEKDAY(A5,1);');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#VALUE!');
            helper.edit('J5', '=WEEKDAY(45,G8);');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('1');
            helper.edit('J6', '=WEEKDAY(F3,G5);');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('4');
            done();
        });
        it('WEEKDAY formula without first argument', (done: Function) => {
            helper.edit('J7', '=WEEKDAY(,2);');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('6');
            helper.edit('J9', '=WEEKDAY("",G8);');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#VALUE!');
            helper.edit('J10', '=WEEKDAY(45,"");');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('WEEKDAY formula with date as argument', (done: Function) => {
            helper.edit('J11', '=WEEKDAY("6/20/2023");');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('3');
            helper.edit('J13', '=WEEKDAY(,);');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('#NUM!');
            done();
        });
        it('WEEKDAY formula without second argument', (done: Function) => {
            helper.edit('J14', '=WEEKDAY(4,);');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#NUM!');
            helper.edit('J15', '=WEEKDAY(G8,K10);');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('#NUM!');
            done();
        });
        it('WEEKDAY formula with second argument as expression', (done: Function) => {
            helper.edit('J16', '=WEEKDAY(4,2+1);');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('2');
            helper.edit('J17', '=WEEKDAY(G8,5-3);');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('2');
            helper.edit('J18', '=WEEKDAY(56,22/2);');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('6');
            helper.edit('J19', '=WEEKDAY(67,7*2);');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('7');
            done();
        });
        it('WEEKDAY formula with logical values as arguments', (done: Function) => {
            helper.edit('K1', '=WEEKDAY(TRUE,2);');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('7');
            helper.edit('K2', '=WEEKDAY(FALSE,3);');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('5');
            helper.edit('K3', '=WEEKDAY(4354,TRUE);');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('7');
            helper.edit('K4', '=WEEKDAY(4567,FALSE);');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NUM!');
            helper.edit('K5', 'TRUE');
            helper.edit('K6', 'FALSE');
            helper.edit('K7', '=WEEKDAY(43254,K5);');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('1');
            helper.edit('K8', '=WEEKDAY(K5,11);');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('7');
            helper.edit('K9', '=WEEKDAY(43254,K6);');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#NUM!');
            helper.edit('K10', '=WEEKDAY(K6,11);');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('6');
            done();
        });
        it('WEEKDAY formula with negative and decimal values as arguments', (done: Function) => {
            helper.edit('K11', '=WEEKDAY(4.5,2);');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('3');
            helper.edit('K12', '=WEEKDAY(6.765,3);');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('4');
            helper.edit('K13', '=WEEKDAY(0.342,12);');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('5');
            helper.edit('K14', '=WEEKDAY(-45467,1);');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#NUM!');
            helper.edit('K15', '=WEEKDAY(-45467.56,3);');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#NUM!');
            helper.edit('K16', '=WEEKDAY(45467,-2);');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#NUM!');
            done();
        });
        it('WEEKDAY formula with invalid arguments', (done: Function) => {
            helper.edit('K17', '=WEEKDAY(43254456576786,1);');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#NUM!');
            helper.edit('K18', '=WEEKDAY("4/4/10000",11);');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#VALUE!');
            helper.edit('K19', '=WEEKDAY(hello,2);');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('#NAME?');
            helper.edit('K20', '=WEEKDAY(3435," ");');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('WEEKDAY formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L1', '=WEEKDAY($B$8,1)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('3');
            helper.edit('L2', '=WEEKDAY($C$7,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('5');
            helper.edit('L3', '=WEEKDAY($D$5,4)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#NUM!');
            helper.edit('L4', '=WEEKDAY($E$3,2)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('1');
            helper.edit('L5', '=WEEKDAY($F$6,5)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#NUM!');
            helper.edit('L6', '=WEEKDAY($A$5,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('WEEKDAY formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('L7', '=WEEKDAY(Sheet2!A1,1)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('7');
            helper.edit('L8', '=WEEKDAY(Sheet1!E3,3)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('0');
            helper.edit('L9', '=WEEKDAY(Sheet2!A4,4)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#NUM!');
            helper.edit('L10', '=WEEKDAY(Sheet1!C10,11)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('6');
            done();
        });
        it('WEEKDAY formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L11', '=WEEKDAY(Sheet2!$A$3,12)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            helper.edit('L12', '=WEEKDAY(Sheet1!$E$3,15)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('4');
            helper.edit('L13', '=WEEKDAY(Sheet2!$A$2,1)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('3');
            helper.edit('L14', '=WEEKDAY(Sheet1!$C$4,3)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('5');
            helper.edit('L15', '=WEEKDAY(Sheet2!$A$5,2)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#NUM!');
            helper.edit('L16', '=WEEKDAY(Sheet2!$A$6,3)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('2');
            done();
        });
        it('WEEKDAY formula with nested formulas->', (done: Function) => {
            helper.edit('M1', '=WEEKDAY(DATE(2003,3,12),3)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('2');
            helper.edit('M2', '=WEEKDAY(DAY(54564),2)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('6');
            helper.edit('M3', '=WEEKDAY(DATE(2019,3,30),2)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('6');
            helper.edit('M4', '=WEEKDAY(SUM(B2:B6),2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('4');
            helper.edit('M5', '=WEEKDAY(45323,1)-WEEKDAY(43211,1)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('-2');
            done();
        });
        it('WEEKDAY formula with decimal value as second argument->', (done: Function) => {
            helper.edit('N1', '=WEEKDAY(45678,3.567)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('1');
            helper.edit('N2', '=WEEKDAY(DAY(54564),2.564)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('6');
            helper.edit('N3', '=WEEKDAY(43543,4.564)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('#NUM!');
            helper.edit('N4', '=WEEKDAY(45678.543,2.564)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('2');
            helper.edit('N5', '=WEEKDAY(45323,14.543)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('1');
            done();
        });
        it('WEEKDAY formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=WEEKDAY();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=WEEKDAY();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O2', '=WEEKDAY(45321,2);');
            done();
        });
    });

    describe('TIME Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '54' }] }, { cells: [{ value: '98.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '-54' }] }, { cells: [{ value: '32' }] }, { cells: [{ value: 'one' }] },
                        { cells: [{ value: 'TRUE' }] }, { cells: [{ value: 'FALSE' }] }, { cells: [{ value: '"TRUE"' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TIME Formula ->', (done: Function) => {
            helper.edit('I1', '=TIME(6,6,6)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('6:06 AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"0.2542361111111111","formula":"=TIME(6,6,6)","format":"h:mm AM/PM","formattedText":"6:06 AM"}');
            done();
        });
        it('TIME Formula with Hour value as > 12 ->', (done: Function) => {
            helper.edit('I2', '=TIME(14,30,30)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('2:30 PM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"0.6045138888888889","formula":"=TIME(14,30,30)","format":"h:mm AM/PM","formattedText":"2:30 PM"}');
            done();
        });
        it('TIME Formula with Hour value = 0 ->', (done: Function) => {
            helper.edit('I3', '=TIME(0,5,30)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('12:05 AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"0.0038194444444444443","formula":"=TIME(0,5,30)","format":"h:mm AM/PM","formattedText":"12:05 AM"}');
            done();
        });
        it('TIME Formula with cell Reference values->', (done: Function) => {
            helper.edit('I4', '=TIME(D2,D3,D4)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('10:20 AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"0.430787037037037","formula":"=TIME(D2,D3,D4)","format":"h:mm AM/PM","formattedText":"10:20 AM"}');
            done();
        });
        it('TIME Formula with cell having string inputs->', (done: Function) => {
            helper.edit('I5', '=TIME(A5,A8,A10)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"#VALUE!","formula":"=TIME(A5,A8,A10)","format":"h:mm AM/PM"}');
            done();
        });
        it('TIME Formula with string inputs->', (done: Function) => {
            helper.edit('I6', '=TIME(a,b,c)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#NAME?","formula":"=TIME(a,b,c)","format":"h:mm AM/PM"}');
            done();
        });
        it('TIME Formula with hour value > 32767->', (done: Function) => {
            helper.edit('I7', '=TIME(32768,3,4)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#NUM!","formula":"=TIME(32768,3,4)","format":"h:mm AM/PM"}');
            done();
        });
        it('TIME formula with empty arguments', (done: Function) => {
            helper.edit('I8', '=TIME(,,);');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('12:00 AM');
            helper.edit('I9', '=TIME(,45,43);');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('12:45 AM');
            helper.edit('I10', '=TIME(15,34,);');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('3:34 PM');
            done();
        });
        it('TIME formula with negative numbers as arguments', (done: Function) => {
            helper.edit('I11', '=TIME(-1,34,43);');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('#NUM!');
            helper.edit('I12', '=TIME(0,-45,43);');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('#NUM!');
            helper.edit('I13', '=TIME(2,0,-34);');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('1:59 AM');
            done();
        });
        it('TIME formula with decimal numbers as arguments', (done: Function) => {
            helper.edit('I14', '=TIME(4.56,34.43,43);');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('4:34 AM');
            helper.edit('I15', '=TIME(5,-4.54,43);');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('4:56 AM');
            helper.edit('I16', '=TIME(2,34,34.43);');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('2:34 AM');
            done();
        });
        it('TIME formula with logical values as arguments', (done: Function) => {
            helper.edit('J1', '=TIME(TRUE,56,43);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('1:56 AM');
            helper.edit('J2', '=TIME(7,TRUE,32);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('7:01 AM');
            helper.edit('J3', '=TIME(14,FALSE,23);');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('2:00 PM');
            helper.edit('J4', 'TRUE');
            helper.edit('J5', 'FALSE');
            helper.edit('J6', '"TRUE"');
            helper.edit('J7', '"FALSE"');
            helper.edit('J8', '=TIME("TRUE",5,3);');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#VALUE!');
            helper.edit('J9', '=TIME(4,"FALSE",2);');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('#VALUE!');
            helper.edit('J10', '=TIME(J4,43,23);');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('1:43 AM');
            helper.edit('J11', '=TIME(4,J5,23);');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('4:00 AM');
            helper.edit('J12', '=TIME(J6,FALSE,23);');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#VALUE!');
            helper.edit('J13', '=TIME(43,J7,23);');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('TIME formula with cell reference values as arguments', (done: Function) => {
            helper.edit('K1', '=TIME(A1,6,43);');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('#VALUE!');
            helper.edit('K2', '=TIME(B3,43,32);');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            helper.edit('K3', '=TIME(4,C4,23);');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('4:00 AM');
            helper.edit('K4', '=TIME(15,54,D5);');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('3:54 PM');
            helper.edit('K5', '=TIME(23,E5,43);');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('11:20 PM');
            helper.edit('K6', '=TIME(4,F6,23);');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('9:00 AM');
            helper.edit('K7', '=TIME(A20,55,23);');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('12:55 AM');
            done();
        });
        it('TIME Formula with invalid arguments->', (done: Function) => {
            helper.edit('K8', '=TIME("one",5,3);');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#VALUE!');
            helper.edit('K9', '=TIME(4,one,2);');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#NAME?');
            helper.edit('K10', '=TIME("",4,3);');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('#VALUE!');
            helper.edit('K11', '=TIME(3," ",3);');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('#VALUE!');
            helper.edit('K12', '=TIME(4,54,32768);');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('#NUM!');
            helper.edit('K13', '123Hello');
            helper.edit('K14', '=TIME(4,K13,23);');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('TIME formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('L1', '=TIME($B$8,1,32)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('#NUM!');
            helper.edit('L2', '=TIME($C$7,3,$D$21)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('12:03 AM');
            helper.edit('L3', '=TIME($D$5,4,$D$2)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('3:04 PM');
            helper.edit('L4', '=TIME($E$3,2,$E$6)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('6:02 AM');
            helper.edit('L5', '=TIME($F$6,5,$A$20)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('12:05 PM');
            helper.edit('L6', '=TIME($A$5,2,5)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('TIME formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('L7', '=TIME(Sheet2!A1,1,Sheet1!C3)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('6:01 AM');
            helper.edit('L8', '=TIME(Sheet1!E3,3,45)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('6:03 AM');
            helper.edit('L9', '=TIME(Sheet2!A4,4,Sheet2!B13)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('#NUM!');
            helper.edit('L10', '=TIME(Sheet1!C10,11,65)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('12:12 AM');
            done();
        });
        it('TIME formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('L11', '=TIME(Sheet2!$A$3,12,32)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            helper.edit('L12', '=TIME(Sheet1!$E$3,15,Sheet2!$A$8)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('6:15 AM');
            helper.edit('L13', '=TIME(Sheet2!$A$2,1,65)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('2:02 AM');
            helper.edit('L14', '=TIME(Sheet1!$C$4,3,Sheet1!$D$5)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('12:03 AM');
            helper.edit('L15', '=TIME(Sheet2!$A$5,2,43)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('8:02 AM');
            helper.edit('L16', '=TIME(Sheet2!$A$6,3,5)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('TIME formula with nested formulas->', (done: Function) => {
            helper.edit('M1', '=TIME(TODAY(),3,43)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('#NUM!');
            helper.edit('M2', '=TIME(DAY(54564),2,34)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('9:02 PM');
            helper.edit('M3', '=TIME(DATE(2019,3,30),25,43)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('#NUM!');
            helper.edit('M4', '=TIME(SUM(C2:C6),2,4)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('1:02 AM');
            helper.edit('M5', '=TIME(453,1,54)-TIME(211,45,43)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('1:16 AM');
            helper.edit('M6', '=TIME(HOUR("23:45"),MINUTE("12:30 AM"),SECOND("04:56:43 PM"))');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('11:30 PM');
            done();
        });
        it('TIME formula with invalid arguments in all->', (done: Function) => {
            helper.edit('M7', '=TIME("one",one,43)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('#VALUE!');
            helper.edit('M8', '=TIME(one,"hello",34)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#NAME?');
            helper.edit('M9', '=TIME(32,one,"hello")');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('#NAME?');
            helper.edit('M10', '=TIME(2,34,"one")');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('TIME Formula with no input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('M11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=TIME()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=TIME()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('M11', '=TIME(3,0,0)');
            done();
        });
    });

    describe('Formula - Checking III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MONTH formula->', (done: Function) => {
            helper.edit('K1', '=MONTH(B5)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"11","formula":"=MONTH(B5)"}');
            done();
        });
        it('MONTH formula with no Inputs->', (done: Function) => {
            helper.edit('K2', '=MONTH()');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{}');
            done();
        });
        it('MONTH formula with 2 Inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('K3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MONTH(B5,B6)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MONTH(B5,B6)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('K3', '=MONTH(B5)');
            done();
        });
        it('MONTH formula with Date and Time->', (done: Function) => {
            helper.edit('K4', '=MONTH("7/11/2022 7:21:56 AM")');
            expect(helper.getInstance().sheets[0].rows[3].cells[10].formula).toBe('=MONTH("7/11/2022 7:21:56 AM")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('7');
            done();
        });
        it('MONTH formula without ""->', (done: Function) => {
            helper.edit('K5', '=MONTH(7/11/2022 7:21:56 AM)');
            expect(helper.getInstance().sheets[0].rows[4].cells[10].formula).toBe('=MONTH(7/11/2022 7:21:56 AM)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('MONTH formula with cell having alphabets->', (done: Function) => {
            helper.edit('K6', '=MONTH(A1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(A1)"}');
            done();
        });
        it('MONTH formula with direct month value as Input->', (done: Function) => {
            helper.edit('K7', '=MONTH("11/12/2022")');
            expect(helper.getInstance().sheets[0].rows[6].cells[10].formula).toBe('=MONTH("11/12/2022")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('11');
            done();
        });
        it('Now formula with Invalid Arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('L1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=NOW(B5)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=NOW(B5)';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L1', '=NOW()');
            done();
        });
    });

    describe('Reported MONTH Formulae - Checking III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: reportedBugData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Added cell Reference - 1->', (done: Function) => {
            helper.edit('H26', 'Yes');
            helper.edit('H27', 'No');
            helper.edit('H28', 'No');
            helper.edit('H29', 'No');
            helper.edit('D34', '300.00%');
            helper.edit('D35', '10.00%');
            helper.edit('D36', '1200.00%');
            helper.edit('D37', '900.00%');
            helper.edit('B34', 'TRUE');
            helper.edit('B35', 'FALSE');
            helper.edit('I35', '6/25/2023');
            helper.edit('I36', '7/27/2014');
            helper.edit('I33', '4/7/2021');
            helper.edit('I32', '7/8/2023');
            done();
        });
        it('MONTH formula with cell Reference - 1->', (done: Function) => {
            helper.edit('K2', '=MONTH(44341)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"5","formula":"=MONTH(44341)"}');
            done();
        });
        it('MONTH formula with cell Reference - 2->', (done: Function) => {
            helper.edit('K2', '=MONTH(46.654)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"2","formula":"=MONTH(46.654)"}');
            done();
        });
        it('MONTH formula with cell Reference - 3->', (done: Function) => {
            helper.edit('K2', '=MONTH(-2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NUM!","formula":"=MONTH(-2)"}');
            done();
        });
        it('MONTH formula with cell Reference - 4->', (done: Function) => {
            helper.edit('K2', '=MONTH(-3.56)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NUM!","formula":"=MONTH(-3.56)"}');
            done();
        });
        it('MONTH formula with cell Reference - 5->', (done: Function) => {
            helper.edit('K2', '=MONTH(TRUE)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(TRUE)"}');
            done();
        });
        it('MONTH formula with cell Reference - 6->', (done: Function) => {
            helper.edit('K2', '=MONTH(FALSE)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(FALSE)"}');
            done();
        });
        it('MONTH formula with cell Reference - 7->', (done: Function) => {
            helper.edit('K2', '=MONTH(4+3)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(4+3)"}');
            done();
        });
        it('MONTH formula with cell Reference - 8->', (done: Function) => {
            helper.edit('K2', '=MONTH(23*2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"2","formula":"=MONTH(23*2)"}');
            done();
        });
        it('MONTH formula with cell Reference - 9->', (done: Function) => {
            helper.edit('K2', '=MONTH(6/3)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(6/3)"}');
            done();
        });
        it('MONTH formula with cell Reference - 10->', (done: Function) => {
            helper.edit('K2', '=MONTH(0)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(0)"}');
            done();
        });
        it('MONTH formula with cell Reference - 11->', (done: Function) => {
            helper.edit('K2', '=MONTH(D14)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(D14)"}');
            done();
        });
        it('MONTH formula with cell Reference - 12->', (done: Function) => {
            helper.edit('K2', '=MONTH(D13)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(D13)"}');
            done();
        });
        it('MONTH formula with cell Reference - 13->', (done: Function) => {
            helper.edit('K2', '=MONTH(D15)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(D15)"}');
            done();
        });
        // it('MONTH formula with cell Reference - 14->', (done: Function) => {
        //     helper.edit('K2', '=MONTH(I21)');
        //     expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(I21)"}');
        //     done();
        // });
        it('MONTH formula with cell Reference - 15->', (done: Function) => {
            helper.edit('K2', '=MONTH(I23)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(I23)"}');
            done();
        });
        it('MONTH formula with cell Reference - 16->', (done: Function) => {
            helper.edit('K2', '=MONTH(B34)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(B34)"}');
            done();
        });
        it('MONTH formula with cell Reference - 17->', (done: Function) => {
            helper.edit('K2', '=MONTH(B35)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(B35)"}');
            done();
        });
        it('MONTH formula with cell Reference - 18->', (done: Function) => {
            helper.edit('K2', '=MONTH(F21)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(F21)"}');
            done();
        });
        it('MONTH formula with cell Reference - 19->', (done: Function) => {
            helper.edit('K2', '=MONTH(A20)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(A20)"}');
            done();
        });
        it('MONTH formula with cell Reference - 20->', (done: Function) => {
            helper.edit('K2', '=MONTH(F5)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"10","formula":"=MONTH(F5)"}');
            done();
        });
        it('MONTH formula with cell Reference - 21->', (done: Function) => {
            helper.edit('K2', '=MONTH(Hi)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NAME?","formula":"=MONTH(Hi)"}');
            done();
        });
        it('MONTH formula with cell Reference - 22->', (done: Function) => {
            helper.edit('K2', '=MONTH(E16)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#DIV/0!","formula":"=MONTH(E16)"}');
            done();
        });
        it('MONTH formula with cell Reference - 23->', (done: Function) => {
            helper.edit('K2', '=MONTH(E17)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NUM!","formula":"=MONTH(E17)"}');
            done();
        });
        it('MONTH formula with cell Reference - 24->', (done: Function) => {
            helper.edit('K2', '=MONTH(E18)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#REF!","formula":"=MONTH(E18)"}');
            done();
        });
        it('MONTH formula with cell Reference - 25->', (done: Function) => {
            helper.edit('K2', '=MONTH(19999999999)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#NUM!","formula":"=MONTH(19999999999)"}');
            done();
        });
        it('MONTH formula with cell Reference - 26->', (done: Function) => {
            helper.edit('K2', '=MONTH(MONTH(48765))');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":1,"formula":"=MONTH(MONTH(48765))"}');
            done();
        });
        // Due to n input. Reported to spreadsheet team.
        // it('MONTH formula with cell Reference - 27->', (done: Function) => {
        //     helper.edit('K2', '=MONTH(DATEVALUE("04/23/2023"))');
        //     expect(helper.invoke('getCell', [1, 10]).textContent).toBe('4');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":4,"formula":"=MONTH(DATEVALUE("04/23/2023"))"}');
        //     done();
        // });
        // it('MONTH formula with cell Reference - 28->', (done: Function) => { // value will change all months
        //     helper.edit('K2', '=MONTH(NOW())');
        //     expect(helper.invoke('getCell', [1, 10]).textContent).toBe('5');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"5","formula":"=MONTH(NOW())"}');
        //     done();
        // });
        // it('MONTH formula with cell Reference - 29->', (done: Function) => {
        //     helper.edit('K2', '=EDATE(TODAY(),MONTH(NOW()))');
        //     expect(helper.invoke('getCell', [1, 10]).textContent).toBe('45444');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"45444","formula":"=EDATE(TODAY(),MONTH(NOW()))"}');
        //     done();
        // });
        it('MONTH formula with cell Reference - 30->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I15)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"4","formula":"=MONTH(Sheet1!I15)"}');
            done();
        });
        it('MONTH formula with cell Reference - 31->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I17)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"4","formula":"=MONTH(Sheet1!I17)"}');
            done();
        });
        it('MONTH formula with cell Reference - 32->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!E16)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#DIV/0!","formula":"=MONTH(Sheet1!E16)"}');
            done();
        });
        it('MONTH formula with cell Reference - 33->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!C20)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=MONTH(Sheet1!C20)"}');
            done();
        });
        it('MONTH formula with cell Reference - 34->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I33)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"4","formula":"=MONTH(Sheet1!I33)"}');
            done();
        });
        it('MONTH formula with cell Reference - 35->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I32)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"7","formula":"=MONTH(Sheet1!I32)"}');
            done();
        });
        it('MONTH formula with cell Reference - 36->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I35)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"6","formula":"=MONTH(Sheet1!I35)"}');
            done();
        });
        it('MONTH formula with cell Reference - 37->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!I36)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"7","formula":"=MONTH(Sheet1!I36)"}');
            done();
        });
        it('MONTH formula with cell Reference - 38->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!F11)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"5","formula":"=MONTH(Sheet1!F11)"}');
            done();
        });
        it('MONTH formula with cell Reference - 39->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!B10)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"7","formula":"=MONTH(Sheet1!B10)"}');
            done();
        });
        it('MONTH formula with cell Reference - 40->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!H8)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('11');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"11","formula":"=MONTH(Sheet1!H8)"}');
            done();
        });
        it('MONTH formula with cell Reference - 41->', (done: Function) => {
            helper.edit('K2', '=MONTH(Sheet1!D7)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"2","formula":"=MONTH(Sheet1!D7)"}');
            done();
        });
        it('MONTH formula with cell Reference - 42->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Hello', refersTo: 'I35' });
            helper.edit('K2', '=MONTH(Hello)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"6","formula":"=MONTH(Hello)"}');
            done();
        });
        it('MONTH formula with cell Reference - 43->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'One', refersTo: 'I20' });
            helper.edit('K2', '=MONTH(One)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"3","formula":"=MONTH(One)"}');
            done();
        });
    });

    describe('HOUR Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '4/4/2020 5:00 AM' }] }, { cells: [{ value: '45321.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '4:00 PM' }] }, { cells: [{ value: '-5.4' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Hour formula->', (done: Function) => {
            helper.edit('J1', '=HOUR(C4);');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('3');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":3,"formula":"=HOUR(C4);"}');
            done();
        });
        it('Hour formula without ""->', (done: Function) => {
            helper.edit('J2', '=HOUR(02/03/2023 6:45 PM);');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":"#VALUE!","formula":"=HOUR(02/03/2023 6:45 PM);"}');
            done();
        });
        it('Hour formula with input having only Date Value->', (done: Function) => {
            helper.edit('J3', '=HOUR("4/4/2022");');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toBe('=HOUR("4/4/2022");');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            done();
        });
        it('Hour formula with input having both Date and Time Value->', (done: Function) => {
            helper.edit('J4', '=HOUR("4/4/2022 3:32:44 AM");');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toBe('=HOUR("4/4/2022 3:32:44 AM");');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('3');
            done();
        });
        it('Hour formula with input having both Date and Time Value->', (done: Function) => {
            helper.edit('J5', '=HOUR("01/12/2023 3:32:44 PM");');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('15');
            done();
        });
        it('Hour formula with input having both Date and Time Value without seconds->', (done: Function) => {
            helper.edit('J6', '=HOUR("01/12/2023 4:32 AM");');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('4');
            done();
        });
        it('Hour formula with input having both Date and Time Value without seconds->', (done: Function) => {
            helper.edit('J7', '=HOUR("01/12/2023 4:32 PM");');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('16');
            done();
        });
        it('Hour formula with input having both Date and Time Value as 24 hour format->', (done: Function) => {
            helper.edit('J8', '=HOUR("01/12/2023 21:23:44");');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('21');
            done();
        });
        it('Hour formula with nested Today formula as input->', (done: Function) => {
            helper.edit('J9', '=HOUR(TODAY());');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('0');
            done();
        });
        it('Hour formula with 12 hours Time value as input->', (done: Function) => {
            helper.edit('J11', '=HOUR("7:32:44 AM");');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('7');
            done();
        });
        it('Hour formula with 12 hours Time value as input->', (done: Function) => {
            helper.edit('J12', '=HOUR("7:32:44 PM");');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('19');
            done();
        });
        it('Hour formula with 24 hours Time value as input->', (done: Function) => {
            helper.edit('J13', '=HOUR("05:30:44");');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('5');
            done();
        });
        it('Hour formula with 24 hours Time value as input->', (done: Function) => {
            helper.edit('J14', '=HOUR("15:32:44");');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('15');
            done();
        });
        it('Hour formula with HH:MM AM/PM Time value as input->', (done: Function) => {
            helper.edit('J15', '=HOUR("04:32 AM");');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('4');
            done();
        });
        it('Hour formula with HH:MM AM/PM Time value as input->', (done: Function) => {
            helper.edit('J16', '=HOUR("04:32 PM");');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('16');
            done();
        });
        it('Hour formula with HH:MM Time value as 24 hour format as input->', (done: Function) => {
            helper.edit('J17', '=HOUR("02:33");');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('2');
            done();
        });
        it('Hour formula with HH:MM Time value as 24 hour format as input->', (done: Function) => {
            helper.edit('J18', '=HOUR("21:33");');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('21');
            done();
        });
        it('Hour formula with h AM/PM Time format as input->', (done: Function) => {
            helper.edit('J19', '=HOUR("7 PM");');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('19');
            done();
        });
        it('Hour formula with logical value as input->', (done: Function) => {
            helper.edit('K1', 'TRUE');
            helper.edit('K2', 'FALSE');
            helper.edit('K3', '=HOUR(K1)')
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0');
            helper.edit('K4', '=HOUR(K2)')
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('0');
            helper.edit('K5', '=HOUR(TRUE)')
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('0');
            helper.edit('K6', '=HOUR(FALSE)')
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('0');
            helper.edit('K7', '=HOUR("TRUE")')
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            helper.edit('K8', '=HOUR("FALSE")')
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('Hour formula with expression value as input->', (done: Function) => {
            helper.edit('K9', '=HOUR(2+0.5)')
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('12');
            helper.edit('K10', '=HOUR(5-3.62)')
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('9');
            helper.edit('K11', '=HOUR(1/12)')
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('2');
            helper.edit('K12', '=HOUR(0.38*4)')
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('12');
            helper.edit('K13', '=HOUR(0-0.5)')
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#NUM!');
            done();
        });
        it('Hour formula with nested formulas->', (done: Function) => {
            helper.edit('K14', '=HOUR(MINUTE(466.4547))')
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('0');
            helper.edit('K15', '=HOUR(SECOND(5545.46))')
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('0');
            helper.edit('K16', '=TIME(HOUR(0.34),45,32)')
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('8:45 AM');
            helper.edit('K17', '=HOUR(WEEKDAY(45323,2)+0.56)')
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('13');
            helper.edit('K18', '=HOUR(DATE(2020,3,18))')
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('0');
            helper.edit('K19', '=HOUR(DAY(45324))')
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('0');
            done();
        });
        it('Hour formula with cell reference as arguments->', (done: Function) => {
            helper.edit('M1', '31-Jan-2019');
            helper.edit('M2', '=HOUR(M1)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0');
            helper.edit('M3', '"31-Jan-2020"');
            helper.edit('M4', '=HOUR(M3)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            helper.edit('M5', '31-Jan-2019 3:00 PM');
            helper.edit('M6', '=HOUR(M5)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('15');
            done();
        });
        it('Hour formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M9', '=HOUR($B$8)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('0');
            helper.edit('M10', '=HOUR($C$7)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('10');
            helper.edit('M11', '=HOUR($D$5)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('0');
            helper.edit('M12', '=HOUR($E$3)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('0');
            helper.edit('M13', '=HOUR($F$6)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('0');
            helper.edit('M14', '=HOUR($A$5)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('Hour formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('N1', '=HOUR(Sheet2!A1)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('5');
            helper.edit('N2', '=HOUR(Sheet1!E3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0');
            helper.edit('N3', '=HOUR(Sheet2!A4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('16');
            helper.edit('N4', '=HOUR(Sheet1!C10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('11');
            done();
        });
        it('Hour formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=HOUR(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#VALUE!');
            helper.edit('N6', '=HOUR(Sheet1!$E$3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('0');
            helper.edit('N7', '=HOUR(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('13');
            helper.edit('N8', '=HOUR(Sheet1!$C$4)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('3');
            helper.edit('N9', '=HOUR(Sheet2!$A$5)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('#NUM!');
            helper.edit('N10', '=HOUR(Sheet2!$A$6)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('10');
            done();
        });
        it('Hour formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=HOUR();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=HOUR();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O2', '=HOUR("0.45");');
            done();
        });
        it('Hour formula with more than 1 input for error checking->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=HOUR(C3,C4);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=HOUR(C3,C4);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O3', '=HOUR("4/4/2022 3:32:44 AM");');
            done();
        });
    });

    describe('MINUTE Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '4/4/2020 5:45 AM' }] }, { cells: [{ value: '45321.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '4:08 PM' }] }, { cells: [{ value: '-5.4' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MINUTE formula->', (done: Function) => {
            helper.edit('I1', '=MINUTE(C4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":32,"formula":"=MINUTE(C4)"}');
            done();
        });
        it('MINUTE formula with 2 Inputs->', (done: Function) => {
            helper.edit('I2', '=MINUTE(C4:C5)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":32,"formula":"=MINUTE(C4:C5)"}');
            done();
        });
        it('MINUTE formula with Date and Time Value->', (done: Function) => {
            helper.edit('I5', '=MINUTE("7/1/2022 7:23:34 AM")');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].formula).toBe('=MINUTE("7/1/2022 7:23:34 AM")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('23');
            done();
        });
        it('MINUTE formula with input having minute value as 90->', (done: Function) => {
            helper.edit('C4', '3:90:44 AM');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"#VALUE!","formula":"=MINUTE(C4)"}');
            done();
        });
        it('MINUTE formula with cell having no value->', (done: Function) => {
            helper.edit('I6', '=MINUTE(P10)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":0,"formula":"=MINUTE(P10)"}');
            done();
        });
        it('MINUTE formula with cell having alphabets->', (done: Function) => {
            helper.edit('I7', '=MINUTE(A1)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#VALUE!","formula":"=MINUTE(A1)"}');
            done();
        });
        it('MINUTE formula with Time Formula->', (done: Function) => {
            helper.edit('I8', '=TIME(7,MINUTE(C5),0)');
            expect(helper.getInstance().sheets[0].rows[7].cells[8].formula).toBe('=TIME(7,MINUTE(C5),0)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('7:23 AM');
            done();
        });
        it('MINUTE formula without ""->', (done: Function) => {
            helper.edit('I9', '=MINUTE(7/1/2022 7:23:34 AM)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"#VALUE!","formula":"=MINUTE(7/1/2022 7:23:34 AM)"}');
            done();
        });
        it('MINUTE formula with 12 hours Time value as input->', (done: Function) => {
            helper.edit('I10', '=MINUTE("3:32:44 AM");');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('32');
            done();
        });
        it('MINUTE formula with 24 hours Time value as input->', (done: Function) => {
            helper.edit('I11', '=MINUTE("15:54:44");');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('54');
            done();
        });
        it('MINUTE formula without Seconds HH:MM AM/PM format Time value as input->', (done: Function) => {
            helper.edit('I12', '=MINUTE("09:12 AM");');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('12');
            done();
        });
        it('MINUTE formula without Seconds HH:MM format Time value as input->', (done: Function) => {
            helper.edit('I13', '=MINUTE("09:12");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('12');
            done();
        });
        it('MINUTE formula with date as input->', (done: Function) => {
            helper.edit('I14', '=MINUTE("01/12/2023");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('0');
            done();
        });
        it('MINUTE formula with nested TODAY formula as input->', (done: Function) => {
            helper.edit('I15', '=MINUTE(TODAY());');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('0');
            done();
        });
        it('MINUTE formula without Minutes and Seconds HH AM/PM format Time value as input->', (done: Function) => {
            helper.edit('I16', '=MINUTE("8 AM");');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('0');
            done();
        });
        it('MINUTE formula with logical value as input->', (done: Function) => {
            helper.edit('J1', 'TRUE');
            helper.edit('J2', 'FALSE');
            helper.edit('J3', '=MINUTE(J1)')
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=MINUTE(J2)')
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=MINUTE(TRUE)')
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            helper.edit('J6', '=MINUTE(FALSE)')
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=MINUTE("TRUE")')
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            helper.edit('J8', '=MINUTE("FALSE")')
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('MINUTE formula with expression value as input->', (done: Function) => {
            helper.edit('K1', '=MINUTE(2+0.5)')
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            helper.edit('K2', '=MINUTE(5-3.62)')
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('7');
            helper.edit('K3', '=MINUTE(1/12)')
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0');
            helper.edit('K4', '=MINUTE(0.38*4)')
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('28');
            helper.edit('K5', '=MINUTE(0-0.5)')
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            done();
        });
        it('MINUTE formula with nested formulas->', (done: Function) => {
            helper.edit('M1', '=MINUTE(MINUTE(466.4547))')
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('0');
            helper.edit('M2', '=MINUTE(SECOND(5545.46))')
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0');
            helper.edit('M3', '=TIME(HOUR(0.34),MINUTE(45.567),32)')
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('8:36 AM');
            helper.edit('M4', '=MINUTE(WEEKDAY(45323,2)+0.56)')
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('26');
            helper.edit('M5', '=MINUTE(DATE(2020,3,18))')
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('0');
            helper.edit('M6', '=MINUTE(DAY(45324))')
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('0');
            done();
        });
        it('MINUTE formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M7', '=MINUTE($B$8)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('0');
            helper.edit('M8', '=MINUTE($C$7)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('55');
            helper.edit('M9', '=MINUTE($D$5)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('0');
            helper.edit('M10', '=MINUTE($E$3)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('0');
            helper.edit('M11', '=MINUTE($F$6)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('0');
            helper.edit('M12', '=MINUTE($A$5)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('MINUTE formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('N1', '=MINUTE(Sheet2!A1)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('45');
            helper.edit('N2', '=MINUTE(Sheet1!E3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0');
            helper.edit('N3', '=MINUTE(Sheet2!A4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('8');
            helper.edit('N4', '=MINUTE(Sheet1!C10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('32');
            done();
        });
        it('MINUTE formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=MINUTE(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#VALUE!');
            helper.edit('N6', '=MINUTE(Sheet1!$E$3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('0');
            helper.edit('N7', '=MINUTE(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('32');
            helper.edit('N8', '=MINUTE(Sheet1!$C$5)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('23');
            helper.edit('N9', '=MINUTE(Sheet2!$A$5)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('#NUM!');
            helper.edit('N10', '=MINUTE(Sheet2!$A$6)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('47');
            done();
        });
        it('MINUTE formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MINUTE();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MINUTE();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O2', '=MINUTE("0.45");');
            done();
        });
        it('MINUTE formula with more than 1 input for error checking->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=MINUTE(C3,C4);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=MINUTE(C3,C4);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O3', '=MINUTE("4/4/2022 3:32:44 AM");');
            done();
        });
    });

    describe('SECOND Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }]
                }, {
                    rows: [
                        { cells: [{ value: '4/4/2020 5:45:54 AM' }] }, { cells: [{ value: '45321.564' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '4:08:23 PM' }] }, { cells: [{ value: '-5.4' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SECOND formula->', (done: Function) => {
            helper.edit('I1', '=SECOND(C4)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('44');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":44,"formula":"=SECOND(C4)"}');
            done();
        });
        it('SECOND formula with 2 Inputs->', (done: Function) => {
            helper.edit('I2', '=SECOND(C4:C5)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('44');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":44,"formula":"=SECOND(C4:C5)"}');
            done();
        });
        it('SECOND formula with cell having no value->', (done: Function) => {
            helper.edit('I3', '=SECOND(P10)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":0,"formula":"=SECOND(P10)"}');
            done();
        });
        it('SECOND formula with cell having alphabets->', (done: Function) => {
            helper.edit('I4', '=SECOND(A1)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"#VALUE!","formula":"=SECOND(A1)"}');
            done();
        });
        it('SECOND formula with Time Formula->', (done: Function) => {
            helper.edit('I5', '=TIME(9,30,45)');
            helper.edit('I6', '=SECOND(I5)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('45');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":45,"formula":"=SECOND(I5)"}');
            done();
        });
        it('SECOND formula with input having both Date and Time value->', (done: Function) => {
            helper.edit('I7', '=SECOND("7/1/2022 7:23:34 AM")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('34');
            done();
        });
        it('SECOND formula with Date as input->', (done: Function) => {
            helper.edit('I8', '=SECOND("01/12/2023")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('0');
            done();
        });
        it('SECOND formula with nested TODAY Formula as input->', (done: Function) => {
            helper.edit('I9', '=SECOND(TODAY())');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('0');
            done();
        });
        it('SECOND formula with 12 hours Time value as input->', (done: Function) => {
            helper.edit('I10', '=SECOND("3:32:44 AM");');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('44');
            done();
        });
        it('SECOND formula with 24 hours Time value as input->', (done: Function) => {
            helper.edit('I11', '=SECOND("15:54:54");');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('54');
            done();
        });
        it('SECOND formula without Seconds HH:MM AM/PM format Time value as input->', (done: Function) => {
            helper.edit('I12', '=SECOND("09:12 AM");');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('0');
            done();
        });
        it('SECOND formula without Seconds HH:MM format Time value as input->', (done: Function) => {
            helper.edit('I13', '=SECOND("09:12");');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('0');
            done();
        });
        it('SECOND formula without Minutes and Seconds h AM/PM format Time value as input->', (done: Function) => {
            helper.edit('I14', '=SECOND("8 PM");');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('0');
            done();
        });
        it('SECOND formula with logical value as input->', (done: Function) => {
            helper.edit('J1', 'TRUE');
            helper.edit('J2', 'FALSE');
            helper.edit('J3', '=SECOND(J1)')
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('0');
            helper.edit('J4', '=SECOND(J2)')
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('0');
            helper.edit('J5', '=SECOND(TRUE)')
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            helper.edit('J6', '=SECOND(FALSE)')
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('0');
            helper.edit('J7', '=SECOND("TRUE")')
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('#VALUE!');
            helper.edit('J8', '=SECOND("FALSE")')
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('SECOND formula with expression value as input->', (done: Function) => {
            helper.edit('K1', '=SECOND(2+0.5)')
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('0');
            helper.edit('K2', '=SECOND(5-3.62)')
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('12');
            helper.edit('K3', '=SECOND(1/12)')
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0');
            helper.edit('K4', '=SECOND(0.38*4)')
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('48');
            helper.edit('K5', '=SECOND(0-0.5)')
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#NUM!');
            done();
        });
        it('SECOND formula with nested formulas->', (done: Function) => {
            helper.edit('M1', '=SECOND(SECOND(466.4547))')
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('0');
            helper.edit('M2', '=SECOND(SECOND(5545.46))')
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('0');
            helper.edit('M3', '=TIME(SECOND(0.34),SECOND(45.567),32)')
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('12:28 PM');
            helper.edit('M4', '=SECOND(WEEKDAY(45323,2)+0.56)')
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('24');
            helper.edit('M5', '=SECOND(DATE(2020,3,18))')
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('0');
            helper.edit('M6', '=SECOND(DAY(45324))')
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('0');
            helper.edit('M7', '=SECOND(TIME(12,34,54))');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('54');
            helper.edit('M8', '=IF(SECOND(TIME(3,45,54))=54,SECOND(34.567),3)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('28');
            done();
        });
        it('SECOND formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M9', '=SECOND($D$5)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('0');
            helper.edit('M10', '=SECOND($E$3)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('0');
            helper.edit('M11', '=SECOND($F$6)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('0');
            helper.edit('M12', '=SECOND($A$5)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#VALUE!');
            helper.edit('M13', '=SECOND($B$8)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('0');
            helper.edit('M14', '=SECOND($C$7)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('53');
            done();
        });
        it('SECOND formula with Sheet references as arguments->', (done: Function) => {
            helper.edit('N1', '=SECOND(Sheet2!A1)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('54');
            helper.edit('N2', '=SECOND(Sheet1!E3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('0');
            helper.edit('N3', '=SECOND(Sheet2!A4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('23');
            helper.edit('N4', '=SECOND(Sheet1!C10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('14');
            done();
        });
        it('SECOND formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=SECOND(Sheet2!$A$3)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#VALUE!');
            helper.edit('N6', '=SECOND(Sheet1!$E$3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('0');
            helper.edit('N7', '=SECOND(Sheet2!$A$2)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('9');
            helper.edit('N8', '=SECOND(Sheet1!$C$5)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('54');
            helper.edit('N9', '=SECOND(Sheet2!$A$5)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('#NUM!');
            helper.edit('N10', '=SECOND(Sheet2!$A$6)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('59');
            done();
        });
        it('SECOND formula with no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SECOND();';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SECOND();';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O2', '=SECOND("0.45");');
            done();
        });
        it('SECOND formula with more than 1 input for error checking->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('O3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SECOND(C3,C4);';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SECOND(C3,C4);';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('O3', '=SECOND("4/4/2022 3:32:44 AM");');
            done();
        });
    });

    describe('EDATE Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },]
                }, {
                    rows: [
                        { cells: [{ value: '4/4/2020' }] }, { cells: [{ value: '45321' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '45673' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EDATE Formula with cell Reference->', (done: Function) => {
            helper.edit('J1', '=EDATE(B5,3)');
            const cellModel: CellModel = helper.getInstance().sheets[0].rows[0].cells[9];
            expect(cellModel.value).toBe('42056');
            expect(cellModel.formula).toBe('=EDATE(B5,3)');
            expect(cellModel.format).toBeUndefined();
            const cellEle: HTMLElement = helper.invoke('getCell', [0, 9]);
            expect(cellEle.textContent).toBe('42056');
            helper.invoke('numberFormat', [getFormatFromType('ShortDate'), 'J1']);
            expect(cellModel.format).toBe('m/d/yyyy');
            expect(cellEle.textContent).toBe('2/21/2015');
            helper.invoke('updateCell', [{ value: '10/28/2014' }, 'B5']);
            expect(cellModel.value).toBe('42032');
            expect(cellEle.textContent).toBe('1/28/2015');
            helper.edit('J1', '=EDATE("02/04/2014",1)');
            expect(cellModel.value).toBe('41702');
            expect(cellEle.textContent).toBe('3/4/2014');
            helper.invoke('numberFormat', [getFormatFromType('Number'), 'J1']);
            expect(cellModel.format).toBe('0.00');
            expect(cellEle.textContent).toBe('41702.00');
            helper.invoke('numberFormat', [getFormatFromType('General'), 'J1']);
            expect(cellModel.format).toBe('General');
            expect(cellEle.textContent).toBe('41702');
            helper.edit('J1', '=EDATE("8/27/1994",0)-5');
            expect(cellModel.value).toBe('34568');
            expect(cellEle.textContent).toBe('34568');
            helper.edit('J1', '=EDATE("2/21/1996",-5)');
            expect(cellModel.value).toBe('34963');
            expect(cellEle.textContent).toBe('34963');
            helper.edit('J1', '=EDATE(A13,0)');
            expect(cellModel.value).toBe('0');
            expect(cellEle.textContent).toBe('0');
            helper.edit('J1', '=EDATE(A13,3)');
            expect(cellModel.value).toBe('91');
            expect(cellEle.textContent).toBe('91');
            helper.edit('J1', '=EDATE(B10,B13)');
            expect(cellModel.value).toBe('41829');
            expect(cellEle.textContent).toBe('41829');
            helper.edit('J1', '=EDATE("2345",-2)');
            expect(cellModel.value).toBe('2284');
            expect(cellEle.textContent).toBe('2284');
            helper.edit('J1', '=EDATE(10,3)');
            expect(cellModel.value).toBe('101');
            expect(cellEle.textContent).toBe('101');
            helper.edit('J1', '=EDATE(DATE(2020,3,10),2)');
            expect(cellModel.value).toBe('43961');
            expect(cellEle.textContent).toBe('43961');
            done();
        });
        it('EDATE Formula error cases->', (done: Function) => {
            // With secnd argument (number) as string value
            helper.edit('J4', '=EDATE(B5,A6)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"#VALUE!","formula":"=EDATE(B5,A6)"}');
            // With first argument (date) as string value
            helper.edit('J5', '=EDATE(A6,1)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"#VALUE!","formula":"=EDATE(A6,1)"}');
            // Without first argument (date)
            helper.edit('J6', '=EDATE(,1)');
            const cellEle: HTMLElement = helper.invoke('getCell', [5, 9]);
            expect(cellEle.textContent).toBe('#N/A');
            const cellModel: CellModel = helper.getInstance().sheets[0].rows[5].cells[9];
            expect(JSON.stringify(cellModel)).toBe('{"value":"#N/A","formula":"=EDATE(,1)"}');
            // With first argument (date) as empty value
            helper.edit('J6', '=EDATE("",2)');
            expect(cellEle.textContent).toBe('#VALUE!');
            expect(cellModel.value).toBe('#VALUE!');
            // Without second argument (number)
            helper.edit('J6', '=EDATE(B4,)');
            expect(cellEle.textContent).toBe('#N/A');
            expect(cellModel.value).toBe('#N/A');
            // With second argument (number) as empty value
            helper.edit('J6', '=EDATE(B7,"")');
            expect(cellEle.textContent).toBe('#VALUE!');
            expect(cellModel.value).toBe('#VALUE!');
            // Without both arguments
            helper.edit('J6', '=EDATE(,)');
            expect(cellEle.textContent).toBe('#N/A');
            expect(cellModel.value).toBe('#N/A');
            // First argument (date) as string value
            helper.edit('J6', '=EDATE("Test",1)');
            expect(cellEle.textContent).toBe('#VALUE!');
            expect(cellModel.value).toBe('#VALUE!');
            // Second argument (number) as string value
            helper.edit('J6', '=EDATE("3/18/1994","Test")');
            expect(cellEle.textContent).toBe('#VALUE!');
            expect(cellModel.value).toBe('#VALUE!');
            // Invalid date syntax
            helper.edit('J6', '=EDATE(2/2/2020,0)');
            expect(cellEle.textContent).toBe('0');
            expect(cellModel.value).toBe('0');
            done();
        });
        it('EDATE Formula having floating number as arguments ->', (done: Function) => {
            helper.edit('J7', '=EDATE(145.322,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('237');
            helper.edit('J8', '=EDATE(45632,3.56)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('45722');
            helper.edit('J9', '=EDATE(43421.657,2.78)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('43482');
            done();
        });
        it('EDATE Formula having whole number as arguments->', (done: Function) => {
            helper.edit('J10', '=EDATE(236,2)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('297');
            helper.edit('J11', '=EDATE(42314,12)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('42680');
            done();
        });
        it('EDATE Formula with negative value as inputs->', (done: Function) => {
            helper.edit('J12', '=EDATE(-43263,0)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#NUM!');
            helper.edit('J13', '=EDATE(45631,-3)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('45540');
            helper.edit('J14', '=EDATE(-44671,-2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#NUM!');
            helper.edit('J15', '=EDATE("31-Jan-2019",-2)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('43434');
            done();
        });
        it('EDATE Formula with zero as arguments->', (done: Function) => {
            helper.edit('J16', '=EDATE(0,0)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('0');
            helper.edit('J17', '=EDATE(3,0)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('3');
            helper.edit('J18', '=EDATE(0,4)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('121');
            done();
        });
        it('EDATE Formula with first argument as different format of date->', (done: Function) => {
            helper.edit('K1', '=EDATE("31-Jan-2019",1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('43524');
            helper.edit('K2', '=EDATE("1/4/2022",5)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('44716');
            helper.edit('K3', '=EDATE(1/31/2023,4)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('121');
            helper.edit('K4', '=EDATE("29-Feb-2020",12)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('44255');
            helper.edit('K5', '=EDATE("31/1/2019",1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#VALUE!');
            helper.edit('K6', '=EDATE("Jan-31-2019",1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('EDATE Formula with second argument as different types->', (done: Function) => {
            helper.edit('K7', '=EDATE("31-Jan-2019","one")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            helper.edit('K8', '=EDATE("31-Jan-2019",one)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#NAME?');
            helper.edit('K9', '=EDATE("31-Jan-2019","2")');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('43555');
            helper.edit('K10', '=EDATE(46535,3)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('46627');
            helper.edit('K11', '=EDATE("29-Feb-2020",-12)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('43524');
            helper.edit('K12', '=EDATE("27-Feb-2019",-0.12)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('43523');
            done();
        });
        it('EDATE Formula with logical values as arguments->', (done: Function) => {
            helper.edit('K13', '=EDATE(True,2)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#VALUE!');
            helper.edit('K14', '=EDATE(False,2)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            helper.edit('K15', '=EDATE(43543,True)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#VALUE!');
            helper.edit('K16', '=EDATE(43543,False)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K17', '=EDATE(TRUE,TRUE)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#VALUE!');
            helper.edit('K18', '=EDATE(FALSE,FALSE)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#VALUE!');
            helper.edit('K19', '=EDATE(43543,"TRUE")');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('#VALUE!');
            helper.edit('K20', '=EDATE(43543,"FALSE")');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('#VALUE!');
            helper.edit('K21', '=EDATE(43543,I2)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('#VALUE!');
            helper.edit('K22', '=EDATE("31-Mar-2012",I4)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('#VALUE!');
            helper.edit('K23', '=EDATE(I3,I4)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('EDATE Formula with empty arguments->', (done: Function) => {
            helper.edit('L1', '=EDATE(,)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('#N/A');
            helper.edit('L2', '=EDATE(,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('#N/A');
            helper.edit('L3', '=EDATE(43535,)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#N/A');
            helper.edit('L4', '=EDATE(43213,"")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            helper.edit('L5', '=EDATE("",3)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            helper.edit('L6', '=EDATE(A20,3)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('91');
            helper.edit('L7', '=EDATE(43564,A22)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('43564');
            helper.edit('L8', '=EDATE(A20,A22)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('0');
            done();
        });
        it('EDATE Formula with expression as arguments->', (done: Function) => {
            helper.edit('L9', '=EDATE(45682+20,1)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('45730');
            helper.edit('L10', '=EDATE(45209,2*3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('45392');
            helper.edit('L11', '=EDATE(45732-4,4/2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('45789');
            helper.edit('L12', '=EDATE(B7+1,H2-1)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('42117');
            helper.edit('L13', '=EDATE(B7+1,H2+H3)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('43669');
            done();
        });
        it('EDATE Formula with invalid arguments->', (done: Function) => {
            helper.edit('L14', '=EDATE(43212," ")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#VALUE!');
            helper.edit('L15', '=EDATE(43542,one)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#NAME?');
            helper.edit('L16', '=EDATE("31.01.2019",2)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            helper.edit('L17', '=EDATE(-3,1)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#NUM!');
            helper.edit('L18', '=EDATE("22-Feb-2012",)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#N/A');
            done();
        });
        it('EDATE Formula with cell reference as arguments->', (done: Function) => {
            helper.edit('M1', '31-Jan-2019');
            helper.edit('M2', '=EDATE(M1,1)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('43524');
            helper.edit('M3', '"31-Jan-2020"');
            helper.edit('M4', '=EDATE(M3,2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            helper.edit('M5', '"Jan-31-2019"');
            helper.edit('M6', '=EDATE(M5,3)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            helper.edit('M7', '3');
            helper.edit('M8', '=EDATE("31-Jan-2020",M7)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('43951');
            helper.edit('M7', '#DIV/0!');
            helper.edit('M8', '=EDATE(M7,2)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('#DIV/0!');
            done();
        });
        it('EDATE Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M9', '=EDATE($B$8,$G$8)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('41763');
            helper.edit('M10', '=EDATE($C$6,$B$8)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('1268428');
            helper.edit('M11', '=EDATE($D$5,$E$4)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('471');
            helper.edit('M12', '=EDATE($E$3,$F$5)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('9162');
            helper.edit('M13', '=EDATE($F$6,$B$8)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('1268727');
            helper.edit('M14', '=EDATE($A$5,$E$4)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('EDATE Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=EDATE(Sheet2!A3,Sheet1!G2)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('#VALUE!');
            helper.edit('N2', '=EDATE(Sheet1!E3,Sheet2!A3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('#VALUE!');
            helper.edit('N3', '=EDATE(Sheet2!A6,Sheet2!A4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('1393711');
            helper.edit('N4', '=EDATE(Sheet1!D6,Sheet1!I10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('30');
            done();
        });
        it('EDATE Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=EDATE(Sheet2!$A$3,Sheet1!$G$2)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#VALUE!');
            helper.edit('N6', '=EDATE(Sheet1!$E$3,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('#VALUE!');
            helper.edit('N7', '=EDATE(Sheet2!$A$4,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('45763');
            helper.edit('N8', '=EDATE(Sheet1!$D$6,Sheet1!$I$10)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('30');
            helper.edit('N9', '=EDATE(Sheet2!$A$4,$G$2)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('45704');
            helper.edit('N10', '=EDATE(E3,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('121');
            done();
        });
        it('EDATE Formula for no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EDATE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EDATE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N11', '=EDATE(4321,1)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('4352');
            done();
        });
    });

    describe('EOMONTH Formula Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [
                        { cells: [{ index: 8, value: 'Different data' }] }, { cells: [{ index: 8, value: 'TRUE' }] },
                        { cells: [{ index: 8, value: 'TRUE' }] }, { cells: [{ index: 8, value: 'FALSE' }] },
                        { cells: [{ index: 8, value: 'FALSE' }] }, { cells: [{ index: 8, value: '103.32' }] },]
                }, {
                    rows: [
                        { cells: [{ value: '4/4/2020' }] }, { cells: [{ value: '45321' }] }, { cells: [{ value: '"31-Jan-2018"' }] },
                        { cells: [{ value: '45673' }] }, { cells: [{ value: '3' }] }, { cells: [{ value: '3567.45' }] },
                        { cells: [{ value: '40' }] }, { cells: [{ value: '42' }] }, { cells: [{ value: '50' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('EOMONTH Formula with direct values->', (done: Function) => {
            helper.edit('J1', '=EOMONTH(0,0)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('31');
            helper.edit('J2', '=EOMONTH(" 43432",5)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('43585');
            helper.edit('J3', '=EOMONTH("1/1/2020",1)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('43890');
            helper.edit('J4', '=EOMONTH("TRUE",12)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#VALUE!');
            helper.edit('J5', '=EOMONTH(1," 1")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('59');
            helper.edit('J6', '=EOMONTH("23",25)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('790');
            done();
        });
        it('EOMONTH Formula having floating number as arguments ->', (done: Function) => {
            helper.edit('J7', '=EOMONTH(145.322,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('244');
            helper.edit('J8', '=EOMONTH(45632,3.56)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('45747');
            helper.edit('J9', '=EOMONTH(43421.657,2.78)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('43496');
            done();
        });
        it('EOMONTH Formula having whole number as arguments->', (done: Function) => {
            helper.edit('J10', '=EOMONTH(236,2)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('305');
            helper.edit('J11', '=EOMONTH(42314,12)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('42704');
            done();
        });
        it('EOMONTH Formula with negative value as inputs->', (done: Function) => {
            helper.edit('J12', '=EOMONTH(-43263,0)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#NUM!');
            helper.edit('J13', '=EOMONTH(45631,-3)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('45565');
            helper.edit('J14', '=EOMONTH(-44671,-2)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('#NUM!');
            helper.edit('J15', '=EOMONTH("31-Jan-2019",-2)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('43434');
            done();
        });
        it('EOMONTH Formula with zero as arguments->', (done: Function) => {
            helper.edit('J16', '=EOMONTH(0,0)');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('31');
            helper.edit('J17', '=EOMONTH(3,0)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('31');
            helper.edit('J18', '=EOMONTH(0,4)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('152');
            done();
        });
        it('EOMONTH Formula with first argument as different format of date->', (done: Function) => {
            helper.edit('K1', '=EOMONTH("31-Jan-2019",1)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('43524');
            helper.edit('K2', '=EOMONTH("1/4/2022",5)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('44742');
            helper.edit('K3', '=EOMONTH(1/31/2023,4)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('152');
            helper.edit('K4', '=EOMONTH("29-Feb-2020",12)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('44255');
            helper.edit('K5', '=EOMONTH("31/1/2019",1)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('#VALUE!');
            helper.edit('K6', '=EOMONTH("Jan-31-2019",1)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('43524');
            done();
        });
        it('EOMONTH Formula with second argument as different types->', (done: Function) => {
            helper.edit('K7', '=EOMONTH("31-Jan-2019","one")');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('#VALUE!');
            helper.edit('K8', '=EOMONTH("31-Jan-2019",one)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('#NAME?');
            helper.edit('K9', '=EOMONTH("31-Jan-2019","2")');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('43555');
            helper.edit('K10', '=EOMONTH(46535,3)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('46630');
            helper.edit('K11', '=EOMONTH("29-Feb-2020",-12)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('43524');
            helper.edit('K12', '=EOMONTH("27-Feb-2019",-0.12)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('43524');
            done();
        });
        it('EOMONTH Formula with logical values as arguments->', (done: Function) => {
            helper.edit('K13', '=EOMONTH(True,2)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('#VALUE!');
            helper.edit('K14', '=EOMONTH(False,2)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('#VALUE!');
            helper.edit('K15', '=EOMONTH(43543,True)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('#VALUE!');
            helper.edit('K16', '=EOMONTH(43543,False)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('#VALUE!');
            helper.edit('K17', '=EOMONTH(TRUE,TRUE)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('#VALUE!');
            helper.edit('K18', '=EOMONTH(FALSE,FALSE)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('#VALUE!');
            helper.edit('K19', '=EOMONTH(43543,"TRUE")');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('#VALUE!');
            helper.edit('K20', '=EOMONTH(43543,"FALSE")');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('#VALUE!');
            helper.edit('K21', '=EOMONTH(43543,I2)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('#VALUE!');
            helper.edit('K22', '=EOMONTH("31-Mar-2012",I4)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('#VALUE!');
            helper.edit('K23', '=EOMONTH(I3,I4)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('#VALUE!');
            done();
        });
        it('EOMONTH Formula with empty arguments->', (done: Function) => {
            helper.edit('L1', '=EOMONTH(,)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('#N/A');
            helper.edit('L2', '=EOMONTH(,3)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('#N/A');
            helper.edit('L3', '=EOMONTH(43535,)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('#N/A');
            helper.edit('L4', '=EOMONTH(43213,"")');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('#VALUE!');
            helper.edit('L5', '=EOMONTH("",3)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('#VALUE!');
            helper.edit('L6', '=EOMONTH(A20,3)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('121');
            helper.edit('L7', '=EOMONTH(43564,A22)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('43585');
            helper.edit('L8', '=EOMONTH(A20,A22)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('31');
            done();
        });
        it('EOMONTH Formula with expression as arguments->', (done: Function) => {
            helper.edit('L9', '=EOMONTH(45682+20,1)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('45747');
            helper.edit('L10', '=EOMONTH(45209,2*3)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('45412');
            helper.edit('L11', '=EOMONTH(45732-4,4/2)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('45808');
            helper.edit('L12', '=EOMONTH(B7+1,H2-1)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('42124');
            helper.edit('L13', '=EOMONTH(B7+1,H2+H3)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('43677');
            done();
        });
        it('EOMONTH Formula with invalid arguments->', (done: Function) => {
            helper.edit('L14', '=EOMONTH(43212," ")');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#VALUE!');
            helper.edit('L15', '=EOMONTH(43542,one)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#NAME?');
            helper.edit('L16', '=EOMONTH("31.01.2019",2)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('#VALUE!');
            helper.edit('L17', '=EOMONTH(-3,1)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('#NUM!');
            helper.edit('L18', '=EOMONTH("22-Feb-2012",)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('#N/A');
            done();
        });
        it('EOMONTH Formula with cell reference as arguments->', (done: Function) => {
            helper.edit('M1', '31-Jan-2019');
            helper.edit('M2', '=EOMONTH(M1,1)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('43524');
            helper.edit('M3', '"31-Jan-2020"');
            helper.edit('M4', '=EOMONTH(M3,2)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('#VALUE!');
            helper.edit('M5', '"Jan-31-2019"');
            helper.edit('M6', '=EOMONTH(M5,3)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('#VALUE!');
            helper.edit('M7', '3');
            helper.edit('M8', '=EOMONTH("31-Jan-2020",M7)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('43951');
            done();
        });
        it('EOMONTH Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('M9', '=EOMONTH($B$8,$G$8)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('41790');
            helper.edit('M10', '=EOMONTH($C$6,$B$8)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('1268458');
            helper.edit('M11', '=EOMONTH($D$5,$E$4)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('486');
            helper.edit('M12', '=EOMONTH($E$3,$F$5)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('9163');
            helper.edit('M13', '=EOMONTH($F$6,$B$8)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('1268732');
            helper.edit('M14', '=EOMONTH($A$5,$E$4)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            done();
        });
        it('EOMONTH Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N1', '=EOMONTH(Sheet2!A3,Sheet1!G2)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('#VALUE!');
            helper.edit('N2', '=EOMONTH(Sheet1!E3,Sheet2!A3)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('#VALUE!');
            helper.edit('N3', '=EOMONTH(Sheet2!A6,Sheet2!A4)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('1393735');
            helper.edit('N4', '=EOMONTH(Sheet1!D6,Sheet1!I10)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('31');
            done();
        });
        it('EOMONTH Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('N5', '=EOMONTH(Sheet2!$A$3,Sheet1!$G$2)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('#VALUE!');
            helper.edit('N6', '=EOMONTH(Sheet1!$E$3,Sheet2!$A$3)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('#VALUE!');
            helper.edit('N7', '=EOMONTH(Sheet2!$A$4,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('45777');
            helper.edit('N8', '=EOMONTH(Sheet1!$D$6,Sheet1!$I$10)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('31');
            helper.edit('N9', '=EOMONTH(Sheet2!$A$4,$G$2)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('45716');
            helper.edit('N10', '=EOMONTH(E3,Sheet2!$A$5)');
            expect(helper.invoke('getCell', [9, 13]).textContent).toBe('121');
            done();
        });
        it('EOMONTH Formula for no inputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N11');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=EOMONTH()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=EOMONTH()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N11', '=EOMONTH(4321,1)');
            expect(helper.invoke('getCell', [10, 13]).textContent).toBe('4352');
            done();
        });
    });

    describe('Reported DATEVALUE formulae - Checking -> III ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('DATEVALUE formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I1', '=DATEVALUE("04/23/2021")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('44309');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"44309","formula":"=DATEVALUE(\\"04/23/2021\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I2', '=DATEVALUE("8/22/2011")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('40777');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"40777","formula":"=DATEVALUE(\\"8/22/2011\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I3', '=DATEVALUE("07-APR-2021")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(\\"07-APR-2021\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I4', '=DATEVALUE("2023/03/13")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('44998');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"44998","formula":"=DATEVALUE(\\"2023/03/13\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 5->', (done: Function) => {
            helper.edit('I5', '=DATEVALUE("03-14-2021")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('44269');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"44269","formula":"=DATEVALUE(\\"03-14-2021\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 6->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'J2']);
            helper.edit('J2', '04/23/2021');
            helper.edit('I6', '=DATEVALUE(J2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('44309');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"44309","formula":"=DATEVALUE(J2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 7->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'J3']);
            helper.edit('J3', '8/22/2011');
            helper.edit('I7', '=DATEVALUE(J3)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('40777');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"40777","formula":"=DATEVALUE(J3)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 8->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'J4']);
            helper.edit('J4', '07-APR-2021');
            helper.edit('I8', '=DATEVALUE(J4)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(J4)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 9->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'J5']);
            helper.edit('J5', '03-14-2021');
            helper.edit('I9', '=DATEVALUE(J5)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('44269');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":"44269","formula":"=DATEVALUE(J5)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 10->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N1']);
            helper.edit('N1', '04/23/2021');
            helper.edit('I10', '=DATEVALUE(N1)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('44309');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":"44309","formula":"=DATEVALUE(N1)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 11->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', '8/22/2011');
            helper.edit('I11', '=DATEVALUE(N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('40777');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"40777","formula":"=DATEVALUE(N2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 12->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N3']);
            helper.edit('N3', '07-APR-2021');
            helper.edit('I12', '=DATEVALUE(N3)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(N3)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 13->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N4']);
            helper.edit('N4', '03-14-2021');
            helper.edit('I13', '=DATEVALUE(N4)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('44269');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"44269","formula":"=DATEVALUE(N4)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 14->', (done: Function) => {
            helper.edit('I14', '=DATEVALUE(Hi)');
            expect(helper.invoke('getCell', [13, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[8])).toBe('{"value":"#NAME?","formula":"=DATEVALUE(Hi)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 15->', (done: Function) => {
            helper.edit('E16', '#DIV/0!');
            helper.edit('I15', '=DATEVALUE(E16)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":"#DIV/0!","formula":"=DATEVALUE(E16)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 16->', (done: Function) => {
            helper.edit('E17', '#NUM!');
            helper.edit('I16', '=DATEVALUE(E17)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('#NUM!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":"#NUM!","formula":"=DATEVALUE(E17)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 17->', (done: Function) => {
            helper.edit('E18', '#REF!');
            helper.edit('I17', '=DATEVALUE(E18)');
            expect(helper.invoke('getCell', [16, 8]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[8])).toBe('{"value":"#REF!","formula":"=DATEVALUE(E18)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 18->', (done: Function) => {
            helper.edit('I18', '"=DATEVALUE()');
            expect(helper.invoke('getCell', [17, 8]).textContent).toBe('"=DATEVALUE()');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[8])).toBe('{"value":"\\"=DATEVALUE()"}');
            done();
        });
        // it('DATEVALUE formula with cell Reference - 19->', (done: Function) => {
        //     helper.edit('I19', '=MONTH(DATEVALUE("03/23/2023"))');
        //     expect(helper.invoke('getCell', [18, 8]).textContent).toBe('3');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[8])).toBe('{"value":3,"formula":"=MONTH(DATEVALUE(\\"03/23/2023\\"))"}');
        //     done();
        // });
        it('DATEVALUE formula with cell Reference - 20->', (done: Function) => {
            helper.edit('I20', '=DAY(DATEVALUE("05/30/2021"))');
            expect(helper.invoke('getCell', [19, 8]).textContent).toBe('30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[8])).toBe('{"value":30,"formula":"=DAY(DATEVALUE(\\"05/30/2021\\"))"}');
            done();
        });
        // it('DATEVALUE formula with cell Reference - 21->', (done: Function) => {
        //     helper.edit('I21', '=DATE(2023,MONTH(DATEVALUE("02/28/2020")),23)');
        //     expect(helper.invoke('getCell', [20, 8]).textContent).toBe('2/23/2023');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[8])).toBe('{"value":"2/23/2023","formula":"=DATE(2023,MONTH(DATEVALUE(\\"02/28/2020\\")),23)"}');
        //     done();
        // });
        it('DATEVALUE formula with cell Reference - 22->', (done: Function) => {
            helper.edit('I22', '=WEEKDAY(DATEVALUE("02/27/2023"),2)');
            expect(helper.invoke('getCell', [21, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[8])).toBe('{"value":1,"formula":"=WEEKDAY(DATEVALUE(\\"02/27/2023\\"),2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 23->', (done: Function) => {
            helper.edit('I23', '=EDATE(DATEVALUE("01/01/2024"),1)');
            expect(helper.invoke('getCell', [22, 8]).textContent).toBe('45323');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[8])).toBe('{"value":"45323","formula":"=EDATE(DATEVALUE(\\"01/01/2024\\"),1)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 24->', (done: Function) => {
            helper.edit('I24', '=EOMONTH(DATEVALUE("02/03/2023"),2)');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('45046');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":"45046","formula":"=EOMONTH(DATEVALUE(\\"02/03/2023\\"),2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 25->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N6']);
            helper.edit('N6', '04/23/2021');
            helper.edit('I25', '=DATEVALUE($N$6)');
            expect(helper.invoke('getCell', [24, 8]).textContent).toBe('44309');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[24].cells[8])).toBe('{"value":"44309","formula":"=DATEVALUE($N$6)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 26->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N7']);
            helper.edit('N7', '07-APR-2021');
            helper.edit('I26', '=DATEVALUE($N$7)');
            expect(helper.invoke('getCell', [25, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[25].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE($N$7)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 27->', (done: Function) => {
            helper.edit('I27', '=DATEVALUE(Sheet1!N7)');
            expect(helper.invoke('getCell', [26, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[26].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(Sheet1!N7)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 28->', (done: Function) => {
            helper.edit('I28', '=DATEVALUE(Sheet1!E16)');
            expect(helper.invoke('getCell', [27, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[27].cells[8])).toBe('{"value":"#DIV/0!","formula":"=DATEVALUE(Sheet1!E16)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 29->', (done: Function) => {
            helper.edit('I29', '=DATEVALUE(Sheet1!N3)');
            expect(helper.invoke('getCell', [28, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[28].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(Sheet1!N3)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 30->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N9']);
            helper.edit('N9', '8/22/2011');
            helper.edit('I30', '=DATEVALUE(Sheet1!$N$9)');
            expect(helper.invoke('getCell', [29, 8]).textContent).toBe('40777');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[29].cells[8])).toBe('{"value":"40777","formula":"=DATEVALUE(Sheet1!$N$9)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 31->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N10']);
            helper.edit('N10', '03-14-2021');
            helper.edit('I31', '=DATEVALUE(Sheet1!$N$10)');
            expect(helper.invoke('getCell', [30, 8]).textContent).toBe('44269');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[30].cells[8])).toBe('{"value":"44269","formula":"=DATEVALUE(Sheet1!$N$10)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 32->', (done: Function) => {
            helper.edit('I32', '=DATEVALUE(Sheet1!$N$7)');
            expect(helper.invoke('getCell', [31, 8]).textContent).toBe('44293');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[31].cells[8])).toBe('{"value":"44293","formula":"=DATEVALUE(Sheet1!$N$7)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 33->', (done: Function) => {
            helper.edit('I33', '=DATEVALUE(Sheet1!$N$9)');
            expect(helper.invoke('getCell', [32, 8]).textContent).toBe('40777');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[32].cells[8])).toBe('{"value":"40777","formula":"=DATEVALUE(Sheet1!$N$9)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 34->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'One', refersTo: 'N10' });
            helper.edit('I34', '=DATEVALUE(One)');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('44269');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"44269","formula":"=DATEVALUE(One)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 35->', (done: Function) => {
            helper.edit('I34', '=DATEVALUE("25-JUN")');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(\\"25-JUN\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 36->', (done: Function) => {
            helper.edit('I34', '=DATEVALUE("25-Jun")');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(\\"25-Jun\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 37->', (done: Function) => {
            helper.edit('I34', '=DATEVALUE("APR-07-2020")');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('43928');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"43928","formula":"=DATEVALUE(\\"APR-07-2020\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 38->', (done: Function) => {
            helper.edit('I34', '=DATEVALUE("JUL-08")');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('46211');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"46211","formula":"=DATEVALUE(\\"JUL-08\\")"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 39->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', '25-JUN');
            helper.edit('I11', '=DATEVALUE(N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(N2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 40->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', '25-Jun');
            helper.edit('I11', '=DATEVALUE(N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(N2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 41->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', 'JUL-08');
            helper.edit('I11', '=DATEVALUE(N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46211');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46211","formula":"=DATEVALUE(N2)"}');
            done();
        });
        // it('DATEVALUE formula with cell Reference - 42->', (done: Function) => {
        //     helper.edit('I34', '=MONTH(DATEVALUE("03/23/2023"))');
        //     expect(helper.invoke('getCell', [33, 8]).textContent).toBe('3');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"3","formula":"=MONTH(DATEVALUE(\\"03/23/2023\\"))"}');
        //     done();
        // });
        // it('DATEVALUE formula with cell Reference - 43->', (done: Function) => {
        //     helper.edit('I34', '=DATE(2023,MONTH(DATEVALUE("02/28/2020")),23)');
        //     expect(helper.invoke('getCell', [33, 8]).textContent).toBe('2/23/2023');
        //     expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"2/23/2023","formula":"=DATE(2023,MONTH(DATEVALUE(\\"02/28/2020\\")),23)"}');
        //     done();
        // });
        it('DATEVALUE formula with cell Reference - 44->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', '25-JUN');
            helper.edit('I11', '=DATEVALUE($N$2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE($N$2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 45->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', '25-Jun');
            helper.edit('I11', '=DATEVALUE(Sheet1!N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(Sheet1!N2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 46->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', 'JUL-08');
            helper.edit('I11', '=DATEVALUE(Sheet1!N2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46211');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46211","formula":"=DATEVALUE(Sheet1!N2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 47->', (done: Function) => {
            helper.invoke('numberFormat', [getFormatFromType('Text'), 'N2']);
            helper.edit('N2', 'JUL-08');
            helper.edit('I11', '=DATEVALUE(Sheet1!$N$2)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('46211');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[8])).toBe('{"value":"46211","formula":"=DATEVALUE(Sheet1!$N$2)"}');
            done();
        });
        it('DATEVALUE formula with cell Reference - 48->', (done: Function) => {
            helper.getInstance().addDefinedName({ name: 'Hello', refersTo: 'N2' });
            helper.edit('N2', '25-JUN');
            helper.edit('I34', '=DATEVALUE(Hello)');
            expect(helper.invoke('getCell', [33, 8]).textContent).toBe('46198');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[33].cells[8])).toBe('{"value":"46198","formula":"=DATEVALUE(Hello)"}');
            done();
        });
    });

    // Lookup & Reference Category Formulas
    describe('Reported CHOOSE Formulae - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('CHOOSE formula with specific cases - 1->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(2, "true", "false")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"false","formula":"=CHOOSE(2, \\"true\\", \\"false\\")"}');
            done();
        });
        it('CHOOSE formula with specific cases - 2->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(TRUE, 1,2,)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"1","formula":"=CHOOSE(TRUE, 1,2,)"}');
            done();
        });
        it('CHOOSE formula with specific cases - 3->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(300%, TRUE, FALSE, TRUE,)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"TRUE","formula":"=CHOOSE(300%, TRUE, FALSE, TRUE,)"}');
            done();
        });
        it('CHOOSE formula with specific cases - 5->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(1, "#DIV/0!")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#DIV/0!","formula":"=CHOOSE(1, \\"#DIV/0!\\")"}');
            done();
        });
        it('CHOOSE formula with normal value - 1->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(TRUE, 1,2,3)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"1","formula":"=CHOOSE(TRUE, 1,2,3)"}');
            done();
        });
        it('CHOOSE formula with normal value - 2->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(TRUE, TRUE, "true", FALSE)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"TRUE","formula":"=CHOOSE(TRUE, TRUE, \\"true\\", FALSE)"}');
            done();
        });
        it('CHOOSE formula with normal value - 3->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(TRUE, 1+TRUE,FALSE)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"2","formula":"=CHOOSE(TRUE, 1+TRUE,FALSE)"}');
            done();
        });
        it('CHOOSE formula with normal value - 4->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(200%,1,100%,"jag")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"1","formula":"=CHOOSE(200%,1,100%,\\"jag\\")"}');
            done();
        });
        it('CHOOSE formula with normal value - 5->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(3,"1",100%,"A""pp""le")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('A"pp"le');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"A\\"pp\\"le","formula":"=CHOOSE(3,\\"1\\",100%,\\"A\\"\\"pp\\"\\"le\\")"}');
            done();
        });
        it('CHOOSE formula with normal value - 6->', (done: Function) => {
            helper.edit('I2', '=CHOOSE(1,"2*10")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('2*10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"2*10","formula":"=CHOOSE(1,\\"2*10\\")"}');
            done();
        });
        it('CHOOSE formula with cell reference - 1->', (done: Function) => {
            helper.edit('J1', '3+"4"');
            helper.edit('J2', 'TRUE');
            helper.edit('J3', '2');
            helper.edit('J4', '" "');
            helper.edit('J5', '""      ""');
            helper.edit('J6', '1');
            helper.edit('J8', '         "1"');

            helper.edit('J7', '=CHOOSE(1, J1, 2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('3+"4"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"3+\\"4\\"","formula":"=CHOOSE(1, J1, 2)"}');
            done();
        });
        it('CHOOSE formula with cell reference - 2->', (done: Function) => {
            helper.edit('J7', '=CHOOSE(J2, 1,2,3)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"1","formula":"=CHOOSE(J2, 1,2,3)"}');
            done();
        });
        it('CHOOSE formula with cell reference - 3->', (done: Function) => {
            helper.edit('J7', '=CHOOSE(J2, TRUE, "true", FALSE)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"TRUE","formula":"=CHOOSE(J2, TRUE, \\"true\\", FALSE)"}');
            done();
        });
        it('CHOOSE formula with cell reference - 4->', (done: Function) => {
            helper.edit('J7', '=CHOOSE(J2, 1+J2,FALSE)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"2","formula":"=CHOOSE(J2, 1+J2,FALSE)"}');
            done();
        });
        it('CHOOSE formula with cell reference - 5->', (done: Function) => {
            helper.edit('J7', '=CHOOSE(J3, J4, J5, "",,,, )');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('""      ""');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"\\"\\"      \\"\\"","formula":"=CHOOSE(J3, J4, J5, \\"\\",,,, )"}');
            done();
        });
        it('CHOOSE formula with cell reference - 6->', (done: Function) => {
            helper.edit('J7', '=CHOOSE(J6, J8, " ",,      )');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('         "1"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"         \\"1\\"","formula":"=CHOOSE(J6, J8, \\" \\",,      )"}');
            done();
        });
        it('CHOOSE formula with cell reference - 7->', (done: Function) => {
            helper.edit('J1', '1');
            helper.edit('J2', '"6+2.83"');
            helper.edit('J7', '=CHOOSE(J1, J2, 2)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('"6+2.83"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[9])).toBe('{"value":"\\"6+2.83\\"","formula":"=CHOOSE(J1, J2, 2)"}');
            done();
        });
    });

    describe('EJ2-975034 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }, { ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('INDEX formula with multiple ranges as first argument', (done: Function) => {
            helper.edit('I1', '=INDEX((A2:B8,C2:E8,F2:H8),3,1)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('Formal Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"Formal Shoes","formula":"=INDEX((A2:B8,C2:E8,F2:H8),3,1)"}');
            helper.edit('I2', '=INDEX((A2:B8,C2:E8,F2:H8),1,1)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('Casual Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"Casual Shoes","formula":"=INDEX((A2:B8,C2:E8,F2:H8),1,1)"}');
            done();
        });
        it('INDEX formula with and without fourth argument', (done: Function) => {
            helper.edit('I3', '=INDEX((A2:B8,C2:E8,F2:H8),1,1,3)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('200');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"200","formula":"=INDEX((A2:B8,C2:E8,F2:H8),1,1,3)"}');
            helper.edit('I4', '=INDEX((A2:B8,C2:E8,F2:H8),3,3,2)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('15');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"15","formula":"=INDEX((A2:B8,C2:E8,F2:H8),3,3,2)"}');
            done();
        });
        it('INDEX formula with multiple sheet references as first argument', (done: Function) => {
            helper.edit('I5', '=INDEX((Sheet1!A2:C8,Sheet1!D2:F8,Sheet1!G2:H8),2,1,1)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('Sports Shoes');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"Sports Shoes","formula":"=INDEX((Sheet1!A2:C8,Sheet1!D2:F8,Sheet1!G2:H8),2,1,1)"}');
            helper.edit('I6', '=INDEX((Sheet1!A2:C8,Sheet1!D2:F8,Sheet1!G2:H8),2,Sheet1!G8,2)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('600');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"600","formula":"=INDEX((Sheet1!A2:C8,Sheet1!D2:F8,Sheet1!G2:H8),2,Sheet1!G8,2)"}');
            done();
        });
        it('INDEX formula with multiple references as first argument (invalid case)', (done: Function) => {
            helper.edit('I7', '=INDEX((A2:B8,C2:E8,F2:H8),1,1,4)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#REF!","formula":"=INDEX((A2:B8,C2:E8,F2:H8),1,1,4)"}');
            helper.edit('I8', '=INDEX((A2:B8,C2:E8,F2:H8),3,3,0)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"#VALUE!","formula":"=INDEX((A2:B8,C2:E8,F2:H8),3,3,0)"}');
            done();
        });
        it('EJ2-1002092: Improper value returns while passing a number string as an argument in AND formula.', (done: Function) => {
            helper.edit('J19', '=AND("5")');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('#VALUE!');
            helper.edit('J20', '=OR("5")');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('#VALUE!');
            helper.edit('J21', '=NOT("5")');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#VALUE!');
            done();
        });
        it('EJ2-1002968 -> Formula cell value rounds incorrectly when applying number and currency format', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            helper.edit('A15', '16.994999999997');
            helper.edit('A16', '=2583.24/152');
            expect(sheet.rows[15].cells[0].value).toBe('16.994999999999997');
            helper.edit('A17', '=2583.23/152');
            helper.edit('A18', '=SUM(2583.24/152)');
            helper.edit('A19', '=SUM(16.994999999997)');
            helper.edit('A20', '=SUM(169949999999979.9999)');
            helper.edit('A21', '=SUM(16994999999997989)');
            helper.invoke('numberFormat', ['0.00', 'A15:A21']);
            expect(sheet.rows[14].cells[0].formattedText).toBe('16.99');
            expect(sheet.rows[15].cells[0].formattedText).toBe('17.00');
            expect(sheet.rows[15].cells[0].value).toBe('16.994999999999997');
            expect(sheet.rows[16].cells[0].formattedText).toBe('16.99');
            expect(sheet.rows[17].cells[0].formattedText).toBe('17.00');
            expect(sheet.rows[18].cells[0].formattedText).toBe('16.99');
            expect(sheet.rows[19].cells[0].formattedText).toBe('169949999999980.00');
            expect(sheet.rows[20].cells[0].formattedText).toBe('16994999999997988.00');
            helper.invoke('numberFormat', ['$#,##0.00', 'A15:A21']);
            expect(sheet.rows[14].cells[0].formattedText).toBe('$16.99');
            expect(sheet.rows[15].cells[0].formattedText).toBe('$17.00');
            expect(sheet.rows[15].cells[0].value).toBe('16.994999999999997');
            expect(sheet.rows[16].cells[0].formattedText).toBe('$16.99');
            expect(sheet.rows[17].cells[0].formattedText).toBe('$17.00');
            expect(sheet.rows[18].cells[0].formattedText).toBe('$16.99');
            expect(sheet.rows[19].cells[0].formattedText).toBe('$169,949,999,999,980.00');
            expect(sheet.rows[20].cells[0].formattedText).toBe('$16,994,999,999,997,988.00');
            done();
        });
        it('EJ2-1012392 -> Formula cell value rounds incorrectly when applying accounting format', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            const sheet: SheetModel = spreadsheet.sheets[0];
            helper.invoke('numberFormat', ['_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)', 'A15:A21']);
            expect(spreadsheet.getCell(14, 0).textContent).toBe(' $   16.99 ');
            expect(spreadsheet.getCell(15, 0).textContent).toBe(' $   17.00 ');
            expect(sheet.rows[15].cells[0].value).toBe('16.994999999999997');
            expect(spreadsheet.getCell(16, 0).textContent).toBe(' $   16.99 ');
            expect(spreadsheet.getCell(17, 0).textContent).toBe(' $   17.00 ');
            expect(spreadsheet.getCell(18, 0).textContent).toBe(' $   16.99 ');
            expect(spreadsheet.getCell(19, 0).textContent).toBe(' $169,949,999,999,980.00 ');
            expect(spreadsheet.getCell(20, 0).textContent).toBe(' $16,994,999,999,997,988.00 ');
            helper.invoke('numberFormat', ['#,##0.00_);(#,##0.00)', 'A15:A21']);
            expect(sheet.rows[14].cells[0].formattedText).toBe('16.99 ');
            expect(sheet.rows[15].cells[0].formattedText).toBe('17.00 ');
            expect(sheet.rows[15].cells[0].value).toBe('16.994999999999997');
            expect(sheet.rows[16].cells[0].formattedText).toBe('16.99 ');
            expect(sheet.rows[17].cells[0].formattedText).toBe('17.00 ');
            expect(sheet.rows[18].cells[0].formattedText).toBe('16.99 ');
            expect(sheet.rows[19].cells[0].formattedText).toBe('169,949,999,999,980.00 ');
            expect(sheet.rows[20].cells[0].formattedText).toBe('16,994,999,999,997,988.00 ');
            done();
        });
    });

    describe('INDEX Formula ->', function () {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('INDEX formula for area range as boolean', function (done: Function) {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('selectRange', ['I1']);
            helper.edit('I1', '=INDEX((B14:B20,B6:C11,H6:I11,H15:I19),1,TRUE,FALSE)');
            expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe('#VALUE!');
            done();
        });
        it('INDEX formula for empty area range', function (done: Function) {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.edit('I2', '=INDEX(3,1,1,)');
            expect(spreadsheet.sheets[0].rows[1].cells[8].value).toBe('#VALUE!');
            done();
        });
        it('INDEX formula for empty column range', function (done: Function) {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.edit('I3', '=INDEX(3,1,,1)');
            expect(spreadsheet.sheets[0].rows[2].cells[8].value).toBe('3');
            done();
        });
        it('INDEX() returns value instead of #REF! error when first argument is scalar and row/column > 1', function (done: Function) {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.edit('I4', '=INDEX(3,2,1)');
            helper.edit('I5', '=INDEX(3,1,5)');
            helper.edit('I6', '=INDEX(3,,1)');
            helper.edit('I7', '=INDEX("b",4,24)');
            expect(spreadsheet.sheets[0].rows[3].cells[8].value).toBe('#REF!');
            expect(spreadsheet.sheets[0].rows[4].cells[8].value).toBe('#REF!');
            expect(spreadsheet.sheets[0].rows[5].cells[8].value).toBe('3');
            expect(spreadsheet.sheets[0].rows[6].cells[8].value).toBe('#REF!');
            done();
        });
    });

    describe('fb24848 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet(
                {
                    sheets: [{
                        rows: [{ cells: [{ value: '1' }, { index: 4, value: 'Tom' }] }, {
                            cells: [{ value: '2' }, {
                                index: 4,
                                value: 'John'
                            }]
                        }, { cells: [{ value: '5' }, { index: 4, value: 'Jane' }] }, {
                            index: 4, cells: [{
                                formula:
                                    '=INDEX(A1:A3,MATCH("Tom",E1:E3,0),1)'
                            }, { index: 4, formula: '=INDEX(A1:A3,SUM(A1:A1),1)' }]
                        }]
                    }]
                }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('"#REF!" error when combining functions with each over', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            expect(spreadsheet.sheets[0].rows[4].cells[0].value).toEqual('1');
            expect(helper.invoke('getCell', [4, 0]).textContent).toEqual('1');
            expect(spreadsheet.sheets[0].rows[4].cells[4].value).toEqual('1');
            expect(helper.invoke('getCell', [4, 4]).textContent).toEqual('1');
            helper.edit('A1', '3');
            setTimeout((): void => {
                expect(spreadsheet.sheets[0].rows[4].cells[0].value.toString()).toEqual('3');
                expect(helper.invoke('getCell', [4, 0]).textContent).toEqual('3');
                expect(spreadsheet.sheets[0].rows[4].cells[4].value.toString()).toEqual('5');
                expect(helper.invoke('getCell', [4, 4]).textContent).toEqual('5');
                done();
            });
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 3', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: EJ2_53702_INDEX }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - I', (done: Function) => {
            helper.edit('L1', '=INDEX(C2:C10,C23,B28)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('0.482314815');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":"0.4823148148148148","formula":"=INDEX(C2:C10,C23,B28)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - II', (done: Function) => {
            helper.edit('L2', '=INDEX(H2:I12,"2.24","2.6")');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('104.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":"104.32","formula":"=INDEX(H2:I12,\\"2.24\\",\\"2.6\\")"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - III', (done: Function) => {
            helper.edit('L3', '=INDEX(D12:E17,1,"1")');
            const value: string = "'" + "-45.43" + "'";
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe(value);
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":"' + value + '","formula":"=INDEX(D12:E17,1,\\"1\\")"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - IV', (done: Function) => {
            helper.edit('L4', '=INDEX(D13:E18,"2","1")');
            const value: string = "'" + "1" + "'";
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe(value);
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":"' + value + '","formula":"=INDEX(D13:E18,\\"2\\",\\"1\\")"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - V', (done: Function) => {
            helper.edit('L5', '=INDEX(H2:I10,B16,2)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('103.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[11])).toBe('{"value":"103.32","formula":"=INDEX(H2:I10,B16,2)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - VI', (done: Function) => {
            helper.edit('L6', '=INDEX(H7:I11,C32>C31,2)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('108.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[11])).toBe('{"formula":"=INDEX(H7:I11,C32>C31,2)","value":"108.32"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - VII', (done: Function) => {
            helper.edit('L7', '=INDEX(H8:I12,C33<C32,2)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('109.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[11])).toBe('{"formula":"=INDEX(H8:I12,C33<C32,2)","value":"109.32"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - VIII', (done: Function) => {
            helper.edit('L8', '=INDEX(H8:I12,1,C31<C32)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('6543.34579');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[11])).toBe('{"formula":"=INDEX(H8:I12,1,C31<C32)","value":"6543.34578992"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - IX', (done: Function) => {
            helper.edit('L9', '=INDEX(H8:I12,2,C32>=C32)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('13035.06876');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[11])).toBe('{"formula":"=INDEX(H8:I12,2,C32>=C32)","value":"13035.068755"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - X', (done: Function) => {
            helper.edit('L10', '=INDEX(H34:J41,1,2)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[11])).toBe('{"value":0,"formula":"=INDEX(H34:J41,1,2)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XVI', (done: Function) => {
            helper.edit('L17', '=COUNT(INDEX(F14:H20,0,1))');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('0');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[11])).toBe('{"value":0,"formula":"=COUNT(INDEX(F14:H20,0,1))"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XII', (done: Function) => {
            helper.edit('L12', '=INDEX(B2:E11,1,2,1)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('0.482314815');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[11])).toBe('{"value":"0.4823148148148148","formula":"=INDEX(B2:E11,1,2,1)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XIII', (done: Function) => {
            helper.edit('L13', '=INDEX(,1,1,1)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[11])).toBe('{"value":"#VALUE!","formula":"=INDEX(,1,1,1)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XIV', (done: Function) => {
            helper.edit('L14', '=INDEX(3,1,1,)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[11])).toBe('{"value":"#VALUE!","formula":"=INDEX(3,1,1,)"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XV', (done: Function) => {
            helper.edit('L16', '=MIN(INDEX(I2:J11,0,1))');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('103.32');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[11])).toBe('{"value":"103.32","formula":"=MIN(INDEX(I2:J11,0,1))"}');
            done();
        });
        it('INDEX - FORMULA WITH CELL REFERENCE - XVI', (done: Function) => {
            helper.edit('L18', '=INDEX(Sheet1!B3:G10,Sheet1!B14,Sheet1!C25)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('20');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[11])).toBe('{"value":"20","formula":"=INDEX(Sheet1!B3:G10,Sheet1!B14,Sheet1!C25)"}');
            done();
        });
    });

    describe('Reported MATCH Formulae - Checking II ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: reportedBugData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MATCH formula with cell Reference - 1->', (done: Function) => {
            helper.edit('N1', '=MATCH(10,C23:C28,1)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":6,"formula":"=MATCH(10,C23:C28,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 2->', (done: Function) => {
            helper.edit('N2', '=MATCH(2,D2:D5,1)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"#N/A","formula":"=MATCH(2,D2:D5,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 3->', (done: Function) => {
            helper.edit('N3', '=MATCH("Formal",A5:A10,1)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":6,"formula":"=MATCH(\\"Formal\\",A5:A10,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 4->', (done: Function) => {
            helper.edit('H26', 'Yes');
            helper.edit('H27', 'No');
            helper.edit('H28', 'No');
            helper.edit('H29', 'No');
            helper.edit('N4', '=MATCH("Yes",H26:H29,1)');
            expect(helper.invoke('getCell', [3, 13]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[13])).toBe('{"value":1,"formula":"=MATCH(\\"Yes\\",H26:H29,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 5->', (done: Function) => {
            helper.edit('N5', '=MATCH("30",D14:D18,1)');
            expect(helper.invoke('getCell', [4, 13]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[13])).toBe('{"value":5,"formula":"=MATCH(\\"30\\",D14:D18,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 6->', (done: Function) => {
            helper.edit('N6', '=MATCH("TRUE",B24:B25,0)');
            expect(helper.invoke('getCell', [5, 13]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[13])).toBe('{"value":"#N/A","formula":"=MATCH(\\"TRUE\\",B24:B25,0)"}');
            done();
        });
        it('MATCH formula with cell Reference - 7->', (done: Function) => {
            helper.edit('D34', '300.00%');
            helper.edit('D35', '10.00%');
            helper.edit('D36', '1200.00%');
            helper.edit('D37', '900.00%');
            helper.edit('N7', '=MATCH(E16,D34:D37,1)');
            expect(helper.invoke('getCell', [6, 13]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[13])).toBe('{"value":"#DIV/0!","formula":"=MATCH(E16,D34:D37,1)"}');
            done();
        });
        it('MATCH formula with cell Reference - 8->', (done: Function) => {
            helper.edit('N8', '=MATCH(D7,D4:D9,D10)');
            expect(helper.invoke('getCell', [7, 13]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[13])).toBe('{"value":4,"formula":"=MATCH(D7,D4:D9,D10)"}');
            done();
        });
        it('MATCH formula with cell Reference - 0->', (done: Function) => {
            helper.edit('B34', 'TRUE');
            helper.edit('B35', 'FALSE');
            helper.edit('I35', '6/25/2023');
            helper.edit('I36', '7/27/2014');
            helper.edit('I33', '4/7/2021');
            helper.edit('I32', '7/8/2023');
            helper.edit('N9', '=MATCH(E16,D34:D37,1)');
            expect(helper.invoke('getCell', [8, 13]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[13])).toBe('{"value":"#DIV/0!","formula":"=MATCH(E16,D34:D37,1)"}');
            done();
        });
    });

    describe('MATCH formula checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('MATCH formula with lookup range includes more than one col or row>', (done: Function) => {
            helper.edit('I2', '=MATCH(D2,D2:G11,0)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"#N/A","formula":"=MATCH(D2,D2:G11,0)"}');
            helper.edit('I3', '=MATCH(D2,D2:G11,1)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"#N/A","formula":"=MATCH(D2,D2:G11,1)"}');
            done();
        });
        it('MATCH formula with string boolean values', (done: Function) => {
            helper.edit('I4', '"TRUE"');
            helper.edit('I5', '"FALSE"');
            helper.edit('I6', '=MATCH("TRUE",I4:I5,0)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('#N/A');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"#N/A","formula":"=MATCH(\\"TRUE\\",I4:I5,0)"}');
            done();
        });
        it('MATCH formula with invalid reference', (done: Function) => {
            helper.edit('I7', '=MATCH(2,XYZA2:XYZA10,0)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"#NAME?","formula":"=MATCH(2,XYZA2:XYZA10,0)"}');
            done();
        });
        it('MATCH formula with sheet reference', (done: Function) => {
            helper.edit('I8', '=MATCH(A1,Sheet1!A1:A10,0)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":1,"formula":"=MATCH(A1,Sheet1!A1:A10,0)"}');
            done();
        });
        it('MATCH formula with wildcard lookup value', (done: Function) => {
            helper.edit('I9', '=MATCH("Item*",A1:A10,0)');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[8])).toBe('{"value":1,"formula":"=MATCH(\\"Item*\\",A1:A10,0)"}');
            helper.edit('I10', '=MATCH("Sn?akers",A1:A10,0)');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[8])).toBe('{"value":7,"formula":"=MATCH(\\"Sn?akers\\",A1:A10,0)"}');
            done();
        });
    });

    describe('EJ2-861473 -> SUBTOTAL Formula ranges contain an exiting subtotal result in them. ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    rows: [
                        { cells: [{ value: '5' }] }, { cells: [{ value: '10' }] },
                        { cells: [{ value: '15' }] }, { cells: [{ value: '20' }] },
                        { cells: [{ formula: '=SUM(A1:A4)' }] }, { cells: [{ value: '10' }] },
                        { cells: [{ value: '10' }] }, { cells: [{ formula: '=SUBTOTAL(9,A1:A7)' }] }]
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUBTOTAL Formula with AVERAGE Function as argument  ->', (done: Function) => {
            helper.edit('B1', '=SUBTOTAL(1,A1:A5)');
            expect(helper.invoke('getCell', [0, 1]).textContent).toBe('20');
            helper.edit('B2', '=SUBTOTAL(1,A1:A8)');
            expect(helper.invoke('getCell', [1, 1]).textContent).toBe('17.14285714');
            helper.edit('B3', '=SUBTOTAL(1,A5)');
            expect(helper.invoke('getCell', [2, 1]).textContent).toBe('50');
            helper.edit('B4', '=SUBTOTAL(1,A8)');
            expect(helper.invoke('getCell', [3, 1]).textContent).toBe('#DIV/0!');
            done();
        });
        it('SUBTOTAL Formula with COUNT Function as argument  ->', (done: Function) => {
            helper.edit('B5', '=SUBTOTAL(2,A1:A5)');
            expect(helper.invoke('getCell', [4, 1]).textContent).toBe('5');
            helper.edit('B6', '=SUBTOTAL(2,A1:A8)');
            expect(helper.invoke('getCell', [5, 1]).textContent).toBe('7');
            helper.edit('B7', '=SUBTOTAL(2,A5)');
            expect(helper.invoke('getCell', [6, 1]).textContent).toBe('1');
            helper.edit('B8', '=SUBTOTAL(2,A8)');
            expect(helper.invoke('getCell', [7, 1]).textContent).toBe('0');
            done();
        });
        it('SUBTOTAL Formula with COUNTA Function as argument  ->', (done: Function) => {
            helper.edit('B9', '=SUBTOTAL(3,A1:A5)');
            expect(helper.invoke('getCell', [8, 1]).textContent).toBe('5');
            helper.edit('B10', '=SUBTOTAL(3,A1:A8)');
            expect(helper.invoke('getCell', [9, 1]).textContent).toBe('7');
            helper.edit('B11', '=SUBTOTAL(3,A5)');
            expect(helper.invoke('getCell', [10, 1]).textContent).toBe('1');
            helper.edit('B12', '=SUBTOTAL(3,A8)');
            expect(helper.invoke('getCell', [11, 1]).textContent).toBe('0');
            done();
        });
        it('SUBTOTAL Formula with MAX Function as argument  ->', (done: Function) => {
            helper.edit('C1', '=SUBTOTAL(4,A1:A5)');
            expect(helper.invoke('getCell', [0, 2]).textContent).toBe('50');
            helper.edit('C2', '=SUBTOTAL(4,A1:A8)');
            expect(helper.invoke('getCell', [1, 2]).textContent).toBe('50');
            helper.edit('C3', '=SUBTOTAL(4,A5)');
            expect(helper.invoke('getCell', [2, 2]).textContent).toBe('50');
            helper.edit('C4', '=SUBTOTAL(4,A8)');
            expect(helper.invoke('getCell', [3, 2]).textContent).toBe('0');
            done();
        });
        it('SUBTOTAL Formula with MIN Function as argument  ->', (done: Function) => {
            helper.edit('C5', '=SUBTOTAL(5,A1:A5)');
            expect(helper.invoke('getCell', [4, 2]).textContent).toBe('5');
            helper.edit('C6', '=SUBTOTAL(5,A1:A8)');
            expect(helper.invoke('getCell', [5, 2]).textContent).toBe('5');
            helper.edit('C7', '=SUBTOTAL(5,A5)');
            expect(helper.invoke('getCell', [6, 2]).textContent).toBe('50');
            helper.edit('C8', '=SUBTOTAL(5,A8)');
            expect(helper.invoke('getCell', [7, 2]).textContent).toBe('0');
            done();
        });
        it('SUBTOTAL Formula with PRODUCT Function as argument  ->', (done: Function) => {
            helper.edit('C9', '=SUBTOTAL(6,A1:A5)');
            expect(helper.invoke('getCell', [8, 2]).textContent).toBe('750000');
            helper.edit('C10', '=SUBTOTAL(6,A1:A8)');
            expect(helper.invoke('getCell', [9, 2]).textContent).toBe('75000000');
            helper.edit('C11', '=SUBTOTAL(6,A5)');
            expect(helper.invoke('getCell', [10, 2]).textContent).toBe('50');
            helper.edit('C12', '=SUBTOTAL(6,A8)');
            expect(helper.invoke('getCell', [11, 2]).textContent).toBe('0');
            done();
        });
        it('SUBTOTAL Formula with SUM Function as argument  ->', (done: Function) => {
            helper.edit('D1', '=SUBTOTAL(9,A1:A5)');
            expect(helper.invoke('getCell', [0, 3]).textContent).toBe('100');
            helper.edit('D2', '=SUBTOTAL(9,A1:A8)');
            expect(helper.invoke('getCell', [1, 3]).textContent).toBe('120');
            helper.edit('D3', '=SUBTOTAL(9,A5)');
            expect(helper.invoke('getCell', [2, 3]).textContent).toBe('50');
            helper.edit('D4', '=SUBTOTAL(9,A8)');
            expect(helper.invoke('getCell', [3, 3]).textContent).toBe('0');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 1 -', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: EJ2_53702_SUBTOTALS }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SUBTOTAL - 1 & 101 - I', (done: Function) => {
            helper.edit('K1', '=SUBTOTAL(101,C23:C29)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('3.4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[10])).toBe('{"value":"3.4","formula":"=SUBTOTAL(101,C23:C29)"}');
            done();
        });
        it('SUBTOTAL - 1 & 101 - II', (done: Function) => {
            helper.edit('K2', '=SUBTOTAL(101,C4:C12)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0.209019097');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"0.2090190972222222","formula":"=SUBTOTAL(101,C4:C12)"}');
            done();
        });
        it('SUBTOTAL - 1 & 101 - III', (done: Function) => {
            helper.edit('K3', '=SUBTOTAL("101",F4:F90)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('312.9777778');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"312.9777777777778","formula":"=SUBTOTAL(\\"101\\",F4:F90)"}');
            done();
        });
        it('SUBTOTAL - 2 & 102 - I', (done: Function) => {
            helper.edit('L1', '=SUBTOTAL(102,F4:F90)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('9');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[11])).toBe('{"value":9,"formula":"=SUBTOTAL(102,F4:F90)"}');
            done();
        });
        it('SUBTOTAL - 2 & 102 - II', (done: Function) => {
            helper.edit('L2', '=SUBTOTAL(102,C23:C28)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[11])).toBe('{"value":5,"formula":"=SUBTOTAL(102,C23:C28)"}');
            done();
        });
        it('SUBTOTAL - 2 & 102 - III', (done: Function) => {
            helper.edit('L3', '=SUBTOTAL("102",D4:D10)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[11])).toBe('{"value":7,"formula":"=SUBTOTAL(\\"102\\",D4:D10)"}');
            done();
        });
        it('SUBTOTAL - 2 & 102 - IV', (done: Function) => {
            helper.edit('L4', '=SUBTOTAL(102,C30:C33)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[11])).toBe('{"value":4,"formula":"=SUBTOTAL(102,C30:C33)"}');
            done();
        });
        it('SUBTOTAL - 3 & 103 - I', (done: Function) => {
            helper.edit('M1', '=SUBTOTAL(103,C4:C9)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('6');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[12])).toBe('{"value":6,"formula":"=SUBTOTAL(103,C4:C9)"}');
            done();
        });
        it('SUBTOTAL - 3 & 103 - II', (done: Function) => {
            helper.edit('M2', '=SUBTOTAL(103,I23:I31)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[12])).toBe('{"value":4,"formula":"=SUBTOTAL(103,I23:I31)"}');
            done();
        });
        it('SUBTOTAL - 3 & 103 - III', (done: Function) => {
            helper.edit('M3', '=SUBTOTAL(103,C23:C28)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('5');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[12])).toBe('{"value":5,"formula":"=SUBTOTAL(103,C23:C28)"}');
            done();
        });
        it('SUBTOTAL - 3 & 103 - IV', (done: Function) => {
            helper.edit('M4', '=SUBTOTAL("103",E4:E10)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('7');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[12])).toBe('{"value":7,"formula":"=SUBTOTAL(\\"103\\",E4:E10)"}');
            done();
        });
        it('SUBTOTAL - 3 & 103 - V', (done: Function) => {
            helper.edit('M5', '=SUBTOTAL(103,C30:C33)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[12])).toBe('{"value":4,"formula":"=SUBTOTAL(103,C30:C33)"}');
            done();
        });
        it('SUBTOTAL - 5 & 105 - I', (done: Function) => {
            helper.edit('N1', '=SUBTOTAL(5,E4:E10)');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('6.5E-08');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[13])).toBe('{"value":"0.000000065","formula":"=SUBTOTAL(5,E4:E10)"}');
            done();
        });
        it('SUBTOTAL - 5 & 105 - II', (done: Function) => {
            helper.edit('N2', '=SUBTOTAL(K7,H2:H10)');
            expect(helper.invoke('getCell', [1, 13]).textContent).toBe('1.4274787505616882e+36');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[13])).toBe('{"value":"1.4274787505616882e+36","formula":"=SUBTOTAL(K7,H2:H10)"}');
            done();
        });
        it('SUBTOTAL - 5 & 105 - III', (done: Function) => {
            helper.edit('N3', '=SUBTOTAL(K6,E4:E9)');
            expect(helper.invoke('getCell', [2, 13]).textContent).toBe('6.5E-08');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[13])).toBe('{"value":"0.000000065","formula":"=SUBTOTAL(K6,E4:E9)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - I', (done: Function) => {
            helper.edit('O1', '=SUBTOTAL(6,O9,F6,D5,D8,D11)');
            expect(helper.invoke('getCell', [0, 14]).textContent).toBe('4500000');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[14])).toBe('{"value":"4500000","formula":"=SUBTOTAL(6,O9,F6,D5,D8,D11)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - II', (done: Function) => {
            helper.edit('O2', '=SUBTOTAL(6,J3:J11)');
            expect(helper.invoke('getCell', [1, 14]).textContent).toBe('3.335745979914237e+36');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[14])).toBe('{"value":"3.335745979914237e+36","formula":"=SUBTOTAL(6,J3:J11)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - III', (done: Function) => {
            helper.edit('O3', '=SUBTOTAL(6,H3:H11)');
            expect(helper.invoke('getCell', [2, 14]).textContent).toBe('2.0614215281913453e+36');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[14])).toBe('{"value":"2.0614215281913453e+36","formula":"=SUBTOTAL(6,H3:H11)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - IV', (done: Function) => {
            helper.edit('O4', '=SUBTOTAL(K7,I15:I19)');
            expect(helper.invoke('getCell', [3, 14]).textContent).toBe('1.6279232188029734e+23');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[14])).toBe('{"value":"1.6279232188029734e+23","formula":"=SUBTOTAL(K7,I15:I19)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - V', (done: Function) => {
            helper.edit('O5', '=SUBTOTAL(106,A13:A18)');
            expect(helper.invoke('getCell', [4, 14]).textContent).toBe('-1.96140E+13');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[14])).toBe('{"value":"-19613970227617.918","formula":"=SUBTOTAL(106,A13:A18)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - VI', (done: Function) => {
            helper.edit('O6', '=SUBTOTAL(106,G24:G29)');
            expect(helper.invoke('getCell', [5, 14]).textContent).toBe('64');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[14])).toBe('{"value":"64","formula":"=SUBTOTAL(106,G24:G29)"}');
            done();
        });
        it('SUBTOTAL - 6 & 106 - VII', (done: Function) => {
            helper.edit('O7', '=SUBTOTAL("106",C23:C27)');
            expect(helper.invoke('getCell', [6, 14]).textContent).toBe('30');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[14])).toBe('{"value":"30","formula":"=SUBTOTAL(\\"106\\",C23:C27)"}');
            done();
        });
        it('SUBTOTAL - 9 & 109 - I', (done: Function) => {
            helper.edit('P1', '=SUBTOTAL(9,I15:I21)');
            expect(helper.invoke('getCell', [0, 15]).textContent).toBe('307780');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[15])).toBe('{"value":307780,"formula":"=SUBTOTAL(9,I15:I21)"}');
            done();
        });
        it('SUBTOTAL - 9 & 109 - II', (done: Function) => {
            helper.edit('P2', '=SUBTOTAL(109,C23:C30)');
            expect(helper.invoke('getCell', [1, 15]).textContent).toBe('25');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[15])).toBe('{"value":25,"formula":"=SUBTOTAL(109,C23:C30)"}');
            done();
        });
        it('SUBTOTAL - 9 & 109 - III', (done: Function) => {
            helper.edit('P3', '=SUBTOTAL(109,B27:H27)');
            expect(helper.invoke('getCell', [2, 15]).textContent).toBe('31.68690563');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[15])).toBe('{"value":"31.686905628508693","formula":"=SUBTOTAL(109,B27:H27)"}');
            done();
        });
        it('SUBTOTAL - 9 & 109 - IV', (done: Function) => {
            helper.edit('P4', '=SUBTOTAL(109,C19,C22,C25,C28,C29)');
            expect(helper.invoke('getCell', [3, 15]).textContent).toBe('9');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[15])).toBe('{"value":9,"formula":"=SUBTOTAL(109,C19,C22,C25,C28,C29)"}');
            done();
        });
        it('SUBTOTAL - Absolute cell reference - I', (done: Function) => {
            helper.edit('Q1', '=SUBTOTAL($K$14,$C$7:$C$9,$B$7:$B$9,$E$6:$E$9,$F$7:$F$10,$B$14:$B$18)');
            expect(helper.invoke('getCell', [0, 16]).textContent).toBe('14');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[16])).toBe('{"value":14,"formula":"=SUBTOTAL($K$14,$C$7:$C$9,$B$7:$B$9,$E$6:$E$9,$F$7:$F$10,$B$14:$B$18)"}');
            done();
        });
        it('SUBTOTAL - Sheet reference - I', (done: Function) => {
            helper.edit('R1', '=SUBTOTAL(Sheet1!K13,Sheet1!G9:G11,Sheet1!C7:C10,Sheet1!D6:D11,Sheet1!D13:D15)');
            expect(helper.invoke('getCell', [0, 17]).textContent).toBe('18.40200588');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[17])).toBe(
                '{"value":"18.402005876068376","formula":"=SUBTOTAL(Sheet1!K13,Sheet1!G9:G11,Sheet1!C7:C10,Sheet1!D6:D11,Sheet1!D13:D15)"}'
            );
            done();
        });
        it('SUBTOTAL - Sheet reference - II', (done: Function) => {
            helper.edit('R2', '=SUBTOTAL(Sheet1!B17,Sheet1!B4:B8,Sheet1!I5:I11)');
            expect(helper.invoke('getCell', [1, 17]).textContent).toBe('17492.10333');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[17])).toBe('{"value":"17492.103333333336","formula":"=SUBTOTAL(Sheet1!B17,Sheet1!B4:B8,Sheet1!I5:I11)"}');
            done();
        });
        it('SUBTOTAL - Invalid arguments - I', (done: Function) => {
            helper.edit('S1', '"=SUBTOTAL(1,34)');
            expect(helper.invoke('getCell', [0, 18]).textContent).toBe('"=SUBTOTAL(1,34)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[18])).toBe('{"value":"\\"=SUBTOTAL(1,34)"}');
            done();
        });
        it('SUBTOTAL - Invalid arguments - II', (done: Function) => {
            helper.edit('S2', '"=SUBTOTAL(5,)');
            expect(helper.invoke('getCell', [1, 18]).textContent).toBe('"=SUBTOTAL(5,)');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[18])).toBe('{"value":"\\"=SUBTOTAL(5,)"}');
            done();
        });
    });

    describe('Unique Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('UNIQUE Formula with with reverse row selection->', (done: Function) => {
            helper.edit('I2', '=UNIQUE(E11:E2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('20');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('30');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('15');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"20","formula":"=UNIQUE(E11:E2)"}');
            done();
        });
        it('UNIQUE Formula with reverse Column selection->', (done: Function) => {
            helper.edit('J1', '=UNIQUE(H2:D2)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('20');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('200');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('1');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"10","formula":"=UNIQUE(H2:D2)"}');
            done();
        });
        it('UNIQUE Formula for by column value as True->', (done: Function) => {
            helper.edit('J2', '=UNIQUE(D2:H2,1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('20');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('200');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":"10","formula":"=UNIQUE(D2:H2,1)"}');
            done();
        });
        it('UNIQUE Formula for by column value as True and Exactly once as True->', (done: Function) => {
            helper.edit('J3', '=UNIQUE(D2:H2,1,TRUE)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('200');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('1');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[9])).toBe('{"value":"20","formula":"=UNIQUE(D2:H2,1,TRUE)"}');
            done();
        });
        it('UNIQUE Formula with single cell->', (done: Function) => {
            helper.edit('J4', '=UNIQUE(A1)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('Item Name');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[9])).toBe('{"value":"Item Name","formula":"=UNIQUE(A1)"}');
            done();
        });
        it('UNIQUE Formula with Column Header as NUll ->', (done: Function) => {
            helper.edit('J5', '=UNIQUE(2:2,1,TRUE)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('41684');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('0.482314815');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[9])).toBe('{"value":"Casual Shoes","formula":"=UNIQUE(2:2,1,TRUE)"}');
            done();
        });
        it('UNIQUE Formula with Row Number as NUll ->', (done: Function) => {
            helper.edit('J6', '=UNIQUE(E:E)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('Price');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('30');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('15');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('10');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[9])).toBe('{"value":"Price","formula":"=UNIQUE(E:E)"}');
            done();
        });
        it('UNIQUE Formula with no arguments->', (done: Function) => {
            helper.edit('I1', '=UNIQUE()');
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=UNIQUE()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=UNIQUE()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I1', '=UNIQUE(E11:E2)');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 12 -', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: EJ2_53702_UNIQUE }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('UNIQUE - Specific Type - I', (done: Function) => {
            helper.edit('Z1', '=UNIQUE(Grape, FALSE, FALSE)');
            expect(helper.invoke('getCell', [0, 25]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[25])).toBe('{"value":"#NAME?","formula":"=UNIQUE(Grape, FALSE, FALSE)"}');
            done();
        });
        it('UNIQUE - Specific Type - II', (done: Function) => {
            helper.edit('Z2', '=UNIQUE(Grape, TRUE, TRUE)');
            expect(helper.invoke('getCell', [1, 25]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[25])).toBe('{"value":"#NAME?","formula":"=UNIQUE(Grape, TRUE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - III', (done: Function) => {
            helper.edit('Z3', '=UNIQUE(Grape, FALSE, TRUE)');
            expect(helper.invoke('getCell', [2, 25]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[25])).toBe('{"value":"#NAME?","formula":"=UNIQUE(Grape, FALSE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - IV', (done: Function) => {
            helper.edit('Z4', '=UNIQUE(Grape, TRUE, FALSE)');
            expect(helper.invoke('getCell', [3, 25]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[25])).toBe('{"value":"#NAME?","formula":"=UNIQUE(Grape, TRUE, FALSE)"}');
            done();
        });
        it('UNIQUE - Specific Type - V', (done: Function) => {
            helper.edit('Z5', '=UNIQUE(M5:N5, TRUE,)');
            expect(helper.invoke('getCell', [4, 25]).textContent).toBe('Element');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[25])).toBe('{"value":"Element","formula":"=UNIQUE(M5:N5, TRUE,)"}');
            done();
        });
        it('UNIQUE - Specific Type - VI', (done: Function) => {
            helper.edit('Z6', '=UNIQUE(M5:N5, TRUE, TRUE)');
            expect(helper.invoke('getCell', [5, 25]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[25])).toBe('{"value":"#CALC!","formula":"=UNIQUE(M5:N5, TRUE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - VII', (done: Function) => {
            helper.edit('Z7', '=UNIQUE(M15:M16, FALSE, TRUE)');
            expect(helper.invoke('getCell', [6, 25]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[25])).toBe('{"value":"#CALC!","formula":"=UNIQUE(M15:M16, FALSE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - VIII', (done: Function) => {
            helper.edit('Z8', '=UNIQUE(M15:M17, FALSE, TRUE)');
            expect(helper.invoke('getCell', [7, 25]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[25])).toBe('{"value":"#CALC!","formula":"=UNIQUE(M15:M17, FALSE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - IX', (done: Function) => {
            helper.edit('Z9', '=UNIQUE(P2:P9, FALSE, TRUE)');
            expect(helper.invoke('getCell', [8, 25]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[25])).toBe('{"value":"#CALC!","formula":"=UNIQUE(P2:P9, FALSE, TRUE)"}');
            done();
        });
        it('UNIQUE - Specific Type - X', (done: Function) => {
            helper.edit('Z10', '=UNIQUE(O8:O14, FALSE, FALSE)');
            expect(helper.invoke('getCell', [9, 25]).textContent).toBe('Orange');
            expect(helper.invoke('getCell', [10, 25]).textContent).toBe('ori');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[25])).toBe('{"value":"Orange","formula":"=UNIQUE(O8:O14, FALSE, FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[25])).toBe('{"value":"ori"}');
            done();
        });
        it('UNIQUE - Specific Type - XI', (done: Function) => {
            helper.edit('Z12', '=UNIQUE(G38:H47, TRUE, TRUE)');
            expect(helper.invoke('getCell', [11, 25]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[25])).toBe('{"value":"#CALC!","formula":"=UNIQUE(G38:H47, TRUE, TRUE)"}');
            done();
        });
        it('UNIQUE - Normal value - I', (done: Function) => {
            helper.edit('T1', '=UNIQUE(L6:N6, TRUE, FALSE)');
            expect(helper.invoke('getCell', [0, 19]).textContent).toBe('yes');
            expect(helper.invoke('getCell', [0, 20]).textContent).toBe('Flag');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[19])).toBe('{"value":"yes","formula":"=UNIQUE(L6:N6, TRUE, FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[20])).toBe('{"value":"Flag"}');
            done();
        });
        it('UNIQUE - Normal value - II', (done: Function) => {
            helper.edit('T2', '=UNIQUE(M2:N4, "TRUE", TRUE)');
            expect(helper.invoke('getCell', [1, 19]).textContent).toBe('#CALC!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[19])).toBe('{"value":"#CALC!","formula":"=UNIQUE(M2:N4, \\"TRUE\\", TRUE)"}');
            done();
        });
        it('UNIQUE - Normal value - III', (done: Function) => {
            helper.edit('T3', '=UNIQUE(O8:O11, FALSE, TRUE)');
            expect(helper.invoke('getCell', [2, 19]).textContent).toBe('ori');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[19])).toBe('{"value":"ori","formula":"=UNIQUE(O8:O11, FALSE, TRUE)"}');
            done();
        });
        it('UNIQUE - Normal value - IV', (done: Function) => {
            helper.edit('T4', '=UNIQUE(M1:N4, Tue, TRUE)');
            expect(helper.invoke('getCell', [3, 19]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[19])).toBe('{"value":"#NAME?","formula":"=UNIQUE(M1:N4, Tue, TRUE)"}');
            done();
        });
        it('UNIQUE - Normal value - V', (done: Function) => {
            helper.edit('T5', '=UNIQUE(M1:N4, T, T)');
            expect(helper.invoke('getCell', [4, 19]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[19])).toBe('{"value":"#NAME?","formula":"=UNIQUE(M1:N4, T, T)"}');
            done();
        });
        it('UNIQUE - Normal value - VI', (done: Function) => {
            helper.edit('T6', '=UNIQUE(L28, FALSE, )');
            expect(helper.invoke('getCell', [5, 19]).textContent).toBe('12:00AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[19])).toBe('{"value":"12:00AM","formula":"=UNIQUE(L28, FALSE, )"}');
            done();
        });
        it('UNIQUE - Normal value - VII', (done: Function) => {
            helper.edit('T7', '=UNIQUE(C20:C27, 0, 0)');
            expect(helper.invoke('getCell', [6, 19]).textContent).toBe('Apple');
            expect(helper.invoke('getCell', [7, 19]).textContent).toBe('Ball');
            expect(helper.invoke('getCell', [8, 19]).textContent).toBe('"apple"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[19])).toBe('{"value":"Apple","formula":"=UNIQUE(C20:C27, 0, 0)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[19])).toBe('{"value":"Ball"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[19])).toBe('{"value":"\\"apple\\""}');
            done();
        });
        it('UNIQUE - Normal value - VIII', (done: Function) => {
            helper.edit('T10', '=UNIQUE(C20:C27, FALSE, 1)');
            expect(helper.invoke('getCell', [9, 19]).textContent).toBe('Ball');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[19])).toBe('{"value":"Ball","formula":"=UNIQUE(C20:C27, FALSE, 1)"}');
            done();
        });
        it('UNIQUE - Normal value - IX', (done: Function) => {
            helper.edit('T11', '=UNIQUE(C20:C27, , 1)');
            expect(helper.invoke('getCell', [10, 19]).textContent).toBe('Ball');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[19])).toBe('{"value":"Ball","formula":"=UNIQUE(C20:C27, , 1)"}');
            done();
        });
        it('UNIQUE - Normal value - X', (done: Function) => {
            helper.edit('T12', '=UNIQUE(C20:C27, 0, 1)');
            expect(helper.invoke('getCell', [11, 19]).textContent).toBe('Ball');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[19])).toBe('{"value":"Ball","formula":"=UNIQUE(C20:C27, 0, 1)"}');
            done();
        });
        it('UNIQUE - Normal value - XI', (done: Function) => {
            helper.edit('T13', '=UNIQUE(C20:C27, FALSE, FALSE)');
            expect(helper.invoke('getCell', [12, 19]).textContent).toBe('Apple');
            expect(helper.invoke('getCell', [13, 19]).textContent).toBe('Ball');
            expect(helper.invoke('getCell', [14, 19]).textContent).toBe('"apple"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[19])).toBe('{"value":"Apple","formula":"=UNIQUE(C20:C27, FALSE, FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[19])).toBe('{"value":"Ball"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[19])).toBe('{"value":"\\"apple\\""}');
            done();
        });
        it('UNIQUE - Normal value - XII', (done: Function) => {
            helper.edit('T16', '=UNIQUE(C20:C27, FALSE, "1")');
            expect(helper.invoke('getCell', [15, 19]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[19])).toBe('{"value":"#VALUE!","formula":"=UNIQUE(C20:C27, FALSE, \\"1\\")"}');
            done();
        });
        it('UNIQUE - Normal value - XIII', (done: Function) => {
            helper.edit('T17', '=UNIQUE(C20:C27, FALSE, "true")');
            expect(helper.invoke('getCell', [16, 19]).textContent).toBe('Ball');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[19])).toBe('{"value":"Ball","formula":"=UNIQUE(C20:C27, FALSE, \\"true\\")"}');
            done();
        });
        it('UNIQUE - Normal value - XIV', (done: Function) => {
            helper.edit('T18', '=UNIQUE(C20:C27, FALSE, "0")');
            expect(helper.invoke('getCell', [17, 19]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[19])).toBe('{"value":"#VALUE!","formula":"=UNIQUE(C20:C27, FALSE, \\"0\\")"}');
            done();
        });
        it('UNIQUE - Cell reference - I', (done: Function) => {
            helper.edit('T19', '=UNIQUE(L6:N6, 59, FALSE)');
            expect(helper.invoke('getCell', [18, 19]).textContent).toBe('yes');
            expect(helper.invoke('getCell', [18, 20]).textContent).toBe('Flag');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[19])).toBe('{"value":"yes","formula":"=UNIQUE(L6:N6, 59, FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[20])).toBe('{"value":"Flag"}');
            done();
        });
        it('UNIQUE - Cell reference - II', (done: Function) => {
            helper.edit('U2', '=UNIQUE(L6:N6, L21, L25)');
            expect(helper.invoke('getCell', [1, 20]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[20])).toBe('{"value":"#VALUE!","formula":"=UNIQUE(L6:N6, L21, L25)"}');
            done();
        });
        it('UNIQUE - Cell reference - III', (done: Function) => {
            helper.edit('U3', '=UNIQUE(D27:D29, I23, I25)');
            expect(helper.invoke('getCell', [2, 20]).textContent).toBe('#DIV/0!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[20])).toBe('{"value":"#DIV/0!","formula":"=UNIQUE(D27:D29, I23, I25)"}');
            done();
        });
        it('UNIQUE - Cell reference - IV', (done: Function) => {
            helper.edit('U4', '=UNIQUE(D27:D29,TRUE, I25)');
            expect(helper.invoke('getCell', [3, 20]).textContent).toBe('#REF!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[20])).toBe('{"value":"#REF!","formula":"=UNIQUE(D27:D29,TRUE, I25)"}');
            done();
        });
        it('UNIQUE - Cell reference - V', (done: Function) => {
            helper.edit('U5', '=UNIQUE(L21:L30, FALSE, TRUE)');
            expect(helper.invoke('getCell', [7, 20]).textContent).toBe('567.9');
            expect(helper.invoke('getCell', [9, 20]).textContent).toBe('44989');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[20])).toBe('{"value":"567.9"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[20])).toBe('{"value":"44989"}');
            done();
        });
        it('UNIQUE - Cell reference - VI', (done: Function) => {
            helper.edit('S1', '=UNIQUE(L21:L30, TRUE, FALSE)');
            expect(helper.invoke('getCell', [5, 18]).textContent).toBe('TRUE');
            expect(helper.invoke('getCell', [7, 18]).textContent).toBe('12:00AM');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[18])).toBe('{"value":"True"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[18])).toBe('{"value":"12:00AM"}');
            done();
        });
        it('UNIQUE - Cell Ref - I', (done: Function) => {
            helper.edit('V1', '=UNIQUE($C$20:$C$27, FALSE, 1)');
            expect(helper.invoke('getCell', [0, 21]).textContent).toBe('Ball');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[21])).toBe('{"value":"Ball","formula":"=UNIQUE($C$20:$C$27, FALSE, 1)"}');
            done();
        });
        it('UNIQUE - Cell Ref - II', (done: Function) => {
            helper.edit('V2', '=UNIQUE($C20:C$27, 0, 0)');
            expect(helper.invoke('getCell', [1, 21]).textContent).toBe('Apple');
            expect(helper.invoke('getCell', [2, 21]).textContent).toBe('Ball');
            expect(helper.invoke('getCell', [3, 21]).textContent).toBe('"apple"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[21])).toBe('{"value":"Apple","formula":"=UNIQUE($C20:C$27, 0, 0)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[21])).toBe('{"value":"Ball"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[21])).toBe('{"value":"\\"apple\\""}');
            done();
        });
        it('UNIQUE - Different datatypes - I', (done: Function) => {
            helper.edit('W1', '=UNIQUE(Q21:Q28, 0, 1)');
            expect(helper.invoke('getCell', [0, 22]).textContent).toBe('22/2');
            expect(helper.invoke('getCell', [1, 22]).textContent).toBe('15-3');
            expect(helper.invoke('getCell', [2, 22]).textContent).toBe('10.009+E8');
            expect(helper.invoke('getCell', [3, 22]).textContent).toBe('!True');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[22])).toBe('{"value":"22/2","formula":"=UNIQUE(Q21:Q28, 0, 1)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[22])).toBe('{"value":"15-3"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[22])).toBe('{"value":"10.009+E8"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[22])).toBe('{"value":"!True"}');
            done();
        });
        it('UNIQUE - Different datatypes - II', (done: Function) => {
            helper.edit('W5', '=UNIQUE(2+2, 0, 0)');
            expect(helper.invoke('getCell', [4, 22]).textContent).toBe('4');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[22])).toBe('{"value":"4","formula":"=UNIQUE(2+2, 0, 0)"}');
            done();
        });
        it('UNIQUE - Different datatypes - III', (done: Function) => {
            helper.edit('W5', '=UNIQUE(Q21:Q24, 0, 0)');
            expect(helper.invoke('getCell', [4, 22]).textContent).toBe('6+2.83');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[22])).toBe('{"value":"6+2.83","formula":"=UNIQUE(Q21:Q24, 0, 0)"}');
            done();
        });
        it('UNIQUE - Different datatypes - IV', (done: Function) => {
            helper.edit('W9', '=UNIQUE(M19:M29, 0, 1)');
            expect(helper.invoke('getCell', [8, 22]).textContent).toBe('123Hello');
            expect(helper.invoke('getCell', [9, 22]).textContent).toBe('hell');
            expect(helper.invoke('getCell', [10, 22]).textContent).toBe('hi');
            expect(helper.invoke('getCell', [11, 22]).textContent).toBe('@');
            expect(helper.invoke('getCell', [12, 22]).textContent).toBe('A123@!hi');
            expect(helper.invoke('getCell', [13, 22]).textContent).toBe('Jim324');
            expect(helper.invoke('getCell', [14, 22]).textContent).toBe('#Yes!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[22])).toBe('{"value":"123Hello","formula":"=UNIQUE(M19:M29, 0, 1)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[22])).toBe('{"value":"hell"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[22])).toBe('{"value":"hi"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[22])).toBe('{"value":"@"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[22])).toBe('{"value":"A123@!hi"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[22])).toBe('{"value":"Jim324"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[22])).toBe('{"value":"#Yes!"}');
            done();
        });
        it('UNIQUE - Different datatypes - V', (done: Function) => {
            helper.edit('W16', '=UNIQUE(Q21:Q28, 0, 0)');
            expect(helper.invoke('getCell', [15, 22]).textContent).toBe('6+2.83');
            expect(helper.invoke('getCell', [16, 22]).textContent).toBe('2*7');
            expect(helper.invoke('getCell', [17, 22]).textContent).toBe('22/2');
            expect(helper.invoke('getCell', [18, 22]).textContent).toBe('15-3');
            expect(helper.invoke('getCell', [19, 22]).textContent).toBe('10.009+E8');
            expect(helper.invoke('getCell', [20, 22]).textContent).toBe('!True');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[22])).toBe('{"value":"6+2.83","formula":"=UNIQUE(Q21:Q28, 0, 0)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[22])).toBe('{"value":"2*7"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[22])).toBe('{"value":"22/2"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[18].cells[22])).toBe('{"value":"15-3"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[19].cells[22])).toBe('{"value":"10.009+E8"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[22])).toBe('{"value":"!True"}');
            done();
        });
        it('UNIQUE - Different datatypes - III', (done: Function) => {
            helper.edit('W22', '=UNIQUE(M19:M29, 0, 0)');
            expect(helper.invoke('getCell', [21, 22]).textContent).toBe('hello123');
            expect(helper.invoke('getCell', [22, 22]).textContent).toBe('h123eLLlo');
            expect(helper.invoke('getCell', [23, 22]).textContent).toBe('123Hello');
            expect(helper.invoke('getCell', [24, 22]).textContent).toBe('hell');
            expect(helper.invoke('getCell', [25, 22]).textContent).toBe('hi');
            expect(helper.invoke('getCell', [26, 22]).textContent).toBe('@');
            expect(helper.invoke('getCell', [27, 22]).textContent).toBe('A123@!hi');
            expect(helper.invoke('getCell', [28, 22]).textContent).toBe('Jim324');
            expect(helper.invoke('getCell', [29, 22]).textContent).toBe('#Yes!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[22])).toBe('{"value":"hello123","formula":"=UNIQUE(M19:M29, 0, 0)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[22])).toBe('{"value":"h123eLLlo"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[22])).toBe('{"value":"123Hello"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[24].cells[22])).toBe('{"value":"hell"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[25].cells[22])).toBe('{"value":"hi"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[26].cells[22])).toBe('{"value":"@"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[27].cells[22])).toBe('{"value":"A123@!hi"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[28].cells[22])).toBe('{"value":"Jim324"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[29].cells[22])).toBe('{"value":"#Yes!"}');
            done();
        });
        it('UNIQUE - Sheets - I', (done: Function) => {
            helper.edit('X1', '=UNIQUE(Sheet1!Q21:Sheet1!Q28, 0, 1)');
            expect(helper.invoke('getCell', [0, 23]).textContent).toBe('22/2');
            expect(helper.invoke('getCell', [1, 23]).textContent).toBe('15-3');
            expect(helper.invoke('getCell', [2, 23]).textContent).toBe('10.009+E8');
            expect(helper.invoke('getCell', [3, 23]).textContent).toBe('!True');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[23])).toBe('{"value":"22/2","formula":"=UNIQUE(Sheet1!Q21:Sheet1!Q28, 0, 1)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[23])).toBe('{"value":"15-3"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[23])).toBe('{"value":"10.009+E8"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[23])).toBe('{"value":"!True"}');
            done();
        });
        it('UNIQUE - Sheets - II', (done: Function) => {
            helper.edit('X5', '=UNIQUE(Sheet1!L6:N6, $L$21, FALSE)');
            expect(helper.invoke('getCell', [4, 23]).textContent).toBe('yes');
            expect(helper.invoke('getCell', [4, 24]).textContent).toBe('Flag');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[23])).toBe('{"value":"yes","formula":"=UNIQUE(Sheet1!L6:N6, $L$21, FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[24])).toBe('{"value":"Flag"}');
            done();
        });
        it('UNIQUE - Sheets - II', (done: Function) => {
            helper.edit('X6', '=UNIQUE(Sheet1!C$20:Sheet1!$C27, 0, 0)');
            expect(helper.invoke('getCell', [5, 23]).textContent).toBe('Apple');
            expect(helper.invoke('getCell', [6, 23]).textContent).toBe('Ball');
            expect(helper.invoke('getCell', [7, 23]).textContent).toBe('"apple"');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[23])).toBe('{"value":"Apple","formula":"=UNIQUE(Sheet1!C$20:Sheet1!$C27, 0, 0)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[23])).toBe('{"value":"Ball"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[23])).toBe('{"value":"\\"apple\\""}');
            done();
        });
        it('UNIQUE - Sheets - III', (done: Function) => {
            helper.edit('X9', '=UNIQUE(A1:A10, LEN("h"), FALSE)');
            expect(helper.invoke('getCell', [8, 23]).textContent).toBe('1');
            expect(helper.invoke('getCell', [9, 23]).textContent).toBe('Ball');
            expect(helper.invoke('getCell', [10, 23]).textContent).toBe('Cell');
            expect(helper.invoke('getCell', [11, 23]).textContent).toBe('Drink');
            expect(helper.invoke('getCell', [12, 23]).textContent).toBe('Element');
            expect(helper.invoke('getCell', [13, 23]).textContent).toBe('Flag');
            expect(helper.invoke('getCell', [14, 23]).textContent).toBe('Gell');
            expect(helper.invoke('getCell', [15, 23]).textContent).toBe('Hike');
            expect(helper.invoke('getCell', [16, 23]).textContent).toBe('Ink');
            expect(helper.invoke('getCell', [17, 23]).textContent).toBe('Jag');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[8].cells[23])).toBe('{"value":"1","formula":"=UNIQUE(A1:A10, LEN(\\"h\\"), FALSE)"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[9].cells[23])).toBe('{"value":"Ball"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[10].cells[23])).toBe('{"value":"Cell"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[23])).toBe('{"value":"Drink"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[23])).toBe('{"value":"Element"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[13].cells[23])).toBe('{"value":"Flag"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[23])).toBe('{"value":"Gell"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[23])).toBe('{"value":"Hike"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[16].cells[23])).toBe('{"value":"Ink"}');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[17].cells[23])).toBe('{"value":"Jag"}');
            done();
        });
    });

    describe('EJ2-859157 -> ', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('script error throws while deleting a value in range of UNIQUE formula', (done: Function) => {
            helper.edit('J5', '44');
            helper.edit('J2', '=UNIQUE(H2:H8)');
            helper.invoke('selectRange', ['J5']);
            helper.triggerKeyNativeEvent(46);
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('14');
            done();
        });
    });

    describe('Text Formula - Checking with Different Date Format->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TEXT Formula with Date format - dd-MMM-yyyy ->', (done: Function) => {
            helper.edit('I1', '=TEXT(B2,"dd-MMM-yyyy")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('Feb 14, 2014');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toEqual('=TEXT(B2,"dd-MMM-yyyy")');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toEqual('Feb 14, 2014');
            done();
        });
        it('TEXT Formula with Date format - dd MMM yyyy ->', (done: Function) => {
            helper.edit('I2', '=TEXT(B3,"dd MMM yyyy")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('Jun 11, 2014');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toEqual('=TEXT(B3,"dd MMM yyyy")');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].value).toEqual('Jun 11, 2014');
            done();
        });
        it('TEXT Formula with Date format - MMM-yyyy ->', (done: Function) => {
            helper.edit('I3', '=TEXT(B4,"MMM-yyyy")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('Jul-2014');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].formula).toEqual('=TEXT(B4,"MMM-yyyy")');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toEqual('Jul-2014');
            done();
        });
        it('TEXT Formula with Date format - MMM yyyy ->', (done: Function) => {
            helper.edit('I4', '=TEXT(B5,"MMM yyyy")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('Nov 2014');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].formula).toEqual('=TEXT(B5,"MMM yyyy")');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].value).toEqual('Nov 2014');
            done();
        });
        it('TEXT Formula with Date format - MM-dd-yyyy ->', (done: Function) => {
            helper.edit('I5', '=TEXT(B6,"MM-dd-yyyy")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('06-23-2014');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].formula).toEqual('=TEXT(B6,"MM-dd-yyyy")');
            done();
        });
        it('TEXT Formula with Date format - dd-MM-yyyy ->', (done: Function) => {
            helper.edit('I6', '=TEXT(B7,"dd-MM-yyyy")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('22-07-2014');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].formula).toEqual('=TEXT(B7,"dd-MM-yyyy")');
            done();
        });
        it('TEXT Formula with Date format - dd-MM-yy ->', (done: Function) => {
            helper.edit('I7', '=TEXT(B8,"dd-MM-yy")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('04-02-14');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].formula).toEqual('=TEXT(B8,"dd-MM-yy")');
            done();
        });
        it('TEXT Formula with Date format - MM/dd/yyyy ->', (done: Function) => {
            helper.edit('I8', '=TEXT(B9,"MM/dd/yyyy")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('11/30/14');
            expect(helper.getInstance().sheets[0].rows[7].cells[8].formula).toEqual('=TEXT(B9,"MM/dd/yyyy")');
            done();
        });
        it('TEXT Formula with Date format - dd/MM/yyyy ->', (done: Function) => {
            helper.edit('I9', '=TEXT(B10,"dd/MM/yyyy")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('7/9/14');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toEqual('=TEXT(B10,"dd/MM/yyyy")');
            done();
        });
        it('TEXT Formula with Date format - dd/MM/yy ->', (done: Function) => {
            helper.edit('I10', '=TEXT(B11,"dd/MM/yy")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('10/31/14');
            expect(helper.getInstance().sheets[0].rows[9].cells[8].formula).toEqual('=TEXT(B11,"dd/MM/yy")');
            done();
        });
        it('TEXT Formula with Date format - MMM d ->', (done: Function) => {
            helper.edit('I11', '=TEXT(B4,"MMM d")');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('Jul 27');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].formula).toEqual('=TEXT(B4,"MMM d")');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].value).toEqual('Jul 27');
            done();
        });
        it('TEXT Formula with Date format - M/yyyy ->', (done: Function) => {
            helper.edit('I12', '=TEXT(B5,"M/yyyy")');
            const cellEle: HTMLElement = helper.invoke('getCell', [11, 8]);
            expect(cellEle.textContent).toBe('11/2014');
            expect(cellEle.classList.contains('e-right-align')).toBeFalsy();
            expect(helper.getInstance().sheets[0].rows[11].cells[8].formula).toEqual('=TEXT(B5,"M/yyyy")');
            done();
        });
        it('TEXT Formula with Date format - dddd MMMM dd yyyy ->', (done: Function) => {
            helper.edit('J1', '=TEXT(B2,"dddd MMMM dd yyyy")');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('February 14, 2014');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].formula).toEqual('=TEXT(B2,"dddd MMMM dd yyyy")');
            expect(helper.getInstance().sheets[0].rows[0].cells[9].value).toEqual('February 14, 2014');
            done();
        });
        it('TEXT Formula with Date format - dd MMMM yyyy ->', (done: Function) => {
            helper.edit('J2', '=TEXT(B3,"dd MMMM yyyy")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('June 11, 2014');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].formula).toEqual('=TEXT(B3,"dd MMMM yyyy")');
            expect(helper.getInstance().sheets[0].rows[1].cells[9].value).toEqual('June 11, 2014');
            done();
        });
        it('TEXT Formula with Date format - d MMMM yyyy ->', (done: Function) => {
            helper.edit('J3', '=TEXT(B4,"d MMMM yyyy")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('Jul 27, 2014');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].formula).toEqual('=TEXT(B4,"d MMMM yyyy")');
            expect(helper.getInstance().sheets[0].rows[2].cells[9].value).toEqual('Jul 27, 2014');
            done();
        });
        it('TEXT Formula with Date format - yyyy ->', (done: Function) => {
            helper.edit('J4', '=TEXT(B5,"yyyy")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('2014');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].formula).toEqual('=TEXT(B5,"yyyy")');
            expect(helper.getInstance().sheets[0].rows[3].cells[9].value).toEqual('2014');
            done();
        });
        it('TEXT Formula with Date format - dddd ->', (done: Function) => {
            helper.edit('J5', '=TEXT(B3,"dddd")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('Wednesday');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].formula).toEqual('=TEXT(B3,"dddd")');
            expect(helper.getInstance().sheets[0].rows[4].cells[9].value).toEqual('Wednesday');
            done();
        });
        it('TEXT Formula with Date format - d ->', (done: Function) => {
            helper.edit('J6', '=TEXT(B4,"d")');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('27');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].formula).toEqual('=TEXT(B4,"d")');
            expect(helper.getInstance().sheets[0].rows[5].cells[9].value).toEqual('27');
            done();
        });
        it('TEXT Formula with Date format - d dddd ->', (done: Function) => {
            helper.edit('J7', '=TEXT(B3,"d dddd")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('11 Wed');
            expect(helper.getInstance().sheets[0].rows[6].cells[9].formula).toEqual('=TEXT(B3,"d dddd")');
            expect(helper.getInstance().sheets[0].rows[6].cells[9].value).toEqual('11 Wed');
            done();
        });
        it('TEXT Formula with Date format - M ->', (done: Function) => {
            helper.edit('J8', '=TEXT(B5,"M")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('11');
            expect(helper.getInstance().sheets[0].rows[7].cells[9].formula).toEqual('=TEXT(B5,"M")');
            expect(helper.getInstance().sheets[0].rows[7].cells[9].value).toEqual('11');
            done();
        });
        it('TEXT Formula with Date format - Md ->', (done: Function) => {
            helper.edit('J9', '=TEXT(B2,"Md")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('2/14');
            expect(helper.getInstance().sheets[0].rows[8].cells[9].formula).toEqual('=TEXT(B2,"Md")');
            done();
        });
        it('TEXT Formula with Date format - MMM ->', (done: Function) => {
            helper.edit('J10', '=TEXT(B5,"MMM")');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('Nov');
            expect(helper.getInstance().sheets[0].rows[9].cells[9].formula).toEqual('=TEXT(B5,"MMM")');
            expect(helper.getInstance().sheets[0].rows[9].cells[9].value).toEqual('Nov');
            done();
        });
        it('TEXT Formula with Date format - ddd MMM d ->', (done: Function) => {
            helper.edit('J11', '=TEXT(B3,"ddd MMM d")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('Wed, Jun 11');
            expect(helper.getInstance().sheets[0].rows[10].cells[9].formula).toEqual('=TEXT(B3,"ddd MMM d")');
            expect(helper.getInstance().sheets[0].rows[10].cells[9].value).toEqual('Wed, Jun 11');
            done();
        });
        it('TEXT Formula with Date format - ddd->', (done: Function) => {
            helper.edit('J12', '=TEXT(B6,"ddd")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('Mon');
            expect(helper.getInstance().sheets[0].rows[11].cells[9].formula).toEqual('=TEXT(B6,"ddd")');
            expect(helper.getInstance().sheets[0].rows[11].cells[9].value).toEqual('Mon');
            done();
        });
    });

    describe('Text Formula - Checking with Different Time Format->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TEXT Formula with Time format - h:mm ->', (done: Function) => {
            helper.edit('I1', '=TEXT(C2,"h:mm")');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('11:34');
            expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toEqual('=TEXT(C2,"h:mm")');
            done();
        });
        it('TEXT Formula with Time format - h:mm tt ->', (done: Function) => {
            helper.edit('I2', '=TEXT(C3,"h:mm tt")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('5:56 AM');
            expect(helper.getInstance().sheets[0].rows[1].cells[8].formula).toEqual('=TEXT(C3,"h:mm tt")');
            done();
        });
        it('TEXT Formula with Time format - h ->', (done: Function) => {
            helper.edit('I3', '=TEXT(C4,"h")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('03');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].formula).toEqual('=TEXT(C4,"h")');
            expect(helper.getInstance().sheets[0].rows[2].cells[8].value).toEqual('03');
            done();
        });
        it('TEXT Formula with Time format - h tt ->', (done: Function) => {
            helper.edit('I4', '=TEXT(C5,"h tt")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('6 AM');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].formula).toEqual('=TEXT(C5,"h tt")');
            expect(helper.getInstance().sheets[0].rows[3].cells[8].value).toEqual('6 AM');
            done();
        });
        it('TEXT Formula with Time format - h:mm:ss tt ->', (done: Function) => {
            helper.edit('I5', '=TEXT(C6,"h:mm:ss tt")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('12:43:59 AM');
            expect(helper.getInstance().sheets[0].rows[4].cells[8].formula).toEqual('=TEXT(C6,"h:mm:ss tt")');
            done();
        });
        it('TEXT Formula with Time format - h:mm:ss ->', (done: Function) => {
            helper.edit('I6', '=TEXT(C7,"h:mm:ss")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('10:55:53');
            expect(helper.getInstance().sheets[0].rows[5].cells[8].formula).toEqual('=TEXT(C7,"h:mm:ss")');
            done();
        });
        it('TEXT Formula with invalid format->', (done: Function) => {
            helper.edit('I7', '=TEXT(B2,"MM/dd/yy")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('02/14/14');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].formula).toEqual('=TEXT(B2,"MM/dd/yy")');
            expect(helper.getInstance().sheets[0].rows[6].cells[8].value).toEqual('02/14/14');
            done();
        });
    });

    describe('Resolve the issues reported on TEXT formula', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('applying TEXT formula with custom date formats', (done: Function) => {
            helper.edit('I2', '=TEXT(B2,"dd-mm-yy")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('14-02-14');
            helper.edit('I3', '=TEXT(B4,"dd-mmm-yy")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('27-Jul-14');
            helper.edit('I4', '=TEXT(B5,"dd-mmm")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('21-Nov');
            helper.edit('I5', '=TEXT(B6,"mmm-yy")');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('Jun-14');
            helper.edit('I6', '=TEXT(B7,"h:mm AM/PM")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('12:00 AM');
            helper.edit('I7', '=TEXT(B8,"h:mm:ss AM/PM")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('12:00:00 AM');
            helper.edit('I8', '=TEXT(B9,"h:mm")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('00:00');
            helper.edit('I9', '=TEXT(B10,"h:mm:ss")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('00:00:00');
            helper.edit('I10', '=TEXT(B11,"dd-mm-yy h:mm")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('31-10-14 0:00');
            done();
        });
        it('applying TEXT formula with other formats', (done: Function) => {
            helper.edit('G2', '25000');
            helper.edit('J2', '=TEXT(G2,"0.00")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('25000.00');
            helper.edit('J3', '=TEXT(G2,"#,##0")');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('25,000');
            helper.edit('G3', '62500');
            helper.edit('J4', '=TEXT(G3,"#,##0.00")');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('62,500.00');
            helper.edit('G4', '-53973');
            helper.edit('J5', '=TEXT(G4,"#,##0_);(#,##0)")');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('(53,973)');
            helper.edit('G4', '17964');
            helper.edit('J6', '=TEXT(G4,"#,##0_);(#,##0)")');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('17,964 ');
            helper.edit('J7', '=TEXT(G4,"#,##0_);[Red](#,##0)")');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('17,964 ');
            helper.edit('J8', '=TEXT(G4,"#,##0.00_);[Red](#,##0.00)")');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('17,964.00 ');
            helper.edit('J9', '=TEXT(G2,"0%")');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('2500000%');
            helper.edit('J10', '=TEXT(G2,"0.00%")');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('2500000.00%');
            helper.edit('J11', '=TEXT(G3,"0.00E+00")');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('6.25E+04');
            helper.edit('J12', '=TEXT(G3,"##0.0E+0")');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('62.5E+3');
            done();
        });
        it('applying corner cases of TEXT formula', (done: Function) => {
            helper.edit('K2', '=TEXT(G2,)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('25000');
            helper.edit('A12', 'dd-mm-yyyy');
            helper.edit('K3', '=TEXT(B4,A12)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('27-07-2014');
            helper.edit('K4', '=TEXT(FALSE,"0.00")');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('FALSE');
            helper.edit('K5', '=TEXT(,"dd-mm-yyyyy")');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('01-01-1900');
            done();
        });
        it('applying nested formula inside TEXT formula', (done: Function) => {
            helper.edit('K8', '=TEXT(SUM(G2,G4),"0.00")');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('42964.00');
            helper.edit('K9', '=TEXT(PRODUCT(G6,20),"#,##0")');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('200');
            helper.edit('K10', '=TEXT(AVERAGE(G2:G10),"#,##0")');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('11,724');
            helper.edit('K11', '=TEXT(AVERAGEIF(G2:G10,">200"),"#,##0")');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('35,155');
            done();
        });
        it('applying extra cases like exponential, date, time with TEXT formula', (done: Function) => {
            helper.edit('L1', '4000.00%');
            helper.edit('L2', '4.05E+09');
            helper.edit('L3', '11/7/2015');
            helper.edit('L4', '3:10:00 AM');
            helper.edit('L5', '=TEXT(L1, "0.00")');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('40.00');
            helper.edit('L6', '=TEXT(L2, "0.00")');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('4050000000.00');
            helper.edit('L7', '=TEXT(L3,"dd-mmm")');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('07-Nov');
            helper.edit('L8', '=TEXT(L3,"#,##0.00_);(#,##0.00)")');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('42,315.00 ');
            done();
        });
    });

    describe('Sheet References Checking for TEXT formula', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }, {
                    rows: [{ cells: [{ value: '2/14/2014' }] },
                    { cells: [{ value: '6/11/2014' }] }, { cells: [{ value: '7/27/2014' }] }, { cells: [{ value: '11/21/2014' }] },
                    { cells: [{ value: '6/23/2014' }] }, { cells: [{ value: '7/22/2014' }] }, { cells: [{ value: '13972' }] }, { cells: [{ value: '62500' }] },
                    { cells: [{ value: '25000' }] }, { cells: [{ value: 'dd-mm-yyyy' }] }]
                }], activeSheetIndex: 0
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('TEXT Formula with absolute cell refernces as arguments->', (done: Function) => {
            helper.edit('I2', '=TEXT($B$3,"dd-mm-yyyy")');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('11-06-2014');
            helper.edit('I3', '=TEXT($B$4,"mmm-yy")');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('Jul-14');
            helper.edit('I4', '=TEXT($B$5,"dd-mm-yy")');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('21-11-14');
            helper.edit('A12', 'dd-mm-yyyy');
            helper.edit('I5', '=TEXT($B$4,A12)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('27-07-2014');
            done();
        });
        it('TEXT Formula with Sheet refernces as arguments->', (done: Function) => {
            helper.edit('I6', '=TEXT(Sheet2!A7,"$#,##0.00_);($#,##0.00)")');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('$13,972.00 ');
            helper.edit('I7', '=TEXT(Sheet2!A8,"0.00")');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('62500.00');
            helper.edit('I8', '=TEXT(Sheet2!A9,"#,##0")');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('25,000');
            done();
        });
        it('TEXT Formula with absolute cell of Sheet refernces as arguments->', (done: Function) => {
            helper.edit('I9', '=TEXT(Sheet2!$A$7,"$#,##0.00_);($#,##0.00)")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('$13,972.00 ');
            helper.edit('I10', '=TEXT(Sheet2!$A$8,"0.00")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('62500.00');
            helper.edit('I11', '=TEXT(Sheet2!$A$9,Sheet1!A12)');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('11-06-1968');
            done();
        });
    });

    describe('Sort formula input validations ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SORT input validations', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('J2', '=SORT(A1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('Item Name');
            helper.edit('J2', '=SORT($B2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('41684');
            helper.edit('J2', '=SORT(C$5)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0.266597222');
            helper.edit('J2', '=SORT($D$7)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('40');
            helper.edit('J2', '');
            expect(spreadsheet.computeExpression('=SORT(D2)')).toBe('10');
            expect(spreadsheet.computeExpression('=SORT(11)')).toBe('11');
            expect(spreadsheet.computeExpression('=SORT("11")')).toBe('11');
            expect(spreadsheet.computeExpression('=SORT(true)')).toBe('TRUE');
            expect(spreadsheet.computeExpression('=SORT(False)')).toBe('FALSE');
            expect(spreadsheet.computeExpression('=SORT(#REF)')).toBe('improper formula');
            expect(spreadsheet.computeExpression('=SORT(#SPILL!)')).toBe('invalid expression');
            expect(spreadsheet.computeExpression('=SORT("")')).toBe('0');
            done();
        });
    });

    describe('Perform Undo/Redo in sort formula ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Undo after SORT formula applied clears spill outputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('15');
            expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('20');
            expect(spreadsheet.sheets[0].rows[3].cells[11].value).toBe('20');
            helper.click('#spreadsheet_undo');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[3].cells[11].value).toBe('');
            done();
        });
        it('Undo after re-edit of SORT formula restores previous spill state->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.edit('L1', '=SORT(E2:F11)');
            helper.click('#spreadsheet_undo');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('15');
            done();
        });
        it('Undo after delete inside SORT spill restores #SPILL! on anchor->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.invoke('selectRange', ['L4']);
            helper.edit('L4', '1');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('#SPILL!');
            helper.triggerKeyNativeEvent(46);
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.click('#spreadsheet_undo');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('#SPILL!');
            done();
        });
        it('Redo after undo of SORT formula re-applies spill outputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('I1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe('10');
            setTimeout(() => {
                helper.click('#spreadsheet_undo'); setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe('');
                    helper.click('#spreadsheet_redo');
                    setTimeout(() => {
                        expect(spreadsheet.sheets[0].rows[0].cells[8].formula).toBe('=SORT(D2:D11)');
                        expect(spreadsheet.sheets[0].rows[0].cells[8].value).toBe('10');
                        expect(spreadsheet.sheets[0].rows[1].cells[8].value).toBe('15');
                        expect(spreadsheet.sheets[0].rows[2].cells[8].value).toBe('20');
                        expect(spreadsheet.sheets[0].rows[3].cells[8].value).toBe('20');
                        done();
                    });
                });
            });
        });
        it('Redo after undo of delete-spill restores recovered spill->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('A15', '=SORT(D2:D11)');
            helper.invoke('selectRange', ['A17']);
            helper.edit('A17', '1');
            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('#SPILL!');
            helper.triggerKeyNativeEvent(46);
            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('10');
            setTimeout(() => {
                helper.click('#spreadsheet_undo');
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('#SPILL!');
                    helper.invoke('selectRange', ['A15']);
                    setTimeout(() => {
                        helper.click('#spreadsheet_redo');
                        setTimeout(() => {
                            expect(spreadsheet.sheets[0].rows[14].cells[0].formula).toBe('=SORT(D2:D11)');
                            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('10');
                            expect(spreadsheet.sheets[0].rows[15].cells[0].value).toBe('15');
                            expect(spreadsheet.sheets[0].rows[16].cells[0].value).toBe('20');
                            expect(spreadsheet.sheets[0].rows[17].cells[0].value).toBe('20');
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('Perform Edit operation in the sort formula ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Apply SORT formula produces ascending spill in anchor column->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('A1', '=SORT(D2:D11)')
            expect(spreadsheet.sheets[0].rows[0].cells[0].value).toBe('#SPILL!');
            done();
        });
        it('Re-edit SORT anchor with new range clears old spill and applies new->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.edit('L1', '=SORT(F2:F11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(F2:F11)');
            done();
        });
        it('Re-edit SORT anchor with same range clears old spill and cause SPILL->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('K1', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[10].value).toBe('10');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SORT(D2:D11)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SORT(D2:D11)';
            helper.invoke('selectRange', ['K1']);
            helper.triggerKeyNativeEvent(13);
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('#SPILL!'); done();
            });
        });
        it('Editing a spill cell directly causes anchor to show #SPILL!->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('A15', '=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('10');
            helper.edit('A16', '99');
            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('#SPILL!');
            done();
        });
        it('Entering empty value in SORT anchor removes formula and clears all spill cells->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[4].cells[11].value).toBe('15');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '""';
            helper.getElement('.e-spreadsheet-edit').textContent = '""';
            helper.triggerKeyNativeEvent(13);
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('');
                expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('');
                expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('');
                expect(spreadsheet.sheets[0].rows[4].cells[11].value).toBe('');
                done();
            });
        });
        it('Clearallsortformulavalue method testing->', (done: Function) => {
            helper.invoke('selectRange', ['I1']);
            helper.invoke('updateCell', [{ value: '10' }, 'I4']);
            helper.invoke('updateCell', [{ formula: '=SORT(H2:H5)' }, 'I1']);
            helper.getInstance().workbookFormulaModule.clearAllSortFormulaValue();
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[8].formula).toBe('=SORT(H2:H5)');
                expect(helper.getInstance().sheets[0].rows[0].cells[8].value).toBe('#SPILL!');
                done();
            });
        });
    });

    describe('Perform Delete in the spill area of SORT formula ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Delete on SORT anchor clears formula and all spill outputs->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.invoke('selectRange', ['L1']);
            helper.triggerKeyNativeEvent(46);
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('');
            expect(spreadsheet.sheets[0].rows[3].cells[11].value).toBe('');
            helper.click('#spreadsheet_undo');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            done();
        });
        it('Delete on spill cell blocking SORT recovers anchor from #SPILL!->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('K1', '=SORT(D2:D11)');
            helper.invoke('selectRange', ['K4']);
            helper.edit('K4', '1');
            expect(spreadsheet.sheets[0].rows[0].cells[10].value).toBe('#SPILL!');
            helper.triggerKeyNativeEvent(46);
            expect(spreadsheet.sheets[0].rows[0].cells[10].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[0].cells[10].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[1].cells[10].value).toBe('15');
            expect(spreadsheet.sheets[0].rows[2].cells[10].value).toBe('20');
            expect(spreadsheet.sheets[0].rows[3].cells[10].value).toBe('20');
            done();
        });
    });

    describe('Insert and Delete row in the sort formula spill area->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Insert 5 rows in the SORT formula spill area using context menu', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('A15', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[14].cells[0].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[15].cells[0].value).toBe('15');
            expect(spreadsheet.sheets[0].rows[16].cells[0].value).toBe('20');
            expect(spreadsheet.sheets[0].rows[17].cells[0].value).toBe('20');
            helper.invoke('selectRange', ['A16:A20']);
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.openAndClickCMenuItem(9, 0, [6, 1], true);
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[14].cells[0].formula).toBe('=SORT(D2:D11)');
                expect(spreadsheet.sheets[0].rows[14].cells[0].value).toBe('10');
                expect(spreadsheet.sheets[0].rows[15].cells[0].value).toBe('15');
                expect(spreadsheet.sheets[0].rows[16].cells[0].value).toBe('20');
                expect(spreadsheet.sheets[0].rows[17].cells[0].value).toBe('20');
                done();
            });
        });
        it('Delete 5 rows in the SORT formula spill area using context menu', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('B15', '=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[14].cells[1].formula).toBe('=SORT(D2:D11)');
            expect(spreadsheet.sheets[0].rows[14].cells[1].value).toBe('10');
            expect(spreadsheet.sheets[0].rows[15].cells[1].value).toBe('15');
            expect(spreadsheet.sheets[0].rows[16].cells[1].value).toBe('20');
            expect(spreadsheet.sheets[0].rows[17].cells[1].value).toBe('20');
            helper.setAnimationToNone('#' + helper.id + '_contextmenu');
            helper.invoke('selectRange', ['A16:A20']);
            helper.openAndClickCMenuItem(1, 0, [7], true, false);
            setTimeout(() => {
                expect(spreadsheet.sheets[0].rows[14].cells[1].formula).toBe('=SORT(D2:D11)');
                expect(spreadsheet.sheets[0].rows[14].cells[1].value).toBe('10');
                expect(spreadsheet.sheets[0].rows[15].cells[1].value).toBe('15');
                expect(spreadsheet.sheets[0].rows[16].cells[1].value).toBe('20');
                expect(spreadsheet.sheets[0].rows[17].cells[1].value).toBe('20');
                done();
            });
        });
    });

    describe('Clipboard based sort formula operation->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Pasting over SORT anchor clears old SORT range tracking->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBe('=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.invoke('selectRange', ['A2']);
            helper.invoke('copy').then(() => {
                helper.invoke('selectRange', ['L1']);
                helper.invoke('paste', ['L1']);
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[0].cells[11].formula).toBeUndefined();
                    expect(spreadsheet.sheets[0].rows[1].cells[11].value).toBe('');
                    expect(spreadsheet.sheets[0].rows[2].cells[11].value).toBe('');
                    done();
                });
            });
        });
        it('Pasting into SORT spill area marks anchor as #SPILL! to prevent corruption->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            helper.edit('L1', '=SORT(E2:E11)');
            expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
            helper.invoke('selectRange', ['A2']);
            helper.invoke('copy').then(() => {
                helper.invoke('selectRange', ['L3']);
                helper.invoke('paste', ['L3']);
                setTimeout(() => {
                    expect(spreadsheet.sheets[0].rows[0].cells[11].value).toBe('10');
                    done();
                });
            });
        });
    });

    describe('EJ2-850587 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }], rows: [{ index: 12, cells: [{ index: 1, value: '""' }, { value: '1' }, { value: '-1' }, { value: '11' }, { value: '"1"' }, { value: '"-1"' }, { value: '"11"' }, { value: '0' }, { value: '"0"' }, { value: 'TRUE' }, { value: '"true"' }, { value: '"TRUE"' }, { value: 'FALSE' }, { value: '"false"' }, { value: '"FALSE"' }, { value: 'test' }, { value: '"test"' }] }] }, { ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Sort formula checking->', (done: Function) => {
            helper.edit('J2', '=SORT(D2:D11,2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(D2:D11,1,1,2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            helper.edit('J2', '=SORT(D2:D11,1,1,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            helper.edit('J2', '=SORT(D2:D11,1,1,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            helper.edit('J2', '=SORT(A2:A11,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(A2:A11,1,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('T-Shirts');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('Casual Shoes');
            helper.edit('J2', '=SORT(A2:A11,1,1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('T-Shirts');
            helper.edit('J2', '=SORT(D2:F11,2)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('30');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('300');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('41');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('1210');
            helper.edit('J2', '=SORT(D2:F11,1,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('50');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('500');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('200');
            helper.edit('J2', '=SORT(D2:F11,1,1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('200');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('500');
            helper.edit('J2', '=SORT(D2:F11,2,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('600');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('500');
            helper.edit('J2', '=SORT(D2:F11,3,-1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('200');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('500');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('10');
            helper.edit('B15', '=SORT(A2:D11,3,1,TRUE)');
            expect(helper.invoke('getCell', [14, 1]).textContent).toBe('0.482314815');
            expect(helper.invoke('getCell', [14, 4]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [23, 1]).textContent).toBe('0.001203704');
            expect(helper.invoke('getCell', [23, 4]).textContent).toBe('T-Shirts');
            helper.edit('F15', '=SORT(A25:C34,1,1,0)');
            expect(helper.invoke('getCell', [14, 5]).textContent).toBe('0');
            helper.edit('J2', '=SORT(A2:D11,1,1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0.482314815');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0.001203704');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('T-Shirts');
            helper.edit('J2', '=SORT(A2:D11,1,1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('0.482314815');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('0.001203704');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('T-Shirts');
            helper.edit('J2', '=SORT(A2:D11,1,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('T-Shirts');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('50');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('Casual Shoes');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('10');
            helper.edit('J15', '=SORT(E2:E11,,,)');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,A13,A13,A13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,A13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,A13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,A13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,"","","")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,B13,B13,B13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,B13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,B13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,B13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,1,1,1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,C13,C13,C13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,-1,-1,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,D13,D13,D13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('30');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,,,-1)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,D13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,D13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('30');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,,,D13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,11,11,11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,E13,E13,E13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,E13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,E13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,E13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,"1","1","1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,F13,F13,F13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,"1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,,"1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,F13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,F13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,F13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"-1","-1","-1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,G13,G13,G13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"-1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"-1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('30');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,,,"-1")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,G13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,G13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,G13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"11","11","11")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,H13,H13,H13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"11")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"11")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"11")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,H13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,H13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,H13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,0,0,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,I13,I13,I13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,0)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,I13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,I13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,I13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,"0","0","0")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,J13,J13,J13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"0")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"0")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"0")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,J13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,J13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,J13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,TRUE,TRUE,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,K13,K13,K13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,K13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,K13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,,,K13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,"true","true","true")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,L13,L13,L13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,L13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,L13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,L13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"true")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"true")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"true")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,"TRUE","TRUE","TRUE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,M13,M13,M13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,M13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,M13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,M13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"TRUE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"TRUE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"TRUE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('20');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('10');
            helper.edit('J2', '=SORT(E2:E11,FALSE,FALSE,FALSE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,N13,N13,N13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,N13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,N13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,N13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,FALSE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,FALSE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,FALSE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,"false","false","false")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,O13,O13,O13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,O13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,O13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,O13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"false")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"false")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"false")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,"FALSE","FALSE","FALSE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,P13,P13,P13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,P13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,P13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,P13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"FALSE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"FALSE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"FALSE")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('30');
            helper.edit('J2', '=SORT(E2:E11,test,test,test)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            helper.edit('J2', '=SORT(E2:E11,Q13,Q13,Q13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,Q13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,Q13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,Q13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,test)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            helper.edit('J2', '=SORT(E2:E11,,test)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            helper.edit('J2', '=SORT(E2:E11,,,test)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#NAME?');
            helper.edit('J2', '=SORT(E2:E11,"test","test","test")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,R13,R13,R13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,R13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,R13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,R13)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,"test")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,"test")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            helper.edit('J2', '=SORT(E2:E11,,,"test")');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('#VALUE!');
            var inst = helper.getInstance();
            inst.activeSheetIndex = 1;
            inst.dataBind();
            setTimeout(function () {
                helper.invoke('numberFormat', ['$#,##0.00', 'A1:B1']);
                helper.invoke('numberFormat', ['_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)', 'A1:B1']);
                helper.invoke('numberFormat', ['0.00%', 'A1:B1']);
                helper.invoke('numberFormat', ['0.00E+00', 'A1:B1']);
                helper.edit('J2', '=SORT(B2:H11,2,-1,TRUE)');
                expect(helper.invoke('getCell', [1, 9]).textContent).toBe('41684');
                expect(helper.invoke('getCell', [1, 15]).textContent).toBe('0.482314815');
                expect(helper.invoke('getCell', [10, 9]).textContent).toBe('41943');
                expect(helper.invoke('getCell', [10, 15]).textContent).toBe('0.001203704');
                helper.edit('K13', '=SORT(B2:H11,,,TRUE)');
                expect(helper.invoke('getCell', [12, 10]).textContent).toBe('0.482314815');
                expect(helper.invoke('getCell', [12, 16]).textContent).toBe('41684');
                expect(helper.invoke('getCell', [21, 10]).textContent).toBe('0.001203704');
                expect(helper.invoke('getCell', [21, 16]).textContent).toBe('41943');
                done();
            });
        });
    });

    describe('Sort Formula - Checking ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }, { rows: [{ cells: [{ value: '10' }] }, { cells: [{ value: '21' }] }, { cells: [{ value: '5' }] }, { cells: [{ value: '42' }] }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('SORT Formula with Reverse Row Selection->', (done: Function) => {
            helper.edit('I1', '=SORT(D11:D2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('10');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"10","formula":"=SORT(D11:D2)"}');
            done();
        });
        it('SORT Formula with Reverse Column Selection->', (done: Function) => {
            helper.edit('J1', '=SORT(H5:D5)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('15');
            expect(helper.invoke('getCell', [0, 13]).textContent).toBe('67');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[9])).toBe('{"value":"15","formula":"=SORT(H5:D5)"}');
            done();
        });
        it('SORT Formula with By Column as True->', (done: Function) => {
            helper.edit('J2', '=SORT(D2:D11,1,-1,TRUE)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('10');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('50');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[9])).toBe('{"value":"10","formula":"=SORT(D2:D11,1,-1,TRUE)"}');
            done();
        });
        it('SORT Formula with invalid number sort order->', (done: Function) => {
            helper.edit('K2', '=SORT(D2:D11,1,2)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[10])).toBe('{"value":"#VALUE!","formula":"=SORT(D2:D11,1,2)"}');
            done();
        });
        it('SORT Formula with value 0 as Sort index->', (done: Function) => {
            helper.edit('K3', '=SORT(D2:D11,0)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[10])).toBe('{"value":"#VALUE!","formula":"=SORT(D2:D11,0)"}');
            done();
        });
        it('SORT Formula with invalid value for by Column->', (done: Function) => {
            helper.edit('K4', '=SORT(D2:D11,1,-1,ed)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[10])).toBe('{"value":"#NAME?","formula":"=SORT(D2:D11,1,-1,ed)"}');
            done();
        });
        it('SORT Formula with value refered form another sheet->', (done: Function) => {
            helper.edit('K5', '=SORT(Sheet2!A1:A4)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('5');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('42');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[10])).toBe('{"value":"5","formula":"=SORT(Sheet2!A1:A4)"}');
            done();
        });
        it('SORT Formula with no inputs ->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('L2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=SORT()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=SORT()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('L2', '=SORT(G2:G5)');
            done();
        });
    });

    describe('EJ2-854709 -> LOOKUP Formula Checking ->', () => {
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
        it('LOOKUP Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=LOOKUP(10,D2:D11,F2:F11)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('200');
            helper.edit('J2', '=LOOKUP(11,D2:D11,F2:F11)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('200');
            helper.edit('J3', '=LOOKUP(70,D2:D11,F2:F11)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('500');
            helper.edit('J4', '=LOOKUP(-232,D2:D11,F2:F11)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#N/A');
            helper.edit('J5', '=LOOKUP(0,I10:I14,H6:H10)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('70');
            helper.edit('J6', '=LOOKUP(-123,I9:I10,E6:E17)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('10');
            helper.edit('J7', '=LOOKUP(103.32,I6:I7,C5:C6)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0.266597222');
            helper.edit('J8', '=LOOKUP(1240,F2:F11,G2:G11)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('9');
            done();
        });
        it('LOOKUP Formula with direct values and cell references as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=LOOKUP(true,I2:I5,F9:F12)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('1210');
            helper.edit('J10', '=LOOKUP(false,I2:I5,F8:F11)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('500');
            helper.edit('J11', '=LOOKUP("TRUE",I2:I5,G2:G5)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#N/A');
            helper.edit('J12', '=LOOKUP("FALSE",I2:I5,G2:G5)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#N/A');
            helper.edit('J13', '=LOOKUP(I3,I2:I5,A2:A5)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('Sports Shoes');
            helper.edit('J14', '=LOOKUP(I4,I2:I5,A2:A5)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('Sandals & Floaters');
            done();
        });
        it('LOOKUP Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J17', '=LOOKUP("Loafers",A2:A11,F2:F11)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('310');
            helper.edit('J18', '=LOOKUP("SNEAKERS",A2:A11,F2:F11)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('800');
            helper.edit('J19', '=LOOKUP("Hello123",I11:I12,H10:H11)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('166');
            helper.edit('J20', '=LOOKUP("Casual SHOES",A2:A11,B2:B11)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('41684');
            helper.edit('J21', '=LOOKUP("Bags",A2:A11,D2:D11)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#N/A');
            helper.edit('J22', '=LOOKUP("loAFERs",A2:A11,G2:G11)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('6');
            done();
        });
        it('LOOKUP Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J23', '=LOOKUP(20-10,D2:D4,F2:F4)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('200');
            helper.edit('J24', '=LOOKUP(10+10,D2:D11,F2:F11)');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('300');
            helper.edit('J25', '=LOOKUP(10*1-5,G2:G11,H2:H11)');
            expect(helper.invoke('getCell', [24, 9]).textContent).toBe('27');
            helper.edit('J26', '=LOOKUP(900/3,F2:F11,G2:G11)');
            expect(helper.invoke('getCell', [25, 9]).textContent).toBe('10');
            done();
        });
        it('LOOKUP Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('K1', '=LOOKUP(A3,A2:A8,B2:B8)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('41801');
            helper.edit('K2', '=LOOKUP(B4,B2:B7,C2:C7)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0.030543981');
            helper.edit('K3', '=LOOKUP(C5,C2:C7,A2:A7)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('Sandals & Floaters');
            helper.edit('K4', '=LOOKUP(D4,D2:D9,E2:E9)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('10');
            helper.edit('K5', '=LOOKUP(F3,F2:F10,E2:E10)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('10');
            helper.edit('K6', '=LOOKUP(F4,E2:E11,D2:D11)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('50');
            helper.edit('K7', '=LOOKUP(I3,I2:I5,F2:F6)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('600');
            helper.edit('K8', '=LOOKUP(I11,I11:I12,F10:F11)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('1210');
            helper.edit('K9', '=LOOKUP(I13,F2:F5,G2:G6)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('#N/A');
            helper.edit('K10', '=LOOKUP(I16,I15:I16,E10:E11)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('30');
            helper.edit('K11', '=LOOKUP(I14,I13:I14,I15:I16)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('119');
            helper.edit('K12', '=LOOKUP(I20,I17:I20,F8:F11)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('500');
            done();
        });
        it('LOOKUP Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('K13', '=LOOKUP(E4>E5,I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('67');
            helper.edit('K14', '=LOOKUP(E4<E5,I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('50');
            helper.edit('K15', '=LOOKUP(E4>=E5,I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('67');
            helper.edit('K16', '=LOOKUP(E4<=E5,I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('50');
            helper.edit('K17', '=LOOKUP(F5=F6,I2:I5,G7:G10)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('3');
            helper.edit('K18', '=LOOKUP(F5<>F6,I2:I5,G8:G11)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('9');
            done();
        });
        it('LOOKUP Formula with expression and cell references, Wildcard as arguments ->', (done: Function) => {
            helper.edit('K19', '=LOOKUP(D2+E11=D8,I2:I5,G2:G5)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('5');
            helper.edit('K20', '=LOOKUP(D2-E11=D8,I2:I5,G2:G5)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('11');
            helper.edit('K21', '=LOOKUP("C*",A2:A11,D2:D11)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('41');
            helper.edit('K22', '=LOOKUP("*s",A2:A11,D2:D11)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('50');
            done();
        });
        it('LOOKUP Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L1', '=LOOKUP(SUM(5,5),H2:H11,F2:F11)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('200');
            helper.edit('L2', '=LOOKUP(COUNT(C2:C11),D2:D11,H2:H11)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('10');
            helper.edit('L3', '=LOOKUP(COUNT(A2:C11),D2:D11,H2:H11)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('70');
            helper.edit('L4', '=SUM(LOOKUP(H10,H8:H11,I8:I11),2000)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('2000');
            helper.edit('L5', '=LOOKUP(AND(20,30),I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('50');
            helper.edit('L6', '=LOOKUP(OR(20,"Cas"),I2:I5,H2:H5)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('50');
            helper.edit('L7', '=ROUNDDOWN(LOOKUP(I9,I8:I10,I13:I15),-1)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('30');
            helper.edit('L8', '=LOOKUP(SUM(2,7)+COUNT(G10:G8),D2:D11,E2:E11)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('20');
            helper.edit('L9', '=LOOKUP(MAX(G6,G5),G2:G7,E2:E7)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('10');
            done();
        });
        it('LOOKUP Formula with Empty arguments as input ->', (done: Function) => {
            helper.edit('L10', '=LOOKUP("",B14:B16,C14:C16)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#N/A');
            helper.edit('L11', '=LOOKUP(12,F4:F8,)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#VALUE!');
            helper.edit('L12', '=LOOKUP(,,)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#VALUE!');
            helper.edit('L13', '=LOOKUP(12,,G6:G10)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#VALUE!');
            helper.edit('L14', '=LOOKUP(D16,E15:E18,F8:F11)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('#N/A');
            helper.edit('L15', '=LOOKUP(F11,F13:F17,G11:G7)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#N/A');
            done();
        });
        it('LOOKUP Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('L16', '=LOOKUP($F$3,F2:F10,E2:E10)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('10');
            helper.edit('L17', '=LOOKUP(F4,$F$2:$F$10,E2:E10)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('10');
            helper.edit('L18', '=LOOKUP(F4,$F$2:$F$10,$E$2:$E$10)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('10');
            helper.edit('L19', '=LOOKUP(11,$G$2:$G$11,$F$2:$F$11)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('310');
            helper.edit('L20', '=LOOKUP($F$5,$F$2:$F$11,$G$2:$G$11)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('10');
            done();
        });
        it('LOOKUP Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M1', '=LOOKUP(Sheet1!H4,E2:E11,F2:F11)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('310');
            helper.edit('M2', '=LOOKUP(Sheet2!A2,E2:E11,F2:F11)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('310');
            helper.edit('M3', '=LOOKUP(F5,Sheet1!F2:F11,Sheet1!G2:G11)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('10');
            helper.edit('M4', '=LOOKUP(Sheet1!F5,Sheet1!F2:F11,Sheet1!G2:G11)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('10');
            helper.edit('M5', '=LOOKUP(Sheet2!A2,Sheet1!E2:E11,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('310');
            done();
        });
        it('LOOKUP Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M6', '=LOOKUP(Sheet2!$A$2,Sheet1!E2:E11,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('310');
            helper.edit('M7', '=LOOKUP(Sheet1!$F$5,Sheet1!F2:F11,Sheet1!G2:G11)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('10');
            helper.edit('M8', '=LOOKUP(Sheet2!$A$2,Sheet1!$E$2:$E$11,Sheet1!F2:F11)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('310');
            helper.edit('M9', '=LOOKUP(Sheet2!$A$2,Sheet1!$E$2:$E$11,Sheet1!$F$2:$F$11)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('310');
            helper.edit('M10', '=LOOKUP(Sheet1!$H$4,E2:E11,F2:F11)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('310');
            helper.edit('M11', '=LOOKUP(Sheet1!$H$4,$E$2:$E$11,$F$2:$F$11)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('310');
            done();
        });
        it('LOOKUP Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M12', '=LOOKUP(,)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#VALUE!');
            helper.edit('M13', '=LOOKUP(,E4:E7,F4:F7)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#N/A');
            helper.edit('M14', '=LOOKUP(Hello,A3:A6,B3:B6)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#NAME?');
            helper.edit('M15', '=LOOKUP(,,)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('#VALUE!');
            helper.edit('M16', '=LOOKUP("#NUM!",D4:D7,E4:E7)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#NUM!');
            done();
        });
        it('LOOKUP Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LOOKUP()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LOOKUP()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=LOOKUP(12,E5:E9,F5:F10)');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=LOOKUP(,,,,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=LOOKUP(,,,,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=LOOKUP(12,E5:E9,F5:F10)');
            done();
        });
    });

    describe('EJ2-854712 -> VLOOKUP Formula Checking ->', () => {
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
        it('VLOOKUP Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=VLOOKUP(10,D2:F11,2,false)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('20');
            helper.edit('J2', '=VLOOKUP(50,D2:F11,3,false)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('500');
            helper.edit('J3', '=VLOOKUP(600,F2:G11,2,false)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('5');
            helper.edit('J4', '=VLOOKUP(I10,D3:F8,2,false)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#N/A');
            helper.edit('J5', '=VLOOKUP(0,I6:J10,2,false)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('0');
            helper.edit('J6', '=VLOOKUP(103.32,I6:I9,1,false)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('103.32');
            helper.edit('J7', '=VLOOKUP(-3221,I8:I11,1,false)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('-3221');
            helper.edit('J8', '=VLOOKUP(300,F2:G10,2,false)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('7');
            done();
        });
        it('VLOOKUP Formula with direct values and cell references as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=VLOOKUP(TRUE,I2:I5,1,false)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('TRUE');
            helper.edit('J10', '=VLOOKUP(FALSE,I2:I5,1,false)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            helper.edit('J11', '=VLOOKUP("TRUE",I2:I5,1,false)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#N/A');
            helper.edit('J12', '=VLOOKUP("FALSE",I2:I5,1,false)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#N/A');
            helper.edit('J13', '=VLOOKUP(I2,I2:I5,1,I4)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('TRUE');
            helper.edit('J14', '=VLOOKUP(I4,I2:I5,1,I4)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('FALSE');
            helper.edit('J15', '=VLOOKUP(I4,I2:I5,1,"FALSE")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('FALSE');
            helper.edit('J16', '=VLOOKUP(I4,I2:I5,1,"TRUE")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('FALSE');
            done();
        });
        it('VLOOKUP Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J17', '=VLOOKUP("Loafers",A2:F11,4,false)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('31');
            helper.edit('J18', '=VLOOKUP("SNEAKERS",A2:F11,5,false)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('20');
            helper.edit('J19', '=VLOOKUP("Hello123",I11:I12,1,false)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('Hello123');
            helper.edit('J20', '=VLOOKUP("Casual SHOES",A2:B11,2,false)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('41684');
            helper.edit('J21', '=VLOOKUP("Bags",A2:D11,2,false)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#N/A');
            helper.edit('J22', '=VLOOKUP("loAFERs",A2:G11,3,false)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('0.133935185');
            done();
        });
        it('VLOOKUP Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J23', '=VLOOKUP(20-10,E2:F11,2,false)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('300');
            helper.edit('J24', '=VLOOKUP(10+10,D2:F11,3,false)');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('600');
            helper.edit('J25', '=VLOOKUP(10*1-5,G2:H11,2)');
            expect(helper.invoke('getCell', [24, 9]).textContent).toBe('50');
            helper.edit('J26', '=VLOOKUP(900/3,F2:G11,2,false)');
            expect(helper.invoke('getCell', [25, 9]).textContent).toBe('7');
            done();
        });
        it('VLOOKUP Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('K1', '=VLOOKUP(A3,A2:C11,2,false)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('41801');
            helper.edit('K2', '=VLOOKUP(A3,A2:C11,3,false)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('0.247592593');
            helper.edit('K3', '=VLOOKUP(A3,A2:C11,1,false)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('Sports Shoes');
            helper.edit('K4', '=VLOOKUP(B6,B2:E11,3,false)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('30');
            helper.edit('K5', '=VLOOKUP(F2,F2:I5,4,false)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('TRUE');
            helper.edit('K6', '=VLOOKUP(F4,F2:I5,4,false)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('FALSE');
            helper.edit('K7', '=VLOOKUP(I6,I6:I10,1,false)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('103.32');
            helper.edit('K8', '=VLOOKUP(I8,I5:I9,1,false)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('-3221');
            helper.edit('K9', '=VLOOKUP(I15,I13:I16,1,false)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('119');
            helper.edit('K10', '=VLOOKUP(I13,I12:I15,1,false)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('119');
            helper.edit('K11', '=VLOOKUP(I18,I16:I18,1,false)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('17');
            helper.edit('K12', '=VLOOKUP(I20,I16:I20,1,false)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('115');
            done();
        });
        it('VLOOKUP Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('K13', '=VLOOKUP(E4>E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('FALSE');
            helper.edit('K14', '=VLOOKUP(E4<E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('TRUE');
            helper.edit('K15', '=VLOOKUP(E4>=E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('FALSE');
            helper.edit('K16', '=VLOOKUP(E4<=E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('TRUE');
            helper.edit('K17', '=VLOOKUP(F5=F6,I2:I5,1,false)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('TRUE');
            helper.edit('K18', '=VLOOKUP(F5<>F6,I2:I5,1,false)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('FALSE');
            done();
        });
        it('VLOOKUP Formula with expression and cell references, Wildcard as arguments ->', (done: Function) => {
            helper.edit('K19', '=VLOOKUP(D2+E11=D8,I2:I5,1,false)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('TRUE');
            helper.edit('K20', '=VLOOKUP(D2-E11=D8,I2:I5,1,false)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('FALSE');
            helper.edit('K21', '=VLOOKUP("C*",A2:D11,4,false)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('10');
            helper.edit('K22', '=VLOOKUP("*C",A2:D11,2,false)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('#N/A');
            helper.edit('K23', '=VLOOKUP("???????",A2:D11,2,false)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('41973');
            helper.edit('K24', '=VLOOKUP("??Shirts",A2:D11,2,false)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('41943');
            done();
        });
        it('VLOOKUP Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L1', '=SUM(VLOOKUP(10,D2:F11,2,FALSE),10)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('30');
            helper.edit('L2', '=VLOOKUP(COUNT(E2:F11),E2:G10,2,false)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('200');
            helper.edit('L3', '=VLOOKUP(AVERAGE(H2:H11),D2:G11,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('500');
            helper.edit('L4', '=VLOOKUP(sum(D2,D3),D5:F8,3,false)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('300');
            helper.edit('L5', '=VLOOKUP(NOT(true),I2:I5,1,false)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('FALSE');
            helper.edit('L6', '=VLOOKUP(NOT(false),I2:I5,1,false)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('TRUE');
            helper.edit('L7', '=VLOOKUP(10,D2:E11,count(G2:G3),I4)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('20');
            helper.edit('L8', '=VLOOKUP(SUM(2,5)+COUNT(G10:G8),D2:E11,2,false)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('20');
            helper.edit('L9', '=VLOOKUP(MAX(G6,G4),G2:E7,2,false)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('300');
            done();
        });
        it('VLOOKUP Formula with Empty argument as input ->', (done: Function) => {
            helper.edit('L10', '=VLOOKUP(,,)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#N/A');
            helper.edit('L11', '=VLOOKUP(,,,)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#N/A');
            helper.edit('L12', '=VLOOKUP(,H2:I11,2,TRUE)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#N/A');
            helper.edit('L13', '=VLOOKUP(10,,2,FALSE)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#N/A');
            helper.edit('L14', '=VLOOKUP(10,D2:J11,2,)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('20');
            helper.edit('L15', '=VLOOKUP(10,D2:E11,,)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('VLOOKUP Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('L16', '=VLOOKUP($D$5,D2:F11,3,I4)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('300');
            helper.edit('L17', '=VLOOKUP($D$5,$D$2:$F$11,3,$I$4)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('300');
            helper.edit('L18', '=VLOOKUP($F$9,$F$2:$G$11,2,$I$5)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('6');
            helper.edit('L19', '=VLOOKUP(D6,$D$2:$H$11,G3,I4)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('70');
            helper.edit('L20', '=VLOOKUP($D$5,$D$2:$H$11,$G$3,$I$5)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('67');
            done();
        });
        it('VLOOKUP Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M1', '=VLOOKUP(Sheet1!H2,E2:F11,2,false)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('300');
            helper.edit('M2', '=VLOOKUP(Sheet2!A2,E2:F11,2,false)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('200');
            helper.edit('M3', '=VLOOKUP(F5,Sheet1!F2:G11,2,Sheet1!I4)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('7');
            helper.edit('M4', '=VLOOKUP(Sheet1!F8,Sheet1!F2:G11,2,False)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('1');
            helper.edit('M5', '=VLOOKUP(Sheet2!A2,Sheet1!E2:F11,2,FALSE)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('200');
            done();
        });
        it('VLOOKUP Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M6', '=VLOOKUP(Sheet1!$H$2,$E$2:$F$11,2,false)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('300');
            helper.edit('M7', '=VLOOKUP(Sheet2!$A$2,$E$2:$F$11,2,$I$4)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('200');
            helper.edit('M8', '=VLOOKUP(Sheet1!$D$5,$D$2:$H$11,$G$3,$I$5)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('67');
            helper.edit('M9', '=VLOOKUP($F$5,Sheet1!$F$2:$G$11,2,Sheet1!$I$4)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('7');
            helper.edit('M10', '=VLOOKUP(Sheet1!$F$8,Sheet1!$F$2:$G$11,2,False)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('1');
            helper.edit('M11', '=VLOOKUP(Sheet2!$A$2,Sheet1!$E$2:$F$11,2,FALSE)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('200');
            done();
        });
        it('VLOOKUP Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M12', '=VLOOKUP(,,,)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#N/A');
            helper.edit('M13', '=VLOOKUP(10,D2:E11,4)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#REF!');
            helper.edit('M14', '=VLOOKUP(20,D2:G11,-1)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            helper.edit('M15', '=VLOOKUP(20,D2:G11,0)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('#VALUE!');
            helper.edit('M16', '=VLOOKUP(112,D2:E9,2,true0)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#NAME?');
            helper.edit('M17', '=VLOOKUP(112,D2:E9,2,false)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#N/A');
            helper.edit('M18', '=VLOOKUP(10,D2:E11,4,true)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#REF!');
            done();
        });
        it('VLOOKUP Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=VLOOKUP()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=VLOOKUP()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=VLOOKUP(10,D2:F11,2,false)');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=VLOOKUP(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=VLOOKUP(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=VLOOKUP(10,D2:F11,2,false)');
            spreadsheet.selectRange('N3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=VLOOKUP(,,,,,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=VLOOKUP(,,,,,)';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N3', '=VLOOKUP(10,D2:F11,2,false)');
            done();
        });
    });

    describe('1003477- VLOOKUP Formula ->', function () {
        beforeAll(function (done: Function) {
            model = {
                sheets: [
                    {
                        name: 'VLOOKUP',
                        ranges: [{ dataSource: defaultData }]
                    },
                    {
                        name: 'Sheet1',
                        rows: [
                            { index: 1, cells: [{ index: 4, value: '20' }, { index: 5, value: '200' }] },
                            { index: 2, cells: [{ index: 4, value: '30' }, { index: 5, value: '600' }] },
                            { index: 3, cells: [{ index: 4, value: '15' }, { index: 5, value: '300' }] },
                            { index: 4, cells: [{ index: 4, value: '20' }, { index: 5, value: '300' }] },
                            { index: 5, cells: [{ index: 4, value: '25' }, { index: 5, value: '400' }] },
                            { index: 6, cells: [{ index: 4, value: '18' }, { index: 5, value: '250' }] },
                            { index: 7, cells: [{ index: 4, value: '22' }, { index: 5, value: '350' }] },
                            { index: 8, cells: [{ index: 4, value: '28' }, { index: 5, value: '500' }] },
                            { index: 9, cells: [{ index: 4, value: '17' }, { index: 5, value: '280' }] },
                            { index: 10, cells: [{ index: 4, value: '32' }, { index: 5, value: '650' }] }
                        ]
                    }
                ],
                activeSheetIndex: 0
            };
            helper.initializeSpreadsheet(model, done);
        });
        afterAll(function () {
            helper.invoke('destroy');
        });
        it('VLOOKUP formula #REF! error occure when formula not referenced sheet insert and delete', function (done: Function) {
            const spreadsheet: Spreadsheet = helper.getInstance();
            helper.invoke('selectRange', ['H1:H10']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                const ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                ddlElem.ej2_instances[0].value = 'Custom';
                ddlElem.ej2_instances[0].dataBind();
                helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[7].validation)).toBe('{"type":"Custom","value1":"=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)","ignoreBlank":true,"inCellDropDown":null}');
                helper.edit('I5', '=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)');
                expect(spreadsheet.sheets[0].rows[4].cells[8].formula).toBe('=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)');
                expect(helper.invoke('getCell', [4, 8]).textContent).toBe('300');
                expect(spreadsheet.sheets[0].rows[4].cells[8].value).toBe('300');
                const td: HTMLElement = helper.getElement('.e-sheet-tab .e-active .e-text-wrap');
                const coords: ClientRect | DOMRect = td.getBoundingClientRect();
                helper.triggerMouseAction('contextmenu', { x: coords.left, y: coords.top }, null, td);
                helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                helper.click('#' + helper.id + '_contextmenu li:nth-child(1)');
                setTimeout(() => {
                    const sheetTabs: NodeListOf<Element> = helper.getElements('.e-sheet-tab .e-toolbar-item');
                    expect(sheetTabs.length).toBe(3);
                    expect(spreadsheet.sheets[1].rows[4].cells[8].formula).toBe('=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)');
                    expect(spreadsheet.sheets[1].rows[4].cells[8].value).toBe('300');
                    const activeTd: HTMLElement = helper.getElement('.e-sheet-tab .e-active .e-text-wrap');
                    const activeCoords: ClientRect | DOMRect = activeTd.getBoundingClientRect();
                    helper.triggerMouseAction('contextmenu', { x: activeCoords.left, y: activeCoords.top }, null, activeTd);
                    helper.setAnimationToNone('#' + helper.id + '_contextmenu');
                    helper.click('#' + helper.id + '_contextmenu li:nth-child(2)');
                    setTimeout(() => {
                        expect(spreadsheet.sheets.length).toBe(2);
                        expect(spreadsheet.sheets[0].rows[4].cells[8].formula).toBe('=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)');
                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[7].validation)).toBe('{"type":"Custom","value1":"=VLOOKUP(D5,Sheet1!E2:G11,2,FALSE)","ignoreBlank":true,"inCellDropDown":null}');
                        expect(spreadsheet.sheets[0].rows[4].cells[8].value).toBe('300');
                        done();
                    });
                });
            });
        });
    });

    describe('EJ2-854711 -> HLOOKUP Formula Checking ->', () => {
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
        it('HLOOKUP Formula with direct values as numbers arguments ->', (done: Function) => {
            helper.edit('J1', '=HLOOKUP(10,D2:F5,2,false)');
            expect(helper.invoke('getCell', [0, 9]).textContent).toBe('20');
            helper.edit('J2', '=HLOOKUP(20,D2:F5,3,false)');
            expect(helper.invoke('getCell', [1, 9]).textContent).toBe('15');
            helper.edit('J3', '=HLOOKUP(600,F3:G7,2,false)');
            expect(helper.invoke('getCell', [2, 9]).textContent).toBe('300');
            helper.edit('J4', '=HLOOKUP(0,D3:F4,2,false)');
            expect(helper.invoke('getCell', [3, 9]).textContent).toBe('#N/A');
            helper.edit('J5', '=HLOOKUP(0,I10:I13,2,false)');
            expect(helper.invoke('getCell', [4, 9]).textContent).toBe('Hello123');
            helper.edit('J6', '=HLOOKUP(103.32,I6:I9,3,false)');
            expect(helper.invoke('getCell', [5, 9]).textContent).toBe('-3221');
            helper.edit('J7', '=HLOOKUP(-3221,I8:I11,3,false)');
            expect(helper.invoke('getCell', [6, 9]).textContent).toBe('0');
            helper.edit('J8', '=HLOOKUP(200,D2:G5,2,false)');
            expect(helper.invoke('getCell', [7, 9]).textContent).toBe('600');
            done();
        });
        it('HLOOKUP Formula with direct values and cell references as boolean arguments ->', (done: Function) => {
            helper.edit('J9', '=HLOOKUP(TRUE,I2:I5,1,false)');
            expect(helper.invoke('getCell', [8, 9]).textContent).toBe('TRUE');
            helper.edit('J10', '=HLOOKUP(FALSE,I4:I7,1,false)');
            expect(helper.invoke('getCell', [9, 9]).textContent).toBe('FALSE');
            helper.edit('J11', '=HLOOKUP("TRUE",I2:I5,1,false)');
            expect(helper.invoke('getCell', [10, 9]).textContent).toBe('#N/A');
            helper.edit('J12', '=HLOOKUP("FALSE",I4:I7,1,false)');
            expect(helper.invoke('getCell', [11, 9]).textContent).toBe('#N/A');
            helper.edit('J13', '=HLOOKUP(I2,G2:I6,5,FALSE)');
            expect(helper.invoke('getCell', [12, 9]).textContent).toBe('103.32');
            helper.edit('J14', '=hLOOKUP(I4,G4:I6,3,FALSE)');
            expect(helper.invoke('getCell', [13, 9]).textContent).toBe('103.32');
            helper.edit('J15', '=HLOOKUP(I2,G2:I6,4,"FALSE")');
            expect(helper.invoke('getCell', [14, 9]).textContent).toBe('FALSE');
            helper.edit('J16', '=HLOOKUP(I2,G2:I6,4,"TRUE")');
            expect(helper.invoke('getCell', [15, 9]).textContent).toBe('FALSE');
            done();
        });
        it('HLOOKUP Formula with direct values as string arguments ->', (done: Function) => {
            helper.edit('J17', '=HLOOKUP("Loafers",A9:F11,2,false)');
            expect(helper.invoke('getCell', [16, 9]).textContent).toBe('Cricket Shoes');
            helper.edit('J18', '=HLOOKUP("SNEAKERS",A7:F11,5,false)');
            expect(helper.invoke('getCell', [17, 9]).textContent).toBe('T-Shirts');
            helper.edit('J19', '=HLOOKUP("Hello123",I11:I12,1,false)');
            expect(helper.invoke('getCell', [18, 9]).textContent).toBe('Hello123');
            helper.edit('J20', '=HLOOKUP("Casual SHOES",A2:B11,4,false)');
            expect(helper.invoke('getCell', [19, 9]).textContent).toBe('Sandals & Floaters');
            helper.edit('J21', '=HLOOKUP("Bags",A2:D11,2,false)');
            expect(helper.invoke('getCell', [20, 9]).textContent).toBe('#N/A');
            helper.edit('J22', '=HLOOKUP("loAFERs",A9:G11,1,false)');
            expect(helper.invoke('getCell', [21, 9]).textContent).toBe('Loafers');
            done();
        });
        it('HLOOKUP Formula with direct values as expression ->', (done: Function) => {
            helper.edit('J23', '=HLOOKUP(20-10,D2:G5,2,false)');
            expect(helper.invoke('getCell', [22, 9]).textContent).toBe('20');
            helper.edit('J24', '=HLOOKUP(10+10,D2:G5,3,false)');
            expect(helper.invoke('getCell', [23, 9]).textContent).toBe('15');
            helper.edit('J25', '=HLOOKUP(10*1,G2:H5,2,false)');
            expect(helper.invoke('getCell', [24, 9]).textContent).toBe('50');
            helper.edit('J26', '=HLOOKUP(900/3,F4:G5,2,false)');
            expect(helper.invoke('getCell', [25, 9]).textContent).toBe('300');
            done();
        });
        it('HLOOKUP Formula with cell references as arguments ->', (done: Function) => {
            helper.edit('K1', '=HLOOKUP(A3,A3:C11,7,false)');
            expect(helper.invoke('getCell', [0, 10]).textContent).toBe('Loafers');
            helper.edit('K2', '=HLOOKUP(B3,A3:C11,3,false)');
            expect(helper.invoke('getCell', [1, 10]).textContent).toBe('41964');
            helper.edit('K3', '=HLOOKUP(C3,A3:C11,1,false)');
            expect(helper.invoke('getCell', [2, 10]).textContent).toBe('0.247592593');
            helper.edit('K4', '=HLOOKUP(D3,B3:E11,3,false)');
            expect(helper.invoke('getCell', [3, 10]).textContent).toBe('15');
            helper.edit('K5', '=HLOOKUP(F3,F3:I5,3,false)');
            expect(helper.invoke('getCell', [4, 10]).textContent).toBe('300');
            helper.edit('K6', '=HLOOKUP(I2,I3:I4,2,false)');
            expect(helper.invoke('getCell', [5, 10]).textContent).toBe('FALSE');
            helper.edit('K7', '=HLOOKUP(I5,I4:I7,4)');
            expect(helper.invoke('getCell', [6, 10]).textContent).toBe('105.36');
            helper.edit('K8', '=HLOOKUP(I6,I6:I9,4)');
            expect(helper.invoke('getCell', [7, 10]).textContent).toBe('-123');
            helper.edit('K9', '=HLOOKUP(I8,I8:I10,3)');
            expect(helper.invoke('getCell', [8, 10]).textContent).toBe('0');
            helper.edit('K10', '=HLOOKUP(I13,I13:I14,2,false)');
            expect(helper.invoke('getCell', [9, 10]).textContent).toBe('32');
            helper.edit('K11', '=HLOOKUP(I15,I15:I16,2,false)');
            expect(helper.invoke('getCell', [10, 10]).textContent).toBe('12.76');
            helper.edit('K12', '=HLOOKUP(I19,I19:I20,2,false)');
            expect(helper.invoke('getCell', [11, 10]).textContent).toBe('115');
            done();
        });
        it('HLOOKUP Formula with operator and cell references as arguments ->', (done: Function) => {
            helper.edit('K13', '=HLOOKUP(E4>E5,I4:I5,1,false)');
            expect(helper.invoke('getCell', [12, 10]).textContent).toBe('FALSE');
            helper.edit('K14', '=HLOOKUP(E4<E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [13, 10]).textContent).toBe('TRUE');
            helper.edit('K15', '=HLOOKUP(E4>=E5,I4:I5,1,false)');
            expect(helper.invoke('getCell', [14, 10]).textContent).toBe('FALSE');
            helper.edit('K16', '=HLOOKUP(E4<=E5,I2:I5,1,false)');
            expect(helper.invoke('getCell', [15, 10]).textContent).toBe('TRUE');
            helper.edit('K17', '=HLOOKUP(F5=F6,I2:I5,1,false)');
            expect(helper.invoke('getCell', [16, 10]).textContent).toBe('TRUE');
            helper.edit('K18', '=HLOOKUP(F5<>F6,I4:I5,1,false)');
            expect(helper.invoke('getCell', [17, 10]).textContent).toBe('FALSE');
            done();
        });
        it('HLOOKUP Formula with expression and cell references, Wildcard as arguments ->', (done: Function) => {
            helper.edit('K19', '=HLOOKUP(D2+E11=D8,I2:I5,1,false)');
            expect(helper.invoke('getCell', [18, 10]).textContent).toBe('TRUE');
            helper.edit('K20', '=HLOOKUP(D2-E11=D8,I4:I5,1,false)');
            expect(helper.invoke('getCell', [19, 10]).textContent).toBe('FALSE');
            helper.edit('K21', '=HLOOKUP("C*",A2:D11,7,false)');
            expect(helper.invoke('getCell', [20, 10]).textContent).toBe('Running Shoes');
            helper.edit('K22', '=HLOOKUP("*C",A2:D11,2,false)');
            expect(helper.invoke('getCell', [21, 10]).textContent).toBe('#N/A');
            helper.edit('K23', '=HLOOKUP("???????",A9:D11,2,false)');
            expect(helper.invoke('getCell', [22, 10]).textContent).toBe('Cricket Shoes');
            helper.edit('K24', '=HLOOKUP("??Shirts",A11:D13,2,false)');
            expect(helper.invoke('getCell', [23, 10]).textContent).toBe('0');
            done();
        });
        it('HLOOKUP Formula with Nested formula value as arguments ->', (done: Function) => {
            helper.edit('L1', '=SUM(HLOOKUP(10,D2:F11,2,FALSE),10)');
            expect(helper.invoke('getCell', [0, 11]).textContent).toBe('30');
            helper.edit('L2', '=HLOOKUP(COUNT(E2:F11),E2:G10,2,false)');
            expect(helper.invoke('getCell', [1, 11]).textContent).toBe('30');
            helper.edit('L3', '=HLOOKUP(AVERAGE(H2:H11),D2:G11,3)');
            expect(helper.invoke('getCell', [2, 11]).textContent).toBe('15');
            helper.edit('L4', '=HLOOKUP(SUM(D2,H2),D5:F8,3,false)');
            expect(helper.invoke('getCell', [3, 11]).textContent).toBe('20');
            helper.edit('L5', '=HLOOKUP(NOT(TRUE),I4:I8,5,false)');
            expect(helper.invoke('getCell', [4, 11]).textContent).toBe('-3221');
            helper.edit('L6', '=HLOOKUP(NOT(FALSE),G2:I6,5,false)');
            expect(helper.invoke('getCell', [5, 11]).textContent).toBe('103.32');
            helper.edit('L7', '=HLOOKUP(10,D2:E11,count(G2:G3),I4)');
            expect(helper.invoke('getCell', [6, 11]).textContent).toBe('20');
            helper.edit('L8', '=HLOOKUP(SUM(2,5)+COUNT(G10:G8),D2:E11,2,false)');
            expect(helper.invoke('getCell', [7, 11]).textContent).toBe('20');
            helper.edit('L9', '=HLOOKUP(MAX(D3,G6),E2:F5,4,false)');
            expect(helper.invoke('getCell', [8, 11]).textContent).toBe('20');
            done();
        });
        it('HLOOKUP Formula with Empty argument as input ->', (done: Function) => {
            helper.edit('L10', '=HLOOKUP(,,)');
            expect(helper.invoke('getCell', [9, 11]).textContent).toBe('#N/A');
            helper.edit('L11', '=HLOOKUP(,,,)');
            expect(helper.invoke('getCell', [10, 11]).textContent).toBe('#N/A');
            helper.edit('L12', '=HLOOKUP(,H2:I11,2,TRUE)');
            expect(helper.invoke('getCell', [11, 11]).textContent).toBe('#N/A');
            helper.edit('L13', '=HLOOKUP(10,,2,FALSE)');
            expect(helper.invoke('getCell', [12, 11]).textContent).toBe('#N/A');
            helper.edit('L14', '=HLOOKUP(10,D2:G5,3,)');
            expect(helper.invoke('getCell', [13, 11]).textContent).toBe('20');
            helper.edit('L15', '=HLOOKUP(10,D2:E11,,)');
            expect(helper.invoke('getCell', [14, 11]).textContent).toBe('#VALUE!');
            done();
        });
        it('HLOOKUP Formula with absolute cell refernces as arguments ->', (done: Function) => {
            helper.edit('L16', '=HLOOKUP($D$5,D5:F11,3,I4)');
            expect(helper.invoke('getCell', [15, 11]).textContent).toBe('40');
            helper.edit('L17', '=HLOOKUP($D$5,$D$5:$F$11,5,$I$4)');
            expect(helper.invoke('getCell', [16, 11]).textContent).toBe('31');
            helper.edit('L18', '=HLOOKUP($F$9,$F$9:$G$11,2,$I$5)');
            expect(helper.invoke('getCell', [17, 11]).textContent).toBe('1210');
            helper.edit('L19', '=HLOOKUP(D6,$D$6:$H$11,G3,I4)');
            expect(helper.invoke('getCell', [18, 11]).textContent).toBe('41');
            helper.edit('L20', '=HLOOKUP($D$5,$D$5:$H$11,$G$3,$I$5)');
            expect(helper.invoke('getCell', [19, 11]).textContent).toBe('31');
            done();
        });
        it('HLOOKUP Formula with Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M1', '=HLOOKUP(Sheet1!H2,D2:F5,2,false)');
            expect(helper.invoke('getCell', [0, 12]).textContent).toBe('20');
            helper.edit('M2', '=HLOOKUP(Sheet2!A2,E2:F11,2,false)');
            expect(helper.invoke('getCell', [1, 12]).textContent).toBe('30');
            helper.edit('M3', '=HLOOKUP(F5,Sheet1!F5:G11,2,Sheet1!I4)');
            expect(helper.invoke('getCell', [2, 12]).textContent).toBe('300');
            helper.edit('M4', '=HLOOKUP(Sheet1!F8,Sheet1!F8:G11,2,False)');
            expect(helper.invoke('getCell', [3, 12]).textContent).toBe('310');
            helper.edit('M5', '=HLOOKUP(Sheet2!A2,Sheet1!E2:F11,2,FALSE)');
            expect(helper.invoke('getCell', [4, 12]).textContent).toBe('30');
            done();
        });
        it('HLOOKUP Formula with absolute cell of Sheet refernces as arguments ->', (done: Function) => {
            helper.edit('M6', '=HLOOKUP(Sheet1!$H$2,$D$2:$F$11,2,false)');
            expect(helper.invoke('getCell', [5, 12]).textContent).toBe('20');
            helper.edit('M7', '=HLOOKUP(Sheet2!$A$2,$E$2:$F$11,2,$I$4)');
            expect(helper.invoke('getCell', [6, 12]).textContent).toBe('30');
            helper.edit('M8', '=HLOOKUP(Sheet1!$D$5,$D$5:$H$11,$G$3,$I$5)');
            expect(helper.invoke('getCell', [7, 12]).textContent).toBe('31');
            helper.edit('M9', '=HLOOKUP($F$5,Sheet1!$F$5:$G$11,2,Sheet1!$I$4)');
            expect(helper.invoke('getCell', [8, 12]).textContent).toBe('300');
            helper.edit('M10', '=HLOOKUP(Sheet1!$F$8,Sheet1!$F$2:$G$11,2,False)');
            expect(helper.invoke('getCell', [9, 12]).textContent).toBe('600');
            helper.edit('M11', '=HLOOKUP(Sheet2!$A$2,Sheet1!$E$2:$F$11,2,FALSE)');
            expect(helper.invoke('getCell', [10, 12]).textContent).toBe('30');
            done();
        });
        it('HLOOKUP Formula with Worst case value as arguments ->', (done: Function) => {
            helper.edit('M12', '=HLOOKUP(,,,)');
            expect(helper.invoke('getCell', [11, 12]).textContent).toBe('#N/A');
            helper.edit('M13', '=HLOOKUP(10,D2:E11,14)');
            expect(helper.invoke('getCell', [12, 12]).textContent).toBe('#REF!');
            helper.edit('M14', '=HLOOKUP(20,D2:G11,-1)');
            expect(helper.invoke('getCell', [13, 12]).textContent).toBe('#VALUE!');
            helper.edit('M15', '=HLOOKUP(20,D2:G11,0)');
            expect(helper.invoke('getCell', [14, 12]).textContent).toBe('#VALUE!');
            helper.edit('M16', '=HLOOKUP(112,D2:E9,2,true0)');
            expect(helper.invoke('getCell', [15, 12]).textContent).toBe('#NAME?');
            helper.edit('M17', '=HLOOKUP(112,D2:E9,2,false)');
            expect(helper.invoke('getCell', [16, 12]).textContent).toBe('#N/A');
            helper.edit('M18', '=HLOOKUP(10,D2:E4,4,true)');
            expect(helper.invoke('getCell', [17, 12]).textContent).toBe('#REF!');
            done();
        });
        it('HLOOKUP Formula with no inputs and improper arguments->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('N1');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=HLOOKUP()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=HLOOKUP()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N1', '=HLOOKUP(600,F3:G7,2,false)');
            spreadsheet.selectRange('N2');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=HLOOKUP(,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=HLOOKUP(,)';
            helper.triggerKeyNativeEvent(13);
            const dialog1: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N2', '=HLOOKUP(600,F3:G7,2,false)');
            spreadsheet.selectRange('N3');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=HLOOKUP(,,,,,)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=HLOOKUP(,,,,,)';
            helper.triggerKeyNativeEvent(13);
            const dialog2: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog1.textContent).toBe('We found that you typed a formula with a wrong number of arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('N3', '=HLOOKUP(600,F3:G7,2,false)');
            done();
        });
    });

    describe('Address Formula - Checking->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ADDRESS Formula ->', (done: Function) => {
            helper.edit('I1', '=ADDRESS(2,2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('$B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"$B$2","formula":"=ADDRESS(2,2)"}');
            done();
        });
        it('ADDRESS Formula with abs value as 2->', (done: Function) => {
            helper.edit('I2', '=ADDRESS(2,2,2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"B$2","formula":"=ADDRESS(2,2,2)"}');
            done();
        });
        it('ADDRESS Formula with abs value as 3->', (done: Function) => {
            helper.edit('I3', '=ADDRESS(2,2,3)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('$B2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"$B2","formula":"=ADDRESS(2,2,3)"}');
            done();
        });
        it('ADDRESS Formula with abs value as 4->', (done: Function) => {
            helper.edit('I4', '=ADDRESS(2,2,4)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('B2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"B2","formula":"=ADDRESS(2,2,4)"}');
            done();
        });
        it('ADDRESS Formula with Reference style as false and abs value as 1->', (done: Function) => {
            helper.edit('I5', '=ADDRESS(2,2,1,FALSE)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('R2C2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"R2C2","formula":"=ADDRESS(2,2,1,FALSE)"}');
            done();
        });
        it('ADDRESS Formula with Reference style as false and abs value as 2->', (done: Function) => {
            helper.edit('I6', '=ADDRESS(2,2,2,FALSE)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('R2C[2]');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"R2C[2]","formula":"=ADDRESS(2,2,2,FALSE)"}');
            done();
        });
        it('ADDRESS Formula with Reference style as false and abs value as 3->', (done: Function) => {
            helper.edit('I7', '=ADDRESS(2,2,3,FALSE)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('R[2]C2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"R[2]C2","formula":"=ADDRESS(2,2,3,FALSE)"}');
            done();
        });
        it('ADDRESS Formula with Reference style as false and abs value as 4->', (done: Function) => {
            helper.edit('I8', '=ADDRESS(2,2,4,FALSE)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('R[2]C[2]');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"R[2]C[2]","formula":"=ADDRESS(2,2,4,FALSE)"}');
            done();
        });
        it('ADDRESS Formula with Sheet name and Reference style as false->', (done: Function) => {
            helper.edit('I9', '=ADDRESS(2,2,1,FALSE,"Price Details")');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=ADDRESS(2,2,1,FALSE,"Price Details")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('Price Details!R2C2');
            done();
        });
        it('ADDRESS Formula with Sheet name and Reference style as TRUE->', (done: Function) => {
            helper.edit('I10', '=ADDRESS(2,2,1,TRUE,"Price Details")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('Price Details!$B$2');
            done();
        });
        it('ADDRESS Formula for workbook->', (done: Function) => {
            helper.edit('I11', '=ADDRESS(2,3,1,FALSE,"[Book1]Sheet1")');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].formula).toBe('=ADDRESS(2,3,1,FALSE,"[Book1]Sheet1")');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('[Book1]Sheet1!R2C3');
            done();
        });
        it('ADDRESS Formula with invalid Reference style->', (done: Function) => {
            helper.edit('I12', '=ADDRESS(2,2,1,3)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('$B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"$B$2","formula":"=ADDRESS(2,2,1,3)"}');
            done();
        });
        it('ADDRESS Formula with invalid sheet name->', (done: Function) => {
            helper.edit('I13', '=ADDRESS(2,2,1,FALSE,aa)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"#NAME?","formula":"=ADDRESS(2,2,1,FALSE,aa)"}');
            done();
        });
        it('ADDRESS Formula with no input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I14');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ADDRESS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ADDRESS()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I14', '=ADDRESS(1,1)');
            done();
        });
        it('ADDRESS Formula with invalid input->', (done: Function) => {
            helper.edit('I15', '=ADDRESS(A,B)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":"#NAME?","formula":"=ADDRESS(A,B)"}');
            done();
        });
        it('ADDRESS Formula with negative values for Row and Column->', (done: Function) => {
            helper.edit('I16', '=ADDRESS(-1,-2)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":"#VALUE!","formula":"=ADDRESS(-1,-2)"}');
            done();
        });
        it('ADDRESS Formula with no values for Row and Column->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I17');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ADDRESS(,,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ADDRESS(,,2)';
            helper.triggerKeyNativeEvent(13);
            expect(spreadsheet.sheets[0].rows[16].cells[8].value).toBe('#VALUE!');
            helper.edit('I17', '=ADDRESS(1,2)');
            expect(spreadsheet.sheets[0].rows[16].cells[8].value).toBe('$B$1');
            done();
        });
    });

    describe('EJ2-53702 -> FORMULA VALIDATING 4', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ADDRESS - ->', (done: Function) => {
            helper.edit('I1', '=ADDRESS(2,2)');
            expect(helper.invoke('getCell', [0, 8]).textContent).toBe('$B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8])).toBe('{"value":"$B$2","formula":"=ADDRESS(2,2)"}');
            done();
        });
        it('ADDRESS - with abs value as 2->', (done: Function) => {
            helper.edit('I2', '=ADDRESS(2,2,2)');
            expect(helper.invoke('getCell', [1, 8]).textContent).toBe('B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[8])).toBe('{"value":"B$2","formula":"=ADDRESS(2,2,2)"}');
            done();
        });
        it('ADDRESS - with abs value as 3->', (done: Function) => {
            helper.edit('I3', '=ADDRESS(2,2,3)');
            expect(helper.invoke('getCell', [2, 8]).textContent).toBe('$B2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[2].cells[8])).toBe('{"value":"$B2","formula":"=ADDRESS(2,2,3)"}');
            done();
        });
        it('ADDRESS - with abs value as 4->', (done: Function) => {
            helper.edit('I4', '=ADDRESS(2,2,4)');
            expect(helper.invoke('getCell', [3, 8]).textContent).toBe('B2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[8])).toBe('{"value":"B2","formula":"=ADDRESS(2,2,4)"}');
            done();
        });
        it('ADDRESS - with Reference style as false and abs value as 1->', (done: Function) => {
            helper.edit('I5', '=ADDRESS(2,2,1,FALSE)');
            expect(helper.invoke('getCell', [4, 8]).textContent).toBe('R2C2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[4].cells[8])).toBe('{"value":"R2C2","formula":"=ADDRESS(2,2,1,FALSE)"}');
            done();
        });
        it('ADDRESS - with Reference style as false and abs value as 2->', (done: Function) => {
            helper.edit('I6', '=ADDRESS(2,2,2,FALSE)');
            expect(helper.invoke('getCell', [5, 8]).textContent).toBe('R2C[2]');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[5].cells[8])).toBe('{"value":"R2C[2]","formula":"=ADDRESS(2,2,2,FALSE)"}');
            done();
        });
        it('ADDRESS - with Reference style as false and abs value as 3->', (done: Function) => {
            helper.edit('I7', '=ADDRESS(2,2,3,FALSE)');
            expect(helper.invoke('getCell', [6, 8]).textContent).toBe('R[2]C2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[6].cells[8])).toBe('{"value":"R[2]C2","formula":"=ADDRESS(2,2,3,FALSE)"}');
            done();
        });
        it('ADDRESS - with Reference style as false and abs value as 4->', (done: Function) => {
            helper.edit('I8', '=ADDRESS(2,2,4,FALSE)');
            expect(helper.invoke('getCell', [7, 8]).textContent).toBe('R[2]C[2]');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[7].cells[8])).toBe('{"value":"R[2]C[2]","formula":"=ADDRESS(2,2,4,FALSE)"}');
            done();
        });
        it('ADDRESS - with Sheet name and Reference style as false->', (done: Function) => {
            helper.edit('I9', '=ADDRESS(2,2,1,FALSE,"Price Details")');
            expect(helper.getInstance().sheets[0].rows[8].cells[8].formula).toBe('=ADDRESS(2,2,1,FALSE,"Price Details")');
            expect(helper.invoke('getCell', [8, 8]).textContent).toBe('Price Details!R2C2');
            done();
        });
        it('ADDRESS - with Sheet name and Reference style as TRUE->', (done: Function) => {
            helper.edit('I10', '=ADDRESS(2,2,1,TRUE,"Price Details")');
            expect(helper.invoke('getCell', [9, 8]).textContent).toBe('Price Details!$B$2');
            done();
        });
        it('ADDRESS - for workbook->', (done: Function) => {
            helper.edit('I11', '=ADDRESS(2,3,1,FALSE,"[Book1]Sheet1")');
            expect(helper.getInstance().sheets[0].rows[10].cells[8].formula).toBe('=ADDRESS(2,3,1,FALSE,"[Book1]Sheet1")');
            expect(helper.invoke('getCell', [10, 8]).textContent).toBe('[Book1]Sheet1!R2C3');
            done();
        });
        it('ADDRESS - with invalid Reference style->', (done: Function) => {
            helper.edit('I12', '=ADDRESS(2,2,1,3)');
            expect(helper.invoke('getCell', [11, 8]).textContent).toBe('$B$2');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[8])).toBe('{"value":"$B$2","formula":"=ADDRESS(2,2,1,3)"}');
            done();
        });
        it('ADDRESS - with invalid sheet name->', (done: Function) => {
            helper.edit('I13', '=ADDRESS(2,2,1,FALSE,aa)');
            expect(helper.invoke('getCell', [12, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[12].cells[8])).toBe('{"value":"#NAME?","formula":"=ADDRESS(2,2,1,FALSE,aa)"}');
            done();
        });
        it('ADDRESS - with no input->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I14');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ADDRESS()';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ADDRESS()';
            helper.triggerKeyNativeEvent(13);
            const dialog: HTMLElement = helper.getElement('.e-validation-error-dlg.e-dialog .e-dlg-content');
            expect(dialog.textContent).toBe('We found that you typed a formula with an invalid arguments.');
            helper.click('.e-validation-error-dlg.e-dialog .e-btn.e-primary');
            helper.edit('I14', '=ADDRESS(1,1)');
            done();
        });
        it('ADDRESS - with invalid input->', (done: Function) => {
            helper.edit('I15', '=ADDRESS(A,B)');
            expect(helper.invoke('getCell', [14, 8]).textContent).toBe('#NAME?');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[14].cells[8])).toBe('{"value":"#NAME?","formula":"=ADDRESS(A,B)"}');
            done();
        });
        it('ADDRESS - with negative values for Row and Column->', (done: Function) => {
            helper.edit('I16', '=ADDRESS(-1,-2)');
            expect(helper.invoke('getCell', [15, 8]).textContent).toBe('#VALUE!');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[15].cells[8])).toBe('{"value":"#VALUE!","formula":"=ADDRESS(-1,-2)"}');
            done();
        });
        it('ADDRESS - with no values for Row and Column->', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            spreadsheet.selectRange('I17');
            helper.invoke('startEdit');
            spreadsheet.editModule.editCellData.value = '=ADDRESS(,,2)';
            helper.getElement('.e-spreadsheet-edit').textContent = '=ADDRESS(,,2)';
            helper.triggerKeyNativeEvent(13);
            expect(spreadsheet.sheets[0].rows[16].cells[8].value).toBe('#VALUE!');
            helper.edit('I17', '=ADDRESS(1,2)');
            expect(spreadsheet.sheets[0].rows[16].cells[8].value).toBe('$B$1');
            done();
        });
    });

    // Information Category Formula
    describe('Reported ISNUMBER Formula - Checking I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ sheets: [{ ranges: [{ dataSource: defaultData }] }] }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Added cell Reference - 1->', (done: Function) => {
            helper.edit('C23', '1');
            helper.edit('D14', '"1"');
            helper.edit('D22', '"2"');
            helper.edit('C24', '2');
            helper.edit('D22', '"2"');
            helper.edit('C24', '2');
            helper.edit('B24', '"TRUE"');
            helper.edit('B15', 'TRUE');
            helper.edit('B25', '"FALSE"');
            helper.edit('F20', '""');
            helper.edit('G9', '600.00%');
            helper.edit('C20', 'Hello123');
            helper.edit('E17', '#NUM!');
            helper.edit('E15', '#NAME?');
            helper.edit('E16', '#DIV/0!');
            helper.edit('D22', '"2"');
            helper.edit('H20', '2');
            done();
        });
        it('IsNumber formula with cell Reference - 1->', (done: Function) => {
            helper.edit('I21', '=ISNUMBER("45324")');
            expect(helper.invoke('getCell', [20, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[20].cells[8])).toBe('{"value":false,"formula":"=ISNUMBER(\\"45324\\")"}');
            done();
        });
        it('IsNumber formula with cell Reference - 2->', (done: Function) => {
            helper.edit('I22', '=ISNUMBER("45.433")');
            expect(helper.invoke('getCell', [21, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[21].cells[8])).toBe('{"value":false,"formula":"=ISNUMBER(\\"45.433\\")"}');
            done();
        });
        it('IsNumber formula with cell Reference - 3->', (done: Function) => {
            helper.edit('I23', '=ISNUMBER("-453.43")');
            expect(helper.invoke('getCell', [22, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[22].cells[8])).toBe('{"value":false,"formula":"=ISNUMBER(\\"-453.43\\")"}');
            done();
        });
        it('IsNumber formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I24', '=ISNUMBER("0")');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('FALSE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":false,"formula":"=ISNUMBER(\\"0\\")"}');
            done();
        });
        it('IsNumber formula with cell Reference - 4->', (done: Function) => {
            helper.edit('I24', '=ISNUMBER(TEXT(32,"@"))');
            expect(helper.invoke('getCell', [23, 8]).textContent).toBe('TRUE');
            expect(JSON.stringify(helper.getInstance().sheets[0].rows[23].cells[8])).toBe('{"value":true,"formula":"=ISNUMBER(TEXT(32,\\"@\\"))"}');
            done();
        });
    });
});
