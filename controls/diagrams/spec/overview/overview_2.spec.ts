import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../src/diagram/diagram';
import { MouseEvents } from '../../spec/diagram/interaction/mouseevents.spec';
import { Overview } from '../../src/overview/overview';
import { OverviewModel } from '../../src/overview/overview-model';
import { RadialTree, DataBinding, HierarchicalTree } from '../../src/diagram/index';
import { PointModel } from '../../src/diagram/primitives/point-model';
import { Size } from '../../src/diagram/primitives/size';

Diagram.Inject(RadialTree, DataBinding, HierarchicalTree);

function makeDiv(id?: string, styles?: string) {
  const el = createElement('div', { id: id || '', styles: styles || '' });
  document.body.appendChild(el);
  return el;
}
function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T;
  expect(el).toBeTruthy();
  return el;
}

/**
 * Narrow an Overview to the private surface needed in tests,
 */
function asPriv(ov: Overview) {
  return ov as unknown as Overview & {
    // state
    actionName: '' | 'draw' | 'scale' | 'pan';
    startPoint: PointModel | null;
    currentPoint: PointModel | null;
    prevPoint: PointModel | null;
    resizeDirection: '' | 'left' | 'right' | 'top' | 'bottom'
                   | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    scale: PointModel | null;
    inAction: boolean;
    viewPortRatio: number;
    horizontalOffset: number;
    verticalOffset: number;
    canvas: HTMLElement | null;

    // methods
    renderCanvas(): void;
    renderDocument(view: Overview): void;
    updateHtmlLayer(view: Overview): void;
    mousePosition(evt: PointerEvent | TouchEvent | WheelEvent): PointModel;
    initHelper(): void;
    updateHelper(difx?: number, dify?: number, size?: Size, width?: number, height?: number): void;
    updateOverviewRectangle(): void;
    translateOverviewRectangle(): void;
    windowResize(evt: Event): boolean;
    unWireEvents(): void;
    notify(name: string, args: Record<string, unknown>): void;
    mouseMove(evt: PointerEvent | TouchEvent): void;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - preRender (element.id == "") and wiring', () => {
  let host: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  beforeAll(() => {
    const dHost = makeDiv('diag_pre_1');
    host = makeDiv(''); // ← EMPTY ID to hit the auto-id branch in preRender
    diagram = new Diagram({
      width: '400px', height: '250px',
      nodes: [{ id: 'n1', width: 80, height: 50, offsetX: 120, offsetY: 100 }]
    });
    diagram.appendTo('#diag_pre_1');
    // Create Overview with explicit element; do not call appendTo.
    ov = new Overview({ width: '120px', height: '90px', sourceID: 'diag_pre_1' }, host);
  });
  afterAll(() => {
    ov.destroy();
    diagram.destroy();
    host.remove();
    byId<HTMLElement>('diag_pre_1').remove();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - renderDocument / updateHtmlLayer end-to-end', () => {
  let dEl: HTMLElement;
  let oEl: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  beforeAll(() => {
    dEl = makeDiv('diag_rd_1');
    oEl = makeDiv('ovw_rd_1');
    diagram = new Diagram({
      width: '600px', height: '400px',
      nodes: [{ id: 'n1', width: 100, height: 60, offsetX: 200, offsetY: 150 }],
      scrollSettings: { scrollLimit: 'Infinity' }
    });
    diagram.appendTo('#diag_rd_1');
    ov = new Overview({ width: '250px', height: '150px', sourceID: 'diag_rd_1' });
    ov.appendTo('#ovw_rd_1');
    // Ensure canvas exists
    (asPriv(ov) as any).renderCanvas();
  });
  afterAll(() => {
    ov.destroy();
    diagram.destroy();
    dEl.remove();
    oEl.remove();
  });
  it('updateHtmlLayer applies expected CSS transform', (done: DoneFn) => {
    // Exercise html transform: scale(...) translate(...)
    (asPriv(ov) as any).updateHtmlLayer(ov);
    const htmlLayer = byId<HTMLElement>(ov.element.id + '_htmlLayer');
    expect(htmlLayer.style.transform).toContain('scale(');
    expect(htmlLayer.style.transform).toContain('translate(');
    done();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - mousePosition (mouse and touch branches)', () => {
  let host: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  let prevBodyMargin = '';
  beforeAll(() => {
    host = makeDiv('ovw_mp_1');
    const dHost = makeDiv('diag_mp_1');
    diagram = new Diagram({ width: '500px', height: '300px' });
    diagram.appendTo('#diag_mp_1');
    ov = new Overview({ width: '200px', height: '120px', sourceID: 'diag_mp_1' });
    ov.appendTo('#ovw_mp_1');
    (asPriv(ov) as any).renderCanvas();
    (asPriv(ov) as any).horizontalOffset = 10;
    (asPriv(ov) as any).verticalOffset = 20;
    // Stabilize viewport: remove UA default margin so expected math matches
    prevBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
    // Stable client rect
    spyOn(ov.element, 'getBoundingClientRect' as never).and.returnValue({
      left: 3, top: 7, width: 0, height: 0, right: 0, bottom: 0
    } as DOMRect);
    // Stub readonly layout getters instead of assigning
    spyOnProperty(ov.element as HTMLElement, 'offsetLeft', 'get').and.returnValue(0);
    spyOnProperty(ov.element as HTMLElement, 'offsetTop', 'get').and.returnValue(0);
  });
  afterAll(() => {
    ov.destroy();
    diagram.destroy();
    host.remove();
    byId<HTMLElement>('diag_mp_1').remove();
    // restore UA margin
    document.body.style.margin = prevBodyMargin;
  });
  it('computes mouse path using clientX/Y', (done: DoneFn) => {
    const pt = (asPriv(ov) as any).mousePosition({ type: 'mousemove', clientX: 100, clientY: 200 } as unknown as PointerEvent);
    expect(pt.x).toBe(100 - 3 + 10);
    expect(pt.y).toBe(200 - 7 + 20);
    done();
  });
  it('computes touch path using changedTouches[0]', (done: DoneFn) => {
    const evt = { type: 'touchstart', changedTouches: [{ clientX: 50, clientY: 60 }] } as unknown as TouchEvent;
    const pt = (asPriv(ov) as any).mousePosition(evt);
    expect(pt.x).toBe(57);
    expect(pt.y).toBe(73);
    done();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - mouseMove (draw, scale, pan, idle)', () => {
  let host: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  const mouseEvents = new MouseEvents();
  function fakeEvt(targetId: string, cls?: string): PointerEvent {
    const t = createElement('div', { id: targetId });
    if (cls) { (t as HTMLElement).className = cls; }
    document.body.appendChild(t);
    return { target: t, type: 'mousemove', clientX: 0, clientY: 0 } as unknown as PointerEvent;
  }
  beforeAll(() => {
    host = makeDiv('ovw_mm_1');
    const dHost = makeDiv('diag_mm_1');
    diagram = new Diagram({
      width: '600px', height: '400px',
      nodes: [{ id: 'n1', width: 100, height: 60, offsetX: 250, offsetY: 180 }]
    });
    diagram.appendTo('#diag_mm_1');
    ov = new Overview({ width: '250px', height: '150px', sourceID: 'diag_mm_1' });
    ov.appendTo('#ovw_mm_1');
    (asPriv(ov) as any).renderCanvas();
    // Stub getBoundingClientRect to stable numbers
    spyOn(ov.element, 'getBoundingClientRect' as never).and.returnValue({
      left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0
    } as DOMRect);
  });
  afterAll(() => {
    ov.destroy();
    diagram.destroy();
    host.remove();
    byId<HTMLElement>('diag_mm_1').remove();
  });
  it('idle path: updates current & prev points and cursor', (done: DoneFn) => {
    const priv = (asPriv(ov) as any);
    const mpSpy = spyOn(priv, 'mousePosition').and.returnValue({ x: 5, y: 6 });
    priv.actionName = ''; // idle
    const evt = fakeEvt('mm_idle', 'overviewresizer');
    (priv.mouseMove as (e: PointerEvent | TouchEvent) => void).call(ov, evt);
    expect(mpSpy).toHaveBeenCalled();
    expect(priv.prevPoint).toEqual({ x: 5, y: 6 });
    (evt.target as HTMLElement).remove();
    done();
  });
  it('draw path: initHelper once, then updateHelper on move', (done: DoneFn) => {
    const priv = (asPriv(ov) as any);
    priv.actionName = 'draw';
    priv.startPoint = { x: 10, y: 10 };
    const mpSpy = spyOn(priv, 'mousePosition').and.returnValue({ x: 20, y: 30 });
    const initSpy = spyOn(priv, 'initHelper').and.callThrough();
    const updSpy = spyOn(priv, 'updateHelper').and.callThrough();
    const evt = fakeEvt('mm_draw');
    (priv.mouseMove as (e: PointerEvent | TouchEvent) => void).call(ov, evt);
    expect(initSpy).toHaveBeenCalled();
    expect(updSpy).toHaveBeenCalled();
    expect(priv.inAction).toBe(true);
    (evt.target as HTMLElement).remove();
    done();
  });
  it('scale path: calls updateOverviewRectangle', (done: DoneFn) => {
    const priv = (asPriv(ov) as any);
    priv.actionName = 'scale';
    priv.startPoint = { x: 0, y: 0 };
    const mpSpy = spyOn(priv, 'mousePosition').and.returnValue({ x: 1, y: 1 });
    const rectSpy = spyOn(priv, 'updateOverviewRectangle').and.callThrough();
    const evt = fakeEvt('mm_scale', 'overviewresizer');
    (priv.mouseMove as (e: PointerEvent | TouchEvent) => void).call(ov, evt);
    expect(mpSpy).toHaveBeenCalled();
    expect(rectSpy).toHaveBeenCalled();
    (evt.target as HTMLElement).remove();
    done();
  });
  it('pan path: translates overview rectangle and sets inAction', (done: DoneFn) => {
    const priv = (asPriv(ov) as any);
    priv.actionName = 'pan';
    priv.startPoint = { x: 0, y: 0 };
    const mpSpy = spyOn(priv, 'mousePosition').and.returnValue({ x: 5, y: 0 });
    const trSpy = spyOn(priv, 'translateOverviewRectangle').and.callThrough();
    const evt = fakeEvt('mm_pan');
    (priv.mouseMove as (e: PointerEvent | TouchEvent) => void).call(ov, evt);
    expect(mpSpy).toHaveBeenCalled();
    expect(trSpy).toHaveBeenCalled();
    expect(priv.inAction).toBe(true);
    (evt.target as HTMLElement).remove();
    done();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - windowResize debounced flow', () => {
  let dEl: HTMLElement;
  let oEl: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  beforeAll(() => {
    dEl = makeDiv('diag_wr_1');
    oEl = makeDiv('ovw_wr_1');
    diagram = new Diagram({ width: '600px', height: '400px' });
    diagram.appendTo('#diag_wr_1');
    ov = new Overview({ width: '250px', height: '150px', sourceID: 'diag_wr_1' });
    ov.appendTo('#ovw_wr_1');
  });
  afterAll(() => {
    ov.destroy();
    diagram.destroy();
    dEl.remove();
    oEl.remove();
  });
  it('schedules remeasure and invokes renderCanvas + setParent', (done: DoneFn) => {
    const rcSpy = spyOn(asPriv(ov), 'renderCanvas').and.callThrough();
    // setParent is public; spy via prototype-safe approach
    const spSpy = spyOn(ov as unknown as { setParent(id: string): void }, 'setParent').and.callThrough();
    const ret = (asPriv(ov) as any).windowResize({} as Event);
    expect(ret).toBe(false);
    setTimeout(() => {
      expect(rcSpy).toHaveBeenCalled();
      expect(spSpy).toHaveBeenCalledWith(ov.sourceID);
      done();
    }, 30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Overview - destroy unwires, cleans DOM & nulls refs', () => {
  let dEl: HTMLElement;
  let oEl: HTMLElement;
  let diagram: Diagram;
  let ov: Overview;
  beforeAll(() => {
    dEl = makeDiv('diag_ds_1');
    oEl = makeDiv('ovw_ds_1');
    diagram = new Diagram({ width: '600px', height: '400px' });
    diagram.appendTo('#diag_ds_1');
    ov = new Overview({ width: '250px', height: '150px', sourceID: 'diag_ds_1' });
    ov.appendTo('#ovw_ds_1');
    // Ensure canvas/html exist first
    (asPriv(ov) as any).renderCanvas();
    (asPriv(ov) as any).renderDocument(ov);
  });
  afterAll(() => {
    // containers already removed by test
    dEl.remove();
    oEl.remove();
    // diagram destroyed inside test
  });
  it('calls unWireEvents/notify, removes layers, clears refs', (done: DoneFn) => {
    const uwSpy = spyOn(asPriv(ov), 'unWireEvents').and.callThrough();
    const nfSpy = spyOn(asPriv(ov), 'notify').and.callThrough();
    ov.destroy();
    expect(uwSpy).toHaveBeenCalled();
    expect(nfSpy).toHaveBeenCalledWith('destroy', {} as Record<string, unknown>);
    // canvas subtree removed
    const canvas = document.getElementById(ov.element.id + '_canvas');
    expect(canvas).toBeNull();
    // class removed
    const host = document.getElementById('ovw_ds_1') as HTMLElement | null;
    expect(host ? host.classList.contains('e-overview') : false).toBe(false);
    // important object refs cleared
    expect((asPriv(ov) as any).canvas).toBeNull();
    // destroy diagram last
    diagram.destroy();
    done();
  });
});
