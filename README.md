# Universal Agent Memory (UAM)

[![npm version](https://img.shields.io/npm/v/universal-agent-memory.svg)](https://www.npmjs.com/package/universal-agent-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<div align="center">

### What if your AI coding assistant could *remember*?

**Every lesson learned. Every bug fixed. Every architectural decision.**

*Not just in one conversation—but forever.*

</div>

---

UAM transforms stateless AI coding assistants into **persistent, coordinated agents** that learn from every interaction and never make the same mistake twice.

```bash
npm install -g universal-agent-memory && cd your-project && uam init
```

**30 seconds to superhuman AI.**

---

## The Problem We Solve

Every time you start a new conversation with your AI assistant:

- It forgets your project's architectural decisions
- It suggests patterns you've already rejected
- It reintroduces bugs you've already fixed
- It doesn't know *why* the code is the way it is

**You're constantly re-teaching the same lessons.**

UAM fixes this by giving AI agents:

| Capability | What It Means |
|------------|---------------|
| **4-Layer Memory** | Recall decisions from months ago |
| **36 Agent Patterns** | Battle-tested patterns from Terminal-Bench 2.0 |
| **Pattern Router** | Auto-selects optimal patterns per task |
| **Multi-Agent Coordination** | Multiple AIs work without conflicts |
| **Worktree Isolation** | No accidental commits to main |
| **Code Field** | 89% bug detection vs 39% baseline |
| **Completion Gates** | 3 mandatory checks before "done" |

---

## See It In Action

```bash
# Agent A starts work
$ uam task create --title "Fix auth vulnerability" --type bug --priority 0
✓ Task created: UAM-042

$ uam worktree create fix-auth
✓ Created worktree: 001-fix-auth
  Branch: feature/001-fix-auth
  Path: .worktrees/001-fix-auth

$ uam agent announce --resource src/auth/* --intent editing
✓ Work announced. No conflicts detected.

# Meanwhile, Agent B checks for conflicts
$ uam agent overlaps --resource src/auth/*
⚠ Agent A (fix-auth) is editing src/auth/*
  Suggestion: Wait for completion or coordinate merge order

# Agent A completes and the lesson is preserved
$ uam memory store "CSRF vulnerability in auth: always validate origin header"
✓ Stored in memory (importance: 8/10)

# Weeks later, ANY agent on this project will know:
$ uam memory query "auth security"
  [2024-03-15] CSRF vulnerability in auth: always validate origin header
  [2024-02-28] Session tokens must be httpOnly and secure
  [2024-01-10] Auth refresh flow: use rotating tokens
```

**The AI never forgets. The team never re-learns.**

---

## Why Developers Love UAM

### "My AI Finally Understands My Codebase"

> *"After 3 months of using UAM, my Claude instance knows more about our architecture than most junior devs. It remembers that we chose Redux over MobX because of time-travel debugging, that our API uses snake_case because of the Python backend, that the auth flow was refactored twice. It's like pair programming with someone who has perfect recall."*

### "Zero Merge Conflicts in Multi-Agent Workflows"

> *"We run 5 agents in parallel on different features. Before UAM, we had merge conflicts daily. Now? Zero. The agents announce their work, check for overlaps, and coordinate merge order automatically. It's like they're a team."*

### "Our CI Bill Dropped 70%"

> *"UAM's deploy batcher changed everything. Instead of 15 CI runs from rapid commits, we get 1-2. Same work, fraction of the cost. The commit squashing alone paid for the setup time."*

---

## Key Features

### 🧠 Endless Context Through Project Memory

**Your AI's context is NOT limited to the conversation.**

Memory persists with the project in SQLite databases that travel with the code:

```
agents/data/memory/
├── short_term.db      # Recent actions, fast lookup
├── session_memories   # Current session decisions
└── long_term.json     # Learnings for semantic search
```

This means:
- Recall decisions from weeks/months ago
- Learn from past mistakes (gotchas never repeated)
- Understand why code is the way it is
- Seamless handoff between sessions

**The AI queries memory before every task** - it never starts from zero.

### 🎯 Intelligent Task Routing

Tasks automatically route to specialized expert droids:

| Task Type | Routed To | Result |
|-----------|-----------|--------|
| TypeScript/JS | `typescript-node-expert` | Proper typing, async patterns |
| Security review | `security-auditor` | OWASP checks, secrets detection |
| Performance | `performance-optimizer` | Algorithm analysis, caching |
| Documentation | `documentation-expert` | Complete, accurate docs |
| Code quality | `code-quality-guardian` | SOLID, complexity checks |

**Missing an expert?** The AI generates one:
```bash
uam droids add rust-expert --capabilities "ownership,lifetimes,async" --triggers "*.rs"
```

### 🎯 Pattern Router - Battle-Tested Intelligence

**36 patterns discovered through Terminal-Bench 2.0 analysis (52.5% pass rate on 40 hard tasks).**

Before ANY task, UAM's Pattern Router auto-selects which patterns apply:

```
=== PATTERN ROUTER ===
Task: Implement user authentication
Classification: file-creation

SELECTED PATTERNS:
- P12 (OEV): YES - Task creates files
- P17 (CE): YES - Has constraints ("must use bcrypt")
- P3 (State Protection): YES - Modifies config files

ACTIVE PATTERNS: P3, P12, P17
=== END ROUTER ===
```

**Key Patterns:**

| Pattern | Name | Impact |
|---------|------|--------|
| **P12** | Output Existence Verification | Fixes 37% of agent failures |
| **P17** | Constraint Extraction | Catches "exactly/only/single" requirements |
| **P3** | Pre-execution State Protection | Backups before destructive actions |
| **P20** | Adversarial Thinking | Attack mindset for security bypass tasks |
| **P21** | Chess Engine Integration | Use Stockfish, don't reason about chess |
| **P23** | Compression Impossibility Detection | Refuse impossible compression tasks |

**Pattern Categories:**
- **Execution (P1-P8)**: Environment isolation, recipe following, CLI over libraries
- **Output (P12-P16)**: File creation verification, format validation
- **Constraints (P17)**: Extract hidden requirements from task descriptions
- **Domain (P21-P26)**: Chess, git recovery, compression, polyglot code
- **Verification (P27-P31)**: Output cleanup, smoke tests, round-trip checks
- **Advanced (P32-P36)**: CLI execution, numerical stability, decoder-first analysis

---

### 🔬 What Works vs What Doesn't (From 40-Task Benchmark)

**Strengths (100% pass rate in category):**

| Category | Why It Works |
|----------|--------------|
| **ML/Data Processing** | Clear data transformation, pandas/numpy operations |
| **Graphics/Rendering** | Path tracing, POV-Ray - well-defined algorithms |
| **Security Tasks** | Hash cracking, password recovery - tools available |
| **Formal Verification** | Coq proofs - step-by-step tactics |

**Weaknesses (Common failure modes):**

| Failure Mode | Fix |
|--------------|-----|
| **"File not created"** (37%) | P12 - Verify outputs exist before completing |
| **Missed constraints** | P17 - Extract "exactly/only/single" keywords |
| **First action destroys state** | P3 - Backup before agent runs |
| **Impossible tasks attempted** | P5/P23 - Detect and refuse immediately |
| **Complex toolchain setup** | Pre-execution hooks for dependencies |

**Near-Misses (High-value improvements):**

| Task | Tests | Fix Needed |
|------|-------|------------|
| adaptive-rejection-sampler | 8/9 (89%) | Numerical edge case |
| headless-terminal | 6/7 (86%) | Service startup timing |
| db-wal-recovery | 5/7 (71%) | WAL parsing edge case |

**Tasks That Will Never Pass (Without External Tools):**
- `gpt2-codegolf` - Requires pre-computed weights (500MB → 5KB impossible)
- `chess-best-move` - Requires vision/image parsing
- `break-filter-js-from-html` - Requires pre-computed XSS bypass patterns

---

### 🚦 Completion Gates - Mandatory Quality Checks

Three gates must pass before the AI reports "done":

| Gate | Check | If Fails |
|------|-------|----------|
| **Gate 1** | All output files exist | CREATE immediately |
| **Gate 2** | All constraints satisfied | FIX violations |
| **Gate 3** | All tests pass | ITERATE until 100% |

```bash
# Gate 1: Verify outputs
ls -la /expected/output.json /expected/result.txt
# If missing → CREATE NOW, don't explain

# Gate 2: Check constraints
# Printed checklist with ☐/☑ for each requirement

# Gate 3: Run tests
npm test  # Iterate on failures until 100%
```

---

### 🔒 Code Field - Better Code Generation

Based on [context-field research](https://github.com/NeoVertex1/context-field), UAM includes a 4-line prompt that dramatically improves code quality:

```
Do not write code before stating assumptions.
Do not claim correctness you haven't verified.
Do not handle only the happy path.
Under what conditions does this work?
```

**Results from 72 tests:**
- 100% assumption stating (vs 0% baseline)
- 89% bug detection in code review (vs 39% baseline)  
- 100% refusal of impossible requests (vs 0% baseline)
- 320% more hidden issues found in debugging

Every code generation task applies Code Field automatically.

### 🌳 Safe Git Workflows

**The AI never commits directly to main.**

All changes use worktrees:

```bash
# AI automatically does this for every change
uam worktree create my-feature
# → Creates .worktrees/001-my-feature/
# → Creates branch feature/001-my-feature
# → Works in isolation

uam worktree pr 001
# → Pushes, creates PR, triggers reviews

uam worktree cleanup 001
# → Removes worktree after merge
```

### ✅ Complete Close-Out Workflow

Work isn't "done" until it's deployed and verified:

```
MERGE → DEPLOY → MONITOR → FIX (repeat until 100%)
```

The AI follows this loop automatically:
1. Get PR approved, merge to main
2. Verify CI/CD runs, check deployment
3. Monitor logs, verify functionality
4. If issues: create hotfix worktree, repeat

**The AI stores learnings after every completed task** for future sessions.

## Installation

### npm (Recommended)

```bash
npm install -g universal-agent-memory
```

### One-Line Installers

```bash
# Desktop (includes Docker for semantic search)
bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/scripts/install-desktop.sh)

# Web browsers (claude.ai, factory.ai)
bash <(curl -fsSL https://raw.githubusercontent.com/DammianMiller/universal-agent-memory/main/scripts/install-web.sh)
```

## Commands

### Essential

| Command | Description |
|---------|-------------|
| `uam init` | Initialize/update UAM (auto-merges, never loses data) |
| `uam generate` | Regenerate CLAUDE.md from project analysis |
| `uam update` | Update templates while preserving customizations |

### Memory

| Command | Description |
|---------|-------------|
| `uam memory status` | Check memory system status |
| `uam memory query <search>` | Search memories |
| `uam memory store <content>` | Store a learning |
| `uam memory start` | Start Qdrant for semantic search |
| `uam memory prepopulate` | Populate from docs and git history |

### Tasks

| Command | Description |
|---------|-------------|
| `uam task create` | Create tracked task |
| `uam task list` | List all tasks |
| `uam task claim <id>` | Claim task (announces to other agents) |
| `uam task release <id>` | Complete task |

### Worktrees

| Command | Description |
|---------|-------------|
| `uam worktree create <name>` | Create isolated branch |
| `uam worktree pr <id>` | Create PR from worktree |
| `uam worktree cleanup <id>` | Remove worktree |

### Droids

| Command | Description |
|---------|-------------|
| `uam droids list` | List available expert droids |
| `uam droids add <name>` | Create new expert droid |

### Coordination

| Command | Description |
|---------|-------------|
| `uam agent status` | View active agents |
| `uam agent overlaps` | Check for file conflicts |
| `uam coord status` | Coordination overview |

## How It Works

1. **Install & Init**: `npm i -g universal-agent-memory && uam init`

2. **CLAUDE.md Generated**: Auto-populated with project structure, commands, droids

3. **AI Reads CLAUDE.md**: Follows the embedded workflows automatically

4. **Every Task**:
   - Query memory for context
   - Check for agent overlaps
   - Route to specialist droids if needed
   - Create worktree for changes
   - Apply Code Field for better code
   - Run tests, create PR
   - Store learnings in memory

5. **Close-Out**: Merge → Deploy → Monitor → Fix loop until 100%

## Memory Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  L1: WORKING      │ Recent actions       │ 50 max  │ SQLite    │
│  L2: SESSION      │ Current session      │ Per run │ SQLite    │
│  L3: SEMANTIC     │ Long-term learnings  │ Qdrant  │ Vectors   │
│  L4: KNOWLEDGE    │ Entity relationships │ SQLite  │ Graph     │
└─────────────────────────────────────────────────────────────────┘
```

**Data is never deleted.** Memory databases persist with the project.

Update with `uam init` or `uam generate` always merges - nothing is lost.

## Configuration

Configuration in `.uam.json`:

```json
{
  "project": {
    "name": "my-project",
    "defaultBranch": "main"
  },
  "memory": {
    "shortTerm": { "enabled": true, "path": "./agents/data/memory/short_term.db" },
    "longTerm": { "enabled": true, "provider": "qdrant" }
  },
  "worktrees": {
    "enabled": true,
    "directory": ".worktrees"
  },
  "template": {
    "sections": {
      "codeField": true
    }
  }
}
```

## Platform Support

| Platform | Context File | Works With |
|----------|--------------|------------|
| Claude Code | `CLAUDE.md` | Desktop app |
| Factory.AI | `CLAUDE.md` | Desktop/web |
| claude.ai | `CLAUDE.md` | Web browser |
| VSCode | `CLAUDE.md` | Extensions |

## Built-in Expert Droids

| Droid | Specialization | When Used |
|-------|----------------|-----------|
| `code-quality-guardian` | SOLID, complexity, naming | Before every PR |
| `security-auditor` | OWASP, secrets, injection | Before every PR |
| `performance-optimizer` | Algorithms, memory, caching | On request |
| `documentation-expert` | JSDoc, README, accuracy | On request |
| `debug-expert` | Dependency conflicts, runtime errors | Error handling |
| `sysadmin-expert` | Kernel, QEMU, networking | Infrastructure tasks |
| `ml-training-expert` | Model training, MTEB, datasets | ML tasks |
| `terminal-bench-optimizer` | Task routing, time budgets | Benchmarking |

## Requirements

- Node.js 18+
- Git
- Docker (optional, for semantic search)

## FAQ

**Q: Do I need to manage memory manually?**
A: No. The AI queries and stores memory automatically per CLAUDE.md instructions.

**Q: What if I don't have Docker?**
A: UAM works without Docker. You lose semantic search but SQLite memory still works.

**Q: Can multiple AI agents work on the same project?**
A: Yes. UAM includes coordination protocols to prevent merge conflicts.

**Q: How do I update without losing my customizations?**
A: Run `uam init` or `uam generate`. Updates always merge - nothing is lost.

**Q: What's Code Field?**
A: A prompt technique that makes AI state assumptions before coding. Based on [context-field research](https://github.com/NeoVertex1/context-field).

---

## Deep Dive Documentation

Want to understand how UAM works under the hood?

| Document | Description |
|----------|-------------|
| [UAM Complete Analysis](docs/UAM_COMPLETE_ANALYSIS.md) | Full system architecture, all features |
| [Terminal-Bench Learnings](docs/TERMINAL_BENCH_LEARNINGS.md) | 8 universal agent patterns discovered |
| [Behavioral Patterns](docs/BEHAVIORAL_PATTERNS.md) | What works vs what doesn't analysis |
| [Failing Tasks Solution Plan](docs/FAILING_TASKS_SOLUTION_PLAN.md) | Detailed fix strategies for each failure mode |
| [Benchmark Results](benchmark-results/) | All Terminal-Bench 2.0 run results |

---

## What's Next?

UAM is actively developed. Recent additions:

- ✅ **36 Agent Patterns** - Battle-tested from Terminal-Bench 2.0
- ✅ **Pattern Router** - Auto-selects optimal patterns per task
- ✅ **Completion Gates** - 3 mandatory checks before "done"
- ✅ **8 Expert Droids** - Specialized agents for common tasks
- ✅ **PROJECT.md Separation** - Seamless template upgrades

Coming soon:

- **Pre-execution Hooks** - Task-specific setup before agent runs
- **Cross-Project Learning** - Share patterns between codebases
- **Visual Memory Dashboard** - See what your AI knows

**Star the repo** to follow updates. **Open an issue** to request features.

---

## Attribution

Code Field prompts based on research from [NeoVertex1/context-field](https://github.com/NeoVertex1/context-field).

## License

MIT

---

<div align="center">

**[Documentation](docs/UAM_COMPLETE_ANALYSIS.md)** · **[Issues](https://github.com/DammianMiller/universal-agent-memory/issues)** · **[npm](https://www.npmjs.com/package/universal-agent-memory)**

*Built for developers who want AI that learns.*

</div>
