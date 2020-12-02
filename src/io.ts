import { Connection } from "./connection";
import { HashSet } from "./core/data";
import { Node } from "./node";
import { Socket } from "./socket";

export class IO {
  node: Node | null = null;
  multipleConnections: boolean;
  connections: HashSet<Connection> = new HashSet<Connection>();

  key: string;
  name: string;
  socket: Socket;

  constructor(key: string, name: string, socket: Socket, multiConns: boolean) {
      this.node = null;
      this.multipleConnections = multiConns;
      this.connections = new HashSet<Connection>();

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
