import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, mouseClickEvent, mouseOverEvent } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";


describe('PDF_Viewer_Redaction_Toolbar', () => {
    let pdfviewer_redaction_toolbar: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_redaction_toolbar' });
        document.body.appendChild(element);
        pdfviewer_redaction_toolbar = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_redaction_toolbar.documentLoad = () => {
            done();
        }
        pdfviewer_redaction_toolbar.appendTo("#pdfviewer_redaction_toolbar");
    });

    afterAll(() => {
        if (pdfviewer_redaction_toolbar) {
            pdfviewer_redaction_toolbar.destroy();
            const el = document.getElementById('pdfviewer_redaction_toolbar');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_redaction_toolbar = null;
        }
    });

    afterEach(() => {
    });
    it('1004722 - the tooltip is showing in the redaction annotation even after disabling', async (done: DoneFn) => {
        try {
            pdfviewer_redaction_toolbar.toolbarSettings.showTooltip = false;
            const redactBtn = document.querySelector('#pdfviewer_redaction_toolbar_redaction') as HTMLElement | null;
            if (!redactBtn) { throw new Error('Redaction button not found: #pdfviewer_redaction_toolbar'); }
            mouseClickEvent(redactBtn);
            const markBtn = document.querySelector('#pdfviewer_redaction_toolbar_markForRedaction') as HTMLElement | null;
            if (!markBtn) { throw new Error('Mark for Redaction button not found: #pdfviewer_redaction_toolbar_markForRedaction'); }
            mouseOverEvent(markBtn);
            expect(markBtn).toBeTruthy();
            const aria: string | null = markBtn.getAttribute('aria-describedby');
            const dataId: string | null = markBtn.getAttribute('data-tooltip-id');
            expect(aria).toBeFalsy();
            expect(dataId).toBeFalsy();
            const wraps = document.querySelectorAll('.e-tooltip-wrap');
            expect(wraps.length).toBe(0);
            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });
});