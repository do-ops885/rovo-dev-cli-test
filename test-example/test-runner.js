#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';

// Configuration
const ROVO_CLI_PATH = '../rovo-code-flow/dist/cli.js';
const TEST_WORKSPACE = './test-workspace';
const RESULTS_DIR = './results';

// Test categories and their commands
const TEST_CATEGORIES = {
  core: [
    {
      name: 'init-sparc',
      command: 'init',
      args: ['--sparc'],
      description: 'Initialize with SPARC modes'
    },
    {
      name: 'init-event',
      command: 'init',
      args: ['--event'],
      description: 'Initialize with Event Modeling modes'
    },
    {
      name: 'init-both',
      command: 'init',
      args: ['--sparc', '--event'],
      description: 'Initialize with both SPARC and Event Modeling modes'
    },
    {
      name: 'start-basic',
      command: 'start',
      args: [],
      description: 'Start orchestrator (basic)',
      timeout: 5000
    },
    {
      name: 'start-ui',
      command: 'start',
      args: ['--ui', '--port', '3001'],
      description: 'Start orchestrator with UI on port 3001',
      timeout: 5000
    },
    {
      name: 'interactive-with-prompt',
      command: 'interactive',
      args: ['--prompt', 'Hello, this is a test prompt'],
      description: 'Start interactive mode with initial prompt',
      timeout: 10000,
      input: '/exit\n'
    }
  ],
  agent: [
    {
      name: 'sparc-architect',
      command: 'sparc',
      args: ['architect', 'Design a simple authentication system'],
      description: 'Run SPARC architect agent'
    },
    {
      name: 'sparc-coder',
      command: 'sparc',
      args: ['coder', 'Implement a basic user login function'],
      description: 'Run SPARC coder agent'
    },
    {
      name: 'sparc-tdd',
      command: 'sparc',
      args: ['tdd', 'Write tests for user authentication'],
      description: 'Run SPARC TDD agent'
    },
    {
      name: 'sparc-security',
      command: 'sparc',
      args: ['security', 'Review authentication security'],
      description: 'Run SPARC security agent'
    },
    {
      name: 'sparc-devops',
      command: 'sparc',
      args: ['devops', 'Setup deployment pipeline'],
      description: 'Run SPARC DevOps agent'
    },
    {
      name: 'event-modeler',
      command: 'event',
      args: ['modeler', 'Model user registration flow'],
      description: 'Run Event Modeling modeler agent'
    },
    {
      name: 'event-timeline',
      command: 'event',
      args: ['timeline', 'Create timeline for user onboarding'],
      description: 'Run Event Modeling timeline agent'
    },
    {
      name: 'event-ui',
      command: 'event',
      args: ['ui', 'Map user interface for registration'],
      description: 'Run Event Modeling UI agent'
    },
    {
      name: 'event-state',
      command: 'event',
      args: ['state', 'Model user state transitions'],
      description: 'Run Event Modeling state agent'
    },
    {
      name: 'event-mapper',
      command: 'event',
      args: ['mapper', 'Map system components'],
      description: 'Run Event Modeling mapper agent'
    },
    {
      name: 'agent-spawn-coder',
      command: 'agent',
      args: ['spawn', 'test-coder'],
      description: 'Spawn a coder agent'
    },
    {
      name: 'agent-list',
      command: 'agent',
      args: ['list'],
      description: 'List all active agents'
    },
    {
      name: 'agent-kill',
      command: 'agent',
      args: ['kill', 'test-coder'],
      description: 'Kill the test-coder agent'
    },
    {
      name: 'swarm-development',
      command: 'swarm',
      args: ['Implement a complete user management system'],
      options: ['--strategy', 'development', '--max-agents', '2'],
      description: 'Run swarm with development strategy'
    },
    {
      name: 'swarm-parallel',
      command: 'swarm',
      args: ['Create API endpoints for user operations'],
      options: ['--parallel', '--strategy', 'implementation', '--max-agents', '3'],
      description: 'Run swarm in parallel mode'
    }
  ],
  system: [
    {
      name: 'status',
      command: 'status',
      args: [],
      description: 'Show system health and metrics'
    },
    {
      name: 'memory-init',
      command: 'memory',
      args: ['init'],
      description: 'Initialize memory files'
    },
    {
      name: 'memory-add-local',
      command: 'memory',
      args: ['add', 'This is a test note for local memory'],
      description: 'Add note to local memory'
    },
    {
      name: 'memory-add-global',
      command: 'memory',
      args: ['add', 'This is a test note for global memory'],
      options: ['--global'],
      description: 'Add note to global memory'
    },
    {
      name: 'memory-add-repo',
      command: 'memory',
      args: ['add', 'This is a test note for repo memory'],
      options: ['--repo'],
      description: 'Add note to repo memory'
    },
    {
      name: 'memory-list-local',
      command: 'memory',
      args: ['list'],
      description: 'List local memory contents'
    },
    {
      name: 'memory-list-global',
      command: 'memory',
      args: ['list'],
      options: ['--global'],
      description: 'List global memory contents'
    },
    {
      name: 'memory-remove',
      command: 'memory',
      args: ['remove', 'test note'],
      description: 'Remove note from memory'
    },
    {
      name: 'mcp-list',
      command: 'mcp',
      args: ['list'],
      description: 'List MCP servers'
    }
  ],
  tools: [
    {
      name: 'acli-install',
      command: 'acli',
      args: ['install'],
      description: 'Install/setup ACLI integration'
    },
    {
      name: 'acli-run-instruction',
      command: 'acli',
      args: ['run'],
      options: ['--instruction', 'Show me the current project structure'],
      description: 'Run ACLI with instruction'
    }
  ],
  utility: [
    {
      name: 'usage',
      command: 'usage',
      args: [],
      description: 'Show daily token usage'
    },
    {
      name: 'sessions-list',
      command: 'sessions',
      args: [],
      options: ['--list'],
      description: 'List all sessions'
    },
    {
      name: 'sessions-clear',
      command: 'sessions',
      args: [],
      options: ['--clear'],
      description: 'Clear current session'
    },
    {
      name: 'sessions-prune',
      command: 'sessions',
      args: [],
      options: ['--prune'],
      description: 'Prune current session'
    },
    {
      name: 'instructions-list',
      command: 'instructions',
      args: [],
      options: ['--list'],
      description: 'List all instructions'
    },
    {
      name: 'feedback-bug',
      command: 'feedback',
      args: [],
      options: ['--bug'],
      description: 'Report a bug (interactive)',
      timeout: 5000,
      input: 'n\n'
    },
    {
      name: 'feedback-feature',
      command: 'feedback',
      args: [],
      options: ['--feature'],
      description: 'Request a feature (interactive)',
      timeout: 5000,
      input: 'n\n'
    }
  ]
};

class TestRunner {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.category = options.category || null;
    this.results = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log(chalk.blue('Setting up test environment...'));
    
    // Create test workspace
    await this.ensureDir(TEST_WORKSPACE);
    await this.ensureDir(RESULTS_DIR);
    
    // Change to test workspace
    process.chdir(TEST_WORKSPACE);
    
    console.log(chalk.green('Test environment ready'));
  }

  async cleanup() {
    console.log(chalk.blue('Cleaning up test environment...'));
    
    // Return to original directory
    process.chdir('..');
    
    console.log(chalk.green('Cleanup complete'));
  }

  async ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async runTest(test) {
    const testName = `${test.name}`;
    console.log(chalk.yellow(`\nRunning test: ${testName}`));
    console.log(chalk.gray(`   Description: ${test.description}`));

    if (this.dryRun) {
      const command = this.buildCommand(test);
      console.log(chalk.cyan(`   Command: ${command}`));
      this.results.push({
        name: testName,
        status: 'skipped',
        command,
        duration: 0
      });
      return;
    }

    const startTime = Date.now();
    
    try {
      const result = await this.executeCommand(test);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(chalk.green(`   PASSED (${duration}ms)`));
        this.results.push({
          name: testName,
          status: 'passed',
          duration,
          output: result.output
        });
      } else {
        console.log(chalk.red(`   FAILED (${duration}ms)`));
        console.log(chalk.red(`   Error: ${result.error}`));
        this.results.push({
          name: testName,
          status: 'failed',
          duration,
          error: result.error,
          output: result.output
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(chalk.red(`   ERROR (${duration}ms)`));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.results.push({
        name: testName,
        status: 'error',
        duration,
        error: error.message
      });
    }
  }

  buildCommand(test) {
    const args = [...test.args];
    if (test.options) {
      args.push(...test.options);
    }
    return `node ${ROVO_CLI_PATH} ${test.command} ${args.join(' ')}`.trim();
  }

  async executeCommand(test) {
    return new Promise((resolve) => {
      const args = [...test.args];
      if (test.options) {
        args.push(...test.options);
      }

      const child = spawn('node', [ROVO_CLI_PATH, test.command, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        if (this.verbose) {
          console.log(chalk.gray(`   stdout: ${text.trim()}`));
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        if (this.verbose) {
          console.log(chalk.gray(`   stderr: ${text.trim()}`));
        }
      });

      // Handle input if specified
      if (test.input) {
        setTimeout(() => {
          child.stdin.write(test.input);
          child.stdin.end();
        }, 1000);
      }

      // Handle timeout
      const timeout = test.timeout || 30000;
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          success: false,
          error: `Command timed out after ${timeout}ms`,
          output,
          errorOutput
        });
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          success: code === 0,
          error: code !== 0 ? `Command exited with code ${code}` : null,
          output,
          errorOutput
        });
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          success: false,
          error: error.message,
          output,
          errorOutput
        });
      });
    });
  }

  async runCategory(categoryName) {
    const tests = TEST_CATEGORIES[categoryName];
    if (!tests) {
      console.log(chalk.red(`Unknown category: ${categoryName}`));
      return;
    }

    console.log(chalk.blue(`\nRunning ${categoryName.toUpperCase()} tests (${tests.length} tests)`));
    
    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async runAll() {
    console.log(chalk.blue('Running ALL tests'));
    
    for (const [categoryName, tests] of Object.entries(TEST_CATEGORIES)) {
      await this.runCategory(categoryName);
    }
  }

  async generateReport() {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = Date.now() - this.startTime;

    console.log(chalk.blue('\nTEST SUMMARY'));
    console.log(chalk.blue('================'));
    console.log(`Total Tests: ${totalTests}`);
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(chalk.red(`Errors: ${errors}`));
    console.log(chalk.yellow(`Skipped: ${skipped}`));
    console.log(`Total Duration: ${totalDuration}ms`);

    // Generate detailed report
    const report = {
      summary: {
        total: totalTests,
        passed,
        failed,
        errors,
        skipped,
        duration: totalDuration,
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    // Ensure results directory exists
    await this.ensureDir(RESULTS_DIR);
    const reportPath = path.join(RESULTS_DIR, `test-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.blue(`\nDetailed report saved to: ${reportPath}`));

    // Show failed tests
    if (failed > 0 || errors > 0) {
      console.log(chalk.red('\nFAILED TESTS:'));
      this.results
        .filter(r => r.status === 'failed' || r.status === 'error')
        .forEach(result => {
          console.log(chalk.red(`  - ${result.name}: ${result.error}`));
        });
    }

    return passed === totalTests;
  }
}

// CLI setup
const program = new Command();

program
  .name('test-runner')
  .description('Comprehensive test runner for rovo-code-flow CLI')
  .version('1.0.0')
  .option('-c, --category <category>', 'Run tests for specific category (core, agent, system, tools, utility)')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-d, --dry-run', 'Show commands without executing them')
  .action(async (options) => {
    const runner = new TestRunner(options);
    
    try {
      await runner.setup();
      
      if (options.category) {
        await runner.runCategory(options.category);
      } else {
        await runner.runAll();
      }
      
      const allPassed = await runner.generateReport();
      
      await runner.cleanup();
      
      process.exit(allPassed ? 0 : 1);
    } catch (error) {
      console.error(chalk.red('Test runner failed:'), error);
      process.exit(1);
    }
  });

// Show available categories
program
  .command('categories')
  .description('List available test categories')
  .action(() => {
    console.log(chalk.blue('Available test categories:'));
    Object.entries(TEST_CATEGORIES).forEach(([name, tests]) => {
      console.log(chalk.yellow(`  ${name}: ${tests.length} tests`));
    });
  });

program.parse();