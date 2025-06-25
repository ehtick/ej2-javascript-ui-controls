import { detach, isNullOrUndefined as isNOU} from '../../../base'; /*externalscript*/
import * as events from '../constant';
import { SfRichTextEditor } from '../sf-richtexteditor-fn';

/**
 * XhtmlValidation module called when set enableXhtml as true
 */
export class XhtmlValidation {
    private parent: SfRichTextEditor;
    private currentElement: HTMLElement;
    constructor(parent?: SfRichTextEditor) {
        this.parent = parent;
        this.addEventListener();
    }
    private addEventListener(): void {
        this.parent.observer.on(events.xhtmlValidation, this.enableXhtmlValidation, this);
        this.parent.observer.on(events.destroy, this.removeEventListener, this);
    }
    private removeEventListener(): void {
        this.parent.observer.off(events.xhtmlValidation, this.enableXhtmlValidation);
        this.parent.observer.off(events.destroy, this.removeEventListener);
    }
    private enableXhtmlValidation(): void {
        if (this.parent.enableXhtml) {
            if (isNOU(this.parent.inputElement)) {
                this.currentElement = this.parent.element;
            } else {
                this.currentElement = this.parent.inputElement;
            }
            this.clean(this.currentElement);
            this.ImageTags();
            this.removeTags();
            this.RemoveUnsupported();
            this.currentElement.innerHTML = this.selfEncloseValidation(this.currentElement.innerHTML);
        }
    }
    public selfEncloseValidation(currentValue: string): string {
        currentValue = currentValue.replace(/<br>/g, '<br/>').replace(/<hr>/g, '<hr/>').replace(/ /g, ' ');
        let valueTemp: RegExpExecArray;
        const valueDupe: string[] = [];
        let valueOriginal: string[] = [];
        const imgRegexp: RegExp[] = [ /<img(.*?)>/gi, /<area(.*?)>/gi, /<base(.*?)>/gi, /<col (.*?)>/gi, /<embed(.*?)>/gi,
            /<input(.*?)>/gi, /<link(.*?)>/gi, /<meta(.*?)>/gi, /<param(.*?)>/gi, /<source(.*?)>/gi,
            /<track(.*?)>/gi, /<wbr(.*?)>/gi ];
        for (let j: number = 0; j < imgRegexp.length; j++) {
            valueTemp = imgRegexp[j as number].exec(currentValue);
            while ((valueTemp) !== null) {
                valueDupe.push(valueTemp[0].toString());
                valueTemp = imgRegexp[j as number].exec(currentValue);
            }
            valueOriginal = valueDupe.slice(0);
            for (let i: number = 0; i < valueDupe.length; i++) {
                if (valueDupe[i as number].indexOf('/') === -1 || valueDupe[i as number].lastIndexOf('/') !== valueDupe[i as number].length - 2) {
                    valueDupe[i as number] = valueDupe[i as number].substring(0, valueDupe[i as number].length - 1) + ' /' +
                    valueDupe[i as number].substring(valueDupe[i as number].length - 1, valueDupe[i as number].length);
                }
            }
            for (let g: number = 0; g <= valueDupe.length - 1; g++) {
                currentValue = currentValue.replace(valueOriginal[g as number], valueDupe[g as number]);
            }
        }
        return currentValue;
    }
    private clean(node: HTMLElement): string {
        for (let n: number = 0; n < node.childNodes.length; n++) {
            const child: HTMLElement = node.childNodes[n as number] as HTMLElement;
            if (child.nodeType === 8 || child.nodeName === 'V:IMAGE') {
                node.removeChild(child);
                n--;
            } else if (child.nodeType === 1) {
                this.clean(child);
            }
        }
        return this.currentElement.innerHTML;
    }
    private ImageTags(): void {
        const imgNodes: NodeListOf<HTMLElement> = this.currentElement.querySelectorAll('IMG');
        for (let i: number = imgNodes.length - 1; i >= 0; i--) {
            if (!imgNodes[i as number].hasAttribute('alt')) {
                const img: Element = imgNodes[i as number];
                img.setAttribute('alt', '');
            }
        }
    }
    private removeTags(): void {
        const removeAttribute: string[][] = [['br', 'ul'], ['br', 'ol'], ['table', 'span'], ['div', 'span'], ['p', 'span']];
        for (let i: number = 0; i < removeAttribute.length; i++) {
            this.RemoveElementNode(removeAttribute[i as number][0], removeAttribute[i as number][1]);
        }
    }
    private RemoveElementNode(rmvNode: string, parentNode: string): void {
        const parentArray: NodeListOf<HTMLElement> = this.currentElement.querySelectorAll(parentNode);
        for (let i: number = 0; i < parentArray.length; i++) {
            const rmvArray: NodeListOf<HTMLElement> = parentArray[i as number].querySelectorAll(rmvNode);
            for (let j: number = rmvArray.length; j > 0; j--) {
                detach(rmvArray[j - 1]);
            }
        }
    }
    private RemoveUnsupported(): void {
        const underlineEle: NodeListOf<HTMLElement> = <NodeListOf<HTMLElement>>this.currentElement.querySelectorAll('u');
        for (let i: number = underlineEle.length - 1; i >= 0; i--) {
            const spanEle: HTMLElement = document.createElement('span');
            spanEle.style.textDecoration = 'underline';
            spanEle.innerHTML = underlineEle[i as number].innerHTML;
            underlineEle[i as number].parentNode.insertBefore(spanEle, underlineEle[i as number]);
            detach(underlineEle[i as number]);
        }
        const strongEle: NodeListOf<HTMLElement> = this.currentElement.querySelectorAll('strong');
        for (let i: number = strongEle.length - 1; i >= 0; i--) {
            const boldEle: HTMLElement = document.createElement('b');
            boldEle.innerHTML = strongEle[i as number].innerHTML;
            strongEle[i as number].parentNode.insertBefore(boldEle, strongEle[i as number]);
            detach(strongEle[i as number]);
        }
        const attrArray: string[] = ['language', 'role', 'target', 'contenteditable', 'cellspacing',
            'cellpadding', 'border', 'valign', 'colspan'];
        for (let i: number = 0; i <= attrArray.length; i++) {
            this.RemoveAttributeByName(attrArray[i as number]);
        }
    }
    private RemoveAttributeByName(attrName: string): void {
        if (this.currentElement.firstChild !== null) {
            if (this.currentElement.firstChild.nodeType !== 3) {
                for (let i: number = 0; i < this.currentElement.childNodes.length; i++) {
                    const ele: Node = this.currentElement.childNodes[i as number];
                    if (ele.nodeType !== 3 && ele.nodeName !== 'TABLE' && ele.nodeName !== 'TBODY' && ele.nodeName !== 'THEAD' &&
                        ele.nodeName !== 'TH' && ele.nodeName !== 'TR' && ele.nodeName !== 'TD') {
                        if ((ele as HTMLElement).hasAttribute(attrName)) {
                            (ele as HTMLElement).removeAttribute(attrName);
                        }
                        if (ele.hasChildNodes()) {
                            for (let j: number = 0; j < ele.childNodes.length; j++) {
                                const childEle: Node = ele.childNodes[j as number];
                                if (childEle.nodeType !== 3 && childEle.nodeName !== 'TABLE' && childEle.nodeName !== 'TBODY' &&
                                    childEle.nodeName !== 'THEAD' && childEle.nodeName !== 'TH' && childEle.nodeName !== 'TR' &&
                                    childEle.nodeName !== 'TD' && (childEle as HTMLElement).hasAttribute(attrName) &&
                                   !(childEle as HTMLElement).classList.contains('e-mention-chip')) {
                                    (childEle as HTMLElement).removeAttribute(attrName);
                                }
                                if (childEle.hasChildNodes()) {
                                    for (let k: number = 0; k < childEle.childNodes.length; k++) {
                                        if (childEle.childNodes[k as number].nodeType !== 3 && childEle.childNodes[k as number].nodeName !== 'TABLE' &&
                                            childEle.childNodes[k as number].nodeName !== 'TBODY' && childEle.childNodes[k as number].nodeName !== 'THEAD' &&
                                            childEle.childNodes[k as number].nodeName !== 'TH' && childEle.childNodes[k as number].nodeName !== 'TR'
                                            && childEle.childNodes[k as number].nodeName !== 'TD'
                                            && (childEle.childNodes[k as number] as HTMLElement).hasAttribute(attrName)) {
                                            (childEle.childNodes[k as number] as HTMLElement).removeAttribute(attrName);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
