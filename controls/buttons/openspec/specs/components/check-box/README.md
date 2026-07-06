# CheckBox Component Specifications

**Component**: CheckBox  
**Location**: `src/check-box/check-box.ts`  
**Model**: `src/check-box/check-box-model.ts`  
**Spec**: `spec/check-box.spec.ts`  
**A11y**: `accessibility/checkbox.accessibility.test.ts`  
**Base Class**: `Component<HTMLInputElement>`  
**Status**: Stable  
**Capability Specs**: 3  
**Last Updated**: 2026-03-16  

---

## Quick Reference

| Your Task | Required Specs | Also Read |
|-----------|----------------|-----------|
| Add new @Property | api-contract, property-system, testing-standards | — |
| Fix checked/indeterminate state bug | api-contract, state-management, testing-standards | accessibility |
| Fix label rendering | api-contract, label-and-form, testing-standards | css-architecture |
| Fix form integration | api-contract, label-and-form, testing-standards | — |
| Fix RTL | api-contract, css-architecture, testing-standards | — |
| Fix destroy | api-contract, component-lifecycle, testing-standards | — |
| Change wrapperInitialize | api-contract, component-lifecycle, testing-standards | ⚠️ Also check RadioButton + Switch |

---

## Capability Specs (3)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
**Coverage**: All @Property, ChangeEventArgs, events, methods, wrapper DOM structure  
**When to update**: Any property, event, or method change

### 2. [state-management/spec.md](./state-management/spec.md)
**Coverage**: `checked`, `indeterminate`, `changeState()` internal, form validation interaction, click handler logic  
**When to update**: State transition bugs, indeterminate state issues, form validator integration

### 3. [label-and-form/spec.md](./label-and-form/spec.md)
**Coverage**: `label`, `labelPosition`, `name`, `value`, `htmlAttributes`, hidden input, Vue array model, form reset  
**When to update**: Label rendering, form serialization, htmlAttributes pass-through

---

## Capability Relationships

```
api-contract ← read for every CheckBox change
    ↓
    ├── state-management (checked/indeterminate/click flow)
    └── label-and-form   (label DOM, form integration, name/value)
```

---

## Cross-Component Impact

CheckBox shares `src/common/common.ts` with RadioButton and Switch. Changes to `wrapperInitialize()`, `rippleMouseHandler()`, `ChangeEventArgs`, or `setHiddenInput()` affect all three.

**Rule**: When modifying `src/common/`, always validate against CheckBox, RadioButton, and Switch specs.
