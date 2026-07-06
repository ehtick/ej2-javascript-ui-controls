# Slider — Component Spec Index

**Component:** Slider  
**Location:** `src/slider/slider.ts` (3 504 loc)  
**Status:** Stable — Most complex single-file component

## Specs

| Spec | Path | Priority |
|------|------|----------|
| API Contract | [`api-contract/spec.md`](api-contract/spec.md) | ⭐ Always read first |
| Interaction | [`interaction/spec.md`](interaction/spec.md) | Drag, keyboard, Range two-thumb |
| Ticks & Tooltip | [`ticks-tooltip/spec.md`](ticks-tooltip/spec.md) | TicksData, TooltipData |
| Color Range | [`color-range/spec.md`](color-range/spec.md) | ColorRangeData, gradient |

## Downstream Impact
Slider is **used inside ColorPicker** (hue bar, opacity bar). Changes to Slider's interaction
model may affect ColorPicker. Always test ColorPicker after any Slider change.

## LOC Budget
Slider has a hard LOC budget of **4 000 lines** (`openspec/config.yaml`).  
Current: 3 504 — remaining headroom: ~500 lines.
