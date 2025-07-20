
#pragma once

#include "BulletHeaders.hpp"

class bjtsGeneric6DofSpring2Constraint
  : public btGeneric6DofSpring2Constraint
{
public:
  bjtsGeneric6DofSpring2Constraint(
    btRigidBody& rbA,
    btRigidBody& rbB,
    const btTransform& frameInA,
    const btTransform& frameInB,
    int rotOrder
  );

  bjtsGeneric6DofSpring2Constraint(
    btRigidBody& rbB,
    const btTransform& frameInB,
    int rotOrder
  );


};
