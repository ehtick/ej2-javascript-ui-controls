/**
 * Chart spec document
 */

import { createElement } from '@syncfusion/ej2-base';
import { ColumnSeries3D } from '../../../src/chart3d/series/column-series';
import { Category3D } from '../../../src/chart3d/axis/category-axis';
import { DateTime3D } from '../../../src/chart3d/axis/date-time-axis';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { EmitType } from '@syncfusion/ej2-base';
import { Logarithmic3D } from '../../../src/chart3d/axis/logarithmic-axis';
import { Chart3D } from '../../../src/chart3d/chart3D';
import { getMemoryProfile, inMB, profile } from '../../common.spec';
import { DateTimeCategory3D } from '../../../src/chart3d/axis/date-time-category-axis';
import { datetimeData } from '../../chart/base/data.spec';
import { Chart3DLoadedEventArgs } from '../../../src/chart3d/model/chart3d-Interface';
Chart3D.Inject(Category3D, ColumnSeries3D, DateTime3D, Logarithmic3D, DateTimeCategory3D);



describe('Chart Control', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    let ele: HTMLElement;
    let svg: HTMLElement;
    let text: HTMLElement;
    let Position: string[];
    let loaded: EmitType<Chart3DLoadedEventArgs>;
    describe(' Date time category Axis Behavior', () => {
        let chartObj: Chart3D;
        beforeAll((): void => {
            ele = createElement('div', { id: 'chartContainer' });
            document.body.appendChild(ele);
            chartObj = new Chart3D(
                {
                    primaryXAxis: { valueType: 'DateTimeCategory' },
                    loaded: loaded, legendSettings: { visible: true }
                }
            ); chartObj.appendTo('#chartContainer');
        });

        afterAll((): void => {
            chartObj.destroy();
            ele.remove();
        });
        it('Checking bottom wall brushes', (done: Function) => {
            loaded = (args: Object): void => {
                let axis = document.getElementById('chartContainer-svg-2-bottom-wall-brush');
                expect(parseFloat(axis.getAttribute('d').split(' ')[5]) === parseFloat(axis.getAttribute('d').split(' ')[2])).toBe(true);
                axis = document.getElementById('chartContainer-svg-1-bottom-wall-brush-back');
                expect(parseFloat(axis.getAttribute('d').split(' ')[5]) === parseFloat(axis.getAttribute('d').split(' ')[2])).toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.refresh();
        });
        it('Checking left wall brushes', (done: Function) => {
            loaded = (args: Object): void => {
                let axis = document.getElementById('chartContainer-svg-1-left-wall-brush-back');
                expect(parseFloat(axis.getAttribute('d').split(' ')[5]) === parseFloat(axis.getAttribute('d').split(' ')[2])).toBe(true);
                axis = document.getElementById('chartContainer-svg-0-left-wall-brush-back');
                expect(parseFloat(axis.getAttribute('d').split(' ')[5]) === parseFloat(axis.getAttribute('d').split(' ')[2])).toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.refresh();
        });
        it('Checking Xaxis title default position', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-0');
                expect(parseInt(area.getAttribute('y'))).toBe(438);
                expect(parseInt(area.getAttribute('x'))).toBe(396);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryXAxis.title = 'Xaxis';
            chartObj.refresh();
        });
        it('Checking Yaxis title default position', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-1');
                expect(parseInt(area.getAttribute('y'))).toBe(208);
                expect(parseInt(area.getAttribute('x'))).toBe(23);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryYAxis.title = 'Yaxis';
            chartObj.refresh();
        });
        it('Checking Xaxis title default styles', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-0');
                expect(area.getAttribute('font-size') == '16px').toBe(true);
                expect(area.getAttribute('font-weight') == '700').toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.refresh();
        });
        it('Checking Yaxis title default styles', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-1');
                expect(area.getAttribute('font-size') == '16px').toBe(true);
                expect(area.getAttribute('font-weight') == '700').toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.refresh();
        });
        it('Checking Yaxis label default positions', (done: Function) => {
            loaded = (args: Object): void => {
                let label = document.getElementById('chartContainer-1-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(52);
                expect(parseInt(label.getAttribute('y'))).toBe(407);
                label = document.getElementById('chartContainer-1-axis-label-1');
                expect(parseInt(label.getAttribute('x'))).toBe(52);
                expect(parseInt(label.getAttribute('y'))).toBe(372);
                label = document.getElementById('chartContainer-1-axis-label-2');
                expect(parseInt(label.getAttribute('x'))).toBe(52);
                expect(parseInt(label.getAttribute('y'))).toBe(336);
                label = document.getElementById('chartContainer-1-axis-label-3');
                expect(parseInt(label.getAttribute('y'))).toBe(300);
                label = document.getElementById('chartContainer-1-axis-label-4');
                expect(parseInt(label.getAttribute('x'))).toBe(52);
                expect(parseInt(label.getAttribute('y'))).toBe(265);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.refresh();
        });
        it('Checking Xaxis title Rotation', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-0');
                expect(area.getAttribute('transform')).toBe('rotate(90,408.0363214837712,428.86652941460585)');
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryXAxis.title = 'Xaxis';
            chartObj.primaryXAxis.titleRotation = 90;
            chartObj.refresh();
        });
        it('Checking Yaxis title Rotation', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-1');
                expect(area.getAttribute('transform')).toBe('rotate(90,13.802936630602783,198.89705491692425)');
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryYAxis.title = 'Yaxis';
            chartObj.primaryYAxis.titleRotation = 90;
            chartObj.refresh();
        });
        it('Checking Xaxis title custom styles', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-0');
                expect(area.getAttribute('font-size') == '20').toBe(true);
                expect(area.getAttribute('font-weight') == '900').toBe(true);
                expect(area.getAttribute('font-family') == 'Cusive').toBe(true);
                expect(area.getAttribute('font-style') == 'Italic').toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryXAxis.titleStyle.fontFamily = 'Cusive';
            chartObj.primaryXAxis.titleStyle.fontWeight = '900';
            chartObj.primaryXAxis.titleStyle.fontStyle = 'Italic';
            chartObj.primaryXAxis.titleStyle.size = '20';
            chartObj.primaryXAxis.title = 'Xaxis';
            chartObj.refresh();
        });
        it('Checking Yaxis title custom styles', (done: Function) => {
            loaded = (args: Object): void => {
                let area: HTMLElement = document.getElementById('chartContainer-svg-axis-title-1');
                expect(area.getAttribute('font-size') == '20').toBe(true);
                expect(area.getAttribute('font-weight') == '900').toBe(true);
                expect(area.getAttribute('font-family') == 'Cusive').toBe(true);
                expect(area.getAttribute('font-style') == 'Italic').toBe(true);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryYAxis.titleStyle.fontFamily = 'Cusive';
            chartObj.primaryYAxis.titleStyle.fontWeight = '900';
            chartObj.primaryYAxis.titleStyle.fontStyle = 'Italic';
            chartObj.primaryYAxis.titleStyle.size = '20';
            chartObj.primaryYAxis.title = 'Yaxis';
            chartObj.refresh();
        });
        it('Checking Yaxis label rotation', (done: Function) => {
            loaded = (args: Object): void => {
                let label = document.getElementById('chartContainer-1-axis-label-0');
                expect(label.getAttribute('transform')).toBe('rotate(45,66.76563808317346,377.98608964451313)');
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryYAxis.labelRotation = 45;
            chartObj.refresh();
        });
        it('Checking secondary Xaxis position opposite', (done: Function) => {
            loaded = (args: Object): void => {
                let label = document.getElementById('chartContainer-2-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(746);
                expect(parseInt(label.getAttribute('y'))).toBe(377);
                done();
            };
            chartObj.loaded = loaded;
            chartObj.primaryXAxis.labelRotation = 45;
            chartObj.axes = [{
                opposedPosition: true,
                name: 'Yaxis'
            }];
            chartObj.series[0].yAxisName = 'Yaxis'
            chartObj.refresh();
        });
        it('checking minor gridlines', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let tick: Element = document.getElementById('chartContainer-1-grid-lines-3');
                expect(tick.getBoundingClientRect().top == 304.3954162597656 || tick.getBoundingClientRect().top == 282.6441955566406).toBe(true);
                done();
            };
            chartObj.primaryXAxis.minorTicksPerInterval = 1;
            chartObj.primaryXAxis.minorTickLines.width = 8;
            chartObj.primaryXAxis.minorGridLines.width = 8;
        });
        it('checking first grid lines', (done: Function) => {
            chartObj.loaded = () => {
                let gridLineElement: Element = document.getElementById('chartContainer-1-grid-lines-0');
                let path: string = gridLineElement.getAttribute("x1");
                let path1: string = gridLineElement.getAttribute("y1");
                let path2: string = gridLineElement.getAttribute("x2");
                let path3: string = gridLineElement.getAttribute("y2");
                expect(path === "85.24346257889991" || path === "84.74943046171867").toBe(true);
                expect(path1 === "24.34625788999098" || path1 === "369.20454545454544").toBe(true);
                expect(path2 === "85.24346257889991" || path2 === "714.9884500745156").toBe(true);
                expect(path3 === "403.2551848512173" || path3 === "369.20454545454544").toBe(true);
                done();
            }
            chartObj.refresh();
        });
        it('checking intervaltype as years', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(234);
                expect(label.textContent === "Jul 2000").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(236);
                expect(label.textContent === "Apr 2010").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Years', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF', animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.enableSideBySidePlacement =  false,
                chartObj.refresh();
        });
        it('checking invervaltype as days', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(235);
                expect(label.textContent === "7/11/2000").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(233);
                expect(label.textContent === "4/8/2010").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Days', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as hours', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(234);
                expect(label.textContent === "Tue 00:00").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(234);
                expect(label.textContent === "Thu 00:00").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Hours', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as minutes', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === "00:00:00").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === "00:00:00").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Minutes', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as seconds', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Seconds', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as auto', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(234);
                expect(label.textContent === "Jul 2000").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(236);
                expect(label.textContent === "Apr 2010").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Auto', valueType: 'DateTimeCategory', rangePadding: 'Round'
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF', animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking intervaltype as years with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(131);
                expect(parseInt(label.getAttribute('y'))).toBe(234);
                expect(label.textContent === "Jul 2000").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-5');
                expect(parseInt(label.getAttribute('x'))).toBe(680);
                expect(parseInt(label.getAttribute('y'))).toBe(236);
                expect(label.textContent === "Apr 2010").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Years', valueType: 'DateTimeCategory', interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as days with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(186);
                expect(parseInt(label.getAttribute('y'))).toBe(233);
                expect(label.textContent === "4/7/2002").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Days', valueType: 'DateTimeCategory',
                minimum: 1, maximum: 3, interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as hours with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(186);
                expect(parseInt(label.getAttribute('y'))).toBe(235);
                label = document.getElementById('chartContainer-0-axis-label-2');
                expect(parseInt(label.getAttribute('x'))).toBe(625);
                expect(parseInt(label.getAttribute('y'))).toBe(235);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Hours', valueType: 'DateTimeCategory',
                minimum: 1, maximum: 3, interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as minutes with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(186);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === "00:00:00").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Minutes', valueType: 'DateTimeCategory',
                minimum: 1, maximum: 3, interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as seconds with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(186);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === "00:00:00").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-2');
                expect(parseInt(label.getAttribute('x'))).toBe(625);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === "00:00:00").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Seconds', valueType: 'DateTimeCategory',
                minimum: 1, maximum: 3, interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF', animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('checking invervaltype as auto with interval', (done: Function) => {
            chartObj.loaded = () => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(186);
                expect(parseInt(label.getAttribute('y'))).toBe(236);
                expect(label.textContent === "Apr 2002").toBe(true);
                label = document.getElementById('chartContainer-0-axis-label-2');
                expect(parseInt(label.getAttribute('x'))).toBe(625);
                expect(parseInt(label.getAttribute('y'))).toBe(236);
                expect(label.textContent === "Apr 2006").toBe(true);
                done();
            }
            chartObj.primaryXAxis = {
                title: 'Sales Across Years', intervalType: 'Auto', valueType: 'DateTimeCategory',
                minimum: 1, maximum: 3, interval: 1
            },
                chartObj.primaryYAxis = { title: 'Sales Amount in millions(USD)', rangePadding: 'Round' },
                chartObj.series = [
                    {
                        name: 'series1', type: 'Column', fill: '#ACE5FF',  animation: { enable: false },
                        dataSource: datetimeData, xName: 'x', yName: 'y'
                    },
                ],
                chartObj.refresh();
        });
        it('Checking inverval type as hours with date data', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(183);
                expect(parseInt(label.getAttribute('y'))).toBe(235);
                expect(label.textContent === 'Tue 00:30').toBe(true);
                done();
            };
            chartObj.primaryXAxis = {
                valueType: 'DateTimeCategory',
                intervalType: 'Hours'
            };
            chartObj.series[0].type = 'Column';
            chartObj.series[0].dataSource = [
                { x: '9/5/2023 11:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 12:30:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 1:45:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 2:00:00 AM', y: 72.80000305175781, },
                { x: '9/5/2023 3:15:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 4:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 5:45:00 AM', y: 72.69999694824219, },
                { x: '9/5/2023 6:00:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 7:15:00 AM', y: 72.5, },
                { x: '9/5/2023 8:30:00 AM', y: 72.4000015258789, },
            ];
            chartObj.series[0].xName = 'x'; 
            chartObj.series[0].yName= 'y';
            chartObj.refresh();
        });
        it('Checking inverval type as Months with date data', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let label: Element = document.getElementById('chartContainer-1-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(65);
                expect(parseInt(label.getAttribute('y'))).toBe(200);
                expect(label.textContent === '0').toBe(true);
                done();
            };
            chartObj.primaryXAxis = {
                valueType: 'DateTimeCategory',
                intervalType: 'Months',
            };
            chartObj.series[0].type = 'Column';
            chartObj.series[0].dataSource = [
                { x: '9/5/2023 11:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 12:30:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 1:45:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 2:00:00 AM', y: 72.80000305175781, },
                { x: '9/5/2023 3:15:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 4:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 5:45:00 AM', y: 72.69999694824219, },
                { x: '9/5/2023 6:00:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 7:15:00 AM', y: 72.5, },
                { x: '9/5/2023 8:30:00 AM', y: 72.4000015258789, },
            ];
            chartObj.series[0].xName = 'x'; 
            chartObj.series[0].yName= 'y';
            chartObj.refresh();
        });
        it('Checking inverval type as Days with date data', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let label: Element = document.getElementById('chartContainer-1-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(65);
                expect(parseInt(label.getAttribute('y'))).toBe(200);
                expect(label.textContent === '0').toBe(true);
                done();
            };
            chartObj.primaryXAxis = {
                valueType: 'DateTimeCategory',
                intervalType: 'Days',
            };
            chartObj.series[0].type = 'Column';
            chartObj.series[0].dataSource = [
                { x: '9/5/2023 11:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 12:30:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 1:45:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 2:00:00 AM', y: 72.80000305175781, },
                { x: '9/5/2023 3:15:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 4:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 5:45:00 AM', y: 72.69999694824219, },
                { x: '9/5/2023 6:00:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 7:15:00 AM', y: 72.5, },
                { x: '9/5/2023 8:30:00 AM', y: 72.4000015258789, },
            ];
            chartObj.series[0].xName = 'x'; 
            chartObj.series[0].yName= 'y';
            chartObj.refresh();
        });
        it('Checking inverval type as Minutes with date data', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(183);
                expect(parseInt(label.getAttribute('y'))).toBe(237);
                expect(label.textContent === '00:15:00' || label.textContent === '00:30:00').toBe(true);
                done();
            };
            chartObj.primaryXAxis = {
                valueType: 'DateTimeCategory',
                intervalType: 'Minutes',
            };
            chartObj.series[0].type = 'Column';
            chartObj.series[0].dataSource = [
                { x: '9/5/2023 11:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 12:30:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 1:45:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 2:00:00 AM', y: 72.80000305175781, },
                { x: '9/5/2023 3:15:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 4:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 5:45:00 AM', y: 72.69999694824219, },
                { x: '9/5/2023 6:00:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 7:15:00 AM', y: 72.5, },
                { x: '9/5/2023 8:30:00 AM', y: 72.4000015258789, },
            ];
            chartObj.series[0].xName = 'x'; 
            chartObj.series[0].yName= 'y';
            chartObj.refresh();
        });
        it('Checking inverval type as seconds with date data skeleton', (done: Function) => {
            chartObj.loaded = (args: Object): void => {
                let label: Element = document.getElementById('chartContainer-0-axis-label-0');
                expect(parseInt(label.getAttribute('x'))).toBe(183);
                expect(parseInt(label.getAttribute('y'))).toBe(242);
                expect(label.textContent === '5 Tue').toBe(true);
                done();
            };
            chartObj.primaryXAxis = {
                valueType: 'DateTimeCategory',
                intervalType: 'Seconds',
                skeleton: 'Ed'
            };
            chartObj.series[0].type = 'Column';
            chartObj.series[0].dataSource = [
                { x: '9/5/2023 11:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 12:30:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 1:45:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 2:00:00 AM', y: 72.80000305175781, },
                { x: '9/5/2023 3:15:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 4:30:00 AM', y: 72.9000015258789, },
                { x: '9/5/2023 5:45:00 AM', y: 72.69999694824219, },
                { x: '9/5/2023 6:00:00 AM', y: 72.5999984741211, },
                { x: '9/5/2023 7:15:00 AM', y: 72.5, },
                { x: '9/5/2023 8:30:00 AM', y: 72.4000015258789, },
            ];
            chartObj.series[0].xName = 'x'; 
            chartObj.series[0].yName= 'y';
            chartObj.refresh();
        });
    });
    it('memory leak', () => {
        profile.sample();
        let average: any = inMB(profile.averageChange);
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        let memory: any = inMB(getMemoryProfile());
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});
