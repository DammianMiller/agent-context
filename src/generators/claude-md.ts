import Handlebars from 'handlebars';
import type { ProjectAnalysis, AgentContextConfig } from '../types/index.js';

export async function generateClaudeMd(
  analysis: ProjectAnalysis,
  config: AgentContextConfig
): Promise<string> {
  const template = getTemplate(config);
  const compiled = Handlebars.compile(template);

  const context = buildContext(analysis, config);
  return compiled(context);
}

function buildContext(analysis: ProjectAnalysis, config: AgentContextConfig): Record<string, unknown> {
  const sections = config.template?.sections || {
    memorySystem: true,
    browserUsage: true,
    decisionLoop: true,
    worktreeWorkflow: true,
    troubleshooting: true,
    augmentedCapabilities: true,
  };

  return {
    PROJECT_NAME: analysis.projectName || config.project.name,
    DESCRIPTION: analysis.description || config.project.description || '',
    DEFAULT_BRANCH: analysis.defaultBranch || config.project.defaultBranch || 'main',

    // Issue tracker
    HAS_ISSUE_TRACKER: !!analysis.issueTracker,
    ISSUE_TRACKER_NAME: analysis.issueTracker?.name || 'GitHub Issues',
    ISSUE_TRACKER_URL: analysis.issueTracker?.url || '',

    // Sections
    SHOW_MEMORY_SYSTEM: sections.memorySystem !== false,
    SHOW_BROWSER_USAGE: sections.browserUsage !== false,
    SHOW_DECISION_LOOP: sections.decisionLoop !== false,
    SHOW_WORKTREE_WORKFLOW: sections.worktreeWorkflow !== false && config.worktrees?.enabled,
    SHOW_TROUBLESHOOTING: sections.troubleshooting !== false && analysis.troubleshootingHints.length > 0,
    SHOW_AUGMENTED_CAPABILITIES: sections.augmentedCapabilities !== false,

    // Memory config
    MEMORY_ENABLED: config.memory?.shortTerm?.enabled || config.memory?.longTerm?.enabled,
    SHORT_TERM_PATH: config.memory?.shortTerm?.path || './agents/data/memory/short_term.db',
    SHORT_TERM_MAX_ENTRIES: config.memory?.shortTerm?.maxEntries || 50,
    LONG_TERM_ENDPOINT: config.memory?.longTerm?.endpoint || 'localhost:6333',
    LONG_TERM_COLLECTION: config.memory?.longTerm?.collection || 'agent_memory',

    // Worktree config
    WORKTREE_DIR: config.worktrees?.directory || '.worktrees',
    WORKTREE_PREFIX: config.worktrees?.branchPrefix || 'feature/',

    // URLs
    URLS: analysis.urls,
    HAS_URLS: analysis.urls.length > 0,

    // Clusters
    HAS_CLUSTERS: analysis.clusters?.enabled,
    CLUSTERS: analysis.clusters?.contexts || [],

    // Components
    COMPONENTS: analysis.components,
    HAS_COMPONENTS: analysis.components.length > 0,

    // Commands
    TEST_COMMAND: analysis.commands.test || 'npm test',
    LINT_COMMAND: analysis.commands.lint || 'npm run lint',
    BUILD_COMMAND: analysis.commands.build || 'npm run build',

    // Infrastructure
    INFRA_PATH: analysis.directories.infrastructure[0] || 'infra/',
    HAS_TERRAFORM: analysis.infrastructure.iac === 'Terraform',
    HAS_KUBERNETES: analysis.infrastructure.containerOrchestration === 'Kubernetes',

    // Databases
    DATABASES: analysis.databases,
    HAS_DATABASES: analysis.databases.length > 0,

    // Auth
    HAS_AUTH: !!analysis.authentication,
    AUTH_PROVIDER: analysis.authentication?.provider,
    AUTH_DESCRIPTION: analysis.authentication?.description,

    // CI/CD
    HAS_CICD: !!analysis.ciCd,
    CICD_PLATFORM: analysis.ciCd?.platform,
    WORKFLOWS: analysis.ciCd?.workflows || [],

    // Existing agents
    DROIDS: analysis.existingDroids,
    HAS_DROIDS: analysis.existingDroids.length > 0,
    SKILLS: analysis.existingSkills,
    HAS_SKILLS: analysis.existingSkills.length > 0,
    COMMANDS: analysis.existingCommands,
    HAS_COMMANDS: analysis.existingCommands.length > 0,

    // Troubleshooting
    TROUBLESHOOTING_HINTS: analysis.troubleshootingHints,

    // Key files
    KEY_FILES: analysis.keyFiles,
    HAS_KEY_FILES: analysis.keyFiles.length > 0,

    // Security
    SECURITY_NOTES: analysis.securityNotes,
    HAS_SECURITY_NOTES: analysis.securityNotes.length > 0,

    // Languages/Frameworks
    LANGUAGES: analysis.languages.join(', '),
    FRAMEWORKS: analysis.frameworks.join(', '),
  };
}

function getTemplate(_config: AgentContextConfig): string {
  return `<coding_guidelines>

# CLAUDE.md - {{PROJECT_NAME}} Development Guide

You are an AI assistant helping with the {{PROJECT_NAME}} project.
{{#if DESCRIPTION}}

> {{DESCRIPTION}}
{{/if}}

---

{{#if SHOW_MEMORY_SYSTEM}}
## MEMORY SYSTEM

### Short-term Memory (SQLite: \`{{SHORT_TERM_PATH}}\`)

Table: \`memories\`

- \`id\`: INTEGER PRIMARY KEY
- \`timestamp\`: TEXT (ISO8601)
- \`type\`: TEXT (action|observation|thought|goal)
- \`content\`: TEXT

**BEFORE EACH DECISION**: Query recent entries (last {{SHORT_TERM_MAX_ENTRIES}}) to understand your context

\`\`\`sql
SELECT * FROM memories ORDER BY id DESC LIMIT {{SHORT_TERM_MAX_ENTRIES}};
\`\`\`

**AFTER EACH ACTION**: INSERT a new row describing what you did and the outcome

\`\`\`sql
INSERT INTO memories (timestamp, type, content) VALUES (datetime('now'), 'action', 'Description of action and result');
\`\`\`

### Long-term Memory (Qdrant: \`{{LONG_TERM_ENDPOINT}}\`, collection: \`{{LONG_TERM_COLLECTION}}\`)

**Start services**: \`agent-context memory start\`

**Query memories** (semantic search):
\`\`\`bash
agent-context memory query "search term"
\`\`\`

**Store new memory**:
\`\`\`bash
agent-context memory store "Description" --tags tag1,tag2 --importance 8
\`\`\`

---

{{/if}}
{{#if SHOW_BROWSER_USAGE}}
## BROWSER USAGE

When using browser automation:

- ALWAYS save a screenshot after EVERY browser action
- Save screenshots to: \`agents/data/screenshots/\`
- Filename format: \`{timestamp}_{action}.png\`

---

{{/if}}
{{#if SHOW_DECISION_LOOP}}
## DECISION LOOP

1. **READ** short-term memory (recent context)
2. **QUERY** long-term memory (semantic search for relevant learnings)
3. **THINK** about what to do next
4. **ACT** - execute your decision
5. **RECORD** - write to short-term memory
6. **OPTIONALLY** - if significant learning, add to long-term memory

---

{{/if}}
{{#if SHOW_WORKTREE_WORKFLOW}}
## GIT WORKTREE WORKFLOW (MANDATORY)

**ALL code changes MUST use isolated git worktrees:**

\`\`\`bash
# Create worktree for new task
agent-context worktree create <slug>

# Work in the worktree
cd {{WORKTREE_DIR}}/NNN-slug/

# Create PR when ready
agent-context worktree pr <id>

# Cleanup after merge
agent-context worktree cleanup <id>
\`\`\`

---

{{/if}}
## Quick Reference

{{#if HAS_CLUSTERS}}
### Cluster Contexts

\`\`\`bash
{{#each CLUSTERS}}
kubectl config use-context {{this.context}}  # {{this.name}} ({{this.purpose}})
{{/each}}
\`\`\`

{{/if}}
{{#if HAS_URLS}}
### URLs

{{#each URLS}}
- **{{this.name}}**: {{this.value}}
{{/each}}

{{/if}}
### Essential Commands

\`\`\`bash
# Testing
{{TEST_COMMAND}}

# Linting
{{LINT_COMMAND}}

# Building
{{BUILD_COMMAND}}
{{#if HAS_TERRAFORM}}

# Terraform
cd {{INFRA_PATH}} && terraform plan
{{/if}}
\`\`\`

---

{{#if HAS_COMPONENTS}}
## Core Components

{{#each COMPONENTS}}
### {{this.name}} (\`{{this.path}}\`)

- **Language**: {{this.language}}
{{#if this.framework}}- **Framework**: {{this.framework}}{{/if}}
- {{this.description}}

{{/each}}
---

{{/if}}
{{#if HAS_DATABASES}}
## Databases

{{#each DATABASES}}
- **{{this.type}}**: {{this.purpose}}
{{/each}}

---

{{/if}}
{{#if HAS_AUTH}}
## Authentication

**Provider**: {{AUTH_PROVIDER}}

{{AUTH_DESCRIPTION}}

---

{{/if}}
{{#if HAS_CICD}}
## CI/CD ({{CICD_PLATFORM}})

| Workflow | Purpose |
|----------|---------|
{{#each WORKFLOWS}}
| \`{{this.file}}\` | {{this.purpose}} |
{{/each}}

---

{{/if}}
{{#if SHOW_TROUBLESHOOTING}}
## Troubleshooting

| Symptom | Solution |
|---------|----------|
{{#each TROUBLESHOOTING_HINTS}}
| {{this.symptom}} | {{this.solution}} |
{{/each}}

---

{{/if}}
{{#if SHOW_AUGMENTED_CAPABILITIES}}
## Augmented Agent Capabilities

{{#if HAS_DROIDS}}
### Custom Droids (\`.factory/droids/\`)

{{#each DROIDS}}
- \`{{this}}\`
{{/each}}

{{/if}}
{{#if HAS_SKILLS}}
### Skills (\`.factory/skills/\`)

{{#each SKILLS}}
- \`{{this}}\`
{{/each}}

{{/if}}
{{#if HAS_COMMANDS}}
### Commands (\`.factory/commands/\`)

{{#each COMMANDS}}
- \`/{{this}}\`
{{/each}}

{{/if}}
{{/if}}
## Completion Checklist

\`\`\`
[ ] Tests updated and passing
[ ] Linting/type checking passed
{{#if HAS_TERRAFORM}}
[ ] Terraform plan verified (if infra changed)
{{/if}}
[ ] Documentation updated
[ ] No secrets in code/commits
\`\`\`

---

**Languages**: {{LANGUAGES}}
**Frameworks**: {{FRAMEWORKS}}

</coding_guidelines>
`;
}
