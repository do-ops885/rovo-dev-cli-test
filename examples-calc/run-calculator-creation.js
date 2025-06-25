#!/usr/bin/env node

/**
 * Script to run the calculator creation process
 * This script executes the necessary commands to create the calculator app
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROVO_CLI_PATH = path.resolve(__dirname, '../rovo-code-flow/dist/cli.js');
const WORKSPACE_DIR = './calculator-app';

// Calculator creation steps
const CREATION_STEPS = [
  {
    name: 'Initialize Project',
    command: 'init',
    args: ['--sparc', '--event'],
    description: 'Initialize calculator project with both methodologies'
  },
  {
    name: 'Add Project Context',
    command: 'memory',
    args: ['add', 'Building a modern calculator with React and TypeScript'],
    options: ['--repo'],
    description: 'Add project context to memory'
  },
  {
    name: 'Initialize Workflow',
    command: 'workflow',
    args: ['init'],
    description: 'Initialize workflow management system'
  },
  {
    name: 'Design Architecture',
    command: 'sparc',
    args: ['architect', 'Design a modular calculator architecture with React components'],
    description: 'Design calculator architecture'
  },
  {
    name: 'Model Calculation Flow',
    command: 'event',
    args: ['modeler', 'Model the calculation workflow from input to display'],
    description: 'Model calculation workflow'
  },
  {
    name: 'Write Tests',
    command: 'sparc',
    args: ['tdd', 'Write tests for basic calculator operations'],
    description: 'Write calculator tests'
  },
  {
    name: 'Implement Engine',
    command: 'sparc',
    args: ['coder', 'Implement basic calculator engine with arithmetic operations'],
    description: 'Implement calculator engine'
  },
  {
    name: 'Security Review',
    command: 'sparc',
    args: ['security', 'Review calculator input validation and security'],
    description: 'Security review'
  },
  {
    name: 'Check Status',
    command: 'status',
    args: [],
    description: 'Check system status'
  }
];

// Execute a command and return the result
async function executeCommand(step) {
  return new Promise((resolve) => {
    console.log(chalk.yellow(`\n🧪 Running: ${step.name}`));
    console.log(chalk.gray(`   Description: ${step.description}`));
    
    const args = [...step.args];
    if (step.options) {
      args.push(...step.options);
    }
    
    console.log(chalk.gray(`   Command: node ${ROVO_CLI_PATH} ${step.command} ${args.join(' ')}`));
    
    const child = spawn('node', [ROVO_CLI_PATH, step.command, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: WORKSPACE_DIR
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(chalk.gray(`   ${text}`));
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(chalk.red(`   ${text}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`   ✅ Success: ${step.name}`));
        resolve({
          success: true,
          output
        });
      } else {
        console.log(chalk.red(`   ❌ Failed: ${step.name} (exit code: ${code})`));
        resolve({
          success: false,
          error: `Command exited with code ${code}`,
          output
        });
      }
    });

    child.on('error', (error) => {
      console.log(chalk.red(`   ❌ Error: ${error.message}`));
      resolve({
        success: false,
        error: error.message,
        output
      });
    });
  });
}

// Main function to run the calculator creation process
async function main() {
  console.log(chalk.blue('🚀 Starting Calculator Creation Process'));
  console.log('='.repeat(50));
  
  // Create workspace directory
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
    console.log(chalk.green(`✅ Created workspace directory: ${WORKSPACE_DIR}`));
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(chalk.red(`❌ Error creating workspace: ${error.message}`));
      process.exit(1);
    }
  }
  
  // Run each step
  let allSuccess = true;
  for (const step of CREATION_STEPS) {
    const result = await executeCommand(step);
    if (!result.success) {
      allSuccess = false;
      console.log(chalk.red(`❌ Step failed: ${step.name}`));
      // Continue with next steps even if one fails
    }
  }
  
  // Final summary
  console.log(chalk.blue('\n📊 Calculator Creation Summary'));
  console.log('='.repeat(50));
  
  if (allSuccess) {
    console.log(chalk.green('🎉 Calculator creation completed successfully!'));
  } else {
    console.log(chalk.yellow('⚠️ Calculator creation completed with some issues.'));
  }
  
  console.log(chalk.blue('\n📁 Created files:'));
  try {
    const files = await fs.readdir(WORKSPACE_DIR);
    for (const file of files) {
      const stats = await fs.stat(path.join(WORKSPACE_DIR, file));
      if (stats.isDirectory()) {
        console.log(chalk.cyan(`   📂 ${file}/`));
      } else {
        console.log(chalk.gray(`   📄 ${file}`));
      }
    }
  } catch (error) {
    console.log(chalk.red(`   Error listing files: ${error.message}`));
  }
  
  console.log(chalk.blue('\n🔍 Next steps:'));
  console.log('1. Explore the calculator app in the workspace directory');
  console.log('2. Run additional commands to extend functionality');
  console.log('3. Test the calculator with sample calculations');
}

// Run the script
main().catch(error => {
  console.error(chalk.red(`❌ Error: ${error.message}`));
  process.exit(1);
});