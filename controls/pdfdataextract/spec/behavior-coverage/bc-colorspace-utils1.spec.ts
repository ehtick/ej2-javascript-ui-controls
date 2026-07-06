
import { _PdfCrossReference, _PdfDictionary, _PdfName, _PdfReference } from '@syncfusion/ej2-pdf';
import {
    _PdfAlternateCS,
    _PdfCalGrayCS,
    _PdfColorRgbConverter,
    _PdfDeviceCmykCS,
    _PdfDeviceGrayCS,
    _PdfDeviceRgbaCS,
    _PdfDeviceRgbCS,
    _PdfIndexedCS,
    _PdfLabCS,
    _PdfPatternCS
} from '../../src/pdf-data-extract/core/image-extraction/colorspace';
import { _PdfIccColorSpace } from '../../src/pdf-data-extract/core/image-extraction/icc-based-colorspace';
import { _PdfColorSpaceUtils } from '../../src/pdf-data-extract/core/image-extraction/colorspace-utils';

class _MockCache {
    private _map: Map<unknown, unknown> = new Map<unknown, unknown>();

    get(key: unknown): unknown {
        return this._map.get(key);
    }

    set(_name: unknown, key: unknown, value: unknown): void {
        this._map.set(key, value);
    }
}

function _createReference(objectNumber: number = 1): _PdfReference {
    const ref: _PdfReference & { objectNumber?: number; generationNumber?: number } =
        Object.create(_PdfReference.prototype) as _PdfReference & { objectNumber?: number; generationNumber?: number };
    ref.objectNumber = objectNumber;
    ref.generationNumber = 0;
    return ref as _PdfReference;
}

function _createDictionary(
    values: { [key: string]: unknown },
    rawValues?: { [key: string]: unknown }
): _PdfDictionary {
    const actualRawValues: { [key: string]: unknown } = rawValues ? rawValues : values;

    const dictionary: _PdfDictionary & {
        _values?: Map<string, unknown>;
        _rawValues?: Map<string, unknown>;
    } = Object.create(_PdfDictionary.prototype) as _PdfDictionary & {
        _values?: Map<string, unknown>;
        _rawValues?: Map<string, unknown>;
    };

    dictionary._values = new Map<string, unknown>();
    dictionary._rawValues = new Map<string, unknown>();

    for (const key in values) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
            dictionary._values.set(key, values[key]);
        }
    }

    for (const key in actualRawValues) {
        if (Object.prototype.hasOwnProperty.call(actualRawValues, key)) {
            dictionary._rawValues.set(key, actualRawValues[key]);
        }
    }

    (dictionary as unknown as {
        get: (...keys: string[]) => unknown;
    }).get = (...keys: string[]): unknown => {
        for (let i: number = 0; i < keys.length; i++) {
            if (dictionary._values.has(keys[i])) {
                return dictionary._values.get(keys[i]);
            }
        }
        return undefined;
    };

    (dictionary as unknown as {
        getRaw: (...keys: string[]) => unknown;
    }).getRaw = (...keys: string[]): unknown => {
        for (let i: number = 0; i < keys.length; i++) {
            if (dictionary._rawValues.has(keys[i])) {
                return dictionary._rawValues.get(keys[i]);
            }
        }
        return undefined;
    };

    (dictionary as unknown as {
        getArray: (...keys: string[]) => number[] | null;
    }).getArray = (...keys: string[]): number[] | null => {
        for (let i: number = 0; i < keys.length; i++) {
            if (dictionary._values.has(keys[i])) {
                return dictionary._values.get(keys[i]) as number[];
            }
        }
        return null;
    };

    return dictionary as _PdfDictionary;
}

describe('_PdfColorSpaceUtils highlighted line coverage', () => {
    it('should cover _parse with reference cache-hit and cache-miss branches', async () => {
        // Arrange
        const utils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({ applicationPlatform: 'typescript' });
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;

        const refCached: _PdfReference = _createReference(10);
        const refMiss: _PdfReference = _createReference(20);

        const globalCache: _MockCache = new _MockCache();
        const localCache: _MockCache = new _MockCache();

        const cachedColorSpace: _PdfDeviceRgbCS = new _PdfDeviceRgbCS();
        globalCache.set(null, refCached, cachedColorSpace);

        const parseColorspaceSpy: jasmine.Spy = spyOn(utils, '_parseColorspace').and.returnValue(
            Promise.resolve(new _PdfDeviceGrayCS())
        );

        (xref as unknown as { _fetch: jasmine.Spy })._fetch.and.returnValue(_PdfName.get('DeviceGray'));

        // Act
        const cachedResult: unknown = await utils._parse(
            refCached,
            xref,
            null,
            null,
            globalCache,
            localCache,
            false
        );

        const uncachedResult: unknown = await utils._parse(
            refMiss,
            xref,
            null,
            null,
            globalCache,
            localCache,
            true
        );

        // Assert
        expect(cachedResult).toBe(cachedColorSpace);
        expect(parseColorspaceSpy).toHaveBeenCalled();
        expect((xref as unknown as { _fetch: jasmine.Spy })._fetch).toHaveBeenCalledWith(refMiss);
        expect(uncachedResult instanceof _PdfDeviceGrayCS).toBeTruthy();
    });

    it('should cover _subParse cached and global cache set branch', async () => {
        // Arrange
        const utils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({ applicationPlatform: 'typescript' });
        const globalCache: _MockCache = new _MockCache();
        const refCached: _PdfReference = _createReference(1);
        const refMiss: _PdfReference = _createReference(2);

        const cachedColorSpace: _PdfDeviceGrayCS = new _PdfDeviceGrayCS();
        globalCache.set(null, refCached, cachedColorSpace);

        const parseColorspaceSpy: jasmine.Spy = spyOn(utils, '_parseColorspace').and.returnValue(
            Promise.resolve(new _PdfDeviceRgbCS())
        );

        // Act
        const cachedResult: unknown = await utils._subParse(refCached, { globalColorSpaceCache: globalCache });
        const uncachedResult: unknown = await utils._subParse(refMiss, { globalColorSpaceCache: globalCache });

        // Assert
        expect(cachedResult).toBe(cachedColorSpace);
        expect(uncachedResult instanceof _PdfDeviceRgbCS).toBeTruthy();
        expect(parseColorspaceSpy).toHaveBeenCalled();
        expect(globalCache.get(refMiss) instanceof _PdfDeviceRgbCS).toBeTruthy();
    });

    it('should cover named color spaces, resource dictionary recursive and non-name fallback branches', async () => {
        // Arrange
        const utils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({ applicationPlatform: 'typescript' });
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;

        const nestedDictionary: _PdfDictionary = _createDictionary({
            AliasName: _PdfName.get('DeviceRGB'),
            AliasArray: [_PdfName.get('Pattern')]
        });

        const resources: _PdfDictionary = _createDictionary({
            ColorSpace: nestedDictionary
        });

        // Act
        const grayResult: unknown = await utils._parseColorspace(_PdfName.get('DeviceGray'), {
            xref,
            resources: null
        });

        const rgbResult: unknown = await utils._parseColorspace(_PdfName.get('DeviceRGB'), {
            xref,
            resources: null
        });

        const rgbaResult: unknown = await utils._parseColorspace(_PdfName.get('DeviceRGBA'), {
            xref,
            resources: null
        });

        const cmykResult: unknown = await utils._parseColorspace(_PdfName.get('DeviceCMYK'), {
            xref,
            resources: null
        });

        const patternResult: unknown = await utils._parseColorspace(_PdfName.get('Pattern'), {
            xref,
            resources: null
        });

        const aliasNameResult: unknown = await utils._parseColorspace(_PdfName.get('AliasName'), {
            xref,
            resources
        });

        const aliasArrayResult: unknown = await utils._parseColorspace(_PdfName.get('AliasArray'), {
            xref,
            resources
        });

        const unknownResult: unknown = await utils._parseColorspace(_PdfName.get('UnknownColorSpace'), {
            xref,
            resources: null
        });

        // Assert
        expect(grayResult instanceof _PdfDeviceGrayCS).toBeTruthy();
        expect(rgbResult instanceof _PdfDeviceRgbCS).toBeTruthy();
        expect(rgbaResult instanceof _PdfDeviceRgbaCS).toBeTruthy();
        expect(cmykResult instanceof _PdfDeviceCmykCS).toBeTruthy();
        expect(patternResult instanceof _PdfPatternCS).toBeTruthy();

        // resourcesCS instanceof _PdfName recursive branch
        expect(aliasNameResult instanceof _PdfDeviceRgbCS).toBeTruthy();

        // resourcesCS non-name branch => cs = resourcesCS; break; then array parse path
        expect(aliasArrayResult instanceof _PdfPatternCS).toBeTruthy();

        // default fallback
        expect(unknownResult instanceof _PdfDeviceGrayCS).toBeTruthy();
    });

    it('should cover highlighted array-mode G, RGB and CMYK branches', async () => {
        // Arrange
        const utils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({ applicationPlatform: 'typescript' });
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => arg)
        } as unknown as _PdfCrossReference;

        // Act
        const grayResult: unknown = await utils._parseColorspace([_PdfName.get('G')], {
            xref,
            resources: null
        });

        const rgbResult: unknown = await utils._parseColorspace([_PdfName.get('RGB')], {
            xref,
            resources: null
        });

        const cmykResult: unknown = await utils._parseColorspace([_PdfName.get('CMYK')], {
            xref,
            resources: null
        });

        // Assert
        expect(grayResult instanceof _PdfDeviceGrayCS).toBeTruthy();
        expect(rgbResult instanceof _PdfDeviceRgbCS).toBeTruthy();
        expect(cmykResult instanceof _PdfDeviceCmykCS).toBeTruthy();
    });

    it('should cover highlighted ICCBased usable, unusable-continue and alternate-return branches', async () => {
        // Arrange
        const callback: { applicationPlatform: string } = { applicationPlatform: 'typescript' };

        const usableUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const alternateUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);

        const usableRef: _PdfReference = _createReference(101);
        const alternateRef: _PdfReference = _createReference(102);

        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');

        const usableStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 3 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([1, 2, 3]))
        };

        const alternateStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 3 }, { Alternate: alternateRaw }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([4, 5, 6]))
        };

        const usableXref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (arg === usableRef) {
                    return usableStream;
                }
                return arg;
            })
        } as unknown as _PdfCrossReference;

        const alternateXref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (arg === alternateRef) {
                    return alternateStream;
                }
                return arg;
            })
        } as unknown as _PdfCrossReference;

        const initializeSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.callFake(async function (
            this: _PdfIccColorSpace
        ): Promise<void> {
            (this as unknown as { _isUsable: boolean })._isUsable = true;
        });

        const createSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_create').and.callFake(async function (): Promise<void> {
            return;
        });

        // Act 1: usable ICC branch
        const usableResult: unknown = await usableUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            usableRef
        ], {
            xref: usableXref,
            resources: null
        });

        // Reconfigure for unusable/alternate branch
        initializeSpy.and.callFake(async function (): Promise<void> {
            throw new Error('ICC failure');
        });

        const alternateSubParseSpy: jasmine.Spy = spyOn(alternateUtils, '_subParse').and.returnValue(
            Promise.resolve({ numComps: 3, marker: 'alternate-match' })
        );

        // Act 2: unusable branch continues, then alternate branch returns altCS
        const alternateResult: unknown = await alternateUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            alternateRef
        ], {
            xref: alternateXref,
            resources: null
        });

        // Assert
        expect(usableResult instanceof _PdfIccColorSpace).toBeTruthy();
        expect(createSpy).toHaveBeenCalled();

        expect(alternateSubParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(alternateResult).toEqual({ numComps: 3, marker: 'alternate-match' });
    });
    ``


    it('should cover ICCBased usable branch, alternate branch and numComps fallback branches', async () => {
        // Arrange
        const callback: { applicationPlatform: string } = { applicationPlatform: 'typescript' };

        const iccUsableUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const iccAlternateUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const iccFallbackGrayUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const iccFallbackRgbUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const iccFallbackCmykUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);
        const iccFallbackDefaultUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils(callback);

        const streamRefUsable: _PdfReference = _createReference(101);
        const streamRefAlternate: _PdfReference = _createReference(102);
        const streamRefGray: _PdfReference = _createReference(103);
        const streamRefRgb: _PdfReference = _createReference(104);
        const streamRefCmyk: _PdfReference = _createReference(105);
        const streamRefDefault: _PdfReference = _createReference(106);

        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');

        const usableStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 3 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([1, 2, 3]))
        };

        const alternateStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 3 }, { Alternate: alternateRaw }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([4, 5, 6]))
        };

        const grayStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 1 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([7]))
        };

        const rgbStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 3 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([8]))
        };

        const cmykStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 4 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([9]))
        };

        const defaultStream: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: _createDictionary({ N: 2 }),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([10]))
        };

        const createXref = (streamMap: Map<_PdfReference, unknown>): _PdfCrossReference => {
            return {
                _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                    return streamMap.get(arg as _PdfReference);
                })
            } as unknown as _PdfCrossReference;
        };

        const usableXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefUsable, usableStream]]));
        const alternateXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefAlternate, alternateStream]]));
        const grayXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefGray, grayStream]]));
        const rgbXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefRgb, rgbStream]]));
        const cmykXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefCmyk, cmykStream]]));
        const defaultXref: _PdfCrossReference = createXref(new Map<_PdfReference, unknown>([[streamRefDefault, defaultStream]]));

        const initializeSpyUsable: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.callFake(async function (
            this: _PdfIccColorSpace
        ): Promise<void> {
            (this as unknown as { _isUsable: boolean })._isUsable = true;
        });

        const createSpyUsable: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_create').and.callFake(async function (): Promise<void> {
            return;
        });

        // Act usable
        const usableResult: unknown = await iccUsableUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefUsable
        ], {
            xref: usableXref,
            resources: null
        });

        // Reconfigure spies for failure/alternate/fallback paths
        initializeSpyUsable.and.callFake(async function (): Promise<void> {
            throw new Error('ICC failure');
        });
        createSpyUsable.and.callFake(async function (): Promise<void> {
            return;
        });

        const alternateSubParseSpy: jasmine.Spy = spyOn(iccAlternateUtils, '_subParse').and.returnValue(
            Promise.resolve({ numComps: 3, alternate: true })
        );

        const alternateResult: unknown = await iccAlternateUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefAlternate
        ], {
            xref: alternateXref,
            resources: null
        });

        const grayResult: unknown = await iccFallbackGrayUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefGray
        ], {
            xref: grayXref,
            resources: null
        });

        const rgbResult: unknown = await iccFallbackRgbUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefRgb
        ], {
            xref: rgbXref,
            resources: null
        });

        const cmykResult: unknown = await iccFallbackCmykUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefCmyk
        ], {
            xref: cmykXref,
            resources: null
        });

        const defaultResult: unknown = await iccFallbackDefaultUtils._parseColorspace([
            _PdfName.get('ICCBased'),
            streamRefDefault
        ], {
            xref: defaultXref,
            resources: null
        });

        // Assert
        expect(usableResult instanceof _PdfIccColorSpace).toBeTruthy();
        expect(initializeSpyUsable).toHaveBeenCalled();
        expect(createSpyUsable).toHaveBeenCalled();

        expect(alternateSubParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(alternateResult).toEqual({ numComps: 3, alternate: true });

        expect(grayResult instanceof _PdfDeviceGrayCS).toBeTruthy();
        expect(rgbResult instanceof _PdfDeviceRgbCS).toBeTruthy();
        expect(cmykResult instanceof _PdfDeviceCmykCS).toBeTruthy();
        expect(defaultResult instanceof _PdfDeviceGrayCS).toBeTruthy();
    });

    it('should cover final gray fallback for unsupported array mode and lazy getters', async () => {
        // Arrange
        const utils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({ applicationPlatform: 'typescript' });
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => arg)
        } as unknown as _PdfCrossReference;

        // Act
        const unsupportedArrayResult: unknown = await utils._parseColorspace([
            _PdfName.get('UnknownArrayMode')
        ], {
            xref,
            resources: null
        });

        const grayResult: unknown = utils.gray;
        const rgbResult: unknown = utils.rgb;
        const rgbaResult: unknown = utils.rgba;
        const cmykResult: unknown = utils.cmyk;

        // Assert
        expect(unsupportedArrayResult instanceof _PdfDeviceGrayCS).toBeTruthy();

        expect(grayResult instanceof _PdfDeviceGrayCS).toBeTruthy();
        expect(rgbResult instanceof _PdfDeviceRgbCS).toBeTruthy();
        expect(rgbaResult instanceof _PdfDeviceRgbaCS).toBeTruthy();
        expect(cmykResult instanceof _PdfDeviceCmykCS).toBeTruthy();

        // Confirm lazy property returns same stored instance after first access
        expect(utils.gray).toBe(grayResult);
        expect(utils.rgb).toBe(rgbResult);
        expect(utils.rgba).toBe(rgbaResult);
        expect(utils.cmyk).toBe(cmykResult);
    });
});
