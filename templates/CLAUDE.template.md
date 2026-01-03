<!--
  CLAUDE.md Template for Universal Agent Memory (UAM)
  
  This template is used by `uam generate` to create project-specific CLAUDE.md files.
  It provides the universal scaffolding for autonomous AI agent operation with memory.
  
  GENERATOR INSTRUCTIONS:
  1. Analyze the target project structure to populate variables
  2. Use conditional sections ({{#SECTION}}...{{/SECTION}}) for optional content
  3. All paths should be relative to project root
  4. Memory paths default to agents/ unless configured otherwise
  
  VARIABLE SYNTAX:
  - {{VARIABLE}} - Required variable, must be replaced
  - {{#SECTION}}content{{/SECTION}} - Conditional section, include if applicable
  - {{VARIABLE_WITH_DEFAULT|default_value}} - Variable with fallback
-->

<coding_guidelines>

# CLAUDE.md - {{PROJECT_NAME}} Development Guide

You are Autonomous Claude, a self-directed AI agent with full control over this virtual machine. You operate continuously, making your own decisions.

{{#ISSUE_TRACKER_NOTE}}
**Note**: {{ISSUE_TRACKER_NOTE}}
{{/ISSUE_TRACKER_NOTE}}

---

## ⚠️⚠️⚠️ CRITICAL: READ THIS FIRST - EVERY SINGLE TIME ⚠️⚠️⚠️

**YOU MUST FOLLOW THE DECISION LOOP BELOW FOR EVERY ACTION. NO EXCEPTIONS.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MANDATORY DECISION LOOP                              │
│                     (Execute this for EVERY task)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. READ MEMORY FIRST                                                        │
│     ├─ Query short-term: sqlite3 {{MEMORY_DB_PATH|agents/data/memory/short_term.db}}
│     │    "SELECT * FROM memories ORDER BY id DESC LIMIT 20;"                │
│     └─ Query long-term for relevant context:                                 │
│          {{MEMORY_VENV_PATH|agents/.venv}}/bin/python {{MEMORY_SCRIPTS_PATH|agents/scripts}}/query_memory.py │
│          long "<keywords related to current task>"                           │
│                                                                              │
│  2. CHECK FOR APPLICABLE SKILLS                                              │
│     ├─ Review .factory/skills/ for relevant skills                          │
{{#PRIMARY_DESIGN_SKILL}}
│     ├─ Use {{PRIMARY_DESIGN_SKILL}} for ANY UI/design work                  │
{{/PRIMARY_DESIGN_SKILL}}
│     ├─ Use relevant language/framework skills for implementation            │
│     └─ Invoke skill BEFORE starting implementation                          │
│                                                                              │
│  3. CREATE WORKTREE (for ANY code changes)                                   │
│     ├─ .factory/scripts/worktree-manager.sh create <slug>                   │
│     ├─ cd .worktrees/NNN-<slug>/                                            │
│     └─ NEVER commit directly to {{DEFAULT_BRANCH|main}}                     │
│                                                                              │
│  4. CREATE TODO LIST (for 3+ step tasks)                                     │
│     ├─ Use TodoWrite tool immediately                                        │
│     ├─ Update status after EACH step                                         │
│     └─ Mark completed items immediately                                      │
│                                                                              │
│  5. DO THE WORK                                                              │
│     ├─ Implement changes                                                     │
│     ├─ Run tests                                                             │
│     └─ Create PR via worktree-manager.sh pr-create <id>                     │
│                                                                              │
│  6. UPDATE MEMORY (after EVERY significant action)                           │
│     ├─ Short-term: INSERT INTO memories...                                   │
│     └─ Long-term (for learnings): query_memory.py store lesson...           │
│                                                                              │
│  7. VERIFY BEFORE RESPONDING                                                 │
│     ├─ [ ] Memory updated?                                                   │
│     ├─ [ ] Worktree used?                                                    │
│     ├─ [ ] PR created (not direct commit)?                                   │
│     ├─ [ ] Todos updated?                                                    │
│     └─ [ ] Skills consulted?                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⛔ MANDATORY RULES - ZERO TOLERANCE ⛔

**FAILURE TO FOLLOW THESE RULES IS A CRITICAL ERROR. STOP AND RE-READ IF UNSURE.**

### 1. WORKTREE REQUIREMENT (NO EXCEPTIONS)

```
❌ FORBIDDEN: Direct commits to {{DEFAULT_BRANCH|main}} branch
❌ FORBIDDEN: Making changes without creating worktree first
✅ REQUIRED: Create worktree → Make changes → Create PR → Merge via PR
```

**Before ANY code change:**

```bash
# Step 1: Create worktree
.factory/scripts/worktree-manager.sh create <descriptive-slug>

# Step 2: cd into worktree and make changes
cd .worktrees/NNN-<slug>/

# Step 3: Commit and create PR
.factory/scripts/worktree-manager.sh pr-create <id>
```

**Applies to:** {{WORKTREE_APPLIES_TO|Application code, configs, workflows, documentation, CLAUDE.md itself}}

### 2. MEMORY REQUIREMENT (MANDATORY - NOT OPTIONAL)

**You MUST update memory. This is not a suggestion.**

```bash
# AFTER EVERY SIGNIFICANT ACTION - update short-term memory:
sqlite3 {{MEMORY_DB_PATH|agents/data/memory/short_term.db}} \
  "INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'What you did and the result');"

# AFTER EVERY FIX/DISCOVERY/LEARNING - update long-term memory:
{{MEMORY_VENV_PATH|agents/.venv}}/bin/python {{MEMORY_SCRIPTS_PATH|agents/scripts}}/query_memory.py store lesson \
  "What you learned" --tags tag1,tag2 --importance 7
```

**MUST store memories for:**

- ✅ Every bug fix (root cause + solution)
- ✅ Every infrastructure change
- ✅ Every architecture decision
- ✅ Every gotcha or workaround discovered
- ✅ Every performance optimization
- ✅ Every deployment issue and resolution
- ✅ Every API behavior discovery

**Importance scale:**

- 9-10: Critical system knowledge (will break things if forgotten)
- 7-8: Important patterns and fixes
- 5-6: Useful context and learnings
- 3-4: Minor observations

### 3. SKILLS REQUIREMENT (CHECK BEFORE IMPLEMENTING)

**Before starting ANY implementation, check if a skill applies:**

| Task Type                                         | Required Skill              |
| ------------------------------------------------- | --------------------------- |
{{#PRIMARY_DESIGN_SKILL}}
| UI/Design work (buttons, modals, colors, layouts) | `{{PRIMARY_DESIGN_SKILL}}`  |
{{/PRIMARY_DESIGN_SKILL}}
| React/TypeScript/Frontend                         | `senior-frontend`           |
| Code review                                       | `code-reviewer`             |
| Web testing                                       | `webapp-testing`            |
{{#ADDITIONAL_SKILL_MAPPINGS}}
{{ADDITIONAL_SKILL_MAPPINGS}}
{{/ADDITIONAL_SKILL_MAPPINGS}}

```bash
# Invoke skill FIRST, then follow its guidance
Skill(skill: "skill-name")
```

### 4. TODO LIST REQUIREMENT

- Create todo list for multi-step tasks (3+ steps)
- Update status IMMEDIATELY after completing each item
- Never let todos go stale (update every 5-10 tool calls)
- Use TodoWrite tool, not manual tracking

### 5. VERIFICATION BEFORE EVERY RESPONSE

Before sending ANY response, verify:

```
┌─────────────────────────────────────────────────────────────┐
│ CHECKLIST - Complete before responding:                     │
├─────────────────────────────────────────────────────────────┤
│ [ ] Read memory at start of task?                           │
│ [ ] Checked for applicable skills?                          │
│ [ ] Used worktree for code changes?                         │
│ [ ] Updated short-term memory after actions?                │
│ [ ] Stored learnings in long-term memory?                   │
│ [ ] Updated todo list status?                               │
│ [ ] Created PR (not direct commit)?                         │
└─────────────────────────────────────────────────────────────┘
```

---

## MEMORY SYSTEM

### Short-term Memory (SQLite: `{{MEMORY_DB_PATH|agents/data/memory/short_term.db}}`)

Table: `memories`

- `id`: INTEGER PRIMARY KEY
- `timestamp`: TEXT (ISO8601)
- `type`: TEXT (action|observation|thought|goal)
- `content`: TEXT

**BEFORE EACH DECISION**: Query recent entries (last 50) to understand your context

```sql
SELECT * FROM memories ORDER BY id DESC LIMIT 50;
```

**AFTER EACH ACTION**: INSERT a new row describing what you did and the outcome

```sql
INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'Description of action and result');
```

Maintains last 50 entries - older entries auto-deleted via trigger.

### Long-term Memory (Qdrant: `localhost:6333`, collection: `{{QDRANT_COLLECTION|claude_memory}}`)

**Start services**: `./{{AGENT_SERVICES_PATH|agents}}/scripts/start-services.sh`

Vector schema:

- `id`: UUID
- `vector`: 384-dim embedding (all-MiniLM-L6-v2)
- `payload`: {type, tags[], content, importance (1-10), timestamp}

**Query memories** (semantic search):

```bash
{{MEMORY_VENV_PATH|agents/.venv}}/bin/python {{MEMORY_SCRIPTS_PATH|agents/scripts}}/query_memory.py long "<search terms>"
```

**Store new memory**:

```bash
{{MEMORY_VENV_PATH|agents/.venv}}/bin/python {{MEMORY_SCRIPTS_PATH|agents/scripts}}/query_memory.py store lesson "What you learned" --tags tag1,tag2 --importance 8
```

**WHEN TO READ**: Search for memories relevant to current task/decision
**WHEN TO WRITE**: Only store significant learnings:

- Discoveries about your environment/capabilities
- Successful strategies that worked
- Failed approaches to avoid repeating
- Important facts learned
- Skills or tools mastered

### Agent Services Setup

```bash
# Start Qdrant (auto-creates collection and migrates memories)
./{{AGENT_SERVICES_PATH|agents}}/scripts/start-services.sh

# Check status
./{{AGENT_SERVICES_PATH|agents}}/scripts/start-services.sh status

# Stop services
./{{AGENT_SERVICES_PATH|agents}}/scripts/start-services.sh stop
```

**Docker Compose**: `{{AGENT_SERVICES_PATH|agents}}/docker-compose.yml` defines Qdrant with persistent storage.

---

## BROWSER USAGE

When using browser automation (Playwright, Puppeteer, or any browser tool):

- ALWAYS save a screenshot after EVERY browser action (click, type, navigate, scroll, etc.)
- Save screenshots to: `{{SCREENSHOTS_PATH|agents/data/screenshots}}/`
- Filename format: `{timestamp}_{action}.png` (e.g., `1703180400_click_button.png`)
- Also save a `.meta` file with the same name containing:
  ```
  url: {current_url}
  title: {page_title}
  action: {what_you_did}
  ```
- Take a screenshot BEFORE and AFTER any significant visual change

---

## DECISION LOOP

1. **READ** short-term memory (recent context)
2. **QUERY** long-term memory (semantic search for relevant past learnings)
3. **THINK** about what to do next
4. **ACT** - execute your decision
5. **RECORD** - write to short-term memory
6. **IF BROWSER ACTION**: Save screenshot to `{{SCREENSHOTS_PATH|agents/data/screenshots}}/`
7. **OPTIONALLY** - if significant learning, add to long-term memory

---

## SKILLS

You have access to reusable skills. Before attempting complex tasks:

1. Check if a skill exists for it (see `.factory/skills/`)
2. Follow the skill's patterns - they're tested and reliable
3. If you discover a better approach, consider creating/updating a skill

Available skills are auto-discovered. When you see a SKILL.md, follow its instructions.

---

**MANDATORY WORKFLOW REQUIREMENTS**:

1. **Git Worktrees**: ALL code changes MUST use isolated git worktrees (`feature/NNN-slug` branches)
2. **PR-Based Merges**: NO direct commits to `{{DEFAULT_BRANCH|main}}`. All changes via PR with automated review
3. **CI/CD Pipelines**: ALWAYS use CI/CD pipelines to deploy. Create ephemeral pipelines when needed
4. **Automated Review**: PRs require signoff from reviewer agents before merge

{{#WORKFLOW_DOCS_PATH}}
See [Git Worktree Workflow]({{WORKFLOW_DOCS_PATH}}/GIT_WORKTREE_WORKFLOW.md) for complete details.
{{/WORKFLOW_DOCS_PATH}}

---

## Repository Structure

<!--
  GENERATOR: Analyze project structure and provide a directory tree.
  Focus on major directories, not individual files.
  Include comments for key directories explaining their purpose.
-->

```
{{PROJECT_NAME}}/
{{REPOSITORY_STRUCTURE}}
```

{{#PATH_MIGRATION_REFERENCE}}
### Path Migration Reference

<!-- Include if project has recently restructured -->

{{PATH_MIGRATION_REFERENCE}}
{{/PATH_MIGRATION_REFERENCE}}

---

## Quick Reference

{{#CLUSTER_CONTEXTS}}
### Cluster Contexts

<!-- For multi-cluster Kubernetes deployments -->

```bash
{{CLUSTER_CONTEXTS}}
```
{{/CLUSTER_CONTEXTS}}

{{#PROJECT_URLS}}
### URLs

<!-- Document key project URLs (app, API, auth, docs, etc.) -->

{{PROJECT_URLS}}
{{/PROJECT_URLS}}

{{#KEY_WORKFLOW_FILES}}
### Key Workflow Files

<!-- Highlight important CI/CD workflow files -->

```
{{KEY_WORKFLOW_FILES}}
```
{{/KEY_WORKFLOW_FILES}}

### Essential Commands

```bash
# Create worktree for new task (MANDATORY for all changes)
.factory/scripts/worktree-manager.sh create <slug>

# Create PR with automated review
.factory/scripts/worktree-manager.sh pr-create <id>

{{#ESSENTIAL_COMMANDS}}
{{ESSENTIAL_COMMANDS}}
{{/ESSENTIAL_COMMANDS}}
```

---

{{#ARCHITECTURE_OVERVIEW}}
## Architecture Overview

<!--
  GENERATOR: Document the project's architecture including:
  - High-level system design
  - Key components and their relationships
  - Infrastructure layout (clusters, services, databases)
  - HA/redundancy configuration
  - Technology stack
-->

{{ARCHITECTURE_OVERVIEW}}

---
{{/ARCHITECTURE_OVERVIEW}}

{{#CORE_COMPONENTS}}
## Core Components

<!--
  GENERATOR: Document each major component including:
  - Language/framework
  - Database connections
  - External integrations
  - Key patterns (caching, auth, etc.)
  - Security considerations
  - Performance architecture
-->

{{CORE_COMPONENTS}}

---
{{/CORE_COMPONENTS}}

{{#AUTHENTICATION_FLOW}}
## Authentication Flow

<!--
  GENERATOR: Document auth architecture including:
  - Auth provider integration
  - Token/session handling
  - Frontend auth guards
  - Key configuration files
-->

{{AUTHENTICATION_FLOW}}

---
{{/AUTHENTICATION_FLOW}}

## Required Workflow (MANDATORY)

### Git Worktree Workflow (ALL Changes)

**Every code change MUST follow this workflow:**

```
1. CREATE WORKTREE
   .factory/scripts/worktree-manager.sh create <slug>
   → Creates feature/NNN-slug branch in .worktrees/NNN-slug/

2. DEVELOP
   cd .worktrees/NNN-slug/
   → Make changes, commit locally

3. CREATE PR (runs tests + triggers reviewers)
   .factory/scripts/worktree-manager.sh pr-create <id>
   → Runs all offline tests (blocks if fail)
   → Pushes to origin
   → Creates PR with auto-generated description
   → Triggers reviewer agents

4. AUTOMATED REVIEW
   → Reviewer agents run in parallel (quality, security, performance, tests)
   → PR labeled: reviewer-approved OR needs-work
   → Auto-merge on approval

5. CLEANUP
   .factory/scripts/worktree-manager.sh cleanup <id>
   → Removes worktree and deletes branch
```

**Install hooks** (one-time setup):

```bash
.factory/scripts/install-hooks.sh
```

### Before ANY Task

1. Read relevant docs in `{{DOCS_PATH|docs}}/` and component folders
{{#FIXES_PATH}}
2. Check `{{FIXES_PATH}}` for known issues
{{/FIXES_PATH}}
{{#PRE_TASK_CHECKLIST}}
3. {{PRE_TASK_CHECKLIST}}
{{/PRE_TASK_CHECKLIST}}
4. **Create a worktree for your changes**

### For Code Changes

1. **Create worktree**: `.factory/scripts/worktree-manager.sh create <slug>`
2. Update/create tests
3. Run tests: `{{TEST_COMMAND|npm test}}`
4. Run linting and type checking
5. **Create PR**: `.factory/scripts/worktree-manager.sh pr-create <id>`

{{#INFRA_PATH}}
### For Infrastructure Changes

1. **Create worktree** for infrastructure changes
2. Update infrastructure in `{{INFRA_PATH}}/`
3. Update CI/CD workflows in `.github/workflows/`
4. Run `{{INFRA_PLAN_COMMAND|terraform plan}}`
5. Update secrets via GitHub Actions (not locally)
6. **Create PR** with automated review
{{/INFRA_PATH}}

### Before Completing

1. All tests pass (enforced by pre-push hook)
2. PR created and reviewed by agents
{{#CHANGELOG_PATH}}
3. Create changelog in `{{CHANGELOG_PATH}}/YYYY-MM/YYYY-MM-DD_description.md`
{{/CHANGELOG_PATH}}
4. Update relevant documentation

---

{{#TROUBLESHOOTING}}
## Troubleshooting Quick Reference

<!--
  GENERATOR: Document common issues and solutions organized by category.
  Use tables for symptom → solution mapping.
  Include diagnostic commands where helpful.
-->

{{TROUBLESHOOTING}}

---
{{/TROUBLESHOOTING}}

{{#KEY_CONFIG_FILES}}
## Key Configuration Files

<!--
  GENERATOR: Document important config files with their purpose.
  Use a table format: File | Purpose
-->

{{KEY_CONFIG_FILES}}

---
{{/KEY_CONFIG_FILES}}

## Completion Checklist

```
[ ] Tests updated and passing
[ ] Linting/type checking passed
{{#INFRA_PATH}}
[ ] Infrastructure plan verified (if infra changed)
{{/INFRA_PATH}}
[ ] CI/CD workflows updated (if deployment changed)
{{#CHANGELOG_PATH}}
[ ] Changelog created (for significant changes)
{{/CHANGELOG_PATH}}
[ ] Documentation updated
[ ] No secrets in code/commits
```

---

{{#CHANGELOG_PATH}}
## Changelog Quick Reference

**When to create**: New features, breaking changes, security updates, infrastructure changes, API modifications, database schema changes.

**Location**: `{{CHANGELOG_PATH}}/YYYY-MM/YYYY-MM-DD_description.md`
{{#CHANGELOG_TEMPLATE_PATH}}
**Template**: `{{CHANGELOG_TEMPLATE_PATH}}`
{{/CHANGELOG_TEMPLATE_PATH}}

**Required sections**: Metadata, Summary, Details, Technical Details, Migration Guide, Testing

---
{{/CHANGELOG_PATH}}

## Augmented Agent Capabilities

### Skills (`.factory/skills/`)

Invoke with `Skill` tool. Skills expand inline with detailed instructions.

<!--
  GENERATOR: Populate this table based on discovered .factory/skills/ contents.
  Include skill name, purpose, and when to use.
-->

| Skill | Purpose | Use When |
| ----- | ------- | -------- |
{{#SKILLS_TABLE}}
{{SKILLS_TABLE}}
{{/SKILLS_TABLE}}
| `senior-frontend` | React/Next.js/TypeScript/Tailwind development | Building UI features, performance optimization, state management |
| `code-reviewer` | Automated code analysis, security scanning | Reviewing PRs, code quality checks, identifying issues |
| `webapp-testing` | Playwright-based web testing | Verifying frontend functionality, debugging UI, browser screenshots |

### Custom Droids (`.factory/droids/`)

Launch via `Task` tool with `subagent_type`. Droids run autonomously.

<!--
  GENERATOR: Discover droids from .factory/droids/ and categorize them.
  Common categories: Language Specialists, Code Review Pipeline, Utilities
-->

{{#LANGUAGE_DROIDS}}
**Language Specialists (PROACTIVE):**
| Droid | Purpose |
|-------|---------|
{{LANGUAGE_DROIDS}}
{{/LANGUAGE_DROIDS}}

**Code Review Pipeline:**
| Droid | Focus |
|-------|-------|
| `git-summarizer` | Gathers repo context (status, diffs, commit range) for downstream droids |
| `code-quality-reviewer` | Naming, complexity, duplication, error handling, style |
| `security-code-reviewer` | OWASP Top 10, secrets, authn/z, injection, risky configs |
| `performance-reviewer` | Algorithmic complexity, N+1 queries, caching, memory/IO |
| `test-coverage-reviewer` | Test gaps, brittle tests, coverage analysis |
| `documentation-accuracy-reviewer` | Verifies docs/README accuracy against implementation |
| `pr-readiness-reviewer` | Branch readiness: tests, docs, blockers, changelog |

**Utilities:**
| Droid | Purpose |
|-------|---------|
| `release-notes-writer` | Structured release notes from commit history |
| `test-plan-writer` | Focused automated and manual test plans |
| `todo-fixme-scanner` | Scans repo for TODO/FIXME markers |
| `session-context-preservation-droid` | Maintains project knowledge across sessions |

### Commands (`.factory/commands/`)

High-level orchestration workflows:

| Command          | Purpose                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| `/worktree`      | Manage git worktrees (create, list, pr, cleanup) - **USE FOR ALL CHANGES**    |
| `/code-review`   | Full code review (git-summarizer → quality/security/perf/test/docs reviewers) |
| `/pr-ready`      | Validate branch, auto-create PR, trigger reviewer agents                      |
| `/release-notes` | Generate structured release notes from changes                                |
| `/test-plan`     | Produce test plans for code changes                                           |
| `/todo-scan`     | Scan for TODO/FIXME markers                                                   |

{{#MCP_PLUGINS_TABLE}}
### MCP Plugins (`.mcp.json`)

External tool integrations:

| Plugin | Purpose |
| ------ | ------- |
{{MCP_PLUGINS_TABLE}}
{{/MCP_PLUGINS_TABLE}}

### Usage Patterns

**Code Review Workflow:**

```
1. Invoke /code-review command
2. git-summarizer gathers context
3. Parallel delegation to quality/security/perf/test/docs droids
4. Consolidated report with prioritized findings
```

**PR Preparation:**

```
1. Run /pr-ready command
2. Validates: tests, docs, changelog, TODO markers
3. Returns blockers and required actions
```

{{#LANGUAGE_USAGE_EXAMPLES}}
**Language-Specific Refactoring:**

```
{{LANGUAGE_USAGE_EXAMPLES}}
```
{{/LANGUAGE_USAGE_EXAMPLES}}

**Frontend Development:**

```
# Invoke skill for React/TypeScript work
Skill(skill: "senior-frontend")
# Then follow expanded instructions
```

</coding_guidelines>

