
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderStaticBoxes(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const staticBoxA = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [32,32,2]
    },
    position: [-6,0,-4],
    orientation: [+Math.PI / 80, 0,1,0]
  });
  staticBoxA.setFriction(0.1);

  const staticBoxB = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [32,32,2]
    },
    position: [17,0,-7],
    orientation: [0, 0,0,1]
  });
  staticBoxB.setFriction(0.1);

  const material = getTextureMaterial();
  const geometryAB = new THREE.BoxGeometry( 32.0, 32.0, 2.0 );

  const boxMeshA = new THREE.Mesh( geometryAB, material );
  boxMeshA.castShadow = true;
  boxMeshA.receiveShadow = true;
  scene.add( boxMeshA );

  const boxMeshB = new THREE.Mesh( geometryAB, material );
  boxMeshB.castShadow = true;
  boxMeshB.receiveShadow = true;
  scene.add( boxMeshB );

  return function syncRenderedStaticBox() {
    syncMeshWithRigidBody(boxMeshA, staticBoxA);
    syncMeshWithRigidBody(boxMeshB, staticBoxB);
  }
}
