#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Run a specific test file
try {
  console.log('Running file-lock-manager.test.ts, agent-file-locking.test.ts, and orchestrator-file-locking.test.ts...');
  const output = execSync('npx vitest run tests/file-lock-manager.test.ts tests/agent-file-locking.test.ts tests/orchestrator-file-locking.test.ts', { encoding: 'utf8' });
  console.log(output);
  console.log('Test completed successfully!');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}