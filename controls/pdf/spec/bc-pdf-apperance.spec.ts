import { PdfAppearance } from '../src/pdf/core/annotations/pdf-appearance';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import { PdfAnnotation } from '../src/pdf/core/annotations/annotation';
import { Rectangle } from '../src/pdf/core/pdf-type';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';

describe('PdfAppearance behavior tests', () => {

    it('constructor sets zero bounds and disables normal key when bounds provided and no annot', () => {
        // Arrange
        const inputBounds: Rectangle = null;
        const appearance: PdfAppearance = new PdfAppearance(inputBounds, null);

        // Act
        const internals = appearance as unknown as { _bounds: Rectangle; _isNormalKey: boolean; _templateNormal: PdfTemplate; _dictionary: _PdfDictionary };

        // Assert
        expect(internals._bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
        expect(internals._isNormalKey).toBe(false);
        expect(internals._templateNormal).toBeDefined();
        expect(internals._dictionary.has('N')).toBe(false);
    });

    it('getter returns template from dictionary when AP key present', () => {
        // Arrange
        const appearance: PdfAppearance = new PdfAppearance(undefined as unknown as Rectangle);
        const internals = appearance as unknown as { _dictionary: _PdfDictionary; _templateNormal?: PdfTemplate };
        const templateFromDict: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 2, height: 2 } as Rectangle, undefined as unknown as _PdfCrossReference);
        internals._templateNormal = undefined;
        internals._dictionary.set('AP', true as unknown as object);
        internals._dictionary.set('N', templateFromDict as unknown as object);

        // Act
        const result: PdfTemplate = appearance.normal;

        // Assert
        expect(result).toBe(templateFromDict);
    });

    it('setter ignores falsy value and leaves template unchanged', () => {
        // Arrange
        const appearance: any = new PdfAppearance(undefined as unknown as Rectangle);
        const internals = appearance as unknown as { _templateNormal?: PdfTemplate };
        const before: PdfTemplate | undefined = internals._templateNormal;

        // Act
        appearance.normal = null;

        // Assert
        expect(internals._templateNormal).toBe(before);
    });

    it('setter sets dictionary N when normal key true', () => {
        // Arrange
        class TestAnnot extends (PdfAnnotation as { new(): PdfAnnotation }) {
            _doPostProcess(): void { return; }
        }
        const annot: PdfAnnotation = new TestAnnot();
        const appearance: PdfAppearance = new PdfAppearance(undefined as unknown as Rectangle, annot);
        const internals = appearance as unknown as { _dictionary: _PdfDictionary; _templateNormal?: PdfTemplate };
        const newTemplate: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 3, height: 3 } as Rectangle, undefined as unknown as _PdfCrossReference);

        // Act
        appearance._isNormalKey = false;
        appearance.normal = newTemplate;

        // Assert
        expect(internals._templateNormal).toBe(newTemplate);
        expect(internals._dictionary.has('N')).toBe(true);
    });

});
