import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { TILE_PDF_B64 } from "../../Data/pdf-data.spec";

describe('PDF_Viewer_PageRender', () => {
    let pdfviewer_pageRender: PdfViewer = null;

    // Register required modules for PdfViewer
    PdfViewer.Inject(
        Toolbar,
        Magnification,
        Navigation,
        LinkAnnotation,
        ThumbnailView,
        BookmarkView,
        TextSelection,
        TextSearch,
        Print,
        Annotation,
        FormFields,
        FormDesigner,
        PageOrganizer
    );

    beforeAll((done) => {
        // Create host element and mount viewer with an initial empty (base64) PDF
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_pageRender' });
        document.body.appendChild(element);

        pdfviewer_pageRender = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + TILE_PDF_B64
        });

        // Wait for the initial document to load before running tests
        pdfviewer_pageRender.documentLoad = () => {
            pdfviewer_pageRender.navigation.goToPage(1);
            done();
        };

        // Attach viewer to DOM
        pdfviewer_pageRender.appendTo("#pdfviewer_pageRender");
    });

    afterAll(() => {
        // Clean up viewer instance and DOM to prevent test bleed-over
        if (pdfviewer_pageRender) {
            pdfviewer_pageRender.destroy();
            const el = document.getElementById('pdfviewer_pageRender');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_pageRender = null;
        }
    });

    afterEach(() => {
        // No per-test teardown required currently
    });

    /**
     * Task ID: 1013827
     * Title: 1013827 - Tile rendering fails to render when programmatically navigating to the first page in a single page document
     *
     * Loads a single-page tiled PDF, navigates to page 1 programmatically on documentLoad,
     * waits for all 4 tiles to render, and verifies tiles are present in pageDiv_0.
     */
    it('1013827 - Tile rendering to render when programmatically navigating to the first page in a single page document', async function (done) {
        try {
            pdfviewer_pageRender.pageRenderComplete = function () {
                // Get the page div container for page 0
                const pageDiv = document.querySelector('#pdfviewer_pageRender_pageDiv_0');
                expect(pageDiv).toBeTruthy();

                // Count all tile images within the page div
                const tileImages = pageDiv.querySelectorAll('img[id*="tileimg_0_"]');

                // Assert that exactly 4 tiles are rendered in the page div
                expect(tileImages.length).toBe(4);

                // Assert pageCount is valid after tile rendering completes
                const count: number = (pdfviewer_pageRender as any).pageCount;
                expect(typeof count).toBe('number');
                expect(count).toBeGreaterThan(0);

                done();
            }
        } catch (err) {
            // Surface any unexpected error to Jasmine
            fail(err as any);
            done();
        }
    });
});