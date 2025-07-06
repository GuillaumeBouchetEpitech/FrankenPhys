import FrankenPhys from "../types/FrankenPhys";
import { IPhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export interface IGeneric6DofConstraint {
    setLinearLowerLimit(val: glm.ReadonlyVec3): void;
    setLinearUpperLimit(val: glm.ReadonlyVec3): void;
    setAngularLowerLimit(val: glm.ReadonlyVec3): void;
    setAngularUpperLimit(val: glm.ReadonlyVec3): void;
}
export type Generic6DofConstraintDef = {
    bodyA: IPhysicBody;
    bodyB: IPhysicBody;
    frameA: glm.ReadonlyVec3;
    frameB: glm.ReadonlyVec3;
    useReferenceFrameA: boolean;
};
export declare class ConcreteGeneric6DofConstraint implements IGeneric6DofConstraint {
    _rawConstraint: FrankenPhys.btGeneric6DofSpringConstraint;
    _bodyA: IPhysicBody;
    _bodyB: IPhysicBody;
    constructor(def: Generic6DofConstraintDef);
    dispose(): void;
    setLinearLowerLimit(val: glm.ReadonlyVec3): void;
    setLinearUpperLimit(val: glm.ReadonlyVec3): void;
    setAngularLowerLimit(val: glm.ReadonlyVec3): void;
    setAngularUpperLimit(val: glm.ReadonlyVec3): void;
}
