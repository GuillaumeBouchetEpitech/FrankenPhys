
import FrankenPhys from "../types/FrankenPhys";

import { scriptLoadingUtility } from "./scriptLoadingUtility";

export type FrankenPhysInstance = typeof FrankenPhys;

interface IOptions {
  jsUrl: string,
  wasmUrl: string
}

export class BrowserFrankenPhysWasmModule {

  private static _wasmModule: FrankenPhysInstance | undefined;

  static async load(opts: IOptions) {
    await BrowserFrankenPhysWasmModule.loadJsPart(opts.jsUrl);
    await BrowserFrankenPhysWasmModule.loadWasmPart(opts.wasmUrl);
  }

  static async loadJsPart(url: string) {
    await scriptLoadingUtility(url);
  }

  static async loadWasmPart(urlPrefix: string) {
    // @ts-ignore
    BrowserFrankenPhysWasmModule._wasmModule = await FrankenPhysLoader({
      locateFile: (url: string) => {
        return `${urlPrefix}/${url}`;
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
