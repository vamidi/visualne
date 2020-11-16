import { Node } from "./node";

export class Selected {
  list: Set<Node> = new Set<Node>();

  add(item: Node, accumulate = false) {
      if (!accumulate) this.list = new Set([item]);
      else if (!this.contains(item)) this.list.add(item);
  }

  clear() {
      this.list = new Set<Node>();
  }

  remove(item: Node) {
      this.list.delete(item);
  }

  contains(item: Node) {
      return this.list.has(item);
  }

  each(callback: (n: Node, key: Node) => void) {
      this.list.forEach(callback);
  }
}
