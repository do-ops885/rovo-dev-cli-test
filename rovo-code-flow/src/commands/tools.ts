/**
 * Tool permissions management commands
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { ToolPermissionsManager } from '../tool-permissions';

interface ToolsOptions {
  allow?: string;
  deny?: string;
  reset?: string;
  ask?: string;
}

export async function toolsCommand(action: string, options: ToolsOptions = {}): Promise<void> {
  const permissionsManager = new ToolPermissionsManager();
  
  switch (action) {
    case 'list':
      listTools(permissionsManager);
      break;
      
    case 'allow':
      if (options.allow) {
        allowTool(permissionsManager, options.allow);
      } else {
        await allowToolInteractive(permissionsManager);
      }
      break;
      
    case 'deny':
      if (options.deny) {
        denyTool(permissionsManager, options.deny);
      } else {
        await denyToolInteractive(permissionsManager);
      }
      break;
      
    case 'reset':
      if (options.reset) {
        if (options.reset === 'all') {
          resetAllTools(permissionsManager);
        } else {
          resetTool(permissionsManager, options.reset);
        }
      } else {
        await resetToolInteractive(permissionsManager);
      }
      break;
      
    case 'ask':
      if (options.ask) {
        setToolToAsk(permissionsManager, options.ask);
      } else {
        await setToolToAskInteractive(permissionsManager);
      }
      break;
      
    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.yellow('Available actions: list, allow, deny, reset, ask'));
  }
}

/**
 * List all tool permissions
 */
function listTools(permissionsManager: ToolPermissionsManager): void {
  const permissions = permissionsManager.getAllPermissions();
  const toolNames = Object.keys(permissions);
  
  if (toolNames.length === 0) {
    console.log(chalk.yellow('No tool permissions configured.'));
    return;
  }
  
  console.log(chalk.blue('Tool permissions:'));
  
  toolNames.sort().forEach(tool => {
    const permission = permissions[tool];
    
    let status;
    if (permission.allow) {
      status = chalk.green('ALLOWED');
    } else {
      status = chalk.red('DENIED');
    }
    
    const askStatus = permission.askEveryTime
      ? chalk.yellow('(ask every time)')
      : chalk.blue('(remembered)');
    
    console.log(`${tool}: ${status} ${askStatus}`);
  });
}

/**
 * Allow a tool
 */
function allowTool(permissionsManager: ToolPermissionsManager, tool: string): void {
  permissionsManager.setPermission(tool, true, false);
  console.log(chalk.green(`Tool "${tool}" is now allowed.`));
}

/**
 * Allow a tool interactively
 */
async function allowToolInteractive(permissionsManager: ToolPermissionsManager): Promise<void> {
  const { tool, askEveryTime } = await inquirer.prompt([
    {
      type: 'input',
      name: 'tool',
      message: 'Enter the name of the tool to allow:',
      validate: (input) => input.trim().length > 0 ? true : 'Tool name is required'
    },
    {
      type: 'confirm',
      name: 'askEveryTime',
      message: 'Ask for confirmation every time this tool is used?',
      default: false
    }
  ]);
  
  permissionsManager.setPermission(tool, true, askEveryTime);
  console.log(chalk.green(`Tool "${tool}" is now allowed.`));
}

/**
 * Deny a tool
 */
function denyTool(permissionsManager: ToolPermissionsManager, tool: string): void {
  permissionsManager.setPermission(tool, false, false);
  console.log(chalk.red(`Tool "${tool}" is now denied.`));
}

/**
 * Deny a tool interactively
 */
async function denyToolInteractive(permissionsManager: ToolPermissionsManager): Promise<void> {
  const { tool, askEveryTime } = await inquirer.prompt([
    {
      type: 'input',
      name: 'tool',
      message: 'Enter the name of the tool to deny:',
      validate: (input) => input.trim().length > 0 ? true : 'Tool name is required'
    },
    {
      type: 'confirm',
      name: 'askEveryTime',
      message: 'Ask for confirmation every time this tool is used?',
      default: false
    }
  ]);
  
  permissionsManager.setPermission(tool, false, askEveryTime);
  console.log(chalk.red(`Tool "${tool}" is now denied.`));
}

/**
 * Reset a tool's permission
 */
function resetTool(permissionsManager: ToolPermissionsManager, tool: string): void {
  permissionsManager.resetPermission(tool);
  console.log(chalk.yellow(`Permission for tool "${tool}" has been reset.`));
}

/**
 * Reset all tool permissions
 */
function resetAllTools(permissionsManager: ToolPermissionsManager): void {
  permissionsManager.resetAllPermissions();
  console.log(chalk.yellow('All tool permissions have been reset.'));
}

/**
 * Reset a tool's permission interactively
 */
async function resetToolInteractive(permissionsManager: ToolPermissionsManager): Promise<void> {
  const permissions = permissionsManager.getAllPermissions();
  const toolNames = Object.keys(permissions);
  
  if (toolNames.length === 0) {
    console.log(chalk.yellow('No tool permissions configured.'));
    return;
  }
  
  const choices = [...toolNames, 'all'];
  
  const { tool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tool',
      message: 'Select a tool to reset:',
      choices
    }
  ]);
  
  if (tool === 'all') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset all tool permissions?',
        default: false
      }
    ]);
    
    if (confirm) {
      resetAllTools(permissionsManager);
    } else {
      console.log(chalk.yellow('Operation cancelled.'));
    }
  } else {
    resetTool(permissionsManager, tool);
  }
}

/**
 * Set a tool to ask for permission every time
 */
function setToolToAsk(permissionsManager: ToolPermissionsManager, tool: string): void {
  const permissions = permissionsManager.getAllPermissions();
  const permission = permissions[tool];
  
  if (permission) {
    permissionsManager.setPermission(tool, permission.allow, true);
  } else {
    permissionsManager.setPermission(tool, false, true);
  }
  
  console.log(chalk.blue(`Tool "${tool}" will now ask for permission every time.`));
}

/**
 * Set a tool to ask for permission every time interactively
 */
async function setToolToAskInteractive(permissionsManager: ToolPermissionsManager): Promise<void> {
  const { tool } = await inquirer.prompt([
    {
      type: 'input',
      name: 'tool',
      message: 'Enter the name of the tool:',
      validate: (input) => input.trim().length > 0 ? true : 'Tool name is required'
    }
  ]);
  
  setToolToAsk(permissionsManager, tool);
}