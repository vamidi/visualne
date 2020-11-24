import { Control } from "./control";
import { IO } from "./io";

export type BindSocket = (el: HTMLElement, type: string, io: IO) => void;
export type BindControl = (el: HTMLElement, control: Control) => void;

export class Socket
{
    public name: string;
    public data: unknown;
    public compatible: Socket[] = [];

    public get Color(): string { return this.color; }
    public set Color(c: string) { this.color = c; }

    private color: string;

    constructor(name: string, color: string = "#fff", data = {}) {
        this.name = name;
        this.color = color;
        this.data = data;
        this.compatible = [];
    }

    combineWith(socket: Socket): void {
        this.compatible.push(socket);
    }

    compatibleWith(socket: Socket): boolean {
        return this === socket || this.compatible.includes(socket);
    }
}
