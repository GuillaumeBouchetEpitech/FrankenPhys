
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";

import { getTextureMaterial } from "./getTextureMaterial";
import { makeCellShadedBoxGeometry, makeCellShadedCylinderGeometry, makeCellShadedGeometry } from "./makeCellShadedGeometry";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderVehicle(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const vehicleDef: physics.PhysicVehicleDef = {
    chassisDef: {
      mass: 20,
      shape: {
        type: 'box',
        size: [2,4,1] // X is right, Y is forward, Z is up
      },
      position: [3,0,3],
      orientation: [0, 0,0,1]
    },

    coordinateSystem: [
      0, // X as X => right index
      2, // Y as Z => up index
      1, // Z as Y => forward index
    ],

    groundDirection: [0,0,-1], // downward Z axis
    rotationAxis: [1,0,0], // wheel X axis
    wheelRadius: 0.75,
    wheelWidth: 0.5,
    suspensionRestLength: 0.6, // meters

    wheelFriction: 1000, // kart racing friction (highest)
    suspensionStiffness: 20, // centimeters
    wheelsDampingCompression: 4.4, // meters
    wheelsDampingRelaxation: 2.3, // meters
    rollInfluence: 0.01, // range is [0..1], from "no-roll" to "realistic"

    wheels: [
      {
        connectionPoint: [-1.25, +1.7, 0.2],
        isFrontWheel: true,
      },
      {
        connectionPoint: [+1.25, +1.7, 0.2],
        isFrontWheel: true,
      },
      {
        connectionPoint: [+1.25, -1.7, 0.2],
        isFrontWheel: false,
      },
      {
        isFrontWheel: false,
        connectionPoint: [-1.25, -1.7, 0.2],
      },
    ],
  };

  const dynamicVehicle = physicWorld.createVehicle(vehicleDef);

  const steeringAngle = Math.PI / 6;

  dynamicVehicle.setSteeringValue(0, steeringAngle); // front wheel
  dynamicVehicle.setSteeringValue(1, steeringAngle); // front wheel
  dynamicVehicle.applyEngineForce(2, 40); // rear wheel
  dynamicVehicle.applyEngineForce(3, 40); // rear wheel

  const material = getTextureMaterial();

  const vehicleMesh = makeCellShadedBoxGeometry([2.0, 4.0, 1.0], material);
  scene.add( vehicleMesh );

  const wheelsMesh: THREE.Object3D[] = [];
  {
    for (let ii = 0; ii < vehicleDef.wheels.length; ++ii) {

      const wheelGeometry = makeCellShadedCylinderGeometry(vehicleDef.wheelRadius, vehicleDef.wheelRadius, vehicleDef.wheelWidth, 20, 1, material);
      wheelGeometry.children.forEach((childGeo) => {
        childGeo.rotateZ(Math.PI * 0.5);
      })

      scene.add( wheelGeometry );
      wheelsMesh.push(wheelGeometry);
    }

  }

  const tmpQuat = new THREE.Quaternion(0,0,0,1);

  return function syncVehicle() {

    syncMeshWithRigidBody(vehicleMesh, dynamicVehicle.getChassisBody());

    const allTransforms = dynamicVehicle.getWheeTransforms();

    allTransforms.forEach(({ position, rotation }, index) => {

      tmpQuat.set(rotation[0], rotation[1], rotation[2], rotation[3]);

      wheelsMesh[index].position.set(position[0], position[1], position[2]);
      wheelsMesh[index].rotation.setFromQuaternion(tmpQuat);
    });
  }

}

