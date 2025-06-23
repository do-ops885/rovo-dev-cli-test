import chalk from "chalk";
import { Orchestrator } from "../orchestrator";
import { CoderAgent } from "../agents/sparc/coder-agent";
import { ModelerAgent } from "../agents/event/modeler-agent";
import type { Agent } from "../agents/agent.interface";

// Global orchestrator instance
const orchestrator = new Orchestrator();

export async function agentCommand(
  action: string,
  name?: string,
): Promise<void> {
  // Start orchestrator if not already running
  if (!orchestrator.isActive()) {
    orchestrator.start();
  }

  switch (action) {
    case "spawn":
      await spawnAgent(name);
      break;

    case "list":
      listAgents();
      break;

    case "kill":
      killAgent(name);
      break;

    default:
      console.log(
        chalk.red(
          `Error: Unknown action '${action}'. Valid actions are: spawn, list, kill`,
        ),
      );
  }
}

/**
 * Spawn a new agent
 */
async function spawnAgent(name?: string): Promise<void> {
  if (!name || name.trim() === "") {
    console.log(chalk.red("Error: Agent name is required for spawn action."));
    return;
  }

  console.log(chalk.green(`Spawning agent: ${name}...`));

  let agent: Agent | null = null;

  // Create agent based on name
  switch (name.toLowerCase()) {
    case "coder":
      agent = new CoderAgent();
      break;

    case "modeler":
      agent = new ModelerAgent();
      break;

    default:
      // For unknown agent types, try to infer the type
      if (
        name.toLowerCase().includes("code") ||
        name.toLowerCase().includes("dev") ||
        name.toLowerCase().includes("program")
      ) {
        agent = new CoderAgent();
      } else if (
        name.toLowerCase().includes("model") ||
        name.toLowerCase().includes("event") ||
        name.toLowerCase().includes("domain")
      ) {
        agent = new ModelerAgent();
      } else {
        console.log(
          chalk.yellow(
            `Unknown agent type: ${name}. Defaulting to Coder agent.`,
          ),
        );
        agent = new CoderAgent();
      }
  }

  try {
    // Initialize the agent
    await agent.initialize();

    // Register with orchestrator
    orchestrator.registerAgent(name, agent);

    console.log(chalk.green(`✅ Agent ${name} spawned successfully!`));
    console.log(chalk.blue(`Agent ID: ${agent.id}`));
    console.log(chalk.blue(`Type: ${agent.type}`));
    console.log(chalk.blue(`Capabilities: ${agent.capabilities.join(", ")}`));
  } catch (error) {
    console.error(chalk.red(`Error spawning agent ${name}:`), error);
  }
}

/**
 * List all active agents
 */
function listAgents(): void {
  console.log(chalk.green("Listing all agents:"));

  const agents = orchestrator.getAgents();

  if (agents.size === 0) {
    console.log(chalk.blue("No active agents."));
    return;
  }

  // Display agents
  agents.forEach((agent, name) => {
    console.log(chalk.blue(`\n${name}:`));
    console.log(`  ID: ${agent.id}`);
    console.log(`  Type: ${agent.type}`);
    console.log(`  Status: ${agent.status}`);
    console.log(`  Capabilities: ${agent.capabilities.join(", ")}`);
  });
}

/**
 * Kill an agent
 */
function killAgent(name?: string): void {
  if (!name || name.trim() === "") {
    console.log(chalk.red("Error: Agent name is required for kill action."));
    return;
  }

  console.log(chalk.yellow(`Killing agent: ${name}...`));

  // Check if agent exists
  const agents = orchestrator.getAgents();
  const agent = agents.get(name);

  if (!agent) {
    console.log(chalk.red(`Error: Agent ${name} not found.`));
    return;
  }

  // Stop the agent
  agent
    .stop()
    .then(() => {
      // Unregister from orchestrator
      orchestrator.unregisterAgent(name);
      console.log(chalk.green(`✅ Agent ${name} terminated.`));
    })
    .catch((error) => {
      console.error(chalk.red(`Error terminating agent ${name}:`), error);
    });
}
