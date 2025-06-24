/**
 * Workflow Management System
 *
 * Enterprise-grade workflow orchestration with phase tracking,
 * dependency management, and state persistence.
 */

import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import { validateFilePath } from "./utils";

export interface WorkflowPhase {
  /** Unique identifier for the phase */
  id: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Phase dependencies (must be completed first) */
  dependencies: string[];
  /** Commands to execute in this phase */
  commands: WorkflowCommand[];
  /** Estimated duration in minutes */
  estimatedDuration?: number;
  /** Whether this phase is optional */
  optional?: boolean;
  /** Phase category for grouping */
  category?: string;
  /** Validation criteria for completion */
  validation?: WorkflowValidation;
}

export interface WorkflowCommand {
  /** Command to execute */
  command: string;
  /** Command arguments */
  args: string[];
  /** Command options/flags */
  options?: string[];
  /** Description of what this command does */
  description: string;
  /** Whether this command is critical for phase completion */
  critical?: boolean;
  /** Expected execution time in seconds */
  timeout?: number;
}

export interface WorkflowValidation {
  /** Files that should exist after phase completion */
  requiredFiles?: string[];
  /** Directories that should exist */
  requiredDirectories?: string[];
  /** Custom validation function */
  customValidation?: () => Promise<boolean>;
}

export interface WorkflowTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template version */
  version: string;
  /** Template author */
  author?: string;
  /** Template tags for categorization */
  tags?: string[];
  /** All phases in this workflow */
  phases: WorkflowPhase[];
  /** Global configuration */
  config?: Record<string, any>;
}

export interface WorkflowState {
  /** Workflow template ID */
  templateId: string;
  /** Current workflow instance ID */
  instanceId: string;
  /** Workflow start time */
  startedAt: Date;
  /** Last update time */
  updatedAt: Date;
  /** Current phase being executed */
  currentPhase?: string;
  /** Completed phases with timestamps */
  completedPhases: Record<
    string,
    {
      completedAt: Date;
      duration: number;
      success: boolean;
      artifacts?: string[];
    }
  >;
  /** Failed phases with error details */
  failedPhases: Record<
    string,
    {
      failedAt: Date;
      error: string;
      retryCount: number;
    }
  >;
  /** Skipped phases with reasons */
  skippedPhases: Record<
    string,
    {
      skippedAt: Date;
      reason: string;
    }
  >;
  /** Overall workflow status */
  status: "not-started" | "in-progress" | "completed" | "failed" | "paused";
  /** Workflow metadata */
  metadata: Record<string, any>;
}

export class WorkflowManager {
  private workflowsPath: string;
  private templatesPath: string;
  private statePath: string;

  constructor() {
    const rovoDir = path.join(os.homedir(), ".rovodev");
    this.workflowsPath = path.join(rovoDir, "workflows");
    this.templatesPath = path.join(rovoDir, "workflow-templates");
    this.statePath = path.join(rovoDir, "workflow-state.json");

    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.workflowsPath, this.templatesPath].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize workflow system with default templates
   */
  public async initialize(): Promise<void> {
    console.log(chalk.blue("Initializing workflow management system..."));

    // Create default calculator workflow template
    await this.createDefaultCalculatorTemplate();

    // Create default generic development template
    await this.createDefaultGenericTemplate();

    console.log(chalk.green("Workflow system initialized successfully!"));
  }

  /**
   * Create default calculator workflow template
   */
  private async createDefaultCalculatorTemplate(): Promise<void> {
    const calculatorTemplate: WorkflowTemplate = {
      id: "calculator-development",
      name: "Modern Calculator Development",
      description:
        "Complete workflow for building a modern web calculator with React and TypeScript",
      version: "1.0.0",
      author: "Rovo Code Flow",
      tags: ["react", "typescript", "calculator", "web-development"],
      phases: [
        {
          id: "initialization",
          name: "Project Initialization",
          description: "Set up project structure and initial configuration",
          dependencies: [],
          category: "setup",
          estimatedDuration: 10,
          commands: [
            {
              command: "rovo-code-flow",
              args: ["init", "--sparc", "--event"],
              description: "Initialize SPARC and Event Modeling modes",
            },
            {
              command: "rovo-code-flow",
              args: [
                "memory",
                "add",
                "Building a modern web-based calculator with React, TypeScript, and advanced features",
              ],
              options: ["--repo"],
              description: "Add project context to repository memory",
            },
          ],
          validation: {
            requiredDirectories: [".sparc", ".event-modeling"],
            requiredFiles: [".agent.local.md"],
          },
        },
        {
          id: "architecture",
          name: "Architecture and Design",
          description: "Design system architecture and component structure",
          dependencies: ["initialization"],
          category: "design",
          estimatedDuration: 30,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "architect",
                "Design the overall architecture for a modern calculator application with modular components",
              ],
              description: "Design overall system architecture",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "architect",
                "Design the component hierarchy and data flow for the calculator",
              ],
              description: "Design component structure",
            },
          ],
        },
        {
          id: "event-modeling",
          name: "Event Modeling",
          description: "Model business logic and user interactions",
          dependencies: ["architecture"],
          category: "design",
          estimatedDuration: 25,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "event",
                "modeler",
                "Model the complete calculation workflow from user input to result display",
              ],
              description: "Model calculation workflow",
            },
            {
              command: "rovo-code-flow",
              args: [
                "event",
                "timeline",
                "Create a timeline for user interactions: button press → calculation → display update",
              ],
              description: "Create interaction timeline",
            },
          ],
        },
        {
          id: "tdd",
          name: "Test-Driven Development",
          description: "Write comprehensive tests before implementation",
          dependencies: ["event-modeling"],
          category: "testing",
          estimatedDuration: 45,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "tdd",
                "Write comprehensive tests for the calculator engine covering basic arithmetic and edge cases",
              ],
              description: "Write calculator engine tests",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "tdd",
                "Write tests for React component interactions and state updates",
              ],
              description: "Write component tests",
            },
          ],
        },
        {
          id: "implementation",
          name: "Core Implementation",
          description: "Implement calculator functionality and UI components",
          dependencies: ["tdd"],
          category: "development",
          estimatedDuration: 90,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "coder",
                "Set up the React TypeScript project with Vite and configure development environment",
              ],
              description: "Set up project structure",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "coder",
                "Implement the calculator engine with support for basic arithmetic and expression parsing",
              ],
              description: "Implement calculator engine",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "coder",
                "Implement the main Calculator component with Display, Keypad, and Button components",
              ],
              description: "Implement UI components",
            },
          ],
        },
        {
          id: "security",
          name: "Security Review",
          description: "Perform security analysis and hardening",
          dependencies: ["implementation"],
          category: "security",
          estimatedDuration: 20,
          optional: true,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "security",
                "Review input validation and sanitization to prevent injection attacks",
              ],
              description: "Review input validation",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "security",
                "Analyze client-side security including XSS prevention and secure storage",
              ],
              description: "Analyze client-side security",
            },
          ],
        },
        {
          id: "deployment",
          name: "DevOps and Deployment",
          description: "Set up CI/CD and deploy the application",
          dependencies: ["implementation"],
          category: "deployment",
          estimatedDuration: 30,
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "devops",
                "Set up CI/CD pipeline with automated testing and deployment",
              ],
              description: "Set up CI/CD pipeline",
            },
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "devops",
                "Configure performance monitoring and error tracking",
              ],
              description: "Configure monitoring",
            },
          ],
        },
      ],
      config: {
        allowParallelExecution: false,
        autoSaveState: true,
        retryFailedCommands: true,
        maxRetries: 3,
      },
    };

    await this.saveTemplate(calculatorTemplate);
  }

  /**
   * Create default generic development template
   */
  private async createDefaultGenericTemplate(): Promise<void> {
    const genericTemplate: WorkflowTemplate = {
      id: "generic-development",
      name: "Generic Development Workflow",
      description:
        "A flexible workflow template for general software development projects",
      version: "1.0.0",
      author: "Rovo Code Flow",
      tags: ["development", "generic", "flexible"],
      phases: [
        {
          id: "setup",
          name: "Project Setup",
          description: "Initialize project and set up development environment",
          dependencies: [],
          category: "setup",
          commands: [
            {
              command: "rovo-code-flow",
              args: ["init", "--sparc"],
              description: "Initialize SPARC methodology",
            },
          ],
        },
        {
          id: "planning",
          name: "Planning and Architecture",
          description: "Plan project architecture and design",
          dependencies: ["setup"],
          category: "design",
          commands: [
            {
              command: "rovo-code-flow",
              args: [
                "sparc",
                "architect",
                "Design the overall system architecture",
              ],
              description: "Design system architecture",
            },
          ],
        },
        {
          id: "development",
          name: "Development",
          description: "Implement core functionality",
          dependencies: ["planning"],
          category: "development",
          commands: [
            {
              command: "rovo-code-flow",
              args: ["sparc", "coder", "Implement core functionality"],
              description: "Implement core features",
            },
          ],
        },
      ],
    };

    await this.saveTemplate(genericTemplate);
  }

  /**
   * Save a workflow template
   */
  public async saveTemplate(template: WorkflowTemplate): Promise<void> {
    const templatePath = path.join(this.templatesPath, `${template.id}.json`);
    const validatedPath = validateFilePath(templatePath, [this.templatesPath]);

    fs.writeFileSync(validatedPath, JSON.stringify(template, null, 2));
    console.log(chalk.green(`Template "${template.name}" saved successfully`));
  }

  /**
   * Load a workflow template
   */
  public async loadTemplate(
    templateId: string,
  ): Promise<WorkflowTemplate | null> {
    const templatePath = path.join(this.templatesPath, `${templateId}.json`);

    if (!fs.existsSync(templatePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(templatePath, "utf8");
      return JSON.parse(content) as WorkflowTemplate;
    } catch (error) {
      console.error(chalk.red(`Error loading template ${templateId}:`), error);
      return null;
    }
  }

  /**
   * List all available templates
   */
  public async listTemplates(): Promise<WorkflowTemplate[]> {
    const templates: WorkflowTemplate[] = [];

    if (!fs.existsSync(this.templatesPath)) {
      return templates;
    }

    const files = fs.readdirSync(this.templatesPath);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const templateId = path.basename(file, ".json");
        const template = await this.loadTemplate(templateId);
        if (template) {
          templates.push(template);
        }
      }
    }

    return templates;
  }

  /**
   * Start a new workflow instance
   */
  public async startWorkflow(
    templateId: string,
    instanceId?: string,
  ): Promise<string> {
    const template = await this.loadTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const workflowInstanceId = instanceId || `${templateId}-${Date.now()}`;

    const initialState: WorkflowState = {
      templateId,
      instanceId: workflowInstanceId,
      startedAt: new Date(),
      updatedAt: new Date(),
      completedPhases: {},
      failedPhases: {},
      skippedPhases: {},
      status: "not-started",
      metadata: {
        templateVersion: template.version,
        projectPath: process.cwd(),
      },
    };

    await this.saveWorkflowState(initialState);

    console.log(
      chalk.green(
        `Started workflow "${template.name}" (${workflowInstanceId})`,
      ),
    );
    return workflowInstanceId;
  }

  /**
   * Get current workflow state
   */
  public async getCurrentWorkflowState(): Promise<WorkflowState | null> {
    if (!fs.existsSync(this.statePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.statePath, "utf8");
      const state = JSON.parse(content) as WorkflowState;

      // Convert date strings back to Date objects
      state.startedAt = new Date(state.startedAt);
      state.updatedAt = new Date(state.updatedAt);

      Object.keys(state.completedPhases).forEach((phaseId) => {
        state.completedPhases[phaseId].completedAt = new Date(
          state.completedPhases[phaseId].completedAt,
        );
      });

      Object.keys(state.failedPhases).forEach((phaseId) => {
        state.failedPhases[phaseId].failedAt = new Date(
          state.failedPhases[phaseId].failedAt,
        );
      });

      Object.keys(state.skippedPhases).forEach((phaseId) => {
        state.skippedPhases[phaseId].skippedAt = new Date(
          state.skippedPhases[phaseId].skippedAt,
        );
      });

      return state;
    } catch (error) {
      console.error(chalk.red("Error loading workflow state:"), error);
      return null;
    }
  }

  /**
   * Save workflow state
   */
  public async saveWorkflowState(state: WorkflowState): Promise<void> {
    state.updatedAt = new Date();

    const validatedPath = validateFilePath(this.statePath, [
      path.dirname(this.statePath),
    ]);
    fs.writeFileSync(validatedPath, JSON.stringify(state, null, 2));
  }

  /**
   * Mark a phase as completed
   */
  public async completePhase(
    phaseId: string,
    duration: number = 0,
    artifacts: string[] = [],
  ): Promise<void> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      throw new Error("No active workflow found");
    }

    state.completedPhases[phaseId] = {
      completedAt: new Date(),
      duration,
      success: true,
      artifacts,
    };

    // Remove from failed phases if it was there
    delete state.failedPhases[phaseId];

    await this.saveWorkflowState(state);
    console.log(chalk.green(`Phase "${phaseId}" marked as completed`));
  }

  /**
   * Mark a phase as failed
   */
  public async failPhase(phaseId: string, error: string): Promise<void> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      throw new Error("No active workflow found");
    }

    const existingFailure = state.failedPhases[phaseId];
    const retryCount = existingFailure ? existingFailure.retryCount + 1 : 1;

    state.failedPhases[phaseId] = {
      failedAt: new Date(),
      error,
      retryCount,
    };

    await this.saveWorkflowState(state);
    console.log(chalk.red(`Phase "${phaseId}" marked as failed: ${error}`));
  }

  /**
   * Skip a phase with reason
   */
  public async skipPhase(phaseId: string, reason: string): Promise<void> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      throw new Error("No active workflow found");
    }

    state.skippedPhases[phaseId] = {
      skippedAt: new Date(),
      reason,
    };

    await this.saveWorkflowState(state);
    console.log(chalk.yellow(`Phase "${phaseId}" skipped: ${reason}`));
  }

  /**
   * Get workflow progress summary
   */
  public async getWorkflowProgress(): Promise<{
    template: WorkflowTemplate | null;
    state: WorkflowState | null;
    progress: {
      totalPhases: number;
      completedPhases: number;
      failedPhases: number;
      skippedPhases: number;
      remainingPhases: number;
      percentComplete: number;
      nextPhase?: WorkflowPhase;
      blockedPhases: WorkflowPhase[];
    };
  }> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      return {
        template: null,
        state: null,
        progress: {
          totalPhases: 0,
          completedPhases: 0,
          failedPhases: 0,
          skippedPhases: 0,
          remainingPhases: 0,
          percentComplete: 0,
          blockedPhases: [],
        },
      };
    }

    const template = await this.loadTemplate(state.templateId);
    if (!template) {
      throw new Error(`Template "${state.templateId}" not found`);
    }

    const totalPhases = template.phases.length;
    const completedPhases = Object.keys(state.completedPhases).length;
    const failedPhases = Object.keys(state.failedPhases).length;
    const skippedPhases = Object.keys(state.skippedPhases).length;
    const remainingPhases = totalPhases - completedPhases - skippedPhases;
    const percentComplete = Math.round((completedPhases / totalPhases) * 100);

    // Find next available phase
    const nextPhase = this.findNextAvailablePhase(template, state);

    // Find blocked phases
    const blockedPhases = this.findBlockedPhases(template, state);

    return {
      template,
      state,
      progress: {
        totalPhases,
        completedPhases,
        failedPhases,
        skippedPhases,
        remainingPhases,
        percentComplete,
        nextPhase,
        blockedPhases,
      },
    };
  }

  /**
   * Find the next available phase to execute
   */
  private findNextAvailablePhase(
    template: WorkflowTemplate,
    state: WorkflowState,
  ): WorkflowPhase | undefined {
    for (const phase of template.phases) {
      // Skip if already completed or skipped
      if (state.completedPhases[phase.id] || state.skippedPhases[phase.id]) {
        continue;
      }

      // Check if all dependencies are satisfied
      const dependenciesSatisfied = phase.dependencies.every(
        (depId) => state.completedPhases[depId] || state.skippedPhases[depId],
      );

      if (dependenciesSatisfied) {
        return phase;
      }
    }

    return undefined;
  }

  /**
   * Find phases that are blocked by dependencies
   */
  private findBlockedPhases(
    template: WorkflowTemplate,
    state: WorkflowState,
  ): WorkflowPhase[] {
    const blockedPhases: WorkflowPhase[] = [];

    for (const phase of template.phases) {
      // Skip if already completed or skipped
      if (state.completedPhases[phase.id] || state.skippedPhases[phase.id]) {
        continue;
      }

      // Check if any dependencies are not satisfied
      const hasUnsatisfiedDependencies = phase.dependencies.some(
        (depId) => !state.completedPhases[depId] && !state.skippedPhases[depId],
      );

      if (hasUnsatisfiedDependencies) {
        blockedPhases.push(phase);
      }
    }

    return blockedPhases;
  }

  /**
   * Validate phase completion
   */
  public async validatePhase(phase: WorkflowPhase): Promise<boolean> {
    if (!phase.validation) {
      return true;
    }

    const validation = phase.validation;

    // Check required files
    if (validation.requiredFiles) {
      for (const file of validation.requiredFiles) {
        if (!fs.existsSync(file)) {
          console.log(
            chalk.yellow(
              `Validation failed: Required file "${file}" not found`,
            ),
          );
          return false;
        }
      }
    }

    // Check required directories
    if (validation.requiredDirectories) {
      for (const dir of validation.requiredDirectories) {
        if (!fs.existsSync(dir)) {
          console.log(
            chalk.yellow(
              `Validation failed: Required directory "${dir}" not found`,
            ),
          );
          return false;
        }
      }
    }

    // Run custom validation
    if (validation.customValidation) {
      try {
        const result = await validation.customValidation();
        if (!result) {
          console.log(
            chalk.yellow(`Validation failed: Custom validation returned false`),
          );
          return false;
        }
      } catch (error) {
        console.log(
          chalk.yellow(
            `Validation failed: Custom validation threw error: ${error}`,
          ),
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Reset workflow state
   */
  public async resetWorkflow(): Promise<void> {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
      console.log(chalk.green("Workflow state reset successfully"));
    } else {
      console.log(chalk.yellow("No workflow state to reset"));
    }
  }

  /**
   * Pause current workflow
   */
  public async pauseWorkflow(): Promise<void> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      throw new Error("No active workflow found");
    }

    state.status = "paused";
    await this.saveWorkflowState(state);
    console.log(chalk.yellow("Workflow paused"));
  }

  /**
   * Resume paused workflow
   */
  public async resumeWorkflow(): Promise<void> {
    const state = await this.getCurrentWorkflowState();
    if (!state) {
      throw new Error("No active workflow found");
    }

    if (state.status !== "paused") {
      throw new Error("Workflow is not paused");
    }

    state.status = "in-progress";
    await this.saveWorkflowState(state);
    console.log(chalk.green("Workflow resumed"));
  }
}
