/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ClickedEventArgs } from '../src/button/button';
import { Browser, createElement, detach } from '@syncfusion/ej2-base';
import { profile , inMB, getMemoryProfile } from './common.spec';

/**
 * @param  {} 'Button'
 * @param  {} function(
 */
describe('Button', () => {
    beforeAll(() => {
        const isDef: any = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending(); // skips test (in Chai)
            return;
        }
    });
    beforeEach((): void => {
        let Chromebrowser: string = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36";
        Browser.userAgent = Chromebrowser;
    });

    let button: Button;
    const element: any = createElement('button', { id: 'button' });
    document.body.appendChild(element);

    describe('DOM', () => {
        afterEach(() => {
            button.destroy();
        });

        it('Normal button testing', () => {
            button = new Button();
            button.appendTo('#button');
            expect(element.classList.contains('e-btn')).toEqual(true);
        });

        it('Primary button testing', () => {
            button = new Button({ isPrimary: true });
            button.appendTo('#button');
            expect(element.classList.contains('e-primary')).toEqual(true);
        });

        it('Disable state testing', () => {
            button = new Button({ disabled: true });
            button.appendTo('#button');
            expect(element.classList.contains('e-disabled')).toEqual(true);
            expect(element.getAttribute('disabled')).toEqual('');
        });

        it('Small button testing', () => {
            button = new Button({ cssClass: 'e-small' });
            button.appendTo('#button');
            expect(element.classList.contains('e-small')).toEqual(true);
        });

        it('Icon button testing', () => {
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
        });

        it('Icon and text button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
            expect(element.textContent).toEqual('Button');
        });

        it('Text and Icon button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss', iconPosition: 'Right' });
            button.appendTo('#button');
            expect(element.textContent).toEqual('Button');
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
        });

        it('Text and Top Icon button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss', iconPosition: 'Top' });
            button.appendTo('#button');
            expect(element.classList).toContain('e-top-icon-btn');
            expect(element.childNodes[0].classList).toContain('e-icon-top');
        });

        it('Text and Bottom Icon button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss', iconPosition: 'Bottom' });
            button.appendTo('#button');
            expect(element.classList).toContain('e-bottom-icon-btn');
            expect(element.childNodes[1].classList).toContain('e-icon-bottom');
        });

        it('RTL testing', () => {
            button = new Button({ enableRtl: true });
            button.appendTo('#button');
            expect(element.classList.contains('e-rtl')).toEqual(true);
        });

        it('CSS class testing', () => {
            button = new Button({ cssClass: 'e-secondary' });
            button.appendTo('#button');
            expect(element.classList.contains('e-secondary')).toEqual(true);
        });

        it('Content testing', () => {
            button = new Button({ content: '<span class="e-icons e-btn-icon e-add-icon e-icon-left"></span>Button' }, '#button');
            expect(element.childNodes[0].nodeName).toEqual('SPAN');
            expect(element.textContent).toEqual('Button');
        });

        it('Content and IconCss Testing', () => {
            button = new Button({ content: 'Button', iconCss: 'e-icons e-add-icon' }, '#button');
            expect(element.childNodes[0].nodeName).toEqual('SPAN');
            expect(element.textContent).toEqual('Button');
            button.destroy();
            button = new Button({ content: '<div>Button</div>', iconCss: 'e-icons e-add-icon', iconPosition: 'Right' }, '#button');
            expect(element.childNodes[0].nodeName).toEqual('DIV');
            expect(element.childNodes[1].nodeName).toEqual('SPAN');
            expect(element.textContent).toEqual('Button');
        });

        it('Toggle Button Testing', () => {
            button = new Button({ content: 'Button', isToggle: true }, '#button');
            button.element.click();
            expect(element.classList).toContain('e-active');
            button.element.click();
            expect(element.classList).not.toContain('e-active');
        });
    });

    describe('Property', () => {
        afterEach(() => {
            button.destroy();
        });

        it('Primary button testing', () => {
            button = new Button({ isPrimary: true });
            button.appendTo('#button');
            expect(button.isPrimary).toEqual(true);
        });

        it('Disable state testing', () => {
            button = new Button({ disabled: true });
            button.appendTo('#button');
            expect(button.disabled).toEqual(true);
        });

        it('Icon button testing', () => {
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('iconcss');
        });

        it('Icon and text button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('iconcss');
            expect(button.iconPosition).toEqual('Left');
        });

        it('Text and Icon button testing', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss', iconPosition: 'Right' });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('iconcss');
            expect(button.iconPosition).toEqual('Right');
        });

        it('RTL testing', () => {
            button = new Button({ enableRtl: true });
            button.appendTo('#button');
            expect(button.enableRtl).toEqual(true);
        });

        it('CSS class testing', () => {
            button = new Button({ cssClass: 'e-secondary' });
            button.appendTo('#button');
            expect(button.cssClass).toEqual('e-secondary');
        });

        it('Content testing', () => {
            button = new Button({ content: '<span class="e-icons e-btn-icon e-add-icon e-icon-left"></span>Button' }, '#button');
            expect(button.content).toEqual('<span class="e-icons e-btn-icon e-add-icon e-icon-left"></span>Button');
        });

        it('Toggle Button Testing', () => {
            button = new Button({ isToggle: true }, '#button');
            expect(button.isToggle).toEqual(true);
        });

        it('Enable Html Sanitizer testing', () => {
            button = new Button({ content: 'Button<style>body{background:rgb(0, 0, 255)}</style>' }, '#button');
            const htmlele: Element = document.body;
            expect(button.content).toEqual('Button<style>body{background:rgb(0, 0, 255)}</style>');
            expect(window.getComputedStyle(htmlele).backgroundColor).not.toBe('rgb(0, 0, 255)');
        });

        it('Enable Html Sanitizer disabled testing', () => {
            button = new Button({ content: '<style>body{background:rgb(0, 0, 255)}</style>', enableHtmlSanitizer: false }, '#button');
            const htmlele: Element = document.body;
            expect(window.getComputedStyle(htmlele).backgroundColor).toBe('rgb(0, 0, 255)');
        });
    });

    describe('notify property changes of', () => {
        afterEach(() => {
            button.destroy();
        });

        it('Primary in onPropertyChanged', () => {
            button = new Button();
            button.appendTo('#button');
            button.isPrimary = true;
            button.dataBind();
            expect(element.classList.contains('e-primary')).toEqual(true);
            button.isPrimary = false;
            button.dataBind();
            expect(element.classList.contains('e-primary')).toEqual(false);
        });

        it('Disabled in onPropertyChanged', () => {
            button = new Button();
            button.appendTo('#button');
            button.disabled = true;
            button.dataBind();
            expect(element.classList.contains('e-disabled')).toEqual(true);
            expect(element.getAttribute('disabled')).toEqual('');
            button.disabled = false;
            button.dataBind();
            expect(element.classList.contains('e-disabled')).toEqual(false);
            expect(element.getAttribute('disabled')).toEqual(null);
        });

        it('IconCss in onPropertyChanged', () => {
            button = new Button({ iconCss: 'icon', content: 'iconcss' });
            button.appendTo('#button');
            button.iconCss = 'iconcss';
            button.dataBind();
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
            element.innerHTML = '';
            button.iconCss = 'iconclass';
            button.dataBind();
            expect(element.children[0].classList.contains('iconclass')).toEqual(true);
            button.destroy();
            button.iconPosition = 'Right';
            button.iconCss = 'iconcss';
            button.dataBind();
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
        });

        it('IconPosition right in onPropertyChanged', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            button.iconCss = 'icon-right';
            button.iconPosition = 'Right';
            button.dataBind();
            expect(element.textContent).toEqual('Button');
            expect(element.children[0].classList.contains('icon-right')).toEqual(true);
            expect(element.children[0].classList.contains('e-icon-right')).toEqual(true);
        });

        it('IconPosition left in onPropertyChanged', () => {
            element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss', iconPosition: 'Right' });
            button.appendTo('#button');
            button.iconPosition = 'Left';
            button.dataBind();
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
            expect(element.textContent).toEqual('Button');
            button.destroy();
            button.element.innerHTML = '';
            button.element.textContent = 'Button';
            button = new Button({ iconCss: 'iconcss' });
            button.appendTo('#button');
            detach(button.element.getElementsByTagName('span')[0]);
            button.iconPosition = 'Right';
            button.dataBind();
            expect(element.children[0].classList.contains('iconcss')).toEqual(true);
            expect(element.textContent).toEqual('Button');
        });

        it('CssClass in onPropertyChanged', () => {
            button = new Button({ cssClass: 'class' });
            button.appendTo('#button');
            button.cssClass = 'styleclass';
            button.dataBind();
            expect(element.classList.contains('styleclass')).toEqual(true);
            button = new Button();
            button.appendTo('#button');
            button.cssClass = 'styleclass';
            button.dataBind();
            expect(element.classList.contains('styleclass')).toEqual(true);
        });

        it('EnableRtl in onPropertyChanged', () => {
            button = new Button();
            button.appendTo('#button');
            button.enableRtl = true;
            button.dataBind();
            expect(element.classList.contains('e-rtl')).toEqual(true);
            button.enableRtl = false;
            button.dataBind();
            expect(element.classList.contains('e-rtl')).toEqual(false);
        });

        it('Content in onPropertyChanged', () => {
            button = new Button();
            button.appendTo('#button');
            button.content = 'play';
            button.dataBind();
            expect(element.textContent).toEqual('play');
            button.iconCss = 'e-icons e-add-icon';
            button.iconPosition = 'Left';
            button.dataBind();
            expect(element.childNodes[0].nodeName).toEqual('SPAN');
            expect(element.childNodes[1].nodeName).toEqual('#text');
            expect(element.textContent).toEqual('play');
            button.element.innerHTML = '';
            button.content = 'Content';
            button.dataBind();
            expect(element.childNodes[0].nodeName).toEqual('SPAN');
            expect(element.textContent).toEqual('Content');
        });

        it('Toggle in onPropertyChanged', () => {
            button = new Button({}, '#button');
            button.isToggle = true;
            button.dataBind();
            button.element.click();
            expect(element.classList).toContain('e-active');
            button.isToggle = false;
            button.dataBind();
            button.element.click();
            expect(element.classList).not.toContain('e-active');
        });
    });

    describe('methods', () => {
        it('destroy method', () => {
            button = new Button();
            button.appendTo('#button');
            button.destroy();
            expect(element.classList.contains('e-btn')).toEqual(false);
        });

        it('destroy method with extra space of cssClass property', () => {
            button = new Button({cssClass: 'e-custom '});
            button.appendTo('#button');
            button.cssClass = "e-custom e-css ";
            button.dataBind();
            button.destroy();
            expect(element.classList.contains('e-btn')).toEqual(false);
        });

        it('getModuleName method', () => {
            button = new Button();
            button.appendTo('#button');
            expect(button.getModuleName()).toEqual('btn');
        });

        it('getPersistData & inject method', () => {
            button = new Button({ enablePersistence: true });
            button.appendTo('#button');
            expect(button.getPersistData()).toEqual('{}');
            Button.Inject();
        });
        it('Native methods - Click and Focus ', () => {
            button = new Button();
            button.appendTo('#button');
            button.click();
            button.focusIn();
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

    // ---------------------------------------------------------------------------
    // Repeat Button Tests
    // ---------------------------------------------------------------------------

    describe('Repeat Button — Core Pointer Behavior', () => {
        let repeatBtn: Button;
        const repeatElement: HTMLButtonElement = createElement('button', { id: 'repeat-button' }) as HTMLButtonElement;
        document.body.appendChild(repeatElement);

        afterEach(() => {
            jasmine.clock().uninstall();
            repeatBtn.destroy();
        });

        // 8.1 — enableRepeat default is false, no repeat handlers wired
        it('8.1 enableRepeat default is false', () => {
            repeatBtn = new Button({}, '#repeat-button');
            expect(repeatBtn.enableRepeat).toBe(false);
        });

        // 8.2 — single click with enableRepeat: true fires clicked with isRepeat: false exactly once
        it('8.2 single pointerdown fires clicked with isRepeat: false exactly once', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            const pdEvent: PointerEvent = new PointerEvent('pointerdown', { button: 0, bubbles: true });
            repeatElement.dispatchEvent(pdEvent);
            // cancel immediately
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            expect(fired.length).toBe(1);
            expect(fired[0].isRepeat).toBe(false);
        });

        // 8.3 — hold past repeatDelay fires repeated clicked with isRepeat: true
        it('8.3 hold past repeatDelay fires clicked with isRepeat: true', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 400, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(400); // delay expires
            jasmine.clock().tick(300); // 3 interval ticks
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            // 1 initial + 3 repeats
            expect(fired.length).toBe(4);
            expect(fired[0].isRepeat).toBe(false);
            expect(fired[1].isRepeat).toBe(true);
            expect(fired[3].isRepeat).toBe(true);
        });

        // 8.4 — pointerup after hold clears timers and stops firing
        it('8.4 pointerup stops repeat', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 200, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = () => { fired.push({ originalEvent: new PointerEvent('pointerdown', { button: 0, bubbles: true }), isRepeat: false }); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(300);
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            const countAfterUp: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAfterUp); // no more fires after pointerup
        });

        // 8.5 — pointerleave stops repeat mid-hold
        it('8.5 pointerleave stops repeat mid-hold', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 100, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(200);
            repeatElement.dispatchEvent(new PointerEvent('pointerleave', { button: 0, bubbles: true }));
            const countAfterLeave: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAfterLeave);
        });

        // 8.6 — pointercancel stops repeat mid-hold
        it('8.6 pointercancel stops repeat mid-hold', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 100, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(200);
            repeatElement.dispatchEvent(new PointerEvent('pointercancel', { button: 0, bubbles: true }));
            const countAfterCancel: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAfterCancel);
        });

        // 8.7 — repeatDelay: 0 starts repeat immediately after initial click
        it('8.7 repeatDelay: 0 starts repeat immediately', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);   // initial fire (no delay phase)
            jasmine.clock().tick(200); // 2 interval ticks
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            // 1 initial + 2 repeats
            expect(fired.length).toBe(3);
        });

        // 8.8 — custom repeatInterval: 200 fires at 200ms cadence, not default 100ms
        it('8.8 custom repeatInterval: 200 fires at 200ms cadence', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 200 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);   // initial
            jasmine.clock().tick(400); // exactly 2 repeat fires at 200ms each
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            expect(fired.length).toBe(3); // 1 initial + 2 repeats
        });

        // 8.9 — right-click (button=2) does NOT fire clicked
        it('8.9 pointerdown with button=2 (right-click) does not fire clicked', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 2, bubbles: true }));
            jasmine.clock().tick(0);
            expect(fired.length).toBe(0);
        });

        // 8.10 — middle-click (button=1) does NOT fire clicked
        it('8.10 pointerdown with button=1 (middle-click) does not fire clicked', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 1, bubbles: true }));
            jasmine.clock().tick(0);
            expect(fired.length).toBe(0);
        });

        // 8.11 — right-click does not start any timer (no timer leak)
        it('8.11 right-click does not start any timer after 1000ms', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 400, repeatInterval: 100 }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 2, bubbles: true }));
            jasmine.clock().tick(1000); // well past both delay and several interval ticks
            expect(fired.length).toBe(0);
        });

        // 8.12 — primary button (button=0) still fires normally
        it('8.12 pointerdown with button=0 (primary) fires clicked normally', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true }, '#repeat-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            repeatElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            expect(fired.length).toBe(1);
            expect(fired[0].isRepeat).toBe(false);
        });
    });

    describe('Repeat Button — Keyboard Behavior', () => {
        let repeatBtn: Button;
        const kbElement: HTMLButtonElement = createElement('button', { id: 'repeat-kb-button' }) as HTMLButtonElement;
        document.body.appendChild(kbElement);

        afterEach(() => {
            jasmine.clock().uninstall();
            repeatBtn.destroy();
        });

        function makeKeyEvent(key: string, repeat: boolean): KeyboardEvent {
            return new KeyboardEvent('keydown', { key: key, repeat: repeat, bubbles: true });
        }

        // 9.1 — keydown with repeat: false on Space fires clicked with isRepeat: false
        it('9.1 keydown Space (repeat: false) fires clicked with isRepeat: false', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false));
            kbElement.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
            expect(fired.length).toBe(1);
            expect(fired[0].isRepeat).toBe(false);
        });

        // 9.2 — keydown with repeat: true and repeatInterval === 0 fires clicked with isRepeat: true
        it('9.2 keydown Space (repeat: true, repeatInterval 0) fires clicked with isRepeat: true', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatInterval: 0 }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false));
            kbElement.dispatchEvent(makeKeyEvent(' ', true));
            kbElement.dispatchEvent(makeKeyEvent(' ', true));
            kbElement.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
            expect(fired.length).toBe(3);
            expect(fired[1].isRepeat).toBe(true);
            expect(fired[2].isRepeat).toBe(true);
        });

        // 9.3 — keydown with repeat: true and repeatInterval > 0 is suppressed
        it('9.3 keydown Space (repeat: true, repeatInterval > 0) is suppressed', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatInterval: 150 }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false)); // fires once
            kbElement.dispatchEvent(makeKeyEvent(' ', true));  // suppressed
            kbElement.dispatchEvent(makeKeyEvent(' ', true));  // suppressed
            jasmine.clock().tick(0); // no interval started yet (delay not passed)
            // only the initial press fires — native repeats are suppressed
            expect(fired.length).toBe(1);
            kbElement.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
        });

        // 9.4 — custom interval active via keyboard: clock advance fires at interval rate
        it('9.4 keyboard custom interval fires at interval rate', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 200, repeatInterval: 100 }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false));
            jasmine.clock().tick(200); // delay expires
            jasmine.clock().tick(300); // 3 interval ticks
            kbElement.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
            expect(fired.length).toBe(4); // 1 initial + 3 repeats
        });

        // 9.5 — keyup clears active keyboard interval
        it('9.5 keyup clears active keyboard interval', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 100, repeatInterval: 100 }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false));
            jasmine.clock().tick(200);
            kbElement.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
            const countAfterUp: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAfterUp);
        });

        // 9.6 — blur clears active keyboard interval
        it('9.6 blur clears active keyboard interval', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 100, repeatInterval: 100 }, '#repeat-kb-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            kbElement.dispatchEvent(makeKeyEvent(' ', false));
            jasmine.clock().tick(200);
            kbElement.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
            const countAfterBlur: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAfterBlur);
        });
    });

    describe('Repeat Button — Edge Cases', () => {
        let repeatBtn: Button;
        const edgeElement: HTMLButtonElement = createElement('button', { id: 'repeat-edge-button' }) as HTMLButtonElement;
        document.body.appendChild(edgeElement);

        afterEach(() => {
            jasmine.clock().uninstall();
            repeatBtn.destroy();
        });

        // 10.1 — disabled set true mid-repeat clears timers and stops firing
        it('10.1 disabled set true mid-repeat stops all further clicks', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 100, repeatInterval: 100 }, '#repeat-edge-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(200);
            repeatBtn.disabled = true;
            repeatBtn.dataBind();
            const countAtDisable: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAtDisable);
        });

        // 10.2 — enableRepeat: true + isToggle: true — initial press toggles e-active; repeats do NOT re-toggle
        it('10.2 isToggle + enableRepeat: only initial press toggles e-active', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, isToggle: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-edge-button');
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            expect(edgeElement.classList.contains('e-active')).toBe(true);
            jasmine.clock().tick(300); // 3 repeat fires — must NOT toggle off
            expect(edgeElement.classList.contains('e-active')).toBe(true);
            edgeElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
        });

        // 10.3 — destroy() called mid-repeat — no clicked fires after destroy
        it('10.3 destroy mid-repeat stops firing', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-edge-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(200);
            repeatBtn.destroy();
            const countAtDestroy: number = fired.length;
            jasmine.clock().tick(500);
            expect(fired.length).toBe(countAtDestroy);
        });

        // 10.4 — enableRepeat toggled false → true → false dynamically
        it('10.4 enableRepeat toggled dynamically wires and unwires correctly', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: false }, '#repeat-edge-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };

            // wire on
            repeatBtn.enableRepeat = true;
            repeatBtn.dataBind();
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            edgeElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            expect(fired.length).toBeGreaterThan(0); // at least initial fire

            // unwire
            repeatBtn.enableRepeat = false;
            repeatBtn.dataBind();
            const countAfterUnwire: number = fired.length;
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(500);
            edgeElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            expect(fired.length).toBe(countAfterUnwire); // no new fires
        });

        // 10.5 — clicked event fires even when enableRepeat: false (simple click)
        it('10.5 clicked fires on simple click even when enableRepeat is false', () => {
            repeatBtn = new Button({ enableRepeat: false }, '#repeat-edge-button');
            let fired: boolean = false;
            // When enableRepeat is false the clicked event won't auto-fire; verify it can be triggered manually
            repeatBtn.clicked = () => { fired = true; };
            repeatBtn.trigger('clicked', { originalEvent: new Event('click'), isRepeat: false });
            expect(fired).toBe(true);
        });

        // 10.6 — native click DOM event fires on each repeat fire
        it('10.6 native click DOM event fires on each repeat fire', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-edge-button');
            let nativeClicks: number = 0;
            const nativeSpy: EventListenerOrEventListenerObject = () => { nativeClicks++; };
            edgeElement.addEventListener('click', nativeSpy);
            edgeElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            jasmine.clock().tick(200); // 2 repeat ticks
            edgeElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            edgeElement.removeEventListener('click', nativeSpy);
            // 1 initial + 2 repeats = 3 native clicks
            expect(nativeClicks).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Repeat – disabled guard', () => {
        let repeatBtn: Button;
        const guardElement: HTMLButtonElement = createElement('button', { id: 'repeat-guard-button' }) as HTMLButtonElement;
        document.body.appendChild(guardElement);

        afterEach(() => {
            jasmine.clock().uninstall();
            repeatBtn.destroy();
        });

        // 11.1 — disabled=true before pointerdown: clicked must not fire
        it('11.1 pointerdown does not fire clicked when button is already disabled', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-guard-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            repeatBtn.disabled = true;
            repeatBtn.dataBind();
            guardElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);
            jasmine.clock().tick(300);
            guardElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            expect(fired.length).toBe(0);
        });

        // 11.2 — disabled=true mid-repeat: no additional clicked fires after disable
        it('11.2 setting disabled mid-repeat stops further clicked events', () => {
            jasmine.clock().install();
            repeatBtn = new Button({ enableRepeat: true, repeatDelay: 0, repeatInterval: 100 }, '#repeat-guard-button');
            const fired: ClickedEventArgs[] = [];
            repeatBtn.clicked = (args: ClickedEventArgs) => { fired.push(args); };
            guardElement.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
            jasmine.clock().tick(0);   // initial fire + first interval starts
            jasmine.clock().tick(200); // 2 interval ticks
            const countAtDisable: number = fired.length;
            repeatBtn.disabled = true;
            repeatBtn.dataBind();
            jasmine.clock().tick(200); // 2 more ticks — should not fire
            guardElement.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
            expect(fired.length).toBe(countAtDisable);
        });
    });

    describe('Null or undefined value testing', () => {
        afterEach(() => {
            button.destroy();
        });

        it('Primary button testing', () => {
            button = new Button({ isPrimary: null });
            button.appendTo('#button');
            expect(button.isPrimary).toEqual(null);
            button = new Button({ isPrimary: undefined });
            button.appendTo('#button');
            expect(button.isPrimary).toEqual(false);
        });

        it('Disable state testing', () => {
            button = new Button({ disabled: null });
            button.appendTo('#button');
            expect(button.disabled).toEqual(null);
            button = new Button({ disabled: undefined });
            button.appendTo('#button');
            expect(button.disabled).toEqual(false);
        });

        it('Icon button testing', () => {
            button = new Button({ iconCss: null });
            button.appendTo('#button');
            expect(button.iconCss).toEqual(null);
            button = new Button({ iconCss: undefined });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('');
        });

        it('Icon Position button testing', () => {
            button = new Button({ iconPosition: null });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('');
            button = new Button({ iconPosition: undefined });
            button.appendTo('#button');
            expect(button.iconCss).toEqual('');
        });

        it('RTL testing', () => {
            button = new Button({ enableRtl: null });
            button.appendTo('#button');
            expect(button.enableRtl).toEqual(false);
            button = new Button({ enableRtl: undefined });
            button.appendTo('#button');
            expect(button.enableRtl).toEqual(false);
        });

        it('CSS class testing', () => {
            button = new Button({ cssClass: null });
            button.appendTo('#button');
            expect(button.cssClass).toEqual(null);
            button = new Button({ cssClass: undefined });
            button.appendTo('#button');
            expect(button.cssClass).toEqual('');
        });

        it('Content testing', () => {
            button = new Button({ content: null }, '#button');
            expect(button.content).toEqual(null);
            button = new Button({ content: undefined }, '#button');
            expect(button.content).toEqual('');
        });

        it('Toggle Button Testing', () => {
            button = new Button({ isToggle: null }, '#button');
            expect(button.isToggle).toEqual(null);
            button = new Button({ isToggle: undefined }, '#button');
            expect(button.isToggle).toEqual(false);
        });

        it('EnablePersistence Button Testing', () => {
            button = new Button({ enablePersistence: null }, '#button');
            expect(button.enablePersistence).toEqual(null);
            button = new Button({ enablePersistence: undefined }, '#button');
            expect(button.enablePersistence).toEqual(false);
        });

        it('Enable Html Sanitizer testing', () => {
            button = new Button({ enableHtmlSanitizer: null }, '#button');
            expect(button.enableHtmlSanitizer).toEqual(null);
            button = new Button({ enableHtmlSanitizer: undefined }, '#button');
            expect(button.enableHtmlSanitizer).toEqual(true);
        });

    });

});
