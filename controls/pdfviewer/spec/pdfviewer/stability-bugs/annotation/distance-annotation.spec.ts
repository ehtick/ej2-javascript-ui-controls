import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer, DynamicStampItem, AnnotationDataFormat } from '../../../../src/index';
import { getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from '../../utils.spec';
import { DISTANCE_JSON, EMPTY_PDF_B64 } from '../../Data/pdf-data.spec';

describe('Distance-Annotation', () => {
    let pdfviewer_distance: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
        BookmarkView, TextSelection, TextSearch, Print, Annotation,
        FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_distance' });
        document.body.appendChild(element);
        pdfviewer_distance = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_distance.documentLoad = () => done();
        pdfviewer_distance.appendTo('#pdfviewer_distance');
    });

    afterAll(() => {
        if (pdfviewer_distance) {
            pdfviewer_distance.destroy();
            const el = document.getElementById('pdfviewer_distance');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_distance = null;
        }
    });

    it('1013443 - Import distance aannotation with fillcolor and stroke color', async function (done) {
        const jsonObj = DISTANCE_JSON;

        let imported = false;
        if (typeof pdfviewer_distance.importAnnotation === 'function') {
            pdfviewer_distance.importAnnotation(jsonObj, AnnotationDataFormat.Json);
            imported = true;
        }
        if (!imported) {
            fail('No import API available for object JSON');
            done();
            return;
        }
        waitFor(() => !!pdfviewer_distance.annotationCollection && pdfviewer_distance.annotationCollection.length > 0);
        let annot = pdfviewer_distance.annotationCollection[0];
        expect(typeof annot.leaderLineOffset).toBe('number');
        done();
    });

    it("1021263 - Distance annotation is created successfully when a vertex Y position is set to 0.", async (done: DoneFn) => {
		try {
			// Create a temporary button to trigger distance annotation creation
			const addAnnotationBtn = document.createElement("button");
			addAnnotationBtn.id = "test-view-button_1";
			addAnnotationBtn.textContent = "View";
			document.body.appendChild(addAnnotationBtn);
			// Add click event listener to programmatically add a distance annotation
			addAnnotationBtn.addEventListener("click", () => {
				(pdfviewer_distance as any).annotation.addAnnotation('Distance', {
					offset: { x: 0, y: 230 },
					pageNumber: 1,
					vertexPoints: [{ x: 200, y: 0 }, { x: 350, y: 230 }]
				});
			});
			// Trigger the button click to add the rectangle annotation
			addAnnotationBtn.click();
			waitFor(() => pdfviewer_distance.annotationCollection && pdfviewer_distance.annotationCollection.length > 0);
			// Get the most recently added distance annotation from the collection
			const distanceAnnotation = pdfviewer_distance.annotationCollection[pdfviewer_distance.annotationCollection.length - 1] as any;
			// Verify that the first vertex point's Y position is correctly set to 0
			expect(distanceAnnotation.vertexPoints[0].y).toBe(0);
			// Remove the temporary button created for this test
			if (addAnnotationBtn.parentNode) {
				addAnnotationBtn.parentNode.removeChild(addAnnotationBtn);
			}
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});
})