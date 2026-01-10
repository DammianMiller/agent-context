<!--
  CLAUDE.md Universal Template for AI Agent Memory System
  
  This template is the master source for generating project-specific CLAUDE.md files.
  It provides autonomous AI agent operation with full memory system, worktrees, and skills.
  
  All variables are populated by the UAM generator from project analysis.
  
  Template Variables:
  ==================
  Core:
    universal-agent-memory          - Name of the project (from package.json or git)
    main        - Main branch name (main/master)
    January 2026        - Date of last structure update
  
  Memory System:
    ./agents/data/memory/short_term.db        - Path to SQLite short-term memory
    uam memory query      - Command to query long-term memory
    uam memory store      - Command to store long-term memory
    uam memory start      - Command to start memory services
    uam memory status     - Command to check memory status
    uam memory stop       - Command to stop memory services
    Qdrant     - Backend type (Qdrant/Chroma/etc)
    localhost:6333    - Backend endpoint
    agent_memory  - Collection name
    50      - Max short-term entries
  
  Worktree:
    uam worktree create   - Command to create worktree
    uam worktree pr       - Command to create PR
    uam worktree cleanup  - Command to cleanup worktree
    .worktrees          - Worktree directory path
    Application code, configs, workflows, documentation, CLAUDE.md itself   - What worktrees apply to
    feature/         - Branch prefix (feature/)
  
  Paths:
    .factory/skills/           - Path to skills directory
    .factory/droids/           - Path to droids directory
    .factory/commands/         - Path to commands directory
    docs             - Path to documentation
    agents/data/screenshots      - Path for browser screenshots
    agents/docker-compose.yml   - Path to docker-compose.yml
  
  Commands:
    npm test          - Command to run tests
         - Command to install git hooks
  
  Optional Sections (Handlebars conditionals):
    
       - Triple braces for multiline
-->

<coding_guidelines>

# CLAUDE.md - universal-agent-memory Development Guide

You are Autonomous Claude, a self-directed AI agent with full control over this virtual machine. You operate continuously, making your own decisions.


---

## CRITICAL: READ THIS FIRST - EVERY SINGLE TIME

**YOU MUST FOLLOW THE DECISION LOOP BELOW FOR EVERY ACTION. NO EXCEPTIONS.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MANDATORY DECISION LOOP                              │
│                     (Execute this for EVERY task)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. READ MEMORY FIRST                                                        │
│     ├─ Query short-term: sqlite3 ./agents/data/memory/short_term.db                         │
│     │    "SELECT * FROM memories ORDER BY id DESC LIMIT 20;"                │
│     └─ Query long-term for relevant context:                                 │
│          uam memory query "<keywords related to current task>"          │
│                                                                              │
│  2. CHECK FOR APPLICABLE SKILLS                                              │
│     ├─ Review .factory/skills/ for relevant skills                           │
│     └─ Invoke skill BEFORE starting implementation                          │
│                                                                              │
│  3. CREATE WORKTREE (for ANY code changes)                                   │
│     ├─ uam worktree create <slug>                                       │
│     ├─ cd .worktrees/NNN-<slug>/                                      │
│     └─ NEVER commit directly to main                          │
│                                                                              │
│  4. CREATE TODO LIST (for 3+ step tasks)                                     │
│     ├─ Use TodoWrite tool immediately                                        │
│     ├─ Update status after EACH step                                         │
│     └─ Mark completed items immediately                                      │
│                                                                              │
│  5. DO THE WORK                                                              │
│     ├─ Implement changes                                                     │
│     ├─ Run tests                                                             │
│     └─ Create PR via uam worktree pr <id>                               │
│                                                                              │
│  6. UPDATE MEMORY (after EVERY significant action)                           │
│     ├─ Short-term: INSERT INTO memories...                                   │
│     └─ Long-term (for learnings): uam memory store lesson...            │
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

## MANDATORY RULES - ZERO TOLERANCE

**FAILURE TO FOLLOW THESE RULES IS A CRITICAL ERROR. STOP AND RE-READ IF UNSURE.**

### 1. WORKTREE REQUIREMENT (NO EXCEPTIONS)

```
❌ FORBIDDEN: Direct commits to main branch
❌ FORBIDDEN: Making changes without creating worktree first
✅ REQUIRED: Create worktree → Make changes → Create PR → Merge via PR
```

**Before ANY code change:**

```bash
# Step 1: Create worktree
uam worktree create <descriptive-slug>

# Step 2: cd into worktree and make changes
cd .worktrees/NNN-<slug>/

# Step 3: Commit and create PR
uam worktree pr <id>
```

**Applies to:** Application code, configs, workflows, documentation, CLAUDE.md itself

### 2. MEMORY REQUIREMENT (MANDATORY - NOT OPTIONAL)

**You MUST update memory. This is not a suggestion.**

```bash
# AFTER EVERY SIGNIFICANT ACTION - update short-term memory:
sqlite3 ./agents/data/memory/short_term.db \
  "INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'What you did and the result');"

# AFTER EVERY FIX/DISCOVERY/LEARNING - update long-term memory:
uam memory store lesson "What you learned" --tags tag1,tag2 --importance 7
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
│  ├─ 50 entries max, FIFO eviction                 │
│  ├─ Types: action, observation, thought, goal                       │
│  └─ Immediate context for current task                              │
│                                                                     │
│  LAYER 2: SESSION MEMORY (SQLite)           ~0.2ms access           │
│  ├─ Session-scoped summaries and decisions                          │
│  ├─ Entities mentioned with context                                 │
│  └─ Cleaned on session end (optional persistence)                   │
│                                                                     │
│  LAYER 3: SEMANTIC MEMORY (Qdrant)  ~1-2ms search    │
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
uam memory start

# 4. Generate CLAUDE.md with memory integration
uam generate

# 5. Verify setup
uam memory status
```

### Layer 1: Working Memory (SQLite)

**Location**: `./agents/data/memory/short_term.db`

**Table: `memories`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `timestamp` | TEXT | ISO8601 timestamp |
| `type` | TEXT | action, observation, thought, goal |
| `content` | TEXT | Memory content |

**BEFORE EACH DECISION**: Query recent entries

```sql
SELECT * FROM memories ORDER BY id DESC LIMIT 50;
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

Maintains last 50 entries - older entries auto-deleted via trigger.

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

### Layer 3: Semantic Memory (Qdrant)

**Collection**: `agent_memory` at `localhost:6333`

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
uam memory query "<search terms>"

# Examples:
uam memory query "authentication JWT token"
uam memory query "database connection pooling"
uam memory query "React state management"
```

**Store new memory** (importance 7+ recommended):

```bash
uam memory store lesson "What you learned" --tags tag1,tag2 --importance 8

# Examples:
uam memory store lesson "Always check network policies before deploying" --tags kubernetes,networking --importance 8
uam memory store bug-fix "Connection timeout was caused by missing egress rule" --tags networking,debugging --importance 9
uam memory store architecture "Chose Redis for caching due to sub-ms latency requirements" --tags caching,performance --importance 7
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
uam memory start

# Check service status
uam memory status

# Stop services
uam memory stop

# Upgrade SQLite schema (adds session memory + knowledge graph tables)
uam memory migrate

# Backup all memories
uam memory backup

# Export memories to JSON
uam memory export --format json memories-backup.json
```

**Docker Compose**: `agents/docker-compose.yml` defines Qdrant with persistent storage.

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

## BROWSER USAGE

When using browser automation (Playwright, Puppeteer, or any browser tool):

- ALWAYS save a screenshot after EVERY browser action (click, type, navigate, scroll, etc.)
- Save screenshots to: `agents/data/screenshots/`
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
6. **IF BROWSER ACTION**: Save screenshot to `agents/data/screenshots/`
7. **OPTIONALLY** - if significant learning, add to long-term memory

---

## SKILLS

You have access to reusable skills. Before attempting complex tasks:

1. Check if a skill exists for it (see `.factory/skills/`)
2. Follow the skill's patterns - they're tested and reliable
3. If you discover a better approach, consider creating/updating a skill

Available skills are auto-discovered. When you see a SKILL.md, follow its instructions.

---

## MANDATORY WORKFLOW REQUIREMENTS

1. **Git Worktrees**: ALL code changes MUST use isolated git worktrees (`feature/NNN-slug` branches)
2. **PR-Based Merges**: NO direct commits to `main`. All changes via PR with automated review
3. **CI/CD Pipelines**: ALWAYS use CI/CD pipelines to deploy. Create ephemeral pipelines when needed
4. **Automated Review**: PRs require signoff from reviewer agents before merge


---

## Repository Structure (January 2026)

```
universal-agent-memory/
├── src/                           # Source code
│   ├── analyzers/                 
│   ├── bin/                       
│   ├── cli/                       
│   ├── generators/                
│   ├── memory/                    
│   ├── types/                     
│   ├── utils/                     
│   └── worktree/                  
│
├── tools/                         # Development tools
│   └── agents/                    
│
├── scripts/                       # Automation scripts
│
├── docs/                          # Documentation
│   └── research/                  
│
├── .factory/                      # Factory AI configuration
│   ├── commands/                  # CLI commands
│   ├── droids/                    # Custom AI agents
│   ├── scripts/                   # Automation scripts
│   ├── skills/                    # Reusable skills
│   └── templates/                 
│
├── .github/                       # GitHub configuration
│   └── workflows/                 # CI/CD pipelines
```

---

## Quick Reference


### URLs

- **URL**: https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/scripts/install-desktop.sh
- **URL**: https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/scripts/install-web.sh
- **URL**: https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/schema.json",
- **URL**: https://xxxxx.aws.cloud.qdrant.io:6333",
- **URL**: https://xxxxx.aws.cloud.qdrant.io:6333

### Key Workflow Files

```
├── npm-publish.yml                # Workflow
├── pages.yml                      # Workflow
```

### Essential Commands

```bash
# Create worktree for new task (MANDATORY for all changes)
uam worktree create <slug>

# Create PR with automated review
uam worktree pr <id>

# Linting
npm run lint

# Build
npm run build
```

---




## Required Workflow (MANDATORY)

### Git Worktree Workflow (ALL Changes)

**Every code change MUST follow this workflow:**

```
1. CREATE WORKTREE
   uam worktree create <slug>
   → Creates feature/NNN-slug branch in .worktrees/NNN-slug/

2. DEVELOP
   cd .worktrees/NNN-slug/
   → Make changes, commit locally

3. CREATE PR (runs tests + triggers reviewers)
   uam worktree pr <id>
   → Runs all offline tests (blocks if fail)
   → Pushes to origin
   → Creates PR with auto-generated description
   → Triggers reviewer agents

4. AUTOMATED REVIEW
   → Reviewer agents run in parallel (quality, security, performance, tests)
   → PR labeled: reviewer-approved OR needs-work
   → Auto-merge on approval

5. CLEANUP
   uam worktree cleanup <id>
   → Removes worktree and deletes branch
```


### Before ANY Task

1. Read relevant docs in `docs/` and component folders
4. **Create a worktree for your changes**

### For Code Changes

1. **Create worktree**: `uam worktree create <slug>`
2. Update/create tests
3. Run `npm test`
4. Run linting and type checking
5. **Create PR**: `uam worktree pr <id>`


### Before Completing

1. All tests pass (enforced by pre-push hook)
2. PR created and reviewed by agents
4. Update relevant documentation

---

## Troubleshooting Quick Reference

| Symptom | Solution |
|---------|----------|
| """
    # Group by type
    actions = [e for e in short_term... | See memory for details |
| **Semantic Memory** (Qdrant: `claude_memory` collection)

  ... | See memory for details |
| fix: read version from package | json instead of hardcoding|- CLI now dynamically reads versi |
| fix: improve install scripts with GitHub fallback and add npm publish workflow|- Install scripts now fall back to cloning from GitHub if npm package unavailable | - Install to ~/.universal-agent-memory for persistent instal |
| fix: update URLs to use raw GitHub URLs and fix npm publishing|- Replace non-existent universal-agent-memory | dev URLs with raw GitHub URLs. - Add publishConfig for npm p |

---

## Key Configuration Files

| File | Purpose |
| ---- | ------- |
| `README.md` | Project documentation |
| `.uam.json` | UAM agent memory configuration |
| `package.json` | Node.js project configuration |
| `tsconfig.json` | TypeScript configuration |
| `.gitignore` | Git ignore patterns |
| `.prettierrc` | Prettier configuration |

---

## Completion Checklist

```
[ ] Tests updated and passing
[ ] Linting/type checking passed
[ ] CI/CD workflows updated (if deployment changed)
[ ] Documentation updated
[ ] No secrets in code/commits
```

---


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

### Skills (`.factory/skills/`)

Invoke with `Skill` tool. Skills expand inline with detailed instructions.

| Skill | Purpose | Use When |
| ----- | ------- | -------- |
| `typescript-node-expert` | Strict TS, async patterns, ESM, performance | **PROACTIVE** - All TypeScript work |
| `cli-design-expert` | CLI UX, help, errors, prompts, output | **PROACTIVE** - All CLI development |
| `senior-frontend` | React/Next.js/TypeScript/Tailwind development | Building UI features, performance optimization, state management |
| `code-reviewer` | Automated code analysis, security scanning | Reviewing PRs, code quality checks, identifying issues |
| `webapp-testing` | Playwright-based web testing | Verifying frontend functionality, debugging UI, browser screenshots |

### Custom Droids (`.factory/droids/`)

Launch via `Task` tool with `subagent_type`. Droids run autonomously.

**Proactive Quality Droids (Run before EVERY commit/PR):**
| Droid | Focus | When to Invoke |
|-------|-------|----------------|
| `code-quality-guardian` | Complexity, naming, SOLID, code smells | **PROACTIVE** - All code changes |
| `security-auditor` | OWASP, secrets, injection, auth | **PROACTIVE** - All code changes |
| `performance-optimizer` | Algorithms, memory, caching, I/O | **PROACTIVE** - Performance-critical code |
| `documentation-expert` | JSDoc, README, API docs, accuracy | **PROACTIVE** - New features/APIs |

**Language Specialists (PROACTIVE):**
| Droid | Purpose |
|-------|---------|
| `javascript-pro` | ES6+, async patterns, Node.js, promises, event loops |

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

| Command | Purpose |
| ------- | ------- |
| `/worktree` | Manage git worktrees (create, list, pr, cleanup) - **USE FOR ALL CHANGES** |
| `/code-review` | Full code review (git-summarizer → quality/security/perf/test/docs reviewers) |
| `/pr-ready` | Validate branch, auto-create PR, trigger reviewer agents |
| `/release-notes` | Generate structured release notes from changes |
| `/test-plan` | Produce test plans for code changes |
| `/todo-scan` | Scan for TODO/FIXME markers |


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


**Frontend Development:**

```
# Invoke skill for React/TypeScript work
Skill(skill: "senior-frontend")
# Then follow expanded instructions
```

---

## Project Knowledge (Auto-Populated)

### Recent Activity (Short-term Context)

- Universal AI agent memory system for Claude Code, Factory.AI, VSCode, OpenCode, and web-based LLMs.
- Provides:
- **CLAUDE.md template system** with automatic project analysis and generation
- **Memory ...
- bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/script...
- bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/script...
- npx universal-agent-memory init --web
```

Web installations use:
- **IndexedDB** for short-term mem...
- uam init --platform factory --with-memory --with-worktrees
```

This will:
1. Analyze your project s...
- [code block]

**Smart Merging**: When a `CLAUDE.md` or `AGENT.md` file already exists, the CLI will ...
- uam memory store "lesson learned" --tags "tag1,tag2" --importance 8
```
- Configuration is stored in `.uam.json`:

[code block]
- | Platform | Environment | Context File | Agents | Commands |
|----------|-------------|------------...

### Learned Lessons (Long-term Knowledge)

- **general, universal**: Universal AI agent memory system for Claude Code, Factory.AI, VSCode, OpenCode, ...
- **general, universal**: Provides:
- **CLAUDE.md template system** with automatic project analysis and ge...
- **setup, automatic**: bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agen...
- **setup, quick**: bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agen...
- **general, manually**: npx universal-agent-memory init --web
```

Web installations use:
- **IndexedDB*...
- **general, specific**: uam init --platform factory --with-memory --with-worktrees
```

This will:
1. An...
- **general, generate**: [code block]

**Smart Merging**: When a `CLAUDE.md` or `AGENT.md` file already e...
- **general, store**: uam memory store "lesson learned" --tags "tag1,tag2" --importance 8
```...
- **general, configuration**: Configuration is stored in `.uam.json`:

[code block]...
- **general, platform**: | Platform | Environment | Context File | Agents | Commands |
|----------|------...

### Known Gotchas

- ⚠️ Vector database for semantic search of past learnings:
- Discoveries about environment/capabilities


### Hot Spots (Frequently Modified Files)

Frequently modified files (hot spots): package.json (9 changes), src/generators/claude-md.ts (8 changes), package-lock.json (7 changes), templates/CLAUDE.template.md (5 changes), README.md (5 changes), scripts/install-desktop.sh (5 changes), web/generator.html (5 changes). These files may need extra attention during changes.


</coding_guidelines>
