/**
 * MCP server management commands
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { McpManager } from "../mcp-manager";

interface McpOptions {
  start?: string;
  stop?: string;
  list?: boolean;
  add?: boolean;
  remove?: string;
}

export async function mcpCommand(
  action: string,
  options: McpOptions = {},
): Promise<void> {
  const mcpManager = new McpManager();

  switch (action) {
    case "start":
      if (options.start) {
        await startServer(mcpManager, options.start);
      } else {
        await startServerInteractive(mcpManager);
      }
      break;

    case "stop":
      if (options.stop) {
        stopServer(mcpManager, options.stop);
      } else {
        await stopServerInteractive(mcpManager);
      }
      break;

    case "list":
      listServers(mcpManager);
      break;

    case "add":
      await addServer(mcpManager);
      break;

    case "remove":
      if (options.remove) {
        removeServer(mcpManager, options.remove);
      } else {
        await removeServerInteractive(mcpManager);
      }
      break;

    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(
        chalk.yellow("Available actions: start, stop, list, add, remove"),
      );
  }
}

/**
 * Start an MCP server
 */
async function startServer(
  mcpManager: McpManager,
  name: string,
): Promise<void> {
  const servers = mcpManager.getServers();

  if (!servers[name]) {
    console.log(chalk.red(`MCP server "${name}" not found.`));
    return;
  }

  mcpManager.startServer(name);
}

/**
 * Start an MCP server interactively
 */
async function startServerInteractive(mcpManager: McpManager): Promise<void> {
  const servers = mcpManager.getServers();
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0) {
    console.log(chalk.yellow("No MCP servers configured."));
    console.log(chalk.blue('Use "rovo-code-flow mcp add" to add a server.'));
    return;
  }

  const { name } = await inquirer.prompt([
    {
      type: "list",
      name: "name",
      message: "Select an MCP server to start:",
      choices: serverNames,
    },
  ]);

  mcpManager.startServer(name);
}

/**
 * Stop an MCP server
 */
function stopServer(mcpManager: McpManager, name: string): void {
  if (name === "all") {
    mcpManager.stopAllServers();
    console.log(chalk.green("All MCP servers stopped."));
    return;
  }

  mcpManager.stopServer(name);
}

/**
 * Stop an MCP server interactively
 */
async function stopServerInteractive(mcpManager: McpManager): Promise<void> {
  const runningServers = mcpManager.getRunningServers();

  if (runningServers.length === 0) {
    console.log(chalk.yellow("No MCP servers are currently running."));
    return;
  }

  const choices = [...runningServers, "all"];

  const { name } = await inquirer.prompt([
    {
      type: "list",
      name: "name",
      message: "Select an MCP server to stop:",
      choices,
    },
  ]);

  if (name === "all") {
    mcpManager.stopAllServers();
    console.log(chalk.green("All MCP servers stopped."));
  } else {
    mcpManager.stopServer(name);
  }
}

/**
 * List all configured MCP servers
 */
function listServers(mcpManager: McpManager): void {
  const servers = mcpManager.getServers();
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0) {
    console.log(chalk.yellow("No MCP servers configured."));
    return;
  }

  console.log(chalk.blue("Configured MCP servers:"));

  serverNames.forEach((name) => {
    const server = servers[name];
    const isRunning = mcpManager.isServerRunning(name);
    const status = isRunning ? chalk.green("running") : chalk.gray("stopped");

    console.log(`${name}: ${status}`);
    console.log(`  Command: ${server.command} ${server.args.join(" ")}`);
  });
}

/**
 * Add a new MCP server
 */
async function addServer(mcpManager: McpManager): Promise<void> {
  const { name, command, args } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a name for the MCP server:",
      validate: (input) =>
        input.trim().length > 0 ? true : "Name is required",
    },
    {
      type: "input",
      name: "command",
      message: "Enter the command to start the server:",
      validate: (input) =>
        input.trim().length > 0 ? true : "Command is required",
    },
    {
      type: "input",
      name: "args",
      message: "Enter command arguments (space-separated):",
      default: "",
    },
  ]);

  const argArray = args.trim() ? args.split(" ") : [];
  mcpManager.addServer(name, command, argArray);

  console.log(chalk.green(`MCP server "${name}" added.`));
}

/**
 * Remove an MCP server
 */
function removeServer(mcpManager: McpManager, name: string): void {
  const servers = mcpManager.getServers();

  if (!servers[name]) {
    console.log(chalk.red(`MCP server "${name}" not found.`));
    return;
  }

  // Stop the server if it's running
  if (mcpManager.isServerRunning(name)) {
    mcpManager.stopServer(name);
  }

  mcpManager.removeServer(name);
  console.log(chalk.green(`MCP server "${name}" removed.`));
}

/**
 * Remove an MCP server interactively
 */
async function removeServerInteractive(mcpManager: McpManager): Promise<void> {
  const servers = mcpManager.getServers();
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0) {
    console.log(chalk.yellow("No MCP servers configured."));
    return;
  }

  const { name } = await inquirer.prompt([
    {
      type: "list",
      name: "name",
      message: "Select an MCP server to remove:",
      choices: serverNames,
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to remove MCP server "${name}"?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  // Stop the server if it's running
  if (mcpManager.isServerRunning(name)) {
    mcpManager.stopServer(name);
  }

  mcpManager.removeServer(name);
  console.log(chalk.green(`MCP server "${name}" removed.`));
}
