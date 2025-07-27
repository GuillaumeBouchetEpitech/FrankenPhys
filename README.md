
# FrankenPhys

Small ammojs-like wrapper around the C++ bullet physics engine

## Demo: Sample Test Bed:

https://guillaumebouchetepitech.github.io/FrankenPhys/samples/browser-test-bed/index.html

## Features

### Small-ish
* FrankenPhys.0.0.1.js -> ~600ko (~60ko after server compression)
* FrankenPhys.0.0.1.wasm -> ~600ko (~250ko after server compression)

### Typescript wrapper

* TypeSafety, easy to get started, harder to make mistakes

### Memory Safe

* the TypeScript wrapper hide and handle the wasm memory allocations/deallocations
* no wasm memory leaks detected

### Support Node.Js and Browser

* A "TypeScript Game Logic" can be reused on both server/client
* Worth checking the `/samples` folder

### Easy to interface with Three.Js

* worth checking the `/samples/browser-test-bed` folder

### Physical Features

* physical world
* rigid bodies
* shapes:
  * box
  * sphere
  * cylinder
  * capsule
  * mesh
  * compound (<- group of sub shapes)
* dynamic vehicles
* 6dof joints v1 (<- 6 degrees of freedom joins)
* 6dof joints v2 (<- twice slower but many times more stable than v1)
* hinges joints (<- this support motor torque)

### Contact events

Example at the physic world level:

```typescript
interface ContactDataWorld {
	contactId: number,
	rigidBodyA: IPhysicBody,
	rigidBodyB: IPhysicBody,
	position: glm.vec3,
	normalB: glm.vec3,
}

physicWorld.addEventListener('beginContact', (event) => {
  console.log('beginContact', event.data.position);
});
physicWorld.addEventListener('updateContact', (event) => {
  console.log('updateContact', event.data.position);
});
physicWorld.addEventListener('endContact', (event) => {
  console.log('endContact', event.data.position);
});
// ccd -> "continuous collision detection"
physicWorld.addEventListener('ccdContact', (event) => {
  console.log('ccdContact', event.data.position);
});
```

Example at the physic body level:

```typescript
export interface ContactDataBody {
	contactId: number,
	other: IPhysicBody,
	position: glm.vec3,
	normalB: glm.vec3,
}

physicBody.addEventListener('beginContact', (event) => {
  console.log('beginContact', event.data.position);
});
physicBody.addEventListener('updateContact', (event) => {
  console.log('updateContact', event.data.position);
});
physicBody.addEventListener('endContact', (event) => {
  console.log('endContact', event.data.position);
});
// ccd -> "continuous collision detection"
physicBody.addEventListener('ccdContact', (event) => {
  console.log('ccdContact', event.data.position);
});
```

#### Known Issue with Contact events

the contact event are not that reliable on dynamic mesh colliders

### CCD (Continuous collision detection)

Useful when shooting "spherical physical bullet"

This prevent the faster "spherical physical bullet" from passing through objects

Example:
```typescript
// ccd start when going faster than 0.4 units/sec
physicBody.setCcdMotionThreshold(0.4);
// ccd radius sphere is 0.5 units
physicBody.setCcdSweptSphereRadius(0.5);
```

## Missing Features

* Soft Volumes/Bodies -> this save some serious wasm-size/bandwidth
