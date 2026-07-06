# RadioButton Component Specifications

**Component**: RadioButton  
**Location**: `src/radio-button/radio-button.ts`  
**Base Class**: `Component<HTMLInputElement>`  
**Status**: Stable  
**Capability Specs**: 2  
**Last Updated**: 2026-03-16  

---

## Quick Reference

| Your Task | Required Specs |
|-----------|----------------|
| Any RadioButton change | api-contract, testing-standards |
| Group selection bug | api-contract, group-selection, testing-standards |
| Label/RTL issue | api-contract, group-selection, css-architecture |
| common/ change | api-contract + CheckBox/Switch api-contract (cross-component) |

---

## Capability Specs (2)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
**Coverage**: Properties, ChangeEventArgs, events, methods, wrapper DOM  

### 2. [group-selection/spec.md](./group-selection/spec.md)
**Coverage**: `name` attribute grouping, mutual exclusion, label Before/After, form integration  
