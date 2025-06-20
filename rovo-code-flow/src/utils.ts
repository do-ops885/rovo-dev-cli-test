/**
 * Utility functions for rovo-code-flow
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

/**
 * Log a message with a timestamp
 */
export function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
  const timestamp = new Date().toISOString();
  let coloredMessage;
  
  switch (level) {
    case 'info':
      coloredMessage = chalk.blue(message);
      break;
    case 'warn':
      coloredMessage = chalk.yellow(message);
      break;
    case 'error':
      coloredMessage = chalk.red(message);
      break;
    case 'success':
      coloredMessage = chalk.green(message);
      break;
  }
  
  console.log(`[${timestamp}] ${coloredMessage}`);
}

/**
 * Prompt the user for input
 */
export async function prompt(questions: any): Promise<any> {
  return inquirer.prompt(questions);
}

/**
 * Check if a string is valid JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Format duration in milliseconds to human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  
  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Debounce a function
 */
export function debounce(func: Function, wait: number): Function {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if a file is ignored by .gitignore
 */
export function isFileIgnored(filePath: string): boolean {
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    
    if (!fs.existsSync(gitignorePath)) {
      return false;
    }
    
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const patterns = gitignore
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'));
    
    const relativePath = path.relative(process.cwd(), filePath);
    
    for (const pattern of patterns) {
      // Simple pattern matching (could be improved with micromatch or similar)
      if (pattern.endsWith('/') && relativePath.startsWith(pattern)) {
        return true;
      }
      
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(relativePath)) {
          return true;
        }
      }
      
      if (relativePath === pattern) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if file is ignored:', error);
    return false;
  }
}

/**
 * Get user's daily token usage
 */
export function getDailyTokenUsage(): { used: number, limit: number } {
  try {
    const usagePath = path.join(os.homedir(), '.rovodev', 'usage.json');
    
    if (!fs.existsSync(usagePath)) {
      return { used: 0, limit: 1000000 }; // Default limit
    }
    
    const usage = JSON.parse(fs.readFileSync(usagePath, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    
    return {
      used: usage[today]?.tokens || 0,
      limit: usage.limit || 1000000
    };
  } catch (error) {
    console.error('Error getting token usage:', error);
    return { used: 0, limit: 1000000 };
  }
}

/**
 * Format token usage for display
 */
export function formatTokenUsage(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  const color = percentage > 90 ? 'red' : percentage > 70 ? 'yellow' : 'green';
  
  return chalk[color](`${used.toLocaleString()} / ${limit.toLocaleString()} tokens (${percentage.toFixed(1)}%)`);
}

/**
 * Check if a command is available
 */
export async function isCommandAvailable(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, ['--version']);
    
    proc.on('error', () => {
      resolve(false);
    });
    
    proc.on('close', (code: number) => {
      resolve(code === 0);
    });
  });
}

/**
 * Get session files
 */
export function getSessionFiles(): string[] {
  try {
    const sessionsPath = path.join(os.homedir(), '.rovodev', 'sessions');
    
    if (!fs.existsSync(sessionsPath)) {
      return [];
    }
    
    return fs.readdirSync(sessionsPath)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(sessionsPath, file));
  } catch (error) {
    console.error('Error getting session files:', error);
    return [];
  }
}

/**
 * Get session details
 */
export function getSessionDetails(sessionFile: string): any {
  try {
    if (!fs.existsSync(sessionFile)) {
      return null;
    }
    
    const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    
    return {
      id: path.basename(sessionFile, '.json'),
      created: new Date(session.created || 0),
      updated: new Date(session.updated || 0),
      messages: session.messages?.length || 0,
      title: session.title || 'Untitled Session'
    };
  } catch (error) {
    console.error('Error getting session details:', error);
    return null;
  }
}