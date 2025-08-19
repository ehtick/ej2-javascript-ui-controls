import { ChipList, ChipModel, ChipDataArgs, SelectedItem, SelectedItems, ClickEventArgs, DeleteEventArgs, Chip, ChipDeletedEventArgs } from '../src/chips/index';
import { createElement, EventHandler, extend, isNullOrUndefined } from '@syncfusion/ej2-base';

function deepCloning(data: ChipModel[]) {
    return <{ [key: string]: object }[]>extend([], data, [], true);
}

function fireEvent(ele: HTMLElement, type: string, key?: number) {
    let event = document.createEvent('Events');
    event.initEvent(type, true, false);
    ele.dispatchEvent(event);
}

let stringArray: string[] = ['chip1', 'chip2', 'chip3'];
let numberArray: number[] = [1, 2, 3];
let jsonArray: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2' }, { text: 'chip3' }];
let jsonArrayValue: ChipModel[] = [{ text: 'chip1', value:'11' }, { text: 'chip2', value:'22' }, { text: 'chip3', value:'33' }];

describe('Chips', () => {
    let chips: ChipList;
    let element: HTMLElement = createElement('div', { id: 'chip' });
    document.body.appendChild(element);

    describe('DOM Structure', () => {
        describe('Chip component (single)', () => {
            afterEach(() => {
                chips.destroy();
                element.innerText = '';
            });
            it('Chip component with text property', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                //class
                expect(element.classList.contains('e-chip-list')).toBe(true);
                expect(element.classList.contains('e-chip')).toBe(true);
                expect(element.classList.contains('e-chip-set')).toBe(false);
                //attribute
                expect(element.getAttribute('tabindex')).toBe('0');
                expect(element.getAttribute('role')).toBe('button');
                expect(element.getAttribute('aria-label')).toBe('chip content');
                //text content
                expect(element.innerText).toBe('chip content');
            });

            it('Chip component with innertext', () => {
                element.innerText = 'chip innertext';
                chips = new ChipList({ text: 'chip content' }, '#chip');
                //class
                expect(element.classList.contains('e-chip-list')).toBe(true);
                expect(element.classList.contains('e-chip')).toBe(true);
                expect(element.classList.contains('e-chip-set')).toBe(false);
                expect(element.innerText).toBe('chip innertext');
                //attribute
                expect(element.getAttribute('tabindex')).toBe('0');
                expect(element.getAttribute('role')).toBe('button');
                expect(element.getAttribute('aria-label')).toBe('chip innertext');
                //text content
                expect(element.innerText).toBe('chip innertext');
            });

            it('Chip component - Text Element', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                expect(element.children.length).toBe(1);
                let textElement: HTMLElement = element.children[0] as HTMLElement;
                expect(textElement.tagName).toBe('SPAN');
                expect(textElement.classList.contains('e-chip-text')).toBe(true);
                expect(textElement.innerText).toBe('chip content');
            });

            it('Chip component - leadingicon Element', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'icon' }, '#chip');
                expect(element.children.length).toBe(2);
                expect(element.classList.contains('e-chip-icon-wrap')).toBe(true);
                let leadingIconElement: HTMLElement = element.children[0] as HTMLElement;
                expect(leadingIconElement.tagName).toBe('SPAN');
                expect(leadingIconElement.classList.contains('e-chip-icon')).toBe(true);
                expect(leadingIconElement.classList.contains('icon')).toBe(true);

            });

            it('Chip component - Avatar Element', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'icon', avatarIconCss: 'avatar' }, '#chip');
                expect(element.children.length).toBe(2);
                expect(element.classList.contains('e-chip-avatar-wrap')).toBe(true);
                let avatarElement: HTMLElement = element.children[0] as HTMLElement;
                expect(avatarElement.tagName).toBe('SPAN');
                expect(avatarElement.classList.contains('e-chip-avatar')).toBe(true);
                expect(avatarElement.classList.contains('avatar')).toBe(true);
                expect(avatarElement.classList.contains('icon')).toBe(false);
            });

            it('Chip component - AvatarLetter Element', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'icon', avatarIconCss: 'avatar', avatarText: 'MR' }, '#chip');
                expect(element.children.length).toBe(2);
                expect(element.classList.contains('e-chip-avatar-wrap')).toBe(true);
                let avatarElement: HTMLElement = element.children[0] as HTMLElement;
                expect(avatarElement.tagName).toBe('SPAN');
                expect(avatarElement.classList.contains('e-chip-avatar')).toBe(true);
                expect(avatarElement.classList.contains('avatar')).toBe(true);
                expect(avatarElement.classList.contains('icon')).toBe(false);
                expect(avatarElement.innerText).toBe('MR');
            });

            it('Chip component - trailingicon Element', () => {
                chips = new ChipList({ text: 'chip content', trailingIconCss: 'icon' }, '#chip');
                expect(element.children.length).toBe(2);
                let trailingicon: HTMLElement = element.children[1] as HTMLElement;
                expect(trailingicon.tagName).toBe('SPAN');
                expect(trailingicon.classList.contains('e-chip-delete')).toBe(true);
                expect(trailingicon.classList.contains('icon')).toBe(true);
            });

            it('Chip component - combined', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'icon', avatarIconCss: 'avatar', avatarText: 'MR', trailingIconCss: 'icon' }, '#chip');
                expect(element.children.length).toBe(3);
                expect(element.classList.contains('e-chip-avatar-wrap')).toBe(true);
                expect(element.classList.contains('e-chip-icon-wrap')).toBe(false);
                expect(element.children[0].classList.contains('e-chip-avatar')).toBe(true);
                expect(element.children[1].classList.contains('e-chip-text')).toBe(true);
                expect(element.children[2].classList.contains('e-chip-delete')).toBe(true);
            });

            it('Chip component - combined without avatar', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'icon', trailingIconCss: 'icon' }, '#chip');
                expect(element.children.length).toBe(3);
                expect(element.classList.contains('e-chip-icon-wrap')).toBe(true);
                expect(element.classList.contains('e-chip-avatar-wrap')).toBe(false);
                expect(element.children[0].classList.contains('e-chip-icon')).toBe(true);
                expect(element.children[1].classList.contains('e-chip-text')).toBe(true);
                expect(element.children[2].classList.contains('e-chip-delete')).toBe(true);
            });
        });

        describe('ChipList component (set)', () => {
            afterEach(() => {
                chips.destroy();
            });

            it('Chips without text content should act as chipset', () => {
                chips = new ChipList({}, '#chip');
                //class
                expect(element.classList.contains('e-chip-list')).toBe(true);
                expect(element.classList.contains('e-chip')).toBe(false);
                expect(element.classList.contains('e-chip-set')).toBe(true);
                //attribute
                expect(element.getAttribute('role')).toBe('listbox');
                expect(element.getAttribute('aria-multiselectable')).toBe('false');
                //text content
                expect(element.innerText).toBe('');;
            });

            it('Chip component - class', () => {
                chips = new ChipList({ chips: stringArray.slice() }, '#chip');
                expect(element.classList.contains('e-chip-list')).toBe(true);
                expect(element.classList.contains('e-chip')).toBe(false);
                expect(element.classList.contains('e-chip-set')).toBe(true);
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chipCollection[0].classList.contains('e-chip')).toBe(true);
            });
            it('Chip component - attribute', () => {
                chips = new ChipList({ chips: stringArray.slice() }, '#chip');
                expect(element.getAttribute('role')).toBe('listbox');
                expect(element.getAttribute('aria-multiselectable')).toBe('false');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chipCollection[0].getAttribute('role')).toBe('option');
                expect(chipCollection[0].getAttribute('aria-label')).toBe('chip1');
                expect(chipCollection[0].getAttribute('tabindex')).toBe('0');
            });

            it('Chip component - Text Element', () => {
                chips = new ChipList({ chips: stringArray.slice() }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let firstChipTextElement: HTMLElement = chipCollection[0].children[0] as HTMLElement;
                expect(firstChipTextElement.tagName).toBe('SPAN');
                expect(firstChipTextElement.classList.contains('e-chip-text')).toBe(true);
                expect(firstChipTextElement.innerText).toBe('chip1');
            });

            it('Chip component - leadingicon Element', () => {
                chips = new ChipList({ chips: stringArray.slice(), leadingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(2);
                expect(chipCollection[0].classList.contains('e-chip-icon-wrap')).toBe(true);
                let leadingIconElement: HTMLElement = chipCollection[0].children[0] as HTMLElement;
                expect(leadingIconElement.tagName).toBe('SPAN');
                expect(leadingIconElement.classList.contains('e-chip-icon')).toBe(true);
                expect(leadingIconElement.classList.contains('icon')).toBe(true);

            });

            it('Chip component - Avatar Element', () => {
                chips = new ChipList({ chips: stringArray.slice(), leadingIconCss: 'icon', avatarIconCss: 'avatar' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(2);
                expect(chipCollection[0].classList.contains('e-chip-avatar-wrap')).toBe(true);
                let avatarElement: HTMLElement = chipCollection[0].children[0] as HTMLElement;
                expect(avatarElement.tagName).toBe('SPAN');
                expect(avatarElement.classList.contains('e-chip-avatar')).toBe(true);
                expect(avatarElement.classList.contains('avatar')).toBe(true);
                expect(avatarElement.classList.contains('icon')).toBe(false);
            });

            it('Chip component - AvatarLetter Element', () => {
                chips = new ChipList({ chips: stringArray.slice(), leadingIconCss: 'icon', avatarIconCss: 'avatar', avatarText: 'MR' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(2);
                expect(chipCollection[0].classList.contains('e-chip-avatar-wrap')).toBe(true);
                let avatarElement: HTMLElement = chipCollection[0].children[0] as HTMLElement;
                expect(avatarElement.tagName).toBe('SPAN');
                expect(avatarElement.classList.contains('e-chip-avatar')).toBe(true);
                expect(avatarElement.classList.contains('avatar')).toBe(true);
                expect(avatarElement.classList.contains('icon')).toBe(false);
                expect(avatarElement.innerText).toBe('MR');
            });

            it('Chip component - trailingicon Element', () => {
                chips = new ChipList({ chips: stringArray.slice(), trailingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(2);
                let trailingicon: HTMLElement = chipCollection[0].children[1] as HTMLElement;
                expect(trailingicon.tagName).toBe('SPAN');
                expect(trailingicon.classList.contains('e-chip-delete')).toBe(true);
                expect(trailingicon.classList.contains('icon')).toBe(true);
            });

            it('Chip component - combined', () => {
                chips = new ChipList({ chips: stringArray.slice(), leadingIconCss: 'icon', avatarIconCss: 'avatar', avatarText: 'MR', trailingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(3);
                expect(chipCollection[0].classList.contains('e-chip-avatar-wrap')).toBe(true);
                expect(chipCollection[0].classList.contains('e-chip-icon-wrap')).toBe(false);
                expect(chipCollection[0].children[0].classList.contains('e-chip-avatar')).toBe(true);
                expect(chipCollection[0].children[1].classList.contains('e-chip-text')).toBe(true);
                expect(chipCollection[0].children[2].classList.contains('e-chip-delete')).toBe(true);
            });

            it('Chip component - combined without avatar', () => {
                chips = new ChipList({ chips: stringArray.slice(), leadingIconCss: 'icon', trailingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].children.length).toBe(3);
                expect(chipCollection[0].classList.contains('e-chip-icon-wrap')).toBe(true);
                expect(chipCollection[0].classList.contains('e-chip-avatar-wrap')).toBe(false);
                expect(chipCollection[0].children[0].classList.contains('e-chip-icon')).toBe(true);
                expect(chipCollection[0].children[1].classList.contains('e-chip-text')).toBe(true);
                expect(chipCollection[0].children[2].classList.contains('e-chip-delete')).toBe(true);
            });

        });
    });
    describe('chips dataSource', () => {
        describe('chip(single) - dataSource', () => {
            afterEach(() => {
                chips.destroy();
                element.innerText = '';
            });
            it('Chip component - text property', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                expect(element.innerText).toBe('chip content');
            });
            it('Chip component - inner text', () => {
                element.innerText = 'chip innertext';
                chips = new ChipList({ text: 'chip content' }, '#chip');
                expect(element.innerText).toBe('chip innertext');
            });
        });
        describe('chiplist(set) - dataSource', () => {
            afterEach(() => {
                chips.destroy();
            });

            it('Chip component - Array of string', () => {
                chips = new ChipList({ chips: stringArray.slice() }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].innerText).toBe('chip1');
                expect(chipCollection[1].innerText).toBe('chip2');
                expect(chipCollection[2].innerText).toBe('chip3');
            });
            it('Chip component - Array of string', () => {
                chips = new ChipList({ chips: numberArray.slice() }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].innerText).toBe('1');
                expect(chipCollection[1].innerText).toBe('2');
                expect(chipCollection[2].innerText).toBe('3');
            });
            it('Chip component - Array of string', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray) }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].innerText).toBe('chip1');
                expect(chipCollection[1].innerText).toBe('chip2');
                expect(chipCollection[2].innerText).toBe('chip3');
            });
        });
    });
    describe('chips property', () => {
        describe('chip(single) - property', () => {
            afterEach(() => {
                chips.destroy();
                element.innerText = '';
            });
            it('Chip component - text', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                expect(element.innerText).toBe('chip content');
                chips.text = 'chip3';
                chips.dataBind();
                expect(element.innerText).toBe('chip3');
            });
            it('Chip component - avatarIconCss', () => {
                chips = new ChipList({ text: 'chip content', avatarIconCss: 'avataricon icon1' }, '#chip');
                let avatarIconelement: HTMLElement = element.querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement.classList.contains('icon1')).toBe(true);
                chips.avatarIconCss = 'avataricon3 io';
                chips.dataBind();
                avatarIconelement = element.querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon3')).toBe(true);
                expect(avatarIconelement.classList.contains('avataricon')).toBe(false);
                expect(avatarIconelement.classList.contains('icon1')).toBe(false);
                expect(avatarIconelement.classList.contains('io')).toBe(true);
            });
            it('Chip component - avatarText', () => {
                chips = new ChipList({ text: 'chip content', avatarIconCss: 'avataricon icon1', avatarText: 'MR' }, '#chip');
                let avatarIconelement: HTMLElement = element.querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement.classList.contains('icon1')).toBe(true);
                expect(avatarIconelement.innerText).toBe('MR');
                chips.avatarIconCss = 'avataricon3 io';
                chips.avatarText = 'AC';
                chips.dataBind();
                avatarIconelement = element.querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon3')).toBe(true);
                expect(avatarIconelement.classList.contains('io')).toBe(true);
                expect(avatarIconelement.classList.contains('avataricon')).toBe(false);
                expect(avatarIconelement.classList.contains('icon1')).toBe(false);
                expect(avatarIconelement.innerText).toBe('AC');
            });
            it('Chip component - leadingIconCss', () => {
                chips = new ChipList({ text: 'chip content', leadingIconCss: 'leadingicon icon1' }, '#chip');
                let leadingIconelement: HTMLElement = element.querySelector('.e-chip-icon');
                expect(leadingIconelement.classList.contains('leadingicon')).toBe(true);
                expect(leadingIconelement.classList.contains('icon1')).toBe(true);
                chips.leadingIconCss = 'leadingicon3 io';
                chips.dataBind();
                leadingIconelement = element.querySelector('.e-chip-icon');
                expect(leadingIconelement.classList.contains('leadingicon3')).toBe(true);
                expect(leadingIconelement.classList.contains('io')).toBe(true);
                expect(leadingIconelement.classList.contains('leadingicon')).toBe(false);
                expect(leadingIconelement.classList.contains('icon1')).toBe(false);
            });
            it('Chip component - trailingIconCss', () => {
                chips = new ChipList({ text: 'chip content', trailingIconCss: 'trailingicon icon1' }, '#chip');
                let trailingIconelement: HTMLElement = element.querySelector('.e-chip-delete');
                expect(trailingIconelement.classList.contains('trailingicon')).toBe(true);
                expect(trailingIconelement.classList.contains('icon1')).toBe(true);
                chips.trailingIconCss = 'trailingicon3 io';
                chips.dataBind();
                trailingIconelement = element.querySelector('.e-chip-delete');
                expect(trailingIconelement.classList.contains('trailingicon3')).toBe(true);
                expect(trailingIconelement.classList.contains('io')).toBe(true);
                expect(trailingIconelement.classList.contains('trailingicon')).toBe(false);
                expect(trailingIconelement.classList.contains('icon1')).toBe(false);
            });
            it('Chip component - iconCss', () => {
                chips = new ChipList({ text: 'chip content', cssClass: 'iconcss icon1' }, '#chip');
                expect(element.classList.contains('iconcss')).toBe(true);
                expect(element.classList.contains('icon1')).toBe(true);
                chips.cssClass = 'iconcss3 io';
                chips.dataBind();
                expect(element.classList.contains('iconcss3')).toBe(true);
                expect(element.classList.contains('io')).toBe(true);
                expect(element.classList.contains('iconcss')).toBe(false);
                expect(element.classList.contains('icon1')).toBe(false);
            });

            it('Chip component - enableRTL', () => {
                chips = new ChipList({ text: 'chip content', enableRtl: true }, '#chip');
                expect(element.classList.contains('e-rtl')).toBe(true);
                chips.enableRtl = false;
                chips.dataBind();
                expect(element.classList.contains('e-rtl')).toBe(false);
            });

            it('Chip component - enabled', () => {
                chips = new ChipList({ text: 'chip content', enabled: false }, '#chip');
                expect(element.classList.contains('e-disabled')).toBe(true);
                chips.enabled = true;
                chips.dataBind();
                expect(element.classList.contains('e-disabled')).toBe(false);
            });
            it('Chip component - enableDelete should not work', () => {
                chips = new ChipList({ text: 'chip content', enableDelete: true }, '#chip');
                let deleteElement: HTMLElement = element.querySelector('.e-chip-delete');
                expect(deleteElement).toBe(null);
            });
            it('Chip component - selection(Single) should not work', () => {
                chips = new ChipList({ text: 'chip content', selection: 'Single' }, '#chip');
                expect(element.getAttribute('aria-multiselectable')).toBe(null);
                fireEvent(element, 'click');
                let activeElement: HTMLElement = element.querySelector('.e-active');
                expect(activeElement).toBe(null);
            });
            it('Chip component - selection(Multiple) should not work', () => {
                chips = new ChipList({ text: 'chip content', selection: "Multiple" }, '#chip');
                expect(element.getAttribute('aria-multiselectable')).toBe(null);
                fireEvent(element, 'click');
                let activeElement: HTMLElement = element.querySelector('.e-active');
                expect(activeElement).toBe(null);
            });
            it('Chip component - selectedChips should not work', () => {
                chips = new ChipList({ text: 'chip content', selection: "Single", selectedChips: 0 }, '#chip');
                expect(element.getAttribute('aria-multiselectable')).toBe(null);
                let activeElement: HTMLElement = element.querySelector('.e-active');
                expect(activeElement).toBe(null);
            });
            it('Chip component - enablePersistance', () => {
                chips = new ChipList({ text: 'chip content', enablePersistence: true }, '#chip');
            });
        });
        describe('chiplist(set) - property', () => {
            afterEach(() => {
                chips.destroy();
                element.innerText = '';
            });
            it('Chip component - text', () => {
                chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray) }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chipCollection[0].innerText).toBe('chip1');
                expect(chipCollection[1].innerText).toBe('chip2');
                expect(chipCollection[2].innerText).toBe('chip3');
                chips.chips = [{ text: 'newchip' }];
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(1);
                expect(chipCollection[0].innerText).toBe('newchip');
            });

            it('Chip component - avatarIconCss (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), avatarIconCss: 'avataricon icon1' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let avatarIconelement: HTMLElement = chipCollection[0].querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement.classList.contains('icon1')).toBe(true);
                chips.avatarIconCss = 'avataricon3 io';
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                avatarIconelement = chipCollection[0].querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon3')).toBe(true);
                expect(avatarIconelement.classList.contains('avataricon')).toBe(false);
                expect(avatarIconelement.classList.contains('icon1')).toBe(false);
                expect(avatarIconelement.classList.contains('io')).toBe(true);
            });

            it('Chip component - avatarIconCss (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', avatarIconCss: 'avataricon2 icon2' }]
                chips = new ChipList({ text: 'chip content', chips: ds, avatarIconCss: 'avataricon icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let avatarIconelement1: HTMLElement = chipCollection[0].querySelector('.e-chip-avatar');
                let avatarIconelement2: HTMLElement = chipCollection[1].querySelector('.e-chip-avatar');
                expect(avatarIconelement1.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement1.classList.contains('icon')).toBe(true);
                expect(avatarIconelement2.classList.contains('avataricon2')).toBe(true);
                expect(avatarIconelement2.classList.contains('icon2')).toBe(true);
            });

            it('Chip component - avatarText (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), avatarIconCss: 'avataricon icon1', avatarText: 'MR' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let avatarIconelement: HTMLElement = chipCollection[0].querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement.classList.contains('icon1')).toBe(true);
                expect(avatarIconelement.innerText).toBe('MR');
                chips.avatarIconCss = 'avataricon3 io';
                chips.avatarText = 'AC';
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                avatarIconelement = chipCollection[0].querySelector('.e-chip-avatar');
                expect(avatarIconelement.classList.contains('avataricon3')).toBe(true);
                expect(avatarIconelement.classList.contains('io')).toBe(true);
                expect(avatarIconelement.classList.contains('avataricon')).toBe(false);
                expect(avatarIconelement.classList.contains('icon1')).toBe(false);
                expect(avatarIconelement.innerText).toBe('AC');
            });
            it('Chip component - avatarText (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', avatarIconCss: 'avataricon2 icon2', avatarText: 'AR' }]
                chips = new ChipList({ text: 'chip content', chips: ds, avatarIconCss: 'avataricon icon', avatarText: 'MR' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let avatarIconelement1: HTMLElement = chipCollection[0].querySelector('.e-chip-avatar');
                let avatarIconelement2: HTMLElement = chipCollection[1].querySelector('.e-chip-avatar');
                expect(avatarIconelement1.classList.contains('avataricon')).toBe(true);
                expect(avatarIconelement1.classList.contains('icon')).toBe(true);
                expect(avatarIconelement1.innerText).toBe('MR');
                expect(avatarIconelement2.classList.contains('avataricon2')).toBe(true);
                expect(avatarIconelement2.classList.contains('icon2')).toBe(true);
                expect(avatarIconelement2.innerText).toBe('AR');
            });
            it('Chip component - leadingIconCss (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), leadingIconCss: 'leadingicon icon1' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let leadingIconelement: HTMLElement = chipCollection[0].querySelector('.e-chip-icon');
                expect(leadingIconelement.classList.contains('leadingicon')).toBe(true);
                expect(leadingIconelement.classList.contains('icon1')).toBe(true);
                chips.leadingIconCss = 'leadingicon3 io';
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                leadingIconelement = chipCollection[0].querySelector('.e-chip-icon');
                expect(leadingIconelement.classList.contains('leadingicon3')).toBe(true);
                expect(leadingIconelement.classList.contains('io')).toBe(true);
                expect(leadingIconelement.classList.contains('leadingicon')).toBe(false);
                expect(leadingIconelement.classList.contains('icon1')).toBe(false);
            });

            it('Chip component - leadingIconCss (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', leadingIconCss: 'leadingicon2 icon2' }]
                chips = new ChipList({ text: 'chip content', chips: ds, leadingIconCss: 'leadingicon icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let leadingIconelement1: HTMLElement = chipCollection[0].querySelector('.e-chip-icon');
                let leadingIconelement2: HTMLElement = chipCollection[1].querySelector('.e-chip-icon');
                expect(leadingIconelement1.classList.contains('leadingicon')).toBe(true);
                expect(leadingIconelement1.classList.contains('icon')).toBe(true);
                expect(leadingIconelement2.classList.contains('leadingicon2')).toBe(true);
                expect(leadingIconelement2.classList.contains('icon2')).toBe(true);
            });
            it('Chip component - trailingIconCss (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), trailingIconCss: 'trailingicon icon1' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let trailingIconelement: HTMLElement = chipCollection[0].querySelector('.e-chip-delete');
                expect(trailingIconelement.classList.contains('trailingicon')).toBe(true);
                expect(trailingIconelement.classList.contains('icon1')).toBe(true);
                chips.trailingIconCss = 'trailingicon3 io';
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                trailingIconelement = chipCollection[0].querySelector('.e-chip-delete');
                expect(trailingIconelement.classList.contains('trailingicon3')).toBe(true);
                expect(trailingIconelement.classList.contains('io')).toBe(true);
                expect(trailingIconelement.classList.contains('trailingicon')).toBe(false);
                expect(trailingIconelement.classList.contains('icon1')).toBe(false);
            });

            it('Chip component - trailingIconCss (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', trailingIconCss: 'trailingicon2 icon2' }]
                chips = new ChipList({ text: 'chip content', chips: ds, trailingIconCss: 'trailingicon icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let trailingIconelement1: HTMLElement = chipCollection[0].querySelector('.e-chip-delete');
                let trailingIconelement2: HTMLElement = chipCollection[1].querySelector('.e-chip-delete');
                expect(trailingIconelement1.classList.contains('trailingicon')).toBe(true);
                expect(trailingIconelement1.classList.contains('icon')).toBe(true);
                expect(trailingIconelement2.classList.contains('trailingicon2')).toBe(true);
                expect(trailingIconelement2.classList.contains('icon2')).toBe(true);
            });
            it('Chip component - cssClass (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), cssClass: 'iconcss icon1' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('iconcss')).toBe(true);
                expect(chipCollection[0].classList.contains('icon1')).toBe(true);
                chips.cssClass = 'iconcss3 io';
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('iconcss3')).toBe(true);
                expect(chipCollection[0].classList.contains('io')).toBe(true);
                expect(chipCollection[0].classList.contains('iconcss')).toBe(false);
                expect(chipCollection[0].classList.contains('icon1')).toBe(false);
            });
            it('Chip component - cssClass (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', cssClass: 'iconcss2 icon2' }]
                chips = new ChipList({ text: 'chip content', chips: ds, cssClass: 'iconcss icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('iconcss')).toBe(true);
                expect(chipCollection[0].classList.contains('icon')).toBe(true);
                expect(chipCollection[1].classList.contains('iconcss2')).toBe(true);
                expect(chipCollection[1].classList.contains('icon2')).toBe(true);
            });

            it('Chip component - enabled (common)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), enabled: false }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('e-disabled')).toBe(true);
                chips.enabled = true;
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('e-disabled')).toBe(false);
            });

            it('Chip component - enabled (Json)', () => {
                let ds: ChipModel[] = [{ text: 'chip1' }, { text: 'chip2', enabled: true }, { text: 'chip2', enabled: false }]
                chips = new ChipList({ text: 'chip content', chips: ds, enabled: false }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection[0].classList.contains('e-disabled')).toBe(true);
                expect(chipCollection[1].classList.contains('e-disabled')).toBe(false);
                expect(chipCollection[2].classList.contains('e-disabled')).toBe(true);
            });

            it('Chip component - enableRTL', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), enableRtl: true }, '#chip');
                expect(element.classList.contains('e-rtl')).toBe(true);
                chips.enableRtl = false;
                chips.dataBind();
                expect(element.classList.contains('e-rtl')).toBe(false);
            });

            it('Chip component - enableDelete', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), enableDelete: true }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                let deleteElement: HTMLElement = chipCollection[0].querySelector('.e-chip-delete');
                expect(deleteElement.classList.contains('e-dlt-btn')).toBe(true);
                fireEvent(deleteElement, 'click');
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(2);
            });

            it('Chip component - selection(Single)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: 'Single' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(element.getAttribute('aria-multiselectable')).toBe('false');
                expect(chipCollection.length).toBe(3);
                fireEvent(chipCollection[0], 'click');
                let activeElement: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[0]);
                fireEvent(chipCollection[1], 'click');
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[1]);
            });

            it('Chip component - selection(Multiple)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: 'Multiple' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(element.getAttribute('aria-multiselectable')).toBe('true');
                expect(chipCollection.length).toBe(3);
                fireEvent(chipCollection[0], 'click');
                let activeElement: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[0]);
                fireEvent(chipCollection[1], 'click');
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(2);
                expect(activeElement[0]).toBe(chipCollection[0]);
                expect(activeElement[1]).toBe(chipCollection[1]);
            });
            it('Chip component - selectedChips(Single)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: "Single", selectedChips: 0 }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let activeElement: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[0]);
                //array of index = will select last one
                chips.selectedChips = [1, 2];
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[2]);
                let resultantdata: SelectedItem = chips.getSelectedChips() as SelectedItem;
                expect(resultantdata.index).toBe(2);
            });
            it('Chip component - selectedChips(Single) with aria-label', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: "Single", selectedChips: 0 }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let activeElement: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                let chipSelected: HTMLElement = activeElement[0]
                expect(activeElement[0]).toBe(chipCollection[0]);
                expect(chipSelected.getAttribute("aria-selected")).toBe('true');
                //array of index = will select last one
                chips.selectedChips = [1, 2];
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(chipSelected.getAttribute("aria-selected")).toBe('false');
                expect(activeElement[0].getAttribute("aria-selected")).toBe('true');
                expect(activeElement[0]).toBe(chipCollection[2]);
                let resultantdata: SelectedItem = chips.getSelectedChips() as SelectedItem;
                expect(resultantdata.index).toBe(2);
            });
            it('Chip component - selectedChips(Multiple)', () => {
                chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: "Multiple", selectedChips: 0 }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let activeElement: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(1);
                expect(activeElement[0]).toBe(chipCollection[0]);
                //array of index
                chips.selectedChips = [0,1, 2];
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(3);
                expect(activeElement[0]).toBe(chipCollection[0]);
                expect(activeElement[1]).toBe(chipCollection[1]);
                expect(activeElement[2]).toBe(chipCollection[2]);
                chips.selectedChips = [0,1];
                chips.dataBind();
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                activeElement = Array.prototype.slice.call(element.querySelectorAll('.e-active'));
                expect(activeElement.length).toBe(2);
                expect(activeElement[0]).toBe(chipCollection[0]);
                expect(activeElement[1]).toBe(chipCollection[1]);
                let resultantdata: SelectedItems = chips.getSelectedChips() as SelectedItems;
                let indexes : number[] = resultantdata.Indexes;
                let selectedChips : number[] = chips.selectedChips;
                expect(indexes[0]).toBe(selectedChips[0]);
                expect(indexes[1]).toBe(selectedChips[1]);
                chips.select(0);
                expect(chips.selectedChips[0]).toBe(1);
            });
        });
    });

    describe('chips APIs', () => {
        describe('chip(single) - APIs', () => {
            afterEach(() => {
                chips.destroy();
                element.innerText = '';
            });
            it('Add method - should not work', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                chips.add(2);
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(0);
                expect(chips.chips.length).toBe(0);
            });

            it('Remove method - should not work', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                chips.remove(2);
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(0);
                expect(chips.chips.length).toBe(0);
            });

            it('Find method - should not work', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                let resultantdata: ChipDataArgs = chips.find(0);
                expect(resultantdata.text).toBe('');
                expect(resultantdata.index).toBe(-1);
                expect(resultantdata.element).toBe(chips.element);
                expect(resultantdata.data).toBe('');
            });

            it('select & getSelectedChips method - should not work', () => {
                chips = new ChipList({ text: 'chip content' }, '#chip');
                chips.select(0);
                let resultantdata: SelectedItem = chips.getSelectedChips() as SelectedItem;
                expect(resultantdata).toBe(undefined);
            });
        });
        describe('chiplist(set)  - APIs', () => {
            afterEach(() => {
                chips.destroy();
            });
            it('Add method - string[] data', () => {
                chips = new ChipList({ chips: stringArray.slice(), cssClass: 'newchip', avatarIconCss: 'avatar', trailingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chips.chips.length).toBe(3);
                //single data
                chips.add('chip4');
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(4);
                expect(chips.chips.length).toBe(4);
                expect(chips.chips[3]).toBe('chip4');
                expect(chipCollection[3].innerText).toBe('chip4');
                expect(chipCollection[3].classList.contains('newchip')).toBe(true);
                //array of data
                chips.add(['chip5', 'chip6']);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(6);
                expect(chips.chips.length).toBe(6);
                expect(chips.chips[4]).toBe('chip5');
                expect(chipCollection[4].innerText).toBe('chip5');
                expect(chipCollection[4].children[0].classList.contains('avatar')).toBe(true);
                expect(chips.chips[5]).toBe('chip6');
                expect(chipCollection[5].innerText).toBe('chip6');
                expect(chipCollection[5].children[2].classList.contains('icon')).toBe(true);
            });
            it('Add method - numbber[] data', () => {
                chips = new ChipList({ chips: numberArray.slice(), cssClass: 'newchip', avatarIconCss: 'avatar', trailingIconCss: 'icon' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chips.chips.length).toBe(3);
                //single data
                chips.add(4);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(4);
                expect(chips.chips.length).toBe(4);
                expect(chips.chips[3]).toBe(4);
                expect(chipCollection[3].innerText).toBe('4');
                expect(chipCollection[3].classList.contains('newchip')).toBe(true);
                //array of data
                chips.add([5, 6]);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(6);
                expect(chips.chips.length).toBe(6);
                expect(chips.chips[4]).toBe(5);
                expect(chipCollection[4].innerText).toBe('5');
                expect(chipCollection[4].children[0].classList.contains('avatar')).toBe(true);
                expect(chips.chips[5]).toBe(6);
                expect(chipCollection[5].innerText).toBe('6');
                expect(chipCollection[5].children[2].classList.contains('icon')).toBe(true);
            });
            it('Add method - json data', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray) }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(3);
                expect(chips.chips.length).toBe(3);
                //single data
                chips.add({ text: 'chip4', cssClass: 'newchip' });
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(4);
                expect(chips.chips.length).toBe(4);
                expect((chips.chips[3] as ChipModel).text).toBe('chip4');
                expect(chipCollection[3].innerText).toBe('chip4');
                expect(chipCollection[3].classList.contains('newchip')).toBe(true);
                //array of data
                chips.add([{ text: 'chip5', avatarIconCss: 'avatar' }, { text: 'chip6', trailingIconCss: 'icon' }]);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(6);
                expect(chips.chips.length).toBe(6);
                expect((chips.chips[4] as ChipModel).text).toBe('chip5');
                expect(chipCollection[4].innerText).toBe('chip5');
                expect(chipCollection[4].children[0].classList.contains('avatar')).toBe(true);
                expect((chips.chips[5] as ChipModel).text).toBe('chip6');
                expect(chipCollection[5].innerText).toBe('chip6');
                expect(chipCollection[5].children[1].classList.contains('icon')).toBe(true);
            });
            it('chips property value testing', () => {
                let chips1: ChipList;
                let element1: HTMLElement = createElement('div', { id: 'chip1' });
                document.body.appendChild(element1);
                chips = new ChipList({}, '#chip');
                chips1 = new ChipList({}, '#chip1');
                chips.add('test');  
                expect(chips.chips.length).toBe(1);
                expect(chips1.chips.length).toBe(0);
            });
            it('Remove method using index', () => {
                let ds: string[] = stringArray.slice();
                ds.push('chip4');
                ds.push('chip5');
                chips = new ChipList({ chips: ds }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(5);
                expect(chips.chips.length).toBe(5);
                //single data
                expect(chips.chips[2]).toBe('chip3');
                chips.remove(2);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(4);
                expect(chips.chips.length).toBe(4);
                expect(chips.chips[2]).toBe('chip4');
                //multiple data
                expect(chips.chips[3]).toBe('chip5');
                chips.remove([1, 3]);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(2);
                expect(chips.chips.length).toBe(2);
                expect(chips.chips[1]).toBe('chip4');
                //wrong data
                chips.remove(6);
                expect(chipCollection.length).toBe(2);
            });
            it('Remove method using htmlElement', () => {
                let ds: ChipModel[] = deepCloning(jsonArray);
                ds.push({ text: 'chip4' });
                ds.push({ text: 'chip5' });
                chips = new ChipList({ chips: ds }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(5);
                expect(chips.chips.length).toBe(5);
                //single data
                expect((chips.chips[2] as ChipModel).text).toBe('chip3');
                chips.remove(chipCollection[2]);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(4);
                expect(chips.chips.length).toBe(4);
                expect((chips.chips[2] as ChipModel).text).toBe('chip4');
                //multiple data
                expect((chips.chips[3] as ChipModel).text).toBe('chip5');
                chips.remove([chipCollection[1], chipCollection[3]]);
                chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                expect(chipCollection.length).toBe(2);
                expect(chips.chips.length).toBe(2);
                expect((chips.chips[1] as ChipModel).text).toBe('chip4');
            });

            it('Find method using index', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray) }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let resultantData: ChipDataArgs = chips.find(1);
                expect((resultantData.data as ChipModel).text).toBe('chip2');
                expect(resultantData.element).toBe(chipCollection[1]);
                expect(resultantData.index).toBe(1);
                expect(resultantData.text).toBe('chip2');
                //wrong data
                resultantData = chips.find(8);
                expect(resultantData.text).toBe('');
                expect(resultantData.index).toBe(-1);
                expect(resultantData.element).toBe(chips.element);
                expect(resultantData.data).toBe('');
            });

            it('Find method using htmlElement', () => {
                chips = new ChipList({ chips: stringArray.slice() }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let resultantData: ChipDataArgs = chips.find(chipCollection[1]);
                expect(resultantData.data).toBe('chip2');
                expect(resultantData.element).toBe(chipCollection[1]);
                expect(resultantData.index).toBe(1);
                expect(resultantData.text).toBe('chip2');
            });

            it('Find method without text', () => {
                chips = new ChipList({ chips: [{ leadingIconCss: 'icon1' }, { leadingIconCss: 'icon2' }] }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                let resultantData: ChipDataArgs = chips.find(0);
                expect((resultantData.data as ChipModel).text).toBe(undefined);
                expect((resultantData.data as ChipModel).leadingIconCss).toBe('icon1');
                expect(resultantData.element).toBe(chipCollection[0]);
                expect(resultantData.index).toBe(0);
                expect(resultantData.text).toBe('');
                //wrong data
                resultantData = chips.find(8);
                expect(resultantData.text).toBe('');
                expect(resultantData.index).toBe(-1);
                expect(resultantData.element).toBe(chips.element);
                expect(resultantData.data).toBe('');
            });

            it('select & getSelectedChips method using index [Single selection]', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray), selection: 'Single' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                //single selection
                chips.select(1);
                let resultantData: SelectedItem = chips.getSelectedChips() as SelectedItem;
                expect((resultantData.data as ChipModel).text).toBe('chip2');
                expect(resultantData.element).toBe(chipCollection[1]);
                expect(resultantData.index).toBe(1);
                expect(resultantData.text).toBe('chip2');
                chips.select(1);
                resultantData = chips.getSelectedChips() as SelectedItem;
                expect(resultantData).toBe(undefined);
                //multiple selection will toggle last index
                chips.select([1, 2]);
                resultantData = chips.getSelectedChips() as SelectedItem;
                expect((resultantData.data as ChipModel).text).toBe('chip3');
                expect(resultantData.element).toBe(chipCollection[2]);
                expect(resultantData.index).toBe(2);
                expect(resultantData.text).toBe('chip3');
                //wrong data
                chips.select(7);
                resultantData = chips.getSelectedChips() as SelectedItem;
                expect((resultantData.data as ChipModel).text).toBe('chip3');
            });

            it('select & getSelectedChips method using htmlElement [Single selection]', () => {
                chips = new ChipList({ chips: stringArray.slice(), selection: 'Single' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                //single selection
                chips.select(chipCollection[1]);
                let resultantData: SelectedItem = chips.getSelectedChips() as SelectedItem;
                expect(resultantData.data).toBe('chip2');
                expect(resultantData.element).toBe(chipCollection[1]);
                expect(resultantData.index).toBe(1);
                expect(resultantData.text).toBe('chip2');
                chips.select(chipCollection[1]);
                resultantData = chips.getSelectedChips() as SelectedItem;
                expect(resultantData).toBe(undefined);
                //multiple selection will toggle last index
                chips.select([chipCollection[1], chipCollection[2]]);
                resultantData = chips.getSelectedChips() as SelectedItem;
                expect(resultantData.data).toBe('chip3');
                expect(resultantData.element).toBe(chipCollection[2]);
                expect(resultantData.index).toBe(2);
                expect(resultantData.text).toBe('chip3');
            });

            it('select & getSelectedChips method using index [Multiple selection]', () => {
                chips = new ChipList({ chips: stringArray.slice(), selection: 'Multiple' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                //single selection
                chips.select(1);
                let resultantData: SelectedItems = chips.getSelectedChips() as SelectedItems;
                expect(resultantData.Indexes.length).toBe(1);
                expect(resultantData.data[0]).toBe('chip2');
                expect(resultantData.elements[0]).toBe(chipCollection[1]);
                expect(resultantData.Indexes[0]).toBe(1);
                expect(resultantData.texts[0]).toBe('chip2');
                chips.select(1);
                resultantData = chips.getSelectedChips() as SelectedItems;
                expect(resultantData).toBe(undefined);
                //multiple selection
                chips.select([1, 2]);
                resultantData = chips.getSelectedChips() as SelectedItems;
                expect(resultantData.Indexes.length).toBe(2);
                expect(resultantData.data[0]).toBe('chip2');
                expect(resultantData.elements[0]).toBe(chipCollection[1]);
                expect(resultantData.Indexes[0]).toBe(1);
                expect(resultantData.texts[0]).toBe('chip2');
                expect(resultantData.data[1]).toBe('chip3');
                expect(resultantData.elements[1]).toBe(chipCollection[2]);
                expect(resultantData.Indexes[1]).toBe(2);
                expect(resultantData.texts[1]).toBe('chip3');
            });
            it('select & getSelectedChips method using htmlElement [Multiple selection]', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray), selection: 'Multiple' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                //single selection
                chips.select(chipCollection[1], "index");
                let resultantData: SelectedItems = chips.getSelectedChips() as SelectedItems;
                expect(resultantData.Indexes.length).toBe(1);
                expect((resultantData.data[0] as ChipModel).text).toBe('chip2');
                expect(resultantData.elements[0]).toBe(chipCollection[1]);
                expect(resultantData.Indexes[0]).toBe(1);
                expect(resultantData.texts[0]).toBe('chip2');
                chips.select(chipCollection[1], "index");
                resultantData = chips.getSelectedChips() as SelectedItems;
                expect(resultantData).toBe(undefined);
                //multiple selection
                chips.select([chipCollection[1], chipCollection[2]], "index");
                resultantData = chips.getSelectedChips() as SelectedItems;
                expect(resultantData.Indexes.length).toBe(2);
                expect((resultantData.data[0] as ChipModel).text).toBe('chip2');
                expect(resultantData.elements[0]).toBe(chipCollection[1]);
                expect(resultantData.Indexes[0]).toBe(1);
                expect(resultantData.texts[0]).toBe('chip2');
                expect((resultantData.data[1] as ChipModel).text).toBe('chip3');
                expect(resultantData.elements[1]).toBe(chipCollection[2]);
                expect(resultantData.Indexes[1]).toBe(2);
                expect(resultantData.texts[1]).toBe('chip3');
                chips.select(['chip1'], "text");
                resultantData = chips.getSelectedChips() as SelectedItems;
                expect(resultantData.texts[0]).toBe('chip1');
            });
            it('Multiple selection without value property', () => {
                chips = new ChipList({ chips: deepCloning(jsonArray), selection: 'Multiple' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                chips.select(chipCollection[1]);
                let resultantData: SelectedItems = chips.getSelectedChips() as SelectedItems;
                expect((resultantData.Indexes[0])).toBe(1);
            });
            it('Multiple selection using value property', () => {
                chips = new ChipList({ chips: deepCloning(jsonArrayValue), selection: 'Multiple' }, '#chip');
                let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                chips.select(chipCollection[1] , "index");
                let selectedValule1: string | string[] = `${chips.selectedChips}`;
                expect(selectedValule1).toBe('22');
                chips.select([11], "value");
                selectedValule1 = `${chips.selectedChips}`;
                expect(selectedValule1).toBe('11,22');
            });
        });
    });
    describe('chip - Events', () => {
        describe('chip component - Mouse', () => {
            describe('Click Event', () => {
                afterEach(() => {
                    chips.destroy();
                    element.innerText = "";
                });
                it('click event (Chip)- selection(none)', () => {
                    chips = new ChipList({ text: 'chip content', click: onClick }, '#chip');
                    fireEvent(element, 'click');
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip content');
                        expect(e.element).toBe(element);
                        expect(e.text).toBe('chip content');
                    }
                });

                it('click event (Chip)- selection(none)', () => {
                    element.innerText = "chiptext";
                    chips = new ChipList({ text: 'chip content', click: onClick }, '#chip');
                    fireEvent(element, 'click');
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip content');
                        expect(e.element).toBe(element);
                        expect(e.text).toBe('chiptext');
                    }
                });

                it('click event (Chipset)- selection(none)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    fireEvent(chipCollection[1], 'click');
                    function onClick(e: ClickEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                    }
                });
                it('click event (Chipset)- selection(Single)', () => {
                    chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: "Single", click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    fireEvent(chipCollection[1], 'click');
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.selected).toBe(true);
                    }
                });
                it('click event (Chipset)- selection(Multiple)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple", click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    fireEvent(chipCollection[1], 'click');
                    function onClick(e: ClickEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.selected).toBe(true);
                    }
                });

                it('clicking wrong wrapper', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple" }, '#chip');
                    let clickfunction: jasmine.Spy = jasmine.createSpy('clickfunction');
                    chips.click = clickfunction;
                    fireEvent(element, 'click');
                    expect(clickfunction).not.toHaveBeenCalled();
                });
            });
            describe('Delete Event', () => {
                afterEach(() => {
                    chips.destroy();
                });
                it('delete event (Chipset)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Single", enableDelete: true, delete: onDelete }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                    fireEvent(chipCollection[1].querySelector('.e-chip-delete'), 'click');
                    function onDelete(e: DeleteEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.cancel).toBe(false);
                    }
                    chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(2);
                });
                it('delete event - cancel (Chipset)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Single", enableDelete: true, delete: onDelete }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                    fireEvent(chipCollection[1].querySelector('.e-chip-delete'), 'click');
                    function onDelete(e: DeleteEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.cancel).toBe(false);

                        e.cancel = true;
                    }
                    chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                });
            });
            describe('Deleted Event', () => {
                afterEach(() => {
                    chips.destroy();
                });
                it('deleted event (Chipset)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Single", enableDelete: true, deleted: onDeleted }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                    fireEvent(chipCollection[0].querySelector('.e-chip-delete'), 'click');
                    function onDeleted(e: ChipDeletedEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip1');
                        expect(e.text).toBe('chip1');
                        expect(e.index).toBe(0);
                    }
                    chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(2);
                });
            });
        });
        describe('chip - keyboardEvents', () => {
            describe('Click Event', () => {
                afterEach(() => {
                    chips.destroy();
                    element.innerText = "";
                });
                it('click event (Chip)- selection(none)', () => {
                    chips = new ChipList({ text: 'chip content', click: onClick }, '#chip');
                    (chips as any).keyHandler({ target: element, keyCode: 13, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip content');
                        expect(e.element).toBe(element);
                        expect(e.text).toBe('chip content');
                    }
                });

                it('click event (Chip)- selection(none)', () => {
                    element.innerText = "chiptext";
                    chips = new ChipList({ text: 'chip content', click: onClick }, '#chip');
                    (chips as any).keyHandler({ target: element, keyCode: 13, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip content');
                        expect(e.element).toBe(element);
                        expect(e.text).toBe('chiptext');
                    }
                });

                it('click event (Chipset)- selection(none)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 13, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                    }
                });
                it('click event (Chipset)- selection(Single)', () => {
                    chips = new ChipList({ text: 'chip content', chips: stringArray.slice(), selection: "Single", click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 13, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect(e.data).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.selected).toBe(true);
                    }
                });
                it('click event (Chipset)- selection(Multiple)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple", click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 13, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.selected).toBe(true);
                    }
                });

                it('click event (Chipset) with space key- selection(Multiple)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple", click: onClick }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 32, type: 'keydown' });
                    function onClick(e: ClickEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.selected).toBe(true);
                    }
                });

                it('Pressing wrong key', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple" }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    let clickfunction: jasmine.Spy = jasmine.createSpy('clickfunction');
                    chips.click = clickfunction;
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 34, type: 'keydown' });
                    expect(clickfunction).not.toHaveBeenCalled();
                });
                it('wrong target', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Multiple" }, '#chip');
                    let clickfunction: jasmine.Spy = jasmine.createSpy('clickfunction');
                    chips.click = clickfunction;
                    (chips as any).keyHandler({ target: element, keyCode: 13, type: 'keydown' });
                    expect(clickfunction).not.toHaveBeenCalled();
                });
            });
            describe('Delete Event', () => {
                afterEach(() => {
                    chips.destroy();
                });
                it('delete event (Chipset)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Single", enableDelete: true, delete: onDelete }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 46, type: 'keydown' });
                    function onDelete(e: DeleteEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.cancel).toBe(false);
                    }
                    chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(2);
                    expect(chipCollection[1].classList.contains('e-focused')).toBe(true);
                });
                it('delete event - cancel (Chipset)', () => {
                    chips = new ChipList({ text: 'chip content', chips: deepCloning(jsonArray), selection: "Single", enableDelete: true, delete: onDelete }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                    (chips as any).keyHandler({ target: chipCollection[1], keyCode: 46, type: 'keydown' });
                    function onDelete(e: DeleteEventArgs) {
                        expect((e.data as ChipModel).text).toBe('chip2');
                        expect(e.element).toBe(chipCollection[1]);
                        expect(e.text).toBe('chip2');
                        expect(e.index).toBe(1);
                        expect(e.cancel).toBe(false);
                        e.cancel = true;
                    }
                    chipCollection = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    expect(chipCollection.length).toBe(3);
                });
            });
            describe('Focus handler', () => {
                afterEach(() => {
                    chips.destroy();
                });
                it('chip(single) focus - kewyboard', () => {
                    chips = new ChipList({ text: 'chip content', leadingIconUrl:'http://ej2.syncfusion.com/demos/src/chips/images/anne.png',
                        trailingIconUrl:'http://ej2.syncfusion.com/demos/src/chips/images/anne.png' }, '#chip');
                    (chips as any).keyHandler({ target: element, type: 'keyup', keyCode: 9 });
                    (chips as any).keyHandler({ target: element, type: 'keyup', keyCode: 9 });
                    expect(element.classList.contains('e-focused')).toBe(true);
                    (chips as any).focusOutHandler({ target: element });
                    expect(element.classList.contains('e-focused')).toBe(false);
                });

                it('chipset focus', () => {
                    chips = new ChipList({ text: 'chip content', chips: stringArray.slice() }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: chipCollection[1], type: 'keyup', keyCode: 9 });
                    expect(chipCollection[1].classList.contains('e-focused')).toBe(true);
                    (chips as any).focusOutHandler({ target: chipCollection[1] });
                    expect(chipCollection[2].classList.contains('e-focused')).toBe(false);
                });
                it('Wrong key focus code - chip', () => {
                    new Chip();
                    chips = new ChipList({ text: 'chip content' }, '#chip');
                    (chips as any).keyHandler({ target: element, type: 'keyup', keyCode: 19 });
                    expect(element.classList.contains('e-focused')).toBe(false);
                });
                it('Wrong wrapper focus -  chip', () => {
                    new Chip();
                    chips = new ChipList({ text: 'chip content' }, '#chip');
                    (chips as any).keyHandler({ target: element.firstElementChild, type: 'keyup', keyCode: 9 });
                    expect(element.classList.contains('e-focused')).toBe(false);
                    (chips as any).focusOutHandler({ target: element.firstElementChild });
                    expect(element.classList.contains('e-focused')).toBe(false);
                });
                it('Wrong wrapper focus - chipset', () => {
                    new Chip();
                    chips = new ChipList({ text: 'chip content', chips: stringArray.slice() }, '#chip');
                    let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
                    (chips as any).keyHandler({ target: element, type: 'keyup', keyCode: 9 });
                    expect(chipCollection[1].classList.contains('e-focused')).toBe(false);
                    (chips as any).focusOutHandler({ target: chipCollection[1] });
                    expect(chipCollection[1].classList.contains('e-focused')).toBe(false);
                });
            });
        });
    });

    describe('Null or undefined value testing', () => {
        afterEach(() => {
            chips.destroy();
            element.innerText = '';
        });
        it('chips', () => {
            chips = new ChipList({ chips: null }, '#chip');
            expect(chips.chips).toBe(null);
            chips.destroy();
            chips = new ChipList({ chips: undefined }, '#chip');
            expect(chips.chips).toEqual([]);
            chips.destroy();
        });
        it('text', () => {
            chips = new ChipList({ text: null }, '#chip');
            expect(chips.text).toBe(null);
            chips.destroy();
            chips = new ChipList({ text: undefined }, '#chip');
            expect(chips.text).toBe('');
            chips.destroy();
        });
        it('avatarText', () => {
            chips = new ChipList({ avatarText: null }, '#chip');
            expect(chips.avatarText).toBe(null);
            chips.destroy();
            chips = new ChipList({ avatarText: undefined }, '#chip');
            expect(chips.avatarText).toBe('');
            chips.destroy();
        });
        it('avatarIconCss', () => {
            chips = new ChipList({ avatarIconCss: null }, '#chip');
            expect(chips.avatarIconCss).toBe(null);
            chips.destroy();
            chips = new ChipList({ avatarIconCss: undefined }, '#chip');
            expect(chips.avatarIconCss).toBe('');
            chips.destroy();
        });
        it('leadingIconCss', () => {
            chips = new ChipList({ leadingIconCss: null }, '#chip');
            expect(chips.leadingIconCss).toBe(null);
            chips.destroy();
            chips = new ChipList({ leadingIconCss: undefined }, '#chip');
            expect(chips.leadingIconCss).toBe('');
            chips.destroy();
        });
        it('trailingIconCss', () => {
            chips = new ChipList({ trailingIconCss: null }, '#chip');
            expect(chips.trailingIconCss).toBe(null);
            chips.destroy();
            chips = new ChipList({ trailingIconCss: undefined }, '#chip');
            expect(chips.trailingIconCss).toBe('');
            chips.destroy();
        });
        it('cssClass', () => {
            chips = new ChipList({ cssClass: null }, '#chip');
            expect(chips.cssClass).toBe(null);
            chips.destroy();
            chips = new ChipList({ cssClass: undefined }, '#chip');
            expect(chips.cssClass).toBe('');
            chips.destroy();
        });
        it('selection', () => {
            chips = new ChipList({ selection: null }, '#chip');
            expect(chips.selection).toBe(null);
            chips.destroy();
            chips = new ChipList({ selection: undefined }, '#chip');
            expect(chips.selection).toBe('None');
            chips.destroy();
        });
        it('htmlAttributes', () => {
            chips = new ChipList({ htmlAttributes: null }, '#chip');
            expect(chips.htmlAttributes).toBe(null);
            chips.destroy();
            chips = new ChipList({ htmlAttributes: undefined }, '#chip');
            expect(chips.htmlAttributes).not.toBe(null);
            chips.destroy();
        });
        it('enableDelete', () => {
            chips = new ChipList({ enableDelete: null }, '#chip');
            expect(chips.enableDelete).toBe(null);
            chips.destroy();
            chips = new ChipList({ enableDelete: undefined }, '#chip');
            expect(chips.enableDelete).toBe(false);
            chips.destroy();
        });
        it('leadingIconUrl', () => {
            chips = new ChipList({ leadingIconUrl: null }, '#chip');
            expect(chips.leadingIconUrl).toBe(null);
            chips.destroy();
            chips = new ChipList({ leadingIconUrl: undefined }, '#chip');
            expect(chips.leadingIconUrl).toBe('');
            chips.destroy();
        });
        it('trailingIconUrl', () => {
            chips = new ChipList({ trailingIconUrl: null }, '#chip');
            expect(chips.trailingIconUrl).toBe(null);
            chips.destroy();
            chips = new ChipList({ trailingIconUrl: undefined }, '#chip');
            expect(chips.trailingIconUrl).toBe('');
            chips.destroy();
        });
        it('enabled', () => {
            chips = new ChipList({ enabled: null }, '#chip');
            expect(chips.enabled).toBe(null);
            chips.destroy();
            chips = new ChipList({ enabled: undefined }, '#chip');
            expect(chips.enabled).toBe(true);
            chips.destroy();
        });
        it('enablePersistence', () => {
            chips = new ChipList({ enablePersistence: null }, '#chip');
            expect(chips.enablePersistence).toBe(null);
            chips.destroy();
            chips = new ChipList({ enablePersistence: undefined }, '#chip');
            expect(chips.enablePersistence).toBe(false);
            chips.destroy();
        });
        it('selectedChips', () => {
            chips = new ChipList({ selectedChips: null }, '#chip');
            expect(chips.selectedChips).toBe(null);
            chips.destroy();
            chips = new ChipList({ selectedChips: undefined }, '#chip');
            expect(chips.selectedChips).toEqual([]);
            chips.destroy();
        });
    });

    
    describe('Chips template testing', () => {
        afterEach(() => {
            chips.destroy();
            element.innerText = '';
        });

        it('template content with string type', () => {
            const chipItems: ChipModel[] = [
                { template: '<span>Syncfusion</span>' },
                { template: '<span>Google</span>'},
                { template: '<span>Microsoft</span>'}
            ]
            chips = new ChipList({ chips: chipItems }, '#chip');
            let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
            expect((chipCollection[0].childNodes[1] as any).innerText).toBe('Syncfusion');
            expect((chipCollection[1].childNodes[1] as any).innerText).toBe('Google');
            expect((chipCollection[2].childNodes[1] as any).innerText).toBe('Microsoft');
            chips.destroy();
        });

        it('Anchor tag used as template content with function type', () => {
            const chipItems: ChipModel[] = [
                { template: () => '<a href=https://www.syncfusion.com/ target="_blank"> Syncfusion </a>'},
                { template: () => '<a href=https://www.google.co.in/ target="_blank"> Google </a>'},
                { template: () => '<a href=https://www.microsoft.com/en-in target="_blank"> Microsoft </a>'}
            ]
            chips = new ChipList({ chips: chipItems }, '#chip');
            let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
            expect((chipCollection[0].childNodes[1] as any).innerHTML).toBe('<a href="https://www.syncfusion.com/" target="_blank"> Syncfusion </a>');
            expect((chipCollection[1].childNodes[1] as any).innerHTML).toBe('<a href="https://www.google.co.in/" target="_blank"> Google </a>');
            expect((chipCollection[2].childNodes[1] as any).innerHTML).toBe('<a href="https://www.microsoft.com/en-in" target="_blank"> Microsoft </a>');
            expect((chipCollection[0].childNodes[1] as any).innerText).toBe('Syncfusion');
            expect((chipCollection[1].childNodes[1] as any).innerText).toBe('Google');
            expect((chipCollection[2].childNodes[1] as any).innerText).toBe('Microsoft');
            chips.destroy();
        });

        it('template content with script type', () => {
            // Dynamically add a script template to the DOM
            const scriptTemplate: HTMLScriptElement = document.createElement('script');
            scriptTemplate.type = 'text/x-template';
            scriptTemplate.id = 'chipTemplate';
            scriptTemplate.innerHTML = '<span>Syncfusion</span>';
            document.body.appendChild(scriptTemplate);

            const chipItems: ChipModel[] = [
                { template: '#chipTemplate' },
            ]
            chips = new ChipList({ chips: chipItems }, '#chip');
            let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
            expect((chipCollection[0].childNodes[1] as any).innerText).toBe('Syncfusion');
            chips.destroy();
            document.body.removeChild(scriptTemplate);
        });

        it('template content with text, leadingIconUrl, trailingIconUrl properties', () => {
            const chipItems: ChipModel[] = [
                { template: '<span>Syncfusion</span>', text:'Item 1', leadingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/anne.png", trailingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/anne.png" },
                { template: '<span>Google</span>', text:'Item 2', leadingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/janet.png", trailingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/janet.png"},
                { template: '<span>Microsoft</span>', text:'Item 3', leadingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/laura.png", trailingIconUrl:"//ej2.syncfusion.com/demos/src/chips/images/laura.png"}
            ]
            chips = new ChipList({ chips: chipItems }, '#chip');
            let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
            expect((chipCollection[0].childNodes[0] as any).classList.contains('image-url')).toBe(true);
            expect((chipCollection[1].childNodes[0] as any).classList.contains('image-url')).toBe(true);
            expect((chipCollection[2].childNodes[0] as any).classList.contains('image-url')).toBe(true);
            expect((chipCollection[0].childNodes[1] as any).innerText).toBe('Item 1');
            expect((chipCollection[1].childNodes[1] as any).innerText).toBe('Item 2');
            expect((chipCollection[2].childNodes[1] as any).innerText).toBe('Item 3');
            expect((chipCollection[0].childNodes[2] as any).innerText).toBe('Syncfusion');
            expect((chipCollection[1].childNodes[2] as any).innerText).toBe('Google');
            expect((chipCollection[2].childNodes[2] as any).innerText).toBe('Microsoft');
            expect((chipCollection[0].childNodes[3] as any).classList.contains('trailing-icon-url')).toBe(true);
            expect((chipCollection[1].childNodes[3] as any).classList.contains('trailing-icon-url')).toBe(true);
            expect((chipCollection[2].childNodes[3] as any).classList.contains('trailing-icon-url')).toBe(true);
            chips.destroy();
        });

        it('template content with text, leadingIconCss, trailingIconCss properties', () => {
            const chipItems: ChipModel[] = [
                { template: () => '<span>Syncfusion</span>', text:'Item 1', leadingIconCss:"leadingIconCss-1", trailingIconCss:"trailingIconCss-1" },
                { template: () => '<span>Google</span>', text:'Item 2', leadingIconCss:"leadingIconCss-2", trailingIconCss:"trailingIconCss-2"},
                { template: () => '<span>Microsoft</span>', text:'Item 3', leadingIconCss:"leadingIconCss-3", trailingIconCss:"trailingIconCss-3"}
            ]
            chips = new ChipList({ chips: chipItems }, '#chip');
            let chipCollection: HTMLElement[] = Array.prototype.slice.call(element.querySelectorAll('.e-chip'));
            expect((chipCollection[0].childNodes[0] as any).classList.contains('leadingIconCss-1')).toBe(true);
            expect((chipCollection[1].childNodes[0] as any).classList.contains('leadingIconCss-2')).toBe(true);
            expect((chipCollection[2].childNodes[0] as any).classList.contains('leadingIconCss-3')).toBe(true);
            expect((chipCollection[0].childNodes[1] as any).innerText).toBe('Item 1');
            expect((chipCollection[1].childNodes[1] as any).innerText).toBe('Item 2');
            expect((chipCollection[2].childNodes[1] as any).innerText).toBe('Item 3');
            expect((chipCollection[0].childNodes[2] as any).innerText).toBe('Syncfusion');
            expect((chipCollection[1].childNodes[2] as any).innerText).toBe('Google');
            expect((chipCollection[2].childNodes[2] as any).innerText).toBe('Microsoft');
            expect((chipCollection[0].childNodes[3] as any).classList.contains('trailingIconCss-1')).toBe(true);
            expect((chipCollection[1].childNodes[3] as any).classList.contains('trailingIconCss-2')).toBe(true);
            expect((chipCollection[2].childNodes[3] as any).classList.contains('trailingIconCss-3')).toBe(true);
            chips.destroy();
        });
        
    });

    function copyObject(source: any, destination: any): Object {
        for (let prop in source) {
            destination[prop] = source[prop];
        }
        return destination;
    }

    function getEventObject(eventType: string, eventName: string, currentTarget?: Element, target?: Element, x?: number, y?: number, offset?: number): Object {
        let tempEvent: any = document.createEvent(eventType);
        tempEvent.initEvent(eventName, true, true);
        let returnObject: any = copyObject(tempEvent, {});
        returnObject.preventDefault = () => { return true; };

        if (!isNullOrUndefined(x)) {
            returnObject.pageX = x;
            returnObject.clientX = x;
        }
        if (!isNullOrUndefined(y)) {
            returnObject.pageY = y;
            returnObject.clientY = y;
        }
        if (!isNullOrUndefined(currentTarget)) {
            returnObject.currentTarget = currentTarget;
        }
        if (!isNullOrUndefined(target)) {
            returnObject.target = returnObject.srcElement = returnObject.toElement = target;
            if (!isNullOrUndefined(offset)) {
                returnObject.offsetY = offset;
            } else {
                returnObject.offsetY = 7;
            }
        }
        returnObject.element = currentTarget;
        return returnObject;
    }

    function setMouseCordinates(eventarg: any, x: number, y: number): Object {
        eventarg.pageX = x;
        eventarg.pageY = y;
        eventarg.clientX = x;
        eventarg.clientY = y;
        eventarg.offsetY = 7;
        return eventarg;
    }

    describe('ChipList Drag and Drop Tests', () => {
        let element: HTMLElement;

        beforeEach(() => {
            element = createElement('div', { id: 'chip' });
            document.body.appendChild(element);
            chips = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
            }, '#chip');
        });

        afterEach(() => {
            chips.destroy();
            element.remove();
        });

        function onDragStart(args: any) {
            if (args.draggedItemData.text === 'chip1') {
                args.cancel = true;
            }
        }

        function onDragStop(args: any) {
            if (args.draggedItemData.text === 'chip1') {
                args.cancel = true;
            }
        }

        it('basic drag and drop testing placing first chip in second position', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = chipElements[1] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
            (document.body.querySelector('.e-drag-indicator') as any).style.position = 'absolute';
            (document.body.querySelector('.e-drag-indicator') as any).style.top = '70px';
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chips.chips[0]).toBe(chipElements[0].textContent.trim());
            expect(chips.chips[1]).toBe(chipElements[1].textContent.trim());
            done();
        });

        it('basic drag and drop testing placing first chip in second position in rtl mode', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
                enableRtl: true
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = chipElements[1] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
            (document.body.querySelector('.e-drag-indicator') as any).style.position = 'absolute';
            (document.body.querySelector('.e-drag-indicator') as any).style.top = '70px';
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chips.chips[0]).toBe(chipElements[0].textContent.trim());
            expect(chips.chips[1]).toBe(chipElements[1].textContent.trim());
            done();
        });

        it('dragArea property testing for a chip drag and drop functinality', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
                dragArea: '#chip'
            }, '#chip');
            let oldChipCount = chips.chips.length;
            let element1 = createElement('div', { id: 'chip1' });
            document.body.appendChild(element1);
            let chips1: ChipList = new ChipList({
                chips: ['chip11', 'chip12', 'chip13'],
                allowDragAndDrop: true,
            }, '#chip1');
            let oldChipCount1 = chips1.chips.length;
            let chipElements = chips.element.querySelectorAll('.e-chip');
            let chipElements1 = chips1.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement1 = chipElements1[0] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement1, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement1, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 140);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement1);
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            let newChipCount = chips.chips.length;
            let newChipCount1 = chips1.chips.length;
            expect(oldChipCount).toBe(newChipCount);
            expect(oldChipCount1).toBe(newChipCount1);
            done();
        });

        it('dragStart event testing for the chips drag and drop functionality', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
                dragStart: onDragStart
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = chipElements[1] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chipElements[0].textContent.trim()).toBe('chip1');
            expect(chipElements[1].textContent.trim()).toBe('chip2');
            expect(chipElements[2].textContent.trim()).toBe('chip3');
            const movingElement1 = chipElements[1] as HTMLElement;
            const targetElement1 = chipElements[2] as HTMLElement;
            let mouseDown1: any = getEventObject('MouseEvents', 'mousedown', movingElement1, targetElement1, 0, 0);
            EventHandler.trigger(movingElement1, 'mousedown', mouseDown1);
            let mouseMove1: any = getEventObject('MouseEvents', 'mousemove', movingElement1, targetElement1, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove1);
            mouseMove1 = setMouseCordinates(mouseMove1, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove1);
            let mouseUp1: any = getEventObject('MouseEvents', 'mouseup', movingElement1, targetElement1);
            (document.body.querySelector('.e-drag-indicator') as any).style.position = 'absolute';
            (document.body.querySelector('.e-drag-indicator') as any).style.top = '30px';
            mouseUp1.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp1);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chipElements[0].textContent.trim()).toBe('chip2');
            expect(chipElements[1].textContent.trim()).toBe('chip1');
            expect(chipElements[2].textContent.trim()).toBe('chip3');
            done();
        });

        it('dragStop event testing for the chips drag and drop functionality', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
                dragStop: onDragStop
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = chipElements[1] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chipElements[0].textContent.trim()).toBe('chip1');
            expect(chipElements[1].textContent.trim()).toBe('chip2');
            expect(chipElements[2].textContent.trim()).toBe('chip3');
            const movingElement1 = chipElements[1] as HTMLElement;
            const targetElement1 = chipElements[2] as HTMLElement;
            let mouseDown1: any = getEventObject('MouseEvents', 'mousedown', movingElement1, targetElement1, 0, 0);
            EventHandler.trigger(movingElement1, 'mousedown', mouseDown1);
            let mouseMove1: any = getEventObject('MouseEvents', 'mousemove', movingElement1, targetElement1, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove1);
            mouseMove1 = setMouseCordinates(mouseMove1, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove1);
            let mouseUp1: any = getEventObject('MouseEvents', 'mouseup', movingElement1, targetElement1);
            mouseUp1.type = 'mouseup';
            (document.body.querySelector('.e-drag-indicator') as any).style.position = 'absolute';
            (document.body.querySelector('.e-drag-indicator') as any).style.top = '20px';
            EventHandler.trigger(document as any, 'mouseup', mouseUp1);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chipElements[0].textContent.trim()).toBe('chip2');
            expect(chipElements[1].textContent.trim()).toBe('chip1');
            expect(chipElements[2].textContent.trim()).toBe('chip3');
            done();
        });

        it('dynamic allowDragAndDrop property change testing', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: false,
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            chips.allowDragAndDrop = true;
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = chipElements[1] as HTMLElement;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            setTimeout(function() {
                let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
                EventHandler.trigger(movingElement, 'mousedown', mouseDown);
                let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
                EventHandler.trigger(document as any, 'mousemove', mouseMove);
                mouseMove = setMouseCordinates(mouseMove, 0, 80);
                EventHandler.trigger(document as any, 'mousemove', mouseMove);
                let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
                mouseUp.type = 'mouseup';
                (document.body.querySelector('.e-drag-indicator') as any).style.position = 'absolute';
                (document.body.querySelector('.e-drag-indicator') as any).style.top = '70px';
                EventHandler.trigger(document as any, 'mouseup', mouseUp);
                chipElements = chips.element.querySelectorAll('.e-chip');
                expect(chips.chips[0]).toBe(chipElements[0].textContent.trim());
                expect(chips.chips[1]).toBe(chipElements[1].textContent.trim());
                done();
            }, 100);
        });

        it('dynamic dragArea property change testing', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
            }, '#chip');
            let oldChipCount = chips.chips.length;
            let element1 = createElement('div', { id: 'chip1' });
            document.body.appendChild(element1);
            let chips1: ChipList = new ChipList({
                chips: ['chip11', 'chip12', 'chip13'],
                allowDragAndDrop: true,
            }, '#chip1');
            let oldChipCount1 = chips1.chips.length;
            chips.dragArea = '#chip';
            let chipElements = chips.element.querySelectorAll('.e-chip');
            let chipElements1 = chips1.element.querySelectorAll('.e-chip');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement1 = chipElements1[0] as HTMLElement;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement1, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement1, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 140);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement1);
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            let newChipCount = chips.chips.length;
            let newChipCount1 = chips1.chips.length;
            expect(oldChipCount).toBe(newChipCount);
            expect(oldChipCount1).toBe(newChipCount1);
            done();
        });

        it('external drop testing with droppable class', (done) => {
            let chips: ChipList = new ChipList({
                chips: ['chip1', 'chip2', 'chip3'],
                allowDragAndDrop: true,
            }, '#chip');
            let chipElements = chips.element.querySelectorAll('.e-chip');
            let element1 = createElement('div', { id: 'drop' });
            element1.classList.add('e-droppable');
            const movingElement = chipElements[0] as HTMLElement;
            const targetElement = element1;
            let mouseDown: any = getEventObject('MouseEvents', 'mousedown', movingElement, targetElement, 0, 0);
            EventHandler.trigger(movingElement, 'mousedown', mouseDown);
            let mouseMove: any = getEventObject('MouseEvents', 'mousemove', movingElement, targetElement, 0, 50);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            mouseMove = setMouseCordinates(mouseMove, 0, 80);
            EventHandler.trigger(document as any, 'mousemove', mouseMove);
            let mouseUp: any = getEventObject('MouseEvents', 'mouseup', movingElement, targetElement);
            mouseUp.type = 'mouseup';
            EventHandler.trigger(document as any, 'mouseup', mouseUp);
            chipElements = chips.element.querySelectorAll('.e-chip');
            expect(chipElements[0].textContent.trim()).toBe('chip1');
            expect(chipElements[1].textContent.trim()).toBe('chip2');
            done();
        });
    });
});
