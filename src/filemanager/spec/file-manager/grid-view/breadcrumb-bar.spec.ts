/**
 * FileManager spec document
 */
import { FileManager } from '../../../src/file-manager/base/file-manager';
import { NavigationPane } from '../../../src/file-manager/layout/navigation-pane';
import { DetailsView } from '../../../src/file-manager/layout/details-view';
import { Toolbar } from '../../../src/file-manager/actions/toolbar';
import { createElement } from '@syncfusion/ej2-base';
import { data1, data17, data18, data19, data20, data21, data22, searchpng, searchapp, searchhellopng, doubleClickRead, searchdocstart, searchdoccase, data15 } from '../data';
import { BeforeSendEventArgs } from '../../../src';

FileManager.Inject(Toolbar, NavigationPane, DetailsView);

describe('FileManager control Grid view', () => {
    describe('with breadcrumb bar testing', () => {
        let mouseEventArgs: any, tapEvent: any;
        let feObj: FileManager;
        let ele: HTMLElement;
        let check: boolean = false;
        let dblclickevent: MouseEvent;
        let originalTimeout: any;
        beforeEach((done: Function): void => {
            jasmine.Ajax.install();
            feObj = undefined;
            ele = createElement('div', { id: 'file' });
            document.body.appendChild(ele);
            feObj = new FileManager({
                view: 'Details',
                ajaxSettings: {
                    url: '/FileOperations',
                    uploadUrl: '/Upload', downloadUrl: '/Download', getImageUrl: '/GetImage'
                },
                showThumbnail: false,
                searchSettings: { allowSearchOnTyping: false },
                beforeSend: (args: BeforeSendEventArgs) => {
                    if (check) {
                        let obj: any = JSON.parse((<any>args.ajaxSettings).data);
                        expect(obj.data[0].name === 'FileContent').toBe(true);
                    }
                }
            });
            feObj.appendTo('#file');
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data1)
            });
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
            setTimeout(function () {
                done();
            }, 500);
            mouseEventArgs = {
                preventDefault: (): void => { },
                stopImmediatePropagation: (): void => { },
                target: null,
                type: null,
                shiftKey: false,
                ctrlKey: false,
                originalEvent: { target: null }
            };
            tapEvent = {
                originalEvent: mouseEventArgs,
                tapCount: 1
            };
            dblclickevent = new MouseEvent('dblclick', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
        });
        afterEach((): void => {
            check = false;
            jasmine.Ajax.uninstall();
            if (feObj) feObj.destroy();
            ele.remove();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
        it('breadCrumb navigation data testing', (done: Function) => {
            feObj.detailsviewModule.gridObj.element.querySelectorAll('.e-row')[2].firstElementChild.dispatchEvent(dblclickevent);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(doubleClickRead)
            });
            setTimeout(function () {
                check = true;
                (<HTMLElement>document.getElementsByClassName('e-addressbar-ul')[0].firstElementChild.firstElementChild).click();
                done();
            }, 500);
        });
        it('Search sort testing (navigate)', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = '.png';
            searchObj.value = '.png';
            let eventArgs: any = { value: '.png', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(searchpng)
            });
            setTimeout(function () {
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(gridLi.length).toEqual(2);
                (<HTMLElement>document.querySelector('.e-headercell.e-lastcell')).click();
                expect(feObj.sortBy).toBe('filterPath');
                let li: any = feObj.navigationpaneModule.treeObj.element.querySelectorAll("li");
                mouseEventArgs.target = li[3].querySelector('.e-fullrow');
                (<any>feObj.navigationpaneModule.treeObj).touchClickObj.tap(tapEvent);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data15)
                });
                setTimeout(function () {
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(gridLi.length).toEqual(3);
                    done();
                }, 500);
            }, 500);
        });
        it('Search sort testing (path)', (done: Function) => {
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'apple';
            searchObj.value = 'apple';
            let eventArgs: any = { value: 'apple', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(searchapp)
            });
            setTimeout(function () {
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                (<HTMLElement>document.querySelector('.e-headercell.e-lastcell')).click();
                expect(feObj.sortBy).toBe('filterPath');
                expect(feObj.sortOrder).toBe('Ascending');
                (<HTMLElement>document.querySelector('.e-headercell.e-lastcell')).click();
                expect(feObj.sortBy).toBe('filterPath');
                expect(feObj.sortOrder).toBe('Descending');
                done();
            }, 500);
        });
        it('Search sort testing (layout change && clear search)', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = '.png';
            searchObj.value = '.png';
            let eventArgs: any = { value: '.png', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(searchpng)
            });
            setTimeout(function () {
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(gridLi.length).toEqual(2);
                (<HTMLElement>document.querySelector('.e-headercell.e-lastcell')).click();
                expect(feObj.sortBy).toBe('filterPath');
                feObj.view = "LargeIcons";
                feObj.dataBind();
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(searchpng)
                });
                setTimeout(function () {
                    let largeLi: any = document.getElementById('file_largeicons').querySelectorAll('.e-list-item');
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(largeLi.length).toEqual(2);
                    searchEle.value = '';
                    searchObj.value = '';
                    let eventArgs: any = { value: '', container: searchEle };
                    searchObj.change(eventArgs);
                    this.request = jasmine.Ajax.requests.mostRecent();
                    this.request.respondWith({
                        status: 200,
                        responseText: JSON.stringify(data1)
                    });
                    setTimeout(function () {
                        let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                        let treeLi: any = treeObj.element.querySelectorAll('li');
                        let largeLi: any = document.getElementById('file_largeicons').querySelectorAll('.e-list-item');
                        expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                        expect(treeLi.length).toEqual(5);
                        expect(largeLi.length).toEqual(5);
                        expect(feObj.sortBy).toBe('name');
                        done();
                    }, 500);
                }, 500);
            }, 500);
        });
        it('Search (empty) testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = '.png';
            searchObj.value = '.png';
            let eventArgs: any = { value: '.png', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(searchpng)
            });
            setTimeout(function () {
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(gridLi.length).toEqual(2);
                searchEle.value = 'hello.png';
                searchObj.value = 'hello.png';
                eventArgs = { value: 'hello.png', container: searchEle };
                searchObj.change(eventArgs);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(searchhellopng)
                });
                setTimeout(function () {
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(gridLi.length).toEqual(0);
                    done();
                }, 500);
            }, 500);
        });
        it('Search (empty) refresh testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'hello.png';
            searchObj.value = 'hello.png';
            let eventArgs: any = { value: 'hello.png', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(searchhellopng)
            });
            setTimeout(function () {
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(gridLi.length).toEqual(0);
                expect(document.getElementById('file_grid').querySelectorAll('.e-empty').length).toBe(1);
                let items: any = document.getElementsByClassName('e-fe-refresh');
                items[0].click();
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data1)
                });
                setTimeout(function () {
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(gridLi.length).toEqual(5);
                    expect(document.getElementById('file_grid').querySelectorAll('.e-empty').length).toBe(0);
                    done();
                }, 500);
            }, 500);
        });
        it('Search setting setmodel testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.filter('/FileOperations');
            this.request[this.request.length - 1].respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                feObj.searchSettings.allowSearchOnTyping = false;
                feObj.dataBind();
                feObj.searchSettings.filterType = 'endsWith';
                feObj.dataBind();
                this.request = jasmine.Ajax.requests.filter('/FileOperations');
                this.request[this.request.length - 1].respondWith({
                    status: 200,
                    responseText: JSON.stringify(searchhellopng)
                });
                setTimeout(function () {
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(gridLi.length).toEqual(0);
                    feObj.searchSettings.filterType = 'startsWith';
                    feObj.dataBind();
                    this.request = jasmine.Ajax.requests.filter('/FileOperations');
                    this.request[this.request.length - 1].respondWith({
                        status: 200,
                        responseText: JSON.stringify(searchdocstart)
                    });
                    setTimeout(function () {
                        let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                        let treeLi: any = treeObj.element.querySelectorAll('li');
                        let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                        expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                        expect(treeLi.length).toEqual(5);
                        expect(gridLi.length).toEqual(2);
                        feObj.searchSettings.ignoreCase = false;
                        feObj.dataBind();
                        this.request = jasmine.Ajax.requests.filter('/FileOperations');
                        this.request[this.request.length - 1].respondWith({
                            status: 200,
                            responseText: JSON.stringify(searchdoccase)
                        });
                        setTimeout(function () {
                            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                            let treeLi: any = treeObj.element.querySelectorAll('li');
                            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                            expect(treeLi.length).toEqual(5);
                            expect(gridLi.length).toEqual(1);
                            done();
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        });
        it('Search file column refresh testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                expect(feObj.detailsviewModule.gridObj.getColumns().length).toEqual(6);
                let items: any = document.getElementsByClassName('e-fe-refresh');
                items[0].click();
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data1)
                });
                setTimeout(function () {
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(gridLi.length).toEqual(5);
                    expect(feObj.detailsviewModule.gridObj.element.querySelector('.e-sortfilter .e-columnheader').querySelectorAll('.e-headercell').length).toEqual(5);
                    expect(feObj.detailsviewModule.gridObj.getColumns().length).toEqual(5);
                    done();
                }, 500);
            }, 500);
        });
        it('Search file testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                searchEle.value = '';
                searchObj.value = '';
                eventArgs = { value: '', container: searchEle };
                searchObj.change(eventArgs);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data1)
                });
                setTimeout(function () {
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(gridLi.length).toEqual(5);
                    done();
                }, 500);
            }, 500);
        });

        it('Search file and layout change testing', function (done) {
            var treeObj = (document.getElementById("file_tree") as any).ej2_instances[0];
            var treeLi = treeObj.element.querySelectorAll('li');
            var gridLi = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            var eventArgs = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let gridObj: any = (document.getElementById("file") as any).ej2_instances[0];
                var treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                gridObj.detailsviewModule.gridObj.selectRow(0);
                gridObj.view = "LargeIcons";
                gridObj.dataBind();
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data18)
                });
                setTimeout(function () {
                    let largeLi: any = document.getElementById('file_largeicons').querySelectorAll('.e-list-item');
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(largeLi.length).toEqual(3);
                    expect(largeLi[0].classList.contains('e-active')).toBe(true);
                    done();
                }, 500);
            }, 500);
        });

        it('Search folder navigation', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            expect(searchEle.placeholder).toBe("Search FileContent");
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                let args = { rowData: { "name": "docs", "size": 0, "dateModified": "2019-03-14T09:27:45.346Z", "dateCreated": "2019-03-13T07:28:06.117Z", "hasChild": true, "isFile": false, "type": "", "filterPath": "\\Documents\\", "_fm_iconClass": "e-fe-folder" }, rowIndex: 0 };
                feObj.detailsviewModule.gridObj.recordDoubleClick(args);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data17)
                });
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data19)
                });
                setTimeout(function () {
                    expect(searchEle.placeholder).toBe("Search docs");
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree_0_0");
                    expect(treeLi.length).toEqual(6);
                    expect(gridLi.length).toEqual(1);
                    done();
                }, 500);
            }, 500);
        });

        it('Search folder navigation in root directory', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            expect(searchEle.placeholder).toBe("Search FileContent");
            searchEle.value = 'Documents';
            searchObj.value = 'Documents';
            let eventArgs: any = { value: 'Documents', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                let args = { rowData: { "name": "Documents", "size": 0, "dateModified": "2019-03-14T14:55:22.5808132+05:30", "dateCreated": "2019-03-07T14:49:02.6184375+05:30", "hasChild": true, "isFile": false, "type": "", "filterPath": "\\", "_fm_iconClass": "e-fe-folder" }, rowIndex: 1 };
                feObj.detailsviewModule.gridObj.recordDoubleClick(args);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data17)
                });
                setTimeout(function () {
                    expect(searchEle.placeholder).toBe("Search Documents");
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree_0");
                    expect(treeLi.length).toEqual(6);
                    expect(gridLi.length).toEqual(1);
                    done();
                }, 500);
            }, 500);
        });
        
        it('Search folder rename operation', (done: Function) => {
            let ele: any = document.getElementById(feObj.element.id + '_contextmenu');
            let menuObj: any = ele.ej2_instances[0];
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                expect(gridLi[0].querySelector(".e-fe-text").textContent).toBe('docs');
                feObj.detailsviewModule.gridObj.selectRows([0]);
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('contextmenu', true, true);
                gridLi[0].dispatchEvent(evt);
                setTimeout(function () {
                    menuObj.element.querySelector('.e-fe-rename').click();
                    setTimeout(function () {
                        let inputValue: any = document.getElementById('file_dialog').querySelector('#rename');
                        expect((inputValue as any).value).toEqual("docs");
                        inputValue.value = 'docs1';
                        (document.getElementById('file_dialog').querySelectorAll('.e-btn')[1] as HTMLElement).click();
                        this.request = jasmine.Ajax.requests.mostRecent();
                        this.request.respondWith({
                            status: 200,
                            responseText: JSON.stringify(data20)
                        });
                        this.request = jasmine.Ajax.requests.mostRecent();
                        this.request.respondWith({
                            status: 200,
                            responseText: JSON.stringify(data21)
                        });
                        setTimeout(function () {
                            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                            let treeLi: any = treeObj.element.querySelectorAll('li');
                            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                            expect(treeLi.length).toEqual(5);
                            expect(gridLi.length).toEqual(3);
                            expect(gridLi[0].querySelector(".e-fe-text").textContent).toBe('docs1');
                            done();
                        }, 500);
                    }, 100);
                }, 100);
            }, 500);
        });
        it('Search folder get info operation', (done: Function) => {
            let ele: any = document.getElementById(feObj.element.id + '_contextmenu');
            let menuObj: any = ele.ej2_instances[0];
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                feObj.detailsviewModule.gridObj.selectRows([0]);
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('contextmenu', true, true);
                gridLi[0].dispatchEvent(evt);
                setTimeout(function () {
                    menuObj.element.querySelector('.e-fe-details').click();
                    done();
                }, 100);
            }, 500);
        });
        it('Search folder delete operation', (done: Function) => {
            let ele: any = document.getElementById(feObj.element.id + '_contextmenu');
            let menuObj: any = ele.ej2_instances[0];
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                expect(gridLi[0].querySelector(".e-fe-text").textContent).toBe('docs');
                feObj.detailsviewModule.gridObj.selectRows([0]);
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('contextmenu', true, true);
                gridLi[0].dispatchEvent(evt);
                setTimeout(function () {
                    menuObj.element.querySelector('.e-fe-delete').click();
                    setTimeout(function () {
                        (document.getElementById('file_dialog').querySelectorAll('.e-btn')[1] as HTMLElement).click();
                        this.request = jasmine.Ajax.requests.mostRecent();
                        this.request.respondWith({
                            status: 200,
                            responseText: JSON.stringify(data22)
                        });
                        this.request = jasmine.Ajax.requests.mostRecent();
                        this.request.respondWith({
                            status: 200,
                            responseText: JSON.stringify(data1)
                        });
                        setTimeout(function () {
                            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                            let treeLi: any = treeObj.element.querySelectorAll('li');
                            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                            expect(treeLi.length).toEqual(5);
                            expect(gridLi.length).toEqual(5);
                            done();
                        }, 500);
                    }, 100);
                }, 100);
            }, 500);
        });
        it('Search folder download operation', (done: Function) => {
            let ele: any = document.getElementById(feObj.element.id + '_contextmenu');
            let menuObj: any = ele.ej2_instances[0];
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                feObj.detailsviewModule.gridObj.selectRows([2]);
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('contextmenu', true, true);
                gridLi[2].dispatchEvent(evt);
                this.request = jasmine.Ajax.requests.mostRecent();
                setTimeout(function () {
                    //menuObj.element.querySelector('.e-fe-download').click();
                    done();
                }, 100);
            }, 500);
        });
        it('allowSearchOnTyping false testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            feObj.searchSettings.allowSearchOnTyping = false;
            feObj.dataBind();
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            let eventArgs: any = { value: 'doc', container: searchEle };
            searchObj.change(eventArgs);
            this.request = jasmine.Ajax.requests.mostRecent();
            this.request.respondWith({
                status: 200,
                responseText: JSON.stringify(data18)
            });
            setTimeout(function () {
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let treeLi: any = treeObj.element.querySelectorAll('li');
                let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                expect(treeLi.length).toEqual(5);
                expect(gridLi.length).toEqual(3);
                searchEle.value = '';
                searchObj.value = '';
                eventArgs = { value: '', container: searchEle };
                searchObj.change(eventArgs);
                this.request = jasmine.Ajax.requests.mostRecent();
                this.request.respondWith({
                    status: 200,
                    responseText: JSON.stringify(data1)
                });
                setTimeout(function () {
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(gridLi.length).toEqual(5);
                    done();
                }, 500);
            }, 500);
        });
        it('allowSearchOnTyping true testing', (done: Function) => {
            let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
            let treeLi: any = treeObj.element.querySelectorAll('li');
            let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
            expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
            expect(treeLi.length).toEqual(5);
            expect(gridLi.length).toEqual(5);
            feObj.searchSettings.allowSearchOnTyping = true;
            feObj.dataBind();
            let searchEle: any = feObj.element.querySelector("#file_search");
            let searchObj: any = searchEle.ej2_instances[0];
            searchEle.value = 'd';
            searchObj.value = 'd';
            let eventArgs: any = { value: 'd', container: searchEle };
            searchObj.input(eventArgs);
            searchEle = feObj.element.querySelector("#file_search");
            searchObj = searchEle.ej2_instances[0];
            searchEle.value = 'do';
            searchObj.value = 'do';
            eventArgs = { value: 'do', container: searchEle };
            searchObj.input(eventArgs);
            searchEle = feObj.element.querySelector("#file_search");
            searchObj = searchEle.ej2_instances[0];
            searchEle.value = 'doc';
            searchObj.value = 'doc';
            eventArgs = { value: 'doc', container: searchEle };
            searchObj.input(eventArgs);
            setTimeout(function () {
                this.request = jasmine.Ajax.requests.filter('/FileOperations');
                expect(this.request.length).toEqual(2);
                this.request[this.request.length - 1].respondWith({
                    status: 200,
                    responseText: JSON.stringify(data18)
                });
                setTimeout(function () {
                    let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                    let treeLi: any = treeObj.element.querySelectorAll('li');
                    let gridLi: any = document.getElementById('file_grid').querySelectorAll('.e-row');
                    expect(treeObj.selectedNodes[0]).toEqual("fe_tree");
                    expect(treeLi.length).toEqual(5);
                    expect(gridLi.length).toEqual(3);
                    done();
                }, 500);
            }, 400);
        });
        it('Search file testing with filter type as startsWith', (done) => {
            feObj.searchSettings.filterType = 'startsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let eventArgs: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].input(eventArgs);
                searchObj.ej2_instances[0].value = '';
                eventArgs = { value: '', container: searchObj };
                searchObj.ej2_instances[0].input(eventArgs);
                done();
            }.bind(searchObj), 500);
        });
        it('Search file testing with filter type as endsWith', (done) => {
            feObj.searchSettings.filterType = 'endsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let eventArgs: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].input(eventArgs);
                searchObj.ej2_instances[0].value = '';
                eventArgs = { value: '', container: searchObj };
                searchObj.ej2_instances[0].input(eventArgs);
                done();
            }.bind(searchObj), 500);
        });
        it('Search file testing with filter type as startsWith', (done) => {
            feObj.searchSettings.filterType = 'startsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = false;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let eventArgs: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].change(eventArgs);
                searchObj.ej2_instances[0].value = '';
                eventArgs = { value: '', container: searchObj };
                searchObj.ej2_instances[0].change(eventArgs);
                done();
            }.bind(searchObj), 500);
        });
        it('Search file testing with filter type as endsWith', (done) => {
            feObj.searchSettings.filterType = 'endsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = false;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let eventArgs: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].change(eventArgs);
                searchObj.ej2_instances[0].value = '';
                eventArgs = { value: '', container: searchObj };
                searchObj.ej2_instances[0].change(eventArgs);
                done();
            }.bind(searchObj), 500);
        });
        it('enter multiple charcters in search textbox ', (done) => {
            feObj.searchSettings.filterType = 'startsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let event: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].input(event);
                searchObj.ej2_instances[0].value = '';
                event = { value: '', container: searchObj };
                searchObj.ej2_instances[0].input(event);
                searchObj.ej2_instances[0].value = 'tes';
                event = { value: '', container: searchObj };
                searchObj.ej2_instances[0].input(event);
                done();
            }.bind(searchObj), 500);
        });
        it('clear search value when navigate the path', (done) => {
            feObj.searchSettings.filterType = 'startsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                searchObj.ej2_instances[0].value = 'doc';
                let event: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].input(event);
                let treeObj: any = (document.getElementById("file_tree") as any).ej2_instances[0];
                let li: any = feObj.navigationpaneModule.treeObj.element.querySelectorAll("li")[1];
                mouseEventArgs.target = li.querySelector('.e-fullrow');
                tapEvent.tapCount = 1;
                treeObj.touchClickObj.tap(tapEvent);
                feObj.searchSettings.filterType = 'startsWith';
                feObj.dataBind();
                let searchObj1: any = feObj.element.querySelector("#file_search");
                setTimeout(function () {
                    feObj.searchSettings.allowSearchOnTyping = true;
                    feObj.dataBind();
                    searchObj1.ej2_instances[0].value = '';
                    event = { value: '', container: searchObj };
                    searchObj1.ej2_instances[0].input(event);
                    expect(searchObj1.ej2_instances[0].value).toBe('');
                    done();
                }.bind(searchObj1), 500);
            }.bind(searchObj), 500);
        });
        it('Search file testing with clear icon', (done) => {
            feObj.searchSettings.filterType = 'startsWith';
            feObj.dataBind();
            let searchObj: any = feObj.element.querySelector("#file_search");
            setTimeout(function () {
                feObj.searchSettings.allowSearchOnTyping = true;
                feObj.dataBind();
                searchObj.focus();
                searchObj.ej2_instances[0].value = 'doc';
                let event: any = { value: 'doc', container: searchObj };
                searchObj.ej2_instances[0].input(event);
                setTimeout(function () {
                    expect(searchObj.ej2_instances[0].value).toBe('doc');
                    var clear = searchObj.nextElementSibling;
                    clear.click();
                    setTimeout(function () {
                        var searchObj1: HTMLInputElement = <HTMLInputElement>feObj.breadCrumbBarNavigation.querySelector("#file_search");
                        expect(searchObj1.value).toBe("");
                        done();
                    }, 500);
                }, 500);
            }.bind(searchObj), 500);
        });
    });
});
