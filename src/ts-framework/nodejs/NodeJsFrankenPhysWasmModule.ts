
/// @ts-ignore
import FrankenPhysLoader from "../../../build/FrankenPhys.0.0.1.js";

import FrankenPhys from "../types/FrankenPhys";

import * as path from "path";

export type FrankenPhysInstance = typeof FrankenPhys;

export class NodeJsFrankenPhysWasmModule {

  private static _wasmModule: FrankenPhysInstance | undefined;

  static async loadWasmPart(urlPrefix: string) {
    NodeJsFrankenPhysWasmModule._wasmModule = await FrankenPhysLoader({
      locateFile: (url: string) => {
        return path.join(urlPrefix, url);
      },
      // TOTAL_MEMORY: 1 * 1024
    });
  }

  static get(): FrankenPhysInstance {
    if (!this._wasmModule) {
      throw new Error("FrankenPhys wasm module not loaded");
    }
    return this._wasmModule;
  }

};
