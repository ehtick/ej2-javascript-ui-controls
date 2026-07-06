import { createElement } from "@syncfusion/ej2-base";
import {
  PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
  TextSelection, TextSearch, Print, Annotation, FormFields, AnnotationDataFormat, FormDesigner, PageOrganizer,
  SignatureFieldSettings,
  RadioButtonFieldSettings
} from "../../../../src/index";
import { EMPTY_PDF_B64 } from "../../Data/pdf-data.spec";
import { mouseDoubleClickEvent, mouseDownEvent, mouseMoveEvent, mouseUpEvent } from "../../utils.spec";

/**
* PdfViewer spec
*/
describe('PDF_Viewer_RadioButton', () => {
  let pdfviewer_radiobutton: PdfViewer = null;
  PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

  beforeAll((done) => {
    const element: HTMLElement = createElement('div', { id: 'pdfviewer_radiobutton' });
    document.body.appendChild(element);
    pdfviewer_radiobutton = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64
    });
    pdfviewer_radiobutton.documentLoad = () => {
      done();
    }
    pdfviewer_radiobutton.appendTo("#pdfviewer_radiobutton");
  });

  afterAll(() => {
    if (pdfviewer_radiobutton) {
      pdfviewer_radiobutton.destroy();
      const el = document.getElementById('pdfviewer_radiobutton');
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      pdfviewer_radiobutton = null;
    }
  });

  afterEach(() => {
  });

  it("1018968 - Radio button background colors are rendered correctly in read-only mode when configured using radioButtonFieldSettings.", async (done: DoneFn) => {
    try {
      const viewer: any = pdfviewer_radiobutton;
      const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
      expect(formDesigner).toBeTruthy(
        "FormDesigner module must be injected.",
      );
      viewer.radioButtonFieldSettings = { isReadOnly: true };
      const addRadioField = (opts: any) =>
        viewer.formDesignerModule.addFormField("RadioButton", {
          name: "Gender",
          pageNumber: 1,
          bounds: { X: opts.x, Y: 50, Width: 18, Height: 18 },
          isSelected: opts.isSelected,
          tooltip: opts.toolTip || "",
          value: opts.value,
        } as RadioButtonFieldSettings);
      addRadioField({
        x: 100,
        value: "Male",
        isSelected: true,
        toolTip: "Male",
      });
      addRadioField({
        x: 130,
        value: "Female",
        isSelected: false,
        toolTip: "Female",
      });
      const formFieldCollection: any = viewer.formFieldCollection;
      const maleRadioID = formFieldCollection[0].id;
      const maleRadioLabel = document.querySelector(
        `#${maleRadioID}_input_label`,
      ) as HTMLElement | null;
      expect(maleRadioLabel.style.background).toBe("transparent");
      const femaleRadioID = formFieldCollection[1].id;
      const femaleRadioLabel = document.querySelector(
        `#${femaleRadioID}_input_label`,
      ) as HTMLElement | null;
      expect(femaleRadioLabel.style.background).toBe("transparent");
      viewer.radioButtonFieldSettings = { isReadOnly: false };
      done();
    } catch (e) {
      done.fail(e as Error);
    }
  });

  it("1018968 - Radio button background colors are rendered correctly in read-only mode when configured using updateFormField.", async (done: DoneFn) => {
    try {
      const viewer: any = pdfviewer_radiobutton;
      const formDesigner = viewer.formDesigner || viewer.formDesignerModule;
      expect(formDesigner).toBeTruthy(
        "FormDesigner module must be injected.",
      );
      const addRadioField = (opts: any) =>
        viewer.formDesignerModule.addFormField("RadioButton", {
          name: "Syncfusion",
          pageNumber: 1,
          bounds: { X: opts.x, Y: 100, Width: 18, Height: 18 },
          isSelected: opts.isSelected,
          tooltip: opts.toolTip || "",
          value: opts.value,
        } as RadioButtonFieldSettings);
      addRadioField({
        x: 100,
        value: "Mathura",
        isSelected: true,
        toolTip: "Mathura",
      });
      addRadioField({
        x: 130,
        value: "Eymard",
        isSelected: false,
        toolTip: "Eymard",
      });
      expect(viewer.formFieldCollection.length).toBeGreaterThan(0);
      // Save and reload
      const blob: Blob = await viewer.saveAsBlob();
      const dataUrl: string = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject("FileReader failed while reading PDF blob");
        reader.readAsDataURL(blob);
      });
      viewer.documentLoad = () => {
        try {
          // Apply readonly via updateFormField inside documentLoad
          const formFields = viewer.retrieveFormFields();
          for (let i = 0; i < formFields.length; i++) {
            viewer.formDesignerModule.updateFormField(
              viewer.formFieldCollections[i],
              { isReadOnly: true },
            );
          }
          const formFieldCollection: any = viewer.formFieldCollection;
          const mathuraRadioID = formFieldCollection[2].id;
          const mathuraRadioLabel = document.querySelector(
            `#${mathuraRadioID}_input_label`,
          ) as HTMLElement | null;
          expect(mathuraRadioLabel.style.background).toBe("transparent");
          const eymardRadioID = formFieldCollection[3].id;
          const eymardRadioLabel = document.querySelector(
            `#${eymardRadioID}_input_label`,
          ) as HTMLElement | null;
          expect(eymardRadioLabel.style.background).toBe("transparent");
          viewer.documentLoad = null;
          done();
        } catch (e) {
          done.fail(e as Error);
        }
      };
      viewer.load(dataUrl, "");
    } catch (e) {
      done.fail(e as Error);
    }
  });
});
describe('PDF_Viewer_RadioButton_Properties_Dialog', () => {
  let pdfviewer_radioButton: PdfViewer = null;
  PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

  beforeAll((done) => {
    const element: HTMLElement = createElement('div', { id: 'pdfviewer_radioButton_properties' });
    document.body.appendChild(element);
    pdfviewer_radioButton = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
      enableFormDesigner: true
    });
    pdfviewer_radioButton.documentLoad = () => {
      done();
    }
    pdfviewer_radioButton.appendTo("#pdfviewer_radioButton_properties");
  });

  afterAll(() => {
    if (pdfviewer_radioButton) {
      pdfviewer_radioButton.destroy();
      const el = document.getElementById('pdfviewer_radioButton_properties');
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      pdfviewer_radioButton = null;
    }
  });

  afterEach(() => {
  });

  it("EJ2-1021798 - Radio button checked state should update UI immediately when changed via Properties dialog", function (done) {
    try {
      const target = document.querySelector("#pdfviewer_radioButton_properties_textLayer_0");
      const formDesignerButton = document.querySelector('#pdfviewer_radioButton_properties_formdesigner') as HTMLElement;
      formDesignerButton.click();
      pdfviewer_radioButton.formDesignerModule.setFormFieldMode('RadioButton');
      const rectValue = target.getBoundingClientRect();
      const x = Math.round(rectValue.left + 200);
      const y = Math.round(rectValue.top + 200);
      mouseDownEvent(target, x, y);
      mouseMoveEvent(target, x, y);
      mouseMoveEvent(target, x + 10, y + 10);
      mouseUpEvent(target, x + 10, y + 10);
      const fieldId = pdfviewer_radioButton.formFieldCollection[0].id;
      const radioButtonElement = document.getElementById(fieldId + '_content_html_element') as HTMLElement | null;
      expect(radioButtonElement).not.toBeNull();
      const inputElement = radioButtonElement.querySelector('input[type="radio"]') as HTMLInputElement | null;
      expect((inputElement as HTMLInputElement).checked).toBe(false);
      pdfviewer_radioButton.formDesignerModule.selectFormField(fieldId);
      mouseMoveEvent(target, x, y);
      mouseDoubleClickEvent((target as HTMLElement), x, y);
      const propertiesWindow = document.querySelector('#pdfviewer_radioButton_properties_properties_window') as HTMLElement;
      expect(propertiesWindow).toBeTruthy();
      const checkedLabel = propertiesWindow.querySelector('.e-pv-properties-checkbox-checked-input') as HTMLElement;
      expect(checkedLabel).toBeTruthy();
      checkedLabel.click();
      const buttons = propertiesWindow.querySelectorAll('button');
      const okButton = Array.from(buttons).find(
        (btn) => btn.textContent && btn.textContent.trim() === 'OK'
      ) as HTMLButtonElement;
      expect(okButton).toBeTruthy();
      okButton.click();
      const updatedInputElement = radioButtonElement.querySelector('input[type="radio"]');
      expect((updatedInputElement as HTMLInputElement).checked).toBe(true);
      done();
    } catch (e) {
      done.fail(e);
    }
  });
});
describe('PDF_Viewer_RadioButton_Resize', () => {
  let pdfviewer_radioButton_resize: PdfViewer = null;
  PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView, BookmarkView,
    TextSelection, TextSearch, Print, Annotation, FormFields, FormDesigner, PageOrganizer);

  beforeAll((done) => {
    const element: HTMLElement = createElement('div', { id: 'pdfviewer_radio_resize' });
    document.body.appendChild(element);
    pdfviewer_radioButton_resize = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: "data:application/pdf;base64," + EMPTY_PDF_B64,
      enableFormDesigner: true
    });
    pdfviewer_radioButton_resize.documentLoad = () => {
      done();
    }
    pdfviewer_radioButton_resize.appendTo("#pdfviewer_radio_resize");
  });

  afterAll(() => {
    if (pdfviewer_radioButton_resize) {
      pdfviewer_radioButton_resize.destroy();
      const el = document.getElementById('pdfviewer_radio_resize');
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      pdfviewer_radioButton_resize = null;
    }
  });

  afterEach(() => {
  });

  it("1022298 - Resizing a radio button using the left handle only changes the bounding box, not the radiobutton", function (done) {
    try {
      const target = document.querySelector("#pdfviewer_radio_resize_textLayer_0");
      const formDesignerButton = document.querySelector('#pdfviewer_radio_resize_formdesigner') as HTMLElement;
      formDesignerButton.click();
      pdfviewer_radioButton_resize.formDesignerModule.setFormFieldMode('RadioButton');
      const rectValue = target.getBoundingClientRect();
      const x = Math.round(rectValue.left + 200);
      const y = Math.round(rectValue.top + 200);
      mouseDownEvent(target, x, y);
      mouseMoveEvent(target, x, y);
      mouseMoveEvent(target, x + 10, y + 10);
      mouseUpEvent(target, x + 10, y + 10);
      const fieldId = pdfviewer_radioButton_resize.formFieldCollection[0].id;
      pdfviewer_radioButton_resize.formDesignerModule.selectFormField(fieldId);
      const resizeEast = document.querySelector('#resizeEast');
      expect(resizeEast).toBeTruthy();
      const rect = resizeEast.getBoundingClientRect() as DOMRect;
      expect(rect).not.toBeNull();
      const startX = Math.round(rect.left + rect.width / 2);
      const startY = Math.round(rect.top + rect.height / 2);
      mouseMoveEvent(target, startX, startY);
      mouseDownEvent(target, startX, startY);
      mouseMoveEvent(target, startX + 50, startY);
      mouseUpEvent(target, startX + 50, startY);
      const fieldElement = document.getElementById(fieldId + '_content_html_element');
      expect(fieldElement).toBeTruthy();
      const radioInput = fieldElement.querySelector('input[type="radio"]');
      expect(radioInput).toBeTruthy();
      const fieldRect = fieldElement.getBoundingClientRect() as DOMRect;
      expect(fieldRect).not.toBeNull();
      const radioRect = radioInput.getBoundingClientRect() as DOMRect;
      expect(radioRect).not.toBeNull();
      const fieldCenterX = fieldRect.left + fieldRect.width / 2;
      const fieldCenterY = fieldRect.top + fieldRect.height / 2;
      const radioCenterX = radioRect.left + radioRect.width / 2;
      const radioCenterY = radioRect.top + radioRect.height / 2;
      expect(Math.abs(fieldCenterX - radioCenterX)).toBeLessThanOrEqual(1);
      expect(Math.abs(fieldCenterY - radioCenterY)).toBeLessThanOrEqual(1);
      done();
    } catch (e) {
      done.fail(e);
    }
  });
});