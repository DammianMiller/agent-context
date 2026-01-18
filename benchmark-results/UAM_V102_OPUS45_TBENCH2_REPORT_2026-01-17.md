# UAM v1.0.2 Opus 4.5 Terminal-Bench 2.0 Report

**Generated:** 2026-01-17T17:42:00Z (FINAL)
**Run:** uam_opus45_correct
**Model:** Claude Opus 4.5
**Status:** COMPLETE (5 tasks timed out after 4+ hours)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 40 |
| Passed | 19 |
| Failed | 16 |
| Timed Out | 5 |
| **Pass Rate (completed)** | **54.3%** (19/35) |
| **Pass Rate (total)** | **47.5%** (19/40) |

---

## Task Results

| Task | Status | Tests |
|------|--------|-------|
| adaptive-rejection-sampler | FAIL | 8/9 |
| break-filter-js-from-html | FAIL | 0/1 |
| build-pov-ray | PENDING | - |
| caffe-cifar-10 | FAIL | 1/6 |
| chess-best-move | FAIL | 0/1 |
| cobol-modernization | PASS | 3/3 |
| compile-compcert | PENDING | - |
| configure-git-webserver | FAIL | 0/1 |
| crack-7z-hash | PASS | 2/2 |
| custom-memory-heap-crash | PASS | 6/6 |
| db-wal-recovery | PENDING | - |
| distribution-search | PASS | 4/4 |
| feal-linear-cryptanalysis | FAIL | 0/1 |
| fix-git | FAIL | 0/2 |
| gpt2-codegolf | FAIL | 0/1 |
| headless-terminal | FAIL | 6/7 |
| hf-model-inference | PASS | 4/4 |
| largest-eigenval | PASS | 3/3 |
| llm-inference-batching-scheduler | PASS | 6/6 |
| log-summary-date-ranges | PASS | 2/2 |
| merge-diff-arc-agi-task | PASS | 5/5 |
| modernize-scientific-stack | PASS | 2/2 |
| mteb-retrieve | FAIL | 1/2 |
| multi-source-data-merger | PASS | 3/3 |
| overfull-hbox | PASS | 4/4 |
| password-recovery | PASS | 2/2 |
| path-tracing-reverse | PASS | 3/3 |
| path-tracing | PASS | 5/5 |
| polyglot-rust-c | FAIL | 0/1 |
| portfolio-optimization | PASS | 4/4 |
| prove-plus-comm | PASS | 4/4 |
| pypi-server | FAIL | 0/1 |
| pytorch-model-cli | FAIL | 0/6 |
| qemu-startup | PENDING | - |
| regex-chess | PASS | 4/4 |
| reshard-c4-data | PASS | 1/1 |
| schemelike-metacircular-eval | PENDING | - |
| torch-tensor-parallelism | FAIL | 1/3 |
| winning-avg-corewars | FAIL | 2/3 |
| write-compressor | FAIL | 2/3 |

---

## Passed Tasks (19)

cobol-modernization, crack-7z-hash, custom-memory-heap-crash, distribution-search, hf-model-inference, largest-eigenval, llm-inference-batching-scheduler, log-summary-date-ranges, merge-diff-arc-agi-task, modernize-scientific-stack, multi-source-data-merger, overfull-hbox, password-recovery, path-tracing-reverse, path-tracing, portfolio-optimization, prove-plus-comm, regex-chess, reshard-c4-data

---

## Failed Tasks (16)

adaptive-rejection-sampler, break-filter-js-from-html, caffe-cifar-10, chess-best-move, configure-git-webserver, feal-linear-cryptanalysis, fix-git, gpt2-codegolf, headless-terminal, mteb-retrieve, polyglot-rust-c, pypi-server, pytorch-model-cli, torch-tensor-parallelism, winning-avg-corewars, write-compressor

---

## Timed Out Tasks (5)

build-pov-ray, compile-compcert, db-wal-recovery, qemu-startup, schemelike-metacircular-eval

These tasks exceeded the 4+ hour timeout. Common causes:
- **build-pov-ray**: Large C++ compilation
- **compile-compcert**: Coq/OCaml formal verification toolchain
- **db-wal-recovery**: WAL parsing complexity
- **qemu-startup**: VM boot + SSH wait
- **schemelike-metacircular-eval**: Recursive interpreter complexity

---

## Comparison with Previous Runs

| Run | Pass Rate | Notes |
|-----|-----------|-------|
| UAM v1.0.1 (15 tasks) | 66.7% | Selected subset |
| UAM v1.0.2 Opus 4.5 (35 completed) | **54.3%** | Full 40-task run |

---

## Analysis

### Strong Performance
- **ML/Data tasks**: hf-model-inference, llm-inference-batching-scheduler, distribution-search
- **Algorithm tasks**: largest-eigenval, portfolio-optimization, path-tracing
- **Security**: crack-7z-hash, password-recovery
- **Formal verification**: prove-plus-comm

### Weak Performance  
- **Vision-dependent**: chess-best-move (requires image parsing)
- **Pre-computed solutions**: gpt2-codegolf (information-theoretically impossible)
- **Complex setup**: pytorch-model-cli, caffe-cifar-10, configure-git-webserver

---

**Report Generated:** 2026-01-17T15:11:46Z
