# OpenSpec Features Directory

This directory stores feature-level specs for the EJ2 Grid component.

## Structure

Each feature gets its own subdirectory:

```
features/
├── sorting/
│   └── sorting.spec
├── filtering/
│   └── filtering.spec
├── grouping/
│   └── grouping.spec
...
```

## Spec Format (OpenSpec compliant)

```
Feature Name
Goal
Affected Components
Integration Points
Accessibility Impact
Test Requirements

REQ-001: [Title]
#### WHEN [condition]
#### THEN [expected behavior]
```

## Conventions

- Use SHALL for mandatory requirements
- Use SHOULD for recommended requirements
- Every requirement must be testable (WHEN/THEN format)
- Reference interaction matrix from config.yaml features_index
- New feature specs created per task — never regenerate existing specs

## Current Feature Specs

Specs are generated on-demand per task. See `config.yaml` features_index for the complete catalog of 55 features.
