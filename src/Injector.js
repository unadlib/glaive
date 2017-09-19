import is from "../lib/isType"
import sleep from "../lib/sleep"
import allot, { prefix } from "../lib/allot"

export default class Injector {
  constructor(config = {}) {
    const { allotParams = this._allotParams } = config
    if (is.Function(allotParams)) {
      ;this::allotParams(config)
    } else {
      throw new Error(`\'allotParams\' must be a function.`)
    }
    this._modules = new Map()
    this._queueModules = new Set()
    this._bootstrap(config).then(this::this._complete)
  }

  _allotParams(config) {
    return this::allot(config)
  }

  _complete({ done }) {
    this.initiated = true
    is.Function(done) && done(this.initiated)
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

  _queue(modules = [], list) {
    let restModules = []
    modules.map(({ moduleName, dependence = [] } = {}) => {
      const isNoneDependence = dependence.length === 0
      const rest = [...new Set(dependence.concat([...list]))].filter(
        item => ![...list].includes(item),
      )
      const isDepended = rest.length === 0
      if (isNoneDependence || isDepended) {
        list.add(moduleName)
      } else {
        restModules.push({ moduleName, dependence })
      }
    })
    if (restModules.length > 0) {
      this._queue(restModules, list)
    }
  }

  _initialize() {
    const dependenceMap = this._merge(this._modules)
    this._queue(dependenceMap, this._queueModules)
    this._queueModules.forEach(moduleName => {
      const { Module, parameters } = this._modules.get(moduleName)

      this[moduleName] = new Module(parameters)
    })
    ;this::this.distribute(dependenceMap)
    return this
  }

  async _bootstrap(config) {
    await sleep()
    try {
      let queueModules = [...this._queueModules]
      while (queueModules.length > 0) {
        const moduleName = queueModules.shift()
        const current = this._modules.get(moduleName)
        const isAsync = is.AsyncFunction(this[moduleName].initialize)
        const injectors = [...current.injectors]
        let beforeInjectors = injectors.filter(({ before }) => before)
        while (beforeInjectors.length > 0) {
          let unprocessed
          const { before, deps } = beforeInjectors.shift()
          const isAsyncAction = is.AsyncFunction(before)
          const args = deps.map(dep => this[dep])
          if (isAsyncAction) {
            unprocessed = await before(...args, this[moduleName])
          } else {
            unprocessed = before(...args, this[moduleName])
          }
        }
        if (isAsync) {
          await this[moduleName].initialize()
        } else {
          if (is.Function(this[moduleName].initialize)) {
            this[moduleName].initialize()
          }
        }
        let afterInjectors = injectors.filter(({ after }) => after)
        while (afterInjectors.length > 0) {
          let processed
          const { after, deps } = afterInjectors.shift()
          const isAsyncAction = is.AsyncFunction(after)
          const args = deps.map(dep => this[dep])
          if (isAsyncAction) {
            processed = await after(...args, this[moduleName])
          } else {
            processed = after(...args, this[moduleName])
          }
        }
      }
    } catch (e) {
      throw new Error(`Injector failed to boot up. `)
    }
    return config
  }

  inject(models) {
    models.map(({ module, deps = [], params = {}, before, after } = {}) => {
      const { name, _injectors = [] } = module
      const { parameters = params, injectors = _injectors } =
        this._modules.get(name) || {}
      this._modules.set(name, {
        Module: module,
        parameters: Object.assign(parameters, params),
        injectors: [...injectors, { deps, before, after }],
      })
    })
    this._initialize()
    return this
  }

  distribute(dependenceMap) {
    dependenceMap.map(({ moduleName, dependence }) => {
      dependence.map(name => {
        this[moduleName][`${prefix}${name}`] = this[moduleName]
      })
    })
    return this
  }
}
