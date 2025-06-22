/**
 * Interactive mode command handler
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { AcliIntegration } from "../acli-integration";
import { sessionsCommand } from "./sessions";
import { instructionsCommand } from "./instructions";
import { usageCommand } from "./usage";
import { feedbackCommand } from "./feedback";
import { MemoryFileManager } from "../memory-file";

interface InteractiveOptions {
  initialPrompt?: string;
}

export async function interactiveCommand(
  options: InteractiveOptions = {},
): Promise<void> {
  console.log(chalk.blue("Starting Rovo Dev in interactive mode..."));
  console.log(chalk.green("Type / at any time to see available commands."));

  if (options.initialPrompt) {
    console.log(chalk.yellow(`Initial prompt: ${options.initialPrompt}`));

    // Run the initial prompt
    const acli = new AcliIntegration();
    await acli.runWithInstruction(options.initialPrompt);
  }

  // Start interactive loop
  await startInteractiveLoop();
}

/**
 * Start the interactive command loop
 */
async function startInteractiveLoop(): Promise<void> {
  let running = true;

  while (running) {
    const { input } = await inquirer.prompt({
      type: "input",
      name: "input",
      message: "Rovo Dev>",
    });

    // Check for command prefix
    if (input.startsWith("/")) {
      const command = input.substring(1).trim();
      running = await handleCommand(command);
    } else if (input.startsWith("#")) {
      // Handle memory note
      await handleMemoryNote(input);
    } else if (input.trim()) {
      // Handle regular prompt
      const acli = new AcliIntegration();
      await acli.runWithInstruction(input);
    }
  }

  console.log(chalk.green("Exiting Rovo Dev interactive mode."));
}

/**
 * Handle a command
 * @returns false if the command is 'exit', true otherwise
 */
async function handleCommand(command: string): Promise<boolean> {
  const parts = command.split(" ");
  const mainCommand = parts[0].toLowerCase();

  switch (mainCommand) {
    case "sessions":
      await sessionsCommand();
      break;

    case "clear":
      await sessionsCommand({ clear: true });
      break;

    case "prune":
      await sessionsCommand({ prune: true });
      break;

    case "instructions":
      await instructionsCommand();
      break;

    case "memory":
      if (parts[1] === "init") {
        const memoryManager = new MemoryFileManager();
        await memoryManager.initWithRepoInfo();
      } else {
        console.log(
          chalk.yellow("Use # to add notes to memory or #! to remove notes."),
        );
        console.log(
          chalk.yellow(
            "Use /memory init to initialize memory with repository information.",
          ),
        );
      }
      break;

    case "feedback":
      await feedbackCommand();
      break;

    case "usage":
      usageCommand();
      break;

    case "help":
      showHelp();
      break;

    case "exit":
      return false;

    default:
      console.log(chalk.red(`Unknown command: ${mainCommand}`));
      showHelp();
  }

  return true;
}

/**
 * Handle a memory note
 */
async function handleMemoryNote(input: string): Promise<void> {
  const memoryManager = new MemoryFileManager();

  if (input.startsWith("#!")) {
    // Remove note
    const note = input.substring(2).trim();
    await memoryManager.removeNote(note, "local");
  } else {
    // Add note
    const note = input.substring(1).trim();
    await memoryManager.addNote(note, "local");
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(chalk.blue("\nAvailable commands:"));
  console.log("/sessions: Switch between sessions, and view session details.");
  console.log("/clear: Clear the current session's message history.");
  console.log(
    "/prune: Reduce the token size of the current session's message history while retaining context.",
  );
  console.log("/instructions: Run saved instructions.");
  console.log(
    "/memory init: Initialize memory file with repository information.",
  );
  console.log("# <note>: Add a note to Rovo Dev's local memory file.");
  console.log("#! <note>: Remove a note from Rovo Dev's local memory file.");
  console.log("/feedback: Provide feedback or report a bug on Rovo Dev CLI.");
  console.log("/usage: Show your daily LLM token usage.");
  console.log("/exit: Quit Rovo Dev.");
  console.log("/help: Show this help information.");
}
