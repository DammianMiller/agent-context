<!--
  CLAUDE.md Universal Template - v4.0
  
  Complete autonomous agent operating system with zero duplication.
  All variables populated by UAM generator from project analysis.
  
  Core Variables:
    {{PROJECT_NAME}}, {{PROJECT_PATH}}, {{DEFAULT_BRANCH}}, {{STRUCTURE_DATE}}
  
  Memory System:
    {{MEMORY_DB_PATH}}, {{MEMORY_QUERY_CMD}}, {{MEMORY_STORE_CMD}}, {{MEMORY_START_CMD}},
    {{MEMORY_STATUS_CMD}}, {{MEMORY_STOP_CMD}}, {{LONG_TERM_BACKEND}}, {{LONG_TERM_ENDPOINT}},
    {{LONG_TERM_COLLECTION}}, {{SHORT_TERM_LIMIT}}
  
  Worktree:
    {{WORKTREE_CREATE_CMD}}, {{WORKTREE_PR_CMD}}, {{WORKTREE_CLEANUP_CMD}},
    {{WORKTREE_DIR}}, {{BRANCH_PREFIX}}
  
  Paths:
    {{SKILLS_PATH}}, {{DROIDS_PATH}}, {{COMMANDS_PATH}}, {{DOCS_PATH}}, {{SCREENSHOTS_PATH}}
  
  Commands:
    {{TEST_COMMAND}}, {{BUILD_COMMAND}}, {{LINT_COMMAND}}
  
  Conditional Sections (auto-populated from analysis):
    REPOSITORY_STRUCTURE, ARCHITECTURE_OVERVIEW, DATABASE_ARCHITECTURE,
    CORE_COMPONENTS, CLUSTER_CONTEXTS, PROJECT_URLS, KEY_WORKFLOWS,
    ESSENTIAL_COMMANDS, INFRA_WORKFLOW, HEALTH_CHECKS, ROLLBACK_PROCEDURES,
    INCIDENT_RESPONSE, TROUBLESHOOTING, KEY_CONFIG_FILES, DISCOVERED_SKILLS,
    LANGUAGE_DROIDS, FILE_TYPE_ROUTING, SKILL_TRIGGERS, SKILL_MAPPINGS,
    RECENT_ACTIVITY, LEARNED_LESSONS, KNOWN_GOTCHAS, HOT_SPOTS, AUTH_FLOW,
    MCP_PLUGINS, PATH_MIGRATIONS
-->

<coding_guidelines>

# {{PROJECT_NAME}} - Autonomous Agent Guide

You are an autonomous AI agent. Follow the WORKFLOW ENGINE below for EVERY action. No exceptions.

{{#if ISSUE_TRACKER}}
**Note**: {{{ISSUE_TRACKER}}}
{{/if}}

---

## WORKFLOW ENGINE (Execute Every Time)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MANDATORY WORKFLOW ENGINE                             │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  START  │───►│  TASK   │───►│ CONTEXT │───►│  WORK   │───►│ COMPLETE│   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │              │              │              │         │
│       ▼              ▼              ▼              ▼              ▼         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ CHECK TASKS  │ CREATE/CLAIM │ MEMORY+SKILL │ WORKTREE+DO │ VERIFY   │   │
│  │ READ MEMORY  │ TASK         │ CHECK        │ TEST+PR     │ RELEASE  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  GATES: Each phase MUST complete before advancing. No skipping.             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: START (Execute on every session/request)

```bash
uam task ready                    # What's already in progress?
sqlite3 {{MEMORY_DB_PATH}} "SELECT * FROM memories ORDER BY id DESC LIMIT 10;"
```

**Gate**: Do NOT proceed until both commands executed.

### Phase 2: TASK (Create or claim before ANY work)

```bash
# If new work requested:
uam task create --title "Description" --type task|bug|feature --priority 0-4

# Then claim it:
uam task claim <id>               # Announces work, detects overlaps
```

**Gate**: Task ID must exist and be claimed before proceeding.

### Phase 3: CONTEXT (Load relevant knowledge)

```bash
# Query semantic memory for related learnings
{{MEMORY_QUERY_CMD}} "<keywords>"

# Check for applicable skills
ls {{SKILLS_PATH}}/               # Then invoke: Skill(skill: "name")
```

**Gate**: Memory queried and skill identified (if applicable).

### Phase 4: WORK (All changes in worktree)

```bash
# Create isolated worktree
{{WORKTREE_CREATE_CMD}} <slug>
cd {{WORKTREE_DIR}}/NNN-<slug>/

# Verify location before ANY edit
pwd | grep -q "{{WORKTREE_DIR}}" || echo "STOP! Wrong directory!"

# Make changes, test, commit
git add -A && git commit -m "type: description"
{{TEST_COMMAND}}
{{WORKTREE_PR_CMD}} <id>
```

**Gate**: Changes committed via PR from worktree. Never direct to {{DEFAULT_BRANCH}}.

### Phase 5: COMPLETE (Verify and release)

```bash
# Update memories
sqlite3 {{MEMORY_DB_PATH}} "INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'What was done');"
{{MEMORY_STORE_CMD}} lesson "Key learning" --tags relevant,tags --importance 7

# Release task
uam task release <id> --reason "Completed: summary"
```

**Gate**: All items verified before responding:

```
[ ] Task released?     [ ] PR created (not direct push)?
[ ] Memory updated?    [ ] Tests passing?
[ ] Worktree used?     [ ] Skills consulted?
```

---

## AUTOMATIC TRIGGERS

| Pattern Detected | Immediate Action |
|-----------------|------------------|
| Work request (fix/add/change/create/build) | `uam task create --title "..." --type task` |
| Bug report or error | `uam task create --title "..." --type bug --priority 1` |
| Feature request | `uam task create --title "..." --type feature` |
| Code file editing | Check skills → Create worktree → Edit |
| Review/check request | Query memory first |
{{#if SKILL_TRIGGERS}}
{{{SKILL_TRIGGERS}}}
{{/if}}

---

## TASK ROUTING

### By Request Type
| Keywords | Task Type | Workflow | Droids |
|----------|-----------|----------|--------|
| "fix", "bug", "error", "broken" | Bug | Reproduce → Test → Fix | `code-quality-guardian` |
| "add", "implement", "build", "feature" | Feature | Design → Implement → Test | Language specialist |
| "slow", "optimize", "performance" | Performance | Profile → Identify → Optimize | `performance-optimizer` |
| "security", "vulnerability", "audit" | Security | Scan → Assess → Remediate | `security-auditor` |
| "test", "coverage", "spec" | Testing | Write → Run → Report | `code-quality-guardian` |
| "docs", "README", "document" | Docs | Check → Update → Verify | `documentation-expert` |
| "refactor", "clean up" | Refactoring | Scope → Test → Refactor | `code-quality-guardian` |
{{#if HAS_INFRA}}
| "terraform", "infra", "k8s", "cluster" | Infrastructure | Plan → Apply → Verify → Document | Direct handling |
{{/if}}

### By File Type
| Extension | Language | Droid |
|-----------|----------|-------|
{{#if FILE_TYPE_ROUTING}}
{{{FILE_TYPE_ROUTING}}}
{{else}}
| `.ts`, `.tsx`, `.js`, `.jsx` | TypeScript/JavaScript | `typescript-node-expert` |
| `.py` | Python | Language specialist |
| `.go` | Go | Language specialist |
| `.rs` | Rust | Language specialist |
| `.cpp`, `.h`, `.hpp` | C++ | Language specialist |
| `.tf` | Terraform | Direct handling |
| `.yaml`, `.yml` | Kubernetes/Config | Direct handling |
{{/if}}

---

## QUICK REFERENCE

### Task Commands
```bash
uam task create --title "..." --type task|bug|feature|chore|epic|story --priority 0-4
uam task list [--filter-status open|in_progress] [--filter-priority 0,1]
uam task ready                    # Show unblocked tasks
uam task blocked                  # Show blocked tasks
uam task claim <id>               # Claim and start work
uam task show <id>                # View details
uam task release <id> --reason "..." # Complete task
uam task dep --from <blocked> --to <blocker>  # Add dependency
```

### Worktree Commands
```bash
{{WORKTREE_CREATE_CMD}} <slug>    # Create feature branch
cd {{WORKTREE_DIR}}/NNN-<slug>/   # Enter worktree
{{WORKTREE_PR_CMD}} <id>          # Create PR
{{WORKTREE_CLEANUP_CMD}} <id>     # Remove worktree
```

### Memory Commands
```bash
# Short-term (after every action)
sqlite3 {{MEMORY_DB_PATH}} "INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'description');"

# Long-term (for learnings, importance 7+)
{{MEMORY_QUERY_CMD}} "<search>"
{{MEMORY_STORE_CMD}} lesson "learning" --tags a,b --importance 8
```

### Agent Coordination (Multi-agent only)
```bash
uam agent register --name "name" --capabilities "coding,review"
uam agent announce --id <id> --resource "path/" --intent editing
uam agent overlaps --resource "path/"
uam agent complete --id <id> --resource "path/"
uam deploy queue --agent-id <id> --action-type commit --message "..." --files "..."
uam deploy flush
```

### Skills & Droids
```bash
Skill(skill: "typescript-node-expert")  # Inline guidance
Skill(skill: "cli-design-expert")       # CLI work
Skill(skill: "senior-frontend")         # React/TS work
Task(subagent_type: "code-quality-guardian", prompt: "Review...")
Task(subagent_type: "security-auditor", prompt: "Audit...")
```

### Skill vs Droid: When to Use Which
| Use a **Skill** when | Use a **Droid** when |
|---------------------|---------------------|
| Inline guidance needed | Autonomous agent work needed |
| Human follows instructions | Agent executes independently |
| Interactive decision-making | Batch processing of tasks |
| Design/review work | Code generation/refactoring |
| Expands into current context | Runs in parallel as subagent |

---

## RULES (Zero Tolerance)

### 1. Worktrees
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKTREE ENFORCEMENT - ABSOLUTE RULE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ❌ FORBIDDEN: Direct commits to {{DEFAULT_BRANCH}}, editing main repo      │
│  ✅ REQUIRED: Create worktree → cd into it → make changes → PR              │
│  🔴 SELF-CHECK: pwd | grep -q "{{WORKTREE_DIR}}" || echo "STOP!"            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Applies to:** {{WORKTREE_APPLIES_TO}}

### 2. Tasks
- **ALWAYS** create task before work
- **ALWAYS** claim before starting
- **ALWAYS** release when complete
- **NEVER** work without task tracking

### 3. Memory
- **ALWAYS** query memory at task start
- **ALWAYS** update short-term after actions
- **ALWAYS** store learnings (importance 7+) in long-term
- **NEVER** complete task without memory update

### 4. Skills
- **ALWAYS** check for applicable skills before implementing
- **ALWAYS** invoke proactively for specialized work
- **NEVER** implement without consulting relevant skill/droid

{{#if SKILL_MAPPINGS}}
| Task Type | Required Skill/Droid |
|-----------|---------------------|
{{{SKILL_MAPPINGS}}}
{{/if}}

---

## RECOVERY PROCEDURES

### Forgot to create task?
```bash
uam task create --title "Retroactive: what you did" --type task
uam task update <id> --status in_progress
```

### Forgot worktree? Edited main repo directly?
```bash
# If not committed: stash and move
git stash
{{WORKTREE_CREATE_CMD}} <slug>
cd {{WORKTREE_DIR}}/NNN-<slug>/
git stash pop

# If committed: cherry-pick to worktree, reset main
git log -1 --format="%H"
git reset --hard HEAD~1
{{WORKTREE_CREATE_CMD}} <slug>
cd {{WORKTREE_DIR}}/NNN-<slug>/
git cherry-pick <hash>
```

### Command failed?
```bash
{{MEMORY_START_CMD}}
uam coord status
ls -la {{MEMORY_DB_PATH}}
```

---

## MEMORY SYSTEM

### 4-Layer Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: WORKING MEMORY (SQLite)           ~0.15ms access          │
│  ├─ {{SHORT_TERM_LIMIT}} entries max, FIFO eviction                 │
│  └─ Path: {{MEMORY_DB_PATH}}                                        │
│                                                                     │
│  LAYER 2: SESSION MEMORY (SQLite)           ~0.2ms access           │
│  ├─ Session-scoped summaries and decisions                          │
│  └─ Cleaned on session end                                          │
│                                                                     │
│  LAYER 3: SEMANTIC MEMORY ({{LONG_TERM_BACKEND}})  ~1-2ms search    │
│  ├─ Vector embeddings for semantic search                           │
│  └─ Endpoint: {{LONG_TERM_ENDPOINT}}                                │
│                                                                     │
│  LAYER 4: KNOWLEDGE GRAPH (SQLite)          ~0.17ms query           │
│  ├─ Entities: files, functions, concepts, errors                    │
│  └─ Relationships: depends_on, fixes, causes, related_to            │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Selection
| Question | If YES → Layer |
|----------|---------------|
| Did this just happen (last few minutes)? | L1: Working Memory |
| Session-specific decision/context? | L2: Session Memory |
| Reusable learning for future sessions? | L3: Semantic Memory (importance 7+) |
| Relationship between entities? | L4: Knowledge Graph |

### What to Store (Importance 7+)
- Bug fixes with root cause + solution
- Architecture decisions with rationale
- Performance optimizations that worked
- Gotchas and workarounds
- API behaviors that aren't obvious

### Memory Services
```bash
{{MEMORY_START_CMD}}              # Start services
{{MEMORY_STATUS_CMD}}             # Check status
{{MEMORY_STOP_CMD}}               # Stop services
uam memory migrate                # Upgrade schema
```

---

## PROACTIVE DROIDS (Invoke before commit/PR)

| Droid | Trigger | Purpose |
|-------|---------|---------|
| `code-quality-guardian` | All code changes | Complexity, naming, SOLID |
| `security-auditor` | All code changes | OWASP, secrets, injection |
| `performance-optimizer` | Performance-critical | Algorithms, memory, caching |
| `documentation-expert` | New features/APIs | JSDoc, README, accuracy |

{{#if LANGUAGE_DROIDS}}
### Language Specialists
| Droid | Expertise |
|-------|-----------|
{{{LANGUAGE_DROIDS}}}
{{/if}}

---

## BROWSER AUTOMATION

After EVERY browser action:
1. Screenshot → `{{SCREENSHOTS_PATH}}/{timestamp}_{action}.png`
2. Meta file → `{{SCREENSHOTS_PATH}}/{timestamp}_{action}.meta`

---

{{#if REPOSITORY_STRUCTURE}}
## Repository Structure ({{STRUCTURE_DATE}})

```
{{PROJECT_NAME}}/
{{{REPOSITORY_STRUCTURE}}}
```
{{/if}}

{{#if PATH_MIGRATIONS}}
### Path Migration Reference

{{{PATH_MIGRATIONS}}}
{{/if}}

{{#if CLUSTER_CONTEXTS}}
## Cluster Contexts

```bash
{{{CLUSTER_CONTEXTS}}}
```
{{/if}}

{{#if PROJECT_URLS}}
## URLs

{{{PROJECT_URLS}}}
{{/if}}

{{#if KEY_WORKFLOWS}}
## CI/CD Workflows

```
{{{KEY_WORKFLOWS}}}
```
{{/if}}

{{#if ESSENTIAL_COMMANDS}}
## Project Commands

```bash
{{{ESSENTIAL_COMMANDS}}}
```
{{/if}}

{{#if ARCHITECTURE_OVERVIEW}}
## Architecture

{{{ARCHITECTURE_OVERVIEW}}}
{{/if}}

{{#if DATABASE_ARCHITECTURE}}
### Database

{{{DATABASE_ARCHITECTURE}}}
{{/if}}

{{#if CORE_COMPONENTS}}
## Core Components

{{{CORE_COMPONENTS}}}
{{/if}}

{{#if AUTH_FLOW}}
## Authentication Flow

{{{AUTH_FLOW}}}
{{/if}}

{{#if INFRA_WORKFLOW}}
## Infrastructure Workflow

{{{INFRA_WORKFLOW}}}
{{/if}}

{{#if HEALTH_CHECKS}}
## Health Checks

{{{HEALTH_CHECKS}}}
{{/if}}

{{#if ROLLBACK_PROCEDURES}}
## Emergency Rollback

{{{ROLLBACK_PROCEDURES}}}
{{/if}}

{{#if INCIDENT_RESPONSE}}
## Incident Response

{{{INCIDENT_RESPONSE}}}
{{/if}}

{{#if TROUBLESHOOTING}}
## Troubleshooting

{{{TROUBLESHOOTING}}}
{{/if}}

{{#if KEY_CONFIG_FILES}}
## Config Files

| File | Purpose |
|------|---------|
{{{KEY_CONFIG_FILES}}}
{{/if}}

{{#if DISCOVERED_SKILLS}}
## Project Skills

| Skill | Purpose | Use When |
|-------|---------|----------|
{{{DISCOVERED_SKILLS}}}
{{/if}}

{{#if MCP_PLUGINS}}
## MCP Plugins

| Plugin | Purpose |
|--------|---------|
{{{MCP_PLUGINS}}}
{{/if}}

{{#if RECENT_ACTIVITY}}
## Project Knowledge

### Recent Activity
{{{RECENT_ACTIVITY}}}

{{#if LEARNED_LESSONS}}
### Learned Lessons
{{{LEARNED_LESSONS}}}
{{/if}}

{{#if KNOWN_GOTCHAS}}
### Known Gotchas
{{{KNOWN_GOTCHAS}}}
{{/if}}

{{#if HOT_SPOTS}}
### Hot Spots
{{{HOT_SPOTS}}}
{{/if}}
{{/if}}

---

## Completion Checklist

```
[ ] Task created and released
[ ] Worktree used (not main repo)
[ ] PR created (not direct push)
[ ] Tests passing
[ ] Memory updated (short + long term)
[ ] Skills consulted
[ ] No secrets in code
{{#if HAS_INFRA}}
[ ] Infrastructure changes documented
{{/if}}
```

</coding_guidelines>
