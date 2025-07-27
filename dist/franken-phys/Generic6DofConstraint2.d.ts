import FrankenPhys from "../types/FrankenPhys";
import { IPhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export declare enum RotationOrder {
    XYZ = 0,
    XZY = 1,
    YXZ = 2,
    YZX = 3,
    ZXY = 4,
    ZYX = 5
}
export interface IGeneric6DofConstraint2 {
    setLinearLowerLimit(val: glm.ReadonlyVec3): void;
    setLinearUpperLimit(val: glm.ReadonlyVec3): void;
    setAngularLowerLimit(val: glm.ReadonlyVec3): void;
    setAngularUpperLimit(val: glm.ReadonlyVec3): void;
}
export interface Generic6DofConstraint2Def {
    bodyA: IPhysicBody;
    bodyB: IPhysicBody;
    frameA: glm.ReadonlyVec3;
    frameB: glm.ReadonlyVec3;
    rotationOrder: RotationOrder;
}
export declare class ConcreteGeneric6DofConstraint2 implements IGeneric6DofConstraint2 {
    _rawConstraint: FrankenPhys.bjtsGeneric6DofSpring2Constraint;
    _bodyA: IPhysicBody;
    _bodyB: IPhysicBody;
    private _isAlive;
    constructor(def: Generic6DofConstraint2Def);
    dispose(): void;
    isAlive(): boolean;
    setLinearLowerLimit(val: glm.ReadonlyVec3): void;
    setLinearUpperLimit(val: glm.ReadonlyVec3): void;
    setAngularLowerLimit(val: glm.ReadonlyVec3): void;
    setAngularUpperLimit(val: glm.ReadonlyVec3): void;
}
