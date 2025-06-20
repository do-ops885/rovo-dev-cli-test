/**
 * ACLI integration commands
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { AcliIntegration } from "../acli-integration";

interface AcliOptions {
  interactive?: boolean;
  instruction?: string;
}

export async function acliCommand(
  action: string,
  options: AcliOptions = {},
): Promise<void> {
  const acli = new AcliIntegration();

  switch (action) {
    case "install":
      await installRovoDev(acli);
      break;

    case "auth":
      await authRovoDev(acli);
      break;

    case "run":
      if (options.instruction) {
        await acli.runWithInstruction(options.instruction);
      } else {
        await acli.runInteractive();
      }
      break;

    case "setup":
      await setupRovoDev(acli);
      break;

    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.yellow("Available actions: install, auth, run, setup"));
  }
}

/**
 * Install Rovo Dev
 */
async function installRovoDev(acli: AcliIntegration): Promise<void> {
  console.log(chalk.blue("Checking if ACLI is installed..."));

  const isAcliInstalled = await acli.isAcliInstalled();

  if (!isAcliInstalled) {
    console.log(chalk.red("ACLI is not installed. Please install ACLI first."));
    console.log(chalk.yellow("Installation instructions:"));
    console.log(
      "- macOS: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-macos",
    );
    console.log(
      "- Linux: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-linux",
    );
    console.log(
      "- Windows: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-windows",
    );
    return;
  }

  console.log(chalk.green("ACLI is installed."));
  console.log(chalk.blue("Initializing Rovo Dev configuration..."));

  const initialized = await acli.initRovoDev();

  if (initialized) {
    console.log(
      chalk.green("Rovo Dev configuration initialized successfully."),
    );
    console.log(chalk.yellow("Next steps:"));
    console.log(
      "1. Create an unscoped API token at https://id.atlassian.com/manage-profile/security/api-tokens",
    );
    console.log(
      '2. Run "rovo-code-flow acli auth" to authenticate with your Atlassian account',
    );
  } else {
    console.log(chalk.red("Failed to initialize Rovo Dev configuration."));
  }
}

/**
 * Authenticate with Atlassian account
 */
async function authRovoDev(acli: AcliIntegration): Promise<void> {
  console.log(chalk.blue("Starting Atlassian authentication process..."));
  console.log(
    chalk.yellow("Make sure you have created an unscoped API token at:"),
  );
  console.log("https://id.atlassian.com/manage-profile/security/api-tokens");

  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: "Do you want to proceed with authentication?",
      default: true,
    },
  ]);

  if (proceed) {
    await acli.authLogin();
  } else {
    console.log(chalk.yellow("Authentication cancelled."));
  }
}

/**
 * Setup Rovo Dev (combined install and auth)
 */
async function setupRovoDev(acli: AcliIntegration): Promise<void> {
  console.log(chalk.blue("Setting up Rovo Dev..."));

  // Check ACLI installation
  const isAcliInstalled = await acli.isAcliInstalled();

  if (!isAcliInstalled) {
    console.log(chalk.red("ACLI is not installed. Please install ACLI first."));
    console.log(chalk.yellow("Installation instructions:"));
    console.log(
      "- macOS: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-macos",
    );
    console.log(
      "- Linux: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-linux",
    );
    console.log(
      "- Windows: https://developer.atlassian.com/platform/atlassian-cli/getting-started-with-acli/#install-acli-on-windows",
    );
    return;
  }

  console.log(chalk.green("ACLI is installed."));

  // Initialize Rovo Dev
  console.log(chalk.blue("Initializing Rovo Dev configuration..."));
  const initialized = await acli.initRovoDev();

  if (!initialized) {
    console.log(chalk.red("Failed to initialize Rovo Dev configuration."));
    return;
  }

  console.log(chalk.green("Rovo Dev configuration initialized successfully."));

  // Authenticate
  console.log(chalk.blue("Starting Atlassian authentication process..."));
  console.log(
    chalk.yellow("Make sure you have created an unscoped API token at:"),
  );
  console.log("https://id.atlassian.com/manage-profile/security/api-tokens");

  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: "Do you want to proceed with authentication?",
      default: true,
    },
  ]);

  if (proceed) {
    const authenticated = await acli.authLogin();

    if (authenticated) {
      console.log(chalk.green("Setup completed successfully!"));
      console.log(chalk.blue("You can now run Rovo Dev with:"));
      console.log("  rovo-code-flow acli run");
    }
  } else {
    console.log(chalk.yellow("Authentication skipped."));
    console.log(chalk.blue("You can authenticate later with:"));
    console.log("  rovo-code-flow acli auth");
  }
}
