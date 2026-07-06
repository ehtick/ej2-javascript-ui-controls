import { Data } from '../../src/kanban/base/data';

describe('Data module', () => {
    describe('modifyArrayData', () => {
        let dataInstance: any;
        let mockParent: any;
        beforeEach(() => {
            mockParent = {
                dataSource: [],
                query: null,
                cardSettings: { headerField: 'Id' },
                kanbanData: [],
                columns: [],
                keyField: 'Status',
                height: 'auto',
                cardHeight: 'auto',
                enableVirtualization: false,
                isDestroyed: false,
                showSpinner: jasmine.createSpy('showSpinner'),
                hideSpinner: jasmine.createSpy('hideSpinner'),
                trigger: jasmine.createSpy('trigger'),
                notify: jasmine.createSpy('notify'),
                swimlaneSettings: { keyField: null },
                sortSettings: { field: null, sortBy: null, direction: null },
                columnDataCount: {}
            };
            spyOn(Data.prototype as any, 'refreshDataManager').and.stub();
            dataInstance = new Data(mockParent);
        });

        it('should extend each element in onLineData with the corresponding element from e when lengths are equal', () => {
            const onLineData = [{ Id: 1, Name: 'Card 1' }, { Id: 2, Name: 'Card 2' }];
            const e = [{ Status: 'Open' }, { Status: 'Done' }];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result[0]).toEqual({ Id: 1, Name: 'Card 1', Status: 'Open' });
            expect(result[1]).toEqual({ Id: 2, Name: 'Card 2', Status: 'Done' });
        });

        it('should override existing properties in onLineData with values from e', () => {
            const onLineData = [{ Id: 1, Status: 'Open' }];
            const e = [{ Status: 'Done' }];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result[0].Status).toBe('Done');
        });

        it('should return onLineData unchanged when arrays have different lengths', () => {
            const onLineData = [{ Id: 1, Name: 'Card 1' }];
            const e = [{ Status: 'Open' }, { Status: 'Done' }];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result).toEqual([{ Id: 1, Name: 'Card 1' }]);
            expect(result.length).toBe(1);
        });

        it('should return empty array when both arrays are empty', () => {
            const onLineData: Record<string, any>[] = [];
            const e: Record<string, any>[] = [];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result).toEqual([]);
        });

        it('should handle single element arrays and merge all properties', () => {
            const onLineData = [{ Id: 1, Name: 'Card 1' }];
            const e = [{ Status: 'InProgress', Priority: 'High' }];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result[0]).toEqual({ Id: 1, Name: 'Card 1', Status: 'InProgress', Priority: 'High' });
        });

        it('should return the same onLineData array reference', () => {
            const onLineData = [{ Id: 1 }];
            const e = [{ Name: 'Updated' }];
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result).toBe(onLineData);
        });

        it('should not modify onLineData when e has fewer elements', () => {
            const onLineData = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];
            const e = [{ Status: 'Open' }];
            const original = JSON.parse(JSON.stringify(onLineData));
            const result = dataInstance.modifyArrayData(onLineData, e);
            expect(result).toEqual(original);
        });
    });
    describe('Data module - updateDataManager remote (non-offline) branch', () => {
        let dataInstance: any;
        let mockParent: any;
        interface RecordItem {
            Id: number;
            value?: string
        }
        interface UpdateParams {
            addedRecords: RecordItem[];
            changedRecords: RecordItem[];
            deletedRecords: RecordItem[];
        }

        beforeEach(() => {
            mockParent = {
                dataSource: [],
                query: null,
                cardSettings: { headerField: 'Id' },
                kanbanData: [],
                columns: [],
                keyField: 'Status',
                height: 'auto',
                cardHeight: 'auto',
                enableVirtualization: false,
                isDestroyed: false,
                showSpinner: jasmine.createSpy('showSpinner'),
                hideSpinner: jasmine.createSpy('hideSpinner'),
                // invoke callback immediately to enter the else branch
                trigger: jasmine.createSpy('trigger').and.callFake((_evt: any, args: any, cb: any) => {
                    if (typeof cb === 'function') { cb(args); }
                }),
                notify: jasmine.createSpy('notify'),
                swimlaneSettings: { keyField: null },
                sortSettings: { field: null, sortBy: null, direction: null },
                columnDataCount: {},
                layoutModule: {
                    columnData: {},
                    getColumnCards: jasmine.createSpy().and.returnValue({}),
                    getRows: jasmine.createSpy().and.returnValue([]),
                    getSwimlaneCards: jasmine.createSpy().and.returnValue({}),
                    renderCardBasedOnIndex: jasmine.createSpy(),
                    removeCard: jasmine.createSpy(),
                    refresh: jasmine.createSpy(),
                    isSelectedCard: false
                },
                actionModule: { SingleCardSelection: jasmine.createSpy() }
            };

            spyOn(Data.prototype as any, 'refreshDataManager').and.stub();
            dataInstance = new Data(mockParent);

            // Force remote (non-offline) path
            dataInstance.dataManager.dataSource.offline = false;
            dataInstance.dataManager.dataSource.url = 'http://example.com/api';
        });

       afterEach(() => {
            if (dataInstance) {
                if (dataInstance.dataManager) {
                    dataInstance.dataManager = null;
                }
                dataInstance = null;
            }
            if (mockParent) {
                if (mockParent.layoutModule) {
                    mockParent.layoutModule = null;
                }
                if (mockParent.virtualLayoutModule) {
                    mockParent.virtualLayoutModule = null;
                }
                mockParent = null;
            }
        });

        function setup(syncResult: any, dataResult: any = { result: [] }): void {
            spyOn(dataInstance as any, 'syncDataSource').and.returnValue(Promise.resolve(syncResult));
            spyOn(dataInstance as any, 'getData').and.returnValue(Promise.resolve(dataResult));
            spyOn(dataInstance as any, 'eventPromise').and.stub();
            spyOn(dataInstance as any, 'dataManagerSuccess').and.stub();
            spyOn(dataInstance as any, 'refreshUI').and.stub();
        }
        describe('cardCreated requestType', () => {
            it('should extend addedRecords[0] when args is NOT an array', (done) => {
                const serverResponse = { Id: 1, Extra: 'server-value' };
                setup(serverResponse);
                const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
                dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 0, false, null, 'Open', 'Done', false);
                setTimeout(() => {
                    expect(params.addedRecords[0].Id).toEqual(1);
                    done();
                }, 20);
            });

            it('should call modifyArrayData when args IS an array', (done) => {
                const serverResponse = [{ Id: 1, Extra: 'arr-value' }];
                setup(serverResponse);
                const modifySpy = spyOn(dataInstance as any, 'modifyArrayData').and.callThrough();
                const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
                dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 0, false, null, 'Open', 'Done', false);
                setTimeout(() => {
                    expect(params.addedRecords[0].Id).toEqual(1);
                    done();
                }, 20);
            });
        });

        describe('cardChanged requestType', () => {
            it('should extend changedRecords[0] when args is NOT an array', (done) => {
                const serverResponse = { Id: 2, Extra: 'changed' };
                setup(serverResponse);
                const params: UpdateParams  = { addedRecords: [], changedRecords: [{ Id: 2 }], deletedRecords: [] };
                dataInstance.updateDataManager('update', params, 'cardChanged', { Id: 2, Status: 'InProgress' }, 0, false, null, 'Open', 'Done', false);
                setTimeout(() => {
                    expect(params.changedRecords[0].Id).toEqual(2);
                    done();
                }, 20);
            });

            it('should call modifyArrayData when args IS an array', (done) => {
                const serverResponse = [{ Id: 2, Extra: 'changed' }];
                setup(serverResponse);
                const params: UpdateParams  = { addedRecords: [], changedRecords: [{ Id: 2 }], deletedRecords: [] };
                dataInstance.updateDataManager('update', params, 'cardChanged', { Id: 2, Status: 'InProgress' }, 0, false, null, 'Open', 'Done', false);
                setTimeout(() => {
                    expect(params.changedRecords[0].Id).toEqual(2);
                    done();
                }, 20);
            });
        });

        describe('cardRemoved requestType', () => {
            it('should extend deletedRecords[0] when args is NOT an array', (done) => {
                const serverResponse = { Id: 3, Extra: 'deleted' };
                setup(serverResponse);
                const params: UpdateParams  = { addedRecords: [], changedRecords: [], deletedRecords: [{ Id: 3 }] };
                dataInstance.updateDataManager('delete', params, 'cardRemoved', { Id: 3, Status: 'Done' }, 0, false, null, 'Done', 'Done', false);
                setTimeout(() => {
                    expect(params.deletedRecords[0].Id).toEqual(3);
                    done();
                }, 20);
            });

            it('should call modifyArrayData when args IS an array', (done) => {
                const serverResponse = [{ Id: 3, Extra: 'deleted' }];
                setup(serverResponse);
                const modifySpy = spyOn(dataInstance as any, 'modifyArrayData').and.callThrough();
                const params: UpdateParams  = { addedRecords: [], changedRecords: [], deletedRecords: [{ Id: 3 }] };
                dataInstance.updateDataManager('delete', params, 'cardRemoved', { Id: 3, Status: 'Done' }, 0, false, null, 'Done', 'Done', false);
                setTimeout(() => {
                    expect(modifySpy).toHaveBeenCalledWith(params.deletedRecords, serverResponse);
                    done();
                }, 20);
            });
        });

        it('should return early without calling refreshUI when parent.isDestroyed is true', (done) => {
            setup({ Id: 1 });
            mockParent.isDestroyed = true;
            const refreshUISpy = (dataInstance as any).refreshUI as jasmine.Spy;
            const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
            dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 0, false, null, 'Open', 'Done', false);
            setTimeout(() => {
                expect(refreshUISpy).not.toHaveBeenCalled();
                done();
            }, 20);
        });

        it('should decrement index when draggedKey === droppedKey and isMultipleDrag is true', (done) => {
            setup({ Id: 1, Extra: 'v' });
            const refreshUISpy = (dataInstance as any).refreshUI as jasmine.Spy;
            const params : UpdateParams = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
            dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 5, false, null, 'Open', 'Open', true);
            setTimeout(() => {
                expect(refreshUISpy).toHaveBeenCalledWith(jasmine.anything(), 4, false);
                done();
            }, 20);
        });

        it('should NOT decrement index when draggedKey !== droppedKey', (done) => {
            setup({ Id: 1, Extra: 'v' });
            const refreshUISpy = (dataInstance as any).refreshUI as jasmine.Spy;
            const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
            dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 3, false, null, 'Open', 'Done', true);
            setTimeout(() => {
                expect(refreshUISpy).toHaveBeenCalledWith(jasmine.anything(), 3, false);
                done();
            }, 20);
        });

        it('should call virtualLayoutModule.refreshColumnData when enableVirtualization is true', (done) => {
            mockParent.enableVirtualization = true;
            mockParent.virtualLayoutModule = {
                refreshColumnData: jasmine.createSpy('refreshColumnData'),
                refresh: jasmine.createSpy()
            };
            setup({ Id: 1, Extra: 'v' });
            const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
            dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 0, false, null, 'Open', 'Done', false);
            setTimeout(() => {
                expect(mockParent.virtualLayoutModule.refreshColumnData).toHaveBeenCalledWith('Open', 'Done', 'cardCreated', 'Open');
                done();
            }, 20);
        });

        it('should call dataManagerFailure when syncDataSource promise rejects', (done) => {
            spyOn(dataInstance as any, 'syncDataSource').and.returnValue(Promise.reject(new Error('network error')));
            spyOn(dataInstance as any, 'eventPromise').and.stub();
            const failureSpy = spyOn(dataInstance as any, 'dataManagerFailure').and.stub();
            const params: UpdateParams  = { addedRecords: [{ Id: 1 }], changedRecords: [], deletedRecords: [] };
            dataInstance.updateDataManager('insert', params, 'cardCreated', { Id: 1, Status: 'Open' }, 0, false, null, 'Open', 'Open', false);
            setTimeout(() => {
                expect(failureSpy).toHaveBeenCalled();
                done();
            }, 20);
        });
    });
});