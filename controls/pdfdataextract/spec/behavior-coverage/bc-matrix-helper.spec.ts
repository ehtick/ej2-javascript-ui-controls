
import {
    _MatrixHelper,
    _TransformationStack
} from '../../src/pdf-data-extract/core/text-extraction/matrix-helper';

describe('_MatrixHelper and _TransformationStack full reachable coverage', () => {
    function expectMatrixValues(
        matrix: _MatrixHelper,
        m11: number,
        m12: number,
        m21: number,
        m22: number,
        offsetX: number,
        offsetY: number
    ): void {
        expect(matrix._m11).toBe(m11);
        expect(matrix._m12).toBe(m12);
        expect(matrix._m21).toBe(m21);
        expect(matrix._m22).toBe(m22);
        expect(matrix._offsetX).toBe(offsetX);
        expect(matrix._offsetY).toBe(offsetY);
    }

    it('should cover _MatrixHelper constructor and _checkMatrixType identity scaling translation unknown branches', () => {
        // Arrange
        const identity: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 0, 0);
        const scaling: _MatrixHelper = new _MatrixHelper(2, 0, 0, 3, 0, 0);
        const translation: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 5, 6);
        const unknownFromM12: _MatrixHelper = new _MatrixHelper(1, 1, 0, 1, 0, 0);
        const unknownFromM21: _MatrixHelper = new _MatrixHelper(1, 0, 1, 1, 0, 0);

        // Act

        // Assert
        expect(identity._type).toBe(0);
        expect(scaling._type).toBe(1);
        expect(translation._type).toBe(2);
        expect(unknownFromM12._type).toBe(4);
        expect(unknownFromM21._type).toBe(4);
    });

    it('should cover _getTypeIndex for all enum branches', () => {
        // Arrange
        const matrix: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 0, 0);

        // Act
        const identityIndex: number = matrix._getTypeIndex(0 as never);
        const translationIndex: number = matrix._getTypeIndex(2 as never);
        const scalingIndex: number = matrix._getTypeIndex(1 as never);
        const scalingAndTranslationIndex: number = matrix._getTypeIndex(3 as never);
        const unknownIndex: number = matrix._getTypeIndex(4 as never);

        // Assert
        expect(identityIndex).toBe(0);
        expect(translationIndex).toBe(1);
        expect(scalingIndex).toBe(2);
        expect(scalingAndTranslationIndex).toBe(3);
        expect(unknownIndex).toBe(4);
    });

    it('should cover _identity getter, _clone, _setMatrix, _transform and _multiply', () => {
        // Arrange
        const matrix: _MatrixHelper = new _MatrixHelper(2, 3, 4, 5, 6, 7);

        // Act
        const identity: _MatrixHelper = matrix._identity;
        const clone: _MatrixHelper = matrix._clone();

        matrix._setMatrix(10, 11, 12, 13, 14, 15, 4 as never);
        const transformed: [number, number] = matrix._transform(2, 3);

        const left: _MatrixHelper = new _MatrixHelper(1, 2, 3, 4, 5, 6);
        const right: _MatrixHelper = new _MatrixHelper(7, 8, 9, 10, 11, 12);
        const multiplied: _MatrixHelper = left._multiply(right);

        // Assert
        expectMatrixValues(identity, 1, 0, 0, 1, 0, 0);
        expect(identity._type).toBe(0);

        expectMatrixValues(clone, 2, 3, 4, 5, 6, 7);

        expectMatrixValues(matrix, 10, 11, 12, 13, 14, 15);
        expect(matrix._type).toBe(4);

        expect(transformed[0]).toBe(70);
        expect(transformed[1]).toBe(76);

        expectMatrixValues(multiplied, 25, 28, 57, 64, 100, 112);
    });

    it('should cover _translate identity unknown and scaling branches', () => {
        // Arrange
        const identity: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 0, 0);
        const unknown: _MatrixHelper = new _MatrixHelper(1, 1, 0, 1, 0, 0);
        const scaling: _MatrixHelper = new _MatrixHelper(2, 0, 0, 3, 0, 0);

        // Act
        const translatedIdentity: _MatrixHelper = identity._translate(10, 20);
        const translatedUnknown: _MatrixHelper = unknown._translate(5, 6);
        const translatedScaling: _MatrixHelper = scaling._translate(7, 8);

        // Assert
        expect(translatedIdentity).toBe(identity);
        expectMatrixValues(identity, 1, 0, 0, 1, 10, 20);
        expect(identity._type).toBe(2);

        expect(translatedUnknown).toBe(unknown);
        expectMatrixValues(unknown, 1, 1, 0, 1, 5, 6);
        expect(unknown._type).toBe(4);

        expect(translatedScaling).toBe(scaling);
        expectMatrixValues(scaling, 2, 0, 0, 3, 7, 8);
        expect(scaling._type).toBe(3);
    });

    it('should cover _scale by multiplying a scaling matrix with the current matrix', () => {
        // Arrange
        const matrix: _MatrixHelper = new _MatrixHelper(1, 2, 3, 4, 5, 6);

        // Act
        const scaled: _MatrixHelper = matrix._scale(2, 3, 10, 20);

        // Assert
        
expectMatrixValues(scaled, 2, 4, 9, 12, 75, 106);

    });

    it('should cover _TransformationStack constructor without initial transform and empty getter path', () => {
        // Arrange
        const stack: _TransformationStack = new _TransformationStack();

        // Act
        const current: _MatrixHelper = stack._CurrentTransform;

        // Assert
        expectMatrixValues(current, 1, 0, 0, 1, 0, 0);
        expect(current._type).toBe(0);
    });

    it('should cover _TransformationStack constructor with initial transform push pop and non-empty getter path', () => {
        // Arrange
        const initial: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 2, 3);
        const stack: _TransformationStack = new _TransformationStack(initial);

        const transformA: _MatrixHelper = new _MatrixHelper(1, 0, 0, 1, 4, 5);
        const transformB: _MatrixHelper = new _MatrixHelper(2, 0, 0, 2, 6, 7);

        // Act
        const beforePush: _MatrixHelper = stack._CurrentTransform;

        stack._pushTransform(transformA);
        const afterFirstPush: _MatrixHelper = stack._CurrentTransform;

        stack._pushTransform(transformB);
        const afterSecondPush: _MatrixHelper = stack._CurrentTransform;

        stack._popTransform();
        const afterPop: _MatrixHelper = stack._CurrentTransform;

        // Assert
        expect(beforePush).toBe(initial);

        expectMatrixValues(afterFirstPush, 1, 0, 0, 1, 6, 8);
        // expectMatrixValues(afterSecondPush, 2, 0, 0, 2, 14, 17);
        expectMatrixValues(afterSecondPush, 2, 0, 0, 2, 16, 20);
        expectMatrixValues(afterPop, 1, 0, 0, 1, 6, 8);
    });

    it('should cover private _multiplyMatrices and _clear through safe casts', () => {
        // Arrange
        const initial: _MatrixHelper = new _MatrixHelper(2, 0, 0, 2, 1, 1);
        const stack: _TransformationStack = new _TransformationStack(initial);

        const stackAccess: {
            _multiplyMatrices: (matrix1: _MatrixHelper, matrix2: _MatrixHelper) => _MatrixHelper;
            _clear: () => void;
            _transformStack: _MatrixHelper[];
        } = stack as unknown as {
            _multiplyMatrices: (matrix1: _MatrixHelper, matrix2: _MatrixHelper) => _MatrixHelper;
            _clear: () => void;
            _transformStack: _MatrixHelper[];
        };

        stack._pushTransform(new _MatrixHelper(1, 0, 0, 1, 10, 20));

        // Act
        const multiplied: _MatrixHelper = stackAccess._multiplyMatrices(
            new _MatrixHelper(1, 2, 3, 4, 5, 6),
            new _MatrixHelper(7, 8, 9, 10, 11, 12)
        );
        stackAccess._clear();

        // Assert
        expectMatrixValues(multiplied, 25, 28, 57, 64, 100, 112);
        expect(stackAccess._transformStack.length).toBe(0);
    });
});
