import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer, IRectangle, AjaxRequestFailureEventArgs, AnnotationDataFormat, AjaxRequestSuccessEventArgs, ImportFailureEventArgs, ExportFailureEventArgs, ExportSuccessEventArgs, ExtractTextCompletedEventArgs } from '../../../../src/index';
import { deleteAllAnnotationsHelper, focusOutOnceWithoutNative, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from '../../utils.spec';
import { HELLO_PDF_B64 } from '../../Data/pdf-data.spec';

describe('PDF_Viewer_TextMarkup_Highlight_Opacity_Zero', () => {
    let pdfviewer_textmarkup_highlight: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_textmarkup_highlight' });
        document.body.appendChild(element);
        pdfviewer_textmarkup_highlight = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + HELLO_PDF_B64
        });
        pdfviewer_textmarkup_highlight.documentLoad = () => done();
        pdfviewer_textmarkup_highlight.appendTo('#pdfviewer_textmarkup_highlight');
    });

    afterAll(() => {
        if (pdfviewer_textmarkup_highlight) {
            pdfviewer_textmarkup_highlight.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_textmarkup_highlight');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_textmarkup_highlight = null;
        }
    });
    
    it('1009739-Highlight annotation invisible when opacity=0', (done) => {
        try {
            pdfviewer_textmarkup_highlight.highlightSettings.opacity = 0;
            pdfviewer_textmarkup_highlight.annotationAdd = function () {
                expect(pdfviewer_textmarkup_highlight.annotationCollection.length).toBeGreaterThan(0);
                const annotations = pdfviewer_textmarkup_highlight.annotationCollection[pdfviewer_textmarkup_highlight.annotationCollection.length - 1];
                expect(annotations).toBeDefined();
                expect(annotations.opacity).toBe(0);
                done();
            };            
            const startingElement = document.getElementById('pdfviewer_textmarkup_highlight_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_highlight_text_0_4');
            const range = document.createRange();

            // Select the contents of the starting element
            range.selectNodeContents(startingElement);

            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);

            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_highlight.annotationModule.setAnnotationMode('Highlight');
        } catch (e) {
            done.fail(e);
        }
    });
});

describe('PDF_Viewer_TextMarkup_Underline_Opacity_Zero', () => {
    let pdfviewer_textmarkup_underline: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_textmarkup_underline' });
        document.body.appendChild(element);
        pdfviewer_textmarkup_underline = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + HELLO_PDF_B64
        });
        pdfviewer_textmarkup_underline.documentLoad = () => done();
        pdfviewer_textmarkup_underline.appendTo('#pdfviewer_textmarkup_underline');
    });

    afterAll(() => {
        if (pdfviewer_textmarkup_underline) {
            pdfviewer_textmarkup_underline.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_textmarkup_underline');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_textmarkup_underline = null;
        }
    });
    
    it('1009739-Underline annotation invisible when opacity=0', (done) => {
        try {
            pdfviewer_textmarkup_underline.underlineSettings.opacity = 0;
            pdfviewer_textmarkup_underline.annotationAdd = function () {
                expect(pdfviewer_textmarkup_underline.annotationCollection.length).toBeGreaterThan(0);
                const annotations = pdfviewer_textmarkup_underline.annotationCollection[pdfviewer_textmarkup_underline.annotationCollection.length - 1];
                expect(annotations).toBeDefined();
                expect(annotations.opacity).toBe(0);
                done();
            };            
            const startingElement = document.getElementById('pdfviewer_textmarkup_underline_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_underline_text_0_4');
            const range = document.createRange();

            // Select the contents of the starting element
            range.selectNodeContents(startingElement);

            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);

            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_underline.annotationModule.setAnnotationMode('Underline');
        } catch (e) {
            done.fail(e);
        }
    });
});

describe('PDF_Viewer_TextMarkup_Strikethrough_Opacity_Zero', () => {
    let pdfviewer_textmarkup_strikethrough: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_textmarkup_strikethrough' });
        document.body.appendChild(element);
        pdfviewer_textmarkup_strikethrough = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + HELLO_PDF_B64
        });
        pdfviewer_textmarkup_strikethrough.documentLoad = () => done();
        pdfviewer_textmarkup_strikethrough.appendTo('#pdfviewer_textmarkup_strikethrough');
    });

    afterAll(() => {
        if (pdfviewer_textmarkup_strikethrough) {
            pdfviewer_textmarkup_strikethrough.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_textmarkup_strikethrough');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_textmarkup_strikethrough = null;
        }
    });
    
    it('1009739-Strikethrough annotation invisible when opacity=0', (done) => {
        try {
            pdfviewer_textmarkup_strikethrough.strikethroughSettings.opacity = 0;
            pdfviewer_textmarkup_strikethrough.annotationAdd = function () {
                expect(pdfviewer_textmarkup_strikethrough.annotationCollection.length).toBeGreaterThan(0);
                const annotations = pdfviewer_textmarkup_strikethrough.annotationCollection[pdfviewer_textmarkup_strikethrough.annotationCollection.length - 1];
                expect(annotations).toBeDefined();
                expect(annotations.opacity).toBe(0);
                done();
            };            
            const startingElement = document.getElementById('pdfviewer_textmarkup_strikethrough_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_strikethrough_text_0_4');
            const range = document.createRange();

            // Select the contents of the starting element
            range.selectNodeContents(startingElement);

            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);

            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_strikethrough.annotationModule.setAnnotationMode('Strikethrough');
        } catch (e) {
            done.fail(e);
        }
    });
});

describe('PDF_Viewer_TextMarkup_Squiggly_Opacity_Zero', () => {
    let pdfviewer_textmarkup_squiggly: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_textmarkup_squiggly' });
        document.body.appendChild(element);
        pdfviewer_textmarkup_squiggly = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + HELLO_PDF_B64
        });
        pdfviewer_textmarkup_squiggly.documentLoad = () => done();
        pdfviewer_textmarkup_squiggly.appendTo('#pdfviewer_textmarkup_squiggly');
    });

    afterAll(() => {
        if (pdfviewer_textmarkup_squiggly) {
            pdfviewer_textmarkup_squiggly.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_textmarkup_squiggly');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_textmarkup_squiggly = null;
        }
    });
    
    it('1009739-Squiggly annotation invisible when opacity=0', (done) => {
        try {
            pdfviewer_textmarkup_squiggly.squigglySettings.opacity = 0;
            pdfviewer_textmarkup_squiggly.annotationAdd = function () {
                expect(pdfviewer_textmarkup_squiggly.annotationCollection.length).toBeGreaterThan(0);
                const annotations = pdfviewer_textmarkup_squiggly.annotationCollection[pdfviewer_textmarkup_squiggly.annotationCollection.length - 1];
                expect(annotations).toBeDefined();
                expect(annotations.opacity).toBe(0);
                done();
            };            
            const startingElement = document.getElementById('pdfviewer_textmarkup_squiggly_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_squiggly_text_0_4');
            const range = document.createRange();

            // Select the contents of the starting element
            range.selectNodeContents(startingElement);

            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);

            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_squiggly.annotationModule.setAnnotationMode('Squiggly');
        } catch (e) {
            done.fail(e);
        }
    });
});

describe('PDF_Viewer_TextMarkup_Comments_Reload', () => {
    let pdfviewer_textmarkup_comments: PdfViewer | null = null;
    let exportedJSONData: any = null;
    let savedBlob: Blob = null;

    const isViewerInitialized = (done: DoneFn) => {
        try{
            if (!pdfviewer_textmarkup_comments) {
                throw new Error('Viewer not initialized');
            }
        }
        catch (error) {
            done.fail(error);
        }
    }

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_textmarkup_comments' });
        document.body.appendChild(element);
        pdfviewer_textmarkup_comments = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + HELLO_PDF_B64
        });
        pdfviewer_textmarkup_comments.documentLoad = () => done();
        pdfviewer_textmarkup_comments.appendTo('#pdfviewer_textmarkup_comments');
    });

    afterAll(() => {
        if (pdfviewer_textmarkup_comments) {
            pdfviewer_textmarkup_comments.destroy();
            pdfviewer_textmarkup_comments = null;
        }
        const el: HTMLElement | null = document.getElementById('pdfviewer_textmarkup_comments');
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });

    it('1010498-Add highlight annotation', async (done) => {
        isViewerInitialized(done);
        const annotationAdded = () => {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            const annotation = pdfviewer_textmarkup_comments.annotationCollection[pdfviewer_textmarkup_comments.annotationCollection.length - 1];
            annotation.commentType = "add";
            annotation.note = "highlight comment";
            annotation.replyComment = ["highlight reply"];
            pdfviewer_textmarkup_comments.annotation.editAnnotation(annotation);
            expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(1);
            done();
        }
        try {
            pdfviewer_textmarkup_comments.addEventListener('annotationAdd', annotationAdded);
            const startingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_4');
            const range = document.createRange();
            // Select the contents of the starting element
            range.selectNodeContents(startingElement);
            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);
            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_comments.annotationModule.setAnnotationMode('Highlight');
        }
        catch (error) {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            done.fail(error);
        }
    });

    it('1010498-Add underline annotation', async (done) => {
        isViewerInitialized(done);
        const annotationAdded = () => {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            const annotation = pdfviewer_textmarkup_comments.annotationCollection[pdfviewer_textmarkup_comments.annotationCollection.length - 1];
            annotation.commentType = "add";
            annotation.note = "underline comment";
            annotation.replyComment = ["underline reply"];
            pdfviewer_textmarkup_comments.annotation.editAnnotation(annotation);
            expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(2);
            done();
        }
        try {
            pdfviewer_textmarkup_comments.addEventListener('annotationAdd', annotationAdded);
            const startingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_4');
            const range = document.createRange();
            // Select the contents of the starting element
            range.selectNodeContents(startingElement);
            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);
            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_comments.annotationModule.setAnnotationMode('Underline');
        }
        catch (error) {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            done.fail(error);
        }
    });

    it('1010498-Add strikethrough annotation', async (done) => {
        isViewerInitialized(done);
        const annotationAdded = () => {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            const annotation = pdfviewer_textmarkup_comments.annotationCollection[pdfviewer_textmarkup_comments.annotationCollection.length - 1];
            annotation.commentType = "add";
            annotation.note = "strikethrough comment";
            annotation.replyComment = ["strikethrough reply"];
            pdfviewer_textmarkup_comments.annotation.editAnnotation(annotation);
            expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(3);
            done();
        }
        try {
            pdfviewer_textmarkup_comments.addEventListener('annotationAdd', annotationAdded);
            const startingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_4');
            const range = document.createRange();
            // Select the contents of the starting element
            range.selectNodeContents(startingElement);
            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);
            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_comments.annotationModule.setAnnotationMode('Strikethrough');
        }
        catch (error) {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            done.fail(error);
        }
    });

    it('1010498-Add squiggly annotation', async (done) => {
        isViewerInitialized(done);
        const annotationAdded = () => {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            const annotation = pdfviewer_textmarkup_comments.annotationCollection[pdfviewer_textmarkup_comments.annotationCollection.length - 1];
            annotation.commentType = "add";
            annotation.note = "squiggly comment";
            annotation.replyComment = ["squiggly reply"];
            pdfviewer_textmarkup_comments.annotation.editAnnotation(annotation);
            expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(4);
            done();
        }
        try {
            pdfviewer_textmarkup_comments.addEventListener('annotationAdd', annotationAdded);
            const startingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_0');
            const endingElement = document.getElementById('pdfviewer_textmarkup_comments_text_0_4');
            const range = document.createRange();
            // Select the contents of the starting element
            range.selectNodeContents(startingElement);
            // Set the start position at the beginning of the starting element
            range.setStart(startingElement, 0);
            // Set the end position at the end of the ending element
            range.setEnd(endingElement, endingElement.childNodes.length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pdfviewer_textmarkup_comments.annotationModule.setAnnotationMode('Squiggly');
        }
        catch (error) {
            pdfviewer_textmarkup_comments.removeEventListener("annotationAdd", annotationAdded);
            done.fail(error);
        }
    });
    
    it('1010498-export annotation data', async (done) => {
        try {
            if (!pdfviewer_textmarkup_comments) {
                throw new Error('Viewer not initialized');
            }
            const exportFailed = (args: ExportFailureEventArgs) => {
                done.fail('export annotations failed with: ' + args.errorDetails);
            }
            const exportSucceeded = (args: ExportSuccessEventArgs) => {
                setTimeout(() => {
                    pdfviewer_textmarkup_comments.removeEventListener('exportFailed', exportFailed);
                    pdfviewer_textmarkup_comments.removeEventListener('exportSuccess', exportSucceeded);
                    done();
                });
            }
            pdfviewer_textmarkup_comments.addEventListener('exportFailed', exportFailed);
            pdfviewer_textmarkup_comments.addEventListener('exportSuccess', exportSucceeded);
            exportedJSONData = await pdfviewer_textmarkup_comments.exportAnnotationsAsObject(AnnotationDataFormat.Json);
        }
        catch (error) {
            done.fail(error);
        }
    });
    
    it('1010498-unload and save as blob', async (done) => {
        const unloadHandler = () => {
            setTimeout(() => {
                pdfviewer_textmarkup_comments.removeEventListener('documentUnload', unloadHandler);
                done();
            });
        }
        try {
            if (!pdfviewer_textmarkup_comments) {
                throw new Error('Viewer not initialized');
            }
            pdfviewer_textmarkup_comments.addEventListener('documentUnload', unloadHandler);
            savedBlob = await pdfviewer_textmarkup_comments.saveAsBlob();
            pdfviewer_textmarkup_comments.unload();
        }
        catch (error) {
            done.fail(error);
        }
    });

    it('1010498-reload document with added annotations', async (done) => {
        isViewerInitialized(done);
        const removeListeners = () => {
            pdfviewer_textmarkup_comments.removeEventListener('extractTextCompleted', extractTextCompleted);
        }
        const extractTextCompleted = (args: ExtractTextCompletedEventArgs) => {
            setTimeout(() => {
                expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(4);
                expect(pdfviewer_textmarkup_comments.annotationCollection[0].note).toBe("highlight comment");
                expect(pdfviewer_textmarkup_comments.annotationCollection[0].comments[0].note).toBe("highlight reply");
                expect(pdfviewer_textmarkup_comments.annotationCollection[1].note).toBe("underline comment");
                expect(pdfviewer_textmarkup_comments.annotationCollection[1].comments[0].note).toBe("underline reply");
                expect(pdfviewer_textmarkup_comments.annotationCollection[2].note).toBe("strikethrough comment");
                expect(pdfviewer_textmarkup_comments.annotationCollection[2].comments[0].note).toBe("strikethrough reply");
                expect(pdfviewer_textmarkup_comments.annotationCollection[3].note).toBe("squiggly comment");
                expect(pdfviewer_textmarkup_comments.annotationCollection[3].comments[0].note).toBe("squiggly reply");
                removeListeners();
                done();
            });
        }
        try {
            pdfviewer_textmarkup_comments.addEventListener('extractTextCompleted', extractTextCompleted);
            const fileReader: FileReader = new FileReader();
            fileReader.onload = async () => {
                pdfviewer_textmarkup_comments.load(fileReader.result as string, null);
            }
            fileReader.onerror = () => {
                removeListeners();
                done.fail('Error reading blob');
            }
            fileReader.readAsDataURL(savedBlob);
        }
        catch (error) {
            removeListeners();
            done.fail(error);
        }
    });

    it('1010498-reload document with imported annotations with JSON', async (done) => {
        isViewerInitialized(done);
        const removeListeners = () => {
            pdfviewer_textmarkup_comments.removeEventListener('importFailed', importFailed);
            pdfviewer_textmarkup_comments.removeEventListener('importSuccess', importSucceeded);
        }
        const importFailed = (args: ImportFailureEventArgs) => {
            removeListeners();
            done.fail('annotation import failed with error: ' + args.errorDetails);
        }
        const importSucceeded = () => {
            expect(pdfviewer_textmarkup_comments.annotationCollection.length).toBe(4);
            expect(pdfviewer_textmarkup_comments.annotationCollection[0].note).toBe("highlight comment");
            expect(pdfviewer_textmarkup_comments.annotationCollection[0].comments[0].note).toBe("highlight reply");
            expect(pdfviewer_textmarkup_comments.annotationCollection[1].note).toBe("underline comment");
            expect(pdfviewer_textmarkup_comments.annotationCollection[1].comments[0].note).toBe("underline reply");
            expect(pdfviewer_textmarkup_comments.annotationCollection[2].note).toBe("strikethrough comment");
            expect(pdfviewer_textmarkup_comments.annotationCollection[2].comments[0].note).toBe("strikethrough reply");
            expect(pdfviewer_textmarkup_comments.annotationCollection[3].note).toBe("squiggly comment");
            expect(pdfviewer_textmarkup_comments.annotationCollection[3].comments[0].note).toBe("squiggly reply");
            removeListeners();
            done();
        }
        try {
            deleteAllAnnotationsHelper(pdfviewer_textmarkup_comments);
            await waitFor(() => pdfviewer_textmarkup_comments.annotationCollection && pdfviewer_textmarkup_comments.annotationCollection.length === 0);
            pdfviewer_textmarkup_comments.addEventListener('importFailed', importFailed);
            pdfviewer_textmarkup_comments.addEventListener('importSuccess', importSucceeded);
            pdfviewer_textmarkup_comments.importAnnotation(exportedJSONData, AnnotationDataFormat.Json);
        }
        catch (error) {
            removeListeners();
            done.fail(error);
        }
    });
});

describe('PDF_Viewer_TextMarkup_Highlight_After_FreeText', () => {
    let pdfviewer_highlight_freetext: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
        BookmarkView, TextSelection, TextSearch, Print, Annotation,
        FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_freetext' });
        document.body.appendChild(element);
        pdfviewer_highlight_freetext = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64
        });
        pdfviewer_highlight_freetext.documentLoad = () => done();
        pdfviewer_highlight_freetext.appendTo('#pdfviewer_highlight_freetext');
    });

    afterAll(() => {
        if (pdfviewer_highlight_freetext) {
            pdfviewer_highlight_freetext.destroy();
            const el = document.getElementById('pdfviewer_highlight_freetext');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_highlight_freetext = null;
        }
    });
    it('11021247-Unable to Selecting After Adding Free Text Annotation 1', async () => {
        const target = getTarget('#pdfviewer_highlight_freetext_textLayer_0');
        const rect = target.getBoundingClientRect();
        pdfviewer_highlight_freetext.annotation.setAnnotationMode('FreeText');
        const freeTextAdded = new Promise<void>((resolve) => {
            pdfviewer_highlight_freetext.annotationAdd = () => resolve();
        });
        const x = Math.round(rect.left + 400);
        const y = Math.round(rect.top + 200);
        mouseMoveEvent(target, x, y);
        mouseDownEvent(target, x, y);
        mouseUpEvent(target, x, y);
        const inputBox = document.querySelector('.free-text-input') as HTMLElement;
        focusOutOnceWithoutNative(inputBox);
        await freeTextAdded;
        await waitFor(() =>
            pdfviewer_highlight_freetext.annotationCollection &&
            pdfviewer_highlight_freetext.annotationCollection.length > 0
        );
        const freeTextAnnotations = pdfviewer_highlight_freetext.annotationCollection;
        const lastFreeText = freeTextAnnotations[freeTextAnnotations.length - 1];
        expect(lastFreeText).toBeDefined();
    });
    it('11021247-Unable to Selecting After Adding Free Text Annotation 2', (done) => {
        const startingElement = document.getElementById('pdfviewer_highlight_freetext_text_0_0');
        const endingElement = document.getElementById('pdfviewer_highlight_freetext_text_0_4');
        expect(startingElement).toBeTruthy();
        expect(endingElement).toBeTruthy();
        const range = document.createRange();
        range.setStart(startingElement, 0);
        range.setEnd(endingElement, endingElement.childNodes.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        pdfviewer_highlight_freetext.annotationModule.setAnnotationMode('Highlight');
        const finalAnnotations = pdfviewer_highlight_freetext.annotationCollection;
        const lastAnnotation = finalAnnotations[finalAnnotations.length - 1];
        expect(lastAnnotation).toBeDefined();
        expect(lastAnnotation.textMarkupAnnotationType).toBe('Highlight');
        done();
    });
});