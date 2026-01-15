/**
 * Dynamic Memory Retrieval System for UAM
 * 
 * Retrieves relevant memories based on task content, not static context.
 * Implements semantic search with fallback to keyword matching.
 * 
 * Features:
 * - Adaptive retrieval depth based on query complexity
 * - Context budget management to prevent overflow
 * - Speculative prefetch for common patterns
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { classifyTask, extractTaskEntities, getSuggestedMemoryQueries, type TaskClassification } from './task-classifier.js';
import { ContextBudget } from './context-compressor.js';
import { compressToSemanticUnits } from './semantic-compression.js';

/**
 * Query complexity levels for adaptive retrieval
 */
export type QueryComplexity = 'simple' | 'moderate' | 'complex';

/**
 * Retrieval depth configuration
 */
export interface RetrievalDepthConfig {
  simple: { shortTerm: number; sessionMem: number; longTerm: number; patterns: number };
  moderate: { shortTerm: number; sessionMem: number; longTerm: number; patterns: number };
  complex: { shortTerm: number; sessionMem: number; longTerm: number; patterns: number };
}

const DEFAULT_RETRIEVAL_DEPTHS: RetrievalDepthConfig = {
  simple: { shortTerm: 3, sessionMem: 2, longTerm: 3, patterns: 2 },
  moderate: { shortTerm: 5, sessionMem: 4, longTerm: 5, patterns: 4 },
  complex: { shortTerm: 8, sessionMem: 6, longTerm: 10, patterns: 6 },
};

/**
 * Measure query complexity to determine retrieval depth
 * Based on SimpleMem's adaptive query-aware retrieval
 */
export function measureQueryComplexity(query: string): QueryComplexity {
  let score = 0;
  
  // Length-based scoring (lower thresholds)
  const wordCount = query.split(/\s+/).length;
  if (wordCount > 30) score += 1.5;
  else if (wordCount > 12) score += 0.75;
  else if (wordCount > 6) score += 0.25;
  
  // Technical terms increase complexity
  const techPatterns = [
    /debug|fix|error|exception|bug/i,
    /implement|refactor|optimize|build/i,
    /configure|setup|install|deploy/i,
    /security|vulnerability|cve|auth/i,
    /performance|memory|cpu|latency/i,
    /database|query|migration|schema/i,
    /test|coverage|mock|spec/i,
  ];
  
  for (const pattern of techPatterns) {
    if (pattern.test(query)) score += 0.4;
  }
  
  // Multiple entities/files increase complexity
  const fileMatches = query.match(/[\w./\\-]+\.(ts|js|py|json|yaml|sh|sql)/gi);
  if (fileMatches) {
    score += fileMatches.length * 0.3;
  }
  
  // Multi-step tasks are complex
  if (/and then|after that|followed by|step \d|first.*then|also|additionally/i.test(query)) {
    score += 1;
  }
  
  // Questions about "why" or "how" are moderate
  if (/^(why|how|what caused|explain)/i.test(query)) {
    score += 0.5;
  }
  
  // Multiple actions in one query
  const actionWords = query.match(/\b(fix|implement|configure|debug|create|update|delete|add|remove)\b/gi);
  if (actionWords && actionWords.length > 1) {
    score += actionWords.length * 0.3;
  }
  
  if (score >= 2) return 'complex';
  if (score >= 1) return 'moderate';
  return 'simple';
}

/**
 * Get retrieval limits based on query complexity
 */
export function getRetrievalDepth(
  complexity: QueryComplexity,
  config: RetrievalDepthConfig = DEFAULT_RETRIEVAL_DEPTHS
): { shortTerm: number; sessionMem: number; longTerm: number; patterns: number } {
  return config[complexity];
}

export interface RetrievedMemory {
  content: string;
  type: 'lesson' | 'gotcha' | 'pattern' | 'context' | 'example';
  relevance: number;
  source: string;
}

export interface DynamicMemoryContext {
  classification: TaskClassification;
  relevantMemories: RetrievedMemory[];
  patterns: string[];
  gotchas: string[];
  projectContext: string;
  formattedContext: string;
  queryComplexity: QueryComplexity;
  tokenBudget: { used: number; remaining: number; total: number };
  compressionStats?: { ratio: number; sourceTokens: number; compressedTokens: number };
}

/**
 * Main function to retrieve task-specific memory context
 * Now with adaptive retrieval depth and context budget management
 */
export async function retrieveDynamicMemoryContext(
  taskInstruction: string,
  projectRoot: string = process.cwd(),
  options: {
    maxTokens?: number;
    useSemanticCompression?: boolean;
  } = {}
): Promise<DynamicMemoryContext> {
  const { maxTokens = 4000, useSemanticCompression = true } = options;
  
  // Step 1: Classify the task
  const classification = classifyTask(taskInstruction);
  
  // Step 2: Measure query complexity for adaptive retrieval
  const queryComplexity = measureQueryComplexity(taskInstruction);
  const retrievalDepth = getRetrievalDepth(queryComplexity);
  
  // Step 3: Initialize context budget
  const budget = new ContextBudget(maxTokens);
  
  // Step 4: Extract entities from task
  const entities = extractTaskEntities(taskInstruction);
  
  // Step 5: Get suggested memory queries
  const suggestedQueries = getSuggestedMemoryQueries(classification);
  
  // Step 6: Query all memory sources with adaptive limits
  const memories = await queryAllMemorySources(
    taskInstruction,
    classification,
    entities,
    suggestedQueries,
    projectRoot,
    retrievalDepth
  );
  
  // Step 7: Apply semantic compression if enabled and we have many memories
  let compressionStats: DynamicMemoryContext['compressionStats'];
  let processedMemories = memories;
  
  if (useSemanticCompression && memories.length > 5) {
    const memoryData = memories.map(m => ({
      content: m.content,
      type: m.type,
      importance: Math.round(m.relevance * 10),
    }));
    
    const compressed = compressToSemanticUnits(memoryData);
    compressionStats = {
      ratio: compressed.overallRatio,
      sourceTokens: compressed.totalSourceTokens,
      compressedTokens: compressed.totalCompressedTokens,
    };
    
    // Replace memories with compressed versions if significant savings
    if (compressed.overallRatio > 1.5) {
      processedMemories = compressed.units.flatMap(unit => 
        unit.atomicFacts.map(fact => ({
          content: fact.content,
          type: fact.type === 'gotcha' ? 'gotcha' as const :
                fact.type === 'lesson' ? 'lesson' as const :
                fact.type === 'pattern' ? 'pattern' as const : 'context' as const,
          relevance: fact.actionability,
          source: 'semantic-compression',
        }))
      );
    }
  }
  
  // Step 8: Extract patterns and gotchas
  const patterns = processedMemories
    .filter(m => m.type === 'pattern')
    .map(m => m.content)
    .slice(0, retrievalDepth.patterns);
  
  const gotchas = processedMemories
    .filter(m => m.type === 'gotcha')
    .map(m => m.content)
    .slice(0, retrievalDepth.patterns);
  
  // Step 9: Get project-specific context
  const projectContext = await getProjectContext(classification, projectRoot);
  
  // Step 10: Format context with budget allocation
  const { content: formattedContext } = budget.allocate(
    'main',
    formatContextWithRecencyBias(
      classification,
      processedMemories,
      patterns,
      gotchas,
      projectContext
    )
  );
  
  return {
    classification,
    relevantMemories: processedMemories,
    patterns,
    gotchas,
    projectContext,
    formattedContext,
    queryComplexity,
    tokenBudget: {
      used: budget.usage().used,
      remaining: budget.remaining(),
      total: maxTokens,
    },
    compressionStats,
  };
}

/**
 * Query all memory sources for relevant information
 * Uses adaptive retrieval depth to limit queries based on complexity
 */
async function queryAllMemorySources(
  taskInstruction: string,
  classification: TaskClassification,
  entities: ReturnType<typeof extractTaskEntities>,
  suggestedQueries: string[],
  projectRoot: string,
  depth: { shortTerm: number; sessionMem: number; longTerm: number; patterns: number }
): Promise<RetrievedMemory[]> {
  const memories: RetrievedMemory[] = [];
  
  // Source 1: Short-term SQLite memory (limited by depth)
  const shortTermMemories = await queryShortTermMemory(
    classification,
    entities,
    projectRoot,
    depth.shortTerm
  );
  memories.push(...shortTermMemories);
  
  // Source 2: Session memories (limited by depth)
  const sessionMemories = await querySessionMemory(taskInstruction, projectRoot, depth.sessionMem);
  memories.push(...sessionMemories);
  
  // Source 3: Long-term prepopulated memory (limited by depth)
  const longTermMemories = await queryLongTermMemory(
    suggestedQueries,
    projectRoot,
    depth.longTerm
  );
  memories.push(...longTermMemories);
  
  // Source 4: CLAUDE.md sections relevant to task
  const claudeMdMemories = await queryCLAUDEMd(classification, projectRoot);
  memories.push(...claudeMdMemories);
  
  // Source 5: Category-specific patterns from droids (limited by depth)
  const droidPatterns = getCategoryPatterns(classification, depth.patterns);
  memories.push(...droidPatterns);
  
  // Deduplicate and sort by relevance
  const uniqueMemories = deduplicateMemories(memories);
  const maxTotal = depth.shortTerm + depth.sessionMem + depth.longTerm + depth.patterns;
  return uniqueMemories.sort((a, b) => b.relevance - a.relevance).slice(0, maxTotal);
}

/**
 * Query short-term SQLite memory
 */
async function queryShortTermMemory(
  classification: TaskClassification,
  entities: ReturnType<typeof extractTaskEntities>,
  projectRoot: string,
  limit: number = 5
): Promise<RetrievedMemory[]> {
  const dbPath = join(projectRoot, 'agents/data/memory/short_term.db');
  if (!existsSync(dbPath)) return [];
  
  const memories: RetrievedMemory[] = [];
  const perKeywordLimit = Math.max(1, Math.ceil(limit / 3));
  
  try {
    // Query by category keywords
    for (const keyword of classification.keywords.slice(0, 3)) {
      const result = execSync(
        `sqlite3 "${dbPath}" "SELECT type, content FROM memories WHERE content LIKE '%${keyword}%' ORDER BY id DESC LIMIT ${perKeywordLimit};"`,
        { encoding: 'utf-8', timeout: 5000 }
      ).trim();
      
      if (result) {
        for (const line of result.split('\n')) {
          const [type, content] = line.split('|');
          if (content) {
            memories.push({
              content: content.slice(0, 500),
              type: type === 'lesson' ? 'lesson' : 'context',
              relevance: 0.7,
              source: 'short-term-memory',
            });
          }
        }
      }
    }
    
    // Query by technology mentions
    for (const tech of entities.technologies.slice(0, 2)) {
      const result = execSync(
        `sqlite3 "${dbPath}" "SELECT type, content FROM memories WHERE content LIKE '%${tech}%' ORDER BY id DESC LIMIT 2;"`,
        { encoding: 'utf-8', timeout: 5000 }
      ).trim();
      
      if (result) {
        for (const line of result.split('\n')) {
          const [type, content] = line.split('|');
          if (content) {
            memories.push({
              content: content.slice(0, 500),
              type: type === 'gotcha' ? 'gotcha' : 'context',
              relevance: 0.6,
              source: 'short-term-memory',
            });
          }
        }
      }
    }
  } catch {
    // Ignore query errors
  }
  
  return memories;
}

/**
 * Query session memories for recent decisions
 */
async function querySessionMemory(
  _taskInstruction: string,
  projectRoot: string,
  limit: number = 5
): Promise<RetrievedMemory[]> {
  const dbPath = join(projectRoot, 'agents/data/memory/short_term.db');
  if (!existsSync(dbPath)) return [];
  
  const memories: RetrievedMemory[] = [];
  
  try {
    // Get recent high-importance session memories
    const result = execSync(
      `sqlite3 "${dbPath}" "SELECT type, content FROM session_memories WHERE importance >= 7 ORDER BY id DESC LIMIT ${limit};"`,
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    
    if (result) {
      for (const line of result.split('\n')) {
        const [type, content] = line.split('|');
        if (content) {
          memories.push({
            content: content.slice(0, 500),
            type: type === 'lesson' ? 'lesson' : type === 'decision' ? 'context' : 'pattern',
            relevance: 0.8,
            source: 'session-memory',
          });
        }
      }
    }
  } catch {
    // Ignore query errors
  }
  
  return memories;
}

/**
 * Query long-term prepopulated memory
 */
async function queryLongTermMemory(
  queries: string[],
  projectRoot: string,
  _limit: number = 5
): Promise<RetrievedMemory[]> {
  const memoryPath = join(projectRoot, 'agents/data/memory/long_term_prepopulated.json');
  if (!existsSync(memoryPath)) return [];
  
  const memories: RetrievedMemory[] = [];
  
  try {
    const data = JSON.parse(readFileSync(memoryPath, 'utf-8'));
    const allMemories = data.memories || data.lessons || data || [];
    
    // Simple keyword matching for now (semantic search would be better)
    for (const query of queries.slice(0, 5)) {
      if (memories.length >= _limit) break;
      
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/);
      
      for (const mem of allMemories) {
        if (memories.length >= _limit) break;
        
        const content = (mem.content || mem.text || JSON.stringify(mem)).toLowerCase();
        const matchCount = queryWords.filter(w => content.includes(w)).length;
        
        if (matchCount >= 2) {
          memories.push({
            content: (mem.content || mem.text || JSON.stringify(mem)).slice(0, 500),
            type: mem.type || 'lesson',
            relevance: matchCount / queryWords.length,
            source: 'long-term-memory',
          });
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  
  return memories;
}

/**
 * Query CLAUDE.md for relevant sections
 */
async function queryCLAUDEMd(
  classification: TaskClassification,
  projectRoot: string
): Promise<RetrievedMemory[]> {
  const claudeMdPath = join(projectRoot, 'CLAUDE.md');
  if (!existsSync(claudeMdPath)) return [];
  
  const memories: RetrievedMemory[] = [];
  
  try {
    const content = readFileSync(claudeMdPath, 'utf-8');
    
    // Extract Code Field section (always relevant)
    const codeFieldMatch = content.match(/## .*CODE FIELD.*?(?=\n## |\n---\n|$)/s);
    if (codeFieldMatch) {
      memories.push({
        content: codeFieldMatch[0].slice(0, 800),
        type: 'pattern',
        relevance: 0.9,
        source: 'CLAUDE.md',
      });
    }
    
    // Extract category-specific sections
    const categorySectionMap: Record<string, RegExp[]> = {
      'sysadmin': [/## .*System|Admin|Linux|Network.*?(?=\n## |\n---\n|$)/si],
      'security': [/## .*Security|Auth.*?(?=\n## |\n---\n|$)/si],
      'testing': [/## .*Test.*?(?=\n## |\n---\n|$)/si],
      'coding': [/## .*Coding|Convention|Pattern.*?(?=\n## |\n---\n|$)/si],
    };
    
    const patterns = categorySectionMap[classification.category] || [];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        memories.push({
          content: match[0].slice(0, 600),
          type: 'context',
          relevance: 0.75,
          source: 'CLAUDE.md',
        });
      }
    }
    
    // Extract gotchas/troubleshooting sections
    const gotchasMatch = content.match(/## .*Troubleshoot|Gotcha|Common.*?(?=\n## |\n---\n|$)/si);
    if (gotchasMatch) {
      memories.push({
        content: gotchasMatch[0].slice(0, 500),
        type: 'gotcha',
        relevance: 0.7,
        source: 'CLAUDE.md',
      });
    }
  } catch {
    // Ignore read errors
  }
  
  return memories;
}

/**
 * Get category-specific patterns from droid knowledge
 */
function getCategoryPatterns(classification: TaskClassification, limit: number = 4): RetrievedMemory[] {
  const patterns: RetrievedMemory[] = [];
  
  const categoryPatterns: Record<string, string[]> = {
    'sysadmin': [
      'Use `ip addr` instead of deprecated `ifconfig` for network info',
      'Use `ss -tlnp` instead of `netstat` for listening ports',
      'Always check `journalctl -u <service>` for service logs',
      'Use `make -j$(nproc)` for parallel kernel compilation',
    ],
    'security': [
      'Never log sensitive data (passwords, tokens, keys)',
      'Use parameterized queries to prevent SQL injection',
      'Validate and sanitize all user input',
      'Check for CVE exploits before attempting complex attacks',
    ],
    'ml-training': [
      'Start with smaller models (distilbert vs bert-large) for speed',
      'Use `CUDA_VISIBLE_DEVICES` to select specific GPUs',
      'Cache datasets to avoid repeated downloads',
      'Set `num_train_epochs=3` initially, increase if needed',
    ],
    'debugging': [
      'Use `pip check` to detect dependency conflicts',
      'Use `git reflog` to recover lost commits',
      'Check `conda env export` before modifying environments',
      'Add verbose flags (-v, --debug) to diagnose issues',
    ],
    'coding': [
      'State assumptions before writing code',
      'Handle edge cases explicitly (empty arrays, null values)',
      'Use TypeScript strict mode for better type safety',
      'Include try-catch for operations that can fail',
    ],
    'testing': [
      'Test edge cases: empty input, null, undefined',
      'Use mocks for external dependencies',
      'Aim for high coverage on critical paths',
      'Run tests before committing: `npm test`',
    ],
  };
  
  const relevantPatterns = categoryPatterns[classification.category] || [];
  const patternLimit = Math.max(1, Math.ceil(limit * 0.6));
  for (const pattern of relevantPatterns.slice(0, patternLimit)) {
    patterns.push({
      content: pattern,
      type: 'pattern',
      relevance: 0.85,
      source: 'droid-knowledge',
    });
  }
  
  // Add common gotchas
  const commonGotchas = [
    'Array index: use `i < length`, not `i <= length`',
    'JSON.parse throws on invalid input - wrap in try/catch',
    'Empty array reduce needs initial value',
    'Map.get() returns undefined for missing keys',
  ];
  
  const gotchaLimit = Math.max(1, limit - patternLimit);
  for (const gotcha of commonGotchas.slice(0, gotchaLimit)) {
    patterns.push({
      content: gotcha,
      type: 'gotcha',
      relevance: 0.8,
      source: 'droid-knowledge',
    });
  }
  
  return patterns;
}

/**
 * Get project-specific context
 */
async function getProjectContext(
  classification: TaskClassification,
  projectRoot: string
): Promise<string> {
  const sections: string[] = [];
  
  // Add project structure if relevant
  if (['coding', 'testing', 'debugging'].includes(classification.category)) {
    try {
      const pkgJsonPath = join(projectRoot, 'package.json');
      if (existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
        sections.push(`Project: ${pkg.name} v${pkg.version}`);
        if (pkg.scripts) {
          const scripts = Object.keys(pkg.scripts).slice(0, 5).join(', ');
          sections.push(`Available scripts: ${scripts}`);
        }
      }
    } catch {
      // Ignore
    }
  }
  
  return sections.join('\n');
}

/**
 * Format context with recency bias (critical info at END)
 * Based on Droid's hierarchical prompting strategy
 */
function formatContextWithRecencyBias(
  classification: TaskClassification,
  memories: RetrievedMemory[],
  patterns: string[],
  gotchas: string[],
  projectContext: string
): string {
  const sections: string[] = [];
  
  // Section 1: Project context (less critical, at start)
  if (projectContext) {
    sections.push('## Project Context\n' + projectContext);
  }
  
  // Section 2: General patterns (medium priority)
  if (patterns.length > 0) {
    sections.push('## Relevant Patterns\n' + patterns.slice(0, 5).map(p => `- ${p}`).join('\n'));
  }
  
  // Section 3: Retrieved memories
  const lessons = memories.filter(m => m.type === 'lesson').slice(0, 3);
  if (lessons.length > 0) {
    sections.push('## Lessons from Memory\n' + lessons.map(m => `- ${m.content}`).join('\n'));
  }
  
  // Section 4: Task classification info
  sections.push(`## Task Classification
- Category: ${classification.category}
- Suggested approach: Use ${classification.suggestedDroid} patterns
- Key focus: ${classification.keywords.slice(0, 3).join(', ')}`);
  
  // Section 5: CRITICAL - Gotchas at END (recency bias)
  if (gotchas.length > 0) {
    sections.push('## ⚠️ CRITICAL: Avoid These Mistakes\n' + gotchas.slice(0, 4).map(g => `- ${g}`).join('\n'));
  }
  
  // Section 6: Final reminders (most recent = highest attention)
  sections.push(`## Final Reminders
- State assumptions before coding
- Handle edge cases explicitly
- Verify solution before reporting success`);
  
  return sections.join('\n\n') + '\n\n---\n\n';
}

/**
 * Deduplicate memories by content similarity
 */
function deduplicateMemories(memories: RetrievedMemory[]): RetrievedMemory[] {
  const seen = new Set<string>();
  const unique: RetrievedMemory[] = [];
  
  for (const mem of memories) {
    const key = mem.content.slice(0, 100).toLowerCase().replace(/\s+/g, ' ');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(mem);
    }
  }
  
  return unique;
}
