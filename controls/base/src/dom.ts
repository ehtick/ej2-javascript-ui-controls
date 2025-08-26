/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Functions related to dom operations.
 */
import { EventHandler } from './event-handler';
import { isNullOrUndefined, getValue, setValue, isObject, extend } from './util';

const SVG_REG: RegExp = /^svg|^path|^g/;

export interface ElementProperties {
    id?: string;
    className?: string;
    innerHTML?: string;
    styles?: string;
    attrs?: { [key: string]: string };
}
/**
 * Function to create Html element.
 *
 * @param {string} tagName - Name of the tag, id and class names.
 * @param {ElementProperties} properties - Object to set properties in the element.
 * @param {ElementProperties} properties.id - To set the id to the created element.
 * @param {ElementProperties} properties.className - To add classes to the element.
 * @param {ElementProperties} properties.innerHTML - To set the innerHTML to element.
 * @param {ElementProperties} properties.styles - To set the some custom styles to element.
 * @param {ElementProperties} properties.attrs - To set the attributes to element.
 * @returns {any} ?
 * @private
 */
export function createElement(tagName: string, properties?: ElementProperties): HTMLElement {
    const element: Element = (SVG_REG.test(tagName) ? document.createElementNS('http://www.w3.org/2000/svg', tagName) : document.createElement(tagName));
    if (typeof (properties) === 'undefined') {
        return <HTMLElement>element;
    }
    element.innerHTML = (properties.innerHTML ? properties.innerHTML : '');

    if (properties.className !== undefined) {
        element.className = properties.className;
    }
    if (properties.id !== undefined) {
        element.id = properties.id;
    }
    if (properties.styles !== undefined) {
        (element as HTMLElement).style.cssText = properties.styles;
    }
    if (properties.attrs !== undefined) {
        attributes(element, properties.attrs);
    }
    return <HTMLElement>element;
}
/**
 * Updates the CSS text of an element by merging new styles with existing styles.
 *
 * @param {HTMLElement} element - The element whose styles need to be updated.
 * @param {string} cssText - The new CSS styles to be added or updated.
 * @returns {void}
 */
export function updateCSSText(element: HTMLElement, cssText: string): void {
    const existingStyles: { [key: string]: string } = element.style.cssText.split(';').reduce((styles: { [key: string]: string }, style: string) => {
        const [key, value] = style.split(':');
        if (key && value) {
            styles[key.trim()] = value.trim();
        }
        return styles;
    }, {} as { [key: string]: string });
    const newStyles: { [key: string]: string } = cssText.split(';').reduce((styles: { [key: string]: string }, style: string) => {
        const [key, value] = style.split(':');
        if (key && value) {
            styles[key.trim()] = value.trim();
        }
        return styles;
    }, {} as { [key: string]: string });

    const styleElement: HTMLDivElement = document.createElement('div');
    // Use safe iteration over keys using Object.keys
    Object.keys({ ...existingStyles, ...newStyles }).forEach((key: string) => {
        styleElement.style.setProperty(key, newStyles[key as string] || existingStyles[key as string]);
    });

    element.style.cssText = styleElement.style.cssText;
}
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to add a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export function addClass(elements: Element[] | NodeList, classes: string | string[]): Element[] | NodeList {
    const classList: string[] = getClassList(classes);
    const regExp: RegExpConstructor = RegExp;
    for (const ele of (elements as Element[])) {
        for (const className of classList) {
            if (isObject(ele)) {
                const curClass: string = getValue('attributes.className', ele);
                if (isNullOrUndefined(curClass)) {
                    setValue('attributes.className', className, ele);
                } else if (!new regExp('\\b' + className + '\\b', 'i').test(curClass)) {
                    setValue('attributes.className', curClass + ' ' + className, ele);
                }
            } else {
                if (!ele.classList.contains(className)) {
                    ele.classList.add(className);
                }
            }
        }
    }
    return elements;
}
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to remove a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export function removeClass(elements: Element[] | NodeList, classes: string | string[]): Element[] | NodeList {
    const classList: string[] = getClassList(classes);
    for (const ele of (elements as Element[])) {
        const flag: boolean = isObject(ele);
        const canRemove: boolean = flag ? getValue('attributes.className', ele) : ele.className !== '';
        if (canRemove) {
            for (const className of classList) {
                if (flag) {
                    const classes: string = getValue('attributes.className', ele);
                    const classArr: string[] = classes.split(' ');
                    const index: number = classArr.indexOf(className);
                    if (index !== -1) {
                        classArr.splice(index, 1);
                    }
                    setValue('attributes.className', classArr.join(' '), ele);
                } else {
                    ele.classList.remove(className);
                }
            }
        }
    }
    return elements;
}

/**
 * The function used to get classlist.
 *
 * @param  {string | string[]} classes - An element the need to check visibility
 * @returns {string[]} ?
 * @private
 */
function getClassList(classes: string | string[]): string[] {
    let classList: string[] = [];
    if (typeof classes === 'string') {
        classList.push(classes);
    } else {
        classList = classes;
    }
    return classList;
}

/**
 * The function used to check element is visible or not.
 *
 * @param  {Element|Node} element - An element the need to check visibility
 * @returns {boolean} ?
 * @private
 */
export function isVisible(element: Element | Node): boolean {
    const ele: HTMLElement = <HTMLElement>element;
    return (ele.style.visibility === '' && ele.offsetWidth > 0);
}

/**
 * The function used to insert an array of elements into a first of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to prepend.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export function prepend(fromElements: Element[] | NodeList, toElement: Element, isEval?: boolean): Element[] | NodeList {
    const docFrag: DocumentFragment = document.createDocumentFragment();
    for (const ele of (fromElements as Element[])) {
        docFrag.appendChild(ele);
    }
    toElement.insertBefore(docFrag, toElement.firstElementChild);
    if (isEval) {
        executeScript(toElement);
    }
    return fromElements;
}

/**
 * The function used to insert an array of elements into last of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to append.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export function append(fromElements: Element[] | NodeList, toElement: Element, isEval?: boolean): Element[] | NodeList {
    const docFrag: DocumentFragment = document.createDocumentFragment();
    if (fromElements instanceof NodeList) {
        while (fromElements.length > 0) {
            docFrag.appendChild(fromElements[0]);
        }
    } else {
        for (const ele of <Element[]>fromElements) {
            docFrag.appendChild(ele);
        }
    }
    toElement.appendChild(docFrag);
    if (isEval) {
        executeScript(toElement);
    }
    return fromElements;
}

/**
 * The function is used to evaluate script from Ajax request
 *
 * @param {Element} ele - An element is going to evaluate the script
 * @returns {void} ?
 */
function executeScript(ele: Element): void {
    const eleArray: NodeList = ele.querySelectorAll('script');
    eleArray.forEach((element: Element) => {
        const script: HTMLScriptElement = document.createElement('script');
        script.text = element.innerHTML;
        document.head.appendChild(script);
        detach(script);
    });
}

/**
 * The function used to remove the element from parentnode
 *
 * @param  {Element|Node|HTMLElement} element - An element that is going to detach from the Dom
 * @returns {any} ?
 * @private
 */
export function detach(element: Element | Node | HTMLElement): any {
    const parentNode: Node = element.parentNode;
    if (parentNode) {
        return <Element>parentNode.removeChild(element);
    }
}

/**
 * The function used to remove the element from Dom also clear the bounded events
 *
 * @param  {Element|Node|HTMLElement} element - An element remove from the Dom
 * @returns {void} ?
 * @private
 */
export function remove(element: Element | Node | HTMLElement): void {
    const parentNode: Node = element.parentNode;
    EventHandler.clearEvents(<Element>element);
    parentNode.removeChild(element);
}

/**
 * The function helps to set multiple attributes to an element
 *
 * @param  {Element|Node} element - An element that need to set attributes.
 * @param  {string} attributes - JSON Object that is going to as attributes.
 * @returns {Element} ?
 * @private
 */
export function attributes(element: Element | Node | any, attributes: { [key: string]: string }): Element {
    const keys: string[] = Object.keys(attributes);
    const ele: Element = <Element>element;
    for (const key of keys) {
        if (isObject(ele)) {
            let iKey: string = key;
            if (key === 'tabindex') {
                iKey = 'tabIndex';
            }
            ele.attributes[`${iKey}`] = attributes[`${key}`];
        } else {
            ele.setAttribute(key, attributes[`${key}`]);
        }
    }
    return ele;
}

/**
 * The function selects the element from giving context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {any} ?
 * @private
 */
export function select(selector: string, context: Document | Element = document, needsVDOM?: boolean): any {
    selector = querySelectId(selector);
    return context.querySelector(selector);
}

/**
 * The function selects an array of element from the given context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {HTMLElement[]} ?
 * @private
 */
export function selectAll(selector: string, context: Document | Element = document, needsVDOM?: boolean): HTMLElement[] {
    selector = querySelectId(selector);
    const nodeList: NodeList = context.querySelectorAll(selector);
    return <HTMLElement[] & NodeList>nodeList;
}

/**
 * The function selects an id of element from the given context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @returns {string} ?
 * @private
 */
function querySelectId(selector: string): string {
    const charRegex: RegExp = /(!|"|\$|%|&|'|\(|\)|\*|\/|:|;|<|=|\?|@|\]|\^|`|{|}|\||\+|~)/g;
    if (selector.match(/#[0-9]/g) || selector.match(charRegex)) {
        const idList: string[] = selector.split(',');
        for (let i: number = 0; i < idList.length; i++) {
            const list: string[] = idList[parseInt(i.toString(), 10)].split(' ');
            for (let j: number = 0; j < list.length; j++) {
                if (list[parseInt(j.toString(), 10)].indexOf('#') > -1) {
                    if (!list[parseInt(j.toString(), 10)].match(/\[.*\]/)) {
                        const splitId: string[] = list[parseInt(j.toString(), 10)].split('#');
                        if (splitId[1].match(/^\d/) || splitId[1].match(charRegex)) {
                            const setId: string[] = list[parseInt(j.toString(), 10)].split('.');
                            setId[0] = setId[0].replace(/#/, '[id=\'') + '\']';
                            list[parseInt(j.toString(), 10)] = setId.join('.');
                        }
                    }
                }
            }
            idList[parseInt(i.toString(), 10)] = list.join(' ');
        }
        return idList.join(',');
    }
    return selector;
}

/**
 * Returns single closest parent element based on class selector.
 *
 * @param  {Element} element - An element that need to find the closest element.
 * @param  {string} selector - A classSelector of closest element.
 * @returns {Element} ?
 * @private
 */
export function closest(element: Element | Node, selector: string): Element {
    let el: Element = <Element>element;
    if (typeof el.closest === 'function') {
        return el.closest(selector);
    }

    while (el && el.nodeType === 1) {
        if (matches(el, selector)) {
            return el;
        }

        el = <Element>el.parentNode;
    }

    return null;
}

/**
 * Returns all sibling elements of the given element.
 *
 * @param  {Element|Node} element - An element that need to get siblings.
 * @returns {Element[]} ?
 * @private
 */
export function siblings(element: Element | Node): Element[] {
    const siblings: Element[] = [];
    const childNodes: Node[] = Array.prototype.slice.call(element.parentNode.childNodes);
    for (const curNode of childNodes) {
        if (curNode.nodeType === Node.ELEMENT_NODE && element !== curNode) {
            siblings.push(<Element>curNode);
        }
    }
    return <Element[]>siblings;
}

/**
 * set the value if not exist. Otherwise set the existing value
 *
 * @param  {HTMLElement} element - An element to which we need to set value.
 * @param  {string} property - Property need to get or set.
 * @param  {string} value - value need to set.
 * @returns {string} ?
 * @private
 */
export function getAttributeOrDefault(element: HTMLElement, property: string, value: string): string {
    let attrVal: string;
    const isObj: boolean = isObject(element);
    if (isObj) {
        attrVal = getValue('attributes.' + property, element);
    } else {
        attrVal = element.getAttribute(property);
    }
    if (isNullOrUndefined(attrVal) && value) {
        if (!isObj) {
            element.setAttribute(property, value.toString());
        } else {
            element.attributes[`${property}`] = value;
        }
        attrVal = value;
    }
    return attrVal;
}

/**
 * Set the style attributes to Html element.
 *
 * @param {HTMLElement} element - Element which we want to set attributes
 * @param {any} attrs - Set the given attributes to element
 * @returns {void} ?
 * @private
 */
export function setStyleAttribute(element: HTMLElement, attrs: { [key: string]: Object }): void {
    if (attrs !== undefined) {
        Object.keys(attrs).forEach((key: string) => {
            (<any>element).style[`${key}`] = attrs[`${key}`];
        });
    }
}

/**
 * Method for add and remove classes to a dom element.
 *
 * @param {Element} element - Element for add and remove classes
 * @param {string[]} addClasses - List of classes need to be add to the element
 * @param {string[]} removeClasses - List of classes need to be remove from the element
 * @returns {void} ?
 * @private
 */
export function classList(element: Element, addClasses: string[], removeClasses: string[]): void {
    addClass([element], addClasses);
    removeClass([element], removeClasses);
}

/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Element} element - Element to compare with the selector.
 * @param {string} selector - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export function matches(element: Element, selector: string): boolean {
    const matches: Function = element.matches || (element as any).msMatchesSelector || element.webkitMatchesSelector;
    if (matches) {
        return matches.call(element, selector);
    } else {
        return [].indexOf.call(document.querySelectorAll(selector), element) !== -1;
    }
}

/**
 * Method to get the html text from DOM.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} innerHTML - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export function includeInnerHTML(ele: HTMLElement, innerHTML: string): void {
    ele.innerHTML = innerHTML;
}

/**
 * Method to get the containsclass.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} className - String selector which element will satisfy.
 * @returns {any} ?
 * @private
 */
export function containsClass(ele: HTMLElement, className: string): any {
    if (isObject(ele)) {
        const regExp: RegExpConstructor = RegExp;
        return new regExp('\\b' + className + '\\b', 'i').test((ele as any).attributes.className);
    } else {
        return ele.classList.contains(className);
    }
}
/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Object} element - Element to compare with the selector.
 * @param {boolean} deep ?
 * @returns {any} ?
 * @private
 */
export function cloneNode(element: Object, deep?: boolean): any {
    if (isObject(element)) {
        if (deep) {
            return extend({}, {}, element, true);
        }
    } else {
        return (element as HTMLElement).cloneNode(deep);
    }
}
