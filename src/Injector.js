import is from "../lib/isType"
import sleep from "../lib/sleep"
import allot, { prefix } from "../lib/allot"
import error from "../lib/error"
import moduleStatus from "../lib/moduleStatus"

export default (
  TargetModule = class {
    constructor() {}
  },
) => {
  return class Injector extends TargetModule {
    constructor(config = {}) {
      super(config)
      const { allotParams = this._allotParams } = config
      if (is.function(allotParams)) {
        ;this::allotParams(config)
      } else {
        error.allotParams()
      }
      this._modules = new Map()
      this._queueModules = new Set()
      this._loadModulesHistory = new Set()
      this._bootstrap(config).then(this::this._complete)
    }

    _allotParams(config) {
      return this::allot(config)
    }

    _complete({ done }) {
      this.initiated = true
      return is.function(done) && done(this.initiated)
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
        const { Module, parameters, moduleKey, injectors } = this._modules.get(
          moduleName,
        )
        // const dependences = new Set(
        //   injectors.reduce((prev,{deps=[]})=>{
        //     return [...prev,...deps]
        //   },[])
        // )
        // const dependenceModules = {}
        // dependences.forEach((name)=>{
        //   const {moduleKey} = this._modules.get(name)
        //   dependenceModules[moduleKey] = this[moduleKey]
        // })
        // this[moduleKey] = new Module({...parameters,...dependenceModules})
        this[moduleKey] = new Module(parameters)
        this.mountParams(moduleKey)
        this[moduleKey].__status = moduleStatus.initialized
      })
      ;this::this.distribute(dependenceMap)
      return this
    }

    _insureUnique() {
      const overloadModules = [...this._loadModulesHistory].slice(0, -1)
      overloadModules.forEach((modules = []) =>
        modules.forEach(({ key, module }) => {
          const isRemove =
            this._modules.get(module.prototype.constructor.name).moduleKey !==
            key
          if (!is.null(key) && !is.undefined(key) && isRemove) {
            Reflect.deleteProperty(this, key)
          }
        }),
      )
    }

    mountParams() {
      return this
    }

    inject(modules, { preInject } = {}) {
      preInject && this::preInject()
      modules.map(
        ({ module, deps = [], params = {}, key, before, after } = {}) => {
          if (!is.function(module)) {
            return error.module()
          }
          const moduleName = module.prototype.constructor.name
          const { _key = moduleName, _injectors = [] } = module
          const moduleKey = key || _key
          const originModule = this._modules.get(moduleName)
          const { parameters = params, injectors = _injectors } =
            originModule || {}
          let override = {}
          if (originModule) {
            override = {
              parameters: params,
              injectors: [..._injectors, { deps, before, after }],
            }
          }
          this._modules.set(
            moduleName,
            Object.assign(
              {
                Module: module,
                moduleKey: moduleKey[0].toLowerCase() + moduleKey.slice(1),
                parameters: Object.assign(parameters, params),
                injectors: [...injectors, { deps, before, after }],
              },
              override,
            ),
          )
        },
      )
      this._loadModulesHistory.add(modules)
      this._initialize()
      return this
    }

    distribute(dependenceMap) {
      dependenceMap.map(({ moduleName, dependence }) => {
        dependence.map(name => {
          const { moduleKey } = this._modules.get(moduleName)
          const module = this._modules.get(name)
          this[moduleKey][`${prefix}${module.moduleKey}`] = this[
            module.moduleKey
          ]
        })
      })
      return this
    }

    async _bootstrap(config) {
      await sleep()
      this._insureUnique()
      try {
        let queueModules = [...this._queueModules]
        while (queueModules.length > 0) {
          const moduleName = queueModules.shift()
          const { injectors, moduleKey } = this._modules.get(moduleName)
          if (!this[moduleKey]) {
            error.throw(moduleKey)
            continue
          }
          const isAsync = is.asyncFunction(this[moduleKey].initialize)
          const _injectors = [...injectors]
          this[moduleKey].__status = moduleStatus.booting
          let beforeInjectors = _injectors.filter(({ before }) => before)
          while (beforeInjectors.length > 0) {
            let unprocessed
            const { before, deps } = beforeInjectors.shift()
            const isAsyncAction = is.asyncFunction(before)
            const args = deps.map(dep => this[this._modules.get(dep).moduleKey])
            if (isAsyncAction) {
              unprocessed = await before(...args, this[moduleKey])
            } else {
              unprocessed = before(...args, this[moduleKey])
            }
          }
          if (isAsync) {
            await this[moduleKey].initialize()
          } else {
            if (is.function(this[moduleKey].initialize)) {
              this[moduleKey].initialize()
            }
          }
          let afterInjectors = _injectors.filter(({ after }) => after)
          while (afterInjectors.length > 0) {
            let processed
            const { after, deps } = afterInjectors.shift()
            const isAsyncAction = is.asyncFunction(after)
            const args = deps.map(dep => this[this._modules.get(dep).moduleKey])
            if (isAsyncAction) {
              processed = await after(...args, this[moduleKey])
            } else {
              processed = after(...args, this[moduleKey])
            }
          }
          this[moduleKey].__status = moduleStatus.ready
        }
      } catch (e) {
        console.log(e)
        error.boot()
      }
      return config
    }
  }
}
