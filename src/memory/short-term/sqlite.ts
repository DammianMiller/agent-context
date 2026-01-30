import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { ensureShortTermSchema } from './schema.js';
import { getSpeculativeCache } from '../speculative-cache.js';
import type { ShortTermMemoryBackend } from './factory.js';

interface ShortTermMemory {
  id?: number;
  timestamp: string;
  type: 'action' | 'observation' | 'thought' | 'goal';
  content: string;
  projectId?: string;
}

export class SQLiteShortTermMemory implements ShortTermMemoryBackend {
  private db: Database.Database;
  private projectId: string;
  private maxEntries: number;
  private cache = getSpeculativeCache({ maxEntries: 50, ttlMs: 120000, preWarmEnabled: true });

  constructor(config: { dbPath: string; projectId?: string; maxEntries?: number }) {
    // Ensure directory exists
    const dir = dirname(config.dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(config.dbPath);
    this.projectId = config.projectId || 'default';
    this.maxEntries = config.maxEntries || 50;

    // Initialize schema
    this.initSchema();
  }

  private initSchema(): void {
    ensureShortTermSchema(this.db);
  }

  async store(type: ShortTermMemory['type'], content: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO memories (timestamp, type, content, project_id)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(timestamp, type, content, this.projectId);

    // Update FTS5 index
    try {
      const ftsStmt = this.db.prepare(`
        INSERT INTO memories_fts(rowid, content, type)
        VALUES (?, ?, ?)
      `);
      ftsStmt.run(result.lastInsertRowid, content, type);
    } catch {
      // FTS5 not available, ignore
    }
    
    // Auto-prune if exceeds maxEntries
    await this.prune();
  }

  async storeBatch(
    entries: Array<{ type: ShortTermMemory['type']; content: string; timestamp?: string }>
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO memories (timestamp, type, content, project_id)
      VALUES (?, ?, ?, ?)
    `);

    type EntryType = { type: ShortTermMemory['type']; content: string; timestamp?: string };
    const insertMany = this.db.transaction((items: EntryType[]) => {
      for (const entry of items) {
        stmt.run(
          entry.timestamp || new Date().toISOString(),
          entry.type,
          entry.content,
          this.projectId
        );
      }
    });

    insertMany(entries);
    await this.prune();
  }

  async getRecent(limit = 50): Promise<ShortTermMemory[]> {
    const stmt = this.db.prepare(`
      SELECT id, timestamp, type, content, project_id as projectId
      FROM memories
      WHERE project_id = ?
      ORDER BY id DESC
      LIMIT ?
    `);
    return stmt.all(this.projectId, limit) as ShortTermMemory[];
  }

  async query(searchTerm: string, limit = 10): Promise<ShortTermMemory[]> {
    // Check speculative cache first
    const cacheKey = `${this.projectId}:${searchTerm}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached.result as ShortTermMemory[];
    }

    let results: ShortTermMemory[] = [];

    // Try FTS5 first for faster full-text search
    try {
      const ftsStmt = this.db.prepare(`
        SELECT m.id, m.timestamp, m.type, m.content, m.project_id as projectId
        FROM memories_fts fts
        JOIN memories m ON fts.rowid = m.id
        WHERE memories_fts MATCH ? AND m.project_id = ?
        ORDER BY rank
        LIMIT ?
      `);
      results = ftsStmt.all(searchTerm, this.projectId, limit) as ShortTermMemory[];
    } catch {
      // FTS5 not available or query syntax error, fall through to LIKE
    }

    // Fallback to LIKE search if FTS5 returned nothing
    if (results.length === 0) {
      const stmt = this.db.prepare(`
        SELECT id, timestamp, type, content, project_id as projectId
        FROM memories
        WHERE project_id = ? AND content LIKE ?
        ORDER BY id DESC
        LIMIT ?
      `);
      results = stmt.all(this.projectId, `%${searchTerm}%`, limit) as ShortTermMemory[];
    }

    // Store in cache
    this.cache.set(cacheKey, results);

    // Pre-warm cache for predicted next queries
    this.cache.preWarm(searchTerm, async (q) => {
      const predictedKey = `${this.projectId}:${q}:${limit}`;
      if (!this.cache.get(predictedKey)) {
        return this.queryWithoutCache(q, limit);
      }
      return [];
    }).catch(() => {});

    return results;
  }

  private async queryWithoutCache(searchTerm: string, limit: number): Promise<ShortTermMemory[]> {
    try {
      const ftsStmt = this.db.prepare(`
        SELECT m.id, m.timestamp, m.type, m.content, m.project_id as projectId
        FROM memories_fts fts
        JOIN memories m ON fts.rowid = m.id
        WHERE memories_fts MATCH ? AND m.project_id = ?
        ORDER BY rank
        LIMIT ?
      `);
      const results = ftsStmt.all(searchTerm, this.projectId, limit) as ShortTermMemory[];
      if (results.length > 0) return results;
    } catch {
      // FTS5 not available
    }

    const stmt = this.db.prepare(`
      SELECT id, timestamp, type, content, project_id as projectId
      FROM memories
      WHERE project_id = ? AND content LIKE ?
      ORDER BY id DESC
      LIMIT ?
    `);
    return stmt.all(this.projectId, `%${searchTerm}%`, limit) as ShortTermMemory[];
  }

  async getByType(type: ShortTermMemory['type'], limit = 50): Promise<ShortTermMemory[]> {
    const stmt = this.db.prepare(`
      SELECT id, timestamp, type, content, project_id as projectId
      FROM memories
      WHERE project_id = ? AND type = ?
      ORDER BY id DESC
      LIMIT ?
    `);
    return stmt.all(this.projectId, type, limit) as ShortTermMemory[];
  }

  async count(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM memories
      WHERE project_id = ?
    `);
    const result = stmt.get(this.projectId) as { count: number };
    return result.count;
  }

  private async prune(): Promise<void> {
    const count = await this.count();
    if (count > this.maxEntries) {
      const toDelete = count - this.maxEntries;
      const stmt = this.db.prepare(`
        DELETE FROM memories
        WHERE id IN (
          SELECT id FROM memories
          WHERE project_id = ?
          ORDER BY id ASC
          LIMIT ?
        )
      `);
      stmt.run(this.projectId, toDelete);
    }
  }

  async clear(): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM memories
      WHERE project_id = ?
    `);
    stmt.run(this.projectId);
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // Export all memories as JSON (useful for backup/migration)
  async exportAll(): Promise<ShortTermMemory[]> {
    const stmt = this.db.prepare(`
      SELECT id, timestamp, type, content, project_id as projectId
      FROM memories
      WHERE project_id = ?
      ORDER BY id ASC
    `);
    return stmt.all(this.projectId) as ShortTermMemory[];
  }

  // Import memories from JSON (useful for restore/migration)
  async importAll(
    memories: Array<{ type: ShortTermMemory['type']; content: string; timestamp?: string }>
  ): Promise<number> {
    await this.storeBatch(memories);
    return memories.length;
  }
}
