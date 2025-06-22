

#include "DynamicsWorld.hpp"

#include "CollisionAlgorithm.hpp"

// this will make the wasm 700ko+
// #include <iostream>

// instead, this is making the wasm <600ko+
#include <cstdio> // much smaller wasm than iostream


namespace {

  class MyDebugDrawer : public btIDebugDraw {
  private:
    int32_t _debugMode = 0;

    // PhysicWorld::debuggerPushLineCallback _debuggerPushLineCallback;

  public:
    // MyDebugDrawer(const PhysicWorld::debuggerPushLineCallback& callback) : _debuggerPushLineCallback(callback) {}
    MyDebugDrawer() {}

  public:
    void drawLine(const btVector3& from, const btVector3& to, const btVector3& color) override {
      // if (!_debuggerPushLineCallback)
        return;

      // _debuggerPushLineCallback(
      //   glm::vec3(from[0], from[1], from[2]), glm::vec3(to[0], to[1], to[2]), glm::vec3(color[0], color[1], color[2]));
    }

    void drawContactPoint(const btVector3& PointOnB,
                          const btVector3& normalOnB,
                          btScalar distance,
                          int32_t lifeTime,
                          const btVector3& color) override {

      // if (!_debuggerPushLineCallback)
        return;

      // static_cast<void>(distance); // unused
      // static_cast<void>(lifeTime); // unused

      // glm::vec3 point = glm::vec3(PointOnB[0], PointOnB[1], PointOnB[2]);
      // glm::vec3 normal = glm::vec3(normalOnB[0], normalOnB[1], normalOnB[2]);

      // _debuggerPushLineCallback(point, point + normal * 0.5f, glm::vec3(color[0], color[1], color[2]));
    }

    void reportErrorWarning(const char* warningString) override {
      // D_MYLOG("warningString: " << warningString);
      // std::cout << "warningString: " << warningString << std::endl;
      std::printf("warningString: %s", warningString);
    }

    void draw3dText(const btVector3& location, const char* textString) override {
      static_cast<void>(location); // unused

      // D_MYLOG("textString: " << textString);
      // std::cout << "draw3dText: " << textString << std::endl;
      std::printf("draw3dText: %s", textString);
    }

    void setDebugMode(int32_t debugMode) override { _debugMode = debugMode; }

    int32_t getDebugMode() const override { return _debugMode; }
  };

};




void btjsDynamicsWorld::activateDebugLogs()
{
  deactivateDebugLogs();

  // this will give us the error/warning logs
  MyDebugDrawer* newDebugDrawer = new MyDebugDrawer();

  int32_t debugMode = btIDebugDraw::DebugDrawModes::DBG_NoDebug;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawWireframe;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawAabb;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawContactPoints;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawConstraints;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawConstraintLimits;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawNormals;
  // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawFrames;

  newDebugDrawer->setDebugMode(debugMode);
  this->setDebugDrawer(newDebugDrawer);
}

void btjsDynamicsWorld::deactivateDebugLogs()
{
  btIDebugDraw* currentDebugDrawer = this->getDebugDrawer();
  if (!currentDebugDrawer)
    return;
  delete currentDebugDrawer;
  this->setDebugDrawer(nullptr);
}
