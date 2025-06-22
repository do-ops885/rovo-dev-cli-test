/**
 * Model Context Protocol (MCP) server configuration manager
 */

import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import { spawn } from "child_process";

export interface McpServer {
  command: string;
  args: string[];
}

export class McpManager {
  private mcpConfigPath: string;
  private servers: Record<string, McpServer> = {};
  private activeServers: Map<string, any> = new Map();

  /**
   * Creates a new MCP Manager instance
   * @param configPath Optional custom path for the MCP configuration file (used for testing)
   */
  constructor(configPath?: string) {
    this.mcpConfigPath =
      configPath || path.join(os.homedir(), ".rovodev", "mcp.json");
    this.loadConfig();
  }

  /**
   * Load MCP configuration
   */
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.mcpConfigPath)) {
        const data = fs.readFileSync(this.mcpConfigPath, "utf8");
        try {
          this.servers = JSON.parse(data);
        } catch (parseError) {
          console.error(
            "Error parsing MCP configuration file, creating default config:",
            parseError,
          );
          this.createDefaultConfig();
        }
      } else {
        this.createDefaultConfig();
      }
    } catch (error) {
      console.error("Error loading MCP configuration:", error);
      this.createDefaultConfig();
    }
  }

  /**
   * Create default MCP configuration
   */
  private createDefaultConfig(): void {
    this.servers = {
      "web-fetcher": {
        command: "npx",
        args: ["-y", "fetcher-mcp"],
      },
    };
    this.saveConfig();
  }

  /**
   * Save MCP configuration
   */
  private saveConfig(): void {
    try {
      const dir = path.dirname(this.mcpConfigPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.mcpConfigPath,
        JSON.stringify(this.servers, null, 2),
      );
    } catch (error) {
      console.error("Error saving MCP configuration:", error);
    }
  }

  /**
   * Add a new MCP server
   */
  public addServer(name: string, command: string, args: string[]): void {
    this.servers[name] = { command, args };
    this.saveConfig();
  }

  /**
   * Remove an MCP server
   */
  public removeServer(name: string): boolean {
    if (this.servers[name]) {
      delete this.servers[name];
      this.saveConfig();
      return true;
    }
    return false;
  }

  /**
   * Get all configured MCP servers
   */
  public getServers(): Record<string, McpServer> {
    return { ...this.servers };
  }

  /**
   * Start an MCP server
   */
  public startServer(name: string): boolean {
    if (!this.servers[name]) {
      console.error(`MCP server "${name}" not found.`);
      return false;
    }

    if (this.activeServers.has(name)) {
      console.log(chalk.yellow(`MCP server "${name}" is already running.`));
      return true;
    }

    try {
      const server = this.servers[name];
      console.log(chalk.blue(`Starting MCP server "${name}"...`));

      const process = spawn(server.command, server.args, {
        stdio: "pipe",
        detached: true,
      });

      process.stdout.on("data", (data) => {
        console.log(chalk.gray(`[${name}] ${data.toString().trim()}`));
      });

      process.stderr.on("data", (data) => {
        console.error(chalk.red(`[${name}] ${data.toString().trim()}`));
      });

      process.on("error", (error) => {
        console.error(chalk.red(`Error starting MCP server "${name}":`, error));
        this.activeServers.delete(name);
      });

      process.on("close", (code) => {
        console.log(
          chalk.yellow(`MCP server "${name}" exited with code ${code}.`),
        );
        this.activeServers.delete(name);
      });

      this.activeServers.set(name, process);
      console.log(chalk.green(`MCP server "${name}" started.`));

      return true;
    } catch (error) {
      console.error(chalk.red(`Error starting MCP server "${name}":`, error));
      return false;
    }
  }

  /**
   * Stop an MCP server
   */
  public stopServer(name: string): boolean {
    if (!this.activeServers.has(name)) {
      console.log(chalk.yellow(`MCP server "${name}" is not running.`));
      return false;
    }

    try {
      const process = this.activeServers.get(name);

      if (process.kill) {
        process.kill();
      }

      this.activeServers.delete(name);
      console.log(chalk.green(`MCP server "${name}" stopped.`));

      return true;
    } catch (error) {
      console.error(chalk.red(`Error stopping MCP server "${name}":`, error));
      return false;
    }
  }

  /**
   * Stop all running MCP servers
   */
  public stopAllServers(): void {
    for (const name of this.activeServers.keys()) {
      this.stopServer(name);
    }
  }

  /**
   * Check if an MCP server is running
   */
  public isServerRunning(name: string): boolean {
    return this.activeServers.has(name);
  }

  /**
   * Get all running MCP servers
   */
  public getRunningServers(): string[] {
    return Array.from(this.activeServers.keys());
  }
}
