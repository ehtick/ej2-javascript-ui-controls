# SpeedDial Component Specifications

**Component**: SpeedDial  
**Location**: `src/speed-dial/speed-dial.ts` (~1830 lines)  
**Base Class**: `Component<HTMLButtonElement>` (embeds FAB button internally)  
**Blazor Bridge**: `blazor/sf-speeddial.ts`  
**Status**: Stable  
**Capability Specs**: 4  
**Last Updated**: 2026-03-16  

---

## Quick Reference

| Your Task | Required Specs |
|-----------|----------------|
| Any SpeedDial change | api-contract, testing-standards |
| Action item bug | api-contract, action-items |
| Open/close/animation | api-contract, open-close-behavior |
| Radial/Linear layout | api-contract, layout-modes |
| Popover template | layout-modes |
| Keyboard nav | open-close-behavior, accessibility |

---

## Capability Specs (4)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
### 2. [action-items/spec.md](./action-items/spec.md)
**Coverage**: SpeedDialItemModel, item DOM, beforeItemRender, dynamic updates
### 3. [open-close-behavior/spec.md](./open-close-behavior/spec.md)
**Coverage**: open()/close() methods, overlay, animation, keyboard, lifecycle events
### 4. [layout-modes/spec.md](./layout-modes/spec.md)
**Coverage**: Linear (vertical/horizontal), Radial (angles/direction), popupTemplate, CSS custom properties

---

## ⚠️ Complexity Note

SpeedDial is the most complex component in this repo (~1830 lines). It internally creates and manages:
- A FAB trigger button
- An action items list popup
- An optional overlay element
- Animation state machine

Read ALL 4 capability specs before making changes to SpeedDial.
