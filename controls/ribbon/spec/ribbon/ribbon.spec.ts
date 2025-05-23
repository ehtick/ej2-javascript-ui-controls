/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement, getComponent, isNullOrUndefined, remove } from "@syncfusion/ej2-base";
import { Button, CheckBox } from "@syncfusion/ej2-buttons";
import { ComboBox, FilteringEventArgs } from "@syncfusion/ej2-dropdowns";
import { ColorPicker } from "@syncfusion/ej2-inputs";
import { Query } from "@syncfusion/ej2-data";
import { DropDownButton, ItemModel, SplitButton, OpenCloseMenuEventArgs } from "@syncfusion/ej2-splitbuttons";
import { ExpandCollapseEventArgs, ItemOrientation, LauncherClickEventArgs, Ribbon, RibbonItemSize, RibbonItemType, DisplayMode, TabSelectedEventArgs, TabSelectingEventArgs, LayoutSwitchedEventArgs, RibbonLayout } from "../../src/ribbon/base/index";
import { getMemoryProfile, inMB, profile } from "./common.spec";
import { RibbonTabModel } from "../../src/ribbon/models/ribbon-tab-model";
import { BackStageMenu, BackStageMenuModel, FileMenuSettingsModel, RibbonButtonSettings, RibbonButtonSettingsModel, RibbonCollectionModel, RibbonGalleryItemModel, RibbonGallerySettings, RibbonGallerySettingsModel, RibbonGroupButtonItemModel, RibbonGroupButtonSettingsModel, RibbonGroupModel, RibbonItemModel, RibbonSplitButtonSettingsModel, RibbonTooltipModel } from "../../src/ribbon/models/index";
import { RibbonButton, RibbonColorPicker, RibbonContextualTab, RibbonContextualTabSettingsModel, RibbonFileMenu } from "../../src/index";
import { flip } from "@syncfusion/ej2-popups";
import { MenuAnimationSettings } from "@syncfusion/ej2-navigations";

Ribbon.Inject(RibbonColorPicker, RibbonFileMenu, RibbonContextualTab);
function triggerMouseEvent(node: HTMLElement, eventType: string, x?: number, y?: number, relatedTarget?: any) {
    let mouseEve: MouseEvent = document.createEvent("MouseEvents");
    const relatedTargetElement = relatedTarget ? relatedTarget : null;
    if (x && y) {
        mouseEve.initMouseEvent(eventType, true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, relatedTargetElement);
    } else {
        mouseEve.initEvent(eventType, true, true);
    }
    node.dispatchEvent(mouseEve);
}
let dropDownButtonItems: ItemModel[] = [
    { text: 'New tab' },
    { text: 'New window' },
    { text: 'New incognito window' },
    { separator: true },
    { text: 'Print' },
    { text: 'Cast' },
    { text: 'Find' }];
let sportsData: string[] = ['Badminton', 'Cricket', 'Football', 'Golf', 'Tennis'];

describe('Ribbon', () => {
    beforeAll(() => {
        const isDef: any = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending(); // skips test (in Chai)
            return;
        }
    });
    describe('Ribbon DOM', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:600px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });
        it('Initial Rendering', () => {
            let ribbonEle1 = createElement('div', {});
            document.body.appendChild(ribbonEle1);
            ribbon = new Ribbon({
                enablePersistence: true,
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }, {
                    header: "tab2",
                    groups: [{
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            cssClass: 'noitem'
                        }]
                    }, {
                        cssClass: 'nocollection'
                    }]
                }, {
                    cssClass: 'group'
                }]
            }, ribbonEle1);
            expect(ribbon.tabObj).toBeDefined;
            expect(ribbon.tabObj.items.length).toBe(3);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            expect(ribbon.element.querySelector('#tab1_content').innerHTML !== '').toBe(true);
            expect(isNullOrUndefined(ribbon.element.querySelector('#tab1_content').querySelector('#group1'))).toBe(false);
            expect(isNullOrUndefined(ribbon.element.querySelector('#group1').querySelector('#collection1'))).toBe(false);
            expect(isNullOrUndefined(ribbon.element.querySelector('#collection1').querySelector('#item1_container'))).toBe(false);
            expect(isNullOrUndefined(ribbon.element.querySelector('#item1_container').querySelector('#item1'))).toBe(false);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('button');
            ribbon.setProperties({ selectedTab: 1 })
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(2);
            ribbon.setProperties({ selectedTab: 2 })
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(3);
            ribbon.destroy();
            ribbon = undefined;
            remove(ribbonEle1);
        });
        it('overflow mode', () => {
            ribbon = new Ribbon({
                enablePersistence: true,
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }, {
                            id: "collection3",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit1',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }, {
                            id: "collection4",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit2 option',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.overflowMode).toBe('Popup');
        });  
        it('column orientation with 4 items', () => {
            ribbon = new Ribbon({
                enablePersistence: true,
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit1',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit2 option',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
        });
        it('row orientation with 4 collection', () => {
            ribbon = new Ribbon({
                enablePersistence: true,
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }, {
                            id: "collection3",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit1',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }, {
                            id: "collection4",
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit2 option',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(3);

        });
        it('minimized mode- Classic layout', () => {
            ribbon = new Ribbon({
                enablePersistence: true,
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        isCollapsible: false,
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection4",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }, {
                        id: "group2",
                        header: "group2Header",
                        isCollapsible: false,
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection5",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }, {
                        id: "group3",
                        header: "group3Header",
                        isCollapsible: false,
                        orientation: 'Column',
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }, {
                    header: "tab2",
                    groups: [{
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            cssClass: 'noitem'
                        }]
                    }, {
                        cssClass: 'nocollection'
                    }]
                }, {
                    cssClass: 'group'
                }]
            }, ribbonEle);
            containerEle.style.width = '400px';
            ribbon.refreshLayout();
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(1);
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.isMinimized).toBe(false);
            let li: HTMLElement = ribbon.element.querySelector('#tab1_header') as HTMLElement;
            triggerMouseEvent(li, 'dblclick');
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(true);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(1);
            expect(ribbon.isMinimized).toBe(true);
            ribbon.setProperties({ isMinimized: false });
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.isMinimized).toBe(false);
            ribbon.setProperties({ isMinimized: true });
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(true);
            expect(ribbon.isMinimized).toBe(true);
            (ribbon.element.querySelector('.e-ribbon .e-tab-header .e-active .e-tab-text').firstElementChild as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(1);
            expect(ribbon.isMinimized).toBe(false);
        });
        it('minimized mode- Simplified Mode', () => {
            ribbon = new Ribbon({
                enablePersistence: true,
                activeLayout: 'Simplified',
                cssClass: 'customCss',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }, {
                    header: "tab2",
                    groups: [{
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            cssClass: 'noitem'
                        }]
                    }, {
                        cssClass: 'nocollection'
                    }]
                }, {
                    cssClass: 'group'
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.isMinimized).toBe(false);
            let li: HTMLElement = ribbon.element.querySelector('#tab1_header') as HTMLElement;
            triggerMouseEvent(li, 'dblclick');
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(true);
            expect(ribbon.isMinimized).toBe(true);
            ribbon.setProperties({ isMinimized: false });
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.isMinimized).toBe(false);
            ribbon.setProperties({ isMinimized: true });
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(true);
            expect(ribbon.isMinimized).toBe(true);
            (ribbon.element.querySelector('.e-ribbon .e-tab-header .e-active .e-tab-text').firstElementChild as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.isMinimized).toBe(false);
        });
    });
    describe('Null or Undefined value', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });

        it('in Active Layout', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, activeLayout: null }, ribbonEle);
            expect(ribbon.activeLayout).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, activeLayout: undefined }, ribbonEle);
            expect(ribbon.activeLayout).toBe(RibbonLayout.Classic);
        });
        it('in Contextual Tabs', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, contextualTabs: null }, ribbonEle);
            expect(ribbon.contextualTabs).toEqual([]);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, contextualTabs: undefined }, ribbonEle);
            expect(ribbon.contextualTabs).toEqual([]);
        });
        it('in CSS class', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, cssClass: null }, ribbonEle);
            expect(ribbon.cssClass).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, cssClass: undefined }, ribbonEle);
            expect(ribbon.cssClass).toBe('');
        });
        it('in Enable Keytip', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, enableKeyTips: null }, ribbonEle);
            expect(ribbon.enableKeyTips).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, enableKeyTips: undefined }, ribbonEle);
            expect(ribbon.enableKeyTips).toBe(false);
        });
        it('in Enable Persistence', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, enablePersistence: null }, ribbonEle);
            expect(ribbon.enablePersistence).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, enablePersistence: undefined }, ribbonEle);
            expect(ribbon.enablePersistence).toBe(false);
        });
        it('in Enable RTL', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, enableRtl: null }, ribbonEle);
            expect(ribbon.enableRtl).toBe(false);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, enableRtl: undefined }, ribbonEle);
            expect(ribbon.enableRtl).toBe(false);
        });
        it('in Help Pane template', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, helpPaneTemplate: null }, ribbonEle);
            expect(ribbon.helpPaneTemplate).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, helpPaneTemplate: undefined }, ribbonEle);
            expect(ribbon.helpPaneTemplate).toBe('');
        });
        it('in Hide Layout Switcher', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, hideLayoutSwitcher: null }, ribbonEle);
            expect(ribbon.hideLayoutSwitcher).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, hideLayoutSwitcher: undefined }, ribbonEle);
            expect(ribbon.hideLayoutSwitcher).toBe(false);
        });
        it('in Is Minimized', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, isMinimized: null }, ribbonEle);
            expect(ribbon.isMinimized).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, isMinimized: undefined }, ribbonEle);
            expect(ribbon.isMinimized).toBe(false);
        });
        it('in Launcher Icon CSS', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, launcherIconCss: null }, ribbonEle);
            expect(ribbon.launcherIconCss).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, launcherIconCss: undefined }, ribbonEle);
            expect(ribbon.launcherIconCss).toBe('');
        });
        it('in Layout Switcher KeyTip', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, layoutSwitcherKeyTip: null }, ribbonEle);
            expect(ribbon.layoutSwitcherKeyTip).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, layoutSwitcherKeyTip: undefined }, ribbonEle);
            expect(ribbon.layoutSwitcherKeyTip).toBe('');
        });
        it('in Locale', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, locale: null }, ribbonEle);
            expect(ribbon.locale).toBe('en-US');
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, locale: undefined }, ribbonEle);
            expect(ribbon.locale).toBe('en-us');
        });
        it('in Selected Tab', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, selectedTab: undefined }, ribbonEle);
            expect(ribbon.selectedTab).toBe(0);
        });
        it('in Width', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({ tabs: tabs, width: null }, ribbonEle);
            expect(ribbon.width).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({ tabs: tabs, width: undefined }, ribbonEle);
            expect(ribbon.width).toBe('100%');
        });
        it('in Backstage back button', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            let backstageNull: BackStageMenuModel = {
                backButton: { text: null, iconCss: null, visible: null }
            };
            let backstageUndefined: BackStageMenuModel = {
                backButton: { text: undefined, iconCss: undefined, visible: undefined }
            };
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageNull
            }, ribbonEle);
            expect(ribbon.backStageMenu.backButton.text).toBe(null);
            expect(ribbon.backStageMenu.backButton.iconCss).toBe(null);
            expect(ribbon.backStageMenu.backButton.visible).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageUndefined
            }, ribbonEle);
            expect(ribbon.backStageMenu.backButton.text).toBe('');
            expect(ribbon.backStageMenu.backButton.iconCss).toBe('');
            expect(ribbon.backStageMenu.backButton.visible).toBe(true);

        });
        it('in Back stage menu', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            let backstageNull: BackStageMenuModel = {
                text: null,
                keyTip: null,
                visible: null,
                height: null,
                width: null,
                target: null,
                items: null,
                template: null
            };
            let backstageUndefined: BackStageMenuModel = {
                text: undefined,
                keyTip: undefined,
                visible: undefined,
                height: undefined,
                width: undefined,
                target: undefined,
                items: undefined,
                template: undefined
            };
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageNull
            }, ribbonEle);
            expect(ribbon.backStageMenu.text).toBe(null);
            expect(ribbon.backStageMenu.keyTip).toBe(null);
            expect(ribbon.backStageMenu.visible).toBe(null);
            expect(ribbon.backStageMenu.height).toBe(null);
            expect(ribbon.backStageMenu.width).toBe(null);
            expect(ribbon.backStageMenu.target).toBe(null);
            expect(ribbon.backStageMenu.items).toEqual([]);
            expect(ribbon.backStageMenu.template).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageUndefined
            }, ribbonEle);
            expect(ribbon.backStageMenu.text).toBe('File');
            expect(ribbon.backStageMenu.keyTip).toBe('');
            expect(ribbon.backStageMenu.visible).toBe(false);
            expect(ribbon.backStageMenu.height).toBe('auto');
            expect(ribbon.backStageMenu.width).toBe('auto');
            expect(ribbon.backStageMenu.target).toBe(null);
            expect(ribbon.backStageMenu.items).toEqual([]);
            expect(ribbon.backStageMenu.template).toBe('');
        });
        it('in Backstage items', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            let backstageNull: BackStageMenuModel = {
                items: [
                    { id: null, text: null, iconCss: null, content: null, separator: null, isFooter: null, keyTip: null }
                  ],
            };
            let backstageUndefined: BackStageMenuModel = {
                items: [
                    { id: undefined, text: undefined, iconCss: undefined, content: undefined, separator: undefined, isFooter: undefined, keyTip: undefined }
                  ],
            };
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageNull
            }, ribbonEle);
            expect(ribbon.backStageMenu.items[0].text).toBe(null);
            expect(ribbon.backStageMenu.items[0].id).toBe(null);
            expect(ribbon.backStageMenu.items[0].keyTip).toBe(null);
            expect(ribbon.backStageMenu.items[0].content).toBe(null);
            expect(ribbon.backStageMenu.items[0].iconCss).toBe(null);
            expect(ribbon.backStageMenu.items[0].separator).toBe(null);
            expect(ribbon.backStageMenu.items[0].isFooter).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: tabs,
                backStageMenu: backstageUndefined
            }, ribbonEle);
            expect(ribbon.backStageMenu.items[0].text).toBe('');
            expect(ribbon.backStageMenu.items[0].id).toBe('');
            expect(ribbon.backStageMenu.items[0].keyTip).toBe('');
            expect(ribbon.backStageMenu.items[0].content).toBe('');
            expect(ribbon.backStageMenu.items[0].iconCss).toBe('');
            expect(ribbon.backStageMenu.items[0].separator).toBe(false);
            expect(ribbon.backStageMenu.items[0].isFooter).toBe(false);
        });
        it('in Button settings', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: null,
                                cssClass: null,
                                iconCss: null,
                                isToggle: null,
                                isPrimary: null,
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.iconCss).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.isToggle).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.isPrimary).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].buttonSettings = {
                content: undefined,
                cssClass: undefined,
                iconCss: undefined,
                isToggle: undefined,
                isPrimary: undefined,
                htmlAttributes: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.iconCss).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.isToggle).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.isPrimary).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].buttonSettings.htmlAttributes).toEqual({});
        });
        it('in Checkbox Settings', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.CheckBox,
                            allowedSizes: RibbonItemSize.Large,
                            checkBoxSettings: {
                                checked: null,
                                cssClass: null,
                                label: null,
                                labelPosition: null,
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.checked).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.label).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.labelPosition).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].checkBoxSettings = {
                checked: undefined,
                cssClass: undefined,
                label: undefined,
                labelPosition: undefined,
                htmlAttributes: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.checked).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.label).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.labelPosition).toBe('After');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].checkBoxSettings.htmlAttributes).toEqual({});
        });
        it('in Collection', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: null,
                        id: null,
                        cssClass: null
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].id).toBe('tab1_group0_collection1');
            expect(ribbon.tabs[0].groups[0].collections[0].cssClass).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0] = {
                items: undefined,
                id: undefined,
                cssClass: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].id).toBe('tab1_group0_collection1');
            expect(ribbon.tabs[0].groups[0].collections[0].cssClass).toBe('');
        });
        it('in Color picker settings', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.ColorPicker,
                            allowedSizes: RibbonItemSize.Large,
                            colorPickerSettings: {
                                columns: null,
                                cssClass: null,
                                label: null,
                                enableOpacity: null,
                                mode: null,
                                modeSwitcher: null,
                                noColor: null,
                                presetColors: null,
                                showButtons: null,
                                value: null
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.columns).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.label).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.enableOpacity).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.mode).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.modeSwitcher).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.noColor).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.presetColors).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.showButtons).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.value).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].colorPickerSettings = {
                columns: undefined,
                cssClass: undefined,
                label: undefined,
                enableOpacity: undefined,
                mode: undefined,
                modeSwitcher: undefined,
                noColor: undefined,
                presetColors: undefined,
                showButtons: undefined,
                value: undefined,
                htmlAttributes: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.columns).toBe(10);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.label).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.enableOpacity).toBe(true);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.mode).toBe('Palette');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.modeSwitcher).toBe(true);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.noColor).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.presetColors).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.showButtons).toBe(true);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].colorPickerSettings.value).toBe('#008000ff');
        });
        it('in Combo box settings', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.ComboBox,
                            allowedSizes: RibbonItemSize.Large,
                            comboBoxSettings: {
                                allowFiltering: null,
                                autofill: null,
                                cssClass: null,
                                label: null,
                                dataSource: null,
                                filterType: null,
                                footerTemplate: null,
                                groupTemplate: null,
                                headerTemplate: null,
                                index: null,
                                itemTemplate: null,
                                noRecordsTemplate: null,
                                placeholder: null,
                                popupHeight: null,
                                popupWidth: null,
                                showClearButton: null,
                                sortOrder: null,
                                text: null,
                                value: null,
                                width: null
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.allowFiltering).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.autofill).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.label).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.dataSource).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.filterType).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.footerTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.groupTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.headerTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.index).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.itemTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.noRecordsTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.placeholder).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.popupHeight).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.popupWidth).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.showClearButton).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.sortOrder).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.text).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.value).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.width).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.htmlAttributes).toEqual({});
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].comboBoxSettings = {
                allowFiltering: undefined,
                autofill: undefined,
                cssClass: undefined,
                label: undefined,
                dataSource: undefined,
                fields: undefined,
                filterType: undefined,
                footerTemplate: undefined,
                groupTemplate: undefined,
                headerTemplate: undefined,
                index: undefined,
                itemTemplate: undefined,
                noRecordsTemplate: undefined,
                placeholder: undefined,
                popupHeight: undefined,
                popupWidth: undefined,
                showClearButton: undefined,
                sortOrder: undefined,
                text: undefined,
                value: undefined,
                width: undefined,
                htmlAttributes: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.allowFiltering).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.autofill).toBe(true);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.label).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.dataSource).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.filterType).toBe('Contains');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.footerTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.groupTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.headerTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.index).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.itemTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.noRecordsTemplate).toBe('No records found');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.placeholder).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.popupHeight).toBe('300px');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.popupWidth).toBe('100%');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.showClearButton).toBe(true);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.sortOrder).toBe('None');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.text).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.value).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].comboBoxSettings.width).toBe('150px');
        });
        it('in Contextual tab settings', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            let contextualNull: RibbonContextualTabSettingsModel = {
                visible: null,
                isSelected: null,
                tabs: null,
            }
            let contextualUndefined: RibbonContextualTabSettingsModel = {
                visible: undefined,
                isSelected: undefined,
                tabs: undefined,
            }
            ribbon = new Ribbon({
                tabs: tabs,
                contextualTabs: [contextualNull]
            }, ribbonEle);
            expect(ribbon.contextualTabs[0].visible).toBe(null);
            expect(ribbon.contextualTabs[0].isSelected).toBe(null);
            expect(ribbon.contextualTabs[0].tabs).toEqual([]);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: tabs,
                contextualTabs: [contextualUndefined]
            }, ribbonEle);
            expect(ribbon.contextualTabs[0].visible).toBe(false);
            expect(ribbon.contextualTabs[0].isSelected).toBe(false);
            expect(ribbon.contextualTabs[0].tabs).toEqual([]);
        });
        it('in Drop down settings', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                closeActionEvents: null,
                                content: null,
                                cssClass: null,
                                iconCss: null,
                                items: null,
                                target: null,
                                createPopupOnClick: null
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.closeActionEvents).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.iconCss).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.target).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.createPopupOnClick).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].dropDownSettings = {
                closeActionEvents: undefined,
                content: undefined,
                cssClass: undefined,
                iconCss: undefined,
                items: undefined,
                target: undefined,
                createPopupOnClick: undefined,
                htmlAttributes: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.closeActionEvents).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.iconCss).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.target).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.createPopupOnClick).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].dropDownSettings.htmlAttributes).toEqual({});
        });
        it('in File menu settings', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs,
                fileMenu:{
                    text: null,
                    visible: null,
                    menuItems: null,
                    showItemOnClick: null,
                    itemTemplate: null,
                    popupTemplate: null,
                }
            }, ribbonEle);
            expect(ribbon.fileMenu.text).toBe(null);
            expect(ribbon.fileMenu.visible).toBe(null);
            expect(ribbon.fileMenu.menuItems).toEqual([]);
            expect(ribbon.fileMenu.showItemOnClick).toBe(null);
            expect(ribbon.fileMenu.itemTemplate).toBe(null);
            expect(ribbon.fileMenu.popupTemplate).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: tabs,
                fileMenu:{
                    text: undefined,
                    visible: undefined,
                    menuItems: undefined,
                    showItemOnClick: undefined,
                    animationSettings: undefined,
                    itemTemplate: undefined,
                    popupTemplate: undefined,
                    ribbonTooltipSettings: undefined
                }
            }, ribbonEle);
            expect(ribbon.fileMenu.text).toBe('File');
            expect(ribbon.fileMenu.visible).toBe(false);
            expect(ribbon.fileMenu.menuItems).toEqual([]);
            expect(ribbon.fileMenu.showItemOnClick).toBe(false);
            expect(ribbon.fileMenu.itemTemplate).toBe('');
            expect(ribbon.fileMenu.popupTemplate).toBe('');
        });
        it('in Gallery group', function () {
            let tabs: RibbonTabModel[] = [{
                header: "Gallery",
                groups: [{
                    collections: [{
                        items: [{
                            type: RibbonItemType.Gallery,
                            gallerySettings: {
                                groups: [{
                                    items: null,
                                    header: null,
                                    itemWidth: null,
                                    itemHeight: null,
                                    cssClass: null
                                }]
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].header).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].itemWidth).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].itemHeight).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].cssClass).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0]={
                items: undefined,
                itemHeight: undefined,
                itemWidth: undefined,
                header: undefined,
                cssClass: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].header).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].itemWidth).toBe('auto');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].itemHeight).toBe('auto');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].cssClass).toBe('');
        });
        it('in Gallery items', function () {
            let tabs: RibbonTabModel[] = [{
                header: "Gallery",
                groups: [{
                    collections: [{
                        items: [{
                            type: RibbonItemType.Gallery,
                            gallerySettings: {
                                groups: [{
                                    items: [
                                        {
                                            content: null,
                                            iconCss: null,
                                            cssClass: null,
                                            disabled: null
                                        }
                                    ]
                                }]
                            }
                        }]
                    }]
                }]
            }];
            let galleryUndefined: RibbonGalleryItemModel = 
            {
                content: undefined,
                iconCss: undefined,
                cssClass: undefined,
                disabled: undefined,
                htmlAttributes: undefined
            };
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].disabled).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].iconCss).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0] = galleryUndefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].disabled).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups[0].items[0].iconCss).toBe('');
        });
        it('in Gallery settings', function () {
            let galleryNull: RibbonGallerySettingsModel = {
                groups: null,
                itemCount: null,
                selectedItemIndex: null,
                popupHeight: null,
                popupWidth: null,
                template: null,
                popupTemplate: null
            }
            let galleryUndefined: RibbonGallerySettingsModel = {
                groups: undefined,
                itemCount: undefined,
                selectedItemIndex: undefined,
                popupHeight: undefined,
                popupWidth: undefined,
                template: undefined,
                popupTemplate: undefined
            }
            let tabs: RibbonTabModel[] = [{
                header: "Gallery",
                groups: [{
                    collections: [{
                        items: [{
                            type: RibbonItemType.Gallery,
                            gallerySettings: galleryNull
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.itemCount).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.selectedItemIndex).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupHeight).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupWidth).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.template).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupTemplate).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].gallerySettings = galleryUndefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.groups).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.itemCount).toBe(3);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.selectedItemIndex).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupHeight).toBe('auto');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupWidth).toBe('auto');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.template).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].gallerySettings.popupTemplate).toBe('');
        });
        it('in Group button item', function () {
            let groupbuttonUndefined: RibbonGroupButtonItemModel = {
                content: undefined,
                iconCss: undefined,
                keyTip: undefined,
                selected: undefined,
                htmlAttributes: undefined
            }
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.GroupButton,
                            allowedSizes: RibbonItemSize.Large,
                            groupButtonSettings: {
                                items: [
                                    {
                                        content: null,
                                        iconCss: null,
                                        keyTip: null,
                                        selected: null
                                    }
                                ]
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].iconCss).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].keyTip).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].selected).toBe(null);

            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0] = groupbuttonUndefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].iconCss).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].keyTip).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].selected).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items[0].htmlAttributes).toEqual({});
        });
        it('in Group button settings', function () {
            let groupbuttonNull: RibbonGroupButtonSettingsModel = {
                header:null,
                selection: null,
                items: null
            }
            let groupbuttonUndefined: RibbonGroupButtonSettingsModel = {
                header: undefined,
                selection: undefined,
                items: undefined
            }
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.GroupButton,
                            allowedSizes: RibbonItemSize.Large,
                            groupButtonSettings: groupbuttonNull
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.header).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.selection).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items).toEqual([]);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0].groupButtonSettings = groupbuttonUndefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.header).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.selection).toBe('Single');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].groupButtonSettings.items).toEqual([]);
        });
        it('in Group', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    keyTip: null,
                    launcherIconKeyTip: null,
                    collections: null,
                    cssClass: null,
                    id: null,
                    isCollapsed: null,
                    isCollapsible: null,
                    enableGroupOverflow: null,
                    groupIconCss: null,
                    header: null,
                    orientation: null,
                    overflowHeader: null,
                    priority: null,
                    showLauncherIcon: null
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].keyTip).toBe(null);
            expect(ribbon.tabs[0].groups[0].launcherIconKeyTip).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections).toEqual([]);
            expect(ribbon.tabs[0].groups[0].cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].id).toBe('tab1_group0');
            expect(ribbon.tabs[0].groups[0].isCollapsed).toBe(null);
            expect(ribbon.tabs[0].groups[0].isCollapsible).toBe(null);
            expect(ribbon.tabs[0].groups[0].enableGroupOverflow).toBe(null);
            expect(ribbon.tabs[0].groups[0].groupIconCss).toBe(null);
            expect(ribbon.tabs[0].groups[0].header).toBe(null);
            expect(ribbon.tabs[0].groups[0].orientation).toBe(null);
            expect(ribbon.tabs[0].groups[0].overflowHeader).toBe(null);
            expect(ribbon.tabs[0].groups[0].priority).toBe(null);
            expect(ribbon.tabs[0].groups[0].showLauncherIcon).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0] = {
                keyTip: undefined,
                launcherIconKeyTip: undefined,
                collections: undefined,
                cssClass: undefined,
                id: undefined,
                isCollapsed: undefined,
                isCollapsible: undefined,
                enableGroupOverflow: undefined,
                groupIconCss: undefined,
                header: undefined,
                orientation: undefined,
                overflowHeader: undefined,
                priority: undefined,
                showLauncherIcon: undefined
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].keyTip).toBe('');
            expect(ribbon.tabs[0].groups[0].launcherIconKeyTip).toBe('');
            expect(ribbon.tabs[0].groups[0].collections).toEqual([]);
            expect(ribbon.tabs[0].groups[0].cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].id).toBe('tab1_group0');
            expect(ribbon.tabs[0].groups[0].isCollapsed).toBe(false);
            expect(ribbon.tabs[0].groups[0].isCollapsible).toBe(true);
            expect(ribbon.tabs[0].groups[0].enableGroupOverflow).toBe(false);
            expect(ribbon.tabs[0].groups[0].groupIconCss).toBe('');
            expect(ribbon.tabs[0].groups[0].header).toBe('');
            expect(ribbon.tabs[0].groups[0].orientation).toBe(ItemOrientation.Column);
            expect(ribbon.tabs[0].groups[0].overflowHeader).toBe('');
            expect(ribbon.tabs[0].groups[0].priority).toBe(0);
            expect(ribbon.tabs[0].groups[0].showLauncherIcon).toBe(false);
        });
        it('in Item', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            keyTip: null,
                            allowedSizes: null,
                            id: null,
                            cssClass: null,
                            disabled: null,
                            itemTemplate: null,
                            type: null,
                            displayOptions: null,
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].keyTip).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].allowedSizes).toBe(RibbonItemSize.Large + RibbonItemSize.Medium + RibbonItemSize.Small);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].id).toBe('tab1_group0_collection1_item2');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].disabled).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].itemTemplate).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].type).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].displayOptions).toBe(null);
            ribbon.destroy();
            tabs[0].groups[0].collections[0].items[0] = {
                keyTip: undefined,
                allowedSizes: undefined,
                id: undefined,
                cssClass: undefined,
                disabled: undefined,
                itemTemplate: undefined,
                type: undefined,
                displayOptions: undefined,
            }
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].keyTip).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].allowedSizes).toBe(RibbonItemSize.Large + RibbonItemSize.Medium + RibbonItemSize.Small);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].id).toBe('tab1_group0_collection1_item2');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].disabled).toBe(false);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].itemTemplate).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].type).toBe(RibbonItemType.Button);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].displayOptions).toBe(DisplayMode.Auto);

        });
        it('in Split button settings', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.SplitButton,
                            allowedSizes: RibbonItemSize.Large,
                            splitButtonSettings: {
                                closeActionEvents: null,
                                content: null,
                                cssClass: null,
                                iconCss: null,
                                items: null,
                                target: null
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.closeActionEvents).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.iconCss).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.target).toBe(null);
            ribbon.destroy();
            let splitundefined: RibbonSplitButtonSettingsModel = {
                closeActionEvents: undefined,
                content: undefined,
                cssClass: undefined,
                iconCss: undefined,
                items: undefined,
                target: undefined,
                htmlAttributes: undefined
            }
            tabs[0].groups[0].collections[0].items[0].splitButtonSettings = splitundefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.closeActionEvents).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.iconCss).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.items).toEqual([]);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.target).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].splitButtonSettings.htmlAttributes).toEqual({});

        });
        it('in Tab', function () {
            ribbon = new Ribbon({
                tabs: [{
                    keyTip: null,
                    id: null,
                    cssClass: null,
                    groups: null,
                    header: null
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].keyTip).toBe(null);
            expect(ribbon.tabs[0].id).toBe('ribbon_tab0');
            expect(ribbon.tabs[0].cssClass).toBe(null);
            expect(ribbon.tabs[0].groups).toEqual([]);
            expect(ribbon.tabs[0].header).toBe(null);
            ribbon.destroy();
            ribbon = new Ribbon({
                tabs: [{
                    keyTip: undefined,
                    id: undefined,
                    cssClass: undefined,
                    groups: undefined,
                    header: undefined
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].keyTip).toBe('');
            expect(ribbon.tabs[0].id).toBe('ribbon_tab0');
            expect(ribbon.tabs[0].cssClass).toBe('');
            expect(ribbon.tabs[0].groups).toEqual([]);
            expect(ribbon.tabs[0].header).toBe('');
        });
        it('in Tooltip', function () {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            },
                            ribbonTooltipSettings: {
                                cssClass: null,
                                id: null,
                                title: null,
                                content: null,
                                iconCss: null
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.cssClass).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.id).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.title).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.content).toBe(null);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.iconCss).toBe(null);
            ribbon.destroy();
            let tooltipUndefined: RibbonTooltipModel = {
                cssClass: undefined,
                id: undefined,
                title: undefined,
                content: undefined,
                iconCss: undefined
            }
            tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings = tooltipUndefined;
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.cssClass).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.id).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.title).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.content).toBe('');
            expect(ribbon.tabs[0].groups[0].collections[0].items[0].ribbonTooltipSettings.iconCss).toBe('');
        });

    });

    describe('Ribbon Props', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('tabs', () => {
            let tabs: RibbonTabModel[] = [{
                id: 'tab1',
                header: "tab1",
                cssClass:"tab1_class",
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        }]
                    }]
                }]
            }];
            ribbon = new Ribbon({
                tabs: tabs
            }, ribbonEle);
            expect(ribbon.tabObj.items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-tab-header .e-toolbar-item').length).toBe(1);
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            tabs.push({
                id: 'tab2',
                header: "tab2",
                cssClass:"tab2_class",
                groups: [{
                    header: "group2Header",
                    orientation: ItemOrientation.Row,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            allowedSizes: RibbonItemSize.Large,
                            buttonSettings: {
                                content: 'button2',
                                iconCss: 'e-icons e-copy',
                            }
                        }]
                    }]
                }]
            });
            ribbon.setProperties({ tabs: tabs });
            expect(ribbon.tabObj.items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-tab-header .e-toolbar-item').length).toBe(2);
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            ribbon.setProperties({ selectedTab: 1 });
            tabs.splice(1, 1);
            ribbon.setProperties({ tabs: tabs, selectedTab: 0 });
            expect(ribbon.tabObj.items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-tab-header .e-toolbar-item').length).toBe(1);
        });
        it('width', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                width: '300px',
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.style.width).toBe('300px');
            ribbon.setProperties({ width: '400px' });
            expect(ribbon.element.style.width).toBe('400px');
        });
        it('cssClass', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.classList.contains('oldCss')).toBe(true);
            expect(ribbon.element.classList.contains('newClass')).toBe(false);
            ribbon.setProperties({ cssClass: 'newClass' });
            expect(ribbon.element.classList.contains('newClass')).toBe(true);
            expect(ribbon.element.classList.contains('oldCss')).toBe(false);
        });
        it('enablePersistence', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect((ribbon.element.querySelector('#item1') as any).ej2_instances[0].enablePersistence).toBe(false);
            expect((ribbon.element.querySelector('#item2') as any).ej2_instances[0].enablePersistence).toBe(false);
            expect((ribbon.element.querySelector('#item3') as any).ej2_instances[0].enablePersistence).toBe(false);
            expect((ribbon.element.querySelector('#item4') as any).ej2_instances[0].enablePersistence).toBe(false);
            expect((ribbon.element.querySelector('#item5') as any).ej2_instances[0].enablePersistence).toBe(false);
            expect((ribbon.element.querySelector('#item6') as any).ej2_instances[0].enablePersistence).toBe(false);
            ribbon.setProperties({ enablePersistence: true });
            expect((ribbon.element.querySelector('#item1') as any).ej2_instances[0].enablePersistence).toBe(true);
            expect((ribbon.element.querySelector('#item2') as any).ej2_instances[0].enablePersistence).toBe(true);
            expect((ribbon.element.querySelector('#item3') as any).ej2_instances[0].enablePersistence).toBe(true);
            expect((ribbon.element.querySelector('#item4') as any).ej2_instances[0].enablePersistence).toBe(true);
            expect((ribbon.element.querySelector('#item5') as any).ej2_instances[0].enablePersistence).toBe(true);
            expect((ribbon.element.querySelector('#item6') as any).ej2_instances[0].enablePersistence).toBe(true);
        });
        it('animation',() => {
            ribbon = new Ribbon({
                tabAnimation : {previous : {effect : 'None',duration : 0,easing : 'ease'},next : {effect : 'None',duration : 0,easing : 'ease'}},
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabAnimation.previous.effect).toBe('None');
            expect(ribbon.tabAnimation.previous.duration).toBe(0);
            expect(ribbon.tabAnimation.previous.easing).toBe('ease');
            expect(ribbon.tabAnimation.next.effect).toBe('None');
            expect(ribbon.tabAnimation.next.duration).toBe(0);
            expect(ribbon.tabAnimation.next.easing).toBe('ease');
        });
        it('activeLayout property with enablePersistence', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                enablePersistence: true,
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.activeLayout).toBe('Classic');
            ribbon.refreshLayout();
            expect(ribbon.activeLayout).toBe('Classic');
            ribbon.setProperties({ activeLayout: 'Simplified' });
            expect(ribbon.activeLayout).toBe('Simplified');
            ribbon.refreshLayout();
            expect(ribbon.activeLayout).toBe('Simplified');
            ribbon.setProperties({ enablePersistence: false });
            expect((ribbon.activeLayout) === 'Simplified').toBe(true);
            ribbon.refreshLayout();
            expect((ribbon.activeLayout) === 'Classic').toBe(false);
        });
        it('enableRtl', () => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }, {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }]
                        }]
                    }]
                }, {
                    header: "tab2",
                    groups: [{
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('.e-ribbon-tab').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item1').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item2').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item3').closest('.e-split-btn-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item4').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item5').closest('.e-colorpicker-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item6').closest('.e-ddl').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-rtl')).toBe(false);
            ribbon.enableRtl = true;
            ribbon.dataBind();
            expect(ribbon.element.classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('.e-ribbon-tab').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item1').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item2').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item3').closest('.e-split-btn-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item4').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item5').closest('.e-colorpicker-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item6').closest('.e-ddl').classList.contains('e-rtl')).toBe(true);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-rtl')).toBe(true);
            ribbon.setProperties({ enableRtl: false });
            expect(ribbon.element.classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('.e-ribbon-tab').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item1').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item2').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item3').closest('.e-split-btn-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item4').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item5').closest('.e-colorpicker-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item6').closest('.e-ddl').classList.contains('e-rtl')).toBe(false);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-rtl')).toBe(false);
        });
        it('locale', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect((ribbon.element.querySelector('#item1') as any).ej2_instances[0].locale).toBe('en-us');
            expect((ribbon.element.querySelector('#item2') as any).ej2_instances[0].locale).toBe('en-us');
            expect((ribbon.element.querySelector('#item3') as any).ej2_instances[0].locale).toBe('en-us');
            expect((ribbon.element.querySelector('#item4') as any).ej2_instances[0].locale).toBe('en-us');
            expect((ribbon.element.querySelector('#item5') as any).ej2_instances[0].locale).toBe('en-us');
            expect((ribbon.element.querySelector('#item6') as any).ej2_instances[0].locale).toBe('en-us');
            ribbon.setProperties({ locale: 'de' });
            expect((ribbon.element.querySelector('#item1') as any).ej2_instances[0].locale).toBe('de');
            expect((ribbon.element.querySelector('#item2') as any).ej2_instances[0].locale).toBe('de');
            expect((ribbon.element.querySelector('#item3') as any).ej2_instances[0].locale).toBe('de');
            expect((ribbon.element.querySelector('#item4') as any).ej2_instances[0].locale).toBe('de');
            expect((ribbon.element.querySelector('#item5') as any).ej2_instances[0].locale).toBe('de');
            expect((ribbon.element.querySelector('#item6') as any).ej2_instances[0].locale).toBe('de');
        });
        it('selectedTab', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                tabAnimation: { previous: { effect: 'None' }, next: { effect: 'None' } },
                locale: 'en-us',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.items.length).toBe(2);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            expect((ribbon.tabObj.items[1].header.text as HTMLElement).outerHTML).toBe('<span id="tab2_header">tab2</span>');
            expect((ribbon.element.querySelector('.e-tab-header .e-active') as HTMLElement).innerText.toLowerCase()).toBe('tab1');
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            ribbon.setProperties({ tabAnimation: { previous: { effect: 'None' }, next: { effect: 'None' } } });
            ribbon.dataBind();
            ribbon.setProperties({ selectedTab: 1 });
            expect((ribbon.element.querySelector('.e-tab-header .e-active') as HTMLElement).innerText.toLowerCase()).toBe('tab2');
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
        });
        it('activeLayout', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Small,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Medium,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group1Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.CheckBox,
                                allowedSizes: RibbonItemSize.Medium,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Template,
                                allowedSizes: RibbonItemSize.Small,
                                itemTemplate: template1
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            ribbon.setProperties({ activeLayout: 'Classic' });
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Classic');
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(1);
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
        });
        it('aria label attribute for button', () => {
            ribbon = new Ribbon({
                cssClass: 'oldCss',
                locale: 'en-us',
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    iconCss: 'e-icons e-copy'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[0].getElementsByTagName('button')[0].hasAttribute('aria-label')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[0].getElementsByTagName('button')[0].getAttribute('aria-label')).toBe('Cut');
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[1].getElementsByTagName('button')[0].hasAttribute('aria-label')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[1].getElementsByTagName('button')[0].getAttribute('aria-label')).toBe('button');
        });
    });
    describe('Ribbon Methods', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container'});
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });
        it('get item', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",
                    groups: [{
                        header: "Clipboard",
                        collections: [{
                            items: [{
                                id: "paste-button",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        }, {
                            items: [{
                                id: "cut-button",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "copy-button",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);

            let item1 = ribbon.getItem('paste-button');
            item1.splitButtonSettings.content = "Apply";
            ribbon.updateItem(item1);
            expect((ribbon.element.querySelector('#paste-button_dropdownbtn') as HTMLElement).innerText).toBe('Apply');
            let item2 = ribbon.getItem('cut-button');
            item2.disabled = true;
            ribbon.updateItem(item2);
            expect((ribbon.element.querySelector('#cut-button') as HTMLButtonElement).disabled).toBe(true);
        });
        it('add/remove tab', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.items.length).toBe(1);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);

            let tab: RibbonTabModel = {
                cssClass: "tab3CSS",
                id: 'newTab',
                header: "tab2",
                groups: [{
                    header: "group2Header",
                    orientation: 'Row',
                    collections: [{
                        items: [{
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }, {
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit1',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }, {
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit2 option',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }]
                    }]
                }]
            }
            ribbon.addTab(tab);
            expect(ribbon.tabObj.items.length).toBe(2);
            ribbon.setProperties({ tabAnimation: { previous: { effect: "None" }, next: { effect: "None" } } });
            ribbon.selectTab('newTab');
            expect((ribbon.tabObj.items[1].header.text as HTMLElement).outerHTML).toBe('<span id="newTab_header">tab2</span>');
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            ribbon.removeTab('sometab');//wrong ID
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(2);
            ribbon.removeTab('newTab');
            expect(ribbon.tabObj.items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            ribbon.addTab(tab, 'tab1', false);// new tab before the current tab
            expect(ribbon.tabObj.items.length).toBe(2);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="newTab_header">tab2</span>');
            expect((ribbon.tabObj.items[1].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            ribbon.removeTab('newTab');
            expect(ribbon.tabObj.items.length).toBe(1);
            ribbon.addTab(tab, 'tab1', true); // new tab after the current tab
            expect(ribbon.tabObj.items.length).toBe(2);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            expect((ribbon.tabObj.items[1].header.text as HTMLElement).outerHTML).toBe('<span id="newTab_header">tab2</span>');

            //To cover the wrong ID scenario, remove before render
            let tab1: RibbonTabModel = {
                header: "tab3",
                id: 'tab33',
                groups: [{
                    header: "group1Header",
                    orientation: ItemOrientation.Column,
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button23',
                                iconCss: 'e-icons e-copy',
                            }
                        }, {
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button33',
                                iconCss: 'e-icons e-copy',
                            }
                        }, {
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button43',
                                iconCss: 'e-icons e-copy',
                            }
                        }, {
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button53',
                                iconCss: 'e-icons e-copy',
                            }
                        }]
                    }]
                }]
            };
            ribbon.addTab(tab1, 'tab5', true); //wrong ID
            expect(ribbon.tabObj.items.length).toBe(3);
            expect((ribbon.tabObj.items[2].header.text as HTMLElement).outerHTML).toBe('<span id="tab33_header">tab3</span>');
            ribbon.removeTab('tab33'); //Remove before tab content render
            ribbon.addTab(tab1);
            ribbon.setProperties({ selectedTab: 2 });
            ribbon.removeTab('tab33'); //Remove a not rendered item
        });
        it('add/remove group', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);

            let group: RibbonGroupModel = {
                header: "group2Header",
                id: 'newGroup',
                orientation: 'Row',
                collections: [{
                    items: [{
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }, {
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit1',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }, {
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        displayOptions: DisplayMode.Overflow,
                        dropDownSettings: {
                            content: 'Edit2 option',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }]
                }]
            }
            ribbon.addGroup('tab1', group);
            expect(ribbon.tabs[0].groups.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[1] as HTMLElement).innerText).toBe('group2Header');
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            ribbon.removeGroup('someGroup');
            expect(ribbon.tabs[0].groups.length).toBe(2);
            ribbon.removeGroup('newGroup');
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            ribbon.addGroup('tab1', group, 'group1', false);
            expect(ribbon.tabs[0].groups.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group2Header');
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[1] as HTMLElement).innerText).toBe('group1Header');
            ribbon.removeGroup('newGroup');
            expect(ribbon.tabs[0].groups.length).toBe(1);
            ribbon.addGroup('tab1', group, 'group1', false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.tabs[0].groups.length).toBe(2);
            ribbon.removeGroup('newGroup');
            expect(ribbon.tabs[0].groups.length).toBe(1);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            ribbon.addGroup('tab1', group, 'group1', true);
            expect(ribbon.tabs[0].groups.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[1] as HTMLElement).innerText).toBe('group2Header');
            ribbon.addGroup('tab5', group);
        });
        it('add/remove collection', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            cssClass: 'oldcss',
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }, {
                    header: "tab2",
                    id: 'tab2',
                    groups: [{
                        header: "group1Header",
                        id: 'group2',
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }, {
                            id: "collection3",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }, {
                            id: "collection4",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }, {
                            id: "collection5",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button5',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);

            let collection: RibbonCollectionModel = {
                id: 'newCollection',
                cssClass: 'newcss',
                items: [{
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit1',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    displayOptions: DisplayMode.Overflow,
                    dropDownSettings: {
                        content: 'Edit2 option',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }]
            }
            ribbon.addCollection('group1', collection);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('oldcss')).toBe(true);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[1] as HTMLElement).classList.contains('newcss')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            ribbon.removeCollection('someCollection');
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(2);
            ribbon.removeCollection('newCollection');
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('oldcss')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            ribbon.addCollection('group1', collection, 'collection1', false);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('newcss')).toBe(true);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[1] as HTMLElement).classList.contains('oldcss')).toBe(true);
            ribbon.removeCollection('newCollection');
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            ribbon.addCollection('group1', collection, 'collection1', false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('newcss')).toBe(true);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[1] as HTMLElement).classList.contains('oldcss')).toBe(true);
            ribbon.removeCollection('newCollection');
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            ribbon.addCollection('group1', collection, 'collection1', true);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('oldcss')).toBe(true);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[1] as HTMLElement).classList.contains('newcss')).toBe(true);

            //to cover not rendered scenario ;
            let collection1: RibbonCollectionModel = {
                cssClass: 'newcss',
                id: 'customCol',
                items: [{
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }]
            }
            ribbon.addCollection('group20', [collection1].slice()[0])//wrong group
            ribbon.addCollection('group2', [collection1].slice()[0], 'someCollection', true);//add a collection for tab which is not rendered + wrong target
            ribbon.removeCollection('customCol');//remove a collection from tab which is not rendered
            ribbon.setProperties({ tabAnimation: { previous: { effect: "None" }, next: { effect: "None" } } });
            ribbon.selectTab('tab2');
            ribbon.removeCollection('collection5');//remove a collection  not rendered but tab rendered
        });
        it('add/remove item', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        },
                        ]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        },
                        ]
                    }]
                }, {
                    header: "tab2",
                    id: "tab2",
                    groups: [{
                        header: "group1Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button5',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);

            let item: RibbonItemModel = {
                type: RibbonItemType.DropDown,
                allowedSizes: RibbonItemSize.Small,
                displayOptions: DisplayMode.Classic | DisplayMode.Simplified,
                id: 'newItem',
                dropDownSettings: {
                    content: 'Edit',
                    iconCss: 'e-icons e-edit',
                    items: dropDownButtonItems
                }
            }
            ribbon.addItem('collection1', item);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[1].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            ribbon.removeItem('someItem');
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            ribbon.removeItem('newItem');
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            ribbon.addItem('collection1', item);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[1].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            ribbon.removeItem('newItem');
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            ribbon.addItem('collection2', item);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[1].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(0);
            ribbon.removeItem('newItem');
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(0);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Classic');
            ribbon.addItem('collection1', item, 'item1', false);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[1].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            ribbon.removeItem('newItem');
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            ribbon.addItem('collection1', item, 'item1', true);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(false);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[1].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            //to cover not rendered scenario ;
            let item1: RibbonItemModel = {
                type: RibbonItemType.DropDown,
                allowedSizes: RibbonItemSize.Small,
                dropDownSettings: {
                    content: 'Edit',
                    iconCss: 'e-icons e-edit',
                    items: dropDownButtonItems
                }
            }
            ribbon.addItem('collection1', [item1].slice()[0], 'item15', true); //wrong target
            ribbon.addItem('collection10', [item1].slice()[0]);//wrong collection
            ribbon.removeItem('item5');//remove an item from tab which is not rendered
            ribbon.addItem('collection2', [item1].slice()[0], 'item2', false);//add an item from tab which is not rendered
            ribbon.setProperties({ tabAnimation: { previous: { effect: "None" }, next: { effect: "None" } } });
            ribbon.selectTab('tab2');
            ribbon.removeItem('item4');//remove an item  not rendered but tab rendered
        });
        it('update tab', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.items.length).toBe(1);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">tab1</span>');
            expect(document.querySelector('#e-item-ribbon_tab_0').classList.contains('tabCss')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            // for coverage index === -1
            let tab1: RibbonTabModel = {
                id: 'tab3',
            }
            ribbon.updateTab(tab1);
            let tab: RibbonTabModel = {
                id: 'tab1',
                cssClass: "tabUpdatedCSS",
                header: "Updated Header",
                groups: [{
                    id: "group1",
                    header: "group1Header",
                    orientation: 'Row',
                    collections: [{
                        items: [{
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }, {
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit1',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }, {
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit2 option',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }]
                    }]
                }, {
                    id: "group2",
                    header: "group2Header",
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        },]
                    }]
                }]
            }
            ribbon.updateTab(tab);
            expect(ribbon.tabObj.items.length).toBe(1);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">Updated Header</span>');
            expect(document.querySelector('#e-item-ribbon_tab_0').classList.contains('tabCss')).toBe(false);
            expect(document.querySelector('#e-item-ribbon_tab_0').classList.contains('tabUpdatedCSS')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            containerEle.style.width = '200px';
            ribbon.refreshLayout();
            let newtab: RibbonTabModel = {
                id: 'tab1',
                header: "New Header",
                groups: [{
                    id: "group1",
                    header: "group1Header",
                    orientation: 'Row',
                    collections: [{
                        items: [{
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }, {
                            type: RibbonItemType.DropDown,
                            allowedSizes: RibbonItemSize.Large,
                            dropDownSettings: {
                                content: 'Edit1',
                                iconCss: 'e-icons e-edit',
                                items: dropDownButtonItems
                            }
                        }]
                    }]
                }, {
                    id: "group2",
                    header: "group2Header",
                    collections: [{
                        items: [{
                            type: RibbonItemType.Button,
                            buttonSettings: {
                                content: 'button1',
                                iconCss: 'e-icons e-cut',
                            }
                        },]
                    }]
                }]
            }
            ribbon.updateTab(newtab);
            expect(ribbon.tabObj.items.length).toBe(1);
            expect((ribbon.tabObj.items[0].header.text as HTMLElement).outerHTML).toBe('<span id="tab1_header">New Header</span>');
            expect(document.querySelector('#e-item-ribbon_tab_0').classList.contains('tabCss')).toBe(false);
            expect(document.querySelector('#e-item-ribbon_tab_0').classList.contains('tabUpdatedCSS')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-tab-item').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
        });
        it('update group', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        cssClass: "Group2CSS",
                        showLauncherIcon: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            // for coverage itemProp === null
            let group3: RibbonGroupModel = {
                id: 'group5',
            }
            ribbon.updateGroup(group3);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect(document.querySelector('#group1').classList.contains('Group2CSS')).toBe(true);
            expect(ribbon.element.querySelector('#group1_container').classList.contains('e-ribbon-launcher')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(false);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.activeLayout).toBe('Classic');

            let group: RibbonGroupModel = {
                id: 'group1',
                header: "group1UpdatedHeader",
                showLauncherIcon: false,
                groupIconCss: 'e-icons e-paste',
                cssClass: "updatedGroup2CSS",
                orientation: 'Row',
                collections: [{
                    items: [{
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    },{
                        id: "item3",
                        type: RibbonItemType.Button,
                        buttonSettings: {
                            content: 'button3',
                            iconCss: 'e-icons e-cut',
                        }
                    }, {
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        displayOptions: DisplayMode.Overflow,
                        dropDownSettings: {
                            content: 'Edit2 option',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }]
                }]
            }
            ribbon.updateGroup(group);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1UpdatedHeader');
            expect(document.querySelector('#group1').classList.contains('Group2CSS')).toBe(false);
            expect(document.querySelector('#group1').classList.contains('updatedGroup2CSS')).toBe(true);
            expect(ribbon.element.querySelector('#group1_container').classList.contains('e-ribbon-launcher')).toBe(false);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(false);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            containerEle.style.width = '200px';
            ribbon.refreshLayout();
            let groupHeader: RibbonGroupModel = {
                id: 'group1',
                header: "group1NewHeader",
                showLauncherIcon: true,
            }
            ribbon.updateGroup(groupHeader);
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            expect((document.body.querySelector('#group1_header') as HTMLElement).innerText).toBe('group1NewHeader');
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.activeLayout).toBe('Classic');
            expect(ribbon.element.querySelector('#group1_container').classList.contains('e-ribbon-launcher')).toBe(true);
            containerEle.style.width = '130px';
            ribbon.refreshLayout();
            let overflowHeader: RibbonGroupModel = {
                id: 'group1',
                header: "group1overflowHeader",
                showLauncherIcon: false,
            }
            ribbon.updateGroup(overflowHeader);
            expect((ribbon.element.querySelector('#group1_overflow_dropdown') as HTMLElement).innerText).toBe('group1overflowHeader');
            expect(document.body.querySelector('#group1_overflow_container').querySelectorAll('.e-btn-icon').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            containerEle.style.width = '600px';
            ribbon.refreshLayout();
            let group1: RibbonGroupModel = {
                id: 'group1',
                enableGroupOverflow: true,
            }
            ribbon.updateGroup(group1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            let group2: RibbonGroupModel = {
                id: 'group1',
                enableGroupOverflow: false,
                collections: [{
                    items: [{
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }, {
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit1',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }, {
                        type: RibbonItemType.DropDown,
                        allowedSizes: RibbonItemSize.Large,
                        dropDownSettings: {
                            content: 'Edit2 option',
                            iconCss: 'e-icons e-edit',
                            items: dropDownButtonItems
                        }
                    }]
                }]
            }
            ribbon.updateGroup(group2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.activeLayout).toBe('Classic');
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(false);
            let newGroup1: RibbonGroupModel = {
                id: 'group1',
                orientation: 'Column',
            }
            ribbon.updateGroup(newGroup1);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(false);

        });
        it('update group in simplified mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(false);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            let group: RibbonGroupModel = {
                id: 'group1',
                collections: [{
                    id: "collection1",
                    items: [{
                        id: "item1",
                        type: RibbonItemType.Button,
                        buttonSettings: {
                            content: 'button1',
                            iconCss: 'e-icons e-cut',
                        }
                    },{
                        id: "item2",
                        type: RibbonItemType.Button,
                        displayOptions: DisplayMode.Simplified,
                        buttonSettings: {
                            content: 'button2',
                            iconCss: 'e-icons e-copy',
                        }
                    }]
                }]
            }
            ribbon.updateGroup(group);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
        });
        it('updateGroup method with overlow in simplified mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-group-header')[0] as HTMLElement).innerText).toBe('group1Header');
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-column')).toBe(true);
            expect(ribbon.element.querySelector('#group1_content').classList.contains('e-ribbon-row')).toBe(false);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            let group: RibbonGroupModel = {
                id: 'group1',
                collections: [{
                    id: "collection1",
                    items: [{
                        id: "item1",
                        type: RibbonItemType.Button,
                        buttonSettings: {
                            content: 'button1',
                            iconCss: 'e-icons e-cut',
                        }
                    },{
                        id: "item2",
                        type: RibbonItemType.Button,
                        displayOptions: DisplayMode.Simplified,
                        buttonSettings: {
                            content: 'button2',
                            iconCss: 'e-icons e-copy',
                        }
                    }]
                }]
            }
            ribbon.updateGroup(group);
            expect(ribbon.tabs[0].groups.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
        });
        it('update collection', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            cssClass: 'oldcss',
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            // for coverage itemProp === null
            let collection5: RibbonCollectionModel = {
                id: 'collection7'
            }
            ribbon.updateCollection(collection5);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('oldcss')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            let collection: RibbonCollectionModel = {
                id: 'collection1',
                cssClass: 'newcss'
            }
            ribbon.updateCollection(collection);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            expect((ribbon.element.querySelectorAll('.e-ribbon-collection')[0] as HTMLElement).classList.contains('newcss')).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.activeLayout).toBe('Classic');
            let newCollection: RibbonCollectionModel = {
                id: 'collection1',
                items: [{
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit1',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    id: "item3",
                    type: RibbonItemType.Button,
                    buttonSettings: {
                        content: 'button3',
                        iconCss: 'e-icons e-cut',
                    }
                },{
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    displayOptions: DisplayMode.Overflow,
                    dropDownSettings: {
                        content: 'Edit2 option',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }]
            }
            ribbon.updateCollection(newCollection);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
        });
        it('Should check Color Picker value', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            //Check colorpicker value set correctly default value
            expect((getComponent('item1', ColorPicker) as ColorPicker).value.slice(0, -2)).toBe('#123456');
            //Colorpicker value updated correctly when switching display modes 
            ribbon.ribbonColorPickerModule.updateColorPicker({ value: '#FF0000' }, 'item1');
            ribbon.activeLayout = 'Simplified'
            expect((getComponent('item1', ColorPicker) as ColorPicker).value).toBe('#FF0000');
        });
        it('update collection in simplified mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections.length).toBe(1);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            let newCollection: RibbonCollectionModel = {
                id: 'collection1',
                items: [{
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    dropDownSettings: {
                        content: 'Edit1',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }, {
                    type: RibbonItemType.DropDown,
                    allowedSizes: RibbonItemSize.Small,
                    displayOptions: DisplayMode.Overflow,
                    dropDownSettings: {
                        content: 'Edit2 option',
                        iconCss: 'e-icons e-edit',
                        items: dropDownButtonItems
                    }
                }]
            }
            ribbon.updateCollection(newCollection);
            expect(ribbon.element.querySelectorAll('.e-ribbon-collection').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
        });
        it('update item', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                cssClass: 'oldcss',
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item2",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        },
                        ]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            // for coverage itemProp === null
            let item5: RibbonItemModel = {
                id: 'item10'
            }
            ribbon.updateItem(item5);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('oldcss')).toBe(true);

            let item: RibbonItemModel = {
                id: 'item1',
                type: RibbonItemType.DropDown,
                disabled: true,
                cssClass: 'newcss',
                dropDownSettings: {
                    content: 'Edit',
                    iconCss: 'e-icons e-edit',
                    items: dropDownButtonItems
                }
            }
            ribbon.updateItem(item);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('oldcss')).toBe(false);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('newcss')).toBe(true);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-disabled')).toBe(true);
            let newItem: RibbonItemModel = {
                id: 'item1',
                disabled: false,
                allowedSizes: RibbonItemSize.Large,
                displayOptions: DisplayMode.Overflow,
            }
            ribbon.updateItem(newItem);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-disabled')).toBe(false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            let overflowItem: RibbonItemModel = {
                id: 'item2',
                displayOptions: DisplayMode.Simplified
            }
            ribbon.updateItem(overflowItem);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            let newItems: RibbonItemModel = {
                id: 'item1',
                displayOptions: DisplayMode.Simplified
            }
            ribbon.updateItem(newItems);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
        });
        it('update item in simplified mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                cssClass: 'oldcss',
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item2",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        },
                        ]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('oldcss')).toBe(true);
            let item: RibbonItemModel = {
                id: 'item1',
                type: RibbonItemType.DropDown,
                disabled: true,
                cssClass: 'newcss',
                ribbonTooltipSettings: {
                    title: 'Edit',
                    iconCss: 'e-icons e-edit',
                    content: 'Edit content here.</br> Add content on the clipboard to your document.'
                },
                dropDownSettings: {
                    content: 'Edit',
                    iconCss: 'e-icons e-edit',
                    items: dropDownButtonItems
                }
            }
            ribbon.updateItem(item);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect((ribbon.element.querySelectorAll('.e-ribbon-item')[0].firstElementChild).classList.contains('e-dropdown-btn')).toBe(true);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('oldcss')).toBe(false);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('newcss')).toBe(true);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-disabled')).toBe(true);
            let newItem: RibbonItemModel = {
                id: 'item1',
                displayOptions: DisplayMode.Overflow,
            }
            ribbon.updateItem(newItem);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
            (ribbon.element.querySelector('#group1_sim_grp_overflow') as HTMLElement).click();
            expect(document.body.querySelector('#group1_sim_grp_overflow-popup').querySelectorAll('.e-ribbon-item').length).toBe(2);
        });
        it('update a item size using updateItem method', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        header: "group1Header",
                        orientation: 'Column',
                        id: 'group1',
                        collections: [{
                            id: 'collection1',
                            items: [{
                                id: 'item1',
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                splitButtonSettings: {
                                    content: 'cut',
                                    iconCss: 'e-icons e-cut'
                                }
                            }]
                        }]
                    }, {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-ribbon-medium-item')).toBe(true);
            let newItem1: RibbonItemModel = {
                id: 'item1',
                allowedSizes: RibbonItemSize.Large,
            }
            ribbon.updateItem(newItem1);
            expect(ribbon.tabs[0].groups[0].collections[0].items.length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(2);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-ribbon-large-item')).toBe(true);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            let newItem2: RibbonItemModel = {
                id: 'item1',
                displayOptions: DisplayMode.Overflow,
            }
            ribbon.updateItem(newItem2);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(1);
        });
        it('enable/disable item', () => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = '<button id="btn2" class="tempContent">Button2</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }, {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                id: "item8",
                                type: RibbonItemType.Template,
                                itemTemplate: template2,
                                disabled: true
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item2').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item3').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item4').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item5').parentElement.querySelector('.e-dropdown-btn').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item6').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item7').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item8').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item8').classList.contains('e-disabled')).toBe(true);
            ribbon.disableItem('item1');
            ribbon.disableItem('item2');
            ribbon.disableItem('item3');
            ribbon.disableItem('item4');
            ribbon.disableItem('item5');
            ribbon.disableItem('item6');
            ribbon.disableItem('item7');
            //To cover coverage when click disable button twice
            ribbon.disableItem('item7');
            expect(ribbon.element.querySelector('#item1').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item2').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item3').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item4').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item5').parentElement.querySelector('.e-dropdown-btn').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item6').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item7').hasAttribute('disabled')).toBe(true);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-disabled')).toBe(true);
            ribbon.enableItem('item1');
            ribbon.enableItem('item2');
            ribbon.enableItem('item3');
            ribbon.enableItem('item4');
            ribbon.enableItem('item5');
            ribbon.enableItem('item6');
            ribbon.enableItem('item7');
            //To cover coverage when click enable button twice
            ribbon.enableItem('item7');
            expect(ribbon.element.querySelector('#item1').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item2').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item3').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item4').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item5').parentElement.querySelector('.e-dropdown-btn').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item6').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item7').hasAttribute('disabled')).toBe(false);
            expect(ribbon.element.querySelector('#item7').classList.contains('e-disabled')).toBe(false);
            //To cover wrong ID
            ribbon.enableItem('item16');
        });
        it('hide/show item', () => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = '<button id="btn2" class="tempContent">Button2</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }, {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                id: "item8",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item4_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item5_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item6_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item7_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item8_container').classList.contains('e-hidden')).toBe(false);
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            ribbon.hideItem('item4');
            ribbon.hideItem('item5');
            ribbon.hideItem('item6');
            ribbon.hideItem('item7');
            ribbon.hideItem('item8');
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item4_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item5_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item6_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item7_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item8_container').classList.contains('e-hidden')).toBe(true);
            ribbon.showItem('item1');
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            ribbon.showItem('item4');
            ribbon.showItem('item5');
            ribbon.showItem('item6');
            ribbon.showItem('item7');
            ribbon.showItem('item8');
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item4_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item5_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item6_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item7_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item8_container').classList.contains('e-hidden')).toBe(false);
        });
        it('check all items are hidden', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group",
                        header: "groupHeader",
                        orientation: ItemOrientation.Row,
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection",
                            items: [{
                                id: "item11",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item12",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item13",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                },{
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group5",
                        header: "group5Header",
                        orientation: ItemOrientation.Row,
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection5",
                            items: [{
                                id: "item16",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item17",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item18",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            //To cover wrong id
            ribbon.hideItem('item10');
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(false);            
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(false);
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(true);            
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(true);
            ribbon.showItem('item1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(false);
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            expect(ribbon.element.querySelector('#item1_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item2_container').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#item3_container').classList.contains('e-hidden')).toBe(false);
            ribbon.activeLayout = 'Simplified';
            ribbon.dataBind();
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(true);
            expect(ribbon.element.querySelector('#group1').classList.contains('e-ribbon-emptyCollection')).toBe(true);
            ribbon.showItem('item1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-ribbon-emptyCollection')).toBe(false);
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow').classList.contains('e-ribbon-hide')).toBe(true);
            ribbon.showItem('item1');
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            // For code coverage
            containerEle.style.width = '360px';
            ribbon.refreshLayout();
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(true);
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            ribbon.showItem('item1');
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(false);
            containerEle.style.width = '360px';
            ribbon.refreshLayout();
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(true);
            ribbon.selectedTab = 1;
            ribbon.dataBind();
            ribbon.showItem('item1');
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            ribbon.selectedTab = 0;
            ribbon.dataBind();
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hide-group')).toBe(false);
        });
        it('check all items are hidden in simplified mode group oveflow popup', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },{
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item5",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.activeLayout = 'Simplified';
            ribbon.dataBind();
            containerEle.style.width = '350px';
            ribbon.refreshLayout();
            ribbon.hideItem('item4');
            ribbon.hideItem('item5');
            ribbon.hideItem('item6');
            expect(document.querySelector('#group2_sim_grp_overflow').classList.contains('e-hidden')).toBe(true);
            ribbon.showItem('item4');
            ribbon.showItem('item5');
            ribbon.showItem('item6');
        });
        it('hide/show when item is in second tab', (done) => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = '<button id="btn2" class="tempContent">Button2</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item2",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }, {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                id: "item8",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            }]
                        }]
                    }]
                },{
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item9",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);               
            ribbon.hideItem('item9');
            ribbon.hideItem('item10');
            ribbon.showItem('item9');
            ribbon.showItem('item10');
            ribbon.hideItem('item9');
            ribbon.hideItem('item10');
            ribbon.hideItem('item10');
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(() => {
                setTimeout(() => {
                    expect(ribbon.element.querySelector('#item9_container').classList.contains('e-hidden')).toBe(true);
                    expect(ribbon.element.querySelector('#item10_container').classList.contains('e-hidden')).toBe(true);
                    done();
                }, 450);
            }, 450);            
        });
        it('enable/disable when item is in second tab', (done) => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = '<button id="btn2" class="tempContent">Button2</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut'
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]  
                },{
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut'
                                }
                            }, {
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                id: "item4",
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item5",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: "item7",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item8",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                id: "item10",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);          
            setTimeout(function () {
                setTimeout(function () {
                    var item3 = ribbon.getItem('item3');
                    item3.disabled = true;
                    ribbon.updateItem(item3);                  
                    var item4 = ribbon.getItem('item4');
                    item4.disabled = true;
                    ribbon.updateItem(item4);                 
                    var item5 = ribbon.getItem('item5');
                    item5.disabled = true;
                    ribbon.updateItem(item5);                   
                    var item6 = ribbon.getItem('item6');
                    item6.disabled = true;
                    ribbon.updateItem(item6);                 
                    var item7 = ribbon.getItem('item7');
                    item7.disabled = true;
                    ribbon.updateItem(item7);               
                    var item8 = ribbon.getItem('item8');
                    item8.disabled = true;
                    ribbon.updateItem(item8);               
                    var item9 = ribbon.getItem('item9');
                    item9.disabled = true;
                    ribbon.updateItem(item9);      
                    var item10 = ribbon.getItem('item10');
                    item10.disabled = true;
                    ribbon.updateItem(item10);
                    ribbon.setProperties({ selectedTab: 1 });
                    //Button
                    expect(ribbon.element.querySelector('#item3_container').classList.contains('e-disabled')).toBe(true);
                    //DropDown
                    expect(ribbon.element.querySelector('#item4_container').classList.contains('e-disabled')).toBe(true);
                    //SplitButton
                    expect(ribbon.element.querySelector('#item5_container').classList.contains('e-disabled')).toBe(true);
                    //CheckBox
                    expect(ribbon.element.querySelector('#item6_container').classList.contains('e-disabled')).toBe(true);
                    //ColorPicker
                    expect(ribbon.element.querySelector('#item7_container').classList.contains('e-disabled')).toBe(true);
                    //ComboBox
                    expect(ribbon.element.querySelector('#item8_container').classList.contains('e-disabled')).toBe(true);
                    //Template
                    expect(ribbon.element.querySelector('#item9_container').classList.contains('e-disabled')).toBe(true);
                    //Groupbutton
                    expect(ribbon.element.querySelector('#item10_container').classList.contains('e-disabled')).toBe(true);
                    done();
                }, 450);
            }, 450);         
        });
        it('hide/show tab', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-hidden')).toBe(false);
            ribbon.hideTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-hidden')).toBe(true);
            ribbon.showTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-hidden')).toBe(false);
            ribbon.showTab('tab3');
        });
        it('enable/disable tab', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-disable')).toBe(false);
            ribbon.disableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-disable')).toBe(true);
            ribbon.enableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#e-item-ribbon_tab_0').classList.contains('e-disable')).toBe(false);
            ribbon.enableTab('tab3');
            // check the tab header is enable / disable
            ribbon.disableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#tab1_header').classList.contains('e-disabled')).toBe(true);
            ribbon.enableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#tab1_header').classList.contains('e-disabled')).toBe(false);
            // check the tab items is enable / diabled
            ribbon.disableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#tab1_content').classList.contains('e-disabled')).toBe(true);
            ribbon.enableTab('tab1');
            expect(ribbon.tabObj.element.querySelector('#tab1_content').classList.contains('e-disabled')).toBe(false);
        });
        it('hide/show group', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
            ribbon.hideGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(true);
            ribbon.showGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            ribbon.hideGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(true);
            ribbon.showGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group3_container').classList.contains('e-hidden')).toBe(false);
            ribbon.hideGroup('group3');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group3_container').classList.contains('e-hidden')).toBe(true);
            ribbon.showGroup('group3');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group3_container').classList.contains('e-hidden')).toBe(false);
            containerEle.style.width = '200px';
            ribbon.refreshLayout();
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-hidden')).toBe(false);
            ribbon.hideGroup('group2');
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-hidden')).toBe(true);
            ribbon.showGroup('group2');
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-hidden')).toBe(false);
            ribbon.showGroup('group4');
        });
        it('hide/show when group is in second tab', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group10",
                        header: "group10Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item16",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },{
                        id: "group11",
                        header: "group11Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item17",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item18",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);            
            ribbon.hideGroup('group10');
            ribbon.hideGroup('group11');
            ribbon.showGroup('group10');
            ribbon.showGroup('group11');
            ribbon.hideGroup('group10');
            ribbon.hideGroup('group11');
            ribbon.hideGroup('group11');
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(() => {
                setTimeout(() => {
                    expect(ribbon.element.querySelector('#group10').classList.contains('e-hidden')).toBe(true);
                    expect(ribbon.element.querySelector('#group11').classList.contains('e-hidden')).toBe(true);
                    done();
                }, 450);
            }, 450);            
        });
        it('hide/show the first tab group from second tab', (done) => {
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group10",
                        header: "group10Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item16",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },{
                        id: "group11",
                        header: "group11Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item17",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item18",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(function () {
                expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
                expect(ribbon.element.querySelector('#group2').classList.contains('e-hidden')).toBe(false);
                ribbon.hideGroup('group1');
                ribbon.hideGroup('group2');
                ribbon.setProperties({ selectedTab: 0 });
                setTimeout(function () {
                    expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(true);
                    expect(ribbon.element.querySelector('#group2').classList.contains('e-hidden')).toBe(true);
                    done();
                }, 1000);
            }, 1000);
        });
        it('hide/show group and item after that the overflow items rendering in availabel space', () => {
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group10",
                        header: "group10Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item16",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },{
                        id: "group11",
                        header: "group11Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item17",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item18",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#group2').querySelector('#item6_container') === null).toBe(true);
            ribbon.hideGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(true);
            expect(ribbon.element.querySelector('#group2').querySelector('#item6_container') !== null).toBe(true);
            ribbon.showGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-hidden')).toBe(false);
            expect(ribbon.element.querySelector('#group2').querySelector('#item6_container') === null).toBe(true);
            ribbon.hideItem('item1');
            ribbon.hideItem('item2');
            ribbon.hideItem('item3');
            expect(ribbon.element.querySelector('#group2').querySelector('#item6_container') !== null).toBe(true);
            ribbon.showItem('item1');
            ribbon.showItem('item2');
            ribbon.showItem('item3');
            expect(ribbon.element.querySelector('#group2').querySelector('#item6_container') === null).toBe(true);
        });
        it('when hidden items removed and adden in overflow popup', () => {
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                allowedSizes: RibbonItemSize.Medium,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group10",
                        header: "group10Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item16",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },{
                        id: "group11",
                        header: "group11Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item17",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item18",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            let item3width: number = (document.querySelector('#item3_container') as HTMLElement).offsetWidth;
            let group2Width: number = (ribbon.element.querySelector('#group2') as HTMLElement).offsetWidth;
            containerEle.style.width = '500px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelector('#group2').classList.contains('e-hidden')).toBe(false);
            let item7width: number = parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10);
            ribbon.hideGroup('group2');
            item7width = item7width - group2Width;
            expect(ribbon.element.querySelector('#group2').classList.contains('e-hidden')).toBe(true);
            expect(parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10)).toBe(item7width);
            item7width = parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10) + (group2Width);
            containerEle.style.width = '210px';
            ribbon.refreshLayout();
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group2_container').classList.contains('e-hidden')).toBe(true);
            ribbon.showGroup('group2');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group2_container').classList.contains('e-hidden')).toBe(false);
            expect(parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10)).toBe(item7width);
            item7width = parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10) - item3width;
            ribbon.hideItem('item3');
            containerEle.style.width = '300px';
            ribbon.refreshLayout();
            expect(parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10)).toBe(item7width);
            containerEle.style.width = '140px';
            ribbon.refreshLayout();
            item7width = item7width + item3width;
            expect(parseInt(document.querySelector('#item7_container').getAttribute('data-simplified-width'), 10)).toBe(item7width);
        });
        it('enable/disable group', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#group1').classList.contains('e-disabled')).toBe(false);
            ribbon.disableGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-disabled')).toBe(true);
            ribbon.enableGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-disabled')).toBe(false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            ribbon.disableGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-disabled')).toBe(true);
            ribbon.enableGroup('group1');
            expect(ribbon.element.querySelector('#group1').classList.contains('e-disabled')).toBe(false);
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group1_container').classList.contains('e-disabled')).toBe(false);
            ribbon.disableGroup('group1');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group1_container').classList.contains('e-disabled')).toBe(true);
            ribbon.enableGroup('group1');
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group1_container').classList.contains('e-disabled')).toBe(false);
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-disabled')).toBe(false);
            ribbon.disableGroup('group2');
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-disabled')).toBe(true);
            ribbon.enableGroup('group2');
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-disabled')).toBe(false);
            containerEle.style.width = '600px';
            ribbon.refreshLayout();
            ribbon.disableGroup('group1');
            ribbon.disableGroup('group2');
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group1_container').classList.contains('e-disabled')).toBe(true);
            expect(document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target').classList.contains('e-disabled')).toBe(true);
            ribbon.enableGroup('group4');
        });
        it('enable/disable when group is in second tab', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group12",
                        header: "group12Header",
                        collections: [{
                            id: "collection12",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item16",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },{
                        id: "group13",
                        header: "group13Header",
                        collections: [{
                            id: "collection13",
                            items: [{
                                id: "item17",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item18",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);           
            ribbon.disableGroup('group12');
            ribbon.disableGroup('group13');
            ribbon.enableGroup('group12');
            ribbon.enableGroup('group13');
            ribbon.disableGroup('group12');
            ribbon.disableGroup('group13');
            ribbon.disableGroup('group13');
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(() => {
                setTimeout(() => {
                    expect(ribbon.element.querySelector('#group12').classList.contains('e-disabled')).toBe(true);
                    expect(ribbon.element.querySelector('#group13').classList.contains('e-disabled')).toBe(true);
                    done();
                }, 450);
            }, 450);            
        });
        it('enable/disable and show/hide when group is in group overflow popup and in second tab', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group12",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection12",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.activeLayout = 'Simplified';
            ribbon.dataBind();
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            ribbon.disableGroup('group12');
            ribbon.hideGroup('group12');
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(() => {
                setTimeout(() => {
                    expect(ribbon.element.querySelector('#group12').classList.contains('e-disabled')).toBe(true);
                    expect(ribbon.element.querySelector('#group12').classList.contains('e-hidden')).toBe(true);
                    done();
                }, 450);
            }, 450);            
        });
        it('enable/disable and show/hide when group is in overall overflow popup and in second tab', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    cssClass: "tabCss",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.GroupButton,
                                groupButtonSettings: {
                                    items: [{
                                        iconCss: 'e-icons e-copy',
                                        content: 'copy',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-paste',
                                        content: 'paste',
                                        selected: true
                                    },
                                    {
                                        iconCss: 'e-icons e-cut',
                                        content: 'cut'
                                    }]
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item6",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item7",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item8",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item9",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    cssClass: "tabs",
                    header: "tab2",
                    groups: [{
                        id: "group12",
                        header: "group2Header",
                        collections: [{
                            id: "collection12",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item14",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-copy',
                                }
                            },{
                                id: "item15",
                                displayOptions: DisplayMode.Overflow,
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.activeLayout = 'Simplified';
            ribbon.dataBind();
            containerEle.style.width = '250px';
            ribbon.refreshLayout();
            ribbon.disableGroup('group12');
            ribbon.hideGroup('group12');
            ribbon.setProperties({ selectedTab: 1 });
            setTimeout(() => {
                setTimeout(() => {
                    expect(ribbon.element.querySelector('#group12').classList.contains('e-disabled')).toBe(true);
                    expect(ribbon.element.querySelector('#group12').classList.contains('e-hidden')).toBe(true);
                    done();
                }, 450);
            }, 450);            
        });
    });

    describe('Ribbon items DOM', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('Initial Rendering with button', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut'
                                }
                            },]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('button');
            expect((getComponent('item1', Button) as Button).getModuleName()).toBe('btn');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).innerText.toLowerCase()).toBe('button1');
            expect(isNullOrUndefined((ribbon.element.querySelector('#item1') as HTMLElement).querySelector('.e-cut'))).toBe(false);
        });
        it('Initial Rendering with dropdownbutton', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1001",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1001').tagName.toLowerCase()).toBe('button');
            expect((getComponent('item1001', DropDownButton) as DropDownButton).getModuleName()).toBe('dropdown-btn');
            expect((ribbon.element.querySelector('#item1001') as HTMLElement).innerText.toLowerCase()).toBe('edit');
            expect(isNullOrUndefined((ribbon.element.querySelector('#item1001') as HTMLElement).querySelector('.e-edit'))).toBe(false);
            expect(isNullOrUndefined(document.querySelector('#item1001-popup'))).toBe(false);
            (ribbon.element.querySelector('#item1001') as HTMLElement).click();
            expect((document.querySelector('#item1001-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
        });
        it('Initial Rendering with splitbutton', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('button');
            expect((getComponent('item1', SplitButton) as SplitButton).getModuleName()).toBe('split-btn');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).innerText.toLowerCase()).toBe('');
            expect((ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).innerText.toLowerCase()).toBe('edit');
            expect(isNullOrUndefined((ribbon.element.querySelector('#item1') as HTMLElement).querySelector('.e-edit'))).toBe(false);
            expect(ribbon.element.querySelector('#item1').parentElement.querySelectorAll('button').length).toBe(2);
            expect(isNullOrUndefined(document.querySelector('#item1_dropdownbtn-popup'))).toBe(false);
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            expect((document.querySelector('#item1_dropdownbtn-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
        });
        it('Initial Rendering with checkbox', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item1', CheckBox) as any).getModuleName()).toBe('checkbox');
            expect((ribbon.element.querySelector('#item1').parentElement.querySelector('.e-label') as HTMLElement).innerText.toLowerCase()).toBe('check1');
            expect((ribbon.element.querySelector('#item1').parentElement.querySelector('.e-frame') as HTMLElement).classList.contains('e-check')).toBe(true);
        });
        it('Initial Rendering with ColorPicker', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#fff'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item1', ColorPicker) as ColorPicker).getModuleName()).toBe('colorpicker');
            expect((ribbon.element.querySelector('#item1').parentElement.querySelector('.e-split-preview') as HTMLElement).style.backgroundColor).toBe('rgb(255, 255, 255)');
        });
        it('Initial Rendering with combobox', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item1', ComboBox) as ComboBox).getModuleName()).toBe('combobox');
            expect((ribbon.element.querySelector('#item1') as HTMLInputElement).value).toBe('Cricket');
        });
        it('Initial Rendering with Template', () => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = createElement('button', { id: 'btn2', className: 'tempContent2', innerHTML: 'Button2' });
            let element1 = createElement('button', { id: 'btn3', className: 'tempContent3', innerHTML: 'Button3' });
            document.body.appendChild(element1);
            let template = '<button id="btn4" class="tempContent4">Button4</button>';;
            let renderer = createElement("script", { id: "ribbonTemp", innerHTML: template });
            renderer.setAttribute("type", "text/x-jsrender");
            document.body.appendChild(renderer);
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                id: "item2",
                                type: RibbonItemType.Template,
                                itemTemplate: template2.outerHTML
                            }, {
                                id: "item3",
                                type: RibbonItemType.Template,
                                itemTemplate: '#btn3',

                            }, {
                                id: "item4",
                                type: RibbonItemType.Template,
                                itemTemplate: '#ribbonTemp',

                            }, {
                                id: "item5",
                                type: RibbonItemType.Template,
                                itemTemplate: 'ribbonTemp23',

                            }, {
                                id: "item6",
                                type: RibbonItemType.Template,
                                itemTemplate: '#ribbonTemp24',

                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-ribbon-template') !==null).toBe(true);
            expect(ribbon.element.querySelector('#item1').innerHTML).toBe(template1);
            expect(ribbon.element.querySelector('#item2').innerHTML).toBe(template2.outerHTML);
            expect(ribbon.element.querySelector('#item3').innerHTML).toBe(element1.outerHTML);
            expect(ribbon.element.querySelector('#item4').innerHTML).toBe(template);
            expect(ribbon.element.querySelector('#item5').innerHTML).toBe('ribbonTemp23');
            expect(ribbon.element.querySelector('#item6').innerHTML).toBe('#ribbonTemp24');
            remove(element1);
            remove(renderer);
        });
    });
    describe('Ribbon items Methods and Events', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('button methods', () => {
            let isClicked: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                    clicked: () => {
                                        isClicked = true;
                                    }
                                }
                            }, {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    cssClass: 'copy Css',
                                    iconCss: 'e-icons e-copy'
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'button3',
                                    iconCss: 'e-icons e-paste'
                                }
                            },]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-paste',
                                    clicked: () => {
                                        isClicked = true;
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('#item1') as HTMLElement).click();
            expect(isClicked).toBe(true);
            isClicked = false;
            ribbon.ribbonButtonModule.click('item1');
            expect(isClicked).toBe(true);
            isClicked = false;
            ribbon.ribbonButtonModule.click('item4');
            expect(isClicked).toBe(false);
            ribbon.ribbonButtonModule.updateButton({ content: 'new button' }, 'item1');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).innerText.toLowerCase()).toBe('new button');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).classList.contains('newClass')).toBe(false);
            ribbon.ribbonButtonModule.updateButton({ cssClass: 'newClass' }, 'item1');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).classList.contains('newClass')).toBe(true);
            expect((ribbon.element.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            ribbon.ribbonButtonModule.updateButton({ content: 'new button' }, 'item3');
            expect((ribbon.element.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            //Handle else case for clicked event, wrong id, element not rendered .
            ribbon.ribbonButtonModule.updateButton({ clicked: null }, 'item1');
            ribbon.ribbonButtonModule.click('item1');
            ribbon.ribbonButtonModule.updateButton({ content: 'new button1' }, 'item6');
            ribbon.ribbonButtonModule.updateButton({ content: 'new button1' }, 'item4');
        });
        it('Dropdownbutton methods', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1010",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                cssClass: 'newClass',
                                dropDownSettings: {
                                    cssClass: 'customClass',
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Small,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            expect((document.querySelector('#item1010-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            ribbon.ribbonDropDownModule.addItems('item1010', [{ text: 'new Item' }]);
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            expect((document.querySelector('#item1010-popup') as HTMLElement).querySelectorAll('li').length).toBe(8);
            expect((document.querySelector('#item1010-popup') as HTMLElement).querySelectorAll('li')[7].innerText.toLowerCase()).toBe('new item');
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            ribbon.ribbonDropDownModule.removeItems('item1010', ['new Item']);
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            expect((document.querySelector('#item1010-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
            (ribbon.element.querySelector('#item1010') as HTMLElement).click();
            ribbon.ribbonDropDownModule.updateDropDown({ content: 'New Edit' }, 'item1010');
            expect((document.querySelector('#item1010') as HTMLElement).innerText.toLowerCase()).toBe('new edit');
            expect((document.querySelector('#item1010') as HTMLElement).classList.contains('e-active')).toBe(false);
            expect((document.querySelector('#item1010') as HTMLElement).getAttribute('aria-expanded')).toBe('false');
            ribbon.ribbonDropDownModule.toggle('item1010');
            expect((document.querySelector('#item1010') as HTMLElement).classList.contains('e-active')).toBe(true);
            expect((document.querySelector('#item1010') as HTMLElement).getAttribute('aria-expanded')).toBe('true');
            ribbon.ribbonDropDownModule.toggle('item1010');
            expect((document.querySelector('#item1010') as HTMLElement).classList.contains('e-active')).toBe(false);
            expect((document.querySelector('#item1010') as HTMLElement).getAttribute('aria-expanded')).toBe('false');
            expect((document.querySelector('#item1010') as HTMLElement).classList.contains('newClass')).toBe(false);
            expect((document.querySelector('#item3') as HTMLElement).classList.contains('newClass')).toBe(false);
            ribbon.ribbonDropDownModule.updateDropDown({ cssClass: 'newClass' }, 'item1010');
            ribbon.ribbonDropDownModule.updateDropDown({ cssClass: 'newClass' }, 'item3');
            expect((document.querySelector('#item1010') as HTMLElement).classList.contains('newClass')).toBe(true);
            expect((document.querySelector('#item3') as HTMLElement).classList.contains('newClass')).toBe(true);
            expect((document.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            ribbon.ribbonDropDownModule.updateDropDown({ content: 'New Edit1' }, 'item3');
            expect((document.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            //To cover wrong id, not rendered case
            ribbon.ribbonDropDownModule.updateDropDown({ content: 'New Edit1' }, 'item5');
            ribbon.ribbonDropDownModule.updateDropDown({ content: 'New Edit2' }, 'item4');
        });
        it('SplitButton methods', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Row',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    cssClass:'testClass',
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }, {
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Small,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Small,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            expect((document.querySelector('#item1') as HTMLElement).classList).toContain('testClass');
            expect((document.querySelector('#item1_dropdownbtn-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            ribbon.ribbonSplitButtonModule.addItems('item1', [{ text: 'new Item' }]);
            ribbon.ribbonSplitButtonModule.toggle('item1');
            expect((document.querySelector('#item1_dropdownbtn-popup') as HTMLElement).querySelectorAll('li').length).toBe(8);
            expect((document.querySelector('#item1_dropdownbtn-popup') as HTMLElement).querySelectorAll('li')[7].innerText.toLowerCase()).toBe('new item');
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            ribbon.ribbonSplitButtonModule.removeItems('item1', ['new Item']);
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            expect((document.querySelector('#item1_dropdownbtn-popup') as HTMLElement).querySelectorAll('li').length).toBe(7);
            (ribbon.element.querySelector('#item1_dropdownbtn') as HTMLElement).click();
            ribbon.ribbonSplitButtonModule.updateSplitButton({ content: 'New Edit' }, 'item1');
            ribbon.ribbonSplitButtonModule.updateSplitButton({ cssClass:'newClass' }, 'item1');
            expect((document.querySelector('#item1_dropdownbtn') as HTMLElement).innerText.toLowerCase()).toBe('new edit');
            expect((document.querySelector('#item1') as HTMLElement).classList).toContain('newClass');
            expect((document.querySelector('#item1') as HTMLElement).classList.contains('testClass')).toBe(false);
            expect((document.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            ribbon.ribbonSplitButtonModule.updateSplitButton({ content: 'New Edit1' }, 'item3');
            expect((document.querySelector('#item3') as HTMLElement).innerText.toLowerCase()).toBe('');
            //for Coverage            
            ribbon.ribbonSplitButtonModule.updateSplitButton({ content: 'New Edit', cssClass:'newClass' }, 'item4');
            ribbon.ribbonSplitButtonModule.updateSplitButton({ content: 'New Edit', cssClass:'newClass' }, 'item5');
        });
        it('checkbox methods', () => {
            let isChanged: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                    change: () => {
                                        isChanged = true;
                                    }
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                    change: () => {
                                        isChanged = true;
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.ribbonCheckBoxModule.click('item1');
            expect(isChanged).toBe(true);
            ribbon.ribbonCheckBoxModule.updateCheckBox({ label: 'new label' }, 'item1');
            expect((ribbon.element.querySelector('#item1').parentElement.querySelector('.e-label') as HTMLElement).innerText.toLowerCase()).toBe('new label');
            //to cover wrong ID and not rendered case
            ribbon.ribbonCheckBoxModule.click('item5');
            ribbon.ribbonCheckBoxModule.updateCheckBox({ label: 'new label1' }, 'item5');
            ribbon.ribbonCheckBoxModule.updateCheckBox({ label: 'new label1' }, 'item2');
        });
        it('ColorPicker Methods', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#fff'
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group3Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#000'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('#item1').parentElement.querySelectorAll('button').length).toBe(2);
            let splitId: string = (ribbon.element.querySelector('#item1').parentElement.querySelector('.e-split-colorpicker')).id;
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup') !== null).toBe(true);
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup').querySelector('.e-color-palette') !== null).toBe(false);
            expect((ribbon.element.querySelector('#' + splitId + '_dropdownbtn') as HTMLElement).classList.contains('e-active')).toBe(false);
            ribbon.ribbonColorPickerModule.toggle('item1');//open
            expect((ribbon.element.querySelector('#' + splitId + '_dropdownbtn') as HTMLElement).classList.contains('e-active')).toBe(true);
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup').querySelector('.e-color-palette') !== null).toBe(true);
            ribbon.ribbonColorPickerModule.toggle('item1');//close
            expect((ribbon.element.querySelector('#' + splitId + '_dropdownbtn') as HTMLElement).classList.contains('e-active')).toBe(false);
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup') === null).toBe(false);
            expect(ribbon.ribbonColorPickerModule.getValue('item1', '#000', 'rgb')).toBe('rgb(0,0,0)');
            ribbon.ribbonColorPickerModule.toggle('item1');//open
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup').querySelector('.e-mode-switch-btn') !== null).toBe(true);
            ribbon.ribbonColorPickerModule.toggle('item1');//close
            ribbon.ribbonColorPickerModule.updateColorPicker({ modeSwitcher: false }, 'item1');
            ribbon.ribbonColorPickerModule.toggle('item1');//open
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup').querySelector('.e-mode-switch-btn') !== null).toBe(false);
            ribbon.ribbonColorPickerModule.toggle('item1');//close
            ribbon.ribbonColorPickerModule.updateColorPicker({ modeSwitcher: true }, 'item1');
            ribbon.ribbonColorPickerModule.toggle('item1');//open
            expect(document.querySelector('#' + splitId + '_dropdownbtn-popup').querySelector('.e-mode-switch-btn') !== null).toBe(true);
            ribbon.ribbonColorPickerModule.toggle('item1');//close
            //To cover not rendered
            ribbon.ribbonColorPickerModule.toggle('item5');
            ribbon.ribbonColorPickerModule.updateColorPicker({ modeSwitcher: false }, 'item3');
            expect(ribbon.ribbonColorPickerModule.getValue('item5')).toBe('');
            ribbon.ribbonColorPickerModule.updateColorPicker({ modeSwitcher: false }, 'item5');
        });
        it('Combobox update method', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    placeholder: 'placeholder1',
                                    width: '100px'
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    placeholder: 'placeholder2',
                                    width: '100px'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect((document.querySelector('#item1').closest('.e-control-wrapper') as HTMLElement).style.width).toBe('100px');
            expect((document.querySelector('#item1') as HTMLInputElement).placeholder).toBe('placeholder1');
            ribbon.ribbonComboBoxModule.updateComboBox({ placeholder: 'placeholder2', width: '200px' }, 'item1');
            expect((document.querySelector('#item1') as HTMLInputElement).placeholder).toBe('placeholder2');
            expect((document.querySelector('#item1').closest('.e-control-wrapper') as HTMLElement).style.width).toBe('200px');
            //to cover wrong ID and not rendered case
            ribbon.ribbonComboBoxModule.updateComboBox({ placeholder: 'placeholder2' }, 'item5');
            ribbon.ribbonComboBoxModule.updateComboBox({ placeholder: 'placeholder3' }, 'item2');
            ribbon.ribbonComboBoxModule.hidePopup('item5');
            ribbon.ribbonComboBoxModule.showPopup('item5');
        });
    });
    describe('combobox timeout Methods', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let originalTimeout: number;
        beforeAll(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
        });
        afterAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('Combobox showhide methods', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(document.querySelector('#item1_popup') === null).toBe(true);
            ribbon.ribbonComboBoxModule.showPopup('item1');
            setTimeout(() => {
                expect(document.querySelector('#item1_popup') !== null).toBe(true);
                ribbon.ribbonComboBoxModule.hidePopup('item1');
                setTimeout(() => {
                    expect(document.querySelector('#item1_popup') === null).toBe(true);
                    done();
                }, 450);
            }, 450);
        });
        it('Combobox filter method', (done) => {
            let isfiltered: boolean = false;
            let keyEventArgs: any = { preventDefault: (): void => { /** NO Code */ }, keyCode: 65, metaKey: false };
            let keyEvent: any = { preventDefault: (): void => { /** NO Code */ }, action: 'down' };
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        ribbon.ribbonComboBoxModule.filter('item1', sportsData, combobox_query);
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.ribbonComboBoxModule.showPopup('item1');
            setTimeout(() => {
                let comboxObj = (ribbon.element.querySelector('#item1') as any).ej2_instances[0];
                comboxObj.filterInput.value = "a";
                comboxObj.onInput()
                comboxObj.onFilterUp(keyEventArgs);
                setTimeout(() => {
                    expect(document.querySelector('#item1_popup').querySelectorAll('li').length).toBe(2);
                    expect((document.querySelector('#item1_popup').querySelector('.e-list-item.e-active') as HTMLElement).innerText).toBe('Badminton');
                    comboxObj.keyActionHandler(keyEvent);
                    expect((document.querySelector('#item1_popup').querySelector('.e-list-item.e-active') as HTMLElement).innerText).toBe('Football');
                    expect(isfiltered).toBe(true);
                    expect((ribbon.element.querySelector('#item1') as HTMLInputElement).value === 'Football').toBe(true);
                    comboxObj.hidePopup();
                    done();
                }, 450);
            }, 450);
        });
        it('Combobox filter with updateData method of filtereventargs', (done) => {
            let isfiltered: boolean = false;
            let keyEventArgs: any = { preventDefault: (): void => { /** NO Code */ }, keyCode: 65, metaKey: false };
            let keyEvent: any = { preventDefault: (): void => { /** NO Code */ }, action: 'down' };
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: 'Column',
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            ribbon.ribbonComboBoxModule.showPopup('item1');
            setTimeout(() => {
                let comboxObj = (ribbon.element.querySelector('#item1') as any).ej2_instances[0];
                comboxObj.filterInput.value = "a";
                comboxObj.onInput()
                comboxObj.onFilterUp(keyEventArgs);
                setTimeout(() => {
                    expect(document.querySelector('#item1_popup').querySelectorAll('li').length).toBe(2);
                    expect((document.querySelector('#item1_popup').querySelector('.e-list-item.e-active') as HTMLElement).innerText).toBe('Badminton');
                    comboxObj.keyActionHandler(keyEvent);
                    expect((document.querySelector('#item1_popup').querySelector('.e-list-item.e-active') as HTMLElement).innerText).toBe('Football');
                    expect(isfiltered).toBe(true);
                    expect((ribbon.element.querySelector('#item1') as HTMLInputElement).value === 'Football').toBe(true);
                    comboxObj.hidePopup();
                    done();
                }, 450);
            }, 450);
        });
    });
    describe('Ribbon layout', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('simplified mode', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group1Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            //button
            expect(ribbon.element.querySelector('#item1').tagName.toLowerCase()).toBe('button');
            expect((getComponent('item1', Button) as Button).getModuleName()).toBe('btn');
            expect((ribbon.element.querySelector('#item1') as HTMLElement).innerText.toLowerCase()).toBe('button1');
            //dropdown
            expect(ribbon.element.querySelector('#item2').tagName.toLowerCase()).toBe('button');
            expect((getComponent('item2', DropDownButton) as DropDownButton).getModuleName()).toBe('dropdown-btn');
            expect((ribbon.element.querySelector('#item2') as HTMLElement).innerText.toLowerCase()).toBe('edit');
            expect(isNullOrUndefined((ribbon.element.querySelector('#item2') as HTMLElement).querySelector('.e-edit'))).toBe(false);
            //combobox
            expect(ribbon.element.querySelector('#item3').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item3', ComboBox) as ComboBox).getModuleName()).toBe('combobox');
            expect((ribbon.element.querySelector('#item3') as HTMLInputElement).value).toBe('Cricket');
            //colorpicker
            expect(ribbon.element.querySelector('#item4').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item4', ColorPicker) as ColorPicker).getModuleName()).toBe('colorpicker');
            expect((ribbon.element.querySelector('#item4').parentElement.querySelector('.e-split-preview') as HTMLElement).style.backgroundColor).toBe('rgb(18, 52, 86)');
            (ribbon.element.getElementsByClassName('e-tab-text')[1] as HTMLElement).click();
            //checkbox
            expect(ribbon.element.querySelector('#item6').tagName.toLowerCase()).toBe('input');
            expect((getComponent('item6', CheckBox) as any).getModuleName()).toBe('checkbox');
            expect((ribbon.element.querySelector('#item6').parentElement.querySelector('.e-label') as HTMLElement).innerText.toLowerCase()).toBe('check1');
            expect((ribbon.element.querySelector('#item6').parentElement.querySelector('.e-frame') as HTMLElement).classList.contains('e-check')).toBe(true);
            //template
            expect(ribbon.element.querySelector('#item7').innerHTML).toBe(template1);
            expect((ribbon.element.querySelector('#item7') as HTMLElement).innerText.toLowerCase()).toBe('button1');
        });

        it('switching modes', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Classic,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Small,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Medium,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group1Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.CheckBox,
                                allowedSizes: RibbonItemSize.Medium,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Template,
                                allowedSizes: RibbonItemSize.Small,
                                itemTemplate: template1
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Classic');
            expect(ribbon.element.querySelector('.e-ribbon-collapse-btn') !== null).toBe(true);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(1);
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);         
        });

        it('hideLayoutSwitcher', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Classic,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Small,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Medium,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.hideLayoutSwitcher).toBe(false);
            expect(ribbon.element.classList.contains('e-ribbon-collapsible')).toBe(true);
            expect(ribbon.element.querySelector('#ribbon_tab_collapsebutton') !== null).toBe(true);
            ribbon.hideLayoutSwitcher = true;
            ribbon.dataBind();
            expect(ribbon.hideLayoutSwitcher).toBe(true);
            expect(ribbon.element.classList.contains('e-ribbon-collapsible')).toBe(false);
            expect(ribbon.element.querySelector('#ribbon_tab_collapsebutton') !== null).toBe(false);
        });
    });

    describe('Simplified mode', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:600px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });
        it('With initial overflow', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    width: '200px',
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: 'item7',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item9',
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            }]
                        }]
                    }]
                },
                {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group21",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection21",
                            items: [{
                                id: "item21",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button21',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item22",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button22',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection22",
                            items: [{
                                id: "item23",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item24",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item25",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                allowedSizes: (RibbonItemSize.Large | RibbonItemSize.Medium | RibbonItemSize.Small),
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group22",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection23",
                            items: [{
                                id: "item26",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: 'item27',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: 'item28',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item29',
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group23",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection24",
                            items: [{
                                id: "item210",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item211",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection25",
                            items: [{
                                id: "item212",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item213",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            }]
                        }]
                    }]
                }, {
                        id: "tab3",
                        header: "tab3",
                        groups: [{
                            id: "group23",
                            header: "group3Header",
                            priority: 1,
                            orientation: ItemOrientation.Row,
                            collections: [{
                                id: "collection23",
                                items: [{
                                    id: "item23",
                                    type: RibbonItemType.Button,
                                    allowedSizes: RibbonItemSize.Medium,
                                    buttonSettings: {
                                        content: 'button26',
                                        iconCss: 'e-icons e-cut',
                                    }
                                }]
                            }]
                        }]
                    }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            containerEle.style.width = '500px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(0);
            containerEle.style.width = '300px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(1);
            containerEle.style.width = '700px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(5);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(0);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Classic');
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(4);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-overflow').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            containerEle.style.width = '400px';
            ribbon.refreshLayout();
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(ribbon.element.classList.contains('e-ribbon-minimize')).toBe(false);
            expect(ribbon.activeLayout).toBe('Simplified');
            expect((ribbon.element.querySelector('.e-tab-header .e-active') as HTMLElement).innerText.toLowerCase()).toBe('tab1');
            ribbon.setProperties({ tabAnimation: { previous: { effect: "None" }, next: { effect: "None" } } });
            ribbon.selectTab('tab2');
            expect((ribbon.element.querySelector('.e-tab-header .e-active') as HTMLElement).innerText.toLowerCase()).toBe('tab2');
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(6);
            ribbon.selectTab('tab3');
            expect((ribbon.element.querySelector('.e-tab-header .e-active') as HTMLElement).innerText.toLowerCase()).toBe('tab3');
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(7);
        });

        it('Without initial overflow', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    width: '200px',
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item8",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item9",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            },
                            {
                                id: "item10",
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(0);
            containerEle.style.width = '300px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(3);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(1);
            containerEle.style.width = '1200px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(10);
            expect(document.querySelectorAll('.e-hscroll-bar').length).toBe(0);
        });
        
        it('With initial overflow with enableRtl', () => {
            let isfiltered: boolean = false;
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                enableRtl: true,
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: 'item7',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item9',
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].openPopUp();
            expect(ribbon.element.querySelector('.e-ribbon-tab').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item1').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item2').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item3').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item4').closest('.e-input-group').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item5').closest('.e-colorpicker-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item6').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item7').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(true);
            // for item 8 and item 9
            expect(ribbon.element.querySelector('#group2_sim_grp_overflow').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item10').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item11').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item12').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(true);
            expect(document.body.querySelector('#item13').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(true);
            // overall overflow
            expect(ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow').classList.contains('e-rtl')).toBe(true);
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].closePopup();
            ribbon.enableRtl = false;
            ribbon.dataBind();
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].openPopUp();
            expect(ribbon.element.querySelector('#ribbon_tab').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item1').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item2').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item3').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item4').closest('.e-input-group').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item5').closest('.e-colorpicker-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item6').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item7').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            // for item 8 and item 9
            expect(ribbon.element.querySelector('#group2_sim_grp_overflow').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item10').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item11').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item12').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            expect(document.body.querySelector('#item13').closest('.e-checkbox-wrapper').classList.contains('e-rtl')).toBe(false);
            // overall overflow
            expect(ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow').classList.contains('e-rtl')).toBe(false);
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].closePopup();
        });

        it('Overflow popup items', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: 'item7',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item9',
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            },
                            {
                                id: "item43",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-content-height').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item').length).toBe(4);
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].openPopUp();
            (document.body.querySelector('#item3') as any).ej2_instances[0].openPopUp();
            (document.body.querySelector('#item3') as any).ej2_instances[0].closePopup();
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0].closePopup();
        });
        it('Overall overflow header', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        overflowHeader: "GroupHeader",
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: 'item7',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item9',
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        overflowHeader: "OverAllHeader",
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            },
                            {
                                id: "item43",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '200px';
            ribbon.refreshLayout();
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('#group3_header').innerHTML = 'OverAllHeader';
            (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            (ribbon.element.querySelector('#group2_sim_grp_overflow') as HTMLElement).click();
            document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-header').innerHTML = 'GroupHeader';
            (ribbon.element.querySelector('#group2_sim_grp_overflow') as HTMLElement).click();
            (ribbon.element.querySelector('.e-ribbon-collapse-btn')as HTMLElement).click();
            containerEle.style.width = '800px';
            ribbon.refreshLayout();
            expect(ribbon.element.querySelector('#group3_header').innerHTML).toBe('group3Header');
            expect(ribbon.element.querySelector('#group2_header').innerHTML).toBe('group2Header');

        });
    });

    describe('Keyboard Navigation', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        let keyboardEventArgs: any;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:600px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);    
            keyboardEventArgs = {
                preventDefault: (): void => { },
                action: null,
                target: null,
                stopImmediatePropagation: (): void => { },
            };
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });

        it('Keyboard Navigation Using ArrowRight Key In Classic Mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    allowFiltering: true,
                                    width: '150px',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '1500px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.action = '';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item9');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'tab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item10')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item10');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'tab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item10')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection11_item12')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection11_item13');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection11_item16');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group17_collection18_item19');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group17_collection18_item19_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group17_collection18_item20');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group17_collection18_item21');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group17_collection18_item21_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection1_item2');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'shiftTab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-tab-wrap')).toBe(true);
        });

        it('Keyboard Navigation Using ArrowLeft Key In Classic Mode', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    allowFiltering: true,
                                    width: '150px',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Small,
                                colorPickerSettings: {
                                    value: '#123456',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '1500px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item21');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20_dropdownbtn');
            document.activeElement.dispatchEvent((new KeyboardEvent('keydown',{'key':'ArrowRight'})));
            document.activeElement.dispatchEvent((new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#ribbon_tab0_group18_collection19_item20_dropdownbtn-popup').querySelector('.e-item') as HTMLElement).dispatchEvent((new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#ribbon_tab0_group18_collection19_item20_dropdownbtn-popup').querySelector('.e-item') as HTMLElement).click();
            (ribbonEle.querySelector('#ribbon_tab0_group18_collection19_item20_dropdownbtn')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection11_item17');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection11_item14');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection11_item13');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-colorpicker')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item10');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'shiftTab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item9');
            keyboardEventArgs.action = 'shiftTab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            (ribbonEle.querySelector('#clipboard_launcher')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection1_item2_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
        });

        it('Keyboard Navigation Using ArrowRight Key In Simplified Mode', () => {
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    allowFiltering: true,
                                    width: '150px',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                displayOptions: DisplayMode.Simplified,
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Small,
                                colorPickerSettings: {
                                    value: '#123456',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                displayOptions: DisplayMode.Simplified,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                displayOptions: DisplayMode.Simplified,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '700px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection3_item5');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection3_item6');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item9');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
           (ribbonEle.querySelector('.e-split-colorpicker')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-group-overflow-ddb')).toBe(true);
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_sim_ovrl_overflow');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection1_item2');
        });

        it('Keyboard Navigation Using ArrowLeft Key In Simplified Mode', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    allowFiltering: true,
                                    width: '150px',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                displayOptions: DisplayMode.Simplified,
                                type: RibbonItemType.ColorPicker,
                                allowedSizes: RibbonItemSize.Small,
                                colorPickerSettings: {
                                    value: '#123456',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                displayOptions: DisplayMode.Simplified,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                displayOptions: DisplayMode.Simplified,
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '700px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_sim_ovrl_overflow');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item22');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group18_collection19_item20');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_sim_grp_overflow');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group7_collection8_item9');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'shiftTab';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            (ribbonEle.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection3_item6');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection3_item5');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection1_item2_dropdownbtn');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_collection1_item2');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
        });

        it('Keyboard Navigation With Disabled Item', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                disabled: true,
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '1500px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#clipboard_collection3_item4')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-collapse-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab_collapsebutton');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
        });

        it('Keyboard Navigation In Classic Mode Overflow Dropdown', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_overflow_dropdown');
            // expect((document.activeElement as HTMLElement).click());
            expect(document.querySelector('#clipboard_overflow_dropdown').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#clipboard_overflow_dropdown')as HTMLElement).click();
            expect(document.querySelector('#clipboard_container').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            let target: HTMLElement = document.querySelector('#clipboard_overflow_dropdown-popup').children[0] as HTMLElement;
            keyboardEventArgs.target = document.querySelector('#clipboard_overflow_dropdown-popup').children[0];
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            (document.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            (document.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey =  true;
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey =  false;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            (document.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);

        });

        it('Keyboard Navigation In Classic Mode Overflow Dropdown Without Launcher Icon', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 3,
                                    width: '65px'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_overflow_dropdown');
            expect(document.querySelector('#clipboard_overflow_dropdown').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#clipboard_overflow_dropdown')as HTMLElement).click();
            expect(document.querySelector('#clipboard_container').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            let target: HTMLElement = document.querySelector('#clipboard_overflow_dropdown-popup').children[0] as HTMLElement;
            keyboardEventArgs.target = document.querySelector('#clipboard_overflow_dropdown-popup').children[0];
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            (document.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-combobox')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            (document.querySelector('#clipboard_collection3_item6')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey =  true;
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
        });

        it('Keyboard Navigation Using ArrowLeft And ShiftTab key With Classic Mode Overflow Dropdown', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-paste',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_overflow_dropdown');
            expect((document.activeElement as HTMLElement).click());
            (document.querySelector('#clipboard_collection1_item2')as HTMLElement).focus();
            let target: HTMLElement = document.querySelector('#clipboard_overflow_dropdown-popup').children[0] as HTMLElement;
            keyboardEventArgs.target = document.querySelector('#clipboard_overflow_dropdown-popup').children[0];
            keyboardEventArgs.key = 'ArrowLeft';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.key = 'ArrowLeft';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('format painter');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
        });

        it('Keyboard Navigation Using ArrowDown With Overflow Popup Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item060",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                disabled: true,
                                buttonSettings: {
                                    content: 'disabled',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item003",
                                type: RibbonItemType.DropDown,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            },  {
                                id: "item02",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item03",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: "item06",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: "item09",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: 'item010',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button6',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item009",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }, {
                                id: "item006",
                                type: RibbonItemType.SplitButton,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: "item002",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            // for coverage
            expect(document.querySelector('.e-ribbon-group-overflow-ddb').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            expect(document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0];
            keyboardEventArgs.key = 'ArrowDown';
            let target: HTMLElement = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            document.activeElement.classList.contains('e-checkbox');
            expect(target.querySelector('#item8_container').querySelector('.e-frame').classList.contains('e-check')).toBe(true);
            keyboardEventArgs.key = " ";
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect(target.querySelector('#item8_container').querySelector('.e-frame').classList.contains('e-check')).toBe(false);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('3');
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('4');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('4');            
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('5');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('6');
            keyboardEventArgs.key = 'ArrowLeft';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect(document.activeElement.classList.contains('e-split-btn')).toBe(true);
            keyboardEventArgs.key = 'ArrowRight';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            keyboardEventArgs.key = 'Enter';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            // for coverage
            document.activeElement.dispatchEvent((new KeyboardEvent('keydown',{'key':'ArrowRight'})));
            document.activeElement.dispatchEvent((new KeyboardEvent('keydown',{'key':'Enter'})));
            (document.querySelector('#item006_dropdownbtn-popup').querySelector('.e-item') as HTMLElement).classList.add('e-focused');
            // for coverage
            (document.querySelector('#item006_dropdownbtn-popup').dispatchEvent((new KeyboardEvent('keydown',{'key':'ArrowRight'}))));
            (document.querySelector('#item006_dropdownbtn-popup').dispatchEvent((new KeyboardEvent('keydown',{'key':'Enter'}))));
            
        });

        it('Keyboard Navigation In Classic Mode Overflow Dropdown With Disabled Items', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        showLauncherIcon: true,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                disabled: true,
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_overflow_dropdown');
            (document.querySelector('#clipboard_overflow_dropdown')as HTMLElement).click();
            (document.querySelector('#clipboard_collection3_item4')as HTMLElement).focus();
            let target: HTMLElement = document.querySelector('#clipboard_overflow_dropdown-popup').children[0] as HTMLElement;
            keyboardEventArgs.target = document.querySelector('#clipboard_overflow_dropdown-popup').children[0];
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
            keyboardEventArgs.key = 'ArrowLeft';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-ribbon-launcher-icon')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
        });

        it('Keyboard Navigation Overflow Dropdown Without Launcher Icon', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",        
                    groups: [{
                        id: 'clipboard',
                        header: "Clipboard",
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                disabled: true,
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }],
                                    content: 'Paste'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Cut',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Copy',
                                    iconCss: 'e-icons e-copy',
                                }
                            }, {
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {                    
                                    content: 'Format Painter',
                                    iconCss: 'e-icons e-copy',
                                }
                            }]
                        }]
                    }, {
                        header: "Font",
                        isCollapsible: false,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                buttonSettings: {
                                    content: 'Underline',
                                    iconCss: 'e-icons e-underline',
                                    isToggle: true
                                }
                            },{
                                allowedSizes: RibbonItemSize.Small,
                                disabled: true,
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Strikethrough',
                                    iconCss: 'e-icons e-strikethrough',
                                    isToggle: true
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Change Case',
                                    iconCss: 'e-icons e-change-case',
                                    isToggle: true
                                }
                            }]
                        }]
                    }, {
                        header: "Editing",
                        groupIconCss: 'e-icons e-edit',
                        orientation: ItemOrientation.Column,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ]
                                }
                            }, {
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'Replace',
                                    iconCss: 'e-icons e-replace',
                                }
                            }, {
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-mouse-pointer',
                                    content: 'Select',
                                    items: [{ text: 'Select All' },
                                    { text: 'Select Objects' }]
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '350px';
            ribbon.refreshLayout();let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group7_collection8_item9')as HTMLElement).focus();
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'leftarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-dropdown-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('clipboard_overflow_dropdown');
            (document.querySelector('#clipboard_overflow_dropdown')as HTMLElement).click();
            (document.querySelector('#clipboard_collection3_item4')as HTMLElement).focus();
            let target: HTMLElement = document.querySelector('#clipboard_overflow_dropdown-popup').children[0] as HTMLElement;
            keyboardEventArgs.target = document.querySelector('#clipboard_overflow_dropdown-popup').children[0];
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'ArrowRight';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
            keyboardEventArgs.key = 'ArrowLeft';
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('cut');
            keyboardEventArgs.target = document.activeElement;
            (ribbon.ribbonDropDownModule as any).keyActionHandler(keyboardEventArgs, target);
            expect(document.activeElement.classList.contains('e-btn')).toBe(true);
            expect((document.activeElement as HTMLElement).innerText.toLowerCase()).toBe('copy');
        });

        it('Keyboard Navigation Using ArrowUp With Overflow Popup Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }, {
                                id: "item02",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            },{
                                id: "item060",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                disabled: true,
                                buttonSettings: {
                                    content: 'disabled',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item03",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: "item06",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: 'item010',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button6',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            },
                            {
                                id: "item43",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            (document.querySelector('#group2_sim_grp_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#group2_sim_grp_overflow-popup').children[0];
            keyboardEventArgs.key = 'ArrowUp';
            let target: HTMLElement = document.querySelector('#group2_sim_grp_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#group2_sim_grp_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('6');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('5');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('4');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect(document.activeElement.classList.contains('e-split-colorpicker')).toBe(true);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
        });

        it('Keyboard Navigation Using Tab With Overflow Popup Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item003",
                                type: RibbonItemType.DropDown,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            },  {
                                id: "item02",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item03",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: "item06",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: "item09",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: 'item010',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button6',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item009",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }, {
                                id: "item006",
                                type: RibbonItemType.SplitButton,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: "item002",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0];
            keyboardEventArgs.key = 'Tab';
            let target: HTMLElement = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            document.activeElement.classList.contains('e-checkbox');
            expect(target.querySelector('#item8_container').querySelector('.e-frame').classList.contains('e-check')).toBe(true);
            keyboardEventArgs.key = " ";
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect(target.querySelector('#item8_container').querySelector('.e-frame').classList.contains('e-check')).toBe(false);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('3');
           keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('4');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('5');
        });

        it('Keyboard Navigation Using Shift + Tab With Overflow Popup Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            },  {
                                id: "item02",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Overflow,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }, {
                                id: "item03",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: "item06",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Dictate',
                                    iconCss: 'sf-icon-dictate',
                                    items: [{ text: 'Chinese' }, { text: 'English' }, { text: 'German' }, { text: 'French' }]
                                }
                            }, {
                                id: 'item010',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button6',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item12",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            },
                            {
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            },
                            {
                                id: "item43",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            (document.querySelector('#group2_sim_grp_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#group2_sim_grp_overflow-popup').children[0];
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            let target: HTMLElement = document.querySelector('#group2_sim_grp_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#group2_sim_grp_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('5');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('4');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('3');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
        });

        it('Keyboard Navigation Using ArrowDown With Overflow Combobox Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item8',
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check2',
                                    checked: true,
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Auto,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item009",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Overflow,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0];
            keyboardEventArgs.key = 'ArrowDown';
            let target: HTMLElement = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'Tab';
            keyboardEventArgs.shiftKey = true;
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
        });

        it('Keyboard Navigation Using ArrowUp With Overflow Disabled Popup Items', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                disabled: true,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            },{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item3",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ComboBox,
                                displayOptions: DisplayMode.Auto,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true
                                }
                            },
                            {
                                id: "item5",
                                type: RibbonItemType.ColorPicker,
                                displayOptions: DisplayMode.Auto,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 2,
                        enableGroupOverflow: true,
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: 'item7',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                disabled: true,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button4',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            },{
                                id: "item060",
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button',
                                    iconCss: 'e-icons e-cut',
                                }
                            }, {
                                id: "item03",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    iconCss: 'e-icons e-table',
                                    content: 'Table',
                                    items: [
                                        { text: 'Insert Table' }, { text: 'Draw Table' },
                                        { text: 'Convert Table' }, { text: 'Excel SpreadSheet' }
                                    ]
                                }
                            }, {
                                id: 'item010',
                                type: RibbonItemType.Button,
                                displayOptions: DisplayMode.Overflow,
                                allowedSizes: RibbonItemSize.Large,
                                disabled: true,
                                buttonSettings: {
                                    content: 'button6',
                                    iconCss: 'e-icons e-cut',
                                    isToggle: true
                                }
                            }]
                        }]
                    },
                    {
                        id: "group3",
                        header: "group3Header",
                        priority: 3,
                        collections: [{
                            id: "collection4",
                            items: [{
                                id: "item10",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Simplified,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            },
                            {
                                id: "item11",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Auto,
                                checkBoxSettings: {
                                    label: 'Check1',
                                    checked: true,
                                }
                            }]
                        },
                        {
                            id: "collection5",
                            items: [{
                                id: "item13",
                                type: RibbonItemType.CheckBox,
                                displayOptions: DisplayMode.Overflow,
                                checkBoxSettings: {
                                    label: 'Check3',
                                    checked: true,
                                }
                            },
                            {
                                id: "item43",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-of-btn').length).toBe(1);
            expect(ribbon.element.querySelectorAll('.e-ribbon-overall-of-btn').length).toBe(1);
            (document.querySelector('#group2_sim_grp_overflow') as HTMLElement).click();
            keyboardEventArgs.target = document.querySelector('#group2_sim_grp_overflow-popup').children[0];
            keyboardEventArgs.key = 'ArrowUp';
            let target: HTMLElement = document.querySelector('#group2_sim_grp_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#group2_sim_grp_overflow') as any).ej2_instances[0];
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowUp';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.shiftKey = true;
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.shiftKey = true;
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.shiftKey = true;
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.shiftKey = true;
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.shiftKey = false;
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'Tab';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('2');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, true, ddb);
            expect((document.querySelector('#group2_sim_grp_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
            
        });

        it('Keyboard Navigation with template items', () => {
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            let template2 = createElement('button', { id: 'btn2', className: 'tempContent2', innerHTML: 'Button2' });
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",
                    groups: [{
                        header: "Templates",
                        orientation: ItemOrientation.Column,
                        groupIconCss:'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Template,
                                allowedSizes: RibbonItemSize.Medium,
                                itemTemplate: template1
                            }, {
                                type: RibbonItemType.Template,
                                allowedSizes: RibbonItemSize.Medium,
                                itemTemplate: template2.outerHTML
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            containerEle.style.width = '1500px';
            ribbon.refreshLayout();
            let tabEle: HTMLElement = document.querySelector('.e-tab-wrap');
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'}));
            tabEle.dispatchEvent(new KeyboardEvent('keydown',{'key':'Tab'}));
            (ribbonEle.querySelector('#ribbon_tab0_group1_collection2_item3')as HTMLElement).focus();
            expect(document.activeElement.classList.contains('e-ribbon-template')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group1_collection2_item3');
            keyboardEventArgs.target = document.activeElement;
            keyboardEventArgs.action = 'rightarrow';
            (ribbon as any).keyActionHandler(keyboardEventArgs);
            expect(document.activeElement.classList.contains('e-ribbon-template')).toBe(true);
            expect((document.activeElement as HTMLElement).getAttribute('id')).toBe('ribbon_tab0_group1_collection2_item4');
            containerEle.style.width = '100px';
            ribbon.setProperties({ activeLayout: 'Simplified' });
            ribbon.refreshLayout();
            (document.querySelector('#ribbon_tab_sim_ovrl_overflow') as HTMLElement).click();
            let target: HTMLElement = document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').children[0] as HTMLElement;
            let ddb: DropDownButton = (ribbon.element.querySelector('#ribbon_tab_sim_ovrl_overflow') as any).ej2_instances[0];
            keyboardEventArgs.target = target;
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('0');
            keyboardEventArgs.key = 'ArrowDown';
            (ribbon as any).upDownKeyHandler(keyboardEventArgs, target, false, ddb);
            expect((document.querySelector('#ribbon_tab_sim_ovrl_overflow-popup').querySelector('.e-ribbon-overflow-target') as HTMLElement).getAttribute('index')).toBe('1');
        });
    
    });

    describe('Items allowedSizes and actualSize', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:600px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });

        it('Normal to Simplified mode without oveflow ', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        }, 
                        {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Medium,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }, 
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 1,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }]
                        }]
                    }]
                }]
                }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(2);
            expect((ribbon.element.querySelector('#item1').closest('.e-ribbon-large-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item5').closest('.e-ribbon-small-item')) != null).toBe(true);
            ribbon.setProperties({ activeLayout: 'Simplified' });
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect((ribbon.element.querySelector('#item1').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item5').closest('.e-ribbon-small-item')) != null).toBe(true);
        });
        it('Normal to Simplified mode with oveflow ', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        }, 
                        {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Medium,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }, 
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 1,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }]
                        }]
                    }]
                }]
                }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(2);
            expect((ribbon.element.querySelector('#item1')) != null).toBe(false);
            expect((ribbon.element.querySelector('#item2')) != null).toBe(false);
            expect((ribbon.element.querySelector('#item5')) != null).toBe(false);
            ribbon.setProperties({ activeLayout: 'Simplified' });
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect((document.body.querySelector('#item1').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((document.body.querySelector('#item2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((document.body.querySelector('#item5').closest('.e-ribbon-medium-item')) != null).toBe(true);
        });
        it('Simplified to Normal mode with oveflow ', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        enableGroupOverflow: true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "items1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                displayOptions: DisplayMode.Overflow,
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        }, 
                        {
                            id: "collection2",
                            items: [{
                                id: "items2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Overflow,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "items3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Medium,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "items4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }, 
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 1,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "items5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                displayOptions: DisplayMode.Overflow,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            },
                            {
                                id: "items6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            },
                            {
                                id: "items7",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }]
                        }]
                    }]
                }]
                }, ribbonEle);
            
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect((document.body.querySelector('#items1').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((document.body.querySelector('#items2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((document.body.querySelector('#items5').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect(document.body.querySelector('#items2.e-btn').textContent).toBe('Edit');
            ribbon.ribbonButtonModule.updateButton({ content: 'Edit Button'}, 'items2');
            expect(document.body.querySelector('#items2.e-btn').textContent).toBe('Edit Button');
            ribbon.ribbonButtonModule.updateButton({ content: 'Edit'}, 'items2');
            expect(document.body.querySelector('#items2.e-btn').textContent).toBe('Edit');
            expect(document.body.querySelector('#items5.e-btn').textContent).toBe('Bold');
            ribbon.ribbonButtonModule.updateButton({ content: 'Bold Button'}, 'items5');
            expect(document.body.querySelector('#items5.e-btn').textContent).toBe('Bold Button');
            ribbon.ribbonButtonModule.updateButton({ content: 'Bold'}, 'items5');
            expect(document.body.querySelector('#items5.e-btn').textContent).toBe('Bold');
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-cut')).toBe(false);
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-italic')).toBe(true);
            ribbon.ribbonButtonModule.updateButton({ iconCss: 'e-icons e-cut'}, 'items6');
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-cut')).toBe(true);
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-italic')).toBe(false);
            ribbon.ribbonButtonModule.updateButton({ iconCss: 'e-icons e-italic'}, 'items6');
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-cut')).toBe(false);
            expect(document.body.querySelector('#items6.e-btn .e-btn-icon').classList.contains('e-italic')).toBe(true);
            ribbon.setProperties({ activeLayout: 'Classic' });
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(2);
            expect((ribbon.element.querySelector('#items1')) != null).toBe(false);
            expect((ribbon.element.querySelector('#items2')) != null).toBe(false);
            expect((ribbon.element.querySelector('#items5')) != null).toBe(false);
        });
        it('Simplified to Normal mode without oveflow ', () => {
            let isfiltered: boolean = false;
            let template1 = '<button id="btn1" class="tempContent">Button1</button>';
            ribbon = new Ribbon({
                activeLayout: 'Simplified',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        priority: 1,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        }, 
                        {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            },
                            {
                                id: "item3",
                                type: RibbonItemType.ComboBox,
                                allowedSizes: RibbonItemSize.Medium,
                                comboBoxSettings: {
                                    dataSource: sportsData,
                                    index: 1,
                                    allowFiltering: true,
                                    filtering: function (e: FilteringEventArgs) {
                                        isfiltered = true;
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                        e.updateData(sportsData, combobox_query);
                                    }
                                }
                            },
                            {
                                id: "item4",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }]
                        }]
                    }, 
                    {
                        id: "group2",
                        header: "group2Header",
                        priority: 1,
                        collections: [{
                            id: "collection3",
                            items: [{
                                id: "item5",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            },
                            {
                                id: "item6",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            },
                            {
                                id: "item7",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }]
                        }]
                    }]
                }]
                }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
            expect((ribbon.element.querySelector('#item1').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item5').closest('.e-ribbon-small-item')) != null).toBe(true);
            ribbon.setProperties({ activeLayout: 'Classic' });
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(3);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(2);
            expect((ribbon.element.querySelector('#item1').closest('.e-ribbon-large-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item2').closest('.e-ribbon-medium-item')) != null).toBe(true);
            expect((ribbon.element.querySelector('#item5').closest('.e-ribbon-small-item')) != null).toBe(true);
        });
    });

    describe('Help pane Template', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let targetEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
            targetEle = createElement('div', { id: 'ribbonTarget', innerHTML: 'Ribbon' });
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('With Default values', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },],
                helpPaneTemplate: targetEle.outerHTML
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-ribbon-help-template') !== null).toBe(true);
            expect(ribbon.element.querySelector('#ribbon_helppanetemplate') !== null).toBe(true);
            expect(ribbon.element.querySelector('#ribbon_helppanetemplate').textContent).toBe('Ribbon');
        });
        it('dynamic property change', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },],
                helpPaneTemplate: targetEle.outerHTML
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-ribbon-help-template') !== null).toBe(true);
            expect(ribbon.element.querySelector('#ribbon_helppanetemplate') !== null).toBe(true);
            expect(ribbon.element.querySelector('#ribbon_helppanetemplate').textContent).toBe('Ribbon');
            ribbon.helpPaneTemplate = 'HelpPaneTemplate';
            ribbon.dataBind();
            expect(ribbon.element.querySelector('#ribbon_helppanetemplate').textContent).toBe('HelpPaneTemplate');
        });
        it('events - mode switching', () => {
            let isRibbonExpanding: boolean = false;
            let isRibbonCollapsing: boolean = false;
            let isRibbonLayoutSwitched: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: null,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    },
                    {
                        id: "group2",
                        header: "group2Header",
                        enableGroupOverflow: false,
                        collections: [{
                            id: "collection1",
                        }]
                    }]
                },],
                ribbonExpanding: (args: ExpandCollapseEventArgs) => {
                    isRibbonExpanding = true;
                },
                ribbonCollapsing: (args: ExpandCollapseEventArgs) => {
                    isRibbonCollapsing = true;
                },
                ribbonLayoutSwitched: (args: LayoutSwitchedEventArgs) => {
                    isRibbonLayoutSwitched = true;
                }
            }, ribbonEle);
            expect(isRibbonCollapsing).toBe(false);
            expect(isRibbonLayoutSwitched).toBe(false);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(isRibbonCollapsing).toBe(false);
            expect(isRibbonLayoutSwitched).toBe(true);
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
            expect(isRibbonExpanding).toBe(false);
            ribbon.activeLayout = "Simplified";
            ribbon.refreshLayout();
            (ribbon.element.querySelector('.e-ribbon-collapse-btn') as HTMLElement).click();
        });
        it('events - tabs switching', () => {
            let isTabSelecting: boolean = false;
            let isTabSelected: boolean = false;
            let isRibbonExpanding: boolean = false;
            let isRibbonCollapsing: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },{
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group2Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }],
                tabSelecting: (args: TabSelectingEventArgs) => {
                    isTabSelecting = true;
                },
                tabSelected: (args: TabSelectedEventArgs) => {
                    isTabSelected = true;
                },
                ribbonExpanding: (args: ExpandCollapseEventArgs) => {
                    isRibbonExpanding = true;
                },
                ribbonCollapsing: (args: ExpandCollapseEventArgs) => {
                    isRibbonCollapsing = true;
                }
            }, ribbonEle);
            expect(isRibbonCollapsing).toBe(false);
            expect(isTabSelecting).toBe(false);
            expect(isTabSelected).toBe(false);
            let li: HTMLElement = ribbon.element.querySelector('#tab1_header') as HTMLElement;
            triggerMouseEvent(li, 'dblclick');
            expect(isRibbonCollapsing).toBe(true);
            (ribbon.element.querySelector('#tab2_header') as HTMLElement).click();
            expect(isRibbonExpanding).toBe(true);
            ribbon.setProperties({ selectedTab: 1 });
            expect(isTabSelecting).toBe(true);
            expect(isTabSelected).toBe(true);
        });
        it('events - Ribbon Created', () => {
            let isCreated: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }],
                created:() => {
                    isCreated = true;
                },
            }, ribbonEle);
            expect(isCreated).toBe(true);
        });
    });
    describe('Tooltip', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let targetEle: HTMLElement;
        let mouseEventArs: any;

        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
            targetEle = createElement('div', { id: 'ribbonTarget', innerHTML: 'Ribbon' });
            mouseEventArs = {
                preventDefault: (): void => { },
                stopImmediatePropagation: (): void => { },
                target: null,
                relatedTarget: null,
                type: null,
                shiftKey: false,
                ctrlKey: false,
                offset: Number
            };
        });
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('position', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'Buttons',
                                    iconCss: 'e-icons e-cut',
                                    content: 'Large size button'
                                },
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[0].classList.contains('e-ribbon-tooltip-target')).toBe(true);
            let tooltipElement: HTMLElement = ribbon.element.querySelector('.e-ribbon-item');
            let item = document.getElementById('item1_container');
            let calculatePosition = item.getBoundingClientRect();
            let itemPosition = calculatePosition.top + calculatePosition.height;
            setTimeout(() => {
                triggerMouseEvent(tooltipElement, 'mouseover');
                setTimeout(() => {
                    expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'Buttons').toBe(true);
                    expect(document.querySelector('.e-ribbon-tooltip-icon').classList.contains('e-cut')).toBe(true);
                    let tooltip = document.querySelector('.e-ribbon-tooltip');
                    let tooltipPosition = tooltip.getBoundingClientRect();
                    let position: boolean = tooltipPosition.top > itemPosition;
                    expect(position).toBe(true);
                    expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Large size button').toBe(true);
                    expect(document.querySelectorAll('#e-ribbon-tooltip-container') !== null).toBe(true);
                    done();
                }, 450);
            }, 450);
            triggerMouseEvent(tooltipElement, 'mouseleave');
        });
        it('with Items', (done) => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'Buttons',
                                    iconCss: 'e-icons e-cut',
                                    content: 'Large size button',
                                    cssClass: 'custom-items'
                                },
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[0].classList.contains('e-ribbon-tooltip-target')).toBe(true);
            let tooltipElement: HTMLElement = ribbon.element.querySelector('.e-ribbon-item');
            setTimeout(() => {
                triggerMouseEvent(tooltipElement, 'mouseover');
                setTimeout(() => {
                    expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'Buttons').toBe(true);
                    expect(document.querySelector('.e-ribbon-tooltip-icon').classList.contains('e-cut')).toBe(true);
                    expect(document.querySelector('.e-ribbon-tooltip').classList.contains('custom-items')).toBe(true);
                    expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Large size button').toBe(true);
                    expect(document.querySelectorAll('#e-ribbon-tooltip-container') !== null).toBe(true);
                    done();
                }, 450);
            }, 450);
            triggerMouseEvent(tooltipElement, 'mouseleave');
        });
        it('with FileMenu', () => {
            let ribbonTooltip: RibbonTooltipModel = ({
                id: 'files',
                content: 'Explore files',
                title: 'Files',
                iconCss: 'e-icons e-copy',
                cssClass: 'custom-ribbon'
            });
            let files: FileMenuSettingsModel = ({
                text: 'File Menu',
                visible: true,
                popupTemplate: '#ribbonTarget',
                ribbonTooltipSettings: ribbonTooltip
            });
            ribbon = new Ribbon({
                fileMenu: files,
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'Buttons',
                                    iconCss: 'e-icons e-cut',
                                    content: 'Large size button'
                                },
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-file-menu')[0].classList.contains('e-ribbon-tooltip-target')).toBe(true);
            let tooltipElement: any = ribbon.element.querySelector('.e-ribbon-file-menu');
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'Files').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-icon').classList.contains('e-copy')).toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip').classList.contains('custom-ribbon')).toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Explore files').toBe(true);
            expect(document.querySelector('#e-ribbon-tooltip-container_files') !== null).toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
        });
        it('with dynamic property change', () => {
            let ribbonTooltip: RibbonTooltipModel = ({
                content: 'Explore files',
                title: 'Files'
            })
            let files: FileMenuSettingsModel = ({
                text: 'File Menu',
                visible: true,
                ribbonTooltipSettings: ribbonTooltip
            });
            ribbon = new Ribbon({
                fileMenu: files,
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'Buttons',
                                    content: 'Large size button'
                                },
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-file-menu')[0].classList.contains('e-ribbon-tooltip-target')).toBe(true);
            let tooltipElement: any = ribbon.element.querySelector('.e-ribbon-file-menu');
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'Files').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Explore files').toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
            ribbon.fileMenu.ribbonTooltipSettings.title = 'File Menu';
            ribbon.fileMenu.ribbonTooltipSettings.content = 'Explore files here';
            ribbon.dataBind();
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'File Menu').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Explore files here').toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
            tooltipElement = ribbon.element.querySelector('.e-ribbon-item');
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'Buttons').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Large size button').toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
            let item: RibbonItemModel = {
                type: RibbonItemType.DropDown,
                allowedSizes: RibbonItemSize.Small,
                id: 'newItem',
                ribbonTooltipSettings: {
                    title: 'dropdown button',
                    content: 'Large size button'
                },
                dropDownSettings: {
                    content: 'Edit',
                    iconCss: 'e-icons e-edit',
                    items: dropDownButtonItems
                }
            }
            ribbon.addItem('collection1', item);
            expect(ribbon.element.querySelectorAll('.e-ribbon-item')[1].classList.contains('e-ribbon-tooltip-target')).toBe(true);
            tooltipElement = ribbon.element.querySelectorAll('.e-ribbon-item')[1];
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'dropdown button').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Large size button').toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
            ribbon.fileMenu.visible = false;
            ribbon.dataBind();
            expect(ribbon.element.querySelector('.e-ribbon-file-menu') === null).toBe(true);

        });

    });
    describe('Tooltip', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        let template1 = '<button id="btn1" class="tempContent">Button1</button>';
        let template2 = createElement('button', { id: 'btn2', className: 'tempContent2', innerHTML: 'Button2' });
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:200px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
            remove(containerEle);
        });
        it('with Overflow dropdown', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",
                    groups: [ {
                        header: "Font",
                        orientation: 'Row',
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    index: 2,
                                    allowFiltering: true,
                                    width: '150px',
                                    filtering: function (e: FilteringEventArgs) {
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                    }
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    index: 4,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }, {
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }

                            ]
                        }]
                    }, {
                        header: "Templates",
                        orientation: ItemOrientation.Column,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                type: RibbonItemType.Template,
                                itemTemplate: template2.outerHTML
                            }]
                        }]
                    },{
                        header: "Clipboard",
                        id:"group3",
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                id:"ddbitem",
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'paste here',
                                    iconCss: 'e-icons e-paste',
                                    content: 'Copy and Paste the documents'
                                },
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        },]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('#group3_overflow_dropdown') as HTMLElement).click();
            expect(document.querySelectorAll('e-ribbon-tooltip-target') !== null).toBe(true);
            let tooltipElement: any = document.querySelector('#ddbitem_container');
            triggerMouseEvent(tooltipElement, 'mouseover');
            expect(document.querySelector('.e-ribbon-tooltip-title').innerHTML === 'paste here').toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-icon').classList.contains('e-paste')).toBe(true);
            expect(document.querySelector('.e-ribbon-tooltip-content').innerHTML === 'Copy and Paste the documents').toBe(true);
            triggerMouseEvent(tooltipElement, 'mouseleave');
        });
    });
    describe('Launcher Icon', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('With ShowLauncherIcon is true', () => {
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        showLauncherIcon:true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },]
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-ribbon-launcher-icon') !== null).toBe(true);
            expect(ribbon.element.querySelector('.e-launcher') !== null).toBe(true);
            expect(ribbon.element.querySelector('#group1_launcher')!== null).toBe(true);
        });
        it('dynamic property change', () => {
            ribbon = new Ribbon({
                launcherIconCss: 'e-icons e-copy',
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        showLauncherIcon:true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },]
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-launcher') !== null).toBe(false);
            expect(ribbon.element.querySelector('.e-copy') !== null).toBe(true);
            ribbon.launcherIconCss='e-icons e-cut';
            ribbon.dataBind();
            expect(ribbon.element.querySelector('.e-cut') !== null).toBe(true);
            ribbon.removeGroup('group1');
            expect(ribbon.element.querySelector('.e-ribbon-launcher-icon') === null).toBe(true);
        });
        it('events', () => {
            let isLauncherIconClicked: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        showLauncherIcon:true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },],
                launcherIconClick: (args: LauncherClickEventArgs) => {
                    isLauncherIconClicked = true;
                },
            }, ribbonEle);
            expect(isLauncherIconClicked).toBe(false);
            (ribbon.element.querySelector('.e-ribbon-launcher-icon') as HTMLElement).click();
            expect(isLauncherIconClicked).toBe(true);
        });
        it('and collapse button keyboard navigation', () => {
            let isLauncherIconClicked: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        showLauncherIcon:true,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                },],
                launcherIconClick: (args: LauncherClickEventArgs) => {
                    isLauncherIconClicked = true;
                },
            }, ribbonEle);
            expect(isLauncherIconClicked).toBe(false);
            document.querySelector('.e-ribbon-launcher-icon').dispatchEvent((new KeyboardEvent('keydown',{'key':'Enter'})));
            expect(isLauncherIconClicked).toBe(true);
            expect(document.querySelector('.e-ribbon-collapse-btn').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            expect(ribbon.element.querySelector('.e-ribbon-expand-btn') !== null).toBe(true);
            expect(document.querySelector('.e-ribbon-collapse-btn').dispatchEvent(new KeyboardEvent('keydown',{'key':'Enter'})));
            expect(ribbon.element.querySelector('.e-ribbon-expand-btn') === null).toBe(true);
        });
    });
    describe('Launcher Icon in Overflow', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        let containerEle: HTMLElement;
        let template1 = '<button id="btn1" class="tempContent">Button1</button>';
        let template2 = createElement('button', { id: 'btn2', className: 'tempContent2', innerHTML: 'Button2' });
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            containerEle = createElement('div', { id: 'container', styles: 'width:200px' });
            containerEle.appendChild(ribbonEle);
            document.body.appendChild(containerEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('with dynamic property change', () => {
            ribbon = new Ribbon({
                tabs: [{
                    header: "Home",
                    groups: [{
                        header: "Clipboard",
                        groupIconCss: 'e-icons e-paste',
                        showLauncherIcon:true,
                        collections: [{
                            items: [{
                                type: RibbonItemType.SplitButton,
                                allowedSizes: RibbonItemSize.Large,
                                ribbonTooltipSettings: {
                                    title: 'paste here',
                                    iconCss: 'e-icons e-paste',
                                    content: 'Copy and Paste the documents'
                                },
                                splitButtonSettings: {
                                    content: 'Paste',
                                    iconCss: 'e-icons e-paste',
                                    items: [{ text: 'Keep Source Format' }, { text: 'Merge format' }, { text: 'Keep text only' }]
                                }
                            }]
                        },]
                    }, {
                        header: "Font",
                        orientation: 'Row',
                        groupIconCss: 'e-icons e-bold',
                        cssClass: 'font-group',
                        collections: [{
                            items: [{
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    index: 2,
                                    allowFiltering: true,
                                    width: '150px',
                                    filtering: function (e: FilteringEventArgs) {
                                        let combobox_query = new Query();
                                        combobox_query = (e.text !== '') ? combobox_query.where('', 'contains', e.text, true) : combobox_query;
                                    }
                                }
                            }, {
                                type: RibbonItemType.ComboBox,
                                comboBoxSettings: {
                                    index: 4,
                                    width: '65px'
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Bold',
                                    iconCss: 'e-icons e-bold'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'Italic',
                                    iconCss: 'e-icons e-italic'
                                }
                            }, {
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Small,
                                buttonSettings: {
                                    content: 'UnderLine',
                                    iconCss: 'e-icons e-underline'
                                }
                            }, {
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456'
                                }
                            }

                            ]
                        }]
                    }, {
                        header: "Templates",
                        orientation: ItemOrientation.Column,
                        groupIconCss: 'e-icons e-paste',
                        collections: [{
                            items: [{
                                type: RibbonItemType.Template,
                                itemTemplate: template1
                            }, {
                                type: RibbonItemType.Template,
                                itemTemplate: template2.outerHTML
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            (ribbon.element.querySelector('.e-ribbon-group-overflow-ddb') as HTMLElement).click();
            expect(document.querySelector('.e-ribbon-launcher-icon') !== null).toBe(true);
            expect(document.querySelector('.e-launcher') !== null).toBe(true);
            ribbon.launcherIconCss='e-icons e-cut';
            ribbon.dataBind();
            expect(document.querySelector('.e-cut') !== null).toBe(true);
        });
    });
    describe('Ribbon layout modes', () => {
        let ribbon: Ribbon;
        let ribbonEle: HTMLElement;
        beforeEach(() => {
            ribbonEle = createElement('div', { id: 'ribbon' });
            document.body.appendChild(ribbonEle);
        })
        afterEach(() => {
            if (ribbon) {
                ribbon.destroy();
                ribbon = undefined;
            }
            remove(ribbonEle);
        });
        it('simplified mode', () => {
            ribbon = new Ribbon({
                activeLayout: "Simplified",
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button1',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }, {
                            items: [{
                                type: RibbonItemType.DropDown,
                                allowedSizes: RibbonItemSize.Medium,
                                displayOptions: DisplayMode.Classic,
                                dropDownSettings: {
                                    content: 'Edit',
                                    iconCss: 'e-icons e-edit',
                                    items: dropDownButtonItems
                                }
                            }]
                        }]
                    }]
                }, {
                    id: "tab2",
                    header: "tab2",
                    groups: [{
                        id: "group2",
                        header: "group1Header",
                        collections: [{
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.Button,
                                allowedSizes: RibbonItemSize.Large,
                                buttonSettings: {
                                    content: 'button2',
                                    iconCss: 'e-icons e-cut',
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelectorAll('.e-ribbon-row').length).toBe(0);
            expect(ribbon.element.querySelectorAll('.e-ribbon-group-header').length).toBe(0);
        });

        it('split button active state', () => {
            let isSplitButtonOpen: boolean = false;
            let isSplitButtonClose: boolean = false;
            let isColorPickerOpen: boolean = false;
            let isColorPickerBeforeClose: boolean = false;
            ribbon = new Ribbon({
                tabs: [{
                    id: "tab1",
                    header: "tab1",
                    groups: [{
                        id: "group1",
                        header: "group1Header",
                        orientation: ItemOrientation.Row,
                        collections: [{
                            id: "collection1",
                            items: [{
                                id: "item1",
                                type: RibbonItemType.SplitButton,
                                splitButtonSettings: {
                                    iconCss: 'e-icons e-search',
                                    content: 'Find',
                                    items: [
                                        { text: 'Find', iconCss: 'e-icons e-search' },
                                        { text: 'Advanced find', iconCss: 'e-icons e-search' },
                                        { text: 'Go to', iconCss: 'e-icons e-arrow-right' }
                                    ],
                                    open: (args: OpenCloseMenuEventArgs) => {
                                        isSplitButtonOpen = true;
                                    },
                                    close: (args: OpenCloseMenuEventArgs) => {
                                        isSplitButtonClose = true;
                                    }
                                }
                            }]
                        }, {
                            id: "collection2",
                            items: [{
                                id: "item2",
                                type: RibbonItemType.ColorPicker,
                                colorPickerSettings: {
                                    value: '#123456',
                                    open: (args: OpenCloseMenuEventArgs) => {
                                        isColorPickerOpen = true;
                                    },
                                    beforeClose: (args: OpenCloseMenuEventArgs) => {
                                        isColorPickerBeforeClose = true;
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            }, ribbonEle);
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList.contains('e-ribbon-hover')).toBe(false);
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList.contains('e-ribbon-open')).toBe(false);
            let splitButton: HTMLElement = ribbon.element.querySelector('.e-split-btn-wrapper') as HTMLElement;
            triggerMouseEvent(splitButton, 'mouseenter');
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList).toContain('e-ribbon-hover');
            triggerMouseEvent(splitButton, 'mouseleave');
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList.contains('e-ribbon-hover')).toBe(false);
            expect(isSplitButtonOpen).toBe(false);
            expect(isSplitButtonClose).toBe(false);
            (ribbon.element.querySelector('#item1') as any).ej2_instances[0].openPopUp();
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList).toContain('e-ribbon-open');
            expect(isSplitButtonOpen).toBe(true);
            (ribbon.element.querySelector('#item1') as any).ej2_instances[0].closePopup();
            expect(ribbon.element.querySelector('.e-split-btn-wrapper').classList.contains('e-ribbon-open')).toBe(false);
            expect(isSplitButtonClose).toBe(true);
            //colorpicker
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList.contains('e-ribbon-hover')).toBe(false);
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList.contains('e-ribbon-open')).toBe(false);
            let colorPicker: HTMLElement = ribbon.element.querySelector('.e-colorpicker-wrapper') as HTMLElement;
            triggerMouseEvent(colorPicker, 'mouseenter');
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList).toContain('e-ribbon-hover');
            triggerMouseEvent(colorPicker, 'mouseleave');
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList.contains('e-ribbon-hover')).toBe(false);
            expect(isColorPickerOpen).toBe(false);
            expect(isColorPickerBeforeClose).toBe(false);
            // (ribbon.element.querySelector('.e-split-colorpicker') as any).ej2_instances[0].openPopUp();
            ribbon.ribbonColorPickerModule.toggle('item2');
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList).toContain('e-ribbon-open');
            expect(isColorPickerOpen).toBe(true);
            // (ribbon.element.querySelector('.e-split-colorpicker') as any).ej2_instances[0].closePopup();
            ribbon.ribbonColorPickerModule.toggle('item2');
            expect(ribbon.element.querySelector('.e-colorpicker-wrapper').classList.contains('e-ribbon-open')).toBe(false);
            expect(isColorPickerBeforeClose).toBe(true);
        });
    });
    
    it('memory leak', () => {
        profile.sample();
        const average: any = inMB(profile.averageChange);
        // check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        const memory: any = inMB(getMemoryProfile());
        // check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});
