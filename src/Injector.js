import is from "../lib/isType"

export default class Injector {
  constructor(config = {}) {
    const { setParams = this._setParams } = config
    if (is.Function(setParams)) {
      ;this::setParams(config)
    } else {
      throw new Error(`\'setParams\' must be a function.`)
    }
    this._complete = config.complete
    this._modules = new Map()
    this.initialize()
    this._initiate()
    this._bootstrap().then(this::this._complete)
  }

  _setParams(config) {
    Object.entries(config)
      .filter(([key]) => key !== "setParams" || key !== "complete")
      .map(([key, value]) => {
        this[`_${key}`] = value
      })
  }

  _complete() {
    this.initiated = true
    return this
  }

  _merge(modules) {
    let dependenceMap = []
    modules.forEach(({ injectors } = {}, moduleName) => {
      const dependence = injectors.reduce((pre, { deps = [] }) => {
        return [...new Set(pre.concat(deps))]
      }, [])
      dependenceMap.push({
        moduleName,
        dependence,
      })
    })
    return dependenceMap
  }

  _queue(modules = [], list = []) {
    let restModules = []
    console.log(modules, 99999)
    modules.map(({ moduleName, dependence = [] } = {}) => {
      const isNoneDependence = dependence.length === 0
      const rest = [...new Set(dependence.concat(list))].filter(
        item => !list.includes(item),
      )
      const isDepended = rest.length === 0
      if (isNoneDependence || isDepended) {
        list.push(moduleName)
      } else {
        restModules.push({ moduleName, dependence })
      }
    })
    if (restModules.length > 0) {
      this._queue(restModules, list)
    }
  }

  // _filter(injected, dependence, injectedDependencies) {
  //   return dependence
  //     .map((item, index) => ({
  //       moduleName: item,
  //       module: injected[index],
  //     }))
  //     .filter(({moduleName}) => injectedDependencies.includes(moduleName))
  //     .map(({module}) => module)
  // }

  _initiate() {
    let initializeList = []
    const dependenceMap = this._merge(this._modules)
    this._queue(dependenceMap, initializeList)
    initializeList.forEach(moduleName => {
      const { Module, parameters } = this._modules.get(moduleName)
      this[moduleName] = new Module(parameters)
    })
    ;this::this.distribute(dependenceMap)
    return this
    // for (let i = 0; i < .length; i++) {
    //   const moduleName = initializeList[i]
    // for (let j = 0; j < this._modules.length; j++) {
    //   const moduleName = initializeList[i]
    //   const module = this._modules[j]
    //   const isCurrentModule = module.moduleName === moduleName
    //   const dependenceModules = module.dependence.map(item => this[item])
    //   if (isCurrentModule) {
    //     const isAsync =
    //       is.AsyncFunction(module.initialize) || is.Promise(module.initialize)
    //     if (isAsync) {
    //       this[moduleName] = await module.initialize(...dependenceModules)
    //     } else {
    //       this[moduleName] = module.initialize(...dependenceModules)
    //     }
    //   }
    // }
  }

  async _bootstrap() {
    this._modules.forEach(({}) => {})
  }

  initialize() {
    throw new Error(
      `Please set initialization Dependency Injection configuration.`,
    )
  }

  inject({ module, deps = [], params = {}, before, after } = {}) {
    const { name, _injectors = [] } = module
    const { parameters = params, injectors = _injectors } =
      this._modules.get(name) || {}
    this._modules.set(name, {
      Module: module,
      parameters: Object.assign(parameters, params),
      injectors: [...injectors, { deps, before, after }],
    })
    // const initialize = async (...injected) => {
    //   const isAsyncModuleCallback =
    //     is.AsyncFunction(module._callback) || is.Promise(module._callback)
    //   const isAsyncInitCallback =
    //     is.AsyncFunction(initCallback) || is.Promise(initCallback)
    //   const isAsync =
    //     is.AsyncFunction(module.prototype.initialize) ||
    //     is.Promise(module.prototype.initialize)
    //   let result
    //   if (isAsyncModuleCallback) {
    //     await module._callback(
    //       ...this._filter(injected, dependence, beforeDependencies),
    //     )
    //   } else {
    //     module._callback &&
    //     module._callback(
    //       ...this._filter(injected, dependence, beforeDependencies),
    //     )
    //   }
    //   if (isAsync) {
    //     result = await new Promise(initCallback => new module({initCallback}))
    //   } else {
    //     result = new module()
    //   }
    //   this.distribute(result, dependence, injected)
    //   if (isAsyncInitCallback) {
    //     await initCallback(
    //       ...this._filter(injected, dependence, dependencies),
    //       result,
    //     )
    //   } else {
    //     initCallback &&
    //     initCallback(
    //       ...this._filter(injected, dependence, dependencies),
    //       result,
    //     )
    //   }
    //   return result
    // }
    return this
  }

  distribute(dependenceMap) {
    dependenceMap.map(({ moduleName, dependence }) => {
      dependence.map(name => {
        this[moduleName][`_${name}`] = this[moduleName]
      })
    })
    return this
  }
}

class Module {
  constructor(args) {
    this._setParams(args)
  }

  _setParams(config) {
    Object.entries(config)
      .filter(([key]) => key !== "setParams" || key !== "complete")
      .map(([key, value]) => {
        this[`_${key}`] = value
      })
  }
}
