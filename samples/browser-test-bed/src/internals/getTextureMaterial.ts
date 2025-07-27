
import * as THREE from "three";


let texturedMaterial: undefined | THREE.MeshPhongMaterial;
export function getTextureMaterial() {

  if (texturedMaterial) {
    return texturedMaterial;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/UV_Grid_Sm_512x512.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.minFilter = THREE.LinearMipMapLinearFilter;
  mapGrid.magFilter = THREE.NearestFilter;

  texturedMaterial = new THREE.MeshPhongMaterial({ map: mapGrid });

  return texturedMaterial;
}

let texturedMaterial2: undefined | THREE.MeshPhongMaterial;
export function getTextureMaterial2() {

  if (texturedMaterial2) {
    return texturedMaterial2;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/grid-yellow.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.minFilter = THREE.NearestFilter;
  mapGrid.magFilter = THREE.NearestFilter;

  texturedMaterial2 = new THREE.MeshPhongMaterial({ map: mapGrid, color: 0xFFFFFF });

  return texturedMaterial2;
}

// let texturedMaterial3: undefined | THREE.MeshPhongMaterial;
// export function getTextureMaterial3() {

//   if (texturedMaterial3) {
//     return texturedMaterial3;
//   }

//   const textureLoader = new THREE.TextureLoader();
//   const mapGrid = textureLoader.load('../textures/grid-red.png');
//   mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
//   mapGrid.minFilter = THREE.NearestFilter;
//   mapGrid.magFilter = THREE.NearestFilter;

//   texturedMaterial3 = new THREE.MeshPhongMaterial({ map: mapGrid });

//   return texturedMaterial3;
// }

let backSideMaterial: undefined | THREE.Material;
export function getBackSideMaterial() {

  if (backSideMaterial) {
    return backSideMaterial;
  }

  backSideMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
  // backSideMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide });

  return backSideMaterial;
}
