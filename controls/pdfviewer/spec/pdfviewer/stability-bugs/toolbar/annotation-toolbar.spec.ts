import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { openAnnotationToolbar, verifyAndClickButton, closeAnnotationToolbar, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";
import { mouseOverEvent,mouseClickEvent } from "../../utils.spec";

describe('PDF_Viewer - Annotation Toolbar', () => {
    let pdfviewer_annotation_toolbar: PdfViewer = null;

    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_annotation_toolbar' });
        document.body.appendChild(element);

        pdfviewer_annotation_toolbar = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });

        pdfviewer_annotation_toolbar.documentLoad = () => {
            done();
        };

        pdfviewer_annotation_toolbar.appendTo("#pdfviewer_annotation_toolbar");
    });

    afterAll(() => {
        if (pdfviewer_annotation_toolbar) {
            pdfviewer_annotation_toolbar.destroy();
            const el = document.getElementById('pdfviewer_annotation_toolbar');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_annotation_toolbar = null;
        }
    });

    afterEach(() => {
        // Close annotation toolbar if open
        closeAnnotationToolbar('pdfviewer_annotation_toolbar');
    });

    /**
     * PDF Viewer - Annotation Toolbar Dynamic Configuration Tests
     * Task ID: 1006545
     */
    it("1006545 - Dynamically update toolbar settings and verify annotation toolbar accessibility", () => {
        // Configure toolbar dynamically
        (pdfviewer_annotation_toolbar as any).toolbarSettings = {
            showTooltip: true,
            toolbarItems: [
                'OpenOption',
                'UndoRedoTool',
                'PageNavigationTool',
                'MagnificationTool',
                'PanTool',
                'SelectionTool',
                'CommentTool',
                'SubmitForm',
                'AnnotationEditTool',
                'FormDesignerEditTool',
                'SearchOption',
                'PrintOption',
                'DownloadOption'
            ],
        };
        pdfviewer_annotation_toolbar.dataBind();

        // Verify toolbar container exists
        const toolbar = document.querySelector('#pdfviewer_annotation_toolbar_toolbarContainer');
        expect(toolbar).not.toBeNull();

        // Open annotation toolbar and verify highlight button
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_highlight', 'pdfviewer_annotation_toolbar_highlight');
    });

    it("1006545 - Verify Free Text annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_annotation_freeTextEdit', 'pdfviewer_annotation_toolbar_annotation_freeTextEdit');
    });

    it("1006545 - Verify Ink annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_annotation_ink', 'pdfviewer_annotation_toolbar_annotation_ink');
    });

    it("1006545 - Verify Shape Line annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_shape_line', 'pdfviewer_annotation_toolbar_shape_line');
    });

    it("1006545 - Verify Shape Arrow annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_shape_arrow', 'pdfviewer_annotation_toolbar_shape_arrow');
    });

    it("1006545 - Verify Shape Rectangle annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_shape_rectangle', 'pdfviewer_annotation_toolbar_shape_rectangle');
    });

    it("1006545 - Verify Shape Circle annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_shape_circle', 'pdfviewer_annotation_toolbar_shape_circle');
    });

    it("1006545 - Verify sequential switching between multiple annotation tools", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');

        const tools = [
            { selector: '#pdfviewer_annotation_toolbar_annotation_freeTextEdit', id: 'pdfviewer_annotation_toolbar_annotation_freeTextEdit' },
            { selector: '#pdfviewer_annotation_toolbar_annotation_ink', id: 'pdfviewer_annotation_toolbar_annotation_ink' },
            { selector: '#pdfviewer_annotation_toolbar_shape_line', id: 'pdfviewer_annotation_toolbar_shape_line' },
            { selector: '#pdfviewer_annotation_toolbar_shape_arrow', id: 'pdfviewer_annotation_toolbar_shape_arrow' },
            { selector: '#pdfviewer_annotation_toolbar_shape_rectangle', id: 'pdfviewer_annotation_toolbar_shape_rectangle' }
        ];

        for (const tool of tools) {
            verifyAndClickButton(tool.selector, tool.id);
        }
    });
    it('1004722 - the tooltip is showing in the Shape Rectangle annotation even after disabling', (done) => {
        try {
            // 1) Disable tooltip
            pdfviewer_annotation_toolbar.toolbarSettings.showTooltip = false;
            // 2) Click the main Annotation button
            const annoBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation') as HTMLElement;
            if (!annoBtn) { throw new Error('Annotation button not found: #pdfviewer_annotation_toolbar_annotation'); }
            mouseClickEvent(annoBtn);
            // 3) Click the Shapes button in annotation toolbar
            const shapesBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation_shapes') as HTMLElement;
            if (!shapesBtn) { throw new Error('Shapes button not found: #pdfviewer_annotation_toolbar_annotation_shapes'); }
            mouseClickEvent(shapesBtn);
            // 4) Hover the Rectangle shape button
            const rectBtn = document.querySelector('#pdfviewer_annotation_toolbar_shape_rectangle') as HTMLElement;
            if (!rectBtn) { throw new Error('Rectangle button not found: #pdfviewer_annotation_toolbar_shape_rectangle'); }
            mouseOverEvent(rectBtn);
            // 5) Assertions: no tooltip should be shown
            expect(rectBtn).toBeTruthy();
            const aria: string | null = rectBtn.getAttribute('aria-describedby');
            const dataId: string | null = rectBtn.getAttribute('data-tooltip-id');
            // When showTooltip=false, these should be null/falsy
            expect(aria).toBeFalsy();
            expect(dataId).toBeFalsy();
            // Optional: ensure no tooltip container exists
            const wraps = document.querySelectorAll('.e-tooltip-wrap');
            expect(wraps.length).toBe(0);
            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });
    it('1004722 - the tooltip is showing in the calibrate distance annotation even after disabling', (done) => {
        try {
            pdfviewer_annotation_toolbar.toolbarSettings.showTooltip = false;
            const annoBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation') as HTMLElement;
            if (!annoBtn) { throw new Error('Annotation button not found: #pdfviewer_annotation_toolbar_annotation'); }
            mouseClickEvent(annoBtn);
            const calibrateBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation_calibrate') as HTMLElement;
            if (!calibrateBtn) { throw new Error('Calibrate button not found: #pdfviewer_annotation_toolbar_annotation_calibrate'); }
            mouseClickEvent(calibrateBtn);
            const distanceBtn = document.querySelector('#pdfviewer_annotation_toolbar_calibrate_distance') as HTMLElement;
            if (!distanceBtn) { throw new Error('Distance button not found: #pdfviewer_annotation_toolbar_calibrate_distance'); }
            mouseOverEvent(distanceBtn);
            expect(distanceBtn).toBeTruthy();
            const aria: string | null = distanceBtn.getAttribute('aria-describedby');
            const dataId: string | null = distanceBtn.getAttribute('data-tooltip-id');
            expect(aria).toBeFalsy();
            expect(dataId).toBeFalsy();
            const wraps = document.querySelectorAll('.e-tooltip-wrap');
            expect(wraps.length).toBe(0);
            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });
    it('1004722 - the tooltip is showing in the free text align even after disabling', (done) => {
        try {
            pdfviewer_annotation_toolbar.toolbarSettings.showTooltip = false;
            const annoBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation') as HTMLElement;
            if (!annoBtn) { throw new Error('Annotation button not found: #pdfviewer_annotation_toolbar_annotation'); }
            mouseClickEvent(annoBtn);
            const freeTextBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation_freeTextEdit') as HTMLElement;
            if (!freeTextBtn) { throw new Error('Free Text button not found: #pdfviewer_annotation_toolbar_annotation_freeTextEdit'); }
            mouseClickEvent(freeTextBtn);
            const textAlignBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation_textalign') as HTMLElement;
            if (!textAlignBtn) { throw new Error('Text Align button not found: #pdfviewer_annotation_toolbar_annotation_textalign'); }
            mouseClickEvent(textAlignBtn);
            const leftAlignBtn = document.querySelector('#pdfviewer_annotation_toolbar_left_align') as HTMLElement;
            if (!leftAlignBtn) { throw new Error('Align Left button not found: #pdfviewer_annotation_toolbar_left_align'); }
            mouseOverEvent(leftAlignBtn);
            expect(leftAlignBtn).toBeTruthy();
            const aria: string | null = leftAlignBtn.getAttribute('aria-describedby');
            const dataId: string | null = leftAlignBtn.getAttribute('data-tooltip-id');
            expect(aria).toBeFalsy();
            expect(dataId).toBeFalsy();
            const wraps = document.querySelectorAll('.e-tooltip-wrap');
            expect(wraps.length).toBe(0);
            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });
    it('1004722 - the tooltip is showing in the free text properties even after disabling', (done) => {
        try {
            pdfviewer_annotation_toolbar.toolbarSettings.showTooltip = false;
            const annoBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation') as HTMLElement;
            if (!annoBtn) { throw new Error('Annotation button not found: #pdfviewer_annotation_toolbar_annotation'); }
            mouseClickEvent(annoBtn);
            const textPropsBtn = document.querySelector('#pdfviewer_annotation_toolbar_annotation_textproperties') as HTMLElement;
            if (!textPropsBtn) { throw new Error('Text Properties button not found: #pdfviewer_annotation_toolbar_annotation_textproperties'); }
            mouseClickEvent(textPropsBtn);
            const boldBtn = document.querySelector('#pdfviewer_annotation_toolbar_bold') as HTMLElement;
            if (!boldBtn) { throw new Error('Bold button not found: #pdfviewer_annotation_toolbar_bold'); }
            mouseOverEvent(boldBtn);
            expect(boldBtn).toBeTruthy();
            const aria: string | null = boldBtn.getAttribute('aria-describedby');
            const dataId: string | null = boldBtn.getAttribute('data-tooltip-id');
            expect(aria).toBeFalsy();
            expect(dataId).toBeFalsy();
            const wraps = document.querySelectorAll('.e-tooltip-wrap');
            expect(wraps.length).toBe(0);
            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });
    it("1026218 - Verify Underline annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_underline', 'pdfviewer_annotation_toolbar_underline');
    });
    it("1026218 - Verify Strikethrough annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_strikethrough', 'pdfviewer_annotation_toolbar_strikethrough');
    });
    it("1026218 - Verify Squiggly annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_squiggly', 'pdfviewer_annotation_toolbar_squiggly');
        const enableSquiggly = pdfviewer_annotation_toolbar.toolbar.annotationToolbarModule.isAnnotationButtonsEnabled();
        expect(enableSquiggly).toBe(true);
    });
    it("1026218 - Verify Shape Pentagon annotation tool can be activated from toolbar", () => {
        openAnnotationToolbar('pdfviewer_annotation_toolbar');
        verifyAndClickButton('#pdfviewer_annotation_toolbar_shape_pentagon', 'pdfviewer_annotation_toolbar_shape_pentagon');
    });
});

describe('PDF_Viewer_ShapeLabel_Settings', () => {
    let pdfviewer_shapelabel: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_shapelabel' });
        document.body.appendChild(element);

        pdfviewer_shapelabel = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
        });

        pdfviewer_shapelabel.documentLoad = () => done();
        pdfviewer_shapelabel.appendTo('#pdfviewer_shapelabel');
        pdfviewer_shapelabel.enableShapeLabel = true;
        pdfviewer_shapelabel.shapeLabelSettings = {
            fontSize: 20,
            fontFamily: 'Symbol',
            labelContent: 'Label',
        };
    });

    afterAll(() => {
        if (pdfviewer_shapelabel) {
            pdfviewer_shapelabel.destroy();
            const el = document.getElementById('pdfviewer_shapelabel');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_shapelabel = null;
        }
    });

    it('1023456 - Shape annotation label settings font family and font size will not show in toolbar 1',  (done) => {
        openAnnotationToolbar('pdfviewer_shapelabel');
        verifyAndClickButton('#pdfviewer_shapelabel_shape_rectangle', 'pdfviewer_shapelabel_shape_rectangle');
        done();
    });
    it('1023456 - Shape annotation label settings font family and font size will not show in toolbar 2', (done) => {
        const fontNameElement = document.getElementById("pdfviewer_shapelabel_annotation_fontname_hidden") as HTMLSelectElement;
        const fontFamilyValue = fontNameElement.value;
        expect(fontFamilyValue).toBe('Symbol')
        const fontSizeElement = document.getElementById("pdfviewer_shapelabel_annotation_fontsize_hidden") as HTMLSelectElement;
        const fontSizeValue = fontSizeElement.value;
        expect(fontSizeValue).toBe('20px');
        done();
    });
});