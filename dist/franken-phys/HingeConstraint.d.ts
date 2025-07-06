import FrankenPhys from "../types/FrankenPhys";
import { IPhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export interface IHingeConstraint {
    setLimit(low: number, high: number, softness: number, biasFactor: number, relaxationFactor?: number): void;
    enableAngularMotor(enableMotor: boolean, targetVelocity: number, maxMotorImpulse: number): void;
    enableMotor(enableMotor: boolean): void;
    setMaxMotorImpulse(maxMotorImpulse: number): void;
    setMotorTarget(targetAngle: number, dt: number): void;
}
export type HingeConstraintDef = {
    bodyA: IPhysicBody;
    bodyB: IPhysicBody;
    pivotInA: glm.ReadonlyVec3;
    pivotInB: glm.ReadonlyVec3;
    axisInA: glm.ReadonlyVec3;
    axisInB: glm.ReadonlyVec3;
    useReferenceFrameA: boolean;
};
export declare class ConcreteHingeConstraint implements IHingeConstraint {
    _rawConstraint: FrankenPhys.btHingeConstraint;
    _bodyA: IPhysicBody;
    _bodyB: IPhysicBody;
    constructor(def: HingeConstraintDef);
    dispose(): void;
    setLimit(low: number, high: number, softness: number, biasFactor: number, relaxationFactor?: number): void;
    enableAngularMotor(enableMotor: boolean, targetVelocity: number, maxMotorImpulse: number): void;
    enableMotor(enableMotor: boolean): void;
    setMaxMotorImpulse(maxMotorImpulse: number): void;
    setMotorTarget(targetAngle: number, dt: number): void;
}
