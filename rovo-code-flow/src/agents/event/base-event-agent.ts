/**
 * Base class for Event Modeling agents
 */

import { Agent, TaskContext, TaskResult } from '../agent.interface';
import { generateId, log } from '../../utils';

export abstract class BaseEventAgent implements Agent {
  public id: string;
  public name: string;
  public type: string = 'Event';
  public status: 'idle' | 'busy' | 'error' | 'paused' = 'idle';
  public capabilities: string[] = [];
  public config: Record<string, any> = {};
  
  // Metrics tracking
  protected taskHistory: {
    taskId: string;
    description: string;
    startTime: Date;
    endTime?: Date;
    result?: TaskResult;
  }[] = [];
  
  constructor(name: string, capabilities: string[] = []) {
    this.id = generateId();
    this.name = name;
    this.capabilities = capabilities;
  }
  
  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    log(`Initializing ${this.name} agent...`, 'info');
    this.status = 'idle';
    
    // Load agent-specific resources
    await this.loadResources();
    
    log(`${this.name} agent initialized`, 'success');
  }
  
  /**
   * Load agent-specific resources
   */
  protected async loadResources(): Promise<void> {
    // Base implementation - override in specific agents
  }
  
  /**
   * Execute a task
   */
  public async executeTask(task: string | TaskContext): Promise<TaskResult> {
    const startTime = new Date();
    const taskId = generateId();
    const taskDescription = typeof task === 'string' ? task : task.description;
    // Using taskDescription for logging and history
    
    // Create task history entry
    this.taskHistory.push({
      taskId,
      description: taskDescription,
      startTime
    });
    
    // Set agent status
    this.status = 'busy';
    
    try {
      // Convert string task to TaskContext if needed
      const taskContext: TaskContext = typeof task === 'string' 
        ? { description: task } 
        : task;
      
      // Execute the task with context
      log(`${this.name} agent executing task: ${taskDescription}`, 'info');
      
      // Process the task
      const result = await this.processTask(taskContext);
      
      // Update task history
      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();
      
      const taskResult: TaskResult = {
        ...result,
        executionTime
      };
      
      // Update task history
      const historyEntry = this.taskHistory.find(t => t.taskId === taskId);
      if (historyEntry) {
        historyEntry.endTime = endTime;
        historyEntry.result = taskResult;
      }
      
      // Set agent status back to idle
      this.status = 'idle';
      
      return taskResult;
    } catch (error) {
      // Handle errors
      this.status = 'error';
      
      const errorResult: TaskResult = {
        success: false,
        message: `Error executing task: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime: new Date().getTime() - startTime.getTime()
      };
      
      // Update task history
      const historyEntry = this.taskHistory.find(t => t.taskId === taskId);
      if (historyEntry) {
        historyEntry.endTime = new Date();
        historyEntry.result = errorResult;
      }
      
      log(`Error in ${this.name} agent: ${errorResult.message}`, 'error');
      
      return errorResult;
    }
  }
  
  /**
   * Process a task with context
   */
  protected abstract processTask(taskContext: TaskContext): Promise<TaskResult>;
  
  /**
   * Stop the agent
   */
  public async stop(): Promise<void> {
    log(`Stopping ${this.name} agent...`, 'info');
    // Perform cleanup
    this.status = 'idle';
    log(`${this.name} agent stopped`, 'success');
  }
  
  /**
   * Pause the agent
   */
  public async pause(): Promise<void> {
    if (this.status === 'busy') {
      log(`Pausing ${this.name} agent...`, 'info');
      this.status = 'paused';
      log(`${this.name} agent paused`, 'success');
    } else {
      log(`Cannot pause ${this.name} agent: not busy`, 'warn');
    }
  }
  
  /**
   * Resume the agent
   */
  public async resume(): Promise<void> {
    if (this.status === 'paused') {
      log(`Resuming ${this.name} agent...`, 'info');
      this.status = 'busy';
      log(`${this.name} agent resumed`, 'success');
    } else {
      log(`Cannot resume ${this.name} agent: not paused`, 'warn');
    }
  }
  
  /**
   * Get agent information
   */
  public getInfo(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      capabilities: this.capabilities,
      config: this.config,
      taskCount: this.taskHistory.length,
      activeSince: this.taskHistory.length > 0 ? this.taskHistory[0].startTime : null
    };
  }
  
  /**
   * Get agent metrics
   */
  public async getMetrics(): Promise<Record<string, any>> {
    const completedTasks = this.taskHistory.filter(t => t.endTime);
    const successfulTasks = completedTasks.filter(t => t.result?.success);
    
    const totalExecutionTime = completedTasks.reduce((total, task) => {
      if (task.endTime && task.startTime) {
        return total + (task.endTime.getTime() - task.startTime.getTime());
      }
      return total;
    }, 0);
    
    const averageExecutionTime = completedTasks.length > 0 
      ? totalExecutionTime / completedTasks.length 
      : 0;
    
    return {
      totalTasks: this.taskHistory.length,
      completedTasks: completedTasks.length,
      successfulTasks: successfulTasks.length,
      failedTasks: completedTasks.length - successfulTasks.length,
      successRate: completedTasks.length > 0 
        ? (successfulTasks.length / completedTasks.length) * 100 
        : 0,
      totalExecutionTime,
      averageExecutionTime,
      lastTaskTime: completedTasks.length > 0 
        ? completedTasks[completedTasks.length - 1].endTime 
        : null
    };
  }
  
  /**
   * Collaborate with another agent
   */
  public async collaborateWith(agent: Agent, task: string | TaskContext): Promise<TaskResult> {
    log(`${this.name} collaborating with ${agent.name} on task...`, 'info');
    
    const taskDescription = typeof task === 'string' ? task : task.description;
    
    // First, this agent processes the task
    const myResult = await this.executeTask(task);
    
    if (!myResult.success) {
      log(`Collaboration halted: ${this.name} failed to complete its part`, 'error');
      return myResult;
    }
    
    // Then, pass to the collaborating agent with context from first result
    const collaborationContext = typeof task === 'string' 
      ? { 
          description: task,
          metadata: { 
            collaborationWith: this.name,
            previousResult: myResult 
          }
        } 
      : {
          ...task,
          metadata: {
            ...(task.metadata || {}),
            collaborationWith: this.name,
            previousResult: myResult
          }
        };
    
    // Execute the collaborating agent's task
    const theirResult = await agent.executeTask(collaborationContext);
    
    // Combine results
    const combinedResult: TaskResult = {
      success: theirResult.success,
      message: `Collaboration between ${this.name} and ${agent.name}: ${theirResult.message}`,
      artifacts: {
        ...(myResult.artifacts || {}),
        ...(theirResult.artifacts || {})
      },
      executionTime: (myResult.executionTime || 0) + (theirResult.executionTime || 0),
      steps: [
        ...(myResult.steps || []),
        ...(theirResult.steps || [])
      ],
      suggestions: [
        ...(myResult.suggestions || []),
        ...(theirResult.suggestions || [])
      ]
    };
    
    log(`Collaboration between ${this.name} and ${agent.name} completed`, 'success');
    
    return combinedResult;
  }
  
  /**
   * Helper method to simulate async work
   */
  protected async simulateWork(ms: number, stepName?: string): Promise<void> {
    if (stepName) {
      log(`${stepName}...`, 'info');
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}