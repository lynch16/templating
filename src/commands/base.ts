import * as yargs from "yargs";
import { Mode } from "../utils/fileUtils";

export interface NormalizedBaseOptions {
  outputDir: string;
  mode: Mode;
  dryRun: boolean;
  quiet: boolean;
}

export interface BaseOptions extends Omit<NormalizedBaseOptions, "mode"> {
  force: boolean;
  skip: boolean;
}

export const baseOptions: { [K in keyof BaseOptions]: yargs.Options } = {
  outputDir: {
    alias: "o",
    description: "The location to generate the component files",
    demandOption: false
  },
  force: {
    alias: "f",
    description: "Overwrite files if conflict exists on generation",
    boolean: true,
    conflicts: "skip"
  },
  skip: {
    alias: "s",
    description: "Skip files if conflict exists on generation",
    boolean: true,
    conflicts: "force"
  },
  dryRun: {
    description: "Print output instead of writing to file",
    boolean: true,
    default: false
  },
  quiet: {
    description: "Print output instead of writing to file",
    boolean: true,
    default: false
  }
};

export function getBaseOptions<T extends BaseOptions>(
  options: { [K in keyof T]: yargs.Arguments<any> }
): NormalizedBaseOptions {
  const { outputDir, dryRun, quiet } = options;
  const mode = (!!options.force && Mode.Force) || (!!options.skip && Mode.Skip);

  return {
    mode,
    outputDir,
    dryRun: !!dryRun,
    quiet: !!quiet,
  };
}
