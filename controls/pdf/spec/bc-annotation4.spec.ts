
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfGraphics } from '../src/pdf/core/graphics/pdf-graphics';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfAnnotationBorder, PdfCircleAnnotation, PdfRectangleAnnotation, PdfRedactionAnnotation, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfBorderStyle, PdfCircleMeasurementType, PdfRotationAngle, PdfTextAlignment } from '../src/pdf/core/enumerator';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';

describe('Highlighted branch coverage - redaction and widget annotations', () => {

    function createDocumentAndPage(): { document: PdfDocument; page: PdfPage } {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage() as PdfPage;
        return { document, page };
    }

    function setAnnotationContext(annotation: any, document: PdfDocument, page: PdfPage): void {
        annotation._crossReference = (document as any)._crossReference;
        annotation._page = page;
    }

    describe('PdfRedactionAnnotation text wrapping branches', () => {

        it('should return immediately from _drawText when overlayText is empty', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfRedactionAnnotation = new PdfRedactionAnnotation({ x: 10, y: 10, width: 100, height: 20 });
            const annot: any = annotation;
            setAnnotationContext(annot, document, page);

            const graphics: any = {
                drawString: jasmine.createSpy('drawString')
            };

            annotation.overlayText = '';
            annotation.font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

            // Act
            annot._drawText(graphics as PdfGraphics, { x: 10, y: 10, width: 100, height: 20 });

            // Assert
            expect(graphics.drawString).not.toHaveBeenCalled();

            document.destroy();
        });

        it('should cover left alignment with chunk split and remainder update without timeout', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfRedactionAnnotation = new PdfRedactionAnnotation({ x: 10, y: 10, width: 60, height: 20 });
            const annot: any = annotation;
            setAnnotationContext(annot, document, page);

            annotation.font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

            spyOn<any>(annot, '_getLineHeight').and.returnValue(10);
            spyOn<any>(annot, '_getSpaceWidth').and.returnValue(1);
            spyOn<any>(annot, '_measureText').and.callFake((text: string): number => text.length);

            const graphics: any = {
                drawString: jasmine.createSpy('drawString')
            };

            const words: string[] = ['abcdefgh'];

            // Act
            const nextIndex: number = annot._drawWrappedTextAligned(
                graphics as PdfGraphics,
                0,
                0,
                3,
                20,
                words,
                0,
                PdfTextAlignment.left,
                {} as any,
                false
            );

            // Assert
            expect(graphics.drawString).toHaveBeenCalled();
            expect(words[0]).not.toBe('abcdefgh'); // remainder branch updated the current word
            expect(nextIndex).toBeGreaterThanOrEqual(0);

            document.destroy();
        });

        it('should cover justify alignment branch with multiple words and finite loop execution', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfRedactionAnnotation = new PdfRedactionAnnotation({ x: 0, y: 0, width: 120, height: 40 });
            const annot: any = annotation;
            setAnnotationContext(annot, document, page);

            annotation.font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

            spyOn<any>(annot, '_getLineHeight').and.returnValue(10);
            spyOn<any>(annot, '_getSpaceWidth').and.returnValue(1);
            spyOn<any>(annot, '_measureText').and.callFake((text: string): number => text.length);

            const graphics: any = {
                drawString: jasmine.createSpy('drawString')
            };

            const words: string[] = ['aa', 'bb', 'cc', 'dddddddddddd'];

            // Act
            const nextIndex: number = annot._drawWrappedTextAligned(
                graphics as PdfGraphics,
                0,
                0,
                8,
                20,
                words,
                0,
                PdfTextAlignment.justify,
                {} as any,
                false
            );

            // Assert
            expect(graphics.drawString).toHaveBeenCalled();
            expect(nextIndex).toBeGreaterThan(0);

            document.destroy();
        });

        it('should cover _breakWordToFit with full fit and partial remainder paths', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfRedactionAnnotation = new PdfRedactionAnnotation({ x: 0, y: 0, width: 50, height: 20 });
            const annot: any = annotation;
            setAnnotationContext(annot, document, page);

            const measure: (t: string) => number = (t: string): number => t.length;

            // Act
            const partial: { text: string; remainder: string | null } = annot._breakWordToFit('abcdef', 3, measure);
            const full: { text: string; remainder: string | null } = annot._breakWordToFit('abc', 10, measure);

            // Assert
            expect(partial.text).toBe('abc');
            expect(partial.remainder).toBe('def');
            expect(full.text).toBe('abc');
            expect(full.remainder).toBeNull();

            document.destroy();
        });
    });

    describe('PdfWidgetAnnotation._initializeFont', () => {

        it('should cover resource creation when DR is absent and update DA with standard font', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
            const annot: any = widget;
            const font = new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.bold);

            annot._create(page, { x: 10, y: 10, width: 80, height: 20 });
            widget.color = { r: 255, g: 0, b: 0 };

            if (document.form._dictionary.has('DR')) {
                (document.form._dictionary as any)._map.delete('DR');
            }

            // Act
            annot._initializeFont(font);

            // Assert
            expect(annot._pdfFont).toBe(font);
            expect(document.form._dictionary.has('DR')).toBeTruthy();
            expect(widget['_dictionary'].has('DA')).toBeTruthy();
            expect(widget['_fontName']).toBeDefined();
            expect(widget['_isFont']).toBeTruthy();

            document.destroy();
        });

        it('should cover referenced Font dictionary, fetch path, TrueType internal cache path and isReference update', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
            const annot: any = widget;

            annot._create(page, { x: 20, y: 20, width: 100, height: 25 });

            const crossReference: any = annot._crossReference;
            const resource: _PdfDictionary = new _PdfDictionary(crossReference);
            const fontDictionary: _PdfDictionary = new _PdfDictionary(crossReference);

            const fontRef: _PdfReference = crossReference._getNextReference();
            crossReference._cacheMap.set(fontRef, fontDictionary);
            resource.update('Font', fontRef);
            document.form._dictionary.update('DR', resource);

            const fakeTrueTypeFont: any = Object.create(PdfTrueTypeFont.prototype);
            fakeTrueTypeFont._size = 14;
            fakeTrueTypeFont._dictionary = new _PdfDictionary(crossReference);
            fakeTrueTypeFont._pdfFontInternals = new _PdfDictionary(crossReference);

            // Act
            annot._initializeFont(fakeTrueTypeFont);

            // Assert
            expect(document.form._dictionary.has('DR')).toBeTruthy();
            expect(resource.has('Font')).toBeTruthy();
            expect(widget['_dictionary'].has('DA')).toBeTruthy();
            expect(resource._updated).toBeTruthy();
            expect(widget['_isFont']).toBeTruthy();

            document.destroy();
        });
    });

    describe('PdfWidgetAnnotation._doPostProcess', () => {


        it('should cover flatten flow with AP/N appearance stream for rotations 90, 180 and 270', () => {
            // Arrange / Act / Assert
            [
                { rotation: PdfRotationAngle.angle90, expectedAngle: 90 },
                { rotation: PdfRotationAngle.angle180, expectedAngle: -180 },
                { rotation: PdfRotationAngle.angle270, expectedAngle: 270 }
            ].forEach((entry: { rotation: PdfRotationAngle; expectedAngle: number }) => {
                const { document, page } = createDocumentAndPage();
                const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
                const annot: any = widget;

                annot._create(page, { x: 30, y: 40, width: 80, height: 25 });

                // Force the rotation getter used inside _doPostProcess
                spyOnProperty(page, 'rotation', 'get').and.returnValue(entry.rotation);

                const sourceTemplate: PdfTemplate = new PdfTemplate([0, 0, 50, 20], annot._crossReference);
                const appearance: _PdfDictionary = new _PdfDictionary(annot._crossReference);

                const reference: _PdfReference = annot._crossReference._getNextReference();
                annot._crossReference._cacheMap.set(reference, (sourceTemplate as any)._content);
                appearance.update('N', reference);
                widget['_dictionary'].update('AP', appearance);

                const saveSpy: jasmine.Spy = spyOn(page.graphics as any, 'save').and.callThrough();
                const translateSpy: jasmine.Spy = spyOn(page.graphics as any, 'translateTransform').and.callThrough();
                const rotateSpy: jasmine.Spy = spyOn(page.graphics as any, 'rotateTransform').and.callThrough();
                const drawSpy: jasmine.Spy = spyOn(page.graphics as any, 'drawTemplate').and.callThrough();
                const restoreSpy: jasmine.Spy = spyOn(page.graphics as any, 'restore').and.callThrough();

                // Act
                annot._doPostProcess(true, false);

                // Assert
                expect(saveSpy).toHaveBeenCalled();
                expect(translateSpy).toHaveBeenCalled();
                expect(rotateSpy).toHaveBeenCalledWith(entry.expectedAngle);
                expect(drawSpy).toHaveBeenCalled();
                expect(restoreSpy).toHaveBeenCalled();
                expect(widget['_dictionary']._updated).toBeFalsy();

                document.destroy();
            });
        });

        it('should cover flatten flow without AP and leave annotation undrawn when appearance stream is unavailable', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
            const annot: any = widget;

            annot._create(page, { x: 15, y: 15, width: 70, height: 25 });

            const drawSpy: jasmine.Spy = spyOn(page.graphics as any, 'drawTemplate').and.callThrough();

            // Act
            annot._doPostProcess(true, false);

            // Assert
            expect(drawSpy).not.toHaveBeenCalled();
            expect(widget['_dictionary']._updated).toBeFalsy();

            document.destroy();
        });


        it('should cover non-flatten flow with existing APand replace N reference', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
            const annot: any = widget;

            annot._create(page, { x: 10, y: 10, width: 60, height: 20 });

            const sourceTemplate: PdfTemplate = new PdfTemplate([0, 0, 20, 10], annot._crossReference);
            const appearance: _PdfDictionary = new _PdfDictionary(annot._crossReference);

            const reference: _PdfReference = annot._crossReference._getNextReference();
            annot._crossReference._cacheMap.set(reference, (sourceTemplate as any)._content);
            appearance.update('N', reference);
            widget['_dictionary'].update('AP', appearance);

            // Act
            annot._doPostProcess(false, true);

            // Assert
            expect(widget['_dictionary'].has('AP')).toBeTruthy();
            expect((widget['_dictionary'].get('AP') as _PdfDictionary).has('N')).toBeTruthy();
            expect(widget['_dictionary']._updated).toBeFalsy();

            document.destroy();
        });


    });
});
describe('Highlighted uncovered branches - circle measure appearance and rotated flatten template', () => {

    function createDocumentAndPage(): { document: PdfDocument; page: PdfPage } {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage() as PdfPage;
        return { document, page };
    }

    function attachContext(annotation: any, document: PdfDocument, page: PdfPage): void {
        annotation._crossReference = (document as any)._crossReference;
        annotation._page = page;
    }

    function createMeasureDictionaryRef(annot: any): _PdfReference {
        const ref: _PdfReference = annot._crossReference._getNextReference();
        const dictionary: _PdfDictionary = new _PdfDictionary(annot._crossReference);
        annot._crossReference._cacheMap.set(ref, dictionary);
        return ref;
    }

    function createApWithNormalRef(annot: any): _PdfDictionary {
        const ap: _PdfDictionary = new _PdfDictionary(annot._crossReference);
        const normalRef: _PdfReference = annot._crossReference._getNextReference();
        const normalContent: any = new PdfTemplate([0, 0, 20, 20], annot._crossReference)._content;
        annot._crossReference._cacheMap.set(normalRef, normalContent);
        ap.set('N', normalRef);
        return ap;
    }

    describe('PdfCircleAnnotation._createCircleMeasureAppearance', () => {

        it('should cover custom template branch, existing AP/Measure cleanup and empty contents branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfCircleAnnotation = new PdfCircleAnnotation({ x: 10, y: 20, width: 80, height: 80 });
            const annot: any = annotation;
            attachContext(annot, document, page);

            annotation.color = { r: 255, g: 0, b: 0 };
            annotation.border = new PdfAnnotationBorder({
                width: 2,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.solid
            });

            annot._unitString = 'cm';
            annot._text = '';
            annot._isLoaded = false;

            const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
            spyOn<any>(annot, '_obtainFont').and.returnValue(font);
            spyOn<any>(annot, '_convertToUnit').and.returnValue(12.34);

            const customTemplate: PdfTemplate = new PdfTemplate([0, 0, 80, 80], annot._crossReference);
            annot._customTemplate.set('N', customTemplate);

            const ap: _PdfDictionary = createApWithNormalRef(annot);
            const measureRef: _PdfReference = createMeasureDictionaryRef(annot);

            annot._dictionary.set('AP', ap);
            annot._dictionary.set('Measure', measureRef);

            // Act
            const template: PdfTemplate = annot._createCircleMeasureAppearance(false);

            // Assert
            expect(template).toBe(customTemplate);
            expect(annot._dictionary.has('Rect')).toBeTruthy();
            expect(annot._dictionary.has('AP')).toBeTruthy();
            expect(annot._dictionary.has('Measure')).toBeTruthy();
            expect(annot._dictionary.get('Contents')).toBeUndefined;
            expect(annot._dictionary.has('DS')).toBeFalsy();

            document.destroy();
        });

        it('should cover non-diameter branch with translate, line drawing, AP update, Measure update and text contents branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfCircleAnnotation = new PdfCircleAnnotation({ x: 40, y: 60, width: 100, height: 100 });
            const annot: any = annotation;
            attachContext(annot, document, page);

            annotation.color = { r: 0, g: 0, b: 255 };
            annotation.innerColor = { r: 255, g: 255, b: 0 };
            annotation.border = new PdfAnnotationBorder({
                width: 2,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.solid
            });

            annot._measureType = PdfCircleMeasurementType.radius;
            annot._unitString = 'cm';
            annot._text = 'Radius';
            annot._isLoaded = false;

            const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
            spyOn<any>(annot, '_obtainFont').and.returnValue(font);
            spyOn<any>(annot, '_convertToUnit').and.returnValue(25.5);

            const existingAp: _PdfDictionary = createApWithNormalRef(annot);
            const existingMeasure: _PdfReference = createMeasureDictionaryRef(annot);
            annot._dictionary.set('AP', existingAp);
            annot._dictionary.set('Measure', existingMeasure);

            // Act
            const template: PdfTemplate = annot._createCircleMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(annot._dictionary.has('AP')).toBeTruthy();
            expect(annot._dictionary.has('Measure')).toBeTruthy();
            expect(annot._dictionary.get('Subtype').name || annot._dictionary.get('Subtype')).toBeDefined();
            expect(annot._dictionary.get('Contents')).toBe('Radius 25.50 cm');
            expect(annot._dictionary.has('DS')).toBeTruthy();
            expect(annot._dictionary.has('Rect')).toBeTruthy();

            document.destroy();
        });
    });

    describe('Rotated flatten-template branch from highlighted image', () => {

        it('should cover rotated matrix branches for rotate 90/page 270, rotate 270/page 270 and rotate 180 without timeout', () => {
            // Arrange / Act / Assert
            const cases: Array<{
                rotate: PdfRotationAngle;
                pageRotation: PdfRotationAngle;
                bounds: { x: number; y: number; width: number; height: number };
                templateSize: { width: number; height: number };
            }> = [
                {
                    rotate: PdfRotationAngle.angle90,
                    pageRotation: PdfRotationAngle.angle270,
                    bounds: { x: 0, y: 0, width: 100, height: 60 },
                    templateSize: { width: 60, height: 100 }
                },
                {
                    rotate: PdfRotationAngle.angle270,
                    pageRotation: PdfRotationAngle.angle270,
                    bounds: { x: 0, y: 0, width: 120, height: 80 },
                    templateSize: { width: 80, height: 120 }
                },
                {
                    rotate: PdfRotationAngle.angle180,
                    pageRotation: PdfRotationAngle.angle0,
                    bounds: { x: 10, y: 10, width: 90, height: 50 },
                    templateSize: { width: 90, height: 50 }
                }
            ];

            cases.forEach((entry) => {
                const { document, page } = createDocumentAndPage();
                const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation({
                    x: 20,
                    y: 30,
                    width: 100,
                    height: 60
                });
                const annot: any = annotation;
                attachContext(annot, document, page);

                const template: PdfTemplate = new PdfTemplate(
                    [0, 0, entry.templateSize.width, entry.templateSize.height],
                    annot._crossReference
                );

                (template as any)._size = entry.templateSize;
                (template as any)._content.dictionary.update('Matrix', [0, 1, -1, 0, 0, 0]);
                (template as any)._content.dictionary.update('BBox', [0, 0, entry.templateSize.width, entry.templateSize.height]);

                spyOnProperty(annot, 'rotate', 'get').and.returnValue(entry.rotate);
                spyOnProperty(page, 'rotation', 'get').and.returnValue(entry.pageRotation);

                spyOn<any>(annot, '_calculateTemplateBounds').and.returnValue(entry.bounds);

                const drawSpy: jasmine.Spy = spyOn(page.graphics as any, 'drawTemplate').and.callThrough();

                // Act
                annot._flattenAnnotationTemplate(template, true);

                // Assert
                expect(drawSpy).toHaveBeenCalled();

                document.destroy();
            });
        });
    });
});
   
