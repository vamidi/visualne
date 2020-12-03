import { Component as ComponentWorker } from "./engine/component";
import { Node } from "./node";
import { NodeEditor } from "./editor";

export abstract class Component extends ComponentWorker {
  editor: NodeEditor | null = null;
  data: unknown = {};

  protected constructor(name: string) {
    super(name);
  }

  abstract async builder(node: Node): Promise<void>;

  public async build(node: Node): Promise<Node> {
    await this.builder(node);

    return node;
  }

  public async createNode(data = {}): Promise<Node> {
    const node = new Node(this.name);

    node.data = data;
    await this.build(node);

    return node;
  }
}
