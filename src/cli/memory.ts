import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

type MemoryAction = 'status' | 'start' | 'stop' | 'query' | 'store';

interface MemoryOptions {
  search?: string;
  limit?: string;
  content?: string;
  tags?: string;
  importance?: string;
}

export async function memoryCommand(action: MemoryAction, options: MemoryOptions = {}): Promise<void> {
  const cwd = process.cwd();

  switch (action) {
    case 'status':
      await showStatus(cwd);
      break;
    case 'start':
      await startServices(cwd);
      break;
    case 'stop':
      await stopServices(cwd);
      break;
    case 'query':
      await queryMemory(cwd, options.search!, parseInt(options.limit || '10'));
      break;
    case 'store':
      await storeMemory(cwd, options.content!, options.tags, parseInt(options.importance || '5'));
      break;
  }
}

async function showStatus(cwd: string): Promise<void> {
  console.log(chalk.bold('\n📊 Memory System Status\n'));

  // Check short-term memory
  const shortTermPath = join(cwd, 'agents/data/memory/short_term.db');
  if (existsSync(shortTermPath)) {
    console.log(chalk.green('✓ Short-term memory: Active'));
    console.log(chalk.dim(`  Path: ${shortTermPath}`));
    // TODO: Query for entry count
  } else {
    console.log(chalk.yellow('○ Short-term memory: Not initialized'));
  }

  // Check Qdrant
  console.log('');
  try {
    execSync('docker ps --filter name=qdrant --format "{{.Status}}"', { encoding: 'utf-8' });
    const status = execSync('docker ps --filter name=qdrant --format "{{.Status}}"', { encoding: 'utf-8' }).trim();
    if (status) {
      console.log(chalk.green('✓ Long-term memory (Qdrant): Running'));
      console.log(chalk.dim(`  Status: ${status}`));
    } else {
      console.log(chalk.yellow('○ Long-term memory (Qdrant): Not running'));
    }
  } catch {
    console.log(chalk.yellow('○ Long-term memory (Qdrant): Not available'));
    console.log(chalk.dim('  Run `agent-context memory start` to initialize'));
  }

  // Check docker-compose
  const composePath = join(cwd, 'agents/docker-compose.yml');
  if (!existsSync(composePath)) {
    const dockerPath = join(cwd, 'docker/docker-compose.yml');
    if (!existsSync(dockerPath)) {
      console.log(chalk.dim('\n  No docker-compose.yml found. Memory services need manual setup.'));
    }
  }

  console.log('');
}

async function startServices(cwd: string): Promise<void> {
  const spinner = ora('Starting memory services...').start();

  // Check for docker-compose file
  const composePaths = [
    join(cwd, 'agents/docker-compose.yml'),
    join(cwd, 'docker/docker-compose.yml'),
  ];

  let composePath: string | null = null;
  for (const path of composePaths) {
    if (existsSync(path)) {
      composePath = path;
      break;
    }
  }

  if (!composePath) {
    // Create default docker-compose
    spinner.text = 'Creating docker-compose.yml...';
    const defaultCompose = `version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: agent-context-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
    restart: unless-stopped
`;
    const agentsDir = join(cwd, 'agents');
    if (!existsSync(agentsDir)) {
      mkdirSync(agentsDir, { recursive: true });
    }
    composePath = join(agentsDir, 'docker-compose.yml');
    writeFileSync(composePath, defaultCompose);
  }

  try {
    execSync(`docker-compose -f "${composePath}" up -d`, { encoding: 'utf-8', stdio: 'pipe' });
    spinner.succeed('Memory services started');
    console.log(chalk.dim('  Qdrant available at http://localhost:6333'));
  } catch (error) {
    spinner.fail('Failed to start memory services');
    console.error(chalk.red('Make sure Docker is installed and running'));
    console.error(error);
  }
}

async function stopServices(cwd: string): Promise<void> {
  const spinner = ora('Stopping memory services...').start();

  const composePaths = [
    join(cwd, 'agents/docker-compose.yml'),
    join(cwd, 'docker/docker-compose.yml'),
  ];

  let composePath: string | null = null;
  for (const path of composePaths) {
    if (existsSync(path)) {
      composePath = path;
      break;
    }
  }

  if (!composePath) {
    spinner.fail('No docker-compose.yml found');
    return;
  }

  try {
    execSync(`docker-compose -f "${composePath}" down`, { encoding: 'utf-8', stdio: 'pipe' });
    spinner.succeed('Memory services stopped');
  } catch (error) {
    spinner.fail('Failed to stop memory services');
    console.error(error);
  }
}

async function queryMemory(_cwd: string, search: string, limit: number): Promise<void> {
  console.log(chalk.bold(`\n🔍 Searching for: "${search}" (limit: ${limit})\n`));

  // TODO: Implement actual Qdrant query
  console.log(chalk.yellow('Memory query not yet implemented'));
  console.log(chalk.dim('This will search the Qdrant vector database for semantically similar memories'));
}

async function storeMemory(
  _cwd: string,
  content: string,
  tags?: string,
  importance: number = 5
): Promise<void> {
  console.log(chalk.bold('\n💾 Storing memory...\n'));
  console.log(chalk.dim(`Content: ${content}`));
  console.log(chalk.dim(`Tags: ${tags || 'none'}`));
  console.log(chalk.dim(`Importance: ${importance}/10`));

  // TODO: Implement actual Qdrant store
  console.log(chalk.yellow('\nMemory storage not yet implemented'));
  console.log(chalk.dim('This will embed the content and store in Qdrant'));
}
