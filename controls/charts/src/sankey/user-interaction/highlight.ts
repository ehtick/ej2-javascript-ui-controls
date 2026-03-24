import { Browser } from '@syncfusion/ej2-base';
import { Sankey } from '../sankey';
import { SankeyLinkSettingsModel, SankeyNodeSettingsModel } from '../model/sankey-base-model';

/**
 * Highlight behavior module for Sankey Chart.
 */
export class SankeyHighlight {
    private chart: Sankey;
    private lastHoveredId: string | null = null;

    /**
     * Constructor.
     *
     * @param {Sankey} chart - Sankey chart instance.
     */
    constructor(chart: Sankey) {
        this.chart = chart;
        this.wireEvents();
    }

    /**
     * Wires legend interaction events to the chart for hover, move, click, and touch end behaviors.
     *
     * @returns {void}
     */
    private wireEvents(): void {
        if (this.chart.isDestroyed) { return; }
        const cancelEvent: string = Browser.isPointer ? 'pointerleave' : 'mouseleave';
        this.chart.on(cancelEvent, this.handleMouseLeave, this);
        this.chart.on(Browser.touchMoveEvent, this.handleMouseMove, this);
        // clear highlight on touch end / pointer up (chart notifies this event)
        this.chart.on(Browser.touchEndEvent, this.handleMouseMove, this);
    }

    /**
     * Unwires legend interaction events from the chart to release handlers and avoid memory leaks.
     *
     * @returns {void}
     */
    private unwireEvents(): void {
        if (this.chart.isDestroyed) { return; }
        this.chart.off(Browser.touchMoveEvent, this.handleMouseMove);
        this.chart.off(Browser.touchEndEvent, this.handleMouseMove);
        const cancelEvent: string = Browser.isPointer ? 'pointerleave' : 'mouseleave';
        this.chart.off(cancelEvent, this.handleMouseLeave);
    }

    /**
     * Clears active highlight when the pointer leaves the chart surface.
     *
     * @param {Event} _event - The leave event (unused).
     * @returns {void}
     * @private
     */
    public handleMouseLeave(_event: Event): void {
        this.clearHighlights();
    }

    /**
     * Tracks pointer/touch movement to identify interactive nodes/links and apply the corresponding highlight.
     *
     * @param {PointerEvent | TouchEvent} event - The pointer or touch move event used to detect the hovered element.
     * @returns {void}
     * @private
     */
    public handleMouseMove(event: PointerEvent | TouchEvent): void {
        const targetElement: Element = (event && (event.target as Element));
        if (!targetElement) { this.clearHighlights(); return; }

        const hitElement: { type: string; id?: string; source?: string; target?: string }
            = this.getInteractiveTarget(targetElement);
        if (!hitElement) { this.clearHighlights(); return; }

        if (hitElement.type === 'node' && hitElement.id) {
            if (this.lastHoveredId === 'node:' + hitElement.id) { return; }
            this.lastHoveredId = 'node:' + hitElement.id;
            this.highlightForNode(hitElement.id);
        } else if (hitElement.type === 'link') {
            if (this.lastHoveredId === 'link:' + (hitElement.id)) { return; }
            this.lastHoveredId = 'link:' + (hitElement.id);
            this.highlightForLink(hitElement.source, hitElement.target);
        } else {
            this.clearHighlights();
        }
    }

    /**
     * Walks up the DOM tree to find the nearest interactive Sankey element (node, link, label, or legend item).
     *
     * @param {Element} element - The starting DOM element from the event target.
     * @returns {Element | null} - returns element if found, or null.
     * @private
     */
    public getInteractiveTarget(element: Element): { type: string, id?: string, source?: string, target?: string } | null {
        let currentElement: Element | null = element;

        while (currentElement && currentElement !== document.body) {
            const elementId: string | null = currentElement.getAttribute('id');

            if (elementId) {
                if (elementId.indexOf('_node_level_') > -1) {
                    // node element
                    const nodeId: string = currentElement.getAttribute('aria-label');
                    return { type: 'node', id: nodeId };
                }
                else if (elementId.indexOf('_link_level_') > -1) {
                    const sourceId: string = currentElement.getAttribute('data-source');
                    const targetId: string = currentElement.getAttribute('data-target');
                    return { type: 'link', id: elementId, source: sourceId, target: targetId };
                }
                else if (elementId.indexOf('_label_level_') > -1) {
                    // labels map to node by level/index pattern
                    const splitIdParts: string[] = elementId.split('_');
                    const level: string = splitIdParts[splitIdParts.length - 2];
                    const index: string = splitIdParts[splitIdParts.length - 1];
                    const nodeElementId: string = `${this.chart.element.id}_node_level_${level}_${index}`;
                    const nodeElement: HTMLElement | null = document.getElementById(nodeElementId);

                    if (nodeElement) {
                        const nodeLabel: string = nodeElement.getAttribute('aria-label');
                        return { type: 'node', id: nodeLabel };
                    }
                }
                else if (elementId.indexOf('_legend_') > -1 && this.chart.legendSettings.enableHighlight) {
                    let legendHighlightElement: Element;

                    if (elementId.indexOf('_shape_') > -1 || elementId.indexOf('_text_') > -1) {
                        legendHighlightElement = currentElement.parentElement as Element;
                    }
                    else {
                        legendHighlightElement = currentElement;
                    }

                    const nodeId: string = legendHighlightElement.getAttribute('aria-label');
                    return { type: 'node', id: nodeId };
                }
            }

            currentElement = currentElement.parentElement;
        }

        return null;
    }

    /**
     * Highlights the hovered node along with its directly connected neighbor nodes and links by applying active/inactive opacities.
     *
     * @param {string} nodeId - The node id whose related nodes and links should be highlighted.
     * @returns {void}
     * @private
     */
    public highlightForNode(nodeId: string): void {
        const chart: Sankey = this.chart;
        const linkCollection: HTMLElement | null = document.getElementById(chart.element.id + '_link_collection');
        const nodeCollection: HTMLElement | null = document.getElementById(chart.element.id + '_node_collection');
        if (!linkCollection || !nodeCollection) { return; }

        const linkElements: SVGElement[] = Array.prototype.slice.call(linkCollection.querySelectorAll('path')) as SVGElement[];
        const nodeElements: SVGElement[] = Array.prototype.slice.call(nodeCollection.querySelectorAll('rect')) as SVGElement[];

        // collect neighbor node ids connected to hovered node
        const neighborNodeMap: { [id: string]: boolean } = {};

        const highlightOpacity: number = (chart.linkStyle && (chart.linkStyle as SankeyLinkSettingsModel).highlightOpacity);
        const inactiveOpacity: number = (chart.linkStyle && (chart.linkStyle as SankeyLinkSettingsModel).inactiveOpacity);
        const nodeHighlightOpacity: number = (chart.nodeStyle && (chart.nodeStyle as SankeyNodeSettingsModel).highlightOpacity);
        const nodeInactiveOpacity: number = (chart.nodeStyle && (chart.nodeStyle as SankeyNodeSettingsModel).inactiveOpacity);

        for (const linkElement of linkElements) {
            const sourceId: string | null = linkElement.getAttribute('data-source');
            const targetId: string | null = linkElement.getAttribute('data-target');
            if (sourceId === nodeId || targetId === nodeId) {
                // matched link
                linkElement.setAttribute('opacity', String(highlightOpacity));
                // mark the neighbor node (other end)
                const otherNodeId: string | null = (sourceId === nodeId) ? targetId : sourceId;
                if (otherNodeId) { neighborNodeMap[otherNodeId as string] = true; }
            } else {
                linkElement.setAttribute('opacity', String(inactiveOpacity));
            }
        }

        for (const nodeElement of nodeElements) {
            const nodeElementId: string | null = nodeElement.getAttribute('aria-label');

            if (nodeElementId === nodeId || (nodeElementId && neighborNodeMap[nodeElementId as string])) {
                nodeElement.setAttribute('opacity', String(nodeHighlightOpacity));
            } else {
                nodeElement.setAttribute('opacity', String(nodeInactiveOpacity));
            }
        }
    }

    /**
     * Highlights the hovered link and its source/target nodes by applying active/inactive opacities.
     *
     * @param {string | null} source - The source node id of the hovered link.
     * @param {string | null} target - The target node id of the hovered link.
     * @returns {void}
     * @private
     */
    public highlightForLink(source: string | null, target: string | null): void {
        const chart: Sankey = this.chart;
        const linkCollection: HTMLElement | null = document.getElementById(chart.element.id + '_link_collection');
        const nodeCollection: HTMLElement | null = document.getElementById(chart.element.id + '_node_collection');
        if (!linkCollection || !nodeCollection) { return; }

        const linkElements: SVGElement[] = Array.prototype.slice.call(linkCollection.querySelectorAll('path')) as SVGElement[];
        const nodeElements: SVGElement[] = Array.prototype.slice.call(nodeCollection.querySelectorAll('rect')) as SVGElement[];

        const highlightOpacity: number = (chart.linkStyle && (chart.linkStyle as SankeyLinkSettingsModel).highlightOpacity);
        const inactiveOpacity: number = (chart.linkStyle && (chart.linkStyle as SankeyLinkSettingsModel).inactiveOpacity);
        const nodeHighlightOpacity: number = (chart.nodeStyle && (chart.nodeStyle as SankeyNodeSettingsModel).highlightOpacity);
        const nodeInactiveOpacity: number = (chart.nodeStyle && (chart.nodeStyle as SankeyNodeSettingsModel).inactiveOpacity);

        for (const linkElement of linkElements) {
            const sourceId: string | null = linkElement.getAttribute('data-source');
            const targetId: string | null = linkElement.getAttribute('data-target');

            if (sourceId === source && targetId === target) {
                linkElement.setAttribute('opacity', String(highlightOpacity));
            } else {
                linkElement.setAttribute('opacity', String(inactiveOpacity));
            }
        }

        for (const nodeElement of nodeElements) {
            const nodeElementId: string | null = nodeElement.getAttribute('aria-label');

            if (nodeElementId === source || nodeElementId === target) {
                nodeElement.setAttribute('opacity', String(nodeHighlightOpacity));
            } else {
                nodeElement.setAttribute('opacity', String(nodeInactiveOpacity));
            }
        }
    }

    /**
     * Clears active node/link highlight and restores default link and node opacity values.
     *
     * @returns {void}
     * @private
     */
    public clearHighlights(): void {
        const chart: Sankey = this.chart;
        this.lastHoveredId = null;

        const linkCollection: HTMLElement | null = document.getElementById(chart.element.id + '_link_collection');
        const nodeCollection: HTMLElement | null = document.getElementById(chart.element.id + '_node_collection');
        if (!linkCollection || !nodeCollection) { return; }

        const linkElements: SVGElement[] = Array.prototype.slice.call(linkCollection.querySelectorAll('path')) as SVGElement[];
        const nodeElements: SVGElement[] = Array.prototype.slice.call(nodeCollection.querySelectorAll('rect')) as SVGElement[];

        const defaultLinkOpacity: number = (chart.linkStyle && (chart.linkStyle as SankeyLinkSettingsModel).opacity);
        const defaultNodeOpacity: number = (chart.nodeStyle && (chart.nodeStyle as SankeyNodeSettingsModel).opacity);

        for (const linkElement of linkElements) {
            linkElement.setAttribute('opacity', String(defaultLinkOpacity));
        }

        for (const nodeElement of nodeElements) {
            if (defaultNodeOpacity < 1) { nodeElement.setAttribute('opacity', String(defaultNodeOpacity)); }
            else { nodeElement.removeAttribute('opacity'); }
        }
    }

    /**
     * Gets the module name for the Sankey highlight component.
     *
     * @returns {string} returns module name
     * @private
     */
    public getModuleName(): string { return 'SankeyHighlight'; }

    /**
     * Destroys the highlight module by unwiring events to release handlers.
     *
     * @returns {void}
     * @private
     */
    public destroy(): void { this.unwireEvents(); }
}
