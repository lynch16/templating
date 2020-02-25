import Templator from "../templator";
import { Metadata } from "../metadator";

export interface FormParameters {
  name: string;
  fields: string[];
}

// This is a just a demo to show how the base templator could be used to create templators for specific templates
class FormTemplate extends Templator<FormParameters> {
  public templateDir: string = __dirname;

  public processMetadata(metadata: Metadata<FormParameters>): FormParameters {
    const { name, parameters: { fields } } = metadata;

    return {
      name,
      fields
    };
  }
}

export default FormTemplate;
