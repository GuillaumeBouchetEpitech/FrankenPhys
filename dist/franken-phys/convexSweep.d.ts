import FrankenPhys from "../types/FrankenPhys";
import * as glm from "gl-matrix";
export interface IConvexSweepDef {
    from: glm.ReadonlyVec3;
    to: glm.ReadonlyVec3;
    collisionFilterGroup: number;
    collisionFilterMask: number;
    radius: number;
}
export declare const convexSweep: (rawDynamicsWorld: FrankenPhys.btjsDynamicsWorld, def: IConvexSweepDef) => {
    fraction: number;
    impact: glm.vec3;
    normal: glm.vec3;
} | undefined;
