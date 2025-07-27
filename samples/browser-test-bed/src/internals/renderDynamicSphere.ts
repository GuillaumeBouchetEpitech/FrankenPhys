
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
import { makeCellShadedGeometry, makeCellShadedSphereGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicSphere(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'sphere',
      radius: 1
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const mesh = makeCellShadedSphereGeometry(1.0, material);

  scene.add( mesh );

  return function syncDynamicSphereMesh() {
    syncMeshWithRigidBody(mesh, body);
  }
}
