import chalk from "chalk";
import { Orchestrator } from "../orchestrator";
import { McpManager } from "../mcp-manager";
import { Config } from "../config";
import { spawn } from "child_process";

interface StartOptions {
  ui?: boolean;
  port?: string;
}

export function startCommand(options: StartOptions): void {
  console.log(chalk.green("Starting rovo-code-flow orchestrator..."));

  // Initialize orchestrator
  const orchestrator = new Orchestrator();
  orchestrator.start();

  // Start MCP servers
  startMcpServers();

  if (options.ui) {
    const port = options.port || "3000";
    console.log(chalk.blue(`Starting UI on port ${port}...`));
    startUi(port);
  } else {
    console.log(chalk.blue("Starting in CLI mode..."));
    displayCliHelp();
  }

  console.log(chalk.green("Orchestrator started!"));
}

/**
 * Start MCP servers
 */
function startMcpServers(): void {
  const config = new Config();
  const mcpEnabled = config.get("mcp.enabled", true);

  if (!mcpEnabled) {
    console.log(chalk.yellow("MCP servers are disabled in configuration."));
    return;
  }

  const mcpManager = new McpManager();
  const servers = mcpManager.getServers();
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0) {
    console.log(chalk.yellow("No MCP servers configured."));
    return;
  }

  console.log(chalk.blue("Starting MCP servers..."));

  for (const name of serverNames) {
    mcpManager.startServer(name);
  }
}

/**
 * Start UI server
 */
function startUi(port: string): void {
  try {
    // Check if UI dependencies are installed
    const uiProcess = spawn(
      "npx",
      ["--no", "rovo-code-flow-ui", "--port", port],
      {
        stdio: "pipe",
        detached: true,
      },
    );

    uiProcess.stdout.on("data", (data) => {
      console.log(chalk.gray(`[UI] ${data.toString().trim()}`));
    });

    uiProcess.stderr.on("data", (data) => {
      console.error(chalk.red(`[UI] ${data.toString().trim()}`));
    });

    uiProcess.on("error", (error) => {
      console.error(chalk.red("Error starting UI:"), error);
      console.log(chalk.yellow("UI dependencies may not be installed."));
      console.log(
        chalk.yellow(
          'Run "npm install -g rovo-code-flow-ui" to install UI dependencies.',
        ),
      );
    });

    uiProcess.on("close", (code) => {
      if (code !== 0) {
        console.log(chalk.red(`UI server exited with code ${code}.`));
        console.log(
          chalk.yellow(
            'Run "npm install -g rovo-code-flow-ui" to install UI dependencies.',
          ),
        );
      }
    });

    console.log(chalk.green(`UI server started on http://localhost:${port}`));
  } catch (error) {
    console.error(chalk.red("Error starting UI:"), error);
  }
}

/**
 * Display CLI help
 */
function displayCliHelp(): void {
  console.log(chalk.blue("\nAvailable commands:"));
  console.log("- rovo-code-flow sparc <mode> <task>: Run a SPARC agent");
  console.log(
    "- rovo-code-flow event <role> <task>: Run an Event Modeling agent",
  );
  console.log("- rovo-code-flow agent <action> <name>: Manage agents");
  console.log("- rovo-code-flow memory <action> <key>: Manage memory");
  console.log("- rovo-code-flow interactive: Start interactive mode");
  console.log("- rovo-code-flow status: Show system health and metrics");
  console.log("- rovo-code-flow stop: Stop the orchestrator");
}
