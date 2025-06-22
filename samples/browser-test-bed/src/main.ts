
// check the paths of the tsconfig file a the root of this repo
import { BrowserFrankenPhysWasmModule, physics } from "@browser-loader";

import * as THREE from "three";

import * as glm from "gl-matrix";
import Stats from 'stats.js'

window.onload = async () => {

  const stats = new Stats()
  stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom)

  // load the wasm side
  await BrowserFrankenPhysWasmModule.load({
    jsUrl: "../../build/FrankenPhys.0.0.1.js",
    wasmUrl: "../../build"
  });

  // set the wasm side
  physics.WasmModuleHolder.set(BrowserFrankenPhysWasmModule.get());

  // ready

  const physicWorld = new physics.PhysicWorld();
  physicWorld.activateDebugLogs();

  //
  // simulate
  //

  const width = 800;
  const height = 600;

  const camera = new THREE.PerspectiveCamera( 70, width / height, 0.1, 50 );

  // camera.

  // camera.position.z = 1;
  camera.position.set(15,15,15);
  camera.up.set(0,0,1);
  camera.lookAt(5,0,0);

  const scene = new THREE.Scene();

  {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-10, 10, 10);
    directionalLight.lookAt(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 70;
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

    // renderVehicle(scene, physicWorld),

    renderDynamicSphere(scene, physicWorld, [2,-6,5]),
    renderDynamicBox(scene, physicWorld, [2,-3,5]),
    renderDynamicCylinder(scene, physicWorld, [2,-3,8]),
    renderDynamicCapsule(scene, physicWorld, [2,-6,8]),
    renderDynamicCompound(scene, physicWorld, [2,-9,8]),
    renderDynamicPyramid(scene, physicWorld, [-2, 0, 5]),
    // renderDynamicPyramid(scene, physicWorld, [-5, 5, 5]),
    // renderDynamicPyramid(scene, physicWorld, [-2, 5, 5]),
    // renderDynamicPyramid(scene, physicWorld, [-5, 0, 5]),
    renderVehicle(scene, physicWorld),
    renderDynamicConstrainedBox(scene, physicWorld),
    renderContactEvents(scene, physicWorld),
    rayCastTest(scene, physicWorld),
    convexSweepTest(scene, physicWorld),

    renderHingeConstrainedBoxes(scene, physicWorld),
  ]


  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap; // quality-- speed++
  // renderer.shadowMap.type = THREE.PCFShadowMap; // quality+ speed-
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // quality++ speed--
  document.body.appendChild( renderer.domElement );

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


};


const position = glm.vec3.fromValues(0,0,0);
const rotation = glm.vec4.fromValues(0,0,0,0);
const quat = new THREE.Quaternion(rotation[0],rotation[1],rotation[2],rotation[3]);

function _syncMeshWithRigidBody(mesh: THREE.Object3D, body: physics.IPhysicBody) {

  body.getPositionAndRotation(position, rotation);

  quat.set(rotation[0], rotation[1], rotation[2], rotation[3]);

  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.setFromQuaternion(quat);
}



let texturedMaterial: undefined | THREE.MeshPhongMaterial;
function getTextureMaterial() {

  if (texturedMaterial) {
    return texturedMaterial;
  }

  const textureLoader = new THREE.TextureLoader();
  const mapGrid = textureLoader.load('../textures/UV_Grid_Sm_512x512.png');
  // const mapGrid = textureLoader.load('../textures/square-outline.png');
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.magFilter = THREE.NearestFilter;
  mapGrid.minFilter = THREE.LinearMipMapLinearFilter;

  texturedMaterial = new THREE.MeshPhongMaterial({ map: mapGrid });

  return texturedMaterial;
}


function renderStaticBoxes(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const staticBoxA = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [32,32,2]
    },
    position: [-6,0,-4],
    orientation: [+Math.PI / 80, 0,1,0]
  });
  staticBoxA.setFriction(0.1);

  const staticBoxB = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [32,32,2]
    },
    position: [17,0,-7],
    orientation: [0, 0,0,1]
  });
  staticBoxB.setFriction(0.1);

  const material = getTextureMaterial();
  const geometryAB = new THREE.BoxGeometry( 32.0, 32.0, 2.0 );

  const boxMeshA = new THREE.Mesh( geometryAB, material );
  boxMeshA.castShadow = true;
  boxMeshA.receiveShadow = true;
  scene.add( boxMeshA );

  const boxMeshB = new THREE.Mesh( geometryAB, material );
  boxMeshB.castShadow = true;
  boxMeshB.receiveShadow = true;
  scene.add( boxMeshB );

  return function syncRenderedStaticBox() {
    _syncMeshWithRigidBody(boxMeshA, staticBoxA);
    _syncMeshWithRigidBody(boxMeshB, staticBoxB);
  }
}

function renderDynamicPyramid(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

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

  const redMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

  const pyGeometry = new THREE.BufferGeometry();

  const geoVertices = new Float32Array(vertices.map(val => ([val[0], val[1], val[2]])).flat());

  pyGeometry.setIndex(indices.map(val => ([val[0], val[1], val[2]])).flat());
  pyGeometry.setAttribute('position', new THREE.BufferAttribute(geoVertices, 3));

  const mesh = new THREE.Mesh(pyGeometry, redMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicPyramidMesh() {
    _syncMeshWithRigidBody(mesh, body);
  }
}

function renderDynamicSphere(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'sphere',
      radius: 1
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const geometry = new THREE.SphereGeometry( 1.0 );
  // const geometry = new THREE.BoxGeometry( 2.0, 2.0, 2.0 );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicSphereMesh() {
    _syncMeshWithRigidBody(mesh, body);
  }
}

function renderDynamicBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,2,2]
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const geometry = new THREE.BoxGeometry( 2.0, 2.0, 2.0 );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicBoxMesh() {
    _syncMeshWithRigidBody(mesh, body);
  }
}

function renderDynamicCylinder(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const radius = 1.0;
  const length = 2;

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'cylinder',
      radius,
      length
    },
    position: [pos[0], pos[1], pos[2]],
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1 );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicCylinderMesh() {
    _syncMeshWithRigidBody(mesh, body);
  }
}

function renderDynamicCapsule(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const radius = 1.0;
  const length = 2;

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'capsule',
      radius,
      length
    },
    position: pos,
    orientation: [0, 0,0,1],
  });
  body.setFriction(1);
  body.disableDeactivation();

  const material = getTextureMaterial();

  const geometry = new THREE.CapsuleGeometry(radius, length, 4, 8 );
  const mesh = new THREE.Mesh( geometry, material );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  return function syncDynamicCapsuleMesh() {
    _syncMeshWithRigidBody(mesh, body);
  }
}

function renderDynamicCompound(scene: THREE.Scene, physicWorld: physics.PhysicWorld, pos: glm.vec3): () => void {

  const body = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'compound',
      shapes: [
        {
          // boxX
          position: [1,0,0],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [4,1,1]
          }
        },
        {
          // boxY
          position: [0,1,0],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [1,4,1]
          }
        },
        {
          // boxZ
          position: [0,0,1],
          orientation: [0, 0,0,1],
          shape: {
            type: 'box',
            size: [1,1,4]
          }
        },
      ],
    },
    position: pos,
    orientation: [0, 0,0,1],
  });
  body.setFriction(0.1);
  body.disableDeactivation();

  //

  const material = getTextureMaterial();

  const mainObj = new THREE.Object3D();

  const geometryX = new THREE.BoxGeometry(4,1,1);
  const meshX = new THREE.Mesh( geometryX, material );
  meshX.castShadow = true;
  meshX.receiveShadow = true;
  const subObjX = new THREE.Object3D();
  subObjX.position.set(1,0,0);
  subObjX.add(meshX);
  mainObj.add( subObjX );

  const geometryY = new THREE.BoxGeometry(1,4,1);
  const meshY = new THREE.Mesh( geometryY, material );
  meshY.castShadow = true;
  meshY.receiveShadow = true;
  const subObjY = new THREE.Object3D();
  subObjY.position.set(0,1,0);
  subObjY.add(meshY);
  mainObj.add( subObjY );

  const geometryZ = new THREE.BoxGeometry(1,1,4);
  const meshZ = new THREE.Mesh( geometryZ, material );
  meshZ.castShadow = true;
  meshZ.receiveShadow = true;
  const subObjZ = new THREE.Object3D();
  subObjZ.position.set(0,0,1);
  subObjZ.add(meshZ);
  mainObj.add( subObjZ );

  scene.add(mainObj)

  //

  return function syncDynamicCompoundMesh() {
    _syncMeshWithRigidBody(mainObj, body);
  }
}


function renderDynamicConstrainedBox(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const originX = -5;

  const bodyA = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX, 3,5],
    orientation: [0, 0,0,1]
  });
  bodyA.setFriction(0.1);

  const bodyB = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,1,0.5]
    },
    position: [originX+2, 3,5],
    orientation: [0, 0,0,1]
  });
  bodyB.setFriction(0.1);

  const bodyC = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX+4, 3,5],
    orientation: [0, 0,0,1]
  });
  bodyC.setFriction(0.1);

  const bodyD = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,1,0.5]
    },
    position: [originX+6, 3,5],
    orientation: [0, 0,0,1]
  });
  bodyD.setFriction(0.1);

  const bodyE = physicWorld.createRigidBody({
    mass: 1,
    shape: {
      type: 'box',
      size: [2,0.5,1]
    },
    position: [originX+8, 3,5],
    orientation: [0, 0,0,1]
  });
  bodyE.setFriction(0.1);

  const _makeConstraint = (bodyA: physics.IPhysicBody, bodyB: physics.IPhysicBody) => {

    const constraint = physicWorld.createGeneric6DofConstraint({
      bodyA,
      bodyB,
      frameA: [+1,0,0],
      frameB: [-1,0,0],
      useReferenceFrameA: true
    });
    constraint.setLinearLowerLimit([0,0,0]);
    constraint.setLinearUpperLimit([0,0,0]);
    constraint.setAngularLowerLimit([-0.8,-0.8,-0.8]);
    constraint.setAngularUpperLimit([+0.8,+0.8,+0.8]);
  };

  _makeConstraint(bodyA, bodyB);
  _makeConstraint(bodyB, bodyC);
  _makeConstraint(bodyC, bodyD);
  _makeConstraint(bodyD, bodyE);

  const material = getTextureMaterial();

  const geometryA = new THREE.BoxGeometry( 2.0, 0.5, 1.0 );
  const geometryB = new THREE.BoxGeometry( 2.0, 1.0, 0.5 );

  const meshA = new THREE.Mesh( geometryA, material );
  meshA.castShadow = true;
  meshA.receiveShadow = true;
  scene.add( meshA );

  const meshB = new THREE.Mesh( geometryB, material );
  meshB.castShadow = true;
  meshB.receiveShadow = true;
  scene.add( meshB );

  const meshC = new THREE.Mesh( geometryA, material );
  meshC.castShadow = true;
  meshC.receiveShadow = true;
  scene.add( meshC );

  const meshD = new THREE.Mesh( geometryB, material );
  meshD.castShadow = true;
  meshD.receiveShadow = true;
  scene.add( meshD );

  const meshE = new THREE.Mesh( geometryA, material );
  meshE.castShadow = true;
  meshE.receiveShadow = true;
  scene.add( meshE );

  return function syncDynamicBoxMesh() {
    _syncMeshWithRigidBody(meshA, bodyA);
    _syncMeshWithRigidBody(meshB, bodyB);
    _syncMeshWithRigidBody(meshC, bodyC);
    _syncMeshWithRigidBody(meshD, bodyD);
    _syncMeshWithRigidBody(meshE, bodyE);
  }
}


function renderHingeConstrainedBoxes(scene: THREE.Scene, physicWorld: physics.PhysicWorld): (deltaTimeSec: number) => void {

  const originX = +10;
  const originY = -20;

  const toSync: ((deltaTimeSec: number) => void)[] = [];

  const material = getTextureMaterial();

  const bodyStaticGround = physicWorld.createRigidBody({
    mass: 0,
    shape: {
      type: 'box',
      size: [20,20,1]
    },
    position: [originX,originY, 0],
    orientation: [0, 0,0,1]
  });
  bodyStaticGround.setFriction(10.0);

  const geometryStaticGround = new THREE.BoxGeometry( 20.0, 20.0, 1.0 );

  const boxMeshStaticGround = new THREE.Mesh( geometryStaticGround, material );
  boxMeshStaticGround.castShadow = true;
  boxMeshStaticGround.receiveShadow = true;
  scene.add( boxMeshStaticGround );

  toSync.push(() => {
    _syncMeshWithRigidBody(boxMeshStaticGround, bodyStaticGround);
  });

  //
  //
  //
  //
  //

  const mainBoxSize: glm.ReadonlyVec3 = [2,2,2];

  const bodyDefMain: physics.PhysicBodyDef = {
    mass: 1,
    shape: {
      type: 'box',
      size: mainBoxSize
    },
    position: [originX, originY, 5],
    orientation: [0, 0,0,1]
  };

  const bodyMain = physicWorld.createRigidBody(bodyDefMain);
  bodyMain.setFriction(10.0);

  const geometryBody = new THREE.BoxGeometry(mainBoxSize[0], mainBoxSize[1], mainBoxSize[2]);

  const meshMain = new THREE.Mesh( geometryBody, material );
  meshMain.castShadow = true;
  meshMain.receiveShadow = true;
  scene.add( meshMain );

  toSync.push(() => {
    _syncMeshWithRigidBody(meshMain, bodyMain);
  });

  //
  //
  //

  const _makeLeg = (
    posLeg: glm.ReadonlyVec3,
    posForeleg: glm.ReadonlyVec3,
    pivotInA: glm.ReadonlyVec3,
    pivotInB: glm.ReadonlyVec3,
    isLeftLeg: boolean,
    isBackLeg: boolean,
  ) => {

    const bodyDefLegBase: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        type: 'sphere',
        radius: 0.5,
      },
      position: posLeg,
      orientation: [0, 0,0,1],
    };

    const bodyDefLeg: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        type: 'box',
        size: [2.0,0.5,0.5]
      },
      position: posLeg,
      orientation: [0, 0,0,1],
    };

    const bodyDefForeleg: physics.PhysicBodyDef = {
      mass: 0.01,
      shape: {
        // type: 'box',
        // size: [2.0,0.5,0.5]
        type: 'compound',
        shapes: [
          {
            position: [0,0,0],
            orientation: [0, 0,0,1],
            shape: {
              type: 'box',
              size: [2.0,0.5,0.5]
            }
          },
          {
            position: [isBackLeg ? -1 : +1,0,0],
            orientation: [0.25 * Math.PI, 0,0,1],
            shape: {
              // type: 'sphere',
              // radius: 0.25
              type: 'box',
              size: [0.25,1,1]
              // size: [0.25,1,0.25]
            }
          },
          // {
          //   position: [isBackLeg ? -1 : +1,0,0],
          //   orientation: [0.25 * Math.PI, 0,0,1],
          //   shape: {
          //     // type: 'sphere',
          //     // radius: 0.25
          //     type: 'box',
          //     size: [0.25,0.25,1]
          //   }
          // },
        ]
      },
      position: posForeleg,
      orientation: [0, 0,0,1],
    };

    const bodyLegBase = physicWorld.createRigidBody(bodyDefLegBase);
    // bodyLegBase.setPosition(posLeg[0], posLeg[1], posLeg[2]);
    bodyLegBase.setFriction(10.0);

    const bodyLeg = physicWorld.createRigidBody(bodyDefLeg);
    // bodyLeg.setPosition(posLeg[0], posLeg[1], posLeg[2]);
    bodyLeg.setFriction(10.0);

    const bodyForeleg = physicWorld.createRigidBody(bodyDefForeleg);
    // bodyForeleg.setPosition(posForeleg[0], posForeleg[1], posForeleg[2]);
    bodyForeleg.setFriction(10.0);

    // const bodyFoot = physicWorld.createRigidBody({
    //   mass: 0.01,
    //   shape: {
    //     type: 'sphere',
    //     radius: 0.6
    //     // type: 'box',
    //     // size: [0.6,0.6,0.6]
    //   },
    //   position: [posForeleg[0] + 1, posForeleg[1], posForeleg[2]],
    //   orientation: [0, 0,0,1],
    // });
    // // bodyFoot.setPosition(1000, 0, 0);
    // bodyFoot.setFriction(1.0);

    const constraintBodyLegBase = physicWorld.createHingeConstraint({
      bodyA: bodyMain,
      bodyB: bodyLegBase,
      pivotInA,
      pivotInB: [0,0,0],
      axisInA: [0,0,1],
      axisInB: [0,0,1],
      useReferenceFrameA: true
    });

    const constraintBaseLeg = physicWorld.createHingeConstraint({
      bodyA: bodyLegBase,
      bodyB: bodyLeg,
      pivotInA: [0,0,0],
      pivotInB,
      axisInA: [0,1,0],
      axisInB: [0,1,0],
      useReferenceFrameA: true
    });

    const constraintLegForeleg = physicWorld.createHingeConstraint({
      bodyA: bodyLeg,
      bodyB: bodyForeleg,
      pivotInA: isBackLeg ? [-1,0,0] : [+1,0,0],
      pivotInB: isBackLeg ? [+1,0,0] : [-1,0,0],
      axisInA: [0,1,0],
      axisInB: [0,1,0],
      useReferenceFrameA: true
    });

    // const constraintForelegFoot = physicWorld.createHingeConstraint({
    //   bodyA: bodyForeleg,
    //   bodyB: bodyFoot,
    //   pivotInA: [isBackLeg ? -1 : +1, 0,0],
    //   pivotInB: [0,0,0],
    //   axisInA: [0,1,0],
    //   axisInB: [0,1,0],
    //   useReferenceFrameA: true
    // });



    if (isBackLeg) {
      constraintBodyLegBase.setLimit(-Math.PI*0.3, +Math.PI*0.3, 0.0, 0.0, 0.0);
    } else {
      constraintBodyLegBase.setLimit(-Math.PI*0.3, +Math.PI*0.3, 0.0, 0.0, 0.0);
    }
    constraintBodyLegBase.enableMotor(true);
    constraintBodyLegBase.setMaxMotorImpulse(20);

    constraintBaseLeg.setLimit(-Math.PI*0.7, +Math.PI*0.7, 0.0, 0.0, 0.0);
    constraintBaseLeg.enableMotor(true);
    constraintBaseLeg.setMaxMotorImpulse(20);

    constraintLegForeleg.setLimit(-Math.PI*0.7, +Math.PI*0.7, 0.0, 0.0, 0.0);
    constraintLegForeleg.enableMotor(true);
    constraintLegForeleg.setMaxMotorImpulse(20);

    // constraintForelegFoot.setLimit(0, 0, 0.0, 0.0, 0.0);

    // const geometryBaseLeg = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
    const geometryBaseLeg = new THREE.SphereGeometry( 0.5 );
    const geometryLeg = new THREE.BoxGeometry( 2.0, 0.5, 0.5 );
    // const geometryFoot = new THREE.SphereGeometry( 0.25 );
    // const geometryFoot1 = new THREE.BoxGeometry( 0.25, 0.25, 1 );
    const geometryFoot1 = new THREE.BoxGeometry( 0.25, 1, 1 );
    // const geometryFoot2 = new THREE.BoxGeometry( 0.25, 1, 0.25 );

    const meshBaseLeg = new THREE.Mesh( geometryBaseLeg, material );
    meshBaseLeg.castShadow = true;
    meshBaseLeg.receiveShadow = true;
    scene.add( meshBaseLeg );

    const meshLeg = new THREE.Mesh( geometryLeg, material );
    meshLeg.castShadow = true;
    meshLeg.receiveShadow = true;
    scene.add( meshLeg );

    // const meshLegForeleg = new THREE.Mesh( geometryLeg, material );
    // meshLegForeleg.castShadow = true;
    // meshLegForeleg.receiveShadow = true;
    // scene.add( meshLegForeleg );

    const meshLegForeleg = new THREE.Object3D();
    scene.add( meshLegForeleg );

    // const geometryForeLeg = new THREE.BoxGeometry(4,1,1);
    const meshX = new THREE.Mesh( geometryLeg, material );
    meshX.castShadow = true;
    meshX.receiveShadow = true;
    const subObjX = new THREE.Object3D();
    subObjX.position.set(0,0,0);
    subObjX.add(meshX);
    meshLegForeleg.add( subObjX );

    const meshFoot1 = new THREE.Mesh( geometryFoot1, material );
    meshFoot1.castShadow = true;
    meshFoot1.receiveShadow = true;
    const subObjFoot1 = new THREE.Object3D();
    subObjFoot1.position.set(isBackLeg ? -1 : +1,0,0);
    subObjFoot1.quaternion.set(1,0,0, 0.25 * Math.PI);
    subObjFoot1.add(meshFoot1);
    meshLegForeleg.add( subObjFoot1 );

    // const meshFoot2 = new THREE.Mesh( geometryFoot2, material );
    // meshFoot2.castShadow = true;
    // meshFoot2.receiveShadow = true;
    // const subObjFoot2 = new THREE.Object3D();
    // subObjFoot2.position.set(isBackLeg ? -1 : +1,0,0);
    // subObjFoot2.quaternion.set(1,0,0, 0.25 * Math.PI);
    // subObjFoot2.add(meshFoot2);
    // meshLegForeleg.add( subObjFoot2 );


    // const meshFoot = new THREE.Mesh( geometryFoot, material );
    // meshFoot.castShadow = true;
    // meshFoot.receiveShadow = true;
    // scene.add( meshFoot );


    let timeLeftBeforeNextFrame = 2.0;

    interface ILegFrame {
      base: number;
      leg: number;
      foreleg: number;
      duration: number;
    }

    const frames: ILegFrame[] = [];
    frames.push({ base: 0.00, leg: +0.0, foreleg: 0.0, duration: 2.0 }); // flat
    frames.push({ base: 0.00, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated
    frames.push({ base: 0.15, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated rotated
    frames.push({ base: 0.15, leg: +0.1, foreleg: 0.5, duration: 2.0 }); // rotated on the ground
    frames.push({ base: 0.15, leg: +0.4, foreleg: 0.1, duration: 2.0 }); // rotated on the ground higher
    frames.push({ base: 0.15, leg: +0.1, foreleg: 0.5, duration: 2.0 }); // rotated on the ground
    frames.push({ base: 0.15, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated rotated
    frames.push({ base: 0.00, leg: -0.3, foreleg: 0.7, duration: 1.0 }); // elevated

    let currFrameIndex = 0;
    let nextFrameIndex = 1;
    let currFrame = frames[0];
    let nextFrame = frames[1];

    return  (deltaTimeSec: number) => {

      if (timeLeftBeforeNextFrame > 0) {
        timeLeftBeforeNextFrame -= deltaTimeSec;
        if (timeLeftBeforeNextFrame <= 0) {

          currFrameIndex = (currFrameIndex + 1) % frames.length;
          nextFrameIndex = (nextFrameIndex + 1) % frames.length;
          currFrame = frames[currFrameIndex];
          nextFrame = frames[nextFrameIndex];

          timeLeftBeforeNextFrame = currFrame.duration;
        }
      }

      const coef = 1 - timeLeftBeforeNextFrame / currFrame.duration;

      // console.log({ coef })

      let angleBase = currFrame.base + (nextFrame.base - currFrame.base) * coef;
      let angleForeleg = currFrame.foreleg + (nextFrame.foreleg - currFrame.foreleg) * coef;
      let angleLeg = currFrame.leg + (nextFrame.leg - currFrame.leg) * coef;

      // let angleBase = +currFrame.base;
      if (isBackLeg && !isLeftLeg) {
        angleBase = -angleBase;
      } else if (!isBackLeg && isLeftLeg) {
        angleBase = -angleBase;
      }
      constraintBodyLegBase.setMotorTarget(Math.PI*angleBase, deltaTimeSec*2);

      angleForeleg = isBackLeg ? -angleForeleg : +angleForeleg;
      constraintLegForeleg.setMotorTarget(Math.PI*+angleForeleg, deltaTimeSec*2);

      angleLeg = isBackLeg ? -angleLeg : +angleLeg;
      constraintBaseLeg.setMotorTarget(Math.PI*+angleLeg, deltaTimeSec*2);

      _syncMeshWithRigidBody(meshBaseLeg, bodyLegBase);
      _syncMeshWithRigidBody(meshLeg, bodyLeg);
      _syncMeshWithRigidBody(meshLegForeleg, bodyForeleg);

    };
  }

  const diffX = 1.5;
  const diffY = 1.5;

  toSync.push(_makeLeg(
    [originX+diffX, originY+diffY, 5],
    [originX+diffX, originY+diffY, 5],
    [+diffX,+diffY,0],
    [-1,0,0],
    false,
    false,
  ));

  toSync.push(_makeLeg(
    [originX+2, originY-diffY, 5],
    [originX+4, originY-diffY, 5],
    [+diffX,-diffY,0],
    [-1,0,0],
    true,
    false,
  ));

  toSync.push(_makeLeg(
    [originX-2, originY+diffY, 5],
    [originX+2, originY+diffY, 5],
    [-diffX,+diffY,0],
    [+1,0,0],
    false,
    true,
  ));

  toSync.push(_makeLeg(
    [originX-2, originY-diffY, 5],
    [originX+2, originY-diffY, 5],
    [-diffX,-diffY,0],
    [+1,0,0],
    true,
    true,
  ));

  let timeElapsedSec = 0;
  let forward = true;

  return function syncDynamicBoxMesh(deltaTimeSec: number) {

    if (timeElapsedSec > 1.0) {
      timeElapsedSec = 0;
      forward = !forward;
    }

    timeElapsedSec += deltaTimeSec;

    for (const currSync of toSync) {
      currSync(deltaTimeSec);
    }
  }
}


function renderVehicle(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const vehicleDef: physics.PhysicVehicleDef = {
    chassisDef: {
      mass: 20,
      shape: {
        type: 'box',
        size: [2,4,1] // X is right, Y is forward, Z is up
      },
      position: [3,0,3],
      orientation: [0, 0,0,1]
    },

    coordinateSystem: [
      0, // X as X => right index
      2, // Y as Z => up index
      1, // Z as Y => forward index
    ],

    groundDirection: [0,0,-1], // downward Z axis
    rotationAxis: [1,0,0], // wheel X axis
    wheelRadius: 0.75,
    wheelWidth: 0.5,
    suspensionRestLength: 0.6, // meters

    wheelFriction: 1000, // kart racing friction (highest)
    suspensionStiffness: 20, // centimeters
    wheelsDampingCompression: 4.4, // meters
    wheelsDampingRelaxation: 2.3, // meters
    rollInfluence: 0.01, // range is [0..1], from "no-roll" to "realistic"

    wheels: [
      {
        connectionPoint: [-1.25, +1.7, 0.2],
        isFrontWheel: true,
      },
      {
        connectionPoint: [+1.25, +1.7, 0.2],
        isFrontWheel: true,
      },
      {
        connectionPoint: [+1.25, -1.7, 0.2],
        isFrontWheel: false,
      },
      {
        isFrontWheel: false,
        connectionPoint: [-1.25, -1.7, 0.2],
      },
    ],
  };

  const dynamicVehicle = physicWorld.createVehicle(vehicleDef);

  const steeringAngle = Math.PI / 6;

  dynamicVehicle.setSteeringValue(0, steeringAngle); // front wheel
  dynamicVehicle.setSteeringValue(1, steeringAngle); // front wheel
  dynamicVehicle.applyEngineForce(2, 40); // rear wheel
  dynamicVehicle.applyEngineForce(3, 40); // rear wheel
  // dynamicVehicle.setSteeringValue(0, steeringAngle); // front wheel
  // dynamicVehicle.setSteeringValue(1, steeringAngle); // front wheel

  // dynamicVehicle.getChassisBody().disableDeactivation();
  // dynamicVehicle.applyEngineForce(0, -80); // front wheel
  // dynamicVehicle.applyEngineForce(1, 80); // front wheel
  // dynamicVehicle.applyEngineForce(2, 80); // rear wheel
  // dynamicVehicle.applyEngineForce(3, -80); // rear wheel



  const material = getTextureMaterial();

  const geometry = new THREE.BoxGeometry( 2.0, 4.0, 1.0 );
  const vehicleMesh = new THREE.Mesh( geometry, material );
  vehicleMesh.castShadow = true;
  vehicleMesh.receiveShadow = true;
  scene.add( vehicleMesh );

  // vehicleMesh = mesh;

  const wheelsMesh: THREE.Mesh[] = [];
  {
    const wheelGeometry = new THREE.CylinderGeometry(vehicleDef.wheelRadius, vehicleDef.wheelRadius, vehicleDef.wheelWidth, 20, 1);
    {
      const matrix = new THREE.Matrix4();
      matrix.identity();
      matrix.makeRotationZ(Math.PI / 2);
      wheelGeometry.applyMatrix4(matrix);
    }

    for (let ii = 0; ii < vehicleDef.wheels.length; ++ii) {
      const mesh = new THREE.Mesh( wheelGeometry, material );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add( mesh );
      wheelsMesh.push(mesh);
    }

  }


  return function syncVehicle() {

    _syncMeshWithRigidBody(vehicleMesh, dynamicVehicle.getChassisBody());

    const allTransforms = dynamicVehicle.getWheeTransforms();

    allTransforms.forEach(({ position, rotation }, index) => {

      quat.set(rotation[0], rotation[1], rotation[2], rotation[3]);

      wheelsMesh[index].position.set(position[0], position[1], position[2]);
      wheelsMesh[index].rotation.setFromQuaternion(quat);
    });
  }

}





function renderContactEvents(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const allContactEvents = new Map<number, { position: glm.vec3; normalB: glm.vec3 }>();

  const maxContact = 512;

  const contactGeometry = new THREE.BoxGeometry(0.15, 0.15, 1.35);
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



function rayCastTest(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

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




function convexSweepTest(scene: THREE.Scene, physicWorld: physics.PhysicWorld): () => void {

  const maxContact = 10;

  const radius = 0.5;

  const geometry = new THREE.SphereGeometry(radius);
  const contactMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new THREE.InstancedMesh( geometry, contactMaterial, maxContact );
  mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add( mesh );

  const dummy = new THREE.Object3D();

  return function() {

    for (let ii = 0; ii < 10; ++ii) {

      const from = glm.vec3.fromValues(8, ii - 5, +5);
      const to = glm.vec3.fromValues(8, ii - 5, -15);

      const result = physicWorld.convexSweep(from, to, radius);

      if (!result) {
        dummy.position.set(to[0], to[1], to[2]);
      } else {

        const resultPos = glm.vec3.fromValues(
          result.impact[0]+result.normal[0]*radius,
          result.impact[1]+result.normal[1]*radius,
          result.impact[2]+result.normal[2]*radius,
        );

        dummy.position.set(resultPos[0], resultPos[1], resultPos[2]);
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(ii, dummy.matrix);
    }

    mesh.count = 10;
    mesh.instanceMatrix.needsUpdate = true;

  }

}

