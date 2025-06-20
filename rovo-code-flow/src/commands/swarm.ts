import chalk from "chalk";
import { Orchestrator } from "../orchestrator";
import { CoderAgent } from "../agents/sparc/coder-agent";
import { ModelerAgent } from "../agents/event/modeler-agent";
import type { Agent, TaskResult } from "../agents/agent.interface";
import { TaskContext } from "../agents/agent.interface";

interface SwarmOptions {
  parallel?: boolean;
  strategy?: string;
  maxAgents?: string;
}

export async function swarmCommand(
  task: string,
  options: SwarmOptions,
): Promise<void> {
  console.log(chalk.green("Initializing agent swarm..."));
  console.log(chalk.blue(`Task: ${task}`));

  const parallel = options.parallel || false;
  const strategy = options.strategy || "development";
  const maxAgents = parseInt(options.maxAgents || "3", 10);

  console.log(chalk.blue(`Mode: ${parallel ? "Parallel" : "Sequential"}`));
  console.log(chalk.blue(`Strategy: ${strategy}`));
  console.log(chalk.blue(`Max Agents: ${maxAgents}`));

  // Initialize orchestrator
  const orchestrator = new Orchestrator();
  orchestrator.start();

  try {
    // Create agents based on strategy
    const agents = await createAgentsForStrategy(strategy, maxAgents);

    if (agents.length === 0) {
      console.log(
        chalk.red(
          "No agents created. Check the strategy or increase max agents.",
        ),
      );
      return;
    }

    console.log(chalk.blue(`Created ${agents.length} agents for the swarm:`));
    agents.forEach((agent) => {
      console.log(`- ${agent.name} (${agent.type})`);
    });

    // Register agents with orchestrator
    agents.forEach((agent) => {
      orchestrator.registerAgent(agent.name, agent);
    });

    // Create task context (used when not using orchestrator)
    // const taskContext: TaskContext = {
    //   description: task,
    //   priority: 4,
    //   metadata: {
    //     strategy,
    //     swarm: true
    //   }
    // };

    // Execute the task using orchestrator coordination
    console.log(chalk.blue("\nExecuting swarm task..."));

    // Get agent names
    const agentNames = agents.map((agent) => agent.name);

    // Use orchestrator to coordinate the task
    const coordinationResult = await orchestrator.coordinateTask(
      task,
      agentNames,
      parallel,
    );

    // Extract results
    const results: TaskResult[] = coordinationResult.results.map(
      (r: any) => r.result,
    );

    // Process results
    const successCount = results.filter((result) => result.success).length;

    console.log(chalk.blue("\nSwarm Results:"));
    console.log(`Total Agents: ${agents.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${agents.length - successCount}`);

    // Display detailed results
    results.forEach((result, index) => {
      const agent = agents[index];
      const statusColor = result.success ? chalk.green : chalk.red;
      const status = result.success ? "Success" : "Failed";

      console.log(`\n${agent.name}: ${statusColor(status)}`);
      console.log(`Message: ${result.message}`);

      if (result.executionTime) {
        console.log(`Execution Time: ${result.executionTime}ms`);
      }

      if (result.suggestions && result.suggestions.length > 0) {
        console.log("Suggestions:");
        result.suggestions.forEach((suggestion) => {
          console.log(`- ${suggestion}`);
        });
      }
    });

    console.log(chalk.green("\nSwarm task completed!"));
  } catch (error) {
    console.error(chalk.red("Error executing swarm:"), error);
  } finally {
    // Stop orchestrator
    orchestrator.stop();
  }
}

/**
 * Create agents based on strategy
 */
async function createAgentsForStrategy(
  strategy: string,
  maxAgents: number,
): Promise<Agent[]> {
  const agents: Agent[] = [];

  switch (strategy.toLowerCase()) {
    case "development":
      // For development strategy, use coder and modeler agents
      if (maxAgents >= 1) {
        const coderAgent = new CoderAgent();
        await coderAgent.initialize();
        agents.push(coderAgent);
      }

      if (maxAgents >= 2) {
        const modelerAgent = new ModelerAgent();
        await modelerAgent.initialize();
        agents.push(modelerAgent);
      }
      break;

    case "design":
      // For design strategy, prioritize modeler agents
      if (maxAgents >= 1) {
        const modelerAgent = new ModelerAgent();
        await modelerAgent.initialize();
        agents.push(modelerAgent);
      }

      if (maxAgents >= 2) {
        const coderAgent = new CoderAgent();
        await coderAgent.initialize();
        agents.push(coderAgent);
      }
      break;

    case "implementation":
      // For implementation strategy, use multiple coder agents
      for (let i = 0; i < Math.min(maxAgents, 3); i++) {
        const coderAgent = new CoderAgent();
        await coderAgent.initialize();
        agents.push(coderAgent);
      }
      break;

    default:
      // Default to a balanced approach
      if (maxAgents >= 1) {
        const coderAgent = new CoderAgent();
        await coderAgent.initialize();
        agents.push(coderAgent);
      }

      if (maxAgents >= 2) {
        const modelerAgent = new ModelerAgent();
        await modelerAgent.initialize();
        agents.push(modelerAgent);
      }
  }

  return agents;
}
