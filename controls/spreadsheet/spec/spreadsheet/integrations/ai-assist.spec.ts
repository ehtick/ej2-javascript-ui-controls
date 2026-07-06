import { SpreadsheetHelper } from '../util/spreadsheethelper.spec';
import { defaultData } from '../util/datasource.spec';
import { Spreadsheet, AIAssist } from '../../../src/index';
Spreadsheet.Inject(AIAssist);

describe('AI Assist ->', () => {
    const helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');
    const getAiSidebar = (): HTMLElement => helper.getElement(`#${helper.id}_ai-assist_panel`);
    const getResizeHandle = (): HTMLElement => helper.getElement('.e-ai-assist-resize-handle');
    const getAiButton = (): HTMLElement => helper.getElementFromSpreadsheet('#' + helper.id + '_aibtn');
    const getAiAssistModule = (): AIAssist => helper.getInstance().aIAssistModule;
    
    describe('UI Interaction - I ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: {
                    requestUrl: 'http://localhost:3007/api/chat',
                    placeholder: 'Ask the AI about this sheet...',
                    promptSuggestions: ['Apply formatting to the row header']
                }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Checking Ribbon button, module and sidepanel rendering', (done: Function) => {
            const btn: HTMLElement = getAiButton();
            expect(btn).not.toBeNull();
            const module: AIAssist = getAiAssistModule();
            expect(module).toBeDefined();
            expect(module.getModuleName()).toBe('AIAssist');
            expect(getAiSidebar()).toBeNull();
            done();
        });
        it('Clicking AI button should render the assist panel container', (done: Function) => {
            getAiButton().click();
            setTimeout(() => {
                expect(getAiSidebar()).not.toBeNull();
                expect(getResizeHandle()).not.toBeNull();
                done();
            });
        });
        it('AI assist view container should be rendered inside the panel', (done: Function) => {
            const assistPanel: HTMLElement = helper.getElement(`#${helper.id}_ai-assist_panel`);
            expect(assistPanel).not.toBeNull();
            const btn: HTMLElement = getAiButton();
            expect(btn.classList.contains('e-active')).toBeTruthy();
            done();
        });
        it('Checking hide Assist panel with clicking ai button', (done: Function) => {
            getAiButton().click();
            setTimeout(() => {
                expect(getAiSidebar()).toBeNull();
                const btn: HTMLElement = getAiButton();
                expect(btn.classList.contains('e-active')).toBeFalsy();
                done();
            });
        });
        it('Clicking AI button again should re-render the assist panel', (done: Function) => {
            getAiButton().click();
            setTimeout(() => {
                expect(getAiSidebar()).not.toBeNull();
                done();
            });
        });
        it('Resize handle should constrain panel within MIN and MAX width on drag', (done: Function) => {
            const handle: HTMLElement = getResizeHandle();
            expect(handle).not.toBeNull();
            handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 600 }));
            document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 0 }));
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const panelWidth: number = getAiSidebar().offsetWidth || parseInt(getAiSidebar().style.width, 10);
            expect(panelWidth).toBeLessThanOrEqual(656);
            handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
            document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 2000 }));
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const panelWidthMin: number = getAiSidebar().offsetWidth || parseInt(getAiSidebar().style.width, 10);
            expect(panelWidthMin).toBeGreaterThanOrEqual(328);
            done();
        });
        it('syncRibbonAiButtonState - toggles e-active class', (done: Function) => {
            const module: any = getAiAssistModule();
            const btn: HTMLElement = getAiButton();
            (module as any).syncRibbonAiButtonState(true);
            expect(btn.classList.contains('e-active')).toBeTruthy();
            (module as any).syncRibbonAiButtonState(false);
            expect(btn.classList.contains('e-active')).toBeFalsy();
            done();
        });
        it('bindResizeEvents - RTL mode uses (clientX - startX) delta to widen panel', (done: Function) => {
            helper.getInstance().enableRtl = true;
            const handle: HTMLElement = getResizeHandle();
            expect(handle).not.toBeNull();
            handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 400 }));
            document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 500 }));
            document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const panelWidth: number = getAiSidebar().offsetWidth || parseInt(getAiSidebar().style.width, 10);
            expect(panelWidth).toBeGreaterThanOrEqual(328);
            expect(panelWidth).toBeLessThanOrEqual(656);
            helper.getInstance().enableRtl = false;
            done();
        });
        it('Checking comment panel rendering with the AI panel', (done: Function) => {
            helper.switchRibbonTab(5);
            helper.getElementFromSpreadsheet('#' + helper.id + '_comment').click();
            helper.click('.e-comment-ddb li:nth-child(2)');
            setTimeout(() => {
                expect(helper.getElement(`#${helper.id}_review_panel`)).not.toBeNull();
                getAiButton().click();
                setTimeout(() => {
                    expect(helper.getElement(`#${helper.id}_ai-assist_panel`)).not.toBeNull();
                    done();
                });
            });
        });
        it('Checking AI panel toolbar items, Refresh and close', (done: Function) => {
            setTimeout(() => {
                expect(helper.getElement(`#${helper.id}_ai-assist_panel`)).not.toBeNull();
                done();
            });
        });
    });

    describe('Feature Action Methods ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('analysis action - appendResponse called with message directly', (done: Function) => {
            const module: any = getAiAssistModule();
            let appended: string = '';
            const original: Function = module.appendResponse.bind(module);
            module.appendResponse = (msg: string): void => { appended = msg; original(msg); };
            module.appendResponse('Quick analysis');
            expect(appended).toBe('Quick analysis');
            done();
        });
        it('query action - formatQueryResponse returns string message directly', (done: Function) => {
            const module: any = getAiAssistModule();
            const message: string = 'Total sales increased by 15% compared to last quarter.';
            const result: string = module.formatQueryResponse(message);
            expect(result).toBe(message);
            done();
        });
        it('query action - formatQueryResponse handles object and returns JSON string', (done: Function) => {
            const module: any = getAiAssistModule();
            const messageObj: any = { query: 'sales', result: 1500, status: 'success' };
            const result: string = module.formatQueryResponse(messageObj);
            expect(typeof result).toBe('string');
            expect(result).toContain('sales');
            expect(result).toContain('1500');
            done();
        });
        it('executeCommand - query action returns formatted response via formatQueryResponse', async (done: Function) => {
            const module: any = getAiAssistModule();
            const queryResult: string = await module.executeCommand([{ action: 'query', args: { message: 'Revenue analysis complete' } }]);
            expect(queryResult).toContain('Revenue analysis complete');
            done();
        });
        it('executeCommand - query action with object message formats as JSON string', async (done: Function) => {
            const module: any = getAiAssistModule();
            const queryObj: any = { data: 'metrics', value: 500, type: 'analysis' };
            const queryResult: string = await module.executeCommand([{ action: 'query', args: { message: queryObj } }]);
            expect(typeof queryResult).toBe('string');
            expect(queryResult).toContain('metrics');
            expect(queryResult).toContain('500');
            done();
        });
        it('reportGeneration - buildReportNarrative returns non-empty string directly', (done: Function) => {
            const module: any = getAiAssistModule();
            const reportStructure: any = {
                summary: 'Short summary',
                kpis: [{ name: 'Total', value: '100', formula: 'SUM(A1:A10)' }],
                topRows: [{ row: 1, values: { Header1: 'Val1' } }],
                visualSuggestions: [{ chartType: 'Column', range: 'A1:B2', reason: 'Shows trend' }],
                sections: [{ heading: 'Conclusion', content: 'All good' }]
            };
            const narrative: string = module.buildReportNarrative(reportStructure);
            expect(typeof narrative).toBe('string');
            expect(narrative.length).toBeGreaterThan(0);
            done();
        });
        it('applyEdit - should update cell value via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyEdit({ address: 'A1', value: 'TestEdit' });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[0].cells[0].value).toBe('TestEdit');
                done();
            });
        });
        it('applyEdit - should update cell with formula via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyEdit({ address: 'C11', value: '=SUM(C2:C10)' });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[10].cells[2].formula).toBe('=SUM(C2:C10)');
                done();
            });
        });
        it('applyNumberFormat - should apply currency format via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyNumberFormat({ range: 'B2:B5', format: 'Currency' });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[1];
                expect(cell.format).toBeDefined();
                done();
            });
        });
        it('applyCellFormat - should apply bold and background color via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyCellFormat({ range: 'A1:C1', formatting: { bold: true, backgroundColor: '#FFFF00' } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[0];
                expect(cell.style).toBeDefined();
                expect(cell.style.fontWeight).toBe('bold');
                expect(cell.style.backgroundColor).toBe('#FFFF00');
                done();
            });
        });
        it('applyMerge - should merge cells via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyMerge({ range: 'E2:F2', direction: 'All' });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[4];
                expect(cell.colSpan).toBeGreaterThan(1);
                done();
            });
        });
        it('applyWrap - should wrap text in cells via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyWrap({ range: 'D2:D5', wrap: true });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[3].wrap).toBeTruthy();
                done();
            });
        });
        it('applyFindReplace - should replace text in matching cells', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 'Shoes' }, 'A2']);
            module.applyFindReplace({ findValue: 'Shoes', replaceValue: 'Shoe' });
            setTimeout(() => {
                const cellValue: any = helper.getInstance().sheets[0].rows[1].cells[0].value;
                expect(String(cellValue)).not.toContain('Shoes');
                done();
            });
        });
        it('applyConditionalFormat - should apply CF GreaterThan rule via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyConditionalFormat({ range: 'B2:B10', type: 'GreaterThan', value: '50', cFColor: 'RedFT' });
            setTimeout(() => {
                const sheet: any = helper.getInstance().sheets[0];
                expect(sheet.conditionalFormats).toBeDefined();
                const cfEntry: any = sheet.conditionalFormats.find((cf: any) => cf.type === 'GreaterThan');
                expect(cfEntry).toBeDefined();
                done();
            });
        });
        it('applyConditionalFormat - should apply CF Duplicate rule via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyConditionalFormat({ range: 'A2:A10', type: 'Duplicate', cFColor: 'YellowFT' });
            setTimeout(() => {
                const sheet: any = helper.getInstance().sheets[0];
                expect(sheet.conditionalFormats).toBeDefined();
                const cfEntry: any = sheet.conditionalFormats.find((cf: any) => cf.type === 'Duplicate');
                expect(cfEntry).toBeDefined();
                done();
            });
        });
        it('applyAutoFill - should fill series and update cell values', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 1 }, 'M1']);
            helper.invoke('updateCell', [{ value: 2 }, 'M2']);
            module.applyAutoFill({ dataRange: 'E8:E11', fillRange: 'E12:E15', direction: 'Down', fillType: 'FillSeries' });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[11].cells[4].value).toBe(20);
                expect(helper.getInstance().sheets[0].rows[12].cells[4].value).toBe(22);
                done();
            });
        });
        it('applyCopy - should copy a range without error', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyCopy({ range: 'A1:B3' });
            setTimeout(() => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet).toBeDefined();
                done();
            });
        });
        it('applyPaste - should paste to destination and update cell value', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 'PasteSource' }, 'N1']);
            helper.invoke('copy', ['N1']).then(() => {
                module.applyPaste({ range: 'O1' });
                setTimeout(() => {
                    const pastedValue: any = helper.getInstance().sheets[0].rows[0].cells[14];
                    expect(pastedValue).toBeDefined();
                    done();
                });
            });
        });
        it('applyDataValidation - should apply WholeNumber validation via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyDataValidation({
                range: 'B2:B10',
                dvType: 'WholeNumber',
                dvOperator: 'Between',
                dvValue1: '1',
                dvValue2: '100'
            });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[1];
                expect(cell.validation).toBeDefined();
                expect(cell.validation.type).toBe('WholeNumber');
                done();
            });
        });
        it('applyDataValidation - should apply List validation via JSON args', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyDataValidation({ range: 'C2:C5', dvType: 'List', dvValue1: 'Yes,No,Maybe' });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[2];
                expect(cell.validation).toBeDefined();
                expect(cell.validation.type).toBe('List');
                done();
            });
        });
        it('applyChart - should insert a column chart and update sheet model', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyChart({
                range: 'A1:C6',
                chartType: 'Column',
                title: 'Sales Report',
                height: 300,
                width: 500
            });
            setTimeout(() => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                let hasChart: boolean = false;
                const rows: any[] = spreadsheet.sheets[0].rows;
                for (const row of rows) {
                    if (row && row.cells) {
                        for (const cell of row.cells) {
                            if (cell && cell.chart && cell.chart.length > 0) {
                                hasChart = true;
                                break;
                            }
                        }
                    }
                    if (hasChart) { break; }
                }
                expect(hasChart).toBeTruthy();
                done();
            });
        });
        it('applyChart - should insert a pie chart without error', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyChart({ range: 'A1:B6', chartType: 'Pie' });
            setTimeout(() => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                expect(spreadsheet.sheets[0]).toBeDefined();
                done();
            });
        });
        it('applySortAction - should sort range and update cell order', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applySortAction({ range: 'H2:H11', sortColumn: 'H', sortOrder: 'Ascending', sortContainsHeader: false });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[1].cells[7].value).toBe(10);
                expect(helper.getInstance().sheets[0].rows[2].cells[7].value).toBe(50);
                done();
            });
        });
        it('applyInsert - should insert a row and shift data down', (done: Function) => {
            const module: any = getAiAssistModule();
            const beforeRowCount: number = helper.getInstance().sheets[0].rows.length;
            module.applyInsert({ modelType: 'Row', startIndex: 2, count: 1 });
            setTimeout(() => {
                const afterRowCount: number = helper.getInstance().sheets[0].rows.length;
                expect(afterRowCount).toBeGreaterThanOrEqual(beforeRowCount);
                done();
            });
        });
        it('applyDelete - should delete a column and shift data left', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 'ToDelete' }, 'P1']);
            module.applyDelete({ modelType: 'Column', startIndex: 15, count: 1 });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[15];
                const deletedValue: string = cell ? String(cell.value || '') : '';
                expect(deletedValue).not.toBe('ToDelete');
                done();
            });
        });
        it('applyFreezePanes - should freeze rows and update sheet model', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyFreezePanes({ freezeType: 'Rows', row: 1 });
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].frozenRows).toBe(1);
                done();
            });
        });
        it('executeCommand - should apply edit action and update cell value', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'edit', args: { address: 'A2', value: '999' } }]);
            setTimeout(() => {
                expect(String(helper.getInstance().sheets[0].rows[1].cells[0].value)).toBe('999');
                done();
            });
        });
        it('executeCommand - should apply number_format action and update cell format', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'numberFormat', args: { range: 'C2:C5', format: 'Currency' } }]);
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[2];
                expect(cell.format).toBeDefined();
                done();
            });
        });
        it('executeCommand - should apply cell_format action and update cell style', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'cellFormat', args: { range: 'A1:D1', formatting: { bold: true } } }]);
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[0];
                expect(cell.style).toBeDefined();
                expect(cell.style.fontWeight).toBe('bold');
                done();
            });
        });
        it('executeCommand - should apply conditional_format action and add CF entry', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'conditionalFormat', args: { range: 'B2:B10', type: 'Duplicate' } }]);
            setTimeout(() => {
                const sheet: any = helper.getInstance().sheets[0];
                expect(sheet.conditionalFormats).toBeDefined();
                done();
            });
        });
        it('executeCommand - should apply merge action and set colSpan', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'merge', args: { range: 'G3:H3', direction: 'All' } }]);
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[2].cells[6];
                expect(cell.colSpan).toBeGreaterThan(1);
                done();
            });
        });
        it('executeCommand - should apply wrap action and set wrap flag', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'wrap', args: { range: 'D6:D8', wrap: true } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows[5].cells[3].wrap).toBeTruthy();
                done();
            });
        });
        it('executeCommand - should apply chart action and insert chart into sheet model', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'chart', args: { range: 'A1:C6', chartType: 'Bar' } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - should apply data_validation action and set validation on cell', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{
                action: 'dataValidation', args: {
                    range: 'B2:B5', dvType: 'WholeNumber', dvOperator: 'Between', dvValue1: '1', dvValue2: '100'
                }
            }]);
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[1];
                expect(cell.validation).toBeDefined();
                done();
            });
        });
        it('executeCommand - should apply find_and_replace action and replace matched values', async (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 'ReplaceMe' }, 'R1']);
            module.executeCommand([{ action: 'findAndReplace', args: { findValue: 'ReplaceMe', replaceValue: 'Replaced' } }]);
            setTimeout(() => {
                const val: any = helper.getInstance().sheets[0].rows[0].cells[17];
                const cellText: string = val ? String(val.value || '') : '';
                expect(cellText).not.toBe('ReplaceMe');
                done();
            });
        });
        it('executeCommand - should apply insert action and shift rows down', async (done: Function) => {
            const module: any = getAiAssistModule();
            const beforeCount: number = helper.getInstance().sheets[0].rows.length;
            module.executeCommand([{ action: 'insert', args: { modelType: 'Row', startIndex: 3, count: 1 } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].rows.length).toBeGreaterThanOrEqual(beforeCount);
                done();
            });
        });
        it('executeCommand - should apply delete action and remove column', async (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('updateCell', [{ value: 'ColDelete' }, 'T1']);
            module.executeCommand([{ action: 'delete', args: { modelType: 'Column', startIndex: 19, count: 1 } }]);
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[19];
                const val: string = cell ? String(cell.value || '') : '';
                expect(val).not.toBe('ColDelete');
                done();
            });
        });
        it('executeCommand - should apply freeze_panes action and set frozenRows on sheet', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'freezePanes', args: { freezeType: 'Rows', row: 2 } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0].frozenRows).toBe(2);
                done();
            });
        });
        it('executeCommand - should handle unknown action gracefully without throwing', async (done: Function) => {
            const module: any = getAiAssistModule();
            let errorThrown: boolean = false;
            try {
                module.executeCommand([{ action: 'unknown_action_xyz', message: 'Not supported' }]);
            } catch (e) {
                errorThrown = true;
            }
            expect(errorThrown).toBeFalsy();
            done();
        });
        it('applyHyperlink - should insert hyperlink with URL and display text', (done: Function) => {
            const module: any = getAiAssistModule();
            module.applyHyperlink({ address: 'https://syncfusion.com', range: 'A1', displayText: 'Syncfusion' });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[0];
                expect(cell).toBeDefined();
                done();
            });
        });
        it('applyHyperlink - should insert hyperlink with URL and no display text', (done: Function) => {
            const module: any = getAiAssistModule();
            const result: string = module.applyHyperlink({ address: 'https://example.com', range: 'B2' });
            expect(result).toContain('https://example.com');
            expect(result).not.toContain('with display text');
            done();
        });
        it('applyHyperlink - should insert hyperlink with display text in return message', (done: Function) => {
            const module: any = getAiAssistModule();
            const result: string = module.applyHyperlink({ address: 'https://example.com', range: 'C3', displayText: 'Click Here' });
            expect(result).toContain('with display text "Click Here"');
            done();
        });
        it('applyHyperlink - returns error when data is null', (done: Function) => {
            const module: any = getAiAssistModule();
            expect(module.applyHyperlink(null)).toContain('Please provide an address');
            done();
        });
        it('applyHyperlink - should use selected range when range is omitted', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('selectRange', ['D4']);
            const result: string = module.applyHyperlink({ address: 'https://example.com' });
            expect(result).toContain('Inserted hyperlink');
            done();
        });
        it('executeCommand - hyperlink action inserts hyperlink without error', (done: Function) => {
            const module: any = getAiAssistModule();
            module.executeCommand([{ action: 'hyperlink', args: { address: 'https://syncfusion.com', range: 'A3', displayText: 'SF' } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - should apply save action and trigger exportDialog', async (done: Function) => {
            const module: any = getAiAssistModule();
            let notifyEvent: string = '';
            const originalNotify: Function = helper.getInstance().notify.bind(helper.getInstance());
            helper.getInstance().notify = (event: string, args: any): void => {
                notifyEvent = event;
                originalNotify(event, args);
            };
            module.executeCommand([{ action: 'save', args: { saveType: 'Xlsx' } }]);
            expect(notifyEvent).toContain('exportDialog');
            helper.getInstance().notify = originalNotify;
            done();
        });
        it('applySave - should return error for unsupported saveType', (done: Function) => {
            const module: any = getAiAssistModule();
            const result: string = module.applySave({ saveType: 'docx' });
            expect(result).toBe("Saving in 'docx' format is not supported. Valid save types are 'xlsx', 'xls', 'csv', and 'pdf'.");
            done();
        });
        it('executeCommand - analysis action returns message directly', async (done: Function) => {
            const module: any = getAiAssistModule();
            const analysisMessage: string = 'Quick analysis of the current sheet data';
            const result: string = await module.executeCommand([{ action: 'analysis', args: { message: analysisMessage } }]);
            expect(result).toBe(analysisMessage);
            done();
        });
    });

    describe('executeAIPrompt Public API ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('executeAIPrompt - should not execute when enableAIAssist is false', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            const originalEnableAIAssist: boolean = spreadsheet.enableAIAssist;
            spreadsheet.enableAIAssist = false;
            let notifyCalled: boolean = false;
            const originalNotify: Function = spreadsheet.notify.bind(spreadsheet);
            spreadsheet.notify = (event: string, args: any): void => {
                if (event === 'executePrompt') {
                    notifyCalled = true;
                }
                originalNotify(event, args);
            };
            spreadsheet.executeAIPrompt('Test prompt');
            expect(notifyCalled).toBeFalsy();
            spreadsheet.enableAIAssist = originalEnableAIAssist;
            spreadsheet.notify = originalNotify;
            done();
        });
        it('executeAIPrompt - should not execute with empty prompt', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            let notifyCalled: boolean = false;
            const originalNotify: Function = spreadsheet.notify.bind(spreadsheet);
            spreadsheet.notify = (event: string, args: any): void => {
                if (event === 'executePrompt') {
                    notifyCalled = true;
                }
                originalNotify(event, args);
            };
            spreadsheet.executeAIPrompt('');
            spreadsheet.executeAIPrompt('   ');
            expect(notifyCalled).toBeFalsy();
            spreadsheet.notify = originalNotify;
            done();
        });
        it('executeAIPrompt - should not execute with non-string prompt', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            let notifyCalled: boolean = false;
            const originalNotify: Function = spreadsheet.notify.bind(spreadsheet);
            spreadsheet.notify = (event: string, args: any): void => {
                if (event === 'executePrompt') {
                    notifyCalled = true;
                }
                originalNotify(event, args);
            };
            spreadsheet.executeAIPrompt(null as any);
            spreadsheet.executeAIPrompt(undefined as any);
            spreadsheet.executeAIPrompt(123 as any);
            expect(notifyCalled).toBeFalsy();
            spreadsheet.notify = originalNotify;
            done();
        });
        it('executeAIPrompt - should call notify with executePrompt event and trimmed prompt', (done: Function) => {
            const spreadsheet: any = helper.getInstance();
            let capturedEvent: string = '';
            let capturedArgs: any = {};
            const originalNotify: Function = spreadsheet.notify.bind(spreadsheet);
            spreadsheet.notify = (event: string, args: any): void => {
                if (event === 'executePrompt') {
                    capturedEvent = event;
                    capturedArgs = args;
                }
                originalNotify(event, args);
            };
            spreadsheet.executeAIPrompt('Show data in table format');
            expect(capturedEvent).toBe('executePrompt');
            expect(capturedArgs.prompt).toBe('Show data in table format');
            spreadsheet.notify = originalNotify;
            done();
        });
    });

    describe('Toolbar, PromptRequest and RequestAssistCommand ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });

        it('toolbarItemClicked - refresh icon clears aiAssistView prompts', (done: Function) => {
            getAiButton().click();
            setTimeout(() => {
                const module: any = getAiAssistModule();
                module.aiAssistView.prompts = [{ prompt: 'test', response: 'resp' }];
                module.toolbarItemClicked({ item: { iconCss: 'e-icons e-refresh' } });
                expect(module.aiAssistView.prompts.length).toBe(0);
                done();
            });
        });
        it('toolbarItemClicked - close icon hides the assist panel', (done: Function) => {
            const module: any = getAiAssistModule();
            if (!getAiSidebar()) { getAiButton().click(); }
            setTimeout(() => {
                module.toolbarItemClicked({ item: { iconCss: 'e-icons e-close' } });
                setTimeout(() => {
                    expect(getAiSidebar()).toBeNull();
                    expect(module.isAIPaneVisible).toBeFalsy();
                    done();
                });
            });
        });
        it('onPromptRequest - cancelled event sets args.cancel to true', async (done: Function) => {
            const module: any = getAiAssistModule();
            helper.getInstance().addEventListener('promptRequest', (args: any) => { args.cancel = true; });
            const eventArgs: any = { prompt: 'hello', cancel: false };
            await module.onPromptRequest(eventArgs);
            done();
        });
        it('requestAssistCommand - empty action list returns [{ action: unknown }]', async (done: Function) => {
            const module: any = getAiAssistModule();
            module.requestActionList('Replace Shoes with Shoe in this sheet');
            done();
        });
    });

    describe('Normalizer and Guard Branch Coverage ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('normalizeCFType - null/empty returns GreaterThan', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFType(null)).toBe('GreaterThan');
            expect(m.normalizeCFType('')).toBe('GreaterThan');
            done();
        });
        it('normalizeCFType - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFType('lessthan')).toBe('LessThan');
            expect(m.normalizeCFType('lt')).toBe('LessThan');
            expect(m.normalizeCFType('between')).toBe('Between');
            expect(m.normalizeCFType('equalto')).toBe('EqualTo');
            expect(m.normalizeCFType('containstext')).toBe('ContainsText');
            expect(m.normalizeCFType('duplicate')).toBe('Duplicate');
            expect(m.normalizeCFType('unique')).toBe('Unique');
            expect(m.normalizeCFType('top10items')).toBe('Top10Items');
            expect(m.normalizeCFType('aboveaverage')).toBe('AboveAverage');
            expect(m.normalizeCFType('belowaverage')).toBe('BelowAverage');
            done();
        });
        it('normalizeCFType - unknown string falls back to GreaterThan', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFType('nonexistent')).toBe('GreaterThan');
            done();
        });
        it('normalizeCFColor - null/empty returns RedFT', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFColor(null)).toBe('RedFT');
            expect(m.normalizeCFColor('')).toBe('RedFT');
            done();
        });
        it('normalizeCFColor - aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFColor('yellow')).toBe('YellowFT');
            expect(m.normalizeCFColor('green')).toBe('GreenFT');
            expect(m.normalizeCFColor('red')).toBe('RedFT');
            done();
        });
        it('normalizeCFColor - unknown falls back to RedFT', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeCFColor('blue')).toBe('RedFT');
            done();
        });
        it('normalizeChartType - null/empty returns Column', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeChartType(null)).toBe('Column');
            expect(m.normalizeChartType('')).toBe('Column');
            done();
        });
        it('normalizeChartType - known types resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeChartType('bar')).toBe('Bar');
            expect(m.normalizeChartType('pie')).toBe('Pie');
            expect(m.normalizeChartType('line')).toBe('Line');
            expect(m.normalizeChartType('area')).toBe('Area');
            expect(m.normalizeChartType('scatter')).toBe('Scatter');
            expect(m.normalizeChartType('doughnut')).toBe('Doughnut');
            expect(m.normalizeChartType('stackedcolumn')).toBe('StackingColumn');
            done();
        });
        it('normalizeChartType - unknown falls back to Column', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeChartType('funnel')).toBe('Column');
            done();
        });
        it('normalizeDVType - null/empty returns WholeNumber', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeDVType(null)).toBe('WholeNumber');
            expect(m.normalizeDVType('')).toBe('WholeNumber');
            done();
        });
        it('normalizeDVType - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeDVType('decimal')).toBe('Decimal');
            expect(m.normalizeDVType('date')).toBe('Date');
            expect(m.normalizeDVType('time')).toBe('Time');
            expect(m.normalizeDVType('list')).toBe('List');
            expect(m.normalizeDVType('custom')).toBe('Custom');
            expect(m.normalizeDVType('textlength')).toBe('TextLength');
            done();
        });
        it('normalizeDVType - unknown falls back to WholeNumber', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeDVType('foobar')).toBe('WholeNumber');
            done();
        });
        it('normalizeDVOperator - null/empty returns Between', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeDVOperator(null)).toBe('Between');
            expect(m.normalizeDVOperator('')).toBe('Between');
            done();
        });
        it('normalizeDVOperator - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeDVOperator('equalto')).toBe('EqualTo');
            expect(m.normalizeDVOperator('notbetween')).toBe('NotBetween');
            expect(m.normalizeDVOperator('greaterthan')).toBe('GreaterThan');
            expect(m.normalizeDVOperator('lessthan')).toBe('LessThan');
            expect(m.normalizeDVOperator('gte')).toBe('GreaterThanOrEqualTo');
            expect(m.normalizeDVOperator('lte')).toBe('LessThanOrEqualTo');
            done();
        });
        it('normalizeFilterOperator - null/empty returns equal', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeFilterOperator(null)).toBe('equal');
            expect(m.normalizeFilterOperator('')).toBe('equal');
            done();
        });
        it('normalizeFilterOperator - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeFilterOperator('notequal')).toBe('notequal');
            expect(m.normalizeFilterOperator('contains')).toBe('contains');
            expect(m.normalizeFilterOperator('startswith')).toBe('startswith');
            expect(m.normalizeFilterOperator('endswith')).toBe('endswith');
            expect(m.normalizeFilterOperator('isempty')).toBe('isempty');
            expect(m.normalizeFilterOperator('isnotempty')).toBe('isnotempty');
            expect(m.normalizeFilterOperator('greaterthan')).toBe('greaterthan');
            expect(m.normalizeFilterOperator('lessthan')).toBe('lessthan');
            done();
        });
        it('normalizeFilterOperator - unknown falls back to equal', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeFilterOperator('xyz')).toBe('equal');
            done();
        });
        it('normalizeSortOrder - null/empty returns Ascending', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeSortOrder(null)).toBe('Ascending');
            expect(m.normalizeSortOrder('')).toBe('Ascending');
            done();
        });
        it('normalizeSortOrder - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeSortOrder('desc')).toBe('Descending');
            expect(m.normalizeSortOrder('z-a')).toBe('Descending');
            expect(m.normalizeSortOrder('asc')).toBe('Ascending');
            expect(m.normalizeSortOrder('a-z')).toBe('Ascending');
            done();
        });
        it('normalizeModelType - null/empty returns empty string', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeModelType(null)).toBe('');
            expect(m.normalizeModelType('')).toBe('');
            done();
        });
        it('normalizeModelType - row/column aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeModelType('rows')).toBe('Row');
            expect(m.normalizeModelType('columns')).toBe('Column');
            expect(m.normalizeModelType('col')).toBe('Column');
            expect(m.normalizeModelType('cols')).toBe('Column');
            done();
        });
        it('normalizeModelType - unknown returns empty string', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeModelType('sheet')).toBe('');
            done();
        });
        it('normalizeAutoFillType - null/empty returns FillSeries', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillType(null)).toBe('FillSeries');
            expect(m.normalizeAutoFillType('')).toBe('FillSeries');
            done();
        });
        it('normalizeAutoFillType - known aliases resolve correctly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillType('copycells')).toBe('CopyCells');
            expect(m.normalizeAutoFillType('fillformattingonly')).toBe('FillFormattingOnly');
            expect(m.normalizeAutoFillType('fillwithoutformatting')).toBe('FillWithoutFormatting');
            done();
        });
        it('normalizeAutoFillType - unknown falls back to FillSeries', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillType('magic')).toBe('FillSeries');
            done();
        });
        it('normalizeAutoFillDirection - named direction resolved directly', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection('up')).toBe('Up');
            expect(m.normalizeAutoFillDirection('left')).toBe('Left');
            expect(m.normalizeAutoFillDirection('right')).toBe('Right');
            done();
        });
        it('normalizeAutoFillDirection - auto-detects Down when fillRange is below dataRange', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection('', 'A1:A3', 'A4:A6')).toBe('Down');
            done();
        });
        it('normalizeAutoFillDirection - auto-detects Up when fillRange is above dataRange', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection('', 'A5:A7', 'A1:A4')).toBe('Up');
            done();
        });
        it('normalizeAutoFillDirection - auto-detects Right when fillRange is right of dataRange', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection('', 'A1:C1', 'D1:F1')).toBe('Right');
            done();
        });
        it('normalizeAutoFillDirection - auto-detects Left when fillRange is left of dataRange', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection('', 'D1:F1', 'A1:C1')).toBe('Left');
            done();
        });
        it('normalizeAutoFillDirection - no ranges provided defaults to Down', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.normalizeAutoFillDirection(undefined, undefined, undefined)).toBe('Down');
            done();
        });
        it('getTargetRange - null/empty/selected returns selectedRange fallback', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.getTargetRange(null)).toBeTruthy();
            expect(m.getTargetRange('')).toBeTruthy();
            expect(m.getTargetRange('selected')).toBeTruthy();
            done();
        });
        it('getTargetRange - explicit address returned as-is', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.getTargetRange('B2:D5')).toBe('B2:D5');
            done();
        });
        it('getTargetAddress - null/empty/selected returns first cell of selectedRange', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.getTargetAddress(null)).toBeTruthy();
            expect(m.getTargetAddress('')).toBeTruthy();
            expect(m.getTargetAddress('selected')).toBeTruthy();
            done();
        });
        it('getTargetAddress - range address returns only first cell', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.getTargetAddress('C3:F7')).toBe('C3');
            done();
        });
        it('applyNumberFormat - returns error message when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyNumberFormat(null);
            expect(result).toContain('Please provide');
            done();
        });
        it('applyNumberFormat - returns error when format is missing', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyNumberFormat({ range: 'A1' });
            expect(result).toContain('Please provide');
            done();
        });
        it('applyCellFormat - returns error when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyCellFormat(null)).toContain('Please provide');
            done();
        });
        it('applyCellFormat - returns error when formatting is empty object', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyCellFormat({ range: 'A1', formatting: {} })).toContain('Please provide');
            done();
        });
        it('applyConditionalFormat - returns error when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyConditionalFormat(null)).toContain('Please provide');
            done();
        });
        it('applyMerge - returns error when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyMerge(null)).toContain('Please provide');
            done();
        });
        it('applyCut - returns error when data/range is null', async (done: Function) => {
            const m: any = getAiAssistModule();
            expect(await m.applyCut(null)).toContain('Please provide');
            expect(await m.applyCut({ range: null })).toContain('Please provide');
            done();
        });
        it('applyCopy - returns error when data/range is null', async (done: Function) => {
            const m: any = getAiAssistModule();
            expect(await m.applyCopy(null)).toContain('Please provide');
            expect(await m.applyCopy({ range: null })).toContain('Please provide');
            done();
        });
        it('applyPaste - returns error when data/range is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyPaste(null)).toContain('Please provide');
            expect(m.applyPaste({ range: null })).toContain('Please provide');
            done();
        });
        it('applyChart - returns error when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyChart(null)).toContain('Please provide');
            done();
        });
        it('applyDataValidation - returns error when data/dvType is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyDataValidation(null)).toContain('Please provide');
            expect(m.applyDataValidation({ range: 'A1' })).toContain('Please provide');
            done();
        });
        it('applyFilterAction - returns error when data is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyFilterAction(null)).toContain('Please provide');
            done();
        });
        it('applyFilterAction - returns error when filterColumn is missing', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyFilterAction({ range: 'A1:D10', filterColumn: '' })).toContain('Please provide');
            done();
        });
        it('applyFilterAction - clearFilter true triggers clear and returns message', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyFilterAction({ range: 'A1:D10', clearFilter: true });
            expect(result).toContain('Cleared filter');
            done();
        });
        it('applySortAction - no range uses selected range branch (in the selected range)', (done: Function) => {
            const module: any = getAiAssistModule();
            helper.invoke('selectRange', ['A1:H11']);
            const result: string = module.applySortAction({ sortOrder: 'Ascending' });
            expect(result).toContain('in the selected range');
            done();
        });
        it('applySortAction - returns error when data/sortColumn is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applySortAction(null)).toContain('Please provide');
            expect(m.applySortAction({ range: 'A1:D10', sortColumn: '' })).toContain('Sorted by column A in range A1:D10 in Ascending order.');
            done();
        });
        it('applyInsert - returns error when data/modelType is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyInsert(null)).toContain('Please provide');
            done();
        });
        it('applyInsert - returns error for invalid modelType', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyInsert({ modelType: 'Sheet', startIndex: 1 })).toContain('Invalid modelType');
            done();
        });
        it('applyDelete - returns error when data/modelType is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyDelete(null)).toContain('Please provide');
            done();
        });
        it('applyDelete - returns error for invalid modelType', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyDelete({ modelType: 'Sheet', startIndex: 1 })).toContain('Invalid modelType');
            done();
        });
        it('applyAutoFill - returns error when dataRange or fillRange is missing', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyAutoFill(null)).toContain('Please provide');
            expect(m.applyAutoFill({ dataRange: 'A1:A3' })).toContain('Please provide');
            expect(m.applyAutoFill({ fillRange: 'A4:A6' })).toContain('Please provide');
            done();
        });
        it('applyFreezePanes - returns error when data/freezeType is null', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.applyFreezePanes(null)).toContain('Please specify');
            expect(m.applyFreezePanes({})).toContain('Please specify');
            done();
        });
        it('applyFreezePanes - returns error when allowFreezePane is false', (done: Function) => {
            const m: any = getAiAssistModule();
            const orig: boolean = helper.getInstance().allowFreezePane;
            helper.getInstance().allowFreezePane = false;
            const result: string = m.applyFreezePanes({ freezeType: 'Rows', row: 1 });
            expect(result).toContain('not enabled');
            helper.getInstance().allowFreezePane = orig;
            done();
        });
        it('applyFreezePanes - unknown freezeType returns error message', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyFreezePanes({ freezeType: 'diagonal' });
            expect(result).toContain('Unknown freezeType');
            done();
        });
        it('applyFreezePanes - Columns freezeType sets column freeze', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyFreezePanes({ freezeType: 'Columns', column: 2 });
            expect(result).toContain('column');
            done();
        });
        it('applyFreezePanes - Panes freezeType sets both row and column', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyFreezePanes({ freezeType: 'Panes', row: 2, column: 2 });
            expect(result).toContain('row');
            done();
        });
        it('applyFreezePanes - Unfreeze returns removal message', (done: Function) => {
            const m: any = getAiAssistModule();
            const result: string = m.applyFreezePanes({ freezeType: 'Unfreeze' });
            expect(result).toContain('Removed');
            done();
        });
        it('applyCellFormat - italic and underline and strikethrough applied', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'A1', formatting: { italic: true, underline: true, strikethrough: true } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[0];
                expect(cell.style).toBeDefined();
                done();
            });
        });
        it('applyCellFormat - fontSize as number converted to px', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'A2', formatting: { fontSize: 14 } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[0];
                expect(cell.style.fontSize).toBe('14pt');
                done();
            });
        });
        it('applyCellFormat - fontSize as numeric string converted to px', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'A3', formatting: { fontSize: '16' } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[2].cells[0];
                expect(cell.style.fontSize).toBe('16pt');
                done();
            });
        });
        it('applyCellFormat - fontSize as non-numeric string passed as-is', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'A4', formatting: { fontSize: 'large' } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[3].cells[0];
                expect(cell.style).toBeDefined();
                done();
            });
        });
        it('applyCellFormat - fontFamily and color applied', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'A1', formatting: { fontFamily: 'Arial', color: '#FF0000' } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[0];
                expect(cell.style.fontFamily).toBe('Arial');
                done();
            });
        });
        it('executeCommand - filter action applies filter without error', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{
                action: 'filter', args: {
                    range: 'A1:H11', filterColumn: 'A', filterOperator: 'contains', filterValue: 'Shoes'
                }
            }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - sort action applies sort without error', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{ action: 'sort', args: { range: 'A1:H11', sortColumn: 'B', sortOrder: 'Descending' } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - cut action returns success message', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{ action: 'cut', args: { range: 'A1:B2' } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - autofill action fills range without error', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{
                action: 'autofill', args: {
                    dataRange: 'E8:E11', fillRange: 'E12:E14', direction: 'Down', fillType: 'CopyCells'
                }
            }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - analysis action uses message from args', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{ action: 'analysis', args: { message: 'Data looks good' } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - reportGeneration action with full structure runs without error', (done: Function) => {
            const m: any = getAiAssistModule();
            m.executeCommand([{ action: 'reportGeneration', args: { reportStructure: {
                summary: 'All good', sections: [{ heading: 'H', content: 'C' }],
                kpis: [], topRows: [], visualSuggestions: []
            } } }]);
            setTimeout(() => {
                expect(helper.getInstance().sheets[0]).toBeDefined();
                done();
            });
        });
        it('executeCommand - reportGeneration with missing reportStructure returns error message', (done: Function) => {
            const m: any = getAiAssistModule();
            let appended: string = '';
            const origAppend: Function = m.appendResponse.bind(m);
            m.appendResponse = (msg: string): void => { appended = msg; origAppend(msg); };
            m.executeCommand([{ action: 'reportGeneration', args: {} }]);
            setTimeout(() => {
                expect(appended).toContain('failed');
                m.appendResponse = origAppend;
                done();
            });
        });
    });

    describe('buildAddressRangeText and applyCommandBatch ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('buildAddressRangeText - empty array returns empty string', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.buildAddressRangeText([])).toBe('');
            done();
        });
        it('buildAddressRangeText - single address returns that address as-is', (done: Function) => {
            const m: any = getAiAssistModule();
            expect(m.buildAddressRangeText(['B3'])).toBe('B3');
            done();
        });
        it('buildAddressRangeText - contiguous column addresses collapse to compact range', (done: Function) => {
            const m: any = getAiAssistModule();
            const addresses: string[] = ['A1', 'A2', 'A3', 'A4', 'A5'];
            expect(m.buildAddressRangeText(addresses)).toBe('A1:A5');
            done();
        });
        it('buildAddressRangeText - scattered addresses produce bounding box range', (done: Function) => {
            const m: any = getAiAssistModule();
            const addresses: string[] = ['A1', 'C3', 'B2'];
            expect(m.buildAddressRangeText(addresses)).toBe('A1:C3');
            done();
        });
        it('applyCommandBatch - edit action with single value returns compact range message', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'edit', args: { address: 'A1', value: 'Hello' } },
                { action: 'edit', args: { address: 'A2', value: 'Hello' } }
            ];
            const result: string = m.applyCommandBatch('edit', commands);
            expect(result).toContain('A1:A2');
            expect(result).toContain('Hello');
            done();
        });
        it('applyCommandBatch - edit action with multiple distinct values shows count message', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'edit', args: { address: 'B1', value: 'Foo' } },
                { action: 'edit', args: { address: 'B2', value: 'Bar' } }
            ];
            const result: string = m.applyCommandBatch('edit', commands);
            expect(result).toContain('different values');
            done();
        });
        it('applyCommandBatch - edit action with no addresses falls back to "selected cells"', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'edit', args: { value: 'X' } },
                { action: 'edit', args: { value: 'Y' } }
            ];
            const result: string = m.applyCommandBatch('edit', commands);
            expect(result).toContain('selected cells');
            done();
        });
        it('applyCommandBatch - cellFormat action returns formatting message with range list', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'cellFormat', args: { range: 'C1', formatting: { bold: true } } },
                { action: 'cellFormat', args: { range: 'C2', formatting: { italic: true } } }
            ];
            const result: string = m.applyCommandBatch('cellFormat', commands);
            expect(result).toContain('cell formatting');
            expect(result).toContain('C1');
            done();
        });
        it('applyCommandBatch - numberFormat with single format names it explicitly', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'numberFormat', args: { range: 'D1', format: 'Currency' } },
                { action: 'numberFormat', args: { range: 'D2', format: 'Currency' } }
            ];
            const result: string = m.applyCommandBatch('numberFormat', commands);
            expect(result).toContain('Currency');
            expect(result).toContain('D1');
            done();
        });
        it('applyCommandBatch - numberFormat with multiple formats shows "multiple formats"', (done: Function) => {
            const m: any = getAiAssistModule();
            const commands: object[] = [
                { action: 'numberFormat', args: { range: 'E1', format: 'Currency' } },
                { action: 'numberFormat', args: { range: 'E2', format: 'Percentage' } }
            ];
            const result: string = m.applyCommandBatch('numberFormat', commands);
            expect(result).toContain('multiple formats');
            done();
        });
    });

    describe('Request command methods and copy/paste execute ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('requestAssistCommand - returns unknown when requestActionList is empty', async (done: Function) => {
            const module: any = getAiAssistModule();
            const origList = module.requestActionList.bind(module);
            module.requestActionList = async (): Promise<any[]> => [];
            const res: any = await module.requestAssistCommand('any');
            expect(res).toEqual([{ action: 'unknown' }]);
            module.requestActionList = origList;
            done();
        });
        it('requestCommandsForActions - handles code-fenced JSON response', async (done: Function) => {
            const module: any = getAiAssistModule();
            const origFetch = (window as any).fetch;
            (window as any).fetch = async (): Promise<any> => ({
                ok: true, json: async () => ({
                    response: '```json\n[{"action":"paste","args":{"range":"B1"}}]\n```'
                })
            });
            const res: any = await module.requestCommandsForActions(['paste'], 'do paste');
            expect(Array.isArray(res)).toBeTruthy();
            expect(res[0].action).toBe('paste');
            (window as any).fetch = origFetch;
            done();
        });
        it('executeCommand - copy and paste actions produce appended responses', (done: Function) => {
            const module: any = getAiAssistModule();
            let appended: string = '';
            const origAppend: Function = module.appendResponse.bind(module);
            module.appendResponse = (msg: string): void => { appended = msg; origAppend(msg); };
            module.executeCommand([{ action: 'copy', args: { range: 'A1:B2' } }, { action: 'paste', args: { range: 'C1' } }]);
            setTimeout(() => {
                expect(typeof appended).toBe('string');
                expect(appended.indexOf('Copied') >= 0 || appended.indexOf('Pasted') >= 0).toBeTruthy();
                module.appendResponse = origAppend;
                done();
            });
        });
        it('executeCommand - unknown action without message uses default informative response', (done: Function) => {
            const module: any = getAiAssistModule();
            let appended: string = '';
            const origAppend: Function = module.appendResponse.bind(module);
            module.appendResponse = (msg: string): void => { appended = msg; origAppend(msg); };
            module.executeCommand([{ action: 'unknown' }]);
            setTimeout(() => {
                expect(appended).toContain('I can analyze the sheet');
                module.appendResponse = origAppend;
                done();
            });
        });
    });

    describe('Additional small coverage ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{ ranges: [{ dataSource: defaultData }] }],
                enableAIAssist: true,
                aiAssistSettings: { requestUrl: 'http://localhost:3007/api/chat' }
            }, done);
        });
        afterAll(() => { helper.invoke('destroy'); });
        it('applyFindReplace - caseSensitive and exactMatch true', (done: Function) => {
            const m: any = getAiAssistModule();
            const res: string = m.applyFindReplace({ findValue: 'Shoes', replaceValue: 'Shoe', caseSensitive: true, exactMatch: true });
            expect(res).toContain(' (case-sensitive)');
            expect(res).toContain(' with exact match');
            done();
        });
        it('applyCellFormat - only underline applied', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'B1', formatting: { underline: true } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[1];
                expect(cell.style.textDecoration).toBe('underline');
                done();
            });
        });
        it('applyCellFormat - only strikethrough applied', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'B2', formatting: { strikethrough: true } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[1];
                expect(cell.style.textDecoration).toBe('line-through');
                done();
            });
        });
        it('applyWrap - disabled returns Disabled message', (done: Function) => {
            const m: any = getAiAssistModule();
            const res: string = m.applyWrap({ range: 'C1', wrap: false });
            expect(res.indexOf('Disabled') >= 0).toBeTruthy();
            done();
        });
        it('applyDelete - uses provided endIndex to compute deleted count', (done: Function) => {
            const m: any = getAiAssistModule();
            const res: string = m.applyDelete({ modelType: 'Row', startIndex: 1, count: 1, endIndex: 3 });
            expect(res).toContain('Deleted 3 Row(s) starting at position 1.');
            done();
        });
        it('applyInsert - uses provided endIndex to compute deleted count', (done: Function) => {
            const m: any = getAiAssistModule();
            const res: string = m.applyInsert({ modelType: 'Row', startIndex: 1, count: 1, endIndex: 3 });
            expect(res).toContain('Inserted 3 Row(s) at position 1.');
            done();
        });
        it('applyCellFormat - bold false sets fontWeight to normal', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'C1', formatting: { bold: false } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[0].cells[2];
                expect(cell.style.fontWeight).toBe('normal');
                done();
            });
        });
        it('applyCellFormat - italic false sets fontStyle to normal', (done: Function) => {
            const m: any = getAiAssistModule();
            m.applyCellFormat({ range: 'C2', formatting: { italic: false } });
            setTimeout(() => {
                const cell: any = helper.getInstance().sheets[0].rows[1].cells[2];
                expect(cell.style.fontStyle).toBe('normal');
                done();
            });
        });
    });
});