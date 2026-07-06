import { createElement } from "@syncfusion/ej2-base";
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer, CheckBoxFieldSettings,
    FormFieldDataFormat
} from "../../../../src/index";
import { CHECKBOX_B64, EMPTY_PDF_B64, EMPTY_ROTATE_PDF_B64, READONLY_FORM_PDF_B64 } from "../../Data/pdf-data.spec";
import { mouseDoubleClickEvent, mouseDownEvent, mouseMoveEvent, mouseUpEvent, objectValues, rightClickEvent, waitFor } from "../../utils.spec";


describe('PDFViewer_CheckBox_With_FormDesigner', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on Undo and Redo', (done) => {
        try {
            const viewer: any = pdfviewer_checkbox;
            const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            const addField = (opts: any) =>
                viewer.formDesignerModule.addFormField('CheckBox', {
                    name: 'ChkBoxNumber',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            addField({ x: 100, value: '11', isChecked: false, toolTip: 'First' });
            addField({ x: 130, value: '22', isChecked: true, toolTip: 'Second' });
            addField({ x: 160, value: '11', isChecked: false, toolTip: 'Third' });
            const nameTable: any = viewer.nameTable;
            const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'ChkBoxNumber');
            const firstInput = document.getElementById(keys[0] + '_input');
            firstInput.click();
            const secondInput = document.getElementById(keys[1] + '_input');
            secondInput.click();
            const undo = document.getElementById("pdfviewer_checkbox_undo");
            const redo = document.getElementById("pdfviewer_checkbox_redo");
            undo.click();
            const tableAfter_1: any = viewer.nameTable;
            var firstgroupCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "11");
            var firstgroupUnCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "22");
            firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            undo.click();
            const tableAfter_2: any = viewer.nameTable;
            var secondgroupAllUnCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "11");
            secondgroupAllUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            redo.click();
            redo.click();
            const tableAfter_3: any = viewer.nameTable;
            var firstgroupCheck = objectValues(tableAfter_3).filter((val: any) => val.value === "22");
            var firstgroupUnCheck = objectValues(tableAfter_3).filter((val: any) => val.value === "11");
            firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            done();
        } catch (e) {
            done.fail(e as any);
        }
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on same name and same value', (done) => {
        try {
            const viewer: any = pdfviewer_checkbox;
            const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            const addField = (opts: any) =>
                viewer.formDesignerModule.addFormField('CheckBox', {
                    name: 'CheckBox',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 100, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            addField({ x: 100, value: '1', isChecked: false, toolTip: 'First checkbox' });
            addField({ x: 130, value: '1', isChecked: false, toolTip: 'Second checkbox' });
            addField({ x: 160, value: '1', isChecked: false, toolTip: 'Third checkbox' });
            const nameTable: any = viewer.nameTable;
            const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'CheckBox');
            const firstKey = keys[0];
            const firstInput = document.getElementById(firstKey + '_input');
            firstInput.click();
            const tableAfter: any = viewer.nameTable;
            const groupAfter = objectValues(tableAfter).filter((val: any) => val.value === "1");
            groupAfter.forEach((e: any) => expect(e.isChecked).toBe(true));
            done();
        } catch (e) {
            done.fail(e as any);
        }
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on same name and different value', (done) => {
        try {
            const viewer: any = pdfviewer_checkbox;
            const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            const addField = (opts: any) =>
                viewer.formDesignerModule.addFormField('CheckBox', {
                    name: 'ChkNumber',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 300, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            addField({ x: 100, value: 'one', isChecked: false, toolTip: 'First' });
            addField({ x: 130, value: 'two', isChecked: false, toolTip: 'Second' });
            addField({ x: 160, value: 'one', isChecked: false, toolTip: 'Third' });
            const nameTable: any = viewer.nameTable;
            const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'ChkNumber');
            const firstInput = document.getElementById(keys[0] + '_input');
            firstInput.click();
            const tableAfter_1: any = viewer.nameTable;
            var firstgroupCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "one");
            var firstgroupUnCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "two");
            firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            const secondInput = document.getElementById(keys[1] + '_input');
            secondInput.click();
            const tableAfter_2: any = viewer.nameTable;
            var secondgroupCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "two");
            var secondgroupUnCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "one");
            secondgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            secondgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            done();
        } catch (e) {
            done.fail(e as any);
        }
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on download and reload', async () => {
        const viewer = pdfviewer_checkbox;
        const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
        expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
        const addField = (opts: any) =>
            viewer.formDesignerModule.addFormField('CheckBox', {
                name: 'CheckBox',
                pageNumber: 1,
                bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                isChecked: opts.isChecked,
                tooltip: opts.toolTip || '',
                value: opts.value
            } as CheckBoxFieldSettings);
        addField({ x: 100, value: 'first', isChecked: false, toolTip: 'First checkbox' });
        addField({ x: 130, value: 'second', isChecked: true, toolTip: 'Second checkbox' });
        const blob: Blob = await viewer.saveAsBlob();
        const dataUrl: string = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject('FileReader failed while reading PDF blob');
            reader.readAsDataURL(blob);
        });
        viewer.load(dataUrl, '');
        await waitFor(() => {
            const entries = objectValues(viewer.nameTable || {})
                .filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
            return entries.length >= 2;
        });
        const tableAfter: any = viewer.nameTable;
        const groupFirst = objectValues(tableAfter)
            .filter((val: any) => val.value === 'first');
        const groupSecond = objectValues(tableAfter)
            .filter((val: any) => val.value === 'second');
        expect(groupFirst.length).toBeGreaterThanOrEqual(1);
        expect(groupSecond.length).toBeGreaterThanOrEqual(1);
    });
});
describe('PDFViewer_CheckBox_With_FormDesigner_Undo_Redo', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on Undo and Redo after checkbox name change', (done) => {
        try {
            const viewer: any = pdfviewer_checkbox;
            const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            const addField = (opts: any) =>
                viewer.formDesignerModule.addFormField('CheckBox', {
                    name: 'ChkBoxNumber',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            addField({ x: 100, value: '11', isChecked: false, toolTip: 'First' });
            addField({ x: 130, value: '22', isChecked: true, toolTip: 'Second' });
            addField({ x: 160, value: '11', isChecked: false, toolTip: 'Third' });
            const nameTable: any = viewer.nameTable;
            const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'ChkBoxNumber');
            const firstInput = document.getElementById(keys[0] + '_input');
            firstInput.click();
            const secondInput = document.getElementById(keys[1] + '_input');
            secondInput.click();
            const undo = document.getElementById("pdfviewer_checkbox_undo");
            const redo = document.getElementById("pdfviewer_checkbox_redo");
            undo.click();
            const tableAfter_1: any = viewer.nameTable;
            var firstgroupCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "11");
            var firstgroupUnCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "22");
            firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            undo.click();
            const tableAfter_2: any = viewer.nameTable;
            var secondgroupAllUnCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "11");
            secondgroupAllUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            redo.click();
            redo.click();
            const tableAfter_3: any = viewer.nameTable;
            var firstgroupCheck = objectValues(tableAfter_3).filter((val: any) => val.value === "22");
            var firstgroupUnCheck = objectValues(tableAfter_3).filter((val: any) => val.value === "11");
            firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
            done();
        } catch (e) {
            done.fail(e as any);
        }
    });
});
describe('PDFViewer_CheckBox_Without_FormDesigner_Download_Reload', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    let savedDataUrl: string;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1010948-Retrieve grouped checkbox values without Form Designer on download and reload', async () => {
        const viewer = pdfviewer_checkbox;
        const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
        expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
        const addField = (opts: any) =>
            viewer.formDesignerModule.addFormField('CheckBox', {
                name: 'CheckBox',
                pageNumber: 1,
                bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                isChecked: opts.isChecked,
                tooltip: opts.toolTip || '',
                value: opts.value
            } as CheckBoxFieldSettings);

        addField({ x: 100, value: 'first', isChecked: false, toolTip: 'First checkbox' });
        addField({ x: 130, value: 'second', isChecked: true, toolTip: 'Second checkbox' });
        const entries = objectValues(pdfviewer_checkbox.nameTable || {}).filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
        expect(entries.length).toBeGreaterThanOrEqual(2);
        viewer.enableFormDesigner = false;
        const blob: Blob = await viewer.saveAsBlob();
        savedDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject('FileReader failed while reading PDF blob');
            reader.readAsDataURL(blob);
        });
    });

    it('1010948-Validate grouped checkbox values after reload', (done) => {
        pdfviewer_checkbox.load(savedDataUrl, '');
        const tableAfter: any = pdfviewer_checkbox.nameTable;
        const groupFirst = objectValues(tableAfter)
            .filter((val: any) => val.value === 'first');
        const groupSecond = objectValues(tableAfter)
            .filter((val: any) => val.value === 'second');
        expect(groupFirst.length).toBeGreaterThanOrEqual(1);
        expect(groupSecond.length).toBeGreaterThanOrEqual(1);
        done();
    });

});
describe('PDFViewer_CheckBox_Without_FormDesigner_SameName_SameValue', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1010948-Retrieve grouped checkbox values without Form Designer on same name and same value', (done) => {
        try {
            const viewer: any = pdfviewer_checkbox;
            const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            const addField = (opts: any) =>
                viewer.formDesignerModule.addFormField('CheckBox', {
                    name: 'CheckBox',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 100, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            addField({ x: 100, value: '1', isChecked: false, toolTip: 'First checkbox' });
            addField({ x: 130, value: '1', isChecked: false, toolTip: 'Second checkbox' });
            addField({ x: 160, value: '1', isChecked: false, toolTip: 'Third checkbox' });
            viewer.enableFormDesigner = false;
            const nameTable: any = viewer.nameTable;
            const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'CheckBox');
            const firstKey = keys[0];
            const firstInput = document.getElementById(firstKey + '_input');
            firstInput.click();
            const tableAfter: any = viewer.nameTable;
            const groupAfter = objectValues(tableAfter).filter((val: any) => val.value === "1");
            groupAfter.forEach((e: any) => expect(e.isChecked).toBe(true));
            done();
        } catch (e) {
            done.fail(e as any);
        }
    });
});
describe('PDFViewer_CheckBox_Without_FormDesigner_SameName_DifferentValues', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1010948-Retrieve grouped checkbox values with Form Designer on same name and different value', async () => {
        const viewer: any = pdfviewer_checkbox;
        const addField = (opts: any) =>
            pdfviewer_checkbox.formDesignerModule.addFormField('CheckBox', {
                name: 'ChkNumber',
                pageNumber: 1,
                bounds: { X: opts.x, Y: 300, Width: 18, Height: 18 },
                isChecked: opts.isChecked,
                tooltip: opts.toolTip || '',
                value: opts.value
            } as CheckBoxFieldSettings);
        addField({ x: 100, value: 'one', isChecked: false, toolTip: 'First' });
        addField({ x: 130, value: 'two', isChecked: false, toolTip: 'Second' });
        addField({ x: 160, value: 'one', isChecked: false, toolTip: 'Third' });
        viewer.enableFormDesigner = false;
        const nameTable: any = viewer.nameTable;
        const keys = Object.keys(nameTable).filter(k => nameTable[k].formFieldAnnotationType === 'Checkbox' && nameTable[k].name === 'ChkNumber');
        const firstInput = document.getElementById(keys[0] + '_input');
        firstInput.click();
        await waitFor(() => {
            const entries_checkbox = objectValues(pdfviewer_checkbox.nameTable).filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
            return entries_checkbox.length > 0;
        });
        const tableAfter_1: any = viewer.nameTable;
        const firstgroupCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "one");
        const firstgroupUnCheck = objectValues(tableAfter_1).filter((val: any) => val.value === "two");
        firstgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
        firstgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
        const secondInput = document.getElementById(keys[1] + '_input');
        secondInput.click();
        const tableAfter_2: any = viewer.nameTable;
        const secondgroupCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "two");
        const secondgroupUnCheck = objectValues(tableAfter_2).filter((val: any) => val.value === "one");
        secondgroupCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
        secondgroupUnCheck.forEach(function (e: any) { return expect(e.isChecked).toBe(false); });
    });
});
describe('PDFViewer_CheckBox_With_FormDesigner_Rotated_Document', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_ROTATE_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1017599-Checkbox State and Text Rotation Incorrect After Download and Reopen in Rotated Document', async () => {
        const viewer = pdfviewer_checkbox;
        const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
        expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
        const addField = (opts: any) =>
            viewer.formDesignerModule.addFormField('CheckBox', {
                name: 'CheckBox',
                pageNumber: 1,
                bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                isChecked: opts.isChecked,
                tooltip: opts.toolTip || '',
                value: opts.value
            } as CheckBoxFieldSettings);
        addField({ x: 100, value: '1', isChecked: true, toolTip: 'First checkbox' });
        const blob: Blob = await viewer.saveAsBlob();
        const dataUrl: string = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject('FileReader failed while reading PDF blob');
            reader.readAsDataURL(blob);
        });
        viewer.load(dataUrl, '');
        await waitFor(() => {
            const entries = objectValues(viewer.nameTable || {}).filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
            return entries.length >= 1;
        });
        const tableAfter: any = viewer.nameTable;
        const groupAfter = objectValues(tableAfter)
            .filter((val: any) => val.value === '1');
        groupAfter.forEach((e: any) => {
            expect(e.rotateAngle).toBe(0);
        });
    });
});
describe('PDFViewer_CheckBox_With_FormDesigner_Portrait', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1017599-Grouped checkbox values on page with checked Portrait', async () => {
        const viewer = pdfviewer_checkbox;
        const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
        expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
        const addField = (opts: any) =>
            viewer.formDesignerModule.addFormField('CheckBox', {
                name: 'CheckBox',
                pageNumber: 1,
                bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                isChecked: opts.isChecked,
                tooltip: opts.toolTip || '',
                value: opts.value
            } as CheckBoxFieldSettings);
        addField({ x: 100, value: '1', isChecked: true, toolTip: 'First checkbox' });
        addField({ x: 130, value: '1', isChecked: true, toolTip: 'Second checkbox' });
        const blob: Blob = await viewer.saveAsBlob();
        const dataUrl: string = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject('FileReader failed while reading PDF blob');
            reader.readAsDataURL(blob);
        });
        viewer.load(dataUrl, '');
        await waitFor(() => {
            const entries = objectValues(viewer.nameTable || {}).filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
            return entries.length >= 2;
        });
        const tableAfter: any = viewer.nameTable;
        const groupAfter = objectValues(tableAfter)
            .filter((val: any) => val.value === '1');
        groupAfter.forEach((e: any) => {
            expect(e.isChecked).toBe(true);
        });
    });
});
describe('PDFViewer_CheckBox_With_FormDesigner_Programmatic', () => {
    let pdfviewer_checkbox: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox' });
        document.body.appendChild(element);
        pdfviewer_checkbox = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
        });
        pdfviewer_checkbox.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox.appendTo("#pdfviewer_checkbox");
    });
    afterAll(() => {
        if (pdfviewer_checkbox) {
            pdfviewer_checkbox.destroy();
            const el = document.getElementById('pdfviewer_checkbox');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox = null;
        }
    });
    afterEach(() => {
    });
    it('1018899-Grouped Checkbox Behavior Not Applied During Programmatic Creation', async (done: DoneFn) => {
        try {
            const formDesigner = pdfviewer_checkbox.formDesigner || pdfviewer_checkbox.formDesignerModule;
            expect(formDesigner).toBeTruthy('FormDesigner module must be injected.');
            var addField = function (opts: any) {
                return pdfviewer_checkbox.formDesignerModule.addFormField('CheckBox', {
                    name: 'CheckBox',
                    pageNumber: 1,
                    bounds: { X: opts.x, Y: 500, Width: 18, Height: 18 },
                    isChecked: opts.isChecked,
                    tooltip: opts.toolTip || '',
                    value: opts.value
                } as CheckBoxFieldSettings);
            };
            addField({ x: 100, value: '1', isChecked: true, toolTip: 'First checkbox' });
            addField({ x: 130, value: '1', toolTip: 'Second checkbox' });
            const tableAfter = pdfviewer_checkbox.nameTable;
            const groupAfter = objectValues(tableAfter).filter((val: any) => val.value === "1");
            groupAfter.forEach((e: any) => expect(e.isChecked).toBe(true));
            done();
        }
        catch (e) {
            done.fail(e as any);
        }
    });
});
describe('PDFViewer_CheckBox_With_FormDesigner_Export_Import', function () {
    let pdfviewer_checkbox_export: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox_export' });
        document.body.appendChild(element);
        pdfviewer_checkbox_export = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + CHECKBOX_B64
        });
        pdfviewer_checkbox_export.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox_export.appendTo("#pdfviewer_checkbox_export");
    });
    afterAll(() => {
        if (pdfviewer_checkbox_export) {
            pdfviewer_checkbox_export.destroy();
            const el = document.getElementById('pdfviewer_checkbox_export');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox_export = null;
        }
    });
    afterEach(() => {
    });
    it('1019004-Checkbox Field Values Not Updated Correctly After Export and Import via Form Designer', async () => {
        pdfviewer_checkbox_export.importFormFields('{"CheckBox":"1"}', FormFieldDataFormat.Json);
        await waitFor(() => {
            const entries_chk = objectValues(pdfviewer_checkbox_export.nameTable).filter((v: any) => v.formFieldAnnotationType === 'Checkbox');
            return entries_chk.length >= 2;
        });
        const tableAfter = pdfviewer_checkbox_export.nameTable;
        const groupCheck = objectValues(tableAfter).filter(function (val) { return val.value === "1" && val.isChecked === true; });
        const groupUnCheck = objectValues(tableAfter).filter(function (val) { return val.value === "2" && val.isChecked === false; });
        groupCheck.forEach(function (e) { return expect(e.isChecked).toBe(true); });
        groupUnCheck.forEach(function (e) { return expect(e.isChecked).toBe(false); });
    });
});
describe('PDF_Viewer_CheckBox_Properties_Dialog', () => {
    let pdfviewer_checkbox_properties: PdfViewer = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
        TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

    beforeAll((done) => {
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_checkbox_properties' });
        document.body.appendChild(element);
        pdfviewer_checkbox_properties = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
            enableFormDesigner: true
        });
        pdfviewer_checkbox_properties.documentLoad = () => {
            done();
        }
        pdfviewer_checkbox_properties.appendTo("#pdfviewer_checkbox_properties");
    });
    afterAll(() => {
        if (pdfviewer_checkbox_properties) {
            pdfviewer_checkbox_properties.destroy();
            const el = document.getElementById('pdfviewer_checkbox_properties');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_checkbox_properties = null;
        }
    });
    afterEach(() => {
    });
    it("1017599 - Checkbox checked state should update UI immediately when changed via Properties dialog", function (done) {
        try {
            const target = document.querySelector("#pdfviewer_checkbox_properties_textLayer_0");
            const formDesignerButton = document.querySelector('#pdfviewer_checkbox_properties_formdesigner') as HTMLElement;
            formDesignerButton.click();
            pdfviewer_checkbox_properties.formDesignerModule.setFormFieldMode('CheckBox');
            const rectValue = target.getBoundingClientRect();
            const x = Math.round(rectValue.left + 200);
            const y = Math.round(rectValue.top + 200);
            mouseDownEvent(target, x, y);
            mouseMoveEvent(target, x, y);
            mouseMoveEvent(target, x + 10, y + 10);
            mouseUpEvent(target, x + 10, y + 10);
            const fieldId = pdfviewer_checkbox_properties.formFieldCollection[0].id;
            const checkboxFieldName = pdfviewer_checkbox_properties.formFieldCollection[0].name;
            pdfviewer_checkbox_properties.formDesignerModule.addFormField('CheckBox', {
                name: 'CheckBox',
                pageNumber: 1,
                bounds: { X: 400, Y: 400, Width: 18, Height: 18 },
            } as CheckBoxFieldSettings);
            pdfviewer_checkbox_properties.formDesignerModule.selectFormField(fieldId);
            mouseMoveEvent(target, x, y);
            mouseDoubleClickEvent((target as HTMLElement), x, y);
            const propertiesWindow = document.querySelector('#pdfviewer_checkbox_properties_properties_window') as HTMLElement;
            expect(propertiesWindow).toBeTruthy();
            const checkedLabel = propertiesWindow.querySelector('.e-pv-properties-checkbox-checked-input') as HTMLElement;
            expect(checkedLabel).toBeTruthy();
            checkedLabel.click();
            const buttons = propertiesWindow.querySelectorAll('button');
            const okButton = Array.from(buttons).find(
                (btn) => btn.textContent && btn.textContent.trim() === 'OK'
            ) as HTMLButtonElement;
            expect(okButton).toBeTruthy();
            okButton.click();
            const tableAfter = pdfviewer_checkbox_properties.nameTable;
            var groupAfter = objectValues(tableAfter).filter(function (val) { return val.name === checkboxFieldName });
            groupAfter.forEach(function (e: any) { return expect(e.isChecked).toBe(true); });
            done();
        } catch (e) {
            done.fail(e);
        }
    });
});
