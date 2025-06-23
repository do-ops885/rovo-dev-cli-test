#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

const ROVO_CLI_PATH = '../rovo-code-flow/dist/cli.js';

async function validateSetup() {
  console.log(chalk.blue('🔍 Validating test setup...'));
  
  let allValid = true;
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    console.log(chalk.green(`✅ Node.js version: ${nodeVersion}`));
  } else {
    console.log(chalk.red(`❌ Node.js version ${nodeVersion} is too old. Requires 18+`));
    allValid = false;
  }
  
  // Check if rovo-code-flow CLI exists
  try {
    await fs.access(ROVO_CLI_PATH);
    console.log(chalk.green('✅ Rovo Code Flow CLI found'));
  } catch (error) {
    console.log(chalk.red('❌ Rovo Code Flow CLI not found. Run setup.sh first.'));
    allValid = false;
  }
  
  // Check if dependencies are installed
  try {
    await fs.access('./node_modules');
    console.log(chalk.green('✅ Dependencies installed'));
  } catch (error) {
    console.log(chalk.red('❌ Dependencies not installed. Run npm install.'));
    allValid = false;
  }
  
  // Check if test directories exist
  const requiredDirs = ['results', 'test-workspace', 'test-scenarios', 'test-data'];
  for (const dir of requiredDirs) {
    try {
      await fs.access(dir);
      console.log(chalk.green(`✅ Directory exists: ${dir}`));
    } catch (error) {
      console.log(chalk.red(`❌ Directory missing: ${dir}`));
      allValid = false;
    }
  }
  
  // Check if test runner is executable
  try {
    await fs.access('./test-runner.js');
    console.log(chalk.green('✅ Test runner found'));
  } catch (error) {
    console.log(chalk.red('❌ Test runner not found'));
    allValid = false;
  }
  
  // Test basic CLI functionality
  console.log(chalk.blue('\n🧪 Testing basic CLI functionality...'));
  
  try {
    const { spawn } = await import('child_process');
    
    const testResult = await new Promise((resolve) => {
      const child = spawn('node', [ROVO_CLI_PATH, '--help'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, output });
      });
      
      child.on('error', (error) => {
        resolve({ code: -1, error: error.message });
      });
    });
    
    if (testResult.code === 0 && testResult.output.includes('rovo-code-flow')) {
      console.log(chalk.green('✅ CLI responds to --help'));
    } else {
      console.log(chalk.red('❌ CLI not responding correctly'));
      allValid = false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error testing CLI: ${error.message}`));
    allValid = false;
  }
  
  // Summary
  console.log(chalk.blue('\n📋 Validation Summary'));
  console.log('='.repeat(50));
  
  if (allValid) {
    console.log(chalk.green('🎉 All validations passed! Ready to run tests.'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('  npm test                 # Run all tests');
    console.log('  npm run test:dry-run     # Preview tests');
    console.log('  node test-runner.js categories  # List test categories');
  } else {
    console.log(chalk.red('❌ Some validations failed. Please fix the issues above.'));
    console.log(chalk.yellow('\nTroubleshooting:'));
    console.log('  ./setup.sh               # Run setup script');
    console.log('  npm install              # Install dependencies');
    console.log('  cd ../rovo-code-flow && npm run build  # Build CLI');
  }
  
  return allValid;
}

// Run validation
validateSetup()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error(chalk.red('💥 Validation failed:'), error);
    process.exit(1);
  });