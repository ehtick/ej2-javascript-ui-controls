import { Sparkline, SparklineTooltip } from '../../src/sparkline/index';
import { createElement } from '@syncfusion/ej2-base';
import { removeElement, getIdElement, TextOption } from '../../src/sparkline/utils/helper';
import { ISparklineLoadedEventArgs, ISparklineResizeEventArgs } from '../../src/sparkline/model/interface';
import  {profile , inMB, getMemoryProfile} from '../common.spec';
import { DataManager } from '@syncfusion/ej2-data';
import { MouseEvents } from '../../spec/chart/base/events.spec';
Sparkline.Inject(SparklineTooltip);
/**
 * Sparkline Test case file
 */

describe('Sparkline Component Base Spec', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('Sparkline Testing spec', () => {
        let element: Element;
        let sparkline: Sparkline;
        let id: string = 'spark-container';
        let ele: Element;
        let d: string[];
        let dataManager: DataManager = new DataManager({
            url: 'https://ej2services.syncfusion.com/production/web-services/api/Orders'
        });
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '400px';
            (element as HTMLDivElement).style.height = '100px';
            document.body.appendChild(element);
            sparkline = new Sparkline({
                height: '40%',
                width: '20%',
                containerArea: {
                    background: 'green',
                    border: { color: 'yellow', width: 3},
                },
                tooltipSettings: { visible: true }
            });
        });
        afterAll(() => {
            sparkline.destroy();
            sparkline.sparklineResize();
            removeElement(id);
        });
        it('Sparkline height and width percentage checking', () => {
            sparkline.loaded = () => {
                ele = getIdElement(id + '_SparklineBorder');
                d = ele.getAttribute('d').split(' ');
                let x: number = Number(d[1]);
                let y: number = Number(d[2]);
                let width: number = Number(d[9]) - x;
                let height: number = Number(d[18]) - y;
                expect(x).toBe(1.5);
                expect(y).toBe(1.5);
                expect(width).toBe(77);
                expect(height).toBe(37);
                removeElement('nothing');
            };
            sparkline.appendTo('#' + id);
        });
        it('Sparkline background and border checking', () => {
            let fill: string = ele.getAttribute('fill');
            expect(fill).toBe('#FFFFFF');
            let stroke: string = ele.getAttribute('stroke');
            expect(stroke).toBe('yellow');
            let strwid: string = ele.getAttribute('stroke-width');
            expect(strwid).toBe('3');
        });
        it('Sparkline height and width pixel checking', () => {
            sparkline.loaded = () => {
                ele = getIdElement(id + '_SparklineBorder');
                d = ele.getAttribute('d').split(' ');
                let x: number = Number(d[1]);
                let y: number = Number(d[2]);
                let width: number = Number(d[9]) - x;
                let height: number = Number(d[18]) - y;
                expect(x).toBe(1.5);
                expect(y).toBe(1.5);
                expect(width).toBe(117);
                expect(height).toBe(57);
            };
            sparkline.height = '60px';
            sparkline.width = '120px';
            sparkline.refresh();
        });
        it('Sparkline height and width default checking', () => {
            sparkline.loaded = () => {
                ele = getIdElement(id + '_SparklineBorder');
                d = ele.getAttribute('d').split(' ');
                let x: number = Number(d[1]);
                let y: number = Number(d[2]);
                let width: number = Number(d[9]) - x;
                let height: number = Number(d[18]) - y;
                expect(x).toBe(1.5);
                expect(y).toBe(1.5);
                expect(width).toBe(397);
                expect(height).toBe(97);
            };
            sparkline.height = null;
            sparkline.width = null;
            sparkline.refresh();
        });
        it('Sparkline tooltip module checking', () => {
            sparkline.sparklineRenderer.processData();
            expect(sparkline.sparklineTooltipModule).not.toBe(null);
            expect(sparkline.sparklineTooltipModule).not.toBe(undefined);
        });
        it('Sparkline tooltip module checking', () => {
            sparkline.dataSource = dataManager;
            sparkline.sparklineRenderer.processDataManager();
        });
    });
    describe('Sparkline other scenario spec', () => {
        let element: Element;
        let sparkline: Sparkline;
        let id: string = 'spark-container';
        let ele: Element;
        let d: string[];
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '400px';
            (element as HTMLDivElement).style.height = '100px';
            document.body.appendChild(element);
            sparkline = new Sparkline({
                containerArea: {
                    background: 'blue',
                    border: { color: 'orange', width: 1},
                },
                dataSource: [
                    {xDate: new Date(2017, 1, 1), yval: 2900 },
                    {xDate: new Date(2017, 1, 2), yval: 3900 },
                    {xDate: new Date(2017, 1, 3), yval: 3500 },
                    {xDate: new Date(2017, 1, 4), yval: 3800 },
                    {xDate: new Date(2017, 1, 5), yval: 2500 },
                    {xDate: new Date(2017, 1, 6), yval: 3200 }
                ], yName: 'yval',
            });
        });
        afterAll(() => {
            sparkline.destroy();
            removeElement(id);
        });
        it('Sparkline height and width parent size checking', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                ele = getIdElement(id + '_SparklineBorder');
                d = ele.getAttribute('d').split(' ');
                let x: number = Number(d[1]);
                let y: number = Number(d[2]);
                let width: number = Number(d[9]) - x;
                let height: number = Number(d[18]) - y;
                expect(x).toBe(0.5);
                expect(y).toBe(0.5);
                expect(width).toBe(399);
                expect(height).toBe(99);
                args.sparkline.loaded = null;
            };
            sparkline.appendTo('#' + id);
            sparkline.getPersistData();
        });
        it('Sparkline value type Category and series type Pie coverage', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Category');
                expect(args.sparkline.type).toBe('Pie');
            };
            sparkline.valueType = 'Category';
            sparkline.type = 'Pie';
            sparkline.refresh();
        });
        it('Sparkline value type DateTime and series type WinLoss coverage', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('DateTime');
                expect(args.sparkline.type).toBe('WinLoss');
            };
            sparkline.valueType = 'DateTime';
            sparkline.type = 'WinLoss';
            sparkline.xName = 'xDate';
            sparkline.refresh();
        });
        it('Sparkline value type Numeric and series type Pie coverage array data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('Pie');
            };
            sparkline.valueType = 'Numeric';
            sparkline.type = 'Pie';
            sparkline.dataSource = [5, 6, 7, 8, 3];
            sparkline.refresh();
        });
        it('Sparkline value type Numeric and series type Column coverage array data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('Column');
            };
            sparkline.valueType = 'Numeric';
            sparkline.type = 'Column';
            sparkline.dataSource = [1, 0, 1, -1, 0, -1, 1];
            sparkline.refresh();
        });
        it('Sparkline single array data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('Column');
            };
            sparkline.dataSource = [5];
            sparkline.refresh();
        });
        it('Sparkline Column array minus data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('Column');
            };
            sparkline.dataSource = [-5, -4, -7, -9];
            sparkline.refresh();
        });
        it('Sparkline WinLoss array minus data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('WinLoss');
            };
            sparkline.type = 'WinLoss';
            sparkline.refresh();
        });
        it('Sparkline WinLoss array tristate data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('WinLoss');
            };
            sparkline.dataSource = [-5, -4, 0, 7, -9];
            sparkline.refresh();
        });
        it('Sparkline Line with single data', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                expect(args.sparkline.valueType).toBe('Numeric');
                expect(args.sparkline.type).toBe('Line');
                new TextOption('sdad', 0, 0, 'middle', 'coverage', 'middle', 'translate(90, 0)');
            };
            sparkline.dataSource = [5];
            sparkline.type = 'Line';
            sparkline.refresh();
        });
        it('Sparkline resize event checking', (done: Function) => {
            sparkline.sparklineResize();
            sparkline.resize = (args: ISparklineResizeEventArgs) => {
                expect(args.name).toBe('resize');
                sparkline.resize = null;
                done();
            };
            sparkline.sparklineResize();
        });
        it('Checking sparkline tab index and actual index', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                let element: any = getIdElement(id);
                args.sparkline.getActualIndex(1, 2);
                args.sparkline.getActualIndex(0, 0);
                args.sparkline.setTabIndex(element, element);
                let keyElement = document.getElementById(id + 'Keyboard_sparkline_focus');
                if (keyElement) { keyElement.remove(); }
                args.sparkline.destroy();
                let trigger: MouseEvents = new MouseEvents();
                let events: any = <KeyboardEvent>trigger.onTouchEnd(element, 100, 100, 100, 100, 100, 100);
                events.code = 'Enter';
                args.sparkline.chartKeyUp(events);
                expect(element !== null).toBe(true);
            };
            sparkline.refresh();
        });
        it('Checking sparkline chartKeyDown', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = null;
                let element: any = getIdElement(id);
                args.sparkline.getActualIndex(-1, 10);
                args.sparkline.getActualIndex(-50, 25);
                args.sparkline.setTabIndex(null, null);
                let keyElement = document.getElementById(id + 'Keyboard_sparkline_focus');
                if (keyElement) { keyElement.remove(); }
                args.sparkline.destroy();
                let trigger: MouseEvents = new MouseEvents();
                let events: any = <KeyboardEvent>trigger.onTouchEnd(element, 100, 100, 100, 100, 100, 100);
                events.code = 'Tab';
                args.sparkline.chartKeyDown(events);
                expect(element !== null).toBe(true);
            };
            sparkline.refresh();
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