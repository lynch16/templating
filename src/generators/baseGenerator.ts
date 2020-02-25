import * as path from "path";
import * as yargs from "yargs";
import Templator from "../templates/templator";
import { writeFile, WriteArgs } from "../utils/fileUtils";
import Metadator from "../templates/metadator";

/**
 * Class to execute given generators and write the results to files
 * Specific component generator strategies should extend this class
 */
abstract class BaseGenerator<Args, Params> {
  public metadata: Metadator<Params>;

  // Where the generator will insert folder unless specified by user
  public abstract defaultFolder: string;

  // Templator class to use for generator
  public abstract templator: Templator<Params>;

  // Helper method for converting arguments to metadata
  // Should be implmeneted in subclasses to construct params needed for their templates
  public abstract buildMetadata(_: yargs.Arguments<Args>): void;

  // Yargs options to pass to generate command based on template
  // Additional options will show up in help if the template is specified
  public static generatorOptions: { [key: string]: yargs.Options };

  public constructor(name: string) {
    this.metadata = new Metadator<Params>(name, this.constructor.name);
  }

  public getComponentName(): string {
    return this.metadata.read().name;
  }

  // Helper method for output directory fallback
  private getOutputDir(outputDir: string): string {
    return outputDir || path.join(process.cwd(), this.defaultFolder, this.getComponentName());
  }

  // Render the templates and write their results to files
  public async generate(writeOptions: WriteArgs): Promise<void> {
    const outputDir = this.getOutputDir(writeOptions.outputDir);

    const generatedtemplates = await this.templator.renderAsFile(this.metadata.read());
    const keys = Object.keys(generatedtemplates);
    for (let i = 0; i < keys.length; i++) {
      const filename = keys[i];
      await writeFile(filename, generatedtemplates[filename], {
        ...writeOptions,
        outputDir
      });
    }
  }
}

export default BaseGenerator;
