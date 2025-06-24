/**
 * Tests for WorkflowManager
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { WorkflowManager, WorkflowTemplate, WorkflowState } from "../src/workflow-manager";
import fs from "fs";
import path from "path";
import os from "os";

describe("WorkflowManager", () => {
  let workflowManager: WorkflowManager;
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `workflow-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    
    // Mock the home directory for testing
    const originalHomedir = os.homedir;
    os.homedir = () => testDir;
    
    workflowManager = new WorkflowManager();
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Template Management", () => {
    it("should initialize with default templates", async () => {
      await workflowManager.initialize();
      
      const templates = await workflowManager.listTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      const calculatorTemplate = templates.find(t => t.id === "calculator-development");
      expect(calculatorTemplate).toBeDefined();
      expect(calculatorTemplate?.name).toBe("Modern Calculator Development");
    });

    it("should save and load custom templates", async () => {
      const customTemplate: WorkflowTemplate = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        version: "1.0.0",
        phases: [
          {
            id: "test-phase",
            name: "Test Phase",
            description: "A test phase",
            dependencies: [],
            commands: [
              {
                command: "echo",
                args: ["hello"],
                description: "Say hello"
              }
            ]
          }
        ]
      };

      await workflowManager.saveTemplate(customTemplate);
      
      const loadedTemplate = await workflowManager.loadTemplate("test-workflow");
      expect(loadedTemplate).toEqual(customTemplate);
    });
  });

  describe("Workflow State Management", () => {
    beforeEach(async () => {
      await workflowManager.initialize();
    });

    it("should start a new workflow", async () => {
      const instanceId = await workflowManager.startWorkflow("calculator-development");
      
      expect(instanceId).toBeDefined();
      expect(instanceId).toContain("calculator-development");
      
      const state = await workflowManager.getCurrentWorkflowState();
      expect(state).toBeDefined();
      expect(state?.templateId).toBe("calculator-development");
      expect(state?.status).toBe("not-started");
    });

    it("should complete phases", async () => {
      await workflowManager.startWorkflow("calculator-development");
      
      await workflowManager.completePhase("initialization", 1000, ["file1.txt"]);
      
      const state = await workflowManager.getCurrentWorkflowState();
      expect(state?.completedPhases["initialization"]).toBeDefined();
      expect(state?.completedPhases["initialization"].success).toBe(true);
      expect(state?.completedPhases["initialization"].duration).toBe(1000);
      expect(state?.completedPhases["initialization"].artifacts).toEqual(["file1.txt"]);
    });

    it("should fail phases", async () => {
      await workflowManager.startWorkflow("calculator-development");
      
      await workflowManager.failPhase("initialization", "Test error");
      
      const state = await workflowManager.getCurrentWorkflowState();
      expect(state?.failedPhases["initialization"]).toBeDefined();
      expect(state?.failedPhases["initialization"].error).toBe("Test error");
      expect(state?.failedPhases["initialization"].retryCount).toBe(1);
    });

    it("should skip phases", async () => {
      await workflowManager.startWorkflow("calculator-development");
      
      await workflowManager.skipPhase("security", "Not needed for this project");
      
      const state = await workflowManager.getCurrentWorkflowState();
      expect(state?.skippedPhases["security"]).toBeDefined();
      expect(state?.skippedPhases["security"].reason).toBe("Not needed for this project");
    });
  });

  describe("Progress Tracking", () => {
    beforeEach(async () => {
      await workflowManager.initialize();
      await workflowManager.startWorkflow("calculator-development");
    });

    it("should calculate progress correctly", async () => {
      const initialProgress = await workflowManager.getWorkflowProgress();
      expect(initialProgress.progress.percentComplete).toBe(0);
      expect(initialProgress.progress.completedPhases).toBe(0);
      
      await workflowManager.completePhase("initialization");
      
      const updatedProgress = await workflowManager.getWorkflowProgress();
      expect(updatedProgress.progress.completedPhases).toBe(1);
      expect(updatedProgress.progress.percentComplete).toBeGreaterThan(0);
    });

    it("should find next available phase", async () => {
      const progress = await workflowManager.getWorkflowProgress();
      expect(progress.progress.nextPhase?.id).toBe("initialization");
      
      await workflowManager.completePhase("initialization");
      
      const updatedProgress = await workflowManager.getWorkflowProgress();
      expect(updatedProgress.progress.nextPhase?.id).toBe("architecture");
    });

    it("should identify blocked phases", async () => {
      const progress = await workflowManager.getWorkflowProgress();
      
      // Architecture depends on initialization, so it should be blocked initially
      const blockedPhases = progress.progress.blockedPhases;
      const architecturePhase = blockedPhases.find(p => p.id === "architecture");
      expect(architecturePhase).toBeDefined();
      
      // Complete initialization
      await workflowManager.completePhase("initialization");
      
      const updatedProgress = await workflowManager.getWorkflowProgress();
      const updatedBlockedPhases = updatedProgress.progress.blockedPhases;
      const stillBlocked = updatedBlockedPhases.find(p => p.id === "architecture");
      expect(stillBlocked).toBeUndefined();
    });
  });

  describe("Workflow Control", () => {
    beforeEach(async () => {
      await workflowManager.initialize();
      await workflowManager.startWorkflow("calculator-development");
    });

    it("should pause and resume workflow", async () => {
      await workflowManager.pauseWorkflow();
      
      let state = await workflowManager.getCurrentWorkflowState();
      expect(state?.status).toBe("paused");
      
      await workflowManager.resumeWorkflow();
      
      state = await workflowManager.getCurrentWorkflowState();
      expect(state?.status).toBe("in-progress");
    });

    it("should reset workflow", async () => {
      await workflowManager.completePhase("initialization");
      
      let state = await workflowManager.getCurrentWorkflowState();
      expect(state).toBeDefined();
      
      await workflowManager.resetWorkflow();
      
      state = await workflowManager.getCurrentWorkflowState();
      expect(state).toBeNull();
    });
  });

  describe("Phase Validation", () => {
    beforeEach(async () => {
      await workflowManager.initialize();
    });

    it("should validate phases with file requirements", async () => {
      const template = await workflowManager.loadTemplate("calculator-development");
      const initPhase = template?.phases.find(p => p.id === "initialization");
      
      if (initPhase?.validation?.requiredDirectories) {
        // Create required directories for testing
        for (const dir of initPhase.validation.requiredDirectories) {
          const dirPath = path.join(process.cwd(), dir);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
        }
      }

      if (initPhase?.validation?.requiredFiles) {
        // Create required files for testing
        for (const file of initPhase.validation.requiredFiles) {
          const filePath = path.join(process.cwd(), file);
          fs.writeFileSync(filePath, "test content");
        }
      }

      const isValid = await workflowManager.validatePhase(initPhase!);
      expect(isValid).toBe(true);

      // Clean up created files/directories
      if (initPhase?.validation?.requiredFiles) {
        for (const file of initPhase.validation.requiredFiles) {
          const filePath = path.join(process.cwd(), file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      if (initPhase?.validation?.requiredDirectories) {
        for (const dir of initPhase.validation.requiredDirectories) {
          const dirPath = path.join(process.cwd(), dir);
          if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
          }
        }
      }
    });
  });
});