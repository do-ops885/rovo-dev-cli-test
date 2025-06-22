/**
 * Instructions management commands
 */

import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";
import yaml from "yaml";
import { AcliIntegration } from "../acli-integration";

interface InstructionsOptions {
  list?: boolean;
  add?: boolean;
  remove?: string;
  run?: string;
}

interface Instruction {
  name: string;
  prompt: string;
}

interface InstructionsFile {
  instructions: Instruction[];
}

export async function instructionsCommand(
  options: InstructionsOptions = {},
): Promise<void> {
  const instructionsPath = path.join(
    os.homedir(),
    ".rovodev",
    "instructions.yml",
  );

  // Create instructions file if it doesn't exist
  if (!fs.existsSync(path.dirname(instructionsPath))) {
    fs.mkdirSync(path.dirname(instructionsPath), { recursive: true });
  }

  if (!fs.existsSync(instructionsPath)) {
    const acli = new AcliIntegration();
    await acli.initRovoDev();
  }

  // Handle add option
  if (options.add) {
    await addInstruction();
    return;
  }

  // Handle remove option
  if (options.remove) {
    await removeInstruction(options.remove);
    return;
  }

  // Handle run option
  if (options.run) {
    await runInstruction(options.run);
    return;
  }

  // Default: list instructions
  await listInstructions();
}

/**
 * List all saved instructions
 */
async function listInstructions(): Promise<void> {
  const instructionsPath = path.join(
    os.homedir(),
    ".rovodev",
    "instructions.yml",
  );

  if (!fs.existsSync(instructionsPath)) {
    console.log(chalk.yellow("No instructions found."));
    return;
  }

  try {
    // yaml is now imported at the top of the file
    const content = fs.readFileSync(instructionsPath, "utf8");
    const parsed = yaml.parse(content);

    if (!parsed.instructions || parsed.instructions.length === 0) {
      console.log(chalk.yellow("No instructions found."));
      return;
    }

    console.log(chalk.blue("Saved instructions:"));

    parsed.instructions.forEach((instruction: any, index: number) => {
      console.log(`${index + 1}. ${chalk.green(instruction.name)}`);
      console.log(`   ${instruction.prompt}`);
      console.log();
    });

    console.log(
      'Use "rovo-code-flow instructions --run <name>" to run an instruction.',
    );
  } catch (error) {
    console.error(chalk.red("Error listing instructions:"), error);
  }
}

/**
 * Add a new instruction
 */
async function addInstruction(): Promise<void> {
  const { name, prompt } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a name for the instruction:",
      validate: (input) =>
        input.trim().length > 0 ? true : "Name is required",
    },
    {
      type: "input",
      name: "prompt",
      message: "Enter the instruction prompt:",
      validate: (input) =>
        input.trim().length > 0 ? true : "Prompt is required",
    },
  ]);

  const instructionsPath = path.join(
    os.homedir(),
    ".rovodev",
    "instructions.yml",
  );

  try {
    // yaml is now imported at the top of the file
    let parsed: InstructionsFile = { instructions: [] };

    if (fs.existsSync(instructionsPath)) {
      const content = fs.readFileSync(instructionsPath, "utf8");
      parsed = yaml.parse(content) || { instructions: [] };

      if (!parsed.instructions) {
        parsed.instructions = [];
      }
    }

    // Check for duplicate name
    if (parsed.instructions.some((i: any) => i.name === name)) {
      console.log(
        chalk.yellow(`An instruction with the name "${name}" already exists.`),
      );

      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "Do you want to overwrite it?",
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow("Operation cancelled."));
        return;
      }

      // Remove the existing instruction
      parsed.instructions = parsed.instructions.filter(
        (i: any) => i.name !== name,
      );
    }

    // Add the new instruction
    if (!Array.isArray(parsed.instructions)) {
      parsed.instructions = [];
    }
    parsed.instructions.push({ name, prompt } as Instruction);

    // Write back to the file
    fs.writeFileSync(instructionsPath, yaml.stringify(parsed));

    console.log(chalk.green(`Instruction "${name}" has been saved.`));
  } catch (error) {
    console.error(chalk.red("Error adding instruction:"), error);
  }
}

/**
 * Remove an instruction
 */
async function removeInstruction(name: string): Promise<void> {
  const instructionsPath = path.join(
    os.homedir(),
    ".rovodev",
    "instructions.yml",
  );

  if (!fs.existsSync(instructionsPath)) {
    console.log(chalk.yellow("No instructions found."));
    return;
  }

  try {
    // yaml is now imported at the top of the file
    const content = fs.readFileSync(instructionsPath, "utf8");
    const parsed = yaml.parse(content);

    if (!parsed.instructions || parsed.instructions.length === 0) {
      console.log(chalk.yellow("No instructions found."));
      return;
    }

    // Find the instruction
    const instructionIndex = parsed.instructions.findIndex(
      (i: any) => i.name === name,
    );

    if (instructionIndex === -1) {
      console.log(chalk.red(`Instruction "${name}" not found.`));
      return;
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to remove instruction "${name}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Operation cancelled."));
      return;
    }

    // Remove the instruction
    parsed.instructions.splice(instructionIndex, 1);

    // Write back to the file
    fs.writeFileSync(instructionsPath, yaml.stringify(parsed));

    console.log(chalk.green(`Instruction "${name}" has been removed.`));
  } catch (error) {
    console.error(chalk.red("Error removing instruction:"), error);
  }
}

/**
 * Run an instruction
 */
async function runInstruction(name: string): Promise<void> {
  const instructionsPath = path.join(
    os.homedir(),
    ".rovodev",
    "instructions.yml",
  );

  if (!fs.existsSync(instructionsPath)) {
    console.log(chalk.yellow("No instructions found."));
    return;
  }

  try {
    // yaml is now imported at the top of the file
    const content = fs.readFileSync(instructionsPath, "utf8");
    const parsed = yaml.parse(content);

    if (!parsed.instructions || parsed.instructions.length === 0) {
      console.log(chalk.yellow("No instructions found."));
      return;
    }

    // Find the instruction
    const instruction = parsed.instructions.find((i: any) => i.name === name);

    if (!instruction) {
      console.log(chalk.red(`Instruction "${name}" not found.`));
      return;
    }

    console.log(chalk.blue(`Running instruction "${name}"...`));
    console.log(chalk.green(`Prompt: ${instruction.prompt}`));

    // Run the instruction using ACLI
    const acli = new AcliIntegration();
    await acli.runWithInstruction(instruction.prompt);
  } catch (error) {
    console.error(chalk.red("Error running instruction:"), error);
  }
}
