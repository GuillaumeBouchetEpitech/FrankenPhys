
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getBackSideMaterial3, getTextureMaterial } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicCompound(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'compound',
      shapes: [
        {
          // boxX
          position: [1,0,0],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [4,1,1]
          }
        },
        {
          // boxY
          position: [0,1,0],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [1,4,1]
          }
        },
        {
          // boxZ
          position: [0,0,1],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [1,1,4]
          }
        },
      ],
    },
    position: pos,
    orientation: [0, 0,0,1],
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  //

  const material = getTextureMaterial();
  const backSideMaterial3 = getBackSideMaterial3();

  const mainObj = new THREE.Object3D();

  const meshX = makeCellShadedBoxGeometry([4,1,1], material, backSideMaterial3);
  const subObjX = new THREE.Object3D();
  subObjX.position.set(1,0,0);
  subObjX.add(meshX);
  mainObj.add( subObjX );

  const meshY = makeCellShadedBoxGeometry([1,4,1], material, backSideMaterial3);
  const subObjY = new THREE.Object3D();
  subObjY.position.set(0,1,0);
  subObjY.add(meshY);
  mainObj.add( subObjY );

  const meshZ = makeCellShadedBoxGeometry([1,1,4], material, backSideMaterial3);
  const subObjZ = new THREE.Object3D();
  subObjZ.position.set(0,0,1);
  subObjZ.add(meshZ);
  mainObj.add( subObjZ );

  scene.add(mainObj)

  //

  return function syncDynamicCompoundMesh() {
    syncMeshWithRigidBody(mainObj, body);
  }
}
