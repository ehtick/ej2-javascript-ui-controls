import { WCharacterFormat } from '../format/character-format';
import { DocumentHelper } from '../viewer';
import { TextSizeInfo } from '../viewer/text-helper';
import { createElement, isNullOrUndefined, updateCSSText } from '@syncfusion/ej2-base';
/**
 * Class which performs regular text measuring logic to find font height.
 */
export class Regular {

    /**
     * @private
     */
    public documentHelper: DocumentHelper;

    /**
     * Gets module name.
     *
     * @returns {string} - the module name.
     */
    private getModuleName(): string {
        return 'Regular';
    }
    /**
     * Constructor to initialize Regular module.
     *
     * @param {DocumentHelper} documentHelper - the document helper object
     */
    public constructor(documentHelper: DocumentHelper) {
        this.documentHelper = documentHelper;
    }

    /**
     * @private
     * @param {WCharacterFormat} characterFormat - character format to apply.
     * @param {string} fontToRender - font to render.
     * @returns {TextSizeInfo} returns text size information.
     */
    public getHeightInternal(characterFormat: WCharacterFormat, fontToRender: string): TextSizeInfo {
        let textHeight: number = 0;
        let baselineOffset: number = 0;
        const spanElement: HTMLSpanElement = document.createElement('span');
        spanElement.innerText = 'm';
        const iframe: HTMLIFrameElement = createElement('iframe') as HTMLIFrameElement;
        document.body.appendChild(iframe);
        const innerHtml: string = '<!DOCTYPE html>'
            + '<html><head></head>'
            + '<body>'
            + '</body>'
            + '</html>';
        if (!isNullOrUndefined(iframe.contentDocument)) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(innerHtml);
            iframe.contentDocument.close();
        }
        this.applyStyle(spanElement, characterFormat, fontToRender);
        const parentDiv: HTMLDivElement = document.createElement('div');
        parentDiv.style.cssText = 'display:inline-block;position:absolute;';
        const tempDiv: HTMLDivElement = document.createElement('div');
        tempDiv.style.cssText = 'display:inline-block;width: 1px; height: 0px;vertical-align: baseline;';
        parentDiv.appendChild(spanElement);
        parentDiv.appendChild(tempDiv);
        iframe.contentDocument.body.appendChild(parentDiv);
        textHeight = spanElement.offsetHeight;
        const textTopVal: number = spanElement.offsetTop;
        const tempDivTopVal: number = tempDiv.offsetTop;
        baselineOffset = tempDivTopVal - textTopVal;
        document.body.removeChild(iframe);
        return { 'Height': textHeight, 'BaselineOffset': baselineOffset };
    }

    public applyStyle(spanElement: HTMLSpanElement, characterFormat: WCharacterFormat, fontToRender: string): void {
        if (!isNullOrUndefined(spanElement) && !isNullOrUndefined(characterFormat)) {
            let style: string = 'white-space:nowrap;';
            if (!isNullOrUndefined(fontToRender) && fontToRender !== '') {
                style += 'font-family:' + fontToRender + ';';
            } else{
                style += 'font-family:' + characterFormat.fontFamily + ';';
            }
            const isBidi: boolean = characterFormat.bidi || characterFormat.complexScript;
            let fontSize: number = isBidi ? characterFormat.fontSizeBidi : characterFormat.fontSize;
            if (fontSize <= 0.5) {
                fontSize = 0.5;
            }
            style += 'font-size:' + fontSize.toString() + 'pt;';
            if (characterFormat.bold) {
                style += 'font-weight:bold;';
            }
            if (characterFormat.italic) {
                style += 'font-style:italic;';
            }
            updateCSSText(spanElement, style);
        }
    }
    /**
     * @private
     * @returns {void}
     */
    public destroy(): void {
        this.documentHelper = undefined;
    }
}
