/// <reference types="node" />
export declare class Pdf {
    id: string;
    filePath: string;
    content: Buffer;
    tags: string[];
    name: string;
    constructor(id: string, filePath: string, content: Buffer, tags: string[], name: string);
}
