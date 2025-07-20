
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

const position = glm.vec3.fromValues(0,0,0);
const rotation = glm.vec4.fromValues(0,0,0,0);
const quat = new THREE.Quaternion(rotation[0],rotation[1],rotation[2],rotation[3]);

export function syncMeshWithRigidBody(mesh: THREE.Object3D, body: physics.IPhysicBody) {

  body.getPositionAndRotation(position, rotation);

  quat.set(rotation[0], rotation[1], rotation[2], rotation[3]);

  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.setFromQuaternion(quat);
}
