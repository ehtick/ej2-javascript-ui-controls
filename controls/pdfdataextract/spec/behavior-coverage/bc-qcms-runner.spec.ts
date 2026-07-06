
import { _PdfQcmsRunner } from '../../src/pdf-data-extract/core/import/qcms-runner';

describe('_PdfQcmsRunner', () => {
    let originalImportScripts: unknown;
    let originalFactory: unknown;
    let originalOnMessage: unknown;
    let hadImportScripts: boolean;

    function _setImportScripts(value: unknown): void {
        Object.defineProperty(self, 'importScripts', {
            configurable: true,
            writable: true,
            value
        });
    }

    function _invokeMessage(data: unknown): void {
        const handler = (self as unknown as {
            onmessage?: (event: { data: unknown }) => void;
        }).onmessage;

        expect(typeof handler).toBe('function');

        if (handler) {
            handler({ data });
        }
    }

    beforeEach(() => {
        hadImportScripts = Object.prototype.hasOwnProperty.call(self, 'importScripts');
        originalImportScripts = (self as unknown as { importScripts?: unknown }).importScripts;
        originalFactory = (self as unknown as { qcmsModule?: unknown }).qcmsModule;
        originalOnMessage = (self as unknown as { onmessage?: unknown }).onmessage;
    });

    afterEach(() => {
        if (hadImportScripts) {
            _setImportScripts(originalImportScripts);
        } else {
            delete (self as unknown as { importScripts?: unknown }).importScripts;
        }

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = originalFactory;
        (self as unknown as { onmessage?: unknown }).onmessage = originalOnMessage;
    });

    it('should cover !data return, !data.message return, initialLoading success, loaded, getModule and unloadQcms with no transformers', () => {
        const postedMessages: Array<{ message: string; reqId?: number; loaded?: boolean; id?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; reqId?: number; loaded?: boolean; id?: number });
            });

        const importScriptsSpy: jasmine.Spy = jasmine.createSpy('importScripts');
        _setImportScripts(importScriptsSpy);

        let capturedModule: { url?: string; onRuntimeInitialized?: () => void } | null = null;

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            url?: string;
            onRuntimeInitialized?: () => void;
        }): void => {
            capturedModule = module;
            if (capturedModule.onRuntimeInitialized) {
                capturedModule.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage(null);
        _invokeMessage({});

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets///',
            reqId: 1
        });

        _invokeMessage({
            message: 'getModule',
            id: 101,
            reqId: 2
        });

        _invokeMessage({
            message: 'unloadQcms',
            reqId: 3
        });

        expect(importScriptsSpy).toHaveBeenCalledWith('http://localhost/assets/qcms.js');
        expect(capturedModule).not.toBeNull();
        expect((capturedModule as { url?: string }).url).toBe('http://localhost/assets');

        expect(postedMessages[0]).toEqual({ message: 'loaded' });
        expect(postedMessages[1]).toEqual({
            message: 'moduleInfo',
            id: 101,
            loaded: true,
            reqId: 2
        });
        expect(postedMessages[2]).toEqual({
            message: 'unloaded',
            reqId: 3
        });
    });

    it('should cover initialLoading importScripts failure branch', () => {
        const postedMessages: Array<{ message: string; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string; reqId?: number });
            });

        _setImportScripts((): void => {
            throw new Error('import fail');
        });

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 10
        });

        expect(postedMessages.length).toBe(1);
        expect(postedMessages[0].message).toBe('initError');
        expect(postedMessages[0].error).toContain('Failed to import qcms.js');
        expect(postedMessages[0].reqId).toBe(10);
    });

    it('should cover initialLoading factory-not-found branch', () => {
        const postedMessages: Array<{ message: string; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));
        (self as unknown as { qcmsModule?: unknown }).qcmsModule = undefined;

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 11
        });

        expect(postedMessages.length).toBe(1);
        expect(postedMessages[0]).toEqual({
            message: 'initError',
            error: 'qcmsModule factory not found after loading qcms.js',
            reqId: 11
        });
    });

    it('should cover initialLoading outer catch branch', () => {
        const postedMessages: Array<{ message: string; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (): void => {
            throw new Error('factory boom');
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 12
        });

        expect(postedMessages.length).toBe(1);
        expect(postedMessages[0]).toEqual({
            message: 'initError',
            error: 'factory boom',
            reqId: 12
        });
    });

    it('should cover convertQcms ensureLoaded error branch', () => {
        const postedMessages: Array<{ message: string; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (): void => {
            return;
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'convertQcms',
            payload: {
                src: new Uint8Array([1, 2, 3]),
                profileBytes: new Uint8Array([4, 5, 6]),
                inType: 1,
                intent: 2
            },
            reqId: 20
        });

        expect(postedMessages[0]).toEqual({
            message: 'convertError',
            error: 'Module not loaded yet.',
            reqId: 20
        });
    });

    it('should cover convertQcms no-result-captured error branch', () => {
        const postedMessages: Array<{ message: string; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        const transformerSpy: jasmine.Spy = jasmine.createSpy('qcms_transformer_from_memory').and.returnValue(77);
        const convertArraySpy: jasmine.Spy = jasmine.createSpy('qcms_convert_array').and.callFake((): void => {
            return;
        });
        const dropSpy: jasmine.Spy = jasmine.createSpy('qcms_drop_transformer');

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: jasmine.Spy;
            qcms_convert_array?: jasmine.Spy;
            qcms_drop_transformer?: jasmine.Spy;
        }): void => {
            module.qcms_transformer_from_memory = transformerSpy;
            module.qcms_convert_array = convertArraySpy;
            module.qcms_drop_transformer = dropSpy;

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 21
        });

        _invokeMessage({
            message: 'convertQcms',
            payload: {
                src: [1, 2, 3],
                profileBytes: [4, 5, 6],
                inType: 1,
                intent: 2
            },
            reqId: 22
        });

        expect(transformerSpy).toHaveBeenCalled();
        expect(convertArraySpy).toHaveBeenCalled();
        expect(dropSpy).toHaveBeenCalledWith(77);

        expect(postedMessages[1].message).toBe('convertError');
        expect(postedMessages[1].error).toContain('QCMS conversion finished but no result was captured');
        expect(postedMessages[1].reqId).toBe(22);
    });

    it('should cover createTransformer success and failure handle-0 branches', () => {
        const postedMessages: Array<{ message: string; id?: number; handle?: number; error?: string; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as {
                    message: string;
                    id?: number;
                    handle?: number;
                    error?: string;
                    reqId?: number;
                });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let callCount: number = 0;

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: (profile: Uint8Array, inType: number, intent: number) => number;
        }): void => {
            module.qcms_transformer_from_memory = (): number => {
                callCount++;
                return callCount === 1 ? 123 : 0;
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 30
        });

        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: [1, 2, 3],
                inType: 1,
                intent: 2
            },
            reqId: 31
        });

        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: [4, 5, 6],
                inType: 3,
                intent: 4
            },
            reqId: 32
        });

        expect(postedMessages[1]).toEqual({
            message: 'transformerCreated',
            id: 1,
            handle: 123,
            reqId: 31
        });

        expect(postedMessages[2]).toEqual({
            message: 'createTransformerError',
            error: 'Failed to create transformer',
            reqId: 32
        });
    });

    it('should cover convertWith success for alpha=true and alpha=false', () => {
        const postedMessages: Array<{ message: string; id?: number; data?: Uint8Array; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; id?: number; data?: Uint8Array; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            memory?: { buffer: ArrayBuffer };
            qcms_convert_array?: (id: number, src: Uint8Array) => void;
            copy_result?: (ptr: number, len: number) => void;
        }): void => {
            module.memory = { buffer: new Uint8Array([10, 20, 30, 40, 50, 60]).buffer };
            module.qcms_convert_array = (): void => {
                if (module.copy_result) {
                    module.copy_result(0, 3);
                }
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 40
        });

        const shared: Uint8Array = new Uint8Array(4);
        _invokeMessage({
            message: 'convertWith',
            payload: {
                id: 5,
                src: shared,
                dest: new Uint8Array(shared.buffer),
                destOffset: 0,
                alpha: true
            },
            reqId: 41
        });

        const src2: Uint8Array = new Uint8Array([1, 2, 3]);
        const dest2: Uint8Array = new Uint8Array(4);
        dest2[3] = 99;

        _invokeMessage({
            message: 'convertWith',
            payload: {
                id: 6,
                src: src2,
                dest: dest2,
                destOffset: 0,
                alpha: false
            },
            reqId: 42
        });

        expect(postedMessages[1].message).toBe('convertWithResult');
        expect(postedMessages[1].id).toBe(5);
        expect((postedMessages[1].data as Uint8Array)[0]).toBe(10);
        expect((postedMessages[1].data as Uint8Array)[1]).toBe(20);
        expect((postedMessages[1].data as Uint8Array)[2]).toBe(30);
        expect((postedMessages[1].data as Uint8Array)[3]).toBe(255);

        expect(postedMessages[2].message).toBe('convertWithResult');
        expect(postedMessages[2].id).toBe(6);
        expect((postedMessages[2].data as Uint8Array)[0]).toBe(10);
        expect((postedMessages[2].data as Uint8Array)[1]).toBe(20);
        expect((postedMessages[2].data as Uint8Array)[2]).toBe(30);
        expect((postedMessages[2].data as Uint8Array)[3]).toBe(99);
    });

    it('should cover convertOne, convertThree and convertFour success branches', () => {
        const postedMessages: Array<{ message: string; id?: number; data?: unknown; reqId?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; id?: number; data?: unknown; reqId?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            memory?: { buffer: ArrayBuffer };
            qcms_convert_one?: (id: number, value: number, css: boolean) => void;
            qcms_convert_three?: () => void;
            qcms_convert_four?: () => void;
            copy_rgb?: (ptr: number) => void;
            make_cssRGB?: (r: number, g: number, b: number) => void;
        }): void => {
            module.memory = { buffer: new Uint8Array([7, 8, 9]).buffer };

            module.qcms_convert_one = (_id: number, _value: number, css: boolean): void => {
                if (css) {
                    if (module.make_cssRGB) {
                        module.make_cssRGB(1, 2, 3);
                    }
                } else {
                    if (module.copy_rgb) {
                        module.copy_rgb(0);
                    }
                }
            };

            module.qcms_convert_three = (): void => {
                return;
            };

            module.qcms_convert_four = (): void => {
                return;
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 50
        });

        const destA: Uint8Array = new Uint8Array(3);
        _invokeMessage({
            message: 'convertOne',
            payload: {
                id: 1,
                dest: destA,
                destOffset: 0,
                value: 10,
                css: false
            },
            reqId: 51
        });

        const destB: Uint8Array = new Uint8Array(3);
        _invokeMessage({
            message: 'convertOne',
            payload: {
                id: 2,
                dest: destB,
                destOffset: 0,
                value: 20,
                css: true
            },
            reqId: 52
        });

        _invokeMessage({
            message: 'convertThree',
            payload: {
                id: 3,
                dest: new Uint8Array(3),
                destOffset: 0,
                r: 1,
                g: 2,
                b: 3,
                css: true
            },
            reqId: 53
        });

        _invokeMessage({
            message: 'convertFour',
            payload: {
                id: 4,
                dest: new Uint8Array(4),
                destOffset: 0,
                c: 1,
                m: 2,
                y: 3,
                k: 4,
                css: false
            },
            reqId: 54
        });

        expect(destA[0]).toBe(7);
        expect(destA[1]).toBe(8);
        expect(destA[2]).toBe(9);

        expect(postedMessages[1]).toEqual({
            message: 'convertOneResult',
            id: 1,
            data: null,
            reqId: 51
        });

        expect(postedMessages[2]).toEqual({
            message: 'convertOneResult',
            id: 2,
            data: null,
            reqId: 52
        });

        expect(postedMessages[3]).toEqual({
            message: 'convertThreeResult',
            id: 3,
            data: null,
            reqId: 53
        });

        expect(postedMessages[4]).toEqual({
            message: 'convertFourResult',
            id: 4,
            data: null,
            reqId: 54
        });
    });


    it('should cover unloadQcms nested drop failure and outer unloadedError catch', () => {
        // Arrange
        const postedMessages: Array<{ message: string; reqId?: number; id?: number; handle?: number }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; reqId?: number; id?: number; handle?: number });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        const createSpy: jasmine.Spy = jasmine.createSpy('qcms_transformer_from_memory').and.returnValue(999);
        const dropSpy: jasmine.Spy = jasmine.createSpy('qcms_drop_transformer').and.throwError('drop fail');

        (self as unknown as { qcmsModule?: unknown }).qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: jasmine.Spy;
            qcms_drop_transformer?: jasmine.Spy;
        }): void => {
            module.qcms_transformer_from_memory = createSpy;
            module.qcms_drop_transformer = dropSpy;

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 90
        });

        // create transformer so unloadQcms actually iterates transformerMap
        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: new Uint8Array([1]),
                inType: 1,
                intent: 1
            },
            reqId: 91
        });

        // unloadQcms -> inner catch branch for qcms_drop_transformer failure
        _invokeMessage({
            message: 'unloadQcms',
            reqId: 92
        });

        expect(postedMessages[1]).toEqual({
            message: 'transformerCreated',
            id: 1,
            handle: 999,
            reqId: 91
        });

        expect(postedMessages[2]).toEqual({
            message: 'unloadedQcmsError',
            reqId: 92
        });

        expect(postedMessages[3]).toEqual({
            message: 'unloaded',
            reqId: 92
        });

        // Outer catch branch: force Map.prototype.forEach to throw
        const forEachSpy: jasmine.Spy = spyOn(Map.prototype, 'forEach').and.callFake((): void => {
            throw new Error('map foreach failed');
        });

        _invokeMessage({
            message: 'unloadQcms',
            reqId: 93
        });

        expect(forEachSpy).toHaveBeenCalled();

        expect(postedMessages[4]).toEqual({
            message: 'unloadedError',
            reqId: 93
        });

        expect(postedMessages[5]).toEqual({
            message: 'unloaded',
            reqId: 93
        });
    });



});


describe('_PdfQcmsRunner highlighted coverage', () => {

    type _WorkerSelf = {
        importScripts?: (...scripts: string[]) => void;
        qcmsModule?: unknown;
        onmessage?: (event: { data: unknown }) => void;
        postMessage: (message: unknown) => void;
    };

    const _workerSelf: _WorkerSelf = self as unknown as _WorkerSelf;

    let originalImportScripts: unknown;
    let originalFactory: unknown;
    let originalOnMessage: unknown;
    let hadImportScripts: boolean;

    function _setImportScripts(value: unknown): void {
        Object.defineProperty(_workerSelf as object, 'importScripts', {
            configurable: true,
            writable: true,
            value
        });
    }

    function _invokeMessage(data: unknown): void {
        const handler: ((event: { data: unknown }) => void) | undefined = _workerSelf.onmessage;
        expect(typeof handler).toBe('function');
        if (handler) {
            handler({ data });
        }
    }

    beforeEach(() => {
        hadImportScripts = Object.prototype.hasOwnProperty.call(_workerSelf, 'importScripts');
        originalImportScripts = _workerSelf.importScripts;
        originalFactory = _workerSelf.qcmsModule;
        originalOnMessage = _workerSelf.onmessage;
    });

    afterEach(() => {
        if (hadImportScripts) {
            _setImportScripts(originalImportScripts);
        } else {
            delete (_workerSelf as { importScripts?: unknown }).importScripts;
        }

        _workerSelf.qcmsModule = originalFactory;
        _workerSelf.onmessage = originalOnMessage as ((event: { data: unknown }) => void) | undefined;
    });

    it('should cover convertQcms catch branch', () => {
        const postedMessagesConvertQcms: Array<{
            message: string;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesConvertQcms.push(message as {
                message: string;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: () => number;
        }): void => {
            module.qcms_transformer_from_memory = (): number => {
                throw new Error('transformer failed');
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 1
        });

        _invokeMessage({
            message: 'convertQcms',
            payload: {
                src: new Uint8Array([1]),
                profileBytes: new Uint8Array([2]),
                inType: 1,
                intent: 1
            },
            reqId: 2
        });

        expect(postedMessagesConvertQcms[1]).toEqual({
            message: 'convertError',
            error: 'transformer failed',
            reqId: 2
        });
    });

    it('should cover highlighted createTransformer lines including handle===0 and catch branch', () => {
        const postedMessagesCreateTransformer: Array<{
            message: string;
            id?: number;
            handle?: number;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesCreateTransformer.push(message as {
                message: string;
                id?: number;
                handle?: number;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let callCount: number = 0;

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: (profile: Uint8Array, inType: number, intent: number) => number;
        }): void => {
            module.qcms_transformer_from_memory = (): number => {
                callCount++;
                if (callCount === 1) {
                    return 456;
                }
                if (callCount === 2) {
                    return 0;
                }
                throw new Error('create failed');
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 10
        });

        // success path
        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: [1, 2, 3],
                inType: 1,
                intent: 2
            },
            reqId: 11
        });

        // handle === 0 path
        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: [4, 5, 6],
                inType: 3,
                intent: 4
            },
            reqId: 12
        });

        // catch path
        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: [7, 8, 9],
                inType: 5,
                intent: 6
            },
            reqId: 13
        });

        expect(postedMessagesCreateTransformer[1]).toEqual({
            message: 'transformerCreated',
            id: 1,
            handle: 456,
            reqId: 11
        });

        expect(postedMessagesCreateTransformer[2]).toEqual({
            message: 'createTransformerError',
            error: 'Failed to create transformer',
            reqId: 12
        });

        expect(postedMessagesCreateTransformer[3]).toEqual({
            message: 'createTransformerError',
            error: 'create failed',
            reqId: 13
        });
    });

    it('should cover highlighted convertWith lines including _mustAddAlpha true, false and catch branch', () => {
        const postedMessagesConvertWith: Array<{
            message: string;
            id?: number;
            data?: Uint8Array;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesConvertWith.push(message as {
                message: string;
                id?: number;
                data?: Uint8Array;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let throwInConvertWith: boolean = false;

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            memory?: { buffer: ArrayBuffer };
            qcms_convert_array?: (id: number, src: Uint8Array) => void;
            copy_result?: (ptr: number, len: number) => void;
        }): void => {
            module.memory = {
                buffer: new Uint8Array([10, 20, 30, 40, 50, 60]).buffer
            };

            module.qcms_convert_array = (): void => {
                if (throwInConvertWith) {
                    throw new Error('convertWith failed');
                }
                if (module.copy_result) {
                    module.copy_result(0, 3);
                }
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 20
        });

        // alpha=true and same buffer => _mustAddAlpha = true
        const shared: Uint8Array = new Uint8Array(4);
        _invokeMessage({
            message: 'convertWith',
            payload: {
                id: 5,
                src: shared,
                dest: new Uint8Array(shared.buffer),
                destOffset: 0,
                alpha: true
            },
            reqId: 21
        });

        // alpha=false => _mustAddAlpha = false
        const src2: Uint8Array = new Uint8Array([1, 2, 3]);
        const dest2: Uint8Array = new Uint8Array(4);
        dest2[3] = 99;

        _invokeMessage({
            message: 'convertWith',
            payload: {
                id: 6,
                src: src2,
                dest: dest2,
                destOffset: 0,
                alpha: false
            },
            reqId: 22
        });

        // catch branch
        throwInConvertWith = true;

        _invokeMessage({
            message: 'convertWith',
            payload: {
                id: 7,
                src: new Uint8Array([1, 2, 3]),
                dest: new Uint8Array(4),
                destOffset: 0,
                alpha: false
            },
            reqId: 23
        });

        expect(postedMessagesConvertWith[1].message).toBe('convertWithResult');
        expect(postedMessagesConvertWith[1].id).toBe(5);
        expect((postedMessagesConvertWith[1].data as Uint8Array)[0]).toBe(10);
        expect((postedMessagesConvertWith[1].data as Uint8Array)[1]).toBe(20);
        expect((postedMessagesConvertWith[1].data as Uint8Array)[2]).toBe(30);
        expect((postedMessagesConvertWith[1].data as Uint8Array)[3]).toBe(255);

        expect(postedMessagesConvertWith[2].message).toBe('convertWithResult');
        expect(postedMessagesConvertWith[2].id).toBe(6);
        expect((postedMessagesConvertWith[2].data as Uint8Array)[0]).toBe(10);
        expect((postedMessagesConvertWith[2].data as Uint8Array)[1]).toBe(20);
        expect((postedMessagesConvertWith[2].data as Uint8Array)[2]).toBe(30);
        expect((postedMessagesConvertWith[2].data as Uint8Array)[3]).toBe(99);

        expect(postedMessagesConvertWith[3]).toEqual({
            message: 'convertWithError',
            error: 'convertWith failed',
            reqId: 23
        });
    });

    it('should cover highlighted convertOne catch branch and helper lines', () => {
        const postedMessagesConvertOne: Array<{
            message: string;
            id?: number;
            data?: unknown;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesConvertOne.push(message as {
                message: string;
                id?: number;
                data?: unknown;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let throwOnConvertOne: boolean = false;

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            memory?: { buffer: ArrayBuffer };
            qcms_convert_one?: (id: number, value: number, css: boolean) => void;
            copy_rgb?: (ptr: number) => void;
            make_cssRGB?: (r: number, g: number, b: number) => void;
        }): void => {
            module.memory = { buffer: new Uint8Array([7, 8, 9]).buffer };

            module.qcms_convert_one = (_id: number, _value: number, css: boolean): void => {
                if (throwOnConvertOne) {
                    throw new Error('convertOne failed');
                }

                if (css) {
                    if (module.make_cssRGB) {
                        module.make_cssRGB(1, 2, 3);
                    }
                } else {
                    if (module.copy_rgb) {
                        module.copy_rgb(0);
                    }
                }
            };


            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 30
        });

        const destA: Uint8Array = new Uint8Array(3);
        _invokeMessage({
            message: 'convertOne',
            payload: {
                id: 1,
                dest: destA,
                destOffset: 0,
                value: 10,
                css: false
            },
            reqId: 31
        });

        const destB: Uint8Array = new Uint8Array(3);
        _invokeMessage({
            message: 'convertOne',
            payload: {
                id: 2,
                dest: destB,
                destOffset: 0,
                value: 20,
                css: true
            },
            reqId: 32
        });

        throwOnConvertOne = true;

        _invokeMessage({
            message: 'convertOne',
            payload: {
                id: 3,
                dest: new Uint8Array(3),
                destOffset: 0,
                value: 30,
                css: false
            },
            reqId: 33
        });

        expect(destA[0]).toBe(7);
        expect(destA[1]).toBe(8);
        expect(destA[2]).toBe(9);

        expect(postedMessagesConvertOne[1]).toEqual({
            message: 'convertOneResult',
            id: 1,
            data: null,
            reqId: 31
        });

        expect(postedMessagesConvertOne[2]).toEqual({
            message: 'convertOneResult',
            id: 2,
            data: null,
            reqId: 32
        });

        expect(postedMessagesConvertOne[3]).toEqual({
            message: 'convertOneError',
            error: 'convertOne failed',
            reqId: 33
        });
    });

    it('should cover highlighted convertThree and convertFour catch branches', () => {
        const postedMessagesConvert34: Array<{
            message: string;
            id?: number;
            data?: unknown;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesConvert34.push(message as {
                message: string;
                id?: number;
                data?: unknown;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let throwThree: boolean = false;
        let throwFour: boolean = false;

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_convert_three?: () => void;
            qcms_convert_four?: () => void;
        }): void => {
            module.qcms_convert_three = (): void => {
                if (throwThree) {
                    throw new Error('convertThree failed');
                }
            };

            module.qcms_convert_four = (): void => {
                if (throwFour) {
                    throw new Error('convertFour failed');
                }
            };

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 40
        });

        _invokeMessage({
            message: 'convertThree',
            payload: {
                id: 1,
                dest: new Uint8Array(3),
                destOffset: 0,
                r: 1,
                g: 2,
                b: 3,
                css: true
            },
            reqId: 41
        });

        _invokeMessage({
            message: 'convertFour',
            payload: {
                id: 2,
                dest: new Uint8Array(4),
                destOffset: 0,
                c: 1,
                m: 2,
                y: 3,
                k: 4,
                css: false
            },
            reqId: 42
        });

        throwThree = true;
        throwFour = true;

        _invokeMessage({
            message: 'convertThree',
            payload: {
                id: 3,
                dest: new Uint8Array(3),
                destOffset: 0,
                r: 4,
                g: 5,
                b: 6,
                css: false
            },
            reqId: 43
        });

        _invokeMessage({
            message: 'convertFour',
            payload: {
                id: 4,
                dest: new Uint8Array(4),
                destOffset: 0,
                c: 4,
                m: 3,
                y: 2,
                k: 1,
                css: true
            },
            reqId: 44
        });

        expect(postedMessagesConvert34[1]).toEqual({
            message: 'convertThreeResult',
            id: 1,
            data: null,
            reqId: 41
        });

        expect(postedMessagesConvert34[2]).toEqual({
            message: 'convertFourResult',
            id: 2,
            data: null,
            reqId: 42
        });

        expect(postedMessagesConvert34[3]).toEqual({
            message: 'convertThreeError',
            error: 'convertThree failed',
            reqId: 43
        });

        expect(postedMessagesConvert34[4]).toEqual({
            message: 'convertFourError',
            error: 'convertFour failed',
            reqId: 44
        });
    });

    it('should cover highlighted dropTransformer nested drop failure and outer ensureLoaded error', () => {
        const postedMessagesDrop: Array<{
            message: string;
            id?: number;
            handle?: number;
            error?: string;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesDrop.push(message as {
                message: string;
                id?: number;
                handle?: number;
                error?: string;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        const dropSpy: jasmine.Spy = jasmine.createSpy('qcms_drop_transformer').and.throwError('drop failed');
        const createSpy: jasmine.Spy = jasmine.createSpy('qcms_transformer_from_memory').and.returnValue(456);

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: jasmine.Spy;
            qcms_drop_transformer?: jasmine.Spy;
        }): void => {
            module.qcms_transformer_from_memory = createSpy;
            module.qcms_drop_transformer = dropSpy;

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 50
        });

        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: new Uint8Array([1]),
                inType: 1,
                intent: 1
            },
            reqId: 51
        });

        _invokeMessage({
            message: 'dropTransformer',
            payload: {
                id: 1
            },
            reqId: 52
        });

        expect(postedMessagesDrop[1]).toEqual({
            message: 'transformerCreated',
            id: 1,
            handle: 456,
            reqId: 51
        });

        expect(postedMessagesDrop[2]).toEqual({
            message: 'transformerDroppedError',
            id: 1,
            reqId: 52
        });

        expect(postedMessagesDrop[3]).toEqual({
            message: 'transformerDropped',
            id: 1,
            reqId: 52
        });

        const postedMessagesDropNotLoaded: Array<{
            message: string;
            error?: string;
            reqId?: number;
        }> = [];

        (_workerSelf.postMessage as jasmine.Spy).and.callFake((message: unknown): void => {
            postedMessagesDropNotLoaded.push(message as {
                message: string;
                error?: string;
                reqId?: number;
            });
        });

        _workerSelf.qcmsModule = (): void => {
            return;
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'dropTransformer',
            payload: { id: 99 },
            reqId: 53
        });

        expect(postedMessagesDropNotLoaded[0]).toEqual({
            message: 'dropTransformerError',
            error: 'Module not loaded yet.',
            reqId: 53
        });
    });

    it('should cover highlighted unloadQcms nested drop failure and outer unloadedError catch', () => {
        const postedMessagesUnload: Array<{
            message: string;
            id?: number;
            handle?: number;
            reqId?: number;
        }> = [];

        spyOn(_workerSelf, 'postMessage').and.callFake((message: unknown): void => {
            postedMessagesUnload.push(message as {
                message: string;
                id?: number;
                handle?: number;
                reqId?: number;
            });
        });

        _setImportScripts(jasmine.createSpy('importScripts'));

        const createSpy: jasmine.Spy = jasmine.createSpy('qcms_transformer_from_memory').and.returnValue(999);
        const dropSpy: jasmine.Spy = jasmine.createSpy('qcms_drop_transformer').and.throwError('drop fail');

        _workerSelf.qcmsModule = (module: {
            onRuntimeInitialized?: () => void;
            qcms_transformer_from_memory?: jasmine.Spy;
            qcms_drop_transformer?: jasmine.Spy;
        }): void => {
            module.qcms_transformer_from_memory = createSpy;
            module.qcms_drop_transformer = dropSpy;

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfQcmsRunner();

        _invokeMessage({
            message: 'initialLoading',
            url: 'http://localhost/assets',
            reqId: 60
        });

        _invokeMessage({
            message: 'createTransformer',
            payload: {
                profileBytes: new Uint8Array([1]),
                inType: 1,
                intent: 1
            },
            reqId: 61
        });

        _invokeMessage({
            message: 'unloadQcms',
            reqId: 62
        });

        expect(postedMessagesUnload[1]).toEqual({
            message: 'transformerCreated',
            id: 1,
            handle: 999,
            reqId: 61
        });

        expect(postedMessagesUnload[2]).toEqual({
            message: 'unloadedQcmsError',
            reqId: 62
        });

        expect(postedMessagesUnload[3]).toEqual({
            message: 'unloaded',
            reqId: 62
        });

        const forEachSpy: jasmine.Spy = spyOn(Map.prototype, 'forEach').and.callFake((): void => {
            throw new Error('map foreach failed');
        });

        _invokeMessage({
            message: 'unloadQcms',
            reqId: 63
        });

        expect(forEachSpy).toHaveBeenCalled();

        expect(postedMessagesUnload[4]).toEqual({
            message: 'unloadedError',
            reqId: 63
        });

        expect(postedMessagesUnload[5]).toEqual({
            message: 'unloaded',
            reqId: 63
        });
    });
});

