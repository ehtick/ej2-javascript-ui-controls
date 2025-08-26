import { Browser, createElement, EventHandler, isNullOrUndefined, remove } from "@syncfusion/ej2-base";
import { getMemoryProfile, inMB, profile } from "./common.spec";
import { SignatureBeforeSaveEventArgs, SignatureChangeEventArgs } from "../src/common/signature-base";
import { Signature } from "../src/signature/signature";

describe('Signature', () => {
    beforeAll(() => {
        const isDef: any = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending(); // skips test (in Chai)
            return;
        }
    });

    describe('DOM', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
        });

        afterEach(() => {
            if (signature) {
                signature.destroy();
                signature = undefined;
            }
            remove(signatureElement);
        });

        it('Default Signature testing', () => {
            signature = new Signature();
            signature.appendTo('#signature');
            expect(signatureElement.classList.contains('e-signature')).toEqual(true);
            expect(signatureElement.getAttribute('aria-label')).toBe("signature");
        });

        it('Get component name testing', () => {
            signature = new Signature();
            signature.appendTo('#signature');
            expect((signature as any).getModuleName()).toEqual('signature');
        });
    });

    describe('Properties', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
        });

        afterEach(() => {
            setTimeout(() => {
                if (signature) {
                    signature.destroy();
                    signature = undefined;
                }
            }, 300);
            remove(signatureElement);
        });

        it('backgroundColor', () => {
            signature = new Signature({ backgroundColor: 'red' });
            signature.appendTo('#signature');
            signature.dataBind();
            expect(signatureElement.style.backgroundColor).toEqual('red');
            signature.backgroundColor = 'blue';
            signature.dataBind();
            expect(signatureElement.style.backgroundColor).toEqual('blue');
        });

        it('backgroundImage', () => {
            signature = new Signature({ backgroundImage: './theme-files/signature.jpg' });
            signature.appendTo('#signature');
            signature.dataBind();
            expect(signatureElement.style.backgroundImage).toEqual('url("./theme-files/signature.jpg")');
            signature.backgroundImage = 'https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg';
            signature.dataBind();
            expect(signatureElement.style.backgroundImage).toEqual('url("https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg")');
        });

        it('disabled', () => {
            signature = new Signature({ disabled: true });
            signature.appendTo('#signature');
            signature.dataBind();
            signature.disabled = false;
            signature.dataBind();
        });

        it('enablePersistence', () => {
            signature = new Signature({ enablePersistence: true });
            signature.appendTo('#signature');
            signature.dataBind();
            signature.enablePersistence = false;
            signature.dataBind();
        });

        it('isReadOnly', () => {
            signature = new Signature({ isReadOnly: true });
            signature.appendTo('#signature');
            signature.dataBind();
            signature.isReadOnly = false;
            signature.dataBind();
        });

        it('maxStrokeWidth', () => {
            signature = new Signature({ maxStrokeWidth: 5 });
            signature.appendTo('#signature');
            signature.setProperties({maxStrokeWidth: 3 });
        });

        it('minStrokeWidth', () => {
            signature = new Signature({ minStrokeWidth: 3 });
            signature.appendTo('#signature');
            signature.setProperties({minStrokeWidth: 3 });
        });

        it('saveWithBackground', () => {
            signature = new Signature({ saveWithBackground: false });
            signature.appendTo('#signature');
            signature.dataBind();
            signature.saveWithBackground = true;
            signature.dataBind();
        });

        it('strokeColor', () => {
            signature = new Signature({ strokeColor: 'red' });
            signature.appendTo('#signature');
            signature.dataBind();
            signature.strokeColor = 'blue';
            signature.dataBind();
        });

        it('velocity', () => {
            signature = new Signature({ velocity: 4 });
            signature.appendTo('#signature');
            signature.setProperties({velocity: 3 });
        });
    });

    describe('Methods', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
        });

        afterEach(() => {
            setTimeout(() => {
                if (signature) {
                    signature.destroy();
                    signature = undefined;
                }
            }, 900);
            remove(signatureElement);
        });

        it('canUndo, canRedo and isEmpty methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            expect(signature.isEmpty()).toBe(true);
            expect(signature.canUndo()).toBe(false);
            expect(signature.canRedo()).toBe(false);
        });

        it('clear and draw methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            signature.clear();
            signature.draw('Signature', 'Arial', 40, 200, 300);
        });

        it('getBlob and saveAsBlob methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            var data = signature.getBlob(signature.getSignature());
            var data1 = signature.saveAsBlob();
        });

        it('getSignature methods', () => {
            signature = new Signature({backgroundColor: 'red'});
            signature.appendTo('#signature');
            var png = signature.getSignature('Png');
            var jpeg = signature.getSignature('Jpeg');
            var svg = signature.getSignature('Svg');
            signature.dataBind();
            signature.clear();
            signature.backgroundImage = 'https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg';
            signature.dataBind();
            signature.clear();
            var png = signature.getSignature('Png');
            var jpeg1 = signature.getSignature('Jpeg');
            var svg1 = signature.getSignature('Svg');
        });

        it('load methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            signature.load(signature.getSignature('Jpeg'));
        });

        it('load methods - url', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            signature.load('https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg');
        });
        
        it('undo and redo methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            signature.undo();
            signature.redo();
        });

        it('refresh and save methods', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            signature.refresh();
            signature.save('Png', 'signature1');
            signature.save('Jpeg', 'signature1');
            signature.save('Svg', 'signature1');
        });

        it('save methods with backgroundColor', () => {
            signature = new Signature({backgroundColor: 'red'});
            signature.appendTo('#signature');
            signature.dataBind();
            signature.save('Png', 'signature2');
            signature.save('Jpeg', 'signature2');
            signature.save('Svg', 'signature2');
        });

        it('save methods with backgroundImage', () => {
            signature = new Signature({backgroundImage: 'https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg'});
            signature.appendTo('#signature');
            signature.dataBind();
            signature.save('Png', 'signature3');
            signature.save('Jpeg', 'signature3');
            signature.save('Svg', 'signature3');
        });
    });

    describe('Events', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;
        let mouseEventArs: any;
        let keyboardEventArgs: any;
        let touchEvent: any;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
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
            keyboardEventArgs = {
                preventDefault: (): void => { },
                action: null,
                target: null,
                stopImmediatePropagation: (): void => { },
            };
            touchEvent = {
                preventDefault: (): void => { },
                stopPropagation: (): void => { },
                stopImmediatePropagation: (): void => { },
                target: null,
                relatedTarget: null,
                type: null,
                shiftKey: false,
                ctrlKey: false,
                touches: [{ clientX: Number }]
            };
        });

        afterEach(() => {
            setTimeout(() => {
                if (signature) {
                    signature.destroy();
                    signature = undefined;
                }
            }, 300);
            remove(signatureElement);
        });

        it('created event', () => {
            signature = new Signature({ 
                created: () => {
                    expect(signatureElement.classList.contains('e-signature')).toEqual(true);
                }
            });
            signature.appendTo('#signature');
        });

        it('change event', () => {
            signature = new Signature({ 
                change: (args: SignatureChangeEventArgs) => {
                    if (args.actionName === 'strokeUpdate') {
                        expect(args.actionName).toEqual('strokeUpdate');
                    } else if (args.actionName === 'clear') {
                        expect(args.actionName).toEqual('clear');
                    } else if (args.actionName === 'undo') {
                        expect(args.actionName).toEqual('undo');
                    } else if (args.actionName === 'redo') {
                        expect(args.actionName).toEqual('redo');
                    } else if (args.actionName === 'draw-text') {
                        expect(args.actionName).toEqual('draw-text');
                    }
                }
            });
            signature.appendTo('#signature');
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).mouseDownHandler(mouseEventArs);
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseMoveHandler(mouseEventArs);
            mouseEventArs.clientX = 150; mouseEventArs.clientY = 180; mouseEventArs.buttons = 1; mouseEventArs.type = 'mouseup';
            (signature as any).mouseUpHandler(mouseEventArs);
            signature.undo();
            signature.draw('signature', 'arial', 40);
            signature.clear();
            signature.redo();
        });

        it('beforeEvent event', () => {
            signature = new Signature({ 
                beforeSave: (args: SignatureBeforeSaveEventArgs) => {
                    expect(args.fileName).toEqual('Signature');
                }
            });
            signature.appendTo('#signature');
            keyboardEventArgs.target = signatureElement;
            keyboardEventArgs.key = 's'; keyboardEventArgs.ctrlKey = true;
            (signature as any).keyboardHandler(keyboardEventArgs);
        });

        it('mouse event', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).mouseDownHandler(mouseEventArs);
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseMoveHandler(mouseEventArs);
            mouseEventArs.clientX = 150; mouseEventArs.clientY = 180; mouseEventArs.buttons = 1; mouseEventArs.type = 'mouseup';
            (signature as any).mouseUpHandler(mouseEventArs);
        });

        it('touch event', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            touchEvent.touches[0].clientX = 120;  touchEvent.touches[0].clienty = 120; touchEvent.type = 'touchstart';
            (signature as any).mouseDownHandler(touchEvent);
            touchEvent.touches[0].clientX = 150; touchEvent.touches[0].clienty = 150; touchEvent.type = 'touchmove';
            (signature as any).mouseMoveHandler(touchEvent);
            touchEvent.touches[0].clientX = 180; touchEvent.touches[0].clienty = 180; touchEvent.type = 'touchstart';
            (signature as any).mouseUpHandler(touchEvent);
        });

        it('Keyboard event', () => {
            signature = new Signature({ 
                change: (args: SignatureChangeEventArgs) => {
                    if (args.actionName === 'clear') {
                        expect(args.actionName).toEqual('clear');
                    } else if (args.actionName === 'undo') {
                        expect(args.actionName).toEqual('undo');
                    } else if (args.actionName === 'redo') {
                        expect(args.actionName).toEqual('redo');
                    }
                }
            });
            signature.appendTo('#signature');
            keyboardEventArgs.target = signatureElement;
            keyboardEventArgs.key = 'Delete';
            (signature as any).keyboardHandler(keyboardEventArgs);
            keyboardEventArgs.key = 'z'; keyboardEventArgs.ctrlKey = true;
            (signature as any).keyboardHandler(keyboardEventArgs);
            keyboardEventArgs.key = 'y'; keyboardEventArgs.ctrlKey = true;
            (signature as any).keyboardHandler(keyboardEventArgs);
        });

        it('coverage improvement-resize', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).isResponsive = false;
            (signature as any).resizeHandler();
        });

        it('coverage improvement-delay', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).storedArgs = mouseEventArs;
            (signature as any).pointColl = [{x: 100, y: 100}, {x: 101, y: 101}];
            (signature as any).delay();
        });

        it('coverage improvement-start draw', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).startPoint = { x: 100, y: 100, time: 100 };
            (signature as any).controlPoint1 = { x: 101, y: 100, time: 101 };
            (signature as any).controlPoint2 = { x: 102, y: 100, time: 102 };
            (signature as any).endPoint = { x: 103, y: 100, time: 103 };
            (signature as any).startDraw();
            (signature as any).pointColl = [{x: 100, y: 100}, {x: 101, y: 101}];
            (signature as any).addPoint({x: 102, y: 102});
            (signature as any).curveDraw(50, 50);
            (signature as any).calculateCurveControlPoints({x: 100, y: 100}, {x: 101, y: 101}, {x: 102, y: 102});
            (signature as any).bezierLengthCalc();
            (signature as any).enableOrDisable(true);
            (signature as any).getModuleName();
        });
        it('coverage improvement- temp background image', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).setBackgroundImage('https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg', 'temp');
        });
        it('coverage improvement- background image', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).setBackgroundImage('https://images.pexels.com/photos/20538303/pexels-photo-20538303.jpeg');
        });
        it('coverage improvement- end draw', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).pointColl = null;
            (signature as any).endDraw();
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).mouseDownHandler(mouseEventArs);
            (signature as any).interval = null;
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseMoveHandler(mouseEventArs);
        });
    });

    describe('Null or undefined Property testing', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
        });

        afterEach(() => {
            if (signature) {
                signature.destroy();
                signature = undefined;
            }
            remove(signatureElement);
            signatureElement = null;
        });

        it('signature with disabled - null', () => {
            signature = new Signature({ disabled: null });
            signature.appendTo('#signature');
            expect(signature.disabled).toEqual(null);
        });

        it('signature with disabled - undefined', () => {
            signature = new Signature({ disabled: undefined });
            signature.appendTo('#signature');
            expect(signature.disabled).toEqual(false);
        });

        it('signature with enablePersistence - null', () => {
            signature = new Signature({ enablePersistence: null });
            signature.appendTo('#signature');
            expect(signature.enablePersistence).toEqual(null);
        });

        it('signature with enablePersistence - undefined', () => {
            signature = new Signature({ enablePersistence: undefined });
            signature.appendTo('#signature');
            expect(signature.enablePersistence).toEqual(false);
        });

        it('signature with isReadOnly - null', () => {
            signature = new Signature({ isReadOnly: null });
            signature.appendTo('#signature');
            expect(signature.isReadOnly).toEqual(null);
        });

        it('signature with isReadOnly - undefined', () => {
            signature = new Signature({ isReadOnly: undefined });
            signature.appendTo('#signature');
            expect(signature.isReadOnly).toEqual(false);
        });

        it('signature with maxStrokeWidth - null', () => {
            signature = new Signature({ maxStrokeWidth: null });
            signature.appendTo('#signature');
            expect(signature.maxStrokeWidth).toEqual(null);
        });

        it('signature with maxStrokeWidth - undefined', () => {
            signature = new Signature({ maxStrokeWidth: undefined });
            signature.appendTo('#signature');
            expect(signature.maxStrokeWidth).toEqual(2);
        });

        it('signature with minStrokeWidth - null', () => {
            signature = new Signature({ minStrokeWidth: null });
            signature.appendTo('#signature');
            expect(signature.minStrokeWidth).toEqual(null);
        });

        it('signature with minStrokeWidth - undefined', () => {
            signature = new Signature({ minStrokeWidth: undefined });
            signature.appendTo('#signature');
            expect(signature.minStrokeWidth).toEqual(0.5);
        });

        it('signature with saveWithBackground - null', () => {
            signature = new Signature({ saveWithBackground: null });
            signature.appendTo('#signature');
            expect(signature.saveWithBackground).toEqual(null);
        });

        it('signature with saveWithBackground - undefined', () => {
            signature = new Signature({ saveWithBackground: undefined });
            signature.appendTo('#signature');
            expect(signature.saveWithBackground).toEqual(true);
        });

        it('signature with strokeColor - null', () => {
            signature = new Signature({ strokeColor: null });
            signature.appendTo('#signature');
            expect(signature.strokeColor).toEqual(null);
        });

        it('signature with strokeColor - undefined', () => {
            signature = new Signature({ strokeColor: undefined });
            signature.appendTo('#signature');
            expect(signature.strokeColor).toEqual('#000000');
        });

        it('signature with velocity - null', () => {
            signature = new Signature({ velocity: null });
            signature.appendTo('#signature');
            expect(signature.velocity).toEqual(null);
        });

        it('signature with velocity - undefined', () => {
            signature = new Signature({ velocity: undefined });
            signature.appendTo('#signature');
            expect(signature.velocity).toEqual(0.7);
        });

        it('signature with backgroundColor - null', () => {
            signature = new Signature({ backgroundColor: null });
            signature.appendTo('#signature');
            expect(signature.backgroundColor).toEqual(null);
        });

        it('signature with backgroundColor - undefined', () => {
            signature = new Signature({ backgroundColor: undefined });
            signature.appendTo('#signature');
            expect(signature.backgroundColor).toEqual('');
        });

        it('signature with backgroundImage - null', () => {
            signature = new Signature({ backgroundImage: null });
            signature.appendTo('#signature');
            expect(signature.backgroundImage).toEqual(null);
        });
    });

    describe('Resposnive testing', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;

        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            (signatureElement as any).height = 500;
            (signatureElement as any).width = 1000;
            document.body.appendChild(signatureElement);
        });

        afterEach(() => {
            if (signature) {
                signature.destroy();
                signature = undefined;
            }
            remove(signatureElement);
        });

        it('signature with backgroundImage', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
        });
    });

    describe('Blazor testing', () => {
        let signature: Signature;
        let signatureElement: HTMLElement;
        let mouseEventArs: any;
        let keyboardEventArgs: any;
        let dotnetRef: any;
        beforeEach(() => {
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
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
            keyboardEventArgs = {
                preventDefault: (): void => { },
                action: null,
                target: null,
                stopImmediatePropagation: (): void => { },
            };
            dotnetRef = {
                invokeMethodAsync: (methodName: string, args: any) => { }
            };
        });

        afterEach(() => {
            setTimeout(() => {
                if (signature) {
                    signature.destroy();
                    signature = undefined;
                }
            }, 150);
            remove(signatureElement);
        });

        it('coverage improvement-blazor', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).dotnetRef = dotnetRef;
            (signature as any).isBlazor = true;
            (signature as any).pointColl = null;
            (signature as any).endDraw();
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).mouseDownHandler(mouseEventArs);
            (signature as any).interval = null;
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseMoveHandler(mouseEventArs);
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseUpHandler(mouseEventArs);
            keyboardEventArgs.target = signatureElement;
            keyboardEventArgs.key = 's'; keyboardEventArgs.ctrlKey = true;
            (signature as any).keyboardHandler(keyboardEventArgs);
            (signature as any).clear();
            (signature as any).undo();
            (signature as any).redo();
        });
        it('coverage improvement-blazor-timeout', () => {
            signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).dotnetRef = dotnetRef;
            (signature as any).isBlazor = true;
            mouseEventArs.clientX = 100; mouseEventArs.clientY = 100; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousedown';
            (signature as any).mouseDownHandler(mouseEventArs);
            (signature as any).interval = 1;
            (signature as any).timeout = 1;
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseMoveHandler(mouseEventArs);
            mouseEventArs.clientX = 130; mouseEventArs.clientY = 130; mouseEventArs.buttons = 1; mouseEventArs.type = 'mousemove';
            (signature as any).mouseUpHandler(mouseEventArs);
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
    describe('Null or undefined Property testing', () => {
        it('coverage improvement-persist', () => {
            let signatureElement: HTMLElement;
            signatureElement = createElement('canvas', { id: 'signature' });
            document.body.appendChild(signatureElement);
            let signature: Signature = new Signature({});
            signature.appendTo('#signature');
            (signature as any).getPersistData();
            (signature as any).loadPersistedSignature();
        });
    });
});
