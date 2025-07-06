import FrankenPhys from "../types/FrankenPhys";
import { IPhysicBody, ConcretePhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export interface IRayCastDef {
    from: glm.ReadonlyVec3;
    to: glm.ReadonlyVec3;
    collisionFilterGroup: number;
    collisionFilterMask: number;
}
export declare const rayCast: (rawDynamicsWorld: FrankenPhys.btjsDynamicsWorld, bodyMap: Map<number, ConcretePhysicBody>, def: IRayCastDef) => {
    object: IPhysicBody;
    fraction: number;
    impact: glm.vec3;
    normal: glm.vec3;
} | undefined;
