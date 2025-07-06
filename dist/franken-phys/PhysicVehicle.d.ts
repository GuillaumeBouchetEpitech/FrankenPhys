import FrankenPhys from "../types/FrankenPhys";
import { IPhysicBody, PhysicBodyDef, ConcretePhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export interface PhysicVehicleDef {
    chassisDef: PhysicBodyDef;
    coordinateSystem: glm.vec3;
    groundDirection: glm.vec3;
    rotationAxis: glm.vec3;
    wheelRadius: number;
    wheelWidth: number;
    suspensionRestLength: number;
    wheelFriction: number;
    suspensionStiffness: number;
    wheelsDampingCompression: number;
    wheelsDampingRelaxation: number;
    rollInfluence: number;
    wheels: {
        connectionPoint: glm.vec3;
        isFrontWheel: boolean;
    }[];
}
export interface IPhysicVehicle {
    getChassisBody(): IPhysicBody;
    getWheeTransforms(): {
        position: glm.vec3;
        rotation: glm.vec4;
    }[];
    setSteeringValue(index: number, angle: number): void;
    applyEngineForce(index: number, force: number): void;
    setBrake(index: number, force: number): void;
}
export declare class ConcretePhysicVehicle implements IPhysicVehicle {
    _chassisBody: ConcretePhysicBody;
    private _vehicleTuning;
    private _defaultVehicleRaycaster;
    _rawVehicle: FrankenPhys.btRaycastVehicle;
    constructor(rawDynamicsWorld: FrankenPhys.btDynamicsWorld, chassisBody: ConcretePhysicBody, def: PhysicVehicleDef);
    dispose(): void;
    getChassisBody(): IPhysicBody;
    setSteeringValue(index: number, angle: number): void;
    applyEngineForce(index: number, force: number): void;
    setBrake(index: number, force: number): void;
    getWheeTransforms(): {
        position: glm.vec3;
        rotation: glm.vec4;
    }[];
}
