import FrankenPhys from "../types/FrankenPhys";
import { ContactDataBody, ContactEventHandler, IContactEventHandler } from "./ContactEventHandler";
import * as glm from "gl-matrix";
export type PrimitivesPhysicBoxShapeDef = {
    type: 'box';
    size: glm.ReadonlyVec3;
};
export type PrimitivesPhysicSphereShapeDef = {
    type: 'sphere';
    radius: number;
};
export type PrimitivesPhysicCylinderShapeDef = {
    type: 'cylinder';
    length: number;
    radius: number;
};
export type PrimitivesPhysicCapsuleShapeDef = {
    type: 'capsule';
    length: number;
    radius: number;
};
export type PrimitivesPhysicMeshShapeDef = {
    type: 'mesh';
    triangles: [glm.ReadonlyVec3, glm.ReadonlyVec3, glm.ReadonlyVec3][];
};
export type PrimitivesPhysicShapeDef = PrimitivesPhysicBoxShapeDef | PrimitivesPhysicSphereShapeDef | PrimitivesPhysicCylinderShapeDef | PrimitivesPhysicCapsuleShapeDef | PrimitivesPhysicMeshShapeDef;
export type PrimitivesPhysicCompoundShapeDef = {
    type: 'compound';
    shapes: {
        position: glm.vec3;
        orientation: glm.quat;
        shape: PrimitivesPhysicShapeDef;
    }[];
};
export type PhysicShapeDef = PrimitivesPhysicShapeDef | PrimitivesPhysicCompoundShapeDef;
export interface PhysicBodyDef {
    shape: PhysicShapeDef;
    mass: number;
    position: glm.ReadonlyVec3;
    orientation: glm.ReadonlyVec4;
    collisionFilterGroup?: number;
    collisionFilterMask?: number;
}
export interface IPhysicBody extends IContactEventHandler<ContactDataBody> {
    isAlive(): boolean;
    setPositionAndRotation(position: glm.ReadonlyVec3, rotation: glm.ReadonlyVec4): void;
    setPosition(x: number, y: number, z: number): void;
    setRotation(x: number, y: number, z: number, w: number): void;
    getPositionAndRotation(position: glm.vec3, rotation: glm.vec4): void;
    getPosition(): glm.vec3;
    getRotation(): glm.vec4;
    getLinearVelocity(): glm.vec3;
    getAngularVelocity(): glm.vec3;
    setLinearVelocity(x: number, y: number, z: number): void;
    setAngularVelocity(x: number, y: number, z: number): void;
    setLinearFactor(x: number, y: number, z: number): void;
    setAngularFactor(x: number, y: number, z: number): void;
    applyCentralForce(x: number, y: number, z: number): void;
    applyCentralImpulse(x: number, y: number, z: number): void;
    setDamping(linear: number, angular?: number): void;
    setCcdMotionThreshold(ccdMotionThreshold: number): void;
    setCcdSweptSphereRadius(radius: number): void;
    setRestitution(restitution: number): void;
    setFriction(friction: number): void;
    setRollingFriction(friction: number): void;
    setGravity(x: number, y: number, z: number): void;
    isStaticObject(): boolean;
    isKinematicObject(): boolean;
    isStaticOrKinematicObject(): boolean;
    isActive(): boolean;
    enableDeactivation(): void;
    disableDeactivation(): void;
    cannotDeactivate(): boolean;
    canDeactivate(): boolean;
}
export declare class ConcretePhysicBody extends ContactEventHandler<ContactDataBody> implements IPhysicBody {
    _customShape: {
        shape: FrankenPhys.btCollisionShape;
        cleanup: () => void;
    };
    _rawRigidBody: FrankenPhys.btRigidBody;
    private _isAlive;
    constructor(def: PhysicBodyDef, rawShape: {
        shape: FrankenPhys.btCollisionShape;
        cleanup: () => void;
    });
    dispose(): void;
    isAlive(): boolean;
    setPositionAndRotation(position: glm.ReadonlyVec3, rotation: glm.ReadonlyVec4): void;
    setPosition(x: number, y: number, z: number): void;
    setRotation(x: number, y: number, z: number, w: number): void;
    getPositionAndRotation(position: glm.vec3, rotation: glm.vec4): void;
    getPosition(): glm.vec3;
    getRotation(): glm.vec4;
    getLinearVelocity(): glm.vec3;
    getAngularVelocity(): glm.vec3;
    setLinearVelocity(x: number, y: number, z: number): void;
    setAngularVelocity(x: number, y: number, z: number): void;
    setLinearFactor(x: number, y: number, z: number): void;
    setAngularFactor(x: number, y: number, z: number): void;
    applyCentralForce(x: number, y: number, z: number): void;
    applyCentralImpulse(x: number, y: number, z: number): void;
    setDamping(linear: number, angular?: number): void;
    setCcdMotionThreshold(ccdMotionThreshold: number): void;
    setCcdSweptSphereRadius(radius: number): void;
    setRestitution(restitution: number): void;
    setFriction(friction: number): void;
    setRollingFriction(friction: number): void;
    setGravity(x: number, y: number, z: number): void;
    isStaticObject(): boolean;
    isKinematicObject(): boolean;
    isStaticOrKinematicObject(): boolean;
    isActive(): boolean;
    enableDeactivation(): void;
    disableDeactivation(): void;
    cannotDeactivate(): boolean;
    canDeactivate(): boolean;
}
