import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer } from '../../../../src/index';
import { getTarget } from '../../utils.spec';
import { EMPTY_PDF_B64, HELLO_PDF_B64 } from '../../Data/pdf-data.spec';

// Inject all required PDF Viewer modules for the test environment
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

/**
 * Thumbnail View - State Retention Test Suite
 * Validates that isThumbnailViewOpen state is preserved across document loads
 */
describe('PDF_Viewer_ThumbnailView_StateRetention', () => {
    let pdfviewer_thumbnail_state: PdfViewer | null = null;

    // Initialize the PDF Viewer once and reuse it for all tests
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_thumbnail_state' });
        document.body.appendChild(element);

        pdfviewer_thumbnail_state = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            // Enable thumbnail view by default
            isThumbnailViewOpen: true,
            // Load an empty PDF initially
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
        });

        // Proceed once the initial document is loaded
        pdfviewer_thumbnail_state.documentLoad = () => done();
        pdfviewer_thumbnail_state.appendTo('#pdfviewer_thumbnail_state');
    });

    // Destroy viewer instance and cleanup DOM after all tests
    afterAll(() => {
        if (pdfviewer_thumbnail_state) {
            pdfviewer_thumbnail_state.destroy();
            const el = document.getElementById('pdfviewer_thumbnail_state');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_thumbnail_state = null;
        }
    });

    it('ThumbnailView-RetainStateAfterDocumentLoad', (done) => {
        // Validate that thumbnail sidebar is visible initially
        const initialSidebarContainer = getTarget('#pdfviewer_thumbnail_state_sideBarContentContainer');
        expect(initialSidebarContainer.style.display).not.toBe('none');
        expect(pdfviewer_thumbnail_state.isThumbnailViewOpen).toBe(true);

        // Attach documentLoad handler before switching documents
        pdfviewer_thumbnail_state.documentLoad = () => {
            // Verify thumbnail state is retained after loading second document
            expect(pdfviewer_thumbnail_state.isThumbnailViewOpen).toBe(true);

            // Confirm thumbnail sidebar remains visible
            const sidebarContainerAfterLoad = getTarget('#pdfviewer_thumbnail_state_sideBarContentContainer');
            expect(sidebarContainerAfterLoad.style.display).not.toBe('none');

            // Ensure thumbnails are generated and rendered
            const thumbnailView = getTarget('#pdfviewer_thumbnail_state_thumbnail_view');
            expect(thumbnailView.children.length).toBeGreaterThan(0);

            done();
        };

        // Load a second PDF document to validate state retention
        pdfviewer_thumbnail_state.documentPath =
            'data:application/pdf;base64,' + HELLO_PDF_B64;
    });
});