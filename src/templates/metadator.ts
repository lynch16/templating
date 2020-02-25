import * as path from "path";

export interface Metadata<Params extends { [key: string]: any }> {
  name: string; // Unique name for component
  version: string; // Version of the generator library used to generate this metadata
  component: string; // Name of component generator to execute
  apiClient?: {
    // Details for Smart components
    method: string;
    serviceName: string;
  };
  // Props to inject into the component
  props?: {
    [key: string]: Prop;
  };
  // Specifics needed to generate the Component generator
  parameters?: Params;
}

export interface Prop {
  type: string;
  required?: boolean;
}

class Metadator<Params> {
  private metadata: Metadata<Params>;

  public constructor(name: string, component: string) {
    this.metadata = {
      name,
      component,
      version: JSON.stringify(require(path.join(__dirname, "../../", "package.json")).version).replace(/\"/g, "")
    };
  }

  public read(): Metadata<Params> {
    return this.metadata;
  }

  // Helpers for constructing a metadata object
  // Useful in implementations of buildMetadata
  public updateProp(key: string, prop: Prop): void {
    this.updateMetadata({ props: { [key]: prop } });
  }

  public updateParam<T extends keyof Params>(key: T, param: Params[T]): void {
    // TODO: this causes a type error
    this.updateMetadata({ parameters: ({ [key]: param } as any) as Params });
  }
  public updateApiClient(method: string, serviceName: string): void {
    this.updateMetadata({ apiClient: { method, serviceName } });
  }

  private updateMetadata(metadataUpdate: Partial<Metadata<Params>>): void {
    this.metadata = Object.assign(this.metadata, metadataUpdate);
  }
}

export default Metadator;
