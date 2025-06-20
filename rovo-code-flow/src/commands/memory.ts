import chalk from "chalk";
import { MemoryFileManager } from "../memory-file";
import fs from "fs";
import path from "path";
import os from "os";

interface MemoryOptions {
  global?: boolean;
  repo?: boolean;
}

export async function memoryCommand(
  action: string,
  key?: string,
  value?: string,
  options: MemoryOptions = {},
): Promise<void> {
  const memoryManager = new MemoryFileManager();

  // Determine target memory file
  let target: "global" | "local" | "repo" = "local";
  if (options.global) {
    target = "global";
  } else if (options.repo) {
    target = "repo";
  }

  switch (action) {
    case "init":
      console.log(chalk.green("Initializing memory files..."));
      await memoryManager.initWithRepoInfo();
      break;

    case "add":
    case "store":
      if (!key) {
        console.log(
          chalk.red("Error: Note content is required for add action."),
        );
        return;
      }
      console.log(chalk.green(`Adding note to ${target} memory file: ${key}`));
      await memoryManager.addNote(key, target);
      break;

    case "remove":
    case "delete":
      if (!key) {
        console.log(chalk.red("Error: Pattern is required for remove action."));
        return;
      }
      console.log(
        chalk.green(
          `Removing note from ${target} memory file matching: ${key}`,
        ),
      );
      await memoryManager.removeNote(key, target);
      break;

    case "show":
    case "list":
      const memoryPath =
        target === "global"
          ? path.join(os.homedir(), ".agent.md")
          : target === "repo"
            ? path.join(process.cwd(), ".agent.md")
            : path.join(process.cwd(), ".agent.local.md");

      if (!fs.existsSync(memoryPath)) {
        console.log(chalk.yellow(`${target} memory file does not exist.`));
        return;
      }

      const content = fs.readFileSync(memoryPath, "utf8");
      console.log(chalk.green(`Contents of ${target} memory file:`));
      console.log(chalk.blue(content));
      break;

    default:
      console.log(
        chalk.red(
          `Error: Unknown action '${action}'. Valid actions are: init, add/store, remove/delete, show/list`,
        ),
      );
  }
}
