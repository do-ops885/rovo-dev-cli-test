/**
 * Orchestrator for managing and coordinating agents
 */

import chalk from "chalk";

export class Orchestrator {
  private agents: Map<string, any> = new Map();
  private isRunning: boolean = false;

  /**
   * Start the orchestrator
   */
  public start(): void {
    this.isRunning = true;
    console.log(chalk.green("Orchestrator started"));
  }

  /**
   * Stop the orchestrator
   */
  public stop(): void {
    this.isRunning = false;
    console.log(chalk.yellow("Orchestrator stopped"));
  }

  /**
   * Register a new agent
   */
  public registerAgent(name: string, agent: any): void {
    this.agents.set(name, agent);
    console.log(chalk.blue(`Agent ${name} registered`));
  }

  /**
   * Unregister an agent
   */
  public unregisterAgent(name: string): boolean {
    const result = this.agents.delete(name);
    if (result) {
      console.log(chalk.blue(`Agent ${name} unregistered`));
    }
    return result;
  }

  /**
   * Get all registered agents
   */
  public getAgents(): Map<string, any> {
    return this.agents;
  }

  /**
   * Check if orchestrator is running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Coordinate multiple agents for a task
   */
  public async coordinateTask(
    task: string,
    agents: string[],
    parallel: boolean = false,
  ): Promise<any> {
    console.log(chalk.green(`Coordinating task: ${task}`));
    console.log(chalk.blue(`Agents involved: ${agents.join(", ")}`));
    console.log(
      chalk.blue(`Execution mode: ${parallel ? "Parallel" : "Sequential"}`),
    );

    // Validate agents
    const validAgents = agents.filter((name) => this.agents.has(name));

    if (validAgents.length === 0) {
      console.log(chalk.red("No valid agents found for coordination"));
      return {
        success: false,
        message: "No valid agents found for coordination",
        results: [],
      };
    }

    if (validAgents.length !== agents.length) {
      const invalidAgents = agents.filter((name) => !this.agents.has(name));
      console.log(
        chalk.yellow(
          `Warning: Some agents not found: ${invalidAgents.join(", ")}`,
        ),
      );
    }

    // Create task context
    const taskContext = {
      description: task,
      metadata: {
        coordinator: "orchestrator",
        timestamp: new Date().toISOString(),
      },
    };

    try {
      let results = [];

      if (parallel) {
        // Execute tasks in parallel
        console.log(chalk.blue("Executing tasks in parallel..."));

        const promises = validAgents.map((name) => {
          const agent = this.agents.get(name);
          console.log(chalk.blue(`Starting agent ${name}...`));
          return agent
            .executeTask(taskContext)
            .then((result) => ({ agent: name, result }))
            .catch((error) => ({
              agent: name,
              result: {
                success: false,
                message: `Error: ${error.message || "Unknown error"}`,
                error,
              },
            }));
        });

        results = await Promise.all(promises);
      } else {
        // Execute tasks sequentially
        console.log(chalk.blue("Executing tasks sequentially..."));

        results = [];
        let previousResult = null;

        for (const name of validAgents) {
          const agent = this.agents.get(name);
          console.log(chalk.blue(`Starting agent ${name}...`));

          // Update context with previous result if available
          const updatedContext = {
            ...taskContext,
            metadata: {
              ...taskContext.metadata,
              previousResult,
            },
          };

          try {
            const result = await agent.executeTask(updatedContext);
            results.push({ agent: name, result });
            previousResult = result;

            // If an agent fails and it's critical, stop the sequence
            if (!result.success && result.critical) {
              console.log(
                chalk.red(
                  `Critical failure in agent ${name}. Stopping sequence.`,
                ),
              );
              break;
            }
          } catch (error) {
            const failureResult = {
              success: false,
              message: `Error: ${error.message || "Unknown error"}`,
              error,
            };
            results.push({ agent: name, result: failureResult });
            previousResult = failureResult;

            console.log(
              chalk.red(
                `Error in agent ${name}: ${error.message || "Unknown error"}`,
              ),
            );
            break;
          }
        }
      }

      // Process results
      const successCount = results.filter((r) => r.result.success).length;
      console.log(
        chalk.green(
          `Task coordination completed. ${successCount}/${results.length} agents succeeded.`,
        ),
      );

      // Combine artifacts from all successful agents
      const combinedArtifacts = {};
      results
        .filter((r) => r.result.success && r.result.artifacts)
        .forEach((r) => {
          Object.entries(r.result.artifacts || {}).forEach(([key, value]) => {
            combinedArtifacts[`${r.agent}_${key}`] = value;
          });
        });

      // Collect all suggestions
      const allSuggestions = results
        .filter((r) => r.result.suggestions && r.result.suggestions.length)
        .flatMap((r) => r.result.suggestions);

      return {
        success: successCount > 0,
        message: `${successCount}/${results.length} agents completed successfully`,
        results,
        artifacts: combinedArtifacts,
        suggestions: allSuggestions,
      };
    } catch (error) {
      console.log(
        chalk.red(
          `Error coordinating task: ${error.message || "Unknown error"}`,
        ),
      );
      return {
        success: false,
        message: `Error coordinating task: ${error.message || "Unknown error"}`,
        error,
        results: [],
      };
    }
  }
}
