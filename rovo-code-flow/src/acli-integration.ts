/**
 * Atlassian CLI (ACLI) integration for Rovo Dev
 */

import { spawn } from "child_process";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import os from "os";
import { Config } from "./config";
import { log } from "./utils";

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
};

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

export class AcliIntegration {
  private config: Config;
  private rovodevConfigPath: string;
  private retryConfig: RetryConfig;

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.config = new Config();
    this.rovodevConfigPath = path.join(os.homedir(), ".rovodev");

    // Set retry configuration
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }

  /**
   * Check if ACLI is installed
   */
  public async isAcliInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const acli = spawn("acli", ["--version"]);

      acli.on("error", () => {
        resolve(false);
      });

      acli.on("close", (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Initialize Rovo Dev configuration
   */
  public async initRovoDev(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.rovodevConfigPath)) {
        fs.mkdirSync(this.rovodevConfigPath, { recursive: true });
      }

      // Create config.yml
      const configPath = path.join(this.rovodevConfigPath, "config.yml");
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, this.getDefaultConfig());
      }

      // Create sessions directory
      const sessionsPath = path.join(this.rovodevConfigPath, "sessions");
      if (!fs.existsSync(sessionsPath)) {
        fs.mkdirSync(sessionsPath, { recursive: true });
      }

      // Create instructions.yml
      const instructionsPath = path.join(
        this.rovodevConfigPath,
        "instructions.yml",
      );
      if (!fs.existsSync(instructionsPath)) {
        fs.writeFileSync(instructionsPath, this.getDefaultInstructions());
      }

      // Create mcp.json
      const mcpPath = path.join(this.rovodevConfigPath, "mcp.json");
      if (!fs.existsSync(mcpPath)) {
        fs.writeFileSync(
          mcpPath,
          JSON.stringify(
            {
              "web-fetcher": {
                command: "npx",
                args: ["-y", "fetcher-mcp"],
              },
            },
            null,
            2,
          ),
        );
      }

      return true;
    } catch (error) {
      console.error("Error initializing Rovo Dev:", error);
      return false;
    }
  }

  /**
   * Run Rovo Dev auth login
   */
  public async authLogin(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(chalk.blue("Authenticating with Atlassian account..."));

      const acli = spawn("acli", ["rovodev", "auth", "login"], {
        stdio: "inherit",
      });

      acli.on("error", (error) => {
        console.error(chalk.red("Authentication failed:"), error);
        resolve(false);
      });

      acli.on("close", (code) => {
        if (code === 0) {
          console.log(chalk.green("Authentication successful!"));
          resolve(true);
        } else {
          console.error(chalk.red(`Authentication failed with code ${code}`));
          resolve(false);
        }
      });
    });
  }

  /**
   * Run Rovo Dev in interactive mode
   */
  public async runInteractive(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(chalk.blue("Starting Rovo Dev in interactive mode..."));

      const acli = spawn("acli", ["rovodev", "run"], {
        stdio: "inherit",
      });

      acli.on("error", (error) => {
        console.error(chalk.red("Failed to start Rovo Dev:"), error);
        resolve(false);
      });

      acli.on("close", (code) => {
        if (code === 0) {
          console.log(chalk.green("Rovo Dev session completed."));
          resolve(true);
        } else {
          console.error(chalk.red(`Rovo Dev exited with code ${code}`));
          resolve(false);
        }
      });
    });
  }

  /**
   * Run Rovo Dev with specific instruction
   */
  public async runWithInstruction(instruction: string): Promise<string> {
    return this.executeWithRetry(async () => {
      return new Promise<string>((resolve, reject) => {
        log(`Running Rovo Dev with instruction: "${instruction}"`, "info");

        let stdoutData = "";
        let stderrData = "";

        const acli = spawn("acli", ["rovodev", "run", instruction], {
          stdio: ["inherit", "pipe", "pipe"],
        });

        acli.stdout.on("data", (data) => {
          const chunk = data.toString();
          stdoutData += chunk;
          process.stdout.write(chunk);
        });

        acli.stderr.on("data", (data) => {
          const chunk = data.toString();
          stderrData += chunk;
          process.stderr.write(chunk);
        });

        acli.on("error", (error) => {
          log(`Failed to run Rovo Dev: ${error}`, "error");
          reject(new Error(`Failed to run Rovo Dev: ${error.message}`));
        });

        acli.on("close", (code) => {
          if (code === 0) {
            log("Rovo Dev instruction completed successfully", "success");
            resolve(stdoutData);
          } else {
            const errorMsg = `Rovo Dev exited with code ${code}`;
            log(errorMsg, "error");
            reject(new Error(errorMsg + (stderrData ? `: ${stderrData}` : "")));
          }
        });
      });
    }, "runWithInstruction");
  }

  /**
   * Execute a function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (
      let attempt = 1;
      attempt <= this.retryConfig.maxRetries + 1;
      attempt++
    ) {
      try {
        log(`Executing ${operationName} - attempt ${attempt}`, "info");
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt <= this.retryConfig.maxRetries) {
          log(
            `Error in ${operationName}: ${lastError.message}. Retrying in ${delay}ms...`,
            "warn",
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Exponential backoff with jitter
          delay = Math.min(
            delay * 2 * (0.9 + Math.random() * 0.2),
            this.retryConfig.maxDelayMs,
          );
        } else {
          // Max retries reached
          log(
            `${operationName} failed after ${this.retryConfig.maxRetries} retries: ${lastError.message}`,
            "error",
          );
          throw lastError;
        }
      }
    }

    // This should never happen due to the for loop structure, but TypeScript needs it
    throw lastError || new Error(`Unknown error in ${operationName}`);
  }

  /**
   * Get default config.yml content
   */
  private getDefaultConfig(): string {
    return `# Rovo Dev Configuration

# Tool permissions
tools:
  # Example: always allow bash
  bash:
    allow: true
  
  # Example: always deny dangerous operations
  rm:
    allow: false

# MCP server settings
mcp:
  enabled: true
  timeout: 30000
`;
  }

  /**
   * Get default instructions.yml content
   */
  private getDefaultInstructions(): string {
    return `# Rovo Dev Instructions

instructions:
  - name: "Explain Codebase"
    prompt: "Explain this repository to me"
  
  - name: "Find Authentication Logic"
    prompt: "Where is the authentication logic defined?"
  
  - name: "Code Review"
    prompt: "Review this repository and make suggestions to improve readability and performance"
`;
  }
}
