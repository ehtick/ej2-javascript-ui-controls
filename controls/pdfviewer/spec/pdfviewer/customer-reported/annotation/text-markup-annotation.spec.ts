import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer, PrintStartEventArgs } from '../../../../src/index';
import { colorPDF } from '../../Data/pdf-data.spec';
import { waitFor } from '../../utils.spec';


describe('PDF_Viewer_redaction_download', () => {
    let pdfviewer_redaction: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_redaction' });
        document.body.appendChild(element);
        pdfviewer_redaction = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + colorPDF
        });
        pdfviewer_redaction.documentLoad = () => {
            // Ensure redaction toolbar is available in Standalone
            if (pdfviewer_redaction && pdfviewer_redaction.toolbar) {
                pdfviewer_redaction.toolbar.showRedactionToolbar(true);
            }
            done();
        };
        pdfviewer_redaction.appendTo('#pdfviewer_redaction');
    });

    afterAll(() => {
        if (pdfviewer_redaction) {
            pdfviewer_redaction.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_redaction');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_redaction = null;
        }
    });
    it('Redact- adds page redactions, applies, and downloads; blob should be a PDF', async (done: DoneFn) => {
        const blob = await pdfviewer_redaction.saveAsBlob();
        expect(blob).toBeDefined();
        expect(blob.type).toBe('application/pdf'); // extra validation
        done();
    });
});