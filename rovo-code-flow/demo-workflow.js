#!/usr/bin/env node

/**
 * Demo script showing the workflow management system
 */

const { spawn } = require('child_process');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Success');
        resolve();
      } else {
        console.log(`❌ Failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });
  });
}

async function demo() {
  console.log('\n🚀 Rovo Code Flow Workflow Demo');
  console.log('=====================================\n');

  try {
    // Build the project first
    console.log('Building the project...');
    await runCommand('npm', ['run', 'build']);

    console.log('\n📋 Step 1: Initialize workflow system');
    await runCommand('node', ['dist/cli.js', 'workflow', 'init']);

    console.log('\n📋 Step 2: List available templates');
    await runCommand('node', ['dist/cli.js', 'workflow', 'templates']);

    console.log('\n📋 Step 3: Start calculator workflow');
    await runCommand('node', ['dist/cli.js', 'workflow', 'start', 'calculator-development']);

    console.log('\n📋 Step 4: Check workflow status');
    await runCommand('node', ['dist/cli.js', 'workflow', 'status']);

    console.log('\n📋 Step 5: List workflow phases');
    await runCommand('node', ['dist/cli.js', 'workflow', 'phases']);

    console.log('\n📋 Step 6: Simulate running a SPARC command (this will auto-track progress)');
    await runCommand('node', ['dist/cli.js', 'sparc', 'architect', 'Design calculator architecture']);

    console.log('\n📋 Step 7: Check updated workflow status');
    await runCommand('node', ['dist/cli.js', 'workflow', 'status']);

    console.log('\n📋 Step 8: Check system status (includes workflow info)');
    await runCommand('node', ['dist/cli.js', 'status']);

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n💡 Try these commands:');
    console.log('• node dist/cli.js workflow resume - Continue with next phase');
    console.log('• node dist/cli.js workflow complete <phase-id> - Mark phase as done');
    console.log('• node dist/cli.js workflow skip <phase-id> - Skip a phase');
    console.log('• node dist/cli.js workflow reset - Reset workflow state');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
demo();