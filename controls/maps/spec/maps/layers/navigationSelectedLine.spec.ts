/**
 * navigation line selected layer testing
 */
import { Maps, ILoadedEventArgs, NavigationLine } from '../../../src/index';
import { createElement, remove } from '@syncfusion/ej2-base';
import { World_Map, } from '../data/data.spec';
import { profile, inMB, getMemoryProfile } from '../common.spec';
Maps.Inject(NavigationLine);
export function getElementByID(id: string): Element {
    return document.getElementById(id);
}
describe('Map navigation properties tesing', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('navigation testing', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                layers: [
                    {
                        navigationLineSettings: [
                            {
                                visible: true,
                                latitude: [38.8833, 21.0000],
                                longitude: [-77.0167, 78.0000],
                                angle: 0.9,
                                width: 5,
                                color: 'blue',
                                dashArray: '2,1',
                                arrowSettings: {
                                    showArrow: true,
                                    size: 5,
                                    position: 'Start'
                                }
                            },
                        ],
                        shapeData: World_Map
                    }

                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Navigation line selected width', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let strokeWidth: string = spec.getAttribute('stroke-width');
                expect(strokeWidth).toEqual('4.854368932038835');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 0,
                    width: 5,
                    color: 'red',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected stroke', (done: Function) => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let stroke: string = spec.getAttribute('stroke');
                expect(stroke).toEqual('red');
                done();
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 0,
                    width: 5,
                    color: 'red',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected dashArray', (done: Function) => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let dashArray: string = spec.getAttribute('stroke-dasharray');
                expect(dashArray).toEqual('2,1');
                done();
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 0,
                    width: 5,
                    color: 'red',
                    dashArray: '2,1',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected color', (done: Function) => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('fill');
                expect(fill).toEqual('none');
                done();
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 0,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected angle fill', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('fill');
                expect(fill).toEqual('none');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected angle d', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('d');
                expect(fill).toEqual(
                    'M 184.51174583333332,246.77439104673405 A 140.11113332251588 140.11113332251588 0,0,0 , 462.25,284.0031554115543 ');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected angle 10', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let visible: string = spec.getAttribute('visible');
                expect(visible).toEqual(null);
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected angle -10', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('d');
                //       expect(fill).toEqual(
                // 'M 140.74384333333327,188.237209914718 A -213.75093827807066 -213.75093827807066 0,0,1 , 352.5999999999999,216.63496505811577 ');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: -10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected angle -0.5', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('d');
                //       expect(fill).toEqual();
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [21.0000, 38.8833],
                    longitude: [78.0000, -77.0167],
                    angle: -0.5,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected angle 0.5', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let fill: string = spec.getAttribute('d');
                //       expect(fill).toEqual();
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [21.0000, 38.8833],
                    longitude: [78.0000, -77.0167],
                    angle: 0.5,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: false,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },];
            map.refresh();
        });
        it('Navigation line selected arrow size', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let visible: string = spec.getAttribute('visible');
                expect(visible).toEqual(null);
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'Start'
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow color', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_triangle');
                let color: string = spec.getAttribute('stroke');
                expect(color).toEqual('none');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'Start',
                        color: 'blue'
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow size', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('triangle0');
                let size: string = spec.getAttribute('markerHeight');
                expect(size).toEqual('5');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'Start',
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow position start', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let markerstart: string = spec.getAttribute('marker-start');
                expect(markerstart).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'Start'
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow position End', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let markerEnd: string = spec.getAttribute('marker-end');
                expect(markerEnd).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 10,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'End'
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow position End and offSet', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let markerEnd: string = spec.getAttribute('marker-end');
                expect(markerEnd).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [21.0000, -15.7833],
                    longitude: [78.0000, -47.8667],
                    angle: 0,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'End',
                        offSet: 5
                    }
                },
            ];
            map.refresh();
        });

        it('Navigation line selected arrow position start, angle -0.5 and offSet', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let markerEnd: string = spec.getAttribute('marker-end');
                expect(markerEnd).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: -0.5,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'End',
                        offSet: 5
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line selected arrow position start, angle -0.5 and offSet', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                let markerEnd: string = spec.getAttribute('marker-end');
                expect(markerEnd).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: -0.5,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'End',
                        offSet: 5
                    }
                },
            ];
            map.refresh();
        });
        it('Navigation line Data as empty', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                expect(spec == null).toEqual(true);
            };
            map.layers[0].navigationLineSettings = [
                {

                },
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: -0.5,
                    width: 5,
                    color: 'none',
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'End',
                        offSet: 5
                    }
                },                
            ];
            map.refresh();
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
    describe('navigation testing', () => {
        let id: string = 'container';
        let map: Maps;
        let ele: HTMLDivElement;
        let spec: Element;
        beforeAll(() => {
            ele = <HTMLDivElement>createElement('div', { id: id, styles: 'height: 512px; width: 512px;' });
            document.body.appendChild(ele);
            map = new Maps({
                baseLayerIndex: 0,
                theme: 'HighContrastLight',
                layers: [
                    {
                        shapeData: World_Map
                    }

                ]
            }, '#' + id);
        });
        afterAll(() => {
            remove(ele);
            map.destroy();
        });
        it('Navigation line selected arrow position start, angle -0.5 and offSet', () => {
            map.loaded = (args: ILoadedEventArgs) => {
                let spec: Element = document.getElementById('container_LayerIndex_0_NavigationIndex_0_Line0');
                // let markerEnd: string = spec.getAttribute('marker-end');
                // expect(markerEnd).toEqual('url(#triangle0)');
            };
            map.layers[0].navigationLineSettings = [
                {
                    visible: true,
                    latitude: [38.8833, 21.0000],
                    longitude: [-77.0167, 78.0000],
                    angle: 0,
                    arrowSettings: {
                        showArrow: true,
                        size: 5,
                        position: 'Start',
                        offSet: 5
                    }
                },
            ];
            map.theme = 'MaterialDark';
            map.refresh();
        });
    });
});

