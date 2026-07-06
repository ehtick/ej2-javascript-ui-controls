
import { _PdfImageProcessor } from '../../src/pdf-data-extract/core/import/decode-image';

interface _FakeWorkerInstance {
    url: string;
    messages: unknown[];
    onmessage: ((event: { data: unknown }) => void) | null;
    postMessage(message: unknown): void;
}

function _createFakeWorkerClass(config: {
    initialResponse?: { message: string; error?: string };
    decodeResponse?: { message: Uint8Array };
}): {
    WorkerClass: typeof Worker;
    instances: _FakeWorkerInstance[];
} {
    const instances: _FakeWorkerInstance[] = [];

    class FakeWorker {
        url: string;
        messages: unknown[] = [];
        onmessage: ((event: { data: unknown }) => void) | null = null;

        constructor(url: string) {
            this.url = url;
            instances.push(this as unknown as _FakeWorkerInstance);
        }

        postMessage(message: unknown): void {
            this.messages.push(message);

            const typedMessage: { message?: string } = message as { message?: string };

            if (typedMessage.message === 'initialLoading') {
                if (this.onmessage) {
                    this.onmessage({
                        data: config.initialResponse || { message: 'loaded' }
                    });
                }
            } else if (typedMessage.message === 'decodeJPX') {
                if (this.onmessage) {
                    this.onmessage({
                        data: config.decodeResponse || { message: new Uint8Array([9, 8, 7]) }
                    });
                }
            }
        }
    }

    return {
        WorkerClass: FakeWorker as unknown as typeof Worker,
        instances
    };
}

describe('_PdfImageProcessor', () => {
    let originalWorker: typeof Worker | undefined;

    beforeEach(() => {
        originalWorker = (window as unknown as { Worker: typeof Worker }).Worker;
    });

    afterEach(() => {
        (window as unknown as { Worker: typeof Worker }).Worker = originalWorker as typeof Worker;
        delete (window as unknown as { getRunningScript?: () => () => string }).getRunningScript;
    });

    it('should cover angular platform branch, initial loading, decodeJPX and bytes parameter path', async () => {
        // Arrange
        const fakeWorkerSetup: {
            WorkerClass: typeof Worker;
            instances: _FakeWorkerInstance[];
        } = _createFakeWorkerClass({
            initialResponse: { message: 'loaded' },
            decodeResponse: { message: new Uint8Array([1, 2, 3, 4]) }
        });

        (window as unknown as { Worker: typeof Worker }).Worker = fakeWorkerSetup.WorkerClass;

        const processor: _PdfImageProcessor = new _PdfImageProcessor();
        const inputBytes: Uint8Array = new Uint8Array([10, 20, 30]);
        const jpxStream: { bytes: Uint8Array } = {
            bytes: new Uint8Array([99, 98, 97])
        };

        const { protocol, host, pathname } = document.location;
        const trimmedPathname: string = pathname.replace(/\/+$/, '');
        const expectedBaseUrl: string = `${protocol}//${host}${trimmedPathname}/assets/ej2-pdf-lib`;

        // Act
        const result: Uint8Array = await processor._decodeImage(inputBytes, jpxStream, 'angular');

        // Assert
        expect(fakeWorkerSetup.instances.length).toBe(1);

        const worker: _FakeWorkerInstance = fakeWorkerSetup.instances[0];
        expect(typeof worker.url).toBe('string');
        expect(worker.messages.length).toBe(2);

        expect(worker.messages[0]).toEqual({
            message: 'initialLoading',
            url: expectedBaseUrl
        });

        expect(worker.messages[1]).toEqual({
            message: 'decodeJPX',
            url: inputBytes
        });

        expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('should cover vue platform branch and jpxStream.bytes fallback when bytes is undefined', async () => {
        // Arrange
        const fakeWorkerSetup: {
            WorkerClass: typeof Worker;
            instances: _FakeWorkerInstance[];
        } = _createFakeWorkerClass({
            initialResponse: { message: 'loaded' },
            decodeResponse: { message: new Uint8Array([5, 6, 7]) }
        });

        (window as unknown as { Worker: typeof Worker }).Worker = fakeWorkerSetup.WorkerClass;

        const processor: _PdfImageProcessor = new _PdfImageProcessor();
        const streamBytes: Uint8Array = new Uint8Array([42, 43, 44]);
        const jpxStream: { bytes: Uint8Array } = {
            bytes: streamBytes
        };

        const { protocol, host, pathname } = document.location;
        const trimmedPathname: string = pathname.replace(/\/+$/, '');
        const expectedBaseUrl: string = `${protocol}//${host}${trimmedPathname}/public/js/ej2-pdf-lib`;

        // Act
        const result: Uint8Array = await processor._decodeImage(
            undefined as unknown as Uint8Array,
            jpxStream,
            'vue'
        );

        // Assert
        expect(fakeWorkerSetup.instances.length).toBe(1);

        const worker: _FakeWorkerInstance = fakeWorkerSetup.instances[0];

        expect(worker.messages[0]).toEqual({
            message: 'initialLoading',
            url: expectedBaseUrl
        });

        expect(worker.messages[1]).toEqual({
            message: 'decodeJPX',
            url: streamBytes
        });

        expect(result).toEqual(new Uint8Array([5, 6, 7]));
    });

    it('should cover javascript or typescript or react or aspnetcore or aspnetmvc branch using /ej2-pdf-lib suffix', async () => {
        // Arrange
        const fakeWorkerSetup: {
            WorkerClass: typeof Worker;
            instances: _FakeWorkerInstance[];
        } = _createFakeWorkerClass({
            initialResponse: { message: 'loaded' },
            decodeResponse: { message: new Uint8Array([8, 8, 8]) }
        });

        (window as unknown as { Worker: typeof Worker }).Worker = fakeWorkerSetup.WorkerClass;

        const processor: _PdfImageProcessor = new _PdfImageProcessor();
        const inputBytes: Uint8Array = new Uint8Array([1, 1, 1]);

        // Act
        const result: Uint8Array = await processor._decodeImage(
            inputBytes,
            { bytes: new Uint8Array([2, 2, 2]) },
            'typescript'
        );

        // Assert
        expect(fakeWorkerSetup.instances.length).toBe(1);

        const worker: _FakeWorkerInstance = fakeWorkerSetup.instances[0];
        expect(worker.messages.length).toBe(2);

        const initialLoadingMessage: { message: string; url: string } =
            worker.messages[0] as { message: string; url: string };

        expect(initialLoadingMessage.message).toBe('initialLoading');
        expect(typeof initialLoadingMessage.url).toBe('string');
        expect(initialLoadingMessage.url.indexOf('/ej2-pdf-lib')).toBeGreaterThan(-1);

        expect(worker.messages[1]).toEqual({
            message: 'decodeJPX',
            url: inputBytes
        });

        expect(result).toEqual(new Uint8Array([8, 8, 8]));
    });

    it('should cover non-listed platform else branch with path.replace("import", "ej2-pdf-lib")', async () => {
        // Arrange
        const fakeWorkerSetup: {
            WorkerClass: typeof Worker;
            instances: _FakeWorkerInstance[];
        } = _createFakeWorkerClass({
            initialResponse: { message: 'loaded' },
            decodeResponse: { message: new Uint8Array([3, 2, 1]) }
        });

        (window as unknown as { Worker: typeof Worker }).Worker = fakeWorkerSetup.WorkerClass;

        const processor: _PdfImageProcessor = new _PdfImageProcessor();
        const inputBytes: Uint8Array = new Uint8Array([7, 7, 7]);

        // Act
        const result: Uint8Array = await processor._decodeImage(
            inputBytes,
            { bytes: new Uint8Array([4, 4, 4]) },
            'blazor-custom'
        );

        // Assert
        expect(fakeWorkerSetup.instances.length).toBe(1);

        const worker: _FakeWorkerInstance = fakeWorkerSetup.instances[0];
        expect(worker.messages.length).toBe(2);

        const initialLoadingMessage: { message: string; url: string } =
            worker.messages[0] as { message: string; url: string };

        expect(initialLoadingMessage.message).toBe('initialLoading');
        expect(typeof initialLoadingMessage.url).toBe('string');

        expect(worker.messages[1]).toEqual({
            message: 'decodeJPX',
            url: inputBytes
        });

        expect(result).toEqual(new Uint8Array([3, 2, 1]));
    });

    it('should cover decodeError branch and reject with worker error', async () => {
        // Arrange
        const fakeWorkerSetup: {
            WorkerClass: typeof Worker;
            instances: _FakeWorkerInstance[];
        } = _createFakeWorkerClass({
            initialResponse: { message: 'decodeError', error: 'OpenJPEG failed' }
        });

        (window as unknown as { Worker: typeof Worker }).Worker = fakeWorkerSetup.WorkerClass;

        const processor: _PdfImageProcessor = new _PdfImageProcessor();
        let thrownError: Error | null = null;

        // Act
        try {
            await processor._decodeImage(
                new Uint8Array([9, 9, 9]),
                { bytes: new Uint8Array([1, 2, 3]) },
                'angular'
            );
        } catch (error) {
            thrownError = error as Error;
        }

        // Assert
        expect(thrownError).not.toBeNull();
        expect((thrownError as Error).message).toBe('OpenJPEG failed');

        expect(fakeWorkerSetup.instances.length).toBe(1);
        expect(fakeWorkerSetup.instances[0].messages.length).toBe(1);
        expect(
            (fakeWorkerSetup.instances[0].messages[0] as { message: string }).message
        ).toBe('initialLoading');
    });
});
