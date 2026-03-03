import { BookmarkDialog, ContentControlInfo, DocumentEditor, DocumentEditorSettings, FormFieldData, Regular, XmlHttpRequestEventArgs, XmlHttpRequestHandler } from '../../../../src/index';
import { createElement, Browser } from '@syncfusion/ej2-base';
import 'node_modules/es6-promise/dist/es6-promise';
import { TestHelper } from '../../../test-helper.spec';
import { DocumentEditorContainer } from '../../../../src/document-editor-container/document-editor-container';
import { Toolbar } from '../../../../src/document-editor-container/tool-bar/tool-bar';

describe('Show Dialog documenteditor properties_1 ', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({isReadOnly:false})
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('ShowBookmarkDialog', () => {
        console.log('ShowBookmarkDialog');
        expect(() => documenteditor.showDialog('Bookmark')).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
    it('ShowHyperlinkDialog', () => {
        console.log('ShowHyperlinkDialog');
        expect(() => documenteditor.showDialog('Hyperlink')).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
    it('ShowTableDialog', () => {
        console.log('ShowTableDialog');
        documenteditor.editor.insertTable(2, 2);
        expect(() => documenteditor.showDialog('Table')).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
});
describe('Show Dialog documenteditor properties_1 ', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({isReadOnly:false})
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
        it('showTableOfContentsDialog', () => {
            console.log('showTableOfContentsDialog');
            expect(() => documenteditor.showDialog('TableOfContents')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showPageSetupDialog', () => {
            console.log('showPageSetupDialog');
            expect(() => documenteditor.showDialog('PageSetup')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showColumnsDialog', () => {
            console.log('showColumnsDialog');
            expect(() => documenteditor.showDialog('Columns')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showStyleDialog', () => {
            console.log('showStyleDialog');
            expect(() => documenteditor.showDialog('Style')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
    });
    describe('Show Dialog documenteditor properties_2 ', () => {
        let documenteditor: DocumentEditor;
        beforeAll((): void => {
            let ele: HTMLElement = createElement('div', { id: 'container' });
            document.body.appendChild(ele);
            documenteditor = new DocumentEditor({ isReadOnly: false })
            documenteditor.enableAllModules();
            documenteditor.appendTo("#container");
        });
        afterAll((done) => {
            documenteditor.destroy();
            document.body.removeChild(document.getElementById('container'));
            documenteditor = undefined;
            
            setTimeout(function () {
                done();
            }, 1000);
        });
        it('showListDialog', () => {
            console.log('showListDialog');
            expect(() => documenteditor.showDialog('List')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();

        });
        it('showStylesDialog', () => {
            console.log('showStylesDialog');
            documenteditor.showDialog('Style')
            expect(() => documenteditor.showDialog('Styles')).not.toThrow();
            documenteditor.documentHelper.hideDialog();
        });
        it('showParagraphDialog', () => {
            console.log('showParagraphDialog');
            expect(() => documenteditor.showDialog('Paragraph')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
    });
    describe('Show Dialog documenteditor properties_1 ', () => {
        let documenteditor: DocumentEditor;
        beforeAll((): void => {
            let ele: HTMLElement = createElement('div', { id: 'container' });
            document.body.appendChild(ele);
            documenteditor = new DocumentEditor({isReadOnly:false})
            documenteditor.enableAllModules();
            documenteditor.appendTo("#container");
        });
        afterAll((done) => {
            documenteditor.destroy();
            document.body.removeChild(document.getElementById('container'));
            documenteditor = undefined;
            
            setTimeout(function () {
                done();
            }, 1000);
        });
        it('showFontDialog', () => {
            console.log('showFontDialog');
            expect(() => documenteditor.showDialog('Font')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showTablePropertiesDialog', () => {
            console.log('showTablePropertiesDialog');
           documenteditor.editor.insertTable(2, 2);
            expect(() => {
                documenteditor.showDialog('TableProperties')}).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });

        it('showBordersAndShadingDialog', () => {
            console.log('showBordersAndShadingDialog');
            expect(() => documenteditor.showDialog('BordersAndShading')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showTableOptionsDialog', () => {
            console.log('showTableOptionsDialog');
            documenteditor.editor.insertTable(2, 2);
            expect(() => documenteditor.showDialog('TableOptions')).not.toThrowError();
        });
        it('show cell options dialog', () => {
            console.log('showcellOptionsDialog');
            documenteditor.editor.insertTable(2, 2);
            expect(() => documenteditor.showCellOptionsDialog()).not.toThrowError();
        });
        // it('showSpellCheckDialog', () => {
        //     console.log('showSpellCheckDialog');
        //     expect(() => documenteditor.showSpellCheckDialog()).not.toThrowError();
            //    documenteditor.documentHelper.hideDialog();
        // });
    });
    describe('Show Dialog documenteditor properties_1 ', () => {
        let documenteditor: DocumentEditor;
        beforeAll((): void => {
            let ele: HTMLElement = createElement('div', { id: 'container' });
            document.body.appendChild(ele);
            documenteditor = new DocumentEditor({isReadOnly:false})
            documenteditor.enableAllModules();
            documenteditor.appendTo("#container");
        });
        afterAll((done) => {
            documenteditor.destroy();
            document.body.removeChild(document.getElementById('container'));
            documenteditor = undefined;
            
            setTimeout(function () {
                done();
            }, 1000);
        });
        it('showDateContentDialog', () => {
            console.log('showDateContentDialog');
            expect(() => documenteditor.showDialog('DatepickerContentControl')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showPicContentControlDialog', () => {
            console.log('showPicContentControlDialog');
            expect(() => documenteditor.showDialog('PictureContentControl')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });
        it('showContentPropertiesDialog', () => {
            console.log('showContentPropertiesDialog');
            expect(() => documenteditor.showDialog('ContentControlProperties')).not.toThrowError();
            documenteditor.documentHelper.hideDialog();
        });

    });
describe('Form Field documenteditor properties ', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({isReadOnly:false})
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('TextFormFieldDialog', () => {
        console.log('TextFormFieldDialog');
        documenteditor.editor.insertFormField('Text');
        expect(() => documenteditor.textFormFieldDialogModule.show()).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
    it('CheckBoxFormFieldDialog', () => {
        console.log('CheckBoxFormFieldDialog');
        documenteditor.editor.insertFormField('CheckBox');
        expect(() => documenteditor.checkBoxFormFieldDialogModule.show()).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
    it('DropDownFormFieldDialog', () => {
        console.log('DropDownFormFieldDialog');
        documenteditor.editor.insertFormField('DropDown');
        expect(() => documenteditor.dropDownFormFieldDialogModule.show()).not.toThrowError();
        documenteditor.documentHelper.hideDialog();
    });
    it('Export form field', () => {
        console.log('Export form field');
        documenteditor.editor.insertFormField('Text');
        documenteditor.editor.insertFormField('CheckBox');
        documenteditor.editor.insertFormField('DropDown');
        let formFieldDate: FormFieldData[] = documenteditor.exportFormData();
        expect(formFieldDate.length).toBe(6);
    });
    it('Import form field', () => {
        console.log('Import form field');
        documenteditor.editor.insertFormField('Text');
        documenteditor.editor.insertFormField('CheckBox');
        documenteditor.editor.insertFormField('DropDown');
        let textformField: FormFieldData = { fieldName: 'Text1', value: 'Hello World' };
        let checkformField: FormFieldData = { fieldName: 'Check1', value: true };
        let dropdownformField: FormFieldData = { fieldName: 'Drop1', value: 1 };
        let formFieldDate: FormFieldData[] = documenteditor.exportFormData();
        documenteditor.importFormData([textformField, checkformField, dropdownformField]);
        expect(formFieldDate.length).toBe(9);
    });
    it('Reset form fields', () => {
        console.log('Reset form fields');
        documenteditor.editor.insertFormField('Text');
        documenteditor.editor.insertFormField('CheckBox');
        documenteditor.editor.insertFormField('DropDown');
        documenteditor.resetFormFields();
        expect(documenteditor.getFormFieldInfo.length).toBe(1);
    });
});
describe('Save functionality documenteditor properties ', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({ isReadOnly: false })
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
        documenteditor.editor.insertText("Adventure Works Cycles, the fictitious company on which the Adventure Works sample ");
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('Save Docx', () => {
        console.log('Save Docx');
        expect(()=>{ documenteditor.save('sample', 'Docx');}).not.toThrowError();
    });
    it('Save sfdt', () => {
        console.log('Save sfdt');
        expect(()=>{ documenteditor.save('sample', 'Sfdt');}).not.toThrowError();
    });
    it('Save txt', () => {
        console.log('Save txt');
        expect(()=>{ documenteditor.save('sample', 'Txt');}).not.toThrowError();
    });
    it('Save as Blob', () => {
        console.log('Save as Blob');
        expect(()=>{ documenteditor.saveAsBlob('Docx');}).not.toThrowError();
    });
    it('Save as Blob - Sfdt', () => {
        console.log('Save as Blob - Sfdt');
        expect(()=>{ documenteditor.saveAsBlob('Sfdt');}).not.toThrowError();
    });
});

describe('Document Editor Color Picker Properties', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({isReadOnly:false})
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });

    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });

    it('should change color picker properties and apply them', () => {
        console.log('applyColorPickerProperties mode change');

        // Define new color picker settings
        documenteditor.documentEditorSettings = {colorPickerSettings : {
            mode: 'Picker',
            modeSwitcher: true,
            showButtons: true,
            columns: 5,
            disabled: false,
            inline: false,
            noColor: true
        }};

        // Verify that the color picker settings were applied correctly
        const settings = documenteditor.documentEditorSettings.colorPickerSettings;
        expect(settings.mode).toBe('Picker');
        expect(settings.columns).toBe(5);
    });
});

describe('Document Editor enableOptimizedTextMeasuring', () => {
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({isReadOnly:false , documentEditorSettings: { enableOptimizedTextMeasuring: false, showRuler: true }});
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });

    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });

    it('enable optimized rendering false validation', () => {
        console.log('enable optimized rendering false validation');
        documenteditor.editor.insertText("Adventure Works Cycles, the fictitious company on which the Adventure Works sample ");
        documenteditor.selection.selectAll();
        documenteditor.selection.characterFormat.fontSize = 20;

        documenteditor.selection.characterFormat.bold = true;
        documenteditor.selection.characterFormat.italic = true;
        documenteditor.selection.characterFormat.fontSize = 0.1;
        expect(documenteditor.documentEditorSettings.enableOptimizedTextMeasuring).toBe(false);
    });
    it('regular branch coverage', () => {
        console.log('regular branch coverage');
        expect(() => { (documenteditor.textMeasureHelper as Regular).applyStyle(undefined, undefined, ''); }).not.toThrowError();
    });
    it('show Ruler validation', () => {
        console.log('show Ruler validation');
        expect(documenteditor.documentEditorSettings.showRuler).toBe(true);
    });
});

describe('Document Editor applyStyle different Headings', () => {
    let documenteditor: DocumentEditorContainer;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        DocumentEditorContainer.Inject(Toolbar);
        documenteditor = new DocumentEditorContainer({ showPropertiesPane: false, enableLocalPaste: true });
        documenteditor.appendTo("#container");
        jasmine.clock().install();
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        jasmine.clock().uninstall();
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('Apply Heading 7', () => {
        documenteditor.documentEditor.editor.insertText("Heading 7");
        documenteditor.documentEditor.selection.selectAll();
        const style = document.querySelector('#container_editor_font_properties_style') as any;
        const dropdownIcon = style.ej2_instances[0];
        dropdownIcon.showPopup();
        const options = document.querySelectorAll('li[role="option"]');
        let heading = null;
        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent && options[i].textContent.indexOf('Heading 7') !== -1) {
                heading = options[i] as any;
                break;
            }
        }
        
        if (heading) {
            heading.click();
            jasmine.clock().tick(100);
        }
        expect(documenteditor.documentEditor.editor.documentHelper.selection.paragraphFormat.styleName).toBe("Heading 7");
    });
    it('Apply Heading 8', () => {
        documenteditor.documentEditor.editor.insertText("Heading 8");
        documenteditor.documentEditor.selection.selectAll();
        const style = document.querySelector('#container_editor_font_properties_style') as any;
        const dropdownIcon = style.ej2_instances[0];
        dropdownIcon.showPopup();
        const options = document.querySelectorAll('li[role="option"]');
        let heading = null;
        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent && options[i].textContent.indexOf('Heading 8') !== -1) {
                heading = options[i] as any;
                break;
            }
        }
        
        if (heading) {
            heading.click();
            jasmine.clock().tick(100);
        }
        expect(documenteditor.documentEditor.editor.documentHelper.selection.paragraphFormat.styleName).toBe("Heading 8");
    });
    it('Apply Heading 9', () => {
        documenteditor.documentEditor.editor.insertText("Heading 9");
        documenteditor.documentEditor.selection.selectAll();
        const style = document.querySelector('#container_editor_font_properties_style') as any;
        const dropdownIcon = style.ej2_instances[0];
        dropdownIcon.showPopup();
        const options = document.querySelectorAll('li[role="option"]');
        let heading = null;
        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent && options[i].textContent.indexOf('Heading 9') !== -1) {
                heading = options[i] as any;
                break;
            }
        }
        
        if (heading) {
            heading.click();
            jasmine.clock().tick(100);
        }
        expect(documenteditor.documentEditor.editor.documentHelper.selection.paragraphFormat.styleName).toBe("Heading 9");
    });
});

describe('Validating standardContextual', () => {
    let sfdtContent: any = '{"sfdt":"UEsDBAoAAAAIADGFVFzvp4+x1gcAACYrAAAEAAAAc2ZkdO1a3WocRxZ+lab2ZgOKmenp+b2zfmzZlmLFmhiMVxfVM9XTZVX/bFe15YkQBOcqNwFDnI1ZZ0mWhUDCsoENbNibfYx5AINN4n2InFPVPZp/t+RW7AtrQKe76lTVd853zumqmT4mUax4wD9m+15fkY5KUrZGqO+SjkeFZGtEsh7p3D1GGSekc0ziI9JpVO01Evuk02zDhQjgAmSSSZVJN5N+n3RqjTXiZbLvxaRTARkxc+FyI2Al8gE72qMDRtYICz3SgeEeSuhOeC6ZltwLSacKkhkZD0IJE1xOqMt7MD7sRULqHvbnIy2Fq3p6qOm5e3ACi2rrYg9Nc/uJRKkA1jH0CWVkMjDSze59I+6jAClViMCjJKCCGGuMHwUi1io9zwzherWeWS1Xc/MRoKAErE1G344ej/46+gb+f2+Nno4ejZ6Mvho9JidrBQbLYmqjv1ijf8AS38Lcj0E+KTbM+qNdsevvWQUXeTT6ezHNP5GCM/6NnBygZpmULSbq4OQABpqeg6yLePJjiCUMSw+DLVaRhAmgFZGadrwiAQ+jZJ33OfTyvu4Ev+FSgIzsKxr2adLfiELFHqhUo+B9VKrV8MpjeO3o+Wg+3fblUOJ8HqQEm288bduiUl2WnIJLX89PFAa1QBvz6FK13qrBX6Vad5xqq43GSKXz6dR/HrYck10qBmloXY2UzzGrX3736P9ff2L9+u9vXn6BYUyUJ1Bv0jOLzAfNvjoyZSPLXZaVAx8wErBbZtILDJbYiL6vAqGvPM9UgV4UmHIj1VC5pk/5gSG1lwkMi5uex3tYgQJ6z5OmQ+jExV5BFQ+hU+X0W5tcxoIOoQ0DtGJXq5VKxanY44+jQxsHM1pEqydXakEsetrL12OK6s9//vnZw5+ePfzPs08/ffbwX9YOH/gKZtim4WDO97oZ6+SLf3724r//m1RGi55/+eOLn358/tXnv/zwBbRiMYXWLg+YtKA0W7eigKL128xNFnZ0fYrhfzkcSBpS7ILGLQgDzLchFeiAdaaB3U44JAHcX03v4WT7fpIqDOUbfoD3u1Ek1qNET3sDNWG9NByYEUkKt7covY8DNoxJW2nss4CjwobPcIo9AWbB4yRkysKm6JAhsXc4Rzy7vJdEMvKUdYdb65Trxbscc2Gib5tDkaBDaoxDFLu3rfVIoPImu68bwNM6hbtMIK6rNFU00LNRjEKyQ5WPE+wPE0yHLanArAETkbXVZ1Ji181kiFPdoIIbG3fFMNANieKH2LBDowgaNqPDDZ8GsZ6Ph5Cx5Jo8BF9Ray9SemSk/YsCYNJwbNttztRC1j6CKJgyGhvSBD3NIs3NUHiUhTokglA/Zrm2eD0doCt3GBP0iPYZsz66hs1RHE1NeN0H0rcZorhOtdNQhEwyqwsVEM3jEn23zwZRNsnu0MTBkIYBTXK9Dw61G7bcBIhBx4neIQYXx2JOzcibMqCTOns+RY+gkHFGRLiECOi6t7yLLeuCQJ1F0aWCTTmhS7m1w0xPOtWDZOjeVHd7msAMPtZVKOsFStGbLEFQM54//bpg2XlVwcmjKysz+W1WXDaipM9fr7Zs0jTcY5A870pLqaUlZ+pdQXmrCwqWFBe3fgRj5g9Xsj+it8bDcYEZb5CzrdXrbCXn99jhg9Ml8rqzzWgfgtSqlrOoi1u/ltnHOmskEnoneCjGR93Do3DJac3s9O3K5E5/YqvnacdVrjjNRhUcNz4CmAHmCEDvjY8A2S4eW+Z28dONp22Tu3h36rgy6SgoPhTzaqU3cyVldsJvp32bzKOpUNYeTeggobFvXYHj0ay9Y+OWqk8YeTLrCbu8uJoOK/tMYVVtnNHtZsDvF1Z2kbCyl4bV22RfobCy54yrXVSk1M4WKc4KpzlLnHZGsmtFyK4tJ7tciIX4qs3hc8rjyzF82YYvpyhf4+/95pzBT78TLIMvpwhfziK+LgJiIb6cOXz1i+KrXji/5mK2BG7qRbipL8yl14RTiIf6HJZGeTzYhoeK4aFxzrypt/FzEXnTKMJNo0DelAKxEF+NOXzNi+Kreba8mfBBGdw0i3DTXJ4354dTiIfmHJZWOTxMENA6Z8LYTfxcRMK0ipDSKpAwpUAsRFRrDl+7dKLaZ8uUCePLIKVdhJT28kw5P5xCBLTHWAw0q0tdwQwSewp01pOrd7nK9crgysl+tjr9laonVx/1W8vOLNnJt1X+EQVBgWnvVy7VF1GuXbKK7imF+cP9W2HRyqgxpOfm7KeuKi8KDMsgRBiBa5YerCYfHWc/tWQGVy41F1KYm7SKxVmdFSessrGuJGdMRw70wzRSJZGjqDYyOx6/4gnnVPAz/fhY5GyNb5WnpxRWPK9WLLjSY8ZB+Wo7XE7olRXUofk5fGk1m3WM9sMMlBzhtVCxUDJrK4h9Krk8+3FxtVdm13llAJHZhfzQPHdFJo4wfOGIJ33zW36MLwosc9+5Z1vkdKd2ya7gX7Nht2ttp46vIi1unwju/NvnautcXxgsivIpZ66K9oWKpfK7ANDc6reYxxIW9tjM4u7Sxd3TLWJWr+x6sTjDTQhLSt3wzWwiiiRbhiIHdSUCt7xxUBkK/OlW6LebYDJhZC8wMsluHxjJg4E0s+GbdsdElv6q3MoX5E5fDUshuWr42teBKXtvDoWTowh/JxQH+LIbYe/8/wb9f/IbUEsBAhQACgAAAAgAMYVUXO+nj7HWBwAAJisAAAQAAAAAAAAAAAAAAAAAAAAAAHNmZHRQSwUGAAAAAAEAAQAyAAAA+AcAAAAA"}'
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({ isReadOnly: false })
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
        documenteditor.open(sfdtContent)
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('Save Docx', () => {
        console.log('Save Docx');
        expect(()=>{ documenteditor.save('sample', 'Docx');}).not.toThrowError();
    });
});

describe('Validating optimized standardContextual', () => {
    let sfdtContent: any = '{"sfdt":"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"}';
    let documenteditor: DocumentEditor;
    beforeAll((): void => {
        let ele: HTMLElement = createElement('div', { id: 'container' });
        document.body.appendChild(ele);
        documenteditor = new DocumentEditor({ isReadOnly: false })
        documenteditor.enableAllModules();
        documenteditor.appendTo("#container");
    });
    afterAll((done) => {
        documenteditor.destroy();
        document.body.removeChild(document.getElementById('container'));
        documenteditor = undefined;
        
        setTimeout(function () {
            done();
        }, 1000);
    });
    it('Open optimized document', () => {
        console.log('Open optimized document');
        expect(()=>{ documenteditor.open(sfdtContent);}).not.toThrowError();
    });
});