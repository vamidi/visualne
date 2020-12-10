import { Node } from "./node";

export class Selected {
  list: Node[] = [];

  add(item: Node, accumulate = false): void {
    if (!accumulate)
      this.list = [item];
    else if (!this.contains(item))
      this.list.push(item);
  }

  clear(): void {
    this.list = [];
  }

  remove(item: Node): void {
    this.list.splice(this.list.indexOf(item), 1);
  }

  contains(item: Node): boolean {
    return this.list.indexOf(item) !== -1;
  }

  each(callback: (n: Node, index: number) => void): void {
    this.list.forEach(callback);
  }
}
