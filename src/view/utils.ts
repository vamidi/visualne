import { NodeEditor } from "../editor";

export function listenWindow<K extends keyof WindowEventMap>(
    event: K,
    handler: (e: WindowEventMap[K]) => void
): () => unknown {
    window.addEventListener(event, handler);

    return () => {
        window.removeEventListener<K>(event, handler);
    };
}

export function hook<T extends unknown>(
    editor: NodeEditor, name: undefined | string, method: keyof T
): T[keyof T] | Function
{
    if (!name) return () => null;

    const component = editor.getComponent(name);

    if (method in component) {
        const c = component as T;

        return c[method];
    }

    return () => null;
}
