import { expect } from "chai"
import { Injector, Module, Decorator } from "../src/index"
import is from "../lib/isType"
import sleep from "../lib/sleep"

describe("Glaive", () => {
  describe("#Module Test", () => {
    it("new Module Success test", () => {
      expect(
        (() => {
          class Test extends Module {}
          return new Test({ test: 1 })
        })()._test,
      ).to.equal(1)
    })
    it("new Module Error test", () => {
      expect(() => {
        class Test extends Module {}
        Test.prototype._allotParams = false
        new Test()
      }).to.throw('"_allotParams" must be a function')
    })
    it("_allotParams test", () => {
      expect(Module.prototype._allotParams.call({}, { a: 1 })._a).to.equal(1)
    })
  })
  describe("#isType lib Test", () => {
    it("isType authentication type", () => {
      expect(is.array([])).to.true
    })
    it("isType authentication type", () => {
      expect(is.array({})).to.false
    })
  })
  describe("#sleep lib Test", () => {
    it("sleep time is 0", async () => {
      sleep(0).then(arg => {
        expect(arg).to.true
      })
    })
    it("sleep time > 0", async () => {
      sleep(100).then(arg => {
        expect(arg).to.true
      })
    })
  })
  describe("#Decorator Test", () => {
    it("decorator test", () => {
      expect(
        (() => {
          const that = {}
          Decorator({ deps: ["A"] })(that)
          return that._injectors[0].deps
        })(),
      ).to.deep.equal(["A"])
    })
  })
  // describe('#Injector Test', () => {
  //   it('Dependency injection complete', () => {
  //     expect(
  //       (() => {
  //         const that = {}
  //         Reflect.apply(DI.prototype._complete, that, [])
  //         return that.initiated
  //       })(),
  //     ).to.be.true
  //   })
  //   it('Dependency injection queue', () => {
  //     const testModules = [
  //       {
  //         moduleName: 'a',
  //         dependence: ['c', 'd'],
  //       },
  //       {
  //         moduleName: 'b',
  //         dependence: ['d'],
  //       },
  //       {
  //         moduleName: 'c',
  //         dependence: [],
  //       },
  //       {
  //         moduleName: 'd',
  //         dependence: ['e'],
  //       },
  //       {
  //         moduleName: 'e',
  //         dependence: ['c'],
  //       },
  //     ]
  //     const expected = ['c', 'e', 'd', 'a', 'b']
  //     expect(
  //       (() => {
  //         let list = []
  //         Reflect.apply(DI.prototype._queue, DI.prototype, [testModules, list])
  //         return list
  //       })(),
  //     ).to.deep.equal(expected)
  //   })
  //   it('Dependency injection unset `initialize`', () => {
  //     expect(() => new DI()).to.throw(
  //       'Please set initialization Dependency Injection configuration.',
  //     )
  //   })
  //   it('Dependency injection inject', () => {
  //     class A extends Module {}
  //
  //     expect(
  //       (() => {
  //         const that = {_modules: [], _module: {}}
  //         Reflect.apply(DI.prototype.inject, that, [A, ['B']])
  //         return [
  //           that._modules.length,
  //           that._modules[0].moduleName,
  //           that._modules[0].dependence,
  //         ]
  //       })(),
  //     ).to.deep.equal([1, 'A', ['B']])
  //   })
  //   it('Dependency injection bootstrap', () => {
  //     class A extends Module {
  //       constructor(...args) {
  //         super(...args)
  //         this.a = 1
  //       }
  //     }
  //
  //     class B extends Module {
  //       constructor(...args) {
  //         super(...args)
  //         this.b = 1
  //       }
  //
  //       async initialize({initCallback} = {}) {
  //         return setTimeout(() => initCallback(this), 0)
  //       }
  //     }
  //
  //     class TestModel extends DI {
  //       constructor(...config) {
  //         super(...config)
  //       }
  //
  //       initialize() {
  //         this.inject(A).inject(B, ['A'], async () => {
  //           await new Promise(function(resolve) {
  //             setTimeout(function() {
  //               resolve()
  //             }, 0)
  //           })
  //         })
  //       }
  //     }
  //
  //     const r = new TestModel()
  //     setTimeout(() => expect(r.A.a).to.equal(1), 100)
  //   })
  // })
})
