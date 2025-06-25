/**
 * `Selection` module is used to handle RTE Selections.
 */
import { NodeSelection } from './../../selection/index';
import { NodeCutter } from './nodecutter';
import { InsertMethods } from './insert-methods';
import { IsFormatted } from './isformatted';
import { isIDevice, setEditFrameFocus } from '../../common/util';
import { isNullOrUndefined as isNOU, Browser, closest, detach } from '@syncfusion/ej2-base';
import { DOMNode } from './dom-node';
import { FormatPainterValue, ITableSelection } from '../base/interface';
import { CustomUserAgentData } from '../../common/user-agent';
import { DOMMethods } from './dom-tree';

export class SelectionCommands {
    public static enterAction: string = 'P';
    public static isUnwrapped: boolean = false;
    public static isWrapped: boolean = false;
    public static userAgentData: CustomUserAgentData = new CustomUserAgentData(Browser.userAgent, false);
    /**
     * applyFormat method
     *
     * @param {Document} docElement - specifies the document
     * @param {string} format - specifies the string value
     * @param {Node} endNode - specifies the end node
     * @param {string} enterAction - specifies the enter key action
     * @param {ITableSelection} tableCellSelection - specifies the table cell selection
     * @param {string} value - specifies the string value
     * @param {string} selector - specifies the string
     * @param {FormatPainterValue} painterValues specifies the element created and last child
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public static applyFormat(
        docElement: Document, format: string, endNode: Node, enterAction: string, tableCellSelection?: ITableSelection,
        value?: string, selector?: string, painterValues?: FormatPainterValue): void {
        this.enterAction = enterAction;
        const validFormats: string[] = ['bold', 'italic', 'underline', 'strikethrough', 'superscript',
            'subscript', 'uppercase', 'lowercase', 'fontcolor', 'fontname', 'fontsize', 'backgroundcolor', 'inlinecode'];
        if (validFormats.indexOf(format) > -1 || value === 'formatPainter') {
            if (format === 'backgroundcolor' && value === '') {
                value = 'transparent';
            }
            let domSelection: NodeSelection = new NodeSelection(endNode as HTMLElement);
            const domNode: DOMNode = new DOMNode((endNode as HTMLElement), docElement);
            const nodeCutter: NodeCutter = new NodeCutter();
            const isFormatted: IsFormatted = new IsFormatted();
            let range: Range = domSelection.getRange(docElement);
            let counter: number = 0;
            const currentAnchorNode: HTMLElement = range.startContainer.parentElement;
            if (range.collapsed && !isNOU(currentAnchorNode) &&
            currentAnchorNode.tagName === 'A' &&
            (range.startOffset === currentAnchorNode.textContent.length || range.startOffset === 0)) {
                const emptyTextNode: Node = document.createTextNode('');
                if (range.startOffset === 0) {
                    currentAnchorNode.parentNode.insertBefore(emptyTextNode, currentAnchorNode);
                } else {
                    if (!isNOU(currentAnchorNode.nextSibling)) {
                        currentAnchorNode.parentElement.insertBefore(emptyTextNode, currentAnchorNode.nextSibling);
                    } else {
                        currentAnchorNode.parentNode.appendChild(emptyTextNode);
                    }
                }

                // Set the range to the empty text node
                const newRange: Range = docElement.createRange();
                range.setStart(emptyTextNode, 0);
                range.setEnd(emptyTextNode, 0);
                range.collapse(true);
                domSelection.setRange(docElement, newRange);
            }
            if (Browser.userAgent.indexOf('Firefox') !== -1 && range.startContainer === range.endContainer && !isNOU(endNode) && range.startContainer === endNode) {
                const startChildNodes: NodeListOf<Node> = range.startContainer.childNodes;
                const startNode: Element = <Element>((startChildNodes[(range.startOffset > 0) ? (range.startOffset - 1) :
                    range.startOffset]) || range.startContainer);
                const endNode: Element = <Element>(range.endContainer.childNodes[(range.endOffset > 0) ? (range.endOffset - 1) :
                    range.endOffset] || range.endContainer);
                let lastSelectionNode: Element = <Element>(endNode.lastChild.nodeName === 'BR' ? (isNOU(endNode.lastChild.previousSibling) ? endNode
                    : endNode.lastChild.previousSibling) : endNode.firstChild);
                while (!isNOU(lastSelectionNode) && lastSelectionNode.nodeName !== '#text' && lastSelectionNode.nodeName !== 'IMG' &&
                lastSelectionNode.nodeName !== 'BR' && lastSelectionNode.nodeName !== 'HR') {
                    lastSelectionNode = lastSelectionNode.lastChild as Element;
                }
                domSelection.setSelectionText(docElement, startNode, lastSelectionNode, 0, 0);
                range = domSelection.getRange(docElement);
            }
            const save: NodeSelection = domSelection.save(range, docElement);
            let nodes: Node[];
            let isTableSelect: boolean = false;
            if (endNode && tableCellSelection && endNode.nodeName !== '#text') {
                nodes = tableCellSelection.getTextNodes();
            }
            if (nodes && nodes.length > 0) {
                isTableSelect = true;
            } else {
                nodes = range.collapsed ? domSelection.getSelectionNodeCollection(range) :
                    domSelection.getSelectionNodeCollectionBr(range);
            }
            let isCollapsed: boolean = false;
            let isFormat: boolean = false;
            let isCursor: boolean = false;
            let preventRestore: boolean = false;
            const isFontStyle: boolean = (['fontcolor', 'fontname', 'fontsize', 'backgroundcolor'].indexOf(format) > -1);
            let isMACMentionStartEnd: boolean = false;
            let mentionPosition: MentionPositionType;
            if (SelectionCommands.userAgentData.isSafari() && nodes.length > 0) {
                mentionPosition = SelectionCommands.isMentionStartOrEnd(endNode as HTMLDivElement, nodes[0], nodes[nodes.length - 1]);
                isMACMentionStartEnd = mentionPosition !== 'None';
            }
            if (!isTableSelect && range.collapsed) {
                const currentFormatNode: Node = isFormatted.getFormattedNode(range.startContainer, format, endNode);
                const currentSelector: string = !isNOU(currentFormatNode) ?
                    ((currentFormatNode as HTMLElement).getAttribute('style') === null ? currentFormatNode.nodeName :
                        currentFormatNode.nodeName + '[style=\'' + (currentFormatNode as HTMLElement).getAttribute('style') + '\']') : null;
                if (nodes.length > 0) {
                    isCollapsed = true;
                    range = nodeCutter.GetCursorRange(docElement, range, nodes[0]);
                } else if (range.startContainer.nodeType === 3 && ((range.startContainer.parentElement.childElementCount > 0 &&
                    range.startOffset > 0 && range.startContainer.parentElement.firstElementChild.tagName.toLowerCase() !== 'br') ||
                    !isNOU(currentFormatNode) && currentFormatNode as HTMLElement ===
                        ((range.startContainer.parentElement as HTMLElement).closest(currentSelector)) &&
                        (((range.startContainer.parentElement as HTMLElement).closest(currentSelector)).textContent.replace(
                            new RegExp('\u200B', 'g'), '').trim().length !== 0))) {
                    isCollapsed = true;
                    range = nodeCutter.GetCursorRange(docElement, range, range.startContainer);
                    nodes.push(range.startContainer);
                } else {
                    const cursorNode: Node = this.insertCursorNode(
                        docElement, domSelection, range, isFormatted, nodeCutter, format, value, endNode);
                    domSelection.endContainer = domSelection.startContainer = domSelection.getNodeArray(cursorNode, true);
                    const childNodes: NodeListOf<Node> = cursorNode.nodeName === 'BR' && cursorNode.parentNode.childNodes;
                    if (!isNOU(childNodes) && childNodes.length === 1 && childNodes[0].nodeName === 'BR' && nodes.length === 0) {
                        domSelection.setSelectionText(docElement, range.startContainer, range.endContainer, 0, 0);
                        preventRestore = true;
                    } else {
                        domSelection.endOffset = domSelection.startOffset = 1;
                    }
                    if (cursorNode.nodeName === 'BR' && cursorNode.parentNode.textContent.length === 0) {
                        preventRestore = true;
                    }
                }
            }
            isCursor = isTableSelect ? false : range.collapsed;
            let isSubSup: boolean = false;
            let formattedCount: number = 0;
            for (let index: number = 0; index < nodes.length; index++) {
                const existingFormatNode: Node | null = isFormatted.getFormattedNode(nodes[index as number], format, endNode);
                if (existingFormatNode || nodes[index as number].nodeName === 'BR') {
                    formattedCount++;
                }
            }
            const shouldApplyRemoval: boolean = formattedCount === nodes.length;
            for (let index: number = 0; index < nodes.length; index++) {
                let formatNode: Node = isFormatted.getFormattedNode(nodes[index as number], format, endNode);
                if (formatNode === null) {
                    if (format === 'subscript') {
                        formatNode = isFormatted.getFormattedNode(nodes[index as number], 'superscript', endNode);
                        isSubSup = formatNode === null ? false : true;
                    } else if (format === 'superscript') {
                        formatNode = isFormatted.getFormattedNode(nodes[index as number], 'subscript', endNode);
                        isSubSup = formatNode === null ? false : true;
                    }
                }
                if (index === 0 && formatNode === null) {
                    isFormat = true;
                }
                if (formatNode !== null && (!isFormat || isFontStyle)) {
                    nodes[index as number] = this.removeFormat(
                        nodes,
                        index,
                        formatNode,
                        isCursor,
                        isTableSelect,
                        isFormat,
                        isFontStyle,
                        range,
                        nodeCutter,
                        format,
                        value,
                        domSelection,
                        endNode,
                        domNode);
                }
                if (formatNode === null && !shouldApplyRemoval) {
                    nodes[index as number] = this.insertFormat(
                        docElement,
                        nodes,
                        index,
                        formatNode,
                        isCursor,
                        isTableSelect,
                        isFormat,
                        isFontStyle,
                        range,
                        nodeCutter,
                        format,
                        value,
                        painterValues,
                        domNode,
                        endNode);
                    counter++;
                }
                if (nodes.length === counter) {
                    this.isWrapped = true;
                }
                if (!isTableSelect) {
                    if (!isMACMentionStartEnd) {
                        domSelection = this.applySelection(nodes, domSelection, nodeCutter, index, isCollapsed);
                    }
                }
            }
            if (isIDevice()) {
                setEditFrameFocus(endNode as Element, selector);
            }
            if (!preventRestore && !isTableSelect) {
                save.restore();
            }
            if (isSubSup) {
                this.applyFormat(docElement, format, endNode, enterAction, tableCellSelection);
            }
        }
    }

    private static insertCursorNode(
        docElement: Document,
        domSelection: NodeSelection,
        range: Range,
        isFormatted: IsFormatted,
        nodeCutter: NodeCutter,
        format: string,
        value: string,
        endNode: Node): Node {
        const cursorNodes: Node[] = domSelection.getNodeCollection(range);
        const domNode: DOMNode = new DOMNode((endNode as HTMLElement), docElement);
        const cursorFormat: Node = (cursorNodes.length > 0) ?
            (cursorNodes.length > 1 && range.startContainer === range.endContainer) ?
                this.getCursorFormat(isFormatted, cursorNodes, format, endNode) :
                ((value === '' && format === 'fontsize' && isFormatted.getFormattedNode(cursorNodes[0], format, endNode) == null && cursorNodes[0].parentElement.nodeName === 'SPAN') ? cursorNodes[0].parentElement : isFormatted.getFormattedNode(cursorNodes[0], format, endNode)) : null;
        let cursorNode: Node = null;
        if (cursorFormat) {
            cursorNode = cursorNodes[0];
            if (cursorFormat.firstChild.textContent.charCodeAt(0) === 8203 && cursorFormat.firstChild.nodeType === 3) {
                const regEx: RegExp = new RegExp('\u200B', 'g');
                let emptySpaceNode: Node;
                if (cursorNode.nodeName !== '#text') {
                    for (let i: number = 0; i < cursorNodes.length; i++) {
                        if (cursorNodes[i as number].nodeType === Node.TEXT_NODE) {
                            cursorNode = cursorNodes[i as number];
                        }
                    }
                }
                if (cursorFormat.firstChild === cursorNode) {
                    cursorNode.textContent = (cursorFormat.parentElement && (domNode.isBlockNode(cursorFormat.parentElement) &&
                    cursorFormat.parentElement.textContent.length <= 1 ? cursorFormat.parentElement.childElementCount > 1 :
                        (cursorFormat as HTMLElement).childElementCount === 0) &&
                        (cursorFormat.parentElement.textContent.length > 1 ||
                        cursorFormat.parentElement.firstChild && cursorFormat.parentElement.firstChild.nodeType === 1) ?
                        cursorNode.textContent : cursorNode.textContent.replace(regEx, ''));
                    emptySpaceNode = cursorNode;
                } else {
                    cursorFormat.firstChild.textContent = cursorFormat.firstChild.textContent.replace(regEx, '');
                    emptySpaceNode = cursorFormat.firstChild;
                }
                let pointer: number;
                if (emptySpaceNode.textContent.length === 0) {
                    if (!isNOU(emptySpaceNode.previousSibling)) {
                        cursorNode = emptySpaceNode.previousSibling;
                        pointer = emptySpaceNode.textContent.length - 1;
                        domSelection.setCursorPoint(docElement, emptySpaceNode as Element, pointer);
                    } else if (!isNOU(emptySpaceNode.parentElement) && emptySpaceNode.parentElement.textContent.length === 0) {
                        const brElem: HTMLElement = document.createElement('BR');
                        emptySpaceNode.parentElement.appendChild(brElem);
                        detach(emptySpaceNode);
                        cursorNode = brElem;
                        domSelection.setCursorPoint(docElement, cursorNode.parentElement, 0);
                    }
                }
            }
            if ((['fontcolor', 'fontname', 'fontsize', 'backgroundcolor'].indexOf(format) > -1)) {
                if (format === 'fontcolor') {
                    (cursorFormat as HTMLElement).style.color = value;
                } else if (format === 'fontname') {
                    (cursorFormat as HTMLElement).style.fontFamily = value;
                } else if (format === 'fontsize') {
                    (cursorFormat as HTMLElement).style.fontSize = value;
                } else {
                    (cursorFormat as HTMLElement).style.backgroundColor = value;
                }
                cursorNode = cursorFormat;
            } else {
                InsertMethods.unwrap(cursorFormat);
                domSelection.setCursorPoint(docElement, cursorNode as HTMLElement, 0);
            }
        } else {
            if (cursorNodes.length > 1 && range.startOffset > 0 && ((cursorNodes[0] as HTMLElement).firstElementChild &&
                (cursorNodes[0] as HTMLElement).firstElementChild.tagName.toLowerCase() === 'br')) {
                (cursorNodes[0] as HTMLElement).innerHTML = '';
            }
            if (cursorNodes.length === 1 && range.startOffset === 0 && (cursorNodes[0].nodeName === 'BR' || (isNOU(cursorNodes[0].nextSibling) ? false : cursorNodes[0].nextSibling.nodeName === 'BR'))) {
                detach(cursorNodes[0].nodeName === '#text' ? cursorNodes[0].nextSibling : cursorNodes[0]);
            }
            if (!isNOU(cursorNodes[0] && cursorNodes[0].parentElement) && IsFormatted.inlineTags.
                indexOf((cursorNodes[0].parentElement).tagName.toLowerCase()) !== -1 && cursorNodes[0].textContent.includes('\u200B')) {
                const element: HTMLElement = this.GetFormatNode(format, value);
                const tempNode: Node = cursorNodes[0];
                if (format === 'fontsize') {
                    let currentFormatNode: Node = cursorNodes[0];
                    while (currentFormatNode) {
                        const isSameTextContent: boolean = currentFormatNode.parentElement.textContent.trim()
                            === cursorNodes[0].textContent.trim();
                        const previousElement: HTMLElement = currentFormatNode.parentElement;
                        if (!domNode.isBlockNode(previousElement) && isSameTextContent &&
                            !(previousElement.nodeName === 'SPAN' && (previousElement as HTMLElement).classList.contains('e-img-inner'))) {
                            currentFormatNode = previousElement;
                        } else {
                            break;
                        }
                        cursorNodes[0] = currentFormatNode;
                    }
                }
                this.applyStyles(cursorNodes, 0, element);
                return tempNode;
            }
            cursorNode = this.getInsertNode(docElement, range, format, value).firstChild;
        }
        return cursorNode;
    }

    private static getCursorFormat(isFormatted: IsFormatted, cursorNodes: Node[], format: string, endNode: Node): Node {
        let currentNode: Node;
        for (let index: number = 0; index < cursorNodes.length; index++) {
            currentNode = (cursorNodes[index as number] as HTMLElement).lastElementChild ?
                (cursorNodes[index as number] as HTMLElement).lastElementChild : cursorNodes[index as number];
        }
        return (format === 'fontsize' && isFormatted.getFormattedNode(currentNode, format, endNode) == null && currentNode.parentElement.nodeName === 'SPAN') ? currentNode.parentElement : isFormatted.getFormattedNode(currentNode, format, endNode);
    }

    private static removeFormat(
        nodes: Node[],
        index: number,
        formatNode: Node,
        isCursor: boolean,
        isTableCell: boolean,
        isFormat: boolean,
        isFontStyle: boolean,
        range: Range,
        nodeCutter: NodeCutter,
        format: string,
        value: string,
        domSelection: NodeSelection,
        endNode: Node,
        domNode: DOMNode): Node {
        let splitNode: HTMLElement = null;
        const startText: string = range.startContainer.nodeName === '#text' ?
            range.startContainer.textContent.substring(range.startOffset, range.startContainer.textContent.length) :
            range.startContainer.textContent;
        const nodeText : string = nodes[index as number].textContent;
        const isParentNodeSameAsParentElement : boolean = nodes[0].parentElement.nodeName === nodes[0].parentElement.parentElement.nodeName;
        if (!(range.startContainer === range.endContainer && range.startOffset === 0
            && range.endOffset === (range.startContainer as Text).length
            && (range.startContainer.textContent === formatNode.textContent || isParentNodeSameAsParentElement))) {
            const nodeIndex: number[] = [];
            let cloneNode: Node = nodes[index as number];
            const clonedElement: Node = cloneNode;
            do {
                nodeIndex.push(domSelection.getIndex(cloneNode));
                cloneNode = cloneNode.parentNode;
            } while (cloneNode && (cloneNode !== formatNode));
            if (nodes[index as number].nodeName !== 'BR') {
                if (clonedElement.nodeName === '#text' && clonedElement.textContent.includes('\u200B')) {
                    (clonedElement as Element).remove();
                }
                if (!isTableCell) {
                    cloneNode = splitNode = (isCursor && (formatNode.textContent.length - 1) === range.startOffset) ?
                        nodeCutter.SplitNode(range, formatNode as HTMLElement, true) as HTMLElement
                        : nodeCutter.GetSpliceNode(range, formatNode as HTMLElement) as HTMLElement;
                }
            }
            if (!isCursor) {
                while (cloneNode && cloneNode.childNodes.length > 0 && ((nodeIndex.length - 1) >= 0)
                    && (cloneNode.childNodes.length > nodeIndex[nodeIndex.length - 1])) {
                    if (cloneNode.childNodes.length > 1  && nodeIndex.length > 1) {
                        cloneNode = cloneNode.childNodes[nodeIndex[nodeIndex.length - 2]];
                        break;
                    } else  {
                        cloneNode = cloneNode.childNodes[nodeIndex[nodeIndex.length - 1]];
                        nodeIndex.pop();
                    }
                }
                if (nodes[index as number].nodeName !== 'BR') {
                    while (cloneNode.nodeType === 1 && cloneNode.childNodes.length > 0) {
                        cloneNode = cloneNode.childNodes[0];
                    }
                    if (cloneNode.nodeType === 3 && !(isCursor && cloneNode.nodeValue === '')) {
                        nodes[index as number] = cloneNode;
                    } else {
                        const divNode: HTMLDivElement = document.createElement('div');
                        divNode.innerHTML = '&#8203;';
                        if (cloneNode.nodeType !== 3) {
                            cloneNode.insertBefore(divNode.firstChild, cloneNode.firstChild);
                            nodes[index as number] = cloneNode.firstChild;
                        } else {
                            cloneNode.parentNode.insertBefore(divNode.firstChild, cloneNode);
                            nodes[index as number] = cloneNode.previousSibling;
                            cloneNode.parentNode.removeChild(cloneNode);
                        }
                    }
                }
            } else {
                let lastNode: Node = splitNode;
                for (; lastNode.firstChild !== null && lastNode.firstChild.nodeType !== 3; null) {
                    lastNode = lastNode.firstChild;
                }
                (lastNode as HTMLElement).innerHTML = '&#8203;';
                nodes[index as number] = lastNode.firstChild;
            }
        } else if (isFontStyle && !nodes[index as number].contains(formatNode) && nodes[index as number].nodeType === 3 &&
                    nodes[index as number].textContent !== formatNode.textContent) {
            // If the selection is within the format node .
            const isFullNodeSelected: boolean = nodes[index as number].textContent === (nodes[index as number] as Text).wholeText;
            let nodeTraverse: Node = nodes[index as number];
            const styleElement: HTMLElement = this.GetFormatNode(format, value);
            // while loop and traverse back until text content does not match with parent text content
            while (nodeTraverse && nodeTraverse.textContent === nodeTraverse.parentElement.textContent) {
                nodeTraverse = nodeTraverse.parentElement;
            }
            if (isFullNodeSelected && formatNode.textContent !== nodeTraverse.textContent) {
                const nodeArray : Node[] = [];
                const priorityNode: Node = this.getPriorityFormatNode(nodeTraverse, endNode);
                if (priorityNode && priorityNode.textContent === nodeTraverse.textContent) {
                    nodeTraverse = priorityNode;
                }
                nodeArray.push(nodeTraverse);
                this.applyStyles(nodeArray, 0, styleElement);
                return nodes[index as number];
            }
        }
        let fontStyle: string;
        if (format === 'backgroundcolor') {
            fontStyle = (formatNode as HTMLElement).style.fontSize;
        }
        let bgStyle: string;
        if (format === 'fontsize') {
            const bg: Element = closest(nodes[index as number].parentElement, 'span[style*=' + 'background-color' + ']');
            if (!isNOU(bg)) {
                bgStyle = (bg as HTMLElement).style.backgroundColor;
            }
        }
        const formatNodeStyles: string = (formatNode as HTMLElement).getAttribute('style');
        const formatNodeTagName: string = (formatNode as HTMLElement).tagName;
        let child: Node[];
        if (formatNodeTagName === 'A' && format === 'underline') {
            (formatNode as HTMLElement).style.textDecoration = 'none';
            child = [formatNode];
        }
        else if (IsFormatted.inlineTags.indexOf(formatNodeTagName.toLowerCase()) !== -1 && isFontStyle && formatNodeTagName.toLocaleLowerCase() !== 'span') {
            const fontNodeStyle: CSSStyleDeclaration = (formatNode as HTMLElement).style;
            if (fontNodeStyle.color && format === 'fontcolor') {
                if (formatNode.nodeName === 'A') {
                    fontNodeStyle.color = value;
                } else{
                    fontNodeStyle.color = '';
                }
            } else if (fontNodeStyle.backgroundColor && format === 'backgroundcolor') {
                fontNodeStyle.backgroundColor = '';
            } else if (fontNodeStyle.fontSize && format === 'fontsize') {
                fontNodeStyle.fontSize = '';
            } else if (fontNodeStyle.fontFamily && format === 'fontname') {
                fontNodeStyle.fontFamily = '';
            }
            if ((formatNode as HTMLElement).getAttribute('style') === ''){
                (formatNode as HTMLElement).removeAttribute('style');
            }
            child = [formatNode];
        }
        else {
            child = InsertMethods.unwrap(formatNode);
            if (index === 0) {
                this.isUnwrapped = true;
            }
            let liElement: HTMLElement = nodes[index as number].parentElement;
            if (!isNOU(liElement) && liElement.tagName.toLowerCase() !== 'li'){
                liElement = closest(liElement, 'li') as HTMLElement;
            }
            if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' &&
                (liElement.textContent.trim() === nodes[index as number].textContent.trim() ||
                (liElement.innerText.split('\n').length === nodes.length && liElement.innerText.split('\n')[0] === nodes[index as number].textContent.trim()))) {
                if (format === 'bold') {
                    liElement.style.fontWeight = '';
                } else if (format === 'italic') {
                    liElement.style.fontStyle = '';
                }
                else if (format === 'fontsize') {
                    liElement.style.fontSize = '';
                }
            }
            else if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li'
                && liElement.textContent.trim() !== nodes[index as number].textContent.trim()) {
                if (format === 'bold') {
                    liElement.style.fontWeight = '';
                } else if (format === 'italic') {
                    liElement.style.fontStyle = '';
                }
                SelectionCommands.conCatenateTextNode(liElement, format, '', 'normal', value);
            }
        }
        if (child[0] && !isFontStyle) {
            let nodeTraverse: Node = child[index as number] ? child[index as number] : child[0];
            const textNode: Node = nodeTraverse;
            for ( ; nodeTraverse && nodeTraverse.parentElement && nodeTraverse.parentElement !== endNode;
                // eslint-disable-next-line
                nodeTraverse = nodeTraverse ) {
                let nodeTraverseCondition: boolean;
                if (formatNode.nodeName === 'SPAN') {
                    nodeTraverseCondition = nodeTraverse.parentElement.tagName.toLocaleLowerCase()
                    === (formatNode as HTMLElement).tagName.toLocaleLowerCase() && nodeTraverse.parentElement.getAttribute('style') === formatNodeStyles;
                } else {
                    nodeTraverseCondition = nodeTraverse.parentElement.tagName.toLocaleLowerCase()
                    === (formatNode as HTMLElement).tagName.toLocaleLowerCase();
                }
                if (nodeTraverse.parentElement && nodeTraverseCondition &&
                    (nodeTraverse.parentElement.childElementCount > 1 || range.startOffset > 1)) {
                    if (textNode.parentElement && textNode.parentElement.tagName.toLocaleLowerCase()
                        === (formatNode as HTMLElement).tagName.toLocaleLowerCase()) {
                        if ((range.startOffset === range.endOffset) && textNode.nodeType !== 1 &&
                        !isNOU(textNode.textContent) && textNode.parentElement.childElementCount > 1) {
                            range.setStart(textNode, 0);
                            range.setEnd(textNode, textNode.textContent.length);
                            nodeCutter.SplitNode(range, textNode.parentElement, false);
                        }
                    }
                    if (nodeTraverse.parentElement.tagName.toLocaleLowerCase() === 'span') {
                        if ((formatNode as HTMLElement).style.textDecoration === 'underline' &&
                            nodeTraverse.parentElement.style.textDecoration !== 'underline') {
                            nodeTraverse = nodeTraverse.parentElement;
                            continue;
                        }
                    }
                    InsertMethods.unwrap(nodeTraverse.parentElement);
                    nodeTraverse = !isNOU(nodeTraverse.parentElement) && !domNode.isBlockNode(nodeTraverse.parentElement) ? textNode :
                        nodeTraverse.parentElement;
                } else {
                    nodeTraverse = nodeTraverse.parentElement;
                }
            }
        }
        if (child.length > 0 && isFontStyle) {
            for (let num: number = 0; num < child.length; num++) {
                if (child[num as number].nodeType !== 3 || (child[num as number].textContent &&
                     child[num as number].textContent.trim().length > 0)) {
                    if (value !== '' && value !== 'transparent') {
                        child[num as number] = InsertMethods.Wrap(
                            child[num as number] as HTMLElement,
                            this.GetFormatNode(format, value, formatNodeTagName, formatNodeStyles));
                    }
                    let liElement: HTMLElement = nodes[index as number].parentElement;
                    if (!isNOU(liElement) && liElement.tagName.toLowerCase() !== 'li'){
                        liElement = closest(liElement, 'li') as HTMLElement;
                    }
                    if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' &&
                            liElement.textContent.trim() === nodes[index as number].textContent.trim()) {
                        if (format === 'fontname'){
                            liElement.style.fontFamily = value;
                        }
                    }
                    if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li'
                        && liElement.textContent.trim() !== nodes[index as number].textContent.trim()) {
                        liElement.removeAttribute('style');
                    }
                    if (child[num as number].textContent === startText && (range.startContainer.nodeName === '#text' || range.startContainer.nodeName !== '#text'
                        && (range.startContainer as Element).classList && !(range.startContainer as Element).classList.contains('e-multi-cells-select')) ) {
                        if (num === 0) {
                            range.setStartBefore(child[num as number]);
                        }
                        else if (num === child.length - 1) {
                            range.setEndAfter(child[num as number]);
                        }
                    }
                }
            }
            const currentNodeElem: HTMLElement = nodes[index as number].parentElement;
            if (!isNOU(fontStyle) && fontStyle !== '') {
                currentNodeElem.style.fontSize = fontStyle;
            }
            if (!isNOU(bgStyle) && bgStyle !== '') {
                currentNodeElem.style.backgroundColor = bgStyle;
            }
            if (format === 'fontsize' || format === 'fontcolor' || format === 'fontname') {
                let liElement: HTMLElement = nodes[index as number].parentElement;
                let parentElement: HTMLElement = nodes[index as number].parentElement;
                while (!isNOU(parentElement) && parentElement.tagName.toLowerCase() !== 'li') {
                    parentElement = parentElement.parentElement;
                    liElement = parentElement;
                }
                let num: number = index;
                let liChildContent : string = '';
                while (num >= 0 && !isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' && (liElement as Node).contains(nodes[num as number]) &&
                    liElement.textContent.replace('/\u200B/g', '').trim().includes(nodes[num as number].textContent.trim())) {
                    /* eslint-enable security/detect-object-injection */
                    liChildContent = nodes[num as number].textContent + liChildContent;
                    num--;
                }
                let isNestedList : boolean = false;
                let nestedListCount : number = 0;
                let isNestedListItem : boolean = false;
                if (!isNOU(liElement) && liElement.childNodes) {
                    for (let num: number = 0; num < liElement.childNodes.length; num++) {
                        if (liElement.childNodes[num as number].nodeName === 'OL' || liElement.childNodes[num as number].nodeName === 'UL'){
                            nestedListCount++;
                            isNestedList = true;
                        }
                    }
                }
                if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' &&
                    liElement.textContent.split('\u200B').join('').trim() === liChildContent.split('\u200B').join('').trim()) {
                    if (format === 'fontsize') {
                        liElement.style.fontSize = value;
                    } else if (format === 'fontname') {
                        liElement.removeAttribute('style');
                    }
                    else {
                        liElement.style.color = value;
                        liElement.style.textDecoration = 'inherit';
                    }
                }
                else if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' && isNestedList) {
                    if (isNestedList && nestedListCount > 0) {
                        for (let num : number = 0; num < liElement.childNodes.length; num++) {
                            if (nodes[index as number].textContent === liElement.childNodes[num as number].textContent && nodes[index as number].textContent === nodeText && liElement.textContent.replace('/\u200B/g', '').trim().includes(liChildContent.split('\u200B').join('').trim())) {
                                isNestedListItem = true;
                            }
                        }
                    }
                    if (isNestedListItem) {
                        for (let num : number = 0; num < liElement.childNodes.length; num++) {
                            if (liElement.childNodes[num as number].nodeName === 'OL' || liElement.childNodes[num as number].nodeName === 'UL') {
                                (liElement.childNodes[num as number] as HTMLElement).removeAttribute('style');
                            }
                        }
                        if (format === 'fontsize') {
                            liElement.style.fontSize = value;
                        } else if (format === 'fontname') {
                            liElement.removeAttribute('style');
                        }
                        else {
                            liElement.style.color = value;
                            liElement.style.textDecoration = 'inherit';
                        }
                    }
                }
            }
        }
        return nodes[index as number];
    }

    private static insertFormat(
        docElement: Document,
        nodes: Node[],
        index: number,
        formatNode: Node,
        isCursor: boolean,
        isTableSelect: boolean,
        isFormat: boolean,
        isFontStyle: boolean,
        range: Range,
        nodeCutter: NodeCutter,
        format: string,
        value: string,
        painterValues: FormatPainterValue,
        domNode: DOMNode,
        endNode: Node): Node {
        if (!isCursor) {
            if ((formatNode === null && isFormat) || isFontStyle) {
                if (!isTableSelect && nodes[index as number].nodeName !== 'BR' ) {
                    nodes[index as number] = nodeCutter.GetSpliceNode(range, nodes[index as number] as HTMLElement);
                    nodes[index as number].textContent = nodeCutter.TrimLineBreak((nodes[index as number] as Text).textContent);
                }
                if (format === 'uppercase' || format === 'lowercase') {
                    nodes[index as number].textContent = (format === 'uppercase') ? nodes[index as number].textContent.toLocaleUpperCase()
                        : nodes[index as number].textContent.toLocaleLowerCase();
                } else if (!(isFontStyle === true && value === '')) {
                    const element: HTMLElement = this.GetFormatNode(format, value);
                    if (value === 'formatPainter' || isFontStyle) {
                        let liElement: HTMLElement = nodes[index as number].parentElement;
                        let parentElement: HTMLElement = nodes[index as number].parentElement;
                        while (!isNOU(parentElement) && parentElement.tagName.toLowerCase() !== 'li') {
                            parentElement = parentElement.parentElement;
                            liElement = parentElement;
                        }
                        if (format === 'fontcolor' || format === 'fontname' || format === 'fontsize') {
                            const parentElem: HTMLElement = parentElement && parentElement.tagName === 'LI' ? parentElement : nodes[index as number].parentElement;
                            if (!isNOU(parentElem) && parentElem.childNodes) {
                                for (let i: number = 0; i < parentElem.childNodes.length; i++) {
                                    if (this.concatenateTextExcludingList(nodes, index) === nodes[index as number].textContent){
                                        let liElement: HTMLElement;
                                        if (parentElem.tagName === 'LI') {
                                            liElement = parentElem;
                                        } else if (parentElem.closest('li')) {
                                            liElement = parentElem.closest('li');
                                        }
                                        if (!isNOU(liElement)){
                                            switch (format){
                                            case 'fontcolor':
                                                liElement.style.color = value;
                                                break;
                                            case 'fontname':
                                                liElement.style.fontFamily = value;
                                                break;
                                            case 'fontsize':
                                                liElement.style.fontSize = value;
                                                break;
                                            default:
                                                break;
                                            }
                                        }
                                    }
                                    const childElement: HTMLElement = parentElem.childNodes[i as number] as HTMLElement;
                                    if (childElement.tagName === 'OL' || childElement.tagName === 'UL') {
                                        switch (format) {
                                        case 'fontcolor':
                                            childElement.style.color = 'initial';
                                            break;
                                        case 'fontname':
                                            childElement.style.fontFamily = 'initial';
                                            break;
                                        case 'fontsize':
                                            childElement.style.fontSize = 'initial';
                                            break;
                                        default:
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' &&
                            liElement.textContent.trim() === nodes[index as number].textContent.trim()) {
                            if (format === 'fontsize') {
                                liElement.style.fontSize = value;
                            } else if (format === 'fontcolor'){
                                liElement.style.color = value;
                                liElement.style.textDecoration = 'inherit';
                            } else if (format === 'fontname'){
                                liElement.style.fontFamily = value;
                            }
                        }
                        if (value === 'formatPainter') {
                            return this.insertFormatPainterElem(nodes, index, range, nodeCutter, painterValues, domNode);
                        }
                        const currentNode: Node = nodes[index as number];
                        const priorityNode: Node = this.getPriorityFormatNode(currentNode, endNode);
                        // 1. Checking is there any priority node present in the selection range. (Use case for nested styles);
                        // 2  Or font style is applied. (Use case not a nested style)
                        if (!isNOU(priorityNode) || isFontStyle) {
                            let currentFormatNode: Node = isNOU(priorityNode) ? currentNode : priorityNode;
                            currentFormatNode = !isNOU(priorityNode) && (priorityNode as HTMLElement).style.fontSize !== '' ?
                                currentFormatNode.firstChild as Node : currentFormatNode;
                            if (isNOU(priorityNode) || format === 'fontsize') {
                                while (currentFormatNode) {
                                    const isSameTextContent: boolean = currentFormatNode.parentElement.textContent.trim()
                                        === nodes[index as number].textContent.trim();
                                    const parent: HTMLElement = currentFormatNode.parentElement;
                                    if (!domNode.isBlockNode(parent) && isSameTextContent &&
                                    !(parent.nodeName === 'SPAN' && (parent as HTMLElement).classList.contains('e-img-inner'))) {
                                        currentFormatNode = parent;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            const nodeList: Node[] = [];
                            // Since color is different for different themnes, we need to wrap the fontColor over the text node.
                            if (isFontStyle) {
                                const closestAnchor: Node = closest(nodes[index as number].parentElement, 'A');
                                if (!isNOU(closestAnchor) && closestAnchor.firstChild.textContent.trim()
                                     === nodes[index as number].textContent.trim() ) {
                                    currentFormatNode = nodes[index as number];
                                }
                            }
                            if (nodes[index as number].textContent.trim() !== currentFormatNode.textContent.trim()) {
                                currentFormatNode = nodes[index as number];
                            }
                            nodeList[0] = currentFormatNode;
                            this.applyStyles(nodeList, 0, element);
                            if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li'
                                && liElement.textContent.trim() !== nodes[index as number].textContent.trim()) {
                                SelectionCommands.conCatenateTextNode(liElement, format, liElement.textContent, format, value);
                            }
                        } else {
                            nodes[index as number] = this.applyStyles(nodes, index, element);
                        }
                    } else {
                        let liElement: HTMLElement = nodes[index as number].parentElement;
                        nodes[index as number] = this.applyStyles(nodes, index, element);
                        if (!isNOU(liElement) && liElement.tagName.toLowerCase() !== 'li'){
                            liElement = closest(liElement, 'li') as HTMLElement;
                        }
                        if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li' &&
                        (liElement.textContent.trim() === nodes[index as number].textContent.trim() ||
                        (liElement.innerText.split('\n').length === nodes.length && liElement.innerText.split('\n')[0] === nodes[index as number].textContent.trim()))) {
                            if (format === 'bold') {
                                liElement.style.fontWeight = 'bold';
                            } else if (format === 'italic') {
                                liElement.style.fontStyle = 'italic';
                            }
                        }
                        else if (!isNOU(liElement) && liElement.tagName.toLowerCase() === 'li'
                            && liElement.textContent.trim() !== nodes[index as number].textContent.trim()) {
                            SelectionCommands.conCatenateTextNode(liElement, format, liElement.textContent, format);
                        }
                    }
                }
            } else {
                if (!isTableSelect && nodes[index as number].isConnected) {
                    nodes[index as number] = nodeCutter.GetSpliceNode(range, nodes[index as number] as HTMLElement);
                }
            }
        } else {
            if (format !== 'uppercase' && format !== 'lowercase') {
                const element: HTMLElement = this.getInsertNode(docElement, range, format, value);
                nodes[index as number] = element.firstChild;
                nodeCutter.position = 1;
            } else {
                nodeCutter.position = range.startOffset;
            }
        }
        return nodes[index as number];
    }
    private static applyStyles(nodes: Node[], index: number, element: HTMLElement): Node {
        if (!(nodes[index as number].nodeName === 'BR' && this.enterAction === 'BR')) {
            nodes[index as number] = (index === (nodes.length - 1)) || nodes[index as number].nodeName === 'BR' ?
                InsertMethods.Wrap(nodes[index as number] as HTMLElement, element)
                : InsertMethods.WrapBefore(nodes[index as number] as Text, element, true);
            nodes[index as number] = this.getChildNode(nodes[index as number], element);
        }
        return nodes[index as number];
    }

    private static getPriorityFormatNode(node: Node, endNode: Node): Node | null {
        const isFormatted: IsFormatted = new IsFormatted();
        const fontSizeNode: Node = isFormatted.getFormattedNode(node, 'fontsize', endNode);
        let fontColorNode: Node;
        let backgroundColorNode: Node;
        let fontNameNode: Node;
        if (isNOU(fontSizeNode)) {
            backgroundColorNode = isFormatted.getFormattedNode(node, 'backgroundcolor', endNode);
            if (isNOU(backgroundColorNode)) {
                fontNameNode = isFormatted.getFormattedNode(node, 'fontname', endNode);
                if (isNOU(fontNameNode)) {
                    fontColorNode = isFormatted.getFormattedNode(node, 'fontcolor', endNode);
                    if (isNOU(fontColorNode)) {
                        return null;
                    } else {
                        return fontColorNode;
                    }
                } else {
                    return fontNameNode;
                }
            } else {
                return backgroundColorNode;
            }
        } else {
            return fontSizeNode;
        }
    }

    private static getInsertNode(docElement: Document, range: Range, format: string, value: string): HTMLElement {
        const element: HTMLElement = this.GetFormatNode(format, value);
        element.innerHTML = '&#8203;';
        if (Browser.isIE) {
            const frag: DocumentFragment = docElement.createDocumentFragment();
            frag.appendChild(element);
            range.insertNode(frag);
        } else {
            range.insertNode(element);
        }
        return element;
    }

    private static getChildNode(node: Node, element: HTMLElement): Node {
        if (node === undefined || node === null) {
            element.innerHTML = '&#8203;';
            node = element.firstChild;
        }
        return node;
    }


    private static applySelection(
        nodes: Node[],
        domSelection: NodeSelection,
        nodeCutter: NodeCutter,
        index: number,
        isCollapsed: boolean): NodeSelection {
        if (nodes.length === 1 && !isCollapsed) {
            domSelection.startContainer = domSelection.getNodeArray(
                nodes[index as number],
                true);
            domSelection.endContainer = domSelection.startContainer;
            domSelection.startOffset = 0;
            domSelection.endOffset = nodes[index as number].textContent.length;
        } else if (nodes.length === 1 && isCollapsed) {
            domSelection.startContainer = domSelection.getNodeArray(
                nodes[index as number],
                true);
            domSelection.endContainer = domSelection.startContainer;
            domSelection.startOffset = nodeCutter.position;
            domSelection.endOffset = nodeCutter.position;
        } else if (index === 0) {
            domSelection.startContainer = domSelection.getNodeArray(
                nodes[index as number],
                true);
            domSelection.startOffset = 0;
        } else if (index === nodes.length - 1) {
            domSelection.endContainer = domSelection.getNodeArray(
                nodes[index as number],
                false);
            domSelection.endOffset = nodes[index as number].textContent.length;
        }
        return domSelection;
    }

    private static GetFormatNode(format: string, value?: string, tagName?: string, styles?: string): HTMLElement {
        let node: HTMLElement;
        switch (format) {
        case 'bold':
            return document.createElement('strong');
        case 'italic':
            return document.createElement('em');
        case 'underline':
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.textDecoration = 'underline';
            return node;
        case 'strikethrough':
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.textDecoration = 'line-through';
            return node;
        case 'superscript':
            return document.createElement('sup');
        case 'subscript':
            return document.createElement('sub');
        case 'fontcolor':
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.color = value;
            node.style.textDecoration = 'inherit';
            return node;
        case 'fontname':
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.fontFamily = value;
            return node;
        case 'fontsize':
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.fontSize = value;
            return node;
        case 'inlinecode':
            return document.createElement('code');
        default:
            node = document.createElement('span');
            this.updateStyles(node, tagName, styles);
            node.style.backgroundColor = value;
            return node;
        }
    }

    private static updateStyles(ele: HTMLElement, tag: string, styles: string): void {
        if (styles !== null && tag === 'SPAN') {
            ele.style.cssText = styles;
        }
    }

    // Below function is used to insert the element created by the format painter plugin.
    private static insertFormatPainterElem(nodes: Node[], index: number, range: Range, nodeCutter: NodeCutter,
                                           painterValues: FormatPainterValue, domNode: DOMNode): Node {
        let parent: HTMLElement = !domNode.isBlockNode(nodes[index as number].parentElement) ?
            nodes[index as number].parentElement as HTMLElement : nodes[index as number] as HTMLElement ;
        if (!domNode.isBlockNode(parent)) {
            while (parent.textContent.trim() === parent.parentElement.textContent.trim() && !domNode.isBlockNode(parent.parentElement)){
                parent = parent.parentElement;
            }
        }
        // The below code is used to remove the already present inline style from the text node.
        if (!isNOU(parent) && parent.nodeType === 1 && !(parent.classList.contains('e-rte-img-caption') || parent.classList.contains('e-img-inner'))) {
            this.formatPainterCleanup(index, nodes, parent, range, nodeCutter, domNode);
        }
        const elem: HTMLElement = painterValues.element;
        // The below code is used to apply the inline format copied.
        if (!isNOU(elem)) {
            // Step 1: Cloning the element that is created by format painter.
            // Step 2: Finding the last child of the nested elememt using the paintervalues.lastchild nodename
            // Step 3: Assigning the nodes[index] text content to the last child element.
            // Step 4: Wrapping the cloned element with the nodes[index]
            const clonedElement: Node = elem.cloneNode(true);
            const elemList: NodeList = (clonedElement as HTMLElement).querySelectorAll(painterValues.lastChild.nodeName);
            let lastElement: Node;
            if (elemList.length > 0){
                lastElement = elemList[elemList.length - 1];
            } else{
                if (!isNOU(clonedElement) && clonedElement.nodeName === painterValues.lastChild.nodeName){
                    lastElement = clonedElement;
                }
            }
            lastElement.textContent =  nodes[index as number].textContent;
            const lastChild: Node = lastElement.childNodes[0];
            nodes[index as number] = InsertMethods.Wrap(nodes[index as number] as HTMLElement, clonedElement as HTMLElement);
            nodes[index as number].textContent = '';
            nodes[index as number] = lastChild;
        }
        return nodes[index as number];
    }

    private static formatPainterCleanup(index: number, nodes: Node[], parent: HTMLElement, range: Range, nodeCutter: NodeCutter
        , domNode: DOMNode): void{
        const INVALID_TAGS: string[] = ['A', 'AUDIO', 'IMG', 'VIDEO', 'IFRAME'];
        if (index === 0 && parent.textContent.trim() !== nodes[index as number].textContent.trim()) {
            nodeCutter.SplitNode(range, parent, true);
            const childELemList: NodeList = nodes[index as number].parentElement.childNodes;
            for ( let i: number = 0; i < childELemList.length; i++) {
                if (childELemList[i as number].textContent.trim() === nodes[i as number].textContent.trim()) {
                    parent.parentNode.insertBefore(childELemList[i as number], parent);
                    break;
                }
            }
            const blockChildNodes: NodeList =  parent.parentElement.childNodes;
            for (let k: number = 0; k < blockChildNodes.length; k++ ) {
                if ((blockChildNodes[k as number].textContent.trim() === '' || blockChildNodes[k as number].textContent.length === 0) &&
                    blockChildNodes[k as number].textContent.charCodeAt(0) !== 160) {
                    // 160 is the char code for &nbsp;
                    detach(blockChildNodes[k as number]);
                }
            }
        } else if (parent.textContent.trim() !== nodes[index as number].textContent.trim()) {
            parent.parentElement.insertBefore(nodes[index as number], parent);
        } else {
            while (!isNOU(parent) && parent.nodeType !== 3 && !domNode.isBlockNode(parent)){
                let temp: HTMLElement;
                for (let i: number = 0; i < parent.childNodes.length; i++) {
                    const currentChild : Node = parent.childNodes[i as number];
                    if (currentChild.textContent.trim().length !== 0 && currentChild.nodeType !== 3) {
                        temp = parent.childNodes[i as number] as HTMLElement;
                    }
                }
                if (INVALID_TAGS.indexOf(parent.tagName) === -1) {
                    InsertMethods.unwrap(parent);
                }
                parent = temp;
            }
        }
    }
    private static concatenateTextExcludingList(nodes: Node[], index: number): string {
        let result: string = '';
        const parentNode: HTMLElement = nodes[index as number].nodeName === '#text' ? closest(nodes[index as number].parentElement, 'li') as HTMLElement : closest(nodes[index as number], 'li') as HTMLElement;
        if (!isNOU(parentNode)) {
            for (let i: number = 0; i < parentNode.childNodes.length; i++) {
                const childNode: HTMLElement = parentNode.childNodes[i as number] as HTMLElement;
                if ((childNode.nodeType === 3) || (childNode.nodeType === 1 && (childNode.tagName !== 'OL' && childNode.tagName !== 'UL'))) {
                    result += childNode.textContent;
                }
            }
        }
        return result;
    }
    private static conCatenateTextNode(liElement: HTMLElement, format: string, value: string, formatStr: string, constVal?: string): void {
        let result: string = '';
        let colorStyle: string = '';
        let fontSize: string = '';
        let fontFamily: string = '';
        switch (format) {
        case 'bold':
            liElement.querySelectorAll('strong').forEach(function (e: HTMLElement): void {
                result = result + e.textContent;
            });
            if (result === value) {
                liElement.style.fontWeight = formatStr;
            }
            break;
        case 'italic':
            liElement.querySelectorAll('em').forEach(function (e: HTMLElement): void {
                result = result + e.textContent;
            });
            if (result === value) {
                liElement.style.fontStyle = formatStr;
            }
            break;
        case 'fontcolor':
            liElement.querySelectorAll('span').forEach(function (span: HTMLElement): void {
                colorStyle = span.style.color;
                if (SelectionCommands.hasColorsEqual(colorStyle, constVal)) {
                    result = result + span.textContent;
                }
            });
            if (!isNOU(result) && !isNOU(value) && result !== '' && value !== '' && result.replace(/\s+/g, '') === value.replace(/\s+/g, '')) {
                liElement.style.color = constVal;
                liElement.style.textDecoration = 'inherit';
            }
            break;
        case 'fontsize':
            liElement.querySelectorAll('span').forEach(function (span: HTMLElement): void {
                fontSize = span.style.getPropertyValue('font-size');
                if (fontSize === constVal) {
                    result = result + span.textContent;
                }
            });
            if (!isNOU(result) && !isNOU(value) && result !== '' && value !== '' && result.replace(/\s+/g, '') === value.replace(/\s+/g, '')) {
                liElement.style.fontSize = constVal;
            }
            break;
        case 'fontname':
            liElement.querySelectorAll('span').forEach(function (span: HTMLElement): void {
                fontFamily = span.style.getPropertyValue('font-family');
                fontFamily = fontFamily.replace(/ /g, '');
                if (fontFamily === constVal) {
                    result = result + span.textContent;
                }
            });
            if (!isNOU(result) && !isNOU(value) && result !== '' && value !== '' && result.replace(/\s+/g, '') === value.replace(/\s+/g, '')) {
                liElement.style.fontFamily = constVal;
            }
            break;
        }
    }

    private static hasColorsEqual (color1: string, color2: string): boolean {
        if (isNOU(color1) || isNOU(color2) || color1.trim() === '' || color2.trim() === '') {
            return color1 === color2;
        }
        if (color1.startsWith('rgb(')) {
            color1 = color1.replace('rgb(', 'rgba(').slice(0, -1) + ',1)';
        }
        if (color2.startsWith('rgb(')) {
            color2 = color2.replace('rgb(', 'rgba(').slice(0, -1) + ',1)';
        }
        return color1.replace(/\s+/g, '') === color2.replace(/\s+/g, '');
    }

    private static isMentionStartOrEnd(editableElement: HTMLDivElement, start: Node, end: Node): MentionPositionType {
        let type: MentionPositionType = 'None';
        const domTree: DOMMethods = new DOMMethods(editableElement);
        const startParent: HTMLElement = domTree.getTopMostNode(start as Text) as HTMLElement;
        const endParent: HTMLElement = domTree.getTopMostNode(end as Text) as HTMLElement;
        if ((startParent.nodeType === Node.ELEMENT_NODE && !startParent.isContentEditable) &&
        (endParent.nodeType === Node.ELEMENT_NODE && !endParent.isContentEditable)) {
            type = 'Both';
        }
        if (startParent.nodeType === Node.ELEMENT_NODE && !startParent.isContentEditable) {
            type = 'Start';
        }
        if (endParent.nodeType === Node.ELEMENT_NODE && !endParent.isContentEditable) {
            type = 'End';
        }
        return type;
    }
}
/**
 * Type used to define the position of the Mention ELement(AKA Content Editable False)
 */
type MentionPositionType = 'Start' | 'End' | 'None' | 'Both';
