export default class DI {
  constructor (config) {
    this._config = config
    this._modules = []
    this.initialize()
    this.bootstrap().then()
  }

  _queue (modules, list) {
    let restModules = []
    modules.map(({moduleName, dependence = []}) => {
      const isNoneDependence = dependence.length === 0
      const rest = [...new Set(dependence.concat(list))].filter(item => !list.includes(item))
      const isDepended = rest.length === 0
      if (isNoneDependence || isDepended) {
        list.push(moduleName)
      } else {
        restModules.push({moduleName, dependence})
      }
    })
    if (restModules.length > 0) {
      this._queue(restModules, list)
    }
  }

  initialize () {
    throw new Error(`Please set initialization Dependency Injection configuration.`)
  }

  inject (moduleName, dependence, initialize) {
    this._modules.push({
      moduleName,
      dependence,
      initialize
    })
    return this
  }

  async bootstrap () {
    let initializeList = []
    this._queue(this._modules, initializeList)
    for (let i = 0; i < initializeList.length; i++) {
      for (let j = 0; j < this._modules.length; j++) {
        const moduleName = initializeList[i]
        const module = this._modules[j]
        const isCurrentModule = module.moduleName === moduleName
        const dependenceModules = module.dependence.map(item => this[item])
        if (isCurrentModule) {
          const isAsync = Object.prototype.toString.call(module.initialize) === '[object AsyncFunction]'
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