
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial, getBackSideMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";
import { makeCellShadedBoxGeometry } from "samples/browser-test-bed/src/internals/makeCellShadedGeometry";


export function renderRopeWithDynamicConstrainedBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const originX = -5;

  const bodyA = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX, 4,5],
    orientation: [0, 0,0,1]
  });
  bodyA.setFriction(0.1);

  const bodyB = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,1,0.5]
    },
    position: [originX+2, 4,5],
    orientation: [0, 0,0,1]
  });
  bodyB.setFriction(0.1);

  const bodyC = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX+4, 4,5],
    orientation: [0, 0,0,1]
  });
  bodyC.setFriction(0.1);

  const bodyD = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,1,0.5]
    },
    position: [originX+6, 4,5],
    orientation: [0, 0,0,1]
  });
  bodyD.setFriction(0.1);

  const bodyE = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX+8, 4,5],
    orientation: [0, 0,0,1]
  });
  bodyE.setFriction(0.1);

  const _makeConstraint = (bodyA: physics.IPhysicBody, bodyB: physics.IPhysicBody) => {

    const constraint = physicWorld.createGeneric6DofConstraint2({
      bodyA,
      bodyB,
      frameA: [+1,0,0],
      frameB: [-1,0,0],
      rotationOrder: physics.RotationOrder.XYZ
    });
    constraint.setLinearLowerLimit([0,0,0]);
    constraint.setLinearUpperLimit([0,0,0]);
    constraint.setAngularLowerLimit([-0.25 * Math.PI,-0.25 * Math.PI,-0.25 * Math.PI]);
    constraint.setAngularUpperLimit([+0.25 * Math.PI,+0.25 * Math.PI,+0.25 * Math.PI]);
  };

  _makeConstraint(bodyA, bodyB);
  _makeConstraint(bodyB, bodyC);
  _makeConstraint(bodyC, bodyD);
  _makeConstraint(bodyD, bodyE);

  const material = getTextureMaterial();
  // const backMaterial = getBackSideMaterial();

  // const geometryA = new THREE.BoxGeometry( 2.0 - 0.05, 0.5 - 0.05, 1.0 - 0.05 );
  // const geometryB = new THREE.BoxGeometry( 2.0 - 0.05, 1.0 - 0.05, 0.5 - 0.05 );

  // const _makeCellShadedGeometry = (inGeo: THREE.BufferGeometry): THREE.Object3D => {

  //   const frontGeo = inGeo.clone();
  //   const backGeo = inGeo.clone();
  //   frontGeo.scale(1-0.05, 1-0.05, 1-0.05);
  //   backGeo.scale(1+0.05, 1+0.05, 1+0.05);

  //   const object = new THREE.Object3D();
  //   const mesh = new THREE.Mesh(frontGeo, material);
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   object.add(mesh);
  //   const backMesh = new THREE.Mesh(backGeo, backMaterial);
  //   backMesh.castShadow = false;
  //   backMesh.receiveShadow = false;
  //   object.add(backMesh);
  //   // scene.add(object);

  //   return object;
  // };

  const objectA = makeCellShadedBoxGeometry([2, 0.5, 1], material, 0.05);
  scene.add(objectA);

  const objectB = makeCellShadedBoxGeometry([2, 1, 0.5], material, 0.05);
  scene.add(objectB);

  const objectC = makeCellShadedBoxGeometry([2, 0.5, 1], material, 0.05);
  scene.add(objectC);

  const objectD = makeCellShadedBoxGeometry([2, 1, 0.5], material, 0.05);
  scene.add(objectD);

  const objectE = makeCellShadedBoxGeometry([2, 0.5, 1], material, 0.05);
  scene.add(objectE);

  return function syncDynamicBoxMesh() {
    syncMeshWithRigidBody(objectA, bodyA);
    syncMeshWithRigidBody(objectB, bodyB);
    syncMeshWithRigidBody(objectC, bodyC);
    syncMeshWithRigidBody(objectD, bodyD);
    syncMeshWithRigidBody(objectE, bodyE);
  }
}
