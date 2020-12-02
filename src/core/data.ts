export interface ConnectionData {
    node: number;
    data: unknown;
}

export type InputConnectionData = ConnectionData & {
    output: string;
};
export type OutputConnectionData = ConnectionData & {
    input: string;
};

export interface InputData {
    connections: InputConnectionData[];
}
export interface OutputData {
    connections: OutputConnectionData[];
}

export interface InputsData {
    [key: string]: InputData;
}
export interface OutputsData {
    [key: string]: OutputData;
}

export interface NodeData {
    id: number;
    name: string;
    inputs: InputsData;
    outputs: OutputsData;
    data: { [key: string]: unknown };
    position: [number, number];
}

export interface NodesData {
    [id: string]: NodeData;
}

export interface Data {
    id: string;
    nodes: NodesData;
}

export interface WorkerInputs {
    [key: string]: unknown[];
}

export interface WorkerOutputs {
    [key: string]: unknown;
}

export class HashSet<T> extends Set<T>
{
    /**
     *
     * @param values
     */
    constructor(values?: T[])
    {
        super(values);
    }

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (v: T, thisArgs?: any) => boolean, thisArg?: any): T | undefined
    {
        const arr = Array.from(this.values());

        for (let i = 0; i < arr.length; i++) {
            if (predicate(arr[i], thisArg))
            {
                return arr[i];
            }
        }
    }
}
