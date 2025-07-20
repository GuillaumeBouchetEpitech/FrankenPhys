
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";



export function renderQuadrupedWithHingeConstrainedBoxes(scene: THREE.Scene, physicWorld: physics.PhysicWorld): (deltaTimeSec: number) => void {

  const originX = +10;
  const originY = -20;

  const toSync: ((deltaTimeSec: number) => void)[] = [];

  const material = getTextureMaterial();

  const bodyStaticGround = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [20,20,1]
    },
    position: [originX,originY, 0],
    orientation: [0, 0,0,1]
  });
  bodyStaticGround.setFriction(10.0);

  const geometryStaticGround = new THREE.BoxGeometry( 20.0, 20.0, 1.0 );

  const boxMeshStaticGround = new THREE.Mesh( geometryStaticGround, material );
  boxMeshStaticGround.castShadow = true;
  boxMeshStaticGround.receiveShadow = true;
  scene.add( boxMeshStaticGround );

  toSync.push(() => {
    syncMeshWithRigidBody(boxMeshStaticGround, bodyStaticGround);
  });

  //
  //
  //
  //
  //

  const mainBoxSize: glm.ReadonlyVec3 = [2,2,2];

  const bodyDefMain: physics.PhysicBodyDef = {
    mass: 1,
    shape: {
      type: 'box',
      size: mainBoxSize
    },
    position: [originX, originY, 5],
    orientation: [0, 0,0,1]
  };

  const bodyMain = physicWorld.createRigidBody(bodyDefMain);
  bodyMain.setFriction(10.0);
  bodyMain.disableDeactivation();

  const geometryBody = new THREE.BoxGeometry(mainBoxSize[0], mainBoxSize[1], mainBoxSize[2]);

  const meshMain = new THREE.Mesh( geometryBody, material );
  meshMain.castShadow = true;
  meshMain.receiveShadow = true;
  scene.add( meshMain );

  toSync.push(() => {
    syncMeshWithRigidBody(meshMain, bodyMain);
  });

  //
  //
  //

  const _makeLeg = (
    posLeg: glm.ReadonlyVec3,
    posForeleg: glm.ReadonlyVec3,
    pivotInA: glm.ReadonlyVec3,
    pivotInB: glm.ReadonlyVec3,
    isLeftLeg: boolean,
    isBackLeg: boolean,
  ) => {

    const bodyDefLegBase: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        type: 'sphere',
        radius: 0.5,
      },
      position: posLeg,
      orientation: [0, 0,0,1],
    };

    const bodyDefLeg: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        type: 'box',
        size: [2.0,0.5,0.5]
      },
      position: posLeg,
      orientation: [0, 0,0,1],
    };

    const bodyDefForeleg: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        // type: 'box',
        // size: [2.0,0.5,0.5]
        type: 'compound',
        shapes: [
          {
            position: [0,0,0],
            orientation: [0, 0,0,1],
            shape: {
              type: 'box',
              size: [2.0,0.5,0.5]
            }
          },
          {
            position: [isBackLeg ? -1 : +1,0,0],
            orientation: [0.25 * Math.PI, 0,0,1],
            shape: {
              // type: 'sphere',
              // radius: 0.25
              type: 'box',
              size: [0.25,1,1]
              // size: [0.25,1,0.25]
            }
          },
          // {
          //   position: [isBackLeg ? -1 : +1,0,0],
          //   orientation: [0.25 * Math.PI, 0,0,1],
          //   shape: {
          //     // type: 'sphere',
          //     // radius: 0.25
          //     type: 'box',
          //     size: [0.25,0.25,1]
          //   }
          // },
        ]
      },
      position: posForeleg,
      orientation: [0, 0,0,1],
    };

    const bodyLegBase = physicWorld.createRigidBody(bodyDefLegBase);
    // bodyLegBase.setPosition(posLeg[0], posLeg[1], posLeg[2]);
    bodyLegBase.setFriction(10.0);
    bodyLegBase.disableDeactivation();

    const bodyLeg = physicWorld.createRigidBody(bodyDefLeg);
    // bodyLeg.setPosition(posLeg[0], posLeg[1], posLeg[2]);
    bodyLeg.setFriction(10.0);
    bodyLeg.disableDeactivation();

    const bodyForeleg = physicWorld.createRigidBody(bodyDefForeleg);
    // bodyForeleg.setPosition(posForeleg[0], posForeleg[1], posForeleg[2]);
    bodyForeleg.setFriction(10.0);
    bodyForeleg.disableDeactivation();

    // const bodyFoot = physicWorld.createRigidBody({
    //   mass: 0.01,
    //   shape: {
    //     type: 'sphere',
    //     radius: 0.6
    //     // type: 'box',
    //     // size: [0.6,0.6,0.6]
    //   },
    //   position: [posForeleg[0] + 1, posForeleg[1], posForeleg[2]],
    //   orientation: [0, 0,0,1],
    // });
    // // bodyFoot.setPosition(1000, 0, 0);
    // bodyFoot.setFriction(1.0);

    const constraintBodyLegBase = physicWorld.createHingeConstraint({
      bodyA: bodyMain,
      bodyB: bodyLegBase,
      pivotInA,
      pivotInB: [0,0,0],
      axisInA: [0,0,1],
      axisInB: [0,0,1],
      useReferenceFrameA: true
    });

    const constraintBaseLeg = physicWorld.createHingeConstraint({
      bodyA: bodyLegBase,
      bodyB: bodyLeg,
      pivotInA: [0,0,0],
      pivotInB,
      axisInA: [0,1,0],
      axisInB: [0,1,0],
      useReferenceFrameA: true
    });

    const constraintLegForeleg = physicWorld.createHingeConstraint({
      bodyA: bodyLeg,
      bodyB: bodyForeleg,
      pivotInA: isBackLeg ? [-1,0,0] : [+1,0,0],
      pivotInB: isBackLeg ? [+1,0,0] : [-1,0,0],
      axisInA: [0,1,0],
      axisInB: [0,1,0],
      useReferenceFrameA: true
    });

    // const constraintForelegFoot = physicWorld.createHingeConstraint({
    //   bodyA: bodyForeleg,
    //   bodyB: bodyFoot,
    //   pivotInA: [isBackLeg ? -1 : +1, 0,0],
    //   pivotInB: [0,0,0],
    //   axisInA: [0,1,0],
    //   axisInB: [0,1,0],
    //   useReferenceFrameA: true
    // });



    if (isBackLeg) {
      constraintBodyLegBase.setLimit(-Math.PI*0.3, +Math.PI*0.3, 0.0, 0.0, 0.0);
    } else {
      constraintBodyLegBase.setLimit(-Math.PI*0.3, +Math.PI*0.3, 0.0, 0.0, 0.0);
    }
    constraintBodyLegBase.enableMotor(true);
    constraintBodyLegBase.setMaxMotorImpulse(20);

    constraintBaseLeg.setLimit(-Math.PI*0.7, +Math.PI*0.7, 0.0, 0.0, 0.0);
    constraintBaseLeg.enableMotor(true);
    constraintBaseLeg.setMaxMotorImpulse(20);

    constraintLegForeleg.setLimit(-Math.PI*0.7, +Math.PI*0.7, 0.0, 0.0, 0.0);
    constraintLegForeleg.enableMotor(true);
    constraintLegForeleg.setMaxMotorImpulse(20);

    // constraintForelegFoot.setLimit(0, 0, 0.0, 0.0, 0.0);

    // const geometryBaseLeg = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
    const geometryBaseLeg = new THREE.SphereGeometry( 0.5 );
    const geometryLeg = new THREE.BoxGeometry( 2.0, 0.5, 0.5 );
    // const geometryFoot = new THREE.SphereGeometry( 0.25 );
    // const geometryFoot1 = new THREE.BoxGeometry( 0.25, 0.25, 1 );
    const geometryFoot1 = new THREE.BoxGeometry( 0.25, 1, 1 );
    // const geometryFoot2 = new THREE.BoxGeometry( 0.25, 1, 0.25 );

    const meshBaseLeg = new THREE.Mesh( geometryBaseLeg, material );
    meshBaseLeg.castShadow = true;
    meshBaseLeg.receiveShadow = true;
    scene.add( meshBaseLeg );

    const meshLeg = new THREE.Mesh( geometryLeg, material );
    meshLeg.castShadow = true;
    meshLeg.receiveShadow = true;
    scene.add( meshLeg );

    // const meshLegForeleg = new THREE.Mesh( geometryLeg, material );
    // meshLegForeleg.castShadow = true;
    // meshLegForeleg.receiveShadow = true;
    // scene.add( meshLegForeleg );

    const meshLegForeleg = new THREE.Object3D();
    scene.add( meshLegForeleg );

    // const geometryForeLeg = new THREE.BoxGeometry(4,1,1);
    const meshX = new THREE.Mesh( geometryLeg, material );
    meshX.castShadow = true;
    meshX.receiveShadow = true;
    const subObjX = new THREE.Object3D();
    subObjX.position.set(0,0,0);
    subObjX.add(meshX);
    meshLegForeleg.add( subObjX );

    const meshFoot1 = new THREE.Mesh( geometryFoot1, material );
    meshFoot1.castShadow = true;
    meshFoot1.receiveShadow = true;
    const subObjFoot1 = new THREE.Object3D();
    subObjFoot1.position.set(isBackLeg ? -1 : +1,0,0);
    subObjFoot1.quaternion.set(1,0,0, 0.25 * Math.PI);
    subObjFoot1.add(meshFoot1);
    meshLegForeleg.add( subObjFoot1 );

    // const meshFoot2 = new THREE.Mesh( geometryFoot2, material );
    // meshFoot2.castShadow = true;
    // meshFoot2.receiveShadow = true;
    // const subObjFoot2 = new THREE.Object3D();
    // subObjFoot2.position.set(isBackLeg ? -1 : +1,0,0);
    // subObjFoot2.quaternion.set(1,0,0, 0.25 * Math.PI);
    // subObjFoot2.add(meshFoot2);
    // meshLegForeleg.add( subObjFoot2 );


    // const meshFoot = new THREE.Mesh( geometryFoot, material );
    // meshFoot.castShadow = true;
    // meshFoot.receiveShadow = true;
    // scene.add( meshFoot );


    let timeLeftBeforeNextFrame = 2.0;

    interface ILegFrame {
      base: number;
      leg: number;
      foreleg: number;
      duration: number;
    }

    const frames: ILegFrame[] = [];
    frames.push({ base: 0.00, leg: +0.0, foreleg: 0.0, duration: 2.0 }); // flat
    frames.push({ base: 0.00, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated
    frames.push({ base: 0.15, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated rotated
    frames.push({ base: 0.15, leg: +0.1, foreleg: 0.5, duration: 2.0 }); // rotated on the ground
    frames.push({ base: 0.15, leg: +0.4, foreleg: 0.1, duration: 2.0 }); // rotated on the ground higher
    frames.push({ base: 0.15, leg: +0.1, foreleg: 0.5, duration: 2.0 }); // rotated on the ground
    frames.push({ base: 0.15, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated rotated
    frames.push({ base: 0.00, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated

    let currFrameIndex = 0;
    let nextFrameIndex = 1;
    let currFrame = frames[0];
    let nextFrame = frames[1];

    return  (deltaTimeSec: number) => {

      if (timeLeftBeforeNextFrame > 0) {
        timeLeftBeforeNextFrame -= deltaTimeSec;
        if (timeLeftBeforeNextFrame <= 0) {

          currFrameIndex = (currFrameIndex + 1) % frames.length;
          nextFrameIndex = (nextFrameIndex + 1) % frames.length;
          currFrame = frames[currFrameIndex];
          nextFrame = frames[nextFrameIndex];

          timeLeftBeforeNextFrame = currFrame.duration;
        }
      }

      const coef = 1 - timeLeftBeforeNextFrame / currFrame.duration;

      // console.log({ coef })

      let angleBase = currFrame.base + (nextFrame.base - currFrame.base) * coef;
      let angleForeleg = currFrame.foreleg + (nextFrame.foreleg - currFrame.foreleg) * coef;
      let angleLeg = currFrame.leg + (nextFrame.leg - currFrame.leg) * coef;

      // let angleBase = +currFrame.base;
      if (isBackLeg && !isLeftLeg) {
        angleBase = -angleBase;
      } else if (!isBackLeg && isLeftLeg) {
        angleBase = -angleBase;
      }
      constraintBodyLegBase.setMotorTarget(Math.PI*angleBase, deltaTimeSec*2);

      angleForeleg = isBackLeg ? -angleForeleg : +angleForeleg;
      constraintLegForeleg.setMotorTarget(Math.PI*+angleForeleg, deltaTimeSec*2);

      angleLeg = isBackLeg ? -angleLeg : +angleLeg;
      constraintBaseLeg.setMotorTarget(Math.PI*+angleLeg, deltaTimeSec*2);

      syncMeshWithRigidBody(meshBaseLeg, bodyLegBase);
      syncMeshWithRigidBody(meshLeg, bodyLeg);
      syncMeshWithRigidBody(meshLegForeleg, bodyForeleg);

    };
  }

  const diffX = 1.5;
  const diffY = 1.5;

  toSync.push(_makeLeg(
    [originX+diffX, originY+diffY, 5],
    [originX+diffX, originY+diffY, 5],
    [+diffX,+diffY,0],
    [-1,0,0],
    false,
    false,
  ));

  toSync.push(_makeLeg(
    [originX+2, originY-diffY, 5],
    [originX+4, originY-diffY, 5],
    [+diffX,-diffY,0],
    [-1,0,0],
    true,
    false,
  ));

  toSync.push(_makeLeg(
    [originX-2, originY+diffY, 5],
    [originX+2, originY+diffY, 5],
    [-diffX,+diffY,0],
    [+1,0,0],
    false,
    true,
  ));

  toSync.push(_makeLeg(
    [originX-2, originY-diffY, 5],
    [originX+2, originY-diffY, 5],
    [-diffX,-diffY,0],
    [+1,0,0],
    true,
    true,
  ));

  let timeElapsedSec = 0;
  let forward = true;

  return function syncDynamicBoxMesh(deltaTimeSec: number) {

    if (timeElapsedSec > 1.0) {
      timeElapsedSec = 0;
      forward = !forward;
    }

    timeElapsedSec += deltaTimeSec;

    for (const currSync of toSync) {
      currSync(deltaTimeSec);
    }
  }
}
