import is from "../lib/isType"

export default class Injector {
  constructor({ config, callback } = {}) {
    const { infuse } = config
    if (is.Function(infuse)) {
      ;this::infuse(config)
    }
    this._callback = callback
    this._modules = []
    this._module = {}
    this.bootstrap().then(this::this._complete)
  }

  _complete() {
    this._callback && this._callback(this)
    this.initiated = true
    return this
  }

  _queue(modules, list) {
    let restModules = []
    modules.map(({ moduleName, dependence = [] }) => {
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

  _filter(injected, dependence, injectedDependencies) {
    return dependence
      .map((item, index) => ({
        moduleName: item,
        module: injected[index],
      }))
      .filter(({ moduleName }) => injectedDependencies.includes(moduleName))
      .map(({ module }) => module)
  }

  // initialize() {
  //   throw new Error(
  //     `Please set initialization Dependency Injection configuration.`,
  //   )
  // }

  inject(module, dependencies = [], initCallback) {
    const moduleName = module.name
    const beforeDependencies = module._dependencies || []
    const dependence = [...new Set(beforeDependencies.concat(dependencies))]
    const initialize = async (...injected) => {
      const isAsyncModuleCallback =
        is.AsyncFunction(module._callback) || is.Promise(module._callback)
      const isAsyncInitCallback =
        is.AsyncFunction(initCallback) || is.Promise(initCallback)
      const isAsync =
        is.AsyncFunction(module.prototype.initialize) ||
        is.Promise(module.prototype.initialize)
      let result
      if (isAsyncModuleCallback) {
        await module._callback(
          ...this._filter(injected, dependence, beforeDependencies),
        )
      } else {
        module._callback &&
          module._callback(
            ...this._filter(injected, dependence, beforeDependencies),
          )
      }
      if (isAsync) {
        result = await new Promise(initCallback => new module({ initCallback }))
      } else {
        result = new module()
      }
      this.distribute(result, dependence, injected)
      if (isAsyncInitCallback) {
        await initCallback(
          ...this._filter(injected, dependence, dependencies),
          result,
        )
      } else {
        initCallback &&
          initCallback(
            ...this._filter(injected, dependence, dependencies),
            result,
          )
      }
      return result
    }
    this._modules.push({
      moduleName,
      dependence,
      initialize,
    })
    this._module[moduleName] = module
    return this
  }

  distribute(result, dependence, injected) {
    dependence.map((item, index) => {
      result[`_${item.toLocaleLowerCase()}`] = injected[index]
    })
  }

  async bootstrap() {
    let initializeList = []
    this._queue(this._modules, initializeList)
    for (let i = 0; i < initializeList.length; i++) {
      for (let j = 0; j < this._modules.length; j++) {
        const moduleName = initializeList[i]
        const module = this._modules[j]
        const isCurrentModule = module.moduleName === moduleName
        const dependenceModules = module.dependence.map(item => this[item])
        if (isCurrentModule) {
          const isAsync =
            is.AsyncFunction(module.initialize) || is.Promise(module.initialize)
          if (isAsync) {
            this[moduleName] = await module.initialize(...dependenceModules)
          } else {
            this[moduleName] = module.initialize(...dependenceModules)
          }
        }
      }
    }
    return this
  }
}
