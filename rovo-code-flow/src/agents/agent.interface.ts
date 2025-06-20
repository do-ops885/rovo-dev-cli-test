/**
 * Interface for all agents in the system
 */

export interface TaskContext {
  /**
   * Task description
   */
  description: string;

  /**
   * Task priority (1-5, where 5 is highest)
   */
  priority?: number;

  /**
   * Task deadline (if applicable)
   */
  deadline?: Date;

  /**
   * Related tasks
   */
  relatedTasks?: string[];

  /**
   * Project context
   */
  project?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

export interface TaskResult {
  /**
   * Whether the task was successful
   */
  success: boolean;

  /**
   * Result message
   */
  message: string;

  /**
   * Output artifacts (e.g., code, documentation)
   */
  artifacts?: Record<string, any>;

  /**
   * Execution time in milliseconds
   */
  executionTime?: number;

  /**
   * Execution steps
   */
  steps?: {
    name: string;
    status: "success" | "warning" | "error";
    message?: string;
    duration?: number;
  }[];

  /**
   * Error details (if any)
   */
  error?: Error;

  /**
   * Suggestions for next steps
   */
  suggestions?: string[];
}

export interface Agent {
  /**
   * Unique identifier for the agent
   */
  id: string;

  /**
   * Name of the agent
   */
  name: string;

  /**
   * Type of agent (SPARC, Event, etc.)
   */
  type: string;

  /**
   * Current status of the agent
   */
  status: "idle" | "busy" | "error" | "paused";

  /**
   * Agent capabilities
   */
  capabilities: string[];

  /**
   * Agent configuration
   */
  config: Record<string, any>;

  /**
   * Initialize the agent
   */
  initialize(): Promise<void>;

  /**
   * Execute a task with context
   */
  executeTask(task: string | TaskContext): Promise<TaskResult>;

  /**
   * Stop the agent
   */
  stop(): Promise<void>;

  /**
   * Pause the agent
   */
  pause(): Promise<void>;

  /**
   * Resume the agent
   */
  resume(): Promise<void>;

  /**
   * Get agent information
   */
  getInfo(): any;

  /**
   * Get agent metrics
   */
  getMetrics(): Promise<Record<string, any>>;

  /**
   * Collaborate with another agent
   */
  collaborateWith(
    agent: Agent,
    task: string | TaskContext,
  ): Promise<TaskResult>;
}
