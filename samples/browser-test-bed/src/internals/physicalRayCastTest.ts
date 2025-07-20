
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


export function physicalRayCastTest(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const maxContact = 10;

  const geometry = new THREE.BoxGeometry( 0.35, 0.35, 0.35 );
  const contactMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.InstancedMesh( geometry, contactMaterial, maxContact );
  mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add( mesh );

  const dummy = new THREE.Object3D();

  return function() {

    for (let ii = 0; ii < 10; ++ii) {

      const from = glm.vec3.fromValues(6, ii - 5, +10);
      const to = glm.vec3.fromValues(6, ii - 5, -10);

      const result = physicWorld.rayCast(from, to);

      if (!result) {
        dummy.position.set(to[0], to[1], to[2]);
      } else {
        dummy.position.set(result.impact[0], result.impact[1], result.impact[2]);
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(ii, dummy.matrix);
    }

    mesh.count = 10;
    mesh.instanceMatrix.needsUpdate = true;

  }

}

