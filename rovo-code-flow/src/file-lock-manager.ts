/**
 * File Lock Manager for preventing concurrent file edits by multiple agents
 */

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import type { Memory } from "./memory";
import { log } from "./utils";

interface FileLock {
  filePath: string;
  agentId: string;
  timestamp: number;
  expiresAt: number;
}

export class FileLockManager {
  private memory: Memory;
  private lockDir: string;
  private lockPrefix: string = "rovo-lock-";
  private defaultLockTimeoutMs: number = 30000; // 30 seconds default lock timeout
  private retryDelayMs: number = 100; // Initial retry delay (will increase with backoff)
  private maxRetries: number = 5; // Maximum number of retries

  constructor(memory: Memory) {
    this.memory = memory;
    this.lockDir = path.join(os.tmpdir(), "rovo-locks");

    // Ensure lock directory exists
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }

    // Initialize memory storage for locks if it doesn't exist
    if (!this.memory.has("file_locks")) {
      this.memory.store("file_locks", {});
    }
  }

  /**
   * Acquire a lock on a file for a specific agent
   * @param filePath Path to the file to lock
   * @param agentId ID of the agent acquiring the lock
   * @param timeoutMs Lock timeout in milliseconds (default: 30 seconds)
   * @returns Promise resolving to true if lock was acquired, false otherwise
   */
  public async acquireLock(
    filePath: string,
    agentId: string,
    timeoutMs: number = this.defaultLockTimeoutMs,
  ): Promise<boolean> {
    const normalizedPath = path.normalize(filePath);
    const lockId = this.getLockId(normalizedPath);

    // Try to acquire lock with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      // Check if file is already locked
      if (this.isLocked(normalizedPath)) {
        // If this is the last attempt, return false
        if (attempt === this.maxRetries - 1) {
          log(
            `Failed to acquire lock for ${normalizedPath} after ${this.maxRetries} attempts`,
            "warn",
          );
          return false;
        }

        // Wait with exponential backoff before retrying
        const delay = this.retryDelayMs * Math.pow(2, attempt);
        log(
          `File ${normalizedPath} is locked, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`,
          "info",
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Create lock object
      const now = Date.now();
      const lock: FileLock = {
        filePath: normalizedPath,
        agentId,
        timestamp: now,
        expiresAt: now + timeoutMs,
      };

      try {
        // Create filesystem lock
        const lockFilePath = path.join(this.lockDir, lockId);
        fs.writeFileSync(lockFilePath, JSON.stringify(lock));

        // Store lock in memory
        const locks = this.memory.retrieve("file_locks");
        // If locks is undefined, initialize it as an empty object
        const locksObj = typeof locks === "undefined" ? {} : locks;
        locksObj[normalizedPath] = lock;
        this.memory.store("file_locks", locksObj);

        log(`Lock acquired for ${normalizedPath} by agent ${agentId}`, "info");
        return true;
      } catch (error) {
        log(`Error acquiring lock for ${normalizedPath}: ${error}`, "error");

        // If this is the last attempt, return false
        if (attempt === this.maxRetries - 1) {
          return false;
        }

        // Wait before retrying
        const delay = this.retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return false;
  }

  /**
   * Release a lock on a file
   * @param filePath Path to the file to unlock
   * @param agentId ID of the agent releasing the lock
   * @returns Promise resolving to true if lock was released, false otherwise
   */
  public async releaseLock(
    filePath: string,
    agentId: string,
  ): Promise<boolean> {
    const normalizedPath = path.normalize(filePath);
    const lockId = this.getLockId(normalizedPath);
    const lockFilePath = path.join(this.lockDir, lockId);

    try {
      // Check if lock exists and belongs to the agent
      if (!this.isLockedByAgent(normalizedPath, agentId)) {
        log(
          `Cannot release lock for ${normalizedPath}: lock doesn't exist or belongs to another agent`,
          "warn",
        );
        return false;
      }

      // Remove filesystem lock
      if (fs.existsSync(lockFilePath)) {
        fs.unlinkSync(lockFilePath);
      }

      // Remove memory lock
      const locks = this.memory.retrieve("file_locks") || {};
      delete locks[normalizedPath];
      this.memory.store("file_locks", locks);

      log(`Lock released for ${normalizedPath} by agent ${agentId}`, "info");
      return true;
    } catch (error) {
      log(`Error releasing lock for ${normalizedPath}: ${error}`, "error");
      return false;
    }
  }

  /**
   * Check if a file is locked
   * @param filePath Path to the file to check
   * @returns True if the file is locked, false otherwise
   */
  public isLocked(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    const lockId = this.getLockId(normalizedPath);
    const lockFilePath = path.join(this.lockDir, lockId);

    // Check memory lock
    const locks = this.memory.retrieve("file_locks") || {};
    const memoryLock = locks[normalizedPath];

    // Check filesystem lock
    let fsLock: FileLock | null = null;
    if (fs.existsSync(lockFilePath)) {
      try {
        const lockContent = fs.readFileSync(lockFilePath, "utf8");
        fsLock = JSON.parse(lockContent) as FileLock;
      } catch (error) {
        log(`Error reading lock file ${lockFilePath}: ${error}`, "error");
      }
    }

    // If either lock exists and is not expired, the file is locked
    const now = Date.now();
    if (memoryLock && memoryLock.expiresAt > now) {
      return true;
    }

    if (fsLock && fsLock.expiresAt > now) {
      // If only filesystem lock exists, sync it to memory
      if (!memoryLock) {
        locks[normalizedPath] = fsLock;
        this.memory.store("file_locks", locks);
      }
      return true;
    }

    // If we have expired locks, clean them up
    if (
      (memoryLock && memoryLock.expiresAt <= now) ||
      (fsLock && fsLock.expiresAt <= now)
    ) {
      this.cleanupExpiredLock(normalizedPath);
    }

    return false;
  }

  /**
   * Check if a file is locked by a specific agent
   * @param filePath Path to the file to check
   * @param agentId ID of the agent to check
   * @returns True if the file is locked by the specified agent, false otherwise
   */
  public isLockedByAgent(filePath: string, agentId: string): boolean {
    const normalizedPath = path.normalize(filePath);

    // If file is not locked, return false
    if (!this.isLocked(normalizedPath)) {
      return false;
    }

    // Check memory lock
    const locks = this.memory.retrieve("file_locks") || {};
    const lock = locks[normalizedPath];

    // If lock exists and belongs to the agent, return true
    return lock && lock.agentId === agentId;
  }

  /**
   * Clean up expired locks
   */
  public cleanupExpiredLocks(): void {
    const now = Date.now();
    const locks = this.memory.retrieve("file_locks") || {};

    // Check each lock in memory
    Object.entries(locks).forEach(([filePath, lock]) => {
      if ((lock as FileLock).expiresAt <= now) {
        this.cleanupExpiredLock(filePath);
      }
    });

    // Check filesystem locks
    try {
      const lockFiles = fs.readdirSync(this.lockDir);
      lockFiles.forEach((lockFile) => {
        if (lockFile.startsWith(this.lockPrefix)) {
          const lockFilePath = path.join(this.lockDir, lockFile);
          try {
            const lockContent = fs.readFileSync(lockFilePath, "utf8");
            const lock = JSON.parse(lockContent) as FileLock;

            if (lock.expiresAt <= now) {
              fs.unlinkSync(lockFilePath);
            }
          } catch {
            // If we can't read the lock file, it might be corrupted, so remove it
            try {
              fs.unlinkSync(lockFilePath);
            } catch {
              // Ignore errors when removing potentially corrupted lock files
            }
          }
        }
      });
    } catch (error) {
      log(`Error cleaning up expired locks: ${error}`, "error");
    }
  }

  /**
   * Clean up an expired lock for a specific file
   * @param filePath Path to the file with an expired lock
   */
  private cleanupExpiredLock(filePath: string): void {
    const normalizedPath = path.normalize(filePath);
    const lockId = this.getLockId(normalizedPath);
    const lockFilePath = path.join(this.lockDir, lockId);

    // Remove filesystem lock
    if (fs.existsSync(lockFilePath)) {
      try {
        fs.unlinkSync(lockFilePath);
      } catch (error) {
        log(
          `Error removing expired lock file ${lockFilePath}: ${error}`,
          "error",
        );
      }
    }

    // Remove memory lock
    const locks = this.memory.retrieve("file_locks") || {};
    delete locks[normalizedPath];
    this.memory.store("file_locks", locks);

    log(`Cleaned up expired lock for ${normalizedPath}`, "info");
  }

  /**
   * Get the lock ID for a file path
   * @param filePath Path to the file
   * @returns Lock ID
   */
  private getLockId(filePath: string): string {
    const hash = crypto.createHash("md5").update(filePath).digest("hex");
    return `${this.lockPrefix}${hash}`;
  }
}
