# Uploader — Component Spec Index

**Component:** Uploader  
**Location:** `src/uploader/uploader.ts` (4 459 loc)  
**Status:** Stable — Largest component file

## Specs

| Spec | Path | Priority |
|------|------|----------|
| API Contract | [`api-contract/spec.md`](api-contract/spec.md) | ⭐ Always read first |
| Chunk Upload | [`chunk-upload/spec.md`](chunk-upload/spec.md) | Large file chunking, pause/resume/retry |
| Drag & Drop | [`drag-drop/spec.md`](drag-drop/spec.md) | Drop zone, drag state, file list |

## LOC Budget
Hard LOC budget of **5 000 lines** (`openspec/config.yaml`).  
Current: 4 459 — remaining headroom: ~541 lines.

## Tech Debt Note
Chunk upload logic is deeply nested. New features should be extracted to helper functions
rather than further nesting the existing code paths.
