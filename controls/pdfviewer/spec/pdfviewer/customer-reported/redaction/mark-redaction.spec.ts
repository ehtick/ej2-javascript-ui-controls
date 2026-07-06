import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { exportAnnotationsHelper, getTarget, importAnnotationsHelper, mouseDownEvent, mouseMoveEvent, mouseUpEvent, threePointCalibrate, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_Redaction_Annotation', () => {
    let pdfviewer_redaction: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_redaction' });
        document.body.appendChild(element);
        pdfviewer_redaction = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_redaction.documentLoad = () => {
            done();
        }
        pdfviewer_redaction.appendTo("#pdfviewer_redaction");
        pdfviewer_redaction.toolbarSettings = {
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
                'RedactionEditTool',
                'FormDesignerEditTool',
                'SearchOption',
                'PrintOption',
                'DownloadOption',
            ],
        };
        pdfviewer_redaction.enableFormDesigner = false;
    });

    afterAll(() => {
        if (pdfviewer_redaction) {
            pdfviewer_redaction.destroy();
            const el = document.getElementById('pdfviewer_redaction');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_redaction = null;
        }
    });

    afterEach(() => {
    });

    it('1031229-mark redaction without form designer', (done) => {
        const redactionBtn = getTarget('#pdfviewer_redaction_redaction');
        redactionBtn.click();
        const toolbarElement = getTarget('#pdfviewer_redaction_redaction_toolbar');
        expect(toolbarElement.style.display).toBe('block');
 
        const markForRedactionItem = getTarget('#pdfviewer_redaction_markForRedaction');
        markForRedactionItem.click();
 
        pdfviewer_redaction.annotationAdd = function () {
            expect(pdfviewer_redaction.annotationCollection.length).toBeGreaterThan(0);
            const annot = pdfviewer_redaction.annotationCollection[pdfviewer_redaction.annotationCollection.length - 1];
            expect(annot.shapeAnnotationType).toBe('Redaction');
            expect(annot.subject).toBe('Redaction');
            done();
        };
 
        let target = getTarget('#pdfviewer_redaction_textLayer_0');
        let rect = target.getBoundingClientRect();
        let sx = Math.round(rect.left + 260);
        let sy = Math.round(rect.top + 80);
        let ex = Math.round(rect.left + 360);
        let ey = Math.round(rect.top + 140);
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        let steps = 10;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let x = Math.round(sx + (ex - sx) * t);
            let y = Math.round(sy + (ey - sy) * t);
            mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
    });

    it ('1031229-Redacting a annotation in document', (done) => {
        const redactBtn = getTarget('#pdfviewer_redaction_redact');
        redactBtn.click();
 
        pdfviewer_redaction.documentLoad = function () {
            done();
        }
        const applyBtn = document.querySelector('.e-pv-redaction-confirmation-popup .e-footer-content .e-primary') as HTMLElement;
        applyBtn.click();
    });
})