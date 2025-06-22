/**
 * Logger for Rovo Dev CLI
 */

import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";
import { validateFilePath } from "./utils";
import { LoggingError } from "./errors";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  // Singleton instance for centralized logging
  private static instance: Logger;

  private logDir: string;
  private logFile: string;
  private level: LogLevel;
  private writeToConsole: boolean;

  /**
   * Get the singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  constructor(level: LogLevel = LogLevel.INFO, writeToConsole: boolean = true) {
    this.level = level;
    this.writeToConsole = writeToConsole;
    this.logDir = path.join(os.homedir(), ".rovodev", "logs");

    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    this.logFile = path.join(this.logDir, `rovodev-${timestamp}.log`);
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set whether to write to console
   */
  public setWriteToConsole(writeToConsole: boolean): void {
    this.writeToConsole = writeToConsole;
  }

  /**
   * Log a debug message
   */
  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Log an info message
   */
  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Log an error message
   */
  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Log a message with a specific level
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelString = LogLevel[level];

    // Format message with args
    let formattedMessage = message;
    if (args.length > 0) {
      try {
        formattedMessage +=
          " " +
          args
            .map((arg) => {
              if (typeof arg === "object") {
                return JSON.stringify(arg);
              }
              return String(arg);
            })
            .join(" ");
      } catch {
        // Error is intentionally ignored
        formattedMessage += " [Error formatting args]";
      }
    }

    // Create log entry
    const logEntry = `[${timestamp}] ${levelString}: ${formattedMessage}`;

    // Write to log file
    try {
      // Validate file path
      const validatedPath = validateFilePath(this.logFile, [this.logDir]);
      fs.appendFileSync(validatedPath, logEntry + "\n");
    } catch (error) {
      if (this.writeToConsole) {
        console.error(chalk.red("Error writing to log file:"), error);
      }

      // Throw a logging error for better error handling
      throw new LoggingError(`Failed to write to log file: ${error.message}`, {
        cause: error,
        context: { logFile: this.logFile, message: formattedMessage },
      });
    }

    // Write to console if enabled
    if (this.writeToConsole) {
      let consoleMethod: "log" | "info" | "warn" | "error";
      let chalkColor: any;

      switch (level) {
        case LogLevel.DEBUG:
          consoleMethod = "log";
          chalkColor = chalk.gray;
          break;
        case LogLevel.INFO:
          consoleMethod = "info";
          chalkColor = chalk.blue;
          break;
        case LogLevel.WARN:
          consoleMethod = "warn";
          chalkColor = chalk.yellow;
          break;
        case LogLevel.ERROR:
          consoleMethod = "error";
          chalkColor = chalk.red;
          break;
        default:
          consoleMethod = "log";
          chalkColor = chalk.white;
      }

      console[consoleMethod](chalkColor(`[${levelString}]`), formattedMessage);
    }
  }

  /**
   * Get the path to the current log file
   */
  public getLogFile(): string {
    return this.logFile;
  }

  /**
   * Get all log files
   */
  public getLogFiles(): string[] {
    try {
      return fs
        .readdirSync(this.logDir)
        .filter((file) => file.endsWith(".log"))
        .map((file) => {
          // Validate each log file path
          return validateFilePath(path.join(this.logDir, file), [this.logDir]);
        });
    } catch (error) {
      if (this.writeToConsole) {
        console.error(chalk.red("Error getting log files:"), error);
      }

      // Throw a logging error for better error handling
      throw new LoggingError(`Failed to get log files: ${error.message}`, {
        cause: error,
        context: { logDir: this.logDir },
      });
    }
  }

  /**
   * Clear all log files
   */
  public clearLogs(): void {
    try {
      const files = this.getLogFiles();

      for (const file of files) {
        fs.unlinkSync(file);
      }

      if (this.writeToConsole) {
        console.log(chalk.green("All log files have been cleared."));
      }
    } catch (error) {
      if (this.writeToConsole) {
        console.error(chalk.red("Error clearing log files:"), error);
      }
    }
  }
}
