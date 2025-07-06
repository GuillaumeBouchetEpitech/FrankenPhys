

#include "DynamicsWorld.hpp"

#include "CollisionAlgorithm.hpp"

#include <iostream>

namespace {

  class MyDebugDrawer : public btIDebugDraw {
  private:
    int32_t _debugMode = 0;

    const btjsDynamicsWorld::t_debugWireframeCallback _debuggerPushLineCallback;

  public:
    MyDebugDrawer(const btjsDynamicsWorld::t_debugWireframeCallback callback)
      : _debuggerPushLineCallback(callback)
    {}
    virtual ~MyDebugDrawer() = default;

  public:
  	DefaultColors	getDefaultColors() const override
    {
      DefaultColors colors;
      colors.m_aabb = btVector3(1,0,1); // purple instead of red
      return colors;
    }

    void drawLine(const btVector3& from, const btVector3& to, const btVector3& color) override {

      // std::cerr << "MyDebugDrawer::drawLine" << std::endl;

      if (!_debuggerPushLineCallback) {
        return;
      }

      _debuggerPushLineCallback(
        from[0], from[1], from[2],
        to[0], to[1], to[2],
        color[0], color[1], color[2]
      );

      // _debuggerPushLineCallback(
      //   glm::vec3(from[0], from[1], from[2]), glm::vec3(to[0], to[1], to[2]), glm::vec3(color[0], color[1], color[2]));
    }

    void drawContactPoint(const btVector3& PointOnB,
                          const btVector3& normalOnB,
                          btScalar distance,
                          int32_t lifeTime,
                          const btVector3& color) override {

      // std::cerr << "MyDebugDrawer::drawContactPoint" << std::endl;

      static_cast<void>(distance); // unused
      static_cast<void>(lifeTime); // unused

      if (!_debuggerPushLineCallback) {
        return;
      }

      _debuggerPushLineCallback(
        PointOnB[0], PointOnB[1], PointOnB[2],
        PointOnB[0] + normalOnB[0] * 0.5f,
        PointOnB[1] + normalOnB[1] * 0.5f,
        PointOnB[2] + normalOnB[2] * 0.5f,
        color[0], color[1], color[2]
      );

      // // if (!_debuggerPushLineCallback)
      //   return;

      // glm::vec3 point = glm::vec3(PointOnB[0], PointOnB[1], PointOnB[2]);
      // glm::vec3 normal = glm::vec3(normalOnB[0], normalOnB[1], normalOnB[2]);

      // _debuggerPushLineCallback(point, point + normal * 0.5f, glm::vec3(color[0], color[1], color[2]));
    }

    void reportErrorWarning(const char* warningString) override {
      std::cout << "warningString: " << warningString << std::endl;
    }

    void draw3dText(const btVector3& location, const char* textString) override {
      static_cast<void>(location); // unused

      std::cout << "draw3dText: " << textString << std::endl;
    }

    void setDebugMode(int32_t debugMode) override {
      _debugMode = debugMode;
    }

    int32_t getDebugMode() const override {
      return _debugMode;
    }
  };

};




// void btjsDynamicsWorld::activateDebugLogs()
// {
//   // deactivateDebugLogs();

//   std::cout << "activateDebugLogs" << std::endl;

//   // this will give us the error/warning logs
//   MyDebugDrawer* newDebugDrawer = new MyDebugDrawer(_debugWireframeCallback);

//   int32_t debugMode = btIDebugDraw::DebugDrawModes::DBG_NoDebug;
//   // if (_debugWireframeCallback) {
//     debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawWireframe;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawAabb;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawContactPoints;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawConstraints;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawConstraintLimits;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawNormals;
//     // debugMode |= btIDebugDraw::DebugDrawModes::DBG_DrawFrames;
//   // }

//   std::cout << "debugMode: " << debugMode << std::endl;

//   newDebugDrawer->setDebugMode(debugMode);
//   this->setDebugDrawer(newDebugDrawer);
// }

// void btjsDynamicsWorld::deactivateDebugLogs()
// {
//   std::cout << "deactivateDebugLogs" << std::endl;

//   btIDebugDraw* currentDebugDrawer = this->getDebugDrawer();
//   if (!currentDebugDrawer) {
//     return;
//   }
//   this->setDebugDrawer(nullptr);
// }

void btjsDynamicsWorld::setDebugWireframeCallback(long callback)
{
  _debugWireframeCallback = (t_debugWireframeCallback)callback;
  _startDebugDrawer();
}

void btjsDynamicsWorld::setDebugWireframeFeaturesFlag(int32_t flag)
{
  _debugWireframeFeatureFlag = flag;
  _startDebugDrawer();
}

void btjsDynamicsWorld::_startDebugDrawer()
{
  // ensure fresh start
  btIDebugDraw* currentDebugDrawer = this->getDebugDrawer();
  if (currentDebugDrawer) {
    delete currentDebugDrawer;
  }

  MyDebugDrawer* newDebugDrawer = new MyDebugDrawer(_debugWireframeCallback);

  newDebugDrawer->setDebugMode(_debugWireframeFeatureFlag);
  this->setDebugDrawer(newDebugDrawer);
}
