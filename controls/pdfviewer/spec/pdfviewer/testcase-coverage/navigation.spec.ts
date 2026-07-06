import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner } from '../../../src/index';
import { EMPTY_3PAGE_B64 } from '../Data/pdf-data.spec';
import { waitFor } from '../utils.spec';

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner);

describe('PDF_Viewer_Page_Navigation_Without_Page', () => {
    let pdfviewer_nav_without_page: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_nav_without_page' });
        document.body.appendChild(element);
        pdfviewer_nav_without_page = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
        });

        pdfviewer_nav_without_page.appendTo('#pdfviewer_nav_without_page');
        done();
    });

    afterAll(() => {
        if (pdfviewer_nav_without_page) {
            pdfviewer_nav_without_page.destroy();
            const el = document.getElementById('pdfviewer_nav_without_page');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_nav_without_page = null;
        }
    });

    it('goToNextPage_without_page', (done) => {
        pdfviewer_nav_without_page.navigation.goToNextPage();
        expect(pdfviewer_nav_without_page.currentPageNumber).toBe(0);
        done();
    });

    it('goToPreviousPage_without_page', (done) => {
        pdfviewer_nav_without_page.navigation.goToPreviousPage();
        expect(pdfviewer_nav_without_page.currentPageNumber).toBe(0);
        done();
    });

});

describe('PDF_Viewer_Page_Navigation', () => {
    let pdfviewer_nav: PdfViewer = null;

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_nav' });
        document.body.appendChild(element);
        pdfviewer_nav = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_3PAGE_B64,
        });

        pdfviewer_nav.documentLoad = () => {
            done();
        };

        pdfviewer_nav.appendTo('#pdfviewer_nav');
    });

    afterAll(() => {
        if (pdfviewer_nav) {
            pdfviewer_nav.destroy();
            const el = document.getElementById('pdfviewer_nav');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_nav = null;
        }
    });

    it('goToNextPage-from-first page--to-next page', async () => {
        pdfviewer_nav.navigation.goToNextPage();
        await waitFor(() => pdfviewer_nav.currentPageNumber === 2)
        expect(pdfviewer_nav.currentPageNumber).toBe(2);
        const tl = document.getElementById(pdfviewer_nav.element.id + '_textLayer_1') as HTMLElement;
        expect(tl).toBeTruthy();
    });

    it('goToPage-move-to-page-3', async () => {
        pdfviewer_nav.navigation.goToPage(3);
        await waitFor(() => pdfviewer_nav.currentPageNumber === 3)
        expect(pdfviewer_nav.currentPageNumber).toBe(3);
        const tl = document.getElementById(pdfviewer_nav.element.id + '_textLayer_2') as HTMLElement;
        expect(tl).toBeTruthy();
    });

    it('goToPreviousPage-from-last page--to-previous page', async () => {
        expect(pdfviewer_nav.currentPageNumber).toBe(3);
        pdfviewer_nav.navigation.goToPreviousPage();
        await waitFor(() => pdfviewer_nav.currentPageNumber === 2)
        expect(pdfviewer_nav.currentPageNumber).toBe(2);
        const tl = document.getElementById(pdfviewer_nav.element.id + '_textLayer_1') as HTMLElement;
        expect(tl).toBeTruthy();
    });

    it('goToFirstPage-navigates-to-first', async () => {
        pdfviewer_nav.navigation.goToFirstPage();
        await waitFor(() => pdfviewer_nav.currentPageNumber === 1)
        expect(pdfviewer_nav.currentPageNumber).toBe(1);
        const tl = document.getElementById(pdfviewer_nav.element.id + '_textLayer_0') as HTMLElement;
        expect(tl).toBeTruthy();
    });

});