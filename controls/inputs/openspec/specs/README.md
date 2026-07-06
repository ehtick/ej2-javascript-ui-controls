# OpenSpec — Master Spec Index

> **CRITICAL:** Do NOT read all 28 specs at the start of a task. Use this index to select **only the specs relevant to your change**. Reading unnecessary specs wastes context and slows work.

---

## How to Use This Index

1. **Identify the component(s)** your change touches (consult `openspec/project.md` if unsure)
2. **Identify the capability area** (API contract? Specific behaviour? Foundation concern?)
3. **Read 3–5 targeted specs maximum** per task
4. For a fast decision → use `openspec/spec-selector.md`

---

## Foundation Specs (Cross-Cutting)

These specs apply to **all** components. Read them when your change affects the pattern (not when writing standard feature code).

| Spec | Path | Read When |
|------|------|-----------|
| Testing Standards | [`testing-standards/spec.md`](testing-standards/spec.md) | Writing or reviewing tests; coverage gate questions |
| Accessibility | [`accessibility/spec.md`](accessibility/spec.md) | ARIA roles, keyboard nav, screen reader, `disabled` state |
| Component Lifecycle | [`component-lifecycle/spec.md`](component-lifecycle/spec.md) | Constructor, `preRender`, `render`, `onPropertyChanged`, `destroy` |
| CSS Architecture | [`css-architecture/spec.md`](css-architecture/spec.md) | Class naming, CSS const strings, RTL, theme detection |
| Property & Event System | [`property-event-system/spec.md`](property-event-system/spec.md) | `@Property`, `@Event`, `@Complex`, `@Collection`, `EmitType<T>` |

---

## Component Specs

### Input (Utility Namespace)

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/input/api-contract/spec.md`](components/input/api-contract/spec.md) | Static API, InputObject shape, public methods |
| Floating Label | [`components/input/floating-label/spec.md`](components/input/floating-label/spec.md) | FloatLabelType enum, label animation, placeholder rules |

→ [Input Component Spec Index](components/input/README.md)

---

### TextBox

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/textbox/api-contract/spec.md`](components/textbox/api-contract/spec.md) | Properties, events, value binding |

→ [TextBox Component Spec Index](components/textbox/README.md)

---

### TextArea

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/textarea/api-contract/spec.md`](components/textarea/api-contract/spec.md) | Properties, resize modes, character count |

→ [TextArea Component Spec Index](components/textarea/README.md)

---

### SmartTextArea

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/smart-textarea/api-contract/spec.md`](components/smart-textarea/api-contract/spec.md) | AI suggestion API, endpoint config |
| AI Integration | [`components/smart-textarea/ai-integration/spec.md`](components/smart-textarea/ai-integration/spec.md) | Request/response contract, debounce, error handling |

→ [SmartTextArea Component Spec Index](components/smart-textarea/README.md)

---

### NumericTextBox

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/numerictextbox/api-contract/spec.md`](components/numerictextbox/api-contract/spec.md) | `value`, `min`, `max`, `step`, `strictMode` |
| Formatting | [`components/numerictextbox/formatting/spec.md`](components/numerictextbox/formatting/spec.md) | Locale patterns, decimal precision, currency/percent modes |
| Spin Interaction | [`components/numerictextbox/spin-interaction/spec.md`](components/numerictextbox/spin-interaction/spec.md) | Spin button click, acceleration, keyboard step rules |

→ [NumericTextBox Component Spec Index](components/numerictextbox/README.md)

---

### MaskedTextBox

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/maskedtextbox/api-contract/spec.md`](components/maskedtextbox/api-contract/spec.md) | `mask`, `value`, `promptChar`, `customCharacters` |
| Mask Engine | [`components/maskedtextbox/mask-engine/spec.md`](components/maskedtextbox/mask-engine/spec.md) | Built-in mask chars, pattern validation, cursor rules |

→ [MaskedTextBox Component Spec Index](components/maskedtextbox/README.md)

---

### Slider

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/slider/api-contract/spec.md`](components/slider/api-contract/spec.md) | `value`, `min`, `max`, `type`, `step`, `orientation` |
| Interaction | [`components/slider/interaction/spec.md`](components/slider/interaction/spec.md) | Drag, keyboard nav, Range two-thumb logic, limits |
| Ticks & Tooltip | [`components/slider/ticks-tooltip/spec.md`](components/slider/ticks-tooltip/spec.md) | `TicksData`, `TooltipData`, rendering, formatting |
| Color Range | [`components/slider/color-range/spec.md`](components/slider/color-range/spec.md) | `ColorRangeData[]`, gradient rendering, CSS approach |

→ [Slider Component Spec Index](components/slider/README.md)

---

### ColorPicker

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/color-picker/api-contract/spec.md`](components/color-picker/api-contract/spec.md) | `value`, `mode`, `inline`, `showButtons`, `presets` |
| Picker Mode | [`components/color-picker/picker-mode/spec.md`](components/color-picker/picker-mode/spec.md) | HSV canvas, hue/opacity bars, hex/RGB/HSV inputs |
| Palette Mode | [`components/color-picker/palette-mode/spec.md`](components/color-picker/palette-mode/spec.md) | Tile grid, preset groups, `noColor` option |

→ [ColorPicker Component Spec Index](components/color-picker/README.md)

---

### Uploader

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/uploader/api-contract/spec.md`](components/uploader/api-contract/spec.md) | `asyncSettings`, `allowedExtensions`, `autoUpload`, methods |
| Chunk Upload | [`components/uploader/chunk-upload/spec.md`](components/uploader/chunk-upload/spec.md) | Chunk split, pause/resume, retry, cancel, progress events |
| Drag & Drop | [`components/uploader/drag-drop/spec.md`](components/uploader/drag-drop/spec.md) | Drop zone config, drag state CSS, file list building |

→ [Uploader Component Spec Index](components/uploader/README.md)

---

### FormValidator

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/form-validator/api-contract/spec.md`](components/form-validator/api-contract/spec.md) | `rules`, `validationMode`, `validate()`, `reset()` |
| Rules Engine | [`components/form-validator/rules-engine/spec.md`](components/form-validator/rules-engine/spec.md) | Built-in rules, custom rule registration, EJ2 component awareness |

→ [FormValidator Component Spec Index](components/form-validator/README.md)

---

### OTPInput

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/otp-input/api-contract/spec.md`](components/otp-input/api-contract/spec.md) | `length`, `type`, `separator`, auto-advance, paste handling |

→ [OTPInput Component Spec Index](components/otp-input/README.md)

---

### Rating

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/rating/api-contract/spec.md`](components/rating/api-contract/spec.md) | `value`, `itemsCount`, `precision`, `readOnly`, templates |

→ [Rating Component Spec Index](components/rating/README.md)

---

### Signature

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/signature/api-contract/spec.md`](components/signature/api-contract/spec.md) | `backgroundColor`, `strokeColor`, save/load/clear |
| Canvas Drawing | [`components/signature/canvas-drawing/spec.md`](components/signature/canvas-drawing/spec.md) | Bezier smoothing, undo/redo stack, stroke lifecycle |

→ [Signature Component Spec Index](components/signature/README.md)

---

### SpeechToText

| Spec | Path | Summary |
|------|------|---------|
| API Contract | [`components/speech-to-text/api-contract/spec.md`](components/speech-to-text/api-contract/spec.md) | `lang`, `interimResults`, start/stop, transcript events |

→ [SpeechToText Component Spec Index](components/speech-to-text/README.md)

---

## Quick Decision Tree

```
What type of change?
│
├── Bug fix in ONE component
│     └── Read: component api-contract/spec.md
│              + capability spec for the buggy area
│              + testing-standards/spec.md
│
├── New property or event (ONE component)
│     └── Read: component api-contract/spec.md
│              + property-event-system/spec.md
│              + testing-standards/spec.md
│              + accessibility/spec.md (if user-visible)
│
├── New feature spanning ONE capability area
│     └── Read: component api-contract/spec.md
│              + relevant capability spec
│              + testing-standards/spec.md
│              + 1-2 foundation specs (lifecycle? CSS?)
│
├── Change to Input namespace (affects 7 components)
│     └── Read: components/input/api-contract/spec.md
│              + components/input/floating-label/spec.md
│              + testing-standards/spec.md
│              + component-lifecycle/spec.md
│              + css-architecture/spec.md
│
├── Cross-component change (2+ components)
│     └── Read: api-contract/spec.md for EACH affected component
│              + shared capability specs
│              + testing-standards/spec.md (once)
│              + relevant foundation specs
│
└── Base class or foundation pattern change
      └── Read: ALL 5 foundation specs
               + api-contract/spec.md for every affected component
```

---

## Example Scenarios

### Scenario A — Bug Fix: NumericTextBox spin buttons not stepping in `strictMode`
**Specs to read (3):**
1. `components/numerictextbox/spin-interaction/spec.md`
2. `components/numerictextbox/api-contract/spec.md` (check `strictMode` definition)
3. `testing-standards/spec.md` (confirm test pattern)

### Scenario B — New Feature: Add `clearButton` to OTPInput
**Specs to read (4):**
1. `components/otp-input/api-contract/spec.md`
2. `components/input/api-contract/spec.md` (clear button is in Input namespace)
3. `property-event-system/spec.md` (adding `@Property`)
4. `testing-standards/spec.md`

### Scenario C — Cross-component: Sync Slider opacity bar value into ColorPicker text input
**Specs to read (5):**
1. `components/slider/api-contract/spec.md`
2. `components/slider/interaction/spec.md`
3. `components/color-picker/picker-mode/spec.md`
4. `components/color-picker/api-contract/spec.md`
5. `testing-standards/spec.md`

### Scenario D — Foundation Change: Update all components for new lifecycle hook
**Specs to read (6–10):**
1–5. ALL 5 foundation specs  
6–10. `api-contract/spec.md` for each affected component

---

## Spec Count Summary

| Category | Count |
|----------|-------|
| Foundation specs | 5 |
| Component api-contract specs | 14 |
| Component capability specs | 9 |
| **Total** | **28** |
