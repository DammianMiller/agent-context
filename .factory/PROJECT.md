# UAM Project Configuration

> Universal AI agent memory system - CLAUDE.md templates, memory, worktrees for Claude Code, Factory.AI, VSCode, OpenCode

## Repository Structure

```
universal-agent-memory/
├── src/                           # Source code
│   ├── analyzers/                 # Project analysis (languages, frameworks, structure)
│   ├── benchmarks/                # Terminal-Bench integration
│   ├── bin/                       # CLI entry points
│   ├── cli/                       # CLI command implementations
│   │   ├── init.ts                # uam init - one-command setup
│   │   ├── generate.ts            # uam generate - CLAUDE.md regeneration
│   │   ├── memory.ts              # uam memory - query/store/start/stop
│   │   ├── worktree.ts            # uam worktree - git worktree automation
│   │   └── agent.ts               # uam agent - multi-agent coordination
│   ├── coordination/              # Multi-agent overlap detection
│   ├── generators/                # CLAUDE.md template engine
│   │   └── claude-md.ts           # Handlebars compilation + context building
│   ├── memory/                    # 4-layer memory system
│   │   ├── short-term/            # SQLite L1/L2 (working + session)
│   │   ├── backends/              # L3 providers (Qdrant, GitHub, Qdrant Cloud)
│   │   ├── optimization.ts        # Context compression, hierarchical retrieval
│   │   └── prepopulate.ts         # Auto-populate from docs/git/skills
│   ├── tasks/                     # Task management
│   └── utils/                     # Shared utilities
│       └── merge-claude-md.ts     # Intelligent CLAUDE.md merging
│
├── templates/                     # Handlebars templates
│   └── CLAUDE.template.md         # Universal template v10.10 (36 patterns)
│
├── agents/                        # Agent runtime data
│   ├── data/memory/               # Persistent memory databases
│   │   ├── short_term.db          # SQLite: memories, session_memories, entities, relationships
│   │   └── long_term_prepopulated.json
│   └── docker-compose.yml         # Qdrant vector database
│
├── .factory/                      # Factory AI configuration
│   ├── droids/                    # Custom AI agents (8 specialized droids)
│   ├── skills/                    # Reusable skills
│   ├── commands/                  # CLI commands
│   └── PROJECT.md                 # This file (project-specific content)
│
├── test/                          # Test suites (vitest)
├── docs/                          # Documentation
└── .beads/                        # Beads issue tracking
```

## Quick Start

```bash
# Install globally
npm install -g universal-agent-memory

# Initialize any project (30 seconds)
cd your-project && uam init

# That's it. Your AI now has:
# - Persistent memory across sessions
# - 36 battle-tested agent patterns  
# - Safe git workflow (worktrees)
# - Multi-agent coordination
```

## Memory System - Live Statistics

Current project memory state:

| Layer | Table | Count | Purpose |
|-------|-------|-------|---------|
| L1 Working | `memories` | 70 | Recent actions/observations (50 max, auto-pruned) |
| L2 Session | `session_memories` | 108 | Session-specific decisions (importance 1-10) |
| L4 Knowledge | `entities` | 162 | Discovered entities (files, functions, concepts) |
| L4 Knowledge | `relationships` | 161 | Entity relationships (depends_on, calls, etc.) |

**Memory Type Breakdown:**
- Observations: 59 (84%) - What the agent noticed
- Actions: 11 (16%) - What the agent did

### Memory Commands
```bash
# Query memory before starting work
uam memory query "auth security"

# Store learnings after completing work  
uam memory store "CSRF fix: always validate origin header" --importance 8

# Start semantic search (requires Docker)
uam memory start

# Check memory health
uam memory status
```

## Pattern Router - The Secret Sauce

UAM includes **36 battle-tested patterns** discovered through Terminal-Bench 2.0 analysis. The Pattern Router auto-selects which patterns apply to each task.

### How It Works

Before ANY work, the agent prints:
```
=== PATTERN ROUTER ===
Task: Implement user authentication
Classification: file-creation

SELECTED PATTERNS:
- P12 (OEV): YES - Task creates files (auth.ts, tests)
- P17 (CE): YES - Has constraints ("must use bcrypt")
- P3 (State Protection): YES - Modifies config files

ACTIVE PATTERNS: P3, P12, P17
=== END ROUTER ===
```

### Pattern Categories

| Category | Patterns | Key Insight |
|----------|----------|-------------|
| **Execution** | P1-P8 | Environment isolation, recipe following, CLI over libraries |
| **Output** | P12-P16 | 37% of failures are "file not created" - OEV fixes this |
| **Constraints** | P17 | Extract "exactly/only/single/must be" from task description |
| **Domain** | P21-P26 | Chess (use Stockfish), Git recovery (backup first), Compression (detect impossible) |
| **Verification** | P27-P31 | Cleanup output dirs, smoke test services, round-trip verification |
| **Advanced** | P32-P36 | CLI execution matching, numerical stability, decoder-first analysis |

### Pattern Highlights

**P12 - Output Existence Verification (OEV)**
```bash
# BEFORE completing ANY task:
for f in /expected/output/*; do
  [ -f "$f" ] && echo "✓ $f" || echo "✗ MISSING - CREATE NOW"
done
```
*Fixes 37% of agent failures*

**P17 - Constraint Extraction**
```
Task: "Create single .rs file that outputs Fibonacci"
CONSTRAINTS:
☐ Single file (not multiple)
☐ Extension: .rs  
☐ Output: Fibonacci numbers
```
*Catches missed requirements*

**P20 - Adversarial Thinking**
```
Target: XSS filter bypass
ATTACK VECTORS:
1. Case variation: <ScRiPt>
2. Encoding: &#x3C;script&#x3E;
3. Context breaking: </style><script>
```
*For security bypass tasks*

## Code Field - Better Code Generation

Every code generation task applies the Code Field prompt:

```
Do not write code before stating assumptions.
Do not claim correctness you haven't verified.
Do not handle only the happy path.
Under what conditions does this work?
```

**Measured Results (72 tests):**
- 100% assumption stating (vs 0% baseline)
- 89% bug detection in code review (vs 39% baseline)
- 100% refusal of impossible requests (vs 0% baseline)

## Completion Gates - Mandatory

Three gates must pass before reporting "done":

| Gate | Check | Action if Fails |
|------|-------|-----------------|
| **Gate 1** | Output files exist | CREATE immediately |
| **Gate 2** | Constraints satisfied | FIX violations |
| **Gate 3** | Tests pass | ITERATE until 100% |

```bash
# Gate 1: Verify outputs
ls -la /expected/output.json /expected/result.txt

# Gate 2: Check constraints
# (printed checklist with ☐/☑ for each)

# Gate 3: Run tests, iterate on failures
npm test
```

## Multi-Agent Coordination

Multiple agents can work on the same project without conflicts:

```bash
# Before claiming work
uam agent overlaps --resource "src/auth/*"

# Announce intent
uam agent announce --resource "src/auth/*" --intent editing

# Check active agents
uam agent status
```

**Overlap Response Matrix:**
| Risk | Action |
|------|--------|
| none | Proceed |
| low | Proceed, note merge order |
| medium | Announce, coordinate |
| high | Wait or split by section |
| critical | STOP - request handoff |

## Worktree Workflow

ALL code changes use worktrees:

```bash
# Create isolated branch
uam worktree create fix-auth
# → .worktrees/001-fix-auth/
# → branch: feature/001-fix-auth

# Work in isolation
cd .worktrees/001-fix-auth
# ... make changes ...

# Create PR
uam worktree pr 001

# Cleanup after merge
uam worktree cleanup 001
```

## Built-in Expert Droids

| Droid | Specialization | When Invoked |
|-------|----------------|--------------|
| `code-quality-guardian` | SOLID, complexity, naming | Before every PR |
| `security-auditor` | OWASP, secrets, injection | Before every PR |
| `performance-optimizer` | Algorithms, memory, caching | On request |
| `documentation-expert` | JSDoc, README, accuracy | On request |
| `debug-expert` | Dependency conflicts, runtime errors | Error handling |
| `sysadmin-expert` | Kernel, QEMU, networking | Infrastructure tasks |
| `ml-training-expert` | Model training, MTEB, datasets | ML tasks |
| `terminal-bench-optimizer` | Task routing, time budgets | Benchmarking |

## Development

### Build & Test
```bash
npm run build    # TypeScript compilation
npm test         # Vitest (54 tests)
npm run lint     # ESLint
```

### Regenerate CLAUDE.md
```bash
npm run build && uam generate --force
```

### Template Development
Edit `templates/CLAUDE.template.md` then regenerate. The template uses Handlebars with 50+ context variables from `.uam.json` and project analysis.

## Hot Spots

Files requiring extra attention:
- `templates/CLAUDE.template.md` - Universal patterns (26 changes)
- `src/generators/claude-md.ts` - Context building (11 changes)
- `package.json` - Version bumps (44 changes)

## Known Gotchas

- **Memory DB Path**: Always relative `./agents/data/memory/short_term.db`
- **Qdrant**: Must be running for semantic search (`cd agents && docker-compose up -d`)
- **Template Upgrades**: PROJECT.md separation prevents merge conflicts
- **Worktrees**: Never commit directly to `main`
- **Pattern Router**: Must print analysis block before starting work
