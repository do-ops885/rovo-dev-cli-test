/**
 * Integration tests for agent file locking
 */

import { BaseSparcAgent } from "../src/agents/sparc/base-sparc-agent";
import { BaseEventAgent } from "../src/agents/event/base-event-agent";
import { FileLockManager } from "../src/file-lock-manager";
import { Memory } from "../src/memory";
import fs from "fs";
import path from "path";
import os from "os";
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock implementation of a SPARC agent for testing
class TestSparcAgent extends BaseSparcAgent {
  constructor() {
    super("TestSparc", ["testing"]);
    this.config.useFileLocks = true;
  }
  
  protected async processTask(): Promise<any> {
    return { success: true, message: "Task processed" };
  }
  
  // Helper method to write to a file with locking
  public async writeToFileWithLocking(filePath: string, content: string): Promise<boolean> {
    // Acquire lock
    const lockAcquired = await this.acquireFileLock(filePath);
    
    if (!lockAcquired) {
      return false;
    }
    
    try {
      // Write to file
      fs.writeFileSync(filePath, content);
      return true;
    } finally {
      // Release lock
      await this.releaseFileLock(filePath);
    }
  }
}

// Mock implementation of an Event agent for testing
class TestEventAgent extends BaseEventAgent {
  constructor() {
    super("TestEvent", ["testing"]);
    this.config.useFileLocks = true;
  }
  
  protected async processTask(): Promise<any> {
    return { success: true, message: "Task processed" };
  }
  
  // Helper method to write to a file with locking
  public async writeToFileWithLocking(filePath: string, content: string): Promise<boolean> {
    // Acquire lock
    const lockAcquired = await this.acquireFileLock(filePath);
    
    if (!lockAcquired) {
      return false;
    }
    
    try {
      // Write to file
      fs.writeFileSync(filePath, content);
      return true;
    } finally {
      // Release lock
      await this.releaseFileLock(filePath);
    }
  }
}

describe("Agent File Locking Integration", () => {
  let sparcAgent: TestSparcAgent;
  let eventAgent: TestEventAgent;
  let testFilePath: string;
  let testDir: string;
  
  beforeEach(async () => {
    // Create test directory
    testDir = path.join(os.tmpdir(), "rovo-test-" + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    
    // Create test file path
    testFilePath = path.join(testDir, "test-file.txt");
    
    // Initialize agents
    sparcAgent = new TestSparcAgent();
    eventAgent = new TestEventAgent();
    
    // Initialize agents
    await sparcAgent.initialize();
    await eventAgent.initialize();
  });
  
  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  test("agents should initialize with file lock manager", async () => {
    // Check if file lock manager was initialized
    expect(sparcAgent["fileLockManager"]).not.toBeNull();
    expect(eventAgent["fileLockManager"]).not.toBeNull();
  });
  
  test("agent should successfully write to file with locking", async () => {
    // Write to file
    const result = await sparcAgent.writeToFileWithLocking(testFilePath, "test content");
    
    // Should succeed
    expect(result).toBe(true);
    
    // File should exist with correct content
    expect(fs.existsSync(testFilePath)).toBe(true);
    expect(fs.readFileSync(testFilePath, "utf8")).toBe("test content");
  });
  
  test("second agent should fail to write while first agent has lock", async () => {
    // First agent acquires lock but doesn't release it
    const lockAcquired = await sparcAgent.acquireFileLock(testFilePath);
    expect(lockAcquired).toBe(true);
    
    // Second agent tries to write to file
    const result = await eventAgent.writeToFileWithLocking(testFilePath, "event agent content");
    
    // Should fail
    expect(result).toBe(false);
    
    // File should not exist or be empty
    if (fs.existsSync(testFilePath)) {
      expect(fs.readFileSync(testFilePath, "utf8")).toBe("");
    }
    
    // Clean up lock
    await sparcAgent.releaseFileLock(testFilePath);
  });
  
  test("second agent should succeed after first agent releases lock", async () => {
    // First agent writes to file
    const result1 = await sparcAgent.writeToFileWithLocking(testFilePath, "sparc agent content");
    expect(result1).toBe(true);
    
    // Second agent writes to file
    const result2 = await eventAgent.writeToFileWithLocking(testFilePath, "event agent content");
    expect(result2).toBe(true);
    
    // File should have content from second agent
    expect(fs.readFileSync(testFilePath, "utf8")).toBe("event agent content");
  });
  
  test("concurrent write attempts should result in only one success", async () => {
    // Both agents try to write concurrently
    const promise1 = sparcAgent.writeToFileWithLocking(testFilePath, "sparc agent content");
    const promise2 = eventAgent.writeToFileWithLocking(testFilePath, "event agent content");
    
    // Wait for both to complete
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    // One should succeed and one should fail
    expect(result1 !== result2).toBe(true);
    
    // File should exist with content from the successful agent
    expect(fs.existsSync(testFilePath)).toBe(true);
    const content = fs.readFileSync(testFilePath, "utf8");
    expect(content === "sparc agent content" || content === "event agent content").toBe(true);
  });
});