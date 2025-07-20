
import * as THREE from "three";


let texturedMaterial: undefined | THREE.MeshPhongMaterial;
export function getTextureMaterial() {

  if (texturedMaterial) {
    return texturedMaterial;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/UV_Grid_Sm_512x512.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.magFilter = THREE.NearestFilter;
  mapGrid.minFilter = THREE.LinearMipMapLinearFilter;

  texturedMaterial = new THREE.MeshPhongMaterial({ map: mapGrid });

  return texturedMaterial;
}

let texturedMaterial2: undefined | THREE.MeshPhongMaterial;
export function getTextureMaterial2() {

  if (texturedMaterial2) {
    return texturedMaterial2;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/grid-green.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.magFilter = THREE.NearestFilter;
  mapGrid.minFilter = THREE.NearestFilter;

  texturedMaterial2 = new THREE.MeshPhongMaterial({ map: mapGrid });

  return texturedMaterial2;
}

let texturedMaterial3: undefined | THREE.MeshPhongMaterial;
export function getTextureMaterial3() {

  if (texturedMaterial3) {
    return texturedMaterial3;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/grid-red.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.magFilter = THREE.NearestFilter;
  mapGrid.minFilter = THREE.NearestFilter;

  texturedMaterial3 = new THREE.MeshPhongMaterial({ map: mapGrid });

  return texturedMaterial3;
}
