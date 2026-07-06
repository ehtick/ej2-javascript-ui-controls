import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer, AnnotationDataFormat } from '../../../../src/index';
import { EMPTY_PDF_B64, RECTANGLE_DATA } from '../../Data/pdf-data.spec';

describe('Annotation-Comments', () => {
    let annotation_comment: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
        BookmarkView, TextSelection, TextSearch, Print, Annotation,
        FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element = createElement('div', { id: 'annotation_comment' });
        document.body.appendChild(element);
        annotation_comment = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        annotation_comment.documentLoad = () => done();
        annotation_comment.appendTo('#annotation_comment');
    });

    afterAll(() => {
        if (annotation_comment) {
            annotation_comment.destroy();
            const el = document.getElementById('annotation_comment');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            annotation_comment = null;
        }
    });

    it('1016598-Check Reply Comment Title maxWidth on import', (done) => {
        const importData = RECTANGLE_DATA;
        annotation_comment.isAnnotationToolbarVisible = true;
        annotation_comment.isCommandPanelOpen = true;
        try {
            annotation_comment.importSuccess = () => {
                const reply1 = document.getElementById('annotation_comment_replyTitle_1_1') as HTMLElement;
                expect(reply1.style.maxWidth).toEqual('234px');
                const reply2 = document.getElementById('annotation_comment_replyTitle_1_2') as HTMLElement;
                expect(reply2.style.maxWidth).toEqual('234px');
                done();
            };
            if (typeof annotation_comment.importAnnotation === 'function') {
                annotation_comment.importAnnotation(importData, AnnotationDataFormat.Json);
            }
        } catch (e) {
            done.fail(e)
        }
    });
})