# SmartPasteButton Component Specifications

**Component**: SmartPasteButton  
**Location**: `src/smart-paste-button/smart-paste-button.ts`  
**Base Class**: `Button` (`src/button/button.ts`)  
**Blazor Bridge**: None  
**Status**: Experimental  
**Capability Specs**: 2  
**Last Updated**: 2026-03-16  

---

## ⚠️ Experimental Status

SmartPasteButton is experimental. It extends Button with AI-driven clipboard-to-form-fill behavior. Public API may change without a major version bump. Test coverage may be lower than other components.

---

## Quick Reference

| Your Task | Required Specs |
|-----------|----------------|
| Any SmartPasteButton change | api-contract + Button api-contract, testing-standards |
| AI paste flow | api-contract, ai-paste |
| Button inheritance bug | Button api-contract + SmartPasteButton api-contract |

---

## Capability Specs (2)

### 1. [api-contract/spec.md](./api-contract/spec.md) ⭐ ALWAYS READ
### 2. [ai-paste/spec.md](./ai-paste/spec.md)
**Coverage**: Clipboard reading, AI inference, form field detection, pasteBegin/pasteComplete events, error handling

---

## Inheritance Note

SmartPasteButton inherits ALL Button capabilities. Before modifying SmartPasteButton, always read:
- `openspec/specs/components/button/api-contract/spec.md`
