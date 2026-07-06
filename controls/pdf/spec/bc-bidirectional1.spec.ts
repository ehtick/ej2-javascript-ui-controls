
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _Bidirectional, _RtlCharacters } from "../src/pdf/core/graphics/rightToLeft/bidirectional";

describe('_RtlCharacters highlighted coverage', () => {

    it('covers _checkEmbeddedCharacters special-type branch and the subsequent level backfill branch', () => {
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._type = [rtl.L, rtl.lre, rtl.BN, rtl.R];
        rtl._result = [rtl.L, rtl.R, rtl.R, rtl.L];
        rtl._levels = [0, 9, 9, 1];

        // "length" here is the compacted logical length before re-expansion.
        rtl._checkEmbeddedCharacters(2);

        // Assert highlighted lines were exercised and produced expected state.
        expect(rtl._result[1]).toBe(rtl.lre);
        expect(rtl._result[2]).toBe(rtl.BN);

        // Both embedded chars should have been backfilled from the previous level.
        expect(rtl._levels[1]).toBe(rtl._levels[0]);
        expect(rtl._levels[2]).toBe(rtl._levels[1]);
    });

    it('covers _checkEuropeanDigits branch where a previous AL converts EN to AN', () => {
        const rtl: _RtlCharacters = new _RtlCharacters();
        rtl._result = [rtl.AL, rtl.EN];

        rtl._checkEuropeanDigits(0, 2, 0, rtl.L, rtl.L);

        expect(rtl._result[1]).toBe(rtl.AN);
    });

    it('covers _checkCharacters branch where lt === AN and gets converted to R', () => {
        const rtl: _RtlCharacters = new _RtlCharacters();

        // For i = 1, result[1] is a neutral WS.
        // Since s !== index, lt will be result[s - 1] => result[0] = AN,
        // which must hit:
        //   if (lt === this.AN) { lt = this.R; }
        //
        // result[2] is already R, so after conversion lt === tt and the neutral becomes R.
        rtl._result = [rtl.AN, rtl.WS, rtl.R];

        rtl._checkCharacters(0, 3, 0, rtl.L, rtl.L);

        expect(rtl._result[1]).toBe(rtl.R);
    });

    it('covers _checkCharacters branch where tt === AN and gets converted to R', () => {
        const rtl: _RtlCharacters = new _RtlCharacters();

        // For i = 1, result[1] is a neutral WS.
        // s !== index so lt = result[0] = R.
        // l !== length so tt = result[l] = result[2] = AN,
        // which must hit:
        //   if (tt === this.AN) { tt = this.R; }
        //
        // Then lt === tt and the neutral becomes R.
        rtl._result = [rtl.R, rtl.WS, rtl.AN];

        rtl._checkCharacters(0, 3, 0, rtl.L, rtl.L);

        expect(rtl._result[1]).toBe(rtl.R);
    });

    it('covers _Bidirectional mirror shaping with an odd level and a mirrored character', () => {
        const bidi: _Bidirectional = new _Bidirectional();

        // '(' has a mirrored counterpart ')' in the map initialized by _update().
        bidi._indexLevels = [1];

        const result: string = bidi._doMirrorShaping('(');

        expect(result).toBe(')');
    });

    it('covers _Bidirectional setDefaultIndexLevel identity initialization', () => {
        const bidi: _Bidirectional = new _Bidirectional();

        bidi._indexLevels = [3, 1, 2, 0];
        bidi._indexes = [];

        bidi._setDefaultIndexLevel();

        expect(bidi._indexes).toEqual([0, 1, 2, 3]);
    });

    it('covers _Bidirectional _reArrange by reversing a segment', () => {
        const bidi: _Bidirectional = new _Bidirectional();

        bidi._indexes = [0, 1, 2, 3];

        bidi._reArrange(1, 4);

        expect(bidi._indexes).toEqual([0, 3, 2, 1]);
    });
});
``
