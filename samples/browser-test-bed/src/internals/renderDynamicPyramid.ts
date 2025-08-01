
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";


import { getBackSideMaterial3 } from "./getTextureMaterial";
import { makeCellShadedGeometry } from "./makeCellShadedGeometry";
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
    orientation: glm.quat.setAxisAngle(glm.quat.create(), [0,1,0], Math.PI * 0.5),
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  const redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF00FF });

  const pyGeometry = new THREE.BufferGeometry();

  const rawVertices: number[] = [];
  const rawNormals: number[] = [];
  indices.forEach((triIndex) => {
    rawVertices.push(vertices[triIndex[0]][0]);
    rawVertices.push(vertices[triIndex[0]][1]);
    rawVertices.push(vertices[triIndex[0]][2]);
    rawVertices.push(vertices[triIndex[1]][0]);
    rawVertices.push(vertices[triIndex[1]][1]);
    rawVertices.push(vertices[triIndex[1]][2]);
    rawVertices.push(vertices[triIndex[2]][0]);
    rawVertices.push(vertices[triIndex[2]][1]);
    rawVertices.push(vertices[triIndex[2]][2]);

    const diff1 = glm.vec3.sub(glm.vec3.create(), vertices[triIndex[0]], vertices[triIndex[1]]);
    const diff2 = glm.vec3.sub(glm.vec3.create(), vertices[triIndex[0]], vertices[triIndex[2]]);
    const normal = glm.vec3.cross(glm.vec3.create(), diff1, diff2);

    rawNormals.push(normal[0]);
    rawNormals.push(normal[1]);
    rawNormals.push(normal[2]);
    rawNormals.push(normal[0]);
    rawNormals.push(normal[1]);
    rawNormals.push(normal[2]);
    rawNormals.push(normal[0]);
    rawNormals.push(normal[1]);
    rawNormals.push(normal[2]);
  })
  const geoVertices = new Float32Array(rawVertices);
  const geoNormal = new Float32Array(rawNormals);

  // pyGeometry.setIndex(indices.map(val => ([val[0], val[1], val[2]])).flat());
  pyGeometry.setAttribute('position', new THREE.BufferAttribute(geoVertices, 3));
  pyGeometry.setAttribute('normal', new THREE.BufferAttribute(geoNormal, 3));

  const backSideMaterial3 = getBackSideMaterial3();
  const mesh = makeCellShadedGeometry(pyGeometry, redMaterial, backSideMaterial3);
  scene.add( mesh );

  return function syncDynamicPyramidMesh() {
    syncMeshWithRigidBody(mesh, body);
  }
}
