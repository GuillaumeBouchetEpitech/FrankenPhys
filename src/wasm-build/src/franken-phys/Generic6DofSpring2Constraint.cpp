
#include "Generic6DofSpring2Constraint.hpp"


bjtsGeneric6DofSpring2Constraint::bjtsGeneric6DofSpring2Constraint(
  btRigidBody& rbA,
  btRigidBody& rbB,
  const btTransform& frameInA,
  const btTransform& frameInB,
  int rotOrder
) : btGeneric6DofSpring2Constraint(rbA, rbB, frameInA, frameInB, RotateOrder(rotOrder)) {
}

bjtsGeneric6DofSpring2Constraint::bjtsGeneric6DofSpring2Constraint(
  btRigidBody& rbB,
  const btTransform& frameInB,
  int rotOrder
) : btGeneric6DofSpring2Constraint(rbB, frameInB, RotateOrder(rotOrder)) {
}
