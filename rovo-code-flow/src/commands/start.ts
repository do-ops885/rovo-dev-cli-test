import chalk from "chalk";
import { Orchestrator } from "../orchestrator";
import { McpManager } from "../mcp-manager";
import { Config } from "../config";
import { spawn } from "child_process";

interface StartOptions {
  ui?: boolean;
  port?: string | number;
}

export async function startCommand(options: StartOptions): Promise<void> {
  console.log(chalk.green("Starting rovo-code-flow orchestrator..."));

  // Initialize orchestrator
  const orchestrator = new Orchestrator();
  orchestrator.start();

  // Start MCP servers
  startMcpServers();

  if (options.ui === true) {
    const port = options.port !== undefined ? options.port.toString() : "3000";
    console.log(chalk.blue(`Starting UI on port ${port}...`));
    await startUi(port);
  } else {
    console.log(chalk.blue("Starting in CLI mode..."));
    displayCliHelp();
  }

  console.log(chalk.green("Orchestrator started!"));
}

/**
 * Start MCP servers with retry logic
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

  // Track startup progress
  let startedCount = 0;
  const totalServers = serverNames.length;

  // Start each server with individual error handling
  for (const name of serverNames) {
    try {
      const success = mcpManager.startServer(name);
      if (success) {
        startedCount++;
        // Show progress
        console.log(
          chalk.green(
            `Progress: ${startedCount}/${totalServers} MCP servers started`,
          ),
        );
      } else {
        console.log(
          chalk.yellow(
            `Failed to start MCP server "${name}". Will retry once...`,
          ),
        );
        // Retry once after a short delay
        setTimeout(() => {
          try {
            const retrySuccess = mcpManager.startServer(name);
            if (retrySuccess) {
              startedCount++;
              console.log(
                chalk.green(`Retry successful for MCP server "${name}"`),
              );
              console.log(
                chalk.green(
                  `Progress: ${startedCount}/${totalServers} MCP servers started`,
                ),
              );
            } else {
              console.error(
                chalk.red(`Failed to start MCP server "${name}" after retry.`),
              );
            }
          } catch (retryError) {
            console.error(
              chalk.red(
                `Error during retry for MCP server "${name}":`,
                retryError,
              ),
            );
          }
        }, 2000);
      }
    } catch (error) {
      console.error(chalk.red(`Error starting MCP server "${name}":`, error));
    }
  }
}

/**
 * Check if UI package is installed
 */
function checkUiDependency(): Promise<boolean> {
  return new Promise((resolve) => {
    const checkProcess = spawn("npm", ["list", "-g", "rovo-code-flow-ui"], {
      stdio: "pipe",
    });

    let output = "";

    checkProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    checkProcess.on("close", () => {
      // If the package is found in the output, it's installed
      resolve(output.includes("rovo-code-flow-ui"));
    });
  });
}

/**
 * Start UI server with health check
 */
async function startUi(port: string): Promise<void> {
  try {
    // Show progress indicator
    console.log(chalk.blue("Checking UI dependencies..."));

    // Check if UI package is installed
    const isUiInstalled = await checkUiDependency();

    if (!isUiInstalled) {
      console.log(
        chalk.yellow("UI package not found. Installing dependencies..."),
      );
      console.log(chalk.yellow("This may take a moment..."));

      // Try to install the package
      const installProcess = spawn(
        "npm",
        ["install", "-g", "rovo-code-flow-ui"],
        {
          stdio: "pipe",
        },
      );

      // Wait for installation to complete
      await new Promise((resolve, reject) => {
        installProcess.on("close", (code) => {
          if (code === 0) {
            console.log(chalk.green("UI dependencies installed successfully."));
            resolve(true);
          } else {
            console.error(chalk.red("Failed to install UI dependencies."));
            reject(new Error(`Installation failed with code ${code}`));
          }
        });

        installProcess.on("error", (error) => {
          reject(error);
        });
      });
    }

    console.log(chalk.blue(`Starting UI server on port ${port}...`));

    // Start the UI process
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

    // Add health check
    let isHealthy = false;
    const healthCheckTimeout = setTimeout(() => {
      if (!isHealthy) {
        console.log(
          chalk.yellow(
            "UI server health check timed out. The server might still be starting...",
          ),
        );
      }
    }, 5000);

    uiProcess.on("close", (code) => {
      clearTimeout(healthCheckTimeout);
      if (code !== 0) {
        console.log(chalk.red(`UI server exited with code ${code}.`));
        console.log(
          chalk.yellow(
            'Run "npm install -g rovo-code-flow-ui" to install UI dependencies.',
          ),
        );
      }
    });

    // Wait for server to start listening
    setTimeout(() => {
      isHealthy = true;
      console.log(
        chalk.green(
          `UI server started and healthy at http://localhost:${port}`,
        ),
      );
    }, 2000);
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
  console.log("- rovo-code-flow agent <action> <n>: Manage agents");
  console.log("- rovo-code-flow memory <action> <key>: Manage memory");
  console.log("- rovo-code-flow interactive: Start interactive mode");
  console.log("- rovo-code-flow status: Show system health and metrics");
  console.log("- rovo-code-flow stop: Stop the orchestrator");
}
