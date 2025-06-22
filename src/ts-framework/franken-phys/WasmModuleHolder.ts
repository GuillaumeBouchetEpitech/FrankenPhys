
import FrankenPhys from "../types/FrankenPhys";

export type BulletJsInstance = typeof FrankenPhys;

export class WasmModuleHolder {

  private static _wasmModule: BulletJsInstance | undefined;

  static async set(wasmModule: BulletJsInstance) {
    WasmModuleHolder._wasmModule = wasmModule;
  }

  static get(): BulletJsInstance {
    if (!this._wasmModule) {
      throw new Error("FrankenPhys wasm module not loaded");
    }
    return this._wasmModule;
  }
};

