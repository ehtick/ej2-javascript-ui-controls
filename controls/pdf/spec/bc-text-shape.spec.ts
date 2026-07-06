import { _ArabicShapeRenderer, _ArabicShape } from '../src/pdf/core/graphics/rightToLeft/text-shape';

describe('Arabic Text Shaping - Ligature and Append Methods Coverage', () => {

    it('_ligature returns 0 when shape._shapeValue is empty', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '';
        const value: string = '\u064B';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(0);
        expect(shape._shapeValue).toBe('');
    });

    it('_ligature handles shadda mark with empty shapeType', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        shape._shapeLigature = 0;
        const value: string = '\u0651';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeType).toBe('\u0651');
        expect(shape._shapeLigature).toBe(1);
    });

    it('_ligature returns 0 when shadda applied but shapeType already set', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '\u0651';
        const value: string = '\u0651';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(0);
    });

    it('_ligature handles hamzaBelow with alef shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0627';
        shape._shapeType = '';
        const value: string = '\u0655';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0625');
    });

    it('_ligature handles hamzaBelow with lwa shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\uFEFB';
        const value: string = '\u0655';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\uFEF9');
    });

    it('_ligature handles hamzaBelow with other shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        const value: string = '\u0655';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeType).toBe('\u0655');
    });

    it('_ligature handles hamzaAbove with alef shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0627';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0623');
    });

    it('_ligature handles hamzaAbove with lwa shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\uFEFB';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\uFEF7');
    });

    it('_ligature handles hamzaAbove with waw shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0648';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0624');
    });

    it('_ligature handles hamzaAbove with yeh shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u064A';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0626');
    });

    it('_ligature handles hamzaAbove with alefsura shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0649';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0626');
    });

    it('_ligature handles hamzaAbove with farsiYeh shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u06CC';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0626');
    });

    it('_ligature handles hamzaAbove with other shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        const value: string = '\u0654';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeType).toBe('\u0654');
    });

    it('_ligature handles madda with alef shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0627';
        const value: string = '\u0653';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeValue).toBe('\u0622');
    });

    it('_ligature handles madda with non-alef shapeValue', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeVowel = '';
        const value: string = '\u0653';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeVowel).toBe('');
    });

    it('_ligature handles other mark (tanween) setting shapeVowel', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeVowel = '';
        const value: string = '\u064B';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeVowel).toBe('\u064B');
    });

    it('_ligature handles superalef mark', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeVowel = '';
        const value: string = '\u0670';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(1);
        expect(shape._shapeVowel).toBe('\u0670');
    });

    it('_ligature returns result 2 when shapeVowel not empty and value is not shadda', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeVowel = '\u064B';
        const value: string = '\u064C';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(2);
        expect(shape._shapeVowel).toBeTruthy();
    });

    it('_ligature returns 0 when shapeVowel already set before processing lam ligature', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '\u064B';
        const value: string = '\u0627';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(0);
    });

    it('_ligature handles lam+alef ligature formation', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '';
        shape._shapes = 1;
        const value: string = '\u0627';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(3);
        expect(shape._shapeValue).toBe('\uFEFB');
        expect(shape._shapes).toBe(2);
    });

    it('_ligature handles lam+alefHamza ligature formation', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '';
        shape._shapes = 1;
        const value: string = '\u0623';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(3);
        expect(shape._shapeValue).toBe('\uFEF7');
        expect(shape._shapes).toBe(2);
    });

    it('_ligature handles lam+alefHamzaBelow ligature formation', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '';
        shape._shapes = 1;
        const value: string = '\u0625';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(3);
        expect(shape._shapeValue).toBe('\uFEF9');
        expect(shape._shapes).toBe(2);
    });

    it('_ligature handles lam+alefMadda ligature formation - line 430-433', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '';
        shape._shapes = 1;
        const value: string = '\u0622';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(3);
        expect(shape._shapeValue).toBe('\uFEF5');
        expect(shape._shapes).toBe(2);
    });

    it('_ligature returns 0 when lam followed by non-alef character', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0644';
        shape._shapeVowel = '';
        shape._shapes = 1;
        const value: string = '\u0628';

        // Act
        const result: number = renderer._ligature(value, shape);

        // Assert
        expect(result).toBe(0);
    });

    it('_append appends shapeValue to builder when not empty', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        shape._shapeVowel = '';
        shape._shapeLigature = 1;
        const builder: string = 'test';
        const level: number = 0;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test\u0628');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append returns builder unchanged when shapeValue is empty', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '';
        shape._shapeType = '\u0651';
        shape._shapeVowel = '\u064B';
        const builder: string = 'test';
        const level: number = 0;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test');
    });

    it('_append appends shapeType when level vowel bit is 0 (unset) - line 325-331', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '\u0651';
        shape._shapeVowel = '';
        shape._shapeLigature = 2;
        const builder: string = 'test';
        const level: number = 0;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test\u0628\u0651');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append skips shapeType when level vowel bit is set (else branch) - line 334', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '\u0651';
        shape._shapeVowel = '';
        shape._shapeLigature = 2;
        const builder: string = 'test';
        const level: number = 0x1;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test\u0628');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append appends shapeVowel when level vowel bit is 0 (unset)', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        shape._shapeVowel = '\u064B';
        shape._shapeLigature = 2;
        const builder: string = 'test';
        const level: number = 0;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test\u0628\u064B');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append skips shapeVowel when level vowel bit is set (else branch)', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '';
        shape._shapeVowel = '\u064B';
        shape._shapeLigature = 2;
        const builder: string = 'test';
        const level: number = 0x1;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('test\u0628');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append appends all components (shapeValue, shapeType, shapeVowel) when level is 0', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '\u0651';
        shape._shapeVowel = '\u064B';
        shape._shapeLigature = 3;
        const builder: string = '';
        const level: number = 0;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('\u0628\u0651\u064B');
        expect(shape._shapeLigature).toBe(0);
    });

    it('_append appends only shapeValue when level vowel bit is set and shapeType/Vowel exist', () => {
        // Arrange
        const renderer: _ArabicShapeRenderer = new _ArabicShapeRenderer();
        const shape: _ArabicShape = new _ArabicShape();
        shape._shapeValue = '\u0628';
        shape._shapeType = '\u0651';
        shape._shapeVowel = '\u064B';
        shape._shapeLigature = 3;
        const builder: string = '';
        const level: number = 0x1;

        // Act
        const result: string = renderer._append(builder, shape, level);

        // Assert
        expect(result).toBe('\u0628');
        expect(shape._shapeLigature).toBe(0);
    });

});
describe('_ArabicShapeRenderer - targeted branches', () => {
  it('returns 0 when shape._shapeValue is empty (covers else at line ~459)', () => {
    const renderer = new _ArabicShapeRenderer();
    const shape = new _ArabicShape(); // default _shapeValue === ''
    expect(renderer._ligature('x', shape)).toBe(0);
  });

  it('forms lam + alefMadda ligature (covers branch at lines ~430-433)', () => {
    const renderer = new _ArabicShapeRenderer();
    const shape = new _ArabicShape();
    shape._shapeValue = renderer._lam;
    shape._shapes = 1;
    const res = renderer._ligature(renderer._alefMadda, shape);
    expect(res).toBe(3);
    expect(shape._shapeValue).toBe(renderer._lwawm);
    expect(shape._shapes).toBe(2);
  });

  it('_append emits type and vowel only when vowel flag is unset and skips them when vowel bit set (covers else branches ~325-334 and ~334-409)', () => {
    const renderer = new _ArabicShapeRenderer();

    const s1 = new _ArabicShape();
    s1._shapeValue = 'X';
    s1._shapeType = renderer._shadda;
    s1._shapeVowel = renderer._fathatan;
    s1._shapeLigature = 3;
    const out1 = renderer._append('', s1, 0); // vowel bit unset -> append both marks
    expect(out1).toBe('X' + renderer._shadda + renderer._fathatan);

    const s2 = new _ArabicShape();
    s2._shapeValue = 'Y';
    s2._shapeType = renderer._shadda;
    s2._shapeVowel = renderer._fathatan;
    s2._shapeLigature = 3;
    const out2 = renderer._append('', s2, renderer._vowel); // vowel bit set -> do not append marks
    expect(out2).toBe('Y');
  });
});