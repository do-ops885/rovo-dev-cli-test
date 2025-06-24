import chalk from "chalk";
import { Orchestrator } from "../orchestrator";
import { McpManager } from "../mcp-manager";
import { getDailyTokenUsage, formatTokenUsage, formatDuration } from "../utils";
import os from "os";
import { getSessionFiles, getSessionDetails } from "../utils";
import { WorkflowManager } from "../workflow-manager";

export async function statusCommand(): Promise<void> {
  console.log(chalk.green("System Status:"));

  // Check orchestrator status
  const orchestrator = new Orchestrator();
  const isActive = orchestrator.isActive();
  const agents = orchestrator.getAgents();

  console.log(
    chalk.blue(
      `Orchestrator: ${isActive ? chalk.green("Active") : chalk.red("Inactive")}`,
    ),
  );
  console.log(chalk.blue(`Active Agents: ${agents.size}`));

  // Display agent details if any are active
  if (agents.size > 0) {
    console.log(chalk.blue("\nActive Agents:"));

    agents.forEach((agent, name) => {
      console.log(`- ${name} (${agent.type}, ${agent.status})`);
    });
  }

  // Check MCP server status
  const mcpManager = new McpManager();
  const runningServers = mcpManager.getRunningServers();

  console.log(chalk.blue(`\nMCP Servers: ${runningServers.length} running`));

  if (runningServers.length > 0) {
    console.log(chalk.blue("Running MCP Servers:"));

    runningServers.forEach((name) => {
      console.log(`- ${name}`);
    });
  }

  // Get system metrics
  const memoryUsage = process.memoryUsage();
  const heapUsedMB =
    Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;
  const heapTotalMB =
    Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100;

  console.log(chalk.blue("\nSystem Metrics:"));
  console.log(`Memory Usage: ${heapUsedMB} MB / ${heapTotalMB} MB`);
  console.log(`Platform: ${os.platform()} ${os.release()}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`CPU Cores: ${os.cpus().length}`);

  // Get uptime
  const uptimeMs = process.uptime() * 1000;
  console.log(`Uptime: ${formatDuration(uptimeMs)}`);

  // Get token usage
  const { used, limit } = getDailyTokenUsage();
  console.log(chalk.blue("\nToken Usage:"));
  console.log(`Daily Usage: ${formatTokenUsage(used, limit)}`);

  // Get session information
  const sessionFiles = getSessionFiles();
  console.log(chalk.blue("\nSessions:"));
  console.log(`Total Sessions: ${sessionFiles.length}`);

  if (sessionFiles.length > 0) {
    const sessions = sessionFiles
      .map((file) => getSessionDetails(file))
      .filter((session) => session !== null)
      .sort((a, b) => b.updated.getTime() - a.updated.getTime());

    if (sessions.length > 0) {
      const currentSession = sessions[0];
      console.log(
        `Current Session: ${currentSession.title} (${currentSession.messages} messages)`,
      );
      console.log(`Last Activity: ${currentSession.updated.toLocaleString()}`);
    }
  }

  // Get workflow status
  const workflowManager = new WorkflowManager();
  const workflowProgress = await workflowManager.getWorkflowProgress();

  console.log(chalk.blue("\nWorkflow Status:"));

  if (workflowProgress.state && workflowProgress.template) {
    const { template, state, progress } = workflowProgress;

    console.log(`Active Workflow: ${template.name}`);
    console.log(
      `Status: ${getWorkflowStatusColor(state.status)(state.status)}`,
    );
    console.log(
      `Progress: ${progress.completedPhases}/${progress.totalPhases} phases (${progress.percentComplete}%)`,
    );

    if (progress.nextPhase) {
      console.log(`Next Phase: ${progress.nextPhase.name}`);
    } else if (progress.remainingPhases === 0) {
      console.log(chalk.green("Workflow completed!"));
    }

    if (progress.failedPhases > 0) {
      console.log(chalk.red(`Failed Phases: ${progress.failedPhases}`));
    }

    if (progress.blockedPhases.length > 0) {
      console.log(
        chalk.yellow(`Blocked Phases: ${progress.blockedPhases.length}`),
      );
    }
  } else {
    console.log("No active workflow");
    console.log(
      chalk.blue("Start a workflow with: rovo-code-flow workflow start"),
    );
  }
}

/**
 * Get color for workflow status
 */
function getWorkflowStatusColor(status: string): (text: string) => string {
  switch (status) {
    case "completed":
      return chalk.green;
    case "failed":
      return chalk.red;
    case "paused":
      return chalk.yellow;
    case "in-progress":
      return chalk.blue;
    default:
      return chalk.gray;
  }
}
