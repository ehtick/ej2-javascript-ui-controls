/**
 * it defines projection spec
 */
import { createElement } from '@syncfusion/ej2-base';
import { Maps, ILoadedEventArgs } from '../../../src/index';
import { World_Map, usMap, CustomPathData, Oceania, flightRoutes, intermediatestops1 } from '../data/data.spec';
import { new_Continent } from '../data/worldData.spec';
import { MouseEvents } from './events.spec';
import { LayerSettings } from '../../../src/maps/index';
import  {profile , inMB, getMemoryProfile} from '../common.spec';

describe('Maps Component testing with its projection types ', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });
    describe('Maps testing projection', () => {
        let element: Element;
        let maps: Maps;
        let MapData: Object = World_Map;
        let id: string = 'maps-container';
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '800px';
            (element as HTMLDivElement).style.height = '500px';
            document.body.appendChild(element);
            maps = new Maps({ layers: [{ shapeData: World_Map }] }, '#' + id);
        });
        afterAll(() => {
            maps.destroy();
            element.remove();
        });

        it('Winkel3 projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.theme = 'Bootstrap';
            maps.projectionType = 'Winkel3';
            maps.refresh();
        });

        it('Winkel3 projection checking with bootstrap4 theme world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.theme = 'Bootstrap4';
            maps.refresh();
        });

        it('Miller projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.theme = 'Fabric';
            maps.projectionType = 'Miller';
            maps.refresh();
        });

        it('Eckert3 projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.theme = 'Material';
            maps.projectionType = 'Eckert3';
            maps.refresh();
        });

        it('Eckert5 projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Eckert5';
            maps.refresh();
        });

        it('Eckert6 projection checking with world map', () => {
            let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
            expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            maps.loaded = (args: ILoadedEventArgs) => {
            };
            maps.projectionType = 'Eckert6';
            maps.refresh();
        });

        it('AitOff projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'AitOff';
            maps.refresh();
        });

        it('Equirectangular projection checking with world map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Equirectangular';
            maps.refresh();
        });

        it('Mercator projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.layers[0].shapeData = usMap;
            maps.projectionType = 'Winkel3';
            maps.refresh();
        });

        it('Winkel3 projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Winkel3';
            maps.refresh();
        });

        it('Miller projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Miller';
            maps.refresh();
        });

        it('Eckert3 projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Eckert3';
            maps.refresh();
        });

        it('Eckert5 projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Eckert5';
            maps.refresh();
        });

        it('Eckert6 projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Eckert6';
            maps.refresh();
        });

        it('AitOff projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'AitOff';
            maps.refresh();
        });

        it('Equirectangular projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = 'Equirectangular';
            maps.refresh();
        });
        it('Null projection checking with USA map', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            maps.projectionType = null;
            maps.refresh();
        });
    });

    describe('Maps layer testing', () => {
        let element: Element;
        let maps: Maps;
        let MapData: Object = World_Map;
        let id: string = 'maps-container';
        let trigger: MouseEvents = new MouseEvents();
        beforeAll(() => {
            element = createElement('div', { id: id });
            (element as HTMLDivElement).style.width = '800px';
            (element as HTMLDivElement).style.height = '500px';
            document.body.appendChild(element);
            maps = new Maps({ layers: [{ shapeData: new_Continent }] }, '#' + id);
        });
        afterAll(() => {
            maps.destroy();
            element.remove();
        });

        it('Checking with geometry coordinates ', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            (<LayerSettings>maps.layers[0]).isBaseLayer = true;
            maps.refresh();
        });

        it('Checking with Australia map ', () => {
            maps.loaded = (args: ILoadedEventArgs) => {
                let element: Element = document.getElementById(maps.element.id + '_LayerIndex_0_Polygon_Group');
                expect(element.childElementCount).toBeGreaterThanOrEqual(1);
            };
            (<LayerSettings>maps.layers[0]).shapeData = Oceania;
            (<LayerSettings>maps.layers[0]).isBaseLayer = true;
            maps.refresh();
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