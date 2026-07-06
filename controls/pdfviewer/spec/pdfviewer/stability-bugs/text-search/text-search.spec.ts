import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer } from '../../../../src/index';
import { HELLO_PDF_B64, TEXT_WITH_QUOTES } from '../../Data/pdf-data.spec';
import { Dialog } from '@syncfusion/ej2-popups';
import { waitFor } from '../../utils.spec';


describe('PDF_Viewer_textsearch_searchbox_position', () => {
    let pdfviewer_1012486_textsearch: PdfViewer | null = null;
    let dialogObj: Dialog = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const dialogDiv: HTMLElement = createElement('div', { id: 'pdfviewer_1012486_textsearch_dialog'})
        const viewerDiv: HTMLElement = createElement('div', { id: 'pdfviewer_1012486_textsearch' });
        document.body.appendChild(dialogDiv);
        dialogDiv.appendChild(viewerDiv);
        dialogObj = new Dialog({
            animationSettings: { effect: 'None' },
            visible: false
        });
        dialogObj.appendTo('#pdfviewer_1012486_textsearch_dialog');
        pdfviewer_1012486_textsearch = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64
        });
        pdfviewer_1012486_textsearch.documentLoad = () => {
            done();
        };
        pdfviewer_1012486_textsearch.appendTo('#pdfviewer_1012486_textsearch');
    });

    afterAll(() => {
        if (pdfviewer_1012486_textsearch) {
            pdfviewer_1012486_textsearch.destroy();
            pdfviewer_1012486_textsearch = null;
        }
        if (dialogObj) {
            dialogObj.destroy();
            dialogObj = null;
        }
        const viewerDiv: HTMLElement | null = document.getElementById('pdfviewer_1012486_textsearch');
        if (viewerDiv && viewerDiv.parentNode) {
            viewerDiv.parentNode.removeChild(viewerDiv);
        }
        const dialogDiv: HTMLElement | null = document.getElementById('pdfviewer_1012486_textsearch_dialog');
        if (dialogDiv && dialogDiv.parentNode) {
            dialogDiv.parentNode.removeChild(dialogDiv);
        }
    });
    it('1002486 - verify search box position aligns with toolbar height when rendered inside dialog', async (done: DoneFn) => {
        const onOpen = () => {
            dialogObj.removeEventListener('open', onOpen);
            (pdfviewer_1012486_textsearch.viewerBase.getElement('_search') as HTMLElement).click();
            const searchBox: HTMLElement = pdfviewer_1012486_textsearch.viewerBase.getElement('_search_box');
            waitFor(() => searchBox.style.display === 'block');
            const toolbar: HTMLElement = pdfviewer_1012486_textsearch.viewerBase.getElement('_toolbarContainer');
            expect(searchBox.style.top).toBe(toolbar.clientHeight + 'px');
            done();
        }
        dialogObj.addEventListener('open', onOpen);
        dialogObj.show();
    });
});

describe('PDF_Viewer_Search_Whole_text', () => {
    let pdfviewer_search_wholeText: PdfViewer = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_search_wholeText' });
        document.body.appendChild(element);
        pdfviewer_search_wholeText = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + TEXT_WITH_QUOTES
        });
        pdfviewer_search_wholeText.documentLoad = () => {
            done();
        }
        pdfviewer_search_wholeText.appendTo("#pdfviewer_search_wholeText");
    });

    afterAll(() => {
        if (pdfviewer_search_wholeText) {
            pdfviewer_search_wholeText.destroy();
            const el = document.getElementById('pdfviewer_search_wholeText');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_search_wholeText = null;
        }
    });

    afterEach(() => {
    });

    it('search whole text', function (done) {
        pdfviewer_search_wholeText.extractTextCompleted = function () {
            const searchBtn = document.getElementById('pdfviewer_search_wholeText_search');
            searchBtn.click();
            const searchInput = document.getElementById('pdfviewer_search_wholeText_search_input') as any;
            searchInput.value = `UNITED STATES SECURITIES AND EXCHANGECOMMISSION Washington, D.C. 20549 ___________________________________________________________ FORM 8-K CURRENTREPORT Pursuant to Section 13 or 15(d) of the Securities ExchangeAct of 1934 Date of Report (Date of Earliest Event Reported): February 26, 2021 (February 24, 2021) _________________________ ILLINOIS TOOLWORKS INC. (Exact name of registrant as specified in itscharter) Delaware 1-4797 36-1258310 (State or otherjurisdiction of incorporation) (Commission File No.) (I.R.S. EmployerIdentification No.) 155HarlemAvenue Glenview IL 60025 (Address of principal executive offices) (ZipCode) Registrant's telephone number, includingareacode: 847-724-7500 Not Applicable (Former name or formeraddress, ifchanged sincelast report.) Check theappropriate boxbelowif the Form8-Kfilingis intended to simultaneously satisfy thefilingobligation of theregistrant underany of thefollowingprovisions: â˜ Written communications pursuant to Rule 425 under the Securities Act (17 CFR230.425) â˜ Solicitingmaterial pursuant to Rule 14a-12 under theExchangeAct (17 CFR240.14a-12) â˜ Pre-commencement communications pursuant to Rule 14d-2(b) under theExchangeAct (17 CFR240.14d-2(b)) â˜ Pre-commencement communications pursuant to Rule 13e-4(c) under theExchangeAct (17 CFR240.13e-4(c)) Securities registered pursuant to Section 12(b) of theAct: Title of each class Trading Symbol(s) Name of each exchange on which registered Common Stock ITW NewYork Stock Exchange 1.75%Euro Notes due 2022 ITW22 NewYork Stock Exchange 1.25%Euro Notes due 2023 ITW23 NewYork Stock Exchange 0.250%Euro Notes due 2024 ITW24A NewYork Stock Exchange 0.625%Euro Notes due 2027 ITW27 NewYork Stock Exchange 2.125%Euro Notes due 2030 ITW30 NewYork Stock Exchange 1.00%Euro Notes due 2031 ITW31 NewYork Stock Exchange 3.00%Euro Notes due 2034 ITW34 NewYork Stock Exchange Indicate by checkmarkwhether theregistrant isan emerginggrowth company as defined in Rule 405 of the Securities Act of 1933 (Â§230.405 of thischapter) or Rule 12b-2 of the Securities ExchangeAct of 1934 (Â§240.12b-2 of thischapter). Emerginggrowth companyÂÂâ˜ Ifan emerginggrowth company, indicate by checkmark if theregistrant haselected not to usetheextended transition period forcomplyingwith any newor revised financial accountingstandards provided pursuant to Section 13(a) of theExchangeAct.Ââ˜`;
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
            expect(pdfviewer_search_wholeText.textSearchModule.searchCount).toBe(1);
            done();
        }
    })
});