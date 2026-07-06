import { createElement } from '@syncfusion/ej2-base';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer } from '../../../src/index';
import { getTarget, waitFor } from '../utils.spec';
import { PDF_Succinctly } from "../Data/pdf-data.spec";

/**
 * Magnification spec - Minimum Zoom Level Rendering Bug
 * Issue: Pages Do Not Render Properly at Minimum Zoom Level (10%)
 * 
 * When navigating to the last page at minimum zoom level (10%), only the last 3 pages
 * are rendered while other pages above remain blank. Scrolling causes pages to render.
 */

describe('PDF_Viewer_Magnification_MinimumZoom', () => {
  let pdfviewer_minzoom: PdfViewer | null = null;

  PdfViewer.Inject(
    Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer
  );

  // ── Load document once; share across all its ─────────────────────────────
  beforeAll((done: DoneFn) => {
    const element = createElement('div', { id: 'pdfviewer_minzoom' });
    document.body.appendChild(element);

    pdfviewer_minzoom = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + PDF_Succinctly,
    });

    pdfviewer_minzoom.documentLoad = () => {
      done();
    };

    pdfviewer_minzoom.appendTo('#pdfviewer_minzoom');
  });

  // ── Cleanup ────────────────────────────────────────────────────────────
  afterAll(() => {
    if (pdfviewer_minzoom) {
      pdfviewer_minzoom.destroy();
      const el = document.getElementById('pdfviewer_minzoom');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      pdfviewer_minzoom = null;
    }
  });

  // ─────────────────────────────────────────────────────────────────────
  // Bug Reproduction Test Cases
  // ─────────────────────────────────────────────────────────────────────

  it('MinZoom-SetZoomTo10Percent-ZoomValueCorrect', (done) => {
    // Act - Set zoom to 10% (minimum)
    if (pdfviewer_minzoom) {
      pdfviewer_minzoom.zoomChange = function () {
        // Assert - Zoom should be set to exactly 10%
        expect(pdfviewer_minzoom.zoomPercentage).toBe(10);
        done();
      }
      pdfviewer_minzoom.magnificationModule.zoomTo(10);
      
      
    }
  });

  it('MinZoom-MultipleZoomInOut-RendersCorrectly', (done) => {
    // Act - Set zoom to 10%, then zoom in and out
    if (pdfviewer_minzoom) {
    
      pdfviewer_minzoom.zoomChange = function () {
          const zoomAfterIn = pdfviewer_minzoom.zoomPercentage;
          // Assert - Zoom should be set to exactly 10%
          expect(zoomAfterIn).toBeGreaterThan(10);
          done();
      }
      pdfviewer_minzoom.magnificationModule.zoomIn();
    }
  });

  it('MinZoom-MultipleZoomOut-RendersCorrectly', (done) => {
    // Act - Set zoom to 10%, then zoom in and out
    if (pdfviewer_minzoom) {
      pdfviewer_minzoom.zoomChange = function () {
        const zoomAfterOut = pdfviewer_minzoom.zoomPercentage;
        expect(zoomAfterOut).toBe(10);
        done();
      }
      pdfviewer_minzoom.magnificationModule.zoomOut();
    }
  });

  it('MinZoom-PageVisibilityAtMinZoom', (done) => {
    // Act - Set zoom to 10% and verify page is visible in viewport
    if (pdfviewer_minzoom) {
      pdfviewer_minzoom.pageRenderComplete = function () {
        // Assert - Page container should be visible and have content
        const pageContent = getTarget('#pdfviewer_minzoom_pageDiv_0');
        expect(pageContent).toBeTruthy();
        done();
      }
      pdfviewer_minzoom.magnificationModule.zoomTo(10);
    }
  });

  it('MinZoom-Page56Rendered-VerifyContent', (done) => {
    try {
      pdfviewer_minzoom.pageRenderComplete = function (args) {
        if (args.data.pageNumber === 55) {
          const textLayer54 = document.querySelector('#pdfviewer_minzoom_textLayer_54') as HTMLElement;
          expect(textLayer54).not.toBeNull();
        }
        if (args.data.pageNumber === 56) {
          const textLayer55 = document.querySelector('#pdfviewer_minzoom_textLayer_55') as HTMLElement;
          expect(textLayer55).not.toBeNull();
          pdfviewer_minzoom.pageRenderComplete = undefined;
          done();
        }
      };
      pdfviewer_minzoom.magnificationModule.zoomTo(10);
      pdfviewer_minzoom.navigation.goToLastPage();
    } catch (error) {
      done.fail(error);
    }
  });

});
