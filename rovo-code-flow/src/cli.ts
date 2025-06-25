#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init";
import { startCommand } from "./commands/start";
import { statusCommand } from "./commands/status";
import { sparcCommand } from "./commands/sparc";
import { eventCommand } from "./commands/event";
import { agentCommand } from "./commands/agent";
import { memoryCommand } from "./commands/memory";
import { swarmCommand } from "./commands/swarm";
import { acliCommand } from "./commands/acli";
import { usageCommand } from "./commands/usage";
import { sessionsCommand } from "./commands/sessions";
import { instructionsCommand } from "./commands/instructions";
import { feedbackCommand } from "./commands/feedback";
import { interactiveCommand } from "./commands/interactive";
import { mcpCommand } from "./commands/mcp";
import { workflowCommand } from "./commands/workflow";
import chalk from "chalk";

// Define color themes for command categories
const colors = {
  core: chalk.green,
  agent: chalk.blue,
  system: chalk.yellow,
  tools: chalk.magenta,
  utility: chalk.cyan,
};

// Create CLI program
// Check for --no-color flag
if (process.argv.includes("--no-color")) {
  chalk.level = 0;
}
const program = new Command();

// Set version and description
program
  .name("rovo-code-flow")
  .description(
    "Multi-agent orchestration CLI for Rovo Dev, blending SPARC and Event Modeling",
  )
  .version("1.0.0")
  .option("--no-color", "Disable colored output (for accessibility)");

// Initialize command (Core)
program
  .command("init")
  .description(
    colors.core(
      `Initialize rovo-code-flow with SPARC and/or Event Modeling modes`,
    ),
  )
  .option("--sparc", "Initialize SPARC modes")
  .option("--event", "Initialize Event Modeling modes")
  .action(initCommand);

// Start command (Core)
program
  .command("start")
  .description(colors.core("Start the orchestrator"))
  .option("--ui", "Start with UI")
  .option("--port <number>", "UI port", "3000")
  .action(async (options) => {
    await startCommand(options);
  });

// Status command (System)
program
  .command("status")
  .description(colors.system("Show system health and metrics"))
  .action(async () => {
    await statusCommand();
  });

// SPARC command (Agent)
program
  .command("sparc")
  .description(colors.agent("Run SPARC agent"))
  .argument(
    "<mode>",
    "SPARC mode (architect, coder, tdd, security, devops, etc.)",
  )
  .argument("[description]", "Task description")
  .action(sparcCommand);

// Event command (Agent)
program
  .command("event")
  .description(colors.agent("Run Event Modeling agent"))
  .argument("<role>", "Event Modeling role (modeler, timeline, ui, etc.)")
  .argument("[description]", "Task description")
  .action(eventCommand);

// Agent command (Agent)
program
  .command("agent")
  .description(colors.agent("Agent management"))
  .argument("<action>", "Action to perform (spawn, list, kill)")
  .argument("[name]", "Agent name")
  .action(agentCommand);

// Memory command (System)
program
  .command("memory")
  .description(colors.system("Memory file operations"))
  .argument(
    "<action>",
    "Action to perform (init, add/store, remove/delete, show/list)",
  )
  .argument("[key]", "Note content or pattern")
  .argument("[value]", "Value (for backward compatibility)")
  .option("--global", "Use global memory file (~/.agent.md)")
  .option("--repo", "Use repository memory file (./.agent.md)")
  .action(memoryCommand);

// Swarm command (Agent)
program
  .command("swarm")
  .description(colors.agent("Multi-agent coordination"))
  .argument("<task>", "Task description")
  .option("--parallel", "Run agents in parallel")
  .option("--strategy <strategy>", "Coordination strategy", "development")
  .option("--max-agents <number>", "Maximum number of agents", "3")
  .action(swarmCommand);

// ACLI integration command (Tools)
program
  .command("acli")
  .description(colors.tools("Atlassian CLI (ACLI) integration for Rovo Dev"))
  .argument("<action>", "Action to perform (install, auth, run, setup)")
  .option("--interactive", "Run in interactive mode")
  .option(
    "--instruction <instruction>",
    "Instruction to run in non-interactive mode",
  )
  .action(acliCommand);

// Usage command (Utility)
program
  .command("usage")
  .description(colors.utility("Show daily token usage"))
  .action(usageCommand);

// Sessions command (Utility)
program
  .command("sessions")
  .description(colors.utility("Session management"))
  .option("--clear", "Clear the current session")
  .option("--prune", "Prune the current session to reduce token usage")
  .option("--switch <id>", "Switch to a different session")
  .option("--list", "List all sessions")
  .action(sessionsCommand);

// Instructions command (Utility)
program
  .command("instructions")
  .description(colors.utility("Instructions management"))
  .option("--list", "List all instructions")
  .option("--add", "Add a new instruction")
  .option("--remove <n>", "Remove an instruction")
  .option("--run <n>", "Run an instruction")
  .action(instructionsCommand);

// Feedback command (Utility)
program
  .command("feedback")
  .description(colors.utility("Provide feedback or report a bug"))
  .option("--bug", "Report a bug")
  .option("--feature", "Request a feature")
  .action(feedbackCommand);

// Interactive command (Core)
program
  .command("interactive")
  .alias("i")
  .description(colors.core("Start interactive mode"))
  .option("--prompt <prompt>", "Initial prompt")
  .action(interactiveCommand);

// MCP command (System)
program
  .command("mcp")
  .description(colors.system("Model Context Protocol server management"))
  .argument("<action>", "Action to perform (start, stop, list, add, remove)")
  .option("--start <n>", "Start an MCP server")
  .option("--stop <n>", "Stop an MCP server")
  .option("--list", "List all MCP servers")
  .option("--add", "Add a new MCP server")
  .option("--remove <n>", "Remove an MCP server")
  .action(mcpCommand);

// Workflow command (Core)
program
  .command("workflow")
  .description(colors.core("Workflow management and phase tracking"))
  .argument(
    "<action>",
    "Action to perform (init, start, status, resume, complete, skip, reset, pause, templates, phases, validate, run)",
  )
  .argument("[target]", "Target (template-id, phase-id, etc.)")
  .option("--template <template>", "Workflow template ID")
  .option("--phase <phase>", "Specific phase ID")
  .option("--force", "Force action without confirmation")
  .option("--interactive", "Run in interactive mode")
  .option("--non-interactive", "Run in non-interactive mode (no prompts)")
  .option("--dry-run", "Show what would be executed without running commands")
  .option("--parallel", "Execute commands in parallel where possible")
  .action(workflowCommand);

// Display header with version
console.log(
  chalk.blue.bold("\nðŸ¤– Rovo Code Flow - Multi-agent orchestration CLI"),
  chalk.gray("v1.0.0"),
  "\n",
);

// Display command categories
console.log(
  colors.core("Core Commands:") +
    " init, start, interactive, workflow\n" +
    colors.agent("Agent Commands:") +
    " sparc, event, agent, swarm\n" +
    colors.system("System Commands:") +
    " status, memory, mcp\n" +
    colors.tools("Tool Commands:") +
    " acli\n" +
    colors.utility("Utility Commands:") +
    " usage, sessions, instructions, feedback\n",
);

// Parse arguments
program.parse(process.argv);
