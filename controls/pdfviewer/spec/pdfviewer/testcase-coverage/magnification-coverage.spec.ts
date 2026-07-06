import { createElement, Browser } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, RectangleSettings, PdfViewerBase } from '../../../src/index';
import { EMPTY_3PAGE_B64, EMPTY_PDF_B64, PDF_Succinctly, TILE_PDF_B64 } from '../Data/pdf-data.spec';
import { doubleTap, Keydown, wheelEvent } from '../utils.spec';
PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner);

describe('PDF_Viewer_Magnification_zoomToRect', () => {
    let pdfviewer_zoom_rect: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_zoom_rect' });
        document.body.appendChild(element);
        pdfviewer_zoom_rect = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
        });
        pdfviewer_zoom_rect.documentLoad = () => done();
        pdfviewer_zoom_rect.appendTo('#pdfviewer_zoom_rect');
    });

    afterAll(() => {
        if (pdfviewer_zoom_rect) {
            pdfviewer_zoom_rect.destroy();
            const el = document.getElementById('pdfviewer_zoom_rect');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_zoom_rect = null;
        }
    });

    it('zoomToRect-add rectangle annotation', (done) => {
        pdfviewer_zoom_rect.annotation.addAnnotation('Rectangle', {
            offset: { x: 100, y: 100 },
            pageNumber: 1,
            width: 150,
            height: 75
        } as RectangleSettings);
        expect(pdfviewer_zoom_rect.annotationCollection.length).toBeGreaterThan(0);
        done();
    });
    it('zoomToRect-rect-dimensions', (done) => {
        const viewer = (document.getElementById('pdfviewer_zoom_rect') as any).ej2_instances[0];
        const bounds = viewer.annotationCollection[0].bounds;
        const pageNumber = viewer.annotationCollection[0].pageNumber;
        const pagePoint = { x: bounds.left, y: bounds.top };
        const clientPoint = viewer.convertPagePointToClientPoint(pagePoint, parseInt(pageNumber) + 1);
        const rectangle: any = { x: clientPoint.x, y: clientPoint.y, width: bounds.width, height: bounds.height };
        const pdfViewerBase: PdfViewerBase = (pdfviewer_zoom_rect.magnification as any).pdfViewerBase;
        const viewerContainer: any = pdfViewerBase.viewerContainer;
        const prevScrollTop: number = viewerContainer.scrollTop;
        const prevScrollLeft: number = viewerContainer.scrollLeft;
        pdfviewer_zoom_rect.zoomToRect(rectangle);
        const afterScrollTop: number = viewerContainer.scrollTop;
        const afterScrollLeft: number = viewerContainer.scrollLeft;
        expect(afterScrollLeft).toBeGreaterThanOrEqual(prevScrollLeft);
        expect(afterScrollTop).toBeGreaterThanOrEqual(prevScrollTop);
        done();
    });
});

describe('Magnification-rerenderOnScroll', () => {
    let pdfviewer_scroll: PdfViewer;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_scroll' });
        document.body.appendChild(element);
        pdfviewer_scroll = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + PDF_Succinctly
        });
        pdfviewer_scroll.documentLoad = () => {
            done();
        };
        pdfviewer_scroll.appendTo('#pdfviewer_scroll');
    });

    afterAll(() => {
        if (pdfviewer_scroll) {
            pdfviewer_scroll.destroy();
            const el = document.getElementById('pdfviewer_scroll');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
        }
    });

    it('shouldTriggerWheelEventWithCtrlKey-rerenderOnScroll', (done) => {
        const element = document.getElementById('pdfviewer_scroll_viewerContainer');
        expect(element).toBeTruthy();
        wheelEvent(element, 500, 500, true);
        expect(pdfviewer_scroll.zoomPercentage).toBeGreaterThan(100);
        done();
    });

});

describe('PDF_Viewer_Magnification_Behaviour', () => {
    let pdfviewer_magnification: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_magnification' });
        document.body.appendChild(element);
        pdfviewer_magnification = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + TILE_PDF_B64
        });
        pdfviewer_magnification.documentLoad = () => done();
        pdfviewer_magnification.appendTo('#pdfviewer_magnification');
    });

    afterAll(() => {
        if (pdfviewer_magnification) {
            pdfviewer_magnification.destroy();
            const el = document.getElementById('pdfviewer_magnification');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_magnification = null;
        }
    });

    it('setTouchPoints-updates-centers', function (done) {
        pdfviewer_magnification.magnification.setTouchPoints(30, 40)
        expect((pdfviewer_magnification.magnification as any).touchCenterX).toBeLessThanOrEqual(50);
        expect((pdfviewer_magnification.magnification as any).touchCenterY).toBeLessThanOrEqual(100);
        done();
    });

    it('checkZoomFactor', (done) => {
        pdfviewer_magnification.magnification.zoomFactor = 1;
        const result: boolean = pdfviewer_magnification.magnification.checkZoomFactor();
        expect(result).toBe(true);
        done();
    });

    it('tile-rendering-resize-canvas', (done) => {
        pdfviewer_magnification.magnification.zoomTo(150);
        expect(pdfviewer_magnification.zoomPercentage).toBe(150);
        done();
    });
});

describe('PDF_Viewer_Magnification_Set_Zoom_Fit', () => {
    let pdfviewer_zoomfit: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_zoomfit' });
        document.body.appendChild(element);
        pdfviewer_zoomfit = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + PDF_Succinctly
        });
        pdfviewer_zoomfit.documentLoad = () => done();
        pdfviewer_zoomfit.enableDesktopMode = true;
        pdfviewer_zoomfit.appendTo('#pdfviewer_zoomfit');
    });

    afterAll(() => {
        if (pdfviewer_zoomfit) {
            pdfviewer_zoomfit.destroy();
            const el = document.getElementById('pdfviewer_zoomfit');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_zoomfit = null;
        }
    });

    it('fit-to-page-downward-on-positive-delta', (done) => {
        pdfviewer_zoomfit.magnification.fitToPage();
        expect(pdfviewer_zoomfit.zoomPercentage).toBeGreaterThanOrEqual(40);
        expect(pdfviewer_zoomfit.magnification.fitType).toBe('fitToPage');
        const element = document.getElementById('pdfviewer_zoomfit_viewerContainer');
        expect(element).toBeTruthy();
        wheelEvent(element, 0, 2000, false);
        const tl = document.getElementById('pdfviewer_zoomfit_textLayer_1') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('fit-to-page-upward-on-nonpositive-delta', (done) => {
        expect(pdfviewer_zoomfit.magnification.fitType).toBe('fitToPage');
        const element = document.getElementById('pdfviewer_zoomfit_viewerContainer');
        expect(element).toBeTruthy();
        wheelEvent(element, 0, -1000, false);
        const tl = document.getElementById('pdfviewer_zoomfit_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('fit-to-width', (done) => {
        pdfviewer_zoomfit.magnification.fitToWidth();
        expect(pdfviewer_zoomfit.zoomPercentage).toBeGreaterThanOrEqual(70);
        done();
    });
});

describe('Magnification - onDoubleTapMagnification', () => {
    let pdfviewer_doubletap: PdfViewer;
    let originalIsDevice: boolean;

    beforeAll((done) => {
        originalIsDevice = Browser.isDevice;
        const element = createElement('div', { id: 'pdfviewer_doubletap' });
        document.body.appendChild(element);
        pdfviewer_doubletap = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
        });
        pdfviewer_doubletap.documentLoad = () => {
            done();
        };
        Object.defineProperty(Browser, 'isDevice', { get: function () { return true; }, configurable: true });
        pdfviewer_doubletap.enableDesktopMode = false;
        pdfviewer_doubletap.appendTo('#pdfviewer_doubletap');
    });

    afterAll(() => {
        if (pdfviewer_doubletap) {
            pdfviewer_doubletap.destroy();
            const el = document.getElementById('pdfviewer_doubletap');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
        }
        Object.defineProperty(Browser, 'isDevice', { get: function () { return originalIsDevice; }, configurable: true });
    });

    it('onDoubleTapMagnification-calls-zoomTo-and-calculates-scroll', (done) => {
        pdfviewer_doubletap.magnification.isPinchZoomed = true;
        const element = document.getElementById('pdfviewer_doubletap_viewerContainer');
        doubleTap(element, 100, 100);
        expect(pdfviewer_doubletap.zoomPercentage).toBeGreaterThan(150);
        done();
    });
});

describe('Magnification - magnifyBehaviorKeyDown', () => {
    let pdfviewer_magnify: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_magnify' });
        document.body.appendChild(element);
        pdfviewer_magnify = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_3PAGE_B64
        });
        pdfviewer_magnify.documentLoad = () => done();
        pdfviewer_magnify.enableDesktopMode = true;
        pdfviewer_magnify.appendTo('#pdfviewer_magnify');
    });

    afterAll(() => {
        if (pdfviewer_magnify) {
            pdfviewer_magnify.destroy();
            const el = document.getElementById('pdfviewer_magnify');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_magnify = null;
        }
    });

    it('zoomIn-with-ctrl-and-Equal-code', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, '+', 'Equal', { ctrlKey: true });
        expect(pdfviewer_magnify.zoomPercentage).toBeGreaterThanOrEqual(100);
        done();
    });
    it('zoomOut-with-ctrl-and-Minus-code', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, '-', 'Minus', { ctrlKey: true });
        expect(pdfviewer_magnify.zoomPercentage).toBeLessThanOrEqual(100);
        done();
    });
    it('down-arrow-downwardScroll', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowDown', 'ArrowDown', { ctrlKey: true });
        const tl = document.getElementById('pdfviewer_magnify_textLayer_2') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('up-arrow-upwardScroll', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowUp', 'ArrowUp', { ctrlKey: true });
        const tl = document.getElementById('pdfviewer_magnify_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('down-arrow-fitToPage-triggers-downwardScroll', (done) => {
        pdfviewer_magnify.magnification.fitToPage();
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowDown', 'ArrowDown');
        const tl = document.getElementById('pdfviewer_magnify_textLayer_1') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('up-arrow-fitToPage-upwardScroll', (done) => {
        pdfviewer_magnify.magnification.fitToPage();
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowUp', 'ArrowUp');
        const tl = document.getElementById('pdfviewer_magnify_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('right-arrow-downwardScroll', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowRight', 'ArrowRight', { ctrlKey: true });
        const tl = document.getElementById('pdfviewer_magnify_textLayer_2') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('left-arrow-upwardScroll', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowLeft', 'ArrowLeft', { ctrlKey: true });
        const tl = document.getElementById('pdfviewer_magnify_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('right-arrow-fitToPage-triggers-downwardScroll', (done) => {
        pdfviewer_magnify.magnification.fitToPage();
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowRight', 'ArrowRight');
        const tl = document.getElementById('pdfviewer_magnify_textLayer_1') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('left-arrow-fitToPage-upwardScroll', (done) => {
        pdfviewer_magnify.magnification.fitToPage();
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, 'ArrowLeft', 'ArrowLeft');
        const tl = document.getElementById('pdfviewer_magnify_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
        done();
    });
    it('digit1-key-setZoom_100', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, '1', 'Digit1', { ctrlKey: true });
        expect(pdfviewer_magnify.zoomPercentage).toBe(100);
        done();
    });
    it('zero-key-fitToPage', (done) => {
        const target: HTMLElement = document.getElementById('pdfviewer_magnify_viewerContainer');
        Keydown(target, '0', 'Digit0', { ctrlKey: true });
        expect(pdfviewer_magnify.magnification.fitType).toBe('fitToPage');
        done();
    });
});