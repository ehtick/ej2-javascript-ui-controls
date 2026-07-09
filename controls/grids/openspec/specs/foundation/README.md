# Foundation Specs — Bedrock Contracts

> **Purpose:** These specs define the non-negotiable contracts that ALL EJ2 Grid
> features must honour. Every feature spec inherits from these foundations.
> Any change that violates a foundation contract requires ArchitectAgent review.

---

## Foundation Spec Index

| File | Topic | Risk |
|------|-------|------|
| [data-binding.md](./data-binding.md) | DataManager integration, Query pipeline, remote/local adapter contracts | 🔴 Critical |
| [event-handling.md](./event-handling.md) | Event dispatcher lifecycle, `trigger()` / `on()` / `off()` contracts | 🔴 Critical |
| [state-management.md](./state-management.md) | Module state, immutability rules, persistence schema | 🟠 High |
| [error-handling.md](./error-handling.md) | Error propagation, console logger codes, recovery patterns | 🟠 High |

---

## How to Use

1. **Every feature spec** MUST list the relevant foundation specs in its `foundation_specs:` entry in `config.yaml`.
2. **Before implementing** any feature, read the applicable foundation specs to understand non-negotiable patterns.
3. **New feature specs** MUST include a "Foundation Compliance" section confirming adherence to each applicable contract.
4. **Never override** foundation contracts without explicit ArchitectAgent + human approval.

---

## Coverage Rules

Foundation specs are **not** direct test targets. They are contract documents.  
Features that implement these contracts carry coverage responsibility in their own spec suites.

---

*Maintained by SpecWriterAgent. Last reviewed: 2026-03-25.*
