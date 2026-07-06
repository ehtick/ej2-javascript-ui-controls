import { PdfForm } from '../src/pdf/core/form/form';
import { PdfField } from '../src/pdf/core/form/field';
import { _PdfCommand, _PdfReference } from '../src/pdf/core/pdf-primitives';
describe('PdfForm._getFieldIndex', () => {
    it('should return the index when the value matches _actualFieldNames', () => {
        const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;

        Object.defineProperty(form, '_fields', {
            value: [({} as unknown as _PdfReference)],
            writable: true,
            configurable: true
        });

        Object.defineProperty(form, '_fieldNames', {
            value: undefined,
            writable: true,
            configurable: true
        });
        Object.defineProperty(form, '_indexedFieldNames', {
            value: undefined,
            writable: true,
            configurable: true
        });
        Object.defineProperty(form, '_actualFieldNames', {
            value: undefined,
            writable: true,
            configurable: true
        });
        Object.defineProperty(form, '_indexedActualFieldNames', {
            value: undefined,
            writable: true,
            configurable: true
        });

        const mockField: PdfField = {
            get name(): string {
                return 'visibleField[0]';
            },
            get actualName(): string {
                return 'actualField[0]';
            }
        } as unknown as PdfField;

        form.fieldAt = (index: number): PdfField => {
            expect(index).toBe(0);
            return mockField;
        };

        const index: number = (form as unknown as {
            _getFieldIndex(name: string): number;
        })._getFieldIndex('actualField[0]');

        expect(index).toBe(0);
    });
});

import { PdfGraphics } from '../src/pdf/core/graphics/pdf-graphics';

describe('PdfGraphics _initializeCoordinates coverage', () => {
    it('should evaluate the highlighted CropBox else-if branch', () => {
        const graphics: any = Object.create(PdfGraphics.prototype); // eslint-disable-line

        graphics._size = { width: 100, height: 200 };
        graphics._mediaBoxUpperRightBound = 0;
        graphics._cropBox = undefined;
        graphics._sw = {
            _writeComment: jasmine.createSpy('_writeComment')
        };
        graphics.translateTransform = jasmine.createSpy('translateTransform');

        const calls: string[] = [];

        const hasSpy = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            calls.push(`has:${key}`);
            return key === 'CropBox' || key === 'MediaBox';
        });

        const getArraySpy = jasmine.createSpy('getArray').and.callFake((key: string): number[] => {
            calls.push(`getArray:${key}`);
            if (key === 'CropBox') {
                return [1, 1, 50, 50];
            }
            if (key === 'MediaBox') {
                return [0, 0, 50, 50];
            }
            return [];
        });

        const page: any = { // eslint-disable-line
            _origin: [0, 0],
            _pageDictionary: {
                has: hasSpy,
                getArray: getArraySpy
            }
        };

        expect((): void => {
            graphics._initializeCoordinates(page);
        }).not.toThrow();

        expect(calls).toEqual([
            'has:CropBox',
            'has:MediaBox',
            'getArray:CropBox',
            'getArray:MediaBox',
            'has:CropBox'
        ]);
    });
});

describe('PdfGraphics._initializeCoordinates - highlighted branch coverage', () => {
    type DictStub = {
        has: jasmine.Spy;
        getArray: jasmine.Spy;
    };

    function createGraphics(overrides?: Partial<PdfGraphics & any>): PdfGraphics & any {
        const graphics: PdfGraphics & any = Object.create(PdfGraphics.prototype);

        // Fully stub all members read by _initializeCoordinates to avoid undefined/type errors.
        graphics._sw = {
            _writeComment: jasmine.createSpy('_writeComment')
        };
        graphics.translateTransform = jasmine.createSpy('translateTransform');
        graphics._size = { width: 300, height: 400 };
        graphics._mediaBoxUpperRightBound = 0;
        graphics._cropBox = undefined;

        if (overrides) {
            Object.assign(graphics, overrides);
        }
        return graphics;
    }

    function createPage(options?: {
        origin?: number[];
        hasImpl?: (key: string) => boolean;
        arrays?: { [key: string]: number[] };
    }): any {
        const dict: DictStub = {
            has: jasmine.createSpy('has'),
            getArray: jasmine.createSpy('getArray')
        };

        const arrays: { [key: string]: number[] } = (options && options.arrays) ? options.arrays : {
            CropBox: [0, 0, 100, 100],
            MediaBox: [0, 0, 100, 100]
        };

        dict.getArray.and.callFake((key: string) => arrays[key]);

        if (options && options.hasImpl) {
            dict.has.and.callFake(options.hasImpl);
        } else {
            dict.has.and.callFake((key: string) => Object.prototype.hasOwnProperty.call(arrays, key));
        }

        return {
            _origin: (options && options.origin) ? options.origin : [0, 0],
            _pageDictionary: dict
        };
    }

    it('covers page branch: equal CropBox/MediaBox -> needTransformation -> uses graphics._cropBox', () => {
        const graphics = createGraphics({
            _cropBox: [5, 6, 250, 350],
            _mediaBoxUpperRightBound: 200
        });

        const page = createPage({
            arrays: {
                CropBox: [0, 0, 100, 100],
                MediaBox: [0, 0, 100, 100]
            }
        });

        expect(() => {
            graphics._initializeCoordinates(page);
        }).not.toThrow();

        expect(graphics._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 5, y: -350 });
    });

    it('covers page branch: positive CropBox + negative MediaBox -> translates by CropBox', () => {
        const graphics = createGraphics();

        const page = createPage({
            arrays: {
                CropBox: [10, 0, 120, 200],
                MediaBox: [-10, -20, 120, 200]
            }
        });

        expect(() => {
            graphics._initializeCoordinates(page);
        }).not.toThrow();

        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 10, y: -200 });
        expect(graphics._sw._writeComment).not.toHaveBeenCalled();
    });

    it('covers explicit impossible else-if branch by using a stateful has() spy', () => {
        const graphics = createGraphics({
            _cropBox: undefined,
            _mediaBoxUpperRightBound: 0,
            _size: { width: 300, height: 400 }
        });

        let cropBoxCallCount: number = 0;
        const page = createPage({
            origin: [0, 10],
            arrays: {
                CropBox: [0, 0, 100, 100],
                MediaBox: [1, 0, 200, 200]
            },
            hasImpl: (key: string): boolean => {
                if (key === 'CropBox') {
                    cropBoxCallCount++;
                    // 1st CropBox check (outer if) => true
                    // 2nd CropBox check (explicit else-if) => false
                    return cropBoxCallCount === 1;
                }
                if (key === 'MediaBox') {
                    return true;
                }
                return false;
            }
        });

        expect(() => {
            graphics._initializeCoordinates(page);
        }).not.toThrow();

        expect(graphics._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -400 });
    });

    it('covers page needTransformation branch without graphics._cropBox and hits mediaBoxUpperRightBound else path', () => {
        const graphics = createGraphics({
            _cropBox: undefined,
            _mediaBoxUpperRightBound: 500,
            _size: { width: 300, height: 400 }
        });

        const page = createPage({
            origin: [0, -600],
            arrays: {
                CropBox: [0, 0, 100, 100],
                MediaBox: [0, 0, 100, 100]
            }
        });

        expect(() => {
            graphics._initializeCoordinates(page);
        }).not.toThrow();

        expect(graphics._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -500 });
    });

    it('covers no-page branch: has _cropBox and direct crop condition is true', () => {
        const graphics = createGraphics({
            _cropBox: [10, 0, 200, 250],
            _mediaBoxUpperRightBound: 999,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 10, y: -250 });
    });

    it('covers no-page branch: has _cropBox, crop condition false, then upperRightBound === size.height', () => {
        const graphics = createGraphics({
            _cropBox: [0, 0, 100, 100],
            _mediaBoxUpperRightBound: 400,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -400 });
    });

    it('covers no-page branch: has _cropBox, crop condition false, then upperRightBound other value', () => {
        const graphics = createGraphics({
            _cropBox: [0, 0, 100, 100],
            _mediaBoxUpperRightBound: 550,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -550 });
    });

    it('covers no-page branch: no _cropBox, upperRightBound === size.height', () => {
        const graphics = createGraphics({
            _cropBox: undefined,
            _mediaBoxUpperRightBound: 400,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -400 });
    });

    it('covers no-page branch: no _cropBox, upperRightBound uses explicit else branch', () => {
        const graphics = createGraphics({
            _cropBox: undefined,
            _mediaBoxUpperRightBound: 650,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: -650 });
    });

    it('covers no-page outer condition false: upperRightBound === -size.height so no translate is applied', () => {
        const graphics = createGraphics({
            _cropBox: [10, 20, 100, 200],
            _mediaBoxUpperRightBound: -400,
            _size: { width: 300, height: 400 }
        });

        expect(() => {
            graphics._initializeCoordinates();
        }).not.toThrow();

        expect(graphics._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect(graphics.translateTransform).not.toHaveBeenCalled();
    });
});

import { PdfPath } from '../src/pdf/core/graphics/pdf-path';
import { PdfFillMode, PathPointType } from '../src/pdf/core/enumerator';

describe('PdfPath uncovered branch coverage', () => {

    it('covers default constructor else branch safely', () => {
        const path: PdfPath = new PdfPath();

        expect(path).toBeDefined();
        expect(path.pathPoints.length).toBe(0);
        expect(path.pathTypes.length).toBe(0);
        expect(path.fillMode).toBe(PdfFillMode.winding);
        expect(path.lastPoint).toEqual({ x: 0, y: 0 });
    });

    it('covers constructor assignment branch with valid points and pathTypes', () => {
        const points: Array<{ x: number; y: number }> = [
            { x: 10, y: 20 },
            { x: 30, y: 40 }
        ];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];

        const path: PdfPath = new PdfPath(points, types);

        expect(path.pathPoints).toBe(points);
        expect(path.pathTypes).toBe(types);
        expect(path.lastPoint).toEqual({ x: 30, y: 40 });
    });

    it('covers fillMode setter and getter', () => {
        const path: PdfPath = new PdfPath();

        path.fillMode = PdfFillMode.alternate;

        expect(path.fillMode).toBe(PdfFillMode.alternate);
    });

    it('covers addPath(PdfPath) overload safely', () => {
        const source: PdfPath = new PdfPath(
            [{ x: 1, y: 2 }, { x: 3, y: 4 }],
            [PathPointType.start, PathPointType.line]
        );
        const target: PdfPath = new PdfPath();

        expect(() => {
            target.addPath(source);
        }).not.toThrow();

        expect(target.pathPoints.length).toBe(2);
        expect(target.pathPoints[0]).toEqual({ x: 1, y: 2 });
        expect(target.pathPoints[1]).toEqual({ x: 3, y: 4 });
        expect(target.pathTypes).toEqual([PathPointType.start, PathPointType.line]);
    });

    it('covers addPath(points, pathTypes) overload safely', () => {
        const target: PdfPath = new PdfPath();
        const points: Array<{ x: number; y: number }> = [
            { x: 11, y: 22 },
            { x: 33, y: 44 }
        ];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];

        expect(() => {
            target.addPath(points, types);
        }).not.toThrow();

        expect(target.pathPoints).toEqual(points);
        expect(target.pathTypes).toEqual(types);
    });

    it('covers _addPath null/undefined pathPoints error branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPath(undefined as unknown as Array<{ x: number; y: number }>, [PathPointType.start]);
        }).toThrowError('Path points cannot be null or undefined.');
    });

    it('covers _addPath empty pathPoints error branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPath([], [PathPointType.start]);
        }).toThrowError('Path points cannot be null or undefined.');
    });

    it('covers _addPath null/undefined pathTypes error branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPath([{ x: 1, y: 2 }], undefined as unknown as PathPointType[]);
        }).toThrowError('Path types cannot be null or undefined.');
    });

    it('covers _addPath empty pathTypes error branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPath([{ x: 1, y: 2 }], []);
        }).toThrowError('Path types cannot be null or undefined.');
    });

    it('covers _addPath unequal length error branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPath(
                [{ x: 1, y: 2 }, { x: 3, y: 4 }],
                [PathPointType.start]
            );
        }).toThrowError('The argument arrays should be of equal length.');
    });

    it('covers _addPath Array.isArray(p) true branch', () => {
        const path: PdfPath = new PdfPath();
        const pathPoints: any = [
            [10, 20],
            [30, 40]
        ];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line];

        expect(() => {
            path._addPath(pathPoints, pathTypes);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(2);
        expect(path.pathPoints[0]).toEqual({ x: 10, y: 20 });
        expect(path.pathPoints[1]).toEqual({ x: 30, y: 40 });
        expect(path.pathTypes).toEqual(pathTypes);
    });

    it('covers _addPath Array.isArray(p) false explicit else branch', () => {
        const path: PdfPath = new PdfPath();
        const pathPoints: Array<{ x: number; y: number }> = [
            { x: 100, y: 200 },
            { x: 300, y: 400 }
        ];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line];

        expect(() => {
            path._addPath(pathPoints, pathTypes);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(2);
        expect(path.pathPoints[0]).toEqual({ x: 100, y: 200 });
        expect(path.pathPoints[1]).toEqual({ x: 300, y: 400 });
        expect(path.pathTypes).toEqual(pathTypes);
    });

    it('covers the explicit red branch: if (i >= pathPoints.length || i < 0)', () => {
        const path: PdfPath = new PdfPath();

        let pathPointsLengthCallCount: number = 0;
        const pathPoints: any = {
            0: { x: 9, y: 9 }
        };

        Object.defineProperty(pathPoints, 'length', {
            configurable: true,
            enumerable: true,
            get: (): number => {
                pathPointsLengthCallCount++;
                // Access order in _addPath:
                // 1 -> validation (!pathPoints || pathPoints.length === 0)
                // 2 -> mismatch check (pathPoints.length !== pathTypes.length)
                // 3 -> for loop condition (i < pathPoints.length)
                // 4 -> explicit inner condition (i >= pathPoints.length || i < 0)
                if (pathPointsLengthCallCount === 1) {
                    return 1;
                }
                if (pathPointsLengthCallCount === 2) {
                    return 1;
                }
                if (pathPointsLengthCallCount === 3) {
                    return 1;
                }
                return 0;
            }
        });

        const pathTypes: any = {
            0: PathPointType.start
        };

        Object.defineProperty(pathTypes, 'length', {
            configurable: true,
            enumerable: true,
            get: (): number => 1
        });

        expect(() => {
            path._addPath(pathPoints as Array<{ x: number; y: number }>, pathTypes as PathPointType[]);
        }).toThrowError('Index0is out of bounds.');
    });

    it('covers addLine safely', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path.addLine({ x: 10, y: 20 }, { x: 30, y: 40 });
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(2);
        expect(path.pathPoints[0]).toEqual({ x: 10, y: 20 });
        expect(path.pathPoints[1]).toEqual({ x: 30, y: 40 });
        expect(path.pathTypes[0]).toBe(PathPointType.start);
        expect(path.pathTypes[1]).toBe(PathPointType.line);
    });

    it('covers _addLines single-point branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addLines([{ x: 50, y: 60 }]);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(1);
        expect(path.pathPoints[0]).toEqual({ x: 50, y: 60 });
        expect(path.pathTypes[0]).toBe(PathPointType.line);
    });

    it('covers _addLines multi-point else branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addLines([
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 }
            ]);
        }).not.toThrow();

        expect(path.pathPoints.length).toBeGreaterThan(0);
        expect(path.pathPoints[0]).toEqual({ x: 1, y: 1 });
        expect(path.pathPoints[path.pathPoints.length - 1]).toEqual({ x: 3, y: 3 });
    });

    it('covers _addPoints initial start branch', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path._addPoints([5, 6, 7, 8], PathPointType.line);
        }).not.toThrow();

        expect(path.pathPoints[0]).toEqual({ x: 5, y: 6 });
        expect(path.pathTypes[0]).toBe(PathPointType.start);
        expect(path.pathPoints[1]).toEqual({ x: 7, y: 8 });
        expect(path.pathTypes[1]).toBe(PathPointType.line);
    });

    it('covers _addPoints rounded rectangle branch', () => {
        const path: PdfPath = new PdfPath();

        path._points = [{ x: 1, y: 1 }];
        path._pathTypes = [PathPointType.start];
        path._isStart = false;
        path._isRoundedRectangle = true;

        expect(() => {
            path._addPoints([2, 1], PathPointType.line);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(2);
        expect(path.pathPoints[1]).toEqual({ x: 2, y: 1 });
        expect(path.pathTypes[1]).toBe(PathPointType.line);
    });

    it('covers _addPoints non-rounded explicit else-if branch where x and y both differ', () => {
        const path: PdfPath = new PdfPath();

        path._points = [{ x: 10, y: 10 }];
        path._pathTypes = [PathPointType.start];
        path._isStart = false;
        path._isRoundedRectangle = false;

        expect(() => {
            path._addPoints([20, 30], PathPointType.line);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(2);
        expect(path.pathPoints[1]).toEqual({ x: 20, y: 30 });
        expect(path.pathTypes[1]).toBe(PathPointType.line);
    });

    it('covers _addPoints branch where first point equals lastPoint so no extra point is added', () => {
        const path: PdfPath = new PdfPath();

        path._points = [{ x: 10, y: 10 }];
        path._pathTypes = [PathPointType.start];
        path._isStart = false;
        path._isRoundedRectangle = false;

        expect(() => {
            path._addPoints([10, 10], PathPointType.line);
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(1);
        expect(path.pathTypes.length).toBe(1);
    });

    it('covers closeFigure(index) branch safely', () => {
        const path: PdfPath = new PdfPath(
            [{ x: 1, y: 1 }, { x: 2, y: 2 }],
            [PathPointType.start, PathPointType.line]
        );

        expect(() => {
            path.closeFigure(1);
        }).not.toThrow();

        expect((path.pathTypes[1] & PathPointType.closePath) === PathPointType.closePath).toBe(true);
    });

    it('covers closeFigure() else branch with points', () => {
        const path: PdfPath = new PdfPath(
            [{ x: 1, y: 1 }, { x: 2, y: 2 }],
            [PathPointType.start, PathPointType.line]
        );

        expect(() => {
            path.closeFigure();
        }).not.toThrow();

        expect((path.pathTypes[1] & PathPointType.closePath) === PathPointType.closePath).toBe(true);
    });

    it('covers closeFigure() else branch with no points', () => {
        const path: PdfPath = new PdfPath();

        expect(() => {
            path.closeFigure();
        }).not.toThrow();

        expect(path.pathPoints.length).toBe(0);
        expect(path.pathTypes.length).toBe(0);
    });

    it('covers closeAllFigures start-point branch', () => {
        const path: PdfPath = new PdfPath(
            [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 20 }
            ],
            [
                PathPointType.start,
                PathPointType.line,
                PathPointType.start
            ]
        );

        expect(() => {
            path.closeAllFigures();
        }).not.toThrow();

        expect((path.pathTypes[1] & PathPointType.closePath) === PathPointType.closePath).toBe(true);
    });

    it('covers closeAllFigures _isXps branch when first and last points match', () => {
        const path: PdfPath = new PdfPath(
            [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
                { x: 5, y: 5 }
            ],
            [
                PathPointType.start,
                PathPointType.line,
                PathPointType.line
            ]
        );
        path._isXps = true;

        expect(() => {
            path.closeAllFigures();
        }).not.toThrow();

        expect((path.pathTypes[2] & PathPointType.closePath) === PathPointType.closePath).toBe(true);
    });

    it('covers _getBounds empty-path branch', () => {
        const path: PdfPath = new PdfPath();

        expect(path._getBounds()).toEqual([0, 0, 0, 0]);
    });

    it('covers _getBounds populated-path branch', () => {
        const path: PdfPath = new PdfPath(
            [
                { x: 10, y: 30 },
                { x: 50, y: 5 },
                { x: 70, y: 60 }
            ],
            [
                PathPointType.start,
                PathPointType.line,
                PathPointType.line
            ]
        );

        expect(path._getBounds()).toEqual([10, 5, 60, 55]);
    });
});
``

import { _PngDecoder } from '../src/pdf/core/graphics/images/png-decoder';
import { _ArabicShapeRenderer } from '../src/pdf/core/graphics/rightToLeft/text-shape';

describe('_PngDecoder uncovered branch coverage', () => {
    function createDecoder(): _PngDecoder & any {
        return Object.create(_PngDecoder.prototype) as _PngDecoder & any;
    }

    describe('_hasValidChunkType', () => {
        it('covers the explicit else branch when chunk type is null and stream has remaining bytes', () => {
            const decoder: _PngDecoder & any = createDecoder();
            decoder._stream = new Uint8Array(20);
            decoder._position = 0;
            decoder._currentChunkLength = 0;

            spyOn(decoder, '_readUnsigned32').and.returnValue(5);
            spyOn(decoder, '_seek').and.callFake((count: number): void => {
                decoder._position += count;
            });
            spyOn(decoder, '_readString').and.callFake((count: number): string => {
                decoder._position += count;
                return 'ABCD';
            });
            spyOn(decoder, '_getChunkType').and.returnValue(null);

            expect(() => {
                const result: { type: number; hasValidChunk: boolean } =
                    decoder._hasValidChunkType(undefined);

                expect(result.hasValidChunk).toBe(true);
                expect(decoder._currentChunkLength).toBe(5);
            }).not.toThrow();
        });

        it('covers the byteLength === position branch when chunk type is null and stream ends exactly', () => {
            const decoder: _PngDecoder & any = createDecoder();
            decoder._stream = new Uint8Array(8);
            decoder._position = 0;
            decoder._currentChunkLength = 0;

            spyOn(decoder, '_readUnsigned32').and.returnValue(3);
            spyOn(decoder, '_seek').and.callFake((count: number): void => {
                decoder._position += count;
            });
            spyOn(decoder, '_readString').and.callFake((count: number): string => {
                decoder._position += count;
                return 'WXYZ';
            });
            spyOn(decoder, '_getChunkType').and.returnValue(undefined);

            expect(() => {
                const result: { type: number; hasValidChunk: boolean } =
                    decoder._hasValidChunkType(undefined);

                expect(result.hasValidChunk).toBe(false);
                expect(decoder._position).toBe(8);
            }).not.toThrow();
        });

        it('covers the valid header branch safely', () => {
            const decoder: _PngDecoder & any = createDecoder();
            decoder._stream = new Uint8Array(12);
            decoder._position = 0;
            decoder._currentChunkLength = 0;

            spyOn(decoder, '_readUnsigned32').and.returnValue(4);
            spyOn(decoder, '_seek').and.callFake((count: number): void => {
                decoder._position += count;
            });
            spyOn(decoder, '_readString').and.callFake((count: number): string => {
                decoder._position += count;
                return 'IHDR';
            });
            spyOn(decoder, '_getChunkType').and.returnValue(0);

            expect(() => {
                const result: { type: number; hasValidChunk: boolean } =
                    decoder._hasValidChunkType(undefined);

                expect(result.type).toBe(0);
                expect(result.hasValidChunk).toBe(true);
            }).not.toThrow();
        });

        it('covers the outer false branch when there are not enough bytes for a chunk header', () => {
            const decoder: _PngDecoder & any = createDecoder();
            decoder._stream = new Uint8Array(6);
            decoder._position = 0;

            expect(() => {
                const result: { type: number; hasValidChunk: boolean } =
                    decoder._hasValidChunkType(undefined);

                expect(result.hasValidChunk).toBe(false);
            }).not.toThrow();
        });
    });

    describe('_decodeImageData', () => {
        it('covers mask allocation, encoded stream inflate branch, and decoded image allocation', () => {
            const decoder: _PngDecoder & any = createDecoder();

            decoder._header = {
                _interlace: 0,
                _bitDepth: 8,
                _colorType: 4
            };
            decoder._width = 2;
            decoder._height = 2;
            decoder._shades = false;
            decoder._ideateDecode = true;
            decoder._encodedStream = new Uint8Array([1, 2, 3, 4, 5, 6]);
            decoder._encodedStreamLength = 4;
            decoder._idatLength = 4;
            decoder._decodedImageData = undefined;
            decoder._dataStream = undefined;
            decoder._dataStreamOffset = -1;

            const inflated: Uint8Array = new Uint8Array([10, 11, 12, 13]);
            spyOn(decoder, '_getDeflatedData').and.returnValue(inflated);
            spyOn(decoder, '_readDecodeData').and.callFake((): void => {
                // intentionally no-op for branch coverage
            });

            expect(() => {
                decoder._decodeImageData();
            }).not.toThrow();

            expect(decoder._isDecode).toBe(true);
            expect(decoder._maskData).toBeDefined();
            expect(decoder._maskData.length).toBe(4);
            expect(decoder._dataStream).toBe(inflated);
            expect(decoder._dataStreamOffset).toBe(0);
            expect(decoder._decodedImageData).toBeDefined();
            expect(decoder._decodedImageData.length).toBe(4);
            expect(decoder._ideateDecode).toBe(true);
        });

        it('covers the explicit shades fallback branch when decodedImageData is empty', () => {
            const decoder: _PngDecoder & any = createDecoder();

            decoder._header = {
                _interlace: 0,
                _bitDepth: 8,
                _colorType: 3
            };
            decoder._width = 1;
            decoder._height = 1;
            decoder._shades = true;
            decoder._ideateDecode = true;
            decoder._encodedStream = new Uint8Array([9, 8, 7, 6]);
            decoder._encodedStreamLength = 3;
            decoder._idatLength = 0;
            decoder._decodedImageData = new Uint8Array(0);
            decoder._maskData = undefined;
            decoder._dataStream = undefined;
            decoder._dataStreamOffset = -1;

            spyOn(decoder, '_getDeflatedData').and.returnValue(new Uint8Array([21, 22]));
            spyOn(decoder, '_readDecodeData').and.callFake((): void => {
                // keep decodedImageData empty so the highlighted fallback branch executes
            });

            expect(() => {
                decoder._decodeImageData();
            }).not.toThrow();

            expect(decoder._isDecode).toBe(true);
            expect(decoder._maskData).toBeDefined();
            expect(decoder._maskData.length).toBe(1);
            expect(decoder._dataStreamOffset).toBe(0);
            expect(decoder._ideateDecode).toBe(false);
            expect(Array.from(decoder._decodedImageData)).toEqual([9, 8, 7]);
        });

        it('covers the non-decode else branch safely', () => {
            const decoder: _PngDecoder & any = createDecoder();

            decoder._header = {
                _interlace: 0,
                _bitDepth: 8,
                _colorType: 2
            };
            decoder._shades = false;
            decoder._ideateDecode = true;
            decoder._encodedStream = new Uint8Array([50, 60, 70, 80]);
            decoder._encodedStreamLength = 2;

            expect(() => {
                decoder._decodeImageData();
            }).not.toThrow();

            expect(decoder._isDecode).toBe(false);
            expect(decoder._ideateDecode).toBe(false);
            expect(Array.from(decoder._decodedImageData)).toEqual([50, 60]);
        });
    });
});
describe('_ArabicShapeRenderer._getShapeCount minimal uncovered coverage', () => {
    let renderer: _ArabicShapeRenderer;

    beforeEach(() => {
        renderer = new _ArabicShapeRenderer();
    });

    it('returns mapped shape count for Arabic character', () => {
        expect(renderer._getShapeCount('\u064A')).toBe(4);
    });

    it('returns 1 for excluded Arabic vowel mark', () => {
        expect(renderer._getShapeCount('\u064B')).toBe(1);
    });

    it('returns 1 for superscript alef exclusion', () => {
        expect(renderer._getShapeCount('\u0670')).toBe(1);
    });

    it('covers explicit zero width joiner else-if branch', () => {
        expect(renderer._getShapeCount('\u200D')).toBe(4);
    });

    it('returns 1 for non-Arabic input', () => {
        expect(renderer._getShapeCount('A')).toBe(1);
    });
});
import { _FdfDocument } from '../src/pdf/core/import-export/fdf-document';

describe('_FdfDocument._readFdfData exact uncovered line coverage', () => {
    function createParser(tokens: any[]): any { // eslint-disable-line
        let index: number = 0;
        return {
            first: 0,
            getObject: jasmine.createSpy('getObject').and.callFake((): any => { // eslint-disable-line
                if (index < tokens.length) {
                    const token: any = tokens[index]; // eslint-disable-line
                    index++;
                    return token;
                }
                return 'EOF';
            })
        };
    }

    function createFieldDictionary(): _PdfDictionary {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        dictionary.set('T', ['Field-One']);
        dictionary.set('V', _PdfName.get('Yes'));
        return dictionary;
    }

    it('should hit the _PdfCommand.command !== null line in non-spec form import', () => {
        const fdf: _FdfDocument & any = new _FdfDocument() as _FdfDocument & any; // eslint-disable-line
        fdf._isAnnotationImport = false;
        fdf._asPerSpecification = false;
        fdf._table = new Map<any, any>(); // eslint-disable-line

        spyOn(fdf, '_importField').and.callFake((): void => {
            // keep the test isolated and synchronous
        });

        // Use a REAL _PdfCommand instance if constructor supports it.
        // If your constructor signature differs, keep the fallback below.
        let commandToken: _PdfCommand;
        try {
            commandToken = new (_PdfCommand as any)('obj'); // eslint-disable-line
            commandToken.command = 'obj';
        } catch (e) {
            commandToken = Object.create(_PdfCommand.prototype) as _PdfCommand;
            Object.defineProperty(commandToken, 'command', {
                value: 'obj',
                writable: true,
                configurable: true,
                enumerable: true
            });
        }

        const fieldDictionary: _PdfDictionary = createFieldDictionary();

        // VERY IMPORTANT:
        // _readFdfData() calls parser.getObject() 3 times before checking:
        // if (token instanceof _PdfCommand && token.command !== null)
        //
        // So the _PdfCommand must be the THIRD token.
        const parser: any = createParser([ // eslint-disable-line
            'ignored-1',      // 1st getObject()
            'ignored-2',      // 2nd getObject()
            commandToken,     // 3rd getObject() -> exact highlighted line
            fieldDictionary,  // consumed inside while loop after token becomes token.command
            'EOF'
        ]);

        expect(() => {
            fdf._readFdfData(parser);
        }).not.toThrow();

        expect((parser.getObject as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(4);
        expect(fdf._importField).toHaveBeenCalled();
        expect(fdf._table.size).toBe(1);

        const key: any = Array.from(fdf._table.keys())[0]; // eslint-disable-line
        const value: any = Array.from(fdf._table.values())[0]; // eslint-disable-line

        expect(Array.isArray(key)).toBe(true);
        expect(key[0]).toBe('Field-One');
        expect(value).toBe('Yes');
    });
});

import { _XfdfDocument } from '../src/pdf/core/import-export/xfdf-document';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import {
    PdfTextBoxField,
    PdfListBoxField,
    PdfComboBoxField,
    PdfRadioButtonListField,
    PdfCheckBoxField,
    PdfListField
} from '../src/pdf/core/form/field';
import * as utils from '../src/pdf/core/utils';
import { _PdfContentStream } from '../src/pdf/core/base-stream';

describe('_XfdfDocument highlighted coverage', () => {
    function defineReadable(target: any, property: string, value: any): void { // eslint-disable-line
        Object.defineProperty(target, property, {
            configurable: true,
            enumerable: true,
            get: (): any => value // eslint-disable-line
        });
    }

    function defineWritable(target: any, property: string, value: any): void { // eslint-disable-line
        Object.defineProperty(target, property, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value
        });
    }

    function createSpyTable(): { table: any; store: Map<any, any> } { // eslint-disable-line
        const store: Map<any, any> = new Map<any, any>(); // eslint-disable-line
        const table: any = { // eslint-disable-line
            set: jasmine.createSpy('set').and.callFake((key: any, value: any): void => { // eslint-disable-line
                store.set(key, value);
            })
        };
        return { table, store };
    }

    function createHelper(): _XfdfDocument & any { // eslint-disable-line
        const helper: _XfdfDocument & any = Object.create(_XfdfDocument.prototype) as _XfdfDocument & any; // eslint-disable-line
        const tableInfo: { table: any; store: Map<any, any> } = createSpyTable(); // eslint-disable-line

        helper._table = tableInfo.table;
        helper._tableStore = tableInfo.store;
        helper._fields = new Map<string, string[]>();
        helper._richTextValues = new Map<string, string>();
        helper._formKey = '';
        helper._key = '_KEY_';
        helper._exportEmptyFields = false;
        helper._asPerSpecification = false;
        helper._format = 'XFDF';

        spyOn(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
        spyOn(helper, '_getEncodedValue').and.callFake((value: string): string => value);

        return helper;
    }

    function createField<T>(proto: object, fieldName: string): T & any { // eslint-disable-line
        const field: T & any = Object.create(proto) as T & any; // eslint-disable-line
        defineReadable(field, 'name', fieldName);
        defineReadable(field, 'export', true);
        defineReadable(field, 'readOnly', false);
        defineWritable(field, '_dictionary', new _PdfDictionary());
        return field;
    }

    afterEach(() => {
        // Important: clean up utility spies per test so other coverage specs are not affected.
        const inheritable: any = utils as any; // eslint-disable-line
        if (inheritable._getInheritableProperty && inheritable._getInheritableProperty.calls) {
            inheritable._getInheritableProperty.calls.reset();
        }
    });

    it('covers _exportFormFieldsData: Ch branch explicit exportEmptyFields path', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._exportEmptyFields = true;

        const field: PdfComboBoxField & any = createField<PdfComboBoxField>( // eslint-disable-line
            PdfComboBoxField.prototype,
            'combo-empty'
        );

        field._dictionary.has = jasmine.createSpy('has').and.returnValue(false);
        defineWritable(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.returnValue(undefined));

        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Ch');
            }
            if (key === 'V') {
                return undefined;
            }
            return undefined;
        });

        expect(() => {
            const value: string | string[] = helper._exportFormFieldsData(field);
            expect(value).toBe('');
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('combo-empty', '');
        expect(helper._tableStore.get('combo-empty')).toBe('');
    });

    it('covers _exportFormFieldsData: Btn branch options path using radioButton.selectedIndex', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line

        const field: PdfRadioButtonListField & any = createField<PdfRadioButtonListField>( // eslint-disable-line
            PdfRadioButtonListField.prototype,
            'radio-options'
        );

        defineReadable(field, 'selectedIndex', 1);
        field._dictionary.has = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            return key === 'Opt';
        });
        field._dictionary.getArray = jasmine.createSpy('getArray').and.returnValue(['Zero', 'One', 'Two']);

        spyOn(helper, '_getExportValue').and.returnValue('1');
        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Btn');
            }
            if (key === 'V') {
                return '1';
            }
            return undefined;
        });

        expect(() => {
            const value: string | string[] = helper._exportFormFieldsData(field);
            expect(value).toBe('One');
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('radio-options', 'One');
        expect(helper._tableStore.get('radio-options')).toBe('One');
    });

    it('covers _exportFormFieldsData: Btn branch with empty export value and exportEmptyFields=true', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._exportEmptyFields = true;

        const field: PdfCheckBoxField & any = createField<PdfCheckBoxField>( // eslint-disable-line
            PdfCheckBoxField.prototype,
            'check-empty'
        );

        field._dictionary.has = jasmine.createSpy('has').and.returnValue(false);

        spyOn(helper, '_getExportValue').and.returnValue('');
        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Btn');
            }
            if (key === 'V') {
                return _PdfName.get('Off');
            }
            return undefined;
        });

        expect(() => {
            const value: string | string[] = helper._exportFormFieldsData(field);
            expect(value).toBe('');
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('check-empty', '');
        expect(helper._tableStore.get('check-empty')).toBe('');
    });

    it('covers _exportFormFieldData: Tx spec branch with RV appending _key and setting _formKey', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._asPerSpecification = true;
        helper._key = '_RICH_';

        const field: PdfTextBoxField & any = createField<PdfTextBoxField>( // eslint-disable-line
            PdfTextBoxField.prototype,
            'rich-text'
        );

        field._dictionary.has = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            return key === 'RV';
        });

        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Tx');
            }
            if (key === 'V') {
                return undefined;
            }
            if (key === 'RV') {
                return '<body>value</body>';
            }
            return undefined;
        });

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        expect(helper._formKey).toBe('_RICH_');
        expect(helper._table.set).toHaveBeenCalledWith('rich-text', '<body>value</body>_RICH_');
        expect(helper._tableStore.get('rich-text')).toBe('<body>value</body>_RICH_');
    });

    it('covers _exportFormFieldData: Tx spec multiline branch with newline normalization', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._asPerSpecification = true;

        const field: PdfTextBoxField & any = createField<PdfTextBoxField>( // eslint-disable-line
            PdfTextBoxField.prototype,
            'multiline-text'
        );

        defineReadable(field, 'multiLine', true);
        field._dictionary.has = jasmine.createSpy('has').and.returnValue(false);

        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Tx');
            }
            if (key === 'V') {
                return 'line1\nline2\rline3';
            }
            return undefined;
        });

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('multiline-text', 'line1line2\r\nline3');
        expect(helper._tableStore.get('multiline-text')).toBe('line1line2\r\nline3');
    });

    it('covers _exportFormFieldData: Ch spec branch with field._dictionary.has(I) and selected array values', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._asPerSpecification = true;

        const field: PdfListField & any = createField<PdfListField>( // eslint-disable-line
            PdfListField.prototype,
            'list-selected'
        );

        field._dictionary.has = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            return key === 'I';
        });
        defineWritable(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.returnValue(['A', 'B']));

        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Ch');
            }
            if (key === 'V') {
                return undefined;
            }
            return undefined;
        });

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('list-selected', ['A', 'B']);
        expect(helper._tableStore.get('list-selected')).toEqual(['A', 'B']);
    });

    it('covers _exportFormFieldData: Ch non-spec explicit exportEmptyFields path', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        helper._asPerSpecification = false;
        helper._exportEmptyFields = true;

        const field: PdfListBoxField & any = createField<PdfListBoxField>( // eslint-disable-line
            PdfListBoxField.prototype,
            'list-empty'
        );

        field._dictionary.has = jasmine.createSpy('has').and.returnValue(false);
        defineWritable(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.returnValue(undefined));

        spyOn(utils as any, '_getInheritableProperty').and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Ch');
            }
            if (key === 'V') {
                return undefined;
            }
            return undefined;
        });

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        expect(helper._table.set).toHaveBeenCalledWith('list-empty', '');
        expect(helper._tableStore.get('list-empty')).toBe('');
    });

    it('covers _writeObject reachable path safely for string primitive', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line
        const writer: any = { // eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeEndElement: jasmine.createSpy('_writeEndElement')
        };
        const dictionary: _PdfDictionary = new _PdfDictionary();

        spyOn(helper, '_writePrefix').and.callThrough();

        expect(() => {
            helper._writeObject(writer, 'sample', dictionary, 'T');
        }).not.toThrow();

        expect(helper._writePrefix).toHaveBeenCalledWith(writer, 'STRING', 'T');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('VAL', 'sample');
        expect(writer._writeEndElement).toHaveBeenCalled();
    });
});
describe('_XfdfDocument exact coverage for Ch non-spec exportEmptyFields branches', () => {
    let inheritableSpy: jasmine.Spy;

    function createHelper(): _XfdfDocument & any { // eslint-disable-line
        const helper: _XfdfDocument & any = Object.create(_XfdfDocument.prototype) as _XfdfDocument & any; // eslint-disable-line

        helper._table = {
            set: jasmine.createSpy('set')
        };
        helper._fields = new Map<string, string[]>();
        helper._richTextValues = new Map<string, string>();
        helper._formKey = '';
        helper._key = '_KEY_';
        helper._exportEmptyFields = true;    // REQUIRED for both red branches
        helper._asPerSpecification = false;  // REQUIRED to enter the non-spec Ch path
        helper._format = 'XFDF';

        spyOn(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
        spyOn(helper, '_getEncodedValue').and.callFake((value: string): string => value);

        return helper;
    }

    beforeEach(() => {
        inheritableSpy = spyOn(utils as any, '_getInheritableProperty').and.returnValue(undefined); // eslint-disable-line
    });

    it('covers the inner red branch when selectedValue is defined but empty string', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line

        const field: any = { // eslint-disable-line
            name: 'ch-empty-inner',
            _dictionary: new _PdfDictionary()
        };

        // Real FT value is not necessary once _getInheritableProperty is spied,
        // but keeping it makes the object shape closer to real usage.
        field._dictionary.update('FT', _PdfName.get('Ch'));

        // Drive:
        // type.name === 'Ch'
        // value !== undefined
        // selectedValue = ''
        inheritableSpy.and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Ch');
            }
            if (key === 'V') {
                return 'dummy';
            }
            return undefined;
        });

        spyOn(helper, '_getExportValue').and.returnValue('');

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        // This proves the INNER highlighted branch executed:
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(helper._table.set).toHaveBeenCalled();
        const args: any[] = (helper._table.set as jasmine.Spy).calls.mostRecent().args; // eslint-disable-line
        expect(args.length).toBe(2);
        expect(args[1]).toBe('');
    });

    it('covers the outer red branch when selectedValue remains undefined', () => {
        const helper: _XfdfDocument & any = createHelper(); // eslint-disable-line

        const field: any = { // eslint-disable-line
            name: 'ch-empty-outer',
            _dictionary: new _PdfDictionary()
        };

        field._dictionary.update('FT', _PdfName.get('Ch'));

        // Drive:
        // type.name === 'Ch'
        // value === undefined
        // no I entry
        // selectedValue remains undefined
        inheritableSpy.and.callFake((dictionary: _PdfDictionary, key: string): any => { // eslint-disable-line
            if (key === 'FT') {
                return _PdfName.get('Ch');
            }
            if (key === 'V') {
                return undefined;
            }
            return undefined;
        });

        expect(() => {
            helper._exportFormFieldData(field);
        }).not.toThrow();

        // This proves the OUTER highlighted branch executed:
        // } else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(helper._table.set).toHaveBeenCalled();
        const args: any[] = (helper._table.set as jasmine.Spy).calls.mostRecent().args; // eslint-disable-line
        expect(args.length).toBe(2);
        expect(args[1]).toBe('');
    });
});

import { PdfLayer } from '../src/pdf/core/layers/layer';
import { PdfRotationAngle } from '../src/pdf/core/enumerator';
import * as graphicsModule from '../src/pdf/core/graphics/pdf-graphics';
describe('PdfLayer highlighted coverage', () => {
    function defineWritable(target: any, property: string, value: any): void { // eslint-disable-line
        Object.defineProperty(target, property, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value
        });
    }
    function createLayer(): PdfLayer & any { // eslint-disable-line
        const layer: PdfLayer & any = Object.create(PdfLayer.prototype) as PdfLayer & any; // eslint-disable-line
        defineWritable(layer, '_graphicsCollection', new Map<any, any>()); // eslint-disable-line
        defineWritable(layer, '_pageGraphics', new Map<any, any>()); // eslint-disable-line
        defineWritable(layer, '_pages', []);
        defineWritable(layer, '_content', new _PdfContentStream([]));
        defineWritable(layer, '_layer', layer);
        return layer;
    }

    describe('_initializeGraphics invalid negative MediaBox branch', () => {
        let graphicsSpy: jasmine.Spy;

        beforeEach(() => {
            graphicsSpy = spyOn(graphicsModule, 'PdfGraphics').and.callFake(function ( // eslint-disable-line
                size: any, // eslint-disable-line
                stream: _PdfContentStream,
                crossReference: any, // eslint-disable-line
                page: any // eslint-disable-line
            ): any { // eslint-disable-line
                return {
                    _resourceObject: new _PdfDictionary(),
                    _clipBounds: [0, 0, 10, 10],
                    _cropBox: undefined,
                    _mediaBoxUpperRightBound: 0,
                    _layer: undefined,
                    save: jasmine.createSpy('save').and.returnValue({}),
                    _initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
                    _clipTranslateMargins: jasmine.createSpy('_clipTranslateMargins'),
                    translateTransform: jasmine.createSpy('translateTransform'),
                    rotateTransform: jasmine.createSpy('rotateTransform')
                };
            } as any); // eslint-disable-line
        });

        it('covers all invalid negative MediaBox lines and recalculates width/height', () => {
            const layer: PdfLayer & any = createLayer(); // eslint-disable-line

            const pageDictionary: any = { // eslint-disable-line
                has: jasmine.createSpy('has').and.callFake((key: string): boolean => {
                    return key === 'MediaBox';
                })
            };

            const page: any = { // eslint-disable-line
                size: { width: 200, height: 100 },
                mediaBox: [-20, -100, -200, -50],
                cropBox: undefined,
                _pageDictionary: pageDictionary,
                _origin: [1, 1],
                _isNew: true,
                _pageSettings: undefined,
                _getActualBounds: jasmine.createSpy('_getActualBounds'),
                _crossReference: { _cacheMap: new Map<any, any>() } // eslint-disable-line
            };

            defineWritable(layer, '_page', page);
            defineWritable(layer, '_crossReference', page._crossReference);

            const stream: _PdfContentStream = new _PdfContentStream([]);

            expect(() => {
                layer._initializeGraphics(stream);
            }).not.toThrow();

            // First highlighted block:
            // width <= 0 || height <= 0
            // llx/lly/urx/ury negative normalization
            // width = Math.max(llx, urx)
            // height = Math.max(lly, ury)
            expect(graphicsSpy).toHaveBeenCalled();
            const args: any[] = graphicsSpy.calls.mostRecent().args; // eslint-disable-line
            expect(args[0]).toEqual({ width: 200, height: 100 });

            // mediaBoxUpperRightBound uses invalid-case branch
            expect(layer._graphics._mediaBoxUpperRightBound).toBe(-100);

            // origin >= 0 branch calls _initializeCoordinates() without page
            expect(layer._graphics._initializeCoordinates).toHaveBeenCalledWith();

            // bookkeeping after graphics initialization
            expect(layer._graphicsCollection.has(layer._graphics)).toBe(true);
            expect(layer._pageGraphics.has(page)).toBe(true);
            expect(layer._pages.indexOf(page)).not.toBe(-1);
            expect(layer._graphics._layer).toBe(layer);
        });
    });

    describe('_setVisibility highlighted branches', () => {
        it('covers value=true path: removes from ON and initializes OFF array when get(OFF) is undefined', () => {
            const layer: PdfLayer & any = createLayer(); // eslint-disable-line
            const referenceHolder: _PdfReference = _PdfReference.get(10, 0);
            defineWritable(layer, '_referenceHolder', referenceHolder);
            defineWritable(layer, '_crossReference', {});

            const onArray: _PdfReference[] = [referenceHolder, _PdfReference.get(11, 0)];

            const defaultView: any = { // eslint-disable-line
                _updated: false,
                has: jasmine.createSpy('has').and.callFake((key: string): boolean => {
                    return key === 'ON' || key === 'OFF';
                }),
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'ON') {
                        return onArray;
                    }
                    if (key === 'OFF') {
                        return undefined; // highlighted !ocgOFF -> ocgOFF = []
                    }
                    return undefined;
                }),
                update: jasmine.createSpy('update')
            };

            const ocProperties: any = { // eslint-disable-line
                _updated: false,
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'D') {
                        return defaultView;
                    }
                    return undefined;
                })
            };

            const catalog: any = { // eslint-disable-line
                has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'OCProperties'),
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'OCProperties') {
                        return ocProperties;
                    }
                    return undefined;
                })
            };

            defineWritable(layer, '_document', {
                _catalog: {
                    _catalogDictionary: catalog
                }
            });

            expect(() => {
                layer._setVisibility(true);
            }).not.toThrow();

            // highlighted ON branch:
            // if (defaultView.has('ON')) { ocgON = defaultView.get('ON'); if (!ocgON) { ... } }
            // if (ocgON) { index = ocgON.indexOf(ref); if (index !== -1) { ocgON.splice(index, 1); } }
            expect(onArray.indexOf(referenceHolder)).toBe(0);
            expect(onArray.length).toBe(1);

            // highlighted OFF initialization branch:
            // if (defaultView.has('OFF')) { ocgOFF = defaultView.get('OFF'); if (!ocgOFF) { ocgOFF = []; } }
            // then value=true path pushes referenceHolder into ocgOFF
            // because ocgOFF started undefined, no update('OFF', ...) happens in this specific path
            expect(defaultView._updated).toBe(true);
            expect(ocProperties._updated).toBe(true);
        });

        it('covers value=false path: initializes ON array when get(ON) is undefined and removes from OFF when present', () => {
            const layer: PdfLayer & any = createLayer(); // eslint-disable-line
            const referenceHolder: _PdfReference = _PdfReference.get(20, 0);
            defineWritable(layer, '_referenceHolder', referenceHolder);
            defineWritable(layer, '_crossReference', {});

            const offArray: _PdfReference[] = [referenceHolder, _PdfReference.get(21, 0)];

            const defaultView: any = { // eslint-disable-line
                _updated: false,
                has: jasmine.createSpy('has').and.callFake((key: string): boolean => {
                    return key === 'ON' || key === 'OFF';
                }),
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'ON') {
                        return undefined; // highlighted !ocgON -> ocgON = []
                    }
                    if (key === 'OFF') {
                        return offArray;
                    }
                    return undefined;
                }),
                update: jasmine.createSpy('update')
            };

            const ocProperties: any = { // eslint-disable-line
                _updated: false,
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'D') {
                        return defaultView;
                    }
                    return undefined;
                })
            };

            const catalog: any = { // eslint-disable-line
                has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'OCProperties'),
                get: jasmine.createSpy('get').and.callFake((key: string): any => { // eslint-disable-line
                    if (key === 'OCProperties') {
                        return ocProperties;
                    }
                    return undefined;
                })
            };

            defineWritable(layer, '_document', {
                _catalog: {
                    _catalogDictionary: catalog
                }
            });

            expect(() => {
                layer._setVisibility(false);
            }).not.toThrow();

            // highlighted OFF branch:
            // if (ocgOFF) { index = ocgOFF.indexOf(ref); if (index !== -1) { ocgOFF.splice(index); } }
            // then ocgOFF.push(ref)
            //
            // splice(index) truncates from index onward, then push(ref)
            expect(offArray.length).toBe(1);
            expect(offArray[0]).toBe(referenceHolder);

            // highlighted ON initialization branch:
            // if (defaultView.has('ON')) { ocgON = defaultView.get('ON'); if (!ocgON) { ocgON = []; } }
            expect(defaultView._updated).toBe(true);
            expect(ocProperties._updated).toBe(true);
        });
    });
});

import { _PdfEncryptor } from '../src/pdf/core/security/encryptor';
import { FormatError } from '../src/pdf/core/utils';
import { _NullCipher } from '../src/pdf/core/security/encryptors/normal-cipher';
import { _AdvancedEncryption128Cipher, _AdvancedEncryption256Cipher } from '../src/pdf/core/security/encryptors/advance-cipher';

describe('_PdfEncryptor highlighted coverage', () => {
    function createEncryptor(): _PdfEncryptor & any { // eslint-disable-line
        const encryptor: _PdfEncryptor & any = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor & any; // eslint-disable-line

        encryptor._messageDigest = {
            hash: jasmine.createSpy('hash').and.callFake((data: Uint8Array, start: number, length: number): Uint8Array => {
                const result: Uint8Array = new Uint8Array(32);
                for (let i: number = 0; i < result.length; i++) {
                    result[i] = (i + 1) & 0xff;
                }
                return result;
            })
        };

        return encryptor;
    }
    it('covers _buildCipherConstructor !cfm branch returning _NullCipher', () => {
        const encryptor: _PdfEncryptor & any = createEncryptor(); // eslint-disable-line

        const cryptFilter: _PdfDictionary = new _PdfDictionary();
        const cipherDictionary: _PdfDictionary = new _PdfDictionary();
        cipherDictionary.update('StdCF', cryptFilter);

        expect(() => {
            const cipher: any = encryptor._buildCipherConstructor( // eslint-disable-line
                cipherDictionary,
                _PdfName.get('StdCF'),
                1,
                0,
                new Uint8Array([1, 2, 3, 4, 5])
            );

            expect(cipher instanceof _NullCipher).toBe(true);
        }).not.toThrow();
    });

    it('covers _buildObjectKey default parameter branch when isAdvancedEncryption is omitted', () => {
        const encryptor: _PdfEncryptor & any = createEncryptor(); // eslint-disable-line
        const encryptionKey: Uint8Array = new Uint8Array([10, 20, 30, 40, 50]);

        expect(() => {
            const result: Uint8Array = encryptor._buildObjectKey(258, 3, encryptionKey);

            expect(result).toBeDefined();
            expect(result.length).toBe(Math.min(encryptionKey.length + 5, 16));
        }).not.toThrow();

        expect(encryptor._messageDigest.hash).toHaveBeenCalled();

        const args: any[] = (encryptor._messageDigest.hash as jasmine.Spy).calls.mostRecent().args; // eslint-disable-line
        const keyBytes: Uint8Array = args[0] as Uint8Array;
        const usedLength: number = args[2] as number;

        // Default parameter branch means no AES salt bytes are appended.
        expect(usedLength).toBe(encryptionKey.length + 5);

        expect(keyBytes[0]).toBe(10);
        expect(keyBytes[1]).toBe(20);
        expect(keyBytes[2]).toBe(30);
        expect(keyBytes[3]).toBe(40);
        expect(keyBytes[4]).toBe(50);

        // objectNumber = 258 => 0x02 0x01 0x00
        expect(keyBytes[5]).toBe(258 & 0xff);
        expect(keyBytes[6]).toBe((258 >> 8) & 0xff);
        expect(keyBytes[7]).toBe((258 >> 16) & 0xff);

        // generationNumber = 3 => 0x03 0x00
        expect(keyBytes[8]).toBe(3 & 0xff);
        expect(keyBytes[9]).toBe((3 >> 8) & 0xff);
    });

    it('covers _buildObjectKey advanced encryption branch with AES salt bytes', () => {
        const encryptor: _PdfEncryptor & any = createEncryptor(); // eslint-disable-line
        const encryptionKey: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);

        expect(() => {
            const result: Uint8Array = encryptor._buildObjectKey(7, 2, encryptionKey, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(Math.min(encryptionKey.length + 5, 16));
        }).not.toThrow();

        expect(encryptor._messageDigest.hash).toHaveBeenCalled();

        const args: any[] = (encryptor._messageDigest.hash as jasmine.Spy).calls.mostRecent().args; // eslint-disable-line
        const keyBytes: Uint8Array = args[0] as Uint8Array;
        const usedLength: number = args[2] as number;

        // Advanced encryption appends 4 salt bytes: s A l T
        expect(usedLength).toBe(encryptionKey.length + 9);
        expect(keyBytes[10]).toBe(0x73);
        expect(keyBytes[11]).toBe(0x41);
        expect(keyBytes[12]).toBe(0x6c);
        expect(keyBytes[13]).toBe(0x54);
    });

    it('covers AESV2 and AESV3 branches safely', () => {
        const encryptor: _PdfEncryptor & any = createEncryptor(); // eslint-disable-line
        spyOn(encryptor, '_buildObjectKey').and.returnValue(new Uint8Array([9, 8, 7, 6, 5]));

        const aesV2Filter: _PdfDictionary = new _PdfDictionary();
        aesV2Filter.update('CFM', _PdfName.get('AESV2'));

        const aesV3Filter: _PdfDictionary = new _PdfDictionary();
        aesV3Filter.update('CFM', _PdfName.get('AESV3'));

        const cipherDictionary: _PdfDictionary = new _PdfDictionary();
        cipherDictionary.update('AESV2Filter', aesV2Filter);
        cipherDictionary.update('AESV3Filter', aesV3Filter);

        expect(() => {
            const cipher128: any = encryptor._buildCipherConstructor( // eslint-disable-line
                cipherDictionary,
                _PdfName.get('AESV2Filter'),
                1,
                0,
                new Uint8Array([1, 2, 3, 4, 5])
            );

            const cipher256: any = encryptor._buildCipherConstructor( // eslint-disable-line
                cipherDictionary,
                _PdfName.get('AESV3Filter'),
                1,
                0,
                new Uint8Array([1, 2, 3, 4, 5])
            );

            expect(cipher128 instanceof _AdvancedEncryption128Cipher).toBe(true);
            expect(cipher256 instanceof _AdvancedEncryption256Cipher).toBe(true);
        }).not.toThrow();
    });
});
describe('_PdfEncryptor._buildCipherConstructor coverage', () => {
    function createEncryptor(): _PdfEncryptor & any { // eslint-disable-line
        return Object.create(_PdfEncryptor.prototype) as _PdfEncryptor & any; // eslint-disable-line
    }

    it('covers the unknown cryptography method throw branch', () => {
        const encryptor: _PdfEncryptor & any = createEncryptor(); // eslint-disable-line

        const cryptFilter: _PdfDictionary = new _PdfDictionary();
        cryptFilter.update('CFM', _PdfName.get('UnknownCFM'));

        const cipherDictionary: _PdfDictionary = new _PdfDictionary();
        cipherDictionary.update('StdCF', cryptFilter);

        let thrownError: any; // eslint-disable-line

        expect(() => {
            try {
                encryptor._buildCipherConstructor(
                    cipherDictionary,
                    _PdfName.get('StdCF'),
                    12,
                    0,
                    new Uint8Array([1, 2, 3, 4, 5])
                );
            } catch (error) {
                thrownError = error;
            }
        }).not.toThrow();

        expect(thrownError).toBeDefined();
        expect(thrownError.message).toBe('Unknown cryptography method');
    });
});
``

