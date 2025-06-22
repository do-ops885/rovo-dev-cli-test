/**
 * Memory file management for Rovo Dev
 */

import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import { validateFilePath } from "./utils";

export class MemoryFileManager {
  private globalMemoryPath: string;
  private localMemoryPath: string;
  private repoMemoryPath: string;

  constructor() {
    this.globalMemoryPath = path.join(os.homedir(), ".agent.md");
    this.localMemoryPath = path.join(process.cwd(), ".agent.local.md");
    this.repoMemoryPath = path.join(process.cwd(), ".agent.md");
  }

  /**
   * Initialize memory files
   */
  public async initMemoryFiles(): Promise<void> {
    try {
      // Create global memory file if it doesn't exist
      if (!fs.existsSync(this.globalMemoryPath)) {
        fs.writeFileSync(this.globalMemoryPath, this.getDefaultGlobalMemory());
        console.log(
          chalk.green(`Created global memory file at ${this.globalMemoryPath}`),
        );
      }

      // Create local memory file if it doesn't exist
      if (!fs.existsSync(this.localMemoryPath)) {
        fs.writeFileSync(this.localMemoryPath, this.getDefaultLocalMemory());
        console.log(
          chalk.green(`Created local memory file at ${this.localMemoryPath}`),
        );
      }
    } catch (error) {
      console.error(chalk.red("Error initializing memory files:"), error);
    }
  }

  /**
   * Add a note to a memory file
   */
  public async addNote(
    note: string,
    target: "global" | "local" | "repo" = "local",
  ): Promise<boolean> {
    try {
      const memoryPath = this.getMemoryPath(target);

      if (!fs.existsSync(memoryPath)) {
        if (target === "repo") {
          // For repo memory, create it if it doesn't exist
          fs.writeFileSync(
            memoryPath,
            `# ${path.basename(process.cwd())} Team Memory\n\n${note}\n`,
          );
        } else {
          // For other memory types, create with default content and add the note
          const defaultContent =
            target === "global"
              ? this.getDefaultGlobalMemory()
              : this.getDefaultLocalMemory();
          fs.writeFileSync(memoryPath, `${defaultContent}\n${note}\n`);
        }
      } else {
        // Append to existing file
        const content = fs.readFileSync(memoryPath, "utf8");
        fs.writeFileSync(memoryPath, `${content}\n${note}\n`);
      }

      console.log(chalk.green(`Added note to ${target} memory file.`));
      return true;
    } catch (error) {
      console.error(
        chalk.red(`Error adding note to ${target} memory file:`),
        error,
      );
      return false;
    }
  }

  /**
   * Remove a note from a memory file
   */
  public async removeNote(
    notePattern: string,
    target: "global" | "local" | "repo" = "local",
  ): Promise<boolean> {
    try {
      const memoryPath = this.getMemoryPath(target);

      if (!fs.existsSync(memoryPath)) {
        console.log(chalk.yellow(`${target} memory file does not exist.`));
        return false;
      }

      const content = fs.readFileSync(memoryPath, "utf8");
      const regex = new RegExp(`.*${notePattern}.*\\n?`, "g");
      const newContent = content.replace(regex, "");

      if (content === newContent) {
        console.log(chalk.yellow(`Note not found in ${target} memory file.`));
        return false;
      }

      fs.writeFileSync(memoryPath, newContent);
      console.log(chalk.green(`Removed note from ${target} memory file.`));
      return true;
    } catch (error) {
      console.error(
        chalk.red(`Error removing note from ${target} memory file:`),
        error,
      );
      return false;
    }
  }

  /**
   * Initialize memory file with repository information
   */
  public async initWithRepoInfo(): Promise<boolean> {
    try {
      console.log(chalk.blue("Analyzing repository structure..."));

      // Get directory structure
      const dirStructure = await this.getDirectoryStructure(process.cwd(), 2);

      // Get package.json info if available
      let packageInfo = "";
      const packagePath = path.join(process.cwd(), "package.json");

      if (fs.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
          packageInfo = `
## Project Information

- **Name**: ${packageJson.name || "Unknown"}
- **Description**: ${packageJson.description || "No description"}
- **Version**: ${packageJson.version || "Unknown"}
- **Main technologies**: ${Object.keys(packageJson.dependencies || {}).join(", ")}
`;
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _error
        ) {
          // Error is intentionally ignored
          packageInfo = "";
        }
      }

      const memoryContent = `# Repository Memory

This memory file contains information about the repository structure and coding standards.

## Repository Structure

\`\`\`
${dirStructure}
\`\`\`
${packageInfo}

## Coding Standards

- Follow consistent naming conventions
- Write clear and concise comments
- Include unit tests for new functionality
- Follow the existing code style

## Common Commands

- \`npm install\`: Install dependencies
- \`npm run build\`: Build the project
- \`npm test\`: Run tests
`;

      fs.writeFileSync(this.localMemoryPath, memoryContent);
      console.log(
        chalk.green(
          `Created repository memory file at ${this.localMemoryPath}`,
        ),
      );
      return true;
    } catch (error) {
      console.error(chalk.red("Error initializing repository memory:"), error);
      return false;
    }
  }

  /**
   * Get memory file path based on target
   */
  private getMemoryPath(target: "global" | "local" | "repo"): string {
    let memoryPath: string;

    switch (target) {
      case "global":
        memoryPath = this.globalMemoryPath;
        break;
      case "local":
        memoryPath = this.localMemoryPath;
        break;
      case "repo":
        memoryPath = this.repoMemoryPath;
        break;
    }

    // Validate the path to prevent path traversal attacks
    const allowedBasePaths = [os.homedir(), process.cwd()];

    return validateFilePath(memoryPath, allowedBasePaths);
  }

  /**
   * Get default global memory content
   */
  private getDefaultGlobalMemory(): string {
    return `# Global Memory

This file contains your personal instructions that apply to all projects when using Rovo Dev CLI.

## Preferences

- Preferred programming language: JavaScript/TypeScript
- Code style: Follow standard conventions
- Documentation style: JSDoc

## Common Instructions

- When explaining code, focus on the high-level architecture first
- When generating code, include comprehensive error handling
- When reviewing code, check for security issues and performance bottlenecks
`;
  }

  /**
   * Get default local memory content
   */
  private getDefaultLocalMemory(): string {
    return `# Local Repository Memory

This file contains your personal instructions specific to this repository when using Rovo Dev CLI.

## Repository Context

- Purpose: [Add repository purpose here]
- Key components: [List key components here]
- Architecture: [Describe architecture here]

## Development Workflow

- Branch naming: feature/[feature-name], bugfix/[bug-name]
- Commit messages: Follow conventional commits (feat:, fix:, docs:, etc.)
- Pull request process: Create PR, request review, address feedback, merge
`;
  }

  /**
   * Get directory structure as a string
   */
  private async getDirectoryStructure(
    dir: string,
    depth: number = 2,
    currentDepth: number = 0,
  ): Promise<string> {
    if (currentDepth > depth) {
      return "";
    }

    try {
      const items = fs.readdirSync(dir);
      let result = "";

      for (const item of items) {
        // Skip hidden files and node_modules
        if (
          item.startsWith(".") ||
          item === "node_modules" ||
          item === "dist"
        ) {
          continue;
        }

        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        const indent = "  ".repeat(currentDepth);

        if (stats.isDirectory()) {
          result += `${indent}${item}/\n`;
          result += await this.getDirectoryStructure(
            itemPath,
            depth,
            currentDepth + 1,
          );
        } else {
          result += `${indent}${item}\n`;
        }
      }

      return result;
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error
    ) {
      // Error is intentionally ignored
      return "";
    }
  }
}
