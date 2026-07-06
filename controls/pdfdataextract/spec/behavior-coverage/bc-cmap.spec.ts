
import {
    _isCommand,
    _PdfCommand,
    _PdfDecryptStream,
    _PdfName,
    _PdfLexicalOperator,
    _PdfStream,
    _PdfFlateStream
} from '@syncfusion/ej2-pdf';
import {
    _PdfCharacterMap,
    _PdfCharacterMapFactory,
    _PdfIdentityCharacterMap
} from '../../src/pdf-data-extract/core/text-extraction/cmap';
import { _PdfBinaryCharacterMapReader } from '../../src/pdf-data-extract/core/text-extraction/binary-cmap-reader';
import * as fontUtilsModule from '../../src/pdf-data-extract/core/text-extraction/font-utils';

describe('_PdfCharacterMap strict AAA coverage', () => {
    it('should initialize constructor fields for builtIn and default instances', () => {
        // Arrange

        // Act
        const defaultMap: _PdfCharacterMap = new _PdfCharacterMap();
        const builtInMap: _PdfCharacterMap = new _PdfCharacterMap(true);

        // Assert
        expect(defaultMap._codeSpaceRanges).toEqual([[], [], [], []]);
        expect(defaultMap._numberOfCodeSpaceRanges).toBe(0);
        expect(defaultMap._map).toEqual([]);
        expect(defaultMap._name).toBe('');
        expect(defaultMap._vertical).toBeFalsy();
        expect(defaultMap._useCMap).toBeNull();
        expect(defaultMap._builtInCMap).toBeFalsy();
        expect(builtInMap._builtInCMap).toBeTruthy();
    });

    it('should iterate using direct index path in _forEach when map length is small', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();
        map._map[1] = 'A';
        map._map[3] = 'B';
        const callbackSpy: jasmine.Spy = jasmine.createSpy('callback');

        // Act
        map._forEach(callbackSpy);

        // Assert
        expect(callbackSpy.calls.count()).toBe(2);
        expect(callbackSpy.calls.argsFor(0)).toEqual([1, 'A']);
        expect(callbackSpy.calls.argsFor(1)).toEqual([3, 'B']);
    });

    it('should iterate using Object.keys path in _forEach when map length is greater than 0x10000', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();
        map._map.length = 0x10001;
        map._map[70000] = 'X';
        const callbackSpy: jasmine.Spy = jasmine.createSpy('callback');

        // Act
        map._forEach(callbackSpy);

        // Assert
        expect(callbackSpy.calls.count()).toBe(1);
        expect(callbackSpy.calls.argsFor(0)).toEqual(['70000', 'X']);
    });

    it('should insert code space ranges and increment range count', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();

        // Act
        map._insertCodeSpaceRange(2, 100, 200);

        // Assert
        expect(map._codeSpaceRanges[1]).toEqual([100, 200]);
        expect(map._numberOfCodeSpaceRanges).toBe(1);
    });

    it('should map a range to destination strings and handle last-byte overflow', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();

        // Act
        map._mapRangeToDestination(1, 2, 'A' + String.fromCharCode(255));

        // Assert
        expect(map._map[1]).toBe('A' + String.fromCharCode(255));
        expect(map._map[2]).toBe('B' + String.fromCharCode(0));
    });

    it('should throw when _mapRangeToDestination exceeds the maximum range', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();
        map._maximumMapRange = 0;

        // Act / Assert
        expect(function (): void {
            map._mapRangeToDestination(1, 2, 'A');
        }).toThrowError('mapBfRange - ignoring data above _maximumMapRange.');
    });

    it('should map a range to an array and stop when the destination array ends', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();

        // Act
        map._mapRangeToArray(10, 13, ['A', 'B']);

        // Assert
        expect(map._map[10]).toBe('A');
        expect(map._map[11]).toBe('B');
        expect(map._map[12]).toBeUndefined();
        expect(map._map[13]).toBeUndefined();
    });

    it('should throw when _mapRangeToArray exceeds the maximum range', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();
        map._maximumMapRange = 0;

        // Act / Assert
        expect(function (): void {
            map._mapRangeToArray(1, 2, ['A']);
        }).toThrowError('mapBfRangeToArray - ignoring data above _maximumMapRange.');
    });

    it('should map one value, look it up and report contains correctly', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();

        // Act
        map._mapOne(5, 'Z');
        const lookupResult: void = map._lookup(5);
        const containsTrue: boolean = map._contains(5);
        const containsFalse: boolean = map._contains(6);

        // Assert
        expect(lookupResult).toBe('Z' as never);
        expect(containsTrue).toBeTruthy();
        expect(containsFalse).toBeFalsy();
    });

    it('should map character identifier ranges and throw when range exceeds maximum', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();

        // Act
        map._mapCharacterIdentifierRange(1, 3, 100);

        // Assert
        expect(map._map[1]).toBe(100);
        expect(map._map[2]).toBe(101);
        expect(map._map[3]).toBe(102);

        map._maximumMapRange = 0;

        expect(function (): void {
            map._mapCharacterIdentifierRange(1, 2, 1);
        }).toThrowError('mapCidRange - ignoring data above _maximumMapRange.');
    });


    it('should read character codes from string using code space ranges and fall back to charcode 0 length 1 when not found', () => {
        // Arrange
        const map: _PdfCharacterMap = new _PdfCharacterMap();
        map._insertCodeSpaceRange(1, 65, 90);

        const foundOut: { charcode: number; length: number } = {
            charcode: -1,
            length: -1
        };

        const notFoundOut: { charcode: number; length: number } = {
            charcode: -1,
            length: -1
        };

        // Act
        map._readCharacterCodeFromString('AZ', 0, foundOut);
        map._readCharacterCodeFromString('\u0001', 0, notFoundOut);

        // Assert
        expect(foundOut.charcode).toBe(65);
        expect(foundOut.length).toBe(1);

        expect(notFoundOut.charcode).toBe(0);
        expect(notFoundOut.length).toBe(1);
    });

});

describe('_PdfCharacterMapFactory strict AAA coverage', () => {
    function createPdfName(name: string): _PdfName {
        const value: _PdfName = Object.create(_PdfName.prototype) as _PdfName;
        Object.defineProperty(value, 'name', {
            value: name,
            writable: true,
            configurable: true
        });
        return value;
    }

    function createPdfCommand(command: string): _PdfCommand {
        const value: _PdfCommand = Object.create(_PdfCommand.prototype) as _PdfCommand;
        Object.defineProperty(value, 'command', {
            value: command,
            writable: true,
            configurable: true
        });
        return value;
    }

    function createPdfStream(): _PdfStream {
        return Object.create(_PdfStream.prototype) as _PdfStream;
    }

    function createPdfDecryptStream(): _PdfDecryptStream {
        return Object.create(_PdfDecryptStream.prototype) as _PdfDecryptStream;
    }

    function createPdfFlateStream(innerStream: object): _PdfFlateStream {
        const value: _PdfFlateStream = Object.create(_PdfFlateStream.prototype) as _PdfFlateStream;
        Object.defineProperty(value, 'stream', {
            value: innerStream,
            writable: true,
            configurable: true
        });
        return value;
    }


    it('should return undefined when _PdfFlateStream contains an unsupported inner stream', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const encoding: _PdfFlateStream = createPdfFlateStream({ marker: 'unsupported' });

        // Act
        const result: object = factory._create(
            encoding,
            jasmine.createSpy('fetchBuiltInCharacterMap'),
            undefined
        );

        // Assert
        expect(result).toBeUndefined();
    });

    it('should create built-in cmap when encoding is a _PdfName', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const encoding: _PdfName = createPdfName('Identity-H');
        const createBuiltInSpy: jasmine.Spy = spyOn(factory, '_createBuiltInCharacterMap').and.returnValue('built-in' as never);

        // Act
        const result: unknown = factory._create(
            encoding,
            jasmine.createSpy('fetchBuiltInCharacterMap'),
            undefined
        );

        // Assert
        expect(createBuiltInSpy).toHaveBeenCalledWith('Identity-H', jasmine.any(Function));
        expect(result).toBe('built-in');
    });
    it('should return undefined from _create when encoding is unsupported', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act
        const result: object = factory._create(
            { marker: 'unsupported' },
            jasmine.createSpy('fetchBuiltInCharacterMap'),
            undefined
        );

        // Assert
        expect(result).toBeUndefined();
    });

    it('should create Identity-H and Identity-V built-in maps', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act
        const identityH: _PdfIdentityCharacterMap = factory._createBuiltInCharacterMap('Identity-H', jasmine.createSpy('fetch')) as _PdfIdentityCharacterMap;
        const identityV: _PdfIdentityCharacterMap = factory._createBuiltInCharacterMap('Identity-V', jasmine.createSpy('fetch')) as _PdfIdentityCharacterMap;

        // Assert
        expect(identityH instanceof _PdfIdentityCharacterMap).toBeTruthy();
        expect(identityH._vertical).toBeFalsy();
        expect(identityV instanceof _PdfIdentityCharacterMap).toBeTruthy();
        expect(identityV._vertical).toBeTruthy();
    });

    it('should throw for unknown built-in cmap names', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act / Assert
        expect(function (): void {
            factory._createBuiltInCharacterMap('Unknown-CMap', jasmine.createSpy('fetch'));
        }).toThrowError('Unknown CMap name: Unknown-CMap');
    });

    it('should fetch compressed built-in cmap data and process it through _PdfBinaryCharacterMapReader', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const processSpy: jasmine.Spy = spyOn(_PdfBinaryCharacterMapReader.prototype, '_process').and.returnValue({ marker: 'processed-cmap' } as never);
        const fetchCharacterMapSpy: jasmine.Spy = spyOn(factory, '_fetchCharacterMap').and.returnValue({
            uint8Array: new Uint8Array([1, 2, 3]),
            isCompressed: true
        });

        // Act
        const result: object = factory._createBuiltInCharacterMap('Adobe-GB1-UCS2', jasmine.createSpy('fetchBuiltInCharacterMap'));

        // Assert
        expect(fetchCharacterMapSpy).toHaveBeenCalledWith('Adobe-GB1-UCS2');
        expect(processSpy).toHaveBeenCalled();
        expect(result).toEqual({ marker: 'processed-cmap' });
    });

    it('should fetch cmap data and decode base64 into Uint8Array', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const base64Spy: jasmine.Spy = spyOn(fontUtilsModule, '_getEncodingBase64String').and.returnValue('data:text/plain;base64,QUJD');
        const originalAtob: (data: string) => string = atob;
        const atobSpy: jasmine.Spy = spyOn(window, 'atob').and.returnValue('ABC');

        // Act
        const result: { uint8Array: Uint8Array; isCompressed: boolean } = factory._fetchCharacterMap('Adobe-GB1-UCS2');

        // Assert
        expect(base64Spy).toHaveBeenCalledWith('Adobe-GB1-UCS2');
        expect(atobSpy).toHaveBeenCalledWith('QUJD');
        expect(Array.from(result.uint8Array)).toEqual([65, 66, 67]);
        expect(result.isCompressed).toBeTruthy();

        window.atob = originalAtob;
    });

    it('should decode base64 strings using _base64ToUnSigned8Array', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const originalAtob: (data: string) => string = atob;
        const atobSpy: jasmine.Spy = spyOn(window, 'atob').and.returnValue('XYZ');

        // Act
        const result: Uint8Array = factory._base64ToUnSigned8Array('WFla');

        // Assert
        expect(atobSpy).toHaveBeenCalledWith('WFla');
        expect(Array.from(result)).toEqual([88, 89, 90]);

        window.atob = originalAtob;
    });

    it('should parse character map commands, catch lexer errors, infer embedded usecmap and extend the map', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { marker: string } = { marker: 'character-map' };
        const fetchBuiltInSpy: jasmine.Spy = jasmine.createSpy('fetchBuiltInCharacterMap');

        const objects: unknown[] = [
            createPdfName('WMode'),
            1,
            createPdfName('CMapName'),
            createPdfName('MyMap'),
            createPdfName('EmbeddedMap'),
            createPdfCommand('usecmap'),
            createPdfCommand('begincodespacerange'),
            createPdfCommand('beginbfchar'),
            createPdfCommand('begincidchar'),
            createPdfCommand('beginbfrange'),
            createPdfCommand('begincidrange'),
            'EOF'
        ];

        let objectIndex: number = 0;
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                if (objectIndex === 6) {
                    objectIndex++;
                    throw new Error('recoverable');
                }
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        const parseWritingModeSpy: jasmine.Spy = spyOn(factory, '_parseWritingMode').and.stub();
        const parseCharacterMapNameSpy: jasmine.Spy = spyOn(factory, '_parseCharacterMapName').and.stub();
        const parseCodeSpaceRangeSpy: jasmine.Spy = spyOn(factory, '_parseCodeSpaceRange').and.stub();
        const parseBaseFontCharacterSpy: jasmine.Spy = spyOn(factory, '_parseBaseFontCharacter').and.stub();
        const processCharacterMappingSpy: jasmine.Spy = spyOn(factory, '_processCharacterMapping').and.stub();
        const mapBaseFontRangeSpy: jasmine.Spy = spyOn(factory, '_mapBaseFontRange').and.stub();
        const parseCharacterIdentifierRangeSpy: jasmine.Spy = spyOn(factory, '_parseCharacterIdentifierRange').and.stub();
        const extendCMapSpy: jasmine.Spy = spyOn(factory, '_extendCMap').and.returnValue({ marker: 'extended' } as never);

        // Act
        const result: object = factory._parseCharacterMap(
            characterMap,
            lexer as unknown as _PdfLexicalOperator,
            fetchBuiltInSpy,
            undefined
        );

        // Assert
        expect(parseWritingModeSpy).toHaveBeenCalled();
        expect(parseCharacterMapNameSpy).toHaveBeenCalled();
        expect(parseCodeSpaceRangeSpy).not.toHaveBeenCalled();
        expect(parseBaseFontCharacterSpy).toHaveBeenCalled();
        expect(processCharacterMappingSpy).toHaveBeenCalled();
        expect(mapBaseFontRangeSpy).toHaveBeenCalled();
        expect(parseCharacterIdentifierRangeSpy).toHaveBeenCalled();
        expect(extendCMapSpy).toHaveBeenCalledWith(characterMap, fetchBuiltInSpy, 'EmbeddedMap');
        expect(result).toEqual({ marker: 'extended' });
    });

    it('should extend using explicit useCharacterMap when provided to _parseCharacterMap', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { marker: string } = { marker: 'character-map' };
        const fetchBuiltInSpy: jasmine.Spy = jasmine.createSpy('fetchBuiltInCharacterMap');
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };
        const extendCMapSpy: jasmine.Spy = spyOn(factory, '_extendCMap').and.returnValue({ marker: 'explicit-extended' } as never);

        // Act
        const result: object = factory._parseCharacterMap(
            characterMap,
            lexer as unknown as _PdfLexicalOperator,
            fetchBuiltInSpy,
            'ExplicitUseMap'
        );

        // Assert
        expect(extendCMapSpy).toHaveBeenCalledWith(characterMap, fetchBuiltInSpy, 'ExplicitUseMap');
        expect(result).toEqual({ marker: 'explicit-extended' });
    });

    it('should return the characterMap directly from _parseCharacterMap when no usecmap exists', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { marker: string } = { marker: 'character-map' };
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };

        // Act
        const result: object = factory._parseCharacterMap(
            characterMap,
            lexer as unknown as _PdfLexicalOperator,
            jasmine.createSpy('fetchBuiltInCharacterMap'),
            undefined
        );

        // Assert
        expect(result).toBe(characterMap);
    });

    it('should convert strings to integers', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act
        const result: number = factory._stringToInt('AB');

        // Assert
        expect(result).toBe((65 << 8) | 66);
    });

    it('should validate strings and throw for non-strings', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act / Assert
        expect(function (): void {
            factory._validateString('ok');
        }).not.toThrow();

        expect(function (): void {
            factory._validateString(10);
        }).toThrowError('Malformed CMap: expected string.');
    });

    it('should expect integers and throw for non-integers', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        // Act / Assert
        expect(function (): void {
            factory._expectInt(10);
        }).not.toThrow();

        expect(function (): void {
            factory._expectInt('10');
        }).toThrowError('Malformed CMap: expected int.');
    });

    it('should parse beginbfchar blocks and stop at endbfchar', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { _mapOne: jasmine.Spy } = {
            _mapOne: jasmine.createSpy('_mapOne')
        };

        const objects: unknown[] = [
            'A',
            'B',
            createPdfCommand('endbfchar')
        ];

        let objectIndex: number = 0;
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        // Act
        factory._parseBaseFontCharacter(characterMap, lexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(characterMap._mapOne).toHaveBeenCalledWith(65, 'B');
    });

    it('should stop beginbfchar parsing when EOF is reached', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { _mapOne: jasmine.Spy } = {
            _mapOne: jasmine.createSpy('_mapOne')
        };
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };

        // Act
        factory._parseBaseFontCharacter(characterMap, lexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(characterMap._mapOne).not.toHaveBeenCalled();
    });

    it('should parse beginbfrange with string destination, integer destination, array destination and stop on invalid object branch', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const cMap: {
            _mapRangeToDestination: jasmine.Spy;
            _mapRangeToArray: jasmine.Spy;
        } = {
            _mapRangeToDestination: jasmine.createSpy('_mapRangeToDestination'),
            _mapRangeToArray: jasmine.createSpy('_mapRangeToArray')
        };

        const objects: unknown[] = [
            'A',
            'B',
            'C',
            'D',
            'E',
            70,
            'G',
            'H',
            createPdfCommand('['),
            'X',
            'Y',
            createPdfCommand(']'),
            'I',
            'J',
            { marker: 'invalid' }
        ];

        let objectIndex: number = 0;
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        // Act
        factory._mapBaseFontRange(cMap as unknown as _PdfCharacterMap, lexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(cMap._mapRangeToDestination.calls.count()).toBe(2);
        expect(cMap._mapRangeToDestination.calls.argsFor(0)).toEqual([65, 66, 'C']);
        expect(cMap._mapRangeToDestination.calls.argsFor(1)).toEqual([68, 69, 'F']);
        expect(cMap._mapRangeToArray).toHaveBeenCalledWith(71, 72, ['X', 'Y']);
    });

    it('should return on endbfrange command and stop on EOF', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const cMap: {
            _mapRangeToDestination: jasmine.Spy;
            _mapRangeToArray: jasmine.Spy;
        } = {
            _mapRangeToDestination: jasmine.createSpy('_mapRangeToDestination'),
            _mapRangeToArray: jasmine.createSpy('_mapRangeToArray')
        };

        const endRangeLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return createPdfCommand('endbfrange');
            }
        };

        const eofLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };

        // Act
        factory._mapBaseFontRange(cMap as unknown as _PdfCharacterMap, endRangeLexer as unknown as _PdfLexicalOperator);
        factory._mapBaseFontRange(cMap as unknown as _PdfCharacterMap, eofLexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(cMap._mapRangeToDestination).not.toHaveBeenCalled();
        expect(cMap._mapRangeToArray).not.toHaveBeenCalled();
    });

    it('should process begincidchar mappings and stop on endcidchar and EOF', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { _mapOne: jasmine.Spy } = {
            _mapOne: jasmine.createSpy('_mapOne')
        };

        const objects: unknown[] = [
            'A',
            10,
            createPdfCommand('endcidchar')
        ];

        let objectIndex: number = 0;
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        // Act
        factory._processCharacterMapping(characterMap, lexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(characterMap._mapOne).toHaveBeenCalledWith(65, 10);

        const eofCharacterMap: { _mapOne: jasmine.Spy } = {
            _mapOne: jasmine.createSpy('_mapOne')
        };
        const eofLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };

        factory._processCharacterMapping(eofCharacterMap, eofLexer as unknown as _PdfLexicalOperator);
        expect(eofCharacterMap._mapOne).not.toHaveBeenCalled();
    });

    it('should parse begincidrange blocks and stop on endcidrange and EOF', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { _mapCharacterIdentifierRange: jasmine.Spy } = {
            _mapCharacterIdentifierRange: jasmine.createSpy('_mapCharacterIdentifierRange')
        };

        const objects: unknown[] = [
            'A',
            'C',
            100,
            createPdfCommand('endcidrange')
        ];

        let objectIndex: number = 0;
        const lexer: { getObj: () => unknown } = {
            getObj: function (): unknown {
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        // Act
        factory._parseCharacterIdentifierRange(characterMap, lexer);

        // Assert
        expect(characterMap._mapCharacterIdentifierRange).toHaveBeenCalledWith(65, 67, 100);

        const eofCharacterMap: { _mapCharacterIdentifierRange: jasmine.Spy } = {
            _mapCharacterIdentifierRange: jasmine.createSpy('_mapCharacterIdentifierRange')
        };
        const eofLexer: { getObj: () => unknown } = {
            getObj: function (): unknown {
                return 'EOF';
            }
        };

        factory._parseCharacterIdentifierRange(eofCharacterMap, eofLexer);
        expect(eofCharacterMap._mapCharacterIdentifierRange).not.toHaveBeenCalled();
    });

    it('should parse code space ranges and stop on endcodespacerange, EOF and invalid object branches', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { _insertCodeSpaceRange: jasmine.Spy } = {
            _insertCodeSpaceRange: jasmine.createSpy('_insertCodeSpaceRange')
        };

        const objects: unknown[] = [
            'A',
            'B',
            createPdfCommand('endcodespacerange')
        ];

        let objectIndex: number = 0;
        const lexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                const value: unknown = objects[objectIndex];
                objectIndex++;
                return value;
            }
        };

        // Act
        factory._parseCodeSpaceRange(characterMap as unknown as _PdfCharacterMap, lexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(characterMap._insertCodeSpaceRange).toHaveBeenCalledWith(1, 65, 66);

        const invalidFirstLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 10;
            }
        };

        factory._parseCodeSpaceRange(characterMap as unknown as _PdfCharacterMap, invalidFirstLexer as unknown as _PdfLexicalOperator);

        const invalidSecondObjects: unknown[] = ['A', 10];
        let invalidSecondIndex: number = 0;
        const invalidSecondLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                const value: unknown = invalidSecondObjects[invalidSecondIndex];
                invalidSecondIndex++;
                return value;
            }
        };

        factory._parseCodeSpaceRange(characterMap as unknown as _PdfCharacterMap, invalidSecondLexer as unknown as _PdfLexicalOperator);

        const eofLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'EOF';
            }
        };

        factory._parseCodeSpaceRange(characterMap as unknown as _PdfCharacterMap, eofLexer as unknown as _PdfLexicalOperator);
    });

    it('should parse writing mode only when the next token is an integer', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const cMap: { vertical: number } = {
            vertical: 0
        };

        const integerLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 1;
            }
        };

        const nonIntegerLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'not-int';
            }
        };

        // Act
        factory._parseWritingMode(cMap, integerLexer as unknown as _PdfLexicalOperator);
        factory._parseWritingMode(cMap, nonIntegerLexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(cMap.vertical).toBe(1);
    });

    it('should parse character map name only when the next token is a _PdfName', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const characterMap: { name: string } = {
            name: ''
        };

        const nameLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return createPdfName('MyCMap');
            }
        };

        const nonNameLexer: { getObject: () => unknown } = {
            getObject: function (): unknown {
                return 'not-name';
            }
        };

        // Act
        factory._parseCharacterMapName(characterMap, nameLexer as unknown as _PdfLexicalOperator);
        factory._parseCharacterMapName(characterMap, nonNameLexer as unknown as _PdfLexicalOperator);

        // Assert
        expect(characterMap.name).toBe('MyCMap');
    });

    it('should extend a cmap, copy codespace ranges when empty and only map missing keys', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();

        const useCMap: {
            codespaceRanges: number[][];
            numCodespaceRanges: number;
            forEach: (callback: (key: number, value: string) => void) => void;
            lookup: (key: number) => string;
        } = {
            codespaceRanges: [[1, 2], [3, 4], [], []],
            numCodespaceRanges: 2,
            forEach: function (callback: (key: number, value: string) => void): void {
                callback(1, 'A');
                callback(2, 'B');
            },
            lookup: function (key: number): string {
                if (key === 1) {
                    return 'UseA';
                }
                return 'UseB';
            }
        };

        const characterMap: {
            useCMap: object;
            numCodespaceRanges: number;
            codespaceRanges: number[][];
            _contains: jasmine.Spy;
            _mapOne: jasmine.Spy;
        } = {
            useCMap: undefined as unknown as object,
            numCodespaceRanges: 0,
            codespaceRanges: [[], [], [], []],
            _contains: jasmine.createSpy('_contains').and.callFake(function (key: number): boolean {
                return key === 1;
            }),
            _mapOne: jasmine.createSpy('_mapOne')
        };

        const createBuiltInSpy: jasmine.Spy = spyOn(factory, '_createBuiltInCharacterMap').and.returnValue(useCMap as never);

        // Act
        const result: object = factory._extendCMap(
            characterMap,
            jasmine.createSpy('fetchBuiltInCMap'),
            'UseMap'
        );

        // Assert
        expect(createBuiltInSpy).toHaveBeenCalledWith('UseMap', jasmine.any(Function));
        expect(characterMap.useCMap).toBe(useCMap as never);
        expect(characterMap.codespaceRanges[0]).toEqual([1, 2]);
        expect(characterMap.codespaceRanges[1]).toEqual([3, 4]);
        expect(characterMap.numCodespaceRanges).toBe(2);
        expect(characterMap._mapOne.calls.count()).toBe(1);
        expect(characterMap._mapOne).toHaveBeenCalledWith(2, 'UseB');
        expect(result).toBe(characterMap as never);
    });
});

describe('_PdfIdentityCharacterMap strict AAA coverage', () => {
    it('should initialize identity maps and insert code space range in constructor', () => {
        // Arrange

        // Act
        const horizontalMap: _PdfIdentityCharacterMap = new _PdfIdentityCharacterMap(false, 2);
        const verticalMap: _PdfIdentityCharacterMap = new _PdfIdentityCharacterMap(true, 2);

        // Assert
        expect(horizontalMap._vertical).toBeFalsy();
        expect(horizontalMap._codeSpaceRanges[1]).toEqual([0, 0xffff]);
        expect(horizontalMap._numberOfCodeSpaceRanges).toBe(1);

        expect(verticalMap._vertical).toBeTruthy();
        expect(verticalMap._codeSpaceRanges[1]).toEqual([0, 0xffff]);
        expect(verticalMap._numberOfCodeSpaceRanges).toBe(1);
    });

    it('should insert code space range in the requested slot', () => {
        // Arrange
        const map: _PdfIdentityCharacterMap = new _PdfIdentityCharacterMap(false, 1);

        // Act
        map._insertCodeSpaceRange(3, 10, 20);

        // Assert
        expect(map._codeSpaceRanges[2]).toEqual([10, 20]);
        expect(map._numberOfCodeSpaceRanges).toBe(2);
    });

    it('should lookup, contains and charCodeOf only for valid 16-bit integers', () => {
        // Arrange
        const map: _PdfIdentityCharacterMap = new _PdfIdentityCharacterMap(false, 2);

        // Act
        const validLookup: number = map._lookup(100) as number;
        const invalidLookup: number = map._lookup(70000) as number;
        const containsValid: boolean = map._contains(200);
        const containsInvalid: boolean = map._contains(70000);
        const validCharCode: number = map._charCodeOf(300);
        const invalidCharCode: number = map._charCodeOf(70000);

        // Assert
        expect(validLookup).toBe(100);
        expect(invalidLookup).toBeUndefined();
        expect(containsValid).toBeTruthy();
        expect(containsInvalid).toBeFalsy();
        expect(validCharCode).toBe(300);
        expect(invalidCharCode).toBe(-1);
    });

    it('should iterate through the entire 16-bit range in _forEach', () => {
        // Arrange
        const map: _PdfIdentityCharacterMap = new _PdfIdentityCharacterMap(false, 2);
        let count: number = 0;
        let firstKey: number = -1;
        let firstValue: number = -1;
        let lastKey: number = -1;
        let lastValue: number = -1;

        // Act
        map._forEach(function (key: number, value: number): void {
            if (count === 0) {
                firstKey = key;
                firstValue = value;
            }
            lastKey = key;
            lastValue = value;
            count++;
        });

        // Assert
        expect(count).toBe(0x10000);
        expect(firstKey).toBe(0);
        expect(firstValue).toBe(0);
        expect(lastKey).toBe(0xffff);
        expect(lastValue).toBe(0xffff);
    });
});

describe('_PdfCharacterMapFactory highlighted 4-line coverage', () => {
    function createPdfStream(): _PdfStream {
        return Object.create(_PdfStream.prototype) as _PdfStream;
    }
    it('should cover the highlighted compressed built-in callback return and return _extendCMap result', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const fetchBuiltInCharacterMapSpy: jasmine.Spy = jasmine.createSpy('fetchBuiltInCharacterMap');

        const fetchCharacterMapSpy: jasmine.Spy = spyOn(factory, '_fetchCharacterMap').and.returnValue({
            uint8Array: new Uint8Array([1, 2, 3]),
            isCompressed: true
        });

        const extendCMapSpy: jasmine.Spy = spyOn(factory, '_extendCMap').and.returnValue({ marker: 'extended-cmap' } as never);

        const processSpy: jasmine.Spy = spyOn(_PdfBinaryCharacterMapReader.prototype, '_process').and.callFake(function (
            uint8ArrayValue: Uint8Array,
            cMapValue: object,
            enhance: (useCMap: string) => object
        ): object {
            return enhance('Adobe-GB1-UCS2');
        });

        // Act
        const result: unknown = factory._createBuiltInCharacterMap(
            'Adobe-GB1-UCS2',
            fetchBuiltInCharacterMapSpy
        );

        // Assert
        expect(fetchCharacterMapSpy).toHaveBeenCalledWith('Adobe-GB1-UCS2');
        expect(processSpy).toHaveBeenCalled();
        expect(extendCMapSpy).toHaveBeenCalled();
        expect(extendCMapSpy.calls.argsFor(0)[1]).toBe(fetchBuiltInCharacterMapSpy);
        expect(extendCMapSpy.calls.argsFor(0)[2]).toBe('Adobe-GB1-UCS2');
        expect(result).toEqual({ marker: 'extended-cmap' });
    });
});

import * as ej2PdfModule from '@syncfusion/ej2-pdf';
describe('_PdfCharacterMapFactory highlighted 4-line coverage', () => {
    function createPdfStream(): _PdfStream {
        return Object.create(_PdfStream.prototype) as _PdfStream;
    }

    function createPdfDecryptStream(): _PdfDecryptStream {
        return Object.create(_PdfDecryptStream.prototype) as _PdfDecryptStream;
    }

    function createPdfFlateStream(innerStream: object): _PdfFlateStream {
        const value: _PdfFlateStream = Object.create(_PdfFlateStream.prototype) as _PdfFlateStream;
        Object.defineProperty(value, 'stream', {
            value: innerStream,
            writable: true,
            configurable: true
        });
        return value;
    }

    function createPdfName(name: string): _PdfName {
        const value: _PdfName = Object.create(_PdfName.prototype) as _PdfName;
        Object.defineProperty(value, 'name', {
            value: name,
            writable: true,
            configurable: true
        });
        return value;
    }

    it('should cover the highlighted direct _PdfStream branch and return parsedCharacterMap', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const encoding: _PdfStream = createPdfStream();
        const fetchBuiltInCharacterMapSpy: jasmine.Spy = jasmine.createSpy('fetchBuiltInCharacterMap');

        const lexicalOperatorSpy: jasmine.Spy = spyOn(
            ej2PdfModule as unknown as {
                _PdfLexicalOperator: (stream: object) => object;
            },
            '_PdfLexicalOperator'
        ).and.returnValue({ marker: 'fake-lexer' } as never);

        const parseCharacterMapSpy: jasmine.Spy = spyOn(factory, '_parseCharacterMap').and.returnValue('parsed-direct-stream' as never);

        // Act
        const result: unknown = factory._create(
            encoding,
            fetchBuiltInCharacterMapSpy,
            undefined
        );

        // Assert
        expect(lexicalOperatorSpy).toHaveBeenCalledWith(encoding);
        expect(parseCharacterMapSpy).toHaveBeenCalled();
        expect(result).toBe('parsed-direct-stream');
    });

    it('should cover the highlighted compressed built-in callback return and return _extendCMap result', () => {
        // Arrange
        const factory: _PdfCharacterMapFactory = new _PdfCharacterMapFactory();
        const fetchBuiltInCharacterMapSpy: jasmine.Spy = jasmine.createSpy('fetchBuiltInCharacterMap');

        const fetchCharacterMapSpy: jasmine.Spy = spyOn(factory, '_fetchCharacterMap').and.returnValue({
            uint8Array: new Uint8Array([1, 2, 3]),
            isCompressed: true
        });

        const extendCMapSpy: jasmine.Spy = spyOn(factory, '_extendCMap').and.returnValue({ marker: 'extended-cmap' } as never);

        const processSpy: jasmine.Spy = spyOn(_PdfBinaryCharacterMapReader.prototype, '_process').and.callFake(function (
            uint8ArrayValue: Uint8Array,
            cMapValue: object,
            enhance: (useCMap: string) => object
        ): object {
            return enhance('Adobe-GB1-UCS2');
        });

        // Act
        const result: unknown = factory._createBuiltInCharacterMap(
            'Adobe-GB1-UCS2',
            fetchBuiltInCharacterMapSpy
        );

        // Assert
        expect(fetchCharacterMapSpy).toHaveBeenCalledWith('Adobe-GB1-UCS2');
        expect(processSpy).toHaveBeenCalled();
        expect(extendCMapSpy).toHaveBeenCalled();
        expect(extendCMapSpy.calls.argsFor(0)[1]).toBe(fetchBuiltInCharacterMapSpy);
        expect(extendCMapSpy.calls.argsFor(0)[2]).toBe('Adobe-GB1-UCS2');
        expect(result).toEqual({ marker: 'extended-cmap' });
    });
});
