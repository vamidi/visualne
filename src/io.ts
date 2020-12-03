import { Connection } from "./connection";
import { Node } from "./node";
import { Socket } from "./socket";

export class IO {
  node: Node | null = null;
  multipleConnections: boolean;
  connections: Connection[] = new Array<Connection>();

  key: string;
  name: string;
  socket: Socket;

  constructor(key: string, name: string, socket: Socket, multiConns: boolean) {
      this.node = null;
      this.multipleConnections = multiConns;
      this.connections = new Array<Connection>();

      this.key = key;
      this.name = name;
      this.socket = socket;
  }

  public hasConnection(): boolean {
      return this.connections.length > 0;
  }

  public removeConnection(connection: Connection): void {
      this.connections.splice(this.connections.indexOf(connection), 1);
  }

  public removeConnections(): void {
      this.connections.forEach((connection) => this.removeConnection(connection));
  }
}
