import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer,
    DynamicStampItem,
    SignatureFieldSettings,
    RadioButtonFieldSettings
} from "../../../../src/index";
import { mouseMoveEvent, mouseDownEvent, mouseUpEvent, mouseClickEvent, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_AnnotationCommentsStatus', () => {
    let pdfviewer_annotationcommentsstatus: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_annotationcommentsstatus' });
        document.body.appendChild(element);
        pdfviewer_annotationcommentsstatus = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_annotationcommentsstatus.documentLoad = () => {
            done();
        }
        pdfviewer_annotationcommentsstatus.appendTo("#pdfviewer_annotationcommentsstatus");
    });

    afterAll(() => {
        if (pdfviewer_annotationcommentsstatus) {
            pdfviewer_annotationcommentsstatus.destroy();
            const el = document.getElementById('pdfviewer_annotationcommentsstatus');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_annotationcommentsstatus = null;
        }
    });

    afterEach(() => {
    });

    it("1020890 - Comment status alignment becomes correct when performing the redo function.", async (done: DoneFn) => {
      try {
        let annotName: string | null = null;
        const target = document.querySelector('#pdfviewer_annotationcommentsstatus_textLayer_0');
        // Set annotation mode to Stamp (Approved)
        pdfviewer_annotationcommentsstatus.annotation.setAnnotationMode("Stamp", DynamicStampItem.Approved)
        // Get the position of the target element
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        // Simulate mouse actions to place the stamp annotation
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 2, cy + 2);
        mouseDownEvent(target, cx + 2, cy + 2);
        mouseUpEvent(target, cx + 2, cy + 2);
        await waitFor(() => pdfviewer_annotationcommentsstatus.annotationCollection && pdfviewer_annotationcommentsstatus.annotationCollection.length > 0);
        // Create a temporary button to add a main comment programmatically
        const btn = document.createElement('button');
        btn.id = 'test-view-button_0';
        btn.textContent = 'View';
        document.body.appendChild(btn);
        // On button click, add a main comment to the last created annotation
        btn.addEventListener('click', () => {
            // Grab the newly created annotation and add main comment via API
            const annot = pdfviewer_annotationcommentsstatus.annotationCollection[pdfviewer_annotationcommentsstatus.annotationCollection.length - 1];
            annotName = annot.annotationId;
            if (annot) {
                annot.commentType = 'add';
                annot.note = 'API Main Comment';
                pdfviewer_annotationcommentsstatus.annotation.editAnnotation(annot);
            }
        });
        // Trigger the button click to add the main comment
        btn.click();
        (document.querySelector('#pdfviewer_annotationcommentsstatus_annotation') as any).click();
        // Open comment panel
        (document.querySelector('#pdfviewer_annotationcommentsstatus_annotation_commentPanel') as any).click();
        // Wait until the main comment div is rendered
        await waitFor(() => (document.querySelector('#pdfviewer_annotationcommentsstatus_commentdiv_1_0') as any));
        // Select and activate the main comment
        const div: any = document.querySelector('#pdfviewer_annotationcommentsstatus_commentdiv_1_0');
        div.click();
        // Open context menu and set status as Accepted for main comment
        (document.querySelector('#pdfviewer_annotationcommentsstatus_more-options_1_0') as any).click();
        // Wait for context menu to appear
        await waitFor(() => (document.querySelector('#pdfviewer_annotationcommentsstatus_comment_context_menu') as any));
        // Find and hover over "Set Status"
        const ctxMenu = document.querySelector('#pdfviewer_annotationcommentsstatus_comment_context_menu');
        const setStatus = Array.from(ctxMenu.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Set Status');
        setStatus.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        // Wait for the Accepted status submenu
        await waitFor(() => {
            const uls = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'));
            return uls.some(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));
        });
        // Click Accepted status for main comment
        const submenu = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'))
            .find(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));
        Array.from(submenu.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Accepted')
            .click();
        // Create a temporary button to add a reply programmatically
        const replyBtn = document.createElement('button');
        replyBtn.id = 'test-view-button_1';
        replyBtn.textContent = 'View';
        document.body.appendChild(replyBtn);
        // On click, add a reply comment to the annotation
        replyBtn.addEventListener('click', () => {
            const annot = pdfviewer_annotationcommentsstatus.annotationCollection[pdfviewer_annotationcommentsstatus.annotationCollection.length - 1];
            // Add first reply programmatically
            annot.commentType = 'add';
            annot.replyComment = ['API Reply 1'];
            pdfviewer_annotationcommentsstatus.annotation.editAnnotation(annot);
        });
        // Trigger the reply addition
        replyBtn.click();
        // Wait for reply to render
        await waitFor(() => (document.querySelector('#pdfviewer_annotationcommentsstatus_accordioncontent1').children[0].children[1]) as any);
        // Select reply and open context menu
        const div_1: any = document.querySelector('#pdfviewer_annotationcommentsstatus_accordioncontent1').children[0].children[1];
        div_1.click();
        (document.querySelector('#pdfviewer_annotationcommentsstatus_more-options_1_1') as any).click();
        // Wait for reply context menu
        await waitFor(() => (document.querySelector('#pdfviewer_annotationcommentsstatus_comment_context_menu') as any));
        // Set Accepted status for reply
        const ctxMenu_1 = document.querySelector('#pdfviewer_annotationcommentsstatus_comment_context_menu');
        const setStatus_1 = Array.from(ctxMenu_1.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Set Status');
        setStatus_1.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        await waitFor(() => {
            const uls = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'));
            return uls.some(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));
        });
        const submenu_1 = Array.from(document.querySelectorAll('.e-contextmenu-wrapper ul'))
            .find(ul => ul !== ctxMenu &&
                Array.from(ul.querySelectorAll('li')).some(li => li.textContent.trim() === 'Accepted'));
        Array.from(submenu_1.querySelectorAll('li'))
            .find(li => li.textContent.trim() === 'Accepted')
            .click();
        const undoIcon = document.querySelector('#pdfviewer_annotationcommentsstatus_undoIcon') as any;
        const redoIcon = document.querySelector('#pdfviewer_annotationcommentsstatus_redoIcon') as any;
        // Perform multiple Undo actions
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        mouseClickEvent(undoIcon);
        // Perform multiple Redo actions
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        mouseClickEvent(redoIcon);
        // Fetch the comment status container after redo
        const statusContainer = document.querySelector('#' + 'pdfviewer_annotationcommentsstatus' + 'status_container') as HTMLElement | null;
        // Verify the margin-left is correctly applied for parent comment
        expect(statusContainer.style.marginLeft).toBe('22px');
        done();
      } catch (e) {
        done.fail(e as Error);
      }
    });
});