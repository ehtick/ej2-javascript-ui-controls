import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
// import { mouseDownEvent, mouseMoveEvent, mouseUpEvent } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";
import { mouseMoveEvent, mouseDownEvent, mouseUpEvent, mouseClickEvent, waitFor, focusOutOnceWithoutNative } from "../../utils.spec";


describe('PDF_Viewer_Signature_Undo_Redo', () => {
    let pdfviewer_signature_undo_redo: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_signature_undo_redo' });
        document.body.appendChild(element);
        pdfviewer_signature_undo_redo = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_signature_undo_redo.documentLoad = () => {
            done();
        }
        pdfviewer_signature_undo_redo.appendTo("#pdfviewer_signature_undo_redo");
    });

    afterAll(() => {
        if (pdfviewer_signature_undo_redo) {
            pdfviewer_signature_undo_redo.destroy();
            const el = document.getElementById('pdfviewer_signature_undo_redo');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_signature_undo_redo = null;
        }
    });

    afterEach(() => {
    });
    it("1016268-Undo & Redo With Add Signature - Able to Download the Document", async () => {
      try {
        // Open Annotations panel
        const annotationBtn = document.querySelector(
          "#pdfviewer_signature_undo_redo_annotation",
        ) as HTMLElement | null;
        mouseClickEvent(annotationBtn);
        // Open Signature tool and choose "Draw
        const annotationSignature = document.querySelector(
          "#pdfviewer_signature_undo_redo_annotation_signature",
        ) as HTMLElement | null;
        mouseClickEvent(annotationSignature);
        const signatureField = document.querySelector(
          "#pdfviewer_signature_undo_redo_annotation_signature-popup",
        ).children[0].children[0].children[0] as HTMLElement | null;
        mouseClickEvent(signatureField);
        const signatureCanvas = document.querySelector(
          "#pdfviewer_signature_undo_redo_signatureCanvas_",
        );
        const signatureCanvasTarget = signatureCanvas.getBoundingClientRect();
        const p1 = {
          x: signatureCanvasTarget.left + 50,
          y: signatureCanvasTarget.top + 50,
        };
        const p2 = {
          x: signatureCanvasTarget.left + 100,
          y: signatureCanvasTarget.top + 100,
        }; 
        const p3 = {
          x: signatureCanvasTarget.left + 150,
          y: signatureCanvasTarget.top + 150,
        }; 
        // Draw a simple signature stroke on the popup canvas
        mouseDownEvent(signatureCanvas, p1.x, p1.y);
        mouseMoveEvent(signatureCanvas, p2.x, p2.y);
        mouseUpEvent(signatureCanvas, p3.x, p3.y);
        var createBtn = document.querySelector("#pdfviewer_signature_undo_redo_signature_window")
          .children[2].children[2] as HTMLElement | null;
        mouseClickEvent(createBtn);
        // Viewer Element
        const target = document.querySelector("#pdfviewer_signature_undo_redo_textLayer_0");
        if (!target) throw new Error("Page container not found");
        const rect = target.getBoundingClientRect();
        var clientX = rect.left + 50;
        var clientY = rect.top + 50;
        // To place the signature
        mouseDownEvent(target, clientX, clientY);
        mouseMoveEvent(target, clientX + 20, clientY + 20);
        mouseMoveEvent(target, clientX + 22, clientY + 22);
        mouseMoveEvent(target, clientX + 24, clientY + 24);
        mouseDownEvent(target, clientX + 24, clientY + 24);
        mouseUpEvent(target, clientX + 24, clientY + 24);
        // Draw a rectangle on the viewer element
        pdfviewer_signature_undo_redo.annotation.setAnnotationMode(
          "Rectangle",
        );
        const sx = Math.round(rect.left + 260);
        const sy = Math.round(rect.top + 80);
        const ex = Math.round(rect.left + 360);
        const ey = Math.round(rect.top + 140);
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        // interpolate a few moves to mimic drag
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = Math.round(sx + (ex - sx) * t);
          const y = Math.round(sy + (ey - sy) * t);
          mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
        // Wait until the first annotation
        await waitFor(
          () =>
            pdfviewer_signature_undo_redo.annotationCollection &&
            pdfviewer_signature_undo_redo.annotationCollection.length >
              0,
        );
        // Draw a circle on the viewer element
        pdfviewer_signature_undo_redo.annotation.setAnnotationMode(
          "Circle",
        );
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        for (let i = 10; i <= steps; i++) {
          const t = i / steps;
          const x = Math.round(sx + (ex - sx) * t);
          const y = Math.round(sy + (ey - sy) * t);
          mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
        // Wait until the second annotation
        await waitFor(
          () =>
            pdfviewer_signature_undo_redo.annotationCollection &&
            pdfviewer_signature_undo_redo.annotationCollection.length >
              1,
        );
        // Open FreeText tool and place a FreeText on the viewer element
        const freeTextBtn = document.querySelector(
          "#pdfviewer_signature_undo_redo_annotation_freeTextEditIcon",
        ) as HTMLElement | null;
        mouseClickEvent(freeTextBtn);
        mouseMoveEvent(target, clientX + 300, clientY + 100);
        mouseMoveEvent(target, clientX + 310, clientY + 110);
        mouseMoveEvent(target, clientX + 320, clientY + 120);
        mouseDownEvent(target, clientX + 320, clientY + 120);
        mouseUpEvent(target, clientX + 320, clientY + 120);
        const inputBox: HTMLElement = document.querySelector('.free-text-input') as HTMLElement;
        focusOutOnceWithoutNative(inputBox);
        // Perform multiple Undo actions (remove recently added items)
        const undoIcon = document.querySelector(
          "#pdfviewer_signature_undo_redo_undoIcon",
        ) as HTMLElement | null;
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        // Perform multiple Redo actions (re-add the items)
        const redoIcon = document.querySelector(
          "#pdfviewer_signature_undo_redo_redoIcon",
        ) as HTMLElement | null;
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        // Wait until the FreeText store is populated again
        await waitFor(
          () =>
            pdfviewer_signature_undo_redo.annotationsCollection.get(
              (pdfviewer_signature_undo_redo.annotation as any)
                .pdfViewerBase.documentId + "_annotations_freetext",
            )[0].annotations[0],
        );
        // FreeText has exactly 1 item
        expect(
          pdfviewer_signature_undo_redo.annotationsCollection.get(
            (pdfviewer_signature_undo_redo.annotation as any)
              .pdfViewerBase.documentId + "_annotations_freetext",
          )[0].annotations.length,
        ).toBe(1);
        // That item's type is "FreeText"
        expect(
          pdfviewer_signature_undo_redo.annotationsCollection.get(
            (pdfviewer_signature_undo_redo.annotation as any)
              .pdfViewerBase.documentId + "_annotations_freetext",
          )[0].annotations[0].shapeAnnotationType,
        ).toBe("FreeText");
      } catch (e) {
        fail(e as any);
      }
    });
});

describe('PDF_Viewer_Handwritten_signature_settings', () => {
    let pdfviewer_signatureSettings: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_signatureSettings' });
        document.body.appendChild(element);
        pdfviewer_signatureSettings = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_signatureSettings.documentLoad = () => {
            done();
        }
        pdfviewer_signatureSettings.appendTo("#pdfviewer_signatureSettings");
    });

    afterAll(() => {
        if (pdfviewer_signatureSettings) {
            pdfviewer_signatureSettings.destroy();
            const el = document.getElementById('pdfviewer_signatureSettings');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_signatureSettings = null;
        }
    });

    afterEach(() => {
    });

    it('1021463-Handwritten Signature settings without signatureItem', function(done) {
      pdfviewer_signatureSettings.handWrittenSignatureSettings = {
        typeSignatureFonts: ['Allura', 'Tangerine', 'Sacramento', 'Inspiration']
      };
      (document.querySelector('#pdfviewer_signatureSettings_annotation') as any).click();
      (document.querySelector('#pdfviewer_signatureSettings_annotation_signature') as any).click();
      
      const popup = document.getElementById('pdfviewer_signatureSettings_annotation_signature-popup');
      const listItems = popup.querySelectorAll('ul > li');
      expect(listItems.length).toBe(3);
      done();
    })
});