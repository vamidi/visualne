export interface PluginParams {}

export interface IPlugin {
  name: string;
}

export class Plugin implements IPlugin {
  name: string = "";

  // As long as we pass in the context we are good to go for a system.
  constructor(_ctx: any) {}
}
