import { createElement } from "@syncfusion/ej2-base";
import {
	PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
	TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer,
	PointBase
} from "../../../../src/index";
import { dblClickEvent, focusOutOnceWithoutNative, getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";

describe('PDF_Viewer_Shapes_Opacity_Zero', () => {
	let pdfviewer_shape: PdfViewer = null;

	PdfViewer.Inject(
		Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
		TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
	);

	beforeAll((done) => {
		const element: HTMLElement = createElement('div', { id: 'pdfviewer_shape' });
		document.body.appendChild(element);
		pdfviewer_shape = new PdfViewer({
			resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
			documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
		});
		pdfviewer_shape.documentLoad = () => done();
		pdfviewer_shape.appendTo('#pdfviewer_shape');
	});

	afterAll(() => {
		if (pdfviewer_shape) {
			pdfviewer_shape.destroy();
			const el = document.getElementById('pdfviewer_shape');
			if (el && el.parentNode) { el.parentNode.removeChild(el); }
			pdfviewer_shape = null;
		}
	});

	it('1009739-Line annotation invisible when opacity=0', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_shape_textLayer_0');
			const rect = target.getBoundingClientRect();
			pdfviewer_shape.lineSettings.opacity = 0;
			pdfviewer_shape.annotation.setAnnotationMode('Line');

			const sx = Math.round(rect.left + 50);
			const sy = Math.round(rect.top + 80);
			const ex = Math.round(rect.left + 200);
			const ey = Math.round(rect.top + 80);
			mouseMoveEvent(target, sx, sy);
			mouseDownEvent(target, sx, sy);
			mouseMoveEvent(target, ex, ey);
			mouseUpEvent(target, ex, ey);
			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0);
			const annottaions = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			expect(annottaions).toBeDefined();
			expect(annottaions.opacity).toBe(0);
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});

	it('1009739-Arrow annotation invisible when opacity=0', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_shape_textLayer_0');
			const rect = target.getBoundingClientRect();
			pdfviewer_shape.arrowSettings.opacity = 0;
			pdfviewer_shape.annotation.setAnnotationMode('Arrow');

			const sx = Math.round(rect.left + 60);
			const sy = Math.round(rect.top + 140);
			const ex = Math.round(rect.left + 220);
			const ey = Math.round(rect.top + 140);

			mouseMoveEvent(target, sx, sy);
			mouseDownEvent(target, sx, sy);
			mouseMoveEvent(target, ex, ey);
			mouseUpEvent(target, ex, ey);
			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0)
			const annottaions = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			expect(annottaions).toBeDefined();
			expect(annottaions.opacity).toBe(0);
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});

	it('1009739-Rectangle annotation invisible when opacity=0', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_shape_textLayer_0');
			const rect = target.getBoundingClientRect();
			pdfviewer_shape.rectangleSettings.opacity = 0;
			pdfviewer_shape.annotation.setAnnotationMode('Rectangle');

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
			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0)
			const annottaions = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			expect(annottaions).toBeDefined();
			expect(annottaions.opacity).toBe(0);
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});

	it('1009739-Circle annotation invisible when opacity=0', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_shape_textLayer_0');
			const rect = target.getBoundingClientRect();
			pdfviewer_shape.circleSettings.opacity = 0;
			pdfviewer_shape.annotation.setAnnotationMode('Circle');

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
			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0)
			const annottaions = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			expect(annottaions).toBeDefined();
			expect(annottaions.opacity).toBe(0);
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});

	it('1009739-Polygon annotation invisible when opacity=0', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_shape_textLayer_0');
			const rect = target.getBoundingClientRect();
			pdfviewer_shape.polygonSettings.opacity = 0;
			pdfviewer_shape.annotation.setAnnotationMode('Polygon');

			// Pentagon points (approximate)
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

			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0)
			const annottaions = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			expect(annottaions).toBeDefined();
			expect(annottaions.opacity).toBe(0);
			done();
		} catch (e) {
			// Some environments may differ in polygon completion; still assert collection consistency on failure context
			done.fail(e as Error);
		}
	});

	it("1021263 - Rectangle annotation is visible when added programmatically with the X position set to 0.", async (done: DoneFn) => {
		try {
			// Create a temporary button to trigger rectangle annotation creation
			const addAnnotationBtn = document.createElement("button");
			addAnnotationBtn.id = "test-view-button_1";
			addAnnotationBtn.textContent = "View";
			document.body.appendChild(addAnnotationBtn);
			// Add click event listener to programmatically add a rectangle annotation
			addAnnotationBtn.addEventListener("click", () => {
				(pdfviewer_shape as any).annotation.addAnnotation("Rectangle", {
					offset: { x: 0, y: 480 },
					pageNumber: 1,
					width: 150,
					height: 75,
				});
			});
			// Trigger the button click to add the rectangle annotation
			addAnnotationBtn.click();
			waitFor(() => pdfviewer_shape.annotationCollection && pdfviewer_shape.annotationCollection.length > 0);
			// Get the most recently added rectangle annotation from the collection
			const rectangleAnnotation = pdfviewer_shape.annotationCollection[pdfviewer_shape.annotationCollection.length - 1] as any;
			// Verify that the rectangle annotation left position is correctly set to 0
			expect(rectangleAnnotation.bounds.left).toBe(0);
			// Remove the temporary button created for this test
			if (addAnnotationBtn.parentNode) {
				addAnnotationBtn.parentNode.removeChild(addAnnotationBtn);
			}
			done();
		} catch (e) {
			done.fail(e as Error);
		}
	});
});

describe('PDF_Viewer_Shape_Label_Persistence', () => {
	let pdfviewer_1010498_label: PdfViewer = null;
	let annotationAddedBlob: Blob = null;
	let annotationEditedBlob: Blob = null;
	const rectangleStartPoint: PointBase = { x: 100, y: 100 };
	const rectangleEndPoint: PointBase = { x: 300, y: 200 };
	const circleStartPoint: PointBase = { x: 100, y: 250 };
	const circleEndPoint: PointBase = { x: 200, y: 350 };
	const closeAnnotationToolbar = () => {
		const annotationToolbar = pdfviewer_1010498_label.element.querySelector('#pdfviewer_1010498_label_annotation_toolbar');
		if (getComputedStyle(annotationToolbar).display === 'block') {
			(pdfviewer_1010498_label.element.querySelector('#pdfviewer_1010498_label_annotation') as HTMLElement).click();
		}
	}

	PdfViewer.Inject(
		Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
		TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
	);

	beforeAll((done) => {
		const element: HTMLElement = createElement('div', { id: 'pdfviewer_1010498_label' });
		document.body.appendChild(element);
		pdfviewer_1010498_label = new PdfViewer({
			resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
			documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
			enableShapeLabel: true,
			shapeLabelSettings: {
				opacity: 1,
				fillColor: "#FF0000",
				fontColor: "#FFFFFF",
				fontSize: 16,
				labelContent: "Syncfusion"
			}
		});
		pdfviewer_1010498_label.documentLoad = () => done();
		pdfviewer_1010498_label.appendTo('#pdfviewer_1010498_label');
	});

	afterAll(() => {
		if (pdfviewer_1010498_label) {
			pdfviewer_1010498_label.destroy();
			pdfviewer_1010498_label = null;
		}
		const el = document.getElementById('pdfviewer_1010498_label');
		if (el && el.parentNode) { el.parentNode.removeChild(el); }
	});

	it('EJ2-1010498-add-rectangle-circle-save', (done: DoneFn) => {
		try {
			const target = getTarget('#pdfviewer_1010498_label_textLayer_0');
			let rect = target.getBoundingClientRect();
			let initialCount = pdfviewer_1010498_label.annotationCollection.length;
			// Create rectangle annotation via UI
			pdfviewer_1010498_label.annotation.setAnnotationMode('Rectangle');
			let sx = Math.round(rect.left + rectangleStartPoint.x);
			let sy = Math.round(rect.top + rectangleStartPoint.y);
			let ex = Math.round(rect.left + rectangleEndPoint.x);
			let ey = Math.round(rect.top + rectangleEndPoint.y);
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
			waitFor(() => pdfviewer_1010498_label.annotationCollection.length > initialCount);
			const annotationCollection = pdfviewer_1010498_label.annotationCollection;
			expect(annotationCollection.length).toBe(1);
			closeAnnotationToolbar();
			rect = target.getBoundingClientRect();
			initialCount = pdfviewer_1010498_label.annotationCollection.length;
			// Create circle annotation via UI
			pdfviewer_1010498_label.annotation.setAnnotationMode('Circle');
			sx = Math.round(rect.left + circleStartPoint.x);
			sy = Math.round(rect.top + circleStartPoint.y);
			ex = Math.round(rect.left + circleEndPoint.x);
			ey = Math.round(rect.top + circleEndPoint.y);
			mouseMoveEvent(target, sx, sy);
			mouseDownEvent(target, sx, sy);
			for (let i = 1; i <= steps; i++) {
				const t = i / steps;
				const x = Math.round(sx + (ex - sx) * t);
				const y = Math.round(sy + (ey - sy) * t);
				mouseMoveEvent(target, x, y);
			}
			mouseUpEvent(target, ex, ey);
			waitFor(() => pdfviewer_1010498_label.annotationCollection.length > initialCount);
			expect(annotationCollection.length).toBe(2);
			closeAnnotationToolbar();
			pdfviewer_1010498_label.saveAsBlob().then((blob) => {
				annotationAddedBlob = blob;
				done();
			});
		}
		catch (error) {
			done.fail(error as Error);
		}
	});

	it('EJ2-1010498-reload-blob', (done: DoneFn) => {
		try {
			const documentLoaded = () => {
				pdfviewer_1010498_label.removeEventListener('documentLoad', documentLoaded);
				done();
			}
			pdfviewer_1010498_label.addEventListener('documentLoad', documentLoaded);
			const reader = new FileReader();
			reader.onload = () => {
				pdfviewer_1010498_label.load(reader.result as string, null);
			};
			reader.readAsDataURL(annotationAddedBlob);
		} catch (e) {
			done.fail(e as Error);
		}
	});

	it('EJ2-1010498-existing-annotation-label-edit-persisted', (done: DoneFn) => {
		try {
			const selectionPointDiff: number = 25;
			closeAnnotationToolbar();
			const target = getTarget('#pdfviewer_1010498_label_textLayer_0');
			// Edit Rectangle label
			let rect = target.getBoundingClientRect();
			let sx = Math.round(rect.left + rectangleStartPoint.x);
			let sy = Math.round(rect.top + rectangleStartPoint.y);
			mouseDownEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			mouseUpEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			dblClickEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			const pageDiv: HTMLElement = document.getElementById('pdfviewer_1010498_label_pageDiv_0');
			waitFor(() => pageDiv.querySelector('input').isConnected);
			const labelInputElement: HTMLInputElement = pageDiv.querySelector('input');
			labelInputElement.value = 'Rectangle';
			focusOutOnceWithoutNative(labelInputElement);
			// Edit Circle label
			rect = target.getBoundingClientRect();
			sx = Math.round(rect.left + circleStartPoint.x);
			sy = Math.round(rect.top + circleStartPoint.y);
			mouseDownEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			mouseUpEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			dblClickEvent(target, sx + selectionPointDiff, sy + selectionPointDiff);
			waitFor(() => pageDiv.querySelector('input').isConnected);
			labelInputElement.value = 'Circle';
			focusOutOnceWithoutNative(labelInputElement);
			// Save
			pdfviewer_1010498_label.saveAsBlob().then((blob) => {
				annotationEditedBlob = blob;
				done();
			});
		}
		catch (error) {
			done.fail()
		}
	});

	it('EJ2-1010498-label-edited-reload-blob', (done: DoneFn) => {
		try {
			const documentLoaded = () => {
				pdfviewer_1010498_label.removeEventListener('documentLoad', documentLoaded);
				const annotationCollection = pdfviewer_1010498_label.annotationCollection;
				expect(annotationCollection.length).toBe(2);
				expect(annotationCollection[0].labelContent).toBe("Rectangle");
				expect(annotationCollection[1].labelContent).toBe("Circle");
				done();
			}
			pdfviewer_1010498_label.addEventListener('documentLoad', documentLoaded);
			const reader = new FileReader();
			reader.onload = () => {
				pdfviewer_1010498_label.load(reader.result as string, null);
			};
			reader.readAsDataURL(annotationEditedBlob);
		} catch (e) {
			done.fail(e as Error);
		}
	});
});

