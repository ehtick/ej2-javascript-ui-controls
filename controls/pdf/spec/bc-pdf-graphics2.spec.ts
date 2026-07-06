
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _Matrix, _PdfTransformationMatrix, PdfGraphics } from '../src/pdf/core/graphics/pdf-graphics';

describe('PdfGraphics highlighted image coverage', () => {
    function createGraphicsStub(): PdfGraphics {
        const graphics: PdfGraphics = Object.create(PdfGraphics.prototype) as PdfGraphics;

        (graphics as any)._sw = {
            _writeComment: jasmine.createSpy('_writeComment')
        };
        (graphics as any)._size = {
            width: 500,
            height: 700
        };
        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;
        (graphics as any).translateTransform = jasmine.createSpy('translateTransform');

        return graphics;
    }

    function createPageStub(
        cropBoxExists: boolean,
        mediaBoxExists: boolean,
        cropBox: number[] = [0, 0, 0, 0],
        mediaBox: number[] = [0, 0, 0, 0],
        origin: number[] = [0, 0]
    ): any {
        return {
            _origin: origin,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBoxExists;
                    }
                    if (key === 'MediaBox') {
                        return mediaBoxExists;
                    }
                    return false;
                }),
                getArray: jasmine.createSpy('getArray').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBox;
                    }
                    if (key === 'MediaBox') {
                        return mediaBox;
                    }
                    return undefined;
                })
            }
        };
    }

    it('covers _initializeCoordinates page branch where CropBox and MediaBox exist and are equal, forcing needTransformation and translate by -size.height when mediaBoxUpperRightBound === 0', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(
            true,
            true,
            [0, 0, 200, 300],
            [0, 0, 200, 300],
            [0, 10]
        );

        (graphics as any)._mediaBoxUpperRightBound = 0;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -(graphics as any)._size.height });
    });

    it('covers _initializeCoordinates page branch where CropBox positive and MediaBox negative, translating by crop box coordinates', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const cropBox: number[] = [10, 0, 200, 300];
        const mediaBox: number[] = [-5, -10, 200, 300];
        const page: any = createPageStub(true, true, cropBox, mediaBox, [0, 0]);

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: cropBox[0], y: -cropBox[3] });
    });
    it('covers _initializeCoordinates page branch needTransformation with existing graphics crop box', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [0, 0, 100, 100], [0, 0, 100, 100], [0, 0]);

        (graphics as any)._cropBox = [5, 6, 100, 120];

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 5, y: -120 });
    });


    it('covers _initializeCoordinates no-page branch with crop box falling into mediaBoxUpperRightBound === size.height condition', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = [0, 0, 100, 100];
        (graphics as any)._mediaBoxUpperRightBound = (graphics as any)._size.height;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -(graphics as any)._size.height });
    });

    it('covers _initializeCoordinates no-page branch with crop box falling into translate by -mediaBoxUpperRightBound', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = [0, 0, 100, 100];
        (graphics as any)._mediaBoxUpperRightBound = 555;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -555 });
    });

    it('covers _initializeCoordinates no-page branch without crop box and mediaBoxUpperRightBound === 0', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -(graphics as any)._size.height });
    });

    it('covers _initializeCoordinates no-page branch without crop box and translate by -mediaBoxUpperRightBound', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 321;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -321 });
    });
});

describe('_PdfTransformationMatrix highlighted image coverage', () => {

    it('FIXED: constructor initializes identity matrix', () => {
        const matrix: _PdfTransformationMatrix = new _PdfTransformationMatrix();

        expect((matrix as any)._matrix._elements)
            .toEqual([1, 0, 0, 1, 0, 0]);
    });


});
describe('_Matrix constructor branches (FIXED)', () => {

    it('covers constructor branch: if (typeof arg1 === "undefined")', () => {
        const matrix: _Matrix = new _Matrix();

        expect((matrix as any)._elements).toEqual([]);
    });

    it('covers constructor branch: else if (typeof arg1 === "number")', () => {
        const matrix: _Matrix = new _Matrix(1, 2, 3, 4, 5, 6);

        expect((matrix as any)._elements).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('covers constructor branch: else { this._elements = arg1; }', () => {
        const input: number[] = [10, 20, 30, 40, 50, 60];

        const matrix: _Matrix = new _Matrix(input);

        expect((matrix as any)._elements).toBe(input);
    });

    it('covers clone(): return new _Matrix(this._elements.slice())', () => {
        const original: _Matrix = new _Matrix([7, 8, 9, 10, 11, 12]);

        const cloned: _Matrix = original._clone();

        expect(cloned).toBeDefined();
        expect(cloned).not.toBe(original);
        expect((cloned as any)._elements).toEqual([7, 8, 9, 10, 11, 12]);
        expect((cloned as any)._elements).not.toBe((original as any)._elements);
    });

});

describe('_initializeCoordinates lines 3273-3275 and 3283-3285 coverage', () => {
    function createGraphicsStub(): PdfGraphics {
        const graphics: PdfGraphics = Object.create(PdfGraphics.prototype) as PdfGraphics;

        (graphics as any)._sw = {
            _writeComment: jasmine.createSpy('_writeComment')
        };
        (graphics as any)._size = {
            width: 500,
            height: 700
        };
        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;
        (graphics as any).translateTransform = jasmine.createSpy('translateTransform');

        return graphics;
    }

    function createPageStub(
        cropBoxExists: boolean,
        mediaBoxExists: boolean,
        cropBox: number[] = [0, 0, 0, 0],
        mediaBox: number[] = [0, 0, 0, 0],
        origin: number[] = [0, 0]
    ): any {
        return {
            _origin: origin,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBoxExists;
                    }
                    if (key === 'MediaBox') {
                        return mediaBoxExists;
                    }
                    return false;
                }),
                getArray: jasmine.createSpy('getArray').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBox;
                    }
                    if (key === 'MediaBox') {
                        return mediaBox;
                    }
                    return undefined;
                })
            }
        };
    }

    it('covers line 3273-3275 when -(page._origin[1]) < this._mediaBoxUpperRightBound is true (needTransformation=true, no cropBox)', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [0, 0, 100, 100], [0, 0, 100, 100], [0, 50]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 100;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3273-3275 when this._mediaBoxUpperRightBound === 0 is true (needTransformation=true, no cropBox)', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [0, 0, 100, 100], [0, 0, 100, 100], [0, 100]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3273-3275 else branch when both conditions are false (needTransformation=true, no cropBox)', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [0, 0, 100, 100], [0, 0, 100, 100], [0, -50]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 30;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -30 });
    });

    it('covers line 3283-3285 when this._mediaBoxUpperRightBound === this._size.height is true (no-page branch)', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = [0, 0, 100, 100];
        (graphics as any)._mediaBoxUpperRightBound = 700;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3283-3285 when this._mediaBoxUpperRightBound === 0 is true (no-page branch)', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = [0, 0, 100, 100];
        (graphics as any)._mediaBoxUpperRightBound = 0;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3283-3285 else branch when both conditions are false (no-page branch)', () => {
        const graphics: PdfGraphics = createGraphicsStub();

        (graphics as any)._cropBox = [0, 0, 100, 100];
        (graphics as any)._mediaBoxUpperRightBound = 500;

        (graphics as any)._initializeCoordinates();

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -500 });
    });

});

describe('_initializeCoordinates line 3274 coverage (needTransformation = true)', () => {
    function createGraphicsStub(): PdfGraphics {
        const graphics: PdfGraphics = Object.create(PdfGraphics.prototype) as PdfGraphics;

        (graphics as any)._sw = {
            _writeComment: jasmine.createSpy('_writeComment')
        };
        (graphics as any)._size = {
            width: 500,
            height: 700
        };
        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;
        (graphics as any).translateTransform = jasmine.createSpy('translateTransform');

        return graphics;
    }

    function createPageStub(
        cropBoxExists: boolean,
        mediaBoxExists: boolean,
        cropBox: number[] = [0, 0, 0, 0],
        mediaBox: number[] = [0, 0, 0, 0],
        origin: number[] = [0, 0]
    ): any {
        return {
            _origin: origin,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBoxExists;
                    }
                    if (key === 'MediaBox') {
                        return mediaBoxExists;
                    }
                    return false;
                }),
                getArray: jasmine.createSpy('getArray').and.callFake((key: string) => {
                    if (key === 'CropBox') {
                        return cropBox;
                    }
                    if (key === 'MediaBox') {
                        return mediaBox;
                    }
                    return undefined;
                })
            }
        };
    }

    it('covers line 3274 when CropBox and MediaBox exist with identical coordinates (needTransformation = true)', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [0, 0, 500, 700], [0, 0, 500, 700], [0, 0]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 0;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3274 when CropBox and MediaBox exist with identical coordinates and mediaBoxUpperRightBound is set', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [10, 10, 510, 710], [10, 10, 510, 710], [0, 0]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 650;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('covers line 3274 when CropBox and MediaBox exist identical with positive origin', () => {
        const graphics: PdfGraphics = createGraphicsStub();
        const page: any = createPageStub(true, true, [50, 50, 550, 750], [50, 50, 550, 750], [10, 20]);

        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 100;

        (graphics as any)._initializeCoordinates(page);

        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

});
``
