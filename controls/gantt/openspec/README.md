# OpenSpec — EJ2 Gantt AI Development Guide

> **All AI-assisted development in this project runs through the OpenSpec framework.**  
> This README is your single reference for understanding the process, the skills, and the guardrails.

---

## 🚦 CRITICAL: Query Helper MUST Run First

> **⚠️ BEFORE doing ANYTHING with a user query, determine if query-helper should run.**

Every query (explore, bug-fix, feature-dev, etc.) MUST first pass through query-helper to optimize scope and reduce credit usage by 50-80%.

### Auto-Trigger Patterns (Ask Clarifying Questions BEFORE Proceeding)

| Pattern | Example | Action |
|---|---|---|
| ❌ No file path | "review my code", "find the bug" | Ask: "Which file?" via `ask_questions` tool |
| ❌ Vague scope | "check everything", "analyze project" | Ask: "What specifically?" via `ask_questions` tool |
| ❌ About to use agent | Simple lookups like "which file handles X?" | Ask: "Direct answer OK?" (saves 75% credits) |
| ⚠️ Session bloat | 4+ messages in same conversation | Warn: "Start new chat for next task" |

### Classification Logic

```
1. Read user query
2. Classify:
   • SPECIFIC   = Has file path + method name → Proceed directly
   • TARGETED   = Has feature keyword → Load only that feature spec
   • VAGUE      = Neither → INVOKE ask_questions BEFORE reading any files

3. If VAGUE:
   - Use Code Studio's ask_questions tool to clarify
   - Reconstruct optimized query
   - Show cost comparison (original vs optimized)
   - THEN proceed with appropriate skill

4. If SPECIFIC or TARGETED:
   - Proceed directly (query-helper not needed)
```

### Query Routing Table

| User Input Pattern | First Check | Then Route To | Notes |
|---|---|---|---|
| Vague scope ("review code", "find bugs") | Run query-helper clarification | Appropriate skill after optimization | Saves 60-85% credits |
| No file path given | Ask for file path first | Target skill after path provided | Avoids workspace-wide search |
| Exploratory question | Clarify scope via query-helper | `/opsx:explore` with optimized query | Prevents unfocused exploration |
| Bug fix request with no feature mentioned | Ask which feature + symptom | `/opsx:bug-fix` with pre-loaded spec | Loads only 1 feature spec, not all 24 |
| Feature dev request with no scope | Ask scope + risk estimate | `/opsx:feature-dev` with boundaries | Prevents scope creep |
| Simple lookup ("which file...") | Offer direct answer (feature index) | Direct response (no agent) | Saves 75% credits vs agent call |

### Manual Invocation

```bash
# Optimize a query before processing
/opsx:query-helper <your-question>

# Check current session bloat
/opsx:query-helper

# Example
/opsx:query-helper review virtual scrolling code
```

### Integration with Skills

All skills (explore, bug-fix, feature-dev, etc.) expect optimized queries. Query-helper runs BEFORE skill invocation to ensure:
- Specific file paths are known (no blind workspace scans)
- Feature keywords are identified (load only matching spec)
- Session bloat is managed (warn at 4+ messages)
- Agent calls are justified (not used for simple lookups)

**Reference:** See `.github/skills/openspec-query-helper/SKILL.md` for complete implementation details.

---

## Table of Contents
1. [What is OpenSpec?](#1-what-is-openspec)
2. [Workspace Layout](#2-workspace-layout)
3. [Core Workflow — The Change Lifecycle](#3-core-workflow--the-change-lifecycle)
4. [How to Fix a Bug](#4-how-to-fix-a-bug)
5. [How to Develop a Feature](#5-how-to-develop-a-feature)
6. [Security & Safety Rules](#6-security--safety-rules)
7. [Token & Memory Management](#7-token--memory-management)
8. [Skills Reference](#8-skills-reference)
8a. [Canonical Specs Reference](#8a-canonical-specs-reference)
9. [Prompts Reference](#9-prompts-reference)
10. [Artifact Reference](#10-artifact-reference)
11. [Validation Protocol](#11-validation-protocol)
12. [Lessons Learned](#12-lessons-learned)

---

## 1. What is OpenSpec?

OpenSpec is a **spec-driven AI development framework** that structures every change — bug fix or new feature — through a series of traceable, reviewable artifacts before any code is written.

### Why OpenSpec (instead of raw agent prompts)?

| Old approach (ad-hoc prompts) | OpenSpec approach |
|---|---|
| Agents run ad-hoc, no persistent context | Every change lives in `openspec/changes/<name>/` |
| Token management was manual and inconsistent | Token budget enforced by `config.yaml` and token-optimize skill |
| Security rules were advisory | Security audit is a blocking gate before implementation |
| Lessons were scattered and lost between sessions | Lessons live in `openspec/specs/lessons-learned.md`, versioned |
| No explicit bug vs feature workflow | Dedicated skills: `openspec-bug-fix`, `openspec-feature-dev` |

---

## 2. Workspace Layout

```
openspec/
├── config.yaml                        ← Project context + per-artifact rules (AI reads this)
├── README.md                          ← This file
├── docs/                              ← Reference documentation
│   ├── product.md                     ← Product identity — capabilities, quality bars, non-goals
│   ├── workflow.md                    ← 6-phase lifecycle contract with ASCII diagram
│   └── QUERY-OPTIMIZATION.md          ← Credit-saving comprehensive guide
├── specs/                             ← Canonical foundation specs (authoritative baselines)
│   ├── features/index.md              ← Quick-Lookup → 24 feature folder paths
│   ├── features/<feature>/spec.md    ← Full detail for one feature
│   ├── component-lifecycle/spec.md    ← Class hierarchy, layer contracts, render pipeline
│   ├── typescript-standards/spec.md   ← ES5 rules, type safety, security, forbidden patterns
│   ├── accessibility/spec.md          ← WCAG 2.1 AA — ARIA, keyboard, focus management
│   ├── testing/spec.md                ← Jasmine patterns, coverage targets, spec structure
│   ├── css-architecture/spec.md       ← CSS naming, SVG conventions, theme support
│   └── lessons-learned.md             ← Persistent AI memory — confirmed corrections
└── changes/
    ├── <active-change>/               ← Work in progress
    │   ├── .openspec.yaml
    │   ├── EXPLORATION.md             ← Evidence: file:method:line — created before proposal
    │   ├── proposal.md
    │   ├── design.md
    │   ├── tasks.md
    │   └── specs/                     ← Delta specs for this change
    └── archive/
        └── YYYY-MM-DD-<name>/         ← Completed changes

.github/
├── docs/                              ← Quick reference documentation
│   ├── CREDIT-SAVING-CHEATSHEET.md    ← Printable quick reference card
│   └── QUERY-HELPER-WORKFLOW.md       ← Visual workflow diagrams
├── prompts/                           ← Slash-command prompts (IDE integration)
│   ├── opsx-propose.prompt.md
│   ├── opsx-apply.prompt.md
│   ├── opsx-explore.prompt.md
│   ├── opsx-archive.prompt.md
│   ├── opsx-bug-fix.prompt.md
│   ├── opsx-feature-dev.prompt.md
│   ├── opsx-security-check.prompt.md
│   ├── opsx-query-helper.prompt.md    ← Query optimizer prompt
│   └── opsx-spec-author.prompt.md
└── skills/                            ← Reusable skill definitions
    ├── openspec-propose/
    ├── openspec-apply-change/
    ├── openspec-explore/
    ├── openspec-archive-change/
    ├── openspec-bug-fix/              ← EJ2 Gantt — bug fix with confidence rating
    ├── openspec-feature-dev/          ← EJ2 Gantt — feature dev with risk rating
    ├── openspec-security-check/       ← EJ2 Gantt — blocking security audit gate
    ├── openspec-token-optimize/       ← EJ2 Gantt — token budget and memory guidance
    └── openspec-spec-author/          ← EJ2 Gantt — author/enrich canonical 15-section feature specs
```

---

## 3. Core Workflow — The Change Lifecycle

Every change (bug fix or feature) follows this lifecycle:

```
┌─────────────┐    ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐
│  /opsx:     │    │  /opsx:      │    │  /opsx:          │    │  /opsx:       │
│  explore    │───▶│  propose     │───▶│  security-check  │───▶│  apply        │
│  (optional) │    │  (artifacts) │    │  (gate)          │    │  (implement)  │
└─────────────┘    └──────────────┘    └──────────────────┘    └───────┬───────┘
                                                                        │
                                                                        ▼
                                                               ┌───────────────┐
                                                               │  /opsx:       │
                                                               │  archive      │
                                                               │  (finalize)   │
                                                               └───────────────┘
```

### Phase descriptions

| Phase | Command | What happens |
|---|---|---|
| **Explore** | `/opsx:explore` | Think through the problem; read codebase; no code written |
| **Propose** | `/opsx:propose` or `/opsx:bug-fix` or `/opsx:feature-dev` | Create change + generate proposal, design, tasks artifacts |
| **Security gate** | `/opsx:security-check` | Audit artifacts for security, accessibility, TS rules; BLOCK if issues found |
| **Implement** | `/opsx:apply` | Work through tasks.md; mark tasks complete; pause on blockers |
| **Archive** | `/opsx:archive` | Sync delta specs → main specs; move change to archive |

---

## 4. How to Fix a Bug

> ⚠️ **Human-in-the-Loop Mandate**  
> The AI will NEVER auto-apply a bug fix. There are **4 mandatory confirmation gates** where the engineer must explicitly approve before the process continues. No source file is touched until GATE 4 is approved.

### The 8-Step Human-Gated Process

```
STEP 1: Analyze          → Feature spec + version check + lessons-learned
STEP 2: Replicate        → Confirm repro status (YES / NO / CANNOT DETERMINE)
STEP 3: Root Cause       → Exact file:method:line + evidence + confidence
         🔴 GATE 1 ──── AI STOPS → presents root cause → you reply YES or corrections
STEP 4: Use Cases        → All scenarios + Jasmine test stubs
         🔴 GATE 2 ──── AI STOPS → presents use cases → you reply YES / ADD / REMOVE
STEP 5: Solution Summary → All file changes, methods, why, alternatives
         🔴 GATE 3 ──── AI STOPS → presents solution → you reply APPROVE or CHANGE
STEP 6: Security Gate    → Standards checklist + tasks.md written
         🔴 GATE 4 ──── AI STOPS → shows final plan → you reply GO or STOP
STEP 7: Apply            → Task-by-task code changes (only after GO)
STEP 8: Validate         → compile + test + lint (+ smoke test for P0/P1)
```

### Step-by-step guide

**Step 1 — Gather inputs and invoke**

Prepare before starting:
- Bug description with steps to reproduce, expected vs actual behaviour
- Affected feature area — look it up in `openspec/specs/features/index.md`
- Affected method(s) — paste ≤ 120 lines, NOT the entire file
- Output of `npm list | grep @syncfusion` (version check)

```
/opsx:bug-fix fix-<short-description>
```

**Steps 2–3** — The AI analyzes, attempts replication, and identifies the root cause.

**GATE 1** — The AI STOPS and presents:
- Exact root cause (file:method:line)
- Supporting evidence from code
- Side effects
- Confidence: HIGH / MEDIUM / LOW

Reply `YES` to confirm or provide corrections to re-analyze. Low-confidence → hypothesis list only, no code.

**Step 4** — After GATE 1 approval, the AI designs use cases covering: primary scenario, edge cases, virtual scroll, resource view, regression.

**GATE 2** — The AI STOPS and presents the use case table + test stubs. Reply `YES`, `ADD: <scenario>`, or `REMOVE: UC-N`.

**Step 5** — After GATE 2 approval, the AI writes the complete solution summary (all files, all methods, why, alternatives considered).

**GATE 3** — The AI STOPS and presents the full solution. Reply `APPROVE` or `CHANGE: <what>`.

**Step 6** — After GATE 3 approval, the AI runs the security gate, writes `tasks.md`.

**GATE 4** — The AI STOPS and shows the final plan + security result. Reply `GO` to start implementation or `STOP` to cancel.

**Steps 7–8** — The AI applies changes task-by-task and validates:
```bash
npm run compile   # zero TS errors required
npm test          # all tests green (including all new UC specs)
npm run es-lint   # zero warnings
```

**Step 9 — Archive**
```
/opsx:archive fix-<short-description>
```

### Bug fix example flow (with gates)

```
User:   /opsx:bug-fix fix-dependency-line-missing-on-scroll

AI:     STEP 1: Loaded task-dependencies/spec.md, version OK
        STEP 2: Reproduced — matches WHEN/THEN scenario §5.3
        STEP 3: EXPLORATION.md created
                → connector-line.ts:updateConnector:L142 — null guard missing on scroll event

        🔴 GATE 1 OUTPUT:
        Root Cause: connector-line.ts:updateConnector:L142
        Evidence: taskbarElement is null when scroll fires before render completes
        Confidence: MEDIUM
        ⏸️ Do you confirm? Reply YES or provide corrections.

User:   YES

AI:     STEP 4: Use cases designed (UC-1..UC-4), test stubs written

        🔴 GATE 2 OUTPUT:
        | UC-1 | Scroll during initial load | taskbarElement null | No connector drawn, no error |
        | UC-2 | Scroll after expand | taskbarElement valid | Connector redrawn correctly |
        ⏸️ Use cases complete? Reply YES / ADD / REMOVE

User:   YES

AI:     STEP 5: Solution summary prepared

        🔴 GATE 3 OUTPUT:
        | connector-line.ts | updateConnector | L142–L145 | modify | Add null guard before SVG path |
        | dependency.spec.ts | — | new block | add | UC-1..UC-4 specs |
        ⏸️ Approve this solution? Reply APPROVE or CHANGE.

User:   APPROVE

AI:     STEP 6: Security gate ✅ PASS, tasks.md written (8 tasks)

        🔴 GATE 4 OUTPUT:
        Security: ✅ PASS
        Tasks ready: 8 tasks listed
        ⏸️ Apply changes? Reply GO or STOP.

User:   GO

AI:     STEP 7: Applying... Task 1–8 ✓
        STEP 8: compile ✅  test ✅ (47/47)  lint ✅

User:   /opsx:archive fix-dependency-line-missing-on-scroll
AI:     → Archived to openspec/changes/archive/2026-03-30-fix-dependency-line-missing-on-scroll/
```

---

## 5. How to Develop a Feature

### Step-by-step

**Step 1 — Explore first (recommended for non-trivial features)**
```
/opsx:explore "what would it take to add task baseline comparison"
```
This creates `EXPLORATION.md` and surfaces: affected architecture layers (from `openspec/specs/component-lifecycle/spec.md`), cross-cutting concerns (virtual scroll, Blazor, export — from the matching `openspec/specs/features/<feature>/spec.md`), and design tensions before committing to a spec.

**Step 2 — Invoke the feature-dev skill**
```
/opsx:feature-dev feat-<short-description>
```
The skill will:
1. Create `EXPLORATION.md` — look up `openspec/specs/features/index.md`, load the matching `openspec/specs/features/<feature>/spec.md`, and read the affected layer from `openspec/specs/component-lifecycle/spec.md`
2. Assess risk (LOW / MEDIUM / HIGH)
3. For HIGH risk: pause for human approval before writing design
4. Generate `proposal.md`, `design.md`, `specs/<capability>/spec.md`, and `tasks.md`

> ⚠️ **For HIGH risk**: The skill pauses after `design.md` and asks you to review before writing tasks.

**Step 4 — Run the security gate**
```
/opsx:security-check feat-<short-description>
```

**Step 5 — Implement**
```
/opsx:apply feat-<short-description>
```

**Step 6 — Validate**
```bash
npm run compile
npm test
npm run es-lint
```

**Step 7 — Archive**
```
/opsx:archive feat-<short-description>
```
At archive time, delta specs in `openspec/changes/<name>/specs/` are synced to `openspec/specs/`.

### Feature risk levels

| Risk | Triggers | Extra steps |
|---|---|---|
| LOW | Isolated renderer change, no API surface change | Standard flow |
| MEDIUM | New public property/event, touches ≥ 2 modules | Security gate required before apply |
| HIGH | Changes data-processing pipeline, Blazor interop, new DataManager API, breaking change | Human architect review of design.md required |

---

## 6. Security & Safety Rules

These rules are **hard requirements** — they are enforced as BLOCK issues in `/opsx:security-check`.

### Code security
| Rule | Why |
|---|---|
| No `innerHTML` with unsanitised user data | XSS attack vector |
| No `eval()` | Remote code execution risk |
| Component must work under strict CSP | No inline scripts |
| No secrets / API keys in prompts or code | Credential exposure |
| No `console.*` in committed code | Information leakage |
| All DataManager calls async (no sync XHR) | Browser blocking + security headers |

### TypeScript safety (ES5 compile target)
| Rule | Why |
|---|---|
| No `?.` optional chaining | Not supported in ES5 — will fail compile |
| No `??` nullish coalescing | Not supported in ES5 — will fail compile |
| No `any` | Bypasses type safety; masks real bugs |
| Explicit null/undefined guards before property access | Prevents runtime TypeErrors |

### DOM & memory safety
| Rule | Why |
|---|---|
| Every `addEventListener` must have a matching removal in `destroy()` | Prevents memory leaks |
| Use `requestAnimationFrame` for visual updates | Correct rendering pipeline |
| No `document.write()` | Breaks CSP and DOM integrity |
| Batch DOM reads before writes | Prevents layout thrash / reflow loops |

### Accessibility (WCAG 2.1 AA)
| Rule | Why |
|---|---|
| ARIA role on every new custom widget | Screen reader support |
| `aria-label`/`aria-labelledby` on icon-only buttons | Screen reader support |
| Focus trapping in new modals/dialogs | Keyboard navigation compliance |
| All interactive elements reachable by Tab | Keyboard navigation compliance |

### Human sign-off required (no AI implementation)
- Changes to public API contracts (`index.ts` exports)
- Auth, encryption, or license validation changes
- Blazor interop changes with HIGH risk rating
- Legal or license questions

---

## 7. Token & Memory Management

> 📖 **Comprehensive guide**: See `openspec/docs/QUERY-OPTIMIZATION.md` for full credit-saving workflow  
> 🎯 **Quick reference**: See `.github/docs/CREDIT-SAVING-CHEATSHEET.md` for daily tips

### Budget per invocation

| Slot | Max Tokens |
|---|---|
| Static context (standards + architecture) | 600 |
| Dynamic context (diff / changed files) | 1 000 |
| Task memory keys | 200 |
| Response | 1 200 |
| **Total** | **3 000** |

### Load only what you need

```
For bug fix:
  ✓ openspec/specs/features/index.md Quick-Lookup → load matching openspec/specs/features/<feature>/spec.md (≤ 300 tokens)
  ✓ Affected layer in openspec/specs/component-lifecycle/spec.md (≤ 100 tokens)
  ✓ Method body only — paste ≤ 120 lines, NOT the full source file
  ✗ Never load the full features/index.md or multiple feature specs simultaneously

For feature dev:
  ✓ openspec/specs/features/index.md Quick-Lookup → load matching openspec/specs/features/<feature>/spec.md (≤ 300 tokens)
  ✓ Affected layer in openspec/specs/component-lifecycle/spec.md (≤ 150 tokens)
  ✓ Cross-cutting spec section if applicable (accessibility / testing / css-architecture)
  ✗ Never load all canonical specs simultaneously
```

### Memory scopes

| Scope | Lifetime | Use for |
|---|---|---|
| `task` | Single skill invocation | Bug fix, spec gen — always start fresh |
| `session` | One chat session | Code review spanning multiple files in one PR |
| `persistent` | `openspec/specs/lessons-learned.md` | Confirmed corrections, known patterns |

### Lessons learned
- File: `openspec/specs/lessons-learned.md`
- Format: `- [YYYY-MM-DD] Change: <name> | Issue: <what> | Fix: <rule added>`
- Prune to ≤ 50 lines monthly (oldest first)

---

## 8. Skills Reference

| Skill | Location | Purpose |
|---|---|---|
| `openspec-query-helper` | `.github/skills/openspec-query-helper/` | **EJ2 Gantt** — Query optimizer (FRONT GATE) — asks clarifying questions BEFORE expensive operations; auto-triggers on vague queries; saves 50-80% credits |
| `openspec-propose` | `.github/skills/openspec-propose/` | Generic change proposal (proposal + design + tasks) |
| `openspec-apply-change` | `.github/skills/openspec-apply-change/` | Implement tasks from any change |
| `openspec-explore` | `.github/skills/openspec-explore/` | Thinking partner mode — no code written |
| `openspec-archive-change` | `.github/skills/openspec-archive-change/` | Archive a completed change; sync delta specs |
| `openspec-bug-fix` | `.github/skills/openspec-bug-fix/` | **EJ2 Gantt** — bug fix with EXPLORATION.md + confidence rating |
| `openspec-feature-dev` | `.github/skills/openspec-feature-dev/` | **EJ2 Gantt** — feature dev with EXPLORATION.md + risk rating |
| `openspec-security-check` | `.github/skills/openspec-security-check/` | **EJ2 Gantt** — blocking security + accessibility + TS audit gate |
| `openspec-token-optimize` | `.github/skills/openspec-token-optimize/` | **EJ2 Gantt** — token budget discipline and memory scope guide |
| `openspec-tester` | `.github/skills/openspec-tester/` | **EJ2 Gantt** — generate Jasmine spec blocks from design.md |
| `openspec-review` | `.github/skills/openspec-review/` | **EJ2 Gantt** — standards-only code review of unified diffs |
| `openspec-spec-author` | `.github/skills/openspec-spec-author/` | **EJ2 Gantt** — read source files and write canonical 15-section feature specs (3-gate review before write) |
| `openspec-issue-validator` | `.github/skills/openspec-issue-validator/` | **EJ2 Gantt** — validate candidate stability issues against src/ using the 12-Rule Source Validation Protocol; outputs CONFIRMED / DISCARDED verdict per issue |

---

## 8a. Canonical Specs Reference

All AI skills load context from these specs — **never from the `docs/` folder**.

| Spec | Path | When to load |
|---|---|---|
| Feature Index | `openspec/specs/features/index.md` | Always first — Quick-Lookup only, then load the matching feature spec |
| Feature Spec (per feature) | `openspec/specs/features/<feature>/spec.md` | Load ONLY the one matching spec (≤ 300 tokens) |
| Component Lifecycle | `openspec/specs/component-lifecycle/spec.md` | For any change touching class hierarchy or lifecycle methods |
| **TreeGrid–Grid Dependency** | **`openspec/specs/treegrid-grid-dependency/spec.md`** | **MANDATORY for any grid-pane bug: row, cell, sort, filter, selection, expand/collapse, column ops, virtual scroll, row drag** |
| TypeScript Standards | `openspec/specs/typescript-standards/spec.md` | For any code change (security gate loads this automatically) |
| Accessibility | `openspec/specs/accessibility/spec.md` | For changes adding interactive elements or modals |
| Testing | `openspec/specs/testing/spec.md` | When writing spec files |
| CSS Architecture | `openspec/specs/css-architecture/spec.md` | For CSS/theme changes |
| Lessons Learned | `openspec/specs/lessons-learned.md` | Always inject as task memory at start of every bug-fix session |

### TreeGrid–Grid Dependency Spec — What it teaches the AI

The `treegrid-grid-dependency/spec.md` is the most important spec for bug fixing.
It encodes:

| Knowledge | Location in spec |
|---|---|
| 3-tier stack diagram (Gantt → TreeGrid → Grid) | §1 |
| Ownership Map — who owns every interaction type | §2 |
| All event/method names Gantt uses to talk to TreeGrid | §3.1 |
| All TreeGrid events Gantt listens to (and which handler) | §3.2 |
| The GanttTreeGrid adapter pattern (how events are transformed) | §3.3 |
| What Gantt adds on top of TreeGrid per feature | §4 |
| Cross-component root cause triage decision tree | §5 |
| What CANNOT be fixed in Gantt source (external package behaviours) | §6 |
| 12 known cross-component bug patterns with fix locations | §7 |
| Multi-file fix checklist (8 items) | §8 |
| AI instructions for EXPLORATION.md format | §9 |

### Feature Specs Folder Structure (24 specs)
```
openspec/specs/features/
├── index.md                    ← ALWAYS load first — quick-lookup only
├── task-scheduling/spec.md
├── task-editing/spec.md
├── task-dependencies/spec.md
├── resource-management/spec.md
├── timeline-zoom/spec.md
├── virtual-scrolling/spec.md
├── split-tasks/spec.md
├── baselines/spec.md
├── critical-path/spec.md
├── undo-redo/spec.md
├── column-operations/spec.md
├── filtering-search/spec.md
├── sorting/spec.md
├── selection/spec.md
├── row-drag-drop/spec.md
├── toolbar/spec.md
├── context-menu/spec.md
├── export/spec.md
├── task-constraints/spec.md
├── unscheduled-tasks/spec.md
├── work-calendars/spec.md
├── keyboard-navigation/spec.md
├── event-markers/spec.md
└── splitter/spec.md
```

---

## 9. Prompts Reference

| Prompt | Command | Use when |
|---|---|---|
| `opsx-query-helper.prompt.md` | `/opsx:query-helper` | **FRONT GATE** — optimize vague queries before processing; check session bloat |
| `opsx-propose.prompt.md` | `/opsx:propose` | Starting any new change |
| `opsx-apply.prompt.md` | `/opsx:apply` | Implementing tasks from a change |
| `opsx-explore.prompt.md` | `/opsx:explore` | Thinking before building |
| `opsx-archive.prompt.md` | `/opsx:archive` | Closing out a completed change |
| `opsx-security-check.prompt.md` | `/opsx:security-check` | Security gate before implementation |
| `opsx-bug-fix.prompt.md` | `/opsx:bug-fix` | Full bug fix workflow |
| `opsx-feature-dev.prompt.md` | `/opsx:feature-dev` | Full feature development workflow |
| `opsx-tester.prompt.md` | `/opsx:tester` | Generate Jasmine spec from design.md |
| `opsx-review.prompt.md` | `/opsx:review` | Standards-only diff review |
| `opsx-token-optimize.prompt.md` | `/opsx:token-optimize` | Token budget audit and canonical load map |
| `opsx-spec-author.prompt.md` | `/opsx:spec-author <feature> [new\|enrich]` | Author or enrich a canonical 15-section feature spec |
| `opsx-validate-issues.prompt.md` | `/opsx:validate-issues` | Validate candidate issues against src/ using the 12-Rule Source Validation Protocol — produces CONFIRMED / DISCARDED report |

---

## 10. Artifact Reference

Every change in `openspec/changes/<name>/` contains:

### `proposal.md`
- What the change does and why
- Non-goals (explicit scope boundary)
- Affected feature module — `openspec/specs/features/<feature>/spec.md`
- Risk / confidence level

### `design.md`
- Root cause (bug) or architecture layer (feature)
- Files to be modified (`src/gantt/...`)
- New public API (if any)
- Security, accessibility, and performance impact notes
- Side-effect analysis

### `EXPLORATION.md` (mandatory for MEDIUM/HIGH risk)
- Exact file:method:line evidence — what exists vs what is missing
- Confidence / risk assessment with reasoning
- Recommendation: proceed / adjust scope / stop

### `specs/<capability>/spec.md` (delta spec — features only)
- Acceptance criteria in WHEN/THEN format
- Edge cases: null data, empty dataset, large dataset (> 10 000 rows)
- Fixed-date examples (`new Date('2024-01-15')`)
- Synced to `openspec/specs/` on archive

### `tasks.md`
- Ordered checklist: `- [ ]` pending, `- [x]` complete
- Each task: file path + method name + change type
- Last task always: `npm run compile && npm test`
- Bug fixes always include: Tester-agent spec task

---

## 11. Validation Protocol

After every `/opsx:apply`, run all four gates:

```
1. npm run compile     → zero TypeScript errors
2. npm test            → 100% pass rate (existing + new specs)
3. npm run es-lint     → zero warnings
4. Manual smoke test   → open demos/<feature>.html in browser (P0/P1 bugs only)
```

**Do not open a PR** until all four gates pass.

---

## 12. Lessons Learned

See `openspec/specs/lessons-learned.md` for the running log of confirmed AI corrections.

**How to add an entry** (after applying any change):
1. Open `openspec/specs/lessons-learned.md`
2. Append: `- [YYYY-MM-DD] Change: <name> | Issue: <what was wrong> | Fix: <rule added>`
3. If file exceeds 50 lines, remove oldest entries

**How the AI uses this file**:
- The `openspec-bug-fix` and `openspec-feature-dev` skills read this file at the start of each invocation
- It is injected into the task-memory slot (≤ 200 tokens)
- It prevents the AI from repeating known mistakes specific to this codebase

---

*Last updated: 2026-06-13 | Maintained by the EJ2 Gantt team | No docs/ dependencies — self-contained*
