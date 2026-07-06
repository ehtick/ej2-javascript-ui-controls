
define([
    "require",
    "exports",
    "../src/pdf/core/graphics/rightToLeft/text-renderer",
    "../src/pdf/core/graphics/rightToLeft/text-shape",
    "../src/pdf/core/graphics/rightToLeft/bidirectional",
    "../src/pdf/core/enumerator"
], function (
    require: any,
    exports: any,
    text_renderer_1: any,
    text_shape_1: any,
    bidirectional_1: any,
    enumerator_1: any
) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });

    describe('RtlRenderer behavior tests (no prototype usage)', function () {
        let renderer: any;

        beforeEach(function () {
            renderer = new text_renderer_1._RtlRenderer();
        });

        it('_layout returns original line for non-unicode font', function () {
            const font = { _isUnicode: false };
            const line = 'abc';

            const result = renderer._layout(line, font, false, false, null);

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result[0]).toBe(line);
        });

        it('_layout uses customLayout for unicode font and returns encoded chunks', function () {
            spyOn(text_shape_1, '_ArabicShapeRenderer')
                .and.callFake(function () {
                    this._shape = function (s: any) { return s; };
                });

            spyOn(bidirectional_1, '_Bidirectional')
                .and.callFake(function () {
                    this._getLogicalToVisualString = function (s: any) {
                        return s.split('').reverse().join('');
                    };
                });

            const font = {
                _isUnicode: true,
                _fontInternal: {
                    _ttfReader: {
                        _convertString: function (s: any) { return s; }
                    }
                },
                _setSymbols: function () { }
            };

            const format = { textDirection: enumerator_1.PdfTextDirection.rightToLeft };
            const line = 'ab';

            const result = renderer._layout(line, font, true, true, format);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(line.length);
        });

        it('_splitLayout returns empty array when inputs are null/undefined', function () {
            const res = renderer._splitLayout(null, null, false, false, null);

            expect(res).toBeDefined();
            expect(Array.isArray(res)).toBe(true);
            expect(res.length).toBe(0);
        });

        it('_splitLayout calls custom split and returns characters for valid input', function () {
            spyOn(bidirectional_1, '_Bidirectional')
                .and.callFake(function () {
                    this._getLogicalToVisualString = function () { return "xy"; };
                });

            const font = { _isUnicode: true };
            const format = { textDirection: enumerator_1.PdfTextDirection.rightToLeft };

            const words = renderer._splitLayout('ab', font, true, true, format);

            expect(words).toBeDefined();
            expect(words.length).toBe(2);
        });

        it('_getGlyphIndex returns false result for empty line', function () {
            const font = {
                _isUnicode: true,
                _fontInternal: {
                    _ttfReader: {
                        _getGlyph: function (): any { return null; }
                    }
                }
            };

            const unicodeLine = renderer._getGlyphIndex('', font, []);

            expect(unicodeLine).toBeDefined();
            expect(unicodeLine._result).toBe(false);
            expect(Array.isArray(unicodeLine._glyphIndex)).toBe(true);
        });

        it('_getGlyphIndex returns glyph indices for shaped text and skips missing glyphs', function () {
            spyOn(text_shape_1, '_ArabicShapeRenderer')
                .and.callFake(function () {
                    this._shape = function () { return 'ab'; };
                });

            const ttfReader = {
                _getGlyph: function (ch: any) {
                    if (ch === 'a') {
                        return { _index: 5 };
                    }
                    return null;
                }
            };

            const font = {
                _isUnicode: true,
                _fontInternal: { _ttfReader: ttfReader }
            };

            const unicodeLine = renderer._getGlyphIndex('ab', font, []);

            expect(unicodeLine).toBeDefined();
            expect(unicodeLine._result).toBe(true);
            expect(Array.isArray(unicodeLine._glyphIndex)).toBe(true);
            expect(unicodeLine._glyphIndex.indexOf(5)).toBeGreaterThanOrEqual(0);
        });

        it('_customLayout without wordSpace returns null when textDirection is none', function () {
            const line = 'abc';
            const format = { textDirection: enumerator_1.PdfTextDirection.none };

            const res = renderer._customLayout(line, false, format);

            expect(res).toBeNull();
        });

        it('_customLayout with wordSpace=false returns single encoded chunk', function () {
            spyOn(text_shape_1, '_ArabicShapeRenderer')
                .and.callFake(function () {
                    this._shape = function (s: any) { return s; };
                });

            spyOn(bidirectional_1, '_Bidirectional')
                .and.callFake(function () {
                    this._getLogicalToVisualString = function (s: any) { return s; };
                });

            const font = {
                _isUnicode: true,
                _fontInternal: {
                    _ttfReader: {
                        _convertString: function (s: any) { return s; }
                    }
                },
                _setSymbols: function () { }
            };

            const format = { textDirection: enumerator_1.PdfTextDirection.rightToLeft };

            const result = renderer._customLayout('hi', true, format, font, false);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(typeof result[0]).toBe('string');
        });

        it('_addCharacter encodes and returns a string', function () {
            const ttfReader = {
                _convertString: function (s: any) { return s + '_conv'; }
            };
            const font = {
                _fontInternal: { _ttfReader: ttfReader },
                _setSymbols: function () { }
            };

            const out = renderer._addCharacter(font, 'x');

            expect(out).toBeDefined();
            expect(typeof out).toBe('string');
        });


        it('_customSplitLayout returns split characters for a line', function () {
            // Arrange: mock bidi safely
            spyOn(bidirectional_1, '_Bidirectional')
                .and.callFake(function () {
                    this._getLogicalToVisualString = function () {
                        return 'pq';
                    };
                });

            const font = { _isUnicode: true };
            const format = {
                textDirection: enumerator_1.PdfTextDirection.rightToLeft
            };

            // Act
            const chars = renderer._customSplitLayout('st', font, false, true, format);

            // Assert
            expect(chars).toBeDefined();
            expect(Array.isArray(chars)).toBe(true);
            expect(chars.length).toBe(2);
        });
        

    });
});
