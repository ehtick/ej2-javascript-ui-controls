import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
// import { mouseDownEvent, mouseMoveEvent, mouseUpEvent } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";
import { mouseMoveEvent, mouseDownEvent, mouseUpEvent, mouseClickEvent, waitFor, rightClickEvent, Keydown, focusOn} from "../../utils.spec";


describe('PDF_Viewer_With_disable_Toolbar', () => {
    let pdfViewer: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_disable_toolbar' });
        document.body.appendChild(element);

        pdfViewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
            enableToolbar: false,
            enableTextSearch: true
        });

        pdfViewer.documentLoad = () => done();
        pdfViewer.appendTo('#pdfviewer_disable_toolbar');
    });

    afterAll(() => {
        if (pdfViewer) {
            pdfViewer.destroy();
            const el = document.getElementById('pdfviewer_disable_toolbar');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfViewer = null;
        }
    });

    it('searchbar should not open when toolbar is disabled', (done: DoneFn) => {
        try {
            pdfViewer.enableToolbar=false;
            const target = document.getElementById('pdfviewer_disable_toolbar_textLayer_0');
            target.tabIndex = target.tabIndex || 0;
            target.focus();
            Keydown(target, 'f', 'KeyF', { ctrlKey: true });
            waitFor(() => {
                const searchBox = document.getElementById('pdfviewer_disable_toolbar_search_box');
                return searchBox !== null;
            }).then(() => {
                const searchBox = document.getElementById('pdfviewer_disable_toolbar_search_box');
                expect(searchBox.style.display).toBe('none');
                done();
            }).catch((err: any) => {
                done.fail(err);
            });
        } catch (e) {
            done.fail(e as any);
        }
    });

});
describe('PDF_Viewer_panMode', () => {
    let pdfviewer_panMode: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_panMode' });
        document.body.appendChild(element);
        pdfviewer_panMode = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_panMode.documentLoad = () => {
            done();
        }
        pdfviewer_panMode.appendTo("#pdfviewer_panMode");
    });

    afterAll(() => {
        if (pdfviewer_panMode) {
            pdfviewer_panMode.destroy();
            const el = document.getElementById('pdfviewer_panMode');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_panMode = null;
        }
    });

    afterEach(() => {
    });
    it('1021252 - After placing sticky note in pan mode, viewer should switch to interactive mode', async (done: DoneFn) => {
        try {
            const panBtn = document.getElementById('pdfviewer_panMode_handTool') as HTMLElement;
            expect(panBtn).not.toBeNull();
            mouseClickEvent(panBtn);
            const stickyNoteBtn = document.getElementById('pdfviewer_panMode_comment') as HTMLElement;
            expect(stickyNoteBtn).not.toBeNull();
            mouseClickEvent(stickyNoteBtn);
            const textLayer = document.getElementById('pdfviewer_panMode_textLayer_0') as HTMLElement;
            expect(textLayer).not.toBeNull();
            const rect = textLayer.getBoundingClientRect();
            const viewerContainer = document.getElementById('pdfviewer_panMode_viewerContainer') as HTMLElement;
            await waitFor(() => !!viewerContainer);
            const x = Math.round(rect.left + rect.width / 2);
            const y = Math.round(rect.top + rect.height / 2);
            mouseMoveEvent(textLayer, x, y);
            mouseDownEvent(textLayer, x, y);
            mouseUpEvent(textLayer, x, y);
            focusOn(viewerContainer);
            expect(pdfviewer_panMode.viewerBase.isPanMode).toBe(false);
            expect(pdfviewer_panMode.viewerBase.viewerContainer.style.cursor).toBe('auto');

            done();
        } catch (e) {
            done.fail(e);
        }
    });
});

