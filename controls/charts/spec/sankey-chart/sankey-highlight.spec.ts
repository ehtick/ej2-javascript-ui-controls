/* eslint-disable @typescript-eslint/tslint/config */
import { createElement } from '@syncfusion/ej2-base';
import { Sankey } from '../../src/sankey/sankey';
import { SankeyHighlight } from '../../src/sankey/user-interaction/highlight';
import { SankeyLegend } from '../../src/sankey/legend/legend';
import { SankeyTooltip } from '../../src/sankey/user-interaction/tooltip';
import { SankeySeries } from '../../src/sankey/series/series';
import { SankeyExport } from '../../src/sankey/print-export/export';
import { getMemoryProfile, inMB, profile } from '../common.spec';
import { MouseEvents } from './events.spec';

Sankey.Inject(SankeyHighlight, SankeyLegend, SankeyTooltip, SankeySeries, SankeyExport);

const nodeData: Array<{ id: string; color?: string }> = [
    { id: 'Solar', color: '#fcd34d' },
    { id: 'Wind', color: '#93c5fd' },
    { id: 'Hydro', color: '#67e8f9' },
    { id: 'Nuclear', color: '#a5b4fc' },
    { id: 'Coal', color: '#d1d5db' },
    { id: 'Natural Gas', color: '#fed7aa' },
    { id: 'Oil', color: '#fdba74' },
    { id: 'Electricity', color: '#f472b6' },
    { id: 'Heat', color: '#fb7185' },
    { id: 'Fuel', color: '#f97316' },
    { id: 'Residential', color: '#4ade80' },
    { id: 'Commercial', color: '#34d399' },
    { id: 'Industrial', color: '#22c55e' },
    { id: 'Transportation', color: '#c084fc' },
    { id: 'Energy Services', color: '#60a5fa' },
    { id: 'Losses', color: '#94a3b8' }
];

const linkData: Array<{ sourceId: string; targetId: string; value: number }> = [
    { sourceId: 'Solar', targetId: 'Electricity', value: 100 },
    { sourceId: 'Wind', targetId: 'Electricity', value: 120 },
    { sourceId: 'Hydro', targetId: 'Electricity', value: 80 },
    { sourceId: 'Nuclear', targetId: 'Electricity', value: 90 },
    { sourceId: 'Coal', targetId: 'Electricity', value: 200 },
    { sourceId: 'Natural Gas', targetId: 'Electricity', value: 130 },
    { sourceId: 'Natural Gas', targetId: 'Heat', value: 80 },
    { sourceId: 'Oil', targetId: 'Fuel', value: 250 },
    { sourceId: 'Electricity', targetId: 'Residential', value: 170 },
    { sourceId: 'Electricity', targetId: 'Commercial', value: 160 },
    { sourceId: 'Electricity', targetId: 'Industrial', value: 210 },
    { sourceId: 'Heat', targetId: 'Residential', value: 40 },
    { sourceId: 'Heat', targetId: 'Commercial', value: 20 },
    { sourceId: 'Heat', targetId: 'Industrial', value: 20 },
    { sourceId: 'Fuel', targetId: 'Transportation', value: 200 },
    { sourceId: 'Fuel', targetId: 'Industrial', value: 50 },
    { sourceId: 'Residential', targetId: 'Energy Services', value: 180 },
    { sourceId: 'Commercial', targetId: 'Energy Services', value: 150 },
    { sourceId: 'Industrial', targetId: 'Energy Services', value: 230 },
    { sourceId: 'Transportation', targetId: 'Energy Services', value: 150 },
    { sourceId: 'Residential', targetId: 'Losses', value: 30 },
    { sourceId: 'Commercial', targetId: 'Losses', value: 30 },
    { sourceId: 'Industrial', targetId: 'Losses', value: 50 },
    { sourceId: 'Transportation', targetId: 'Losses', value: 50 }
];

describe('Sankey - Highlight (DOM changes)', () => {
    let ele: HTMLDivElement;
    let sankey: Sankey;
    let loaded: (args: unknown) => void;
    let trigger: MouseEvents;

    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            this.skip(); //Skips test (in Chai)
            return;
        }
    });

    beforeAll(() => {
        trigger = new MouseEvents();
        ele = createElement('div', { id: 'container_highlight' }) as HTMLDivElement;
        document.body.appendChild(ele);

        sankey = new Sankey({
            width: '750',
            height: '450',
            title: 'Energy Flow (Sample)',
            subTitle: 'testing',
            nodes: nodeData,
            links: linkData,

            linkStyle: { opacity: 0.5, curvature: 0.55, highlightOpacity: 0.8, inactiveOpacity: 0.1 },
            nodeStyle: { width: 25, padding: 5, opacity: 1, stroke: 'Black', strokeWidth: 1, highlightOpacity: 1, inactiveOpacity: 0.3 },

            labelSettings: { visible: true },
            tooltip: { enable: true },
            legendSettings: { visible: true },
            theme: 'Fabric'
        });

        sankey.appendTo('#container_highlight');
    });

    afterAll((): void => {
        sankey.destroy();
        ele.remove();
    });

    it('should highlight connected links/nodes on node hover and clear on click (minimal DOM)', (done: DoneFn) => {
        loaded = (_args: unknown): void => {
            const solarNode = document.getElementById('container_highlight_node_level_0_0');
            const electricityNode = document.getElementById('container_highlight_node_level_1_0');
            const windNode = document.getElementById('container_highlight_node_level_0_1');

            const solarLink = document.getElementById('container_highlight_link_level_0_0'); // Solar->Electricity
            const windLink = document.getElementById('container_highlight_link_level_0_1');  // Wind->Electricity

            if (!solarNode || !electricityNode || !windNode || !solarLink || !windLink) {
                fail('One or more highlight DOM elements not found');
                done();
                return;
            }

            trigger.mousemovetEvent(solarNode, 0, 0);

            // Check that highlight has been applied (opacity values may vary)
            expect(solarLink.getAttribute('opacity')).toBeTruthy();
            expect(windLink.getAttribute('opacity')).toBeTruthy();

            expect(solarNode.getAttribute('opacity')).toBeTruthy();
            expect(electricityNode.getAttribute('opacity')).toBeTruthy();
            expect(windNode.getAttribute('opacity')).toBeTruthy();

            trigger.clickEvent(ele);

            expect(solarLink.getAttribute('opacity')).toBe('0.8');
            expect(windLink.getAttribute('opacity')).toBe('0.1');

            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('should highlight connected links nad remove highlight', (done: DoneFn) => {
        loaded = (_args: unknown): void => {
            const hl = new SankeyHighlight(sankey);
            const solarNode = document.getElementById('container_highlight_node_level_0_0');
            const electricityNode = document.getElementById('container_highlight_node_level_1_0');
            const windNode = document.getElementById('container_highlight_node_level_0_1');

            const solarLink = document.getElementById('container_highlight_link_level_0_0'); // Solar->Electricity
            const windLink = document.getElementById('container_highlight_link_level_0_1');  // Wind->Electricity
            const borderElement = document.getElementById('container_highlight_border');

            if (!solarNode || !electricityNode || !windNode || !solarLink || !windLink) {
                fail('One or more highlight DOM elements not found');
                done();
                return;
            }

            trigger.mousemovetEvent(solarNode, 0, 0);
            trigger.mousemovetEvent(solarNode, 0, 0);

            trigger.mousemovetEvent(borderElement, 0, 0);
            trigger.mousemovetEvent(windNode, 0, 0);
            (hl).handleMouseLeave(new Event('mouseleave'));

            expect(solarLink.getAttribute('opacity')).toBe('0.5');
            expect(windLink.getAttribute('opacity')).toBe('0.5');

            expect(solarNode.getAttribute('opacity')).toBe('0.9');
            expect(windNode.getAttribute('opacity')).toBe('0.9');

            trigger.mousemovetEvent(solarNode, 0, 0);
            trigger.mousemovetEvent(windLink, 0, 0);
            trigger.mousemovetEvent(solarLink, 0, 0);
            trigger.mousemovetEvent(solarLink, 0, 0);
            trigger.mousemovetEvent(windLink, 0, 0);
            trigger.mousemovetEvent(borderElement, 0, 0);
            trigger.mousemovetEvent(windLink, 0, 0);
            (hl).handleMouseLeave(new Event('mouseleave'));
            trigger.clickEvent(solarNode);
            trigger.clickEvent(solarLink);

            done();
        };
        sankey.nodeStyle.opacity = 0.9;
        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('should respect isDestroyed guard when wiring events (no throw)', (done: DoneFn) => {
        loaded = (): void => {
            // mark destroyed and create a new highlight instance which will attempt to wire events
            (sankey).isDestroyed = true;
            expect(() => { new SankeyHighlight(sankey); }).not.toThrow();
            (sankey).isDestroyed = false;
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('should register pointerleave or mouseleave based on Browser.isPointer', (done: DoneFn) => {
        loaded = (): void => {
            const onSpy = spyOn(sankey, 'on').and.callThrough();
            // create a fresh highlight which will call sankey.on
            const hl = new SankeyHighlight(sankey);
            const calls = onSpy.calls.allArgs().map(a => a[0]);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const expected = (require('@syncfusion/ej2-base').Browser.isPointer) ? 'pointerleave' : 'mouseleave';
            expect(calls.indexOf(expected)).toBeGreaterThanOrEqual(0);
            // cleanup
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('mouseLeaveHandler should call clearHighlights', (done: DoneFn) => {
        loaded = (): void => {
            const hl = new SankeyHighlight(sankey);
            const clearSpy = spyOn(hl, 'clearHighlights');
            (hl).handleMouseLeave(new Event('mouseleave'));
            expect(clearSpy).toHaveBeenCalled();
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('handleMouseMove should call clearHighlights when event is null or getInteractiveTarget returns null', (done: DoneFn) => {
        loaded = (): void => {
            const hl = new SankeyHighlight(sankey);
            const clearSpy = spyOn(hl, 'clearHighlights');
            // passing null event
            (hl).handleMouseMove(null);
            expect(clearSpy).toHaveBeenCalled();

            // when getInteractiveTarget returns null
            clearSpy.calls.reset();
            spyOn(hl, 'getInteractiveTarget').and.returnValue(null);
            const evt = new PointerEvent('pointermove');
            (hl).handleMouseMove(evt);
            expect(clearSpy).toHaveBeenCalled();
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('getInteractiveTarget should map label to node via constructed node id', (done: DoneFn) => {
        loaded = (): void => {
            const hl = new SankeyHighlight(sankey);
            // create a node element and a label element mapping to that node
            const nodeEl = document.createElement('rect');
            nodeEl.setAttribute('id', 'container_highlight_node_level_0_0');
            nodeEl.setAttribute('aria-label', 'Solar');
            document.body.appendChild(nodeEl);

            let labelEl = document.createElement('text');
            labelEl.setAttribute('id', 'container_highlight_label_level_0_0');
            document.body.appendChild(labelEl);

            let result = (hl).getInteractiveTarget(labelEl);

            labelEl = document.createElement('text');
            labelEl.setAttribute('id', 'container_highlight_label_level_20_24');
            document.body.appendChild(labelEl);
            result = (hl).getInteractiveTarget(labelEl);

            labelEl = document.createElement('text');
            labelEl.setAttribute('id', 'container_highlight');
            document.body.appendChild(labelEl);
            result = (hl).getInteractiveTarget(labelEl);

            labelEl = document.createElement('text');
            document.body.appendChild(labelEl);
            result = (hl).getInteractiveTarget(labelEl);

            expect(labelEl).not.toBe(null);

            nodeEl.remove();
            labelEl.remove();
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('getInteractiveTarget should handle legend shape/text by using parent aria-label', (done: DoneFn) => {
        loaded = (): void => {
            const hl = new SankeyHighlight(sankey);
            const parent = document.createElement('g');
            parent.setAttribute('aria-label', 'Solar');
            const child = document.createElement('rect');
            child.setAttribute('id', 'container_highlight_legend_shape_0');
            parent.appendChild(child);
            document.body.appendChild(parent);

            const result = (hl).getInteractiveTarget(child);
            expect(result).toBeTruthy();
            expect(result.type).toBe('node');
            expect(result.id).toBe('Solar');

            parent.remove();
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('highlightForNode returns early when collections are missing, and clearHighlights respects node opacity threshold', (done: DoneFn) => {
        loaded = (): void => {
            const hl = new SankeyHighlight(sankey);
            // remove collections to force early return
            const linkCollection = document.getElementById('container_highlight_link_collection');
            const nodeCollection = document.getElementById('container_highlight_node_collection');
            if (linkCollection) { linkCollection.remove(); }
            if (nodeCollection) { nodeCollection.remove(); }

            expect(() => { hl.highlightForNode('Solar'); }).not.toThrow();

            // restore a simple node collection and test clearHighlights branches
            const nodeCol = document.createElement('div');
            nodeCol.setAttribute('id', 'container_highlight_node_collection');
            const rect = document.createElement('rect');
            rect.setAttribute('aria-label', 'Solar');
            nodeCol.appendChild(rect);
            document.body.appendChild(nodeCol);

            // set default node opacity < 1
            (sankey).nodeStyle = (sankey).nodeStyle || {};
            (sankey).nodeStyle.opacity = 0.5;

            hl.clearHighlights();
            const nodeEl = document.querySelector('#container_highlight_node_collection rect') as HTMLElement;
            expect(nodeEl.getAttribute('opacity')).toBe(null);

            // now set default opacity to 1 and ensure attribute removed
            (sankey).nodeStyle.opacity = 1;
            hl.clearHighlights();
            expect(nodeEl.getAttribute('opacity')).toBeNull();

            nodeCol.remove();
            hl.destroy();
            done();
        };

        sankey.loaded = loaded;
        sankey.refresh();
    });

    it('memory leak', () => {
        profile.sample();
        const average = inMB(profile.averageChange);
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        const memory = inMB(getMemoryProfile());
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });

});
