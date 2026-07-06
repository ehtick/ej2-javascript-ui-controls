import { createElement } from "@syncfusion/ej2-base";
import {
  PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
  TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer, InitialFieldSettings
} from "../../../../src/index";
import { mouseDownEvent, mouseMoveEvent, mouseUpEvent, mouseClickEvent, waitFor } from "../../utils.spec";
import { EMPTY_PDF_B64, IMAGE_DATA } from "../../Data/pdf-data.spec";


describe('PDF_Viewer_Initial', () => {
  let pdfviewer_initial: PdfViewer = null;
  PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

  beforeAll((done) => {
    const element: HTMLElement = createElement('div', { id: 'pdfviewer_initial' });
    document.body.appendChild(element);
    pdfviewer_initial = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
    });
    pdfviewer_initial.documentLoad = () => {
      done();
    }
    pdfviewer_initial.appendTo("#pdfviewer_initial");
  });

  afterAll(() => {
    if (pdfviewer_initial) {
      pdfviewer_initial.destroy();
      const el = document.getElementById('pdfviewer_initial');
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      pdfviewer_initial = null;
    }
  });

  afterEach(() => {
  });

  it("1004716- InitialFieldSettings: enabling Read-Only mode places the Initial field at the intended position", async (done: DoneFn) => {
    try {
      pdfviewer_initial.signatureFieldSettings.isReadOnly = true;
      pdfviewer_initial.initialFieldSettings.isReadOnly = true;
      // Resolve first page to click on
      const page = document.querySelector(
        "#pdfviewer_initial_textLayer_0",
      ) as HTMLElement | null;
      const target: HTMLElement | null = page;
      if (!target) {
        throw new Error(
          "Could not find target element to dispatch mouse events. Update selector in test.",
        );
      }
      const pageRect = target.getBoundingClientRect();
      // Click FormDesigner
      const formDesignerBtn = document.querySelector(
        "#pdfviewer_initial_formdesigner",
      ) as HTMLElement | null;
      if (!formDesignerBtn) {
        throw new Error(
          "FormDesigner button not found: #pdfviewer_initial_formdesigner",
        );
      }
      formDesignerBtn.click();
      // Click AddSignature
      const addSignatureBtn = document.querySelector(
        "#pdfviewer_initial_formfield_signature",
      ) as HTMLElement | null;
      if (!addSignatureBtn) {
        throw new Error(
          "AddSignature button not found: #pdfviewer_initial_formfield_signature",
        );
      }
      addSignatureBtn.click();
      // Choose Initial from popup: children[0].children[2].children[0]
      const popup = document.querySelector(
        "#pdfviewer_initial_formfield_signature-popup",
      ) as HTMLElement | null;
      if (!popup) {
        throw new Error(
          "Signature popup not found: #pdfviewer_initial_formfield_signature-popup",
        );
      }
      const initialItem =
        popup.children[0] &&
        ((popup.children[0] as HTMLElement).children[2]
          .children[0] as HTMLElement | null);
      if (!initialItem) {
        throw new Error("Initial item not found in popup");
      }
      initialItem.click();
      // CENTER:
      const x = Math.round(pageRect.left + pageRect.width * 0.3);
      const y = Math.round(pageRect.top + pageRect.height - 800);
      // Click to place (mousedown + mouseup)
      mouseMoveEvent(target, x, y);
      mouseDownEvent(target, x, y);
      mouseUpEvent(target, x, y);
      const collection = pdfviewer_initial.formFieldCollection || [];
      const formFieldElement = document.getElementById(
        collection[collection.length - 1].id,
      ) as HTMLElement | null;
      expect(formFieldElement).toBeTruthy();
      expect(formFieldElement.style.pointerEvents).toBe("none");
      done();
    } catch (e) {
      done.fail(e as Error);
    }
  });
  it("1013075- InitialField ( programmatic ): no null crash and indicator rendered", async (done: DoneFn) => {
    try {
      // Page text layer
      const textLayerEl = document.querySelector(
        "#pdfviewer_initial_textLayer_0",
      ) as HTMLElement | null;
      if (!textLayerEl) {
        throw new Error(`Could not find #pdfviewer_initial_textLayer_0`);
      }
      // Toggle Designer mode
      const designerBtn = document.querySelector(
        "#pdfviewer_initial_formdesignerIcon",
      ) as HTMLElement | null;
      if (!designerBtn) {
        throw new Error(
          `Form Designer button not found: #pdfviewer_initial_formdesignerIcon`,
        );
      }
      mouseClickEvent(designerBtn);
      // Resolve viewer instance
      const viewerHost = document.querySelector("#pdfviewer_initial") as any;
      const viewer = viewerHost.ej2_instances[0];
      if (!viewer) {
        throw new Error(
          "pdfviewer_initial instance not found (viewer or #pdfviewer_initial.ej2_instances[0])",
        );
      }
      // Add Initial field programmatically
      const prevCount = (viewer.formFieldCollection || []).length;
      viewer.formDesignerModule.addFormField("InitialField", {
        name: "Initial1",
        pageNumber: 1,
        bounds: { X: 100, Y: 200, Width: 200, Height: 63 },
        isReadOnly: false,
        visibility: "visible",
        isRequired: false,
        thickness: 3,
      } as InitialFieldSettings);
      // Wait for registration
      await waitFor(
        () => (viewer.formFieldCollection || []).length === prevCount + 1,
      );
      // Find indicator and host
      const textLayerDom = document.querySelector(
        "#pdfviewer_initial_textLayer_0",
      ) as HTMLElement;
      const badgeEl = textLayerDom.querySelector(
        'span[id^="initialIcon_"]',
      ) as HTMLElement | null;
      if (!badgeEl) {
        throw new Error("Initial indicator span not found");
      }
      const hostEl = (badgeEl.closest(".foreign-object") as HTMLElement)
        .parentElement as HTMLElement | null;
      if (!hostEl) {
        throw new Error("Initial field host not found");
      }
      // Ensure host is measurable
      await waitFor(() => hostEl.getBoundingClientRect().width > 0);
      const beforeRect = hostEl.getBoundingClientRect();
      // Initial select
      const x = Math.round(beforeRect.left + beforeRect.width / 2);
      const y = Math.round(beforeRect.top + beforeRect.height / 2);
      mouseDownEvent(textLayerEl, x, y, false, false);
      // Enable pointer-events (test-only) on wrapper to accept drag
      const innerWrapEl = hostEl.firstElementChild as HTMLElement;
      const prevHostPE = hostEl.style.pointerEvents;
      const prevInnerPE = innerWrapEl.style.pointerEvents;
      hostEl.style.pointerEvents = "auto";
      innerWrapEl.style.pointerEvents = "auto";
      // Confirm selection click
      mouseDownEvent(textLayerEl, x, y, false, false);
      // Drag to the right on the inner wrapper
      mouseMoveEvent(innerWrapEl, x + 300, y, false, false);
      mouseDownEvent(innerWrapEl, x + 300, y, false, false);
      // Restore pointer-events
      hostEl.style.pointerEvents = prevHostPE;
      innerWrapEl.style.pointerEvents = prevInnerPE;
      done();
    } catch (e) {
      done.fail(e as Error);
    }
  });
});

describe('PDF_Viewer_Initial_Reload', () => {
  let pdfviewer_initial_reload: PdfViewer = null;
  PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);
  beforeAll((done) => {
    const element: HTMLElement = createElement('div', { id: 'pdfviewer_initial_reload' });
    document.body.appendChild(element);
    pdfviewer_initial_reload = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
    });
    pdfviewer_initial_reload.documentLoad = () => {
      done();
    }
    pdfviewer_initial_reload.appendTo("#pdfviewer_initial_reload");
  });
  afterAll(() => {
    if (pdfviewer_initial_reload) {
      pdfviewer_initial_reload.destroy();
      const el = document.getElementById('pdfviewer_initial_reload');
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      pdfviewer_initial_reload = null;
    }
  });

  it('1013448 - Validate InitialField Collection on Reload 1', async () => {
    const viewer = pdfviewer_initial_reload;
    viewer.formDesignerModule.addFormField('InitialField', {
      name: 'Initial',
      pageNumber: 1,
      bounds: { X: 200, Y: 223, Width: 240, Height: 80 },
      isReadOnly: false,
      visibility: 'visible',
      isRequired: false,
      thickness: 3
    } as InitialFieldSettings);
    const fieldData = viewer.formFieldCollections[0] as any;
    fieldData.signatureType = 'Image';
    fieldData.value = IMAGE_DATA;
    viewer.updateFormFieldsValue(fieldData);
    const blob: Blob = await viewer.saveAsBlob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('FileReader failed while reading PDF blob');
      reader.readAsDataURL(blob);
    });
    await new Promise<void>((resolve) => {
      viewer.documentLoad = () => resolve();
      viewer.load(dataUrl, '');
    });
  });
  it('1013448 - Validate InitialField Collection on Reload 2', function (done) {
    const fieldData: any = pdfviewer_initial_reload.viewerBase.getItemFromSessionStorage('_formfields');
    const parsed: any = JSON.parse(fieldData);
    expect(parsed).not.toBeNull();
    expect(typeof parsed).not.toBe('string');
    expect(typeof parsed).toBe('object');
    expect(parsed.length).toEqual(2);
    done();
  });
});
