# NumericTextBox — Component Spec Index

**Component:** NumericTextBox  
**Location:** `src/numerictextbox/numerictextbox.ts` (1 895 loc)  
**Status:** Stable — Used inside ColorPicker

## Specs

| Spec | Path | Priority |
|------|------|----------|
| API Contract | [`api-contract/spec.md`](api-contract/spec.md) | ⭐ Always read first |
| Formatting | [`formatting/spec.md`](formatting/spec.md) | Locale patterns, decimal/currency/percent |
| Spin Interaction | [`spin-interaction/spec.md`](spin-interaction/spec.md) | Spin buttons, keyboard stepping |

## Downstream Impact
NumericTextBox is **used inside ColorPicker** (RGB/HSV text inputs). Changes to NumericTextBox's
value handling may affect ColorPicker.

## LOC Budget
Hard LOC budget of **2 200 lines** (`openspec/config.yaml`).  
Current: 1 895 — remaining headroom: ~305 lines.
