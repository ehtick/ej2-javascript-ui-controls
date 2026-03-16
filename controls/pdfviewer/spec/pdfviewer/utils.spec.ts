/**
 * Shared utility functions for PDF Viewer tests
 */

/**
 * Opens annotation toolbar by clicking the annotation button
 * @param viewerId - The ID of the PDF viewer element (default: 'pdfviewer')
 */
export function openAnnotationToolbar(viewerId: string = 'pdfviewer'): void {
    const annotationBtn = document.querySelector(`#${viewerId}_annotation`) as HTMLElement;
    expect(annotationBtn).not.toBeNull();
    annotationBtn.click();
}

/**
 * Verifies button exists, has correct ID, and clicks it
 * @param selector - CSS selector for the button
 * @param expectedId - Expected ID of the button
 */
export function verifyAndClickButton(selector: string, expectedId: string): void {
    const button = document.querySelector(selector) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.id).toBe(expectedId);
    button.click();
}

/**
 * Closes annotation toolbar if open
 * @param viewerId - The ID of the PDF viewer element (default: 'pdfviewer')
 */
export function closeAnnotationToolbar(viewerId: string = 'pdfviewer'): void {
    const annotationToolbar = document.querySelector(`#${viewerId}_annotationContainer`);
    if (annotationToolbar) {
        const annotationBtn = document.querySelector(`#${viewerId}_annotation`) as HTMLElement;
        if (annotationBtn && annotationBtn.classList.contains('e-active')) {
            annotationBtn.click();
        }
    }
}
export function mouseDownEvent(element: any, cx: number, cy: number, ctrl?: any, shift?: any) {
    let mousedown = document.createEvent('MouseEvent');
    mousedown.initMouseEvent('mousedown', true, false, window, 1, 0, 0, cx, cy, ctrl, false, shift, false, 1, element);
    element.dispatchEvent(mousedown);
}

export function mouseMoveEvent(element: any, cx: number, cy: number, ctrl?: any, shift?: any) {
    let mousemove = document.createEvent('MouseEvent');
    mousemove.initMouseEvent('mousemove', true, false, window, 1, 0, 0, cx, cy, ctrl, false, shift, false, 1, element);
    element.dispatchEvent(mousemove);
}

export function mouseUpEvent(element: any, cx: number, cy: number, ctrl?: any, shift?: any) {
    let mouseup = document.createEvent('MouseEvent');
    mouseup.initMouseEvent('mouseup', true, false, window, 1, 0, 0, cx, cy, ctrl, false, shift, false, 1, element);
    element.dispatchEvent(mouseup);
}

export function mouseClickEvent(element: HTMLElement) {
    element.click();
}

export function mouseOverEvent(element: HTMLElement, ctrl = false, shift = false) {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
        'mouseover',
        true,   // bubbles
        true,   // cancelable
        window,
        0,
        0, 0,   // screenX, screenY (optional)
        cx, cy, // clientX, clientY
        ctrl,
        false,  // altKey
        shift,
        false,  // metaKey
        0,      // button
        null    // relatedTarget
    );
    element.dispatchEvent(ev);
}

export function dblClickEvent(target: HTMLElement, cx: number, cy: number) {
    const dbl = new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: cx, clientY: cy });
    target.dispatchEvent(dbl);
}

export function getTarget(id:string): HTMLElement {
    const target = document.querySelector(id) as HTMLElement
        || (document.getElementById('pdfviewer') as HTMLElement);
    if (!target) {
        throw new Error('Target layer not found for mouse events.');
    }
    return target;
}
export function focusOn(target: HTMLElement) {
    target.focus();
}

export function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitFor(check: () => boolean): any {
    return new Promise((resolve) => {
        function poll() {
            try {
                const result = check();
                if (result) {
                    resolve(result);
                    return;
                }
            } catch (e) {
                // ignore errors from check() and keep polling
            }
            requestAnimationFrame(poll);
        }
        poll();
    });
}
export function Keydown(
    target: Element | Document | Window | null | undefined,
    key: string,
    code: string,
    mods?: Partial<Pick<KeyboardEventInit, 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>>
): boolean {
    const t = (target || document.body) as Element | Document | Window;
    const m = mods || {};
    const evt = new KeyboardEvent('keydown', {
        key,
        code,
        ctrlKey: !!m.ctrlKey,
        metaKey: !!m.metaKey,
        altKey: !!m.altKey,
        shiftKey: !!m.shiftKey,
        bubbles: true,
        cancelable: true
    });
    return t.dispatchEvent(evt);
}