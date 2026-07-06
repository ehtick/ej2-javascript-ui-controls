import { createElement } from '@syncfusion/ej2-base';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print,
    Annotation, FormFields, FormDesigner, PageOrganizer,
    FreeTextSettings,
    AnnotationDataFormat,
} from '../../../../src/index';
import { downloadAndReload, exportAnnotationsHelper, focusOutOnceWithoutNative, getTarget, importAnnotationsHelper, mouseDownEvent, mouseMoveEvent, mouseUpEvent, normalizeColor, waitFor } from '../../utils.spec';
import { EMPTY_PDF_B64, ROTATED_180, ROTATED_270, ROTATED_360, ROTATED_90,} from '../../Data/pdf-data.spec';

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

describe('PDF_Viewer_FreeText_Persistence_90deg_document_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_90deg' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ROTATED_90 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_90deg');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_90deg'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 - FreeText persists after download and reload in 90deg document', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('FreeText');
        const target = getTarget('#pdfviewer_freetext_90deg_textLayer_0');
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

describe('PDF_Viewer_FreeText_Persistence_180deg_document_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_180deg' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ROTATED_180 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_180deg');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_180deg'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 - FreeText persists after download and reload in 180deg document', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('FreeText');
        const target = getTarget('#pdfviewer_freetext_180deg_textLayer_0');
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

describe('PDF_Viewer_FreeText_Persistence_270deg_document_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_270deg' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ROTATED_270 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_270deg');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_270deg'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 - FreeText persists after download and reload in 270deg document', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('FreeText');
        const target = getTarget('#pdfviewer_freetext_270deg_textLayer_0');
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

describe('PDF_Viewer_FreeText_Persistence_360deg_document_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_360deg' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + ROTATED_360 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_360deg');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_360deg'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 - FreeText persists after download and reload in 360deg document', async () => {
        if (!viewer) return;
        viewer.annotation.setAnnotationMode('FreeText');
        const target = getTarget('#pdfviewer_freetext_360deg_textLayer_0');
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

describe('PDF_Viewer_Programmatic_FreeText_exportImport_as_object_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_exportImport_object' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_exportImport_object');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_exportImport_object'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 FreeText persists after export and import as object Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_freetext_exportImport_object_textLayer_0');
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
        const exportedData = await exportAnnotationsHelper(viewer);
        //Delete all annotations
        viewer.deleteAnnotations();
        await waitFor(() => viewer.annotationCollection.length === 0);
        expect(viewer.annotationCollection.length).toBe(0, 'All annotations should be deleted');

        //Import and validate
        importAnnotationsHelper(viewer, exportedData);
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
describe('PDF_Viewer_Programmatic_FreeText_exportImport_as_json_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_exportImport_json' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_exportImport_json');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_exportImport_json'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 FreeText persists after export and import as JSON Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_freetext_exportImport_json_textLayer_0');
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
        let exportedJSONData = await viewer.exportAnnotationsAsObject(AnnotationDataFormat.Json);
        //Delete all annotations
        viewer.deleteAnnotations();
        await waitFor(() => viewer.annotationCollection.length === 0);
        expect(viewer.annotationCollection.length).toBe(0, 'All annotations should be deleted');
        //Import and validate
        viewer.importAnnotation(exportedJSONData, AnnotationDataFormat.Json);
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
describe('PDF_Viewer_Programmatic_FreeText_exportImport_as_xfdf_981641', () => {
    let viewer: PdfViewer | null = null;
    PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_freetext_exportImport_xfdf' });
        document.body.appendChild(element);
        viewer = new PdfViewer({ resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib', documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64 });
        viewer.documentLoad = () => done();
        viewer.appendTo('#pdfviewer_freetext_exportImport_xfdf');
    });
    afterAll(() => {
        if (viewer) {
            viewer.destroy(); const el = document.getElementById('pdfviewer_freetext_exportImport_xfdf'); if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            } viewer = null;
        }
    });
    it('981641 FreeText persists after export and import as XFDF Programmatically', async () => {
        if (!viewer) return;
        const target = getTarget('#pdfviewer_freetext_exportImport_xfdf_textLayer_0');
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
        let exportedJSONData = await viewer.exportAnnotationsAsObject(AnnotationDataFormat.Xfdf);
        //Delete all annotations
        viewer.deleteAnnotations();
        await waitFor(() => viewer.annotationCollection.length === 0);
        expect(viewer.annotationCollection.length).toBe(0, 'All annotations should be deleted');
        //Import and validate
        viewer.importAnnotation(exportedJSONData, AnnotationDataFormat.Xfdf);
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