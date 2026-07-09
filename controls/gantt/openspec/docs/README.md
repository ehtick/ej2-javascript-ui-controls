# OpenSpec Documentation Index

> Central reference for all OpenSpec documentation and guides

---

## 📚 Core Documentation

### [product.md](./product.md)
**Product identity and quality standards**

- What EJ2 Gantt is and what it does
- Core capabilities and feature areas
- Quality bars and non-goals
- Target audience and use cases

**Read this**: To understand the product scope and boundaries

---

### [workflow.md](./workflow.md)
**Complete development lifecycle**

- The Mandate: "Optimize before you query. Explore before you build."
- Query Optimization Layer (credit-saving front gate)
- 6-phase lifecycle diagrams
- Bug fix 8-step human-gated process
- Feature development workflow
- Security gates and validation protocol

**Read this**: To understand the complete end-to-end development process

---

### [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md)
**Comprehensive credit-saving guide (28 pages)**

- How the Query Helper works
- Auto-trigger patterns
- Manual invocation instructions
- Cost reduction examples (60-90% savings)
- Query classification (SPECIFIC / TARGETED / VAGUE)
- Best practices and troubleshooting
- Integration with other skills
- Cost estimation formulas
- FAQ

**Read this**: For deep understanding of credit optimization

---

## 🔍 Workflow Guides

### [workflows/exploration-patterns.md](./workflows/exploration-patterns.md)
**Exploration session best practices**

- Good vs. poor exploration examples
- Token budget management strategies
- Transition decision patterns (when to propose/apply/continue)
- Session lifecycle and memory management
- Integration with OpenSpec workflow

**Read this**: Before using `/opsx:explore` to investigate problems or clarify requirements

---

## 🎯 Quick References

Located in `.github/docs/`:

### [CREDIT-SAVING-CHEATSHEET.md](../../.github/docs/CREDIT-SAVING-CHEATSHEET.md)
**Printable quick reference card (1 page)**

- Golden rules for credit savings
- High-efficiency query patterns
- High-cost queries to avoid
- Feature keywords reference
- Cost breakdown table
- Session management tips
- Summary card (print and post)

**Use this**: Daily reference while working with AI

---

### [QUERY-HELPER-WORKFLOW.md](../../.github/docs/QUERY-HELPER-WORKFLOW.md)
**Visual workflow diagrams**

- Complete integration flow (ASCII diagrams)
- Query classification decision tree
- Clarification question flow
- Session bloat detection
- Agent call prevention
- Feature keyword matching
- Cost comparison visualizations
- End-to-end examples

**Use this**: Visual reference for understanding flows

---

## 📖 Documentation Map by Use Case

### "I want to save credits"
1. **Quick start**: [CREDIT-SAVING-CHEATSHEET.md](../../.github/docs/CREDIT-SAVING-CHEATSHEET.md) (1 min read)
2. **Deep dive**: [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md) (15 min read)
3. **Visual guide**: [QUERY-HELPER-WORKFLOW.md](../../.github/docs/QUERY-HELPER-WORKFLOW.md) (5 min browse)

### "I want to fix a bug"
1. **Process**: [workflow.md](./workflow.md) § Bug Fix Workflow
2. **Optimize query first**: Use `/opsx:query-helper fix-<bug-name>`
3. **Execute**: `/opsx:bug-fix fix-<bug-name>`

### "I want to develop a feature"
1. **Process**: [workflow.md](./workflow.md) § Feature Dev Workflow
2. **Explore first**: `/opsx:explore "<what I want to build>"` (see [exploration-patterns.md](./workflows/exploration-patterns.md))
3. **Execute**: `/opsx:feature-dev feat-<name>`

### "I want to explore before building"
1. **Patterns**: [workflows/exploration-patterns.md](./workflows/exploration-patterns.md)
2. **Skill reference**: `../../.github/skills/openspec-explore/SKILL.md`
3. **Execute**: `/opsx:explore "<your question>"`

### "I need to understand the product"
1. **Product overview**: [product.md](./product.md)
2. **Architecture**: `../specs/component-lifecycle/spec.md`
3. **Feature areas**: `../specs/features/index.md`

### "I want to optimize token usage"
1. **Query optimization**: [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md)
2. **Token budget**: `../README.md` § Token & Memory Management
3. **Skill reference**: `../../.github/skills/openspec-token-optimize/SKILL.md`

---

## 🗂️ Document Hierarchy

```
openspec/
├── README.md                              ← Main entry point
├── config.yaml                            ← AI configuration and rules
├── docs/                                  ← You are here
│   ├── README.md                          ← This index file
│   ├── product.md                         ← Product identity
│   ├── workflow.md                        ← Complete lifecycle
│   ├── QUERY-OPTIMIZATION.md              ← Credit-saving guide
│   └── workflows/
│       └── exploration-patterns.md        ← Exploration best practices
└── specs/                                 ← Canonical specs
    ├── features/index.md                  ← Feature quick-lookup
    ├── features/<feature>/spec.md         ← Individual feature specs (24)
    ├── component-lifecycle/spec.md        ← Architecture
    ├── typescript-standards/spec.md       ← Code standards
    ├── accessibility/spec.md              ← WCAG compliance
    ├── testing/spec.md                    ← Test patterns
    ├── css-architecture/spec.md           ← CSS conventions
    └── lessons-learned.md                 ← AI memory

.github/
├── docs/                                  ← Quick references
│   ├── CREDIT-SAVING-CHEATSHEET.md        ← Daily cheat sheet
│   └── QUERY-HELPER-WORKFLOW.md           ← Visual diagrams
├── prompts/                               ← Slash commands
│   ├── opsx-query-helper.prompt.md        ← Query optimizer
│   ├── opsx-bug-fix.prompt.md             ← Bug fix
│   ├── opsx-feature-dev.prompt.md         ← Feature dev
│   └── ... (12 total prompts)
└── skills/                                ← Skill definitions
    ├── openspec-query-helper/             ← Query optimizer skill
    ├── openspec-bug-fix/                  ← Bug fix skill
    ├── openspec-feature-dev/              ← Feature dev skill
    └── ... (11 total skills)
```

---

## 📋 Reading Order by Role

### For Developers (using AI to code)
1. [CREDIT-SAVING-CHEATSHEET.md](../../.github/docs/CREDIT-SAVING-CHEATSHEET.md) — Print this!
2. [workflow.md](./workflow.md) § Query Optimization Layer
3. [workflow.md](./workflow.md) § Bug Fix or Feature Dev
4. [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md) § Best Practices

### For AI/Agent Developers (building skills)
1. [product.md](./product.md) — Understand the product
2. [workflow.md](./workflow.md) — Understand the process
3. `../config.yaml` — Understand AI rules
4. [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md) — Understand token budgets
5. `../../.github/skills/openspec-query-helper/SKILL.md` — Example implementation

### For Architects (designing the system)
1. [product.md](./product.md) — Product boundaries
2. [workflow.md](./workflow.md) — Process overview
3. `../specs/component-lifecycle/spec.md` — Architecture
4. `../specs/features/index.md` — Feature landscape

---

## 🔗 External Links

- **OpenSpec Framework**: Core workflow methodology
- **Code Studio API**: `ask_questions` tool documentation
- **EJ2 Gantt**: Public documentation (separate from OpenSpec)

---

## 📊 Document Statistics

| Document | Pages | Purpose | Audience |
|---|---|---|---|
| product.md | 3 | Product identity | All |
| workflow.md | 10 | Complete lifecycle | All |
| QUERY-OPTIMIZATION.md | 28 | Credit optimization | Developers |
| workflows/exploration-patterns.md | 8 | Exploration guide | Developers |
| CREDIT-SAVING-CHEATSHEET.md | 4 | Quick reference | Developers |
| QUERY-HELPER-WORKFLOW.md | 6 | Visual diagrams | Developers |

**Total**: ~59 pages of documentation

---

## ✅ Quick Commands Reference

```bash
# Query optimization
/opsx:query-helper <your-question>      # Optimize before processing
/opsx:query-helper                       # Check session bloat

# Development workflows
/opsx:bug-fix fix-<name>                 # 8-step bug fix
/opsx:feature-dev feat-<name>            # Full feature dev
/opsx:explore "<question>"               # Thinking mode

# Utilities
/opsx:security-check <change-name>       # Security audit
/opsx:apply <change-name>                # Implement tasks
/opsx:archive <change-name>              # Finalize change
```

---

## 🆘 Getting Help

1. **Quick question**: Check [CREDIT-SAVING-CHEATSHEET.md](../../.github/docs/CREDIT-SAVING-CHEATSHEET.md)
2. **Process question**: Check [workflow.md](./workflow.md)
3. **Credit optimization**: Check [QUERY-OPTIMIZATION.md](./QUERY-OPTIMIZATION.md) § FAQ
4. **Technical question**: Check `../README.md`

---

*Last updated: 2026-04-07*  
*Part of the EJ2 Gantt OpenSpec framework*
