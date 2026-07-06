import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_ListBox', () => {
    let pdfviewer_listBox_field: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_listBox_field' });
        document.body.appendChild(element);
        pdfviewer_listBox_field = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_listBox_field.extractTextCompleted = () => {
            done();
        }
        pdfviewer_listBox_field.appendTo("#pdfviewer_listBox_field");
    });

    afterAll(() => {
        if (pdfviewer_listBox_field) {
            pdfviewer_listBox_field.destroy();
            const el = document.getElementById('pdfviewer_listBox_field');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_listBox_field = null;
        }
    });


    it("1016256-Copy ListBox field using page organizer", (done) => {
        try {
            const formDesigner: HTMLButtonElement = document.getElementById('pdfviewer_listBox_field_formdesigner') as HTMLButtonElement;
            formDesigner.click();
            const listBoxButton: HTMLButtonElement = document.getElementById('pdfviewer_listBox_field_formdesigner_listbox') as HTMLButtonElement;
            listBoxButton.click();
            const target = document.getElementById('pdfviewer_listBox_field_textLayer_0') as HTMLElement;
            // Simulate adding a textbox field by dispatching mouse events
            const rect = target.getBoundingClientRect();
            const startX = Math.round(rect.left + 50);
            const startY = Math.round(rect.top + 50);
            const midX = Math.round(rect.left + 150);
            const midY = Math.round(rect.top + 100);
            const endX = Math.round(rect.left + 200);
            const endY = Math.round(rect.top + 120);

            mouseDownEvent(target, startX, startY);
            mouseMoveEvent(target, midX, midY);
            mouseMoveEvent(target, endX, endY);
            mouseUpEvent(target, endX, endY);

            const pageOrganizer: HTMLButtonElement = document.getElementById('pdfviewer_listBox_field_organize-view') as HTMLButtonElement;
            pageOrganizer.click();

            const tileElement: HTMLElement = document.getElementById('pdfviewer_listBox_field_organize_page_0') as HTMLElement;
            const tileRect = tileElement.getBoundingClientRect();

            mouseMoveEvent(tileElement, tileRect.left / 2, tileRect.top / 2);
            const copyButton: HTMLButtonElement = document.getElementById('pdfviewer_listBox_field_copy_page_0') as HTMLButtonElement;
            copyButton.click();

            pdfviewer_listBox_field.extractTextCompleted = function () {
                expect(pdfviewer_listBox_field.formFieldCollection.length).toBe(2);
                expect(pdfviewer_listBox_field.formFieldCollection[0].name).toEqual(pdfviewer_listBox_field.formFieldCollection[1].name);
                done();
            }

            const saveButton: HTMLButtonElement = Array.from(document.querySelectorAll<HTMLButtonElement>(
                    '#pdfviewer_listBox_field_organize_window .e-footer-content button.e-primary')
            ).find(btn => btn.textContent.trim() === 'Save');
            saveButton.click();
        } catch (e) {
            done.fail(e);
        }
    });
});