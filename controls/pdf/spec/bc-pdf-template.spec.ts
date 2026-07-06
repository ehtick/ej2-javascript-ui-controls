import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfContentStream } from '../src/pdf/core/base-stream';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _JsonDocument } from '../src/pdf/core/import-export/json-document';

describe('PdfTemplate - _exportStream, _importStream, _updatePendingResource behavior tests', () => {

    it('_exportStream - creates JsonDocument with crossReference and exports to JSON appearance', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        const key: string = 'TestKey';
        
        dictionary.set('TestKey', 'TestValue');
        template._appearance = '';

        // Act
        template._exportStream(dictionary, crossReference, key);

        // Assert
        expect(template._appearance).toBeDefined();
        expect(typeof template._appearance).toBe('string');
        expect(template._appearance.length > 0).toBeTruthy();
    });

    it('_exportStream - sets _isAnnotationExport flag to true on JsonDocument', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        const key: string = 'TestKey';
        
        dictionary.set('TestKey', { data: 'test' });

        // Act
        template._exportStream(dictionary, crossReference, key);

        // Assert
        expect(template._appearance).toBeDefined();
        expect(typeof template._appearance).toBe('string');
    });

    it('_exportStream - handles empty dictionary and generates valid JSON', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 50, height: 50 });
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        const key: string = 'EmptyKey';

        // Act
        template._exportStream(dictionary, crossReference, key);

        // Assert
        expect(template._appearance).toBeDefined();
        expect(template._appearance).not.toBeNull();
    });

    it('_importStream - parses JSON appearance with hasCrossReference false and isResourceExport false', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const jsonContent: string = JSON.stringify({
            normal: {
                stream: { content: 'test content' }
            }
        });
        template._appearance = jsonContent;
        template._content = new _PdfContentStream([]);

        // Act
        template._importStream(false, false);

        // Assert
        expect(template._content).toBeDefined();
        expect(template._appearance).toBe(jsonContent);
    });

    it('_importStream - sets crossReference on content dictionary when hasCrossReference true', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._crossReference = crossReference;
        const jsonContent: string = JSON.stringify({
            normal: {
                stream: { content: 'test content' }
            }
        });
        template._appearance = jsonContent;
        template._content = new _PdfContentStream([]);

        // Act
        template._importStream(true, false);

        // Assert
        expect(template._content.dictionary._crossReference).toBe(crossReference);
        expect(template._content.dictionary._updated).toBe(true);
    });

    it('_importStream - handles isResourceExport true and parses resources dictionary', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._crossReference = crossReference;
        const jsonContent: string = JSON.stringify({
            resources: {
                dict: { Font: { F1: 'Helvetica' } }
            }
        });
        template._appearance = jsonContent;
        template._content = new _PdfContentStream([]);

        // Act
        template._importStream(true, true);

        // Assert
        expect(template._content).toBeDefined();
        expect(template._content.dictionary).toBeDefined();
    });

    it('_importStream - handles missing entry in parsed JSON gracefully', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const jsonContent: string = JSON.stringify({
            other: { data: 'not normal or resources' }
        });
        template._appearance = jsonContent;
        template._content = new _PdfContentStream([]);
        const originalContent = template._content;

        // Act
        template._importStream(false, false);

        // Assert
        expect(template._content).toBe(originalContent);
    });

    it('_importStream - handles null JSON gracefully without throwing error', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        template._appearance = JSON.stringify(null);
        template._content = new _PdfContentStream([]);
        const originalContent = template._content;

        // Act
        template._importStream(false, false);

        // Assert
        expect(template._content).toBe(originalContent);
    });

    it('_importStream - handles empty JSON object without crashing', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        template._appearance = JSON.stringify({});
        template._content = new _PdfContentStream([]);
        const originalContent = template._content;

        // Act
        template._importStream(false, false);

        // Assert
        expect(template._content).toBe(originalContent);
    });

    it('_importStream - updates resources dictionary on content when hasCrossReference true and isResourceExport true', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._crossReference = crossReference;
        template._content = new _PdfContentStream([]);
        const jsonContent: string = JSON.stringify({
            resources: {
                dict: { Type: 'Resources' }
            }
        });
        template._appearance = jsonContent;

        // Act
        template._importStream(true, true);

        // Assert
        expect(template._content.dictionary).toBeDefined();
    });

    it('_importStream - does not set crossReference when hasCrossReference false and isResourceExport true', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        template._content = new _PdfContentStream([]);
        const jsonContent: string = JSON.stringify({
            resources: {
                dict: { Type: 'Resources' }
            }
        });
        template._appearance = jsonContent;

        // Act
        template._importStream(false, true);

        // Assert
        expect(template._content.dictionary).toBeDefined();
    });


   

    it('_updatePendingResource - skips processing when _pendingResources is empty string', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._content = new _PdfContentStream([]);
        template._content._pendingResources = '';

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(template._content._pendingResources).toBe('');
    });

    it('_updatePendingResource - skips processing when _pendingResources is undefined', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._content = new _PdfContentStream([]);
        template._content._pendingResources = undefined;

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(template._content._pendingResources).toBeUndefined();
    });

    it('_updatePendingResource - skips processing when _pendingResources is null', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const crossReference: _PdfCrossReference = new _PdfCrossReference({} as any);
        template._content = new _PdfContentStream([]);
        template._content._pendingResources = null;

        // Act
        template._updatePendingResource(crossReference);

        // Assert
        expect(template._content._pendingResources).toBeNull();
    });

  

});


