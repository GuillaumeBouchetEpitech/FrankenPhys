
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
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

  const mainObj = new THREE.Object3D();

  const geometryX = new THREE.BoxGeometry(4,1,1);
  const meshX = new THREE.Mesh( geometryX, material );
  meshX.castShadow = true;
  meshX.receiveShadow = true;
  const subObjX = new THREE.Object3D();
  subObjX.position.set(1,0,0);
  subObjX.add(meshX);
  mainObj.add( subObjX );

  const geometryY = new THREE.BoxGeometry(1,4,1);
  const meshY = new THREE.Mesh( geometryY, material );
  meshY.castShadow = true;
  meshY.receiveShadow = true;
  const subObjY = new THREE.Object3D();
  subObjY.position.set(0,1,0);
  subObjY.add(meshY);
  mainObj.add( subObjY );

  const geometryZ = new THREE.BoxGeometry(1,1,4);
  const meshZ = new THREE.Mesh( geometryZ, material );
  meshZ.castShadow = true;
  meshZ.receiveShadow = true;
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
