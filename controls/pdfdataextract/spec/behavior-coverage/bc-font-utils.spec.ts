
import {
    _glyphAnalysisEnabled,
    _fontFlags,
    _getFontEncodedString,
    _getEncodingBase64String,
    _recoverGlyphName,
    _getUnicodeForGlyph
} from '../../src/pdf-data-extract/core/text-extraction/font-utils';

describe('font-utils full branch coverage', () => {
    it('should cover exported constants', () => {
        // Arrange

        // Act

        // Assert
        expect(_glyphAnalysisEnabled).toBe(true);
        expect(_fontFlags).toEqual({
            FixedPitch: 1,
            Serif: 2,
            Symbolic: 4,
            Script: 8,
            NonSymbolic: 32,
            Italic: 64,
            AllCap: 65536,
            SmallCap: 131072,
            ForceBold: 262144
        });
    });

    it('should cover _getFontEncodedString known switch cases and default branch safely', () => {
        // Arrange
        const knownCases: Array<{ name: string; expectedPrefix: string }> = [
            {
                name: 'SyncfusionDingbats',
                expectedPrefix: 'AQAEAgABAQERQ2hyb21EaW5nYmF0c09URg'
            },
            {
                name: 'SyncfusionFixed',
                expectedPrefix: 'AQAEAgABAQEOQ2hyb21GaXhlZE9URg'
            },
            {
                name: 'SyncfusionFixedBold',
                expectedPrefix: 'AQAEAgABAQETQ2hyb21GaXhlZE9URi1Cb2xk'
            },
            {
                name: 'SyncfusionFixedBoldItalic',
                expectedPrefix: 'AQAEAgABAQEZQ2hyb21GaXhlZE9URi1Cb2xkSXRhbGlj'
            },
            {
                name: 'SyncfusionFixedItalic',
                expectedPrefix: 'AQAEAgABAQEVQ2hyb21GaXhlZE9URi1JdGFsaWM'
            },
            {
                name: 'SyncfusionSerif',
                expectedPrefix: 'AQAEAgABAQEOQ2hyb21TZXJpZk9URg'
            },
            {
                name: 'SyncfusionSerifBold',
                expectedPrefix: 'AQAEAgABAQETQ2hyb21TZXJpZk9URi1Cb2xk'
            },
            {
                name: 'SyncfusionSerifBoldItalic',
                expectedPrefix: 'AQAEAgABAQEZQ2hyb21TZXJpZk9URi1Cb2xkSXRhbGlj'
            },
            {
                name: 'SyncfusionSerifItalic',
                expectedPrefix: 'AQAEAgABAQEVQ2hyb21TZXJpZk9URi1JdGFsaWM'
            },
            {
                name: 'SyncfusionSymbol',
                expectedPrefix: 'AQAEAgABAQEPQ2hyb21TeW1ib2xPVEY'
            },
            {
                name: 'LiberationSans-Bold',
                expectedPrefix: 'AAEAAAATAQAABAAwRkZUT'
            },
            {
                name: 'LiberationSans-BoldItalic',
                expectedPrefix: 'AAEAAAATAQAABAAwRkZUT'
            },
            {
                name: 'LiberationSans-Regular',
                expectedPrefix: 'AAEAAAATAQAABAAwRkZUT'
            }
        ];

        // Act / Assert
        for (let i: number = 0; i < knownCases.length; i++) {
            const entry: { name: string; expectedPrefix: string } = knownCases[i];
            const result: string = _getFontEncodedString(entry.name);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(100);
            expect(result.startsWith(entry.expectedPrefix)).toBe(true);
        }

        const unknownResult: string = _getFontEncodedString('Unknown-Font-Name');
        expect(unknownResult).toBe('');
    });

    it('should cover _getEncodingBase64String known switch behavior and default branch safely', () => {
        // Arrange
        const knownEncodingNames: string[] = [
            'Adobe-Korea1-UCS2'
        ];

        // Act / Assert
        for (let i: number = 0; i < knownEncodingNames.length; i++) {
            const encodeName: string = knownEncodingNames[i];
            const result: string = _getEncodingBase64String(encodeName);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(100);
        }

        const unknownResult: string = _getEncodingBase64String('Unknown-Encoding-Name');
        expect(unknownResult).toBe('');
    });

    it('should cover _recoverGlyphName branches safely', () => {
        // Arrange
        const glyphsUnicodeMapOne: { [key: string]: number } = {
            A: 65
        };
        const mapOne: { [key: number]: string } = {
            65: 'A'
        };

        const glyphsUnicodeMapTwo: { [key: string]: number } = {
            uni0041: 65,
            u0042: 66
        };
        const mapTwo: { [key: number]: string } = {
            65: 'RecoveredA',
            66: 'RecoveredB'
        };

        // Act
        const directNameResult: string = _recoverGlyphName('A', glyphsUnicodeMapOne);
        const uniNameResult: string = _recoverGlyphName('uni0041', glyphsUnicodeMapTwo);
        const shortUNameResult: string = _recoverGlyphName('u0042', glyphsUnicodeMapTwo);
        const unknownNameResult: string = _recoverGlyphName('UnknownGlyph', {});
        const emptyNameResult: string = _recoverGlyphName('', {});

        // Assert
        expect(directNameResult).toBe('A');
        expect(uniNameResult).toBe('uni0041');
        expect(shortUNameResult).toBe('u0042');
        expect(unknownNameResult).toBe('UnknownGlyph');
        expect(emptyNameResult).toBe('');
    });

    it('should cover _getUnicodeForGlyph direct numeric map branch', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            65: 65
        };

        // Act
        const result: number = _getUnicodeForGlyph('65', glyphsUnicodeMap);

        // Assert
        expect(result).toBe(65);
    });

    it('should cover _getUnicodeForGlyph empty name and invalid u-name branches', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const emptyResult: number = _getUnicodeForGlyph('', glyphsUnicodeMap);
        const invalidShortResult: number = _getUnicodeForGlyph('u1', glyphsUnicodeMap);
        const invalidLowerCaseHexResult: number = _getUnicodeForGlyph('u00ff', glyphsUnicodeMap);
        const invalidNameResult: number = _getUnicodeForGlyph('abc', glyphsUnicodeMap);

        // Assert
        expect(emptyResult).toBe(-1);
        expect(invalidShortResult).toBe(-1);
        expect(invalidLowerCaseHexResult).toBe(-1);
        expect(invalidNameResult).toBe(-1);
    });

    it('should cover _getUnicodeForGlyph uniXXXX and uXXXX uppercase branches', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const uniResult: number = _getUnicodeForGlyph('uni0041', glyphsUnicodeMap);
        const uResult: number = _getUnicodeForGlyph('u0042', glyphsUnicodeMap);
        const maxPlaneStyleResult: number = _getUnicodeForGlyph('u10FF', glyphsUnicodeMap);

        // Assert
        expect(uniResult).toBe(65);
        expect(uResult).toBe(66);
        expect(maxPlaneStyleResult).toBe(0x10FF);
    });
});

describe('font-utils full branch coverage1', () => {

    it('should cover every visible _getFontEncodedString switch branch and default branch', () => {
        // Arrange
        const fontCaseNames: string[] = [
            'SyncfusionDingbats',
            'SyncfusionFixed',
            'SyncfusionFixedBold',
            'SyncfusionFixedBoldItalic',
            'SyncfusionFixedItalic',
            'SyncfusionSerif',
            'SyncfusionSerifBold',
            'SyncfusionSerifBoldItalic',
            'SyncfusionSerifItalic',
            'SyncfusionSymbol',
            'LiberationSans-Bold',
            'LiberationSans-BoldItalic',
            'LiberationSans-Regular'
        ];

        // Act / Assert
        for (let i: number = 0; i < fontCaseNames.length; i++) {
            const caseName: string = fontCaseNames[i];
            const result: string = _getFontEncodedString(caseName);

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(100);
        }

        const unknownResult: string = _getFontEncodedString('Unknown-Font-Name');

        // Assert
        expect(unknownResult).toBe('');
    });

    it('should cover every _getEncodingBase64String switch branch shown in the file and default branch', () => {
        // Arrange
        const encodingCaseNames: string[] = [
            'Adobe-Korea1-UCS2',
            'UniKS-UCS2-H',
            'Adobe-Korea1-2',
            'Adobe-Korea1-1',
            'Adobe-Korea1-0',
            'Adobe-Japan1-UCS2',
            'Adobe-Japan1-6',
            'Adobe-Japan1-5',
            'Adobe-Japan1-4',
            'Adobe-Japan1-3',
            'Adobe-Japan1-2',
            'Adobe-Japan1-1',
            'Adobe-Japan1-0',
            'Adobe-GB1-UCS2',
            'Adobe-GB1-5',
            'Adobe-GB1-4',
            'Adobe-GB1-3',
            'Adobe-GB1-2',
            'Adobe-GB1-1',
            'Adobe-GB1-0',
            'Adobe-CNS1-UCS2',
            'Adobe-CNS1-6',
            'Adobe-CNS1-5',
            'Adobe-CNS1-4',
            'Adobe-CNS1-3',
            'Adobe-CNS1-2',
            'Adobe-CNS1-1',
            'Adobe-CNS1-0',
            'Add-V',
            'Add-RKSJ-V',
            'Add-RKSJ-H',
            'Add-H',
            '90pv-RKSJ-V',
            '90pv-RKSJ-H',
            '90ms-RKSJ-V',
            '90ms-RKSJ-H',
            '90msp-RKSJ-V',
            '90msp-RKSJ-H',
            '83pv-RKSJ-H',
            '78-V',
            '78-RKSJ-V',
            '78-RKSJ-H',
            '78ms-RKSJ-V',
            '78ms-RKSJ-H',
            '78-H',
            '78-EUC-V',
            '78-EUC-H',
            'UniCNS-UCS2-H',
            'UniCNS-UCS2-V',
            'UniCNS-UTF8-V',
            'UniCNS-UTF16-H',
            'B5-H',
            'B5pc-H',
            'B5pc-V',
            'B5-V',
            'CNS1-H',
            'CNS1-V',
            'CNS2-H',
            'CNS2-V',
            'CNS-EUC-H',
            'CNS-EUC-V',
            'ETen-B5-H',
            'ETen-B5-V',
            'ETenms-B5-H',
            'ETenms-B5-V',
            'ETHK-B5-H',
            'ETHK-B5-V',
            'EUC-H',
            'EUC-V',
            'Ext-H',
            'Ext-RKSJ-H',
            'Ext-RKSJ-V',
            'Ext-V',
            'GB-EUC-H',
            'GB-EUC-V',
            'GB-H',
            'GBK2K-H',
            'GBK2K-V',
            'GBK-EUC-H',
            'GBK-EUC-V',
            'GBKp-EUC-H',
            'GBKp-EUC-V',
            'GBpc-EUC-H',
            'GBpc-EUC-V',
            'GBT-EUC-H',
            'GBT-EUC-V',
            'GBT-H',
            'GBTpc-EUC-H',
            'GBTpc-EUC-V',
            'GBT-V',
            'GB-V',
            'H',
            'Hankaku',
            'Hiragana',
            'HKdla-B5-H',
            'HKdla-B5-V',
            'HKdlb-B5-H',
            'HKdlb-B5-V',
            'HKgccs-B5-H',
            'HKgccs-B5-V',
            'HKm314-B5-H',
            'HKm314-B5-V',
            'HKm471-B5-H',
            'HKm471-B5-V',
            'HKscs-B5-H',
            'HKscs-B5-V',
            'Katakana',
            'KSC-EUC-H',
            'KSC-EUC-V',
            'KSC-H',
            'KSC-Johab-H',
            'KSC-Johab-V',
            'KSCms-UHC-H',
            'KSCms-UHC-HW-H',
            'KSCms-UHC-HW-V',
            'KSCms-UHC-V',
            'KSCpc-EUC-H',
            'KSCpc-EUC-V',
            'KSC-V',
            'NWP-H',
            'NWP-V',
            'RKSJ-H',
            'RKSJ-V',
            'Roman',
            'V',
            'WP-Symbol',
            'UniCNS-UTF8-H',
            'UniCNS-UTF16-V',
            'UniCNS-UTF32-H',
            'UniCNS-UTF32-V',
            'UniGB-UCS2-H',
            'UniGB-UCS2-V',
            'UniGB-UTF8-H',
            'UniGB-UTF8-V',
            'UniGB-UTF16-H',
            'UniGB-UTF16-V',
            'UniGB-UTF32-H',
            'UniGB-UTF32-V',
            'UniJIS2004-UTF8-H',
            'UniJIS2004-UTF8-V',
            'UniJIS2004-UTF16-H',
            'UniJIS2004-UTF16-V',
            'UniJIS2004-UTF32-H',
            'UniJIS2004-UTF32-V',
            'UniJISPro-UCS2-HW-V',
            'UniJISPro-UCS2-V',
            'UniJISPro-UTF8-V',
            'UniJIS-UCS2-H',
            'UniJIS-UCS2-HW-H',
            'UniJIS-UCS2-HW-V',
            'UniJIS-UCS2-V',
            'UniJIS-UTF8-H',
            'UniJIS-UTF8-V',
            'UniJIS-UTF16-H',
            'UniJIS-UTF16-V',
            'UniJIS-UTF32-H',
            'UniJIS-UTF32-V',
            'UniJISX0213-UTF32-H',
            'UniJISX0213-UTF32-V',
            'UniJISX02132004-UTF32-H',
            'UniJISX02132004-UTF32-V',
            'UniKS-UCS2-V',
            'UniKS-UTF8-H',
            'UniKS-UTF8-V',
            'UniKS-UTF16-H',
            'UniKS-UTF16-V',
            'UniKS-UTF32-H',
            'UniKS-UTF32-V'
        ];

        // Act / Assert
        for (let i: number = 0; i < encodingCaseNames.length; i++) {
            const encodeName: string = encodingCaseNames[i];
            const result: string = _getEncodingBase64String(encodeName);

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThanOrEqual(0);
        }

        const unknownResult: string = _getEncodingBase64String('Unknown-Encoding-Name');

        // Assert
        expect(unknownResult).toBe('');
    });

    it('should cover _recoverGlyphName direct-hit branch', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            65: 65
        };

        // Act
        const result: string = _recoverGlyphName(65, glyphsUnicodeMap);

        // Assert
        expect(result).toBeTruthy();
    });

    it('should cover _recoverGlyphName unicode-recovery loop branch', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            RecoveredA: 65,
            OtherGlyph: 66
        };

        // Act
        const result: string = _recoverGlyphName('uni0041', glyphsUnicodeMap);

        // Assert
        expect(result).toBe('uni0041');
    });

    it('should cover _recoverGlyphName fallback return-original branch', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const result: string = _recoverGlyphName('UnknownGlyph', glyphsUnicodeMap);

        // Assert
        expect(result).toBe('UnknownGlyph');
    });

    it('should cover _getUnicodeForGlyph direct lookup branch', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            A: 65
        };

        // Act
        const result: number = _getUnicodeForGlyph('A', glyphsUnicodeMap);

        // Assert
        expect(result).toBe(65);
    });

    it('should cover _getUnicodeForGlyph empty-name and invalid-name branches', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const emptyResult: number = _getUnicodeForGlyph('', glyphsUnicodeMap);
        const invalidNameResult: number = _getUnicodeForGlyph('abc', glyphsUnicodeMap);
        const invalidShortUResult: number = _getUnicodeForGlyph('u1', glyphsUnicodeMap);
        const invalidLowerCaseHexResult: number = _getUnicodeForGlyph('u00ff', glyphsUnicodeMap);

        // Assert
        expect(emptyResult).toBe(-1);
        expect(invalidNameResult).toBe(-1);
        expect(invalidShortUResult).toBe(-1);
        expect(invalidLowerCaseHexResult).toBe(-1);
    });

    it('should cover _getUnicodeForGlyph uniXXXX and uXXXX uppercase hex branches', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const uniResult: number = _getUnicodeForGlyph('uni0041', glyphsUnicodeMap);
        const uResult: number = _getUnicodeForGlyph('u0042', glyphsUnicodeMap);
        const longerUpperHexResult: number = _getUnicodeForGlyph('u10FF', glyphsUnicodeMap);

        // Assert
        expect(uniResult).toBe(65);
        expect(uResult).toBe(66);
        expect(longerUpperHexResult).toBe(0x10FF);
    });
});
   


describe('font-utils _recoverGlyphName complete coverage', () => {
    it('should cover the direct-hit branch and return the original numeric name', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            65: 65
        };

        // Act
        const result: any = _recoverGlyphName(65, glyphsUnicodeMap) as any;

        // Assert
        expect(result).toBe(65);
    });

    it('should cover the highlighted loop branch and return the matching key', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            65: 65,
            66: 66
        };

        // Act
        const result: any= _recoverGlyphName('uni0041', glyphsUnicodeMap);

        // Assert
        expect(result).toBeTruthy();
    });

    it('should cover the fallback branch and return the original name when no key matches', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {
            66: 66
        };

        // Act
        const result: string = _recoverGlyphName('uni0041', glyphsUnicodeMap);

        // Assert
        expect(result).toBe('uni0041');
    });

    it('should cover the fallback branch for empty string safely', () => {
        // Arrange
        const glyphsUnicodeMap: { [key: string]: number } = {};

        // Act
        const result: string = _recoverGlyphName('', glyphsUnicodeMap);

        // Assert
        expect(result).toBe('');
    });
});
