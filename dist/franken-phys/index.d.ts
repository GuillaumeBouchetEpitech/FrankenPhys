export * from "./ContactEventHandler";
export * from "./convexSweep";
export * from "./WasmModuleHolder";
export { PrimitivesPhysicBoxShapeDef, PrimitivesPhysicSphereShapeDef, PrimitivesPhysicCylinderShapeDef, PrimitivesPhysicCapsuleShapeDef, PrimitivesPhysicMeshShapeDef, PrimitivesPhysicShapeDef, PrimitivesPhysicCompoundShapeDef, PhysicShapeDef, PhysicBodyDef, IPhysicBody } from "./PhysicBody";
export { RotationOrder, IGeneric6DofConstraint2, Generic6DofConstraint2Def } from "./Generic6DofConstraint2";
export * from "./PhysicVehicle";
export * from "./PhysicWorld";
export * from "./rayCast";
export declare enum DebugDrawFlags {
    DBG_NoDebug = 0,
    DBG_DrawWireframe = 1,
    DBG_DrawAabb = 2,
    DBG_DrawFeaturesText = 4,
    DBG_DrawContactPoints = 8,
    DBG_NoDeactivation = 16,
    DBG_NoHelpText = 32,
    DBG_DrawText = 64,
    DBG_ProfileTimings = 128,
    DBG_EnableSatComparison = 256,
    DBG_DisableBulletLCP = 512,
    DBG_EnableCCD = 1024,
    DBG_DrawConstraints = 2048,
    DBG_DrawConstraintLimits = 4096,
    DBG_FastWireframe = 8192,
    DBG_DrawNormals = 16384,
    DBG_DrawFrames = 32768
}
