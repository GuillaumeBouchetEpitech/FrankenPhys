
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): (deltaTimeMsec: number) => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,2,2]
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  // const geometry = new THREE.BoxGeometry( 2.0, 2.0, 2.0 );
  // // const mesh = new THREE.Mesh( geometry, material );
  // // mesh.castShadow = true;
  // // mesh.receiveShadow = true;
  const mesh = makeCellShadedBoxGeometry([2,2,2], material);
  scene.add( mesh );

  let timeLeft = 10;

  return function syncDynamicBoxMesh(deltaTimeMsec: number) {

    timeLeft -= deltaTimeMsec;
    if (timeLeft < 0) {
      timeLeft = 10;

      body.setPositionAndRotation(pos, [0, 0,0,1]);
      body.setLinearVelocity(0, 0, 0);
      body.setAngularVelocity(0, 0, 0);
    }

    syncMeshWithRigidBody(mesh, body);
  }
}
