import * as fs from "fs-extra";
import * as path from "path";
import * as ejs from "ejs";
import * as inquirer from "inquirer";
import chalk from "chalk";
import logger from "./log";

export enum Mode {
  Force = "force",
  Skip = "skip",
  Prompt = "prompt"
}

export type WriteArgs = {
  mode?: Mode;
  dryRun?: boolean;
  outputDir?: string;
};

export async function renderFile(filepath: string, data?: ejs.Data, options?: ejs.Options): Promise<string> {
  return ejs.render(fs.readFileSync(filepath).toString(), data, options);
}

export async function writeFile(
  filename: string,
  content: string,
  { mode, dryRun, outputDir }: WriteArgs = {}
): Promise<void> {
  // Just log out if dry run
  if (dryRun) {
    logger.log("Dry run:");
    logger.log(chalk.cyan("File:", filename));
    logger.log(content);
    return;
  }

  // Create folder if doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirpSync(outputDir);
  }

  // Construct absolute path if providing relative
  const filepath = path.isAbsolute(outputDir) ?
                    path.join(outputDir, filename)
                    : path.resolve(process.cwd(), outputDir, filename);
  const fileExists = fs.existsSync(filepath);

  let skip = fileExists && mode === Mode.Skip; // Only apply skip if file already exists
  if (fileExists && mode === Mode.Prompt) {
    const { mode }: { mode: string } = await inquirer.prompt([
      {
        type: "input",
        name: "mode",
        message: `${filepath} already exists. Overwrite? (Y/n)`
      }
    ]);

    skip = mode.trim().toLowerCase() === "n" || mode.trim().toLowerCase() === "no";
  }

  if (skip) {
    logger.log(chalk.magenta("Skipping generation for", filepath));
    return;
  }

  fs.writeFileSync(filepath, content);
  logger.log(chalk.green("File written to", filepath));
}
