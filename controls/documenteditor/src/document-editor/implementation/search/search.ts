import { Dictionary } from '../../base/dictionary';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { FindOption } from '../../base/types';
import { TextPosition } from '../selection/selection-helper';
import { DocumentEditor } from '../../document-editor';
import { LineWidget, ElementBox, TextElementBox, FieldElementBox, Page, HeaderFooterWidget, BodyWidget } from '../viewer/page';
import { LayoutViewer, DocumentHelper } from '../index';
import { ElementInfo } from '../editor/editor-helper';
import { SearchWidgetInfo } from './text-search';
import { TextSearch } from '../search/text-search';
import { TextSearchResult } from '../search/text-search-result';
import { TextSearchResults } from '../search/text-search-results';
import { SearchResults } from './search-results';
import { ParagraphWidget } from '../viewer/page';
import { SearchResultsChangeEventArgs, searchResultsChangeEvent } from '../../base/index';
/**
 * Search module
 */
export class Search {
    private owner: DocumentEditor;
    /**
     * @private
     */
    public textSearch: TextSearch;
    /**
     * @private
     */
    public textSearchResults: TextSearchResults;
    /**
     * @private
     */
    public searchResultsInternal: SearchResults;
    /**
     * @private
     */
    public searchHighlighters: Dictionary<LineWidget, SearchWidgetInfo[]> = undefined;
    /**
     * @private
     */
    public isRepalceTracking: boolean;

    public get viewer(): LayoutViewer {
        return this.owner.viewer;
    }
    /**
     * Gets the search results object.
     *
     * @aspType SearchResults
     * @returns {SearchResults} - Returns the search results object.
     */
    public get searchResults(): SearchResults {
        return this.searchResultsInternal;
    }

    public constructor(owner: DocumentEditor) {
        this.owner = owner;
        this.searchHighlighters = new Dictionary<LineWidget, SearchWidgetInfo[]>();
        this.textSearch = new TextSearch(this.owner);
        this.textSearchResults = new TextSearchResults(this.owner);
        this.searchResultsInternal = new SearchResults(this);
    }
    public get documentHelper(): DocumentHelper {
        return this.owner.documentHelper;
    }

    private getModuleName(): string {
        return 'Search';
    }

    //#region Find & Find All
    /**
     * Finds the immediate occurrence of specified text from cursor position in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    public find(text: string, findOptions?: FindOption): void {
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        const result: TextSearchResult = this.textSearch.find(text, findOptions);
        if (!isNullOrUndefined(result)) {
            this.navigate(result);
        }
    }

    /**
     * Finds all occurrence of specified text in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    public findAll(text: string, findOptions?: FindOption): void {
        if (isNullOrUndefined(text || text === '')) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        const results: TextSearchResults = this.textSearch.findAll(text, findOptions);
        if (!isNullOrUndefined(results) && results.length > 0) {
            this.navigate(results.innerList[results.currentIndex]);
            this.highlight(results);
        }
    }
    //#endregion

    //#region Replace and Replace All
    /**
     * Replace the searched string with specified string
     *
     * @private
     * @param  {string} replaceText  - Specifies text to replace.
     * @param  {TextSearchResult} result - Specifies the result.
     * @param  {TextSearchResults} results - Specifies the results.
     * @returns {number} - Returns replaced text count.
     */
    public replace(replaceText: string, result: TextSearchResult, results: TextSearchResults): number {
        if (isNullOrUndefined(this.viewer.owner) || this.viewer.owner.isReadOnlyMode
        || !this.viewer.owner.editorModule.canEditContentControl || isNullOrUndefined(results)) {
            return 0;
        }
        if (!isNullOrUndefined(this.viewer)) {
            this.clearSearchHighlight();
        }
        this.navigate(result);
        const endPosition: TextPosition = this.documentHelper.selection.start;
        if (this.owner.enableTrackChanges && this.documentHelper.selection.start.currentWidget) {
            let inline: ElementBox = undefined;
            /* eslint-disable-next-line max-len */
            const inlineElement: ElementInfo = (this.documentHelper.selection.end.currentWidget as LineWidget).getInline(this.owner.selectionModule.start.offset, 0);
            inline = inlineElement.element as ElementBox;
            if (inline.revisionLength > 0) {
                this.isRepalceTracking = true;

            }
        }
        const index: number = results.indexOf(result);
        if (index < 0) {
            return 0;
        }
        this.owner.editorModule.insertTextInternal(replaceText, true);
        const endTextPosition: TextPosition = result.end;
        const startPosition: TextPosition = new TextPosition(this.viewer.owner);
        if (endTextPosition.currentWidget.children.length === 0) {
            const linewidget: LineWidget = endTextPosition.currentWidget.paragraph.childWidgets[0] as LineWidget;
            startPosition.setPositionParagraph(linewidget, endPosition.offset - replaceText.length);
        } else {
            startPosition.setPositionParagraph(endTextPosition.currentWidget, endPosition.offset - replaceText.length);
        }
        this.documentHelper.selection.selectRange(endPosition, startPosition);
        const eventArgs: SearchResultsChangeEventArgs = { source: this.viewer.owner };
        this.viewer.owner.trigger(searchResultsChangeEvent, eventArgs);
        return 1;
    }
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    public replaceInternal(textToReplace: string, findOptions?: FindOption): void {
        if ((textToReplace === '' || isNullOrUndefined(textToReplace))) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        const textToFind: string = this.textSearchResults.currentSearchResult.text;
        const pattern: RegExp = this.viewer.owner.searchModule.textSearch.stringToRegex(textToFind, findOptions);
        let index: string = this.owner.selectionModule.end.getHierarchicalIndexInternal();
        let result: TextSearchResult = this.textSearchResults.currentSearchResult;
        if (isNullOrUndefined(result)) {
            result = this.viewer.owner.searchModule.textSearch.findNext(pattern, findOptions, index);
        }
        if (!isNullOrUndefined(result)) {
            this.navigate(result);
            this.textSearchResults.addResult();
            this.textSearchResults.innerList[0] = result;
            this.replace(textToReplace, result, this.textSearchResults);
            index = this.owner.selectionModule.end.getHierarchicalIndexInternal();
            result = this.textSearch.findNext(textToFind, findOptions, index);
            if (result) {
                this.textSearchResults.addResult();
                this.textSearchResults.innerList[0] = result;
                this.navigate(result);
            }
        }
    }
    /**
     * Replace all the searched string with specified string
     *
     * @private
     * @param  {string} replaceText - Specifies the replace text.
     * @param  {TextSearchResults} results - Specfies the results.
     * @returns {number} - Returns the replace count.
     */
    public replaceAll(replaceText: string, results: TextSearchResults): number {
        this.documentHelper.layout.isReplacingAll = true;
        if (isNullOrUndefined(this.viewer.owner) || this.viewer.owner.isReadOnlyMode || isNullOrUndefined(results)) {
            return 0;
        }
        if (this.owner.editorHistoryModule) {
            this.owner.editorHistoryModule.initComplexHistory(this.owner.selectionModule, 'ReplaceAll');
        }
        const count: number = results.length;
        this.viewer.owner.isLayoutEnabled = false;
        const text: string = results.innerList[0].text;
        for (let i: number = count - 1; i >= 0; i--) {
            const result: TextSearchResult = results.innerList[parseInt(i.toString(), 10)];
            if (result.start.currentWidget.children.length === 0) {
                results = this.textSearch.findAll(text);
                i = results.length;
            } else {
                this.navigate(result);
                if (this.viewer.owner.isReadOnlyMode || !this.viewer.owner.editorModule.canEditContentControl) {
                    continue;
                }
                let allowLayout: boolean = true;
                if (i > 0) {
                    const previousResult: TextSearchResult = results.innerList[i - 1];
                    if (previousResult.start.paragraph.equals(result.start.paragraph)) {
                        allowLayout = false;
                    }
                }
                this.owner.editorModule.insertTextInternal(replaceText, true, undefined, allowLayout);
                result.destroy();
            }
            //if (result.isHeader || result.isFooter) {
            // eslint-disable-next-line max-len
            //this.documentHelper.layout.updateHeaderFooterToParent(this.documentHelper.selection.start.paragraph.bodyWidget as HeaderFooterWidget);
            //}
        }
        if (this.owner.editorHistoryModule && !isNullOrUndefined(this.owner.editorHistoryModule.currentHistoryInfo)) {
            this.owner.editorHistoryModule.updateComplexHistory();
        } else {
            this.owner.editorModule.updateComplexWithoutHistory(2);
        }
        this.searchResults.clear();
        this.documentHelper.layout.isReplacingAll = false;
        return count;
    }
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    public replaceAllInternal(textToReplace: string, findOptions?: FindOption): void {
        if (isNullOrUndefined(textToReplace)) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        if (this.textSearchResults.length > 0) {
            this.navigate(this.textSearchResults.innerList[this.textSearchResults.currentIndex]);
            this.highlight(this.textSearchResults);
            this.replaceAll(textToReplace, this.textSearchResults);
        }
    }

    //#endregion

    //#region Highlight Search Result
    /**
     * @private
     * @param {TextSearchResult} textSearchResult - Specifies the text search results.
     * @returns {void}
     */
    public navigate(textSearchResult: TextSearchResult): void {
        if (textSearchResult) {
            const start: string = textSearchResult.startOffset;
            const end: string = textSearchResult.endOffset;
            if (!isNullOrUndefined(this.owner) && !isNullOrUndefined(this.owner.selectionModule) && !isNullOrUndefined(start) &&
                !isNullOrUndefined(end)) {
                this.owner.selectionModule.select(start, end);
                this.documentHelper.updateFocus();
            }
        }
    }
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specifies the text search results.
     * @returns {void}
     */
    public highlight(textSearchResults: TextSearchResults): void {
        this.searchHighlighters = new Dictionary<LineWidget, SearchWidgetInfo[]>();
        for (let i: number = 0; i < textSearchResults.innerList.length; i++) {
            const result: TextSearchResult = textSearchResults.innerList[parseInt(i.toString(), 10)];
            this.highlightResult(result);
        }
        this.viewer.renderVisiblePages();
    }

    private highlightResult(result: TextSearchResult): void {
        this.highlightSearchResult(result.start.paragraph, result.start, result.end);
    }

    /* eslint-disable  */
    private highlightSearchResult(paragraph: ParagraphWidget, start: TextPosition, end: TextPosition): void {
        let selectionStartIndex: number = 0;
        let selectionEndIndex: number = 0;
        let startElement: ElementBox = null;
        let endElement: ElementBox = null;
        let lineWidget: ElementInfo = this.documentHelper.selection.getStartLineWidget(paragraph as ParagraphWidget, start, startElement, selectionStartIndex);
        selectionStartIndex = lineWidget.index;
        startElement = lineWidget.element;
        let startLineWidget: LineWidget = startElement ? startElement.line : paragraph.childWidgets[0] as LineWidget;
        let endLine: ElementInfo = this.documentHelper.selection.getEndLineWidget(end, endElement, selectionEndIndex);
        selectionEndIndex = endLine.index;
        endElement = endLine.element;
        let endLineWidget: LineWidget = endElement ? endElement.line :
            end.paragraph.childWidgets[end.paragraph.childWidgets.length - 1] as LineWidget;
        let top: number = this.documentHelper.selection.getTop(startLineWidget);
        let left: number = this.documentHelper.selection.getLeftInternal(startLineWidget, startElement, selectionStartIndex);

        if (!isNullOrUndefined(startLineWidget) && startLineWidget === endLineWidget) {
            //find result ends in current line.
            let right: number = this.documentHelper.selection.getLeftInternal(endLineWidget, endElement, selectionEndIndex);
            let isRtlText: boolean = false;
            if (endElement instanceof TextElementBox) {
                isRtlText = endElement.isRightToLeft;
            }
            let width: number = 0;
            width = Math.abs(right - left);
            if (!isRtlText && startElement instanceof TextElementBox) {
                isRtlText = startElement.isRightToLeft;
            }
            // Handled the highlighting approach as genric for normal and rtl text.
            if (isRtlText || paragraph.bidi) {
                let elementBox: ElementBox[] = this.documentHelper.selection.getElementsForward(startLineWidget, startElement, endElement, paragraph.bidi);
                if (elementBox && elementBox.length > 1) {
                    for (let i: number = 0; i < elementBox.length; i++) {
                        let element: ElementBox = elementBox[i];
                        let elementIsRTL: boolean = false;
                        let index: number = element instanceof TextElementBox ? (element as TextElementBox).length : 1;
                        if (element === startElement) {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionStartIndex);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                        } else if (element === endElement) {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionEndIndex);
                        } else {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                        }
                        if (element instanceof TextElementBox) {
                            elementIsRTL = element.isRightToLeft;
                        }
                        width = Math.abs(right - left);
                        this.createHighlightBorder(startLineWidget, width, elementIsRTL ? right : left, top);
                    }
                } else {
                    this.createHighlightBorder(startLineWidget, width, isRtlText ? right : left, top);
                }
            } else {
                // Start element and end element will be in reverese for Bidi paragraph highlighting. 
                // So, the right is considered based on Bidi property. 
                this.createHighlightBorder(startLineWidget, width, left, top);
            }
        } else {
            if (!isNullOrUndefined(startLineWidget)) {
                if (paragraph !== startLineWidget.paragraph) {
                    paragraph = startLineWidget.paragraph;
                }
                let width: number = this.documentHelper.selection.getWidth(startLineWidget, true) - (left - startLineWidget.paragraph.x);
                // Handled the  highlighting approach as genric for normal and rtl text.
                if (paragraph.bidi || (startElement instanceof TextElementBox && startElement.isRightToLeft)) {
                    let right: number = 0;
                    let elementCollection: ElementBox[] = this.documentHelper.selection.getElementsForward(startLineWidget, startElement, endElement, paragraph.bidi);
                    if (elementCollection) {
                        let elementIsRTL: boolean = false;
                        for (let i: number = 0; i < elementCollection.length; i++) {
                            let element: ElementBox = elementCollection[i];
                            let index: number = element instanceof TextElementBox ? (element as TextElementBox).length : 1;
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                            elementIsRTL = false;
                            if (element === startElement) {
                                left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionStartIndex);
                            } else {
                                left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            }
                            if (element instanceof TextElementBox) {
                                elementIsRTL = element.isRightToLeft;
                            }
                            width = Math.abs(right - left);
                            this.createHighlightBorder(startLineWidget, width, elementIsRTL ? right : left, top);
                        }
                        // Highlight the Paragrph mark for last line.
                    }
                } else {
                    this.createHighlightBorder(startLineWidget, width, left, top);
                }
                let lineIndex: number = startLineWidget.paragraph.childWidgets.indexOf(startLineWidget);
                //Iterates to last item of paragraph or search result end.

                for (let i: number = 0; i < paragraph.childWidgets.length; i++) {
                    if (paragraph === startLineWidget.paragraph) {
                        lineIndex += 1;
                    }
                    this.highlightSearchResultParaWidget(paragraph, lineIndex, endLineWidget, endElement, selectionEndIndex);
                    if (paragraph === endLineWidget.paragraph) {
                        return;
                    } else {
                        lineIndex = 0;
                        paragraph = endLineWidget.paragraph;
                        i--;
                    }
                }
            }
        }
    }

    private createHighlightBorder(lineWidget: LineWidget, width: number, left: number, top: number): void {
        let findHighLight: SearchWidgetInfo = this.addSearchHighlightBorder(lineWidget);
        let page: Page = this.viewer.owner.selectionModule.getPage(lineWidget.paragraph);
        let pageTop: number = page.boundingRectangle.y;
        let pageLeft: number = page.boundingRectangle.x;
        findHighLight.left = Math.ceil(left);
        top = Math.ceil(top);
        findHighLight.width = Math.floor(width);
        let height: number = Math.floor(lineWidget.height);
        let context: CanvasRenderingContext2D = this.documentHelper.containerContext;
    }

    private addSearchHighlightBorder(lineWidget: LineWidget): SearchWidgetInfo {
        let highlighters: SearchWidgetInfo[] = undefined;
        let collection: Dictionary<LineWidget, SearchWidgetInfo[]> = this.searchHighlighters;
        if (collection.containsKey(lineWidget)) {
            highlighters = collection.get(lineWidget);
        } else {
            highlighters = [];
            collection.add(lineWidget, highlighters);
        }
        let searchHighlight: SearchWidgetInfo = new SearchWidgetInfo(0, 0);
        highlighters.push(searchHighlight);
        return searchHighlight;
    }

    private highlightSearchResultParaWidget(widget: ParagraphWidget, startIndex: number, endLine: LineWidget, endElement: ElementBox, endIndex: number): void {
        let top: number = 0;
        let width: number = 0;
        let isRtlText: boolean = false;
        for (let j: number = startIndex; j < widget.childWidgets.length; j++) {
            let lineWidget: LineWidget = widget.childWidgets[j] as LineWidget;
            if (j === startIndex) {
                top = this.documentHelper.selection.getTop(lineWidget);
            }
            let left: number = this.documentHelper.selection.getLeft(lineWidget);
            if (endElement instanceof TextElementBox) {
                isRtlText = endElement.isRightToLeft;
            }
            if (lineWidget === endLine) {
                //Selection ends in current line.
                let right: number = 0;
                // Handled the highlighting using the element box highlighting approach as genric for normal and rtl text.
                if (isRtlText || widget.bidi) {
                    let elementBox: ElementBox[] = this.documentHelper.selection.getElementsBackward(lineWidget, endElement, endElement, widget.bidi);
                    for (let i: number = 0; i < elementBox.length; i++) {
                        let element: ElementBox = elementBox[i];
                        let elementIsRTL: boolean = false;
                        left = this.documentHelper.selection.getLeftInternal(lineWidget, element, 0);
                        if (element === endElement) {
                            right = this.documentHelper.selection.getLeftInternal(lineWidget, element, endIndex);
                        } else {
                            let index: number = element instanceof TextElementBox ? (element as TextElementBox).length : 1;
                            right = this.documentHelper.selection.getLeftInternal(lineWidget, element, index);
                        }
                        if (element instanceof TextElementBox) {
                            elementIsRTL = element.isRightToLeft;
                        }
                        width = Math.abs(right - left);
                        this.createHighlightBorder(lineWidget, width, elementIsRTL ? right : left, top);
                    }
                    return;
                } else {
                    right = this.documentHelper.selection.getLeftInternal(endLine, endElement, endIndex);
                    width = Math.abs(right - left);
                    this.createHighlightBorder(lineWidget, width, isRtlText ? right : left, top);
                    return;
                }
            } else {
                width = this.documentHelper.selection.getWidth(lineWidget, true) - (left - widget.x);
                this.createHighlightBorder(lineWidget, width, left, top);
                top += lineWidget.height;
            }
        }
    }

    //#endregion

    //#region Get find result view
    /**
     * @private
     * @param {HTMLElement} result - Specified the result.
     * @returns {void}
     */
    public addSearchResultItems(result: HTMLElement): void {
        if (isNullOrUndefined(result)) {
            return;
        }
        if (isNullOrUndefined(this.owner.findResultsList)) {
            this.owner.findResultsList = [];
        }
        this.owner.findResultsList.push(result);
    }
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specified text search result.
     * @returns {void}
     */
    public addFindResultView(textSearchResults: TextSearchResults): void {
        for (let i: number = 0; i < textSearchResults.innerList.length; i++) {
            let result: TextSearchResult = textSearchResults.innerList[i];
            this.addFindResultViewForSearch(result);
        }
    }
    /**
     * @private
     * @returns {void}
     */
    /* eslint-disable  */
    public addFindResultViewForSearch(result: TextSearchResult): void {
        if (result.start != null && result.end != null && result.start.paragraph != null && result.end.paragraph != null) {
            let prefixText: string;
            let suffixtext: string;
            let currentText: string;
            let startIndex: number = 0;
            let inlineObj: ElementInfo = (result.start.currentWidget as LineWidget).getInline(result.start.offset, startIndex);
            let inline: ElementBox = inlineObj.element;
            startIndex = inlineObj.index;
            let prefix: string = '';
            let lastIndex: number = 0;
            if (inline instanceof FieldElementBox) {
                let elementInfo: ElementInfo = this.owner.selectionModule.getRenderedInline(inline as FieldElementBox, startIndex);
                if (elementInfo.element.nextNode instanceof TextElementBox) {
                    inline = elementInfo.element.nextNode;
                    startIndex = elementInfo.index;
                } else {
                    inline = elementInfo.element;
                    startIndex = elementInfo.index;
                }
            }
            let boxObj: ElementInfo = this.owner.selectionModule.getElementBoxInternal(inline, startIndex);
            let box: ElementBox = boxObj.element;
            startIndex = boxObj.index;
            if (box != null) {
                if (box instanceof TextElementBox && startIndex > 0) {
                    prefix = (box as TextElementBox).text.substring(0, startIndex);
                }
                let boxIndex: number = box.line.children.indexOf(box);
                lastIndex = prefix.lastIndexOf(' ');
                while (lastIndex < 0 && boxIndex > 0 && box.line.children[boxIndex - 1] instanceof TextElementBox) {
                    prefix = (box.line.children[boxIndex - 1] as TextElementBox).text + prefix;
                    boxIndex--;
                    lastIndex = prefix.lastIndexOf(' ');
                }
            }
            let shiftIndex: number = prefix.lastIndexOf('\v');
            if (shiftIndex > 0) {
                prefix = prefix.substring(0, shiftIndex);
            } else {
                lastIndex = prefix.lastIndexOf(' ');
                prefixText = lastIndex < 0 ? prefix : prefix.substring(lastIndex + 1);
            }
            currentText = result.text;
            let endIndex: number = 0;
            let endInlineObj: ElementInfo = (result.end.currentWidget as LineWidget).getInline(result.end.offset, endIndex);
            let endInline: ElementBox = endInlineObj.element;
            endIndex = endInlineObj.index;
            suffixtext = '';
            //Checks prefix element box is empty
            if (boxObj != null) {
                // Gets the element box using endIndex of the text and set as suffix
                boxObj = this.owner.selectionModule.getElementBoxInternal(endInline, endIndex);
                box = boxObj.element;
                endIndex = boxObj.index;
            }
            //Checks suffix element box is empty.
            if (box != null) {
                if (box instanceof TextElementBox && endIndex < (box as TextElementBox).length) {
                    suffixtext = (box as TextElementBox).text.substring(endIndex);
                }
                let boxIndex: number = box.line.children.indexOf(box);
                while (boxIndex + 1 < box.line.children.length && (box.line.children[boxIndex + 1] instanceof TextElementBox) || (box.line.children[boxIndex + 1] instanceof FieldElementBox)) {
                    if (box.line.children[boxIndex + 1] instanceof FieldElementBox) {
                        boxIndex = boxIndex + 2;
                    } else {
                        suffixtext = suffixtext + (box.line.children[boxIndex + 1] as TextElementBox).text;
                        boxIndex = boxIndex + 1;
                    }
                }
            }
            lastIndex = suffixtext.lastIndexOf(' ');
            suffixtext = suffixtext === '\v' ? suffixtext = '' : suffixtext;
            let headerFooterString: HTMLSpanElement;
            let containerWidget: BodyWidget = result.start.paragraph.containerWidget as BodyWidget;
            let type: string = containerWidget instanceof HeaderFooterWidget ? containerWidget.headerFooterType : '';
            if (type.indexOf('Header') != -1) {
                headerFooterString = document.createElement('span');
                headerFooterString.classList.add('e-de-header-footer-list');
                headerFooterString.textContent = 'Header: ';
            } else if (type.indexOf('Footer') != -1) {
                headerFooterString = document.createElement('span');
                headerFooterString.classList.add('e-de-header-footer-list');
                headerFooterString.textContent = 'Footer: ';
            }

            let listElement: HTMLElement = document.createElement('li');
            listElement.setAttribute('tabindex', '0');
            listElement.classList.add('e-de-search-result-item', 'e-de-op-search-txt');
            if (headerFooterString) {
                listElement.appendChild(headerFooterString);
            }
            if (prefix) {
                let prefixNode = document.createTextNode(prefix);
                listElement.appendChild(prefixNode);
            }
            let resultSpan = document.createElement('span');
            resultSpan.classList.add('e-de-op-search-word');
            resultSpan.style.pointerEvents = 'none';
            resultSpan.textContent = result.text;
            listElement.appendChild(resultSpan);
            if (suffixtext) {
                let suffixNode = document.createTextNode(suffixtext);
                listElement.appendChild(suffixNode);
            }

            
            this.addSearchResultItems(listElement);
        }
    }
    //#endregion

    /**
     * Clears search highlight.
     *
     * @private
     * @returns {void}
     */
    public clearSearchHighlight(): void {
        if (!isNullOrUndefined(this.searchHighlighters)) {
            this.searchHighlighters.clear();
            this.searchHighlighters = undefined;
        }
        let eventArgs: SearchResultsChangeEventArgs = { source: this.viewer.owner };
        this.viewer.owner.trigger(searchResultsChangeEvent, eventArgs);
    }
    /**
     * @private
     * @returns {void}
     */
    public destroy(): void {
        if (this.textSearchResults) {
            this.textSearchResults.destroy();
        }
        this.textSearchResults = undefined;
        this.owner =undefined;
    }
}
