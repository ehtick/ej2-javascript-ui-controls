/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement, Browser, EventHandler, extend } from '@syncfusion/ej2-base';
import { Schedule, EJ2Instance, Day, Week, WorkWeek, Month, ScheduleModel } from '../../../src/schedule/index';
import { triggerSwipeEvent, CommonArgs, destroy, createSchedule } from '../util.spec';
import { defaultData } from '../base/datasource.spec';
import { profile, inMB, getMemoryProfile } from '../../common.spec';

Schedule.Inject(Day, Week, WorkWeek, Month);

describe('Touch functionalities', () => {
    let touchTestObj: any;
    let node: Element;
    const startMouseEventArs: CommonArgs = {
        clientX: 200, clientY: 200, target: node, type: 'touchstart',
        preventDefault: (): void => { /** Do Nothing */ },
        stopPropagation: (): void => { /** Do Nothing */ }
    };
    const moveMouseEventArs: CommonArgs = {
        clientX: 500, clientY: 200, target: node, type: 'touchmove',
        preventDefault: (): void => { /** Do Nothing */ },
        stopPropagation: (): void => { /** Do Nothing */ }
    };
    const endMouseEventArs: CommonArgs = {
        clientX: 200, clientY: 200, target: node, type: 'touchend',
        preventDefault: (): void => { /** Do Nothing */ },
        stopPropagation: (): void => { /** Do Nothing */ }
    };

    const uA: string = Browser.userAgent;
    const androidUserAgent: string = 'Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JWR66Y) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.92 Safari/537.36';

    beforeAll(() => {
        Browser.userAgent = androidUserAgent;

        const isDef: (o: any) => boolean = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            // eslint-disable-next-line no-console
            console.log('Unsupported environment, window.performance.memory is unavailable');
            (this as any).skip(); //Skips test (in Chai)
            return;
        }
    });
    afterAll(() => {
        Browser.userAgent = uA;
    });

    describe('swipe actions', () => {
        let schObj: Schedule;
        beforeEach((): void => {
            schObj = undefined;
            document.body.appendChild(createElement('div', { id: 'Schedule' }));
        });
        afterEach((): void => {
            destroy(schObj);
        });
        it('swipe right touch move different points', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 50, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 80, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 100, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 250, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Wed</div><div class="e-header-date e-navigate" role="link">4</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 4).getTime());
        });
        it('swipe left touch move different points', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 250, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 220, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 200, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 50, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Fri</div><div class="e-header-date e-navigate" role="link">6</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 6).getTime());
        });
        it('swipe other than left and right direction', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 200, clientY: 300, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, {
                type: 'touchmove', clientX: 200, clientY: 150, target: target
            });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 200, clientY: 100, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Thu</div><div class="e-header-date e-navigate" role="link">5</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 5).getTime());
        });
        it('cancel swipe', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 200, clientY: 300, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, {
                type: 'touchmove', clientX: 210, clientY: 300, target: target
            });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, {
                type: 'touchmove', clientX: 200, clientY: 150, target: target
            });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 200, clientY: 100, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Thu</div><div class="e-header-date e-navigate" role="link">5</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 5).getTime());
        });
        it('swipe left and then moved to right direction', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 80, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 50, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 250, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 250, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Wed</div><div class="e-header-date e-navigate" role="link">4</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 4).getTime());
        });
        it('swipe right and then moved to left direction', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 180, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 250, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 50, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 50, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Fri</div><div class="e-header-date e-navigate" role="link">6</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 6).getTime());
        });
        it('start swipe while before previous swipe transition end', () => {
            schObj = new Schedule({ currentView: 'Day', selectedDate: new Date(2017, 9, 5), height: 500, width: 300 });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 200, target: target });
            const moveArgs: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 100, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 100, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs);
            touchTestObj.endEvent(movedEnd);
            const moveStart2: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 210, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 110, target: target });
            const movedEnd2: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 110, target: target });
            touchTestObj.startEvent(moveStart2);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd2);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Sat</div><div class="e-header-date e-navigate" role="link">7</div>');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.selectedDate.getTime()).toEqual(new Date(2017, 9, 7).getTime());
        });
        it('Negative case for swipe', () => {
            schObj = new Schedule({ currentView: 'Agenda', height: 500, width: 300, selectedDate: new Date(2018, 6, 5) });
            schObj.appendTo('#Schedule');
            node = schObj.element.querySelector('.e-table-container');
            expect(node.childNodes.length).toEqual(1);
            expect(schObj.currentView).toEqual('Agenda');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 50, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 80, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 100, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 250, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-tbar-btn-text').innerHTML).toEqual('July 2018');
            expect(schObj.currentView).toEqual('Agenda');
        });
    });

    describe('Appointment Tap and multiple select actions', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { selectedDate: new Date(2017, 10, 2), width: 300 };
            schObj = createSchedule(schOptions, defaultData, done);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('taphold appointment selection', () => {
            schObj.isAdaptive = true;
            const target: Element = schObj.element.querySelector('.e-appointment');
            const e: any = {}; e.originalEvent = {};
            e.target = target;
            e.type = 'touchstart';
            e.originalEvent.target = target;
            e.originalEvent.type = 'touchstart';
            (schObj.scheduleTouchModule as any).tapHoldHandler(e);
            expect(document.body.querySelector('.e-quick-popup-wrapper')).toBeTruthy();
        });
        it('Single appointment select using click or tap for multi select', () => {
            const eventElements: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-appointment'));
            schObj.isAdaptive = true;
            (eventElements[1] as HTMLElement).click();
            const popup: HTMLElement = document.body.querySelector('.e-quick-popup-wrapper') as HTMLElement;
            expect(popup).toBeTruthy();
            expect(popup.classList.contains('e-popup-open')).toBe(true);
            (eventElements[1] as HTMLElement).click();
            expect(schObj.element.querySelectorAll('.e-appointment-border').length).toBeGreaterThan(0);
            (eventElements[0] as HTMLElement).click();
            expect(schObj.element.querySelectorAll('.e-appointment-border').length).toBeGreaterThanOrEqual(0);
        });
        it('Negative case for taphold appointment selection', () => {
            schObj.isAdaptive = false;
            const target: Element = schObj.element.querySelector('.e-appointment');
            const e: any = {}; e.originalEvent = {};
            e.target = target;
            e.type = 'touchstart';
            e.originalEvent.target = target;
            e.originalEvent.type = 'touchstart';
            (schObj.scheduleTouchModule as any).tapHoldHandler(e);
            expect(document.body.querySelector('.e-quick-popup-wrapper')).toBeTruthy();
        });
    });

    describe('Disable swiping', () => {
        let schObj: Schedule;
        beforeAll(() => {
            const schOptions: ScheduleModel = {
                height: 500, width: 300, currentView: 'Day',
                selectedDate: new Date(2022, 7, 5), allowSwiping: false
            };
            schObj = createSchedule(schOptions, []);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('prevent date navigate swipe action', (done: DoneFn) => {
            triggerSwipeEvent(schObj.element.querySelector('.e-table-container'), 300);
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Fri</div><div class="e-header-date e-navigate" role="link">5</div>');
            setTimeout(
                () => {
                    expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                        .toEqual('<div class="e-header-day">Fri</div><div class="e-header-date e-navigate" role="link">5</div>');
                    expect(schObj.element.querySelector('.e-table-container').childNodes.length).toEqual(1);
                    expect(schObj.selectedDate.getTime()).toEqual(new Date(2022, 7, 5).getTime());
                    done();
                },
                400);
        });
    });

    describe('RTL Touch actions', () => {
        let schObj: Schedule;
        beforeAll(() => {
            const schOptions: ScheduleModel = {
                height: 500, width: 300, currentView: 'Day',
                selectedDate: new Date(2017, 9, 4), enableRtl: true
            };
            schObj = createSchedule(schOptions, []);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('navigate next date', (done: DoneFn) => {
            triggerSwipeEvent(schObj.element.querySelector('.e-table-container'), 300);
            setTimeout(
                () => {
                    expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                        .toEqual('<div class="e-header-day">Thu</div><div class="e-header-date e-navigate" role="link">5</div>');
                    done();
                },
                400);
        });

        it('navigate previous date', (done: DoneFn) => {
            triggerSwipeEvent(schObj.element.querySelector('.e-table-container'), 100);
            setTimeout(
                () => {
                    expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                        .toEqual('<div class="e-header-day">Wed</div><div class="e-header-date e-navigate" role="link">4</div>');
                    done();
                },
                400);
        });
        it('Negative case for navigate next date', () => {
            expect(schObj.headerModule).not.toBeNull();
            expect(schObj.element.querySelector('.e-date-range .e-tbar-btn-text').innerHTML).toEqual('October 2017');
            expect(schObj.element.querySelectorAll('.e-schedule-toolbar').length).toEqual(1);
            expect(schObj.element.querySelectorAll('.e-toolbar-item').length).toEqual(10);
            schObj.showHeaderBar = false;
            schObj.dataBind();
            triggerSwipeEvent(schObj.element.querySelector('.e-table-container'), 300);
            expect(schObj.headerModule).toBeNull();
            expect(schObj.element.querySelectorAll('.e-schedule-toolbar-container').length).toEqual(0);
            expect(schObj.element.querySelectorAll('.e-schedule-toolbar').length).toEqual(0);
        });
    });

    describe('EJ2MVC-469 Need to enable Schedule swipe action when performing swipe on the appointments', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { currentView: 'Day', selectedDate: new Date(2017, 10, 2), width: 300 };
            schObj = createSchedule(schOptions, defaultData, done);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('swipe right touch move different points', () => {
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-appointment');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 50, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 80, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 100, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 250, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Wed</div><div class="e-header-date e-navigate" role="link">1</div>');
        });
        it('swipe left touch move different points', () => {
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-appointment');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 250, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 220, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 200, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 50, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            EventHandler.trigger(<HTMLElement>node, 'transitionend');
            expect(schObj.element.querySelector('.e-date-header-container .e-header-cells').innerHTML)
                .toEqual('<div class="e-header-day">Thu</div><div class="e-header-date e-navigate" role="link">2</div>');
        });
    });

    describe('866131 - iOS appointment tap hold operation', () => {
        const iOSUserAgent: string = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) ' +
            'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
        let schObj: Schedule;
        const data: Record<string, any>[] = [{
            Id: 1,
            Subject: 'Event',
            StartTime: new Date(2024, 4, 10, 10),
            EndTime: new Date(2024, 4, 10, 12),
            IsAllDay: false
        }];
        beforeAll((done: DoneFn) => {
            Browser.userAgent = iOSUserAgent;
            const schOptions: ScheduleModel = {
                width: 300, currentView: 'Day',
                selectedDate: new Date(2024, 4, 10), allowDragAndDrop: false,
            };
            schObj = createSchedule(schOptions, data, done);
        });
        afterAll(() => {
            destroy(schObj);
        });

        it('taphold appointment selection', () => {
            schObj.isAdaptive = true;
            const target: Element = schObj.element.querySelector('.e-appointment');
            const e: any = {};
            e.originalEvent = new TouchEvent('touchstart', { cancelable: true, bubbles: true });
            target.dispatchEvent(e.originalEvent);
            (schObj.scheduleTouchModule as any).tapHoldHandler(e);
            const popup: HTMLElement = document.body.querySelector('.e-quick-popup-wrapper') as HTMLElement;
            expect(popup.classList.contains('e-popup-open')).toBeTruthy();
            e.originalEvent = new TouchEvent('touchend', { cancelable: true, bubbles: true });
            target.dispatchEvent(e.originalEvent);
            (schObj.scheduleTouchModule as any).preventEventClick(e.originalEvent);
            expect(popup.classList.contains('e-popup-open')).toBeTruthy();
            expect(popup.querySelector('.e-subject').textContent).toEqual('Event');
            (popup.querySelector('.e-close') as HTMLButtonElement).click();
            expect(popup.classList.contains('e-popup-close')).toBeTruthy();
        });
    });

    describe('Update renderDates for all resources during cancel swipe', () => {
        let schObj: Schedule;
        let newEvent = {
            Id: 3,
            Subject: 'Meeting',
            StartTime: new Date(2018, 3, 2, 9, 0),
            EndTime: new Date(2018, 3, 2, 10, 0),
            IsAllDay: false,
            RoomId: 1,
            OwnerId: 1
        };
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                selectedDate: new Date(2018, 3, 1),
                height: '800px',
                group: { resources: ['Rooms', 'Owners'] },
                resources: [{
                    field: 'RoomId', title: 'Room', name: 'Rooms', allowMultiple: true,
                    dataSource: [
                        { RoomText: 'ROOM 1', Id: 1, RoomColor: '#cb6bb2' },
                        { RoomText: 'ROOM 2', Id: 2, RoomColor: '#56ca85' }
                    ],
                    textField: 'RoomText', idField: 'Id', colorField: 'RoomColor'
                }, {
                    field: 'OwnerId', title: 'Owner', name: 'Owners', allowMultiple: true,
                    dataSource: [
                        { OwnerText: 'Nancy', Id: 1, OwnerGroupId: 1, OwnerColor: '#ffaa00' },
                        { OwnerText: 'Steven', Id: 2, OwnerGroupId: 2, OwnerColor: '#f8a398' },
                        { OwnerText: 'Michael', Id: 3, OwnerGroupId: 1, OwnerColor: '#7499e1' }
                    ],
                    textField: 'OwnerText', idField: 'Id', groupIDField: 'OwnerGroupId', colorField: 'OwnerColor'
                }]
            };
            schObj = createSchedule(schOptions, [], done);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('should update renderDates for all resources when cancel swipe occurs', (done: DoneFn) => {
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 200, clientY: 300, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, {
                type: 'touchmove', clientX: 210, clientY: 300, target: target
            });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, {
                type: 'touchmove', clientX: 200, clientY: 150, target: target
            });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 200, clientY: 100, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            const allResourcesUpdated = schObj.resourceBase.lastResourceLevel.every(
                (resource: any) => resource.renderDates === schObj.activeView.renderDates
            );
            expect(allResourcesUpdated).toBe(true);
            expect(schObj.resourceBase.lastResourceLevel.length).toBeGreaterThan(1);
            schObj.dataBound = function () {
                expect(schObj.eventsProcessed.length).toBeGreaterThanOrEqual(1);
                done();
            };
            schObj.addEvent(newEvent);
        });
    });

    describe('Update renderDates for all resources during cancel swipe', () => {
        let schObj: Schedule;
        let newEvent = {
            Id: 3,
            Subject: 'Meeting',
            StartTime: new Date(2018, 3, 2, 9, 0),
            EndTime: new Date(2018, 3, 2, 10, 0),
            IsAllDay: false,
            RoomId: 1,
            OwnerId: 1
        };
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                selectedDate: new Date(2018, 3, 1),
                height: '800px',
                currentView: 'WorkWeek',
                group: { resources: ['Owners'] , enableCompactView: false},
                resources: [ {
                        field: 'OwnerId', title: 'Owner', name: 'Owners', allowMultiple: true,
                        dataSource: [
                            { OwnerText: 'Nancy', Id: 1, OwnerColor: '#ffaa00', workDays: [1, 2, 3, 4, 5] },
                            { OwnerText: 'Steven', Id: 2,  OwnerColor: '#f8a398', workDays: [1, 3, 5] },
                        ],
                        textField: 'OwnerText', idField: 'Id',  colorField: 'OwnerColor', workDaysField: 'workDays'
                    }]
            };
            schObj = createSchedule(schOptions, [], done);
        });
        afterAll(() => {
            destroy(schObj);
        });
        it('should correctly update renderDates for all resources considering workDays upon cancel swipe', (done: DoneFn) => {
            node = schObj.element.querySelector('.e-table-container');
            touchTestObj = ((node as EJ2Instance).ej2_instances[0] as any);
            const target: Element = schObj.element.querySelector('.e-work-cells');
            const moveStart: CommonArgs = <CommonArgs>extend({}, startMouseEventArs, { clientX: 200, clientY: 300, target: target });
            const moveArgs1: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 210, clientY: 300, target: target });
            const moveArgs2: CommonArgs = <CommonArgs>extend({}, moveMouseEventArs, { type: 'touchmove', clientX: 200, clientY: 150, target: target });
            const movedEnd: CommonArgs = <CommonArgs>extend({}, endMouseEventArs, { clientX: 200, clientY: 100, target: target });
            touchTestObj.startEvent(moveStart);
            touchTestObj.moveEvent(moveArgs1);
            touchTestObj.moveEvent(moveArgs2);
            touchTestObj.endEvent(movedEnd);
            expect(schObj.resourceBase.lastResourceLevel.length).toBeGreaterThan(1);
            schObj.dataBound = function () {
                expect(schObj.eventsProcessed.length).toBeGreaterThanOrEqual(1);
                done();
            };
            schObj.addEvent(newEvent);
        });
    });

    it('memory leak', () => {
        profile.sample();
        const average: number = inMB(profile.averageChange);
        expect(average).toBeLessThan(10);
        const memory: number = inMB(getMemoryProfile());
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});
