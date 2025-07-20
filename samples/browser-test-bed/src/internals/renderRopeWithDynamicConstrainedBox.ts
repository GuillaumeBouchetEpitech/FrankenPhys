
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


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
    constraint.setAngularLowerLimit([-0.8,-0.8,-0.8]);
    constraint.setAngularUpperLimit([+0.8,+0.8,+0.8]);
  };

  _makeConstraint(bodyA, bodyB);
  _makeConstraint(bodyB, bodyC);
  _makeConstraint(bodyC, bodyD);
  _makeConstraint(bodyD, bodyE);

  const material = getTextureMaterial();

  const geometryA = new THREE.BoxGeometry( 2.0, 0.5, 1.0 );
  const geometryB = new THREE.BoxGeometry( 2.0, 1.0, 0.5 );

  const meshA = new THREE.Mesh( geometryA, material );
  meshA.castShadow = true;
  meshA.receiveShadow = true;
  scene.add( meshA );

  const meshB = new THREE.Mesh( geometryB, material );
  meshB.castShadow = true;
  meshB.receiveShadow = true;
  scene.add( meshB );

  const meshC = new THREE.Mesh( geometryA, material );
  meshC.castShadow = true;
  meshC.receiveShadow = true;
  scene.add( meshC );

  const meshD = new THREE.Mesh( geometryB, material );
  meshD.castShadow = true;
  meshD.receiveShadow = true;
  scene.add( meshD );

  const meshE = new THREE.Mesh( geometryA, material );
  meshE.castShadow = true;
  meshE.receiveShadow = true;
  scene.add( meshE );

  return function syncDynamicBoxMesh() {
    syncMeshWithRigidBody(meshA, bodyA);
    syncMeshWithRigidBody(meshB, bodyB);
    syncMeshWithRigidBody(meshC, bodyC);
    syncMeshWithRigidBody(meshD, bodyD);
    syncMeshWithRigidBody(meshE, bodyE);
  }
}
