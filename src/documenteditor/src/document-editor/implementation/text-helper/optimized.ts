import { isNullOrUndefined, createElement, updateCSSText } from '@syncfusion/ej2-base';
import { ExternalFontInfo, WCharacterFormat } from '..';
import { DocumentHelper, FontHeightInfo, FontSizeInfo, TextSizeInfo } from '../viewer';
/**
 *  Class which performs optimized text measuring logic to find font height.
 */
export class Optimized {

    private documentHelper: DocumentHelper;
    /**
     * Font height collection cache object
     */
    private optimizedHeightCollection: FontHeightInfo;

    private getModuleName(): string {
        return 'Optimized';
    }
    /**
     * Constructor to initialize Optimized module.
     *
     * @param {DocumentHelper} documentHelper - the document helper object.
     */
    public constructor(documentHelper: DocumentHelper) {
        this.documentHelper = documentHelper;
        this.optimizedHeightCollection = {};
    }
    /**
     * Construct key based on the character format.
     *
     * @param {WCharacterFormat} characterFormat - the character format to construct key.
     * @returns {string} - the constructed key.
     */
    private getkeyFromCharFormat(characterFormat: WCharacterFormat): string {
        let formatText: string = characterFormat.fontFamily.toLocaleLowerCase();
        if (characterFormat.bold) {
            formatText += ';' + 'bold';
        }
        if (characterFormat.italic) {
            formatText += ';' + 'italic';
        }
        return formatText;
    }

    /**
     * Method to retrieve font information with optimized text measuring logic.
     *
     * @param {WCharacterFormat} characterFormat -character format to apply.
     * @returns {string} - returns font size information.
     */
    private getFontInfo(characterFormat: WCharacterFormat): FontSizeInfo {
        const iframe: HTMLIFrameElement = createElement('iframe') as HTMLIFrameElement;
        document.body.appendChild(iframe);
        let innerHtml: string = '<!DOCTYPE html>'
            + '<html><head></head>'
            + '<body>'
            + '</body>'
            + '</html>';

        const externalFonts: ExternalFontInfo[] = this.documentHelper.owner.externalFonts;
        if (externalFonts && externalFonts.length > 0) {
            externalFonts.forEach((externalFont: ExternalFontInfo) => {
                if (externalFont.src) {
                    innerHtml += '<style>@font-face {font-family: \'' + externalFont.fontFamily + '\'; src: ' + externalFont.src + '; }</style>';
                }
            });
        }
        if (!isNullOrUndefined(iframe.contentDocument)) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(innerHtml);
            iframe.contentDocument.close();
        }

        const container: HTMLDivElement = document.createElement('div');
        const cssText: string = 'position:absolute;top:-1000px;left:-1000px;opacity:0;font-size:0px;line-height:normal';
        updateCSSText(container, cssText);
        // constant tested height value for calculating height factor which matches 90% accuracy with GDI+ value.
        const maxFontHeight: number = 288;
        const factor: number = 1.0 / window.devicePixelRatio;
        container.style.transform = 'scale(' + factor.toString() + ',' + factor.toString() + ')';
        /* eslint-disable-next-line max-len */
        container.innerHTML = '';
        const baselineReferenceSpan: HTMLSpanElement = document.createElement('span');
        baselineReferenceSpan.className = 'e-de-font-info';
        baselineReferenceSpan.style.cssText = 'font-size: 0; font-family: ' + `'${characterFormat.fontFamily}'` + '; display: inline-block;';
        baselineReferenceSpan.textContent = 'm';
        const fontMeasurementSpan: HTMLSpanElement = document.createElement('span');
        fontMeasurementSpan.className = 'e-de-font-info';
        fontMeasurementSpan.style.cssText = 'font-size: ' + maxFontHeight + 'pt; ' +
            'font-family: ' + `'${characterFormat.fontFamily}'` + '; ' +
            (characterFormat.bold ? 'font-weight: bold; ' : '') +
            (characterFormat.italic ? 'font-style: italic; ' : '') +
            'display: inline-block;';
        fontMeasurementSpan.textContent = 'm';
        container.appendChild(baselineReferenceSpan);
        container.appendChild(fontMeasurementSpan);
        iframe.contentDocument.body.appendChild(container);
        /* eslint-disable-next-line max-len */
        const baseLineFactor: number = (container.firstChild as HTMLSpanElement).offsetTop / (container.lastChild as HTMLSpanElement).offsetHeight;
        const heightFactor: number = parseFloat(((container.lastChild as HTMLSpanElement).offsetHeight / maxFontHeight).toFixed(2));
        document.body.removeChild(iframe);
        return {HeightFactor: heightFactor, BaselineFactor: baseLineFactor};
    }

    /**
     * @private
     * @param {WCharacterFormat} characterFormat - character format to apply.
     * @returns {TextSizeInfo} returns text size information.
     */
    public getHeightInternal(characterFormat: WCharacterFormat): TextSizeInfo {
        const key: string = this.getkeyFromCharFormat(characterFormat);
        //With optimized technique, height and baseline factor will be same for each font-family, hence we maintaining cache for the factors and updating height based on font size.
        const isBidi: boolean = characterFormat.bidi || characterFormat.complexScript;
        if (isNullOrUndefined(this.optimizedHeightCollection[`${key}`])) {
            const fontInfo: FontSizeInfo = this.getFontInfo(characterFormat);
            this.optimizedHeightCollection[`${key}`] = fontInfo;
            const fontHeight: number = fontInfo.HeightFactor * (isBidi ? characterFormat.fontSizeBidi : characterFormat.fontSize);
            return { Height: fontHeight, BaselineOffset: fontInfo.BaselineFactor * fontHeight };
        } else {
            const fontSizeInfo: FontSizeInfo = this.optimizedHeightCollection[`${key}`];
            const fontHeight: number = fontSizeInfo.HeightFactor * (isBidi ? characterFormat.fontSizeBidi : characterFormat.fontSize);
            return { Height: fontHeight, BaselineOffset: fontSizeInfo.BaselineFactor * fontHeight };
        }
    }

    /**
     * @private
     * @returns {void}
     */
    public destroy(): void {
        this.documentHelper = undefined;
        this.optimizedHeightCollection = undefined;
    }
}
