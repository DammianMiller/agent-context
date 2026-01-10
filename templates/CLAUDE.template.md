<!--
  CLAUDE.md Universal Template for AI Agent Memory System
  
  This template is the master source for generating project-specific CLAUDE.md files.
  It provides autonomous AI agent operation with full memory system, worktrees, and skills.
  
  All variables are populated by the UAM generator from project analysis.
  
  Template Variables:
  ==================
  Core:
    {{PROJECT_NAME}}          - Name of the project (from package.json or git)
    {{DEFAULT_BRANCH}}        - Main branch name (main/master)
    {{STRUCTURE_DATE}}        - Date of last structure update
  
  Memory System:
    {{MEMORY_DB_PATH}}        - Path to SQLite short-term memory
    {{MEMORY_QUERY_CMD}}      - Command to query long-term memory
    {{MEMORY_STORE_CMD}}      - Command to store long-term memory
    {{MEMORY_START_CMD}}      - Command to start memory services
    {{MEMORY_STATUS_CMD}}     - Command to check memory status
    {{MEMORY_STOP_CMD}}       - Command to stop memory services
    {{LONG_TERM_BACKEND}}     - Backend type (Qdrant/Chroma/etc)
    {{LONG_TERM_ENDPOINT}}    - Backend endpoint
    {{LONG_TERM_COLLECTION}}  - Collection name
    {{SHORT_TERM_LIMIT}}      - Max short-term entries
  
  Worktree:
    {{WORKTREE_CREATE_CMD}}   - Command to create worktree
    {{WORKTREE_PR_CMD}}       - Command to create PR
    {{WORKTREE_CLEANUP_CMD}}  - Command to cleanup worktree
    {{WORKTREE_DIR}}          - Worktree directory path
    {{WORKTREE_APPLIES_TO}}   - What worktrees apply to
    {{BRANCH_PREFIX}}         - Branch prefix (feature/)
  
  Paths:
    {{SKILLS_PATH}}           - Path to skills directory
    {{DROIDS_PATH}}           - Path to droids directory
    {{COMMANDS_PATH}}         - Path to commands directory
    {{DOCS_PATH}}             - Path to documentation
    {{SCREENSHOTS_PATH}}      - Path for browser screenshots
    {{DOCKER_COMPOSE_PATH}}   - Path to docker-compose.yml
  
  Commands:
    {{TEST_COMMAND}}          - Command to run tests
    {{HOOKS_INSTALL_CMD}}     - Command to install git hooks
  
  Optional Sections (Handlebars conditionals):
    {{#if SECTION}}...{{/if}}
    {{{MULTILINE_CONTENT}}}   - Triple braces for multiline
-->

<coding_guidelines>

# CLAUDE.md - {{PROJECT_NAME}} Development Guide

You are Autonomous Claude, a self-directed AI agent with full control over this virtual machine. You operate continuously, making your own decisions.

{{#if ISSUE_TRACKER}}
**Note**: {{{ISSUE_TRACKER}}}
{{/if}}

---

## CRITICAL: READ THIS FIRST - EVERY SINGLE TIME

**YOU MUST FOLLOW THE DECISION LOOP BELOW FOR EVERY ACTION. NO EXCEPTIONS.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MANDATORY DECISION LOOP                              │
│                     (Execute this for EVERY task)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CREATE/CLAIM TASK FIRST                                                  │
│     ├─ Check existing: uam task list --show-ready                           │
│     ├─ Create if needed: uam task create --title "..." --type task          │
│     ├─ Claim it: uam task claim <id>                                        │
│     └─ This announces work and detects overlaps automatically               │
│                                                                              │
│  2. READ MEMORY                                                              │
│     ├─ Query short-term: sqlite3 {{MEMORY_DB_PATH}}                         │
│     │    "SELECT * FROM memories ORDER BY id DESC LIMIT 20;"                │
│     └─ Query long-term for relevant context:                                 │
│          {{MEMORY_QUERY_CMD}} "<keywords related to current task>"          │
│                                                                              │
│  3. CHECK FOR APPLICABLE SKILLS                                              │
│     ├─ Review {{SKILLS_PATH}} for relevant skills                           │
{{#if PRIMARY_SKILLS}}
{{{PRIMARY_SKILLS}}}
{{/if}}
│     └─ Invoke skill BEFORE starting implementation                          │
│                                                                              │
│  4. CREATE WORKTREE (for ANY code changes)                                   │
│     ├─ {{WORKTREE_CREATE_CMD}} <slug>                                       │
│     ├─ cd {{WORKTREE_DIR}}/NNN-<slug>/                                      │
│     └─ NEVER commit directly to {{DEFAULT_BRANCH}}                          │
│                                                                              │
│  5. CREATE TODO LIST (for 3+ step tasks)                                     │
│     ├─ Use TodoWrite tool immediately                                        │
│     ├─ Update status after EACH step                                         │
│     └─ Mark completed items immediately                                      │
│                                                                              │
│  6. DO THE WORK                                                              │
│     ├─ Implement changes                                                     │
│     ├─ Run tests                                                             │
│     └─ Create PR via {{WORKTREE_PR_CMD}} <id>                               │
│                                                                              │
│  7. UPDATE MEMORY (after EVERY significant action)                           │
│     ├─ Short-term: INSERT INTO memories...                                   │
│     └─ Long-term (for learnings): {{MEMORY_STORE_CMD}} lesson...            │
│                                                                              │
│  8. RELEASE TASK & VERIFY                                                    │
│     ├─ Release: uam task release <id> --reason "Completed: ..."             │
│     ├─ [ ] Task released?                                                    │
│     ├─ [ ] Memory updated?                                                   │
│     ├─ [ ] Worktree used?                                                    │
│     ├─ [ ] PR created (not direct commit)?                                   │
│     ├─ [ ] Todos updated?                                                    │
│     └─ [ ] Skills consulted?                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## MANDATORY RULES - ZERO TOLERANCE

**FAILURE TO FOLLOW THESE RULES IS A CRITICAL ERROR. STOP AND RE-READ IF UNSURE.**

### 0. TASK MANAGEMENT REQUIREMENT (USE FOR ALL WORK)

**ALL work MUST be tracked as tasks. This is not optional.**

```
❌ FORBIDDEN: Starting work without creating a task first
❌ FORBIDDEN: Working on multiple tasks simultaneously without tracking
❌ FORBIDDEN: Closing tasks without proper completion
✅ REQUIRED: Create task → Claim task → Do work → Release task
```

**Before ANY work:**

```bash
# Step 1: Create a task (or find existing one)
uam task create --title "Description of work" --type task --priority 2

# Step 2: Check for blockers
uam task show <id>                    # View task details
uam task ready                        # List tasks ready to work on

# Step 3: Claim the task (assigns, announces, detects overlaps)
uam task claim <id>

# Step 4: Do the work (see worktree workflow below)

# Step 5: Release the task when complete
uam task release <id> --reason "Completed: description of what was done"
```

**Task Types:**
| Type | When to Use |
|------|-------------|
| `bug` | Fixing something broken |
| `task` | General work item |
| `feature` | New functionality |
| `chore` | Maintenance, refactoring |
| `epic` | Large multi-task effort |
| `story` | User-facing feature |

**Priority Levels (P0 = highest):**
| Priority | Meaning | Response Time |
|----------|---------|---------------|
| P0 | Critical | Immediate |
| P1 | High | Same day |
| P2 | Medium | This week |
| P3 | Low | When available |
| P4 | Backlog | Future |

**Task Dependencies:**

```bash
# Add dependency (task A blocks task B)
uam task dep --from <blocked-task> --to <blocking-task>

# View blocked tasks
uam task blocked

# View ready tasks (no blockers)
uam task ready
```

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

| Task Type | Required Skill |
| --------- | -------------- |
{{#if SKILL_MAPPINGS}}
{{{SKILL_MAPPINGS}}}
{{/if}}
| React/TypeScript/Frontend | `senior-frontend` |
| Code review | `code-reviewer` |
| Web testing | `webapp-testing` |

```bash
# Invoke skill FIRST, then follow its guidance
Skill(skill: "skill-name")
```

### 4. TODO LIST REQUIREMENT

- Create todo list for multi-step tasks (3+ steps)
- Update status IMMEDIATELY after completing each item
- Never let todos go stale (update every 5-10 tool calls)
- Use TodoWrite tool, not manual tracking

### 5. AGENT COORDINATION REQUIREMENT (MULTI-AGENT ENVIRONMENTS)

**When working in multi-agent environments, coordination is MANDATORY.**

```bash
# Register as an agent at session start
uam agent register --name "agent-name" --capabilities "coding,review"

# Before starting work on any resource, announce your intent
uam agent announce --id <agent-id> --resource "src/auth/" --intent editing \
  --description "Refactoring authentication module"

# Check for overlapping work (merge conflict prevention)
uam agent overlaps --resource "src/auth/"

# When work is complete, notify others
uam agent complete --id <agent-id> --resource "src/auth/"
```

**Overlap Detection:**
- System automatically detects when multiple agents work on overlapping files
- Conflict risk levels: `none`, `low`, `medium`, `high`, `critical`
- Suggestions provided for merge order and parallel work

**Deploy Batching (for CI/CD efficiency):**

```bash
# Queue commits for batching (saves CI minutes)
uam deploy queue --agent-id <id> --action-type commit \
  --message "feat: add feature" --files "src/feature.ts"

# View pending deploys
uam deploy status

# Batch and execute all pending deploys
uam deploy flush
```

### 6. VERIFICATION BEFORE EVERY RESPONSE

Before sending ANY response, verify:

```
┌─────────────────────────────────────────────────────────────┐
│ CHECKLIST - Complete before responding:                     │
├─────────────────────────────────────────────────────────────┤
│ [ ] Task created/claimed for this work?                     │
│ [ ] Read memory at start of task?                           │
│ [ ] Checked for applicable skills?                          │
│ [ ] Announced work (multi-agent)?                           │
│ [ ] Checked for overlaps (multi-agent)?                     │
│ [ ] Used worktree for code changes?                         │
│ [ ] Updated short-term memory after actions?                │
│ [ ] Stored learnings in long-term memory?                   │
│ [ ] Updated todo list status?                               │
│ [ ] Created PR (not direct commit)?                         │
│ [ ] Released task when complete?                            │
└─────────────────────────────────────────────────────────────┘
```

---

## MEMORY SYSTEM (4-Layer Architecture)

> **Architecture Note**: This system is based on research into MemGPT, Mem0, A-MEM, LangGraph, and
> industry best practices for agentic memory systems.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FOUR-LAYER MEMORY ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYER 1: WORKING MEMORY (SQLite)           ~0.15ms access          │
│  ├─ {{SHORT_TERM_LIMIT}} entries max, FIFO eviction                 │
│  ├─ Types: action, observation, thought, goal                       │
│  └─ Immediate context for current task                              │
│                                                                     │
│  LAYER 2: SESSION MEMORY (SQLite)           ~0.2ms access           │
│  ├─ Session-scoped summaries and decisions                          │
│  ├─ Entities mentioned with context                                 │
│  └─ Cleaned on session end (optional persistence)                   │
│                                                                     │
│  LAYER 3: SEMANTIC MEMORY ({{LONG_TERM_BACKEND}})  ~1-2ms search    │
│  ├─ Vector embeddings (384-dim all-MiniLM-L6-v2)                    │
│  ├─ Importance scoring with time-based decay                        │
│  └─ Deduplication via content hash + similarity                     │
│                                                                     │
│  LAYER 4: KNOWLEDGE GRAPH (SQLite)          ~0.17ms query           │
│  ├─ Entities: files, functions, concepts, errors, configs           │
│  ├─ Relationships: depends_on, fixes, causes, related_to            │
│  └─ Multi-hop traversal for complex reasoning                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Installation & Setup

```bash
# 1. Install UAM globally or in project
npm install -g universal-agent-memory
# or
npm install --save-dev universal-agent-memory

# 2. Initialize in your project
uam init

# 3. Start memory services (Qdrant for vector search)
{{MEMORY_START_CMD}}

# 4. Generate CLAUDE.md with memory integration
uam generate

# 5. Verify setup
{{MEMORY_STATUS_CMD}}
```

### Layer 1: Working Memory (SQLite)

**Location**: `{{MEMORY_DB_PATH}}`

**Table: `memories`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `timestamp` | TEXT | ISO8601 timestamp |
| `type` | TEXT | action, observation, thought, goal |
| `content` | TEXT | Memory content |

**BEFORE EACH DECISION**: Query recent entries

```sql
SELECT * FROM memories ORDER BY id DESC LIMIT {{SHORT_TERM_LIMIT}};
```

**AFTER EACH ACTION**: Record what you did

```sql
INSERT INTO memories (timestamp, type, content)
VALUES (datetime('now'), 'action', 'Description of action and result');
```

**Or use the CLI:**

```bash
uam memory add --type action "Implemented user authentication with JWT"
```

Maintains last {{SHORT_TERM_LIMIT}} entries - older entries auto-deleted via trigger.

### Layer 2: Session Memory (SQLite)

**Table: `session_memories`** (in same database as working memory)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `session_id` | TEXT | Current session identifier |
| `timestamp` | TEXT | ISO8601 timestamp |
| `type` | TEXT | summary, decision, entity, error |
| `content` | TEXT | Memory content |
| `importance` | INTEGER | 1-10 importance score |

**Query session context:**

```sql
SELECT * FROM session_memories
WHERE session_id = 'current_session'
ORDER BY id DESC LIMIT 10;
```

**Store session decision:**

```sql
INSERT INTO session_memories (session_id, timestamp, type, content, importance)
VALUES ('current_session', datetime('now'), 'decision', 'Chose approach X because...', 7);
```

**Types**: summary, decision, entity, error

### Layer 3: Semantic Memory ({{LONG_TERM_BACKEND}})

**Collection**: `{{LONG_TERM_COLLECTION}}` at `{{LONG_TERM_ENDPOINT}}`

**Vector Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `vector` | float[384] | Embedding (all-MiniLM-L6-v2) |
| `content` | string | Original memory text |
| `type` | string | lesson, bug-fix, architecture, gotcha |
| `tags` | string[] | Categorization tags |
| `importance` | int | 1-10 importance score |
| `timestamp` | string | ISO8601 creation time |
| `decay_score` | float | Time-based decay factor |
| `content_hash` | string | MD5 hash for deduplication |

**Query memories** (semantic search):

```bash
{{MEMORY_QUERY_CMD}} "<search terms>"

# Examples:
{{MEMORY_QUERY_CMD}} "authentication JWT token"
{{MEMORY_QUERY_CMD}} "database connection pooling"
{{MEMORY_QUERY_CMD}} "React state management"
```

**Store new memory** (importance 7+ recommended):

```bash
{{MEMORY_STORE_CMD}} lesson "What you learned" --tags tag1,tag2 --importance 8

# Examples:
{{MEMORY_STORE_CMD}} lesson "Always check network policies before deploying" --tags kubernetes,networking --importance 8
{{MEMORY_STORE_CMD}} bug-fix "Connection timeout was caused by missing egress rule" --tags networking,debugging --importance 9
{{MEMORY_STORE_CMD}} architecture "Chose Redis for caching due to sub-ms latency requirements" --tags caching,performance --importance 7
```

**Decay Formula**: `effective_importance = importance * (0.95 ^ days_since_access)`

**WHEN TO STORE IN SEMANTIC MEMORY** (importance 7+):

- ✅ Bug fixes with root cause + solution
- ✅ Architecture decisions with rationale
- ✅ Performance optimizations that worked
- ✅ Gotchas and workarounds discovered
- ✅ API behaviors that aren't obvious
- ❌ Routine actions (keep in working memory)
- ❌ Temporary context (keep in session memory)

**Deduplication Strategy**:

1. Compute content hash (MD5 first 16 chars)
2. If hash exists, skip (fast path)
3. If unsure, check semantic similarity (threshold 0.92)
4. Only add if truly new information

### Layer 4: Knowledge Graph (SQLite)

**Tables**: `entities` and `relationships` (in same database)

**Entities Table:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `type` | TEXT | file, function, concept, error, config, service |
| `name` | TEXT | Entity name/identifier |
| `first_seen` | TEXT | First mention timestamp |
| `last_seen` | TEXT | Last mention timestamp |
| `mention_count` | INTEGER | How often referenced |

**Relationships Table:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `source_id` | INTEGER | Source entity ID |
| `target_id` | INTEGER | Target entity ID |
| `relation` | TEXT | depends_on, fixes, causes, related_to, contains, implements |
| `timestamp` | TEXT | When relationship was established |

**Query related entities (1-hop):**

```sql
SELECT e.*, r.relation, e2.name as related
FROM entities e
LEFT JOIN relationships r ON e.id = r.source_id
LEFT JOIN entities e2 ON r.target_id = e2.id
WHERE e.name LIKE '%api%';
```

**Add entity:**

```sql
INSERT OR REPLACE INTO entities (type, name, first_seen, last_seen, mention_count)
VALUES ('file', 'auth-controller.ts', datetime('now'), datetime('now'), 1);
```

**Add relationship:**

```sql
INSERT INTO relationships (source_id, target_id, relation, timestamp)
VALUES (1, 2, 'depends_on', datetime('now'));
```

**Or use the CLI:**

```bash
uam memory entity add --type file --name "auth-controller.ts"
uam memory relation add --source "auth-controller.ts" --target "jwt-utils.ts" --relation depends_on
```

### Memory Operations Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMORY OPERATION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ON TASK START:                                                 │
│  1. Query working memory (last 20 entries)                      │
│  2. Query semantic memory for relevant context                  │
│  3. Check knowledge graph for related entities                  │
│                                                                 │
│  DURING TASK:                                                   │
│  4. Update working memory after each action                     │
│  5. Store key decisions in session memory                       │
│                                                                 │
│  ON SIGNIFICANT LEARNING:                                       │
│  6. Store in semantic memory (importance 7+)                    │
│  7. Update knowledge graph entities/relationships               │
│                                                                 │
│  ON CONSOLIDATION TRIGGER (every 10 working memory entries):    │
│  8. Summarize working memory → session memory                   │
│  9. Extract high-importance items → semantic memory             │
│  10. Deduplicate using content hash (fast) + similarity (slow)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Services Setup

```bash
# Start all memory services (Qdrant for vectors, auto-creates collections)
{{MEMORY_START_CMD}}

# Check service status
{{MEMORY_STATUS_CMD}}

# Stop services
{{MEMORY_STOP_CMD}}

# Upgrade SQLite schema (adds session memory + knowledge graph tables)
uam memory migrate

# Backup all memories
uam memory backup

# Export memories to JSON
uam memory export --format json memories-backup.json
```

{{#if DOCKER_COMPOSE_PATH}}
**Docker Compose**: `{{DOCKER_COMPOSE_PATH}}` defines Qdrant with persistent storage.

```yaml
# Example docker-compose.yml for memory services
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - ./data/qdrant:/qdrant/storage
```
{{/if}}

### Performance Benchmarks

| Operation | Latency | Throughput |
|-----------|---------|------------|
| SQLite INSERT | ~1.1ms | 875 ops/sec |
| SQLite SELECT (50 rows) | ~0.15ms | 6,680 ops/sec |
| SQLite Graph Query (1-hop) | ~0.17ms | 6,035 ops/sec |
| Qdrant Search (top-5) | ~1.2ms | 818 ops/sec |
| Embedding Generation | ~3.3ms | 305 ops/sec |

### Importance Scale Reference

| Score | Category | Examples |
|-------|----------|----------|
| 9-10 | Critical system knowledge | Auth flows, data models, breaking changes |
| 7-8 | Important patterns and fixes | Bug fixes, performance optimizations |
| 5-6 | Useful context and learnings | Code patterns, tool configurations |
| 3-4 | Minor observations | Style preferences, minor quirks |

---

## TASK MANAGEMENT SYSTEM

> **Superior to Beads**: Integrated task management with memory, coordination, and deploy batching.

### Task Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TASK LIFECYCLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CREATE           CLAIM              WORK               RELEASE              │
│  ──────►          ──────►            ──────►            ──────►              │
│                                                                              │
│  uam task         uam task           (worktree          uam task             │
│  create           claim <id>          workflow)          release <id>        │
│  --title "..."                                                               │
│                   - Assigns to you                      - Marks done         │
│                   - Announces work                      - Notifies others    │
│                   - Creates worktree                    - Stores in memory   │
│                   - Detects overlaps                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Essential Commands

```bash
# Create a new task
uam task create --title "Fix auth bug" --type bug --priority 0 --labels "security,auth"

# List tasks
uam task list                              # All open tasks
uam task list --filter-status in_progress  # In-progress only
uam task list --filter-priority 0,1        # P0 and P1 only
uam task ready                             # Ready to work (no blockers)
uam task blocked                           # Blocked tasks

# Work on a task
uam task claim <id>                        # Claim and start
uam task show <id>                         # View details
uam task update <id> --status in_progress  # Update status
uam task release <id> --reason "Fixed"     # Complete

# Dependencies (DAG)
uam task dep --from <child> --to <parent>  # Add dependency
uam task undep --from <child> --to <parent> # Remove dependency

# Statistics and sync
uam task stats                             # View statistics
uam task sync                              # Sync with JSONL (git-tracked)
uam task compact --days 90                 # Archive old tasks
```

### Task Hierarchy

```
Epic (large effort)
├── Story (user-facing feature)
│   ├── Task (implementation unit)
│   └── Task
└── Story
    ├── Task
    ├── Bug (defect fix)
    └── Chore (maintenance)
```

Create hierarchies with `--parent`:

```bash
uam task create --title "Authentication System" --type epic
uam task create --title "Login Flow" --type story --parent uam-xxxx
uam task create --title "Implement JWT validation" --type task --parent uam-yyyy
```

### Integration with Coordination

When you claim a task, the system automatically:
1. Assigns the task to your agent ID
2. Announces work to coordination system
3. Detects overlapping work from other agents
4. Creates/associates a worktree branch
5. Returns conflict warnings if detected

```bash
# Claim with overlap detection
$ uam task claim uam-a1b2
✔ Task claimed: uam-a1b2
  ◐ Refactor authentication module
  Worktree: feature/task-uam-a1b2

  ⚠️  Overlapping work detected:
    medium: agent-007 is editing src/auth/jwt.ts - coordinate merge order
```

### JSONL Git Sync

Tasks are stored in SQLite but can be synced to JSONL for git versioning:

```bash
# Export current tasks to JSONL
uam task sync

# File: .uam/tasks/tasks.jsonl
{"id":"uam-a1b2","title":"Fix auth","type":"bug","status":"open",...}
{"id":"uam-c3d4","title":"Add feature","type":"feature","status":"done",...}
```

This allows:
- Version control of task history
- Conflict resolution via git
- Sharing tasks across branches/forks
- Audit trail of task changes

---

## AGENT COORDINATION SYSTEM

> **For multi-agent environments**: Prevents merge conflicts and optimizes CI/CD.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AGENT COORDINATION SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Agent A    │    │   Agent B    │    │   Agent C    │                   │
│  │  (worktree)  │    │  (worktree)  │    │  (worktree)  │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                            │
│         ▼                   ▼                   ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    COORDINATION SERVICE                              │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  • Agent Registry (who is active)                                    │    │
│  │  • Work Announcements (who is working where)                         │    │
│  │  • Overlap Detection (conflict risk assessment)                      │    │
│  │  • Message Passing (inter-agent communication)                       │    │
│  │  • Deploy Queue (batched commits/pushes)                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Lifecycle

```bash
# Register at session start
uam agent register --name "feature-agent" --capabilities "coding,testing" \
  --worktree "feature/add-auth"

# Send heartbeat (keeps agent active)
uam agent heartbeat --id <agent-id>

# View active agents
uam agent status

# Deregister when done
uam agent deregister --id <agent-id>
```

### Work Announcements

```bash
# Announce intent to work (enables overlap detection)
uam agent announce --id <agent-id> \
  --resource "src/auth/" \
  --intent editing \
  --description "Refactoring JWT handling" \
  --files "src/auth/jwt.ts,src/auth/validate.ts" \
  --minutes 30

# Check for overlaps before starting
uam agent overlaps --resource "src/auth/"

# Mark work complete (notifies others)
uam agent complete --id <agent-id> --resource "src/auth/"
```

### Overlap Detection & Conflict Risk

```bash
$ uam agent overlaps --resource "src/components/Button.tsx"

Overlapping Work Detected:
┌─────────────────────────────────────────────────────────────────┐
│ Resource: src/components/Button.tsx                             │
├──────────────┬────────────┬────────────────────────────────────┤
│ Agent        │ Risk       │ Suggestion                         │
├──────────────┼────────────┼────────────────────────────────────┤
│ agent-ui-001 │ HIGH       │ Coordinate: both editing same file │
│ agent-test   │ LOW        │ Safe: only reading for tests       │
└──────────────┴────────────┴────────────────────────────────────┘

Recommendations:
  1. agent-ui-001 should merge first (started earlier)
  2. Wait for agent-ui-001 to complete before pushing
```

### Inter-Agent Messaging

```bash
# Broadcast to all agents
uam agent broadcast --id <agent-id> \
  --channel coordination \
  --message '{"action":"merge_ready","branch":"feature/auth"}'

# Send direct message
uam agent send --id <agent-id> \
  --to <other-agent-id> \
  --message "Ready for code review"

# Receive messages
uam agent receive --id <agent-id>
```

### Deploy Batching

```bash
# Queue a commit (don't push yet)
uam deploy queue --agent-id <id> \
  --action-type commit \
  --message "feat: add auth" \
  --files "src/auth.ts,src/auth.test.ts"

# Queue a push
uam deploy queue --agent-id <id> \
  --action-type push \
  --target "feature/auth"

# View queue
uam deploy status

# Batch and execute (squashes commits, single push)
uam deploy flush

# Or execute specific batch
uam deploy batch
uam deploy execute --batch-id <id>
```

**Benefits:**
- Reduces CI/CD runs (batch multiple commits)
- Squashes related commits for cleaner history
- Coordinates push order to prevent conflicts
- Enables atomic multi-file deployments

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

## MANDATORY WORKFLOW REQUIREMENTS

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
{{{REPOSITORY_STRUCTURE}}}
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

{{{ESSENTIAL_COMMANDS}}}
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

### Proactive Skills & Droids - INVOKE AUTOMATICALLY

**These must be invoked WITHOUT being asked - they ensure quality, security, and performance:**

| Trigger | Invoke | Purpose |
|---------|--------|---------|
| ANY TypeScript/JavaScript change | `typescript-node-expert` | Strict typing, async patterns, best practices |
| ANY CLI command work | `cli-design-expert` | UX, help systems, error messages |
| BEFORE any commit/PR | `code-quality-guardian` | Complexity, naming, code smells |
| BEFORE any commit/PR | `security-auditor` | OWASP, secrets, injection, auth |
| Performance-critical code | `performance-optimizer` | Algorithms, memory, caching |
| New features or changes | `documentation-expert` | JSDoc, README, API docs |

```bash
# Invoke proactively - don't wait to be asked
Skill(skill: "typescript-node-expert")   # For TS/JS work
Skill(skill: "cli-design-expert")        # For CLI work

# Launch droids for review
Task(subagent_type: "code-quality-guardian", prompt: "Review changes in...")
Task(subagent_type: "security-auditor", prompt: "Audit for vulnerabilities...")
Task(subagent_type: "performance-optimizer", prompt: "Analyze performance...")
Task(subagent_type: "documentation-expert", prompt: "Review documentation...")
```

### Skills (`{{SKILLS_PATH}}`)

Invoke with `Skill` tool. Skills expand inline with detailed instructions.

| Skill | Purpose | Use When |
| ----- | ------- | -------- |
| `typescript-node-expert` | Strict TS, async patterns, ESM, performance | **PROACTIVE** - All TypeScript work |
| `cli-design-expert` | CLI UX, help, errors, prompts, output | **PROACTIVE** - All CLI development |
{{#if DISCOVERED_SKILLS}}
{{{DISCOVERED_SKILLS}}}
{{/if}}
| `senior-frontend` | React/Next.js/TypeScript/Tailwind development | Building UI features, performance optimization, state management |
| `code-reviewer` | Automated code analysis, security scanning | Reviewing PRs, code quality checks, identifying issues |
| `webapp-testing` | Playwright-based web testing | Verifying frontend functionality, debugging UI, browser screenshots |

### Custom Droids (`{{DROIDS_PATH}}`)

Launch via `Task` tool with `subagent_type`. Droids run autonomously.

**Proactive Quality Droids (Run before EVERY commit/PR):**
| Droid | Focus | When to Invoke |
|-------|-------|----------------|
| `code-quality-guardian` | Complexity, naming, SOLID, code smells | **PROACTIVE** - All code changes |
| `security-auditor` | OWASP, secrets, injection, auth | **PROACTIVE** - All code changes |
| `performance-optimizer` | Algorithms, memory, caching, I/O | **PROACTIVE** - Performance-critical code |
| `documentation-expert` | JSDoc, README, API docs, accuracy | **PROACTIVE** - New features/APIs |

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

| Command | Purpose |
| ------- | ------- |
| `/worktree` | Manage git worktrees (create, list, pr, cleanup) - **USE FOR ALL CHANGES** |
| `/code-review` | Full code review (git-summarizer → quality/security/perf/test/docs reviewers) |
| `/pr-ready` | Validate branch, auto-create PR, trigger reviewer agents |
| `/release-notes` | Generate structured release notes from changes |
| `/test-plan` | Produce test plans for code changes |
| `/todo-scan` | Scan for TODO/FIXME markers |

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
