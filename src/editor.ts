import { Component } from "./component";
import { Connection } from "./connection";
import { Context } from "./core/context";
import { Data } from "./core/data";
import { EditorView } from "./view/index";
import { Input } from "./input";
import { Node } from "./node";
import { Output } from "./output";
import { Selected } from "./selected";
import { Validator } from "./core/validator";
import { EditorEvents, EventsTypes } from "./events";
import { OnConnect, OnConnected, OnCreated, OnDestroyed, OnDisconnect, OnDisconnected } from "./core/interfaces";
import { hook, listenWindow } from "./view/utils";

export class NodeEditor extends Context<EventsTypes> {
  nodes: Node[] = new Array<Node>();
  selected = new Selected();
  view: EditorView;
  args: { lifecycleHooks?: boolean };

  constructor(id: string, container: HTMLElement, params: { lifecycleHooks?: boolean } = { lifecycleHooks: true }) {
    super(id, new EditorEvents());

    this.view = new EditorView(container, this.components, this);
    this.args = params;

    this.initEvents();
  }

  public addNode(node: Node): void {
    if (!this.trigger("nodecreate", node)) return;

    this.nodes.push(node);
    this.view.addNode(node);

    this.trigger("nodecreated", node);
  }

  public removeNode(node: Node): void {
    if (!this.trigger("noderemove", node)) return;

    node.getConnections().forEach((c) => this.removeConnection(c));

    this.nodes.splice(this.nodes.indexOf(node), 1);
    this.view.removeNode(node);

    this.trigger("noderemoved", node);
  }

  public connect(output: Output, input: Input, data: unknown = {}): void {
    if (!this.trigger("connectioncreate", { output, input })) return;

    try {
      const connection = output.connectTo(input);

      connection.data = data;
      this.view.addConnection(connection);

      this.trigger("connectioncreated", connection);
    } catch (e) {
      this.trigger("warn", e);
    }
  }

  public removeConnection(connection: Connection): void {
    if (!this.trigger("connectionremove", connection)) return;

    this.view.removeConnection(connection);
    connection.remove();

    this.trigger("connectionremoved", connection);
  }

  public selectNode(node: Node, accumulate: boolean = false): void {
    if (this.nodes.indexOf(node) === -1) throw new Error("Node not exist in list");

    if (!this.trigger("nodeselect", node)) return;

    this.selected.add(node, accumulate);

    this.trigger("nodeselected", node);
  }

  public register(component: Component): void {
    super.register(component);
    component.editor = this;
  }

  public clear(): void {
    this.nodes.forEach((node) => this.removeNode(node));
    this.trigger("clear");
  }

  public beforeImport(json: Data): boolean {
    const checking = Validator.validate(this.id, json);

    if (!checking.success) {
      this.trigger("warn", checking.msg);
      return false;
    }

    this.silent = true;
    this.clear();
    this.trigger("import", json);
    return true;
  }

  public afterImport(): boolean {
    this.silent = false;
    return true;
  }

  public toJSON(): Data {
    const data: Data = { id: this.id, nodes: {} };

    this.nodes.forEach((node) => (data.nodes[node.id] = node.toJSON()));
    this.trigger("export", data);
    return data;
  }

  async fromJSON(json: Data): Promise<boolean | void> {
    if (!this.beforeImport(json)) return false;
    const nodes: { [key: string]: Node } = {};

    try {
      await Promise.all(
        Object.keys(json.nodes).map(async (id) => {
          const node = json.nodes[id];
          const component = this.getComponent<Component>(node.name);

          nodes[id] = await component.build(Node.fromJSON(node));
          this.addNode(nodes[id]);
        })
      );

      Object.keys(json.nodes).forEach((id) => {
        const jsonNode = json.nodes[id];
        const node = nodes[id];

        Object.keys(jsonNode.outputs).forEach((key) => {
          const outputJson = jsonNode.outputs[key];

          outputJson.connections.forEach((jsonConnection) => {
            const nodeId = jsonConnection.node;
            const data = jsonConnection.data;
            const targetOutput = node.outputs.get(key);
            const targetInput = nodes[nodeId].inputs.get(jsonConnection.input);

            if (!targetOutput || !targetInput) {
              return this.trigger("error", `IO not found for node ${node.id}`);
            }

            this.connect(targetOutput, targetInput, data);
          });
        });
      });
    } catch (e) {
      this.trigger("warn", e);
      return !this.afterImport();
    }

    return this.afterImport();
  }

  protected initEvents(): void {
    this.on(
      "destroy",
      listenWindow("keydown", (e) => this.trigger("keydown", e))
    );
    this.on(
      "destroy",
      listenWindow("keyup", (e) => this.trigger("keyup", e))
    );

    this.on("selectnode", ({ node, accumulate }) =>
      this.selectNode(node, accumulate)
    );

    this.on("nodeselected", () =>
      this.selected.each((n) => {
        const nodeView = this.view.nodes.get(n);

        nodeView && nodeView.onStart();
      })
    );

    this.on("translatenode", ({ dx, dy }) =>
      this.selected.each((n) => {
        const nodeView = this.view.nodes.get(n);

        nodeView && nodeView.onDrag(dx, dy);
      })
    );

    // If we want to have lifecycle hooks
    if (this.args.lifecycleHooks) {
      this.on("nodecreated", node =>
        hook<OnCreated>(this, node.name, "onCreated")(node),
      );

      this.on("noderemoved", node =>
        hook<OnDestroyed>(this, node.name, "onDestroyed")(node)
      );

      this.on("connectioncreate", ({ input, output }) => {
        if (!hook<OnConnect>(this, input.node?.name, "onConnected")(input) ||
          !hook<OnConnect>(this, output.node?.name, "onConnected")(output))
          return false;
      });

      this.on("connectioncreated", connection => {
        hook<OnConnected>(this, connection.input.node?.name, "onConnected")(connection);
        hook<OnConnected>(this, connection.output.node?.name, "onConnected")(connection);
      });

      this.on("connectionremove", connection => {
        if (!hook<OnDisconnect>(this, connection.input.node?.name, "onDisconnect")(connection) ||
          !hook<OnDisconnect>(this, connection.output.node?.name, "onDisconnect")(connection))
          return false;
      });

      this.on("connectionremoved", connection => {
        hook<OnDisconnected>(this, connection.input.node?.name, "onDisconnected")(connection);
        hook<OnDisconnected>(this, connection.output.node?.name, "onDisconnected")(connection);
      });
    }
  }
}
