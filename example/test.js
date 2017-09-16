import { DI, Module } from "../src/index"
import is from "../lib/isType"

// const testModules = [{
//   moduleName: 'a',
//   dependence: ['c', 'd'],
// }, {
//   moduleName: 'b',
//   dependence: ['d'],
// }, {
//   moduleName: 'c',
//   dependence: [],
// }, {
//   moduleName: 'd',
//   dependence: ['e'],
// }, {
//   moduleName: 'e',
//   dependence: ['c'],
// }]
// const list = []
// Reflect.apply(DI.prototype._queue, DI.prototype, [testModules, list])
// console.log(list)

class A extends Module {
  constructor(...args) {
    super(...args)
    this.a = 1
  }
}

class B extends Module {
  constructor(...args) {
    super(...args)
    this.b = 1
  }

  async initialize({ initCallback } = {}) {
    return setTimeout(() => initCallback(this), 0)
  }
}

class TestModel extends DI {
  constructor(...config) {
    super(...config)
  }

  initialize() {
    this.inject(A).inject(B, ["A"], async () => {
      await new Promise(function(resolve) {
        setTimeout(function() {
          resolve()
        }, 0)
      })
    })
  }
}

const r = new TestModel()
setTimeout(() => {
  console.log(r)
}, 1000)
