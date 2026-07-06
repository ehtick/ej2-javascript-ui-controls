import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer } from '../../../../src/index';
import { TOC_PAGE } from '../../Data/pdf-data.spec';

describe('PDF_Viewer_TOC_Page_Navigation', () => {
    let pdfviewer_link_annotation: PdfViewer = null;
    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_link_annotation' });
        document.body.appendChild(element);
        pdfviewer_link_annotation = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + TOC_PAGE
        });
        pdfviewer_link_annotation.documentLoad = () => {
            done();
        }
        pdfviewer_link_annotation.appendTo('#pdfviewer_link_annotation');
    });
    afterAll(() => {
        if (pdfviewer_link_annotation) {
            pdfviewer_link_annotation.destroy();
            const el = document.getElementById('pdfviewer_link_annotation');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_link_annotation = null;
        }
    });

    it('1023831-Clicking the TOC page navigation not Working', (done) => {
        try {
            const link = document.querySelector('#weblinkdiv_0_0');
            const linkRect = link.getBoundingClientRect();
            const textNodes = Array.from(
                document.querySelectorAll('#pdfviewer_link_annotation_textLayer_0 .e-pv-text')
            );
            expect(textNodes.length).toBeGreaterThan(0);
            const overlappingTextNodes = textNodes.filter(node => {
                const rect = node.getBoundingClientRect();
                return !(
                    rect.right < linkRect.left ||
                    rect.left > linkRect.right ||
                    rect.bottom < linkRect.top ||
                    rect.top > linkRect.bottom
                );
            });
            expect(overlappingTextNodes.length).toBeGreaterThan(0);
            done();
        } catch (e) {
            done.fail(e);
        }
    });
});
