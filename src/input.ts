import { Connection } from "./connection";
import { Control } from "./control";
import { IO } from "./io";
import { InputData } from "./core/data";
import { Socket } from "./socket";

export class Input extends IO {
  control: Control | null = null;

  constructor(
      key: string,
      title: string,
      socket: Socket,
      multiConns: boolean = false
  ) {
      super(key, title, socket, multiConns);
  }

  addConnection(connection: Connection): void {
      if (!this.multipleConnections && this.hasConnection())
          throw new Error("Multiple connections not allowed");
      this.connections.push(connection);
  }

  addControl(control: Control): void {
      this.control = control;
      control.parent = this;
  }

  showControl(): boolean {
      return !this.hasConnection() && this.control !== null;
  }

  toJSON(): InputData {
      return {
          connections: [...this.connections].map((c) => {
              if (!c.output.node) throw new Error("Node not added to Output");

              return {
                  node: c.output.node.id,
                  output: c.output.key,
                  data: c.data
              };
          })
      };
  }
}
