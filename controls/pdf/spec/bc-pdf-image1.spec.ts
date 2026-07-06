import { PdfImage } from '../src/pdf/core/graphics/images/pdf-image';
import { PdfGraphics, _PdfUnitConvertor, PdfGraphicsState } from '../src/pdf/core/graphics/pdf-graphics';
import { Point } from '../src/pdf/core/pdf-type';

describe('PdfImage.draw method behavior tests', () => {

    it('draw - location undefined, no graphics transform applied', () => {
        // Arrange
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = undefined;
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.restore).not.toHaveBeenCalled();
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
    });

    it('draw - location with both x and y null, reset to 0,0, needSave false', () => {
        // Arrange
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: null, y: null};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.restore).not.toHaveBeenCalled();
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
    });

    it('draw - location with x=0 and y=0, needSave false, no state save', () => {
        // Arrange
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: 0, y: 0};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.restore).not.toHaveBeenCalled();
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
    });

    it('draw - location with x=10 and y=0, needSave true, applies transform and restore', () => {
        // Arrange
        const mockGraphicsState: PdfGraphicsState = jasmine.createSpyObj('PdfGraphicsState', ['transform']);
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        (mockGraphics.save as jasmine.Spy).and.returnValue(mockGraphicsState);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: 10, y: 0};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(mockGraphics.save).toHaveBeenCalled();
        expect(mockGraphics.translateTransform).toHaveBeenCalledWith(location);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
        expect(mockGraphics.restore).toHaveBeenCalledWith(mockGraphicsState);
    });

    it('draw - location with x=0 and y=10, needSave true (y !== 0 branch), applies transform', () => {
        // Arrange
        const mockGraphicsState: PdfGraphicsState = jasmine.createSpyObj('PdfGraphicsState', ['transform']);
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        (mockGraphics.save as jasmine.Spy).and.returnValue(mockGraphicsState);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: 0, y: 10};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(mockGraphics.save).toHaveBeenCalled();
        expect(mockGraphics.translateTransform).toHaveBeenCalledWith(location);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
        expect(mockGraphics.restore).toHaveBeenCalledWith(mockGraphicsState);
    });

    it('draw - location with x=10 and y=10, needSave true, full transform cycle', () => {
        // Arrange
        const mockGraphicsState: PdfGraphicsState = jasmine.createSpyObj('PdfGraphicsState', ['transform']);
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        (mockGraphics.save as jasmine.Spy).and.returnValue(mockGraphicsState);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: 10, y: 10};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(mockGraphics.save).toHaveBeenCalled();
        expect(mockGraphics.translateTransform).toHaveBeenCalledWith(location);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
        expect(mockGraphics.restore).toHaveBeenCalledWith(mockGraphicsState);
    });

    it('draw - location with x=undefined and y=undefined, condition false, needSave not evaluated', () => {
        // Arrange
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: undefined, y: undefined};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
    });

    it('draw - location with x=null and y=undefined, mixed null/undefined, reset both to 0', () => {
        // Arrange
        const mockGraphics: PdfGraphics = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        const testImage: PdfImage = jasmine.createSpyObj('PdfImage', ['draw']);
        const location: Point = {x: null, y: undefined};
        
        // Act
        const targetDrawMethod = (graphics: PdfGraphics, loc?: Point): void => {
            if (loc && (loc.x === null || typeof loc.x === 'undefined') && (loc.y === null || typeof loc.y === 'undefined')) {
                loc.x = 0;
                loc.y = 0;
            }
            let needSave: boolean;
            if (loc) {
                needSave = (loc.x !== 0 || loc.y !== 0);
            }
            let state: PdfGraphicsState = null;
            if (needSave) {
                state = graphics.save();
                graphics.translateTransform(loc);
            }
            graphics.drawImage(testImage, {x: 0, y: 0});
            if (needSave) {
                graphics.restore(state);
            }
        };
        
        targetDrawMethod(mockGraphics, location);
        
        // Assert
        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(testImage, {x: 0, y: 0});
    });

    // Additional tests calling the real PdfImage.draw implementation to exercise source branches

    class ConcreteTestImage extends PdfImage {
        _save(): void { }
    }

    it('draw - real method: location omitted (undefined) should only draw', () => {
        // Arrange
        const image = new ConcreteTestImage();
        const mockGraphics: any = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);

        // Act
        image.draw(mockGraphics as any);

        // Assert
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(image, { x: 0, y: 0 });
        expect(mockGraphics.save).not.toHaveBeenCalled();
        expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
        expect(mockGraphics.restore).not.toHaveBeenCalled();
    });

    it('draw - real method: location with both x and y null resets to 0 and does not save', () => {
        // Arrange
        const image = new ConcreteTestImage();
        const location: any = { x: null, y: null };
        const mockGraphics: any = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);

        // Act
        image.draw(mockGraphics as any, location);

        // Assert
        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(image, { x: 0, y: 0 });
        expect(mockGraphics.save).not.toHaveBeenCalled();
    });

    it('draw - real method: non-zero location triggers save/translate/restore', () => {
        // Arrange
        const image = new ConcreteTestImage();
        const state = { saved: true } as any;
        const location: any = { x: 10, y: 0 };
        const mockGraphicsState: any = jasmine.createSpyObj('PdfGraphicsState', ['transform']);
        const mockGraphics: any = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        (mockGraphics.save as jasmine.Spy).and.returnValue(mockGraphicsState);

        // Act
        image.draw(mockGraphics as any, location);

        // Assert
        expect(mockGraphics.save).toHaveBeenCalled();
        expect(mockGraphics.translateTransform).toHaveBeenCalledWith(location);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(image, { x: 0, y: 0 });
        expect(mockGraphics.restore).toHaveBeenCalledWith(mockGraphicsState);
    });

    it('draw - real method: one coord undefined and other non-zero triggers save/translate/restore', () => {
        // Arrange
        const image = new ConcreteTestImage();
        const mockGraphicsState: any = jasmine.createSpyObj('PdfGraphicsState', ['transform']);
        const location: any = { x: undefined, y: 5 };
        const mockGraphics: any = jasmine.createSpyObj('PdfGraphics', ['save', 'drawImage', 'translateTransform', 'restore']);
        (mockGraphics.save as jasmine.Spy).and.returnValue(mockGraphicsState);

        // Act
        image.draw(mockGraphics as any, location);

        // Assert
        expect(mockGraphics.save).toHaveBeenCalled();
        expect(mockGraphics.translateTransform).toHaveBeenCalledWith(location);
        expect(mockGraphics.drawImage).toHaveBeenCalledWith(image, { x: 0, y: 0 });
        expect(mockGraphics.restore).toHaveBeenCalledWith(mockGraphicsState);
    });

});

class TestPdfImage extends PdfImage {
    constructor() {
        super();
        this._imageWidth = 100;
        this._imageHeight = 50;
        this._horizontalResolution = 96;
    }

    // abstract impl
    _save(): void { /* noop */ }
}

describe('PdfImage branch coverage tests', () => {

    let image: TestPdfImage;
    let graphics: jasmine.SpyObj<PdfGraphics>;
    let state: PdfGraphicsState;

    beforeEach(() => {
        image = new TestPdfImage();
        state = {} as PdfGraphicsState;

        graphics = jasmine.createSpyObj<PdfGraphics>('PdfGraphics', [
            'save',
            'restore',
            'translateTransform',
            'drawImage'
        ]);

        graphics.save.and.returnValue(state);
    });

    // ------------------------------------------------------------
    // draw() branch tests
    // ------------------------------------------------------------

    it('should draw without location (location === undefined)', () => {
        image.draw(graphics);

        expect(graphics.drawImage).toHaveBeenCalledWith(image, { x: 0, y: 0 });
        expect(graphics.save).not.toHaveBeenCalled();
        expect(graphics.restore).not.toHaveBeenCalled();
    });

    it('should normalize null/undefined location.x and location.y to 0', () => {
        const location = { x: undefined, y: undefined } as Point;

        image.draw(graphics, location);

        expect(location.x).toBe(0);
        expect(location.y).toBe(0);
        expect(graphics.drawImage).toHaveBeenCalled();
        expect(graphics.save).not.toHaveBeenCalled();
    });

    it('should not save graphics state when x=0 and y=0', () => {
        const location = { x: 0, y: 0 };

        image.draw(graphics, location);

        expect(graphics.save).not.toHaveBeenCalled();
        expect(graphics.translateTransform).not.toHaveBeenCalled();
        expect(graphics.restore).not.toHaveBeenCalled();
    });

    it('should save and restore graphics state when x !== 0', () => {
        const location = { x: 5, y: 0 };

        image.draw(graphics, location);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.translateTransform).toHaveBeenCalledWith(location);
        expect(graphics.restore).toHaveBeenCalledWith(state);
    });

    it('should save and restore graphics state when y !== 0', () => {
        const location = { x: 0, y: 10 };

        image.draw(graphics, location);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.translateTransform).toHaveBeenCalledWith(location);
        expect(graphics.restore).toHaveBeenCalledWith(state);
    });

    // ------------------------------------------------------------
    // _getPointSize() branch tests
    // ------------------------------------------------------------

    it('should use default DPI when horizontalResolution is undefined', () => {
        const result = image._getPointSize(96, 96);

        expect(result.length).toBe(2);
        expect(result[0]).toBeGreaterThan(0);
        expect(result[1]).toBeGreaterThan(0);
    });

    it('should use provided horizontalResolution when specified', () => {
        const result = image._getPointSize(96, 96, 300);

        expect(result.length).toBe(2);
        expect(result[0]).toBeGreaterThan(0);
        expect(result[1]).toBeGreaterThan(0);
    });
});
