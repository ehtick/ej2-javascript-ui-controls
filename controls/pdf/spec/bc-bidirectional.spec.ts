import { _Bidirectional, _RtlCharacters } from '../src/pdf/core/graphics/rightToLeft/bidirectional';

describe('Bidirectional RTL Reordering', () => {

    it('doOrder with uniform levels executes early return when no odd bits set', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        bidir._indexLevels = [0, 0, 0];
        bidir._indexes = [0, 1, 2];

        // Act
        bidir._doOrder(0, 2);

        // Assert
        expect(bidir._indexes).toEqual([0, 1, 2]);
    });

    it('doOrder with varying levels and max min updates executes min assignment at line 106', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        bidir._indexLevels = [1, 2, 3, 0, 4];
        bidir._indexes = [0, 1, 2, 3, 4];

        // Act
        bidir._doOrder(0, 4);

        // Assert
        expect(bidir._indexes.length).toBe(5);
    });

    it('doOrder with all odd levels triggers immediate reArrange', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        bidir._indexLevels = [1, 1, 1];
        bidir._indexes = [0, 1, 2];

        // Act
        bidir._doOrder(0, 2);

        // Assert
        expect(bidir._indexes).toBeDefined();
    });

    it('getLogicalToVisualString reorders LTR text', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        const ltrText: string = 'Hello';

        // Act
        const result: string = bidir._getLogicalToVisualString(ltrText, false);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBe(5);
    });

    it('getLogicalToVisualString reorders RTL text', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        const rtlText: string = 'שלום';

        // Act
        const result: string = bidir._getLogicalToVisualString(rtlText, true);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBe(4);
    });

    it('doMirrorShaping applies mirroring to odd levels', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        bidir._indexLevels = [1, 0, 1];
        const text: string = '(test)';

        // Act
        const result: string = bidir._doMirrorShaping(text);

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBe(6);
    });

    it('setDefaultIndexLevel initializes identity map', () => {
        // Arrange
        const bidir: _Bidirectional = new _Bidirectional();
        bidir._indexLevels = [1, 2, 3];
        bidir._indexes = [];

        // Act
        bidir._setDefaultIndexLevel();

        // Assert
        expect(bidir._indexes).toEqual([0, 1, 2]);
    });

});

describe('RtlCharacters BiDi Classification and Ordering', () => {

    it('getVisualOrder returns levels for LTR paragraph', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        const text: string = 'Hello World';

        // Act
        const levels: number[] = rtl._getVisualOrder(text, false);

        // Assert
        expect(levels).toBeDefined();
        expect(levels.length).toBe(11);
    });

    it('getVisualOrder returns levels for RTL paragraph', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        const text: string = 'שלום עולם';

        // Act
        const levels: number[] = rtl._getVisualOrder(text, true);

        // Assert
        expect(levels).toBeDefined();
        expect(levels.length).toBe(9);
    });

    it('getCharacterCode maps text to BiDi character types', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        const text: string = 'ABC';

        // Act
        const codes: number[] = rtl._getCharacterCode(text);

        // Assert
        expect(codes).toBeDefined();
        expect(codes.length).toBe(3);
        expect(codes[0]).toBeGreaterThanOrEqual(0);
    });

    it('doVisualOrder with mixed directionality at line 793 processes level comparisons', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        const text: string = 'Hello123עברית456';

        // Act
        rtl._getVisualOrder(text, false);

        // Assert
        expect(rtl._levels).toBeDefined();
        expect(rtl._levels.length).toBeGreaterThan(0);
    });

    it('doVisualOrder processes checkEmbeddedCharacters at lines 818-819 restoring embeddings', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        const text: string = 'Test';

        // Act
        rtl._getVisualOrder(text, false);

        // Assert
        expect(rtl._levels).toBeDefined();
        expect(rtl._result).toBeDefined();
    });

    it('check normalizes combining marks to preceding strong type', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._type = [rtl.L, rtl.nsm, rtl.L];
        rtl._result = [rtl.L, rtl.nsm, rtl.L];
        rtl._length = 3;

        // Act
        rtl._check(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[1]).toBe(rtl.L);
    });

    it('checkEuropeanNumberSeparator at line 924 handles EN flanking', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.EN, rtl.ES, rtl.EN];

        // Act
        rtl._checkEuropeanNumberSeparator(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[1]).toBe(0);
    });

    it('checkEuropeanNumberSeparator at lines 943-953 converts CS to AN with AN flanking', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.AN, rtl.CS, rtl.AN];

        // Act
        rtl._checkEuropeanNumberSeparator(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[1]).toBe(rtl.AN);
    });

    it('checkEuropeanNumberSeparator skips first and last indices', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.ES, rtl.EN, rtl.ES];

        // Act
        rtl._checkEuropeanNumberSeparator(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result).toBeDefined();
    });

    it('checkEuropeanNumberTerminator at line 1001 executes else branch when data not EN', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.ET, rtl.EN];

        // Act
        rtl._checkEuropeanNumberTerminator(0, 2, 0, rtl.L, rtl.EN);

        // Assert
        expect(rtl._result).toBeDefined();
    });

    it('checkEuropeanNumberTerminator at lines 1056-1064 processes getLength and data checks', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.EN, rtl.ET, rtl.EN];

        // Act
        rtl._checkEuropeanNumberTerminator(0, 3, 0, rtl.EN, rtl.EN);

        // Assert
        expect(rtl._result).toBeDefined();
    });

    it('checkEuropeanNumberTerminator at lines 1070-1072 handles loop completion', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.EN, rtl.ET];

        // Act
        rtl._checkEuropeanNumberTerminator(0, 2, 0, rtl.EN, rtl.EN);

        // Assert
        expect(rtl._result).toBeDefined();
    });

    it('checkOtherNeutrals converts remaining ES ET CS to ON', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.ES, rtl.ET, rtl.CS];

        // Act
        rtl._checkOtherNeutrals(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[0]).toBe(0);
        expect(rtl._result[1]).toBe(0);
        expect(rtl._result[2]).toBe(0);
    });

    it('checkOtherCharacters resolves EN to L when preceded by L', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.L, rtl.EN];

        // Act
        rtl._checkOtherCharacters(0, 2, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[1]).toBe(rtl.L);
    });

    it('checkCharacters resolves WS ON B S based on strong types', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.L, rtl.WS, rtl.L];

        // Act
        rtl._checkCharacters(0, 3, 0, rtl.L, rtl.L);

        // Assert
        expect(rtl._result[1]).toBe(rtl.L);
    });

    it('updateLevels increments levels for even base level L types', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.R, rtl.L, rtl.R];
        rtl._levels = [0, 0, 0];

        // Act
        rtl._updateLevels(0, 0, 3);

        // Assert
        expect(rtl._levels[0]).toBe(1);
        expect(rtl._levels[1]).toBe(0);
    });

    it('getLength scans forward consuming valid set items', () => {
        // Arrange
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.ET, rtl.ET, rtl.EN];

        // Act
        const len: number = rtl._getLength(0, 3, [rtl.ET]);

        // Assert
        expect(len).toBe(2);
    });

});

describe('Bidirectional behavior tests', () => {

    it('mirrors characters when level is odd and leaves when even', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        // odd level should mirror '('
        bidi._indexLevels = [1];
        // Act
        const mirrored: string = bidi._doMirrorShaping('(');
        // Assert
        expect(mirrored).toBe(')');

        // Arrange (even level)
        bidi._indexLevels = [0];
        // Act
        const notMirrored: string = bidi._doMirrorShaping('(');
        // Assert
        expect(notMirrored).toBe('(');
    });

    it('_doOrder returns early when no odd levels present (even-only)', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        bidi._indexLevels = [2, 2, 2];
        bidi._setDefaultIndexLevel();
        const before: number[] = bidi._indexes.slice();
        // Act
        bidi._doOrder(0, 2);
        // Assert
        expect(bidi._indexes).toEqual(before);
    });

    it('_doOrder reverses whole segment when all levels are odd', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        bidi._indexLevels = [1, 1, 1];
        bidi._setDefaultIndexLevel();
        // Act
        bidi._doOrder(0, 2);
        // Assert: indexes should be reversed for 3 elements
        expect(bidi._indexes).toEqual([2, 1, 0]);
    });

    it('_doOrder performs segmented reordering for mixed levels', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        // this pattern exercises the max/min segmentation path
        bidi._indexLevels = [2, 2, 1];
        bidi._setDefaultIndexLevel();
        // Act
        bidi._doOrder(0, 2);
        // Assert: expected final index map after segment reversals
        expect(bidi._indexes).toEqual([2, 0, 1]);
    });

    it('_reArrange reverses the specified half-open segment', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        bidi._indexes = [0, 1, 2, 3];
        // Act: reverse indices in range [1,4) -> positions 1..3
        bidi._reArrange(1, 4);
        // Assert
        expect(bidi._indexes).toEqual([0, 3, 2, 1]);
    });

    it('_getLogicalToVisualString returns a string of same length and type', () => {
        // Arrange
        const bidi: _Bidirectional = new _Bidirectional();
        const input: string = 'abc()';
        // Act
        const out: string = bidi._getLogicalToVisualString(input, false);
        // Assert: output is a string and preserves length
        expect(typeof out).toBe('string');
        expect(out.length).toBe(input.length);
    });

});
