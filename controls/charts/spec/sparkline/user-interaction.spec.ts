/**
 * Sparkline Column WinLoss Series Spec
 */
import { Sparkline, ISparklineLoadedEventArgs, SparklineTooltip } from '../../src/sparkline/index';
import { removeElement, getIdElement, Rect } from '../../src/sparkline/utils/helper';
import { EmitType, createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import  {profile , inMB, getMemoryProfile} from '../common.spec';
import { MouseEvents } from './events.spec';
import { ILoadedEventArgs } from '../../src';
Sparkline.Inject(SparklineTooltip);
describe('Sparkline tooltip and tracker checking Spec', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('Sparkline tracker Spec', () => {
        let trigger: MouseEvents = new MouseEvents();
        let element: Element;
        let sparkline: Sparkline;
        let id: string = 'sparks';
        let ele: Element;
        let rect: Rect;
        let d: string[];
        beforeAll(() => {
            element = createElement('div', { id: id });
            document.body.appendChild(element);
            sparkline = new Sparkline({
                width: '400', height: '100',
                type: 'Column',
                fill: '#5af02c',
                dataSource: [
                    { id: 10, value: 50 },
                    { id: 20, value: 30 },
                    { id: 30, value: -40 },
                    { id: 40, value: 10 },
                    { id: 50, value: -60 },
                    { id: 60, value: 20 },
                    { id: 70, value: 70 },
                    { id: 80, value: -55 },
                    { id: 90, value: 80 },
                    { id: 100, value: 45 }
                ], yName: 'value', xName: 'id',
                tooltipSettings: {
                    trackLineSettings: {
                        visible: true,
                        color: 'red', width: 2
                    }
                }
            });
        });
        afterAll(() => {
            sparkline.destroy();
            removeElement(id);
        });
        it('Sparkline tracker line checking', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = () => { /* null function */ };
                ele = getIdElement(id + '_sparkline_column_1');
                trigger.mousemoveEvent(ele, 0, 0, 30, 30);
                ele = getIdElement(id + '_sparkline_tracker');
                let path: string[] = ele.getAttribute('d').split(' ');
                expect(path[1]).toBe('24.5');
                expect(path[2]).toBe('5');
                expect(path[4]).toBe('24.5');
                expect(path[5]).toBe('95');
                expect(ele.getAttribute('fill')).toBe('#000000');
                expect(ele.getAttribute('stroke')).toBe('#000000');
                expect(ele.getAttribute('stroke-width')).toBe('2');
            };
            sparkline.appendTo('#' + id);
        });
        it('Sparkline tracker line move to other point checking', () => {
            ele = getIdElement(id);
            trigger.mousemoveEvent(ele, 0, 0, 80, 30);
            ele = getIdElement(id + '_sparkline_tracker');
            let path: string[] = ele.getAttribute('d').split(' ');
            expect(path[1]).toBe('63.5');
            expect(path[2]).toBe('5');
            expect(path[4]).toBe('63.5');
            expect(path[5]).toBe('95');
            expect(ele.getAttribute('fill')).toBe('#000000');
            expect(ele.getAttribute('stroke')).toBe('#000000');
            expect(ele.getAttribute('stroke-width')).toBe('2');
        });
        it('Sparkline tracker line move to other point checking', () => {
            ele = getIdElement(id);
            trigger.mousemoveEvent(ele, 0, 0, 200, 30);
            ele = getIdElement(id + '_sparkline_tracker');
            let path: string[] = ele.getAttribute('d').split(' ');
            expect(path[1]).toBe('180.5');
            expect(path[2]).toBe('5');
            expect(path[4]).toBe('180.5');
            expect(path[5]).toBe('95');
            expect(ele.getAttribute('fill')).toBe('#000000');
            expect(ele.getAttribute('stroke')).toBe('#000000');
            expect(ele.getAttribute('stroke-width')).toBe('2');
        });
        it('Sparkline tracker line move out of container checking', () => {
            ele = getIdElement(id);
            trigger.mouseLeaveEvent(ele);
            ele = getIdElement(id + '_sparkline_tracker');
            expect(isNullOrUndefined(ele)).toBe(true);
        });
        it('Sparkline tracker line visible false checking', () => {
            sparkline.tooltipSettings.trackLineSettings.visible = false;
            sparkline.dataBind();
            ele = getIdElement(id);
            trigger.mousemoveEvent(ele, 0, 0, 200, 30);
            ele = getIdElement(id + '_sparkline_tracker');
            expect(isNullOrUndefined(ele)).toBe(true);
            ele = getIdElement(id);
            trigger.mouseLeaveEvent(ele);
            sparkline.sparklineTooltipModule['removeTracker']();
        });
    });
    describe('Sparkline tooltip Spec', () => {
        let trigger: MouseEvents = new MouseEvents();
        let element: Element;
        let sparkline: Sparkline;
        let id: string = 'sparks';
        let ele: Element;
        let rect: Rect;
        let d: string[];
        let loaded: EmitType<ILoadedEventArgs>;
        beforeAll(() => {
            element = createElement('div', { id: id });
            document.body.appendChild(element);
            sparkline = new Sparkline({
                width: '600', height: '300',
                type: 'Column',
                fill: '#5af02c',
                markerSettings: {
                    visible: ['All']
                },
                dataSource: [
                    { id: 10, value: 50 },
                    { id: 20, value: 30 },
                    { id: 30, value: -40 },
                    { id: 40, value: 10 },
                    { id: 50, value: -60 },
                    { id: 60, value: 20 },
                    { id: 70, value: 70 },
                    { id: 80, value: -55 },
                    { id: 90, value: 80 },
                    { id: 100, value: 45 }
                ], yName: 'value', xName: 'id',
                tooltipSettings: {
                    visible: true,
                    trackLineSettings: {
                        visible: true,
                    },
                    textStyle : {
                        color: 'white'
                    },
                    fill: 'transparent'
                }
            });
        });
        afterAll(() => {
            sparkline.destroy();
            removeElement(id);
        });
        it('Sparkline tracker line checking', () => {
            sparkline.loaded = (args: ISparklineLoadedEventArgs) => {
                args.sparkline.loaded = () => { /* null function */ };
                ele = getIdElement(id + '_sparkline_column_1');
                trigger.mousemoveEvent(ele, 0, 0, 30, 30);
                ele = getIdElement(id + '_sparkline_tooltip_div_text');
                expect(ele.firstChild.textContent).toBe('50');
                expect(ele.lastChild.textContent).toBe('50');
                ele = getIdElement(id + '_sparkline_tracker');
                expect(ele.getAttribute('fill')).toBe('#000000');
                expect(ele.getAttribute('stroke')).toBe('#000000');
                expect(ele.getAttribute('stroke-width')).toBe('1');
            };
            sparkline.appendTo('#' + id);
        });
        it('chart tooltip format checking with keyboard navigation', function (done) {
            sparkline.loaded = function (args) {
                ele = document.getElementById(id + '_sparkline_column_1');
                trigger.keyboardEvent(ele, 'keydown', 'Space', 'Space');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowUp', 'ArrowUp');
                trigger.keyboardEvent(ele, 'keydown', 'Escape', 'Escape');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowDown', 'ArrowDown');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowLeft', 'ArrowLeft');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowRight', 'ArrowRight');
                trigger.keyboardEvent(ele, 'keyup', 'Tab', 'Tab');
                expect(ele !== null).toBe(true);
                done();
            };
            sparkline.refresh();
        });
        it('Sparkline tooltip moving same point checking', () => {
            sparkline.markerSettings.visible = [];
            sparkline.dataBind();
            ele = getIdElement(id + '_sparkline_column_1');
            trigger.mousemoveEvent(ele, 0, 0, 30, 20);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(ele.firstChild.textContent).toBe('50');
            expect(ele.lastChild.textContent).toBe('50');
        });
        it('Sparkline tooltip moving other point checking', () => {
            ele = getIdElement(id + '_sparkline_column_6');
            trigger.mousemoveEvent(ele, 0, 0, 400, 50);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(ele.firstChild.textContent).toBe('70');
            expect(ele.lastChild.textContent).toBe('70');
        });
        it('Sparkline tooltip moving negative point checking', () => {
            ele = getIdElement(id + '_sparkline_column_7');
            trigger.mousemoveEvent(ele, 0, 0, 470, 150);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(ele.firstChild.textContent).toBe('-55');
            expect(ele.lastChild.textContent).toBe('-55');
            ele = getIdElement(id);
            trigger.mouseLeaveEvent(ele);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(isNullOrUndefined(ele)).toBe(true);
        });
        it('Sparkline tooltip moving for pie series checking', () => {
            sparkline.type = 'Pie';
            sparkline.format = 'c0';
            sparkline.useGroupingSeparator = false;
            sparkline.dataBind();
            ele = getIdElement(id + '_sparkline_pie_4');
            trigger.mousemoveEvent(ele, 0, 0, 400, 150);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(ele.firstChild.textContent).toBe('-$60');
            expect(ele.lastChild.textContent).toBe('-$60');
            ele = getIdElement(id + '_sparkline_pie_4');
            trigger.mouseupEvent(ele, 400, 150, 400, 150);
        });
        it('Sparkline tooltip moving for not valid pie point checking', () => {
            ele = getIdElement(id);
            trigger.mousemoveEvent(ele, 0, 0, 400, 150);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(isNullOrUndefined(ele)).toBe(true);
        });
        it('Sparkline tooltip format checking', () => {
            sparkline.tooltipSettings.format = '${id} : ${value}$';
            sparkline.format = null;
            sparkline.dataBind();
            ele = getIdElement(id + '_sparkline_pie_4');
            trigger.mousemoveEvent(ele, 0, 0, 400, 150);
            ele = getIdElement(id + '_sparkline_tooltip_div_text');
            expect(ele.firstChild.textContent).toBe('50 ');
            expect(ele.lastChild.textContent).toBe(' -60$');
        });
        it('Sparkline tooltip template checking', () => {
            sparkline.tooltipSettings.template = '<div style="border: 2px solid green;background: #a0e99680">${id}<br>${value}$</div>';
            sparkline.dataBind();
            ele = getIdElement(id + '_sparkline_pie_4');
            sparkline.isTouch = true;
            sparkline.mouseX = 400;
            sparkline.mouseY = 150;
            sparkline.sparklineTooltipModule['mouseUpHandler']({ target: ele} as any);
            ele = getIdElement(id + '_sparkline_tooltip_divparent_template');
            expect(ele.textContent).toBe('50-60$');
            ele = getIdElement(id + '_sparkline_tooltip_div');
            expect(ele.children[0].innerHTML.indexOf('<div style="border: 2px solid green;background: #a0e99680">50<br>-60$</div>') > -1).toBe(true);
        });
        it('chart series marker checking with keyboard navigation', function (done) {
            sparkline.loaded = function (args) {
                ele = document.getElementById(id + '_sparkline_line');
                trigger.keyboardEvent(ele, 'keydown', 'Space', 'Space');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowUp', 'ArrowUp');
                trigger.keyboardEvent(ele, 'keydown', 'Escape', 'Escape');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowDown', 'ArrowDown');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowLeft', 'ArrowLeft');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowRight', 'ArrowRight');
                trigger.keyboardEvent(ele, 'keyup', 'Tab', 'Tab');
                expect(ele !== null).toBe(true);
                done();
            };
            sparkline.height= '200px';
            sparkline.width='350px';
            sparkline.type = 'Line';
            sparkline.markerSettings.visible = ['All'];
            sparkline.tooltipSettings.visible = false;
            sparkline.refresh();
        });
        it('chart windloss checking with keyboard navigation', function (done) {
            sparkline.loaded = function (args) {
                ele = document.getElementById(id + '_sparkline_winloss_0');
                trigger.keyboardEvent(ele, 'keydown', 'Space', 'Space');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowUp', 'ArrowUp');
                trigger.keyboardEvent(ele, 'keydown', 'Escape', 'Escape');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowDown', 'ArrowDown');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowLeft', 'ArrowLeft');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowRight', 'ArrowRight');
                trigger.keyboardEvent(ele, 'keyup', 'Tab', 'Tab');
                expect(ele !== null).toBe(true);
                done();
            };
            sparkline.height= '200px';
            sparkline.width='350px';
            sparkline.type = 'WinLoss';
            sparkline.tooltipSettings.visible = false;
            sparkline.refresh();
        });
        it('chart pie series checking with keyboard navigation', function (done) {
            sparkline.loaded = function (args) {
                ele = document.getElementById(id + '_sparkline_pie_0');
                trigger.keyboardEvent(ele, 'keydown', 'Space', 'Space');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowUp', 'ArrowUp');
                trigger.keyboardEvent(ele, 'keydown', 'Escape', 'Escape');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowDown', 'ArrowDown');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowLeft', 'ArrowLeft');
                trigger.keyboardEvent(ele, 'keyup', 'ArrowRight', 'ArrowRight');
                trigger.keyboardEvent(ele, 'keyup', 'Tab', 'Tab');
                expect(ele !== null).toBe(true);
                done();
            };
            sparkline.height= '200px';
            sparkline.width='350px';
            sparkline.type = 'Pie';
            sparkline.tooltipSettings.visible = false;
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