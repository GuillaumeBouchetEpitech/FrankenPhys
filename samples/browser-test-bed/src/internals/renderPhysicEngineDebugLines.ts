
// check the paths of the tsconfig file a the root of this repo
import { physics } from "../../../..";

import * as THREE from "three";

export function renderPhysicEngineDebugLines(
  scene: THREE.Scene,
  physicWorld: physics.PhysicWorld,
  debugModeEnabled: HTMLInputElement,
  aabbDebugModeEnabled: HTMLInputElement,
): (deltaTimeSec: number) => void {

  let debugLine: THREE.LineSegments | undefined;
  let debugLineGeometry: THREE.BufferGeometry | undefined;
  const debugLineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    // transparent: true,     // Enable transparency
    // opacity: 0.2           // Set alpha (0.0 to 1.0)
  });

  const maxSize = 1024 * 1024 * 32; // <- 32Mo

  let currVerticesIndex = 0;
  const debugLinesVertices = new Float32Array(maxSize);
  let currColorsIndex = 0;
  const debugLinesColors = new Float32Array(maxSize);

  // all (?) the debug rendering feature flag
  let debugDrawerFlag: number = 0;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawWireframe;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawAabb;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawContactPoints;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawConstraints;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawConstraintLimits;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawNormals;
  // debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawFrames;

  physicWorld.setDebugWireframeFeaturesFlag(debugDrawerFlag);
  physicWorld.setDebugWireframeCallback((
    x1,y1,z1,
    x2,y2,z2,
    r,g,b,
  ) => {

    if (currVerticesIndex + 6 >= maxSize) {
      console.log("not enough memory for rendering all the debug lines!");
      return;
    }

    // accumulate in the buffer

    debugLinesVertices[currVerticesIndex++] = x1;
    debugLinesVertices[currVerticesIndex++] = y1;
    debugLinesVertices[currVerticesIndex++] = z1;

    debugLinesColors[currColorsIndex++] = r;
    debugLinesColors[currColorsIndex++] = g;
    debugLinesColors[currColorsIndex++] = b;

    debugLinesVertices[currVerticesIndex++] = x2;
    debugLinesVertices[currVerticesIndex++] = y2;
    debugLinesVertices[currVerticesIndex++] = z2;

    debugLinesColors[currColorsIndex++] = r;
    debugLinesColors[currColorsIndex++] = g;
    debugLinesColors[currColorsIndex++] = b;
  });

  return function syncRenderedStaticBox(deltaTimeSec: number) {

    if (debugLine) {
      scene.remove(debugLine);
      debugLine = undefined;
    }
    if (debugLineGeometry) {
      debugLineGeometry.dispose();
    }

    currVerticesIndex = 0; // reset
    currColorsIndex = 0; // reset

    const showDebug = debugModeEnabled.checked === true;
    const showAABB = aabbDebugModeEnabled.checked === true;
    if (!showDebug && !showAABB) {
      return;
    }

    let debugDrawerFlag: number = 0;
    if (showDebug) {
      debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawWireframe;
      debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawConstraints;
      debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawConstraintLimits;
    }
    if (showAABB) {
      debugDrawerFlag |= physics.DebugDrawFlags.DBG_DrawAabb;
    }
    physicWorld.setDebugWireframeFeaturesFlag(debugDrawerFlag);


    physicWorld.debugDrawWorld();

    // render
    debugLineGeometry = new THREE.BufferGeometry();
    debugLineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( debugLinesVertices.slice(0, currVerticesIndex), 3 ) );
    debugLineGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( debugLinesColors.slice(0, currColorsIndex), 3 ) );
    debugLine = new THREE.LineSegments(debugLineGeometry, debugLineMaterial);


    scene.add(debugLine);
  }
}



