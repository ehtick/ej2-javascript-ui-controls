/* eslint-disable */
import { createElement, L10n, classList, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DocumentEditor } from '../../document-editor';
import { CommentElementBox, CommentCharacterElementBox, ElementBox, CommentEditInfo } from '../../implementation/viewer/page';
import { DropDownButton, ItemModel, MenuEventArgs } from '@syncfusion/ej2-splitbuttons';
import { Button } from '@syncfusion/ej2-buttons';
import { Toolbar, TabItemModel, Tab, SelectEventArgs } from '@syncfusion/ej2-navigations';
import { DialogUtility, Dialog } from '@syncfusion/ej2-popups';
import { Dictionary, ReviewTabType, CommentDeleteEventArgs, CommentActionEventArgs, beforeCommentActionEvent, commentEndEvent, commentBeginEvent, commentDeleteEvent } from '../../base/index';
import { HelperMethods } from '../editor/editor-helper';
import { SanitizeHtmlHelper } from '@syncfusion/ej2-base';
import { FieldSettingsModel, Mention, SelectEventArgs as MentionSelectEventArgs } from '@syncfusion/ej2-dropdowns';

/**
 * @private
 */
export class CommentReviewPane {
    public owner: DocumentEditor;
    public reviewPane: HTMLElement;
    public toolbarElement: HTMLElement;
    public toolbar: Toolbar;
    public commentPane: CommentPane;
    public headerContainer: HTMLElement;
    public previousSelectedCommentInt: CommentElementBox;
    public isNewComment: boolean = false;
    private confirmDialog: Dialog;
    public reviewTab: Tab;
    public parentPaneElement: HTMLElement;
    public isUserClosed: boolean = false;
    public element: HTMLElement;
    public isCommentTabVisible: boolean;
    /**
     * @private
     */
    public postReply: boolean = false;
    /**
     * @private
     */
    public selectedTab: number = 0;

    public get previousSelectedComment(): CommentElementBox {
        return this.previousSelectedCommentInt;
    }

    public set previousSelectedComment(value: CommentElementBox) {
        if (!isNullOrUndefined(value) && value !== this.previousSelectedCommentInt) {
            if (this.commentPane.comments.containsKey(value)) {
                const commentStart: CommentCharacterElementBox = this.commentPane.getCommentStart(value);
                const commentMark: HTMLElement = commentStart.commentMark;
                if (commentMark) {
                    classList(commentMark, [], ['e-de-cmt-mark-selected']);
                    this.commentPane.removeSelectionMark('e-de-cmt-selection');
                    this.commentPane.removeSelectionMark('e-de-cmt-mark-selected');
                }
                let commentView: CommentView = this.commentPane.comments.get(value);
                commentView.hideDrawer();
                for (let i: number = 0; i < value.replyComments.length; i++) {
                    commentView = this.commentPane.comments.get(value.replyComments[i]);
                    if (commentView) {
                        commentView.hideDrawer();
                        commentView.hideMenuItems();
                    }
                }
            }
        }
        this.previousSelectedCommentInt = value;
    }

    public constructor(owner: DocumentEditor) {
        this.owner = owner;
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        this.initReviewPane(localObj);
        this.parentPaneElement.style.display = 'none';
    }
    public selectReviewTab(tab: ReviewTabType): void {
        if (tab === 'Changes') {
            this.reviewTab.select(1);
        }
        else {
            this.reviewTab.select(0);
        }
    }
    public showHidePane(show: boolean, tab: ReviewTabType): void {
        if (this.parentPaneElement) {
            this.updateTabHeaderWidth();
            if (show) {
                this.parentPaneElement.style.display = 'block';
                if (tab === 'Changes' && this.owner.showRevisions) {
                    this.isCommentTabVisible = false;
                    this.owner.notify('reviewPane', { comment: this.isCommentTabVisible, changes: true });
                    this.reviewTab.select(1);
                } else {
                    if (this.owner.documentHelper.comments.length != 0) {
                        this.owner.trackChangesPane.isChangesTabVisible = false;
                        this.owner.notify('reviewPane', { comment: true, changes: this.owner.trackChangesPane.isChangesTabVisible, isUserClosed: false });
                        this.reviewTab.select(0);
                    }
                }
                this.owner.trackChangesPane.enableButtons = !this.owner.isReadOnly && !this.owner.documentHelper.isDocumentProtected;
                this.owner.trackChangesPane.updateTrackChanges(show);
                this.commentPane.updateCommentStatus();
            }
            else {
                this.parentPaneElement.style.display = 'none';
            }
            if(!this.owner.showRevisions) {
                this.owner.trackChangesPane.isChangesTabVisible = false;
                this.owner.notify('reviewPane', { comment: this.isCommentTabVisible, changes: this.owner.trackChangesPane.isChangesTabVisible });
                this.reviewTab.hideTab(1, true);
            }
            if (!this.owner.showComments) {
                this.isCommentTabVisible = false;
                this.owner.notify('reviewPane', { comment: this.isCommentTabVisible, changes: this.owner.trackChangesPane.isChangesTabVisible });
                this.reviewTab.hideTab(0, true);
            }
        }
        if (show) {
            this.enableDisableItems();
            this.commentPane.updateHeight();
        }
        if (this.owner) {
            this.owner.resize();
            if (this.owner.enableAutoFocus) {
                this.owner.documentHelper.updateFocus();
            }
        }
        
    }

    public reviewPaneHelper(args: any): void {
        if (!isNullOrUndefined(args.isUserClosed)) {
            if (args.isUserClosed !== this.isUserClosed) {
                this.isUserClosed = args.isUserClosed;
                if (this.owner) {
                    setTimeout(() => {
                        if (this.owner) {
                            this.owner.resize();
                        }
                    }, 10);
                }
            }
            else {
                return;
            }
        } else {
            if(this.isUserClosed){
                return;
            }
        }
        if (!isNullOrUndefined(args.comment) || !isNullOrUndefined(args.changes)) {
            if ((args.comment || args.changes)) {
                if (this.parentPaneElement.style.display === 'none') {
                    this.parentPaneElement.style.display = 'block';
                }
                if (this.owner) {
                    setTimeout(() => {
                        if (this.owner) {
                            this.owner.resize();
                        }
                    }, 10);
                }
            }
            else {
                this.parentPaneElement.style.display = 'none';
                if (this.owner) {
                    setTimeout(() => {
                        if (this.owner) {
                            this.owner.resize();
                        }
                    }, 10);
                }
            }
        }
    }

    public updateTabHeaderWidth(): void {
        const reviewTabsEle: HTMLCollectionOf<Element> = this.reviewTab.getRootElement().getElementsByClassName('e-tab-wrap');
        (reviewTabsEle[0] as HTMLElement).style.padding = '0 8px';
        (reviewTabsEle[1] as HTMLElement).style.padding = '0 8px';
    }

    public initReviewPane(localValue: L10n): void {
        const reviewContainer: HTMLElement = this.owner.documentHelper.optionsPaneContainer;
        reviewContainer.style.display = 'flex';
        this.initPaneHeader(localValue);
        reviewContainer.appendChild(this.addReviewTab(localValue));
        this.initCommentPane();
        this.owner.on('reviewPane', this.reviewPaneHelper, this);
    }
    private addReviewTab(localValue: L10n): HTMLElement {
        const commentHeader: HTMLElement = createElement('div', { innerHTML: localValue.getConstant('Comments') });
        const changesHeader: HTMLElement = createElement('div', { innerHTML: localValue.getConstant('Changes') });
        this.parentPaneElement = createElement('div', { styles: 'height:100%;overflow:auto;display:none', className: 'e-de-review-pane' });
        this.element = createElement('div', { className: 'e-de-property-tab', id:this.owner.element.id + 'Review_Tab' });
        const items: TabItemModel[] = [{ header: { text: commentHeader }, content: this.reviewPane }, { header: { text: changesHeader } }] as TabItemModel[];
        this.reviewTab = new Tab({ items: items, selected: this.onTabSelection, animation: { previous: { effect: 'None' }, next: { effect: 'None' } } });
        this.reviewTab.appendTo(this.element);
        if (this.owner.enableRtl) {
            this.reviewTab.enableRtl = true;
        }
        this.reviewTab.enablePersistence = true;
        this.parentPaneElement.appendChild(this.element);
        
        return this.parentPaneElement;
    }

    /**
     * @param {SelectEventArgs} arg - Specify the selection event args.
     * @returns {void}
     */
    private onTabSelection = (arg: SelectEventArgs): void => {
        arg.preventFocus = true;
        this.selectedTab = arg.selectedIndex;
        if (this.selectedTab === 1) {
            this.owner.trackChangesPane.updateHeight();
        } else {
            this.commentPane.updateHeight();
        }
        setTimeout(() => {
            if (this.owner) {
                this.owner.resize();
            }
        }, 10);
    };

    public initPaneHeader(localValue: L10n): HTMLElement {
        this.headerContainer = createElement('div');
        this.reviewPane = createElement('div', { className: 'e-de-cmt-pane' });
        if (this.owner.enableRtl) {
            classList(this.reviewPane, ['e-rtl'], []);
        }
        this.headerContainer.appendChild(this.initToolbar(localValue));
        this.reviewPane.appendChild(this.headerContainer);
        this.reviewPane.style.display = 'block';
        return this.reviewPane;
    }
    public closePane(): void {
        if (this.commentPane && this.commentPane.isEditMode) {
            if (!isNullOrUndefined(this.commentPane.currentEditingComment)
                && this.commentPane.isInsertingReply && this.commentPane.currentEditingComment.replyViewTextBox.innerText  === '') {
                this.owner.documentHelper.currentSelectedComment = undefined;
                this.commentPane.currentEditingComment.cancelReply();
                this.owner.showComments = false;
            } else if (this.isNewComment || !isNullOrUndefined(this.commentPane.currentEditingComment)
                && this.commentPane.isInsertingReply && this.commentPane.currentEditingComment.replyViewTextBox.innerText  !== '' ||
                !isNullOrUndefined(this.commentPane.currentEditingComment) && !this.commentPane.isInsertingReply &&
                this.commentPane.currentEditingComment.textArea.innerText  !== this.commentPane.currentEditingComment.comment.text) {
                const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
                localObj.setLocale(this.owner.locale);
                this.confirmDialog = DialogUtility.confirm({
                    title: localObj.getConstant('Unsaved comments'),
                    content: localObj.getConstant('Discard Comment body'),
                    okButton: {
                        text: localObj.getConstant('Discard comments'), click: this.discardButtonClick.bind(this), cssClass: 'e-btn e-danger'
                    },
                    cancelButton: {
                        text: localObj.getConstant('Keep editing'), click: this.closeDialogUtils.bind(this)
                    },
                    showCloseIcon: true,
                    closeOnEscape: true,
                    animationSettings: { effect: 'Zoom' },
                    position: { X: 'center', Y: 'center' }
                });
            } else {
                this.owner.documentHelper.currentSelectedComment = undefined;
                this.commentPane.currentEditingComment.cancelEditing();
                this.owner.showComments = false;
            }
        } else {
            this.owner.showComments = false;
            //this.owner.showRevisions = false;
            this.owner.documentHelper.currentSelectedComment = undefined;
            this.owner.documentHelper.currentSelectedRevision = undefined;
            this.owner.notify('reviewPane', {changes: false, comment: false, isUserClosed: true});
        }
    }

    private discardButtonClick(): void {
        if (this.commentPane.currentEditingComment) {
            const isNewComment: boolean = this.isNewComment;
            if (this.commentPane.currentEditingComment && this.commentPane.isInsertingReply) {
                this.commentPane.currentEditingComment.cancelReply();
            } else {
                this.commentPane.currentEditingComment.cancelEditing();
            }
            this.owner.documentHelper.currentSelectedComment = undefined;
            this.closeDialogUtils();
            this.owner.showComments = false;
        }
    }

    private closeDialogUtils(): void {
        this.confirmDialog.close();
        this.confirmDialog = undefined;
    }

    public initToolbar(localValue: L10n): HTMLElement {
        this.toolbarElement = createElement('div');
        this.toolbar = new Toolbar({
            items: [
                {
                    prefixIcon: 'e-de-new-cmt e-de-cmt-tbr', tooltipText: localValue.getConstant('New Comment'),
                    text: localValue.getConstant('New Comment'), click: this.insertComment.bind(this)
                },
                {
                    prefixIcon: 'e-de-nav-left-arrow e-de-cmt-tbr', align: 'Right',
                    tooltipText: localValue.getConstant('Previous Comment'), click: this.navigatePreviousComment.bind(this)
                },
                {
                    prefixIcon: 'e-de-nav-right-arrow e-de-cmt-tbr', align: 'Right',
                    tooltipText: localValue.getConstant('Next Comment'), click: this.navigateNextComment.bind(this)
                }],
            enableRtl: this.owner.enableRtl
        });
        this.toolbar.appendTo(this.toolbarElement);
        return this.toolbarElement;
    }

    public insertComment(): void {
        if (this.owner && this.owner.editorModule) {
            this.owner.editorModule.isUserInsert = true;
            this.owner.editorModule.insertComment('');
            this.owner.editorModule.isUserInsert = false;
        }
    }

    public addComment(comment: CommentElementBox, isNewComment: boolean, selectComment: boolean): void {
        this.isNewComment = isNewComment;
        this.owner.documentHelper.currentSelectedComment = comment;
        this.commentPane.insertComment(comment);
        this.selectReviewTab('Comments');
        if (!isNewComment) {
            const commentView: CommentView = this.commentPane.comments.get(comment);
            commentView.cancelEditing();
            this.enableDisableToolbarItem();
        }
        if (selectComment) {
            this.selectComment(comment);
        }
    }

    public deleteComment(comment: CommentElementBox): void {
        if (this.commentPane) {
            this.commentPane.deleteComment(comment);
        }
    }

    public selectComment(comment: CommentElementBox): void {
        if (this.commentPane.isEditMode) {
            return;
        }
        if (comment.isReply) {
            comment = comment.ownerComment;
        }
        if (this.owner && this.owner.viewer && this.owner.documentHelper.currentSelectedComment !== comment) {
            this.owner.documentHelper.currentSelectedComment = comment;
        }
        this.commentPane.selectComment(comment);
    }

    public resolveComment(comment: CommentElementBox): void {
        this.commentPane.resolveComment(comment);
    }

    public reopenComment(comment: CommentElementBox): void {
        this.commentPane.reopenComment(comment);
    }

    public addReply(comment: CommentElementBox, newComment: boolean, selectComment: boolean): void {
        this.isNewComment = newComment;
        this.postReply = true;
        this.commentPane.insertReply(comment);
        this.postReply = false;
        if (!newComment) {
            const commentView: CommentView = this.commentPane.comments.get(comment);
            commentView.cancelEditing();
            this.enableDisableToolbarItem();
        }
        if (selectComment) {
            this.selectComment(comment.ownerComment);
        }
    }

    public navigatePreviousComment(): void {
        if (this.owner && this.owner.editorModule) {
            this.owner.selectionModule.navigatePreviousComment();
        }
    }

    public navigateNextComment(): void {
        if (this.owner && this.owner.editorModule) {
            this.owner.selectionModule.navigateNextComment();
        }
    }

    public enableDisableItems(): void {
        this.enableDisableToolbarItem();
        const keys: CommentElementBox[] = this.commentPane.comments.keys;
        for (let i: number = 0; i < keys.length; i++) {
            const commentView: CommentView = this.commentPane.comments.get(keys[i]);
            if (this.owner.isReadOnly) {
                if(!isNullOrUndefined(commentView.replyViewTextBox)) {
                    commentView.replyViewTextBox.style.display = 'none';
                }
                commentView.menuBar.style.display = 'none';
                if (commentView.resolveView) {
                    commentView.resolveView.style.display = 'none';
                }
            } else {
                if(!isNullOrUndefined(commentView.replyViewTextBox)) {
                    commentView.replyViewTextBox.style.display = 'block';
                }
                commentView.menuBar.style.display = 'block';
                if (commentView.resolveView) {
                    commentView.resolveView.style.display = '';
                }
            }
        }
    }

    public enableDisableToolbarItem(): void {
        if (this.toolbar) {
            let enable: boolean = true;
            if (this.commentPane.isEditMode) {
                enable = !this.commentPane.isEditMode;
            }
            if (this.owner.isReadOnly) {
                enable = !this.owner.isReadOnly;
            }
            const elements: NodeListOf<Element> = this.toolbar.element.querySelectorAll('.' + 'e-de-cmt-tbr');
            this.toolbar.enableItems(elements[0].parentElement.parentElement, enable);
            if (enable && this.owner && this.owner.viewer) {
                enable = !(this.owner.documentHelper.comments.length === 0);
            }
            this.toolbar.enableItems(elements[1].parentElement.parentElement, enable);
            this.toolbar.enableItems(elements[2].parentElement.parentElement, enable);
        }
    }

    public initCommentPane(): void {
        this.commentPane = new CommentPane(this.owner, this);
        this.commentPane.initCommentPane();
    }

    public layoutComments(commentCollection: CommentElementBox[]): void {
        for (let i: number = 0; i < commentCollection.length; i++) {
            let comment: CommentElementBox = commentCollection[i];
            if (this.isUnreferredComment(comment)) {
                commentCollection.splice(i, 1);
                i--;
                continue;
            }
            for (let j: number = 0; j < comment.replyComments.length; j++) {
                if (this.isUnreferredComment(comment.replyComments[j])) {
                    comment.replyComments.splice(j, 1);
                    j--;
                }
            }
            this.commentPane.addComment(comment);
        }
    }

    private isUnreferredComment(comment: CommentElementBox): boolean {
        if (isNullOrUndefined(comment.commentStart)
            || isNullOrUndefined(comment.commentEnd)) {
            return true;
        }
        return false;
    }
    public clear(): void {
        this.previousSelectedCommentInt = undefined;
        this.isNewComment = false;
        this.isUserClosed = false;
        this.isNewComment = false;
        this.commentPane.clear();
    }

    public discardComment(comment: CommentElementBox): void {
        if (comment) {
            if (this.owner.editorHistoryModule) {
                if (this.owner.editorHistoryModule.undoStack.length > 0
                    && this.owner.editorHistoryModule.undoStack[this.owner.editorHistoryModule.undoStack.length - 1].action === 'InsertComment') {
                    this.owner.editorHistoryModule.undo();
                    this.owner.editorHistoryModule.redoStack.pop();
                }
                this.owner.editorModule.isSkipOperationsBuild = this.owner.enableCollaborativeEditing;
                this.owner.editorModule.deleteCommentInternal(comment);
                this.owner.editorModule.isSkipOperationsBuild = false;
            } else if (this.owner.editorModule) {
                this.owner.editorModule.deleteCommentInternal(comment);
            }
        }
    }

    public destroy(): void {
        if (this.commentPane) {
            this.commentPane.destroy();
        }
        this.commentPane = undefined;
        if (this.toolbar) {
            this.toolbar.destroy();
        }
        this.toolbar = undefined;
        if (this.toolbarElement && this.toolbarElement.parentElement) {
            this.toolbarElement.parentElement.removeChild(this.toolbarElement);
        }
        this.toolbarElement = undefined;
        if (this.headerContainer && this.headerContainer.parentElement) {
            this.headerContainer.parentElement.removeChild(this.headerContainer);
        }
        this.headerContainer = undefined;
        this.previousSelectedCommentInt = undefined;
        if (this.reviewPane && this.reviewPane.parentElement) {
            this.reviewPane.parentElement.removeChild(this.reviewPane);
        }
        if (!this.owner.isDestroyed) { 
            this.owner.off('reviewPane', this.reviewPaneHelper);
        }
        if (!isNullOrUndefined(this.reviewTab)) {
            this.reviewTab.destroy();
        }
        this.reviewTab = undefined;
        if (!isNullOrUndefined(this.confirmDialog)) {
            this.confirmDialog.destroy();
        }
        this.confirmDialog = undefined;
        if (!isNullOrUndefined(this.previousSelectedCommentInt)) {
            this.previousSelectedCommentInt.destroy();
        }
        this.previousSelectedCommentInt = undefined;
        if (this.reviewPane) {
            this.reviewPane.innerHTML = '';
            if (this.reviewPane.parentElement) {
                this.reviewPane.parentElement.removeChild(this.reviewPane);
            }     
        }
        this.reviewPane = undefined;
        if (this.parentPaneElement) {
            this.parentPaneElement.innerHTML = '';
            if (this.parentPaneElement.parentElement) {
                this.parentPaneElement.parentElement.removeChild(this.parentPaneElement);
            }     
        }
        this.parentPaneElement = undefined;
        this.owner = undefined;
    }
}

/**
 * @private
 */
export class CommentPane {
    private owner: DocumentEditor;
    public parentPane: CommentReviewPane;
    public noCommentIndicator: HTMLElement;
    public parent: HTMLElement;
    public comments: Dictionary<CommentElementBox, CommentView>;
    public commentPane: HTMLElement;
    private isEditModeInternal: boolean = false;
    public currentEditingComment: CommentView;
    public isInsertingReply: boolean = false;

    public get isEditMode(): boolean {
        return this.isEditModeInternal;
    }

    public set isEditMode(value: boolean) {
        this.isEditModeInternal = value;
        const keys: CommentElementBox[] = this.comments.keys;
        for (let i: number = 0; i < keys.length; i++) {
            const commentView: CommentView = this.comments.get(keys[i]);
            if (value) {
                commentView.menuBar.style.display = 'none';
            } else if (!commentView.comment.isReply) {
                commentView.menuBar.style.display = 'block';
            }
        }
        if (this.parentPane) {
            this.parentPane.enableDisableToolbarItem();
        }
        if (this.owner) {
            if (this.isEditModeInternal) {
                this.owner.trigger(commentBeginEvent);
            } else {
                this.owner.trigger(commentEndEvent);
            }
        }
    }

    public constructor(owner: DocumentEditor, pane: CommentReviewPane) {
        this.owner = owner;
        this.parentPane = pane;
        this.parent = pane.reviewPane;
        this.comments = new Dictionary<CommentElementBox, CommentView>();
    }

    public initCommentPane(): void {
        this.commentPane = createElement('div', { className: 'e-de-cmt-container e-de-scrollbar-hide' });
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        this.noCommentIndicator = createElement('div', {
            className: 'e-de-cmt-no-cmt',
            innerHTML: localObj.getConstant('No comments in this document')
        });
        this.commentPane.appendChild(this.noCommentIndicator);
        this.parent.appendChild(this.commentPane);
    }

    public addComment(comment: CommentElementBox): void {
        const commentView: CommentView = new CommentView(this.owner, this, comment);
        const commentParent: HTMLElement = commentView.layoutComment(false);
        this.comments.add(comment, commentView);
        this.commentPane.appendChild(commentParent);
        for (let i: number = 0; i < comment.replyComments.length; i++) {
            const replyView: CommentView = new CommentView(this.owner, this, comment.replyComments[i]);
            this.comments.add(comment.replyComments[i], replyView);
            commentParent.insertBefore(replyView.layoutComment(true), commentView.replyViewContainer);
        }
        this.updateCommentStatus();
        commentView.hideDrawer();
    }

    public updateHeight(): void {
        const tabHeaderHeight: number = this.parentPane.reviewTab.getRootElement().getElementsByClassName('e-tab-header')[0].getBoundingClientRect().height;
        this.commentPane.style.height = this.parentPane.parentPaneElement.clientHeight - this.parentPane.headerContainer.clientHeight - tabHeaderHeight + 'px';
    }

    public insertReply(replyComment: CommentElementBox): void {
        const parentComment: CommentElementBox = replyComment.ownerComment;
        const parentView: CommentView = this.comments.get(parentComment);
        const replyView: CommentView = new CommentView(this.owner, this, replyComment);
        this.comments.add(replyComment, replyView);
        const replyElement: HTMLElement = replyView.layoutComment(true);

        const replyIndex: number = parentComment.replyComments.indexOf(replyComment);
        if (replyIndex === parentComment.replyComments.length - 1) {
            parentView.parentElement.insertBefore(replyElement, parentView.replyViewContainer);
        } else {
            const nextReply: CommentElementBox = parentComment.replyComments[replyIndex + 1];
            parentView.parentElement.insertBefore(replyElement, this.comments.get(nextReply).parentElement);
        }
        replyView.editComment();
    }

    public insertComment(comment: CommentElementBox): void {
        const commentView: CommentView = new CommentView(this.owner, this, comment);
        const commentParent: HTMLElement = commentView.layoutComment(false);
        this.comments.add(comment, commentView);
        if (this.owner.documentHelper.comments.indexOf(comment) === this.owner.documentHelper.comments.length - 1) {
            this.commentPane.appendChild(commentParent);
        } else {
            const index: number = this.owner.documentHelper.comments.indexOf(comment);
            const element: HTMLElement = this.comments.get(this.owner.documentHelper.comments[index + 1]).parentElement;
            this.commentPane.insertBefore(commentParent, element);
            commentParent.focus();
        }
        this.updateCommentStatus();
        commentView.editComment();
    }

    public removeSelectionMark(className: string): void {
        if (this.parent) {
            const elements: HTMLCollectionOf<Element> = this.parent.getElementsByClassName(className);
            for (let i: number = 0; i < elements.length; i++) {
                classList(elements[i], [], [className]);
            }
        }
    }

    public selectComment(comment: CommentElementBox): void {
        this.removeSelectionMark('e-de-cmt-selection');
        if (comment.isReply) {
            comment = comment.ownerComment;
        }
        if (comment) {
            this.owner.notify('reviewPane', { comment: true, changes: this.owner.trackChangesPane.isChangesTabVisible});
            const commentView: CommentView = this.comments.get(comment);
            const selectedElement: HTMLElement = commentView.parentElement;
            if (selectedElement) {
                classList(selectedElement, ['e-de-cmt-selection'], []);
                selectedElement.focus();
            }
            const commentStart: CommentCharacterElementBox = this.getCommentStart(comment);
            if (!commentStart.commentMark) {
                commentStart.renderCommentMark();
            }
            classList(commentStart.commentMark, ['e-de-cmt-mark-selected'], []);
            commentView.showDrawer();
        }
    }

    public getCommentStart(comment: CommentElementBox): CommentCharacterElementBox {
        const localValue: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localValue.setLocale(this.owner.locale);
        let commentStart: CommentCharacterElementBox = undefined;
        if (comment && comment.commentStart) {
            commentStart = comment.commentStart;
        }
        if (commentStart.commentMark !== undefined) {
            commentStart.commentMark.title = localValue.getConstant('Click to see this comment');
        }
        return this.getFirstCommentInLine(commentStart);

    }
    private getFirstCommentInLine(commentStart: CommentCharacterElementBox): CommentCharacterElementBox {
        for (let i: number = 0; i < commentStart.line.children.length; i++) {
            const startComment: ElementBox = commentStart.line.children[i];
            if (startComment instanceof CommentCharacterElementBox && startComment.commentType === 0) {
                return startComment as CommentCharacterElementBox;
            }
        }
        return commentStart;
    }

    public deleteComment(comment: CommentElementBox): void {
        const commentView: CommentView = this.comments.get(comment);
        if (!isNullOrUndefined(commentView)) {
            if (!isNullOrUndefined(this.currentEditingComment)
                && commentView.comment.commentId == this.currentEditingComment.comment.commentId) {
                this.isEditMode = false;
                this.currentEditingComment = undefined;
            }
            if (commentView.parentElement && commentView.parentElement.parentElement) {
                commentView.parentElement.parentElement.removeChild(commentView.parentElement);
            }
            //this.commentPane.removeChild();
            for (let i: number = 0; i < comment.replyComments.length; i++) {
                const replyCmt: CommentElementBox = comment.replyComments[i];
                if (this.comments.containsKey(replyCmt)) {
                    this.comments.remove(replyCmt);
                }
            }
            this.comments.remove(comment);
            commentView.destroy();
        }
        this.updateCommentStatus();
    }

    public resolveComment(comment: CommentElementBox): void {
        const commentView: CommentView = this.comments.get(comment);
        if (commentView) {
            commentView.resolveComment();
        }
    }

    public reopenComment(comment: CommentElementBox): void {
        const commentView: CommentView = this.comments.get(comment);
        if (commentView) {
            commentView.reopenComment();
        }
    }

    public updateCommentStatus(): void {
        if (this.owner.documentHelper.comments.length === 0) {
            if (!this.noCommentIndicator.parentElement) {
                this.commentPane.appendChild(this.noCommentIndicator);
            }
            this.noCommentIndicator.style.display = 'block';
            this.parentPane.isCommentTabVisible = false;
            this.owner.notify('reviewPane', { comment: false, changes: this.owner.trackChangesPane.isChangesTabVisible});
            this.parentPane.reviewTab.hideTab(0);
        } else if (this.owner.showComments) {
            this.parentPane.isCommentTabVisible = true;
            this.noCommentIndicator.style.display = 'none';
            this.owner.notify('reviewPane', { comment: true, changes: this.owner.trackChangesPane.isChangesTabVisible});
            this.parentPane.reviewTab.hideTab(0, false);
        }
        if (this.parentPane) {
            this.parentPane.enableDisableToolbarItem();
        }
    }

    public clear(): void {
        this.isEditMode = false;
        this.currentEditingComment = undefined;
        this.isInsertingReply = false;
        this.removeChildElements();
        this.commentPane.innerHTML = '';
        this.updateCommentStatus();
    }

    public removeChildElements(): void {
        const comments: CommentElementBox[] = this.comments.keys;
        for (let i: number = 0; i < comments.length; i++) {
            this.comments.get(comments[i]).destroy();
        }
        this.comments.clear();
    }

    public destroy(): void {
        this.removeChildElements();
        if (this.noCommentIndicator && this.noCommentIndicator) {
            this.noCommentIndicator.parentElement.removeChild(this.noCommentIndicator);
        }
        this.noCommentIndicator = undefined;
        if (this.commentPane) {
            this.commentPane.innerHTML = '';
            if (this.commentPane.parentElement) {
                this.commentPane.parentElement.removeChild(this.commentPane);
            }
        }
        this.commentPane = undefined;
        if (this.parent) {
            this.parent.innerHTML = '';
            if (this.parent.parentElement) {
                this.parent.parentElement.removeChild(this.parent);
            }
        }
        this.parent = undefined;
        this.parentPane = undefined;
        this.currentEditingComment = undefined;
        this.owner = undefined;
    }
}

/**
 * @private
 */
export class CommentView {
    private owner: DocumentEditor;
    public comment: CommentElementBox;
    public commentPane: CommentPane;
    public parentElement: HTMLElement;
    public menuBar: HTMLElement;
    public resolveDiv : HTMLElement;
    public commentEditorIcon : CommentCharacterElementBox;
    public resolveText : HTMLElement;
    public commentView: HTMLElement;
    public commentText: HTMLElement;
    public commentDate: HTMLElement;
    public isReply: boolean = false;
    public textAreaContainer: HTMLElement;
    public textArea: HTMLElement;
    public postButton: Button;
    public cancelButton: Button;
    public dropDownButton: DropDownButton;
    public drawerElement: HTMLElement;
    public drawerAction: HTMLElement;
    public drawerSpanElement: HTMLSpanElement;
    public isDrawerExpand: boolean = false;
    public replyViewContainer: HTMLElement;
    public replyViewTextBox: HTMLElement;
    public replyPostButton: Button;
    public replyCancelButton: Button;
    public replyFooter: HTMLElement;
    public reopenButton: Button;
    public deleteButton: Button;
    public resolveView: HTMLElement;
    public itemData: FieldSettingsModel[] = [];
    private editMention: Mention;
    private replyMention: Mention;

    public constructor(owner: DocumentEditor, commentPane: CommentPane, comment: CommentElementBox) {
        this.owner = owner;
        this.comment = comment;
        this.commentPane = commentPane;
    }

    public layoutComment(isReply: boolean): HTMLElement {
        this.isReply = isReply;
        let classList: string = 'e-de-cmt-sub-container';
        if (isReply) {
            classList += ' e-de-cmt-reply';
        }
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        this.parentElement = createElement('div', { className: classList });
        this.initCommentHeader(localObj);
        this.initCommentView(localObj);
        this.initDateView();
        if (!this.comment.isReply) {
            this.parentElement.tabIndex = 0;
            this.initReplyView(localObj);
            this.initResolveOption(localObj);
            this.initDrawer();
            if (this.comment.isResolved) {
                this.resolveComment();
            }
        } else {
            this.menuBar.style.display = 'none';
        }
        this.commentView.addEventListener('mouseenter', this.showMenuItems.bind(this));
        this.commentView.addEventListener('mouseleave', this.hideMenuItemOnMouseLeave.bind(this));
        return this.parentElement;
    }

    private initCommentHeader(localObj: L10n): void {
       
        var commentDiv = createElement('div', { className: 'e-de-cmt-view' });
        this.resolveDiv = createElement('div', { className: 'e-de-cmt-view' });
        let wrapperDiv = createElement('div', { className: 'e-de-cmt-view' });
        const roundIcon = createElement('div', { className: 'e-de-resolve-mark' });
        let span = createElement('span', { className: 'e-de e-icons e-check' });
        let resolveText = createElement('span', { className: '' });
        resolveText.innerHTML = "Resolved";
        span.style.display = 'inline-block';
        roundIcon.style.display = 'flex';
        roundIcon.style.justifyContent = 'center';
        roundIcon.style.alignItems = 'center';
        roundIcon.style.width = "20px";
        roundIcon.style.height = "20px";
        roundIcon.style.borderRadius = "100%";
        roundIcon.style.marginRight = "6px";
        roundIcon.appendChild(span);
        wrapperDiv.appendChild(roundIcon);
        wrapperDiv.appendChild(resolveText);
        this.resolveDiv.appendChild(wrapperDiv);
        wrapperDiv.style.display = "flex";
        wrapperDiv.style.justifyContent = "center";
        wrapperDiv.style.alignItems = "center";
        this.resolveDiv.style.display = "none";
        
        const commentUserInfo: HTMLElement = createElement('div', { className: 'e-de-cmt-author' });
        commentUserInfo.style.marginTop = "8px";
        const userName: HTMLElement = createElement('div', { className: 'e-de-cmt-author-name' });
        userName.textContent = this.comment.author;
        if (!isNullOrUndefined(this.comment.author)) {
            commentUserInfo.style.display = 'flex';
            this.owner.documentHelper.getAvatar(commentUserInfo, userName, this.comment, undefined);
        }

        // commentUserInfo.appendChild(this.resolveDiv);

        //if (this.comment.author === this.owner.currentUser) {
        this.menuBar = createElement('button', { className: 'e-de-cp-option', attrs: { type: 'button' } });
        const userOption: ItemModel[] = [{ text: localObj.getConstant('Edit') },
            { text: localObj.getConstant('Delete') },
            { text: localObj.getConstant('Reply') },
            { text: localObj.getConstant('Resolve') }];
        const menuItem: DropDownButton = new DropDownButton({
            items: this.isReply ? userOption.splice(0, 2) : userOption,
            select: this.userOptionSelectEvent.bind(this),
            iconCss: 'e-de-menu-icon',
            cssClass: 'e-caret-hide',
            enableRtl: this.owner.enableRtl
        });
        this.menuBar.title = localObj.getConstant('More Options') + '...';
        menuItem.appendTo(this.menuBar);
        commentUserInfo.appendChild(this.menuBar);
        this.dropDownButton = menuItem;
        commentDiv.appendChild(commentUserInfo);
        this.commentView = commentDiv;
        this.parentElement.appendChild(commentDiv);
        commentDiv.addEventListener('click', this.selectComment.bind(this));
    }
    private selectComment(): void {
        if (this.commentPane) {
            if (!this.commentPane.isEditMode) {
                this.owner.selectionModule.selectComment(this.comment);
            } else if (this.commentPane.isEditMode && this.commentPane.isInsertingReply
                && this.commentPane.currentEditingComment && this.commentPane.currentEditingComment.replyViewTextBox.innerText === '') {
                let comment: CommentElementBox = this.comment;
                if (comment && comment.isReply) {
                    comment = this.comment.ownerComment;
                }
                if (comment && this.owner.documentHelper.currentSelectedComment === comment) {
                    return;
                }
                this.commentPane.currentEditingComment.cancelReply();
                this.owner.selectionModule.selectComment(this.comment);
            }
        }
    }

    private initCommentView(localObj: L10n): void {
        this.commentText = createElement('div', { className: 'e-de-cmt-readonly e-mention' });
        this.commentText.innerHTML = this.comment.text;
        this.commentView.appendChild(this.commentText);
        this.initEditView(localObj);
    }

    private initEditView(localObj: L10n): void {
        this.textAreaContainer = createElement('div', { styles: 'display:none' });
        this.textArea = createElement('div', { className: 'e-de-cmt-textarea e-input'});
        this.textArea.addEventListener('paste', (event) => {
            this.updatePastedText(event, this.textArea);
        });
        this.textArea.style.borderWidth = '0 0 2px 0';
        this.textArea.setAttribute('placeholder', localObj.getConstant('Type your comment here'));
        this.editMention = new Mention({
            dataSource: this.owner.documentEditorSettings.mentionSettings.dataSource,
            fields: this.owner.documentEditorSettings.mentionSettings.fields,
            select: this.onSelect.bind(this),
        });
        this.textArea.innerHTML = this.comment.text;
        this.textArea.addEventListener('keydown', this.updateTextAreaHeight.bind(this));
        this.textArea.addEventListener('keyup', this.enableDisablePostButton.bind(this));
        const editRegionFooter: HTMLElement = createElement('div', { className: 'e-de-cmt-action-button' });
        const postButton: HTMLButtonElement = createElement('button', { className: 'e-de-cmt-post-btn e-btn e-flat', attrs: { type: 'button' } }) as HTMLButtonElement;
        this.postButton = new Button({ cssClass: 'e-btn e-flat e-primary e-de-overlay', iconCss: 'e-de-cmt-post', disabled: true }, postButton);
        postButton.addEventListener('click', this.postComment.bind(this));
        postButton.title = localObj.getConstant('Post');
        postButton.setAttribute('aria-label', localObj.getConstant('Post'));
        const cancelButton: HTMLButtonElement = createElement('button', {
            className: 'e-de-cmt-cancel-btn e-btn e-flat',
            attrs: { type: 'button' }
        }) as HTMLButtonElement;
        this.cancelButton = new Button({ cssClass: 'e-btn e-flat', iconCss: 'e-de-cmt-cancel' }, cancelButton);
        cancelButton.title = localObj.getConstant('Cancel');
        cancelButton.setAttribute('aria-label', localObj.getConstant('Cancel'));
        cancelButton.addEventListener('click', this.cancelEditing.bind(this));
        editRegionFooter.appendChild(postButton);
        editRegionFooter.appendChild(cancelButton);
        editRegionFooter.style.marginTop = "8px";
        this.textAreaContainer.appendChild(this.textArea);
        this.textAreaContainer.appendChild(editRegionFooter);
        this.commentView.appendChild(this.textAreaContainer);
        this.editMention.appendTo(this.textArea);
    }

    private updatePastedText(event: ClipboardEvent, element: HTMLElement): void {
        // Prevent the default paste action
        event.preventDefault();
        // Get the pasted content from the clipboard
        let clipboardData = (event.clipboardData);
        let plainText = clipboardData.getData('text/plain');
        if (plainText) {
            let htmlString = this.convertToHtml(plainText);
            element.innerHTML = element.innerHTML + htmlString;
        }
        this.enableDisableReplyPostButton();
    }

    private convertToHtml(input: string): string {
        // Split the input string by \r\n or \r
        const lines = input.split(/(?:\r?\n|\r)/);

        // Map each line to a <div> element, adding <br> if the line is empty
        const htmlLines = lines.map(line => line ? `<div>${line}</div>` : `<div><br></div>`);

        // Join the array back into a single string
        const output = htmlLines.join('');

        return output;
    }

    private onSelect(e: MentionSelectEventArgs): void {
        this.owner.documentEditorSettings.mentionSettings.fields
        let data: any = {};
        let item: any = e.itemData as any;
        data.text = item[this.owner.documentEditorSettings.mentionSettings.fields.text]
        data.value = item[this.owner.documentEditorSettings.mentionSettings.fields.value];
        this.itemData.push(data);
    }

    private initDateView(): void {
        this.commentDate = createElement('div', { className: 'e-de-cmt-date' });
        this.commentDate.innerText = HelperMethods.getModifiedDate(this.comment.date);
        this.commentView.appendChild(this.commentDate);
    }

    private initDrawer(): void {
        this.drawerElement = createElement('div', { styles: 'display:none;', className: 'e-de-cmt-drawer-cnt' });
        const leftPane: HTMLElement = createElement('div', { className: 'e-de-cmt-drawer' });
        const spanElement: HTMLElement = createElement('span');
        leftPane.appendChild(spanElement);
        this.drawerElement.appendChild(leftPane);
        this.drawerSpanElement = spanElement as HTMLSpanElement;
        this.drawerAction = leftPane;
        this.drawerAction.addEventListener('click', this.showOrHideDrawer.bind(this));
        this.parentElement.appendChild(this.drawerElement);
    }

    private initReplyView(localObj: L10n): void {
        this.replyViewContainer = createElement('div', { className: 'e-de-cmt-rply-view' });
        if (this.commentPane.parentPane.isNewComment) {
            this.replyViewContainer.style.display = 'none';
        }
        this.replyViewTextBox = createElement('div', { className: 'e-de-cmt-textarea e-input' });
        this.replyViewTextBox.addEventListener('paste', (event) => {
            this.updatePastedText(event, this.replyViewTextBox);
        });
        this.replyViewTextBox.style.borderWidth = '0 0 1px 0';
        this.replyViewTextBox.setAttribute("placeholder" , localObj.getConstant('Reply'));
        this.replyViewTextBox.addEventListener('click', this.enableReplyView.bind(this));
        this.replyViewTextBox.addEventListener('keydown', this.updateReplyTextAreaHeight.bind(this));
        this.replyViewTextBox.addEventListener('keyup', this.enableDisableReplyPostButton.bind(this));
        const editRegionFooter: HTMLElement = createElement('div', { styles: 'display:none', className: 'e-de-cmt-action-button' });
        const postButton: HTMLButtonElement = createElement('button', { className: 'e-de-cmt-post-btn e-de-overlay e-btn e-flat', attrs: { type: 'button' } }) as HTMLButtonElement;
        this.replyPostButton = new Button({ cssClass: 'e-btn e-flat e-primary', iconCss: 'e-de-cmt-post', disabled: true }, postButton);
        this.replyMention= new Mention({
            dataSource: this.owner.documentEditorSettings.mentionSettings.dataSource,
            fields: this.owner.documentEditorSettings.mentionSettings.fields,
            select: this.onSelect.bind(this),
        });
        postButton.addEventListener('click', this.postReply.bind(this));
        postButton.title = localObj.getConstant('Post');
        const cancelButton: HTMLButtonElement = createElement('button', {
            className: 'e-de-cmt-cancel-btn e-btn e-flat',
            attrs: { type: 'button' }
        }) as HTMLButtonElement;
        cancelButton.setAttribute('aria-label', localObj.getConstant('Cancel'));
        this.replyCancelButton = new Button({ cssClass: 'e-btn e-flat', iconCss: 'e-de-cmt-cancel' }, cancelButton);
        cancelButton.addEventListener('click', this.cancelReply.bind(this));
        cancelButton.title = localObj.getConstant('Cancel');
        editRegionFooter.appendChild(postButton);
        editRegionFooter.appendChild(cancelButton);
        editRegionFooter.style.marginTop = "8px";
        this.replyFooter = editRegionFooter;
        this.replyViewContainer.appendChild(this.replyViewTextBox);
        this.replyViewContainer.appendChild(editRegionFooter);
        this.parentElement.appendChild(this.replyViewContainer);
        this.replyMention.appendTo(this.replyViewTextBox);
    }

    private initResolveOption(localObj: L10n): void {
        const editRegionFooter: HTMLElement = createElement('div', { className: 'e-de-cmt-resolve-btn' });
        let wrapperFooterDiv : HTMLElement= createElement('div', { className: 'e-de-cmt-resolve-btn' });
        let reopenDeleteWrapper : HTMLElement = createElement('div', { className: 'e-de-cmt-resolve-btn' });
        const postButton: HTMLButtonElement = createElement('button', { className: 'e-de-cmt-post-btn e-btn e-flat', attrs: { type: 'button' } }) as HTMLButtonElement;
        this.reopenButton = new Button({ cssClass: 'e-btn e-flat', iconCss: 'e-de-cmt-reopen' }, postButton);
        postButton.title = localObj.getConstant('Reopen');
        postButton.setAttribute('aria-label', localObj.getConstant('Reopen'));
        postButton.addEventListener('click', this.reopenButtonClick.bind(this));
        const cancelButton: HTMLButtonElement = createElement('button', {
            className: 'e-de-cmt-cancel-btn e-btn e-flat',
            attrs: { type: 'button' }
        }) as HTMLButtonElement;
        cancelButton.title = localObj.getConstant('Delete');
        cancelButton.setAttribute('aria-label', localObj.getConstant('Delete'));
        this.deleteButton = new Button({ cssClass: 'e-btn e-flat', iconCss: 'e-de-cmt-delete' }, cancelButton);
        cancelButton.addEventListener('click', this.deleteComment.bind(this));
        editRegionFooter.appendChild(postButton);
        editRegionFooter.appendChild(cancelButton);
        wrapperFooterDiv.appendChild(this.resolveDiv);
        reopenDeleteWrapper.appendChild(postButton);
        reopenDeleteWrapper.appendChild(cancelButton);
        editRegionFooter.appendChild(wrapperFooterDiv);
        wrapperFooterDiv.appendChild(reopenDeleteWrapper);
        wrapperFooterDiv.style.display = "flex";
        wrapperFooterDiv.style.justifyContent = "space-between";
        wrapperFooterDiv.style.alignItems = "center";
        reopenDeleteWrapper.style.display = "flex";
        reopenDeleteWrapper.style.justifyContent = "center";
        reopenDeleteWrapper.style.alignItems = "center";
        reopenDeleteWrapper.style.marginTop = "0px";
        this.resolveView = editRegionFooter;
        this.parentElement.appendChild(editRegionFooter);
    }

    private reopenButtonClick(): void {
        this.owner.editorModule.reopenComment(this.comment);
    }
    private deleteComment(): void {
        const eventArgs: CommentDeleteEventArgs = { author: this.comment.author, cancel: false};
        this.owner.trigger(commentDeleteEvent, eventArgs);
        const eventActionArgs: CommentActionEventArgs = { author: this.comment.author, cancel: eventArgs.cancel, type: 'Delete', mentions: this.comment.mentions};
        this.owner.trigger(beforeCommentActionEvent, eventActionArgs);
        if (eventActionArgs.cancel) {
            return;
        }
        this.owner.editorModule.deleteCommentInternal(this.comment);
        if (eventArgs.cancel) {
            return;
        }
    }

    private updateReplyTextAreaHeight(event?: KeyboardEvent): void {
        if (event) {
            this.preventKeyboardShortcuts(event);
        }
        setTimeout(() => {
            if (!isNullOrUndefined(this.replyViewTextBox)) {
                this.replyViewTextBox.style.height = 'auto';
                const scrollHeight: number = this.replyViewTextBox.scrollHeight;
                this.replyViewTextBox.style.height = scrollHeight + 'px';
            }
        });
    }
    private preventKeyboardShortcuts(event: KeyboardEvent): void {
        let key: number = event.which || event.keyCode;
        let ctrl: boolean = (event.ctrlKey || event.metaKey) ? true : ((key === 17) ? true : false); // ctrl detection       
        let shift: boolean = event.shiftKey ? event.shiftKey : ((key === 16) ? true : false); // Shift Key detection        
        let alt: boolean = event.altKey ? event.altKey : ((key === 18) ? true : false); // alt key detection

        // Define the keyboard shortcuts to prevent
        let prevent = false;

        // Bold: Ctrl + B or Cmd + B (Mac)
        if (ctrl && key === 66) prevent = true;
        // Italic: Ctrl + I or Cmd + I (Mac)
        else if (ctrl && key === 73) prevent = true;
        // Underline: Ctrl + U or Cmd + U (Mac)
        else if (ctrl && key === 85) prevent = true;
        // Strikethrough: Alt + Shift + 5 (may vary by browser)
        else if (alt && shift && key === 53) prevent = true;
        // Superscript: Ctrl + . or Cmd + . (Mac)
        else if (ctrl && key === 190) prevent = true;
        // Subscript: Ctrl + , or Cmd + , (Mac)
        else if (ctrl && key === 188) prevent = true;
        // Insert Unordered List: Ctrl + Shift + L or Cmd + Shift + L (Mac)
        else if (ctrl && shift && key === 76) prevent = true;
        // Insert Ordered List: Ctrl + Shift + 7 or Cmd + Shift + 7 (Mac)
        else if (ctrl && shift && key === 55) prevent = true;
        // Remove Formatting: Ctrl + \ or Cmd + \ (Mac)
        else if (ctrl && key === 220) prevent = true;
        // Align Left: Ctrl + Shift + L or Cmd + Shift + L (Mac)
        else if (ctrl && shift && key === 76) prevent = true;
        // Align Center: Ctrl + Shift + E or Cmd + Shift + E (Mac)
        else if (ctrl && shift && key === 69) prevent = true;
        // Align Right: Ctrl + Shift + R or Cmd + Shift + R (Mac)
        else if (ctrl && shift && key === 82) prevent = true;
        // Align Justify: Ctrl + Shift + J or Cmd + Shift + J (Mac)
        else if (ctrl && shift && key === 74) prevent = true;
        // Outdent: Shift + Tab (may vary by browser)
        else if (shift && key === 9) prevent = true;
        // Heading Levels: Ctrl + Alt + 1 to Ctrl + Alt + 6 (may vary by browser) or Cmd + Alt + 1 to Cmd + Alt + 6 (Mac)
        else if (ctrl && alt && (key >= 49 && key <= 54)) prevent = true;
        // Quote: Ctrl + Shift + Q or Cmd + Shift + Q (Mac) (may vary by browser)
        else if (ctrl && shift && key === 81) prevent = true;

        if (prevent) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    private enableDisableReplyPostButton(): void {
        this.replyPostButton.disabled = this.replyViewTextBox.innerText === '';
        if (this.replyPostButton.disabled) {
            classList(this.replyPostButton.element, ['e-de-overlay'], []);
        } else if (this.replyPostButton.element.classList.contains('e-de-overlay')) {
            classList(this.replyPostButton.element, [], ['e-de-overlay']);
        }
    }

    private enableReplyView(): void {
        if (this.commentPane.isEditMode) {
            return;
        }
        const eventArgs: CommentActionEventArgs = { author: this.comment.author, cancel: false, type: 'Reply', mentions: this.comment.mentions };
        this.owner.trigger(beforeCommentActionEvent, eventArgs);
        if (eventArgs.cancel && eventArgs.type === 'Reply') {
            return;
        }
        this.commentPane.currentEditingComment = this;
        this.commentPane.isInsertingReply = true;
        if (this.owner.documentHelper.currentSelectedComment !== this.comment) {
            this.owner.selectionModule.selectComment(this.comment);
        }
        this.commentPane.isEditMode = true;
        //this.replyViewTextBox.readOnly = false;
        this.replyFooter.style.display = 'block';
        setTimeout(() => {
            this.replyViewTextBox.focus();
        });
    }

    private postReply(): void {
        const replyText: string = (this.replyViewTextBox.innerText);
        this.cancelReply();
        this.updateReplyTextAreaHeight();
        this.owner.editorModule.replyComment(this.comment, replyText, this.itemData);
        if (this.itemData) {
            this.itemData = [];
        }
        if (!this.owner.editorModule.isSkipOperationsBuild && !this.owner.editorModule.isRemoteAction) {
            this.owner.fireContentChange();
        }
        this.owner.editorModule.isSkipOperationsBuild = false;
    }

    public cancelReply(): void {
        this.commentPane.currentEditingComment = undefined;
        this.commentPane.isInsertingReply = true;
        this.commentPane.isEditMode = false;
        this.replyPostButton.disabled = true;
        this.replyViewTextBox.innerText = '';
        // this.replyViewTextBox.readOnly = true;
        this.replyFooter.style.display = 'none';

    }
    private updateTextAreaHeight(event?: KeyboardEvent): void {
        if (event) {
            this.preventKeyboardShortcuts(event);
        }
        setTimeout(() => {
            if (!isNullOrUndefined(this.textArea)) {
                this.textArea.style.height = 'auto';
                const scrollHeight: number = this.textArea.scrollHeight;
                this.textArea.style.height = scrollHeight + 'px';
            }
        });
    }

    public showMenuItems(): void {
        if (this.comment.isReply && !this.owner.isReadOnly) {
            if (!this.commentPane.isEditMode && (!isNullOrUndefined(this.comment) && !this.comment.isResolved)) {
                this.menuBar.style.display = 'block';
            }
        }

        const commentStart: CommentCharacterElementBox = this.commentPane.getCommentStart(this.comment);
        if (!isNullOrUndefined(commentStart) && !isNullOrUndefined(commentStart.commentMark)) {
            commentStart.commentMark.classList.add('e-de-cmt-mark-hover');
        }
    }

    public hideMenuItemOnMouseLeave(): void {
        if (this.comment.isReply) {
            if (this.owner.documentHelper.currentSelectedComment !== this.comment.ownerComment) {
                this.hideMenuItems();
            }
        }
        if (this.commentPane) {
            const commentStart: CommentCharacterElementBox = this.commentPane.getCommentStart(this.comment);
            if (!isNullOrUndefined(commentStart) && !isNullOrUndefined(commentStart.commentMark)) {
                commentStart.commentMark.classList.remove('e-de-cmt-mark-hover');
            }
        }
    }

    public hideMenuItems(): void {
        this.menuBar.style.display = 'none';
    }

    public enableDisablePostButton(): void {
        this.postButton.disabled = this.textArea.innerText === '';
        if (this.postButton.disabled) {
            classList(this.postButton.element, ['e-de-overlay'], []);
        } else if (this.postButton.element.classList.contains('e-de-overlay')) {
            classList(this.postButton.element, [], ['e-de-overlay']);
        }
    }

    public editComment(): void {
        if (!isNullOrUndefined(this.commentPane.parentPane) && !this.commentPane.parentPane.postReply) {
            const eventArgs: CommentActionEventArgs = { author: this.comment.author, cancel: false, type: 'Edit', mentions: this.comment.mentions };
            this.owner.trigger(beforeCommentActionEvent, eventArgs);
            if (eventArgs.cancel && eventArgs.type === 'Edit') {
                return;
            }
        }
        this.commentPane.currentEditingComment = this;
        this.commentPane.isInsertingReply = false;
        this.commentPane.isEditMode = true;
        this.commentText.style.display = 'none';
        this.textAreaContainer.style.display = 'block';
        this.commentDate.style.display = 'none';
        this.menuBar.style.display = 'none';
        this.updateTextAreaHeight();
        setTimeout(() => {
            if (this.textArea) {
                this.textArea.focus();
            }
        });
    }

    public resolveComment(): void {
        classList(this.parentElement, ['e-de-cmt-resolved'], []);
        this.resolveDiv.style.display = "inline";
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        this.dropDownButton.items = [{ text: localObj.getConstant('Reopen') }, { text: localObj.getConstant('Delete') }];
    }
 
    public reopenComment(): void {
        classList(this.parentElement, [], ['e-de-cmt-resolved']);
        this.resolveDiv.style.display = "none";
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        this.dropDownButton.items = [{ text: localObj.getConstant('Edit') },
            { text: localObj.getConstant('Delete') },
            { text: localObj.getConstant('Reply') },
            { text: localObj.getConstant('Resolve') }];
        this.showDrawer();
    }

    public postComment(): void {
        this.comment.isPosted = true;
        if (this.itemData) {
            this.comment.mentions = this.itemData;
            this.itemData = [];
        }
        const eventArgs: CommentActionEventArgs = { author: this.comment.author, cancel: false, type: 'Post', text: this.textArea.innerText, mentions: this.comment.mentions};
        this.owner.trigger(beforeCommentActionEvent, eventArgs);
        if (eventArgs.cancel && eventArgs.type === 'Post') {
            return;
        }
        const updatedText: string = this.textArea.innerHTML;
        if (this.owner.editorModule && this.comment.text != '' && (this.comment.text != updatedText)) {
            this.owner.editorModule.initHistory('EditComment');
            let modifiedObject: CommentEditInfo = {
                commentId: this.comment.commentId,
                text: this.comment.text
            };
            this.owner.editorHistoryModule.currentBaseHistoryInfo.modifiedProperties.push(modifiedObject);
            this.owner.editorHistoryModule.currentBaseHistoryInfo.removedNodes.push(this.comment);
            this.owner.editorHistoryModule.updateHistory();
        }
        this.commentText.innerHTML = updatedText;
        this.comment.text = updatedText;
        this.showCommentView();
        if (this.commentPane && this.commentPane.parentPane) {
            this.commentPane.parentPane.isNewComment = false;
        }
        if (!isNullOrUndefined(this.replyViewContainer)) {
            this.replyViewContainer.style.display = '';
        }
        if (!this.owner.editorModule.isSkipOperationsBuild && !this.owner.editorModule.isRemoteAction) {
            this.owner.fireContentChange();
        }
    }

    public showCommentView(): void {
        this.commentPane.isEditMode = false;
        this.textAreaContainer.style.display = 'none';
        this.commentText.style.display = 'block';
        this.commentDate.style.display = 'block';
        this.menuBar.style.display = 'block';
    }

    public cancelEditing(): void {
        this.showCommentView();
        this.textArea.innerHTML = this.comment.text.trim();
        if (this.commentPane.parentPane.isNewComment) {
            if (this.commentPane && this.commentPane.parentPane) {
                this.commentPane.parentPane.isNewComment = false;
            }
            let documentEditor: DocumentEditor = this.owner;
            documentEditor.editorModule.isSkipOperationsBuild = this.owner.enableCollaborativeEditing;
            this.commentPane.parentPane.discardComment(this.comment);
            documentEditor.editorModule.isSkipOperationsBuild = false;
        }
    }

    public showOrHideDrawer(): void {
        if (this.isDrawerExpand) {
            this.hideDrawer();
        } else {
            this.showDrawer();
        }
    }

    public hideDrawer(): void {
        if (this.parentElement) {
            const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
            localObj.setLocale(this.owner.locale);
            const elements: HTMLCollectionOf<Element> = this.parentElement.getElementsByClassName('e-de-cmt-sub-container');
            if (elements.length > 1) {
                for (let i: number = 1; i < elements.length; i++) {
                    (elements[i] as HTMLElement).style.display = 'none';
                }
                this.drawerElement.style.display = 'block';
                classList(this.drawerSpanElement, [], ['e-de-nav-up']);
                this.drawerSpanElement.innerText = '+' + (elements.length - 1) + ' ' + localObj.getConstant('more') + '...';
            }
            this.isDrawerExpand = false;
        }
    }

    public showDrawer(): void {
        if (this.parentElement) {
            const elements: HTMLCollectionOf<Element> = this.parentElement.getElementsByClassName('e-de-cmt-sub-container');
            if (elements.length > 1) {
                for (let i: number = 0; i < elements.length; i++) {
                    (elements[i] as HTMLElement).style.display = 'block';
                }
                this.drawerElement.style.display = 'block';
                this.drawerSpanElement.innerText = '';
                classList(this.drawerSpanElement, ['e-de-nav-up'], []);
            }
            this.isDrawerExpand = true;
        }
    }

    private userOptionSelectEvent(event: MenuEventArgs): void {
        const selectedItem: string = event.item.text;
        const localObj: L10n = new L10n('documenteditor', this.owner.defaultLocale);
        localObj.setLocale(this.owner.locale);
        switch (selectedItem) {
        case localObj.getConstant('Edit'):
            this.editComment();
            break;
        case localObj.getConstant('Reply'):
            this.enableReplyView();
            break;
        case localObj.getConstant('Delete'):
            this.deleteComment();
            break;
        case localObj.getConstant('Resolve'):
            this.owner.editorModule.resolveComment(this.comment);
            break;
        case localObj.getConstant('Reopen'):
            this.owner.editorModule.reopenComment(this.comment);
        }
    }

    public unwireEvent(): void {
        if (this.drawerAction) {
            this.drawerAction.removeEventListener('click', this.showOrHideDrawer.bind(this));
        }
        if (this.textArea) {
            this.textArea.removeEventListener('keydown', this.updateTextAreaHeight.bind(this));
            this.textArea.removeEventListener('keyup', this.enableDisablePostButton.bind(this));

        }
        if (this.postButton) {
            this.postButton.removeEventListener('click', this.postComment.bind(this));
        }
        if (this.cancelButton) {
            this.cancelButton.removeEventListener('click', this.cancelEditing.bind(this));
        }
        if (this.commentView) {
            this.commentView.removeEventListener('click', this.selectComment.bind(this));
            this.commentView.removeEventListener('mouseenter', this.showMenuItems.bind(this));
            this.commentView.removeEventListener('mouseleave', this.hideMenuItemOnMouseLeave.bind(this));
        }
    }

    public destroy(): void {
        this.unwireEvent();
        if (this.comment) {
            this.comment = undefined;
        }
        if (this.dropDownButton) {
            this.dropDownButton.destroy();
        }
        this.dropDownButton = undefined;
        if (this.postButton) {
            this.postButton.destroy();
        }
        this.postButton = undefined;
        if (this.cancelButton) {
            this.cancelButton.destroy();
        }
        this.cancelButton = undefined;
        if (this.replyPostButton) {
            this.replyPostButton.destroy();
            this.replyPostButton = undefined;
        }
        if (this.replyCancelButton) {
            this.replyCancelButton.destroy();
            this.replyCancelButton = undefined;
        }
        if (this.reopenButton) {
            this.reopenButton.destroy();
            this.reopenButton = undefined;
        }
        if (this.deleteButton) {
            this.deleteButton.destroy();
            this.deleteButton = undefined;
        }
        if (this.parentElement) {
            this.parentElement.innerHTML = '';
            if (this.parentElement.parentElement) {
                this.parentElement.parentElement.removeChild(this.parentElement);
            }
        }
        this.parentElement = undefined;
        if (this.commentView) {
            this.commentView.innerHTML = '';
            if (this.commentView.parentElement) {
                this.commentView.parentElement.removeChild(this.commentView);
            }
        }
        this.commentView = undefined;
        if (this.replyViewContainer) {
            this.replyViewContainer.innerHTML = '';
            this.replyViewContainer.remove();
            this.replyViewContainer = null;
        }
        this.replyViewTextBox = undefined;
        this.replyFooter = undefined;
        if (this.resolveView) {
            this.resolveView.innerHTML = '';
            this.resolveView.remove();
            this.resolveView = null;
        }
        this.menuBar = undefined;
        this.drawerAction = undefined;
        this.commentText = undefined;
        this.commentDate = undefined;

        if (this.textAreaContainer) {
            this.textAreaContainer.innerHTML = '';
            this.textAreaContainer.remove();
            this.textAreaContainer = null;
        }
        this.drawerElement = undefined;
        this.drawerSpanElement = undefined;
        this.commentPane = undefined;
        this.owner = undefined;
    }

}
