import { _UnicodeTrueTypeFont } from '../src/pdf/core/fonts/unicode-true-type-font';
import { Dictionary } from '../src/pdf/core/pdf-primitives';
import { _FontDescriptorFlag } from '../src/pdf/core/enumerator';

describe('_UnicodeTrueTypeFont targeted branch tests', () => {

    it('_generateFontProgram initializes _usedChars when null and writes font program', () => {
        const font: any = Object.create(_UnicodeTrueTypeFont.prototype);
        font._usedChars = null;
        let written: any = null;
        font._fontProgram = {
            _clearStream: () => { written = null; },
            _writeBytes: (b: number[]) => { written = b; }
        };
        font._ttfReader = {
            _setOffset: () => { /* noop */ },
            _isOpenType: false,
            _readFontProgram: (_chars: any) => [10, 20, 30]
        };
        font._ttfMetrics = { _contains: false };

        (font as any)._generateFontProgram();

        expect(font._usedChars).toBeDefined();
        expect(written).toEqual([10, 20, 30]);
    });

    it('_generateCmap writes endbfrange when ranges split ( > 100 entries )', () => {
        const font: any = Object.create(_UnicodeTrueTypeFont.prototype);
        // ensure instance string fields exist (constructor not invoked on Object.create)
        font._cmapPrefix = '';
        font._cmapEndCodeSpaceRange = '';
        font._cmapBeginRange = 'beginbfrange\n';
        font._cmapEndRange = 'endbfrange\n';
        font._cmapSuffix = 'endbfrange\nendcmap\n';
        let captured = '';
        font._cmap = {
            _clearStream: () => { captured = ''; },
            _write: (s: string) => { captured = s; }
        };
        // Build glyphChars dictionary with 101 entries to force a range split and trigger endbfrange
        const glyphChars: Dictionary<number, number> = new Dictionary<number, number>();
        for (let i = 1; i <= 101; i++) {
            glyphChars.setValue(i, i + 1000);
        }
        font._ttfReader = {
            _getGlyphChars: (_used: any) => glyphChars
        };
        // ensure _usedChars appears non-empty so _generateCmap executes
        font._usedChars = new Dictionary<string, string>();
        font._usedChars.setValue('a', '');

        (font as any)._generateCmap();

        expect(captured).toBeTruthy();
        expect(captured.indexOf('endbfrange')).toBeGreaterThanOrEqual(0);
    });

    it('_getDescriptorFlags computes flags for symbolic/fixed/italic/bold cases', () => {
        const font: any = Object.create(_UnicodeTrueTypeFont.prototype);
        // Case: all true -> fixedPitch + symbolic + italic + forceBold
        font._ttfReader = { _metrics: { _isFixedPitch: true, _isSymbol: true, _isItalic: true, _isBold: true } };
        const flagsAll = (font as any)._getDescriptorFlags();
        const expectedAll = _FontDescriptorFlag.fixedPitch | _FontDescriptorFlag.symbolic | _FontDescriptorFlag.italic | _FontDescriptorFlag.forceBold;
        expect(flagsAll).toBe(expectedAll);

        // Case: non-symbolic path (isSymbol = false) -> nonSymbolic bit set
        font._ttfReader = { _metrics: { _isFixedPitch: false, _isSymbol: false, _isItalic: false, _isBold: false } };
        const flagsNonSym = (font as any)._getDescriptorFlags();
        expect(flagsNonSym & _FontDescriptorFlag.nonSymbolic).toBe(_FontDescriptorFlag.nonSymbolic);
    });

});
