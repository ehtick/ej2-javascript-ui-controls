# Button Component Specifications

**Component**: Button  
**Location**: `src/button/button.ts`  
**Model**: `src/button/button-model.ts`  
**Spec**: `spec/button.spec.ts`  
**Base Class**: `Component<HTMLButtonElement>`  
**Extends**: —  
**Extended By**: FloatingActionButton, SmartPasteButton  
**Status**: Stable  
**Capability Specs**: 3  
**Last Updated**: 2026-03-16  

---

## Quick Reference

### When to Read Which Spec

| Your Task | Required Specs | Also Read |
|-----------|----------------|-----------|
| Add new @Property | api-contract, property-system, testing-standards | accessibility (if UI-visible) |
| Fix icon positioning bug | api-contract, icon-rendering, testing-standards | — |
| Fix toggle state bug | api-contract, toggle-and-variants, testing-standards | — |
| Add new variant (cssClass) | api-contract, toggle-and-variants, css-architecture | — |
| Fix RTL layout | api-contract, css-architecture, testing-standards | accessibility |
| Improve accessibility | api-contract, accessibility, testing-standards | — |
| Fix destroy cleanup | api-contract, component-lifecycle, testing-standards | — |
| Change ripple behavior | api-contract, toggle-and-variants, testing-standards | — |
| Change that affects FAB | api-contract (Button) + api-contract (FAB) | component-lifecycle |
| Change that affects SmartPaste | api-contract (Button) + api-contract (SmartPasteButton) | — |

---

## Capability Specs (3)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
**Coverage**: Full public API — properties, events, methods, enums, defaults  
**Requirements**: REQ-BTN-API-001 through REQ-BTN-API-008  
**When to update**: Any change to a @Property, event signature, method behavior, or default value

### 2. [icon-rendering/spec.md](./icon-rendering/spec.md)
**Coverage**: `iconCss`, `iconPosition` (Left/Right/Top/Bottom), icon-only mode (`e-icon-btn`), `setIconCss()` internals  
**Requirements**: REQ-BTN-ICON-001 through REQ-BTN-ICON-005  
**When to update**: Changes to icon positioning logic, icon span class management, Top/Bottom icon layout

### 3. [toggle-and-variants/spec.md](./toggle-and-variants/spec.md)
**Coverage**: `isToggle` / `e-active` state, `isPrimary`, cssClass variant lifecycle, ripple effect, click handler wiring  
**Requirements**: REQ-BTN-TOGGLE-001 through REQ-BTN-TOGGLE-005  
**When to update**: Toggle behavior changes, variant class management, ripple effect changes

---

## Capability Relationships

```
api-contract ← Central: read for almost every Button change
    ↓
    ├── icon-rendering   (governs iconCss + iconPosition handling)
    └── toggle-and-variants (governs isToggle, isPrimary, cssClass, ripple)
```

Both capability specs reference `api-contract` — the API contract is the authoritative source for property defaults and signatures.

---

## Cross-Component Impact

Button is the **base class** for two other components:

| Dependent Component | Impact of Button Changes |
|--------------------|--------------------------|
| FloatingActionButton | Inherits all Button @Property; any lifecycle or property system change propagates |
| SmartPasteButton | Inherits all Button @Property + methods; extends with AI paste behavior |
| SpeedDial | Uses FAB which uses Button — transitive dependency |

**Rule**: When modifying `src/button/button.ts`, always check `src/floating-action-button/` and `src/smart-paste-button/` for regressions.

---

## Related Foundation Specs

Always consider for Button changes:
- [testing-standards](../../testing-standards/spec.md) — every change
- [css-architecture](../../css-architecture/spec.md) — any class manipulation change
- [component-lifecycle](../../component-lifecycle/spec.md) — if render/destroy/wireEvents changes
- [property-system](../../property-system/spec.md) — if @Property or model changes
- [accessibility](../../accessibility/spec.md) — if interaction or ARIA changes
