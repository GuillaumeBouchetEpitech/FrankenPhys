import { PhysicBodyDef, IPhysicBody } from "./PhysicBody";
import { IPhysicVehicle, PhysicVehicleDef } from "./PhysicVehicle";
import { HingeConstraintDef, IHingeConstraint } from "./HingeConstraint";
import { Generic6DofConstraint2Def, IGeneric6DofConstraint2 } from "./Generic6DofConstraint2";
import { ContactEventHandler, ContactDataWorld } from "./ContactEventHandler";
import * as glm from "gl-matrix";
export declare class PhysicWorld extends ContactEventHandler<ContactDataWorld> {
    private _collisionConf;
    private _dispatcher;
    private _broadPhase;
    private _solver;
    private _rawDynamicsWorld;
    private _bodyMap;
    private _vehicleMap;
    private _constraintMap2;
    private _allConstraints2;
    private _constraintMap3;
    private _allConstraints3;
    constructor();
    dispose(): void;
    createRigidBody(def: PhysicBodyDef): IPhysicBody;
    private _getShape;
    destroyRigidBody(rigidBody: IPhysicBody): void;
    createVehicle(def: PhysicVehicleDef): IPhysicVehicle;
    destroyVehicle(vehicle: IPhysicVehicle): void;
    createHingeConstraint(def: HingeConstraintDef): IHingeConstraint;
    destroyHingeConstraint(constraint: IHingeConstraint): void;
    createGeneric6DofConstraint2(def: Generic6DofConstraint2Def): IGeneric6DofConstraint2;
    destroyGeneric6DofConstraint2(constraint: IGeneric6DofConstraint2): void;
    rayCast(from: glm.ReadonlyVec3, to: glm.ReadonlyVec3): {
        object: IPhysicBody;
        fraction: number;
        impact: glm.vec3;
        normal: glm.vec3;
    } | undefined;
    convexSweep(from: glm.ReadonlyVec3, to: glm.ReadonlyVec3, radius: number): {
        fraction: number;
        impact: glm.vec3;
        normal: glm.vec3;
    } | undefined;
    private _initCollisionEvents;
    stepSimulation(deltaTimeSec: number, maxSubSteps?: number, fixedStep?: number): void;
    setGravity(x: number, y: number, z: number): void;
    setDebugWireframeCallback(callback: (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, r: number, g: number, b: number) => void): void;
    setDebugWireframeFeaturesFlag(flag: number): void;
    debugDrawWorld(): void;
}
