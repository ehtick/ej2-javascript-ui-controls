import { createElement } from '@syncfusion/ej2-base';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print,
    Annotation, FormFields, FormDesigner, PageOrganizer, DynamicStampItem, SignStampItem, StandardBusinessStampItem
} from '../../../../src/index';
import { downloadAndReload, focusOutOnceWithoutNative, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, normalizeColor, waitFor } from '../../utils.spec';
import { HELLO_PDF_B64, EMPTY_PDF_B64, HIGHLIGHT_B64, UNDERLINE_B64, STRIKETHROUGH_B64, SQUIGGLY_B64, ARROW_B64, RECTANGLE_B64, CIRCLE_B64, POLYGON_B64, DISTANCE_B64, AREA_B64, RADIUS_B64, VOLUME_B64, FREETEXT_B64, LINE_B64, PERIMETER_B64, INK_B64, DYNAMIC_STAMP_B64, SIGN_STAMP_B64, STANDARD_STAMP_B64, STICKYNOTES_B64 } from '../../Data/pdf-data.spec';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

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
        bounds: annot.bounds ? { width: annot.bounds.width ? annot.bounds.width : annot.bounds.Width, height: annot.bounds.height ? annot.bounds.height : annot.bounds.Height, left: annot.bounds.left ? annot.bounds.left : annot.bounds.Left, top: annot.bounds.top ? annot.bounds.top : annot.bounds.Top, x: annot.bounds.x ? annot.bounds.x : annot.bounds.X, y: annot.bounds.y ? annot.bounds.y : annot.bounds.Y} : undefined,
        pageNumber: annot.pageNumber,
        strokeColor: annot.strokeColor,
        fillColor: annot.fillColor,
        stampFillcolor: annot.stampFillcolor,
        thickness: annot.thickness,
        opacity: annot.opacity,
        markerFillColor: annot.markerFillColor,
            markerBorderColor: annot.markerBorderColor,
            markerOpacity: annot.markerOpacity,
            fontFamily: annot.fontFamily,
            fontSize: annot.fontSize,
            overlayText: annot.overlayText,
        vertexPoints: annot.vertexPoints ? annot.vertexPoints.map((p: any) => ({ x: p.x, y: p.y })) : undefined
        };
    return props;
}


// TEXT MARKUP - Highlight
describe('PDF_Viewer_TextMarkup_Highlight_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-001 - Highlight persists after download and reload', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_highlight_text_0_0');
        const startingElement = document.getElementById('pdfviewer_highlight_text_0_0');
        const endingElement = document.getElementById('pdfviewer_highlight_text_0_4');
        const range = document.createRange();
        range.selectNodeContents(startingElement);
        // Set the start position at the beginning of the starting element
        range.setStart(startingElement, 0);
        // Set the end position at the end of the ending element
        range.setEnd(endingElement, endingElement.childNodes.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        viewer.annotation.setAnnotationMode('Highlight');
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
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].top, 6);
        }

    });
});

// TEXT MARKUP - Underline
describe('PDF_Viewer_TextMarkup_Underline_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-002 - Underline persists after download and reload', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_underline_text_0_0');
        const startingElement = document.getElementById('pdfviewer_underline_text_0_0');
        const endingElement = document.getElementById('pdfviewer_underline_text_0_4');
        const range = document.createRange();
        range.selectNodeContents(startingElement);
        // Set the start position at the beginning of the starting element
        range.setStart(startingElement, 0);
        // Set the end position at the end of the ending element
        range.setEnd(endingElement, endingElement.childNodes.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        viewer.annotation.setAnnotationMode('Underline');
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
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].top, 6);
        }
    });
});

// TEXT MARKUP - Strikethrough
describe('PDF_Viewer_TextMarkup_Strikethrough_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-003 - Strikethrough persists after download and reload', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_strikethrough_text_0_0');
        const startingElement = document.getElementById('pdfviewer_strikethrough_text_0_0');
        const endingElement = document.getElementById('pdfviewer_strikethrough_text_0_4');
        const range = document.createRange();
        range.selectNodeContents(startingElement);
        // Set the start position at the beginning of the starting element
        range.setStart(startingElement, 0);
        // Set the end position at the end of the ending element
        range.setEnd(endingElement, endingElement.childNodes.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        viewer.annotation.setAnnotationMode('Strikethrough');
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
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].top, 6);
        }
    });
});

// TEXT MARKUP - Squiggly
describe('PDF_Viewer_TextMarkup_Squiggly_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-004 - Squiggly persists after download and reload', async () => {
        if (!viewer) return;
        const el = document.getElementById('pdfviewer_squiggly_text_0_0');
        const startingElement = document.getElementById('pdfviewer_squiggly_text_0_0');
        const endingElement = document.getElementById('pdfviewer_squiggly_text_0_4');
        const range = document.createRange();
        range.selectNodeContents(startingElement);
        // Set the start position at the beginning of the starting element
        range.setStart(startingElement, 0);
        // Set the end position at the end of the ending element
        range.setEnd(endingElement, endingElement.childNodes.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        viewer.annotation.setAnnotationMode('Squiggly');
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
            expect(afterBounds[i].Width).toBeCloseTo(beforeBounds[i].width, 6);
            expect(afterBounds[i].Height).toBeCloseTo(beforeBounds[i].height, 6);
            expect(afterBounds[i].Left).toBeCloseTo(beforeBounds[i].left, 6);
            expect(afterBounds[i].Top).toBeCloseTo(beforeBounds[i].top, 6);
        }
    });
});

// FREE TEXT (uses EMPTY_PDF_B64)
describe('PDF_Viewer_FreeText_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-005 - FreeText persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('FreeText');
        const target = getTarget('#pdfviewer_freetext_textLayer_0');
        const rect = target.getBoundingClientRect();
        const annotationAdded = new Promise<void>((resolve) => {
            viewer!.annotationAdd = () => resolve();
        });
        const x = Math.round(rect.left + rect.width / 2);
        const y = Math.round(rect.top + rect.height / 2);
        mouseMoveEvent(target, x, y);
        mouseDownEvent(target, x, y);
        mouseUpEvent(target, x, y);
        const inputBox: HTMLElement = document.querySelector('.free-text-input') as HTMLElement;
        focusOutOnceWithoutNative(inputBox);
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
        expect(reloadedData.thickness).toBeCloseTo(baselineData.thickness, 6);
        expect(reloadedData.opacity).toBeCloseTo(baselineData.opacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});

// SHAPES (uses EMPTY_PDF_B64)
describe('PDF_Viewer_Shapes_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_shapes' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_shapes');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_shapes'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-006 - Line persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Line');
        const target = getTarget('#pdfviewer_shapes_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = Math.round(rect.left + 50);
        const sy = Math.round(rect.top + 80);
        const ex = Math.round(rect.left + 200);
        const ey = Math.round(rect.top + 80);
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        mouseMoveEvent(target, ex, ey);
        mouseUpEvent(target, ex, ey);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-007 - Arrow persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Arrow');
        const target = getTarget('#pdfviewer_shapes_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = Math.round(rect.left + 60);
        const sy = Math.round(rect.top + 140);
        const ex = Math.round(rect.left + 220);
        const ey = Math.round(rect.top + 140);
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        mouseMoveEvent(target, ex, ey);
        mouseUpEvent(target, ex, ey);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-008 - Rectangle persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Rectangle');
        const target = getTarget('#pdfviewer_shapes_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = Math.round(rect.left + 260);
        const sy = Math.round(rect.top + 80);
        const ex = Math.round(rect.left + 360);
        const ey = Math.round(rect.top + 140);

        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        // interpolate a few moves to mimic drag
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(sx + (ex - sx) * t);
            const y = Math.round(sy + (ey - sy) * t);
            mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-009 - Circle persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Circle');
        const target = getTarget('#pdfviewer_shapes_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = Math.round(rect.left + 260);
        const sy = Math.round(rect.top + 200);
        const ex = Math.round(rect.left + 340);
        const ey = Math.round(rect.top + 260);

        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(sx + (ex - sx) * t);
            const y = Math.round(sy + (ey - sy) * t);
            mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-010 - Polygon persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Polygon');
        const target = getTarget('#pdfviewer_shapes_textLayer_0');
        const rect = target.getBoundingClientRect();
        const aX = Math.round(rect.left + 125); // top center
        const aY = Math.round(rect.top + 40);

        const bX = Math.round(rect.left + 200); // upper right
        const bY = Math.round(rect.top + 90);

        const cX = Math.round(rect.left + 170); // lower right
        const cY = Math.round(rect.top + 160);

        const dX = Math.round(rect.left + 80);  // lower left
        const dY = Math.round(rect.top + 160);

        const eX = Math.round(rect.left + 50);  // upper left
        const eY = Math.round(rect.top + 90);

        // Draw AB
        mouseMoveEvent(target, aX, aY);
        mouseDownEvent(target, aX, aY);
        mouseMoveEvent(target, bX, bY);
        mouseUpEvent(target, bX, bY);

        // Draw BC
        mouseMoveEvent(target, bX, bY);
        mouseDownEvent(target, bX, bY);
        mouseMoveEvent(target, cX, cY);
        mouseUpEvent(target, cX, cY);

        // Draw CD
        mouseMoveEvent(target, cX, cY);
        mouseDownEvent(target, cX, cY);
        mouseMoveEvent(target, dX, dY);
        mouseUpEvent(target, dX, dY);

        // Draw DE
        mouseMoveEvent(target, dX, dY);
        mouseDownEvent(target, dX, dY);
        mouseMoveEvent(target, eX, eY);
        mouseUpEvent(target, eX, eY);

        // Draw EA (closing polygon)
        mouseMoveEvent(target, eX, eY);
        mouseDownEvent(target, eX, eY);
        mouseMoveEvent(target, aX, aY);
        mouseUpEvent(target, aX, aY);
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
describe('PDF_Viewer_Measurements_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_measurements' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_measurements');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_measurements'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-011 - Distance persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Distance');
        const target = getTarget('#pdfviewer_measurements_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = rect.left + 50, sy = rect.top + 80;
        const ex = rect.left + 220, ey = rect.top + 80;
        mouseDownEvent(target, sx, sy);
        mouseMoveEvent(target, ex, ey);
        mouseUpEvent(target, ex, ey);
        const clickX = (sx + ex) / 2;
        const clickY = (sy + ey) / 2;
        mouseDownEvent(target, clickX, clickY);
        mouseUpEvent(target, clickX, clickY);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Line');
        expect(last.subject).toBe('Distance calculation');
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-012 - Perimeter persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Perimeter');
        const target = getTarget('#pdfviewer_measurements_textLayer_0');
        const rect = target.getBoundingClientRect();
        const aX = Math.round(rect.left + 100);
        const aY = Math.round(rect.top + 50);

        const bX = Math.round(rect.left + 200);
        const bY = Math.round(rect.top + 150);

        const cX = Math.round(rect.left + 50);
        const cY = Math.round(rect.top + 150);

        // Draw AB
        mouseMoveEvent(target, aX, aY);
        mouseDownEvent(target, aX, aY);
        mouseMoveEvent(target, bX, bY);
        mouseUpEvent(target, bX, bY);

        // Draw BC
        mouseMoveEvent(target, bX, bY);
        mouseDownEvent(target, bX, bY);
        mouseMoveEvent(target, cX, cY);
        mouseUpEvent(target, cX, cY);

        // Draw CA (closing triangle)
        mouseMoveEvent(target, cX, cY);
        mouseDownEvent(target, cX, cY);
        mouseMoveEvent(target, aX, aY);
        mouseUpEvent(target, aX, aY);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polyline');
        expect(last.subject).toBe('Perimeter calculation');
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-013 - Area persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Area');
        const target = getTarget('#pdfviewer_measurements_textLayer_0');
        const rect = target.getBoundingClientRect();
        const aX = Math.round(rect.left + 100);
        const aY = Math.round(rect.top + 200);

        const bX = Math.round(rect.left + 200);
        const bY = Math.round(rect.top + 300);

        const cX = Math.round(rect.left + 50);
        const cY = Math.round(rect.top + 300);

        // Draw AB
        mouseMoveEvent(target, aX, aY);
        mouseDownEvent(target, aX, aY);
        mouseMoveEvent(target, bX, bY);
        mouseUpEvent(target, bX, bY);

        // Draw BC
        mouseMoveEvent(target, bX, bY);
        mouseDownEvent(target, bX, bY);
        mouseMoveEvent(target, cX, cY);
        mouseUpEvent(target, cX, cY);

        // Draw CA (closing triangle)
        mouseMoveEvent(target, cX, cY);
        mouseDownEvent(target, cX, cY);
        mouseMoveEvent(target, aX, aY);
        mouseUpEvent(target, aX, aY);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polygon');
        expect(last.subject).toBe('Area calculation');
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-014 - Volume persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Volume');
        const target = getTarget('#pdfviewer_measurements_textLayer_0');
        const rect = target.getBoundingClientRect();
        const aX = Math.round(rect.left + 300);
        const aY = Math.round(rect.top + 50);

        const bX = Math.round(rect.left + 400);
        const bY = Math.round(rect.top + 50);

        const cX = Math.round(rect.left + 400);
        const cY = Math.round(rect.top + 150);

        const dX = Math.round(rect.left + 300);
        const dY = Math.round(rect.top + 150);

        // Draw AB
        mouseMoveEvent(target, aX, aY);
        mouseDownEvent(target, aX, aY);
        mouseMoveEvent(target, bX, bY);
        mouseUpEvent(target, bX, bY);

        // Draw BC
        mouseMoveEvent(target, bX, bY);
        mouseDownEvent(target, bX, bY);
        mouseMoveEvent(target, cX, cY);
        mouseUpEvent(target, cX, cY);

        // Draw CD
        mouseMoveEvent(target, cX, cY);
        mouseDownEvent(target, cX, cY);
        mouseMoveEvent(target, dX, dY);
        mouseUpEvent(target, dX, dY);

        // Draw DA (closing quadrilateral)
        mouseMoveEvent(target, dX, dY);
        mouseDownEvent(target, dX, dY);
        mouseMoveEvent(target, aX, aY);
        mouseUpEvent(target, aX, aY);

        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Polygon');
        expect(last.subject).toBe('Volume calculation');
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-015 - Radius persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Radius');
        const target = getTarget('#pdfviewer_measurements_textLayer_0');
        const rect = target.getBoundingClientRect();
        const sx = rect.left + 60, sy = rect.top + 260;
        const ex = rect.left + 120, ey = rect.top + 320;
        mouseDownEvent(target, sx, sy);
        const steps = 8;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(sx + (ex - sx) * t);
            const y = Math.round(sy + (ey - sy) * t);
            mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
        const annotations = viewer!.annotationCollection || [];
        const last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Circle');
        expect(last.subject).toBe('Radius calculation');
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
describe('PDF_Viewer_Ink_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-016 - Ink persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Ink');
        const target = getTarget('#pdfviewer_ink_textLayer_0');
        const rect = target.getBoundingClientRect();
        const startX1 = rect.left + 60, startY1 = rect.top + 60;
        const endX1 = rect.left + 200, endY1 = rect.top + 120;
        mouseDownEvent(target, startX1, startY1);
        mouseMoveEvent(target, rect.left + 120, rect.top + 80);
        mouseMoveEvent(target, rect.left + 160, rect.top + 100);
        mouseUpEvent(target, endX1, endY1);
        viewer.annotation.setAnnotationMode('None');
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

// // STICKY NOTES (uses EMPTY_PDF_B64)
describe('PDF_Viewer_StickyNotes_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_sticky' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_sticky');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_sticky'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-017 - StickyNote persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('StickyNotes');
        const target = getTarget('#pdfviewer_sticky_textLayer_0');
        const rect = target.getBoundingClientRect();
        const annotationAdded = new Promise<void>((resolve) => {
            viewer!.annotationAdd = () => resolve();
        });
        var x = Math.round(rect.left + 100);
        var y = Math.round(rect.top + 100);
        mouseDownEvent(target, x, y);
        mouseUpEvent(target, x, y);
        await annotationAdded;
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
describe('PDF_Viewer_Stamp_Dynamic_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_dynamic' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_dynamic');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_dynamic'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-018 - Stamp Dynamic-Revised persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.Revised);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 100, cy + 100);
        mouseDownEvent(target, cx + 100, cy + 100);
        mouseUpEvent(target, cx + 100, cy + 100);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-019 - Stamp Dynamic-Reviewed persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.Reviewed);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 180, cy + 150);
        mouseDownEvent(target, cx + 180, cy + 150);
        mouseUpEvent(target, cx + 180, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-020 - Stamp Dynamic-Received persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.Received);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 210, cy + 150);
        mouseDownEvent(target, cx + 210, cy + 150);
        mouseUpEvent(target, cx + 210, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-021 - Stamp Dynamic-Approved persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.Approved);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 240, cy + 150);
        mouseDownEvent(target, cx + 240, cy + 150);
        mouseUpEvent(target, cx + 240, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-022 - Stamp Dynamic-Confidential persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.Confidential);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 270, cy + 150);
        mouseDownEvent(target, cx + 270, cy + 150);
        mouseUpEvent(target, cx + 270, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-023 - Stamp Dynamic-NotApproved persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', DynamicStampItem.NotApproved);
        const target = getTarget('#pdfviewer_stamp_dynamic_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 300, cy + 150);
        mouseDownEvent(target, cx + 300, cy + 150);
        mouseUpEvent(target, cx + 300, cy + 150);
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
describe('PDF_Viewer_Stamp_SignHere_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_sign' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_sign');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_sign'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-024 - Stamp SignHere-Witness persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, SignStampItem.Witness);
        const target = getTarget('#pdfviewer_stamp_sign_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 100, cy + 150);
        mouseDownEvent(target, cx + 100, cy + 150);
        mouseUpEvent(target, cx + 100, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-025 - Stamp SignHere-InitialHere persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, SignStampItem.InitialHere);
        const target = getTarget('#pdfviewer_stamp_sign_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 150, cy + 150);
        mouseDownEvent(target, cx + 150, cy + 150);
        mouseUpEvent(target, cx + 150, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-026 - Stamp SignHere-SignHere persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, SignStampItem.SignHere);
        const target = getTarget('#pdfviewer_stamp_sign_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 200, cy + 150);
        mouseDownEvent(target, cx + 200, cy + 150);
        mouseUpEvent(target, cx + 200, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-027 - Stamp SignHere-Accepted persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, SignStampItem.Accepted);
        const target = getTarget('#pdfviewer_stamp_sign_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 250, cy + 150);
        mouseDownEvent(target, cx + 250, cy + 150);
        mouseUpEvent(target, cx + 250, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-028 - Stamp SignHere-Rejected persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, SignStampItem.Rejected);
        const target = getTarget('#pdfviewer_stamp_sign_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 300, cy + 150);
        mouseDownEvent(target, cx + 300, cy + 150);
        mouseUpEvent(target, cx + 300, cy + 150);
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
describe('PDF_Viewer_Stamp_Business_Persistence_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stamp_business' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stamp_business');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stamp_business'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });

    it('981641-DOWNLOAD-ANNOT-PERSIST-029 - Stamp Business-Approved persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Approved);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 100, cy + 150);
        mouseDownEvent(target, cx + 100, cy + 150);
        mouseUpEvent(target, cx + 100, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-030 - Stamp Business-NotApproved persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.NotApproved);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 150, cy + 150);
        mouseDownEvent(target, cx + 150, cy + 150);
        mouseUpEvent(target, cx + 150, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-031 - Stamp Business-Draft persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Draft);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 200, cy + 150);
        mouseDownEvent(target, cx + 200, cy + 150);
        mouseUpEvent(target, cx + 200, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-032 - Stamp Business-Final persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Final);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 250, cy + 150);
        mouseDownEvent(target, cx + 250, cy + 150);
        mouseUpEvent(target, cx + 250, cy + 150);;
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-033 - Stamp Business-Completed persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Completed);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 300, cy + 150);
        mouseDownEvent(target, cx + 300, cy + 150);
        mouseUpEvent(target, cx + 300, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-034 - Stamp Business-Confidential persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Confidential);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 350, cy + 150);
        mouseDownEvent(target, cx + 350, cy + 150);
        mouseUpEvent(target, cx + 350, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-035 - Stamp Business-ForPublicRelease persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.ForPublicRelease);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 400, cy + 150);
        mouseDownEvent(target, cx + 400, cy + 150);
        mouseUpEvent(target, cx + 400, cy + 150);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-036 - Stamp Business-NotForPublicRelease persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.NotForPublicRelease);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 100, cy + 250);
        mouseDownEvent(target, cx + 100, cy + 250);
        mouseUpEvent(target, cx + 100, cy + 250);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-037 - Stamp Business-ForComment persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.ForComment);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 150, cy + 250);
        mouseDownEvent(target, cx + 150, cy + 250);
        mouseUpEvent(target, cx + 150, cy + 250);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-038 - Stamp Business-Void persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.Void);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 200, cy + 250);
        mouseDownEvent(target, cx + 200, cy + 250);
        mouseUpEvent(target, cx + 200, cy + 250);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-039 - Stamp Business-PreliminaryResults persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.PreliminaryResults);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 250, cy + 250);
        mouseDownEvent(target, cx + 250, cy + 250);
        mouseUpEvent(target, cx + 250, cy + 250);
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

    it('981641-DOWNLOAD-ANNOT-PERSIST-040 - Stamp Business-InformationOnly persists after download and reload', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('Stamp', undefined, undefined, StandardBusinessStampItem.InformationOnly);
        const target = getTarget('#pdfviewer_stamp_business_textLayer_0');
        const rect = target.getBoundingClientRect();
        const cx = Math.floor(rect.left);
        const cy = Math.floor(rect.top);
        mouseMoveEvent(target, cx, cy);
        mouseMoveEvent(target, cx + 300, cy + 250);
        mouseDownEvent(target, cx + 300, cy + 250);
        mouseUpEvent(target, cx + 300, cy + 250);
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

// TEXT MARKUP - Highlight
describe('PDF_Viewer_TextMarkup_Highlight_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Highlight Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ffdf56");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_highlight_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
    });
});
describe('PDF_Viewer_TextMarkup_Underline_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Underline Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#00ff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_underline_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Strikethrough Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ff0000");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_strikethrough_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Squiggly Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe("#ff0000");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_squiggly_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].color).toBe('#e91e63');
    });
});
describe('PDF_Viewer_Shape_Arrow_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Arrow Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_arrow_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Shape_Rectangle_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Rectangle Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_rectangle_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Shape_Circle_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Circle Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_circle_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Shape_Polygon_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Polygon Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_polygon_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Measurement_Distance_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Distance Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_distance_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Measurement_Area_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Area Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_area_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Measurement_Radius_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Radius Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_radius_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
describe('PDF_Viewer_Measurement_Volume_Update_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_update_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_update_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_update_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-color-001 - Volume Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("#ffffff00");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const colorPopup = document.getElementById('pdfviewer_volume_update_color_annotation_color-popup') as HTMLElement;
        expect(colorPopup).toBeTruthy();

        // Select a color tile (example: #e91e63)
        const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
        expect(colorTile).toBeTruthy();
        colorTile.click();
        expect(colorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
    });
});
// describe('PDF_Viewer_FreeText_Update_color_981641', () => {
//     let viewer: PdfViewer | null = null;
//     PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
//     beforeAll((done: DoneFn) => {
//         const element = createElement('div', { id: 'pdfviewer_freeText_Update_color' });
//         document.body.appendChild(element);
//         viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
//         viewer.documentLoad = () => done();
//         viewer.appendTo('#pdfviewer_freeText_Update_color');
//     });
//     afterAll(() => {
//         if (viewer) {
//             viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_color'); if (el && el.parentNode) {
//                 el.parentNode.removeChild(el);
//             } viewer = null;
//         }
//     });
//     it('981641-Change-color - Free Text Color persists after download and reload', async () => {
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe("rgba(0,0,0,0)");
//         viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
//         const colorPopup = document.getElementById('pdfviewer_freeText_Update_color_annotation_color-popup') as HTMLElement;
//         expect(colorPopup).toBeTruthy();

//         // Select a color tile (example: #e91e63)
//         const colorTile = colorPopup.querySelector('span.e-tile[aria-label="#e91e63ff"]') as HTMLElement;
//         expect(colorTile).toBeTruthy();
//         colorTile.click();
//         expect(colorTile.getAttribute('aria-selected')).toBe('true');

//         // Validation
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63');
//         await downloadAndReload(viewer);
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
//         expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fillColor).toBe('#e91e63ff');
//     });
// });
describe('PDF_Viewer_Shape_Line_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Line stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_line_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Shape_Arrow_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Arrow stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_arrow_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Shape_Rectangle_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Rectangle stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_rectangle_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Shape_Circle_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Circle stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_circle_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Shape_Polygon_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Polygon stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_polygon_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Measurement_Distance_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Distance stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_distance_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64});
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Perimeter stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_perimeter_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Measurement_Area_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Area stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_area_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Measurement_Radius_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Radius stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_radius_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_Measurement_Volume_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-stroke-color-001 -Volume stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("#ff0000ff");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_volume_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688ff');
    });
});
describe('PDF_Viewer_FreeText_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-stroke-color-001 -Free Text stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("rgba(0,0,0,1)");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_freeText_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('rgba(0,150,136,1)');
    });
});
describe('PDF_Viewer_ink_Update_stroke_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Update_stroke_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Update_stroke_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Update_stroke_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-stroke-color-001 -Ink stroke Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe("rgba(255,0,0,1)");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const strokeColorPopup = document.getElementById('pdfviewer_ink_Update_stroke_color_annotation_stroke-popup') as HTMLElement;
        expect(strokeColorPopup).toBeTruthy();

        const strokeColorTile = strokeColorPopup.querySelector('span.e-tile[aria-label="#009688ff"]') as HTMLElement;
        expect(strokeColorTile).toBeTruthy();
        strokeColorTile.click();
        expect(strokeColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('#009688');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].strokeColor).toBe('rgba(0,150,136,1)');
    });
});
describe('PDF_Viewer_FreeText_Update_font_color_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Update_font_color' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Update_font_color');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_font_color'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-font-color-001 -Free Text font Color persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fontColor).toBe("rgba(0,0,0,1)");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const fontColorPopup = document.getElementById('pdfviewer_freeText_Update_font_color_annotation_textcolor-popup') as HTMLElement;
        expect(fontColorPopup).toBeTruthy();

        const fontColorTile = fontColorPopup.querySelector('span.e-tile[aria-label="#512da8ff"]') as HTMLElement;
        expect(fontColorTile).toBeTruthy();
        fontColorTile.click();
        expect(fontColorTile.getAttribute('aria-selected')).toBe('true');

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fontColor).toBe('#512da8');
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fontColor).toBe('rgba(81,45,168,1)');
    });
});
describe('PDF_Viewer_FreeText_Update_font_family_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Update_font_family' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Update_font_family');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_font_family'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-font-family-001 -Free Text font family persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fontFamily).toBe("Helvetica");
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const fontFamilyInput = document.querySelector('.e-pv-annotation-fontname-container.e-control.e-combobox.e-lib') as HTMLElement;
        expect(fontFamilyInput).toBeTruthy();
        const fontFamilyDropdown = (fontFamilyInput as any).ej2_instances[0] as DropDownList;
        expect(fontFamilyDropdown).toBeTruthy();
        fontFamilyDropdown.value = 'Times New Roman';
        fontFamilyDropdown.dataBind();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].fontFamily).toBe('Times New Roman');
    });
});
describe('PDF_Viewer_TextMarkup_Highlight_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 - Highlight opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_highlight_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_highlight_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Underline_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-opacity-001 - Underline opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_underline_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_underline_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 - Strikethrough opacity persists after download and reload', async () => {

        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_strikethrough_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_strikethrough_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 - Squiggly opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_squiggly_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_squiggly_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Line_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Line opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_line_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_line_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Arrow_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Arrow opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_arrow_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_arrow_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Rectangle_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Rectangle opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_rectangle_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_rectangle_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Circle_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Circle opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_circle_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_circle_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Polygon_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Polygon opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
       expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_polygon_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_polygon_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Distance_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Distance opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_distance_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_distance_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64});
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Perimeter opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_perimeter_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_perimeter_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Area_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Area opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
       expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_area_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_area_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Radius_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Radius opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_radius_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_radius_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Measurement_Volume_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-opacity-001 -Volume opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
       expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_volume_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_volume_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_FreeText_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-opacity-001 -Free Text opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_freeText_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_freeText_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_ink_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-opacity-001 -Ink opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_ink_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_ink_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_stickyNotes_Update_opacity_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stickyNotes_Update_opacity' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STICKYNOTES_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stickyNotes_Update_opacity');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stickyNotes_Update_opacity'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-opacity-001 -stickyNotes opacity persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('sticky');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const opacity = document.querySelector('#pdfviewer_stickyNotes_Update_opacity_annotation_opacity') as HTMLElement;
        expect(opacity).toBeTruthy();
        opacity.click();

        // Get the thickness slider
        const opacitySlider = document.querySelector('.e-pv-annotation-opacity-popup-container') as HTMLElement;
        expect(opacitySlider).toBeTruthy();

        const opacitySliderElement = document.querySelector('#pdfviewer_stickyNotes_Update_opacity_annotation_opacity_slider .e-handle');
        expect(opacitySliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = opacitySliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(opacitySliderElement, startX1, startY1);
        mouseDownEvent(opacitySliderElement, startX1, startY1);
        mouseMoveEvent(opacitySliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(opacitySliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity).toBeLessThan(1);
        const beforeOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterOpacity = viewer.annotationCollection[viewer.annotationCollection.length - 1].opacity;
        expect(afterOpacity).toBe(beforeOpacity);
    });
});
describe('PDF_Viewer_Shape_Line_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Line thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_line_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_line_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Arrow_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Arrow thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_arrow_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_arrow_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Rectangle_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Rectangle thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_rectangle_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_rectangle_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Circle_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Circle thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_circle_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_circle_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Shape_Polygon_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Polygon thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
       expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_polygon_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_polygon_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Distance_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Distance thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_distance_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_distance_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64});
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Perimeter thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_perimeter_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_perimeter_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Area_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Area thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
      expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_area_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_area_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Radius_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Radius thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_radius_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_radius_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_Measurement_Volume_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-Change-thickness-001 -Volume thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
       expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_volume_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_volume_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_FreeText_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-thickness-001 -Free Text thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(0);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_freeText_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_freeText_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_ink_Update_thickness_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_Update_thickness' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_Update_thickness');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_Update_thickness'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-Change-thickness-001 -Ink thickness persists after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        const thickness = document.querySelector('#pdfviewer_ink_Update_thickness_annotation_thickness') as HTMLElement;
        expect(thickness).toBeTruthy();
        thickness.click();

        // Get the thickness slider
        const thicknessSlider = document.querySelector('.e-pv-annotation-thickness-popup-container') as HTMLElement;
        expect(thicknessSlider).toBeTruthy();

        const thicknessSliderElement = document.querySelector('#pdfviewer_ink_Update_thickness_annotation_thickness_slider .e-handle');
        expect(thicknessSliderElement).toBeTruthy();

        // Calculate slider position
        const rect1 = thicknessSliderElement.getBoundingClientRect();
        const startX1 = rect1.left + rect1.width / 2;
        const startY1 = rect1.top + rect1.height / 2;

        // Perform slider drag interaction
        mouseMoveEvent(thicknessSliderElement, startX1, startY1);
        mouseDownEvent(thicknessSliderElement, startX1, startY1);
        mouseMoveEvent(thicknessSliderElement, rect1.left + 100, rect1.top);
        mouseUpEvent(thicknessSliderElement, rect1.left + 30, rect1.top);

        // Validation
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness).toBeGreaterThan(1);
        const beforeThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1]).toBeDefined();
        const afterThickness = viewer.annotationCollection[viewer.annotationCollection.length - 1].thickness;
        expect(afterThickness).toBe(beforeThickness);
    });
});
describe('PDF_Viewer_TextMarkup_Highlight_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_highlight_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HIGHLIGHT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_highlight_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_highlight_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 - Highlight is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Highlight');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_highlight_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Underline_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_underline_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + UNDERLINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_underline_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_underline_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-delete-001 - Underline is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Underline');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_underline_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Strikethrough_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_strikethrough_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STRIKETHROUGH_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_strikethrough_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_strikethrough_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 - Strikethrough is removed after download and reload', async () => {

        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Strikethrough');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_strikethrough_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_TextMarkup_Squiggly_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_squiggly_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + SQUIGGLY_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_squiggly_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_squiggly_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 - Squiggly is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('textMarkup');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].textMarkupAnnotationType).toBe('Squiggly');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_squiggly_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Line_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_line_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + LINE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_line_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_line_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Line is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Line');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_line_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Arrow_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_arrow_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ARROW_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_arrow_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_arrow_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Arrow is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Arrow');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_arrow_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Rectangle_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_rectangle_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RECTANGLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_rectangle_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_rectangle_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Rectangle is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Square");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Rectangle");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_rectangle_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Circle_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_circle_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + CIRCLE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_circle_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_circle_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Circle is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Circle");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
       (document.querySelector('#pdfviewer_circle_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Shape_Polygon_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_polygon_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + POLYGON_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_polygon_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_polygon_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Polygon is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Polygon");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_polygon_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Distance_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_distance_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + DISTANCE_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_distance_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_distance_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Distance is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Line');
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe('Distance calculation');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_distance_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Perimeter_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_perimeter_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + PERIMETER_B64});
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_perimeter_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_perimeter_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Perimeter is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polyline");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Perimeter calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolyLineDimension");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_perimeter_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Area_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_area_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + AREA_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_area_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_area_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Area is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Area calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonDimension");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_area_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Radius_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_radius_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + RADIUS_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_radius_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_radius_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Radius is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Circle");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Radius calculation");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_radius_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_Measurement_Volume_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_volume_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + VOLUME_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_volume_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_volume_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641-delete-001 -Volume is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe("Polygon");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].subject).toBe("Volume calculation");
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].indent).toBe("PolygonVolume");
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_volume_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_FreeText_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freeText_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + FREETEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freeText_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freeText_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-delete-001 -Free Text is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('FreeText');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_freeText_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_ink_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_ink_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + INK_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_ink_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_ink_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-delete-001 -Ink is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Ink');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_ink_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_stickyNotes_delete_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_stickyNotes_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + STICKYNOTES_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_stickyNotes_delete');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_stickyNotes_delete'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
     it('981641-delete-001 -stickyNotes is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('sticky');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        (document.querySelector('#pdfviewer_stickyNotes_delete_annotation_delete') as HTMLElement).click();
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});