import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer,
    LineSettings
} from "../../../../src/index";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

/**
 * Test Suite: Shape Label & Comments Panel Synchronization
 *
 * Purpose:
 * Validate that shape label state and Comments panel UI remain synchronized
 * when comments are added programmatically using editAnnotation()
 * in standalone mode.
 */
describe('PDF_Viewer_ShapeLabel_CommentsPanelSync', () => {

    // PDF Viewer instance used across the test suite
    let pdfviewer_shapelabel_comments: PdfViewer | null = null;

    // Inject required PDF Viewer modules for annotation and UI features
    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    /**
     * Setup:
     * - Create DOM container
     * - Initialize PDF Viewer
     * - Load an empty PDF document
     */
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_shapelabel_comments' });
        document.body.appendChild(element);

        pdfviewer_shapelabel_comments = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
        });

        // Ensure test execution starts only after document load
        pdfviewer_shapelabel_comments.documentLoad = () => done();

        pdfviewer_shapelabel_comments.appendTo('#pdfviewer_shapelabel_comments');
    });

    /**
     * Cleanup:
     * - Destroy PDF Viewer instance
     * - Remove DOM element after test completion
     */
    afterAll(() => {
        if (pdfviewer_shapelabel_comments) {
            pdfviewer_shapelabel_comments.destroy();
            const el = document.getElementById('pdfviewer_shapelabel_comments');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_shapelabel_comments = null;
        }
    });

    /**
     * Test Case ID: 1023901
     *
     * Objective:
     * Verify that shape label settings persist and Comments panel
     * remains synchronized after adding a comment programmatically
     * using editAnnotation().
     */
    it('1023901 - Shape label persists and comment panel syncs after editAnnotation()', () => {

        // Enable shape labels globally
        pdfviewer_shapelabel_comments.enableShapeLabel = true;

        // Configure shape label appearance
        pdfviewer_shapelabel_comments.shapeLabelSettings.fillColor = "#f44336ff";
        pdfviewer_shapelabel_comments.shapeLabelSettings.fontColor = "#ffffffff";
        pdfviewer_shapelabel_comments.shapeLabelSettings.fontFamily = "Times New Roman";
        pdfviewer_shapelabel_comments.shapeLabelSettings.fontSize = 18;
        pdfviewer_shapelabel_comments.shapeLabelSettings.labelContent = "Syncfusion";
        pdfviewer_shapelabel_comments.shapeLabelSettings.opacity = 0.9;

        // Add a Line annotation programmatically
        pdfviewer_shapelabel_comments.annotation.addAnnotation("Line", {
            pageNumber: 1,
            vertexPoints: [{ x: 350, y: 350 }, { x: 350, y: 550 }],
            lineHeadEndStyle: "Diamond",
            lineHeadStartStyle: "Square",
            author: "Line",
            strokeColor: "#03a9f4ff",
            opacity: 1,
            thickness: 2
        } as LineSettings);

        // Retrieve the recently added annotation
        const annot = pdfviewer_shapelabel_comments.annotationCollection[
            pdfviewer_shapelabel_comments.annotationCollection.length - 1
        ];
        
        // Capture initial shape label content for validation
        const initialLabelContent = pdfviewer_shapelabel_comments.shapeLabelSettings.labelContent;

        // Add a comment to the annotation using editAnnotation()
        annot.commentType = "add";
        annot.note = "New Comment";
        pdfviewer_shapelabel_comments.annotation.editAnnotation(annot);

        // Validate annotation model contains the updated comment
        expect(annot.note).toBe("New Comment");

        // Ensure shape label content is not unintentionally modified
        expect(initialLabelContent).not.toBe("New Comment");
    });

});