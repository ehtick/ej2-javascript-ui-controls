/**
 * Used to set the HTML Attributes for RTE container
 */
import { IRichTextEditor } from '../base/interface';

/**
 * @param {string} htmlAttributes - specifies the string value
 * @param {IRichTextEditor} rte - specifies the rte value
 * @param {boolean} isFrame - specifies the boolean value
 * @param {boolean} initial - specifies the boolean value
 * @returns {void}
 * @hidden
 */
export function setAttributes(htmlAttributes: { [key: string]: string }, rte: IRichTextEditor, isFrame: boolean, initial: boolean): void {
    let target: HTMLElement;
    if (isFrame) {
        const iFrame: HTMLDocument = rte.contentModule.getDocument();
        target = iFrame.querySelector('body');
    } else {
        target = rte.element;
    }
    if (Object.keys(htmlAttributes).length) {
        for (const htmlAttr of Object.keys(htmlAttributes)) {
            if (htmlAttr === 'class') {
                target.classList.add(htmlAttributes[`${htmlAttr}`]);
            } else if (htmlAttr === 'disabled' && htmlAttributes[`${htmlAttr}`] === 'disabled') {
                rte.enabled = false;
                rte.setEnable();
            } else if (htmlAttr === 'readonly' && htmlAttributes[`${htmlAttr}`] === 'readonly') {
                rte.readonly = true;
                rte.setReadOnly(initial);
            } else if (htmlAttr === 'style') {
                target.style.cssText = htmlAttributes[`${htmlAttr}`];
            } else if (htmlAttr === 'tabindex') {
                rte.inputElement.setAttribute('tabindex', htmlAttributes[`${htmlAttr}`]);
            } else if (htmlAttr === 'placeholder') {
                rte.placeholder = htmlAttributes[`${htmlAttr}`];
                rte.setPlaceHolder();
            } else {
                const validateAttr: string[] = ['name', 'required'];
                if (validateAttr.indexOf(htmlAttr) > -1) {
                    rte.valueContainer.setAttribute(htmlAttr, htmlAttributes[`${htmlAttr}`]);
                } else {
                    target.setAttribute(htmlAttr, htmlAttributes[`${htmlAttr}`]);
                }
            }
        }
    }
}
