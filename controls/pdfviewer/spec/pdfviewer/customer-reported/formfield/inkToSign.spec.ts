import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, PageOrganizer, FormDesigner
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from "../../utils.spec";
import { INK_TO_SIGN } from "../../Data/pdf-data.spec";


/**
* PdfViewer spec
*/
describe('PDF_Viewer_InkToSign', () => {
    let pdfviewer_inkToSign: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, PageOrganizer, FormDesigner);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_inkToSign' });
        document.body.appendChild(element);
        pdfviewer_inkToSign = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + INK_TO_SIGN,
            enableFormDesigner: false
        });
        pdfviewer_inkToSign.documentLoad = () => {
            
            done();
        }
        pdfviewer_inkToSign.appendTo("#pdfviewer_inkToSign");
    });

    afterAll(() => {
        if (pdfviewer_inkToSign) {
            pdfviewer_inkToSign.destroy();
            const el = document.getElementById('pdfviewer_inkToSign');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_inkToSign = null;
        }
    });

    afterEach(() => {
    });
    
    it('1006967 - Ink to sign Download Reload', async (done) => {
        const blob = await pdfviewer_inkToSign.saveAsBlob();
        const reloadPromise = new Promise<void>((resolve) => {
            pdfviewer_inkToSign.documentLoad = () => resolve();
        });
        const reader = new FileReader();
        reader.onload = () => pdfviewer_inkToSign.load(reader.result as string, null);
        reader.readAsDataURL(blob);
        await reloadPromise;

        const field = pdfviewer_inkToSign.retrieveFormFields();
        expect(field[0].value).not.toBe(" ");
        done();
    })
})