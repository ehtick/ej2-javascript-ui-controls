# Foundation Specs — TreeGrid

**Location**: `openspec/specs/foundation/`  
**Scope**: Cross-cutting concerns that apply to ALL TreeGrid features

---

## What Are Foundation Specs?

Foundation specs define **universal requirements** that every TreeGrid feature must satisfy. They are NOT feature-specific — they apply across the board.

Any feature spec in `openspec/specs/features/` MUST comply with all foundation specs unless explicitly noted as an exception (with justification).

---

## Foundation Spec Index

| Spec File | Concern | Key Requirement |
|-----------|---------|----------------|
| [`data-binding.md`](./data-binding.md) | Data sources, queries, DataManager | Every feature must handle local + remote data, preserve query clauses |
| [`event-handling.md`](./event-handling.md) | Event lifecycle, arguments, cancellation | Every feature must fire ActionBegin/ActionComplete in order; all events must be cancellable where appropriate |
| [`state-management.md`](./state-management.md) | Property management, state preservation | Every feature must preserve state across data refresh; properties must be gettable/settable |
| [`error-handling.md`](./error-handling.md) | Error detection, recovery, user feedback | Every feature must fire actionFailure on error; no silent failures |

---

## When Must You Load Foundation Specs?

**Always.** Every feature spec and every AI agent task MUST declare which foundation specs it depends on. Minimum:

```yaml
foundation_specs:
  - data-binding.md
  - event-handling.md
  - state-management.md
  - error-handling.md
```

Some features may only be primarily affected by one or two, but all four must be considered during implementation and testing.

---

## TreeGrid-Specific Foundation Extensions

### Data Binding Extension
TreeGrid extends the Grid data binding contract with:
- **Hierarchy flattening**: Tree data must be flattened before passing to Grid
- **Remote expand**: `remoteExpand: true` fires a second DataManager query per expanded row
- **Expand state from data**: `expandStateMapping` reads boolean fields from data to preset expand/collapse

### Event Handling Extension
TreeGrid extends the Grid event lifecycle with hierarchy events:
```
Expanding Phase:
  expanding (cancellable)     ← TreeGrid-owned
  → [expand logic runs]
  expanded                    ← TreeGrid-owned

Collapsing Phase:
  collapsing (cancellable)    ← TreeGrid-owned
  → [collapse logic runs]
  collapsed                   ← TreeGrid-owned
```
These fire around (not inside) actionBegin/actionComplete.

### State Management Extension
TreeGrid state includes:
- `expanded[]` — flat array of expanded row IDs
- `childRecords{}` — map of parent ID → child records (for remote expand cache)
- `flatData[]` — the current flat visible array

### Error Handling Extension
TreeGrid-specific error scenarios:
- Remote expand HTTP failure → `actionFailure({ actionName: 'RemoteExpand', error })`
- Invalid `childMapping` field → console.warn at data load time
- Circular hierarchy detected (row is its own ancestor) → console.error, row skipped

---

## Coverage Requirements

Foundation specs set global coverage targets. All code touching foundation areas must meet:

| Area | Minimum Coverage |
|------|-----------------|
| Data binding (src/treegrid/base/data.ts) | 90% |
| Event system (all trigger() calls) | 90% |
| State management (property getters/setters) | 90% |
| Error handling (catch blocks, actionFailure) | 85% |

---

## Adding a New Foundation Spec

If a new cross-cutting concern is discovered (e.g., i18n/localization, theme system), create a new file:

1. Create `openspec/specs/foundation/<concern>.md`
2. Add it to this README index table
3. Update `openspec/config.yaml` `docs_loading` section
4. Notify all feature spec owners to check compliance
