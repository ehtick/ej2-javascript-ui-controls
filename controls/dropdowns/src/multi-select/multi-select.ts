// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../drop-down-base/drop-down-base-model.d.ts'/>
import { DropDownBase, SelectEventArgs, dropDownBaseClasses, PopupEventArgs, FilteringEventArgs } from '../drop-down-base/drop-down-base';
import { FocusEventArgs, BeforeOpenEventArgs, FilterType, FieldSettings, ResultData } from '../drop-down-base/drop-down-base';
import { FieldSettingsModel } from '../drop-down-base/drop-down-base-model';
import { isCollide, Popup, createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { IInput, FloatLabelType, Input } from '@syncfusion/ej2-inputs';
import { attributes, setValue , getValue } from '@syncfusion/ej2-base';
import { NotifyPropertyChanges, extend } from '@syncfusion/ej2-base';
import { EventHandler, Property, Event, compile, L10n, EmitType, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { Animation, AnimationModel, Browser, prepend, Complex } from '@syncfusion/ej2-base';
import { MultiSelectModel } from '../multi-select';
import { Search } from '../common/incremental-search';
import { append, addClass, removeClass, closest, detach, remove, select, selectAll } from '@syncfusion/ej2-base';
import { getUniqueID, formatUnit, isNullOrUndefined, isUndefined, ModuleDeclaration } from '@syncfusion/ej2-base';
import { DataManager, Query, Predicate, JsonAdaptor, DataOptions } from '@syncfusion/ej2-data';
import { SortOrder } from '@syncfusion/ej2-lists';
import { createFloatLabel, removeFloating, floatLabelFocus, floatLabelBlur, encodePlaceholder } from './float-label';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RemoveEventArgs extends SelectEventArgs { }

const FOCUS: string = 'e-input-focus';
const DISABLED: string = 'e-disabled';
const OVER_ALL_WRAPPER: string = 'e-multiselect e-input-group e-control-wrapper';
const ELEMENT_WRAPPER: string = 'e-multi-select-wrapper';
const ELEMENT_MOBILE_WRAPPER: string = 'e-mob-wrapper';
const HIDE_LIST: string = 'e-hide-listitem';
const DELIMITER_VIEW: string = 'e-delim-view';
const CHIP_WRAPPER: string = 'e-chips-collection';
const CHIP: string = 'e-chips';
const CHIP_CONTENT: string = 'e-chipcontent';
const CHIP_CLOSE: string = 'e-chips-close';
const CHIP_SELECTED: string = 'e-chip-selected';
const SEARCHBOX_WRAPPER: string = 'e-searcher';
const DELIMITER_VIEW_WRAPPER: string = 'e-delimiter';
const ZERO_SIZE: string = 'e-zero-size';
const REMAIN_WRAPPER: string = 'e-remain';
const CLOSEICON_CLASS: string = 'e-chips-close e-close-hooker';
const DELIMITER_WRAPPER: string = 'e-delim-values';
const POPUP_WRAPPER: string = 'e-ddl e-popup e-multi-select-list-wrapper';
const INPUT_ELEMENT: string = 'e-dropdownbase';
const RTL_CLASS: string = 'e-rtl';
const CLOSE_ICON_HIDE: string = 'e-close-icon-hide';
const MOBILE_CHIP: string = 'e-mob-chip';
const FOOTER: string = 'e-ddl-footer';
const HEADER: string = 'e-ddl-header';
const DISABLE_ICON: string = 'e-ddl-disable-icon';
const SPINNER_CLASS: string = 'e-ms-spinner-icon';
const HIDDEN_ELEMENT: string = 'e-multi-hidden';
const destroy: string = 'destroy';
const dropdownIcon: string = 'e-input-group-icon e-ddl-icon';
const iconAnimation: string = 'e-icon-anim';
const TOTAL_COUNT_WRAPPER: string = 'e-delim-total';
const BOX_ELEMENT: string = 'e-multiselect-box';
const FILTERPARENT: string = 'e-filter-parent';
const CUSTOM_WIDTH: string = 'e-search-custom-width';
const FILTERINPUT: string = 'e-input-filter';
const RESIZE_ICON: string = 'e-resizer-right e-icons';
/**
 * The Multiselect allows the user to pick a more than one value from list of predefined values.
 * ```html
 * <select id="list">
 *      <option value='1'>Badminton</option>
 *      <option value='2'>Basketball</option>
 *      <option value='3'>Cricket</option>
 *      <option value='4'>Football</option>
 *      <option value='5'>Tennis</option>
 * </select>
 * ```
 * ```typescript
 * <script>
 *   var multiselectObj = new Multiselect();
 *   multiselectObj.appendTo("#list");
 * </script>
 * ```
 */

@NotifyPropertyChanges
export class MultiSelect extends DropDownBase implements IInput {
    private spinnerElement: HTMLElement;
    private selectAllAction: Function;
    private setInitialValue: Function;
    private setDynValue: boolean;
    private listCurrentOptions: { [key: string]: Object };
    private targetInputElement: HTMLInputElement | string;
    private selectAllHeight?: number;
    private searchBoxHeight?: number;
    private mobFilter?: boolean;
    private isFiltered: boolean;
    private isFirstClick: boolean;
    private focused: boolean;
    private initial: boolean;
    private backCommand: boolean;
    private keyAction: boolean;
    private isSelectAll: boolean;
    private clearIconWidth: number = 0;
    private previousFilterText: string = '';
    private selectedElementID: string;
    private focusFirstListItem: boolean;
    private currentFocuedListElement: HTMLElement;
    private isCustomRendered: boolean;
    private isRemoteSelection: boolean;
    private isSelectAllTarget: boolean;
    private isClearAllItem: boolean;
    private previousFocusItem: HTMLElement;
    private isRemoveSelection: boolean;
    private isaddNonPresentItems: boolean;
    private resizer: HTMLElement;
    private storedSelectAllHeight: number = 0;
    private isResizing: boolean;
    private originalHeight: number;
    private originalWidth: number;
    private originalMouseX: number;
    private originalMouseY: number;
    private resizeHeight: number;
    private resizeWidth: number;
    private currentRemoveValue: string | number | boolean;
    private selectedListData: { [key: string]: Object }[] | string[] | boolean[] | number[];
    private isClearAllAction: boolean;
    private isUpdateHeaderHeight: boolean = false;
    private isUpdateFooterHeight: boolean = false;
    private isBlurDispatching: boolean = false;
    private isFilterPrevented: boolean = false;
    private isFilteringAction: boolean = false;
    private headerTemplateHeight: number;

    /**
     * The `fields` property maps the columns of the data table and binds the data to the component.
     * * text - Maps the text column from data table for each list item.
     * * value - Maps the value column from data table for each list item.
     * * iconCss - Maps the icon class column from data table for each list item.
     * * groupBy - Group the list items with it's related items by mapping groupBy field.
     * ```html
     * <input type="text" tabindex="1" id="list"> </input>
     * ```
     * ```typescript
     *   let customers: MultiSelect = new MultiSelect({
     *      dataSource:new DataManager({ url:'http://js.syncfusion.com/demos/ejServices/Wcf/Northwind.svc/' }),
     *      query: new Query().from('Customers').select(['ContactName', 'CustomerID']).take(5),
     *      fields: { text: 'ContactName', value: 'CustomerID' },
     *      placeholder: 'Select a customer'
     *   });
     *   customers.appendTo("#list");
     * ```
     *
     * @default {text: null, value: null, iconCss: null, groupBy: null}
     */
    @Complex<FieldSettingsModel>({ text: null, value: null, iconCss: null, groupBy: null, disabled: null }, FieldSettings)
    public fields: FieldSettingsModel;
    /**
     * Enable or disable persisting MultiSelect component's state between page reloads.
     * If enabled, following list of states will be persisted.
     * 1. value
     *
     * @default false
     */
    @Property(false)
    public enablePersistence: boolean;
    /**
     * Accepts the template design and assigns it to the group headers present in the MultiSelect popup list.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public groupTemplate: string | Function;
    /**
     * Accepts the template design and assigns it to popup list of MultiSelect component
     * when no data is available on the component.
     *
     * @default 'No records found'
     * @aspType string
     */
    @Property('No records found')
    public noRecordsTemplate: string | Function;
    /**
     * Accepts the template and assigns it to the popup list content of the MultiSelect component
     * when the data fetch request from the remote server fails.
     *
     * @default 'Request failed'
     * @aspType string
     */
    @Property('Request failed')
    public actionFailureTemplate: string | Function;
    /**
     * Specifies the `sortOrder` to sort the data source. The available type of sort orders are
     * * `None` - The data source is not sorting.
     * * `Ascending` - The data source is sorting with ascending order.
     * * `Descending` - The data source is sorting with descending order.
     *
     * @default null
     * @asptype object
     * @aspjsonconverterignore
     */
    @Property<SortOrder>('None')
    public sortOrder: SortOrder;
    /**
     * Specifies a value that indicates whether the MultiSelect component is enabled or not.
     *
     * @default true
     */
    @Property(true)
    public enabled: boolean;
    /**
     * Defines whether to allow the cross-scripting site or not.
     *
     * @default true
     */
    @Property(true)
    public enableHtmlSanitizer: boolean;
    /**
     * Defines whether to enable virtual scrolling in the component.
     *
     * @default false
     */
    @Property(false)
    public enableVirtualization: boolean;
    /**
     * Accepts the list items either through local or remote service and binds it to the MultiSelect component.
     * It can be an array of JSON Objects or an instance of
     * `DataManager`.
     *
     * @default []
     */
    @Property([])
    public dataSource: { [key: string]: Object }[] | DataManager | string[] | number[] | boolean[];
    /**
     * Accepts the external `Query`
     * which will execute along with the data processing in MultiSelect.
     *
     * @default null
     */
    @Property(null)
    public query: Query;
    /**
     * Determines on which filter type, the MultiSelect component needs to be considered on search action.
     * The `FilterType` and its supported data types are
     *
     * <table>
     * <tr>
     * <td colSpan=1 rowSpan=1>
     * FilterType<br/></td><td colSpan=1 rowSpan=1>
     * Description<br/></td><td colSpan=1 rowSpan=1>
     * Supported Types<br/></td></tr>
     * <tr>
     * <td colSpan=1 rowSpan=1>
     * StartsWith<br/></td><td colSpan=1 rowSpan=1>
     * Checks whether a value begins with the specified value.<br/></td><td colSpan=1 rowSpan=1>
     * String<br/></td></tr>
     * <tr>
     * <td colSpan=1 rowSpan=1>
     * EndsWith<br/></td><td colSpan=1 rowSpan=1>
     * Checks whether a value ends with specified value.<br/><br/></td><td colSpan=1 rowSpan=1>
     * <br/>String<br/></td></tr>
     * <tr>
     * <td colSpan=1 rowSpan=1>
     * Contains<br/></td><td colSpan=1 rowSpan=1>
     * Checks whether a value contains with specified value.<br/><br/></td><td colSpan=1 rowSpan=1>
     * <br/>String<br/></td></tr>
     * </table>
     *
     * The default value set to `StartsWith`, all the suggestion items which contain typed characters to listed in the suggestion popup.
     *
     * @default 'StartsWith'
     */
    @Property('StartsWith')
    public filterType: FilterType;
    /**
     * specifies the z-index value of the component popup element.
     *
     * @default 1000
     */
    @Property(1000)
    public zIndex: number;
    /**
     * ignoreAccent set to true, then ignores the diacritic characters or accents when filtering.
     */
    @Property(false)
    public ignoreAccent: boolean;
    /**
     * Overrides the global culture and localization value for this component. Default global culture is 'en-US'.
     *
     * @default 'en-US'
     */
    @Property()
    public locale: string;
    /**
     * Specifies a Boolean value that indicates the whether the grouped list items are
     * allowed to check by checking the group header in checkbox mode.
     * By default, there is no checkbox provided for group headers.
     * This property allows you to render checkbox for group headers and to select
     * all the grouped items at once
     *
     * @default false
     */
    @Property(false)
    public enableGroupCheckBox: boolean;


    /**
     * Sets the CSS classes to root element of this component which helps to customize the
     * complete styles.
     *
     * @default null
     */
    @Property(null)
    public cssClass: string;
    /**
     * Gets or sets the width of the component. By default, it sizes based on its parent.
     * container dimension.
     *
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public width: string | number;
    /**
     * Gets or sets the height of the popup list. By default it renders based on its list item.
     * > For more details about the popup configuration refer to
     * [`Popup Configuration`](../../multi-select/getting-started/#configure-the-popup-list) documentation.
     *
     * @default '300px'
     * @aspType string
     */
    @Property('300px')
    public popupHeight: string | number;
    /**
     * Gets or sets the width of the popup list and percentage values has calculated based on input width.
     * > For more details about the popup configuration refer to
     * [`Popup Configuration`](../../multi-select/getting-started/#configure-the-popup-list) documentation.
     *
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public popupWidth: string | number;
    /**
     * Gets or sets the placeholder in the component to display the given information
     * in input when no item selected.
     *
     * @default null
     */
    @Property(null)
    public placeholder: string;
    /**
     * Accepts the value to be displayed as a watermark text on the filter bar.
     *
     * @default null
     */
    @Property(null)
    public filterBarPlaceholder: string;
    /**
     * Gets or sets the additional attribute to `HtmlAttributes` property in MultiSelect,
     * which helps to add attribute like title, name etc, input should be key value pair.
     *
     * {% codeBlock src='multiselect/htmlAttributes/index.md' %}{% endcodeBlock %}
     *
     * @default {}
     */
    @Property({})
    public htmlAttributes: { [key: string]: string };
    /**
     * Accepts the template design and assigns it to the selected list item in the input element of the component.
     * For more details about the available template options refer to
     * [`Template`](../../multi-select/templates) documentation.
     *
     * We have built-in `template engine`
     * which provides options to compile template string into a executable function.
     * For EX: We have expression evolution as like ES6 expression string literals.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public valueTemplate: string | Function;
    /**
     * Accepts the template design and assigns it to the header container of the popup list.
     * > For more details about the available template options refer to [`Template`](../../multi-select/templates) documentation.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public headerTemplate: string | Function;
    /**
     * Accepts the template design and assigns it to the footer container of the popup list.
     * > For more details about the available template options refer to [`Template`](../../multi-select/templates) documentation.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public footerTemplate: string | Function;
    /**
     * Accepts the template design and assigns it to each list item present in the popup.
     * > For more details about the available template options refer to [`Template`](../../multi-select/templates) documentation.
     *
     * We have built-in `template engine`
     * which provides options to compile template string into a executable function.
     * For EX: We have expression evolution as like ES6 expression string literals.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public itemTemplate: string | Function;
    /**
     * To enable the filtering option in this component.
     * Filter action performs when type in search box and collect the matched item through `filtering` event.
     * If searching character does not match, `noRecordsTemplate` property value will be shown.
     *
     * {% codeBlock src="multiselect/allow-filtering-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="multiselect/allow-filtering-api/index.html" %}{% endcodeBlock %}
     *
     * @default null
     */
    @Property(null)
    public allowFiltering: boolean;
    /**
     * Specifies the delay time in milliseconds for filtering operations.
     *
     * @default 300
     */
    @Property(300)
    public debounceDelay: number;
    /**
     * Defines whether the popup opens in fullscreen mode on mobile devices when filtering is enabled. When set to false, the popup will display similarly on both mobile and desktop devices.
     *
     * @default true
     */
    @Property(true)
    public isDeviceFullScreen: boolean;
    /**
     * By default, the multiselect component fires the change event while focus out the component.
     * If you want to fires the change event on every value selection and remove, then disable the changeOnBlur property.
     *
     * @default true
     */
    @Property(true)
    public changeOnBlur: boolean;
    /**
     * Allows user to add a
     * [`custom value`](../../multi-select/custom-value), the value which is not present in the suggestion list.
     *
     * @default false
     */
    @Property(false)
    public allowCustomValue: boolean;
    /**
     * Enables close icon with the each selected item.
     *
     * @default true
     */
    @Property(true)
    public showClearButton: boolean;
    /**
     * Sets limitation to the value selection.
     * based on the limitation, list selection will be prevented.
     *
     * @default 1000
     */
    @Property(1000)
    public maximumSelectionLength: number;
    /**
     * Gets or sets the `readonly` to input or not. Once enabled, just you can copy or highlight
     * the text however tab key action will perform.
     *
     * @default false
     */
    @Property(false)
    public readonly: boolean;
    /**
     * Gets or sets a value that indicates whether the Multiselect popup can be resized.
     * When set to `true`, a resize handle appears in the bottom-right corner of the popup,
     * allowing the user to resize the width and height of the popup.
     *
     * @default false
     */
    @Property(false)
    public allowResize: boolean;
    /**
     * Selects the list item which maps the data `text` field in the component.
     *
     * @default null
     * @aspType string
     */
    @Property(null)
    public text: string | null;
    /**
     * Selects the list item which maps the data `value` field in the component.
     * {% codeBlock src='multiselect/value/index.md' %}{% endcodeBlock %}
     *
     * @default null
     * @isGenericType true
     */
    @Property(null)
    public value: number[] | string[] | boolean[] | object[] | null ;
    /**
     * Defines whether the object binding is allowed or not in the component.
     *
     * @default false
     */
    @Property(false)
    public allowObjectBinding: boolean;
    /**
     * Hides the selected item from the list item.
     *
     * @default true
     */
    @Property(true)
    public hideSelectedItem: boolean;
    /**
     * Based on the property, when item get select popup visibility state will changed.
     *
     * @default true
     */
    @Property(true)
    public closePopupOnSelect: boolean;
    /**
     * configures visibility mode for component interaction.
     *
     * - `Box` - selected items will be visualized in chip.
     *
     * - `Delimiter` - selected items will be visualized in text content.
     *
     * - `Default` - on `focus in` component will act in `box` mode.
     * on `blur` component will act in `delimiter` mode.
     *
     * - `CheckBox` - The 'checkbox' will be visualized in list item.
     *
     * {% codeBlock src="multiselect/visual-mode-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="multiselect/visual-mode-api/index.html" %}{% endcodeBlock %}
     *
     * @default Default
     */
    @Property('Default')
    public mode: visualMode;
    /**
     * Sets the delimiter character for 'default' and 'delimiter' visibility modes.
     *
     * @default ','
     */
    @Property(',')
    public delimiterChar: string;
    /**
     * Sets [`case sensitive`](../../multi-select/filtering/#case-sensitive-filtering)
     * option for filter operation.
     *
     * @default true
     */
    @Property(true)
    public ignoreCase: boolean;
    /**
     * Allows you to either show or hide the DropDown button on the component
     *
     * @default false
     */
    @Property(false)
    public showDropDownIcon: boolean;
    /**
     * Specifies whether to display the floating label above the input element.
     * Possible values are:
     * * Never: The label will never float in the input when the placeholder is available.
     * * Always: The floating label will always float above the input.
     * * Auto: The floating label will float above the input after focusing or entering a value in the input.
     *
     * @default Syncfusion.EJ2.Inputs.FloatLabelType.Never
     * @aspType Syncfusion.EJ2.Inputs.FloatLabelType
     * @isEnumeration true
     */
    @Property('Never')
    public floatLabelType: FloatLabelType;
    /**
     * Allows you to either show or hide the selectAll option on the component.
     *
     * @default false
     */
    @Property(false)
    public showSelectAll: boolean;
    /**
     * Specifies the selectAllText to be displayed on the component.
     *
     * @default 'select All'
     */
    @Property('Select All')
    public selectAllText: string;
    /**
     * Specifies the UnSelectAllText to be displayed on the component.
     *
     * @default 'select All'
     */
    @Property('Unselect All')
    public unSelectAllText: string;
    /**
     * Reorder the selected items in popup visibility state.
     *
     * @default true
     */
    @Property(true)
    public enableSelectionOrder: boolean;
    /**
     * Whether to automatically open the popup when the control is clicked.
     *
     * @default true
     */
    @Property(true)
    public openOnClick: boolean;
    /**
     * By default, the typed value is converting into chip or update as value of the component when you press the enter key or select from the popup.
     * If you want to convert the typed value into chip or update as value of the component while focusing out the component, then enable this property.
     * If custom value is enabled, both custom value and value present in the list are converted into tag while focusing out the component; Otherwise, value present in the list is converted into tag while focusing out the component.
     *
     * @default false
     */
    @Property(false)
    public addTagOnBlur: boolean;
    /**
     * Fires each time when selection changes happened in list items after model and input value get affected.
     *
     * @event change
     */
    @Event()
    public change: EmitType<MultiSelectChangeEventArgs>;
    /**
     * Fires before the selected item removed from the widget.
     *
     * @event removing
     */
    @Event()
    public removing: EmitType<RemoveEventArgs>;
    /**
     * Fires after the selected item removed from the widget.
     *
     * @event removed
     */
    @Event()
    public removed: EmitType<RemoveEventArgs>;
    /**
     * Fires before select all process.
     *
     * @event beforeSelectAll
     * @blazorProperty 'beforeSelectAll'
     */
    @Event()
    public beforeSelectAll: EmitType<ISelectAllEventArgs>;
    /**
     * Fires after select all process completion.
     *
     * @event selectedAll
     */
    @Event()
    public selectedAll: EmitType<ISelectAllEventArgs>;
    /**
     * Fires when popup opens before animation.
     *
     * @event beforeOpen
     */
    @Event()
    public beforeOpen: EmitType<Object>;
    /**
     * Fires when popup opens after animation completion.
     *
     * @event open
     */
    @Event()
    public open: EmitType<PopupEventArgs>;
    /**
     * Fires when popup close after animation completion.
     *
     * @event close
     */
    @Event()
    public close: EmitType<PopupEventArgs>;
    /**
     * Event triggers when the input get focus-out.
     *
     * @event blur
     */
    @Event()
    public blur: EmitType<Object>;
    /**
     * Event triggers when the input get focused.
     *
     * @event focus
     */
    @Event()
    public focus: EmitType<Object>;
    /**
     * Event triggers when the chip selection.
     *
     * @event chipSelection
     */
    @Event()
    public chipSelection: EmitType<Object>;
    /**
     * Triggers when the user finishes resizing the Multiselect popup.
     *
     * @event resizeStop
     */
    @Event()
    public resizeStop: EmitType<Object>;
    /**
     * Triggers continuously while the Multiselect popup is being resized by the user.
     * This event provides live updates on the width and height of the popup.
     *
     * @event resizing
     */
    @Event()
    public resizing: EmitType<Object>;
    /**
     * Triggers when the user starts resizing the Multiselect popup.
     *
     * @event resizeStart
     */
    @Event()
    public resizeStart: EmitType<Object>;
    /**
     * Triggers event,when user types a text in search box.
     * > For more details about filtering, refer to [`Filtering`](../../multi-select/filtering) documentation.
     *
     * @event filtering
     */
    @Event()
    public filtering: EmitType<FilteringEventArgs>;
    /**
     * Fires before set the selected item as chip in the component.
     * > For more details about chip customization refer [`Chip Customization`](../../multi-select/chip-customization)
     *
     * @event tagging
     */
    @Event()
    public tagging: EmitType<TaggingEventArgs>;
    /**
     * Triggers when the [`customValue`](../../multi-select/custom-value) is selected.
     *
     * @event customValueSelection
     */
    @Event()
    public customValueSelection: EmitType<CustomValueEventArgs>;
    /**
     * Constructor for creating the DropDownList widget.
     *
     * @param {MultiSelectModel} option - Specifies the MultiSelect model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    public constructor(option?: MultiSelectModel, element?: string | HTMLElement) {
        super(option, element);
    }
    private isValidKey: boolean = false;
    private mainList: HTMLElement;
    public ulElement: HTMLElement;
    private mainData: { [key: string]: Object }[] | string[] | number[] | boolean[];
    protected virtualCustomSelectData: { [key: string]: Object }[];
    private mainListCollection: HTMLElement[];
    private customValueFlag: boolean;
    private inputElement: HTMLInputElement;
    private componentWrapper: HTMLDivElement;
    private overAllWrapper: HTMLDivElement;
    private searchWrapper: HTMLElement;
    private viewWrapper: HTMLElement;
    private chipCollectionWrapper: HTMLElement;
    private overAllClear: HTMLElement;
    private dropIcon: HTMLElement;
    private hiddenElement: HTMLSelectElement;
    private delimiterWrapper: HTMLElement;
    private popupObj: Popup;
    private inputFocus: boolean;
    private header: HTMLElement;
    private footer: HTMLElement;
    private initStatus: boolean;
    private isInitRemoteVirtualData: boolean;
    private isDynamicRemoteVirtualData: boolean;
    private popupWrapper: HTMLDivElement;
    private keyCode: number;
    private beforePopupOpen: boolean;
    private remoteCustomValue: boolean;
    private remoteFilterAction: boolean;
    private selectAllEventData: FieldSettingsModel[] = [];
    private selectAllEventEle: HTMLLIElement[] = [];
    private filterParent: HTMLElement;
    private removeIndex: number;
    private preventSetCurrentData: boolean = false;
    private virtualCustomData: { [key: string]: string | Object };
    private isSelectAllLoop: boolean = false;
    private initialPopupHeight: number;

    private enableRTL(state: boolean): void {
        if (state) {
            this.overAllWrapper.classList.add(RTL_CLASS);
        } else {
            this.overAllWrapper.classList.remove(RTL_CLASS);
        }
        if (this.popupObj) {
            this.popupObj.enableRtl = state;
            this.popupObj.dataBind();
        }
    }

    public requiredModules(): ModuleDeclaration[] {
        const modules: ModuleDeclaration[] = [];
        if (this.enableVirtualization) {
            modules.push({ args: [this], member: 'VirtualScroll' });
        }
        if (this.mode === 'CheckBox') {
            this.isGroupChecking = this.enableGroupCheckBox;
            if (this.enableGroupCheckBox) {
                const prevOnChange: boolean = this.isProtectedOnChange;
                this.isProtectedOnChange = true;
                this.enableSelectionOrder = false;
                this.isProtectedOnChange = prevOnChange;
            }
            this.allowCustomValue = false;
            this.hideSelectedItem = false;
            this.closePopupOnSelect = false;
            modules.push({
                member: 'CheckBoxSelection',
                args: [this]
            });
        }
        return modules;
    }
    private updateHTMLAttribute(): void {
        if (Object.keys(this.htmlAttributes).length) {
            for (const htmlAttr of Object.keys(this.htmlAttributes)) {
                switch (htmlAttr) {
                case 'class': {
                    const updatedClassValue : string = (this.htmlAttributes[`${htmlAttr}`].replace(/\s+/g, ' ')).trim();
                    if (updatedClassValue !== '') {
                        addClass([this.overAllWrapper], updatedClassValue.split(' '));
                        addClass([this.popupWrapper], updatedClassValue.split(' '));
                    }
                    break;
                }
                case 'disabled':
                    this.enable(false);
                    break;
                case 'placeholder':
                    if (!this.placeholder) {
                        this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        this.setProperties({placeholder: this.inputElement.placeholder}, true);
                        this.refreshPlaceHolder();
                    }
                    break;
                default: {
                    const defaultAttr: string[] = ['id'];
                    const validateAttr: string[] = ['name', 'required', 'aria-required', 'form'];
                    const containerAttr: string[] = ['title', 'role', 'style', 'class'];
                    if (defaultAttr.indexOf(htmlAttr) > -1) {
                        this.element.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    } else if (htmlAttr.indexOf('data') === 0 || validateAttr.indexOf(htmlAttr) > -1) {
                        this.hiddenElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    } else if (containerAttr.indexOf(htmlAttr) > -1) {
                        this.overAllWrapper.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    } else if (htmlAttr !== 'size' && !isNullOrUndefined(this.inputElement)) {
                        this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                    break;
                }
                }
            }
        }
    }

    private updateReadonly(state: boolean): void {
        if (!isNullOrUndefined(this.inputElement)) {
            if (state || this.mode === 'CheckBox') {
                this.inputElement.setAttribute('readonly', 'true');
            } else {
                this.inputElement.removeAttribute('readonly');
            }
        }
    }

    private updateClearButton(state: boolean): void {
        if (state) {
            if (this.overAllClear.parentNode) {
                this.overAllClear.style.display = '';
            } else {
                this.componentWrapper.appendChild(this.overAllClear);
            }
            this.componentWrapper.classList.remove(CLOSE_ICON_HIDE);
        } else {
            this.overAllClear.style.display = 'none';
            this.componentWrapper.classList.add(CLOSE_ICON_HIDE);
        }
    }
    private updateCssClass(): void {
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            let updatedCssClassValues : string = this.cssClass;
            updatedCssClassValues = (this.cssClass.replace(/\s+/g, ' ')).trim();
            if (updatedCssClassValues !== '') {
                addClass([this.overAllWrapper], updatedCssClassValues.split(' '));
                addClass([this.popupWrapper], updatedCssClassValues.split(' '));
            }
        }
    }
    private updateOldPropCssClass(oldClass : string) : void {
        if (!isNullOrUndefined(oldClass) && oldClass !== '') {
            oldClass = (oldClass.replace(/\s+/g, ' ')).trim();
            if (oldClass !== '' ) {
                removeClass([this.overAllWrapper], oldClass.split(' '));
                removeClass([this.popupWrapper], oldClass.split(' '));
            }
        }
    }
    private onPopupShown(e?: MouseEvent | KeyboardEventArgs | TouchEvent | Object): void {
        if (Browser.isDevice && (this.mode === 'CheckBox' && this.allowFiltering)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy: this = this;
            window.onpopstate = () => {
                proxy.hidePopup();
                proxy.inputElement.focus();
            };
            history.pushState({}, '');
        }
        const animModel: AnimationModel = { name: 'FadeIn', duration: 100 };
        const eventArgs: PopupEventArgs = { popup: this.popupObj, event: e, cancel: false, animation: animModel };
        this.trigger('open', eventArgs, (eventArgs: PopupEventArgs) => {
            if (!eventArgs.cancel) {
                this.focusAtFirstListItem(true);
                if (this.popupObj){
                    document.body.appendChild(this.popupObj.element);
                }
                if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                    this.updateListItems(this.list.querySelectorAll('li.e-list-item'), this.mainList.querySelectorAll('li.e-list-item'));
                }
                if (this.mode === 'CheckBox' || this.showDropDownIcon) {
                    addClass([this.overAllWrapper], [iconAnimation]);
                }
                this.refreshPopup();
                this.renderReactTemplates();
                if (this.popupObj){
                    this.popupObj.show(eventArgs.animation, (this.zIndex === 1000) ? this.element : null);
                }
                if (this.isReact) {
                    setTimeout(() => {
                        if (this.popupHeight && this.list && this.popupHeight !== 'auto') {
                            const popupHeightValue: number = typeof this.popupHeight === 'string' ? parseInt(this.popupHeight, 10) : this.popupHeight;
                            if (!this.isUpdateHeaderHeight && this.headerTemplate && this.header) {
                                const listHeight: number = this.list.style.maxHeight === '' ? popupHeightValue : parseInt(this.list.style.maxHeight as string, 10);
                                this.list.style.maxHeight = (listHeight - this.header.offsetHeight).toString() + 'px';
                                this.isUpdateHeaderHeight = true;
                            }
                            if (!this.isUpdateFooterHeight && this.footerTemplate && this.footer) {
                                const listHeight: number = this.list.style.maxHeight === '' ? popupHeightValue : parseInt(this.list.style.maxHeight as string, 10);
                                this.list.style.maxHeight = (listHeight - this.footer.offsetHeight).toString() + 'px';
                                this.isUpdateFooterHeight = true;
                            }
                        }
                    }, 15);
                }
                attributes(this.inputElement, {
                    'aria-expanded': 'true', 'aria-owns':
                        this.element.id + '_popup', 'aria-controls': this.element.id
                });
                this.updateAriaActiveDescendant();
                if (this.isFirstClick) {
                    if (!this.enableVirtualization) {
                        this.loadTemplate();
                    }
                }
                if (this.mode === 'CheckBox' && this.showSelectAll){
                    EventHandler.add((this as any).popupObj.element, 'click', this.clickHandler, this);
                }
            }
        });
    }

    private updateVirtualReOrderList(isCheckBoxUpdate?: boolean): void {
        const query: Query = this.getForQuery(this.value, true).clone();
        this.isVirtualReorder = true;
        if (this.enableVirtualization && this.dataSource instanceof DataManager) {
            this.resetList(this.selectedListData, this.fields, query);
        } else {
            this.resetList(this.dataSource, this.fields, query);
        }
        this.UpdateSkeleton();
        this.isVirtualReorder = false;
        this.liCollections = <HTMLElement[] & NodeListOf<Element>>this.list.querySelectorAll('.' + dropDownBaseClasses.li);
        this.virtualItemCount = this.itemCount;
        if (this.mode !== 'CheckBox') {
            this.totalItemCount = this.value && this.value.length ? this.totalItemCount - this.value.length : this.totalItemCount;
        }

        if (!this.list.querySelector('.e-virtual-ddl')) {
            const virualElement: any = this.createElement('div', {
                id: this.element.id + '_popup',
                className: 'e-virtual-ddl'
            });
            virualElement.style.cssText = this.GetVirtualTrackHeight();
            this.popupWrapper.querySelector('.e-dropdownbase').appendChild(virualElement);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.list.getElementsByClassName('e-virtual-ddl')[0] as any).style = this.GetVirtualTrackHeight();
        }
        if (this.list.querySelector('.e-virtual-ddl-content')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
        }
        if (isCheckBoxUpdate){
            this.loadTemplate();
        }
    }

    private updateListItems(listItems: NodeListOf<Element> , mainListItems: NodeListOf<Element>): void {
        for (let i: number = 0; i < listItems.length; i++) {
            this.findGroupStart(listItems[i as number] as HTMLElement);
            this.findGroupStart(mainListItems[i as number] as HTMLElement);
        }
        this.deselectHeader();
    }
    private loadTemplate(): void {
        this.refreshListItems(null);
        if (this.enableVirtualization && this.list && this.mode === 'CheckBox') {
            const reOrderList: Element = this.list.querySelectorAll('.e-reorder')[0];
            if (this.list.querySelector('.e-virtual-ddl-content') && reOrderList){
                this.list.querySelector('.e-virtual-ddl-content').removeChild(reOrderList);
            }
        }
        if (this.mode === 'CheckBox') {
            this.removeFocus();
        }
        this.notify('reOrder', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', e: this });
        this.isPreventScrollAction = true;
    }
    private setScrollPosition(): void {
        if (((!this.hideSelectedItem && this.mode !== 'CheckBox') || (this.mode === 'CheckBox' && !this.enableSelectionOrder)) &&
            (!isNullOrUndefined(this.value) && ( this.value.length > 0 ))) {
            const value: string | number | boolean = this.allowObjectBinding
                ? getValue(
                    (this.fields.value) ? this.fields.value : '',
                    this.value[this.value.length - 1]
                )
                : this.value[this.value.length - 1];
            const valueEle: HTMLElement = this.findListElement(
                (this.hideSelectedItem ? this.ulElement : this.list),
                'li',
                'data-value',
                value);
            if (!isNullOrUndefined(valueEle)) {
                this.scrollBottom(valueEle, undefined, false, null, true);
            }
        }
        if (this.enableVirtualization){
            const focusedItem: HTMLElement = <HTMLElement>this.list.querySelector('.' + dropDownBaseClasses.focus);
            this.isKeyBoardAction = false;
            this.scrollBottom(focusedItem, undefined, false, null, true);
        }
    }
    private focusAtFirstListItem(isOpen?: boolean): void {
        if (this.ulElement && this.ulElement.querySelector('li.'
            + dropDownBaseClasses.li)) {
            let element: HTMLElement;
            if (this.mode === 'CheckBox') {
                this.removeFocus();
                return;
            } else {
                if (this.enableVirtualization) {
                    if (this.fields.disabled) {
                        element = <HTMLElement>this.ulElement.querySelector('li.'
                        + dropDownBaseClasses.li + ':not(.e-virtual-list)' + ':not(.e-hide-listitem)' + ':not(.' + DISABLED + ')');
                        if (isOpen && this.viewPortInfo && this.viewPortInfo.startIndex !== 0) {
                            const elements: NodeListOf<HTMLElement> = this.ulElement.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-virtual-list)' + ':not(.e-hide-listitem)');
                            element = elements && elements.length > 0 ? elements[2] as HTMLElement : element;
                        }
                    }
                    else {
                        element = <HTMLElement>this.ulElement.querySelector('li.'
                        + dropDownBaseClasses.li + ':not(.e-virtual-list)' + ':not(.e-hide-listitem)');
                        if (isOpen && this.viewPortInfo && this.viewPortInfo.startIndex !== 0) {
                            const elements: NodeListOf<HTMLElement> = this.ulElement.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-virtual-list)' + ':not(.e-hide-listitem)');
                            element = elements && elements.length > 0 ? elements[2] as HTMLElement : element;
                        }
                    }
                }
                else {
                    if (this.fields.disabled) {
                        element = <HTMLElement>this.ulElement.querySelector('li.'
                        + dropDownBaseClasses.li + ':not(.'
                        + HIDE_LIST + ')' + ':not(.' + DISABLED + ')');
                    }
                    else {
                        element = <HTMLElement>this.ulElement.querySelector('li.'
                        + dropDownBaseClasses.li + ':not(.'
                        + HIDE_LIST + ')');
                    }
                }
            }
            if (element !== null) {
                this.removeFocus();
                this.addListFocus(element);
            }
        }
    }
    private focusAtLastListItem(data: string): void {
        let activeElement: { [key: string]: Element | number };
        if (data) {
            activeElement = Search(data, this.liCollections, 'StartsWith', this.ignoreCase);
        } else {
            if (this.value && this.value.length) {
                const value: string | number | boolean = this.allowObjectBinding
                    ? getValue(
                        (this.fields.value) ? this.fields.value : '',
                        this.value[this.value.length - 1]
                    )
                    : this.value[this.value.length - 1];
                Search(<string>value, this.liCollections, 'StartsWith', this.ignoreCase);
            } else {
                activeElement = null;
            }
        }
        if (activeElement && activeElement.item !== null) {
            this.addListFocus((<HTMLElement>activeElement.item));
            if (((this.allowCustomValue || this.allowFiltering) && this.isPopupOpen() &&
                this.closePopupOnSelect && !this.enableVirtualization) || this.closePopupOnSelect && !this.enableVirtualization) {
                this.scrollBottom((<HTMLElement>activeElement.item), <number>activeElement.index);
            }
        }
    }

    protected getAriaAttributes(): { [key: string]: string } {
        const ariaAttributes: { [key: string]: string } = {
            'aria-disabled': 'false',
            'role': 'combobox',
            'aria-expanded': 'false'
        };
        return ariaAttributes;
    }
    private updateListARIA(): void {
        if (!isNullOrUndefined(this.ulElement)) {
            attributes(
                this.ulElement,
                {
                    'id': this.element.id + '_options',
                    'role': 'listbox',
                    'aria-hidden': 'false',
                    'aria-label': 'list'
                }
            );
        }
        const disableStatus: boolean = !isNullOrUndefined(this.inputElement) && (this.inputElement.disabled) ? true : false;
        if (!this.isPopupOpen() && !isNullOrUndefined(this.inputElement))
        {
            attributes(this.inputElement, this.getAriaAttributes());
        }
        if (disableStatus) {
            attributes(this.inputElement, { 'aria-disabled': 'true' });
        }
        this.ensureAriaDisabled((disableStatus) ? 'true' : 'false');
    }
    private ensureAriaDisabled(status: string): void {
        if (this.htmlAttributes && this.htmlAttributes['aria-disabled']) {
            const attr: { [key: string]: string } = this.htmlAttributes;
            extend(attr, {'aria-disabled' : status }, attr);
            this.setProperties({ htmlAttributes: attr }, true);
        }
    }
    private removelastSelection(e: KeyboardEventArgs): void {
        const selectedElem: Element = <HTMLElement>this.chipCollectionWrapper.querySelector('span.' + CHIP_SELECTED);
        if (selectedElem !== null) {
            this.removeSelectedChip(e);
            return;
        }
        const elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>
            this.chipCollectionWrapper.querySelectorAll('span.' + CHIP);
        const value: string = elements[elements.length - 1].getAttribute('data-value');
        if (!isNullOrUndefined(this.value)) {
            this.tempValues = this.allowObjectBinding ? this.value.slice() : <string[]>this.value.slice();
        }
        let customValue: string | number | boolean | object = this.allowObjectBinding ? this.enableVirtualization ?
            this.getVirtualDataByValue(this.getFormattedValue(value)) :
            this.getDataByValue(this.getFormattedValue(value)) : this.getFormattedValue(value);
        if (this.allowCustomValue && (value !== 'false' && customValue === false || (!isNullOrUndefined(customValue) &&
            customValue.toString() === 'NaN'))) {
            customValue = value;
        }
        this.removeValue(customValue, e);
        this.removeChipSelection();
        this.updateDelimeter(this.delimiterChar, e);
        this.makeTextBoxEmpty();
        if (this.mainList && this.listData) {
            this.refreshSelection();
        }
        this.checkPlaceholderSize();
    }
    protected onActionFailure(e: Object): void {
        super.onActionFailure(e);
        this.renderPopup();
        this.onPopupShown();
    }
    protected targetElement(): string {
        this.targetInputElement = this.inputElement;
        if (this.mode === 'CheckBox' && this.allowFiltering) {
            this.notify('targetElement', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
        }
        return this.targetInputElement ? this.targetInputElement.value : null;
    }

    private getForQuery(valuecheck: string[] | number[] | boolean[] | object[], isCheckbox?: boolean): Query {
        let predicate: Predicate;
        const field: string = this.isPrimitiveData ? '' : this.fields.value;
        if (this.enableVirtualization && valuecheck) {
            if (isCheckbox) {
                const startindex: number = this.viewPortInfo.startIndex;
                const endindex: number = (((startindex + this.viewPortInfo.endIndex) <= (valuecheck.length)) &&
                    valuecheck[(startindex + this.viewPortInfo.endIndex) as number]) ? (startindex + this.viewPortInfo.endIndex)
                    : (valuecheck.length);
                for (let i: number = startindex; i < endindex; i++) {
                    const value: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                        this.fields.value : '', (valuecheck[i as number] as string)) : (valuecheck[i as number] as string);
                    if (i === startindex) {
                        predicate = new Predicate(field, 'equal', (value));
                    } else {
                        predicate = predicate.or(field, 'equal', (value));
                    }
                }
                return new Query().where(predicate);
            }
            else{
                for (let i: number = 0; i < valuecheck.length; i++) {
                    const value: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                        this.fields.value : '', (valuecheck[i as number] as string)) : (valuecheck[i as number] as string);
                    if (this.isaddNonPresentItems) {
                        predicate = i === 0 ? new Predicate(field, 'equal', (valuecheck[i as number] as string))
                            : predicate.or(field, 'equal', (valuecheck[i as number] as string));
                    } else {
                        predicate = i === 0 ? predicate = new Predicate(field, 'notequal', (value))
                            : predicate.and(field, 'notequal', (value));
                    }
                }
                return new Query().where(predicate);
            }

        }
        else {
            for (let i: number = 0; i < valuecheck.length; i++) {
                if (i === 0) {
                    predicate = new Predicate(field, 'equal', (valuecheck[i as number] as string));
                } else {
                    predicate = predicate.or(field, 'equal', (valuecheck[i as number] as string));
                }
            }
        }
        if (this.dataSource instanceof DataManager && (this.dataSource as DataManager).adaptor instanceof JsonAdaptor) {
            return new Query().where(predicate);
        }
        else {
            return this.getQuery(this.query).clone().where(predicate);
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected onActionComplete(
        ulElement: HTMLElement,
        list: { [key: string]: Object }[] | number[] | boolean[] | string[],
        e?: Object, isUpdated?: boolean): void {
        if (this.dataSource instanceof DataManager && !isNullOrUndefined(e) && !this.virtualGroupDataSource) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = (e as any).count;
        }
        if (this.value && list && list.length > 0 && this.allowFiltering && this.mode !== 'CheckBox' && !this.enableVirtualization && !this.isFilterPrevented && !this.allowCustomValue && this.isFilteringAction) {
            const allItemsInValue: boolean = list.every((item: { [key: string]: Object } | string | number | boolean) => {
                const itemValue: any = getValue((this.fields.value) ? this.fields.value : '', item);
                return this.value.some((val: string | number | boolean | object) => {
                    const value: any = this.allowObjectBinding ? getValue((this.fields.value) ? this.fields.value : '', val) : val;
                    return itemValue === value;
                });
            });
            if (allItemsInValue) {
                ulElement.innerHTML = '';
                list = [];
            }
        }
        /* eslint-enable @typescript-eslint/no-unused-vars */
        super.onActionComplete(ulElement, list, e);
        this.skeletonCount = this.totalItemCount !== 0 && this.totalItemCount < (this.itemCount * 2) &&
            ((!(this.dataSource instanceof DataManager)) ||
            ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
        this.updateSelectElementData(this.allowFiltering);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const proxy: MultiSelect = this;
        if (!isNullOrUndefined(this.value) && !this.allowCustomValue && !this.enableVirtualization &&
            this.listData && this.listData.length > 0) {
            for (let i: number = 0; i < this.value.length; i++) {
                const value: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                    this.fields.value : '', proxy.value[i as number]) : proxy.value[i as number];
                const checkEle: Element = this.findListElement(
                    ((this.allowFiltering && !isNullOrUndefined(this.mainList)) ? this.mainList : ulElement),
                    'li',
                    'data-value',
                    value);
                if (!checkEle && !(this.dataSource instanceof DataManager)) {
                    this.value.splice(i, 1);
                    i -= 1;
                }
            }
        }
        let valuecheck: string[] | number[] | boolean[] | object[]  = [];
        if (!isNullOrUndefined(this.value)) {
            valuecheck = this.presentItemValue(this.ulElement);
        }
        const isContainsValue: boolean = valuecheck.some((item: string | number | boolean | object) => item !== null);
        if (valuecheck.length > 0 && this.dataSource instanceof DataManager && !isNullOrUndefined(this.value)
        && this.listData != null && (!this.enableVirtualization || (this.enableVirtualization && this.valueTemplate)) && isContainsValue) {
            this.isaddNonPresentItems = true;
            this.addNonPresentItems(valuecheck, this.ulElement, this.listData);
            this.isaddNonPresentItems = false;
        }
        else {
            this.updateActionList(ulElement, list, e);
        }
        if (this.dataSource instanceof DataManager && this.allowCustomValue && !this.isCustomRendered &&
            this.inputElement.value && this.inputElement.value !== '') {
            let query: Query = new Query();
            query = this.allowFiltering ? query.where(
                this.fields.text, 'startswith', this.inputElement.value, this.ignoreCase, this.ignoreAccent) : query;
            this.checkForCustomValue(query, this.fields);
            this.isCustomRendered = true;
            this.remoteCustomValue = this.enableVirtualization ? false : this.remoteCustomValue;
        }
        if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy) && !isNullOrUndefined(this.fields.disabled)) {
            this.disableGroupHeader();
        }
        if (this.dataSource instanceof DataManager && this.mode === 'CheckBox' && this.allowFiltering) {
            this.removeFocus();
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    private updateActionList(
        ulElement: HTMLElement,
        list: { [key: string]: Object }[] | number[] | boolean[] | string[],
        e?: Object, isUpdated?: boolean): void {
    /* eslint-enable @typescript-eslint/no-unused-vars */
        if (this.mode === 'CheckBox' && this.showSelectAll) {
            this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
        }
        if (!this.mainList && !this.mainData) {
            this.mainList = ulElement.cloneNode ? <HTMLElement>ulElement.cloneNode(true) : ulElement;
            this.mainData = list;
            this.mainListCollection = this.liCollections;
        } else if (isNullOrUndefined(this.mainData) || this.mainData.length === 0) {
            this.mainData = list;
        }
        if ((this.remoteCustomValue || list.length <= 0) && this.allowCustomValue && this.inputFocus && this.allowFiltering &&
            this.inputElement.value && this.inputElement.value !== '') {
            this.checkForCustomValue(this.tempQuery, this.fields);
            if (this.isCustomRendered) {
                return;
            }
        }
        if (this.value && this.value.length && ((this.mode !== 'CheckBox' && !isNullOrUndefined(this.inputElement) &&
            this.inputElement.value.trim() !== '') ||
            this.mode === 'CheckBox' || ((this.keyCode === 8 || this.keyCode === 46) && this.allowFiltering &&
            this.allowCustomValue && this.dataSource instanceof DataManager && this.inputElement.value === ''))) {
            this.refreshSelection();
        }
        this.updateListARIA();
        this.unwireListEvents();
        this.wireListEvents();
        if (!isNullOrUndefined(this.setInitialValue)) {
            this.setInitialValue();
        }
        if (!isNullOrUndefined(this.selectAllAction)) {
            this.selectAllAction();
        }
        if (this.setDynValue) {
            if (!isNullOrUndefined(this.text) && (isNullOrUndefined(this.value) || this.value.length === 0)) {
                this.initialTextUpdate();
            }
            if (!this.enableVirtualization) {
                if (!this.isRemoveSelection) {
                    this.initialValueUpdate(this.listData, true);
                } else {
                    this.initialValueUpdate();
                }
            } else if (!(this.dataSource instanceof DataManager)) {
                this.initialValueUpdate();
            }
            this.initialUpdate();
            this.refreshPlaceHolder();
            if (this.mode !== 'CheckBox' && this.changeOnBlur) {
                this.updateValueState(null, this.value, null);
            }
        }
        this.renderPopup();
        if (this.beforePopupOpen) {
            this.beforePopupOpen = false;
            this.onPopupShown(e);
        }
    }
    private refreshSelection(): void {
        let value: string | number | boolean;
        let element: HTMLElement;
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (!isNullOrUndefined(this.value)) {
            for (let index: number = 0; !isNullOrUndefined(this.value[index as number]); index++) {
                value = this.allowObjectBinding ? getValue((this.fields.value) ? this.fields.value : '', this.value[index as number]) :
                    this.value[index as number];
                element = this.findListElement(this.list, 'li', 'data-value', value);
                if (element) {
                    addClass([element], className);
                    if (this.hideSelectedItem && element.previousSibling
                        && element.previousElementSibling.classList.contains(dropDownBaseClasses.group)
                        && (!element.nextElementSibling ||
                            element.nextElementSibling.classList.contains(dropDownBaseClasses.group))) {
                        addClass([element.previousElementSibling], className);
                    }
                    if (this.hideSelectedItem && this.fields.groupBy && !element.previousElementSibling.classList.contains(HIDE_LIST)) {
                        this.hideGroupItem(value);
                    }
                    if (this.hideSelectedItem && element.classList.contains(dropDownBaseClasses.focus)) {
                        removeClass([element], dropDownBaseClasses.focus);
                        const listEle: NodeListOf<Element> = element.parentElement.querySelectorAll('.' +
                            dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')' + ':not(.' + DISABLED + ')');
                        if (listEle.length > 0) {
                            addClass([listEle[0]], dropDownBaseClasses.focus);
                            this.updateAriaActiveDescendant();
                        } else {
                            //EJ2-57588 - for this task, we prevent the ul element cloning ( this.ulElement = this.ulElement.cloneNode ? <HTMLElement>this.ulElement.cloneNode(true) : this.ulElement;)
                            if (!(this.list && this.list.querySelectorAll('.' + dropDownBaseClasses.li).length > 0)) {
                                this.l10nUpdate();
                                addClass([this.list], dropDownBaseClasses.noData);
                            }
                        }
                    }
                    element.setAttribute('aria-selected', 'true');
                    if (this.mode === 'CheckBox' && element.classList.contains('e-active')) {
                        const ariaValue: number = element.getElementsByClassName('e-check').length;
                        if (ariaValue === 0) {
                            const args: { [key: string]: Object | string } = {
                                module: 'CheckBoxSelection',
                                enable: this.mode === 'CheckBox',
                                li: element,
                                e: null
                            };
                            this.notify('updatelist', args);
                        }
                    }
                }
            }
        }
        this.checkSelectAll();
        this.checkMaxSelection();
    }

    private hideGroupItem(value: string | number | boolean): void {
        let element: HTMLElement;
        let element1: HTMLElement;
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        element1 = element = this.findListElement(this.ulElement, 'li', 'data-value', value);
        let i: number = 0;
        let j: number = 0;
        let temp: boolean = true;
        let temp1: boolean = true;
        do {
            if (element && element.previousElementSibling
                && (!element.previousElementSibling.classList.contains(HIDE_LIST) &&
                    element.previousElementSibling.classList.contains(dropDownBaseClasses.li))) {
                temp = false;
            }
            if (!temp || !element || (element.previousElementSibling
                && element.previousElementSibling.classList.contains(dropDownBaseClasses.group))) {
                i = 10;
            } else {
                element = element.previousElementSibling as HTMLElement;
            }
            if (element1 && element1.nextElementSibling
                && (!element1.nextElementSibling.classList.contains(HIDE_LIST) &&
                    element1.nextElementSibling.classList.contains(dropDownBaseClasses.li))) {
                temp1 = false;
            }
            if (!temp1 || !element1 || (element1.nextElementSibling
                && element1.nextElementSibling.classList.contains(dropDownBaseClasses.group))) {
                j = 10;
            } else {
                element1 = element1.nextElementSibling as HTMLElement;
            }
        }
        while (i < 10 || j < 10);
        if (temp && temp1 && !element.previousElementSibling.classList.contains(HIDE_LIST)) {
            addClass([element.previousElementSibling], className);
        } else if (temp && temp1 && element.previousElementSibling.classList.contains(HIDE_LIST)) {
            removeClass([element.previousElementSibling], className);
        }
    }

    protected getValidLi() : HTMLElement {
        const liElement: HTMLElement = this.ulElement.querySelector('li.' + dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')');
        return (!isNullOrUndefined(liElement) ? liElement : this.liCollections[0]);
    }

    private checkSelectAll(): void {
        const groupItemLength: number = !isNullOrUndefined(this.fields.disabled) ? this.list.querySelectorAll('li.e-list-group-item.e-active:not(.e-disabled)').length : this.list.querySelectorAll('li.e-list-group-item.e-active').length;
        const listItem: NodeListOf<Element> = this.list.querySelectorAll('li.e-list-item');
        const searchCount: number = this.enableVirtualization ? this.list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-virtual-list)').length : !isNullOrUndefined(this.fields.disabled) ? this.list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-disabled)').length : this.list.querySelectorAll('li.' + dropDownBaseClasses.li).length;
        let searchActiveCount: number = this.list.querySelectorAll('li.' + dropDownBaseClasses.selected).length;
        if (this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
            searchActiveCount = searchActiveCount - groupItemLength;
        }
        if ((!this.enableVirtualization && ((searchCount === searchActiveCount || searchActiveCount === this.maximumSelectionLength)
            && (this.mode === 'CheckBox' && this.showSelectAll))) || (this.enableVirtualization && this.mode === 'CheckBox' &&
                this.showSelectAll && this.value && this.value.length === this.totalItemCount)) {
            this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'check' });
        } else if ((searchCount !== searchActiveCount) && (this.mode === 'CheckBox' && this.showSelectAll)) {
            this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'uncheck' });
        }
        if (this.enableGroupCheckBox && this.fields.groupBy && !this.enableSelectionOrder) {
            for (let i: number = 0; i < listItem.length; i++) {
                this.findGroupStart(listItem[i as number] as HTMLElement);
            }
            this.deselectHeader();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private openClick(e: KeyboardEventArgs): void {
        if (!this.openOnClick && this.mode !== 'CheckBox' && !this.isPopupOpen()) {
            if (this.targetElement() !== '') {
                this.showPopup();
            } else {
                this.hidePopup(e);
            }
        } else if (!this.openOnClick && this.mode === 'CheckBox' && !this.isPopupOpen()) {
            this.showPopup();
        }
    }
    private keyUp(e: KeyboardEventArgs): void {
        if (this.mode === 'CheckBox' && !this.openOnClick) {
            const char: string = String.fromCharCode(e.keyCode);
            const isWordCharacter: Object = char.match(/\w/);
            if (!isNullOrUndefined(isWordCharacter)) {
                this.isValidKey = true;
            }
        }
        this.isValidKey = (this.isPopupOpen() && e.keyCode === 8) || this.isValidKey;
        this.isValidKey = e.ctrlKey && e.keyCode === 86 ? false : this.isValidKey;
        if (this.isValidKey && this.inputElement) {
            this.isValidKey = false;
            this.expandTextbox();
            this.showOverAllClear();
            switch (e.keyCode) {
            default:
                // For filtering works in mobile firefox
                this.search(e);
            }
        }
    }
    /**
     * To filter the multiselect data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     */
    public filter(
        dataSource: { [key: string]: Object }[] | DataManager | string[] | number[] | boolean[],
        query?: Query, fields?: FieldSettingsModel): void {
        this.isFiltered = true;
        this.remoteFilterAction = true;
        this.dataUpdater(dataSource, query, fields);
    }
    protected getQuery(query: Query): Query {
        let filterQuery: Query = query ? query.clone() : this.query ? this.query.clone() : new Query();
        if (this.isFiltered) {
            if ((this.enableVirtualization && !isNullOrUndefined(this.customFilterQuery))) {
                filterQuery = this.customFilterQuery.clone() as Query;
                return this.virtualFilterQuery(filterQuery);
            }
            else if (!this.enableVirtualization){
                return filterQuery;
            }
        }
        if (this.isFilterAction) {
            if ((this.targetElement() !== null && !this.enableVirtualization) || (this.enableVirtualization &&
                this.targetElement() !== null && this.targetElement().trim() !== '')) {
                const dataType: string = <string>this.typeOfData(this.dataSource as { [key: string]: Object }[]).typeof;
                if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                    filterQuery.where('', this.filterType, this.targetElement(), this.ignoreCase, this.ignoreAccent);
                } else if ((this.enableVirtualization && this.targetElement() !== '' && !this.isClearAllAction) || !this.enableVirtualization){
                    const fields: FieldSettingsModel = this.fields;
                    filterQuery.where(
                        !isNullOrUndefined(fields.text) ? fields.text : '',
                        this.filterType, this.targetElement(), this.ignoreCase, this.ignoreAccent);
                }
            }
            if (this.enableVirtualization && (this.viewPortInfo.endIndex !== 0) && !this.virtualSelectAll) {
                return this.virtualFilterQuery(filterQuery);
            }
            if (this.virtualSelectAll) {
                return query ? query.skip(0).take(this.maximumSelectionLength).requiresCount() : this.query ?
                    this.query.skip(0).take(this.maximumSelectionLength).requiresCount() :
                    new Query().skip(0).take(this.maximumSelectionLength).requiresCount();
            }
            return filterQuery;
        } else {
            if (this.enableVirtualization && (this.viewPortInfo.endIndex !== 0) && !this.virtualSelectAll) {
                return this.virtualFilterQuery(filterQuery);
            }
            if (this.virtualSelectAll) {
                return query ? query.skip(0).take(this.maximumSelectionLength).requiresCount() : this.query ?
                    this.query.skip(0).take(this.maximumSelectionLength).requiresCount() :
                    new Query().skip(0).take(this.maximumSelectionLength).requiresCount();
            }
            return query ? query : this.query ? this.query : new Query();
        }
    }

    private virtualFilterQuery(filterQuery: Query): Query {
        const takeValue: number = this.getTakeValue();
        let isReOrder: boolean = true;
        let isSkip: boolean = true;
        let isTake: boolean = true;
        for (let queryElements: number = 0; queryElements < filterQuery.queries.length; queryElements++) {
            if (this.getModuleName() === 'multiselect' && ((filterQuery.queries[queryElements as number].e &&
                filterQuery.queries[queryElements as number].e.condition === 'or') || (filterQuery.queries[queryElements as number].e &&
                    filterQuery.queries[queryElements as number].e.operator === 'equal'))) {
                isReOrder = false;
            }
            if (filterQuery.queries[queryElements as number].fn === 'onSkip') {
                isSkip = false;
            }
            if (filterQuery.queries[queryElements as number].fn === 'onTake') {
                isTake = false;
            }
        }
        let queryTakeValue: number = 0;
        if (filterQuery && filterQuery.queries.length > 0) {
            for (let queryElements: number = 0; queryElements < filterQuery.queries.length; queryElements++) {
                if (filterQuery.queries[queryElements as number].fn === 'onTake') {
                    queryTakeValue = takeValue <= filterQuery.queries[queryElements as number].e.nos ?
                        filterQuery.queries[queryElements as number].e.nos : takeValue;
                }

            }
        }
        if (queryTakeValue <= 0 && this.query && this.query.queries.length > 0){
            for (let queryElements: number = 0; queryElements < this.query.queries.length; queryElements++) {
                if (this.query.queries[queryElements as number].fn === 'onTake') {
                    queryTakeValue = takeValue <= this.query.queries[queryElements as number].e.nos ?
                        this.query.queries[queryElements as number].e.nos : takeValue;
                }
            }
        }
        if (filterQuery && filterQuery.queries.length > 0) {
            for (let queryElements: number = 0; queryElements < filterQuery.queries.length; queryElements++) {
                if (filterQuery.queries[queryElements as number].fn === 'onTake') {
                    queryTakeValue = filterQuery.queries[queryElements as number].e.nos <= queryTakeValue ?
                        queryTakeValue : filterQuery.queries[queryElements as number].e.nos;
                    filterQuery.queries.splice(queryElements, 1);
                    --queryElements;
                }
            }
        }
        if (((this.allowFiltering && isSkip) || !isReOrder || (!this.allowFiltering && isSkip)) && !this.isVirtualReorder) {
            if (!isReOrder){
                filterQuery.skip(this.viewPortInfo.startIndex);
            }
            else{
                filterQuery.skip(this.virtualItemStartIndex);
            }
        }
        if (this.isIncrementalRequest) {
            filterQuery.take(this.incrementalEndIndex);
        } else if (queryTakeValue > 0) {
            filterQuery.take(queryTakeValue);
        }
        else {
            filterQuery.take(takeValue);
        }
        filterQuery.requiresCount();
        this.customFilterQuery = null;
        return filterQuery;
    }

    protected getTakeValue(): number {
        return this.allowFiltering && Browser.isDevice ? Math.round(window.outerHeight / this.listItemHeight) : this.itemCount;
    }

    private dataUpdater(
        dataSource: { [key: string]: Object }[] | DataManager | string[] | number[] | boolean[],
        query?: Query, fields?: FieldSettingsModel): void {
        this.isDataFetched = false;
        const isNoData: boolean = this.list.classList.contains(dropDownBaseClasses.noData);
        if (this.targetElement().trim() === '' && (!this.allowCustomValue || this.mode === 'CheckBox' || this.targetElement() === '')) {
            const list: HTMLElement = this.enableVirtualization ? <HTMLElement>this.list.cloneNode(true) : this.mainList.cloneNode ?
            <HTMLElement>this.mainList.cloneNode(true) : this.mainList;
            if (this.backCommand || (this.enableVirtualization && this.mode === 'CheckBox' && this.value && this.value.length > 0)) {
                this.remoteCustomValue = false;
                let isReordered: boolean = false;
                if (this.allowCustomValue && list.querySelectorAll('li').length === 0 && this.mainData.length > 0) {
                    this.mainData = [];
                }
                if (this.enableVirtualization) {
                    if (this.allowFiltering) {
                        this.isPreventScrollAction = true;
                        this.list.scrollTop = 0;
                        this.previousStartIndex = 0;
                        this.virtualListInfo = null;
                    }
                    if (this.value && this.value.length > 0 && this.mode === 'CheckBox') {
                        this.notify('setCurrentViewDataAsync', {
                            component: this.getModuleName(),
                            module: 'VirtualScroll'
                        });
                        isReordered = true;
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.totalItemCount = this.dataSource && (this.dataSource as any).length ? (this.dataSource as any).length : 0;
                        this.resetList(dataSource, fields, query);
                        if (this.mode !== 'CheckBox') {
                            this.totalItemCount = this.value && this.value.length ? this.totalItemCount - this.value.length :
                                this.totalItemCount;
                        }
                        this.UpdateSkeleton();
                        if ((isNoData || this.allowCustomValue) && !this.list.classList.contains(dropDownBaseClasses.noData)) {
                            if (!this.list.querySelector('.e-virtual-ddl-content')) {
                                const contentElement: HTMLElement = this.createElement('div', {
                                    className: 'e-virtual-ddl-content'
                                });
                                contentElement.style.cssText = this.getTransformValues();
                                this.list.appendChild(contentElement).appendChild(this.list.querySelector('.e-list-parent'));
                            }
                            if (!this.list.querySelector('.e-virtual-ddl')) {
                                const virualElement: any = this.createElement('div', {
                                    id: this.element.id + '_popup',
                                    className: 'e-virtual-ddl'
                                });
                                virualElement.style.cssText = this.GetVirtualTrackHeight();
                                document.getElementsByClassName('e-multi-select-list-wrapper')[0].querySelector('.e-dropdownbase').appendChild(virualElement);
                            }
                        }
                    }
                }
                this.onActionComplete(list, this.mainData);
                if (this.value && this.value.length) {
                    this.refreshSelection();
                }
                if (this.keyCode !== 8) {
                    this.focusAtFirstListItem();
                }
                if (!isReordered) {
                    this.notify('reOrder', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', e: this });
                }
            }
        } else {
            if (this.enableVirtualization && this.allowFiltering) {
                this.isPreventScrollAction = true;
                this.list.scrollTop = 0;
                this.previousStartIndex = 0;
                this.virtualListInfo = null;
                if (this.list.querySelector('.e-list-parent' + '.e-reorder')) {
                    this.list.querySelector('.e-list-parent' + '.e-reorder').remove();
                }
            }
            this.resetList(dataSource, fields, query);
            if (this.enableVirtualization && (isNoData || this.allowCustomValue) &&
                !this.list.classList.contains(dropDownBaseClasses.noData)) {
                if (!this.list.querySelector('.e-virtual-ddl-content')) {
                    const contentElement: HTMLElement = this.createElement('div', {
                        className: 'e-virtual-ddl-content'
                    });
                    contentElement.style.cssText = this.getTransformValues();
                    this.list.appendChild(contentElement).appendChild(this.list.querySelector('.e-list-parent'));
                }
                if (this.mode !== 'CheckBox') {
                    this.totalItemCount = this.value && this.value.length ? this.totalItemCount - this.value.length : this.totalItemCount;
                }
                if (!this.list.querySelector('.e-virtual-ddl')) {
                    const virualElement: any = this.createElement('div', {
                        id: this.element.id + '_popup',
                        className: 'e-virtual-ddl'
                    });
                    virualElement.style.cssText = this.GetVirtualTrackHeight();
                    document.getElementsByClassName('e-multi-select-list-wrapper')[0].querySelector('.e-dropdownbase').appendChild(virualElement);
                }
            }
            if (this.allowCustomValue) {
                if (!(dataSource instanceof DataManager)) {
                    this.checkForCustomValue(query, fields);
                } else {
                    this.remoteCustomValue = true;
                    this.tempQuery = query;
                }
            }
        }
        if (this.enableVirtualization && this.allowFiltering) {
            this.getFilteringSkeletonCount();
        }
        this.refreshPopup();
        if (this.allowResize) {
            this.setResize();
        }
        if (this.mode === 'CheckBox') {
            this.removeFocus();
        }
    }
    private tempQuery: Query;
    private tempValues: string[] | number[] | boolean[] | object[];
    private secureRandom(): number {
        const array: Uint32Array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }
    private checkForCustomValue(query?: Query, fields?: FieldSettingsModel): void {
        const dataChecks: boolean = !this.getValueByText(this.inputElement.value, this.ignoreCase);
        const field: FieldSettingsModel = fields ? fields : this.fields;
        this.isCustomReset = true;
        if (this.allowCustomValue && dataChecks) {
            const value: string = this.inputElement.value;
            const customData: Object | string = (!isNullOrUndefined(this.mainData) && this.mainData.length > 0) ?
                (this.mainData as { [key: string]: Object }[])[0] : this.mainData;
            if (customData && typeof (customData) !== 'string' && typeof (customData) !== 'number' && typeof (customData) !== 'boolean') {
                let dataItem: { [key: string]: string | Object } = {};
                setValue(field.text, value, dataItem);
                if (typeof getValue((this.fields.value ? this.fields.value : 'value'), customData as { [key: string]: Object })
                === 'number' && this.fields.value !== this.fields.text) {
                    setValue(field.value, this.secureRandom(), dataItem);
                } else {
                    setValue(field.value, value, dataItem);
                }
                const emptyObject: { [key: string]: any } = {};
                if (this.allowObjectBinding) {
                    const keys: string[] = this.listData && this.listData.length > 0 ? Object.keys(this.listData[0]) : this.firstItem ?
                        Object.keys(this.firstItem) : Object.keys(dataItem);
                    const isNumberType: boolean = (typeof getValue((this.fields.value ? this.fields.value : 'value'), customData as { [key: string]: Object })
                        === 'number' && this.fields.value !== this.fields.text);
                    // Create an empty object with predefined keys
                    keys.forEach((key: string) => {
                        emptyObject[key as any] = ((key === fields.value) || (key === fields.text)) ?
                            ((key === fields.text) && isNumberType) ? getValue(fields.text, dataItem) :
                                getValue(fields.value, dataItem) : null;
                    });
                }
                dataItem = this.allowObjectBinding ? emptyObject : dataItem;
                if (this.enableVirtualization) {
                    this.virtualCustomData = dataItem;
                    const tempData: { [key: string]: Object }[] = this.dataSource instanceof DataManager ?
                        JSON.parse(JSON.stringify(this.listData)) : JSON.parse(JSON.stringify(this.dataSource));
                    let totalData: { [key: string]: Object }[] = [];
                    if (this.virtualCustomSelectData && this.virtualCustomSelectData.length > 0){
                        totalData = tempData.concat(this.virtualCustomSelectData);
                    }
                    tempData.splice(0, 0, dataItem);
                    this.isCustomDataUpdated = true;
                    const tempCount: number = this.totalItemCount;
                    this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
                    this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.itemCount;
                    this.resetList(tempData, field, query);
                    this.isCustomDataUpdated = false;
                    this.totalItemCount = this.enableVirtualization && this.dataSource instanceof DataManager ?
                        tempCount : this.totalItemCount;
                }
                else {
                    if (this.dataSource instanceof DataManager && this.allowCustomValue && this.allowFiltering) {
                        this.remoteCustomValue = false;
                    }
                    const tempData: [{ [key: string]: Object }] = JSON.parse(JSON.stringify(this.listData));
                    tempData.splice(0, 0, dataItem);
                    this.resetList(tempData, field, query);
                    this.focusAtLastListItem(value);
                }
            } else if (this.listData) {
                const tempData: string[] = JSON.parse(JSON.stringify(this.listData));
                tempData.splice(0, 0, this.inputElement.value);
                (tempData[0] as string | number) = (typeof customData === 'number' && !isNaN(parseFloat(tempData[0]))) ?
                    parseFloat(tempData[0]) : tempData[0];
                (tempData[0]  as string | boolean) = (typeof customData === 'boolean') ?
                    (tempData[0] === 'true' ? true : (tempData[0] === 'false' ? false : tempData[0])) : tempData[0];
                this.resetList(tempData, field);
                this.focusAtLastListItem(value);
            }
        }
        else if (this.listData && this.mainData && !dataChecks && this.allowCustomValue) {
            if (this.allowFiltering && this.isRemoteSelection && this.remoteCustomValue ) {
                this.isRemoteSelection = false;
                if (!this.enableVirtualization) {
                    this.resetList(this.listData, field, query);
                }
            }
            else if (!this.allowFiltering && this.list) {
                const liCollections: HTMLElement[] = <HTMLElement[] & NodeListOf<Element>>
                    this.list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-hide-listitem)');
                const activeElement: { [key: string]: Element | number } =
                    Search(this.targetElement(), liCollections, 'StartsWith', this.ignoreCase);

                if (activeElement && activeElement.item !== null) {
                    this.addListFocus((<HTMLElement>activeElement.item));
                }
            }
        }
        this.isCustomReset = false;
        if (this.value && this.value.length) {
            this.refreshSelection();
        }
    }
    protected getNgDirective(): string {
        return 'EJS-MULTISELECT';
    }
    private wrapperClick(e: MouseEvent): void {
        this.setDynValue = false;
        this.keyboardEvent = null;
        this.isKeyBoardAction = false;
        if (!this.enabled) {
            return;
        }
        if ((<HTMLElement>e.target) === this.overAllClear) {
            e.preventDefault();
            return;
        }
        if (!this.inputFocus) {
            this.inputElement.focus();
        }
        if (!this.readonly) {
            if (e.target && (<HTMLElement>e.target).classList.toString().indexOf(CHIP_CLOSE) !== -1) {
                if (this.isPopupOpen()) {
                    this.refreshPopup();
                }
                return;
            }
            if (!this.isPopupOpen() &&
            (this.openOnClick || (this.showDropDownIcon && e.target && (<HTMLElement>e.target).className === dropdownIcon))) {
                this.showPopup(e);
            } else {
                this.hidePopup(e);
                if (this.mode === 'CheckBox') {
                    this.showOverAllClear();
                    this.inputFocus = true;
                    if (!this.overAllWrapper.classList.contains(FOCUS)) {
                        this.overAllWrapper.classList.add(FOCUS);
                    }
                }
            }
        }
        if (!(this.targetElement() && this.targetElement() !== '')) {
            e.preventDefault();
        }
        this.checkAndScrollParent();
        if (this.maximumSelectionLength === 0) {
            this.checkMaxSelection();
        }
    }
    private checkAndScrollParent(): void {
        let scrollElement: HTMLElement = this.overAllWrapper ? (this.overAllWrapper.parentElement as HTMLElement | null) : null;
        while (scrollElement) {
            const scrollElementStyle: CSSStyleDeclaration = getComputedStyle(scrollElement);
            const scrollElmentHeight: number = parseFloat(scrollElementStyle.maxHeight) || parseFloat(scrollElementStyle.height);
            if (!isNaN(scrollElmentHeight) && this.isPopupOpen()) {
                const overflowY: string = scrollElementStyle.overflowY;
                const wrapperBottom: number = this.overAllWrapper.getBoundingClientRect().bottom;
                const scrollElementBottom: number = scrollElement.getBoundingClientRect().bottom;
                if ((overflowY === 'auto' || overflowY === 'scroll') && wrapperBottom > scrollElementBottom) {
                    scrollElement.scrollTop += (wrapperBottom - scrollElementBottom) + 10;
                    return;
                }
            }
            scrollElement = scrollElement.parentElement;
        }
    }
    private enable(state: boolean): void {
        if (state) {
            this.overAllWrapper.classList.remove(DISABLED);
            this.inputElement.removeAttribute('disabled');
            attributes(this.inputElement, { 'aria-disabled': 'false' });
            this.ensureAriaDisabled('false');
        } else {
            this.overAllWrapper.classList.add(DISABLED);
            this.inputElement.setAttribute('disabled', 'true');
            attributes(this.inputElement, { 'aria-disabled': 'true' });
            this.ensureAriaDisabled('true');
        }
        if (this.enabled !== state) {
            this.enabled = state;
        }
        this.hidePopup();
    }
    private scrollFocusStatus: boolean = false;
    private keyDownStatus: boolean = false;
    private onBlurHandler(eve?: MouseEvent, isDocClickFromCheck?: boolean): void {
        let target: HTMLElement;
        if (this.isBlurDispatching && this.isAngular) {
            this.isBlurDispatching = false;
            return;
        }
        if (!isNullOrUndefined(eve)) {
            target = <HTMLElement>eve.relatedTarget;
        }
        if (this.popupObj && document.body.contains(this.popupObj.element) && this.popupObj.element.contains(target)) {
            if (this.mode !== 'CheckBox') {
                this.inputElement.focus();
            } else if ((this.floatLabelType === 'Auto' &&
            ((this.overAllWrapper.classList.contains('e-outline')) || (this.overAllWrapper.classList.contains('e-filled'))))) {
                addClass([this.overAllWrapper], 'e-valid-input');
            }
            return;
        }
        if (this.floatLabelType === 'Auto' && (this.overAllWrapper.classList.contains('e-outline')) && this.mode === 'CheckBox' &&
        ((isNullOrUndefined(this.value)) || this.value.length === 0)) {
            removeClass([this.overAllWrapper], 'e-valid-input');
        }
        if (this.mode === 'CheckBox' && Browser.isIE && !isNullOrUndefined(eve) && !isDocClickFromCheck) {
            this.inputFocus = false;
            this.overAllWrapper.classList.remove(FOCUS);
            return;
        }
        if (this.scrollFocusStatus) {
            if (!isNullOrUndefined(eve)) {
                eve.preventDefault();
            }
            this.inputElement.focus();
            this.scrollFocusStatus = false;
            return;
        }
        this.inputFocus = false;
        this.overAllWrapper.classList.remove(FOCUS);
        if (this.addTagOnBlur) {
            const dataChecks: string | boolean | number = this.getValueByText(this.inputElement.value, this.ignoreCase, this.ignoreAccent);
            const listLiElement: HTMLElement = this.findListElement(this.list, 'li', 'data-value', dataChecks);
            const className: string = this.hideSelectedItem ? HIDE_LIST : dropDownBaseClasses.selected;
            const allowChipAddition: boolean = (listLiElement && !listLiElement.classList.contains(className)) ? true : false;
            if (allowChipAddition) {
                this.updateListSelection(listLiElement, eve);
                if (this.mode === 'Delimiter') {
                    this.updateDelimeter(this.delimiterChar);
                }
            }
        }
        this.updateDataList();
        this.refreshListItems(null);
        if (this.mode !== 'Box' && this.mode !== 'CheckBox') {
            this.updateDelimView();
        }
        if (this.changeOnBlur) {
            this.updateValueState(eve, this.value, this.tempValues);
            this.dispatchEvent(this.hiddenElement as HTMLElement, 'change');
        }
        this.overAllClear.style.display = 'none';
        if (this.isPopupOpen()) {
            this.hidePopup(eve);
        }
        this.makeTextBoxEmpty();
        this.trigger('blur');
        this.focused = true;
        if (Browser.isDevice && this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
            this.removeChipFocus();
        }
        this.removeChipSelection();
        this.refreshInputHight();
        floatLabelBlur(
            this.overAllWrapper,
            this.componentWrapper,
            this.value,
            this.floatLabelType,
            this.placeholder
        );
        this.refreshPlaceHolder();
        if ((this.allowFiltering || (this.enableSelectionOrder === true && this.mode === 'CheckBox'))
            && !isNullOrUndefined(this.mainList)) {
            this.ulElement = this.mainList;
        }
        this.checkPlaceholderSize();
        if (this.element.querySelector('.e-multiselect .e-float-text-content') === null) {
            Input.createSpanElement(this.overAllWrapper, this.createElement);
        }
        this.calculateWidth();
        if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] &&
          this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
            this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
        this.isBlurDispatching = true;
        if (this.isAngular) {
            this.dispatchEvent(this.inputElement as HTMLElement, 'blur');
        }
    }
    private calculateWidth(): void {
        let elementWidth: number;
        if (this.overAllWrapper) {
            if (!this.showDropDownIcon || this.overAllWrapper.querySelector('.' + 'e-label-top')) {
                elementWidth = this.overAllWrapper.clientWidth - 2 * (parseInt(getComputedStyle(this.inputElement).paddingRight, 10));
            }
            else {
                const downIconWidth: number = this.dropIcon.offsetWidth +
                parseInt(getComputedStyle(this.dropIcon).marginRight, 10);
                elementWidth = this.overAllWrapper.clientWidth -
                 (downIconWidth + 2 * (parseInt(getComputedStyle(this.inputElement).paddingRight, 10)));
            }
            if (this.floatLabelType !== 'Never') {
                Input.calculateWidth(elementWidth, this.overAllWrapper, this.getModuleName());
            }
        }
    }
    private checkPlaceholderSize(): void {
        if (this.showDropDownIcon) {
            const downIconWidth: number = this.dropIcon.offsetWidth +
                parseInt(window.getComputedStyle(this.dropIcon).marginRight, 10);
            this.setPlaceholderSize(downIconWidth);
        } else {
            if (!isNullOrUndefined(this.dropIcon)) {
                this.setPlaceholderSize(this.showDropDownIcon ? this.dropIcon.offsetWidth : 0);
            }
        }
    }
    private setPlaceholderSize(downIconWidth: number): void {
        if (isNullOrUndefined(this.value) || this.value.length === 0) {
            if (this.dropIcon.offsetWidth !== 0) {
                this.searchWrapper.style.width = ('calc(100% - ' + (downIconWidth + 10)) + 'px';
            } else {
                addClass([this.searchWrapper], CUSTOM_WIDTH);
            }
        } else if (!isNullOrUndefined(this.value)) {
            this.searchWrapper.removeAttribute('style');
            removeClass([this.searchWrapper], CUSTOM_WIDTH);
        }
    }
    private refreshInputHight(): void {
        if (!isNullOrUndefined(this.searchWrapper)) {
            if ((!this.value || !this.value.length) && (isNullOrUndefined(this.text) || this.text === '')) {
                this.searchWrapper.classList.remove(ZERO_SIZE);
            } else {
                this.searchWrapper.classList.add(ZERO_SIZE);
            }
        }
    }
    private validateValues(newValue: string[] | number[] | boolean[] | object[],
                           oldValue: string[] | number[] | boolean[] | object[]): boolean {
        return JSON.stringify((newValue as string[]).slice().sort()) !== JSON.stringify((oldValue as string[]).slice().sort());
    }
    private updateValueState(
        event: KeyboardEventArgs | MouseEvent,
        newVal: string[] | number[] | boolean[] | object[],
        oldVal: string[] | number[] | boolean[] | object[]): void {
        const newValue: string[] | number[] | boolean[] | object[] = newVal ? newVal : <string[]>[];
        const oldValue: string[] | number[] | boolean[] | object[] = oldVal ? oldVal : <string[]>[];
        if (this.initStatus && this.validateValues(newValue, oldValue)) {
            const eventArgs: MultiSelectChangeEventArgs = {
                e: event,
                oldValue: this.allowObjectBinding ? oldVal : <string[]>oldVal,
                value: this.allowObjectBinding ? newVal : <string[]>newVal,
                isInteracted: event ? true : false,
                element: this.element,
                event: event
            };
            if (this.isAngular && this.preventChange) {
                this.preventChange = false;
            } else {
                this.trigger('change', eventArgs);
            }
            if (this.enableVirtualization && this.enableSelectionOrder && this.mode === 'CheckBox') {
                this.preventSetCurrentData = false;
            }
            this.updateTempValue();
            if (!this.changeOnBlur) {
                this.dispatchEvent(this.hiddenElement as HTMLElement, 'change');
            }
        }
        this.selectedValueInfo = this.viewPortInfo;
    }
    private updateTempValue(): void {
        if (!this.value) {
            this.tempValues = this.value;
        } else {
            this.tempValues = this.allowObjectBinding ? this.value.slice() : <string[]>this.value.slice();
        }
    }
    private updateAriaActiveDescendant(): void {
        if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
            attributes(this.inputElement, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
        }
    }

    private pageUpSelection(steps: number, isVirtualKeyAction?: boolean): void {
        const collection: NodeListOf<Element> =
            <NodeListOf<HTMLElement>>this.list.querySelectorAll(
                'li.' + dropDownBaseClasses.li +
                ':not(.' + HIDE_LIST + ')' +
                ':not(.e-reorder-hide)'
            );
        let previousItem: Element = steps >= 0 ? collection[steps + 1] : collection[0];
        if (this.fields.disabled && previousItem && !this.enableVirtualization) {
            while (previousItem && (previousItem.classList.contains('e-disabled') || previousItem.classList.contains(HIDE_LIST) ||
            previousItem.classList.contains('.e-reorder-hide') || previousItem.classList.contains('e-list-group-item'))) {
                previousItem = (previousItem as any).previousElementSibling;
            }

            if (!previousItem) {
                return;
            }
        }
        if (this.enableVirtualization && isVirtualKeyAction) {
            previousItem = (this.liCollections.length >= steps && steps >= 0)
                ? this.liCollections[steps as number]
                : this.liCollections[this.skeletonCount];
        }
        if (!isNullOrUndefined(previousItem) && previousItem.classList.contains('e-virtual-list')) {
            previousItem = this.liCollections[this.skeletonCount];
        }
        if (this.enableVirtualization) {
            if (!isNullOrUndefined(previousItem) && !previousItem.classList.contains('e-item-focus')) {
                this.isKeyBoardAction = true;
                this.addListFocus(<HTMLElement>previousItem);
                this.scrollTop(
                    <HTMLElement>previousItem,
                    this.getIndexByValue(previousItem.getAttribute('data-value')),
                    this.keyboardEvent.keyCode
                );
            }
            else if (this.viewPortInfo.startIndex === 0) {
                this.isKeyBoardAction = true;
                this.scrollTop(
                    <HTMLElement>previousItem,
                    this.getIndexByValue(previousItem.getAttribute('data-value')),
                    this.keyboardEvent.keyCode
                );
            }
            this.previousFocusItem = <HTMLElement>previousItem;
        }
        else {
            this.isKeyBoardAction = true;
            this.addListFocus(<HTMLElement>previousItem);
            this.scrollTop(
                <HTMLElement>previousItem,
                this.getIndexByValue(previousItem.getAttribute('data-value')),
                this.keyboardEvent.keyCode
            );
        }
    }

    private pageDownSelection(steps: number, isVirtualKeyAction?: boolean): void {
        const list: Element[] = this.getItems();
        const collection: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list-end)');
        let previousItem: Element = steps <= collection.length ? collection[steps - 1] : collection[collection.length - 1];
        if (this.fields.disabled && previousItem && !this.enableVirtualization) {
            while (previousItem && (previousItem.classList.contains('e-disabled') || previousItem.classList.contains(HIDE_LIST) ||
                previousItem.classList.contains('.e-reorder-hide') || previousItem.classList.contains('e-list-group-item'))) {
                previousItem = (previousItem as any).nextElementSibling;
            }

            if (!previousItem) {
                return;
            }
        }
        if (this.enableVirtualization && this.skeletonCount > 0) {
            previousItem = steps < list.length ? this.liCollections[steps as number] : this.liCollections[list.length - 1];
        }
        if (this.enableVirtualization && isVirtualKeyAction) {
            previousItem = steps <= list.length ? this.liCollections[steps as number] : this.liCollections[list.length - 1];
        }
        if (this.enableVirtualization && previousItem && previousItem.classList.contains('e-virtual-list-end')) {
            previousItem = collection[collection.length - 1];
        }
        this.isKeyBoardAction = true;
        this.addListFocus(<HTMLElement>previousItem);
        this.previousFocusItem = <HTMLElement>previousItem;
        this.scrollBottom(
            <HTMLElement>previousItem,
            this.getIndexByValue(previousItem.getAttribute('data-value')),
            false, this.keyboardEvent.keyCode
        );
    }
    public getItems(): Element[] {
        if (!this.list) {
            super.render();
        }
        return this.ulElement && (<HTMLElement[] & NodeListOf<Element>>
            this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li)).length > 0 ?
            <HTMLElement[] & NodeListOf<Element>>this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')') : [];

    }
    private focusInHandler(e?: FocusEvent | MouseEvent | KeyboardEvent | TouchEvent): boolean {
        if (this.enabled) {
            this.showOverAllClear();
            this.inputFocus = true;
            if (this.value && this.value.length) {
                if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
                    this.chipCollectionWrapper.style.display = '';
                } else {
                    this.showDelimWrapper();
                }
                if (this.mode !== 'CheckBox') {
                    this.viewWrapper.style.display = 'none';
                }
            }
            if (this.mode !== 'CheckBox') {
                this.searchWrapper.classList.remove(ZERO_SIZE);
            }
            this.checkPlaceholderSize();
            if (this.focused) {
                const args: FocusEventArgs = { isInteracted: e ? true : false, event: e };
                this.trigger('focus', args);
                this.focused = false;
            }
            if (!this.overAllWrapper.classList.contains(FOCUS)) {
                this.overAllWrapper.classList.add(FOCUS);
            }
            floatLabelFocus(this.overAllWrapper, this.componentWrapper);
            if (this.isPopupOpen()) {
                this.refreshPopup();
            }
            if (this.allowResize) {
                this.setResize();
            }
            setTimeout(() => {
                this.calculateWidth();
            }, 150);
            return true;
        } else {
            return false;
        }
    }
    private showDelimWrapper(): void {
        if (this.mode === 'CheckBox') {
            this.viewWrapper.style.display = '';
        } else {
            this.delimiterWrapper.style.display = '';
        }
        this.componentWrapper.classList.add(DELIMITER_VIEW_WRAPPER);
    }
    private hideDelimWrapper(): void {
        this.delimiterWrapper.style.display = 'none';
        this.componentWrapper.classList.remove(DELIMITER_VIEW_WRAPPER);
    }
    private expandTextbox(): void {
        let size: number = 5;
        if (this.placeholder) {
            const codePoint: number = this.placeholder.charCodeAt(0);
            const sizeMultiplier: number = (0xAC00 <= codePoint && codePoint <= 0xD7AF) ? 1.5
                : (0x4E00 <= codePoint && codePoint <= 0x9FFF) ? 2 : 1;
            size = size > this.inputElement.placeholder.length ? size : this.inputElement.placeholder.length * sizeMultiplier;
        }
        if (this.inputElement.value.length > size) {
            this.inputElement.size = this.inputElement.value.length;
        } else {
            this.inputElement.size = size;
        }
    }
    private isPopupOpen(): boolean {
        return ((this.popupWrapper !== null) && (this.popupWrapper.parentElement !== null));
    }
    private refreshPopup(): void {
        if (this.popupObj && this.mobFilter) {
            this.popupObj.setProperties({ width: this.calcPopupWidth() });
            this.popupObj.refreshPosition(this.overAllWrapper);
            this.popupObj.resolveCollision();
        }
    }
    private checkTextLength(): boolean {
        return this.targetElement().length < 1;
    }
    private popupKeyActions(e: KeyboardEventArgs): void {
        switch (e.keyCode) {
        case 38:
            this.hidePopup(e);
            if (this.mode === 'CheckBox') {
                this.inputElement.focus();
            }
            e.preventDefault();
            break;
        case 40:
            if (!this.isPopupOpen()) {
                this.showPopup(e);
                e.preventDefault();
            }
            break;
        }
    }

    protected updatePopupPosition(): void {
        this.refreshPopup();
    }

    private updateAriaAttribute(): void {
        const focusedItem: HTMLElement = <HTMLElement>this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (!isNullOrUndefined(focusedItem)) {
            this.inputElement.setAttribute('aria-activedescendant', focusedItem.id);
            if (this.allowFiltering){
                const filterInput: Element = this.popupWrapper.querySelector('.' + FILTERINPUT);
                if (filterInput)
                {
                    filterInput.setAttribute('aria-activedescendant', focusedItem.id);
                }
            }
            else if (this.mode === 'CheckBox'){
                this.overAllWrapper.setAttribute('aria-activedescendant', focusedItem.id);
            }
        }
    }

    private homeNavigation(isHome: boolean, isVirtualKeyAction?: boolean): void {
        this.removeFocus();
        if (this.enableVirtualization){
            if (isHome) {
                if (this.enableVirtualization && this.viewPortInfo.startIndex !== 0) {
                    this.viewPortInfo.startIndex = 0;
                    this.viewPortInfo.endIndex = this.itemCount;
                    this.updateVirtualItemIndex();
                    this.resetList(this.dataSource, this.fields, this.query);
                }
            } else {
                if (this.enableVirtualization && (( !this.value && this.viewPortInfo.endIndex !== this.totalItemCount) ||
                   (this.value && this.value.length > 0 && this.viewPortInfo.endIndex !== this.totalItemCount + this.value.length))){
                    this.viewPortInfo.startIndex = this.totalItemCount - this.itemCount;
                    this.viewPortInfo.endIndex = this.totalItemCount;
                    this.updateVirtualItemIndex();
                    let query: Query = new Query().clone();
                    if (this.value && this.value.length > 0) {
                        query = this.getForQuery(this.value).clone();
                        query = query.skip(this.totalItemCount - this.itemCount);
                    }
                    this.resetList(this.dataSource, this.fields, query);
                }
            }
        }
        this.UpdateSkeleton();
        const scrollEle: NodeListOf<HTMLElement> = this.ulElement.querySelectorAll('li.' + dropDownBaseClasses.li
        + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        if (scrollEle.length > 0) {
            let element: HTMLElement = scrollEle[(isHome) ? 0 : (scrollEle.length - 1)];
            if (this.enableVirtualization && isHome)
            {
                element = scrollEle[this.skeletonCount];
            }
            this.removeFocus();
            element.classList.add(dropDownBaseClasses.focus);
            if (this.enableVirtualization && isHome) {
                this.scrollTop(element, undefined, this.keyboardEvent.keyCode);
            } else if (!isVirtualKeyAction) {
                this.scrollBottom(element, undefined, false, this.keyboardEvent.keyCode);
            }
            this.updateAriaActiveDescendant();
        }
    }

    private updateSelectionList(): void {
        if (!isNullOrUndefined(this.value) && this.value.length) {
            for (let index: number = 0; index < this.value.length; index++) {
                const value: string | number | boolean = this.allowObjectBinding ?
                    getValue(((this.fields.value) ? this.fields.value : ''), this.value[index as number]) : this.value[index as number];
                const selectedItem: HTMLElement | Element = this.getElementByValue(value);
                if (selectedItem && !selectedItem.classList.contains(dropDownBaseClasses.selected)) {
                    selectedItem.classList.add('e-active');
                }
            }
        }
    }

    protected handleVirtualKeyboardActions(e: KeyboardEventArgs, pageCount: number): void {
        const focusedItem: Element = this.list.querySelector('.' + dropDownBaseClasses.focus);
        let activeIndex: number;
        this.isKeyBoardAction = true;
        switch (e.keyCode) {
        case 40:
            this.arrowDown(e, true);
            break;
        case 38:
            this.arrowUp(e, true);
            break;
        case 33:
            e.preventDefault();
            if (focusedItem) {
                activeIndex = this.getIndexByValue(this.previousFocusItem.getAttribute('data-value')) - 1;
                this.pageUpSelection(activeIndex, true);
                this.updateAriaAttribute();
            }
            break;
        case 34:
            e.preventDefault();
            if (focusedItem) {
                activeIndex = this.getIndexByValue(this.previousFocusItem.getAttribute('data-value'));
                this.pageDownSelection(activeIndex, true);
                this.updateAriaAttribute();
            }
            break;
        case 35:
        case 36:
            this.isMouseScrollAction = true;
            this.homeNavigation((e.keyCode === 36) ? true : false, true);
            this.isPreventScrollAction = true;
            break;
        }
        this.keyboardEvent = null;
        this.isScrollChanged = true;
        this.isKeyBoardAction = false;
    }

    private onKeyDown(e: KeyboardEventArgs): void {
        if (this.readonly || !this.enabled && this.mode !== 'CheckBox') {
            return;
        }
        this.preventSetCurrentData = false;
        this.keyboardEvent = e;
        if (this.isPreventKeyAction && this.enableVirtualization) {
            e.preventDefault();
        }
        this.keyCode = e.keyCode;
        this.keyDownStatus = true;
        if (e.keyCode > 111 && e.keyCode < 124) {
            return;
        }
        if (e.altKey) {
            this.popupKeyActions(e);
            return;
        } else if (this.isPopupOpen()) {
            const focusedItem: Element = this.list.querySelector('.' + dropDownBaseClasses.focus);
            let activeIndex: number;
            switch (e.keyCode) {
            case 36:
            case 35:
                this.isMouseScrollAction = true;
                this.isKeyBoardAction = true;
                this.homeNavigation((e.keyCode === 36) ? true : false);
                break;
            case 33:
                e.preventDefault();
                if (focusedItem) {
                    activeIndex = this.getIndexByValue(focusedItem.getAttribute('data-value'));
                    this.pageUpSelection(activeIndex - this.getPageCount() - 1);
                    this.updateAriaAttribute();
                }
                return;
            case 34:
                e.preventDefault();
                if (focusedItem) {
                    activeIndex = this.getIndexByValue(focusedItem.getAttribute('data-value'));
                    this.pageDownSelection(activeIndex + this.getPageCount());
                    this.updateAriaAttribute();
                }
                return;
            case 38:
                this.isKeyBoardAction = true;
                this.arrowUp(e);
                break;
            case 40:
                this.isKeyBoardAction = true;
                this.arrowDown(e);
                break;
            case 27:
                e.preventDefault();
                this.isKeyBoardAction = true;
                this.hidePopup(e);
                if (this.mode === 'CheckBox') {
                    this.inputElement.focus();
                }
                this.isKeyBoardAction = false;
                return;
            case 13:
                e.preventDefault();
                this.isKeyBoardAction = true;
                if (this.mode !== 'CheckBox') {
                    this.selectByKey(e);
                }
                this.checkPlaceholderSize();
                this.isKeyBoardAction = false;
                return;
            case 32:
                this.isKeyBoardAction = true;
                this.spaceKeySelection(e);
                this.isKeyBoardAction = false;
                return;
            case 9:
                e.preventDefault();
                this.isKeyBoardAction = true;
                this.hidePopup(e);
                this.inputElement.focus();
                this.overAllWrapper.classList.add(FOCUS);
            }
        } else {
            switch (e.keyCode) {
            case 13:
            case 9:
            case 16:
            case 17:
            case 20:
                return;
            case 40:
                if (this.openOnClick) {
                    this.showPopup();
                }
                break;
            case 27:
                e.preventDefault();
                this.escapeAction();
                return;
            }
        }
        if (this.checkTextLength()) {
            this.keyNavigation(e);
        }
        if (this.mode === 'CheckBox' && this.enableSelectionOrder) {
            if (this.allowFiltering) {
                this.previousFilterText = this.targetElement();
            }
            this.checkBackCommand(e);
        }
        this.expandTextbox();
        if (!(this.mode === 'CheckBox' && this.showSelectAll)) {
            this.refreshPopup();
        }
        if (this.allowResize) {
            this.setResize();
        }
        this.isKeyBoardAction = false;
    }
    private arrowDown(e: KeyboardEventArgs, isVirtualKeyAction?: boolean): void {
        e.preventDefault();
        this.moveByList(1, isVirtualKeyAction);
        this.keyAction = true;
        if (document.activeElement.classList.contains(FILTERINPUT)
        || (this.mode === 'CheckBox' && !this.allowFiltering && document.activeElement !== this.list)) {
            EventHandler.add(this.list, 'keydown', this.onKeyDown, this);
        }
        this.updateAriaAttribute();
    }
    private arrowUp(e: KeyboardEventArgs, isVirtualKeyAction?: boolean): void {
        e.preventDefault();
        this.keyAction = true;
        let list: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li
            + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            list = this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li + ',li.' + dropDownBaseClasses.group
            + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        }
        const focuseElem: Element = <HTMLElement>this.list.querySelector('li.' + dropDownBaseClasses.focus);
        this.focusFirstListItem = !isNullOrUndefined(this.liCollections[0]) ? this.liCollections[0].classList.contains('e-item-focus') :
            false;
        if (this.list && this.list.querySelector('.e-list-parent.e-ul.e-reorder')) {
            const elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list-end)');
            if (elements.length > 0) {
                this.focusFirstListItem = !isNullOrUndefined(elements[0]) ? elements[0].classList.contains('e-item-focus') :
                    false;
            }
        }
        const index: number = Array.prototype.slice.call(list).indexOf(focuseElem);
        if (index <= 0 && (this.mode === 'CheckBox' && this.allowFiltering)) {
            this.keyAction = false;
            this.notify('inputFocus', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'focus' });
        }
        this.moveByList(-1, isVirtualKeyAction);
        this.updateAriaAttribute();
    }
    private spaceKeySelection(e: KeyboardEventArgs): void {
        if (this.mode === 'CheckBox') {
            const li: HTMLElement = <HTMLElement>this.list.querySelector('li.' + dropDownBaseClasses.focus);
            const selectAllParent: Element = document.getElementsByClassName('e-selectall-parent')[0];
            if (!isNullOrUndefined(li) || (selectAllParent && selectAllParent.classList.contains('e-item-focus'))) {
                e.preventDefault();
                this.keyAction = true;
            }
            this.selectByKey(e);
            if (this.keyAction){
                const li: HTMLElement = <HTMLElement>this.list.querySelector('li.' + dropDownBaseClasses.focus);
                if (!isNullOrUndefined(li) && selectAllParent && selectAllParent.classList.contains('e-item-focus')){
                    li.classList.remove('e-item-focus');
                }
            }
        }
        this.checkPlaceholderSize();
    }
    private checkBackCommand(e: KeyboardEventArgs): void {
        if (e.keyCode === 8 && this.allowFiltering ? this.targetElement() !== this.previousFilterText : this.targetElement() === '') {
            this.backCommand = false;
        } else {
            this.backCommand = true;
        }
    }
    private keyNavigation(e: KeyboardEventArgs): void {
        if ((this.mode !== 'Delimiter' && this.mode !== 'CheckBox') && this.value && this.value.length) {
            switch (e.keyCode) {
            case 37: //left arrow
                e.preventDefault();
                this.moveBy(-1, e);
                break;
            case 39: //right arrow
                e.preventDefault();
                this.moveBy(1, e);
                break;
            case 8:
                this.removelastSelection(e);
                break;
            case 46: //del
                this.removeSelectedChip(e);
                break;
            }
        } else if (e.keyCode === 8 && this.mode === 'Delimiter') {
            if (this.value && this.value.length) {
                e.preventDefault();
                const temp: string | number | boolean = this.allowObjectBinding ?
                    getValue(((this.fields.value) ? this.fields.value : ''), this.value[this.value.length - 1]) :
                    this.value[this.value.length - 1];
                this.removeValue(this.value[this.value.length - 1], e);
                this.updateDelimeter(this.delimiterChar, e);
                this.focusAtLastListItem(<string>temp);
            }
        }
    }
    private selectByKey(e: KeyboardEventArgs): void {
        this.removeChipSelection();
        this.selectListByKey(e);
        if (this.hideSelectedItem) {
            this.focusAtFirstListItem();
        }
    }
    private escapeAction(): void {
        let temp: string[] | number[] | object[] = this.tempValues ? <string[]>this.tempValues.slice() : <string[]>[];
        if (this.allowObjectBinding) {
            temp = this.tempValues ? this.tempValues.slice() as (number[] | string[] | object[]) : [];
        }
        if (this.value && this.validateValues(this.value, temp)) {
            if (this.mode !== 'CheckBox') {
                this.value = temp;
                if (this.allowFiltering || this.allowCustomValue) {
                    this.refreshListItems(null);
                }
                this.initialValueUpdate();
            }
            if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
                this.chipCollectionWrapper.style.display = '';
            } else {
                this.showDelimWrapper();
            }
            this.refreshPlaceHolder();
            if (this.value.length) {
                this.showOverAllClear();
            } else {
                this.hideOverAllClear();
            }
        }
        this.makeTextBoxEmpty();
    }
    private scrollBottom(
        selectedLI: HTMLElement,
        activeIndex?: number,
        isInitialSelection: boolean = false,
        keyCode: number = null,
        isInitial: boolean = false
    ): void {
        if (
            (!isNullOrUndefined(selectedLI) && selectedLI.classList.contains('e-virtual-list')) ||
            (this.enableVirtualization && isNullOrUndefined(selectedLI))
        ) {
            selectedLI = this.liCollections[this.skeletonCount];
        }
        const selectedListMargin: number = selectedLI && !isNaN(parseInt(window.getComputedStyle(selectedLI).marginBottom, 10)) ?
            parseInt(window.getComputedStyle(selectedLI).marginBottom, 10) : 0;
        this.isUpwardScrolling = false;
        const virtualListCount: number = this.list.querySelectorAll('.e-virtual-list:not(.e-virtual-list-end)').length;
        const liItems: NodeListOf<Element> = this.list.querySelectorAll('li:not(.e-virtual-list-end)');
        const lastElementValue: string = liItems && liItems.length > 0 && liItems[liItems.length - 1] ?
            liItems[liItems.length - 1].getAttribute('data-value') : null;
        const selectedLiOffsetTop: number = this.virtualListInfo  && this.virtualListInfo.startIndex ?
            selectedLI.offsetTop + (this.virtualListInfo.startIndex * (selectedLI.offsetHeight + selectedListMargin))
            : selectedLI.offsetTop;
        const currentOffset: number = this.list.offsetHeight;
        const nextBottom: number = selectedLiOffsetTop - (virtualListCount * (selectedLI.offsetHeight + selectedListMargin)) +
        (selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop;
        const nextOffset: number = this.list.scrollTop + nextBottom - currentOffset;
        let isScrollerCHanged: boolean = false;
        let isScrollTopChanged: boolean = false;
        let boxRange: number = selectedLiOffsetTop - (virtualListCount * (selectedLI.offsetHeight + selectedListMargin)) +
            (selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop;
        boxRange = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
            boxRange - this.fixedHeaderElement.offsetHeight : boxRange;
        if (activeIndex === 0 && !this.enableVirtualization) {
            this.list.scrollTop = 0;
        } else if (nextBottom > currentOffset || !(boxRange > 0 && this.list.offsetHeight > boxRange)) {
            const currentElementValue: string = selectedLI ? selectedLI.getAttribute('data-value') : null;
            const liCount: number = keyCode === 34 ? this.getPageCount() - 1 : 1;
            if (!this.enableVirtualization || this.isKeyBoardAction || isInitialSelection) {
                if (this.isKeyBoardAction && this.enableVirtualization && lastElementValue &&
                    currentElementValue === lastElementValue && keyCode !== 35  && !this.isVirtualScrolling) {
                    this.isPreventKeyAction = true;
                    this.list.scrollTop += (selectedLI.offsetHeight + selectedListMargin) * liCount;
                    this.isPreventKeyAction = this.isScrollerAtEnd() ? false : this.isPreventKeyAction;
                    this.isKeyBoardAction = false;
                    this.isPreventScrollAction = false;
                }
                else if (this.enableVirtualization && keyCode === 35) {
                    this.isPreventKeyAction = false;
                    this.isKeyBoardAction = false;
                    this.isPreventScrollAction = false;
                    this.list.scrollTop = this.list.scrollHeight;

                } else {
                    if (keyCode === 34 && this.enableVirtualization && !this.isVirtualScrolling) {
                        this.isPreventKeyAction = false;
                        this.isKeyBoardAction = false;
                        this.isPreventScrollAction = false;
                    }
                    this.list.scrollTop = nextOffset;
                }
            }
            else {
                this.list.scrollTop = this.virtualListInfo && this.virtualListInfo.startIndex ?
                    isInitial && this.virtualListInfo.startIndex ? this.virtualListInfo.startIndex * this.listItemHeight +
                        (this.listItemHeight * 2) : this.virtualListInfo.startIndex * this.listItemHeight : 0;
            }
            isScrollerCHanged = this.isKeyBoardAction;
            isScrollTopChanged = true;
        }
        this.isKeyBoardAction = isScrollerCHanged;
    }
    private scrollTop(selectedLI: HTMLElement, activeIndex: number, keyCode: number = null): void {
        const virtualListCount: number = this.list.querySelectorAll('.e-virtual-list:not(.e-virtual-list-end)').length;
        const selectedListMargin: number = selectedLI && !isNaN(parseInt(window.getComputedStyle(selectedLI).marginBottom, 10)) ?
            parseInt(window.getComputedStyle(selectedLI).marginBottom, 10) : 0;
        const selectedLiOffsetTop: number = (this.virtualListInfo && this.virtualListInfo.startIndex) ?
            selectedLI.offsetTop + (this.virtualListInfo.startIndex * (selectedLI.offsetHeight + selectedListMargin)) :
            selectedLI.offsetTop;
        let nextOffset: number = selectedLiOffsetTop - (virtualListCount * (selectedLI.offsetHeight +
            selectedListMargin)) - this.list.scrollTop;
        const firstElementValue: string = this.list.querySelector('li.e-list-item:not(.e-virtual-list)') ?
            this.list.querySelector('li.e-list-item:not(.e-virtual-list)').getAttribute('data-value') : null;
        nextOffset = this.fields.groupBy && !isUndefined(this.fixedHeaderElement) ?
            nextOffset - this.fixedHeaderElement.offsetHeight : nextOffset;
        const boxRange: number = (selectedLiOffsetTop - (virtualListCount * (selectedLI.offsetHeight + selectedListMargin)) +
            (selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop);
        const isPageUpKeyAction: boolean = this.enableVirtualization && this.getModuleName() === 'autocomplete' && nextOffset <= 0 ;
        if (activeIndex === 0 && !this.enableVirtualization) {
            this.list.scrollTop = 0;
        } else if (nextOffset < 0 || isPageUpKeyAction) {
            const currentElementValue: string = selectedLI ? selectedLI.getAttribute('data-value') : null;
            const liCount: number = keyCode === 33 ? this.getPageCount() - 2 : 1;
            if (this.enableVirtualization && this.isKeyBoardAction && firstElementValue &&
                currentElementValue === firstElementValue && keyCode !== 36  && !this.isVirtualScrolling) {
                this.isUpwardScrolling = true;
                this.isPreventKeyAction = true;
                this.isKeyBoardAction = false;
                this.list.scrollTop -= (selectedLI.offsetHeight + selectedListMargin) * liCount;
                this.isPreventKeyAction = this.list.scrollTop !== 0 ? this.isPreventKeyAction : false;
                this.isPreventScrollAction = false;
            }
            else if (this.enableVirtualization && keyCode === 36) {
                this.isPreventScrollAction = false;
                this.isPreventKeyAction = true;
                this.isKeyBoardAction = false;
                this.list.scrollTo(0, 0);
            }
            else {
                if (keyCode === 33 && this.enableVirtualization && !this.isVirtualScrolling) {
                    this.isPreventKeyAction = false;
                    this.isKeyBoardAction = false;
                    this.isPreventScrollAction = false;
                }
                this.list.scrollTop = this.list.scrollTop + nextOffset;
            }
        } else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
            this.list.scrollTop = selectedLI.offsetTop - (this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                this.fixedHeaderElement.offsetHeight : 0);
        }
    }

    private isScrollerAtEnd(): boolean {
        return this.list && this.list.scrollTop + this.list.clientHeight >= this.list.scrollHeight;
    }

    private selectListByKey(e: KeyboardEventArgs): void {
        const li: HTMLElement = <HTMLElement>this.list.querySelector('li.' + dropDownBaseClasses.focus);
        let limit: number = this.value && this.value.length ? this.value.length : 0;
        let target : HTMLElement;
        if (li !== null) {
            e.preventDefault();
            if (li.classList.contains('e-active')) {
                limit = limit - 1;
            }
            if (this.isValidLI(li) && limit < this.maximumSelectionLength) {
                this.updateListSelection(li, e);
                this.addListFocus(<HTMLElement>li);
                if (this.mode === 'CheckBox') {
                    this.updateDelimView();
                    this.updateDelimeter(this.delimiterChar, e);
                    this.refreshInputHight();
                    this.checkPlaceholderSize();
                    if (this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                        (target as Element) = li.firstElementChild.lastElementChild;
                        this.findGroupStart(target);
                        this.deselectHeader();
                    }
                } else {
                    this.updateDelimeter(this.delimiterChar, e);
                }
                const isFilterData: boolean = this.targetElement().trim() !== '' ? true : false;
                this.makeTextBoxEmpty();
                if (this.mode !== 'CheckBox') {
                    this.refreshListItems(li.textContent, isFilterData);
                }
                if (!this.changeOnBlur) {
                    this.updateValueState(e, this.value, this.tempValues);
                }
                this.refreshPopup();
            }else {
                if (!this.isValidLI(li) && limit < this.maximumSelectionLength) {
                    (target as Element) = li.firstElementChild.lastElementChild;
                    if (target.classList.contains('e-check')) {
                        this.selectAllItem(false, e, li);
                    } else {
                        this.selectAllItem(true, e, li);
                    }
                }
            }
            this.refreshSelection();
            if (this.closePopupOnSelect) {
                this.hidePopup(e);
            }
        }
        const selectAllParent: Element = document.getElementsByClassName('e-selectall-parent')[0];
        if (selectAllParent && selectAllParent.classList.contains('e-item-focus')) {
            const selectAllCheckBox: HTMLElement = selectAllParent.childNodes[0] as HTMLElement;
            if (!selectAllCheckBox.classList.contains('e-check')) {
                selectAllCheckBox.classList.add('e-check');
                const args: { module: string, enable: boolean, value: string, name: string } = {
                    module: 'CheckBoxSelection',
                    enable: this.mode === 'CheckBox',
                    value: 'check',
                    name: 'checkSelectAll'
                };
                this.notify('checkSelectAll', args);
                this.selectAllItem(true, e, li);
            } else {
                selectAllCheckBox.classList.remove('e-check');
                const args: { module: string, enable: boolean, value: string, name: string } = {
                    module: 'CheckBoxSelection',
                    enable: this.mode === 'CheckBox',
                    value: 'check',
                    name: 'checkSelectAll'
                };
                this.notify('checkSelectAll', args);
                this.selectAllItem(false, e, li);
            }
        }
        this.refreshPlaceHolder();
    }
    private refreshListItems(data: string, isFilterData?: boolean): void {
        if ((this.allowFiltering || (this.mode === 'CheckBox' && this.enableSelectionOrder === true)
            || this.allowCustomValue) && this.mainList && this.listData) {
            const list: HTMLElement = this.mainList.cloneNode ? <HTMLElement>this.mainList.cloneNode(true) : this.mainList;
            if (this.enableVirtualization) {
                if (this.allowCustomValue && this.virtualCustomData && data == null && this.virtualCustomData &&
                    this.viewPortInfo && this.viewPortInfo.startIndex === 0 && this.viewPortInfo.endIndex === this.itemCount) {
                    this.virtualCustomData = null;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.renderItems(this.mainData as any[], this.fields);
                }
                else {
                    if (this.allowFiltering && isFilterData) {
                        this.updateInitialData();
                        this.onActionComplete(list, this.mainData);
                        this.isVirtualTrackHeight = false;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (this.list.getElementsByClassName('e-virtual-ddl')[0] as any) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (this.list.getElementsByClassName('e-virtual-ddl')[0] as any).style = this.GetVirtualTrackHeight();
                        }
                        else if (!this.list.querySelector('.e-virtual-ddl') && this.skeletonCount > 0) {
                            const virualElement: any = this.createElement('div', {
                                id: this.element.id + '_popup',
                                className: 'e-virtual-ddl'
                            });
                            virualElement.style.cssText = this.GetVirtualTrackHeight();
                            this.popupWrapper.querySelector('.e-dropdownbase').appendChild(virualElement);
                        }
                    }
                    else{
                        this.onActionComplete(this.list, this.listData);
                    }
                }
            }
            else{
                this.onActionComplete(list, this.mainData);
            }
            this.focusAtLastListItem(data);
            if (this.value && this.value.length) {
                this.refreshSelection();
            }
        }
        else if (!isNullOrUndefined(this.fields.groupBy) && this.value && this.value.length){
            this.refreshSelection();
        }
    }
    private removeSelectedChip(e: KeyboardEventArgs): void {
        const selectedElem: Element = <HTMLElement>this.chipCollectionWrapper.querySelector('span.' + CHIP_SELECTED);
        let temp: Element;
        if (selectedElem !== null) {
            if (!isNullOrUndefined(this.value)) {
                this.tempValues = this.allowObjectBinding ? this.value.slice() : <string[]>this.value.slice();
            }
            temp = selectedElem.nextElementSibling;
            if (temp !== null) {
                this.removeChipSelection();
                this.addChipSelection(temp, e);
            }
            const currentChip: string | number | boolean | object = this.allowObjectBinding ?
                this.getDataByValue(this.getFormattedValue(selectedElem.getAttribute('data-value'))) :
                selectedElem.getAttribute('data-value');
            this.removeValue(currentChip, e);
            this.updateDelimeter(this.delimiterChar, e);
            this.makeTextBoxEmpty();
        }
        if (this.closePopupOnSelect) {
            this.hidePopup(e);
        }
        this.checkPlaceholderSize();
    }
    private moveByTop(state: boolean): void {
        const elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.' + dropDownBaseClasses.li);
        let index: number;
        if (elements.length > 1) {
            this.removeFocus();
            index = state ? 0 : (elements.length - 1);
            this.addListFocus(<HTMLElement>elements[index as number]);
            this.scrollBottom(<HTMLElement>elements[index as number], index);
        }
        this.updateAriaAttribute();
    }
    private clickHandler(e: MouseEvent): void {
        const targetElement: HTMLElement = e.target as HTMLElement;
        const filterInputClassName: string = targetElement.className;
        const selectAllParent: Element  = document.getElementsByClassName('e-selectall-parent')[0];
        if ((filterInputClassName === 'e-input-filter e-input' ||
            filterInputClassName === 'e-input-group e-control-wrapper e-input-focus') &&
            selectAllParent.classList.contains('e-item-focus')) {
            selectAllParent.classList.remove('e-item-focus');
        }
    }
    private moveByList(position: number, isVirtualKeyAction?: boolean): void {
        if (this.list) {
            let elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list-end)');
            if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                elements = this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li + ',li.' + dropDownBaseClasses.group
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list-end)');
            }
            let selectedElem: Element = <HTMLElement>this.list.querySelector('li.' + dropDownBaseClasses.focus);
            if (this.enableVirtualization && isVirtualKeyAction && !isNullOrUndefined(this.currentFocuedListElement)){
                selectedElem = this.getElementByValue(this.getFormattedValue(this.currentFocuedListElement.getAttribute('data-value')));
            }
            let temp: number = -1;
            const selectAllParent: Element = document.getElementsByClassName('e-selectall-parent')[0];
            if (this.mode === 'CheckBox' && this.showSelectAll && position === 1 && !isNullOrUndefined(selectAllParent) &&
                !selectAllParent.classList.contains('e-item-focus') && this.list.getElementsByClassName('e-item-focus').length === 0 &&
                 this.liCollections.length > 1){
                if (!this.focusFirstListItem && selectAllParent.classList.contains('e-item-focus')) {
                    selectAllParent.classList.remove('e-item-focus');
                }
                else if (!selectAllParent.classList.contains('e-item-focus')){
                    selectAllParent.classList.add('e-item-focus');
                }
            }
            else if (elements.length) {
                if (this.mode === 'CheckBox' && this.showSelectAll && !isNullOrUndefined(selectAllParent && position === -1)){
                    if ((!this.focusFirstListItem || position === 1) && selectAllParent.classList.contains('e-item-focus')) {
                        selectAllParent.classList.remove('e-item-focus');
                    }
                    else if (this.focusFirstListItem && !selectAllParent.classList.contains('e-item-focus') && !(position === 1 && this.list.querySelector('.e-item-focus'))) {
                        selectAllParent.classList.add('e-item-focus');
                    }
                }

                for (let index: number = 0; index < elements.length; index++) {
                    if (elements[index as number] === selectedElem) {
                        temp = index;
                        break;
                    }
                }
                if (position > 0) {
                    if (temp < (elements.length - 1)) {
                        this.removeFocus();
                        if (this.enableVirtualization && isVirtualKeyAction){
                            this.addListFocus(<HTMLElement>elements[temp as number]);
                        }
                        else{
                            if (this.enableVirtualization && (<HTMLElement>elements[temp + 1]).classList.contains('e-virtual-list')) {
                                this.addListFocus(<HTMLElement>elements[this.skeletonCount]);
                            } else {
                                this.addListFocus(<HTMLElement>elements[++temp]);
                            }
                        }
                        if (temp > -1) {
                            this.updateCheck(elements[temp as number]);
                            this.scrollBottom(<HTMLElement>elements[temp as number], temp);
                            this.currentFocuedListElement = elements[temp as number] as HTMLElement;
                        }
                    }
                } else {
                    if (temp > 0) {
                        if (this.enableVirtualization) {
                            const isVirtualElement: boolean = (<HTMLElement>elements[temp - 1]).classList.contains('e-virtual-list');
                            const elementIndex: number = isVirtualKeyAction ? temp : temp - 1;
                            if (isVirtualKeyAction || !isVirtualElement) {
                                this.removeFocus();
                            }
                            if (isVirtualKeyAction || !isVirtualElement) {
                                this.addListFocus(<HTMLElement>elements[elementIndex as number]);
                                this.updateCheck(elements[elementIndex as number]);
                                this.scrollTop(<HTMLElement>elements[elementIndex as number], temp);
                                this.currentFocuedListElement = elements[elementIndex as number] as HTMLElement;
                            }
                        }
                        else {
                            this.removeFocus();
                            this.addListFocus(<HTMLElement>elements[--temp]);
                            this.updateCheck(elements[temp as number]);
                            this.scrollTop(<HTMLElement>elements[temp as number], temp);
                        }
                    }
                }
            }
        }
        const focusedLi: HTMLElement  = this.list ? this.list.querySelector('.e-item-focus') : null;
        if (this.isDisabledElement(focusedLi)) {
            if (this.list.querySelectorAll('.e-list-item:not(.e-hide-listitem):not(.e-disabled)').length === 0 || (this.keyCode === 38 && this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy) && focusedLi === this.list.querySelector('li.e-list-group-item'))) {
                this.removeFocus();
                return;
            }
            const index: number = this.getIndexByValue(focusedLi.getAttribute('data-value'));
            if (index === 0 ) {
                position = 1;
            }
            if (index === (this.list.querySelectorAll('.e-list-item:not(.e-hide-listitem)').length - 1)) {
                position = -1;
            }
            this.moveByList(position);
        }
    }

    private getElementByValue(value: string | number | boolean): Element {
        let item: Element;
        const listItems: Element[] = this.getItems();
        for (const liItem of listItems) {
            if (this.getFormattedValue(liItem.getAttribute('data-value')) === value) {
                item = liItem;
                break;
            }
        }
        return item;
    }

    private updateCheck(element: Element): void {
        if (this.mode === 'CheckBox' && this.enableGroupCheckBox  &&
            !isNullOrUndefined(this.fields.groupBy)) {
            const checkElement: Element = element.firstElementChild.lastElementChild;
            if (checkElement.classList.contains('e-check')) {
                element.classList.add('e-active');
            } else {
                element.classList.remove('e-active');
            }
        }
    }
    private moveBy(position: number, e?: KeyboardEventArgs): void {
        let temp: Element;
        const elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.chipCollectionWrapper.querySelectorAll('span.' + CHIP);
        const selectedElem: Element = <HTMLElement>this.chipCollectionWrapper.querySelector('span.' + CHIP_SELECTED);
        if (selectedElem === null) {
            if (position < 0) {
                this.addChipSelection(elements[elements.length - 1], e);
            }
        } else {
            if (position < 0) {
                temp = selectedElem.previousElementSibling;
                if (temp !== null) {
                    this.removeChipSelection();
                    this.addChipSelection(temp, e);
                }
            } else {
                temp = selectedElem.nextElementSibling;
                this.removeChipSelection();
                if (temp !== null) {
                    this.addChipSelection(temp, e);
                }
            }
        }
    }
    private chipClick(e: MouseEvent): void {
        if (this.enabled) {
            const elem: HTMLElement = <HTMLElement>closest(<HTMLElement>e.target, '.' + CHIP);
            this.removeChipSelection();
            this.addChipSelection(elem, e);
        }
    }
    private removeChipSelection(): void {
        if (this.chipCollectionWrapper) {
            const selectedChips:  NodeListOf<Element>  = <NodeListOf<HTMLElement>>
            this.chipCollectionWrapper.querySelectorAll('span.' + CHIP + '.' + CHIP_SELECTED);
            if (selectedChips && selectedChips.length > 0)
            {
                for (let i: number = 0; i < selectedChips.length; i++) {
                    (<HTMLElement>selectedChips[i as number]).removeAttribute('aria-live');
                }
            }
            this.removeChipFocus();
        }
    }
    private addChipSelection(element: Element, e?: MouseEvent | KeyboardEventArgs): void {
        addClass([element], CHIP_SELECTED);
        if (element) {
            element.setAttribute('aria-live', 'polite');
        }
        this.trigger('chipSelection', e);
    }
    private getVirtualDataByValue(value: string | number | boolean | object)
        : { [key: string]: Object } | string | number | boolean {
        if (!isNullOrUndefined(this.selectedListData)) {
            const type: string = this.typeOfData(this.selectedListData).typeof as string;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                for (const item of this.selectedListData) {
                    if (!isNullOrUndefined(item) && item === value as Object) {
                        return item;
                    }
                }
            } else {
                for (const item of this.selectedListData) {
                    if (!isNullOrUndefined(item) && getValue((this.fields.value ? this.fields.value : 'value'), item) === value) {
                        return item;
                    }
                }
            }
        }
        return null;
    }
    private onChipRemove(e: MouseEvent): void {
        if (e.which === 3 || e.button === 2) {
            return;
        }
        if (this.enabled && !this.readonly) {
            const element: HTMLElement = (<HTMLElement>e.target).parentElement;
            const customVal: string | number | boolean = element.getAttribute('data-value');
            let value: string | number | boolean | object = this.allowObjectBinding ? this.enableVirtualization ?
                this.getVirtualDataByValue(this.getFormattedValue(customVal)) :
                this.getDataByValue(this.getFormattedValue(customVal)) : this.getFormattedValue(customVal);
            if (this.allowCustomValue && (( customVal !== 'false' && value === false ) ||
            (!isNullOrUndefined(value) && value.toString() === 'NaN'))) {
                value = customVal;
            }
            if (this.isPopupOpen() && this.mode !== 'CheckBox') {
                this.hidePopup(e);
            }
            if (!this.inputFocus) {
                this.inputElement.focus();
            }
            this.removeValue(value, e);
            value = this.allowObjectBinding ? getValue((this.fields.value) ? this.fields.value : '', value) :  value;
            if (isNullOrUndefined(this.findListElement(this.list, 'li', 'data-value', value as string)) &&
                this.mainList && this.listData) {
                const list: HTMLElement = this.mainList.cloneNode ? <HTMLElement>this.mainList.cloneNode(true) : this.mainList;
                this.onActionComplete(list, this.mainData);
            }
            this.updateDelimeter(this.delimiterChar, e);
            if (this.placeholder && this.floatLabelType === 'Never') {
                this.makeTextBoxEmpty();
                this.checkPlaceholderSize();
            } else {
                this.inputElement.value = '';
            }
            e.preventDefault();
        }
    }
    private makeTextBoxEmpty(): void {
        this.inputElement.value = '';
        this.refreshPlaceHolder();
    }
    private refreshPlaceHolder(): void {
        if (this.placeholder && this.floatLabelType === 'Never') {
            if ((this.value && this.value.length) || (!isNullOrUndefined(this.text) && this.text !== '')) {
                this.inputElement.placeholder = '';
            } else {
                this.inputElement.placeholder = encodePlaceholder(this.placeholder);
            }
        } else {
            this.setFloatLabelType();
            if (this.element.querySelector('.e-multiselect .e-float-text-content') === null) {
                Input.createSpanElement(this.overAllWrapper, this.createElement);
            }
        }
        this.expandTextbox();
    }
    private removeAllItems(value: string | number | boolean | object,
                           eve: MouseEvent | KeyboardEventArgs,
                           isClearAll?: boolean, element?: Element, mainElement?: HTMLElement): void {
        const index: number = this.allowObjectBinding ? this.indexOfObjectInArray(value, this.value) :
            (this.value as string[]).indexOf(value as string);
        const removeVal: number[] | string[] | boolean[] | object[] = this.value.slice(0);
        removeVal.splice(index, 1);
        this.setProperties({ value: <[number | string]>[].concat([], removeVal) }, true);
        element.setAttribute('aria-selected', 'false');
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        removeClass([element], className);
        this.notify('activeList', {
            module: 'CheckBoxSelection',
            enable: this.mode === 'CheckBox', li: element,
            e: this, index: index
        });
        this.invokeCheckboxSelection(element, eve, isClearAll);
        const currentValue: string | number | boolean = this.allowObjectBinding ? getValue(((this.fields.value) ?
            this.fields.value : ''), value) : value;
        this.updateMainList(true, <string>currentValue, mainElement);
        this.updateChipStatus();
    }
    private invokeCheckboxSelection(element: Element, eve: MouseEvent | KeyboardEventArgs, isClearAll?: boolean): void {
        this.notify('updatelist', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: eve });
        this.updateAriaActiveDescendant();
        if ((this.value && this.value.length !== this.mainData.length)
            && (this.mode === 'CheckBox' && this.showSelectAll && !(this.isSelectAll || isClearAll))) {
            this.notify(
                'checkSelectAll',
                {
                    module: 'CheckBoxSelection',
                    enable: this.mode === 'CheckBox',
                    value: 'uncheck'
                });
        }
    }
    private removeValue(
        value: string | number | boolean | object,
        eve: MouseEvent | KeyboardEventArgs,
        length?: number,
        isClearAll?: boolean): void {
        let index: number = this.allowObjectBinding ? this.indexOfObjectInArray(value, this.value) :
            (this.value as string[]).indexOf(this.getFormattedValue(<string>value) as string);
        if (index === -1 && this.allowCustomValue && !isNullOrUndefined(value)) {
            index = this.allowObjectBinding ? this.indexOfObjectInArray(value, this.value) :
                (this.value as string[]).indexOf(value.toString());
        }
        const targetEle: HTMLElement = eve && eve.target as HTMLElement;
        isClearAll = (isClearAll || targetEle && targetEle.classList.contains('e-close-hooker')) ? true : null;
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (index !== -1) {
            const currentValue: string | number | boolean = this.allowObjectBinding ? getValue(((this.fields.value) ?
                this.fields.value : ''), value) : value;
            const element: HTMLElement = this.virtualSelectAll ? null : this.findListElement(this.list, 'li', 'data-value', currentValue);
            const val: FieldSettingsModel = this.allowObjectBinding ? value as object : this.getDataByValue(value) as FieldSettingsModel;
            const eventArgs: RemoveEventArgs = {
                e: eve,
                item: <HTMLLIElement>element,
                itemData: val,
                isInteracted: eve ? true : false,
                cancel: false
            };
            this.trigger('removing', eventArgs, (eventArgs: RemoveEventArgs) => {
                if (eventArgs.cancel) {
                    this.removeIndex++;
                } else {
                    this.isRemoveSelection = this.enableVirtualization ? true : this.isRemoveSelection;
                    this.currentRemoveValue = this.allowObjectBinding ? getValue(((this.fields.value) ?
                        this.fields.value : ''), value) : value;
                    this.virtualSelectAll = false;
                    const removeVal: number[] | string[] | boolean[] | object[] = this.value.slice(0);
                    removeVal.splice(index, 1);
                    if (this.enableVirtualization && this.selectedListData) {
                        this.selectedListData.splice(index, 1);
                    }
                    this.setProperties({ value: <[number | string]>[].concat([], removeVal) }, true);
                    if (this.enableVirtualization) {
                        const currentText: string = index === 0 && this.text.split(this.delimiterChar) &&
                            this.text.split(this.delimiterChar).length === 1 ?
                            this.text.replace(this.text.split(this.delimiterChar)[index as number], '') :
                            index === 0 ? this.text.replace(this.text.split(this.delimiterChar)[index as number] +
                                this.delimiterChar, '') :
                                this.text.replace(this.delimiterChar + this.text.split(this.delimiterChar)[index as number], '');
                        this.setProperties({ text: currentText.toString() }, true);
                    }
                    if (element !== null) {
                        const currentValue: string | number | boolean = this.allowObjectBinding ? getValue(((this.fields.value) ?
                            this.fields.value : ''), value) : value;
                        const hideElement: HTMLElement = this.findListElement(this.mainList, 'li', 'data-value', currentValue);
                        element.setAttribute('aria-selected', 'false');
                        removeClass([element], className);
                        if (hideElement) {
                            hideElement.setAttribute('aria-selected', 'false');
                            removeClass([element, hideElement], className);
                        }
                        this.notify('activeList', {
                            module: 'CheckBoxSelection',
                            enable: this.mode === 'CheckBox', li: element,
                            e: this, index: index
                        });
                        this.invokeCheckboxSelection(element, eve, isClearAll);
                    }
                    const currentValue: string | number | boolean = this.allowObjectBinding ? getValue(((this.fields.value) ?
                        this.fields.value : ''), value) : value;
                    if (this.hideSelectedItem && this.fields.groupBy && element) {
                        this.hideGroupItem(currentValue);
                    }
                    if (this.hideSelectedItem && this.fixedHeaderElement && this.fields.groupBy && this.mode !== 'CheckBox' &&
                        this.isPopupOpen()) {
                        super.scrollStop();
                    }
                    this.updateMainList(true, <string>currentValue);
                    this.removeChip(currentValue, isClearAll);
                    this.updateChipStatus();
                    const limit: number = this.value && this.value.length ? this.value.length : 0;
                    if (limit < this.maximumSelectionLength) {
                        const collection: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                            + dropDownBaseClasses.li + ':not(.e-active)');
                        removeClass(collection, 'e-disable');
                        const mainListCollection: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.mainList.querySelectorAll('li.'
                            + dropDownBaseClasses.li + ':not(.e-active)');
                        removeClass(mainListCollection, 'e-disable');
                    }
                    this.trigger('removed', eventArgs);
                    const targetEle: HTMLElement = eve && eve.currentTarget as HTMLElement;
                    const isSelectAll: boolean = (targetEle && targetEle.classList.contains('e-selectall-parent')) ? true : null;
                    if (!this.changeOnBlur && !isClearAll && (eve && length && !isSelectAll && this.isSelectAllTarget)) {
                        this.updateValueState(eve, this.value, this.tempValues);
                    }
                    if (length) {
                        this.selectAllEventData.push(val);
                        this.selectAllEventEle.push(<HTMLLIElement>element);
                    }
                    if (length === 1) {
                        if (!this.changeOnBlur) {
                            this.updateValueState(eve, this.value, this.tempValues);
                        }
                        const args: ISelectAllEventArgs = {
                            event: eve,
                            items: this.selectAllEventEle,
                            itemData: this.selectAllEventData,
                            isInteracted: eve ? true : false,
                            isChecked: false
                        };
                        this.trigger('selectedAll', args);
                        this.selectAllEventData = [];
                        this.selectAllEventEle = [];
                    }
                    if (isClearAll && (length === 1 || length === null)) {
                        this.clearAllCallback(eve as MouseEvent, isClearAll);
                    }
                    if (this.isPopupOpen() && element && element.parentElement.classList.contains('e-reorder')) {
                        if (this.hideSelectedItem && this.value && Array.isArray(this.value) && this.value.length > 0) {
                            this.totalItemsCount();
                        }
                        this.notify('setCurrentViewDataAsync', {
                            module: 'VirtualScroll'
                        });
                    }
                }
            });
        }
    }
    private updateMainList(state: boolean, value: string, mainElement?: HTMLElement): void {
        if (this.allowFiltering || this.mode === 'CheckBox') {
            const element2: HTMLElement =  mainElement ? mainElement :
                this.findListElement(this.mainList, 'li', 'data-value', value);
            if (element2) {
                if (state) {
                    element2.setAttribute('aria-selected', 'false');
                    removeClass([element2], this.hideSelectedItem ?
                        HIDE_LIST :
                        dropDownBaseClasses.selected);
                    if (this.mode === 'CheckBox') {
                        removeClass([element2.firstElementChild.lastElementChild], 'e-check');
                    }
                } else {
                    element2.setAttribute('aria-selected', 'true');
                    addClass([element2], this.hideSelectedItem ?
                        HIDE_LIST :
                        dropDownBaseClasses.selected);
                    if (this.mode === 'CheckBox') {
                        addClass([element2.firstElementChild.lastElementChild], 'e-check');
                    }
                }
            }
        }
    }
    private removeChip(value: string | number | boolean, isClearAll? : boolean): void {
        if (this.chipCollectionWrapper) {
            if (!(this.enableVirtualization && isClearAll)) {
                const element: HTMLElement = this.findListElement(this.chipCollectionWrapper, 'span', 'data-value', value);
                if (element) {
                    remove(element);
                }
            }
        }
    }
    private setWidth(width: number | string): void {
        if (!isNullOrUndefined(width)) {
            if (typeof width === 'number') {
                this.overAllWrapper.style.width = formatUnit(width);
            } else if (typeof width === 'string') {
                this.overAllWrapper.style.width = (width.match(/px|%|em/)) ? <string>(width) : <string>(formatUnit(width));
            }
        }
    }
    private updateChipStatus(): void {
        if (this.value && this.value.length) {
            if (!isNullOrUndefined(this.chipCollectionWrapper)) {
                (this.chipCollectionWrapper.style.display = '');
            }
            if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
                this.showDelimWrapper();
            }
            this.showOverAllClear();
        } else {
            if (!isNullOrUndefined(this.chipCollectionWrapper)) {
                this.chipCollectionWrapper.style.display = 'none';
            }
            if (!isNullOrUndefined(this.delimiterWrapper)) {
                (this.delimiterWrapper.style.display = 'none');
            }
            this.hideOverAllClear();
        }
    }
    private indexOfObjectInArray(objectToFind: any, array: any[]): number {
        for (let i: number = 0; i < array.length; i++) {
            const item: any = array[i as number];
            // eslint-disable-next-line no-prototype-builtins
            if (Object.keys(objectToFind).every((key: string) => item.hasOwnProperty(key) &&
                item[key as any] === objectToFind[key as any])) {
                return i; // Return the index if the object is found
            }
        }
        return -1; // Return -1 if the object is not found
    }
    private addValue(value: string | number | boolean, text: string, eve: MouseEvent | KeyboardEventArgs): void {
        if (!this.value) {
            this.value = <string[]>[];
        }
        const currentValue: string | number | boolean | object = this.allowObjectBinding ? this.getDataByValue(value) : value;
        if ((this.allowObjectBinding && !this.isObjectInArray(this.getDataByValue(value), this.value)) || (!this.allowObjectBinding &&
            (this.value as string[]).indexOf(currentValue as string) < 0)) {
            this.setProperties({ value: <[number | string]>[].concat([], this.value, [currentValue]) }, true);
            if (this.enableVirtualization && !this.isSelectAllLoop) {
                let data: string = this.viewWrapper.innerHTML;
                let temp: string;
                data += (this.value.length === 1) ? '' : this.delimiterChar + ' ';
                temp = this.getOverflowVal(this.value.length - 1);
                data += temp;
                temp = this.viewWrapper.innerHTML;
                this.updateWrapperText(this.viewWrapper, data);
            }
            if (this.enableVirtualization && this.mode === 'CheckBox') {

                const currentText: string[] = [];
                const value: string | number | boolean  = this.allowObjectBinding ?
                    getValue(((this.fields.value) ? this.fields.value : ''), this.value[this.value.length - 1]) :
                    this.value[this.value.length - 1];
                const temp: string = text;
                const textValues: string = this.text != null && this.text !== '' ? this.text + this.delimiterChar + temp : temp;
                currentText.push(textValues);
                this.setProperties({ text: currentText.toString() }, true);
            }
        }
        const element: HTMLElement = this.findListElement(this.list, 'li', 'data-value', value);
        this.removeFocus();
        if (element) {
            this.addListFocus(element);
            this.addListSelection(element);
        }
        if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
            this.addChip(text, value, eve);
        }
        if (this.hideSelectedItem && this.fields.groupBy) {
            this.hideGroupItem(value);
        }
        this.updateChipStatus();
        this.checkMaxSelection();
    }
    private updateListItemsState(list: HTMLElement): void {
        const activeItems: NodeListOf<Element> = list.querySelectorAll('li.' + dropDownBaseClasses.li + '.e-active') as NodeListOf<HTMLElement>;
        removeClass(activeItems, 'e-disable');

        const inactiveItems: NodeListOf<Element> = list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-active)') as NodeListOf<HTMLElement>;
        addClass(inactiveItems, 'e-disable');
    }
    private checkMaxSelection(): void {
        const limit: number = this.value && this.value.length ? this.value.length : 0;
        if (this.maximumSelectionLength === 0) {
            this.updateListItemsState(this.list);
            if (this.mainList) {
                this.updateListItemsState(this.mainList);
            }
            return;
        }
        if (limit === this.maximumSelectionLength) {
            const activeItems: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li + '.e-active');
            removeClass(activeItems, 'e-disable');

            const inactiveItems: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li + ':not(.e-active)');
            addClass(inactiveItems, 'e-disable');
        }
        if (limit < this.maximumSelectionLength) {
            const collection: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li );
            removeClass(collection, 'e-disable');
        }
    }
    private dispatchSelect(
        value: string | number | boolean | object,
        eve: MouseEvent | KeyboardEventArgs,
        element: HTMLElement,
        isNotTrigger: boolean,
        length?: number, dataValue?: { [key: string]: Object } | string | number | boolean, text?: string): void {
        const list: string[] | number[] | boolean[] | { [key: string]: Object }[] = this.listData;
        if (this.initStatus && !isNotTrigger && (!this.allowObjectBinding || (this.allowObjectBinding && value))) {
            value = this.allowObjectBinding ? getValue(((this.fields.value) ? this.fields.value : ''), value) : value;
            const val: FieldSettingsModel = dataValue ? dataValue : this.getDataByValue(value) as any;
            const eventArgs: SelectEventArgs = {
                e: eve,
                item: <HTMLLIElement>element,
                itemData: val,
                isInteracted: eve ? true : false,
                cancel: false
            };
            this.trigger('select', eventArgs, (eventArgs: SelectEventArgs) => {
                if (!eventArgs.cancel) {
                    if (length) {
                        this.selectAllEventData.push(val);
                        this.selectAllEventEle.push(<HTMLLIElement>element);
                    }
                    if (length === 1) {
                        const args: ISelectAllEventArgs = {
                            event: eve,
                            items: this.selectAllEventEle,
                            itemData: this.selectAllEventData,
                            isInteracted: eve ? true : false,
                            isChecked: true
                        };
                        this.trigger('selectedAll', args);
                        this.selectAllEventData = [];
                    }
                    if (this.allowCustomValue && this.isServerRendered && this.listData !== list) {
                        this.listData = list;
                    }
                    value = this.allowObjectBinding ? this.getDataByValue(value) : value;
                    if (this.enableVirtualization) {
                        if (isNullOrUndefined(this.selectedListData)) {
                            this.selectedListData = this.allowObjectBinding ? [value] : [(this.getDataByValue(value)) as any];
                        } else {
                            if (dataValue) {
                                if (Array.isArray(this.selectedListData)) {
                                    this.selectedListData.push(dataValue as never);
                                } else {
                                    this.selectedListData = [this.selectedListData, dataValue as any];
                                }
                            }
                            else {
                                if (Array.isArray(this.selectedListData)) {
                                    this.selectedListData.push(this.allowObjectBinding ? value as never :
                                        (this.getDataByValue(value)) as never);
                                } else {
                                    this.selectedListData = [this.selectedListData, this.allowObjectBinding ? value :
                                        (this.getDataByValue(value)) as any];
                                }
                            }
                        }
                    }
                    if ((this.enableVirtualization && value) || !this.enableVirtualization){
                        this.updateListSelectEventCallback(value, element, eve, text);
                    }
                    if (this.hideSelectedItem && this.fixedHeaderElement && this.fields.groupBy && this.mode !== 'CheckBox') {
                        super.scrollStop();
                    }
                }
            });
        }
    }
    private addChip(text: string, value: string | number | boolean, e?: MouseEvent | KeyboardEventArgs): void {
        if (this.chipCollectionWrapper) {
            this.getChip(text, value, e);
        }
    }
    private removeChipFocus(): void {
        const elements: NodeListOf<Element> = <NodeListOf<HTMLElement>>
            this.chipCollectionWrapper.querySelectorAll('span.' + CHIP + '.' + CHIP_SELECTED);
        removeClass(elements, CHIP_SELECTED);
        if (Browser.isDevice) {
            const closeElements: NodeListOf<Element> = <NodeListOf<HTMLElement>>
            this.chipCollectionWrapper.querySelectorAll('span.' + CHIP_CLOSE.split(' ')[0]);
            for (let index: number = 0; index < closeElements.length; index++) {
                (<HTMLElement>closeElements[index as number]).style.display = 'none';
            }
        }

    }
    private onMobileChipInteraction(e: MouseEvent): void {
        const chipElem: HTMLElement = <HTMLElement>closest(<HTMLElement>e.target, '.' + CHIP);
        const chipClose: HTMLElement = <HTMLElement>chipElem.querySelector('span.' + CHIP_CLOSE.split(' ')[0]);
        if (this.enabled && !this.readonly) {
            if (!chipElem.classList.contains(CHIP_SELECTED)) {
                this.removeChipFocus();
                chipClose.style.display = '';
                chipElem.classList.add(CHIP_SELECTED);
            }
            this.refreshPopup();
            e.preventDefault();
        }
    }
    private multiCompiler(multiselectTemplate: string | Function): boolean {
        let checkTemplate: boolean = false;
        if (typeof multiselectTemplate !== 'function' && multiselectTemplate) {
            try {
                checkTemplate = (selectAll(multiselectTemplate, document).length) ? true : false;
            } catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    private encodeHtmlEntities(input: string): string {
        return input.replace(/[\u00A0-\u9999<>&]/g, function(match: string): string {
            return `&#${match.charCodeAt(0)};`;
        });
    }
    private getChip(
        data: string, value: string | number | boolean,
        e?: MouseEvent | KeyboardEventArgs): void {
        let itemData: { [key: string]: Object } | string | boolean | number = { text: value, value: value };
        const chip: HTMLElement = this.createElement('span', {
            className: CHIP,
            attrs: { 'data-value': <string>value, 'title': data , 'role': 'option', 'aria-selected': 'true' }
        });
        let compiledString: Function;
        const chipContent: HTMLElement = this.createElement('span', { className: CHIP_CONTENT });
        const chipClose: HTMLElement = this.createElement('span', { className: CHIP_CLOSE });
        if (this.mainData) {
            itemData = this.getDataByValue(value);
        }
        if (this.valueTemplate && !isNullOrUndefined(itemData)) {
            const valuecheck: boolean = this.multiCompiler(this.valueTemplate);
            if (typeof this.valueTemplate !== 'function' && valuecheck) {
                compiledString = compile(select(this.valueTemplate, document).innerHTML.trim());
            } else {
                compiledString = compile(this.valueTemplate);
            }
            const valueCompTemp: any = compiledString(
                itemData,
                this,
                'valueTemplate',
                this.valueTemplateId,
                this.isStringTemplate,
                null,
                chipContent
            );
            if (valueCompTemp && valueCompTemp.length > 0) {
                append(valueCompTemp, chipContent);
            }
            this.renderReactTemplates();
        } else if (this.enableHtmlSanitizer) {
            chipContent.innerText = data;
        } else {
            chipContent.innerHTML = this.encodeHtmlEntities(data.toString());
        }
        chip.appendChild(chipContent);
        const eventArgs: { [key: string]: Object } = {
            isInteracted: e ? true : false,
            itemData: itemData,
            e: e,
            setClass: (classes: string) => {
                addClass([chip], classes);
            },
            cancel: false
        };
        this.isPreventChange = this.isAngular && this.preventChange;
        this.trigger('tagging', eventArgs, (eventArgs: TaggingEventArgs) => {
            if (!eventArgs.cancel) {
                if (Browser.isDevice) {
                    chip.classList.add(MOBILE_CHIP);
                    append([chipClose], chip);
                    chipClose.style.display = 'none';
                    EventHandler.add(chip, 'click', this.onMobileChipInteraction, this);
                } else {
                    EventHandler.add(chip, 'mousedown', this.chipClick, this);
                    if (this.showClearButton) {
                        chip.appendChild(chipClose);
                    }
                }
                EventHandler.add(chipClose, 'mousedown', this.onChipRemove, this);
                this.chipCollectionWrapper.appendChild(chip as HTMLElement);
                if (!this.changeOnBlur && e) {
                    this.updateValueState(e, this.value, this.tempValues);
                }
            }
        });
    }
    private calcPopupWidth(): string {
        let width: string = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            const inputWidth: number = (this.componentWrapper.offsetWidth) * parseFloat(width) / 100;
            width = inputWidth.toString() + 'px';
        }
        return (this.allowResize && this.resizeWidth) ? this.resizeWidth + 'px' : width;
    }
    private mouseIn(): void {
        if (this.enabled && !this.readonly) {
            this.showOverAllClear();
        }
    }
    private mouseOut(): void {
        if (!this.inputFocus) {
            this.overAllClear.style.display = 'none';
        }
    }

    protected listOption(dataSource: { [key: string]: Object }[], fields: FieldSettingsModel): FieldSettingsModel {
        const iconCss: boolean = isNullOrUndefined(fields.iconCss) ? false : true;
        const fieldProperty: Object = isNullOrUndefined((fields as FieldSettingsModel & { properties: Object }).properties) ? fields :
            (fields as FieldSettingsModel & { properties: Object }).properties;
        this.listCurrentOptions = (fields.text !== null || fields.value !== null) ? {
            fields: fieldProperty, showIcon: iconCss, ariaAttributes: { groupItemRole: 'presentation' }
        } : { fields: { value: 'text' } as Object };
        extend(this.listCurrentOptions, this.listCurrentOptions, fields, true);
        if (this.mode === 'CheckBox') {
            this.notify('listoption', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', dataSource, fieldProperty });
        }
        return this.listCurrentOptions;
    }

    private renderPopup(): void {
        if (!this.list) {
            super.render();
        }
        if (this.popupObj && document.body.contains(this.popupObj.element) && this.allowFiltering) {
            this.refreshPopup();
            return;
        }
        if (!this.popupObj) {
            if (!isNullOrUndefined(this.popupWrapper)) {
                document.body.appendChild(this.popupWrapper);
                const checkboxFilter: HTMLElement = this.popupWrapper.querySelector('.' + FILTERPARENT);
                if (this.mode === 'CheckBox' && !this.allowFiltering && checkboxFilter && this.filterParent) {
                    checkboxFilter.remove();
                    this.filterParent = null;
                }
                let overAllHeight: number = parseInt(<string>this.popupHeight, 10);
                this.popupWrapper.style.visibility = 'hidden';
                if (this.headerTemplate) {
                    this.setHeaderTemplate();
                    overAllHeight -= this.header.offsetHeight;
                    this.isUpdateHeaderHeight = this.header.offsetHeight !== 0;
                }
                append([this.list], this.popupWrapper);
                if (!this.list.classList.contains(dropDownBaseClasses.noData) && (this.getItems()[1] as HTMLElement)) {
                    this.listItemHeight = (this.getItems()[1] as HTMLElement).offsetHeight +
                        parseInt(window.getComputedStyle(this.getItems()[1] as HTMLElement).marginBottom, 10);
                }
                if (this.enableVirtualization && !this.list.classList.contains(dropDownBaseClasses.noData)){
                    if (!this.list.querySelector('.e-virtual-ddl-content') && this.list.querySelector('.e-list-parent')){
                        const contentElement: HTMLElement = this.createElement('div', {
                            className: 'e-virtual-ddl-content'
                        });
                        contentElement.style.cssText = this.getTransformValues();
                        this.list.appendChild(contentElement).appendChild(this.list.querySelector('.e-list-parent'));
                    }
                    else if (this.list.querySelector('.e-virtual-ddl-content')){
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
                    }
                    this.UpdateSkeleton();
                    this.liCollections = <HTMLElement[] & NodeListOf<Element>>this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                    this.virtualItemCount = this.itemCount;
                    if (this.mode !== 'CheckBox') {
                        this.totalItemsCount();
                    }
                    if (!this.list.querySelector('.e-virtual-ddl')){
                        const virualElement: any = this.createElement('div', {
                            id: this.element.id + '_popup',
                            className: 'e-virtual-ddl'
                        });
                        virualElement.style.cssText = this.GetVirtualTrackHeight();
                        this.popupWrapper.querySelector('.e-dropdownbase').appendChild(virualElement);
                    }
                    else{
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (this.list.getElementsByClassName('e-virtual-ddl')[0] as any).style = this.GetVirtualTrackHeight();
                    }
                }
                if (this.footerTemplate) {
                    this.setFooterTemplate();
                    overAllHeight -= this.footer.offsetHeight;
                    this.isUpdateFooterHeight = this.footer.offsetHeight !== 0;
                }
                if (this.mode === 'CheckBox' && this.showSelectAll) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight -= this.selectAllHeight;
                } else if (this.mode === 'CheckBox' && !this.showSelectAll && (!this.headerTemplate && !this.footerTemplate)) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight = parseInt(<string>this.popupHeight, 10);
                } else if (this.mode === 'CheckBox' && !this.showSelectAll) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight = parseInt(<string>this.popupHeight, 10);
                    if (this.headerTemplate && this.header) {
                        overAllHeight -= this.header.offsetHeight;
                    }
                    if (this.footerTemplate && this.footer) {
                        overAllHeight -= this.footer.offsetHeight;
                    }
                }
                if (this.mode === 'CheckBox') {
                    const args: { [key: string]: Object | string } = {
                        module: 'CheckBoxSelection',
                        enable: this.mode === 'CheckBox',
                        popupElement: this.popupWrapper
                    };
                    if (this.allowFiltering) {
                        this.notify('searchBox', args);
                        overAllHeight -= this.searchBoxHeight;
                    }
                    addClass([this.popupWrapper], 'e-checkbox');
                }
                if (this.popupHeight !== 'auto') {
                    this.list.style.maxHeight = formatUnit(overAllHeight);
                    this.popupWrapper.style.maxHeight = formatUnit(this.popupHeight);
                } else {
                    this.list.style.maxHeight = formatUnit(this.popupHeight);
                }
                this.popupObj = new Popup(this.popupWrapper, {
                    width: this.calcPopupWidth(), targetType: 'relative',
                    position: this.enableRtl ? { X: 'right', Y: 'bottom' } : { X: 'left', Y: 'bottom' },
                    relateTo: this.overAllWrapper,
                    collision: this.enableRtl ? { X: 'fit', Y: 'flip' } : { X: 'flip', Y: 'flip' }, offsetY: 1,
                    enableRtl: this.enableRtl, zIndex: this.zIndex,
                    close: () => {
                        if (this.popupObj.element.parentElement) {
                            this.popupObj.unwireScrollEvents();
                            // For restrict the page scrolling in safari browser
                            const checkboxFilterInput: HTMLElement = this.popupWrapper.querySelector('.' + FILTERINPUT);
                            if (this.mode === 'CheckBox' && checkboxFilterInput && document.activeElement === checkboxFilterInput) {
                                checkboxFilterInput.blur();
                            }
                            detach(this.popupObj.element);
                        }
                    },
                    open: () => {
                        this.popupObj.resolveCollision();
                        if (!this.isFirstClick) {
                            const ulElement: HTMLElement = this.list.querySelector('ul');
                            if (ulElement) {
                                if (!(this.mode !== 'CheckBox' && (this.allowFiltering || this.allowCustomValue) &&
                                    (this.targetElement().trim() !== '' || (this.targetElement() !== '' && this.allowCustomValue)))) {
                                    this.mainList = ulElement.cloneNode ? (ulElement.cloneNode(true) as HTMLElement) : ulElement;
                                }
                            }
                            this.isFirstClick = true;
                        }
                        this.popupObj.wireScrollEvents();
                        if (!(this.mode !== 'CheckBox' && (this.allowFiltering || this.allowCustomValue) &&
                            (this.targetElement().trim() !== '' || (this.targetElement() !== '' && this.allowCustomValue))) && !this.enableVirtualization) {
                            this.loadTemplate();
                            if (this.enableVirtualization && this.mode === 'CheckBox'){
                                this.UpdateSkeleton();
                            }
                        }
                        this.isPreventScrollAction = true;
                        this.setScrollPosition();
                        if (!this.list.classList.contains(dropDownBaseClasses.noData) && (this.getItems()[1] as HTMLElement) &&
                           (this.getItems()[1] as HTMLElement).offsetHeight !== 0) {
                            this.listItemHeight = (this.getItems()[1] as HTMLElement).offsetHeight +
                                parseInt(window.getComputedStyle(this.getItems()[1] as HTMLElement).marginBottom, 10);
                            if (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
                            }
                        }
                        if (this.allowFiltering) {
                            this.notify(
                                'inputFocus',
                                {
                                    module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'focus'
                                });
                        }
                        if (this.enableVirtualization){
                            this.notify('bindScrollEvent', {
                                module: 'VirtualScroll',
                                component: this.getModuleName(),
                                enable: this.enableVirtualization
                            });
                            setTimeout(() => {
                                if (this.value) {
                                    this.updateSelectionList();
                                }
                                else if (this.viewPortInfo && this.viewPortInfo.offsets.top) {
                                    this.list.scrollTop = this.viewPortInfo.offsets.top;
                                }
                            }, 5);
                        }
                    }, targetExitViewport: () => {
                        if (!Browser.isDevice) {
                            this.hidePopup();
                        }
                    }
                });
                this.checkCollision(this.popupWrapper);
                this.popupContentElement = this.popupObj.element.querySelector('.e-content');

                if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering && this.isDeviceFullScreen) {
                    this.notify('deviceSearchBox', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                }
                if (this.allowResize) {
                    this.setResize();
                }
                this.popupObj.close();
                this.popupWrapper.style.visibility = '';
            }
        }
    }
    private checkCollision(popupEle: HTMLElement): void {
        if (!(this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering && this.isDeviceFullScreen)) {
            const collision: string[] = isCollide(popupEle);
            if (collision.length > 0) {
                popupEle.style.marginTop = -parseInt(getComputedStyle(popupEle).marginTop, 10) + 'px';
            }
            this.popupObj.resolveCollision();
        }
    }
    private setHeaderTemplate(): void {
        let compiledString: Function;
        if (this.header) {
            this.header.remove();
        }
        this.header = this.createElement('div');
        addClass([this.header], HEADER);
        const headercheck: boolean = this.multiCompiler(this.headerTemplate);
        if (typeof this.headerTemplate !== 'function' && headercheck) {
            compiledString = compile(select(this.headerTemplate, document).innerHTML.trim());
        } else {
            compiledString = compile(this.headerTemplate);
        }
        // eslint-disable-next-line
        let elements: any = compiledString({}, this, 'headerTemplate', this.headerTemplateId, this.isStringTemplate, null, this.header);
        if (elements && elements.length > 0) {
            append(elements, this.header);
        }
        if (this.mode === 'CheckBox' && this.showSelectAll) {
            prepend([this.header], this.popupWrapper);
        } else {
            append([this.header], this.popupWrapper);
        }
        EventHandler.add(this.header, 'mousedown', this.onListMouseDown, this);
    }
    private setFooterTemplate(): void {
        let compiledString: Function;
        if (this.footer) {
            this.footer.remove();
        }
        this.footer = this.createElement('div');
        addClass([this.footer], FOOTER);
        const footercheck: boolean = this.multiCompiler(this.footerTemplate);
        if (typeof this.footerTemplate !== 'function' && footercheck) {
            compiledString = compile(select(this.footerTemplate, document).innerHTML.trim());
        } else {
            compiledString = compile(this.footerTemplate);
        }
        // eslint-disable-next-line
        let elements: any = compiledString({}, this, 'footerTemplate', this.footerTemplateId, this.isStringTemplate, null, this.footer);
        if (elements && elements.length > 0 ) {
            append(elements, this.footer);
        }
        append([this.footer], this.popupWrapper);
        EventHandler.add(this.footer, 'mousedown', this.onListMouseDown, this);
    }

    private updateInitialData(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentData: any[] = this.selectData;
        const ulElement: HTMLElement = this.renderItems(currentData, this.fields, false, this.isClearAllAction);
        this.list.scrollTop = 0;
        this.virtualListInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: this.itemCount
        };
        this.previousStartIndex = 0;
        this.previousEndIndex = this.itemCount;
        if (this.dataSource instanceof DataManager) {
            if (this.remoteDataCount >= 0) {
                this.totalItemCount = this.dataCount = this.remoteDataCount;
            } else {
                this.resetList(this.dataSource);
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = this.dataCount = this.dataSource && (this.dataSource as any).length ? (this.dataSource as any).length : 0;
        }
        if (this.mode !== 'CheckBox') {
            this.totalItemCount = this.value && this.value.length ? this.totalItemCount - this.value.length : this.totalItemCount;
        }
        this.getSkeletonCount();
        this.skeletonCount = this.totalItemCount !== 0 && this.totalItemCount < this.itemCount * 2 &&
            ((!(this.dataSource instanceof DataManager)) || ((this.dataSource instanceof DataManager) &&
            (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
        this.UpdateSkeleton();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.list.getElementsByClassName('e-virtual-ddl')[0] as any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.list.getElementsByClassName('e-virtual-ddl')[0] as any).style = this.GetVirtualTrackHeight();
        }
        else if (!this.list.querySelector('.e-virtual-ddl') && this.skeletonCount > 0) {
            const virualElement: any = this.createElement('div', {
                id: this.element.id + '_popup',
                className: 'e-virtual-ddl'
            });
            virualElement.style.cssText = this.GetVirtualTrackHeight();
            this.popupWrapper.querySelector('.e-dropdownbase').appendChild(virualElement);
        }
        this.listData = currentData;
        this.liCollections = <HTMLElement[] & NodeListOf<Element>>this.list.querySelectorAll('.e-list-item');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
        }
        if (this.enableVirtualization) {
            this.notify('setGeneratedData', {
                module: 'VirtualScroll'
            });
        }
    }

    private clearAll(e: MouseEvent): void {
        if (this.enabled && !this.readonly) {
            let temp: string | number | boolean | object;
            this.setDynValue = false;
            this.isClearAllAction = true;
            if (this.value && this.value.length > 0) {
                if (this.allowFiltering) {
                    this.refreshListItems(null);
                    if (this.mode === 'CheckBox' && this.targetInputElement as HTMLInputElement) {
                        (this.targetInputElement as HTMLInputElement).value = '';
                    }
                }
                const liElement: NodeListOf<Element> = this.list && this.list.querySelectorAll('li.e-list-item');
                if (liElement && liElement.length > 0) {
                    this.selectAllItems(false, e);
                } else {
                    this.removeIndex = 0;
                    for (temp = this.value[this.removeIndex]; this.removeIndex < this.value.length; temp = this.value[this.removeIndex]) {
                        this.removeValue(temp, e, null, true);
                    }
                }
                this.selectedElementID = null;
                this.inputElement.removeAttribute('aria-activedescendant');
            } else {
                this.clearAllCallback(e);
            }
            this.checkAndResetCache();
            if (this.element.querySelector('.e-multiselect .e-float-text-content') === null) {
                Input.createSpanElement(this.overAllWrapper, this.createElement);
            }
            this.calculateWidth();
            if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] && this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
                this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
            }
            if (this.enableVirtualization) {
                this.updateInitialData();
                if (this.chipCollectionWrapper) {
                    this.chipCollectionWrapper.innerHTML = '';
                }
                if (!this.isCustomDataUpdated) {
                    this.notify('setGeneratedData', {
                        module: 'VirtualScroll'
                    });
                }
            }
            if (this.enableVirtualization) {
                this.list.scrollTop = 0;
                this.virtualListInfo = null;
                this.previousStartIndex = 0;
                this.previousEndIndex = this.itemCount;
            }
            this.isClearAllAction = false;
        }
        this.isClearAllItem = true;
        EventHandler.add(document, 'mouseup', this.preventSelection, this);
    }
    private preventSelection(e: MouseEvent): void {
        if (this.isClearAllItem) {
            e.stopPropagation();
        }
        this.isClearAllItem = false;
        EventHandler.remove(document, 'mouseup', this.preventSelection);
    }
    private clearAllCallback(e: MouseEvent, isClearAll?: boolean): void {
        const tempValues: string[] | number[] = this.value ? <string[]>this.value.slice() : <string[]>[];
        if (this.mainList && this.listData && ((this.allowFiltering && this.mode !== 'CheckBox') || this.allowCustomValue)) {
            const list: HTMLElement = this.mainList.cloneNode ? <HTMLElement>this.mainList.cloneNode(true) : this.mainList;
            this.onActionComplete(list, this.mainData);
        }
        this.focusAtFirstListItem();
        this.updateDelimeter(this.delimiterChar, e);
        if (this.mode !== 'Box' && (!this.inputFocus || this.mode === 'CheckBox')) {
            this.updateDelimView();
        }
        if (this.inputElement.value !== '') {
            this.makeTextBoxEmpty();
            this.search(null);
        }
        this.checkPlaceholderSize();
        if (this.isPopupOpen()) {
            this.refreshPopup();
        }
        if (this.allowResize) {
            this.setResize();
        }
        if (!this.inputFocus) {
            if (this.changeOnBlur) {
                this.updateValueState(e, this.value, tempValues);
            }
            if (this.mode !== 'CheckBox') {
                this.inputElement.focus();
            }
        }
        if (this.mode === 'CheckBox') {
            this.refreshPlaceHolder();
            this.refreshInputHight();
            if (this.changeOnBlur && isClearAll && (isNullOrUndefined(this.value) || this.value.length === 0)) {
                this.updateValueState(e, this.value, this.tempValues);
            }
        }
        if (!this.changeOnBlur && isClearAll && (isNullOrUndefined(this.value) || this.value.length === 0)) {
            this.updateValueState(e, this.value, this.tempValues);
        }
        if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
            this.updateListItems(this.list.querySelectorAll('li.e-list-item'), this.mainList.querySelectorAll('li.e-list-item'));
        }
        e.preventDefault();
    }
    private windowResize(): void {
        this.refreshPopup();
        if ((!this.inputFocus || this.mode === 'CheckBox') && this.viewWrapper && this.viewWrapper.parentElement) {
            this.updateDelimView();
        }
    }
    private resetValueHandler(e: Event): void {
        if (!isNullOrUndefined(this.inputElement)) {
            const formElement: HTMLFormElement = closest(this.inputElement, 'form') as HTMLFormElement;
            if (formElement && e.target === formElement) {
                const textVal: string = (this.element.tagName === this.getNgDirective()) ?
                    null : this.element.getAttribute('data-initial-value');
                this.text = textVal;
            }
        }
    }
    protected wireEvent(): void {
        EventHandler.add(this.componentWrapper, 'mousedown', this.wrapperClick, this);
        EventHandler.add(<HTMLElement & Window><unknown>window, 'resize', this.windowResize, this);
        EventHandler.add(this.inputElement, 'focus', this.focusInHandler, this);
        EventHandler.add(this.inputElement, 'keydown', this.onKeyDown, this);
        EventHandler.add(this.inputElement, 'keyup', this.keyUp, this);
        if (this.mode !== 'CheckBox') {
            EventHandler.add(this.inputElement, 'input', this.onInput, this);
        }
        EventHandler.add(this.inputElement, 'blur', this.onBlurHandler, this);
        EventHandler.add(this.componentWrapper, 'mouseover', this.mouseIn, this);
        const formElement: HTMLFormElement = closest(this.inputElement, 'form') as HTMLFormElement;
        if (formElement) {
            EventHandler.add(formElement, 'reset', this.resetValueHandler, this);
        }
        EventHandler.add(this.componentWrapper, 'mouseout', this.mouseOut, this);
        EventHandler.add(this.overAllClear, 'mousedown', this.clearAll, this);
        EventHandler.add(this.inputElement, 'paste', this.pasteHandler, this);
    }
    private onInput(e: KeyboardEventArgs): void {
        if (this.keyDownStatus) {
            this.isValidKey = true;
        } else {
            this.isValidKey = false;
        }
        this.keyDownStatus = false;
        // For Filtering works in mobile firefox
        if (Browser.isDevice && Browser.info.name === 'mozilla') {
            this.search(e);
        }
    }
    private pasteHandler (event: KeyboardEventArgs): void {
        setTimeout((): void => {
            this.expandTextbox();
            this.search(event);
        });
    }
    protected performFiltering(e: KeyboardEventArgs | MouseEvent): void {
        const eventArgs: { [key: string]: Object } = {
            preventDefaultAction: false,
            text: this.targetElement(),
            updateData: (
                dataSource: {
                    [key: string]: Object
                }[] | DataManager | string[] | number[], query?: Query, fields?: FieldSettingsModel) => {
                if (eventArgs.cancel) {
                    return;
                }
                this.isFiltered = true;
                this.customFilterQuery = query;
                this.remoteFilterAction = true;
                this.isCustomFiltering = true;
                this.dataUpdater(dataSource, query, fields);
            },
            event: e,
            cancel: false
        };
        this.trigger('filtering', eventArgs, (eventArgs: FilteringEventArgs) => {
            this.isFilterPrevented = eventArgs.cancel;
            if (!eventArgs.cancel) {
                if (!this.isFiltered && !eventArgs.preventDefaultAction) {
                    this.isFilterAction = true;
                    this.isFilteringAction = true;
                    if (this.dataSource instanceof DataManager && this.allowCustomValue) {
                        this.isCustomRendered = false;
                    }
                    this.dataUpdater(this.dataSource, null, this.fields);
                    this.isFilteringAction = false;
                }
            }
        });
    }
    protected search(e: KeyboardEventArgs): void {
        this.preventSetCurrentData = false;
        this.firstItem = this.dataSource && (this.dataSource as any).length > 0 ? (this.dataSource as any)[0] : null;
        if (!isNullOrUndefined(e)) {
            this.keyCode = e.keyCode;
        }
        if (!this.isPopupOpen() && this.openOnClick) {
            this.showPopup(e);
        }
        this.openClick(e);
        if (this.checkTextLength() && !this.allowFiltering && !isNullOrUndefined(e) && (e.keyCode !== 8)) {
            this.focusAtFirstListItem();
        } else {
            const text: string = this.targetElement();
            if (this.allowFiltering) {
                if (this.allowCustomValue) {
                    this.isRemoteSelection = true;
                }
                this.checkAndResetCache();
                this.isRequesting = false;
                if (this.targetElement() !== '' && this.debounceDelay > 0) {
                    this.debouncedFiltering(e, this.debounceDelay);
                }
                else {
                    this.performFiltering(e);
                }
            } else if (this.allowCustomValue) {
                let query: Query = new Query();
                query = this.allowFiltering && (text !== '') ? query.where(
                    this.fields.text, 'startswith', text, this.ignoreCase, this.ignoreAccent) : query;
                if (this.enableVirtualization) {
                    this.dataUpdater(this.dataSource, query, this.fields);
                }
                else{
                    this.dataUpdater(this.mainData, query, this.fields);
                }
                this.UpdateSkeleton();
            } else {
                const liCollections: HTMLElement[] = <HTMLElement[] & NodeListOf<Element>>
                    this.list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-hide-listitem)');
                const type: string = this.typeOfData(this.listData).typeof as string;
                let activeElement: { [key: string]: Element | number } =
                    Search(this.targetElement(), liCollections, 'StartsWith', this.ignoreCase);
                if (this.enableVirtualization && this.targetElement().trim() !== '' && !this.allowFiltering) {
                    let updatingincrementalindex: boolean = false;
                    if ((this.viewPortInfo.endIndex >= this.incrementalEndIndex && this.incrementalEndIndex <= this.totalItemCount) ||
                         this.incrementalEndIndex === 0) {
                        updatingincrementalindex = true;
                        this.incrementalStartIndex = 0;
                        this.incrementalEndIndex = 100 > this.totalItemCount ? this.totalItemCount : 100;
                        this.updateIncrementalInfo(this.incrementalStartIndex, this.incrementalEndIndex);
                        updatingincrementalindex = false;
                    }
                    if (this.viewPortInfo.startIndex !== 0 || updatingincrementalindex) {
                        this.updateIncrementalView(0, this.itemCount);
                    }
                    activeElement = Search(
                        this.targetElement(),
                        this.incrementalLiCollections,
                        this.filterType,
                        true,
                        this.listData,
                        this.fields,
                        type
                    );
                    while (isNullOrUndefined(activeElement) && this.incrementalEndIndex < this.totalItemCount) {
                        this.incrementalStartIndex = this.incrementalEndIndex;
                        this.incrementalEndIndex = this.incrementalEndIndex + 100 > this.totalItemCount ? this.totalItemCount :
                            this.incrementalEndIndex + 100;
                        this.updateIncrementalInfo(this.incrementalStartIndex, this.incrementalEndIndex);
                        updatingincrementalindex = true;
                        if (this.viewPortInfo.startIndex !== 0 || updatingincrementalindex) {
                            this.updateIncrementalView(0, this.itemCount);
                        }
                        activeElement = Search(
                            this.targetElement(),
                            this.incrementalLiCollections,
                            this.filterType,
                            true,
                            this.listData,
                            this.fields,
                            type
                        );
                        if (!isNullOrUndefined(activeElement)) {
                            break;
                        }
                        if (isNullOrUndefined(activeElement) && this.incrementalEndIndex >= this.totalItemCount) {
                            this.incrementalStartIndex = 0;
                            this.incrementalEndIndex = 100 > this.totalItemCount ? this.totalItemCount : 100;
                            break;
                        }
                    }
                    if (activeElement.index) {
                        if (!(this.viewPortInfo.startIndex >= (activeElement.index as number)) ||
                            !(activeElement.index as number >= this.viewPortInfo.endIndex)
                        ) {
                            const startIndex: number =
                                (activeElement.index as number) - ((this.itemCount / 2) - 2) > 0
                                    ? (activeElement.index as number) - ((this.itemCount / 2) - 2)
                                    : 0;
                            const endIndex: number =
                                startIndex + this.itemCount > this.totalItemCount
                                    ? this.totalItemCount
                                    : startIndex + this.itemCount;
                            if (startIndex !== this.viewPortInfo.startIndex) {
                                this.updateIncrementalView(startIndex, endIndex);
                            }
                        }
                    }
                    if (!isNullOrUndefined(activeElement.item)) {
                        const index1: number =
                            this.getIndexByValue((activeElement.item as Element).getAttribute('data-value')) - this.skeletonCount;
                        if (index1 > this.itemCount / 2) {
                            const startIndex: number = this.viewPortInfo.startIndex + ((this.itemCount / 2) - 2) < this.totalItemCount
                                ? this.viewPortInfo.startIndex + ((this.itemCount / 2) - 2)
                                : this.totalItemCount;
                            const endIndex: number = this.viewPortInfo.startIndex + this.itemCount > this.totalItemCount
                                ? this.totalItemCount
                                : this.viewPortInfo.startIndex + this.itemCount;
                            this.updateIncrementalView(startIndex, endIndex);
                        }
                        activeElement.item = this.getElementByValue((activeElement.item as Element).getAttribute('data-value'));
                    } else {
                        this.updateIncrementalView(0, this.itemCount);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
                        this.list.scrollTop = 0;
                    }
                    if (activeElement && activeElement.item) {
                        activeElement.item = this.getElementByValue((activeElement.item as Element).getAttribute('data-value'));
                    }
                }
                if (activeElement && activeElement.item) {
                    this.addListFocus((<HTMLElement>activeElement.item));
                    this.list.scrollTop =
                        (<HTMLElement>activeElement.item).offsetHeight * (<number>activeElement.index);
                } else if (this.targetElement() !== '') {
                    this.removeFocus();
                } else {
                    this.focusAtFirstListItem();
                }
            }
        }
        if (this.enableVirtualization && this.allowFiltering) {
            this.getFilteringSkeletonCount();
        }
    }

    protected preRender(): void {
        if (this.allowFiltering === null) {
            this.allowFiltering = (this.mode === 'CheckBox') ? true : false;
        }
        this.preventSetCurrentData = false;
        this.initializeData();
        this.updateDataAttribute(this.htmlAttributes);
        super.preRender();
    }
    protected getLocaleName(): string {
        return 'multi-select';
    }
    private initializeData(): void {
        this.mainListCollection = [];
        this.beforePopupOpen = false;
        this.isFilterAction = false;
        this.remoteFilterAction = false;
        this.isFirstClick = false;
        this.mobFilter = true;
        this.isFiltered = false;
        this.focused = true;
        this.initial = true;
        this.backCommand = true;
        this.isCustomRendered = false;
        this.isRemoteSelection = false;
        this.isSelectAllTarget = true;
        this.isaddNonPresentItems = false;
        this.viewPortInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: this.itemCount
        };
    }

    private updateData(delimiterChar: string, e?: MouseEvent | KeyboardEventArgs, isInitialVirtualData?: boolean): void {
        let data: string = '';
        const delim: boolean = this.mode === 'Delimiter' || this.mode === 'CheckBox';
        let text: string[] = <string[]>[];
        let temp: string;
        const tempData: Object = this.listData;
        if (!this.enableVirtualization) {
            this.listData = this.mainData;
        }
        if (!isNullOrUndefined(this.hiddenElement) && !this.enableVirtualization) {
            this.hiddenElement.innerHTML = '';
        }
        if (!isNullOrUndefined(this.value)) {
            let valueLength: number = this.value.length;
            let hiddenElementContent: string = '';
            for (let index: number = 0; index < valueLength; index++) {
                const valueItem: any = this.allowObjectBinding ?
                    getValue((this.fields.value) ? this.fields.value : '', this.value[index as number]) : this.value[index as number];
                let listValue: Element = this.findListElement(
                    (!isNullOrUndefined(this.mainList) ? this.mainList : this.ulElement),
                    'li',
                    'data-value',
                    valueItem
                );
                if (this.enableVirtualization){
                    listValue = this.findListElement(
                        (!isNullOrUndefined(this.list) ? this.list : this.ulElement),
                        'li',
                        'data-value',
                        valueItem
                    );
                }
                if (isNullOrUndefined(listValue) && !this.allowCustomValue && !this.enableVirtualization &&
                    this.listData && this.listData.length > 0) {
                    this.value.splice(index, 1);
                    index -= 1;
                    valueLength -= 1;
                } else {
                    if (this.listData) {
                        if (this.enableVirtualization) {
                            if (delim && !this.isDynamicRemoteVirtualData && !isInitialVirtualData) {
                                data = this.delimiterWrapper && this.delimiterWrapper.innerHTML === '' ? data :
                                    this.delimiterWrapper.innerHTML;
                            }
                            const value: string | number | boolean = this.allowObjectBinding ?
                                getValue(((this.fields.value) ? this.fields.value : ''), this.value[this.value.length - 1]) :
                                this.value[this.value.length - 1];
                            if (this.isRemoveSelection) {
                                data = this.text.replace(/,/g, delimiterChar + ' ') + delimiterChar + ' ';
                                text = this.text.split(delimiterChar);
                            } else {
                                temp = isInitialVirtualData && delim ? this.text.replace(/,/g, delimiterChar + ' ') : this.getTextByValue(value);
                                const textValues: string = this.isDynamicRemoteVirtualData && value != null && value !== '' && !isInitialVirtualData ?
                                    this.getTextByValue(value) : isInitialVirtualData ? this.text : (this.text && this.text !== '' ? this.text + this.delimiterChar + temp : temp);
                                data += temp + delimiterChar + ' ';
                                text.push(textValues);
                                hiddenElementContent = this.hiddenElement.innerHTML;
                            }
                            if ((e && e.currentTarget && (e.currentTarget as any).classList.contains('e-chips-close')) ||
                                (e && ((e as KeyboardEventArgs).key === 'Backspace'))) {
                                const item: any = (e.target as any).parentElement.getAttribute('data-value');
                                if ((e as KeyboardEventArgs).key === 'Backspace') {
                                    const lastChild: ChildNode = this.hiddenElement.lastChild;
                                    if (lastChild) {
                                        this.hiddenElement.removeChild(lastChild);
                                    }
                                }
                                else {
                                    this.hiddenElement.childNodes.forEach((option: HTMLOptionElement) => {
                                        if (option.value === item) {
                                            option.parentNode.removeChild(option);
                                        }
                                    });
                                }
                                hiddenElementContent = this.hiddenElement.innerHTML;
                            }
                            else {
                                hiddenElementContent += '<option selected value=\'' + value + '\'>' + index + '</option>';
                            }
                            break;
                        }
                        else{
                            temp = this.getTextByValue(valueItem);
                        }
                    } else {
                        temp = <string>valueItem;
                    }
                    data += temp + delimiterChar + ' ';
                    text.push(temp);
                }
                hiddenElementContent += `<option selected value="${valueItem}">${index}</option>`;
            }
            if (!isNullOrUndefined(this.hiddenElement)) {
                if (this.isRemoveSelection) {
                    if (this.findListElement(this.hiddenElement, 'option', 'value', this.currentRemoveValue)) {
                        this.hiddenElement.removeChild(this.findListElement(this.hiddenElement, 'option', 'value', this.currentRemoveValue));
                    }
                    this.isRemoveSelection = false;
                } else {
                    this.hiddenElement.innerHTML = hiddenElementContent;
                }
            }
        }
        const isChipRemove: boolean = e && e.target as HTMLElement && (e.target as HTMLElement).classList.contains('e-chips-close');
        if (!this.enableVirtualization || (this.enableVirtualization && this.mode !== 'CheckBox' && !isChipRemove)) {
            this.setProperties({ text: text.toString() }, true);
        }
        if (delim) {
            this.updateWrapperText(this.delimiterWrapper, data);
            this.delimiterWrapper.setAttribute('id', getUniqueID('delim_val'));
            this.inputElement.setAttribute('aria-describedby', this.delimiterWrapper.id);
        }
        const targetEle: HTMLElement = e && e.target as HTMLElement;
        const isClearAll: boolean = (targetEle && targetEle.classList.contains('e-close-hooker')) ? true : null;
        if (!this.changeOnBlur && ((e && !isClearAll)) || this.isSelectAll) {
            this.isSelectAll = false;
            this.updateValueState(e, this.value, this.tempValues);
        }
        this.listData = <{ [key: string]: Object }[]>tempData;
        this.addValidInputClass();
    }
    private initialTextUpdate(): void {
        if (!isNullOrUndefined(this.text)) {
            const textArr: string[] = this.text.split(this.delimiterChar);
            const textVal: string[] | number[] | boolean[] = [];
            for (let index: number = 0; textArr.length > index; index++) {
                const val: string | boolean | number = this.getValueByText(textArr[index as number]);
                if (!isNullOrUndefined(val)) {
                    (<string[]>textVal).push(val as string);
                } else if ( this.allowCustomValue ) {
                    (<string[]>textVal).push(textArr[index as number] as string);
                }
            }
            if (textVal && textVal.length) {
                const value: string | boolean | number | Object = this.allowObjectBinding ? this.getDataByValue(textVal) : textVal;
                this.setProperties({ value: value }, true);
            }
        } else {
            this.setProperties({ value: null }, true);
        }
    }
    protected renderList(isEmptyData?: boolean): void {
        if (!isEmptyData && this.allowCustomValue && this.list && (this.list.textContent === this.noRecordsTemplate
            || this.list.querySelector('.e-ul') && this.list.querySelector('.e-ul').childElementCount === 0)) {
            isEmptyData = true;
        }
        super.render(null, isEmptyData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.totalItemCount = this.dataSource && (this.dataSource as any).length ? (this.dataSource as any).length : 0;
        this.unwireListEvents();
        this.wireListEvents();
    }
    private initialValueUpdate(listItems?: any, isInitialVirtualData?: boolean): void {
        if (this.list) {
            let text: string;
            let element: HTMLElement;
            let value: string | number | boolean;
            if (this.chipCollectionWrapper) {
                this.chipCollectionWrapper.innerHTML = '';
            }
            this.removeListSelection();

            if (!isNullOrUndefined(this.value)) {
                for (let index: number = 0; !isNullOrUndefined(this.value[index as number]); index++) {
                    value = this.allowObjectBinding ?
                        getValue(((this.fields.value) ? this.fields.value : ''), this.value[index as number]) :
                        this.value[index as number];
                    element = this.findListElement( this.hideSelectedItem ? this.ulElement : this.list, 'li', 'data-value', value);
                    let isCustomData: boolean = false;
                    if (this.enableVirtualization){
                        text = null;
                        if (listItems != null && listItems.length > 0){
                            for (let i: number = 0; i < listItems.length; i++){
                                if ((this.isPrimitiveData && listItems[i as number] === value) || (!this.isPrimitiveData
                                    && getValue((this.fields.value ? this.fields.value :
                                        'value'), listItems[i as number]) === value)){
                                    text = this.isPrimitiveData ? listItems[i as number] :
                                        getValue(this.fields.text, listItems[i as number]);
                                    if (this.enableVirtualization) {
                                        if (isNullOrUndefined(this.selectedListData)) {
                                            this.selectedListData = [listItems[i as number]];
                                        } else {
                                            if ((this.allowObjectBinding && !this.isObjectInArray(listItems[i as number],
                                                                                                  this.selectedListData)) ||
                                                                                                !this.allowObjectBinding) {
                                                if (Array.isArray(this.selectedListData)) {
                                                    this.selectedListData.push((listItems[i as number]) as never);
                                                } else {
                                                    this.selectedListData = [this.selectedListData, (listItems[i as number]) as any];
                                                }
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        if (
                            (isNullOrUndefined(text) && this.allowCustomValue) &&
                            (
                                (!(this.dataSource instanceof DataManager)) ||
                                (this.dataSource instanceof DataManager && isInitialVirtualData)
                            )
                        ) {
                            text = this.getTextByValue(value);
                            isCustomData = true;
                        }
                        else if (
                            (isNullOrUndefined(text) && !this.allowCustomValue) &&
                            (
                                (!(this.dataSource instanceof DataManager)) ||
                                (this.dataSource instanceof DataManager && isInitialVirtualData)
                            )
                        ) {
                            this.value.splice(index, 1);
                            index -= 1;
                        }
                    }
                    else{
                        text = this.getTextByValue(value);
                    }
                    if (((element && (element.getAttribute('aria-selected') !== 'true')) ||
                        (element && (element.getAttribute('aria-selected') === 'true' && this.hideSelectedItem) &&
                            (this.mode === 'Box' || this.mode === 'Default'))) ||
                        (this.enableVirtualization && value != null && text != null && !isCustomData)) {
                        const currentText: string[] = [];
                        const textValues: string = this.isDynamicRemoteVirtualData && text != null && text !== '' && index === 0 ? text : this.text != null && this.text !== '' && !(this.text as any).includes(text) ? this.text + this.delimiterChar + text : text;
                        currentText.push(textValues);
                        this.setProperties({ text: currentText.toString() }, true);
                        this.addChip(text, value);
                        this.addListSelection(element);
                    } else if (
                        (!this.enableVirtualization && value && this.allowCustomValue) ||
                        (
                            this.enableVirtualization &&
                            value &&
                            this.allowCustomValue &&
                            (
                                (!(this.dataSource instanceof DataManager)) ||
                                (this.dataSource instanceof DataManager && isInitialVirtualData)
                            )
                        )
                    ) {
                        const indexItem: number = this.listData.length;
                        const newValue: { [key: string]: string | Object } = {};
                        setValue(this.fields.text, value, newValue);
                        setValue(this.fields.value, value, newValue);
                        const noDataEle: HTMLElement = this.popupWrapper.querySelector('.' + dropDownBaseClasses.noData);
                        if (!this.enableVirtualization) {
                            this.addItem(newValue, indexItem);
                        }
                        if (this.enableVirtualization) {
                            if (this.virtualCustomSelectData && this.virtualCustomSelectData.length >= 0) {
                                (this.virtualCustomSelectData as { [key: string]: object }[]).push(newValue as { [key: string]: object });
                            }
                            else {
                                (this.virtualCustomSelectData as { [key: string]: object }[]) = [newValue as { [key: string]: object }];
                            }
                        }
                        element = element ? element : this.findListElement(this.hideSelectedItem ?
                            this.ulElement : this.list, 'li', 'data-value', value);
                        if (this.popupWrapper.contains(noDataEle)) {
                            this.list.setAttribute('style', noDataEle.getAttribute('style'));
                            this.popupWrapper.replaceChild(this.list, noDataEle);
                            this.wireListEvents();
                        }
                        const currentText: string[] = [];
                        const textValues: string = this.text != null && this.text !== '' ? this.text + this.delimiterChar + text : text;
                        currentText.push(textValues);
                        this.setProperties({ text: currentText.toString() }, true);
                        this.addChip(text, value);
                        this.addListSelection(element);
                    }
                }
            }
            if (this.mode === 'CheckBox') {
                this.updateDelimView();
                if (this.changeOnBlur) {
                    this.updateValueState(null, this.value, this.tempValues);
                }
                this.updateDelimeter(this.delimiterChar);
                this.refreshInputHight();
            } else {
                this.updateDelimeter(this.delimiterChar, null, isInitialVirtualData);
            }
            if (this.mode === 'CheckBox' && this.showSelectAll && (isNullOrUndefined(this.value) || !this.value.length)) {
                this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'uncheck' });
            }
            if (this.mode === 'Box' || (this.mode === 'Default' && this.inputFocus)) {
                this.chipCollectionWrapper.style.display = '';
            } else if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
                this.showDelimWrapper();
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected updateActionCompleteData(li: HTMLElement, item: { [key: string]: Object }): void {
        if (this.value && ((!this.allowObjectBinding && (this.value as string[]).indexOf(li.getAttribute('data-value')) > -1) ||
           (this.allowObjectBinding && this.isObjectInArray(this.getDataByValue(li.getAttribute('data-value')), this.value)))) {
            this.mainList = this.ulElement;
            if (this.hideSelectedItem) {
                addClass([li], HIDE_LIST);
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected updateAddItemList(list: HTMLElement, itemCount: number): void {
        if (this.popupObj && this.popupObj.element && this.popupObj.element.querySelector('.' + dropDownBaseClasses.noData) && list) {
            this.list = list;
            this.mainList = this.ulElement = list.querySelector('ul');
            remove(this.popupWrapper.querySelector('.e-content'));
            this.popupObj = null;
            this.renderPopup();
        } else if  (this.allowCustomValue) {
            this.list = list;
            this.mainList = this.ulElement = list.querySelector('ul');
        }
    }
    protected updateDataList(): void {
        if (this.mainList && this.ulElement && !(this.isFiltered || this.isFilterAction || this.targetElement().trim())) {
            const isDynamicGroupItemUpdate: boolean = this.mainList.childElementCount < this.ulElement.childElementCount;
            const isReactTemplateUpdate: boolean = ((this.ulElement.childElementCount > 0 &&
                this.ulElement.children[0].childElementCount > 0) &&
                (this.mainList.children[0] && (this.mainList.children[0].childElementCount <
                    this.ulElement.children[0].childElementCount)));
            const isAngularTemplateUpdate: boolean = this.itemTemplate && this.ulElement.childElementCount > 0 &&
                !(this.ulElement.childElementCount < this.mainList.childElementCount) &&
                (this.ulElement.children[0].childElementCount > 0 ||
                    (this.fields.groupBy && this.ulElement.children[1] && this.ulElement.children[1].childElementCount > 0));
            if (isDynamicGroupItemUpdate || isReactTemplateUpdate || isAngularTemplateUpdate) {
                //EJ2-57748 - for this task, we prevent the ul element cloning ( this.mainList = this.ulElement.cloneNode ? <HTMLElement>this.ulElement.cloneNode(true) : this.ulElement;)
                this.mainList = this.ulElement;
            }
        }
    }
    protected isValidLI(li: Element | HTMLElement): boolean {
        return (li && !li.classList.contains(dropDownBaseClasses.disabled) && !li.classList.contains(dropDownBaseClasses.group) &&
            li.classList.contains(dropDownBaseClasses.li));
    }
    protected updateListSelection(li: Element, e: MouseEvent | KeyboardEventArgs, length?: number): void {
        const customVal: string | number | boolean = li.getAttribute('data-value');
        let value: string | number | boolean | object = this.allowObjectBinding ?
            this.getDataByValue(this.getFormattedValue(customVal)) : this.getFormattedValue(customVal);
        if (this.allowCustomValue && ((customVal !== 'false' && value === false) ||
            (!isNullOrUndefined(value) && value.toString() === 'NaN'))) {
            value = customVal;
        }
        this.removeHover();
        if (!this.value || ((!this.allowObjectBinding && (this.value as string[]).indexOf(value as string) === -1) ||
            (this.allowObjectBinding && this.indexOfObjectInArray(value, this.value) === -1))) {
            this.dispatchSelect(value, e, <HTMLElement>li, (li.getAttribute('aria-selected') === 'true'), length);
        } else {
            this.removeValue(value, e, length);
        }
        this.checkAndScrollParent();
    }
    private updateListSelectEventCallback(
        value: string | number | boolean |object,
        li: Element,
        e: MouseEvent | KeyboardEventArgs,
        currentText?: string): void {
        value = this.allowObjectBinding ? getValue(((this.fields.value) ? this.fields.value : ''), value) : value;
        const text: string = currentText ? currentText : this.getTextByValue(value as string | number | boolean);
        if ((this.allowCustomValue || this.allowFiltering) &&
             !this.findListElement(this.mainList, 'li', 'data-value', value as string | number | boolean) &&
           (!this.enableVirtualization || (this.enableVirtualization && this.virtualCustomData))) {
            const temp: HTMLElement = <HTMLElement>li ? <HTMLElement>li.cloneNode(true) : <HTMLElement>li;
            const fieldValue: string = this.fields.value ? this.fields.value : 'value';
            if (this.allowCustomValue && this.mainData.length && typeof getValue(fieldValue, this.mainData[0]) === 'number') {
                value = !isNaN(parseFloat(value.toString())) ? parseFloat(value.toString()) : value;
            }
            const data: Object = this.getDataByValue(value);
            const eventArgs: CustomValueEventArgs = {
                newData: data,
                cancel: false
            };
            this.trigger('customValueSelection', eventArgs, (eventArgs: CustomValueEventArgs) => {
                if (!eventArgs.cancel) {
                    if (this.enableVirtualization && this.virtualCustomData){
                        if (this.virtualCustomSelectData && this.virtualCustomSelectData.length >= 0) {
                            (this.virtualCustomSelectData as { [key: string]: object }[]).push(data as { [key: string]: object });
                        }
                        else {
                            (this.virtualCustomSelectData as { [key: string]: object }[]) = [data as { [key: string]: object }];
                        }
                        this.remoteCustomValue = false;
                        this.addValue(value as string | number | boolean, text, e);
                    }
                    else{
                        append([temp], this.mainList);
                        (this.mainData as { [key: string]: object }[]).push(data as { [key: string]: object });
                        this.remoteCustomValue = false;
                        this.addValue(value as string | number | boolean, text, e);
                    }
                }
            });
        } else {
            this.remoteCustomValue = false;
            this.addValue(value as string | number | boolean, text, e);
        }
    }
    protected removeListSelection(): void {
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        const selectedItems: Element[] = <NodeListOf<Element> & Element[]>this.list.querySelectorAll('.' + className);
        let temp: number = selectedItems.length;
        if (selectedItems && selectedItems.length) {
            removeClass(selectedItems, className);
            while (temp > 0) {
                selectedItems[temp - 1].setAttribute('aria-selected', 'false');
                if (this.mode === 'CheckBox') {
                    if (selectedItems && (selectedItems.length > (temp - 1))) {
                        removeClass([selectedItems[temp - 1].firstElementChild.lastElementChild], 'e-check');
                    }
                }
                temp--;
            }
        }
        if (!isNullOrUndefined(this.mainList)) {
            const selectItems: Element[] = <NodeListOf<Element> & Element[]>this.mainList.querySelectorAll('.' + className);
            let temp1: number = selectItems.length;
            if (selectItems && selectItems.length) {
                removeClass(selectItems, className);
                while (temp1 > 0) {
                    selectItems[temp1 - 1].setAttribute('aria-selected', 'false');
                    if (this.mode === 'CheckBox') {
                        if (selectedItems && (selectedItems.length > (temp1 - 1))) {
                            removeClass([selectedItems[temp1 - 1].firstElementChild.lastElementChild], 'e-check');
                        }
                        removeClass([selectItems[temp1 - 1].firstElementChild.lastElementChild], 'e-check');
                    }
                    temp1--;
                }
            }
        }
    }
    private removeHover(): void {
        const hoveredItem: Element[] = <NodeListOf<Element> & Element[]>this.list.querySelectorAll('.' + dropDownBaseClasses.hover);
        if (hoveredItem && hoveredItem.length) {
            removeClass(hoveredItem, dropDownBaseClasses.hover);
        }
    }
    private removeFocus(): void {
        if (this.list && this.mainList) {
            const hoveredItem: Element[] = <NodeListOf<Element> & Element[]>this.list.querySelectorAll('.' + dropDownBaseClasses.focus);
            const mainlist: Element[] = <NodeListOf<Element> & Element[]>this.mainList.querySelectorAll('.' + dropDownBaseClasses.focus);
            if (hoveredItem && hoveredItem.length) {
                removeClass(hoveredItem, dropDownBaseClasses.focus);
                removeClass(mainlist, dropDownBaseClasses.focus);
            }
        }
    }
    private addListHover(li: HTMLElement): void {
        if (this.enabled && this.isValidLI(li)) {
            this.removeHover();
            addClass([li], dropDownBaseClasses.hover);
        } else {
            if ((li !== null && li.classList.contains('e-list-group-item')) && this.enableGroupCheckBox && this.mode === 'CheckBox'
            && !isNullOrUndefined(this.fields.groupBy)) {
                this.removeHover();
                addClass([li], dropDownBaseClasses.hover);
            }
        }
    }
    private addListFocus(element: HTMLElement): void {
        if (this.enabled && (this.isValidLI(element) || (this.fields.disabled && this.isDisabledElement(element)))) {
            this.removeFocus();
            addClass([element], dropDownBaseClasses.focus);
            this.updateAriaActiveDescendant();
        } else {
            if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
                addClass([element], dropDownBaseClasses.focus);
                this.updateAriaActiveDescendant();
            }
        }
    }
    private addListSelection(element: HTMLElement, mainElement?: HTMLElement): void {
        const className: string = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (this.isValidLI(element) && !element.classList.contains(dropDownBaseClasses.hover)) {
            addClass([element], className);
            this.updateMainList(false, <string>element.getAttribute('data-value'), mainElement);
            element.setAttribute('aria-selected', 'true');
            if (this.mode === 'CheckBox'  && element.classList.contains('e-active')) {
                const ariaCheck: number = element.getElementsByClassName('e-check').length;
                if (ariaCheck === 0) {
                    this.notify('updatelist', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: this });
                }
            }
            this.notify('activeList', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: this });
            if (this.chipCollectionWrapper) {
                this.removeChipSelection();
            }
            this.selectedElementID = element.id;
        }
    }
    private updateDelimeter(delimChar: string, e?: MouseEvent | KeyboardEventArgs, isInitialVirtualData?: boolean): void {
        this.updateData(delimChar, e, isInitialVirtualData);
    }
    private onMouseClick(e: MouseEvent): void {
        if (!this.isClearAllItem) {
            this.keyCode = null;
            this.scrollFocusStatus = false;
            this.keyboardEvent = null;
            let target: Element = <Element>e.target;
            const li: HTMLElement = <HTMLElement>closest(target, '.' + dropDownBaseClasses.li);
            if (this.enableVirtualization && li && li.classList.contains('e-virtual-list')) {
                return;
            }
            const headerLi: HTMLElement = <HTMLElement>closest(target, '.' + dropDownBaseClasses.group);
            if (headerLi && this.enableGroupCheckBox && this.mode === 'CheckBox' && this.fields.groupBy) {
                target = target.classList.contains('e-list-group-item') ? target.firstElementChild.lastElementChild
                    : <Element>e.target;
                if (target.classList.contains('e-check')) {
                    this.selectAllItem(false, e);
                    target.classList.remove('e-check');
                    target.classList.remove('e-stop');
                    closest(target, '.' + 'e-list-group-item').classList.remove('e-active');
                    target.setAttribute('aria-selected', 'false');
                } else {
                    this.selectAllItem(true, e);
                    target.classList.remove('e-stop');
                    target.classList.add('e-check');
                    closest(target, '.' + 'e-list-group-item').classList.add('e-active');
                    target.setAttribute('aria-selected', 'true');
                }
                this.refreshSelection();
                this.checkSelectAll();
            } else {
                if (this.isValidLI(li)) {
                    let limit: number = this.value && this.value.length ? this.value.length : 0;
                    if (li.classList.contains('e-active')) {
                        limit = limit - 1;
                    }
                    if (limit < this.maximumSelectionLength) {
                        this.updateListSelection(li, e);
                        this.checkPlaceholderSize();
                        this.addListFocus(<HTMLElement>li);
                        if ((this.allowCustomValue || this.allowFiltering) && this.mainList && this.listData) {
                            if (this.mode !== 'CheckBox') {
                                this.focusAtLastListItem(<string>li.getAttribute('data-value'));
                                this.refreshSelection();
                            }
                        } else {
                            this.makeTextBoxEmpty();
                        }
                    }
                    if (this.mode === 'CheckBox') {
                        this.updateDelimView();
                        if (this.value && this.value.length > 50) {
                            setTimeout(
                                (): void => {
                                    this.updateDelimeter(this.delimiterChar, e);
                                },
                                0
                            );
                        } else {
                            this.updateDelimeter(this.delimiterChar, e);
                        }
                        this.refreshInputHight();
                    } else {
                        this.updateDelimeter(this.delimiterChar, e);
                    }
                    this.checkSelectAll();
                    this.refreshPopup();
                    if (this.allowResize) {
                        this.setResize();
                    }
                    if (this.hideSelectedItem) {
                        this.focusAtFirstListItem();
                    }
                    if (this.closePopupOnSelect) {
                        this.hidePopup(e);
                    } else {
                        e.preventDefault();
                    }
                    const isFilterData: boolean = this.targetElement().trim() !== '' ? true : false;
                    this.makeTextBoxEmpty();
                    this.findGroupStart(target as HTMLElement);
                    if (this.mode !== 'CheckBox') {
                        this.refreshListItems(isNullOrUndefined(li) ? null : li.textContent, isFilterData);
                    }
                } else {
                    e.preventDefault();
                }
                if (this.enableVirtualization && this.hideSelectedItem) {
                    const visibleListElements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                        + dropDownBaseClasses.li
                        + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list)');
                    if (visibleListElements.length) {
                        const actualCount: number = this.virtualListHeight > 0 ?
                            Math.floor(this.virtualListHeight / this.listItemHeight) : 0;
                        if (visibleListElements.length < (actualCount + 2)) {
                            let query: Query = this.getForQuery(this.value).clone();
                            query = query.skip(this.virtualItemStartIndex);
                            this.resetList(this.dataSource, this.fields, query);
                            this.UpdateSkeleton();
                            this.liCollections = <HTMLElement[] & NodeListOf<Element>>this.list.querySelectorAll('.'
                                + dropDownBaseClasses.li);
                            this.virtualItemCount = this.itemCount;
                            if (this.mode !== 'CheckBox') {
                                this.totalItemCount = this.value && this.value.length ? this.totalItemCount - this.value.length :
                                    this.totalItemCount;
                            }

                            if (!this.list.querySelector('.e-virtual-ddl')) {
                                const virualElement: HTMLElement = this.createElement('div', {
                                    id: this.element.id + '_popup',
                                    className: 'e-virtual-ddl'
                                });
                                virualElement.style.cssText = this.GetVirtualTrackHeight();
                                this.popupWrapper.querySelector('.e-dropdownbase').appendChild(virualElement);
                            }
                            else {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (this.list.getElementsByClassName('e-virtual-ddl')[0] as any).style = this.GetVirtualTrackHeight();
                            }
                            if (this.list.querySelector('.e-virtual-ddl-content')) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (this.list.getElementsByClassName('e-virtual-ddl-content')[0] as any).style = this.getTransformValues();
                            }
                        }
                    }
                }
                this.refreshPlaceHolder();
                this.deselectHeader();
            }
        }
    }
    private findGroupStart(target: HTMLElement): void {
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            const count: number = 0;
            const liChecked : number = 0;
            const liUnchecked : number = 0;
            let groupValues: number[];
            if (this.itemTemplate && !target.getElementsByClassName('e-frame').length) {
                while (!target.getElementsByClassName('e-frame').length) {
                    target = target.parentElement;
                }
            }
            if (target.classList.contains('e-frame')) {
                target = target.parentElement.parentElement;
            }
            groupValues = this.findGroupAttrtibutes(target, liChecked, liUnchecked, count, 0);
            groupValues = this.findGroupAttrtibutes(target, groupValues[0], groupValues[1], groupValues[2], 1);
            while (!target.classList.contains('e-list-group-item')) {
                if (target.classList.contains('e-list-icon')) {
                    target = target.parentElement;
                }
                (target as Element) = target.previousElementSibling;
                if (target == null) {
                    break;
                }
            }
            this.updateCheckBox(target, groupValues[0], groupValues[1], groupValues[2]);
        }
    }

    private findGroupAttrtibutes(listElement: Element, checked: number, unChecked: number, count: number, position: number): number[] {
        while (!listElement.classList.contains('e-list-group-item')) {
            if (!(this.fields.disabled && this.isDisabledElement(listElement as HTMLElement))) {
                if (listElement.classList.contains('e-list-icon')) {
                    listElement = listElement.parentElement;
                }
                if (listElement.getElementsByClassName('e-frame')[0].classList.contains('e-check') &&
                    listElement.classList.contains('e-list-item')) {
                    checked++;
                } else if (listElement.classList.contains('e-list-item')) {
                    unChecked++;
                }
                count++;
            }
            (listElement as Element) = position ? listElement.nextElementSibling : listElement.previousElementSibling;
            if (listElement == null) {
                break;
            }
        }
        return [checked, unChecked, count];
    }
    private updateCheckBox(groupHeader: Element, checked: number, unChecked: number, count: number): void {
        if (groupHeader === null || (!isNullOrUndefined(this.fields.disabled) && count === 0)) {
            return;
        }
        const checkBoxElement : Element = groupHeader.getElementsByClassName('e-frame')[0];
        if (count === checked) {
            checkBoxElement.classList.remove('e-stop');
            checkBoxElement.classList.add('e-check');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            groupHeader.setAttribute('aria-selected', 'true');
        } else if (count === unChecked) {
            checkBoxElement.classList.remove('e-check');
            checkBoxElement.classList.remove('e-stop');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.remove('e-active');
            groupHeader.setAttribute('aria-selected', 'false');
        } else if (this.maximumSelectionLength === checked - 1) {
            checkBoxElement.classList.remove('e-stop');
            groupHeader.setAttribute('aria-selected', 'true');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            checkBoxElement.classList.add('e-check');
        } else {
            checkBoxElement.classList.remove('e-check');
            checkBoxElement.classList.add('e-stop');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            groupHeader.setAttribute('aria-selected', 'false');
        }
    }
    private disableGroupHeader (): void {
        const collection: NodeListOf<HTMLLIElement> = this.list.querySelectorAll('li.e-list-group-item');
        if (collection) {
            for (let index: number = 0; index < collection.length; index++) {
                let isDisabled: boolean = true;
                let target: Element = collection[index as number].nextElementSibling as Element;
                while (!target.classList.contains('e-list-group-item')) {
                    if (!this.isDisabledElement(target as HTMLElement)) {
                        isDisabled = false;
                        break;
                    }
                    target = target.nextElementSibling;
                    if (target == null) {
                        break;
                    }
                }
                if (isDisabled) {
                    this.disableListItem(collection[index as number]);
                }
            }
        }
    }
    private deselectHeader (): void {
        const limit: number = this.value && this.value.length ? this.value.length : 0;
        const collection: NodeList = this.list.querySelectorAll('li.e-list-group-item:not(.e-active)');
        if (limit < this.maximumSelectionLength) {
            removeClass(collection, 'e-disable');
        }
        if (limit === this.maximumSelectionLength) {
            addClass(collection, 'e-disable');
        }
    }
    private onMouseOver(e: MouseEvent): void {
        let currentLi: HTMLElement = <HTMLElement>closest(<Element>e.target, '.' + dropDownBaseClasses.li);
        if (currentLi === null && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)
            && this.enableGroupCheckBox) {
            currentLi = <HTMLElement>closest(<Element>e.target, '.' + dropDownBaseClasses.group);
        }
        this.addListHover(currentLi);
    }
    private onMouseLeave(): void {
        this.removeHover();
    }
    private onListMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.scrollFocusStatus = true;
    }
    private onDocumentClick(e: MouseEvent): void {
        if (this.mode !== 'CheckBox') {
            const target: HTMLElement = <HTMLElement>e.target;
            if (!(!isNullOrUndefined(this.popupObj) && closest(target, '[id="' + this.popupObj.element.id + '"]')) &&
                !this.overAllWrapper.contains(e.target as Node)) {
                this.scrollFocusStatus = false;
            } else {
                this.scrollFocusStatus = (Browser.isIE || Browser.info.name === 'edge') && (document.activeElement === this.inputElement);
            }
        }
    }
    private wireListEvents(): void {
        if (!isNullOrUndefined(this.list)) {
            EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
            EventHandler.add(this.list, 'mousedown', this.onListMouseDown, this);
            EventHandler.add(this.list, 'mouseup', this.onMouseClick, this);
            EventHandler.add(this.list, 'mouseover', this.onMouseOver, this);
            EventHandler.add(this.list, 'mouseout', this.onMouseLeave, this);
        }
    }
    private unwireListEvents(): void {
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        if (this.list) {
            EventHandler.remove(this.list, 'mousedown', this.onListMouseDown);
            EventHandler.remove(this.list, 'mouseup', this.onMouseClick);
            EventHandler.remove(this.list, 'mouseover', this.onMouseOver);
            EventHandler.remove(this.list, 'mouseout', this.onMouseLeave);
        }
    }
    private hideOverAllClear(): void {
        if (!this.value || !this.value.length || this.inputElement.value === '') {
            this.overAllClear.style.display = 'none';
        }
    }
    private showOverAllClear(): void {
        if (((this.value && this.value.length) || this.inputElement.value !== '') && this.showClearButton && this.readonly !== true) {
            this.overAllClear.style.display = '';
        } else {
            this.overAllClear.style.display = 'none';
        }
    }

    /**
     * Sets the focus to widget for interaction.
     *
     * @returns {void}
     */
    public focusIn(): void {
        if (document.activeElement !== this.inputElement && this.enabled) {
            this.inputElement.focus();
        }
    }

    /**
     * Remove the focus from widget, if the widget is in focus state.
     *
     * @returns {void}
     */
    public focusOut(): void {
        if (document.activeElement === this.inputElement && this.enabled) {
            this.inputElement.blur();
        }
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     */
    public showSpinner(): void {
        if (isNullOrUndefined(this.spinnerElement)) {
            const filterClear: HTMLElement = this.filterParent && this.filterParent.querySelector('.e-clear-icon.e-icons');
            if (this.overAllClear.style.display !== 'none' || filterClear) {
                this.spinnerElement = filterClear ? filterClear : this.overAllClear;
            } else {
                this.spinnerElement = this.createElement('span', { className: CLOSEICON_CLASS + ' ' + SPINNER_CLASS });
                this.componentWrapper.appendChild(this.spinnerElement);
            }
            createSpinner({ target: this.spinnerElement, width: Browser.isDevice ? '16px' : '14px' }, this.createElement);
            addClass([this.spinnerElement], DISABLE_ICON);
            showSpinner(this.spinnerElement);
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @returns {void}
     */
    public hideSpinner(): void {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
            removeClass([this.spinnerElement], DISABLE_ICON);
            if (this.spinnerElement.classList.contains(SPINNER_CLASS)) {
                detach(this.spinnerElement);
            } else {
                this.spinnerElement.innerHTML = '';
            }
            this.spinnerElement = null;
        }
    }
    protected updateWrapperText(wrapperType: HTMLElement , wrapperData: string): void {
        if (this.valueTemplate || !this.enableHtmlSanitizer) {
            wrapperType.innerHTML = this.encodeHtmlEntities(wrapperData);
        } else {
            wrapperType.innerText = wrapperData;
        }
    }
    private updateDelimView(): void {
        if (this.delimiterWrapper) {
            this.hideDelimWrapper();
        }
        if (this.chipCollectionWrapper) {
            this.chipCollectionWrapper.style.display = 'none';
        }
        if (!isNullOrUndefined(this.viewWrapper)) {
            this.viewWrapper.style.display = '';
            this.viewWrapper.style.width = '';
            this.viewWrapper.classList.remove(TOTAL_COUNT_WRAPPER);
        }
        if (this.value && this.value.length) {
            let data: string = '';
            let temp: string;
            let tempData: string;
            let tempIndex: number = 1;
            let wrapperleng: number;
            let remaining: number;
            let downIconWidth: number = 0;
            let overAllContainer: number;
            if (!this.enableVirtualization) {
                this.updateWrapperText(this.viewWrapper, data);
            }
            const l10nLocale: Object = {
                noRecordsTemplate: 'No records found',
                actionFailureTemplate: 'Request failed',
                overflowCountTemplate: '+${count} more..',
                totalCountTemplate: '${count} selected'
            };
            let l10n: L10n = new L10n(this.getLocaleName(), l10nLocale, this.locale);
            if (l10n.getConstant('actionFailureTemplate') === '') {
                l10n = new L10n('dropdowns', l10nLocale, this.locale);
            }
            if (l10n.getConstant('noRecordsTemplate') === '') {
                l10n = new L10n('dropdowns', l10nLocale, this.locale);
            }
            const remainContent: string = l10n.getConstant('overflowCountTemplate');
            const totalContent: string = l10n.getConstant('totalCountTemplate');
            const raminElement: HTMLElement = this.createElement('span', {
                className: REMAIN_WRAPPER
            });
            const remainCompildTemp: string = remainContent.replace('${count}', this.value.length.toString());
            raminElement.innerText = remainCompildTemp;
            this.viewWrapper.appendChild(raminElement);
            this.renderReactTemplates();
            const remainSize: number = raminElement.offsetWidth;
            remove(raminElement);
            if (this.showDropDownIcon) {
                downIconWidth = this.dropIcon.offsetWidth + parseInt(window.getComputedStyle(this.dropIcon).marginRight, 10);
            }
            this.checkClearIconWidth();
            if (!isNullOrUndefined(this.value) && (this.allowCustomValue || (this.listData && this.listData.length > 0))) {
                for (let index: number = 0; !isNullOrUndefined(this.value[index as number]); index++) {
                    const items: string[] = this.text && this.text.split(this.delimiterChar);
                    if (!this.enableVirtualization) {
                        data += (index === 0) ? '' : this.delimiterChar + ' ';
                        temp = this.getOverflowVal(index);
                        data += temp;
                        temp = this.viewWrapper.innerHTML;
                        this.updateWrapperText(this.viewWrapper, data);
                    }
                    else if (items){
                        data += (index === 0) ? '' : this.delimiterChar + ' ';
                        temp = items[index as number];
                        data += temp;
                        temp = this.viewWrapper.innerHTML;
                        this.updateWrapperText(this.viewWrapper, data);
                    }
                    wrapperleng = this.viewWrapper.offsetWidth +
                        parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10)  +
                        parseInt(window.getComputedStyle(this.viewWrapper).paddingLeft, 10);
                    overAllContainer = this.componentWrapper.offsetWidth -
                        parseInt(window.getComputedStyle(this.componentWrapper).paddingLeft, 10) -
                        parseInt(window.getComputedStyle(this.componentWrapper).paddingRight, 10);
                    if ((wrapperleng + downIconWidth + this.clearIconWidth) > overAllContainer) {
                        if (tempData !== undefined && tempData !== '') {
                            temp = tempData;
                            index = tempIndex + 1;
                        }
                        this.updateWrapperText(this.viewWrapper, temp);
                        remaining = this.value.length - index;
                        wrapperleng = this.viewWrapper.offsetWidth +
                            parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10) +
                            parseInt(window.getComputedStyle(this.viewWrapper).paddingLeft, 10);
                        while (((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) > overAllContainer) && wrapperleng !== 0
                            && this.viewWrapper.innerHTML !== '') {
                            const textArr: string[] = [];
                            this.viewWrapper.innerHTML = textArr.join(this.delimiterChar);
                            remaining = this.value.length;
                            wrapperleng = this.viewWrapper.offsetWidth +
                                parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10) +
                                parseInt(window.getComputedStyle(this.viewWrapper).paddingLeft, 10);
                        }
                        break;
                    } else if ((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) <= overAllContainer) {
                        tempData = data;
                        tempIndex = index;
                    } else if (index === 0) {
                        tempData = '';
                        tempIndex = -1;
                    }
                }
            }
            if (remaining > 0) {
                const totalWidth: number = overAllContainer - downIconWidth - this.clearIconWidth;
                this.viewWrapper.appendChild(
                    this.updateRemainTemplate( raminElement, this.viewWrapper, remaining, remainContent, totalContent, totalWidth)
                );
                this.updateRemainWidth(this.viewWrapper, totalWidth);
                this.updateRemainingText(raminElement, downIconWidth, remaining, remainContent, totalContent);
            }
        } else {
            if (!isNullOrUndefined(this.viewWrapper)) {
                this.viewWrapper.innerHTML = '';
                this.viewWrapper.style.display = 'none';
            }
        }
    }
    private checkClearIconWidth(): void {
        if (this.showClearButton) {
            this.clearIconWidth = parseInt(window.getComputedStyle(this.overAllClear).width, 10) || this.overAllClear.offsetWidth;
        }
    }
    private updateRemainWidth(viewWrapper: HTMLElement, totalWidth: number): void {
        if (viewWrapper.classList.contains(TOTAL_COUNT_WRAPPER) && totalWidth < (viewWrapper.offsetWidth +
            parseInt(window.getComputedStyle(viewWrapper).paddingLeft, 10)
            + parseInt(window.getComputedStyle(viewWrapper).paddingRight, 10))) {
            viewWrapper.style.width = totalWidth + 'px';
        }
    }
    private updateRemainTemplate(
        raminElement: HTMLElement,
        viewWrapper: HTMLElement,
        remaining: number,
        remainContent: string,
        totalContent: string,
        totalWidth?: number): HTMLElement {
        if (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3 && viewWrapper.firstChild.nodeValue === '') {
            viewWrapper.removeChild(viewWrapper.firstChild);
        }
        raminElement.innerHTML = '';
        const remainTemp: string = remainContent.replace('${count}', remaining.toString());
        const totalTemp: string = totalContent.replace('${count}', remaining.toString());
        raminElement.innerText = (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3) ? remainTemp : totalTemp;
        if (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3) {
            viewWrapper.classList.remove(TOTAL_COUNT_WRAPPER);
        } else {
            viewWrapper.classList.add(TOTAL_COUNT_WRAPPER);
            this.updateRemainWidth(viewWrapper, totalWidth);
        }
        return raminElement;
    }
    private updateRemainingText(
        raminElement: HTMLElement,
        downIconWidth: number,
        remaining: number,
        remainContent: string,
        totalContent: string): void {
        const overAllContainer: number = this.componentWrapper.offsetWidth -
            parseInt(window.getComputedStyle(this.componentWrapper).paddingLeft, 10) -
            parseInt(window.getComputedStyle(this.componentWrapper).paddingRight, 10);
        let wrapperleng: number = this.viewWrapper.offsetWidth + parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10);
        if (((wrapperleng + downIconWidth) >= overAllContainer) && wrapperleng !== 0 && this.viewWrapper.firstChild &&
            this.viewWrapper.firstChild.nodeType === 3) {
            while (((wrapperleng + downIconWidth) > overAllContainer)  && wrapperleng !== 0 && this.viewWrapper.firstChild &&
                this.viewWrapper.firstChild.nodeType === 3) {
                const textArr: string[] = (this.viewWrapper.firstChild as Text).nodeValue.split(this.delimiterChar);
                textArr.pop();
                this.viewWrapper.firstChild.nodeValue = textArr.join(this.delimiterChar);
                if (this.viewWrapper.firstChild.nodeValue === '') {
                    this.viewWrapper.removeChild(this.viewWrapper.firstChild);
                }
                remaining++;
                wrapperleng = this.viewWrapper.offsetWidth;
            }
            const totalWidth: number = overAllContainer - downIconWidth;
            this.updateRemainTemplate( raminElement, this.viewWrapper, remaining, remainContent, totalContent, totalWidth);
        }
    }
    private getOverflowVal(index: number): string {
        let temp: string;
        if (this.mainData && this.mainData.length) {
            const value: string | number | boolean = this.allowObjectBinding ?
                getValue(((this.fields.value) ? this.fields.value : ''), this.value[index as number]) : this.value[index as number];
            if (this.mode === 'CheckBox') {
                const newTemp: { [key: string]: Object }[] | number[] | boolean[] | string[] = this.listData;
                this.listData = this.mainData;
                temp = this.getTextByValue(value);
                this.listData = newTemp;
            } else {
                temp = this.getTextByValue(value);
            }
        } else {
            temp = this.allowObjectBinding ? getValue(((this.fields.value) ? this.fields.value : ''), this.value[index as number]) :
                <string>this.value[index as number];
        }
        return temp;
    }
    private unWireEvent(): void {
        if (!isNullOrUndefined(this.componentWrapper)) {
            EventHandler.remove(this.componentWrapper, 'mousedown', this.wrapperClick);
        }

        EventHandler.remove(<HTMLElement & Window><unknown>window, 'resize', this.windowResize);
        if (!isNullOrUndefined(this.inputElement)) {
            EventHandler.remove(this.inputElement, 'focus', this.focusInHandler);
            EventHandler.remove(this.inputElement, 'keydown', this.onKeyDown);
            if (this.mode !== 'CheckBox') {
                EventHandler.remove(this.inputElement, 'input', this.onInput);
            }
            EventHandler.remove(this.inputElement, 'keyup', this.keyUp);
            const formElement: HTMLFormElement = closest(this.inputElement, 'form') as HTMLFormElement;
            if (formElement) {
                EventHandler.remove(formElement, 'reset', this.resetValueHandler);
            }
            EventHandler.remove(this.inputElement, 'blur', this.onBlurHandler);
        }
        if (!isNullOrUndefined(this.componentWrapper)) {
            EventHandler.remove(this.componentWrapper, 'mouseover', this.mouseIn);
            EventHandler.remove(this.componentWrapper, 'mouseout', this.mouseOut);
        }
        if (!isNullOrUndefined(this.overAllClear)) {
            EventHandler.remove(this.overAllClear, 'mousedown', this.clearAll);
        }
        if (!isNullOrUndefined(this.inputElement)) {
            EventHandler.remove(this.inputElement, 'paste', this.pasteHandler);
        }
    }
    protected resizingWireEvent(): void {
        // Mouse events
        EventHandler.add(document, 'mousemove', this.resizePopup, this);
        EventHandler.add(document, 'mouseup', this.stopResizing, this);
        // Touch events
        EventHandler.add(document, 'touchmove', this.resizePopup, this);
        EventHandler.add(document, 'touchend', this.stopResizing, this);
    }
    protected resizingUnWireEvent(): void {
        // Mouse events
        EventHandler.remove(document, 'mousemove', this.resizePopup);
        EventHandler.remove(document, 'mouseup', this.stopResizing);
        // Touch events
        EventHandler.remove(document, 'touchmove', this.resizePopup);
        EventHandler.remove(document, 'touchend', this.stopResizing);
    }
    private selectAllItem(state: boolean, event?: MouseEvent | KeyboardEventArgs, list? : HTMLElement): void {
        let li: HTMLElement[] & NodeListOf<Element>;
        if (!isNullOrUndefined(this.list)) {
            li = <HTMLElement[] & NodeListOf<Element>>this.list.querySelectorAll(state ?
                'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide):not(.e-disabled):not(.e-virtual-list)' :
                'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide):not(.e-disabled):not(.e-virtual-list)');
        }
        if (this.value && this.value.length && event && event.target
        && closest(event.target as Element, '.e-close-hooker') && this.allowFiltering) {
            li = <HTMLElement[] & NodeListOf<Element>>this.mainList.querySelectorAll(state ?
                'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide):not(.e-disabled):not(.e-virtual-list)' :
                'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide):not(.e-disabled):not(.e-virtual-list)');
        }
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            let target: Element = <Element>(event ? (this.groupTemplate ?
                closest(event.target as Element, '.e-list-group-item') : event.target ) : null);
            target = (event && (event as KeyboardEvent).keyCode === 32) ? list : target;
            target = (target && target.classList.contains('e-frame')) ? target.parentElement.parentElement : target;
            if (target && target.classList.contains('e-list-group-item')) {
                let listElement : Element = target.nextElementSibling;
                if (isNullOrUndefined(listElement)) {
                    return;
                }
                while (listElement.classList.contains('e-list-item')) {
                    if (!(this.fields.disabled && this.isDisabledElement(listElement as HTMLElement))) {
                        if (state) {
                            if (!listElement.firstElementChild.lastElementChild.classList.contains('e-check')) {
                                let selectionLimit: number = this.value && this.value.length ? this.value.length : 0;
                                if (listElement.classList.contains('e-active')) {
                                    selectionLimit -= 1;
                                }
                                if (selectionLimit < this.maximumSelectionLength) {
                                    this.updateListSelection(listElement, event);
                                }
                            }
                        } else {
                            if (listElement.firstElementChild.lastElementChild.classList.contains('e-check')) {
                                this.updateListSelection(listElement, event);
                            }
                        }
                    }
                    listElement = listElement.nextElementSibling;
                    if (listElement == null) {
                        break;
                    }
                }
                if (target.classList.contains('e-list-group-item')) {
                    const focusedElement: Element = this.list.getElementsByClassName('e-item-focus')[0];
                    if (focusedElement) {
                        focusedElement.classList.remove('e-item-focus');
                    }
                    if (state) {
                        target.classList.add('e-active');
                    } else {
                        target.classList.remove('e-active');
                    }
                    target.classList.add('e-item-focus');
                    this.updateAriaActiveDescendant();
                }
                this.textboxValueUpdate();
                this.checkPlaceholderSize();
                if (!this.changeOnBlur && event) {
                    this.updateValueState(event, this.value, this.tempValues);
                }
            } else {
                this.updateValue(event, li, state);
            }
        } else {
            this.updateValue(event, li, state);
        }
        this.addValidInputClass();
    }

    protected virtualSelectionAll(
        state: boolean,
        li: NodeListOf<HTMLElement> | HTMLElement[],
        event: MouseEvent | KeyboardEventArgs
    ): void {
        let index: number = 0;
        let length: number = li.length;
        const count: number = this.maximumSelectionLength;
        if (state) {
            this.virtualSelectAll = true;
            length = this.virtualSelectAllData && this.virtualSelectAllData.length !== 0 ? this.virtualSelectAllData.length : length;
            this.listData = this.virtualSelectAllData;
            const ulElement: HTMLElement =
                this.createListItems(
                    this.virtualSelectAllData.slice(0, 30) as { [key: string]: Object }[],
                    this.fields
                );
            const firstItems: NodeListOf<HTMLLIElement> = ulElement.querySelectorAll('li');
            const fragment: DocumentFragment = document.createDocumentFragment();
            firstItems.forEach((node: HTMLElement) => {
                fragment.appendChild(node.cloneNode(true));
            });
            li.forEach((node: HTMLElement) => {
                fragment.appendChild(node.cloneNode(true));
            });
            const concatenatedNodeList: NodeListOf<HTMLElement>| HTMLElement[] = fragment.childNodes as NodeListOf<HTMLElement>;

            if (this.virtualSelectAllData instanceof Array) {
                while (index < length && index <= 50 && index < count) {
                    this.isSelectAllTarget = (length === index + 1);
                    if (concatenatedNodeList[index as number]) {
                        const value: string | number | boolean | object = this.allowObjectBinding
                            ? this.getDataByValue(
                                concatenatedNodeList[index as number].getAttribute('data-value')
                            )
                            : this.getFormattedValue(
                                concatenatedNodeList[index as number].getAttribute('data-value')
                            );
                        if (((!this.allowObjectBinding && this.value && (this.value as string[]).indexOf(value as string) >= 0) ||
                            (this.allowObjectBinding && this.indexOfObjectInArray(value, this.value) >= 0))) {
                            index++;
                            continue;
                        }
                        this.updateListSelection(concatenatedNodeList[index as number], event, length - index);
                    }
                    else {
                        let value: any = getValue(
                            this.fields.value ? this.fields.value : '',
                            this.virtualSelectAllData[index as number]
                        );
                        value = this.allowObjectBinding ? this.getDataByValue(value) : value;
                        if (((!this.allowObjectBinding && this.value && (this.value as string[]).indexOf(value as string) >= 0) ||
                            (this.allowObjectBinding && this.indexOfObjectInArray(value, this.value) >= 0))) {
                            index++;
                            continue;
                        }
                        if (this.value && value != null && Array.isArray(this.value) &&
                            ((!this.allowObjectBinding && this.value.indexOf(value as never) < 0) ||
                                (this.allowObjectBinding && !this.isObjectInArray(value, this.value)))) {
                            this.dispatchSelect(value, event , null, false, length);
                        }
                    }
                    index++;
                }
                if (length > 50) {
                    setTimeout(
                        (): void => {
                            if (this.virtualSelectAllData && this.virtualSelectAllData.length > 0) {
                                (this.virtualSelectAllData as any[]).map((obj: any) => {
                                    if (this.value && obj[this.fields.value] != null && Array.isArray(this.value) &&
                                        ((!this.allowObjectBinding && this.value.indexOf(obj[this.fields.value] as never) < 0) ||
                                            (this.allowObjectBinding && !this.isObjectInArray(obj[this.fields.value], this.value)))) {
                                        const value: string | number | boolean | object = obj[this.fields.value];
                                        const text: string = (obj[this.fields.text]).toString();
                                        this.dispatchSelect(value, event, null, false, length, obj, text);
                                    }
                                });
                            }
                            this.updatedataValueItems(event);
                            this.isSelectAllLoop = false;
                            if (!this.changeOnBlur) {
                                this.updateValueState(event, this.value, this.tempValues);
                                this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
                            }
                            this.updateHiddenElement(true);
                            if (this.popupWrapper && li[index - 1] && li[index - 1].classList.contains('e-item-focus')) {
                                const selectAllParent: Element = document.getElementsByClassName('e-selectall-parent')[0];
                                if (selectAllParent && selectAllParent.classList.contains('e-item-focus')) {
                                    li[index - 1].classList.remove('e-item-focus');
                                }
                            }
                            this.checkSelectAll();
                        },
                        0
                    );
                }
            }
        }
        else {
            if (this.virtualSelectAllData && this.virtualSelectAllData.length > 0) {
                (this.virtualSelectAllData as any[]).map((obj: any) => {
                    this.virtualSelectAll = true;
                    this.removeValue(this.value[index as number], event, this.value.length - index);
                });
            }
            this.updatedataValueItems(event);
            if (!this.changeOnBlur) {
                this.updateValueState(event, this.value, this.tempValues);
                this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
            }
            this.updateHiddenElement();
            this.setProperties({ value: [] }, true);
            this.selectedListData = [];
            this.virtualSelectAll = false;
            if (!isNullOrUndefined(this.viewPortInfo.startIndex) && !isNullOrUndefined(this.viewPortInfo.endIndex)) {
                this.notify('setCurrentViewDataAsync', {
                    component: this.getModuleName(),
                    module: 'VirtualScroll'
                });
            }
        }
        this.checkSelectAll();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const virtualTrackElement: Element = this.list.getElementsByClassName('e-virtual-ddl')[0];
        if (virtualTrackElement) {
            (virtualTrackElement as any).style = this.GetVirtualTrackHeight();
        }
        this.UpdateSkeleton();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const virtualContentElement: Element = this.list.getElementsByClassName('e-virtual-ddl-content')[0];
        if (virtualContentElement) {
            (virtualContentElement as any).style = this.getTransformValues();
        }
    }
    private updateValue(event: MouseEvent | KeyboardEventArgs, li : NodeListOf<HTMLElement>| HTMLElement[], state: boolean): void {
        const length: number = li.length;
        const beforeSelectArgs: ISelectAllEventArgs = {
            event: event,
            items: state ? li as HTMLLIElement[] : [],
            itemData: state ? this.listData as FieldSettingsModel[] : [] as FieldSettingsModel[],
            isInteracted: event ? true : false,
            isChecked: state,
            preventSelectEvent: false
        };
        this.trigger('beforeSelectAll', beforeSelectArgs);
        if ((li && li.length) || (this.enableVirtualization && !state) ) {
            let index: number = 0;
            let count: number = 0;
            if (this.enableGroupCheckBox) {
                count = state ? this.maximumSelectionLength - (this.value ? this.value.length : 0) : li.length;
            } else {
                count = state ? this.maximumSelectionLength - (this.value ? this.value.length : 0) : this.maximumSelectionLength;
            }
            if (!beforeSelectArgs.preventSelectEvent) {
                if (this.enableVirtualization) {
                    this.virtualSelectAllState = state;
                    this.virtualSelectAll = true;
                    this.CurrentEvent = event;
                    if (!this.virtualSelectAllData){
                        this.resetList(this.dataSource, this.fields, new Query());
                    }
                    if (this.virtualSelectAllData){
                        this.virtualSelectionAll(state, li, event);
                    }
                }
                else {
                    while (index < length && index <= 50 && index < count) {
                        this.isSelectAllTarget = (length === index + 1);
                        this.updateListSelection(li[index as number], event, length - index);
                        if (this.enableGroupCheckBox) {
                            this.findGroupStart(li[index as number]);
                        }
                        index++;
                    }
                    if (length > 50) {
                        setTimeout(
                            (): void => {
                                while (index < length && index < count) {
                                    this.isSelectAllTarget = (length === index + 1);
                                    this.updateListSelection(li[index as number], event, length - index);
                                    if (this.enableGroupCheckBox) {
                                        this.findGroupStart(li[index as number]);
                                    }
                                    index++;
                                }
                                this.updatedataValueItems(event);
                                if (!this.changeOnBlur) {
                                    this.updateValueState(event, this.value, this.tempValues);
                                    this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
                                }
                                this.updateHiddenElement();
                                if (this.popupWrapper && li[index - 1].classList.contains('e-item-focus')) {
                                    const selectAllParent: Element = document.getElementsByClassName('e-selectall-parent')[0];
                                    if (selectAllParent && selectAllParent.classList.contains('e-item-focus')) {
                                        li[index - 1].classList.remove('e-item-focus');
                                    }
                                }
                            },
                            0
                        );
                    }
                }
            } else {
                for (let i: number = 0; i < li.length && i < count; i++) {
                    this.removeHover();
                    const customVal: string = li[i as number].getAttribute('data-value');
                    let value: string | number | boolean | object = this.getFormattedValue(customVal);
                    value = this.allowObjectBinding ? this.getDataByValue(value) : value;
                    const mainElement: HTMLElement = this.mainList ? this.mainList.querySelectorAll(state ?
                        'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide)' :
                        'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide)')[i as number] as HTMLElement : null;
                    if (state) {
                        this.value = !this.value ? [] : this.value;
                        if ((!this.allowObjectBinding && (this.value as string[]).indexOf(value as string) < 0) ||
                            (this.allowObjectBinding && !this.isObjectInArray(value, this.value))) {
                            this.setProperties({ value: [].concat([], this.value, [value]) }, true);
                        }
                        this.removeFocus();
                        this.addListSelection(li[i as number], mainElement);
                        this.updateChipStatus();
                        this.checkMaxSelection();
                    } else {
                        this.removeAllItems(value, event, false, li[i as number], mainElement);
                    }
                    if (this.enableGroupCheckBox) {
                        this.findGroupStart(li[i as number]);
                    }
                }
                if (!state) {
                    const limit: number = this.value && this.value.length ? this.value.length : 0;
                    if (limit < this.maximumSelectionLength) {
                        const collection: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                            + dropDownBaseClasses.li + ':not(.e-active)');
                        removeClass(collection, 'e-disable');
                    }
                }
                const args: ISelectAllEventArgs = {
                    event: event,
                    items: state ? li as HTMLLIElement[] : [],
                    itemData: state ? this.listData as FieldSettingsModel[] : [] as FieldSettingsModel[],
                    isInteracted: event ? true : false,
                    isChecked: state
                };
                this.trigger('selectedAll', args);
            }
        }
        this.updatedataValueItems(event);
        this.checkPlaceholderSize();
        if (length <= 50 && !beforeSelectArgs.preventSelectEvent) {
            if (!this.changeOnBlur) {
                this.updateValueState(event, this.value, this.tempValues);
                this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
            }
            if ((this.enableVirtualization && this.value && this.value.length > 0) || !this.enableVirtualization){
                this.updateHiddenElement();
            }
        }
    }

    private updateHiddenElement(isVirtualSelectAll?: boolean): void {
        let hiddenValue: string = '';
        let wrapperText: string = '';
        let data: string = '';
        const text: string[] = <string[]>[];
        if (this.mode === 'CheckBox') {
            (this.value as string[]).map((value: string, index: number): void => {
                hiddenValue += '<option selected value ="' + value + '">' + index + '</option>';
                if (!isVirtualSelectAll) {
                    if (this.listData) {
                        data = this.getTextByValue(value);
                    } else {
                        data = value;
                    }
                    wrapperText += data + this.delimiterChar + ' ';
                    text.push(data);
                }
            });
            this.hiddenElement.innerHTML = hiddenValue;
            if (!isVirtualSelectAll) {
                this.updateWrapperText(this.delimiterWrapper, wrapperText);
                this.setProperties({ text: text.toString() }, true);
            }
            this.delimiterWrapper.setAttribute('id', getUniqueID('delim_val'));
            this.inputElement.setAttribute('aria-describedby', this.delimiterWrapper.id);
            this.refreshInputHight();
            this.refreshPlaceHolder();
        }
    }

    private updatedataValueItems(event?: MouseEvent | KeyboardEventArgs): void {
        this.deselectHeader();
        this.textboxValueUpdate(event);
    }
    private textboxValueUpdate(event?: MouseEvent | KeyboardEventArgs): void {
        const isRemoveAll: Element = event && event.target && (closest(event.target as Element, '.e-selectall-parent')
        || closest(event.target as Element, '.e-close-hooker'));
        if (this.mode !== 'Box' && !this.isPopupOpen() && !(this.mode === 'CheckBox' && (this.isSelectAll || isRemoveAll))) {
            this.updateDelimView();
        } else {
            this.searchWrapper.classList.remove(ZERO_SIZE);
        }
        if (this.mode === 'CheckBox') {
            this.updateDelimView();
            if ((!(isRemoveAll || this.isSelectAll) && this.isSelectAllTarget) || (this.isSelectAll && this.isSelectAllTarget)) {
                this.updateDelimeter(this.delimiterChar, event);
            }
            this.refreshInputHight();
        } else {
            this.updateDelimeter(this.delimiterChar, event);
        }
        this.refreshPlaceHolder();
    }
    protected setZIndex(): void {
        if (this.popupObj) {
            this.popupObj.setProperties({ 'zIndex': this.zIndex });
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected updateDataSource(prop?: MultiSelectModel): void {
        this.checkAndResetCache();
        if (isNullOrUndefined(this.list)) {
            this.renderPopup();
        } else {
            this.resetList(this.dataSource);
        }
        if (this.value && this.value.length) {
            this.setProperties({ 'value': this.value });
            this.refreshSelection();
        }
    }
    private onLoadSelect(): void {
        this.setDynValue = true;
        this.renderPopup();
    }
    protected selectAllItems(state: boolean, event?: MouseEvent): void {
        if (isNullOrUndefined(this.list)) {
            this.selectAllAction = () => {
                if (this.mode === 'CheckBox' && this.showSelectAll) {
                    const args: { [key: string]: Object | string } = {
                        module: 'CheckBoxSelection',
                        enable: this.mode === 'CheckBox',
                        value: state ? 'check' : 'uncheck'
                    };
                    this.notify('checkSelectAll', args);
                }
                this.selectAllItem(state, event);
                this.selectAllAction = null;
            };
            super.render();
        } else {
            this.selectAllAction = null;
            if (this.mode === 'CheckBox' && this.showSelectAll) {
                const args: { [key: string]: Object | string } = {
                    value: state ? 'check' : 'uncheck',
                    enable: this.mode === 'CheckBox',
                    module: 'CheckBoxSelection'
                };
                this.notify('checkSelectAll', args);
            }
            this.selectAllItem(state, event);
        }
        if (!(this.dataSource instanceof DataManager) || (this.dataSource instanceof DataManager && this.virtualSelectAllData)) {
            this.virtualSelectAll = false;
        }
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    protected getPersistData(): string {
        return this.addOnPersist(['value']);
    }

    /**
     * Dynamically change the value of properties.
     *
     * @param {MultiSelectModel} newProp - Returns the dynamic property value of the component.
     * @param {MultiSelectModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    public onPropertyChanged(newProp: MultiSelectModel, oldProp: MultiSelectModel): void {
        if (newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource))
        || newProp.query && !isNullOrUndefined(Object.keys(newProp.query))) {
            this.mainList = null;
            this.mainData = null;
            this.isFirstClick = false;
            this.isDynamicDataChange = true;
        }
        if (this.getModuleName() === 'multiselect') {
            this.isFilterAction = false;
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp as { [key: string]: string });
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
            case 'query':
            case 'dataSource':
                if (this.mode === 'CheckBox' && this.showSelectAll) {
                    if (!isNullOrUndefined(this.popupObj)) {
                        this.popupObj.destroy();
                        this.popupObj = null;
                    }
                    this.renderPopup();
                }
                break;
            case 'htmlAttributes': this.updateHTMLAttribute();
                break;
            case 'showClearButton': this.updateClearButton(newProp.showClearButton);
                break;
            case 'text': if (this.fields.disabled) {
                this.text =
                this.text && !this.isDisabledItemByIndex(this.getIndexByValue(this.getValueByText(this.text))) ? this.text : null;
            }
                this.updateVal(this.value, this.value, 'text');
                break;
            case 'value':
                if (this.fields.disabled) {
                    this.removeDisabledItemsValue(this.value);
                }
                this.updateVal(this.value, oldProp.value, 'value');
                this.addValidInputClass();
                if (!this.closePopupOnSelect && this.isPopupOpen()) {
                    this.refreshPopup();
                }
                if (this.isPopupOpen() && this.mode === 'CheckBox' && this.list && this.list.querySelector('.e-active.e-disable')) {
                    const activeItems: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.' + dropDownBaseClasses.li + '.e-active' + '.e-disable');
                    removeClass(activeItems, 'e-disable');
                }
                this.preventChange = this.isAngular && this.preventChange ? !this.preventChange : this.preventChange;
                break;
            case 'width':
                this.setWidth(newProp.width);
                this.popupObj.setProperties({ width: this.calcPopupWidth() });
                break;
            case 'placeholder': this.refreshPlaceHolder();
                break;
            case 'filterBarPlaceholder':
                if (this.allowFiltering) {
                    this.notify('filterBarPlaceholder', { filterBarPlaceholder: newProp.filterBarPlaceholder });
                }
                break;
            case 'delimiterChar':
                if (this.mode !== 'Box') {
                    this.updateDelimView();
                }
                this.updateData(newProp.delimiterChar);
                break;
            case 'cssClass':
                this.updateOldPropCssClass(oldProp.cssClass);
                this.updateCssClass();
                this.calculateWidth();
                break;
            case 'enableRtl':
                this.enableRTL(newProp.enableRtl);
                super.onPropertyChanged(newProp, oldProp);
                break;
            case 'allowResize':
                this.allowResize = newProp.allowResize;
                if (!this.allowResize && this.popupObj) {
                    const overAllHeight: number = parseInt(<string>this.popupHeight, 10);
                    if (this.popupHeight !== 'auto') {
                        this.list.style.maxHeight = formatUnit(overAllHeight);
                        this.popupWrapper.style.height = formatUnit(this.popupHeight);
                        this.popupWrapper.style.maxHeight = formatUnit(this.popupHeight);
                    }
                    else {
                        this.list.style.maxHeight = formatUnit(this.popupHeight);
                    }
                }
                break;
            case 'readonly':
                this.updateReadonly(newProp.readonly);
                this.hidePopup();
                break;
            case 'enabled':
                this.hidePopup();
                this.enable(newProp.enabled);
                break;
            case 'showSelectAll':
                if (this.popupObj) {
                    this.popupObj.destroy();
                    this.popupObj = null;
                }
                this.renderPopup();
                break;
            case 'showDropDownIcon': this.dropDownIcon();
                break;
            case 'floatLabelType':
                this.setFloatLabelType();
                this.addValidInputClass();
                if (this.element.querySelector('.e-multiselect .e-float-text-content') === null) {
                    Input.createSpanElement(this.overAllWrapper, this.createElement);
                }
                this.calculateWidth();
                if (!isNullOrUndefined(this.overAllWrapper) &&
                    !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] &&
                        this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
                    this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
                }
                break;
            case 'enableSelectionOrder':
                break;
            case 'selectAllText': this.notify('selectAllText', false);
                break;
            case 'popupHeight':
                if (this.popupObj) {
                    const overAllHeight: number = parseInt(<string>this.popupHeight, 10);
                    if (this.popupHeight !== 'auto') {
                        this.list.style.maxHeight = formatUnit(overAllHeight);
                        this.popupWrapper.style.maxHeight = formatUnit(this.popupHeight);
                    } else {
                        this.list.style.maxHeight = formatUnit(this.popupHeight);
                    }
                }
                break;
            case 'headerTemplate':
            case 'footerTemplate':
                this.reInitializePoup();
                break;
            case 'allowFiltering':
                if (this.mode === 'CheckBox' && this.popupObj) {
                    this.reInitializePoup();
                }
                this.updateSelectElementData(this.allowFiltering);
                break;
            case 'fields':
                if (isNullOrUndefined(this.fields.groupBy))
                {
                    this.removeScrollEvent();
                }
                break;
            default: {
                const msProps: { [key: string]: Object } =
                    this.getPropObject(prop, <{ [key: string]: string }>newProp, <{ [key: string]: string }>oldProp);
                super.onPropertyChanged(msProps.newProperty, msProps.oldProperty);
            }
                break;
            }
        }
    }
    private reInitializePoup(): void {
        if (this.popupObj) {
            this.popupObj.destroy();
            this.popupObj = null;
        }
        this.renderPopup();
    }

    private totalItemsCount(): void {
        let dataSourceCount: number;
        if (this.dataSource instanceof DataManager) {
            if (this.remoteDataCount >= 0) {
                dataSourceCount = this.totalItemCount = this.dataCount = this.remoteDataCount;
            } else {
                this.resetList(this.dataSource);
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dataSourceCount = this.dataSource && (this.dataSource as any).length ? (this.dataSource as any).length : 0;
        }
        if (this.mode === 'CheckBox') {
            this.totalItemCount = dataSourceCount !== 0 ? dataSourceCount : this.totalItemCount;
        } else {
            if (this.hideSelectedItem) {
                this.totalItemCount = dataSourceCount !== 0 && this.value ? dataSourceCount - this.value.length : this.totalItemCount;
                if (this.allowCustomValue && this.virtualCustomSelectData && this.virtualCustomSelectData.length > 0) {
                    for (let i: number = 0; i < this.virtualCustomSelectData.length; i++) {
                        for (let j: number = 0; j < this.value.length; j++) {
                            const value: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                                this.fields.value : '', this.value[j as number]) : this.value[j as number];
                            const customValue: string | number | boolean = getValue((this.fields.value) ?
                                this.fields.value : '', this.virtualCustomSelectData[i as number]);
                            if (value === customValue) {
                                this.totalItemCount += 1;
                            }
                        }
                    }
                }
            }
            else{
                this.totalItemCount = dataSourceCount !== 0 ? dataSourceCount : this.totalItemCount;
                if (this.allowCustomValue && this.virtualCustomSelectData && this.virtualCustomSelectData.length > 0) {
                    this.totalItemCount += this.virtualCustomSelectData.length;
                }
            }
        }
    }

    private presentItemValue(ulElement: HTMLElement): string[] | number[] | boolean[] | object[] {
        const valuecheck: string[] | number[] | boolean[] | object[] = [];
        for (let i: number = 0; i < this.value.length; i++) {
            const value: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                this.fields.value : '', this.value[i as number]) : this.value[i as number];
            const checkEle: Element = this.findListElement(
                ((this.allowFiltering && !isNullOrUndefined(this.mainList)) ? this.mainList : ulElement),
                'li',
                'data-value',
                value);
            if (!checkEle) {
                const checkvalue: string | object | boolean | number = this.allowObjectBinding ?
                    this.getDataByValue(this.value[i as number]) : this.value[i as number] as string;
                valuecheck.push(checkvalue as never);
            }
        }
        return valuecheck;
    }
    private addNonPresentItems(valuecheck: string[] | number[] | boolean[] | object[], ulElement: HTMLElement,
                               list: { [key: string]: Object }[] | number[] | boolean[] | string[],
                               event?: Object):  void {
        (this.dataSource as DataManager).executeQuery(this.getForQuery(valuecheck)).then((e: Object) => {
            if ((e as ResultData).result.length > 0) {
                this.addItem((e as ResultData).result, list.length);
            }
            this.updateActionList(ulElement, list, event);
        });
    }

    private updateVal(
        newProp: string[] | boolean[] | number[] | object[],
        oldProp: string[] | boolean[] | number[] | object[],
        prop: string): void {
        if (!this.list) {
            this.onLoadSelect();
            if (this.enableVirtualization) {
                this.setProperties({ text: '' }, true);
                this.selectedListData = [];
                this.checkInitialValue();
            }
        } else if ((this.dataSource instanceof DataManager) && (!this.listData || !(this.mainList && this.mainData))) {
            this.onLoadSelect();
        } else {
            let valuecheck: string[] | Object[] = [];
            if (!isNullOrUndefined(this.value) && !this.allowCustomValue) {
                valuecheck = this.presentItemValue(this.ulElement);
            }
            const isContainsValue: boolean = valuecheck.some((item: string | number | boolean | object) => item !== null);
            if (prop === 'value' && valuecheck.length > 0 && this.dataSource instanceof DataManager && !isNullOrUndefined(this.value)
                && this.listData != null && (!this.enableVirtualization || (this.enableVirtualization && this.valueTemplate))
                && isContainsValue) {
                this.mainData = null;
                this.setDynValue = true;
                this.isaddNonPresentItems = true;
                this.addNonPresentItems(valuecheck, this.ulElement, this.listData);
                this.isaddNonPresentItems = false;
            }
            else {
                this.selectedListData = [];
                if (prop === 'text') {
                    this.initialTextUpdate();
                    newProp = this.value;
                }
                if (isNullOrUndefined(this.value) || this.value.length === 0) {
                    this.tempValues = oldProp;
                }
                // eslint-disable-next-line
                if (this.allowCustomValue && (this.mode === 'Default' || this.mode === 'Box') && (this as any).isReact && this.inputFocus
                    && this.isPopupOpen() && this.mainData !== this.listData) {
                    const list: HTMLElement = this.mainList.cloneNode ? <HTMLElement>this.mainList.cloneNode(true) : this.mainList;
                    this.onActionComplete(list, this.mainData);
                }
                if (!this.enableVirtualization) {
                    this.initialValueUpdate();
                } else if (this.enableVirtualization && (!(this.dataSource instanceof DataManager))) {
                    this.initialValueUpdate(this.dataSource, true);
                } else if (!this.isInitRemoteVirtualData) {
                    if (this.allowObjectBinding && !isContainsValue && this.value && this.value.length) {
                        const fields: string = !this.isPrimitiveData ? this.fields.value : '';
                        let predicate: Predicate;
                        for (let i: number = 0; i < this.value.length; i++) {
                            const value: string | number | boolean = this.allowObjectBinding ?
                                getValue((this.fields.value) ? this.fields.value : '', (this.value[i as number] as string)) :
                                (this.value[i as number] as string);
                            if (i === 0) {
                                predicate = new Predicate(fields, 'equal', (value as string));
                            } else {
                                predicate = predicate.or(fields, 'equal', (value as string));
                            }
                        }
                        if (this.dataSource instanceof DataManager) {
                            this.dataSource.executeQuery(new Query().where(predicate))
                                .then((e: Object) => {
                                    if (((e as ResultData).result as object[]).length > 0) {
                                        const listItems: object[] = ((e as ResultData).result as object[]);
                                        this.isDynamicRemoteVirtualData = true;
                                        setTimeout(() => {
                                            this.initialValueUpdate(listItems, true);
                                            this.isDynamicRemoteVirtualData = false;
                                            if (!this.inputFocus || (this.inputFocus && this.mode !== 'Default')) {
                                                this.initialUpdate();
                                            }
                                        }, 100);
                                    }
                                });
                        }
                    } else {
                        this.isDynamicRemoteVirtualData = true;
                        this.initialValueUpdate(this.listData, true);
                        this.isDynamicRemoteVirtualData = false;
                        this.initialUpdate();
                    }
                }
                if (this.mode !== 'Box' && !this.inputFocus) {
                    this.updateDelimView();
                }
                if (!this.inputFocus) {
                    this.refreshInputHight();
                }
                this.refreshPlaceHolder();
                if (this.mode !== 'CheckBox' && this.changeOnBlur) {
                    this.updateValueState(null, newProp, oldProp);
                }
                this.checkPlaceholderSize();
            }
        }
        if (!this.changeOnBlur) {
            this.updateValueState(null, newProp, oldProp);
        }
    }
    /**
     * Adds a new item to the multiselect popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}
     */
    public addItem(
        items: { [key: string]: Object }[] | { [key: string]: Object } | string | boolean | number | string[] | boolean[] | number[],
        itemIndex?: number): void {
        super.addItem(items, itemIndex);
    }
    /**
     * Hides the popup, if the popup in a open state.
     *
     * @param {MouseEvent | KeyboardEventArgs} e - Specifies the mouse event or keyboard event.
     * @returns {void}
     */
    public hidePopup(e?: MouseEvent | KeyboardEventArgs): void {
        const delay: number = 100;
        if (this.isPopupOpen()) {
            const animModel: AnimationModel = {
                name: 'FadeOut',
                duration: 100,
                delay: delay ? delay : 0
            };
            this.customFilterQuery = null;
            const eventArgs: PopupEventArgs = { popup: this.popupObj, cancel: false, animation: animModel , event: e || null };
            this.trigger('close', eventArgs, (eventArgs: PopupEventArgs) => {
                if (!eventArgs.cancel) {
                    if (this.fields.groupBy && this.mode !== 'CheckBox' && this.fixedHeaderElement) {
                        remove(this.fixedHeaderElement);
                        this.fixedHeaderElement = null;
                    }
                    this.beforePopupOpen = false;
                    this.overAllWrapper.classList.remove(iconAnimation);
                    const typedValue: string = this.mode === 'CheckBox' ? this.targetElement() : null;
                    this.popupObj.hide(new Animation(eventArgs.animation));
                    attributes(this.inputElement, { 'aria-expanded': 'false' });
                    this.inputElement.removeAttribute('aria-owns');
                    this.inputElement.removeAttribute('aria-activedescendant');
                    if (this.allowFiltering) {
                        this.notify('inputFocus', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'clear' });
                    }
                    this.popupObj.hide();
                    removeClass([document.body, this.popupObj.element], 'e-popup-full-page');
                    EventHandler.remove(this.list, 'keydown', this.onKeyDown);
                    if (this.mode === 'CheckBox' && this.showSelectAll){
                        EventHandler.remove((this as any).popupObj.element, 'click', this.clickHandler);
                    }
                    if (this.list && this.list.parentElement && this.allowResize) {
                        if (this.resizer && this.list.parentElement.contains(this.resizer)) {
                            this.list.parentElement.removeChild(this.resizer);
                        }
                        if (this.list.parentElement.classList.contains('e-resize')) {
                            this.list.parentElement.classList.remove('e-resize');
                        }
                        this.list.parentElement.style.boxSizing = '';
                        this.list.parentElement.style.paddingBottom = '';
                        const overAllHeight : number = parseInt(<string>this.popupHeight, 10);
                        this.list.style.maxHeight = formatUnit(overAllHeight);
                        if (this.popupHeight.toString().toLowerCase() !== 'auto' && this.initialPopupHeight >= (parseInt(this.popupHeight.toString(), 10) - 2)) {
                            this.list.parentElement.style.height =  formatUnit(this.popupHeight);
                        }
                        this.list.parentElement.style.maxHeight = formatUnit(this.popupHeight);
                    }
                    if (this.resizer) {
                        EventHandler.remove(this.resizer, 'mousedown', this.startResizing);
                        this.resizer.remove();
                    }
                    if (this.enableVirtualization && this.mode === 'CheckBox' && this.value && this.value.length > 0 &&
                        this.enableSelectionOrder) {
                        this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
                        this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.viewPortInfo.startIndex > 0 ?
                            this.viewPortInfo.endIndex : this.itemCount;
                        this.virtualListInfo = this.viewPortInfo;
                        this.previousStartIndex = 0;
                        this.previousEndIndex = this.itemCount;
                    }
                    let dataSourceCount: number;
                    if (this.dataSource instanceof DataManager) {
                        if (this.remoteDataCount >= 0) {
                            this.totalItemCount = this.dataCount = this.remoteDataCount;
                        } else {
                            this.resetList(this.dataSource);
                        }
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        dataSourceCount = this.dataSource && (this.dataSource as any).length ? (this.dataSource as any).length : 0;
                    }
                    if (this.enableVirtualization && (this.allowFiltering || this.allowCustomValue) &&
                       (this.targetElement() || typedValue) && this.totalItemCount !== dataSourceCount) {
                        this.checkAndResetCache();
                        this.updateInitialData();
                    }
                    if (this.virtualCustomData && this.viewPortInfo && this.viewPortInfo.startIndex === 0 &&
                        this.viewPortInfo.endIndex === this.itemCount){
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.renderItems(this.mainData as any[], this.fields);
                    }
                    this.virtualCustomData = null;
                    this.isVirtualTrackHeight = false;
                }
            });
        }
    }
    /**
     * Shows the popup, if the popup in a closed state.
     *
     * @param {MouseEvent | KeyboardEventArgs} e - Specifies the mouse event or keyboard event.
     * @returns {void}
     */
    public showPopup(e?: MouseEvent | KeyboardEventArgs | TouchEvent): void {
        if (!this.enabled) {
            return;
        }
        this.firstItem = this.dataSource && (this.dataSource as any).length > 0 ? (this.dataSource as any)[0] : null;
        const args: BeforeOpenEventArgs = { cancel: false };
        this.trigger('beforeOpen', args, (args: BeforeOpenEventArgs) => {
            if (!args.cancel) {
                if (!this.ulElement) {
                    this.beforePopupOpen = true;
                    if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering && this.isDeviceFullScreen) {
                        this.notify('popupFullScreen', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    }
                    super.render(e);
                    return;
                }
                if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering && this.isDeviceFullScreen) {
                    this.notify('popupFullScreen', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                }
                const mainLiLength: number = this.ulElement.querySelectorAll('li.' + 'e-list-item').length;
                const liLength: number = this.ulElement.querySelectorAll('li.'
                    + dropDownBaseClasses.li + '.' + HIDE_LIST).length;
                if (mainLiLength > 0 && (mainLiLength === liLength) && (liLength === this.mainData.length) &&
                    !(this.targetElement() !== '' && this.allowCustomValue)) {
                    this.beforePopupOpen = false;
                    return;
                }
                this.onPopupShown(e);
                if (this.enableVirtualization && this.listData && this.listData.length) {
                    if (!isNullOrUndefined(this.value) && (this.getModuleName() === 'dropdownlist' ||
                        this.getModuleName() === 'combobox')) {
                        this.removeHover();
                    }
                    if (!this.beforePopupOpen) {
                        if (this.hideSelectedItem && this.value && Array.isArray(this.value) && this.value.length > 0) {
                            this.totalItemsCount();
                        }
                        if (!this.preventSetCurrentData && !isNullOrUndefined(this.viewPortInfo.startIndex) &&
                            !isNullOrUndefined(this.viewPortInfo.endIndex)) {
                            this.notify('setCurrentViewDataAsync', {
                                component: this.getModuleName(),
                                module: 'VirtualScroll'
                            });
                        }
                    }
                }
                if (this.enableVirtualization && !this.allowFiltering && this.selectedValueInfo != null &&
                    this.selectedValueInfo.startIndex > 0 && this.value != null) {
                    this.notify('dataProcessAsync', {
                        module: 'VirtualScroll',
                        isOpen: true
                    });
                }
                if (this.enableVirtualization) {
                    this.updatevirtualizationList();
                }
                else {
                    if (this.value && this.value.length) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let element: any;
                        const listItems: Element[] = this.getItems();
                        for (const value of this.value) {
                            const checkValue: string | number | boolean = this.allowObjectBinding ?
                                getValue((this.fields.value) ? this.fields.value : '', value) : value;
                            element = this.getElementByValue(checkValue);
                            if (element) {
                                this.addListSelection(element);
                            }
                        }
                    }
                }
                if (this.allowResize) {
                    this.setResize();
                }
                this.preventSetCurrentData = true;
            }
        });
    }
    /**
     * Based on the state parameter, entire list item will be selected/deselected.
     * parameter
     * `true`   - Selects entire list items.
     * `false`  - Un Selects entire list items.
     *
     * @param {boolean} state - if it’s true then Selects the entire list items. If it’s false the Unselects entire list items.
     * @returns {void}
     */
    public selectAll(state: boolean): void {
        this.isSelectAll = true;
        this.selectAllItems(state);
    }

    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */

    public getModuleName(): string {
        return 'multiselect';
    }

    /**
     * Allows you to clear the selected values from the Multiselect component.
     *
     * @returns {void}
     */
    public clear(): void {
        this.selectAll(false);
        if (this.value && this.value.length) {
            setTimeout(
                (): void => {
                    this.setProperties({value: null}, true);
                },
                0
            );
        } else {
            this.setProperties({value: null}, true);
        }
        this.checkAndResetCache();
        if (this.enableVirtualization) {
            this.updateInitialData();
            if (this.chipCollectionWrapper) {
                this.chipCollectionWrapper.innerHTML = '';
            }
            if (!this.isCustomDataUpdated) {
                this.notify('setGeneratedData', {
                    module: 'VirtualScroll'
                });
            }
            this.list.scrollTop = 0;
            this.virtualListInfo = null;
            this.previousStartIndex = 0;
            this.previousEndIndex = this.itemCount;
        }
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    public render(): void {
        if (!isNullOrUndefined(this.value) && this.value.length > 0)
        {
            // eslint-disable-next-line
            this.value = [...this.value as any];
        }
        this.setDynValue = this.initStatus = false;
        this.isSelectAll = false;
        this.selectAllEventEle = [];
        this.searchWrapper = this.createElement('span', {
            className: SEARCHBOX_WRAPPER + ' ' + ((this.mode === 'Box') ?
                BOX_ELEMENT : '')
        });
        this.viewWrapper = this.createElement('span', {
            className: DELIMITER_VIEW + ' ' + DELIMITER_WRAPPER
        });
        this.viewWrapper.style.display = 'none';
        this.overAllClear = this.createElement('span', {
            className: CLOSEICON_CLASS
        });
        this.overAllClear.style.display = 'none';
        this.componentWrapper = this.createElement('div', { className: ELEMENT_WRAPPER }) as HTMLDivElement;
        this.overAllWrapper = this.createElement('div', { className: OVER_ALL_WRAPPER }) as HTMLDivElement;
        if (this.mode === 'CheckBox') {
            addClass([this.overAllWrapper], 'e-checkbox');
        }
        if (Browser.isDevice) {
            this.componentWrapper.classList.add(ELEMENT_MOBILE_WRAPPER);
        }
        this.setWidth(this.width);
        this.overAllWrapper.appendChild(this.componentWrapper);
        this.popupWrapper = this.createElement('div', { id: this.element.id + '_popup', className: POPUP_WRAPPER }) as HTMLDivElement;
        this.popupWrapper.setAttribute( 'aria-label', this.element.id );
        this.popupWrapper.setAttribute( 'role', 'dialog' );
        if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
            this.delimiterWrapper = this.createElement('span', { className: DELIMITER_WRAPPER });
            this.delimiterWrapper.style.display = 'none';
            this.componentWrapper.appendChild(this.delimiterWrapper);
        } else {
            this.chipCollectionWrapper = this.createElement('span', {
                className: CHIP_WRAPPER
            });
            this.chipCollectionWrapper.style.display = 'none';
            if (this.mode === 'Default') {
                this.chipCollectionWrapper.setAttribute('id', getUniqueID('chip_default'));
            } else if (this.mode === 'Box') {
                this.chipCollectionWrapper.setAttribute('id', getUniqueID('chip_box'));
            }
            this.componentWrapper.appendChild(this.chipCollectionWrapper);
        }
        if (this.mode !== 'Box') {
            this.componentWrapper.appendChild(this.viewWrapper);
        }
        this.componentWrapper.appendChild(this.searchWrapper);
        if (this.showClearButton && !Browser.isDevice) {
            this.componentWrapper.appendChild(this.overAllClear);
        } else {
            this.componentWrapper.classList.add(CLOSE_ICON_HIDE);
        }
        this.dropDownIcon();
        this.inputElement = this.createElement('input', {
            className: INPUT_ELEMENT,
            attrs: {
                spellcheck: 'false',
                type: 'text',
                autocomplete: 'off',
                tabindex: '0',
                role: 'combobox'
            }
        }) as HTMLInputElement;
        if (this.mode === 'Default' || this.mode === 'Box') {
            this.inputElement.setAttribute('aria-describedby', this.chipCollectionWrapper.id);
        }
        if (!isNullOrUndefined(this.inputElement))
        {
            attributes(this.inputElement, { 'aria-expanded': 'false' });
            if (!this.inputElement.hasAttribute('aria-label')) {
                this.inputElement.setAttribute('aria-label', this.getModuleName());
            }
        }
        if (this.element.tagName !== this.getNgDirective()) {
            this.element.style.display = 'none';
        }
        if (this.element.tagName === this.getNgDirective()) {
            this.element.appendChild(this.overAllWrapper);
            this.searchWrapper.appendChild(this.inputElement);
        } else {
            this.element.parentElement.insertBefore(this.overAllWrapper, this.element);
            this.searchWrapper.appendChild(this.inputElement);
            this.searchWrapper.appendChild(this.element);
            this.element.removeAttribute('tabindex');
        }
        if (this.floatLabelType !== 'Never') {
            createFloatLabel(
                this.overAllWrapper, this.searchWrapper,
                this.element, this.inputElement,
                this.value, this.floatLabelType, this.placeholder
            );
        } else if (this.floatLabelType === 'Never') {
            this.refreshPlaceHolder();
        }
        this.addValidInputClass();
        this.element.style.opacity = '';
        const id: string = this.element.getAttribute('id') ? this.element.getAttribute('id') : getUniqueID('ej2_dropdownlist');
        this.element.id = id;
        this.hiddenElement = this.createElement('select', {
            attrs: { 'aria-hidden': 'true', 'class': HIDDEN_ELEMENT, 'tabindex': '-1', 'multiple': '' }
        }) as HTMLSelectElement;
        this.componentWrapper.appendChild(this.hiddenElement);
        this.validationAttribute(this.element, this.hiddenElement);
        if (this.mode !== 'CheckBox') {
            this.hideOverAllClear();
        }
        if (!isNullOrUndefined(closest(this.element, 'fieldset') as HTMLFieldSetElement) &&
            (closest(this.element, 'fieldset') as HTMLFieldSetElement).disabled) {
            this.enabled = false;
        }
        this.wireEvent();
        this.enable(this.enabled);
        this.enableRTL(this.enableRtl);
        if (this.enableVirtualization){
            this.updateVirtualizationProperties(this.itemCount, this.allowFiltering, this.mode === 'CheckBox');
        }
        this.listItemHeight = this.getListHeight();
        this.getSkeletonCount();
        this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
        this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.viewPortInfo.startIndex > 0 ?
            this.viewPortInfo.endIndex : this.itemCount;
        this.checkInitialValue();
        if (this.element.hasAttribute('data-val')) {
            this.element.setAttribute('data-val', 'false');
        }
        if (this.element.querySelector('.e-multiselect .e-float-text-content') === null) {
            Input.createSpanElement(this.overAllWrapper, this.createElement);
        }
        this.calculateWidth();
        if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] &&
            this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
            this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
        this.renderComplete();
    }
    protected setResize(): void {
        const resizePaddingBottom: number = 16;
        if (this.list && this.list.parentElement && isNullOrUndefined(this.list.parentElement.querySelector('.e-resizer-right.e-icons'))) {
            this.resizer = this.createElement('div', {
                id: this.element.id + '_resize-popup',
                className: RESIZE_ICON
            });
        }
        if (this.mode === 'CheckBox' && this.showSelectAll && this.selectAllHeight && this.selectAllHeight !== 0) {
            this.storedSelectAllHeight = this.selectAllHeight;
        }
        if (this.list && this.list.parentElement) {
            this.list.parentElement.classList.add('e-resize');
            this.initialPopupHeight = this.list.parentElement.clientHeight;
            if (this.popupHeight.toString().toLowerCase() !== 'auto' && this.initialPopupHeight >= (parseInt(this.popupHeight.toString(), 10) - 2)) {
                this.list.parentElement.style.height = '100%';
            }
            this.list.parentElement.style.boxSizing = 'border-box'; // Ensures padding doesn't affect element size
            const paddingBottom: number = this.mode === 'CheckBox' && this.searchBoxHeight ? this.searchBoxHeight + resizePaddingBottom + (this.showSelectAll ? this.storedSelectAllHeight : 0) : resizePaddingBottom;
            if (this.footer) {
                let listMaxHeight: any = this.list.style.maxHeight;
                const listParentElementMaxHeight: any = this.list.parentElement.style.maxHeight;
                setTimeout(() => {
                    const height: number = Math.round(this.footer.getBoundingClientRect().height);
                    const containerHeight: string = (parseInt(listParentElementMaxHeight, 10) - height).toString() + 'px';
                    listMaxHeight = (parseInt(containerHeight, 10) - 2).toString() + 'px';
                    if (height > 0) {
                        this.list.parentElement.style.paddingBottom = ((parseInt(listParentElementMaxHeight, 10) - parseInt(listMaxHeight, 10)) + paddingBottom).toString() + 'px';
                    }
                }, 1);
            }
            else {
                this.list.parentElement.style.paddingBottom = `${paddingBottom}px`;
            }
            this.list.parentElement.appendChild(this.resizer);
            this.list.parentElement.style.width = this.resizeWidth + 'px';
            this.list.parentElement.style.height = this.resizeHeight + 'px';
            this.list.parentElement.style.maxHeight = this.resizeHeight + 'px';
            this.list.style.maxHeight = `${this.resizeHeight}px`;
            if (this.headerTemplate) {
                const headerElem: HTMLElement = (this.list.parentElement.querySelector('.e-ddl-header') as HTMLElement);
                if (headerElem && headerElem.offsetHeight) {
                    this.headerTemplateHeight = headerElem.offsetHeight;
                }
                if (this.resizeHeight) {
                    this.list.style.maxHeight = `${this.resizeHeight - this.headerTemplateHeight - 16}px`;
                } else {
                    this.list.style.maxHeight = `${parseInt(this.list.style.maxHeight, 10) - 16}px`;
                }
            }
        }
        if (this.resizer) {
            EventHandler.add(this.resizer, 'mousedown', this.startResizing, this);
            EventHandler.add(this.resizer, 'touchstart', this.startResizing, this);
        }
    }
    protected startResizing(event: MouseEvent| TouchEvent): void {
        this.isResizing = true;
        this.trigger('resizeStart', event);
        // Get initial touch or mouse coordinates
        const clientX: number = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
        const clientY: number = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
        if (this.list && this.list.parentElement) {
            this.originalWidth = this.list.parentElement.offsetWidth;
            this.originalHeight = this.list.parentElement.offsetHeight;
            this.originalMouseX = clientX;
            this.originalMouseY = clientY;
        }
        this.resizingWireEvent();
        // Prevent default behavior like text selection
        if (event) {
            event.preventDefault();
        }
    }
    protected resizePopup(event?: MouseEvent | TouchEvent): void {
        if (!this.isResizing) {
            return;
        }
        this.trigger('resizing', event);
        // Get the current touch or mouse position
        const clientX: number = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
        const clientY: number = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
        // Calculate the new width and height based on drag
        const dx: number = clientX - this.originalMouseX;
        const dy: number = clientY - this.originalMouseY;
        // Set minimum width and height (100px)
        const minWidth: number = 100;
        const minHeight: number = 130;
        // Ensure the new width and height are not smaller than the minimum
        this.resizeWidth = Math.max(this.originalWidth + dx, minWidth);
        this.resizeHeight = Math.max(this.originalHeight + dy, minHeight);
        if (this.list && this.list.parentElement) {
            // Set minimum width and height (100px)
            let minWidth: number  =  parseInt(window.getComputedStyle(this.list.parentElement).minWidth, 10);
            let minHeight: number = parseInt(window.getComputedStyle(this.list.parentElement).minHeight, 10);
            minWidth = minWidth || 100;
            minHeight = minHeight || 120;
            // Ensure the new width and height are not smaller than the minimum
            this.resizeWidth = Math.max(this.originalWidth + dx, minWidth);
            this.resizeHeight = Math.max(this.originalHeight + dy, minHeight);
            this.list.parentElement.style.width = `${this.resizeWidth}px`;
            this.list.parentElement.style.height = `${this.resizeHeight}px`;
            this.list.parentElement.style.maxHeight = `${this.resizeHeight}px`;
            this.list.style.maxHeight = `${this.resizeHeight}px`;
            if (this.headerTemplate) {
                this.list.style.maxHeight = `${this.resizeHeight - this.headerTemplateHeight - 16}px`;
            }
            if (this.fixedHeaderElement && this.ulElement ) {
                this.fixedHeaderElement.style.width = `${this.ulElement.offsetWidth}px`;
            }
        }
        if (event) {
            event.preventDefault();
        }
    }
    protected stopResizing(event: MouseEvent | TouchEvent): void {
        if (this.isResizing) {
            this.isResizing = false;
            this.trigger('resizeStop', event);
            this.resizingUnWireEvent();
        }
        if (event) {
            event.preventDefault();
        }
    }
    private getListHeight(): number {
        const listParent: HTMLElement = this.createElement('div', {
            className: 'e-dropdownbase'
        });
        const item: HTMLElement = this.createElement('li', {
            className: 'e-list-item'
        });
        const listParentHeight: string = formatUnit(this.popupHeight);
        listParent.style.height = (parseInt(listParentHeight, 10)).toString() + 'px';
        listParent.appendChild(item);
        document.body.appendChild(listParent);
        this.virtualListHeight = listParent.getBoundingClientRect().height;
        const listItemHeight: number = Math.ceil(item.getBoundingClientRect().height) +
            parseInt(window.getComputedStyle(item).marginBottom, 10);
        listParent.remove();
        return listItemHeight;
    }
    /**
     * Removes disabled values from the given array.
     *
     * @param { number[] | string[] | boolean[] | object[] } value - The array to check.
     * @returns {void}
     */
    private removeDisabledItemsValue(value: number[] | string[] | boolean[] | object[]) : void {
        if (value) {
            const data: string[] | number[] | boolean[] | object[] = [];
            let dataIndex: number = 0;
            for (let index: number = 0; index < value.length; index++) {
                let indexValue: number | string | boolean | object = value[index as number];
                if (typeof(indexValue) === 'object') {
                    indexValue = JSON.parse(JSON.stringify(indexValue))[this.fields.value];
                }
                if ((indexValue != null) && !(this.isDisabledItemByIndex(this.getIndexByValue(indexValue)))) {
                    data[dataIndex++] = value[index as number];
                }
            }
            this.value = data.length > 0 ? data : null;
        }
    }

    private checkInitialValue(): void {
        if (this.fields.disabled) {
            this.removeDisabledItemsValue(this.value);
        }
        const isData: boolean = this.dataSource instanceof Array ? (this.dataSource.length > 0)
            : !isNullOrUndefined(this.dataSource);
        if (!(this.value && this.value.length) &&
            isNullOrUndefined(this.text) &&
            !isData &&
            this.element.tagName === 'SELECT' &&
            (<HTMLSelectElement>this.element).options.length > 0) {
            const optionsElement: HTMLOptionsCollection = (<HTMLSelectElement>this.element).options;
            const valueCol: string[] | object[] = [];
            let textCol: string = '';
            for (let index: number = 0, optionsLen: number = optionsElement.length; index < optionsLen; index++) {
                const opt: HTMLOptionElement = optionsElement[index as number];
                if (!isNullOrUndefined(opt.getAttribute('selected'))) {
                    if (opt.getAttribute('value')) {
                        const value: string | number | boolean | {
                            [key: string]: Object;
                        }
                         = this.allowObjectBinding ? this.getDataByValue(opt.getAttribute('value')) : opt.getAttribute('value');
                        valueCol.push(value as never);
                    } else {
                        textCol += (opt.text + this.delimiterChar);
                    }
                }
            }
            if (valueCol.length > 0) {
                this.setProperties({value: valueCol}, true);
            } else if (textCol !== '') {
                this.setProperties({text: textCol}, true);
            }
            if (valueCol.length > 0 || textCol !== '') {
                this.refreshInputHight();
                this.refreshPlaceHolder();
            }
        }
        if ((this.value && this.value.length) || !isNullOrUndefined(this.text)) {
            if (!this.list) {
                super.render();
            }
        }
        if (this.fields.disabled) {
            this.text = this.text && !this.isDisabledItemByIndex(this.getIndexByValue(this.getValueByText(this.text))) ? this.text : null;
        }
        if (!isNullOrUndefined(this.text) && (isNullOrUndefined(this.value) || this.value.length === 0)) {
            this.initialTextUpdate();
        }
        if (this.value && this.value.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let listItems: any;
            if (this.enableVirtualization) {
                const fields: string = !this.isPrimitiveData ? this.fields.value : '';
                let predicate: Predicate;
                for (let i: number = 0; i < this.value.length; i++) {
                    const value: string | number | boolean = this.allowObjectBinding ?
                        getValue((this.fields.value) ? this.fields.value : '', (this.value[i as number] as string)) :
                        (this.value[i as number] as string);
                    if (i === 0) {
                        predicate = new Predicate(fields, 'equal', (value as string));
                    } else {
                        predicate = predicate.or(fields, 'equal', (value as string));
                    }
                }
                if (this.dataSource instanceof DataManager) {
                    this.dataSource.executeQuery(new Query().where(predicate))
                        .then((e: Object) => {
                            if (((e as ResultData).result as any).length > 0) {
                                listItems = ((e as ResultData).result as any);
                                this.initStatus = false;
                                this.isInitRemoteVirtualData = true;
                                setTimeout(() => {
                                    this.initialValueUpdate(listItems, true);
                                    this.initialUpdate();
                                    this.isInitRemoteVirtualData = false;
                                }, 100);
                                this.initStatus = true;
                            }
                        });
                }
                else{
                    listItems = <{ [key: string]: Object }[] | string[] | number[] | boolean[]>new DataManager(
                        this.dataSource as DataOptions | JSON[]).executeLocal(new Query().where(predicate));
                }
            }
            if (!(this.dataSource instanceof DataManager)) {
                this.initialValueUpdate(listItems, true);
                this.initialUpdate();
            } else {
                this.setInitialValue = () => {
                    this.initStatus = false;
                    if (!this.enableVirtualization || (this.enableVirtualization && (!(this.dataSource instanceof DataManager)))){
                        this.initialValueUpdate(listItems);
                    }
                    this.initialUpdate();
                    this.setInitialValue = null;
                    this.initStatus = true;
                };
            }
            this.updateTempValue();
        } else {
            this.initialUpdate();
        }
        this.initStatus = true;
        this.checkAutoFocus();
        if (!isNullOrUndefined(this.text)) {
            this.element.setAttribute('data-initial-value', this.text);
        }
    }
    private checkAutoFocus(): void {
        if (this.element.hasAttribute('autofocus')) {
            this.inputElement.focus();
        }
    }
    private updatevirtualizationList(): void{
        if (this.value && this.value.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let element: any;
            for (const value of this.value) {
                const checkValue: string | number | boolean = this.allowObjectBinding ? getValue((this.fields.value) ?
                    this.fields.value : '', value) : value;
                element = this.getElementByValue(checkValue);
                if (element){
                    this.addListSelection(element);
                }
            }
            if (this.enableVirtualization && this.hideSelectedItem) {
                const visibleListElements: NodeListOf<Element> = <NodeListOf<HTMLElement>>this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)' + ':not(.e-virtual-list)');
                if (visibleListElements.length) {
                    const actualCount: number = this.virtualListHeight > 0 ? Math.floor(this.virtualListHeight / this.listItemHeight) : 0;
                    if (visibleListElements.length < (actualCount + 2)) {
                        let query: Query = this.getForQuery(this.value).clone();
                        query = query.skip(this.viewPortInfo.startIndex);
                        this.resetList(this.dataSource, this.fields, query);
                    }
                }
            }
        }
    }
    private setFloatLabelType(): void {
        removeFloating(
            this.overAllWrapper,
            this.componentWrapper,
            this.searchWrapper,
            this.inputElement,
            this.value,
            this.floatLabelType,
            this.placeholder
        );
        if (this.floatLabelType !== 'Never') {
            createFloatLabel(
                this.overAllWrapper,
                this.searchWrapper,
                this.element,
                this.inputElement,
                this.value,
                this.floatLabelType,
                this.placeholder
            );
        }
    }
    private addValidInputClass(): void {
        if (!isNullOrUndefined(this.overAllWrapper)) {
            if ((!isNullOrUndefined(this.value) && this.value.length) || this.floatLabelType === 'Always') {
                addClass([this.overAllWrapper], 'e-valid-input');
            } else {
                removeClass([this.overAllWrapper], 'e-valid-input');
            }
        }
    }
    private dropDownIcon(): void {
        if (this.showDropDownIcon) {
            this.dropIcon = this.createElement('span', { className: dropdownIcon });
            this.componentWrapper.appendChild(this.dropIcon);
            addClass([this.componentWrapper], ['e-down-icon']);
        } else {
            if (!isNullOrUndefined(this.dropIcon)) {
                this.dropIcon.parentElement.removeChild(this.dropIcon);
                removeClass([this.componentWrapper], ['e-down-icon']);
            }
        }
    }
    private initialUpdate(): void {
        if (this.mode !== 'Box' && !(this.setDynValue && this.mode === 'Default' && this.inputFocus)) {
            this.updateDelimView();
        }
        this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
        this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.itemCount;
        this.updateCssClass();
        this.updateHTMLAttribute();
        this.updateReadonly(this.readonly);
        this.refreshInputHight();
        this.checkPlaceholderSize();
    }
    /**
     * Method to disable specific item in the popup.
     *
     * @param {string | number | object | HTMLLIElement} item - Specifies the item to be disabled.
     * @returns {void}
     * @deprecated
     */
    public disableItem(item: string | number | object | HTMLLIElement): void {
        if (this.fields.disabled) {
            if (!this.list) {
                this.renderList();
            }
            let itemIndex: number = -1;
            if (this.liCollections && this.liCollections.length > 0 && this.listData && this.fields.disabled) {
                if (typeof (item) === 'string') {
                    itemIndex = this.getIndexByValue(item);
                }
                else if (typeof item === 'object') {
                    if (item instanceof HTMLLIElement) {
                        for (let index: number = 0; index < this.liCollections.length; index++) {
                            if (this.liCollections[index as number] as HTMLLIElement === item) {
                                itemIndex = this.getIndexByValue(item.getAttribute('data-value'));
                                break;
                            }
                        }
                    }
                    else {
                        const value: string = JSON.parse(JSON.stringify(item))[this.fields.value];
                        for (let index: number = 0; index < this.listData.length; index++) {
                            if (JSON.parse(JSON.stringify(this.listData[index as number]))[this.fields.value] === value) {
                                itemIndex = this.getIndexByValue(value);
                                break;
                            }
                        }
                    }
                }
                else {
                    itemIndex = item;
                }
                const isValidIndex: boolean = itemIndex < this.liCollections.length && itemIndex > -1;
                if (isValidIndex && !(JSON.parse(JSON.stringify(this.listData[itemIndex as number]))[this.fields.disabled])) {
                    const li: HTMLLIElement = this.liCollections[itemIndex as number] as HTMLLIElement;
                    if (li) {
                        this.disableListItem(li);
                        const parsedData: { [key: string]: Object } = JSON.parse(JSON.stringify(this.listData[itemIndex as number]));
                        parsedData[this.fields.disabled] = true;
                        this.listData[itemIndex as number] = parsedData;
                        if (li.classList.contains(dropDownBaseClasses.focus)) {
                            this.removeFocus();
                        }
                        if (li.classList.contains(HIDE_LIST) || li.classList.contains(dropDownBaseClasses.selected)) {
                            const oldValue: string[] | number[] | boolean[] | object[] = this.value;
                            this.removeDisabledItemsValue(this.value);
                            this.updateVal(this.value, oldValue, 'value');
                        }
                        if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                            this.disableGroupHeader();
                        }
                    }
                }
            }
        }
    }

    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    public destroy(): void {
        // eslint-disable-next-line
        if ((this as any).isReact) { this.clearTemplate(); }
        if (!isNullOrUndefined(this.popupObj)) {
            this.popupObj.hide();
            this.popupObj.destroy();
        }
        this.notify(destroy, {});
        this.unwireListEvents();
        this.unWireEvent();
        const temp: string[] = ['readonly', 'aria-disabled', 'placeholder', 'aria-label', 'aria-expanded'];
        let length: number = temp.length;
        if (!isNullOrUndefined(this.inputElement)) {
            while (length > 0) {
                this.inputElement.removeAttribute(temp[length - 1]);
                length--;
            }
        }
        if (!isNullOrUndefined(this.element)) {
            this.element.removeAttribute('data-initial-value');
            this.element.style.display = 'block';
        }
        if (this.overAllWrapper && this.overAllWrapper.parentElement) {
            if (this.overAllWrapper.parentElement.tagName === this.getNgDirective()) {
                remove(this.overAllWrapper);
            } else {
                this.overAllWrapper.parentElement.insertBefore(this.element, this.overAllWrapper);
                remove(this.overAllWrapper);
            }
        }
        if (this.popupWrapper && this.popupWrapper.parentElement) {
            this.popupWrapper.parentElement.remove();
        }
        while (this.searchWrapper && this.searchWrapper.firstChild) {
            this.searchWrapper.removeChild(this.searchWrapper.firstChild);
        }
        if (this.searchWrapper && this.searchWrapper.parentElement) {
            this.searchWrapper.parentElement.remove();
        }
        if (this.viewWrapper && this.viewWrapper.parentElement) {
            this.viewWrapper.parentElement.remove();
        }
        if (this.overAllClear && this.overAllClear.parentElement) {
            this.overAllClear.parentElement.remove();
        }
        if (this.delimiterWrapper && this.delimiterWrapper.parentElement) {
            this.delimiterWrapper.parentElement.remove();
        }

        // Remove the select element if it exists
        const selectElement: any = this.overAllWrapper.querySelector('select.e-multi-hidden');
        if (selectElement && selectElement.parentElement) {
            selectElement.parentElement.remove();
        }
        while (this.componentWrapper && this.componentWrapper.firstChild) {
            this.componentWrapper.removeChild(this.componentWrapper.firstChild);
        }
        if (this.componentWrapper && this.componentWrapper.parentElement) {
            this.componentWrapper.removeAttribute('class');
            this.componentWrapper.parentElement.remove();
        }
        while (this.popupWrapper && this.popupWrapper.firstChild) {
            this.popupWrapper.removeChild(this.popupWrapper.firstChild);
        }
        if (this.inputElement) {
            const attrArray: string[] = ['readonly', 'aria-disabled', 'placeholder', 'aria-labelledby',
                'aria-expanded', 'autocomplete', 'aria-readonly', 'autocapitalize',
                'spellcheck', 'aria-autocomplete', 'aria-live', 'aria-label', 'aria-hidden', 'tabindex', 'aria-controls',
                'aria-describedby', 'size', 'role', 'type', 'class'];
            for (let i: number = 0; i < attrArray.length; i++) {
                this.inputElement.removeAttribute(attrArray[i as number]);
            }
        }
        if (this.inputElement) {
            this.inputElement.remove();
        }
        this.list = null;
        this.popupObj = null;
        this.mainData = null;
        this.filterParent = null;
        this.ulElement = null;
        this.componentWrapper = null;
        this.overAllClear = null;
        this.overAllWrapper = null;
        this.hiddenElement = null;
        this.searchWrapper = null;
        this.viewWrapper = null;
        this.chipCollectionWrapper = null;
        this.targetInputElement = null;
        this.popupWrapper = null;
        this.inputElement = null;
        this.delimiterWrapper = null;
        this.liCollections = null;
        this.popupContentElement = null;
        this.header = null;
        this.mainList = null;
        this.mainListCollection = null;
        this.footer = null;
        this.selectAllEventEle = null;
        super.destroy();
    }
}
export interface CustomValueEventArgs {
    /**
     * Gets the newly added data.
     *
     */
    newData: Object
    /**
     * Illustrates whether the current action needs to be prevented or not.
     */
    cancel: boolean
}

export interface TaggingEventArgs {
    /**
     * If the event is triggered by interaction, it returns true. Otherwise, it returns false.
     */
    isInteracted: boolean
    /**
     * Returns the selected item as JSON Object from the data source.
     *
     */
    itemData: FieldSettingsModel
    /**
     * Specifies the original event arguments.
     */
    e: MouseEvent | KeyboardEvent | TouchEvent
    /**
     * To set the classes to chip element
     *
     * @param  { string } classes - Specify the classes to chip element.
     * @returns {void}
     */
    setClass: Function
    /**
     * Illustrates whether the current action needs to be prevented or not.
     */
    cancel: boolean
}
export interface MultiSelectChangeEventArgs {
    /**
     * If the event is triggered by interaction, it returns true. Otherwise, it returns false.
     */
    isInteracted: boolean
    /**
     * Returns the component initial Value.
     *
     * @isGenericType true
     */
    oldValue: number[] | string[] | boolean[] | object[]
    /**
     * Returns the updated component Values.
     *
     * @isGenericType true
     */
    value: number[] | string[] | boolean[] | object[]
    /**
     * Specifies the original event arguments.
     */
    e: MouseEvent | KeyboardEvent | TouchEvent
    /**
     * Returns the root element of the component.
     */
    element: HTMLElement
    /**
     * Specifies the original event arguments.
     */
    event: MouseEvent | KeyboardEvent | TouchEvent
}
export type visualMode = 'Default' | 'Delimiter' | 'Box' | 'CheckBox';

export interface ISelectAllEventArgs {
    /**
     * If the event is triggered by interaction, it returns true. Otherwise, it returns false.
     */
    isInteracted: boolean
    /**
     * Returns the selected list items.
     */
    items: HTMLLIElement[]
    /**
     * Returns the selected items as JSON Object from the data source.
     *
     */
    itemData: FieldSettingsModel[]
    /**
     * Specifies the original event arguments.
     */
    event: MouseEvent | KeyboardEvent | TouchEvent
    /**
     * Specifies whether it is selectAll or deSelectAll.
     */
    isChecked?: boolean
    /**
     * Specifies whether the select event is fired.
     */
    preventSelectEvent?: boolean

}
