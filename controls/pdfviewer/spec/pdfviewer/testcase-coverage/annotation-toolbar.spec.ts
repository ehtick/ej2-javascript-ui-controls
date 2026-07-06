import { createElement, Browser } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer, DynamicStampItem,
    AnnotationToolbar
} from "../../../src/index";
import { openAnnotationToolbar, verifyAndClickButton, closeAnnotationToolbar, waitFor, getTarget, normalizeToHex, moveSlider } from "../utils.spec";
import { EMPTY_PDF_B64 } from "../Data/pdf-data.spec";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, mouseOverEvent, mouseClickEvent } from "../utils.spec";

describe('PDFViewer_Annotation_Toolbar', () => {
    const viewerElementId = 'pdfviewer_annotation_toolbar';
    let pdfviewer_annotation_toolbar: PdfViewer;

    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const el = createElement('div', { id: viewerElementId });
        document.body.appendChild(el);

        pdfviewer_annotation_toolbar = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });

        pdfviewer_annotation_toolbar.documentLoad = () => {
            done();
        };

        pdfviewer_annotation_toolbar.appendTo('#' + viewerElementId);
    });

    afterAll(() => {
        if (pdfviewer_annotation_toolbar) {
            pdfviewer_annotation_toolbar.destroy();
            const el = document.getElementById(viewerElementId);
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
        }
    });

    it('change-properties-highlight', (done) => {
        openAnnotationToolbar(viewerElementId);
        verifyAndClickButton('#' + viewerElementId + '_highlight', viewerElementId + '_highlight');
        const colorElement = document.querySelector('#' + viewerElementId + '_annotation_color') as HTMLElement;
        expect(colorElement).not.toBeNull();
        colorElement.click();
        const picker = Array.from(document.querySelectorAll('.e-dropdown-popup.e-popup-open')).pop() as HTMLElement;
        expect(picker).toBeTruthy();
        const tile = picker.querySelector('span.e-tile[aria-label="#f44336ff"]') as HTMLElement;
        expect(tile).toBeTruthy();
        tile.click();
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightColor).toBe('#f44336');
        const opacityElement = document.querySelector('#' + viewerElementId + '_annotation_opacity') as HTMLElement;
        expect(opacityElement).toBeTruthy();
        opacityElement.click();
        moveSlider('.e-slider .e-handle-first', 500);
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightOpacity).toBeLessThanOrEqual(1);
        done();
    });

    it('change-properties-underline', (done) => {
        openAnnotationToolbar(viewerElementId);
        verifyAndClickButton('#' + viewerElementId + '_underline', viewerElementId + '_underline');
        const colorElement = document.querySelector('#' + viewerElementId + '_annotation_color') as HTMLElement;
        expect(colorElement).not.toBeNull();
        colorElement.click();
        const picker = Array.from(document.querySelectorAll('.e-dropdown-popup.e-popup-open')).pop() as HTMLElement;
        expect(picker).toBeTruthy();
        const tile = picker.querySelector('span.e-tile[aria-label="#f44336ff"]') as HTMLElement;
        expect(tile).toBeTruthy();
        tile.click();
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightColor).toBe('#f44336');
        const opacityElement = document.querySelector('#' + viewerElementId + '_annotation_opacity') as HTMLElement;
        expect(opacityElement).toBeTruthy();
        opacityElement.click();
        moveSlider('.e-slider .e-handle-first', 500);
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightOpacity).toBeLessThanOrEqual(1);
        done();
    });

    it('change-properties-strikethrough', (done) => {
        openAnnotationToolbar(viewerElementId);
        verifyAndClickButton('#' + viewerElementId + '_strikethrough', viewerElementId + '_strikethrough');
        const colorElement = document.querySelector('#' + viewerElementId + '_annotation_color') as HTMLElement;
        expect(colorElement).not.toBeNull();
        colorElement.click();
        const picker = Array.from(document.querySelectorAll('.e-dropdown-popup.e-popup-open')).pop() as HTMLElement;
        expect(picker).toBeTruthy();
        const tile = picker.querySelector('span.e-tile[aria-label="#f44336ff"]') as HTMLElement;
        expect(tile).toBeTruthy();
        tile.click();
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightColor).toBe('#f44336');
        const opacityElement = document.querySelector('#' + viewerElementId + '_annotation_opacity') as HTMLElement;
        expect(opacityElement).toBeTruthy();
        opacityElement.click();
        moveSlider('.e-slider .e-handle-first', 500);
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightOpacity).toBeLessThanOrEqual(1);
        done();
    });

    it('change-properties-squiggly', (done) => {
        openAnnotationToolbar(viewerElementId);
        verifyAndClickButton('#' + viewerElementId + '_squiggly', viewerElementId + '_squiggly');
        const colorElement = document.querySelector('#' + viewerElementId + '_annotation_color') as HTMLElement;
        expect(colorElement).not.toBeNull();
        colorElement.click();
        const picker = Array.from(document.querySelectorAll('.e-dropdown-popup.e-popup-open')).pop() as HTMLElement;
        expect(picker).toBeTruthy();
        const tile = picker.querySelector('span.e-tile[aria-label="#f44336ff"]') as HTMLElement;
        expect(tile).toBeTruthy();
        tile.click();
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightColor).toBe('#f44336');
        const opacityElement = document.querySelector('#' + viewerElementId + '_annotation_opacity') as HTMLElement;
        expect(opacityElement).toBeTruthy();
        opacityElement.click();
        moveSlider('.e-slider .e-handle-first', 500);
        expect(pdfviewer_annotation_toolbar.annotationModule.textMarkupAnnotationModule.highlightOpacity).toBeLessThanOrEqual(1);
        done();
    });
});

describe('PDFViewer_Mobile_Annotation_Toolbar', () => {
    const viewerElementId = 'pdfviewer_mobile_annotation_toolbar';
    let pdfviewer_mobile_annotation_toolbar: PdfViewer;
    let originalIsDevice: boolean;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        originalIsDevice = Browser.isDevice;
        const el = createElement('div', { id: viewerElementId });
        document.body.appendChild(el);

        pdfviewer_mobile_annotation_toolbar = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });

        pdfviewer_mobile_annotation_toolbar.documentLoad = () => {
            done();
        };
        Object.defineProperty(Browser, 'isDevice', { get: function () { return true; }, configurable: true });
        pdfviewer_mobile_annotation_toolbar.enableDesktopMode = false;
        pdfviewer_mobile_annotation_toolbar.appendTo('#' + viewerElementId);
    });

    afterAll(() => {
        if (pdfviewer_mobile_annotation_toolbar) {
            pdfviewer_mobile_annotation_toolbar.destroy();
            const el = document.getElementById(viewerElementId);
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
        }
        Object.defineProperty(Browser, 'isDevice', { get: function () { return originalIsDevice; }, configurable: true });
    });

    it("Verify Mobile Free Text annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_annotation_freeTextEdit') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_freeTextEdit', 'pdfviewer_mobile_annotation_toolbar_annotation_freeTextEdit');
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Ink annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_annotation_ink') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_ink', 'pdfviewer_mobile_annotation_toolbar_annotation_ink');
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Shape Line annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_shapes', 'pdfviewer_mobile_annotation_toolbar_annotation_shapes');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_shape_line', 'pdfviewer_mobile_annotation_toolbar_shape_line');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_shape_line') as HTMLButtonElement;
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Shape Arrow annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_shapes', 'pdfviewer_mobile_annotation_toolbar_annotation_shapes');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_shape_arrow', 'pdfviewer_mobile_annotation_toolbar_shape_arrow');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_shape_arrow') as HTMLButtonElement;
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Shape Rectangle annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_shapes', 'pdfviewer_mobile_annotation_toolbar_annotation_shapes');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_shape_rectangle', 'pdfviewer_mobile_annotation_toolbar_shape_rectangle');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_shape_rectangle') as HTMLButtonElement;
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Shape Circle annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_shapes', 'pdfviewer_mobile_annotation_toolbar_annotation_shapes');
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_shape_circle', 'pdfviewer_mobile_annotation_toolbar_shape_circle');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_shape_circle') as HTMLButtonElement;
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Highlight annotation tool can be activated from toolbar", () => {
        const target: any = document.getElementById('pdfviewer_mobile_annotation_toolbar_textLayer_0');
        expect(target).toBeTruthy();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_highlight') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_highlight', 'pdfviewer_mobile_annotation_toolbar_highlight');
        const rect = target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        mouseDownEvent(target, x, y);
        mouseDownEvent(target, x, y);
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Underline annotation tool can be activated from toolbar", () => {
        const target: any = document.getElementById('pdfviewer_mobile_annotation_toolbar_textLayer_0');
        expect(target).toBeTruthy();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_underline') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_underline', 'pdfviewer_mobile_annotation_toolbar_underline');
        const rect = target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        mouseDownEvent(target, x, y);
        mouseDownEvent(target, x, y);
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Strikethrough annotation tool can be activated from toolbar", () => {
        const target: any = document.getElementById('pdfviewer_mobile_annotation_toolbar_textLayer_0');
        expect(target).toBeTruthy();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_strikethrough') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_strikethrough', 'pdfviewer_mobile_annotation_toolbar_strikethrough');
        const rect = target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        mouseDownEvent(target, x, y);
        mouseDownEvent(target, x, y);
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Squiggly annotation tool can be activated from toolbar", () => {
        const target: any = document.getElementById('pdfviewer_mobile_annotation_toolbar_textLayer_0');
        expect(target).toBeTruthy();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_squiggly') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_squiggly', 'pdfviewer_mobile_annotation_toolbar_squiggly');
        const rect = target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        mouseDownEvent(target, x, y);
        mouseDownEvent(target, x, y);
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("Verify Mobile Calibrate annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
        const button = document.querySelector('#pdfviewer_mobile_annotation_toolbar_annotation_calibrate') as HTMLButtonElement;
        verifyAndClickButton('#pdfviewer_mobile_annotation_toolbar_annotation_calibrate', 'pdfviewer_mobile_annotation_toolbar_annotation_calibrate');
        expect(button).not.toBeNull();
        openAnnotationToolbar('pdfviewer_mobile_annotation_toolbar');
    });

    it("CreateMobileToolbar_showToolbar", (done) => {
        pdfviewer_mobile_annotation_toolbar.toolbar.annotationToolbarModule.createMobileAnnotationToolbar(true);
        pdfviewer_mobile_annotation_toolbar.toolbar.annotationToolbarModule.showToolbar(true);
        expect(pdfviewer_mobile_annotation_toolbar.enableAnnotationToolbar).toBe(true);
        pdfviewer_mobile_annotation_toolbar.toolbar.annotationToolbarModule.showToolbar(false);
        done();
    });
});