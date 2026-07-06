import { AnnotationType, PdfViewer } from "../../src";
import { EMPTY_PDF_B64 } from "./Data/pdf-data.spec";
/**
 * Shared utility functions for PDF Viewer tests
 */

// ...existing code...
import { AnnotationDataFormat } from '../../src/index';

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

export function rightClickEvent(element: HTMLElement, cx: number, cy: number): void {
    const contextmenu = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: cx,
        clientY: cy,
        button: 2,
        buttons: 2
    });
    element.dispatchEvent(contextmenu);
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
export function mouseDoubleClickEvent(target: HTMLElement, x: number, y: number) {
    const eventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 1
    };
    // First click
    target.dispatchEvent(new MouseEvent('mousedown', eventInit));
    target.dispatchEvent(new MouseEvent('mouseup', eventInit));
    target.dispatchEvent(new MouseEvent('click', eventInit));
    // Second click
    target.dispatchEvent(new MouseEvent('mousedown', eventInit));
    target.dispatchEvent(new MouseEvent('mouseup', eventInit));
    target.dispatchEvent(new MouseEvent('click', eventInit));
    // Double click
    target.dispatchEvent(new MouseEvent('dblclick', eventInit));
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

 export async function moveRotateHandleBy(target: HTMLElement, x: number, y: number) {
  // Locate the rotate handle (even with pointer-events:none it has a layout box)
  const handle = document.querySelector('circle.e-diagram-rotate-handle') as SVGCircleElement;
    expect(handle).not.toBeNull();
   // Compute center from the handle itself
    const rectValue = handle!.getBoundingClientRect();
    const center = {
      x: rectValue.left + rectValue.width / 2,
      y: rectValue.top + rectValue.height / 2
    };
  // Perform the drag using the low-level mouse API
  mouseMoveEvent(target, center.x, center.y);
  mouseDownEvent(target, center.x, center.y);
   for (let i = 1; i <= 12; i++) {
    mouseMoveEvent(target, center.x + (x / 12) * i, center.y + (y / 12) * i);
  }
  mouseUpEvent(target, center.x + x, center.y + y);
}

// drag For rectangle, circle, radius, ink, FreeText, stamp
export async function dragSelectedTo(target: HTMLElement, targetX: number, targetY: number) {
  const border = document.querySelector('rect.e-pv-diagram-border') as SVGGraphicsElement;
  const r = border.getBoundingClientRect();
  const cx = r.left + r.width / 2 + window.scrollX;
  const cy = r.top + r.height / 2 + window.scrollY;
  mouseMoveEvent(target, cx, cy);
  mouseDownEvent(target, cx, cy); 
const dx = targetX - cx;
const dy = targetY - cy;
for (let i = 1; i <= 12; i++) {
  const x = Math.round(cx + (dx * i) / 12);
  const y = Math.round(cy + (dy * i) / 12);
  mouseMoveEvent(target, x, y);
}
  mouseUpEvent(target, targetX, targetY);
}

//For line, arrow, distance, perimeter, area, volume, polygon type annotations
export function resizeBySelectorForLineType(target: HTMLElement, id: string, points: any) {
  // Pick the correct resize handle
  let resizeHandle = document.getElementById(id);
  const handleRect = resizeHandle.getBoundingClientRect();
  mouseMoveEvent(target, handleRect.left, handleRect.top);
  mouseDownEvent(target, handleRect.left, handleRect.top);
  mouseMoveEvent(target, handleRect.left + points, handleRect.top + points);
  mouseUpEvent(target, handleRect.left + points, handleRect.top + points);
}

// resize by corner handle For rectangle, circle, radius, ink, FreeText
export function resizeBySelector(target: HTMLElement, direction: string, points: any) {
  // Locate the adorner group robustly (fallback if :has is not supported)
  const border = document.querySelector('rect.e-pv-diagram-border') as SVGGraphicsElement | null;
  const adorner =
    (document.querySelector('g:has(rect.e-pv-diagram-border)') as SVGGElement | null) ||
    (border ? (border.closest('g') as SVGGElement | null) : null);

  if (!adorner) {
    throw new Error('Adorner group with diagram border not found');
  }

  // Local deltas from input (number => corner scaling; object => x/y)
  let ldx = 0, ldy = 0;
  if (typeof points === 'number') {
    const s = points;
    switch (direction) {
      case 'se': ldx = +s; ldy = +s; break;
      case 'ne': ldx = -s; ldy = +s; break;
      case 'sw': ldx = +s; ldy = -s; break;
      case 'nw': ldx = -s; ldy = -s; break;
      case 'n': ldx = 0; ldy = -s; break;
      case 's': ldx = 0; ldy = +s; break;
      case 'e': ldx = +s; ldy = 0; break;
      case 'w': ldx = -s; ldy = 0; break;
      default: ldx = +s; ldy = +s; break;
    }
  } else {
    ldx = Number((points && points.x) || 0);
    ldy = Number((points && points.y) || 0);
  }

  // Pick the correct resize handle
  const handleSelector = cornerToSelector(direction);
  let handle = adorner.querySelector(handleSelector) as SVGGraphicsElement | null;
  if (!handle) {
    throw new Error(`Resize handle not found for selector: ${handleSelector}`);
  }

  // Start position: center of the handle (document coordinates)
  const rect = handle.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 + window.scrollX;
  const startY = rect.top + rect.height / 2 + window.scrollY;

  // NOTE: assumes `target` is available in test scope (the surface receiving mouse events)
  // If needed, pass it as a parameter and replace here.
  mouseMoveEvent(handle, startX, startY);
  mouseDownEvent(handle, startX, startY);
  for (let i = 1; i <= 12; i++) {
    mouseMoveEvent(target, startX + (ldx / 12) * i, startY + (ldy / 12) * i);
  }
  mouseUpEvent(target, startX + ldx, startY + ldy);
}

// Jasmine/Karma version — resize by corner handle
export function resizeBySelectorForStamp(target: HTMLElement, direction: string, points: any) {
  // Locate the adorner group robustly (fallback if :has is not supported)
  const border = document.querySelector('rect.e-pv-diagram-border') as SVGGraphicsElement | null;
  const adorner =
    (document.querySelector('g:has(rect.e-pv-diagram-border)') as SVGGElement | null) ||
    (border ? (border.closest('g') as SVGGElement | null) : null);

  if (!adorner) {
    throw new Error('Adorner group with diagram border not found');
  }

  // Read rotation angle from either border or pivot transform (same logic as your original)
  const pivot = adorner.querySelector('line.e-diagram-pivot-line') as SVGGraphicsElement | null;

  let transform = (border && border.getAttribute('transform')) || '';
  if (!/rotate\(/i.test(transform)) {
    transform = (pivot && pivot.getAttribute('transform')) || '';
  }

  const match = /rotate\(\s*([-\d.]+)/i.exec(transform);
  const angleDeg = match ? (Number.isFinite(+match[1]) ? +match[1] : 0) : 0;

  // Local deltas from input (number => corner scaling; object => x/y)
  let ldx = 0, ldy = 0;
  if (typeof points === 'number') {
    const s = points;
    switch (direction) {
      case 'se': ldx = +s; ldy = +s; break;
      case 'ne': ldx = -s; ldy = +s; break;
      case 'sw': ldx = +s; ldy = -s; break;
      case 'nw': ldx = -s; ldy = -s; break;
      default: ldx = +s; ldy = +s; break;
    }
  } else {
    ldx = Number((points && points.x) || 0);
    ldy = Number((points && points.y) || 0);
  }

  // Rotate the drag vector by the node's rotate angle (preserve your original math)
  const [dx, dy] = rotateVector(ldx, ldy, angleDeg);

  // Pick the correct resize handle
  const handleSelector = cornerToSelector(direction);
  let handle = adorner.querySelector(handleSelector) as SVGGraphicsElement | null;
  if (!handle) {
    throw new Error(`Resize handle not found for selector: ${handleSelector}`);
  }

  // Start position: center of the handle (document coordinates)
  const rect = handle.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 + window.scrollX;
  const startY = rect.top + rect.height / 2 + window.scrollY;

  // NOTE: assumes `target` is available in test scope (the surface receiving mouse events)
  // If needed, pass it as a parameter and replace here.
  mouseMoveEvent(handle, startX, startY);
  mouseDownEvent(handle, startX, startY);
  for (let i = 1; i <= 12; i++) {
    mouseMoveEvent(target, startX + (dx / 12) * i, startY + (dy / 12) * i);
  }
  mouseUpEvent(target, startX + dx, startY + dy);
}

function rotateVector(dx: number, dy: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  // Preserve your original rotation math
  const rx = dx * sin + dy * cos;
  const ry = dx * cos - dy * sin;
  return [rx, ry];
}

function cornerToSelector(corner: string) {
  switch (corner) {
    case 'nw': return 'rect#resizeNorthWest, .e-pv-diagram-resize-handle.e-northwest';
    case 'ne': return 'rect#resizeNorthEast, .e-pv-diagram-resize-handle.e-northeast';
    case 'sw': return 'rect#resizeSouthWest, .e-pv-diagram-resize-handle.e-southwest';
    case 'se': return 'rect#resizeSouthEast, .e-pv-diagram-resize-handle.e-southeast';
    case 'n': return 'rect#resizeNorth, .e-pv-diagram-resize-handle.e-north';
    case 's': return 'rect#resizeSouth, .e-pv-diagram-resize-handle.e-south';
    case 'e': return 'rect#resizeWest, .e-pv-diagram-resize-handle.e-west';
    case 'w': return 'rect#resizeEast, .e-pv-diagram-resize-handle.e-east';
    default:   return '.e-pv-diagram-resize-handle';
  }
}

// To get the annotation bounds from the DOM.
export function getAnnotationBoundsFromDOM(
    canvas: HTMLCanvasElement,
    rect: { x: number; y: number; width: number; height: number }
): { left: number; top: number; width: number; height: number; right: number; bottom: number } {
    const { x, y, width, height } = rect;

    // Canvas position & visual size in the viewport
    const bounds = canvas.getBoundingClientRect();
    const domX = bounds.left + x;
    const domY = bounds.top + y;
    const domWidth = width;
    const domHeight = height;
    return {
        left: domX,
        top: domY,
        width: domWidth,
        height: domHeight,
        right: domX + domWidth,
        bottom: domY + domHeight
    };
}


// Helper to export all annotations as an object from the viewer
export async function exportAnnotationsHelper(viewer: any): Promise<any> {
    return await viewer.exportAnnotationsAsObject();
}


// Helper to import annotations using JSON format
export function importAnnotationsHelper(viewer: any, exportedData: any): void {
    viewer.importAnnotation(exportedData, AnnotationDataFormat.Json);
}

// Helper to remove all annotations from the viewer
export function deleteAllAnnotationsHelper(viewer: any): void {
    while (viewer.annotationCollection && viewer.annotationCollection.length > 0) {
        viewer.annotation.selectAnnotation(viewer.annotationCollection[0].annotationId);
        viewer.annotation.deleteAnnotation();
    }
}

// Helper utility to draw a closed triangle using three connected line segments
export function threePointCalibrate(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const aX = Math.round(rect.left + 100);
    const aY = Math.round(rect.top + 50);

    const bX = Math.round(rect.left + 200);
    const bY = Math.round(rect.top + 150);

    const cX = Math.round(rect.left + 50);
    const cY = Math.round(rect.top + 150);

    // Draw AB
    mouseMoveEvent(target, aX, aY);
    mouseDownEvent(target, aX, aY);
    mouseMoveEvent(target, bX, bY);
    mouseUpEvent(target, bX, bY);

    // Draw BC
    mouseMoveEvent(target, bX, bY);
    mouseDownEvent(target, bX, bY);
    mouseMoveEvent(target, cX, cY);
    mouseUpEvent(target, cX, cY);

    // Draw CA (closing triangle)
    mouseMoveEvent(target, cX, cY);
    mouseDownEvent(target, cX, cY);
    mouseMoveEvent(target, aX, aY);
    mouseUpEvent(target, aX, aY);
}

// Helper assertion to ensure geometry has changed after an operation
export function assertGeometryChanged(initial: any, updated: any, propertyName: string): void {
    const normalizedInitial = normalizeForComparison(initial);
    const normalizedUpdated = normalizeForComparison(updated);
    expect(JSON.stringify(normalizedInitial)).not.toBe(
        JSON.stringify(normalizedUpdated),
        `${propertyName} should change after resize`
    );
}

// Helper assertion to ensure geometry matches expected values
export function assertGeometryMatches(expected: any, actual: any, propertyName: string): void {
    const normalizedExpected = normalizeForComparison(expected);
    const normalizedActual = normalizeForComparison(actual);
    expect(JSON.stringify(normalizedExpected)).toBe(
        JSON.stringify(normalizedActual),
        `${propertyName} should match`
    );
}

// Helper to normalize geometry values for stable comparison
// - Rounds numbers to 2 decimal places
// - Recursively processes arrays and objects
// - Removes undefined properties
function normalizeForComparison(obj: any): any {
    if (typeof obj === 'number') {
        return Math.round(obj * 100) / 100;
    }
    if (Array.isArray(obj)) {
        return obj.map(normalizeForComparison);
    }
    if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                result[key] = normalizeForComparison(obj[key]);
            }
        }
        return result;
    }
    return obj;
}

export function normalizeToHex(color: string) {
const ctx = document.createElement('canvas').getContext('2d')!;
ctx.fillStyle = color;
return ctx.fillStyle.toLowerCase();
}

export type TestFocusEvent = FocusEvent & {__fromTest?: boolean;};

export function focusOutOnceWithoutNative(target: HTMLElement): void {
    const interceptor = (event: FocusEvent): void => {
        const evt = event as TestFocusEvent;

        if (!evt.__fromTest) {
            event.stopImmediatePropagation();
        }
    };

    document.addEventListener('focusout', interceptor, true);

    const focusOutEvent = new FocusEvent('focusout', {
        bubbles: true
    }) as TestFocusEvent;

    focusOutEvent.__fromTest = true;
    target.dispatchEvent(focusOutEvent);

    document.removeEventListener('focusout', interceptor, true);
}

export async function downloadAndReload(viewer: PdfViewer): Promise<void> {
  const blob = await viewer.saveAsBlob();
  const reloadPromise = new Promise<void>((resolve) => {
    viewer.documentLoad = () => resolve();
  });
  const reader = new FileReader();
  reader.onload = () => viewer.load(reader.result as string, null);
  reader.readAsDataURL(blob);
  await reloadPromise;
}


export function normalizeColor(color: string): string {
  if (!color) return color;
  // Convert rgba format to hex
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
  if (rgbaMatch) {
    const r = ('0' + parseInt(rgbaMatch[1]).toString(16)).slice(-2);
    const g = ('0' + parseInt(rgbaMatch[2]).toString(16)).slice(-2);
    const b = ('0' + parseInt(rgbaMatch[3]).toString(16)).slice(-2);
    return ('#' + r + g + b).toUpperCase();
  }
  // Remove alpha from hex format (e.g., #ff0000ff -> #ff0000)
  if (color.startsWith('#') && color.length === 9) {
    return color.substring(0, 7).toUpperCase();;
  }
  return color.toUpperCase();;
}

export function objectValues<T extends object>(o: T): any[] {
    const result: any[] = [];
    for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
            result.push((o as any)[k]);
        }
    }
    return result;
}
/**
 * Changes thickness using the thickness slider UI
 * scoped to a specific PDF Viewer root element.
 */
export function changeThicknessViaSlider(instanceId: string, deltaX: number = 100): void {
    // Find thickness button within this viewer instance
    const thicknessBtn = document.querySelector(`#${instanceId}_annotation_thickness`) as HTMLElement | null;

    expect(thicknessBtn).not.toBeNull();

    // Open thickness panel
    thicknessBtn!.click();

    const sliderHandle = document.querySelector(
        '.e-pv-annotation-thickness-slider .e-handle'
    ) as HTMLElement;

    expect(sliderHandle).not.toBeNull();

    const rect = sliderHandle.getBoundingClientRect();

    // Simulate drag
    mouseMoveEvent(sliderHandle, rect.left, rect.top);
    mouseDownEvent(sliderHandle, rect.left, rect.top);
    mouseMoveEvent(sliderHandle, rect.left + deltaX, rect.top);
    mouseUpEvent(sliderHandle, rect.left + deltaX, rect.top);
}

/**
 * Triggers a custom event on a DOM element (generic or keyboard events)
 * Automatically creates the appropriate event type (Event or KeyboardEvent)
 * @param element - The DOM element on which to dispatch the event
 * @param eventName - Name of the event to trigger (e.g., 'change', 'click', 'keydown', 'keyup')
 * @param bubbles - Whether the event should bubble (default: true)
 * @param options - Additional event options (key, code, cancelable, etc.)
 */
export function triggerEvent({
    element,
    eventName,
    bubbles = true,
    options = {}
}: {
    element: HTMLElement | null;
    eventName: string;
    bubbles?: boolean;
    options?: Record<string, any>;
}): void {
    if (!element || !eventName) return;

    let event: Event;

    // Determine event type and create appropriate event object
    if (eventName.includes('key')) {
        // Keyboard events: keydown, keyup, keypress
        // Extract cancelable with default value, spread remaining options
        const { cancelable = true, ...restOptions } = options || {};
        event = new KeyboardEvent(eventName, {
            bubbles,
            cancelable,
            ...restOptions
        });
    } else {
        // Generic events: change, click, input, etc.
        event = new Event(eventName, {
            bubbles,
            ...options
        });
    }

    element.dispatchEvent(event);
}

/**
 * Simulates user typing text into an input element character by character
 * Dispatches keydown, keyup, and input events for each character
 * @param element - The input element to type into
 * @param text - The text to type
 * @param bubbles - Whether keyboard events should bubble (default: true)
 */
export function simulateTyping({
    element,
    text,
    bubbles = true
}: {
    element: HTMLInputElement | null;
    text: string;
    bubbles?: boolean;
}): void {
    if (!element || !text) return;

    let currentValue = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        currentValue += char;
        element.value = currentValue;

        // Use triggerEvent for keyboard events (more maintainable)
        triggerEvent({ element, eventName: 'keydown', bubbles, options: { key: char } });
        triggerEvent({ element, eventName: 'keyup', bubbles, options: { key: char } });
        triggerEvent({ element, eventName: 'input', bubbles });
    }
}

/**
 * Simulates pressing a specific key (dispatches keydown and keyup events)
 * Useful for non-text keys like Enter, Escape, Tab, etc.
 * @param element - The element on which to simulate the key press
 * @param key - The key to press (e.g., 'Enter', 'Escape', 'Tab')
 * @param code - The code of the key (optional, defaults to key value)
 * @param bubbles - Whether the event should bubble (default: true)
 * @param cancelable - Whether the event is cancelable (default: true)
 */
export function pressKey({
    element,
    key,
    code,
    bubbles = true,
    cancelable = true
}: {
    element: HTMLInputElement | HTMLElement | null;
    key: string;
    code?: string;
    bubbles?: boolean;
    cancelable?: boolean;
}): void {
    if (!element || !key) return;

    const keyboardOptions = {
        key,
        code: code || key,
        cancelable
    };

    // Use triggerEvent internally (DRY principle)
    triggerEvent({ element, eventName: 'keydown', bubbles, options: keyboardOptions });
    triggerEvent({ element, eventName: 'keyup', bubbles, options: keyboardOptions });
}

export function wheelEvent(element: any, deltaX = 0, deltaY = 100, ctrlKey = false) {
    element.scrollLeft += deltaX;
    element.scrollTop += deltaY;
    const event = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: deltaX,
        deltaY: deltaY,
        ctrlKey: ctrlKey
    });
    element.dispatchEvent(event);
}

export function doubleTap(element: HTMLElement, x = 0, y = 0) {
    const createTouchEvent = (type: string) => {
        const touchObj = new Touch({
            identifier: Date.now(),
            target: element,
            clientX: x,
            clientY: y,
        });
        return new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' ? [] : [touchObj],
            targetTouches: [],
            changedTouches: [touchObj],
        });
    };
    element.dispatchEvent(createTouchEvent('touchstart'));
    element.dispatchEvent(createTouchEvent('touchend'));
    element.dispatchEvent(createTouchEvent('touchstart'));
    element.dispatchEvent(createTouchEvent('touchend'));
}

export function moveSlider(sliderSelector: string, deltaX: number = 50) {
    const sliderHandle = document.querySelector(sliderSelector) as HTMLElement;
    expect(sliderHandle).not.toBeNull();
    const rect = sliderHandle.getBoundingClientRect();
    mouseDownEvent(sliderHandle, rect.left, rect.top);
    mouseMoveEvent(sliderHandle, rect.left + deltaX, rect.top);
    mouseUpEvent(sliderHandle, rect.left + deltaX, rect.top);
}