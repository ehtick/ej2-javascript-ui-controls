import { Spreadsheet, DialogBeforeOpenEventArgs, ICellRenderer, completeAction, isLockedCells } from '../index';
import { initiateHyperlink, locale, dialog, click, keyUp, createHyperlinkElement, getUpdateUsingRaf, focus, readonlyAlert, removeElements, isValidUrl, editOperation } from '../common/index';
import { editHyperlink, openHyperlink, editAlert, removeHyperlink } from '../common/index';
import { L10n, isNullOrUndefined, closest } from '@syncfusion/ej2-base';
import { Dialog } from '../services';
import { SheetModel } from '../../workbook/base/sheet-model';
import { getRangeIndexes, getCellIndexes, getRangeAddress } from '../../workbook/common/address';
import { CellModel, HyperlinkModel, BeforeHyperlinkArgs, AfterHyperlinkArgs, getTypeFromFormat, getCell, CellStyleModel, isReadOnlyCells, checkIsFormula } from '../../workbook/index';
import { beforeHyperlinkClick, afterHyperlinkClick, refreshRibbonIcons, deleteHyperlink, beginAction } from '../../workbook/common/event';
import { isCellReference, DefineNameModel, updateCell, isImported } from '../../workbook/index';
import { Tab, TreeView } from '@syncfusion/ej2-navigations';
import { BeforeOpenEventArgs } from '@syncfusion/ej2-popups';

/**
 * `Hyperlink` module
 */
export class SpreadsheetHyperlink {
    private parent: Spreadsheet;

    /**
     * Constructor for Hyperlink module.
     *
     * @param {Spreadsheet} parent - Constructor for Hyperlink module.
     */
    constructor(parent: Spreadsheet) {
        this.parent = parent;
        this.addEventListener();
    }

    /**
     * To destroy the Hyperlink module.
     *
     * @returns {void} - To destroy the Hyperlink module.
     */
    protected destroy(): void {
        this.removeEventListener();
        this.parent = null;
    }

    private addEventListener(): void {
        this.parent.on(initiateHyperlink, this.initiateHyperlinkHandler, this);
        this.parent.on(editHyperlink, this.editHyperlinkHandler, this);
        this.parent.on(openHyperlink, this.openHyperlinkHandler, this);
        this.parent.on(click, this.hyperlinkClickHandler, this);
        this.parent.on(createHyperlinkElement, this.createHyperlinkEle, this);
        this.parent.on(keyUp, this.keyUpHandler, this);
        this.parent.on(deleteHyperlink, this.removeHyperlink, this);
        this.parent.on(removeHyperlink, this.removeHyperlinkHandler, this);
    }

    private removeEventListener(): void {
        if (!this.parent.isDestroyed) {
            this.parent.off(initiateHyperlink, this.initiateHyperlinkHandler);
            this.parent.off(editHyperlink, this.editHyperlinkHandler);
            this.parent.off(openHyperlink, this.openHyperlinkHandler);
            this.parent.off(click, this.hyperlinkClickHandler);
            this.parent.off(createHyperlinkElement, this.createHyperlinkEle);
            this.parent.off(keyUp, this.keyUpHandler);
            this.parent.off(deleteHyperlink, this.removeHyperlink);
            this.parent.off(removeHyperlink, this.removeHyperlinkHandler);
        }
    }

    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    protected getModuleName(): string {
        return 'spreadsheetHyperlink';
    }

    private keyUpHandler(e: MouseEvent): void {
        const trgt: Element = e.target as Element;
        if (closest(trgt, '.e-document')) {
            const hyperlinkText: HTMLInputElement = document.querySelector('.e-hyp-text') as HTMLInputElement;
            const hyperlinkSpan: HTMLElement = this.parent.element.querySelector('.e-hyperlink-alert-span');
            const dlgElement: Element = closest(trgt, '.e-hyperlink-dlg') || closest(trgt, '.e-edithyperlink-dlg');
            const footerEle: HTMLElement = dlgElement.getElementsByClassName('e-footer-content')[0] as HTMLElement;
            const insertBut: HTMLElement = footerEle.firstChild as HTMLElement;
            if (hyperlinkText && !isNullOrUndefined(hyperlinkText.value)) {
                if (!isCellReference(hyperlinkText.value.toUpperCase())) {
                    this.showDialog();
                    insertBut.setAttribute('disabled', 'true');
                } else if (hyperlinkSpan) {
                    hyperlinkSpan.remove();
                    insertBut.removeAttribute('disabled');
                }
            }
        }
        if (trgt.classList.contains('e-text') && closest(trgt, '.e-cont')) {
            if (closest(trgt, '.e-webpage') && closest(trgt, '.e-webpage').getElementsByClassName('e-cont')[1] === trgt.parentElement) {
                const dlgEle: Element = closest(trgt, '.e-hyperlink-dlg') || closest(trgt, '.e-edithyperlink-dlg');
                const ftrEle: HTMLElement = dlgEle.getElementsByClassName('e-footer-content')[0] as HTMLElement;
                const insertBut: HTMLElement = ftrEle.firstChild as HTMLElement;
                if ((trgt as CellModel).value !== '') {
                    insertBut.removeAttribute('disabled');
                } else {
                    const linkDialog: Element = closest(trgt, '.e-link-dialog');
                    const webPage: Element = linkDialog.querySelector('.e-webpage');
                    const isUrl: boolean =
                        (webPage.querySelectorAll('.e-cont')[1].querySelector('.e-text') as CellModel).value ? true : false;
                    if (!isUrl) {
                        insertBut.setAttribute('disabled', 'true');
                    }
                }
            }
        }
    }

    private initiateHyperlinkHandler(): void {
        const sheet: SheetModel = this.parent.getActiveSheet();
        if (sheet.isProtected && (!sheet.protectSettings.insertLink || isLockedCells(this.parent))) {
            this.parent.notify(editAlert, null);
            return;
        }
        if (isReadOnlyCells(this.parent)) {
            this.parent.notify(readonlyAlert, null);
            return;
        }
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        if (!this.parent.element.querySelector('.e-hyperlink-dlg')) {
            const dialogInst: Dialog = (this.parent.serviceLocator.getService(dialog) as Dialog);
            let displayText: string;
            dialogInst.show({
                width: 323, isModal: true, showCloseIcon: true, cssClass: 'e-hyperlink-dlg',
                enableRtl: this.parent.enableRtl,
                header: l10n.getConstant('InsertLink'),
                beforeOpen: (args: BeforeOpenEventArgs): void => {
                    const dlgArgs: DialogBeforeOpenEventArgs = {
                        dialogName: 'InsertLinkDialog',
                        element: args.element, target: args.target, cancel: args.cancel
                    };
                    this.parent.trigger('dialogBeforeOpen', dlgArgs);
                    if (dlgArgs.cancel) {
                        args.cancel = true;
                        return;
                    }
                    dialogInst.dialogInstance.content = this.hyperlinkContent();
                    displayText = (dialogInst.dialogInstance.content.querySelector('.e-text') as HTMLInputElement).value;
                    dialogInst.dialogInstance.dataBind();
                    focus(this.parent.element);
                },
                open: (): void => {
                    setTimeout(() => {
                        focus(dialogInst.dialogInstance.element.querySelectorAll('.e-webpage input')[1] as HTMLElement);
                    });
                },
                beforeClose: this.dialogBeforeClose.bind(this),
                buttons: [{
                    buttonModel: {
                        content: l10n.getConstant('Insert'), isPrimary: true, disabled: true
                    },
                    click: (): void => {
                        this.dlgClickHandler(displayText);
                        dialogInst.hide();
                    }
                }]
            });
        }
    }

    private dialogBeforeClose(): void {
        const headerTab: Tab = this.headerTabs;
        if (headerTab && headerTab.element) {
            headerTab.destroy();
            headerTab.element.remove();
        }
        this.headerTabs = null;
        removeElements(this.inputElements); this.inputElements = [];
        removeElements(this.divElements); this.divElements = [];
    }

    private dlgClickHandler(displayText: string): void {
        let value: string;
        let address: string;
        const sheet: SheetModel = this.parent.getActiveSheet();
        const cellAddress: string = sheet.name + '!' + sheet.selectedRange;
        const item: HTMLElement = this.parent.element.querySelector('.e-link-dialog').
            getElementsByClassName('e-content')[0].querySelector('.e-item.e-active') as HTMLElement;
        if (item) {
            value = (item.getElementsByClassName('e-cont')[0].querySelector('.e-text') as CellModel).value;
            if (value === displayText) {
                value = null;
            }
            if (item.querySelector('.e-webpage')) {
                address = (item.getElementsByClassName('e-cont')[1].querySelector('.e-text') as CellModel).value;
                const args: HyperlinkModel = { address: address };
                if (value === address) {
                    value = null;
                }
                this.parent.insertHyperlink(args, cellAddress, value, false);
            } else {
                address = (item.getElementsByClassName('e-cont')[1].querySelector('.e-text') as CellModel).value;
                const dlgContent: HTMLElement = item.getElementsByClassName('e-cont')[2] as HTMLElement;
                if (dlgContent.getElementsByClassName('e-list-item')[0].querySelector('.e-active')) {
                    const sheetName: string = item.getElementsByClassName('e-cont')[2].querySelector('.e-active').textContent;
                    // const sheets: SheetModel[] = spreadsheetInst.sheets;
                    // for (let idx: number = 0; idx < sheets.length; idx++) {
                    //     if (sheets[idx].name === sheetName) {
                    //         const sheetIdx: number = idx + 1;
                    //     }
                    // }
                    address = sheetName + '!' + address.toUpperCase();
                    const args: HyperlinkModel = { address: address };
                    this.parent.insertHyperlink(args, cellAddress, value, false);
                } else if (dlgContent.querySelector('.e-active')) {
                    const definedName: string = item.getElementsByClassName('e-cont')[2].querySelector('.e-active').textContent;
                    for (let idx: number = 0; idx < this.parent.definedNames.length; idx++) {
                        if (this.parent.definedNames[idx as number].name === definedName) {
                            const args: HyperlinkModel = {
                                address: this.parent.definedNames[idx as number].name
                            };
                            this.parent.insertHyperlink(
                                args, cellAddress, value, false);
                        }
                    }
                }
            }
        }
    }
    private showDialog(): void {
        if (this.parent.element.querySelector('.e-hyperlink-alert-span')) {
            this.parent.element.querySelector('.e-hyperlink-alert-span').remove();
        }
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        const hyperlinkSpan: HTMLElement = this.parent.createElement('span', { className: 'e-hyperlink-alert-span' });
        hyperlinkSpan.innerText = l10n.getConstant('HyperlinkAlert');
        const dlgEle: HTMLElement =
            this.parent.element.querySelector('.e-hyperlink-dlg') || this.parent.element.querySelector('.e-edithyperlink-dlg');
        (dlgEle.querySelector('.e-dlg-content')).appendChild(hyperlinkSpan);
    }
    private editHyperlinkHandler(): void {
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        const dialogInst: Dialog = (this.parent.serviceLocator.getService(dialog) as Dialog);
        let displayText: string;
        dialogInst.show({
            width: 323, isModal: true, showCloseIcon: true, cssClass: 'e-edithyperlink-dlg',
            enableRtl: this.parent.enableRtl,
            header: l10n.getConstant('EditLink'),
            beforeOpen: (args: BeforeOpenEventArgs): void => {
                const dlgArgs: DialogBeforeOpenEventArgs = {
                    dialogName: 'EditLinkDialog',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                    return;
                }
                dialogInst.dialogInstance.content = this.hyperEditContent();
                displayText = (dialogInst.dialogInstance.content.querySelector('.e-text') as HTMLInputElement).value;
                dialogInst.dialogInstance.dataBind();
                focus(this.parent.element);
            },
            open: (): void => {
                setTimeout(() => {
                    if (dialogInst.dialogInstance.element.querySelector('.e-webpage')) {
                        focus(dialogInst.dialogInstance.element.querySelectorAll('.e-webpage input')[1] as HTMLElement);
                    } else {
                        focus(dialogInst.dialogInstance.element.querySelectorAll('.e-document input')[1] as HTMLElement);
                    }
                });
            },
            buttons: [{
                buttonModel: {
                    content: l10n.getConstant('Update'), isPrimary: true
                },
                click: (): void => {
                    this.dlgClickHandler(displayText);
                    dialogInst.hide();
                }
            }]
        });
    }

    private openHyperlinkHandler(): void {
        const cellIndexes: number[] = getCellIndexes(this.parent.getActiveSheet().activeCell);
        let trgt: HTMLElement = this.parent.getCell(cellIndexes[0], cellIndexes[1]);
        if (trgt.getElementsByClassName('e-hyperlink')[0]) {
            trgt = trgt.querySelector('.e-hyperlink') as HTMLElement;
        }
        this.hlOpenHandler(trgt);
    }

    private hlOpenHandler(trgt: HTMLElement, isClick?: boolean, event?: MouseEvent): void {
        if (trgt.classList.contains('e-hyperlink')) {
            const cellEle: HTMLElement = closest(trgt, '.e-cell') as HTMLElement;
            if (!cellEle) {
                return;
            }
            const range: string[] = ['', ''];
            let rangeIndexes: number[];
            let isEmpty: boolean = true;
            let sheet: SheetModel = this.parent.getActiveSheet();
            const colIdx: number = parseInt(cellEle.getAttribute('aria-colindex'), 10) - 1;
            const rowIdx: number = parseInt(cellEle.parentElement.getAttribute('aria-rowindex'), 10) - 1;
            const cell: CellModel = getCell(rowIdx, colIdx, sheet, false, true);
            if (cell.style && cell.style.color === '#00e') {
                updateCell(this.parent, sheet, { rowIdx: rowIdx, colIdx: colIdx, preventEvt: true, cell: { style: { color: '#551a8b' } }});
                cellEle.style.color = '#551a8b';
            }
            let rangeAddr: string | HyperlinkModel = cell.hyperlink;
            let address: string;
            const befArgs: BeforeHyperlinkArgs = { hyperlink: rangeAddr, address: sheet.activeCell, target: '_blank', cancel: false };
            this.parent.trigger(beforeHyperlinkClick, befArgs);
            if (befArgs.cancel) {
                if (event) {
                    event.preventDefault();
                }
                return;
            }
            rangeAddr = befArgs.hyperlink;
            const aftArgs: AfterHyperlinkArgs = { hyperlink: rangeAddr, address: sheet.activeCell };
            if (typeof (rangeAddr) === 'string') { address = rangeAddr; }
            if (typeof (rangeAddr) === 'object') { address = rangeAddr.address; }
            const definedNameCheck: string = address;
            if (address.indexOf('http://') === -1 && address.indexOf('https://') === -1 && address.indexOf('ftp://') === -1) {
                if (!isNullOrUndefined(address)) {
                    if (this.parent.definedNames) {
                        for (let idx: number = 0; idx < this.parent.definedNames.length; idx++) {
                            if (this.parent.definedNames[idx as number].name === address) {
                                address = this.parent.definedNames[idx as number].refersTo;
                                address = address.slice(1);
                                break;
                            }
                        }
                    }
                    if (address.lastIndexOf('!') !== -1) {
                        range[0] = address.substring(0, address.lastIndexOf('!'));
                        if (range[0].startsWith('\'') && range[0].endsWith('\'')) {
                            range[0] = range[0].slice(1, range[0].length - 1);
                        }
                        range[1] = address.substring(address.lastIndexOf('!') + 1);
                    } else {
                        range[0] = this.parent.getActiveSheet().name;
                        range[1] = address;
                    }
                    // selRange = range[1];
                    let sheetIdx: number;
                    for (let idx: number = 0; idx < this.parent.sheets.length; idx++) {
                        if (this.parent.sheets[idx as number].name === range[0]) {
                            sheetIdx = idx;
                        }
                    }
                    sheet = this.parent.sheets[sheetIdx as number];
                    if (range[1].indexOf(':') !== -1) {
                        const colIndex: number = range[1].indexOf(':');
                        let left: string = range[1].substr(0, colIndex);
                        let right: string = range[1].substr(colIndex + 1, range[1].length);
                        left = left.replace('$', '');
                        right = right.replace('$', '');
                        if (right.match(/\D/g) && !right.match(/[0-9]/g) && left.match(/\D/g) && !left.match(/[0-9]/g)) {
                            // selRange = left + '1' + ':' + right + sheet.rowCount;
                            left = left + '1';
                            right = right + sheet.rowCount;
                            range[1] = left + ':' + right;
                        } else if (!right.match(/\D/g) && right.match(/[0-9]/g) && !left.match(/\D/g) && left.match(/[0-9]/g)) {
                            // selRange = getCellAddress(parseInt(left, 10) - 1, 0) + ':' +
                            //     getCellAddress(parseInt(right, 10) - 1, sheet.colCount - 1);
                            rangeIndexes = [parseInt(left, 10) - 1, 0, parseInt(right, 10) - 1, sheet.colCount - 1];
                            isEmpty = false;
                        }
                    }
                    let isDefinedNamed: boolean;
                    const definedname: DefineNameModel[] = this.parent.definedNames;
                    if (!isNullOrUndefined(definedname)) {
                        for (let idx: number = 0; idx < definedname.length; idx++) {
                            if (definedname[idx as number].name === definedNameCheck) {
                                isDefinedNamed = true;
                                break;
                            }
                        }
                    }
                    if (isCellReference(range[1]) || isDefinedNamed) {
                        rangeIndexes = isEmpty ? getRangeIndexes(range[1]) : rangeIndexes;
                        if (!isNullOrUndefined(sheet)) {
                            let rangeAddr: string = getRangeAddress(rangeIndexes);
                            if (sheet === this.parent.getActiveSheet()) {
                                getUpdateUsingRaf((): void => { this.parent.goTo(rangeAddr); });
                            } else {
                                if (rangeAddr.indexOf(':') >= 0) {
                                    const addArr: string[] = rangeAddr.split(':');
                                    rangeAddr = addArr[0] === addArr[1] ? addArr[0] : rangeAddr;
                                }
                                getUpdateUsingRaf(
                                    (): void => { this.parent.goTo(this.parent.sheets[sheetIdx as number].name + '!' + rangeAddr); });
                            }
                        }
                    } else {
                        this.showInvalidHyperlinkDialog();
                    }
                }
            } else if (!isClick) {
                if (isValidUrl(address)) {
                    window.open(address, befArgs.target);
                } else {
                    this.showInvalidHyperlinkDialog();
                }
            }
            this.parent.trigger(afterHyperlinkClick, aftArgs);
        }
    }

    private showInvalidHyperlinkDialog(): void {
        const dialogInst: Dialog = (this.parent.serviceLocator.getService(dialog) as Dialog);
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        dialogInst.show({
            width: 323, isModal: true, showCloseIcon: true,
            header: l10n.getConstant('Hyperlink'),
            content: l10n.getConstant('InvalidHyperlinkAlert'),
            buttons: [{
                buttonModel: {
                    content: l10n.getConstant('Ok'), isPrimary: true
                },
                click: (): void => {
                    dialogInst.hide();
                }
            }]
        }, false);
    }

    private hyperlinkClickHandler(e: MouseEvent): void {
        if (this.parent.isEdit) {
            const eventArgs: { action: string, editedValue: string } = { action: 'getCurrentEditValue', editedValue: '' };
            this.parent.notify(editOperation, eventArgs);
            if (checkIsFormula(eventArgs.editedValue, true)) {
                return;
            }
        }
        const trgt: HTMLElement = e.target as HTMLElement;
        if (closest(trgt, '.e-link-dialog') && closest(trgt, '.e-toolbar-item')) {
            const dlgEle: Element = closest(trgt, '.e-hyperlink-dlg') || closest(trgt, '.e-edithyperlink-dlg');
            const ftrEle: HTMLElement = dlgEle.getElementsByClassName('e-footer-content')[0] as HTMLElement;
            const insertBut: HTMLElement = ftrEle.firstChild as HTMLElement;
            const docEle: Element = dlgEle.querySelector('.e-document');
            const webEle: Element = dlgEle.querySelector('.e-webpage');
            const webEleText: string = webEle ? (webEle.querySelectorAll('.e-cont')[0].querySelector('.e-text') as CellModel).value :
                (docEle.querySelectorAll('.e-cont')[0].querySelector('.e-text') as CellModel).value;
            const docEleText: string = docEle ? (docEle.querySelectorAll('.e-cont')[0].querySelector('.e-text') as CellModel).value :
                webEleText;
            const toolbarItems: Element = closest(trgt, '.e-toolbar-items');
            if (toolbarItems.getElementsByClassName('e-toolbar-item')[1].classList.contains('e-active')) {
                const actEle: Element = docEle.querySelectorAll('.e-cont')[2].querySelector('.e-active');
                (docEle.querySelectorAll('.e-cont')[0].querySelector('.e-text') as CellModel).value = webEleText;
                if (closest(actEle, '.e-list-item').classList.contains('e-level-2') && insertBut.hasAttribute('disabled')) {
                    insertBut.removeAttribute('disabled');
                } else if (closest(actEle, '.e-list-item').classList.contains('e-level-1') && !insertBut.hasAttribute('disabled')) {
                    insertBut.setAttribute('disabled', 'true');
                }
            } else {
                const isEmpty: boolean = (webEle.querySelectorAll('.e-cont')[1].querySelector('.e-text') as CellModel).value ? false : true;
                (webEle.querySelectorAll('.e-cont')[0].querySelector('.e-text') as CellModel).value = docEleText;
                if (isEmpty && !insertBut.hasAttribute('disabled')) {
                    insertBut.setAttribute('disabled', 'true');
                } else if (!isEmpty && insertBut.hasAttribute('disabled')) {
                    insertBut.removeAttribute('disabled');
                }
            }
        }
        if (closest(trgt, '.e-list-item') && trgt.classList.contains('e-fullrow')) {
            let item: HTMLElement = this.parent.element.getElementsByClassName('e-link-dialog')[0] as HTMLElement;
            if (item) {
                item = item.getElementsByClassName('e-content')[0].getElementsByClassName('e-active')[0] as HTMLElement;
            } else {
                return;
            }
            const cellRef: HTMLElement = item.getElementsByClassName('e-cont')[1].getElementsByClassName('e-text')[0] as HTMLElement;
            const dlgEle: Element = closest(trgt, '.e-hyperlink-dlg') || closest(trgt, '.e-edithyperlink-dlg');
            const ftrEle: HTMLElement = dlgEle.getElementsByClassName('e-footer-content')[0] as HTMLElement;
            const insertBut: HTMLElement = ftrEle.firstChild as HTMLElement;
            if (closest(trgt, '.e-list-item').classList.contains('e-level-2')) {
                if (closest(trgt, '.e-list-item').getAttribute('data-uid') === 'defName') {
                    if (!cellRef.classList.contains('e-disabled') && !cellRef.hasAttribute('readonly')) {
                        cellRef.setAttribute('readonly', 'true');
                        cellRef.classList.add('e-disabled');
                        cellRef.setAttribute('disabled', 'true');
                    }
                    if (insertBut.hasAttribute('disabled')) {
                        insertBut.removeAttribute('disabled');
                    }
                } else if (closest(trgt, '.e-list-item').getAttribute('data-uid') === 'sheet') {
                    if (cellRef.classList.contains('e-disabled') && cellRef.hasAttribute('readonly')) {
                        cellRef.removeAttribute('readonly');
                        cellRef.classList.remove('e-disabled');
                        cellRef.removeAttribute('disabled');
                    }
                    if (isCellReference((cellRef as HTMLInputElement).value.toUpperCase())) {
                        if (insertBut.hasAttribute('disabled')) {
                            insertBut.removeAttribute('disabled');
                        }
                    }
                }
            } else if (closest(trgt, '.e-list-item').classList.contains('e-level-1')) {
                insertBut.setAttribute('disabled', 'true');
            }
        } else {
            this.hlOpenHandler(trgt, true, e);
        }
    }

    private createHyperlinkEle(args: { cell: CellModel, td: HTMLElement, rowIdx: number, colIdx: number,
        style: CellStyleModel, fillType: string, action: string }): void {
        const cell: CellModel = args.cell;
        if (!isNullOrUndefined(cell.hyperlink)) {
            const td: HTMLElement = args.td;
            const hyperEle: HTMLElement = this.parent.createElement('a', { className: 'e-hyperlink e-hyperlink-style' });
            let address: string;
            if (typeof cell.hyperlink === 'string') {
                if (cell.hyperlink.toLowerCase().indexOf('www.') === 0) {
                    cell.hyperlink = 'http://' + cell.hyperlink;
                }
                address = cell.hyperlink;
            } else {
                address = cell.hyperlink.address;
                if (address.toLowerCase().indexOf('www.') === 0) {
                    cell.hyperlink.address = address = 'http://' + address;
                }
            }
            if (address.indexOf('http://') === 0 || address.indexOf('https://') === 0 || address.indexOf('ftp://') === 0) {
                hyperEle.setAttribute('href', address);
                hyperEle.setAttribute('target', '_blank');
            } else if (address.includes('=') || address.includes('!')) {
                hyperEle.setAttribute('ref', address);
            }
            if (getTypeFromFormat(cell.format) === 'Accounting') {
                hyperEle.innerHTML = td.innerHTML;
            } else {
                hyperEle.innerText = td.innerText !== '' ? td.innerText : address;
            }
            td.textContent = '';
            td.innerText = '';
            if (this.parent.autoFillSettings.fillType === 'FillWithoutFormatting' || args.fillType === 'FillWithoutFormatting' ||
                args.action === 'Clear Formats') {
                hyperEle.style.textDecoration = 'none';
            }
            td.appendChild(hyperEle);
            if (!args.style.color || !args.style.textDecoration) {
                const style: CellStyleModel = {};
                if (!args.style.color) {
                    args.style.color = style.color = '#00e';
                }
                if (!args.style.textDecoration) {
                    args.style.textDecoration = style.textDecoration = 'underline';
                }
                updateCell(
                    this.parent, this.parent.getActiveSheet(), { rowIdx: args.rowIdx, colIdx: args.colIdx, preventEvt: true,
                        cell: { style: style }});
            }
        }
    }

    private hyperEditContent(): HTMLElement {
        let isWeb: boolean = true;
        const dialog: HTMLElement = this.hyperlinkContent();
        const indexes: number[] = getRangeIndexes(this.parent.getActiveSheet().activeCell);
        const cell: CellModel = this.parent.sheets[this.parent.getActiveSheet().id - 1].rows[indexes[0]].cells[indexes[1]];
        if (this.parent.scrollSettings.enableVirtualization) {
            indexes[0] = indexes[0] - this.parent.viewport.topIndex;
            indexes[1] = indexes[1] - this.parent.viewport.leftIndex;
        }
        let value: string = this.parent.getDisplayText(cell);
        let address: string;
        const hyperlink: string | HyperlinkModel = cell.hyperlink;
        if (typeof (hyperlink) === 'string') {
            address = hyperlink;
            value = value || address;
            if (address.indexOf('http://') === -1 && address.indexOf('https://') === -1 && address.indexOf('ftp://') === -1) {
                isWeb = false;
            }
        } else if (typeof (hyperlink) === 'object') {
            address = hyperlink.address;
            value = value || address;
            if (address.indexOf('http://') === -1 && address.indexOf('https://') === -1 && address.indexOf('ftp://') === -1) {
                isWeb = false;
            }
        }
        let definedNamesCount: number = 0;
        let rangeCount: number = 0;
        const definedNames: DefineNameModel[] = this.parent.definedNames;
        const sheets: SheetModel[] = this.parent.sheets;
        for (let idx: number = 0, len: number = definedNames.length; idx < len; idx++) {
            if (definedNames[idx as number].name === address) {
                definedNamesCount++;
            }
        }
        for (let idx: number = 0, len: number = sheets.length; idx < len; idx++) {
            if (address.includes(sheets[idx as number].name)) {
                rangeCount++;
            }
        }
        if (definedNamesCount === 0 && rangeCount === 0) {
            isWeb = true;
        }
        const item: HTMLElement = dialog.querySelector('.e-content') as HTMLElement;
        if (isWeb) {
            const webContElem: HTMLElement = item.querySelector('.e-webpage') as HTMLElement;
            const webTextInput: HTMLInputElement = webContElem.getElementsByClassName('e-cont')[0].getElementsByClassName('e-text')[0] as HTMLInputElement;
            const webUrlInput: HTMLInputElement = webContElem.getElementsByClassName('e-cont')[1].getElementsByClassName('e-text')[0] as HTMLInputElement;
            webTextInput.setAttribute('value', value);
            if (typeof (hyperlink) === 'string') {
                webUrlInput.setAttribute('value', hyperlink);
            } else {
                webUrlInput.setAttribute('value', hyperlink.address);
            }
            if (cell.hyperlink && (!cell.value || <unknown>cell.value !== 0)) {
                webUrlInput.addEventListener('input', (): void => {
                    webTextInput.value = webUrlInput.value;
                });
            }
        } else {
            let isDefinedNamed: boolean;
            const docContElem: HTMLElement = item.querySelector('.e-document') as HTMLElement;
            docContElem.getElementsByClassName('e-cont')[0].getElementsByClassName('e-text')[0].setAttribute('value', value);
            let sheetName: string; let range: string;
            // let sheet: SheetModel = this.parent.getActiveSheet();
            // let sheetIdx: number;
            if (this.parent.definedNames) {
                for (let idx: number = 0; idx < this.parent.definedNames.length; idx++) {
                    if (this.parent.definedNames[idx as number].name === address) {
                        isDefinedNamed = true;
                        break;
                    }
                }
            }
            if (isDefinedNamed) {
                const cellRef: HTMLElement = docContElem.getElementsByClassName('e-cont')[1].getElementsByClassName('e-text')[0] as HTMLElement;
                cellRef.setAttribute('readonly', 'true');
                cellRef.classList.add('e-disabled');
                cellRef.setAttribute('disabled', 'true');
                const treeCont: HTMLElement = docContElem.getElementsByClassName('e-cont')[2] as HTMLElement;
                const listEle: HTMLElement = treeCont.querySelectorAll('.e-list-item.e-level-1')[1] as HTMLElement;
                for (let idx: number = 0; idx < listEle.getElementsByTagName('li').length; idx++) {
                    if ((listEle.getElementsByTagName('li')[idx as number] as HTMLElement).innerText === address) {
                        listEle.getElementsByTagName('li')[idx as number].classList.add('e-active');
                    }
                }
            } else {
                if (address && address.lastIndexOf('!') !== -1) {
                    const lastIndex: number = address.lastIndexOf('!');
                    sheetName = address.substring(0, lastIndex);
                    range = address.substring(lastIndex + 1);
                    // sheetIdx = parseInt(rangeArr[0].replace(/\D/g, ''), 10) - 1;
                    // sheet = this.parent.sheets[sheetIdx];
                }
                docContElem.getElementsByClassName('e-cont')[1].querySelector('.e-text').setAttribute('value', range);
                const treeCont: HTMLElement = docContElem.getElementsByClassName('e-cont')[2] as HTMLElement;
                const listEle: HTMLElement = treeCont.querySelectorAll('.e-list-item.e-level-1')[0] as HTMLElement;
                for (let idx: number = 0; idx < listEle.getElementsByTagName('li').length; idx++) {
                    if ((listEle.getElementsByTagName('li')[idx as number] as HTMLElement).innerText === sheetName) {
                        if (listEle.getElementsByTagName('li')[idx as number].classList.contains('e-active')) {
                            break;
                        } else {
                            listEle.getElementsByTagName('li')[idx as number].classList.add('e-active');
                        }

                    } else {
                        if (listEle.getElementsByTagName('li')[idx as number].classList.contains('e-active')) {
                            listEle.getElementsByTagName('li')[idx as number].classList.remove('e-active');
                        }
                    }
                }

            }
        }
        return dialog;
    }

    private divElements: HTMLElement[] = [];
    private inputElements: HTMLElement[] = [];
    private headerTabs: Tab;

    private hyperlinkContent(): HTMLElement {
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        let idx: number = 0; let selIdx: number = 0;
        let isWeb: boolean = true;
        let isDefinedName: boolean;
        let isCellRef: boolean = true;
        let address: string;
        const indexes: number[] = getRangeIndexes(this.parent.getActiveSheet().activeCell);
        const sheet: SheetModel = this.parent.getActiveSheet();
        const cell: CellModel = getCell(indexes[0], indexes[1], sheet);
        let isEnable: boolean = true;
        const isRTL: boolean = this.parent.enableRtl;
        if (cell) {
            if ((cell.value && typeof (cell.value) === 'string' && cell.value.match('[A-Za-z]+') !== null) ||
                cell.value === '' || isNullOrUndefined(cell.value)) {
                isEnable = true;
            } else {
                isEnable = false;
            }
            const hyperlink: string | HyperlinkModel = cell.hyperlink;
            if (typeof (hyperlink) === 'string') {
                const hl: string = hyperlink;
                if (hl.indexOf('http://') === -1 && hl.indexOf('https://') === -1 && hl.indexOf('ftp://') === -1) {
                    address = hyperlink;
                    isWeb = false;
                }
            } else if (typeof (hyperlink) === 'object') {
                const hl: string = hyperlink.address;
                if (hl.indexOf('http://') === -1 && hl.indexOf('https://') === -1 && hl.indexOf('ftp://') === -1) {
                    address = hyperlink.address;
                    isWeb = false;
                }
            }
            if (address) {
                let defNamesCnt: number = 0;
                let rangeCnt: number = 0;
                const definedNames: DefineNameModel[] = this.parent.definedNames;
                const sheets: SheetModel[] = this.parent.sheets;
                for (let idx: number = 0, len: number = sheets.length; idx < len; idx++) {
                    if (address.includes(sheets[idx as number].name)) {
                        rangeCnt++;
                    }
                }
                for (let idx: number = 0, len: number = definedNames.length; idx < len; idx++) {
                    if (definedNames[idx as number].name === address) {
                        defNamesCnt++;
                    }
                }
                if (defNamesCnt === 0 && rangeCnt === 0) {
                    isWeb = true;
                }
            }
            if (isWeb) {
                selIdx = 0;
            } else {
                selIdx = 1;
            }

            if (this.parent.definedNames) {
                for (let idx: number = 0; idx < this.parent.definedNames.length; idx++) {
                    if (this.parent.definedNames[idx as number].name === address) {
                        isDefinedName = true;
                        isCellRef = false;
                        break;
                    }
                }
            }
        }
        const dialogElem: HTMLElement = this.parent.createElement('div', { className: 'e-link-dialog' });
        const webContElem: HTMLElement = this.parent.createElement('div', { className: 'e-webpage' });
        const docContElem: HTMLElement = this.parent.createElement('div', { className: 'e-document' });
        this.headerTabs = new Tab({
            selectedItem: selIdx,
            enableRtl: isRTL,
            items: [
                {
                    header: { 'text': l10n.getConstant('WebPage') },
                    content: webContElem
                },
                {
                    header: { 'text': l10n.getConstant('ThisDocument') },
                    content: docContElem
                }
            ]
        });
        this.headerTabs.appendTo(dialogElem);
        const indicator: HTMLElement = dialogElem.querySelector('.e-toolbar-items').querySelector('.e-indicator');
        if (isWeb) {
            indicator.style.cssText = isRTL ? 'left: 136px; right: 0' : 'left: 0; right: 136px';
        } else {
            indicator.style.cssText = isRTL ? 'left: 0; right: 136px' : 'left: 136px; right: 0';
        }
        const textCont: HTMLElement = this.parent.createElement('div', { className: 'e-cont' });
        const urlCont: HTMLElement = this.parent.createElement('div', { className: 'e-cont' });
        const textH: HTMLElement = this.parent.createElement('div', { className: 'e-header' });
        textH.innerText = l10n.getConstant('DisplayText');
        const urlH: HTMLElement = this.parent.createElement('div', { className: 'e-header' });
        urlH.innerText = l10n.getConstant('Url');
        const textInput: HTMLElement = this.parent.createElement('input', { className: 'e-input e-text', attrs: { 'type': 'Text' } });
        this.inputElements.push(textInput);
        if (!isEnable) {
            textInput.classList.add('e-disabled');
            textInput.setAttribute('readonly', 'true');
            textInput.setAttribute('disabled', 'true');
        }
        if (cell && isNullOrUndefined(cell.hyperlink)) {
            textInput.setAttribute('value', this.parent.getDisplayText(cell));
        }
        const urlInput: HTMLElement = this.parent.createElement('input', { className: 'e-input e-text', attrs: { 'type': 'Text' } });
        this.inputElements.push(urlInput);
        textInput.setAttribute('placeholder', l10n.getConstant('EnterTheTextToDisplay'));
        urlInput.setAttribute('placeholder', l10n.getConstant('EnterTheUrl'));
        textCont.appendChild(textInput);
        textCont.insertBefore(textH, textInput);
        urlCont.appendChild(urlInput);
        urlCont.insertBefore(urlH, urlInput);
        webContElem.appendChild(urlCont);
        webContElem.insertBefore(textCont, urlCont);
        const cellRef: Object[] = [];
        const definedName: object[] = [];
        const sheets: SheetModel[] = this.parent.sheets;
        for (idx; idx < this.parent.sheets.length; idx++) {
            const sheetName: string = this.parent.sheets[idx as number].name;
            if (this.parent.sheets[idx as number].state === 'Visible') {
                if (sheets[idx as number] === this.parent.getActiveSheet()) {
                    cellRef.push({
                        nodeId: 'sheet',
                        nodeText: sheetName.indexOf(' ') !== -1 ? '\'' + sheetName + '\'' : sheetName,
                        selected: true
                    });
                } else {
                    cellRef.push({
                        nodeId: 'sheet',
                        nodeText: sheetName.indexOf(' ') !== -1 ? '\'' + sheetName + '\'' : sheetName
                    });
                }
            }
        }
        for (idx = 0; idx < this.parent.definedNames.length; idx++) {
            definedName.push({
                nodeId: 'defName',
                nodeText: this.parent.definedNames[idx as number].name
            });
        }
        const data: { [key: string]: Object }[] = [
            {
                nodeId: '01', nodeText: l10n.getConstant('CellReference'), expanded: isCellRef,
                nodeChild: cellRef
            },
            {
                nodeId: '02', nodeText: l10n.getConstant('DefinedNames'), expanded: isDefinedName,
                nodeChild: definedName
            }
        ];
        const treeObj: TreeView = new TreeView({
            fields: { dataSource: data, id: 'nodeId', text: 'nodeText', child: 'nodeChild' },
            enableRtl: isRTL
        });
        const cellrefCont: HTMLElement = this.parent.createElement('div', { className: 'e-cont' });
        const cellrefH: HTMLElement = this.parent.createElement('div', { className: 'e-header' });
        cellrefH.innerText = l10n.getConstant('CellReference');
        const cellrefInput: HTMLElement = this.parent.createElement(
            'input', { className: 'e-input e-text e-hyp-text', attrs: { 'type': 'Text' } });
        cellrefInput.setAttribute('value', 'A1');
        this.inputElements.push(cellrefInput);
        cellrefCont.appendChild(cellrefInput);
        cellrefCont.insertBefore(cellrefH, cellrefInput);
        const textCont1: HTMLElement = this.parent.createElement('div', { className: 'e-cont' });
        const textH1: HTMLElement = this.parent.createElement('div', { className: 'e-header' });
        textH1.innerText = l10n.getConstant('DisplayText');
        const textInput1: HTMLElement = this.parent.createElement('input', { className: 'e-input e-text', attrs: { 'type': 'Text' } });
        this.inputElements.push(textInput1);
        if (!isEnable) {
            textInput1.classList.add('e-disabled');
            textInput1.setAttribute('readonly', 'true');
            textInput1.setAttribute('disabled', 'true');
        }
        if (cell && isNullOrUndefined(cell.hyperlink)) {
            textInput1.setAttribute('value', this.parent.getDisplayText(cell));
        }
        textInput1.setAttribute('placeholder', l10n.getConstant('EnterTheTextToDisplay'));
        textCont1.appendChild(textInput1);
        textCont1.insertBefore(textH1, textInput1);
        const sheetCont: HTMLElement = this.parent.createElement('div', { className: 'e-cont' });
        const sheetH: HTMLElement = this.parent.createElement('div', { className: 'e-header' });
        sheetH.innerText = l10n.getConstant('Sheet');
        const refCont: HTMLElement = this.parent.createElement('div', { className: 'e-refcont' });
        this.divElements.push(textCont); this.divElements.push(urlCont);
        this.divElements.push(textH); this.divElements.push(urlH);
        this.divElements.push(cellrefCont); this.divElements.push(cellrefH);
        this.divElements.push(textCont1); this.divElements.push(textH1);
        this.divElements.push(sheetCont); this.divElements.push(sheetH);
        this.divElements.push(refCont); this.divElements.push(docContElem);
        this.divElements.push(webContElem); this.divElements.push(dialogElem);
        sheetCont.appendChild(refCont);
        sheetCont.insertBefore(sheetH, refCont);
        docContElem.appendChild(cellrefCont);
        docContElem.insertBefore(textCont1, cellrefCont);
        treeObj.appendTo(refCont);
        docContElem.appendChild(sheetCont);
        return dialogElem;
    }

    private removeHyperlink(args: { sheet: SheetModel, rowIdx: number, colIdx: number, preventRefresh?: boolean }): void {
        const cell: CellModel = getCell(args.rowIdx, args.colIdx, args.sheet);
        if (cell && cell.hyperlink) {
            if (typeof (cell.hyperlink) === 'string') {
                cell.value = cell.value || <unknown>cell.value === 0 ? cell.value : cell.hyperlink;
            } else {
                cell.value = cell.value || <unknown>cell.value === 0 ? cell.value : cell.hyperlink.address;
            }
            delete (cell.hyperlink);
            if (cell.style) { delete cell.style.textDecoration; delete cell.style.color; }
            if (cell.validation) {
                if (cell.validation.isHighlighted) {
                    if (cell.style.backgroundColor) {
                        cell.style.color = '#ff0000';
                    }
                }
            }
            if (args.sheet === this.parent.getActiveSheet()) {
                if (cell.style) { this.parent.notify(refreshRibbonIcons, null); }
                if (!args.preventRefresh) {
                    this.parent.serviceLocator.getService<ICellRenderer>('cell').refresh(
                        args.rowIdx, args.colIdx, false, null, true, false, isImported(this.parent));
                }
            }
        }
    }

    private removeHyperlinkHandler(args: { range: string, preventEventTrigger?: boolean }): void {
        let range: string = args.range;
        let sheetName: string;
        let sheet: SheetModel = this.parent.getActiveSheet();
        let sheetIdx: number;
        if (!args.preventEventTrigger) {
            const eventArgs: { address: string, cancel: boolean } = { address: range.indexOf('!') === -1 ? sheet.name + '!' + range : range, cancel: false };
            this.parent.notify(beginAction, { action: 'removeHyperlink', eventArgs: eventArgs });
            if (eventArgs.cancel) {
                return;
            }
        }
        if (range && range.indexOf('!') !== -1) {
            const lastIndex: number = range.lastIndexOf('!');
            sheetName = range.substring(0, lastIndex);
            const sheets: SheetModel[] = this.parent.sheets;
            for (let idx: number = 0; idx < sheets.length; idx++) {
                if (sheets[idx as number].name === sheetName) {
                    sheetIdx = idx;
                }
            }
            sheet = this.parent.sheets[sheetIdx as number];
            range = range.substring(lastIndex + 1);
        }
        const rangeIndexes: number[] = range ? getRangeIndexes(range) : getRangeIndexes(sheet.activeCell);
        let cellEle: HTMLElement; let classList: string[];
        for (let rowIdx: number = rangeIndexes[0]; rowIdx <= rangeIndexes[2]; rowIdx++) {
            for (let colIdx: number = rangeIndexes[1]; colIdx <= rangeIndexes[3]; colIdx++) {
                if (sheet && sheet.rows[rowIdx as number] && sheet.rows[rowIdx as number].cells[colIdx as number]) {
                    classList = [];
                    cellEle = this.parent.getCell(rowIdx, colIdx);
                    if (cellEle) {
                        for (let i: number = 0; i < cellEle.classList.length; i++) {
                            classList.push(cellEle.classList[i as number]);
                        }
                    }
                    this.parent.notify(deleteHyperlink, { sheet: sheet, rowIdx: rowIdx, colIdx: colIdx });
                    for (let i: number = 0; i < classList.length; i++) {
                        if (!cellEle.classList.contains(classList[i as number])) {
                            cellEle.classList.add(classList[i as number]);
                        }
                    }
                }
            }
        }
        if (!args.preventEventTrigger) {
            this.parent.notify(completeAction, { action: 'removeHyperlink', eventArgs: { address: range.indexOf('!') === -1 ? sheet.name + '!' + range : range } });
        }
    }
}
