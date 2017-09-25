/* glaive version 1.3.1 */
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

  var inherits = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError(
        "Super expression must either be null or a function, not " +
          typeof superClass,
      )
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    })
    if (superClass)
      Object.setPrototypeOf
        ? Object.setPrototypeOf(subClass, superClass)
        : (subClass.__proto__ = superClass)
  }

  var possibleConstructorReturn = function(self, call) {
    if (!self) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      )
    }

    return call && (typeof call === "object" || typeof call === "function")
      ? call
      : self
  }

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

  var ERROR = {
    allotParams: "'allotParams' must be a function",
    boot: "`Injector failed to boot up `",
    module: "'module' must be a function or class",
  }

  var error = new Proxy(
    {},
    {
      get: function get(target, name) {
        return function(value) {
          return ERROR[name] || value + " Error"
        }
      },
    },
  )

  var error$1 = new Proxy(
    {},
    {
      get: function get(target, name) {
        return function(value) {
          throw new Error(error[name](value))
        }
      },
    },
  )

  var moduleStatus = new Proxy(
    {},
    {
      get: function get(target, name) {
        return new Map(
          ["initial", "initialized", "booting", "ready"].map(function(i) {
            return [i, i]
          }),
        ).get(name)
      },
    },
  )

  var Injector = function() {
    var TargetModule =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : (function() {
            function _class() {
              classCallCheck(this, _class)
            }

            return _class
          })()

    return (function(_TargetModule) {
      inherits(Injector, _TargetModule)

      function Injector() {
        var config =
          arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
        classCallCheck(this, Injector)

        var _this = possibleConstructorReturn(
          this,
          (Injector.__proto__ || Object.getPrototypeOf(Injector)).call(
            this,
            config,
          ),
        )

        var _config$allotParams = config.allotParams,
          allotParams =
            _config$allotParams === undefined
              ? _this._allotParams
              : _config$allotParams

        if (is.function(allotParams)) {
          allotParams.call(_this, config)
        } else {
          error$1.allotParams()
        }
        _this._modules = new Map()
        _this._queueModules = new Set()
        _this._loadModulesHistory = new Set()
        _this._bootstrap(config).then(_this._complete.bind(_this))
        return _this
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
            return is.function(done) && done(this.initiated)
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
            modules.forEach(function() {
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
          value: function _initialize(preDistribute) {
            var _this2 = this

            var dependenceMap = this._merge(this._modules)
            this._queue(dependenceMap, this._queueModules)
            this._queueModules.forEach(function(moduleName) {
              var _modules$get = _this2._modules.get(moduleName),
                Module = _modules$get.Module,
                parameters = _modules$get.parameters,
                moduleKey = _modules$get.moduleKey,
                injectors = _modules$get.injectors

              if (preDistribute) {
                var dependencies = new Set(
                  injectors.reduce(function(prev, _ref5) {
                    var _ref5$deps = _ref5.deps,
                      deps = _ref5$deps === undefined ? [] : _ref5$deps

                    return [].concat(
                      toConsumableArray(prev),
                      toConsumableArray(deps),
                    )
                  }, []),
                )
                var dependenceModules = {}
                dependencies.forEach(function(name) {
                  var _modules$get2 = _this2._modules.get(name),
                    moduleKey = _modules$get2.moduleKey

                  dependenceModules[moduleKey] = _this2[moduleKey]
                })
                Object.assign(parameters, dependenceModules)
              }
              _this2[moduleKey] = new Module(parameters)
              _this2.mountParams(moduleKey)
              _this2[moduleKey].__status = moduleStatus.initialized
            })
            this.distribute.call(this, dependenceMap)
            return this
          },
        },
        {
          key: "_insureUnique",
          value: function _insureUnique() {
            var _this3 = this

            var overloadModules = []
              .concat(toConsumableArray(this._loadModulesHistory))
              .slice(0, -1)
            overloadModules.forEach(function() {
              var modules =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : []
              return modules.forEach(function(_ref6) {
                var key = _ref6.key,
                  module = _ref6.module

                var isRemove =
                  _this3._modules.get(module.prototype.constructor.name)
                    .moduleKey !== key
                if (!is.null(key) && !is.undefined(key) && isRemove) {
                  Reflect.deleteProperty(_this3, key)
                }
              })
            })
          },
        },
        {
          key: "mountParams",
          value: function mountParams() {
            return this
          },
        },
        {
          key: "inject",
          value: function inject(modules) {
            var _this4 = this

            var _ref7 =
                arguments.length > 1 && arguments[1] !== undefined
                  ? arguments[1]
                  : {},
              preInject = _ref7.preInject,
              preDistribute = _ref7.preDistribute

            preInject && preInject.call(this)
            modules.forEach(function() {
              var _ref8 =
                  arguments.length > 0 && arguments[0] !== undefined
                    ? arguments[0]
                    : {},
                module = _ref8.module,
                _ref8$deps = _ref8.deps,
                deps = _ref8$deps === undefined ? [] : _ref8$deps,
                _ref8$params = _ref8.params,
                params = _ref8$params === undefined ? {} : _ref8$params,
                key = _ref8.key,
                before = _ref8.before,
                after = _ref8.after

              if (!is.function(module)) {
                return error$1.module()
              }
              var moduleName = module.prototype.constructor.name

              var _module$_key = module._key,
                _key = _module$_key === undefined ? moduleName : _module$_key,
                _module$_injectors = module._injectors,
                _injectors =
                  _module$_injectors === undefined ? [] : _module$_injectors

              var moduleKey = key || _key
              var originModule = _this4._modules.get(moduleName)

              var _ref9 = originModule || {},
                _ref9$parameters = _ref9.parameters,
                parameters =
                  _ref9$parameters === undefined ? params : _ref9$parameters,
                _ref9$injectors = _ref9.injectors,
                injectors =
                  _ref9$injectors === undefined ? _injectors : _ref9$injectors

              var override = {}
              if (originModule) {
                override = {
                  parameters: params,
                  injectors: [].concat(toConsumableArray(_injectors), [
                    { deps: deps, before: before, after: after },
                  ]),
                }
              }
              _this4._modules.set(
                moduleName,
                Object.assign(
                  {
                    Module: module,
                    moduleKey: moduleKey[0].toLowerCase() + moduleKey.slice(1),
                    parameters: Object.assign(parameters, params),
                    injectors: [].concat(toConsumableArray(injectors), [
                      { deps: deps, before: before, after: after },
                    ]),
                  },
                  override,
                ),
              )
            })
            this._loadModulesHistory.add(modules)
            this._initialize(preDistribute)
            return this
          },
        },
        {
          key: "distribute",
          value: function distribute(dependenceMap) {
            var _this5 = this

            dependenceMap.forEach(function(_ref10) {
              var moduleName = _ref10.moduleName,
                dependence = _ref10.dependence

              dependence.forEach(function(name) {
                var _modules$get3 = _this5._modules.get(moduleName),
                  moduleKey = _modules$get3.moduleKey

                var module = _this5._modules.get(name)
                _this5[moduleKey]["" + prefix + module.moduleKey] =
                  _this5[module.moduleKey]
              })
            })
            return this
          },
        },
        {
          key: "_bootstrap",
          value: async function _bootstrap(config) {
            var _this6 = this

            await sleep()
            this._insureUnique()
            try {
              var queueModules = [].concat(
                toConsumableArray(this._queueModules),
              )
              while (queueModules.length > 0) {
                var moduleName = queueModules.shift()

                var _modules$get4 = this._modules.get(moduleName),
                  injectors = _modules$get4.injectors,
                  moduleKey = _modules$get4.moduleKey

                if (!this[moduleKey]) {
                  error$1.throw(moduleKey)
                  continue
                }
                var isAsync = is.asyncFunction(this[moduleKey].initialize)
                var _injectors = [].concat(toConsumableArray(injectors))
                this[moduleKey].__status = moduleStatus.booting
                var beforeInjectors = _injectors.filter(function(_ref11) {
                  var before = _ref11.before
                  return before
                })
                while (beforeInjectors.length > 0) {
                  var unprocessed = void 0

                  var _beforeInjectors$shif = beforeInjectors.shift(),
                    before = _beforeInjectors$shif.before,
                    deps = _beforeInjectors$shif.deps

                  var isAsyncAction = is.asyncFunction(before)
                  var args = deps.map(function(dep) {
                    return _this6[_this6._modules.get(dep).moduleKey]
                  })
                  if (isAsyncAction) {
                    unprocessed = await before.apply(
                      undefined,
                      toConsumableArray(args).concat([this[moduleKey]]),
                    )
                  } else {
                    unprocessed = before.apply(
                      undefined,
                      toConsumableArray(args).concat([this[moduleKey]]),
                    )
                  }
                }
                if (isAsync) {
                  await this[moduleKey].initialize()
                } else {
                  if (is.function(this[moduleKey].initialize)) {
                    this[moduleKey].initialize()
                  }
                }
                var afterInjectors = _injectors.filter(function(_ref12) {
                  var after = _ref12.after
                  return after
                })
                while (afterInjectors.length > 0) {
                  var processed = void 0

                  var _afterInjectors$shift = afterInjectors.shift(),
                    after = _afterInjectors$shift.after,
                    deps = _afterInjectors$shift.deps

                  var _isAsyncAction = is.asyncFunction(after)
                  var _args = deps.map(function(dep) {
                    return _this6[_this6._modules.get(dep).moduleKey]
                  })
                  if (_isAsyncAction) {
                    processed = await after.apply(
                      undefined,
                      toConsumableArray(_args).concat([this[moduleKey]]),
                    )
                  } else {
                    processed = after.apply(
                      undefined,
                      toConsumableArray(_args).concat([this[moduleKey]]),
                    )
                  }
                }
                this[moduleKey].__status = moduleStatus.ready
              }
            } catch (e) {
              console.log(e)
              error$1.boot()
            }
            return config
          },
        },
      ])
      return Injector
    })(TargetModule)
  }

  var Module = (function() {
    function Module(args) {
      classCallCheck(this, Module)

      var isFunction = is.function(this._allotParams)
      if (isFunction) {
        this._allotParams(args)
      } else {
        error$1.allotParams()
      }
      this.__status = moduleStatus.initial
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
      if (dependencies.key) {
        target._key = dependencies.key
      }
    }
  }

  // export const prefix = '$$'
  // export const allot = (target, key, descriptor) => {
  //   const method = descriptor.value
  //   const allotParams = function(config = {}) {
  //     Object.entries(config)
  //       .filter(([key]) => key !== 'allotParams' && key !== 'complete')
  //       .map(([key, value]) => {
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
