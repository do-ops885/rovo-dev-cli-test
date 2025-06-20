/**
 * Configuration management for rovo-code-flow
 */

import fs from "fs";
import path from "path";
import os from "os";

export class Config {
  private configPath: string;
  private config: Record<string, any> = {};

  constructor(configPath?: string) {
    this.configPath =
      configPath || path.join(os.homedir(), ".rovo-code-flow", "config.json");
    this.load();
  }

  /**
   * Load configuration from file
   */
  private load(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        this.config = JSON.parse(data);
      } else {
        // Create default config
        this.config = {
          sparc: {
            enabled: true,
            modes: ["architect", "coder", "tdd", "security", "devops"],
          },
          event: {
            enabled: false,
            roles: ["modeler", "timeline", "ui", "state", "mapper"],
          },
          ui: {
            enabled: false,
            port: 3000,
          },
          memory: {
            persistence: true,
            encryptionEnabled: false,
          },
        };
        this.save();
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    }
  }

  /**
   * Save configuration to file
   */
  public save(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  }

  /**
   * Get a configuration value
   */
  public get(key: string, defaultValue?: any): any {
    const parts = key.split(".");
    let current = this.config;

    for (const part of parts) {
      if (current[part] === undefined) {
        return defaultValue;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Set a configuration value
   */
  public set(key: string, value: any): void {
    const parts = key.split(".");
    let current = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    this.save();
  }

  /**
   * Get the entire configuration
   */
  public getAll(): Record<string, any> {
    return this.config;
  }
}
