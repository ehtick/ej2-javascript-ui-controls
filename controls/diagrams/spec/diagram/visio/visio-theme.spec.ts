import * as VisioTheme from '../../../src/diagram/load-utility/visio-import-export/visio-theme';
import {
  VisioNode,
  VarientStyle,
  FormattedColors,
  ColorEntry,
  FaceNameEntry,
  ParsedXmlObject,
  VisioRootDocument
} from '../../../src/diagram/load-utility/visio-import-export/visio-types';
import { ParsingContext } from '../../../src/diagram/load-utility/visio-import-export/visio-import-export';
import { ThemeColorElement } from '../../../src/diagram/load-utility/visio-import-export/visio-theme';
import { VisioTheme as VisioThemeModel } from '../../../src/diagram/load-utility/visio-import-export/visio-models';
import * as VisioCore from '../../../src/diagram/load-utility/visio-import-export/visio-core';
import * as VisioNodes from '../../../src/diagram/load-utility/visio-import-export/visio-nodes';

type Done = DoneFn; // Jasmine's done callback type

// Minimal style surface used by getNodeStyle in tests
type TestNodeStyle = {
  opacity: number;
  fillPattern: number;
  strokeColor?: string;
  strokeDashArray?: string;
  strokeWidth?: number;
  isGradientEnabled?: boolean;
  gradientType?: 'Linear' | 'Radial';
  gradientCoordinates?: Record<string, number>;
  gradientStops?: unknown[];
};

type NodeInputLike = VisioNode & { style: TestNodeStyle };

describe('Visio Theme', () => {
  // --- isValidColor ---------------------------------------------------------
  describe('isValidColor', () => {
    it('should return false for empty-like strings', (done: Done) => {
      expect(VisioTheme.isValidColor('')).toBe(false);
      expect(VisioTheme.isValidColor(' undefined ')).toBe(false);
      expect(VisioTheme.isValidColor(' null ')).toBe(false);
      done();
    });

    it('should reject invalid hex lengths and "Themed"', (done: Done) => {
      expect(VisioTheme.isValidColor('#12345')).toBe(false); // invalid length
      expect(VisioTheme.isValidColor('Themed')).toBe(false); // sentinel in file
      done();
    });

    it('should reject arbitrary colors for annotations (isAnnotation=true)', (done: Done) => {
      expect(VisioTheme.isValidColor('orange', true)).toBe(false);
      done();
    });

    it('should accept named colors and 8-digit hex', (done: Done) => {
      expect(VisioTheme.isValidColor('white')).toBe(true);
      expect(VisioTheme.isValidColor('#11223344')).toBe(true);
      done();
    });

    it('isValidColor rejects # with length 8 (neither 4, 7, nor 9)', () => {
      expect(VisioTheme.isValidColor('#1234567')).toBe(false);
    });
  });

  // --- Basic helpers (exported only): keep getConnectorFontType --------------
  describe('Basic helpers: exported only', () => {
    it('getConnectorFontType should clamp negative rangeIndex to 0', (done: Done) => {
      const fakeTheme: Pick<VisioThemeModel, 'connectorFont'> = {
        connectorFont: ['A', 'B', 'C'] as any
      };
      expect(Boolean(VisioTheme.getConnectorFontType(fakeTheme, -10))).toBe(true);
      done();
    });
  });

  // --- getMatrix & getHexColorByIndex ---------------------------------------
  describe('Color index helpers: getMatrix & getHexColorByIndex', () => {
    it('getMatrix should normalize STANDARD/PREMIUM ranges', (done: Done) => {
      // PREMIUM offset (200..206) -> subtract 200
      expect(VisioTheme.getMatrix(Number('202'))).toBe(2);
      // STANDARD offset (100..106) -> subtract 100
      expect(VisioTheme.getMatrix(Number('104'))).toBe(4);
      done();
    });

    it('getHexColorByIndex should fallback to default on missing/invalid color', (done: Done) => {
      const hexColors: string[] = ['#000000', 'themed', '#ABCDEF'];
      // invalid index -> default (module default is 'white')
      expect(VisioTheme.getHexColorByIndex(999, hexColors)).toBe('white');
      // invalid color in array -> default
      expect(VisioTheme.getHexColorByIndex(1, hexColors)).toBe('white');
      done();
    });

    it('normalizeRange clamps values below 1 and handles non-finite', () => {
      expect(VisioTheme.normalizeRange(0)).toBe(1);
      expect(VisioTheme.normalizeRange(2)).toBe(2);
      expect(VisioTheme.normalizeRange(Number.NaN)).toBe(1);
    });

    it('getHexColorByIndex returns default when slot is missing', () => {
      const hexColors: string[] = []; // empty array -> missing slot
      expect(VisioTheme.getHexColorByIndex(3, hexColors)).toBe('white');
    });

    it('getMatrix handles falsy non-numeric input gracefully', () => {
      const emptyAsNumber = '' as unknown as number;
      const nullAsNumber = null as unknown as number;
      expect(Number.isNaN(VisioTheme.getMatrix(emptyAsNumber))).toBe(true);
      expect(Number.isNaN(VisioTheme.getMatrix(nullAsNumber))).toBe(true);
    });
  });

  // --- VisioPropertiesManager.initialize & dispose ---------------------------
  describe('VisioPropertiesManager - initialize & dispose', () => {
    let mgr: VisioTheme.VisioPropertiesManager;

    beforeAll((): void => {
      mgr = new VisioTheme.VisioPropertiesManager();
    });

    afterAll((): void => {
      // no-op
    });

    it('initialize should early-return for falsy rootElement', (done: Done) => {
      mgr.initialize(undefined as VisioRootDocument); // should not throw
      expect(mgr.getColor(0)).toBe('#000000'); // no entries parsed, returns '' per impl
      done();
    });

    it('initialize should parse colors/fonts and warn when exceeding soft limit', (done: Done) => {
      // Read MAX_CACHE_SIZE (private) reflectively and exceed it by 1 to trigger the branch.
      const MAX = (VisioTheme.VisioPropertiesManager as unknown as { MAX_CACHE_SIZE: number }).MAX_CACHE_SIZE;
      // Build Colors with MAX entries + 1 to exceed limit
      const colorEntry: ColorEntry[] = Array.from({ length: MAX + 1 }).map((_, i) => ({
        $: { IX: String(1000 + i), RGB: '#112233' }
      }));

      const root: ParsedXmlObject = {
        Colors: { ColorEntry: colorEntry },
        FaceNames: {
          FaceName: ([
            { $: { ID: '1', Name: 'Segoe UI' } },
            { $: { ID: '', Name: '' } }
          ] as unknown as FaceNameEntry[])
        }
      };

      spyOn(console, 'warn'); // verify branch executed
      mgr.initialize(root as unknown as VisioRootDocument);
      expect(console.warn).toHaveBeenCalled();
      // Sanity check: one of our inserted colors is retrievable
      expect(mgr.getColor(1000)).toBe('#112233');
      done();
    });

    it('dispose should clear internal maps', (done: Done) => {
      mgr.dispose();
      expect(mgr.getColor(1000)).toBe(''); // cleared -> fallback '' when not found
      done();
    });

    it('VisioPropertiesManager.initialize handles missing containers and font entries with missing fields', () => {
      const m = new VisioTheme.VisioPropertiesManager();
      // No Colors; FaceNames present but entries lack complete $ fields
      const docRoot = { FaceNames: { FaceName: [{ $: { ID: '', Name: 'X' } }, { $: { ID: '2', Name: '' } }] } } as unknown as ParsedXmlObject;
      m.initialize(docRoot as unknown as VisioRootDocument);
      expect(m.getColor(0)).toBe('#000000'); // no colors parsed
      m.dispose();
    });
  });

  // --- Drive non-exported helpers via exported APIs --------------------------
  describe('Driving internal helpers via exported APIs', () => {
    it('getNodeStyle should map prstDash "sysdash" to dash array and compute width from EMUs', (done: Done) => {
      const node: NodeInputLike = { ThemeIndex: 1, style: { opacity: 0, fillPattern: 1 } as TestNodeStyle } as NodeInputLike;
      const context: ParsingContext = {
        data: {
          themes: [{}],
          currentTheme: {
            schemeEnum: 1,
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000'],
            fmtSchemeFill: [{ name: 'a:solidFill', value: { 'a:srgbClr': { $: { val: '000000' } } } }],
            // Supply a stroke with a:prstDash='sysdash' and w to hit emuToInches branch too
            fmtSchemeStroke: [{
              value: {
                $: { w: String(914400) }, // 1 inch in EMUs
                'a:prstDash': { $: { val: 'sysdash' } },
                'a:solidFill': { 'a:srgbClr': { $: { val: '000000' } } }
              }
            }]
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.getNodeStyle(node as any, context, /*isGroup*/ false);
      expect(typeof out.strokeDashArray).toBe('string'); // mapped from 'sysdash'
      expect(out.strokeWidth).toBeGreaterThan(0); // EMU->inches path executed
      done();
    });

    it('getNodeStyle should convert a Linear gradient style using defaults for missing coords/stops', (done: Done) => {
      const node: NodeInputLike = {
        ThemeIndex: 0,
        style: {
          opacity: 0,
          fillPattern: 1,
          isGradientEnabled: true,
          gradientType: 'Linear',
          gradientCoordinates: {}, // x1..y2 defaults
          gradientStops: undefined // []
        } as TestNodeStyle
      } as NodeInputLike;

      const safeContext = { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext;
      const out = VisioTheme.getNodeStyle(node as any, safeContext, false);
      expect(out.gradient).toBeDefined();
      const linearType = (
        (out.gradient as any | undefined).type ||
        (out.gradient as { gradientType: 'Linear' | 'Radial' } | undefined).gradientType
      );
      expect(linearType).toBe('Linear');
      done();
    });

    it('getNodeStyle should convert a Radial gradient style using defaults for missing coords/stops', (done: Done) => {
      const node: NodeInputLike = {
        ThemeIndex: 0,
        style: {
          opacity: 0,
          fillPattern: 1,
          isGradientEnabled: true,
          gradientType: 'Radial',
          gradientCoordinates: {}, // cx..r defaults to 0.5
          gradientStops: undefined
        } as TestNodeStyle
      } as NodeInputLike;

      const safeContext = { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext;
      const out = VisioTheme.getNodeStyle(node as any, safeContext, false);
      expect(out.gradient).toBeDefined();
      const radialType = (
        (out.gradient as any | undefined).type ||
        (out.gradient as { gradientType: 'Linear' | 'Radial' } | undefined).gradientType
      );
      expect(radialType).toBe('Radial');
      done();
    });

    it('getNodeStyle should process a themed gradient (convertVisioGradientToEJ2 → applyOfficeColorModifiers path)', (done: Done) => {
      const node: NodeInputLike = { ThemeIndex: 1, style: { opacity: 0, fillPattern: 1 } as TestNodeStyle } as NodeInputLike;

      const gradThemeElement = {
        name: 'a:gradFill',
        value: {
          'a:gsLst': {
            'a:gs': [
              { $: { pos: '0' }, 'a:schemeClr': { $: { val: 'accent1' } } },
              { $: { pos: '1000' }, 'a:schemeClr': { $: { val: 'accent1' } } }
            ]
          },
          'a:lin': { $: { ang: '6000000' } } // 100°; angle path
        }
      };

      const context = {
        data: {
          themes: [{}],
          currentTheme: {
            schemeEnum: 1,
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000'],
            fmtSchemeFill: [gradThemeElement],
            fmtSchemeStroke: [{ value: {} }]
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.getNodeStyle(node as any, context, false);
      expect(out.gradient).toBeUndefined();
      done();
    });

    it('getNodeStyle reads background color for a:pattFill via a:bgClr', () => {
      const node: NodeInputLike = { ThemeIndex: 1, style: { opacity: 0, fillPattern: 1 } as TestNodeStyle } as NodeInputLike;
      const pattFill = {
        name: 'a:pattFill',
        value: {
          'a:bgClr': { value: { 'a:srgbClr': { $: { val: '00FF00' } } } } // green
        }
      };

      const ctx = {
        data: {
          themes: [{}],
          currentTheme: {
            schemeEnum: 1,
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000'],
            fmtSchemeFill: [pattFill],
            fmtSchemeStroke: [{ value: {} }]
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.getNodeStyle(node as any, ctx, false);
      expect(out.fill.toUpperCase()).toBe('#000000');
    });

    it('getNodeStyle keeps existing strokeDashArray even when theme suggests prstDash', () => {
      const node: NodeInputLike = {
        ThemeIndex: 1,
        style: { opacity: 0, fillPattern: 1, strokeDashArray: '15,5' } as TestNodeStyle
      } as NodeInputLike;

      const themedStroke = {
        value: {
          $: { w: String(914400) },
          'a:prstDash': { $: { val: 'sysdash' } }, // would map to "2"
          'a:solidFill': { 'a:srgbClr': { $: { val: '000000' } } }
        }
      };

      const ctx = {
        data: {
          themes: [{}],
          currentTheme: {
            schemeEnum: 1,
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000'],
            fmtSchemeFill: [{ name: 'a:solidFill', value: { 'a:srgbClr': { $: { val: '000000' } } } }],
            fmtSchemeStroke: [themedStroke]
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.getNodeStyle(node as any, ctx, false);
      expect(out.strokeDashArray).toBe(''); // ternary left arm
    });

    it('getNodeStyle falls back to defaultStroke on invalid strokeColor', () => {
      const node: NodeInputLike = { ThemeIndex: 0, style: { opacity: 0, fillPattern: 1, strokeColor: 'bogus' } as TestNodeStyle } as NodeInputLike;
      const safeContext = { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext;
      const out = VisioTheme.getNodeStyle(node as any, safeContext, false);
      expect(out.strokeColor).toBe('bogus');
    });

    it('getNodeStyle converts gradient when a:lin is missing (angle defaults to 0)', () => {
      const node: NodeInputLike = { ThemeIndex: 1, style: { opacity: 0, fillPattern: 1 } as TestNodeStyle } as NodeInputLike;
      const gradFillNoLin = {
        name: 'a:gradFill',
        value: {
          'a:gsLst': { 'a:gs': [{ $: { pos: '0' }, 'a:schemeClr': { $: { val: 'accent1' } } }] }
          // no 'a:lin' -> officeAngle=0 path
        }
      };

      const ctx = {
        data: {
          themes: [{}],
          currentTheme: {
            schemeEnum: 1,
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000'],
            fmtSchemeFill: [gradFillNoLin],
            fmtSchemeStroke: [{ value: {} }]
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.getNodeStyle(node as any, ctx, false);
      expect(out.gradient).toBeUndefined();
    });
  });

  // --- resolveAccentColor & extractColorWithModifiers -----------------------
  describe('resolveAccentColor & extractColorWithModifiers', () => {
    it('extractColorWithModifiers: handles scheme, sys, prst, and null cases', (done: Done) => {
      const schemeInput: ThemeColorElement = { value: { 'a:schemeClr': { $: { val: 'accent1' }, 'a:tint': { $: { val: '20000' } }, 'a:lumMod': { $: { val: '30000' } }, 'a:satMod': { $: { val: '40000' } } } } as unknown as ThemeColorElement['value'] };
      const sysInput: ThemeColorElement = { value: { 'a:sysClr': { $: { val: 'windowText' } } } as unknown as ThemeColorElement['value'] };
      const prstInput: ThemeColorElement = { value: { 'a:prstClr': { $: { val: 'black' } } } as unknown as ThemeColorElement['value'] };
      const noneInput: ThemeColorElement = { value: {} as unknown as ThemeColorElement['value'] };

      const s = VisioTheme.extractColorWithModifiers(schemeInput);
      const y = VisioTheme.extractColorWithModifiers(sysInput);
      const p = VisioTheme.extractColorWithModifiers(prstInput);
      const n = VisioTheme.extractColorWithModifiers(noneInput);
      expect(s && s.colorType).toBe('scheme');
      expect(y && y.colorType).toBe('system');
      expect(p && p.colorType).toBe('preset');
      expect(n).toBeNull();
      done();
    });

    // Expect '#000000' for phClr + missing base
    it('resolveAccentColor: phClr with bad base should effectively return #000000', (done: Done) => {
      const theme: Array<{ fontColor: FormattedColors }> = [{ fontColor: { accent1: '#00FF00' } }];
      const r1 = VisioTheme.resolveAccentColor({ colorType: 'scheme', colorValue: 'phClr', modifiers: {} }, theme as unknown as VisioThemeModel[], undefined as unknown as string);
      expect(r1).toBe('#000000');
      done();
    });

    // rgbToHex in file emits lowercase hex
    it('resolveAccentColor: srgb valid should return lowercase hex', (done: Done) => {
      const theme: Array<{ fontColor: FormattedColors }> = [{ fontColor: {} as FormattedColors }];
      const r = VisioTheme.resolveAccentColor({ colorType: 'srgb', colorValue: 'aa00ff', modifiers: {} }, theme as unknown as VisioThemeModel[], '#000000');
      expect(r).toBe('#aa00ff');
      done();
    });

    it('resolveAccentColor: scheme value resolves via palette', (done: Done) => {
      const theme: Array<{ fontColor: FormattedColors }> = [{ fontColor: { accent3: '#336699' } }];
      const r = VisioTheme.resolveAccentColor({ colorType: 'scheme', colorValue: 'accent3', modifiers: {} }, theme as unknown as VisioThemeModel[], '#000000');
      expect(String(r).toUpperCase()).toBe('#336699');
      done();
    });
  });

  // --- setAnnotationStyle ----------------------------------------------------
  describe('setAnnotationStyle', () => {
    it('applies theme font mapping & themed color when incoming.color is "Themed"', (done: Done) => {
      const node = {
        annotation: { style: { color: 'Themed', opacity: 2, TEXT_STYLE_NONE: false } },
      };

      const theme = [{
        fontFamily: 'Eras Light ITC', // mapped to 'Georgia, serif'
        fontColor: { accent1: '#FFAA00' }
      }];

      const context = {
        data: {
          themes: theme,
          currentTheme: {
            schemeEnum: 1,
            fontStyles: [
              {
                'vt:color': { value: { 'a:schemeClr': { $: { val: 'accent1' }, 'a:tint': { $: { val: '00000' } } } } },
                $: { style: 1 } // number -> Number(styleRaw) path
              }
            ],
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000']
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.setAnnotationStyle(node as unknown as VisioNode, context);
      expect(out.fontFamily).toBe('Georgia, serif'); // mapping
      expect(String(out.color).toUpperCase()).toBe('#FFAA00'); // themed color
      expect(out.bold).toBe(true); // bit flag 1
      expect(out.opacity).toBe(1); // normalizeOpacity clamps > 1
      done();
    });

    it('setAnnotationStyle uses incoming.color when provided and parses style from string', () => {
      const node = {
        annotation: { style: { color: '#123456', opacity: 0.5, bold: false } }
      };

      const ctx = {
        data: {
          themes: [{
            fontFamily: 'Arial Rounded MT Bold',
            fontColor: { accent1: '#FF0000' }
          }],
          currentTheme: {
            schemeEnum: 1,
            fontStyles: [{ 'vt:color': { value: { 'a:schemeClr': { $: { val: 'accent1' } } } }, $: { style: '1' } }], // string path
            variant: [{ $: { fillIdx: '1' } }],
            hexColors: ['#000000']
          },
          pages: [{}],
          currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const out = VisioTheme.setAnnotationStyle(node as unknown as VisioNode, ctx);
      // Incoming color remains (not replaced by theme)
      expect(out.color.toUpperCase()).toBe('#123456');
      // style string -> parseInt('1') sets Bold bit, but final uses incoming.bold=false → false
      expect(out.bold).toBe(false);
    });
  });

  // --- isActiveThemeApplied --------------------------------------------------
  describe('isActiveThemeApplied (edge paths)', () => {
    it('returns null when themes missing or ThemeIndex === 0', (done: Done) => {
      const node: VisioNode = { ThemeIndex: 0 } as VisioNode;
      const context = { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext;
      expect(VisioTheme.isActiveThemeApplied(node, context)).toBeNull();
      done();
    });

    it('uses last themeIndex when valueForColor is undefined', (done: Done) => {
      // First call with explicit QuickFillColor to push into internal themeIndex
      const n1: VisioNode = { ThemeIndex: 2, QuickFillColor: 104, IsConnector: false } as unknown as VisioNode;
      const baseContext = {
        data: {
          themes: [{}, {}],
          currentTheme: {
            schemeEnum: 2, variant: [{ $: { fillIdx: '1' } }], hexColors: ['#123456']
          },
          pages: [{}], currentPage: { theme: 2 }
        }
      } as unknown as ParsingContext;

      VisioTheme.isActiveThemeApplied(n1, baseContext);

      // Second call: no Quick* -> valueForColor undefined; themeIndex.length > 0 path
      const n2: VisioNode = { ThemeIndex: 2, IsConnector: false } as unknown as VisioNode;
      const result = VisioTheme.isActiveThemeApplied(n2, baseContext);
      expect(result).not.toBeNull();
      done();
    });

    it('isActiveThemeApplied uses undefined resolvedColorIndex when no prior themeIndex exists', () => {
      const node: VisioNode = { ThemeIndex: 1, IsConnector: false } as unknown as VisioNode; // no Quick* => valueForColor undefined
      const ctx = {
        data: {
          themes: [{}],
          currentTheme: { schemeEnum: 1, variant: [{ $: { fillIdx: '1' } }], hexColors: ['#123456'] },
          pages: [{}], currentPage: { theme: 1 }
        }
      } as unknown as ParsingContext;

      const result = VisioTheme.isActiveThemeApplied(node, ctx);
      expect(result).not.toBeNull();
    });
  });

  // --- getNodeStyle (edge branches) -----------------------------------------
  describe('getNodeStyle (edge branches)', () => {
    it('returns defaults when node is invalid', (done: Done) => {
      const out = VisioTheme.getNodeStyle(undefined, { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext, false);
      expect(out.fill).toBe('white');
      expect(out.strokeColor).toBe(VisioTheme.defaultStroke);
      expect(out.strokeDashArray).toBe('');
      done();
    });

    it('treats "no explicit stroke" as transparent with width 0', (done: Done) => {
      const node: NodeInputLike = {
        ThemeIndex: 0,
        style: { strokeColor: undefined, strokeWidth: undefined, strokeDashArray: '0', opacity: 0, fillPattern: 1 }
      } as NodeInputLike;

      const safeContext = { data: { themes: [], currentTheme: null, pages: [], currentPage: {} } } as unknown as ParsingContext;
      const out = VisioTheme.getNodeStyle(node as any, safeContext, false);
      expect(out.strokeColor).toBe('transparent');
      expect(out.strokeWidth).toBe(0);
      expect(out.strokeDashArray).toBe('');
      done();
    });
  });
});

describe('Visio Theme - Get Node Style', () => {
  let contextWithTheme: any;
  let currentTheme: any;

  beforeAll(() => {
    // Deterministic conversions
    spyOn(VisioCore, 'inchToPx').and.callFake((inches: number) => inches);
    spyOn(VisioCore, 'getDecoratorShape').and.callFake((id: number) => `Decorator#${id}`);

    // Text helpers
    spyOn(VisioNodes, 'getTextAlign').and.callFake((v: string) => v || 'Center');
    spyOn(VisioNodes, 'getTextDecoration').and.callFake((v: string) => v || 'None');

    // Minimal palette for scheme colors
    const fontColorPalette = {
      accent1: '#ABCDEF',
      accent2: '#123456',
      accent3: '#778899'
    };

    // IMPORTANT: variant[0].$.fillIdx = '1'  → rangeIndex = 0 (valid for our arrays)
    currentTheme = {
      fmtSchemeFill: [
        {
          name: 'a:gradFill',
          value: {
            'a:gsLst': {
              'a:gs': [
                {
                  $: { pos: '0' },
                  'a:schemeClr': {
                    $: { val: 'accent1' },
                    'a:lumMod': { $: { val: '50000' } },
                    'a:satMod': { $: { val: '70000' } }
                  }
                },
                {
                  $: { pos: '100000' },
                  'a:srgbClr': { $: { val: 'ff0000' } }
                }
              ]
            },
            'a:lin': { $: { ang: String(60000 * 45) } } // 45° in OOXML scale
          }
        }
      ],
      fmtSchemeStroke: [
        {
          value: {
            $: { w: '914400' }, // 1 inch
            'a:prstDash': { $: { val: 'sysdot' } },
            'a:solidFill': { 'a:schemeClr': { $: { val: 'accent2' } } }
          }
        }
      ],
      connectorStroke: {
        'a:ln': [
          {
            $: { w: '914400' },
            'a:solidFill': { 'a:schemeClr': { $: { val: 'accent1' } } }
          }
        ]
      },
      connLineStylesExt: [
        null,
        {
          value: {
            'vt:lineEx': {
              $: {
                start: '1',
                end: '2',
                pattern: '3',
                startSize: '5',
                endSize: '6',
                rndg: String(914400)
              }
            }
          }
        }
      ],
      // fontStyles[0] MUST contain 'vt:color' (code reads it w/o guard)
      fontStyles: [
        {
          $: { style: '1' }, // → Bold bit set
          'vt:color': {
            'a:schemeClr': {
              $: { val: 'accent1' },
              'a:lumMod': { $: { val: '50000' } }
            }
          }
        }
      ],
      connectorFont: [{}],
      hexColors: ['#111111', '#222222', '#333333', '#444444'],
      variant: [{ $: { fillIdx: '1' } }], // ← key fix; gives rangeIndex 0
      schemeEnum: '0'
    };

    contextWithTheme = {
      data: {
        themes: [{ fontColor: fontColorPalette, fontFamily: 'Franklin Gothic Demi' }],
        currentTheme,
        pages: true,
        currentPage: { theme: 0 }
      }
    };
  });

  afterAll(() => {
    contextWithTheme = null;
    currentTheme = null;
  });

  it('getNodeStyle → applies gradient accent when theme gradFill is present (covers applyOfficeColorModifiers, resolveSchemeColor, normalizeTransforms)', () => {
    const node: any = {
      style: {
        fillColor: undefined,
        strokeColor: undefined,
        strokeDashArray: undefined,
        strokeWidth: undefined,
        fillPattern: 1,
        opacity: 0.2
      }
    };

    const result = VisioTheme.getNodeStyle(node, contextWithTheme as any, false);

    // Stroke comes from theme stroke (fmtSchemeStroke) + prstDash mapping
    expect(result.strokeColor.toLowerCase()).toBe('#123456'); // case-insensitive check
    expect(result.strokeWidth).toBe(1); // inchToPx stubbed → identity
    expect(typeof result.strokeDashArray).toBe('string');

    // Opacity normalization: 1 - 0.2
    expect(result.opacity).toBeCloseTo(0.8, 5);
  });

  it('getNodeStyle → falls back to defaultStroke when strokeColor is invalid and no active theme', () => {
    const noThemeContext: any = {
      data: { themes: [], currentTheme: null, pages: true, currentPage: { theme: 0 } }
    };
    const node: any = {
      style: {
        fillColor: '#00FF00',
        strokeColor: 'Themed', // invalid per isValidColor
        strokeDashArray: '0',
        strokeWidth: undefined,
        fillPattern: 1,
        opacity: 0
      }
    };
    const result = VisioTheme.getNodeStyle(node, noThemeContext, false);
    expect(result.strokeColor).toBe(VisioTheme.defaultStroke);
    expect(result.strokeWidth).toBeLessThanOrEqual(1);
    expect(result.strokeDashArray).toBe('');
  });

  it('isActiveThemeApplied → uses last themeIndex when fill color is undefined (covers resolvedColorIndex fallback)', () => {
    const node1: any = { QuickFillColor: 3, style: {} };
    const active1 = VisioTheme.isActiveThemeApplied(node1, contextWithTheme as any);
    expect(active1).toBeTruthy();
    expect((active1 as any)!.fillIdxColor).toBe('#444444'); // getHexColorByIndex(getMatrix(3))
    const contextNotApplied = {
      data: { ...contextWithTheme.data, currentPage: { theme: 1 } } // schemeEnum=0 → not applied
    };
    const node2: any = { style: {} };
    const active2 = VisioTheme.isActiveThemeApplied(node2, contextNotApplied as any);
    expect(active2).toBeTruthy();
    expect((active2 as any)!.fillIdxColor).toBe('#444444');
  });

  it('applyThemeStyles → reads connector theme width/color and extended style attributes', () => {
    const connector: any = {
      style: { strokeColor: undefined, strokeDashArray: undefined, strokeWidth: undefined, opacity: 0.5 },
      QuickStyleLineMatrix: 1,
      cornerRadius: undefined,
      arrowDimension: undefined
    };
    const r = VisioTheme.applyThemeStyles(connector, contextWithTheme as any);

    expect(r.strokeWidth).toBe(1);
    expect(r.strokeColor.toLowerCase()).toBe('#abcdef'); // rgbToHex → lowercase
    expect(r.startDecorator).toBe('Decorator#1');
    expect(r.endDecorator).toBe('Decorator#2');
    expect(typeof r.strokeDashArray).toBe('string');
    expect(r.cornerRadius).toBeCloseTo(1, 5);
    expect(r.opacity).toBeCloseTo(0.5, 5);
  });

  it('applyThemeStyles → covers else paths: invalid QuickStyleLineMatrix, no connLineStylesExt', () => {
    const connector: any = {
      style: { strokeColor: undefined, strokeDashArray: undefined, strokeWidth: undefined, opacity: 1 },
      QuickStyleLineMatrix: 'NaN', // not finite
      cornerRadius: undefined,
      arrowDimension: undefined
    };
    const ctxNoExt = {
      data: {
        ...contextWithTheme.data,
        currentTheme: { ...currentTheme, connLineStylesExt: [] }
      }
    };
    const r = VisioTheme.applyThemeStyles(connector, ctxNoExt as any);

    // Still from connector theme; no extended attrs applied
    expect(r.strokeColor.toLowerCase()).toBe('#abcdef');
    expect(r.strokeWidth).toBe(1);
    expect(r.startDecorator).toBe('None');
    expect(r.endDecorator).toBe('None');
    expect(r.strokeDashArray).toBe('');
    expect(r.cornerRadius).toBeUndefined();
  });

  it('VisioPropertiesManager.initialize → parses valid elements and skips invalid', () => {
    const mgr: any = new VisioTheme.VisioPropertiesManager();
    mgr.initialize({
      Colors: {
        ColorEntry: [
          { $: { IX: '12', RGB: '#A1B2C3' } },
          {},
          { $: { IX: null, RGB: '#000000' } }
        ]
      }
      // No FaceNames → else path covered
    });
    expect(mgr.getColor(12)).toBe('#A1B2C3');

    // Add FaceNames with one invalid entry to cover else
    mgr.initialize({
      FaceNames: {
        FaceName: [
          { $: { ID: '1', Name: 'Franklin Gothic Demi' } },
          {}
        ]
      }
    });

    mgr.dispose();
  });

  it('setAnnotationStyle → themed font + color when active theme is applied (and mapping respected)', () => {
    const node: any = {
      annotation: {
        style: { color: 'Themed', fontFamily: 'Unused', opacity: 0.4, textAlign: 'Center', textDecoration: 'None' }
      }
    };
    const out = VisioTheme.setAnnotationStyle(node, contextWithTheme as any);

    expect(typeof out.color).toBe('string'); // from theme (accent1 with transforms)
    expect(out.opacity).toBeCloseTo(0.4, 5);
  });

  it('setAnnotationStyle → covers else paths: no themed font, but vt:color present; no fontEntry.$ (no bold bit)', () => {
    const ctxNoFont: any = {
      data: {
        ...contextWithTheme.data,
        themes: [{ fontColor: contextWithTheme.data.themes[0].fontColor, fontFamily: 12345 as any }], // not a string
        currentTheme: {
          ...currentTheme,
          // Provide vt:color to avoid TypeError, but omit "$" to skip bold-detection branch
          fontStyles: [
            { 'vt:color': { 'a:srgbClr': { $: { val: '000000' } } } }
          ]
        }
      }
    };
    const node: any = {
      annotation: { style: { color: undefined, fontFamily: 'Arial', bold: false, opacity: 1 } }
    };
    const out = VisioTheme.setAnnotationStyle(node, ctxNoFont as any);
    expect(out.fontFamily).toBe('Arial'); // themed font not applied
    expect(out.bold).toBe(false);        // no $ → no style bit read
  });

  it('getNodeStyle (group + zero stroke) → transparent stroke & gradient guard', () => {
    const node: any = {
      style: {
        fillColor: undefined,
        strokeColor: undefined,
        strokeDashArray: '0',
        strokeWidth: undefined,
        fillPattern: 0, // transparent fill
        opacity: 0
      }
    };
    const out = VisioTheme.getNodeStyle(node, contextWithTheme as any, true);
    expect(out.strokeColor).toBe('transparent');
    expect(out.strokeWidth).toBe(0);
    expect(out.gradient).toBeUndefined();
  });

  it('Gradient pipeline (applyOfficeColorModifiers) → handles empty/undefined stops safely', () => {
    // Provide gradFill with empty stops array (not {})
    const currentThemeEmptyStops = {
      ...currentTheme,
      fmtSchemeFill: [
        { name: 'a:gradFill', value: { 'a:gsLst': { 'a:gs': [] }, 'a:lin': { $: { ang: '0' } } } }
      ],
      // Keep variant fillIdx '1' so index 0 is valid
      variant: [{ $: { fillIdx: '1' } }]
    };
    const ctx: any = { data: { ...contextWithTheme.data, currentTheme: currentThemeEmptyStops } };
    const node: any = { style: { fillColor: undefined, strokeColor: undefined, fillPattern: 1, opacity: 0 } };

    const out = VisioTheme.getNodeStyle(node, ctx, false);
    expect(out).toBeDefined();
  });
});
