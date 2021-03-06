import { Component } from "./component";
import { Context } from "../core/context";
import { Recursion } from "./recursion";
import { State } from "./state";
import { Validator } from "../core/validator";
import { Data, NodeData, WorkerInputs, WorkerOutputs } from "../core/data";
import { EngineEvents, EventsTypes } from "./events";

export { Component, Recursion };

interface EngineNode extends NodeData {
  busy: boolean;
  unlockPool: (() => void)[];
  outputData: WorkerOutputs;
}

export class Engine extends Context<EventsTypes> {
  args: unknown[] = [];
  data: Data | null = null;
  state = State.AVAILABLE;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  onAbort = () => {
  };

  // eslint-enable-next-line @typescript-eslint/explicit-module-boundary-types

  constructor(id: string) {
    super(id, new EngineEvents());
  }

  public clone(): Engine {
    const engine = new Engine(this.id);

    this.components.forEach((c) => engine.register(c));

    return engine;
  }

  async throwError(message: string, data: unknown = null): Promise<string> {
    await this.abort();
    this.trigger("error", { message, data });
    this.processDone();

    return "error";
  }

  private processStart(): boolean {
    if (this.state === State.AVAILABLE) {
      this.state = State.PROCESSED;
      return true;
    }

    if (this.state === State.ABORT) {
      return false;
    }

    console.warn(`The process is busy and has not been restarted.
                Use abort() to force it to complete`);
    return false;
  }

  private processDone(): boolean {
    const success = this.state !== State.ABORT;

    this.state = State.AVAILABLE;

    if (!success) {
      this.onAbort();
      this.onAbort = () => {
      };
    }

    return success;
  }

  public async abort(): Promise<unknown> {
    return new Promise((ret) => {
      if (this.state === State.PROCESSED) {
        this.state = State.ABORT;
        this.onAbort = ret;
      } else if (this.state === State.ABORT) {
        this.onAbort();
        this.onAbort = ret;
      } else ret();
    });
  }

  private async lock(node: EngineNode): Promise<unknown> {
    return new Promise((res) => {
      node.unlockPool = node.unlockPool || [];
      if (node.busy && !node.outputData) node.unlockPool.push(res);
      else res();

      node.busy = true;
    });
  }

  unlock(node: EngineNode): void {
    node.unlockPool.forEach((a) => a());
    node.unlockPool = [];
    node.busy = false;
  }

  private async extractInputData(node: NodeData): Promise<{ [key: string]: unknown[] }> {
    const obj: { [id: string]: unknown[] } = {};

    for (const key of Object.keys(node.inputs)) {
      const input = node.inputs[key];

      obj[key] = await Promise.all(
        input.connections.map(async (c) => {
          const prevNode = (this.data as Data).nodes[c.node];

          const outputs = await this.processNode(prevNode as EngineNode);

          if (!outputs) await this.abort();
          else return outputs[c.output];
        })
      );
    }

    return obj;
  }

  private async processWorker(node: NodeData) {
    const inputData: WorkerInputs = await this.extractInputData(node);
    const component = this.components.get(node.name) as Component;
    const outputData: WorkerOutputs = {};

    try {
      await component.worker(node, inputData, outputData, ...this.args);
    } catch (e) {
      await this.abort();
      this.trigger("warn", e);
    }

    return outputData;
  }

  private async processNode(node: EngineNode) {
    if (this.state === State.ABORT || !node) return null;

    await this.lock(node);

    if (!node.outputData) {
      node.outputData = await this.processWorker(node);
    }

    this.unlock(node);
    return node.outputData;
  }

  private async forwardProcess(node: NodeData) {
    if (this.state === State.ABORT) return null;

    return await Promise.all(
      Object.keys(node.outputs).map(async (key) => {
        const output = node.outputs[key];

        return await Promise.all(
          output.connections.map(async (c) => {
            const nextNode = (this.data as Data).nodes[c.node];

            await this.processNode(nextNode as EngineNode);
            await this.forwardProcess(nextNode);
          })
        );
      })
    );
  }

  copy(data: Data): Data {
    data = Object.assign({}, data);
    data.nodes = Object.assign({}, data.nodes);

    Object.keys(data.nodes).forEach((key) => {
      data.nodes[key] = Object.assign({}, data.nodes[key]);
    });
    return data;
  }

  async validate(data: Data): Promise<boolean | string> {
    const checking = Validator.validate(this.id, data);
    const recursion = new Recursion(data.nodes);

    if (!checking.success) return await this.throwError(checking.msg);

    const recurrentNode = recursion.detect();

    if (recurrentNode)
      return await this.throwError("Recursion detected", recurrentNode);

    return true;
  }

  private async processStartNode(id: string | number | null) {
    if (!id) return;

    const startNode = (this.data as Data).nodes[id];

    if (!startNode) return await this.throwError("Node with such id not found");

    await this.processNode(startNode as EngineNode);
    await this.forwardProcess(startNode);
  }

  private async processUnreachable() {
    const data = this.data as Data;

    for (const i in data.nodes) {
      // process nodes that have not been reached
      const node = data.nodes[i] as EngineNode;

      if (typeof node.outputData === "undefined") {
        await this.processNode(node);
        await this.forwardProcess(node);
      }
    }
  }

  async process<T extends unknown[]>(
    data: Data,
    startId: number | string | null = null,
    ...args: T
  ): Promise<void | boolean | string> {
    if (!this.processStart()) return;
    if (!(await this.validate(data))) return;

    this.data = this.copy(data);
    this.args = args;

    await this.processStartNode(startId);
    await this.processUnreachable();

    return this.processDone() ? "success" : "aborted";
  }
}
