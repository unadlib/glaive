import is from "../lib/isType"
import sleep from "../lib/sleep"
export default class Injector {
  constructor(config = {}) {
    // console.log(Object.keys(this),0)
    const { setParams = this._setParams } = config
    if (is.Function(setParams)) {
      ;this::setParams(config)
    } else {
      throw new Error(`\'setParams\' must be a function.`)
    }
    this._done = config.complete || status
    this._modules = new Map()
    this._queueModules = new Set()
    // this.initialize()
    // this._initiate()
    this._bootstrap().then(this::this._complete)
  }

  _setParams(config) {
    Object.entries(config)
      .filter(([key]) => key !== "setParams" || key !== "complete")
      .map(([key, value]) => {
        this[`_${key}`] = value
      })
  }

  _complete(callStatus) {
    this.initiated = true
    callStatus(this.initiated)
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

  // _filter(injected, dependence, injectedDependencies) {
  //   return dependence
  //     .map((item, index) => ({
  //       moduleName: item,
  //       module: injected[index],
  //     }))
  //     .filter(({moduleName}) => injectedDependencies.includes(moduleName))
  //     .map(({module}) => module)
  // }

  _initialize() {
    const dependenceMap = this._merge(this._modules)
    this._queue(dependenceMap, this._queueModules)
    // console.log(this._modules,dependenceMap,initializeList)
    this._queueModules.forEach(moduleName => {
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
    await sleep()
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
        this[moduleName].initialize()
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
  }

  // initialize() {
  //   throw new Error(
  //     `Please set \'initialize\' function for Dependency Injection configuration.`,
  //   )
  // }

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

class A extends Module {
  initialize() {
    this._a = 1
    console.log("A")
  }
}
class B extends Module {
  initialize() {
    this._b = 1
    console.log("B")
  }
}
class C extends Module {
  initialize() {
    this._b = 1
    console.log("C")
  }
}

class D extends C {
  async initialize() {
    await sleep(1000)
    this._ds = 1
    console.log("D")
  }
}

class Phone extends Injector {
  constructor(...args) {
    super(...args)
    this.inject([
      {
        module: C,
        deps: ["A", "B"],
        params: {
          testB: 2,
        },
        after: (...args) => {
          console.log(args)
          return {}
        },
        before: (...args) => {
          return {}
        },
      },
      {
        module: A,
        params: {
          testA: 2,
        },
      },
      {
        module: B,
        deps: ["A"],
        params: {
          testB: 2,
        },
      },
    ])
    // console.log(Object.keys(this._modules),1)
  }
}

class Bee extends Phone {
  constructor(...args) {
    super(...args)
    this.inject([
      {
        module: D,
        params: {
          testB: 1,
        },
      },
    ])
  }
}

const a = new Bee()
// console.log(a)
//
// setTimeout(()=>{
//   console.log(a)
// },2000)
