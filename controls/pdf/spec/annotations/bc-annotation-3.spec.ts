import { PdfTemplate } from '../../src/pdf/core/graphics/pdf-template';
import { Pdf3DAnnotation, PdfWidgetAnnotation, PdfAttachmentAnnotation, PdfDocumentLinkAnnotation, PdfFileLinkAnnotation, PdfRichMediaAnnotation, PdfSoundAnnotation, PdfTextWebLinkAnnotation, PdfUriAnnotation, PdfSquareAnnotation, PdfStateItem, PdfRedactionAnnotation, PdfTextMarkupAnnotation, PdfInkAnnotation } from '../../src/pdf/core/annotations/annotation';
import * as utils from '../../src/pdf/core/utils';
import { _PdfCheckFieldState, PdfRotationAngle, PdfTextMarkupAnnotationType } from '../../src/pdf/core/enumerator';
import { _PdfDictionary, _PdfReference } from '../../src/pdf/core/pdf-primitives';
import { _TextRenderingMode } from '../../src/pdf/core/graphics/pdf-graphics';
import { _PdfStream } from "../../src/pdf/core/base-stream";
import { PdfAngleMeasurementAnnotation, PdfCircleAnnotation, PdfEllipseAnnotation, PdfFreeTextAnnotation, PdfLineAnnotation, PdfPolygonAnnotation, PdfPolyLineAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation, PdfRubberStampAnnotation, PdfWatermarkAnnotation } from "../../src/pdf/core/annotations/annotation";
import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { PdfPage } from '../../src/pdf/core/pdf-page';
import { _PdfCrossReference } from '../../src/pdf/core/pdf-cross-reference'
import { PdfFontFamily, PdfStandardFont } from '../../src/pdf/core/fonts/pdf-standard-font';



function runDoPostProcessSharedTests(config: {
  suiteName: string;
  createAnnotation: () => any;
  createAppearanceMethod: string;
  createMeasureAppearanceMethod?: string;
}) {
  describe(config.suiteName, () => {
    let annotation: any;
    let dictionary: _PdfDictionary;
    let crossRef: any;
    let appearance: PdfTemplate;

    beforeEach(() => {
      crossRef = {
        _cacheMap: new Map(),
        _getNextReference: jasmine
          .createSpy("_getNextReference")
          .and.returnValue(new _PdfReference(10, 0)),
      };

      dictionary = new _PdfDictionary(crossRef);

      annotation = config.createAnnotation();

      // Force internals
      annotation._dictionary = dictionary;
      annotation._crossReference = crossRef;
      annotation._page = {
        annotations: { remove: jasmine.createSpy("remove") },
      };

      appearance = new PdfTemplate();
      const appearanceDict = { _update: true };
      (appearance as any)._content = {
        dictionary: appearanceDict,
        reference: new _PdfReference(4, 0),
      };

      // Default internal state
      annotation._customTemplate = new Map();
      annotation._setAppearance = false;
      annotation._appearanceTemplate = appearance;

      // Spy all internal helpers
      spyOn(annotation, "_postProcess").and.callFake(() => { });
      spyOn(annotation, config.createAppearanceMethod).and.returnValue(appearance);
      if (config.createMeasureAppearanceMethod) {
        spyOn(annotation, config.createMeasureAppearanceMethod).and.returnValue(appearance);
      }
      spyOn(annotation, "_flattenAnnotationTemplate").and.callFake(() => { });
      spyOn(annotation, "_validateTemplateMatrix").and.returnValue(true);
      spyOn(annotation, "_flattenPopUp").and.callFake(() => { });
      spyOn(annotation, "_flattenLoadedPopUp").and.callFake(() => { });
      spyOn(annotation, "_drawCustomAppearance").and.callFake(() => { });
    });

    it("should create appearance when loaded and setAppearance is true", () => {
      annotation._isLoaded = true;
      annotation._setAppearance = true;
      annotation._appearanceTemplate = {
        _content: { dictionary: {} },
      };

      annotation._doPostProcess(false);

      expect(annotation[config.createAppearanceMethod]).toHaveBeenCalled();
    });
    if (config.createMeasureAppearanceMethod) {
      it("should create measure appearance when Measure dictionary exists", () => {
        annotation._isLoaded = true;
        annotation._setAppearance = true;

        dictionary.update("Measure", true);

        annotation._doPostProcess(false);

        expect(annotation[config.createMeasureAppearanceMethod]).toHaveBeenCalledWith(false);
      });
    }


    it("should read appearance from AP when flattening loaded annotation", () => {
      annotation._isLoaded = true;
      annotation._appearanceTemplate = undefined;

      const stream = new _PdfStream(crossRef, dictionary);
      const ap = new _PdfDictionary(crossRef);
      ap.update("N", stream);
      dictionary.update("AP", ap);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
    });

    it("should call _postProcess when annotation is not loaded", () => {
      annotation._isLoaded = false;

      annotation._doPostProcess(false);

      expect(annotation._postProcess).toHaveBeenCalled();
    });

    it("should create appearance if not loaded, flattening, and no AP exists", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      annotation._doPostProcess(true);

      expect(annotation[config.createAppearanceMethod]).toHaveBeenCalled();
    });

    it("should read AP/N stream when not loaded and flattening", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      const stream = new _PdfStream(crossRef, dictionary);
      const ap = new _PdfDictionary(crossRef);

      ap.update("N", stream);
      dictionary.update("AP", ap);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
    });

    it("should flatten popup for loaded annotation", () => {
      annotation._isLoaded = true;
      annotation.flattenPopups = true;

      annotation._doPostProcess(true);

      expect(annotation._flattenLoadedPopUp).toHaveBeenCalled();
    });

    it("should flatten popup for unloaded annotation", () => {
      annotation._isLoaded = false;
      annotation.flattenPopups = true;
      annotation._appearanceTemplate = {
        _content: { dictionary: {} },
      };

      annotation._doPostProcess(true);

      expect(annotation._flattenPopUp).toHaveBeenCalled();
    });

    it("should flatten annotation when appearance template exists", () => {
      annotation._appearanceTemplate = {
        _content: { dictionary: {} },
      };

      annotation._doPostProcess(true);

      expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
    });

    it("should remove annotation when flattening without appearance template", () => {
      annotation._appearanceTemplate = null;
      annotation._setAppearance = false;
      annotation._customTemplate = new Map();

      spyOn(dictionary, "has").and.callFake((key: string) => {
        if (key === "AP") {
          return true;
        }
        return false;
      });

      spyOn(dictionary, "get").and.callFake((key: string) => {
        if (key === "AP") {
          return {
            has: () => false,
          } as any;
        }
        return undefined as any;
      });

      annotation._doPostProcess(true);

      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should create AP dictionary when not flattening and appearance is set", () => {
      annotation._setAppearance = true;
      annotation._appearanceTemplate = {
        _content: { dictionary: {} },
      };

      annotation._doPostProcess(false);

      expect(dictionary.has("AP")).toBeTruthy();
    });

    it("should draw custom appearance when custom template exists", () => {
      annotation._customTemplate = new Map([["x", {}]]);
      dictionary.update("AP", new _PdfDictionary(crossRef));

      annotation._doPostProcess(false);

      expect(annotation._drawCustomAppearance).toHaveBeenCalled();
    });

    it("should write normal appearance stream reference when no custom template", () => {
      annotation._setAppearance = true;
      dictionary.update("AP", new _PdfDictionary(crossRef));

      annotation._appearanceTemplate = {
        _content: {
          dictionary: {},
          reference: null,
        },
      };

      annotation._doPostProcess(false);

      expect(crossRef._cacheMap.size).toBeGreaterThan(0);
    });

    // -------------------------------------------
    // Explicit else-branch coverage test cases
    // -------------------------------------------

    it("should remove annotation when loaded, flattening, and AP dictionary has no N entry", () => {
      annotation._isLoaded = true;
      annotation._appearanceTemplate = undefined;

      const apWithoutN = {
        has: jasmine.createSpy("has").and.returnValue(false),
        get: jasmine.createSpy("get"),
        getRaw: jasmine.createSpy("getRaw"),
      };

      dictionary.update("AP", apWithoutN as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate).toBeUndefined();
      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should remove annotation when loaded, flattening, and AP/N stream is undefined", () => {
      annotation._isLoaded = true;
      annotation._appearanceTemplate = undefined;

      const apWithUndefinedStream = {
        has: jasmine.createSpy("has").and.callFake((key: string) => key === "N"),
        get: jasmine.createSpy("get").and.returnValue(undefined),
        getRaw: jasmine.createSpy("getRaw").and.returnValue(new _PdfReference(20, 0)),
      };

      dictionary.update("AP", apWithUndefinedStream as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate).toBeUndefined();
      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should create template when loaded and AP/N stream exists even if raw reference is missing", () => {
      annotation._isLoaded = true;
      annotation._appearanceTemplate = undefined;

      const stream = new _PdfStream(crossRef, dictionary);
      (stream as any).reference = undefined;

      const apDict = {
        has: jasmine.createSpy("has").and.callFake((key: string) => key === "N"),
        get: jasmine.createSpy("get").and.returnValue(stream),
        getRaw: jasmine.createSpy("getRaw").and.returnValue(undefined),
      };

      dictionary.update("AP", apDict as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
      expect((stream as any).reference).toBeUndefined();
    });

    it("should remove annotation when not loaded, flattening, and AP dictionary resolves to null", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      dictionary.update("AP", {} as any);

      spyOn(dictionary, "get").and.callFake((key: string) => {
        if (key === "AP") {
          return null;
        }
        return undefined as any;
      });

      annotation._doPostProcess(true);

      expect(annotation._postProcess).toHaveBeenCalledWith(true);
      expect(annotation._appearanceTemplate).toBeUndefined();
      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should remove annotation when not loaded, flattening, and AP dictionary has no N entry", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      const apWithoutN = {
        has: jasmine.createSpy("has").and.returnValue(false),
        get: jasmine.createSpy("get"),
        getRaw: jasmine.createSpy("getRaw"),
      };

      dictionary.update("AP", apWithoutN as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate).toBeUndefined();
      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should remove annotation when not loaded, flattening, and AP/N stream is undefined", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      const apWithUndefinedStream = {
        has: jasmine.createSpy("has").and.callFake((key: string) => key === "N"),
        get: jasmine.createSpy("get").and.returnValue(undefined),
        getRaw: jasmine.createSpy("getRaw").and.returnValue(new _PdfReference(30, 0)),
      };

      dictionary.update("AP", apWithUndefinedStream as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate).toBeUndefined();
      expect(annotation._page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    it("should create template when not loaded and AP/N stream exists even if raw reference is missing", () => {
      annotation._isLoaded = false;
      annotation._appearanceTemplate = undefined;

      const stream = new _PdfStream(crossRef, dictionary);
      (stream as any).reference = undefined;

      const apDict = {
        has: jasmine.createSpy("has").and.callFake((key: string) => key === "N"),
        get: jasmine.createSpy("get").and.returnValue(stream),
        getRaw: jasmine.createSpy("getRaw").and.returnValue(undefined),
      };

      dictionary.update("AP", apDict as any);

      annotation._doPostProcess(true);

      expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
      expect((stream as any).reference).toBeUndefined();
    });
  });
}

runDoPostProcessSharedTests({
  suiteName: "PdfCircleAnnotation._doPostProcess",
  createAnnotation: () => new PdfCircleAnnotation({} as any),
  createAppearanceMethod: "_createCircleAppearance",
  createMeasureAppearanceMethod: "_createCircleMeasureAppearance",
});

runDoPostProcessSharedTests({
  suiteName: "PdfLineAnnotation._doPostProcess",
  createAnnotation: () => new PdfLineAnnotation({} as any, {} as any),
  createAppearanceMethod: "_createAppearance",
  createMeasureAppearanceMethod: "_createLineMeasureAppearance",
});

runDoPostProcessSharedTests({
  suiteName: "PdfRectangleAnnotation._doPostProcess",
  createAnnotation: () => new PdfSquareAnnotation({} as any),
  createAppearanceMethod: "_createRectangleAppearance",
  createMeasureAppearanceMethod: "_createSquareMeasureAppearance",
});

runDoPostProcessSharedTests({
  suiteName: "PdfEllipseAnnotation._doPostProcess",
  createAnnotation: () => new PdfEllipseAnnotation({} as any),
  createAppearanceMethod: "_createCircleAppearance"
});

runDoPostProcessSharedTests({
  suiteName: "PdfRectangleAnnotation._doPostProcess",
  createAnnotation: () => new PdfRectangleAnnotation({} as any),
  createAppearanceMethod: "_createRectangleAppearance"
});


// Link annotation DoPostProcess
export function runDoPostProcessSharedSpec(
  annotationName: string,
  AnnotationCtor: new () => any
): void {

  describe(`${annotationName}._doPostProcess (shared behavior)`, () => {
    let annotation: any;
    let mainDictionary: any;
    let apDictionary: any;
    let originalPdfTemplate: any

    beforeEach(() => {
      originalPdfTemplate = PdfTemplate;
      (PdfTemplate as any) = jasmine
        .createSpy('PdfTemplate')
        .and.callFake(() => ({
          _content: {
            dictionary: {}
          },
          _size: {
            width: 100,
            height: 100
          }
        }));
      apDictionary = {
        has: jasmine.createSpy('has'),
        get: jasmine.createSpy('get'),
        getRaw: jasmine.createSpy('getRaw')
      };

      mainDictionary = {
        has: jasmine.createSpy('has'),
        get: jasmine.createSpy('get')
      };

      annotation = new AnnotationCtor();

      annotation._isLoaded = false;
      annotation._dictionary = mainDictionary;
      annotation._page = {};
      annotation._crossReference = {};

      annotation._postProcess =
        jasmine.createSpy('_postProcess');

      annotation._validateTemplateMatrix =
        jasmine.createSpy('_validateTemplateMatrix').and.returnValue(true);

      annotation._flattenAnnotationTemplate =
        jasmine.createSpy('_flattenAnnotationTemplate');

      annotation._removeAnnotation =
        jasmine.createSpy('_removeAnnotation');
    });

    afterEach(() => {
      (PdfTemplate as any) = originalPdfTemplate;
    });

    it('does nothing when isFlatten is false', () => {
      annotation._doPostProcess(false);

      expect(annotation._flattenAnnotationTemplate).not.toHaveBeenCalled();
      expect(annotation._removeAnnotation).not.toHaveBeenCalled();
    });

    it('flattens annotation when appearance stream exists', () => {
      const appearanceStream: any = {};
      const reference = { id: 1 };

      apDictionary.has.and.callFake((key: string) => key === 'N');
      apDictionary.get.and.returnValue(appearanceStream);
      apDictionary.getRaw.and.returnValue(reference);

      mainDictionary.has.and.callFake((key: string) => key === 'AP');
      mainDictionary.get.and.returnValue(apDictionary);

      annotation._doPostProcess(true);

      expect(appearanceStream.reference).toBe(reference);
      expect(annotation._validateTemplateMatrix).toHaveBeenCalled();
      expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
      expect(annotation._removeAnnotation).not.toHaveBeenCalled();
    });

    it('flattens annotation when template matrix is not normal', () => {
      annotation._validateTemplateMatrix.and.returnValue(false);

      const appearanceStream: any = {};

      apDictionary.has.and.returnValue(true);
      apDictionary.get.and.returnValue(appearanceStream);
      apDictionary.getRaw.and.returnValue(null);

      mainDictionary.has.and.returnValue(true);
      mainDictionary.get.and.returnValue(apDictionary);

      annotation._doPostProcess(true);

      expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
    });

    it('removes annotation when AP dictionary is missing (else block)', () => {
      mainDictionary.has.and.returnValue(false);

      annotation._doPostProcess(true);

      expect(annotation._removeAnnotation).toHaveBeenCalledWith(
        annotation._page,
        annotation
      );
    });


    it('defaults isFlatten to false when parameter is undefined', () => {
      annotation._doPostProcess();

      expect(annotation._flattenAnnotationTemplate).not.toHaveBeenCalled();
      expect(annotation._removeAnnotation).not.toHaveBeenCalled();
    });

    it('defaults isLoaded to true _postProcess not to be called', () => {
      annotation._isLoaded = true;
      annotation._doPostProcess();

      expect(annotation._postProcess).not.toHaveBeenCalled();
    });


    it('removes annotation when N appearance is missing', () => {
      apDictionary.has.and.returnValue(false);

      mainDictionary.has.and.returnValue(true);
      mainDictionary.get.and.returnValue(apDictionary);

      annotation._doPostProcess(true);

      expect(annotation._removeAnnotation).toHaveBeenCalled();
    });
    if (annotationName === 'PdfDocumentLinkAnnotation') {
      it('updates Dest when loaded and destination exists', () => {
        annotation._isLoaded = true;
        annotation._destination = { _array: [1, 2, 3] };
        annotation._dictionary.update = jasmine.createSpy('update');

        annotation._doPostProcess(false);

        expect(annotation._dictionary.update)
          .toHaveBeenCalledWith('Dest', [1, 2, 3]);
      });
    }
  });
}

runDoPostProcessSharedSpec(
  'PdfUriAnnotation',
  PdfUriAnnotation
);
runDoPostProcessSharedSpec(
  'PdfFileLinkAnnotation',
  PdfFileLinkAnnotation
);
runDoPostProcessSharedSpec(
  'PdfDocumentLinkAnnotation',
  PdfDocumentLinkAnnotation
);
runDoPostProcessSharedSpec(
  'PdfTextWebLinkAnnotation',
  PdfTextWebLinkAnnotation
);
runDoPostProcessSharedSpec(
  'PdfAttachmentAnnotation',
  PdfAttachmentAnnotation
);
runDoPostProcessSharedSpec(
  'PdfTextWebLinkAnnotation',
  PdfTextWebLinkAnnotation
);
runDoPostProcessSharedSpec(
  'Pdf3DAnnotation',
  Pdf3DAnnotation
);
runDoPostProcessSharedSpec(
  'PdfSoundAnnotation',
  PdfSoundAnnotation
);
runDoPostProcessSharedSpec(
  'PdfRichMediaAnnotation',
  PdfRichMediaAnnotation
);

describe('PdfPolygonAnnotation._doPostProcess - full branch coverage (no helper)', () => {

  let annotation: any;
  let crossRef: any;
  let dictionary: _PdfDictionary;
  let appearanceTemplate: PdfTemplate;

  beforeEach(() => {
    crossRef = {
      _cacheMap: new Map(),
      _getNextReference: jasmine
        .createSpy('_getNextReference')
        .and.returnValue(new _PdfReference(1, 0))
    };

    dictionary = new _PdfDictionary(crossRef);

    annotation = new PdfPolygonAnnotation({} as any);
    annotation._dictionary = dictionary;
    annotation._crossReference = crossRef;

    annotation._page = {
      annotations: { remove: jasmine.createSpy('remove') }
    };

    annotation._customTemplate = new Map();
    annotation._setAppearance = false;
    annotation._isLoaded = true;
    annotation.flattenPopups = false;

    annotation.points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ];

    appearanceTemplate = new PdfTemplate();
    (appearanceTemplate as any)._content = {
      dictionary: new _PdfDictionary(crossRef),
      reference: new _PdfReference(5, 0)
    };

    annotation._appearanceTemplate = appearanceTemplate;

    spyOn(annotation, '_postProcess').and.callFake(() => { });
    spyOn(annotation, '_createPolygonAppearance').and.returnValue(appearanceTemplate);
    spyOn(annotation, '_flattenAnnotationTemplate').and.callFake(() => { });
    spyOn(annotation, '_validateTemplateMatrix').and.returnValue(true);
    spyOn(annotation, '_flattenLoadedPopUp').and.callFake(() => { });
    spyOn(annotation, '_drawCustomAppearance').and.callFake(() => { });
  });

  /* ------------------------------------------------------------
     Loaded annotation
  ------------------------------------------------------------ */

  it('creates appearance when loaded and _setAppearance is true', () => {
    annotation._setAppearance = true;

    annotation._doPostProcess(false);

    expect(annotation._createPolygonAppearance).toHaveBeenCalledWith(false);
  });

  it('creates appearance when loaded, flattening, and AP is missing', () => {
    annotation._appearanceTemplate = undefined;

    annotation._doPostProcess(true);

    expect(annotation._createPolygonAppearance).toHaveBeenCalledWith(true);
  });

  it('reads AP/N stream when flattening loaded annotation and appearance not created', () => {
    annotation._appearanceTemplate = undefined;

    const stream = new _PdfStream(crossRef, dictionary);
    const ap = new _PdfDictionary(crossRef);
    ap.update('N', stream);
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
  });

  it('removes annotation when flattening and no AP/N exists', () => {
    annotation._appearanceTemplate = undefined;

    const ap = new _PdfDictionary(crossRef); // no N
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._page.annotations.remove)
      .toHaveBeenCalledWith(annotation);
  });

  it('calls _postProcess when annotation is not loaded', () => {
    annotation._isLoaded = false;

    annotation._doPostProcess(false);

    expect(annotation._postProcess).toHaveBeenCalledWith(false);
  });

  it('reads AP/N stream when not loaded and flattening', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    const stream = new _PdfStream(crossRef, dictionary);
    const ap = new _PdfDictionary(crossRef);
    ap.update('N', stream);
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
  });

  it('removes annotation when not loaded, flattening, and AP/N missing', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    dictionary.update('AP', new _PdfDictionary(crossRef));

    annotation._doPostProcess(true);

    expect(annotation._page.annotations.remove)
      .toHaveBeenCalledWith(annotation);
  });

  it('flattens popup when flattenPopups is true and loaded', () => {
    annotation.flattenPopups = true;

    annotation._doPostProcess(true);

    expect(annotation._flattenLoadedPopUp).toHaveBeenCalled();
  });

  /* ------------------------------------------------------------
     Flattening with appearanceTemplate
  ------------------------------------------------------------ */

  it('flattens annotation template when flattening and appearance exists', () => {
    annotation._doPostProcess(true);

    expect(annotation._flattenAnnotationTemplate)
      .toHaveBeenCalledWith(annotation._appearanceTemplate, true);
  });

  it('updates Matrix when flattening and Matrix is missing', () => {
    const dict = annotation._appearanceTemplate._content.dictionary;
    dict.update('BBox', [10, 20, 100, 100]);

    annotation._doPostProcess(true);

    expect(dict.has('Matrix')).toBeTruthy();
  });

  it('creates AP dictionary when not flattening and _setAppearance is true', () => {
    annotation._setAppearance = true;

    annotation._doPostProcess(false);

    expect(dictionary.has('AP')).toBeTruthy();
  });

  it('draws custom appearance when custom template exists', () => {
    annotation._customTemplate.set('X', {});

    dictionary.update('AP', new _PdfDictionary(crossRef));

    annotation._doPostProcess(false);

    expect(annotation._drawCustomAppearance).toHaveBeenCalled();
  });

  it('writes appearance stream reference when no custom template exists', () => {
    annotation._setAppearance = true;
    dictionary.update('AP', new _PdfDictionary(crossRef));

    annotation._doPostProcess(false);

    expect(crossRef._cacheMap.size).toBeGreaterThan(0);
  });

});
describe('PdfPolyLineAnnotation._doPostProcess - full branch coverage', () => {
  let annotation: any, crossRef: any, page: any;

  beforeEach(() => {
    crossRef = { _cacheMap: new Map(), _getNextReference: () => ({}) };
    page = { annotations: { remove: jasmine.createSpy('remove') } };

    annotation = new PdfPolyLineAnnotation();
    annotation._crossReference = crossRef;
    annotation._dictionary = new _PdfDictionary(crossRef);
    annotation._page = page;

    spyOn(annotation, '_createPolyLineAppearance').and.returnValue({ _content: { dictionary: new _PdfDictionary(crossRef) } });
    spyOn(annotation, '_postProcess').and.callFake(() => { });
    spyOn(annotation, '_flattenLoadedPopUp').and.callFake(() => { });
    spyOn(annotation, '_validateTemplateMatrix').and.returnValue(true);
    spyOn(annotation, '_flattenAnnotationTemplate').and.callFake(() => { });
    spyOn(annotation, '_drawCustomAppearance').and.callFake(() => { });
    spyOn(utils, '_removeDuplicateReference').and.callFake(() => { });
  });

  it('isLoaded=true with setAppearance', () => {
    annotation._isLoaded = true;
    annotation._setAppearance = true;
    annotation._doPostProcess(false);
    expect(annotation._createPolyLineAppearance).toHaveBeenCalled();
  });

  it('isLoaded=true with customTemplate', () => {
    annotation._isLoaded = true;
    annotation._customTemplate.set('N', {});
    annotation._doPostProcess(false);
    expect(annotation._createPolyLineAppearance).toHaveBeenCalled();
  });

  it('isLoaded=true flatten with no AP', () => {
    annotation._isLoaded = true;
    annotation._dictionary = new _PdfDictionary(crossRef);
    annotation._doPostProcess(true);
    expect(annotation._createPolyLineAppearance).toHaveBeenCalled();
  });

  it('isLoaded=false flatten with no AP', () => {
    annotation._isLoaded = false;
    annotation._dictionary = new _PdfDictionary(crossRef);
    annotation._doPostProcess(true);
    expect(annotation._createPolyLineAppearance).toHaveBeenCalled();
  });

  it('flattenPopups branch', () => {
    annotation._isLoaded = true;
    annotation.flattenPopups = true;
    annotation._doPostProcess(false);
    expect(annotation._flattenLoadedPopUp).toHaveBeenCalled();
  });

  it('final flatten with appearanceTemplate', () => {
    annotation._isLoaded = true;
    annotation._appearanceTemplate = { _content: { dictionary: new _PdfDictionary(crossRef) } };
    annotation._doPostProcess(true);
    expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
  });

  it('non-flatten with setAppearance and AP', () => {
    annotation._isLoaded = true;
    annotation._setAppearance = true;
    const apDict = new _PdfDictionary(crossRef);
    annotation._dictionary.set('AP', apDict);
    annotation._appearanceTemplate = { _content: { dictionary: new _PdfDictionary(crossRef) } };
    annotation._doPostProcess(false);
    expect(utils._removeDuplicateReference).toHaveBeenCalled();
  });

  it('non-flatten with setAppearance and no AP', () => {
    annotation._isLoaded = true;
    annotation._setAppearance = true;
    annotation._appearanceTemplate = { _content: { dictionary: new _PdfDictionary(crossRef) } };
    annotation._doPostProcess(false);
    expect(annotation._dictionary.has('AP')).toBeTruthy();
  });

  it('non-flatten with customTemplate', () => {
    annotation._isLoaded = true;
    annotation._setAppearance = true;
    annotation._customTemplate.set('N', {});
    annotation._doPostProcess(false);
    expect(annotation._drawCustomAppearance).toHaveBeenCalled();
  });
});
describe('PdfAngleMeasurementAnnotation._doPostProcess', () => {

  let annotation: any;
  let dictionary: _PdfDictionary;
  let crossRef: any;
  let page: any;
  let appearanceTemplate: any;

  beforeEach(() => {
    crossRef = {
      _cacheMap: new Map(),
      _getNextReference: jasmine
        .createSpy('_getNextReference')
        .and.returnValue(new _PdfReference(10, 0))
    };

    dictionary = new _PdfDictionary(crossRef);

    page = {
      annotations: { remove: jasmine.createSpy('remove') }
    };

    annotation = new PdfAngleMeasurementAnnotation();
    annotation._dictionary = dictionary;
    annotation._crossReference = crossRef;
    annotation._page = page;

    annotation._customTemplate = new Map();
    annotation._setAppearance = false;
    annotation._isLoaded = true;
    annotation.flatten = false;

    appearanceTemplate = new PdfTemplate();
    (appearanceTemplate as any)._content = {
      dictionary: new _PdfDictionary(crossRef),
      reference: new _PdfReference(5, 0)
    };

    annotation._appearanceTemplate = appearanceTemplate;

    spyOn(annotation, '_postProcess').and.callFake(() => { });
    spyOn(annotation, '_createAngleMeasureAppearance')
      .and.returnValue(appearanceTemplate);
    spyOn(annotation, '_validateTemplateMatrix').and.returnValue(true);
    spyOn(annotation, '_flattenAnnotationTemplate').and.callFake(() => { });
    spyOn(annotation, '_drawCustomAppearance').and.callFake(() => { });
  });

  /* ------------------------------------------------------------------
     Loaded annotation
  ------------------------------------------------------------------ */

  it('creates appearance when loaded, not flattening, and setAppearance is true', () => {
    annotation._setAppearance = true;

    annotation._doPostProcess(false);

    expect(annotation._createAngleMeasureAppearance).toHaveBeenCalled();
    expect(annotation._appearanceTemplate).toBeDefined();
  });

  it('creates appearance when loaded, not flattening, and customTemplate exists', () => {
    annotation._customTemplate.set('N', {});

    annotation._doPostProcess(false);

    expect(annotation._createAngleMeasureAppearance).toHaveBeenCalled();
  });

  it('reads AP/N stream when loaded, flattening, and appearance template is missing', () => {
    annotation._appearanceTemplate = undefined;

    const stream = new _PdfStream(crossRef, dictionary);
    const ap = new _PdfDictionary(crossRef);
    ap.update('N', stream);
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
  });

  /* ------------------------------------------------------------------
     Unloaded annotation
  ------------------------------------------------------------------ */

  it('calls _postProcess when annotation is not loaded', () => {
    annotation._isLoaded = false;

    annotation._doPostProcess(false);

    expect(annotation._postProcess).toHaveBeenCalled();
  });

  it('creates appearance when not loaded, flattening, and AP is missing', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    annotation._doPostProcess(true);

    expect(annotation._createAngleMeasureAppearance).toHaveBeenCalled();
  });

  it('reads AP/N stream when not loaded and flattening', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    const stream = new _PdfStream(crossRef, dictionary);
    const ap = new _PdfDictionary(crossRef);
    ap.update('N', stream);
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
  });

  /* ------------------------------------------------------------------
     Flattening behavior
  ------------------------------------------------------------------ */

  it('validates matrix, injects Matrix if missing, and flattens appearance', () => {
    const contentDict = annotation._appearanceTemplate._content.dictionary;
    contentDict.update('BBox', [10, 20, 100, 100]);

    annotation._doPostProcess(true);

    expect(annotation._validateTemplateMatrix).toHaveBeenCalled();
    expect(contentDict.has('Matrix')).toBeTruthy();
    expect(annotation._flattenAnnotationTemplate)
      .toHaveBeenCalledWith(annotation._appearanceTemplate, true);
  });

  it('removes annotation when flattening and no appearanceTemplate exists', () => {
    annotation._appearanceTemplate = undefined;

    annotation._doPostProcess(true);

    expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
  });

  /* ------------------------------------------------------------------
     Non‑flatten AP management
  ------------------------------------------------------------------ */

  it('creates AP dictionary when not flattening and setAppearance is true', () => {
    annotation._setAppearance = true;

    annotation._doPostProcess(false);

    expect(dictionary.has('AP')).toBeTruthy();
  });

  it('draws custom appearance when customTemplate exists', () => {
    annotation._customTemplate.set('X', {});
    dictionary.update('AP', new _PdfDictionary(crossRef));

    annotation._doPostProcess(false);

    expect(annotation._drawCustomAppearance).toHaveBeenCalled();
  });

  it('writes appearance stream reference when no custom template exists', () => {
    annotation._setAppearance = true;
    dictionary.update('AP', new _PdfDictionary(crossRef));

    annotation._doPostProcess(false);

    expect(crossRef._cacheMap.size).toBeGreaterThan(0);
  });

});
describe('PdfRedactionAnnotation._doPostProcess', () => {

  let annotation: any;
  let dictionary: _PdfDictionary;
  let crossRef: any;
  let page: any;
  let appearanceTemplate: any;

  beforeEach(() => {
    crossRef = {
      _cacheMap: new Map(),
      _getNextReference: jasmine
        .createSpy('_getNextReference')
        .and.returnValue(new _PdfReference(10, 0))
    };

    dictionary = new _PdfDictionary(crossRef);

    page = {
      annotations: { remove: jasmine.createSpy('remove') }
    };

    annotation = new PdfRedactionAnnotation();
    annotation._dictionary = dictionary;
    annotation._crossReference = crossRef;
    annotation._page = page;

    annotation._isImported = false;
    annotation._isLoaded = true;
    annotation.flatten = false;

    appearanceTemplate = new PdfTemplate();
    (appearanceTemplate as any)._content = {
      dictionary: new _PdfDictionary(crossRef),
      reference: new _PdfReference(5, 0)
    };

    annotation._appearanceTemplate = appearanceTemplate;

    spyOn(annotation, '_postProcess').and.callFake(() => { });
    spyOn(annotation, '_createRedactionAppearance')
      .and.returnValue(appearanceTemplate);
    spyOn(annotation, '_validateTemplateMatrix').and.returnValue(true);
    spyOn(annotation, '_flattenAnnotationTemplate').and.callFake(() => { });
  });

  /* ------------------------------------------------------------------
     Imported annotation
  ------------------------------------------------------------------ */

  it('does nothing when annotation is imported', () => {
    annotation._isImported = true;

    annotation._doPostProcess(true);

    expect(annotation._createRedactionAppearance).not.toHaveBeenCalled();
    expect(page.annotations.remove).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------
     Loaded annotation
  ------------------------------------------------------------------ */

  it('creates redaction appearance when loaded', () => {
    annotation._isLoaded = true;

    annotation._doPostProcess(false);

    expect(annotation._createRedactionAppearance)
      .toHaveBeenCalledWith(false);
  });

  /* ------------------------------------------------------------------
     Unloaded annotation
  ------------------------------------------------------------------ */

  it('calls _postProcess when annotation is not loaded', () => {
    annotation._isLoaded = false;

    annotation._doPostProcess(false);

    expect(annotation._postProcess).toHaveBeenCalledWith(false);
  });

  it('creates appearance when not loaded, flattening, and AP is missing', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    annotation._doPostProcess(true);

    expect(annotation._createRedactionAppearance)
      .toHaveBeenCalledWith(true);
  });

  it('reads AP/N stream when not loaded and flattening', () => {
    annotation._isLoaded = false;
    annotation._appearanceTemplate = undefined;

    const stream = new _PdfStream(crossRef, dictionary);
    const ap = new _PdfDictionary(crossRef);
    ap.update('N', stream);
    dictionary.update('AP', ap);

    annotation._doPostProcess(true);

    expect(annotation._appearanceTemplate instanceof PdfTemplate).toBeTruthy();
  });

  /* ------------------------------------------------------------------
     Flattening behavior
  ------------------------------------------------------------------ */

  it('validates matrix, injects Matrix if missing, and flattens annotation', () => {
    const contentDict = annotation._appearanceTemplate._content.dictionary;
    contentDict.update('BBox', [10, 20, 100, 100]);

    annotation._doPostProcess(true);

    expect(annotation._validateTemplateMatrix).toHaveBeenCalled();
    expect(contentDict.has('Matrix')).toBeTruthy();
    expect(annotation._flattenAnnotationTemplate)
      .toHaveBeenCalledWith(annotation._appearanceTemplate, true);
  });
});
describe('PdfStateItem._doPostProcess - lines 19339-19363', () => {

  it('no template: sets dictionary updated to false and does nothing else', () => {
    // Arrange
    const item: any = new PdfStateItem();
    item._dictionary = { _updated: true, has: () => { } };
    spyOnProperty(item, 'checked', 'get').and.returnValue(false);
    spyOn(utils as any, '_getStateTemplate').and.returnValue({});

    // Act
    item._doPostProcess();

    // Assert
    expect(item._dictionary._updated).toBe(false);

  });

  it('template present but no page: sets dictionary updated false', () => {
    // Arrange
    const item: any = new PdfStateItem();
    item._dictionary = { _updated: true };
    spyOnProperty(item, 'checked', 'get').and.returnValue(true);
    const template = { id: 't' };
    spyOn(utils as any, '_getStateTemplate').and.returnValue(template);
    item._getPage = () => null as any;

    // Act
    item._doPostProcess();

    // Assert
    expect(item._dictionary._updated).toBe(false);

  });

  function makeGraphicsSpy() {
    const calls: string[] = [];
    const graphics: any = {
      _size: { width: 100, height: 200 },
      save: () => { calls.push('save'); },
      translateTransform: (p: any) => { calls.push('translate:' + JSON.stringify(p)); },
      rotateTransform: (a: number) => { calls.push('rotate:' + a); },
      _sw: { _setTextRenderingMode: (m: any) => { calls.push('setText:' + m); } },
      drawTemplate: (t: any, b: any) => { calls.push('drawTemplate'); },
      restore: () => { calls.push('restore'); }
    };
    return { graphics, calls };
  }
  it('rotation 180: rotates -180 and draws template', () => {
    // Arrange
    const item: any = new PdfStateItem();
    item._dictionary = { _updated: true };
    spyOnProperty(item, 'checked', 'get').and.returnValue(true);
    const template = { id: 't' };
    spyOn(utils as any, '_getStateTemplate').and.returnValue(template);
    const { graphics, calls } = makeGraphicsSpy();
    const page: any = { graphics: graphics, rotation: PdfRotationAngle.angle180 };
    item._getPage = () => page;

    // Act
    item._doPostProcess();

    // Assert
    expect(calls).toContain('rotate:-180');
    expect(calls).toContain('drawTemplate');
    expect(item._dictionary._updated).toBe(false);

  });

  it('rotation 270: rotates 270 and draws template', () => {
    // Arrange
    const item: any = new PdfStateItem();
    item._dictionary = { _updated: true };
    spyOnProperty(item, 'checked', 'get').and.returnValue(true);
    const template = { id: 't' };
    spyOn(utils as any, '_getStateTemplate').and.returnValue(template);
    const { graphics, calls } = makeGraphicsSpy();
    const page: any = { graphics: graphics, rotation: PdfRotationAngle.angle270 };
    item._getPage = () => page;

    // Act
    item._doPostProcess();

    // Assert
    expect(calls).toContain('rotate:270');
    expect(calls).toContain('drawTemplate');
    expect(item._dictionary._updated).toBe(false);

  });

  it('no-rotation (default): does not call rotateTransform but still draws', () => {
    // Arrange
    const item: any = new PdfStateItem();
    item._dictionary = { _updated: true };
    spyOnProperty(item, 'checked', 'get').and.returnValue(false);
    const template = { id: 't' };
    spyOn(utils as any, '_getStateTemplate').and.returnValue(template);
    const { graphics, calls } = makeGraphicsSpy();
    const page: any = { graphics: graphics, rotation: PdfRotationAngle.angle0 };
    item._getPage = () => page;

    // Act
    item._doPostProcess();

    // Assert
    expect(calls.indexOf('save')).toBeGreaterThan(-1);
    expect(calls.some(c => c.indexOf('rotate:') === 0)).toBe(false);
    expect(calls).toContain('drawTemplate');
    expect(item._dictionary._updated).toBe(false);

  });

});
describe('PdfPopupAnnotation._doPostProcess - branch coverage', () => {
  let annotation: any;
  let apDict: any;
  let appearanceStream: any;
  let original: any
  beforeEach(() => {
    appearanceStream = { reference: null };
    original = PdfTemplate;
    (PdfTemplate as any) = jasmine
      .createSpy('PdfTemplate')
      .and.callFake(() => ({
        _content: {
          dictionary: {}
        },
        _size: {
          width: 100,
          height: 100
        }
      }));
    apDict = jasmine.createSpyObj('APDictionary', ['has', 'get', 'getRaw']);
    apDict.has.and.callFake((key: string) => key === 'N');
    apDict.get.and.returnValue(appearanceStream);
    apDict.getRaw.and.returnValue({});

    annotation = {
      _isLoaded: false,
      _isFlattenPopups: true,
      _appearanceTemplate: null,
      _dictionary: jasmine.createSpyObj('dict', ['has', 'get']),
      _crossReference: {},
      _page: {
        graphics: {
          save: jasmine.createSpy().and.returnValue('state'),
          restore: jasmine.createSpy(),
          setTransparency: jasmine.createSpy(),
          drawTemplate: jasmine.createSpy()
        }
      },
      bounds: {},
      opacity: 0.5,
      flattenPopups: false,
      flatten: false,

      /* internal methods */
      _postProcess: jasmine.createSpy(),
      _createPopupAppearance: jasmine.createSpy().and.returnValue({
        _content: { dictionary: {} }
      }),
      _validateTemplateMatrix: jasmine.createSpy().and.returnValue(true),
      _flattenAnnotationTemplate: jasmine.createSpy(),
      _flattenLoadedPopUp: jasmine.createSpy(),
      _flattenPopUp: jasmine.createSpy(),
      _removeAnnotation: jasmine.createSpy()
    };

    annotation._dictionary.has.and.callFake((key: string) => key === 'AP');
    annotation._dictionary.get.and.returnValue(apDict);

    annotation._doPostProcess =
      PdfPopupAnnotation.prototype._doPostProcess.bind(annotation);
  });

  afterEach(() => {
    (PdfTemplate as any) = original;
  });

  /* ===================== _isLoaded IF ===================== */

  it('I: should load appearance from AP and draw template when loaded & flatten popups', () => {
    annotation._isLoaded = true;
    annotation._isFlattenPopups = true;

    annotation._doPostProcess(false);

    expect(annotation._page.graphics.save).toHaveBeenCalled();
    expect(annotation._page.graphics.setTransparency).toHaveBeenCalledWith(0.5);
    expect(annotation._page.graphics.drawTemplate).toHaveBeenCalled();
    expect(annotation._page.graphics.restore).toHaveBeenCalled();
  });

  /* ===================== dictionary.has("N") ELSE ===================== */

  it('E: should skip drawing when AP dictionary has no N entry', () => {
    annotation._isLoaded = true;
    apDict.has.and.returnValue(false);

    annotation._doPostProcess(false);

    expect(annotation._page.graphics.drawTemplate).not.toHaveBeenCalled();
  });

  /* ===================== _isLoaded ELSE ===================== */

  it('E: should call _postProcess when not loaded', () => {
    annotation._isLoaded = false;

    annotation._doPostProcess(false);

    expect(annotation._postProcess).toHaveBeenCalled();
  });

  /* ===================== Eif (!dictionary.has("AP")) ===================== */

  it('Eif: should create popup appearance when flatten and AP missing', () => {
    annotation._isLoaded = false;
    annotation._dictionary.has.and.returnValue(false);

    annotation._doPostProcess(true);

    expect(annotation._createPopupAppearance).toHaveBeenCalled();
  });

  /* ===================== flattenPopups IF / ELSE ===================== */

  it('I: should flatten loaded popup when flattenPopups & flatten are true', () => {
    annotation.flattenPopups = true;
    annotation.flatten = true;
    annotation._isLoaded = true;
    annotation._doPostProcess(true);

    expect(annotation._flattenLoadedPopUp).toHaveBeenCalled();
  });

  it('E: should flatten non-loaded popup when flattenPopups & flatten are true', () => {
    annotation.flattenPopups = true;
    annotation.flatten = true;
    annotation._isLoaded = false;

    annotation._appearanceTemplate = {
      _content: {
        dictionary: jasmine.createSpyObj('dict', [
          'has',
          'getArray',
          'update'
        ])
      }
    };

    annotation._doPostProcess(true);

    expect(annotation._flattenPopUp).toHaveBeenCalled();
  });


  /* ===================== isFlatten & appearanceTemplate ===================== */

  it('I: should flatten annotation template when isFlatten and appearance exists', () => {
    annotation._appearanceTemplate = {
      _content: { dictionary: {} }
    };

    annotation._doPostProcess(true);

    expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
  });

  /* ===================== isFlatten unconditional ===================== */

  it('I: should remove annotation from page when isFlatten is true', () => {
    annotation._appearanceTemplate = {
      _content: {
        dictionary: jasmine.createSpyObj('dict', [
          'has',
          'getArray',
          'update'
        ])
      }
    };

    annotation._doPostProcess(true);

    expect(annotation._removeAnnotation).toHaveBeenCalledWith(
      annotation._page,
      annotation
    );
  });
});
