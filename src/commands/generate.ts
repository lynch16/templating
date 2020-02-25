import * as yargs from "yargs";
import logger from "../utils/log";
import { baseOptions, BaseOptions, getBaseOptions } from "./base";
import { fetchGeneratorByKey, camelCaseGeneratorKey, generatorOptions, PossibleGenerators } from "../generators";

interface Settings extends BaseOptions {
  template: string;
  name: string;
  generator: PossibleGenerators;
}

function builder(yargs: yargs.Argv): yargs.Argv {
  const [template, name] = process.argv.slice(3);

  const parser = yargs
    .positional("template", {
      describe: "The component to generate",
      type: "string",
      coerce: (key: string) => camelCaseGeneratorKey(key),
    })
    .positional("name", {
      describe: "The name of the generate component",
      type: "string"
    })
    .options(baseOptions)
    .check(argv => {
      // Verify template exists
      if (!generatorOptions.hasOwnProperty(argv.template)) {
        throw new Error(`Unknown template ${argv.template}`);
      }
      return true;
    }, false);

  // Append additional options for the specified template
  const GeneratorClass = template && fetchGeneratorByKey(template);
  if (GeneratorClass && GeneratorClass.generatorOptions) {
    parser.options(GeneratorClass.generatorOptions).option("generator", {
      default: new GeneratorClass(name),
      hidden: true
    });
  }

  return parser;
}

function commandHandler(settings: yargs.Arguments<Settings>): void {
  const { quiet, ...generationOptions } = getBaseOptions(settings);
  logger.setDebug(quiet);
  const { generator } = settings;
  generator.buildMetadata(settings as any);
  generator.generate(generationOptions);
}

export const generateModule: yargs.CommandModule = {
  builder,
  command: "generate <template> <name>",
  aliases: "g",
  describe: "Generate a component",
  handler: commandHandler
};
