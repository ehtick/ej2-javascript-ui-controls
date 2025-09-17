// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path='../interactive-chat-base/interactive-chat-base-model.d.ts'/>
import { EventHandler, INotifyPropertyChanged, Property, NotifyPropertyChanges, Collection, EmitType, Event, remove, L10n, SanitizeHtmlHelper } from '@syncfusion/ej2-base';
import { ChildProperty, getUniqueID, isNullOrUndefined as isNOU, BaseEventArgs, Complex, removeClass, addClass } from '@syncfusion/ej2-base';
import { AIAssistViewModel, PromptModel, ResponseToolbarSettingsModel, PromptToolbarSettingsModel, AssistViewModel, AttachmentSettingsModel } from './ai-assistview-model';
import { ItemModel, Toolbar, ClickEventArgs } from '@syncfusion/ej2-navigations';
import { InterActiveChatBase, ToolbarSettings, ToolbarItem, ToolbarItemClickedEventArgs, TextState } from '../interactive-chat-base/interactive-chat-base';
import { ToolbarItemModel, ToolbarSettingsModel } from '../interactive-chat-base/interactive-chat-base-model';
import { ActionCompleteEventArgs, FileInfo, Uploader, BeforeUploadEventArgs, UploadingEventArgs } from '@syncfusion/ej2-inputs';

const ASSISTHEADER: string = 'e-aiassist-header-text e-assist-view-header';
/* eslint-disable @typescript-eslint/no-misused-new, no-redeclare */
interface ClipboardItem {
    new (items: { [mimeType: string]: Blob }): ClipboardItem;
}
declare let ClipboardItem: any;
/* eslint-enable @typescript-eslint/no-misused-new, no-redeclare */
/**
 * The prompts property maps the list of the prompts and binds the data to the suggestions.
 */
export class Prompt extends ChildProperty<Prompt> {
    /**
     * Specifies the prompt text.
     * Represents the text used for prompting user input.
     *
     * @type {string}
     * @default null
     */
    @Property(null)
    public prompt: string;

    /**
     * Specifies the response associated with the prompt.
     * Represents the text that provides the response to the prompt.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public response: string;

    /**
     * Indicates if the response is considered helpful.
     * Represents the state of whether the generated response is useful or not.
     *
     * @type {boolean | null}
     * @default null
     */
    @Property(null)
    public isResponseHelpful: boolean;

    /**
     * Specifies the list of files attached within the AI assist view.
     * This property accepts an array of `FileInfo` objects that represent the files to be attached.
     * By providing these files, they will be rendered during the initial rendering of the component.
     *
     * @type {FileInfo}
     * @default null
     */
    @Property(null)
    public attachedFiles: FileInfo[];
}

/**
 * Specifies the type of assist view.
 */
export enum AssistViewType {
    /**
     * Represents the default assist view type.
     */
    Assist = 'Assist',
    /**
     * Represents a custom assist view type.
     */
    Custom = 'Custom'
}

/**
 * The assistView property maps the customized AiAssistView.
 */
export class AssistView extends ChildProperty<AssistView> {
    /**
     * Specifies the type of the assist view.
     *
     * @isenumeration true
     * @default AssistViewType.Assist
     * @asptype AssistViewType
     */
    @Property('Assist')
    public type: string | AssistViewType;

    /**
     * Specifies the name of the assist view.
     * Represents the name displayed in the assist view.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public name: string;

    /**
     * Specifies the icon CSS for the assist view.
     * Represents the CSS class for the icon of the assist view.
     *
     * @type {string}
     * @default null
     */
    @Property()
    public iconCss: string;

    /**
     * Specifies the template for the view of the assist view.
     * Represents the template for rendering the view, which can be a string or a function.
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property()
    public viewTemplate: string | Function;
}

/**
 * Represents settings for managing file attachments in the AI Assist View.
 * Includes configuration for URLs, file types, and size limitations.
 */
export class AttachmentSettings extends ChildProperty<AttachmentSettings> {

    /**
     * Specifies the URL to save the uploaded files.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public saveUrl: string;

    /**
     * Specifies the URL to remove the files from the server.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public removeUrl: string;

    /**
     * Specifies the allowed file types for attachments.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public allowedFileTypes: string;

    /**
     * Specifies the maximum file size allowed for attachments in bytes.
     *
     * @type {number}
     * @default 2000000
     */
    @Property(2000000)
    public maxFileSize: number;
}


/**
 * The promptToolbarSettings property maps the list of the promptToolbarSettings and binds the data to the prompt.
 */
export class PromptToolbarSettings extends ChildProperty<PromptToolbarSettings> {
    /**
     * Specifies the width of the prompt toolbar in the AIAssistView component.
     * Represents the width of the toolbar, which can be set using a string value such as 'auto', '100%', or other CSS width values.
     *
     * @type {string}
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public width: string | number;

    /**
     * Specifies the collection of toolbar items in the prompt toolbar of the AIAssistView component.
     * Represents the list of items to be displayed in the toolbar.
     *
     * @type {ToolbarItemModel[]}
     * @default null
     */
    @Collection<ToolbarItemModel>([], ToolbarItem)
    public items: ToolbarItemModel[];

    /**
     * Event raised when a toolbar item is clicked in the prompt toolbar of the AIAssistView component.
     *
     * @event itemClicked
     */
    @Event()
    public itemClicked: EmitType<ToolbarItemClickedEventArgs>;
}

/**
 * The responseToolbarSettings property maps the list of the responseToolbarSettings and binds the data to the output items.
 */
export class ResponseToolbarSettings extends ChildProperty<ResponseToolbarSettings> {
    /**
     * Specifies the width of the response toolbar in the AIAssistView component.
     * Represents the width of the toolbar, which can be defined using various CSS units and values such as 'auto', '100%', or pixel-based measurements.
     *
     * @type {string}
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public width: string | number;

    /**
     * Specifies the collection of toolbar items in the response toolbar of the AIAssistView component.
     * Represents an array of items that are rendered in the toolbar, allowing for customization and interaction within the response section.
     *
     * @type {ToolbarItemModel[]}
     * @default null
     */
    @Collection<ToolbarItemModel>([], ToolbarItem)
    public items: ToolbarItemModel[];

    /**
     * Event raised when a toolbar item is clicked in the response toolbar of the AIAssistView component.
     *
     * @event itemClicked
     */
    @Event()
    public itemClicked: EmitType<ToolbarItemClickedEventArgs>;
}


export interface PromptRequestEventArgs extends BaseEventArgs {
    /**
     * Specifies whether the prompt request should be cancelled.
     * Determines if the prompt request should be stopped, giving control over whether the prompt processing continues or is aborted.
     *
     * @type {boolean}
     * @default false
     *
     */
    cancel?: boolean
    /**
     * Specifies the toolbar items for the output view in the AIAssistView component.
     * Represents the collection of toolbar items that are displayed alongside the output view, allowing for additional interactions.
     *
     * @type {ToolbarItemModel[]}
     * @default null
     *
     */
    responseToolbarItems?: ToolbarItemModel[]
    /**
     * Specifies the text of the prompt request.
     *
     * @type {string}
     * @default null
     *
     */
    prompt?: string
    /**
     * Specifies the list of prompt suggestions.
     * Represents an array of suggested prompts that can assist the user.
     *
     * @type {string[]}
     * @default null
     *
     */
    promptSuggestions?: string[]

    /**
     * Specifies the files attached with the prompt request.
     * Represents an array of file information objects for files attached during the prompt request.
     *
     * @type {FileInfo[]}
     * @default []
     *
     */
    attachedFiles?: FileInfo[];
}

export interface PromptChangedEventArgs extends BaseEventArgs {
    /**
     * Specifies the current value of the prompt.
     * Represents the updated text or data of the prompt after the change has occurred.
     *
     * @type {string}
     * @default null
     *
     */
    value?: string
    /**
     * Specifies the previous value of the prompt before the change.
     *
     * @type {string}
     * @default null
     *
     */
    previousValue?: string
    /**
     * Specifies the event object associated with the prompt change.
     * Represents the underlying event that triggered the prompt change, useful for additional event details or handling.
     *
     * @type {Event}
     */
    event?: Event
    /**
     * Specifies the HTML element of the text area container.
     * Represents the DOM element that contains the text area, allowing for direct manipulation or reference.
     *
     * @type {HTMLElement}
     */
    element?: HTMLElement
}

export interface StopRespondingEventArgs extends BaseEventArgs {
    /**
     * Specifies the event object associated with the stop responding action.
     * Represents the underlying event that triggered the action.
     *
     * @type {Event}
     * @default null
     */
    event?: Event
    /**
     * Specifies the prompt text associated with the request.
     * Represents the input prompt for which the response was being generated.
     *
     * @type {string}
     * @default ''
     *
     */
    prompt?: string
    /**
     * Specifies the index of the prompt in the prompt list.
     * Represents the position of the prompt in the stored collection.
     *
     * @type {number}
     * @default -1
     */
    dataIndex?: number
}

/**
 * The `AIAssistView` component is designed to enhance user interaction by integrating AI driven assistance features.
 * It provides a seamless interface for incorporating suggestions & AI responses.
 *
 * ```html
 *  <div id='defaultAIAssistView'></div>
 * ```
 * ```typescript
 *  let aiAssistObj: AIAssistView = new AIAssistView();
 *  aiAssistObj.appendTo('#defaultAIAssistView');
 * ```
 */

@NotifyPropertyChanges
export class AIAssistView extends InterActiveChatBase implements INotifyPropertyChanged {

    /**
     * Specifies the text input prompt for the AIAssistView component.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public prompt: string;

    /**
     * Specifies the placeholder text for the prompt input text area in the AIAssistView component.
     *
     * @type {string}
     * @default 'Type prompt for assistance...'
     */
    @Property('Type prompt for assistance...')
    public promptPlaceholder: string;

    /**
     * Specifies the collection of prompts and their responses in the AIAssistView component.
     *
     * {% codeBlock src='ai-assistview/prompts/index.md' %}{% endcodeBlock %}
     *
     * @type {PromptModel[]}
     * @default []
     */
    @Collection<PromptModel>([], Prompt)
    public prompts: PromptModel[];

    /**
     * Specifies the list of prompt suggestions in the AIAssistView component.
     * Contains suggestions that can be used as prompts.
     *
     * {% codeBlock src='ai-assistview/promptSuggestions/index.md' %}{% endcodeBlock %}
     *
     * @type {string[]}
     * @default null
     */
    @Property([])
    public promptSuggestions: string[];

    /**
     * Specifies the header text for the prompt suggestions in the AIAssistView component. Provides a header for the list of suggestions.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public promptSuggestionsHeader: string;

    /**
     * Specifies whether the header is displayed in the AIAssistView component.
     *
     * @type {boolean}
     * @default true
     */
    @Property(true)
    public showHeader: boolean;

    /**
     * Specifies the toolbar settings for the AIAssistView component.
     * Represents the configuration for toolbar items and actions within the component.
     *
     * {% codeBlock src='ai-assistview/toolbarSettings/index.md' %}{% endcodeBlock %}
     *
     * @default []
     */
    @Complex<ToolbarSettingsModel>({ items: [] }, ToolbarSettings)
    public toolbarSettings: ToolbarSettingsModel;

    /**
     * Specifies the index of the active view in the AIAssistView component.
     * Determines the currently active and visible view.
     *
     * @type {number}
     * @default 0
     * @aspType int
     */
    @Property(0)
    public activeView : number;

    /**
     * Specifies the CSS class for the prompter avatar in the AIAssistView component. Allows custom styling for the prompt avatar.
     *
     * @type {string}
     * @default null
     */
    @Property(null)
    public promptIconCss: string;

    /**
     * Specifies the CSS class for the responder avatar in the AIAssistView component. Allows custom styling for the responder avatar.
     *
     * @type {string}
     * @default null
     */
    @Property(null)
    public responseIconCss: string;

    /**
     * Specifies the width of the AIAssistView component.
     *
     * @type {string | number}
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public width: string | number;

    /**
     * Specifies the height of the AIAssistView component.
     *
     * @type {string | number}
     * @default '100%'
     * @aspType string
     */
    @Property('100%')
    public height: string | number;

    /**
     * Specifies custom CSS classes for the AIAssistView component. Allows for additional custom styling.
     *
     * @type {string}
     * @default ''
     */
    @Property('')
    public cssClass: string;

    /**
     * Specifies the collection of assist view models in the AIAssistView component.
     * Represents the views available in the assist view.
     *
     * {% codeBlock src='ai-assistview/views/index.md' %}{% endcodeBlock %}
     *
     * @type {AssistViewModel[]}
     * @default null
     */
    @Collection<AssistViewModel>([], AssistView)
    public views: AssistViewModel[] ;

    /**
     * Specifies the settings for the prompt toolbar in the AIAssistView component.
     * Represents the configuration for the toolbar associated with prompt items.
     *
     * {% codeBlock src='ai-assistview/promptToolbarSettings/index.md' %}{% endcodeBlock %}
     *
     * @default null
     */
    @Complex<PromptToolbarSettingsModel>({ width: null, items: [] }, PromptToolbarSettings)
    public promptToolbarSettings: PromptToolbarSettingsModel;

    /**
     * Specifies the settings for the response toolbar in the AIAssistView component.
     * Represents the configuration for the toolbar associated with response items.
     *
     * {% codeBlock src='ai-assistview/responseToolbarSettings/index.md' %}{% endcodeBlock %}
     *
     * @default []
     */
    @Complex<ResponseToolbarSettingsModel>({width: null, items: [] }, ResponseToolbarSettings)
    public responseToolbarSettings: ResponseToolbarSettingsModel;

    /**
     * Specifies whether the attachments is enabled in the AIAssistView component.
     *
     * @type {boolean}
     * @default false
     */
    @Property(false)
    public enableAttachments: boolean;

    /**
     * Specifies the settings for the attachments in the AIAssistView component.
     * Represents the configuration for the uploader associated with footer.
     *
     *
     * @default null
     */
    @Complex<AttachmentSettingsModel>({saveUrl: '', removeUrl: '', maxFileSize: 2000000, allowedFileTypes: ''}, AttachmentSettings)
    public attachmentSettings: AttachmentSettingsModel;

    /**
     * Specifies whether the clear button of text area is displayed in the AIAssistView component.
     * Determines if a button for clearing the prompt text area is shown or hidden.
     *
     * @type {boolean}
     * @default false
     */
    @Property(false)
    public showClearButton: boolean;

    /**
     * Specifies the template for the footer in the AIAssistView component.
     * Defines the content or layout used to render the footer. Can be a string or a function.
     *
     * {% codeBlock src='ai-assistview/footerTemplate/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property('')
    public footerTemplate: string | Function;

    /**
     * Specifies the template for rendering prompt items in the AIAssistView component.
     * Defines the content or layout used to render prompt items, and can be either a string or a function.
     * The template context includes prompt text and toolbar items.
     *
     * {% codeBlock src='ai-assistview/promptItemTemplate/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property('')
    public promptItemTemplate: string | Function;

    /**
     * Specifies the template for rendering response items in the AIAssistView component.
     * Defines the content or layout used to render response items, and can be either a string or a function.
     * The template context includes the prompt text, response text, and toolbar items.
     *
     * {% codeBlock src='ai-assistview/responseItemTemplate/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property('')
    public responseItemTemplate: string | Function;

    /**
     * Specifies the template for rendering prompt suggestion items in the AIAssistView component.
     * Defines the content or layout used to render prompt suggestion items, and can be either a string or a function.
     * The template context includes the index and suggestion text.
     *
     * {% codeBlock src='ai-assistview/suggestionItemTemplate/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property('')
    public promptSuggestionItemTemplate: string | Function;

    /**
     * Specifies the template for the banner in the AIAssistView component.
     * Represents the content or layout used to render the banner. Can be a string or a function.
     *
     * {% codeBlock src='ai-assistview/bannerTemplate/index.md' %}{% endcodeBlock %}
     *
     * @default ''
     * @angularType string | object
     * @reactType string | function | JSX.Element
     * @vueType string | function
     * @aspType string
     */
    @Property('')
    public bannerTemplate: string | Function;

    /**
     * Event triggered when a prompt request is made in the AIAssistView component.
     * Provides details about the prompt request, including whether it should be cancelled, the prompt text, output, and toolbar items.
     *
     * @event promptRequest
     */
    @Event()
    public promptRequest: EmitType<PromptRequestEventArgs>;

    /**
     * Event triggered when the prompt text changed in the AIAssistView component.
     *
     * @event 'promptChanged'
     */
    @Event()
    public promptChanged: EmitType<PromptChangedEventArgs>;

    /**
     * Triggers when the 'Stop Responding' button is clicked while a prompt request is in progress.
     * This event allows users to handle stopping the response generation and update the UI accordingly.
     *
     * @event stopRespondingClick
     */
    @Event()
    public stopRespondingClick: EmitType<StopRespondingEventArgs>;

    /**
     * Event triggered before an attachment upload is initiated.
     * Provides details about the file to be uploaded.
     *
     * @event beforeAttachmentUpload
     */
    @Event()
    public beforeAttachmentUpload: EmitType<BeforeUploadEventArgs>;

    /**
     * Event triggered on successful attachment upload.
     * Provides details about the uploaded file.
     *
     * @event attachmentUploadSuccess
     */
    @Event()
    public attachmentUploadSuccess: EmitType<object>;

    /**
     * Event triggered on attachment upload failure.
     * Provides details about the failed file and error message.
     *
     * @event attachmentUploadFailure
     */
    @Event()
    public attachmentUploadFailure: EmitType<object>;

    /**
     * Event triggered when an attachment is removed.
     * Provides details about the removed file.
     *
     * @event attachmentRemoved
     */
    @Event()
    public attachmentRemoved: EmitType<object>;

    /* Private variables */
    private l10n: L10n;
    private stopRespondingContent: HTMLElement;
    private viewWrapper: HTMLElement;
    private outputElement: HTMLElement;
    private skeletonContainer: HTMLElement;
    private aiAssistViewRendered: boolean;
    private outputSuggestionEle : HTMLElement;
    private contentFooterEle: HTMLElement;
    private contentWrapper: HTMLElement;
    private responseToolbarEle: Toolbar;
    private assistViewTemplateIndex: number;
    private toolbarHeader: HTMLElement;
    private assistCustomSection: HTMLElement;
    private toolbarItems: ItemModel[] = [];
    private toolbar: Toolbar;
    private displayContents: HTMLElement[] = [];
    private previousElement: HTMLElement;
    private stopResponding: HTMLElement;
    private isOutputRenderingStop: boolean;
    private promptToolbarEle: Toolbar;
    private isAssistView: boolean;
    private outputContentBodyEle: HTMLElement;
    private preTagElements: { preTag: HTMLPreElement; handler: Function }[] = [];
    private isResponseRequested : boolean;
    private lastStreamPrompt: string;
    private attachmentIcon: HTMLElement;
    private uploadedFiles: FileInfo[] = [];
    private uploaderObj: Uploader;
    private dropArea: HTMLElement;


    /**
     * Constructor for creating the component
     *
     * @param {AIAssistViewModel} options - Specifies the AIAssistViewModel model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    public constructor(options?: AIAssistViewModel, element?: string | HTMLElement) {
        super(options, element);
    }
    /**
     * Initialize the event handler
     *
     * @private
     * @returns {void}
     */
    protected preRender(): void {
        if (!this.element.id) { this.element.id = getUniqueID('e-' + this.getModuleName()); }
    }

    protected getDirective(): string {
        return 'EJS-AIASSISTVIEW';
    }

    /**
     * To get component name.
     *
     * @returns {string} - It returns the current module name.
     * @private
     */
    public getModuleName(): string {
        return 'aiassistview';
    }

    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @private
     * @returns {string} - It returns the persisted data.
     */
    protected getPersistData(): string {
        return this.addOnPersist([]);
    }

    protected render(): void {
        this.initializeLocale();
        this.renderPromptView();
    }

    private renderPromptView(): void {
        this.setDimension(this.element, this.width, this.height);
        this.renderViews();
        this.renderToolbar();
        this.updateFooterEleClass();
        this.wireEvents();
    }

    private renderToolbar(): void {
        this.updateHeaderToolbar();
        if (this.assistViewTemplateIndex < 0) { this.displayContents.unshift(this.contentWrapper); }
        else { this.displayContents.unshift(this.assistCustomSection); }
        this.previousElement = this.displayContents[this.activeView];
        this.renderHeaderToolbar();
        this.viewWrapper = this.element.querySelector('.e-view-content');
        this.updateActiveView();
        this.addCssClass(this.element, this.cssClass);
        this.updateHeader(this.showHeader, this.toolbarHeader, this.viewWrapper);
        this.aiAssistViewRendered = true;
        this.addRtlClass(this.element, this.enableRtl);
    }

    private renderViews(): void {
        this.assistViewTemplateIndex = -1;
        this.aiAssistViewRendered = false;
        this.isAssistView = false;
        this.isOutputRenderingStop = false;
        this.isResponseRequested = false;
        this.renderViewSections(this.element, 'e-view-header', 'e-view-content');
        let isAssistViewAssigned: boolean = false;
        let assistView: ItemModel;
        let customViewTemplate: HTMLElement;
        let customViewCount: number = 1;
        if (this.views.length > 0) {
            for (let index: number = 0; index < this.views.length; index++) {
                if (this.views[parseInt(index.toString(), 10)].type.toLocaleLowerCase() === 'assist' && !isAssistViewAssigned) {
                    assistView = {
                        text: this.views[parseInt(index.toString(), 10)].name || 'AI Assist',
                        prefixIcon: this.views[parseInt(index.toString(), 10)].iconCss || 'e-icons e-assistview-icon',
                        cssClass: ASSISTHEADER,
                        htmlAttributes: { 'data-index': this.element.id + '_view_0' }
                    };
                    this.toolbarItems.unshift(assistView);
                    if (this.views[parseInt(index.toString(), 10)].viewTemplate) { this.assistViewTemplateIndex = index; }
                    isAssistViewAssigned = true;
                    this.isAssistView = true;
                }
                else if (this.views[parseInt(index.toString(), 10)].type.toLocaleLowerCase() === 'custom') {
                    customViewTemplate = this.createElement('div', { className: 'e-customview-content-section-' + customViewCount + ' e-custom-view' });
                    this.getContextObject('customViewTemplate', customViewTemplate, -1, index);
                    this.displayContents.push(customViewTemplate);
                    this.toolbarItems.push({
                        text: this.views[parseInt(index.toString(), 10)].name || '',
                        prefixIcon : this.views[parseInt(index.toString(), 10)].iconCss || '',
                        cssClass: 'e-aiassist-header-text e-custom-view-header',
                        htmlAttributes: { 'data-index': this.element.id + '_view_' + customViewCount.toString() }
                    });
                    customViewCount++;
                }
            }
        }
        if (this.views.length === 0 || !isAssistViewAssigned) {
            assistView = {
                text: 'AI Assist',
                prefixIcon: 'e-icons e-assistview-icon',
                cssClass: ASSISTHEADER,
                htmlAttributes: { 'data-index': this.element.id + '_view_0' }
            };
            this.toolbarItems.unshift(assistView);
            isAssistViewAssigned = true;
        }
        if (this.assistViewTemplateIndex >= 0 && this.views[this.assistViewTemplateIndex].viewTemplate) {
            this.assistCustomSection = this.createElement('div', { attrs: { class: 'e-assistview-content-section', 'data-index': this.element.id + '_view_0' } });
            this.getContextObject('assistViewTemplate', this.assistCustomSection, -1, this.assistViewTemplateIndex);
        } else {
            this.renderDefaultView();
        }
    }

    private renderHeaderToolbar(): void {
        this.toolbar = new Toolbar({
            items: this.toolbarItems,
            height: '100%',
            enableRtl: this.enableRtl,
            clicked: (args: ClickEventArgs) => {
                const eventItemArgs: ToolbarItemModel = {
                    type: args.item.type,
                    text: args.item.text,
                    iconCss: args.item.prefixIcon,
                    cssClass: args.item.cssClass,
                    tooltip: args.item.tooltipText,
                    template: args.item.template as string | Function,
                    disabled: args.item.disabled,
                    visible: args.item.visible,
                    align: args.item.align,
                    tabIndex: args.item.tabIndex
                };
                const eventArgs: ToolbarItemClickedEventArgs = {
                    item: eventItemArgs,
                    event: args.originalEvent,
                    cancel: false
                };
                if (this.toolbarSettings.itemClicked) {
                    this.toolbarSettings.itemClicked.call(this, eventArgs);
                }
                if (!eventArgs.cancel) {
                    if (args.item.htmlAttributes) {
                        const currentIndex: number = parseInt(args.item.htmlAttributes['data-index'].split(this.element.id + '_view_')[1], 10);
                        if (currentIndex !== this.activeView) {
                            const prevOnChange: boolean = this.isProtectedOnChange;
                            this.isProtectedOnChange = true;
                            const previousIndex: number = this.getIndex(this.activeView);
                            this.activeView = parseInt(args.item.htmlAttributes['data-index'].split(this.element.id + '_view_')[1], 10);
                            this.updateActiveView(previousIndex);
                            this.isProtectedOnChange = prevOnChange;
                        }
                    }
                }
            }
        });
        this.toolbarHeader = this.element.querySelector('.e-view-header');
        const toolbarEle: HTMLElement = this.createElement('div');
        this.toolbar.appendTo(toolbarEle);
        this.toolbar.element.setAttribute('aria-label', 'assist-view-toolbar-header');
        this.toolbarHeader.appendChild(toolbarEle);
    }

    private updateHeaderToolbar(): void {
        if (this.toolbarSettings.items.length > 0) {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const pushToolbar: ItemModel[] = this.toolbarSettings.items.map((item: any) => ({
                type: item.type,
                template: item.template,
                disabled: item.disabled,
                cssClass: item.cssClass,
                visible: item.visible,
                tooltipText: item.tooltip,
                prefixIcon: item.iconCss,
                text: item.text,
                align: item.align,
                tabIndex: item.tabIndex
            }));
            this.toolbarItems = [...this.toolbarItems, ...pushToolbar];
        }
    }

    private getIndex(currentIndex: number): number {
        return (((currentIndex) > (this.views.length - (this.isAssistView ? 1 : 0))) || (currentIndex < 0)) ?
            0 : currentIndex;
    }

    private updateActiveView(previousIndex?: number): void {
        const activeViewIndex: number = this.getIndex(this.activeView);
        if (!this.aiAssistViewRendered) {
            this.appendView(activeViewIndex);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this.toolbar as any).tbarEle[parseInt(activeViewIndex.toString(), 10)]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this.toolbar as any).tbarEle[parseInt(activeViewIndex.toString(), 10)].classList.add('e-active');
            }
        }
        else if (previousIndex !== activeViewIndex) {
            this.removePreviousView(previousIndex, activeViewIndex);
            this.appendView(activeViewIndex);
        }
        this.previousElement = this.displayContents[parseInt(activeViewIndex.toString(), 10)];
    }

    private appendView(activeViewIndex: number): void {
        //updating the new view section according to the activeView property
        if (activeViewIndex === 0 && this.assistViewTemplateIndex < 0) {
            this.viewWrapper.append(this.contentWrapper, this.stopResponding, this.footer);
        }
        else if (activeViewIndex === 0 && this.assistViewTemplateIndex >= 0) {
            this.viewWrapper.append(this.assistCustomSection);
        }
        else {
            this.viewWrapper.append(this.displayContents[parseInt(activeViewIndex.toString(), 10)]);
        }
    }

    private removePreviousView(previousIndex: number, activeViewIndex: number): void {
        // removing the previously binded element
        this.viewWrapper.removeChild(this.previousElement);
        if (previousIndex === 0 && this.assistViewTemplateIndex < 0) {
            this.viewWrapper.removeChild(this.stopResponding);
            this.viewWrapper.removeChild(this.footer);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((this.toolbar as any).tbarEle[parseInt(activeViewIndex.toString(), 10)]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.toolbar as any).tbarEle[parseInt(activeViewIndex.toString(), 10)].classList.add('e-active');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (previousIndex >= 0 && (this.toolbar as any).tbarEle[parseInt(previousIndex.toString(), 10)]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.toolbar as any).tbarEle[parseInt(previousIndex.toString(), 10)].classList.remove('e-active');
        }
    }

    private renderDefaultView(): void {
        const viewWrapper: HTMLElement = this.element.querySelector('.e-view-content');
        this.createViewComponents(viewWrapper);
        this.contentWrapper = this.element.querySelector('.e-views');
        this.contentWrapper.setAttribute('data-index', this.element.id + '_view_0');
        const contentContainer: HTMLElement = this.element.querySelector('.e-view-container');
        this.content = this.getElement('contentContainer');
        this.getFooter();
        const footerClass: string = `e-footer ${this.footerTemplate ? 'e-footer-template' : ''}`;
        this.footer.className = footerClass;
        this.renderContent();
        this.renderAssistViewFooter();
        this.renderBannerView(this.bannerTemplate, contentContainer, 'bannerTemplate');
        contentContainer.append(this.content);
        this.renderStopResponding();
    }

    private initializeLocale(): void {
        this.l10n = new L10n('aiassistview', {
            stopResponseText: 'Stop Responding',
            fileSizeFailure: 'Upload failed: File size is too large',
            send: 'Send',
            attachments: 'Attach File',
            clear: 'Clear'
        }, this.locale);
        this.l10n.setLocale(this.locale);
    }

    private renderStopResponding(): void {
        this.stopResponding = this.createElement('div', { attrs: { class: 'e-stop-response', tabIndex: '0', 'aria-label': 'Stop Responding', role: 'button' } });
        const stopRespondingIcon: HTMLElement = this.createElement('span', { className: 'e-icons e-assist-stop' });
        this.stopRespondingContent = this.createElement('span', { className: 'e-stop-response-text' });
        this.updateStopRespondingTitle();
        this.appendChildren(this.stopResponding, stopRespondingIcon, this.stopRespondingContent);
    }

    private updateStopRespondingTitle(): void {
        this.l10n.setLocale(this.locale);
        this.stopRespondingContent.textContent = this.l10n.getConstant('stopResponseText');
    }

    private renderContent(): void {
        this.renderSuggestions(this.promptSuggestions, this.promptSuggestionsHeader, this.promptSuggestionItemTemplate,
                               'promptSuggestion', 'promptSuggestionItemTemplate', this.onSuggestionClick);
        this.renderOutputContent();
        if (this.outputElement) { this.renderSkeleton(); }
    }

    private renderOutputContent(isMethodCall?: boolean): void {
        this.outputElement = this.getElement('outputElement');
        if (this.responseToolbarSettings.items.length === 0) {
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.responseToolbarSettings.items = [
                { iconCss: 'e-icons e-assist-copy', tooltip: 'Copy', cssClass: 'check' },
                { iconCss: 'e-icons e-assist-like', tooltip: 'Like' },
                { iconCss: 'e-icons e-assist-dislike', tooltip: 'Dislike' }
            ];
            this.isProtectedOnChange = prevOnChange;
        }
        if (this.prompts) {
            this.prompts.forEach((prompt: PromptModel, i: number) => {
                this.renderOutputContainer(prompt.prompt, prompt.response, prompt.attachedFiles, i);
            });
        }
        if (this.suggestionsElement && this.content.contains(this.suggestionsElement)) {
            this.content.insertBefore(this.outputElement, this.suggestionsElement);
        }
        else { this.content.appendChild(this.outputElement); }
        if (isMethodCall) { this.aiAssistViewRendered = true; }
    }

    private renderAssistViewFooter(): void {
        const textareaAndIconsWrapper: HTMLElement = this.createElement('div', { attrs: { class: 'e-textarea-icons-wrapper' } });
        if (this.footerTemplate) {
            this.updateContent(this.footerTemplate, this.footer, {}, 'footerTemplate');
        } else {
            this.editableTextarea = this.createElement('div', {
                attrs: {
                    class: 'e-assist-textarea',
                    contenteditable: 'true',
                    placeholder: this.promptPlaceholder,
                    role: 'textbox',
                    'aria-multiline': 'true'
                },
                innerHTML: this.prompt
            });
            const hiddenTextarea: HTMLTextAreaElement = this.createElement('textarea', {
                attrs: {
                    class: 'e-hidden-textarea',
                    name: 'userPrompt',
                    value: this.prompt
                }
            });
            this.appendChildren(textareaAndIconsWrapper, this.editableTextarea, hiddenTextarea);
            this.footer.append(textareaAndIconsWrapper);
        }
        const sendIconClass: string = 'e-assist-send e-icons disabled';
        const clearIconClass: string = 'e-icons e-assist-clear-icon e-assist-clear-icon-hide';
        if (!this.footerTemplate) {
            const footerIconsWrapper: HTMLDivElement = this.createElement('div', { attrs: { class: 'e-footer-icons-wrapper'}});
            this.sendIcon = this.createElement('span', { attrs: { class: sendIconClass, role: 'button', 'aria-label': 'Submit', tabindex: '0', title: this.l10n.getConstant('send') } }) as HTMLElement;
            footerIconsWrapper.appendChild(this.sendIcon);
            if (this.showClearButton) {
                this.renderClearIcon(footerIconsWrapper, clearIconClass);
                this.clearIcon.setAttribute('title', this.l10n.getConstant('clear'));
            }
            this.updateAttachmentElement(footerIconsWrapper);
            textareaAndIconsWrapper.appendChild(footerIconsWrapper);
            this.footer.appendChild(textareaAndIconsWrapper);
            this.footer.classList.add('focus-wave-effect');
            this.refreshTextareaUI();
            this.pushToUndoStack(this.prompt);
        }
    }

    private updateAttachmentElement(footerIconsWrapper: HTMLElement): void {
        if (this.enableAttachments) {
            this.renderAttachmentIcon(footerIconsWrapper);
        }
        else {
            if (this.uploaderObj) {
                this.uploaderObj.destroy();
                this.attachmentIcon.innerHTML = '';
                this.dropArea.innerHTML = '';
                this.attachmentIcon.remove();
                remove(this.dropArea);
            }
        }
    }

    private renderAttachmentIcon(footerIconsWrapper: HTMLElement): void {
        this.dropArea = this.createElement('div', { attrs: { class: 'e-assist-drop-area' } });
        this.footer.prepend(this.dropArea);
        this.attachmentIcon = this.createElement('span', { attrs: { class: 'e-icons e-assist-attachment-icon', role: 'button', 'aria-label': 'Attach file', tabindex: '0', title: this.l10n.getConstant('attachments') } }) as HTMLElement;
        const uploaderElement: HTMLElement = this.createElement('input', { attrs: { class: 'e-assist-file-upload', type: 'file', id: 'fileUpload'} });
        this.uploaderObj = new Uploader({
            asyncSettings: {
                saveUrl: this.attachmentSettings.saveUrl,
                removeUrl: this.attachmentSettings.removeUrl
            },
            maxFileSize: this.attachmentSettings.maxFileSize,
            allowedExtensions: this.attachmentSettings.allowedFileTypes,
            progress: this.onUploadProgress.bind(this),
            success: this.onUploadSuccess.bind(this),
            failure: this.onUploadFailure.bind(this),
            uploading: this.onUploadStart.bind(this),
            actionComplete: this.handleActionComplete.bind(this),
            multiple: false
        });
        this.attachmentIcon.appendChild(uploaderElement);
        this.uploaderObj.appendTo(uploaderElement);
        this.attachmentIcon.addEventListener('click', () => uploaderElement.click());
        footerIconsWrapper.prepend(this.attachmentIcon);
    }

    private handleActionComplete(args: ActionCompleteEventArgs): void {
        const statustext: boolean = args.fileData[0].status === (this.uploaderObj as any).l10n.getConstant('invalidMaxFileSize');
        if (args.fileData[0].statusCode === '0' && statustext) {
            const failureAlert: HTMLElement = this.renderFailureAlert();
            if (this.viewWrapper.contains(this.footer)) {
                this.viewWrapper.insertBefore(failureAlert, this.footer);
            }
            const messageElement: HTMLElement = failureAlert.querySelector('.e-failure-message') as HTMLElement;
            messageElement.textContent = this.l10n.getConstant('fileSizeFailure');

            failureAlert.classList.add('e-show');
            setTimeout(() => {
                this.handleFailureAlertRemove(failureAlert);
            }, 3000);
        }
    }

    private renderFailureAlert(): HTMLElement {
        const alertElement: HTMLElement = this.createElement('div', {
            className: 'e-upload-failure-alert',
            innerHTML: `
                <span class="e-icons e-assist-circle-close" aria-label="Upload failure"></span>
                <div class="e-failure-message">Upload failed</div>
                <span class="e-icons e-assist-clear-icon" role="button" tabindex="0" aria-label="Close"></span>
            `
        });
        EventHandler.add(alertElement, 'click', () => { this.handleFailureAlertRemove(alertElement); }, this );
        return alertElement;
    }

    private handleFailureAlertRemove(alertElement: HTMLElement): void {
        alertElement.classList.remove('e-show');
        EventHandler.remove(alertElement, 'click', this.handleFailureAlertRemove);
        if (this.viewWrapper && this.viewWrapper.contains(alertElement)) {
            this.viewWrapper.removeChild(alertElement);
        }
    }

    private onUploadStart(args: UploadingEventArgs): void {
        this.trigger('beforeAttachmentUpload', args);
        this.uploadedFiles.push(args.fileData);
        const fileItem: HTMLElement = this.createFileItem(args.fileData, true);
        this.dropArea.appendChild(fileItem);

        const progressFill: HTMLElement = this.element.querySelector(`#e-assist-progress-${CSS.escape(args.fileData.name)}`) as HTMLElement;
        if (progressFill) {
            progressFill.style.width = '20%';
        }
    }

    private onUploadProgress(args: any): void {
        const uploadProgress: number = args.e.loaded / args.e.total * 100;
        const progressFill: HTMLElement = this.element.querySelector(`#e-assist-progress-${CSS.escape(args.file.name)}`) as HTMLElement;
        if (progressFill) {
            progressFill.style.width = `${uploadProgress}%`;
        }
    }

    private onUploadSuccess(args: any): void {
        if (args.operation === 'upload') {
            this.trigger('attachmentUploadSuccess', args);
            const progressFill: HTMLElement = this.element.querySelector(`#e-assist-progress-${CSS.escape(args.file.name)}`) as HTMLElement;
            if (progressFill) {
                progressFill.style.width = '100%';
                this.cleanupFileItem(args.file.name);
            }
            this.checkAndActivateSendIcon();
        }
        else if (args.operation === 'remove') {
            this.trigger('attachmentRemoved', args);
        }
    }

    private cleanupFileItem(fileName: string): void {
        const fileItem: HTMLElement = this.element.querySelector(`#e-assist-progress-${CSS.escape(fileName)}`) as HTMLElement;
        if (fileItem) {
            fileItem.parentElement.remove();
        }
    }

    private onUploadFailure(args: any): void {
        this.trigger('attachmentUploadFailure', args);
        this.uploaderObj.remove(args.file);
        this.uploadedFiles = this.uploadedFiles.filter((file: FileInfo) => file.name !== args.file.name);
        const progressFill: HTMLElement = this.element.querySelector(`#e-assist-progress-${CSS.escape(args.file.name)}`) as HTMLElement;
        if (progressFill) {
            progressFill.style.width = '100%';
            progressFill.classList.add('failed');
        }
    }

    private createFileItem(fileData: FileInfo, isForFooter: boolean): HTMLElement {
        const fileItem: HTMLElement = this.createElement('div', { className: 'e-assist-uploaded-file-item' });
        const fileIcon: HTMLElement = this.createElement('div', { className: 'e-icons e-assist-file-format-icon' });
        const fileDetails: HTMLElement = this.createElement('div', { className: 'e-assist-file-details' });
        const fileName: HTMLElement = this.createElement('span', { className: 'e-assist-file-name', innerHTML: fileData.name });
        const fileSize: HTMLElement = this.createElement('span', { className: 'e-assist-file-size', innerHTML: `${(fileData.size / 1024).toFixed(2)} KB` });

        const progressBar: HTMLElement = this.createElement('div', { className: 'e-assist-progress-bar' });
        const progressFill: HTMLElement = this.createElement('div', { id: `e-assist-progress-${fileData.name}`, className: 'e-assist-progress-fill' });

        progressBar.appendChild(progressFill);
        fileDetails.append(fileName, fileSize);
        fileItem.append(fileIcon, fileDetails);
        if (isForFooter) {
            const closeButton: HTMLElement = this.createElement('span', { attrs: { class: 'e-icons e-assist-clear-icon', role: 'button', 'aria-label': 'Clear file', tabindex: '-1' } });
            EventHandler.add(closeButton, 'click', () => this.handleRemoveUploadedFile(closeButton, fileData, fileItem));
            fileItem.append(closeButton);
        }
        fileItem.append(progressBar);
        return fileItem;
    }

    private handleRemoveUploadedFile(closeButton: HTMLElement, fileData: FileInfo, fileItem: HTMLElement): void {
        this.uploaderObj.remove(fileData);
        this.uploadedFiles = this.uploadedFiles.filter((file: FileInfo) => file.name !== fileData.name);
        EventHandler.remove(closeButton, 'click', this.handleRemoveUploadedFile);
        fileItem.remove();
        this.checkAndActivateSendIcon();
    }

    private applyPromptChange(newState: TextState, oldState: TextState, event: KeyboardEvent): void {
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        this.prompt = this.editableTextarea.innerText = newState.content;
        this.isProtectedOnChange = prevOnChange;
        this.refreshTextareaUI();
        this.setCursorPosition(newState.selectionStart, newState.selectionEnd);
        this.triggerPromptChanged(event, oldState.content);
    }
    private handleInput(event: Event): void {
        const textareaEle: HTMLDivElement = event.target as HTMLDivElement;
        const isEmpty: boolean = textareaEle.innerHTML === '<br>';
        if (isEmpty) {
            this.clearBreakTags(textareaEle);
        }
        const textContent: string = textareaEle.innerText;
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        const prevPrompt: string = this.prompt;
        this.prompt = SanitizeHtmlHelper.sanitize(textContent);
        this.isProtectedOnChange = prevOnChange;
        this.refreshTextareaUI();
        this.editableTextarea.focus();
        // Debounced push to undo stack
        this.scheduleUndoPush(textContent);
        this.redoStack = [];
        this.triggerPromptChanged(event, prevPrompt);
    }
    private triggerPromptChanged(event: Event, prevPrompt: string): void {
        const eventArgs: PromptChangedEventArgs = {
            value: this.prompt,
            previousValue: prevPrompt,
            event: event,
            element: (event.currentTarget as HTMLElement)
        };
        this.trigger('promptChanged', eventArgs);
    }

    private footerKeyHandler(e: KeyboardEvent): void {
        this.keyHandler(e, 'footer');
    }

    private stopResponseKeyHandler(e: KeyboardEvent): void {
        this.keyHandler(e, 'stopresponse');
    }

    private wireEvents(): void {
        this.wireFooterEvents(this.footerTemplate);
        if (this.stopResponding) {
            EventHandler.add(this.stopResponding, 'click', this.respondingStopper, this);
            EventHandler.add(this.stopResponding, 'keydown', this.stopResponseKeyHandler, this);
        }
        this.wireClearIconEvents();
    }
    private wireClearIconEvents(): void {
        if (this.clearIcon) {
            EventHandler.add(this.clearIcon, 'click', this.clearIconHandler, this);
        }
    }
    private unWireEvents(): void {
        this.unWireFooterEvents(this.footerTemplate);
        if (this.stopResponding) {
            EventHandler.remove(this.stopResponding, 'click', this.respondingStopper);
            EventHandler.remove(this.stopResponding, 'keydown', this.stopResponseKeyHandler);
        }
        this.unWireClearIconEvents();
        this.detachCodeCopyEventHandler();
    }
    private onFocusEditableTextarea(): void {
        if (this.clearIcon && this.editableTextarea.textContent.length > 0) {
            this.clearIcon.classList.remove('e-assist-clear-icon-hide');
        }
        if (this.footer) {
            this.footer.classList.add('focused');
        }
    }

    private onBlurEditableTextarea(e: FocusEvent): void {
        const relatedTargetEle: HTMLElement = e.relatedTarget as HTMLElement;
        if (!relatedTargetEle) {
            if (this.clearIcon) {
                this.clearIcon.classList.add('e-assist-clear-icon-hide');
            }
            if (this.footer) {
                this.footer.classList.remove('focused');
            }
        }
        else {
            if (this.clearIcon) {
                if (!relatedTargetEle.classList.contains('e-assist-clear-icon')) {
                    this.clearIcon.classList.add('e-assist-clear-icon-hide');
                    if (this.footer) {
                        this.footer.classList.remove('focused');
                    }
                }
            }
            else {
                if (this.footer) {
                    this.footer.classList.remove('focused');
                }
            }
        }
    }
    private unWireClearIconEvents(): void {
        if (this.clearIcon) {
            EventHandler.remove(this.clearIcon, 'click', this.clearIconHandler);
        }
    }
    private detachCodeCopyEventHandler(): void {
        this.preTagElements.forEach(({preTag, handler}: { preTag: HTMLPreElement, handler: Function }) => {
            const copyIcon: HTMLSpanElement = preTag.querySelector('.e-code-copy');
            EventHandler.remove(copyIcon, 'click', handler);
        });
        this.preTagElements = [];
    }

    private keyHandler(event: KeyboardEvent, value: string): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            switch (value) {
            case 'footer':
                this.pushToUndoStack(this.editableTextarea.innerText);
                event.preventDefault();
                if (!this.isResponseRequested) {
                    this.onSendIconClick();
                }
                break;
            case 'stopresponse':
                this.respondingStopper(event);
                break;
            }
        }
        else {
            this.handleUndoRedo(event);
        }
    }

    private clearIconHandler(): void {
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        this.editableTextarea.innerText = this.prompt = '';
        this.isProtectedOnChange = prevOnChange;
        this.refreshTextareaUI();
        this.editableTextarea.focus();
        this.pushToUndoStack(this.prompt);
    }
    private respondingStopper(event: KeyboardEvent | MouseEvent): void {
        this.isOutputRenderingStop = true;
        this.isResponseRequested = false;
        this.lastStreamPrompt = '';
        if (this.outputElement.hasChildNodes) {
            const skeletonElement: HTMLElement = this.element.querySelector('.e-loading-body');
            if (skeletonElement) {
                this.outputElement.removeChild(this.skeletonContainer);
            }
        }
        this.stopResponding.classList.remove('e-btn-active');
        const promptIndex: number = this.prompts ? this.prompts.length - 1 : -1;
        const eventArgs: StopRespondingEventArgs = {
            event: event,
            prompt: promptIndex >= 0 ? this.prompts[parseInt(promptIndex.toString(), 10)].prompt : '',
            dataIndex: this.prompts ? this.prompts.length - 1 : -1
        };
        this.trigger('stopRespondingClick', eventArgs);
        const outputContainer: HTMLDivElement = this.element.querySelector(`#e-response-item_${promptIndex}`);
        if (outputContainer) {
            const outputContentBodyEle: HTMLDivElement = this.element.querySelector(`#e-response-item_${this.prompts.length - 1}`).querySelector('.e-content-body');
            if (outputContentBodyEle) {
                this.renderPreTag(outputContentBodyEle);
            }
        }
    }

    private onSuggestionClick(e: Event): void {
        this.suggestionsElement.hidden = true;
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        this.prompt = (e.target as HTMLElement).innerText;
        this.isProtectedOnChange = prevOnChange;
        this.onSendIconClick();
    }

    private onSendIconClick(): void {
        if (this.isResponseRequested || !(this.prompt.trim() || this.uploadedFiles.length)) {
            return;
        }
        this.isResponseRequested = true;
        this.lastStreamPrompt = '';
        if (this.suggestionsElement) { this.suggestionsElement.hidden = true; }
        this.isOutputRenderingStop = false;
        this.stopResponding.classList.add('e-btn-active');
        this.addPrompt();
        this.createOutputElement();
        const eventArgs: PromptRequestEventArgs = {
            cancel: false,
            responseToolbarItems: this.responseToolbarSettings.items,
            prompt: this.prompt,
            promptSuggestions: this.promptSuggestions,
            attachedFiles: [...this.uploadedFiles]
        };
        this.clearUploadedFiles();
        if (!this.footerTemplate) {
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.prompt = this.editableTextarea.innerText = '';
            this.isProtectedOnChange = prevOnChange;
            this.refreshTextareaUI();
            this.pushToUndoStack(this.prompt);
        }
        this.trigger('promptRequest', eventArgs);
        if (this.contentWrapper) { this.scrollToBottom(); }
    }

    private clearUploadedFiles(): void {
        this.uploadedFiles = [];
        if (this.dropArea) {
            this.dropArea.innerHTML = '';
        }
    }

    private addPrompt(): void {
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        this.prompts = [...this.prompts, { prompt: this.prompt, response: '', isResponseHelpful: null, attachedFiles: this.uploadedFiles }];
        this.isProtectedOnChange = prevOnChange;
    }

    private getContextObject(templateName: string, contentElement: HTMLElement, index?: number, arrayPosition?: number): void {
        let template: string | Function;
        let context: object = { };
        const contextIndex: number = index >= 0 ? index : -1;
        const contextPrompt: string = index >= 0 ? this.prompts[parseInt(contextIndex.toString(), 10)].prompt : '';
        const contextOutput: string = index >= 0 ? this.prompts[parseInt(contextIndex.toString(), 10)].response : '';
        switch (templateName.toLowerCase()) {
        case 'promptitemtemplate': {
            template = this.promptItemTemplate;
            context = {
                prompt: contextPrompt,
                toolbarItems: this.promptToolbarSettings.items,
                index: contextIndex,
                attachedFiles: this.uploadedFiles
            };
            break;
        }
        case 'responseitemtemplate': {
            template = this.responseItemTemplate;
            context = {
                prompt: contextPrompt,
                response: contextOutput,
                index: contextIndex,
                toolbarItems: this.responseToolbarSettings.items
            };
            break;
        }
        case 'customviewtemplate':
        case 'assistviewtemplate': {
            template = this.views[parseInt(arrayPosition.toString(), 10)].viewTemplate || '';
            break;
        }
        }
        this.updateContent(template, contentElement, context, templateName);
    }

    private createOutputElement(): void {
        this.outputSuggestionEle = this.createElement('div', { attrs: { id: `e-prompt-item_${this.prompts.length - 1}`, class: `e-prompt-container ${this.promptItemTemplate ? 'e-prompt-item-template' : ''}` } });
        this.renderPrompt(this.prompt, this.prompts.length - 1, this.uploadedFiles);
        this.outputElement.append(this.outputSuggestionEle, this.skeletonContainer);
        this.skeletonContainer.hidden = false;
    }

    private renderOutputContainer(
        promptText?: string,
        outputText?: string,
        attachedFiles?: FileInfo[],
        index?: number,
        isMethodCall?: boolean,
        isFinalUpdate?: boolean
    ): void {
        const outputContainer: HTMLElement = this.createElement('div', { attrs: { id: `e-response-item_${index}`, class: `e-output-container ${this.responseItemTemplate ? 'e-response-item-template' : ''}` } });
        this.renderOutput(outputContainer, promptText, outputText, attachedFiles, isMethodCall, index, isFinalUpdate);
        if (promptText) {
            this.outputElement.append(this.outputSuggestionEle);
        }
        this.outputElement.append(outputContainer);
        if (this.stopResponding && isFinalUpdate) { this.stopResponding.classList.remove('e-btn-active'); }
        if (!this.isOutputRenderingStop && !this.content.contains(this.suggestionsElement) && this.suggestionsElement) {
            this.content.append(this.suggestionsElement);
        }
    }

    private renderOutput(outputContainer: HTMLElement, promptText?: string, outputText?: string, attachedFiles?: FileInfo[],
                         isMethodCall?: boolean, index?: number, isFinalUpdate?: boolean): void {
        const promptIcon: HTMLElement = this.createElement('span', {
            className: 'e-output-icon e-icons ' + (this.responseIconCss || (this.isAssistView && this.views[0].iconCss) || 'e-assistview-icon' ) });
        const aiOutputEle: HTMLElement = this.createElement('div', { className: 'e-output' });
        if (!this.aiAssistViewRendered || isMethodCall) {
            if (!isNOU(promptText) || (attachedFiles && attachedFiles.length > 0)) {
                this.outputSuggestionEle = this.createElement('div', { attrs: { id: `e-prompt-item_${index}`, class: `e-prompt-container ${this.promptItemTemplate ? 'e-prompt-item-template' : ''}` } });
                this.renderPrompt(promptText, index, attachedFiles);
            }
        }
        const lastPrompt: PromptModel = { prompt: promptText, response: outputText };
        if (lastPrompt.response) {
            if (this.responseItemTemplate) {
                this.getContextObject('responseItemTemplate', aiOutputEle, index);
                if (this.outputElement.querySelector('.e-skeleton')) { this.outputElement.removeChild(this.skeletonContainer); }
                if (this.contentFooterEle) { this.contentFooterEle.classList.remove('e-assist-toolbar-active'); }
                this.renderOutputToolbarItems(index, isFinalUpdate);
                aiOutputEle.append(this.contentFooterEle);
                outputContainer.append(aiOutputEle);
            }
            else {
                this.renderOutputTextContainer(lastPrompt.response, aiOutputEle, index, false, isFinalUpdate);
                outputContainer.append(promptIcon, aiOutputEle);
            }
        }
        else if (this.aiAssistViewRendered) {
            if (this.outputElement.querySelector('.e-skeleton')) {
                this.outputElement.removeChild(this.skeletonContainer);
            }
            if (this.suggestionsElement) { this.suggestionsElement.hidden = false; }
        }
    }

    private renderOutputTextContainer(
        response: string,
        aiOutputEle: HTMLElement,
        index?: number,
        isMethodCall?: boolean,
        isFinalUpdate?: boolean
    ): void {
        if (this.contentFooterEle) { this.contentFooterEle.classList.remove('e-assist-toolbar-active'); }
        this.outputContentBodyEle = this.createElement('div', { attrs: { class: 'e-content-body', tabindex: '0' } });
        if (!isMethodCall) {
            this.outputContentBodyEle.innerHTML = response;
            if (isFinalUpdate) { this.renderPreTag(this.outputContentBodyEle); }
        }
        this.renderOutputToolbarItems(index, isFinalUpdate);
        this.appendChildren(aiOutputEle, this.outputContentBodyEle, this.contentFooterEle);
    }
    private renderPreTag (outputContentEle: HTMLElement): void {
        const preTags: HTMLPreElement[] = Array.from(outputContentEle.querySelectorAll('pre'));
        preTags.forEach((preTag: HTMLPreElement) => {
            const copyIcon: HTMLSpanElement = document.createElement('span');
            copyIcon.className = 'e-icons e-code-copy e-assist-copy';
            preTag.insertBefore(copyIcon, preTag.firstChild);
            this.preTagElements.push({ preTag, handler: this.getCopyHandler(preTag) });
            EventHandler.add(copyIcon, 'click', this.preTagElements[this.preTagElements.length - 1].handler);
        });
    }

    private getCopyHandler (preTag: HTMLPreElement): Function {
        return function(): void {
            const preText: string = preTag.innerText;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).navigator.clipboard.writeText(preText);
            const copyIcon: HTMLSpanElement = preTag.querySelector('.e-code-copy');
            copyIcon.className = 'e-icons e-code-copy e-assist-check';
            setTimeout(() => {
                copyIcon.className = 'e-icons e-code-copy e-assist-copy';
            }, 1000);
        };
    }

    private renderOutputToolbarItems(index?: number, isFinalUpdate?: boolean): void {
        this.contentFooterEle = this.createElement('div', { className: 'e-content-footer e-assist-toolbar-active' });
        const footerContent: HTMLElement = this.createElement('div');
        this.renderResponseToolbar(index);
        if (this.aiAssistViewRendered) {
            if (this.outputElement.querySelector('.e-skeleton')) { this.outputElement.removeChild(this.skeletonContainer); }
            if (isFinalUpdate && this.suggestionsElement) { this.suggestionsElement.hidden = false; }
        }
        this.responseToolbarEle.appendTo(footerContent);
        this.responseToolbarEle.element.setAttribute('aria-label', `response-toolbar-${index}`);
        this.contentFooterEle.appendChild(footerContent);
    }

    private renderResponseToolbar(index?: number): void {
        const pushToolbar: ItemModel[] = this.responseToolbarSettings.items.map((item: ToolbarItemModel) => {
            const toolbarItem: ItemModel = {
                type: item.type,
                visible: item.visible,
                disabled: item.disabled,
                tooltipText: item.tooltip,
                template: item.template,
                prefixIcon: item.iconCss,
                text: item.text,
                cssClass: item.cssClass,
                align: item.align,
                width: this.responseToolbarSettings.width,
                tabIndex: item.tabIndex
            };
            if (toolbarItem.prefixIcon === 'e-icons e-assist-like' && this.prompts[parseInt(index.toString(), 10)].isResponseHelpful) {
                toolbarItem.prefixIcon = 'e-icons e-assist-like-filled';
            } else if (toolbarItem.prefixIcon === 'e-icons e-assist-dislike' && this.prompts[parseInt(index.toString(), 10)].isResponseHelpful === false) {
                toolbarItem.prefixIcon = 'e-icons e-assist-dislike-filled';
            }
            return toolbarItem;
        });
        this.responseToolbarEle = new Toolbar({
            items: pushToolbar,
            clicked: (args: ClickEventArgs) => {
                const eventItemArgs: ToolbarItemModel = {
                    type: args.item.type,
                    text: args.item.text,
                    iconCss: args.item.prefixIcon,
                    cssClass: args.item.cssClass,
                    tooltip: args.item.tooltipText,
                    template: args.item.template as string | Function,
                    disabled: args.item.disabled,
                    visible: args.item.visible,
                    align: args.item.align,
                    tabIndex: args.item.tabIndex
                };
                const eventArgs: ToolbarItemClickedEventArgs = {
                    item: eventItemArgs,
                    event: args.originalEvent,
                    cancel: false,
                    dataIndex: index
                };
                if (this.responseToolbarSettings.itemClicked) {
                    this.responseToolbarSettings.itemClicked.call(this, eventArgs);
                }
                if (!eventArgs.cancel) {
                    this.handleItemClick(args, index);
                }
            }
        });
    }
    private handleItemClick(args: ClickEventArgs, index: number): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (args.item as any).controlParent.element.querySelector('.e-assist-dislike');
        if (args.item.prefixIcon === 'e-icons e-assist-copy') {
            this.getClipBoardContent(this.prompts[parseInt(index.toString(), 10)].response);
            args.item.prefixIcon = 'e-icons e-assist-check';
            this.responseToolbarEle.dataBind();
            setTimeout(() => {
                args.item.prefixIcon = 'e-icons e-assist-copy';
                this.responseToolbarEle.dataBind();
            }, 1000);
        }
        const icon: string = args.item.prefixIcon;
        const isLikeInteracted: boolean = icon === 'e-icons e-assist-like-filled' || icon === 'e-icons e-assist-like';
        const isDislikeInteracted: boolean = icon === 'e-icons e-assist-dislike-filled' || icon === 'e-icons e-assist-dislike';
        if (isLikeInteracted || isDislikeInteracted) {
            let isHelpful: boolean | null = null;
            if (isLikeInteracted) {
                isHelpful = this.prompts[parseInt(index.toString(), 10)].isResponseHelpful === true ? null : true;
            } else if (isDislikeInteracted) {
                isHelpful = this.prompts[parseInt(index.toString(), 10)].isResponseHelpful === false ? null : false;
            }
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.prompts[parseInt(index.toString(), 10)].isResponseHelpful = isHelpful;
            const promptItem: PromptModel = this.prompts[parseInt(index.toString(), 10)];
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const controlParentItems: ItemModel[] = (args.item as any).controlParent.items;
            if (isLikeInteracted) {
                if (promptItem.isResponseHelpful === true) {
                    args.item.prefixIcon = 'e-icons e-assist-like-filled';
                    if (controlParentItems && controlParentItems.length > 2) {
                        controlParentItems[2].prefixIcon = 'e-icons e-assist-dislike';
                    }
                }
                else {
                    args.item.prefixIcon = 'e-icons e-assist-like';
                }
            }
            else if (isDislikeInteracted) {
                if (promptItem.isResponseHelpful === false) {
                    args.item.prefixIcon = 'e-icons e-assist-dislike-filled';
                    if (controlParentItems && controlParentItems.length > 1) {
                        controlParentItems[1].prefixIcon = 'e-icons e-assist-like';
                    }
                }
                else {
                    args.item.prefixIcon = 'e-icons e-assist-dislike';
                }
            }
            this.responseToolbarEle.dataBind();
            this.isProtectedOnChange = prevOnChange;
        }
    }
    private renderPrompt(promptText?: string, promptIndex?: number, attachedFiles?: FileInfo[]): void {
        const outputPrompt: HTMLElement = this.createElement('div', { attrs: { class: 'e-prompt-text', tabindex: '0' } });
        const promptFiles: HTMLElement = this.createElement('div', { attrs: { class: 'e-prompt-uploaded-files' } });
        const promptContent: HTMLElement = this.createElement('div', { className: 'e-prompt-content' });
        const promptDetails: HTMLElement = this.createElement('div', { className: 'e-prompt-details' });
        const promptToolbarContainer: HTMLElement = this.createElement('div', { className: 'e-prompt-toolbar' });
        const promptToolbar: HTMLElement = this.createElement('div');
        const userIcon: HTMLElement = this.createElement('span', { className: this.promptIconCss ? 'e-prompt-icon e-icons '
        + this.promptIconCss : '' });
        if (this.promptItemTemplate) {
            this.getContextObject('promptItemTemplate', this.outputSuggestionEle, promptIndex);
        }
        else {
            outputPrompt.innerHTML = promptText;
            const uploadedFiles: FileInfo[] = attachedFiles || this.uploadedFiles;
            if (uploadedFiles.length > 0)
            {
                uploadedFiles.forEach((file: FileInfo) => {
                    promptFiles.appendChild(this.createFileItem(file, false));
                });
                promptDetails.appendChild(promptFiles);
            }
            if (promptText.length > 0) {
                promptDetails.appendChild(outputPrompt);
            }
            promptContent.appendChild(promptDetails);
            if (this.promptIconCss) {
                promptContent.appendChild(userIcon);
            }
            this.outputSuggestionEle.append(promptContent);
        }
        this.renderPromptToolbar(promptToolbar, promptIndex);
        promptToolbarContainer.append(promptToolbar);
        this.appendChildren(this.outputSuggestionEle, promptToolbarContainer);
    }

    private renderPromptToolbar(element: HTMLElement, promptIndex?: number): void {
        let pushToolbar: ItemModel[] = [];
        if (this.promptToolbarSettings.items.length === 0) {
            pushToolbar = [
                { prefixIcon: 'e-icons e-assist-edit', tooltipText: 'Edit' },
                { prefixIcon: 'e-icons e-assist-copy', tooltipText: 'Copy' }
            ];
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.promptToolbarSettings.items = [
                { iconCss: 'e-icons e-assist-edit', tooltip: 'Edit' },
                { iconCss: 'e-icons e-assist-copy', tooltip: 'Copy' }
            ];
            this.isProtectedOnChange = prevOnChange;
        }
        else {
            pushToolbar = this.promptToolbarSettings.items.map((item: ToolbarItemModel) => ({
                type: item.type,
                template: item.template,
                disabled: item.disabled,
                cssClass: item.cssClass,
                visible: item.visible,
                tooltipText: item.tooltip,
                prefixIcon: item.iconCss,
                text: item.text,
                align: item.align,
                width: this.promptToolbarSettings.width,
                tabIndex: item.tabIndex
            }));
        }
        this.promptToolbarEle = new Toolbar({
            items: pushToolbar,
            clicked: (args: ClickEventArgs) => {
                const eventItemArgs: ToolbarItemModel = {
                    type: args.item.type,
                    text: args.item.text,
                    iconCss: args.item.prefixIcon,
                    cssClass: args.item.cssClass,
                    tooltip: args.item.tooltipText,
                    template: args.item.template as string | Function,
                    disabled: args.item.disabled,
                    visible: args.item.visible,
                    align: args.item.align,
                    tabIndex: args.item.tabIndex
                };
                const eventArgs: ToolbarItemClickedEventArgs = {
                    item: eventItemArgs,
                    event: args.originalEvent,
                    cancel: false,
                    dataIndex: promptIndex
                };
                if (this.promptToolbarSettings.itemClicked) {
                    this.promptToolbarSettings.itemClicked.call(this, eventArgs);
                }
                if (!eventArgs.cancel) {
                    if (args.item.prefixIcon === 'e-icons e-assist-edit') {
                        this.onEditIconClick(promptIndex as number);
                    }
                    if (args.item.prefixIcon === 'e-icons e-assist-copy') {
                        this.getClipBoardContent(this.prompts[parseInt(promptIndex.toString(), 10)].prompt);
                        args.item.prefixIcon = 'e-icons e-assist-check';
                        this.promptToolbarEle.dataBind();
                        setTimeout(() => {
                            args.item.prefixIcon = 'e-icons e-assist-copy';
                            this.promptToolbarEle.dataBind();
                        }, 1000);
                    }
                }
            }
        });
        this.promptToolbarEle.appendTo(element);
        this.promptToolbarEle.element.setAttribute('aria-label', `prompt-toolbar-${promptIndex}`);
    }

    private renderSkeleton(): void {
        this.skeletonContainer = this.createElement('div', { className: 'e-output-container' });
        const outputViewWrapper: HTMLElement = this.createElement('div', {  className: 'e-output', styles : 'width: 70%;'});
        const skeletonIconEle: HTMLElement = this.createElement('span', { className: 'e-output-icon e-skeleton e-skeleton-text e-shimmer-wave' });
        const skeletonBodyEle: HTMLElement = this.createElement('div', { className: 'e-loading-body' });
        const skeletonFooterEle: HTMLElement = this.createElement('div', { className: 'e-loading-footer' });
        const [skeletonLine1, skeletonLine2, skeletonLine3] = [
            this.createElement('div', { className: 'e-skeleton e-skeleton-text e-shimmer-wave' , styles: 'width: 100%; height: 15px;' }),
            this.createElement('div', { className: 'e-skeleton e-skeleton-text e-shimmer-wave' , styles: 'width: 75%; height: 15px;' }),
            this.createElement('div', { className: 'e-skeleton e-skeleton-text e-shimmer-wave' , styles: 'width: 50%; height: 15px;' })
        ];
        const [footerSkeleton] = [
            this.createElement('div', { className: 'e-skeleton e-skeleton-text e-shimmer-wave', styles: 'width: 100%; height: 30px;' })
        ];
        this.appendChildren(skeletonBodyEle, skeletonLine1, skeletonLine2, skeletonLine3);
        skeletonFooterEle.append(footerSkeleton);
        this.appendChildren(outputViewWrapper, skeletonBodyEle, skeletonFooterEle);
        this.appendChildren(this.skeletonContainer, skeletonIconEle, outputViewWrapper);
    }

    private onEditIconClick(promptIndex: number): void {
        if (this.editableTextarea) {
            if (this.suggestionsElement ) { this.suggestionsElement.hidden = true; }
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.editableTextarea.innerText = this.prompt = this.prompts[parseInt(promptIndex.toString(), 10)].prompt;
            this.isProtectedOnChange = prevOnChange;
            this.refreshTextareaUI();
            this.editableTextarea.focus();
            this.setFocusAtEnd(this.editableTextarea);
            this.pushToUndoStack(this.prompt);
            this.redoStack = [];
        }
    }
    private refreshTextareaUI(): void {
        this.updateHiddenTextarea(this.prompt);
        this.checkAndActivateSendIcon();
        this.updateFooterEleClass();
    }

    private checkAndActivateSendIcon(): void {
        const length: number = this.prompt.length > 0 ? this.prompt.length : this.uploadedFiles.length;
        this.activateSendIcon(length);
    }

    private updateIcons(newCss: string, isPromptIconCss: boolean = false): void {
        let elements: NodeListOf<Element>;
        if (this.outputElement) {
            if (isPromptIconCss) {
                newCss = 'e-prompt-icon e-icons ' + newCss;
                elements = this.outputElement.querySelectorAll('.e-prompt-icon');
            }
            else {
                newCss = ' e-output-icon e-icons ' + newCss;
                elements = this.outputElement.querySelectorAll('.e-output-icon');
            }
        }
        for (let index: number = 0; index < (elements && elements.length); index++) {
            removeClass([elements[parseInt(index.toString(), 10)]], elements[parseInt(index.toString(), 10)].classList.toString().trim().split(' '));
            addClass([elements[parseInt(index.toString(), 10)]], newCss.trim().split(' '));
        }
    }

    private updateToolbarSettings(previousToolbar: ToolbarSettingsModel): void {
        const previousToolbarIndex: number = 0;
        for (let index: number = this.views.length; index < this.toolbarItems.length; index++) {
            if (previousToolbar.items[parseInt(previousToolbarIndex.toString(), 10)] === this.toolbarItems[parseInt(index.toString(), 10)])
            {
                this.toolbarItems.splice(index, 1);
            }
        }
        this.updateHeaderToolbar();
        this.toolbar.items = this.toolbarItems;
    }

    private updateResponse(response: string, index: number, isFinalUpdate: boolean, responseItem: HTMLDivElement | null): void {
        if (!this.responseItemTemplate && responseItem) {
            const outputContentBodyEle: HTMLDivElement = responseItem.querySelector('.e-content-body');
            if (outputContentBodyEle) { outputContentBodyEle.innerHTML = response; }
            if (isFinalUpdate && this.suggestionsElement) {
                this.suggestionsElement.hidden = false;
            }
            if (isFinalUpdate) { this.renderPreTag(outputContentBodyEle); }
        }
        else {
            this.renderOutputContainer(undefined, response, undefined, index, false, isFinalUpdate);
        }
    }

    private updateAttachmentSettings(newAttachment: AttachmentSettingsModel): void {
        this.uploaderObj.allowedExtensions = newAttachment.allowedFileTypes;
        this.uploaderObj.maxFileSize = newAttachment.maxFileSize;
        this.uploaderObj.asyncSettings = {
            saveUrl: newAttachment.saveUrl,
            removeUrl: newAttachment.removeUrl
        };
    }

    private updateLocale(): void {
        // Update file upload failure locale
        const failureElement: HTMLElement = this.viewWrapper.querySelector('.e-upload-failure-alert') as HTMLElement;
        if (failureElement) {
            const failureMessageEle: HTMLElement = failureElement.querySelector('.e-failure-message') as HTMLElement;
            this.l10n.setLocale(this.locale);
            failureMessageEle.textContent = this.l10n.getConstant('fileSizeFailure');
        }

        // Update stop responding locale text
        if (this.assistViewTemplateIndex < 0) {
            this.updateStopRespondingTitle();
        }
    }

    public destroy(): void {
        super.destroy();
        this.unWireEvents();
        this.destroyAndNullify(this.responseToolbarEle);
        this.destroyAndNullify(this.promptToolbarEle);
        this.destroyAndNullify(this.toolbar);

        this.destroyAssistView();
        //private html elements nullify
        remove(this.viewWrapper); this.viewWrapper = null;

        this.aiAssistViewRendered = null;
        this.assistViewTemplateIndex = null;
        this.toolbarItems = [];
        this.displayContents = [];
        this.isOutputRenderingStop = null;
        this.isResponseRequested = null;
        this.suggestionHeader = null;
        this.previousElement = null;
        this.assistCustomSection = null;
        this.preTagElements = [];

        // properties nullify
        this.toolbarSettings = this.promptToolbarSettings = this.responseToolbarSettings = {};
        if (this.cssClass) { removeClass([this.element], this.cssClass.split(' ')); }
        this.element.classList.remove('e-rtl');
    }

    private destroyAssistView(): void {
        const properties: string [] = [
            'toolbarHeader',
            'sendIcon',
            'clearIcon',
            'suggestions',
            'skeletonContainer',
            'outputElement',
            'outputSuggestionEle',
            'contentFooterEle',
            'editableTextarea',
            'footer',
            'assistCustomSection',
            'content',
            'stopRespondingContent',
            'stopResponding',
            'contentWrapper'
        ];

        for (const prop of properties) {
            const element: keyof AIAssistView = prop as keyof AIAssistView;
            this.removeAndNullify(this[element as keyof AIAssistView]);
            (this[element as keyof AIAssistView] as HTMLElement) = null;
        }
    }

    /**
     * Executes the specified prompt in the AIAssistView component. The method accepts a string representing the prompt.
     *
     * @param {string} prompt - The prompt text to be executed. It must be a non-empty string.
     *
     * @returns {void}
     */
    public executePrompt(prompt: string): void {
        if (!isNOU(prompt) && prompt.trim().length > 0) {
            const prevOnChange: boolean = this.isProtectedOnChange;
            this.isProtectedOnChange = true;
            this.prompt = prompt;
            this.isProtectedOnChange = prevOnChange;
            this.onSendIconClick();
        }
    }

    /**
     * Adds a response to the last prompt or appends a new prompt data in the AIAssistView component.
     *
     * @param {string | Object} outputResponse - The response to be added. Can be a string representing the response or an object containing both the prompt and the response.
     * - If `outputResponse` is a string, it updates the response for the last prompt in the prompts collection.
     * - If `outputResponse` is an object, it can either update the response of an existing prompt if the prompt matches or append a new prompt data.
     * @param {boolean} isFinalUpdate - Indicates whether this response is the final one, to hide the stop response button.
     * @returns {void}
     */
    public addPromptResponse(
        outputResponse: string | Object,
        isFinalUpdate: boolean = true
    ): void {
        const prevOnChange: boolean = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        if (!this.isOutputRenderingStop) {
            const responseItem: HTMLDivElement = this.element.querySelector(`#e-response-item_${this.prompts.length - 1}`);
            let lastPrompt: PromptModel = this.prompts[this.prompts.length - 1];
            if (typeof outputResponse === 'string') {
                if (!this.isResponseRequested) {
                    this.prompts = [...this.prompts, { prompt: null, response: null, isResponseHelpful: null, attachedFiles: null}];
                    lastPrompt = this.prompts[this.prompts.length - 1];
                }
                lastPrompt.response = outputResponse;
                this.updateResponse(lastPrompt.response, this.prompts.length - 1, isFinalUpdate, responseItem);
            }
            if (typeof outputResponse === 'object') {
                const tPrompt: PromptModel = {
                    prompt: (<{ prompt: string }>outputResponse).prompt,
                    attachedFiles: (<{ attachedFiles: FileInfo[] }>outputResponse).attachedFiles,
                    response: (<{ response: string }>outputResponse).response,
                    isResponseHelpful: isNOU((<{ isResponseHelpful: boolean }>outputResponse).isResponseHelpful) ? null :
                        (<{ isResponseHelpful: boolean }>outputResponse).isResponseHelpful
                };
                if (this.prompt === tPrompt.prompt || this.lastStreamPrompt === tPrompt.prompt) {
                    lastPrompt.response = tPrompt.response;
                    lastPrompt.attachedFiles = tPrompt.attachedFiles;
                    lastPrompt.isResponseHelpful = tPrompt.isResponseHelpful;
                    this.updateResponse(lastPrompt.response, this.prompts.length - 1, isFinalUpdate, responseItem);
                } else {
                    this.prompts = [...this.prompts, tPrompt];
                    this.renderOutputContainer(tPrompt.prompt, tPrompt.response, tPrompt.attachedFiles,
                                               this.prompts.length - 1, true, isFinalUpdate);
                }
                if (!isFinalUpdate) {
                    this.lastStreamPrompt = tPrompt.prompt;
                }
            }
            if (isFinalUpdate && this.stopResponding) {
                this.stopResponding.classList.remove('e-btn-active');
            }
            this.isResponseRequested = !isFinalUpdate;
        }
        this.isProtectedOnChange = prevOnChange;
    }

    /**
     * Scrolls the view to the bottom to display the most recent response in the AIAssistView component.
     * This method programmatically scrolls the view to the bottom,
     * typically used when new responses are added or to refocus on the latest response.
     *
     * @returns {void}
     */
    public scrollToBottom(): void {
        this.updateScroll(this.contentWrapper);
    }

    /**
     * Called if any of the property value is changed.
     *
     * @param  {AIAssistViewModel} newProp - Specifies new properties
     * @param  {AIAssistViewModel} oldProp - Specifies old properties
     * @returns {void}
     * @private
     */
    public onPropertyChanged(newProp: AIAssistViewModel, oldProp?: AIAssistViewModel): void {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
            case 'width':
            case 'height':
                this.setDimension(this.element, this.width, this.height);
                break;
            case 'cssClass':
                this.updateCssClass(this.element, newProp.cssClass, oldProp.cssClass);
                break;
            case 'promptIconCss':
                this.updateIcons(newProp.promptIconCss, true);
                break;
            case 'responseIconCss':
                this.updateIcons(newProp.responseIconCss);
                break;
            case 'showHeader':
                this.updateHeader(this.showHeader, this.toolbarHeader, this.viewWrapper);
                break;
            case 'promptSuggestions':
                if (this.suggestionsElement) { this.suggestionsElement.remove(); }
                if (!this.isOutputRenderingStop) {
                    this.renderSuggestions(this.promptSuggestions, this.promptSuggestionsHeader, this.promptSuggestionItemTemplate,
                                           'promptSuggestion', 'promptSuggestionItemTemplate', this.onSuggestionClick);
                }
                break;
            case 'showClearButton':
                if (this.footerTemplate) { return; }
                else {
                    if (this.clearIcon) {
                        this.unWireClearIconEvents();
                        remove(this.clearIcon); this.clearIcon = null;
                    }
                    else {
                        const footerIconsWrapper: HTMLDivElement = this.footer.querySelector('.e-footer-icons-wrapper');
                        this.renderClearIcon(footerIconsWrapper, 'e-icons e-assist-clear-icon e-assist-clear-icon-hide');
                        this.clearIcon.setAttribute('title', this.l10n.getConstant('clear'));
                        this.updateFooterEleClass();
                        this.wireClearIconEvents();
                    }
                }
                break;
            case 'promptPlaceholder':
                this.updatePlaceholder(this.promptPlaceholder);
                break;
            case 'promptSuggestionsHeader': {
                this.suggestionHeader.innerHTML = this.promptSuggestionsHeader;
                const suggestionHeaderElem: HTMLElement = this.element.querySelector('.e-suggestions .e-suggestion-header');
                if (!suggestionHeaderElem) { this.suggestionsElement.append(this.suggestionHeader); }
                break;
            }
            case 'activeView': {
                const previousViewIndex: number = this.getIndex(oldProp.activeView);
                this.updateActiveView(previousViewIndex);
                break;
            }
            case 'enableRtl':
                this.element.classList[this.enableRtl ? 'add' : 'remove']('e-rtl');
                if (!isNOU(this.toolbar)) {
                    this.toolbar.enableRtl = this.enableRtl;
                    this.toolbar.dataBind();
                }
                break;
            case 'toolbarSettings':
                this.updateToolbarSettings(oldProp.toolbarSettings);
                break;
            case 'promptToolbarSettings':
            case 'responseToolbarSettings':
            case 'prompts':
                this.isOutputRenderingStop = false;
                if (this.outputElement) { remove(this.outputElement); }
                if (this.stopResponding) { this.stopResponding.classList.remove('e-btn-active'); }
                this.aiAssistViewRendered = false;
                this.renderOutputContent(true);
                this.detachCodeCopyEventHandler();
                break;
            case 'prompt':
                if (!this.footerTemplate) {
                    this.editableTextarea.innerText = this.prompt;
                    this.refreshTextareaUI();
                    this.pushToUndoStack(this.prompt);
                }
                break;
            case 'locale':
                this.updateLocale();
                break;
            case 'enableAttachments': {
                if (!this.footerTemplate) {
                    const footerIconsWrapper: HTMLDivElement = this.element.querySelector('.e-footer-icons-wrapper');
                    this.updateAttachmentElement(footerIconsWrapper);
                }
                break;
            }
            case 'attachmentSettings':
                this.updateAttachmentSettings(newProp.attachmentSettings);
            }
        }
    }
}

