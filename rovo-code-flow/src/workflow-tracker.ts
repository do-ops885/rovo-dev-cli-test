/**
 * Workflow Progress Tracker
 *
 * Automatically tracks workflow progress when commands are executed
 */

import { WorkflowManager } from "./workflow-manager";
import chalk from "chalk";

export class WorkflowTracker {
  private workflowManager: WorkflowManager;

  constructor() {
    this.workflowManager = new WorkflowManager();
  }

  /**
   * Track command execution and update workflow progress
   */
  public async trackCommand(
    command: string,
    mode: string,
    description: string,
    success: boolean = true,
    duration: number = 0,
  ): Promise<void> {
    try {
      const progress = await this.workflowManager.getWorkflowProgress();

      if (!progress.state || !progress.template) {
        // No active workflow, skip tracking
        return;
      }

      // Find matching phase based on command pattern
      const matchingPhase = this.findMatchingPhase(
        progress.template.phases,
        command,
        mode,
        description,
      );

      if (matchingPhase) {
        // Check if this command is part of the current or next phase
        const isCurrentPhase =
          progress.progress.nextPhase?.id === matchingPhase.id;
        const isAlreadyCompleted =
          progress.state.completedPhases[matchingPhase.id];

        if (isCurrentPhase && !isAlreadyCompleted) {
          // Check if all commands in this phase are completed
          const phaseCommands = matchingPhase.commands;
          const executedCommand = phaseCommands.find((cmd) =>
            this.commandMatches(cmd, command, mode, description),
          );

          if (executedCommand && success) {
            console.log(
              chalk.blue(
                `Workflow: Command "${executedCommand.description}" completed`,
              ),
            );

            // Check if this was the last command in the phase
            if (this.isPhaseComplete()) {
              await this.workflowManager.completePhase(
                matchingPhase.id,
                duration,
              );
              console.log(
                chalk.green(
                  `Workflow: Phase "${matchingPhase.name}" completed automatically`,
                ),
              );

              // Show next phase if available
              const updatedProgress =
                await this.workflowManager.getWorkflowProgress();
              if (updatedProgress.progress.nextPhase) {
                console.log(
                  chalk.blue(
                    `Next phase: ${updatedProgress.progress.nextPhase.name}`,
                  ),
                );
                console.log(
                  chalk.gray(`   Run: rovo-code-flow workflow resume`),
                );
              }
            }
          } else if (!success) {
            await this.workflowManager.failPhase(
              matchingPhase.id,
              "Command execution failed",
            );
            console.log(
              chalk.red(
                `Workflow: Phase "${matchingPhase.name}" marked as failed`,
              ),
            );
          }
        }
      }
    } catch (error: any) {
      // Silently fail workflow tracking to not interfere with main command
      console.log(
        chalk.gray(
          `Workflow tracking error: ${error?.message || "Unknown error"}`,
        ),
      );
    }
  }

  /**
   * Find matching phase for a command
   */
  private findMatchingPhase(
    phases: any[],
    command: string,
    mode: string,
    description: string,
  ): any | null {
    for (const phase of phases) {
      for (const cmd of phase.commands) {
        if (this.commandMatches(cmd, command, mode, description)) {
          return phase;
        }
      }
    }
    return null;
  }

  /**
   * Check if a command matches the workflow command definition
   */
  private commandMatches(
    workflowCmd: any,
    command: string,
    mode: string,
    description: string,
  ): boolean {
    // Check if the base command matches
    if (!workflowCmd.command.includes(command)) {
      return false;
    }

    // Check if the mode/subcommand matches
    if (workflowCmd.args.length > 0 && !workflowCmd.args.includes(mode)) {
      return false;
    }

    // Check if description contains similar keywords
    const workflowDesc = workflowCmd.description.toLowerCase();
    const inputDesc = description.toLowerCase();

    // Simple keyword matching - could be improved with NLP
    const workflowKeywords = workflowDesc
      .split(" ")
      .filter((word) => word.length > 3);
    const inputKeywords = inputDesc
      .split(" ")
      .filter((word) => word.length > 3);

    const matchingKeywords = workflowKeywords.filter((keyword) =>
      inputKeywords.some(
        (inputKeyword) =>
          inputKeyword.includes(keyword) || keyword.includes(inputKeyword),
      ),
    );

    // Consider it a match if at least 30% of keywords match
    return (
      matchingKeywords.length >=
      Math.max(1, Math.floor(workflowKeywords.length * 0.3))
    );
  }

  /**
   * Check if a phase is complete based on executed commands
   */
  private isPhaseComplete(): boolean {
    // For now, assume each command execution completes the phase
    // This could be enhanced to track multiple commands per phase
    return true;
  }

  /**
   * Get workflow suggestions for current context
   */
  public async getWorkflowSuggestions(): Promise<string[]> {
    try {
      const progress = await this.workflowManager.getWorkflowProgress();

      if (!progress.state || !progress.template) {
        return [
          "No active workflow. Start one with: rovo-code-flow workflow start",
          "Initialize workflow system: rovo-code-flow workflow init",
        ];
      }

      const suggestions: string[] = [];

      if (progress.progress.nextPhase) {
        suggestions.push(
          `Continue with next phase: rovo-code-flow workflow resume`,
        );
        suggestions.push(
          `Run specific phase: rovo-code-flow workflow run ${progress.progress.nextPhase.id}`,
        );
      }

      if (progress.progress.blockedPhases.length > 0) {
        suggestions.push(
          `${progress.progress.blockedPhases.length} phases are blocked by dependencies`,
        );
      }

      if (progress.progress.failedPhases > 0) {
        suggestions.push(
          `${progress.progress.failedPhases} phases have failed - check with: rovo-code-flow workflow status`,
        );
      }

      suggestions.push(`View workflow status: rovo-code-flow workflow status`);
      suggestions.push(`View all phases: rovo-code-flow workflow phases`);

      return suggestions;
    } catch {
      return [];
    }
  }

  /**
   * Auto-suggest next workflow action
   */
  public async autoSuggestNext(): Promise<void> {
    try {
      const progress = await this.workflowManager.getWorkflowProgress();

      if (!progress.state || !progress.template) {
        return;
      }

      if (progress.progress.nextPhase) {
        console.log(chalk.blue("\nWorkflow Suggestion:"));
        console.log(chalk.gray(`   Next: ${progress.progress.nextPhase.name}`));
        console.log(chalk.gray(`   Run: rovo-code-flow workflow resume`));
      } else if (progress.progress.remainingPhases === 0) {
        console.log(chalk.green("\nWorkflow completed! All phases are done."));
      }
    } catch {
      // Silently fail
    }
  }
}

// Global instance for easy access
export const workflowTracker = new WorkflowTracker();
