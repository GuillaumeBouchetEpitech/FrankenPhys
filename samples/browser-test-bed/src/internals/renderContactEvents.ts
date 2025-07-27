
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

import * as glm from "gl-matrix";



export function renderContactEvents(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const allContactEvents = new Map<number, { position: glm.vec3; normalB: glm.vec3 }>();

  const maxContact = 512;

  const contactGeometry = new THREE.BoxGeometry(0.05, 0.05, 1.35);
  const contactMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const contactMesh = new THREE.InstancedMesh(contactGeometry, contactMaterial, maxContact);
  contactMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  contactMesh.castShadow = false;
  contactMesh.receiveShadow = false;
  scene.add(contactMesh);

  const dummy = new THREE.Object3D();
  dummy.up.set(0,0,1);

  physicWorld.addEventListener('beginContact', (event) => {
    // console.log('beginContact', 'sphere', event.data.position);
    allContactEvents.set(event.data.contactId, event.data);
  });
  physicWorld.addEventListener('updateContact', (event) => {
    // console.log('updateContact', 'sphere', event.data.position);
    allContactEvents.set(event.data.contactId, event.data);
  });
  physicWorld.addEventListener('endContact', (event) => {
    // console.log('endContact', 'sphere', event.data.position);
    allContactEvents.delete(event.data.contactId);
  });
  physicWorld.addEventListener('ccdContact', (event) => {
    console.log('ccdContact', 'sphere', event.data.position);
  });


  return function syncRenderedContactEvent() {

    const allContactData = [...allContactEvents.values()].slice(0, maxContact);

    contactMesh.count = allContactData.length;

    if (allContactData.length > 0) {

      allContactData.forEach(({position, normalB}, index) => {

        dummy.position.set(position[0], position[1], position[2]);

        // orient the contact mesh
        dummy.lookAt(position[0]+normalB[0], position[1]+normalB[1], position[2]+normalB[2]);

        dummy.updateMatrix();
        contactMesh.setMatrixAt(index, dummy.matrix);
      });

      contactMesh.instanceMatrix.needsUpdate = true;
    }
  }

}
