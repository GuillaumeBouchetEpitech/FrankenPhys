
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getTextureMaterial } from "./getTextureMaterial";
import { syncMeshWithRigidBody } from "./syncMeshWithRigidBody";


export function renderDynamicPyramid(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const vertices: glm.vec3[] = [
    glm.vec3.fromValues(-1,-2, 0),
    glm.vec3.fromValues(-1,+2, 0),
    glm.vec3.fromValues(+3, 0, 0),
    glm.vec3.fromValues( 0, 0, +3),
  ];

  const indices: glm.ReadonlyVec3[] = [
    glm.vec3.fromValues(0, 1, 2),
    glm.vec3.fromValues(1, 0, 3),
    glm.vec3.fromValues(2, 1, 3),
    glm.vec3.fromValues(2, 3, 0),
  ];

  const body = physicWorld.createRigidBody({
    mass: 10,
    shape: {
      type: 'mesh',
      triangles: indices.map((triIndex) => {
        return [
          vertices[triIndex[0]],
          vertices[triIndex[1]],
          vertices[triIndex[2]]
        ]
      }).map(val => ([val[0], val[1], val[2]])),
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1]
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  const redMaterial = new THREE.MeshBasicMaterial( { color: 0x66066 } );

  const pyGeometry = new THREE.BufferGeometry();

  const geoVertices = new Float32Array(vertices.map(val => ([val[0], val[1], val[2]])).flat());

  pyGeometry.setIndex(indices.map(val => ([val[0], val[1], val[2]])).flat());
  pyGeometry.setAttribute('position', new THREE.BufferAttribute(geoVertices, 3));

  const mesh = new THREE.Mesh(pyGeometry, redMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicPyramidMesh() {
    syncMeshWithRigidBody(mesh, body);
  }
}
