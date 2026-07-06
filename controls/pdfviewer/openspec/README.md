# OpenSpec — AI-Driven Development for ej2-pdfviewer

This directory enables **autonomous AI-driven development** for `@syncfusion/ej2-pdfviewer`.  
The AI uses the spec files here as the single source of truth when proposing, implementing, and reviewing code changes.

---

## Directory Layout

```
openspec/
├── config.yaml          # Project context, coding conventions, and per-artifact rules
├── README.md            # This file
├── specs/               # Feature specifications (one YAML file per feature)
│   └── _template.yaml   # Copy this to start a new spec
└── changes/             # Code-change descriptors produced by the AI after implementation
    ├── _template.yaml   # Copy this to start a new change descriptor
    └── archive/         # Change descriptors that have been merged into the codebase
```

---

## Workflow

### 1 — Write a Spec
1. Copy `specs/_template.yaml` → `specs/<feature-slug>.yaml`.
2. Fill in all sections: `overview`, `goals`, `non_goals`, `api_changes`, `acceptance_criteria`, `edge_cases`.
3. Set `status: review`, then `status: approved` once the team agrees.

### 2 — Generate Tasks
Ask the AI:
> "Generate implementation tasks for `openspec/specs/<feature-slug>.yaml`."

The AI reads the spec, breaks it into atomic tasks (≤ 2 h each), and populates the `tasks:` field.

### 3 — Implement
Ask the AI:
> "Implement task <N> from `openspec/specs/<feature-slug>.yaml`."

The AI follows the **implementation workflow** from `config.yaml`:
1. Update `pdfviewer-model.ts`
2. Update `pdfviewer.ts`
3. Implement in the owning sub-module
4. Export from `index.ts`
5. Write Jasmine tests

### 4 — Review the Change Descriptor
After implementation the AI creates `openspec/changes/<slug>-<date>.yaml`.  
Review it, then move it to `changes/archive/` when the PR is merged.

---

## Artifact Types

| Artifact | Trigger phrase | Output |
|---|---|---|
| **Proposal** | "Propose a spec for …" | `specs/<slug>.yaml` |
| **Tasks** | "Generate tasks for spec …" | Populated `tasks:` list |
| **Code change** | "Implement task N of spec …" | Modified source files + `changes/<slug>.yaml` |
| **Test** | "Write tests for spec …" | `spec/pdfviewer/<module>/<slug>.spec.ts` |

---

## Rules Summary (see `config.yaml` for full rules)

- **Specs**: one feature per file, testable acceptance criteria, TypeScript example included.
- **Tasks**: atomic (≤ 2 h), tagged with module path, ordered model → implementation → tests.
- **Changes**: must include `files_modified`, `files_added`, `test_coverage`; new public API needs JSDoc.
- **Proposals**: ≤ 600 words, Goals + Non-goals sections, complexity estimate.
