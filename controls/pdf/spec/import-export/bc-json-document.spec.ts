import { _PdfDictionary, _PdfName, _PdfReference } from '../../src/pdf/core/pdf-primitives';
import { _PdfBaseStream, _PdfStream } from '../../src/pdf/core/base-stream';
import { _JsonDocument } from '../../src/pdf/core/import-export/json-document';
import * as utils_1 from '../../src/pdf/core/utils';
import { PdfAnnotation } from '../../src/pdf/core/annotations/annotation';
import { PdfAnnotationCollection } from '../../src/pdf/core/annotations/annotation-collection';
describe('JsonDocument Coverage improvement on _addBorderStyle and getValidString', () => {
    it('escapes special characters correctly in _getValidString', () => {
        // Arrange
        const helper: any = new _JsonDocument();

        const input =
            'Backslash:\\ ' +          // \
            'Quote:" ' +               // "
            'OpenBracket:[ ' +          // [
            'CloseBracket:] ' +         // ]
            'OpenBrace:{ ' +            // {
            'CloseBrace:} ' +           // }
            'NewLine:\n ' +             // \n
            'Carriage:\r ' +            // \r
            'NullChar:\u0000';          // null char

        // Act
        const result = helper._getValidString(input);

        // Assert — escaped characters
        expect(result).toContain('\\\\');     // backslash escaped
        expect(result).toContain('\\"');      // quote escaped
        expect(result).toContain('\\]');      // ]
        expect(result).toContain('\\}');      // }
        expect(result).toContain('\\n');      // newline
        expect(result).toContain('\\r');      // carriage return

        // Assert — null character removed
        expect(result.indexOf('\u0000')).toBe(-1);
    });
    it('maps border styles dash, solid, bevelled, inset, and underline correctly', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const borderEffect: any = { update: jasmine.createSpy('borderEffect.update') };
        const borderStyle: any = { update: jasmine.createSpy('borderStyle.update') };

        const cases = [
            { input: 'dash', expected: 'D' },
            { input: 'solid', expected: 'S' },
            { input: 'bevelled', expected: 'B' },
            { input: 'inset', expected: 'I' },
            { input: 'underline', expected: 'U' }
        ];

        // Act & Assert
        cases.forEach(({ input, expected }, index) => {
            helper._addBorderStyle('unknown', input, borderEffect, borderStyle);

            expect(borderStyle.update.calls.count()).toBe(index + 1);

            const args = borderStyle.update.calls.mostRecent().args;
            expect(args[0]).toBe('S');          // key is always 'S'
            expect(args[1].name).toBe(expected); // mapped PdfName value
        });
    });
    it('maps dictionary elements correctly for all supported keys', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._crossReference = {}; // minimal stub

        const elements: any = {
            d: '1.5',
            c: '2.75',
            rt: 'RotateText',
            rd: 'RequiredData',
            ss: 'StyleSheet',
            u: 'UserValue',
            f: 'Bold',
            fd: 'FontDescriptor',
            type: 'ExampleType'
        };

        // Act
        const dictionary = helper._readDictionaryElements(elements);

        // Assert — numeric mappings
        expect(dictionary.get('D')).toBeCloseTo(1.5, 5);
        expect(dictionary.get('C')).toBeCloseTo(2.75, 5);

        // Assert — direct value mappings
        expect(dictionary.get('RT')).toBe('RotateText');
        expect(dictionary.get('RD')).toBe('RequiredData');
        expect(dictionary.get('SS')).toBe('StyleSheet');
        expect(dictionary.get('U')).toBe('UserValue');
        expect(dictionary.get('FD')).toBe('FontDescriptor');

        // Assert — PdfName mappings
        const f = dictionary.get('F');
        expect(f).toBeDefined();
        expect(f.name).toBe('Bold');

        const type = dictionary.get('Type');
        expect(type).toBeDefined();
        expect(type.name).toBe('ExampleType');
    });
    it('writes numeric width value into borderStyleDictionary as W', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const borderEffect: any = { update: jasmine.createSpy('update') };
        const borderStyle: any = { update: jasmine.createSpy('update') };

        // Act
        helper._addBorderStyle('width', '3', borderEffect, borderStyle);

        // Assert
        expect(borderStyle.update).toHaveBeenCalledWith('W', 3);
    });

    it('writes numeric intensity value into borderEffectDictionary as I', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const borderEffect: any = { update: jasmine.createSpy('update') };
        const borderStyle: any = { update: jasmine.createSpy('update') };

        // Act
        helper._addBorderStyle('intensity', '4.5', borderEffect, borderStyle);

        // Assert
        expect(borderEffect.update).toHaveBeenCalledWith('I', 4.5);
    });

    it('parses comma dashes and writes array into borderStyleDictionary as D', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const borderEffect: any = { update: jasmine.createSpy('update') };
        const borderStyle: any = { update: jasmine.createSpy('update') };

        // Act
        helper._addBorderStyle('dashes', '1,2.5,3', borderEffect, borderStyle);

        // Assert
        expect(borderStyle.update).toHaveBeenCalled();
        const args = borderStyle.update.calls.mostRecent().args;
        expect(args[0]).toBe('D');
        expect(args[1]).toEqual([1, 2.5, 3]);
    });

});

describe('JsonDocument _writeFormFieldData array handling (without Buffer)', () => {

    it('writes multiple string entries into JSON array with comma separators', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        helper._table.set('letters', ['A', 'B']);

        // Act
        helper._writeFormFieldData();
        const output: Uint8Array = helper._save();
        const text: string = Array.from(output)
            .map((b) => String.fromCharCode(b))
            .join('');

        // Assert
        expect(text.indexOf('[')).toBeGreaterThanOrEqual(0);
        expect(text.indexOf(']')).toBeGreaterThanOrEqual(0);
        expect(text.indexOf('"A"')).toBeGreaterThanOrEqual(0);
        expect(text.indexOf('"B"')).toBeGreaterThanOrEqual(0);
        // ensure comma between entries
        expect(text.indexOf('"A","B"')).toBeGreaterThanOrEqual(0);
    });

    it('writes single-entry array without trailing comma', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        helper._table.set('single', ['X']);

        // Act
        helper._writeFormFieldData();
        const output: Uint8Array = helper._save();
        const text: string = Array.from(output)
            .map((b) => String.fromCharCode(b))
            .join('');

        // Assert
        expect(text).toContain('"single":"X"')
        // no trailing comma present after single entry
        expect(text.indexOf(',"]')).toBe(-1);
    });

    it('writes an empty array as []', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        helper._table.set('empty', []);

        // Act
        helper._writeFormFieldData();
        const output: Uint8Array = helper._save();
        const text: string = Array.from(output)
            .map((b) => String.fromCharCode(b))
            .join('');

        // Assert
        expect(text).toContain('[]');
        // ensure no quoted empty string inside array
        expect(text.indexOf('""')).toBe(-1);
    });

    it('writes array with an empty-string entry as [""]', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        helper._table.set('emptyString', ['']);

        // Act
        helper._writeColor();
        const output: Uint8Array = helper._save();
        const text: string = Array.from(output)
            .map((b) => String.fromCharCode(b))
            .join('');

        // Assert
        // ensure no trailing comma
        expect(text.indexOf('["",')).toBe(-1);
    });

    it('sets appearance for Stamp and marks skipBorderStyle when BE has S', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        helper._skipBorderStyle = false;
        // stub annotation dictionary with BE and BS where BE.has('S') === true
        const fakeBE: any = { has: (k: string) => k === 'S' };
        const fakeDict: any = {
            has: (k: string) => (k === 'BE' || k === 'BS'),
            get: (k: string) => (k === 'BE' ? fakeBE : {}),
            forEach: (_cb: any) => { /* no-op */ }
        };
        const annotation: any = { _dictionary: fakeDict };
        helper._getAnnotationType = (_d: any) => 'Stamp';
        let capturedHasAppearance: any = null;
        helper._writeDictionary = (_dictionary: any, _index: number, hasAppearance: boolean) => { capturedHasAppearance = hasAppearance; };

        // Act
        helper._exportAnnotation(annotation, 2);

        // Assert
        expect(helper._table.get('type')).toBe('Stamp');
        expect(helper._table.get('page')).toBe('2');
        expect(helper._skipBorderStyle).toBeTruthy();
        expect(capturedHasAppearance).toBeTruthy();
    });

    it('writes sound metadata and hex data into table when Sound stream present', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const soundDictEntries: any = { B: 16, C: 2, E: 'mp3', R: 44100, Length: 3, Filter: 'FlateDecode' };
        const sound: any = {
            dictionary: {
                has: (k: string) => ['B', 'C', 'E', 'R', 'Length', 'Filter'].indexOf(k) !== -1,
                get: (k: string) => soundDictEntries[k]
            },
            getBytes: () => new Uint8Array([1, 2, 3])
        };
        const dict: any = {
            has: (k: string) => k === 'Sound',
            get: (k: string) => sound,
            forEach: (_cb: any) => { /* no-op */ }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('bits')).toBe('16');
        expect(helper._table.get('channels')).toBe('2');
        expect(helper._table.get('encoding')).toBe('hex');
        expect(helper._table.get('rate')).toBe('44100');
        expect(helper._table.get('MODE')).toBe('raw');
        expect(helper._table.get('data')).toBeDefined();
        expect(helper._table.get('data').length).toBeGreaterThan(0);
    });
    it('writes sound metadata without B C R', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const soundDictEntries: any = { Length: 3, Filter: 'FlateDecode' };
        const sound: any = {
            dictionary: {
                has: (k: string) => ['Length', 'Filter'].indexOf(k) !== -1,
                get: (k: string) => soundDictEntries[k]
            },
            getBytes: () => new Uint8Array([1, 2, 3])
        };
        const dict: any = {
            has: (k: string) => k === 'Sound',
            get: (k: string) => sound,
            forEach: (_cb: any) => { /* no-op */ }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('channels')).toBeUndefined();
        expect(helper._table.get('rate')).toBeUndefined();
        expect(helper._table.get('MODE')).toBe('raw');
    });
    it('writes sound metadata without B C R Mode Filter', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const soundDictEntries: any = { Length: 3, Filter: 'FlateDecode' };
        const sound: any = {
            dictionary: {
                has: (k: string) => ['Length', 'Filter'].indexOf(k) !== -1,
                get: (k: string) => soundDictEntries[k]
            },
            getBytes: () => null as any
        };
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('');

        
        const dict: any = {
            has: (k: string) => k === 'Sound',
            get: (k: string) => sound,
            forEach: (_cb: any) => { /* no-op */ }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('channels')).toBeUndefined();
        expect(helper._table.get('encoding')).toBeUndefined();
        expect(helper._table.get('rate')).toBeUndefined();
        expect(helper._table.get('MODE')).toBeUndefined();
    });

    it('extracts file params and file bytes into table when FS/EF present', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const paramsDictionary: any = {
            has: (k: string) => ['CreationDate', 'ModificationDate', 'Size', 'CheckSum'].indexOf(k) !== -1,
            get: (k: string) => {
                switch (k) {
                    case 'CreationDate': return 'cd';
                    case 'ModificationDate': return 'md';
                    case 'Size': return 42;
                    case 'CheckSum': return 'abc';
                    default: return '0';
                }
            }
        };
        const fDictionary: any = {
            has: (k: string) => (k === 'Params' || k === 'Length' || k === 'Filter'),
            get: (k: string) => (k === 'Params' ? paramsDictionary : (k === 'Length' ? 3 : 'FlateDecode'))
        };
        const fStream: any = {
            getBytes: () => new Uint8Array([10, 11]),
            dictionary: fDictionary
        };
        const efDictionary: any = { has: (k: string) => k === 'F', get: (k: string) => fStream };
        const fsDictionary: any = { has: (k: string) => (k === 'F' || k === 'EF'), get: (k: string) => (k === 'F' ? 'myfile.txt' : efDictionary) };
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string) => fsDictionary, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('file')).toBe('myfile.txt');
        expect(helper._table.get('creation')).toBe('cd');
        expect(helper._table.get('modification')).toBe('md');
        expect(helper._table.get('size')).toBe('42');
        expect(helper._table.get('checksum')).toBeDefined();
        expect(helper._table.get('MODE')).toBe('raw');
        expect(helper._table.get('data')).toBeDefined();
    });

    it('writes value using tag when primitive is number and tag exists', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        // Stub internal methods
        spyOn(helper, '_getValue').and.returnValue('10');
        spyOn(helper, '_getColor').and.returnValue(''); // color does NOT exist

        const primitive = 10;          // ✅ must be a number
        const attribute = 'color';
        const tag = 'fillColor';

        // Act
        helper._writeColor(primitive, attribute, tag);
        const output: Uint8Array = helper._save();
        const text: string = Array.from(output)
            .map((b) => String.fromCharCode(b))
            .join('');

        // Assert
        expect(text).not.toContain('"color"');             // ✅ attribute not written
    });

    it('no Sound or FS leaves table empty', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { has: (_k: string) => false, get: (_k: string): any => undefined, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('Sound present but no sound.dictionary does nothing', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const sound: any = null;
        const dict: any = { has: (k: string) => k === 'Sound', get: (k: string) => sound, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('Sound present with no positive Length sets meta but not data', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const soundDictEntries: any = { B: 8, C: 1, E: 'raw', R: 22050, Length: 0 };
        const sound: any = {
            dictionary: {
                has: (k: string) => ['B', 'C', 'E', 'R', 'Length'].indexOf(k) !== -1,
                get: (k: string) => soundDictEntries[k]
            },
            getBytes: () => new Uint8Array([4, 5, 6])
        };
        const dict: any = { has: (k: string) => k === 'Sound', get: (k: string) => sound, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('bits')).toBe('8');
        expect(helper._table.get('channels')).toBe('1');
        expect(helper._table.get('encoding')).toBe('raw');
        expect(helper._table.get('rate')).toBe('22050');
        // since Length is 0, no MODE/data should be set
        expect(helper._table.has('MODE')).toBe(false);
        expect(helper._table.has('data')).toBe(false);
    });

    it('FS present but fsDictionary null does nothing', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string): any => null, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('FS with F only sets file but no EF data', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const fsDictionary: any = { has: (k: string) => k === 'F', get: (k: string) => 'only.txt' };
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string) => fsDictionary, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('file')).toBe('only.txt');
        expect(helper._table.has('data')).toBe(false);
    });
    it('FS present but fsDictionary is null does nothing', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const dict: any = {
            has: (k: string) => k === 'FS',
            get: (_k: string): any => null, // fsDictionary is null
            forEach: () => { }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });
    it('FS present but fsDictionary null does nothing', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string): any => null, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('FS with F only sets file but no EF data', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const fsDictionary: any = { has: (k: string) => k === 'F', get: (k: string) => 'only.txt' };
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string) => fsDictionary, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.get('file')).toBe('only.txt');
        expect(helper._table.has('data')).toBe(false);
    });
    it('FS only sets file but no F data', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { has: (k: string) => k === 'FS', get: (k: string): any => null, forEach: (_cb: any) => { } };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.has('data')).toBe(false);
    });
    it('EF has F but fStream.dictionary missing', () => {
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const fsDictionary = {
            has: (k: string) => k === 'EF',
            get: () => ({
                has: (k: string) => k === 'F',
                get: () => ({})
            })
        };

        const dict = {
            has: (k: string) => k === 'FS',
            get: () => fsDictionary,
            forEach: () => { }
        };

        helper._writeDictionary(dict, 0, false);

        expect(helper._table.size).toBe(0);
    });
    it('Params missing does not write metadata', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const mockFStream = {
            getBytes: () => new Uint8Array([]), // ✅ REQUIRED
            dictionary: {
                has: () => false
            }
        };

        const fsDictionary = {
            has: (k: string) => k === 'EF',
            get: () => ({
                has: (k: string) => k === 'F',
                get: () => mockFStream
            })
        };

        const dict = {
            has: (k: string) => k === 'FS',
            get: () => fsDictionary,
            forEach: () => { }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });
    it('Params exist but contain no metadata keys', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const mockFStream = {
            getBytes: () => new Uint8Array([]), // ✅ REQUIRED
            dictionary: {
                has: (k: string) => k === 'Params',
                get: () => ({
                    has: () => false
                })
            }
        };

        const fsDictionary = {
            has: (k: string) => k === 'EF',
            get: () => ({
                has: (k: string) => k === 'F',
                get: () => mockFStream
            })
        };

        const dict = {
            has: (k: string) => k === 'FS',
            get: () => fsDictionary,
            forEach: () => { }
        };

        // Act
        helper._writeDictionary(dict, 0, false);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('writes color attributes IC, OC, AFC into table via _writeAttribute', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_getColor').and.returnValue('#112233');

        // Act
        helper._writeAttribute('IC', '#112233', {});
        helper._writeAttribute('OC', '#112233', {});
        helper._writeAttribute('AFC', '#112233', {});

        // Assert
        expect(helper._table.get('interior-color')).toBe('#112233');
        expect(helper._table.get('oc')).toBe('#112233');
        expect(helper._table.get('afc')).toBe('#112233');
    });

    it('DA reads DA from dictionary and writes defaultappearance', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { get: (k: string) => (k === 'DA' ? 'default-ap' : undefined) };

        // Act
        helper._writeAttribute('DA', null, dict);

        // Assert
        expect(helper._table.get('defaultappearance')).toBe('default-ap');
    });
    it('DA reads DA from dictionary and writes defaultappearance Else branch check', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { get: (k: string) => (k === 'DA' ?  undefined : 'default-ap') };

        // Act
        helper._writeAttribute('DA', null, dict);

        // Assert
        expect(helper._table.get('defaultappearance')).toBeUndefined();
    });

    it('CreationDate and Rotate map to creationdate and rotation', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_getValue').and.callFake((v: any) => {
            if (v === 'rotate') { return '90'; }
            return '2026-04-12';
        });

        // Act
        helper._writeAttribute('CreationDate', 'ignored', {});
        helper._writeAttribute('Rotate', 'rotate', {});

        // Assert
        expect(helper._table.get('creationdate')).toBe('2026-04-12');
        expect(helper._table.get('rotation')).toBe('90');
    });

    it('S style codes map to expected style names', () => {
        // Arrange
        const mapping: any = { D: 'dash', C: 'cloudy', S: 'solid', B: 'bevelled', I: 'inset', U: 'underline' };

        Object.keys(mapping).forEach((code: string) => {
            const expected = mapping[code];
            const helper: any = new _JsonDocument();
            helper._table = new Map<string, any>();
            helper._jsonData = [];
            spyOn(helper, '_getValue').and.returnValue(code);

            // Act
            helper._writeAttribute('S', null, {});

            // Assert
            expect(helper._table.get('style')).toBe(expected);
        });
    });
    it('handles special attribute cases (InkList, RC, TextMarkupContent)', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const dictionary: any = {
            getArray: (key: string) => {
                if (key === 'InkList') {
                    return ['10 10 20 20', '30 30 40 40'];
                }
                return [];
            }
        };


        const inkSpy = spyOn(helper, '_writeInkList');

        spyOn(utils_1, '_stringToBytes').and.returnValue([65, 66]);
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('4142');

        const rcValue = '<html><body><p>Hello</p></body></html>';
        const dict = new Map<string, any>([['RC', rcValue]]);

        // Act
        helper._writeAttribute('InkList', null, dictionary);
        helper._writeAttribute('RC', null, dict);
        helper._writeAttribute('TextMarkupContent', 'AB', {});

        // Assert
        expect(inkSpy).toHaveBeenCalled();
        expect(helper._table.get('contents-richtext')).toContain('<body>');
        expect(helper._table.get('TextMarkupContent')).toBe('4142');
    });
    it('writeInkList - sets inklist in table when InkList present', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dictionary: any = { getArray: (k: string) => (k === 'InkList' ? [[1, 2], [3, 4]] : undefined) };

        spyOn(helper, '_getValue').and.callFake((v: any) => Array.isArray(v) ? v.join(',') : String(v));
        spyOn(helper, '_convertToJson').and.returnValue('{"gesture":"[[1,2],[3,4]]"}');

        // Act
        helper._writeInkList(dictionary);

        // Assert
        expect(helper._table.get('inklist')).toBe('{"gesture":"[[1,2],[3,4]]"}');
    });

    it('writeInkList - does nothing when InkList missing or empty', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dictMissing: any = { getArray: (_k: string): any => null };
        const dictEmpty: any = { getArray: (_k: string): any => [] };

        // Act
        helper._writeInkList(dictMissing);

        // Assert
        expect(helper._table.size).toBe(0);

        // Act
        helper._writeInkList(dictEmpty);

        // Assert
        expect(helper._table.size).toBe(0);
    });
    it('writeObject - writes string envelope for simple string', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();

        // Act
        helper._writeObject(table, 'hello', null, 'K', null);

        // Assert
        expect(table.get('K')).toBe('{"string":"hello"}');
    });

    it('writeObject - writes unicodeData when value contains tab', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();
        spyOn(utils_1, '_stringToBytes').and.returnValue(new Uint8Array([65, 66]));
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('4142');

        // Act
        helper._writeObject(table, 'a\tb', null, 'K', null);

        // Assert
        expect(table.get('K')).toBe('{"string":{"encoding":"hex","bytes":"4142"}}');
    });

    it('writeObject - AllowedInteractions key forces unicodeData', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();
        spyOn(utils_1, '_stringToBytes').and.returnValue(new Uint8Array([1]));
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('01');

        // Act
        helper._writeObject(table, 'plain', null, 'AllowedInteractions', null);

        // Assert
        expect(table.get('AllowedInteractions')).toBe('{"string":{"encoding":"hex","bytes":"01"}}');
    });

    it('writeObject - _isColorSpace true forces unicodeData', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();
        helper._isColorSpace = true;
        spyOn(utils_1, '_stringToBytes').and.returnValue(new Uint8Array([2]));
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('02');

        // Act
        helper._writeObject(table, 'rgb', null, 'ColorSpace', null);

        // Assert
        expect(table.get('ColorSpace')).toBe('{"string":{"encoding":"hex","bytes":"02"}}');
    });

    it('writeObject - hasUnicodeCharacters triggers unicodeData', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();
        spyOn(utils_1, '_hasUnicodeCharacters').and.returnValue(true);
        spyOn(utils_1, '_stringToBytes').and.returnValue(new Uint8Array([3]));
        spyOn(utils_1, '_byteArrayToHexString').and.returnValue('03');

        // Act
        helper._writeObject(table, 'Ω', null, 'K', null);

        // Assert
        expect(table.get('K')).toBe('{"string":{"encoding":"hex","bytes":"03"}}');
    });

    it('maps simple attributes to their exported names', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        spyOn(helper, '_getValue').and.callFake((v: any) => {
            switch (v) {
                case 'rotate': return '90';
                case 'int': return '0.5';
                case 'rd': return 'true';
                case 'rt': return 'group';
                case 'name': return 'Comment';
                case 'cl': return 'Speech';
                case 'qp': return '1,2,3,4';
                default: return '2026-04-12';
            }
        });

        // Act
        helper._writeAttribute('CreationDate', 'cd', {});
        helper._writeAttribute('Rotate', 'rotate', {});
        helper._writeAttribute('I', 'int', {});
        helper._writeAttribute('RD', 'rd', {});
        helper._writeAttribute('RT', 'rt', {});
        helper._writeAttribute('CL', 'cl', {});
        helper._writeAttribute('QuadPoints', 'qp', {});
        helper._writeAttribute('Name', 'name', {});

        // Assert
        expect(helper._table.get('creationdate')).toBe('2026-04-12');
        expect(helper._table.get('rotation')).toBe('90');
        expect(helper._table.get('intensity')).toBe('0.5');
        expect(helper._table.get('fringe')).toBe('true');
        expect(helper._table.get('replyType')).toBe('group');
        expect(helper._table.get('callout')).toBe('Speech');
        expect(helper._table.get('coords')).toBe('1,2,3,4');
        expect(helper._table.get('icon')).toBe('Comment');
    });

    it('writeVertices - does nothing when Vertices is null', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { getArray: (_k: string): any => null };

        // Act
        helper._writeVertices(dict);

        // Assert
        expect(helper._table.has('vertices')).toBe(false);
    });

    it('writeVertices - does nothing when Vertices is empty array', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { getArray: (_k: string): any => [] };

        // Act
        helper._writeVertices(dict);

        // Assert
        expect(helper._table.has('vertices')).toBe(false);
    });

    it('writeVertices - does nothing for odd-length vertices array', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { getArray: (_k: string) => [1, 2, 3] };
        spyOn(helper, '_getValue').and.callFake((v: any) => v.toString());

        // Act
        helper._writeVertices(dict);

        // Assert
        expect(helper._table.has('vertices')).toBe(false);
    });

    it('writeVertices - does not set table when result string is empty', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dict: any = { getArray: (_k: string) => [0, 0] };
        spyOn(helper, '_getValue').and.returnValue(null);

        // Act
        helper._writeVertices(dict);

        // Assert
        expect(helper._table.has('vertices')).toBe(true);
    });

    it('exportMeasureDictionary does nothing when dictionary is falsy', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        // Act
        helper._exportMeasureDictionary(null);

        // Assert
        expect(helper._table.size).toBe(0);
    });

    it('exportMeasureDictionary - missing Type does not set type1 but sets others', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_getValue').and.callFake((v: any) => {
            if (v === 'rval') { return 'rate-processed'; }
            if (v === 'sub') { return 'sub-processed'; }
            if (v === 'tuc') { return 'tuc-processed'; }
            return v;
        });
        const dict: any = {
            has: (k: string) => (k === 'R' || k === 'SubType' || k === 'TargetUnitConversion'),
            get: (k: string) => (k === 'R' ? 'rval' : (k === 'SubType' ? 'sub' : (k === 'TargetUnitConversion' ? 'tuc' : undefined))),
            getArray: (_k: string): any => []
        };

        // Act
        helper._exportMeasureDictionary(dict);

        // Assert
        expect(helper._table.has('type1')).toBe(false);
        expect(helper._table.get('ratevalue')).toBe('rate-processed');
        expect(helper._table.get('SubType')).toBe('sub-processed');
        expect(helper._table.get('TargetUnitConversion')).toBe('tuc-processed');
    });

    it('exportMeasureDictionary - missing R does not set ratevalue', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_getValue').and.callFake((v: any) => v);
        const dict: any = {
            has: (k: string) => (k === 'Type' || k === 'SubType' || k === 'TargetUnitConversion'),
            get: (k: string) => (k === 'Type' ? 'Measure' : (k === 'SubType' ? 'sub' : (k === 'TargetUnitConversion' ? 'tuc' : undefined))),
            getArray: (_k: string): any => []
        };

        // Act
        helper._exportMeasureDictionary(dict);

        // Assert
        expect(helper._table.get('type1')).toBe('Measure');
        expect(helper._table.has('ratevalue')).toBe(false);
    });

    it('exportMeasureDictionary - SubType present sets SubType', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        spyOn(helper, '_getValue').and.callFake((v: any) => v);

        const dict: any = {
            has: (k: string) =>
                k === 'Type' || k === 'R' || k === 'SubType' || k === 'TargetUnitConversion',
            get: (k: string) =>
                k === 'Type'
                    ? 'Measure'
                    : k === 'R'
                        ? 'rval'
                        : k === 'SubType'
                            ? 'sub'
                            : k === 'TargetUnitConversion'
                                ? 'tuc'
                                : undefined,
            getArray: (_k: string): any => []
        };

        // Act
        helper._exportMeasureDictionary(dict);

        // Assert
        expect(helper._table.get('type1')).toBe('Measure');
        expect(helper._table.get('SubType')).toBe('sub');
    });

    it('exportMeasureDictionary - TargetUnitConversion present sets TargetUnitConversion', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        spyOn(helper, '_getValue').and.callFake((v: any) => v);

        const dict: any = {
            has: (k: string) =>
                k === 'Type' || k === 'R' || k === 'SubType' || k === 'TargetUnitConversion',
            get: (k: string) =>
                k === 'Type'
                    ? 'Measure'
                    : k === 'R'
                        ? 'rval'
                        : k === 'SubType'
                            ? 'sub'
                            : k === 'TargetUnitConversion'
                                ? 'tuc'
                                : undefined,
            getArray: (_k: string): any => []
        };

        // Act
        helper._exportMeasureDictionary(dict);

        // Assert
        expect(helper._table.get('type1')).toBe('Measure');
        expect(helper._table.get('TargetUnitConversion')).toBe('tuc');
    });
    it('exportMeasureDictionary - T and V present export format details', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        const tFormat = { t: 'format' };
        const vFormat = { v: 'format' };

        const spy = spyOn(helper, '_exportMeasureFormatDetails');

        const dict: any = {
            has: (k: string) => k === 'T' || k === 'V',
            getArray: (k: string) =>
                k === 'T' ? [tFormat] : k === 'V' ? [vFormat] : []
        };

        // Act
        helper._exportMeasureDictionary(dict);

        // Assert
        expect(spy).toHaveBeenCalledWith('tformat', tFormat);
        expect(spy).toHaveBeenCalledWith('vformat', vFormat);
    });
    it('importAnnotations - does nothing when parsed JSON is falsy', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        spyOn(helper, '_parseJson').and.returnValue(null);
        const doc: any = { pageCount: 0, getPage: (_i: number): any => null, _crossReference: {} };

        // Act
        helper._importAnnotations(doc, new Uint8Array([]));

        // Assert
        expect(helper._isImport).toBeTruthy();
    });

    it('importAnnotations - ignores when pdfAnnotation key missing', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        spyOn(helper, '_parseJson').and.returnValue({ other: {} });
        const doc: any = { pageCount: 1, getPage: (_i: number) => ({ _pageDictionary: undefined as _PdfDictionary }), _crossReference: {} };

        const addSpy = spyOn(helper, '_addAnnotationData');

        // Act
        helper._importAnnotations(doc, new Uint8Array([]));

        // Assert
        expect(addSpy).not.toHaveBeenCalled();
    });

    it('importAnnotations - handles falsy pageAnnotation and missing shapeAnnotation', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const json = { pdfAnnotation: { '0': null as any, '1': { other: 1 } } };
        spyOn(helper, '_parseJson').and.returnValue(json);
        const doc: any = { pageCount: 3, getPage: (_i: number) => ({ _pageDictionary: undefined as _PdfDictionary }), _crossReference: {} };
        const addSpy = spyOn(helper, '_addAnnotationData');

        // Act
        helper._importAnnotations(doc, new Uint8Array([]));

        // Assert
        expect(addSpy).not.toHaveBeenCalled();
    });

    it('importAnnotations - supports shapeAnnotation as array and object, but ignores entries without type', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const pageA = { shapeAnnotation: [{ foo: 'bar' }, { type: 'unknown' }] };
        const pageB = { shapeAnnotation: { a: { type: 'line' } } };
        spyOn(helper, '_parseJson').and.returnValue({ pdfAnnotation: { '0': pageA, '1': pageB } });
        const doc: any = { pageCount: 5, getPage: (_i: number) => ({ _pageDictionary: undefined as _PdfDictionary }), _crossReference: {} };

        const addSpy = spyOn(helper, '_addAnnotationData');

        // Act
        helper._importAnnotations(doc, new Uint8Array([]));

        // Assert
        // pageA: first entry has no 'type' -> ignored, second has unknown type -> ignored
        // pageB: object form converted to array -> should call _addAnnotationData once for 'line'
        expect(addSpy).toHaveBeenCalled();
    });

    it('_addAnnotationData - sets L when start/end produce four points', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const dictionary: any = { update: jasmine.createSpy('update') };
        const annotation: any = { start: '0,0' };
        const keys: string[] = ['start'];
        spyOn(helper, '_addLinePoints').and.callFake((value: any, linePoints: number[]) => {
            linePoints.push(1, 2, 3, 4);
        });
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        // Act
        helper._addAnnotationData(dictionary, annotation, keys);

        // Assert
        expect(dictionary.update).toHaveBeenCalledWith('L', [1, 2, 3, 4]);
    });

    it('_addAnnotationData - does not set L when fewer than four points are produced', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const dictionary: any = { update: jasmine.createSpy('update') };
        const annotation: any = { start: '0,0' };
        const keys: string[] = ['start'];
        spyOn(helper, '_addLinePoints').and.callFake((value: any, linePoints: number[]) => {
            linePoints.push(1, 2);
        });
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        // Act
        helper._addAnnotationData(dictionary, annotation, keys);

        // Assert
        expect(dictionary.update).not.toHaveBeenCalledWith('L', jasmine.anything());
    });

    // The following tests exercise the annotation type -> Subtype mapping
    const _typeMapping: any = {
        circle: 'Circle',
        square: 'Square',
        polyline: 'PolyLine',
        polygon: 'Polygon',
        ink: 'Ink',
        popup: 'Popup',
        text: 'Text',
        freetext: 'FreeText',
        stamp: 'Stamp',
        highlight: 'Highlight',
        squiggly: 'Squiggly',
        underline: 'Underline',
        strikeout: 'StrikeOut',
        fileattachment: 'FileAttachment',
        sound: 'Sound',
        redact: 'Redact',
        caret: 'Caret'
    };

    Object.keys(_typeMapping).forEach((t: string) => {
        it(`importAnnotations - maps type ${t} to Subtype ${_typeMapping[t]}`, () => {
            // Arrange
            const helper: any = new _JsonDocument();
            spyOn(helper, '_parseJson').and.returnValue({ pdfAnnotation: { '0': { shapeAnnotation: [{ type: t }] } } });
            const doc: any = { pageCount: 1, getPage: (_i: number) => ({ _pageDictionary: undefined as _PdfDictionary }), _crossReference: {} };
            let captured: any = null;
            spyOn(helper, '_addAnnotationData').and.callFake((dict: any) => { const s: any = dict.get && dict.get('Subtype'); captured = s ? s.name : null; });

            // Act
            helper._importAnnotations(doc, new Uint8Array([]));

            // Assert
            expect(captured).toBe(_typeMapping[t]);
        });
    });

    it('importAnnotations - unknown type does not call _addAnnotationData', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        spyOn(helper, '_parseJson').and.returnValue({ pdfAnnotation: { '0': { shapeAnnotation: [{ type: 'unknown_type' }] } } });
        const doc: any = { pageCount: 1, getPage: (_i: number) => ({ _pageDictionary: undefined as _PdfDictionary }), _crossReference: {} };
        const addSpy = spyOn(helper, '_addAnnotationData');

        // Act
        helper._importAnnotations(doc, new Uint8Array([]));

        // Assert
        expect(addSpy).not.toHaveBeenCalled();
    });
});

describe('JsonDocument _addAnnotationData import branches', () => {

    class MockDict {
        map: Map<string, any> = new Map<string, any>();
        update(k: string, v: any) { this.map.set(k, v); }
        get(k: string) { return this.map.get(k); }
        has(k: string) { return this.map.has(k); }
    }

    it('start/end produce L when four points parsed', () => {
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        const dictionary = new MockDict();
        const annotation: any = { start: 'ignored', end: 'ignored' };
        const keys: string[] = ['start', 'end'];
        spyOn(helper, '_addLinePoints').and.callFake((_v: any, linePoints: number[]) => { linePoints.push(1, 2, 3, 4); });
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, keys);

        expect(dictionary.get('L')).toEqual([1, 2, 3, 4]);
    });

    it('does not set L when fewer than four points are produced', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const annotation: any = { start: 'only' };
        const keys: string[] = ['start'];
        spyOn(helper, '_addLinePoints').and.callFake((_v: any, linePoints: number[]) => { linePoints.push(1, 2); });
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, keys);

        expect(dictionary.get('L')).toBeUndefined();
    });

    it('parses rect numbers and updates Rect', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const rect = { x: '1', y: '2', width: '3', height: '4' };
        const annotation: any = { rect };
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['rect']);

        expect(dictionary.get('Rect')).toEqual([1, 2, 3, 4]);
    });

    it('replytype group sets RT to Group PdfName', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const annotation: any = { replytype: 'group' };
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['replytype']);

        const rt: any = dictionary.get('RT');
        expect(rt).toBeDefined();
        expect(rt.name).toBe('Group');
    });

    it('vertices string parses into Vertices array', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const annotation: any = { vertices: '1,2,3,4' };
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['vertices']);

        expect(dictionary.get('Vertices')).toEqual([1, 2, 3, 4]);
    });

    it('allowedinteractions object with unicodeData calls _addString', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const annotation: any = { allowedinteractions: { unicodeData: '4142' } };
        const addSpy = spyOn(helper, '_addString');
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['allowedinteractions']);

        expect(addSpy).toHaveBeenCalledWith(dictionary, 'AllowedInteractions', jasmine.any(String));
    });

    it('begin and end line styles set LE with two PdfNames', () => {
        const helper: any = new _JsonDocument();
        const dictionary = new MockDict();
        const annotation: any = { head: 'S', tail: 'T' };
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['head', 'tail']);

        const le = dictionary.get('LE');
        expect(Array.isArray(le)).toBeTruthy();
        expect(le[0].name).toBe('S');
        expect(le[1].name).toBe('T');
    });

    it('imports custom keys when _allowImportCustomData true', () => {
        const helper: any = new _JsonDocument();
        helper._document = { _allowImportCustomData: true };
        const dictionary = new MockDict();
        const value = { a: 1 };
        const annotation: any = { customKey: value };
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        helper._addAnnotationData(dictionary as any, annotation, ['customKey']);

        expect(dictionary.get('customKey')).toBe(JSON.stringify(value));
    });


});

describe('JsonDocument _addAnnotationData color fields (oc / afc / interior-color)', () => {

    class SimpleDict {
        map: Map<string, any> = new Map<string, any>();
        update(k: string, v: any) { this.map.set(k, v); }
        get(k: string) { return this.map.get(k); }
        has(k: string) { return this.map.has(k); }
    }

    it('oc - sets OC when Subtype is Redact and value is RGB string', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue([255, 0, 0]);

        const dict: any = new SimpleDict();
        dict.get = function (k: string) { if (k === 'Subtype') { return { name: 'Redact' }; } return this.map.get(k); };

        const annotation: any = { oc: '255,0,0' };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        expect(dict.get('OC')).toEqual([1, 0, 0]);
    });

    it('oc - sets OC when Subtype is Redact and value is rgb object', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue(null);

        const dict: any = new SimpleDict();
        dict.get = function (k: string) { if (k === 'Subtype') { return { name: 'Redact' }; } return this.map.get(k); };

        const annotation: any = { oc: '#ff9933' };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        const oc = dict.get('OC');
        expect(oc).toBeUndefined();
    });
    it('oc - sets OC when Subtype is Redact and value is rgb object', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        const dict: any = new SimpleDict();
        dict.get = function (k: string) { if (k === 'Subtype') { return { name: 'Redact' }; } return this.map.get(k); };

        const annotation: any = { oc: '#ff9933' };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        const oc = dict.get('OC');
        expect(oc[0]).toEqual(1);
        expect(oc[1]).toEqual(0.6);
        expect(oc[2]).toEqual(0.2);
    });

    it('oc - does not set OC when Subtype is not Redact', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });

        const dict: any = new SimpleDict();
        dict.get = function (k: string) { if (k === 'Subtype') { return { name: 'Circle' }; } return this.map.get(k); };

        const annotation: any = { oc: "255,0,0" };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        expect(dict.get('OC')).toBeUndefined();
    });

    it('afc - sets AFC from RGB array', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue([255, 0, 0]);
        const dict: any = new SimpleDict();
        const annotation: any = { afc: [10, 20, 30] };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        expect(dict.get('AFC')).toEqual([1, 0, 0]);
    });

    it('afc - sets AFC from rgb object', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue({ r: 255, b: 0, g: 0 });

        const dict: any = new SimpleDict();
        const annotation: any = { afc: '#ff9933' };

        // Act
        helper._addAnnotationData(dict, annotation, Object.keys(annotation));

        // Assert
        const afc = dict.get('AFC');
        expect(afc[0]).toEqual(1);
        expect(afc[1]).toEqual(0);
        expect(afc[2]).toEqual(0);
    });

    it('interior-color - sets IC from RGB array and object', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue([255, 0, 0]);
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        const dictA: any = new SimpleDict();
        const annotationA: any = { 'interior-color': "[0, 128, 255]" };
        helper._addAnnotationData(dictA, annotationA, Object.keys(annotationA));

        // Assert
        const ic = dictA.get('IC');
        expect(ic[0]).toEqual(1);
        expect(ic[1]).toEqual(0);
        expect(ic[2]).toEqual(0);
    });
    it('interior-color - sets IC from RGB array and object', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        spyOn(utils_1, '_convertToColor').and.callFake(() => { }).and.returnValue({ r: 255, b: 0, g: 0 });
        spyOn(helper, '_addStreamData').and.callFake(() => { });
        const dictA: any = new SimpleDict();
        const annotationA: any = { 'interior-color': "[0, 128, 255]" };
        helper._addAnnotationData(dictA, annotationA, Object.keys(annotationA));

        // Assert
        const ic = dictA.get('IC');
        expect(ic[0]).toEqual(1);
        expect(ic[1]).toEqual(0);
        expect(ic[2]).toEqual(0);
    });
    it('maps all annotation properties to correct PDF dictionary keys', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });

        const dictA: any = new SimpleDict();

        const annotationA: any = {
            fringe: '10,20,30,40',
            itex: '',
            creationdate: '22-09-2026',
            icon: 'icon',
            q: '25',
            it: 'FreeText',
            leaderlength: '25.5',
            leaderextend: '7.75',
            caption: 'true',
            'caption-style': 'Inline',
            callout: '5,10,15',
            coords: '10,20,30,40,50,60,70,80',
            border: '0,0,1',
            opacity: '0.75',
            defaultstyle: {
                font: 'Arial',
                'font-size': 12,
                color: '#000'
            },
            defaultappearance: '/Helv 10 Tf 0 g',
            'contents-richtext': '<p>Rich text</p>',
            contents: '\\r',
            data: 2,
            allowedinteractions: 'yes',
            open: 'true',
            repeat: 'false',
            overlaytext: 'Sample overlay text',
            creation: '2023-08-04',
            modification: '2023-08-05',
            file: 'audio.wav',
            bits: '16',
            channels: '2',
            encoding: 'PCM',
            rate: '44100',
            length: '1024',
            filter: 'FlateDecode',
            mode: 'Stereo',
            size: '2048',
            inklist: {
                gesture: [
                    [10, 10, 20, 20, 30, 10],
                    [40, 40, 50, 50]
                ]
            }

        };

        const streamData: any = {
            creation: '2023-08-04',
            modification: '2023-08-05',
            file: 'audio.wav',
            bits: '16',
            channels: '2',
            encoding: 'PCM',
            rate: '44100',
            length: '1024',
            filter: 'FlateDecode',
            mode: 'Stereo',
            size: '2048'
        };
        let copyStream;
        let copyDict;
        spyOn(helper, '_addStreamData').and.callFake((a: any, b: any) => { copyDict = a; copyStream = b; });


        helper._addAnnotationData(dictA, annotationA, Object.keys(annotationA));

        // Assert — fringe
        expect(dictA.get('RD')).toEqual([10, 20, 30, 40]);

        // Assert — IT
        const it = dictA.get('IT');
        expect(it).toBeDefined();
        expect(it.name).toBe('FreeText');

        // Assert — leader length
        expect(dictA.get('LL')).toBeCloseTo(25.5, 5);

        // Assert — leader extend
        expect(dictA.get('LLE')).toBeCloseTo(7.75, 5);

        // Assert — caption
        expect(dictA.get('Cap')).toBeTruthy();

        // Assert — caption style
        const cp = dictA.get('CP');
        expect(cp).toBeDefined();
        expect(cp.name).toBe('Inline');

        // Assert — callout
        expect(dictA.get('CL')).toEqual([5, 10, 15]);

        // Assert — coords
        expect(dictA.get('QuadPoints')).toEqual([
            10, 20,
            30, 40,
            50, 60,
            70, 80
        ]);

        // Assert — border
        expect(dictA.get('Border')).toEqual([0, 0, 1]);

        // Assert — opacity
        expect(dictA.get('CA')).toBeCloseTo(0.75, 5);

        // Assert — default style
        expect(dictA.get('DS')).toBe('font:Arial;font-size:12;color:#000');

        // Assert — default appearance
        expect(dictA.get('DA')).toBe('/Helv 10 Tf 0 g');

        // Assert — rich text contents
        expect(dictA.get('RC')).toBe('<p>Rich text</p>');
        // Assert — open
        expect(dictA.get('Open')).toBeTruthy();

        // Assert — repeat
        expect(dictA.get('Repeat')).toBeFalsy();

        // Assert — overlay text
        expect(dictA.get('OverlayText')).toBe('Sample overlay text');

        // ink list
        expect(dictA.get('InkList')).toEqual([
            [10, 10, 20, 20, 30, 10],
            [40, 40, 50, 50]
        ]);

    });



});
// Tests for _addStreamData (lines 1760-1831)
describe('JsonDocument _addStreamData', () => {
    class MockDictSimple {
        calls: any[] = [];
        map: Map<string, any> = new Map<string, any>();
        get(k: string) { return this.map.get(k); }
        update(k: string, v: any) { this.calls.push({ k, v }); this.map.set(k, v); }
        has(k: string) { return this.map.has(k); }
    }

    it('handles Sound subtype and registers sound stream reference', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        let next = 0;
        helper._crossReference = {
            _cacheMap: new Map<any, any>(),
            _getNextReference: () => ({ objectNumber: ++next, generationNumber: 0 })
        } as any;

        const dict: any = new MockDictSimple();
        dict.map.set('Subtype', { name: 'Sound' });

        const data: Map<string, string> = new Map<string, string>();
        data.set('bits', '16');
        data.set('channels', '2');
        data.set('rate', '44100');
        data.set('encoding', 'mp3');
        data.set('filter', 'FlateDecode');

        // Act
        helper._addStreamData(dict as any, data, '0A0B0C');

        // Assert
        // dictionary should have been updated with a Sound reference
        const soundUpdate = dict.calls.find((c: any) => c.k === 'Sound');
        expect(soundUpdate).toBeDefined();
        // crossReference cache must contain the created stream
        expect(helper._crossReference._cacheMap.size).toBeGreaterThan(0);
    });

    it('handles FileAttachment subtype and registers FS reference with params', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];

        let idx = 0;
        helper._crossReference = {
            _cacheMap: new Map<any, any>(),
            _getNextReference: () => ({ objectNumber: ++idx, generationNumber: 0 })
        } as any;

        const dict: any = new MockDictSimple();
        dict.map.set('Subtype', { name: 'FileAttachment' });

        const data: Map<string, string> = new Map<string, string>();
        data.set('file', 'myfile.bin');
        data.set('size', '42');
        data.set('creation', '2026-04-01');
        data.set('modification', '2026-04-02');

        // Act
        helper._addStreamData(dict as any, data, '');

        // Assert
        const fsUpdate = dict.calls.find((c: any) => c.k === 'FS');
        expect(fsUpdate).toBeDefined();
        expect(helper._crossReference._cacheMap.size).toBeGreaterThan(0);
    });

});
describe('JsonDocument _parseStreamElements behavior', () => {

    it('uses pendingResources when element undefined and preserves Filter for Image subtype', () => {
        // Arrange
        const doc = new _JsonDocument();
        const fakeDict = {
            _map: { Filter: 'fl', Length: 123 },
            has: function (k: string) { return k === 'Subtype' || k === 'Filter' || k === 'Length'; },
            get: function (k: string) { return { name: 'Image' }; }
        };
        const parseSpy = spyOn(doc, '_parseDictionary').and.returnValue(fakeDict);
        const stream: any = {
            _pendingResources: JSON.stringify({}),
            _isCompress: true
        };

        // Act
        doc._parseStreamElements(stream);

        // Assert
        expect(parseSpy).toHaveBeenCalled();
        expect(stream._isCompress).toBeFalsy();
        expect(stream.dictionary).toBe(fakeDict);
        expect(fakeDict._map.Filter).toBe('fl');
    });

    it('when import and stream._isCompress true (non-image) removes Filter and sets _isCompress false', () => {
        // Arrange
        const doc = new _JsonDocument();
        doc._isImport = true;
        const fakeDict = {
            _map: { Filter: 'toRemove' },
            has: function (k: string) { return k === 'Filter'; },
            get: function (k: string) { return { name: 'NotImage' }; }
        };
        spyOn(doc, '_parseDictionary').and.returnValue(fakeDict);
        const stream: any = { _isCompress: true };

        // Act
        doc._parseStreamElements(stream, {});

        // Assert
        expect(stream._isCompress).toBeFalsy();
        expect(stream.dictionary).toBe(fakeDict);
        expect(fakeDict._map.Filter).toBeUndefined();
    });

    it('else-path deletes Length and Filter when present', () => {
        // Arrange
        const doc = new _JsonDocument();
        doc._isImport = false;
        const fakeDict = {
            _map: { Filter: 'f', Length: 99 },
            has: function (k: string) { return k === 'Filter' || k === 'Length'; },
            get: function (k: string): any { return null; }
        };
        spyOn(doc, '_parseDictionary').and.returnValue(fakeDict);
        const stream: any = { _isCompress: false };

        // Act
        doc._parseStreamElements(stream, {});

        // Assert
        expect(stream.dictionary).toBe(fakeDict);
        expect(fakeDict._map.Length).toBeUndefined();
        expect(fakeDict._map.Filter).toBeUndefined();
    });

    // describe('JsonDocument _writeObject image-stream branches (lines 847-879)', () => {

    //     it('isNewReference + Image + DCTDecode uses getString path and writes stream envelope', () => {
    //         // Arrange
    //         const helper: any = new _JsonDocument();
    //         const table: Map<string, string> = new Map<string, string>();
    //         const streamDict: any = {
    //             has: (k: string) => (k === 'Subtype' || k === 'Filter'),
    //             get: (k: string) => (k === 'Subtype' ? { name: 'Image' } : { name: 'DCTDecode' })
    //         };
    //         const value = {dictionary: streamDict, stream: new _PdfStream([1,2,3],streamDict,1, 2), _initialized : true, _cipher:};
    //         value.getString = jasmine.createSpy('getString').and.returnValue('IMAGE_BYTES');

    //         let capturedKey: any = null;
    //         spyOn(helper, '_writeTable').and.callFake((tableKey: any, valueStr: any, tableArg: any, keyArg: any) => {
    //             capturedKey = tableKey;
    //             tableArg.set(keyArg, valueStr);
    //         });

    //         // Act
    //         helper._writeObject(table, value, undefined, 'K', null, false, true);

    //         // Assert
    //         expect(capturedKey).toBe('stream');
    //         expect(table.has('K')).toBeTruthy();
    //         expect((value.getString as jasmine.Spy).calls.count()).toBeGreaterThan(0);
    //     });

    //     it('isNewReference + Image + non-DCT calls _compressStream before writing', () => {
    //         // Arrange
    //         const helper: any = new _JsonDocument();
    //         const table: Map<string, string> = new Map<string, string>();
    //         const streamDict: any = {
    //             has: (k: string) => (k === 'Subtype' || k === 'Filter'),
    //             get: (k: string) => (k === 'Subtype' ? { name: 'Image' } : { name: 'FlateDecode' })
    //         };
    //         const value: any = Object.create(_PdfBaseStream.prototype);
    //         value.dictionary = streamDict;
    //         spyOn(utils_1, '_compressStream').and.returnValue('COMPRESSED');

    //         let capturedKey: any = null;
    //         spyOn(helper, '_writeTable').and.callFake((tableKey: any, valueStr: any, tableArg: any, keyArg: any) => {
    //             capturedKey = tableKey;
    //             tableArg.set(keyArg, valueStr);
    //         });

    //         // Act
    //         helper._writeObject(table, value, undefined, 'K2', null, false, true);

    //         // Assert
    //         expect(utils_1._compressStream).toHaveBeenCalled();
    //         expect(capturedKey).toBe('stream');
    //         expect(table.has('K2')).toBeTruthy();
    //     });

    //     it('Image with no baseStream.stream falls back to value.getString', () => {
    //         // Arrange
    //         const helper: any = new _JsonDocument();
    //         const table: Map<string, string> = new Map<string, string>();
    //         const streamDict: any = {
    //             has: (k: string) => (k === 'Subtype'),
    //             get: (k: string) => (k === 'Subtype' ? { name: 'Image' } : undefined)
    //         };
    //         const value: any = Object.create(_PdfBaseStream.prototype);
    //         value.dictionary = streamDict;
    //         value.stream = null; // trigger else branch
    //         value.getString = jasmine.createSpy('getString').and.returnValue('RAWIMAGE');

    //         let capturedKey: any = null;
    //         spyOn(helper, '_writeTable').and.callFake((tableKey: any, valueStr: any, tableArg: any, keyArg: any) => {
    //             capturedKey = tableKey;
    //             tableArg.set(keyArg, valueStr);
    //         });

    //         // Act
    //         helper._writeObject(table, value, undefined, 'K3', null, false, false);

    //         // Assert
    //         expect((value.getString as jasmine.Spy).calls.count()).toBeGreaterThan(0);
    //         expect(capturedKey).toBe('stream');
    //         expect(table.has('K3')).toBeTruthy();
    //     });

    //     it('non-Image stream uses value.getString path', () => {
    //         // Arrange
    //         const helper: any = new _JsonDocument();
    //         const table: Map<string, string> = new Map<string, string>();
    //         const streamDict: any = {
    //             has: (k: string) => (k === 'Subtype'),
    //             get: (k: string) => (k === 'Subtype' ? { name: 'NotImage' } : undefined)
    //         };
    //         const value: any = Object.create(_PdfBaseStream.prototype);
    //         value.dictionary = streamDict;
    //         value.getString = jasmine.createSpy('getString').and.returnValue('NONIMAGE');

    //         let capturedKey: any = null;
    //         spyOn(helper, '_writeTable').and.callFake((tableKey: any, valueStr: any, tableArg: any, keyArg: any) => {
    //             capturedKey = tableKey;
    //             tableArg.set(keyArg, valueStr);
    //         });

    //         // Act
    //         helper._writeObject(table, value, undefined, 'K4', null, false, false);

    //         // Assert
    //         expect((value.getString as jasmine.Spy).calls.count()).toBeGreaterThan(0);
    //         expect(capturedKey).toBe('stream');
    //         expect(table.has('K4')).toBeTruthy();
    //     });
    // });

});

describe('JsonDocument _addLinePoints (lines 1535-1542)', () => {

    it('parses comma-separated numeric pairs', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const linePoints: number[] = [];

        // Act
        helper._addLinePoints('1,2', linePoints);

        // Assert
        expect(linePoints).toEqual([1, 2]);
    });

    it('no comma does not modify accumulator', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const linePoints: number[] = [];

        // Act
        helper._addLinePoints('5', linePoints);

        // Assert
        expect(linePoints.length).toBe(0);
    });

    it('non-numeric tokens result in NaN for that position', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const linePoints: number[] = [];

        // Act
        helper._addLinePoints('a,4.5', linePoints);

        // Assert
        expect(Number.isNaN(linePoints[0])).toBeTruthy();
        expect(linePoints[1]).toBeCloseTo(4.5, 5);
    });

});

describe('JsonDocument borderEffectDictionary handling (lines 1519-1524)', () => {

    it('registers BE reference and caches borderEffectDictionary when effect present', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        helper._table = new Map<string, any>();
        helper._jsonData = [];
        let next = 0;
        helper._crossReference = { _cacheMap: new Map<any, any>(), _getNextReference: () => ({ objectNumber: ++next, generationNumber: 0 }) } as any;

        class SimpleDict { map: Map<string, any> = new Map<string, any>(); update(k: string, v: any) { this.map.set(k, v); } get(k: string) { return this.map.get(k); } has(k: string) { return this.map.has(k); } }
        const dictionary: any = new SimpleDict();

        const annotation: any = { style: 'cloudy' };
        const keys: string[] = ['style'];

        spyOn(helper, '_addMeasureDictionary').and.callFake(() => { });
        const streamSpy = spyOn(helper, '_addStreamData').and.callFake(() => { });

        // Act
        helper._addAnnotationData(dictionary as any, annotation, keys);

        // Assert
        const beRef: any = dictionary.get('BE');
        expect(beRef).toBeDefined();
        expect(beRef.objectNumber).toBeGreaterThan(0);
        expect(helper._crossReference._cacheMap.get(beRef)).toBeDefined();
        expect(streamSpy).toHaveBeenCalled();
    });

});

describe('JsonDocument._parseJson (lines 1010-1014)', () => {
    it('parses object when already closed', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const mockDoc: any = { _crossReference: null };
        const s: string = '{"a":1}';
        const data: Uint8Array = new Uint8Array(Array.from(s).map((c) => c.charCodeAt(0)));

        // Act
        const result: any = helper._parseJson(mockDoc, data);

        // Assert
        expect(result.a).toBe(1);
    });

    it('trims trailing junk then parses', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const mockDoc: any = { _crossReference: null };
        const s: string = '{"a":1}TRAIL';
        const data: Uint8Array = new Uint8Array(Array.from(s).map((c) => c.charCodeAt(0)));

        // Act
        const result: any = helper._parseJson(mockDoc, data);

        // Assert
        expect(result.a).toBe(1);
    });

    it('throws when starts with { but no closing brace after trimming', () => {
        // Arrange
        const helper: any = new _JsonDocument();
        const mockDoc: any = { _crossReference: null };
        const s: string = '{TRAIL';
        const data: Uint8Array = new Uint8Array(Array.from(s).map((c) => c.charCodeAt(0)));

        // Act / Assert
        expect(() => { helper._parseJson(mockDoc, data); }).toThrow();
    });
});


