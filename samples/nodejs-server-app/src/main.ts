
// check the paths of the tsconfig file a the root of this repo
import { NodeJsFrankenPhysWasmModule, physics } from "@nodejs-loader"

import * as path from "path";

const asyncRun = async () => {

  // load the wasm side
  const urlPrefix = path.join(__dirname, '..', '..', '..', 'build');
  await NodeJsFrankenPhysWasmModule.loadWasmPart(urlPrefix);

  // set the wasm side
  physics.WasmModuleHolder.set(NodeJsFrankenPhysWasmModule.get());

  // ready

  const physicWorld = new physics.PhysicWorld();
  physicWorld.setGravity(0,0,-10);

  const allContactEvents = new Set<number>();

  physicWorld.addEventListener('beginContact', (event) => {
    allContactEvents.add(event.data.contactId);
  });
  // physicWorld.addEventListener('updateContact', (event) => {
  //   allContactEvents.add(event.data.contactId);
  // });
  physicWorld.addEventListener('endContact', (event) => {
    allContactEvents.delete(event.data.contactId);
  });



  const fallingSphereBody = physicWorld.createRigidBody({
    mass: 1, // dynamic
    shape: { type: 'sphere', radius: 1 },
  });
  fallingSphereBody.setPosition(0, 0, 10);
  fallingSphereBody.setFriction(1);
  fallingSphereBody.disableDeactivation();


  const groundBoxBody = physicWorld.createRigidBody({
    mass: 0, // static
    shape: { type: 'box', size: [2,2,2] },
  });
  groundBoxBody.setPosition(0, 0, -1);
  groundBoxBody.setFriction(1);
  groundBoxBody.disableDeactivation();


  for (let ii = 0; ii < 100; ++ii) {

    const frameRate = 1/60;
    const subSteps = 0;
    physicWorld.stepSimulation(frameRate, subSteps, frameRate);

    const prettyPos = [...fallingSphereBody.getPosition()].map(val => val.toFixed(2));
    console.log(prettyPos, 'total collision:', allContactEvents.size);
  }

  console.log('end');

}
asyncRun();

