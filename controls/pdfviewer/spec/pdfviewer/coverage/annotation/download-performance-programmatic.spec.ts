import { createElement } from '@syncfusion/ej2-base';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print,
    Annotation, FormFields, FormDesigner, PageOrganizer, DynamicStampItem, SignStampItem, StandardBusinessStampItem,
    HighlightSettings,
    UnderlineSettings,
    StrikethroughSettings,
    SquigglySettings,
    FreeTextSettings,
    LineSettings,
    StampSettings,
    StickyNotesSettings,
    InkAnnotationSettings,
    RadiusSettings,
    VolumeSettings,
    AreaSettings,
    PerimeterSettings,
    DistanceSettings,
    PolygonSettings,
    CircleSettings,
    RectangleSettings,
    ArrowSettings, RedactionSettings
} from '../../../../src/index';
import { downloadAndReload, focusOutOnceWithoutNative, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, normalizeColor } from '../../utils.spec';
import { HELLO_PDF_B64, EMPTY_PDF_B64, HIGHLIGHT_B64, STICKYNOTES_B64, INK_B64, FREETEXT_B64, VOLUME_B64, RADIUS_B64, AREA_B64, PERIMETER_B64, DISTANCE_B64, POLYGON_B64, CIRCLE_B64, RECTANGLE_B64, ARROW_B64, LINE_B64, SQUIGGLY_B64, STRIKETHROUGH_B64, UNDERLINE_B64 } from '../../Data/pdf-data.spec';

// Task ID - 981641

// Step 3, 5, 6: Capture and compare annotation properties
function captureAnnotationData(viewer: PdfViewer): any {
    const annot = viewer.annotationCollection[viewer.annotationCollection.length - 1];
    const props = {
        type: annot.shapeAnnotationType,
        textMarkuptype: annot.textMarkupAnnotationType,
        icon: annot.icon,
        subject: annot.subject,
        indent: annot.indent,
        bounds: annot.bounds ? { width: annot.bounds.width ? annot.bounds.width : annot.bounds.Width, height: annot.bounds.height ? annot.bounds.height : annot.bounds.Height, left: annot.bounds.left ? annot.bounds.left : annot.bounds.Left, top: annot.bounds.top ? annot.bounds.top : annot.bounds.Top, x: annot.bounds.x ? annot.bounds.x : annot.bounds.X, y: annot.bounds.y ? annot.bounds.y : annot.bounds.Y } : undefined,
        pageNumber: annot.pageNumber,
        strokeColor: annot.strokeColor,
        fillColor: annot.fillColor,
        stampFillcolor: annot.stampFillcolor,
        thickness: annot.thickness,
        opacity: annot.opacity,
        fontFamily: annot.fontFamily,
        fontSize: annot.fontSize,
        overlayText: annot.overlayText,
        markerFillColor: annot.markerFillColor,
        markerBorderColor: annot.markerBorderColor,
        markerOpacity: annot.markerOpacity,
        vertexPoints: annot.vertexPoints ? annot.vertexPoints.map((p: any) => ({ x: p.x, y: p.y })) : undefined
    };
    return props;
}


// TEXT MARKUP - Highlight
describe('PDF_Viewer_TextMarkup_Programmatic_Highlight_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-001 - Highlight persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_highlight_Programmatic_text_0_0');
        viewer.annotation.addAnnotation('Highlight', {
            bounds: [{ x: 98.19998173333333, y: 101.1875, width: 34.616516133333334, height: 12 }],
            pageNumber: 1
        } as HighlightSettings);
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Highlight');
        const baselineData = captureAnnotationData(viewer);
        const beforeBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.textMarkuptype).toBe(baselineData.textMarkuptype);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        const afterBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        expect(afterBounds.length).toBeGreaterThanOrEqual(beforeBounds.length);
        for (let i = 0; i < beforeBounds.length; i++) {
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].Width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].Height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].Left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].Top, 6);
        }

    });
});

// TEXT MARKUP - Underline
describe('PDF_Viewer_TextMarkup_Programmatic_Underline_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-002 - Underline persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_underline_Programmatic_text_0_0');
        viewer.annotation.addAnnotation('Underline', {
            bounds: [{ x: 98.19998173333333, y: 101.1875, width: 34.616516133333334, height: 12 }],
            pageNumber: 1
        } as UnderlineSettings);
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Underline');
        const baselineData = captureAnnotationData(viewer);
        const beforeBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.textMarkuptype).toBe(baselineData.textMarkuptype);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        const afterBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        expect(afterBounds.length).toBeGreaterThanOrEqual(beforeBounds.length);
        for (let i = 0; i < beforeBounds.length; i++) {
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].Width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].Height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].Left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].Top, 6);
        }
    });
});

// TEXT MARKUP - Strikethrough
describe('PDF_Viewer_TextMarkup_Programmatic_Strikethrough_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-003 - Strikethrough persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_strikethrough_Programmatic_text_0_0');
        viewer.annotation.addAnnotation('Strikethrough', {
            bounds: [{ x: 98.19998173333333, y: 101.1875, width: 34.616516133333334, height: 12 }],
            pageNumber: 1
        } as StrikethroughSettings);
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Strikethrough');
        const baselineData = captureAnnotationData(viewer);
        const beforeBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.textMarkuptype).toBe(baselineData.textMarkuptype);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        const afterBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        expect(afterBounds.length).toBeGreaterThanOrEqual(beforeBounds.length);
        for (let i = 0; i < beforeBounds.length; i++) {
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].Width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].Height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].Left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].Top, 6);
        }
    });
});

// TEXT MARKUP - Squiggly
describe('PDF_Viewer_TextMarkup_Programmatic_Squiggly_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-004 - Squiggly persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_squiggly_Programmatic_text_0_0');
        viewer.annotation.addAnnotation('Squiggly', {
            bounds: [{ x: 98.19998173333333, y: 101.1875, width: 34.616516133333334, height: 12 }],
            pageNumber: 1
        } as SquigglySettings);
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Squiggly');
        const baselineData = captureAnnotationData(viewer);
        const beforeBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.textMarkuptype).toBe(baselineData.textMarkuptype);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        const afterBounds = viewer.annotationCollection[viewer.annotationCollection.length - 1].bounds;
        expect(afterBounds.length).toBeGreaterThanOrEqual(beforeBounds.length);
        for (let i = 0; i < beforeBounds.length; i++) {
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].Width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].Height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].Left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].Top, 6);
        }
    });
});

// FREE TEXT (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_FreeText_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-005 - FreeText persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_freetext_Programmatic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const annotationAdded = new Promise<void>((resolve) => {
            viewer!.annotationAdd = () => resolve();
        });
        viewer.annotation.addAnnotation('FreeText', {
            offset: { x: 120, y: 80 },
            fontSize: 16,
            fontFamily: 'Helvetica',
            pageNumber: 1,
            width: 200,
            height: 40,
            isLock: false,
            defaultText: 'Syncfusion'
        } as FreeTextSettings);
        // Wait for annotationAdd event
        await annotationAdded;
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('FreeText');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeLessThanOrEqual(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});

// SHAPES (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Shapes_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_shapes_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_shapes_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_shapes_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-006 - Line persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_shapes_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Line', {
            offset: { x: 200, y: 230 },
            pageNumber: 1,
            vertexPoints: [{ x: 200, y: 230 }, { x: 350, y: 230 }]
        } as LineSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Line');
        expect(last.subject).toBe('Line');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-007 - Arrow persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_shapes_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Arrow', {
            offset: { x: 200, y: 370 },
            pageNumber: 1,
            vertexPoints: [{ x: 200, y: 370 }, { x: 350, y: 370 }]
        } as ArrowSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Line');
        expect(last.subject).toBe('Arrow');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-008 - Rectangle persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_shapes_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Rectangle', {
            offset: { x: 200, y: 480 },
            pageNumber: 1,
            width: 150,
            height: 75
        } as RectangleSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Square');
        expect(last.subject).toBe('Rectangle');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-009 - Circle persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_shapes_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Circle', {
            offset: { x: 200, y: 620 },
            pageNumber: 1,
            width: 90,
            height: 90
        } as CircleSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Circle');
        expect(last.subject).toBe('Circle');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);;
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-010 - Polygon persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_shapes_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Polygon', {
            offset: { x: 200, y: 800 },
            pageNumber: 1,
            vertexPoints: [
                { x: 200, y: 800 }, { x: 242, y: 771 }, { x: 289, y: 799 },
                { x: 278, y: 842 }, { x: 211, y: 842 }, { x: 200, y: 800 }
            ]
        } as PolygonSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polygon');
        expect(last.subject).toBe('Polygon');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });
});

// MEASUREMENTS (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Measurements_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_measurements_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_measurements_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_measurements_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-011 - Distance persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_measurements_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Distance', {
            offset: { x: 200, y: 230 },
            pageNumber: 1,
            vertexPoints: [{ x: 200, y: 230 }, { x: 350, y: 230 }]
        } as DistanceSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Line');
        expect(last.subject).toBe('Line');
        expect(last.indent).toBe('LineDimension');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-012 - Perimeter persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_measurements_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Perimeter', {
            offset: { x: 200, y: 350 },
            pageNumber: 1,
            vertexPoints: [
                { x: 200, y: 350 },
                { x: 285, y: 350 },
                { x: 286, y: 412 }
            ]
        } as PerimeterSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polyline');
        expect(last.subject).toBe('Arrow');
        expect(last.indent).toBe('PolyLineDimension');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-013 - Area persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_measurements_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Area', {
            offset: { x: 200, y: 500 },
            pageNumber: 1,
            vertexPoints: [
                { x: 200, y: 500 }, { x: 288, y: 499 }, { x: 289, y: 553 }, { x: 200, y: 500 }
            ]
        } as AreaSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polygon');
        expect(last.subject).toBe('Rectangle');
        expect(last.indent).toBe('PolygonDimension');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-014 - Volume persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_measurements_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Volume', {
            offset: { x: 200, y: 810 },
            pageNumber: 1,
            vertexPoints: [
                { x: 200, y: 810 }, { x: 200, y: 919 }, { x: 320, y: 919 },
                { x: 320, y: 809 }, { x: 200, y: 810 }
            ]
        } as VolumeSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polygon');
        expect(last.subject).toBe('Polygon');
        expect(last.indent).toBe('PolygonVolume');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.vertexPoints.length).toBeGreaterThanOrEqual(baselineData.vertexPoints.length);
        for (let i = 0; i < baselineData.vertexPoints.length; i++) {
            expect(reloadedData.vertexPoints[i].x).toBeCloseTo(baselineData.vertexPoints[i].x, 3);
            expect(reloadedData.vertexPoints[i].y).toBeCloseTo(baselineData.vertexPoints[i].y, 3);
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-015 - Radius persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_measurements_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Radius', {
            offset: { x: 200, y: 630 },
            pageNumber: 1,
            width: 90,
            height: 90
        } as RadiusSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Circle');
        expect(last.subject).toBe('Circle');
        expect(last.indent).toBe('PolygonRadius');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});

// INK (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Ink_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-016 - Ink persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_ink_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Ink', {
            offset: { x: 150, y: 100 },
            pageNumber: 1,
            width: 200,
            height: 60,
            path: '[{"command":"M","x":244.83,"y":981.00},{"command":"L","x":250.83,"y":953.33}]'
        } as InkAnnotationSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Ink');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));

        // thickness and opacity tolerant numeric asserts
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.x).toBeCloseTo(baselineData.bounds.x, 6);
        expect(reloadedData.bounds.y).toBeCloseTo(baselineData.bounds.y, 6);
    });
});

// STICKY NOTES (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_StickyNotes_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_sticky_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_sticky_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_sticky_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-017 - StickyNote persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        viewer.annotation.addAnnotation('StickyNotes', {
            offset: { x: 100, y: 200 },
            pageNumber: 1,
            author: 'TestUser'
        } as StickyNotesSettings);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('sticky');
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});

// STAMP - DYNAMIC (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Stamp_Dynamic_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_dynamic_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_dynamic_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_dynamic_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-018 - Stamp Dynamic-Revised persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 140 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.Revised);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Revised');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-019 - Stamp Dynamic-Reviewed persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 240 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.Reviewed);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Reviewed');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-020 - Stamp Dynamic-Received persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 340 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.Received);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Received');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-021 - Stamp Dynamic-Approved persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 440 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.Approved);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Approved');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-022 - Stamp Dynamic-Confidential persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 140 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.Confidential);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Confidential');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-023 - Stamp Dynamic-NotApproved persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_dynamic_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 240 },
            pageNumber: 1
        } as StampSettings, DynamicStampItem.NotApproved);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Not Approved');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });
});

// STAMP - SIGN HERE (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Stamp_SignHere_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_sign_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_sign_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_sign_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-024 - Stamp SignHere-Witness persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_sign_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 140 },
            pageNumber: 1
        } as StampSettings, undefined, SignStampItem.Witness);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Witness');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-025 - Stamp SignHere-InitialHere persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_sign_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 240 },
            pageNumber: 1
        } as StampSettings, undefined, SignStampItem.InitialHere);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Initial Here');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-026 - Stamp SignHere-SignHere persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_sign_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 340 },
            pageNumber: 1
        } as StampSettings, undefined, SignStampItem.SignHere);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Sign Here');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-027 - Stamp SignHere-Accepted persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_sign_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 440 },
            pageNumber: 1
        } as StampSettings, undefined, SignStampItem.Accepted);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Accepted');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-028 - Stamp SignHere-Rejected persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_sign_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 540 },
            pageNumber: 1
        } as StampSettings, undefined, SignStampItem.Rejected);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Rejected');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });
});

// STAMP - BUSINESS (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Programmatic_Stamp_Business_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_business_Programmatic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_business_Programmatic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_business_Programmatic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-029 - Stamp Business-Approved persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 140 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Approved);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Approved');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-030 - Stamp Business-NotApproved persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 240 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.NotApproved);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Not Approved');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-031 - Stamp Business-Draft persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 340 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Draft);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Draft');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-032 - Stamp Business-Final persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 440 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Final);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Final');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-033 - Stamp Business-Completed persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 540 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Completed);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Completed');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-034 - Stamp Business-Confidential persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 140 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Confidential);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Confidential');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-035 - Stamp Business-ForPublicRelease persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 240 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.ForPublicRelease);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('For Public Release');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-036 - Stamp Business-NotForPublicRelease persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 340 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.NotForPublicRelease);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Not For Public Release');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-037 - Stamp Business-ForComment persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 440 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.ForComment);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('For Comment');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-038 - Stamp Business-Void persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 200, y: 540 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.Void);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Void');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-039 - Stamp Business-PreliminaryResults persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 540 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.PreliminaryResults);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Preliminary Results');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-040 - Stamp Business-InformationOnly persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_stamp_business_Programmatic_textLayer_0');
        viewer.annotation.addAnnotation('Stamp', {
            offset: { x: 400, y: 640 },
            pageNumber: 1
        } as StampSettings, undefined, undefined, StandardBusinessStampItem.InformationOnly);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('stamp');
        expect(last.icon).toBe('Information Only');
        const uniqueKey = viewer.annotationCollection[viewer.annotationCollection.length - 1].uniqueKey;
        const beforebounds = (viewer.nameTable as any)[uniqueKey].wrapper.bounds;
        const baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        const afterbounds = (viewer.nameTable as any)[uniqueKey].wrapper.children[0].bounds;
        expect(afterbounds.width).toBeCloseTo(beforebounds.width, 2);
        expect(afterbounds.height).toBeCloseTo(beforebounds.height, 2);
        expect(afterbounds.x).toBeCloseTo(beforebounds.x, 2);
        expect(afterbounds.y).toBeCloseTo(beforebounds.y, 2);
        const reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.icon).toBe(baselineData.icon);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
    });
});

describe('PDF_Viewer_TextMarkup_highlight_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-001 - Highlight opacity persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Underline_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Underline opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Strikethrough opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Squiggly opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Line_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Line opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Arrow_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Arrow opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Rectangle_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Rectangle opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Circle_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Circle opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Polygon_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Polygon opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Distance_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Distance opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Perimeter opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Area_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Area opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Radius_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Radius opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Volume_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Volume opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_FreeText_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 - ProgrammaticFree Text opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_ink_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic Ink opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_stickyNotes_Programmatic_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stickyNotes_Programmatic_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STICKYNOTES_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stickyNotes_Programmatic_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stickyNotes_Programmatic_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Programmatic stickyNotes opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('sticky');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity = 0.4;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(0.4);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Line_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Line thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Arrow_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Arrow thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Rectangle_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Rectangle thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Circle_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Circle thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Polygon_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Polygon thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Distance_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Distance thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Perimeter thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Area_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Area thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Radius_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Radius thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Volume_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Volume thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_FreeText_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 - ProgrammaticFree Text thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(0);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_ink_Programmatic_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Programmatic_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Programmatic_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Programmatic_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Programmatic Ink thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness = 3;
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(3);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_TextMarkup_highlight_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-001 - Highlight fillColor persists after download and reload Programmatically', async () => {
        if (!viewer) return;
        const annotations = viewer.annotationCollection[viewer.annotationCollection.length - 1];
        expect(annotations).toBeDefined();
        expect(annotations.shapeAnnotationType).toBe('textMarkup');
        expect(annotations.textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ffdf56");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].color = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        expect(afterfillColor).toBe(beforefillColor);
    });
});
describe('PDF_Viewer_TextMarkup_Underline_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Underline fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#00ff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].color = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        expect(afterfillColor).toBe(beforefillColor);
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Strikethrough fillColor persists after download and reload', async () => {

        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ff0000");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].color = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        expect(afterfillColor).toBe(beforefillColor);
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Squiggly fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ff0000");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].color = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].color;
        expect(afterfillColor).toBe(beforefillColor);
    });
});
describe('PDF_Viewer_Shape_Arrow_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Arrow fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Shape_Rectangle_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Rectangle fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Shape_Circle_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Circle fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Shape_Polygon_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Polygon fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Measurement_Distance_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Distance fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Perimeter fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Measurement_Area_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Area fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Measurement_Radius_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Radius fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
describe('PDF_Viewer_Measurement_Volume_Programmatic_Update_fillColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Programmatic_Update_fillColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Programmatic_Update_fillColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Programmatic_Update_fillColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-fillColor-001 -Programmatic Volume fillColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
        expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
    });
});
// describe('PDF_Viewer_FreeText_Programmatic_Update_fillColor_981641', () => {
//     let viewer: PdfViewer | null = null;
//     PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
//     beforeAll((done: DoneFn) => {
//         const element = createElement('div', { id: 'pdfviewer_freeText_Programmatic_Update_fillColor' });
//         document.body.appendChild(element);
//         viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
//         viewer.documentLoad = () => done();
//         viewer.appendTo('#pdfviewer_freeText_Programmatic_Update_fillColor');
//     });
//     afterAll(() => {
//         if (viewer) {
//             viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Programmatic_Update_fillColor'); if (el && el.parentNode) {
//                 el.parentNode.removeChild(el);
//             } viewer = null;
//         }
//     });
//      it('981641-Change-fillColor-001 - ProgrammaticFree Text fillColor persists after download and reload', async () => {
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("rgba(0,0,0,0)");
//         viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor = '#e91e63';
//         viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
//         const beforefillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
//         await downloadAndReload(viewer);
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
//         const afterfillColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor;
//         expect(normalizeColor(afterfillColor)).toBe(normalizeColor(beforefillColor));
//     });
// });
describe('PDF_Viewer_Shape_Line_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Line strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Shape_Arrow_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Arrow strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Shape_Rectangle_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Rectangle strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Shape_Circle_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Circle strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Shape_Polygon_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Polygon strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Measurement_Distance_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Distance strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Perimeter strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Measurement_Area_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Area strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Measurement_Radius_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Radius strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_Measurement_Volume_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Volume strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_FreeText_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 - ProgrammaticFree Text strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("rgba(0,0,0,1)");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_ink_Programmatic_Update_strokeColor_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Programmatic_Update_strokeColor' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Programmatic_Update_strokeColor');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Programmatic_Update_strokeColor'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-strokeColor-001 -Programmatic Ink strokeColor persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("rgba(255,0,0,1)");
        viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor = '#009688';
        viewer.annotation.editAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1]);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        const beforestrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterstrokeColor = viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor;
        expect(normalizeColor(afterstrokeColor)).toBe(normalizeColor(beforestrokeColor));
    });
});
describe('PDF_Viewer_TextMarkup_Highlight_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 - Highlight is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Underline_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 - Underline is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 - Strikethrough is removed after download and reload', async () => {

        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 - Squiggly is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Line_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Line is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Arrow_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Arrow is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Rectangle_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Rectangle is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Circle_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Circle is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Polygon_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Polygon is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Distance_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Distance is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Perimeter is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Area_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Area is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Radius_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Radius is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Volume_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Volume is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_FreeText_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Free Text is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_ink_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Ink is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_stickyNotes_programmatic_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stickyNotes_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STICKYNOTES_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stickyNotes_programmatic_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stickyNotes_programmatic_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -stickyNotes is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('sticky');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});