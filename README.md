# Agent Context

Universal AI agent context system for Claude Code, Factory.AI, VSCode, and OpenCode.

Provides:
- **CLAUDE.md template system** with automatic project analysis and generation
- **Memory system** (SQLite short-term + Qdrant vector long-term)
- **Git worktree workflow** automation for isolated development
- **Cross-platform compatibility** for all major AI coding assistants

## Installation

```bash
npm install -g @agent-context/cli

# Or use npx
npx @agent-context/cli init
```

## Quick Start

```bash
# Initialize in your project
agent-context init

# Or with specific options
agent-context init --platform factory --with-memory --with-worktrees
```

This will:
1. Analyze your project structure
2. Generate a customized `CLAUDE.md`
3. Set up platform-specific directories (`.factory/`, `.claude/`, etc.)
4. Optionally configure memory system and worktree workflow

## Commands

### Initialize Project

```bash
agent-context init [options]

Options:
  -p, --platform <platforms...>  Target platforms (claude, factory, vscode, opencode, all)
  --with-memory                  Set up memory system
  --with-worktrees               Set up git worktree workflow
  --force                        Overwrite existing configuration
```

### Analyze Project

```bash
agent-context analyze [options]

Options:
  -o, --output <format>  Output format (json, yaml, md)
  --save                 Save analysis to file
```

### Generate Files

```bash
agent-context generate [options]

Options:
  -f, --force         Overwrite without confirmation
  -d, --dry-run       Preview without writing
  -p, --platform      Generate for specific platform only
```

**Smart Merging**: When a `CLAUDE.md` or `AGENT.md` file already exists, the CLI will offer to:
- **Merge** (recommended): Updates standard sections while preserving your custom sections
- **Overwrite**: Replace the entire file with newly generated content
- **Cancel/Skip**: Leave the existing file unchanged

The merge strategy:
- Updates the preamble (project name, description) from new analysis
- Replaces standard sections (Memory System, Browser Usage, Quick Reference, etc.) with updated versions
- Preserves any custom sections you've added
- Appends custom sections at the end of the file

### Memory Management

```bash
# Check status
agent-context memory status

# Start memory services (Qdrant)
agent-context memory start

# Stop services
agent-context memory stop

# Query long-term memory
agent-context memory query "search term" --limit 10

# Store a memory
agent-context memory store "lesson learned" --tags "tag1,tag2" --importance 8
```

### Git Worktrees

```bash
# Create new worktree
agent-context worktree create my-feature

# List worktrees
agent-context worktree list

# Create PR from worktree
agent-context worktree pr 001

# Cleanup after merge
agent-context worktree cleanup 001
```

### Droids/Agents

```bash
# List available droids
agent-context droids list

# Add a new droid
agent-context droids add my-droid --template code-reviewer

# Import from another platform
agent-context droids import ~/.claude/agents/
```

### Platform Sync

```bash
# Sync between platforms
agent-context sync --from claude --to factory
```

## Configuration

Configuration is stored in `.agent-context.json`:

```json
{
  "$schema": "https://agent-context.dev/schema.json",
  "version": "1.0.0",
  "project": {
    "name": "my-project",
    "description": "Project description",
    "defaultBranch": "main"
  },
  "platforms": {
    "claudeCode": { "enabled": true },
    "factory": { "enabled": true },
    "vscode": { "enabled": false },
    "opencode": { "enabled": false }
  },
  "memory": {
    "shortTerm": {
      "enabled": true,
      "path": "./agents/data/memory/short_term.db",
      "maxEntries": 50
    },
    "longTerm": {
      "enabled": true,
      "provider": "qdrant",
      "endpoint": "localhost:6333",
      "collection": "agent_memory"
    }
  },
  "worktrees": {
    "enabled": true,
    "directory": ".worktrees",
    "branchPrefix": "feature/"
  }
}
```

## Platform Support

| Platform | Context File | Agents | Commands |
|----------|-------------|--------|----------|
| Claude Code | `CLAUDE.md` | `.claude/agents/` | `.claude/commands/` |
| Factory.AI | `CLAUDE.md` | `.factory/droids/` | `.factory/commands/` |
| VSCode | `CLAUDE.md` | Extension-based | Tasks |
| OpenCode | `opencode.json` | `.opencode/agent/` | `.opencode/command/` |

## Built-in Droid Templates

- `code-reviewer` - Reviews diffs for correctness and risks
- `security-reviewer` - Finds security issues in code
- `performance-reviewer` - Identifies performance bottlenecks
- `test-writer` - Generates unit tests

## Memory System

### Short-term Memory (SQLite)

Stores the last 50 actions/observations for immediate context. Automatically pruned.

### Long-term Memory (Qdrant)

Vector database for semantic search of past learnings. Stores:
- Discoveries about environment/capabilities
- Successful strategies
- Failed approaches to avoid
- Important facts learned

## Development

```bash
# Clone and install
git clone https://github.com/miller-tech/agent-context.git
cd agent-context
npm install

# Build
npm run build

# Run locally
npm start -- init

# Run tests
npm test
```

## License

MIT
