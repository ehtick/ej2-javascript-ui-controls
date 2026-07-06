# EJ2 Data Manager - OpenSpec Configuration

**Version:** 2.0  
**Component:** @syncfusion/ej2-data  
**Mode:** Autonomous  
**Last Updated:** March 19, 2026

## Overview

This directory contains the OpenSpec configuration and specifications for EJ2 Data Manager autonomous mode development.

## Structure

```
openspec/
├── config.yaml                    # Main autonomous mode configuration
├── README.md                      # This file
├── changes/                       # Change artifacts (EXPLORATION, proposal, design, tasks)
│   └── archive/                   # Archived completed changes
└── specs/                         # Specifications
    ├── architecture/              # Architecture documentation
    │   ├── component-architecture.md
    │   ├── system-architecture.md
    │   ├── data-flow.md
    │   └── tech-stack.md
    ├── foundation/                # Foundation specs (core abstractions)
    │   ├── query-composition.md
    │   ├── adaptor-protocol.md
    │   ├── predicate-builder.md
    │   ├── url-encoding.md
    │   └── error-handling.md
    ├── features/                  # Feature-specific specs (to be created)
    │   ├── query-composition/
    │   ├── filtering/
    │   ├── json-adaptor/
    │   ├── odata-adaptor/
    │   └── ... (27 total features)
    └── risk/                      # Risk assessment
        └── feature-risk.md
```

## Key Files

### config.yaml
The master configuration file for autonomous mode that defines:
- **27 features** across 4 categories:
  - Core Data Operations (8)
  - Adaptors (8)
  - CRUD Operations (5)
  - Utility Features (6)
- **8 workflow phases**: exploration → proposal → design → specs → tasks → verification → apply → archive
- **Token optimization**: 18K total budget
- **Quality gates**: 90% coverage, type-checking, human approvals

### Architecture Specs

#### component-architecture.md
- DataManager architecture
- Adaptor pattern
- Query builder architecture
- Memory management
- Security architecture
- Framework integration

#### system-architecture.md
- Module system
- Query pipeline (4 phases)
- Async/Promise flow
- State management
- Error handling architecture
- Build system

#### data-flow.md
- Local data flow (JsonAdaptor)
- Remote data flow (OData/WebAPI)
- CRUD operations flow
- Cache data flow
- Offline mode flow
- Error flow

#### tech-stack.md
- TypeScript 4.x (ES5 target)
- Gulp + Webpack build
- Karma + Jasmine testing
- NPM package management
- ESLint + Prettier
- CI/CD (Jenkins)

### Foundation Specs

#### query-composition.md
- Immutable query builder (REQ-001)
- Chainable API (REQ-002)
- Query serialization (REQ-003)
- Predicate composition (REQ-004)
- Operation order (REQ-005)
- Performance: < 100ms (REQ-006)
- Input sanitization (REQ-007)

#### adaptor-protocol.md
- IAdaptor interface (REQ-001)
- Standard response format (REQ-002)
- CRUD operations (REQ-005 to REQ-008)
- Adaptor-specific requirements (REQ-009 to REQ-012)
- Security: URL encoding, XSS prevention (REQ-015, REQ-016)

#### predicate-builder.md
- Predicate creation & chaining (REQ-001, REQ-002)
- Nested predicates (REQ-003)
- Operator precedence (REQ-004)
- String/Numeric/Null operators (REQ-005 to REQ-007)
- OData/WebAPI translation (REQ-008, REQ-009)

#### url-encoding.md
- Mandatory encoding (REQ-001)
- Special character encoding (REQ-002)
- Unicode support (REQ-003)
- Injection prevention (REQ-004 to REQ-006)
- OData-specific encoding (REQ-007 to REQ-009)

#### error-handling.md
- Structured error objects (REQ-001)
- Error types (REQ-002)
- Network/Server/Validation errors (REQ-004 to REQ-011)
- Retry logic (REQ-014, REQ-015)
- Error logging (REQ-018, REQ-019)

### Risk Assessment

#### feature-risk.md
- Risk classification: 🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🟢 LOW
- Feature-by-feature risk analysis (27 features)
- Interaction risk matrix
- Testing strategy by risk level
- Human approval requirements

## Autonomous Mode Workflow

### Phase 1: Exploration (6K tokens)
1. Read features_index[feature]
2. Load feature-risk.md for affected feature
3. Load 2-3 skills max
4. Grep specs selectively
5. Scan code files
6. Document in EXPLORATION.md

### Phase 2: Proposal (2K tokens)
- Format: PROBLEM → ROOT CAUSE → SOLUTION → SPECS AFFECTED
- Reference exploration findings
- List modified vs new specs
- Include risk level

### Phase 3: Design (3K tokens)
- Format: APPROACH → ALTERNATIVES → ARCHITECTURE → PATTERNS
- Preserve Adaptor pattern
- Security considerations
- Performance constraints

### Phase 4: Specs (3K tokens)
- OpenSpec compliant (SHALL/MUST)
- WHEN/THEN format
- Testable requirements
- Coverage impact

### Phase 5: Tasks (2K tokens)
- Actionable, specific, measurable
- Line number references
- Test scenarios
- 2-4 hour chunks

### Phase 6: Verification (2K tokens)
- Spec validation
- API compatibility check
- Coverage verification
- Security review

### Phase 7: Apply (3K tokens)
- Incremental implementation
- Type-check after each task (tsc --noEmit)
- Run tests after completion (npm test)
- Update CHANGELOG.md
- Rollback on failure

### Phase 8: Archive (1.5K tokens)
- Verify required artifacts
- Sync foundation specs
- Rename change directory
- Final quality check

## Quality Gates

### After Each Task
- ✅ `tsc --noEmit` MUST pass

### After All Tasks
- ✅ `npm test` MUST pass
- ✅ Coverage >= 90% lines, 80% branches, 85% new code
- ✅ No public API changes (unless approved)
- ✅ CHANGELOG.md updated

### Human Approval Required
- Changes to foundation specs (query-composition, adaptor-protocol, etc.)
- Public API changes (DataManager, Query, Adaptor interfaces)
- Breaking changes to request/response format
- Security-sensitive logic
- Changes affecting 3+ critical-risk features

## Coverage Targets

- **Lines:** 90%+
- **Branches:** 80%+
- **New Code:** 85%+
- **Functions:** 90%+

## Feature Categories

### Core Data Operations (8)
query-composition, filtering, sorting, paging, grouping, aggregates, search, select

### Adaptors (8)
json-adaptor, odata-adaptor, odatav4-adaptor, webapi-adaptor, webmethodadaptor, url-adaptor, cache-adaptor, custom-adaptor

### CRUD Operations (5)
crud-operations, insert, update, remove, batch-operations

### Utility Features (6)
predicate-builder, url-encoding, data-util, caching, offline-mode, error-handling

## Token Optimization

- **Total Budget:** 18,000 tokens
- **Exploration:** 6,000 tokens max
- **Work Phases:** 12,000 tokens max
- **Skills per Task:** 3 max
- **Docs per Task:** 3 sections max
- **Code Files Scanned:** 5 max

## Key Constraints

- No breaking API changes without approval
- Backward compatible query serialization
- Memory leak prevention required
- Query composition < 100ms
- Request overhead < 50ms
- Max 10 files per change
- Max 500 LOC per change

## References

### Critical Files
- `src/manager.ts` - DataManager class
- `src/query.ts` - Query, Predicate classes
- `src/adaptors.ts` - All adaptor implementations
- `src/util.ts` - DataUtil, helper functions

### External Dependencies
- `@syncfusion/ej2-base` - Common utilities

### Build Commands
- `tsc --noEmit` - Type check
- `npm test` - Run tests
- `gulp build` - Build distribution

---

**For AI Agents:** Always start by reading `config.yaml` and `specs/risk/feature-risk.md` for the feature you're working on. Follow the 8-phase workflow strictly. Token optimization is critical—load only what you need.
