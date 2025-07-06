import FrankenPhys from "../types/FrankenPhys";
export type BulletJsInstance = typeof FrankenPhys;
export declare class WasmModuleHolder {
    private static _wasmModule;
    static set(wasmModule: BulletJsInstance): Promise<void>;
    static get(): BulletJsInstance;
}
