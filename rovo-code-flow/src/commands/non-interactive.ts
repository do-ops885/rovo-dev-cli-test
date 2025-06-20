/**
 * Non-interactive mode command handler
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { AcliIntegration } from '../acli-integration';
import { McpManager } from '../mcp-manager';

interface NonInteractiveOptions {
  mcp?: boolean;
  timeout?: number;
  verbose?: boolean;
}

export async function nonInteractiveCommand(instruction: string, options: NonInteractiveOptions = {}): Promise<void> {
  console.log(chalk.blue(`Running in non-interactive mode: "${instruction}"`));
  
  // Start MCP servers if requested
  if (options.mcp) {
    await startMcpServers();
  }
  
  try {
    // Set timeout
    const timeout = options.timeout || 300000; // Default 5 minutes
    
    // Run the instruction
    const acli = new AcliIntegration();
    
    if (options.verbose) {
      console.log(chalk.yellow('Verbose mode enabled. Showing detailed output.'));
    }
    
    // Create a promise that resolves when the instruction completes or times out
    const result = await Promise.race([
      acli.runWithInstruction(instruction),
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.log(chalk.red(`Instruction timed out after ${timeout / 1000} seconds.`));
          resolve(false);
        }, timeout);
      })
    ]);
    
    if (result) {
      console.log(chalk.green('Instruction completed successfully.'));
    } else {
      console.log(chalk.red('Instruction failed or timed out.'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error executing instruction:'), error);
    process.exit(1);
  } finally {
    // Stop MCP servers if they were started
    if (options.mcp) {
      await stopMcpServers();
    }
  }
}

/**
 * Start all configured MCP servers
 */
async function startMcpServers(): Promise<void> {
  const mcpManager = new McpManager();
  const servers = mcpManager.getServers();
  
  console.log(chalk.blue('Starting MCP servers...'));
  
  for (const [name, _] of Object.entries(servers)) {
    mcpManager.startServer(name);
  }
  
  // Give servers time to start
  await new Promise(resolve => setTimeout(resolve, 2000));
}

/**
 * Stop all running MCP servers
 */
async function stopMcpServers(): Promise<void> {
  const mcpManager = new McpManager();
  
  console.log(chalk.blue('Stopping MCP servers...'));
  mcpManager.stopAllServers();
}

/**
 * Save instruction result to file
 */
export function saveInstructionResult(instruction: string, result: string): void {
  try {
    const resultsDir = path.join(os.homedir(), '.rovodev', 'results');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `result-${timestamp}.md`;
    const resultPath = path.join(resultsDir, filename);
    
    const content = `# Instruction Result\n\n## Instruction\n\n${instruction}\n\n## Result\n\n${result}`;
    
    fs.writeFileSync(resultPath, content);
    
    console.log(chalk.green(`Result saved to ${resultPath}`));
  } catch (error) {
    console.error(chalk.red('Error saving result:'), error);
  }
}