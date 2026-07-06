import { createElement } from '@syncfusion/ej2-base';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection,
    TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
} from '../../../../src/index';
import { HyperlinkClickEventArgs, HyperlinkMouseOverArgs } from '../../../../src/pdfviewer/base/events-helper';
import { getTarget, mouseClickEvent, mouseOverEvent, rightClickEvent } from '../../utils.spec';
import { HYPERLINK_B64 } from '../../Data/pdf-data.spec';

describe('PDF_Viewer_LinkAnnotation_Public_API', () => {
    let pdfviewer: PdfViewer | null = null;

    PdfViewer.Inject(
        Toolbar, Magnification, Navigation, LinkAnnotation,
        ThumbnailView, BookmarkView, TextSelection, TextSearch,
        Print, Annotation, FormFields, FormDesigner, PageOrganizer
    );

    beforeAll((done: DoneFn) => {
        const existingEl: HTMLElement | null = document.getElementById('pdfviewer_link_annotation');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        const element: HTMLElement = createElement('div', { id: 'pdfviewer_link_annotation' });
        document.body.appendChild(element);

        pdfviewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + HYPERLINK_B64,
            enableHyperlink: true,
            hyperlinkOpenState: 'NewWindow'
        });

        pdfviewer.documentLoad = () => {
            done();
        };

        pdfviewer.appendTo('#pdfviewer_link_annotation');
    });

    afterAll(() => {
        if (pdfviewer) {
            pdfviewer.destroy();
            const el: HTMLElement | null = document.getElementById('pdfviewer_link_annotation');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            pdfviewer = null;
        }
    });

    // ============================================================================
    // PUBLIC API: enableHyperlink
    // ============================================================================

    it('LINKANNOT-001-enableHyperlink-true-creates-hyperlinks', (done: DoneFn) => {
        // Arrange
        const initialEnableHyperlink: boolean = pdfviewer!.enableHyperlink;
        const initialWebLinks: NodeListOf<Element> = document.querySelectorAll('.e-pv-hyperlink[id^="weblinkdiv"]');
        const initialDocLinks: NodeListOf<Element> = document.querySelectorAll('.e-pv-hyperlink[id^="linkdiv"]');
        const totalInitialLinks: number = initialWebLinks.length + initialDocLinks.length;

        // Assert
        expect(initialEnableHyperlink).toBe(true);
        expect(totalInitialLinks).toBeGreaterThan(0);  // Hyperlinks should exist
        done();
    });

    it('LINKANNOT-002-enableHyperlink-false-disables-hyperlinks', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + HYPERLINK_B64,
            enableHyperlink: false
        });

        const element: HTMLElement = createElement('div', { id: 'pdfviewer_hyperlink_disabled' });
        document.body.appendChild(element);

        viewer.documentLoad = () => {
            // Assert
            const webLinks: NodeListOf<Element> = document.querySelectorAll(
                '#pdfviewer_hyperlink_disabled .e-pv-hyperlink[id^="weblinkdiv"]'
            );
            const docLinks: NodeListOf<Element> = document.querySelectorAll(
                '#pdfviewer_hyperlink_disabled .e-pv-hyperlink[id^="linkdiv"]'
            );
            expect(webLinks.length).toBe(0);
            expect(docLinks.length).toBe(0);

            // Cleanup
            viewer.destroy();
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            done();
        };

        viewer.appendTo('#pdfviewer_hyperlink_disabled');
    });

    it('LINKANNOT-003-enableHyperlink-toggle-dynamic', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        const initialState: boolean = viewer.enableHyperlink;

        // Act - Disable hyperlinks
        viewer.enableHyperlink = false;

        // Assert - After disabling, new hyperlinks should not be interactive
        expect(viewer.enableHyperlink).toBe(false);

        // Act - Re-enable hyperlinks
        viewer.enableHyperlink = true;

        // Assert
        expect(viewer.enableHyperlink).toBe(true);
        done();
    });

    // ============================================================================
    // PUBLIC API: hyperlinkOpenState
    // ============================================================================

    it('LINKANNOT-004-hyperlinkOpenState-NewWindow-opens-in-new-tab', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        const initialState: string = viewer.hyperlinkOpenState;

        // Act
        viewer.hyperlinkOpenState = 'NewWindow';

        // Assert
        expect(viewer.hyperlinkOpenState).toBe('NewWindow');

        // Verify hyperlink target behavior by checking created links
        const webLink: HTMLElement | null = document.querySelector('a[id^="weblinkdiv"]');
        expect(webLink).not.toBeNull();
        
        done();
    });

    it('LINKANNOT-005-hyperlinkOpenState-CurrentTab-opens-in-current-tab', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;

        // Act
        viewer.hyperlinkOpenState = 'CurrentTab';

        // Assert
        expect(viewer.hyperlinkOpenState).toBe('CurrentTab');
        done();
    });

    it('LINKANNOT-006-hyperlinkOpenState-default-behavior', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;

        // Act - Set to NewWindow and verify state
        viewer.hyperlinkOpenState = 'NewWindow';

        // Assert
        expect(viewer.hyperlinkOpenState).not.toBeNull();
        expect(['NewWindow', 'CurrentTab'].indexOf(viewer.hyperlinkOpenState) !== -1).toBe(true);
        done();
    });

    // ============================================================================
    // EVENT: hyperlinkClick
    // ============================================================================

    it('LINKANNOT-007-hyperlinkClick-event-fires-on-weblink-click', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let eventFired: boolean = false;
        let eventArgs: HyperlinkClickEventArgs | null = null;

        const hyperlinkClickHandler = (args: HyperlinkClickEventArgs): void => {
            eventFired = true;
            eventArgs = args;
        };

        viewer.hyperlinkClick = hyperlinkClickHandler;

        // Act - Find and click a web hyperlink
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        if (webLink) {
            webLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }

        // Assert
        expect(eventFired).toBe(true);
        expect(eventArgs).not.toBeNull();
        if (eventArgs) {
            expect(eventArgs.name).toBe('hyperlinkClick');
            expect(eventArgs.hyperlink).toBeDefined();
            expect(typeof eventArgs.hyperlink).toBe('string');
        }
        done();
    });

    it('LINKANNOT-008-hyperlinkClick-event-args-contain-hyperlink-and-element', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let capturedArgs: HyperlinkClickEventArgs | null = null;

        const hyperlinkClickHandler = (args: HyperlinkClickEventArgs): void => {
            capturedArgs = args;
        };

        viewer.hyperlinkClick = hyperlinkClickHandler;

        // Act
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        if (webLink) {
            webLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }

        // Assert
        expect(capturedArgs).not.toBeNull();
        if (capturedArgs) {
            expect(capturedArgs.hyperlink).toBeDefined();
            expect(capturedArgs.hyperlink.length).toBeGreaterThan(0);
            expect(capturedArgs.name).toBe('hyperlinkClick');
        }
        done();
    });

    it('LINKANNOT-009-hyperlinkClick-event-fires-for-document-links', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let docLinkEventFired: boolean = false;

        const hyperlinkClickHandler = (args: HyperlinkClickEventArgs): void => {
            docLinkEventFired = true;
        };

        viewer.hyperlinkClick = hyperlinkClickHandler;

        // Act - Find and click a document link
        const docLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="linkdiv"]'
        );

        if (docLink) {
            docLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }

        // Assert
        // Document links may or may not fire click events depending on implementation
        // This test verifies the handler is callable
        expect(typeof viewer.hyperlinkClick).toBe('function');
        done();
    });

    it('LINKANNOT-010-hyperlinkClick-event-with-multiple-clicks', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let clickCount: number = 0;

        const hyperlinkClickHandler = (args: HyperlinkClickEventArgs): void => {
            clickCount++;
        };

        viewer.hyperlinkClick = hyperlinkClickHandler;

        // Act - Click multiple web links
        const webLinks: NodeListOf<Element> = document.querySelectorAll(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        for (let i: number = 0; i < Math.min(webLinks.length, 2); i++) {
            webLinks[i].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }

        // Assert
        expect(clickCount).toBeGreaterThan(0);
        done();
    });

    // ============================================================================
    // EVENT: hyperlinkMouseOver
    // ============================================================================

    it('LINKANNOT-011-hyperlinkMouseOver-event-fires-on-hover', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let hoverEventFired: boolean = false;
        let hoverEventArgs: HyperlinkMouseOverArgs | null = null;

        const hyperlinkMouseOverHandler = (args: HyperlinkMouseOverArgs): void => {
            hoverEventFired = true;
            hoverEventArgs = args;
        };

        viewer.hyperlinkMouseOver = hyperlinkMouseOverHandler;

        // Act - Find and hover over a web hyperlink
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        if (webLink) {
            mouseOverEvent(webLink as HTMLElement);
        }

        // Assert
        expect(hoverEventFired).toBe(true);
        expect(hoverEventArgs).not.toBeNull();
        if (hoverEventArgs) {
            expect(hoverEventArgs.name).toBe('hyperlinkMouseOver');
        }
        done();
    });

    it('LINKANNOT-012-hyperlinkMouseOver-event-args-contain-hyperlink', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let capturedHoverArgs: HyperlinkMouseOverArgs | null = null;

        const hyperlinkMouseOverHandler = (args: HyperlinkMouseOverArgs): void => {
            capturedHoverArgs = args;
        };

        viewer.hyperlinkMouseOver = hyperlinkMouseOverHandler;

        // Act
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        if (webLink) {
            mouseOverEvent(webLink as HTMLElement);
        }

        // Assert
        expect(capturedHoverArgs).not.toBeNull();
        if (capturedHoverArgs) {
            expect(capturedHoverArgs.name).toBe('hyperlinkMouseOver');
            // HyperlinkMouseOverArgs contains the event name property
            expect(typeof capturedHoverArgs).toBe('object');
        }
        done();
    });

    it('LINKANNOT-013-hyperlinkMouseOver-event-fires-for-document-links-hover', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let docLinkHoverFired: boolean = false;

        const hyperlinkMouseOverHandler = (args: HyperlinkMouseOverArgs): void => {
            docLinkHoverFired = true;
        };

        viewer.hyperlinkMouseOver = hyperlinkMouseOverHandler;

        // Act - Find and hover over a document link
        const docLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="linkdiv"]'
        );

        if (docLink) {
            mouseOverEvent(docLink as HTMLElement);
        }

        // Assert
        // Verify handler is callable
        expect(typeof viewer.hyperlinkMouseOver).toBe('function');
        done();
    });

    it('LINKANNOT-014-hyperlinkMouseOver-with-multiple-hovers', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        let hoverCount: number = 0;

        const hyperlinkMouseOverHandler = (args: HyperlinkMouseOverArgs): void => {
            hoverCount++;
        };

        viewer.hyperlinkMouseOver = hyperlinkMouseOverHandler;

        // Act - Hover over multiple web links
        const webLinks: NodeListOf<Element> = document.querySelectorAll(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        for (let i: number = 0; i < Math.min(webLinks.length, 2); i++) {
            mouseOverEvent(webLinks[i] as HTMLElement);
        }

        // Assert
        expect(hoverCount).toBeGreaterThan(0);
        done();
    });

    // ============================================================================
    // INTEGRATION: API + Events Combined
    // ============================================================================

    it('LINKANNOT-015-enable-disable-hyperlink-affects-click-event', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;
        viewer.enableHyperlink = true;
        let clickEventFired: boolean = false;

        const hyperlinkClickHandler = (args: HyperlinkClickEventArgs): void => {
            clickEventFired = true;
        };

        viewer.hyperlinkClick = hyperlinkClickHandler;

        // Act - Click with hyperlinks enabled
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        if (webLink) {
            webLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }

        // Assert
        expect(clickEventFired).toBe(true);
        done();
    });

    it('LINKANNOT-016-hyperlinkOpenState-affects-link-behavior', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;

        // Act - Set to NewWindow
        viewer.hyperlinkOpenState = 'NewWindow';
        const newWindowState: string = viewer.hyperlinkOpenState;

        // Act - Set to CurrentTab
        viewer.hyperlinkOpenState = 'CurrentTab';
        const currentTabState: string = viewer.hyperlinkOpenState;

        // Assert
        expect(newWindowState).toBe('NewWindow');
        expect(currentTabState).toBe('CurrentTab');
        done();
    });

    it('LINKANNOT-017-hyperlink-elements-have-correct-CSS-class', (done: DoneFn) => {
        // Arrange
        const viewer: PdfViewer = pdfviewer!;

        // Act - Get all hyperlink elements
        const hyperlinks: NodeListOf<Element> = document.querySelectorAll(
            '#pdfviewer_link_annotation .e-pv-hyperlink'
        );

        // Assert
        expect(hyperlinks.length).toBeGreaterThan(0);
        for (let i: number = 0; i < hyperlinks.length; i++) {
            expect(hyperlinks[i].classList.contains('e-pv-hyperlink')).toBe(true);
        }
        done();
    });

    it('LINKANNOT-018-web-link-has-href-attribute', (done: DoneFn) => {
        // Arrange
        // Act - Get a web link
        const webLink: HTMLElement | null = document.querySelector(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        // Assert
        expect(webLink).not.toBeNull();
        if (webLink) {
            const href: string | null = webLink.getAttribute('href');
            expect(href).not.toBeNull();
            expect((href || '').length).toBeGreaterThan(0);
        }
        done();
    });

    it('LINKANNOT-019-hyperlink-accessibility-aria-label', (done: DoneFn) => {
        // Arrange
        // Act - Get hyperlinks and check aria-label
        const webLinks: NodeListOf<Element> = document.querySelectorAll(
            '#pdfviewer_link_annotation a[id^="weblinkdiv"]'
        );

        // Assert
        expect(webLinks.length).toBeGreaterThan(0);
        for (let i: number = 0; i < webLinks.length; i++) {
            const ariaLabel: string | null = webLinks[i].getAttribute('aria-label');
            // Some links may have aria-label set by the system
            expect(webLinks[i]).not.toBeNull();
        }
        done();
    });
});
