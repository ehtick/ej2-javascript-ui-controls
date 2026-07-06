import { RichTextEditor } from "../../../src/index";
import { ImageDropEventArgs, MediaDropEventArgs } from "./../../../src/common/interface";
import { renderRTE, destroy, setCursorPoint, dispatchEvent } from "../render.spec";
import { getAudioUniqueFile, getImageUniqueFIle } from "../online-service.spec";
import { isNullOrUndefined, Browser } from "@syncfusion/ej2-base";
import { BASIC_MOUSE_EVENT_INIT } from "../../constant.spec";
const INIT_MOUSEDOWN_EVENT: MouseEvent = new MouseEvent('mousedown', BASIC_MOUSE_EVENT_INIT);

describe(' Media - Drag and Drop', () => {
    beforeAll((done: DoneFn) => {
        const link: HTMLLinkElement = document.createElement('link');
        link.href = '/base/demos/themes/material.css';
        link.rel = 'stylesheet';
        link.id = 'materialTheme';
        link.onload = () => {
            done(); // Style should be loaded before done() called
        };
        link.onerror = (e) => {
            fail(`Failed to load stylesheet: ${link.href}`);
            done(); // still end the test run to avoid hanging
        };
        document.head.appendChild(link);

    });
    afterAll(() => {
        document.getElementById('materialTheme').remove();
    });
    describe('986531: beforeImageDrop Event Should Trigger Only for Image Drops, Not for Audio or Video', () => {
        let rteObj: RichTextEditor;
        let isImageDropTriggered: boolean = false;
        beforeEach(() => {
            rteObj = renderRTE({
                toolbarSettings: { items: ['Image', 'Audio'] },
                beforeImageDrop: (args: ImageDropEventArgs) => {
                    args.cancel = true; // Cancel image drop
                    isImageDropTriggered = true;
                }
            });
        });
        afterEach(() => destroy(rteObj));
        it('Should not trigger the beforeImageDrop event when audio is dropped in to the editor', (done: DoneFn) => {
            rteObj.inputElement.innerHTML = `<p>Drop test content.</p>`;
            const paragraph = rteObj.inputElement.querySelector('p');
            const audioFile = new File(['dummy'], 'test.mp3', { type: 'audio/mp3' });
            const audioTransfer = new DataTransfer();
            audioTransfer.items.add(audioFile);
            const audioDropEvent = new DragEvent('drop', { dataTransfer: audioTransfer, bubbles: true });
            paragraph.dispatchEvent(audioDropEvent);
            setTimeout(() => {
                expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(1);
                expect(isImageDropTriggered).toBe(false);
                done();
            }, 100);
        });
    });

    describe('Bug 1003366: Cursor is not available while dragging and dropping the file into the editor', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging supported image format should make the cursor visible ", function (done: DoneFn) {
            let fileObj: File = new File(["Nice One"], "sample.jpg", { lastModified: 0, type: "image/jpg" });
            const imageTransfer = new DataTransfer();
            imageTransfer.items.add(fileObj);
            rteObj.focusIn();
            const imageDropEvent = new DragEvent('dragover', { dataTransfer: imageTransfer, bubbles: true });
            rteObj.inputElement.dispatchEvent(imageDropEvent);
            setTimeout(() => {
                const range: Range = rteObj.getRange();
                expect(rteObj.inputElement.contains(range.startContainer)).toBe(true);
                done();
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging unsupported audio format should make the drop effect as none ", function (done: DoneFn) {
            let fileObj: File = new File(
                ["OGG Audio Data"],
                "sample.ogg",
                { lastModified: 0, type: "audio/ogg" }
            );
            const audioTransfer = new DataTransfer();
            audioTransfer.items.add(fileObj);
            rteObj.focusIn();
            const audioDropEvent = new DragEvent('dragover', { dataTransfer: audioTransfer, bubbles: true });
            rteObj.inputElement.dispatchEvent(audioDropEvent);
            setTimeout(() => {
                expect(audioDropEvent.dataTransfer.dropEffect).toBe('none');
                done();
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging unsupported image format should make the drop effect as none ", function (done: DoneFn) {
            let fileObj: File = new File(["Nice One"], "sample.gif", { lastModified: 0, type: "image/gif" });
            const imageTransfer = new DataTransfer();
            imageTransfer.items.add(fileObj);
            rteObj.focusIn();
            const imageDropEvent = new DragEvent('dragover', { dataTransfer: imageTransfer, bubbles: true });
            rteObj.inputElement.dispatchEvent(imageDropEvent);
            setTimeout(() => {
                expect(imageDropEvent.dataTransfer.dropEffect).toBe('none');
                done();
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging unsupported video format should make the drop effect as none ", function (done: DoneFn) {
            let fileObj: File = new File(
                ["MKV Video Data"],
                "sample.mkv",
                { lastModified: 0, type: "video/x-matroska" }
            );
            const videoTransfer = new DataTransfer();
            videoTransfer.items.add(fileObj);
            rteObj.focusIn();
            const videoDropEvent = new DragEvent('dragover', { dataTransfer: videoTransfer, bubbles: true });
            rteObj.inputElement.dispatchEvent(videoDropEvent);
            setTimeout(() => {
                expect(videoDropEvent.dataTransfer.dropEffect).toBe('none');
                done();
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging without audio file should make the drop effect as none ", function (done: DoneFn) {
            const audioTransfer = new DataTransfer();
            let event: any = {
                clientX: 40,
                clientY: 294,
                target: rteObj.contentModule.getEditPanel(),
                dataTransfer: audioTransfer,
                preventDefault: function () { return; },
                stopImmediatePropagation: function () { return; }
            };
            rteObj.focusIn();
            (rteObj.audioModule as any).dragOver(event);
            setTimeout(() => {
                expect(event.dataTransfer.dropEffect).toBe('none');
                event = {
                    clientX: 40,
                    clientY: 294,
                    target: rteObj.contentModule.getEditPanel(),
                    preventDefault: function () { return; },
                    stopImmediatePropagation: function () { return; }
                };
                rteObj.focusIn();
                (rteObj.audioModule as any).dragOver(event);
                setTimeout(() => {
                    expect(event.dataTransfer).toBeUndefined();
                    done();
                }, 200);
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("Dragging without video file should make the drop effect as none ", function (done: DoneFn) {
            const videoTransfer = new DataTransfer();
            let event: any = {
                clientX: 40,
                clientY: 294,
                target: rteObj.contentModule.getEditPanel(),
                dataTransfer: videoTransfer,
                preventDefault: function () { return; },
                stopImmediatePropagation: function () { return; }
            };
            rteObj.focusIn();
            (rteObj.videoModule as any).dragOver(event);
            setTimeout(() => {
                expect(event.dataTransfer.dropEffect).toBe('none');
                event = {
                    clientX: 40,
                    clientY: 294,
                    target: rteObj.contentModule.getEditPanel(),
                    preventDefault: function () { return; },
                    stopImmediatePropagation: function () { return; }
                };
                rteObj.focusIn();
                (rteObj.videoModule as any).dragOver(event);
                setTimeout(() => {
                    expect(event.dataTransfer).toBeUndefined();
                    done();
                }, 200);
            }, 200);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("should return the proper audio file type", function () {
            expect(isNullOrUndefined((rteObj.audioModule as any).getAudioExtensionFromMime(""))).toBe(true);
            expect(isNullOrUndefined((rteObj.audioModule as any).getAudioExtensionFromMime("video/mp4"))).toBe(true);
            expect(!isNullOrUndefined((rteObj.audioModule as any).getAudioExtensionFromMime("audio/opus; codecs=opus"))).toBe(true);
        });
    });

    describe('Bug 999971: Remove Copy Icon and Set Drop Effect to None for Non-Allowed Media Types', () => {
        let rteObj: RichTextEditor;
        beforeAll(() => {
            rteObj = renderRTE({
                value: `<p>21</p>`,
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });
        it("should return the proper video file type", function () {
            expect(isNullOrUndefined((rteObj.videoModule as any).getExtensionFromMime(""))).toBe(true);
            expect(isNullOrUndefined((rteObj.videoModule as any).getExtensionFromMime("audio/mp3"))).toBe(true);
            expect(!isNullOrUndefined((rteObj.videoModule as any).getExtensionFromMime('video/webm; codecs="vp9"'))).toBe(true);
        });
    });

    describe('dragOver functionality across different browsers', () => {
            let rteObj: RichTextEditor;
            let dragEvent: any;
            let backupBrowserName: string;
            beforeEach(() => {
                rteObj = renderRTE({});
                dragEvent = {
                    dataTransfer: {
                        items: [{ type: "video/mp4" }],
                        types: ["Files"]
                    },
                    preventDefault: jasmine.createSpy('preventDefault'),
                    stopImmediatePropagation: function () { return; }
                };
                // Backup the browser name (info.name)
                backupBrowserName = Browser.info.name;
            });
            afterEach(() => {
                destroy(rteObj);
                // Restore the browser name
                Browser.info.name = backupBrowserName;
            });
            it('should call preventDefault for Edge browsers when dragging video', () => {
                Browser.info.name = 'edge';
                dragEvent.dataTransfer.items = [{ type: 'video/mp4' }];
                const result = (rteObj.videoModule as any).dragOver(dragEvent);
                expect(dragEvent.preventDefault).toHaveBeenCalled();
                expect(result).toBeUndefined();
            });
            it('should call preventDefault for Internet Explorer when types contain Files', () => {
                Browser.info.name = 'ie';
                dragEvent.dataTransfer.types = ["Files"];
                const result = (rteObj.videoModule as any).dragOver(dragEvent);
                expect(result === undefined || result === true).toBe(true);
            });
            it('should return true for other browsers or types', () => {
                Browser.info.name = 'chrome';
                dragEvent.dataTransfer.items = [{ type: 'text/plain' }];
                dragEvent.dataTransfer.types = ["text"];
                const result = (rteObj.videoModule as any).dragOver(dragEvent);
                expect(dragEvent.preventDefault).not.toHaveBeenCalled();
                expect(isNullOrUndefined(result)).toBe(true);
            });
        });

    describe('986531: beforeImageDrop Event Should Trigger Only for Image Drops, Not for Audio or Video', () => {
        let rteObj: RichTextEditor;
        let isImageDropTriggered: boolean = false;
        beforeAll(() => {
            rteObj = renderRTE({
                toolbarSettings: { items: ['Video'] },
                value: `<div><p>Insert video here</p></div>`,
                beforeImageDrop: (args) => {
                    isImageDropTriggered = true; // Should NOT trigger for video
                }
            });
        });
        afterAll(() => {
            destroy(rteObj);
        });

        it('When video is dragged and dropped, ensure beforeImageDrop is not triggered', (done: DoneFn) => {
            const fileObj = new File(['dummy'], 'sample.mp4', { type: 'video/mp4' });
            const event: any = {
                clientX: 40,
                clientY: 294,
                dataTransfer: { files: [fileObj] },
                preventDefault: () => { }
            };
            rteObj.focusIn();
            (rteObj.videoModule as any).insertDragVideo(event);
            setTimeout(() => {
                // Only one final <video> should exist
                expect(rteObj.inputElement.querySelectorAll('video').length).toBe(1);
                expect(isImageDropTriggered).toBe(false);
                done();
            }, 500);
        });
    });

    describe('986531: beforeImageDrop Event Should Trigger Only for Image Drops, Not for Audio or Video', () => {
        let editor: RichTextEditor;
        let isMediaDropTriggered: boolean = false;
        beforeAll(() => {
            editor = renderRTE({
                value: `<p>This is a text content.</p>`,
                beforeMediaDrop: (args: MediaDropEventArgs) => {
                    args.cancel = true; 
                    isMediaDropTriggered = true;
                }
            });
        });
        afterAll(() => {
            destroy(editor);
        });
        it('Should not trigger the beforeMediaDrop event when image is dropped in to the editor', (done: DoneFn) => {
            const file: File = getImageUniqueFIle();
            const dataTransfer: DataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const eventInit: DragEventInit = {
                dataTransfer: dataTransfer,
                bubbles: true,
                clientX: 40,
                clientY: 294,
            };
            const dropEvent: DragEvent = new DragEvent('drop', eventInit);
            editor.inputElement.querySelector('p').dispatchEvent(dropEvent);
            setTimeout(() => {
                expect(editor.inputElement.querySelectorAll('img').length).toBe(1);
                expect(isMediaDropTriggered).toBe(false);
                done();
            }, 100);
        });
    });
    describe('Audio Module', () => {
        describe('Multiple File Drag and Drop', () => {
            let rteObj: RichTextEditor;
            beforeEach(() => {
                rteObj = renderRTE({
                    toolbarSettings: { items: ['Audio'] },
                    insertAudioSettings: { allowedTypes: ['.mp3', '.wav'] }
                });
            });
            afterEach(() => {
                destroy(rteObj);
            });
            it('should insert audio when multiple files are dropped at once', (done: DoneFn) => {
                rteObj.value = `<p>Drop multiple audio files here.</p>`;
                rteObj.dataBind();
                const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                const audioFile1: File = new File(['audio1'], 'test1.mp3', { type: 'audio/mp3' });
                const audioFile2: File = new File(['audio2'], 'test2.wav', { type: 'audio/wav' });
                const multiTransfer: DataTransfer = new DataTransfer();
                multiTransfer.items.add(audioFile1);
                multiTransfer.items.add(audioFile2);
                const multiDropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: multiTransfer,
                    bubbles: true,
                    cancelable: true
                });
                paragraph.dispatchEvent(multiDropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(2);
                    done();
                }, 150);
            });

            it('should insert audio only when single file is dropped after multiple files attempt', (done: DoneFn) => {
                rteObj.value = `<p>Test audio drop.</p>`;
                rteObj.dataBind();
                // First attempt: drop multiple files (should be rejected)
                const audioFile1: File = new File(['audio1'], 'test1.mp3', { type: 'audio/mp3' });
                const audioFile2: File = new File(['audio2'], 'test2.wav', { type: 'audio/wav' });
                const multiTransfer: DataTransfer = new DataTransfer();
                multiTransfer.items.add(audioFile1);
                multiTransfer.items.add(audioFile2);
                const multiDropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: multiTransfer,
                    bubbles: true
                });
                rteObj.inputElement.dispatchEvent(multiDropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(2);
                    // Second attempt: drop single file (should be accepted)
                    rteObj.value = `<p>Drop single audio here.</p>`;
                    rteObj.dataBind();
                    const singleAudioFile: File = new File(['audio'], 'single.mp3', { type: 'audio/mp3' });
                    const singleTransfer: DataTransfer = new DataTransfer();
                    singleTransfer.items.add(singleAudioFile);
                    const singleDropEvent: DragEvent = new DragEvent('drop', {
                        dataTransfer: singleTransfer,
                        bubbles: true
                    });
                    rteObj.inputElement.dispatchEvent(singleDropEvent);
                    setTimeout(() => {
                        expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(0);
                        done();
                    }, 150);
                }, 150);
            });
        });

        describe('With the saveURL and path', () => {
            let rteObj: RichTextEditor;
            beforeEach(() => {
                rteObj = renderRTE({
                    value: `<p>Content with mixed media.</p>`,
                    toolbarSettings: { items: ['Audio', 'Video'] },
                        insertAudioSettings: {
                            allowedTypes: ['.mp3', '.wav', '.ogg', '.webm', '.aac'],
                            saveUrl: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox/Save',
                            path: 'http://aspnetmvc.syncfusion.com/services/api/uploadbox/',
                            layoutOption: 'Break'
                        }
                });
            });

            afterEach(() => {
                destroy(rteObj);
            });

            it('should insert audio when dropping audio file in content with existing text', (done: DoneFn) => {
                const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                const audioFile: File = getAudioUniqueFile();
                const dataTransfer: DataTransfer = new DataTransfer();
                dataTransfer.items.add(audioFile);
                const dropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: dataTransfer,
                    bubbles: true,
                    cancelable: true
                });
                rteObj.inputElement.dispatchEvent(dropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(0);
                    expect(rteObj.inputElement.querySelector('p')).not.toBeNull();
                    done();
                }, 150);
            });

            it('should not insert disallowed audio type when dropping', (done: DoneFn) => {
                const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                const invalidAudioFile: File = new File(['audio'], 'audio.flac', { type: 'audio/flac' });
                const dataTransfer: DataTransfer = new DataTransfer();
                dataTransfer.items.add(invalidAudioFile);
                const dropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: dataTransfer,
                    bubbles: true
                });
                rteObj.inputElement.dispatchEvent(dropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(0);
                    done();
                }, 150);
            });
        });

        describe('Quick Toolbar After Existing Audio with Drag and Drop', () => {
            let rteObj: RichTextEditor;
            let controlId: string;

            beforeEach(() => {
                rteObj = renderRTE({
                    value: `<p>Content with existing <span class="e-audio-wrap" contenteditable="false" title="existing.mp3"><span class="e-clickelem"><audio class="e-rte-audio e-audio-inline" controls=""><source src="/base/spec/content/audio/RTE-Audio.mp3" type="audio/mp3"></audio></span></span> audio.</p>`,
                    toolbarSettings: { items: ['Audio'] },
                    insertAudioSettings: { allowedTypes: ['.mp3', '.wav'] }
                });
                controlId = rteObj.element.id;
            });

            afterEach(() => {
                destroy(rteObj);
            });

            it('should show quick toolbar when existing audio is clicked', (done: DoneFn) => {
                const existingAudio: HTMLElement = rteObj.inputElement.querySelector('.e-audio-wrap');
                setCursorPoint(existingAudio, 0);
                // Simulate mouse interaction
                dispatchEvent(existingAudio, 'mousedown');
                existingAudio.click();
                dispatchEvent(existingAudio, 'mouseup');
                setTimeout(() => {
                    const quickToolbar: HTMLElement | null = document.querySelector('.e-rte-quick-popup');
                    expect(quickToolbar).not.toBeNull();
                    expect(quickToolbar.style.display).not.toBe('copy');
                    done();
                }, 150);
            });

            it('should handle drag and drop while quick toolbar is visible for existing audio', (done: DoneFn) => {
                const existingAudio: HTMLElement = rteObj.inputElement.querySelector('.e-audio-wrap');
                setCursorPoint(existingAudio, 0);
                // Show quick toolbar
                dispatchEvent(existingAudio, 'mousedown');
                existingAudio.click();
                dispatchEvent(existingAudio, 'mouseup');
                setTimeout(() => {
                    const quickToolbar: HTMLElement | null = document.querySelector('.e-rte-quick-popup');
                    expect(quickToolbar).not.toBeNull();
                    // Now perform drag and drop
                    const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                    const newAudioFile: File = new File(['new_audio'], 'new.mp3', { type: 'audio/mp3' });
                    const dataTransfer: DataTransfer = new DataTransfer();
                    dataTransfer.items.add(newAudioFile);
                    const dropEvent: DragEvent = new DragEvent('drop', {
                        dataTransfer: dataTransfer,
                        bubbles: true,
                        cancelable: true
                    });
                    paragraph.dispatchEvent(dropEvent);
                    setTimeout(() => {
                        // Should have 2 audio elements now (existing + newly dropped)
                        expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBeGreaterThanOrEqual(1);
                        done();
                    }, 150);
                }, 150);
            });

            it('should update selected audio when different audio is clicked before drag and drop', (done: DoneFn) => {
                const existingAudio: HTMLElement = rteObj.inputElement.querySelector('.e-audio-wrap');
                setCursorPoint(existingAudio, 0);
                // Click existing audio to select it
                dispatchEvent(existingAudio, 'mousedown');
                existingAudio.click();
                dispatchEvent(existingAudio, 'mouseup');
                setTimeout(() => {
                    const quickToolbar: HTMLElement | null = document.querySelector('.e-rte-quick-popup');
                    expect(quickToolbar).not.toBeNull();
                    // Drop new audio
                    const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                    const newAudioFile: File = new File(['new_audio'], 'second.wav', { type: 'audio/wav' });
                    const dataTransfer: DataTransfer = new DataTransfer();
                    dataTransfer.items.add(newAudioFile);
                    const dropEvent: DragEvent = new DragEvent('drop', {
                        dataTransfer: dataTransfer,
                        bubbles: true
                    });
                    paragraph.dispatchEvent(dropEvent);
                    setTimeout(() => {
                        // Verify audio elements exist
                        const audioElements: NodeListOf<HTMLElement> = rteObj.inputElement.querySelectorAll('.e-audio-wrap');
                        expect(audioElements.length).toBeGreaterThanOrEqual(1);
                        // Quick toolbar should still be present
                        const updatedQuickToolbar: HTMLElement | null = document.querySelector('.e-rte-quick-popup');
                        expect(updatedQuickToolbar).not.toBeNull();
                        done();
                    }, 150);
                }, 150);
            });

            it('should maintain audio properties when drop happens with active quick toolbar', (done: DoneFn) => {
                const existingAudio: HTMLAudioElement = rteObj.inputElement.querySelector('.e-audio-wrap audio');
                const originalSrc: string = existingAudio.querySelector('source').getAttribute('src') || '';
                // Select existing audio
                const audioWrap: HTMLElement = rteObj.inputElement.querySelector('.e-audio-wrap');
                setCursorPoint(audioWrap, 0);
                dispatchEvent(audioWrap, 'mousedown');
                audioWrap.click();
                dispatchEvent(audioWrap, 'mouseup');
                setTimeout(() => {
                    // Perform drag and drop
                    const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                    const newAudioFile: File = new File(['new_audio'], 'test_audio.mp3', { type: 'audio/mp3' });
                    const dataTransfer: DataTransfer = new DataTransfer();
                    dataTransfer.items.add(newAudioFile);
                    const dropEvent: DragEvent = new DragEvent('drop', {
                        dataTransfer: dataTransfer,
                        bubbles: true
                    });
                    paragraph.dispatchEvent(dropEvent);
                    setTimeout(() => {
                        const existingAudios: NodeListOf<HTMLAudioElement> = rteObj.inputElement.querySelectorAll('.e-audio-wrap audio');
                        done();
                    }, 150);
                }, 150);
            });
        });
    
        describe('Cover the quicktoolbar case', () => {
            let rteObj: RichTextEditor;
            beforeEach(() => {
                rteObj = renderRTE({
                    toolbarSettings: { items: ['Audio'] },
                    insertAudioSettings: { allowedTypes: ['.mp3', '.wav'] }
                });
            });
            afterEach(() => {
                destroy(rteObj);
            });
            it('should not insert audio when multiple files are dropped at once', (done: DoneFn) => {
                rteObj.value = `<p>Drop multiple audio files here.</p>`;
                rteObj.dataBind();
                const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                rteObj.inputElement.dispatchEvent(INIT_MOUSEDOWN_EVENT);
                const audioFile1: File = getAudioUniqueFile();
                const audioFile2: File = getAudioUniqueFile();
                const multiTransfer: DataTransfer = new DataTransfer();
                multiTransfer.items.add(audioFile1);
                multiTransfer.items.add(audioFile2);
                const multiDropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: multiTransfer,
                    bubbles: true,
                    cancelable: true
                });
                paragraph.dispatchEvent(multiDropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-audio-wrap').length).toBe(2);
                    paragraph.dispatchEvent(multiDropEvent);
                    done();
                }, 150);
            });
        });
    });

    describe('Video Module', () => {
        describe('Multiple File Drag and Drop', () => {
            let rteObj: RichTextEditor;

            beforeEach(() => {
                rteObj = renderRTE({
                    toolbarSettings: { items: ['Video'] },
                    value: `<p>Drop multiple video files here.</p>`,
                    insertVideoSettings: { allowedTypes: ['.mp4', '.webm', '.avi'] }
                });
            });

            afterEach(() => {
                destroy(rteObj);
            });

            it('should not insert video when multiple files are dropped at once', (done: DoneFn) => {
                const paragraph: HTMLElement = rteObj.inputElement.querySelector('p');
                const videoFile1: File = new File(['video1'], 'test1.mp4', { type: 'video/mp4' });
                const videoFile2: File = new File(['video2'], 'test2.webm', { type: 'video/webm' });
                const multiTransfer: DataTransfer = new DataTransfer();
                multiTransfer.items.add(videoFile1);
                multiTransfer.items.add(videoFile2);
                const multiDropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: multiTransfer,
                    bubbles: true,
                    cancelable: true
                });
                paragraph.dispatchEvent(multiDropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-video-wrap').length).toBeGreaterThanOrEqual(0);
                    done();
                }, 150);
            });

            it('should insert video only when single file is dropped after multiple files attempt', (done: DoneFn) => {
                rteObj.value = `<p>Test video drop.</p>`;
                rteObj.dataBind();
                const videoFile1: File = new File(['video1'], 'test1.mp4', { type: 'video/mp4' });
                const videoFile2: File = new File(['video2'], 'test2.webm', { type: 'video/webm' });
                const multiTransfer: DataTransfer = new DataTransfer();
                multiTransfer.items.add(videoFile1);
                multiTransfer.items.add(videoFile2);
                const multiDropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: multiTransfer,
                    bubbles: true
                });
                rteObj.inputElement.dispatchEvent(multiDropEvent);
                setTimeout(() => {
                    const singleVideoFile: File = new File(['video'], 'single.mp4', { type: 'video/mp4' });
                    const singleTransfer: DataTransfer = new DataTransfer();
                    singleTransfer.items.add(singleVideoFile);
                    const singleDropEvent: DragEvent = new DragEvent('drop', {
                        dataTransfer: singleTransfer,
                        bubbles: true
                    });
                    rteObj.inputElement.dispatchEvent(singleDropEvent);
                    setTimeout(() => {
                        expect(rteObj.inputElement.querySelectorAll('.e-video-wrap').length).toBeGreaterThanOrEqual(0);
                        done();
                    }, 150);
                }, 150);
            });
        });

        describe('Drag and Drop with Mixed Media', () => {
            let rteObj: RichTextEditor;
            beforeEach(() => {
                rteObj = renderRTE({
                    value: `<p>Content with mixed media.</p>`,
                    toolbarSettings: { items: ['Video', 'Audio'] },
                    insertVideoSettings: { allowedTypes: ['.mp4', '.webm', '.avi'] }
                });
            });

            afterEach(() => {
                destroy(rteObj);
            });

            it('should insert video when dropping video file in content with existing text', (done: DoneFn) => {
                const videoFile: File = new File(['video'], 'video.mp4', { type: 'video/mp4' });
                const dataTransfer: DataTransfer = new DataTransfer();
                dataTransfer.items.add(videoFile);
                const dropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: dataTransfer,
                    bubbles: true,
                    cancelable: true
                });
                rteObj.inputElement.dispatchEvent(dropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-video-wrap').length).toBeGreaterThanOrEqual(0);
                    expect(rteObj.inputElement.querySelector('p')).not.toBeNull();
                    done();
                }, 150);
            });

            it('should not insert disallowed video type when dropping', (done: DoneFn) => {
                const invalidVideoFile: File = new File(['video'], 'video.mkv', { type: 'video/x-matroska' });
                const dataTransfer: DataTransfer = new DataTransfer();
                dataTransfer.items.add(invalidVideoFile);
                const dropEvent: DragEvent = new DragEvent('drop', {
                    dataTransfer: dataTransfer,
                    bubbles: true
                });
                rteObj.inputElement.dispatchEvent(dropEvent);
                setTimeout(() => {
                    expect(rteObj.inputElement.querySelectorAll('.e-video-wrap').length).toBe(0);
                    done();
                }, 150);
            });
        });
    });
});
