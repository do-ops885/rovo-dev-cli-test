import chalk from "chalk";
import { CoderAgent } from "../agents/sparc/coder-agent";
import { Orchestrator } from "../orchestrator";
import type { TaskContext } from "../agents/agent.interface";
import { AcliIntegration } from "../acli-integration";
import { workflowTracker } from "../workflow-tracker";

export async function sparcCommand(
  mode: string,
  description?: string,
): Promise<void> {
  console.log(chalk.green(`Running SPARC agent in ${mode} mode...`));

  if (!description || description.trim() === "") {
    console.log(chalk.yellow("No task description provided."));
    return;
  }

  console.log(chalk.blue(`Task: ${description}`));

  // Validate mode
  const validModes = ["architect", "coder", "tdd", "security", "devops"];
  if (!validModes.includes(mode)) {
    console.log(chalk.red(`Warning: '${mode}' is not a standard SPARC mode.`));
  }

  // Initialize orchestrator
  const orchestrator = new Orchestrator();
  orchestrator.start();

  const startTime = Date.now();
  let success = false;

  try {
    // Create task context
    const taskContext: TaskContext = {
      description,
      priority: 3,
      metadata: {
        mode,
        source: "sparc-command",
      },
    };

    // For now, we only have the coder agent implemented
    if (mode === "coder") {
      // Create and register agent
      const agent = new CoderAgent();
      await agent.initialize();

      orchestrator.registerAgent(agent.name, agent);

      console.log(chalk.blue("Executing task with Coder agent..."));
      const result = await agent.executeTask(taskContext);

      if (result.success) {
        success = true;
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
      // For other modes, use ACLI integration as a fallback
      console.log(chalk.blue(`Using Rovo Dev for ${mode} mode...`));

      const acli = new AcliIntegration();
      const instruction = `Act as a ${mode} and ${description}`;

      await acli.runWithInstruction(instruction);
      success = true; // Assume success if no error thrown
    }
  } catch (error) {
    console.error(chalk.red("Error executing SPARC agent:"), error);
  } finally {
    // Track workflow progress
    const duration = Date.now() - startTime;
    await workflowTracker.trackCommand(
      "sparc",
      mode,
      description,
      success,
      duration,
    );

    // Show workflow suggestions
    await workflowTracker.autoSuggestNext();

    // Stop orchestrator
    orchestrator.stop();
  }
}
