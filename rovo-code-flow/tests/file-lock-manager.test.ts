/**
 * Tests for FileLockManager
 */

import { FileLockManager } from "../src/file-lock-manager";
import { Memory } from "../src/memory";
import fs from "fs";
import path from "path";
import os from "os";
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

describe("FileLockManager", () => {
  let fileLockManager: FileLockManager;
  let memory: Memory;
  let testLockDir: string;
  
  beforeEach(() => {
    memory = new Memory();
    fileLockManager = new FileLockManager(memory);
    testLockDir = path.join(os.tmpdir(), "rovo-locks");
    
    // Ensure test directory exists
    if (!fs.existsSync(testLockDir)) {
      fs.mkdirSync(testLockDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Clean up test files
    try {
      const files = fs.readdirSync(testLockDir);
      files.forEach(file => {
        if (file.startsWith("rovo-lock-")) {
          fs.unlinkSync(path.join(testLockDir, file));
        }
      });
    } catch (error) {
      console.error("Error cleaning up test files:", error);
    }
  });
  
  test("should acquire a lock on a file", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agentId = "test-agent-1";
    
    const result = await fileLockManager.acquireLock(testFilePath, agentId);
    expect(result).toBe(true);
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    expect(fileLockManager.isLockedByAgent(testFilePath, agentId)).toBe(true);
  });
  
  test("should not acquire a lock if file is already locked", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agent1Id = "test-agent-1";
    const agent2Id = "test-agent-2";
    
    // First agent acquires lock
    const result1 = await fileLockManager.acquireLock(testFilePath, agent1Id);
    expect(result1).toBe(true);
    
    // Second agent tries to acquire lock
    const result2 = await fileLockManager.acquireLock(testFilePath, agent2Id);
    expect(result2).toBe(false);
    
    // File should still be locked by first agent
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    expect(fileLockManager.isLockedByAgent(testFilePath, agent1Id)).toBe(true);
    expect(fileLockManager.isLockedByAgent(testFilePath, agent2Id)).toBe(false);
  });
  
  test("should release a lock on a file", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agentId = "test-agent-1";
    
    // Acquire lock
    await fileLockManager.acquireLock(testFilePath, agentId);
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    
    // Release lock
    const result = await fileLockManager.releaseLock(testFilePath, agentId);
    expect(result).toBe(true);
    expect(fileLockManager.isLocked(testFilePath)).toBe(false);
  });
  
  test("should not release a lock owned by another agent", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agent1Id = "test-agent-1";
    const agent2Id = "test-agent-2";
    
    // First agent acquires lock
    await fileLockManager.acquireLock(testFilePath, agent1Id);
    
    // Second agent tries to release lock
    const result = await fileLockManager.releaseLock(testFilePath, agent2Id);
    expect(result).toBe(false);
    
    // File should still be locked by first agent
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    expect(fileLockManager.isLockedByAgent(testFilePath, agent1Id)).toBe(true);
  });
  
  test("should clean up expired locks", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agentId = "test-agent-1";
    
    // Create a lock with a very short timeout
    await fileLockManager.acquireLock(testFilePath, agentId, 10); // 10ms timeout
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    
    // Wait for lock to expire
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Check if lock is still active (should be expired)
    expect(fileLockManager.isLocked(testFilePath)).toBe(false);
  });
  
  test("should handle multiple locks on different files", async () => {
    const testFilePath1 = path.join(os.tmpdir(), "test-file-1.txt");
    const testFilePath2 = path.join(os.tmpdir(), "test-file-2.txt");
    const agentId = "test-agent-1";
    
    // Acquire locks on both files
    const result1 = await fileLockManager.acquireLock(testFilePath1, agentId);
    const result2 = await fileLockManager.acquireLock(testFilePath2, agentId);
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(fileLockManager.isLocked(testFilePath1)).toBe(true);
    expect(fileLockManager.isLocked(testFilePath2)).toBe(true);
    
    // Release first lock
    await fileLockManager.releaseLock(testFilePath1, agentId);
    expect(fileLockManager.isLocked(testFilePath1)).toBe(false);
    expect(fileLockManager.isLocked(testFilePath2)).toBe(true);
  });
  
  test("should retry acquiring lock with exponential backoff", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agent1Id = "test-agent-1";
    const agent2Id = "test-agent-2";
    
    // Mock the isLocked method to return true for the first 2 calls and then false
    const isLockedSpy = vi.spyOn(fileLockManager, 'isLocked');
    isLockedSpy.mockImplementation((filePath) => {
      if (isLockedSpy.mock.calls.length <= 2) {
        return true;
      }
      return false;
    });
    
    // Mock setTimeout to execute immediately
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return {} as any;
    });
    
    // Agent2 tries to acquire lock
    const result = await fileLockManager.acquireLock(testFilePath, agent2Id);
    
    // Should succeed after retries
    expect(result).toBe(true);
    // Should have called isLocked 3 times (initial + 2 retries)
    expect(isLockedSpy).toHaveBeenCalledTimes(3);
    
    // Restore mocks
    isLockedSpy.mockRestore();
    vi.restoreAllMocks();
  });
  
  test("should handle corrupted lock files", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const lockId = "rovo-lock-" + require('crypto').createHash('md5').update(testFilePath).digest('hex');
    const lockFilePath = path.join(testLockDir, lockId);
    
    // Create a corrupted lock file
    fs.writeFileSync(lockFilePath, "corrupted-json-data");
    
    // Should handle corrupted lock file gracefully
    expect(fileLockManager.isLocked(testFilePath)).toBe(false);
  });
  
  test("should handle filesystem errors when acquiring lock", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agentId = "test-agent-1";
    
    // Mock fs.writeFileSync to throw an error
    const writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
    writeFileSyncSpy.mockImplementation(() => {
      throw new Error("Simulated filesystem error");
    });
    
    // Try to acquire lock
    const result = await fileLockManager.acquireLock(testFilePath, agentId);
    
    // Should fail due to filesystem error
    expect(result).toBe(false);
    
    // Restore mock
    writeFileSyncSpy.mockRestore();
  });
  
  test("should handle concurrent lock acquisition attempts", async () => {
    const testFilePath = path.join(os.tmpdir(), "test-file.txt");
    const agent1Id = "test-agent-1";
    const agent2Id = "test-agent-2";
    
    // Start both lock acquisitions concurrently
    const promise1 = fileLockManager.acquireLock(testFilePath, agent1Id);
    const promise2 = fileLockManager.acquireLock(testFilePath, agent2Id);
    
    // Wait for both to complete
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    // One should succeed and one should fail
    expect(result1 !== result2).toBe(true);
    
    // File should be locked by one of the agents
    expect(fileLockManager.isLocked(testFilePath)).toBe(true);
    
    // Check which agent got the lock
    if (result1) {
      expect(fileLockManager.isLockedByAgent(testFilePath, agent1Id)).toBe(true);
      expect(fileLockManager.isLockedByAgent(testFilePath, agent2Id)).toBe(false);
    } else {
      expect(fileLockManager.isLockedByAgent(testFilePath, agent1Id)).toBe(false);
      expect(fileLockManager.isLockedByAgent(testFilePath, agent2Id)).toBe(true);
    }
  });
});