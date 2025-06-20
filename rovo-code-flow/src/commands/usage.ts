/**
 * Display token usage information
 */

import chalk from "chalk";
import { getDailyTokenUsage, formatTokenUsage } from "../utils";

export function usageCommand(): void {
  const { used, limit } = getDailyTokenUsage();
  const percentage = (used / limit) * 100;

  console.log(chalk.blue("Daily Token Usage:"));
  console.log(formatTokenUsage(used, limit));

  if (percentage > 90) {
    console.log(
      chalk.red("Warning: You are approaching your daily token limit!"),
    );
  } else if (percentage > 70) {
    console.log(
      chalk.yellow(
        "Note: You have used more than 70% of your daily token limit.",
      ),
    );
  } else {
    console.log(chalk.green("You have plenty of tokens remaining for today."));
  }

  console.log(chalk.blue("\nToken Usage Information:"));
  console.log(
    "- Rovo Dev uses AI models from Anthropic: Sonnet 4, Sonnet 3.7 and Sonnet 3.5v2",
  );
  console.log("- Token usage is reset daily");
  console.log("- Usage data is stored in ~/.rovodev/usage.json");
}
