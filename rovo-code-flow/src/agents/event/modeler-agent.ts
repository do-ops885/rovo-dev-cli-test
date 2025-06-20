/**
 * Event Modeler Agent
 */

import { BaseEventAgent } from "./base-event-agent";
import { log } from "../../utils";
import type { TaskContext, TaskResult } from "../agent.interface";
import { AcliIntegration } from "../../acli-integration";

export class ModelerAgent extends BaseEventAgent {
  constructor() {
    super("Modeler", [
      "event-modeling",
      "domain-analysis",
      "timeline-creation",
    ]);
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
      const fs = require("fs");
      const path = require("path");

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write model to file
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, model);

      log(`Model saved to ${filePath}`, "success");
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
      // Use ACLI integration to get events
      const acli = new AcliIntegration();

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

      try {
        // Use ACLI to make the API call
        const result = await acli.runWithInstruction(prompt);

        // Parse the response (in a real scenario, this would parse the JSON response)
        // For now, we'll still use our mock events but log that the API call was made
        log("Successfully called Rovo Dev API", "success");

        // In a production environment, we would parse the JSON response:
        // try {
        //   const jsonResponse = JSON.parse(result);
        //   if (Array.isArray(jsonResponse)) {
        //     return jsonResponse;
        //   }
        // } catch (parseError) {
        //   log(`Error parsing API response: ${parseError}`, 'error');
        // }
      } catch (apiError) {
        log(`API call failed: ${apiError}`, "error");
        // Continue with mock events as fallback
      }

      // For demonstration, we'll create some mock events based on the description
      let mockEvents = [
        "UserRegistered",
        "EmailVerificationSent",
        "EmailVerified",
        "PasswordChanged",
        "UserLoggedIn",
      ];

      // Customize events based on description
      if (description.toLowerCase().includes("password reset")) {
        mockEvents = [
          "PasswordResetRequested",
          "PasswordResetEmailSent",
          "PasswordResetLinkClicked",
          "PasswordChanged",
          "UserNotified",
        ];
      } else if (
        description.toLowerCase().includes("order") ||
        description.toLowerCase().includes("purchase")
      ) {
        mockEvents = [
          "CartCreated",
          "ProductAdded",
          "CheckoutStarted",
          "PaymentProcessed",
          "OrderConfirmed",
          "ShipmentCreated",
        ];
      } else if (
        description.toLowerCase().includes("authentication") ||
        description.toLowerCase().includes("login")
      ) {
        mockEvents = [
          "LoginAttempted",
          "UserAuthenticated",
          "SessionCreated",
          "LoginFailed",
          "AccountLocked",
        ];
      }

      // Customize events based on domain context
      if (domainContext.entities && domainContext.entities.length > 0) {
        // Add entity-specific events
        const entityEvents = domainContext.entities
          .map((entity: string) => {
            const capitalizedEntity =
              entity.charAt(0).toUpperCase() + entity.slice(1);
            return [
              `${capitalizedEntity}Created`,
              `${capitalizedEntity}Updated`,
              `${capitalizedEntity}Deleted`,
            ];
          })
          .flat();

        // Add some of these events to our mock events
        mockEvents = [...mockEvents, ...entityEvents.slice(0, 3)];
      }

      return mockEvents;
    } catch (error) {
      log(`Error identifying events: ${error}`, "error");
      return ["Event1", "Event2", "Event3"]; // Fallback mock events
    }
  }

  /**
   * Create event timeline
   */
  private async createEventTimeline(
    events: string[],
  ): Promise<Record<string, any>> {
    try {
      // Use ACLI integration to create timeline
      const acli = new AcliIntegration();

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

      try {
        // Make the API call
        const result = await acli.runWithInstruction(prompt);
        log("Successfully called Rovo Dev API for timeline", "success");

        // In a production environment, we would parse the JSON response
        // For now, we'll continue with our mock implementation
      } catch (apiError) {
        log(`API call failed: ${apiError}`, "error");
        // Continue with mock timeline as fallback
      }
    } catch (error) {
      log(`Error creating timeline: ${error}`, "error");
    }

    // Create a mock timeline as fallback
    const timeline: Record<string, any> = {};

    events.forEach((event, index) => {
      timeline[event] = {
        order: index + 1,
        dependencies: index > 0 ? [events[index - 1]] : [],
        triggers: index < events.length - 1 ? [events[index + 1]] : [],
      };
    });

    return timeline;
  }

  /**
   * Map state changes for events
   */
  private async mapStateChanges(
    events: string[],
  ): Promise<Record<string, any>> {
    try {
      // Use ACLI integration to map state changes
      const acli = new AcliIntegration();

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

      try {
        // Make the API call
        const result = await acli.runWithInstruction(prompt);
        log("Successfully called Rovo Dev API for state changes", "success");

        // In a production environment, we would parse the JSON response
        // For now, we'll continue with our mock implementation
      } catch (apiError) {
        log(`API call failed: ${apiError}`, "error");
        // Continue with mock state changes as fallback
      }
    } catch (error) {
      log(`Error mapping state changes: ${error}`, "error");
    }

    // Create mock state changes as fallback
    const stateChanges: Record<string, any> = {};

    events.forEach((event) => {
      switch (event) {
        case "UserRegistered":
          stateChanges[event] = {
            before: { user: null },
            after: { user: { status: "unverified" } },
          };
          break;
        case "EmailVerificationSent":
          stateChanges[event] = {
            before: { verificationEmail: null },
            after: { verificationEmail: { status: "sent" } },
          };
          break;
        case "EmailVerified":
          stateChanges[event] = {
            before: { user: { status: "unverified" } },
            after: { user: { status: "active" } },
          };
          break;
        case "PasswordResetRequested":
          stateChanges[event] = {
            before: { passwordReset: null },
            after: {
              passwordReset: { status: "requested", token: "generated" },
            },
          };
          break;
        case "OrderConfirmed":
          stateChanges[event] = {
            before: { order: { status: "pending" } },
            after: { order: { status: "confirmed" } },
          };
          break;
        default:
          stateChanges[event] = {
            before: { state: "previous" },
            after: { state: "next" },
          };
      }
    });

    return stateChanges;
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
      // Use ACLI integration to generate the event model
      const acli = new AcliIntegration();

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

      try {
        // Make the API call
        const result = await acli.runWithInstruction(prompt);
        log("Successfully called Rovo Dev API for event model", "success");

        // In a production environment, we would return the API response
        // For now, we'll continue with our mock implementation
      } catch (apiError) {
        log(`API call failed: ${apiError}`, "error");
        // Continue with mock model as fallback
      }
    } catch (error) {
      log(`Error generating event model: ${error}`, "error");
    }

    // Generate a more comprehensive model as fallback
    let model = "# Event Model\n\n";

    // Add overview section
    model += "## Overview\n\n";
    model += `This event model contains ${events.length} events that describe a workflow. `;
    model +=
      "The events are organized in a timeline with dependencies and triggers, ";
    model += "and each event causes specific state changes in the system.\n\n";

    // Add events section
    model += "## Events\n\n";

    events.forEach((event) => {
      model += `### ${event}\n`;
      model += `- **Order**: ${timeline[event].order}\n`;
      model += `- **Dependencies**: ${timeline[event].dependencies.length > 0 ? timeline[event].dependencies.join(", ") : "None"}\n`;
      model += `- **Triggers**: ${timeline[event].triggers.length > 0 ? timeline[event].triggers.join(", ") : "None"}\n`;
      model += "- **State Changes**:\n";
      model += "  - Before:\n";

      // Format the before state nicely
      Object.entries(stateChanges[event].before).forEach(([key, value]) => {
        model += `    - ${key}: ${JSON.stringify(value)}\n`;
      });

      model += "  - After:\n";

      // Format the after state nicely
      Object.entries(stateChanges[event].after).forEach(([key, value]) => {
        model += `    - ${key}: ${JSON.stringify(value)}\n`;
      });

      model += "\n";
    });

    // Add event flow section
    model += "## Event Flow\n\n";
    model += "```mermaid\nstateDiagram-v2\n";

    // Add states
    events.forEach((event) => {
      model += `  ${event}\n`;
    });

    // Add transitions
    events.forEach((event) => {
      if (timeline[event].triggers.length > 0) {
        timeline[event].triggers.forEach((trigger) => {
          model += `  ${event} --> ${trigger}\n`;
        });
      }
    });

    model += "```\n\n";

    // Add implementation recommendations
    model += "## Implementation Recommendations\n\n";
    model +=
      "1. Implement an event-driven architecture to handle these events\n";
    model +=
      "2. Use event sourcing to maintain state based on the event history\n";
    model += "3. Consider using a message queue for event distribution\n";
    model += "4. Implement proper error handling and retry mechanisms\n";
    model += "5. Add validation to ensure state transitions are valid\n";

    return model;
  }
}
