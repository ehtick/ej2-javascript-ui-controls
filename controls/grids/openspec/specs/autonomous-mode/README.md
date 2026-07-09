# Autonomous Mode Development Specification

**Version**: 2.0  
**Component**: EJ2 Grid (Brownfield TypeScript Web Component)  
**Mode**: Autonomous (OpenSpec-driven)  
**Token Budget**: 18,000 total (exploration: 6K, execution: 12K)  

---

## Overview

This specification defines the complete autonomous development workflow for EJ2 Grid. The agent self-directs through analysis, planning, implementation, and verification without waiting for human confirmation unless a destructive action is required.

## Core Operating Principles

1. **Read Before Write**: Always analyze existing code structure before making changes
2. **Preserve Compatibility**: No breaking changes to public APIs unless explicitly approved
3. **Match Existing Patterns**: Follow established conventions and architecture
4. **Infer from Context**: Don't halt for clarification unless critical
5. **Document Decisions**: Inline comments for non-obvious changes
6. **Token Efficiency**: Load only what's needed, cache aggressively

## Autonomous Loop

```
┌─────────────────────────────────────────────────────┐
│                 AUTONOMOUS LOOP                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. SCAN (1500 tokens)                              │
│     └─ Understand codebase structure                │
│                                                      │
│  2. PLAN (1000 tokens)                              │
│     └─ Define tasks and execution order             │
│                                                      │
│  3. EXECUTE (8000 tokens)                           │
│     └─ Implement changes incrementally              │
│                                                      │
│  4. VERIFY (2000 tokens)                            │
│     └─ Run tests and validate correctness           │
│                                                      │
│  5. REPORT (500 tokens)                             │
│     └─ Summarize changes and decisions              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Tech Context Auto-Detection

- **Language**: TypeScript (strict mode, ES5 target, AMD modules)
- **Component Model**: Web Components (Custom Elements v1, Shadow DOM when needed)
- **Test Framework**: Karma + Jasmine (auto-detect from config)
- **Build Tooling**: Gulp + Webpack (auto-detect from gulpfile.js)
- **Module System**: AMD with Service Locator pattern

## Autonomous Decision Rules

| Situation | Agent Action | Requires Approval |
|-----------|-------------|-------------------|
| Ambiguous requirement | Infer from existing patterns, document assumption | ❌ No |
| Missing type definition | Create interface in same file or types/ folder | ❌ No |
| No test file exists | Create new *.spec.ts following conventions | ❌ No |
| Conflicting code styles | Follow dominant pattern in the file | ❌ No |
| New dependency needed | Suggest only — do not install | ✅ Yes |
| Public API change required | STOP and flag for human review | ✅ Yes |
| Complex refactor (>3 files) | Provide plan before executing | ✅ Yes |
| Performance degradation risk | Run benchmarks before/after | ❌ No (auto) |

## Constraints

### Must Never Do (Without Approval)
- Modify public APIs (tag names, observed attributes, dispatched events)
- Change component lifecycle behavior
- Install or remove dependencies
- Delete existing test files
- Modify files outside src/, spec/, openspec/, .github/

### Must Always Do (Autonomous)
- Read existing code before writing
- Follow TypeScript strict typing (no `any` unless existing)
- Generate/update tests for all changes
- Leave `// AUTONOMOUS: <reason>` comments for non-obvious decisions
- Update CHANGELOG.md with changes
- Run type checks (tsc --noEmit)
- Validate against OpenSpec specs

## Token Optimization Rules

1. **Load features_index first** (500 tokens) - identify feature type
2. **Load max 3 skills** (2100 tokens) - 1 feature + 2 common
3. **Grep before read** (200 tokens) - find relevant code sections
4. **Read line ranges** (1000 tokens) - not full files
5. **Cache loaded content** (0 tokens) - reuse in session
6. **Skip training docs** (0 tokens) - never load /docs/training/
7. **Load sections only** (400 tokens) - use anchors in docs

## Output Deliverables

- [ ] Modified/created TypeScript source files
- [ ] Corresponding *.spec.ts test files
- [ ] Inline code comments for decisions
- [ ] CHANGELOG.md entry
- [ ] OpenSpec compliance verification
- [ ] Token usage report

## Completion Criteria

Task is complete when:
1. ✅ All target files created or updated
2. ✅ No TypeScript compilation errors (tsc --noEmit passes)
3. ✅ All generated tests pass
4. ✅ CHANGELOG entry written
5. ✅ No regressions in existing component APIs
6. ✅ Token budget not exceeded
7. ✅ OpenSpec specs satisfied

## Related Specifications

- [Brownfield Development Workflow](./brownfield-workflow-spec.md)
- [Feature Implementation Workflow](./feature-implementation-spec.md)
- [Bug Fix Workflow](./bug-fix-spec.md)
- [Refactoring Workflow](./refactoring-spec.md)
- [Test Generation Workflow](./test-generation-spec.md)

---

**Last Updated**: 2026-03-13  
**Token Cost**: ~1200 tokens
