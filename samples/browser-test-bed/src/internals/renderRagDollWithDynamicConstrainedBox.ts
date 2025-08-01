
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial2, getBackSideMaterial2 } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


import * as easing from "./utilities/easing";



// skelton body (dynamic, static, inherited quat)
// -> set body (static/dynamic), inherit quat values


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

interface ISkeletonBone {
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
    part: ISkeletonBone;
  }[];
};

interface InternalBone {
  id: number;
  parent?: InternalBone;
  children: InternalBone[];

  // part: ISkeletonBone;
  relPos: glm.vec3;

  // isDirty: boolean;
  relQuat?: glm.ReadonlyQuat;

  body: physics.IPhysicBody;
  mesh: THREE.Object3D;
};

class MySkeleton {

  private _rootPart: ISkeletonBone;

  private _allBones: InternalBone[] = [];
  private _bonesById = new Map<number, InternalBone>();

  private _allConstraints: physics.IGeneric6DofConstraint2[] = [];

  private _scale: number = 1;
  private _isDynamic: boolean = false;

  constructor(currPart: ISkeletonBone) {
    this._rootPart = {...currPart};
  }

  build(
    scene: THREE.Scene,
    physicWorld: physics.PhysicWorld,
    isDynamic: boolean,
    inScale: number,
  ): void {

    this._scale = inScale;

    if (this._allBones.length > 0) {

      const newSkelly = new MySkeleton(this._rootPart);
      newSkelly.build(scene, physicWorld, isDynamic, this._scale);

      // sync pos+quat
      {
        const tmpPos = glm.vec3.create();
        const tmpQuat = glm.quat.create();
        for (let ii = 0; ii < this._allBones.length; ++ii) {
          const oldBone = this._allBones[ii];
          const newBone = newSkelly._allBones[ii];

          oldBone.body.getPositionAndRotation(tmpPos, tmpQuat);
          newBone.body.setPositionAndRotation(tmpPos, tmpQuat);
        }
      }

      this.dispose(scene, physicWorld);

      // replace by newSkelly internal data

      this._allBones = newSkelly._allBones;
      this._bonesById = newSkelly._bonesById;

      this._allConstraints = newSkelly._allConstraints;

      this._scale = newSkelly._scale;
      this._isDynamic = newSkelly._isDynamic;

      return;
    }

    this.dispose(scene, physicWorld);

    this._isDynamic = isDynamic;

    const material = getTextureMaterial2();

    const backSideMaterial2 = getBackSideMaterial2();

    const _recursiveBuildBone = (
      rootPos: glm.ReadonlyVec3,
      scale: number,
      currPart: ISkeletonBone,
      parentBone: InternalBone | null,
    ): InternalBone => {

      let physicBody: physics.IPhysicBody | undefined;

      { // physic part

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
          mass: (isDynamic ? 0.5 * scale : 0),
          shape: physicShape,
          position: rootPos,
          orientation: glm.quat.identity(glm.quat.create()),
          collisionFilterGroup: -1,
          collisionFilterMask: -1,
        };

        physicBody = physicWorld.createRigidBody(bodyDef);

      } // physic part

      const mainObj = new THREE.Object3D();

      { // graphic part

        currPart.shapes.forEach((currShape) => {

          const newGeo = makeCellShadedBoxGeometry([
            currShape.boxSize[0] * scale,
            currShape.boxSize[1] * scale,
            currShape.boxSize[2] * scale,
          ], material, backSideMaterial2);

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

      } // graphic part

      const newBone: InternalBone = {
        id: currPart.id,
        children: [],
        // part: currPart,
        relPos: [0,0,0],
        body: physicBody,
        mesh: mainObj,
      };
      this._allBones.push(newBone);
      this._bonesById.set(newBone.id, newBone);

      if (parentBone) {
        newBone.parent = parentBone;
        parentBone.children.push(newBone);
      }

      currPart.children?.forEach((currChild) => {

        const childPos: glm.ReadonlyVec3 = [
          rootPos[0] + currChild.relativePosition[0] * scale,
          rootPos[1] + currChild.relativePosition[1] * scale,
          rootPos[2] + currChild.relativePosition[2] * scale,
        ];

        const childBone = _recursiveBuildBone(childPos, scale, currChild.part, newBone);

        childBone.relPos = glm.vec3.clone(currChild.relativePosition);

        const newConstraint = physicWorld.createGeneric6DofConstraint2({
          bodyA: physicBody,
          bodyB: childBone.body,
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

        this._allConstraints.push(newConstraint);
      });

      return newBone;
    };

    _recursiveBuildBone([0,0,0], this._scale, this._rootPart, null);

  }

  dispose(
    scene: THREE.Scene,
    physicWorld: physics.PhysicWorld,
  ): void {

    this._bonesById.clear();

    this._allBones.forEach(val => {
      physicWorld.destroyRigidBody(val.body);
      scene.remove(val.mesh);
    });
    this._allBones.length = 0;

    this._allConstraints.forEach(val => physicWorld.destroyGeneric6DofConstraint2(val));
    this._allConstraints.length = 0;
  }

  update(): void {
    for (const currSync of this._allBones) {
      syncMeshWithRigidBody(currSync.mesh, currSync.body);
    }
  }

  applyTransformGlobally(toTransform: glm.ReadonlyMat4): void {

    const toRotateMat3 = glm.mat3.fromMat4(glm.mat3.create(), toTransform);
    const toRotate = glm.quat.fromMat3(glm.quat.create(), toRotateMat3);

    const tmpPos = glm.vec3.create();
    const tmpQuat = glm.quat.create();

    for (const currBody of this._allBones) {

      currBody.body.getPositionAndRotation(tmpPos, tmpQuat);

      glm.vec3.transformMat4(tmpPos, tmpPos, toTransform);
      glm.quat.multiply(tmpQuat, tmpQuat, toRotate);

      currBody.body.setPositionAndRotation(tmpPos, tmpQuat);
    }
  }

  setRelativeQuat(id: number, quat: glm.ReadonlyQuat) {
    if (this._isDynamic) {
      return;
    }

    const currBone = this._bonesById.get(id);
    if (!currBone) {
      throw new Error(`id not found '${id}'`);
    }

    currBone.relQuat = glm.quat.clone(quat);
  }

  applyQuatToBone(
    inBone: InternalBone,
    inDestQuat: glm.ReadonlyQuat,
  ): void {

    const parentPos = glm.vec3.fromValues(0,0,0);
    const parentQuat = glm.quat.identity(glm.quat.create());
    const currPos = glm.vec3.fromValues(0,0,0);
    const currQuat = glm.quat.identity(glm.quat.create());

    if (inBone.parent) {
      inBone.parent.body.getPositionAndRotation(parentPos, parentQuat);
    } else {
      inBone.body.getPositionAndRotation(parentPos, parentQuat);
    }

    glm.quat.mul(currQuat, parentQuat, inDestQuat);

    currPos[0] = inBone.relPos[0] * this._scale;
    currPos[1] = inBone.relPos[1] * this._scale;
    currPos[2] = inBone.relPos[2] * this._scale;
    glm.vec3.transformQuat(currPos, currPos, parentQuat);

    glm.vec3.add(currPos, parentPos, currPos);

    inBone.body.setPositionAndRotation(currPos, currQuat);
  };


  applyAllRelativeQuads() {

    if (
      this._allBones.length === 0 ||
      this._isDynamic
    ) {
      return;
    }

    //

    const identityQuat = glm.quat.identity(glm.quat.create());

    const _processBone = (inBone: InternalBone) => {

      this.applyQuatToBone(inBone, inBone.relQuat ?? identityQuat);

      for (const childBone of inBone.children) {
        _processBone(childBone);
      }
    };

    _processBone(this._allBones[0]);
  }

  getBoneById(id: number): InternalBone | undefined {
    return this._bonesById.get(id);
  }

  isDynamic(): boolean {
    return this._isDynamic;
  }

  getScale(): number {
    return this._scale;
  }

};














const k_SkeletonRootBone: ISkeletonBone = {
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

















const _createHumanoidRagDoll = (
  scene: THREE.Scene,
  physicWorld: physics.PhysicWorld,
  origin: glm.ReadonlyVec3,
): {
  simulateHeadShot: () => glm.vec3,
  dispose: () => void,
  update: (deltaSec: number) => void,
} => {

  const mySkeleton = new MySkeleton(k_SkeletonRootBone);

  mySkeleton.build(scene, physicWorld, false, 1.5);

  {
    const toTransform = glm.mat4.identity(glm.mat4.create());
    glm.mat4.translate(toTransform, toTransform, origin);
    glm.mat4.rotateZ(toTransform, toTransform, Math.PI * +0.25);
    // glm.mat4.rotateY(toTransform, toTransform, Math.PI * -0.7);

    mySkeleton.applyTransformGlobally(toTransform);
  }


  let continuousTime: number = 0;

  return {
    simulateHeadShot: (): glm.vec3 => {

      // rebuild as dynamic
      mySkeleton.build(scene, physicWorld, true, 1.5);

      const head = mySkeleton.getBoneById(BodyPartEnum.head)!;
      head.body.applyCentralImpulse(-75, -75, 0);
      return head.body.getPosition();
    },
    dispose: () => {
      mySkeleton.dispose(scene, physicWorld);
    },
    update: (deltaSec: number) => {

      continuousTime += deltaSec;

      if (!mySkeleton.isDynamic()) {

        const timeRatio1 = easing.easeInOutSine(easing.easePinPong(easing.easeClamp(continuousTime * 0.7)));
        const timeRatio2 = easing.easeInOutSine(easing.easePinPong(easing.easeClamp(0.5+continuousTime * 0.7)));

        // animate

        const getQuat = (axis: glm.ReadonlyVec3, value: number) => glm.quat.setAxisAngle(glm.quat.create(), axis, Math.PI * value);

        mySkeleton.setRelativeQuat(BodyPartEnum.leftLeg, getQuat([0,1,0], -0.25 + 0.25 * timeRatio1));
        mySkeleton.setRelativeQuat(BodyPartEnum.leftForeleg, getQuat([0,1,0], +0.125 + 0.25 * timeRatio1));

        mySkeleton.setRelativeQuat(BodyPartEnum.rightLeg, getQuat([0,1,0], -0.25 + 0.25 * timeRatio2));
        mySkeleton.setRelativeQuat(BodyPartEnum.rightForeleg, getQuat([0,1,0], +0.125 + 0.25 * timeRatio2));

        mySkeleton.setRelativeQuat(BodyPartEnum.leftArm, getQuat([0,1,0], -0.125+0.25 * timeRatio2));
        mySkeleton.setRelativeQuat(BodyPartEnum.leftForearm, getQuat([0,1,0], -0.125+0.125 * timeRatio2));

        mySkeleton.setRelativeQuat(BodyPartEnum.rightArm, getQuat([0,1,0], -0.125+0.25 * timeRatio1));
        mySkeleton.setRelativeQuat(BodyPartEnum.rightForearm, getQuat([0,1,0], -0.125+0.125 * timeRatio1));

        mySkeleton.applyAllRelativeQuads();
      }


      mySkeleton.update();
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

  const k_origin: glm.ReadonlyVec3 = [+12,-15,7];

  //
  //
  //

  const syncList: { body: physics.IPhysicBody; mesh: THREE.Object3D }[] = [];

  const material = getTextureMaterial2();

  { // back wall
    const bodyStaticGround = physicWorld.createRigidBody({
      mass: 0,
      shape: { type: 'box', size: [10,10,1] },
      position: [k_origin[0]-4,k_origin[1]-4,k_origin[2] - 2+3],
      orientation: glm.quat.mul(
        glm.quat.create(),
        glm.quat.setAxisAngle(glm.quat.create(), [0,0,1], -0.25*Math.PI),
        glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.5*Math.PI),
      ),
    });
    bodyStaticGround.setFriction(1.0);

    const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material);
    scene.add( boxMeshStaticGround );

    syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });
  } // back wall

  { // bent ground
    const bodyStaticGround = physicWorld.createRigidBody({
      mass: 0,
      shape: { type: 'box', size: [10,10,1] },
      position: [k_origin[0]-1,k_origin[1]-1,k_origin[2] - 10+3],
      // orientation: glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.15*Math.PI),
      orientation: glm.quat.mul(
        glm.quat.create(),
        glm.quat.setAxisAngle(glm.quat.create(), [0,0,1], -0.25*Math.PI),
        glm.quat.setAxisAngle(glm.quat.create(), [1,0,0], -0.15*Math.PI),
      ),
    });
    bodyStaticGround.setFriction(1.0);

    const boxMeshStaticGround = makeCellShadedBoxGeometry([10.0, 10.0, 1.0], material);
    scene.add( boxMeshStaticGround );

    syncList.push({ body: bodyStaticGround, mesh: boxMeshStaticGround });
  } // bent ground

  //
  //
  //

  const _makeHeadShotTrail = (headPos: glm.ReadonlyVec3): { object: THREE.Object3D, material: THREE.LineBasicMaterial } => {
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
    });

    const points: THREE.Vector3[] = [];
    points.push( new THREE.Vector3( headPos[0], headPos[1], headPos[2] ) );
    points.push( new THREE.Vector3( headPos[0] + 1000, headPos[1] + 1000, headPos[2] ) );

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
  let timeToRagDollHeadShot = 2.0; // simulate head shot in 2sec
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
      timeToRagDollHeadShot = 2.0; // simulate head shot in 2sec
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
    ragDoll.update(deltaSec);

    for (const currSync of syncList) {
      syncMeshWithRigidBody(currSync.mesh, currSync.body);
    }
  };
}
