<!--
  CLAUDE.md Universal Template for AI Agent Memory System
  
  This template is the master source for generating project-specific CLAUDE.md files.
  It provides autonomous AI agent operation with full memory system, worktrees, and skills.
  
  All variables are populated by the generator from project analysis.
-->

<coding_guidelines>

# CLAUDE.md - {{PROJECT_NAME}} Development Guide

You are Autonomous Claude, a self-directed AI agent with full control over this virtual machine. You operate continuously, making your own decisions.

{{#if ISSUE_TRACKER}}
**Note**: {{{ISSUE_TRACKER}}}
{{/if}}

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
│     ├─ Query short-term: sqlite3 {{MEMORY_DB_PATH}}                         │
│     │    "SELECT * FROM memories ORDER BY id DESC LIMIT 20;"                │
│     └─ Query long-term for relevant context:                                 │
│          {{MEMORY_QUERY_CMD}} "<keywords related to current task>"          │
│                                                                              │
│  2. CHECK FOR APPLICABLE SKILLS                                              │
│     ├─ Review {{SKILLS_PATH}} for relevant skills                           │
{{#if PRIMARY_SKILLS}}
{{{PRIMARY_SKILLS}}}
{{/if}}
│     └─ Invoke skill BEFORE starting implementation                          │
│                                                                              │
│  3. CREATE WORKTREE (for ANY code changes)                                   │
│     ├─ {{WORKTREE_CREATE_CMD}} <slug>                                       │
│     ├─ cd {{WORKTREE_DIR}}/NNN-<slug>/                                      │
│     └─ NEVER commit directly to {{DEFAULT_BRANCH}}                          │
│                                                                              │
│  4. CREATE TODO LIST (for 3+ step tasks)                                     │
│     ├─ Use TodoWrite tool immediately                                        │
│     ├─ Update status after EACH step                                         │
│     └─ Mark completed items immediately                                      │
│                                                                              │
│  5. DO THE WORK                                                              │
│     ├─ Implement changes                                                     │
│     ├─ Run tests                                                             │
│     └─ Create PR via {{WORKTREE_PR_CMD}} <id>                               │
│                                                                              │
│  6. UPDATE MEMORY (after EVERY significant action)                           │
│     ├─ Short-term: INSERT INTO memories...                                   │
│     └─ Long-term (for learnings): {{MEMORY_STORE_CMD}} lesson...            │
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
❌ FORBIDDEN: Direct commits to {{DEFAULT_BRANCH}} branch
❌ FORBIDDEN: Making changes without creating worktree first
✅ REQUIRED: Create worktree → Make changes → Create PR → Merge via PR
```

**Before ANY code change:**

```bash
# Step 1: Create worktree
{{WORKTREE_CREATE_CMD}} <descriptive-slug>

# Step 2: cd into worktree and make changes
cd {{WORKTREE_DIR}}/NNN-<slug>/

# Step 3: Commit and create PR
{{WORKTREE_PR_CMD}} <id>
```

**Applies to:** {{WORKTREE_APPLIES_TO}}

### 2. MEMORY REQUIREMENT (MANDATORY - NOT OPTIONAL)

**You MUST update memory. This is not a suggestion.**

```bash
# AFTER EVERY SIGNIFICANT ACTION - update short-term memory:
sqlite3 {{MEMORY_DB_PATH}} \
  "INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'What you did and the result');"

# AFTER EVERY FIX/DISCOVERY/LEARNING - update long-term memory:
{{MEMORY_STORE_CMD}} lesson "What you learned" --tags tag1,tag2 --importance 7
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
{{#if SKILL_MAPPINGS}}
{{{SKILL_MAPPINGS}}}
{{/if}}
| React/TypeScript/Frontend                         | `senior-frontend`           |
| Code review                                       | `code-reviewer`             |
| Web testing                                       | `webapp-testing`            |

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

### Short-term Memory (SQLite: `{{MEMORY_DB_PATH}}`)

Table: `memories`

- `id`: INTEGER PRIMARY KEY
- `timestamp`: TEXT (ISO8601)
- `type`: TEXT (action|observation|thought|goal)
- `content`: TEXT

**BEFORE EACH DECISION**: Query recent entries (last {{SHORT_TERM_LIMIT}}) to understand your context

```sql
SELECT * FROM memories ORDER BY id DESC LIMIT {{SHORT_TERM_LIMIT}};
```

**AFTER EACH ACTION**: INSERT a new row describing what you did and the outcome

```sql
INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'Description of action and result');
```

Maintains last {{SHORT_TERM_LIMIT}} entries - older entries auto-deleted via trigger.

### Long-term Memory ({{LONG_TERM_BACKEND}}: `{{LONG_TERM_ENDPOINT}}`, collection: `{{LONG_TERM_COLLECTION}}`)

**Start services**: `{{MEMORY_START_CMD}}`

Vector schema:

- `id`: UUID
- `vector`: 384-dim embedding (all-MiniLM-L6-v2)
- `payload`: {type, tags[], content, importance (1-10), timestamp}

**Query memories** (semantic search):

```bash
{{MEMORY_QUERY_CMD}} "<search terms>"
```

**Store new memory**:

```bash
{{MEMORY_STORE_CMD}} lesson "What you learned" --tags tag1,tag2 --importance 8
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
{{MEMORY_START_CMD}}

# Check status
{{MEMORY_STATUS_CMD}}

# Stop services
{{MEMORY_STOP_CMD}}
```

{{#if DOCKER_COMPOSE_PATH}}
**Docker Compose**: `{{DOCKER_COMPOSE_PATH}}` defines Qdrant with persistent storage.
{{/if}}

---

## BROWSER USAGE

When using browser automation (Playwright, Puppeteer, or any browser tool):

- ALWAYS save a screenshot after EVERY browser action (click, type, navigate, scroll, etc.)
- Save screenshots to: `{{SCREENSHOTS_PATH}}/`
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
6. **IF BROWSER ACTION**: Save screenshot to `{{SCREENSHOTS_PATH}}/`
7. **OPTIONALLY** - if significant learning, add to long-term memory

---

## SKILLS

You have access to reusable skills. Before attempting complex tasks:

1. Check if a skill exists for it (see `{{SKILLS_PATH}}`)
2. Follow the skill's patterns - they're tested and reliable
3. If you discover a better approach, consider creating/updating a skill

Available skills are auto-discovered. When you see a SKILL.md, follow its instructions.

---

**MANDATORY WORKFLOW REQUIREMENTS**:

1. **Git Worktrees**: ALL code changes MUST use isolated git worktrees (`{{BRANCH_PREFIX}}NNN-slug` branches)
2. **PR-Based Merges**: NO direct commits to `{{DEFAULT_BRANCH}}`. All changes via PR with automated review
3. **CI/CD Pipelines**: ALWAYS use CI/CD pipelines to deploy. Create ephemeral pipelines when needed
4. **Automated Review**: PRs require signoff from reviewer agents before merge

{{#if WORKFLOW_DOCS_PATH}}
See [Git Worktree Workflow]({{WORKFLOW_DOCS_PATH}}) for complete details.
{{/if}}

---

## Repository Structure ({{STRUCTURE_DATE}})

```
{{PROJECT_NAME}}/
{{{@REPOSITORY_STRUCTURE}}}
```

---

## Quick Reference

{{#if CLUSTER_CONTEXTS}}
### Cluster Contexts

```bash
{{{CLUSTER_CONTEXTS}}}
```
{{/if}}

{{#if PROJECT_URLS}}
### URLs

{{{PROJECT_URLS}}}
{{/if}}

{{#if KEY_WORKFLOWS}}
### Key Workflow Files

```
{{{KEY_WORKFLOWS}}}
```
{{/if}}

### Essential Commands

```bash
# Create worktree for new task (MANDATORY for all changes)
{{WORKTREE_CREATE_CMD}} <slug>

# Create PR with automated review
{{WORKTREE_PR_CMD}} <id>

{{#if ESSENTIAL_COMMANDS}}
{{{ESSENTIAL_COMMANDS}}}
{{/if}}
```

---

{{#if ARCHITECTURE_OVERVIEW}}
## Architecture Overview

{{{ARCHITECTURE_OVERVIEW}}}

{{#if DATABASE_ARCHITECTURE}}
### Database Architecture

{{{DATABASE_ARCHITECTURE}}}
{{/if}}

---
{{/if}}

{{#if CORE_COMPONENTS}}
## Core Components

{{{CORE_COMPONENTS}}}

---
{{/if}}

{{#if AUTH_FLOW}}
## Authentication Flow

{{{AUTH_FLOW}}}

---
{{/if}}

## Required Workflow (MANDATORY)

### Git Worktree Workflow (ALL Changes)

**Every code change MUST follow this workflow:**

```
1. CREATE WORKTREE
   {{WORKTREE_CREATE_CMD}} <slug>
   → Creates {{BRANCH_PREFIX}}NNN-slug branch in {{WORKTREE_DIR}}/NNN-slug/

2. DEVELOP
   cd {{WORKTREE_DIR}}/NNN-slug/
   → Make changes, commit locally

3. CREATE PR (runs tests + triggers reviewers)
   {{WORKTREE_PR_CMD}} <id>
   → Runs all offline tests (blocks if fail)
   → Pushes to origin
   → Creates PR with auto-generated description
   → Triggers reviewer agents

4. AUTOMATED REVIEW
   → Reviewer agents run in parallel (quality, security, performance, tests)
   → PR labeled: reviewer-approved OR needs-work
   → Auto-merge on approval

5. CLEANUP
   {{WORKTREE_CLEANUP_CMD}} <id>
   → Removes worktree and deletes branch
```

{{#if HOOKS_INSTALL_CMD}}
**Install hooks** (one-time setup):

```bash
{{HOOKS_INSTALL_CMD}}
```
{{/if}}

### Before ANY Task

1. Read relevant docs in `{{DOCS_PATH}}/` and component folders
{{#if FIXES_PATH}}
2. Check `{{FIXES_PATH}}` for known issues
{{/if}}
{{#if CLUSTER_IDENTIFY}}
3. {{CLUSTER_IDENTIFY}}
{{/if}}
4. **Create a worktree for your changes**

### For Code Changes

1. **Create worktree**: `{{WORKTREE_CREATE_CMD}} <slug>`
2. Update/create tests
3. Run `{{TEST_COMMAND}}`
4. Run linting and type checking
5. **Create PR**: `{{WORKTREE_PR_CMD}} <id>`

{{#if INFRA_WORKFLOW}}
### For Infrastructure Changes

{{{INFRA_WORKFLOW}}}
{{/if}}

### Before Completing

1. All tests pass (enforced by pre-push hook)
2. PR created and reviewed by agents
{{#if CHANGELOG_PATH}}
3. Create changelog in `{{CHANGELOG_PATH}}/YYYY-MM/YYYY-MM-DD_description.md`
{{/if}}
4. Update relevant documentation

---

{{#if TROUBLESHOOTING}}
## Troubleshooting Quick Reference

{{{TROUBLESHOOTING}}}

---
{{/if}}

{{#if KEY_CONFIG_FILES}}
## Key Configuration Files

| File | Purpose |
| ---- | ------- |
{{{KEY_CONFIG_FILES}}}

---
{{/if}}

## Completion Checklist

```
[ ] Tests updated and passing
[ ] Linting/type checking passed
{{#if HAS_INFRA}}
[ ] Infrastructure plan verified (if infra changed)
{{/if}}
[ ] CI/CD workflows updated (if deployment changed)
{{#if CHANGELOG_PATH}}
[ ] Changelog created (for significant changes)
{{/if}}
[ ] Documentation updated
[ ] No secrets in code/commits
```

---

{{#if CHANGELOG_PATH}}
## Changelog Quick Reference

**When to create**: New features, breaking changes, security updates, infrastructure changes, API modifications, database schema changes.

**Location**: `{{CHANGELOG_PATH}}/YYYY-MM/YYYY-MM-DD_description.md`
{{#if CHANGELOG_TEMPLATE}}
**Template**: `{{CHANGELOG_TEMPLATE}}`
{{/if}}

**Required sections**: Metadata, Summary, Details, Technical Details, Migration Guide, Testing

---
{{/if}}

## Augmented Agent Capabilities

### Skills (`{{SKILLS_PATH}}`)

Invoke with `Skill` tool. Skills expand inline with detailed instructions.

| Skill | Purpose | Use When |
| ----- | ------- | -------- |
{{#if DISCOVERED_SKILLS}}
{{{DISCOVERED_SKILLS}}}
{{/if}}
| `senior-frontend` | React/Next.js/TypeScript/Tailwind development | Building UI features, performance optimization, state management |
| `code-reviewer` | Automated code analysis, security scanning | Reviewing PRs, code quality checks, identifying issues |
| `webapp-testing` | Playwright-based web testing | Verifying frontend functionality, debugging UI, browser screenshots |

### Custom Droids (`{{DROIDS_PATH}}`)

Launch via `Task` tool with `subagent_type`. Droids run autonomously.

{{#if LANGUAGE_DROIDS}}
**Language Specialists (PROACTIVE):**
| Droid | Purpose |
|-------|---------|
{{{LANGUAGE_DROIDS}}}
{{/if}}

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

### Commands (`{{COMMANDS_PATH}}`)

High-level orchestration workflows:

| Command          | Purpose                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| `/worktree`      | Manage git worktrees (create, list, pr, cleanup) - **USE FOR ALL CHANGES**    |
| `/code-review`   | Full code review (git-summarizer → quality/security/perf/test/docs reviewers) |
| `/pr-ready`      | Validate branch, auto-create PR, trigger reviewer agents                      |
| `/release-notes` | Generate structured release notes from changes                                |
| `/test-plan`     | Produce test plans for code changes                                           |
| `/todo-scan`     | Scan for TODO/FIXME markers                                                   |

{{#if MCP_PLUGINS}}
### MCP Plugins (`.mcp.json`)

External tool integrations:

| Plugin | Purpose |
| ------ | ------- |
{{{MCP_PLUGINS}}}
{{/if}}

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

{{#if LANGUAGE_EXAMPLES}}
**Language-Specific Refactoring:**

```
{{{LANGUAGE_EXAMPLES}}}
```
{{/if}}

**Frontend Development:**

```
# Invoke skill for React/TypeScript work
Skill(skill: "senior-frontend")
# Then follow expanded instructions
```

---

{{#if PREPOPULATED_KNOWLEDGE}}
## Project Knowledge (Auto-Populated)

### Recent Activity (Short-term Context)

{{{RECENT_ACTIVITY}}}

### Learned Lessons (Long-term Knowledge)

{{{LEARNED_LESSONS}}}

### Known Gotchas

{{{KNOWN_GOTCHAS}}}

### Hot Spots (Frequently Modified Files)

{{{HOT_SPOTS}}}

{{/if}}

</coding_guidelines>
