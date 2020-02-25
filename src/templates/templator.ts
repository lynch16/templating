import * as ejs from "ejs";
import * as fs from "fs-extra";
import * as path from "path";
import * as prettier from "prettier";
import chalk from "chalk";
import logger from "../utils/log";
import Importer from "./importer";
import { Metadata } from "./metadator";
import { renderFile } from "../utils/fileUtils";

// Blacklist imports keyword from data
type TemplateData = ejs.Data & {
  importer?: never;
};

/**
 * Class to read EJS template files and generate file strings.
 * Imports are handled via Importer using an `importer` member in the data set when rendering.
 * Specific component template strategies should extend this class
 */
abstract class Templator<Params extends { [key: string]: any }> {
  // Where the template files are located
  public abstract templateDir: string;

  // Options to apply on render
  public options: Omit<ejs.Options, "async">;

  // Instance of importer for when the templator is rendered as file
  private importer: Importer;

  public constructor() {
    this.importer = new Importer();
  }

  // Get all .ejs filenames from template directory
  public getTemplates(): string[] {
    if (!fs.existsSync(this.templateDir)) {
      throw new Error(`Rendering template failed. Template directory ${this.templateDir} not found`);
    }
    return fs.readdirSync(this.templateDir).filter((file: string) => path.extname(file) === ".ejs");
  }

  // Render a template with a given importer
  public renderTemplate(
    file: string,
    data?: TemplateData,
    importer?: Importer,
  ): Promise<string> {
    return renderFile(file, { ...data, importer: importer || this.importer }, this.options);
  }

  // Insert import string and run through prettier
  // If prettier fails, log warning but dont block generation
  public formatContent(importString: string, templateString: string): string {
    const contentString = `${importString ? `${importString} \n` : ""}${templateString}`;
    try {
      return prettier.format(contentString, {
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        jsxSingleQuote: false,
        trailingComma: "es5",
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: "always",
        parser: "babel"
      });
    } catch (e) {
      logger.warn(chalk.yellow("Error formatting template.", e.message));
      logger.warn("Continuing generation...");
      return contentString;
    }
  }

  // Method to convert metdata object to data for EJS template
  // Must be implemented in subclasses
  public processMetadata(_: Metadata<Params>): TemplateData {
    throw new Error(`Missing processMetadata function for ${this.constructor.name}`);
  }

  // Render a template using different importer. Does not prepend the imports
  public async renderAsPartial(templateFile: string, metadata: Metadata<Params>, importer: Importer): Promise<string> {
    // Render out template & collect imports
    const templateString = await this.renderTemplate(
      path.resolve(this.templateDir, templateFile),
      this.processMetadata(metadata),
      importer,
    );

    // Save content w/ new filename
    return this.formatContent(null, templateString);
  }

  // Render a template, extract & prepend the imports, then reset imports store for the next file
  public async renderAsFile(metadata: Metadata<Params>): Promise<{ [key: string]: string }> {
    const filesWithContent = {} as { [key: string]: string };
    const templateFiles = this.getTemplates();
    const baseFilename = metadata.name;

    for (let i = 0; i < templateFiles.length; i++) {
      const file = templateFiles[i];
      const templateString = await this.renderAsPartial(file, metadata, this.importer);
      // Reformat filenames
      const [, ...rest] = path.parse(file).name.split(".");
      const newFilename = [baseFilename, ...rest].join(".");

      // Format imports & template to create full file
      filesWithContent[newFilename] = this.formatContent(this.importer.renderImports(), templateString);
      this.importer.resetImports();
    }

    // Render metadata as file too
    const metadataFilename = `.${baseFilename}.meta`;
    filesWithContent[metadataFilename] = JSON.stringify(metadata, null, 2);

    return filesWithContent;
  }
}

export default Templator;
