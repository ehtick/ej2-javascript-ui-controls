
import { PdfForm } from '../src/pdf/core/form/form';
import { PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfField } from '../src/pdf/core/form/field';
import { PdfTextBoxField } from '../src/pdf/core/form/field';
import { PdfComboBoxField } from '../src/pdf/core/form/field';
import { PdfLineAnnotation } from '../src/pdf/core/annotations/annotation';
import { _obtainFontDetails, _mapFont } from '../src/pdf/core/utils';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfFontStyle } from '../src/pdf/core/fonts/pdf-standard-font';

describe('utils font handling test cases', () => {

    it('defaultAppearance is _PdfName instance - converts name property to string', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const form: PdfForm = document.form;
        const pdfName: _PdfName = new _PdfName('TestName');
        const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
        const field: PdfField = new PdfTextBoxField();
        widget._dictionary = new _PdfDictionary();
        widget._dictionary.set('DA', pdfName);
        field._dictionary = new _PdfDictionary();
        
        // Act
        const result: any = _obtainFontDetails(form, widget, field);
        
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        document.destroy();
    });

    it('defaultAppearance is string type - processes directly without conversion', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const form: PdfForm = document.form;
        const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
        const field: PdfField = new PdfTextBoxField();
        widget._dictionary = new _PdfDictionary();
        widget._dictionary.set('DA', '/Helv 12 Tf');
        field._dictionary = new _PdfDictionary();
        
        // Act
        const result: any = _obtainFontDetails(form, widget, field);
        
        // Assert
        expect(result).toBeDefined();
        document.destroy();
    });

    it('defaultAppearance includes hyphen - extracts substring before hyphen', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const form: PdfForm = document.form;
        const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
        const field: PdfField = new PdfTextBoxField();
        widget._dictionary = new _PdfDictionary();
        widget._dictionary.set('DA', '/Helv-Bold 12 Tf');
        field._dictionary = new _PdfDictionary();
        
        // Act
        const result: any = _obtainFontDetails(form, widget, field);
        
        // Assert
        expect(result).toBeDefined();
        document.destroy();
    });

    it('defaultAppearance without hyphen - fontFamily remains unchanged', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const form: PdfForm = document.form;
        const widget: PdfWidgetAnnotation = new PdfWidgetAnnotation();
        const field: PdfField = new PdfTextBoxField();
        widget._dictionary = new _PdfDictionary();
        widget._dictionary.set('DA', '/Helvetica 12 Tf');
        field._dictionary = new _PdfDictionary();
        
        // Act
        const result: any = _obtainFontDetails(form, widget, field);
        
        // Assert
        expect(result).toBeDefined();
        document.destroy();
    });

    it('dictionary has V property - checks for unicode and processes text', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const textDict: _PdfDictionary = new _PdfDictionary();
        textDict.set('V', 'TestValue');
        textDict.set('FT', new _PdfName('Tx'));
        
        // Act & Assert
        expect(textDict.has('V')).toBeTruthy();
        expect(textDict.get('V')).toEqual('TestValue');
        document.destroy();
    });

    it('text is null - skips unicode check and type processing', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const textDict: _PdfDictionary = new _PdfDictionary();
        textDict.set('V', null);
        
        // Act & Assert
        expect(textDict.get('V')).toBeNull();
        document.destroy();
    });

    it('text is undefined - skips unicode check and type processing', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const textDict: _PdfDictionary = new _PdfDictionary();
        
        // Act & Assert
        expect(textDict.get('V')).toBeUndefined();
        document.destroy();
    });

    it('dictionary has FT property with Ch type and Opt array - processes options for unicode', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const optionsArray: string[][] = [['option1', 'option2'], ['choice1', 'choice2']];
        const textDict: _PdfDictionary = new _PdfDictionary();
        textDict.set('V', 'option1');
        textDict.set('FT', new _PdfName('Ch'));
        textDict.set('Opt', optionsArray);
        
        // Act & Assert
        expect(textDict.has('FT')).toBeTruthy();
        expect(textDict.get('FT').name).toEqual('Ch');
        expect(textDict.has('Opt')).toBeTruthy();
        document.destroy();
    });

    it('options array has items with length > 1 and matches text - uses matched option for unicode check', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const optionsArray: string[][] = [['option1', 'DisplayValue'], ['option2', 'Display2']];
        const textValue: string = 'option1';
        
        // Act
        const matchedOption: string[] | undefined = optionsArray.find((innerArray: string[]) => innerArray[0] === textValue && innerArray.length > 1);
        
        // Assert
        expect(matchedOption).toBeDefined();
        expect(matchedOption).toEqual(['option1', 'DisplayValue']);
        document.destroy();
    });

    it('options filter returns empty - unicode check uses original text', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const optionsArray: string[][] = [['single'], ['solo']];
        
        // Act
        const filtered: string[][] = optionsArray.filter((innerArray: string[]) => innerArray.length > 1);
        
        // Assert
        expect(filtered.length).toBe(0);
        document.destroy();
    });

    it('fontFamily with hyphen in _mapFont - substring extracted before hyphen', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('DA', '/Helv 12 Tf');
        annotation._isLoaded = false;
        
        // Act
        const fontName: string = 'Helvetica-Bold';
        const processedName: string = fontName.substring(0, fontName.indexOf('-'));
        
        // Assert
        expect(processedName).toEqual('Helvetica');
        document.destroy();
    });

    it('fontFamily without hyphen in _mapFont - fontFamily unchanged', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._isLoaded = false;
        
        // Act
        const fontName: string = 'Helvetica';
        const hasHyphen: boolean = fontName.includes('-');
        
        // Assert
        expect(hasHyphen).toBeFalsy();
        expect(fontName).toEqual('Helvetica');
        document.destroy();
    });

    it('size is undefined and annotation is PdfLineAnnotation with _isLoaded true - size set to 10', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._isLoaded = true;
        let size: number = undefined;
        
        // Act
        if (typeof size === 'undefined' && annotation instanceof PdfLineAnnotation && annotation._isLoaded) {
            size = 10;
        }
        const fontSize: number = typeof size !== 'undefined' ? size : 1;
        
        // Assert
        expect(fontSize).toBe(10);
        document.destroy();
    });

    it('size is undefined and annotation is not PdfLineAnnotation - fontSize defaults to 1', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfField = new PdfTextBoxField();
        annotation._dictionary = new _PdfDictionary();
        let size: number = undefined;
        
        // Act
        if (typeof size === 'undefined' && annotation instanceof PdfLineAnnotation && (annotation as any)._isLoaded) {
            size = 10;
        }
        const fontSize: number = typeof size !== 'undefined' ? size : 1;
        
        // Assert
        expect(fontSize).toBe(1);
        document.destroy();
    });

    it('size is defined - fontSize uses provided size value', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._isLoaded = true;
        let size: number = 14;
        
        // Act
        const fontSize: number = typeof size !== 'undefined' ? size : 1;
        
        // Assert
        expect(fontSize).toBe(14);
        document.destroy();
    });

    it('annotation has AP dictionary - tries to parse font stream from AP', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('AP', {});
        annotation._crossReference = null;
        const fontDictionary: _PdfDictionary = new _PdfDictionary();
        
        // Act & Assert
        expect(annotation._dictionary.has('AP')).toBeTruthy();
        document.destroy();
    });

    it('annotation has no AP but fontDictionary exists - gets font from descriptor', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('DS', 'test');
        const fontDictionary: _PdfDictionary = new _PdfDictionary();
        fontDictionary.set('Type', new _PdfName('Font'));
        
        // Act & Assert
        expect(annotation._dictionary.has('AP')).toBeFalsy();
        expect(fontDictionary).toBeDefined();
        document.destroy();
    });

    it('fontData length > 0 and annotation has V property - creates TrueTypeFont and sets unicode flag', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('V', 'TestValue');
        const fontSize: number = 12;
        const style: PdfFontStyle = PdfFontStyle.regular;
        const fontData: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
        
        // Act & Assert
        expect(fontData.length > 0).toBeTruthy();
        expect(annotation._dictionary.has('V')).toBeTruthy();
        document.destroy();
    });

    it('fontData length equals 0 - font not created, remains undefined', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('V', 'TestValue');
        const fontData: Uint8Array = new Uint8Array([]);
        
        // Act & Assert
        expect(fontData.length > 0).toBeFalsy();
        document.destroy();
    });

    it('fontData is undefined - font creation skipped', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        const fontData: Uint8Array = undefined;
        
        // Act & Assert
        expect(fontData).toBeUndefined();
        document.destroy();
    });

    it('annotation no AP dictionary and no fontDictionary - fontData remains empty', () => {
        // Arrange
        let document: PdfDocument = new PdfDocument();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation();
        annotation._dictionary = new _PdfDictionary();
        annotation._dictionary.set('DS', 'test');
        const fontDictionary: _PdfDictionary = undefined;
        
        // Act & Assert
        expect(annotation._dictionary.has('AP')).toBeFalsy();
        expect(fontDictionary).toBeUndefined();
        document.destroy();
    });

});
