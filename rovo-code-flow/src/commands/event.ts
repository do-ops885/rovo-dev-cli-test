import chalk from "chalk";
import { ModelerAgent } from "../agents/event/modeler-agent";
import { Orchestrator } from "../orchestrator";
import type { TaskContext } from "../agents/agent.interface";
import { AcliIntegration } from "../acli-integration";

export async function eventCommand(
  role: string,
  description?: string,
): Promise<void> {
  console.log(chalk.green(`Running Event Modeling agent with ${role} role...`));

  if (!description || description.trim() === "") {
    console.log(chalk.yellow("No task description provided."));
    return;
  }

  console.log(chalk.blue(`Task: ${description}`));

  // Validate role
  const validRoles = ["modeler", "timeline", "ui", "state", "mapper"];
  if (!validRoles.includes(role)) {
    console.log(
      chalk.red(`Warning: '${role}' is not a standard Event Modeling role.`),
    );
  }

  // Initialize orchestrator
  const orchestrator = new Orchestrator();
  orchestrator.start();

  try {
    // Create task context
    const taskContext: TaskContext = {
      description,
      priority: 3,
      metadata: {
        role,
        source: "event-command",
      },
    };

    // For now, we only have the modeler agent implemented
    if (role === "modeler") {
      // Create and register agent
      const agent = new ModelerAgent();
      await agent.initialize();

      orchestrator.registerAgent(agent.name, agent);

      console.log(chalk.blue("Executing task with Modeler agent..."));
      const result = await agent.executeTask(taskContext);

      if (result.success) {
        console.log(chalk.green(`Task completed: ${result.message}`));

        // If we have artifacts, display them
        if (result.artifacts && Object.keys(result.artifacts).length > 0) {
          console.log(chalk.blue("\nArtifacts:"));
          for (const [key, value] of Object.entries(result.artifacts)) {
            console.log(chalk.yellow(`${key}:`));
            console.log(value);
          }
        }

        // If we have suggestions, display them
        if (result.suggestions && result.suggestions.length > 0) {
          console.log(chalk.blue("\nSuggestions:"));
          result.suggestions.forEach((suggestion, index) => {
            console.log(chalk.yellow(`${index + 1}. ${suggestion}`));
          });
        }
      } else {
        console.log(chalk.red(`Task failed: ${result.message}`));
        if (result.error) {
          console.error(chalk.red(`Error: ${result.error.message}`));
        }
      }
    } else {
      // For other roles, use ACLI integration as a fallback
      console.log(chalk.blue(`Using Rovo Dev for ${role} role...`));

      const acli = new AcliIntegration();
      const instruction = `Act as an Event Modeling ${role} and ${description}`;

      await acli.runWithInstruction(instruction);
    }
  } catch (error) {
    console.error(chalk.red("Error executing Event Modeling agent:"), error);
  } finally {
    // Stop orchestrator
    orchestrator.stop();
  }
}
