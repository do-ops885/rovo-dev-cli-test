/**
 * Event Modeler Agent
 */

import { BaseEventAgent } from "./base-event-agent";
import { log } from "../../utils";
import type { TaskContext, TaskResult } from "../agent.interface";
import { AcliIntegration } from "../../acli-integration";
import fs from "fs";
import path from "path";

export class ModelerAgent extends BaseEventAgent {
  private acli: AcliIntegration;

  constructor() {
    super("Modeler", [
      "event-modeling",
      "domain-analysis",
      "timeline-creation",
    ]);
    this.acli = new AcliIntegration();
  }

  /**
   * Process an event modeling task
   */
  protected async processTask(taskContext: TaskContext): Promise<TaskResult> {
    log(`ModelerAgent processing task: ${taskContext.description}`, "info");

    try {
      // Check if we have previous results from another agent
      const previousResult = taskContext.metadata?.previousResult;
      let domainContext: Record<string, any> = {};

      // Step 1: Analyze domain
      log("Analyzing domain...", "info");
      if (previousResult && previousResult.artifacts?.requirements) {
        // If we have requirements from a previous agent (like CoderAgent),
        // use them to inform our domain analysis
        log(
          "Using requirements from previous agent for domain analysis...",
          "info",
        );
        domainContext = this.extractDomainContextFromRequirements(
          previousResult.artifacts.requirements,
        );
      }
      await this.simulateWork(1000);

      // Step 2: Identify events
      log("Identifying events...", "info");
      const events = await this.identifyEvents(
        taskContext.description,
        domainContext,
      );
      await this.simulateWork(1500);

      // Step 3: Create event timeline
      log("Creating event timeline...", "info");
      const timeline = await this.createEventTimeline(events);
      await this.simulateWork(2000);

      // Step 4: Map state changes
      log("Mapping state changes...", "info");
      const stateChanges = await this.mapStateChanges(events);
      await this.simulateWork(1500);

      // Step 5: Generate model
      log("Generating event model...", "info");
      const model = await this.generateEventModel(
        events,
        timeline,
        stateChanges,
      );
      // No need for simulate work here as the generateEventModel method already takes time

      // Step 6: Save model to file if requested
      if (taskContext.metadata?.saveToFile) {
        log("Saving event model to file...", "info");
        const outputDir = taskContext.metadata.outputDir || "./event-models";
        const fileName =
          taskContext.metadata.fileName ||
          `event-model-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
        await this.saveModelToFile(model, outputDir, fileName);
      }

      log("Event model complete", "success");

      // Prepare suggestions based on context
      const suggestions = [
        "Review the event model with domain experts",
        "Consider adding more detailed state transitions",
        "Map the events to UI components",
      ];

      // Add specific suggestions based on domain context
      if (domainContext.complexityLevel === "high") {
        suggestions.push(
          "Consider breaking down the model into smaller bounded contexts",
        );
        suggestions.push(
          "Implement event sourcing pattern for complex state management",
        );
      }

      return {
        success: true,
        message: "Event model created successfully",
        artifacts: {
          events,
          timeline,
          stateChanges,
          model,
          domainContext,
        },
        steps: [
          { name: "Domain Analysis", status: "success", duration: 1000 },
          { name: "Event Identification", status: "success", duration: 1500 },
          { name: "Timeline Creation", status: "success", duration: 2000 },
          { name: "State Mapping", status: "success", duration: 1500 },
          { name: "Model Generation", status: "success", duration: 1000 },
        ],
        suggestions,
      };
    } catch (error) {
      log(`Error in event modeling: ${error}`, "error");
      return {
        success: false,
        message: `Error creating event model: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Extract domain context from requirements provided by another agent
   */
  private extractDomainContextFromRequirements(
    requirements: Record<string, any>,
  ): Record<string, any> {
    const domainContext: Record<string, any> = {
      entities: [],
      actions: [],
      complexityLevel: "medium",
    };

    // Extract entities from requirements
    if (requirements.functionality) {
      requirements.functionality.forEach((req: string) => {
        // Extract nouns as potential entities
        const words = req.split(" ");
        const nouns = words.filter(
          (word) =>
            word.length > 3 &&
            !word.match(
              /^(handle|process|manage|create|update|delete|get|set)$/i,
            ),
        );

        domainContext.entities.push(...nouns);
      });
    }

    // Extract actions from requirements
    if (requirements.functionality) {
      requirements.functionality.forEach((req: string) => {
        // Extract verbs as potential actions
        const words = req.split(" ");
        const verbs = words.filter((word) =>
          word.match(/^(handle|process|manage|create|update|delete|get|set)$/i),
        );

        domainContext.actions.push(...verbs);
      });
    }

    // Determine complexity level
    if (requirements.challenges && requirements.challenges.length > 3) {
      domainContext.complexityLevel = "high";
    } else if (
      requirements.functionality &&
      requirements.functionality.length < 3
    ) {
      domainContext.complexityLevel = "low";
    }

    // Remove duplicates
    domainContext.entities = [...new Set(domainContext.entities)];
    domainContext.actions = [...new Set(domainContext.actions)];

    return domainContext;
  }

  /**
   * Save model to file
   */
  private async saveModelToFile(
    model: string,
    outputDir: string,
    fileName: string,
  ): Promise<void> {
    try {
      // fs and path are now imported at the top of the file

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write model to file
      const filePath = path.join(outputDir, fileName);

      // Acquire lock before writing to file
      let lockAcquired = false;
      if (this.fileLockManager) {
        log(`Acquiring lock for file: ${filePath}`, "info");
        lockAcquired = await this.acquireFileLock(filePath);

        if (!lockAcquired) {
          log(
            `Failed to acquire lock for file: ${filePath}, cannot save model`,
            "error",
          );
          throw new Error(`Failed to acquire lock for file: ${filePath}`);
        }
      }

      try {
        // Write file
        fs.writeFileSync(filePath, model);
        log(`Model saved to ${filePath}`, "success");
      } finally {
        // Release lock if it was acquired
        if (lockAcquired && this.fileLockManager) {
          await this.releaseFileLock(filePath);
          log(`Released lock for file: ${filePath}`, "info");
        }
      }
    } catch (error) {
      log(`Error saving model to file: ${error}`, "error");
      throw error;
    }
  }

  /**
   * Identify events from task description and domain context
   */
  private async identifyEvents(
    description: string,
    domainContext: Record<string, any> = {},
  ): Promise<string[]> {
    try {
      // Create a structured prompt for event identification
      let prompt = `Analyze the following task description and identify domain events:
      
Task: ${description}

Please identify all domain events that would occur in this process. 
Format events in PascalCase and use past tense (e.g., UserRegistered, EmailSent).

Format your response as a JSON array of strings.`;

      // Add domain context if available
      if (domainContext.entities && domainContext.entities.length > 0) {
        prompt += `\n\nConsider these domain entities: ${domainContext.entities.join(", ")}`;
      }

      if (domainContext.actions && domainContext.actions.length > 0) {
        prompt += `\n\nConsider these domain actions: ${domainContext.actions.join(", ")}`;
      }

      // Call Rovo Dev's API for event identification
      log("Calling Rovo Dev API for event identification...", "info");

      const response = await this.acli.runWithInstruction(prompt);
      log("Successfully received event identification response", "success");

      // Parse the JSON response
      try {
        // Extract JSON array from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          if (Array.isArray(jsonResponse)) {
            log(
              `Successfully identified ${jsonResponse.length} events`,
              "success",
            );
            return jsonResponse;
          }
        }
        throw new Error("Could not find valid JSON array in response");
      } catch (parseError) {
        log(
          `Error parsing event identification response: ${parseError}`,
          "error",
        );
        throw new Error(
          `Failed to parse event identification response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }
    } catch (error) {
      log(`Error identifying events: ${error}`, "error");
      throw new Error(
        `Failed to identify events: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create event timeline
   */
  private async createEventTimeline(
    events: string[],
  ): Promise<Record<string, any>> {
    try {
      // Create a structured prompt for timeline creation
      const prompt = `Create an event timeline for the following events:
      
${events.map((event, index) => `${index + 1}. ${event}`).join("\n")}

For each event, determine:
1. Its order in the sequence
2. Which events it depends on
3. Which events it triggers

Format your response as JSON with the following structure:
{
  "EventName1": {
    "order": 1,
    "dependencies": ["DependencyEvent1", "DependencyEvent2"],
    "triggers": ["TriggeredEvent1", "TriggeredEvent2"]
  },
  "EventName2": {
    "order": 2,
    "dependencies": ["DependencyEvent1"],
    "triggers": ["TriggeredEvent1"]
  }
}`;

      log("Calling Rovo Dev API for timeline creation...", "info");

      const response = await this.acli.runWithInstruction(prompt);
      log("Successfully received timeline creation response", "success");

      // Parse the JSON response
      try {
        // Extract JSON object from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          log(
            `Successfully created timeline with ${Object.keys(jsonResponse).length} events`,
            "success",
          );
          return jsonResponse;
        }
        throw new Error("Could not find valid JSON object in response");
      } catch (parseError) {
        log(`Error parsing timeline response: ${parseError}`, "error");
        throw new Error(
          `Failed to parse timeline response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }
    } catch (error) {
      log(`Error creating timeline: ${error}`, "error");
      throw new Error(
        `Failed to create event timeline: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Map state changes for events
   */
  private async mapStateChanges(
    events: string[],
  ): Promise<Record<string, any>> {
    try {
      // Create a structured prompt for state change mapping
      const prompt = `Map state changes for the following events:
      
${events.map((event, index) => `${index + 1}. ${event}`).join("\n")}

For each event, determine:
1. The state before the event occurs
2. The state after the event occurs

Format your response as JSON with the following structure:
{
  "EventName1": {
    "before": { "entity1": "state1", "entity2": null },
    "after": { "entity1": "state2", "entity2": { "property": "value" } }
  },
  "EventName2": {
    "before": { "entity3": "state1" },
    "after": { "entity3": "state2" }
  }
}`;

      log("Calling Rovo Dev API for state change mapping...", "info");

      const response = await this.acli.runWithInstruction(prompt);
      log("Successfully received state change mapping response", "success");

      // Parse the JSON response
      try {
        // Extract JSON object from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          log(
            `Successfully mapped state changes for ${Object.keys(jsonResponse).length} events`,
            "success",
          );
          return jsonResponse;
        }
        throw new Error("Could not find valid JSON object in response");
      } catch (parseError) {
        log(
          `Error parsing state change mapping response: ${parseError}`,
          "error",
        );
        throw new Error(
          `Failed to parse state change mapping response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }
    } catch (error) {
      log(`Error mapping state changes: ${error}`, "error");
      throw new Error(
        `Failed to map state changes: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generate event model
   */
  private async generateEventModel(
    events: string[],
    timeline: Record<string, any>,
    stateChanges: Record<string, any>,
  ): Promise<string> {
    try {
      // Create a structured prompt for event model generation
      const prompt = `Generate a comprehensive event model based on the following information:

Events:
${events.map((event) => `- ${event}`).join("\n")}

Timeline:
${JSON.stringify(timeline, null, 2)}

State Changes:
${JSON.stringify(stateChanges, null, 2)}

Create a detailed event model in Markdown format that includes:
1. An overview of the system
2. A description of each event
3. The event flow and dependencies
4. State transitions
5. Recommendations for implementation

Format your response as a well-structured Markdown document.`;

      log("Calling Rovo Dev API for event model generation...", "info");

      const response = await this.acli.runWithInstruction(prompt);
      log("Successfully received event model generation response", "success");

      // Check if the response contains Markdown content
      if (response.includes("# ") || response.includes("## ")) {
        // Extract the Markdown content
        const markdownContent = response.trim();
        log("Successfully generated event model", "success");
        return markdownContent;
      } else {
        throw new Error("Response does not contain valid Markdown content");
      }
    } catch (error) {
      log(`Error generating event model: ${error}`, "error");
      throw new Error(
        `Failed to generate event model: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
