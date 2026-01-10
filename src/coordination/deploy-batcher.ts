import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { CoordinationDatabase, getDefaultCoordinationDbPath } from './database.js';
import type { DeployAction, DeployBatch, BatchResult, DeployActionType, DeployStatus } from '../types/coordination.js';
import { execSync } from 'child_process';

export interface DeployBatcherConfig {
  dbPath?: string;
  batchWindowMs?: number;
  maxBatchSize?: number;
  dryRun?: boolean;
}



export class DeployBatcher {
  private db: Database.Database;
  private batchWindowMs: number;
  private maxBatchSize: number;
  private dryRun: boolean;

  constructor(config: DeployBatcherConfig = {}) {
    const dbPath = config.dbPath || getDefaultCoordinationDbPath();
    this.db = CoordinationDatabase.getInstance(dbPath).getDatabase();
    this.batchWindowMs = config.batchWindowMs || 30000; // 30 seconds
    this.maxBatchSize = config.maxBatchSize || 20;
    this.dryRun = config.dryRun || false;
  }

  // Queue a deploy action with batching delay
  async queue(
    agentId: string,
    actionType: DeployActionType,
    target: string,
    payload?: Record<string, unknown>,
    options: { priority?: number; dependencies?: string[] } = {}
  ): Promise<number> {
    const now = new Date().toISOString();
    const executeAfter = new Date(Date.now() + this.batchWindowMs).toISOString();

    // Check for similar pending action to merge
    const existing = this.findSimilarAction(actionType, target);
    if (existing && this.canMerge(existing, { actionType, target, payload })) {
      await this.mergeActions(existing.id, payload);
      return existing.id;
    }

    const stmt = this.db.prepare(`
      INSERT INTO deploy_queue (agent_id, action_type, target, payload, status, queued_at, execute_after, priority, dependencies)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `);

    const result = stmt.run(
      agentId,
      actionType,
      target,
      payload ? JSON.stringify(payload) : null,
      now,
      executeAfter,
      options.priority || 5,
      options.dependencies ? JSON.stringify(options.dependencies) : null
    );

    return result.lastInsertRowid as number;
  }

  private findSimilarAction(
    actionType: DeployActionType,
    target: string
  ): DeployAction | null {
    const stmt = this.db.prepare(`
      SELECT id, agent_id as agentId, action_type as actionType, target, payload,
             status, batch_id as batchId, queued_at as queuedAt, 
             execute_after as executeAfter, priority, dependencies
      FROM deploy_queue
      WHERE action_type = ? AND target = ? AND status = 'pending'
      ORDER BY queued_at DESC
      LIMIT 1
    `);
    const row = stmt.get(actionType, target) as Record<string, unknown> | undefined;
    if (!row) return null;

    return {
      ...row,
      payload: row.payload ? JSON.parse(row.payload as string) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies as string) : undefined,
    } as DeployAction;
  }

  private canMerge(
    existing: DeployAction,
    incoming: { actionType: DeployActionType; target: string; payload?: Record<string, unknown> }
  ): boolean {
    // Only merge same action types on same target
    if (existing.actionType !== incoming.actionType || existing.target !== incoming.target) {
      return false;
    }

    // Commits can be squashed
    if (existing.actionType === 'commit') {
      return true;
    }

    // Pushes to same branch can be merged
    if (existing.actionType === 'push') {
      return true;
    }

    // Workflow triggers can be deduplicated
    if (existing.actionType === 'workflow') {
      return true;
    }

    return false;
  }

  private async mergeActions(existingId: number, newPayload?: Record<string, unknown>): Promise<void> {
    if (!newPayload) return;

    const stmt = this.db.prepare(`
      SELECT payload FROM deploy_queue WHERE id = ?
    `);
    const row = stmt.get(existingId) as { payload: string } | undefined;
    if (!row) return;

    const existingPayload = row.payload ? JSON.parse(row.payload) : {};
    
    // Merge payloads (new values override, arrays are concatenated)
    const merged = this.mergePayloads(existingPayload, newPayload);

    const updateStmt = this.db.prepare(`
      UPDATE deploy_queue SET payload = ? WHERE id = ?
    `);
    updateStmt.run(JSON.stringify(merged), existingId);
  }

  private mergePayloads(
    existing: Record<string, unknown>,
    incoming: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...existing };

    for (const [key, value] of Object.entries(incoming)) {
      if (Array.isArray(value) && Array.isArray(result[key])) {
        result[key] = [...(result[key] as unknown[]), ...value];
      } else if (key === 'messages' && Array.isArray(value)) {
        // Special case: concatenate commit messages
        result[key] = [...((result[key] as string[]) || []), ...value];
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  // Create a batch from ready actions
  async createBatch(): Promise<DeployBatch | null> {
    const now = new Date().toISOString();
    
    // Get actions ready for execution (past their delay)
    const stmt = this.db.prepare(`
      SELECT id, agent_id as agentId, action_type as actionType, target, payload,
             status, batch_id as batchId, queued_at as queuedAt, 
             execute_after as executeAfter, priority, dependencies
      FROM deploy_queue
      WHERE status = 'pending' AND execute_after <= ?
      ORDER BY priority DESC, queued_at ASC
      LIMIT ?
    `);
    
    const rows = stmt.all(now, this.maxBatchSize) as Array<Record<string, unknown>>;
    if (rows.length === 0) return null;

    const actions = rows.map((row) => ({
      ...row,
      payload: row.payload ? JSON.parse(row.payload as string) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies as string) : undefined,
    })) as DeployAction[];

    // Group by target
    const grouped = this.groupByTarget(actions);

    // Squash compatible actions within each group
    const squashed = this.squashActions(grouped);

    // Create batch
    const batchId = randomUUID();
    
    // Mark actions as batched
    const updateStmt = this.db.prepare(`
      UPDATE deploy_queue SET status = 'batched', batch_id = ? WHERE id = ?
    `);
    
    const transaction = this.db.transaction(() => {
      for (const action of actions) {
        updateStmt.run(batchId, action.id);
      }
      
      // Record batch
      this.db.prepare(`
        INSERT INTO deploy_batches (id, created_at, status)
        VALUES (?, ?, 'pending')
      `).run(batchId, now);
    });
    
    transaction();

    return {
      id: batchId,
      actions: squashed,
      createdAt: now,
      status: 'pending',
    };
  }

  private groupByTarget(actions: DeployAction[]): Map<string, DeployAction[]> {
    const groups = new Map<string, DeployAction[]>();
    
    for (const action of actions) {
      const key = `${action.actionType}:${action.target}`;
      const existing = groups.get(key) || [];
      existing.push(action);
      groups.set(key, existing);
    }

    return groups;
  }

  private squashActions(grouped: Map<string, DeployAction[]>): DeployAction[] {
    const result: DeployAction[] = [];

    for (const [, actions] of grouped) {
      if (actions.length === 0) continue;

      if (actions.length === 1) {
        result.push(actions[0]);
        continue;
      }

      const first = actions[0];

      // Squash commits
      if (first.actionType === 'commit') {
        const squashed = this.squashCommits(actions);
        result.push(squashed);
        continue;
      }

      // Deduplicate pushes (just keep one)
      if (first.actionType === 'push') {
        result.push(first);
        continue;
      }

      // Deduplicate workflow triggers
      if (first.actionType === 'workflow') {
        result.push(first);
        continue;
      }

      // For other types, keep all
      result.push(...actions);
    }

    return result;
  }

  private squashCommits(commits: DeployAction[]): DeployAction {
    const messages: string[] = [];
    const allFiles: string[] = [];

    for (const commit of commits) {
      const payload = commit.payload as { message?: string; files?: string[] } | undefined;
      if (payload?.message) {
        messages.push(payload.message);
      }
      if (payload?.files) {
        allFiles.push(...payload.files);
      }
    }

    // Create squashed commit message
    const squashedMessage = messages.length === 1
      ? messages[0]
      : `Squashed ${messages.length} commits:\n\n${messages.map((m, i) => `${i + 1}. ${m}`).join('\n')}`;

    return {
      ...commits[0],
      payload: {
        message: squashedMessage,
        files: [...new Set(allFiles)], // Deduplicate files
        squashedFrom: commits.map((c) => c.id),
      },
    };
  }

  // Execute a batch
  async executeBatch(batchId: string): Promise<BatchResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let executed = 0;
    let failed = 0;

    // Get batch actions
    const stmt = this.db.prepare(`
      SELECT id, agent_id as agentId, action_type as actionType, target, payload,
             status, batch_id as batchId, queued_at as queuedAt, 
             execute_after as executeAfter, priority, dependencies
      FROM deploy_queue
      WHERE batch_id = ? AND status = 'batched'
      ORDER BY priority DESC, queued_at ASC
    `);
    
    const rows = stmt.all(batchId) as Array<Record<string, unknown>>;
    const actions = rows.map((row) => ({
      ...row,
      payload: row.payload ? JSON.parse(row.payload as string) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies as string) : undefined,
    })) as DeployAction[];

    // Mark batch as executing
    this.db.prepare(`
      UPDATE deploy_batches SET status = 'executing', executed_at = ? WHERE id = ?
    `).run(new Date().toISOString(), batchId);

    // Execute each action
    for (const action of actions) {
      try {
        await this.executeAction(action);
        this.updateActionStatus(action.id, 'completed');
        executed++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Action ${action.id} (${action.actionType}): ${errorMsg}`);
        this.updateActionStatus(action.id, 'failed');
        failed++;
      }
    }

    // Update batch status
    const batchStatus: DeployStatus = failed === 0 ? 'completed' : (executed > 0 ? 'completed' : 'failed');
    this.db.prepare(`
      UPDATE deploy_batches SET status = ?, result = ? WHERE id = ?
    `).run(batchStatus, JSON.stringify({ executed, failed, errors }), batchId);

    return {
      batchId,
      success: failed === 0,
      executedActions: executed,
      failedActions: failed,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime,
    };
  }

  private async executeAction(action: DeployAction): Promise<void> {
    if (this.dryRun) {
      console.log(`[DRY RUN] Would execute: ${action.actionType} on ${action.target}`);
      return;
    }

    const payload = action.payload || {};

    switch (action.actionType) {
      case 'commit':
        await this.executeCommit(action.target, payload);
        break;
      case 'push':
        await this.executePush(action.target, payload);
        break;
      case 'merge':
        await this.executeMerge(action.target, payload);
        break;
      case 'workflow':
        await this.executeWorkflow(action.target, payload);
        break;
      case 'deploy':
        await this.executeDeploy(action.target, payload);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  private async executeCommit(_target: string, payload: Record<string, unknown>): Promise<void> {
    const message = (payload.message as string) || 'Automated commit';
    const files = (payload.files as string[]) || [];

    if (files.length > 0) {
      execSync(`git add ${files.join(' ')}`, { stdio: 'pipe' });
    } else {
      execSync('git add -A', { stdio: 'pipe' });
    }

    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
  }

  private async executePush(target: string, payload: Record<string, unknown>): Promise<void> {
    const remote = (payload.remote as string) || 'origin';
    const force = (payload.force as boolean) || false;
    
    const forceFlag = force ? '--force-with-lease' : '';
    execSync(`git push ${forceFlag} ${remote} ${target}`, { stdio: 'pipe' });
  }

  private async executeMerge(_target: string, payload: Record<string, unknown>): Promise<void> {
    const source = (payload.source as string) || 'HEAD';
    const squash = (payload.squash as boolean) || false;

    if (squash) {
      execSync(`git merge --squash ${source}`, { stdio: 'pipe' });
    } else {
      execSync(`git merge ${source}`, { stdio: 'pipe' });
    }
  }

  private async executeWorkflow(target: string, payload: Record<string, unknown>): Promise<void> {
    const workflow = target;
    const ref = (payload.ref as string) || 'main';
    const inputs = payload.inputs as Record<string, string> | undefined;

    let inputsArg = '';
    if (inputs) {
      inputsArg = Object.entries(inputs)
        .map(([key, value]) => `-f ${key}=${value}`)
        .join(' ');
    }

    execSync(`gh workflow run ${workflow} --ref ${ref} ${inputsArg}`, { stdio: 'pipe' });
  }

  private async executeDeploy(target: string, payload: Record<string, unknown>): Promise<void> {
    const environment = target;
    const command = (payload.command as string) || `deploy-${environment}`;
    
    execSync(command, { stdio: 'pipe' });
  }

  private updateActionStatus(actionId: number, status: DeployStatus): void {
    const stmt = this.db.prepare(`
      UPDATE deploy_queue SET status = ? WHERE id = ?
    `);
    stmt.run(status, actionId);
  }

  // Get batch status
  getBatch(batchId: string): DeployBatch | null {
    const batchStmt = this.db.prepare(`
      SELECT id, created_at as createdAt, executed_at as executedAt, status, result
      FROM deploy_batches
      WHERE id = ?
    `);
    const batchRow = batchStmt.get(batchId) as Record<string, unknown> | undefined;
    if (!batchRow) return null;

    const actionsStmt = this.db.prepare(`
      SELECT id, agent_id as agentId, action_type as actionType, target, payload,
             status, batch_id as batchId, queued_at as queuedAt, 
             execute_after as executeAfter, priority, dependencies
      FROM deploy_queue
      WHERE batch_id = ?
    `);
    const actionRows = actionsStmt.all(batchId) as Array<Record<string, unknown>>;

    const actions = actionRows.map((row) => ({
      ...row,
      payload: row.payload ? JSON.parse(row.payload as string) : undefined,
      dependencies: row.dependencies ? JSON.parse(row.dependencies as string) : undefined,
    })) as DeployAction[];

    return {
      id: batchId,
      actions,
      createdAt: batchRow.createdAt as string,
      status: batchRow.status as DeployStatus,
    };
  }

  // Get all pending batches
  getPendingBatches(): DeployBatch[] {
    const stmt = this.db.prepare(`
      SELECT id FROM deploy_batches WHERE status = 'pending'
    `);
    const rows = stmt.all() as Array<{ id: string }>;
    
    return rows
      .map((row) => this.getBatch(row.id))
      .filter((b): b is DeployBatch => b !== null);
  }

  // Force flush all pending deploys
  async flushAll(): Promise<BatchResult[]> {
    const results: BatchResult[] = [];

    // First, create batches from all pending
    let batch = await this.createBatch();
    while (batch) {
      const result = await this.executeBatch(batch.id);
      results.push(result);
      batch = await this.createBatch();
    }

    return results;
  }
}
