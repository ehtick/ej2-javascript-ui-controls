# FloatingActionButton (FAB) Component Specifications

**Component**: FloatingActionButton  
**Location**: `src/floating-action-button/floating-action-button.ts`  
**Base Class**: `Button` (`src/button/button.ts`)  
**Blazor Bridge**: `blazor/sf-floating-action-button.ts`  
**Status**: Stable  
**Capability Specs**: 2  
**Last Updated**: 2026-03-16  

---

## Quick Reference

| Your Task | Required Specs |
|-----------|----------------|
| Any FAB change | api-contract + Button api-contract, testing-standards |
| Positioning bug | api-contract, positioning |
| Base Button change | Button api-contract + FAB api-contract (check inherited behavior) |
| Blazor interop | api-contract, positioning (Blazor section) |

---

## Capability Specs (2)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
### 2. [positioning/spec.md](./positioning/spec.md)
**Coverage**: 9-position system, CSS custom properties, target scoping, visibility control

---

## Inheritance Note

FAB inherits ALL Button capabilities. Before modifying FAB, always read:
- `openspec/specs/components/button/api-contract/spec.md`
- `openspec/specs/components/button/icon-rendering/spec.md`
