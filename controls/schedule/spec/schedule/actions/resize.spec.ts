/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Event resize action spec
 */
import { Schedule, ScheduleModel, Day, Week, WorkWeek, Month, Agenda } from '../../../src/schedule/index';
import { TimelineViews, TimelineMonth, ResizeEventArgs, Resize } from '../../../src/schedule/index';
import { dragResizeData, resourceGroupData, timelineData, defaultData } from '../base/datasource.spec';
import { triggerMouseEvent } from '../util.spec';
import * as util from '../util.spec';

Schedule.Inject(Day, Week, WorkWeek, Month, Agenda, TimelineViews, TimelineMonth, Resize);

xdescribe('Vertical view events resizing', () => {
    describe('Default schedule events', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { width: '500px', height: '500px', selectedDate: new Date(2018, 6, 5) };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('resizeStart event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"] .e-bottom-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
        });

        it('resizeStop event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = false;
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"] .e-bottom-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
            triggerMouseEvent(resizeElement, 'mousemove', 0, 25);
            expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(1);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 25);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 50);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 50);
            triggerMouseEvent(resizeElement, 'mouseup');
        });

        it('bottom resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 10, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(720);
                expect(resizeElement.offsetHeight).toEqual(180);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(108);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(schObj.element.querySelectorAll('.e-clone-time-indicator').length).toEqual(0);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('top resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 9, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(648);
                expect(resizeElement.offsetHeight).toEqual(252);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-top-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(180);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(schObj.element.querySelectorAll('.e-clone-time-indicator').length).toEqual(0);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(110);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(53);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(110);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(110);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('recurrence event bottom resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData.slice(-1)[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2, 11, 15).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 2, 13).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_11"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(810);
                expect(resizeElement.offsetHeight).toEqual(126);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_2"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(810);
            expect(resizeElement.offsetHeight).toEqual(90);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('different resizing interval checking', (done: DoneFn) => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.interval = 45;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 9, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 13).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(648);
                expect(resizeElement.offsetHeight).toEqual(288);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(648);
            expect(resizeElement.offsetHeight).toEqual(252);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -100);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -100);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('month view events resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { width: '500px', height: '500px', currentView: 'Month', selectedDate: new Date(2018, 6, 5) };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 2, 11, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(139);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(68);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 2, 11, 30).getTime());
                expect((schObj.element.querySelectorAll('[data-id="Appointment_1"]').length)).toEqual(0);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(139);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('event resizing checking with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.firstDayOfWeek = 1;
            schObj.dataBind();
        });

        it('left resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[9] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 7, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 8, 11).getTime());
                expect(schObj.element.querySelectorAll('[data-id="Appointment_10"]').length).toEqual(1);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_10"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(210);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[2] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 3, 11).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4, 12, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_3"]')).offsetWidth).toEqual(139);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_3"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(68);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('showWeekend property', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.showWeekend = false;
            schObj.dataBind();
        });

        it('left resizing with showWeekend property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[2] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 4, 11).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4, 12, 30).getTime());
                expect(schObj.element.querySelectorAll('[data-id="Appointment_3"]').length).toEqual(0);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_3"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(195);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing with showWeekend property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(195);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(96);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Resource grouping schedule events', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px',
                height: '500px',
                selectedDate: new Date(2018, 6, 5),
                group: {
                    resources: ['Rooms', 'Owners']
                },
                resources: [{
                    field: 'RoomId', name: 'Rooms',
                    dataSource: [
                        { Text: 'Room 1', Id: 1, Color: '#ffaa00' },
                        { Text: 'Room 2', Id: 2, Color: '#f8a398' }
                    ]
                }, {
                    field: 'OwnerId', name: 'Owners',
                    dataSource: [
                        { Text: 'Nancy', Id: 1, GroupID: 1, Color: '#ffaa00' },
                        { Text: 'Steven', Id: 2, GroupID: 2, Color: '#f8a398' },
                        { Text: 'Michael', Id: 3, GroupID: 1, Color: '#7499e1' }
                    ]
                }]
            };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('resizeStart event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"] .e-bottom-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
        });

        it('resizeStop event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = false;
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"] .e-bottom-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
            triggerMouseEvent(resizeElement, 'mousemove', 0, 50);
            expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(1);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 50);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 100);
            triggerMouseEvent(resizeElement, 'mousemove', 0, 100);
            triggerMouseEvent(resizeElement, 'mouseup');
        });

        it('bottom resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[4] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 5, 10, 30).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 5, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_5"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(756);
                expect(resizeElement.offsetHeight).toEqual(144);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_5"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(756);
            expect(resizeElement.offsetHeight).toEqual(72);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(1);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('top resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 9, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 11, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(648);
                expect(resizeElement.offsetHeight).toEqual(180);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-top-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(108);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(1);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(105);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(33);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[8] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 6).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_9"]')).offsetWidth).toEqual(69);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_9"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(69);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('month view changing', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.currentView = 'Month';
            schObj.dataBind();
        });

        it('right resizing in month view', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 8).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(213);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(105);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 105, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 105, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing in month view', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 8).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(141);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(213);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 105, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 105, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('showWeekend property', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.showWeekend = false;
            schObj.dataBind();
        });

        it('left resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 8).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(69);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(105);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[8] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_9"]')).offsetWidth).toEqual(33);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_9"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(69);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Resource grouping - allowGroupEdit schedule events', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px',
                height: '500px',
                selectedDate: new Date(2018, 3, 1),
                group: {
                    allowGroupEdit: true,
                    resources: ['Rooms', 'Owners']
                },
                resources: [
                    {
                        field: 'RoomId', title: 'Room',
                        name: 'Rooms', allowMultiple: true,
                        dataSource: [
                            { RoomText: 'ROOM 1', Id: 1, RoomColor: '#cb6bb2' },
                            { RoomText: 'ROOM 2', Id: 2, RoomColor: '#56ca85' }
                        ],
                        textField: 'RoomText', idField: 'Id', colorField: 'RoomColor'
                    }, {
                        field: 'OwnerId', title: 'Owner',
                        name: 'Owners', allowMultiple: true,
                        dataSource: [
                            { OwnerText: 'Nancy', Id: 1, OwnerGroupId: 1, OwnerColor: '#ffaa00' },
                            { OwnerText: 'Steven', Id: 2, OwnerGroupId: 2, OwnerColor: '#f8a398' },
                            { OwnerText: 'Michael', Id: 3, OwnerGroupId: 1, OwnerColor: '#7499e1' }
                        ],
                        textField: 'OwnerText', idField: 'Id', groupIDField: 'OwnerGroupId', colorField: 'OwnerColor'
                    }
                ]
            };
            schObj = util.createSchedule(schOptions, resourceGroupData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('bottom resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 3, 1, 10, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 3, 1, 13, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(720);
                expect(resizeElement.offsetHeight).toEqual(252);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(180);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-resize-clone'));
            expect(cloneElement.length).toEqual(3);
            cloneElement.forEach((element: HTMLElement) => expect(element).toBeTruthy());
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('top resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 3, 1, 11, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 3, 1, 13, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(792);
                expect(resizeElement.offsetHeight).toEqual(180);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-top-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(252);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-resize-clone'));
            expect(cloneElement.length).toEqual(3);
            cloneElement.forEach((element: HTMLElement) => expect(element).toBeTruthy());
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 100);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 100);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('month view changing', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.currentView = 'Month';
            schObj.dataBind();
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 3, 1, 11).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 3, 4, 13, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(141);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(33);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-resize-clone'));
            expect(cloneElement.length).toEqual(3);
            cloneElement.forEach((element: HTMLElement) => {
                expect(element).toBeTruthy();
                expect(element.offsetHeight).toEqual(22);
            });
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 3, 2, 11).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 3, 4, 13, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(105);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(141);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement[] = [].slice.call(schObj.element.querySelectorAll('.e-resize-clone'));
            expect(cloneElement.length).toEqual(3);
            cloneElement.forEach((element: HTMLElement) => {
                expect(element).toBeTruthy();
                expect(element.offsetHeight).toEqual(22);
            });
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('RTL mode event resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { width: '500px', height: '500px', enableRtl: true, selectedDate: new Date(2018, 6, 5) };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('bottom resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 10, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(720);
                expect(resizeElement.offsetHeight).toEqual(180);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(108);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('top resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 9, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(648);
                expect(resizeElement.offsetHeight).toEqual(252);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-top-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(180);
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 3).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(53);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(53);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 3).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(110);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(53);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Timescale disable mode event resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px',
                selectedDate: new Date(2018, 6, 5), timeScale: { enable: false }
            };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[8] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 6).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_9"]')).offsetWidth).toEqual(68);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_9"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(139);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(54);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 4).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(139);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(68);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(54);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('change firstDayOfWeek property value', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.firstDayOfWeek = 2;
            schObj.dataBind();
        });

        it('right resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(139);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(68);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(54);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing with firstDayOfWeek property', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[9] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 8, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 8, 11).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_10"]')).offsetWidth).toEqual(68);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_10"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(210);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(54);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Adaptive mode event resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = { width: 300, height: 500, selectedDate: new Date(2018, 6, 5) };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('bottom resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 10, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(720);
                expect(resizeElement.offsetHeight).toEqual(180);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-bottom-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(108);
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            const timeIndicator: HTMLElement = schObj.element.querySelector('.e-clone-time-indicator') as HTMLElement;
            expect(timeIndicator).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, 50);
            expect(timeIndicator.offsetTop).toEqual(900);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('top resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 9, 0).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetTop).toEqual(648);
                expect(resizeElement.offsetHeight).toEqual(252);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-top-handler') as HTMLElement;
            expect(resizeElement.offsetTop).toEqual(720);
            expect(resizeElement.offsetHeight).toEqual(180);
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            const timeIndicator: HTMLElement = schObj.element.querySelector('.e-clone-time-indicator') as HTMLElement;
            expect(timeIndicator).toBeTruthy();
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -25);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            triggerMouseEvent(resizeHandler, 'mousemove', 0, -50);
            expect(timeIndicator.offsetTop).toEqual(648);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 3).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(33);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(33);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[7] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 2).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 5).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_8"]')).offsetWidth).toEqual(105);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_8"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(33);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(22);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });
});

describe('Timeline view events resizing with interval 10 mins', () => {
    describe('Default schedule events', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px', selectedDate: new Date(2018, 4, 1),
                views: ['TimelineDay']
            };
            schObj = util.createSchedule(schOptions, timelineData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });
        it('left resizing', (done: DoneFn) => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.interval = 10;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 10, 40).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 12, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(183);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(250);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 20, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', 30, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 80, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });
});

xdescribe('Timeline view events resizing', () => {
    describe('Default schedule events', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px', selectedDate: new Date(2018, 4, 1),
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, timelineData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('resizeStart event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_11"] .e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
        });

        it('resizeStop event', () => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.cancel = false;
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = true;
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_11"] .e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeElement, 'mousedown');
            triggerMouseEvent(resizeElement, 'mousemove', -25, 0);
            expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(1);
            triggerMouseEvent(resizeElement, 'mousemove', -25, 0);
            triggerMouseEvent(resizeElement, 'mousemove', -50, 0);
            triggerMouseEvent(resizeElement, 'mousemove', -50, 0);
            triggerMouseEvent(resizeElement, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 13).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(300);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(250);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 11, 30).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 13).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(150);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(300);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('month view events resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px', currentView: 'TimelineMonth', selectedDate: new Date(2018, 4, 1),
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, timelineData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('right resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 3, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(210);
                expect(resizeElement.offsetTop).toEqual(202);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(70);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing at left end side', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 3, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(210);
                expect(resizeElement.offsetTop).toEqual(202);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(210);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 2, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 3, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(140);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(210);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(202);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 100, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('RTL mode events resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px', enableRtl: true, selectedDate: new Date(2018, 4, 1),
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, timelineData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('right resizing', (done: DoneFn) => {
            schObj.element.querySelector('.e-content-wrap').scrollLeft = 750;
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[10] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 13).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 15).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_11"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(200);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_11"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(100);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(2);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.element.querySelector('.e-content-wrap').scrollLeft = 750;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[12] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 12).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 4, 1, 14).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_13"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(200);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_13"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(100);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(122);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Resource Grouping Header bar customization', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px',
                height: '500px',
                selectedDate: new Date(2017, 10, 1),
                currentView: 'TimelineWeek',
                headerRows: [
                    { option: 'Year' },
                    { option: 'Month' },
                    { option: 'Week' }
                ],
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, defaultData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('right resizing', (done: DoneFn) => {
            schObj.resizeStop = (args: ResizeEventArgs) => args.cancel = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2017, 9, 29, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2017, 9, 31, 11, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(213);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(71);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetTop).toEqual(2);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2017, 9, 29, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2017, 9, 31, 11, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(213);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(213);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetWidth).toEqual(213);
            expect(cloneElement.offsetTop).toEqual(2);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('month view testing', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.currentView = 'TimelineMonth';
            schObj.dataBind();
        });

        it('header rows setmodel', (done: DoneFn) => {
            schObj.dataBound = () => done();
            schObj.headerRows = [
                { option: 'Date' },
                { option: 'Hour' }
            ];
            schObj.dataBind();
        });

        it('right resizing in month view', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[8] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2017, 10, 2, 10).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2017, 10, 4, 12, 30).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_9"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(210);
                expect(resizeElement.offsetTop).toEqual(2);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_9"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(70);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetWidth).toEqual(140);
            expect(cloneElement.offsetTop).toEqual(2);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('left resizing in month view', (done: DoneFn) => {
            schObj.resizeStart = (args: ResizeEventArgs) => args.scroll.enable = false;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[11] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2017, 10, 4, 9, 30).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2017, 10, 5, 5, 45).getTime());
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_12"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(140);
                expect(resizeElement.offsetTop).toEqual(42);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_12"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(140);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetHeight).toEqual(38);
            expect(cloneElement.offsetWidth).toEqual(140);
            expect(cloneElement.offsetTop).toEqual(42);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -75, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -75, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Adaptive mode event resizing', () => {
        let schObj: Schedule;
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px', selectedDate: new Date(2018, 6, 1),
                currentView: 'TimelineWeek',
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, dragResizeData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('left resizing', (done: DoneFn) => {
            schObj.element.querySelector('.e-content-wrap').scrollLeft = 800;
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                expect(schObj.element.querySelectorAll('.e-clone-time-indicator').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 8, 30).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 11, 30).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(300);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(150);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-left-handler') as HTMLElement;
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            const timeIndicator: HTMLElement = schObj.element.querySelector('.e-clone-time-indicator') as HTMLElement;
            expect(timeIndicator).toBeTruthy();
            expect(cloneElement.offsetWidth).toEqual(200);
            expect(cloneElement.offsetHeight).toEqual(38);
            triggerMouseEvent(resizeHandler, 'mousemove', -25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -100, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', -100, 0);
            expect(timeIndicator.offsetLeft).toEqual(850);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                expect(schObj.element.querySelectorAll('.e-resize-clone').length).toEqual(0);
                expect(schObj.element.querySelectorAll('.e-clone-time-indicator').length).toEqual(0);
                const event: Record<string, any> = schObj.eventsData[0] as Record<string, any>;
                expect((event.StartTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 8, 30).getTime());
                expect((event.EndTime as Date).getTime()).toEqual(new Date(2018, 6, 1, 13).getTime());
                expect((<HTMLElement>schObj.element.querySelector('[data-id="Appointment_1"]')).offsetWidth).toEqual(450);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(300);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            schObj.isAdaptive = true;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            const timeIndicator: HTMLElement = schObj.element.querySelector('.e-clone-time-indicator') as HTMLElement;
            expect(timeIndicator).toBeTruthy();
            expect(cloneElement.offsetWidth).toEqual(350);
            expect(cloneElement.offsetHeight).toEqual(38);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 150, 0);
            expect(timeIndicator.offsetLeft).toEqual(1300);
            schObj.isAdaptive = false;
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('Resize does not work properly in timeline scale', () => {
        let schObj: Schedule;
        const appointmentData = [{
            Id: 1,
            Subject: 'Conference',
            StartTime: new Date(2018, 6, 1, 0, 0),
            EndTime: new Date(2018, 6, 1, 2, 24),
            IsAllDay: false
        }];
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px', height: '500px',
                selectedDate: new Date(2018, 6, 5),
                timeScale: {
                    enable: true,
                    interval: 720,
                    slotCount: 5
                },
                currentView: 'TimelineWeek',
                views: ['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth']
            };
            schObj = util.createSchedule(schOptions, appointmentData, done);
        });
        afterAll(() => {
            util.destroy(schObj);
        });

        it('right resizing', (done: DoneFn) => {
            schObj.dataBound = () => {
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toEqual(100);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            expect(resizeElement.offsetWidth).toEqual(50);
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetWidth).toEqual(100);
            triggerMouseEvent(resizeHandler, 'mousemove', 25, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', 50, 0);
            triggerMouseEvent(resizeHandler, 'mouseup');
            done();
        });

        it('right resizing from one day to two days', (done: DoneFn) => {
            schObj.dataBound = () => {
                const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
                expect(resizeElement.offsetWidth).toBeGreaterThan(initialWidth);
                expect(resizeElement.offsetWidth).toBe(300);
                done();
            };
            const resizeElement: HTMLElement = schObj.element.querySelector('[data-id="Appointment_1"]') as HTMLElement;
            const initialWidth: number = resizeElement.offsetWidth;
            const resizeHandler: HTMLElement = resizeElement.querySelector('.e-right-handler') as HTMLElement;
            triggerMouseEvent(resizeHandler, 'mousedown');
            const dayWidth: number = (schObj.element.querySelector('.e-work-cells') as HTMLElement).offsetWidth;
            triggerMouseEvent(resizeHandler, 'mousemove', dayWidth, 0);
            triggerMouseEvent(resizeHandler, 'mousemove', dayWidth + 150, 0);
            const cloneElement: HTMLElement = schObj.element.querySelector('.e-resize-clone') as HTMLElement;
            expect(cloneElement).toBeTruthy();
            expect(cloneElement.offsetWidth).toBeGreaterThan(initialWidth);
            triggerMouseEvent(resizeHandler, 'mouseup');
        });
    });

    describe('events resizing', () => {
        let schObj: Schedule;
        const EventData: Record<string, any>[] = [
            {
                Id: 1,
                Subject: 'Event-1',
                StartTime: new Date(2018, 3, 29, 10, 0),
                EndTime: new Date(2018, 3, 29, 12, 30)
            },
            {
                Id: 2,
                Subject: 'Event-2',
                StartTime: new Date(2018, 4, 1, 10, 0),
                EndTime: new Date(2018, 4, 1, 12, 30)
            },
        ];
        beforeAll((done: DoneFn) => {
            const schOptions: ScheduleModel = {
                width: '500px',
                height: '500px',
                selectedDate: new Date(2018, 4, 1),
                views: ['Week'],
                showQuickInfo: false
            };
            schObj = util.createSchedule(schOptions, EventData, done);
        });
    
        afterAll(() => {
            util.destroy(schObj);
        });
    
        it('removes appointment border on resizing another event', (done: DoneFn) => {
            const appointments = schObj.element.querySelectorAll('.e-appointment');
            expect(appointments.length).toBeGreaterThan(0);
            const firstAppointment = appointments[0] as HTMLElement;
            const secondAppointment = appointments[1] as HTMLElement;
            firstAppointment.click();
            expect(firstAppointment.classList.contains('e-appointment-border')).toBeTruthy();
            const resizeStartEvent = new MouseEvent('mousedown', { bubbles: true });
            const resizeMoveEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 50 });
            const resizeEndEvent = new MouseEvent('mouseup', { bubbles: true });
            secondAppointment.dispatchEvent(resizeStartEvent);
            document.dispatchEvent(resizeMoveEvent);
            document.dispatchEvent(resizeEndEvent);
            setTimeout(() => {
                expect(firstAppointment.classList.contains('e-appointment-border')).toBeFalsy();
                done();
            }, 100);
        });
    });
});
