import { Connection } from "./connection";
import { Node } from "./node";
import { Socket } from "./socket";

export class IO {
  node: Node | null = null;
  multipleConnections: boolean;
  connections: Set<Connection> = new Set<Connection>();

  key: string;
  name: string;
  socket: Socket;

  constructor(key: string, name: string, socket: Socket, multiConns: boolean) {
      this.node = null;
      this.multipleConnections = multiConns;
      this.connections = new Set<Connection>();

      this.key = key;
      this.name = name;
      this.socket = socket;
  }

  removeConnection(connection: Connection) {
      this.connections.delete(connection);
      // this.connections.splice(this.connections.indexOf(connection), 1);
  }

  removeConnections() {
      this.connections.forEach((connection) => this.removeConnection(connection));
  }
}
