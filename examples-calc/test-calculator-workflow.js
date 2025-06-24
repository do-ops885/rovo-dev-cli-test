#!/usr/bin/env node

/**
 * Test script to validate the calculator development workflow
 * Tests a subset of commands to ensure the workflow is functional
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import chalk from 'chalk';

const ROVO_CLI_PATH = '../rovo-code-flow/dist/cli.js';

// Sample calculator workflow commands for testing
const CALCULATOR_WORKFLOW_TESTS = [
  {
    name: 'init-calculator-project',
    command: 'init',
    args: ['--sparc', '--event'],
    description: 'Initialize calculator project with both methodologies',
    timeout: 30000
  },
  {
    name: 'add-project-context',
    command: 'memory',
    args: ['add', 'Building a modern calculator with React and TypeScript'],
    options: ['--repo'],
    description: 'Add project context to memory',
    timeout: 15000
  },
  {
    name: 'architect-calculator-design',
    command: 'sparc',
    args: ['architect', 'Design a modular calculator architecture with React components'],
    description: 'Design calculator architecture',
    timeout: 45000
  },
  {
    name: 'model-calculation-workflow',
    command: 'event',
    args: ['modeler', 'Model the calculation workflow from input to display'],
    description: 'Model calculation workflow',
    timeout: 45000
  },
  {
    name: 'write-calculator-tests',
    command: 'sparc',
    args: ['tdd', 'Write tests for basic calculator operations'],
    description: 'Write calculator tests',
    timeout: 45000
  },
  {
    name: 'implement-calculator-engine',
    command: 'sparc',
    args: ['coder', 'Implement basic calculator engine with arithmetic operations'],
    description: 'Implement calculator engine',
    timeout: 60000
  },
  {
    name: 'security-review',
    command: 'sparc',
    args: ['security', 'Review calculator input validation and security'],
    description: 'Security review',
    timeout: 45000
  },
  {
    name: 'spawn-calculator-agent',
    command: 'agent',
    args: ['spawn', 'calculator-test-agent'],
    description: 'Spawn calculator agent',
    timeout: 30000
  },
  {
    name: 'list-agents',
    command: 'agent',
    args: ['list'],
    description: 'List active agents',
    timeout: 15000
  },
  {
    name: 'calculator-swarm',
    command: 'swarm',
    args: ['Implement calculator UI components'],
    options: ['--strategy', 'development', '--max-agents', '2'],
    description: 'Run calculator development swarm',
    timeout: 60000
  },
  {
    name: 'view-project-memory',
    command: 'memory',
    args: ['list'],
    options: ['--repo'],
    description: 'View project memory',
    timeout: 15000
  },
  {
    name: 'system-status',
    command: 'status',
    args: [],
    description: 'Check system status',
    timeout: 15000
  }
];

class CalculatorWorkflowTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runTest(test) {
    console.log(chalk.yellow(`\n🧪 Testing: ${test.name}`));
    console.log(chalk.gray(`   Description: ${test.description}`));

    const startTime = Date.now();
    
    try {
      const result = await this.executeCommand(test);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(chalk.green(`   ✅ PASSED (${duration}ms)`));
        this.results.push({
          name: test.name,
          status: 'passed',
          duration,
          output: result.output.substring(0, 200) + '...' // Truncate for readability
        });
      } else {
        console.log(chalk.red(`   ❌ FAILED (${duration}ms)`));
        console.log(chalk.red(`   Error: ${result.error}`));
        this.results.push({
          name: test.name,
          status: 'failed',
          duration,
          error: result.error,
          output: result.output.substring(0, 200) + '...'
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(chalk.red(`   ❌ ERROR (${duration}ms)`));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.results.push({
        name: test.name,
        status: 'error',
        duration,
        error: error.message
      });
    }
  }

  async executeCommand(test) {
    return new Promise((resolve) => {
      const args = [...test.args];
      if (test.options) {
        args.push(...test.options);
      }

      const child = spawn('node', [ROVO_CLI_PATH, test.command, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: './test-workspace'
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

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

  async setup() {
    console.log(chalk.blue('🚀 Setting up calculator workflow test environment...'));
    
    // Ensure test workspace exists
    try {
      await fs.mkdir('./test-workspace', { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    console.log(chalk.green('✅ Test environment ready'));
  }

  async runAllTests() {
    console.log(chalk.blue('🎯 Running Calculator Workflow Tests'));
    console.log('='.repeat(50));
    
    for (const test of CALCULATOR_WORKFLOW_TESTS) {
      await this.runTest(test);
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const totalDuration = Date.now() - this.startTime;

    console.log(chalk.blue('\n📊 CALCULATOR WORKFLOW TEST SUMMARY'));
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(chalk.red(`Errors: ${errors}`));
    console.log(`Total Duration: ${totalDuration}ms`);

    // Show failed tests
    if (failed > 0 || errors > 0) {
      console.log(chalk.red('\n❌ FAILED TESTS:'));
      this.results
        .filter(r => r.status === 'failed' || r.status === 'error')
        .forEach(result => {
          console.log(chalk.red(`  - ${result.name}: ${result.error}`));
        });
    }

    // Success rate
    const successRate = Math.round((passed / totalTests) * 100);
    console.log(chalk.blue(`\n🎯 Success Rate: ${successRate}%`));

    if (successRate >= 80) {
      console.log(chalk.green('🎉 Calculator workflow is ready for production use!'));
    } else if (successRate >= 60) {
      console.log(chalk.yellow('⚠️  Calculator workflow needs some adjustments.'));
    } else {
      console.log(chalk.red('🚨 Calculator workflow requires significant fixes.'));
    }

    return successRate >= 80;
  }
}

// Main execution
async function main() {
  const tester = new CalculatorWorkflowTester();
  
  try {
    await tester.setup();
    await tester.runAllTests();
    const success = tester.generateReport();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('💥 Calculator workflow test failed:'), error);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log(chalk.blue('Calculator Workflow Tester'));
  console.log('Tests a subset of the calculator development workflow commands');
  console.log('\nUsage:');
  console.log('  node test-calculator-workflow.js');
  console.log('  node test-calculator-workflow.js --help');
  process.exit(0);
}

main();