import { IO } from './io';
import { Control } from './control';

export type SocketType = 'input' | 'output';
export declare type SocketColorType = 'normal' | 'exec';
export type BindSocket = (el: HTMLElement, type: SocketType, io: IO) => void;
export type BindControl = (el: HTMLElement, control: Control) => void;

export class Socket {
    name: string;
    data: unknown;
    socketType: SocketColorType;
    compatible: Socket[] = [];

    constructor(name: string, data: {
        name?: string;
        data?: {};
        socketType?: SocketColorType;
    } = {}) {
        this.name = name;
        this.data = data;
        this.socketType = data.socketType ?? 'normal';
        this.compatible = [];
    }

    combineWith(socket: Socket): void {
        this.compatible.push(socket);
    }

    compatibleWith(socket: Socket): boolean {
        return this === socket || this.compatible.includes(socket);
    }
}
