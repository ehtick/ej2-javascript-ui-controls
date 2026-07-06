import { createElement, Browser } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer,
    CommentFilterSettings
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor, mouseClickEvent } from "../../utils.spec";
import { ANNOT_PAGE } from "../../Data/pdf-data.spec";
// import { domain } from "process";
// import { CommentStatus } from "../../../../blazor/sfpdfviewer";

PdfViewer.Inject(
    Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
    BookmarkView, TextSelection, TextSearch, Print, Annotation,
    FormFields, FormDesigner, PageOrganizer
);

/**
 * Comment Panel Filter Feature Tests
 * This suite validates the Comment Panel Filter feature per the specification.
 * Tests cover filtering UI interactions, programmatic API usage, and document synchronization.
 */
describe('PDF_Viewer_CommentPanelFilter', () => {
    let pdfviewer_commentFilter: PdfViewer = null;


    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_commentFilter' });
        document.body.appendChild(element);
        pdfviewer_commentFilter = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + ANNOT_PAGE
        });
        pdfviewer_commentFilter.documentLoad = () => {
            done();
        }
        pdfviewer_commentFilter.appendTo("#pdfviewer_commentFilter");
    });

    afterAll(() => {
        if (pdfviewer_commentFilter) {
            pdfviewer_commentFilter.destroy();
            const el = document.getElementById('pdfviewer_commentFilter');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer_commentFilter = null;
        }
    });
    it('1023707-001-Check filter icon is present in the comment panel', (done) => {
        try {
            const annotationBtn = document.querySelector('#pdfviewer_commentFilter_annotation') as HTMLElement;
            mouseClickEvent(annotationBtn);
            const CommentPanelBtn = document.querySelector('#pdfviewer_commentFilter_annotation_commentPanel') as HTMLElement;
            mouseClickEvent(CommentPanelBtn);
            const FilterBtn = document.querySelector('#pdfviewer_commentFilter_annotation_filter_btn') as HTMLElement;
            mouseClickEvent(FilterBtn);
            expect(FilterBtn).not.toBeNull();
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //status based filter
    it('1023707-002-Filter works in status', (done) => {
        try {
            const filterSettings: any = {
                // type: ['Highlight', 'Underline', 'Strikethrough', 'Rectangle', 'Circle', 'Line', 'Polygon'],
                status: ['Cancelled'],
                includeReplies: false,
                applyToDocument: false
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(1);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)

            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //Filters Textmarkup and shape annotation type
    it('1023707-003-Filter works in TextMarkup and Shape Annotation Types', (done) => {
        try {
            const filterSettings: any = {
                type: ['Highlight', 'Underline', 'Strikethrough', 'Rectangle', 'Circle', 'Line', 'Polygon'],

                includeReplies: false,
                applyToDocument: false
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(7);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)

            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //filters measurement annotation
    it('1023707-004-Filter works in Measurement Annotation Type', (done) => {
        try {
            const filterSettings: any = {
                type: ['Distance', 'Volume', 'Perimeter', 'Radius', 'Area'],

                includeReplies: false,
                applyToDocument: false
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(0);
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //Filters other annotation types
    it('1023707-005-Filter works in Ink, Sticky notes and Stamp annotations', (done) => {
        try {
            const filterSettings: any = {
                type: ['stamp', 'sticky', 'Ink'],

                includeReplies: false,
                applyToDocument: false
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(3);
            const clear: any = null as CommentFilterSettings
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //Clear annotation
    it('1023707-006-Annotation Should restore after Clearing filter', (done) => {
        try {
            const filterSettings: any = null

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(11);
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    // filters based on modified date and color
    it('1023707-007-Filter works in Color', (done) => {
        try {
            const filterSettings: any = {
                color: ['#FF0000', '#00ff00'],
                includeReplies: false,
                applyToDocument: false
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(8);
            const clear: any = null as CommentFilterSettings
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //Filter with include replies
    it('1023707-008-Filter works based on Author with Include replies', (done) => {
        try {
            const filterSettings: any = {
                author: ['LogeshwaranSaravanan'],
                includeReplies: true,
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(2);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    //without include replies
    it('1023707-009-Filter works based on Author without Include replies', (done) => {
        try {
            const filterSettings: any = {
                author: ['LogeshwaranSaravanan'],
                includeReplies: false,
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(0);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });
    it('1023707-010- Annotation filtered properly in page', async () => {
        const beforeFilter = (document.querySelector("#pdfviewer_commentFilter_annotationCanvas_0") as HTMLCanvasElement).toDataURL().length
        var filterSettings: any = {
            type: ['Highlight'],
            includeReplies: false,
            applyToDocument: true
        };
        pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings);
        await waitFor(() => { return document.querySelector("#pdfviewer_commentFilter_annotationCanvas_0") !== null; });
        const canvas = document.querySelector("#pdfviewer_commentFilter_annotationCanvas_0") as HTMLCanvasElement;
        expect(canvas).not.toBeNull();
        const ActualSize = canvas.toDataURL().length;
        expect(ActualSize).toBeLessThan(beforeFilter);

    });
    it('1023707-011-Filter works based on status with Include replies', (done) => {
        try {
            const filterSettings: any = {
                status: ['Accepted'],
                includeReplies: true,
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(1);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });
    it('1023707-012-Filter works based on modified date with Include replies', (done) => {
        try {
            const filterSettings: any = {
                modifiedDate: ["12/14/2022"],
                includeReplies: true,
            };

            pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
            let count = 0;
            document.querySelectorAll('.e-pv-comments-container').forEach(el => {
                if (window.getComputedStyle(el).display === 'block') {
                    count++;
                }
            });
            expect(count).toBe(3);
            const clear: any = null
            pdfviewer_commentFilter.annotation.applyCommentFilter(clear)
            done();
        } catch (e) {
            done.fail(e);
        }
    });
    it('1023707-013-Apply filter in UI in Desktop', async () => {
        const filterSettings: any = {
            author: ['LogeshwaranSaravanan'],
            type: ['stamp'],
            status: ['Accepted'],
            includeReplies: true,
        };
        pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
        const annotationBtn = document.querySelector('#pdfviewer_commentFilter_annotation') as HTMLElement;
        mouseClickEvent(annotationBtn);
        const CommentPanelBtn = document.querySelector('#pdfviewer_commentFilter_annotation_commentPanel') as HTMLElement;
        mouseClickEvent(CommentPanelBtn);
        await waitFor(() => { return document.querySelector(".e-pv-comment-panel") !== null; });
        const FilterBtn = document.querySelector('#pdfviewer_commentFilter_annotation_filter_btn') as HTMLElement;
        mouseClickEvent(FilterBtn);
        await waitFor(() => { return document.querySelector("#pdfviewer_commentFilter_comment_filter_dialog") !== null; });
        const ClearBtn = document.querySelector('.e-pv-filter-apply-btn') as HTMLElement;
        mouseClickEvent(ClearBtn);
    });
    it('1023707-014-Clear filter in UI in Desktop', async () => {
        const filterSettings: any = {
            author: ['LogeshwaranSaravanan'],
            type: ['stamp'],
            status: ['Accepted'],
            includeReplies: true,
        };
        pdfviewer_commentFilter.annotation.applyCommentFilter(filterSettings)
        const annotationBtn = document.querySelector('#pdfviewer_commentFilter_annotation') as HTMLElement;
        mouseClickEvent(annotationBtn);
        const CommentPanelBtn = document.querySelector('#pdfviewer_commentFilter_annotation_commentPanel') as HTMLElement;
        mouseClickEvent(CommentPanelBtn);
        await waitFor(() => { return document.querySelector(".e-pv-comment-panel") !== null; });
        const FilterBtn = document.querySelector('#pdfviewer_commentFilter_annotation_filter_btn') as HTMLElement;
        mouseClickEvent(FilterBtn);
        await waitFor(() => { return document.querySelector("#pdfviewer_commentFilter_comment_filter_dialog") !== null; });
        const ClearBtn = document.querySelector('.e-pv-filter-clear-btn') as HTMLElement;
        mouseClickEvent(ClearBtn);
    });
});

describe(' CommentFilter - Mobile', () => {
    let pdfviewer_commentFilterMobile: PdfViewer;
    let originalIsDevice: boolean;

    beforeAll((done) => {
        originalIsDevice = Browser.isDevice;
        const element = createElement('div', { id: 'pdfviewer_commentFilterMobile' });
        document.body.appendChild(element);
        pdfviewer_commentFilterMobile = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + ANNOT_PAGE
        });
        pdfviewer_commentFilterMobile.documentLoad = () => {
            done();
        };
        Object.defineProperty(Browser, 'isDevice', { get: function () { return true; }, configurable: true });
        pdfviewer_commentFilterMobile.appendTo('#pdfviewer_commentFilterMobile');
    });

    afterAll(() => {
        if (pdfviewer_commentFilterMobile) {
            pdfviewer_commentFilterMobile.destroy();
            const el = document.getElementById('pdfviewer_commentFilterMobile');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
        }
        Object.defineProperty(Browser, 'isDevice', { get: function () { return originalIsDevice; }, configurable: true });
    });
    it('1023707-001-Open filter panel in mobile', (done) => {
        try {
            const annotationBtn = document.querySelector('#pdfviewer_commentFilterMobile_annotation') as HTMLElement;
            mouseClickEvent(annotationBtn);
            const CommentPanelBtn = document.querySelector('#pdfviewer_commentFilterMobile_annotation_commentPanel') as HTMLElement;
            mouseClickEvent(CommentPanelBtn);
            const FilterBtn = document.querySelector('#pdfviewer_commentFilterMobile_annotation_filter_btn') as HTMLElement;
            mouseClickEvent(FilterBtn);
            expect(FilterBtn).not.toBeNull();
            done();
        } catch (e) {
            done.fail(e);
        }
    });
});
