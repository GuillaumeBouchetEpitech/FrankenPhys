'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const scriptLoadingUtility = (inSrc) => {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement("script");
        scriptElement.src = inSrc;
        // scriptElement.onprogress = (event) => logger.log("event", event);
        scriptElement.addEventListener('load', resolve);
        scriptElement.addEventListener('error', reject);
        document.head.appendChild(scriptElement);
    });
};

class BrowserFrankenPhysWasmModule {
    static load(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield BrowserFrankenPhysWasmModule.loadJsPart(opts.jsUrl);
            yield BrowserFrankenPhysWasmModule.loadWasmPart(opts.wasmUrl);
        });
    }
    static loadJsPart(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield scriptLoadingUtility(url);
        });
    }
    static loadWasmPart(urlPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            BrowserFrankenPhysWasmModule._wasmModule = yield FrankenPhysLoader({
                locateFile: (url) => {
                    return `${urlPrefix}/${url}`;
                },
                // TOTAL_MEMORY: 1 * 1024
            });
        });
    }
    static get() {
        if (!this._wasmModule) {
            throw new Error("FrankenPhys wasm module not loaded");
        }
        return this._wasmModule;
    }
}

class ContactEventHandler {
    constructor() {
        this._listenersMap = new Map();
    }
    // constructor() {
    // }
    isEventListenedTo(type) {
        const listeners = this._listenersMap.get(type);
        return (!!listeners && listeners.length > 0);
    }
    addEventListener(type, listener) {
        // if (!this.isEventAllowed(type))
        // 	return ErrorHandler.reportError(`event type not in the white list, type=${type}`);
        let listeners = this._listenersMap.get(type);
        if (!listeners) {
            listeners = [];
            this._listenersMap.set(type, listeners);
        }
        // dirty cast
        if (listeners.indexOf(listener) !== -1) {
            // return ErrorHandler.reportError(`duplicate event listener, type=${type}`);
            throw new Error(`duplicated event listener, type=${type}`);
        }
        // dirty cast
        listeners.push(listener);
    }
    on(type, listener) {
        this.addEventListener(type, listener);
    }
    hasEventListener(type, listener) {
        // if (!this.isEventAllowed(type))
        // 	return ErrorHandler.reportError(`event type not in the white list, type=${type}`);
        const listeners = this._listenersMap.get(type);
        // dirty cast
        return (listeners !== undefined && listeners.indexOf(listener) !== -1);
    }
    removeEventListener(type, listener) {
        // if (!this.isEventAllowed(type))
        // 	return ErrorHandler.reportError(`event type not in the white list, type=${type}`);
        const listeners = this._listenersMap.get(type);
        if (listeners === undefined)
            return;
        const index = listeners.indexOf(listener);
        if (index === -1) {
            throw new Error(`unknown event listener, type=${type}`);
            // return ErrorHandler.reportError(`unknown event listener, type=${type}`);
        }
        listeners.splice(index, 1);
    }
    dispatchEvent(event) {
        // if (!this.isEventAllowed(event.type))
        // 	return ErrorHandler.reportError(`event type not in the white list, type=${event.type}`);
        const listeners = this._listenersMap.get(event.type);
        if (listeners === undefined) {
            return;
        }
        // event.target = this;
        const listenersCopy = listeners.slice(0);
        for (let ii = 0; ii < listenersCopy.length; ++ii) {
            listenersCopy[ii].call(this, event);
        }
    }
}

class WasmModuleHolder {
    static set(wasmModule) {
        return __awaiter(this, void 0, void 0, function* () {
            WasmModuleHolder._wasmModule = wasmModule;
        });
    }
    static get() {
        if (!this._wasmModule) {
            throw new Error("FrankenPhys wasm module not loaded");
        }
        return this._wasmModule;
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create$4() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$3() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues$1(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize$2(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

(function () {
  var vec = create$3();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
})();

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */

function fromValues(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$1(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

(function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
})();

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$1() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize = normalize$1;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

(function () {
  var tmpvec3 = create$3();
  var xUnitVec3 = fromValues$1(1, 0, 0);
  var yUnitVec3 = fromValues$1(0, 1, 0);
  return function (out, a, b) {
    var dot$1 = dot(a, b);

    if (dot$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize$2(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$1;
      return normalize(out, out);
    }
  };
})();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

(function () {
  var temp1 = create$1();
  var temp2 = create$1();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
})();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

(function () {
  var matr = create$4();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize(out, fromMat3(out, matr));
  };
})();

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

(function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
})();

const convexSweep = (rawDynamicsWorld, def) => {
    const bullet = WasmModuleHolder.get();
    const fromVec3 = new bullet.btVector3(def.from[0], def.from[1], def.from[2]);
    const toVec3 = new bullet.btVector3(def.to[0], def.to[1], def.to[2]);
    const fromTrsf = new bullet.btTransform();
    fromTrsf.setIdentity();
    fromTrsf.setOrigin(fromVec3);
    const toTrsf = new bullet.btTransform();
    toTrsf.setIdentity();
    toTrsf.setOrigin(toVec3);
    const result = new bullet.ClosestConvexResultCallback(fromVec3, toVec3);
    result.set_m_collisionFilterGroup(def.collisionFilterGroup);
    result.set_m_collisionFilterMask(def.collisionFilterMask);
    const shape = new bullet.btSphereShape(def.radius);
    rawDynamicsWorld.convexSweepTest(shape, fromTrsf, toTrsf, result, 0);
    if (!result.hasHit()) {
        bullet.destroy(fromVec3);
        bullet.destroy(toVec3);
        bullet.destroy(result);
        bullet.destroy(shape);
        bullet.destroy(fromTrsf);
        bullet.destroy(toTrsf);
        return;
    }
    // const object = bodyMap.get((result.get() as any).ptr);
    // if (!object) {
    //   bullet.destroy(fromVec3);
    //   bullet.destroy(toVec3);
    //   bullet.destroy(result);
    //   return;
    // }
    // get_m_closestHitFraction(): number;
    // get_m_collisionObject(): btCollisionObject;
    const rawPosition = result.get_m_hitPointWorld();
    const rawNormal = result.get_m_hitNormalWorld();
    const fraction = result.get_m_closestHitFraction();
    const impact = fromValues$1(rawPosition.x(), rawPosition.y(), rawPosition.z());
    const normal = fromValues$1(rawNormal.x(), rawNormal.y(), rawNormal.z());
    bullet.destroy(rawNormal);
    bullet.destroy(rawPosition);
    bullet.destroy(fromVec3);
    bullet.destroy(toVec3);
    bullet.destroy(result);
    bullet.destroy(shape);
    bullet.destroy(fromTrsf);
    bullet.destroy(toTrsf);
    return { fraction, impact, normal };
};

const DISABLE_DEACTIVATION = 4;
class ConcretePhysicBody extends ContactEventHandler {
    constructor(def, rawShape) {
        super();
        this._isAlive = true;
        const bullet = WasmModuleHolder.get();
        this._customShape = rawShape;
        const tmpVec3 = new bullet.btVector3();
        this._customShape.shape.calculateLocalInertia(def.mass, tmpVec3);
        const motionState = null; // hack :(
        const rbInfo = new bullet.btRigidBodyConstructionInfo(def.mass, motionState, this._customShape.shape, tmpVec3);
        this._rawRigidBody = new bullet.btRigidBody(rbInfo);
        this.setPositionAndRotation(def.position, def.orientation);
        // this._customShape = this._getShape(def.shape);
        bullet.destroy(tmpVec3);
        bullet.destroy(rbInfo);
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        bullet.destroy(this._rawRigidBody);
        // bullet.destroy(this._customShape);
        this._customShape.cleanup();
        // hack to force it to crash if the body is reused
        this._rawRigidBody = null;
        this._isAlive = false;
    }
    isAlive() {
        return this._isAlive;
    }
    setPositionAndRotation(position, rotation) {
        const bullet = WasmModuleHolder.get();
        const newPosition = new bullet.btVector3(position[0], position[1], position[2]);
        const newRotation = new bullet.btQuaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
        const newTransform = new bullet.btTransform(newRotation, newPosition);
        this._rawRigidBody.setWorldTransform(newTransform);
        bullet.destroy(newTransform);
        bullet.destroy(newPosition);
        bullet.destroy(newRotation);
    }
    setPosition(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const rotation = this.getRotation();
        const newPosition = new bullet.btVector3(x, y, z);
        const newRotation = new bullet.btQuaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
        const newTransform = new bullet.btTransform(newRotation, newPosition);
        this._rawRigidBody.setWorldTransform(newTransform);
        bullet.destroy(newTransform);
        bullet.destroy(newPosition);
        bullet.destroy(newRotation);
    }
    setRotation(x, y, z, w) {
        const bullet = WasmModuleHolder.get();
        const origin = this.getPosition();
        const newPosition = new bullet.btVector3(origin[0], origin[1], origin[2]);
        const newRotation = new bullet.btQuaternion(x, y, z, w);
        const newTransform = new bullet.btTransform(newRotation, newPosition);
        this._rawRigidBody.setWorldTransform(newTransform);
        bullet.destroy(newTransform);
        bullet.destroy(newPosition);
        bullet.destroy(newRotation);
    }
    getPositionAndRotation(position, rotation) {
        const bullet = WasmModuleHolder.get();
        const rawTransform = this._rawRigidBody.getWorldTransform();
        const rawOrigin = rawTransform.getOrigin();
        const rawRotation = rawTransform.getRotation();
        position[0] = rawOrigin.x();
        position[1] = rawOrigin.y();
        position[2] = rawOrigin.z();
        rotation[0] = rawRotation.x();
        rotation[1] = rawRotation.y();
        rotation[2] = rawRotation.z();
        rotation[3] = rawRotation.w();
        bullet.destroy(rawRotation);
        bullet.destroy(rawOrigin);
        bullet.destroy(rawTransform);
    }
    getPosition() {
        const bullet = WasmModuleHolder.get();
        const rawTransform = this._rawRigidBody.getWorldTransform();
        const rawOrigin = rawTransform.getOrigin();
        const origin = fromValues$1(rawOrigin.x(), rawOrigin.y(), rawOrigin.z());
        bullet.destroy(rawOrigin);
        bullet.destroy(rawTransform);
        return origin;
    }
    getRotation() {
        const bullet = WasmModuleHolder.get();
        const rawTransform = this._rawRigidBody.getWorldTransform();
        const rawRotation = rawTransform.getRotation();
        const rotation = fromValues(rawRotation.x(), rawRotation.y(), rawRotation.z(), rawRotation.w());
        bullet.destroy(rawRotation);
        bullet.destroy(rawTransform);
        return rotation;
    }
    getLinearVelocity() {
        const bullet = WasmModuleHolder.get();
        const vel = this._rawRigidBody.getLinearVelocity();
        const value = fromValues$1(vel.x(), vel.y(), vel.z());
        bullet.destroy(vel);
        return value;
    }
    getAngularVelocity() {
        const bullet = WasmModuleHolder.get();
        const vel = this._rawRigidBody.getAngularVelocity();
        const value = fromValues$1(vel.x(), vel.y(), vel.z());
        bullet.destroy(vel);
        return value;
    }
    setLinearVelocity(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.setLinearVelocity(newVel);
        bullet.destroy(newVel);
    }
    setAngularVelocity(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.setAngularVelocity(newVel);
        bullet.destroy(newVel);
    }
    setLinearFactor(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.setLinearFactor(newVel);
        bullet.destroy(newVel);
    }
    setAngularFactor(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.setAngularFactor(newVel);
        bullet.destroy(newVel);
    }
    applyCentralForce(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.applyCentralForce(newVel);
        bullet.destroy(newVel);
    }
    applyCentralImpulse(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.applyCentralImpulse(newVel);
        bullet.destroy(newVel);
    }
    setDamping(linear, angular = 0) {
        this._rawRigidBody.setDamping(linear, angular);
    }
    setCcdMotionThreshold(ccdMotionThreshold) {
        this._rawRigidBody.setCcdMotionThreshold(ccdMotionThreshold);
    }
    setCcdSweptSphereRadius(radius) {
        this._rawRigidBody.setCcdSweptSphereRadius(radius);
    }
    setRestitution(restitution) {
        this._rawRigidBody.setRestitution(restitution);
    }
    setFriction(friction) {
        this._rawRigidBody.setFriction(friction);
    }
    setRollingFriction(friction) {
        this._rawRigidBody.setRollingFriction(friction);
    }
    setGravity(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawRigidBody.setGravity(newVel);
        bullet.destroy(newVel);
    }
    isStaticObject() {
        return this._rawRigidBody.isStaticObject();
    }
    isKinematicObject() {
        return this._rawRigidBody.isKinematicObject();
    }
    isStaticOrKinematicObject() {
        return this._rawRigidBody.isStaticOrKinematicObject();
    }
    isActive() {
        return (this.isStaticOrKinematicObject() || this._rawRigidBody.isActive());
    }
    enableDeactivation() {
        this._rawRigidBody.activate(true);
    }
    disableDeactivation() {
        this._rawRigidBody.setActivationState(DISABLE_DEACTIVATION);
    }
    cannotDeactivate() {
        return (this.isStaticOrKinematicObject() ||
            this._rawRigidBody.getActivationState() == DISABLE_DEACTIVATION);
    }
    canDeactivate() {
        return !this.cannotDeactivate();
    }
}

class ConcretePhysicVehicle {
    constructor(rawDynamicsWorld, chassisBody, def) {
        const bullet = WasmModuleHolder.get();
        this._chassisBody = chassisBody;
        this._vehicleTuning = new bullet.btVehicleTuning();
        this._defaultVehicleRaycaster = new bullet.btDefaultVehicleRaycaster(rawDynamicsWorld);
        this._rawVehicle = new bullet.btRaycastVehicle(this._vehicleTuning, chassisBody._rawRigidBody, this._defaultVehicleRaycaster);
        this._rawVehicle.setCoordinateSystem(def.coordinateSystem[0], def.coordinateSystem[1], def.coordinateSystem[2]);
        const groundDirection = new bullet.btVector3(def.groundDirection[0], def.groundDirection[1], def.groundDirection[2]);
        const rotationAxis = new bullet.btVector3(def.rotationAxis[0], def.rotationAxis[1], def.rotationAxis[2]);
        const connectionPoint = new bullet.btVector3();
        for (let ii = 0; ii < def.wheels.length; ++ii) {
            const current = def.wheels[ii];
            connectionPoint.setValue(current.connectionPoint[0], current.connectionPoint[1], current.connectionPoint[2]);
            const wheelInfo = this._rawVehicle.addWheel(connectionPoint, // connectionPointCS0,
            groundDirection, // wheelDirectionCS0,
            rotationAxis, // wheelAxleCS,
            def.suspensionRestLength, def.wheelRadius, this._vehicleTuning, current.isFrontWheel);
            wheelInfo.set_m_suspensionStiffness(def.suspensionStiffness);
            wheelInfo.set_m_wheelsDampingRelaxation(def.wheelsDampingRelaxation);
            wheelInfo.set_m_wheelsDampingCompression(def.wheelsDampingCompression);
            wheelInfo.set_m_frictionSlip(def.wheelFriction);
            wheelInfo.set_m_rollInfluence(def.rollInfluence);
        }
        bullet.destroy(connectionPoint);
        bullet.destroy(groundDirection);
        bullet.destroy(rotationAxis);
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        bullet.destroy(this._rawVehicle);
        bullet.destroy(this._defaultVehicleRaycaster);
        bullet.destroy(this._vehicleTuning);
    }
    getChassisBody() {
        return this._chassisBody;
    }
    setSteeringValue(index, angle) {
        this._rawVehicle.setSteeringValue(angle, index);
    }
    applyEngineForce(index, force) {
        this._rawVehicle.applyEngineForce(force, index);
    }
    setBrake(index, force) {
        this._rawVehicle.setBrake(force, index);
    }
    getWheeTransforms() {
        const bullet = WasmModuleHolder.get();
        const allTransforms = [];
        const interpolatedTransform = true;
        const numWheels = this._rawVehicle.getNumWheels();
        for (let ii = 0; ii < numWheels; ++ii) {
            this._rawVehicle.updateWheelTransform(ii, interpolatedTransform);
            const rawTransform = this._rawVehicle.getWheelTransformWS(ii);
            const rawOrigin = rawTransform.getOrigin();
            const rawRotation = rawTransform.getRotation();
            allTransforms.push({
                position: fromValues$1(rawOrigin.x(), rawOrigin.y(), rawOrigin.z()),
                rotation: fromValues(rawRotation.x(), rawRotation.y(), rawRotation.z(), rawRotation.w()),
            });
            bullet.destroy(rawRotation);
            bullet.destroy(rawOrigin);
            bullet.destroy(rawTransform);
        }
        return allTransforms;
    }
}

class ConcreteGeneric6DofConstraint {
    constructor(def) {
        this._bodyA = def.bodyA;
        this._bodyB = def.bodyB;
        const bullet = WasmModuleHolder.get();
        const rawRigidBodyA = def.bodyA._rawRigidBody;
        const rawRigidBodyB = def.bodyB._rawRigidBody;
        const newRotation = new bullet.btQuaternion(0, 0, 1, 0);
        const newPositionA = new bullet.btVector3(def.frameA[0], def.frameA[1], def.frameA[2]);
        const newTransformA = new bullet.btTransform(newRotation, newPositionA);
        const newPositionB = new bullet.btVector3(def.frameB[0], def.frameB[1], def.frameB[2]);
        const newTransformB = new bullet.btTransform(newRotation, newPositionB);
        this._rawConstraint = new bullet.btGeneric6DofSpringConstraint(rawRigidBodyA, rawRigidBodyB, newTransformA, newTransformB, def.useReferenceFrameA);
        this._rawConstraint.enableSpring(0, false);
        this._rawConstraint.enableSpring(1, false);
        this._rawConstraint.enableSpring(2, false);
        this._rawConstraint.setStiffness(0, 1);
        this._rawConstraint.setStiffness(1, 1);
        this._rawConstraint.setStiffness(2, 1);
        this._rawConstraint.setDamping(0, 1);
        this._rawConstraint.setDamping(1, 1);
        this._rawConstraint.setDamping(2, 1);
        bullet.destroy(newTransformA);
        bullet.destroy(newTransformB);
        bullet.destroy(newPositionA);
        bullet.destroy(newPositionB);
        bullet.destroy(newRotation);
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        bullet.destroy(this._rawConstraint);
    }
    setLinearLowerLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setLinearLowerLimit(newVal);
        bullet.destroy(newVal);
    }
    setLinearUpperLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setLinearUpperLimit(newVal);
        bullet.destroy(newVal);
    }
    setAngularLowerLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setAngularLowerLimit(newVal);
        bullet.destroy(newVal);
    }
    setAngularUpperLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setAngularUpperLimit(newVal);
        bullet.destroy(newVal);
    }
}

class ConcreteHingeConstraint {
    constructor(def) {
        this._bodyA = def.bodyA;
        this._bodyB = def.bodyB;
        const bullet = WasmModuleHolder.get();
        const rawRigidBodyA = def.bodyA._rawRigidBody;
        const rawRigidBodyB = def.bodyB._rawRigidBody;
        // const newRotation = new bullet.btQuaternion(0, 0, 1, 0);
        const pivotInA = new bullet.btVector3(def.pivotInA[0], def.pivotInA[1], def.pivotInA[2]);
        const pivotInB = new bullet.btVector3(def.pivotInB[0], def.pivotInB[1], def.pivotInB[2]);
        const axisInA = new bullet.btVector3(def.axisInA[0], def.axisInA[1], def.axisInA[2]);
        const axisInB = new bullet.btVector3(def.axisInB[0], def.axisInB[1], def.axisInB[2]);
        this._rawConstraint = new bullet.btHingeConstraint(rawRigidBodyA, rawRigidBodyB, pivotInA, pivotInB, axisInA, axisInB, def.useReferenceFrameA);
        // this._rawConstraint.enableSpring(0, false);
        // this._rawConstraint.enableSpring(1, false);
        // this._rawConstraint.enableSpring(2, false);
        // this._rawConstraint.setStiffness(0, 1);
        // this._rawConstraint.setStiffness(1, 1);
        // this._rawConstraint.setStiffness(2, 1);
        // this._rawConstraint.setDamping(0, 1);
        // this._rawConstraint.setDamping(1, 1);
        // this._rawConstraint.setDamping(2, 1);
        bullet.destroy(pivotInA);
        bullet.destroy(pivotInB);
        bullet.destroy(axisInA);
        bullet.destroy(axisInB);
        // bullet.destroy(newRotation);
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        bullet.destroy(this._rawConstraint);
    }
    setLimit(low, high, softness, biasFactor, relaxationFactor) {
        this._rawConstraint.setLimit(low, high, softness, biasFactor, relaxationFactor);
    }
    enableAngularMotor(enableMotor, targetVelocity, maxMotorImpulse) {
        this._rawConstraint.enableAngularMotor(enableMotor, targetVelocity, maxMotorImpulse);
    }
    // setAngularOnly(angularOnly: boolean): void {
    //   this._rawConstraint.setAngularOnly(angularOnly);
    // }
    enableMotor(enableMotor) {
        this._rawConstraint.enableMotor(enableMotor);
    }
    setMaxMotorImpulse(maxMotorImpulse) {
        this._rawConstraint.setMaxMotorImpulse(maxMotorImpulse);
    }
    setMotorTarget(targetAngle, dt) {
        this._rawConstraint.setMotorTarget(targetAngle, dt);
    }
}

// btGeneric6DofConstraint2
var RotationOrder;
(function (RotationOrder) {
    RotationOrder[RotationOrder["XYZ"] = 0] = "XYZ";
    RotationOrder[RotationOrder["XZY"] = 1] = "XZY";
    RotationOrder[RotationOrder["YXZ"] = 2] = "YXZ";
    RotationOrder[RotationOrder["YZX"] = 3] = "YZX";
    RotationOrder[RotationOrder["ZXY"] = 4] = "ZXY";
    RotationOrder[RotationOrder["ZYX"] = 5] = "ZYX";
})(RotationOrder || (RotationOrder = {}));
class ConcreteGeneric6DofConstraint2 {
    constructor(def) {
        this._bodyA = def.bodyA;
        this._bodyB = def.bodyB;
        const bullet = WasmModuleHolder.get();
        const rawRigidBodyA = def.bodyA._rawRigidBody;
        const rawRigidBodyB = def.bodyB._rawRigidBody;
        const newRotation = new bullet.btQuaternion(0, 0, 1, 0);
        const newPositionA = new bullet.btVector3(def.frameA[0], def.frameA[1], def.frameA[2]);
        const newTransformA = new bullet.btTransform(newRotation, newPositionA);
        const newPositionB = new bullet.btVector3(def.frameB[0], def.frameB[1], def.frameB[2]);
        const newTransformB = new bullet.btTransform(newRotation, newPositionB);
        this._rawConstraint = new bullet.bjtsGeneric6DofSpring2Constraint(rawRigidBodyA, rawRigidBodyB, newTransformA, newTransformB, def.rotationOrder);
        this._rawConstraint.enableSpring(0, false);
        this._rawConstraint.enableSpring(1, false);
        this._rawConstraint.enableSpring(2, false);
        this._rawConstraint.setStiffness(0, 1);
        this._rawConstraint.setStiffness(1, 1);
        this._rawConstraint.setStiffness(2, 1);
        this._rawConstraint.setDamping(0, 1);
        this._rawConstraint.setDamping(1, 1);
        this._rawConstraint.setDamping(2, 1);
        bullet.destroy(newTransformA);
        bullet.destroy(newTransformB);
        bullet.destroy(newPositionA);
        bullet.destroy(newPositionB);
        bullet.destroy(newRotation);
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        bullet.destroy(this._rawConstraint);
    }
    setLinearLowerLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setLinearLowerLimit(newVal);
        bullet.destroy(newVal);
    }
    setLinearUpperLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setLinearUpperLimit(newVal);
        bullet.destroy(newVal);
    }
    setAngularLowerLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setAngularLowerLimit(newVal);
        bullet.destroy(newVal);
    }
    setAngularUpperLimit(val) {
        const bullet = WasmModuleHolder.get();
        const newVal = new bullet.btVector3(val[0], val[1], val[2]);
        this._rawConstraint.setAngularUpperLimit(newVal);
        bullet.destroy(newVal);
    }
}

const rayCast = (rawDynamicsWorld, bodyMap, def) => {
    const bullet = WasmModuleHolder.get();
    const fromVec3 = new bullet.btVector3(def.from[0], def.from[1], def.from[2]);
    const toVec3 = new bullet.btVector3(def.to[0], def.to[1], def.to[2]);
    const result = new bullet.ClosestRayResultCallback(fromVec3, toVec3);
    result.set_m_collisionFilterGroup(def.collisionFilterGroup);
    result.set_m_collisionFilterMask(def.collisionFilterMask);
    rawDynamicsWorld.rayTest(fromVec3, toVec3, result);
    if (!result.hasHit()) {
        bullet.destroy(fromVec3);
        bullet.destroy(toVec3);
        bullet.destroy(result);
        return;
    }
    const object = bodyMap.get(result.get_m_collisionObject().ptr);
    if (!object) {
        bullet.destroy(fromVec3);
        bullet.destroy(toVec3);
        bullet.destroy(result);
        return;
    }
    // get_m_closestHitFraction(): number;
    // get_m_collisionObject(): btCollisionObject;
    const rawNormal = result.get_m_hitNormalWorld();
    const rawPosition = result.get_m_hitPointWorld();
    const impact = fromValues$1(rawPosition.x(), rawPosition.y(), rawPosition.z());
    const normal = fromValues$1(rawNormal.x(), rawNormal.y(), rawNormal.z());
    bullet.destroy(rawNormal);
    bullet.destroy(rawPosition);
    bullet.destroy(fromVec3);
    bullet.destroy(toVec3);
    bullet.destroy(result);
    return {
        object,
        fraction: result.get_m_closestHitFraction(),
        impact,
        normal,
    };
};

class PhysicWorld extends ContactEventHandler {
    // private _queryShape = new QueryShape();
    constructor() {
        super();
        this._bodyMap = new Map();
        this._vehicleMap = new Map();
        this._constraintMap1 = new Map();
        this._allConstraints1 = [];
        this._constraintMap2 = new Map();
        this._allConstraints2 = [];
        this._constraintMap3 = new Map();
        this._allConstraints3 = [];
        const bullet = WasmModuleHolder.get();
        // bullet.listenToContactCallbacks();
        this._collisionConf = new bullet.btDefaultCollisionConfiguration();
        this._dispatcher = new bullet.btCollisionDispatcher(this._collisionConf);
        this._broadPhase = new bullet.btDbvtBroadphase();
        this._solver = new bullet.btSequentialImpulseConstraintSolver();
        // this._rawDynamicsWorld = new bullet.btDiscreteDynamicsWorld(this._dispatcher, this._broadPhase, this._solver, this._collisionConf);
        this._rawDynamicsWorld = new bullet.btjsDynamicsWorld(this._dispatcher, this._broadPhase, this._solver, this._collisionConf);
        this._rawDynamicsWorld.setGravity(new bullet.btVector3(0, 0, -10));
        this._initCollisionEvents();
    }
    dispose() {
        const bullet = WasmModuleHolder.get();
        this._allConstraints1.forEach((currConstraint) => currConstraint.dispose());
        this._allConstraints1.length = 0;
        this._constraintMap1.clear();
        this._allConstraints2.forEach((currConstraint) => currConstraint.dispose());
        this._allConstraints2.length = 0;
        this._constraintMap2.clear();
        [...this._vehicleMap.values()].forEach((currVehicle) => currVehicle.dispose());
        this._vehicleMap.clear();
        [...this._bodyMap.values()].forEach((currBody) => currBody.dispose());
        this._bodyMap.clear();
        bullet.destroy(this._rawDynamicsWorld);
        bullet.destroy(this._solver);
        bullet.destroy(this._broadPhase);
        bullet.destroy(this._dispatcher);
        bullet.destroy(this._collisionConf);
    }
    createRigidBody(def) {
        var _a, _b;
        const newShape = this._getShape(def.shape, def.mass > 0);
        const newBody = new ConcretePhysicBody(def, newShape);
        // if (def.shape.type === 'mesh') {
        //   const meshShape = newBody._rawShape as bulletJs.btGImpactMeshShape;
        //   newBody._rawShape = this._rawDynamicsWorld.createCompoundFromGimpactShape(meshShape, 0);
        // } else {
        // }
        this._rawDynamicsWorld.addRigidBody(newBody._rawRigidBody, (_a = def.collisionFilterGroup) !== null && _a !== void 0 ? _a : -1, (_b = def.collisionFilterMask) !== null && _b !== void 0 ? _b : -1);
        // hack, we use the wasm heap memory address as an identifier, it's faster
        this._bodyMap.set(newBody._rawRigidBody.ptr, newBody);
        return newBody;
    }
    _getShape(def, isDynamic) {
        const bullet = WasmModuleHolder.get();
        switch (def.type) {
            case 'box': {
                const boxHalfExtent = new bullet.btVector3();
                boxHalfExtent.setValue(def.size[0] * 0.5, def.size[1] * 0.5, def.size[2] * 0.5);
                const rawShape = new bullet.btBoxShape(boxHalfExtent);
                bullet.destroy(boxHalfExtent);
                return {
                    shape: rawShape,
                    cleanup: () => bullet.destroy(rawShape),
                };
            }
            case 'sphere': {
                const rawShape = new bullet.btSphereShape(def.radius);
                return {
                    shape: rawShape,
                    cleanup: () => bullet.destroy(rawShape),
                };
            }
            case 'cylinder': {
                const bVec = new bullet.btVector3(def.radius, def.radius, def.length);
                const rawShape = new bullet.btCylinderShape(bVec);
                return {
                    shape: rawShape,
                    cleanup: () => {
                        bullet.destroy(rawShape);
                        bullet.destroy(bVec);
                    },
                };
            }
            case 'capsule': {
                const rawShape = new bullet.btCapsuleShape(def.radius, def.length);
                return {
                    shape: rawShape,
                    cleanup: () => bullet.destroy(rawShape),
                };
            }
            case 'mesh': {
                // TODO: memory leak
                const triangleMesh = new bullet.btTriangleMesh();
                const bVec1 = new bullet.btVector3();
                const bVec2 = new bullet.btVector3();
                const bVec3 = new bullet.btVector3();
                def.triangles.forEach(([vec1, vec2, vec3]) => {
                    bVec1.setValue(vec1[0], vec1[1], vec1[2]);
                    bVec2.setValue(vec2[0], vec2[1], vec2[2]);
                    bVec3.setValue(vec3[0], vec3[1], vec3[2]);
                    triangleMesh.addTriangle(bVec1, bVec2, bVec3);
                });
                bullet.destroy(bVec1);
                bullet.destroy(bVec2);
                bullet.destroy(bVec3);
                if (isDynamic) {
                    const meshShape = new bullet.btGImpactMeshShape(triangleMesh);
                    const rawShape = this._rawDynamicsWorld.createCompoundFromGimpactShape(meshShape, 0);
                    return {
                        shape: rawShape,
                        cleanup: () => {
                            bullet.destroy(rawShape);
                            bullet.destroy(meshShape);
                            bullet.destroy(triangleMesh);
                        },
                    };
                }
                const rawShape = new bullet.btBvhTriangleMeshShape(triangleMesh, true);
                return {
                    shape: rawShape,
                    cleanup: () => {
                        bullet.destroy(rawShape);
                        bullet.destroy(triangleMesh);
                    },
                };
            }
            case 'compound': {
                const rawCompound = new bullet.btCompoundShape();
                const allRawShapes = [];
                const localVec3 = new bullet.btVector3();
                const localQuat = new bullet.btQuaternion(0, 0, 1, 0);
                const localTransform = new bullet.btTransform();
                for (const { shape, position, orientation } of def.shapes) {
                    const rawValues = this._getShape(shape, isDynamic);
                    allRawShapes.push(rawValues);
                    localVec3.setValue(position[0], position[1], position[2]);
                    localQuat.setValue(orientation[0], orientation[1], orientation[2], orientation[3]);
                    localTransform.setOrigin(localVec3);
                    localTransform.setRotation(localQuat);
                    rawCompound.addChildShape(localTransform, rawValues.shape);
                    // currShape.position
                    // currShape.orientation
                    // currShape.shape
                }
                bullet.destroy(localVec3);
                bullet.destroy(localQuat);
                bullet.destroy(localTransform);
                return {
                    shape: rawCompound,
                    cleanup: () => {
                        bullet.destroy(rawCompound);
                        for (const currRawShape of allRawShapes) {
                            bullet.destroy(currRawShape);
                        }
                    },
                };
            }
        }
    }
    destroyRigidBody(rigidBody) {
        const rawRigidBody = rigidBody._rawRigidBody;
        const bodyPtr = rawRigidBody.ptr;
        this._rawDynamicsWorld.removeRigidBody(rawRigidBody);
        // hack, we use the wasm heap memory address as an identifier, it's faster
        this._bodyMap.delete(bodyPtr);
        rigidBody.dispose();
        // destroy any constraints that might affect this body
        const bodyListOfConstraints = this._constraintMap1.get(bodyPtr);
        if (bodyListOfConstraints) {
            for (const currConstraint of bodyListOfConstraints) {
                this.destroyGeneric6DofConstraint(currConstraint);
            }
        }
        // destroy any constraints that might affect this body
        const bodyListOfConstraints2 = this._constraintMap2.get(bodyPtr);
        if (bodyListOfConstraints2) {
            for (const currConstraint of bodyListOfConstraints2) {
                this.destroyHingeConstraint(currConstraint);
            }
        }
        // TODO: zombie bodies could still be ref/used, can it be prevented?
        // -> raw rigid body is set to null inside
        // -> should find a friendlier way
    }
    createVehicle(def) {
        const newBody = this.createRigidBody(def.chassisDef);
        const rawRigidBody = newBody;
        const vehicle = new ConcretePhysicVehicle(this._rawDynamicsWorld, rawRigidBody, def);
        this._rawDynamicsWorld.addAction(vehicle._rawVehicle);
        // hack, we use the wasm heap memory address as an identifier, it's faster
        this._vehicleMap.set(vehicle.ptr, vehicle);
        return vehicle;
    }
    destroyVehicle(vehicle) {
        this.destroyRigidBody(vehicle._chassisBody);
        this._rawDynamicsWorld.removeAction(vehicle._rawVehicle);
        // hack, we use the wasm heap memory address as an identifier, it's faster
        this._vehicleMap.delete(vehicle.ptr);
        vehicle.dispose();
        // TODO: zombie vehicles could still be ref/used, can it be prevented?
    }
    createGeneric6DofConstraint(def) {
        const constraint = new ConcreteGeneric6DofConstraint(def);
        // get or create
        const ptrA = def.bodyA._rawRigidBody.ptr;
        let bodyListA = this._constraintMap1.get(ptrA);
        if (!bodyListA) {
            bodyListA = [];
            this._constraintMap1.set(ptrA, bodyListA);
        }
        // save constraint against bodyA pointer value
        bodyListA.push(constraint);
        // get or create
        const ptrB = def.bodyB._rawRigidBody.ptr;
        let bodyListB = this._constraintMap1.get(ptrB);
        if (!bodyListB) {
            bodyListB = [];
            this._constraintMap1.set(ptrA, bodyListB);
        }
        // save constraint against bodyB pointer value
        bodyListB.push(constraint);
        this._allConstraints1.push(constraint);
        this._rawDynamicsWorld.addConstraint(constraint._rawConstraint, true);
        // TODO: save in map
        // TODO: discard if one of the body is removed
        return constraint;
    }
    destroyGeneric6DofConstraint(constraint) {
        const concrete = constraint;
        this._rawDynamicsWorld.removeConstraint(concrete._rawConstraint);
        // remove constraints from the map value (bodyA)
        const bodyListA = this._constraintMap1.get(concrete._bodyA._rawRigidBody.ptr);
        if (bodyListA) {
            // find the constraint and remove it
            const index = bodyListA.indexOf(concrete);
            if (index >= 0) {
                bodyListA.splice(index, 0);
            }
        }
        // remove constraints from the map (bodyB)
        const bodyListB = this._constraintMap1.get(concrete._bodyB._rawRigidBody.ptr);
        if (bodyListB) {
            // find the constraint and remove it
            const index = bodyListB.indexOf(concrete);
            if (index >= 0) {
                bodyListB.splice(index, 0);
            }
        }
        // remove from list of all constraints
        const index = this._allConstraints1.indexOf(concrete);
        if (index >= 0) {
            this._allConstraints1.splice(index, 0);
        }
        concrete.dispose();
    }
    createHingeConstraint(def) {
        const constraint = new ConcreteHingeConstraint(def);
        // get or create
        const ptrA = def.bodyA._rawRigidBody.ptr;
        let bodyListA = this._constraintMap2.get(ptrA);
        if (!bodyListA) {
            bodyListA = [];
            this._constraintMap2.set(ptrA, bodyListA);
        }
        // save constraint against bodyA pointer value
        bodyListA.push(constraint);
        // get or create
        const ptrB = def.bodyB._rawRigidBody.ptr;
        let bodyListB = this._constraintMap2.get(ptrB);
        if (!bodyListB) {
            bodyListB = [];
            this._constraintMap2.set(ptrA, bodyListB);
        }
        // save constraint against bodyB pointer value
        bodyListB.push(constraint);
        this._allConstraints2.push(constraint);
        this._rawDynamicsWorld.addConstraint(constraint._rawConstraint, true);
        // TODO: save in map
        // TODO: discard if one of the body is removed
        return constraint;
    }
    destroyHingeConstraint(constraint) {
        const concrete = constraint;
        this._rawDynamicsWorld.removeConstraint(concrete._rawConstraint);
        // remove constraints from the map value (bodyA)
        const bodyListA = this._constraintMap2.get(concrete._bodyA._rawRigidBody.ptr);
        if (bodyListA) {
            // find the constraint and remove it
            const index = bodyListA.indexOf(concrete);
            if (index >= 0) {
                bodyListA.splice(index, 0);
            }
        }
        // remove constraints from the map (bodyB)
        const bodyListB = this._constraintMap2.get(concrete._bodyB._rawRigidBody.ptr);
        if (bodyListB) {
            // find the constraint and remove it
            const index = bodyListB.indexOf(concrete);
            if (index >= 0) {
                bodyListB.splice(index, 0);
            }
        }
        // remove from list of all constraints
        const index = this._allConstraints2.indexOf(concrete);
        if (index >= 0) {
            this._allConstraints2.splice(index, 0);
        }
        concrete.dispose();
    }
    createGeneric6DofConstraint2(def) {
        const constraint = new ConcreteGeneric6DofConstraint2(def);
        // get or create
        const ptrA = def.bodyA._rawRigidBody.ptr;
        let bodyListA = this._constraintMap3.get(ptrA);
        if (!bodyListA) {
            bodyListA = [];
            this._constraintMap3.set(ptrA, bodyListA);
        }
        // save constraint against bodyA pointer value
        bodyListA.push(constraint);
        // get or create
        const ptrB = def.bodyB._rawRigidBody.ptr;
        let bodyListB = this._constraintMap3.get(ptrB);
        if (!bodyListB) {
            bodyListB = [];
            this._constraintMap3.set(ptrA, bodyListB);
        }
        // save constraint against bodyB pointer value
        bodyListB.push(constraint);
        this._allConstraints3.push(constraint);
        this._rawDynamicsWorld.addConstraint(constraint._rawConstraint, true);
        // TODO: save in map
        // TODO: discard if one of the body is removed
        return constraint;
    }
    destroyGeneric6DofConstraint2(constraint) {
        const concrete = constraint;
        this._rawDynamicsWorld.removeConstraint(concrete._rawConstraint);
        // remove constraints from the map value (bodyA)
        const bodyListA = this._constraintMap3.get(concrete._bodyA._rawRigidBody.ptr);
        if (bodyListA) {
            // find the constraint and remove it
            const index = bodyListA.indexOf(concrete);
            if (index >= 0) {
                bodyListA.splice(index, 0);
            }
        }
        // remove constraints from the map (bodyB)
        const bodyListB = this._constraintMap3.get(concrete._bodyB._rawRigidBody.ptr);
        if (bodyListB) {
            // find the constraint and remove it
            const index = bodyListB.indexOf(concrete);
            if (index >= 0) {
                bodyListB.splice(index, 0);
            }
        }
        // remove from list of all constraints
        const index = this._allConstraints3.indexOf(concrete);
        if (index >= 0) {
            this._allConstraints3.splice(index, 0);
        }
        concrete.dispose();
    }
    rayCast(from, to) {
        return rayCast(this._rawDynamicsWorld, this._bodyMap, {
            from,
            to,
            collisionFilterGroup: -1,
            collisionFilterMask: -1
        });
    }
    convexSweep(from, to, radius) {
        return convexSweep(this._rawDynamicsWorld, {
            from,
            to,
            collisionFilterGroup: -1,
            collisionFilterMask: -1,
            radius: radius
        });
    }
    _initCollisionEvents() {
        const eventFlags = {
            world: 1 << 0,
            bodyA: 1 << 1,
            bodyB: 1 << 2
        };
        const _onContactChange = (event) => {
            const bodyA = event.data.getBodyA();
            const bodyB = event.data.getBodyB();
            const rigidBodyA = this._bodyMap.get(bodyA.ptr);
            const rigidBodyB = this._bodyMap.get(bodyB.ptr);
            // console.log('_onContactChange');
            if (!rigidBodyA || !rigidBodyB) {
                return;
            }
            const type = event.type;
            const collisionFlag = ((this.isEventListenedTo(type) ? eventFlags.world : 0) |
                (rigidBodyA.isEventListenedTo(type) ? eventFlags.bodyA : 0) |
                (rigidBodyB.isEventListenedTo(type) ? eventFlags.bodyB : 0));
            if (collisionFlag == 0) {
                return;
            }
            const contactId = event.data.getId();
            const bulletPos = event.data.getPosition();
            const bulletNormalB = event.data.getNormalB();
            const position = {
                x: bulletPos.x(),
                y: bulletPos.y(),
                z: bulletPos.z(),
            };
            const normalB = {
                x: bulletNormalB.x(),
                y: bulletNormalB.y(),
                z: bulletNormalB.z(),
            };
            if (collisionFlag & eventFlags.world) {
                this.dispatchEvent({
                    type,
                    data: {
                        contactId,
                        rigidBodyA,
                        rigidBodyB,
                        position: fromValues$1(position.x, position.y, position.z),
                        normalB: fromValues$1(normalB.x, normalB.y, normalB.z),
                    }
                });
            }
            if (collisionFlag & eventFlags.bodyA) {
                rigidBodyA.dispatchEvent({
                    type,
                    data: {
                        contactId,
                        other: rigidBodyB,
                        // position: { x: position.x, y: position.y, z: position.z },
                        // normalB: { x: -normalB.x, y: -normalB.y, z: -normalB.z }
                        position: fromValues$1(position.x, position.y, position.z),
                        normalB: fromValues$1(-normalB.x, -normalB.y, -normalB.z),
                    }
                });
            }
            if (collisionFlag & eventFlags.bodyB) {
                rigidBodyB.dispatchEvent({
                    type,
                    data: {
                        contactId,
                        other: rigidBodyA,
                        // position: { x: position.x, y: position.y, z: position.z },
                        // normalB: { x: normalB.x, y: normalB.y, z: normalB.z }
                        position: fromValues$1(position.x, position.y, position.z),
                        normalB: fromValues$1(normalB.x, normalB.y, normalB.z),
                    }
                });
            }
        };
        // TODO: hacky
        const bullet = WasmModuleHolder.get();
        bullet.on("beginContact", _onContactChange);
        bullet.on("updateContact", _onContactChange);
        bullet.on("endContact", _onContactChange);
        bullet.on("ccdContact", _onContactChange);
        bullet.listenToContactCallbacks();
    }
    stepSimulation(deltaTimeSec, maxSubSteps = 3, fixedStep = 1 / 60) {
        this._rawDynamicsWorld.stepSimulation(deltaTimeSec, maxSubSteps, fixedStep);
    }
    setGravity(x, y, z) {
        const bullet = WasmModuleHolder.get();
        const newVel = new bullet.btVector3(x, y, z);
        this._rawDynamicsWorld.setGravity(newVel);
        bullet.destroy(newVel);
    }
    setDebugWireframeCallback(callback) {
        const bullet = WasmModuleHolder.get();
        const contactPtr = bullet.addFunction(callback, "vfffffffff"); // vfffffffff -> Void Float Float ...
        this._rawDynamicsWorld.setDebugWireframeCallback(contactPtr);
    }
    setDebugWireframeFeaturesFlag(flag) {
        this._rawDynamicsWorld.setDebugWireframeFeaturesFlag(flag);
    }
    debugDrawWorld() {
        this._rawDynamicsWorld.debugDrawWorld();
    }
}

var DebugDrawFlags;
(function (DebugDrawFlags) {
    DebugDrawFlags[DebugDrawFlags["DBG_NoDebug"] = 0] = "DBG_NoDebug";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawWireframe"] = 1] = "DBG_DrawWireframe";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawAabb"] = 2] = "DBG_DrawAabb";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawFeaturesText"] = 4] = "DBG_DrawFeaturesText";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawContactPoints"] = 8] = "DBG_DrawContactPoints";
    DebugDrawFlags[DebugDrawFlags["DBG_NoDeactivation"] = 16] = "DBG_NoDeactivation";
    DebugDrawFlags[DebugDrawFlags["DBG_NoHelpText"] = 32] = "DBG_NoHelpText";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawText"] = 64] = "DBG_DrawText";
    DebugDrawFlags[DebugDrawFlags["DBG_ProfileTimings"] = 128] = "DBG_ProfileTimings";
    DebugDrawFlags[DebugDrawFlags["DBG_EnableSatComparison"] = 256] = "DBG_EnableSatComparison";
    DebugDrawFlags[DebugDrawFlags["DBG_DisableBulletLCP"] = 512] = "DBG_DisableBulletLCP";
    DebugDrawFlags[DebugDrawFlags["DBG_EnableCCD"] = 1024] = "DBG_EnableCCD";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawConstraints"] = 2048] = "DBG_DrawConstraints";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawConstraintLimits"] = 4096] = "DBG_DrawConstraintLimits";
    DebugDrawFlags[DebugDrawFlags["DBG_FastWireframe"] = 8192] = "DBG_FastWireframe";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawNormals"] = 16384] = "DBG_DrawNormals";
    DebugDrawFlags[DebugDrawFlags["DBG_DrawFrames"] = 32768] = "DBG_DrawFrames";
})(DebugDrawFlags || (DebugDrawFlags = {}));

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ConcretePhysicBody: ConcretePhysicBody,
    ConcretePhysicVehicle: ConcretePhysicVehicle,
    ContactEventHandler: ContactEventHandler,
    get DebugDrawFlags () { return DebugDrawFlags; },
    PhysicWorld: PhysicWorld,
    get RotationOrder () { return RotationOrder; },
    WasmModuleHolder: WasmModuleHolder,
    convexSweep: convexSweep,
    rayCast: rayCast
});

exports.BrowserFrankenPhysWasmModule = BrowserFrankenPhysWasmModule;
exports.physics = index;
