import { TreeMap } from '../../../src/treemap/treemap';
import { TreeMapLegend } from '../../../src/treemap/layout/legend';
import { TreeMapTooltip } from '../../../src/treemap/user-interaction/tooltip';
import { ILoadedEventArgs } from '../../../src/treemap/model/interface';
import { TreeMapHighlight } from '../../../src/treemap/user-interaction/highlight-selection';
import { createElement, remove } from '@syncfusion/ej2-base';
import  {profile , inMB, getMemoryProfile} from '../common.spec';
import { MouseEvents } from '../base/events.spec';
import {  CarSales } from '../base/data.spec';
import { SubTitleSettings } from '../../../src';
TreeMap.Inject(TreeMapLegend, TreeMapTooltip);
/**
 * Tree map spec document
 */
describe('TreeMap Component Base Spec', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text default theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#353535');
            };
            treemap.refresh();
        });
        it('legend title default theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#353535');
            };
            treemap.refresh();
        });
        it('title text default theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#424242');
            };
            treemap.refresh();
        });
        it('subtitle text default theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#424242');
            };
            treemap.refresh();
        });
        it('Background default theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('Checking default theme Tooltip', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#363F4C');
            };
            
            treemap.refresh();
        });
        it('Checking Bootstrap4 theme Tooltip tspan', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#ffffff');
            };
            treemap.refresh();
        });
        it('palette color as null', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_0_Item_Index_0_RectPath');
                expect(element.getAttribute('fill')).toBe('#808080');
            };
            treemap.palette = null;
            treemap.refresh();
        });
        it('Levels as empty and null', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                expect(element == null).toBe(true);
            };
            treemap.levels = [
                {
                    groupPath: 'Continent', border: { color: 'white', width: 0.5 },
                },
                {
                    
                }
            ];
            treemap.refresh();
        });
    });

    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'MaterialDark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text MaterialDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#DADADA');
            };
            treemap.refresh();
        });
        it('legend title MaterialDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#DADADA');
            };
            treemap.refresh();
        });
        it('title text MaterialDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('subtitle text MaterialDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('Background MaterialDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('#303030');
            };
            treemap.refresh();
        });
        it('Checking default MaterialDark Tooltip', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#363F4C');
            };
            
            treemap.refresh();
        });
        it('Checking MaterialDark theme Tooltip tspan', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#ffffff');
            };
            treemap.refresh();
        });
    });

    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'HighContrast',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text Highcontrast theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('legend title Highcontrast theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('title text Highcontrast theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('subtitle text Highcontrast theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('Background Highcontrast theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('#000000');
            };
            treemap.refresh();
        });
        it('Checking default Highcontrast Tooltip', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#363F4C');
            };
            
            treemap.refresh();
        });
        it('Checking Highcontrast theme Tooltip tspan', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#ffffff');
            };
            treemap.refresh();
        });
    });

    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Bootstrap4',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('legend title Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('title text Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('subtitle text Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('Background Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('legend font Bootstrap4 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('HelveticaNeue');
            };
            treemap.refresh();
        });
        it('Bootstrap4 Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#000000');
            };            
            treemap.refresh();
        });
        it('default Bootstrap4 Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('default Bootstrap4 Tooltip font ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                debugger;
                expect(tooltipElement.getAttribute('font-family')).toBe('HelveticaNeue-Medium');
            };            
            treemap.refresh();
        });
        it(' Bootstrap4 theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        
    });
	describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Tailwind',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#374151');
            };
            treemap.refresh();
        });
        it('legend title Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#374151');
            };
            treemap.refresh();
        });
        it('title text Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#374151');
            };
            treemap.refresh();
        });
        it('subtitle text Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#374151');
            };
            treemap.refresh();
        });
        it('Background Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font Tailwind theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Inter');
            };
            treemap.refresh();
        });
        it('Tailwind Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#111827');
            };            
            treemap.refresh();
        });
        it('default Tailwind Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it(' Tailwind theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#F9FAFB');
            };
            treemap.refresh();
        });
        
    });
	describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'TailwindDark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#D1D5DB');
            };
            treemap.refresh();
        });
        it('legend title TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#D1D5DB');
            };
            treemap.refresh();
        });
        it('title text TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#D1D5DB');
            };
            treemap.refresh();
        });
        it('subtitle text TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#D1D5DB');
            };
            treemap.refresh();
        });
        it('Background TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font TailwindDark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Inter');
            };
            treemap.refresh();
        });
        it('TailwindDark Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#F9FAFB');
            };            
            treemap.refresh();
        });
        it('default TailwindDark Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it(' TailwindDark theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#1F2937');
            };
            treemap.refresh();
        });
        
    });
    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Fluent2',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text Fluent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#242424');
            };
            treemap.refresh();
        });
        it('legend title Fluent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#242424');
            };
            treemap.refresh();
        });
        it('title text Fluent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#242424');
            };
            treemap.refresh();
        });
        it('subtitle text Fluent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#242424');
            };
            treemap.refresh();
        });
        it('Background FLuent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font Fluent2 theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('TailwindDark Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#FFFFFF');
            };            
            treemap.refresh();
        });
        it('default TailwindDark Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it(' TailwindDark theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#242424');
            };
            treemap.refresh();
        });
        
    });
    describe('Checking the theme in', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Fluent2Dark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('legend title Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('title text Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('subtitle text Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('Background Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font Fluent2 Dark theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Fluent2 Dark Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#292929');
            };            
            treemap.refresh();
        });
        it('default Fluent2 Dark Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it(' Fluent2 Dark theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        
    });
    describe('Checking the theme in Bootstraps5', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Bootstrap5',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#000000');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('0.9');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in Bootstraps5dark', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Bootstrap5Dark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#DEE2E6');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#DEE2E6');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#DEE2E6');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#DEE2E6');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#FFFFFF');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('0.9');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#212529');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in Fluent', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Fluent',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#201F1E');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#201F1E');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#201F1E');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#201F1E');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('rgba(255,255,255, 0.0)');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#FFFFFF');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#323130');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in FluentDark', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'FluentDark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#F3F2F1');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#F3F2F1');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#F3F2F1');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#F3F2F1');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('rgba(255,255,255, 0.0)');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#252423');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#F3F2F1');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in Material3', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Material3',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#49454E');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#1C1B1F');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#1C1B1F');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#1C1B1F');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Roboto');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#313033');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#F4EFF4');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in Material3Dark', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Material3Dark',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#CAC4D0');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#E6E1E5');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#E6E1E5');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#E6E1E5');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Roboto');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#E6E1E5');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#313033');
            };
            treemap.refresh();
        });
    });
    describe('Checking the theme in Fluent2HighContrast', () => {
        let element: Element;
        let treemap: TreeMap;
        let id: string = 'container';
        let tooltipElement: HTMLElement;
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '600px';
            (element as HTMLDivElement).style.height = '400px';
            document.body.appendChild(element);
            treemap = new TreeMap({
                titleSettings: {
                    text: 'Car Sales by Country - 2017',
                    subtitleSettings:{
                        text: '- 2017'
                    }
                },
                theme: 'Fluent2HighContrast',
                dataSource: CarSales,
                highlightSettings: {
                    enable: false
                },
                selectionSettings: {
                    enable: false
                },
                legendSettings: {
                    visible: true,
                    title: {
                        text: 'Legend'
                    },
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
                ]
            }, '#' + id);
        });
        afterAll(() => {
            treemap.destroy();
            document.getElementById(id).remove();
        });

        it('legend text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Legend_Text_Index_0');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('legend title theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_LegendTitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('title text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_title');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('subtitle text theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_subtitle');
                expect(element.getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
        it('Background theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_TreeMap_Border');
                expect(element.getAttribute('fill')).toBe('transparent');
            };
            treemap.refresh();
        });
        it('legend font theme ', () => {
            treemap.loaded = (args: ILoadedEventArgs) => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_Text');
                expect(element.getAttribute('font-family')).toBe('Segoe UI');
            };
            treemap.refresh();
        });
        it('Tooltip fill color', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('fill')).toBe('#000000');
            };            
            treemap.refresh();
        });
        it('default Tooltip opacity ', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_path');
                expect(tooltipElement.getAttribute('opacity')).toBe('1');
            };            
            treemap.refresh();
        });
        it('theme Tooltip font', () => {
            treemap.loaded = (args: ILoadedEventArgs): void => {
                element = document.getElementById('container_Level_Index_1_Item_Index_10_RectPath');
                debugger;
                trigger.mousemoveEvent(element, 15,166,100,159);
                tooltipElement = document.getElementById('container_TreeMapTooltip_text');
                expect(tooltipElement.querySelector('tspan').getAttribute('fill')).toBe('#FFFFFF');
            };
            treemap.refresh();
        });
    });
});
