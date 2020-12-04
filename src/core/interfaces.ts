import { Connection } from "../connection";
import { Input } from "../input";
import { Node } from "../node";
import { Output } from "../output";

export interface OnCreated {
  onCreated(node: Node): void;
}

export interface OnDestroyed {
  onDestroyed(node: Node): void;
}

export interface OnConnect {
  onConnect(io: Input | Output): boolean;
}

export interface OnConnected {
  onConnected(io: Connection): void;
}

export interface OnDisconnect {
  onDisconnect(io: Connection): boolean;
}

export interface OnDisconnected {
  onDisconnected(io: Connection): void;
}
