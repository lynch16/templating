# Component Generator

A CLI for generating TS files.

## Generators
Generator classes are for interacting with the CLI commands. They are the interface between CLI commands and the templates being generated. Generators convert the CLI arguments or swagger spec to metadata for use by the templators.

## Templates
A template is broken into two parts:
* EJS template file
* Templator class

Templator classes manage the heavy lifting of interacting with EJS and formatting the provided EJS files. Templators will take in metadata and output rendered EJS templates. Any construction of partials should take place within the templator. During EJS rendering, an `imports` member is exposed, which is an instance of ImportGenerator. This instance of ImportGenerator should be used for defining imports rather than writing imports inline.

Example:
```
<% imports.addImport("oui-react", ["Form"]); %>

const <%= name %>: React.FC = () => {
  ...rest of component
}
```
