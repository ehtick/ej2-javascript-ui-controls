import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer,
    RectangleSettings
} from "../../../../src/index";
import { getAnnotationBoundsFromDOM, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, rightClickEvent } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

describe('PDF_Viewer_Rectangle_Locked', () => {
    let pdfviewer_rect: PdfViewer = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_rect' });
        document.body.appendChild(element);
        pdfviewer_rect = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_rect.documentLoad = () => done();
        pdfviewer_rect.appendTo('#pdfviewer_rect');
    });

    afterAll(() => {
        if (pdfviewer_rect) {
            pdfviewer_rect.destroy();
            const el = document.getElementById('pdfviewer_rect');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_rect = null;
        }
    });

    it('1009739-Add Rectangle annotation with lock', (done: DoneFn) => {
        try {
            const target = getTarget('#pdfviewer_rect_textLayer_0');
            const annotationSettings = {
                offset: { x: 200, y: 480 },
                pageNumber: 1,
                width: 150,
                height: 75,
                isLock: true
            };
            pdfviewer_rect.annotation.addAnnotation("Rectangle", annotationSettings as RectangleSettings);
            const canvas = document.getElementById('pdfviewer_rect_annotationCanvas_0') as HTMLCanvasElement;

            // Derive the centre of the annotation in canvas pixel coordinates
            const zoomFactor = pdfviewer_rect.viewerBase.getZoomFactor();
            const annotationRect = {
                x: annotationSettings.offset.x * zoomFactor,
                y: annotationSettings.offset.y * zoomFactor,
                width: annotationSettings.width * zoomFactor,
                height: annotationSettings.height * zoomFactor
            };

            // Convert to absolute viewport (clientX/clientY) coordinates
            const domRect = getAnnotationBoundsFromDOM(canvas, annotationRect);
            const annotationCenterX = domRect.left + domRect.width / 2;
            const annotationCenterY = domRect.top + domRect.height / 2;

            // Move the cursor to the centre of the added annotation
            mouseMoveEvent(target, annotationCenterX, annotationCenterY);
            mouseDownEvent(target, annotationCenterX, annotationCenterY);
            mouseUpEvent(target, annotationCenterX, annotationCenterY);
            // Right-click on the annotation to trigger the context menu
            rightClickEvent(target, annotationCenterX, annotationCenterY);

            const redactItem = document.getElementById('pdfviewer_rect_contextmenu_redact');
            expect(redactItem).not.toBeNull();
            expect(redactItem.classList.contains('e-menu-hide')).toBeTruthy(
                'Apply Redactions item should be hidden for a locked annotation'
            );

            done();
        } catch (e) {
            done.fail(e as Error);
        }
    });

});

