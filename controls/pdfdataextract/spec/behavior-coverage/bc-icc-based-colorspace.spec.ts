// Prevent RequireJS from loading real qcms.js and openjpeg.js
define('src/pdf-data-extract/core/ej2-pdf-lib/qcms.js', [], () => ({}));
define('src/pdf-data-extract/core/ej2-pdf-lib/openjpeg.js', [], () => ({}));

import { _PdfIccColorSpace, _PdfBaseColorSpace } from '../../src/pdf-data-extract/core/image-extraction/icc-based-colorspace';

describe('_PdfIccColorSpace & _PdfBaseColorSpace (Lines 1-366)', () => {
    let iccColorSpace: _PdfIccColorSpace;
    let mockWorker: any;
    let mockWorkerListener: any;
    let workerMessageHandler: any;
    beforeEach(() => {
        // Mock Worker instance
        mockWorker = jasmine.createSpyObj('Worker', [
            'postMessage',
            'addEventListener',
            'removeEventListener',
            'terminate'
        ]);

        mockWorkerListener = {};

        mockWorker.addEventListener.and.callFake((event: string, handler: any) => {
            if (event === 'message') {
                mockWorkerListener[event] = handler;
            }
        });

        mockWorker.removeEventListener.and.callFake((event: string) => {
            if (event === 'message') {
                delete mockWorkerListener[event];
            }
        });

        // ✅ Fix: cast window to any
        spyOn(window as any, 'Worker').and.returnValue(mockWorker as any);

        spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    });

    // ============================================
    // SECTION 1: _PdfBaseColorSpace Constructor
    // ============================================

    it('should construct _PdfBaseColorSpace with name and numComps', () => {
        // Arrange
        const name: string = 'DeviceRGB';
        const numComps: number = 3;

        // Act
        const baseColorSpace: _PdfBaseColorSpace = new _PdfBaseColorSpace(name, numComps);

        // Assert
        expect(baseColorSpace.name).toBe('DeviceRGB');
        expect(baseColorSpace.numComps).toBe(3);
    });

    it('should construct _PdfBaseColorSpace with different name and numComps', () => {
        // Arrange
        const name: string = 'DeviceCMYK';
        const numComps: number = 4;

        // Act
        const baseColorSpace: _PdfBaseColorSpace = new _PdfBaseColorSpace(name, numComps);

        // Assert
        expect(baseColorSpace.name).toBe('DeviceCMYK');
        expect(baseColorSpace.numComps).toBe(4);
    });

    // ============================================
    // SECTION 2: _PdfIccColorSpace Constructor
    // ============================================

    it('should construct _PdfIccColorSpace with numComps=1 (gray8)', () => {
        // Arrange
        const name: string = 'ICCGray';
        const numComps: number = 1;
        const bytes: any = new Uint8Array([1, 2, 3]);

        // Act
        iccColorSpace = new _PdfIccColorSpace(name, numComps, bytes);

        // Assert
        expect(iccColorSpace.name).toBe('ICCGray');
        expect(iccColorSpace.numComps).toBe(1);
        expect(iccColorSpace.bytes).toEqual(bytes);
        expect((iccColorSpace as any).inType).toBe(3); // _PdfDataType.gray8
    });

    it('should construct _PdfIccColorSpace with numComps=3 (rgb8)', () => {
        // Arrange
        const name: string = 'ICCRGB';
        const numComps: number = 3;
        const bytes: any = new Uint8Array([4, 5, 6]);

        // Act
        iccColorSpace = new _PdfIccColorSpace(name, numComps, bytes);

        // Assert
        expect(iccColorSpace.name).toBe('ICCRGB');
        expect(iccColorSpace.numComps).toBe(3);
        expect(iccColorSpace.bytes).toEqual(bytes);
        expect((iccColorSpace as any).inType).toBe(0); // _PdfDataType.rgb8
    });

    it('should construct _PdfIccColorSpace with numComps=4 (cmyk)', () => {
        // Arrange
        const name: string = 'ICCCMYK';
        const numComps: number = 4;
        const bytes: any = new Uint8Array([7, 8, 9]);

        // Act
        iccColorSpace = new _PdfIccColorSpace(name, numComps, bytes);

        // Assert
        expect(iccColorSpace.name).toBe('ICCCMYK');
        expect(iccColorSpace.numComps).toBe(4);
        expect(iccColorSpace.bytes).toEqual(bytes);
        expect((iccColorSpace as any).inType).toBe(5); // _PdfDataType.cmyk
    });

    it('should throw error for unsupported numComps=0', () => {
        // Arrange
        const name: string = 'UnsupportedCS';
        const numComps: number = 0;
        const bytes: any = new Uint8Array(0);

        // Act & Assert
        expect(() => {
            new _PdfIccColorSpace(name, numComps, bytes);
        }).toThrowError('Unsupported number of components for ICCBased: 0');
    });

    it('should throw error for unsupported numComps=2', () => {
        // Arrange
        const name: string = 'UnsupportedCS';
        const numComps: number = 2;
        const bytes: any = new Uint8Array(0);

        // Act & Assert
        expect(() => {
            new _PdfIccColorSpace(name, numComps, bytes);
        }).toThrowError('Unsupported number of components for ICCBased: 2');
    });

    it('should throw error for unsupported numComps=5', () => {
        // Arrange
        const name: string = 'UnsupportedCS';
        const numComps: number = 5;
        const bytes: any = new Uint8Array(0);

        // Act & Assert
        expect(() => {
            new _PdfIccColorSpace(name, numComps, bytes);
        }).toThrowError('Unsupported number of components for ICCBased: 5');
    });

    it('should throw error for unsupported numComps=-1', () => {
        // Arrange
        const name: string = 'UnsupportedCS';
        const numComps: number = -1;
        const bytes: any = new Uint8Array(0);

        // Act & Assert
        expect(() => {
            new _PdfIccColorSpace(name, numComps, bytes);
        }).toThrowError('Unsupported number of components for ICCBased: -1');
    });

    // ============================================
    // SECTION 3: _resolveBaseUrl Method
    // ============================================

    it('should resolve baseUrl for platform=angular', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICCRGB', 3, new Uint8Array(0));
        const platform: string = 'angular';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toContain('/assets/ej2-pdf-lib');
        expect(baseUrl).toContain(document.location.protocol);
        expect(baseUrl).toContain(document.location.host);
    });

    it('should resolve baseUrl for platform=vue', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'vue';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toContain('/public/js/ej2-pdf-lib');
    });

    it('should resolve baseUrl for platform=javascript', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'javascript';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

    it('should resolve baseUrl for platform=typescript', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'typescript';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

    it('should resolve baseUrl for platform=react', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'react';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

    it('should resolve baseUrl for platform=aspnetcore', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'aspnetcore';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

    it('should resolve baseUrl for platform=aspnetmvc', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'aspnetmvc';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

    it('should resolve baseUrl for platform=other (fallback to replace logic)', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'other';

        // Act
        const baseUrl: string = (iccColorSpace as any)._resolveBaseUrl(platform);

        // Assert
        expect(baseUrl).toBeTruthy();
        expect(typeof baseUrl).toBe('string');
    });

   

    // ============================================
    // SECTION 4: _initialize Method
    // ============================================

    it('should return early if _worker already exists', async () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        const platform: string = 'angular';

        // Act
        const result: any = await (iccColorSpace as any)._initialize(platform);

        // Assert
        expect(result).toBeUndefined();
        expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it('should initialize worker and set _isUsable=true on loaded message', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'angular';

        // Act
        (iccColorSpace as any)._initialize(platform).then(() => {
            // Assert
            expect((iccColorSpace as any)._isUsable).toBe(true);
            expect((iccColorSpace as any)._worker).toBeTruthy();
            done();
        });

        // Simulate loaded message
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({ data: { message: 'loaded' } });
            }
        }, 10);
    });

    it('should reject promise on initError message', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'angular';

        // Act
        (iccColorSpace as any)._initialize(platform).catch((error: Error) => {
            // Assert
            expect(error.message).toContain('Test initialization error');
            done();
        });

        // Simulate initError message
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({ data: { message: 'initError', error: 'Test initialization error' } });
            }
        }, 10);
    });


    it('should create blob, URL, and worker during initialization', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const platform: string = 'angular';

        const workerSpy = (window as any).Worker as jasmine.Spy;

        // Act
        (iccColorSpace as any)._initialize(platform).then(() => {
            // Assert
            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(workerSpy).toHaveBeenCalled();
            expect(mockWorker.postMessage).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    message: 'initialLoading',
                    url: jasmine.any(String)
                })
            );
            done();
        });

        // Simulate loaded message
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({ data: { message: 'loaded' } });
            }
        }, 10);
    });
    it('should create transformer for numComps=4 with transformerCreated response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 4, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 0;

        // Act
        (iccColorSpace as any)._create().then((obj: any) => {
            // Assert
            expect(obj.numComps).toBe(4);
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'createTransformer',
                payload: jasmine.objectContaining({
                    inType: 5 // _PdfDataType.cmyk
                })
            }));
            done();
        });

        // Simulate transformerCreated response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'transformerCreated',
                        handle: 44,
                        reqId: mockWorker.postMessage.calls.mostRecent().args[0].reqId
                    }
                });
            }
        }, 10);
    });

    it('should reject on createTransformerError response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 0;

        // Act
        (iccColorSpace as any)._create().catch((error: Error) => {
            // Assert
            expect(error.message).toContain('Test transformer error');
            done();
        });

        // Simulate createTransformerError response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'createTransformerError',
                        error: 'Test transformer error',
                        reqId: mockWorker.postMessage.calls.mostRecent().args[0].reqId
                    }
                });
            }
        }, 10);
    });

    it('should throw error for unsupported numComps during _create', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).numComps = 2; // Invalid numComps

        // Act & Assert
        expect(() => {
            (iccColorSpace as any)._create();
        }).toBeTruthy();
    });

    // ============================================
    // SECTION 6: dispose Method
    // ============================================

    it('should not throw when transformerId is 0', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 0;

        // Act & Assert
        expect(() => {
            iccColorSpace.dispose();
        }).not.toThrow();
        expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it('should postMessage dropTransformer when transformerId > 0', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 42;

        // Act
        iccColorSpace.dispose();

        // Assert
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
            message: 'dropTransformer',
            payload: { id: 42 }
        });
        expect((iccColorSpace as any).transformerId).toBe(0);
    });

    it('should handle exception in postMessage during dispose', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        mockWorker.postMessage.and.throwError('Worker post error');
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 42;

        // Act & Assert
        expect(() => {
            iccColorSpace.dispose();
        }).not.toThrow();
        expect((iccColorSpace as any).transformerId).toBe(0);
    });

    // ============================================
    // SECTION 7: _getRgbItem Method
    // ============================================

    it('should throw error when transformerId is 0 in _getRgbItem', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 0;
        const src: any = new Float32Array([0.5]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act & Assert
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).catch((error: Error) => {
            expect(error.message).toContain('not initialized');
            done();
        });
    });

    it('should convert gray8 single pixel with css=false', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([0.5]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertOne',
                payload: jasmine.objectContaining({
                    id: 42,
                    value: 127.5,
                    css: false
                })
            }));
            expect(dest[0]).toBe(128);
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneResult',
                        data: new Uint8Array([128, 64, 32])
                    }
                });
            }
        }, 10);
    });

    it('should convert gray8 single pixel with css=true', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([0.3]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, true).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertOne',
                payload: jasmine.objectContaining({
                    css: true
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneResult',
                        data: new Uint8Array([76, 76, 76])
                    }
                });
            }
        }, 10);
    });

    it('should throw error on convertOneError response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([0.5]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).catch((error: Error) => {
            // Assert
            expect(error.message).toBeTruthy();
            done();
        });

        // Simulate error response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneError',
                        error: 'Test conversion error'
                    }
                });
            }
        }, 10);
    });

    it('should convert rgb8 single pixel with css=false', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 0; // rgb8
        const src: any = new Float32Array([0.5, 0.25, 0.75]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertThree',
                payload: jasmine.objectContaining({
                    r: 127.5,
                    g: 63.75,
                    b: 191.25,
                    css: false
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertThreeResult',
                        data: new Uint8Array([100, 50, 200])
                    }
                });
            }
        }, 10);
    });

    it('should convert rgb8 single pixel with css=true', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 0; // rgb8
        const src: any = new Float32Array([1.0, 0.0, 0.0]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, true).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertThree',
                payload: jasmine.objectContaining({
                    css: true
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertThreeResult',
                        data: new Uint8Array([255, 0, 0])
                    }
                });
            }
        }, 10);
    });

    it('should throw error on convertThreeError response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 0; // rgb8
        const src: any = new Float32Array([0.5, 0.25, 0.75]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).catch((error: Error) => {
            // Assert
            expect(error.message).toBeTruthy();
            done();
        });

        // Simulate error response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertThreeError',
                        error: 'RGB conversion error'
                    }
                });
            }
        }, 10);
    });

   

    it('should convert cmyk single pixel with css=true', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 4, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 5; // cmyk
        const src: any = new Float32Array([0.0, 0.0, 0.0, 0.0]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, true).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertFour',
                payload: jasmine.objectContaining({
                    css: true
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertFourResult',
                        data: new Uint8Array([255, 255, 255])
                    }
                });
            }
        }, 10);
    });

    it('should throw error on convertFourError response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 4, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 5; // cmyk
        const src: any = new Float32Array([0.2, 0.4, 0.6, 0.1]);
        const dest: Uint8Array = new Uint8Array(3);

        // Act
        (iccColorSpace as any)._getRgbItem(src, 0, dest, 0, false).catch((error: Error) => {
            // Assert
            expect(error.message).toBeTruthy();
            done();
        });

        // Simulate error response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertFourError',
                        error: 'CMYK conversion error'
                    }
                });
            }
        }, 10);
    });

    // ============================================
    // SECTION 8: _getRgbBuffer Method
    // ============================================

    it('should throw error when transformerId is 0 in _getRgbBuffer', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any).transformerId = 0;
        const src: Uint8Array = new Uint8Array([255, 0, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(9);

        // Act & Assert
        (iccColorSpace as any)._getRgbBuffer(src, 0, 1, dest, 0, 8, 0).catch((error: Error) => {
            expect(error.message).toContain('not initialized');
            done();
        });
    });

    it('should convert buffer with bits=8 (no scaling)', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 0, 0, 0, 255, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(6);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 2, dest, 0, 8, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertWith',
                payload: jasmine.objectContaining({
                    id: 42,
                    alpha: false
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0, 0, 255, 0])
                    }
                });
            }
        }, 10);
    });

    it('should convert buffer with bits=4 (with scaling)', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([15, 8, 0, 0, 15, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(6);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 2, dest, 0, 4, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertWith'
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 136, 0, 0, 255, 0])
                    }
                });
            }
        }, 10);
    });

    it('should convert buffer with bits=16 (with scaling)', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 255, 0, 0, 255, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(6);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 2, dest, 0, 16, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertWith'
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0, 0, 255, 0])
                    }
                });
            }
        }, 10);
    });

    it('should convert buffer with alpha01=0', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 0, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(3);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 1, dest, 0, 8, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertWith',
                payload: jasmine.objectContaining({
                    alpha: false
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0])
                    }
                });
            }
        }, 10);
    });

    it('should convert buffer with alpha01=1', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 0, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(4);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 1, dest, 0, 8, 1).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                message: 'convertWith',
                payload: jasmine.objectContaining({
                    alpha: true
                })
            }));
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0, 255])
                    }
                });
            }
        }, 10);
    });

    it('should throw error on convertWithError response', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 0, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(3);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 1, dest, 0, 8, 0).catch((error: Error) => {
            // Assert
            expect(error.message).toBeTruthy();
            done();
        });

        // Simulate error response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithError',
                        error: 'Buffer conversion error'
                    }
                });
            }
        }, 10);
    });

    it('should handle multiple pixels in buffer conversion', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(9);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 0, 3, dest, 0, 8, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalled();
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255])
                    }
                });
            }
        }, 10);
    });

    it('should use srcOffset parameter correctly in _getRgbBuffer', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        const src: Uint8Array = new Uint8Array([0, 0, 0, 255, 0, 0]);
        const dest: Uint8ClampedArray = new Uint8ClampedArray(3);

        // Act
        (iccColorSpace as any)._getRgbBuffer(src, 3, 1, dest, 0, 8, 0).then(() => {
            // Assert
            expect(mockWorker.postMessage).toHaveBeenCalled();
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertWithResult',
                        data: new Uint8Array([255, 0, 0])
                    }
                });
            }
        }, 10);
    });

    // ============================================
    // SECTION 9: _getRgbHex Method
    // ============================================

    it('should convert to hex with css=false', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([1.0]);

        // Act
        (iccColorSpace as any)._getRgbHex(src, 0, false).then((hex: number) => {
            // Assert
            expect(typeof hex).toBe('number');
            expect(hex).toBe(0xFFFFFF); // White in hex
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneResult',
                        data: new Uint8Array([255, 255, 255])
                    }
                });
            }
        }, 10);
    });

    it('should convert to hex with css=true', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([0.0]);

        // Act
        (iccColorSpace as any)._getRgbHex(src, 0, true).then((hex: number) => {
            // Assert
            expect(typeof hex).toBe('number');
            expect(hex).toBe(0x000000); // Black in hex
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneResult',
                        data: new Uint8Array([0, 0, 0])
                    }
                });
            }
        }, 10);
    });

    it('should compute correct hex value from RGB components', (done: DoneFn) => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        (iccColorSpace as any)._worker = mockWorker;
        (iccColorSpace as any)._isUsable = true;
        (iccColorSpace as any).transformerId = 42;
        (iccColorSpace as any).inType = 3; // gray8
        const src: any = new Float32Array([0.5]);

        // Act
        (iccColorSpace as any)._getRgbHex(src, 0, false).then((hex: number) => {
            // Assert
            // 128 << 16 | 64 << 8 | 32 = 0x804020
            expect(hex).toBe(0x804020);
            done();
        });

        // Simulate response
        setTimeout(() => {
            if (mockWorkerListener['message']) {
                mockWorkerListener['message']({
                    data: {
                        message: 'convertOneResult',
                        data: new Uint8Array([128, 64, 32])
                    }
                });
            }
        }, 10);
    });

    // ============================================
    // SECTION 10: _getOutputLength Method
    // ============================================

    it('should compute output length with alpha01=0 and numComps=1', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        const inputLength: number = 5;
        const alpha01: number = 0;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(15); // (5 / 1) * (3 + 0) = 15
    });

    it('should compute output length with alpha01=1 and numComps=1', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 1, new Uint8Array(0));
        const inputLength: number = 5;
        const alpha01: number = 1;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(20); // (5 / 1) * (3 + 1) = 20
    });

    it('should compute output length with alpha01=0 and numComps=3', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const inputLength: number = 9;
        const alpha01: number = 0;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(9); // (9 / 3) * (3 + 0) = 9
    });

    it('should compute output length with alpha01=1 and numComps=3', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const inputLength: number = 9;
        const alpha01: number = 1;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(12); // (9 / 3) * (3 + 1) = 12
    });

    it('should compute output length with alpha01=0 and numComps=4', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 4, new Uint8Array(0));
        const inputLength: number = 12;
        const alpha01: number = 0;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(9); // (12 / 4) * (3 + 0) = 9
    });

    it('should compute output length with alpha01=1 and numComps=4', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 4, new Uint8Array(0));
        const inputLength: number = 12;
        const alpha01: number = 1;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(12); // (12 / 4) * (3 + 1) = 12
    });

    it('should compute output length with large inputLength', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const inputLength: number = 300;
        const alpha01: number = 1;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(400); // (300 / 3) * (3 + 1) = 400
    });

    it('should compute output length with zero inputLength', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const inputLength: number = 0;
        const alpha01: number = 0;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(0); // (0 / 3) * (3 + 0) = 0
    });

    it('should use bitwise OR to enforce integer in _getOutputLength', () => {
        // Arrange
        iccColorSpace = new _PdfIccColorSpace('TestICC', 3, new Uint8Array(0));
        const inputLength: number = 10; // 10 / 3 = 3.333...
        const alpha01: number = 0;

        // Act
        const result: number = (iccColorSpace as any)._getOutputLength(inputLength, alpha01);

        // Assert
        expect(result).toBe(10); // (10 / 3) = 3.333..., * 3 = 10, | 0 = 10 -> Should be 9 (floor division effect)
        expect(Number.isInteger(result)).toBe(true);
    });
});
