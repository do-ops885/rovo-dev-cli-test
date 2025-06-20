/**
 * Atlassian CLI (ACLI) integration for Rovo Dev
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Config } from './config';

export class AcliIntegration {
  private config: Config;
  private rovodevConfigPath: string;

  constructor() {
    this.config = new Config();
    this.rovodevConfigPath = path.join(os.homedir(), '.rovodev');
  }

  /**
   * Check if ACLI is installed
   */
  public async isAcliInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const acli = spawn('acli', ['--version']);
      
      acli.on('error', () => {
        resolve(false);
      });
      
      acli.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Initialize Rovo Dev configuration
   */
  public async initRovoDev(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.rovodevConfigPath)) {
        fs.mkdirSync(this.rovodevConfigPath, { recursive: true });
      }
      
      // Create config.yml
      const configPath = path.join(this.rovodevConfigPath, 'config.yml');
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, this.getDefaultConfig());
      }
      
      // Create sessions directory
      const sessionsPath = path.join(this.rovodevConfigPath, 'sessions');
      if (!fs.existsSync(sessionsPath)) {
        fs.mkdirSync(sessionsPath, { recursive: true });
      }
      
      // Create instructions.yml
      const instructionsPath = path.join(this.rovodevConfigPath, 'instructions.yml');
      if (!fs.existsSync(instructionsPath)) {
        fs.writeFileSync(instructionsPath, this.getDefaultInstructions());
      }
      
      // Create mcp.json
      const mcpPath = path.join(this.rovodevConfigPath, 'mcp.json');
      if (!fs.existsSync(mcpPath)) {
        fs.writeFileSync(mcpPath, JSON.stringify({
          "web-fetcher": {
            "command": "npx",
            "args": ["-y", "fetcher-mcp"]
          }
        }, null, 2));
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Rovo Dev:', error);
      return false;
    }
  }

  /**
   * Run Rovo Dev auth login
   */
  public async authLogin(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(chalk.blue('Authenticating with Atlassian account...'));
      
      const acli = spawn('acli', ['rovodev', 'auth', 'login'], {
        stdio: 'inherit'
      });
      
      acli.on('error', (error) => {
        console.error(chalk.red('Authentication failed:'), error);
        resolve(false);
      });
      
      acli.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('Authentication successful!'));
          resolve(true);
        } else {
          console.error(chalk.red(`Authentication failed with code ${code}`));
          resolve(false);
        }
      });
    });
  }

  /**
   * Run Rovo Dev in interactive mode
   */
  public async runInteractive(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(chalk.blue('Starting Rovo Dev in interactive mode...'));
      
      const acli = spawn('acli', ['rovodev', 'run'], {
        stdio: 'inherit'
      });
      
      acli.on('error', (error) => {
        console.error(chalk.red('Failed to start Rovo Dev:'), error);
        resolve(false);
      });
      
      acli.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('Rovo Dev session completed.'));
          resolve(true);
        } else {
          console.error(chalk.red(`Rovo Dev exited with code ${code}`));
          resolve(false);
        }
      });
    });
  }

  /**
   * Run Rovo Dev with specific instruction
   */
  public async runWithInstruction(instruction: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(chalk.blue(`Running Rovo Dev with instruction: "${instruction}"`));
      
      const acli = spawn('acli', ['rovodev', 'run', instruction], {
        stdio: 'inherit'
      });
      
      acli.on('error', (error) => {
        console.error(chalk.red('Failed to run Rovo Dev:'), error);
        resolve(false);
      });
      
      acli.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('Rovo Dev instruction completed.'));
          resolve(true);
        } else {
          console.error(chalk.red(`Rovo Dev exited with code ${code}`));
          resolve(false);
        }
      });
    });
  }

  /**
   * Get default config.yml content
   */
  private getDefaultConfig(): string {
    return `# Rovo Dev Configuration

# Tool permissions
tools:
  # Example: always allow bash
  bash:
    allow: true
  
  # Example: always deny dangerous operations
  rm:
    allow: false

# MCP server settings
mcp:
  enabled: true
  timeout: 30000
`;
  }

  /**
   * Get default instructions.yml content
   */
  private getDefaultInstructions(): string {
    return `# Rovo Dev Instructions

instructions:
  - name: "Explain Codebase"
    prompt: "Explain this repository to me"
  
  - name: "Find Authentication Logic"
    prompt: "Where is the authentication logic defined?"
  
  - name: "Code Review"
    prompt: "Review this repository and make suggestions to improve readability and performance"
`;
  }
}