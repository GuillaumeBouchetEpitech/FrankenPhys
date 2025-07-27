
// check the paths of the tsconfig file a the root of this repo
import { BrowserFrankenPhysWasmModule, physics } from "../../..";

import * as THREE from "three";

import Stats from 'stats.js'

import { renderStaticBoxes } from "./internals/renderStaticBoxes";
import { renderDynamicSphere } from "./internals/renderDynamicSphere";
import { renderDynamicBox } from "./internals/renderDynamicBox";
import { renderDynamicCylinder } from "./internals/renderDynamicCylinder";
import { renderDynamicCapsule } from "./internals/renderDynamicCapsule";
import { renderDynamicCompound } from "./internals/renderDynamicCompound";
import { renderDynamicPyramid } from "./internals/renderDynamicPyramid";
import { renderContactEvents } from "./internals/renderContactEvents";
import { physicalRayCastTest } from "./internals/physicalRayCastTest";
import { physicalConvexSweepTest } from "./internals/physicalConvexSweepTest";
import { renderVehicle } from "./internals/renderVehicle";
import { renderRagDollWithDynamicConstrainedBox } from "./internals/renderRagDollWithDynamicConstrainedBox";
// import { renderRagDollWithDynamicConstrainedBox_broken } from "./internals/renderRagDollWithDynamicConstrainedBox_broken";
import { renderRopeWithDynamicConstrainedBox } from "./internals/renderRopeWithDynamicConstrainedBox";
import { renderQuadrupedWithHingeConstrainedBoxes } from "./internals/renderQuadrupedWithHingeConstrainedBoxes";
import { renderPhysicEngineDebugLines } from "./internals/renderPhysicEngineDebugLines";


const _queryHtmlElem = <T extends HTMLElement>(elemId: string): T => {
  const newElement: T | null = document.querySelector<T>(elemId);
  if (!newElement) {
    throw new Error(`html element not found -> '${elemId}'`);
  }
  return newElement;
};

window.onload = async () => {

  // initial logging function
  let _doLog = (...args: any[]) => {
    console.log(...args);
  };

  try {

    const textAreaElement = _queryHtmlElem<HTMLTextAreaElement>("#loggerOutput");

    // "upgrade" logging function
    _doLog = (...args: any[]) => {
      console.log(...args);
      textAreaElement.value += `> ${args.join(', ')}\n`;
    };

    _doLog('✅ page loaded');

    const renderArea = _queryHtmlElem<HTMLDivElement>("#render-area")
    const debugModeEnabled = _queryHtmlElem<HTMLInputElement>('#debug-mode-enabled');
    const aabbDebugModeEnabled = _queryHtmlElem<HTMLInputElement>('#aabb-debug-mode-enabled');

    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    _doLog('✅ fps meter loaded');

    // load the wasm side
    await BrowserFrankenPhysWasmModule.load({
      jsUrl: "../../build/FrankenPhys.0.0.1.js",
      wasmUrl: "../../build"
    });

    // set the wasm side
    physics.WasmModuleHolder.set(BrowserFrankenPhysWasmModule.get());

    _doLog('✅ physic engine loaded');

    // ready

    const physicWorld = new physics.PhysicWorld();

    //
    // simulate
    //

    const width = 800;
    const height = 600;

    const camera = new THREE.PerspectiveCamera( 70, width / height, 0.1, 80 );

    // camera.

    camera.position.set(15,15,15);
    camera.up.set(0,0,1);
    camera.lookAt(5,0,0);

    const scene = new THREE.Scene();

    {
      const light = new THREE.AmbientLight( 0x666666 ); // soft white light
      scene.add( light );
    }

    {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(-10, 10, 10);
      directionalLight.lookAt(0, 0, 0);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 80;
      directionalLight.shadow.camera.left = -70;
      directionalLight.shadow.camera.right = 70;
      directionalLight.shadow.camera.top = 70;
      directionalLight.shadow.camera.bottom = -70;
      directionalLight.shadow.bias = 0.00001;
      scene.add( directionalLight );
    }



    // const material = getTextureMaterial();

    const toSync: ((deltaTimeSec: number) => void)[] = [

      renderStaticBoxes(scene, physicWorld),
      renderDynamicSphere(scene, physicWorld, [2,-6,5]),
      renderDynamicBox(scene, physicWorld, [2,-3,5]),
      renderDynamicCylinder(scene, physicWorld, [2,-3,8]),
      renderDynamicCapsule(scene, physicWorld, [2,-6,8]),
      renderDynamicCompound(scene, physicWorld, [2,-9,8]),
      renderDynamicPyramid(scene, physicWorld, [-2, 0, 5]),
      renderVehicle(scene, physicWorld),
      renderRagDollWithDynamicConstrainedBox(scene, physicWorld),
      // renderRagDollWithDynamicConstrainedBox_broken(scene, physicWorld),
      renderRopeWithDynamicConstrainedBox(scene, physicWorld),
      renderContactEvents(scene, physicWorld),
      physicalRayCastTest(scene, physicWorld),
      physicalConvexSweepTest(scene, physicWorld),

      renderQuadrupedWithHingeConstrainedBoxes(scene, physicWorld),

      renderPhysicEngineDebugLines(scene, physicWorld, debugModeEnabled, aabbDebugModeEnabled),
    ];

    _doLog('✅ physic simulation setup');

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x404040, 1.0);
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // quality-- speed++
    // renderer.shadowMap.type = THREE.PCFShadowMap; // quality+ speed-
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // quality++ speed--
    renderArea.appendChild(renderer.domElement);
    renderer.domElement.style.width = "800px";
    renderer.domElement.style.height = "600px";

    _doLog('✅ threejs renderer setup');

    let lastTimeMsec = 0;
    function animate( time: number ) {

      stats.end();
      stats.begin();

      const deltaTimeMsec = Math.min(time - lastTimeMsec, 1000/30);
      lastTimeMsec = time;

      const deltaTimeSec = deltaTimeMsec / 1000;

      physicWorld.stepSimulation(deltaTimeSec);

      toSync.forEach(syncCallback => syncCallback(deltaTimeSec));

      renderer.render( scene, camera );
    }

    _doLog('✅ main loop setup');
  } catch (err: any) {
    _doLog(`❌ Error: "${err.message}".`);
  }
};





