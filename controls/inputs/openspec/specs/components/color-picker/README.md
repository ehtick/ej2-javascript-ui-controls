# ColorPicker — Component Spec Index

**Component:** ColorPicker  
**Location:** `src/color-picker/color-picker.ts` (2 246 loc)  
**Status:** Stable — Most inter-component dependencies

## Specs

| Spec | Path | Priority |
|------|------|----------|
| API Contract | [`api-contract/spec.md`](api-contract/spec.md) | ⭐ Always read first |
| Picker Mode | [`picker-mode/spec.md`](picker-mode/spec.md) | HSV canvas, hue/opacity bars, text inputs |
| Palette Mode | [`palette-mode/spec.md`](palette-mode/spec.md) | Tile grid, preset groups, noColor |

## Dependencies to Read When Changing ColorPicker
- `components/slider/api-contract/spec.md` — hue/opacity bars ARE Slider instances
- `components/numerictextbox/api-contract/spec.md` — HSV/RGB/Hex inputs ARE NumericTextBox instances
- `css-architecture/spec.md` — 15+ CSS class constants in this file

## LOC Budget
Hard LOC budget of **2 800 lines** (`openspec/config.yaml`).  
Current: 2 246 — remaining headroom: ~554 lines.
