/**
 * Log management commands
 */

import chalk from "chalk";
import fs from "fs";
import path from "path";
import os from "os";
import { Logger, LogLevel } from "../logger";

interface LogsOptions {
  show?: string;
  clear?: boolean;
  level?: string;
}

export function logsCommand(action: string, options: LogsOptions = {}): void {
  const logger = new Logger();

  switch (action) {
    case "list":
      listLogs(logger);
      break;

    case "show":
      if (options.show) {
        showLog(logger, options.show);
      } else {
        showCurrentLog(logger);
      }
      break;

    case "clear":
      clearLogs(logger, options.clear === true);
      break;

    case "level":
      if (options.level) {
        setLogLevel(logger, options.level);
      } else {
        showLogLevel(logger);
      }
      break;

    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.yellow("Available actions: list, show, clear, level"));
  }
}

/**
 * List all log files
 */
function listLogs(logger: Logger): void {
  const logFiles = logger.getLogFiles();

  if (logFiles.length === 0) {
    console.log(chalk.yellow("No log files found."));
    return;
  }

  console.log(chalk.blue("Log files:"));

  logFiles.forEach((file) => {
    const stats = fs.statSync(file);
    const size = (stats.size / 1024).toFixed(2);
    const date = stats.mtime.toISOString().split("T")[0];
    const isCurrent = file === logger.getLogFile();

    const prefix = isCurrent ? "* " : "  ";
    const color = isCurrent ? chalk.green : chalk.white;

    console.log(`${prefix}${color(path.basename(file))} (${size} KB, ${date})`);
  });

  console.log(
    chalk.blue(
      '\nUse "rovo-code-flow logs show <filename>" to view a log file.',
    ),
  );
}

/**
 * Show the contents of a log file
 */
function showLog(logger: Logger, filename: string): void {
  const logDir = path.join(os.homedir(), ".rovodev", "logs");
  const logFile = path.join(logDir, filename);

  if (!fs.existsSync(logFile)) {
    console.log(chalk.red(`Log file "${filename}" not found.`));
    return;
  }

  try {
    const content = fs.readFileSync(logFile, "utf8");

    console.log(chalk.blue(`Contents of ${filename}:`));
    console.log(content);
  } catch (error) {
    console.error(chalk.red(`Error reading log file: ${error}`));
  }
}

/**
 * Show the contents of the current log file
 */
function showCurrentLog(logger: Logger): void {
  const logFile = logger.getLogFile();

  try {
    if (!fs.existsSync(logFile)) {
      console.log(chalk.yellow("Current log file is empty."));
      return;
    }

    const content = fs.readFileSync(logFile, "utf8");

    console.log(
      chalk.blue(`Contents of current log file (${path.basename(logFile)}):`),
    );
    console.log(content);
  } catch (error) {
    console.error(chalk.red(`Error reading log file: ${error}`));
  }
}

/**
 * Clear log files
 */
function clearLogs(logger: Logger, keepCurrent: boolean = true): void {
  try {
    const logFiles = logger.getLogFiles();
    const currentLogFile = logger.getLogFile();

    let cleared = 0;

    for (const file of logFiles) {
      if (keepCurrent && file === currentLogFile) {
        continue;
      }

      fs.unlinkSync(file);
      cleared++;
    }

    if (cleared === 0) {
      console.log(chalk.yellow("No log files to clear."));
    } else {
      console.log(chalk.green(`Cleared ${cleared} log file(s).`));
    }
  } catch (error) {
    console.error(chalk.red(`Error clearing log files: ${error}`));
  }
}

/**
 * Set log level
 */
function setLogLevel(logger: Logger, level: string): void {
  const upperLevel = level.toUpperCase();

  if (!(upperLevel in LogLevel)) {
    console.log(chalk.red(`Invalid log level: ${level}`));
    console.log(chalk.yellow("Available levels: DEBUG, INFO, WARN, ERROR"));
    return;
  }

  const logLevel = LogLevel[upperLevel as keyof typeof LogLevel];
  logger.setLevel(logLevel);

  console.log(chalk.green(`Log level set to ${upperLevel}`));
}

/**
 * Show current log level
 */
function showLogLevel(_logger: Logger): void {
  // Since the current level is private in the Logger class,
  // we can't directly access it. We'll just show the available levels.
  console.log(chalk.blue("Available log levels:"));
  console.log("- DEBUG: Most verbose, logs everything");
  console.log("- INFO: Logs informational messages, warnings, and errors");
  console.log("- WARN: Logs warnings and errors only");
  console.log("- ERROR: Logs errors only");

  console.log(
    chalk.yellow(
      '\nUse "rovo-code-flow logs level <level>" to set the log level.',
    ),
  );
}
