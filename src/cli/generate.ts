import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { analyzeProject } from '../analyzers/index.js';
import { generateClaudeMd } from '../generators/claude-md.js';
import { AgentContextConfigSchema } from '../types/index.js';
import { mergeClaudeMd } from '../utils/merge-claude-md.js';
import type { AgentContextConfig, Platform } from '../types/index.js';

interface GenerateOptions {
  force?: boolean;
  dryRun?: boolean;
  platform?: string;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = join(cwd, '.agent-context.json');

  console.log(chalk.bold('\n📝 Generate Agent Context Files\n'));

  // Load config if exists
  let config: AgentContextConfig;
  if (existsSync(configPath)) {
    try {
      const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
      config = AgentContextConfigSchema.parse(raw);
      console.log(chalk.dim(`Using config from .agent-context.json`));
    } catch (error) {
      console.error(chalk.red('Invalid .agent-context.json configuration'));
      console.error(error);
      return;
    }
  } else {
    console.log(chalk.yellow('No .agent-context.json found. Run `agent-context init` first, or generating with defaults.'));
    config = {
      version: '1.0.0',
      project: {
        name: 'Unknown Project',
        defaultBranch: 'main',
      },
      template: {
        extends: 'default',
      },
    };
  }

  // Analyze project
  const spinner = ora('Analyzing project...').start();
  let analysis;
  try {
    analysis = await analyzeProject(cwd);
    spinner.succeed(`Analyzed: ${analysis.projectName}`);
  } catch (error) {
    spinner.fail('Failed to analyze project');
    console.error(chalk.red(error));
    return;
  }

  // Generate CLAUDE.md
  const claudeMdPath = join(cwd, 'CLAUDE.md');
  const agentMdPath = join(cwd, 'AGENT.md');
  const claudeMdExists = existsSync(claudeMdPath);
  const agentMdExists = existsSync(agentMdPath);
  
  let existingContent: string | undefined;
  let targetPath = claudeMdPath;
  
  if ((claudeMdExists || agentMdExists) && !options.force && !options.dryRun) {
    // Read existing content
    if (claudeMdExists) {
      existingContent = readFileSync(claudeMdPath, 'utf-8');
      targetPath = claudeMdPath;
    } else if (agentMdExists) {
      existingContent = readFileSync(agentMdPath, 'utf-8');
      targetPath = agentMdPath;
    }
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `${claudeMdExists ? 'CLAUDE.md' : 'AGENT.md'} already exists. What would you like to do?`,
        choices: [
          { name: 'Merge with existing content (recommended)', value: 'merge' },
          { name: 'Overwrite completely', value: 'overwrite' },
          { name: 'Cancel', value: 'cancel' },
        ],
        default: 'merge',
      },
    ]);
    
    if (action === 'cancel') {
      console.log(chalk.yellow('Generation cancelled.'));
      return;
    }
    
    if (action === 'overwrite') {
      existingContent = undefined;
    }
  }

  const genSpinner = ora(`${existingContent ? 'Merging' : 'Generating'} CLAUDE.md...`).start();
  try {
    const newClaudeMd = await generateClaudeMd(analysis, config);
    const claudeMd = existingContent ? mergeClaudeMd(existingContent, newClaudeMd) : newClaudeMd;

    if (options.dryRun) {
      genSpinner.succeed(`${existingContent ? 'Merged' : 'Generated'} (dry run)`);
      console.log(chalk.dim('\n--- CLAUDE.md Preview ---\n'));
      console.log(claudeMd.substring(0, 2000) + '\n...\n');
      console.log(chalk.dim(`Total: ${claudeMd.length} characters, ${claudeMd.split('\n').length} lines`));
    } else {
      writeFileSync(targetPath, claudeMd);
      genSpinner.succeed(`${existingContent ? 'Merged and updated' : 'Generated'} ${targetPath.endsWith('CLAUDE.md') ? 'CLAUDE.md' : 'AGENT.md'}`);
      if (existingContent) {
        console.log(chalk.dim('  Preserved custom sections from existing file'));
      }
    }
  } catch (error) {
    genSpinner.fail(`Failed to ${existingContent ? 'merge' : 'generate'} CLAUDE.md`);
    console.error(chalk.red(error));
    return;
  }

  // Generate platform-specific files if requested
  if (options.platform || !options.dryRun) {
    const platforms = options.platform
      ? [options.platform as Platform]
      : Object.entries(config.platforms || {})
          .filter(([_, v]) => v?.enabled)
          .map(([k]) => k as Platform);

    for (const platform of platforms) {
      const platformSpinner = ora(`Generating ${platform} files...`).start();
      try {
        await generatePlatformFiles(cwd, platform, analysis, config, options.dryRun);
        platformSpinner.succeed(`Generated ${platform} files`);
      } catch (error) {
        platformSpinner.fail(`Failed to generate ${platform} files`);
        console.error(chalk.red(error));
      }
    }
  }

  if (!options.dryRun) {
    console.log(chalk.green('\n✅ Generation complete!\n'));
  }
}

async function generatePlatformFiles(
  _cwd: string,
  platform: Platform,
  _analysis: Awaited<ReturnType<typeof analyzeProject>>,
  _config: AgentContextConfig,
  dryRun?: boolean
): Promise<void> {
  // Platform-specific generation logic
  switch (platform) {
    case 'claudeCode':
      // Generate .claude/ structure
      if (!dryRun) {
        // TODO: Generate Claude Code specific files
      }
      break;
    case 'factory':
      // Generate .factory/ structure
      if (!dryRun) {
        // TODO: Generate Factory specific files
      }
      break;
    case 'vscode':
      // Generate .vscode/ settings
      if (!dryRun) {
        // TODO: Generate VSCode specific files
      }
      break;
    case 'opencode':
      // Generate opencode.json
      if (!dryRun) {
        // TODO: Generate OpenCode specific files
      }
      break;
  }
}
