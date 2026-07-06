import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { assertGeometryChanged, deleteAllAnnotationsHelper, exportAnnotationsHelper, getTarget, importAnnotationsHelper, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor, focusOutOnceWithoutNative } from "../../utils.spec";
import { DOC_WITH_FREETEXT, EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

describe('PDF_Viewer_Freetext', () => {
    let pdfviewer_freetext_bounds: PdfViewer = null;

    // Inject required PdfViewer modules
    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    // Setup PdfViewer instance before running tests
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_freetext_bounds' });
        document.body.appendChild(element);
        pdfviewer_freetext_bounds = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_freetext_bounds.documentLoad = () => done();
        pdfviewer_freetext_bounds.appendTo('#pdfviewer_freetext_bounds');
    });

    // Cleanup PdfViewer instance after all tests complete
    afterAll(() => {
        if (pdfviewer_freetext_bounds) {
            pdfviewer_freetext_bounds.destroy();
            const el = document.getElementById('pdfviewer_freetext_bounds');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_freetext_bounds = null;
        }
    });

    it('1015701- Free text bounds are incorrect during export after updating the bounds using the editAnnotation method and persist through export/import', async () => {
        try {
            const target = getTarget('#pdfviewer_freetext_bounds_textLayer_0');
            const rect = target.getBoundingClientRect();
            pdfviewer_freetext_bounds.annotation.setAnnotationMode('FreeText');
            const annotationAdded = new Promise<void>((resolve) => {
                pdfviewer_freetext_bounds!.annotationAdd = () => resolve();
            });
            const x = Math.round(rect.left + rect.width / 2);
            const y = Math.round(rect.top + rect.height / 2);
            mouseMoveEvent(target, x, y);
            mouseDownEvent(target, x, y);
            mouseUpEvent(target, x, y);
            const inputBox: HTMLElement = document.querySelector('.free-text-input') as HTMLElement;
            focusOutOnceWithoutNative(inputBox);
            // Wait for annotationAdd event
            await annotationAdded;
            await waitFor(() => pdfviewer_freetext_bounds.annotationCollection && pdfviewer_freetext_bounds.annotationCollection.length > 0);

            const annotation = pdfviewer_freetext_bounds.annotationCollection[pdfviewer_freetext_bounds.annotationCollection.length - 1] as any;

            // Capture initial geometry
            const initialBounds = JSON.parse(JSON.stringify(annotation.bounds));

            // Update bounds using editAnnotation API
            annotation.bounds.x += 100;
            annotation.bounds.y += 100;
            annotation.bounds.width += 50;
            pdfviewer_freetext_bounds.annotation.editAnnotation(annotation);

            await waitFor(() => pdfviewer_freetext_bounds.annotationCollection && pdfviewer_freetext_bounds.annotationCollection.length > 0);
            const resizedAnnotation = pdfviewer_freetext_bounds.annotationCollection[pdfviewer_freetext_bounds.annotationCollection.length - 1] as any;

            // Validate geometry changes
            assertGeometryChanged(initialBounds, resizedAnnotation.bounds, 'bounds');

            const exportedData = await exportAnnotationsHelper(pdfviewer_freetext_bounds);

            // Delete and re-import annotations
            deleteAllAnnotationsHelper(pdfviewer_freetext_bounds);
            await waitFor(() => pdfviewer_freetext_bounds.annotationCollection.length === 0);

            importAnnotationsHelper(pdfviewer_freetext_bounds, exportedData);
            await waitFor(() => pdfviewer_freetext_bounds.annotationCollection.length > 0);

            const importedAnnotation = pdfviewer_freetext_bounds.annotationCollection[0] as any;

            // Validate imported geometry matches resized geometry
            expect(Math.round(importedAnnotation.bounds.x)).toBe(Math.round(resizedAnnotation.bounds.x));
            expect(Math.round(importedAnnotation.bounds.y)).toBe(Math.round(resizedAnnotation.bounds.y));
            expect(Math.round(importedAnnotation.bounds.width)).toBe(Math.round(resizedAnnotation.bounds.width));
            expect(Math.round(importedAnnotation.bounds.height)).toBe(Math.round(resizedAnnotation.bounds.height));
            expect(Math.round(importedAnnotation.bounds.left)).toBe(Math.round(resizedAnnotation.bounds.left));
            expect(Math.round(importedAnnotation.bounds.top)).toBe(Math.round(resizedAnnotation.bounds.top));

            deleteAllAnnotationsHelper(pdfviewer_freetext_bounds);
        } catch (e) {
            fail(e as Error);
        }
    });


});

describe('PDF_Viewer_Freetext_Alignment', () => {
    let pdfviewer_freetext_align: PdfViewer = null;

    // Inject required PdfViewer modules
    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    // Setup PdfViewer instance before running tests
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_freetext_align' });
        document.body.appendChild(element);
        pdfviewer_freetext_align = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + DOC_WITH_FREETEXT
        });
        pdfviewer_freetext_align.documentLoad = () => {
            var col = pdfviewer_freetext_align.annotationCollection[0];
            col.annotationSettings.isLock = true;
            pdfviewer_freetext_align.annotation.editAnnotation(col);
            done();
        }
        pdfviewer_freetext_align.appendTo('#pdfviewer_freetext_align');
    });

    // Cleanup PdfViewer instance after all tests complete
    afterAll(() => {
        if (pdfviewer_freetext_align) {
            pdfviewer_freetext_align.destroy();
            const el = document.getElementById('pdfviewer_freetext_align');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_freetext_align = null;
        }
    });

    it('1025526 - Freetext alignment after loading the document', (done) => {
        const target = getTarget('#pdfviewer_freetext_align_textLayer_0');
        var alignment = (pdfviewer_freetext_align.nameTable as any)['freetext0'].wrapper.children[1].horizontalAlignment;
        expect(alignment).toBe('Right');
        done(); 
    });


});