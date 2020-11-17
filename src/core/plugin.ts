export interface PluginParams {}

export interface IPlugin {
  name: string;
}

export class Plugin implements IPlugin {
  name: string = "";
  // context to listen for example to the node editor.
  protected ctx: any = null;

  // As long as we pass in the context we are good to go for a system.
  constructor(protected context: any) { this.ctx = context; }
}
