import { Browser, createElement, detach } from '@syncfusion/ej2-base';
import { DdtChangeEventArgs, DropDownTree } from '../../src/drop-down-tree/drop-down-tree';
import { Dialog } from '@syncfusion/ej2-popups';
import { DataManager } from '@syncfusion/ej2-data';
import { listData , hierarchicalData3, hierarchicalDataString, popupClosedata } from '../../spec/drop-down-tree/dataSource.spec'
import '../../node_modules/es6-promise/dist/es6-promise';

describe('DropDownTree control', () => {
    describe('DOM element testing', () => {
        beforeAll(() => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
        });
        let ddTreeObj: DropDownTree;
        beforeEach((): void => {
            let Chromebrowser: string = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36";
            Browser.userAgent = Chromebrowser;
            ddTreeObj = undefined;
            let element: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'default' });
            document.body.appendChild(element);
        });
        afterEach((): void => {
            if (ddTreeObj)
                ddTreeObj.destroy();
            document.body.innerHTML = '';
        });
        it('with base class', () => {
            ddTreeObj = new DropDownTree({}, '#default');
            expect(document.getElementById('default').classList.contains('e-control')).toEqual(true);
            expect(document.getElementById('default').classList.contains('e-dropdowntree')).toEqual(true);
        });
        it('Element Structure', () => {
            ddTreeObj = new DropDownTree({}, '#default');
            expect(ddTreeObj.element.classList.contains('e-control')).toEqual(true);
            expect(ddTreeObj.element.classList.contains('e-dropdowntree')).toEqual(true);
            expect(ddTreeObj.element.parentElement.classList.contains('e-control-wrapper')).toEqual(true);
            expect(ddTreeObj.element.parentElement.classList.contains('e-ddt')).toEqual(true);
            expect(ddTreeObj.element.previousElementSibling.classList.contains('e-ddt-hidden')).toBe(true);
            expect(ddTreeObj.element.previousElementSibling.tagName).toBe("SELECT");
            expect(ddTreeObj.element.parentElement.lastElementChild.classList.contains('e-ddt-icon')).toEqual(true);
        });
        it('get module name', () => {
            ddTreeObj = new DropDownTree({}, '#default');
            expect(ddTreeObj.getModuleName()).toBe('dropdowntree');
        });

        it('aria attributes', () => {
            ddTreeObj = new DropDownTree({}, '#default');
            expect(ddTreeObj.element.getAttribute("role")).toEqual("combobox");
            expect(ddTreeObj.element.getAttribute("type")).toEqual("text");
            expect(ddTreeObj.element.getAttribute("aria-expanded")).toEqual("false");
            expect(ddTreeObj.element.getAttribute("aria-haspopup")).toEqual("tree");
        });
    });

    describe('Dropdown tree  default property testing without popup', () => {
        let ddtreeObj: DropDownTree;
        beforeEach(() => {
            ddtreeObj = undefined;
            let element: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
            document.body.appendChild(element);
        });
        afterEach(() => {
            if (ddtreeObj) {
                ddtreeObj.destroy()
            }
            document.body.innerHTML = '';
        });
        /**
         * initialize
         */
        it('Default initialize', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect(ddtreeObj.element.classList.contains('e-dropdowntree')).not.toBe(null);
        });
        it('Width', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect(ddtreeObj.width).toEqual('100%');
        });
        it('showDropDownIcon', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect((ddtreeObj as any).inputObj.buttons[0].classList.contains('e-ddt-icon')).toBe(true);
        });
        it('showClearButton', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect((ddtreeObj as any).element.nextElementSibling.classList.contains('e-clear-icon')).toBe(true);
        });
        it('text', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect((ddtreeObj as any).text).toBe(null);
        });
        it('value', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect((ddtreeObj as any).value).toBe(null);
        });
        it('enableRtl ', () => {
            ddtreeObj = new DropDownTree({}, '#ddtree');
            expect(ddtreeObj.element.parentElement.classList.contains('e-rtl')).toEqual(false);
        });
        it('placeholder', () => {
            ddtreeObj = new DropDownTree({ }, '#ddtree');
            expect(ddtreeObj.element.getAttribute('placeholder')).toEqual(null);
        });

    });
    describe('List property testing', () => {
        let ddtreeObj: DropDownTree;
        let mouseEventArgs: any;
        let tapEvent: any;
        let changed1: boolean;
        let changed: boolean = false;
        function onChange(args: DdtChangeEventArgs): void {
            changed = true;
            ddtreeObj.value = ['2'];
        }
        function onChange1(args: DdtChangeEventArgs): void {
            changed1 = true;
            let newListData = listData.filter(item => item.id !== 3);
            ddtreeObj.fields.dataSource = newListData;
        }
        beforeEach((): void => {
            mouseEventArgs = {
                preventDefault: (): void => { },
                stopImmediatePropagation: (): void => { },
                target: null,
                type: null,
                shiftKey: false,
                ctrlKey: false,
                originalEvent: { target: null }
            };
            tapEvent = {
                originalEvent: mouseEventArgs,
                tapCount: 1
            };
            ddtreeObj = undefined;
            let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
            document.body.appendChild(ele);
        });
        afterEach((): void => {
            if (ddtreeObj)
                ddtreeObj.destroy();
            document.body.innerHTML = '';
        });
      
        it('Clear Button clicked after focus out', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' } }, '#ddtree');
            var ele = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            var icon: HTMLElement = (ddtreeObj as any).element.nextElementSibling;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            icon.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            icon.dispatchEvent(e);
            var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            icon.dispatchEvent(e);
            (ddtreeObj as any).onFocusOut();
            var ele1 = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele1.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele1.dispatchEvent(e);
            var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            ele1.dispatchEvent(e);
            expect(document.querySelector('.e-popup').classList.contains('e-popup-open')).toBe(true);
        });

        it('mouse up on clear icon of chip element testing', () => {
            ddtreeObj = new DropDownTree({ value: ["1", "2"], showCheckBox: true,  fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' } }, '#ddtree');
            var ele = ddtreeObj.element;
            var ttTarget = (ddtreeObj as any).element.parentElement.querySelectorAll(".e-chips-close")[1];
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ttTarget.dispatchEvent(e);
            var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            (ddtreeObj as any).onFocusOut();
            expect(ddtreeObj.value.length).toBe(1);
        });

        it('Selecting values using fullrow and clearing it', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }, showCheckBox: true }, '#ddtree');
            var ele = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-fullrow');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(ddtreeObj.text).toBe("Australia");
            let checkEle: Element[] = <Element[] & NodeListOf<Element>>(ddtreeObj as any).treeObj.element.querySelectorAll('.e-checkbox-wrapper');
            expect(checkEle[0].querySelector('.e-frame').classList.contains('e-check')).toBe(true);
            var icon: HTMLElement = (ddtreeObj as any).element.nextElementSibling;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            icon.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            icon.dispatchEvent(e);
            expect(ddtreeObj.value.length).toBe(0);
            (ddtreeObj as any).onFocusOut();
            var ele1 = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele1.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele1.dispatchEvent(e);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-fullrow');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(ddtreeObj.text).toBe("Australia");
            expect(ddtreeObj.value.length).toBe(1);
            let ncheckEle: Element[] = <Element[] & NodeListOf<Element>>(ddtreeObj as any).treeObj.element.querySelectorAll('.e-checkbox-wrapper');
            expect(ncheckEle[0].querySelector('.e-frame').classList.contains('e-check')).toBe(true);
        });

        it('dropdown treeview mouse hover and mouse leave testing', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }, destroyPopupOnHide: false }, '#ddtree');
            let ele = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            expect(document.querySelector('.e-popup').classList.contains('e-popup-open')).toBe(true);
            expect((ddtreeObj as any).inputEle.getAttribute("aria-expanded")).toBe('true');
            expect(document.querySelector('.e-popup').querySelector('.e-treeview')).not.toBe(null);
            expect((ddtreeObj as any).element.nextElementSibling.classList.contains('e-clear-icon')).toBe(true);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).element.value).toBe("Australia")
            expect(document.querySelector('.e-popup').classList.contains('e-popup-close')).toBe(true);
            expect((ddtreeObj as any).inputEle.getAttribute("aria-expanded")).toBe('false');
            (ddtreeObj as any).onFocusOut();
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            (ddtreeObj as any).mouseIn(mouseEventArgs);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(false);
            (ddtreeObj as any).onMouseLeave(mouseEventArgs);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
        });
        it('Dynamic properties before first render', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }}, '#ddtree');
            ddtreeObj.showPopup();
            ddtreeObj.zIndex = 1333;
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).popupObj.element.style.zIndex === '1333').toBe(true);
        });
        it('when crosses view port', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }, destroyPopupOnHide: false}, '#ddtree');
            ddtreeObj.showPopup();
            scrollBy({top: 500, behavior: 'smooth'});
            (ddtreeObj as any).popupObj.trigger('targetExitViewport');
            expect(document.querySelector('.e-popup').classList.contains('e-popup-close')).toBe(true);
        });
        it('Value changed dynamically while focus in - Delimiter', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
                mode: 'Delimiter'
            }, '#ddtree');
            let ele = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).element.value).toBe("Australia")
            expect((ddtreeObj as any).inputEle.classList.contains('e-chip-input')).toBe(false);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            ddtreeObj.value = ['3'];
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).element.value).toBe("Victoria")
            expect((ddtreeObj as any).inputEle.classList.contains('e-chip-input')).toBe(false);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
        });
        it('Value changed dynamically while focus in - Default', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
            }, '#ddtree');
            let ele = ddtreeObj.element;
            var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            ele.dispatchEvent(e);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).element.value).toBe("Australia")
            expect((ddtreeObj as any).inputEle.classList.contains('e-chip-input')).toBe(true);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            ddtreeObj.value = ['3'];
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).element.value).toBe("Victoria")
            expect((ddtreeObj as any).inputEle.classList.contains('e-chip-input')).toBe(true);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
        });
        it('testing value property restore after dynamic datasource change', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
                changeOnBlur: false,
                change: onChange1
            }, '#ddtree');
            let li: any = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[1].querySelector('.e-list-text');
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(changed1).toBe(true);
            expect(ddtreeObj.value[0]).toBe('2');
        });
        it('Value changed dynamically in the change event', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
                changeOnBlur: false,
                change: onChange
            }, '#ddtree');
            let li: any = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[1].querySelector('.e-list-text');
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(changed).toBe(true);
            expect(ddtreeObj.value[0]).toBe('2');
        });
        it('empty value at initial rendering - Default', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
                value: [],
                mode: 'Default'
            }, '#ddtree');
            var chipWrapper = (ddtreeObj as any).inputWrapper.querySelector('.e-chips-wrapper');
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(true);
            let ele = ddtreeObj.element;
            ele.focus();
            ddtreeObj.showPopup();
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).element.value).toBe("Australia")
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            ddtreeObj.value = ['3'];
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).element.value).toBe("Victoria");
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            (ddtreeObj as any).onFocusOut();
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(true);
        });
        it('empty value at initial rendering - Box', () => {
            ddtreeObj = new DropDownTree({
                fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
                placeholder: "Select items",
                showCheckBox: true,
                value: [],
                mode: 'Box'
            }, '#ddtree');
            var chipWrapper = (ddtreeObj as any).inputWrapper.querySelector('.e-chips-wrapper');
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(true);
            expect(ddtreeObj.element.classList.contains('e-chip-input')).toBe(false);
            let ele = ddtreeObj.element;
            ele.focus();
            ddtreeObj.showPopup();
            expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
            var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
            mouseEventArgs.target = li[0].querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(false);
            expect(ddtreeObj.element.classList.contains('e-chip-input')).toBe(true);
            expect((ddtreeObj as any).element.value).toBe("Australia")
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            ddtreeObj.value = ['3'];
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).element.value).toBe("Victoria");
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(false);
            expect((ddtreeObj as any).inputWrapper.querySelector('.e-overflow').classList.contains('e-icon-hide')).toBe(true);
            (ddtreeObj as any).onFocusOut();
            expect(chipWrapper.classList.contains('e-icon-hide')).toBe(true);
        });
    });

    describe('multiple attribute testing', () => {
        let ddtreeObj: DropDownTree;
        let mouseEventArgs: any;
        let tapEvent: any;

        beforeEach((): void => {
            mouseEventArgs = {
                preventDefault: (): void => { },
                stopImmediatePropagation: (): void => { },
                target: null,
                type: null,
                shiftKey: false,
                ctrlKey: false,
                originalEvent: { target: null }
            };
            tapEvent = {
                originalEvent: mouseEventArgs,
                tapCount: 1
            };
            ddtreeObj = undefined;
            let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
            document.body.appendChild(ele);
        });
        afterEach((): void => {
            if (ddtreeObj)
                ddtreeObj.destroy();
            document.body.innerHTML = '';
        });
        
        it('While enabling allowMultiselection', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }, allowMultiSelection: true}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
        });
        it('While enabling showCheckBox', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }, showCheckBox: true}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
        });
        it('While enabling allowMultiselection dynamically', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe(null);
            ddtreeObj.allowMultiSelection = true;
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
        });
        it('While enabling showCheckBox dynamically', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe(null);
            ddtreeObj.showCheckBox = true;
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
        });
        it('While disabling allowMultiselection dynamically', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }, allowMultiSelection: true}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
            ddtreeObj.allowMultiSelection = false;
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe(null);
        });
        it('While disabling showCheckBox dynamically', () => {
            ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded', }, showCheckBox: true}, '#ddtree');
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe("");
            ddtreeObj.showCheckBox = false;
            ddtreeObj.dataBind();
            expect((ddtreeObj as any).hiddenElement.getAttribute('multiple')).toBe(null);
        });
    });
});

describe('Destroy Method', () => {
    let ddtreeObj: any;
    let mouseEventArgs: any;
    let originalTimeout: any;
    let tapEvent: any;
    let i: number = 0, j: number = 0;
    function clickFn(): void {
        i++;
    }
    beforeEach((): void => {
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };
        i = 0, j = 0;
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
    afterEach((): void => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        document.body.innerHTML = '';
    });
    xit('performance testing', (done) => {
        let hugeitems: any = [];
        let startDate:number;
        let timeTaken:number;
        for (let i = 0; i < 5; i++) {
            const topLevelId = getRandomId();
            hugeitems.push({
                id: topLevelId,
                name: 'Top Level Item ' + topLevelId,
                hasChild: true
            });

            for (let c = 0; c < 20; c++) {
                const childId = getRandomId();
                hugeitems.push({
                    id: childId,
                    pid: topLevelId,
                    name: 'Second Level Item ' + childId,
                    hasChild: true
                });

                for (let cc = 0; cc < 10; cc++) {
                    const subChildId = getRandomId();
                    hugeitems.push({
                        id: subChildId,
                        pid: childId,
                        name: 'Third Level Item ' + subChildId,
                        hasChild: true
                    });

                    for (let ccc = 0; ccc < 10; ccc++) {
                        const subSubChildId = getRandomId();
                        hugeitems.push({
                            id: subSubChildId,
                            pid: subChildId,
                            name: 'Fourth Level Item ' + subSubChildId,
                            hasChild: false
                        });
                    }
                }
            }
        }

        function getRandomId() {
            const min = Math.ceil(0);
            const max = Math.floor(9999999);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        ddtreeObj = new DropDownTree({
            fields: {
                dataSource: hugeitems, value: 'id',
                parentValue: 'pid',
                text: 'name',
                hasChildren: 'hasChild'
            },
            showCheckBox: true,
            mode: 'Delimiter',
            treeSettings: {
                expandOn: 'Auto',
                loadOnDemand: true,
                autoCheck: true
            },
            destroyed: function() {
                timeTaken = new Date().getTime() - startDate;
            }
        }, '#ddtree');
        ddtreeObj.showPopup();
        let li: Element[] = <Element[] & NodeListOf<Element>>ddtreeObj.treeObj.element.querySelectorAll('li');
        mouseEventArgs.target = li[0].querySelector('.e-checkbox-wrapper');
        ddtreeObj.treeObj.touchClickObj.tap(tapEvent);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        setTimeout(function() {
            startDate = new Date().getTime();
            ddtreeObj.destroy();
            setTimeout(() => {
                expect(timeTaken).toBeLessThan(100);
                done();
            },100 );  
        }, 100);
    });

    // describe('Popup detached testing', () => {
    //     let dialog: Dialog;
    //     let ddTreeObj: DropDownTree;
    //     beforeEach((): void => {
    //         let Chromebrowser: string = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36";
    //         Browser.userAgent = Chromebrowser;
    //         ddTreeObj = undefined;
    //         dialog = undefined;
    //         let ele: HTMLElement = createElement('div', { id: 'dialog' });
    //         document.body.appendChild(ele);
    //         let content: HTMLElement = createElement('div', { id: 'dlgContent' });
    //         document.body.appendChild(content);
    //         let element: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'default' });
    //         content.appendChild(element);
    //     });
    //     afterEach((): void => {
    //         if (dialog) {
    //             dialog.destroy();
    //             detach(dialog.element);
    //         }
    //         if (ddTreeObj)
    //             ddTreeObj.destroy();
    //         document.body.innerHTML = '';
    //     });
    //     it('dialog', () => {
    //         dialog = new Dialog({ header: 'Dialog',  showCloseIcon: true,  content: document.getElementById("dlgContent"),
    //         height: '300px',   width: '400px' });
    //         dialog.appendTo('#dialog');
    //         // Render drop-down-tree inside dialog
    //         ddTreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }, destroyPopupOnHide: false }, '#default');
    //         expect(document.getElementById('dialog').querySelector("#dlgContent").children[0].classList.contains('e-ddt')).toBe(true);
    //         ddTreeObj.showPopup();
    //         // open drop-down-tree  popup
    //         expect(document.querySelector('.e-ddt.e-popup').classList.contains('e-popup-open')).toBe(true);
    //         ddTreeObj.hidePopup();
    //         // detached the drop-down-tree input from the dom
    //         detach(document.getElementsByClassName("e-ddt")[0]);
    //         expect(document.getElementById('dialog').querySelector("#dlgContent").childElementCount).toBe(0);
    //         expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(1);
    //         // create the drop-down-tree input and again append to dom
    //         var inputEle = createElement('input', { attrs: { role: 'textbox', type: 'text' } }) as HTMLInputElement;
    //         inputEle.id = "default";
    //         document.getElementById('dlgContent').appendChild(inputEle);
    //         ddTreeObj.appendTo('#default');
    //         expect(document.getElementById('dialog').querySelector("#dlgContent").children[0].classList.contains('e-ddt')).toBe(true);
    //         ddTreeObj.showPopup();
    //         expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(1);
    //         // open drop-down-tree  popup
    //         expect(document.querySelectorAll('.e-ddt.e-popup')[0].classList.contains('e-popup-open')).toBe(true);
    //         var li = (ddTreeObj as any).treeObj.element.querySelectorAll('li');
    //         expect(li.length).toBe(24);
    //         expect(li[0].querySelector('.e-list-text').innerText).toBe('Australia');
    //         ddTreeObj.hidePopup();
    //     });
    // });
});

describe('Dropdown Tree With Id starts with number', () => {
    let ddtreeObj: DropDownTree;
    let mouseEventArgs: any;
    let tapEvent: any;

    beforeEach((): void => {
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: '11ddtree' });
        document.body.appendChild(ele);
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        document.body.innerHTML = '';
    });
    it('mouse hover and mouse leave testing', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' }, destroyPopupOnHide: false });
        ddtreeObj.appendTo( '#11ddtree');
        let ele = ddtreeObj.element;
        var e = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
        ele.dispatchEvent(e);
        var e = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
        ele.dispatchEvent(e);
        var e = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
        ele.dispatchEvent(e);
        expect(document.querySelector('.e-popup').classList.contains('e-popup-open')).toBe(true);
        expect((ddtreeObj as any).inputEle.getAttribute("aria-expanded")).toBe('true');
        expect(document.querySelector('.e-popup').querySelector('.e-treeview')).not.toBe(null);
        var li = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
        mouseEventArgs.target = li[0].querySelector('.e-list-text');
        tapEvent.tapCount = 1;
        (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
        expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(false);
        expect((ddtreeObj as any).element.value).toBe("Australia")
        expect(document.querySelector('.e-popup').classList.contains('e-popup-close')).toBe(true);
        expect((ddtreeObj as any).inputEle.getAttribute("aria-expanded")).toBe('false');
        (ddtreeObj as any).onFocusOut();
    });
});

describe('Tab focus testing', () => {
    let ddtreeObj: any;
    let ddtreeObj1: any;
    let originalTimeout: any;
    let mouseEventArgs: any;
    let keyboardEventArgs: any
    let tapEvent: any;
    beforeEach((): void => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        keyboardEventArgs = {
            preventDefault: (): void => { },
            action: null,
            target: null,
            currentTarget: null,
            stopImmediatePropagation: (): void => { },
        };

        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };

        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        let ele1: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree1' });
        document.body.appendChild(ele);
        document.body.appendChild(ele1);
        ddtreeObj = undefined;
        ddtreeObj1 = undefined
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        if (ddtreeObj1)
            ddtreeObj1.destroy();
        document.body.innerHTML = '';
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('tab key pressed', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" } }, '#ddtree');
        ddtreeObj1 = new DropDownTree({ fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' } });
        ddtreeObj1.appendTo('#ddtree1');
        const input = document.getElementsByTagName("input")[0];
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keypress',  {'key':'tab'}));
        expect(ddtreeObj.inputWrapper.classList.contains('e-input-focus')).toBe(true);
        expect(ddtreeObj1.inputWrapper.classList.contains('e-input-focus')).toBe(false);
        const input_a = document.getElementsByTagName("input")[1];
        input_a.focus();
        input_a.dispatchEvent(new KeyboardEvent('keypress',  {'key':'tab'}));
        expect(ddtreeObj.inputWrapper.classList.contains('e-input-focus')).toBe(false);
        expect(ddtreeObj1.inputWrapper.classList.contains('e-input-focus')).toBe(true);
    });

    it('ensure expand nodes', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" } }, '#ddtree');
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(1);
        expect(ddtreeObj.treeObj.expandedNodes.includes("1")).toBe(true);
        ddtreeObj.hidePopup();
        expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(0);
    });
    
    it('ensure selected nodes', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child", selected:"isSelected" }, showCheckBox: true }, '#ddtree');
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(1);
        expect(ddtreeObj.treeObj.selectedNodes.includes("2")).toBe(true);
        ddtreeObj.hidePopup();
        expect(document.querySelectorAll('.e-ddt.e-popup').length).toBe(0);
    });

    it('ensure Box mode', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" },
        showCheckBox: true, mode:'Box', value:["2", "9"] }, '#ddtree');
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(document.querySelectorAll('.e-chipcontent')[0].textContent).toBe("New South Wales");
        ddtreeObj.hidePopup();
    });

    it('ensure delimiter mode', () => {
        ddtreeObj = new DropDownTree({ fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" },
        showCheckBox: true, mode: 'Delimiter', value:["2", "9"] }, '#ddtree');
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect((ddtreeObj as any).inputEle.value).toBe("New South Wales, Ceará");
        ddtreeObj.hidePopup();
    });
});

describe('Footer Template', () => {
    let ddtreeObj: any;
    let originalTimeout: any;
    let mouseEventArgs: any;
    let keyboardEventArgs: any
    let tapEvent: any;
    beforeEach((): void => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        keyboardEventArgs = {
            preventDefault: (): void => { },
            action: null,
            target: null,
            currentTarget: null,
            stopImmediatePropagation: (): void => { },
        };

        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };

        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
        ddtreeObj = undefined;
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        document.body.innerHTML = '';
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('should render the footer template', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" },
            footerTemplate: '<div class="custom-footer">Custom Footer</div>'
        });
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        const footerElement = document.querySelector('.custom-footer');
        expect(footerElement).not.toBeNull();
        expect(footerElement).toBeTruthy();
        expect(footerElement.textContent).toBe('Custom Footer');
        ddtreeObj.hidePopup();
    });

    it('string footer template property', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" },
            footerTemplate: "footer"
        });
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(ddtreeObj.footerTemplate).toEqual(ddtreeObj.popupObj.element.lastChild.innerText);
        ddtreeObj.hidePopup();
    });
    
    it('footer template is a function', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: hierarchicalData3, value: "id", text: "name", expanded: 'expanded', child: "child" },
        });
        ddtreeObj.footerTemplate = () => {
            return `<div class="custom-footer">Custom Footer</div>`;
        };
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(typeof ddtreeObj.footerTemplate).toBe('function');
        ddtreeObj.hidePopup();
    });
});

describe('using noRecords and valueTemplate templates', () => {
    let ddtreeObj: any;
    let originalTimeout: any;
    let mouseEventArgs: any;
    let keyboardEventArgs: any
    let tapEvent: any;
    beforeEach((): void => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        keyboardEventArgs = {
            preventDefault: (): void => { },
            action: null,
            target: null,
            currentTarget: null,
            stopImmediatePropagation: (): void => { },
        };

        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };

        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
        ddtreeObj = undefined;
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        document.body.innerHTML = '';
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    it('no records template', () => {
        let data: { [key: string]: Object }[] = [];
        ddtreeObj = new DropDownTree({
            fields: { dataSource: data, value: "id", text: "name", expanded: 'expanded', child: "child" },
            noRecordsTemplate: "<span class='norecord'> NO DATA AVAILABLE</span>",
        });
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect((document.querySelector('.norecord') as any).innerText).toBe("NO DATA AVAILABLE");
    });
    it('value template', () => {
        let data: { [key: string]: Object }[] = [
            { "id": 1, "name": "Steven Buchanan", "job": "General Manager", "hasChild": true, "expanded": true },
            { "id": 2, "pid": 1, "name": "Laura Callahan", "job": "Product Manager", "hasChild": false },
            { "id": 3, "pid": 1, "name": "Andrew Fuller", "job": "Team Lead", "hasChild": false },
        ];
        ddtreeObj = new DropDownTree({
            fields: { dataSource: data, value: "id", text: "name", expanded: 'expanded', child: "child" },
            valueTemplate: '<div>value template text</div>',
        });
        ddtreeObj.appendTo('#ddtree');
        ddtreeObj.showPopup();
        expect(ddtreeObj.treeObj.element.querySelectorAll('li')[1].innerText).toBe("Laura Callahan");
    });
});

describe('DropdownTree Null or undefined value testing ', () => {
    let ddtreeObj: DropDownTree;

    beforeEach((): void => {
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
    });
    afterEach((): void => {
        document.body.innerHTML = '';
    });
    it('allowFiltering', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            allowFiltering: null
        }, '#ddtree');
        expect(ddtreeObj.allowFiltering).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            allowFiltering: undefined
        }, '#ddtree');
        expect(ddtreeObj.allowFiltering).toBe(false);
        ddtreeObj.destroy();
    });
    // allowMultiSelection
    it('allowMultiSelection', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            allowMultiSelection: null
        }, '#ddtree');
        expect(ddtreeObj.allowMultiSelection).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            allowMultiSelection: undefined
        }, '#ddtree');
        expect(ddtreeObj.allowMultiSelection).toBe(false);
        ddtreeObj.destroy();
    });
    // changeOnBlur
    it('changeOnBlur', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            changeOnBlur: null
        }, '#ddtree');
        expect(ddtreeObj.changeOnBlur).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            changeOnBlur: undefined
        }, '#ddtree');
        expect(ddtreeObj.changeOnBlur).toBe(true);
        ddtreeObj.destroy();
    });
    // cssClass
    it('cssClass', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            cssClass: null
        }, '#ddtree');
        expect(ddtreeObj.cssClass).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            cssClass: undefined
        }, '#ddtree');
        expect(ddtreeObj.cssClass).toBe('');
        ddtreeObj.destroy();
    });
    // dataSource
    it('dataSource', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: null,  }
        }, '#ddtree');
        expect(ddtreeObj.fields.dataSource).toEqual([]);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: undefined }
        }, '#ddtree');
        expect(ddtreeObj.fields.dataSource).toEqual([]);
        ddtreeObj.destroy();
    });
    // enablePersistence
    it('enablePersistence', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            enablePersistence: null
        }, '#ddtree');
        expect(ddtreeObj.enablePersistence).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            enablePersistence: undefined
        }, '#ddtree');
        expect(ddtreeObj.enablePersistence).toBe(false);
        ddtreeObj.destroy();
    });
    // enableRtl
    it('enableRtl', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            enableRtl: null
        }, '#ddtree');
        expect(ddtreeObj.enableRtl).toBe(false);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            enableRtl: undefined
        }, '#ddtree');
        expect(ddtreeObj.enableRtl).toBe(false);
        ddtreeObj.destroy();
    });
    // footerTemplate
    it('footerTemplate', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            footerTemplate: null
        }, '#ddtree');
        expect(ddtreeObj.footerTemplate).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            footerTemplate: undefined
        }, '#ddtree');
        expect(ddtreeObj.footerTemplate).toBe(null);
        ddtreeObj.destroy();
    });
    // headerTemplate
    it('headerTemplate', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            headerTemplate: null
        }, '#ddtree');
        expect(ddtreeObj.headerTemplate).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            headerTemplate: undefined
        }, '#ddtree');
        expect(ddtreeObj.headerTemplate).toBe(null);
        ddtreeObj.destroy();
    });
    // htmlAttributes
    it('htmlAttributes', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            htmlAttributes: null
        }, '#ddtree');
        expect(ddtreeObj.htmlAttributes.role).toBe('combobox');
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            htmlAttributes: undefined
        }, '#ddtree');
        expect(ddtreeObj.htmlAttributes.role).toBe('combobox');
        ddtreeObj.destroy();
    });
    // locale
    it('locale', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            locale: null
        }, '#ddtree');
        expect(ddtreeObj.locale).toBe('es');
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            locale: undefined
        }, '#ddtree');
        expect(ddtreeObj.locale).toBe('es');
        ddtreeObj.destroy();
    });
    // mode
    it('mode', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            mode: null
        }, '#ddtree');
        expect(ddtreeObj.mode).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            mode: undefined
        }, '#ddtree');
        expect(ddtreeObj.mode).toBe('Default');
        ddtreeObj.destroy();
    });
    // placeholder
    it('placeholder', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            placeholder: null
        }, '#ddtree');
        expect(ddtreeObj.placeholder).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            placeholder: undefined
        }, '#ddtree');
        expect(ddtreeObj.placeholder).toBe(null);
        ddtreeObj.destroy();
    });
    // popupHeight
    it('popupHeight', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            popupHeight: null
        }, '#ddtree');
        expect(ddtreeObj.popupHeight).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            popupHeight: undefined
        }, '#ddtree');
        expect(ddtreeObj.popupHeight).toBe('300px');
        ddtreeObj.destroy();
    });
    // popupWidth
    it('popupWidth', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            popupWidth: null
        }, '#ddtree');
        expect(ddtreeObj.popupWidth).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            popupWidth: undefined
        }, '#ddtree');
        expect(ddtreeObj.popupWidth).toBe('100%');
        ddtreeObj.destroy();
    });
    // readonly
    it('readonly', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            readonly: null
        }, '#ddtree');
        expect(ddtreeObj.readonly).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            readonly: undefined
        }, '#ddtree');
        expect(ddtreeObj.readonly).toBe(false);
        ddtreeObj.destroy();
    });
    // showCheckBox
    it('showCheckBox', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showCheckBox: null
        }, '#ddtree');
        expect(ddtreeObj.showCheckBox).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showCheckBox: undefined
        }, '#ddtree');
        expect(ddtreeObj.showCheckBox).toBe(false);
        ddtreeObj.destroy();
    });
    // showClearButton
    it('showClearButton', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showClearButton: null
        }, '#ddtree');
        expect(ddtreeObj.showClearButton).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showClearButton: undefined
        }, '#ddtree');
        expect(ddtreeObj.showClearButton).toBe(true);
        ddtreeObj.destroy();
    });
    // showDropDownIcon
    it('showDropDownIcon', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showDropDownIcon: null
        }, '#ddtree');
        expect(ddtreeObj.showDropDownIcon).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showDropDownIcon: undefined
        }, '#ddtree');
        expect(ddtreeObj.showDropDownIcon).toBe(true);
        ddtreeObj.destroy();
    });
    // value
    it('value', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            value: null
        }, '#ddtree');
        expect(ddtreeObj.value).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            value: undefined
        }, '#ddtree');
        expect(ddtreeObj.value).toBe(null);
        ddtreeObj.destroy();
    });
    // width
    it('width', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            width: null
        }, '#ddtree');
        expect(ddtreeObj.width).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            width: undefined
        }, '#ddtree');
        expect(ddtreeObj.width).toBe('100%');
        ddtreeObj.destroy();
    });
    // zindex
    it('zIndex', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            zIndex: null
        }, '#ddtree');
        expect(ddtreeObj.zIndex).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            zIndex: undefined
        }, '#ddtree');
        expect(ddtreeObj.zIndex).toBe(1000);
        ddtreeObj.destroy();
    });

    it('delimiterChar', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            delimiterChar: null
        }, '#ddtree');
        expect(ddtreeObj.delimiterChar).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            delimiterChar: undefined
        }, '#ddtree');
        expect(ddtreeObj.delimiterChar).toBe(',');
        ddtreeObj.destroy();
    });
    // filterBarPlaceholder
    it('filterBarPlaceholder', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            filterBarPlaceholder: null
        }, '#ddtree');
        expect(ddtreeObj.filterBarPlaceholder).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            filterBarPlaceholder: undefined
        }, '#ddtree');
        expect(ddtreeObj.filterBarPlaceholder).toBe(null);
        ddtreeObj.destroy();
    });
    // filterType
    it('filterType', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            filterType: null
        }, '#ddtree');
        expect(ddtreeObj.filterType).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            filterType: undefined
        }, '#ddtree');
        expect(ddtreeObj.filterType).toBe('StartsWith');
        ddtreeObj.destroy();
    });
    // sortOrder
    it('sortOrder', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            sortOrder: null
        }, '#ddtree');
        expect(ddtreeObj.sortOrder).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            sortOrder: undefined
        }, '#ddtree');
        expect(ddtreeObj.sortOrder).toBe('None');
        ddtreeObj.destroy();
    });
    // treeSettings
    it('treeSettings', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            treeSettings: null
        }, '#ddtree');
        expect(ddtreeObj.treeSettings.loadOnDemand).toBe(false);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            treeSettings: undefined
        }, '#ddtree');
        expect(ddtreeObj.treeSettings.loadOnDemand).toBe(false);
        ddtreeObj.destroy();
    });
    // showSelectAll
    it('showSelectAll', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showSelectAll: null
        }, '#ddtree');
        expect(ddtreeObj.showSelectAll).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            showSelectAll: undefined
        }, '#ddtree');
        expect(ddtreeObj.showSelectAll).toBe(false);
        ddtreeObj.destroy();
    });
    // selectAllText
    it('selectAllText', () => {
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            selectAllText: null
        }, '#ddtree');
        expect(ddtreeObj.selectAllText).toBe(null);
        ddtreeObj.destroy();
        ddtreeObj = new DropDownTree({ 
            fields: { dataSource: listData, value: "id", text: "name" },
            selectAllText: undefined
        }, '#ddtree');
        expect(ddtreeObj.selectAllText).toBe('Select All');
        ddtreeObj.destroy();
    });
});

describe('DropdownTree', () => {
    let mouseEventArgs: any;
    let originalTimeout: any;
    let tapEvent: any;
    let ddtreeObj: DropDownTree;
    let argsValue: any;
    let changed: boolean = false;
    function onChange(args: DdtChangeEventArgs): void {
        changed = true;
        argsValue = args;
    }

    beforeEach((): void => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false
        };
        tapEvent = {
            originalEvent: mouseEventArgs,
        };
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        document.body.innerHTML = '';
    });

    it('aria-label attribute value changes dynamically', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            placeholder: "Select items",
        }, '#ddtree');
        let ele = ddtreeObj.element;
        ele.focus();
        ddtreeObj.showPopup();
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('dropdowntree');
        expect((ddtreeObj).element.nextElementSibling.classList.contains('e-icon-hide')).toBe(true);
        ddtreeObj.value = ['3'];
        ddtreeObj.dataBind();
        expect((ddtreeObj as any).element.value).toBe("Victoria");
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('Victoria');
        (ddtreeObj as any).onFocusOut();
    });

    it('aria-label attribute value changes dynamically when enabling allowMultiselection', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            allowMultiSelection:true,
            value: ['1','2']
        }, '#ddtree');
        let ele = ddtreeObj.element;
        ele.focus();
        ddtreeObj.showPopup();
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('Australia, New South Wales');
        ddtreeObj.value = ['7'];
        ddtreeObj.dataBind();
        expect((ddtreeObj as any).element.value).toBe("Brazil");
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('Brazil');
        (ddtreeObj as any).onFocusOut();
    });

    it('aria-label attribute value changes dynamically when enabling showCheckBox', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild", expanded: 'expanded' },
            value: ['3','6','9'],
            showCheckBox: true
        }, '#ddtree');
        let ele = ddtreeObj.element;
        ele.focus();
        ddtreeObj.showPopup();
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('Victoria, Western Australia, Ceará');
        ddtreeObj.value = ['1'];
        ddtreeObj.dataBind();
        expect((ddtreeObj as any).element.value).toBe("Australia");
        expect(((ddtreeObj).element.parentElement as any).ariaLabel).toBe('Australia');
        (ddtreeObj as any).onFocusOut();
    });

    it('change event args value testing while checking child node', () => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: hierarchicalDataString, value: "id", text: "name", expanded: 'expanded', child: "subChild" },
            allowFiltering: true,
            showCheckBox: true,
            allowMultiSelection: true,
            showSelectAll: true,
            treeSettings: {
                expandOn: 'Auto',
                loadOnDemand: true,
                autoCheck: true,
                checkDisabledChildren: false
            },
            changeOnBlur: false,
            enabled: true,
            change: onChange
        }, '#ddtree');
        let li: any = (ddtreeObj as any).treeObj.element.querySelectorAll('li');
        mouseEventArgs.target = li[1].querySelector('.e-list-text');
        (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
        expect(changed).toBe(true);
        changed = false;
        expect(argsValue.value.length).toBe(ddtreeObj.value.length);
        mouseEventArgs.target = li[0].querySelector('.e-list-text');
        (ddtreeObj as any).treeObj.touchClickObj.tap(tapEvent);
        expect(changed).toBe(true);
        expect(argsValue.value.length).toBe(ddtreeObj.value.length);
    });
});

describe('DropdownTree', () => {

    let ddtreeObj: DropDownTree;
    let mouseEventArgs: any = { preventDefault: function () { }, target: null };
    beforeEach((): void => {
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
        const childTreeContainer: HTMLElement = createElement('div', {id: 'childTreesContainer'});
        document.body.appendChild(childTreeContainer);
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
        document.body.innerHTML = '';
    });

    it('Render the second Dropdown Tree based on the first Dropdown Trees node check action, and after destroying the second Dropdown Tree, close the first Dropdown Tree popup on document click', (done) => {
      let newAdditions: number[] = [];
      let childTreesContainer: HTMLElement = document.getElementById('childTreesContainer');
      let childTreeElement: HTMLDivElement;
      let ddTreeChild:DropDownTree;
      // Function to create a new DropDownTree
      function createChildDropDownTree(id: number) {
        ddTreeChild = new DropDownTree({
          fields: { dataSource: popupClosedata, value: "id", text: "name", child: 'subChild' },
          placeholder: `Child Tree ${id}`,
          popupHeight: '100px',
          showCheckBox: true,
          showSelectAll: false,
          allowFiltering: true,
        });
        childTreeElement = document.createElement('div');
        childTreeElement.id = `childTree${id}`;
        childTreesContainer.appendChild(childTreeElement);
        ddTreeChild.appendTo(`#childTree${id}`);
      }
        ddtreeObj = new DropDownTree({
            fields: { dataSource: popupClosedata, value: "id", text: "name", child: 'subChild' },
            placeholder: 'Parent Tree',
            popupHeight: '100px',
            showCheckBox: true,
            showSelectAll: false,
            allowFiltering: true,
            treeSettings: {
                expandOn: 'Auto',
                loadOnDemand: true,
                autoCheck: true,
                checkDisabledChildren: false,
            },
            mode: 'Custom',
            changeOnBlur: false,
            destroyPopupOnHide: false
        }, '#ddtree');
        function change() {
            // Check if any node is checked
            let checkSpan: HTMLElement = (ddtreeObj as any).treeObj.element.querySelector('.e-check');
            if (checkSpan) {
              let newId: number = newAdditions.length + 1;
              newAdditions.push(newId);
              createChildDropDownTree(newId); // Add a new child DropDownTree
            } else if (newAdditions.length > 0) {
              newAdditions.pop();
              ddTreeChild.destroy();
            }
        };
        ddtreeObj.showPopup();
        (ddtreeObj as any).treeObj.checkAll(['1']);
        change();
        expect((ddtreeObj as any).treeObj.element.querySelector('.e-check')).not.toBeNull();
        expect(childTreeElement.classList.contains('e-dropdowntree')).toBe(true);
        expect((ddtreeObj as any).isPopupOpen).toBe(true);
        (ddtreeObj as any).treeObj.uncheckAll(['1']);
        change();
        expect((ddtreeObj as any).treeObj.element.querySelector('.e-check')).toBeNull();
        mouseEventArgs.target = document.getElementsByTagName('HTML')[0];
        mouseEventArgs.srcElement = document.getElementsByTagName('HTML')[0];
        (ddtreeObj as any).onDocumentClick(mouseEventArgs);
        setTimeout(function () {
            expect((ddtreeObj as any).isPopupOpen).toBe(false);
            done();
        }, 450);
    });
});

describe('Dropdown Tree with Filter', () => {
    let ddtreeObj: any;
    let mouseEventArgs: any;
    let tapEvent: any;
    let originalTimeout: any;
    let ele: HTMLInputElement;
    beforeEach((): void => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        mouseEventArgs = {
            preventDefault: (): void => { },
            stopImmediatePropagation: (): void => { },
            target: null,
            type: null,
            shiftKey: false,
            ctrlKey: false,
            originalEvent: { target: null }
        };
        tapEvent = {
            originalEvent: mouseEventArgs,
            tapCount: 1
        };
        ddtreeObj = undefined;
        ele = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
    });
    afterEach((): void => {
        if (ddtreeObj)
            ddtreeObj.destroy();
            ddtreeObj = undefined;
        ele.remove();
        document.body.innerHTML = '';
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('filters using "aus", selects "Australia", and ensures it remains selected after further filtering', (done) => {
        ddtreeObj = new DropDownTree({
            fields: { dataSource: listData, value: "id", text: "name", parentValue: "pid", hasChildren: "hasChild" },
            allowFiltering:true,
            showCheckBox: true
        }, '#ddtree');
        ddtreeObj.showPopup();
        let filterEle = ddtreeObj.popupObj.element.querySelector('#' + ddtreeObj.element.id + "_filter");
        let filterObj = filterEle.ej2_instances[0];
        filterEle.value = 'aus';
        filterObj.value = 'aus';
        filterObj.input({ value: 'aus', container: filterEle });
        setTimeout(() => {
            expect(ddtreeObj.treeObj.element.querySelectorAll('li.e-list-item').length).toBeGreaterThanOrEqual(1); // At least one result
            let li = ddtreeObj.treeObj.element.querySelector('li');
            mouseEventArgs.target = li.querySelector('.e-list-text');
            tapEvent.tapCount = 1;
            ddtreeObj.treeObj.touchClickObj.tap(tapEvent);
            expect(ddtreeObj.value.length).toBe(1);
            expect(ddtreeObj.value.indexOf('1') !== -1).toBe(true);
            expect(ddtreeObj.treeObj.checkedNodes.length).toBe(1);
            expect(ddtreeObj.treeObj.element.querySelector('li.e-list-item.e-active .e-list-text').innerText).toBe("Australia");
            filterEle.value = 'aust';
            filterObj.value = 'aust';
            filterObj.input({ value: 'aust', container: filterEle });
            setTimeout(() => {
                expect(ddtreeObj.treeObj.checkedNodes.length).toBe(1);
                expect(ddtreeObj.value.length).toBe(1);
                expect(ddtreeObj.treeObj.element.querySelectorAll('li.e-list-item.e-active').length).toBe(1);
                expect(ddtreeObj.treeObj.element.querySelector('li.e-list-item.e-active .e-list-text').innerText).toBe("Australia");
                done();
            }, 350);
        }, 350);
    });
});

describe('Remote Data Filtering', () => {
    let ddtreeObj: DropDownTree;
    beforeEach((): void => {
        ddtreeObj = undefined;
        let ele: HTMLInputElement = <HTMLInputElement>createElement('input', { id: 'ddtree' });
        document.body.appendChild(ele);
    });
    afterEach((): void => {
        if (ddtreeObj) {
            ddtreeObj.destroy();
        }
        document.body.innerHTML = '';
    });
    it('should filter data properly when using remote data source', (done) => {
        const sampleData = [
            { id: '1', name: 'Australia', hasChild: true },
            { id: '2', name: 'New South Wales', pid: '1' },
            { id: '3', name: 'Victoria', pid: '1' },
            { id: '4', name: 'South Australia', pid: '1', hasChild: true },
            { id: '5', name: 'Adelaide', pid: '4' }
        ];
        const dataManager = new DataManager(sampleData);
        ddtreeObj = new DropDownTree({
            fields: {
                dataSource: dataManager,
                value: "id",
                text: "name",
                parentValue: "pid",
                hasChildren: "hasChild"
            },
            allowFiltering: true
        });
        ddtreeObj.appendTo('#ddtree');
        (ddtreeObj as any).isRemoteData = true;
        (ddtreeObj as any).treeData = sampleData;
        (ddtreeObj as any).isFilteredData = true;
        let filteredFields = (ddtreeObj as any).remoteDataFilter('aus', (ddtreeObj as any).fields);
        expect(filteredFields.dataSource).not.toBeNull();
        let hasAustralia = filteredFields.dataSource.some((item: any) => 
            item.id === '1' && item.name === 'Australia');
        expect(hasAustralia).toBe(true);
        (ddtreeObj as any).treeDataType = 2;
        const node = { id: '4', name: 'South Australia', pid: '1', hasChild: true, 
                      child: [{ id: '5', name: 'Adelaide', pid: '4' }] };
        const result = (ddtreeObj as any).remoteChildFilter('adel', node);
        expect(result).not.toBeNull();
        expect(result.child).not.toBeNull();
        expect(result.child.length).toBe(1);
        expect(result.child[0].name).toBe('Adelaide');
        done();
    });
    it('should handle ignoreAccent during filtering', (done) => {
        const accentedData = [
            { id: '1', name: 'Café', hasChild: true },
            { id: '2', name: 'Restaurant', pid: '1' }
        ];
        ddtreeObj = new DropDownTree({
            fields: {
                dataSource: accentedData,
                value: "id",
                text: "name",
                parentValue: "pid",
                hasChildren: "hasChild"
            },
            allowFiltering: true,
            ignoreAccent: true
        });
        ddtreeObj.appendTo('#ddtree');
        (ddtreeObj as any).treeData = accentedData;
        const isMatch = (ddtreeObj as any).isMatchedNode('cafe', accentedData[0]);
        expect(isMatch).toBe(true);
        done();
    });
});
