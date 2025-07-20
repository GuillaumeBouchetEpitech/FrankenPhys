
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial2 } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";



export function renderRagDollWithDynamicConstrainedBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {


  const syncList: { body: physics.IPhysicBody; mesh: THREE.Object3D }[] = [];

  const material = getTextureMaterial2();




  const k_origin: glm.ReadonlyVec3 = [-10,0,20];






  const lowerChest = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        // lower chest
        {
          position: [0,0,0.6],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.7,0.9,0.4]
          }
        },
        // coccyx
        {
          position: [0,0,0.4-0.4*0.5],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.57,0.3,0.4]
          }
        },
        // hip
        {
          position: [0,0,0],
          orientation: glm.quat.setAxisAngle(glm.quat.create(), [0,1,0], 0.25*Math.PI),
          shape: {
            type: 'box',
            size: [0.4,1.0,0.4]
          }
        }
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0,k_origin[2]],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.7,0.9,0.4);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,0.6);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    const geometryB = new THREE.BoxGeometry(0.57,0.3,0.4);
    const meshB = new THREE.Mesh( geometryB, material );
    meshB.castShadow = true;
    meshB.receiveShadow = true;
    const subObjB = new THREE.Object3D();
    subObjB.position.set(0,0,0.2);
    subObjB.add(meshB);
    mainObj.add( subObjB );

    const geometryC = new THREE.BoxGeometry(0.4,1.0,0.4);
    const meshC = new THREE.Mesh( geometryC, material );
    meshC.castShadow = true;
    meshC.receiveShadow = true;
    const subObjC = new THREE.Object3D();
    subObjC.position.set(0,0,0);
    subObjC.rotateY(0.25 * Math.PI);
    subObjC.add(meshC);
    mainObj.add( subObjC );

    scene.add(mainObj);

    syncList.push({ body: lowerChest, mesh: mainObj });
  }

  const midChest = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,0.6],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.75,0.85,0.8]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0,k_origin[2]+0.7],
    orientation: glm.quat.identity(glm.quat.create()),
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.75,0.85,0.8);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,0.6);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: midChest, mesh: mainObj });
  }

  const upperChest = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        // torso
        {
          position: [0,0,0.5],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.8,1.2,1.0]
          }
        },
        // shoulder
        {
          position: [0,0,0.7],
          orientation: glm.quat.setAxisAngle(glm.quat.create(), [0,1,0], 0.25*Math.PI),
          shape: {
            type: 'box',
            size: [0.4,2.0,0.4]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0,k_origin[2]+1.4],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.8,1.2,1.0);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,0.5);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    const geometryB = new THREE.BoxGeometry(0.4,2.0,0.4);
    const meshB = new THREE.Mesh( geometryB, material );
    meshB.castShadow = true;
    meshB.receiveShadow = true;
    const subObjB = new THREE.Object3D();
    subObjB.position.set(0,0,0.7);
    subObjB.rotateY(0.25*Math.PI);
    subObjB.add(meshB);
    mainObj.add( subObjB );

    scene.add(mainObj);

    syncList.push({ body: upperChest, mesh: mainObj });
  }

  const _lowerMiddleConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: lowerChest,
    bodyB: midChest,
    frameA: [0,0,0.4],
    frameB: [0,0,0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _lowerMiddleConstraint.setLinearLowerLimit([0,0,0]);
  _lowerMiddleConstraint.setLinearUpperLimit([0,0,0]);
  _lowerMiddleConstraint.setAngularLowerLimit([0, Math.PI*-0.2, Math.PI*-0.1]);
  _lowerMiddleConstraint.setAngularUpperLimit([0, Math.PI*+0.2, Math.PI*+0.1]);

  const _middleUpperConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: midChest,
    bodyB: upperChest,
    frameA: [0,0,0.7],
    frameB: [0,0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _middleUpperConstraint.setLinearLowerLimit([0,0,0]);
  _middleUpperConstraint.setLinearUpperLimit([0,0,0]);
  _middleUpperConstraint.setAngularLowerLimit([0, Math.PI*-0.2, Math.PI*-0.1]);
  _middleUpperConstraint.setAngularUpperLimit([0, Math.PI*+0.2, Math.PI*+0.1]);



















  const neck = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,0.2],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.4,0.4,0.6]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0,k_origin[2]+2.2],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.4,0.4,0.6);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,0.2);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: neck, mesh: mainObj });
  }

  const head = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0.25,0,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.7,0.6,0.6]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0,k_origin[2]+2.6],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.7,0.6,0.6);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0.25,0,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: head, mesh: mainObj });
  }

  const _upperNeckConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: upperChest,
    bodyB: neck,
    frameA: [0,0,1.0],
    frameB: [0,0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _upperNeckConstraint.setLinearLowerLimit([0,0,0]);
  _upperNeckConstraint.setLinearUpperLimit([0,0,0]);
  _upperNeckConstraint.setAngularLowerLimit([0, Math.PI*-0.1, Math.PI*-0.1]);
  _upperNeckConstraint.setAngularUpperLimit([0, Math.PI*+0.0, Math.PI*+0.1]);

  const _neckHeadConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: neck,
    bodyB: head,
    frameA: [0,0,0.6],
    frameB: [0,0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _neckHeadConstraint.setLinearLowerLimit([0,0,0]);
  _neckHeadConstraint.setLinearUpperLimit([0,0,0]);
  _neckHeadConstraint.setAngularLowerLimit([0, Math.PI*-0.2, Math.PI*-0.2]);
  _neckHeadConstraint.setAngularUpperLimit([0, Math.PI*+0.2, Math.PI*+0.1]);

















  const leftArm = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0.7,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.45,1.4,0.45]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+1.0,k_origin[2]+1.9],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.45,1.4,0.45);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0.7,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftArm, mesh: mainObj });
  }

  const leftForearm = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0.7,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.3,1.4,0.3]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+1.0+1.4,k_origin[2]+1.9],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.3,1.4,0.3);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0.7,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftForearm, mesh: mainObj });
  }

  const leftHand = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0.3,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.3,0.6,0.2]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+1.0+2.8,k_origin[2]+0.7],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.3,0.6,0.2);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0.3,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftHand, mesh: mainObj });
  }

  const _upperLeftArmConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: upperChest,
    bodyB: leftArm,
    frameA: [0,1.0,0.7],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _upperLeftArmConstraint.setLinearLowerLimit([0,0,0]);
  _upperLeftArmConstraint.setLinearUpperLimit([0,0,0]);
  _upperLeftArmConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.3]);
  _upperLeftArmConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.3]);

  const _leftArmLeftForearmConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: leftArm,
    bodyB: leftForearm,
    frameA: [0,1.4,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _leftArmLeftForearmConstraint.setLinearLowerLimit([0,0,0]);
  _leftArmLeftForearmConstraint.setLinearUpperLimit([0,0,0]);
  _leftArmLeftForearmConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _leftArmLeftForearmConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.2]);

  const _leftForearmLeftHandConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: leftForearm,
    bodyB: leftHand,
    frameA: [0,1.4,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _leftForearmLeftHandConstraint.setLinearLowerLimit([0,0,0]);
  _leftForearmLeftHandConstraint.setLinearUpperLimit([0,0,0]);
  _leftForearmLeftHandConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _leftForearmLeftHandConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.2]);



















  const rightArm = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,-0.7,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.45,1.4,0.45]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-1.0,k_origin[2]+1.9],
    // orientation: glm.quat.setAxisAngle(glm.quat.create(), [0,0,1], Math.PI),
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.45,1.4,0.45);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,-0.7,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightArm, mesh: mainObj });
  }

  const rightForearm = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,-0.7,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.3,1.4,0.3]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-1-1.4,k_origin[2]+1.9],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.3,1.4,0.3);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,-0.7,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightForearm, mesh: mainObj });
  }

  const rightHand = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,-0.3,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.3,0.6,0.2]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-1-2.8,k_origin[2]+0.7],
    orientation: glm.quat.setAxisAngle(glm.quat.create(), [0,0,1], Math.PI),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.3,0.6,0.2);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,-0.3,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightHand, mesh: mainObj });
  }

  const _upperRightArmConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: upperChest,
    bodyB: rightArm,
    frameA: [0,-1,0.7],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _upperRightArmConstraint.setLinearLowerLimit([0,0,0]);
  _upperRightArmConstraint.setLinearUpperLimit([0,0,0]);
  _upperRightArmConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.3]);
  _upperRightArmConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.3]);

  const _rightArmRightForearmConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: rightArm,
    bodyB: rightForearm,
    frameA: [0,-1.4,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _rightArmRightForearmConstraint.setLinearLowerLimit([0,0,0]);
  _rightArmRightForearmConstraint.setLinearUpperLimit([0,0,0]);
  _rightArmRightForearmConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _rightArmRightForearmConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.2]);

  const _rightForearmRightHandConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: rightForearm,
    bodyB: rightHand,
    frameA: [0,-1.4,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _rightForearmRightHandConstraint.setLinearLowerLimit([0,0,0]);
  _rightForearmRightHandConstraint.setLinearUpperLimit([0,0,0]);
  _rightForearmRightHandConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _rightForearmRightHandConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.2]);
















  const leftLeg = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,-1],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.55,0.55,2.0]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0.5,k_origin[2]-1.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.55,0.55,2.0);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,-1);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftLeg, mesh: mainObj });
  }

  const leftForeLeg = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,-1],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.4,0.4,2.0]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0.5,k_origin[2]-3.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.4,0.4,2.0);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,-1);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftForeLeg, mesh: mainObj });
  }

  const leftFoot = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [+0.4,0,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.9,0.4,0.4]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]+0.5,k_origin[2]-4.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.9,0.4,0.4);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0.4,0,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: leftFoot, mesh: mainObj });
  }

  const _lowerLeftLegConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: lowerChest,
    bodyB: leftLeg,
    frameA: [0,+0.5,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _lowerLeftLegConstraint.setLinearLowerLimit([0,0,0]);
  _lowerLeftLegConstraint.setLinearUpperLimit([0,0,0]);
  _lowerLeftLegConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _lowerLeftLegConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.2]);

  const _leftLegLeftForeLegConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: leftLeg,
    bodyB: leftForeLeg,
    frameA: [0,0.0,-2.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _leftLegLeftForeLegConstraint.setLinearLowerLimit([0,0,0]);
  _leftLegLeftForeLegConstraint.setLinearUpperLimit([0,0,0]);
  _leftLegLeftForeLegConstraint.setAngularLowerLimit([0, Math.PI*-0.1, Math.PI*-0.1]);
  _leftLegLeftForeLegConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.1]);

  const _leftForeLegLeftFootConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: leftForeLeg,
    bodyB: leftFoot,
    frameA: [0,0,-2.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _leftForeLegLeftFootConstraint.setLinearLowerLimit([0,0,0]);
  _leftForeLegLeftFootConstraint.setLinearUpperLimit([0,0,0]);
  _leftForeLegLeftFootConstraint.setAngularLowerLimit([0, Math.PI*+0.1, Math.PI*-0.1]);
  _leftForeLegLeftFootConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.1]);
















  const rightLeg = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,-1],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.55,0.55,2.0]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-0.5,k_origin[2]-1.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.55,0.55,2.0);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,-1);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightLeg, mesh: mainObj });
  }

  const rightForeLeg = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [0,0,-1],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.4,0.4,2.0]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-0.5,k_origin[2]-3.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.4,0.4,2.0);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0,0,-1);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightForeLeg, mesh: mainObj });
  }

  const rightFoot = physicWorld.createRigidBody({
    mass: 0.5,
    shape: {
      type: 'compound',
      shapes: [
        {
          position: [+0.4,0,0],
          orientation: glm.quat.identity(glm.quat.create()),
          shape: {
            type: 'box',
            size: [0.9,0.4,0.4]
          }
        },
      ]
    },
    position: [k_origin[0]+0,k_origin[1]-0.5,k_origin[2]-4.0],
    orientation: glm.quat.identity(glm.quat.create()),
    collisionFilterGroup: -1,
    collisionFilterMask: -4,
  });

  {
    const mainObj = new THREE.Object3D();

    const geometryA = new THREE.BoxGeometry(0.9,0.4,0.4);
    const meshA = new THREE.Mesh( geometryA, material );
    meshA.castShadow = true;
    meshA.receiveShadow = true;
    const subObjA = new THREE.Object3D();
    subObjA.position.set(0.4,0,0);
    subObjA.add(meshA);
    mainObj.add( subObjA );

    scene.add(mainObj);

    syncList.push({ body: rightFoot, mesh: mainObj });
  }

  const _lowerRightLegConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: lowerChest,
    bodyB: rightLeg,
    frameA: [0,-0.5,0.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _lowerRightLegConstraint.setLinearLowerLimit([0,0,0]);
  _lowerRightLegConstraint.setLinearUpperLimit([0,0,0]);
  _lowerRightLegConstraint.setAngularLowerLimit([0, Math.PI*-0.5, Math.PI*-0.2]);
  _lowerRightLegConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.2]);

  const _rightLegRightForeLegConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: rightLeg,
    bodyB: rightForeLeg,
    frameA: [0,0.0,-2.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _rightLegRightForeLegConstraint.setLinearLowerLimit([0,0,0]);
  _rightLegRightForeLegConstraint.setLinearUpperLimit([0,0,0]);
  _rightLegRightForeLegConstraint.setAngularLowerLimit([0, Math.PI*-0.1, Math.PI*-0.1]);
  _rightLegRightForeLegConstraint.setAngularUpperLimit([0, Math.PI*+0.5, Math.PI*+0.1]);

  const _rightForeLegRightFootConstraint = physicWorld.createGeneric6DofConstraint2({
    bodyA: rightForeLeg,
    bodyB: rightFoot,
    frameA: [0,0,-2.0],
    frameB: [0,0.0,0.0],
    rotationOrder: physics.RotationOrder.YZX
  });
  _rightForeLegRightFootConstraint.setLinearLowerLimit([0,0,0]);
  _rightForeLegRightFootConstraint.setLinearUpperLimit([0,0,0]);
  _rightForeLegRightFootConstraint.setAngularLowerLimit([0, Math.PI*+0.1, Math.PI*-0.1]);
  _rightForeLegRightFootConstraint.setAngularUpperLimit([0, Math.PI*+0.1, Math.PI*+0.1]);










  return function syncDynamicBoxMesh() {
    for (const currSync of syncList) {
      syncMeshWithRigidBody(currSync.mesh, currSync.body);
    }
  }
}
