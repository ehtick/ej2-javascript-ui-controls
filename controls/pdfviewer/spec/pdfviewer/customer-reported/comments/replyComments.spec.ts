import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";


describe('PDF_Viewer_ReplyComments', () => {
    let pdfviewer_replyComments: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        // Create host element and mount viewer with an empty (base64) PDF
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_replyComments' });
        document.body.appendChild(element);
        pdfviewer_replyComments = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        // Wait for initial document load before starting tests
        pdfviewer_replyComments.documentLoad = () => {
            done();
        }
        // Attach viewer to DOM
        pdfviewer_replyComments.appendTo("#pdfviewer_replyComments");
    });

    afterAll(() => {
        // Clean up viewer instance and DOM to prevent test bleed-over
        if (pdfviewer_replyComments) {
            pdfviewer_replyComments.destroy();
            const el = document.getElementById('pdfviewer_replyComments');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_replyComments = null;
        }
    });

    afterEach(() => {
        // No per-test teardown required
    });


    /**
     * Task ID: 1011169
     * Title: 1011169 - Sticky Note: programmatic main comment + 2 replies → lock → nameTable validates
     * Creates a Sticky Note, adds one main comment and two replies via API, locks the annotation and comments,
     * then validates the corresponding entry in viewer.nameTable using object-key scan.
     */
    it('1011169 - Sticky Note: programmatic main comment + 2 replies → lock → nameTable validates', (done) => {
        let btn: HTMLElement;
        let replyBtn: HTMLElement;
        let replyBtn2: HTMLElement;
        let replyBtn3: HTMLElement;
        let settingBtn: HTMLElement;
        try {
            let annotName: string | null = null;
            // Create a temporary button to trigger programmatic main comment add
            btn = document.createElement('button');
            btn.id = 'test-view-button_0';
            btn.textContent = 'View';
            document.body.appendChild(btn);
            btn.addEventListener('click', () => {
                // 3) Grab the newly created annotation and add main comment via API
                const annot = pdfviewer_replyComments.annotationCollection[pdfviewer_replyComments.annotationCollection.length - 1];
                annotName = annot.annotationId;
                if (annot) {
                    annot.commentType = 'add';
                    annot.note = 'API Main Comment';
                    pdfviewer_replyComments.annotation.editAnnotation(annot);
                }

            });
            // Add first reply via a temporary button click (API-driven)
            replyBtn = document.createElement('button');
            replyBtn.id = 'test-view-button_1';
            replyBtn.textContent = 'View';
            document.body.appendChild(replyBtn);
            replyBtn.addEventListener('click', () => {
                const annot = pdfviewer_replyComments.annotationCollection[pdfviewer_replyComments.annotationCollection.length - 1];
                // 5) Add first reply programmatically
                annot.commentType = 'add';
                annot.replyComment = ['API Reply 1'];
                pdfviewer_replyComments.annotation.editAnnotation(annot);
            });


            // Add second reply via a temporary button click (API-driven)
            replyBtn2 = document.createElement('button');
            replyBtn2.id = 'test-view-button_2';
            replyBtn2.textContent = 'View';
            document.body.appendChild(replyBtn2);
            replyBtn2.addEventListener('click', () => {
                const annot = pdfviewer_replyComments.annotationCollection[pdfviewer_replyComments.annotationCollection.length - 1];
                // 6) Add second reply programmatically
                annot.commentType = 'add';
                annot.replyComment = ['API Reply 2'];
                pdfviewer_replyComments.annotation.editAnnotation(annot);
            });


            // Add third reply via a temporary button click (API-driven)
            replyBtn3 = document.createElement('button');
            replyBtn3.id = 'test-view-button_3';
            replyBtn3.textContent = 'View';
            document.body.appendChild(replyBtn3);
            replyBtn3.addEventListener('click', () => {
                const annot = pdfviewer_replyComments.annotationCollection[pdfviewer_replyComments.annotationCollection.length - 1];
                // 7) Add third reply programmatically
                annot.commentType = 'add';
                annot.replyComment = ['API Reply 3'];
                pdfviewer_replyComments.annotation.editAnnotation(annot);
            });

            // Prepare to lock the annotation and its comments
            settingBtn = document.createElement('button');
            settingBtn.id = 'test-view-button_4';
            settingBtn.textContent = 'View';
            document.body.appendChild(settingBtn);
            settingBtn.addEventListener('click', () => {
                const annotCollection = pdfviewer_replyComments.annotationCollection[pdfviewer_replyComments.annotationCollection.length - 1];
                // 8) Lock annotation and all comments/replies
                annotCollection.annotationSettings = annotCollection.annotationSettings || {};
                annotCollection.annotationSettings.isLock = true;
                (annotCollection as any).isCommentLock = true;
                pdfviewer_replyComments.annotation.editAnnotation(annotCollection);
            });
            pdfviewer_replyComments.annotationAdd = function () {
                expect(pdfviewer_replyComments.annotationCollection.length).toBeGreaterThan(0);
                btn.click();
                replyBtn.click();
                replyBtn2.click();
                replyBtn3.click();
                settingBtn.click();
                // Validate that nameTable contains an entry for this annotation with at least 3 comments
                const nameEntry = getAnnotationFromNameTable(annotName);
                expect(nameEntry).toBeTruthy();
                expect(nameEntry.annotName).toBe(annotName);
                expect(Array.isArray(nameEntry.comments)).toBe(true);
                expect(nameEntry.comments.length).toBeGreaterThanOrEqual(3);
                // Signal test completion
                done();
            };

            // 1) Enable Sticky Notes annotation mode
            pdfviewer_replyComments.annotation.setAnnotationMode('StickyNotes');

            // 2) Create a Sticky Note using mouse events at a fixed offset on page 0
            const target: HTMLElement =
                (document.querySelector('#pdfviewer_replyComments_textLayer_0') as HTMLElement);

            const rect = target.getBoundingClientRect();
            const x = Math.round(rect.left + 140);
            const y = Math.round(rect.top + 140);

            mouseDownEvent(target, x, y);
            mouseUpEvent(target, x, y);

            // Helper function to scan viewer.nameTable for the current annotation by its annotName
            const getAnnotationFromNameTable = (annotationName: string): any => {
                if (!annotationName) return null;
                const table: any = (pdfviewer_replyComments as any).nameTable;
                if (!table) return null;

                const keys: string[] = Object.keys(table);
                for (let i: number = 0; i < keys.length; i++) {
                    const obj: any = table[keys[parseInt(i.toString(), 10)]];
                    if (obj && obj.annotName === annotationName) {
                        return obj;
                    }
                }
                return null;
            };
        } catch (err) {
            // Surface any unexpected error to Jasmine
            done.fail(err as any);
        } finally {
            // Remove all temporary buttons created for this test
            if (btn.parentNode) {
                btn.parentNode.removeChild(btn);
            }
            if (replyBtn.parentNode) {
                replyBtn.parentNode.removeChild(replyBtn);
            }
            if (replyBtn2.parentNode) {
                replyBtn2.parentNode.removeChild(replyBtn2);
            }
            if (replyBtn3.parentNode) {
                replyBtn3.parentNode.removeChild(replyBtn3);
            }
            if (settingBtn.parentNode) {
                settingBtn.parentNode.removeChild(settingBtn);
            }
        }
    });


});