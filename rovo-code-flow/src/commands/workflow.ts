/**
 * Workflow management commands
 */

import chalk from "chalk";
import inquirer from "inquirer";
import type { WorkflowTemplate, WorkflowPhase } from "../workflow-manager";
import { WorkflowManager } from "../workflow-manager";
import { spawn } from "child_process";
import { formatDuration } from "../utils";

interface WorkflowOptions {
  template?: string;
  phase?: string;
  force?: boolean;
  interactive?: boolean;
  dryRun?: boolean;
  parallel?: boolean;
}

export async function workflowCommand(
  action: string,
  target?: string,
  options: WorkflowOptions = {},
): Promise<void> {
  const workflowManager = new WorkflowManager();

  switch (action) {
    case "init":
      await initWorkflowSystem(workflowManager);
      break;

    case "start":
      await startWorkflow(workflowManager, target, options);
      break;

    case "status":
      await showWorkflowStatus(workflowManager);
      break;

    case "resume":
      await resumeWorkflow(workflowManager, target, options);
      break;

    case "complete":
      await completePhase(workflowManager, target, options);
      break;

    case "skip":
      await skipPhase(workflowManager, target, options);
      break;

    case "reset":
      await resetWorkflow(workflowManager, options);
      break;

    case "pause":
      await pauseWorkflow(workflowManager);
      break;

    case "templates":
      await listTemplates(workflowManager);
      break;

    case "phases":
      await listPhases(workflowManager, target);
      break;

    case "validate":
      await validatePhase(workflowManager, target);
      break;

    case "run":
      await runPhase(workflowManager, target, options);
      break;

    default:
      console.log(
        chalk.red(
          `Unknown workflow action: ${action}\n` +
            `Valid actions: init, start, status, resume, complete, skip, reset, pause, templates, phases, validate, run`,
        ),
      );
  }
}

/**
 * Initialize the workflow system
 */
async function initWorkflowSystem(
  workflowManager: WorkflowManager,
): Promise<void> {
  console.log(chalk.blue("Initializing workflow management system..."));
  await workflowManager.initialize();

  console.log(chalk.green("\n✅ Workflow system initialized!"));
  console.log(chalk.blue("\nAvailable commands:"));
  console.log(
    "• rovo-code-flow workflow templates - List available workflow templates",
  );
  console.log(
    "• rovo-code-flow workflow start <template-id> - Start a new workflow",
  );
  console.log(
    "• rovo-code-flow workflow status - Show current workflow progress",
  );
  console.log("• rovo-code-flow workflow resume - Resume from current phase");
}

/**
 * Start a new workflow
 */
async function startWorkflow(
  workflowManager: WorkflowManager,
  templateId?: string,
  options: WorkflowOptions = {},
): Promise<void> {
  // Check if there's already an active workflow
  const currentState = await workflowManager.getCurrentWorkflowState();
  if (currentState && currentState.status === "in-progress") {
    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message:
          "There's already an active workflow. Do you want to start a new one?",
        default: false,
      },
    ]);

    if (!proceed) {
      console.log(chalk.yellow("Workflow start cancelled"));
      return;
    }
  }

  // If no template specified, let user choose
  if (!templateId) {
    const templates = await workflowManager.listTemplates();
    if (templates.length === 0) {
      console.log(
        chalk.yellow(
          "No workflow templates found. Run 'rovo-code-flow workflow init' first.",
        ),
      );
      return;
    }

    const { selectedTemplate } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedTemplate",
        message: "Select a workflow template:",
        choices: templates.map((t) => ({
          name: `${t.name} - ${t.description}`,
          value: t.id,
        })),
      },
    ]);

    templateId = selectedTemplate;
  }

  try {
    await workflowManager.startWorkflow(templateId!);

    // Show workflow overview
    await showWorkflowOverview(workflowManager);

    // Ask if user wants to start immediately
    if (options.interactive !== false) {
      const { startNow } = await inquirer.prompt([
        {
          type: "confirm",
          name: "startNow",
          message: "Would you like to start executing the workflow now?",
          default: true,
        },
      ]);

      if (startNow) {
        await resumeWorkflow(workflowManager, undefined, options);
      }
    }
  } catch (error) {
    console.error(chalk.red("Error starting workflow:"), error);
  }
}

/**
 * Show current workflow status
 */
async function showWorkflowStatus(
  workflowManager: WorkflowManager,
): Promise<void> {
  const progress = await workflowManager.getWorkflowProgress();

  if (!progress.state || !progress.template) {
    console.log(chalk.yellow("No active workflow found"));
    console.log(
      chalk.blue("Start a new workflow with: rovo-code-flow workflow start"),
    );
    return;
  }

  const { template, state, progress: progressInfo } = progress;

  console.log(chalk.blue.bold(`\n📋 Workflow Status: ${template.name}`));
  console.log(chalk.gray(`Instance: ${state.instanceId}`));
  console.log(chalk.gray(`Started: ${state.startedAt.toLocaleString()}`));
  console.log(
    chalk.gray(`Status: ${getStatusColor(state.status)(state.status)}`),
  );

  // Progress bar
  const progressBar = createProgressBar(progressInfo.percentComplete);
  console.log(
    chalk.blue(`\nProgress: ${progressBar} ${progressInfo.percentComplete}%`),
  );
  console.log(
    chalk.blue(
      `Completed: ${progressInfo.completedPhases}/${progressInfo.totalPhases} phases`,
    ),
  );

  if (progressInfo.failedPhases > 0) {
    console.log(chalk.red(`Failed: ${progressInfo.failedPhases} phases`));
  }

  if (progressInfo.skippedPhases > 0) {
    console.log(chalk.yellow(`Skipped: ${progressInfo.skippedPhases} phases`));
  }

  // Show next phase
  if (progressInfo.nextPhase) {
    console.log(chalk.green(`\n🎯 Next Phase: ${progressInfo.nextPhase.name}`));
    console.log(chalk.gray(`   ${progressInfo.nextPhase.description}`));

    if (progressInfo.nextPhase.estimatedDuration) {
      console.log(
        chalk.gray(
          `   Estimated duration: ${progressInfo.nextPhase.estimatedDuration} minutes`,
        ),
      );
    }
  } else if (progressInfo.remainingPhases === 0) {
    console.log(chalk.green("\n🎉 Workflow completed!"));
  } else {
    console.log(chalk.yellow("\n⏸️  No phases available (check dependencies)"));
  }

  // Show blocked phases
  if (progressInfo.blockedPhases.length > 0) {
    console.log(
      chalk.yellow(
        `\n🚫 Blocked Phases (${progressInfo.blockedPhases.length}):`,
      ),
    );
    progressInfo.blockedPhases.forEach((phase) => {
      const missingDeps = phase.dependencies.filter(
        (depId) => !state.completedPhases[depId] && !state.skippedPhases[depId],
      );
      console.log(
        chalk.yellow(
          `   • ${phase.name} (waiting for: ${missingDeps.join(", ")})`,
        ),
      );
    });
  }

  // Show recent activity
  const recentActivity = getRecentActivity(state);
  if (recentActivity.length > 0) {
    console.log(chalk.blue("\n📈 Recent Activity:"));
    recentActivity.forEach((activity) => {
      console.log(`   ${activity}`);
    });
  }

  console.log(chalk.blue("\n💡 Available commands:"));
  if (progressInfo.nextPhase) {
    console.log("• rovo-code-flow workflow resume - Continue with next phase");
    console.log(
      "• rovo-code-flow workflow run <phase-id> - Run a specific phase",
    );
  }
  console.log("• rovo-code-flow workflow phases - List all phases");
  console.log("• rovo-code-flow workflow pause - Pause the workflow");
  console.log("• rovo-code-flow workflow reset - Reset workflow state");
}

/**
 * Resume workflow execution
 */
async function resumeWorkflow(
  workflowManager: WorkflowManager,
  phaseId?: string,
  options: WorkflowOptions = {},
): Promise<void> {
  const progress = await workflowManager.getWorkflowProgress();

  if (!progress.state || !progress.template) {
    console.log(chalk.yellow("No active workflow found"));
    return;
  }

  // If workflow is paused, resume it first
  if (progress.state.status === "paused") {
    await workflowManager.resumeWorkflow();
  }

  let targetPhase: WorkflowPhase | undefined;

  if (phaseId) {
    // Find specific phase
    targetPhase = progress.template.phases.find((p) => p.id === phaseId);
    if (!targetPhase) {
      console.log(chalk.red(`Phase "${phaseId}" not found`));
      return;
    }
  } else {
    // Use next available phase
    targetPhase = progress.progress.nextPhase;
  }

  if (!targetPhase) {
    if (progress.progress.remainingPhases === 0) {
      console.log(chalk.green("🎉 Workflow is already completed!"));
    } else {
      console.log(
        chalk.yellow("No phases available to execute. Check dependencies."),
      );
    }
    return;
  }

  console.log(chalk.blue(`\n🚀 Executing Phase: ${targetPhase.name}`));
  console.log(chalk.gray(`Description: ${targetPhase.description}`));

  if (options.dryRun) {
    console.log(
      chalk.yellow("\n🔍 DRY RUN MODE - Commands will not be executed"),
    );
  }

  // Execute phase commands
  const startTime = Date.now();
  let success = true;
  const artifacts: string[] = [];

  for (let i = 0; i < targetPhase.commands.length; i++) {
    const command = targetPhase.commands[i];
    console.log(
      chalk.blue(
        `\n📝 Step ${i + 1}/${targetPhase.commands.length}: ${command.description}`,
      ),
    );

    const fullCommand = `${command.command} ${command.args.join(" ")} ${(command.options || []).join(" ")}`;
    console.log(chalk.gray(`Command: ${fullCommand}`));

    if (options.dryRun) {
      console.log(chalk.yellow("   [DRY RUN] Command not executed"));
      continue;
    }

    try {
      const result = await executeCommand(
        command.command,
        [...command.args, ...(command.options || [])],
        command.timeout,
      );

      if (result.success) {
        console.log(chalk.green("   ✅ Success"));
        if (result.artifacts) {
          artifacts.push(...result.artifacts);
        }
      } else {
        console.log(chalk.red(`   ❌ Failed: ${result.error}`));

        if (command.critical !== false) {
          success = false;
          await workflowManager.failPhase(
            targetPhase.id,
            result.error || "Command execution failed",
          );
          break;
        } else {
          console.log(
            chalk.yellow("   ⚠️  Non-critical command failed, continuing..."),
          );
        }
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Error: ${error}`));
      success = false;
      await workflowManager.failPhase(targetPhase.id, error.toString());
      break;
    }
  }

  const duration = Date.now() - startTime;

  if (success && !options.dryRun) {
    // Validate phase completion
    const validationPassed = await workflowManager.validatePhase(targetPhase);

    if (validationPassed) {
      await workflowManager.completePhase(targetPhase.id, duration, artifacts);
      console.log(
        chalk.green(`\n🎉 Phase "${targetPhase.name}" completed successfully!`),
      );
      console.log(chalk.gray(`Duration: ${formatDuration(duration)}`));

      // Check if there's a next phase
      const updatedProgress = await workflowManager.getWorkflowProgress();
      if (updatedProgress.progress.nextPhase) {
        const { continueNext } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueNext",
            message: `Continue with next phase: "${updatedProgress.progress.nextPhase.name}"?`,
            default: true,
          },
        ]);

        if (continueNext) {
          await resumeWorkflow(workflowManager, undefined, options);
        }
      } else if (updatedProgress.progress.remainingPhases === 0) {
        console.log(
          chalk.green("\n🎊 Congratulations! Workflow completed successfully!"),
        );

        // Update workflow status to completed
        const state = await workflowManager.getCurrentWorkflowState();
        if (state) {
          state.status = "completed";
          await workflowManager.saveWorkflowState(state);
        }
      }
    } else {
      console.log(
        chalk.yellow(`\n⚠️  Phase "${targetPhase.name}" validation failed`),
      );
      console.log(
        chalk.blue(
          "You can manually mark it as complete with: rovo-code-flow workflow complete " +
            targetPhase.id,
        ),
      );
    }
  } else if (options.dryRun) {
    console.log(
      chalk.blue(`\n🔍 Dry run completed for phase "${targetPhase.name}"`),
    );
  }
}

/**
 * Complete a phase manually
 */
async function completePhase(
  workflowManager: WorkflowManager,
  phaseId?: string,
  options: WorkflowOptions = {},
): Promise<void> {
  if (!phaseId) {
    console.log(chalk.red("Phase ID is required"));
    return;
  }

  const progress = await workflowManager.getWorkflowProgress();
  if (!progress.template) {
    console.log(chalk.yellow("No active workflow found"));
    return;
  }

  const phase = progress.template.phases.find((p) => p.id === phaseId);
  if (!phase) {
    console.log(chalk.red(`Phase "${phaseId}" not found`));
    return;
  }

  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Mark phase "${phase.name}" as completed?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Operation cancelled"));
      return;
    }
  }

  await workflowManager.completePhase(phaseId);
}

/**
 * Skip a phase
 */
async function skipPhase(
  workflowManager: WorkflowManager,
  phaseId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: WorkflowOptions,
): Promise<void> {
  if (!phaseId) {
    console.log(chalk.red("Phase ID is required"));
    return;
  }

  const progress = await workflowManager.getWorkflowProgress();
  if (!progress.template) {
    console.log(chalk.yellow("No active workflow found"));
    return;
  }

  const phase = progress.template.phases.find((p) => p.id === phaseId);
  if (!phase) {
    console.log(chalk.red(`Phase "${phaseId}" not found`));
    return;
  }

  const { reason } = await inquirer.prompt([
    {
      type: "input",
      name: "reason",
      message: `Reason for skipping "${phase.name}":`,
      validate: (input) => input.trim().length > 0 || "Reason is required",
    },
  ]);

  await workflowManager.skipPhase(phaseId, reason);
}

/**
 * Reset workflow
 */
async function resetWorkflow(
  workflowManager: WorkflowManager,
  workflowOptions: WorkflowOptions = {},
): Promise<void> {
  if (!workflowOptions.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "Are you sure you want to reset the workflow? This will lose all progress.",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Reset cancelled"));
      return;
    }
  }

  await workflowManager.resetWorkflow();
}

/**
 * Pause workflow
 */
async function pauseWorkflow(workflowManager: WorkflowManager): Promise<void> {
  await workflowManager.pauseWorkflow();
}

/**
 * List available templates
 */
async function listTemplates(workflowManager: WorkflowManager): Promise<void> {
  const templates = await workflowManager.listTemplates();

  if (templates.length === 0) {
    console.log(chalk.yellow("No workflow templates found"));
    console.log(
      chalk.blue(
        "Initialize the workflow system with: rovo-code-flow workflow init",
      ),
    );
    return;
  }

  console.log(chalk.blue.bold("\n📚 Available Workflow Templates:"));

  templates.forEach((template) => {
    console.log(chalk.green(`\n• ${template.name} (${template.id})`));
    console.log(chalk.gray(`  ${template.description}`));
    console.log(
      chalk.gray(
        `  Version: ${template.version} | Phases: ${template.phases.length}`,
      ),
    );

    if (template.tags && template.tags.length > 0) {
      console.log(chalk.gray(`  Tags: ${template.tags.join(", ")}`));
    }
  });

  console.log(
    chalk.blue(
      "\n💡 Start a workflow with: rovo-code-flow workflow start <template-id>",
    ),
  );
}

/**
 * List phases in a template or current workflow
 */
async function listPhases(
  workflowManager: WorkflowManager,
  templateId?: string,
): Promise<void> {
  let template: WorkflowTemplate | null = null;
  let state: any = null;

  if (templateId) {
    template = await workflowManager.loadTemplate(templateId);
    if (!template) {
      console.log(chalk.red(`Template "${templateId}" not found`));
      return;
    }
  } else {
    const progress = await workflowManager.getWorkflowProgress();
    template = progress.template;
    state = progress.state;

    if (!template) {
      console.log(
        chalk.yellow(
          "No active workflow found. Specify a template ID or start a workflow.",
        ),
      );
      return;
    }
  }

  console.log(chalk.blue.bold(`\n📋 Phases in "${template.name}":`));

  template.phases.forEach((phase, index) => {
    const phaseNumber = (index + 1).toString().padStart(2, "0");
    let statusIcon = "⭕"; // Not started
    let statusColor = chalk.gray;

    if (state) {
      if (state.completedPhases[phase.id]) {
        statusIcon = "✅";
        statusColor = chalk.green;
      } else if (state.failedPhases[phase.id]) {
        statusIcon = "❌";
        statusColor = chalk.red;
      } else if (state.skippedPhases[phase.id]) {
        statusIcon = "⏭️";
        statusColor = chalk.yellow;
      }
    }

    console.log(
      statusColor(
        `\n${phaseNumber}. ${statusIcon} ${phase.name} (${phase.id})`,
      ),
    );
    console.log(chalk.gray(`    ${phase.description}`));

    if (phase.category) {
      console.log(chalk.gray(`    Category: ${phase.category}`));
    }

    if (phase.dependencies.length > 0) {
      console.log(
        chalk.gray(`    Dependencies: ${phase.dependencies.join(", ")}`),
      );
    }

    if (phase.estimatedDuration) {
      console.log(
        chalk.gray(
          `    Estimated duration: ${phase.estimatedDuration} minutes`,
        ),
      );
    }

    if (phase.optional) {
      console.log(chalk.gray(`    Optional: Yes`));
    }

    console.log(chalk.gray(`    Commands: ${phase.commands.length}`));
  });
}

/**
 * Validate a specific phase
 */
async function validatePhase(
  workflowManager: WorkflowManager,
  phaseId?: string,
): Promise<void> {
  if (!phaseId) {
    console.log(chalk.red("Phase ID is required"));
    return;
  }

  const progress = await workflowManager.getWorkflowProgress();
  if (!progress.template) {
    console.log(chalk.yellow("No active workflow found"));
    return;
  }

  const phase = progress.template.phases.find((p) => p.id === phaseId);
  if (!phase) {
    console.log(chalk.red(`Phase "${phaseId}" not found`));
    return;
  }

  console.log(chalk.blue(`Validating phase: ${phase.name}`));

  const isValid = await workflowManager.validatePhase(phase);

  if (isValid) {
    console.log(chalk.green("✅ Phase validation passed"));
  } else {
    console.log(chalk.red("❌ Phase validation failed"));
  }
}

/**
 * Run a specific phase
 */
async function runPhase(
  workflowManager: WorkflowManager,
  phaseId?: string,
  workflowOptions: WorkflowOptions = {},
): Promise<void> {
  if (!phaseId) {
    console.log(chalk.red("Phase ID is required"));
    return;
  }

  await resumeWorkflow(workflowManager, phaseId, workflowOptions);
}

/**
 * Show workflow overview
 */
async function showWorkflowOverview(
  workflowManager: WorkflowManager,
): Promise<void> {
  const progress = await workflowManager.getWorkflowProgress();

  if (!progress.template) {
    return;
  }

  const { template } = progress;

  console.log(chalk.blue.bold(`\n📋 Workflow Overview: ${template.name}`));
  console.log(chalk.gray(template.description));
  console.log(
    chalk.gray(
      `Version: ${template.version} | Total phases: ${template.phases.length}`,
    ),
  );

  // Group phases by category
  const phasesByCategory = template.phases.reduce(
    (acc, phase) => {
      const category = phase.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(phase);
      return acc;
    },
    {} as Record<string, WorkflowPhase[]>,
  );

  Object.entries(phasesByCategory).forEach(([category, phases]) => {
    console.log(
      chalk.blue(
        `\n📂 ${category.charAt(0).toUpperCase() + category.slice(1)}:`,
      ),
    );
    phases.forEach((phase) => {
      const optional = phase.optional ? " (optional)" : "";
      const duration = phase.estimatedDuration
        ? ` (~${phase.estimatedDuration}m)`
        : "";
      console.log(chalk.gray(`   • ${phase.name}${optional}${duration}`));
    });
  });

  const totalEstimatedTime = template.phases
    .filter((p) => p.estimatedDuration)
    .reduce((sum, p) => sum + (p.estimatedDuration || 0), 0);

  if (totalEstimatedTime > 0) {
    console.log(
      chalk.blue(
        `\n⏱️  Estimated total time: ${totalEstimatedTime} minutes (${Math.round(totalEstimatedTime / 60)} hours)`,
      ),
    );
  }
}

/**
 * Execute a command and return result
 */
async function executeCommand(
  command: string,
  args: string[],
  timeout: number = 60000,
): Promise<{ success: boolean; error?: string; artifacts?: string[] }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "pipe",
      shell: true,
      timeout,
    });

    let stderr = "";

    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: stderr || `Command exited with code ${code}`,
        });
      }
    });

    child.on("error", (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

/**
 * Create a visual progress bar
 */
function createProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Get status color based on workflow status
 */
function getStatusColor(status: string): (text: string) => string {
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

/**
 * Get recent activity from workflow state
 */
function getRecentActivity(state: any): string[] {
  const activities: Array<{ time: Date; message: string }> = [];

  // Add completed phases
  Object.entries(state.completedPhases).forEach(
    ([phaseId, info]: [string, any]) => {
      activities.push({
        time: new Date(info.completedAt),
        message: chalk.green(`✅ Completed: ${phaseId}`),
      });
    },
  );

  // Add failed phases
  Object.entries(state.failedPhases).forEach(
    ([phaseId, info]: [string, any]) => {
      activities.push({
        time: new Date(info.failedAt),
        message: chalk.red(`❌ Failed: ${phaseId}`),
      });
    },
  );

  // Add skipped phases
  Object.entries(state.skippedPhases).forEach(
    ([phaseId, info]: [string, any]) => {
      activities.push({
        time: new Date(info.skippedAt),
        message: chalk.yellow(`⏭️ Skipped: ${phaseId}`),
      });
    },
  );

  // Sort by time and return last 5
  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5)
    .map((activity) => activity.message);
}
