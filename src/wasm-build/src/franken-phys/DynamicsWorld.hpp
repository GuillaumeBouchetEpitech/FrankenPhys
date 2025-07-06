
#pragma once

#include "BulletHeaders.hpp"

/**
 * btjsDynamicsWorld
 *
 * this class enable [...]
 */
class btjsDynamicsWorld
    : public btDiscreteDynamicsWorld
{
public:
    typedef void (*t_debugWireframeCallback)(float,float,float,  float,float,float,  float,float,float);

public:
	btjsDynamicsWorld(
        btDispatcher* dispatcher,
        btBroadphaseInterface* pairCache,
        btConstraintSolver* constraintSolver,
        btCollisionConfiguration* collisionConfiguration);

	virtual ~btjsDynamicsWorld();

protected:
    void createPredictiveContactsInternal_ex( btRigidBody** bodies, int numBodies, btScalar timeStep);
	virtual void createPredictiveContacts(btScalar timeStep) override;

    t_debugWireframeCallback    _debugWireframeCallback = nullptr;
    int32_t                     _debugWireframeFeatureFlag = 0;

public:
    btCompoundShape* createCompoundFromGimpactShape(const btGImpactMeshShape* gimpactMesh, btScalar depth);

    void setDebugWireframeCallback(long callback);
    void setDebugWireframeFeaturesFlag(int32_t flag);

protected:
    void _startDebugDrawer();

};
