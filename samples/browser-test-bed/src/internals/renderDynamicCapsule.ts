
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getBackSideMaterial3, getTextureMaterial } from "./getTextureMaterial";
import { makeCellShadedCapsuleGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicCapsule(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const radius = 1.0;
  const length = 2;

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'capsule',
      radius,
      length
    },
    position: pos,
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();
  const backSideMaterial3 = getBackSideMaterial3();

  const mesh = makeCellShadedCapsuleGeometry(radius, length, 4, 8, material, backSideMaterial3);
  scene.add( mesh );

  return function syncDynamicCapsuleMesh() {
    syncMeshWithRigidBody(mesh, body);
  }
}
