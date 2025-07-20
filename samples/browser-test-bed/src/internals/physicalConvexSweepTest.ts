
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


export function physicalConvexSweepTest(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const maxContact = 10;

  const radius = 0.5;

  const geometry = new THREE.SphereGeometry(radius);
  const contactMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new THREE.InstancedMesh( geometry, contactMaterial, maxContact );
  mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add( mesh );

  const dummy = new THREE.Object3D();

  return function() {

    for (let ii = 0; ii < 10; ++ii) {

      const from = glm.vec3.fromValues(8, ii - 5, +5);
      const to = glm.vec3.fromValues(8, ii - 5, -15);

      const result = physicWorld.convexSweep(from, to, radius);

      if (!result) {
        dummy.position.set(to[0], to[1], to[2]);
      } else {

        const resultPos = glm.vec3.fromValues(
          result.impact[0]+result.normal[0]*radius,
          result.impact[1]+result.normal[1]*radius,
          result.impact[2]+result.normal[2]*radius,
        );

        dummy.position.set(resultPos[0], resultPos[1], resultPos[2]);
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(ii, dummy.matrix);
    }

    mesh.count = 10;
    mesh.instanceMatrix.needsUpdate = true;

  }

}

