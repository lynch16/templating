import * as yargs from "yargs";
import BaseGenerator from "./baseGenerator";
import FormTemplate, { FormParameters } from "../templates/form/formTemplate";
import Templator from "../templates/templator";

interface FormArgs {
  fields: string[];
}

const groupName = "Form Generator";

// This is a just a demo to show how the base generator could be used to create generators for specific templates
class FormGenerator extends BaseGenerator<FormArgs, FormParameters> {
  public static generatorOptions: { [K in keyof FormArgs]: yargs.Options } = {
    fields: {
      description: "The fields to generate for the form",
      array: true,
      group: groupName
    }
  };

  public defaultFolder: string = "components";
  public templator: Templator<FormParameters> = new FormTemplate();

  public buildMetadata(args: yargs.Arguments<FormArgs>): void {
    if (!args.fields) {
      throw new Error(`Property fields missing in ${this.constructor.name} for generating ${this.getComponentName()}`);
    }
    this.metadata.updateParam("fields", args.fields);
  }
}

export default FormGenerator;
