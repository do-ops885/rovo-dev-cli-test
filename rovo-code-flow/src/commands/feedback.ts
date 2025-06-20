/**
 * Feedback command for reporting bugs or providing feedback
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

interface FeedbackOptions {
  bug?: boolean;
  feature?: boolean;
}

export async function feedbackCommand(options: FeedbackOptions = {}): Promise<void> {
  console.log(chalk.blue('Rovo Dev CLI Feedback'));
  
  // Determine feedback type
  let feedbackType = 'general';
  
  if (options.bug) {
    feedbackType = 'bug';
  } else if (options.feature) {
    feedbackType = 'feature';
  } else {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of feedback would you like to provide?',
        choices: [
          { name: 'Report a bug', value: 'bug' },
          { name: 'Request a feature', value: 'feature' },
          { name: 'General feedback', value: 'general' }
        ]
      }
    ]);
    
    feedbackType = type;
  }
  
  // Get version information
  const version = await getVersion();
  
  // Get feedback details
  let feedbackDetails;
  
  if (feedbackType === 'bug') {
    feedbackDetails = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Provide a brief description of the bug:',
        validate: (input) => input.trim().length > 0 ? true : 'Description is required'
      },
      {
        type: 'input',
        name: 'steps',
        message: 'Steps to reproduce the bug:',
        validate: (input) => input.trim().length > 0 ? true : 'Steps are required'
      },
      {
        type: 'input',
        name: 'expected',
        message: 'What did you expect to happen?'
      },
      {
        type: 'input',
        name: 'actual',
        message: 'What actually happened?'
      },
      {
        type: 'confirm',
        name: 'includeLogs',
        message: 'Would you like to include logs in your report?',
        default: true
      }
    ]);
  } else if (feedbackType === 'feature') {
    feedbackDetails = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Provide a brief description of the feature:',
        validate: (input) => input.trim().length > 0 ? true : 'Description is required'
      },
      {
        type: 'input',
        name: 'useCase',
        message: 'What problem would this feature solve?'
      },
      {
        type: 'input',
        name: 'details',
        message: 'Any additional details about the feature:'
      }
    ]);
  } else {
    feedbackDetails = await inquirer.prompt([
      {
        type: 'input',
        name: 'feedback',
        message: 'Your feedback:',
        validate: (input) => input.trim().length > 0 ? true : 'Feedback is required'
      }
    ]);
  }
  
  // Collect system information
  const systemInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    nodeVersion: process.version,
    rovoVersion: version
  };
  
  // Collect logs if requested
  let logs = '';
  if (feedbackType === 'bug' && feedbackDetails.includeLogs) {
    logs = await collectLogs();
  }
  
  // Prepare feedback data
  const feedbackData = {
    type: feedbackType,
    details: feedbackDetails,
    systemInfo,
    logs
  };
  
  // Save feedback to file
  const feedbackDir = path.join(os.homedir(), '.rovodev', 'feedback');
  if (!fs.existsSync(feedbackDir)) {
    fs.mkdirSync(feedbackDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const feedbackPath = path.join(feedbackDir, `feedback-${feedbackType}-${timestamp}.json`);
  
  fs.writeFileSync(feedbackPath, JSON.stringify(feedbackData, null, 2));
  
  console.log(chalk.green('Thank you for your feedback!'));
  console.log(chalk.blue(`Your feedback has been saved to ${feedbackPath}`));
  
  // Provide instructions for submitting feedback
  console.log(chalk.yellow('\nTo submit your feedback:'));
  console.log('1. Go to https://atlassian.com/rovodev/feedback');
  console.log(`2. Upload the feedback file: ${feedbackPath}`);
  console.log('3. Complete the submission form');
  
  // Ask if user wants to open the feedback form
  const { openForm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openForm',
      message: 'Would you like to open the feedback form now?',
      default: true
    }
  ]);
  
  if (openForm) {
    openFeedbackForm();
  }
}

/**
 * Get Rovo Dev CLI version
 */
async function getVersion(): Promise<string> {
  return new Promise((resolve) => {
    const acli = spawn('acli', ['rovodev', '--version']);
    
    let versionOutput = '';
    
    acli.stdout.on('data', (data) => {
      versionOutput += data.toString();
    });
    
    acli.on('error', () => {
      resolve('unknown');
    });
    
    acli.on('close', () => {
      const match = versionOutput.match(/version\s+(\S+)/i);
      resolve(match ? match[1] : 'unknown');
    });
  });
}

/**
 * Collect logs
 */
async function collectLogs(): Promise<string> {
  try {
    const logPath = path.join(os.homedir(), '.rovodev', 'logs');
    
    if (!fs.existsSync(logPath)) {
      return 'No logs found';
    }
    
    // Get the most recent log file
    const logFiles = fs.readdirSync(logPath)
      .filter(file => file.endsWith('.log'))
      .sort()
      .reverse();
    
    if (logFiles.length === 0) {
      return 'No logs found';
    }
    
    const recentLog = path.join(logPath, logFiles[0]);
    return fs.readFileSync(recentLog, 'utf8');
  } catch (error) {
    return `Error collecting logs: ${error}`;
  }
}

/**
 * Open the feedback form in the default browser
 */
function openFeedbackForm(): void {
  const url = 'https://atlassian.com/rovodev/feedback';
  const platform = os.platform();
  
  let command;
  let args;
  
  switch (platform) {
    case 'darwin':
      command = 'open';
      args = [url];
      break;
    case 'win32':
      command = 'cmd';
      args = ['/c', 'start', url];
      break;
    default:
      command = 'xdg-open';
      args = [url];
      break;
  }
  
  spawn(command, args, { stdio: 'ignore' });
}