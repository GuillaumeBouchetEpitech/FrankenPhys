import { IPhysicBody } from "./PhysicBody";
import * as glm from "gl-matrix";
export type allContactEvents = "beginContact" | "updateContact" | "endContact" | "ccdContact";
export interface ContactDataWorld {
    contactId: number;
    rigidBodyA: IPhysicBody;
    rigidBodyB: IPhysicBody;
    position: glm.vec3;
    normalB: glm.vec3;
}
export interface ContactDataBody {
    contactId: number;
    other: IPhysicBody;
    position: glm.vec3;
    normalB: glm.vec3;
}
export type contactEvent<T extends allContactEvents, D> = {
    type: T;
    data: D;
};
export type contactCallback<T extends allContactEvents, D> = (data: contactEvent<T, D>) => void;
export interface IContactEventHandler<D> {
    isEventListenedTo(type: allContactEvents): boolean;
    addEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    on<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    hasEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    removeEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    dispatchEvent<T extends allContactEvents>(event: contactEvent<T, D>): void;
}
export declare class ContactEventHandler<D> implements IContactEventHandler<D> {
    private _listenersMap;
    isEventListenedTo(type: allContactEvents): boolean;
    addEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    on<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    hasEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): boolean;
    removeEventListener<T extends allContactEvents>(type: T, listener: contactCallback<T, D>): void;
    dispatchEvent<T extends allContactEvents>(event: contactEvent<T, D>): void;
}
