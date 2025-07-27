
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial2, getBackSideMaterial } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


const _createHumanoidRagDoll = (
  scene: THREE.Scene,
  physicWorld: physics.PhysicWorld,
  origin: glm.ReadonlyVec3,
): {
  simulateHeadShot: () => glm.vec3,
  dispose: () => void,
  update: () => void,
} => {


  const syncList: { body: physics.IPhysicBody; mesh: THREE.Object3D }[] = [];

  const material = getTextureMaterial2();



  // const k_origin: glm.ReadonlyVec3 = [+15,-15,10];



  // const bodyStaticGround = physicWorld.createRigidBody({
  //   mass: 0,
  //   shape: {
  //     type: 'box',
  //     size: [10,10,1]
  //   },
  //   position: [k_origin[0]-0,k_origin[1]-2,k_origin[2] - 8],
  //   orientation: glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.15*Math.PI),
  // });
  // bodyStaticGround.setFriction(1.0);

  // const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material, 0.05);
  // scene.add( boxMeshStaticGround );

  // syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });



  enum BodyPartEnum {
    lowerChest = 0,
    midChest = 1,
    upperChest = 2,

    neck = 3,
    head = 4,

    leftArm = 51,
    leftForearm = 52,
    leftHand = 53,

    rightArm = 61,
    rightForearm = 62,
    rightHand = 63,

    leftLeg = 71,
    leftForeleg = 72,
    leftFoot = 73,

    rightLeg = 81,
    rightForeleg = 82,
    rightFoot = 83,
  };


  interface IBodyPart {
    id: number;
    shapes: {
      position: [number, number, number];
      orientation?: {
        axis: [number, number, number];
        angle: number;
      }[];
      boxSize: [number, number, number];
    }[];
    children?: {
      relativePosition: [number, number, number];
      lowerLimit: [number, number, number];
      upperLimit: [number, number, number];
      part: IBodyPart;
    }[];
  };

  const rootPart: IBodyPart = {
    // lower chest
    id: BodyPartEnum.lowerChest,
    shapes: [
      // lower chest
      { position: [0,0,0.6], boxSize: [0.7,0.9,0.4] },
      // coccyx
      { position: [0,0,0.2], boxSize: [0.57,0.3,0.4] },
      //hip
      { position: [0,0,0.0], boxSize: [0.4,1.0,0.4], orientation: [ { axis: [0,1,0], angle: Math.PI * 0.25} ] },
    ],
    children: [







      {
        // mid chest
        relativePosition: [0,0,0.6],
        lowerLimit: [0, Math.PI*-0.05, Math.PI*-0.1], // low to mid
        upperLimit: [0, Math.PI*+0.05, Math.PI*+0.1], // low to mid
        part: {
          id: BodyPartEnum.midChest,
          shapes: [
            // mid chest
            { position: [0,0,0.6], boxSize: [0.75,0.85,0.8] },
          ],
          children: [

            {
              // upper chest + shoulder
              relativePosition: [0,0,0.7],
              lowerLimit: [0, Math.PI*-0.05, Math.PI*-0.1], // mid to upper
              upperLimit: [0, Math.PI*+0.05, Math.PI*+0.1], // mid to upper
              part: {
                id: BodyPartEnum.upperChest,
                shapes: [
                  // upper chest
                  { position: [0,0,0.5], boxSize: [0.8,1.2,1.0] },
                  // shoulder
                  { position: [0,0,0.7], boxSize: [0.4,2.0,0.4], orientation: [ { axis: [0,1,0], angle: Math.PI * 0.25} ] },
                ],
                children: [







                  {
                    // neck
                    relativePosition: [0,0,1.0],
                    lowerLimit: [0, Math.PI*-0.05, Math.PI*-0.1], // neck base
                    upperLimit: [0, Math.PI*+0.05, Math.PI*+0.1], // neck base
                    part: {
                      id: BodyPartEnum.neck,
                      shapes: [
                        // neck
                        { position: [0,0,0.2], boxSize: [0.4,0.4,0.6] },
                      ],
                      children: [

                        {
                          // head
                          relativePosition: [0,0,0.6],
                          lowerLimit: [0, Math.PI*-0.2, Math.PI*-0.2], // head base
                          upperLimit: [0, Math.PI*+0.2, Math.PI*+0.1], // head base
                          part: {
                            id: BodyPartEnum.head,
                            shapes: [
                              // head
                              { position: [0.25,0,0], boxSize: [0.7,0.6,0.6] },
                            ],
                          }
                        }

                      ]
                    }
                  },







                  // arms

                  {
                    // left arm
                    relativePosition: [0,1,0.7],
                    lowerLimit: [0, Math.PI*-0.4, Math.PI*-0.4], // shoulder
                    upperLimit: [0, Math.PI*+0.4, Math.PI*+0.4], // shoulder
                    part: {
                      id: BodyPartEnum.leftArm,
                      shapes: [
                        // arm
                        { position: [0,0,-0.7], boxSize: [0.45,0.45,1.4] },
                      ],
                      children: [

                        {
                          // left forearm
                          relativePosition: [0,0,-1.4],
                          lowerLimit: [0, Math.PI*-0.75, Math.PI*-0.1], // elbow
                          upperLimit: [0, Math.PI*+0.00, Math.PI*+0.1], // elbow
                          part: {
                            id: BodyPartEnum.leftForearm,
                            shapes: [
                              // forearm
                              { position: [0,0,-0.7], boxSize: [0.3,0.3,1.4] },
                              // elbow guard
                              { position: [-0.3,0,-0.7*0.25], boxSize: [0.2,0.3,0.7] },
                            ],
                            children: [

                              {
                                // left hand
                                relativePosition: [0,0,-1.4],
                                lowerLimit: [0, Math.PI*-0.2, Math.PI*-0.2], // wrist
                                upperLimit: [0, Math.PI*+0.2, Math.PI*+0.2], // wrist
                                part: {
                                  id: BodyPartEnum.leftHand,
                                  shapes: [
                                    // hand
                                    { position: [0,0,-0.3], boxSize: [0.2,0.3,0.6] },
                                  ],
                                }
                              }

                            ]
                          }
                        }

                      ]
                    }
                  },






                  {
                    // right arm
                    relativePosition: [0,-1,0.7],
                    lowerLimit: [0, Math.PI*-0.4, Math.PI*-0.4], // shoulder
                    upperLimit: [0, Math.PI*+0.4, Math.PI*+0.4], // shoulder
                    part: {
                      id: BodyPartEnum.rightArm,
                      shapes: [
                        // arm
                        { position: [0,0,-0.7], boxSize: [0.45,0.45,1.4] },
                      ],
                      children: [

                        {
                          // right forearm
                          relativePosition: [0,0,-1.4],
                          lowerLimit: [0, Math.PI*-0.75, Math.PI*-0.1], // elbow
                          upperLimit: [0, Math.PI*+0.00, Math.PI*+0.1], // elbow
                          part: {
                            id: BodyPartEnum.rightForearm,
                            shapes: [
                              // forearm
                              { position: [0,0,-0.7], boxSize: [0.3,0.3,1.4] },
                              // elbow guard
                              { position: [-0.3,0,-0.7*0.25], boxSize: [0.2,0.3,0.7] },
                            ],
                            children: [

                              {
                                // right hand
                                relativePosition: [0,0,-1.4],
                                lowerLimit: [0, Math.PI*-0.2, Math.PI*-0.2], // wrist
                                upperLimit: [0, Math.PI*+0.2, Math.PI*+0.2], // wrist
                                part: {
                                  id: BodyPartEnum.rightHand,
                                  shapes: [
                                    // hand
                                    { position: [0,0,-0.3], boxSize: [0.2,0.3,0.6] },
                                  ],
                                }
                              }

                            ]
                          }
                        }

                      ]
                    }
                  },






                ]
              }
            }


          ]
        }
      },







      // legs

      {
        // left leg
        relativePosition: [0,0.5,0],
        lowerLimit: [0, Math.PI*-0.5, Math.PI*-0.2], // hip joint
        upperLimit: [0, Math.PI*+0.1, Math.PI*+0.2], // hip joint
        part: {
          id: BodyPartEnum.leftLeg,
          shapes: [
            { position: [0,0,-1], boxSize: [0.55,0.55,2.0] },
          ],
          children: [

            {
              // left foreleg
              relativePosition: [0,0,-2],
              lowerLimit: [0, Math.PI*-0.1, Math.PI*-0.1], // knee
              upperLimit: [0, Math.PI*+0.5, Math.PI*+0.1], // knee
              part: {
                id: BodyPartEnum.leftForeleg,
                shapes: [
                  { position: [0,0,-1], boxSize: [0.4,0.4,2.0] },
                  { position: [0.3,0,-0.25], boxSize: [0.2,0.4,1.0] }, // knee guard
                ],
                children: [

                  {
                    // left foot
                    relativePosition: [0,0,-2],
                    lowerLimit: [0, Math.PI*-0.1, Math.PI*-0.1], // ankle
                    upperLimit: [0, Math.PI*+0.1, Math.PI*+0.1], // ankle
                    part: {
                      id: BodyPartEnum.leftFoot,
                      shapes: [
                        { position: [0.4,0,0], boxSize: [0.9,0.4,0.4] },
                      ],
                    },
                  }

                ],
              },
            }

          ],
        },
      },







      {
        // right leg
        relativePosition: [0,-0.5,0],
        lowerLimit: [0, Math.PI*-0.5, Math.PI*-0.2], // hip joint
        upperLimit: [0, Math.PI*+0.1, Math.PI*+0.2], // hip joint
        part: {
          id: BodyPartEnum.rightLeg,
          shapes: [
            { position: [0,0,-1], boxSize: [0.55,0.55,2.0] },
          ],
          children: [

            {
              // right foreleg
              relativePosition: [0,0,-2],
              lowerLimit: [0, Math.PI*-0.1, Math.PI*-0.1], // knee
              upperLimit: [0, Math.PI*+0.5, Math.PI*+0.1], // knee
              part: {
                id: BodyPartEnum.rightForeleg,
                shapes: [
                  { position: [0,0,-1], boxSize: [0.4,0.4,2.0] },
                  { position: [0.3,0,-0.25], boxSize: [0.2,0.4,1.0] }, // knee guard
                ],
                children: [

                  {
                    // right foot
                    relativePosition: [0,0,-2],
                    lowerLimit: [0, Math.PI*-0.1, Math.PI*-0.1], // ankle
                    upperLimit: [0, Math.PI*+0.1, Math.PI*+0.1], // ankle
                    part: {
                      id: BodyPartEnum.rightFoot,
                      shapes: [
                        { position: [0.4,0,0], boxSize: [0.9,0.4,0.4] },
                      ],
                    },
                  }

                ],
              },
            }

          ],
        },
      }







    ]
  };

  const allBodies: physics.IPhysicBody[] = [];
  const allConstraints: physics.IGeneric6DofConstraint2[] = [];
  const mapOfBodies = new Map<number, physics.IPhysicBody>();

  class MyConstraintMap {
    private _internalMap = new Map<string, physics.IGeneric6DofConstraint2>();
    set(idA: number, idB: number, value: physics.IGeneric6DofConstraint2): void {
      this._internalMap.set(MyConstraintMap.getKey(idA, idB), value);
    }
    get(idA: number, idB: number): physics.IGeneric6DofConstraint2 | undefined {
      return this._internalMap.get(MyConstraintMap.getKey(idA, idB));
    }
    clear() {
      this._internalMap.clear();
    }
    static getKey(idA: number, idB: number): string {
      return [idA, idB].sort().join('-');
    }
  }

  const allConstraintsMap = new MyConstraintMap();

  const allMeshes: THREE.Object3D[] = [];

  const _buildPart = (
    rootPos: [number, number, number],
    scale: number,
    currPart: IBodyPart
  ): {
    body: physics.IPhysicBody,
    // mesh: THREE.Object3D,
  } => {

    const physicShape: physics.PrimitivesPhysicCompoundShapeDef = {
      type: 'compound',
      shapes: [],
    };
    currPart.shapes.forEach((currShape) => {

      const orientation = glm.quat.identity(glm.quat.create());
      currShape.orientation?.forEach((currVal) => {
        const subOrientation = glm.quat.setAxisAngle(glm.quat.create(), currVal.axis, currVal.angle);
        glm.quat.multiply(orientation, orientation, subOrientation);
      });

      physicShape.shapes.push({
        position: [
          currShape.position[0] * scale,
          currShape.position[1] * scale,
          currShape.position[2] * scale,
        ],
        orientation,
        shape: {
          type: 'box',
          size: [
            currShape.boxSize[0] * scale,
            currShape.boxSize[1] * scale,
            currShape.boxSize[2] * scale,
          ],
        },
      });
    });

    const bodyDef: physics.PhysicBodyDef = {
      mass: 0.5 * scale,
      shape: physicShape,
      position: rootPos,
      orientation: glm.quat.identity(glm.quat.create()),
      collisionFilterGroup: -1,
      collisionFilterMask: -1,
    };

    const physicBody = physicWorld.createRigidBody(bodyDef);

    allBodies.push(physicBody);
    mapOfBodies.set(currPart.id, physicBody);

    {
      const mainObj = new THREE.Object3D();

      currPart.shapes.forEach((currShape) => {

        const newGeo = makeCellShadedBoxGeometry([
          currShape.boxSize[0] * scale,
          currShape.boxSize[1] * scale,
          currShape.boxSize[2] * scale,
        ], material, 0.05);

        currShape.orientation?.forEach((currVal) => {
          if (currVal.axis[0] !== 0) {
            newGeo.rotateX(currVal.angle);
          } else if (currVal.axis[1] !== 0) {
            newGeo.rotateY(currVal.angle);
          } else if (currVal.axis[2] !== 0) {
            newGeo.rotateZ(currVal.angle);
          }
        });

        newGeo.position.set(
          currShape.position[0] * scale,
          currShape.position[1] * scale,
          currShape.position[2] * scale,
        );

        mainObj.add(newGeo);
      });

      scene.add(mainObj);

      allMeshes.push(mainObj);

      syncList.push({ body: physicBody, mesh: mainObj });
    }


    currPart.children?.forEach((currChild) => {

      const childPos: [number, number, number] = [
        rootPos[0] + currChild.relativePosition[0] * scale,
        rootPos[1] + currChild.relativePosition[1] * scale,
        rootPos[2] + currChild.relativePosition[2] * scale,
      ];

      const childPart = _buildPart(childPos, scale, currChild.part);

      const newConstraint = physicWorld.createGeneric6DofConstraint2({
        bodyA: physicBody,
        bodyB: childPart.body,
        frameA: [
          currChild.relativePosition[0] * scale,
          currChild.relativePosition[1] * scale,
          currChild.relativePosition[2] * scale,
        ],
        frameB: [0,0,0],
        rotationOrder: physics.RotationOrder.YZX,
      });
      newConstraint.setLinearLowerLimit([0,0,0]);
      newConstraint.setLinearUpperLimit([0,0,0]);
      newConstraint.setAngularLowerLimit(currChild.lowerLimit);
      newConstraint.setAngularUpperLimit(currChild.upperLimit);

      allConstraints.push(newConstraint);
      allConstraintsMap.set(currPart.id, currChild.part.id, newConstraint);
    });

    return { body: physicBody };
  };

  const k_scale = 1.5;
  _buildPart([0,0,0], k_scale, rootPart);

  const _applyTransformToBodies = (toTransform: glm.ReadonlyMat4): void => {

    const toRotateMat3 = glm.mat3.fromMat4(glm.mat3.create(), toTransform);
    const toRotate = glm.quat.fromMat3(glm.quat.create(), toRotateMat3);

    const tmpPos = glm.vec3.create();
    const tmpQuat = glm.quat.create();

    for (const currBody of allBodies) {

      currBody.getPositionAndRotation(tmpPos, tmpQuat);

      glm.vec3.transformMat4(tmpPos, tmpPos, toTransform);
      glm.quat.multiply(tmpQuat, tmpQuat, toRotate);

      currBody.setPositionAndRotation(tmpPos, tmpQuat);
    }
  };

  const toTransform = glm.mat4.identity(glm.mat4.create());
  glm.mat4.translate(toTransform, toTransform, origin);
  glm.mat4.rotateZ(toTransform, toTransform, Math.PI * -1.5);
  // glm.mat4.rotateY(toTransform, toTransform, Math.PI * -0.7);

  _applyTransformToBodies(toTransform);



  return {
    simulateHeadShot: (): glm.vec3 => {
      const head = mapOfBodies.get(BodyPartEnum.head)!;
      head.applyCentralImpulse(0, -100, 0);
      return head.getPosition();
    },
    dispose: () => {
      syncList.length = 0;

      mapOfBodies.clear();
      allConstraintsMap.clear();

      allBodies.forEach(val => physicWorld.destroyRigidBody(val));
      allBodies.length = 0;

      allConstraints.forEach(val => physicWorld.destroyGeneric6DofConstraint2(val));
      allConstraints.length = 0;

      allMeshes.forEach(val => scene.remove(val));
      allMeshes.length = 0;
    },
    update: () => {
      for (const currSync of syncList) {
        syncMeshWithRigidBody(currSync.mesh, currSync.body);
      }
    },
  }
};



export function renderRagDollWithDynamicConstrainedBox(
  scene: THREE.Scene,
  physicWorld: physics.PhysicWorld,
): (deltaSec: number) => void {

  //
  //
  //

  const k_origin: glm.ReadonlyVec3 = [+15,-15,10];

  //
  //
  //

  const syncList: { body: physics.IPhysicBody; mesh: THREE.Object3D }[] = [];

  const material = getTextureMaterial2();

  {
    const bodyStaticGround = physicWorld.createRigidBody({
      mass: 0,
      shape: { type: 'box', size: [10,10,1] },
      position: [k_origin[0]-0,k_origin[1]-7,k_origin[2] - 2],
      orientation: glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.5*Math.PI),
    });
    bodyStaticGround.setFriction(1.0);

    const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material, 0.05);
    scene.add( boxMeshStaticGround );

    syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });
  }

  {
    const bodyStaticGround = physicWorld.createRigidBody({
      mass: 0,
      shape: { type: 'box', size: [10,10,1] },
      position: [k_origin[0]-0,k_origin[1]-2,k_origin[2] - 10],
      orientation: glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.15*Math.PI),
    });
    bodyStaticGround.setFriction(1.0);

    const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material, 0.05);
    scene.add( boxMeshStaticGround );

    syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });
  }

  //
  //
  //

  const _makeHeadShotTrail = (headPos: glm.ReadonlyVec3): { object: THREE.Object3D, material: THREE.LineBasicMaterial } => {
    const material = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
    });

    const points: THREE.Vector3[] = [];
    points.push( new THREE.Vector3( headPos[0], headPos[1], headPos[2] ) );
    points.push( new THREE.Vector3( headPos[0], headPos[1] + 1000, headPos[2] ) );

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    const line = new THREE.Line( geometry, material );
    // scene.add( line );
    return { object: line, material };
  }


  //
  //
  //

  let ragDoll = _createHumanoidRagDoll(scene, physicWorld, k_origin);

  //
  //
  //

  let timeToRagDollReset = 10; // reset rag-doll in 10sec
  let timeToRagDollHeadShot = 1.25; // simulate head shot in 2sec
  let timeToTrailRemoval = 0;

  let trailGraphicObject: { object: THREE.Object3D, material: THREE.LineBasicMaterial } | undefined;

  return function syncDynamicBoxMesh(deltaSec: number) {

    //
    //
    //

    if (timeToRagDollReset > 0) {
      timeToRagDollReset -= deltaSec;
    }
    if (timeToRagDollReset < 0) {
      timeToRagDollReset = 10; // reset rag-doll in 10sec
      timeToRagDollHeadShot = 1.25; // simulate head shot in 2sec
      timeToTrailRemoval = 0;

      // reset the humanoid rag-doll
      ragDoll.dispose();
      ragDoll = _createHumanoidRagDoll(scene, physicWorld, k_origin);
    }

    //
    //
    //

    if (timeToRagDollHeadShot > 0) {
      timeToRagDollHeadShot -= deltaSec;
    }
    if (timeToRagDollHeadShot < 0) {
      timeToRagDollHeadShot = 0;

      const headPos = ragDoll.simulateHeadShot();

      // show fake shot trail
      trailGraphicObject = _makeHeadShotTrail(headPos);
      scene.add(trailGraphicObject.object);

      timeToTrailRemoval = 1;
    }

    //
    //
    //

    if (timeToTrailRemoval > 0) {
      timeToTrailRemoval -= deltaSec;



      if (trailGraphicObject) {
        // 1sec -> 0sec
        trailGraphicObject.material.opacity = timeToTrailRemoval;
      }
    }
    if (timeToTrailRemoval < 0) {
      timeToTrailRemoval = 0;

      if (trailGraphicObject) {
        scene.remove(trailGraphicObject.object);
      }
    }

    //
    //
    //

    // update the humanoid rag-doll
    ragDoll.update();

    for (const currSync of syncList) {
      syncMeshWithRigidBody(currSync.mesh, currSync.body);
    }
  };
}
