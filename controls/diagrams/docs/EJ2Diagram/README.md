# EJ2 Diagram — Documentation Index

> **Complete documentation suite for the Syncfusion EJ2 Diagram component.**
> Covers architecture, module internals, API references, dev process, performance, and AI agent configurations.

---

## Quick Start

If you are new to EJ2 Diagram, start here:

| Step | Document | What You'll Learn |
|---|---|---|
| 1 | [Product Overview](overview/product-overview.md) | What EJ2 Diagram is and where it fits |
| 2 | [Environment Setup](tech-stack/environment-setup.md) | How to clone, install, build, and run |
| 3 | [System Architecture](architecture/system-architecture.md) | How all the pieces fit together |
| 4 | [Core Diagram Module](modules/Diagram.md) | The main component API — start here for coding |
| 5 | [Node Module](modules/Node.md) | How to create shapes on the diagram |
| 6 | [Connector Module](modules/Connector.md) | How to create connections between nodes |
| 7 | [Glossary](overview/glossary.md) | Definitions of every technical term used in this codebase |

---

## Documentation Sections

### 📦 Overview

| File | Description |
|---|---|
| [product-overview.md](overview/product-overview.md) | What EJ2 Diagram is, what it does, Syncfusion ecosystem context |
| [vision-and-goals.md](overview/vision-and-goals.md) | Design philosophy, long-term roadmap intentions |
| [glossary.md](overview/glossary.md) | Every domain term: node, connector, port, annotation, constraints, etc. |

---

### 🏗 Architecture

| File | Description |
|---|---|
| [system-architecture.md](architecture/system-architecture.md) | End-to-end system view with ASCII rendering pipeline diagram |
| [component-architecture.md](architecture/component-architecture.md) | Deep dive into each major engine (Node, Connector, Layout, etc.) |
| [data-flow.md](architecture/data-flow.md) | How data flows from user input → model → renderer → DOM |
| [dependency-map.md](architecture/dependency-map.md) | Module-to-module dependency graph |

---

### 🛠 Tech Stack

| File | Description |
|---|---|
| [tech-stack.md](tech-stack/tech-stack.md) | TypeScript version, SVG vs Canvas, build tools |
| [third-party-libraries.md](tech-stack/third-party-libraries.md) | All external packages with purpose and version |
| [environment-setup.md](tech-stack/environment-setup.md) | Full dev environment setup from scratch |

---

### 📐 Code Guidelines

| File | Description |
|---|---|
| [coding-standards.md](code-guidelines/coding-standards.md) | TypeScript patterns, class design, model/interface patterns |
| [naming-conventions.md](code-guidelines/naming-conventions.md) | Class, enum, event, and constraint naming rules |
| [error-handling.md](code-guidelines/error-handling.md) | How errors are thrown, propagated, and recovered |
| [logging-guidelines.md](code-guidelines/logging-guidelines.md) | What to log, at what level, and debugging trace paths |

---

### 🔄 Development Process

| File | Description |
|---|---|
| [development-workflow.md](dev-process/development-workflow.md) | Full pipeline: branch → code → PR → merge → publish |
| [pr-guidelines.md](dev-process/pr-guidelines.md) | PR format, review checklist, Syncfusion PR templates |
| [branching-strategy.md](dev-process/branching-strategy.md) | Branch naming: develop, release/*, hotfix/*, feature/<id> |

---

### ⚡ Performance

| File | Description |
|---|---|
| [performance-guidelines.md](performance/performance-guidelines.md) | NFRs: target render time, FPS, layout budget |
| [benchmarks.md](performance/benchmarks.md) | Measured metrics: FPS, memory, large-diagram stress tests |
| [optimization-techniques.md](performance/optimization-techniques.md) | DOM caching, path reuse, virtualization, incremental refresh |

---

### 🤖 AI Agents

| File | Description |
|---|---|
| [agents-overview.md](ai-agents/agents-overview.md) | Why AI agents are used in this codebase |
| [usage-guidelines.md](ai-agents/usage-guidelines.md) | Safe and effective usage rules for all agents |
| [code-review-agent.md](ai-agents/custom-agents/code-review-agent.md) | How to use AI for code review |
| [bug-fix-agent.md](ai-agents/custom-agents/bug-fix-agent.md) | How to locate and fix bugs using AI |
| [documentation-agent.md](ai-agents/custom-agents/documentation-agent.md) | How to keep docs in sync with code changes |
| [prompts/](ai-agents/prompts/) | Reusable prompt templates |
| [skills/](ai-agents/skills/) | Reusable agent action modules |
| [mcp-configs/](ai-agents/mcp-configs/) | Agent configuration schemas |

---

### 📚 Module Documentation

Each file covers: Overview · Behavior Boundaries · Public API · Runtime Methods · Configuration · Events · Internal Architecture · Rendering & Interaction · Best Practices · Example Code · File Structure · Cross-module Dependencies.

| Module | File | Inject Command | Key Class |
|---|---|---|---|
| **Core Diagram** | [Diagram.md](modules/Diagram.md) | *(always loaded)* | `Diagram` |
| **Node** | [Node.md](modules/Node.md) | *(always loaded)* | `Node` |
| **Connector** | [Connector.md](modules/Connector.md) | *(always loaded)* | `Connector` |
| **Annotation** | [Annotation.md](modules/Annotation.md) | *(always loaded)* | `ShapeAnnotation`, `PathAnnotation`, `Hyperlink` |
| **Port** | [Port.md](modules/Port.md) | *(always loaded)* | `PointPort` |
| **Rendering** | [Rendering.md](modules/Rendering.md) | *(always loaded)* | `DiagramRenderer` |
| **Interaction** | [Interaction.md](modules/Interaction.md) | *(always loaded)* | `DiagramEventHandler` |
| **Constraints** | [Constraints.md](modules/Constraints.md) | *(always loaded)* | `NodeConstraints` / `DiagramConstraints` |
| **CommandManager** | [CommandManager.md](modules/CommandManager.md) | *(always loaded)* | `CommandManager` |
| **Undo/Redo** | [UndoRedo.md](modules/UndoRedo.md) | `Diagram.Inject(UndoRedo)` | `UndoRedo` |
| **Data Binding** | [DataBinding.md](modules/DataBinding.md) | `Diagram.Inject(DataBinding)` | `DataBinding` |
| **Layout** | [Layout.md](modules/Layout.md) | `Diagram.Inject(HierarchicalTree)` etc. | `HierarchicalTree` etc. |
| **Snapping** | [Snapping.md](modules/Snapping.md) | `Diagram.Inject(Snapping)` | `Snapping` |
| **LineRouting** | [LineRouting.md](modules/LineRouting.md) | `Diagram.Inject(LineRouting)` | `LineRouting` |
| **ConnectorBridging** | [ConnectorBridging.md](modules/ConnectorBridging.md) | `Diagram.Inject(ConnectorBridging)` | `ConnectorBridging` |
| **Virtualization** | [Virtualization.md](modules/Virtualization.md) | `Diagram.Inject(Virtualization)` | *(via constraints)* |
| **Print & Export** | [PrintAndExport.md](modules/PrintAndExport.md) | `Diagram.Inject(PrintAndExport)` | `PrintAndExport` |
| **BPMN** | [BPMN.md](modules/BPMN.md) | `Diagram.Inject(BpmnDiagrams)` | `BpmnDiagrams`, `BpmnShape`, `BpmnActivity`, `BpmnSubProcess`, `BpmnTextAnnotation` |
| **Swimlane** | [Swimlane.md](modules/Swimlane.md) | *(always loaded)* | `SwimLaneShape` |
| **Context Menu** | [ContextMenu.md](modules/ContextMenu.md) | `Diagram.Inject(DiagramContextMenu)` | `DiagramContextMenu` |
| **Tooltip** | [Tooltip.md](modules/Tooltip.md) | *(via constraints)* | `DiagramTooltip` |
| **Collaboration** | [Collaboration.md](modules/Collaboration.md) | `Diagram.Inject(DiagramCollaboration)` | `DiagramCollaboration` |
| **Overview** | [Overview.md](modules/Overview.md) | *(companion component)* | `Overview` |
| **Ruler** | [Ruler.md](modules/Ruler.md) | *(companion component)* | `Ruler` |
| **Symbol Palette** | [SymbolPalette.md](modules/SymbolPalette.md) | *(companion component)* | `SymbolPalette` |

---

## Module Injection Reference

The EJ2 Diagram uses optional feature injection via `Diagram.Inject(...)`. Only inject what you need to keep bundle size small.

```typescript
import {
  Diagram,
  // Core always loaded — no inject needed

  // Layout algorithms (choose what you need)
  HierarchicalTree,
  ComplexHierarchicalTree,
  MindMap,
  RadialTree,
  SymmetricLayout,

  // Optional features
  UndoRedo,
  DataBinding,
  Snapping,
  LineRouting,
  ConnectorBridging,
  Virtualization,
  PrintAndExport,
  BpmnDiagrams,
  DiagramContextMenu,
  DiagramCollaboration
} from '@syncfusion/ej2-diagrams';

// Register only the modules you use
Diagram.Inject(
  UndoRedo,
  DataBinding,
  HierarchicalTree,
  Snapping,
  PrintAndExport,
  BpmnDiagrams
);
```

---

## File Count Summary

| Section | Files |
|---|---|
| overview/ | 3 |
| architecture/ | 4 |
| tech-stack/ | 3 |
| code-guidelines/ | 4 |
| dev-process/ | 3 |
| performance/ | 3 |
| ai-agents/ | 10 |
| modules/ | 25 |
| **Total** | **55** |

---

## Source Code Location

All documentation is derived from the EJ2 Diagram TypeScript source at:

```
d:\EJ2src\dev\ej2-diagram-components\src\
```

Key source files:
- `src/diagram/diagram.ts` — Main component (16,000+ lines)
- `src/diagram/objects/` — Node, Connector, Annotation, Port, BPMN, etc.
- `src/diagram/interaction/` — Event handling, tools, routing, snapping
- `src/diagram/layout/` — All layout algorithms
- `src/diagram/rendering/` — SVG and Canvas renderers
- `src/diagram/diagram/` — Settings, enums, history, data source

---

## Contributing to Documentation

When making changes to the EJ2 Diagram source code:

1. Identify which module file(s) in `docs/EJ2Diagram/modules/` cover the changed code
2. Update the relevant sections: Public API, Configuration, Internal Architecture
3. Add or update example code if the behavior changes
4. Update `dependency-map.md` if import relationships change
5. See [documentation-agent.md](ai-agents/custom-agents/documentation-agent.md) for AI-assisted doc updates

---

*Documentation generated from EJ2 Diagram source v17.1 — last updated from source analysis.*
