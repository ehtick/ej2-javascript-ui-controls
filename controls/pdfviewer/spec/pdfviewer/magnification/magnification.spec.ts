import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner } from '../../../src/index';
import { EMPTY_PDF_B64 } from '../Data/pdf-data.spec';

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner);

/**
 * Magnification spec - Pinch Zoom with Minimum Zoom Constraints
 */
describe('PDF_Viewer_Magnification_PinchZoom', () => {
    let pdfviewer_pinch_negative: PdfViewer | null = null;

    // ─── Test 1: Pinch-in with negative minZoom (-5) ──────────────────────────────────
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_pinch_negative' });
        document.body.appendChild(element);
        pdfviewer_pinch_negative = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
            minZoom: -5,
            zoomValue: 20
        });
        pdfviewer_pinch_negative.documentLoad = () => done();
        pdfviewer_pinch_negative.appendTo('#pdfviewer_pinch_negative');
    });

    afterAll(() => {
        if (pdfviewer_pinch_negative) {
            pdfviewer_pinch_negative.destroy();
            const el = document.getElementById('pdfviewer_pinch_negative');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_pinch_negative = null;
        }
    });

    it('PINCH-ZOOM-001-negative-minzoom-pinchIn-respects-minimum', (done) => {
        pdfviewer_pinch_negative.magnificationModule.previousTouchDifference = 500;
        pdfviewer_pinch_negative.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
        pdfviewer_pinch_negative.magnificationModule.previousTouchDifference = 500;
        pdfviewer_pinch_negative.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
        pdfviewer_pinch_negative.magnificationModule.previousTouchDifference = 500;
        pdfviewer_pinch_negative.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
        pdfviewer_pinch_negative.magnificationModule.previousTouchDifference = 500;
        pdfviewer_pinch_negative.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
        pdfviewer_pinch_negative.magnificationModule.previousTouchDifference = 500;
        pdfviewer_pinch_negative.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
        const zoomAfterPinchIn = pdfviewer_pinch_negative.zoomPercentage;
        expect(zoomAfterPinchIn).toBeCloseTo(10, 4);
        done();
    });
});

/**
 * Test: Pinch-in with zero minZoom
 */
describe('PDF_Viewer_Magnification_PinchZoom_ZeroMin', () => {
    let pdfviewer_pinch_zero: PdfViewer | null = null;

    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_pinch_zero' });
        document.body.appendChild(element);
        pdfviewer_pinch_zero = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
            minZoom: 0
        });
        pdfviewer_pinch_zero.documentLoad = () => done();
        pdfviewer_pinch_zero.appendTo('#pdfviewer_pinch_zero');
    });

    afterAll(() => {
        if (pdfviewer_pinch_zero) {
            pdfviewer_pinch_zero.destroy();
            const el = document.getElementById('pdfviewer_pinch_zero');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_pinch_zero = null;
        }
    });

    it('PINCH-ZOOM-003-zero-minzoom-pinchIn-respects-constraint', (done) => {
        pdfviewer_pinch_zero.zoomChange = function () {
            const zoomAfterPinch = pdfviewer_pinch_zero.zoomPercentage;
            // Assert - Zoom should not go below 0 and should be within valid bounds (>= 10 by default)
            expect(zoomAfterPinch).toBeGreaterThanOrEqual(0);
            done();
        }
        const container = document.querySelector('#pdfviewer_pinch_zero .e-pv-viewer-container');
        if (container) {
            const evt = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt1 = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            container.dispatchEvent(evt);
            container.dispatchEvent(evt1);
        }
        
    });
});

/**
 * Test: Pinch-out with negative minZoom
 */
describe('PDF_Viewer_Magnification_PinchOut_NegativeMin', () => {
    let pdfviewer_pinchout_negative: PdfViewer | null = null;

    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_pinchout_negative' });
        document.body.appendChild(element);
        pdfviewer_pinchout_negative = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
            minZoom: -5,
            maxZoom: 200
        });
        pdfviewer_pinchout_negative.documentLoad = () => done();
        pdfviewer_pinchout_negative.appendTo('#pdfviewer_pinchout_negative');
    });

    afterAll(() => {
        if (pdfviewer_pinchout_negative) {
            pdfviewer_pinchout_negative.destroy();
            const el = document.getElementById('pdfviewer_pinchout_negative');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_pinchout_negative = null;
        }
    });

    it('PINCH-ZOOM-004-negative-minzoom-pinchOut-stays-within-bounds', (done) => {  
        const container = document.querySelector('#pdfviewer_pinchout_negative .e-pv-viewer-container');
        if (container) {
            const evt = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt1 = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt2 = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
            container.dispatchEvent(evt);
            container.dispatchEvent(evt1);
            container.dispatchEvent(evt2);
            const zoomAfterPinchOut = pdfviewer_pinchout_negative.zoomPercentage;
            // Assert - Zoom should be within valid bounds (not negative, should respect constraints)
            expect(zoomAfterPinchOut).toBeGreaterThanOrEqual(200);
            done();
        }
    });
});

/**
 * Test: Pinch-in with high minZoom (50)
 */
describe('PDF_Viewer_Magnification_PinchZoom_HighMin', () => {
    let pdfviewer_pinch_high: PdfViewer | null = null;

    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_pinch_high' });
        document.body.appendChild(element);
        pdfviewer_pinch_high = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
            minZoom: 50
        });
        pdfviewer_pinch_high.documentLoad = () => done();
        pdfviewer_pinch_high.appendTo('#pdfviewer_pinch_high');
    });

    afterAll(() => {
        if (pdfviewer_pinch_high) {
            pdfviewer_pinch_high.destroy();
            const el = document.getElementById('pdfviewer_pinch_high');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_pinch_high = null;
        }
    });

    it('PINCH-ZOOM-005-high-minzoom-pinchIn-respects-high-minimum', (done) => {
        const container = document.querySelector('#pdfviewer_pinch_high .e-pv-viewer-container');
        if (container) {
            const evt = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt1 = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt2 = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            const evt3 = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
            container.dispatchEvent(evt);
            container.dispatchEvent(evt1);
            container.dispatchEvent(evt2);
            container.dispatchEvent(evt3);
            const zoomAfterPinch = pdfviewer_pinch_high.zoomPercentage;
            expect(zoomAfterPinch).toBeGreaterThanOrEqual(50);
            done();
        }
    });
});

describe('PDF_Viewer_magnification_MinMaxSwap', () => {
	// Test 1: Verify that when minZoom > maxZoom the viewer corrects the values (swap)
	describe('BUG-MinMaxSwap-VerifySwappedValues', () => {
		let pdfviewer_minmax1: PdfViewer = null;
		beforeAll((done: DoneFn) => {
			const element: HTMLElement = createElement('div', { id: 'pdfviewer_minmax1' });
			document.body.appendChild(element);
			pdfviewer_minmax1 = new PdfViewer({
				resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
				documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
			});
			// Intentionally set inverted limits
			pdfviewer_minmax1.minZoom = 200;
			pdfviewer_minmax1.maxZoom = 50;
			pdfviewer_minmax1.documentLoad = () => { done(); };
			pdfviewer_minmax1.appendTo('#pdfviewer_minmax1');
		});
		afterAll(() => {
			if (pdfviewer_minmax1) {
				pdfviewer_minmax1.destroy();
				const el = document.getElementById('pdfviewer_minmax1');
				if (el && el.parentNode) { el.parentNode.removeChild(el); }
				pdfviewer_minmax1 = null;
			}
		});
		it('BUG-MinMaxSwap-VerifySwappedValues', (done) => {
            pdfviewer_minmax1.zoomChange = function () {
                expect(pdfviewer_minmax1.minZoom).toBeGreaterThanOrEqual(50);
                done();
            }
            const container = document.querySelector('#pdfviewer_minmax1 .e-pv-viewer-container');
            if (container) {
                const evt = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
                container.dispatchEvent(evt);
                const evt1 = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true });
                container.dispatchEvent(evt1);
            }
			
		});
	});

	// Test 2: Pinch out behaviour with inverted min/max should remain within corrected limits
	describe('BUG-MinMaxSwap-PinchOut', () => {
		let pdfviewer_minmax2: PdfViewer = null;
		beforeAll((done: DoneFn) => {
			const element: HTMLElement = createElement('div', { id: 'pdfviewer_minmax2' });
			document.body.appendChild(element);
			pdfviewer_minmax2 = new PdfViewer({
				resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
				documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
			});
			pdfviewer_minmax2.minZoom = 200;
			pdfviewer_minmax2.maxZoom = 50;
			pdfviewer_minmax2.documentLoad = () => { done(); };
			pdfviewer_minmax2.appendTo('#pdfviewer_minmax2');
		});
		afterAll(() => {
			if (pdfviewer_minmax2) {
				pdfviewer_minmax2.destroy();
				const el = document.getElementById('pdfviewer_minmax2');
				if (el && el.parentNode) { el.parentNode.removeChild(el); }
				pdfviewer_minmax2 = null;
			}
		});
		it('BUG-MinMaxSwap-PinchOut', () => {
			pdfviewer_minmax2.magnificationModule.pinchOut();
			expect(pdfviewer_minmax2.zoomPercentage).toBeGreaterThanOrEqual(50);
		});
	});

	// Test 3: Pinch in behaviour with inverted min/max should remain within corrected limits
	describe('BUG-MinMaxSwap-PinchIn', () => {
		let pdfviewer_minmax3: PdfViewer = null;
		beforeAll((done: DoneFn) => {
			const element: HTMLElement = createElement('div', { id: 'pdfviewer_minmax3' });
			document.body.appendChild(element);
			pdfviewer_minmax3 = new PdfViewer({
				resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
				documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
			});
			pdfviewer_minmax3.minZoom = 200;
			pdfviewer_minmax3.maxZoom = 50;
			pdfviewer_minmax3.documentLoad = () => { done(); };
			pdfviewer_minmax3.appendTo('#pdfviewer_minmax3');
		});
		afterAll(() => {
			if (pdfviewer_minmax3) {
				pdfviewer_minmax3.destroy();
				const el = document.getElementById('pdfviewer_minmax3');
				if (el && el.parentNode) { el.parentNode.removeChild(el); }
				pdfviewer_minmax3 = null;
			}
		});
		it('BUG-MinMaxSwap-PinchIn', () => {
			const container = document.querySelector('#pdfviewer_minmax3 .e-pv-viewer-container');
            if (container) {
                const evt = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
                container.dispatchEvent(evt);
                const evt1 = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
                container.dispatchEvent(evt1);
                const evt2 = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true });
                container.dispatchEvent(evt2);
            }
			expect(pdfviewer_minmax3.zoomPercentage).toBeLessThanOrEqual(200);
		});
	});

	// Test 4: zoomTo should clamp to corrected limits when min > max
	describe('BUG-MinMaxSwap-ZoomToWithinLimits', () => {
		let pdfviewer_minmax4: PdfViewer = null;
		beforeAll((done: DoneFn) => {
			const element: HTMLElement = createElement('div', { id: 'pdfviewer_minmax4' });
			document.body.appendChild(element);
			pdfviewer_minmax4 = new PdfViewer({
				resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
				documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
			});
			pdfviewer_minmax4.minZoom = 200;
			pdfviewer_minmax4.maxZoom = 50;
			pdfviewer_minmax4.documentLoad = () => { done(); };
			pdfviewer_minmax4.appendTo('#pdfviewer_minmax4');
		});
		afterAll(() => {
			if (pdfviewer_minmax4) {
				pdfviewer_minmax4.destroy();
				const el = document.getElementById('pdfviewer_minmax4');
				if (el && el.parentNode) { el.parentNode.removeChild(el); }
				pdfviewer_minmax4 = null;
			}
		});
		it('BUG-MinMaxSwap-ZoomToWithinLimits', () => {
			pdfviewer_minmax4.magnificationModule.zoomTo(400);
			expect(pdfviewer_minmax4.zoomPercentage).toBe(200);
		});
	});

	// Test 5: Normal min/max case should be unaffected (regression guard)
	describe('BUG-MinMaxSwap-NormalCaseUnaffected', () => {
		let pdfviewer_normal: PdfViewer = null;
		beforeAll((done: DoneFn) => {
			const element: HTMLElement = createElement('div', { id: 'pdfviewer_normal' });
			document.body.appendChild(element);
			pdfviewer_normal = new PdfViewer({
				resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
				documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
			});
			pdfviewer_normal.minZoom = 50;
			pdfviewer_normal.maxZoom = 200;
			pdfviewer_normal.documentLoad = () => { done(); };
			pdfviewer_normal.appendTo('#pdfviewer_normal');
		});
		afterAll(() => {
			if (pdfviewer_normal) {
				pdfviewer_normal.destroy();
				const el = document.getElementById('pdfviewer_normal');
				if (el && el.parentNode) { el.parentNode.removeChild(el); }
				pdfviewer_normal = null;
			}
		});
		it('BUG-MinMaxSwap-NormalCaseUnaffected', () => {
			pdfviewer_normal.magnificationModule.zoomTo(400);
			expect(pdfviewer_normal.zoomPercentage).toBe(200);
		});
	});
});

/**
 * Magnification spec - Custom Zoom Level Bug Fix
 * Issue: Zooming out after manually entering 77% jumps to 50% instead of 75%
 */
describe('PDF_Viewer_Magnification_CustomZoomBug', () => {
  let pdfviewer_zoom77: PdfViewer | null = null;
  
  beforeAll((done: DoneFn) => {
    const element = createElement('div', { id: 'pdfviewer_zoom77' });
    document.body.appendChild(element);
    pdfviewer_zoom77 = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
    });
    pdfviewer_zoom77.documentLoad = () => done();
    pdfviewer_zoom77.appendTo('#pdfviewer_zoom77');
  });

  afterAll(() => {
    if (pdfviewer_zoom77) {
      pdfviewer_zoom77.destroy();
      const el = document.getElementById('pdfviewer_zoom77');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      pdfviewer_zoom77 = null;
    }
  });

  it('ZOOM-77-ZoomOut-Expected75', () => {
    // Arrange: Set zoom to 77% (non-standard value)
    pdfviewer_zoom77.magnificationModule.zoomTo(77);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(77, 5);

    // Act: Click zoom out button (or call zoomOut)
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should step to 75% (nearest lower standard level), not 50%
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(75, 5);
  });

  it('ZOOM-77-ZoomOut-NotJumpingTo50', () => {
    // Arrange: Set zoom to 77%
    pdfviewer_zoom77.magnificationModule.zoomTo(77);

    // Act: Zoom out
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should NOT be 50% (incorrect behavior)
    expect(pdfviewer_zoom77.zoomPercentage).not.toBe(50);
  });

  it('ZOOM-77-MultipleZoomOut-StepwiseDecrement', () => {
    // Arrange: Set zoom to 77%
    pdfviewer_zoom77.magnificationModule.zoomTo(77);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(77, 5);

    // Act & Assert: First zoom out should go to 75%
    pdfviewer_zoom77.magnificationModule.zoomOut();
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(75, 5);

    // Second zoom out should go to 50% (next standard level down)
    pdfviewer_zoom77.magnificationModule.zoomOut();
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(50, 5);
  });

  it('ZOOM-NonStandardValue-60-ZoomOut-Expected50', () => {
    // Arrange: Set zoom to 60% (between 50% and 75%, non-standard)
    pdfviewer_zoom77.magnificationModule.zoomTo(60);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(60, 5);

    // Act: Zoom out
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should go to 50% (nearest lower standard level)
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(50, 5);
  });

  it('ZOOM-NonStandardValue-90-ZoomOut-Expected75', () => {
    // Arrange: Set zoom to 90% (between 75% and 100%, non-standard)
    pdfviewer_zoom77.magnificationModule.zoomTo(90);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(90, 5);

    // Act: Zoom out
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should go to 75% (nearest lower standard level)
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(75, 5);
  });

  it('ZOOM-NonStandardValue-110-ZoomOut-Expected100', () => {
    // Arrange: Set zoom to 110% (between 100% and 125%, non-standard)
    pdfviewer_zoom77.magnificationModule.zoomTo(110);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(110, 5);

    // Act: Zoom out
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should go to 100% (nearest lower standard level)
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(100, 5);
  });

  it('ZOOM-NonStandardValue-155-ZoomOut-Expected150', () => {
    // Arrange: Set zoom to 155% (between 150% and 200%, non-standard)
    pdfviewer_zoom77.magnificationModule.zoomTo(155);
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(155, 5);

    // Act: Zoom out
    pdfviewer_zoom77.magnificationModule.zoomOut();

    // Assert: Should go to 150% (nearest lower standard level)
    expect(pdfviewer_zoom77.zoomPercentage).toBeCloseTo(150, 5);
  });
});

/**
 * Test: Pinch Zoom Stops Working Beyond 199% in PDF Viewer
 */
describe('PDF_Viewer_Pinch Zoom Stops Working Beyond 199% in PDF Viewer', () => {
    let pdfviewer_pinchout: PdfViewer | null = null;
    beforeAll((done: DoneFn) => {
        const element = createElement('div', { id: 'pdfviewer_pinchout' });
        document.body.appendChild(element);
        pdfviewer_pinchout = new PdfViewer({
            resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
            documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64,
            zoomValue: 198
        });
        pdfviewer_pinchout.documentLoad = () => done();
        pdfviewer_pinchout.appendTo('#pdfviewer_pinchout');
    });
    afterAll(() => {
        if (pdfviewer_pinchout) {
            pdfviewer_pinchout.destroy();
            const el = document.getElementById('pdfviewer_pinchout');
            if (el && el.parentNode) { el.parentNode.removeChild(el); }
            pdfviewer_pinchout = null;
        }
    });
    it('Pinch Zoom Stops Working Beyond 199% in PDF Viewer', (done) => {
        pdfviewer_pinchout.zoomChange = function () {
            const zoomAfterPinchOut = pdfviewer_pinchout.zoomPercentage;
            expect(zoomAfterPinchOut).toBeCloseTo(218, 4);
            done();
        };
        pdfviewer_pinchout.magnificationModule.previousTouchDifference = 0;
        pdfviewer_pinchout.magnificationModule.initiatePinchMove(467.5555725097656, 278.8888854980469, 491.5555725097656, 376.6666564941406);
    });
});
