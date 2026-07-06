
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { _PdfContentStream } from '../src/pdf/core/base-stream';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _JsonDocument } from '../src/pdf/core/import-export/json-document';
import { Size, Rectangle } from '../src/pdf/core/pdf-type';

describe('PdfTemplate - uncovered behavior/branch coverage', () => {
    let crossReference: _PdfCrossReference;

    beforeEach(() => {
        crossReference = {} as _PdfCrossReference;
    });

    it('should return null from graphics when template is read-only (no constructor argument)', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate();

        // Act
        const graphics = template.graphics;

        // Assert
        expect(graphics).toBeNull();
    });

    it('should set size and _originalSize from BBox when constructed from a base stream', () => {
        // Arrange
        const stream: _PdfContentStream = new _PdfContentStream([]);
        // BBox: [x1, y1, x2, y2] -> width = 110 - 10 = 100, height = 220 - 20 = 200
        stream.dictionary.set('BBox', [10, 20, 110, 220]);

        // Act
        const template: PdfTemplate = new PdfTemplate(stream, crossReference);

        // Assert
        expect(template.size).toEqual({ width: 100, height: 200 });
        expect(template._originalSize).toEqual({ width: 100, height: 200 });
        expect(template.graphics).toBeNull(); // read-only template created from stream
    });

    it('should create a writable template from rectangle bounds with x and y, and attach cross reference', () => {
        // Arrange
        const bounds: Rectangle = { x: 5, y: 6, width: 20, height: 30 };

        // Act
        const template: PdfTemplate = new PdfTemplate(bounds, crossReference);
        const internal = template as unknown as {
            _content: _PdfContentStream & {
                dictionary: {
                    _crossReference?: _PdfCrossReference;
                    getArray(key: string): number[];
                };
            };
            _isNew?: boolean;
        };

        // Assert
        expect(template.size).toEqual({ width: 20, height: 30 });
        expect(internal._content.dictionary.getArray('BBox')).toEqual([5, 6, 25, 36]);
        expect(internal._content.dictionary._crossReference).toBe(crossReference);
        expect(internal._isNew).not.toBeTruthy();
    });

    it('should create a writable template from size-only input and use default origin (0,0) when x and y are not provided', () => {
        // Arrange
        const size: Size = { width: 40, height: 50 };

        // Act
        const template: PdfTemplate = new PdfTemplate(size);
        const internal = template as unknown as {
            _content: _PdfContentStream & {
                dictionary: {
                    getArray(key: string): number[];
                };
            };
            _isNew: boolean;
        };

        // Assert
        expect(template.size).toEqual({ width: 40, height: 50 });
        expect(internal._content.dictionary.getArray('BBox')).toEqual([0, 0, 40, 50]);
        expect(internal._isNew).toBeTruthy();
    });

    it('should lazily create graphics for a writable template', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 25, height: 35 });

        // Act
        const graphics = template.graphics;
        const graphicsSecondAccess = template.graphics;
        const internal = template as unknown as {
            _g: {
                _isTemplateGraphics?: boolean;
            };
        };

        // Assert
        expect(graphics).not.toBeNull();
        expect(graphicsSecondAccess).toBe(graphics);
        expect(internal._g._isTemplateGraphics).toBeTruthy();
    });

    it('should parse and clear pending resources when _pendingResources is not empty', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const internal = template as unknown as {
            _content: _PdfContentStream & {
                _pendingResources?: string;
            };
        };
        internal._content._pendingResources = 'q /F1 12 Tf Q';

        const parseStreamElementsSpy = spyOn(
            _JsonDocument.prototype as unknown as { _parseStreamElements(content: _PdfContentStream): void },
            '_parseStreamElements'
        ).and.callFake((): void => {
            // Intentionally empty to avoid real parsing / loop execution
        });

        const disposeSpy = spyOn(
            _JsonDocument.prototype as unknown as { _dispose(): void },
            '_dispose'
        ).and.callFake((): void => {
            // Intentionally empty
        });

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(parseStreamElementsSpy).toHaveBeenCalled();
        expect(parseStreamElementsSpy.calls.mostRecent().args[0]).toBe(internal._content);
        expect(internal._content._pendingResources).toBe('');
        expect(disposeSpy).toHaveBeenCalled();
    });

    it('should not parse pending resources when _pendingResources is empty', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const internal = template as unknown as {
            _content: _PdfContentStream & {
                _pendingResources?: string;
            };
        };
        internal._content._pendingResources = '';

        const parseStreamElementsSpy = spyOn(
            _JsonDocument.prototype as unknown as { _parseStreamElements(content: _PdfContentStream): void },
            '_parseStreamElements'
        ).and.callFake((): void => {
            // Intentionally empty
        });

        const disposeSpy = spyOn(
            _JsonDocument.prototype as unknown as { _dispose(): void },
            '_dispose'
        ).and.callFake((): void => {
            // Intentionally empty
        });

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(parseStreamElementsSpy).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(internal._content._pendingResources).toBe('');
    });

    it('should not parse pending resources when _pendingResources is undefined', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });

        const parseStreamElementsSpy = spyOn(
            _JsonDocument.prototype as unknown as { _parseStreamElements(content: _PdfContentStream): void },
            '_parseStreamElements'
        ).and.callFake((): void => {
            // Intentionally empty
        });

        const disposeSpy = spyOn(
            _JsonDocument.prototype as unknown as { _dispose(): void },
            '_dispose'
        ).and.callFake((): void => {
            // Intentionally empty
        });

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(parseStreamElementsSpy).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
    });
});
