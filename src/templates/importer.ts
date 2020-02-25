import { EOL } from "os";
import chalk from "chalk";
import logger from "../utils/log";

interface LibraryImport {
  [key: string]: string | Set<string>;
}

class Importer {
  private imports: LibraryImport;

  public constructor() {
    this.imports = {};
  }

  private isDefaultImport(imports: string | string[] | Set<string>): imports is string {
    return typeof imports === "string";
  }
  private isStarImport(imports: string): boolean {
    return imports.startsWith("import * as ");
  }
  private convertDefaultToNamed(imports: string): string {
    return `default as ${imports}`;
  }
  private mergeDefaultImports(...imports: string[]): string | Set<string> {
    const importsAsSet = new Set(imports);
    // If reduced to one item in a set, then they're all the same default import
    if (importsAsSet.size === 1) {
      return Array.from(importsAsSet)[0];
    }

    // Can't merge multiple, different star imports so throw error
    const starImports = imports.filter(this.isStarImport);
    if (starImports.length) {
      throw new Error(`Cannot merge multiple star default imports: ${starImports.join(", ")}`);
    }

    logger.warn(chalk.yellow(`Varying default imports for same library: ${imports.join(", ")}`));

    return new Set(imports.map(this.convertDefaultToNamed));
  }

  private setImports(imports: LibraryImport): void {
    this.imports = {
      ...this.imports,
      ...imports
    };
  }

  // Imports are assumed to be default imports if just a string. Arrays are assumed to be named imports
  public addImport(library: string, imports: string | string[]): void {
    const existingImport = this.imports[library];

    let updatedLibrary: string | Set<string> = this.isDefaultImport(imports) ? imports : new Set(imports);

    if (existingImport) {
      if (this.isDefaultImport(imports)) {
        // Merge defaults or append new default to named imports
        updatedLibrary = this.isDefaultImport(existingImport) ?
          this.mergeDefaultImports(existingImport, imports)
          : existingImport.add(this.convertDefaultToNamed(imports));
      } else {
        // Merge named imports with existing imports, converting existing default import if necessary
        updatedLibrary = new Set([
          ...imports,
          ...this.isDefaultImport(existingImport) ?
            [this.convertDefaultToNamed(existingImport)]
            : Array.from(existingImport)
        ]);
      }
    }

    this.setImports({ [library]: updatedLibrary });
  }

  private renderDefaultImport(library: string, imports: string): string {
    return `import ${imports} from "${library}";`;
  }
  private renderNamedImports(library: string, imports: Set<string>): string {
    return `import { ${Array.from(imports).join(", ")} } from "${library}";`;
  }

  public resetImports(): void {
    this.imports = {};
  }

  public renderImports(): string {
    const importList: string[] = Object.entries(this.imports).reduce((list, [library, imports]) => {
      if (this.isDefaultImport(imports)) {
        list.push(this.renderDefaultImport(library, imports));
      } else {
        list.push(this.renderNamedImports(library, imports));
      }
      return list;
    }, []);
    return importList.join(EOL);
  }
}

export default Importer;
