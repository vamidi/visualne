import { Component } from "../engine/index";
import { Connection } from "../connection";
import { EditorView } from "../view/index";
import { Emitter } from "./emitter";
import { Input } from "../input";
import { Output } from "../output";
import { Validator } from "./validator";
import { EventsTypes as DefaultEvents, Events } from "./events";
import { IPlugin, Plugin, PluginParams } from "./plugin";

/**
 * @brief - Context class
 * This class is the context between the editor and the plugins
 * This context class also keeps the components and the plugins
 */
export abstract class Context<EventsTypes> extends Emitter<EventsTypes & DefaultEvents> {
  id: string;
  plugins: Map<string, IPlugin>;
  components: Map<string, Component>;
  view: EditorView | null = null;

  protected constructor(id: string, events: Events) {
    super(events);

    if (!Validator.isValidId(id))
      throw new Error("ID should be to name@0.1.0 format");

    this.id = id;
    this.plugins = new Map();
    this.components = new Map();
  }

  public use<TSystem extends IPlugin = Plugin,
    KParams extends PluginParams = PluginParams>(
    Ctor: {
      new(ctx: Context<EventsTypes & DefaultEvents>, ...args: any[]): TSystem;
    },
    attributes?: KParams
  ): void {
    const plugin = new Ctor(this, attributes);

    if (plugin.name && this.plugins.has(plugin.name))
      throw new Error(`Plugin ${plugin.name} already in use`);

    this.plugins.set(plugin.name, plugin);
  }

  public register(component: Component): void {
    if (this.components.has(component.name))
      throw new Error(`Component ${component.name} already registered`);

    this.components.set(component.name, component);
    this.trigger("componentRegister", component);
  }

  public getComponent<T extends Component>(name: string): T {
    const component = this.components.get(name);

    if (!component) throw `Component ${name} not found`;

    return component as T;
  }

  public connect(_output: Output, _input: Input, _data: unknown): void { }

  public removeConnection(_connection: Connection): void { }

  public destroy(): void {
    this.trigger("destroy");
  }

  protected initEvents(): void { }
}
