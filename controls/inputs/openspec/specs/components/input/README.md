# Input — Component Spec Index

**Component:** Input (Utility Namespace)  
**Location:** `src/input/input.ts`  
**Status:** Stable — Foundation for 7 other components

## Specs

| Spec | Path | Priority |
|------|------|----------|
| API Contract | [`api-contract/spec.md`](api-contract/spec.md) | ⭐ Always read first |
| Floating Label | [`floating-label/spec.md`](floating-label/spec.md) | Read when working with label behaviour |

## When to Read These Specs
- Changing `Input.createInput()` → read **both** specs + `css-architecture` foundation
- Adding a new input chrome feature → read **api-contract** + **floating-label** + `property-event-system`
- Bug in label animation → read **floating-label** only
- Any change here affects: TextBox, TextArea, SmartTextArea, NumericTextBox, MaskedTextBox, OTPInput, ColorPicker
