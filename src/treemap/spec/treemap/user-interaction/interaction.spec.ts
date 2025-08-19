
import { TreeMap } from '../../../src/treemap/treemap';
import { findChildren } from '../../../src/treemap/utils/helper';
import { TreeMapHighlight, TreeMapSelection } from '../../../src/treemap/user-interaction/highlight-selection';
import { MouseEvents } from '../base/events.spec';
import { ILoadedEventArgs, IClickEventArgs, IDoubleClickEventArgs, IDrillStartEventArgs } from '../../../src/treemap/model/interface';
import { createElement, remove } from '@syncfusion/ej2-base';
import { jobData, sportsData , jobDataRTL, CarSales} from '../base/data.spec';
import { electionData } from '../base/election.spec';
import  {profile , inMB, getMemoryProfile} from '../common.spec';
import { itemSelected } from '../../../src';
TreeMap.Inject(TreeMapHighlight, TreeMapSelection);

let jobDataSource: Object[] = jobData;
let gameDataSource: Object[] = sportsData;
/**
 * Tree map spec document
 */

describe('TreeMap component Spec', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('TreeMap drill down spec', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: jobData,
                weightValuePath: 'EmployeesCount',
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with drilldown for each levels ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_1_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_1_Item_Index_1_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_1_Item_Index_0_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelPosition = 'BottomCenter';
            treemap.enableDrillDown = true;
            treemap.refresh();
        });
    });

    describe('Checking with drilldown spec to generate Legend in each level', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                dataSource: jobData,
                enableDrillDown: true,
                palette: ['green'],
                weightValuePath: 'EmployeesCount',
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    mode: 'Default'
                },
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with drilldown to generate legend for each levels ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                };

                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('drill-container_Level_Index_1_Item_Index_1_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.refresh();
        });
    });


    describe('TreeMap highlight spec', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'highLight-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: jobData,
                weightValuePath: 'EmployeesCount',
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking with highlight - item mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelPosition = 'TopCenter';
            treemap.enableDrillDown = false;
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with highlight - child mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[1] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                }
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelPosition = 'TopRight';
            treemap.highlightSettings.mode = 'Child';
            treemap.refresh();
        });

        it('Checking with highlight - Parent mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[2] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelPosition = 'CenterLeft';
            treemap.highlightSettings.mode = 'Parent';
            treemap.refresh();
        });

        it('Checking with highlight - All mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[3] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelPosition = 'Center';
            treemap.highlightSettings.mode = 'All';
            treemap.refresh();
        });

        it('Checking with mouse move on title', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let titleEle: Element = document.getElementById(args.treemap.element.id + '_TreeMap_title');
                let eventObj: Object = {};
                eventObj = {
                    target: titleEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: titleEle.getBoundingClientRect().left,
                    pageY: (titleEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.refresh();
        });
    });
    describe('TreeMap selection spec', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'selection-container';
        beforeAll(() => {
            if (document.getElementById('highLight-container')) {
                document.getElementById('highLight-container').remove();
            }
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: jobData,
                weightValuePath: 'EmployeesCount',
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking with selection - item mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with highlight and selection together ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                eventObj['type'] = 'mousedown';
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                rectEle = layoutEle.childNodes[2] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with mouse down on title', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let titleEle: Element = document.getElementById(args.treemap.element.id + '_TreeMap_title');
                let eventObj: Object = {};
                eventObj = {
                    target: titleEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: titleEle.getBoundingClientRect().left,
                    pageY: (titleEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.refresh();
        });

        it('Checking with mouse click event', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'click',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.clickOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.refresh();
        });
    });

    describe('TreeMap highlight and selection spec with legendsettings', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                    mode: "Default",
                    position: 'Top',
                    shape: 'Rectangle',
                    height: '10'
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                rangeColorValuePath: 'WinPercentage',
                equalColorValuePath: 'Winner',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            value: 'Trump', color: '#D84444'
                        },
                        {
                            value: 'Clinton', color: '#316DB5'
                        }
                    ]
                },
                highlightSettings: { fill: 'orange' },
                selectionSettings: { fill: 'green' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with highlight enable on outside of the node', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with node highlight enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with multi node highlight enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('container_Level_Index_0_Item_Index_2_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with node selection enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with highlight and selection together in nodes of the treemap', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let layoutID: string = args.treemap.element.id + '_TreeMap_' + args.treemap.layoutType + '_Layout';
                let layoutEle: Element = document.getElementById(layoutID);
                let rectEle: Element; let eventObj: Object = {};
                rectEle = layoutEle.childNodes[0] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                eventObj['type'] = 'mousedown';
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                rectEle = layoutEle.childNodes[2] as Element;
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_18_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
        it('Checking the treemap resize window selection state enable or disable when select the maps', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_18_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_TreeMap_Border');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.selectionSettings.enable = true;
            treemap.height ="400px";
            treemap.width ="400px";
            treemap.refresh();
        });
        it('Checking with legend highlight enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Shape_Index_1');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });


        it('Checking with multi legend highlight enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Shape_Index_1');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Shape_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend highlight enable with intreactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend selection enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend selection enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_1');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = "Interactive";
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
    });

    describe('TreeMap selection spec with legendsettings', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                rangeColorValuePath: 'WinPercentage',
                equalColorValuePath: 'Winner',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            value: 'Trump', color: '#D84444'
                        },
                        {
                            value: 'Clinton', color: '#316DB5'
                        }
                    ]
                },
                selectionSettings: { fill: 'green' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with node selection without highlight', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById('container_Level_Index_0_Item_Index_13_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend selection without highlight', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Shape_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend selection without highlight with interactive legend mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend selection with select method', () => { 
            treemap.selectItem(['Alabama']);
            let rectEle = document.getElementById(id + '_Legend_Index_0');
            expect(rectEle.getAttribute('fill')).toBe('green');
        });
    });

    describe('TreeMap highlight spec with legendsettings', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                rangeColorValuePath: 'WinPercentage',
                equalColorValuePath: 'Winner',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            value: 'Trump', color: '#D84444'
                        },
                        {
                            value: 'Clinton', color: '#316DB5'
                        }
                    ]
                },
                highlightSettings: { fill: 'orange' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with legend highlight without selection with interactive legend', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with node highlight without selection with interactive legend', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_7_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with node selection with highlight', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_7_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_10_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_8_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });

        it('Checking with legend selection with node highlight', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_1');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_4_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_2_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.selectionSettings.enable = true;
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
    });
    describe('Checking drilldown with RTL', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                dataSource: jobDataRTL,
                enableDrillDown: true,
                enableRtl:true,
                enableBreadcrumb: true,
                breadcrumbConnector:'->',
                palette: ['green'],
                weightValuePath: 'EmployeesCount',
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    mode: 'Default'
                },
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                   // labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking drilldown with RTL for each levels ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {                
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };

                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('drill-container_Level_Index_1_Item_Index_1_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                
                rectEle = document.getElementById('drill-container_Level_Index_1_Item_Index_0_Text_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                
            };
            treemap.refresh();
        });
    });
    describe('Checking drilldown view', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                dataSource: jobData,
                enableDrillDown: true,
                //drillDownView:true,
                enableBreadcrumb: true,
                breadcrumbConnector:'->',
                palette: ['green'],
                weightValuePath: 'EmployeesCount',
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    mode: 'Default'
                },
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                   // labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking drilldown view as false with breadcrumb as true by clicking the drill levels', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };

                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('drill-container_Level_Index_1_Item_Index_1_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                
                rectEle = document.getElementById('drill-container_Level_Index_1_Item_Index_0_Text_1');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);
                
            };
            treemap.refresh();
        });
        it('Checking drilldown view by clicking the drill levels', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                
                rectEle = document.getElementById('drill-container_Level_Index_0_Item_Index_0_Text_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                
                rectEle = document.getElementById('drill-container_Level_Index_0_Item_Index_1_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                   
            };
            treemap.drillDownView = true;
            treemap.refresh();
        });
    });

    describe('Double Click Event Spec', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                dataSource: jobData,
                enableDrillDown: true,
                //drillDownView:true,
                enableBreadcrumb: true,
                breadcrumbConnector:'->',
                palette: ['green'],
                weightValuePath: 'EmployeesCount',
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    mode: 'Default'
                },
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                   // labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ],
                doubleClick:(args: IDoubleClickEventArgs) =>{
                    alert('doubleclick Event is triggered');
                },
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking double click event spec ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'doubleClick',
                    preventDefault: prevent,
                };                
                //treemap.refresh();
                treemap.clickOnTreeMap(<PointerEvent>eventObj);
                treemap.doubleClickOnTreeMap(<PointerEvent>eventObj);
                
            };
            treemap.refresh();
        });
        it('Checking right click event spec ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'rightClick',
                    preventDefault: prevent,
                };                                
                treemap.rightClickOnTreeMap(<PointerEvent>eventObj);                                
            };
            treemap.refresh();
        });
    });

    describe('TreeMap onDemand Process drill down spec', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: jobData,
                weightValuePath: 'EmployeesCount',
                enableDrillDown:true,
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                   // { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ],
                drillStart:(args: IDrillStartEventArgs) =>{
                    var xx = findChildren(args.item)['values']; var yy;
                        if (!xx[0]['isDrilled']) {
                            yy = xx;
                        }
                    else {
                        if (args.groupName == xx[0]['name']) {
                            yy = findChildren(xx[0])['values'];
                        }
                    }
                    args.childItems = yy;
                },
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with onDemand drilldown process ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_0_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObj);                                                             
                let rectElem: Element = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_0_Text');                
                let eventObjt: Object = {
                    target: rectElem,
                    type: 'mouseup',
                    preventDefault: prevent,
                    pageX: rectElem.getBoundingClientRect().left,
                    pageY: (rectElem.getBoundingClientRect().top + 10)
                };
                treemap.mouseEndOnTreeMap(<PointerEvent>eventObjt); 
            };                       
            treemap.refresh();
        });
    });

    describe('TreeMap selection for palette', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    textStyle: { size: '15px',  fontFamily: 'Segoe UI' }
                },
                format: 'n',
                useGroupingSeparator: true,
                dataSource: CarSales,
                legendSettings: {
                    visible: true,
                    position: 'Bottom',
                    shape: 'Rectangle',
                    textStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                palette: ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'],
                tooltipSettings: {
                    visible: true,
                    textStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                weightValuePath: 'Sales',
                leafItemSettings: {
                    labelPath: 'Company',
                    border: { color: 'white', width: 0.5 },
                    labelStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                levels: [
                    {
                        groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                    }
                ],
                selectionSettings: {
                    enable: true,
                    fill: '#58a0d3',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                },
                highlightSettings: {
                    enable: true,
                    fill: '#71b0dd',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking selection with legend', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Shape_Index_0');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            }
        });
        it('Checking selection with interactive legend', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Index_1');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.refresh();
        });
        it('Checking selection with interactive legend text', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Index_2_Text');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.refresh();
        });
        it('Checking selection with legend text', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Text_Index_0');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.refresh();
        });
    });
    describe('TreeMap highlight for palette', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    textStyle: { size: '15px',  fontFamily: 'Segoe UI' }
                },
                format: 'n',
                useGroupingSeparator: true,
                dataSource: CarSales,
                legendSettings: {
                    visible: true,
                    position: 'Bottom',
                    shape: 'Rectangle',
                    textStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                palette: ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'],
                tooltipSettings: {
                    visible: true,
                    textStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                weightValuePath: 'Sales',
                leafItemSettings: {
                    labelPath: 'Company',
                    border: { color: 'white', width: 0.5 },
                    labelStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                levels: [
                    {
                        groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                    }
                ],
                selectionSettings: {
                    enable: true,
                    fill: '#58a0d3',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                },
                highlightSettings: {
                    enable: true,
                    fill: '#71b0dd',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking highlight with interactive legend', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element = document.getElementById('container_Legend_Index_2');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj); 
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.refresh();
        });
        it('Checking highlight with interactive legend text', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Index_1_Text');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj); 
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.refresh();
        });
        it('Checking highlight with interactive legend text', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element = document.getElementById('container_Legend_Index_3_Text');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('container_Legend_Index_4_Text');
                eventObj = {
                    target: rectEle,
                    type: 'movemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.refresh();
        });
        it('Checking highlight with Default legend text', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element = document.getElementById('container_Legend_Text_Index_3');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
                rectEle = document.getElementById('container_Legend_Text_Index_4');
                eventObj = {
                    target: rectEle,
                    type: 'movemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.refresh();
        });
        it('Checking highlight with Shape', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element = document.getElementById('container_Level_Index_1_Item_Index_12_RectPath');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.refresh();
        });
        it('Checking highlight with interactive legend shape', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element = document.getElementById('container_Legend_Shape_Index_3');
                let eventObj: Object = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.refresh();
        });
        it('Checking with legend shape selection with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Shape_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
    });
    describe('TreeMap highlight and selection spec with legends', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                    mode: "Default",
                    position: 'Top',
                    shape: 'Rectangle',
                    height: '10'
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                rangeColorValuePath: 'WinPercentage',
                equalColorValuePath: 'Winner',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            value: 'Trump', color: '#D84444'
                        },
                        {
                            value: 'Clinton', color: '#316DB5'
                        }
                    ]
                },
                highlightSettings: { fill: 'orange' },
                selectionSettings: { fill: 'green' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking with legend highlight enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend highlight enable with Default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Text_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
        it('Checking legend highlight for palette with level', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_0_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.dataSource = CarSales;
            treemap.weightValuePath = 'Sales';
            treemap.levels =  [{
                    groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                }];
            treemap.rangeColorValuePath = '';
            treemap.equalColorValuePath = '';
            treemap.palette = ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'];
            treemap.leafItemSettings = {
                labelPath: 'Company',
                border: { color: 'white', width: 0.5 },
                labelStyle: {
                    fontFamily: 'Segoe UI'
                }
            };
            treemap.refresh();
        });
    });

    describe('TreeMap highlight and selection spec with legends and equal color mapping', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                    mode: "Default",
                    position: 'Top',
                    shape: 'Rectangle',
                    height: '10'
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                equalColorValuePath: 'Winner',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            value: 'Trump', color: '#D84444'
                        },
                        {
                            value: 'Clinton', color: '#316DB5'
                        }
                    ]
                },
                highlightSettings: { fill: 'orange' },
                selectionSettings: { fill: 'green' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking with legend highlight enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend highlight enable with Default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Text_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
    });

    describe('TreeMap highlight and selection spec with legends and range color mapping with gradient', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                    mode: "Default",
                    position: 'Top',
                    shape: 'Rectangle',
                    height: '10'
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: electionData,
                weightValuePath: 'Population',
                rangeColorValuePath: 'WinPercentage',
                leafItemSettings: {
                    labelPath: 'State',
                    fill: '#6699cc',
                    border: { color: 'white', width: 0.5 },
                    colorMapping: [
                        {
                            from: 0, to: 40, color: ['#D84444', '#316DB5']
                        },
                        {
                            from: 41, to: 100, color: ['#316DB5', 'red']
                        }
                    ]
                },
                highlightSettings: { fill: 'orange' },
                selectionSettings: { fill: 'green' }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking with legend highlight enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend highlight enable with Default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Text_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.highlightSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend selection enable with interactive mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Index_0_Text');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Interactive';
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
        it('Checking with legend selection enable with default mode', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Legend_Text_Index_0');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.legendSettings.mode = 'Default';
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
        it('Coverage for item selection with labels', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_1_LabelTemplate');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.leafItemSettings.labelTemplate = '#template';
            treemap.selectionSettings.enable = true;
            treemap.itemSelected = function(args) {
                args.contentItemTemplate = "<div>" + args.text + ": " + args.text + "</div>";
            };
            treemap.refresh();
        });
    });

    describe('Coverage without colormapping', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                legendSettings: {
                    visible: true,
                    mode: "Default",
                    position: 'Top',
                    shape: 'Rectangle',
                    height: '10'
                },
                titleSettings: {
                    text: 'Tree Map control',
                },
                dataSource: CarSales,
                palette: ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'],
                tooltipSettings: {
                    visible: true,
                    textStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                weightValuePath: 'Sales',
                leafItemSettings: {
                    labelPath: 'Company',
                    border: { color: 'white', width: 0.5 },
                    labelStyle: {
                        fontFamily: 'Segoe UI'
                    }
                },
                levels: [
                    {
                        groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                        colorMapping: [
                            { from: 0, to: 200000, color: 'cyan' },
                            { from: 200001, to: 2000000, color: 'magenta' },
                            { from: 200001, to: 2000000, color: 'magenta' },
                            { color: 'yellow', label: 'other' }
                        ]
                    }
                ],
                enableDrillDown: true,
                selectionSettings: {
                    enable: true,
                    fill: '#58a0d3',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                },
                highlightSettings: {
                    enable: true,
                    fill: '#71b0dd',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('Checking for selection items for others', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                debugger
                let rectEle: Element; let eventObj: Object = {};
                rectEle = document.getElementById(args.treemap.element.id + '_Level_Index_0_Item_Index_0_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousemove',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseMoveOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.refresh();
        });
    });

    describe('Checking with drilldown spec with Legend, selection', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'drill-container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                border: {
                    color: 'red',
                    width: 2
                },
                dataSource: jobData,
                enableDrillDown: true,
                palette: ['green'],
                weightValuePath: 'EmployeesCount',
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    mode: 'Default'
                },
                leafItemSettings: {
                    labelPath: 'JobGroup',
                    fill: '#6699cc',
                    labelPosition: 'BottomRight',
                    border: { color: 'black', width: 2 }
                },
                levels: [
                    { groupPath: 'Country', fill: '#336699', border: { color: 'black', width: 2 } },
                    { groupPath: 'JobDescription', fill: '#336699', border: { color: 'black', width: 2 } }
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('Checking with drilldown with selection', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let eventObj: Object = {};
                let rectEle: Element = document.getElementById('drill-container_Level_Index_0_Item_Index_0_RectPath');
                eventObj = {
                    target: rectEle,
                    type: 'mousedown',
                    preventDefault: prevent,
                    pageX: rectEle.getBoundingClientRect().left,
                    pageY: (rectEle.getBoundingClientRect().top + 10)
                };
                treemap.mouseDownOnTreeMap(<PointerEvent>eventObj);
            };
            treemap.selectionSettings.enable = true;
            treemap.refresh();
        });
    });

    describe('Coverage for keyboard selection highlight', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                enableDrillDown: false,
                titleSettings: {
                    text: 'Car Sales by Country',
                    subtitleSettings: { text: '--2017' }
                },
                rangeColorValuePath: 'Sales',
                format: 'n',
                useGroupingSeparator: true,
                dataSource: CarSales,
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    shape: 'Rectangle',
                },
                palette: ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'],
                tooltipSettings: {
                    visible: true
                },
                weightValuePath: 'Sales',
                leafItemSettings: {
                    labelPath: 'Company',
                    border: { color: 'white', width: 0.5 }
                },
                levels: [
                    {
                        groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                    }
                ],
                selectionSettings: {
                    enable: true,
                    fill: 'yellow',
                    border: { width: 0.3, color: 'white' },
                    opacity: '1'
                },
                highlightSettings: {
                    enable: true,
                    fill: 'green',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('key up event', () => { 
            let targetArea: HTMLElement = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');            
            let keyboardeventargs: any = {
                target: targetArea,
                code : 'Tab',
                type: 'keyup',
                key: 'keyup',
            }
            treemap.keyUpHandler(keyboardeventargs)
            targetArea = document.getElementById('container_Level_Index_0_Item_Index_0_RectPath');
            keyboardeventargs = {
                target: targetArea,
                code : '',
                type: 'keyup',
                key: 'keyup'
            }
            treemap.keyUpHandler(keyboardeventargs)
            targetArea = document.getElementById('container_Legend_Index_0');
            keyboardeventargs = {
                target: targetArea,
                code : 'Tab',
                type: 'keydown',
                key: 'keydown'
            }
            treemap.keyUpHandler(keyboardeventargs)
            keyboardeventargs = {
                target: targetArea,
                code : 'Tab',
                type: 'keydown',
                key: 'keydown'
            }
            treemap.keyUpHandler(keyboardeventargs)
        });
        it('key down event', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let targetArea: HTMLElement = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');            
                let keyboardeventargs: any = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown',
                }
                treemap.keyDownHandler(keyboardeventargs)
                targetArea = document.getElementById('container_Level_Index_0_Item_Index_0_RectPath');
                keyboardeventargs = {
                    target: targetArea,
                    code : '',
                    type: 'keydown',
                    key: 'keydown'
                }
                treemap.keyDownHandler(keyboardeventargs)
                targetArea = document.getElementById('container_Legend_Index_0');
                keyboardeventargs = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown'
                }
                treemap.keyDownHandler(keyboardeventargs)
                keyboardeventargs = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown'
                }
                treemap.keyDownHandler(keyboardeventargs)
            };
            treemap.refresh();
        });
        it('key down event', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                let targetArea: HTMLElement = document.getElementById('container_Level_Index_0_Item_Index_0_RectPath');            
                let keyboardeventargs: any = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown',
                }
                treemap.keyDownHandler(keyboardeventargs)
                targetArea = document.getElementById('container_Legend_Index_0');
                keyboardeventargs = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown'
                }
                treemap.keyDownHandler(keyboardeventargs)
                keyboardeventargs = {
                    target: targetArea,
                    code : 'Enter',
                    type: 'keydown',
                    key: 'keydown'
                }
                treemap.keyDownHandler(keyboardeventargs)
            };
            treemap.enableDrillDown = true;
            treemap.refresh();
        });
    });

    describe('Coverage for keyboard selection without highlight', () => {
        let element: Element;
        let treemap: TreeMap;
        let prevent: Function = (): void => { };
        let trigger: MouseEvents = new MouseEvents();
        let id: string = 'container';
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                enableDrillDown: false,
                titleSettings: {
                    text: 'Car Sales by Country',
                    subtitleSettings: { text: '--2017' }
                },
                rangeColorValuePath: 'Sales',
                format: 'n',
                useGroupingSeparator: true,
                dataSource: CarSales,
                legendSettings: {
                    visible: true,
                    position: 'Top',
                    shape: 'Rectangle',
                },
                palette: ['#C33764', '#AB3566', '#993367', '#853169', '#742F6A', '#632D6C', '#532C6D', '#412A6F', '#312870', '#1D2671'],
                tooltipSettings: {
                    visible: true
                },
                weightValuePath: 'Sales',
                leafItemSettings: {
                    labelPath: 'Company',
                    border: { color: 'white', width: 0.5 }
                },
                levels: [
                    {
                        groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                    }
                ],
                selectionSettings: {
                    enable: true,
                    fill: 'yellow',
                    border: { width: 0.3, color: 'white' },
                    opacity: '1'
                },
                highlightSettings: {
                    enable: false,
                    fill: 'green',
                    border: { width: 0.3, color: 'black' },
                    opacity: '1'
                }
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });
        it('key up event', () => { 
            let targetArea: HTMLElement = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');            
            let keyboardeventargs: any = {
                target: targetArea,
                code : 'Tab',
                type: 'keyup',
                key: 'keyup',
            }
            treemap.keyUpHandler(keyboardeventargs)
            targetArea = document.getElementById('container_Level_Index_0_Item_Index_0_RectPath');
            keyboardeventargs = {
                target: targetArea,
                code : '',
                type: 'keyup',
                key: 'keyup'
            }
            treemap.keyUpHandler(keyboardeventargs)
            targetArea = document.getElementById('container_Legend_Index_0');
            keyboardeventargs = {
                target: targetArea,
                code : 'Tab',
                type: 'keydown',
                key: 'keydown'
            }
            treemap.keyUpHandler(keyboardeventargs)
            keyboardeventargs = {
                target: targetArea,
                code : 'Tab',
                type: 'keydown',
                key: 'keydown'
            }
            treemap.keyUpHandler(keyboardeventargs)
        });
    });

    it('memory leak', () => {
        profile.sample();
        let average: any = inMB(profile.averageChange)
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        let memory: any = inMB(getMemoryProfile())
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});