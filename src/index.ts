import { Component } from "./component";
import { Connection } from "./connection";
import { Context } from "./core/context";
import { Control } from "./control";
import { Emitter } from "./core/emitter";
import { IO } from "./io";
import { Input } from "./input";
import { Node } from "./node";
import { NodeEditor } from "./editor";
import { Output } from "./output";
import { Plugin } from "./core/plugin";
import { Socket } from "./socket";
import { Engine, Recursion } from "./engine";

export { Engine, Recursion } from "./engine";
export { Component } from "./component";
export { Control } from "./control";
export { Connection } from "./connection";
export { Context } from "./core/context";
export { Emitter } from "./core/emitter";
export { Input } from "./input";
export { IO } from "./io";
export { Node } from "./node";
export { NodeEditor } from "./editor";
export { Output } from "./output";
export { Plugin } from "./core/plugin";
export { Socket } from "./socket";

export { IPlugin, PluginParams } from "./core/plugin";
export { SocketColorType } from "./socket";

export default {
    Engine,
    Recursion,
    Component,
    Control,
    Connection,
    Context,
    Emitter,
    Input,
    IO,
    Node,
    NodeEditor,
    Output,
    Socket,
    Plugin
};
