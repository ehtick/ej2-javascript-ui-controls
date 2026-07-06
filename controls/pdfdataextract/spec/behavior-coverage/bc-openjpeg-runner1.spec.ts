
import { _PdfOpenJpegRunner } from '../../src/pdf-data-extract/core/import/openjpeg-runner';

describe('_PdfOpenJpegRunner', () => {
    let originalImportScripts: unknown;
    let originalOpenJpegModuleFactory: unknown;
    let originalOnMessage: unknown;
    let hadImportScripts: boolean;

    function _setImportScripts(value: unknown): void {
        Object.defineProperty(self, 'importScripts', {
            configurable: true,
            writable: true,
            value
        });
    }

    beforeEach(() => {
        hadImportScripts = Object.prototype.hasOwnProperty.call(self, 'importScripts');
        originalImportScripts = (self as unknown as { importScripts?: unknown }).importScripts;
        originalOpenJpegModuleFactory = (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule;
        originalOnMessage = (self as unknown as { onmessage?: unknown }).onmessage;
    });

    afterEach(() => {
        if (hadImportScripts) {
            _setImportScripts(originalImportScripts);
        } else {
            delete (self as unknown as { importScripts?: unknown }).importScripts;
        }

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = originalOpenJpegModuleFactory;
        (self as unknown as { onmessage?: unknown }).onmessage = originalOnMessage;
    });

    it('should cover no-data return, no-message return, initialLoading, runtime initialized, getModule and unloadOpenJpeg', () => {
        // Arrange
        const postedMessages: Array<{ message: string; id?: number; loaded?: boolean }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; id?: number; loaded?: boolean });
            });

        const importScriptsSpy: jasmine.Spy = jasmine.createSpy('importScripts');
        _setImportScripts(importScriptsSpy);

        let capturedModule: {
            url?: string;
            onRuntimeInitialized?: () => void;
        } | null = null;

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = (module: {
            url?: string;
            onRuntimeInitialized?: () => void;
        }): void => {
            capturedModule = module;
            if (capturedModule.onRuntimeInitialized) {
                capturedModule.onRuntimeInitialized();
            }
        };

        _PdfOpenJpegRunner();

        // Act 1: !data
        ((self as unknown as { onmessage: (event: { data?: unknown }) => void }).onmessage)({ data: null });

        // Act 2: !data.message
        ((self as unknown as { onmessage: (event: { data?: unknown }) => void }).onmessage)({ data: {} });

        // Act 3: initialLoading
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: string } }) => void;
        }).onmessage)({
            data: {
                message: 'initialLoading',
                url: 'http://localhost/sample///'
            }
        });

        // Act 4: getModule
        ((self as unknown as {
            onmessage: (event: { data: { message: string; id: number } }) => void;
        }).onmessage)({
            data: {
                message: 'getModule',
                id: 101
            }
        });

        // Act 5: unloadOpenJpeg
        ((self as unknown as {
            onmessage: (event: { data: { message: string } }) => void;
        }).onmessage)({
            data: {
                message: 'unloadOpenJpeg'
            }
        });

        // Assert
        expect(importScriptsSpy).toHaveBeenCalledWith('http://localhost/sample/openjpeg.js');
        expect(capturedModule).not.toBeNull();
        expect((capturedModule as { url?: string }).url).toBe('http://localhost/sample');

        expect(postedMessages[0]).toEqual({ message: 'loaded' });
        expect(postedMessages[1]).toEqual({ message: 'moduleInfo', id: 101, loaded: true });
        expect(postedMessages[2]).toEqual({ message: 'unloaded' });
    });

    it('should cover decodeJPX when module is not loaded yet', () => {
        // Arrange
        const postedMessages: Array<{ message: string; error?: string }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = (): void => {
            return;
        };

        _PdfOpenJpegRunner();

        // Act
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: Uint8Array } }) => void;
        }).onmessage)({
            data: {
                message: 'decodeJPX',
                url: new Uint8Array([1, 2, 3])
            }
        });

        // Assert
        expect(postedMessages.length).toBe(1);
        expect(postedMessages[0]).toEqual({
            message: 'decodeError',
            error: 'Module not loaded yet.'
        });
    });

    it('should cover decodeJPX with Uint8Array input, writeArrayToMemory path and success true', () => {
        // Arrange
        const postedMessages: Array<{ message: unknown; success?: boolean }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: unknown; success?: boolean });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let capturedModule: {
            url?: string;
            onRuntimeInitialized?: () => void;
            _malloc?: (length: number) => number;
            writeArrayToMemory?: (u8: Uint8Array, ptr: number) => void;
            HEAPU8?: { set: (u8: Uint8Array, ptr: number) => void };
            _jp2_decode?: (ptr: number, length: number) => number;
            imageData?: Uint8Array;
        } | null = null;

        const writeArrayToMemorySpy: jasmine.Spy = jasmine.createSpy('writeArrayToMemory');
        const mallocSpy: jasmine.Spy = jasmine.createSpy('_malloc').and.returnValue(123);
        const decodeSpy: jasmine.Spy = jasmine.createSpy('_jp2_decode').and.returnValue(1);

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = (module: {
            url?: string;
            onRuntimeInitialized?: () => void;
            _malloc?: (length: number) => number;
            writeArrayToMemory?: (u8: Uint8Array, ptr: number) => void;
            HEAPU8?: { set: (u8: Uint8Array, ptr: number) => void };
            _jp2_decode?: (ptr: number, length: number) => number;
            imageData?: Uint8Array;
        }): void => {
            capturedModule = module;
            capturedModule._malloc = mallocSpy;
            capturedModule.writeArrayToMemory = writeArrayToMemorySpy;
            capturedModule._jp2_decode = decodeSpy;
            capturedModule.imageData = new Uint8Array([9, 8, 7]);

            if (capturedModule.onRuntimeInitialized) {
                capturedModule.onRuntimeInitialized();
            }
        };

        _PdfOpenJpegRunner();

        // Load module first
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: string } }) => void;
        }).onmessage)({
            data: {
                message: 'initialLoading',
                url: 'http://localhost/sample'
            }
        });

        const inputBytes: Uint8Array = new Uint8Array([10, 20, 30]);

        // Act
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: Uint8Array } }) => void;
        }).onmessage)({
            data: {
                message: 'decodeJPX',
                url: inputBytes
            }
        });

        // Assert
        expect(mallocSpy).toHaveBeenCalledWith(3);
        expect(writeArrayToMemorySpy).toHaveBeenCalledWith(inputBytes, 123);
        expect(decodeSpy).toHaveBeenCalledWith(123, 3);

        const decodeMessage: { message: unknown; success?: boolean } =
            postedMessages[postedMessages.length - 1];

        expect(decodeMessage.success).toBeTruthy();
        expect(decodeMessage.message).toEqual(new Uint8Array([9, 8, 7]));
    });

    it('should cover decodeJPX with non-Uint8Array input, HEAPU8.set path and success false', () => {
        // Arrange
        const postedMessages: Array<{ message: unknown; success?: boolean }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: unknown; success?: boolean });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        let capturedModule: {
            url?: string;
            onRuntimeInitialized?: () => void;
            _malloc?: (length: number) => number;
            writeArrayToMemory?: (u8: Uint8Array, ptr: number) => void;
            HEAPU8?: { set: jasmine.Spy };
            _jp2_decode?: (ptr: number, length: number) => number;
            imageData?: Uint8Array;
        } | null = null;

        const heapSetSpy: jasmine.Spy = jasmine.createSpy('HEAPU8.set');
        const mallocSpy: jasmine.Spy = jasmine.createSpy('_malloc').and.returnValue(321);
        const decodeSpy: jasmine.Spy = jasmine.createSpy('_jp2_decode').and.returnValue(0);

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = (module: {
            url?: string;
            onRuntimeInitialized?: () => void;
            _malloc?: (length: number) => number;
            writeArrayToMemory?: (u8: Uint8Array, ptr: number) => void;
            HEAPU8?: { set: jasmine.Spy };
            _jp2_decode?: (ptr: number, length: number) => number;
            imageData?: Uint8Array;
        }): void => {
            capturedModule = module;
            capturedModule._malloc = mallocSpy;
            capturedModule.HEAPU8 = { set: heapSetSpy };
            capturedModule._jp2_decode = decodeSpy;
            capturedModule.imageData = new Uint8Array([6, 5, 4]);

            if (capturedModule.onRuntimeInitialized) {
                capturedModule.onRuntimeInitialized();
            }
        };

        _PdfOpenJpegRunner();

        // Load module first
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: string } }) => void;
        }).onmessage)({
            data: {
                message: 'initialLoading',
                url: 'http://localhost/sample'
            }
        });

        const inputArray: number[] = [1, 2, 3, 4];

        // Act
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: number[] } }) => void;
        }).onmessage)({
            data: {
                message: 'decodeJPX',
                url: inputArray
            }
        });

        // Assert
        expect(mallocSpy).toHaveBeenCalledWith(4);
        expect(heapSetSpy).toHaveBeenCalled();
        expect(decodeSpy).toHaveBeenCalledWith(321, 4);

        const decodeMessage: { message: unknown; success?: boolean } =
            postedMessages[postedMessages.length - 1];

        expect(decodeMessage.success).toBeFalsy();
        expect(decodeMessage.message).toEqual(new Uint8Array([6, 5, 4]));
    });

    it('should cover decodeJPX catch branch and post decodeError with exception message', () => {
        // Arrange
        const postedMessages: Array<{ message: string; error?: string }> = [];

        spyOn(self as unknown as { postMessage: (message: unknown) => void }, 'postMessage')
            .and.callFake((message: unknown): void => {
                postedMessages.push(message as { message: string; error?: string });
            });

        _setImportScripts(jasmine.createSpy('importScripts'));

        (self as unknown as { OpenJpegModule?: unknown }).OpenJpegModule = (module: {
            url?: string;
            onRuntimeInitialized?: () => void;
            _malloc?: (length: number) => number;
            writeArrayToMemory?: (u8: Uint8Array, ptr: number) => void;
            HEAPU8?: { set: (u8: Uint8Array, ptr: number) => void };
            _jp2_decode?: (ptr: number, length: number) => number;
            imageData?: Uint8Array;
        }): void => {
            module._malloc = (): number => {
                throw new Error('malloc failed');
            };
            module.imageData = new Uint8Array([1]);

            if (module.onRuntimeInitialized) {
                module.onRuntimeInitialized();
            }
        };

        _PdfOpenJpegRunner();

        // Load module first
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: string } }) => void;
        }).onmessage)({
            data: {
                message: 'initialLoading',
                url: 'http://localhost/sample'
            }
        });

        // Act
        ((self as unknown as {
            onmessage: (event: { data: { message: string; url: Uint8Array } }) => void;
        }).onmessage)({
            data: {
                message: 'decodeJPX',
                url: new Uint8Array([1, 2])
            }
        });

        // Assert
        const lastMessage: { message: string; error?: string } =
            postedMessages[postedMessages.length - 1];

        expect(lastMessage.message).toBe('decodeError');
        expect(lastMessage.error).toBe('malloc failed');
    });
});
``
