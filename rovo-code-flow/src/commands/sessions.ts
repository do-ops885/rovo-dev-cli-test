/**
 * Session management commands
 */

import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";
import { getSessionFiles, getSessionDetails } from "../utils";

interface SessionsOptions {
  clear?: boolean;
  prune?: boolean;
  switch?: string;
  list?: boolean;
}

export async function sessionsCommand(
  options: SessionsOptions = {},
): Promise<void> {
  const sessionsPath = path.join(os.homedir(), ".rovodev", "sessions");

  // Create sessions directory if it doesn't exist
  if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath, { recursive: true });
  }

  // Handle clear option
  if (options.clear === true) {
    await clearSession();
    return;
  }

  // Handle prune option
  if (options.prune === true) {
    await pruneSession();
    return;
  }

  // Handle switch option
  if (options.switch !== undefined && options.switch.trim() !== "") {
    await switchSession(options.switch);
    return;
  }

  // Default: list sessions
  await listSessions();
}

/**
 * List all available sessions
 */
async function listSessions(): Promise<void> {
  const sessionFiles = getSessionFiles();

  if (sessionFiles.length === 0) {
    console.log(chalk.yellow("No sessions found."));
    return;
  }

  console.log(chalk.blue("Available sessions:"));

  const sessions = sessionFiles
    .map((file) => getSessionDetails(file))
    .filter((session) => session !== null)
    .sort((a, b) => b.updated.getTime() - a.updated.getTime());

  sessions.forEach((session, index) => {
    const isActive = index === 0;
    const color = isActive ? chalk.green : chalk.white;
    const activeMarker = isActive ? "* " : "  ";
    const date = session.updated.toLocaleString();

    console.log(
      `${activeMarker}${color(session.id)} - ${session.title} (${date}, ${session.messages} messages)`,
    );
  });

  console.log(
    '\nUse "rovo-code-flow sessions --switch <id>" to switch to a different session.',
  );
}

/**
 * Clear the current session
 */
async function clearSession(): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to clear the current session history?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  const sessionFiles = getSessionFiles();

  if (sessionFiles.length === 0) {
    console.log(chalk.yellow("No active session found."));
    return;
  }

  // Get the most recently updated session (current session)
  const sessions = sessionFiles
    .map((file) => ({ file, details: getSessionDetails(file) }))
    .filter((session) => session.details !== null)
    .sort((a, b) => b.details.updated.getTime() - a.details.updated.getTime());

  if (sessions.length === 0) {
    console.log(chalk.yellow("No active session found."));
    return;
  }

  const currentSession = sessions[0];

  try {
    // Read the session file
    const sessionData = JSON.parse(
      fs.readFileSync(currentSession.file, "utf8"),
    );

    // Clear messages but keep metadata
    sessionData.messages = [];

    // Update the file
    fs.writeFileSync(currentSession.file, JSON.stringify(sessionData, null, 2));

    console.log(
      chalk.green(
        `Session "${currentSession.details.title}" has been cleared.`,
      ),
    );
  } catch (error) {
    console.error(chalk.red("Error clearing session:"), error);
  }
}

/**
 * Prune the current session to reduce token size
 */
async function pruneSession(): Promise<void> {
  const sessionFiles = getSessionFiles();

  if (sessionFiles.length === 0) {
    console.log(chalk.yellow("No active session found."));
    return;
  }

  // Get the most recently updated session (current session)
  const sessions = sessionFiles
    .map((file) => ({ file, details: getSessionDetails(file) }))
    .filter((session) => session.details !== null)
    .sort((a, b) => b.details.updated.getTime() - a.details.updated.getTime());

  if (sessions.length === 0) {
    console.log(chalk.yellow("No active session found."));
    return;
  }

  const currentSession = sessions[0];

  try {
    // Read the session file
    const sessionData = JSON.parse(
      fs.readFileSync(currentSession.file, "utf8"),
    );

    if (!sessionData.messages || sessionData.messages.length < 4) {
      console.log(chalk.yellow("Session has too few messages to prune."));
      return;
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `This will reduce the token size of session "${currentSession.details.title}" by removing details from older messages while preserving context. Continue?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Operation cancelled."));
      return;
    }

    // Keep the first message (system prompt) and the last 3 messages intact
    const firstMessage = sessionData.messages[0];
    const lastMessages = sessionData.messages.slice(-3);

    // For other messages, keep only essential information
    const prunedMiddleMessages = sessionData.messages
      .slice(1, -3)
      .map((msg) => ({
        role: msg.role,
        content:
          msg.role === "user"
            ? msg.content.length > 100
              ? msg.content.substring(0, 100) + "... [pruned]"
              : msg.content
            : "Response from assistant [pruned for token efficiency]",
      }));

    // Reassemble the messages
    sessionData.messages = [
      firstMessage,
      ...prunedMiddleMessages,
      ...lastMessages,
    ];

    // Update the file
    fs.writeFileSync(currentSession.file, JSON.stringify(sessionData, null, 2));

    console.log(
      chalk.green(
        `Session "${currentSession.details.title}" has been pruned to reduce token usage.`,
      ),
    );
  } catch (error) {
    console.error(chalk.red("Error pruning session:"), error);
  }
}

/**
 * Switch to a different session
 */
async function switchSession(sessionId: string): Promise<void> {
  const sessionFiles = getSessionFiles();

  if (sessionFiles.length === 0) {
    console.log(chalk.yellow("No sessions found."));
    return;
  }

  // Find the requested session
  const targetSessionFile = sessionFiles.find(
    (file) => path.basename(file, ".json") === sessionId,
  );

  if (!targetSessionFile) {
    console.log(chalk.red(`Session "${sessionId}" not found.`));
    console.log(chalk.yellow("Available sessions:"));

    sessionFiles.forEach((file) => {
      const id = path.basename(file, ".json");
      console.log(`  ${id}`);
    });

    return;
  }

  try {
    // Read the session file to verify it's valid
    const sessionData = JSON.parse(fs.readFileSync(targetSessionFile, "utf8"));

    // Update the session's "updated" timestamp to make it the current session
    sessionData.updated = new Date().toISOString();

    // Write back to the file
    fs.writeFileSync(targetSessionFile, JSON.stringify(sessionData, null, 2));

    const sessionDetails = getSessionDetails(targetSessionFile);
    console.log(
      chalk.green(
        `Switched to session "${sessionDetails.title}" (${sessionId}).`,
      ),
    );

    // Display message count
    console.log(
      chalk.blue(`This session has ${sessionDetails.messages} messages.`),
    );
  } catch (error) {
    console.error(chalk.red("Error switching session:"), error);
  }
}
