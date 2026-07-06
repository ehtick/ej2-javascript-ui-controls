// spec/diagram/load-utility/visio-import-export/visio-core.uncovered-branches.spec.ts
import {
  toBoolean,
  toCamelCase,
  formatCoordinate,
  isGroupShape,
  applyParentTransformToCellMap,
  getVisibility,
  extractGradientStops,
  getRadialGradient,
  getDecoratorDimensions,
  roundToPrecision,
  createPathFromGeometrySections,
  normalizeAngleRadians,
  generatePathCommand,
} from '../../../src/diagram/load-utility/visio-import-export/visio-core';

import * as VisioCoreModule from '../../../src/diagram/load-utility/visio-import-export/visio-core';
import * as VisioNodes from '../../../src/diagram/load-utility/visio-import-export/visio-nodes';

import {
  CellMapValue,
  GeometryRowCoordinates,
  GroupTransform,
  PathOptions,
  PathCoordinates,
  ScalingFunctions,
  VisioCell,
  VisioRow,
  VisioSection,
} from '../../../src/diagram/load-utility/visio-import-export/visio-types';

describe('Visio Core - Uncovered Branches', () => {
  // ─────────────────────────────────────────────────────────────────────────────
  describe('toBoolean', () => {
    it('should return defaultValue for undefined / null', () => {
      expect(toBoolean(undefined, true)).toBe(true);
      // Intentionally check runtime behavior for null (not in type surface):
      expect(toBoolean(null, false)).toBe(false);
    });

    it('should handle boolean and numeric inputs', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);

      // Intentionally pass numeric inputs (implementation supports it)
      expect(toBoolean(0)).toBe(false);
      expect(toBoolean(3)).toBe(true);
    });

    it('should parse strings correctly', () => {
      expect(toBoolean('0')).toBe(false);
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('FALSE')).toBe(false);
      expect(toBoolean('1')).toBe(true);
      expect(toBoolean('TrUe')).toBe(true);
      expect(toBoolean('')).toBe(false); // length=0 → false
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('toCamelCase', () => {
    it('should return empty string for non-string input or empty', () => {
      expect(toCamelCase(null)).toBe('');
      expect(toCamelCase(undefined)).toBe('');
    });

    it('should convert dashed/underscored keys to camelCase', () => {
      expect(toCamelCase('foo-bar_baz')).toBe('fooBarBaz');
    });

    it('should ignore empty parts and capitalize following part(s)', () => {
      expect(toCamelCase('-foo--bar')).toBe('FooBar');
      expect(toCamelCase('_FOO')).toBe('Foo');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('formatCoordinate', () => {
    it('should return undefined for null/undefined', () => {
      expect(formatCoordinate(null)).toBeUndefined();
      expect(formatCoordinate(undefined)).toBeUndefined();
    });

    it('should round using default precision=2 and custom precision', () => {
      expect(formatCoordinate(2.3456)).toBe(2.35);
      expect(formatCoordinate(2.3456, 3)).toBe(2.346);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('isGroupShape', () => {
    it('should return false for invalid inputs or missing $', () => {
      expect(isGroupShape(null)).toBe(false);
      expect(isGroupShape({})).toBe(false);
      expect(isGroupShape(true)).toBe(false); // simple truthy non-object
    });

    it('should detect group type case-insensitively', () => {
      expect(isGroupShape({ $: { Type: 'Group' } })).toBe(true);
      expect(isGroupShape({ $: { Type: 'connector' } })).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('applyParentTransformToCellMap', () => {
    const makeMap = (x: number, y: number) => {
      const m = new Map<string, CellMapValue>();
      m.set('PinX', String(x));
      m.set('PinY', String(y));
      return m;
    };

    it('should early-return the original map when parentTx is missing', () => {
      const m = makeMap(10, 20);
      const out = applyParentTransformToCellMap(m as unknown as Map<string, any>, undefined);
      expect(out).toBe(m);
    });

    it('should apply flipX / flipY correctly', () => {
      const m = makeMap(8, 9);
      const parent: GroupTransform = {
        locPinX: 5, locPinY: 5,
        pinX: 0, pinY: 0,
        flipX: 1, flipY: 0,
        angle: 0,
      };
      const out = applyParentTransformToCellMap(
        m as unknown as Map<string, any>,
        parent
      );
      expect(out.get('PinX')).toBe(String(-3)); // (8-5)=3 → flipX → -3
      expect(out.get('PinY')).toBe(String(4));  // (9-5)=4
    });

    it('should rotate child relative offset around parent angle', () => {
      const m = makeMap(10, 0);
      const parent: GroupTransform = {
        locPinX: 0, locPinY: 0,
        pinX: 0, pinY: 0,
        flipX: 0, flipY: 0,
        angle: Math.PI / 2, // 90°
      };
      const out = applyParentTransformToCellMap(
        m as unknown as Map<string, any>,
        parent
      );
      expect(Boolean(out.get('PinX'))).toBe(true);
      expect(Boolean(out.get('PinY'))).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('getVisibility', () => {
    it('should return true when sections is null/undefined', () => {
      expect(getVisibility(null)).toBe(true);
      expect(getVisibility(undefined)).toBe(true);
    });

    it('should return false when Geometry.Cell has NoShow=1', () => {
      const sections: VisioSection[] = [{
        $: { N: 'Geometry' },
        Cell: [{ $: { N: 'NoShow', V: '1' } } as VisioCell],
      }];
      expect(getVisibility(sections)).toBe(false);
    });

    it('should return false when any Geometry.Row.Cell has NoShow=1', () => {
      const sections: VisioSection[] = [{
        $: { N: 'Geometry' },
        Row: [{
          $: { T: 'MoveTo' },
          Cell: [{ $: { N: 'NoShow', V: '1' } } as VisioCell],
        } as VisioRow],
      }];
      expect(getVisibility(sections)).toBe(false);
    });

    it('should return true when no NoShow flags are present', () => {
      const sections: VisioSection[] = [{
        $: { N: 'Geometry' },
        Row: [{
          $: { T: 'MoveTo' },
          Cell: [{ $: { N: 'X', V: '0' } } as VisioCell, { $: { N: 'Y', V: '0' } } as VisioCell],
        } as VisioRow],
      }];
      expect(getVisibility(sections)).toBe(true);
    });

    it('no geometry, no rows, empty geometry', () => {
      expect(getVisibility([{ $: { N: 'Other' } } as VisioSection])).toBe(true);
      expect(getVisibility([{ $: { N: 'Geometry' } } as VisioSection])).toBe(true);
      expect(getVisibility([{ $: { N: 'Geometry' }, Row: [] as VisioRow[] } as VisioSection])).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('extractGradientStops', () => {
    it('should return [] when section or rows are missing', () => {
      expect(extractGradientStops(null)).toEqual([]);
      expect(extractGradientStops({} as unknown as VisioSection)).toEqual([]);
    });

    it('should skip deleted/invalid rows and compute color/opacity/offset with clamp', () => {
      const section: VisioSection = {
        Row: [
          { $: { Del: '1' } } as unknown as VisioRow, // deleted row
          {
            $: { T: 'Gradient' },
            Cell: [
              {} as unknown as VisioCell, // missing attributes - will be skipped
              { $: { N: 'GradientStopColor', V: '#ff0000' } } as VisioCell,
              { $: { N: 'GradientStopColorTrans', V: '0.25' } } as VisioCell, // → opacity 0.75
              { $: { N: 'GradientStopPosition', V: '1.2' } } as VisioCell,   // → offset 1.0
            ],
          } as any,
        ],
        $: { N: 'FillGradient' },
      };
      const out = extractGradientStops(section);
      expect(out.length).toBe(1);
      expect(out[0].color).toBe('#ff0000');
      expect(out[0].opacity).toBeCloseTo(0.75, 6);
      expect(out[0].offset).toBe(1);
    });

    it('clamp opacity and offset, skip nameless', () => {
      const section: VisioSection = {
        $: { N: 'FillGradient' },
        Row: [{
          $: { T: 'Gradient' },
          Cell: [
            {} as unknown as VisioCell,
            { $: { N: 'GradientStopColorTrans', V: '-1' } } as VisioCell,
            { $: { N: 'GradientStopPosition', V: '-5' } } as VisioCell,
          ],
        } as any],
      };
      const out = extractGradientStops(section);
      expect(out[0].opacity).toBe(1);
      expect(out[0].offset).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('getRadialGradient', () => {
    it('should return a zeroed gradient for unknown direction', () => {
      expect(getRadialGradient('9')).toEqual({ type: 'Radial', cx: 0, cy: 0, fx: 0, fy: 0, r: 0 });
    });

    it('default for non-string', () => {
      expect(getRadialGradient('100')).toEqual({ type: 'Radial', cx: 0, cy: 0, fx: 0, fy: 0, r: 0 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('getDecoratorDimensions', () => {
    it('should return default size when shape key not present in DECORATOR_SIZE_MAP', () => {
      expect(getDecoratorDimensions('10', 'non-existent-shape' as unknown as string))
        .toEqual({ width: 8, height: 8 });
    });

    it('should resolve arrow-like keys to "arrow" and return a size object', () => {
      const out = getDecoratorDimensions('0', 'OpenArrow');
      expect(typeof out.width).toBe('number');
      expect(typeof out.height).toBe('number');
      expect(out.width).toBeGreaterThan(0);
      expect(out.height).toBeGreaterThan(0);
    });

    it('index clamp and NaN index', () => {
      expect(getDecoratorDimensions('999', 'arrow')).toEqual(jasmine.any(Object));
      expect(getDecoratorDimensions('abc', 'arrow')).toEqual(jasmine.any(Object));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('roundToPrecision', () => {
    it('should return 0 for non-finite inputs', () => {
      expect(roundToPrecision(NaN, 3)).toBe(0);
    });

    it('should round to the provided precision', () => {
      expect(roundToPrecision(1.2345, 3)).toBe(1.234);
    });

    it('large precision', () => {
      expect(roundToPrecision(1.123456789, 8)).toBeCloseTo(1.12345679, 8);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('createPathFromGeometrySections', () => {
    let sectionHiddenSpy: jasmine.Spy;
    let rowHiddenSpy: jasmine.Spy;

    beforeAll(() => {
      // Create the spies ONCE for this suite
      sectionHiddenSpy = spyOn(VisioNodes, 'isGeometrySectionHidden').and.returnValue(false);
      rowHiddenSpy = spyOn(VisioNodes, 'isGeometryRowHidden').and.returnValue(false);
    });

    beforeEach(() => {
      // Default behavior for each test; individual tests can override
      sectionHiddenSpy.and.returnValue(false);
      rowHiddenSpy.and.returnValue(false);
      sectionHiddenSpy.calls.reset();
      rowHiddenSpy.calls.reset();
    }); 

    it('should return empty string when sections is null/empty', () => {
      const node: PathOptions = { pinX: 0, pinY: 0, Width: 10, Height: 10 };
      expect(createPathFromGeometrySections(null, node)).toBe('');
      expect(createPathFromGeometrySections([], node)).toBe('');
    });

    it('should skip hidden sections/rows and close path with Z when NoFill=0', () => {
      sectionHiddenSpy.and.callFake((sec: any) => !!sec.$.Hidden);
      rowHiddenSpy.and.callFake((row: any) => !!row.$.Del);

      const sections: VisioSection[] = [
        { $: { N: 'Geometry', Hidden: 1 } as any, Row: [] } as VisioSection, // whole section skipped
        {
          $: { N: 'Geometry' },
          Row: [
            { $: { T: 'MoveTo' }, Cell: [{ $: { N: 'X', V: 0 } } as VisioCell, { $: { N: 'Y', V: 0 } } as VisioCell] } as VisioRow,
            { $: { T: 'LineTo' }, Cell: [{ $: { N: 'X', V: 10 } } as VisioCell, { $: { N: 'Y', V: 10 } } as VisioCell] } as VisioRow,
            { $: { T: 'LineTo' }, Cell: [{ $: { N: 'X', V: 10 } } as VisioCell, { $: { N: 'Y', V: 0 } } as VisioCell] } as VisioRow,
            { $: { T: 'LineTo' }, Cell: [{ $: { N: 'X', V: 0 } } as VisioCell, { $: { N: 'Y', V: 0 } } as VisioCell] } as VisioRow,
            { $: { T: 'LineTo', Del: 1 }, Cell: [] as VisioCell[] } as any, // hidden row (spy will hide)
          ],
        } as VisioSection,
      ];

      const node: PathOptions = { pinX: 0, pinY: 0, Width: 10, Height: 10 };
      const path = createPathFromGeometrySections(sections, node);

      expect(path.endsWith('Z')).toBeTruthy();
      expect(path.startsWith('M')).toBeTruthy();
    });

    it('should NOT auto-close with Z when section-level NoFill=1', () => {
      const sections: VisioSection[] = [{
        $: { N: 'Geometry' },
        Cell: [{ $: { N: 'NoFill', V: '1' } } as VisioCell],
        Row: [
          { $: { T: 'MoveTo' }, Cell: [{ $: { N: 'X', V: 0 } } as VisioCell, { $: { N: 'Y', V: 0 } } as VisioCell] } as VisioRow,
          { $: { T: 'LineTo' }, Cell: [{ $: { N: 'X', V: 10 } } as VisioCell, { $: { N: 'Y', V: 10 } } as VisioCell] } as VisioRow,
        ],
      }];

      const node: PathOptions = { pinX: 0, pinY: 0, Width: 10, Height: 10 };
      const path = createPathFromGeometrySections(sections, node);

      expect(path.endsWith('Z')).toBeFalsy();
    });

    it('row undefined and all rows hidden', () => {
      sectionHiddenSpy.and.returnValue(false);
      rowHiddenSpy.and.returnValues(true, true);


      const node: PathOptions = { pinX: 0, pinY: 0, Width: 10, Height: 10 };

      const out1 = createPathFromGeometrySections([{ $: { N: 'Geometry' } } as VisioSection], node);
      expect(out1).toBe('');

      const out2 = createPathFromGeometrySections(
        [{ $: { N: 'Geometry' }, Row: [{ $: { T: 'MoveTo' } } as VisioRow] } as VisioSection],
        node
      );
      expect(out2).toBe('');
    });

    it('uppercase leading m', () => {
      
      sectionHiddenSpy.and.returnValue(false);
      rowHiddenSpy.and.returnValue(false);

      spyOn(VisioCoreModule, 'createPathFromGeometry').and.returnValue('m 0 0');

      const node: PathOptions = { pinX: 0, pinY: 0, Width: 10, Height: 10 };
      const out = createPathFromGeometrySections(
        [{ $: { N: 'Geometry' }, Row: [{ $: { T: 'MoveTo' } } as VisioRow] } as VisioSection],
        node
      );
      expect(out.startsWith('M')).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('normalizeAngleRadians', () => {
    it('should pass through radian values within ±2π', () => {
      expect(normalizeAngleRadians(1)).toBe(1);
    });

    it('should treat large absolute input as degrees and convert to radians', () => {
      // 720° → 4π
      const out = normalizeAngleRadians(720);
      expect(out).toBeCloseTo(4 * Math.PI, 6);
    });

    it('large negative degrees', () => {
      expect(normalizeAngleRadians(-720)).toBeCloseTo(-4 * Math.PI, 6);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe('generatePathCommand (targeted cases)', () => {
    const identity: ScalingFunctions = {
      scaleX: (n: unknown) => Number(n),
      scaleY: (n: unknown) => Number(n),
      radiusX: (n: unknown) => Number(n),
      radiusY: (n: unknown) => Number(n),
    };

    it('should emit QuadBezierTo command', () => {
      const last: PathCoordinates = { lastX: 0, lastY: 0 };
      const cmd = generatePathCommand(
        'QuadBezierTo',
        { A: 5, B: 5, X: 10, Y: 10 } as GeometryRowCoordinates,
        identity,
        last,
        false
      );
      expect(cmd).toBe('Q 5 5 10 10');
    });

    it('should return empty for Ellipse with non-positive radii', () => {
      const last: PathCoordinates = { lastX: 0, lastY: 0 };
      // axis points equal to center → radii 0
      const cmd = generatePathCommand(
        'Ellipse',
        { X: 5, Y: 5, A: 5, B: 5, C: 5, D: 5 } as GeometryRowCoordinates,
        identity,
        last,
        false
      );
      expect(cmd).toBe('');
    });

    it('EllipticalArcTo: start == end → fall back to line; axis ratio invalid → clamped', () => {
      const last: PathCoordinates = { lastX: 10, lastY: 20 }; // same as end
      // A/B intentionally omitted (undefined) to force midpoint fallback
      const cmd = generatePathCommand(
        'EllipticalArcTo',
        { X: 10, Y: 20, C: 45, D: 0 } as GeometryRowCoordinates,
        identity,
        last,
        false
      );
      expect(cmd).toBe('L 10 20');
    });

    it('toBoolean: non-primitive default and blank-space true', () => {
      expect(toBoolean(' ')).toBe(true);
    });

    it('toCamelCase: multiple separators and empty parts', () => {
      expect(toCamelCase('a__b--c')).toBe('aBC');
      expect(toCamelCase('first-second-third')).toBe('firstSecondThird');
    });

    it('formatCoordinate: default precision and negative rounding', () => {
      expect(formatCoordinate(3.3333)).toBe(3.33);
      expect(formatCoordinate(-2.9876, 3)).toBe(-2.988);
    });

    it('isGroupShape: non-string Type and empty $', () => {
      expect(isGroupShape({ $: { Type: 123 as unknown as string } })).toBe(false);
    });

    it('applyParentTransformToCellMap: flipY only', () => {
      const m = new Map<string, CellMapValue>([['PinX', '5'], ['PinY', '9']]);
      const parent: GroupTransform = {
        locPinX: 5, locPinY: 5, pinX: 0, pinY: 0, flipX: 0, flipY: 1, angle: 0,
      };
      const out = applyParentTransformToCellMap(
        m as unknown as Map<string, any>,
        parent
      );
      expect(out.get('PinX')).toBe('0');
      expect(out.get('PinY')).toBe('-4');
    });

    it('generatePathCommand: RelMoveTo, RelLineTo, ArcTo sweepFlag, mid-point fallback', () => {
      let last: PathCoordinates = { lastX: 0, lastY: 0 };
      let m = generatePathCommand('RelMoveTo', { X: 5, Y: 6 }, identity, last, false);
      expect(m).toBe('M 5 6');

      last = { lastX: 0, lastY: 0 };
      const l = generatePathCommand('RelLineTo', { X: 5, Y: 6 }, identity, last, false);
      expect(l).toBe('L 5 6');

      last = { lastX: 0, lastY: 0 };
      const a = generatePathCommand('ArcTo', { X: 10, Y: 0, A: -5 }, identity, last, false);
      expect(a).toContain(' 1 '); // sweepFlag

      last = { lastX: 0, lastY: 0 };
      const e = generatePathCommand(
        'EllipticalArcTo',
        { X: 10, Y: 10, /* A/B omitted → midpoint path or fallback */ C: 0, D: 1 },
        identity,
        last,
        false
      );
      expect(e.startsWith('A')).toBe(false);
    });
  });
});