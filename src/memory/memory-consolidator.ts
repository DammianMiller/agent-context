/**
 * Memory Consolidation Service for UAM
 * 
 * Implements the consolidation rules from CLAUDE.md:
 * - Trigger: Every 10 working memory entries
 * - Action: Summarize → session_memories, Extract lessons → semantic memory
 * - Dedup: Skip if content_hash exists OR similarity > 0.92
 */

import { createHash } from 'crypto';
import { existsSync } from 'fs';
import Database from 'better-sqlite3';
import { summarizeMemories, compressMemoryEntry } from './context-compressor.js';
import { getEmbeddingService } from './embeddings.js';

export interface ConsolidationConfig {
  triggerThreshold: number;
  minImportanceForLongTerm: number;
  similarityThreshold: number;
  maxSummaryLength: number;
}

const DEFAULT_CONFIG: ConsolidationConfig = {
  triggerThreshold: 10,
  minImportanceForLongTerm: 7,
  similarityThreshold: 0.92,
  maxSummaryLength: 500,
};

export interface ConsolidationResult {
  memoriesProcessed: number;
  summariesCreated: number;
  lessonsExtracted: number;
  duplicatesSkipped: number;
  tokensReduced: number;
}

/**
 * Memory Consolidation Service
 */
export class MemoryConsolidator {
  private config: ConsolidationConfig;
  private db: Database.Database | null = null;
  private contentHashes: Set<string> = new Set();
  private lastConsolidationId: number = 0;

  constructor(config: Partial<ConsolidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize with database connection
   */
  initialize(dbPath: string): void {
    if (!existsSync(dbPath)) {
      throw new Error(`Database not found: ${dbPath}`);
    }
    this.db = new Database(dbPath);
    this.loadContentHashes();
  }

  /**
   * Load existing content hashes for deduplication
   */
  private loadContentHashes(): void {
    if (!this.db) return;

    try {
      const stmt = this.db.prepare(`
        SELECT content FROM memories
        UNION
        SELECT content FROM session_memories
      `);
      const rows = stmt.all() as Array<{ content: string }>;
      
      for (const row of rows) {
        this.contentHashes.add(this.hashContent(row.content));
      }
    } catch {
      // Tables might not exist yet
    }
  }

  /**
   * Hash content for deduplication
   */
  private hashContent(content: string): string {
    return createHash('md5')
      .update(content.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Check if consolidation should run
   */
  shouldConsolidate(): boolean {
    if (!this.db) return false;

    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count, MAX(id) as maxId
        FROM memories
        WHERE id > ?
      `);
      const result = stmt.get(this.lastConsolidationId) as { count: number; maxId: number | null };
      
      return result.count >= this.config.triggerThreshold;
    } catch {
      return false;
    }
  }

  /**
   * Run consolidation process
   */
  async consolidate(): Promise<ConsolidationResult> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result: ConsolidationResult = {
      memoriesProcessed: 0,
      summariesCreated: 0,
      lessonsExtracted: 0,
      duplicatesSkipped: 0,
      tokensReduced: 0,
    };

    // Get memories since last consolidation
    const stmt = this.db.prepare(`
      SELECT id, timestamp, type, content
      FROM memories
      WHERE id > ?
      ORDER BY id ASC
      LIMIT 100
    `);
    const memories = stmt.all(this.lastConsolidationId) as Array<{
      id: number;
      timestamp: string;
      type: string;
      content: string;
    }>;

    if (memories.length === 0) return result;

    result.memoriesProcessed = memories.length;
    const originalTokens = memories.reduce((sum, m) => sum + m.content.length / 4, 0);

    // Group by type for summarization
    const byType: Record<string, typeof memories> = {};
    for (const mem of memories) {
      if (!byType[mem.type]) byType[mem.type] = [];
      byType[mem.type].push(mem);
    }

    // Create summaries for each type
    for (const [_type, typeMemories] of Object.entries(byType)) {
      if (typeMemories.length >= 3) {
        const summary = summarizeMemories(
          typeMemories.map(m => ({
            content: m.content,
            timestamp: m.timestamp,
            type: m.type,
          })),
          this.config.maxSummaryLength
        );

        const summaryHash = this.hashContent(summary);
        
        if (!this.contentHashes.has(summaryHash)) {
          // Store in session_memories
          await this.storeSessionMemory(summary, 'summary', 6);
          this.contentHashes.add(summaryHash);
          result.summariesCreated++;
        } else {
          result.duplicatesSkipped++;
        }
      }
    }

    // Extract lessons from high-importance observations
    const lessons = memories.filter(m => 
      m.type === 'observation' && 
      this.detectLesson(m.content)
    );

    for (const lesson of lessons) {
      const compressed = compressMemoryEntry(lesson.content, { compressionLevel: 'medium' });
      const hash = this.hashContent(compressed.compressed);

      if (!this.contentHashes.has(hash)) {
        // Check semantic similarity
        const isDuplicate = await this.checkSemanticDuplicate(compressed.compressed);
        
        if (!isDuplicate) {
          await this.storeLesson(compressed.compressed, lesson.timestamp);
          this.contentHashes.add(hash);
          result.lessonsExtracted++;
        } else {
          result.duplicatesSkipped++;
        }
      } else {
        result.duplicatesSkipped++;
      }
    }

    // Calculate token reduction
    const summaryTokens = result.summariesCreated * (this.config.maxSummaryLength / 4);
    const lessonTokens = result.lessonsExtracted * 100; // Approximate
    result.tokensReduced = Math.max(0, originalTokens - summaryTokens - lessonTokens);

    // Update last consolidation pointer
    this.lastConsolidationId = memories[memories.length - 1].id;

    return result;
  }

  /**
   * Detect if content contains a lesson/insight
   */
  private detectLesson(content: string): boolean {
    const lessonIndicators = [
      /learned that/i,
      /important to/i,
      /mistake was/i,
      /better to/i,
      /should always/i,
      /should never/i,
      /key insight/i,
      /gotcha/i,
      /watch out for/i,
      /best practice/i,
      /pattern/i,
      /tip:/i,
    ];

    return lessonIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Check for semantic duplicates using embeddings
   */
  private async checkSemanticDuplicate(content: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const embeddingService = getEmbeddingService();
      const newEmbedding = await embeddingService.embed(content);

      // Get recent session memories for comparison
      const stmt = this.db.prepare(`
        SELECT content FROM session_memories
        ORDER BY id DESC
        LIMIT 50
      `);
      const existing = stmt.all() as Array<{ content: string }>;

      for (const { content: existingContent } of existing) {
        const existingEmbedding = await embeddingService.embed(existingContent);
        const similarity = embeddingService.cosineSimilarity(newEmbedding, existingEmbedding);
        
        if (similarity > this.config.similarityThreshold) {
          return true;
        }
      }

      return false;
    } catch {
      // Fall back to text comparison
      const normalizedNew = content.toLowerCase().trim();
      
      const stmt = this.db.prepare(`
        SELECT content FROM session_memories
        WHERE LOWER(TRIM(content)) = ?
        LIMIT 1
      `);
      const match = stmt.get(normalizedNew);
      
      return !!match;
    }
  }

  /**
   * Store session memory
   */
  private async storeSessionMemory(
    content: string,
    type: string,
    importance: number
  ): Promise<void> {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO session_memories (session_id, timestamp, type, content, importance)
      VALUES ('consolidation', ?, ?, ?, ?)
    `);
    
    stmt.run(new Date().toISOString(), type, content, importance);
  }

  /**
   * Store lesson in long-term memory
   */
  private async storeLesson(content: string, timestamp: string): Promise<void> {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO session_memories (session_id, timestamp, type, content, importance)
      VALUES ('lessons', ?, 'lesson', ?, ?)
    `);
    
    stmt.run(timestamp, content, this.config.minImportanceForLongTerm);
  }

  /**
   * Run decay on old memories
   * Formula: effective_importance = importance × (0.95 ^ days_since_access)
   */
  async runDecay(): Promise<number> {
    if (!this.db) return 0;

    try {
      // SQLite doesn't have POW, so we do this in application code
      const stmt = this.db.prepare(`
        SELECT id, importance, timestamp
        FROM session_memories
        WHERE importance > 1
      `);
      const rows = stmt.all() as Array<{
        id: number;
        importance: number;
        timestamp: string;
      }>;

      let updated = 0;
      const now = Date.now();
      const updateStmt = this.db.prepare(`
        UPDATE session_memories
        SET importance = ?
        WHERE id = ?
      `);

      for (const row of rows) {
        const daysSince = (now - new Date(row.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        const decayed = Math.round(row.importance * Math.pow(0.95, daysSince));
        
        if (decayed !== row.importance && decayed >= 1) {
          updateStmt.run(decayed, row.id);
          updated++;
        }
      }

      return updated;
    } catch {
      return 0;
    }
  }

  /**
   * Get consolidation stats
   */
  getStats(): {
    totalMemories: number;
    totalSessionMemories: number;
    totalLessons: number;
    lastConsolidationId: number;
    uniqueHashes: number;
  } {
    if (!this.db) {
      return {
        totalMemories: 0,
        totalSessionMemories: 0,
        totalLessons: 0,
        lastConsolidationId: this.lastConsolidationId,
        uniqueHashes: this.contentHashes.size,
      };
    }

    try {
      const memoriesStmt = this.db.prepare('SELECT COUNT(*) as count FROM memories');
      const sessionStmt = this.db.prepare('SELECT COUNT(*) as count FROM session_memories');
      const lessonsStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM session_memories WHERE type = 'lesson'
      `);

      const memories = (memoriesStmt.get() as { count: number }).count;
      const session = (sessionStmt.get() as { count: number }).count;
      const lessons = (lessonsStmt.get() as { count: number }).count;

      return {
        totalMemories: memories,
        totalSessionMemories: session,
        totalLessons: lessons,
        lastConsolidationId: this.lastConsolidationId,
        uniqueHashes: this.contentHashes.size,
      };
    } catch {
      return {
        totalMemories: 0,
        totalSessionMemories: 0,
        totalLessons: 0,
        lastConsolidationId: this.lastConsolidationId,
        uniqueHashes: this.contentHashes.size,
      };
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let globalConsolidator: MemoryConsolidator | null = null;

export function getMemoryConsolidator(
  config?: Partial<ConsolidationConfig>
): MemoryConsolidator {
  if (!globalConsolidator) {
    globalConsolidator = new MemoryConsolidator(config);
  }
  return globalConsolidator;
}
