import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from "../../utils.spec";
import { FAIL_PDF_B64, OLD_PDFVIEWER_JSON } from "../../Data/pdf-data.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_findText', () => {
    let pdfviewer_findText: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_findText' });
        document.body.appendChild(element);
        pdfviewer_findText = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + FAIL_PDF_B64
        });
        pdfviewer_findText.documentLoad = () => {
            done();
        }
        pdfviewer_findText.appendTo("#pdfviewer_findText");
    });

    afterAll(() => {
        if (pdfviewer_findText) {
            pdfviewer_findText.destroy();
            const el = document.getElementById('pdfviewer_findText');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_findText = null;
        }
    });

    afterEach(() => {
    });

    it('1015569 - Search using findText API for the word sign', async () => {
        try {
            // Wait for the PDF text layer to finish rendering
            await waitFor(() => {
                const el = document.querySelector('#pdfviewer_findText_textLayer_0');
                return el && el.textContent.trim().length > 0;
            });

            await waitFor(() => {
                const m = pdfviewer_findText.viewerBase.documentTextCollection;
                return m.length >= 2;
            });
            const results = pdfviewer_findText.textSearchModule.findText('sign', false, null);
            const values = JSON.stringify(results);
            const value = JSON.parse(values);
            expect(value[0].bounds[0].x).toBe(321.22468535156247);
            expect(value[0].bounds[0].y).toBe(279.89355136718757);

        } catch (e) {
            fail(e);
        }
    });

    it('1015569 - Search using findText API for the word contract', async () => {
        try {
            await waitFor(() => {
                const el = document.querySelector('#pdfviewer_findText_textLayer_0');
                return el && el.textContent.trim().length > 0;
            });

            await waitFor(() => {
                const m = pdfviewer_findText.viewerBase.documentTextCollection;
                return m.length >= 2;
            });
            const results = pdfviewer_findText.textSearchModule.findText('contract', false, null);
            const values = JSON.stringify(results);
            const value = JSON.parse(values);
            expect(value[0].bounds[0].x).toBe(209.51264921875003);
            expect(value[0].bounds[0].y).toBe(183.9886441406251);

            expect(value[0].bounds[1].x).toBe(183.75465361328128);
            expect(value[0].bounds[1].y).toBe(207.9886441406251);

            expect(value[0].bounds[2].x).toBe(122.99067656249998);
            expect(value[0].bounds[2].y).toBe(231.9886441406251);

            expect(value[0].bounds[3].x).toBe(180.80967680664065);
            expect(value[0].bounds[3].y).toBe(243.9886441406251);

        } catch (e) {
            fail(e);
        }
    });

})