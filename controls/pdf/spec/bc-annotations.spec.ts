import { PdfAnnotation, PdfAnnotationBorder } from '../src/pdf/core/annotations/annotation';
import { PdfBorderStyle } from '../src/pdf/core/enumerator';
interface SimpleDict {
    _map: Map<string, unknown>;
    has(key: string): boolean;
    get(key: string): unknown;
    getArray(key: string): unknown;
    update(key: string, value: unknown): void;
    _updated?: boolean;
}

function createDict(): SimpleDict {
    const m = new Map<string, unknown>();
    return {
        _map: m,
        has(key: string) { return m.has(key); },
        get(key: string) { return m.get(key); },
        getArray(key: string) { return m.get(key); },
        update(key: string, value: unknown) { m.set(key, value); },
        _updated: false
    };
}

describe('Annotation lines 311-510 behavior', () => {

    it('author getter returns Author when present', () => {
        // Arrange
        const dict = createDict();
        dict.update('Author', 'Alice');
        const context: any = { _dictionary: dict, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        const result = desc.get!.call(context);
        // Assert
        expect(result).toBe('Alice');
        expect(context._author).toBe('Alice');
    });

    it('author getter falls back to T when Author absent', () => {
        // Arrange
        const dict = createDict();
        dict.update('T', 'Bob');
        const context: any = { _dictionary: dict, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        const result = desc.get!.call(context);
        // Assert
        expect(result).toBe('Bob');
        expect(context._author).toBe('Bob');
    });

    it('author getter returns undefined when no keys', () => {
        // Arrange
        const dict = createDict();
        const context: any = { _dictionary: dict, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        const result = desc.get!.call(context);
        // Assert
        expect(result).toBeUndefined();
        expect(context._author).toBeUndefined();
    });

    it('author setter when loaded updates existing T and Author', () => {
        // Arrange
        const dict = createDict();
        dict.update('T', 'OldT');
        dict.update('Author', 'OldA');
        const context: any = { _dictionary: dict, _isLoaded: true, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        desc.set!.call(context, 'Carol');
        // Assert
        expect(dict.get('T')).toBe('Carol');
        expect(dict.get('Author')).toBe('Carol');
        expect(context._author).toBe('Carol');
    });

    it('author setter when loaded with no keys writes T', () => {
        // Arrange
        const dict = createDict();
        const context: any = { _dictionary: dict, _isLoaded: true, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        desc.set!.call(context, 'Dana');
        // Assert
        expect(dict.get('T')).toBe('Dana');
        expect(context._author).toBe('Dana');
    });

    it('author setter when not loaded only updates T and not _author', () => {
        // Arrange
        const dict = createDict();
        const context: any = { _dictionary: dict, _isLoaded: false, _author: undefined };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'author') as PropertyDescriptor;
        // Act
        desc.set!.call(context, 'Eve');
        // Assert
        expect(dict.get('T')).toBe('Eve');
        expect(context._author).toBeUndefined();
    });

    it('border getter reads Border array for radii and width', () => {
        // Arrange
        const dict = createDict();
        dict.update('Border', [2, 3, 4]);
        const context: any = { _dictionary: dict, _border: undefined, _isWidget: false };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'border') as PropertyDescriptor;
        // Act
        const borderObj: PdfAnnotationBorder = desc.get!.call(context) as PdfAnnotationBorder;
        // Assert
        expect(borderObj.hRadius).toBe(2);
        expect(borderObj.vRadius).toBe(3);
        expect(borderObj.width).toBe(4);
    });

    it('border getter reads BS dictionary and maps W, S and D', () => {
        // Arrange
        const dict = createDict();
        const bs = {
            has(key: string) {
                return key === 'W' || key === 'S' || key === 'D';
            },
            get(key: string) {
                if (key === 'W') { return 7; }
                if (key === 'S') { return { name: 'D' }; }
                return undefined;
            },
            getArray(key: string) {
                if (key === 'D') { return [1, 2]; }
                return undefined;
            }
        } as unknown;
        dict.update('BS', bs);
        const context: any = { _dictionary: dict, _border: undefined, _isWidget: false, _crossReference: null };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'border') as PropertyDescriptor;
        // Act
        const borderObj: PdfAnnotationBorder = desc.get!.call(context) as PdfAnnotationBorder;
        // Assert
        expect(borderObj.width).toBe(7);
        expect(borderObj.style).toBe(PdfBorderStyle.dashed);
        expect(borderObj.dash).toEqual([1, 2]);
    });

    it('border getter maps unknown S to solid style', () => {
        // Arrange
        const dict = createDict();
        const bs = {
            has(key: string) { return key === 'S'; },
            get(key: string) { return { name: 'X' }; },
            getArray():any { return undefined; }
        } as unknown;
        dict.update('BS', bs);
        const context: any = { _dictionary: dict, _border: undefined, _isWidget: false, _crossReference: null };
        const desc = Object.getOwnPropertyDescriptor(PdfAnnotation.prototype, 'border') as PropertyDescriptor;
        // Act
        const borderObj: PdfAnnotationBorder = desc.get!.call(context) as PdfAnnotationBorder;
        // Assert
        expect(borderObj.style).toBe(PdfBorderStyle.solid);
    });

});
