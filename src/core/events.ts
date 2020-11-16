import { Component } from "../engine/component";

export class Events {
  handlers: {};

  constructor(handlers: {}) {
      this.handlers = {
          warn: [console.warn],
          error: [console.error],
          componentRegister: [],
          destroy: [],
          ...handlers
      };
  }
}

export interface EventsTypes {
  warn: string | Error;
  error: string | Error;
  componentRegister: Component;
  destroy: void;
}
