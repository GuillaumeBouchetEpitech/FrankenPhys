
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicCylinder(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const radius = 1.0;
  const length = 2;

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'cylinder',
      radius,
      length
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1 );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicCylinderMesh() {
    syncMeshWithRigidBody(mesh, body);
  }
}
