/**
 * KeyBoard spec
 */
import { createElement, detach } from '@syncfusion/ej2-base';
import { KeyboardEvents } from './../../../src/rich-text-editor/actions/keyboard';
import { htmlKeyConfig } from './../../../src/common/config';
import { RichTextEditor } from "../../../src/rich-text-editor";
import { INSRT_IMG_EVENT_INIT } from "../../constant.spec";
import { renderRTE } from "../render.spec";

let keyboardEventArgs = {
    preventDefault: function () { },
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    char: '',
    key: '',
    charCode: 22,
    keyCode: 22,
    which: 22,
    code: 22,
    action: ''
};
describe('KeyBoard', () => {
    let keyObj: KeyboardEvents;
    let textArea: HTMLTextAreaElement = <HTMLTextAreaElement>createElement('textarea', {
        id: 'editor',
        styles: 'width:200px;height:200px'
    });
    beforeAll(() => {
        document.body.appendChild(textArea);
        keyObj = new KeyboardEvents(textArea, { keyConfigs: htmlKeyConfig });
    });
    afterAll(() => {
        keyObj.destroy();
        detach(textArea);
    });
    it('KeyBoard', () => {
        (keyObj as any).keyPressHandler(keyboardEventArgs);
    });
    it('KeyBoard - onPropertyChanged method call', () => {
        (keyObj as any).onPropertyChanged ({}, {});
    });
});


describe('RTE Keyboard shortcut testing', () => {
    let rteObj: RichTextEditor;
    describe('Insert Image Shortcut testing', () => {
        beforeAll((done: Function) => {
            rteObj = renderRTE({});
            done();
        });
        afterAll((done: Function) => {
            rteObj.destroy();
            done();
        });
        it('Check the dialog is open or not', () => {
            rteObj.focusIn();
            rteObj.inputElement.dispatchEvent(new KeyboardEvent('keydown', INSRT_IMG_EVENT_INIT));
            rteObj.inputElement.dispatchEvent(new KeyboardEvent('keyup', INSRT_IMG_EVENT_INIT));
            expect(rteObj.element.querySelector('.e-rte-img-dialog')).not.toBe(null);
        });
    });
});

describe('Markdown Keyboard shortcut testing', () => {
    let rteObj: RichTextEditor;
    describe('Insert Image Shortcut testing', () => {
        beforeAll((done: Function) => {
            rteObj = renderRTE({
                editorMode: 'Markdown'
            });
            done();
        });
        afterAll((done: Function) => {
            rteObj.destroy();
            done();
        });
        it('Check the dialog is open or not', () => {
            rteObj.focusIn();
            rteObj.inputElement.dispatchEvent(new KeyboardEvent('keydown', INSRT_IMG_EVENT_INIT));
            rteObj.inputElement.dispatchEvent(new KeyboardEvent('keyup', INSRT_IMG_EVENT_INIT));
            expect(rteObj.element.querySelector('.e-rte-img-dialog')).not.toBe(null);
        });
    });
});