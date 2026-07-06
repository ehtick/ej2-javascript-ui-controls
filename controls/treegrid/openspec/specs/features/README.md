# Feature Specs — TreeGrid

**Location**: `openspec/specs/features/`  
**Scope**: Per-feature behavioral specifications

---

## Overview

Feature specs define the design, behavior, scenarios, and tasks for each TreeGrid feature. They are generated from the `features_index` in `openspec/config.yaml` and reviewed by AI agents before any implementation work.

---

## Feature Spec Index

| Feature | Spec File | Status | Source Files | Risk Level |
|---------|-----------|--------|-------------|------------|
| Sorting | `sorting.md` | 🔲 Pending | `src/treegrid/actions/sort.ts` | 🟡 Medium |
| Filtering | `filtering.md` | 🔲 Pending | `src/treegrid/actions/filter.ts` | 🟡 Medium |
| Paging | `paging.md` | 🔲 Pending | `openspec/components/pager.spec` | 🟡 Medium |
| Summary (Aggregate) | `summary.md` | 🔲 Pending | `src/treegrid/actions/summary.ts` | 🟡 Medium |
| Normal Editing | `editing.md` | 🔲 Pending | `src/treegrid/actions/edit.ts` | 🟠 High |
| Batch Editing | `batch-editing.md` | 🔲 Pending | `src/treegrid/actions/edit.ts` | 🟠 High |
| Selection | `selection.md` | 🔲 Pending | (via Grid selection) | 🟡 Medium |
| Freeze Column | `freeze-column.md` | 🔲 Pending | (via Grid freeze) | 🟠 High |
| Column Reorder | `column-reorder.md` | 🔲 Pending | (via Grid reorder) | 🟢 Low |
| Column Resize | `column-resize.md` | 🔲 Pending | (via Grid resize) | 🟢 Low |
| Column Menu | `column-menu.md` | 🔲 Pending | (via Grid column menu) | 🟡 Medium |
| Column Chooser | `column-chooser.md` | 🔲 Pending | (via Grid column chooser) | 🟡 Medium |
| Virtual Scroll | `virtual-scroll.md` | 🔲 Pending | `openspec/components/virtualization.spec` | 🔴 Critical |
| Infinite Scroll | `infinite-scroll.md` | 🔲 Pending | (via Grid infinite scroll) | 🟠 High |
| Excel Export | `excel-export.md` | 🔲 Pending | `src/treegrid/actions/excel-export.ts` | 🟠 High |
| PDF Export | `pdf-export.md` | 🔲 Pending | `src/treegrid/actions/pdf-export.ts` | 🟠 High |
| Print | `print.md` | 🔲 Pending | (via Grid print) | 🟡 Medium |
| Toolbar | `toolbar.md` | 🔲 Pending | (via Grid toolbar) | 🟢 Low |
| Context Menu | `context-menu.md` | 🔲 Pending | (via Grid context menu) | 🟢 Low |
| Detail Row | `detail-row.md` | 🔲 Pending | `src/treegrid/actions/detail-row.ts` | 🟡 Medium |
| Clipboard | `clipboard.md` | 🔲 Pending | `blazor/clipboard.ts` | 🟢 Low |
| Row Drag & Drop | `rowdragdrop.md` | 🔲 Pending | `src/treegrid/actions/rowdragdrop.ts` | 🔴 Critical |

**Status Legend**: 🔲 Pending | ✅ Complete | 🔄 In Progress | ⚠️ Needs Review

---

## Feature Priority Order

Based on `feature-risk.md` criticality and user impact:

### Tier 1 — Critical (Spec Required Before Any Code)
1. **Virtual Scroll** — Expand/collapse interaction risk is highest
2. **Row Drag & Drop** — Hierarchy mutation risk is highest
3. **Batch Editing** — Tree hierarchy + batch = complex interaction
4. **Freeze Column** — Scroll synchronization with hierarchy rendering

### Tier 2 — High Priority
5. **Normal Editing** — Core feature, many scenarios
6. **Excel Export** — Windows CI required
7. **PDF Export** — Windows CI required
8. **Infinite Scroll** — Interaction with hierarchy

### Tier 3 — Standard
9. Sorting, Filtering, Paging, Selection, Summary
10. Column Menu, Column Chooser, Column Reorder, Column Resize

### Tier 4 — Low Risk
11. Toolbar, Context Menu, Clipboard, Print

---

## Creating a Feature Spec

Use the template at `openspec/specs/00-spec-template.md`. Every feature spec MUST include:

1. **Problem / Motivation** — Why does this feature exist? What user need does it solve?
2. **Goals** — What the feature WILL do
3. **Non-Goals** — What the feature will NOT do (prevents scope creep)
4. **Design**
   - Mechanism (HOW it works step by step)
   - Data Flow (input → processing → output)
   - Constants Used (from `src/treegrid/base/constant.ts`)
   - API Changes (new/modified properties, methods, events)
5. **Scenarios**
   - Happy Path
   - Edge Cases (empty data, remote data, virtual scroll, frozen, hierarchy, Windows)
6. **Tasks** (linked to `openspec/tasks/`)
7. **Accessibility**
8. **Open Questions**

---

## Mandatory Foundation Spec Compliance

Every feature spec MUST check compliance with:

| Foundation Spec | Key Question to Answer |
|----------------|----------------------|
| `data-binding.md` | How does this feature handle local vs remote data? |
| `event-handling.md` | What events does this feature fire? Are they in the right sequence? |
| `state-management.md` | What state does this feature own? How is it preserved? |
| `error-handling.md` | What errors can this feature encounter? How are they handled? |

---

## TreeGrid-Specific Feature Requirements

Every feature spec MUST address these TreeGrid-specific scenarios:

| Scenario | Description |
|----------|-------------|
| **Hierarchy interaction** | How does this feature behave with expanded vs collapsed rows? |
| **Remote expand + feature** | How does this feature interact with `remoteExpand: true`? |
| **Virtual scroll + feature** | Is this feature supported with `enableVirtualization: true`? Any limitations? |
| **Frozen column + feature** | Is this feature supported with `frozenColumns > 0`? |
| **Windows CI** | Does this feature require Windows CI testing? (exports, file paths) |

---

## Spec Review Checklist

Before marking a feature spec ✅ Complete:

- [ ] All sections from template filled in
- [ ] Foundation spec compliance checked (data-binding, events, state, error-handling)
- [ ] TreeGrid-specific scenarios covered (hierarchy, remote-expand, virtual-scroll)
- [ ] API changes documented and reflected in `treegrid.spec`
- [ ] Risk level assessed and `feature-risk.md` updated if interactions added
- [ ] Tasks created in `openspec/tasks/<feature>-tasks.md`
- [ ] Accessibility section complete (ARIA, keyboard navigation)
- [ ] Windows CI flag set in `config.yaml` if export/file path involved
