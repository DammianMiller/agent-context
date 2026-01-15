# Terminal-Bench 2.0 UAM Benchmark Instructions

## Quick Start

```bash
# Set API keys
export FACTORY_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"  # For Claude models
export OPENAI_API_KEY="your-key"      # For GPT models

# Run full comparison (all 3 models, with and without UAM)
./scripts/run-terminal-bench.sh

# Run single model
./scripts/run-terminal-bench.sh --model claude-opus-4-5-20251101

# Run only baseline (without UAM)
./scripts/run-terminal-bench.sh --baseline-only

# Run only with UAM
./scripts/run-terminal-bench.sh --uam-only
```

## Expected Runtime

- Terminal-Bench 2.0 has 89 tasks
- Each task can take 5-15 minutes
- Full benchmark per model: ~6-12 hours
- Full comparison (6 runs): ~36-72 hours

## Using Daytona for Parallel Execution

For faster results, use Daytona cloud sandboxes:

```bash
export DAYTONA_API_KEY="your-key"

harbor run \
  -d terminal-bench@2.0 \
  -a claude-code \
  -m anthropic/claude-opus-4-5 \
  --env daytona \
  -n 32  # 32 parallel trials
```

## Results Location

Results are stored in `benchmark-results/` with format:
- `uam_<model>_<timestamp>/` - With UAM memory
- `baseline_<model>_<timestamp>/` - Without UAM
- `TERMINAL_BENCH_COMPARISON_<timestamp>.md` - Summary report

## Manual Harbor Commands

```bash
# Claude Opus 4.5 with UAM context
harbor run -d terminal-bench@2.0 -a claude-code -m anthropic/claude-opus-4-5 -n 4

# GPT 5.2 Codex
harbor run -d terminal-bench@2.0 -a codex -m openai/gpt-5.2-codex -n 4

# GLM 4.7
harbor run -d terminal-bench@2.0 -a claude-code -m glm-4.7 -n 4
```
