/* glaive version 1.1.2 */
;(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
      ? define(["exports"], factory)
      : factory((global.glaive = {}))
})(this, function(exports) {
  "use strict"

  var is = new Proxy(
    {},
    {
      get: function get(target, name) {
        return function(value) {
          return (
            Object.prototype.toString.call(value) === "[object " + name + "]"
          )
        }
      },
    },
  )

  var asyncGenerator = (function() {
    function AwaitValue(value) {
      this.value = value
    }

    function AsyncGenerator(gen) {
      var front, back

      function send(key, arg) {
        return new Promise(function(resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null,
          }

          if (back) {
            back = back.next = request
          } else {
            front = back = request
            resume(key, arg)
          }
        })
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg)
          var value = result.value

          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(
              function(arg) {
                resume("next", arg)
              },
              function(arg) {
                resume("throw", arg)
              },
            )
          } else {
            settle(result.done ? "return" : "normal", result.value)
          }
        } catch (err) {
          settle("throw", err)
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true,
            })
            break

          case "throw":
            front.reject(value)
            break

          default:
            front.resolve({
              value: value,
              done: false,
            })
            break
        }

        front = front.next

        if (front) {
          resume(front.key, front.arg)
        } else {
          back = null
        }
      }

      this._invoke = send

      if (typeof gen.return !== "function") {
        this.return = undefined
      }
    }

    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
        return this
      }
    }

    AsyncGenerator.prototype.next = function(arg) {
      return this._invoke("next", arg)
    }

    AsyncGenerator.prototype.throw = function(arg) {
      return this._invoke("throw", arg)
    }

    AsyncGenerator.prototype.return = function(arg) {
      return this._invoke("return", arg)
    }

    return {
      wrap: function(fn) {
        return function() {
          return new AsyncGenerator(fn.apply(this, arguments))
        }
      },
      await: function(value) {
        return new AwaitValue(value)
      },
    }
  })()

  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function")
    }
  }

  var createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i]
        descriptor.enumerable = descriptor.enumerable || false
        descriptor.configurable = true
        if ("value" in descriptor) descriptor.writable = true
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }

    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps)
      if (staticProps) defineProperties(Constructor, staticProps)
      return Constructor
    }
  })()

  var toConsumableArray = function(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
        arr2[i] = arr[i]

      return arr2
    } else {
      return Array.from(arr)
    }
  }

  var DI = (function() {
    function DI(config, callback) {
      classCallCheck(this, DI)

      this._config = config
      this._callback = callback
      this._modules = []
      this._module = {}
      this.initialize()
      this.bootstrap().then(this._complete.bind(this))
    }

    createClass(DI, [
      {
        key: "_complete",
        value: function _complete() {
          this._callback && this._callback(this)
          this.initiated = true
          return this
        },
      },
      {
        key: "_queue",
        value: function _queue(modules, list) {
          var restModules = []
          modules.map(function(_ref) {
            var moduleName = _ref.moduleName,
              _ref$dependence = _ref.dependence,
              dependence = _ref$dependence === undefined ? [] : _ref$dependence

            var isNoneDependence = dependence.length === 0
            var rest = []
              .concat(toConsumableArray(new Set(dependence.concat(list))))
              .filter(function(item) {
                return !list.includes(item)
              })
            var isDepended = rest.length === 0
            if (isNoneDependence || isDepended) {
              list.push(moduleName)
            } else {
              restModules.push({
                moduleName: moduleName,
                dependence: dependence,
              })
            }
          })
          if (restModules.length > 0) {
            this._queue(restModules, list)
          }
        },
      },
      {
        key: "_filter",
        value: function _filter(injected, dependence, injectedDependencies) {
          return dependence
            .map(function(item, index) {
              return {
                moduleName: item,
                module: injected[index],
              }
            })
            .filter(function(_ref2) {
              var moduleName = _ref2.moduleName
              return injectedDependencies.includes(moduleName)
            })
            .map(function(_ref3) {
              var module = _ref3.module
              return module
            })
        },
      },
      {
        key: "initialize",
        value: function initialize() {
          throw new Error(
            "Please set initialization Dependency Injection configuration.",
          )
        },
      },
      {
        key: "inject",
        value: function inject(module) {
          var _this = this

          var dependencies =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : []
          var initCallback = arguments[2]

          var moduleName = module.name
          var beforeDependencies = module._dependencies || []
          var dependence = [].concat(
            toConsumableArray(new Set(beforeDependencies.concat(dependencies))),
          )
          var initialize = async function initialize() {
            for (
              var _len = arguments.length, injected = Array(_len), _key = 0;
              _key < _len;
              _key++
            ) {
              injected[_key] = arguments[_key]
            }

            var isAsyncModuleCallback =
              is.AsyncFunction(module._callback) || is.Promise(module._callback)
            var isAsyncInitCallback =
              is.AsyncFunction(initCallback) || is.Promise(initCallback)
            var isAsync =
              is.AsyncFunction(module.prototype.initialize) ||
              is.Promise(module.prototype.initialize)
            var result = void 0
            if (isAsyncModuleCallback) {
              await module._callback.apply(
                module,
                toConsumableArray(
                  _this._filter(injected, dependence, beforeDependencies),
                ),
              )
            } else {
              module._callback &&
                module._callback.apply(
                  module,
                  toConsumableArray(
                    _this._filter(injected, dependence, beforeDependencies),
                  ),
                )
            }
            if (isAsync) {
              result = await new Promise(function(initCallback) {
                return new module({ initCallback: initCallback })
              })
            } else {
              result = new module()
            }
            _this.injector(result, dependence, injected)
            if (isAsyncInitCallback) {
              await initCallback.apply(
                undefined,
                toConsumableArray(
                  _this._filter(injected, dependence, dependencies),
                ).concat([result]),
              )
            } else {
              initCallback &&
                initCallback.apply(
                  undefined,
                  toConsumableArray(
                    _this._filter(injected, dependence, dependencies),
                  ).concat([result]),
                )
            }
            return result
          }
          this._modules.push({
            moduleName: moduleName,
            dependence: dependence,
            initialize: initialize,
          })
          this._module[moduleName] = module
          return this
        },
      },
      {
        key: "injector",
        value: function injector(result, dependence, injected) {
          dependence.map(function(item, index) {
            result["_" + item.toLocaleLowerCase()] = injected[index]
          })
        },
      },
      {
        key: "bootstrap",
        value: async function bootstrap() {
          var _this2 = this

          var initializeList = []
          this._queue(this._modules, initializeList)
          for (var i = 0; i < initializeList.length; i++) {
            for (var j = 0; j < this._modules.length; j++) {
              var moduleName = initializeList[i]
              var module = this._modules[j]
              var isCurrentModule = module.moduleName === moduleName
              var dependenceModules = module.dependence.map(function(item) {
                return _this2[item]
              })
              if (isCurrentModule) {
                var isAsync =
                  is.AsyncFunction(module.initialize) ||
                  is.Promise(module.initialize)
                if (isAsync) {
                  this[moduleName] = await module.initialize.apply(
                    module,
                    toConsumableArray(dependenceModules),
                  )
                } else {
                  this[moduleName] = module.initialize.apply(
                    module,
                    toConsumableArray(dependenceModules),
                  )
                }
              }
            }
          }
          return this
        },
      },
    ])
    return DI
  })()

  // import { log } from '../lib/decorator'

  var Module = (function() {
    function Module() {
      classCallCheck(this, Module)

      this.initialize.apply(this, arguments)
    }

    createClass(Module, [
      {
        key: "initialize",
        value: function initialize() {
          var _ref =
              arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : {},
            _ref$initCallBack = _ref.initCallBack,
            initCallBack =
              _ref$initCallBack === undefined
                ? function() {}
                : _ref$initCallBack

          var callback = initCallBack || this._initCallBack
          if (typeof initCallBack !== "function") {
            throw new Error('"initCallBack" must be a function')
          }
          return callback(this)
        },
      },
      {
        key: "_initCallBack",
        value: function _initCallBack() {
          return this
        },
      },
    ])
    return Module
  })()

  var depend = function depend() {
    var dependencies =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
    var callback = arguments[1]
    return function(target) {
      target._dependencies = dependencies
      target._callback = callback
    }
  }

  var index = {
    DI: DI,
    Module: Module,
    depend: depend,
  }

  exports["default"] = index
  exports.DI = DI
  exports.Module = Module
  exports.depend = depend

  Object.defineProperty(exports, "__esModule", { value: true })
})
/* follow glaive on Github! git+https://github.com/unadlib/glaive.git */
//# sourceMappingURL=glaive.js.map
