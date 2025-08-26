/**
 * Insert HTML exec plugin spec
 */
import { createElement, detach } from '@syncfusion/ej2-base';
import { EditorManager } from '../../../src/editor-manager/index';

describe('Insert HTML  Exec plugin', () => {

    describe('apply bold testing', () => {
        let editorObj: EditorManager;

        let elem: HTMLElement = createElement('div', {
            id: 'dom-node', innerHTML: `
        <div style="color:red;" id="content-edit" contenteditable="true" class="e-node-deletable e-node-inner">
          <p class='first-p-node'>dom node
           <a href="https://www.google.com" tabindex="1">Google</a>
           <label id="label1">First label Node</label>
           <label id="label2">Second label Node</label>
           </p>
           <p class='last-p-node'>
             <label id="label3">Third Label Node</label>
             <label id="label4">Last Label Node</label>
             <span id='span1'>
             <img id='img1' src="https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" width="250" height="250">
             <label id="label5">Content</label>
             </span>
             <span id='span2'>the</span>
             <span id='span3'>the<img width="250" height="250"></span>
           </p>
         </div>
         ` });
        beforeAll(() => {
            document.body.appendChild(elem);
            editorObj = new EditorManager({ document: document, editableElement: document.getElementById("content-edit") });
        });

        it('Insert a Span', () => {
            let node1: HTMLElement = document.getElementById('label1');
            let node2: HTMLElement = document.getElementById('label2');
            editorObj.nodeSelection.setSelectionText(document, node1.childNodes[0], node2.childNodes[0], 0, 5);
            let node: Node = document.createElement('span');
            node.textContent = 'span Node';
            editorObj.execCommand("InsertHtml", null, null, ():boolean => { return true;}, node );
            //The below line has been changed because the inserthtml code has been changed.
            //When the whole text content in the element is selected, the selected content's element will be removed when inserting new content.
            expect(document.getElementById('label1')).toBe(null);
            expect(document.querySelector('.first-p-node').childNodes[5].nodeName.toLowerCase()).toBe('span');
        });
        it('Insert an Image', () => {
            let node: HTMLElement = document.getElementById('label3');
            editorObj.nodeSelection.setSelectionText(document, node.childNodes[0], node.childNodes[0], 1, 1);
            let img: HTMLImageElement = document.createElement('img');
            img.src = 'https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
            img.width = 250;
            img.height = 250;
            editorObj.execCommand("InsertHtml", null, null, null, img );
            expect(node.childNodes[1].nodeName.toLowerCase()).toBe('img');
        });
        it('Insert an Image selection', () => {
            let node: HTMLElement = document.getElementById('label4');
            editorObj.nodeSelection.setSelectionText(document, node.childNodes[0], node.childNodes[0], 0, 4);
            let img: HTMLImageElement = document.createElement('img');
            img.src = 'https://www.google.co.in/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
            img.width = 250;
            img.height = 250;
            editorObj.execCommand("InsertHtml", null, null, null, img );
            expect(node.childNodes[0].nodeName.toLowerCase()).toBe('img');
        });
        it('selecting an Image selection', () => {
            let node1: HTMLElement = document.getElementById('img1');
            let node2: HTMLElement = document.getElementById('label5');
            editorObj.nodeSelection.setSelectionText(document, node1, node2.childNodes[0], 0, 3);
            let img: HTMLImageElement = document.createElement('img');
            img.width = 250;
            img.height = 250;
            editorObj.execCommand("InsertHtml", null, null, null, img );
            expect(document.getElementById('span1').childNodes[1].nodeName.toLowerCase()).toBe('img');
        });
        it('last an Image selection', () => {
            let node1: HTMLElement = document.getElementById('span3');
            editorObj.nodeSelection.setSelectionText(document, node1.childNodes[0], node1.childNodes[0], 0, 0);
            let spanElem: HTMLElement = createElement('span', { id: 'insertspan' });
            spanElem.innerHTML = 'new span';
            editorObj.execCommand("InsertHtml", null, null, null, spanElem );
            expect(document.getElementById('span3')).not.toBe(null);
            expect(document.getElementById('span2').nextElementSibling.children[0].getAttribute('id')).toBe(spanElem.getAttribute('id'));
        });
        it('Insert a Span', () => {
            let node1: HTMLElement = document.getElementById('span2');
            editorObj.nodeSelection.setSelectionText(document, node1.childNodes[0], node1.childNodes[0], 0, 3);
            let node: Node = document.createElement('span');
            node.textContent = 'span Node';
            editorObj.execCommand("InsertHtml", null, null, ():boolean => { return true;}, node );
            expect(document.getElementById('span1').nextElementSibling.nodeName.toLowerCase()).toBe('span');
        });
        afterAll(() => {
            detach(elem);
        });
    });
});