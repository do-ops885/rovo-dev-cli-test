#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { startCommand } from './commands/start';
import { statusCommand } from './commands/status';
import { sparcCommand } from './commands/sparc';
import { eventCommand } from './commands/event';
import { agentCommand } from './commands/agent';
import { memoryCommand } from './commands/memory';
import { swarmCommand } from './commands/swarm';
import { acliCommand } from './commands/acli';
import { usageCommand } from './commands/usage';
import { sessionsCommand } from './commands/sessions';
import { instructionsCommand } from './commands/instructions';
import { feedbackCommand } from './commands/feedback';
import { interactiveCommand } from './commands/interactive';
import { mcpCommand } from './commands/mcp';
import chalk from 'chalk';

// Create CLI program
const program = new Command();

// Set version and description
program
  .name('rovo-code-flow')
  .description('Multi-agent orchestration CLI for Rovo Dev, blending SPARC and Event Modeling')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize rovo-code-flow with SPARC and/or Event Modeling modes')
  .option('--sparc', 'Initialize SPARC modes')
  .option('--event', 'Initialize Event Modeling modes')
  .action(initCommand);

// Start command
program
  .command('start')
  .description('Start the orchestrator')
  .option('--ui', 'Start with UI')
  .option('--port <number>', 'UI port', '3000')
  .action(startCommand);

// Status command
program
  .command('status')
  .description('Show system health and metrics')
  .action(statusCommand);

// SPARC command
program
  .command('sparc')
  .description('Run SPARC agent')
  .argument('<mode>', 'SPARC mode (architect, coder, tdd, security, devops, etc.)')
  .argument('[description]', 'Task description')
  .action(sparcCommand);

// Event command
program
  .command('event')
  .description('Run Event Modeling agent')
  .argument('<role>', 'Event Modeling role (modeler, timeline, ui, etc.)')
  .argument('[description]', 'Task description')
  .action(eventCommand);

// Agent command
program
  .command('agent')
  .description('Agent management')
  .argument('<action>', 'Action to perform (spawn, list, kill)')
  .argument('[name]', 'Agent name')
  .action(agentCommand);

// Memory command
program
  .command('memory')
  .description('Memory file operations')
  .argument('<action>', 'Action to perform (init, add/store, remove/delete, show/list)')
  .argument('[key]', 'Note content or pattern')
  .argument('[value]', 'Value (for backward compatibility)')
  .option('--global', 'Use global memory file (~/.agent.md)')
  .option('--repo', 'Use repository memory file (./.agent.md)')
  .action(memoryCommand);

// Swarm command
program
  .command('swarm')
  .description('Multi-agent coordination')
  .argument('<task>', 'Task description')
  .option('--parallel', 'Run agents in parallel')
  .option('--strategy <strategy>', 'Coordination strategy', 'development')
  .option('--max-agents <number>', 'Maximum number of agents', '3')
  .action(swarmCommand);

// ACLI integration command
program
  .command('acli')
  .description('Atlassian CLI (ACLI) integration for Rovo Dev')
  .argument('<action>', 'Action to perform (install, auth, run, setup)')
  .option('--interactive', 'Run in interactive mode')
  .option('--instruction <instruction>', 'Instruction to run in non-interactive mode')
  .action(acliCommand);

// Usage command
program
  .command('usage')
  .description('Show daily token usage')
  .action(usageCommand);

// Sessions command
program
  .command('sessions')
  .description('Session management')
  .option('--clear', 'Clear the current session')
  .option('--prune', 'Prune the current session to reduce token usage')
  .option('--switch <id>', 'Switch to a different session')
  .option('--list', 'List all sessions')
  .action(sessionsCommand);

// Instructions command
program
  .command('instructions')
  .description('Instructions management')
  .option('--list', 'List all instructions')
  .option('--add', 'Add a new instruction')
  .option('--remove <name>', 'Remove an instruction')
  .option('--run <name>', 'Run an instruction')
  .action(instructionsCommand);

// Feedback command
program
  .command('feedback')
  .description('Provide feedback or report a bug')
  .option('--bug', 'Report a bug')
  .option('--feature', 'Request a feature')
  .action(feedbackCommand);

// Interactive command
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .option('--prompt <prompt>', 'Initial prompt')
  .action(interactiveCommand);

// MCP command
program
  .command('mcp')
  .description('Model Context Protocol server management')
  .argument('<action>', 'Action to perform (start, stop, list, add, remove)')
  .option('--start <name>', 'Start an MCP server')
  .option('--stop <name>', 'Stop an MCP server')
  .option('--list', 'List all MCP servers')
  .option('--add', 'Add a new MCP server')
  .option('--remove <name>', 'Remove an MCP server')
  .action(mcpCommand);

// Display header
console.log(chalk.blue.bold('\n🤖 Rovo Code Flow - Multi-agent orchestration CLI\n'));

// Parse arguments
program.parse(process.argv);