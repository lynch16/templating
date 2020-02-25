import FormGenerator from "./form";

export type PossibleGenerators = FormGenerator;
type PossibleGeneratorClasses = typeof FormGenerator;

export const generatorOptions: { [key: string]: PossibleGeneratorClasses } = {
  form: FormGenerator
};

export function camelCaseGeneratorKey(key: string): string {
  return key.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  });
}

export function fetchGeneratorByKey(key: string): PossibleGeneratorClasses {
  const asCamelCase = camelCaseGeneratorKey(key);
  if (!generatorOptions.hasOwnProperty(asCamelCase)) {
    return undefined;
  }

  return generatorOptions[asCamelCase];
}
