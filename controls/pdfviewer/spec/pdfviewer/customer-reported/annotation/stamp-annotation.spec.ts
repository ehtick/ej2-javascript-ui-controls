import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer,
    DynamicStampItem,
    StampSettings,
    SignStampItem
} from "../../../../src/index";
import { getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64, OLD_PDFVIEWER_JSON, STAMP_ANNOTATION } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_Stamp', () => {
    let pdfviewer_stampAnnot: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_stampAnnot' });
        document.body.appendChild(element);
        pdfviewer_stampAnnot = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_stampAnnot.documentLoad = () => {
            done();
        }
        pdfviewer_stampAnnot.appendTo("#pdfviewer_stampAnnot");
    });

    afterAll(() => {
        if (pdfviewer_stampAnnot) {
            pdfviewer_stampAnnot.destroy();
            const el = document.getElementById('pdfviewer_stampAnnot');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_stampAnnot = null;
        }
    });

    afterEach(() => {
    });

    it('1014671-Adds stamp and set status with rect values', async (done) => {
        const target = document.querySelector('#pdfviewer_stampAnnot_textLayer_0');
        
        pdfviewer_stampAnnot.annotation.setAnnotationMode("Stamp", DynamicStampItem.Approved)
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);

        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 2, cy + 2);

        mouseDownEvent(target, cx + 2, cy + 2);
        mouseUpEvent(target, cx + 2, cy + 2);

        await waitFor(() => pdfviewer_stampAnnot.annotationCollection && pdfviewer_stampAnnot.annotationCollection.length > 0);

        (document.querySelector('#pdfviewer_stampAnnot_annotation') as any).click();
        (document.querySelector('#pdfviewer_stampAnnot_annotation_commentPanel') as any).click();

        await waitFor(() => (document.querySelector('#pdfviewer_stampAnnot_commentdiv_1_0') as any));
        const div: any = document.querySelector('#pdfviewer_stampAnnot_commentdiv_1_0');
        div.click();

        pdfviewer_stampAnnot.annotation.setAnnotationMode("Stamp", DynamicStampItem.Approved);

        (document.querySelector('#pdfviewer_stampAnnot_more-options_1_0') as any).click();

        await waitFor(() => (document.querySelector('#pdfviewer_stampAnnot_comment_context_menu') as any));
        const ctxMenu = document.querySelector('#pdfviewer_stampAnnot_comment_context_menu');

        const setStatus = Array.from(ctxMenu.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Set Status');
        setStatus.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

        await waitFor(() => {
            const uls = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'));
            return uls.some(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));
        });

        const submenu = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'))
            .find(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));

        Array.from(submenu.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Accepted')
            .click();
        expect(pdfviewer_stampAnnot.annotationCollection[0].review.state).toBe('Accepted');
        done();
    });

})

describe('Stamp_Annotation', () => {
    let pdfviewer_stampAnnotation: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_stampAnnotation' });
        document.body.appendChild(element);
        pdfviewer_stampAnnotation = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + STAMP_ANNOTATION
        });
        pdfviewer_stampAnnotation.documentLoad = () => {
            done();
        }
        pdfviewer_stampAnnotation.enableMagnification = false;
        pdfviewer_stampAnnotation.appendTo("#pdfviewer_stampAnnotation");
    });

    afterAll(() => {
        if (pdfviewer_stampAnnotation) {
            pdfviewer_stampAnnotation.destroy();
            const el = document.getElementById('pdfviewer_stampAnnotation');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_stampAnnotation = null;
        }
    });

    afterEach(() => {
    });

    it('1031607-stamp annotation without magnification module', async (done) => {
        await waitFor(() => pdfviewer_stampAnnotation.annotationCollection && pdfviewer_stampAnnotation.annotationCollection.length > 0);
        expect(pdfviewer_stampAnnotation.annotationCollection.length).toBe(3);
        done();
    });

})