# Chips / ChipList Component Specifications

**Component**: ChipList (also exports `Chip` alias)  
**Location**: `src/chips/chips.ts`  
**Base Class**: `Component<HTMLElement>`  
**Blazor Bridge**: None (JS-only)  
**Status**: Stable  
**Capability Specs**: 3  
**Last Updated**: 2026-03-16  

---

## Quick Reference

| Your Task | Required Specs |
|-----------|----------------|
| Any Chips change | api-contract, testing-standards |
| Selection bug | api-contract, selection |
| DOM/avatar rendering | api-contract, chip-rendering |
| New event | api-contract, testing-standards |

---

## Capability Specs (3)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
### 2. [selection/spec.md](./selection/spec.md)
**Coverage**: None/Single/Multiple/Input selection modes, e-active state, getSelectedChips
### 3. [chip-rendering/spec.md](./chip-rendering/spec.md)
**Coverage**: single-chip vs chip-set DOM, avatar, icons, chip-set role=listbox
