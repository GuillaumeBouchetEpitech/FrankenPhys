
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial2, getBackSideMaterial } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";



export function renderRagDollWithDynamicConstrainedBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {


  const syncList: { body: physics.IPhysicBody; mesh: THREE.Object3D }[] = [];

  const material = getTextureMaterial2();



  // const k_origin: glm.ReadonlyVec3 = [+18,-15,10];
  const k_origin: glm.ReadonlyVec3 = [+15,-15,10];



  const bodyStaticGround = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [10,10,1]
    },
    position: [k_origin[0]-0,k_origin[1]-2,k_origin[2] - 8],
    orientation: glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.15*Math.PI),
  });
  bodyStaticGround.setFriction(1.0);

  // const geometryStaticGround = new THREE.BoxGeometry( 10.0, 10.0, 1.0 );

  // const boxMeshStaticGround = new THREE.Mesh( geometryStaticGround, material );
  // boxMeshStaticGround.castShadow = true;
  // boxMeshStaticGround.receiveShadow = true;
  // const boxMeshStaticGround = makeCellShadedGeometry(geometryStaticGround, material, 0.02);
  const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material, 0.05);
  scene.add( boxMeshStaticGround );

  syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });






  interface IBodyPart {
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

    {
      const mainObj = new THREE.Object3D();

      currPart.shapes.forEach((currShape) => {

        // const newGeo = new THREE.BoxGeometry(
        //   currShape.boxSize[0] * scale,
        //   currShape.boxSize[1] * scale,
        //   currShape.boxSize[2] * scale,
        // );
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

        // newGeo.translate(
        //   currShape.position[0] * scale,
        //   currShape.position[1] * scale,
        //   currShape.position[2] * scale,
        // );
        newGeo.position.set(
          currShape.position[0] * scale,
          currShape.position[1] * scale,
          currShape.position[2] * scale,
        );

        // const newObj = makeCellShadedGeometry(newGeo, material, 0.04);
        // mainObj.add(newObj);
        mainObj.add(newGeo);
      });

      scene.add(mainObj);

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
    });

    return { body: physicBody };
  };

  _buildPart([0,0,0], 2, rootPart);


  const toTransform = glm.mat4.identity(glm.mat4.create());
  // glm.mat4.translate(toTransform, toTransform, [+18,-5,10]);
  glm.mat4.translate(toTransform, toTransform, k_origin);
  glm.mat4.rotateZ(toTransform, toTransform, Math.PI * -1.5);
  // glm.mat4.rotateY(toTransform, toTransform, Math.PI * -0.7);

  const toRotateMat3 = glm.mat3.fromMat4(glm.mat3.create(), toTransform);
  const toRotate = glm.quat.fromMat3(glm.quat.create(), toRotateMat3);

  for (const currBody of allBodies) {

    const pos = glm.vec3.create();
    const quat = glm.quat.create();
    currBody.getPositionAndRotation(pos, quat);

    glm.vec3.transformMat4(pos, pos, toTransform);
    glm.quat.multiply(quat, quat, toRotate);

    currBody.setPositionAndRotation(pos, quat);
  }

  //
  //
  //

  //
  //
  //

  return function syncDynamicBoxMesh() {
    for (const currSync of syncList) {
      syncMeshWithRigidBody(currSync.mesh, currSync.body);
    }
  }
}
