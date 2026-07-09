/**
 * Gantt zoom actionComplete requestType spec
 * Regression: actionComplete requestType wrong when zoom triggered via public methods
 */
import { Gantt, Toolbar, Selection } from '../../src/index';
import { createGantt, destroyGantt } from '../base/gantt-util.spec';
Gantt.Inject(Toolbar, Selection);

const zoomData: Object[] = [
    {
        TaskID: 1, TaskName: 'Task 1',
        StartDate: new Date('2024-01-15'), EndDate: new Date('2024-01-20'), Duration: 5
    },
    {
        TaskID: 2, TaskName: 'Task 2',
        StartDate: new Date('2024-01-21'), EndDate: new Date('2024-01-25'), Duration: 4
    },
    {
        TaskID: 3, TaskName: 'Task 3',
        StartDate: new Date('2024-01-26'), EndDate: new Date('2024-02-02'), Duration: 7
    }
];

describe('Zoom actionComplete requestType via public methods', () => {
    let ganttObj: Gantt;

    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: zoomData,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration'
                },
                toolbar: ['ZoomIn', 'ZoomOut', 'ZoomToFit'],
                projectStartDate: new Date('2024-01-10'),
                projectEndDate: new Date('2024-02-10'),
                height: '400px'
            }, done);
    });

    afterAll(() => {
        destroyGantt(ganttObj);
    });

    it('should emit AfterZoomIn when zoomIn() is called — happy path', (done: Function) => {
        let capturedRequestType: string;
        ganttObj.actionComplete = (args: any) => {
            if (args.requestType && args.requestType.indexOf('Zoom') !== -1) {
                capturedRequestType = args.requestType;
            }
        };
        ganttObj.zoomIn();
        setTimeout(() => {
            expect(capturedRequestType).toBe('AfterZoomIn');
            done();
        }, 100);
    });

    it('should emit AfterZoomOut when zoomOut() is called — happy path', (done: Function) => {
        let capturedRequestType: string;
        ganttObj.actionComplete = (args: any) => {
            if (args.requestType && args.requestType.indexOf('Zoom') !== -1) {
                capturedRequestType = args.requestType;
            }
        };
        ganttObj.zoomOut();
        setTimeout(() => {
            expect(capturedRequestType).toBe('AfterZoomOut');
            done();
        }, 100);
    });

    it('should emit AfterZoomToProject when fitToProject() is called — happy path', (done: Function) => {
        let capturedRequestType: string;
        ganttObj.actionComplete = (args: any) => {
            if (args.requestType && args.requestType.indexOf('Zoom') !== -1) {
                capturedRequestType = args.requestType;
            }
        };
        ganttObj.fitToProject();
        setTimeout(() => {
            expect(capturedRequestType).toBe('AfterZoomToProject');
            done();
        }, 100);
    });

    it('should emit AfterZoomToProject (not AfterZoomIn) when fitToProject() is called after zoomIn() — regression',
        (done: Function) => {
        let capturedRequestType: string;
        ganttObj.zoomIn();
        setTimeout(() => {
            capturedRequestType = null;
            ganttObj.actionComplete = (args: any) => {
                if (args.requestType && args.requestType.indexOf('Zoom') !== -1) {
                    capturedRequestType = args.requestType;
                }
            };
            ganttObj.fitToProject();
            setTimeout(() => {
                expect(capturedRequestType).toBe('AfterZoomToProject');
                expect(capturedRequestType).not.toBe('AfterZoomIn');
                done();
            }, 100);
        }, 100);
    });

    it('should emit AfterZoomOut (not AfterZoomIn) when zoomOut() is called after zoomIn() — regression',
        (done: Function) => {
        let capturedRequestType: string;
        ganttObj.zoomIn();
        setTimeout(() => {
            capturedRequestType = null;
            ganttObj.actionComplete = (args: any) => {
                if (args.requestType && args.requestType.indexOf('Zoom') !== -1) {
                    capturedRequestType = args.requestType;
                }
            };
            ganttObj.zoomOut();
            setTimeout(() => {
                expect(capturedRequestType).toBe('AfterZoomOut');
                expect(capturedRequestType).not.toBe('AfterZoomIn');
                done();
            }, 100);
        }, 100);
    });
});

// AGENT_COMPLETE
