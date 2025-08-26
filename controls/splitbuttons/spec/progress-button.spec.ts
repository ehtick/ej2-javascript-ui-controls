/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement } from "@syncfusion/ej2-base";
import { ProgressButton } from "../src/progress-button/progress-button";
import { IconPosition } from '@syncfusion/ej2-buttons';
import { profile , inMB, getMemoryProfile } from './common.spec';

describe('Progress Button', () => {
    beforeAll(() => {
        const isDef: any = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending(); // skips test (in Chai)
            return;
        }
    });

    beforeEach(() => {
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('Progress and Spinner', () => {
        const ele: any = createElement('button', { id: 'progressbtn1' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Progress', iconCss: 'e-icons e-add-icon', enableProgress: true }, '#progressbtn1');
        expect(ele.childNodes[1].classList).toContain('e-btn-content');
        expect(ele.childNodes[0].classList).toContain('e-spinner');
        expect(ele.childNodes[2].classList).toContain('e-progress');
        expect(ele.childNodes[1].textContent).toEqual('Progress');
        expect(ele.getElementsByClassName('e-btn-content')[0].childNodes[0].classList).toContain('e-btn-icon');
    });

    it('Hide Progress', () => {
        const ele: any = createElement('button', { id: 'progressbtn2' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Progress' }, '#progressbtn2');
        expect(ele.getElementsByClassName('e-progress').length).toBe(0);
    });

    it('Hide Spinner', () => {
        const ele: any = createElement('button', { id: 'progressbtn3' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Progress', cssClass: 'e-hide-spinner' }, '#progressbtn3');
        expect(ele.classList).toContain('e-hide-spinner');
    });

    it('Spinner Only', () => {
        const ele: any = createElement('button', { id: 'progressbtn4' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Spinner', duration: 1000 }, '#progressbtn4');
        ele.click();
        expect(ele.classList).toContain('e-progress-active');
        jasmine.clock().tick(50000);
        setTimeout(() => {
            expect(ele.getElementsByClassName('e-spinner-pane')[0].classList).toContain('e-spin-hide');
            expect(ele.classList).not.toContain('e-progress-active');
        }, 20000);
        jasmine.clock().tick(20000);
    });

    it('Progress Only', () => {
        const ele: any = createElement('button', { id: 'progressbtn5' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Progress', duration: 1000, enableProgress: true, cssClass: 'e-hide-spinner', begin: begin, progress: progress, end: end }, '#progressbtn5');

        ele.click();
        expect(ele.classList).toContain('e-progress-active');
        jasmine.clock().tick(20000);

        function begin(args: any) {
            expect(args.percent).toBe(0);
            expect(args.currentDuration).toBe(0);
        }

        function progress(args: any) {
            expect(args.percent).toBeGreaterThan(0);
            expect(args.currentDuration).toBeGreaterThan(0);
            expect(args.percent).toBeLessThan(100);
            expect(args.currentDuration).toBeLessThan(1000);
        }
        function end(args: any) {
            expect(args.percent).toBe(100);
            expect(args.currentDuration).toBe(1000);
        }

    });

    it('Progress methods', () => {
        const ele: any = createElement('button', { id: 'progressbtn6' });
        document.body.appendChild(ele);
        const button: ProgressButton = new ProgressButton({ content: 'Progress', enableProgress: true, duration: 1000, cssClass: 'e-hide-spinner', progress: progress, end: end }, '#progressbtn6');
        ele.click();
        jasmine.clock().tick(20000);
        button.start();
        function progress(args: any) {
            if (args.percent === 50) {
                this.stop();
            }
        }

        function end(args: any) {
            expect(args.percent).toBe(100);
        }
    });

    it('Progress Step', () => {
        const ele: any = createElement('button', { id: 'progressbtn7' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Progress', duration: 1000, enableProgress: true, cssClass: 'e-hide-spinner', begin: begin, progress: progress, end: end }, '#progressbtn7');
        ele.click();
        jasmine.clock().tick(10000);
        function begin(args: any) {
            args.step = 25;
        }
        function progress(args: any) {
            if (args.currentDuration >= 250 && args.currentDuration < 500) {
                expect(args.percent).toBe(25);
            } else if (args.currentDuration > 500 && args.currentDuration < 750) {
                expect(args.percent).toBe(50);
            } else if (args.currentDuration > 750 && args.currentDuration < 1000) {
                expect(args.percent).toBe(75);
            }
        }

        function end(args: any) {
            expect(args.percent).toBe(100);
            expect(args.currentDuration).toBe(1000);
        }
    });

    it('Progress percent', () => {
        const ele: any = createElement('button', { id: 'progressbtn8' });
        document.body.appendChild(ele);
        ele.textContent = 'Progress';
        new ProgressButton({ duration: 1000, enableProgress: true, begin: begin, end: end }, '#progressbtn8');
        ele.click();
        jasmine.clock().tick(10000);
        function begin(args: any) {
            args.percent = 98;
        }
        function end(args: any) {
            expect(args.percent).toBe(100);
            expect(args.currentDuration).toBeLessThan(1000);
        }
    });

    it('Progress stop', () => {
        const ele: any = createElement('button', { id: 'progressbtn9' });
        document.body.appendChild(ele);
        const button: any = new ProgressButton({ content: 'Progress', enableProgress: true, duration: 1000 }, '#progressbtn9');
        button.start(10);
        jasmine.clock().tick(2000);
        button.stop();
        expect(button.percent).toBeGreaterThan(0);
        expect(button.progressTime).toBeGreaterThan(0);
        button.start(30);
        jasmine.clock().tick(2000);
        expect(button.percent).toBeGreaterThanOrEqual(30);
        expect(button.progressTime).toBeGreaterThan(0);
    });


    it('content property change', () => {
        const ele: any = createElement('button', { id: 'progressbtn10' });
        document.body.appendChild(ele);
        const button: ProgressButton = new ProgressButton({ content: 'Progress', enableProgress: true }, '#progressbtn10');
        button.content = 'Progress2';
        button.iconCss = 'e-icons e-add-icon';
        button.dataBind();
        expect(button.content).toBe('Progress2');
        expect(ele.getElementsByClassName('e-btn-content')[0].textContent).toBe('Progress2');
        expect(ele.getElementsByClassName('e-btn-content')[0].childNodes[0].classList).toContain('e-btn-icon');
        button.iconPosition = "Right";
        button.dataBind();
        expect(ele.getElementsByClassName('e-btn-content')[0].childNodes[1].classList).toContain('e-btn-icon');
        button.iconPosition = "Left";
        button.dataBind();
        expect(ele.getElementsByClassName('e-btn-content')[0].childNodes[0].classList).toContain('e-btn-icon');
        button.enableProgress = false;
        button.dataBind();
        expect(ele.getElementsByClassName('e-progress')[0]).toBe(undefined);
        button.content = 'Progress3';
        button.dataBind();
        expect(ele.getElementsByClassName('e-btn-content')[0].textContent).toBe('Progress3');
        button.iconCss = 'e-icons e-add-icon1';
        button.dataBind();
        expect(ele.getElementsByClassName('e-btn-content')[0].childNodes[0].classList).toContain('e-add-icon1');
        button.enableProgress = true;
        button.dataBind();
        expect(ele.childNodes[2].classList).toContain('e-progress');
    });

    it('destroy method', () => {
        const ele: any = createElement('button', { id: 'progressbtn11' });
        document.body.appendChild(ele);
        let button: any = new ProgressButton({ content: 'Progress', enableProgress: true }, '#progressbtn11');
        button.destroy();
        expect(ele.innerHTML).toBe('');
        button = new ProgressButton({ enableProgress: true }, '#progressbtn11');
        button.destroy();
        expect(ele.innerHTML).toBe('');
        button = new ProgressButton({ cssClass: 'e-hide-spinner', enableProgress: true }, '#progressbtn11');
        button.destroy();
        expect(ele.innerHTML).toBe('');
    });

    it('Spin Position', () => {
        const ele: any = createElement('button', { id: 'progressbtn13' });
        document.body.appendChild(ele);
        let button: any = new ProgressButton({ content: 'Spin Right', spinSettings: { position: 'Right' } }, '#progressbtn13');
        expect(ele.childNodes[1].classList).toContain('e-spinner');
        button.destroy();
        button = new ProgressButton({ content: 'Spin Top', spinSettings: { position: 'Top' } }, '#progressbtn13');
        expect(ele.childNodes[0].classList).toContain('e-spinner');
        button.destroy();
        button = new ProgressButton({ content: 'Spin bottom', spinSettings: { position: 'Bottom' } }, '#progressbtn13');
        expect(ele.childNodes[1].classList).toContain('e-spinner');
    });

    it('Animation settings - SlideLeft', () => {
        const ele: any = createElement('button', { id: 'progressbtn14' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Slide Left', duration: 1000, spinSettings: { position: 'Center' }, animationSettings: { effect: 'SlideLeft', duration: 400 } }, '#progressbtn14');
        ele.click();
        setTimeout(() => {
            expect(ele.getElementsByClassName('e-btn-content')[0].classList).not.toContain('e-cont-animate');
        }, 2000);
        jasmine.clock().tick(20000);
    });

    it('Animation settings - Center', () => {
        const ele: any = createElement('button', { id: 'progressbtn15' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Spin Center', duration: 1000, spinSettings: { position: 'Center' } }, '#progressbtn15');
        ele.click();
        expect(ele.getElementsByClassName('e-btn-content')[0].classList).toContain('e-cont-animate');
        jasmine.clock().tick(50000);
        setTimeout(() => {
            expect(ele.getElementsByClassName('e-btn-content')[0].classList).not.toContain('e-cont-animate');
        }, 20000);
        jasmine.clock().tick(20000);
    });

    it('Spin Settings property change', () => {
        const ele: any = createElement('button', { id: 'progressbtn12' });
        document.body.appendChild(ele);
        const button: ProgressButton = new ProgressButton({ content: 'Spin Left' }, '#progressbtn12');
        button.spinSettings.position = 'Right';
        button.dataBind();
        expect(ele.childNodes[1].classList).toContain('e-spinner');
        expect(ele.classList).toContain('e-spin-right');
        expect(ele.classList).not.toContain('e-spin-left');
        button.spinSettings.width = 30;
        button.dataBind();
        // expect(ele.getElementsByClassName('e-spin-material')[0].style.width).toBe('30px');
    });

    it('Spinner Events', () => {
        const ele: any = createElement('button', { id: 'progressbtn16' });
        document.body.appendChild(ele);
        new ProgressButton({ content: 'Spinner', duration: 1000, begin: begin, progress: progress, end: end }, '#progressbtn16');
        ele.click();

        function begin(args: any) {
            expect(args.percent).toBe(0);
            expect(args.currentDuration).toBe(0);
        }

        function progress(args: any) {
            expect(args.percent).toBeGreaterThan(0);
            expect(args.currentDuration).toBeGreaterThan(0);
            expect(args.percent).toBeLessThan(100);
            expect(args.currentDuration).toBeLessThan(1000);
        }
        function end(args: any) {
            expect(args.percent).toBe(100);
            expect(args.currentDuration).toBe(1000);
        }
    });

    it('Enable Html Sanitizer', () => {
        new ProgressButton({ content: 'Progress<style>body{background:rgb(0, 0, 255)}</style>' }, '#progressbtn17');
        const htmlele: Element = document.body;
        expect(window.getComputedStyle(htmlele).backgroundColor).not.toBe('rgb(0, 0, 255)');
    });

    it('Enable Html Sanitizer disabled', () => {
        const ele: any = createElement('button', { id: 'progressbtn17' });
        document.body.appendChild(ele);
        const button: ProgressButton = new ProgressButton({ content: 'Progress<style>body{background:rgb(0, 0, 255)}</style>', enableHtmlSanitizer: false }, '#progressbtn17');
        const htmlele: Element = document.body;
        expect(window.getComputedStyle(htmlele).backgroundColor).toBe('rgb(0, 0, 255)');
        button.destroy();
    });

    it('Progress Complete', () => {
        const ele: any = createElement('button', { id: 'progressbtn18' });
        document.body.appendChild(ele);
        const button: any = new ProgressButton({ content: 'ProgressComplete', enableProgress: true, duration: 1000 }, '#progressbtn9');
        button.start(50);
        button.stop();
        expect(button.percent).toBeGreaterThan(40);
        button.progressComplete();
        expect(button.percent).toEqual(0);
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

    describe('Null or undefined Property testing', () => {

        it('ProgressButton with content', () => {
            const ele: any = createElement('button', { id: 'progressbtn19' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ content: null }, '#progressbtn9');
            expect(button.content).toEqual(null);
            button.destroy();
            button = new ProgressButton({ content: undefined }, '#progressbtn9');
            expect(button.content).toEqual('');
            button.destroy();
        });

        it('ProgressButton with cssClass', () => {
            const ele: any = createElement('button', { id: 'progressbtn19' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ cssClass: null }, '#progressbtn19');
            expect(button.cssClass).toEqual(null);
            button.destroy();
            button = new ProgressButton({ cssClass: undefined }, '#progressbtn19');
            expect(button.cssClass).toEqual('');
            button.destroy();
        });

        it('ProgressButton with iconCss', () => {
            const ele: any = createElement('button', { id: 'progressbtn20' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ iconCss: null }, '#progressbtn20');
            expect(button.iconCss).toEqual(null);
            button.destroy();
            button = new ProgressButton({ iconCss: undefined }, '#progressbtn20');
            expect(button.iconCss).toEqual('');
            button.destroy();
        });

        it('ProgressButton with Toggle', () => {
            const ele: any = createElement('button', { id: 'progressbtn20' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ isToggle: null }, '#progressbtn20');
            expect(button.isToggle).toEqual(null);
            button.destroy();
            button = new ProgressButton({ isToggle: undefined }, '#progressbtn20');
            expect(button.isToggle).toEqual(false);
            button.destroy();
        });

        it('ProgressButton with disabled', () => {
            const ele: any = createElement('button', { id: 'progressbtn20' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ disabled: null }, '#progressbtn20');
            expect(button.disabled).toEqual(null);
            button.destroy();
            button = new ProgressButton({ disabled: undefined }, '#progressbtn20');
            expect(button.disabled).toEqual(false);
            button.destroy();
        });

        it('ProgressButton with animationSettings', () => {
            const ele: any = createElement('button', { id: 'progressbtn21' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ animationSettings: { duration: null, effect: null } }, '#progressbtn21');
            expect(button.animationSettings.duration).toEqual(null);
            expect(button.animationSettings.effect).toEqual(null);
            button.destroy();
            button = new ProgressButton({ animationSettings: { duration: undefined, effect: undefined } }, '#progressbtn21');
            expect(button.animationSettings.duration).toEqual(400);
            expect(button.animationSettings.effect).toEqual('None');
            button.destroy();
        });

        it('ProgressButton with isPrimary', () => {
            const ele: any = createElement('button', { id: 'progressbtn22' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ isPrimary: null }, '#progressbtn22');
            expect(button.isPrimary).toEqual(null);
            button.destroy();
            button = new ProgressButton({ isPrimary: undefined }, '#progressbtn22');
            expect(button.isPrimary).toEqual(false);
            button.destroy();
        });

        it('ProgressButton with enableProgress', () => {
            const ele: any = createElement('button', { id: 'progressbtn22' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ enableProgress: null }, '#progressbtn22');
            expect(button.enableProgress).toEqual(null);
            button.destroy();
            button = new ProgressButton({ enableProgress: undefined }, '#progressbtn22');
            expect(button.enableProgress).toEqual(false);
            button.destroy();
        });

        it('ProgressButton with duration', () => {
            const ele: any = createElement('button', { id: 'progressbtn23' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ duration: null }, '#progressbtn23');
            expect(button.duration).toEqual(null);
            button.destroy();
            button = new ProgressButton({ duration: undefined }, '#progressbtn23');
            expect(button.duration).toEqual(2000);
            button.destroy();
        });

        it('ProgressButton with enableHtmlSanitizer', () => {
            const ele: any = createElement('button', { id: 'progressbtn24' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ enableHtmlSanitizer: null }, '#progressbtn24');
            expect(button.enableHtmlSanitizer).toEqual(null);
            button.destroy();
            button = new ProgressButton({ enableHtmlSanitizer: undefined }, '#progressbtn24');
            expect(button.enableHtmlSanitizer).toEqual(true);
            button.destroy();
        });

        it('ProgressButton with iconPosition', () => {
            const ele: any = createElement('button', { id: 'progressbtn25' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ iconPosition: null }, '#progressbtn25');
            expect(button.iconPosition).toEqual(null);
            button.destroy();
            button = new ProgressButton({ iconPosition: undefined }, '#progressbtn25');
            expect(button.iconPosition).toEqual('Left');
            button.destroy();
        });

        it('ProgressButton with spinSettings', () => {
            const ele: any = createElement('button', { id: 'progressbtn25' });
            document.body.appendChild(ele);
            let button: any = new ProgressButton({ spinSettings: { position: null } }, '#progressbtn25');
            expect(button.spinSettings.position).toEqual(null);
            button.destroy();
            button = new ProgressButton({ spinSettings: { position: undefined } }, '#progressbtn25');
            expect(button.spinSettings.position).toEqual('Left');
            button.destroy();
        });

    });

});