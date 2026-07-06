# Specification Index

**Package**: `@syncfusion/ej2-buttons`  
**Last Updated**: 2026-03-16  
**Total Specs**: 5 foundation + 21 component capability specs = **26 total**

---

## ⚠️ How to Use This Index

**CRITICAL**: Do NOT read all 26 specs for every change. Follow this process:

1. **Identify which component(s)** are affected by your change
2. **Read the component's README.md** to select relevant capability specs
3. **Read 3–5 relevant specs**, not all 26

---

## Foundation Specs (Apply to ALL Components)

These 5 specs cover cross-cutting concerns that apply to every component.

| Spec | Scope | When to Read |
|------|-------|--------------|
| [component-lifecycle](./component-lifecycle/spec.md) | preRender → render → onPropertyChanged → destroy | When modifying lifecycle methods, adding a new component, or fixing a destroy/re-render bug |
| [property-system](./property-system/spec.md) | @Property declarations, onPropertyChanged, model files, sanitizer | When adding/changing a @Property, fixing reactive property bugs, or editing model files |
| [css-architecture](./css-architecture/spec.md) | e- class prefix, RTL, state class lifecycle, cssClass handling | When adding CSS classes, changing RTL support, or fixing visual state bugs |
| [testing-standards](./testing-standards/spec.md) | Test file structure, DOM/property/event/RTL/memory tests, coverage thresholds | **Every change** that adds or modifies code or tests |
| [accessibility](./accessibility/spec.md) | ARIA roles, keyboard navigation, focus visibility, disabled state | **Every UI change** or interaction change |

**Foundation Spec Selection Quick Guide**:
- Code change of any kind → always read `testing-standards`
- UI / visual change → add `css-architecture` + `accessibility`
- New property or property bug → add `property-system`
- Lifecycle method change → add `component-lifecycle`
- New component scaffold → read ALL 5 foundation specs

---

## Component Specs (Component-Specific Capabilities)

### Button

**Purpose**: Graphical trigger button with icon, toggle, and variant support  
**Location**: `src/button/button.ts`  
**Base Class**: `Component<HTMLButtonElement>`  
**Capability Count**: 3 specs  
**Component Index**: [components/button/README.md](./components/button/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/button/api-contract/spec.md) | All @Property, events, methods, enums | **Always** for any Button change |
| [icon-rendering](./components/button/icon-rendering/spec.md) | iconCss, iconPosition (Left/Right/Top/Bottom), icon-only mode | Icon changes, setIconCss bugs, iconPosition transitions |
| [toggle-and-variants](./components/button/toggle-and-variants/spec.md) | isToggle, isPrimary, cssClass variants, ripple | Toggle behavior, variant styling, e-active state |

---

### CheckBox

**Purpose**: Tri-state form input (checked/unchecked/indeterminate) with label  
**Location**: `src/check-box/check-box.ts`  
**Base Class**: `Component<HTMLInputElement>`  
**Capability Count**: 3 specs  
**Component Index**: [components/check-box/README.md](./components/check-box/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/check-box/api-contract/spec.md) | Properties, events, methods, model | **Always** for any CheckBox change |
| [state-management](./components/check-box/state-management/spec.md) | checked/indeterminate state transitions, changeState(), form reset | State transition bugs, indeterminate behavior, form validation |
| [label-and-form](./components/check-box/label-and-form/spec.md) | label, labelPosition, name, value, hidden input, htmlAttributes | Label rendering, form serialization, Vue array model |

---

### RadioButton

**Purpose**: Group-bound single-selection form input  
**Location**: `src/radio-button/radio-button.ts`  
**Base Class**: `Component<HTMLInputElement>`  
**Capability Count**: 2 specs  
**Component Index**: [components/radio-button/README.md](./components/radio-button/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/radio-button/api-contract/spec.md) | Properties, events, methods | **Always** for any RadioButton change |
| [group-selection](./components/radio-button/group-selection/spec.md) | Group behavior via name attribute, mutual exclusion, label positioning | Group selection bugs, label RTL, form integration |

---

### Switch

**Purpose**: On/Off boolean toggle with on-label/off-label  
**Location**: `src/switch/switch.ts`  
**Base Class**: `Component<HTMLInputElement>`  
**Capability Count**: 2 specs  
**Component Index**: [components/switch/README.md](./components/switch/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/switch/api-contract/spec.md) | Properties, events, methods | **Always** for any Switch change |
| [toggle-and-labels](./components/switch/toggle-and-labels/spec.md) | checked state, onLabel/offLabel, size variants, Blazor bridge | Toggle behavior, label rendering, Blazor interop |

---

### Chips

**Purpose**: ChipList / single Chip with selection, deletion, and avatar  
**Location**: `src/chips/chip-list.ts`, `src/chips/chip.ts`  
**Base Class**: `Component<HTMLElement>`  
**Capability Count**: 3 specs  
**Component Index**: [components/chips/README.md](./components/chips/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/chips/api-contract/spec.md) | ChipList/Chip properties, events, methods | **Always** for any Chips change |
| [selection](./components/chips/selection/spec.md) | None/Single/Multiple/Input selection modes, getSelectedChips | Selection mode bugs, e-active state |
| [chip-rendering](./components/chips/chip-rendering/spec.md) | DOM structure, avatar, leading/trailing icon, chip-set vs single-chip | Rendering bugs, icon/avatar display |

---

### FloatingActionButton (FAB)

**Purpose**: Positioned FAB inheriting from Button  
**Location**: `src/floating-action-button/floating-action-button.ts`  
**Base Class**: Button  
**Capability Count**: 2 specs  
**Component Index**: [components/floating-action-button/README.md](./components/floating-action-button/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/floating-action-button/api-contract/spec.md) | FAB-specific properties, events, position enum, Blazor | **Always** for any FAB change |
| [positioning](./components/floating-action-button/positioning/spec.md) | 9 FabPosition values, target scoping, CSS custom properties | Position bugs, target scoping, viewport clipping |

---

### SpeedDial

**Purpose**: FAB with expandable action items (linear/radial layout)  
**Location**: `src/speed-dial/speed-dial.ts`  
**Base Class**: `Component<HTMLElement>` (embeds FAB)  
**Capability Count**: 4 specs  
**Component Index**: [components/speed-dial/README.md](./components/speed-dial/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/speed-dial/api-contract/spec.md) | All properties, events, methods, SpeedDialItemModel | **Always** for any SpeedDial change |
| [action-items](./components/speed-dial/action-items/spec.md) | items array, SpeedDialItemModel, item rendering, icons/text | Item rendering, dynamic item changes |
| [open-close-behavior](./components/speed-dial/open-close-behavior/spec.md) | open()/close(), openOnHover, animation, overlay, keyboard ESC | Open/close bugs, animation, overlay |
| [layout-modes](./components/speed-dial/layout-modes/spec.md) | Linear (vertical/horizontal), Radial (RadialSettings), template mode | Layout positioning, radial angle, overflow |

---

### SmartPasteButton

**Purpose**: AI-powered paste button extending Button  
**Location**: `src/smart-paste-button/smart-paste-button.ts`  
**Base Class**: Button  
**Capability Count**: 2 specs  
**Component Index**: [components/smart-paste-button/README.md](./components/smart-paste-button/README.md)

| Capability | What It Covers | Read When |
|------------|----------------|-----------|
| [api-contract](./components/smart-paste-button/api-contract/spec.md) | Extended properties, pasteBegin/pasteComplete events | **Always** for any SmartPasteButton change |
| [ai-paste](./components/smart-paste-button/ai-paste/spec.md) | Clipboard reading, AI inference, form field auto-fill behavior | AI paste flow, event handling, error cases |

---

## Spec Selection Strategy

### Step 1: Identify Component
"Which component am I changing?" → Narrows from 26 specs to ~2–4 component specs

### Step 2: Identify Capability
"Which capability area does this affect?" → Narrows to 1–2 component specs

### Step 3: Add Foundation Specs
"Which cross-cutting concerns apply?" → Adds 1–3 foundation specs

### Result: Read 3–5 Relevant Specs Instead of 26 ✅

---

## Example Scenarios

### Fix icon rendering bug in Button
1. `components/button/README.md` (navigation)
2. `components/button/api-contract/spec.md`
3. `components/button/icon-rendering/spec.md` ← specific area
4. `testing-standards/spec.md`

### Add a new property to CheckBox
1. `components/check-box/README.md`
2. `components/check-box/api-contract/spec.md`
3. `testing-standards/spec.md` + `accessibility/spec.md`
4. `property-system/spec.md` (for @Property rules)

### Fix SpeedDial not closing on Escape
1. `components/speed-dial/README.md`
2. `components/speed-dial/api-contract/spec.md`
3. `components/speed-dial/open-close-behavior/spec.md` ← specific area
4. `testing-standards/spec.md` + `accessibility/spec.md` (keyboard requirement)

### Accessibility improvement across all components
1. `accessibility/spec.md` (foundation — read fully)
2. All `api-contract/spec.md` files for affected components
3. `testing-standards/spec.md`

### Button change that may affect FAB and SmartPasteButton
1. `components/button/README.md`
2. `components/button/api-contract/spec.md`
3. `components/floating-action-button/api-contract/spec.md` (FAB extends Button)
4. `components/smart-paste-button/api-contract/spec.md` (SmartPasteButton extends Button)
5. `component-lifecycle/spec.md` (if lifecycle method changed)
6. `testing-standards/spec.md`

---

## Component Dependency Map

```
Button ← FloatingActionButton (FAB)
Button ← SmartPasteButton
FAB ← SpeedDial (embeds FAB at runtime)

common/ ← CheckBox
common/ ← RadioButton
common/ ← Switch

Chips → (standalone)
```

**Rule**: When changing Button, always check FAB, SmartPasteButton, and (transitively) SpeedDial.  
**Rule**: When changing `src/common/`, always check CheckBox, RadioButton, and Switch.

---

## Spec Maintenance

### When to Update This Index
- New component added → add component section
- New capability spec added → add row to component table
- Component relationship changes → update dependency map
- Spec renamed or moved → update all links

### Signs This Index is Stale
- Component listed here doesn't exist in `src/`
- New component in `src/` not listed here
- Capability count doesn't match actual files
- Links to specs that don't exist
