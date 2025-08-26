import { ListView } from '@syncfusion/ej2-lists';
import { Button, RadioButton } from '@syncfusion/ej2-buttons';
import { createElement, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DocumentHelper, TabStopListInfo } from '../viewer';
import { SanitizeHtmlHelper } from '@syncfusion/ej2-base';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { HelperMethods } from '../editor/editor-helper';
import { TabJustification, TabLeader } from '../../base/types';
import { WTabStop } from '../format/paragraph-format';

export class TabDialog {
    /**
     * @private
     */
    public documentHelper: DocumentHelper;
    private target: HTMLElement;
    private listviewInstance: ListView;
    private textBoxInput: HTMLInputElement;
    private defaultTabStopIn: any;
    private left: RadioButton;
    private right: RadioButton;
    private center: RadioButton;
    private decimal: RadioButton;
    private bar: RadioButton;
    private none: RadioButton;
    private dotted: RadioButton;
    private single: RadioButton;
    private Hyphen: RadioButton;
    private underscore: RadioButton;
    private setButton: Button;
    private clearButton: Button;
    private clearAllButton: Button;
    private selectedTabStop: TabStopListInfo | { [key: string]: Object };
    private isBarClicked: boolean = false;
    private removedItems: TabStopListInfo[] = [];
    private tabStopList: { [key: string]: Object }[] | TabStopListInfo[] = [];
    private isAddUnits: boolean = true;
    private displayDiv: HTMLElement;
    private localeValue: L10n;

    private commonDiv: HTMLElement;
    private tabStopLabelDiv: HTMLElement;
    private tabStopDiv: HTMLElement;
    private tabListDiv: HTMLElement;
    private textBoxDiv: HTMLElement;
    private listviewDiv: HTMLElement;
    private defaultTablabelDiv: HTMLElement;
    private defaultTabDiv: HTMLElement;
    private defaultTabStopDiv: HTMLElement;
    private defaultTabWarningDiv: HTMLElement;
    private defaultTabStop: HTMLInputElement;
    private alignmentDiv: HTMLElement;
    private alignmentLabelDiv: HTMLElement;
    private alignmentPropertyDiv: HTMLElement;
    private alignmentPropertyDiv1: HTMLElement;
    private leftDiv: HTMLDivElement;
    private leftRadioBtn: HTMLInputElement;
    private decimalDiv: HTMLDivElement;
    private decimalRadioBtn: HTMLInputElement;
    private alignmentPropertyDiv2: HTMLElement;
    private centerDiv: HTMLDivElement;
    private centerRadioBtn: HTMLInputElement;
    private barDiv: HTMLDivElement;
    private barRadioBtn: HTMLInputElement;
    private alignmentPropertyDiv3: HTMLElement;
    private rightDiv: HTMLDivElement;
    private rightRadioBtn: HTMLInputElement;
    private tabLeaderDiv: HTMLElement;
    private tabLeaderLabelDiv: HTMLElement;
    private tabLeaderPropertyDiv: HTMLElement;
    private tabLeaderPropertyDiv1: HTMLElement;
    private noneDiv: HTMLDivElement;
    private noneRadioBtn: HTMLInputElement;
    private underscoreDiv: HTMLDivElement;
    private underscoreRadioBtn: HTMLInputElement;
    private tabLeaderPropertyDiv2: HTMLElement;
    private dottedDiv: HTMLDivElement;
    private dottedRadioBtn: HTMLInputElement;
    private singleDiv: HTMLDivElement;
    private singleRadioBtn: HTMLInputElement;
    private tabLeaderPropertyDiv3: HTMLElement;
    private HyphenDiv: HTMLDivElement;
    private HyphenRadioBtn: HTMLInputElement;
    private buttonDiv: HTMLElement ;
    private tableElement: HTMLTableElement;
    private setbuttonDiv: HTMLElement;
    private setButtonElement: HTMLElement;
    private clearbuttonDiv: HTMLElement;
    private clearButtonElement: HTMLElement;
    private clearAllbuttonDiv: HTMLElement;
    private clearAllButtonElement: HTMLElement;

    private textBoxInputChangeClickHandler: EventListenerOrEventListenerObject = this.onTextBoxInputChangeClick.bind(this);
    private selectHandlerClickHandler: EventListener = this.onSelectHandlerClick.bind(this);
    private setButtonClickHandler: EventListenerOrEventListenerObject = this.onSetButtonClick.bind(this);
    private clearButtonClickHandler: EventListenerOrEventListenerObject = this.onClearButtonClick.bind(this);
    private clearAllButtonClickHandler: EventListenerOrEventListenerObject = this.onClearAllButtonClick.bind(this);

    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    public constructor(documentHelper: DocumentHelper) {
        this.documentHelper = documentHelper;
    }

    private getModuleName(): string {
        return 'TabDialog';
    }

    /**
     * @private
     * @returns {void}
     */
    public applyParagraphFormat = (): void => {
        if (this.defaultTabStopIn.value !== this.documentHelper.defaultTabWidth) {
            this.documentHelper.defaultTabWidth = this.defaultTabStopIn.value;
        }
        if (this.removedItems.length > 0) {
            const values: WTabStop[] = [];
            for (let i: number = 0; i < this.removedItems.length; i++) {
                values.push(this.removedItems[parseInt(i.toString(), 10)].value as WTabStop);
            }
            this.documentHelper.owner.editorModule.removeTabStops(this.documentHelper.selection.getParagraphsInSelection(), values);
        }
        const tab: WTabStop = !isNullOrUndefined(this.selectedTabStop) ? this.selectedTabStop.value as WTabStop : new WTabStop();
        tab.deletePosition = 0;
        tab.tabJustification = this.getTabAlignmentValue();
        tab.tabLeader = this.getTabLeaderValue();
        const values: WTabStop[] = [];
        for (let i: number = 0; i < this.tabStopList.length; i++) {
            values.push(this.tabStopList[parseInt(i.toString(), 10)].value as WTabStop);
        }
        if (isNullOrUndefined(this.selectedTabStop)) {
            const value: number = HelperMethods.getNumberFromString(this.textBoxInput.value);
            if (value.toString() !== 'NaN') {
                tab.position = value;
                values.push(tab);
            }
        }
        this.documentHelper.owner.editorModule.onApplyParagraphFormat('tabStop', values, false, false);
        this.closeTabDialog();
    }
    private onTextBoxInputChangeClick(args: any): void {
        this.textBoxInputChange(args);
    }
    private textBoxInputChange = (args: any) => {
        const value: number = HelperMethods.getNumberFromString(this.textBoxInput.value);
        for (let i: number = 0; i < this.tabStopList.length; i++) {
            const tabValue: number = HelperMethods.getNumberFromString(this.tabStopList[parseInt(i.toString(), 10)].displayText as string);
            if (tabValue === value) {
                this.selectedTabStop = this.tabStopList[parseInt(i.toString(), 10)];
                break;
            } else {
                this.selectedTabStop = undefined;
            }
        }
        this.isAddUnits = false;
        const index: number = (this.listviewInstance.dataSource as { [key: string]: Object }[]).indexOf(
            this.selectedTabStop as { [key: string]: Object });
        const item: { [key: string]: Object } = index >= 0 ? this.listviewInstance.dataSource[parseInt(index.toString(), 10)] : undefined;
        this.listviewInstance.selectItem(item);
        this.isAddUnits = true;
    }

    private onSetButtonClick(args: any): void {
        this.setButtonClick(args);
    }
    private setButtonClick = (args: any): void => {
        if (!isNullOrUndefined(this.selectedTabStop)) {
            const value: WTabStop = this.selectedTabStop.value as WTabStop;
            value.tabJustification = this.getTabAlignmentValue();
            value.tabLeader = this.getTabLeaderValue();
        } else {
            const value: number = parseFloat(HelperMethods.getNumberFromString(this.textBoxInput.value).toFixed(2));
            if (value.toString() === 'NaN') {
                return;
            }
            const tabStop: WTabStop = new WTabStop();
            tabStop.position = value;
            tabStop.tabJustification = this.getTabAlignmentValue();
            tabStop.tabLeader = this.getTabLeaderValue();
            tabStop.deletePosition = 0;
            const tempCollection: WTabStop[] = [];
            for (let i: number = 0; i < this.tabStopList.length; i++) {
                tempCollection.push(this.tabStopList[parseInt(i.toString(), 10)].value as WTabStop);
            }
            const index: number = this.documentHelper.owner.editorModule.addTabStopToCollection(tempCollection, tabStop, true);
            const tabStopListObj: TabStopListInfo = { 'displayText': parseFloat(value.toFixed(2)) + ' pt', 'value': tabStop};
            this.tabStopList.splice(index, 0, tabStopListObj);
            this.selectedTabStop = tabStopListObj;
            this.listviewInstance.dataSource = this.tabStopList as { [key: string]: Object }[];
            this.listviewInstance.refresh();
            this.listviewInstance.selectItem(this.selectedTabStop as any);
        }
    }
    private onClearAllButtonClick(args: any): void {
        this.clearAllButtonClick(args);
    }
    private clearAllButtonClick = (args: any) => {
        for (let i: number = 0; i < this.tabStopList.length; i++) {
            this.removedItems.push(this.tabStopList[parseInt(i.toString(), 10)] as TabStopListInfo);
        }
        this.displayDiv.innerText = this.localeValue.getConstant('All');
        this.tabStopList = [];
        this.listviewInstance.dataSource = [];
        this.listviewInstance.refresh();
        this.selectedTabStop = undefined;
        this.textBoxInput.value = '';
        this.updateButtons();
    }
    private onClearButtonClick(args: any): void {
        this.clearButtonClick(args);
    }
    private clearButtonClick = (args: any) => {
        this.removedItems.push(this.selectedTabStop as TabStopListInfo);
        if (this.displayDiv.innerText !== this.localeValue.getConstant('All')) {
            if (this.displayDiv.innerText !== '') {
                this.displayDiv.innerText += ', ';
            }
            this.displayDiv.innerText += (this.selectedTabStop as TabStopListInfo).displayText;
        }
        const index: number = (this.tabStopList as TabStopListInfo[]).indexOf(this.selectedTabStop as TabStopListInfo);

        if (index === this.tabStopList.length - 1) {
            this.tabStopList.splice(index, 1);
            this.selectedTabStop = this.tabStopList[index - 1];
        } else if (this.tabStopList.length === 0) {
            this.selectedTabStop = undefined;
        } else {
            this.tabStopList.splice(index, 1);
            this.selectedTabStop = this.tabStopList[parseInt(index.toString(), 10)];
        }
        this.listviewInstance.refresh();
        if (!isNullOrUndefined(this.selectedTabStop)) {
            this.textBoxInput.value = !isNullOrUndefined(this.selectedTabStop) && this.tabStopList.length > 0 ? (this.selectedTabStop.displayText as string) : '';
        } else {
            this.textBoxInput.value = '';
        }
        this.updateButtons();
    }

    /**
     * @private
     * @returns {void}
     */
    public closeTabDialog = (): void => {
        this.documentHelper.hideDialog();
    };

    /* eslint-disable */
    /**
     * @private
     * @param {L10n} locale - Specifies the locale.
     * @param {boolean} enableRtl - Specifies is rtl.
     * @returns {void}
     */
    public initTabsDialog(localeValue: L10n, enableRtl: boolean) {
        let ownerId: string = this.documentHelper.owner.containerId;
        this.target = createElement('div', { id: ownerId + '_tab', className: 'e-de-tab' });

        this.commonDiv = createElement('div', { className: 'e-de-container-row' });
        this.target.appendChild(this.commonDiv);

        this.tabStopLabelDiv = createElement('div', { innerHTML: localeValue.getConstant('Tab stop position') + ':', className: 'e-de-para-dlg-heading' });

        this.tabStopDiv = createElement('div', { className: 'e-de-subcontainer-left' });
        this.tabStopDiv.appendChild(this.tabStopLabelDiv);
        this.tabListDiv = createElement('div', { className: 'e-tab-list' });
        this.tabStopDiv.appendChild(this.tabListDiv);
        if (enableRtl) {
            this.tabListDiv.classList.add('e-de-rtl');
        }
        this.textBoxDiv = createElement('div', { className: 'e-bookmark-textboxdiv' });
        this.tabListDiv.appendChild(this.textBoxDiv);

        this.textBoxInput = createElement('input', { className: 'e-input e-tab-textbox-input', attrs: { autofocus: 'true' } }) as HTMLInputElement;
        this.textBoxInput.setAttribute('type', 'text');
        this.textBoxInput.setAttribute('aria-label', localeValue.getConstant('Tab stop position'));
        this.textBoxDiv.appendChild(this.textBoxInput);
        this.textBoxDiv.addEventListener('keyup', this.textBoxInputChangeClickHandler);
        this.textBoxInput.value = !isNullOrUndefined(this.tabStopList) && this.tabStopList.length > 0 ? this.tabStopList[0].displayText as string : '';

        this.listviewDiv = createElement('div', { className: 'e-tab-listViewDiv', attrs: { tabindex: '-1' } });
        this.listviewDiv.setAttribute('aria-label', localeValue.getConstant('TabMarkList'));
        this.tabListDiv.appendChild(this.listviewDiv);

        this.listviewInstance = new ListView({
            dataSource: this.tabStopList as { [key: string]: Object }[],
            fields: { text: 'displayText' },
            cssClass: 'e-bookmark-listview'
        });
        this.listviewInstance.appendTo(this.listviewDiv);
        this.listviewInstance.addEventListener('select', this.selectHandlerClickHandler);

        this.commonDiv.appendChild(this.tabStopDiv);

        this.defaultTablabelDiv = createElement('div', { innerHTML: localeValue.getConstant('Default tab stops') + ':', className: 'e-de-para-dlg-heading' });

        this.defaultTabDiv = createElement('div', { className: 'e-de-subcontainer-right' });
        
        this.commonDiv.appendChild(this.defaultTabDiv);
        this.defaultTabStopDiv = createElement('div', { className: 'e-de-dlg-container' });
        this.defaultTabStop = createElement('input', { attrs: { 'type': 'text' } }) as HTMLInputElement;
        this.defaultTabStopDiv.appendChild(this.defaultTablabelDiv);
        this.defaultTabStopDiv.appendChild(this.defaultTabStop);
        this.defaultTabDiv.appendChild(this.defaultTabStopDiv);

        this.defaultTabStopIn = new NumericTextBox({
            format: '# pt', value: this.documentHelper.defaultTabWidth, min: 0, max: 1584, step: 1, enablePersistence: false, placeholder: localeValue.getConstant('Default tab stops'),
            //change: this.changeDefaultTabStop,
            //focus: this.focusDefaultTabStop,
            //blur: this.blurDefaultTabStop,
        });
        this.defaultTabStopIn.appendTo(this.defaultTabStop);

        this.defaultTabWarningDiv = createElement('div', { innerHTML: localeValue.getConstant('Tab stops to be cleared') + ':', className: 'e-de-dlg-container' });
        this.defaultTabDiv.appendChild(this.defaultTabWarningDiv);

        this.displayDiv = createElement('div', { className: 'e-defaultTablabelDiv' });
        if (this.documentHelper.owner.enableRtl) {
            this.displayDiv.style.marginRight = '20px';
        } else {
            this.displayDiv.style.marginLeft = '20px';
        }
        this.defaultTabDiv.appendChild(this.displayDiv);

        this.alignmentDiv = createElement('div', { className: 'e-de-dlg-container' });
        this.target.appendChild(this.alignmentDiv);
        this.alignmentLabelDiv = createElement('div', { innerHTML: localeValue.getConstant('Alignment') + ':', className: 'e-de-para-dlg-heading' });
        this.alignmentDiv.appendChild(this.alignmentLabelDiv);

        this.alignmentPropertyDiv = createElement('div', { styles: 'display: flex;' });
        this.alignmentDiv.appendChild(this.alignmentPropertyDiv);
        this.alignmentPropertyDiv1 = createElement('div', { styles: 'display: flex; flex-direction: column; width: 33.33%' });
        this.leftDiv = createElement('div') as HTMLDivElement;
        this.leftRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.decimalDiv = createElement('div') as HTMLDivElement;
        this.decimalRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });


        this.leftDiv.appendChild(this.leftRadioBtn);
        this.decimalDiv.appendChild(this.decimalRadioBtn);
        this.alignmentPropertyDiv1.appendChild(this.leftDiv);
        this.alignmentPropertyDiv1.appendChild(this.decimalDiv);

        this.alignmentPropertyDiv.appendChild(this.alignmentPropertyDiv1);

        this.left = new RadioButton({ label: localeValue.getConstant('Left'), name: 'alignment', value: 'left', cssClass: 'e-small', checked: true, enableRtl: enableRtl, change: this.onTabAlignmentButtonClick });
        this.decimal = new RadioButton({ label: localeValue.getConstant('Decimal'), name: 'alignment', value: 'decimal', cssClass: 'e-small', enableRtl: enableRtl, change: this.onTabAlignmentButtonClick });

        this.left.appendTo(this.leftRadioBtn);
        this.decimal.appendTo(this.decimalRadioBtn);

        this.leftRadioBtn.setAttribute('aria-label', localeValue.getConstant('Left'));
        this.decimalRadioBtn.setAttribute('aria-label', localeValue.getConstant('Decimal'));

        this.alignmentPropertyDiv2 = createElement('div', { styles: 'display: flex; flex-direction: column; width: 33.33%' });
        this.centerDiv = createElement('div') as HTMLDivElement;
        this.centerRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.barDiv = createElement('div') as HTMLDivElement;
        this.barRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });

        this.barDiv.appendChild(this.barRadioBtn);
        this.centerDiv.appendChild(this.centerRadioBtn);
        this.alignmentPropertyDiv2.appendChild(this.centerDiv);
        this.alignmentPropertyDiv2.appendChild(this.barDiv);

        this.bar = new RadioButton({ label: localeValue.getConstant('Bar'), name: 'alignment', value: 'bar', cssClass: 'e-small', enableRtl: enableRtl, change: this.onBarClick });
        this.center = new RadioButton({ label: localeValue.getConstant('Center'), name: 'alignment', value: 'center', cssClass: 'e-small', enableRtl: enableRtl, change: this.onTabAlignmentButtonClick });
        this.bar.appendTo(this.barRadioBtn);
        this.center.appendTo(this.centerRadioBtn);

        this.barRadioBtn.setAttribute('aria-label', localeValue.getConstant('Bar'));
        this.centerRadioBtn.setAttribute('aria-label', localeValue.getConstant('Center'));
        this.alignmentPropertyDiv.appendChild(this.alignmentPropertyDiv2);

        this.alignmentPropertyDiv3 = createElement('div', { styles: 'display: flex; flex-direction: column;width: 33.33%' });
        this.rightDiv = createElement('div') as HTMLDivElement;
        this.rightRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.rightDiv.appendChild(this.rightRadioBtn);
        this.alignmentPropertyDiv3.appendChild(this.rightDiv);
        this.right = new RadioButton({ label: localeValue.getConstant('Right'), name: 'alignment', value: 'right', cssClass: 'e-small', enableRtl: enableRtl, change: this.onTabAlignmentButtonClick });
        this.right.appendTo(this.rightRadioBtn);
        this.rightRadioBtn.setAttribute('aria-label', localeValue.getConstant('Right'));

        this.alignmentPropertyDiv.appendChild(this.alignmentPropertyDiv3);

        this.tabLeaderDiv = createElement('div', { className: 'e-de-dlg-container' });

        this.tabLeaderLabelDiv = createElement('div', { innerHTML: localeValue.getConstant('Leader') + ':', className: 'e-de-para-dlg-heading' });
        this.tabLeaderDiv.appendChild(this.tabLeaderLabelDiv);
        this.target.appendChild(this.tabLeaderDiv);

        this.tabLeaderPropertyDiv = createElement('div', { styles: 'display: flex;' });
        this.tabLeaderDiv.appendChild(this.tabLeaderPropertyDiv);

        this.tabLeaderPropertyDiv1 = createElement('div', { styles: 'display: flex; flex-direction: column; width: 33.33%' });

        this.noneDiv = createElement('div') as HTMLDivElement;
        this.noneRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.underscoreDiv = createElement('div') as HTMLDivElement;
        this.underscoreRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.noneDiv.appendChild(this.noneRadioBtn);
        this.underscoreDiv.appendChild(this.underscoreRadioBtn);
        this.tabLeaderPropertyDiv1.appendChild(this.noneDiv);
        this.tabLeaderPropertyDiv1.appendChild(this.underscoreDiv);

        this.none = new RadioButton({ label: '1 ' + localeValue.getConstant('None'), name: 'tabLeader', value: 'none', cssClass: 'e-small', checked: true, enableRtl: enableRtl });
        this.underscore = new RadioButton({ label: '4 _____', name: 'tabLeader', value: 'underscore', cssClass: 'e-small', enableRtl: enableRtl });

        this.none.appendTo(this.noneRadioBtn);
        this.underscore.appendTo(this.underscoreRadioBtn);

        this.tabLeaderPropertyDiv.appendChild(this.tabLeaderPropertyDiv1);

        this.tabLeaderPropertyDiv2 = createElement('div', { styles: 'display: flex; flex-direction: column; width: 33.33%' });

        this.dottedDiv = createElement('div') as HTMLDivElement;
        this.dottedRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });
        this.singleDiv = createElement('div') as HTMLDivElement;
        this.singleRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });

        this.dottedDiv.appendChild(this.dottedRadioBtn);
        this.singleDiv.appendChild(this.singleRadioBtn);
        this.dotted = new RadioButton({ label: '2 .......', name: 'tabLeader', value: 'dotted', cssClass: 'e-small', enableRtl: enableRtl });
        this.single = new RadioButton({ label: '5 -------', name: 'tabLeader', value: 'single', cssClass: 'e-small', enableRtl: enableRtl });
        this.dotted.appendTo(this.dottedRadioBtn);
        this.single.appendTo(this.singleRadioBtn);

        this.tabLeaderPropertyDiv2.appendChild(this.dottedDiv);
        this.tabLeaderPropertyDiv2.appendChild(this.singleDiv);
        this.tabLeaderPropertyDiv.appendChild(this.tabLeaderPropertyDiv2);

        this.tabLeaderPropertyDiv3 = createElement('div', { styles: 'display: flex; flex-direction: column; width: 33.33%' });

        this.HyphenDiv = createElement('div') as HTMLDivElement;
        this.HyphenRadioBtn = <HTMLInputElement>createElement('input', {
            attrs: { 'type': 'radiobutton' }
        });

        this.HyphenDiv.appendChild(this.HyphenRadioBtn);
        this.tabLeaderPropertyDiv3.appendChild(this.HyphenDiv);
        this.Hyphen = new RadioButton({ label: '3 -------', name: 'tabLeader', value: 'hyphen', cssClass: 'e-small', enableRtl: enableRtl });
        this.Hyphen.appendTo(this.HyphenRadioBtn);

        this.tabLeaderPropertyDiv.appendChild(this.tabLeaderPropertyDiv3);

        this.buttonDiv = createElement('div', { className: 'e-de-tab-button', styles: 'display: flex;' });
        this.target.appendChild(this.buttonDiv);
        this.tableElement = createElement('table') as HTMLTableElement;
        this.buttonDiv.appendChild(this.tableElement);
        this.tableElement.style.width = '100%';
        let row: HTMLTableRowElement = this.tableElement.insertRow();
        let cell: HTMLTableCellElement = row.insertCell();
        this.setbuttonDiv = createElement('div', { className: 'e-de-tab-setBtn' });
        this.buttonDiv.appendChild(this.setbuttonDiv);
        this.setButtonElement = createElement('button', {
            innerHTML: localeValue.getConstant('Set'),
            attrs: { type: 'button' }
        });
        this.setButtonElement.setAttribute('aria-label', localeValue.getConstant('Set'));
        this.setbuttonDiv.appendChild(this.setButtonElement);
        this.setButton = new Button({ cssClass: 'e-button-custom' });
        this.setButton.appendTo(this.setButtonElement);
        cell.appendChild(this.setbuttonDiv);
        this.setButtonElement.addEventListener('click', this.setButtonClickHandler);
        
        //setButtonElement.addEventListener('click', this.setTabStop);

        cell.style.width = '33.33%';
        cell.style.display = 'table-cell';
        cell = row.insertCell();
        this.clearbuttonDiv = createElement('div', { className: 'e-de-tab-clearBtn' });
        this.buttonDiv.appendChild(this.clearbuttonDiv);
        this.clearButtonElement = createElement('button', {
            innerHTML: localeValue.getConstant('Clear'),
            attrs: { type: 'button' }
        });
        this.clearButtonElement.setAttribute('aria-label', localeValue.getConstant('Clear'));
        this.clearbuttonDiv.appendChild(this.clearButtonElement);
        this.clearButton = new Button({ cssClass: 'e-button-custom' });
        this.clearButton.appendTo(this.clearButtonElement);
        this.clearButtonElement.addEventListener('click', this.clearButtonClickHandler);

        //clearButtonElement.addEventListener('click', this.clearTabStop);
        cell.appendChild(this.clearbuttonDiv);

        cell.style.width = '33.33%';
        cell.style.display = 'table-cell';
        cell = row.insertCell();
        this.clearAllbuttonDiv = createElement('div', { className: 'e-de-tab-clearAllBtn' });
        this.buttonDiv.appendChild(this.clearAllbuttonDiv);
        this.clearAllButtonElement = createElement('button', {
            innerHTML: localeValue.getConstant('Clear All'),
            attrs: { type: 'button' }
        });
        this.clearAllButtonElement.setAttribute('aria-label', localeValue.getConstant('Clear All'));
        this.clearAllbuttonDiv.appendChild(this.clearAllButtonElement);
        this.clearAllButton = new Button({ cssClass: 'e-button-custom' });
        this.clearAllButton.appendTo(this.clearAllButtonElement);
        this.clearAllButtonElement.addEventListener('click', this.clearAllButtonClickHandler);

        //clearButtonElement.addEventListener('click', this.clearTabStop);
        cell.appendChild(this.clearAllbuttonDiv);
        cell.style.width = '33.33%';
        cell.style.display = 'table-cell';

        this.selectedTabStop = !isNullOrUndefined(this.tabStopList) && this.tabStopList.length > 0 ? this.tabStopList[0] as TabStopListInfo : undefined;
        this.updateButtons();
    }

    private getTabAlignmentValue(): TabJustification {
        if (this.left.checked) {
            return 'Left';
        } else if (this.center.checked) {
            return 'Center';
        } else if (this.right.checked) {
            return 'Right';
        } else if (this.decimal.checked) {
            return 'Decimal';
        } else if (this.bar.checked) {
            return 'Bar';
        }
        return 'Left';
    }
    private getTabLeaderValue(): TabLeader {
        if (this.none.checked) {
            return 'None';
        } else if (this.dotted.checked) {
            return 'Dot';
        } else if (this.Hyphen.checked) {
            return 'Hyphen';
        } else if (this.underscore.checked) {
            return 'Underscore';
        } else if (this.single.checked) {
            return 'Single';
        }
        return 'None';
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    private onSelectHandlerClick(args: any): void {
        this.selectHandler(args);
    }
    private selectHandler = (args: any): void => {
        if (this.isAddUnits) {
            this.focusTextBox(args.text);
        }
        this.selectedTabStop = args.data;
        if (!isNullOrUndefined(this.selectedTabStop) && (this.selectedTabStop.value as WTabStop).tabJustification === 'Bar') {
            this.isBarClicked = true;
        }
        this.updateButtons();
    };
    private updateButtons(): void {
        if (!isNullOrUndefined(this.selectedTabStop)) {
            this.updateTabAlignmentButton((this.selectedTabStop.value as WTabStop).tabJustification);
            this.updateTabLeaderButton((this.selectedTabStop.value as WTabStop).tabLeader);
        } else {
            this.updateTabAlignmentButton('Left');
            this.updateTabLeaderButton('None');
        }
    }
    private onBarClick = (args: any): void => {
        this.clearTabLeaderButton();
        this.disableOrEnableTabLeaderButton(true);
        this.isBarClicked = true;
    }
    private onTabAlignmentButtonClick = (args: any): void => {
        this.disableOrEnableTabLeaderButton(false);
        if (this.isBarClicked) {
            this.updateTabLeaderButton('None');
            this.isBarClicked = false;
        }
    }
    private updateTabLeaderButton(value: TabLeader): void {
        this.clearTabLeaderButton();
        if (this.getTabAlignmentValue() === 'Bar') {
            return;
        }
        switch (value) {
            case 'None':
                this.none.checked = true;
                break;
            case 'Single':
                this.single.checked = true;
                break;
            case 'Dot':
                this.dotted.checked = true;
                break;
            case 'Hyphen':
                this.Hyphen.checked = true;
                break;
            case 'Underscore':
                this.underscore.checked = true;
                break;
            default:
                this.none.checked = true;
                break;
        }
    }
    private updateTabAlignmentButton(value: TabJustification): void {
        this.clearTabAlignmentButton();
        switch (value) {
            case 'Left':
                this.left.checked = true;
                break;
            case 'Center':
                this.center.checked = true;
                break;
            case 'Right':
                this.right.checked = true;
                break;
            case 'Decimal':
                this.decimal.checked = true;
                break;
            case 'Bar':
                this.bar.checked = true;
                this.clearTabLeaderButton();
                this.disableOrEnableTabLeaderButton(true);
                return;
            default:
                break;
        }
        this.disableOrEnableTabLeaderButton(false);
    }
    private clearTabLeaderButton(): void {
        this.none.checked = false;
        this.single.checked = false;
        this.dotted.checked = false;
        this.Hyphen.checked = false;
        this.underscore.checked = false;
    }
    private disableOrEnableTabLeaderButton(isDisable: boolean): void {
        this.none.disabled = isDisable;
        this.single.disabled = isDisable;
        this.dotted.disabled = isDisable;
        this.Hyphen.disabled = isDisable;
        this.underscore.disabled = isDisable;
    }
    private clearTabAlignmentButton(): void {
        this.left.checked = false;
        this.center.checked = false;
        this.right.checked = false;
        this.decimal.checked = false;
        this.bar.checked = false;
    }
    private focusTextBox(text: string): void {
        (this.textBoxInput as HTMLInputElement).value = text;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const value: any = this.textBoxInput;
        value.setSelectionRange(0, (text as string).length);
        value.focus();
    }

    /**
     * @private
     * @returns {void}
     */
    public show(): void {
        const localObj: L10n = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localObj.setLocale(this.documentHelper.owner.locale);
        this.localeValue = localObj;
        let tabs: WTabStop[] = this.documentHelper.owner.editorModule.getTabsInSelection();
        this.tabStopList = [];
        for (let i = 0; i < tabs.length; i++) {
            let value: string = parseFloat((tabs[i].position).toFixed(2)) + ' pt';
            let objectValue = { 'displayText': value, 'value': tabs[i].clone() };
            this.tabStopList.push(objectValue);
        }
        this.initTabsDialog(localObj, this.documentHelper.owner.enableRtl);
        this.documentHelper.dialog.header = localObj.getConstant('Tabs');
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = 'auto';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.beforeOpen = this.documentHelper.updateFocus;
        this.documentHelper.dialog.close = this.documentHelper.updateFocus;
        this.documentHelper.dialog.buttons = [{
            click: this.applyParagraphFormat,
            buttonModel: { content: localObj.getConstant('Ok'), cssClass: 'e-flat e-para-okay', isPrimary: true }
        },
        {
            click: this.closeTabDialog,
            buttonModel: { content: localObj.getConstant('Cancel'), cssClass: 'e-flat e-para-cancel' }
        }
        ];
        this.documentHelper.dialog.show();
    }

    /**
     * @private
     * @returns {void}
     */
    public destroy(): void {
        this.removeEvents();
        this.removeElements();
        this.target = undefined;
        this.textBoxInput = undefined;
        this.defaultTabStopIn = undefined;
        this.left = undefined;
        this.right = undefined;
        this.center = undefined;
        this.decimal = undefined;
        this.bar = undefined;
        this.none = undefined;
        this.dotted = undefined;
        this.single = undefined;
        this.Hyphen = undefined;
        this.setButton = undefined;
        this.clearButton = undefined;
        this.clearAllButton = undefined;
        if (this.listviewInstance) {
            this.listviewInstance.destroy();
            this.listviewInstance = undefined;
        }
        this.selectedTabStop = undefined;
        this.isBarClicked = undefined;
        this.removedItems = undefined;
        this.tabStopList = undefined;
        this.localeValue = undefined;
    }
    private removeEvents(): void {
        if (this.textBoxDiv) {
            this.textBoxDiv.removeEventListener('keyup', this.textBoxInputChangeClickHandler);
        }
        if (this.setButtonElement) {
            this.setButtonElement.removeEventListener('click', this.setButtonClickHandler);
        }
        if (this.clearButtonElement) {
            this.clearButtonElement.removeEventListener('click', this.clearButtonClickHandler);
        }
        if (this.clearAllButtonElement) {
            this.clearAllButtonElement.removeEventListener('click', this.clearAllButtonClickHandler);
        }
        if (this.listviewInstance) {
            this.listviewInstance.removeEventListener('select', this.selectHandlerClickHandler);
        }
    }
    private removeElements(): void {
        if (this.commonDiv) {
            this.commonDiv.remove();
            this.commonDiv = undefined;
        }
        if (this.tabStopLabelDiv) {
            this.tabStopLabelDiv.remove();
            this.tabStopLabelDiv = undefined;
        }
        if (this.tabStopDiv) {
            this.tabStopDiv.remove();
            this.tabStopDiv = undefined;
        }
        if (this.tabListDiv) {
            this.tabListDiv.remove();
            this.tabListDiv = undefined;
        }
        if (this.textBoxDiv) {
            this.textBoxDiv.remove();
            this.textBoxDiv = undefined;
        }
        if (this.listviewDiv) {
            this.listviewDiv.remove();
            this.listviewDiv = undefined;
        }
        if (this.defaultTablabelDiv) {
            this.defaultTablabelDiv.remove();
            this.defaultTablabelDiv = undefined;
        }
        if (this.defaultTabDiv) {
            this.defaultTabDiv.remove();
            this.defaultTabDiv = undefined;
        }
        if (this.defaultTabStopDiv) {
            this.defaultTabStopDiv.remove();
            this.defaultTabStopDiv = undefined;
        }
        if (this.defaultTabWarningDiv) {
            this.defaultTabWarningDiv.remove();
            this.defaultTabWarningDiv = undefined;
        }
        if (this.defaultTabStop) {
            this.defaultTabStop.remove();
            this.defaultTabStop = undefined;
        }
        if (this.displayDiv) {
            this.displayDiv.remove();
            this.displayDiv = undefined;
        }
        if (this.alignmentDiv) {
            this.alignmentDiv.remove();
            this.alignmentDiv = undefined;
        }
        if (this.alignmentLabelDiv) {
            this.alignmentLabelDiv.remove();
            this.alignmentLabelDiv = undefined;
        }
        if (this.alignmentPropertyDiv) {
            this.alignmentPropertyDiv.remove();
            this.alignmentPropertyDiv = undefined;
        }
        if (this.alignmentPropertyDiv1) {
            this.alignmentPropertyDiv1.remove();
            this.alignmentPropertyDiv1 = undefined;
        }
        if (this.leftDiv) {
            this.leftDiv.remove();
            this.leftDiv = undefined;
        }
        if (this.leftRadioBtn) {
            this.leftRadioBtn.remove();
            this.leftRadioBtn = undefined;
        }
        if (this.decimalDiv) {
            this.decimalDiv.remove();
            this.decimalDiv = undefined;
        }
        if (this.decimalRadioBtn) {
            this.decimalRadioBtn.remove();
            this.decimalRadioBtn = undefined;
        }
        if (this.alignmentPropertyDiv2) {
            this.alignmentPropertyDiv2.remove();
            this.alignmentPropertyDiv2 = undefined;
        }
        if (this.centerDiv) {
            this.centerDiv.remove();
            this.centerDiv = undefined;
        }
        if (this.centerRadioBtn) {
            this.centerRadioBtn.remove();
            this.centerRadioBtn = undefined;
        }
        if (this.barDiv) {
            this.barDiv.remove();
            this.barDiv = undefined;
        }
        if (this.barRadioBtn) {
            this.barRadioBtn.remove();
            this.barRadioBtn = undefined;
        }
        if (this.alignmentPropertyDiv3) {
            this.alignmentPropertyDiv3.remove();
            this.alignmentPropertyDiv3 = undefined;
        }
        if (this.rightDiv) {
            this.rightDiv.remove();
            this.rightDiv = undefined;
        }
        if (this.rightRadioBtn) {
            this.rightRadioBtn.remove();
            this.rightRadioBtn = undefined;
        }
        if (this.tabLeaderDiv) {
            this.tabLeaderDiv.remove();
            this.tabLeaderDiv = undefined;
        }
        if (this.tabLeaderLabelDiv) {
            this.tabLeaderLabelDiv.remove();
            this.tabLeaderLabelDiv = undefined;
        }
        if (this.tabLeaderPropertyDiv) {
            this.tabLeaderPropertyDiv.remove();
            this.tabLeaderPropertyDiv = undefined;
        }
        if (this.tabLeaderPropertyDiv1) {
            this.tabLeaderPropertyDiv1.remove();
            this.tabLeaderPropertyDiv1 = undefined;
        }
        if (this.noneDiv) {
            this.noneDiv.remove();
            this.noneDiv = undefined;
        }
        if (this.noneRadioBtn) {
            this.noneRadioBtn.remove();
            this.noneRadioBtn = undefined;
        }
        if (this.underscoreDiv) {
            this.underscoreDiv.remove();
            this.underscoreDiv = undefined;
        }
        if (this.underscoreRadioBtn) {
            this.underscoreRadioBtn.remove();
            this.underscoreRadioBtn = undefined;
        }
        if (this.tabLeaderPropertyDiv2) {
            this.tabLeaderPropertyDiv2.remove();
            this.tabLeaderPropertyDiv2 = undefined;
        }
        if (this.dottedDiv) {
            this.dottedDiv.remove();
            this.dottedDiv = undefined;
        }
        if (this.dottedRadioBtn) {
            this.dottedRadioBtn.remove();
            this.dottedRadioBtn = undefined;
        }
        if (this.singleDiv) {
            this.singleDiv.remove();
            this.singleDiv = undefined;
        }
        if (this.singleRadioBtn) {
            this.singleRadioBtn.remove();
            this.singleRadioBtn = undefined;
        }
        if (this.tabLeaderPropertyDiv3) {
            this.tabLeaderPropertyDiv3.remove();
            this.tabLeaderPropertyDiv3 = undefined;
        }
        if (this.HyphenDiv) {
            this.HyphenDiv.remove();
            this.HyphenDiv = undefined;
        }
        if (this.HyphenRadioBtn) {
            this.HyphenRadioBtn.remove();
            this.HyphenRadioBtn = undefined;
        }
        if (this.buttonDiv) {
            this.buttonDiv.remove();
            this.buttonDiv = undefined;
        }
        if (this.tableElement) {
            this.tableElement.remove();
            this.tableElement = undefined;
        }
        if (this.setbuttonDiv) {
            this.setbuttonDiv.remove();
            this.setbuttonDiv = undefined;
        }
        if (this.setButtonElement) {
            this.setButtonElement.remove();
            this.setButtonElement = undefined;
        }
        if (this.setButton) {
            this.setButton.destroy();
            this.setButton = undefined;
        }
        if (this.clearbuttonDiv) {
            this.clearbuttonDiv.remove();
            this.clearbuttonDiv = undefined;
        }
        if (this.clearButtonElement) {
            this.clearButtonElement.remove();
            this.clearButtonElement = undefined;
        }
        if (this.clearButton) {
            this.clearButton.destroy();
            this.clearButton = undefined;
        }
        if (this.clearAllbuttonDiv) {
            this.clearAllbuttonDiv.remove();
            this.clearAllbuttonDiv = undefined;
        }
        if (this.clearAllButtonElement) {
            this.clearAllButtonElement.remove();
            this.clearAllButtonElement = undefined;
        }
        if (this.clearAllButton) {
            this.clearAllButton.destroy();
            this.clearAllButton = undefined;
        }

        if (this.textBoxInput) {
            this.textBoxInput.remove();
            this.textBoxInput = undefined;
        }
    }
}