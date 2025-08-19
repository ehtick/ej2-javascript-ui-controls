import { EventHandler, KeyboardEventArgs, getComponent, remove } from '@syncfusion/ej2-base';
import { Ribbon } from '../base/ribbon';
import { RibbonGroupButtonItem, RibbonGroupButtonItemModel, RibbonGroupButtonSettingsModel, RibbonItemModel } from '../models';
import * as constants from '../base/constant';
import { Button } from '@syncfusion/ej2-buttons';
import { BeforeClickGroupButtonEventArgs, ClickGroupButtonEventArgs, RibbonGroupButtonSelection, RibbonItemSize } from '../base/interface';
import { DropDownButton } from '@syncfusion/ej2-splitbuttons';
import { createTooltip, isTooltipPresent, setCustomAttributes } from '../base/utils';
import { Popup, Tooltip } from '@syncfusion/ej2-popups';

/**
 * Defines the items of Ribbon.
 */
export class RibbonGroupButton {
    private parent: Ribbon;
    private count: number;
    private isSelected: boolean;
    private grpBtnIndex: number = 0;

    constructor(parent: Ribbon) {
        this.parent = parent;
        this.isSelected = false;
    }
    protected getModuleName(): string {
        return 'ribbonGroupButton';
    }
    protected destroy(): void {
        this.parent = null;
    }

    /**
     * Creates Group Button
     *
     * @param {RibbonItemModel} item - Gets the ribbon item model.
     * @param {HTMLElement} itemElement - Gets the ribbon item element.
     * @returns {void}
     * @hidden
     */
    public createGroupButton(item: RibbonItemModel, itemElement: HTMLElement): void {
        const groupBtnSettings: RibbonGroupButtonSettingsModel = item.groupButtonSettings;
        this.count = 0;
        const btnContainerEle: HTMLElement = this.parent.createElement('div', {
            id: item.id + constants.RIBBON_GROUP_BUTTON_ID,
            className: 'e-btn-group'
        });
        itemElement.appendChild(btnContainerEle);
        for (let i: number = 0; i < groupBtnSettings.items.length; i++) {
            if ((groupBtnSettings.items[parseInt(i.toString(), 10)].iconCss)) {
                const groupButtonEle: HTMLButtonElement = this.parent.createElement('button', {
                    id: item.id + constants.RIBBON_GROUP_BUTTON_ID + i,
                    className: constants.RIBBON_GROUP_BUTTON
                });
                btnContainerEle.appendChild(groupButtonEle);
                new Button({
                    iconCss: groupBtnSettings.items[parseInt(i.toString(), 10)].iconCss,
                    disabled: item.disabled,
                    enableRtl: this.parent.enableRtl,
                    content: item.activeSize === RibbonItemSize.Small ? '' : groupBtnSettings.items[parseInt(i.toString(), 10)].content,
                    iconPosition: item.activeSize === RibbonItemSize.Large ? 'Top' : 'Left'
                }, groupButtonEle);
                if (groupBtnSettings.items[parseInt(i.toString(), 10)].htmlAttributes) {
                    setCustomAttributes(groupButtonEle, groupBtnSettings.items[parseInt(i.toString(), 10)].htmlAttributes);
                }
                if (groupBtnSettings.items[parseInt(i.toString(), 10)].content) {
                    groupButtonEle.classList.add(constants.RIBBON_GROUP_BUTTON_CONTENT);
                    groupButtonEle.setAttribute('aria-label', groupBtnSettings.items[parseInt(i.toString(), 10)].content);
                }
                else {
                    groupButtonEle.setAttribute('aria-label', 'groupbuttonitem');
                }
                const buttonEle: HTMLElement = itemElement.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i);
                if (groupBtnSettings.selection === RibbonGroupButtonSelection.Single) {
                    btnContainerEle.classList.add(constants.RIBBON_SINGLE_BUTTON_SELECTION);
                }
                else {
                    btnContainerEle.classList.add(constants.RIBBON_MULTIPLE_BUTTON_SELECTION);
                }
                if (groupBtnSettings.items[parseInt(i.toString(), 10)].selected) {
                    if (groupBtnSettings.selection === RibbonGroupButtonSelection.Multiple) {
                        buttonEle.classList.add('e-active');
                    }
                    else {
                        if (this.count < 1) {
                            buttonEle.classList.add('e-active');
                            this.count++;
                        }
                    }
                    this.grpBtnIndex = i;
                }
                if (groupBtnSettings.items[parseInt(i.toString(), 10)].ribbonTooltipSettings &&
                        isTooltipPresent(groupBtnSettings.items[parseInt(i.toString(), 10)].ribbonTooltipSettings)) {
                    groupButtonEle.classList.add(constants.RIBBON_TOOLTIP_TARGET);
                    this.parent.tooltipData.push({
                        id: groupButtonEle.id, data: groupBtnSettings.items[parseInt(i.toString(), 10)].ribbonTooltipSettings
                    });
                }
                EventHandler.add(buttonEle, 'click', this.groupButtonClicked.bind(this, i, item, groupBtnSettings), this);
            }
        }
        if (this.parent.activeLayout === 'Simplified') {
            let dropdownIcon: string;
            let activeEleCount: number = 0;
            let count: number = 0;
            const buttonEle: HTMLButtonElement = this.parent.createElement('button', {
                id: item.id
            });
            itemElement.appendChild(buttonEle);
            for (let i: number = 0; i < groupBtnSettings.items.length; i++) {
                if (item.groupButtonSettings.items[parseInt(i.toString(), 10)].selected &&
                        !this.isSelected && groupBtnSettings.selection === RibbonGroupButtonSelection.Single) {
                    dropdownIcon = item.groupButtonSettings.items[parseInt(i.toString(), 10)].iconCss;
                    this.isSelected = true;
                }
                else if (item.groupButtonSettings.items[parseInt(i.toString(), 10)].selected &&
                            groupBtnSettings.selection === RibbonGroupButtonSelection.Multiple) {
                    activeEleCount++;
                    if (activeEleCount === 1) {
                        dropdownIcon = item.groupButtonSettings.items[parseInt(i.toString(), 10)].iconCss;
                    }
                    else {
                        dropdownIcon = null;
                    }
                }
            }
            while (count < item.groupButtonSettings.items.length && !this.isSelected && !dropdownIcon) {
                if (item.groupButtonSettings.items[parseInt(count.toString(), 10)].iconCss) {
                    dropdownIcon = item.groupButtonSettings.items[parseInt(count.toString(), 10)].iconCss;
                    this.isSelected = true;
                }
                count++;
            }
            const dropdown: DropDownButton = new DropDownButton({
                iconCss: dropdownIcon,
                target: btnContainerEle,
                enableRtl: this.parent.enableRtl,
                cssClass: 'e-ribbon-dropdown-group-button',
                disabled: item.disabled
            }, buttonEle);
            if (groupBtnSettings.header) {
                const dropDownPopup: Popup = dropdown.dropDown;
                this.addGroupButtonHeader(item.id, groupBtnSettings, dropDownPopup.element);
            }
            buttonEle.onclick = buttonEle.onkeydown = () => {
                this.handleFocusState(item, itemElement);
            };
            btnContainerEle.onkeydown = (e: KeyboardEventArgs) => {
                if (this.parent.activeLayout === 'Simplified') {
                    this.handleGroupButtonNavigation(e, item);
                }
            };
            createTooltip(btnContainerEle, this.parent);
            this.isSelected = false;
        }
    }

    private groupButtonClicked(itemIndex: number, item: RibbonItemModel, grpBtnSettings: RibbonGroupButtonSettingsModel): void {
        const previousItems: RibbonGroupButtonItemModel[] = [];
        const selectingItems: RibbonGroupButtonItemModel[] = [];
        const selectedItems: RibbonGroupButtonItemModel[] = [];
        const groupButtonEle: HTMLButtonElement = document.querySelector('#' + item.id);
        let dropdown: DropDownButton;
        for (let j: number = 0; j < grpBtnSettings.items.length; j++) {
            if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + j)) {
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + j).classList.contains('e-active')) {
                    previousItems.push(grpBtnSettings.items[parseInt(j.toString(), 10)]);
                }
            }
        }
        if (!(document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active'))) {
            selectingItems.push(grpBtnSettings.items[parseInt(itemIndex.toString(), 10)]);
        }
        const eventArgs: BeforeClickGroupButtonEventArgs = {
            cancel: false, previousItems: previousItems, selectingItems: selectingItems
        };
        if (grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].beforeClick) {
            grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].beforeClick.call(this, eventArgs);
        }
        if (eventArgs.cancel) {
            return;
        }
        else {
            if (grpBtnSettings.selection === RibbonGroupButtonSelection.Single) {
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.contains(constants.RIBBON_MULTIPLE_BUTTON_SELECTION)) {
                    document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.remove(constants.RIBBON_MULTIPLE_BUTTON_SELECTION);
                    document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.add(constants.RIBBON_SINGLE_BUTTON_SELECTION);
                }
                for (let j: number = 0; j < grpBtnSettings.items.length; j++) {
                    if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + j) && document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + j).classList.contains('e-active')) {
                        document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + j).classList.remove('e-active');
                        (grpBtnSettings.items[parseInt(j.toString(), 10)] as RibbonGroupButtonItem).
                            setProperties({ selected: false }, true);
                    }
                }
                document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.toggle('e-active');
                (grpBtnSettings.items[parseInt(itemIndex.toString(), 10)] as RibbonGroupButtonItem).setProperties({ selected: true }, true);
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active') && this.parent.activeLayout === 'Simplified') {
                    this.grpBtnIndex = itemIndex;
                    dropdown = getComponent(groupButtonEle, DropDownButton);
                    dropdown.setProperties({
                        iconCss: grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].iconCss
                    });
                }
            }
            else {
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.contains(constants.RIBBON_SINGLE_BUTTON_SELECTION)) {
                    document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.remove(constants.RIBBON_SINGLE_BUTTON_SELECTION);
                    document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID).classList.add(constants.RIBBON_MULTIPLE_BUTTON_SELECTION);
                }
                document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.toggle('e-active');
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active')) {
                    (grpBtnSettings.items[parseInt(itemIndex.toString(), 10)] as RibbonGroupButtonItem).
                        setProperties({ selected: true }, true);
                }
                else {
                    (grpBtnSettings.items[parseInt(itemIndex.toString(), 10)] as RibbonGroupButtonItem).
                        setProperties({ selected: false }, true);
                }
                let activeEleCount: number = 0;
                for (let n: number = 0; n < grpBtnSettings.items.length; n++) {
                    if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + n) && document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + n).classList.contains('e-active') && this.parent.activeLayout === 'Simplified' && n !== itemIndex) {
                        this.isSelected = true;
                        activeEleCount++;
                    }
                }
                if (this.parent.activeLayout === 'Simplified') {
                    let dropdownIcon: string = null;
                    let itemsCount: number = 0;
                    dropdown = getComponent(groupButtonEle, DropDownButton);
                    if (!this.isSelected) {
                        if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active')) {
                            dropdownIcon = grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].iconCss;
                        }
                    }
                    else {
                        if (activeEleCount === 1 && !(document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active'))) {
                            for (let n: number = 0; n < grpBtnSettings.items.length; n++) {
                                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + n) && document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + n).classList.contains('e-active')) {
                                    dropdownIcon = grpBtnSettings.items[parseInt(n.toString(), 10)].iconCss;
                                }
                            }
                        }
                    }
                    while (itemsCount < grpBtnSettings.items.length && !dropdownIcon) {
                        if (grpBtnSettings.items[parseInt(itemsCount.toString(), 10)].iconCss) {
                            dropdownIcon = grpBtnSettings.items[parseInt(itemsCount.toString(), 10)].iconCss;
                        }
                        itemsCount++;
                    }
                    dropdown.setProperties({ iconCss: dropdownIcon});
                    this.grpBtnIndex = itemIndex;
                }
                this.isSelected = false;
            }
            if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + itemIndex).classList.contains('e-active')) {
                selectedItems.push(grpBtnSettings.items[parseInt(itemIndex.toString(), 10)]);
            }
            const eventArgs: ClickGroupButtonEventArgs = { previousItems: previousItems, selectedItems: selectedItems };
            if (grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].click) {
                grpBtnSettings.items[parseInt(itemIndex.toString(), 10)].click.call(this, eventArgs);
            }
            if (this.parent.activeLayout === 'Simplified' && groupButtonEle) {
                dropdown = getComponent(groupButtonEle, DropDownButton);
                dropdown.toggle();
            }
        }
    }

    /**
     * updates group button in mode switching
     *
     * @param {RibbonItemModel} item - Gets the ribbon item model.
     * @param {HTMLElement} itemElement - Gets the ribbon item element.
     * @returns {void}
     * @hidden
     */
    public switchGroupButton(item: RibbonItemModel, itemElement: HTMLElement): void {
        const groupBtnSettings: RibbonGroupButtonSettingsModel = item.groupButtonSettings;
        let dropdownIcon: string = null;
        let activeEleCount: number = 0;
        let itemsCount: number = 0;
        if (this.parent.activeLayout === 'Simplified') {
            const containerEle: HTMLButtonElement = itemElement.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID);
            const buttonEle: HTMLButtonElement = this.parent.createElement('button', {
                id: item.id
            });
            itemElement.appendChild(buttonEle);
            for (let i: number = 0; i < groupBtnSettings.items.length; i++) {
                if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i)) {
                    if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i).classList.contains('e-active') && groupBtnSettings.selection === RibbonGroupButtonSelection.Single) {
                        dropdownIcon = groupBtnSettings.items[parseInt(i.toString(), 10)].iconCss;
                    }
                    else if (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i).classList.contains('e-active') && groupBtnSettings.selection === RibbonGroupButtonSelection.Multiple) {
                        activeEleCount++;
                        if (activeEleCount === 1) {
                            dropdownIcon = groupBtnSettings.items[parseInt(i.toString(), 10)].iconCss;
                        }
                        else if (activeEleCount > 1) {
                            dropdownIcon = null;
                        }
                    }
                }
            }
            while (itemsCount < groupBtnSettings.items.length && !dropdownIcon) {
                if (groupBtnSettings.items[parseInt(itemsCount.toString(), 10)].iconCss) {
                    dropdownIcon = groupBtnSettings.items[parseInt(itemsCount.toString(), 10)].iconCss;
                }
                itemsCount++;
            }
            const dropdown: DropDownButton = new DropDownButton({
                iconCss: dropdownIcon,
                target: containerEle,
                enableRtl: this.parent.enableRtl,
                cssClass: 'e-ribbon-dropdown-group-button',
                disabled: item.disabled
            }, buttonEle);
            if (groupBtnSettings.header) {
                const dropDownPopup: Popup = dropdown.dropDown;
                this.addGroupButtonHeader(item.id, groupBtnSettings, dropDownPopup.element);
            }
            buttonEle.onclick = buttonEle.onkeydown = () => {
                this.handleFocusState(item, itemElement);
            };
            containerEle.onkeydown = (e: KeyboardEventArgs) => {
                if (this.parent.activeLayout === 'Simplified') {
                    this.handleGroupButtonNavigation(e, item);
                }
            };
            createTooltip(containerEle, this.parent);
        }
        else {
            const groupButtonEle: HTMLButtonElement = itemElement.querySelector('#' + item.id);
            const dropdown: DropDownButton = getComponent(groupButtonEle, DropDownButton);
            itemElement.appendChild(dropdown.target as HTMLElement);
            if (groupButtonEle) {
                dropdown.destroy();
                remove(groupButtonEle);
            }
        }
    }

    private handleFocusState(item: RibbonItemModel, itemElement: HTMLElement): void {
        if (itemElement.querySelector('#' + item.id).classList.contains('e-active')) {
            const defaultSelectedBtn: HTMLElement = document.querySelector('#' + item.id + '_grpbtn').querySelector('.' + constants.RIBBON_GROUP_BUTTON + '.e-active');
            if (defaultSelectedBtn) {
                defaultSelectedBtn.focus();
            }
            else {
                (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + 0) as HTMLElement).focus();
            }
        }
    }

    private addGroupButtonHeader(itemID: string, groupBtnSettings: RibbonGroupButtonSettingsModel, popupEle: HTMLElement): void {
        const groupButtonHeader: HTMLElement = this.parent.createElement('div', {
            className: 'e-ribbon-groupbutton-header',
            id: itemID + constants.HEADER_ID,
            innerHTML: groupBtnSettings.header
        });
        popupEle.insertBefore(groupButtonHeader, popupEle.firstChild);
    }

    private handleGroupButtonNavigation(e: KeyboardEventArgs, item: RibbonItemModel): void {
        const groupButtonEle: HTMLElement = document.querySelector('#' + item.id) as HTMLElement;
        const dropdown: DropDownButton = getComponent(groupButtonEle, DropDownButton);
        const targetEle: HTMLElement = dropdown.target as HTMLElement;
        let isOverflowPopup: boolean = false;
        if (this.parent.activeLayout === 'Simplified' && targetEle.closest('.e-ribbon-dropdown-group-button').classList.contains(constants.RIBBON_GROUP_BUTTON_OVERFLOW_POPUP)) {
            isOverflowPopup = true;
        }
        if (e.key === 'Tab') { e.preventDefault(); }
        const groupBtnSettings: RibbonGroupButtonSettingsModel = item.groupButtonSettings;
        if ((e.key === 'ArrowRight' && !isOverflowPopup) || (e.key === 'ArrowDown' && isOverflowPopup)) {
            if (!this.parent.enableRtl || (e.key === 'ArrowDown' && isOverflowPopup)) {
                this.grpBtnIndex++;
                if (this.grpBtnIndex < groupBtnSettings.items.length) {
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
                else {
                    this.grpBtnIndex = 0;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
            }
            else {
                if (this.grpBtnIndex === 0) {
                    this.grpBtnIndex = groupBtnSettings.items.length - 1;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
                else {
                    this.grpBtnIndex--;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
            }
        }
        else if ((e.key === 'ArrowLeft' && !isOverflowPopup) || (e.key === 'ArrowUp' && isOverflowPopup)) {
            if (!this.parent.enableRtl || (e.key === 'ArrowUp' && isOverflowPopup)) {
                if (this.grpBtnIndex === 0) {
                    this.grpBtnIndex = groupBtnSettings.items.length - 1;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
                else {
                    this.grpBtnIndex--;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
            }
            else {
                this.grpBtnIndex++;
                if (this.grpBtnIndex < groupBtnSettings.items.length) {
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
                else {
                    this.grpBtnIndex = 0;
                    (document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + (this.grpBtnIndex)) as HTMLElement).focus();
                }
            }
        }
    }

    /**
     * Adds the additional event handlers as the item moved into overflow popup.
     *
     * @param {RibbonItemModel} item - Gets the ribbon item model.
     * @param {HTMLElement} itemEle - Gets the ribbon item element.
     * @param {DropDownButton} overflowButton - Gets the overflow button.
     * @returns {void}
     * @hidden
     */
    public addOverFlowEvents(item: RibbonItemModel, itemEle: HTMLElement, overflowButton: DropDownButton): void {
        const groupBtnSettings: RibbonGroupButtonSettingsModel = item.groupButtonSettings;
        let isIconOnly: boolean = true;
        const groupButtonEle: HTMLElement = itemEle.querySelector('#' + item.id) as HTMLElement;
        if (groupButtonEle) {
            const dropdown: DropDownButton = getComponent(groupButtonEle, DropDownButton);
            dropdown.setProperties({ cssClass: dropdown.cssClass + constants.SPACE + constants.RIBBON_GROUP_BUTTON_OVERFLOW_POPUP, content: groupBtnSettings.header ? groupBtnSettings.header : ''});
            const targetEle: HTMLElement = dropdown.target as HTMLElement;
            if (targetEle.children.length) {
                for (let i: number = 0; i < targetEle.children.length; i++) {
                    if (groupBtnSettings.items[parseInt(i.toString(), 10)].content) {
                        isIconOnly = false;
                        break;
                    }
                }
                if (isIconOnly) {
                    targetEle.classList.add('e-icon-btn');
                }
            }
            targetEle.onclick = () => {
                if (this.parent.activeLayout === 'Simplified' && targetEle.closest('.e-ribbon-dropdown-group-button').classList.contains(constants.RIBBON_GROUP_BUTTON_OVERFLOW_POPUP)) {
                    if (overflowButton.element.classList.contains('e-active')) {
                        overflowButton.toggle();
                    }
                }
            };
        }
        const overflowGroupButtonEle: HTMLElement = itemEle.querySelector('#' + item.id + '_grpbtn') as HTMLElement;
        if (this.parent.activeLayout === 'Classic' && overflowGroupButtonEle) {
            overflowGroupButtonEle.onclick = () => {
                if (overflowButton.element.classList.contains('e-active')) {
                    overflowButton.toggle();
                }
            };
        }
    }

    /**
     * Removes the additional event handlers as the item moved into overflow popup.
     *
     * @param {RibbonItemModel} item - Gets the ribbon item model.
     * @param {HTMLElement} itemEle - Gets the ribbon item element.
     * @returns {void}
     * @hidden
     */
    public removeOverFlowEvents(item: RibbonItemModel, itemEle: HTMLElement): void {
        const groupButtonEle: HTMLElement = itemEle.querySelector('#' + item.id) as HTMLElement;
        if (groupButtonEle) {
            const dropdown: DropDownButton = getComponent(groupButtonEle, DropDownButton);
            const targetEle: HTMLElement = dropdown.target as HTMLElement;
            if (targetEle.classList.contains('e-icon-btn')) {
                targetEle.classList.remove('e-icon-btn');
            }
            let cssClass: string[] = dropdown.cssClass.split(constants.SPACE);
            cssClass = cssClass.filter((value: string) => value !== constants.RIBBON_GROUP_BUTTON_OVERFLOW_POPUP);
            dropdown.setProperties({ cssClass: cssClass.join(constants.SPACE), content: '' });
        }
    }

    /**
     * Removes DropDown.
     *
     * @param {RibbonItemModel} item - Gets the ribbon item.
     * @returns {void}
     * @hidden
     */
    public destroyDropDown(item: RibbonItemModel): void {
        const groupButtonEle: HTMLButtonElement = document.querySelector('#' + item.id);
        if (groupButtonEle) {
            const dropdown: DropDownButton = getComponent(groupButtonEle, DropDownButton);
            const tooltip: Tooltip = getComponent(dropdown.target as HTMLElement, Tooltip);
            tooltip.destroy();
            dropdown.destroy();
            remove(groupButtonEle);
        }
    }

    /**
     * Updates the group button size.
     *
     * @param {HTMLElement} itemElement - Gets the group button container element.
     * @param {RibbonItemModel} item - Gets the ribbon item.
     * @returns {void}
     * @hidden
     */
    public updateGroupButtonSize(itemElement: HTMLElement, item: RibbonItemModel): void {
        const groupBtnSettings: RibbonGroupButtonSettingsModel = item.groupButtonSettings;
        let buttonEle: HTMLElement;
        for (let i: number = 0; i < groupBtnSettings.items.length; i++) {
            if (this.parent.activeLayout === 'Classic') {
                buttonEle = itemElement.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i);
            }
            else {
                buttonEle = document.querySelector('#' + item.id + constants.RIBBON_GROUP_BUTTON_ID + i);
            }
            if (buttonEle) {
                const buttonObj: Button = getComponent(buttonEle, Button);
                buttonObj.setProperties({
                    iconPosition: item.activeSize === RibbonItemSize.Large ? 'Top' : 'Left',
                    content: item.activeSize === RibbonItemSize.Small ? '' : groupBtnSettings.items[parseInt(i.toString(), 10)].content
                });
            }
        }
    }
}
