import FrankenPhys from "../types/FrankenPhys";
export type FrankenPhysInstance = typeof FrankenPhys;
interface IOptions {
    jsUrl: string;
    wasmUrl: string;
}
export declare class BrowserFrankenPhysWasmModule {
    private static _wasmModule;
    static load(opts: IOptions): Promise<void>;
    static loadJsPart(url: string): Promise<void>;
    static loadWasmPart(urlPrefix: string): Promise<void>;
    static get(): FrankenPhysInstance;
}
export {};
