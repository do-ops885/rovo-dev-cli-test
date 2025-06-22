/**
 * Tool permissions manager for Rovo Dev
 */

import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import inquirer from "inquirer";
import yaml from "yaml";

export interface ToolPermission {
  allow: boolean;
  askEveryTime?: boolean;
}

export class ToolPermissionsManager {
  private configPath: string;
  private permissions: Record<string, ToolPermission> = {};

  constructor() {
    this.configPath = path.join(os.homedir(), ".rovodev", "config.yml");
    this.loadPermissions();
  }

  /**
   * Load permissions from config file
   */
  private loadPermissions(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        // yaml is now imported at the top of the file
        const content = fs.readFileSync(this.configPath, "utf8");
        const config = yaml.parse(content);

        if (config && config.tools) {
          this.permissions = config.tools;
        }
      } else {
        // Create default permissions
        this.permissions = {
          bash: { allow: true, askEveryTime: false },
          rm: { allow: false, askEveryTime: true },
          curl: { allow: true, askEveryTime: true },
          wget: { allow: true, askEveryTime: true },
          npm: { allow: true, askEveryTime: false },
          pip: { allow: true, askEveryTime: false },
          git: { allow: true, askEveryTime: false },
        };

        this.savePermissions();
      }
    } catch (error) {
      console.error("Error loading tool permissions:", error);
    }
  }

  /**
   * Save permissions to config file
   */
  private savePermissions(): void {
    try {
      // yaml is now imported at the top of the file

      // Read existing config
      let config = {};
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, "utf8");
        config = yaml.parse(content) || {};
      }

      // Update tools section
      const configObj = config as { tools?: Record<string, ToolPermission> };
      configObj.tools = this.permissions;

      // Create directory if it doesn't exist
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write config
      fs.writeFileSync(this.configPath, yaml.stringify(config));
    } catch (error) {
      console.error("Error saving tool permissions:", error);
    }
  }

  /**
   * Check if a tool is allowed
   */
  public isToolAllowed(tool: string): boolean | null {
    const permission = this.permissions[tool];

    if (!permission) {
      return null; // Unknown tool
    }

    if (permission.askEveryTime) {
      return null; // Need to ask
    }

    return permission.allow;
  }

  /**
   * Ask for permission to use a tool
   */
  public async askPermission(
    tool: string,
    description?: string,
  ): Promise<boolean> {
    console.log(
      chalk.yellow(
        `\nRovo Dev is requesting permission to use the "${tool}" tool.`,
      ),
    );

    if (description) {
      console.log(chalk.blue(`Purpose: ${description}`));
    }

    const { allow, remember } = await inquirer.prompt([
      {
        type: "confirm",
        name: "allow",
        message: `Allow "${tool}" to be used?`,
        default: false,
      },
      {
        type: "confirm",
        name: "remember",
        message: "Remember this decision?",
        default: true,
      },
    ]);

    // Update permissions
    this.permissions[tool] = {
      allow,
      askEveryTime: !remember,
    };

    this.savePermissions();

    return allow;
  }

  /**
   * Set permission for a tool
   */
  public setPermission(
    tool: string,
    allow: boolean,
    askEveryTime: boolean = false,
  ): void {
    this.permissions[tool] = { allow, askEveryTime };
    this.savePermissions();
  }

  /**
   * Get all tool permissions
   */
  public getAllPermissions(): Record<string, ToolPermission> {
    return { ...this.permissions };
  }

  /**
   * Reset permissions for a tool
   */
  public resetPermission(tool: string): void {
    if (this.permissions[tool]) {
      delete this.permissions[tool];
      this.savePermissions();
    }
  }

  /**
   * Reset all permissions
   */
  public resetAllPermissions(): void {
    this.permissions = {};
    this.savePermissions();
  }
}
