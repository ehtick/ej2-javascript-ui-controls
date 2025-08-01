/**
 * Query Builder Source
 */
import { Component, INotifyPropertyChanged, ModuleDeclaration } from '@syncfusion/ej2-base';
import { ChildProperty } from '@syncfusion/ej2-base';
import { QueryBuilderModel, ShowButtonsModel, ColumnsModel, RuleModel, ValueModel } from './query-builder-model';
import { RadioButtonModel } from '@syncfusion/ej2-buttons';
import { DropDownTreeModel } from '@syncfusion/ej2-dropdowns';
import { MultiSelectModel, DropDownListModel } from '@syncfusion/ej2-dropdowns';
import { EmitType, BaseEventArgs } from '@syncfusion/ej2-base';
import { Query, Predicate, DataManager } from '@syncfusion/ej2-data';
import { TextBoxModel, NumericTextBoxModel } from '@syncfusion/ej2-inputs';
import { DatePickerModel } from '@syncfusion/ej2-calendars';
/**
 * Defines the Columns of Query Builder
 */
export declare class Columns extends ChildProperty<Columns> {
    /**
     * Specifies the fields in columns.
     *
     * @default null
     */
    field: string;
    /**
     * Specifies the labels name in columns.
     *
     * @default null
     */
    label: string;
    /**
     * Specifies the types in columns field.
     *
     * @default null
     */
    type: string;
    /**
     * Specifies the values in columns or bind the values from sub controls.
     *
     * @default null
     */
    values: string[] | number[] | boolean[];
    /**
     * Specifies the operators in columns.
     *
     * @default null
     */
    operators: {
        [key: string]: Object;
    }[];
    /**
     * Specifies the rule template for the field with any other widgets.
     *
     * @default null
     * @aspType string
     */
    ruleTemplate: string | Function;
    /**
     * Specifies the template for value field such as slider or any other widgets.
     *
     * @default null
     */
    template: TemplateColumn | string | Function;
    /**
     * Specifies the validation for columns (text, number and date).
     *
     * @default  { isRequired: true , min: 0, max: Number.MAX_VALUE }
     */
    validation: Validation;
    /**
     * Specifies the date format for columns.
     *
     * @aspType string
     * @blazorType string
     * @default null
     */
    format: string | FormatObject;
    /**
     * Specifies the step value(numeric textbox) for columns.
     *
     * @default null
     */
    step: number;
    /**
     * Specifies the default value for columns.
     *
     * @default null
     */
    value: string[] | number[] | string | number | boolean | Date;
    /**
     * Specifies the category for columns.
     *
     * @default null
     */
    category: string;
    /**
     * Specifies the sub fields in columns.
     *
     * @default null
     */
    columns: ColumnsModel[];
}
/**
 * Defines the rule of Query Builder
 */
export declare class Rule extends ChildProperty<Rule> {
    /**
     * Specifies the condition value in group.
     *
     * @default null
     */
    condition: string;
    /**
     * Specifies the rules in group.
     *
     * @default []
     */
    rules: RuleModel[];
    /**
     * Specifies the field value in group.
     *
     * @default null
     */
    field: string;
    /**
     * Specifies the label value in group.
     *
     * @default null
     */
    label: string;
    /**
     * Specifies the type value in group.
     *
     * @default null
     */
    type: string;
    /**
     * Specifies the operator value in group.
     *
     * @default null
     */
    operator: string;
    /**
     * Specifies the sub controls value in group.
     *
     * @default null
     */
    value: string[] | number[] | string | number | boolean;
    /**
     * Specifies whether not condition is true/false.
     *
     * @default false
     */
    not: boolean;
    /**
     * Specifies whether rule is locked or not.
     *
     * @aspType bool?
     * @default null
     */
    isLocked: boolean;
}
/**
 * Defines the property for value.
 */
export declare class Value extends ChildProperty<Value> {
    /**
     * Specifies the property for NumericTextBox value.
     *
     * @default null
     */
    numericTextBoxModel: NumericTextBoxModel;
    /**
     * Specifies the property for MultiSelect value.
     *
     * @default null
     */
    multiSelectModel: MultiSelectModel;
    /**
     *  Specifies the property for DatePicker value.
     *
     * @default null
     */
    datePickerModel: DatePickerModel;
    /**
     *  Specifies the TextBox value.
     *
     * @default null
     */
    textBoxModel: TextBoxModel;
    /**
     * Specifies the RadioButton value.
     *
     * @default null
     */
    radioButtonModel: RadioButtonModel;
}
/**
 * Defines the ruleDelete, groupInsert, and groupDelete options of Query Builder.
 */
export declare class ShowButtons extends ChildProperty<ShowButtons> {
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     *
     * @default false
     */
    cloneRule: boolean;
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     *
     * @default false
     */
    cloneGroup: boolean;
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     *
     * @default false
     */
    lockRule: boolean;
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     *
     * @default false
     */
    lockGroup: boolean;
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     *
     * @default true
     */
    ruleDelete: boolean;
    /**
     * Specifies the boolean value in groupInsert that the enable/disable the buttons in group.
     *
     * @default true
     */
    groupInsert: boolean;
    /**
     * Specifies the boolean value in groupDelete that the enable/disable the buttons in group.
     *
     * @default true
     */
    groupDelete: boolean;
}
export interface FormatObject {
    /**
     * Specifies the format in which the date format will process
     */
    skeleton?: string;
}
/**
 * Defines the fieldMode of Dropdown control.
 * ```props
 * Default :- To Specifies the fieldMode as DropDownList.
 * DropdownTree :- To Specifies the fieldMode as DropdownTree.
 * ```
 */
export declare type FieldMode = 
/** Display the DropdownList */
'Default' | 
/** Display the DropdownTree */
'DropdownTree';
/**
 * Defines the display mode of the control.
 * ```props
 * Horizontal :- To display the control in a horizontal UI.
 * Vertical :- To display the control in a vertical UI.
 * ```
 */
export declare type DisplayMode = 
/**  Display the Horizontal UI */
'Horizontal' | 
/**  Display the Vertical UI */
'Vertical';
/**
 * Defines the sorting direction of the field names in a control.
 * ```props
 * Default :- Specifies the field names in default sorting order.
 * Ascending :- Specifies the field names in ascending order.
 * Descending :- Specifies the field names in descending order.
 * ```
 */
export declare type SortDirection = 
/**  Show the field names in default */
'Default' | 
/**  Show the field names in Ascending */
'Ascending' | 
/**  Show the field names in Descending */
'Descending';
export declare class QueryBuilder extends Component<HTMLDivElement> implements INotifyPropertyChanged {
    private groupIdCounter;
    private ruleIdCounter;
    private subFilterCounter;
    private btnGroupId;
    private levelColl;
    private isImportRules;
    private isPublic;
    private parser;
    private defaultLocale;
    private l10n;
    private intl;
    private items;
    private customOperators;
    private operators;
    private sqlOperators;
    private ruleElem;
    private groupElem;
    private dataColl;
    private dataManager;
    private selectedColumn;
    private previousColumn;
    private actionButton;
    private isInitialLoad;
    private timer;
    private isReadonly;
    private fields;
    private columnTemplateFn;
    private target;
    private updatedRule;
    private ruleTemplateFn;
    private isLocale;
    private isRefreshed;
    private headerFn;
    private subFieldElem;
    private selectedRule;
    private isNotified;
    private isAddSuccess;
    private isNotValueChange;
    private isRoot;
    private prevItemData;
    private isFieldChange;
    private isFieldClose;
    private isDestroy;
    private isGetNestedData;
    private isCustomOprCols;
    private dummyDropdownTreeDs;
    private groupCounter;
    private lockItems;
    private groupIndex;
    private ruleIndex;
    private isLastGroup;
    private cloneGrpBtnClick;
    private isMiddleGroup;
    private cloneRuleBtnClick;
    private isNumInput;
    private draggable;
    private draggedRule;
    private dragElement;
    private prvtEvtTgrDaD;
    private isDragEventPrevent;
    private isValueEmpty;
    private isPropChange;
    private ddTree;
    /**
     * Triggers when the component is created.
     *
     * @event created
     * @blazorProperty 'Created'
     */
    created: EmitType<Event>;
    /**
     * Triggers when field, operator, value is change.
     *
     * @event actionBegin
     * @blazorProperty 'OnActionBegin'
     */
    actionBegin: EmitType<ActionEventArgs>;
    /**
     * Triggers before the condition (And/Or), field, operator, value is changed.
     *
     * @event beforeChange
     * @blazorProperty 'OnValueChange'
     */
    beforeChange: EmitType<ChangeEventArgs>;
    /**
     * Triggers when changing the condition(AND/OR), field, value, operator is changed.
     *
     * @event change
     * @blazorProperty 'Changed'
     */
    change: EmitType<ChangeEventArgs>;
    /**
     * Triggers when dataBound to the Query Builder.
     *
     * @event dataBound
     * @blazorProperty 'dataBound'
     */
    dataBound: EmitType<Object>;
    /**
     * Triggers when changing the condition(AND/OR), field, value, operator is changed
     *
     * @event ruleChange
     * @blazorProperty 'RuleChanged'
     */
    ruleChange: EmitType<RuleChangeEventArgs>;
    /**
     * Triggers when rule/ group dragging starts.
     *
     *
     */
    dragStart: EmitType<DragEventArgs>;
    /**
     * Triggers when rule/ group are dragged (moved) continuously.
     *
     *
     */
    drag: EmitType<DragEventArgs>;
    /**
     * Triggers when rule/ group are dropped on to the target rule/ group.
     *
     *
     */
    drop: EmitType<DropEventArgs>;
    /**
     * Specifies the showButtons settings of the query builder component.
     * The showButtons can be enable Enables or disables the ruleDelete, groupInsert, and groupDelete buttons.
     *
     * @default { ruleDelete: true , groupInsert: true, groupDelete: true }
     */
    showButtons: ShowButtonsModel;
    /**
     * Shows or hides the filtered query.
     *
     * @default false
     */
    summaryView: boolean;
    /**
     * Enables or disables the validation.
     *
     * @default false
     */
    allowValidation: boolean;
    /**
     * Specifies the fieldMode as DropDownList or DropDownTree.
     *
     * @default 'Default'
     */
    fieldMode: FieldMode;
    /**
     * Specifies columns to create filters.
     *
     * @default {}
     */
    columns: ColumnsModel[];
    /**
     * Specifies the property for field.
     *
     *  @default null
     */
    fieldModel: DropDownListModel | DropDownTreeModel;
    /**
     * Specifies the property for operator.
     *
     *  @default null
     */
    operatorModel: DropDownListModel;
    /**
     * Specifies the property for value.
     *
     * @default null
     */
    valueModel: ValueModel;
    /**
     * Specifies the template for the header with any other widgets.
     *
     * @default null
     * @aspType string
     */
    headerTemplate: string | Function;
    /**
     * Defines class or multiple classes, which are separated by a space in the QueryBuilder element.
     * You can add custom styles to the QueryBuilder using the cssClass property.
     *
     * @default ''
     */
    cssClass: string;
    /**
     * Binds the column name from data source in query-builder.
     * The `dataSource` is an array of JavaScript objects.
     *
     * @default []
     */
    dataSource: Object[] | Object | DataManager;
    /**
     * Specifies the displayMode as Horizontal or Vertical.
     *
     * @default 'Horizontal'
     */
    displayMode: DisplayMode;
    /**
     * Enable or disable persisting component's state between page reloads.
     * If enabled, filter states will be persisted.
     *
     * @default false.
     */
    enablePersistence: boolean;
    /**
     * Specifies the sort direction of the field names.
     *
     * @default 'Default'
     */
    sortDirection: SortDirection;
    /**
     * Specifies the maximum group count or restricts the group count.
     *
     * @default 5
     */
    maxGroupCount: number;
    /**
     * Specifies the height of the query builder.
     *
     * @default 'auto'
     */
    height: string;
    /**
     * Specifies the width of the query builder.
     *
     * @default 'auto'
     */
    width: string;
    /**
     * If match case is set to true, the grid filters the records with exact match.
     * if false, it filters case insensitive records (uppercase and lowercase letters treated the same).
     *
     * @default false
     */
    matchCase: boolean;
    /**
     * If immediateModeDelay is set by particular number, the rule Change event is triggered after that period.
     *
     * @default 0
     */
    immediateModeDelay: number;
    /**
     * Enables/Disables the not group condition in query builder.
     *
     * @default false
     */
    enableNotCondition: boolean;
    /**
     * When set to true, the user interactions on the component are disabled.
     *
     * @default false
     */
    readonly: boolean;
    /**
     * Specifies a boolean value whether enable / disable the new rule adding while adding new groups.
     *
     * @remarks
     * If this property is true, the empty rule is inserted while inserting new group.
     * If set to false, the group is inserted without any rule.
     * @default true
     */
    addRuleToNewGroups: boolean;
    /**
     * Specifies a boolean value whether enable / disable the auto selection with the first value for the field.
     *
     * @remarks
     * If this property is true, the field dropdown list will render with the first value of the dropdown list.
     * If set to false, the dropdown list render with placeholder.
     * @default false
     */
    autoSelectField: boolean;
    /**
     * Specifies a boolean value whether enable / disable the auto selection with the first value for the operator.
     *
     * @remarks
     * If this property is true, the operator dropdown list will render with the first value of the dropdown list.
     * If set to false, the dropdown list render with placeholder.
     * @default true
     */
    autoSelectOperator: boolean;
    /**
     * Specifies the separator string for column.
     *
     * @default ''
     */
    separator: string;
    /**
     * Specifies whether to enable separate connectors between rules/groups.
     *
     * @remarks
     * When this property is set to true, each rule/group will have its own connector, allowing them to be connected independently with different connectors.
     * When set to false, will result in connectors being shared between rules/groups, possibly connecting them with the same connector.
     *
     * @default false
     *
     */
    enableSeparateConnector: boolean;
    /**
     * Defines rules in the QueryBuilder.
     * Specifies the initial rule, which is JSON data.
     *
     * @default {}
     */
    rule: RuleModel;
    /**
     * Specifies a boolean value whether to enable / disable the drag and drop support to move the rules/ groups.
     *
     * @remarks
     * If this property is true, the drag handle will be rendered in front of the rule/ group element to perform, drag and drop.
     * If set to false, the drag handle element is not rendered.
     * @default false
     */
    allowDragAndDrop: boolean;
    constructor(options?: QueryBuilderModel, element?: string | HTMLDivElement);
    protected getPersistData(): string;
    /**
     * Clears the rules without root rule.
     *
     * @returns {void}.
     */
    reset(): void;
    private getWrapper;
    protected getModuleName(): string;
    requiredModules(): ModuleDeclaration[];
    private GetRootColumnName;
    private initialize;
    private updateSubFieldsFromColumns;
    private updateSubFields;
    private updateCustomOperator;
    private focusEventHandler;
    private clickEventHandler;
    private beforeSuccessCallBack;
    private selectBtn;
    private appendRuleElem;
    private addRuleElement;
    private addRuleSuccessCallBack;
    private dropdownTreeFiltering;
    private changeDataSource;
    private nestedChildFilter;
    private isMatchedNode;
    private dropdownTreeClose;
    private updateDropdowntreeDS;
    private updateAddedRule;
    private changeRuleTemplate;
    private renderToolTip;
    /**
     * Validate the conditions and it display errors for invalid fields.
     *
     * @returns {boolean} - Validation
     */
    validateFields(): boolean;
    private refreshLevelColl;
    private refreshLevel;
    private groupTemplate;
    private ruleTemplate;
    private addGroupElement;
    private addGroupSuccess;
    private setMultiConnector;
    private addHeaderDiv;
    private headerTemplateFn;
    private enableSeparateConnectorInitialRule;
    /**
     * Notify the changes to component.
     *
     * @param {string | number | boolean | Date | string[] | number[] | Date[]} value - 'value' to be passed to update the rule value.
     * @param {Element} element - 'element' to be passed to update the rule.
     * @param {string} type - 'type' to be passed to update the rule .
     * @returns {void}.
     */
    notifyChange(value: string | number | boolean | Date | string[] | number[] | Date[], element: Element, type?: string): void;
    private templateChange;
    private changeValue;
    private filterValue;
    private changeValueSuccessCallBack;
    private fieldClose;
    private changeField;
    private changeRule;
    private changeFilter;
    private changeOperator;
    private fieldChangeSuccess;
    private destroySubFields;
    private createSubFields;
    private operatorChangeSuccess;
    private changeRuleValues;
    private popupOpen;
    private destroyControls;
    private templateDestroy;
    /**
     * Return values bound to the column.
     *
     * @param {string} field - 'field' to be passed to get the field values.
     * @returns {object[]} - Values bound to the column
     */
    getValues(field: string): object[];
    private createNestedObject;
    private getDistinctValues;
    private renderMultiSelect;
    private multiSelectOpen;
    private bindMultiSelectData;
    private getMultiSelectData;
    private createSpinner;
    private closePopup;
    private processTemplate;
    private getItemData;
    private setDefaultValue;
    private renderStringValue;
    private renderNumberValue;
    private processValueString;
    private parseDate;
    private renderControls;
    private processBoolValues;
    private getOperatorIndex;
    private getPreviousItemData;
    private renderValues;
    private setColumnTemplate;
    private actionBeginSuccessCallBack;
    private updateValues;
    private updateRules;
    private filterRules;
    private ruleValueUpdate;
    private validateValue;
    private getFormat;
    private findGroupByIdx;
    /**
     * Removes the component from the DOM and detaches all its related event handlers.
     * Also it maintains the initial input element from the DOM.
     *
     * @method destroy
     * @returns {void}
     */
    destroy(): void;
    /**
     * Adds single or multiple rules.
     *
     * @param {RuleModel[]} rule - 'rule collection' to be passed to add the rules.
     * @param {string} groupID - 'group id' to be passed to add the rule in groups.
     * @returns {void}.
     */
    addRules(rule: RuleModel[], groupID: string): void;
    /**
     * Adds single or multiple groups, which contains the collection of rules.
     *
     * @param {RuleModel[]} groups - 'group collection' to be passed to add the groups.
     * @param {string} groupID - 'group id' to be passed to add the groups.
     * @returns {void}.
     */
    addGroups(groups: RuleModel[], groupID: string): void;
    private initWrapper;
    private renderSummary;
    private renderSummaryCollapse;
    private columnSort;
    private onChangeNotGroup;
    private notGroupRtl;
    private checkNotGroup;
    onPropertyChanged(newProp: QueryBuilderModel, oldProp: QueryBuilderModel): void;
    protected preRender(): void;
    protected render(): void;
    private initializeDrag;
    private helper;
    private dragStartHandler;
    private dragHandler;
    private dragStopHandler;
    private templateParser;
    private executeDataManager;
    private initControl;
    protected wireEvents(): void;
    protected unWireEvents(): void;
    private getParentGroup;
    /**
     * Delete the Group
     *
     * @param {Element | string} target - 'target' to be passed to delete the group.
     * @returns {void}
     */
    deleteGroup(target: Element | string): void;
    private deleteGroupSuccessCallBack;
    private isPlatformTemplate;
    private deleteRule;
    private deleteRuleSuccessCallBack;
    private setGroupRules;
    private keyBoardHandler;
    private windowResizeHandler;
    private clearQBTemplate;
    private disableRuleCondition;
    /**
     * Get the valid rule or rules collection.
     *
     * @param {RuleModel} currentRule - 'currentRule' to be passed to get the valid rules.
     * @returns {RuleModel} - Valid rule or rules collection
     */
    getValidRules(currentRule?: RuleModel): RuleModel;
    private getRuleCollection;
    /**
     * Set the rule or rules collection.
     *
     * @param {RuleModel} rule - 'rule' to be passed to set rules.
     * @returns {void}.
     */
    setRules(rule: RuleModel): void;
    /**
     * Gets the rule or rule collection.
     *
     * @returns {object} - Rule or rule collection
     */
    getRules(): RuleModel;
    /**
     * Gets the rule.
     *
     * @param {string | HTMLElement} elem - 'elem' to be passed to get rule.
     * @returns {object} - Rule
     */
    getRule(elem: string | HTMLElement): RuleModel;
    /**
     * Gets the group.
     *
     * @param {string | Element} target - 'target' to be passed to get group.
     * @returns {object} -Group
     */
    getGroup(target: Element | string): RuleModel;
    /**
     * Deletes the group or groups based on the group ID.
     *
     * @param {string[]} groupIdColl - 'groupIdColl' to be passed to delete groups.
     * @returns {void}
     */
    deleteGroups(groupIdColl: string[]): void;
    /**
     * Return the Query from current rules collection.
     *
     * @returns {Promise} - Query from current rules collection
     * @blazorType object
     */
    getFilteredRecords(): Promise<Object> | object;
    /**
     * Deletes the rule or rules based on the rule ID.
     *
     * @param {string[]} ruleIdColl - 'ruleIdColl' to be passed to delete rules.
     * @returns {void}.
     */
    deleteRules(ruleIdColl: string[]): void;
    /**
     * Gets the query for Data Manager.
     *
     * @param {RuleModel} rule - 'rule' to be passed to get query.
     * @returns {string} - Query for Data Manager
     */
    getDataManagerQuery(rule: RuleModel): Query;
    /**
     * Get the predicate from collection of rules.
     *
     * @param {RuleModel} rule - 'rule' to be passed to get predicate.
     * @returns {Predicate} - Predicate from collection of rules
     */
    getPredicate(rule: RuleModel): Predicate;
    private getLocale;
    private getColumn;
    /**
     * Return the operator bound to the column.
     *
     * @returns {[key: string]: Object}[] - Operator bound to the column
     */
    getOperators(field: string): {
        [key: string]: Object;
    }[];
    private setTime;
    private datePredicate;
    private arrayPredicate;
    private getDate;
    private isTime;
    private importRules;
    private renderGroup;
    private renderRule;
    private enableReadonly;
    private enableBtnGroup;
    private isDateFunction;
    private getSqlString;
    /**
     * Sets the rules from the sql query.
     *
     * @param {string} sqlString - 'sql String' to be passed to set the rule.
     * @param {boolean} sqlLocale - Optional. Set `true` if Localization for Sql query.
     * @returns {void}
     */
    setRulesFromSql(sqlString: string, sqlLocale?: boolean): void;
    /**
     * Get the rules from SQL query.
     *
     * @param {string} sqlString - 'sql String' to be passed to get the rule.
     * @param {boolean} sqlLocale - Set `true` if Localization for Sql query.
     * @returns {object} - Rules from SQL query
     */
    getRulesFromSql(sqlString: string, sqlLocale?: boolean): RuleModel;
    /**
     * Gets the sql query from rules.
     *
     * @param {RuleModel} rule - 'rule' to be passed to get the sql.
     * @param {boolean} allowEscape - Set `true` if it exclude the escape character.
     * @param {boolean} sqlLocale - Set `true` if Localization for Sql query.
     * @returns {string} - Sql query from rules.
     */
    getSqlFromRules(rule?: RuleModel, allowEscape?: boolean, sqlLocale?: boolean): string;
    /**
     * Gets the parameter SQL query from rules.
     *
     * @param {RuleModel} rule – Specify the rule to be passed to get the parameter sql string.
     * @returns {ParameterizedSql} – Parameterized SQL query from rules.
     */
    getParameterizedSql(rule?: RuleModel): ParameterizedSql;
    /**
     * Sets the rules from the parameter sql query.
     *
     * @param { ParameterizedSql} sqlQuery – Specifies the parameter SQL to be passed to set the rule and load it to the query builder.
     * @returns {void}
     */
    setParameterizedSql(sqlQuery: ParameterizedSql): void;
    /**
     * Gets the named parameter SQL query from rules.
     *
     * @param {RuleModel} rule – Specify the rule to be passed to get the named parameter SQL string.
     * @returns {ParameterizedNamedSql} – Parameterized Named SQL query from rules.
     */
    getParameterizedNamedSql(rule?: RuleModel): ParameterizedNamedSql;
    /**
     * Sets the rules from the named parameter SQL query.
     *
     * @param { ParameterizedNamedSql } sqlQuery – Specifies the named parameter SQL to be passed to set the rule and load it to the query builder.
     * @returns {void}
     */
    setParameterizedNamedSql(sqlQuery: ParameterizedNamedSql): void;
    /**
     * Set the rules from Mongo query.
     *
     * @param {string} mongoQuery - 'sql String' to be passed to get the rule.
     * @param {boolean} mongoLocale - Set `true` if Localization for Mongo query.
     * @returns {void}
     */
    setMongoQuery(mongoQuery: string, mongoLocale?: boolean): void;
    /**
     * Gets the Mongo query from rules.
     *
     * @param {RuleModel} rule - 'rule' to be passed to get the sql.
     * @returns {object} - Sql query from rules.
     */
    getMongoQuery(rule?: RuleModel): string;
    /**
     * Clones the rule based on the rule ID to the specific group.
     *
     * @param {string} ruleID - Specifies the ruleID that needs to be cloned.
     * @param {string} groupID - Specifies the groupID in which the rule to be cloned.
     * @param {number} index - Specifies the index to insert the cloned rule inside the group.
     * @returns {void}
     */
    cloneRule(ruleID: string, groupID: string, index: number): void;
    /**
     * Clones the group based on the group ID to the specific group.
     *
     * @param {string} groupID - Specifies the groupID that needs to be cloned.
     * @param {string} parentGroupID - Specifies the parentGroupID in which the group to be cloned.
     * @param {number} index - Specifies the index to insert the cloned group inside the parent group.
     * @returns {void}
     */
    cloneGroup(groupID: string, parentGroupID: string, index: number): void;
    /**
     * Locks the rule based on the rule ID.
     *
     * @param {string} ruleID - Specifies the ruleID that needs to be locked.
     * @returns {void}
     */
    lockRule(ruleID: string): void;
    /**
     * Locks the group based on the group ID
     *
     * @param {string} groupID - Specifies the groupID that needs to be locked.
     * @returns {void}
     */
    lockGroup(groupID: string): void;
    private sqlParser;
    private parseSqlStrings;
    private getDoubleQuoteString;
    private checkCondition;
    private getSingleQuoteString;
    private combineSingleQuoteString;
    private checkLiteral;
    private checkNumberLiteral;
    private getOperator;
    private getTypeFromColumn;
    private getLabelFromColumn;
    private getLabelFromField;
    private processParser;
    /**
     * Clone the Group
     *
     * @param {Element | string} target - 'target' to be passed to clone the group.
     * @returns {void}
     */
    private groupClone;
    private ruleClone;
    private ruleLock;
    private groupLock;
    private updateLockItems;
    private disableHeaderControls;
    private disableRuleControls;
}
export interface Level {
    [key: string]: number[];
}
/**
 * Creates the custom component of Query Builder
 */
export interface TemplateColumn {
    /**
     * Creates the custom component.
     *
     * @default null
     */
    create?: Element | Function | string;
    /**
     * Wire events for the custom component.
     *
     * @default null
     */
    write?: void | Function | string;
    /**
     * Destroy the custom component.
     *
     * @default null
     */
    destroy?: Function | string;
}
/**
 * Defines the validation of Query Builder.
 */
export interface Validation {
    /**
     * Specifies the minimum value in textbox validation.
     *
     * @default 2
     */
    min?: number;
    /**
     * Specifies the maximum value in textbox validation.
     *
     * @default 10
     */
    max?: number;
    /**
     * Specifies whether the value is required or not
     *
     * @default true
     */
    isRequired: boolean;
}
/**
 * Interface for change event.
 */
export interface ChangeEventArgs extends BaseEventArgs {
    groupID: string;
    ruleID?: string;
    childGroupID?: string;
    value?: string | number | Date | boolean | string[];
    selectedIndex?: number;
    selectedField?: string;
    cancel?: boolean;
    type?: string;
    not?: boolean;
}
/**
 * Interface for rule change event arguments.
 */
export interface RuleChangeEventArgs extends BaseEventArgs {
    previousRule?: RuleModel;
    rule: RuleModel;
    type?: string;
}
/**
 * Interface for action begin and action complete event args
 */
export interface ActionEventArgs extends BaseEventArgs {
    ruleID: string;
    requestType?: string;
    action?: string;
    rule?: RuleModel;
    fields?: Object;
    columns?: ColumnsModel[];
    operators?: {
        [key: string]: Object;
    }[];
    operatorFields?: Object;
    field?: string;
    operator?: string;
    condition?: string;
    notCondition?: boolean;
    renderTemplate?: boolean;
    groupID?: string;
}
/**
 * Interface to define the parameter SQL query.
 *
 */
export interface ParameterizedSql {
    /**
     * Specifies the SQL `WHERE` clause with `?` placeholders for each value.
     */
    sql: string;
    /**
     * Specifies the parameter values in the same order their respective placeholders appear in the `sql` string.
     */
    params: object[];
}
/**
 * Interface to define the parameterized named SQL query.
 *
 */
export interface ParameterizedNamedSql {
    /**
     * Specifies the SQL `WHERE` clause with bind variable placeholders for each value.
     */
    sql: string;
    /**
     * Specifies the bind variable names from the `sql` string to the associated values.
     */
    params: Record<string, object>;
}
/**
 * Interface to define the DragEventArgs for dragging action of group and rules.
 *
 */
export interface DragEventArgs {
    /**
     * Returns the ID of the rule id to be dragged.
     *
     * @returns {string} The ID of the rule where the drag action is performed.
     */
    dragRuleID: string;
    /**
     * Returns the ID of the group to be dragged.
     *
     * @returns {string} The ID of the group where the drag action is performed.
     */
    dragGroupID: string;
    /**
     * Determines whether to cancel the dragging action based on certain conditions.
     *
     * @returns {boolean} True if the dragging action should be cancelled, otherwise false.
     *
     */
    cancel: boolean;
}
/**
 * Interface to define the DropEventArgs for dropping action of group and rules.
 *
 */
export interface DropEventArgs {
    /**
     * Determines whether to cancel the dropping action based on certain conditions.
     *
     * @returns {boolean} True if the dropping action should be cancelled, otherwise false.
     */
    cancel: boolean;
    /**
     * Returns the ID of the rule where the drop action is initiated.
     *
     * @returns {string} The ID of the rule where the drop action is performed.
     */
    dropRuleID: string;
    /**
     * Returns the ID of the group where the drop action is initiated.
     *
     * @returns {string} The ID of the group where the drop action is performed.
     */
    dropGroupID: string;
}
