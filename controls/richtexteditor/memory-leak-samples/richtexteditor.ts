/* eslint-disable jsdoc/require-jsdoc */
import { getComponent } from '@syncfusion/ej2-base';
import { Count, EmojiPicker, FileManager, FormatPainter, HtmlEditor, Link, QuickToolbar, Resize, RichTextEditor, Table, Toolbar, Video, Image, Audio, SlashMenu, ImportExport, CodeBlock } from '../src/rich-text-editor';

RichTextEditor.Inject(Toolbar, HtmlEditor, QuickToolbar, Link, Image, Table, Count, Resize, Audio, Video,
                      FileManager, FormatPainter, EmojiPicker, SlashMenu, ImportExport, CodeBlock);

document.getElementById('render').addEventListener('click', renderEditor);
document.getElementById('destroy').addEventListener('click', destroyEditor);

function renderEditor(): void {
    const hostURL: string = 'https://ej2services.syncfusion.com/js/development/';
    const editor: RichTextEditor = new RichTextEditor({
        toolbarSettings: {
            items: ['Undo', 'Redo', '|', 'ImportWord', 'ExportWord', 'ExportPdf', '|',
                'Bold', 'Italic', 'Underline', 'StrikeThrough', 'InlineCode', '|', 'CreateLink', 'Image', 'CreateTable', 'CodeBlock',
                'HorizontalLine', 'Blockquote', '|', 'BulletFormatList', 'NumberFormatList', 'Checklist' , '|', 'Formats', 'Alignments', '|', 'Outdent', 'Indent', '|',
                'FontColor', 'BackgroundColor', 'FontName', 'FontSize', '|', 'LowerCase', 'UpperCase', '|', 'SuperScript', 'SubScript', '|',
                'EmojiPicker', 'FileManager', 'Video', 'Audio', '|', 'FormatPainter', 'ClearFormat',
                '|', 'Print', 'FullScreen', '|', 'SourceCode']
        },
        insertImageSettings: {
            saveUrl: hostURL + 'api/RichTextEditor/SaveFile',
            removeUrl: hostURL + 'api/RichTextEditor/DeleteFile',
            path: hostURL + 'RichTextEditor/'
        },
        fileManagerSettings: {
            enable: true, path: '/Pictures/Food',
            ajaxSettings: {
                url: hostURL + 'api/RichTextEditor/FileOperations',
                getImageUrl: hostURL +  'api/RichTextEditor/GetImage',
                uploadUrl: hostURL +  'api/RichTextEditor/Upload',
                downloadUrl: hostURL +  'api/RichTextEditor/Download'
            }
        },
        showCharCount: true,
        enableResize: true,
        exportPdf: {
            serviceUrl: hostURL + 'api/RichTextEditor/ExportToPdf',
            fileName: 'RichTextEditor.pdf',
            stylesheet: `
            .e-rte-content{
                font-size: 1em;
                font-weight: 400;
                margin: 0;
            }
            `},
        importWord: {
            serviceUrl: hostURL + 'api/RichTextEditor/ImportFromWord'
        },
        slashMenuSettings: {
            enable: true
        },
        quickToolbarSettings: {
            table: ['Tableheader', 'TableRemove', '|', 'TableRows', 'TableColumns', 'TableCell', '|', 'TableEditProperties', 'Styles', 'BackgroundColor', 'Alignments', 'TableCellVerticalAlign'],
            text: ['Formats', '|', 'Bold', 'Italic', 'Fontcolor', 'BackgroundColor', '|', 'CreateLink', 'Image', 'CreateTable', 'Blockquote', '|' , 'Unorderedlist', 'Orderedlist', 'Indent', 'Outdent']
        },
        value: `<ol>
    <li>Test a slash menu.</li>
    <li>Test the import export.</li>
    <li>Click buttons in the toolbar.</li>
    <li>Click the splitbutton and dropdown button.</li>
    <li>Open all the insert and edit dialogs.</li>
    <li>Use the Quick table row and column insert.</li>
</ol>`
    });
    editor.appendTo('#richTextEditor');
}

function destroyEditor(): void {
    const editor: RichTextEditor = getComponent(document.getElementById('editor'), 'richtexteditor') as RichTextEditor;
    editor.destroy();
}
