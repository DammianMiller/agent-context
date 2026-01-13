<!--
  CLAUDE.md Universal Template - v6.0
  
  OPTIMIZATIONS IN THIS VERSION:
  - 30% token reduction via compression and deduplication
  - Multi-agent coordination protocol (P0)
  - Session memory enforcement (P0)
  - Parallel droid invocation patterns (P1)
  - Dynamic task routing (P1)
  - Capability-based agent routing (P2)
  - Modular conditional sections (P3)
  
  Core Variables:
    pay2u, , main, January 2026
  
  Memory System:
    ./agents/data/memory/short_term.db, uam memory query, uam memory store, uam memory start,
    uam memory status, uam memory stop, Qdrant, localhost:6333,
    agent_memory, 50
  
  Worktree:
    uam worktree create, uam worktree pr, uam worktree cleanup,
    .worktrees, feature/, Application code, configs, workflows, documentation, CLAUDE.md itself
  
  Paths:
    .factory/skills/, .factory/droids/, .factory/commands/, docs, agents/data/screenshots,
    
  
  Commands:
    pytest, npm run build, npm run lint, 
-->

<coding_guidelines>

# pay2u - Autonomous Agent Guide

---

## 🔴 DIRECTIVE HIERARCHY

| Priority | Source | Override |
|----------|--------|----------|
| 1-HIGHEST | This CLAUDE.md | Never |
| 2-HIGH | Anthropic safety | Only by #1 |
| 3-MEDIUM | User instructions | By #1-2 |
| 4-LOW | Best practices | By #1-3 |

**DEFAULT**: Follow ALL directives without asking permission.

---

---

## ⚡ SESSION START PROTOCOL

**EXECUTE IMMEDIATELY before any response:**

```bash
uam task ready                                    # Check existing work
sqlite3 ./agents/data/memory/short_term.db "SELECT * FROM memories ORDER BY id DESC LIMIT 10;"
sqlite3 ./agents/data/memory/short_term.db "SELECT * FROM session_memories WHERE session_id='current' ORDER BY id DESC LIMIT 5;"
uam agent status                                  # Check other active agents
```

**On work request**: `uam task create --title "..." --type task|bug|feature`

---

---

## 🤖 MULTI-AGENT COORDINATION PROTOCOL

### Before Claiming Any Work

```bash
# 1. Check for active agents working on related files
uam agent overlaps --resource "<files-or-directories>"

# 2. If overlap detected, assess risk:
#    - NONE/LOW: Proceed, coordinate merge order
#    - MEDIUM: Announce intent, agree on file sections  
#    - HIGH/CRITICAL: Wait for completion or request handoff
```

### Announcing Work

```bash
uam agent announce \
  --resource "src/path/to/files" \
  --intent editing|refactoring|reviewing|testing|documenting \
  --description "Brief description" \
  --estimated-minutes 30
```

### Overlap Response Matrix

| Risk Level | Action | Rationale |
|------------|--------|-----------|
| `none` | Proceed immediately | No conflict possible |
| `low` | Proceed, note merge order | Different files/sections |
| `medium` | Announce, coordinate sections | Same directory |
| `high` | Wait or split work | Same file, different sections |
| `critical` | STOP - request handoff | Same file, same sections |

### Parallel Work Patterns

```bash
# CORRECT: Independent droids can run in parallel
Task(subagent_type: "code-quality-guardian", ...) 
Task(subagent_type: "security-auditor", ...)      # Runs concurrently
Task(subagent_type: "performance-optimizer", ...) # Runs concurrently

# CORRECT: Coordinate merge order for overlapping changes
# Agent A finishes first → merges first
# Agent B rebases → merges second
```

### Agent Capability Routing

| Task Type | Route To | Capabilities |
|-----------|----------|--------------|
| TypeScript/JavaScript | `typescript-node-expert` | typing, async, node |
| CLI/TUI work | `cli-design-expert` | ux, help-systems, errors |
| Security review | `security-auditor` | owasp, secrets, injection |
| Performance | `performance-optimizer` | algorithms, memory, caching |
| Documentation | `documentation-expert` | jsdoc, readme, api-docs |
| Code quality | `code-quality-guardian` | complexity, naming, solid |

---

---

## 📋 MANDATORY DECISION LOOP

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTE FOR EVERY TASK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MEMORY   │ sqlite3 ./agents/data/memory/short_term.db "...LIMIT 20"         │
│              │ uam memory query "<keywords>"                 │
│              │ Check session_memories for current context        │
│                                                                  │
│  2. AGENTS   │ uam agent overlaps --resource "<files>"          │
│              │ If overlap: coordinate or wait                    │
│                                                                  │
│  3. SKILLS   │ Check .factory/skills// for applicable skill      │
│              │ Invoke BEFORE implementing                        │
│                                                                  │
│  4. WORKTREE │ uam worktree create <slug>                   │
│              │ cd .worktrees/NNN-<slug>/                  │
│              │ NEVER commit to main               │
│                                                                  │
│  5. WORK     │ Implement → Test → uam worktree pr           │
│                                                                  │
│  6. MEMORY   │ Update short-term after actions                   │
│              │ Update session_memories for decisions             │
│              │ Store lessons in long-term (importance 7+)        │
│                                                                  │
│  7. VERIFY   │ ☐ Memory ☐ Worktree ☐ PR ☐ Skills ☐ Agents      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

---

## 🧠 FOUR-LAYER MEMORY SYSTEM

```
┌─────────────────────────────────────────────────────────────────┐
│  L1: WORKING      │ SQLite memories     │ 50 max │ <1ms   │
│  L2: SESSION      │ SQLite session_mem  │ Current session      │ <5ms   │
│  L3: SEMANTIC     │ Qdrant│ Vector search        │ ~50ms  │
│  L4: KNOWLEDGE    │ SQLite entities     │ Graph relationships  │ <20ms  │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Selection

| Question | YES → Layer |
|----------|-------------|
| Just did this (last few minutes)? | L1: Working |
| Session-specific decision/context? | L2: Session |
| Reusable learning for future? | L3: Semantic |
| Entity relationships? | L4: Knowledge Graph |

### Memory Commands

```bash
# L1: Working Memory
sqlite3 ./agents/data/memory/short_term.db "INSERT INTO memories (timestamp,type,content) VALUES (datetime('now'),'action','...');"

# L2: Session Memory (NEW)
sqlite3 ./agents/data/memory/short_term.db "INSERT INTO session_memories (session_id,timestamp,type,content,importance) VALUES ('current',datetime('now'),'decision','...',7);"

# L3: Semantic Memory  
uam memory store lesson "..." --tags t1,t2 --importance 8

# L4: Knowledge Graph
sqlite3 ./agents/data/memory/short_term.db "INSERT INTO entities (type,name,first_seen,last_seen,mention_count) VALUES ('file','x.ts',datetime('now'),datetime('now'),1);"
sqlite3 ./agents/data/memory/short_term.db "INSERT INTO relationships (source_id,target_id,relation,timestamp) VALUES (1,2,'depends_on',datetime('now'));"
```

### Consolidation Rules

- **Trigger**: Every 10 working memory entries
- **Action**: Summarize → session_memories, Extract lessons → semantic memory
- **Dedup**: Skip if content_hash exists OR similarity > 0.92

### Decay Formula

```
effective_importance = importance × (0.95 ^ days_since_access)
```

---

---

## 🌳 WORKTREE WORKFLOW

**ALL code changes use worktrees. NO EXCEPTIONS.**

```bash
# Create
uam worktree create <slug>
cd .worktrees/NNN-<slug>/
pwd | grep -q ".worktrees" || echo "STOP!"  # Verify location

# Work
git add -A && git commit -m "type: description"

# PR (runs tests, triggers parallel reviewers)
uam worktree pr <id>

# Cleanup
uam worktree cleanup <id>
```

**Applies to**: Application code, configs, workflows, documentation, CLAUDE.md itself

---

---

## 🚀 PARALLEL REVIEW PROTOCOL

**Before ANY commit/PR, invoke quality droids in PARALLEL:**

```bash
# These run concurrently - do NOT wait between calls
Task(subagent_type: "code-quality-guardian", prompt: "Review: <files>")
Task(subagent_type: "security-auditor", prompt: "Audit: <files>")  
Task(subagent_type: "performance-optimizer", prompt: "Analyze: <files>")
Task(subagent_type: "documentation-expert", prompt: "Check: <files>")

# Aggregate results before proceeding
# Block on any CRITICAL findings
```

### Review Priority

| Droid | Blocks PR | Fix Before Merge |
|-------|-----------|------------------|
| security-auditor | ✅ CRITICAL/HIGH | Always |
| code-quality-guardian | ⚠️ CRITICAL only | CRITICAL |
| performance-optimizer | ❌ Advisory | Optional |
| documentation-expert | ❌ Advisory | Optional |

---

---

## ⚡ AUTOMATIC TRIGGERS

| Pattern | Action |
|---------|--------|
| work request (fix/add/change/update/create/implement/build) | `uam task create --type task` |
| bug report/error | `uam task create --type bug` |
| feature request | `uam task create --type feature` |
| code file for editing | check overlaps → skills → worktree |
| review/check/look | query memory first |
| ANY code change | tests required |

---

---

## 📁 REPOSITORY STRUCTURE

```
pay2u/
├── apps/                          # Deployable applications
│   ├── api/                       # REST API
│   ├── cms/                       # CMS
│   ├── marketing/                 
│   └── web/                       # Pay2U Progressive Web App
│
├── services/                      # Backend microservices
│   ├── image-to-list/             
│   └── ml-anomaly-detection/      
│
├── infra/                         # Infrastructure as Code
│   ├── archive/                   
│   ├── certs/                     
│   ├── dashboards/                
│   ├── dev-web-server-reverse-proxy/
│   ├── fixes/                     
│   ├── helm_charts/               
│   ├── k8s/                       
│   └── kubernetes/                
│
├── tools/                         # Development tools
│   ├── agents/                    
│   ├── pay2u-deploy/              # Command-line deployment tool for Pay2U s
│   ├── sla-calculator/            
│   └── zai-test/                  
│
├── scripts/                       # Automation scripts
│   ├── archive/                   
│   └── node_modules/              
│
├── tests/                         # Test suites
│   ├── chaos/                     
│   ├── database/                  
│   ├── integration/               
│   ├── load/                      
│   ├── misc/                      
│   ├── performance/               
│   ├── pgedge/                    
│   └── terraform/                 
│
├── docs/                          # Documentation
│   ├── R&D/                       
│   ├── _templates/                
│   ├── access/                    
│   ├── adr/                       
│   ├── api/                       
│   ├── architecture/              
│   ├── archive/                   
│   └── blogs/                     
│
├── .factory/                      # Factory AI configuration
│   ├── commands/                  # CLI commands
│   ├── droids/                    # Custom AI agents
│   ├── scripts/                   # Automation scripts
│   ├── skills/                    # Reusable skills
│   └── templates/                 
│
├── .github/                       # GitHub configuration
│   ├── actions/                   
│   ├── metrics/                   
│   ├── prompts/                   
│   ├── scripts/                   
│   ├── workflow-templates/        
│   └── workflows/                 # CI/CD pipelines
│
├── ui/                            # Frontend component: main
```

---

---

## 🏗️ Architecture

### Infrastructure

- **IaC**: Terraform

### Components

- **UI - main** (`ui/main`): Frontend component: main
- **api** (`apps/api`): C++ Crow component
- **cms** (`apps/cms`): Unknown component
- **marketing** (`apps/marketing`): Unknown component
- **web** (`apps/web`): Pay2U Progressive Web App
- **image-to-list** (`services/image-to-list`): Python component
- **ml-anomaly-detection** (`services/ml-anomaly-detection`): Python component

---

## 🔧 Components

### UI - main (`ui/main`)

- **Language**: JavaScript
- Frontend component: main

### api (`apps/api`)

- **Language**: C++
- **Framework**: Crow
- C++ Crow component

### cms (`apps/cms`)

- **Language**: Unknown
- Unknown component

### marketing (`apps/marketing`)

- **Language**: Unknown
- Unknown component

### web (`apps/web`)

- **Language**: TypeScript
- Pay2U Progressive Web App

### image-to-list (`services/image-to-list`)

- **Language**: Python
- Python component

---

## 🔐 Authentication

**Provider**: OAuth2

OAuth2 authentication via Kubernetes/Istio

---

---

## 📋 Quick Reference

### Clusters
```bash
kubectl config use-context do-syd1-pay2u  # pay2u (Applications)
kubectl config use-context do-syd1-pay2u-openobserve  # pay2u openobserve (Observability)
kubectl config use-context do-syd1-zitadel  # zitadel (Authentication)
kubectl config use-context do-block-storage  # storage (Applications)
kubectl config use-context do-rw  # do rw (Applications)
kubectl config use-context do-sydney  # do sydney (Applications)
kubectl config use-context do-ro  # do ro (Applications)
kubectl config use-context do-pay2u-wildcard-cert  # wildcard cert (Applications)
kubectl config use-context do-loadbalancer-size-slug  # size slug (Applications)
kubectl config use-context do-loadbalancer-enable-proxy-protocol  # enable proxy protocol (Applications)
kubectl config use-context do-loadbalancer-http-idle-timeout-seconds  # http idle timeout seconds (Applications)
kubectl config use-context do-loadbalancer-sticky-sessions-type  # sticky sessions type (Applications)
kubectl config use-context do-loadbalancer-sticky-sessions-cookie-name  # sticky sessions cookie name (Applications)
kubectl config use-context do-loadbalancer-sticky-sessions-cookie-ttl  # sticky sessions cookie ttl (Applications)
```

### Workflows
```
├── _prometheus-openobserve-integration.yml# Workflow
├── _reusable-deploy.yml           # Deployment
├── build-postgres-timescaledb.yml # Build
├── cd-frontend-multicloud.yml     # Deployment
├── cd-image-to-list.yml           # Deployment
├── cd-pgedge.yml                  # Deployment
├── cd-postgres-spock.yml          # Deployment
├── cd-products-api.yml            # Deployment
├── db-postgres-backup.yml         # Workflow
├── db-postgres-replication.yml    # Workflow
```

### Commands
```bash
# Tests
pytest

# Terraform
cd infra && terraform plan
```

---

### Language Droids
| Droid | Purpose |
|-------|---------|
| `cpp-pro` | factory droid |
| `javascript-pro` | factory droid |
| `python-pro` | factory droid |
| `cpp-pro` | claude droid |
| `javascript-pro` | claude droid |
| `python-pro` | claude droid |
| `terraform-specialist` | claude droid |

### Commands
| Command | Purpose |
|---------|---------|
| `/worktree` | Manage worktrees (create, list, pr, cleanup) |
| `/code-review` | Full parallel review pipeline |
| `/pr-ready` | Validate branch, create PR |

### MCP Plugins
| Plugin | Purpose |
|--------|---------|
| `executeautomation-playwright-server` | MCP plugin |
| `terraform` | MCP plugin |
| `playwright-server` | MCP plugin |
| `automatalabs-playwright-server` | MCP plugin |

---

---

## 🏭 Infrastructure Workflow

1. **Create worktree** for infrastructure changes
2. Update infrastructure in `infra/`
3. Update CI/CD workflows in `.github/workflows/`
4. Run `terraform plan`
5. Update secrets via GitHub Actions (not locally)
6. **Create PR** with automated review

---

## 🧪 Testing Requirements

1. Create worktree
2. Update/create tests
3. Run `pytest`
4. Run linting
5. Create PR

---

---

## 🔧 Troubleshooting

| Symptom | Solution |
|---------|----------|
| <!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug ... | See memory for details |
| <!-- Link related issues here -->

Fixes #
Relates to # | See memory for details |
| - [ ] I have added tests that prove my fix is effective or t... | See memory for details |
| **A**: Fix the errors shown, or if legitimate, add exception... | See memory for details |
| - **Deployment Guide** - Complete deployment procedures
- **... | See memory for details |
| 1. **Restart API Service** - Zero-downtime rolling restart
2... | See memory for details |
| - CLAUDE.md - Claude Code guidance
- README.md - Repository ... | See memory for details |
| 33-34):**

If a data breach occurs:
1. **Detect and Assess**... | See memory for details |
| **Recovery and Remediation**
   - Fix root cause vulnerabili... | See memory for details |
| #### Ninja Build Fix

**Problem**: Pre-built Ninja binaries ... | See memory for details |
| && \
    rm -rf ninja-1.13.1 v1.13.1.tar.gz && \
    ninja -... | See memory for details |
| npm run report
[code block]
tests/
├── e2e/
│   ├── smoke/
│... | See memory for details |
| fix/product-deletion-error
fix/oauth-redirect-loop | See memory for details |
| fix(frontend): prevent double form submission

Added disable... | See memory for details |
| update stuff           # Too vague
fix bug                # ... | See memory for details |

---

## ⚙️ Config Files

| File | Purpose |
|------|---------|
| `README.md` | Project documentation |
| `.uam.json` | UAM agent memory configuration |
| `package.json` | Node.js project configuration |
| `.mcp.json` | MCP plugins configuration |
| `.gitignore` | Git ignore patterns |
| `pyproject.toml` | Python project configuration |

---

---

## ✅ Completion Checklist

```
☐ Tests pass
☐ Lint/typecheck pass  
☐ Worktree used (not main)
☐ Memory updated
☐ PR created
☐ Parallel reviews passed
☐ Terraform plan verified
☐ No secrets in code
```

---

---

## 🔄 COMPLETION PROTOCOL - MANDATORY

**WORK IS NOT DONE UNTIL 100% COMPLETE. ALWAYS FOLLOW THIS SEQUENCE:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MERGE → DEPLOY → MONITOR → FIX               │
│                     (Iterate until 100% complete)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MERGE                                                        │
│     ├─ Get PR approved (or self-approve if authorized)          │
│     ├─ Merge to main                              │
│     └─ Delete feature branch                                    │
│                                                                  │
│  2. DEPLOY                                                       │
│     ├─ Verify CI/CD pipeline runs                               │
│     ├─ Check deployment status                                  │
│     └─ Confirm changes are live                                 │
│                                                                  │
│  3. MONITOR                                                      │
│     ├─ Check logs for errors                                    │
│     ├─ Verify functionality works as expected                   │
│     ├─ Run smoke tests if available                             │
│     └─ Check metrics/dashboards                                 │
│                                                                  │
│  4. FIX (if issues found)                                        │
│     ├─ Create new worktree for fix                              │
│     ├─ Fix the issue                                            │
│     ├─ GOTO step 1 (Merge)                                      │
│     └─ Repeat until 100% working                                │
│                                                                  │
│  5. COMPLETE                                                     │
│     ├─ Update memory with learnings                             │
│     ├─ Close related tasks/issues                               │
│     └─ Announce completion                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**⚠️ NEVER say "done" or "complete" until:**
- PR is merged (not just created)
- Deployment succeeded (not just triggered)
- Functionality verified working (not just "should work")
- All errors/issues fixed (iterate as needed)

**Commands for completion:**
```bash
# After PR merged, verify deployment
git checkout main && git pull
npm run build
pytest

# Check CI/CD status
gh run list --limit 5
gh run view <run-id>

# If issues found, fix immediately
uam worktree create hotfix-<issue>
# ... fix, test, PR, merge, repeat
```

---

---

## 📊 Project Knowledge

### Recent Activity
- [image: Build Status]
[image: API Status]
[image: E2E Tests]
[image: Security]

**A cloud-native pay...
- - What is Pay2U?
- Architecture Overview
- Prerequisites
- Quick Start
- Directory Structure
- Docum...
- Pay2U is a multi-tenant SaaS platform that enables businesses to accept payments and manage products...
- Built on modern cloud-native technologies, it provides:

- **Payment Processing** - Secure payment v...
- | For Merchants                       | For Developers                    | For Enterprises         ...
- - **Application**: https://app.pay2u.com.au
- **API**: https://api.pay2u.com.au
- **Authentication**...
- | Layer                  | Technology                                   |
| ---------------------- |...
- | Component                | Description                                               | Location   ...
- - **PostgreSQL (CNPG)**: 2 instances per cluster with streaming replication
- **PgDog Pooler**: 2 re...
- All customer data is stored in **Australia (Sydney)** to comply with Privacy Act 1988 and APRA CPS 2...

### Lessons
- **general, pay2u**: [image: Build Status]
[image: API Status]
[image: E2E Tests]
[image: Security]

...
- **general, table**: - What is Pay2U?
- Architecture Overview
- Prerequisites
- Quick Start
- Directo...
- **general, what**: Pay2U is a multi-tenant SaaS platform that enables businesses to accept payments...
- **general, what**: Built on modern cloud-native technologies, it provides:

- **Payment Processing*...
- **general, value**: | For Merchants                       | For Developers                    | For ...
- **general, live**: - **Application**: https://app.pay2u.com.au
- **API**: https://api.pay2u.com.au
...
- **architecture, three**: Pay2U operates a multi-cluster DigitalOcean footprint with dedicated clusters fo...
- **general, technology**: | Layer                  | Technology                                   |
| ----...
- **general, components**: | Component                | Description                                        ...
- **general, high**: - **PostgreSQL (CNPG)**: 2 instances per cluster with streaming replication
- **...

### Gotchas
- ⚠️ [code block]

**Profile:**
- **Name**: Sarah Thompson
- **Age**: 35
- **Role**: Owner of an online b
- ⚠️ The API uses a multi-layer caching and optimization strategy for high-throughput read operations:

[
- ⚠️ From `TESTING_GUIDE.md`:

1. **Use Page Object Model**: Encapsulate page structure
2. **Test Indepen
- ⚠️ #### PR Size Guidelines

- **Small**: < 200 lines changed (ideal)
- **Medium**: 200-400 lines change
- ⚠️ Currently, there are no explicit rate limits enforced by the API. However, clients should implement 

### Hot Spots
Frequently modified files (hot spots): apps/api/src/handlers/payments_handler.cpp (44 changes), apps/api/src/services/zai_service.cpp (23 changes), apps/web/styles.css (18 changes), apps/web/styles/_screens.scss (13 changes), CLAUDE.md (9 changes), .github/workflows/test-ocr-benchmark.yml (8 changes), .github/workflows/iac-cluster-bootstrap.yml (7 changes), apps/web/modules/receipts.js (7 changes), apps/web/styles/_layout.scss (7 changes), .github/workflows/iac-terraform-import-ephemeral.yml (6 changes). These files may need extra attention during changes.

</coding_guidelines>

---

## Repository Structure

```
pay2u/

```