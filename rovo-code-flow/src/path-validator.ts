/**
 * Path validation utilities for security
 */

import path from "path";
import os from "os";

/**
 * Validates that a file path is safe and within allowed directories
 * @param filePath The path to validate
 * @param allowedBasePaths Optional array of allowed base paths
 * @returns The normalized safe path
 * @throws Error if path is unsafe
 */
export function validatePath(
  filePath: string,
  allowedBasePaths?: string[],
): string {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid file path: path must be a non-empty string");
  }

  // Normalize the path to resolve any .. or . components
  const normalizedPath = path.normalize(filePath);

  // Check for path traversal attempts
  if (normalizedPath.includes("..")) {
    throw new Error("Invalid file path: path traversal detected");
  }

  // If allowed base paths are specified, ensure the path is within one of them
  if (allowedBasePaths && allowedBasePaths.length > 0) {
    const resolvedPath = path.resolve(normalizedPath);
    const isAllowed = allowedBasePaths.some((basePath) => {
      const resolvedBasePath = path.resolve(basePath);
      return resolvedPath.startsWith(resolvedBasePath);
    });

    if (!isAllowed) {
      throw new Error(
        `Invalid file path: path must be within allowed directories`,
      );
    }
  }

  return normalizedPath;
}

/**
 * Creates a safe path within the user's home directory
 * @param relativePath Path relative to home directory
 * @returns Safe absolute path
 */
export function createHomePath(relativePath: string): string {
  const homeDir = os.homedir();
  const safePath = validatePath(relativePath);
  return path.join(homeDir, safePath);
}

/**
 * Creates a safe path within the current working directory
 * @param relativePath Path relative to current directory
 * @returns Safe absolute path
 */
export function createWorkingPath(relativePath: string): string {
  const workingDir = process.cwd();
  const safePath = validatePath(relativePath);
  return path.join(workingDir, safePath);
}

/**
 * Validates that a directory path is safe for creation
 * @param dirPath The directory path to validate
 * @returns The validated path
 */
export function validateDirectoryPath(dirPath: string): string {
  const safePath = validatePath(dirPath);

  // Additional checks for directory paths
  if (
    safePath.startsWith("/etc") ||
    safePath.startsWith("/sys") ||
    safePath.startsWith("/proc")
  ) {
    throw new Error("Invalid directory path: system directories not allowed");
  }

  return safePath;
}
