/**
 * Tests for Orchestrator's file locking integration
 */

import { Orchestrator } from "../src/orchestrator";
import { BaseSparcAgent } from "../src/agents/sparc/base-sparc-agent";
import { BaseEventAgent } from "../src/agents/event/base-event-agent";
import fs from "fs";
import path from "path";
import os from "os";
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock implementation of a SPARC agent for testing
class TestSparcAgent extends BaseSparcAgent {
  constructor() {
    super("TestSparc", ["testing"]);
  }
  
  protected async processTask(): Promise<any> {
    return { success: true, message: "Task processed" };
  }
}

// Mock implementation of an Event agent for testing
class TestEventAgent extends BaseEventAgent {
  constructor() {
    super("TestEvent", ["testing"]);
  }
  
  protected async processTask(): Promise<any> {
    return { success: true, message: "Task processed" };
  }
}

describe("Orchestrator File Locking Integration", () => {
  let orchestrator: Orchestrator;
  let sparcAgent: TestSparcAgent;
  let eventAgent: TestEventAgent;
  
  beforeEach(async () => {
    // Initialize orchestrator and agents
    orchestrator = new Orchestrator();
    sparcAgent = new TestSparcAgent();
    eventAgent = new TestEventAgent();
    
    // Start orchestrator
    orchestrator.start();
  });
  
  afterEach(() => {
    // Stop orchestrator
    orchestrator.stop();
  });
  
  test("orchestrator should initialize with file lock manager", () => {
    // Check if file lock manager was initialized
    expect(orchestrator["fileLockManager"]).toBeDefined();
  });
  
  test("orchestrator should configure agents to use file locks when registered", async () => {
    // Register agents
    orchestrator.registerAgent("sparc", sparcAgent);
    orchestrator.registerAgent("event", eventAgent);
    
    // Initialize agents
    await sparcAgent.initialize();
    await eventAgent.initialize();
    
    // Check if agents are configured to use file locks
    expect(sparcAgent.config.useFileLocks).toBe(true);
    expect(eventAgent.config.useFileLocks).toBe(true);
    
    // Check if file lock manager was initialized in agents
    expect(sparcAgent["fileLockManager"]).not.toBeNull();
    expect(eventAgent["fileLockManager"]).not.toBeNull();
  });
  
  test("orchestrator should clean up expired locks when stopped", async () => {
    // Mock the cleanupExpiredLocks method
    const cleanupSpy = vi.spyOn(orchestrator["fileLockManager"], 'cleanupExpiredLocks');
    
    // Stop the orchestrator
    orchestrator.stop();
    
    // Should have called cleanupExpiredLocks
    expect(cleanupSpy).toHaveBeenCalled();
    
    // Restore mock
    cleanupSpy.mockRestore();
  });
  
  test("orchestrator should start periodic lock cleanup", async () => {
    // Mock setInterval
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    
    // Create new orchestrator to trigger setInterval
    const newOrchestrator = new Orchestrator();
    newOrchestrator.start();
    
    // Should have called setInterval
    expect(setIntervalSpy).toHaveBeenCalled();
    
    // Restore mock
    setIntervalSpy.mockRestore();
    newOrchestrator.stop();
  });
});