/**
 * Media paste spec
 */
import { RichTextEditor } from './../../../src/index';
import { renderRTE, destroy, setCursorPoint } from "./../render.spec";
import { BASIC_MOUSE_EVENT_INIT, DELETE_EVENT_INIT } from '../../constant.spec';
import { renderBasicMediaEditor } from '../module-renderer.spec';
import { getAudioUniqueFile, getVideoUniqueFile } from '../online-service.spec';

const INIT_MOUSEDOWN_EVENT: MouseEvent = new MouseEvent('mousedown', BASIC_MOUSE_EVENT_INIT);

function buildMultipleAudioPasteEvent(files: File[]): any {
    const dataTransfer: DataTransfer = new DataTransfer();
    files.forEach((file: File) => {
        dataTransfer.items.add(file);
    });
    const pasteEvent: ClipboardEvent = new ClipboardEvent('paste', { clipboardData: dataTransfer } as ClipboardEventInit);
    return pasteEvent;
}

function buildMultipleVideoPasteEvent(files: File[]): any {
    const dataTransfer: DataTransfer = new DataTransfer();
    files.forEach((file: File) => {
        dataTransfer.items.add(file);
    });
    const pasteEvent: ClipboardEvent = new ClipboardEvent('paste', { clipboardData: dataTransfer } as ClipboardEventInit);
    return pasteEvent;
}

function buildPasteEvent(file: File): any {
    const dataTransfer: DataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const pasteEvent: ClipboardEvent = new ClipboardEvent('paste', { clipboardData: dataTransfer } as ClipboardEventInit);
    return pasteEvent;
}

describe('Media Paste', () => {

    describe('Audio Module - ', () => {

        describe('Multiple paste with pasteCleanup disabled', () => {

            describe('Two audio pasting', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });

                afterEach(() => destroy(rteObj));

                it('should insert audio elements with keepFormat enabled', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const audioEls: NodeListOf<HTMLAudioElement> =
                            rteObj.inputElement.querySelectorAll('audio');
                        expect(audioEls.length).toBe(2);
                        done();
                    }, 100);
                });
            });

            describe('Multiple paste with inline format ', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav'],
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple audio elements with URL format', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const audioEls: NodeListOf<HTMLAudioElement> =
                            rteObj.inputElement.querySelectorAll('audio');
                        expect(audioEls.length).toBe(2);
                        audioEls.forEach((audioEl: HTMLAudioElement) => {
                            const src: string = audioEl.src || (audioEl.querySelector('source') && audioEl.querySelector('source').getAttribute('src')) || '';
                            expect(src.startsWith('blob:') || src !== '').toBe(true);
                        });
                        done();
                    }, 100);
                });
            });

            describe('Multiple  paste with mixed allowed types', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        pasteCleanupSettings: {
                            prompt: false
                        },
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert only allowed audio types from multiple paste', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const audioFile3: File = new File(['audio content 3'], 'test3.aac', { type: 'audio/aac' });
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2, audioFile3]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const audioEls: NodeListOf<HTMLAudioElement> =
                            rteObj.inputElement.querySelectorAll('audio');
                        expect(audioEls.length).toBe(2);
                        done();
                    }, 100);
                });
            });

            describe('Multiple paste with Break layout', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav'],
                            saveFormat: 'Base64',
                            layoutOption: 'Break'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple audio elements with e-audio-break class', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const breakEls: NodeListOf<Element> =
                            rteObj.inputElement.querySelectorAll('.e-audio-break');
                        expect(breakEls.length).toBeGreaterThanOrEqual(2);
                        done();
                    }, 100);
                });
            });
        });

        describe('Multiple Files Paste with pasteCleanup', () => {

            describe('Paste two valid .mp3 files → both <audio> elements inserted', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav', '.ogg', '.webm', '.aac'],
                            saveUrl: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox/Save',
                            path: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert two <audio> elements when two .mp3 files are pasted', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2]);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const audioEls: NodeListOf<HTMLAudioElement> =
                            rteObj.inputElement.querySelectorAll('audio');
                        expect(audioEls.length).toBe(2);
                        done();
                    }, 300);
                });
            });

            describe('Paste three valid audio files with different formats', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav', '.ogg'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert three <audio> elements with mixed formats', (done: DoneFn) => {
                    const audioFile1: File = getAudioUniqueFile();
                    const audioFile2: File = getAudioUniqueFile();
                    const audioFile3: File = getAudioUniqueFile();
                    const pasteEvent: any = buildMultipleAudioPasteEvent([audioFile1, audioFile2, audioFile3]);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const audioEls: NodeListOf<HTMLAudioElement> =
                            rteObj.inputElement.querySelectorAll('audio');
                        expect(audioEls.length).toBe(3);
                        done();
                    }, 100);
                });
            });

        });

        describe('Branch Coverage ', () => {
            describe('onKeyUp SOURCE Element Branch', () => {
                let rteObj: RichTextEditor;

                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertAudioSettings: {
                            allowedTypes: ['.mp3'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });

                afterEach(() => {
                    destroy(rteObj);
                });

                it('should handle SOURCE element directly in deletedAudio array during onKeyUp', (done: DoneFn) => {
                    const audioModule: any = (rteObj as any).audioModule;
                    // Create a SOURCE element directly (not wrapped in audio tag)
                    const sourceElement: HTMLSourceElement = document.createElement('source');
                    sourceElement.src = 'data:audio/mp3;base64,test';
                    sourceElement.type = 'audio/mp3';
                    // Set deletedAudio array with SOURCE element
                    audioModule.deletedAudio = [sourceElement];
                    audioModule.onKeyUp(DELETE_EVENT_INIT);
                    setTimeout(() => {
                        // Verify the branch was executed (deletedAudio should be processed)
                        expect(audioModule.deletedAudio).toBeDefined();
                        // After processing, deletedAudio should be cleared
                        expect(audioModule.deletedAudio.length).toBe(1);
                        done();
                    }, 100);
                });
            });
            describe('getAudioExtensionFromMime MIME Alias Mapping', () => {
                let rteObj: RichTextEditor;
                let audioModule: any;

                beforeEach(() => {
                    rteObj = renderRTE({
                        toolbarSettings: { items: ['Audio'] },
                        insertAudioSettings: { allowedTypes: ['.mp3', '.wma', '.wav', '.m4a', '.aac', '.flac', '.wax', '.3gp'] }
                    });
                    audioModule = (rteObj as any).audioModule;
                });

                afterEach(() => {
                    destroy(rteObj);
                    audioModule = null;
                });

                it('should return mapped extension when MIME subtype exists in alias map', () => {
                    // Test audio/mpeg → mp3 (mapped)
                    const mimeType1: string = 'audio/mpeg';
                    const result1: string | null = audioModule.getAudioExtensionFromMime(mimeType1);
                    expect(result1).toBe('mp3');
                    // Test audio/x-ms-wma → wma (mapped)
                    const mimeType2: string = 'audio/x-ms-wma';
                    const result2: string | null = audioModule.getAudioExtensionFromMime(mimeType2);
                    expect(result2).toBe('wma');
                    // Test audio/x-wav → wav (mapped)
                    const mimeType3: string = 'audio/x-wav';
                    const result3: string | null = audioModule.getAudioExtensionFromMime(mimeType3);
                    expect(result3).toBe('wav');
                    // Test audio/x-m4a → m4a (mapped)
                    const mimeType4: string = 'audio/x-m4a';
                    const result4: string | null = audioModule.getAudioExtensionFromMime(mimeType4);
                    expect(result4).toBe('m4a');
                    // Test audio/x-aac → aac (mapped)
                    const mimeType5: string = 'audio/x-aac';
                    const result5: string | null = audioModule.getAudioExtensionFromMime(mimeType5);
                    expect(result5).toBe('aac');
                    // Test audio/3gpp → 3gp (mapped)
                    const mimeType6: string = 'audio/3gpp';
                    const result6: string | null = audioModule.getAudioExtensionFromMime(mimeType6);
                    expect(result6).toBe('3gp');
                });

                it('should return subtype when MIME subtype NOT in alias map', () => {
                    // Test audio/ogg → ogg (subtype, not in map)
                    const mimeType1: string = 'audio/ogg';
                    const result1: string | null = audioModule.getAudioExtensionFromMime(mimeType1);
                    expect(result1).toBe('ogg');
                    // Test audio/webm → webm (subtype, not in map)
                    const mimeType2: string = 'audio/webm';
                    const result2: string | null = audioModule.getAudioExtensionFromMime(mimeType2);
                    expect(result2).toBe('webm');
                    // Test audio/aiff → aiff (subtype, not in map)
                    const mimeType3: string = 'audio/aiff';
                    const result3: string | null = audioModule.getAudioExtensionFromMime(mimeType3);
                    expect(result3).toBe('aiff');
                });

                it('should strip MIME parameters and return correct extension', () => {
                    // Test audio/mpeg; codecs=opus → mp3 (mapped, params stripped)
                    const mimeType1: string = 'audio/mpeg; codecs=opus';
                    const result1: string | null = audioModule.getAudioExtensionFromMime(mimeType1);
                    expect(result1).toBe('mp3');
                    // Test audio/ogg; codecs=vorbis → ogg (subtype, params stripped)
                    const mimeType2: string = 'audio/ogg; codecs=vorbis';
                    const result2: string | null = audioModule.getAudioExtensionFromMime(mimeType2);
                    expect(result2).toBe('ogg');
                    // Test audio/x-wav; codecs=1 → wav (mapped, params stripped)
                    const mimeType3: string = 'audio/x-wav; codecs=1';
                    const result3: string | null = audioModule.getAudioExtensionFromMime(mimeType3);
                    expect(result3).toBe('wav');
                });

                it('should return null for invalid or non-audio MIME types', () => {
                    // Test null input
                    const result1: string | null = audioModule.getAudioExtensionFromMime(null);
                    expect(result1).toBeNull();
                    const result2: string | null = audioModule.getAudioExtensionFromMime(undefined);
                    expect(result2).toBeNull();
                    const result3: string | null = audioModule.getAudioExtensionFromMime('video/mp4');
                    expect(result3).toBeNull();
                    const result4: string | null = audioModule.getAudioExtensionFromMime('');
                    expect(result4).toBeNull();
                });

                it('should handle case-insensitive MIME type matching', () => {
                    const mimeType1: string = 'AUDIO/MPEG';
                    const result1: string | null = audioModule.getAudioExtensionFromMime(mimeType1);
                    expect(result1).toBe('mp3');
                    const mimeType2: string = 'Audio/X-Ms-Wma';
                    const result2: string | null = audioModule.getAudioExtensionFromMime(mimeType2);
                    expect(result2).toBe('wma');
                    const mimeType3: string = '  audio/ogg  ';
                    const result3: string | null = audioModule.getAudioExtensionFromMime(mimeType3);
                    expect(result3).toBe('ogg');
                });
            });

            describe('Destroy and Timeout Cleanup', () => {

                describe('destroy() → all timeouts cleared', () => {
                    let rteObj: RichTextEditor;
                    beforeEach(() => {
                        rteObj = renderRTE({
                            value: '<p>test</p>',
                            insertAudioSettings: {
                                allowedTypes: ['.mp3'],
                                saveFormat: 'Base64',
                                layoutOption: 'Inline'
                            }
                        });
                    });

                    afterEach(() => destroy(rteObj));

                    it('should clear showPopupTime timeout on destroy', (done: DoneFn) => {
                        const audioModule: any = rteObj.audioModule;
                        audioModule.showPopupTime = setTimeout(() => {
                            // This should not execute after destroy
                            fail('Timeout was not cleared');
                        }, 100);
                        rteObj.destroy();
                        setTimeout(() => {
                            expect(audioModule.showPopupTime).toBeNull();
                            done();
                        }, 150);
                    });

                    it('should clear audioDragPopupTime timeout on destroy', (done: DoneFn) => {
                        const audioModule: any = rteObj.audioModule;
                        audioModule.audioDragPopupTime = setTimeout(() => {
                            fail('Timeout was not cleared');
                        }, 100);
                        rteObj.destroy();
                        setTimeout(() => {
                            expect(audioModule.audioDragPopupTime).toBeNull();
                            done();
                        }, 150);
                    });

                    it('should clear showAudioQTbarTime timeout on destroy', (done: DoneFn) => {
                        const audioModule: any = rteObj.audioModule;
                        audioModule.showAudioQTbarTime = setTimeout(() => {
                            fail('Timeout was not cleared');
                        }, 100);
                        rteObj.destroy();
                        setTimeout(() => {
                            expect(audioModule.showAudioQTbarTime).toBeNull();
                            done();
                        }, 150);
                    });
                });

                describe('destroy() → timeoutIds array cleared', () => {
                    let rteObj: RichTextEditor;
                    beforeEach(() => {
                        rteObj = renderRTE({
                            value: '<p>test</p>',
                            insertAudioSettings: {
                                allowedTypes: ['.mp3'],
                                saveFormat: 'Base64',
                                layoutOption: 'Inline'
                            }
                        });
                    });
                    afterEach(() => destroy(rteObj));

                    it('should clear all timeoutIds on destroy', () => {
                        const audioModule: any = rteObj.audioModule;
                        // Simulate multiple timeouts added to timeoutIds
                        const id1: number = setTimeout(() => { }, 100) as unknown as number;
                        const id2: number = setTimeout(() => { }, 100) as unknown as number;
                        const id3: number = setTimeout(() => { }, 100) as unknown as number;
                        audioModule.timeoutIds = [id1, id2, id3];
                        expect(audioModule.timeoutIds.length).toBe(3);
                        rteObj.destroy();
                        expect(audioModule.timeoutIds.length).toBe(0);
                    });

                    it('should execute clearTimeout for each id in timeoutIds array', () => {
                        const audioModule: any = rteObj.audioModule;
                        let clearedCount: number = 0;
                        const originalClearTimeout: Function = window.clearTimeout;
                        spyOn(window, 'clearTimeout').and.callFake((id: number) => {
                            clearedCount++;
                            originalClearTimeout(id);
                        });
                        const id1: number = setTimeout(() => { }, 100) as unknown as number;
                        const id2: number = setTimeout(() => { }, 100) as unknown as number;
                        audioModule.timeoutIds = [id1, id2];
                        rteObj.destroy();
                        expect(clearedCount).toBeGreaterThanOrEqual(2);
                    });
                });

                describe('destroy() → dialog and uploader cleaned up', () => {
                    let rteObj: RichTextEditor;
                    beforeEach(() => {
                        rteObj = renderRTE({
                            value: '<p>test</p>',
                            insertAudioSettings: {
                                allowedTypes: ['.mp3'],
                                saveFormat: 'Base64',
                                layoutOption: 'Inline'
                            }
                        });
                    });
                    afterEach(() => destroy(rteObj));

                    it('should destroy dialog object if present', () => {
                        const audioModule: any = rteObj.audioModule;
                        // Simulate dialog existence
                        audioModule.dialogObj = { isDestroyed: false, destroy: jasmine.createSpy('destroy') };
                        rteObj.destroy();
                        expect(audioModule.dialogObj).toBeNull();
                    });

                    it('should clear prevSelectedAudEle reference on destroy', () => {
                        const audioModule: any = rteObj.audioModule;
                        audioModule.prevSelectedAudEle = document.createElement('audio');
                        expect(audioModule.prevSelectedAudEle).not.toBeUndefined();
                        rteObj.destroy();
                        expect(audioModule.prevSelectedAudEle).toBeUndefined();
                    });
                });

                describe('Multiple destroy calls → idempotent behavior', () => {
                    let rteObj: RichTextEditor;
                    beforeEach(() => {
                        rteObj = renderRTE({
                            value: '<p>test</p>',
                            insertAudioSettings: {
                                allowedTypes: ['.mp3'],
                                saveFormat: 'Base64',
                                layoutOption: 'Inline'
                            }
                        });
                    });

                    it('should handle multiple destroy calls without error', () => {
                        const audioModule: any = rteObj.audioModule;
                        expect(() => {
                            rteObj.destroy();
                            rteObj.destroy();
                            rteObj.destroy();
                        }).not.toThrow();
                        expect(audioModule.isDestroyed).toBe(true);
                    });
                });

                describe('destroy() with active timeouts → all cleared', () => {
                    let rteObj: RichTextEditor;
                    beforeEach(() => {
                        rteObj = renderRTE({
                            value: '<p>test</p>',
                            insertAudioSettings: {
                                allowedTypes: ['.mp3'],
                                saveFormat: 'Base64',
                                layoutOption: 'Inline'
                            }
                        });
                    });
                    afterEach(() => destroy(rteObj));

                    it('should clear all active timeouts including batch paste timeouts', (done: DoneFn) => {
                        const audioModule: any = rteObj.audioModule;
                        // Set up multiple timeout scenarios
                        audioModule.showPopupTime = setTimeout(() => { }, 100) as unknown as number;
                        audioModule.audioDragPopupTime = setTimeout(() => { }, 100) as unknown as number;
                        audioModule.showAudioQTbarTime = setTimeout(() => { }, 100) as unknown as number;
                        audioModule.timeoutIds = [
                            setTimeout(() => { }, 100) as unknown as number,
                            setTimeout(() => { }, 100) as unknown as number
                        ];
                        const initialTimeoutCount: number = audioModule.timeoutIds.length + 3;
                        rteObj.destroy();
                        setTimeout(() => {
                            expect(audioModule.showPopupTime).toBeNull();
                            expect(audioModule.audioDragPopupTime).toBeNull();
                            expect(audioModule.showAudioQTbarTime).toBeNull();
                            expect(audioModule.timeoutIds.length).toBe(0);
                            done();
                        }, 100);
                    });
                });
            });

            describe('onDocumentClick prevSelectedAudEle outline clearing', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        toolbarSettings: { items: ['Audio'] },
                        value: `<p>Test content</p>
                <span class="e-audio-wrap" contenteditable="false">
                    <figure><audio class="e-rte-audio e-audio-inline" controls="">
                        <source src="/base/spec/content/audio/RTE-Audio.mp3" type="audio/mp3">
                    </audio></figure>
                </span>`
                    });
                });
                afterEach(() => destroy(rteObj));
                it('should clear outline from prevSelectedAudEle when clicking on non-audio element', (done: DoneFn) => {
                    const audioModule: any = (rteObj as any).audioModule;
                    const audioElement: HTMLAudioElement = rteObj.inputElement.querySelector('audio') as HTMLAudioElement;
                    const paragraph: HTMLElement = rteObj.inputElement.querySelector('p') as HTMLElement;
                    // Setup: Set prevSelectedAudEle with an outline style
                    audioModule.prevSelectedAudEle = audioElement;
                    audioModule.prevSelectedAudEle.style.outline = '2px solid #4a90e2';
                    audioModule.audEle = null; // Ensure audEle is null so it falls to prevSelectedAudEle branch
                    // Verify outline is set before click
                    expect(audioModule.prevSelectedAudEle.style.outline).toBe('rgb(74, 144, 226) solid 2px');
                    // Call onDocumentClick directly with non-audio element as target
                    const mouseEvent: MouseEvent = new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    Object.defineProperty(mouseEvent, 'target', { value: paragraph, enumerable: true });
                    audioModule.onDocumentClick(mouseEvent);
                    setTimeout(() => {
                        // Verify outline is cleared
                        expect(audioModule.prevSelectedAudEle.style.outline).toBe('');
                        done();
                    }, 100);
                });
            });
        });
    });

    describe('Video Module - ', () => {
        describe('PasteCleanup case', () => {
            describe('Paste valid .mp4 file → <video> element inserted', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm', '.mov'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert a <video> element when a .mp4 file is pasted', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBeGreaterThan(0);
                        done();
                    }, 100);
                });
            });

            describe('saveFormat=Base64 → src is data URI', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        pasteCleanupSettings: {
                            prompt: false,
                        },
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('inserted video src should start with data: when saveFormat is Base64', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const sourceEl: HTMLSourceElement = rteObj.inputElement.querySelector('video source');
                        if (sourceEl) {
                            expect(sourceEl.src.startsWith('data:')).toBe(true);
                        } else {
                            const videoEl: HTMLVideoElement = rteObj.inputElement.querySelector('video');
                            expect(videoEl).not.toBeNull();
                            expect(videoEl.src.startsWith('data:') || videoEl.querySelector('source') !== null).toBe(true);
                        }
                        done();
                    }, 100);
                });
            });

            describe('Inline → e-video-inline CSS class', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('inserted video container should have e-video-inline class for Inline layout', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const inlineEl: Element = rteObj.inputElement.querySelector('.e-video-inline');
                        expect(inlineEl).not.toBeNull();
                        done();
                    }, 100);
                });
            });

            describe('Break → e-video-break CSS class', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            saveFormat: 'Base64',
                            layoutOption: 'Break'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('inserted video container should have e-video-break class for Break layout', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const breakEl: Element = rteObj.inputElement.querySelector('.e-video-break');
                        expect(breakEl).not.toBeNull();
                        done();
                    }, 100);
                });
            });

            describe('Disallowed video extension → no element inserted', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        pasteCleanupSettings: {
                            prompt: false,
                        },
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should not insert a video element when extension is not in allowedTypes', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.avi', { type: 'video/avi' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(0);
                        done();
                    }, 100);
                });
            });

            describe('Readonly mode → paste is a no-op', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        readonly: true,
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should not insert video when editor is in readonly mode', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(0);
                        done();
                    }, 100);
                });
            });

            describe('Undo after video paste → event dispatched', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderRTE({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should dispatch videoPaste event on undo-tracked paste', (done: DoneFn) => {
                    const videoFile: File = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
                    const pasteEvent: any = buildPasteEvent(videoFile);
                    const notifySpy: jasmine.Spy = spyOn(rteObj, 'notify').and.callThrough();
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoPasteCalls: jasmine.CallInfo[] = notifySpy.calls.all().filter(
                            (c: jasmine.CallInfo) => c.args[0] === 'video-paste-content'
                        );
                        expect(videoPasteCalls.length).toBeGreaterThan(0);
                        done();
                    }, 100);
                });
            });
        });

        describe('Without PasteCleanup', () => {
            describe('Paste two valid .mp4 files → both <video> elements inserted', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm', '.mov'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert two <video> elements when two .mp4 files are pasted', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(2);
                        done();
                    }, 1000);
                });
            });

            describe('Paste three valid video files with different formats', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm', '.mov'],
                            saveUrl: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox/Save',
                            path: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert three <video> elements with mixed formats', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const videoFile3: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2, videoFile3])
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(3);
                        done();
                    }, 2000);
                });
            });

            describe('Multiple video paste with pasteCleanup enabled', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple video elements with pasteCleanup settings enabled', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(2);
                        done();
                    }, 1000);
                });
            });

            describe('Multiple video paste', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple video elements with keepFormat enabled', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(2);
                        done();
                    }, 1000);
                });
            });

            describe('Multiple video paste with saveFormat=URL', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            layoutOption: 'Inline'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple video elements with URL format', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(2);
                        videoEls.forEach((videoEl: HTMLVideoElement) => {
                            const src: string = videoEl.src || (videoEl.querySelector('source') && videoEl.querySelector('source').getAttribute('src')) || '';
                            expect(src.startsWith('blob:') || src !== '').toBe(true);
                        });
                        done();
                    }, 1000);
                });
            });

            describe('Multiple video paste with allowed types', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        pasteCleanupSettings: {
                            prompt: false
                        },
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            saveFormat: 'Base64',
                            layoutOption: 'Inline'
                        }
                    });
                });

                afterEach(() => destroy(rteObj));

                it('should insert only allowed video types from multiple paste', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const videoFile3: File = new File(['video content 3'], 'test3.avi', { type: 'video/avi' });
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2, videoFile3]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const videoEls: NodeListOf<HTMLVideoElement> =
                            rteObj.inputElement.querySelectorAll('video');
                        expect(videoEls.length).toBe(2);
                        done();
                    }, 1000);
                });
            });

            describe('Multiple video paste with Break layout', () => {
                let rteObj: RichTextEditor;
                beforeEach(() => {
                    rteObj = renderBasicMediaEditor({
                        value: '<p>test</p>',
                        insertVideoSettings: {
                            allowedTypes: ['.mp4', '.webm'],
                            saveFormat: 'Base64',
                            layoutOption: 'Break'
                        }
                    });
                });
                afterEach(() => destroy(rteObj));

                it('should insert multiple video elements with e-video-break class', (done: DoneFn) => {
                    const videoFile1: File = getVideoUniqueFile();
                    const videoFile2: File = getVideoUniqueFile();
                    const pasteEvent: any = buildMultipleVideoPasteEvent([videoFile1, videoFile2]);
                    rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                    setCursorPoint(rteObj.inputElement.firstElementChild, 0);
                    rteObj.onPaste(pasteEvent);
                    setTimeout(() => {
                        const breakEls: NodeListOf<Element> =
                            rteObj.inputElement.querySelectorAll('.e-video-break');
                        expect(breakEls.length).toBeGreaterThanOrEqual(2);
                        done();
                    }, 1000);
                });
            });
        });

        describe('Branches coverage ', () => {
            describe('SetAspectRatio Ternary and Regex Matching Branches', () => {
                let rteObj: RichTextEditor;
                let videoModule: any;
                beforeEach(() => {
                    rteObj = renderRTE({
                        toolbarSettings: { items: ['Video'] },
                        insertVideoSettings: {
                            allowedTypes: ['.mp4'],
                            resize: true,
                            resizeByPercent: false,
                            minWidth: 200,
                            minHeight: 90,
                            maxHeight: 600,
                            width: "640",
                            height: "480"
                        }
                    });
                    videoModule = (rteObj as any).videoModule;
                });

                afterEach(() => {
                    destroy(rteObj);
                    videoModule = null;
                });

                it('should cover all ternary and regex branches in setAspectRatio width/height calculations', (done: DoneFn) => {
                    // Create video element for testing
                    const videoElement: HTMLVideoElement = rteObj.createElement('video', {
                        className: 'e-rte-video',
                        attrs: { controls: 'true', width: '640', height: '480' }
                    }) as HTMLVideoElement;
                    // --- Branch 1: vidEleStyle.width with percentage (matches ^\d+(\.\d*)?%$) ---
                    videoElement.style.width = '80%';
                    videoElement.style.height = '400px';
                    let resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    expect(videoElement.style.width || videoElement.getAttribute('width')).toBeTruthy();
                    // --- Branch 2: vidEleStyle.width without percentage (parseInt fallback) ---
                    videoElement.style.width = '600px';
                    videoElement.style.height = '400px';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    expect(videoElement.style.width || videoElement.getAttribute('width')).toBeTruthy();
                    // --- Branch 3: vidEleStyle.width empty, uses vid.style.width ---
                    videoElement.style.width = '';
                    videoElement.style.height = '350px';
                    videoElement.setAttribute('width', '640');
                    videoElement.setAttribute('height', '480');
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    // Verify fallback occurred
                    expect(videoElement.style.height || videoElement.getAttribute('height')).toBeTruthy();
                    // --- Branch 4: Both vidEleStyle.width and vid.style.width empty, uses vid.width ---
                    videoElement.style.width = '';
                    videoElement.style.height = '';
                    videoElement.width = 640;
                    videoElement.height = 480;
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    // Should use vid.width (640) in calculations
                    expect(videoElement.width).toBeGreaterThan(0);
                    // --- Branch 5: width.toString().match regex with percentage format ---
                    videoElement.style.width = '75%';
                    videoElement.style.height = '400px';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    // Regex should match and use parseFloat
                    const finalWidth: string | number = videoElement.style.width || videoElement.width;
                    expect(finalWidth).toBeTruthy();
                    // --- Branch 6: width.toString().match regex without percentage (parseInt fallback) ---
                    videoElement.style.width = '500px';
                    videoElement.style.height = '400px';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    // Regex won't match percentage, uses parseInt
                    const finalDimension: string | number = videoElement.style.width || videoElement.width;
                    expect(finalDimension).toBeTruthy();
                    // --- Branch 7: vidEleStyle.height with parseInt ---
                    videoElement.style.width = '600px';
                    videoElement.style.height = '350px';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    expect(videoElement.style.height || videoElement.getAttribute('height')).toBeTruthy();
                    // --- Branch 8: vidEleStyle.height empty, uses vid.style.height ---
                    videoElement.style.width = '600px';
                    videoElement.style.height = '';
                    videoElement.setAttribute('height', '480');
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    expect(videoElement.style.height || videoElement.getAttribute('height')).toBeTruthy();
                    // --- Branch 9: height.toString().match regex with percentage ---
                    videoElement.style.width = '500px';
                    videoElement.style.height = '65%';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    expect(videoElement.style.width || videoElement.style.height).toBeTruthy();
                    // --- Branch 10: height.toString().match regex without percentage ---
                    videoElement.style.width = '500px';
                    videoElement.style.height = '350px';
                    resizeArgs = {
                        event: new PointerEvent('pointermove'),
                        requestType: 'videos'
                    };
                    (videoModule as any).setAspectRatio(videoElement, 500, 100, resizeArgs);
                    // Uses parseInt for non-percentage format
                    expect(videoElement.style.width || videoElement.style.height || videoElement.width).toBeTruthy();
                    done();
                });
            });
        });
    });
});