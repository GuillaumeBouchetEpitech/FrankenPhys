
import * as THREE from "three";

import { getBackSideMaterial } from "./getTextureMaterial";

export const makeCellShadedBoxGeometry = (
  boxSize: [number, number, number],
  material: THREE.Material,
  backMaterial?: THREE.Material,
): THREE.Object3D => {

  if (!backMaterial) {
    backMaterial = getBackSideMaterial();
  }

  const frontGeo = new THREE.BoxGeometry(boxSize[0] - 0.05, boxSize[1] - 0.05, boxSize[2] - 0.05);
  const backGeo = new THREE.BoxGeometry(boxSize[0], boxSize[1], boxSize[2]);

  const object = new THREE.Object3D();

  const mesh = new THREE.Mesh(frontGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  object.add(mesh);

  const backMesh = new THREE.Mesh(backGeo, backMaterial);
  backMesh.castShadow = false;
  backMesh.receiveShadow = false;
  object.add(backMesh);

  return object;
}

export const makeCellShadedSphereGeometry = (
  radius: number,
  material: THREE.Material,
  backMaterial?: THREE.Material,
): THREE.Object3D => {

  if (!backMaterial) {
    backMaterial = getBackSideMaterial();
  }

  const frontGeo = new THREE.SphereGeometry(radius - 0.05);
  const backGeo = new THREE.SphereGeometry(radius);

  const object = new THREE.Object3D();

  const mesh = new THREE.Mesh(frontGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  object.add(mesh);

  const backMesh = new THREE.Mesh(backGeo, backMaterial);
  backMesh.castShadow = false;
  backMesh.receiveShadow = false;
  object.add(backMesh);

  return object;
}

export const makeCellShadedCapsuleGeometry = (
  radius: number,
  length: number,
  capSegments: number,
  radialSegments: number,
  material: THREE.Material,
  backMaterial?: THREE.Material,
): THREE.Object3D => {

  if (!backMaterial) {
    backMaterial = getBackSideMaterial();
  }

  const frontGeo = new THREE.CapsuleGeometry(radius - 0.05, length - 0.05, capSegments, radialSegments);
  const backGeo = new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments);

  const object = new THREE.Object3D();

  const mesh = new THREE.Mesh(frontGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  object.add(mesh);

  const backMesh = new THREE.Mesh(backGeo, backMaterial);
  backMesh.castShadow = false;
  backMesh.receiveShadow = false;
  object.add(backMesh);

  return object;
}

export const makeCellShadedCylinderGeometry = (
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number,
  heightSegments: number,
  material: THREE.Material,
  backMaterial?: THREE.Material,
): THREE.Object3D => {

  if (!backMaterial) {
    backMaterial = getBackSideMaterial();
  }

  const frontGeo = new THREE.CylinderGeometry(radiusTop - 0.05, radiusBottom - 0.05, height - 0.05, radialSegments, heightSegments);
  const backGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments);

  const object = new THREE.Object3D();

  const mesh = new THREE.Mesh(frontGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  object.add(mesh);

  const backMesh = new THREE.Mesh(backGeo, backMaterial);
  backMesh.castShadow = false;
  backMesh.receiveShadow = false;
  object.add(backMesh);

  return object;
}


export const makeCellShadedGeometry = (
  inGeo: THREE.BufferGeometry,
  material: THREE.Material,
  backMaterial?: THREE.Material,
): THREE.Object3D => {

  if (!backMaterial) {
    backMaterial = getBackSideMaterial();
  }

  const frontGeo = inGeo.clone();
  const backGeo = inGeo.clone();

  frontGeo.scale(1-0.05, 1-0.05, 1-0.05);
  backGeo.scale(1, 1, 1);

  const object = new THREE.Object3D();

  const mesh = new THREE.Mesh(frontGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  object.add(mesh);

  const backMesh = new THREE.Mesh(backGeo, backMaterial);
  backMesh.castShadow = false;
  backMesh.receiveShadow = false;
  object.add(backMesh);

  return object;
};
