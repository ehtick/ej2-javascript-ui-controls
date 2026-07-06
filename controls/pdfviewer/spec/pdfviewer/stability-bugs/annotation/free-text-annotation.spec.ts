import {
  PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
  BookmarkView, TextSelection, TextSearch, Print, Annotation, FormFields,
  FormDesigner, PageOrganizer, FreeTextSettings
} from '../../../../src/index';
import { createElement } from '@syncfusion/ej2-base';
import { getTarget, mouseDownEvent, mouseMoveEvent, mouseUpEvent, waitFor, focusOutOnceWithoutNative } from '../../utils.spec';
import { EMPTY_PDF_B64 } from '../../Data/pdf-data.spec';

describe('PDF_Viewer_FreeText_Opacity_Zero_Placement', () => {
  let pdfviewer_freetext: PdfViewer | null = null;

  PdfViewer.Inject(
    Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
    BookmarkView, TextSelection, TextSearch, Print, Annotation,
    FormFields, FormDesigner, PageOrganizer
  );

  beforeAll((done) => {
    const element = createElement('div', { id: 'pdfviewer_freetext' });
    document.body.appendChild(element);
    pdfviewer_freetext = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
    });
    pdfviewer_freetext.documentLoad = () => done();
    pdfviewer_freetext.appendTo('#pdfviewer_freetext');
  });

  afterAll(() => {
    if (pdfviewer_freetext) {
      pdfviewer_freetext.destroy();
      const el = document.getElementById('pdfviewer_freetext');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      pdfviewer_freetext = null;
    }
  });
  it('1009739 - FreeText annotation added with opacity=0 (using annotationAdd)', async () => {
    const target = getTarget('#pdfviewer_freetext_textLayer_0');
    const rect = target.getBoundingClientRect();
    pdfviewer_freetext!.freeTextSettings.opacity = 0;
    pdfviewer_freetext!.annotation.setAnnotationMode('FreeText');
    const annotationAdded = new Promise<void>((resolve) => {
      pdfviewer_freetext!.annotationAdd = () => resolve();
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
    await waitFor(() => pdfviewer_freetext.annotationCollection && pdfviewer_freetext.annotationCollection.length > 0);
    const annotations = pdfviewer_freetext!.annotationCollection || [];
    const last = annotations[annotations.length - 1];
    await waitFor(() => last);

    expect(last).toBeDefined();
    expect(last.opacity).toBe(0);
  });
});

describe('PDF_Viewer_FreeText_AllowEditTextOnly', () => {
  let pdfviewer_freetext_allowText: PdfViewer | null = null;

  PdfViewer.Inject(
    Toolbar, Magnification, Navigation, LinkAnnotation, ThumbnailView,
    BookmarkView, TextSelection, TextSearch, Print, Annotation,
    FormFields, FormDesigner, PageOrganizer
  );

  beforeAll((done) => {
    const element = createElement('div', { id: 'pdfviewer_freetext_allowText' });
    document.body.appendChild(element);
    pdfviewer_freetext_allowText = new PdfViewer({
      resourceUrl: window.location.origin + '/base/src/pdfviewer/ej2-pdfviewer-lib',
      documentPath: 'data:application/pdf;base64,' + EMPTY_PDF_B64
    });
    pdfviewer_freetext_allowText.documentLoad = () => done();
    pdfviewer_freetext_allowText.appendTo('#pdfviewer_freetext_allowText');
  });

  afterAll(() => {
    if (pdfviewer_freetext_allowText) {
      pdfviewer_freetext_allowText.destroy();
      const el = document.getElementById('pdfviewer_freetext_allowText');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      pdfviewer_freetext_allowText = null;
    }
  });
  it('1024303 - FreeText annotation with allowEditTextOnly to true', function(done) {
    const target = getTarget('#pdfviewer_freetext_allowText_textLayer_0');
    pdfviewer_freetext_allowText.freeTextSettings.allowEditTextOnly = true;
    const rect = target.getBoundingClientRect();
    pdfviewer_freetext_allowText.annotation.setAnnotationMode('FreeText');
    
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    mouseMoveEvent(target, x, y);
    mouseDownEvent(target, x, y);
    mouseUpEvent(target, x, y);

    const inputBox: any = document.querySelector('.free-text-input');
    focusOutOnceWithoutNative(inputBox);

    var boundsBeforeResize = pdfviewer_freetext_allowText.annotationCollection[0].bounds;
    pdfviewer_freetext_allowText.annotation.selectAnnotation(pdfviewer_freetext_allowText.annotationCollection[0].annotationId);

    let resizeHandle = document.getElementById("resizeSouthEast");
    const handleRect = resizeHandle.getBoundingClientRect();
    mouseMoveEvent(target, handleRect.left, handleRect.top);
    mouseDownEvent(target, handleRect.left, handleRect.top);
    mouseMoveEvent(target, handleRect.left + 80, handleRect.top + 80);
    mouseUpEvent(target, handleRect.left + 80, handleRect.top + 80);
    mouseUpEvent(target, handleRect.left + 80, handleRect.top + 80);
    var boundsAfterResize = pdfviewer_freetext_allowText.annotationCollection[0].bounds;
    expect(boundsBeforeResize.width).toEqual(boundsAfterResize.width);
    expect(boundsBeforeResize.height).toEqual(boundsAfterResize.height);
    done();
  })
});