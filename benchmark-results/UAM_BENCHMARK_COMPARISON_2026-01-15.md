# UAM Benchmark Comparison Results

**Date:** 2026-01-15
**Models Tested:** Claude Opus 4.5, GLM 4.7, GPT 5.2 Codex, GPT 5.2
**Tasks:** 8 coding challenges (easy/medium/hard)
**Memory Context Size:** 4,158 chars (when UAM enabled)

---

## Executive Summary

### Phase 1: WITHOUT UAM Memory (Baseline)

| Model | Success Rate | Avg Latency | Fastest | Most Accurate |
|-------|--------------|-------------|---------|---------------|
| Claude Opus 4.5 | 87.5% (7/8) | ~20.6s | | |
| GLM 4.7 | 62.5% (5/8) | ~10.3s | **YES** | |
| GPT 5.2 Codex | 100% (8/8) | ~95.3s | | **YES** |
| GPT 5.2 | 87.5% (7/8) | ~19.8s | | |

### Detailed Task Results (Without UAM)

#### Claude Opus 4.5
| Task | Difficulty | Success | Latency |
|------|------------|---------|---------|
| TypeScript Function Generation | easy | ✓ | 12,752ms |
| Bug Detection and Fix | easy | ✓ | 10,223ms |
| Design Pattern Implementation | medium | ✓ | 13,684ms |
| Code Refactoring | medium | ✓ | 48,033ms |
| Context-Aware Code Generation | medium | ✓ | 26,978ms |
| Algorithm Implementation | hard | ✓ | 19,221ms |
| Multi-Step Code Generation | hard | ✓ | 33,789ms |
| Comprehensive Error Handling | hard | ✗ | - |

#### GLM 4.7
| Task | Difficulty | Success | Latency |
|------|------------|---------|---------|
| TypeScript Function Generation | easy | ✓ | 7,942ms |
| Bug Detection and Fix | easy | ✓ | 7,318ms |
| Design Pattern Implementation | medium | ✓ | 6,959ms |
| Code Refactoring | medium | ✓ | 17,128ms |
| Context-Aware Code Generation | medium | ✓ | 15,660ms |
| Algorithm Implementation | hard | ✗ | - |
| Multi-Step Code Generation | hard | ✗ | - |
| Comprehensive Error Handling | hard | ✗ | - |

#### GPT 5.2 Codex
| Task | Difficulty | Success | Latency |
|------|------------|---------|---------|
| TypeScript Function Generation | easy | ✓ | 39,165ms |
| Bug Detection and Fix | easy | ✓ | 18,399ms |
| Design Pattern Implementation | medium | ✓ | 29,068ms |
| Code Refactoring | medium | ✓ | 241,785ms |
| Context-Aware Code Generation | medium | ✓ | 38,840ms |
| Algorithm Implementation | hard | ✓ | 51,609ms |
| Multi-Step Code Generation | hard | ✓ | 190,106ms |
| Comprehensive Error Handling | hard | ✓ | 153,617ms |

#### GPT 5.2
| Task | Difficulty | Success | Latency |
|------|------------|---------|---------|
| TypeScript Function Generation | easy | ✓ | 12,691ms |
| Bug Detection and Fix | easy | ✓ | 10,448ms |
| Design Pattern Implementation | medium | ✓ | 12,418ms |
| Code Refactoring | medium | ✓ | 26,104ms |
| Context-Aware Code Generation | medium | ✗ | timeout |
| Algorithm Implementation | hard | ✓ | 21,175ms |
| Multi-Step Code Generation | hard | ✓ | 28,063ms |
| Comprehensive Error Handling | hard | ✓ | 27,905ms |

---

## Phase 2: WITH UAM Memory (Partial Results)

UAM Setup completed successfully:
- ✓ Initialized
- ✓ Memory Started
- ✓ Memory Prepopulated (from docs and git)
- ✓ CLAUDE.md Loaded (4,158 chars context)

### Claude Opus 4.5 with UAM (Partial)

| Task | Difficulty | Success | Latency |
|------|------------|---------|---------|
| TypeScript Function Generation | easy | ✓ | 17,240ms |
| Bug Detection and Fix | easy | ✓ | 11,591ms |
| Design Pattern Implementation | medium | ✓ | 17,969ms |
| Code Refactoring | medium | ✓ | 29,545ms |
| Context-Aware Code Generation | medium | ✗ | permissions |
| Algorithm Implementation | hard | - | - |

*Note: Benchmark timed out during Phase 2. Context-aware task failed due to droid auto-level permissions.*

---

## Historical Comparison Data (Previous Full Run)

From previous complete benchmark run (2026-01-15T06:08:50):

### Success Rate Comparison

| Model | Without UAM | With UAM | Improvement |
|-------|-------------|----------|-------------|
| Claude Opus 4.5 | 100.0% | 100.0% | +0.0% |
| GLM 4.7 | 62.5% | 75.0% | **+12.5%** |
| GPT 5.2 Codex | 87.5% | 87.5% | +0.0% |

### Latency Comparison

| Model | Without UAM | With UAM | Change |
|-------|-------------|----------|--------|
| Claude Opus 4.5 | 29,377ms | 36,962ms | +25.8% |
| GLM 4.7 | 17,662ms | 28,974ms | +64.0% |
| GPT 5.2 Codex | 37,424ms | 104,548ms | +179.3% |

---

## Key Findings

### 1. Model Performance Rankings

**By Accuracy (Without UAM):**
1. GPT 5.2 Codex - 100% (perfect on all tasks)
2. Claude Opus 4.5 - 87.5%
3. GPT 5.2 - 87.5%
4. GLM 4.7 - 62.5%

**By Speed (Avg Latency):**
1. GLM 4.7 - ~10.3s (fastest)
2. GPT 5.2 - ~19.8s
3. Claude Opus 4.5 - ~20.6s
4. GPT 5.2 Codex - ~95.3s (slowest but most accurate)

### 2. UAM Memory Impact

- **GLM 4.7 benefited most** from UAM memory (+12.5% success rate improvement)
- Models that already performed well (Claude Opus 4.5, GPT 5.2 Codex) showed no accuracy improvement
- UAM memory adds latency overhead (~25-180% slower) due to context injection

### 3. Difficulty Distribution

| Difficulty | GLM 4.7 | Opus 4.5 | GPT 5.2 | GPT 5.2 Codex |
|------------|---------|----------|---------|---------------|
| Easy (2) | 2/2 ✓ | 2/2 ✓ | 2/2 ✓ | 2/2 ✓ |
| Medium (3) | 3/3 ✓ | 3/3 ✓ | 2/3 | 3/3 ✓ |
| Hard (3) | 0/3 ✗ | 2/3 | 3/3 ✓ | 3/3 ✓ |

**Observation:** GLM 4.7 excels at easy/medium tasks but struggles with hard algorithm and multi-step tasks.

### 4. Cost-Performance Analysis

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| GLM 4.7 | Fastest | Low on hard | Quick prototyping, simple tasks |
| GPT 5.2 | Fast | High | Balanced workloads |
| Claude Opus 4.5 | Medium | High | Complex reasoning |
| GPT 5.2 Codex | Slow | Highest | Critical production code, hard tasks |

---

## Recommendations

1. **For production-critical code:** Use GPT 5.2 Codex (100% accuracy on hard tasks)
2. **For rapid development:** Use GLM 4.7 (5x faster, good for easy/medium)
3. **For balanced workloads:** Use GPT 5.2 or Claude Opus 4.5
4. **UAM Memory:** Most beneficial for models with lower baseline accuracy (GLM 4.7)

---

## Technical Notes

- Benchmark ran via Factory.ai droid CLI with `--auto medium` level
- UAM memory context includes: CLAUDE.md sections, coding standards, gotchas
- Each task validated via pattern matching against expected code elements
- Latency includes full API round-trip + code generation time
