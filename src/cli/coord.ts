import chalk from 'chalk';
import ora from 'ora';
import { CoordinationService } from '../coordination/service.js';
import { DeployBatcher } from '../coordination/deploy-batcher.js';

type CoordAction = 'status' | 'flush' | 'cleanup';

interface CoordOptions {
  verbose?: boolean;
}

export async function coordCommand(action: CoordAction, options: CoordOptions = {}): Promise<void> {
  switch (action) {
    case 'status':
      await showStatus(options);
      break;
    case 'flush':
      await flushDeploys(options);
      break;
    case 'cleanup':
      await cleanupCoordination(options);
      break;
  }
}

async function showStatus(options: CoordOptions): Promise<void> {
  const spinner = ora('Loading coordination status...').start();

  try {
    const service = new CoordinationService();
    const status = service.getStatus();
    spinner.stop();

    console.log(chalk.bold('\n📊 Coordination Status\n'));

    // Active agents
    console.log(chalk.bold.cyan('Active Agents:'));
    if (status.activeAgents.length === 0) {
      console.log(chalk.dim('  No active agents'));
    } else {
      for (const agent of status.activeAgents) {
        const statusColor = agent.status === 'active' ? chalk.green : chalk.yellow;
        console.log(
          `  ${chalk.cyan(agent.name)} (${agent.id.slice(0, 8)}...) - ${statusColor(agent.status)}`
        );
        if (agent.currentTask) {
          console.log(chalk.dim(`    Task: ${agent.currentTask}`));
        }
        if (options.verbose) {
          console.log(chalk.dim(`    Started: ${agent.startedAt}`));
          console.log(chalk.dim(`    Heartbeat: ${agent.lastHeartbeat}`));
        }
      }
    }
    console.log('');

    // Active claims
    console.log(chalk.bold.cyan('Resource Claims:'));
    if (status.activeClaims.length === 0) {
      console.log(chalk.dim('  No active claims'));
    } else {
      for (const claim of status.activeClaims) {
        const typeIcon = claim.claimType === 'exclusive' ? '🔒' : '🔓';
        console.log(`  ${typeIcon} ${chalk.yellow(claim.resource)}`);
        console.log(chalk.dim(`    By: ${claim.agentId.slice(0, 8)}... (${claim.claimType})`));
        if (claim.expiresAt) {
          console.log(chalk.dim(`    Expires: ${claim.expiresAt}`));
        }
      }
    }
    console.log('');

    // Pending deploys
    console.log(chalk.bold.cyan('Pending Deploys:'));
    if (status.pendingDeploys.length === 0) {
      console.log(chalk.dim('  No pending deploys'));
    } else {
      const grouped = groupByTarget(status.pendingDeploys);
      for (const [target, deploys] of grouped) {
        console.log(`  ${chalk.yellow(target)}: ${deploys.length} action(s)`);
        if (options.verbose) {
          for (const deploy of deploys) {
            console.log(chalk.dim(`    - ${deploy.actionType} (priority: ${deploy.priority})`));
          }
        }
      }
    }
    console.log('');

    // Summary
    console.log(chalk.bold.cyan('Summary:'));
    console.log(`  Agents: ${chalk.green(status.activeAgents.length)}`);
    console.log(`  Claims: ${chalk.yellow(status.activeClaims.length)}`);
    console.log(`  Pending Deploys: ${chalk.blue(status.pendingDeploys.length)}`);
    console.log(`  Unread Messages: ${chalk.magenta(status.pendingMessages)}`);
    console.log('');
  } catch (error) {
    spinner.fail('Failed to load status');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

async function flushDeploys(_options: CoordOptions): Promise<void> {
  const spinner = ora('Flushing all pending deploys...').start();

  try {
    const batcher = new DeployBatcher();
    const results = await batcher.flushAll();

    if (results.length === 0) {
      spinner.info('No pending deploys to flush');
      return;
    }

    spinner.succeed(`Flushed ${results.length} batch(es)`);

    for (const result of results) {
      console.log('');
      console.log(chalk.bold(`Batch ${result.batchId.slice(0, 8)}...`));
      console.log(`  Executed: ${chalk.green(result.executedActions)}`);
      console.log(`  Failed: ${result.failedActions > 0 ? chalk.red(result.failedActions) : chalk.dim('0')}`);
      console.log(`  Duration: ${chalk.dim(result.duration + 'ms')}`);

      if (result.errors && result.errors.length > 0) {
        console.log(chalk.red('  Errors:'));
        for (const error of result.errors) {
          console.log(chalk.red(`    - ${error}`));
        }
      }
    }
  } catch (error) {
    spinner.fail('Failed to flush deploys');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

async function cleanupCoordination(_options: CoordOptions): Promise<void> {
  const spinner = ora('Cleaning up stale coordination data...').start();

  try {
    const service = new CoordinationService();
    
    // Cleanup stale agents
    const staleCount = service.cleanupStaleAgents();
    
    // General cleanup
    service.cleanup();

    spinner.succeed(`Cleanup complete`);
    console.log(chalk.dim(`  Marked ${staleCount} stale agent(s) as failed`));
    console.log(chalk.dim('  Removed expired claims, old messages, and completed entries'));
  } catch (error) {
    spinner.fail('Cleanup failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

function groupByTarget(deploys: Array<{ target: string; actionType?: string; priority?: number }>): Map<string, typeof deploys> {
  const groups = new Map<string, typeof deploys>();
  for (const deploy of deploys) {
    const existing = groups.get(deploy.target) || [];
    existing.push(deploy);
    groups.set(deploy.target, existing);
  }
  return groups;
}
