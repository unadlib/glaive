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
          var type = Object.prototype.toString.call(value).slice(8, -1)
          return type[0].toLowerCase() + type.slice(1) === name
        }
      },
    },
  )

  var sleep = async function(time) {
    return await new Promise(function(resolve) {
      if (!time) {
        resolve(true)
      } else {
        setTimeout(function() {
          return resolve(true)
        }, time)
      }
    })
  }

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

  var slicedToArray = (function() {
    function sliceIterator(arr, i) {
      var _arr = []
      var _n = true
      var _d = false
      var _e = undefined

      try {
        for (
          var _i = arr[Symbol.iterator](), _s;
          !(_n = (_s = _i.next()).done);
          _n = true
        ) {
          _arr.push(_s.value)

          if (i && _arr.length === i) break
        }
      } catch (err) {
        _d = true
        _e = err
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]()
        } finally {
          if (_d) throw _e
        }
      }

      return _arr
    }

    return function(arr, i) {
      if (Array.isArray(arr)) {
        return arr
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i)
      } else {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance",
        )
      }
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

  var prefix = "_"
  var allot = function() {
    var _this = this

    var config =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}

    Object.entries(config)
      .filter(function(_ref) {
        var _ref2 = slicedToArray(_ref, 1),
          key = _ref2[0]

        return key !== "allotParams" && key !== "complete"
      })
      .map(function(_ref3) {
        var _ref4 = slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1]

        _this["" + prefix + key] = value
      })
    return this
  }

  var Injector = (function() {
    function Injector() {
      var config =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
      classCallCheck(this, Injector)
      var _config$allotParams = config.allotParams,
        allotParams =
          _config$allotParams === undefined
            ? this._allotParams
            : _config$allotParams

      if (is.Function(allotParams)) {
        allotParams.call(this, config)
      } else {
        throw new Error("'allotParams' must be a function.")
      }
      this._modules = new Map()
      this._queueModules = new Set()
      this._bootstrap(config).then(this._complete.bind(this))
    }

    createClass(Injector, [
      {
        key: "_allotParams",
        value: function _allotParams(config) {
          return allot.call(this, config)
        },
      },
      {
        key: "_complete",
        value: function _complete(_ref) {
          var done = _ref.done

          this.initiated = true
          is.function(done) && done(this.initiated)
        },
      },
      {
        key: "_merge",
        value: function _merge(modules) {
          var dependenceMap = []
          modules.forEach(function() {
            var _ref2 =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {},
              injectors = _ref2.injectors

            var moduleName = arguments[1]

            var dependence = injectors.reduce(function(pre, _ref3) {
              var _ref3$deps = _ref3.deps,
                deps = _ref3$deps === undefined ? [] : _ref3$deps

              return [].concat(toConsumableArray(new Set(pre.concat(deps))))
            }, [])
            dependenceMap.push({
              moduleName: moduleName,
              dependence: dependence,
            })
          })
          return dependenceMap
        },
      },
      {
        key: "_queue",
        value: function _queue() {
          var modules =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : []
          var list = arguments[1]

          var restModules = []
          modules.map(function() {
            var _ref4 =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {},
              moduleName = _ref4.moduleName,
              _ref4$dependence = _ref4.dependence,
              dependence =
                _ref4$dependence === undefined ? [] : _ref4$dependence

            var isNoneDependence = dependence.length === 0
            var rest = []
              .concat(
                toConsumableArray(
                  new Set(
                    dependence.concat([].concat(toConsumableArray(list))),
                  ),
                ),
              )
              .filter(function(item) {
                return ![].concat(toConsumableArray(list)).includes(item)
              })
            var isDepended = rest.length === 0
            if (isNoneDependence || isDepended) {
              list.add(moduleName)
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
        key: "_initialize",
        value: function _initialize() {
          var _this = this

          var dependenceMap = this._merge(this._modules)
          this._queue(dependenceMap, this._queueModules)
          this._queueModules.forEach(function(moduleName) {
            var _modules$get = _this._modules.get(moduleName),
              Module = _modules$get.Module,
              parameters = _modules$get.parameters

            _this[moduleName] = new Module(parameters)
          })
          this.distribute.call(this, dependenceMap)
          return this
        },
      },
      {
        key: "_bootstrap",
        value: async function _bootstrap(config) {
          var _this2 = this

          await sleep()
          try {
            var queueModules = [].concat(toConsumableArray(this._queueModules))
            while (queueModules.length > 0) {
              var moduleName = queueModules.shift()
              var current = this._modules.get(moduleName)
              var isAsync = is.asyncFunction(this[moduleName].initialize)
              var injectors = [].concat(toConsumableArray(current.injectors))
              var beforeInjectors = injectors.filter(function(_ref5) {
                var before = _ref5.before
                return before
              })
              while (beforeInjectors.length > 0) {
                var unprocessed = void 0

                var _beforeInjectors$shif = beforeInjectors.shift(),
                  before = _beforeInjectors$shif.before,
                  deps = _beforeInjectors$shif.deps

                var isAsyncAction = is.asyncFunction(before)
                var args = deps.map(function(dep) {
                  return _this2[dep]
                })
                if (isAsyncAction) {
                  unprocessed = await before.apply(
                    undefined,
                    toConsumableArray(args).concat([this[moduleName]]),
                  )
                } else {
                  unprocessed = before.apply(
                    undefined,
                    toConsumableArray(args).concat([this[moduleName]]),
                  )
                }
              }
              if (isAsync) {
                await this[moduleName].initialize()
              } else {
                if (is.Function(this[moduleName].initialize)) {
                  this[moduleName].initialize()
                }
              }
              var afterInjectors = injectors.filter(function(_ref6) {
                var after = _ref6.after
                return after
              })
              while (afterInjectors.length > 0) {
                var processed = void 0

                var _afterInjectors$shift = afterInjectors.shift(),
                  after = _afterInjectors$shift.after,
                  deps = _afterInjectors$shift.deps

                var _isAsyncAction = is.asyncFunction(after)
                var _args = deps.map(function(dep) {
                  return _this2[dep]
                })
                if (_isAsyncAction) {
                  processed = await after.apply(
                    undefined,
                    toConsumableArray(_args).concat([this[moduleName]]),
                  )
                } else {
                  processed = after.apply(
                    undefined,
                    toConsumableArray(_args).concat([this[moduleName]]),
                  )
                }
              }
            }
          } catch (e) {
            throw new Error("Injector failed to boot up. ")
          }
          return config
        },
      },
      {
        key: "inject",
        value: function inject(models) {
          var _this3 = this

          models.map(function() {
            var _ref7 =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {},
              module = _ref7.module,
              _ref7$deps = _ref7.deps,
              deps = _ref7$deps === undefined ? [] : _ref7$deps,
              _ref7$params = _ref7.params,
              params = _ref7$params === undefined ? {} : _ref7$params,
              before = _ref7.before,
              after = _ref7.after

            var name = module.name,
              _module$_injectors = module._injectors,
              _injectors =
                _module$_injectors === undefined ? [] : _module$_injectors

            var _ref8 = _this3._modules.get(name) || {},
              _ref8$parameters = _ref8.parameters,
              parameters =
                _ref8$parameters === undefined ? params : _ref8$parameters,
              _ref8$injectors = _ref8.injectors,
              injectors =
                _ref8$injectors === undefined ? _injectors : _ref8$injectors

            _this3._modules.set(name, {
              Module: module,
              parameters: Object.assign(parameters, params),
              injectors: [].concat(toConsumableArray(injectors), [
                { deps: deps, before: before, after: after },
              ]),
            })
          })
          this._initialize()
          return this
        },
      },
      {
        key: "distribute",
        value: function distribute(dependenceMap) {
          var _this4 = this

          dependenceMap.map(function(_ref9) {
            var moduleName = _ref9.moduleName,
              dependence = _ref9.dependence

            dependence.map(function(name) {
              _this4[moduleName]["" + prefix + name] = _this4[moduleName]
            })
          })
          return this
        },
      },
    ])
    return Injector
  })()

  var Module = (function() {
    function Module(args) {
      classCallCheck(this, Module)

      var isFunction = is.function(this._allotParams)
      if (isFunction) {
        this._allotParams(args)
      } else {
        throw new Error('"_allotParams" must be a function')
      }
    }

    createClass(Module, [
      {
        key: "_allotParams",
        value: function _allotParams(config) {
          return allot.call(this, config)
        },
      },
    ])
    return Module
  })()

  var Decorator = function() {
    var dependencies =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    return function(target) {
      target._injectors = [].concat(
        toConsumableArray(target._injectors || []),
        [dependencies],
      )
    }
  }

  // export const prefix = '$$'
  // export const allot = (target, key, descriptor) => {
  //   const method = descriptor.value
  //   const allotParams = function(config = {}) {
  //     Object.entries(config)
  //       .filter(([key]) => key !== 'allotParams' && key !== 'complete')
  //       .map(([key, value]) => {
  //         console.log(key)
  //         this[`${prefix}${key}`] = value
  //       })
  //   }
  //   descriptor.value = (...args) => {
  //     const [config] = args
  //     return target::allotParams(config)
  //   }
  //   return descriptor
  // }

  var index = {
    Injector: Injector,
    Module: Module,
    Decorator: Decorator,
  }

  exports["default"] = index
  exports.Injector = Injector
  exports.Module = Module
  exports.Decorator = Decorator

  Object.defineProperty(exports, "__esModule", { value: true })
})
/* follow glaive on Github! git+https://github.com/unadlib/glaive.git */
//# sourceMappingURL=glaive.js.map
