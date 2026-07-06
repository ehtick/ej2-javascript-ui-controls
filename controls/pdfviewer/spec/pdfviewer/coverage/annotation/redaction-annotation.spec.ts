import { createElement } from '@syncfusion/ej2-base';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print,
    Annotation, FormFields, FormDesigner, PageOrganizer,
    RedactionSettings
} from '../../../../src/index';
import { downloadAndReload, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, normalizeColor } from '../../utils.spec';
import { HELLO_PDF_B64, EMPTY_PDF_B64, REDACTION_OVERLAY_TEXT_B64, REDACTION_B64 } from '../../Data/pdf-data.spec';
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
describe('PDF_Viewer_redaction_Persistence_981641', function () {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll(function (done) {
        var existingEl = document.getElementById('pdfviewer_redaction_981641');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        var element = createElement('div', { id: 'pdfviewer_redaction_981641' });
        document.body.appendChild(element);
        viewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64, toolbarSettings: {
                toolbarItems: [
                    'OpenOption',
                    'UndoRedoTool',
                    'PageNavigationTool',
                    'MagnificationTool',
                    'PanTool',
                    'SelectionTool',
                    'CommentTool',
                    'SubmitForm',
                    'AnnotationEditTool',
                    'RedactionEditTool',
                    'FormDesignerEditTool',
                    'SearchOption',
                    'PrintOption',
                    'DownloadOption'
                ]
            }
        });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_redaction_981641');
    });
    afterAll(function (done) {
        if (viewer) {
            viewer.destroy();
            var el = document.getElementById('pdfviewer_redaction_981641');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-008 - Redaction persists after download and reload', async () => {
        viewer.annotation.setAnnotationMode('Redaction');
        let target = getTarget('#pdfviewer_redaction_981641_textLayer_0');
        let rect = target.getBoundingClientRect();
        let sx = Math.round(rect.left + 260);
        let sy = Math.round(rect.top + 80);
        let ex = Math.round(rect.left + 360);
        let ey = Math.round(rect.top + 140);
        mouseMoveEvent(target, sx, sy);
        mouseDownEvent(target, sx, sy);
        let steps = 10;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let x = Math.round(sx + (ex - sx) * t);
            let y = Math.round(sy + (ey - sy) * t);
            mouseMoveEvent(target, x, y);
        }
        mouseUpEvent(target, ex, ey);
        let annotations = viewer.annotationCollection || [];
        let last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Redaction');
        expect(last.subject).toBe('Redaction');
        let baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        let reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(normalizeColor(reloadedData.markerFillColor)).toBe(normalizeColor(baselineData.markerFillColor));
        expect(normalizeColor(reloadedData.markerBorderColor)).toBe(normalizeColor(baselineData.markerBorderColor));
        expect(reloadedData.markerOpacity).toBeCloseTo(baselineData.markerOpacity, 6);
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});
describe('PDF_Viewer_Programmatic_redaction_Persistence_981641', function () {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll(function (done) {
        var existingEl = document.getElementById('pdfviewer_programmatic_redaction');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        var element = createElement('div', { id: 'pdfviewer_programmatic_redaction' });
        document.body.appendChild(element);
        viewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64, toolbarSettings: {
                toolbarItems: [
                    'OpenOption',
                    'UndoRedoTool',
                    'PageNavigationTool',
                    'MagnificationTool',
                    'PanTool',
                    'SelectionTool',
                    'CommentTool',
                    'SubmitForm',
                    'AnnotationEditTool',
                    'RedactionEditTool',
                    'FormDesignerEditTool',
                    'SearchOption',
                    'PrintOption',
                    'DownloadOption'
                ]
            }
        });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_programmatic_redaction');
    });
    afterAll(function () {
        if (viewer) {
            viewer.destroy();
            var el = document.getElementById('pdfviewer_programmatic_redaction');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-008 - Programmatic Redaction persists after download and reload', async () => {
        viewer.annotation.addAnnotation("Redaction", {
            bound: { x: 200, y: 480, width: 150, height: 75 },
            pageNumber: 1,
            markerFillColor: '#0000FF',
            markerBorderColor: 'white',
            fillColor: 'red',
            overlayText: 'Confidential',
            fontColor: 'yellow',
            fontFamily: 'Times New Roman',
            fontSize: 8,
        } as RedactionSettings);
        let annotations = viewer.annotationCollection || [];
        let last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Redaction');
        expect(last.subject).toBe('Redaction');
        let baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        let reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(normalizeColor(reloadedData.strokeColor)).toBe(normalizeColor(baselineData.strokeColor));
        expect(normalizeColor(reloadedData.markerFillColor)).toBe(normalizeColor(baselineData.markerFillColor));
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});
describe('PDF_Viewer_Programmatic_text_redaction_Persistence_981641', function () {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll(function (done) {
        // Clean up any existing element first
        var existingEl = document.getElementById('pdfviewer_programmatic_text_redaction');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        
        var element = createElement('div', { id: 'pdfviewer_programmatic_text_redaction' });
        document.body.appendChild(element);
        viewer = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + HELLO_PDF_B64, toolbarSettings: {
                toolbarItems: [
                    'OpenOption',
                    'UndoRedoTool',
                    'PageNavigationTool',
                    'MagnificationTool',
                    'PanTool',
                    'SelectionTool',
                    'CommentTool',
                    'SubmitForm',
                    'AnnotationEditTool',
                    'RedactionEditTool',
                    'FormDesignerEditTool',
                    'SearchOption',
                    'PrintOption',
                    'DownloadOption'
                ]
            }
        });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_programmatic_text_redaction');
    });
    afterAll(function () {
        if (viewer) {
            viewer.destroy();
            var el = document.getElementById('pdfviewer_programmatic_text_redaction');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            viewer = null;
        }
    });
    it('981641-DOWNLOAD-ANNOT-PERSIST-008 - Programmatic text Redaction persists after download and reload', async () => {
        const annotationAdded = new Promise<void>((resolve) => {
            viewer!.annotationAdd = () => resolve();
        });
        viewer.annotation.addAnnotation("Redaction", {
            bound: { x: 98.19998173333333, y: 101.1875, width: 34.616516133333334, height: 12 },
            pageNumber: 1,
            overlayText: "Confidential",
            fillColor: "#00FF40FF",
            fontColor: "#333333",
            fontSize: 12,
            fontFamily: "Arial",
            markerFillColor: "#FF0000",
            markerBorderColor: "#000000"
        } as RedactionSettings);
        await annotationAdded;
        let annotations = viewer.annotationCollection || [];
        let last = annotations[annotations.length - 1];
        expect(last).toBeDefined();
        expect(last.shapeAnnotationType).toBe('Redaction');
        expect(last.subject).toBe('Redaction');
        let baselineData = captureAnnotationData(viewer);
        await downloadAndReload(viewer);
        let reloadedData = captureAnnotationData(viewer);
        expect(reloadedData.type).toBe(baselineData.type);
        expect(reloadedData.subject).toBe(baselineData.subject);
        expect(reloadedData.pageNumber).toBe(baselineData.pageNumber);
        expect(reloadedData.overlayText.trim()).toBe(baselineData.overlayText.trim());
        expect(reloadedData.fontSize).toBe(baselineData.fontSize);
        expect(normalizeColor(reloadedData.fillColor)).toBe(normalizeColor(baselineData.fillColor));
        expect(normalizeColor(reloadedData.markerFillColor)).toBe(normalizeColor(baselineData.markerFillColor));
        expect(normalizeColor(reloadedData.markerBorderColor)).toBe(normalizeColor(baselineData.markerBorderColor));
        expect(reloadedData.bounds.width).toBeCloseTo(baselineData.bounds.width, 6);
        expect(reloadedData.bounds.height).toBeCloseTo(baselineData.bounds.height, 6);
        expect(reloadedData.bounds.left).toBeCloseTo(baselineData.bounds.left, 6);
        expect(reloadedData.bounds.top).toBeCloseTo(baselineData.bounds.top, 6);
    });
});
describe('PDF_Viewer_redaction_programmatic_delete_981641', function () {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll(function (done) {
        // Clean up any existing element first
        var existingEl = document.getElementById('pdfviewer_redaction_programmatic_delete');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        
        var element = createElement('div', { id: 'pdfviewer_redaction_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + REDACTION_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_redaction_programmatic_delete');
    });
    afterAll(function () {
        if (viewer) {
            viewer.destroy();
            var el = document.getElementById('pdfviewer_redaction_programmatic_delete');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            viewer = null;
        }
    });
    it('981641-programmatic_delete-001 -Redaction is removed after download and reload', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Redaction');
        expect(viewer.annotationCollection.length).toBe(1);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
describe('PDF_Viewer_redaction_Overlay_programmatic_delete_981641', function () {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll(function (done) {
        // Clean up any existing element first
        var existingEl = document.getElementById('pdfviewer_redaction_overlay_programmatic_delete');
        if (existingEl && existingEl.parentNode) {
            existingEl.parentNode.removeChild(existingEl);
        }
        
        var element = createElement('div', { id: 'pdfviewer_redaction_overlay_programmatic_delete' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + REDACTION_OVERLAY_TEXT_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_redaction_overlay_programmatic_delete');
    });
    afterAll(function (done) {
        if (viewer) {
            viewer.destroy();
            var el = document.getElementById('pdfviewer_redaction_overlay_programmatic_delete');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            viewer = null;
        }
    });
    it('981641-programmatic_delete -Redaction overlay is removed', async () => {
        expect(viewer.annotationCollection[viewer.annotationCollection.length - 1].shapeAnnotationType).toBe('Redaction');
        expect(viewer.annotationCollection.length).toBe(1);
        var annotation= (viewer.nameTable as any)[viewer.annotationCollection[0].uniqueKey];
        viewer.annotation.redactionOverlayTextModule.renderRedactionOverlayText(annotation, undefined);
        viewer.annotation.selectAnnotation(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        viewer.annotation.deleteAnnotationById(viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId);
        await downloadAndReload(viewer);
        expect(viewer.annotationCollection.length).toBe(0);
    });
});
