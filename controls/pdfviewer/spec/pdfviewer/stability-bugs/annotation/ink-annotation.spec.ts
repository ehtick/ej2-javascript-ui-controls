import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor, changeThicknessViaSlider, openAnnotationToolbar, downloadAndReload } from "../../utils.spec";
import { EMPTY_PDF_B64, INK_SHIFT_B64 } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_Ink', () => {
    let pdfviewer_ink: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_ink' });
        document.body.appendChild(element);
        pdfviewer_ink = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_ink.documentLoad = () => {
            done();
        }
        pdfviewer_ink.appendTo("#pdfviewer_ink");
    });

    afterAll(() => {
        if (pdfviewer_ink) {
            pdfviewer_ink.destroy();
            const el = document.getElementById('pdfviewer_ink');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_ink = null;
        }
    });

    afterEach(() => {
    });

    it("1007499-Add ink annotation without toolbar and switch modes without errors", (done) => {
        let originalToolbar: any;
        try {
            // temporarily remove toolbarModule for this test only
            originalToolbar = (pdfviewer_ink as any).toolbarModule;
            (pdfviewer_ink as any).toolbarModule = undefined;
            expect(pdfviewer_ink.toolbarModule).toBeUndefined();

            // spy on console.error to detect script errors
            const consoleErrorSpy = spyOn(console, 'error');

            // prefer text layer target, fallback to viewer container
            const target = (document.querySelector('#pdfviewer_ink_textLayer_0') as HTMLElement) || (document.getElementById('pdfviewer') as HTMLElement);
            if (!target) { throw new Error('Could not find target element to dispatch mouse events.'); }

            // ensure annotation API available
            if (!pdfviewer_ink || !pdfviewer_ink.annotation || typeof pdfviewer_ink.annotation.setAnnotationMode !== 'function') {
                throw new Error('pdfviewer.annotation.setAnnotationMode not available. Ensure viewer and annotation module are initialized.');
            }

            // set ink annotation mode on the annotation API (ensures ink drawing behavior)
            pdfviewer_ink.annotation.setAnnotationMode('Ink');

            // Simulate adding an ink annotation by dispatching mouse events (more moves for visible stroke)
            const rect = target.getBoundingClientRect();
            const startX = Math.round(rect.left + 60);
            const startY = Math.round(rect.top + 60);
            const mid1X = Math.round(rect.left + 120);
            const mid1Y = Math.round(rect.top + 80);
            const mid2X = Math.round(rect.left + 160);
            const mid2Y = Math.round(rect.top + 100);
            const endX = Math.round(rect.left + 200);
            const endY = Math.round(rect.top + 120);

            mouseDownEvent(target, startX, startY);
            mouseMoveEvent(target, mid1X, mid1Y);
            mouseMoveEvent(target, mid2X, mid2Y);
            mouseMoveEvent(target, endX, endY);
            mouseUpEvent(target, endX, endY);
            mouseDownEvent(target, endX, endY);

            // Switch back to text selection and disable designer mode
            pdfviewer_ink.interactionMode = 'TextSelection';
            pdfviewer_ink.designerMode = false;

            // Allow handlers to process then assert
            try {
                expect(consoleErrorSpy).not.toHaveBeenCalled();
            } finally {
                // restore toolbarModule for other tests
                (pdfviewer_ink as any).toolbarModule = originalToolbar;
            }
            done();
        } catch (e) {
            if (originalToolbar !== undefined) {
                (pdfviewer_ink as any).toolbarModule = originalToolbar;
            }
            done.fail(e);
        }
    });
    it('1009739-ink annotation invisible when opacity = 0', async () => {
        const target = getTarget('#pdfviewer_ink_textLayer_0');
        const rect = target.getBoundingClientRect();
        pdfviewer_ink.annotation.setAnnotationMode('Ink');
        pdfviewer_ink.inkAnnotationSettings.opacity = 0;
        const startX1 = rect.left + 60, startY1 = rect.top + 60;
        const endX1 = rect.left + 200, endY1 = rect.top + 120;
        mouseDownEvent(target, startX1, startY1);
        mouseMoveEvent(target, rect.left + 120, rect.top + 80);
        mouseMoveEvent(target, rect.left + 160, rect.top + 100);
        mouseUpEvent(target, endX1, endY1);
        pdfviewer_ink.annotation.setAnnotationMode('None');
        await waitFor(() => pdfviewer_ink.annotationCollection && pdfviewer_ink.annotationCollection.length > 0)
        const annotations = pdfviewer_ink.annotationCollection[pdfviewer_ink.annotationCollection.length - 1];
        expect(annotations.opacity).toBe(0);
        //Reset the opacity value to default
        pdfviewer_ink.inkAnnotationSettings.opacity = 1;
    });

    it('EJ2-1023123-New-Ink-Uses-Current-Tool-Settings-When-Adding', (done) => {
        try {
            const target = getTarget('#pdfviewer_ink_textLayer_0');
            const rect = target.getBoundingClientRect();
            const inkButton = document.getElementById('pdfviewer_ink_annotation_ink') as HTMLElement;
            // Step 1: open annotation toolbar and select ink tool
            openAnnotationToolbar('pdfviewer_ink');
            inkButton.click();

            // Step 2: store original thickness
            const originalThickness = pdfviewer_ink.inkAnnotationSettings.thickness;

            // Step 3: open thickness slider and change thickness (first change)
            changeThicknessViaSlider('pdfviewer_ink', 80);

            // Step 4: ensure inkAnnotationSettings.thickness is modified
            const firstSetting = pdfviewer_ink.inkAnnotationSettings.thickness;
            expect(firstSetting).not.toBe(originalThickness);

            // Step 5: add ink annotation (should use firstSetting)
            const startX = rect.left + 60, startY = rect.top + 60;
            const endX = rect.left + 200, endY = rect.top + 120;
            mouseDownEvent(target, startX, startY);
            mouseMoveEvent(target, rect.left + 120, rect.top + 80);
            mouseMoveEvent(target, rect.left + 160, rect.top + 100);
            mouseUpEvent(target, endX, endY);
            pdfviewer_ink.annotation.setAnnotationMode('None');
            const beforeThickness = pdfviewer_ink.annotationCollection[pdfviewer_ink.annotationCollection.length - 1].thickness;
            expect(beforeThickness).toBe(firstSetting);

            // Step 6: open thickness slider and change thickness (second change)
            changeThicknessViaSlider('pdfviewer_ink', 120);
            const afterThickness = pdfviewer_ink.annotationCollection[pdfviewer_ink.annotationCollection.length - 1].thickness;
            expect(afterThickness).not.toEqual(beforeThickness);
            // Step 7: select ink tool and add new ink annotation
            inkButton.click();
            const startX2 = rect.left + 300, startY2 = rect.top + 60;
            const endX2 = rect.left + 400, endY2 = rect.top + 120;
            mouseDownEvent(target, startX2, startY2);
            mouseMoveEvent(target, rect.left + 350, rect.top + 80);
            mouseMoveEvent(target, rect.left + 380, rect.top + 100);
            mouseUpEvent(target, endX2, endY2);
            pdfviewer_ink.annotation.setAnnotationMode('None');
            
            // Step 8: validate last added ink annotation thickness equals current tool setting
            const lastAnnotation = pdfviewer_ink.annotationCollection[pdfviewer_ink.annotationCollection.length - 1];
            expect(lastAnnotation.thickness).toBe(firstSetting);
            pdfviewer_ink.inkAnnotationSettings.thickness = 1;
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    it('EJ2-1023123-New-Ink-Uses-Tool-Default-Not-Selection-Modified-Value', (done) => {
        try {
            // Reset to known default state
            const originalDefaultThickness = pdfviewer_ink.inkAnnotationSettings.thickness;
            const inkButton = document.getElementById('pdfviewer_ink_annotation_ink') as HTMLElement;
            // Step 1: Draw first ink annotation
            const target = getTarget('#pdfviewer_ink_textLayer_0');
            const rect = target.getBoundingClientRect();
            inkButton.click();

            const startX = rect.left + 60, startY = rect.top + 60;
            const endX = rect.left + 200, endY = rect.top + 120;
            mouseDownEvent(target, startX, startY);
            mouseMoveEvent(target, rect.left + 120, rect.top + 80);
            mouseMoveEvent(target, rect.left + 160, rect.top + 100);
            mouseUpEvent(target, endX, endY);
            pdfviewer_ink.annotation.setAnnotationMode('None');

            // Step 2: Select and modify thickness
            expect(pdfviewer_ink.selectedItems.annotations.length).toBe(1);

            changeThicknessViaSlider('pdfviewer_ink', -100);

            // Step : Draw a NEW ink annotation (should use original default, not the modified value)
            const annotationCountBefore = pdfviewer_ink.annotationCollection.length;
            inkButton.click();

            const startX2 = rect.left + 300, startY2 = rect.top + 60;
            const endX2 = rect.left + 400, endY2 = rect.top + 120;
            mouseDownEvent(target, startX2, startY2);
            mouseMoveEvent(target, rect.left + 350, rect.top + 80);
            mouseMoveEvent(target, rect.left + 380, rect.top + 100);
            mouseUpEvent(target, endX2, endY2);
            pdfviewer_ink.annotation.setAnnotationMode('None');

            // Step 5: Wait for new annotation and verify it uses original default thickness
            expect(pdfviewer_ink.annotationCollection.length).toBeGreaterThan(annotationCountBefore);
            const secondInkAnnotation = pdfviewer_ink.annotationCollection[pdfviewer_ink.annotationCollection.length - 1];

            // **CRITICAL BUG TEST** - New ink should use original default (1)
            expect(secondInkAnnotation.thickness).toBe(originalDefaultThickness);
            done();
        } catch (e) {
            done.fail(e);
        }
    });

});

describe('PDF_Viewer_Ink_Position_Shift', () => {
    let pdfviewer_ink_position_shift: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_ink_position_shift' });
        document.body.appendChild(element);
        pdfviewer_ink_position_shift = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + INK_SHIFT_B64
        });
        pdfviewer_ink_position_shift.documentLoad = () => {
            done();
        }
        pdfviewer_ink_position_shift.appendTo("#pdfviewer_ink_position_shift");
    });

    afterAll(() => {
        if (pdfviewer_ink_position_shift) {
            pdfviewer_ink_position_shift.destroy();
            const el = document.getElementById('pdfviewer_ink_position_shift');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_ink_position_shift = null;
        }
    });

    it('Ink Annotation Bounds Preserved Across Opacity Edits and Reload', async () => {
        expect(pdfviewer_ink_position_shift.annotationCollection.length).toBe(1);
        const annotation = pdfviewer_ink_position_shift.annotationCollection[0];
        const boundsBefore = annotation.bounds;
        pdfviewer_ink_position_shift.annotation.selectAnnotation(annotation.annotationId);
        openAnnotationToolbar('pdfviewer_ink_position_shift');
        annotation.opacity = 0.5;
        pdfviewer_ink_position_shift.annotation.editAnnotation(annotation);
        await downloadAndReload(pdfviewer_ink_position_shift);
        const reloadedAnnot = pdfviewer_ink_position_shift.annotationCollection[0];
        const boundsAfter = reloadedAnnot.bounds;
        expect(boundsAfter.x).toBe(boundsBefore.x);
        expect(boundsAfter.y).toBe(boundsBefore.y);
        expect(boundsAfter.width).toBe(boundsBefore.width);
        expect(boundsAfter.height).toBe(boundsBefore.height);
    });
});

