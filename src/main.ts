import * as  yargs from "yargs";
import chalk from "chalk";
import { EOL } from "os";
import * as Commands from "./commands";

export const main = async () => {
  process.env.FORCE_COLOR = "1"; // For color in console output

  try {
    yargs
      .showHelpOnFail(true)
      .usage("Usage: $0 <command> [options]")
      .command(Commands.generateModule)
      .demandCommand()
      .wrap(Math.min(200, yargs.terminalWidth()))
      .help().argv;
  } catch (e) {
    console.error(chalk.red(EOL + "An uncaught exception has occurred."), e);
    process.exit(1);
  }
};
