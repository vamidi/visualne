export interface PluginParams {}

export interface IPlugin {
  name: string;
}

export class Plugin implements IPlugin {
  name: string = "";
  // context to listen for example to the node editor.
  // As long as we pass in the context we are good to go for a system.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(public context: any) {}
}
