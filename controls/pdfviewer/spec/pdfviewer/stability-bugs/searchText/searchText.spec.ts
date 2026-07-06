import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer } from '../../../../src/index';
import { TEXT_WITH_LINE_BREAK } from '../../Data/pdf-data.spec';
import { waitFor, simulateTyping, pressKey } from '../../utils.spec';

describe('PDF_Viewer_TextSearch_occurrence', () => {
    let pdfviewer_search_occurrence: PdfViewer = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_search_occurrence' });
        document.body.appendChild(element);
        pdfviewer_search_occurrence = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + TEXT_WITH_LINE_BREAK
        });
        pdfviewer_search_occurrence.documentLoad = () => {
            done();
        }
        pdfviewer_search_occurrence.appendTo("#pdfviewer_search_occurrence");
    });

    afterAll(() => {
        if (pdfviewer_search_occurrence) {
            pdfviewer_search_occurrence.destroy();
            const el = document.getElementById('pdfviewer_search_occurrence');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_search_occurrence = null;
        }
    });

    afterEach(() => {
    });

    it('1026435 - Search a text and check previous and next occurrence', (done) => {
        pdfviewer_search_occurrence.extractTextCompleted = function () {
            var searchBtn = pdfviewer_search_occurrence.viewerBase.getElement('_searchIcon') as any;
            searchBtn.click();
            var searchInput = pdfviewer_search_occurrence.viewerBase.getElement('_search_input') as any;
            var nextSearchBtn = pdfviewer_search_occurrence.viewerBase.getElement('_next_occurrence') as any;
            var prevSearchBtn = pdfviewer_search_occurrence.viewerBase.getElement('_prev_occurrence') as any;
            searchInput.focus();
            searchInput.click();

            simulateTyping({ element: searchInput, text: 'bolt' });
            pressKey({ element: searchInput, key: 'Enter', code: 'Enter' });

            waitFor(function () {
                return pdfviewer_search_occurrence.textSearchModule.searchCount === 2;
            }).then(function () {
                expect(pdfviewer_search_occurrence.textSearchModule.searchCount).toBe(2);

                nextSearchBtn.click();
                return waitFor(function () {
                    return pdfviewer_search_occurrence.textSearchModule.currentOccurrence === 2;
                });
            }).then(function () {
                prevSearchBtn.click();
                return waitFor(function () {
                    return pdfviewer_search_occurrence.textSearchModule.currentOccurrence === 1;
                });
            }).then(function () {
                expect(pdfviewer_search_occurrence.textSearchModule.currentOccurrence).toBe(1);
                nextSearchBtn.click();
                return waitFor(function () {
                    return pdfviewer_search_occurrence.textSearchModule.currentOccurrence === 2;
                });
            }).then(function () {
                expect(pdfviewer_search_occurrence.textSearchModule.currentOccurrence).toBe(2);
                searchBtn.click();
                done();
            }).catch(function (error: any) {
                fail(error);
                done();
            });
            done();
        }
    });

});