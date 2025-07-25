// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../../workbook/base/workbook-model.d.ts'/>
import { Property, NotifyPropertyChanges, INotifyPropertyChanged, ModuleDeclaration, Event, isUndefined, attributes } from '@syncfusion/ej2-base';
import { addClass, removeClass, EmitType, Complex, formatUnit, L10n, isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
import { detach, select, closest, setStyleAttribute, EventHandler, getComponent } from '@syncfusion/ej2-base';
import { MenuItemModel, BeforeOpenCloseMenuEventArgs, ItemModel } from '@syncfusion/ej2-navigations';
import { mouseDown, spreadsheetDestroyed, keyUp, BeforeOpenEventArgs, clearViewer, refreshSheetTabs, positionAutoFillElement, readonlyAlert, deInitProperties, UndoRedoEventArgs, isColumnRange, isRowRange, findDlg } from '../common/index';
import { performUndoRedo, overlay, DialogBeforeOpenEventArgs, createImageElement, deleteImage, removeHyperlink } from '../common/index';
import { HideShowEventArgs, sheetNameUpdate, updateUndoRedoCollection, getUpdateUsingRaf, setAutoFit } from '../common/index';
import { actionEvents, CollaborativeEditArgs, keyDown, enableFileMenuItems, hideToolbarItems, updateAction } from '../common/index';
import { ICellRenderer, colWidthChanged, rowHeightChanged, hideRibbonTabs, addFileMenuItems, getSiblingsHeight } from '../common/index';
import { defaultLocale, locale, setResize, initiateFilterUI, clearFilter, focus, removeDesignChart } from '../common/index';
import { CellEditEventArgs, CellSaveEventArgs, ribbon, formulaBar, sheetTabs, formulaOperation, addRibbonTabs } from '../common/index';
import { addContextMenuItems, removeContextMenuItems, enableContextMenuItems, selectRange, addToolbarItems } from '../common/index';
import { cut, copy, paste, PasteSpecialType, dialog, editOperation, activeSheetChanged, refreshFormulaDatasource } from '../common/index';
import { Render } from '../renderer/render';
import { Scroll, VirtualScroll, Edit, CellFormat, Selection, KeyboardNavigation, KeyboardShortcut, WrapText } from '../actions/index';
import { Clipboard, ShowHide, UndoRedo, SpreadsheetHyperlink, Resize, Insert, Delete, FindAndReplace, Merge, AutoFill, SpreadsheetNote } from '../actions/index';
import { ProtectSheet } from '../actions/index';
import { CellRenderEventArgs, IRenderer, IViewport, OpenOptions, MenuSelectEventArgs, click, hideFileMenuItems } from '../common/index';
import { Dialog, ActionEvents, Overlay } from '../services/index';
import { ServiceLocator } from '../../workbook/services/index';
import { SheetModel, getColumnsWidth, getSheetIndex, WorkbookHyperlink, HyperlinkModel, DefineNameModel } from './../../workbook/index';
import { BeforeHyperlinkArgs, AfterHyperlinkArgs, FindOptions, ValidationModel, getCellAddress, getColumnHeaderText, SortCollectionModel, PrintOptions, getSwapRange, getSheetIndexFromAddress, isReadOnlyCells, updateSortCollection } from './../../workbook/common/index';
import { BeforeCellFormatArgs, afterHyperlinkCreate, getColIndex, CellStyleModel, setLinkModel } from './../../workbook/index';
import { BeforeSaveEventArgs, SaveCompleteEventArgs, WorkbookInsert, WorkbookDelete, WorkbookMerge } from './../../workbook/index';
import { getSheetNameFromAddress, DataBind, CellModel, beforeHyperlinkCreate, DataSourceChangedEventArgs } from './../../workbook/index';
import { BeforeSortEventArgs, SortOptions, sortComplete, SortEventArgs, dataSourceChanged, isHiddenRow, isHiddenCol } from './../../workbook/index';
import { getSheetIndexFromId, WorkbookEdit, WorkbookOpen, WorkbookSave, WorkbookCellFormat, WorkbookSort, getSheet } from './../../workbook/index';
import { FilterOptions, FilterEventArgs, ProtectSettingsModel, findKeyUp, refreshRibbonIcons, hideShow } from './../../workbook/index';
import { Workbook } from '../../workbook/base/workbook';
import { SpreadsheetModel } from './spreadsheet-model';
import { getRequiredModules, ScrollSettings, ScrollSettingsModel, SelectionSettingsModel, enableToolbarItems } from '../common/index';
import { SelectionSettings, BeforeSelectEventArgs, SelectEventArgs, getStartEvent, enableRibbonTabs, getDPRValue } from '../common/index';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { setRowHeight, getRowsHeight, getColumnWidth, getRowHeight, getCell, setColumn, setCell, ColumnModel, RowModel, setRow } from './../../workbook/base/index';
import { getRangeIndexes, getIndexesFromAddress, getCellIndexes, WorkbookNumberFormat, WorkbookFormula } from '../../workbook/index';
import { Ribbon, FormulaBar, SheetTabs, Open, ContextMenu, Save, NumberFormat, Formula } from '../integrations/index';
import { Sort, Filter, SpreadsheetImage, SpreadsheetChart } from '../integrations/index';
import { isNumber, getColumn, getRow, WorkbookFilter, refreshInsertDelete, InsertDeleteEventArgs, RangeModel } from '../../workbook/index';
import { PredicateModel, fltrPrevent } from '@syncfusion/ej2-grids';
import { RibbonItemModel } from '../../ribbon/index';
import { DataValidation, spreadsheetCreated, showAggregate } from './../index';
import { WorkbookDataValidation, WorkbookConditionalFormat, WorkbookFindAndReplace, WorkbookAutoFill } from '../../workbook/actions/index';
import { FindAllArgs, findAllValues, ClearOptions, ConditionalFormatModel, ImageModel, getFormattedCellObject } from './../../workbook/common/index';
import { ConditionalFormatting } from '../actions/conditional-formatting';
import { WorkbookImage, WorkbookChart, updateView, focusChartBorder, ExtendedRange, NumberFormatArgs } from '../../workbook/index';
import { WorkbookProtectSheet, isImported } from '../../workbook/index';
import { contentLoaded, completeAction, freeze, ConditionalFormatEventArgs, refreshOverlayElem, insertDesignChart } from '../common/index';
import { beginAction, sheetsDestroyed, workbookFormulaOperation, getRangeAddress } from './../../workbook/common/index';
import { updateScroll, SelectionMode, clearCopy, clearUndoRedoCollection, clearChartBorder, propertyChange } from '../common/index';
import { Print } from '../renderer/print';
/**
 * Represents the Spreadsheet component.
 *
 * ```html
 * <div id='spreadsheet'></div>
 * <script>
 *  let spreadsheetObj = new Spreadsheet();
 *  spreadsheetObj.appendTo('#spreadsheet');
 * </script>
 * ```
 */
@NotifyPropertyChanges
export class Spreadsheet extends Workbook implements INotifyPropertyChanged {
    /**
     * To specify a CSS class or multiple CSS class separated by a space, add it in the Spreadsheet root element.
     * This allows you to customize the appearance of component.
     *
     * {% codeBlock src='spreadsheet/cssClass/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     */
    @Property('')
    public cssClass: string;

    /**
     * It specifies whether the Spreadsheet should be rendered with scrolling or not.
     * To customize the Spreadsheet scrolling behavior, use the [`scrollSettings`](https://ej2.syncfusion.com/documentation/api/spreadsheet/#scrollSettings) property.
     *
     * @default true
     */
    @Property(true)
    public allowScrolling: boolean;

    /**
     * If `allowResizing` is set to true, spreadsheet columns and rows can be resized.
     *
     * @default true
     */
    @Property(true)
    public allowResizing: boolean;

    /**
     * If `showAggregate` is set to true, spreadsheet will show the AVERAGE, SUM, COUNT, MIN and MAX values based on the selected cells.
     *
     * @default true
     */
    @Property(true)
    public showAggregate: boolean;

    /**
     * It enables or disables the clipboard operations (cut, copy, and paste) of the Spreadsheet.
     *
     * @default true
     */
    @Property(true)
    public enableClipboard: boolean;

    /**
     * It enables or disables the context menu option of spreadsheet. By default, context menu will opens for row header,
     * column header, sheet tabs, and cell.
     *
     * @default true
     */
    @Property(true)
    public enableContextMenu: boolean;

    /**
     * It allows you to interact with cell, sheet tabs, formula bar, and ribbon through the keyboard device.
     *
     * @default true
     */
    @Property(true)
    public enableKeyboardNavigation: boolean;

    /**
     * It enables shortcut keys to perform Spreadsheet operations like open, save, copy, paste, and more.
     *
     * @default true
     */
    @Property(true)
    public enableKeyboardShortcut: boolean;

    /**
     * It allows to enable/disable undo and redo functionalities.
     *
     * @default true
     */
    @Property(true)
    public allowUndoRedo: boolean;

    /**
     * It allows to enable/disable wrap text feature. By using this feature the wrapping applied cell text can wrap to the next line,
     * if the text width exceeds the column width.
     *
     * @default true
     */
    @Property(true)
    public allowWrap: boolean;

    /**
     * Configures the selection settings.
     *
     * The selectionSettings `mode` property has three values and is described below:
     *
     * * None: Disables UI selection.
     * * Single: Allows single selection of cell, row, or column and disables multiple selection.
     * * Multiple: Allows multiple selection of cell, row, or column and disables single selection.
     *
     * {% codeBlock src='spreadsheet/selectionSettings/index.md' %}{% endcodeBlock %}
     *
     * @default { mode: 'Multiple' }
     */
    @Complex<SelectionSettingsModel>({}, SelectionSettings)
    public selectionSettings: SelectionSettingsModel;

    /**
     * Configures the scroll settings.
     *
     * {% codeBlock src='spreadsheet/scrollSettings/index.md' %}{% endcodeBlock %}
     *
     * > The `allowScrolling` property should be `true`.
     *
     * @default { isFinite: false, enableVirtualization: true }
     */
    @Complex<ScrollSettingsModel>({}, ScrollSettings)
    public scrollSettings: ScrollSettingsModel;

    /**
     * Triggers before the cell appended to the DOM.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *      beforeCellRender: (args: CellRenderEventArgs) => {
     *      }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeCellRender
     */
    @Event()
    public beforeCellRender: EmitType<CellRenderEventArgs>;

    /**
     * Triggers before the cell or range of cells being selected.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *      beforeSelect: (args: BeforeSelectEventArgs) => {
     *      }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeSelect
     */
    @Event()
    public beforeSelect: EmitType<BeforeSelectEventArgs>;

    /**
     * Triggers after the cell or range of cells is selected.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *      select: (args: SelectEventArgs) => {
     *      }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event select
     */
    @Event()
    public select: EmitType<SelectEventArgs>;

    /**
     * Triggers before opening the context menu and it allows customizing the menu items.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       contextMenuBeforeOpen: (args: BeforeOpenCloseMenuEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event contextMenuBeforeOpen
     */
    @Event()
    public contextMenuBeforeOpen: EmitType<BeforeOpenCloseMenuEventArgs>;

    /**
     * Triggers before opening the file menu.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       fileMenuBeforeOpen: (args: BeforeOpenCloseMenuEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event fileMenuBeforeOpen
     */
    @Event()
    public fileMenuBeforeOpen: EmitType<BeforeOpenCloseMenuEventArgs>;

    /**
     * Triggers before closing the context menu.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       contextMenuBeforeClose: (args: BeforeOpenCloseMenuEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event contextMenuBeforeClose
     */
    @Event()
    public contextMenuBeforeClose: EmitType<BeforeOpenCloseMenuEventArgs>;

    /**
     * Triggers before opening the dialog box.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       dialogBeforeOpen: (args: DialogBeforeOpenEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event dialogBeforeOpen
     */
    @Event()
    public dialogBeforeOpen: EmitType<DialogBeforeOpenEventArgs>;

    /**
     * Triggers before closing the file menu.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       fileMenuBeforeClose: (args: BeforeOpenCloseMenuEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event fileMenuBeforeClose
     */
    @Event()
    public fileMenuBeforeClose: EmitType<BeforeOpenCloseMenuEventArgs>;

    /**
     * Triggers when the context menu item is selected.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       contextMenuItemSelect: (args: MenuSelectEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event contextMenuItemSelect
     */
    @Event()
    public contextMenuItemSelect: EmitType<MenuSelectEventArgs>;

    /**
     * Triggers when the file menu item is selected.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       fileMenuItemSelect: (args: MenuSelectEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event fileMenuItemSelect
     */
    @Event()
    public fileMenuItemSelect: EmitType<MenuSelectEventArgs>;

    /**
     * Triggers before the data is populated to the worksheet.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeDataBound: (args: Object) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeDataBound
     */
    @Event()
    public beforeDataBound: EmitType<Object>;

    /**
     * Triggers when the data is populated in the worksheet.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       dataBound: (args: Object) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event dataBound
     */
    @Event()
    public dataBound: EmitType<Object>;

    /**
     * Triggers during data changes when the data is provided as `dataSource` in the Spreadsheet.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       dataSourceChanged: (args: DataSourceChangedEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event dataSourceChanged
     */
    @Event()
    public dataSourceChanged: EmitType<DataSourceChangedEventArgs>;

    /**
     * Triggers when the cell is being edited.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       cellEdit: (args: CellEditEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event cellEdit
     */
    @Event()
    public cellEdit: EmitType<CellEditEventArgs>;

    /**
     * Triggers every time a request is made to access cell information.
     * This will be triggered when editing a cell.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       cellEditing: (args: CellEditEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event cellEditing
     */
    @Event()
    public cellEditing: EmitType<CellEditEventArgs>;

    /**
     * Triggers when the cell has been edited.
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       cellEdited: (args: CellEditEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event cellEdited
     */
    @Event()
    public cellEdited: EmitType<CellEditEventArgs>;

    /**
     * Triggers when the edited cell is saved.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       cellSave: (args: CellSaveEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event cellSave
     */
    @Event()
    public cellSave: EmitType<CellSaveEventArgs>;

    /**
     * Triggers when before the cell is saved.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeCellSave: (args: CellEditEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeCellSave
     */
    @Event()
    public beforeCellSave: EmitType<CellEditEventArgs>;

    /**
     * Triggers when the component is created.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       created: () => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event created
     */
    @Event()
    public created: EmitType<Event>;

    /**
     * Triggers before sorting the specified range.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeSort: (args: BeforeSortEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeSort
     */
    @Event()
    public beforeSort: EmitType<BeforeSortEventArgs>;

    /**
     * Triggers before insert a hyperlink.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeHyperlinkCreate: (args: BeforeHyperlinkArgs ) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeHyperlinkCreate
     */
    @Event()
    public beforeHyperlinkCreate: EmitType<BeforeHyperlinkArgs>;

    /**
     * Triggers after the hyperlink inserted.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       afterHyperlinkCreate: (args: afterHyperlinkArgs ) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event afterHyperlinkCreate
     */
    @Event()
    public afterHyperlinkCreate: EmitType<AfterHyperlinkArgs>;

    /**
     * Triggers when the Hyperlink is clicked.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeHyperlinkClick: (args: BeforeHyperlinkArgs ) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event beforeHyperlinkClick
     */
    @Event()
    public beforeHyperlinkClick: EmitType<BeforeHyperlinkArgs>;

    /**
     * Triggers when the Hyperlink function gets completed.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       afterHyperlinkClick: (args: AfterHyperlinkArgs ) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event afterHyperlinkClick
     */
    @Event()
    public afterHyperlinkClick: EmitType<AfterHyperlinkArgs>;

    /**
     * Triggers before apply or remove the conditional format from a cell in a range.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       beforeConditionalFormat: (args: ConditionalFormatEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event cellSave
     */
    @Event()
    public beforeConditionalFormat: EmitType<ConditionalFormatEventArgs>;

    /* eslint-disable */
    /**
     * Triggers when the Spreadsheet actions (such as editing, formatting, sorting etc..) are starts.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       actionBegin: (args: BeforeCellFormatArgs|BeforeOpenEventArgs|BeforeSaveEventArgs|BeforeSelectEventArgs
     *                    |BeforeSortEventArgs|CellEditEventArgs|MenuSelectEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event
     */
    @Event()
    public actionBegin: EmitType<BeforeCellFormatArgs | BeforeOpenEventArgs | BeforeSaveEventArgs | BeforeSelectEventArgs | BeforeSortEventArgs | CellEditEventArgs | MenuSelectEventArgs>;

    /**
     * Triggers when the spreadsheet actions (such as editing, formatting, sorting etc..) gets completed.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       actionComplete: (args: SortEventArgs|CellSaveEventArgs|SaveCompleteEventArgs|Object) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event
     */
    @Event()
    public actionComplete: EmitType<SortEventArgs | CellSaveEventArgs | SaveCompleteEventArgs | Object>;
    /* eslint-enable */
    /**
     * Triggers when the spreadsheet importing gets completed.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       openComplete: (args: Object) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event openComplete
     */
    @Event()
    public openComplete: EmitType<Object>;

    /**
     * Triggers after sorting action is completed.
     *
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * new Spreadsheet({
     *       sortComplete: (args: SortEventArgs) => {
     *       }
     *      ...
     *  }, '#Spreadsheet');
     * ```
     *
     * @event sortComplete
     */
    @Event()
    public sortComplete: EmitType<SortEventArgs>;

    /**
     * Defines the currencyCode format of the Spreadsheet cells
     *
     * @private
     */
    @Property('USD')
    private currencyCode: string;

    /** @hidden */
    public spreadsheetNoteModule: SpreadsheetNote;

    /**
     * Array to store multiple rafIds on intial rendering.
     *
     * @hidden */
    public rafIds: number[] = [];

    /** @hidden */
    public renderModule: Render;

    /** @hidden */
    public scrollModule: Scroll;

    /** @hidden */
    public printModule: Print;

    /** @hidden */
    public workbookNumberFormatModule: WorkbookNumberFormat;

    /** @hidden */
    public workbookFormulaModule: WorkbookFormula;

    /** @hidden */
    public autofillModule: AutoFill;

    /** @hidden */
    public openModule: Open;

    /** @hidden */
    public selectionModule: Selection;

    /** @hidden */
    public sheetModule: IRenderer;

    /** @hidden */
    public createdHandler: Function | object;

    /** @hidden */
    public viewport: IViewport = {
        rowCount: 0, colCount: 0, height: 0, topIndex: 0, leftIndex: 0, width: 0,
        bottomIndex: 0, rightIndex: 0, beforeFreezeHeight: 0, beforeFreezeWidth: 0, scaleX: 1, scaleY: 1
    };

    /** @hidden */
    public enableScaling: boolean;

    protected needsID: boolean = true;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ribbonModule: any;

    /**
     * Constructor for creating the widget.
     *
     * @param  {SpreadsheetModel} options - Configures Spreadsheet options.
     * @param  {string|HTMLElement} element - Element to render Spreadsheet.
     */
    constructor(options?: SpreadsheetModel, element?: string | HTMLElement) {
        super(options);
        Spreadsheet.Inject(
            Ribbon, FormulaBar, SheetTabs, Selection, Edit, KeyboardNavigation, KeyboardShortcut, Clipboard, DataBind, Open, ContextMenu,
            Save, NumberFormat, CellFormat, Formula, WrapText, WorkbookEdit, WorkbookOpen, WorkbookSave, WorkbookCellFormat,
            WorkbookNumberFormat, WorkbookFormula, Sort, WorkbookSort, Resize, UndoRedo, WorkbookFilter, Filter, SpreadsheetHyperlink,
            WorkbookHyperlink, Insert, Delete, WorkbookInsert, WorkbookDelete, DataValidation, WorkbookDataValidation, Print,
            ProtectSheet, WorkbookProtectSheet, FindAndReplace, WorkbookFindAndReplace, Merge, WorkbookMerge, SpreadsheetImage,
            ConditionalFormatting, WorkbookImage, WorkbookConditionalFormat, SpreadsheetChart, WorkbookChart, AutoFill, WorkbookAutoFill,
            SpreadsheetNote
        );
        if (element) {
            this.appendTo(element);
        }
    }

    /**
     * To get cell element.
     *
     * @param {number} rowIndex - specify the rowIndex.
     * @param {number} colIndex - specify the colIndex.
     * @param {HTMLTableElement} row - specify the row.
     * @returns {HTMLElement} - Get cell element
     * @hidden
     */
    public getCell(rowIndex: number, colIndex: number, row?: HTMLTableRowElement): HTMLElement {
        let td: HTMLElement;
        if (this.insideViewport(rowIndex, colIndex)) {
            if (!row) { row = this.getRow(rowIndex, null, colIndex); }
            colIndex = this.getViewportIndex(colIndex, true);
            td = row ? row.cells[colIndex as number] : row;
        }
        return td;
    }
    /**
     * Get cell element.
     *
     * @param {number} index - specify the index.
     * @param {HTMLTableElement} table - specify the table.
     * @param {number} colIdx - specify the column index.
     * @returns {HTMLTableRowElement} - Get cell element
     * @hidden
     */
    public getRow(index: number, table?: HTMLTableElement, colIdx?: number): HTMLTableRowElement {
        if (!table) {
            const sheet: SheetModel = this.getActiveSheet();
            const frozenRow: number = this.frozenRowCount(sheet); const frozenCol: number = this.frozenColCount(sheet);
            if (isNullOrUndefined(colIdx) || index > frozenRow - 1 && colIdx > frozenCol - 1) {
                table = this.getContentTable();
            } else {
                table = index < frozenRow && colIdx < frozenCol ? this.sheetModule.getSelectAllTable() : (index < frozenRow ?
                    this.getColHeaderTable() : this.getRowHeaderTable());
            }
        }
        index = this.getViewportIndex(index);
        return table ? table.rows[index as number] : null;
    }

    /**
     * To get hidden row/column count between two specified index.
     *
     * Set `layout` as `columns` if you want to get column hidden count.
     *
     * @param {number} startIndex - specify the startIndex.
     * @param {number} endIndex - specify the endIndex.
     * @param {string} layout - specify the layout.
     * @param {SheetModel} sheet - specify the sheet.
     * @returns {number} - To get hidden row/column count between two specified index.
     * @hidden
     */
    public hiddenCount(startIndex: number, endIndex: number, layout: string = 'rows', sheet: SheetModel = this.getActiveSheet()): number {
        let count: number = 0; let rowColModel: { hidden?: boolean };
        for (let i: number = startIndex; i <= endIndex; i++) {
            rowColModel = sheet[`${layout}`][i as number];
            if (rowColModel && rowColModel.hidden) { count++; }
        }
        return count;
    }

    /**
     * To get row/column viewport index.
     *
     * @param {number} index - specify the index.
     * @param {boolean} isCol - specify the bool value.
     * @returns {number} - To get row/column viewport index.
     * @hidden
     */
    public getViewportIndex(index: number, isCol?: boolean): number {
        const sheet: SheetModel = this.getActiveSheet();
        const frozenCol: number = this.frozenColCount(sheet); const frozenRow: number = this.frozenRowCount(sheet);
        if (isCol) {
            if (frozenCol) {
                const leftIndex: number = getCellIndexes(sheet.topLeftCell)[1];
                if (index < frozenCol) {
                    index -= this.hiddenCount(leftIndex, index, 'columns');
                    index -= leftIndex;
                    return index + 1;
                } else {
                    index -= this.hiddenCount(this.viewport.leftIndex + frozenCol, index, 'columns');
                    index -= (this.viewport.leftIndex + frozenCol);
                    return index;
                }
            } else {
                index -= this.hiddenCount(this.viewport.leftIndex, index, 'columns');
                index -= this.viewport.leftIndex;
            }
        } else {
            if (frozenRow) {
                const topIndex: number = getCellIndexes(sheet.topLeftCell)[0];
                if (index < frozenRow) {
                    index -= this.hiddenCount(topIndex, index);
                    index -= topIndex;
                    return index + 1;
                } else {
                    index -= this.hiddenCount(this.viewport.topIndex + frozenRow, index);
                    index -= (this.viewport.topIndex + frozenRow);
                    return index;
                }
            } else {
                index -= this.hiddenCount(this.viewport.topIndex, index);
                index -= this.viewport.topIndex;
            }
        }
        return index;
    }

    /**
     * To initialize the services;
     *
     * @returns {void} - To initialize the services.
     * @hidden
     */
    protected preRender(): void {
        super.preRender();
        this.serviceLocator = new ServiceLocator;
        this.initServices();
    }

    private initServices(): void {
        this.serviceLocator.register(locale, new L10n(this.getModuleName(), defaultLocale, this.locale));
        this.serviceLocator.register(dialog, new Dialog(this));
        this.serviceLocator.register(actionEvents, new ActionEvents(this));
        this.serviceLocator.register(overlay, new Overlay(this));
    }

    /**
     * To Initialize the component rendering.
     *
     * @returns {void} - To Initialize the component rendering.
     * @hidden
     */
    protected render(): void {
        super.render();
        this.element.setAttribute('tabindex', '0');
        this.renderModule = new Render(this);
        this.renderSpreadsheet();
        this.wireEvents();
        if (this.created && !this.refreshing) {
            if ((this.created as { observers?: object[] }).observers) {
                if ((this.created as { observers?: object[] }).observers.length > 0) {
                    let observerObject: Object = { observers: (this.created as { observers?: object }).observers };
                    if (this.isAngular) {
                        observerObject = { observers: (this.created as { observers?: object }).observers,
                            currentObservers: (this.created as { observers?: object }).observers };
                        (this.created as { currentObservers?: object[] }).currentObservers = [];
                    }
                    this.createdHandler = observerObject;
                    (this.created as { observers?: object[] }).observers = [];
                }
            } else {
                this.createdHandler = this.created;
                this.setProperties({ created: undefined }, true);
            }
        }
    }

    private renderSpreadsheet(): void {
        if (this.cssClass) {
            addClass([this.element], this.cssClass.split(' '));
        }
        if (this.enableRtl) {
            this.element.classList.add('e-rtl');
        }
        this.setHeight(); this.setWidth();
        createSpinner({ target: this.element }, this.createElement);
        if (this.cssClass && this.cssClass.indexOf('e-mobile-view') === -1 && this.isMobileView()) {
            this.element.classList.add('e-mobile-view');
        }
        if (Browser.isDevice) {
            this.element.classList.add('e-device');
        }
        this.sheetModule = this.serviceLocator.getService<IRenderer>('sheet');
        if (this.allowScrolling) {
            this.scrollModule = new Scroll(this);
        }
        if (this.scrollSettings.enableVirtualization) {
            new VirtualScroll(this);
        }
        this.renderModule.render();
        new ShowHide(this);
    }

    /**
     * By default, Spreadsheet shows the spinner for all its actions. To manually show spinner you this method at your needed time.
     *
     * {% codeBlock src='spreadsheet/showSpinner/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - shows spinner
     */
    public showSpinner(): void {
        showSpinner(this.element);
    }
    /**
     * To hide showed spinner manually.
     *
     * {% codeBlock src='spreadsheet/hideSpinner/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To hide showed spinner manually.
     */
    public hideSpinner(): void {
        hideSpinner(this.element);
    }

    /**
     * To protect the particular sheet.
     *
     * {% codeBlock src='spreadsheet/protectSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number | string} sheet - Specifies the sheet to protect.
     * @param {ProtectSettingsModel} protectSettings - Specifies the protect sheet options.
     * @default { selectCells: 'false', formatCells: 'false', formatRows: 'false', formatColumns:'false', insertLink:'false' }
     * @param {string} password - Specifies the password to protect.
     * @returns {void} - To protect the particular sheet.
     */
    public protectSheet(sheet?: number | string, protectSettings?: ProtectSettingsModel, password?: string): void {
        super.protectSheet(sheet, protectSettings, password);
    }

    /**
     * To unprotect the particular sheet.
     *
     * {% codeBlock src='spreadsheet/unprotectSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number | string} sheet - Specifies the sheet name or index to Unprotect.
     * @returns {void} - To unprotect the particular sheet.
     */
    public unprotectSheet(sheet?: number | string): void {
        super.unprotectSheet(sheet);
    }

    /**
     * To find the specified cell value.
     *
     * {% codeBlock src='spreadsheet/find/index.md' %}{% endcodeBlock %}
     *
     * @param {FindOptions} args - Specifies the replace value with find args to replace specified cell value.
     * @param {string} args.value - Specifies the value to be find.
     * @param {string} args.mode - Specifies the value to be find within sheet or workbook.
     * @param {string} args.searchBy - Specifies the value to be find by row or column.
     * @param {boolean} args.isCSen - Specifies the find match with case sensitive or not.
     * @param {boolean} args.isEMatch - Specifies the find match with entire match or not.
     * @param {string} args.findOpt - Specifies the next or previous find match.
     * @param {number} args.sheetIndex - Specifies the current sheet to find.
     * @default { mode: 'Sheet', searchBy: 'By Row', isCSen: 'false', isEMatch:'false' }
     * @returns {void} - To find the specified cell value.
     */
    public find(args: FindOptions): void | string {
        const activeCell: string = this.getActiveSheet().activeCell;
        super.findHandler(args);
        if (!args.isAction) {
            if (activeCell !== this.getActiveSheet().activeCell) {
                return this.getActiveSheet().name + '!' + this.getActiveSheet().activeCell;
            } else {
                return null;
            }
        }
    }
    /**
     * To replace the specified cell value.
     *
     * {% codeBlock src='spreadsheet/replace/index.md' %}{% endcodeBlock %}
     *
     * @param {FindOptions} args - Specifies the replace value with find args to replace specified cell value.
     * @param {string} args.replaceValue - Specifies the replacing value.
     * @param {string} args.replaceBy - Specifies the value to be replaced for one or all.
     * @param {string} args.value - Specifies the value to be replaced
     * @returns {void} - To replace the specified cell value.
     */
    public replace(args: FindOptions): void {
        if (args.showDialog) {
            this.notify(findDlg, args);
        } else {
            args = {
                value: args.value, mode: args.mode ? args.mode : 'Sheet', isCSen: args.isCSen ? args.isCSen : false,
                isEMatch: args.isEMatch ? args.isEMatch : false, searchBy: args.searchBy ? args.searchBy : 'By Row',
                replaceValue: args.replaceValue, replaceBy: args.replaceBy,
                sheetIndex: isUndefined(args.sheetIndex) ? this.activeSheetIndex : args.sheetIndex, findOpt: args.findOpt ? args.findOpt : ''
            };
            super.replaceHandler(args);
        }
    }
    /**
     * To Find All the Match values Address within Sheet or Workbook.
     *
     * {% codeBlock src='spreadsheet/findAll/index.md' %}{% endcodeBlock %}
     *
     * @param {string} value - Specifies the value to find.
     * @param {string} mode - Specifies the value to be find within Sheet/Workbook.
     * @param {boolean} isCSen - Specifies the find match with case sensitive or not.
     * @param {boolean} isEMatch - Specifies the find match with entire match or not.
     * @param {number} sheetIndex - Specifies the sheetIndex. If not specified, it will consider the active sheet.
     * @returns {string[]} - To Find All the Match values Address within Sheet or Workbook.
     */
    public findAll(value: string, mode?: string, isCSen?: boolean, isEMatch?: boolean, sheetIndex?: number): string[] {
        mode = mode ? mode : 'Sheet'; sheetIndex = sheetIndex < this.sheets.length ? sheetIndex : this.activeSheetIndex;
        isCSen = isCSen ? isCSen : false; isEMatch = isEMatch ? isEMatch : false;
        const findCollection: string[] = [];
        const findAllArguments: FindAllArgs = {
            value: value, mode: mode, sheetIndex: sheetIndex, isCSen: isCSen,
            isEMatch: isEMatch, findCollection: findCollection
        };
        this.notify(findAllValues, findAllArguments);
        return findCollection;
    }
    /**
     * Used to navigate to cell address within workbook.
     *
     * {% codeBlock src='spreadsheet/goTo/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the cell address you need to navigate.
     * You can specify the address in two formats,
     * `{sheet name}!{cell address}` - Switch to specified sheet and navigate to specified cell address.
     * `{cell address}` - Navigate to specified cell address with in the active sheet.
     * @returns {void} - Used to navigate to cell address within workbook.
     */
    public goTo(address: string): void {
        if (!this.allowScrolling) {
            this.selectRange(address);
            return;
        }
        if (address.includes('!')) {
            const idx: number = getSheetIndex(this, getSheetNameFromAddress(address));
            if (idx === undefined) { return; }
            if (idx !== this.activeSheetIndex) {
                const selectRange: string = address.substring(address.lastIndexOf('!') + 1);
                const activeCell: string = selectRange.split(':')[0];
                const sheet: SheetModel = this.sheets[idx as number];
                this.setSheetPropertyOnMute(sheet, 'activeCell', activeCell);
                this.setSheetPropertyOnMute(sheet, 'selectedRange', selectRange);
                const cellIndex: number[] = getCellIndexes(activeCell);
                if (sheet.frozenColumns || sheet.frozenRows) {
                    const topLeftCell: number[] = getCellIndexes(sheet.topLeftCell);
                    if (!((sheet.frozenRows && cellIndex[0] < topLeftCell[0]) || (sheet.frozenColumns && cellIndex[1] < topLeftCell[1]))) {
                        const frozenRow: number = this.frozenRowCount(sheet); const frozenCol: number = this.frozenColCount(sheet);
                        const curCell: number[] = []; const paneCell: number[] = [];
                        const paneTopLeftCell: number[] = getCellIndexes(sheet.paneTopLeftCell);
                        if (frozenRow) {
                            curCell.push(topLeftCell[0]);
                            if (cellIndex[0] >= frozenRow) {
                                paneCell.push(cellIndex[0]);
                            } else {
                                paneCell.push(paneTopLeftCell[0]);
                            }
                        } else {
                            curCell.push(cellIndex[0]); paneCell.push(cellIndex[0]);
                        }
                        if (frozenCol) {
                            curCell.push(topLeftCell[1]);
                            if (cellIndex[1] >= frozenCol) {
                                paneCell.push(cellIndex[1]);
                            } else {
                                paneCell.push(paneTopLeftCell[1]);
                            }
                        } else {
                            curCell.push(cellIndex[1]); paneCell.push(cellIndex[1]);
                        }
                        this.setSheetPropertyOnMute(sheet, 'topLeftCell', getCellAddress(curCell[0], curCell[1]));
                        this.setSheetPropertyOnMute(sheet, 'paneTopLeftCell', getCellAddress(paneCell[0], paneCell[1]));
                    }
                } else {
                    if (cellIndex[0] < this.viewport.rowCount) { cellIndex[0] = 0; }
                    if (cellIndex[1] < this.viewport.colCount) { cellIndex[1] = 0; }
                    this.updateTopLeftCell(cellIndex[0], cellIndex[1], null, sheet);
                }
                this.activeSheetIndex = idx;
                this.dataBind();
                return;
            }
        }
        const indexes: number[] = getRangeIndexes(address); const sheet: SheetModel = this.getActiveSheet();
        const frozenRow: number = this.frozenRowCount(sheet); const frozenCol: number = this.frozenColCount(sheet);
        const insideDomCount: boolean = this.insideViewport(indexes[0], indexes[1]);
        if (insideDomCount) {
            this.selectRange(address);
            let viewportIndexes: number[] = getCellIndexes(sheet.paneTopLeftCell);
            let viewportSize: number = this.viewport.height;
            if (this.allowScrolling) {
                viewportSize -= this.getScrollElement().parentElement.getBoundingClientRect().height;
            }
            let threshold: number = 0; let lastRowIdx: number = 0;
            if (frozenRow) {
                const topLeftIndexes: number[] = getCellIndexes(sheet.topLeftCell);
                for (let i: number = topLeftIndexes[0]; i < frozenRow; i++) {
                    threshold += getRowHeight(sheet, i);
                    if (threshold > viewportSize) { lastRowIdx = i; break; }
                }
            }
            if (lastRowIdx === 0) {
                for (let i: number = viewportIndexes[0]; i <= this.viewport.bottomIndex; i++) {
                    threshold += getRowHeight(sheet, i);
                    if (threshold > viewportSize) {
                        lastRowIdx = i;
                        break;
                    } else if (i === this.viewport.bottomIndex) {
                        lastRowIdx = this.viewport.bottomIndex;
                    }
                }
            }
            viewportIndexes[2] = lastRowIdx; let lastColIdx: number = 0; threshold = 0;
            viewportSize = this.viewport.width - this.sheetModule.getScrollSize();
            if (frozenCol) {
                const topLeftIndexes: number[] = getCellIndexes(sheet.topLeftCell);
                for (let i: number = topLeftIndexes[1]; i < frozenCol; i++) {
                    threshold += getColumnWidth(sheet, i);
                    if (threshold > viewportSize) { lastColIdx = i; break; }
                }
            }
            if (lastColIdx === 0) {
                for (let i: number = viewportIndexes[1]; i <= this.viewport.rightIndex; i++) {
                    threshold += getColumnWidth(sheet, i);
                    if (threshold > viewportSize) {
                        lastColIdx = i;
                        break;
                    } else if (i === this.viewport.rightIndex) {
                        lastColIdx = this.viewport.rightIndex;
                    }
                }
            }
            viewportIndexes[3] = lastColIdx;
            if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                indexes[1] < viewportIndexes[3]) { return; }
            if (frozenRow || frozenCol) {
                viewportIndexes = [].concat(getCellIndexes(sheet.topLeftCell), [frozenRow, viewportIndexes[3]]);
                if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                    indexes[1] < viewportIndexes[3]) { return; }
                viewportIndexes[2] = lastRowIdx; viewportIndexes[3] = frozenCol;
                if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                    indexes[1] < viewportIndexes[3]) { return; }
            }
        }
        let content: Element = this.getMainContent().parentElement;
        let vTrack: HTMLElement; let cVTrack: HTMLElement;
        let offset: number; let vWidth: number; let vHeight: number; let scrollableSize: number;
        if (indexes[0] === frozenRow) {
            offset = 0;
        } else {
            offset = getRowsHeight(sheet, frozenRow, indexes[0] - 1, true);
            if (this.scrollSettings.enableVirtualization) {
                scrollableSize = offset + this.getContentTable().getBoundingClientRect().height;
                vHeight = parseFloat((content.querySelector('.e-virtualtrack') as HTMLElement).style.height);
                if (scrollableSize > vHeight) {
                    scrollableSize += 10;
                    vTrack = content.querySelector('.e-virtualtrack') as HTMLElement;
                    vTrack.style.height = `${scrollableSize}px`;
                    getUpdateUsingRaf((): void => { vTrack.style.height = `${vHeight}px`; });
                }
            }
        }
        content.scrollTop = offset;
        content = this.element.getElementsByClassName('e-scroller')[0];
        if (indexes[1] === frozenCol) {
            offset = 0;
        } else {
            offset = getColumnsWidth(sheet, frozenCol, indexes[1] - 1, true);
            if (this.scrollSettings.enableVirtualization) {
                scrollableSize = offset + this.getContentTable().getBoundingClientRect().width;
                vWidth = parseFloat((content.querySelector('.e-virtualtrack') as HTMLElement).style.width);
                if (scrollableSize > vWidth) {
                    scrollableSize += 10;
                    vTrack = content.querySelector('.e-virtualtrack') as HTMLElement;
                    vTrack.style.width = `${scrollableSize}px`;
                    cVTrack = this.getColumnHeaderContent().querySelector('.e-virtualtrack') as HTMLElement;
                    cVTrack.style.width = `${scrollableSize}px`;
                    vTrack = this.getMainContent().querySelector('.e-virtualtrack') as HTMLElement;
                    vTrack.style.width = `${scrollableSize}px`;
                    getUpdateUsingRaf((): void => {
                        vTrack.style.width = `${vWidth}px`; cVTrack.style.width = `${vWidth}px`;
                    });
                }
            }
        }
        content.scrollLeft = offset;
        if (!insideDomCount) {
            this.selectRange(address);
        }
    }

    /**
     * @hidden
     * @param {number} rowIndex - Specifies the row index.
     * @param {number} colIndex - Specifies the column index.
     * @returns {boolean} - Specifies the boolean value.
     */
    public insideViewport(rowIndex: number, colIndex: number): boolean {
        const sheet: SheetModel = this.getActiveSheet();
        if (sheet.frozenRows || sheet.frozenColumns) {
            const frozenRow: number = this.frozenRowCount(sheet); const frozenCol: number = this.frozenColCount(sheet);
            const indexes: number[] = getCellIndexes(sheet.topLeftCell);
            return ((rowIndex >= indexes[0] && rowIndex < frozenRow) || (rowIndex >= this.viewport.topIndex + frozenRow && rowIndex <=
                this.viewport.bottomIndex)) && ((colIndex >= indexes[1] && colIndex < frozenCol) || (colIndex >= this.viewport.leftIndex +
                frozenCol && colIndex <= this.viewport.rightIndex));
        } else {
            return rowIndex >= this.viewport.topIndex && rowIndex <= this.viewport.bottomIndex && colIndex >= this.viewport.leftIndex &&
            colIndex <= this.viewport.rightIndex;
        }
    }

    /**
     * Used to resize the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/resize/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Used to resize the Spreadsheet.
     */
    public resize(): void {
        this.renderModule.setSheetPanelSize();
        if (this.scrollSettings.enableVirtualization) {
            this.renderModule.refreshSheet(false, true);
        }
    }
    /**
     * To cut the specified cell or cells properties such as value, format, style etc...
     *
     * {% codeBlock src='spreadsheet/cut/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address to cut.
     * @returns {Promise<Object>} - To cut the specified cell or cells properties such as value, format, style etc...
     */
    public cut(address?: string): Promise<Object> {
        const promise: Promise<Object> =
            new Promise((resolve: Function) => { resolve((() => { /** */ })()); });
        this.notify(cut, address ? {
            range: getIndexesFromAddress(address),
            sId: this.sheets[getSheetIndex(this as Workbook, getSheetNameFromAddress(address))] ?
                this.sheets[getSheetIndex(this as Workbook, getSheetNameFromAddress(address))].id : this.getActiveSheet().id,
            promise: promise, invokeCopy: true, isPublic: true
        } : { promise: promise, invokeCopy: true, isPublic: true });
        return promise;
    }

    /**
     * To copy the specified cell or cells properties such as value, format, style etc...
     *
     * {% codeBlock src='spreadsheet/copy/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address.
     * @returns {Promise<Object>} - To copy the specified cell or cells properties such as value, format, style etc...
     */
    public copy(address?: string): Promise<Object> {
        const promise: Promise<Object> =
            new Promise((resolve: Function) => { resolve((() => { /** */ })()); });
        this.notify(copy, address ? {
            range: getIndexesFromAddress(address),
            sId: this.sheets[getSheetIndex(this as Workbook, getSheetNameFromAddress(address))] ?
                this.sheets[getSheetIndex(this as Workbook, getSheetNameFromAddress(address))].id : this.getActiveSheet().id,
            promise: promise, invokeCopy: true, isPublic: true
        } : { promise: promise, invokeCopy: true, isPublic: true });
        return promise;
    }

    /**
     * This method is used to paste the cut or copied cells in to specified address.
     *
     * {% codeBlock src='spreadsheet/paste/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the cell or range address.
     * @param {PasteSpecialType} type - Specifies the type of paste.
     * @returns {void} - used to paste the cut or copied cells in to specified address.
     */
    public paste(address?: string, type?: PasteSpecialType): void {
        this.notify(paste, {
            range: address ? getIndexesFromAddress(address) : address,
            sIdx: address ? getSheetIndex(this as Workbook, getSheetNameFromAddress(address)) : address,
            type: type, isAction: true, isInternal: true
        });
    }

    /**
     * To update the action which need to perform.
     *
     * {% codeBlock src='spreadsheet/updateAction/index.md' %}{% endcodeBlock %}
     *
     * @param {string} options - It describes an action and event args to perform.
     * @param {string} options.action - specifies an action.
     * @param {string} options.eventArgs - specifies an args to perform an action.
     * @returns {void} - To update the action which need to perform.
     */
    public updateAction(options: CollaborativeEditArgs): void {
        updateAction(options, this);
    }

    private setHeight(): void {
        if (this.height) {
            if (this.height.toString().indexOf('%') > -1) { this.element.style.minHeight = '400px'; }
            this.element.style.height = formatUnit(this.height);
        }
    }

    private setWidth(): void {
        if (this.width) {
            if (this.width.toString().indexOf('%') > -1 || this.width === 'auto') { this.element.style.minWidth = '300px'; }
            this.element.style.width = formatUnit(this.width);
        }
    }

    /**
     * Set the width of column.
     *
     * {% codeBlock src='spreadsheet/setColWidth/index.md' %}{% endcodeBlock %}
     *
     * @param {number} width - To specify the width
     * @param {number} colIndex - To specify the colIndex
     * @param {number} sheetIndex - To specify the sheetIndex
     * @returns {void} - Set the width of column.
     */
    public setColWidth(width: number | string = 64, colIndex: number = 0, sheetIndex?: number): void {
        const sheet: SheetModel = isNullOrUndefined(sheetIndex) ? this.getActiveSheet() : this.sheets[sheetIndex as number];
        if (sheet && (!sheet.isProtected || sheet.protectSettings.formatColumns)) {
            const mIndex: number = colIndex;
            const colWidth: string = (typeof width === 'number') ? width + 'px' : width;
            colIndex = isNullOrUndefined(colIndex) ? getCellIndexes(sheet.activeCell)[1] : colIndex;
            const setColModel: Function = (): void => {
                getColumn(sheet, mIndex).width = parseInt(colWidth, 10) > 0 ? parseInt(colWidth, 10) : 0;
                sheet.columns[mIndex as number].customWidth = true;
            };
            const frozenCol: number = this.frozenColCount(sheet);
            if (sheet.id === this.getActiveSheet().id) {
                if ((colIndex >= this.viewport.leftIndex + frozenCol && colIndex <= this.viewport.rightIndex) ||
                    (frozenCol && colIndex < frozenCol)) {
                    colIndex = this.getViewportIndex(colIndex, true);
                    const eleWidth: number = getColumnWidth(sheet, mIndex, null, true);
                    let threshold: number = getDPRValue(parseInt(colWidth, 10)) - eleWidth;
                    if (threshold < 0 && eleWidth < -(threshold)) {
                        threshold = -eleWidth;
                    }
                    setColModel();
                    this.notify(colWidthChanged, { threshold, colIdx: mIndex, checkWrapCell: true });
                    setResize(mIndex, colIndex, colWidth, true, this);
                } else {
                    const oldWidth: number = getColumnWidth(sheet, colIndex);
                    let threshold: number;
                    if (parseInt(colWidth, 10) > 0) {
                        threshold = -(oldWidth - parseInt(colWidth, 10));
                    } else {
                        threshold = -oldWidth;
                    }
                    setColModel();
                    this.notify(colWidthChanged, { threshold, colIdx: colIndex });
                }
                this.notify(positionAutoFillElement, null);
            } else {
                setColModel();
            }
        }
    }

    /**
     * Set the height of row.
     *
     * {% codeBlock src='spreadsheet/setRowHeight/index.md' %}{% endcodeBlock %}
     *
     * @param {number} height - Specifies height needs to be updated. If not specified, it will set the default height 20.
     * @param {number} rowIndex - Specifies the row index. If not specified, it will consider the first row.
     * @param {number} sheetIndex - Specifies the sheetIndex. If not specified, it will consider the active sheet.
     * @param {boolean} edited - Specifies the boolean value.
     * @param {boolean} skipCustomRow - When this parameter is enabled, the method will skip updating the row height if it has already been modified and its 'customHeight' property is set to true.
     * @returns {void} - Set the height of row.
     */
    public setRowHeight(height: number | string = 20, rowIndex: number = 0, sheetIndex?: number,
                        edited?: boolean, skipCustomRow?: boolean): void {
        const sheet: SheetModel = isNullOrUndefined(sheetIndex) ? this.getActiveSheet() : this.sheets[sheetIndex as number];
        if (sheet) {
            const mIndex: number = rowIndex;
            rowIndex = isNullOrUndefined(rowIndex) ? getCellIndexes(sheet.activeCell)[0] : rowIndex;
            if (skipCustomRow && sheet.rows[rowIndex as number] && sheet.rows[rowIndex as number].customHeight) {
                return;
            }
            const rowHeight: string = (typeof height === 'number') ? height + 'px' : height;
            const setRowModel: Function = (): void => {
                setRowHeight(sheet, mIndex, parseInt(rowHeight, 10) > 0 ? parseInt(rowHeight, 10) : 0);
                sheet.rows[mIndex as number].customHeight = true;
            };
            if (sheet.id === this.getActiveSheet().id) {
                const frozenRow: number = this.frozenRowCount(sheet);
                if ((rowIndex >= this.viewport.topIndex + frozenRow && rowIndex <= this.viewport.bottomIndex) ||
                    (frozenRow && rowIndex < frozenRow)) {
                    rowIndex = this.getViewportIndex(mIndex);
                    const eleHeight: number = getRowHeight(sheet, mIndex, true);
                    let threshold: number = getDPRValue(parseInt(rowHeight, 10)) - eleHeight;
                    if (threshold < 0 && eleHeight < -(threshold)) {
                        threshold = -eleHeight;
                    }
                    setRowModel();
                    this.notify(rowHeightChanged, { threshold: threshold, rowIdx: mIndex, isCustomHgt: true });
                    if (isNullOrUndefined(edited)) {
                        edited = false;
                    }
                    if (!edited) {
                        setResize(mIndex, rowIndex, rowHeight, false, this);
                        edited = false;
                    }
                } else {
                    const oldHeight: number = getRowHeight(sheet, rowIndex);
                    let threshold: number;
                    if (parseInt(rowHeight, 10) > 0) {
                        threshold = -(oldHeight - parseInt(rowHeight, 10));
                    } else {
                        threshold = -oldHeight;
                    }
                    setRowModel();
                    this.notify(rowHeightChanged, { threshold: threshold, rowIdx: mIndex });
                }
                this.notify(positionAutoFillElement, null);
            } else {
                setRowModel();
            }
        }
    }

    /**
     * Allows you to set the height to the single or multiple rows.
     *
     * @param {number} height - Specifies the height for row.
     * @param {string[]} ranges - Specifies the row range to set the height. If the sheet name is not specified then height will apply to
     * the rows in the active sheet. Possible values are
     * * Single row range: ['2'] or ['2:2']
     * * Multiple rows range: ['1:100']
     * * Multiple rows with discontinuous range - ['1:10', '15:25', '30:40']
     * * Multiple rows with different sheets - ['Sheet1!1:50', 'Sheet2!1:50', 'Sheet3!1:50'].
     * @param {boolean} skipCustomRows - When this parameter is enabled, it will skip updating the heights of rows where the height has already been modified, and its 'customHeight' property is set to true.
     * @returns {void}
     */
    public setRowsHeight(height: number = 20, ranges?: string[], skipCustomRows?: boolean): void {
        if (!ranges) {
            ranges = [`${1}:${this.getActiveSheet().usedRange.rowIndex + 1}`];
        }
        this.setSize(height, ranges, (idx: string) => Number(idx) - 1, this.setRowHeight.bind(this), skipCustomRows);
    }

    /**
     * Allows you to set the width to the single or multiple columns.
     *
     * @param {number} width - Specifies the width for column.
     * @param {string[]} ranges - Specifies the column range to set the width. If the sheet name is not specified then width will apply to
     * the column in the active sheet. Possible values are
     * * Single column range: ['F'] or ['F:F']
     * * Multiple columns range: ['A:F']
     * * Multiple columns with discontinuous range - ['A:C', 'G:I', 'K:M']
     * * Multiple columns with different sheets - ['Sheet1!A:H', 'Sheet2!A:H', 'Sheet3!A:H'].
     * @returns {void}
     */
    public setColumnsWidth(width: number = 64, ranges?: string[]): void {
        if (!ranges) {
            ranges = [`A:${getColumnHeaderText(this.getActiveSheet().usedRange.colIndex + 1)}`];
        }
        this.setSize(width, ranges, (headerText: string) => getColIndex(headerText), this.setColWidth.bind(this));
    }

    private setSize(width: number, ranges: string[], getIndex: Function, updateSize: Function, skipCustomRows?: boolean): void {
        let sheetIdx: number; let rangeArr: string[]; let sheetName: string; let startIdx: number; let endIdx: number;
        ranges.forEach((range: string): void => {
            if (range.includes('!')) {
                sheetName = range.substring(0, range.lastIndexOf('!'));
                sheetIdx = getSheetIndex(this, sheetName);
                range = range.substring(range.lastIndexOf('!') + 1);
            } else {
                sheetIdx = this.activeSheetIndex;
            }
            if (range.includes(':')) {
                rangeArr = range.split(':');
                startIdx = getIndex(rangeArr[0]);
                endIdx = getIndex(rangeArr[1]);
            } else {
                startIdx = endIdx = getIndex(range);
            }
            for (let idx: number = startIdx; idx <= endIdx; idx++) {
                updateSize(width, idx, sheetIdx, false, skipCustomRows);
            }
        });
    }

    /**
     * This method is used to autofit the range of rows or columns
     *
     * {% codeBlock src='spreadsheet/autoFit/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range of rows or columns that needs to be autofit.
     *
     * @returns {void} - used to autofit the range of rows or columns
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * let spreadsheet = new Spreadsheet({
     *      allowResizing: true
     * ...
     * }, '#Spreadsheet');
     * spreadsheet.autoFit('A:D'); // Auto fit from A to D columns
     * Spreadsheet.autoFit('1:4'); // Auto fit from 1 to 4 rows
     *
     * ```
     */
    public autoFit(range: string): void {
        let sheetIdx: number;
        if (range.indexOf('!') !== -1) {
            sheetIdx = getSheetIndex(this, range.substring(0, range.lastIndexOf('!')));
            range = range.substring(range.lastIndexOf('!') + 1);
        }
        const values: { startIdx: number, endIdx: number, isCol: boolean } = this.getIndexes(range);
        let startIdx: number = values.startIdx;
        let endIdx: number = values.endIdx;
        const isCol: boolean = values.isCol;
        const maximumColInx: number = isCol ? getColIndex('XFD') : 1048576;
        if (startIdx <= maximumColInx) {
            if (endIdx > maximumColInx) {
                endIdx = maximumColInx;
            }
        } else {
            return;
        }
        for (startIdx; startIdx <= endIdx; startIdx++) {
            this.notify(setAutoFit, { idx: startIdx, isCol, sheetIdx: sheetIdx });
        }
    }

    /**
     * @hidden
     * @param {string} range - specify the range.
     * @returns {number | boolean} - to get the index.
     *
     */
    public getIndexes(range: string): { startIdx: number, endIdx: number, isCol: boolean } {
        let startIsCol: boolean;
        let endIsCol: boolean;
        let start: string;
        let end: string;
        if (range.indexOf(':') !== -1) {
            const starttoend: string[] = range.split(':');
            start = starttoend[0];
            end = starttoend[1];
        } else {
            start = range;
            end = range;
        }
        if (!isNullOrUndefined(start)) {
            const startValues: { address: string, isCol: boolean } = this.getAddress(start);
            start = startValues.address;
            startIsCol = startValues.isCol;
        }
        if (!isNullOrUndefined(end)) {
            const endValues: { address: string, isCol: boolean } = this.getAddress(end);
            end = endValues.address;
            endIsCol = endValues.isCol;
        }
        const isCol: boolean = startIsCol === true && endIsCol === true ? true : false;
        const startIdx: number = isCol ? getColIndex(start.toUpperCase()) : parseInt(start, 10);
        const endIdx: number = isCol ? getColIndex(end.toUpperCase()) : parseInt(end, 10);
        return { startIdx: startIdx, endIdx: endIdx, isCol: isCol };
    }

    private getAddress(address: string): { address: string, isCol: boolean } {
        let isCol: boolean;
        if (address.substring(0, 1).match(/\D/g)) {
            isCol = true;
            address = address.replace(/[0-9]/g, '');
            return { address: address, isCol: isCol };
        } else if (address.substring(0, 1).match(/[0-9]/g) && address.match(/\D/g)) {
            return { address: '', isCol: false };
        } else {
            address = (parseInt(address, 10) - 1).toString();
            return { address: address, isCol: isCol };
        }
    }

    /**
     * To add the hyperlink in the cell
     *
     * {% codeBlock src='spreadsheet/addHyperlink/index.md' %}{% endcodeBlock %}
     *
     * @param {string | HyperlinkModel} hyperlink - to specify the hyperlink
     * @param {string} address - to specify the address
     * @param {string} displayText - to specify the text to be displayed, by default value of the cell will be displayed.
     * @returns {void} - To add the hyperlink in the cell
     */
    public addHyperlink(hyperlink: string | HyperlinkModel, address: string, displayText?: string): void {
        this.insertHyperlink(hyperlink, address, displayText, true);
    }

    /**
     * To remove the hyperlink in the cell
     *
     * {% codeBlock src='spreadsheet/removeHyperlink/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - To specify the range
     * @returns {void} - To remove the hyperlink in the cell
     */
    public removeHyperlink(range: string): void {
        this.notify(removeHyperlink, { range: range, preventEventTrigger: true });
    }

    /**
     * @hidden
     * @param {string | HyperlinkModel} hyperlink - specify the hyperlink
     * @param {string} address - To specify the address
     * @param {string} displayText - To specify the displayText
     * @param {boolean} isMethod - To specify the bool value
     * @returns {void} - to insert the hyperlink
     */
    public insertHyperlink(hyperlink: string | HyperlinkModel, address: string, displayText: string, isMethod: boolean): void {
        if (this.allowHyperlink) {
            let sheetName: string;
            let sheetIdx: number;
            let cellIdx: number[];
            let sheet: SheetModel = this.getActiveSheet();
            address = address ? address : sheet.name + '!' + sheet.activeCell;
            cellIdx = getRangeIndexes(address);
            if (isReadOnlyCells(this, cellIdx)) {
                this.notify(readonlyAlert, null);
                return;
            }
            const prevELem: HTMLElement = this.getCell(cellIdx[0], cellIdx[1]);
            const classList: string[] = [];
            for (let i: number = 0; prevELem && i < prevELem.classList.length; i++) {
                classList.push(prevELem.classList[i as number]);
            }
            const befArgs: BeforeHyperlinkArgs = { hyperlink: hyperlink, address: address, displayText: displayText, cancel: false };
            const aftArgs: AfterHyperlinkArgs = { hyperlink: hyperlink, address: address, displayText: displayText };
            if (!isMethod) {
                this.trigger(beforeHyperlinkCreate, befArgs);
                this.notify(beginAction, { action: 'hyperlink', eventArgs: befArgs });
            }
            if (!befArgs.cancel) {
                hyperlink = befArgs.hyperlink;
                address = befArgs.address;
                const args: { hyperlink: string | HyperlinkModel, cell: string, displayText: string, triggerEvt: boolean } = {
                    hyperlink: hyperlink, cell: address, displayText: displayText, triggerEvt: !isMethod };
                this.notify(setLinkModel, args);
                if (address && address.lastIndexOf('!') !== -1) {
                    const lastIndex: number = address.lastIndexOf('!');
                    sheetName = address.substring(0, lastIndex);
                    const sheets: SheetModel[] = this.sheets;
                    for (let idx: number = 0; idx < sheets.length; idx++) {
                        if (sheets[idx as number].name === sheetName) {
                            sheetIdx = idx;
                        }
                    }
                    sheet = this.sheets[sheetIdx as number];
                    address = address.substring(lastIndex + 1);
                }
                if (!sheet) {
                    return;
                }
                address = address ? address : this.getActiveSheet().activeCell;
                cellIdx = getRangeIndexes(address);
                if (!isMethod) {
                    this.trigger(afterHyperlinkCreate, aftArgs);
                    this.notify(completeAction, { action: 'hyperlink', eventArgs: befArgs });
                }
                if (sheet === this.getActiveSheet()) {
                    this.serviceLocator.getService<ICellRenderer>('cell').refreshRange(
                        cellIdx, false, false, false, true, isImported(this));
                    for (let i: number = 0; i < classList.length; i++) {
                        if (!this.getCell(cellIdx[0], cellIdx[1]).classList.contains(classList[i as number])) {
                            this.getCell(cellIdx[0], cellIdx[1]).classList.add(classList[i as number]);
                        }
                    }
                    this.notify(refreshRibbonIcons, null);
                }
            }
        }
    }

    /**
     * This method is used to add data validation.
     *
     * {% codeBlock src='spreadsheet/addDataValidation/index.md' %}{% endcodeBlock %}
     *
     * @param {ValidationModel} rules - specifies the validation rules like type, operator, value1, value2, ignoreBlank, inCellDropDown, isHighlighted arguments.
     * @param {string} range - range that needs to be add validation.
     * @returns {void} - used to add data validation.
     */
    public addDataValidation(rules: ValidationModel, range?: string): void {
        super.addDataValidation(rules, range);
    }

    /**
     * This method is used for remove validation.
     *
     * {% codeBlock src='spreadsheet/removeDataValidation/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove validation.
     * @returns {void} - This method is used for remove validation.
     */
    public removeDataValidation(range?: string): void {
        super.removeDataValidation(range);
    }

    /**
     * This method is used to highlight the invalid data.
     *
     * {% codeBlock src='spreadsheet/addInvalidHighlight/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be highlight the invalid data.
     * @returns {void} - This method is used to highlight the invalid data.
     */
    public addInvalidHighlight(range?: string): void {
        super.addInvalidHighlight(range);
    }

    /**
     * This method is used for remove highlight from invalid data.
     *
     * {% codeBlock src='spreadsheet/removeInvalidHighlight/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove invalid highlight.
     * @returns {void} - This method is used for remove highlight from invalid data.
     */
    public removeInvalidHighlight(range?: string): void {
        super.removeInvalidHighlight(range);
    }

    /**
     * This method is used to add conditional formatting.
     *
     * {% codeBlock src='spreadsheet/conditionalFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {ConditionalFormatModel} conditionalFormat - Specify the conditionalFormat.
     * @returns {void} - used to add conditional formatting.
     */
    public conditionalFormat(conditionalFormat: ConditionalFormatModel): void {
        super.conditionalFormat(conditionalFormat);
    }

    /**
     * This method is used for remove conditional formatting.
     *
     * {% codeBlock src='spreadsheet/clearConditionalFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove conditional formatting.
     * @returns {void} - used for remove conditional formatting.
     */
    public clearConditionalFormat(range?: string): void {
        range = range || this.getActiveSheet().selectedRange;
        super.clearConditionalFormat(range);
    }

    /**
     * @hidden
     * @returns {void} - set Panel Size.
     */
    public setPanelSize(): void {
        if (this.height !== 'auto') {
            const panel: HTMLElement = document.getElementById(this.element.id + '_sheet_panel');
            panel.style.height = `${(this.element.getBoundingClientRect().height * this.viewport.scaleY) -
                getSiblingsHeight(panel, null, this.viewport.scaleY)}px`;
        }
    }

    /**
     * Opens the Excel file.
     *
     * {% codeBlock src='spreadsheet/open/index.md' %}{% endcodeBlock %}
     *
     * @param {OpenOptions} options - Options for opening the excel file.
     * @returns {void} - Open the Excel file.
     */
    public open(options: OpenOptions): void {
        this.isOpen = true;
        super.open(options);
        if (this.isOpen) {
            this.showSpinner();
        }
    }

    /**
     * Used to hide/show the rows in spreadsheet.
     *
     * @param {number} startIndex - Specifies the start row index.
     * @param {number} endIndex - Specifies the end row index.
     * @param {boolean} hide - To hide/show the rows in specified range.
     * @returns {void} - To hide/show the rows in spreadsheet.
     */
    public hideRow(startIndex: number, endIndex: number = startIndex, hide: boolean = true): void {
        if (this.renderModule) {
            this.notify(hideShow, <HideShowEventArgs>{ startIndex: startIndex, endIndex: endIndex, hide: hide, actionUpdate: false });
        } else {
            super.hideRow(startIndex, endIndex, hide);
        }
    }

    /**
     * Used to hide/show the columns in spreadsheet.
     *
     * @param {number} startIndex - Specifies the start column index.
     * @param {number} endIndex - Specifies the end column index.
     * @param {boolean} hide - Set `true` / `false` to hide / show the columns.
     * @returns {void} - To hide/show the columns in spreadsheet.
     */
    public hideColumn(startIndex: number, endIndex: number = startIndex, hide: boolean = true): void {
        if (this.renderModule) {
            this.notify(
                hideShow, <HideShowEventArgs>{ startIndex: startIndex, endIndex: endIndex, hide: hide, isCol: true, actionUpdate: false });
        } else {
            super.hideColumn(startIndex, endIndex, hide);
        }
    }

    /**
     * This method is used to Clear contents, formats and hyperlinks in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/clear/index.md' %}{% endcodeBlock %}
     *
     * @param {ClearOptions} options - Options for clearing the content, formats and hyperlinks in spreadsheet.
     * @returns {void} -  Used to Clear contents, formats and hyperlinks in spreadsheet
     */
    public clear(options: ClearOptions): void {
        this.notify(clearViewer, { options: options });
    }
    /**
     * Used to refresh the spreadsheet in UI level.
     *
     * {% codeBlock src='spreadsheet/refresh/index.md' %}{% endcodeBlock %}
     *
     * @param {boolean} isNew - Specifies `true` / `false` to create new workbook in spreadsheet.
     * @returns {void} -  Used to refresh the spreadsheet.
     */
    public refresh(isNew?: boolean): void {
        if (this.isReact) {
            this['clearTemplate']();
        }
        if (isNew) {
            this.notify(clearCopy, null);
            this.notify(workbookFormulaOperation, { action: 'unRegisterSheet', isNewWorkBook: true });
            this.sheets.length = 0;
            this.sheetNameCount = 1;
            this.notify(sheetsDestroyed, {});
            this.notify(clearUndoRedoCollection, null);
            this.createSheet();
            this.activeSheetIndex = this.sheets.length - 1;
            this.notify(refreshSheetTabs, null);
            this.notify(workbookFormulaOperation, { action: 'initSheetInfo' });
            this.renderModule.refreshSheet();
        } else {
            if (this.createdHandler) {
                const refreshFn: Function = (): void => {
                    this.off(spreadsheetCreated, refreshFn);
                    this.refresh();
                };
                this.on(spreadsheetCreated, refreshFn, this);
            } else {
                this.notify(deInitProperties, {});
                super.refresh();
            }
        }
    }

    /**
     * Used to set the image in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertImage/index.md' %}{% endcodeBlock %}
     *
     * @param {ImageModel} images - Specifies the options to insert image in spreadsheet.
     * @param {string} range - Specifies the range in spreadsheet.
     * @returns {void} -  Used to set the image in spreadsheet.
     */
    public insertImage(images: ImageModel[], range?: string): void {
        let i: number;
        for (i = 0; i < images.length; i++) {
            this.notify(createImageElement, {
                options: images[i as number],
                range: range ? range : this.getActiveSheet().selectedRange, isPublic: true
            });
        }
    }

    /**
     * Used to delete the image in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/deleteImage/index.md' %}{% endcodeBlock %}
     *
     * @param {string} id - Specifies the id of the image element to be deleted.
     * @param {string} range - Specifies the range in spreadsheet.
     * @returns {void} - Used to delete the image in spreadsheet.
     */
    public deleteImage(id: string, range?: string): void {
        this.notify(deleteImage, { id: id, range: range ? range : this.getActiveSheet().selectedRange });
    }

    /**
     * Gets the row header div of the Spreadsheet.
     *
     * @returns {Element} - Gets the row header div of the Spreadsheet.
     * @hidden
     */
    public getRowHeaderContent(): HTMLElement {
        return this.sheetModule.getRowHeaderPanel() as HTMLElement;
    }

    /**
     * Gets the column header div of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the column header div of the Spreadsheet.
     * @hidden
     */
    public getColumnHeaderContent(): HTMLElement {
        return this.sheetModule.getColHeaderPanel() as HTMLElement;
    }

    /**
     * Gets the main content div of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the main content div of the Spreadsheet.
     * @hidden
     */
    public getMainContent(): HTMLElement {
        return this.sheetModule.getContentPanel();
    }

    /**
     * Get the select all div of spreadsheet
     *
     * @returns {HTMLElement} - Get the select all div of spreadsheet
     */
    public getSelectAllContent(): HTMLElement {
        return this.sheetModule.getSelectAllContent();
    }

    /**
     * Gets the horizontal scroll element of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the column header div of the Spreadsheet.
     * @hidden
     */
    public getScrollElement(): HTMLElement {
        return this.sheetModule.getScrollElement() as HTMLElement;
    }

    /**
     * Get the main content table element of spreadsheet.
     *
     * @returns {HTMLTableElement} -Get the main content table element of spreadsheet.
     * @hidden
     */
    public getContentTable(): HTMLTableElement {
        return this.sheetModule.getContentTable();
    }

    /**
     * Get the row header table element of spreadsheet.
     *
     * @returns {HTMLTableElement} - Get the row header table element of spreadsheet.
     * @hidden
     */
    public getRowHeaderTable(): HTMLTableElement {
        return this.sheetModule.getRowHeaderTable();
    }

    /**
     * Get the column header table element of spreadsheet.
     *
     * @returns {HTMLTableElement} - Get the column header table element of spreadsheet.
     * @hidden
     */
    public getColHeaderTable(): HTMLTableElement {
        return this.sheetModule.getColHeaderTable();
    }

    /**
     * To get the backup element count for row and column virtualization.
     *
     * @param {'row' | 'col'} layout -  specify the layout.
     * @returns {number} - To get the backup element count for row and column virtualization.
     * @hidden
     */
    public getThreshold(layout: 'row' | 'col'): number {
        const threshold: number = Math.round((this.viewport[layout + 'Count'] + 1) / 2);
        return threshold < 15 ? 15 : threshold;
    }

    /**
     * @hidden
     * @returns {boolean} - Returns the bool value.
     */
    public isMobileView(): boolean {
        return (!isNullOrUndefined(this.cssClass) && (this.cssClass.indexOf('e-mobile-view') > - 1 || Browser.isDevice) && this.cssClass.indexOf('e-desktop-view') === -1)
            && false;
    }

    /**
     * @hidden
     * @param {number} sheetId - Specifies the sheet id.
     * @param {number} rowIndex - specify the row index.
     * @param {number} colIndex - specify the col index.
     * @param {string} formulaCellReference - specify the col index.
     * @param {boolean} refresh - specify the col index.
     * @param {boolean} isUnique - specifies the unique formula.
     * @param {boolean} isSubtotal - specifies the subtotal formula.
     * @returns {string | number} - to get Value Row Col.
     */
    public getValueRowCol(
        sheetId: number, rowIndex: number, colIndex: number, formulaCellReference?: string, refresh?: boolean,
        isUnique?: boolean, isSubtotal?: boolean): string | number {
        return super.getValueRowCol(sheetId, rowIndex, colIndex, formulaCellReference, refresh, isUnique, isSubtotal);
    }

    /**
     * Updates the properties of a specified cell.
     *
     * {% codeBlock src='spreadsheet/updateCell/index.md' %}{% endcodeBlock %}
     *
     * @param {CellModel} cell - The properties to update for the specified cell.
     * @param {string} address - The address of the cell to update. If not provided, the active cell's address will be used.
     * @param {boolean} enableDependentCellUpdate - Specifies whether dependent cells should also be updated. Default value is <c>true</c>.
     * @returns {void} - This method does not return a value.
     */
    public updateCell(cell: CellModel, address?: string, enableDependentCellUpdate?: boolean): void {
        if (isNullOrUndefined(enableDependentCellUpdate)) {
            enableDependentCellUpdate = true;
        }
        this.updateCellInfo(cell, address, enableDependentCellUpdate, undefined, undefined, true);
    }

    /**
     * Updates the properties of a specified cell.
     *
     * @param {CellModel} cell - The properties to update for the specified cell.
     * @param {string} address - The address of the cell to update. If not provided, the active cell's address will be used.
     * @param {boolean} isDependentUpdate - Specifies whether dependent cells should also be updated.
     * @param {UndoRedoEventArgs} cellInformation - It holds the undoRedoCollections.
     * @param {boolean} isRedo - It holds the undo redo information.
     * @param {boolean} isPublic - It holds whether updateCell public method is used.
     * @returns {void} - This method does not return a value.
     *
     * @hidden
     */
    public updateCellInfo(cell: CellModel, address?: string, isDependentUpdate?: boolean, cellInformation?: UndoRedoEventArgs,
                          isRedo?: boolean, isPublic?: boolean): void {
        address = address || this.getActiveSheet().activeCell;
        if (isReadOnlyCells(this, getRangeIndexes(address))) {
            return;
        }
        const isFinite: boolean = this.scrollSettings.isFinite;
        super.updateCellDetails(cell, address, cellInformation, isRedo, isDependentUpdate, isFinite, isPublic);
    }

    /**
     * Used to get a row data from the data source with updated cell value.
     *
     * {% codeBlock src='spreadsheet/getRowData/index.md' %}{% endcodeBlock %}
     *
     * @param {number} index - Specifies the row index.
     * @param {number} sheetIndex - Specifies the sheet index. By default, it consider the active sheet index.
     * @returns {Object[]} - Return row data.
     */
    public getRowData(index?: number, sheetIndex?: number): Object[] {
        return super.getRowData(index, sheetIndex);
    }

    /**
     * Sorts the range of cells in the active sheet.
     *
     * {% codeBlock src='spreadsheet/sort/index.md' %}{% endcodeBlock %}
     *
     * @param {SortOptions} sortOptions - options for sorting.
     * @param {string} range - address of the data range.
     * @returns {Promise<SortEventArgs>} - Sorts the range of cells in the active sheet.
     */
    public sort(sortOptions?: SortOptions, range?: string): Promise<SortEventArgs> {
        if (!this.allowSorting) { return Promise.reject(); }
        let sheetIdx: number; let sheet: SheetModel;
        if (range) {
            sheetIdx = getSheetIndexFromAddress(this, range);
            sheet = getSheet(this, sheetIdx);
        } else {
            sheet = this.getActiveSheet();
            range = sheet.selectedRange;
            sheetIdx = this.activeSheetIndex;
        }
        if (sheet.isProtected) {
            return Promise.reject(new Error('The cell you\'re trying to change is protected. To make change, unprotect the sheet.'));
        }
        const prevSort: SortCollectionModel[] = [];
        if (this.sortCollection) {
            for (let i: number = this.sortCollection.length - 1; i >= 0; i--) {
                if (this.sortCollection[i as number] && this.sortCollection[i as number].sheetIndex === sheetIdx) {
                    prevSort.push(this.sortCollection[i as number]);
                    this.sortCollection.splice(i, 1);
                }
            }
        }
        this.notify(updateSortCollection, { sortOptions: sortOptions });
        return super.sort(sortOptions, range, prevSort).then((args: SortEventArgs) => {
            this.notify(sortComplete, args);
            return Promise.resolve(args);
        });
    }

    /**
     * @hidden
     * @param {number} sheetId - specify the sheet id.
     * @param {string | number} value - Specify the value.
     * @param {number} rowIndex - Specify the row index.
     * @param {number} colIndex - Specify the col index.
     * @param {string} formula - Specify the col index.
     * @param {boolean} isRandomFormula - Specify the random formula.
     * @returns {void} - To set value for row and col.
     */
    public setValueRowCol(sheetId: number, value: string | number, rowIndex: number,
                          colIndex: number, formula?: string, isRandomFormula?: boolean): void {
        if (!this.isEdit && value === '#CIRCULARREF!') {
            const sheet: SheetModel = getSheet(this, getSheetIndexFromId(this, sheetId));
            const circularArgs: { action: string, argValue: string, address: string } = { action: 'isCircularReference', argValue: value,
                address: `${sheet.name}!${getColumnHeaderText(colIndex)}${rowIndex}` };
            this.notify(formulaOperation, circularArgs);
            value = circularArgs.argValue;
        }
        super.setValueRowCol(sheetId, value, rowIndex, colIndex, formula, isRandomFormula);
        const sheetIdx: number = getSheetIndexFromId(this as Workbook, sheetId);
        if (this.activeSheetIndex === sheetIdx) {
            if (this.allowEditing) {
                this.notify(editOperation, { action: 'refreshDependentCellValue', rowIdx: rowIndex, colIdx: colIndex });
            } else {
                rowIndex--; colIndex--;
                const sheet: SheetModel = getSheet(this as Workbook, sheetIdx);
                let td: HTMLElement;
                if (!isHiddenRow(sheet, rowIndex) && !isHiddenCol(sheet, colIndex)) {
                    td = this.getCell(rowIndex, colIndex);
                }
                if (td) {
                    if (td.parentElement) {
                        const curRowIdx: string = td.parentElement.getAttribute('aria-rowindex');
                        if (curRowIdx && Number(curRowIdx) - 1 !== rowIndex) {
                            return;
                        }
                        const curColIdx: string = td.getAttribute('aria-colindex');
                        if (curColIdx && Number(curColIdx) - 1 !== colIndex) {
                            return;
                        }
                    }
                    const cell: CellModel = getCell(rowIndex, colIndex, sheet);
                    const nodeEventArgs: NumberFormatArgs = {
                        value: cell.value, format: cell.format, onLoad: true,
                        formattedText: cell.value, isRightAlign: false, type: 'General', cell: cell,
                        rowIndex: rowIndex, colIndex: colIndex, isRowFill: false
                    };
                    this.notify(getFormattedCellObject, nodeEventArgs);
                    this.refreshNode(td, nodeEventArgs);
                }
            }
        }
    }

    /**
     * Get component name.
     *
     * @returns {string} - Get component name.
     * @hidden
     */
    public getModuleName(): string {
        return 'spreadsheet';
    }

    /**
     * The `calculateNow` method is used to calculate any uncalculated formulas in a spreadsheet.
     * This method accepts an option to specify whether the calculation should be performed for the entire workbook or a specific sheet.
     *
     * @param {string} scope - Specifies the scope of the calculation. Acceptable values are `Sheet` or `Workbook`.
     * If not provided, the default scope is `Sheet`.
     * * `Sheet`: Calculates formulas only on the current sheet or a specified sheet.
     * * `Workbook`: Calculates formulas across the entire workbook.
     * @param {number | string} sheet - The index or name of the sheet to calculate if the scope is set to `Sheet`.
     * If not provided and the scope is `Sheet`, the current active sheet will be used.
     * @returns {Promise<void>} - A promise that resolves when the calculation is complete.
     * The promise does not return a specific value, but it can be used to perform actions after the calculation has finished.
     */
    public calculateNow(scope?: string, sheet?: number | string): Promise<void> {
        return super.calculateNow(scope, sheet);
    }

    /**
     * @hidden
     * @param {Element} td - Specify the element.
     * @param {NumberFormatArgs} args - specify the args.
     * @returns {void} - to refresh the node.
     */
    public refreshNode(td: Element, args?: NumberFormatArgs): void {
        let value: string;
        if (td) {
            if (args) {
                args.result = isNullOrUndefined(args.formattedText) ? (isNullOrUndefined(args.result) ? '' : args.result) :
                    args.formattedText.toString();
                if (!args.isRowFill) {
                    const beforeFillSpan: Element = td.querySelector('.e-fill-before');
                    if (beforeFillSpan) {
                        detach(beforeFillSpan);
                    }
                    const spanFillElem: Element = select('.' + 'e-fill', td);
                    if (spanFillElem) {
                        detach(spanFillElem);
                        (td as HTMLElement).style.display = 'table-cell';
                    }
                    const spanFillSecElem: Element = select('.' + 'e-fill-sec', td);
                    if (spanFillSecElem) {
                        detach(spanFillSecElem);
                    }
                }
                const spanElem: Element = select('#' + this.element.id + '_currency', td);
                if (spanElem) {
                    detach(spanElem);
                }
                if (args.type === 'Accounting' && isNumber(args.value) && args.result.includes(args.curSymbol)) {
                    let curSymbol: string; let result: string; let setVal: boolean;
                    if (args.result.trim().endsWith(args.curSymbol)) {
                        result = args.result;
                    } else {
                        curSymbol = args.result.includes(' ' + args.curSymbol) ? ' ' + args.curSymbol : args.curSymbol;
                        result = args.result.split(curSymbol).join('');
                    }
                    const dataBarVal: HTMLElement = td.querySelector('.e-databar-value');
                    const iconSetSpan: HTMLElement = td.querySelector('.e-iconsetspan');
                    let tdContainer: Element = td;
                    let nodeElement: HTMLElement;
                    if (td.children.length > 0 && td.children[td.childElementCount - 1].className.indexOf('e-addNoteIndicator') > -1) {
                        nodeElement = document.getElementsByClassName('e-addNoteIndicator')[0] as HTMLElement;
                    }
                    if (dataBarVal) {
                        this.refreshNode(dataBarVal, { result: result });
                        tdContainer = td.querySelector('.e-cf-databar') || td;
                    } else if (td.querySelector('a')) {
                        td.querySelector('a').textContent = result;
                    } else {
                        setVal = true;
                        (td as HTMLElement).innerText = '';
                    }
                    if (iconSetSpan) {
                        td.insertBefore(iconSetSpan, td.firstElementChild);
                    }
                    if (curSymbol) {
                        const curr: HTMLElement = this.createElement('span', { id: this.element.id + '_currency', styles: 'float: left' });
                        curr.innerText = curSymbol;
                        tdContainer.appendChild(curr);
                        if (!isNullOrUndefined(nodeElement)) {
                            tdContainer.appendChild(nodeElement);
                        }
                    }
                    if (setVal) {
                        td.innerHTML += result;
                    }
                    td.classList.add('e-right-align');
                    return;
                } else {
                    let alignClass: string;
                    if (args.result && (args.result.toLowerCase() === 'true' || args.result.toLowerCase() === 'false')) {
                        args.result = args.result.toUpperCase();
                        alignClass = 'e-center-align';
                        args.isRightAlign = true; // Re-use this to center align the cell.
                    } else {
                        alignClass = 'e-right-align';
                    }
                    value = args.result;
                    if (!this.allowWrap) {
                        if (value.toString().includes('\n')) {
                            value = value.replace(/\n/g, '');
                        }
                    }
                    if (args.isRightAlign) {
                        td.classList.add(alignClass);
                    } else {
                        td.classList.remove(alignClass);
                    }
                }
            }
            value = !isNullOrUndefined(value) ? value : '';
            if (!isNullOrUndefined(args.rowIndex) && !isNullOrUndefined(args.colIndex)) {
                attributes(td, { 'aria-label': (value ? value + ' ' : '') + getCellAddress(args.rowIndex, args.colIndex)});
            }
            let node: Node = td.lastChild;
            if (node && node.nodeName === 'SPAN' && (node as HTMLElement).classList.contains('e-iconsetspan')) {
                node = null;
            }
            const nodeIndicator: HTMLElement = td.querySelector('.e-addNoteIndicator') as HTMLElement;
            if (nodeIndicator) {
                node = nodeIndicator.previousSibling;
            }
            if (td.querySelector('.e-databar-value')) {
                node = td.querySelector('.e-databar-value').lastChild;
            }
            if (td.querySelector('.e-hyperlink')) {
                if (args.cell && args.cell.wrap && value && value.toString().indexOf('\n')) {
                    td.querySelector('.e-hyperlink').textContent = value;
                }
                node = td.querySelector('.e-hyperlink').lastChild;
            }
            const wrapContent: Element = td.querySelector('.e-wrap-content');
            if (wrapContent && !(td.querySelector('.e-hyperlink') || td.querySelector('.e-databar-value'))) {
                if (!wrapContent.lastChild) {
                    wrapContent.appendChild(document.createTextNode(''));
                }
                node = wrapContent.lastChild;
            }
            if ((this.isAngular || this.isVue) &&
                td.classList.contains('e-cell-template') && node && (node.nodeType === 8 || node.nodeType === 3)) {
                if (node.nodeType === 3 || value !== '') {
                    const checkNodeFn: Function = () => {
                        if (!td.childElementCount) {
                            if (node.nodeType === 3) {
                                if (!args.isRowFill) {
                                    node.nodeValue = value;
                                }
                            } else {
                                td.appendChild(document.createTextNode(value));
                            }
                        }
                    };
                    if (this.isAngular) {
                        getUpdateUsingRaf(checkNodeFn);
                    } else {
                        checkNodeFn();
                    }
                }
            } else if (node && (node.nodeType === 3 || node.nodeType === 1)) {
                if (!args.isRowFill) {
                    if (!isNullOrUndefined((node as HTMLElement).className) &&
                        (node as HTMLElement).className.indexOf('e-addNoteIndicator') > -1) {
                        node = td.lastChild;
                        node.nodeValue = value;
                    } else {
                        node.nodeValue = value;
                    }
                }
            } else {
                td.appendChild(document.createTextNode(value));
            }
        }
    }
    /**
     * @hidden
     * @param {CellStyleModel} style - specify the style.
     * @param {number} lines - Specify the lines.
     * @param {number} borderWidth - Specify the borderWidth.
     * @returns {number} - To calculate Height
     */
    public calculateHeight(style: CellStyleModel, lines: number = 1, borderWidth: number = 1): number {
        const fontSize: string = (style && style.fontSize) || this.cellStyle.fontSize;
        const threshold: number = style.fontFamily === 'Arial Black' ? 1.44 : 1.24;
        return ((fontSize.indexOf('pt') > -1 ? parseInt(fontSize, 10) * 1.33 : parseInt(fontSize, 10)) * threshold * lines) +
            (borderWidth * threshold);
    }

    /**
     * @hidden
     * @param {number} startIdx - specify the start index.
     * @param {number} endIdx - Specify the end index.
     * @param {string} layout - Specify the rows.
     * @param {boolean} finite - Specifies the scroll mode.
     * @returns {number[]} - To skip the hidden rows.
     */
    public skipHidden(startIdx: number, endIdx: number, layout: string = 'rows', finite: boolean = this.scrollSettings.isFinite): number[] {
        const sheet: SheetModel = this.getActiveSheet(); let totalCount: number;
        if (this.scrollSettings.isFinite) { totalCount = (layout === 'rows' ? sheet.rowCount : sheet.colCount) - 1; }
        for (let i: number = startIdx; i <= endIdx; i++) {
            if ((sheet[`${layout}`])[i as number] && (sheet[`${layout}`])[i as number].hidden) {
                if (startIdx === i) { startIdx++; }
                endIdx++;
                if (finite && endIdx > totalCount) { endIdx = totalCount; break; }
            } else if (!finite && this.scrollSettings.isFinite && endIdx > totalCount) {
                if ((sheet[`${layout}`])[i - 1] && (sheet[`${layout}`])[i - 1].hidden) {
                    endIdx--;
                    break;
                }
            }
        }
        return [startIdx, endIdx];
    }

    /**
     * @hidden
     * @param {HTMLElement} nextTab - Specify the element.
     * @param {string} selector - Specify the selector
     * @returns {void} - To update the active border.
     */
    public updateActiveBorder(nextTab: HTMLElement, selector: string = '.e-ribbon'): void {
        const indicator: HTMLElement = select(`${selector} .e-tab-header .e-indicator`, this.element) as HTMLElement;
        indicator.style.display = 'none';
        setStyleAttribute(indicator, { 'left': '', 'right': '' });
        setStyleAttribute(indicator, {
            'left': nextTab.offsetLeft + 'px', 'right':
                nextTab.parentElement.offsetWidth - (nextTab.offsetLeft + nextTab.offsetWidth) + 'px'
        });
        indicator.style.display = '';
    }

    /**
     * To perform the undo operation in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/undo/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To perform the undo operation in spreadsheet.
     */
    public undo(): void {
        this.notify(performUndoRedo, { isUndo: true, isPublic: true });
    }

    /**
     * To perform the redo operation in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/redo/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To perform the redo operation in spreadsheet.
     */
    public redo(): void {
        this.notify(performUndoRedo, { isUndo: false, isPublic: true });
    }

    /**
     * To update the undo redo collection in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/updateUndoRedoCollection/index.md' %}{% endcodeBlock %}
     *
     * @param {object} args - options for undo redo.
     * @returns {void} - To update the undo redo collection in spreadsheet.
     */
    public updateUndoRedoCollection(args: { [key: string]: Object }): void {
        this.notify(updateUndoRedoCollection, { args: args, isPublic: true });
    }

    /**
     * Adds the defined name to the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/addDefinedName/index.md' %}{% endcodeBlock %}
     *
     * @param {DefineNameModel} definedName - Specifies the name, scope, comment, refersTo.
     * @returns {boolean} - Return the added status of the defined name.
     */
    public addDefinedName(definedName: DefineNameModel): boolean {
        const eventArgs: { [key: string]: Object } = {
            action: 'addDefinedName',
            isAdded: false,
            definedName: definedName
        };
        this.notify(formulaOperation, eventArgs);
        return <boolean>eventArgs.isAdded;
    }

    /**
     * Removes the defined name from the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/removeDefinedName/index.md' %}{% endcodeBlock %}
     *
     * @param {string} definedName - Specifies the name.
     * @param {string} scope - Specifies the scope of the defined name.
     * @returns {boolean} - Return the removed status of the defined name.
     */
    public removeDefinedName(definedName: string, scope: string): boolean {
        return super.removeDefinedName(definedName, scope);
    }

    private mouseClickHandler(e: MouseEvent & TouchEvent): void {
        this.notify(click, e);
    }

    private mouseDownHandler(e: MouseEvent): void {
        this.notify(mouseDown, e);
    }

    private keyUpHandler(e: KeyboardEvent): void {
        if (closest(e.target as Element, '.e-find-dlg')) {
            this.notify(findKeyUp, e);
        } else {
            this.notify(keyUp, e);
        }
    }

    private keyDownHandler(e: KeyboardEvent): void {
        const findToolDlg: HTMLElement = closest(e.target as Element, '.e-findtool-dlg') as HTMLElement;
        if (findToolDlg) {
            if (e.keyCode === 9) {
                const target: HTMLElement = e.target as HTMLElement;
                if (e.shiftKey) {
                    if (target.classList.contains('e-text-findNext-short')) {
                        const focusEle: HTMLElement = findToolDlg.querySelector('.e-findRib-close .e-tbar-btn');
                        if (focusEle) {
                            e.preventDefault();
                            focusEle.focus();
                        }
                    }
                } else if (target.classList.contains('e-tbar-btn') && target.parentElement.classList.contains('e-findRib-close')) {
                    focus(findToolDlg);
                }
            }
        } else {
            this.notify(keyDown, e);
            const dialogbox: HTMLElement = closest(e.target as Element, '.e-dialog') as HTMLElement;
            if (!this.enableKeyboardNavigation && (document.activeElement.classList.contains('e-cell') || dialogbox)) {
                if ([38, 40, 33, 34, 35, 36, 9].indexOf(e.keyCode) > -1) {
                    e.preventDefault();
                }
            }
        }
    }

    private freeze(e: { row?: number, column?: number, triggerEvent?: boolean }): void {
        if (!this.allowFreezePane || e.row < 0 || e.column < 0) {
            return;
        }
        if (e.triggerEvent) {
            const args: { row: number, column: number, cancel: boolean, sheetIndex: number } = {
                row: e.row, column: e.column,
                cancel: false, sheetIndex: this.activeSheetIndex
            };
            this.notify(beginAction, { eventArgs: args, action: 'freezePanes' });
            if (args.cancel) {
                return;
            }
        }
        this.on(contentLoaded, this.freezePaneUpdated, this);
        this.freezePanes(e.row, e.column);
        this.notify(refreshRibbonIcons, null);
    }

    private freezePaneUpdated(): void {
        this.off(contentLoaded, this.freezePaneUpdated);
        const sheet: SheetModel = this.getActiveSheet();
        focus(this.element);
        this.notify(completeAction, { eventArgs: { row: sheet.frozenRows, column: sheet.frozenColumns,
            sheetIndex: this.activeSheetIndex }, action: 'freezePanes' });
    }

    /**
     * Binding events to the element while component creation.
     *
     * @returns {void} - Binding events to the element while component creation.
     */
    private wireEvents(): void {
        EventHandler.add(this.element, 'click', this.mouseClickHandler, this);
        EventHandler.add(this.element, getStartEvent(), this.mouseDownHandler, this);
        EventHandler.add(this.element, 'keyup', this.keyUpHandler, this);
        EventHandler.add(this.element, 'keydown', this.keyDownHandler, this);
        this.on(freeze, this.freeze, this);
        this.on(refreshInsertDelete, this.refreshInsertDelete, this);
    }

    /**
     * Destroys the component (detaches/removes all event handlers, attributes, classes, and empties the component element).
     *
     * {% codeBlock src='spreadsheet/destroy/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Destroys the component.
     */
    public destroy(): void {
        if (this.isReact) {
            this['clearTemplate']();
        }
        this.unwireEvents();
        this.notify(spreadsheetDestroyed, null);
        super.destroy();
        this.element.innerHTML = '';
        this.element.removeAttribute('tabindex');
        this.element.removeAttribute('role');
        this.element.style.removeProperty('height');
        this.element.style.removeProperty('width');
        this.element.style.removeProperty('min-height');
        this.element.style.removeProperty('min-width');
        if (this.enableRtl) {
            this.element.classList.remove('e-rtl');
        }
        if (this.sheetModule) { this.sheetModule.destroy(); }
    }

    /**
     * Unbinding events from the element while component destroy.
     *
     * @returns {void} - Unbinding events from the element while component destroy.
     */
    private unwireEvents(): void {
        EventHandler.remove(this.element, 'click', this.mouseClickHandler);
        EventHandler.remove(this.element, getStartEvent(), this.mouseDownHandler);
        EventHandler.remove(this.element, 'keyup', this.keyUpHandler);
        EventHandler.remove(this.element, 'keydown', this.keyDownHandler);
        this.off(freeze, this.freeze);
        this.off(refreshInsertDelete, this.refreshInsertDelete);
    }

    private refreshInsertDelete(args: InsertDeleteEventArgs): void {
        if (args.modelType === 'Sheet') {
            return;
        }
        let updated: boolean; let indexes: number[];
        args.sheet.ranges.forEach((range: RangeModel): void => {
            if (range.template && range.address) {
                indexes = getRangeIndexes(range.address);
                updated = this.updateRangeOnInsertDelete(args, indexes);
                if (updated) { range.address = getRangeAddress(indexes); }
            }
        });
        this.setSheetPropertyOnMute(args.sheet, 'ranges', args.sheet.ranges);
    }

    /**
     * To add context menu items.
     *
     * {% codeBlock src='spreadsheet/addContextMenu/index.md' %}{% endcodeBlock %}
     *
     * @param {MenuItemModel[]} items - Items that needs to be added.
     * @param {string} text - Item before / after that the element to be inserted.
     * @param {boolean} insertAfter - Set `false` if the `items` need to be inserted before the `text`.
     * By default, `items` are added after the `text`.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To add context menu items.
     */
    public addContextMenuItems(items: MenuItemModel[], text: string, insertAfter: boolean = true, isUniqueId?: boolean): void {
        this.notify(addContextMenuItems, { items: items, text: text, insertAfter: insertAfter, isUniqueId: isUniqueId });
    }

    /**
     * To remove existing context menu items.
     *
     * {% codeBlock src='spreadsheet/removeContextMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be removed.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To remove existing context menu items.
     */
    public removeContextMenuItems(items: string[], isUniqueId?: boolean): void {
        this.notify(removeContextMenuItems, { items: items, isUniqueId: isUniqueId });
    }

    /**
     * To enable / disable context menu items.
     *
     * {% codeBlock src='spreadsheet/enableContextMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To enable / disable context menu items.
     */
    public enableContextMenuItems(items: string[], enable: boolean = true, isUniqueId?: boolean): void {
        this.notify(enableContextMenuItems, { items: items, enable: enable, isUniqueId: isUniqueId });
    }

    /**
     * To enable / disable file menu items.
     *
     * {% codeBlock src='spreadsheet/enableFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To enable / disable file menu items.
     */
    public enableFileMenuItems(items: string[], enable: boolean = true, isUniqueId?: boolean): void {
        this.notify(enableFileMenuItems, { items: items, enable: enable, isUniqueId: isUniqueId });
    }

    /**
     * To show/hide the file menu items in Spreadsheet ribbon.
     *
     * {% codeBlock src='spreadsheet/hideFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Specifies the file menu items text which is to be show/hide.
     * @param {boolean} hide - Set `true` / `false` to hide / show the file menu items.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To show/hide the file menu items in Spreadsheet ribbon.
     */
    public hideFileMenuItems(items: string[], hide: boolean = true, isUniqueId?: boolean): void {
        this.notify(hideFileMenuItems, { items: items, hide: hide, isUniqueId: isUniqueId });
    }

    /**
     * To add custom file menu items.
     *
     * {% codeBlock src='spreadsheet/addFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {MenuItemModel[]} items - Specifies the ribbon file menu items to be inserted.
     * @param {string} text - Specifies the existing file menu item text before / after which the new file menu items to be inserted.
     * @param {boolean} insertAfter - Set `false` if the `items` need to be inserted before the `text`.
     * By default, `items` are added after the `text`.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To add custom file menu items.
     */
    public addFileMenuItems(items: MenuItemModel[], text: string, insertAfter: boolean = true, isUniqueId?: boolean): void {
        this.notify(addFileMenuItems, { items: items, text: text, insertAfter: insertAfter, isUniqueId: isUniqueId });
    }

    /**
     * To show/hide the existing ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/hideRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be shown/hidden.
     * @param {boolean} hide - Set `true` / `false` to hide / show the ribbon tabs.
     * @returns {void} - To show/hide the existing ribbon tabs.
     */
    public hideRibbonTabs(tabs: string[], hide: boolean = true): void {
        this.notify(hideRibbonTabs, { tabs: tabs, hide: hide });
    }

    /**
     * To enable / disable the existing ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/enableRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the ribbon tabs.
     * @returns {void} - To enable / disable the existing ribbon tabs.
     */
    public enableRibbonTabs(tabs: string[], enable: boolean = true): void {
        this.notify(enableRibbonTabs, { tabs: tabs, enable: enable });
    }


    /**
     * To add custom ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/addRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {RibbonItemModel[]} items - Specifies the ribbon tab items to be inserted.
     * @param {string} insertBefore - Specifies the existing ribbon header text before which the new tabs will be inserted.
     * If not specified, the new tabs will be inserted at the end.
     * @returns {void} - To add custom ribbon tabs.
     */
    public addRibbonTabs(items: RibbonItemModel[], insertBefore?: string): void {
        this.notify(addRibbonTabs, { items: items, insertBefore: insertBefore });
    }

    /**
     * Enables or disables the specified ribbon toolbar items or all ribbon items.
     *
     * {% codeBlock src='spreadsheet/enableToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the toolbar items need to be enabled / disabled.
     * @param {number[]} items - Specifies the toolbar item indexes / unique id's which needs to be enabled / disabled.
     * If it is not specified the entire toolbar items will be enabled / disabled.
     * @param  {boolean} enable - Boolean value that determines whether the toolbar items should be enabled or disabled.
     * @returns {void} - Enables or disables the specified ribbon toolbar items or all ribbon items.
     */
    public enableToolbarItems(tab: string, items?: number[] | string[], enable?: boolean): void {
        this.notify(enableToolbarItems, [{ tab: tab, items: items, enable: enable === undefined ? true : enable, isPublic: true }]);
    }

    /**
     * To show/hide the existing Spreadsheet ribbon toolbar items.
     *
     * {% codeBlock src='spreadsheet/hideToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items needs to be hidden / shown.
     * @param {number[]} indexes - Specifies the toolbar indexes which needs to be shown/hidden from UI.
     * @param {boolean} hide - Set `true` / `false` to hide / show the toolbar items.
     * @returns {void} - To show/hide the existing Spreadsheet ribbon toolbar items.
     */
    public hideToolbarItems(tab: string, indexes: number[], hide: boolean = true): void {
        this.notify(hideToolbarItems, { tab: tab, indexes: indexes, hide: hide });
    }

    /**
     * To add the custom items in Spreadsheet ribbon toolbar.
     *
     * {% codeBlock src='spreadsheet/addToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items will be inserted.
     * @param {ItemModel[]} items - Specifies the ribbon toolbar items that needs to be inserted.
     * @param {number} index - Specifies the index text before which the new items will be inserted.
     * If not specified, the new items will be inserted at the end of the toolbar.
     * @returns {void} - To add the custom items in Spreadsheet ribbon toolbar.
     */
    public addToolbarItems(tab: string, items: ItemModel[], index?: number): void {
        this.notify(addToolbarItems, { tab: tab, items: items, index: index });
    }

    /**
     * Selects the cell / range of cells with specified address.
     *
     * {% codeBlock src='spreadsheet/selectRange/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address.
     * @returns {void} - To select the range.
     */
    public selectRange(address: string): void {
        if (this.isEdit) {
            this.notify(editOperation, { action: 'endEdit' });
        }
        this.notify(selectRange, { address: address });
    }

    /**
     * Allows you to select a chart from the active sheet. To select a specific chart from the active sheet, pass the chart `id`.
     * If you pass an empty argument, the chart present in the active cell will be selected. If the active cell does not have a chart,
     * the initially rendered chart will be selected from the active sheet.
     *
     * @param {string} id - Specifies the chart `id` to be selected.
     * @returns {void}
     */
    public selectChart(id?: string): void {
        this.selectOverlay(id, true);
    }

    /**
     * Allows you to select an image from the active sheet. To select a specific image from the active sheet, pass the image `id`.
     * If you pass an empty argument, the image present in the active cell will be selected. If the active cell does not have an image,
     * the initially rendered image will be selected from the active sheet.
     *
     * @param {string} id - Specifies the image `id` to be selected.
     * @returns {void}
     */
    public selectImage(id?: string): void {
        this.selectOverlay(id);
    }

    private selectOverlay(id?: string, isChart?: boolean): void {
        const sheet: SheetModel = this.getActiveSheet();
        if (sheet.isProtected || !this.allowEditing) {
            return;
        }
        if (!id) {
            const activeCell: number[] = getCellIndexes(sheet.activeCell);
            const cell: CellModel = getCell(activeCell[0], activeCell[1], sheet, false, true);
            if (isChart) {
                if (cell.chart && cell.chart.length) {
                    id = cell.chart[cell.chart.length - 1].id;
                }
            } else if (cell.image && cell.image.length) {
                id = cell.image[cell.image.length - 1].id;
            }
        }
        let overlayEle: HTMLElement;
        if (id) {
            overlayEle = this.element.querySelector(`#${id}`);
            if (!overlayEle.classList.contains('e-ss-overlay')) {
                overlayEle = overlayEle.parentElement;
            }
        } else {
            overlayEle = this.element.querySelector(
                `.e-ss-overlay${isChart ? '.e-datavisualization-chart' : ':not(.e-datavisualization-chart)'}`);
        }
        if (overlayEle) {
            let isChartActive: boolean;
            const activeOverlay: Element = this.element.getElementsByClassName('e-ss-overlay-active')[0];
            if (activeOverlay) {
                activeOverlay.classList.remove('e-ss-overlay-active');
                isChartActive = activeOverlay.classList.contains('e-datavisualization-chart');
                if (isChartActive) {
                    this.notify(clearChartBorder, null);
                }
            }
            overlayEle.classList.add('e-ss-overlay-active');
            if (overlayEle.classList.contains('e-datavisualization-chart')) {
                this.notify(focusChartBorder, { id: overlayEle.id });
                if (!isChartActive) {
                    this.notify(insertDesignChart, { id: overlayEle.id });
                }
            } else if (isChartActive) {
                this.notify(removeDesignChart, null);
            }
        }
    }

    /**
     * Allows you to remove a selection from the active chart.
     *
     * @returns {void}
     */
    public deselectChart(): void {
        this.notify(refreshOverlayElem, { selector: '.e-datavisualization-chart' });
    }

    /**
     * Allows you to remove a selection from the active image.
     *
     * @returns {void}
     */
    public deselectImage(): void {
        this.notify(refreshOverlayElem, { selector: ':not(.e-datavisualization-chart)' });
    }

    /**
     * Start edit the active cell.
     *
     * {% codeBlock src='spreadsheet/startEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Start edit the active cell.
     */
    public startEdit(): void {
        this.notify(editOperation, { action: 'startEdit', isNewValueEdit: false });
    }

    /**
     * Cancels the edited state, this will not update any value in the cell.
     *
     * {% codeBlock src='spreadsheet/closeEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Cancels the edited state, this will not update any value in the cell.
     */
    public closeEdit(): void {
        this.notify(editOperation, { action: 'cancelEdit' });
    }

    /**
     * If Spreadsheet is in editable state, you can save the cell by invoking endEdit.
     *
     * {% codeBlock src='spreadsheet/endEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - If Spreadsheet is in editable state, you can save the cell by invoking endEdit.
     */
    public endEdit(): void {
        this.notify(editOperation, { action: 'endEdit', isPublic: true });
    }

    /**
     * This method is used to print the active sheet or the entire workbook.
     *
     * @param {printOptions} printOptions - Represents the settings to customize the print type, row and column headers and gridlines in the printing operation.
     * @returns {void}
     */
    public print(printOptions: PrintOptions = { type: 'ActiveSheet', allowRowColumnHeader: false, allowGridLines: false }): void {
        if (this.allowPrint && !isNullOrUndefined(this.printModule)) {
            this.printModule.print(this, printOptions);
        }
    }

    /**
     * Called internally if any of the property value changed.
     *
     * @param  {SpreadsheetModel} newProp - Specify the new properties
     * @param  {SpreadsheetModel} oldProp - Specify the old properties
     * @returns {void} - Called internally if any of the property value changed.
     * @hidden
     */
    public onPropertyChanged(newProp: SpreadsheetModel, oldProp: SpreadsheetModel): void {
        super.onPropertyChanged(newProp, oldProp);
        let sheetTabsRefreshed: boolean;
        for (const prop of Object.keys(newProp)) {
            let header: HTMLElement;
            let addBtn: HTMLButtonElement;
            const sheet: SheetModel = this.getActiveSheet();
            const horizontalScroll: HTMLElement = this.getScrollElement();
            switch (prop) {
            case 'enableRtl':
                if (newProp.locale || newProp.currencyCode) {
                    break;
                }
                header = this.getColumnHeaderContent();
                if (header) { header = header.parentElement; }
                if (!header) { break; }
                if (newProp.enableRtl) {
                    header.style.marginRight = '';
                    this.element.classList.add('e-rtl');
                    document.getElementById(this.element.id + '_sheet_panel').classList.add('e-rtl');
                } else {
                    header.style.marginLeft = '';
                    this.element.classList.remove('e-rtl');
                    document.getElementById(this.element.id + '_sheet_panel').classList.remove('e-rtl');
                }
                if (this.allowScrolling) {
                    this.scrollModule.setPadding(true);
                }
                if (this.allowAutoFill) {
                    const autofillEle: HTMLElement = this.element.querySelector('.e-dragfill-ddb') as HTMLElement;
                    if (autofillEle) {
                        const autofillDdb: { enableRtl: boolean, dataBind: Function } = getComponent(autofillEle, 'dropdown-btn');
                        if (autofillDdb) {
                            autofillDdb.enableRtl = newProp.enableRtl;
                            autofillDdb.dataBind();
                        }
                    }
                }
                this.sheetModule.setPanelWidth(sheet, this.getRowHeaderContent(), true);
                if (this.allowImage || this.allowChart) {
                    const overlays: HTMLCollectionOf<Element> = this.element.getElementsByClassName('e-ss-overlay');
                    let chart: { destroy: Function }; let overlay: HTMLElement; let chartEle: HTMLElement;
                    for (let idx: number = 0, overlayLen: number = overlays.length - 1; idx <= overlayLen; idx++) {
                        overlay = <HTMLElement>overlays[0];
                        if (overlay.classList.contains('e-datavisualization-chart')) {
                            chartEle = overlay.querySelector('.e-accumulationchart');
                            if (chartEle) {
                                chart = getComponent(chartEle, 'accumulationchart');
                            } else {
                                chartEle = overlay.querySelector('.e-chart');
                                chart = chartEle && getComponent(chartEle, 'chart');
                            }
                            if (chart) {
                                chart.destroy();
                            }
                        }
                        detach(overlay);
                        if (idx === overlayLen) {
                            this.notify(updateView, {});
                        }
                    }
                }
                if (horizontalScroll) {
                    horizontalScroll.scrollLeft = 0;
                }
                this.selectRange(sheet.selectedRange);
                break;
            case 'cssClass':
                if (oldProp.cssClass) { removeClass([this.element], oldProp.cssClass.split(' ')); }
                if (newProp.cssClass) { addClass([this.element], newProp.cssClass.split(' ')); }
                break;
            case 'activeSheetIndex':
                this.renderModule.refreshSheet();
                this.notify(activeSheetChanged, { idx: newProp.activeSheetIndex });
                break;
            case 'width':
                this.setWidth();
                this.resize();
                break;
            case 'height':
                this.setHeight();
                this.resize();
                break;
            case 'showRibbon':
                this.notify(ribbon, { prop: 'showRibbon', onPropertyChange: true });
                break;
            case 'showFormulaBar':
                this.notify(formulaBar, { uiUpdate: true });
                break;
            case 'showSheetTabs':
                this.notify(sheetTabs, null);
                break;
            case 'cellStyle':
                this.renderModule.refreshSheet();
                break;
            case 'allowEditing':
                if (this.allowEditing) {
                    this.notify(editOperation, { action: 'renderEditor' });
                    if (this.enableKeyboardNavigation) {
                        // Remove and reassign the `keyDown` and `mouseDown` event in `KeyboardNavigation` and `Selection` module.
                        // To execute the respective event after editing operation.
                        this.enableKeyboardNavigation = false; this.dataBind();
                        this.enableKeyboardNavigation = true; this.dataBind();
                        const mode: SelectionMode = this.selectionSettings.mode;
                        if (mode !== 'None') {
                            this.selectionSettings.mode = 'None'; this.dataBind();
                            this.selectionSettings.mode = mode; this.dataBind();
                        }
                    }
                } else {
                    this.notify(refreshOverlayElem, null);
                }
                break;
            case 'allowInsert':
                addBtn = this.element.getElementsByClassName('e-add-sheet-tab')[0] as HTMLButtonElement;
                if (addBtn) {
                    addBtn.disabled = !this.allowInsert;
                    if (this.allowInsert) {
                        if (addBtn.classList.contains('e-disabled')) { addBtn.classList.remove('e-disabled'); }
                    } else {
                        if (!addBtn.classList.contains('e-disabled')) { addBtn.classList.add('e-disabled'); }
                    }
                }
                break;
            case 'sheets':
                if (newProp.sheets === this.sheets) {
                    this.renderModule.refreshSheet();
                    this.notify(refreshSheetTabs, null);
                    this.notify(workbookFormulaOperation, { action: 'initSheetInfo' });
                    break;
                }
                Object.keys(newProp.sheets).forEach((sheetIndex: string, index: number) => {
                    const sheetIdx: number = Number(sheetIndex);
                    const sheet: SheetModel = newProp.sheets[sheetIdx as number];
                    const curSheet: SheetModel = getSheet(this, sheetIdx);
                    if (sheet.ranges && Object.keys(sheet.ranges).length) {
                        const ranges: string[] = Object.keys(sheet.ranges);
                        let newRangeIdx: number;
                        ranges.forEach((rangeIdx: string, idx: number) => {
                            if (!(sheet.ranges[Number(rangeIdx)] as ExtendedRange).info) {
                                newRangeIdx = idx;
                            }
                        });
                        let rangeIdx: number; let range: ExtendedRange; let curRange: ExtendedRange; let dataSource: Object[];
                        ranges.forEach((rangeIndex: string, idx: number) => {
                            if (isUndefined(newRangeIdx) || newRangeIdx === idx) {
                                rangeIdx = Number(rangeIndex);
                                range = sheet.ranges[rangeIdx as number];
                                curRange = curSheet.ranges[rangeIdx as number];
                                dataSource = range.dataSource as Object[];
                                if (range.fieldsOrder && curRange.info && !dataSource && curRange.dataSource) {
                                    dataSource = curRange.dataSource as Object[];
                                }
                                if (dataSource) {
                                    this.notify(dataSourceChanged, { sheetIdx: sheetIdx, rangeIdx: rangeIdx, changedData: dataSource });
                                }
                            }
                        });
                    } else if (sheet.paneTopLeftCell && oldProp.sheets && oldProp.sheets[`${sheetIdx}`] &&
                        oldProp.sheets[`${sheetIdx}`].paneTopLeftCell) {
                        if (this.activeSheetIndex !== Number(sheetIdx)) { return; }
                        const cIdx: number[] = getCellIndexes(sheet.paneTopLeftCell);
                        const pIdx: number[] = getCellIndexes(oldProp.sheets[`${sheetIdx}`].paneTopLeftCell);
                        if (cIdx[0] !== pIdx[0]) {
                            const frozenRow: number = this.frozenRowCount(this.getActiveSheet());
                            const top: number = cIdx[0] > frozenRow ? getRowsHeight(this.getActiveSheet(), frozenRow, cIdx[0] - 1) : 0;
                            this.notify(updateScroll, { top: top });
                        }
                        if (cIdx[1] !== pIdx[1]) {
                            const frozenCol: number = this.frozenColCount(this.getActiveSheet());
                            const left: number = cIdx[1] > frozenCol ? getColumnsWidth(this.getActiveSheet(), frozenCol, cIdx[1] - 1) : 0;
                            this.notify(updateScroll, { left: left });
                        }
                    } else {
                        if (index === 0) {
                            this.renderModule.refreshSheet();
                        }
                        if (this.showSheetTabs && sheet.name && !sheetTabsRefreshed) {
                            const items: Element = select('.e-sheet-tabs-items', this.element);
                            const idx: number = Number(sheetIdx);
                            if (items.children[idx + 1]) {
                                this.notify(sheetNameUpdate, { items: items, value: sheet.name, idx: idx });
                            } else {
                                this.notify(refreshSheetTabs, null);
                                sheetTabsRefreshed = true;
                            }
                        }
                    }
                });
                break;
            case 'locale':
                this.refresh();
                break;
            case 'currencyCode':
                if (!newProp.locale && (!oldProp || newProp.currencyCode !== oldProp.currencyCode)) {
                    this.refresh();
                }
                break;
            case 'password':
                if (this.password.length > 0) {
                    if (this.showSheetTabs) {
                        this.element.querySelector('.e-add-sheet-tab').setAttribute('disabled', 'true');
                        this.element.querySelector('.e-add-sheet-tab').classList.add('e-disabled');
                    }
                }
                break;
            case 'isProtected':
                if (this.isProtected) {
                    const addBtn: HTMLButtonElement = this.element.getElementsByClassName('e-add-sheet-tab')[0] as HTMLButtonElement;
                    if (addBtn) {
                        addBtn.disabled = this.isProtected;
                        if (this.isProtected) {
                            if (addBtn.classList.contains('e-disabled')) { addBtn.classList.add('e-disabled'); }
                        } else {
                            if (!addBtn.classList.contains('e-disabled')) { addBtn.classList.remove('e-disabled'); }
                        }
                    }
                }
                break;
            case 'allowFreezePane':
                this.notify(ribbon, { prop: 'allowFreezePane', onPropertyChange: true });
                break;
            case 'allowImage':
            case 'allowChart':
                this.renderModule.refreshSheet();
                this.notify(ribbon, { prop: prop, onPropertyChange: true });
                break;
            case 'calculationMode':
                if (oldProp.calculationMode === 'Manual') {
                    this.notify(workbookFormulaOperation, { action: 'ClearDependentCellCollection' });
                }
                this.notify(ribbon, { prop: prop, onPropertyChange: true });
                break;
            case 'allowResizing':
                if (newProp.allowResizing) {
                    this.notify(propertyChange, { propertyName: prop });
                }
                break;
            case 'enableNotes':
                if (newProp.enableNotes) {
                    this.notify(updateView, {});
                }
                break;
            case 'allowNumberFormatting':
            case 'allowWrap':
            case 'allowCellFormatting':
            case 'allowMerge':
                this.notify(ribbon, { prop: prop, onPropertyChange: true });
                this.notify(updateView, {});
                break;
            case 'showAggregate':
                this.notify(showAggregate, { remove: !this.showAggregate });
                break;
            case 'allowAutoFill':
                if (newProp.allowAutoFill) {
                    this.notify(positionAutoFillElement, { onPropertyChange: true });
                }
                break;
            }
        }
    }

    /**
     * To provide the array of modules needed for component rendering.
     *
     * @returns {ModuleDeclaration[]} - To provide the array of modules needed for component rendering.
     * @hidden
     */
    public requiredModules(): ModuleDeclaration[] {
        return getRequiredModules(this);
    }

    /**
     * Appends the control within the given HTML Div element.
     *
     * {% codeBlock src='spreadsheet/appendTo/index.md' %}{% endcodeBlock %}
     *
     * @param {string | HTMLElement} selector - Target element where control needs to be appended.
     * @returns {void} - Appends the control within the given HTML Div element.
     */
    public appendTo(selector: string | HTMLElement): void {
        super.appendTo(selector);
    }

    /**
     * Filters the range of cells in the sheet.
     *
     * @hidden
     * @param {FilterOptions} filterOptions - specifiy the FilterOptions.
     * @param {string} range - Specify the range
     * @returns {Promise<FilterEventArgs>} - Filters the range of cells in the sheet.
     */
    public filter(filterOptions?: FilterOptions, range?: string): Promise<FilterEventArgs> {
        if (!this.allowFiltering) { return Promise.reject(); }
        range = range || this.getActiveSheet().selectedRange;
        return super.filter(filterOptions, range);
    }

    /**
     * Clears the filter changes of the sheet.
     *
     * {% codeBlock src='spreadsheet/clearFilter/index.md' %}{% endcodeBlock %}
     *
     * @param {string} field - Specify the field.
     * @param {number} sheetIndex - Specify the index of the sheet.
     * @returns {void} - To clear the filter.
     */
    public clearFilter(field?: string, sheetIndex?: number): void {
        this.notify(clearFilter, { field: field, sheetIndex: sheetIndex });
    }

    /**
     * Applies the filter UI in the range of cells in the sheet.
     *
     * {% codeBlock src='spreadsheet/applyFilter/index.md' %}{% endcodeBlock %}
     *
     * @param {PredicateModel[]} predicates - Specifies the predicates.
     * @param {string} range - Specify the range.
     * @returns {Promise<void>} - to apply the filter.
     */
    public applyFilter(predicates?: PredicateModel[], range?: string): Promise<void> {
        if (!this.allowFiltering) { return Promise.reject(); }
        const promise: Promise<void> = new Promise((resolve: Function) => { resolve((() => { /** */ })()); });
        if (predicates && predicates.length) {
            let eventArgs: { instance: { options: { type?: string, format?: string } }, arg3: number | string, arg8?: number | string,
                arg2: string, arg7?: string };
            predicates.forEach((predicate: PredicateModel) => {
                eventArgs = { instance: { options: { type: predicate.type, format: predicate.type === 'date' && 'yMd' } },
                    arg3: <string>predicate.value, arg2: predicate.operator };
                this.notify(fltrPrevent, eventArgs);
                predicate.value = eventArgs.arg3;
            });
        }
        const sheetIdx: number = range ? getSheetIndexFromAddress(this, range) : this.activeSheetIndex;
        const filterArgs: { promise: Promise<void>, predicates?: PredicateModel[], range?: string, isInternal: boolean, sIdx: number } =
            { predicates: predicates, range: range, isInternal: true, promise: promise, sIdx: sheetIdx };
        this.notify(initiateFilterUI, filterArgs);
        return filterArgs.promise as Promise<void>;
    }

    /**
     * To add custom library function.
     *
     *  {% codeBlock src='spreadsheet/addCustomFunction/index.md' %}{% endcodeBlock %}
     *
     * @param {string} functionHandler - Custom function handler name
     * @param {string} functionName - Custom function name
     * @param  {string} formulaDescription - Specifies formula description.
     * @returns {void} - To add custom function.
     */
    public addCustomFunction(functionHandler: string | Function, functionName?: string, formulaDescription?: string ): void {
        super.addCustomFunction(functionHandler, functionName, formulaDescription);
        this.notify(refreshFormulaDatasource, null);
    }

    /**
     * Sets or releases the read-only status for a specified range in the given sheet.
     *
     * @param {boolean} readOnly - A boolean indicating whether the range should be set as read-only (true) or editable (false).
     * @param {string} range - The range to be set as read-only. It can be a single cell, a range of cells (e.g., "A1:B5"), a column (e.g., "C"), or a row (e.g., "10").
     * @param {number} sheetIndex - The index of the sheet where the range is located. If not provided, it defaults to the active sheet index.
     * @returns {void} - Sets the read-only status for a specified range in the given sheet.
     *
     */
    public setRangeReadOnly(readOnly: boolean, range: string, sheetIndex: number): void {
        range = range || this.getActiveSheet().selectedRange;
        const sheetIdx: number = sheetIndex || this.activeSheetIndex;
        const indexes: number[] = getSwapRange(getRangeIndexes(range));
        const sheet: SheetModel = getSheet(this as Workbook, sheetIdx);
        if (isNullOrUndefined(sheet)) { return; }
        this.notify('actionBegin', { action: 'readonly', eventArgs: { readOnly, range, sheetIdx } });
        if (isColumnRange(range) || (indexes[0] === 0 && indexes[2] === sheet.rowCount - 1)) {
            for (let col: number = indexes[1]; col <= indexes[3]; col++) {
                if (!readOnly) {
                    const column: ColumnModel = getColumn(sheet, col);
                    if (column && column.isReadOnly) { delete column.isReadOnly; }
                } else {
                    setColumn(sheet, col, { isReadOnly: readOnly });
                }
            }
        } else if (isRowRange(range) || (indexes[1] === 0 && indexes[3] === sheet.colCount - 1)) {
            for (let row: number = indexes[0]; row <= indexes[2]; row++) {
                if (!readOnly) {
                    const rowValue: RowModel = getRow(sheet, row);
                    if (rowValue && rowValue.isReadOnly) { delete rowValue.isReadOnly; }
                } else {
                    setRow(sheet, row, { isReadOnly: readOnly });
                }
            }
        } else {
            for (let colIdx: number = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                for (let rowIdx: number = indexes[0]; rowIdx <= indexes[2]; rowIdx++) {
                    if (!readOnly) {
                        const cell: CellModel = getCell(rowIdx, colIdx, sheet);
                        if (cell && cell.isReadOnly) { delete cell.isReadOnly; }
                    } else {
                        setCell(rowIdx, colIdx, sheet, { isReadOnly: readOnly }, true);
                    }
                }
            }
        }
        // Added the e-readonly class to cell range/column for providing the customization option from sample end to the readonly mode cells.
        for (let colIndex: number = indexes[1]; colIndex <= indexes[3]; colIndex++) {
            for (let rowIndex: number = indexes[0]; rowIndex <= indexes[2]; rowIndex++) {
                const cell: HTMLElement = this.getCell(rowIndex as number, colIndex as number);
                if (!readOnly && cell && cell.classList.contains('e-readonly')) {
                    cell.classList.remove('e-readonly');
                } else if (cell && !cell.classList.contains('e-readonly')) {
                    cell.className += ' e-readonly';
                }
            }
        }
        this.notify('actionComplete', { action: 'readonly', eventArgs: { readOnly, range, sheetIdx } });
    }
}
